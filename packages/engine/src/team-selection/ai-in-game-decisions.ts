import {
  createLiveMatchSession,
  evaluatePositionSuitability,
  formationSlotCoordinate,
  FORMATIONS,
  getFormation,
  getPlayerRoleProfile,
  roleCurrentAbility,
  scorePlayerForFormationSlot,
  validateLiveMatchCommand,
  type ApplyLiveMatchTeamChangesCommand,
  type CanonicalPlayerRole,
  type CompetitionMatchRules,
  type Formation,
  type LiveMatchSession,
  type LiveMatchPendingDecision,
  type LiveMatchCommandRejectionCode,
  type LiveMatchTeamState,
  type LiveMatchUnavailableReason,
  type MatchEventSide,
  type LateralFocus,
  type Player,
  type PlayerId,
  type PlayerRole,
  type PositionSuitability,
  type TacticMentalityKey,
  type TacticSetup,
} from "@game/domain";
import { deriveRng } from "@game/shared";

import {
  advanceProgressiveMatchMinute,
  applyConfirmedProgressiveTeamChanges,
  applyValidatedLiveMatchCommand,
  createProgressiveMatchSession,
  pauseProgressiveMatchSession,
  resumeProgressiveMatchSession,
  type AppliedLiveMatchCommandFact,
  type AppliedLiveMatchTacticalCommandFact,
  type ProgressiveMatchAvailability,
  type ProgressiveMatchSessionState,
} from "../match-engine/progressive-match-session.ts";
import {
  buildMatchRngKey,
  matchRngKeyParts,
  type MatchContext,
  type MatchTeamContext,
} from "../match-engine/match-context.ts";
import { buildLiveMatchProjection } from "../match-engine/live-match-projection.ts";
import { telemetryFor } from "../match-engine/match-simulation-state.ts";
import type { PlayerMatchRatingRegistration } from "../match-engine/player-match-rating.ts";
import { assignFootballXi, type FootballXiSlotCandidate } from "./football-xi-assignment.ts";

/** Stable football reason behind one opponent decision. */
export type AiInGameDecisionReasonKey =
  | "forced_injury_replacement"
  | "dismissal_reorganization"
  | "low_condition"
  | "poor_performance"
  | "trailing_response"
  | "protecting_lead"
  | "no_legal_substitute"
  | "no_material_change"
  | "command_rejected";

/** Why an outgoing candidate could not become a legal substitution. */
export type AiInGameReplacementFailureKey =
  | "substitution_limit"
  | "no_available_bench"
  | "no_positionally_credible_bench"
  | "quality_floor";

/** Current engine-derived signal used by the policy for one player. */
export interface AiInGamePlayerSignal {
  readonly playerId: PlayerId;
  readonly rating: number;
  readonly condition: number;
}

/**
 * Complete alternative shape supplied by the canonical tactical-board owner.
 *
 * The AI policy deliberately does not invent normalized pitch coordinates.
 * A caller may offer already-built alternatives and the policy will choose a
 * legal one only when the matching football intent is active.
 */
export interface AiInGameFormationOption {
  readonly intent: "chase_match" | "protect_lead" | "recover_after_dismissal";
  readonly team: LiveMatchTeamState;
}

/**
 * Builds one credible, deterministic shape option for each live intent.
 *
 * Only the eleven already on the pitch is reassigned. An option disappears
 * when any slot would require an invalid fit; the live policy then changes only
 * tactic/substitutions instead of forcing malformed football.
 */
export function buildAiInGameFormationOptions(
  team: LiveMatchTeamState,
  players: Readonly<Record<PlayerId, Player>>,
): readonly AiInGameFormationOption[] {
  const currentFormation = getFormation(team.formation);
  const currentGoalkeeperSlot = team.lineup.find(({ role }) => role === "goalkeeper");
  if (currentGoalkeeperSlot === undefined) return [];
  const alternatives = FORMATIONS
    .filter((formation) => formation.key !== currentFormation.key)
    .flatMap((formation) => {
      const candidatesBySlot = formation.slots.map((slot) => team.lineup
        .map(({ playerId }, rank): FootballXiSlotCandidate | undefined => {
          const player = players[playerId];
          if (player === undefined) return undefined;
          const suitability = evaluatePositionSuitability(player.naturalPositions, {
            playerRole: slot.playerRole,
          });
          if (suitability === "invalid") return undefined;
          return {
            playerId,
            score: scorePlayerForFormationSlot({
              naturalPositions: player.naturalPositions,
              slot,
              playerStrength: roleAbilityFor(player, slot.playerRole),
            }),
            rank,
          };
        })
        .filter((candidate): candidate is FootballXiSlotCandidate => candidate !== undefined));
      const assignment = assignFootballXi({ candidatesBySlot });
      if (assignment === undefined) return [];
      const departmentCounts = formationDepartmentCounts(formation);
      return [{
        formation,
        departmentCounts,
        totalScore: assignment.totalScore,
        team: {
          ...team,
          formation: formation.key,
          lineup: formation.slots.map((slot, index) => slot.playerRole === "goalkeeper"
            ? {
                ...currentGoalkeeperSlot,
                playerId: requiredAssignedPlayer(assignment.candidateBySlot[index]),
              }
            : {
                slotId: slot.slotKey,
                playerId: requiredAssignedPlayer(assignment.candidateBySlot[index]),
                role: slot.playerRole,
                ...formationSlotCoordinate(slot.slotKey),
              }),
        },
      }];
    });
  const currentCounts = formationDepartmentCounts(currentFormation);

  return ([
    optionForIntent(alternatives, "chase_match", (row) => row.departmentCounts.attack > currentCounts.attack),
    optionForIntent(alternatives, "protect_lead", (row) => row.departmentCounts.defense > currentCounts.defense),
    optionForIntent(alternatives, "recover_after_dismissal", () => true),
  ] as const).filter((option): option is AiInGameFormationOption => option !== undefined);
}

interface CredibleFormationAlternative {
  readonly formation: Formation;
  readonly departmentCounts: Readonly<{ defense: number; midfield: number; attack: number }>;
  readonly totalScore: number;
  readonly team: LiveMatchTeamState;
}

function formationDepartmentCounts(formation: Formation): CredibleFormationAlternative["departmentCounts"] {
  return {
    defense: formation.slots.filter((slot) => slot.department === "defense").length,
    midfield: formation.slots.filter((slot) => slot.department === "midfield").length,
    attack: formation.slots.filter((slot) => slot.department === "attack").length,
  };
}

