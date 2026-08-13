import {
  createLiveMatchSession,
  validateLiveMatchCommand,
  type ApplyLiveMatchTeamChangesCommand,
  type AppliedMatchSubstitution,
  type CanonicalPlayerRole,
  type CompetitionMatchRules,
  type FormationKey,
  type LiveMatchBenchPlayer,
  type LiveMatchCommand,
  type LiveMatchCommandValidation,
  type LiveMatchSession,
  type LiveMatchPauseReason,
  type LiveMatchPendingDecision,
  type LiveMatchPhase,
  type LiveMatchRunState,
  type LiveMatchTeamState,
  type LiveMatchUnavailablePlayer,
  type MatchEventSide,
  type MatchTacticalCommandOwner,
  type PlayerId,
  type TacticSetup,
} from "@game/domain";
import type { Rng } from "@game/shared";

import type { MatchContext, MatchTeamContext } from "./match-context.ts";
import type { MatchSimulationState } from "./match-simulation-state.ts";
import { createInitialMatchSimulationState } from "./match-simulation-state.ts";
import type { OccasionResolver } from "./occasion-resolver.ts";
import {
  BALANCED_MATCH_LATERAL_FOCUS_BY_SIDE,
  stepMatch,
  type MatchLateralFocusBySide,
  type MatchStepEvent,
} from "./step-match.ts";

/** Bench and unavailable-player facts kept beside one live team context. */
export interface ProgressiveMatchTeamAvailability {
  readonly bench: readonly LiveMatchBenchPlayer[];
  readonly unavailable: readonly LiveMatchUnavailablePlayer[];
}

/** Optional availability supplied when a real prepared squad starts a match. */
export interface ProgressiveMatchAvailability {
  readonly home: ProgressiveMatchTeamAvailability;
  readonly away: ProgressiveMatchTeamAvailability;
}

/**
 * Serializable football state after the latest completed minute.
 *
 * The mutable RNG cursor deliberately lives outside this value. Browser and
 * batch drivers therefore observe immutable facts without persisting an
 * unfinished match.
 */
export interface ProgressiveMatchSessionState {
  readonly initialContext: MatchContext;
  readonly simulation: MatchSimulationState;
  readonly events: readonly MatchStepEvent[];
  readonly phase: LiveMatchPhase;
  readonly runState: LiveMatchRunState;
  readonly pauseReason?: LiveMatchPauseReason;
  /** Side whose manager receives automatic incident decision pauses. */
  readonly controlledSide?: MatchEventSide;
  readonly pendingDecision?: LiveMatchPendingDecision;
  readonly availability: ProgressiveMatchAvailability;
  readonly appliedSubstitutions: readonly AppliedMatchSubstitution[];
  /** Accepted tactical deltas; substitutions remain owned by their events. */
  readonly appliedTacticalCommandFacts: readonly AppliedLiveMatchTacticalCommandFact[];
}

/** Read-only minute projection exposed to batch, career, and web drivers. */
export interface ProgressiveMatchMinuteSnapshot {
  readonly phase: LiveMatchPhase;
  readonly currentMinute: number;
  readonly runState: LiveMatchRunState;
  readonly pauseReason?: LiveMatchPauseReason;
  readonly score: MatchSimulationState["score"];
  readonly stats: MatchSimulationState["stats"];
  readonly events: readonly MatchStepEvent[];
  readonly home: ProgressiveMatchTeamSnapshot;
  readonly away: ProgressiveMatchTeamSnapshot;
  readonly appliedSubstitutions: readonly AppliedMatchSubstitution[];
}

/** Current lineup, bench, availability, and tactic facts for one side. */
export interface ProgressiveMatchTeamSnapshot extends ProgressiveMatchTeamAvailability {
  readonly team: MatchTeamContext;
}

/** Optional manager ownership for an interactive progressive session. */
export interface CreateProgressiveMatchSessionOptions {
  readonly controlledSide?: MatchEventSide;
}

/** Manager response to an incident pause. */
export interface ResolveProgressiveIncidentDecisionInput {
  readonly action: "acknowledge";
}

/** Driver hook for a deterministic change that becomes active next minute. */
export type ProgressiveMatchBeforeMinute = (
  simulation: MatchSimulationState,
  nextMinute: number,
) => MatchSimulationState;