function optionForIntent(
  alternatives: readonly CredibleFormationAlternative[],
  intent: AiInGameFormationOption["intent"],
  eligible: (alternative: CredibleFormationAlternative) => boolean,
): AiInGameFormationOption | undefined {
  const selected = alternatives
    .filter(eligible)
    .toSorted((left, right) => {
      const intentComparison = intent === "chase_match"
        ? right.departmentCounts.attack - left.departmentCounts.attack
        : intent === "protect_lead"
          ? right.departmentCounts.defense - left.departmentCounts.defense
          : right.totalScore - left.totalScore;
      return intentComparison
        || right.totalScore - left.totalScore
        || left.formation.key.localeCompare(right.formation.key);
    })[0];
  return selected === undefined ? undefined : { intent, team: selected.team };
}

function requiredAssignedPlayer(candidate: FootballXiSlotCandidate | undefined): PlayerId {
  if (candidate === undefined) throw new Error("Credible formation assignment is incomplete");
  return candidate.playerId;
}

/** One explainable reason emitted by the deterministic policy. */
export interface AiInGameDecisionReason {
  readonly reasonKey: AiInGameDecisionReasonKey;
  readonly minute: number;
  readonly scoreDelta: number;
  readonly playerId?: PlayerId;
  readonly replacementPlayerId?: PlayerId;
  readonly rating?: number;
  readonly condition?: number;
  readonly suitability?: PositionSuitability;
  /** Canonical command rejections retained for deterministic gate diagnostics. */
  readonly rejectionCodes?: readonly LiveMatchCommandRejectionCode[];
  /** Players implicated by the rejected snapshot, when validation can identify them. */
  readonly rejectedPlayerIds?: readonly PlayerId[];
  /** Exact replacement funnel break, present only with `no_legal_substitute`. */
  readonly replacementFailureKey?: AiInGameReplacementFailureKey;
}

/** Inputs required to evaluate one opponent decision boundary. */
export interface SelectAiInGameDecisionInput {
  readonly session: LiveMatchSession;
  readonly side: MatchEventSide;
  readonly rules: CompetitionMatchRules;
  readonly players: Readonly<Record<PlayerId, Player>>;
  readonly playerSignals: readonly AiInGamePlayerSignal[];
}

/** Pure policy result. Absence of a command is an intentional no-change fact. */
export interface AiInGameDecisionSelection {
  readonly command?: ApplyLiveMatchTeamChangesCommand;
  readonly reasons: readonly AiInGameDecisionReason[];
}

/** Result of selecting and applying one opponent command atomically. */
export interface ApplyAiInGameDecisionResult {
  readonly session: LiveMatchSession;
  readonly facts: readonly AppliedLiveMatchCommandFact[];
  readonly selection: AiInGameDecisionSelection;
}

/** One policy evaluation applied at a real progressive-match decision boundary. */
export interface ProgressiveAiInGameDecision {
  readonly selection: AiInGameDecisionSelection;
  readonly facts: readonly AppliedLiveMatchCommandFact[];
}

/** Inputs for connecting the pure AI policy to the canonical minute session. */
export interface ApplyProgressiveAiInGameDecisionsInput {
  /** Engine state immediately after the latest completed minute. */
  readonly state: ProgressiveMatchSessionState;
  /** Detailed tactical teams projected from the same completed minute. */
  readonly session: LiveMatchSession;
  /** Side controlled by this deterministic policy. */
  readonly side: MatchEventSide;
  /** Competition-owned substitution and suspension rules. */
  readonly rules: CompetitionMatchRules;
  /** Players available to the policy for role and ability evaluation. */
  readonly players: Readonly<Record<PlayerId, Player>>;
  /** Current rating and condition facts from the canonical live projection. */
  readonly playerSignals: readonly AiInGamePlayerSignal[];
  /** Rebuilds the engine team context only after a command has been validated. */
  readonly buildMatchTeamContext: (team: LiveMatchTeamState) => MatchTeamContext;
}

/** Result of applying all AI work caused by one completed minute. */
export interface ApplyProgressiveAiInGameDecisionsResult {
  readonly state: ProgressiveMatchSessionState;
  readonly team: LiveMatchTeamState;
  readonly decisions: readonly ProgressiveAiInGameDecision[];
}

/** One completed decision owned by the automatic progressive runner. */
export interface AutomatedProgressiveAiDecision extends ProgressiveAiInGameDecision {
  readonly side: MatchEventSide;
}

/** Input for one full regulation match whose controlled sides are explicit. */
export interface RunAutomatedProgressiveMatchInput {
  readonly context: MatchContext;
  readonly rules: CompetitionMatchRules;
  readonly players: Readonly<Record<PlayerId, Player>>;
  readonly home: LiveMatchTeamState;
  readonly away: LiveMatchTeamState;
  /** Stable caller order; automatic career matches pass home then away. */
  readonly aiControlledSides: readonly MatchEventSide[];
  readonly lateralFocusBySide: Readonly<Record<MatchEventSide, LateralFocus>>;
  /** Rebuilds current engine quality from an accepted live-team command. */
  readonly buildMatchTeamContext: (
    team: LiveMatchTeamState,
    playerCondition: Readonly<Partial<Record<PlayerId, number>>>,
  ) => MatchTeamContext;
}

/** Final facts from the single automated progressive minute loop. */
export interface RunAutomatedProgressiveMatchResult {
  readonly state: ProgressiveMatchSessionState;
  readonly home: LiveMatchTeamState;
  readonly away: LiveMatchTeamState;
  readonly decisions: readonly AutomatedProgressiveAiDecision[];
}

interface OutgoingCandidate {
  readonly playerId: PlayerId;
  readonly slotId: string;
  readonly role: CanonicalPlayerRole;
  readonly reasonKey: Extract<
    AiInGameDecisionReasonKey,
    "forced_injury_replacement" | "low_condition" | "poor_performance" | "trailing_response"
  >;
  readonly priority: number;
  readonly rating: number;
  readonly condition: number;
}

interface IncomingCandidate {
  readonly playerId: PlayerId;
  readonly suitability: PositionSuitability;
  readonly roleAbility: number;
  readonly score: number;
}

type IncomingCandidateSearch =
  | { readonly candidate: IncomingCandidate }
  | { readonly failureKey: AiInGameReplacementFailureKey };

interface TacticalIntent {
  readonly reasonKey: Extract<AiInGameDecisionReasonKey, "dismissal_reorganization" | "trailing_response" | "protecting_lead">;
  readonly optionIntent: AiInGameFormationOption["intent"];
  readonly tactic: TacticSetup;
}

/**
 * Selects one deterministic, legal opponent command at a stopped minute.
 *
 * Forced incidents are handled before performance or score reactions. The
 * function consumes only football facts and uses stable player/formation keys
 * for tie-breaking, so identical states always produce identical decisions.
 */