/** Options for advancing exactly one minute. */
export interface AdvanceProgressiveMatchMinuteOptions {
  readonly occasionResolver?: OccasionResolver;
  readonly beforeMinute?: ProgressiveMatchBeforeMinute;
  /** Explicit in-memory plan; durable preparation ownership arrives in Step 14. */
  readonly lateralFocusBySide?: MatchLateralFocusBySide;
}

/** Options for a non-interactive driver that requests a known minute target. */
export interface RunProgressiveMatchToMinuteOptions extends AdvanceProgressiveMatchMinuteOptions {
  readonly maxStepCount?: number;
}

/** Result of a bounded non-interactive progression request. */
export interface RunProgressiveMatchToMinuteResult {
  readonly state: ProgressiveMatchSessionState;
  readonly rng: Rng;
}

/** Complete, already-validated tactical result applied at a pause boundary. */
export interface ApplyConfirmedProgressiveTeamChangesInput {
  readonly side: MatchEventSide;
  readonly team: MatchTeamContext;
  readonly availability: ProgressiveMatchTeamAvailability;
  readonly substitutions: readonly AppliedMatchSubstitution[];
  /** Owner and non-substitution facts returned by the validated command. */
  readonly tacticalCommandFacts?: readonly AppliedLiveMatchTacticalCommandFact[];
}

/** Structured fact emitted when one accepted command changes the live team. */
export type AppliedLiveMatchCommandFact =
  | {
      readonly type: "substitution";
      readonly substitution: AppliedMatchSubstitution;
    }
  | {
      readonly type: "formation_change";
      readonly minute: number;
      readonly side: MatchEventSide;
      readonly fromFormation: FormationKey;
      readonly toFormation: FormationKey;
    }
  | {
      readonly type: "role_change";
      readonly minute: number;
      readonly side: MatchEventSide;
      readonly playerId: PlayerId;
      readonly slotId: string;
      readonly fromRole: CanonicalPlayerRole;
      readonly toRole: CanonicalPlayerRole;
    }
  | {
      readonly type: "tactic_change";
      readonly minute: number;
      readonly side: MatchEventSide;
      readonly before: TacticSetup;
      readonly after: TacticSetup;
    };

/** A retained tactical delta with the caller that actually chose it. */
export interface AppliedLiveMatchTacticalCommandFact {
  readonly owner: MatchTacticalCommandOwner;
  readonly fact: Exclude<AppliedLiveMatchCommandFact, { readonly type: "substitution" }>;
}

/** Result of validating and applying one canonical live command. */
export type ApplyValidatedLiveMatchCommandResult =
  | {
      readonly accepted: false;
      readonly validation: LiveMatchCommandValidation;
    }
  | {
      readonly accepted: true;
      readonly session: LiveMatchSession;
      readonly facts: readonly AppliedLiveMatchCommandFact[];
    };

/** Stable failures from the progressive driver boundary. */
export type ProgressiveMatchSessionErrorCode =
  | "match_not_running"
  | "match_not_paused"
  | "phase_not_commandable"
  | "invalid_team_side"
  | "invalid_substitution_minute"
  | "invalid_target_minute"
  | "invalid_max_step_count"
  | "incident_decision_required"
  | "invalid_incident_decision"
  | "step_limit_exceeded";

/** Typed error for an invalid progressive match operation. */
export class ProgressiveMatchSessionError extends Error {
  public readonly code: ProgressiveMatchSessionErrorCode;

  public constructor(code: ProgressiveMatchSessionErrorCode, message: string) {
    super(message);
    this.name = "ProgressiveMatchSessionError";
    this.code = code;
  }
}

/** Creates a paused pre-match session without simulating any football fact. */
export function createProgressiveMatchSession(
  context: MatchContext,
  availability: ProgressiveMatchAvailability = EMPTY_AVAILABILITY,
  options: CreateProgressiveMatchSessionOptions = {},
): ProgressiveMatchSessionState {
  return {
    initialContext: context,
    simulation: createInitialMatchSimulationState(context),
    events: [],
    phase: "pre_match",
    runState: "paused",
    pauseReason: "pre_match",
    ...(options.controlledSide === undefined ? {} : { controlledSide: options.controlledSide }),
    availability: copyAvailability(availability),
    appliedSubstitutions: [],
    appliedTacticalCommandFacts: [],
  };
}