export function selectAiInGameDecision(input: SelectAiInGameDecisionInput): AiInGameDecisionSelection {
  const { session, side, rules } = input;
  const currentTeam = teamForSide(session, side);
  const scoreDelta = scoreDeltaFor(session, side);

  if (!isDecisionBoundary(session)) {
    return { reasons: [reason("no_material_change", session.currentMinute, scoreDelta)] };
  }

  const signalByPlayer = new Map(input.playerSignals.map((signal) => [signal.playerId, signal]));
  const outgoingCandidates = selectOutgoingCandidates(session, side, currentTeam, signalByPlayer, scoreDelta);
  const replacementSearch = selectReplacementPair(currentTeam, outgoingCandidates, input.players, signalByPlayer);
  const outgoing = replacementSearch.replacement?.outgoing ?? outgoingCandidates[0];
  const incoming = replacementSearch.replacement?.incoming;
  const tacticalIntent = selectTacticalIntent(session, side, currentTeam.tactic, scoreDelta);
  const formationOption = tacticalIntent === undefined
    ? undefined
    : selectFormationOption(
        buildAiInGameFormationOptions(currentTeam, input.players),
        tacticalIntent.optionIntent,
        currentTeam,
      );

  const dismissal = reorganizeAfterDismissal(
    formationOption ?? currentTeam,
    session.pendingDecision,
    side,
    input.players,
    rules,
  );
  let nextTeam = dismissal.team;
  const substitutions = dismissal.substitution === undefined ? [] : [dismissal.substitution];
  const reasons: AiInGameDecisionReason[] = [];

  if (outgoing !== undefined) {
    if (incoming === undefined || currentTeam.substitutionsUsed >= rules.maximumSubstitutions) {
      reasons.push({
        ...reason("no_legal_substitute", session.currentMinute, scoreDelta, outgoing),
        replacementFailureKey: currentTeam.substitutionsUsed >= rules.maximumSubstitutions
          ? "substitution_limit"
          : replacementSearch.failureKey ?? "no_available_bench",
      });
      if (outgoing.reasonKey === "forced_injury_replacement") {
        nextTeam = removeUnavailablePlayer(nextTeam, outgoing.playerId, "injured", input.players);
      }
    } else {
      const forcedInjury = outgoing.reasonKey === "forced_injury_replacement";
      nextTeam = substitutePlayer(nextTeam, outgoing, incoming, forcedInjury);
      substitutions.push({
        outgoingPlayerId: outgoing.playerId,
        incomingPlayerId: incoming.playerId,
        reasonKey: forcedInjury ? "forced_injury" as const : "ai_decision" as const,
      });
      reasons.push({
        ...reason(outgoing.reasonKey, session.currentMinute, scoreDelta, outgoing),
        replacementPlayerId: incoming.playerId,
        suitability: incoming.suitability,
      });
    }
  }

  if (tacticalIntent !== undefined) {
    nextTeam = { ...nextTeam, tactic: tacticalIntent.tactic };
    reasons.push(reason(tacticalIntent.reasonKey, session.currentMinute, scoreDelta));
  }

  const commandChangedTeam = !sameTeamState(currentTeam, nextTeam) || substitutions.length > 0;
  if (!commandChangedTeam) {
    return {
      reasons: reasons.length > 0 ? reasons : [reason("no_material_change", session.currentMinute, scoreDelta)],
    };
  }

  const command: ApplyLiveMatchTeamChangesCommand = {
    type: "apply_team_changes",
    side,
    substitutions,
    nextTeam,
  };
  const validation = validateLiveMatchCommand(sessionForAiValidation(session, side), command, rules);
  if (!validation.accepted) {
    return {
      reasons: [
        ...reasons,
        rejectionReason(
          session.currentMinute,
          scoreDelta,
          validation.rejections.map((entry) => entry.code),
          rejectedPlayerIds(command, validation.rejections),
        ),
      ],
    };
  }

  return { command, reasons };
}

/** Applies the selected AI command through the canonical live command path. */
export function applyAiInGameDecision(input: SelectAiInGameDecisionInput): ApplyAiInGameDecisionResult {
  const selection = selectAiInGameDecision(input);
  if (selection.command === undefined) {
    return { session: input.session, facts: [], selection };
  }

  const applied = applyValidatedLiveMatchCommand(
    sessionForAiValidation(input.session, input.side),
    selection.command,
    input.rules,
  );
  if (!applied.accepted) {
    const rejectionCodes = applied.validation.accepted
      ? []
      : applied.validation.rejections.map((entry) => entry.code);
    return {
      session: input.session,
      facts: [],
      selection: {
        reasons: [
          ...selection.reasons,
          rejectionReason(
            input.session.currentMinute,
            scoreDeltaFor(input.session, input.side),
            rejectionCodes,
            rejectedPlayerIds(selection.command, applied.validation.accepted ? [] : applied.validation.rejections),
          ),
        ],
      },
    };
  }

  return {
    session: { ...applied.session, controlledSide: input.session.controlledSide },
    facts: applied.facts,
    selection,
  };
}

/**
 * Applies every AI decision caused by the latest completed engine minute.
 *
 * The bridge pauses only its private working copy, validates the decision
 * through the shared live-command path, and updates the same progressive
 * session used by interactive Matchday. A previously running match is resumed
 * before returning; manager-owned pauses remain untouched.
 */
export function applyProgressiveAiInGameDecisions(
  input: ApplyProgressiveAiInGameDecisionsInput,
): ApplyProgressiveAiInGameDecisionsResult {
  const wasRunning = input.state.runState === "running";
  const boundaries = aiDecisionBoundaries(input.state, input.side);
  if (boundaries.length === 0) {
    return {
      state: input.state,
      team: teamForSide(input.session, input.side),
      decisions: [],
    };
  }

  let state = wasRunning ? pauseProgressiveMatchSession(input.state) : input.state;
  let team = teamForSide(input.session, input.side);
  let domainSession = input.session;
  const decisions: ProgressiveAiInGameDecision[] = [];

  for (const boundary of boundaries) {
    const decisionSession = sessionForProgressiveAiDecision(
      domainSession,
      state,
      input.side,
      team,
      boundary,
      input.rules,
    );
    const applied = applyAiInGameDecision({
      session: decisionSession,
      side: input.side,
      rules: input.rules,
      players: input.players,
      playerSignals: input.playerSignals,
    });
    decisions.push({ selection: applied.selection, facts: applied.facts });

    const commandRejected = applied.selection.reasons.some((entry) => entry.reasonKey === "command_rejected");
    if (applied.selection.command === undefined || commandRejected) {
      continue;
    }

    team = teamForSide(applied.session, input.side);
    state = applyConfirmedProgressiveTeamChanges(state, {
      side: input.side,
      team: input.buildMatchTeamContext(team),
      availability: {
        bench: team.bench,
        unavailable: team.unavailable,
      },
      substitutions: applied.facts.flatMap((fact) => fact.type === "substitution" ? [fact.substitution] : []),
      tacticalCommandFacts: tacticalCommandFacts("ai", applied.facts),
    });
    domainSession = applied.session;
  }

  return {
    state: wasRunning ? resumeProgressiveMatchSession(state) : state,
    team,
    decisions,
  };
}