/** Starts or resumes regulation play from an explicit pause boundary. */
export function resumeProgressiveMatchSession(
  state: ProgressiveMatchSessionState,
): ProgressiveMatchSessionState {
  if (state.runState !== "paused") {
    throw new ProgressiveMatchSessionError("match_not_paused", "A running match cannot be resumed again");
  }
  if (state.phase === "full_time") {
    throw new ProgressiveMatchSessionError("phase_not_commandable", "A full-time match cannot resume");
  }
  if (state.pendingDecision !== undefined) {
    throw new ProgressiveMatchSessionError(
      "incident_decision_required",
      `Resolve ${state.pendingDecision.type} before resuming the match`,
    );
  }

  const phase: LiveMatchPhase = state.phase === "pre_match"
    ? "first_half"
    : state.phase === "half_time"
      ? "second_half"
      : state.phase;

  return withoutPause({ ...state, phase, runState: "running" });
}

/** Pauses a running match after its latest completed minute. */
export function pauseProgressiveMatchSession(
  state: ProgressiveMatchSessionState,
  reason: Exclude<LiveMatchPauseReason, "pre_match" | "half_time" | "full_time"> = "manual",
): ProgressiveMatchSessionState {
  if (state.runState !== "running") {
    throw new ProgressiveMatchSessionError("match_not_running", "Only a running match may be paused");
  }
  if (state.phase !== "first_half" && state.phase !== "second_half") {
    throw new ProgressiveMatchSessionError("phase_not_commandable", `Cannot pause phase ${state.phase}`);
  }

  return { ...state, runState: "paused", pauseReason: reason };
}

/**
 * Advances the canonical session by exactly one completed match minute.
 *
 * The supplied RNG cursor belongs to the caller's in-memory runtime. This
 * function never creates a timer, precomputes a future half, or writes state.
 */
export function advanceProgressiveMatchMinute(
  state: ProgressiveMatchSessionState,
  rng: Rng,
  options: AdvanceProgressiveMatchMinuteOptions = {},
): ProgressiveMatchSessionState {
  if (state.runState !== "running") {
    throw new ProgressiveMatchSessionError("match_not_running", "Resume the match before requesting its next minute");
  }

  const nextMinute = state.simulation.minute + 1;
  const simulation = options.beforeMinute === undefined
    ? state.simulation
    : options.beforeMinute(state.simulation, nextMinute);
  const lateralFocusBySide = options.lateralFocusBySide
    ?? BALANCED_MATCH_LATERAL_FOCUS_BY_SIDE;
  const stepped = options.occasionResolver === undefined
    ? stepMatch({ simulation, rng, lateralFocusBySide })
    : stepMatch({ simulation, rng, lateralFocusBySide, occasionResolver: options.occasionResolver });
  const phase = progressiveMatchPhaseFor(stepped.simulation);
  const incidentPause = incidentPauseFor(state, stepped.events);

  if (incidentPause !== undefined) {
    return {
      ...state,
      simulation: stepped.simulation,
      events: [...state.events, ...stepped.events],
      availability: availabilityAfterIncidents(state.availability, stepped.events),
      phase,
      runState: "paused",
      pauseReason: incidentPause.pauseReason,
      pendingDecision: incidentPause.pendingDecision,
    };
  }

  if (phase === "half_time") {
    return {
      ...state,
      simulation: stepped.simulation,
      events: [...state.events, ...stepped.events],
      phase,
      runState: "paused",
      pauseReason: "half_time",
      availability: availabilityAfterIncidents(state.availability, stepped.events),
    };
  }

  if (phase === "full_time") {
    return {
      ...state,
      simulation: stepped.simulation,
      events: [...state.events, ...stepped.events],
      phase,
      runState: "paused",
      pauseReason: "full_time",
      availability: availabilityAfterIncidents(state.availability, stepped.events),
    };
  }

  return withoutPause({
    ...state,
    simulation: stepped.simulation,
    events: [...state.events, ...stepped.events],
    phase,
    availability: availabilityAfterIncidents(state.availability, stepped.events),
    runState: "running",
  });
}