/** Retains only facts that do not already live as substitution events. */
function tacticalCommandFacts(
  owner: AppliedLiveMatchTacticalCommandFact["owner"],
  facts: readonly AppliedLiveMatchCommandFact[],
): readonly AppliedLiveMatchTacticalCommandFact[] {
  return facts.flatMap((fact) => fact.type === "substitution" ? [] : [{ owner, fact }]);
}

/**
 * Runs one automatic match through the same minute and command path as Matchday.
 *
 * The caller declares ownership instead of choosing a different simulator. A
 * background fixture passes both sides; interactive Matchday keeps calling the
 * one-side bridge directly so its manager-owned side remains manual.
 */
export function runAutomatedProgressiveMatch(
  input: RunAutomatedProgressiveMatchInput,
): RunAutomatedProgressiveMatchResult {
  const aiControlledSides = orderedUniqueSides(input.aiControlledSides);
  let home = input.home;
  let away = input.away;
  const availability: ProgressiveMatchAvailability = {
    home: { bench: home.bench, unavailable: home.unavailable },
    away: { bench: away.bench, unavailable: away.unavailable },
  };
  let state = resumeProgressiveMatchSession(
    createProgressiveMatchSession(input.context, availability),
  );
  const registrations = playerRatingRegistrations(home, away);
  const rngKey = buildMatchRngKey(input.context);
  const rng = deriveRng(rngKey.seed, rngKey.streamName, ...matchRngKeyParts(rngKey));
  const decisions: AutomatedProgressiveAiDecision[] = [];

  while (state.phase !== "full_time") {
    if (state.runState === "paused") state = resumeProgressiveMatchSession(state);
    state = advanceProgressiveMatchMinute(state, rng, {
      lateralFocusBySide: input.lateralFocusBySide,
    });

    for (const side of aiControlledSides) {
      if (!hasProgressiveAiInGameDecisionBoundary(state, side)) continue;
      // Tiny deterministic test matches can place half time before regulation
      // minute 45, which the domain live-session contract intentionally does
      // not represent. They still use this minute loop, but have no live AI
      // decision boundary until a regulation-valid minute exists.
      if (state.phase === "half_time" && state.simulation.minute !== 45) continue;
      const projection = buildLiveMatchProjection({
        simulation: state.simulation,
        events: state.events,
        playerRegistrations: registrations,
      });
      const applied = applyProgressiveAiInGameDecisions({
        state,
        session: liveSessionForAutomatedDecision(
          state,
          side,
          home,
          away,
          projection.statistics,
          input.rules,
        ),
        side,
        rules: input.rules,
        players: input.players,
        playerSignals: projection.players
          .filter((player) => player.side === side)
          .map((player) => ({
            playerId: player.playerId,
            rating: player.rating,
            condition: player.condition,
          })),
        buildMatchTeamContext: (team) => input.buildMatchTeamContext(
          team,
          telemetryFor(state.simulation).playerCondition,
        ),
      });
      state = applied.state;
      if (side === "home") home = applied.team;
      else away = applied.team;
      decisions.push(...applied.decisions.map((decision) => ({ side, ...decision })));
    }
  }

  return { state, home, away, decisions };
}

/** Rejects duplicate ownership rather than evaluating one side twice. */
function orderedUniqueSides(sides: readonly MatchEventSide[]): readonly MatchEventSide[] {
  const seen = new Set<MatchEventSide>();
  const ordered: MatchEventSide[] = [];
  for (const side of sides) {
    if (seen.has(side)) {
      throw new Error(`Automated progressive side is duplicated: ${side}`);
    }
    seen.add(side);
    ordered.push(side);
  }
  return ordered;
}

/** Builds the validated command snapshot from the current progressive facts. */
function liveSessionForAutomatedDecision(
  state: ProgressiveMatchSessionState,
  controlledSide: MatchEventSide,
  home: LiveMatchTeamState,
  away: LiveMatchTeamState,
  statistics: LiveMatchSession["statistics"],
  rules: CompetitionMatchRules,
): LiveMatchSession {
  return createLiveMatchSession({
    fixtureId: state.initialContext.fixtureId,
    controlledSide,
    phase: state.phase,
    currentMinute: state.simulation.minute,
    runState: state.runState,
    ...(state.runState === "paused" ? { pauseReason: "manual" as const } : {}),
    score: { ...state.simulation.score },
    statistics,
    home,
    away,
    events: [],
    substitutions: state.appliedSubstitutions,
  }, rules);
}

/** Registers starters and bench once so substituted players retain ratings. */
function playerRatingRegistrations(
  home: LiveMatchTeamState,
  away: LiveMatchTeamState,
): readonly PlayerMatchRatingRegistration[] {
  return [
    ...playerRatingRegistrationsForTeam(home),
    ...playerRatingRegistrationsForTeam(away),
  ];
}

function playerRatingRegistrationsForTeam(
  team: LiveMatchTeamState,
): readonly PlayerMatchRatingRegistration[] {
  const seen = new Set<PlayerId>();
  return [...team.lineup, ...team.bench]
    .filter(({ playerId }) => {
      if (seen.has(playerId)) return false;
      seen.add(playerId);
      return true;
    })
    .map(({ playerId }) => ({ playerId, side: team.side }));
}

/** Reports whether the latest completed minute owns real AI work. */
export function hasProgressiveAiInGameDecisionBoundary(
  state: ProgressiveMatchSessionState,
  side: MatchEventSide,
): boolean {
  return aiDecisionBoundaries(state, side).length > 0;
}