/** Resolves one typed automatic incident pause without starting the next minute. */
export function resolveProgressiveMatchIncidentDecision(
  state: ProgressiveMatchSessionState,
  input: ResolveProgressiveIncidentDecisionInput,
): ProgressiveMatchSessionState {
  const decision = state.pendingDecision;
  if (state.runState !== "paused" || decision === undefined || decision.type === "half_time") {
    throw new ProgressiveMatchSessionError("invalid_incident_decision", "No incident decision is waiting");
  }

  if (input.action !== "acknowledge") {
    throw new ProgressiveMatchSessionError(
      "invalid_incident_decision",
      `${decision.type} requires acknowledge after reviewing the team`,
    );
  }
  return withoutPendingDecision({ ...state, pauseReason: "manual" });
}

/**
 * Requests completed minutes through the same one-minute operation.
 *
 * Batch and compatibility drivers may pass through half time automatically;
 * interactive drivers should call `advanceProgressiveMatchMinute` directly so
 * every manager pause remains explicit.
 */
export function runProgressiveMatchToMinute(
  initialState: ProgressiveMatchSessionState,
  rng: Rng,
  targetMinute: number,
  options: RunProgressiveMatchToMinuteOptions = {},
): RunProgressiveMatchToMinuteResult {
  if (!Number.isSafeInteger(targetMinute) || targetMinute < initialState.simulation.minute) {
    throw new ProgressiveMatchSessionError(
      "invalid_target_minute",
      `Target minute ${targetMinute} cannot precede completed minute ${initialState.simulation.minute}`,
    );
  }

  const maxStepCount = options.maxStepCount ?? targetMinute - initialState.simulation.minute + 1;
  if (!Number.isSafeInteger(maxStepCount) || maxStepCount <= 0) {
    throw new ProgressiveMatchSessionError(
      "invalid_max_step_count",
      `maxStepCount must be a positive safe integer: ${String(maxStepCount)}`,
    );
  }

  let state = initialState;
  let stepCount = 0;
  while (state.simulation.minute < targetMinute && stepCount < maxStepCount) {
    if (state.runState === "paused") state = resumeProgressiveMatchSession(state);
    state = advanceProgressiveMatchMinute(state, rng, options);
    stepCount += 1;
  }

  if (state.simulation.minute < targetMinute) {
    throw new ProgressiveMatchSessionError(
      "step_limit_exceeded",
      `Match did not reach minute ${targetMinute} within ${maxStepCount} steps`,
    );
  }

  return { state, rng };
}

/**
 * Applies one complete validated team change while football is stopped.
 *
 * Updating the current simulation context at minute `N` means the changed
 * lineup and tactic can first be read by `stepMatch` for minute `N + 1`.
 */
export function applyConfirmedProgressiveTeamChanges(
  state: ProgressiveMatchSessionState,
  input: ApplyConfirmedProgressiveTeamChangesInput,
): ProgressiveMatchSessionState {
  if (state.runState !== "paused") {
    throw new ProgressiveMatchSessionError("match_not_paused", "Team changes require a paused match");
  }
  if (state.phase !== "first_half" && state.phase !== "half_time" && state.phase !== "second_half") {
    throw new ProgressiveMatchSessionError("phase_not_commandable", `Cannot change a team during ${state.phase}`);
  }
  if (input.team.clubId !== teamForSide(state.simulation.context, input.side).clubId) {
    throw new ProgressiveMatchSessionError("invalid_team_side", `Changed ${input.side} team must preserve its club identity`);
  }
  if (input.substitutions.some((substitution) => substitution.side !== input.side || substitution.minute !== state.simulation.minute)) {
    throw new ProgressiveMatchSessionError(
      "invalid_substitution_minute",
      `Confirmed substitutions must belong to ${input.side} at completed minute ${state.simulation.minute}`,
    );
  }
  if (input.tacticalCommandFacts?.some(({ fact }) => fact.side !== input.side || fact.minute !== state.simulation.minute)) {
    throw new ProgressiveMatchSessionError(
      "invalid_substitution_minute",
      `Confirmed tactical facts must belong to ${input.side} at completed minute ${state.simulation.minute}`,
    );
  }

  const context = withTeam(state.simulation.context, input.side, input.team);
  const availability = withAvailability(state.availability, input.side, input.availability);
  const substitutionEvents: MatchStepEvent[] = input.substitutions.map((substitution) => ({
    type: "substitution",
    minute: substitution.minute,
    side: substitution.side,
    outgoingPlayerId: substitution.outgoingPlayerId,
    incomingPlayerId: substitution.incomingPlayerId,
    slotId: substitution.slotId,
    reasonKey: substitution.reasonKey,
  }));
  return {
    ...state,
    simulation: { ...state.simulation, context },
    events: [...state.events, ...substitutionEvents],
    availability,
    appliedSubstitutions: [...state.appliedSubstitutions, ...input.substitutions],
    appliedTacticalCommandFacts: [
      ...state.appliedTacticalCommandFacts,
      ...(input.tacticalCommandFacts ?? []),
    ],
  };
}

/**
 * Validates and applies one live command through a single atomic engine path.
 *
 * Manager and AI callers supply the same domain command. Rejected commands do
 * not alter the snapshot; accepted team changes append substitution events and
 * return formation, role, and tactic facts for live/final presentation.
 */
export function applyValidatedLiveMatchCommand(
  session: LiveMatchSession,
  command: LiveMatchCommand,
  rules: CompetitionMatchRules,
): ApplyValidatedLiveMatchCommandResult {
  const validation = validateLiveMatchCommand(session, command, rules);
  if (!validation.accepted) return { accepted: false, validation };

  if (command.type === "pause") {
    return {
      accepted: true,
      session: createLiveMatchSession({ ...session, runState: "paused", pauseReason: "manual" }, rules),
      facts: [],
    };
  }

  if (command.type === "resume") {
    const { pauseReason: _pauseReason, pendingDecision: _pendingDecision, ...resumed } = session;
    return {
      accepted: true,
      session: createLiveMatchSession({ ...resumed, runState: "running" }, rules),
      facts: [],
    };
  }

  return applyValidatedTeamChanges(session, command, rules);
}

function applyValidatedTeamChanges(
  session: LiveMatchSession,
  command: ApplyLiveMatchTeamChangesCommand,
  rules: CompetitionMatchRules,
): ApplyValidatedLiveMatchCommandResult {
  const currentTeam = command.side === "home" ? session.home : session.away;
  const appliedSubstitutions: AppliedMatchSubstitution[] = command.substitutions.map((substitution) => {
    const nextSlot = command.nextTeam.lineup.find((slot) => slot.playerId === substitution.incomingPlayerId);
    if (nextSlot === undefined) {
      throw new ProgressiveMatchSessionError(
        "invalid_team_side",
        `Validated substitution has no destination slot for ${substitution.incomingPlayerId}`,
      );
    }
    return {
      side: command.side,
      minute: session.currentMinute,
      outgoingPlayerId: substitution.outgoingPlayerId,
      incomingPlayerId: substitution.incomingPlayerId,
      slotId: nextSlot.slotId,
      reasonKey: substitution.reasonKey,
    };
  });
  const facts = teamChangeFacts(session.currentMinute, command.side, currentTeam, command.nextTeam, appliedSubstitutions);
  const substitutionEvents = appliedSubstitutions.map((substitution) => ({
    type: "substitution" as const,
    minute: substitution.minute,
    side: substitution.side,
    outgoingPlayerId: substitution.outgoingPlayerId,
    incomingPlayerId: substitution.incomingPlayerId,
    slotId: substitution.slotId,
    reasonKey: substitution.reasonKey,
  }));
  const nextSession = createLiveMatchSession({
    ...session,
    ...(command.side === "home" ? { home: command.nextTeam } : { away: command.nextTeam }),
    substitutions: [...session.substitutions, ...appliedSubstitutions],
    events: [...session.events, ...substitutionEvents],
  }, rules);

  return { accepted: true, session: nextSession, facts };
}