function aiDecisionBoundaries(
  state: ProgressiveMatchSessionState,
  side: MatchEventSide,
): readonly (LiveMatchPendingDecision | undefined)[] {
  if (state.phase === "pre_match" || state.phase === "full_time") return [];

  const currentMinuteEvents = state.events.filter((event) => event.minute === state.simulation.minute);
  const incidents = currentMinuteEvents.flatMap((event): readonly LiveMatchPendingDecision[] => {
    if (event.type === "injury" && event.side === side && (event.severity === "moderate" || event.severity === "serious")) {
      return [{
        type: "forced_injury",
        minute: event.minute,
        side,
        playerId: event.playerId,
        severity: event.severity,
      }];
    }
    if ((event.type === "red_card" || event.type === "second_yellow_card") && event.side === side) {
      return [{
        type: "red_card_reorganization",
        minute: event.minute,
        side,
        playerId: event.playerId,
      }];
    }
    return [];
  });

  // One stoppage owns one coherent AI decision batch. Mandatory incidents
  // already allow the policy to replace the player and adjust its tactic, so
  // running the scheduled workload decision afterwards would evaluate a
  // second command against team state that changed in the same minute.
  if (incidents.length > 0) return incidents;

  if (state.phase === "half_time") {
    return [{ type: "half_time", minute: state.simulation.minute, side }];
  }
  if (state.simulation.minute === 60) {
    // A single stoppage can legally carry more than one change. Evaluating the
    // second command against the already-updated team avoids a batch-only
    // shortcut while allowing routine rotation to reach realistic volumes.
    return [undefined, undefined];
  }
  if (state.simulation.minute === 70) {
    return [undefined, undefined];
  }
  if (state.simulation.minute === 80) {
    return [undefined];
  }
  return [];
}

function sessionForProgressiveAiDecision(
  session: LiveMatchSession,
  state: ProgressiveMatchSessionState,
  side: MatchEventSide,
  team: LiveMatchTeamState,
  pendingDecision: LiveMatchPendingDecision | undefined,
  rules: CompetitionMatchRules,
): LiveMatchSession {
  const { pauseReason: _pauseReason, pendingDecision: _pendingDecision, ...base } = session;
  const pauseReason = pendingDecision?.type === "forced_injury"
    ? "forced_injury" as const
    : pendingDecision?.type === "red_card_reorganization"
      ? "selected_club_red_card" as const
      : pendingDecision?.type === "half_time"
        ? "half_time" as const
        : "manual" as const;

  return createLiveMatchSession({
    ...base,
    controlledSide: side,
    phase: state.phase,
    currentMinute: state.simulation.minute,
    runState: "paused",
    pauseReason,
    score: { ...state.simulation.score },
    ...(side === "home" ? { home: team } : { away: team }),
    ...(pendingDecision === undefined ? {} : { pendingDecision }),
  }, rules);
}

function isDecisionBoundary(session: LiveMatchSession): boolean {
  if (session.runState !== "paused") return false;
  if (session.phase !== "first_half" && session.phase !== "half_time" && session.phase !== "second_half") return false;
  if (session.pendingDecision !== undefined) return true;
  return session.phase === "half_time" || session.currentMinute === 60 || session.currentMinute === 70 || session.currentMinute === 80;
}

function selectOutgoingCandidates(
  session: LiveMatchSession,
  side: MatchEventSide,
  team: LiveMatchTeamState,
  signalByPlayer: ReadonlyMap<PlayerId, AiInGamePlayerSignal>,
  scoreDelta: number,
): readonly OutgoingCandidate[] {
  const pending = session.pendingDecision?.side === side ? session.pendingDecision : undefined;

  if (pending?.type === "red_card_reorganization") return [];
  if (pending?.type === "forced_injury") {
    const slot = team.lineup.find((entry) => entry.playerId === pending.playerId);
    if (slot === undefined) return [];
    const signal = signalByPlayer.get(slot.playerId) ?? {
      playerId: slot.playerId,
      rating: 6.5,
      condition: 100,
    };
    return [candidate(slot, signal, "forced_injury_replacement", 1_000)];
  }

  const candidates = team.lineup
    .filter((slot) => slot.role !== "goalkeeper")
    .map((slot): OutgoingCandidate | undefined => {
      const signal = signalByPlayer.get(slot.playerId) ?? { playerId: slot.playerId, rating: 6.5, condition: 100 };
      if (signal.condition < 68) return candidate(slot, signal, "low_condition", 500 + (68 - signal.condition));
      const routineThreshold = routineConditionThreshold(session.currentMinute);
      if (signal.condition < routineThreshold) {
        return candidate(slot, signal, "low_condition", 350 + (routineThreshold - signal.condition));
      }
      if (signal.rating < 5.7) return candidate(slot, signal, "poor_performance", 300 + (5.7 - signal.rating) * 10);
      if (scoreDelta < 0 && session.currentMinute >= 60 && signal.rating < 6.4) {
        return candidate(slot, signal, "trailing_response", 200 + (6.4 - signal.rating) * 10);
      }
      return undefined;
    })
    .filter((value): value is OutgoingCandidate => value !== undefined)
    .sort((left, right) => right.priority - left.priority || String(left.playerId).localeCompare(String(right.playerId)));

  return candidates;
}

function routineConditionThreshold(minute: number): number {
  // Match condition falls by roughly 7-8 points across 90 minutes. These
  // boundaries therefore represent real accumulated workload on that scale,
  // rather than unreachable season-readiness values.
  if (minute >= 80) return 94.5;
  if (minute >= 70) return 95;
  if (minute >= 60) return 95.5;
  return 76;
}

function candidate(
  slot: LiveMatchTeamState["lineup"][number],
  signal: AiInGamePlayerSignal,
  reasonKey: OutgoingCandidate["reasonKey"],
  priority: number,
): OutgoingCandidate {
  return {
    playerId: slot.playerId,
    slotId: slot.slotId,
    role: slot.role,
    reasonKey,
    priority,
    rating: signal.rating,
    condition: signal.condition,
  };
}

function selectIncomingCandidate(
  team: LiveMatchTeamState,
  outgoing: OutgoingCandidate,
  players: Readonly<Record<PlayerId, Player>>,
  signalByPlayer: ReadonlyMap<PlayerId, AiInGamePlayerSignal>,
): IncomingCandidateSearch {
  const outgoingPlayer = players[outgoing.playerId];
  if (outgoingPlayer === undefined) return { failureKey: "no_available_bench" };
  const outgoingScore = playerScoreForRole(outgoingPlayer, outgoing.role, outgoing.condition);
  const permittedRegression = outgoing.reasonKey === "forced_injury_replacement"
    ? Number.POSITIVE_INFINITY
    : outgoing.condition < 68
      ? 3
      : outgoing.reasonKey === "low_condition"
        ? 3
        : 0.75;

  const available = team.bench.filter((benchPlayer) => benchPlayer.status === "available");
  if (available.length === 0) return { failureKey: "no_available_bench" };

  const credible = available
    .map((benchPlayer): IncomingCandidate | undefined => {
      const player = players[benchPlayer.playerId];
      if (player === undefined) return undefined;
      const condition = signalByPlayer.get(player.id)?.condition ?? 100;
      const suitability = evaluatePositionSuitability(player.naturalPositions, { playerRole: outgoing.role });
      if (suitability === "invalid") return undefined;
      const score = playerScoreForRole(player, outgoing.role, condition);
      return {
        playerId: player.id,
        suitability,
        roleAbility: roundOneDecimal(roleAbilityFor(player, outgoing.role)),
        score: roundOneDecimal(score),
      };
    })
    .filter((value): value is IncomingCandidate => value !== undefined);
  if (credible.length === 0) return { failureKey: "no_positionally_credible_bench" };

  const candidate = credible
    .filter((value) => value.score >= outgoingScore - permittedRegression)
    .sort((left, right) => right.score - left.score || String(left.playerId).localeCompare(String(right.playerId)))[0];
  return candidate === undefined ? { failureKey: "quality_floor" } : { candidate };
}