function teamChangeFacts(
  minute: number,
  side: MatchEventSide,
  currentTeam: LiveMatchTeamState,
  nextTeam: LiveMatchTeamState,
  substitutions: readonly AppliedMatchSubstitution[],
): readonly AppliedLiveMatchCommandFact[] {
  const facts: AppliedLiveMatchCommandFact[] = substitutions.map((substitution) => ({
    type: "substitution",
    substitution,
  }));

  if (currentTeam.formation !== nextTeam.formation) {
    facts.push({
      type: "formation_change",
      minute,
      side,
      fromFormation: currentTeam.formation,
      toFormation: nextTeam.formation,
    });
  }

  for (const nextSlot of nextTeam.lineup) {
    const currentSlot = currentTeam.lineup.find((slot) => slot.playerId === nextSlot.playerId);
    if (currentSlot !== undefined && currentSlot.role !== nextSlot.role) {
      facts.push({
        type: "role_change",
        minute,
        side,
        playerId: nextSlot.playerId,
        slotId: nextSlot.slotId,
        fromRole: currentSlot.role,
        toRole: nextSlot.role,
      });
    }
  }

  if (!sameTactic(currentTeam.tactic, nextTeam.tactic)) {
    facts.push({
      type: "tactic_change",
      minute,
      side,
      before: currentTeam.tactic,
      after: nextTeam.tactic,
    });
  }

  return facts;
}

function sameTactic(left: TacticSetup, right: TacticSetup): boolean {
  return left.mentality === right.mentality
    && left.pressing === right.pressing
    && left.directness === right.directness
    && left.width === right.width
    && left.risk === right.risk;
}

/** Builds an immutable public snapshot from already-completed session facts. */
export function createProgressiveMatchMinuteSnapshot(
  state: ProgressiveMatchSessionState,
): ProgressiveMatchMinuteSnapshot {
  const optionalPause = state.pauseReason === undefined ? {} : { pauseReason: state.pauseReason };
  return {
    phase: state.phase,
    currentMinute: state.simulation.minute,
    runState: state.runState,
    ...optionalPause,
    score: { ...state.simulation.score },
    stats: copyStats(state.simulation.stats),
    events: [...state.events],
    home: {
      team: copyTeam(state.simulation.context.home),
      ...copyTeamAvailability(state.availability.home),
    },
    away: {
      team: copyTeam(state.simulation.context.away),
      ...copyTeamAvailability(state.availability.away),
    },
    appliedSubstitutions: state.appliedSubstitutions.map((substitution) => ({ ...substitution })),
  };
}

/** Derives the five real regulation phases from completed engine minutes. */
export function progressiveMatchPhaseFor(simulation: MatchSimulationState): LiveMatchPhase {
  if (simulation.minute <= 0) return "pre_match";
  const halfTimeMinute = Math.floor(simulation.context.engineConfig.minuteCount / 2);
  if (simulation.minute < halfTimeMinute) return "first_half";
  if (simulation.minute === halfTimeMinute && simulation.minute < simulation.context.engineConfig.minuteCount) {
    return "half_time";
  }
  if (simulation.minute < simulation.context.engineConfig.minuteCount) return "second_half";
  return "full_time";
}

const EMPTY_TEAM_AVAILABILITY: ProgressiveMatchTeamAvailability = { bench: [], unavailable: [] };
const EMPTY_AVAILABILITY: ProgressiveMatchAvailability = {
  home: EMPTY_TEAM_AVAILABILITY,
  away: EMPTY_TEAM_AVAILABILITY,
};

function withoutPause(state: ProgressiveMatchSessionState): ProgressiveMatchSessionState {
  const { pauseReason: _pauseReason, ...running } = state;
  return running;
}

function withoutPendingDecision(state: ProgressiveMatchSessionState): ProgressiveMatchSessionState {
  const { pendingDecision: _pendingDecision, ...resolved } = state;
  return resolved;
}