function selectReplacementPair(
  team: LiveMatchTeamState,
  outgoingCandidates: readonly OutgoingCandidate[],
  players: Readonly<Record<PlayerId, Player>>,
  signalByPlayer: ReadonlyMap<PlayerId, AiInGamePlayerSignal>,
): {
  readonly replacement?: { readonly outgoing: OutgoingCandidate; readonly incoming: IncomingCandidate };
  readonly failureKey?: AiInGameReplacementFailureKey;
} {
  let strongestFailure: AiInGameReplacementFailureKey | undefined;
  for (const outgoing of outgoingCandidates) {
    const search = selectIncomingCandidate(team, outgoing, players, signalByPlayer);
    if ("candidate" in search) return { replacement: { outgoing, incoming: search.candidate } };
    strongestFailure = strongerReplacementFailure(strongestFailure, search.failureKey);

    // A forced exit cannot be replaced by choosing a different outgoing
    // player. The caller must remove the injured player if the bench has no
    // legal replacement.
    if (outgoing.reasonKey === "forced_injury_replacement") return { failureKey: search.failureKey };
  }
  return strongestFailure === undefined ? {} : { failureKey: strongestFailure };
}

/** Keeps the deepest reached replacement-funnel break across outgoing candidates. */
function strongerReplacementFailure(
  current: AiInGameReplacementFailureKey | undefined,
  candidate: AiInGameReplacementFailureKey | undefined,
): AiInGameReplacementFailureKey | undefined {
  if (candidate === undefined) return current;
  const priority = {
    substitution_limit: 4,
    quality_floor: 3,
    no_positionally_credible_bench: 2,
    no_available_bench: 1,
  } satisfies Record<AiInGameReplacementFailureKey, number>;
  return current === undefined || priority[candidate] > priority[current] ? candidate : current;
}

function playerScoreForRole(player: Player, role: CanonicalPlayerRole, condition: number): number {
  const roleAbility = roleAbilityFor(player, role);
  const fitScore = scorePlayerForFormationSlot({
    naturalPositions: player.naturalPositions,
    slot: { playerRole: role },
    playerStrength: roleAbility,
  });
  return fitScore + boundedConditionModifier(condition);
}

function roleAbilityFor(player: Player, role: CanonicalPlayerRole): number {
  return Number(roleCurrentAbility(player.abilities, getPlayerRoleProfile(playerRoleForCanonicalRole(role))));
}

function boundedConditionModifier(condition: number): number {
  if (condition >= 90) return 0;
  if (condition >= 80) return -0.5;
  if (condition >= 70) return -1.5;
  return -3;
}

function selectTacticalIntent(
  session: LiveMatchSession,
  side: MatchEventSide,
  tactic: TacticSetup,
  scoreDelta: number,
): TacticalIntent | undefined {
  const pending = session.pendingDecision?.side === side ? session.pendingDecision : undefined;
  if (pending?.type === "red_card_reorganization") {
    return {
      reasonKey: "dismissal_reorganization",
      optionIntent: "recover_after_dismissal",
      tactic: adjustTactic(tactic, "recover_after_dismissal"),
    };
  }
  if (scoreDelta < 0 && session.currentMinute >= 60) {
    return {
      reasonKey: "trailing_response",
      optionIntent: "chase_match",
      tactic: adjustTactic(tactic, "chase_match"),
    };
  }
  if (scoreDelta > 0 && session.currentMinute >= 70) {
    return {
      reasonKey: "protecting_lead",
      optionIntent: "protect_lead",
      tactic: adjustTactic(tactic, "protect_lead"),
    };
  }
  return undefined;
}

function selectFormationOption(
  options: readonly AiInGameFormationOption[] | undefined,
  intent: AiInGameFormationOption["intent"],
  currentTeam: LiveMatchTeamState,
): LiveMatchTeamState | undefined {
  const currentPlayers = playerIdsFor(currentTeam.lineup);
  return options
    ?.filter((option) => option.intent === intent && option.team.side === currentTeam.side)
    .filter((option) => samePlayerSet(currentPlayers, playerIdsFor(option.team.lineup)))
    .filter((option) => option.team.substitutionsUsed === currentTeam.substitutionsUsed)
    .sort((left, right) => left.team.formation.localeCompare(right.team.formation))[0]?.team;
}

function substitutePlayer(
  team: LiveMatchTeamState,
  outgoing: OutgoingCandidate,
  incoming: IncomingCandidate,
  forcedInjury: boolean,
): LiveMatchTeamState {
  return {
    ...team,
    lineup: team.lineup.map((slot) => slot.playerId === outgoing.playerId ? { ...slot, playerId: incoming.playerId } : slot),
    bench: forcedInjury
      ? team.bench.filter((slot) => slot.playerId !== incoming.playerId)
      : team.bench.map((slot) => slot.playerId === incoming.playerId
          ? { ...slot, playerId: outgoing.playerId, status: "substituted_out" as const }
          : slot),
    unavailable: forcedInjury
      ? addUnavailableInjury(team, outgoing.playerId)
      : team.unavailable,
    substitutionsUsed: team.substitutionsUsed + 1,
  };
}

/** One team reorganized after a dismissal, and the substitution it cost. */
interface DismissalReorganization {
  readonly team: LiveMatchTeamState;
  readonly substitution?: ApplyLiveMatchTeamChangesCommand["substitutions"][number];
}

/**
 * Reorganizes a team around a sending-off, keeping a real goalkeeper in goal.
 *
 * A dismissed outfielder is simply removed. A dismissed **goalkeeper** is what
 * this exists for: football's answer is to take an outfielder off and send the
 * substitute keeper on, and until Step 09 the policy did neither. It made no
 * substitution at all and handed the gloves to whichever remaining player
 * happened to sort last by slot name, while the reserve keeper watched from the
 * bench for the rest of the match.
 *
 * The canonical command path already permitted this: a dismissed player removed
 * without replacement and one ordinary substitution alongside it are separately
 * legal, and substituting the dismissed player himself is the only thing barred.
 *
 * Promoting an outfielder is kept as the genuine last resort - no substitute
 * keeper, or no substitutions left - and it now picks the best pair of hands
 * rather than the last slot in the alphabet.
 */