function incidentPauseFor(
  state: ProgressiveMatchSessionState,
  events: readonly MatchStepEvent[],
): { readonly pauseReason: LiveMatchPauseReason; readonly pendingDecision: LiveMatchPendingDecision } | undefined {
  if (state.controlledSide === undefined) return undefined;
  const side = state.controlledSide;
  const forcedInjury = events.find(
    (event) => event.type === "injury" && event.side === side && (event.severity === "moderate" || event.severity === "serious"),
  );
  if (forcedInjury?.type === "injury") {
    return {
      pauseReason: "forced_injury",
      pendingDecision: {
        type: "forced_injury",
        minute: forcedInjury.minute,
        side,
        playerId: forcedInjury.playerId,
        severity: forcedInjury.severity,
      },
    };
  }

  const dismissal = events.find(
    (event) => (event.type === "red_card" || event.type === "second_yellow_card") && event.side === side,
  );
  if (dismissal?.type === "red_card" || dismissal?.type === "second_yellow_card") {
    return {
      pauseReason: "selected_club_red_card",
      pendingDecision: {
        type: "red_card_reorganization",
        minute: dismissal.minute,
        side,
        playerId: dismissal.playerId,
      },
    };
  }

  return undefined;
}

function availabilityAfterIncidents(
  availability: ProgressiveMatchAvailability,
  events: readonly MatchStepEvent[],
): ProgressiveMatchAvailability {
  let next = availability;
  for (const event of events) {
    if (event.type === "red_card" || event.type === "second_yellow_card") {
      next = addUnavailablePlayer(next, event.side, event.playerId, "dismissed");
    } else if (event.type === "injury" && (event.severity === "moderate" || event.severity === "serious")) {
      next = addUnavailablePlayer(next, event.side, event.playerId, "injured");
    }
  }
  return next;
}

function addUnavailablePlayer(
  availability: ProgressiveMatchAvailability,
  side: MatchEventSide,
  playerId: LiveMatchUnavailablePlayer["playerId"],
  reason: LiveMatchUnavailablePlayer["reason"],
): ProgressiveMatchAvailability {
  const current = side === "home" ? availability.home : availability.away;
  if (current.unavailable.some((player) => player.playerId === playerId)) return availability;
  const updated = { ...current, unavailable: [...current.unavailable, { playerId, reason }] };
  return withAvailability(availability, side, updated);
}

function teamForSide(context: MatchContext, side: MatchEventSide): MatchTeamContext {
  return side === "home" ? context.home : context.away;
}

function withTeam(context: MatchContext, side: MatchEventSide, team: MatchTeamContext): MatchContext {
  return side === "home" ? { ...context, home: team } : { ...context, away: team };
}

function withAvailability(
  availability: ProgressiveMatchAvailability,
  side: MatchEventSide,
  team: ProgressiveMatchTeamAvailability,
): ProgressiveMatchAvailability {
  return side === "home"
    ? { home: copyTeamAvailability(team), away: availability.away }
    : { home: availability.home, away: copyTeamAvailability(team) };
}

function copyAvailability(availability: ProgressiveMatchAvailability): ProgressiveMatchAvailability {
  return {
    home: copyTeamAvailability(availability.home),
    away: copyTeamAvailability(availability.away),
  };
}

function copyTeamAvailability(team: ProgressiveMatchTeamAvailability): ProgressiveMatchTeamAvailability {
  return {
    bench: team.bench.map((player) => ({ ...player })),
    unavailable: team.unavailable.map((player) => ({ ...player })),
  };
}

function copyTeam(team: MatchTeamContext): MatchTeamContext {
  return {
    ...team,
    lineup: team.lineup.map((slot) => ({ ...slot })),
    strength: { ...team.strength },
    tacticalDistribution: { ...team.tacticalDistribution },
    ...(team.incidentProfiles === undefined
      ? {}
      : { incidentProfiles: team.incidentProfiles.map((profile) => ({ ...profile })) }),
  };
}

function copyStats(stats: MatchSimulationState["stats"]): MatchSimulationState["stats"] {
  return {
    home: { ...stats.home },
    away: { ...stats.away },
    ...(stats.telemetry === undefined
      ? {}
      : {
          telemetry: {
            controlUnits: { ...stats.telemetry.controlUnits },
            stats: { home: { ...stats.telemetry.stats.home }, away: { ...stats.telemetry.stats.away } },
            playerCondition: { ...stats.telemetry.playerCondition },
            yellowCardsByPlayer: { ...stats.telemetry.yellowCardsByPlayer },
            injuriesByPlayer: { ...stats.telemetry.injuriesByPlayer },
          },
        }),
  };
}