function reorganizeAfterDismissal(
  team: LiveMatchTeamState,
  pendingDecision: LiveMatchPendingDecision | undefined,
  side: MatchEventSide,
  players: Readonly<Record<PlayerId, Player>>,
  rules: CompetitionMatchRules,
): DismissalReorganization {
  if (pendingDecision?.type !== "red_card_reorganization" || pendingDecision.side !== side) {
    return { team };
  }

  const dismissedSlot = team.lineup.find((slot) => slot.playerId === pendingDecision.playerId);
  if (dismissedSlot === undefined || dismissedSlot.role !== "goalkeeper") {
    return { team: removeUnavailablePlayer(team, pendingDecision.playerId, "dismissed", players) };
  }

  const substituteGoalkeeper = availableBenchGoalkeeper(team, players);
  const sacrificed = outfielderToSacrifice(team, pendingDecision.playerId);
  if (substituteGoalkeeper === undefined
    || sacrificed === undefined
    || team.substitutionsUsed >= rules.maximumSubstitutions) {
    return { team: removeUnavailablePlayer(team, pendingDecision.playerId, "dismissed", players) };
  }

  return {
    team: {
      ...team,
      lineup: team.lineup
        .filter((slot) => slot.playerId !== pendingDecision.playerId)
        .map((slot) => slot.playerId === sacrificed.playerId
          ? { ...dismissedSlot, playerId: substituteGoalkeeper }
          : slot),
      bench: team.bench.map((slot) => slot.playerId === substituteGoalkeeper
        ? { ...slot, playerId: sacrificed.playerId, status: "substituted_out" as const }
        : slot),
      unavailable: team.unavailable.some((entry) => entry.playerId === pendingDecision.playerId)
        ? team.unavailable
        : [...team.unavailable, { playerId: pendingDecision.playerId, reason: "dismissed" as const }],
      substitutionsUsed: team.substitutionsUsed + 1,
    },
    substitution: {
      outgoingPlayerId: sacrificed.playerId,
      incomingPlayerId: substituteGoalkeeper,
      reasonKey: "ai_decision",
    },
  };
}

/** Finds a real goalkeeper still available to come off this bench. */
function availableBenchGoalkeeper(
  team: LiveMatchTeamState,
  players: Readonly<Record<PlayerId, Player>>,
): PlayerId | undefined {
  return team.bench
    .filter((benchPlayer) => benchPlayer.status === "available")
    .map((benchPlayer) => benchPlayer.playerId)
    .filter((playerId) => {
      const player = players[playerId];
      return player !== undefined
        && evaluatePositionSuitability(player.naturalPositions, { playerRole: "goalkeeper" }) !== "invalid";
    })
    .sort((left, right) => String(left).localeCompare(String(right)))[0];
}

/**
 * Chooses who makes way for the substitute keeper.
 *
 * A side down to ten after a sending-off gives up an attacker before anything
 * else, so the sacrifice is taken from the front of the pitch backwards. Slot
 * key breaks any remaining tie, so the same dismissal always costs the same man.
 */
function outfielderToSacrifice(
  team: LiveMatchTeamState,
  dismissedPlayerId: PlayerId,
): LiveMatchTeamState["lineup"][number] | undefined {
  const sacrificeOrder: readonly CanonicalPlayerRole[] = [
    "striker",
    "right_winger",
    "left_winger",
    "attacking_midfielder",
    "right_midfielder",
    "left_midfielder",
    "central_midfielder",
    "defensive_midfielder",
    "right_full_back",
    "left_full_back",
    "center_back",
  ];

  return [...team.lineup]
    .filter((slot) => slot.playerId !== dismissedPlayerId && slot.role !== "goalkeeper")
    .sort((left, right) => {
      const order = sacrificeOrder.indexOf(left.role) - sacrificeOrder.indexOf(right.role);
      return order !== 0 ? order : left.slotId.localeCompare(right.slotId);
    })[0];
}

function removeUnavailablePlayer(
  team: LiveMatchTeamState,
  playerId: PlayerId,
  unavailableReason: LiveMatchUnavailableReason,
  players: Readonly<Record<PlayerId, Player>>,
): LiveMatchTeamState {
  const unavailableSlot = team.lineup.find((slot) => slot.playerId === playerId);
  if (unavailableSlot === undefined) return team;

  const remainingLineup = team.lineup.filter((slot) => slot.playerId !== playerId);
  const lineup = unavailableSlot.role === "goalkeeper"
    ? withEmergencyGoalkeeper(remainingLineup, unavailableSlot, players)
    : remainingLineup;

  return {
    ...team,
    lineup,
    bench: team.bench.filter((slot) => slot.playerId !== playerId),
    unavailable: team.unavailable.some((entry) => entry.playerId === playerId)
      ? team.unavailable
      : [...team.unavailable, { playerId, reason: unavailableReason }],
  };
}

/**
 * Hands the gloves to the best pair of hands left on the pitch.
 *
 * This used to sort by `slotId` and take the last one, which named a footballer
 * by where his slot fell in the alphabet. The batch path in `match-team-exit.ts`
 * has always ranked the same decision by reflexes and handling; both now read
 * the same football fact, so a match does not answer this question two ways.
 *
 * Reached only when no substitute goalkeeper can come on at all.
 */
function withEmergencyGoalkeeper(
  lineup: LiveMatchTeamState["lineup"],
  goalkeeperSlot: LiveMatchTeamState["lineup"][number],
  players: Readonly<Record<PlayerId, Player>>,
): LiveMatchTeamState["lineup"] {
  const handsOf = (playerId: PlayerId): number => {
    const player = players[playerId];
    return player === undefined
      ? 0
      : Number(player.abilities.goalkeeping.reflexes) + Number(player.abilities.goalkeeping.handling);
  };
  const emergencyGoalkeeper = [...lineup]
    .sort((left, right) => {
      const hands = handsOf(right.playerId) - handsOf(left.playerId);
      return hands !== 0 ? hands : left.slotId.localeCompare(right.slotId);
    })[0];
  if (emergencyGoalkeeper === undefined) return lineup;

  return [
    { ...goalkeeperSlot, playerId: emergencyGoalkeeper.playerId },
    ...lineup.filter((slot) => slot.playerId !== emergencyGoalkeeper.playerId),
  ];
}

function addUnavailableInjury(team: LiveMatchTeamState, playerId: PlayerId): LiveMatchTeamState["unavailable"] {
  return team.unavailable.some((entry) => entry.playerId === playerId)
    ? team.unavailable
    : [...team.unavailable, { playerId, reason: "injured" }];
}

function adjustTactic(tactic: TacticSetup, intent: AiInGameFormationOption["intent"]): TacticSetup {
  if (intent === "chase_match") {
    return {
      mentality: moreAttackingMentality(tactic.mentality),
      pressing: clamp01(tactic.pressing + 0.1),
      directness: clamp01(tactic.directness + 0.08),
      width: clamp01(tactic.width + 0.05),
      risk: clamp01(tactic.risk + 0.12),
    };
  }
  if (intent === "protect_lead") {
    return {
      mentality: moreDefensiveMentality(tactic.mentality),
      pressing: clamp01(tactic.pressing - 0.08),
      directness: clamp01(tactic.directness + 0.05),
      width: tactic.width,
      risk: clamp01(tactic.risk - 0.12),
    };
  }
  return {
    mentality: moreDefensiveMentality(tactic.mentality),
    pressing: clamp01(tactic.pressing - 0.1),
    directness: tactic.directness,
    width: clamp01(tactic.width - 0.08),
    risk: clamp01(tactic.risk - 0.1),
  };
}

function moreAttackingMentality(mentality: TacticMentalityKey): TacticMentalityKey {
  switch (mentality) {
    case "very_defensive": return "defensive";
    case "defensive": return "balanced";
    case "balanced": return "attacking";
    case "attacking":
    case "very_attacking": return "very_attacking";
  }
}

function moreDefensiveMentality(mentality: TacticMentalityKey): TacticMentalityKey {
  switch (mentality) {
    case "very_defensive":
    case "defensive": return "very_defensive";
    case "balanced": return "defensive";
    case "attacking": return "balanced";
    case "very_attacking": return "attacking";
  }
}

function playerRoleForCanonicalRole(role: CanonicalPlayerRole): PlayerRole {
  switch (role) {
    case "goalkeeper": return "goalkeeper";
    case "right_full_back":
    case "left_full_back": return "full_back";
    case "center_back": return "center_back";
    case "defensive_midfielder": return "defensive_midfielder";
    case "central_midfielder": return "central_midfielder";
    case "right_midfielder":
    case "left_midfielder": return "wide_midfielder";
    case "attacking_midfielder": return "attacking_midfielder";
    case "right_winger":
    case "left_winger": return "winger";
    case "striker": return "striker";
  }
}

function teamForSide(session: LiveMatchSession, side: MatchEventSide): LiveMatchTeamState {
  return side === "home" ? session.home : session.away;
}

function scoreDeltaFor(session: LiveMatchSession, side: MatchEventSide): number {
  return side === "home" ? session.score.home - session.score.away : session.score.away - session.score.home;
}

function sessionForAiValidation(session: LiveMatchSession, side: MatchEventSide): LiveMatchSession {
  return session.controlledSide === side ? session : { ...session, controlledSide: side };
}

function playerIdsFor(lineup: LiveMatchTeamState["lineup"]): ReadonlySet<PlayerId> {
  return new Set(lineup.map((slot) => slot.playerId));
}

function samePlayerSet(left: ReadonlySet<PlayerId>, right: ReadonlySet<PlayerId>): boolean {
  return left.size === right.size && [...left].every((playerId) => right.has(playerId));
}

function sameTeamState(left: LiveMatchTeamState, right: LiveMatchTeamState): boolean {
  return left.side === right.side
    && left.formation === right.formation
    && left.substitutionsUsed === right.substitutionsUsed
    && sameTactic(left.tactic, right.tactic)
    && sameLineup(left.lineup, right.lineup)
    && sameBench(left.bench, right.bench)
    && sameUnavailable(left.unavailable, right.unavailable);
}

function sameTactic(left: TacticSetup, right: TacticSetup): boolean {
  return left.mentality === right.mentality
    && left.pressing === right.pressing
    && left.directness === right.directness
    && left.width === right.width
    && left.risk === right.risk;
}

function sameLineup(left: LiveMatchTeamState["lineup"], right: LiveMatchTeamState["lineup"]): boolean {
  return left.length === right.length && left.every((slot, index) => {
    const other = right[index];
    return other !== undefined
      && slot.slotId === other.slotId
      && slot.playerId === other.playerId
      && slot.role === other.role
      && slot.nx === other.nx
      && slot.ny === other.ny;
  });
}

function sameBench(left: LiveMatchTeamState["bench"], right: LiveMatchTeamState["bench"]): boolean {
  return left.length === right.length && left.every((slot, index) => {
    const other = right[index];
    return other !== undefined
      && slot.slotId === other.slotId
      && slot.playerId === other.playerId
      && slot.status === other.status;
  });
}

function sameUnavailable(
  left: LiveMatchTeamState["unavailable"],
  right: LiveMatchTeamState["unavailable"],
): boolean {
  return left.length === right.length && left.every((player, index) => {
    const other = right[index];
    return other !== undefined && player.playerId === other.playerId && player.reason === other.reason;
  });
}

function reason(
  reasonKey: AiInGameDecisionReasonKey,
  minute: number,
  scoreDelta: number,
  outgoing?: OutgoingCandidate,
): AiInGameDecisionReason {
  return {
    reasonKey,
    minute,
    scoreDelta,
    ...(outgoing === undefined
      ? {}
      : {
          playerId: outgoing.playerId,
          rating: outgoing.rating,
          condition: outgoing.condition,
        }),
  };
}

function rejectionReason(
  minute: number,
  scoreDelta: number,
  rejectionCodes: readonly LiveMatchCommandRejectionCode[],
  rejectedPlayerIds: readonly PlayerId[],
): AiInGameDecisionReason {
  return {
    reasonKey: "command_rejected",
    minute,
    scoreDelta,
    rejectionCodes: [...new Set(rejectionCodes)].sort(),
    ...(rejectedPlayerIds.length === 0 ? {} : { rejectedPlayerIds }),
  };
}

function rejectedPlayerIds(
  command: ApplyLiveMatchTeamChangesCommand,
  rejections: readonly { readonly playerId?: PlayerId }[],
): readonly PlayerId[] {
  const implicated = rejections.flatMap((entry) => entry.playerId === undefined ? [] : [entry.playerId]);
  const seen = new Set<PlayerId>();
  const duplicateIds = [
    ...command.nextTeam.lineup.map((slot) => slot.playerId),
    ...command.nextTeam.bench.map((slot) => slot.playerId),
    ...command.nextTeam.unavailable.map((entry) => entry.playerId),
  ].filter((playerId) => {
    if (seen.has(playerId)) return true;
    seen.add(playerId);
    return false;
  });
  return [...new Set([...implicated, ...duplicateIds])].sort((left, right) => String(left).localeCompare(String(right)));
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, roundTwoDecimals(value)));
}

function roundOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}

function roundTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100;
}
