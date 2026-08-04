import {
  fieldablePlayerIdsFor,
  roleWeightKeyForCanonicalRole,
  advanceProgressiveMatchMinute,
  applyProgressiveAiInGameDecisions,
  applyConfirmedProgressiveTeamChanges,
  applyValidatedLiveMatchCommand,
  applyCareerWeeklyRecovery,
  buildLiveMatchProjection,
  buildMatchRngKey,
  buildPlayerMatchRatings,
  buildTacticTeamContext,
  commitCompletedCareerFixture,
  createLineupSlot,
  createMatchReport,
  createProgressiveMatchMinuteSnapshot,
  createProgressiveMatchSession,
  computePlayerMatchStats,
  DEFAULT_MATCH_LINEUP_SIZE,
  findNextCareerFixture,
  findNextFixtureEligibilityBlockers,
  injuryForcesExit,
  hasProgressiveAiInGameDecisionBoundary,
  matchRngKeyParts,
  pauseProgressiveMatchSession,
  resolveProgressiveMatchIncidentDecision,
  resumeProgressiveMatchSession,
  selectCareerAiTeam,
  type FixtureFieldedLineups,
  type LivePlayerMatchProjection,
  type MatchContext,
  type MatchSide,
  type MatchStepEvent,
  type MatchSubstitutionDecision,
  type MatchTeamContext,
  type PlayerMatchRatingRow,
  type ProgressiveMatchAvailability,
  type ProgressiveMatchMinuteSnapshot,
  type ProgressiveMatchSessionState,
  type ProgressCareerAiTeamSelectionInput,
  type ProgressCareerFixtureAdvanced,
} from "@game/engine";
import {
  createFakeGameplayConfig,
  selectMarketBehaviorCalibration,
  selectPlayerDevelopmentEnvironmentConfig,
  selectPlayerValuationConfig,
  selectPlayerWagePolicyConfig,
  type FakeGameplayConfig,
} from "@game/content";
import { deriveRng, toISO, type Rng } from "@game/shared";
import {
  buildCareerMatchdayPhaseView,
  buildCareerMatchdayView,
  type BuildCareerMatchdayPhaseViewInput,
  type BuildCareerMatchdayViewInput,
  type CareerMatchdayPhaseView,
  type CareerMatchdayView,
} from "@game/ui";

import {
  MATCH_PREPARATION_TACTIC_PROFILES,
  createMatchPreparationDraft,
  selectedMatchPreparationPlayerIds,
  type MatchPreparationDraft,
} from "../match-preparation/match-preparation-adapter";
import { TACTICAL_BENCH_SLOT_IDS } from "../tactics-board/tactical-board-bench";
import {
  tacticalBoardFormationPresets,
  tacticalBoardSlotsFromFormation,
} from "../tactics-board/tactical-board-formations";
import { canonicalRoleForBoardRole } from "../tactics-board/tactical-board-roles";
import type { TacticalBoardRoleCode } from "../tactics-board/tactical-board-types";

import type { WebCareerState as CareerState } from "../../runtime/web-career-runtime";

type GameState = CareerState["gameState"];
type DomesticCompetitionWorld = NonNullable<GameState["domesticCompetitionWorld"]>;
type CompetitionMatchRules = DomesticCompetitionWorld["competitions"][
  DomesticCompetitionWorld["competitionIds"][number]
]["matchRules"];
type ClubId = CareerState["selectedClubId"];
type FixtureId = GameState["fixtureIds"][number];
type Fixture = GameState["fixtures"][FixtureId];
type PlayerId = GameState["playerIds"][number];
type Player = GameState["players"][PlayerId];
type MatchReport = ProgressCareerFixtureAdvanced["report"];
type MatchEvent = MatchReport["events"][number];
type MatchPlayerConsequence = CareerMatchdayPhaseView["availabilityConsequences"][number];
type MatchEventSide = "home" | "away";
type DomainLiveMatchSession = Parameters<typeof applyValidatedLiveMatchCommand>[0];
type LiveMatchTeamState = DomainLiveMatchSession["home"];
type AppliedMatchSubstitution = DomainLiveMatchSession["substitutions"][number];
type FormationKey = LiveMatchTeamState["formation"];
type TacticSetup = LiveMatchTeamState["tactic"];
type MatchdayFixtureEligibilityBlocker = ReturnType<typeof findNextFixtureEligibilityBlockers>[number];
type LiveMatchPendingDecision = NonNullable<
  NonNullable<BuildCareerMatchdayPhaseViewInput["liveControl"]>["pendingDecision"]
>;
type MatchdayContentConfig = Pick<
  FakeGameplayConfig,
  "matchEngineConfig" | "matchTacticsCalibration" | "roleWeights" | "stateMultiplierCurves"
> & {
  readonly competitionMatchRules: CompetitionMatchRules;
};

const REQUIRED_BENCH_SIZE = 8;

/** Stable validation blockers for the persisted web matchday adapter. */
export type WebMatchdayBlockerKey =
  | "missing_saved_lineup"
  | "missing_saved_bench"
  | "missing_saved_tactic"
  | "already_played";

/** Last action state stored by the browser adapter. */
export type WebMatchdayPlayStatus = "idle" | "blocked" | "advanced" | "invalid" | "none" | "already_played";

/** Current live-session status projected by the browser adapter. */
export type WebMatchdaySessionStatus =
  | "idle"
  | "blocked"
  | "ready"
  | "running"
  | "paused"
  | "full_time"
  | "invalid"
  | "already_played";

/** A single-use web matchday play attempt. */
export interface WebMatchdayPlayAttempt {
  /** Machine-readable play state. */
  readonly status: WebMatchdayPlayStatus;
  /** Stable blockers when the manager has not prepared the match. */
  readonly blockerKeys: readonly WebMatchdayBlockerKey[];
  /** Fixture connected to this attempt when known. */
  readonly fixtureId?: string;
  /** Engine invalid reason when progression refuses to run. */
  readonly invalidReason?: string;
}

/** String-based substitution decision accepted by the shared live team-control surface. */
export interface WebMatchdaySubstitutionDecision {
  /** Player currently on the pitch who should leave. */
  readonly outgoingPlayerId: string;
  /** Bench player who should enter. */
  readonly incomingPlayerId: string;
}

/** Player option shown by the shared live team-control surface. */
export interface WebMatchdayTeamControlPlayerOption {
  /** Stable player identifier. */
  readonly playerId: string;
  /** Existing generated display name. */
  readonly playerName: string;
  /** Broad role key used by localized role labels. */
  readonly roleKey?: string;
  /** Provisional match rating when available. */
  readonly rating?: number;
  /** Current fitness/condition when available. */
  readonly condition?: number;
  /** Fixed bench identity when this player is currently a substitute. */
  readonly benchSlotId?: string;
  /** Canonical availability prevents substituted players from re-entering. */
  readonly availability?: "available" | "substituted_out" | "dismissed" | "injured";
}

/** Applied substitution row for the shared live team-control surface. */
export interface WebMatchdayAppliedSubstitutionView {
  /** Player who left the pitch. */
  readonly outgoingPlayerName: string;
  /** Player who entered the pitch. */
  readonly incomingPlayerName: string;
}

/** Web-specific live team-control facts derived from the private session projection. */
export interface WebMatchdayTeamControlPanel {
  /** Whether the shared board is editable, view-only, or outside a live phase. */
  readonly status: "editable" | "view_only" | "unavailable";
  /** Selected-club on-pitch players. */
  readonly lineup: readonly WebMatchdayTeamControlPlayerOption[];
  /** Selected-club fixed bench slots, including disabled substituted-out players. */
  readonly bench: readonly WebMatchdayTeamControlPlayerOption[];
  /** Dismissed or forced-off players shown outside the active team. */
  readonly outside: readonly WebMatchdayTeamControlPlayerOption[];
  /** Applied substitution summary rows. */
  readonly appliedSubstitutions: readonly WebMatchdayAppliedSubstitutionView[];
  /** Already applied substitutions. */
  readonly appliedCount: number;
  /** Maximum v1 regulation substitutions. */
  readonly maxCount: number;
  /** Last adapter/engine validation reason, when an apply attempt failed. */
  readonly validationReason?: string;
  /** Structured tactical decision fact keys, when validation failed. */
  readonly validationFactKeys?: readonly string[];
}

/** Last live-session action projected by the browser adapter. */
export interface WebMatchdaySessionAttempt {
  /** Machine-readable session state. */
  readonly status: WebMatchdaySessionStatus;
  /** Stable blockers when the manager has not prepared the match. */
  readonly blockerKeys: readonly WebMatchdayBlockerKey[];
  /** Fixture connected to this attempt when known. */
  readonly fixtureId?: string;
  /** Engine invalid reason when the progressive live session refuses to run. */
  readonly invalidReason?: string;
  /** Structured tactical-plan facts when second-half decision validation fails. */
  readonly invalidFactKeys?: readonly string[];
  /** Exact selected players who cannot enter the fixture. */
  readonly eligibilityBlockers?: readonly MatchdayFixtureEligibilityBlocker[];
}

/** Successful persisted web matchday commit. */
export type WebMatchdayAdvancedResult = ProgressCareerFixtureAdvanced;

/** Presentation-only facts copied from the private progressive session. */
export interface WebLiveMatchdayProgress {
  /** Fixture before any result is applied. */
  readonly fixtureBefore: Fixture;
  /** Selected-club side for this fixture. */
  readonly selectedSide: MatchSide;
  /** Selected-club bench available for half-time substitutions. */
  readonly selectedBenchPlayerIds: readonly PlayerId[];
  /** Current selected-club tactical facts; this is a copy, never runtime authority. */
  readonly selectedTeam: LiveMatchTeamState;
  /** Current immutable minute snapshot. It contains no RNG or writable engine state. */
  readonly snapshot: ProgressiveMatchMinuteSnapshot;
  /** Canonical cumulative statistics from the same immutable engine minute. */
  readonly statistics: BuildCareerMatchdayPhaseViewInput["statistics"];
  /** Canonical live ratings and condition derived once for the current minute. */
  readonly playerRatings: readonly LivePlayerMatchProjection[];
  /** Required incident decision, when automatic play stopped for the manager. */
  readonly pendingDecision?: LiveMatchPendingDecision;
  /** Final review facts calculated once without publishing the resulting career state. */
  readonly fullTimeReview?: WebLiveMatchdayFullTimeReview;
}

/** Minimal public projection of the private full-time commit preview. */
export interface WebLiveMatchdayFullTimeReview {
  /** Selected-club condition changes that will be committed by `Continua`. */
  readonly conditionChanges: NonNullable<BuildCareerMatchdayPhaseViewInput["conditionChanges"]>;
  /** Selected-club form and morale changes that will be committed by `Continua`. */
  readonly playerStateChanges: NonNullable<BuildCareerMatchdayPhaseViewInput["playerStateChanges"]>;
  /** Public injury and suspension outcomes for both fixture sides. */
  readonly availabilityConsequences: readonly MatchPlayerConsequence[];
}

/**
 * Private in-memory match session owned exclusively by `WebCareerRuntime`.
 *
 * This type must never be placed in Zustand or passed to React. Refreshing the
 * browser deliberately discards it and restarts the uncommitted fixture.
 */
export interface WebLiveMatchdaySession {
  readonly careerState: CareerState;
  readonly fixtureBefore: Fixture;
  readonly selectedSide: MatchSide;
  readonly selectedBenchPlayerIds: readonly PlayerId[];
  /** Canonical detailed team states kept only for atomic paused-match commands. */
  readonly homeTeam: LiveMatchTeamState;
  readonly awayTeam: LiveMatchTeamState;
  readonly engineState: ProgressiveMatchSessionState;
  readonly rng: Rng;
  /** Canonical pure commit result cached at full time and applied only by `Continua`. */
  readonly completionPreview?: ProgressCareerFixtureAdvanced;
  /** Stable preview failure retained so `Continua` can fail without recalculating. */
  readonly completionFailureReason?: string;
  /** Last rejected command facts, cleared by the next accepted command. */
  readonly commandRejectionCodes?: readonly string[];
}

/** Result of one atomic paused-match tactical command. */
export type ApplyWebLiveMatchTeamChangesResult =
  | { readonly status: "applied"; readonly session: WebLiveMatchdaySession }
  | {
      readonly status: "invalid";
      readonly session: WebLiveMatchdaySession;
      readonly rejectionCodes: readonly string[];
    };

/** Result of trying to create the private live session from saved preparation. */
export type CreateWebLiveMatchdaySessionResult =
  | {
      readonly status: "ready";
      readonly session: WebLiveMatchdaySession;
      readonly matchdayState: WebMatchdayState;
    }
  | {
      readonly status: "blocked" | "invalid";
      readonly matchdayState: WebMatchdayState;
    };

/** Result of one exact, memory-only live minute request. */
export interface AdvanceWebLiveMatchdayMinuteResult {
  readonly session: WebLiveMatchdaySession;
  readonly matchdayState: WebMatchdayState;
}

/** Presentation state rebuilt from durable career facts after every command. */
export interface WebMatchdayState {
  /** Current loaded career state. */
  readonly careerState: CareerState;
  /** Last structured play attempt. */
  readonly lastPlayAttempt: WebMatchdayPlayAttempt;
  /** Last private-session command projected for UI feedback. */
  readonly lastSessionAttempt: WebMatchdaySessionAttempt;
  /** Read-only live facts; authoritative engine state remains in the runtime. */
  readonly liveProgress?: WebLiveMatchdayProgress;
  /** Played fixture result, set only after the first successful play. */
  readonly playedResult?: WebMatchdayAdvancedResult;
}

const asPlayerId = (value: string): PlayerId => value as PlayerId;

/** Rebuilds matchday presentation state from one validated durable career. */
export function createWebMatchdayState(
  careerState: CareerState,
  explicitPlayedResult?: WebMatchdayAdvancedResult,
  liveSession?: WebLiveMatchdaySession,
): WebMatchdayState {
  const playedResult = explicitPlayedResult ?? rehydrateReviewedResult(careerState);
  const liveProgress = liveSession === undefined ? undefined : projectLiveProgress(liveSession);

  return {
    careerState,
    lastPlayAttempt: {
      status: playedResult === undefined ? "idle" : "advanced",
      blockerKeys: [],
      ...(playedResult === undefined ? {} : { fixtureId: playedResult.fixtureId }),
    },
    lastSessionAttempt: {
      status: liveSession?.commandRejectionCodes !== undefined
        ? "invalid"
        : playedResult !== undefined
        ? "full_time"
        : liveProgress?.snapshot.runState === "running"
          ? "running"
          : liveProgress === undefined
            ? "idle"
            : liveProgress.snapshot.phase === "full_time"
              ? "full_time"
            : liveProgress.snapshot.phase === "pre_match"
              ? "ready"
              : "paused",
      blockerKeys: [],
      ...(liveSession?.commandRejectionCodes === undefined
        ? {}
        : {
            invalidReason: liveSession.commandRejectionCodes[0] ?? "invalid_live_team_change",
            invalidFactKeys: [...liveSession.commandRejectionCodes],
          }),
      ...(playedResult === undefined ? {} : { fixtureId: playedResult.fixtureId }),
    },
    ...(liveProgress === undefined ? {} : { liveProgress }),
    ...(playedResult === undefined ? {} : { playedResult }),
  };
}

/** Rebuilds full-time presentation from the played fixture still awaiting review. */
function rehydrateReviewedResult(careerState: CareerState): WebMatchdayAdvancedResult | undefined {
  const fixtureId = careerState.matchPreparation?.targetFixtureId;
  if (fixtureId === undefined) return undefined;
  const fixtureAfter = careerState.gameState.fixtures[fixtureId];
  const report = fixtureAfter?.result?.report;
  if (fixtureAfter === undefined || report === undefined) return undefined;
  const { result: _playedResult, ...fixtureBefore } = fixtureAfter;

  return {
    status: "advanced",
    fixtureId,
    fixtureBefore,
    fixtureAfter,
    report,
    fieldedLineups: rehydratedFieldedLineups(careerState, fixtureAfter),
    conditionChanges: [],
    playerAvailabilityConsequences: [],
    playerStateConsequences: [],
    playerStateConsequenceSummary: {
      changedPlayerCount: 0,
      totalFormDelta: 0,
      totalMoraleDelta: 0,
    },
    financeLedgerEntryIds: [],
    monthlyLifecycle: [],
    careerState,
  };
}

/**
 * Recovers the elevens a reloaded page can still prove were fielded.
 *
 * The manager's own eleven is durable, so it comes back exactly. The opponent's
 * is not: it was chosen from a squad whose fitness and availability the played
 * match has already changed, so re-selecting it now would produce a different
 * team and call it history. Its footballers still appear in the full-time table
 * through the events they were part of, which is the only durable record there
 * is of who played for them.
 *
 * This joins the fields `rehydrateReviewedResult` already returns empty. What is
 * not saved is not recoverable, and guessing it is worse than leaving it out.
 */
function rehydratedFieldedLineups(careerState: CareerState, fixture: Fixture): FixtureFieldedLineups {
  const selectedSlots = (careerState.matchPreparation?.selectedLineup?.slots ?? []).map((slot) =>
    createLineupSlot({
      slotId: slot.slotKey,
      playerId: slot.playerId,
      canonicalRole: slot.canonicalRole,
    }),
  );
  const isSelectedHome = fixture.homeClubId === careerState.selectedClubId;

  return {
    home: isSelectedHome ? selectedSlots : [],
    away: isSelectedHome ? [] : selectedSlots,
  };
}

/** Creates a deterministic pre-match session without writing an active checkpoint. */
export function createWebLiveMatchdaySession(careerState: CareerState): CreateWebLiveMatchdaySessionResult {
  const preparation = createMatchPreparationDraft(careerState);
  const initial = createWebMatchdayState(careerState);
  const kickoff = prepareWebMatchdayKickoff(careerState, preparation);
  if (kickoff.status !== "ready") {
    return {
      status: kickoff.status,
      matchdayState: { ...initial, lastSessionAttempt: kickoff.attempt },
    };
  }
  const selectedSide = kickoff.fixture.homeClubId === kickoff.recoveredCareerState.selectedClubId ? "home" : "away";
  const availability = buildProgressiveAvailability(
    kickoff.recoveredCareerState,
    kickoff.fixture,
    selectedSide,
    kickoff.opponentBenchPlayerIds,
  );
  const engineState = createProgressiveMatchSession(kickoff.matchContext, availability, {
    controlledSide: selectedSide,
  });
  const rngKey = buildMatchRngKey(kickoff.matchContext);
  const session: WebLiveMatchdaySession = {
    careerState: kickoff.recoveredCareerState,
    fixtureBefore: kickoff.fixture,
    selectedSide,
    selectedBenchPlayerIds: selectedBenchPlayerIds(kickoff.recoveredCareerState),
    ...initialLiveTeams(
      kickoff.recoveredCareerState,
      preparation,
      selectedSide,
      engineState,
    ),
    engineState,
    rng: deriveRng(rngKey.seed, rngKey.streamName, ...matchRngKeyParts(rngKey)),
  };

  return {
    status: "ready",
    session,
    matchdayState: createWebMatchdayState(session.careerState, undefined, session),
  };
}

/** Starts or resumes play without advancing the match clock. */
export function resumeWebLiveMatchday(session: WebLiveMatchdaySession): WebLiveMatchdaySession {
  return withEngineState(session, resumeProgressiveMatchSession(session.engineState));
}

/** Requests a manual pause after the latest fully completed minute. */
export function pauseWebLiveMatchday(session: WebLiveMatchdaySession): WebLiveMatchdaySession {
  return withEngineState(session, pauseProgressiveMatchSession(session.engineState));
}

/** Resolves the current automatic incident decision without resuming play. */
export function resolveWebLiveMatchdayIncident(
  session: WebLiveMatchdaySession,
  action: "acknowledge",
): WebLiveMatchdaySession {
  return withEngineState(session, resolveProgressiveMatchIncidentDecision(session.engineState, { action }));
}

/** Advances exactly one engine minute without publishing career consequences. */
export function advanceWebLiveMatchdayMinute(
  session: WebLiveMatchdaySession,
): AdvanceWebLiveMatchdayMinuteResult {
  const engineState = advanceProgressiveMatchMinute(session.engineState, session.rng);
  const progressedSession = applyOpponentAiInGameDecisions(withEngineState(session, engineState));
  const advancedSession = progressedSession.engineState.phase === "full_time"
    ? withCompletionPreview(progressedSession)
    : progressedSession;

  return {
    session: advancedSession,
    matchdayState: createWebMatchdayState(session.careerState, undefined, advancedSession),
  };
}

/** Applies opponent decisions only at canonical incident or tactical boundaries. */
function applyOpponentAiInGameDecisions(session: WebLiveMatchdaySession): WebLiveMatchdaySession {
  const opponentSide: MatchEventSide = session.selectedSide === "home" ? "away" : "home";
  if (!hasProgressiveAiInGameDecisionBoundary(session.engineState, opponentSide)) return session;

  const progress = projectLiveProgress(session);
  const rules = matchdayContentConfig(session.careerState).competitionMatchRules;
  const applied = applyProgressiveAiInGameDecisions({
    state: session.engineState,
    session: toDomainLiveSession(session, progress),
    side: opponentSide,
    rules,
    players: session.careerState.gameState.players,
    playerSignals: progress.playerRatings.map((player) => ({
      playerId: player.playerId,
      rating: player.rating,
      condition: player.condition,
    })),
    buildMatchTeamContext: (team) => matchTeamContextFromLiveTeam(session, team),
  });

  return {
    ...withEngineState(session, applied.state),
    ...(opponentSide === "home" ? { homeTeam: applied.team } : { awayTeam: applied.team }),
  };
}

/** Applies one completed in-memory match exactly once when the manager continues. */
export function commitWebLiveMatchday(
  session: WebLiveMatchdaySession,
): ProgressCareerFixtureAdvanced | { readonly status: "invalid"; readonly reason: string } {
  if (session.engineState.phase !== "full_time") {
    return { status: "invalid", reason: "live_match_not_complete" };
  }

  if (session.completionPreview !== undefined) {
    return session.completionPreview;
  }
  if (session.completionFailureReason !== undefined) {
    return { status: "invalid", reason: session.completionFailureReason };
  }

  return commitProgressiveWebMatchday(session);
}

/** Applies one complete paused-match board draft through the canonical command. */
export function applyWebLiveMatchTeamChanges(
  session: WebLiveMatchdaySession,
  preparation: MatchPreparationDraft,
): ApplyWebLiveMatchTeamChangesResult {
  const currentTeam = selectedLiveTeam(session);
  const nextTeam = liveTeamFromDraft(session, currentTeam, preparation);
  const substitutions = deriveLiveSubstitutionDecisions(session, currentTeam, nextTeam);
  const rules = matchdayContentConfig(session.careerState).competitionMatchRules;
  const validation = applyValidatedLiveMatchCommand(
    toDomainLiveSession(session),
    {
      type: "apply_team_changes",
      side: session.selectedSide,
      substitutions,
      nextTeam,
    },
    rules,
  );

  if (!validation.accepted) {
    const rejectedValidation = validation.validation;
    const rejectionCodes = rejectedValidation.accepted
      ? ["invalid_team_state"]
      : rejectedValidation.rejections.map((rejection) => rejection.code);
    return {
      status: "invalid",
      rejectionCodes,
      session: { ...session, commandRejectionCodes: rejectionCodes },
    };
  }

  const appliedSubstitutions = validation.facts.flatMap((fact): readonly AppliedMatchSubstitution[] =>
    fact.type === "substitution" ? [fact.substitution] : [],
  );
  let engineState = applyConfirmedProgressiveTeamChanges(session.engineState, {
    side: session.selectedSide,
    team: matchTeamContextFromLiveTeam(session, nextTeam),
    availability: {
      bench: nextTeam.bench,
      unavailable: nextTeam.unavailable,
    },
    substitutions: appliedSubstitutions,
  });
  if (engineState.pendingDecision !== undefined && engineState.pendingDecision.type !== "half_time") {
    engineState = resolveProgressiveMatchIncidentDecision(engineState, { action: "acknowledge" });
  }

  const acceptedSession: WebLiveMatchdaySession = {
    ...session,
    engineState,
    ...(session.selectedSide === "home" ? { homeTeam: nextTeam } : { awayTeam: nextTeam }),
  };
  const { commandRejectionCodes: _rejections, ...cleanSession } = acceptedSession;
  return { status: "applied", session: cleanSession };
}

/** Builds a framework-free matchday view from current durable facts. */
export function buildWebMatchdayView(
  state: WebMatchdayState,
  preparation?: MatchPreparationDraft,
): CareerMatchdayView {
  return buildCareerMatchdayView(buildWebMatchdayInput(state, preparation));
}

/** Builds the phase-aware `@game/ui` view for the durable matchday state. */
export function buildWebMatchdayPhaseView(state: WebMatchdayState): CareerMatchdayPhaseView {
  return buildCareerMatchdayPhaseView(buildWebMatchdayPhaseInput(state));
}

/** Builds shared paused/running team-control facts from the public live snapshot. */
export function buildWebMatchdayTeamControlPanel(state: WebMatchdayState): WebMatchdayTeamControlPanel {
  const liveProgress = state.liveProgress;
  const validationReason = state.lastSessionAttempt.status === "invalid" ? state.lastSessionAttempt.invalidReason : undefined;
  const validationFactKeys = state.lastSessionAttempt.status === "invalid" ? state.lastSessionAttempt.invalidFactKeys : undefined;

  const phase = liveProgress?.snapshot.phase;
  const isLivePhase = phase === "first_half" || phase === "half_time" || phase === "second_half";
  if (liveProgress === undefined || !isLivePhase) {
    return {
      status: "unavailable",
      lineup: [],
      bench: [],
      outside: [],
      appliedSubstitutions: [],
      appliedCount: 0,
      maxCount: 5,
      ...(validationReason === undefined ? {} : { validationReason }),
      ...(validationFactKeys === undefined ? {} : { validationFactKeys }),
    };
  }

  const selectedLineup = liveProgress.selectedTeam.lineup;
  const selectedLineupIds = new Set(selectedLineup.map((slot) => slot.playerId));
  const ratingByPlayerId = new Map(livePlayerRatings(liveProgress).map((rating) => [rating.playerId, rating]));
  const lineup = selectedLineup
    .map((slot) => teamControlPlayerOption(state.careerState, liveProgress, slot.playerId, slot.role, ratingByPlayerId))
    .toSorted(compareOutgoingSubstitutionOptions);
  const bench = liveProgress.selectedTeam.bench
    .filter((benchSlot) => !selectedLineupIds.has(benchSlot.playerId))
    .map((benchSlot) => ({
      ...teamControlPlayerOption(
      state.careerState,
      liveProgress,
      benchSlot.playerId,
      playerBroadRoleKey(state.careerState.gameState.players[benchSlot.playerId]),
      ratingByPlayerId,
      ),
      benchSlotId: benchSlot.slotId,
      availability: benchSlot.status,
    }))
    .toSorted(compareIncomingSubstitutionOptions);
  const pendingOutside = liveProgress.pendingDecision?.playerId === undefined
    ? []
    : [{
        playerId: liveProgress.pendingDecision.playerId,
        reason: liveProgress.pendingDecision.type === "red_card_reorganization"
          ? "dismissed" as const
          : "injured" as const,
      }];
  const outside = [...liveProgress.selectedTeam.unavailable, ...pendingOutside]
    .filter((entry, index, entries) => entries.findIndex((candidate) => candidate.playerId === entry.playerId) === index)
    .map((entry) => ({
      ...teamControlPlayerOption(
        state.careerState,
        liveProgress,
        entry.playerId,
        playerBroadRoleKey(state.careerState.gameState.players[entry.playerId]),
        ratingByPlayerId,
      ),
      availability: entry.reason,
    }));

  return {
    status: liveProgress.snapshot.runState === "running" ? "view_only" : "editable",
    lineup,
    bench,
    outside,
    appliedSubstitutions: liveProgress.snapshot.appliedSubstitutions.map((substitution) => ({
      outgoingPlayerName: playerName(state.careerState, substitution.outgoingPlayerId),
      incomingPlayerName: playerName(state.careerState, substitution.incomingPlayerId),
    })),
    appliedCount: liveProgress.snapshot.appliedSubstitutions.length,
    maxCount: 5,
    ...(validationReason === undefined ? {} : { validationReason }),
    ...(validationFactKeys === undefined ? {} : { validationFactKeys }),
  };
}

/** Builds the explicit `@game/ui` input for current durable matchday facts. */
export function buildWebMatchdayInput(
  state: WebMatchdayState,
  preparation?: MatchPreparationDraft,
): BuildCareerMatchdayViewInput {
  const currentFixture = state.playedResult?.fixtureBefore ?? nextFixtureOrUndefined(state.careerState);
  const selectedClub = state.careerState.gameState.clubs[state.careerState.selectedClubId];

  return {
    saveId: state.careerState.saveId,
    currentDateIso: toISO(state.careerState.gameState.calendar.currentDate),
    selectedClub: {
      clubId: state.careerState.selectedClubId,
      name: selectedClub?.name ?? state.careerState.selectedClubId,
    },
    ...(currentFixture === undefined ? {} : { fixture: fixtureInput(state.careerState, currentFixture) }),
    preparation: {
      hasSavedLineup: preparation?.isSaved === true && completeLineupCount(preparation) === DEFAULT_MATCH_LINEUP_SIZE,
      hasSavedTactic: preparation?.isSaved === true && preparation.selectedTacticProfileId !== undefined,
      ...(currentFixture === undefined ? {} : { targetFixtureId: currentFixture.id }),
    },
    ...(state.playedResult === undefined ? {} : { result: resultInput(state.playedResult) }),
    ...(state.playedResult === undefined
      ? {}
      : {
          nextStop: {
            reason: "dashboard",
            dateIso: toISO(state.playedResult.careerState.gameState.calendar.currentDate),
            actionId: "back_to_dashboard",
          },
        }),
  };
}

function buildWebMatchdayPhaseInput(state: WebMatchdayState): BuildCareerMatchdayPhaseViewInput {
  const liveProgress = state.liveProgress;
  const playedResult = state.playedResult;
  const fixture = playedResult?.fixtureBefore ?? liveProgress?.fixtureBefore ?? nextFixtureOrUndefined(state.careerState);

  if (fixture === undefined) {
    throw new Error("Cannot build matchday phase view without a fixture");
  }

  const snapshot = liveProgress?.snapshot;
  const phaseEvents = playedResult !== undefined
    ? eventInputs(
        playedResult,
        clubInput(playedResult.careerState, playedResult.fixtureAfter.homeClubId),
        clubInput(playedResult.careerState, playedResult.fixtureAfter.awayClubId),
      )
    : liveProgress === undefined || snapshot === undefined
      ? []
      : phaseEventInputs(state.careerState, liveProgress, snapshot.events);
  const phasePlayers = playedResult !== undefined
    ? completedPhasePlayerInputs(playedResult)
    : liveProgress === undefined || snapshot === undefined
      ? []
      : phasePlayerInputs(state.careerState, liveProgress, livePlayerRatings(liveProgress));
  const fullTimeReview = liveProgress?.fullTimeReview;
  const isFullTime = playedResult !== undefined || snapshot?.phase === "full_time";

  return {
    saveId: state.careerState.saveId,
    currentDateIso: toISO(state.careerState.gameState.calendar.currentDate),
    selectedClub: clubInput(state.careerState, state.careerState.selectedClubId),
    fixture: fixtureInput(state.careerState, fixture),
    phase: playedResult === undefined ? snapshot?.phase ?? "pre_match" : "full_time",
    currentMinute: playedResult?.report.finalMinute ?? snapshot?.currentMinute ?? 0,
    scoreboard: {
      homeGoals: playedResult?.report.score.home ?? snapshot?.score.home ?? 0,
      awayGoals: playedResult?.report.score.away ?? snapshot?.score.away ?? 0,
    },
    ...(liveProgress?.statistics === undefined ? {} : { statistics: liveProgress.statistics }),
    events: phaseEvents,
    players: phasePlayers,
    halfTimeSubstitutions: {
      canApply: snapshot?.phase === "half_time",
      appliedCount: snapshot?.appliedSubstitutions.length ?? 0,
      maxCount: 5,
    },
    ...(liveProgress === undefined
      ? {}
      : {
          liveControl: {
            runState: snapshot?.runState ?? "paused",
            ...(snapshot?.pauseReason === undefined ? {} : { pauseReason: snapshot.pauseReason }),
            ...(liveProgress.pendingDecision === undefined ? {} : { pendingDecision: liveProgress.pendingDecision }),
          },
        }),
    ...(playedResult === undefined && fullTimeReview === undefined
      ? {}
      : {
          conditionChanges: playedResult === undefined
            ? fullTimeReview!.conditionChanges
            : resultInput(playedResult).conditionChanges,
          playerStateChanges: playedResult === undefined
            ? fullTimeReview!.playerStateChanges
            : resultInput(playedResult).playerStateChanges,
          availabilityConsequences: playedResult === undefined
            ? fullTimeReview!.availabilityConsequences
            : playedResult.playerAvailabilityConsequences,
        }),
    ...(isFullTime ? { nextActionId: "back_to_dashboard" as const } : {}),
  };
}

/** Rebuilds final ratings from the durable report so full time survives reload. */
function completedPhasePlayerInputs(
  result: WebMatchdayAdvancedResult,
): BuildCareerMatchdayPhaseViewInput["players"] {
  const registrations = finalPlayerRegistrations(result);
  const roleByPlayerId = new Map(registrations.map((registration) => [registration.playerId, registration.roleKey]));

  return buildPlayerMatchRatings({
    events: matchStepEventsFromReport(result.report),
    playerRegistrations: registrations,
  }).map((rating) => {
    const clubId = rating.side === "home" ? result.fixtureAfter.homeClubId : result.fixtureAfter.awayClubId;
    const condition = result.careerState.gameState.playerStates[rating.playerId]?.fitness;
    const roleKey = roleByPlayerId.get(rating.playerId);

    return {
      playerId: rating.playerId,
      playerName: playerName(result.careerState, rating.playerId),
      club: clubInput(result.careerState, clubId),
      ...(roleKey === undefined ? {} : { roleKey }),
      rating: rating.rating,
      ...(condition === undefined ? {} : { condition }),
      status: "on_pitch" as const,
      goals: rating.goals,
      assists: rating.assists,
      shots: rating.shots,
      shotsOnTarget: rating.shotsOnTarget,
      saves: rating.saves,
      blocks: rating.blocks,
    };
  });
}

/** Converts persisted report events back into the engine rating event contract. */
function matchStepEventsFromReport(report: MatchReport): readonly MatchStepEvent[] {
  return report.events.flatMap((event): readonly MatchStepEvent[] => {
    switch (event.type) {
      case "kickoff":
      case "half_time":
      case "full_time":
        return [event];
      case "goal":
        return [{
          type: "shot_outcome",
          minute: event.shot.minute,
          side: event.shot.side,
          outcome: "goal",
          quality: event.shot.quality,
          isShotOnTarget: event.shot.isShotOnTarget,
          shotType: event.shot.shotType,
          chanceType: event.shot.chanceType,
          ...(event.shot.route === undefined ? {} : { route: event.shot.route }),
          scorerPlayerId: event.scorerPlayerId,
          ...(event.assistPlayerId === undefined ? {} : { assistPlayerId: event.assistPlayerId }),
          ...(event.creatorPlayerId === undefined ? {} : { creatorPlayerId: event.creatorPlayerId }),
        }];
      case "save":
        return event.shooterPlayerId === undefined ? [] : [{
          type: "shot_outcome",
          minute: event.shot.minute,
          side: event.shot.side,
          outcome: "save",
          quality: event.shot.quality,
          isShotOnTarget: event.shot.isShotOnTarget,
          shotType: event.shot.shotType,
          chanceType: event.shot.chanceType,
          ...(event.shot.route === undefined ? {} : { route: event.shot.route }),
          shooterPlayerId: event.shooterPlayerId,
          goalkeeperPlayerId: event.goalkeeperPlayerId,
        }];
      case "miss":
        return event.shooterPlayerId === undefined ? [] : [{
          type: "shot_outcome",
          minute: event.shot.minute,
          side: event.shot.side,
          outcome: "miss",
          quality: event.shot.quality,
          isShotOnTarget: event.shot.isShotOnTarget,
          shotType: event.shot.shotType,
          chanceType: event.shot.chanceType,
          ...(event.shot.route === undefined ? {} : { route: event.shot.route }),
          shooterPlayerId: event.shooterPlayerId,
        }];
      case "block":
        return event.shooterPlayerId === undefined ? [] : [{
          type: "shot_outcome",
          minute: event.shot.minute,
          side: event.shot.side,
          outcome: "block",
          quality: event.shot.quality,
          isShotOnTarget: event.shot.isShotOnTarget,
          shotType: event.shot.shotType,
          chanceType: event.shot.chanceType,
          ...(event.shot.route === undefined ? {} : { route: event.shot.route }),
          shooterPlayerId: event.shooterPlayerId,
          ...(event.primaryDefenderPlayerId === undefined ? {} : { primaryDefenderPlayerId: event.primaryDefenderPlayerId }),
        }];
      case "foul":
      case "yellow_card":
      case "second_yellow_card":
      case "red_card":
      case "penalty_awarded":
      case "penalty_outcome":
      case "injury":
      case "substitution":
        return [event];
    }
  });
}

type WebMatchdayKickoffPrepared =
  | {
      readonly status: "ready";
      readonly fixture: Fixture;
      readonly recoveredCareerState: CareerState;
      /** Substitutes the opponent's own selection chose, in its own order. */
      readonly opponentBenchPlayerIds: readonly PlayerId[];
      readonly matchContext: MatchContext;
    }
  | {
      readonly status: "blocked" | "invalid";
      readonly attempt: WebMatchdaySessionAttempt;
    };

function prepareWebMatchdayKickoff(
  careerState: CareerState,
  preparation: MatchPreparationDraft,
): WebMatchdayKickoffPrepared {
  const preparationBlockers = validatePreparation(preparation);

  if (preparationBlockers.length > 0) {
    return {
      status: "blocked",
      attempt: {
        status: "blocked",
        blockerKeys: preparationBlockers,
      },
    };
  }

  const preparedCareerState = careerState;
  const nextFixture = findNextCareerFixture(preparedCareerState);

  if (nextFixture.status !== "found") {
    return {
      status: "invalid",
      attempt: {
        status: "invalid",
        blockerKeys: [],
        ...(nextFixture.status === "invalid" ? { invalidReason: nextFixture.reason } : { invalidReason: "none" }),
        ...("fixtureId" in nextFixture && nextFixture.fixtureId !== undefined ? { fixtureId: nextFixture.fixtureId } : {}),
      },
    };
  }

  const eligibilityBlockers = findNextFixtureEligibilityBlockers(
    preparedCareerState,
    selectedMatchPreparationPlayerIds(preparedCareerState, preparation),
  );
  if (eligibilityBlockers.length > 0) {
    return {
      status: "blocked",
      attempt: {
        status: "blocked",
        blockerKeys: [],
        fixtureId: nextFixture.fixtureId,
        eligibilityBlockers,
      },
    };
  }

  const selectedClub = preparedCareerState.gameState.clubs[preparedCareerState.selectedClubId];
  const preMatchRecovery = applyCareerWeeklyRecovery({
    playerStates: preparedCareerState.gameState.playerStates,
    playerIds: fieldablePlayerIdsFor(selectedClub),
    dayCount: nextFixture.fixture.date - preparedCareerState.gameState.calendar.currentDate,
  });
  const recoveredCareerState: CareerState = {
    ...preparedCareerState,
    gameState: {
      ...preparedCareerState.gameState,
      playerStates: preMatchRecovery.playerStates,
    },
  };
  const contentConfig = matchdayContentConfig(recoveredCareerState);
  const selectedTeam = buildSelectedClubTeam(recoveredCareerState, contentConfig)[
    recoveredCareerState.selectedClubId
  ];
  const opponentClubId = nextFixture.fixture.homeClubId === recoveredCareerState.selectedClubId
    ? nextFixture.fixture.awayClubId
    : nextFixture.fixture.homeClubId;

  if (selectedTeam === undefined) {
    return {
      status: "invalid",
      attempt: {
        status: "invalid",
        blockerKeys: [],
        invalidReason: "missing_team_context",
        fixtureId: nextFixture.fixtureId,
      },
    };
  }

  // The opponent selects through the same engine function the committed
  // fixture progression uses. When this path composed its own opponent it was
  // free to disagree with the team the result was later committed against.
  const opponent = selectCareerAiTeam({
    careerState: recoveredCareerState,
    clubId: opponentClubId,
    fixture: nextFixture.fixture,
    policy: aiTeamSelectionPolicy(contentConfig),
    matchTacticsCalibration: contentConfig.matchTacticsCalibration,
    valuationConfig: selectPlayerValuationConfig(recoveredCareerState.gameState.meta.calibrationVersions),
  });
  const isSelectedHome = nextFixture.fixture.homeClubId === recoveredCareerState.selectedClubId;

  return {
    status: "ready",
    fixture: nextFixture.fixture,
    recoveredCareerState,
    opponentBenchPlayerIds: opponent.benchPlayerIds,
    matchContext: {
      fixtureId: nextFixture.fixtureId,
      seed: recoveredCareerState.gameState.meta.seed,
      home: isSelectedHome ? selectedTeam : opponent.teamContext,
      away: isSelectedHome ? opponent.teamContext : selectedTeam,
      engineConfig: contentConfig.matchEngineConfig,
      matchTacticsCalibration: contentConfig.matchTacticsCalibration,
    },
  };
}

/** Recreates canonical match tuning from the loaded career's immutable world seed. */
function matchdayContentConfig(careerState: CareerState): MatchdayContentConfig {
  const gameplay = createFakeGameplayConfig();
  const world = careerState.gameState.domesticCompetitionWorld;
  const competitionId = world === undefined
    ? undefined
    : world.competitionIds.find(
        (candidateId) =>
          world.competitions[candidateId]?.clubIds.includes(
            careerState.selectedClubId,
          ) === true,
      );
  const competitionMatchRules = competitionId === undefined
    ? undefined
    : world?.competitions[competitionId]?.matchRules;
  if (competitionMatchRules === undefined) {
    throw new Error("Selected club competition match rules are unavailable");
  }

  return {
    ...gameplay,
    competitionMatchRules,
  };
}

/** Copies only public minute facts from the runtime-owned engine session. */
function projectLiveProgress(session: WebLiveMatchdaySession): WebLiveMatchdayProgress {
  const snapshot = createProgressiveMatchMinuteSnapshot(session.engineState);
  const projection = buildLiveMatchProjection({
    simulation: session.engineState.simulation,
    events: session.engineState.events,
    playerRegistrations: liveProjectionRegistrations(snapshot),
  });
  const previewResult = session.completionPreview;
  const previewInput = previewResult === undefined ? undefined : resultInput(previewResult);

  return {
    fixtureBefore: session.fixtureBefore,
    selectedSide: session.selectedSide,
    selectedBenchPlayerIds: [...session.selectedBenchPlayerIds],
    selectedTeam: structuredClone(selectedLiveTeam(session)),
    snapshot,
    statistics: projection.statistics,
    playerRatings: projection.players,
    ...(session.engineState.pendingDecision === undefined
      ? {}
      : { pendingDecision: structuredClone(session.engineState.pendingDecision) }),
    ...(previewResult === undefined || previewInput === undefined
      ? {}
      : {
          fullTimeReview: {
            conditionChanges: structuredClone(previewInput.conditionChanges),
            playerStateChanges: structuredClone(previewInput.playerStateChanges),
            availabilityConsequences: structuredClone(previewResult.playerAvailabilityConsequences),
          },
        }),
  };
}

/** Creates both detailed live team snapshots once at kickoff. */
function initialLiveTeams(
  careerState: CareerState,
  preparation: MatchPreparationDraft,
  selectedSide: MatchSide,
  engineState: ProgressiveMatchSessionState,
): Pick<WebLiveMatchdaySession, "homeTeam" | "awayTeam"> {
  const selectedTeam = liveTeamFromPreparation(
    selectedSide,
    preparation,
    selectedBenchPlayerIds(careerState),
  );
  const opponentSide: MatchSide = selectedSide === "home" ? "away" : "home";
  const opponentSnapshot = opponentSide === "home"
    ? createProgressiveMatchMinuteSnapshot(engineState).home
    : createProgressiveMatchMinuteSnapshot(engineState).away;
  const opponentTeam = liveTeamFromEngineSnapshot(opponentSide, opponentSnapshot.team, opponentSnapshot.bench);

  return selectedSide === "home"
    ? { homeTeam: selectedTeam, awayTeam: opponentTeam }
    : { homeTeam: opponentTeam, awayTeam: selectedTeam };
}

/** Converts the confirmed pre-match board into canonical detailed live facts. */
function liveTeamFromPreparation(
  side: MatchSide,
  preparation: MatchPreparationDraft,
  benchPlayerIds: readonly PlayerId[],
): LiveMatchTeamState {
  const formation = formationKey(preparation.selectedFormationId);
  return {
    side,
    formation,
    lineup: preparation.tacticalBoardDraft.slots.flatMap((slot) => slot.playerId === null
      ? []
      : [{
          slotId: slot.slotId,
          playerId: asPlayerId(slot.playerId),
          role: canonicalRoleForBoardRole(slot.role),
          nx: slot.nx,
          ny: slot.ny,
        }]),
    bench: TACTICAL_BENCH_SLOT_IDS.flatMap((slotId, index) => {
      const playerId = preparation.selectedBenchPlayerIdsBySlot[slotId] ?? benchPlayerIds[index];
      return playerId === undefined ? [] : [{ slotId, playerId: asPlayerId(playerId), status: "available" as const }];
    }),
    unavailable: [],
    substitutionsUsed: 0,
    tactic: tacticForDraft(preparation),
  };
}

/** Gives the uncontrolled side a canonical board shape without a second UI policy. */
function liveTeamFromEngineSnapshot(
  side: MatchSide,
  team: MatchTeamContext,
  bench: ProgressiveMatchAvailability["home"]["bench"],
): LiveMatchTeamState {
  const boardSlots = tacticalBoardSlotsFromFormation("4-4-2");
  return {
    side,
    formation: "4-4-2",
    lineup: team.lineup.map((slot, index) => {
      const boardSlot = boardSlots[index] ?? boardSlots.at(-1);
      if (boardSlot === undefined) throw new Error("Canonical 4-4-2 requires tactical board slots");
      return {
        slotId: slot.slotId,
        playerId: slot.playerId,
        role: boardSlot.canonicalRole,
        nx: boardSlot.nx,
        ny: boardSlot.ny,
      };
    }),
    bench: bench.map((slot) => ({ ...slot })),
    unavailable: [],
    substitutionsUsed: 0,
    tactic: balancedTactic(),
  };
}

/** Converts one paused UI draft into the complete intended selected-team result. */
function liveTeamFromDraft(
  session: WebLiveMatchdaySession,
  currentTeam: LiveMatchTeamState,
  preparation: MatchPreparationDraft,
): LiveMatchTeamState {
  const pendingPlayerId = session.engineState.pendingDecision?.playerId;
  const pendingReason = session.engineState.pendingDecision?.type === "red_card_reorganization"
    ? "dismissed"
    : session.engineState.pendingDecision?.type === "forced_injury"
      ? "injured"
      : undefined;
  const lineup = preparation.tacticalBoardDraft.slots.flatMap((slot) =>
    slot.playerId === null || (pendingPlayerId !== undefined && slot.playerId === pendingPlayerId)
      ? []
      : [{
          slotId: slot.slotId,
          playerId: asPlayerId(slot.playerId),
          role: canonicalRoleForBoardRole(slot.role),
          nx: slot.nx,
          ny: slot.ny,
        }],
  );
  const currentLineupIds = new Set(currentTeam.lineup.map((slot) => slot.playerId));
  const currentBenchByPlayer = new Map(currentTeam.bench.map((slot) => [slot.playerId, slot]));
  const substitutions = deriveLineupChanges(currentTeam, lineup);
  const bench = TACTICAL_BENCH_SLOT_IDS.flatMap((slotId) => {
    const value = preparation.selectedBenchPlayerIdsBySlot[slotId];
    if (value === undefined || value === pendingPlayerId) return [];
    const playerId = asPlayerId(value);
    return [{
      slotId,
      playerId,
      status: currentLineupIds.has(playerId)
        ? "substituted_out" as const
        : currentBenchByPlayer.get(playerId)?.status ?? "available" as const,
    }];
  });

  return {
    side: session.selectedSide,
    formation: formationKey(preparation.selectedFormationId),
    lineup,
    bench,
    unavailable: pendingPlayerId === undefined || pendingReason === undefined
      ? [...currentTeam.unavailable]
      : [
          ...currentTeam.unavailable.filter((player) => player.playerId !== pendingPlayerId),
          { playerId: pendingPlayerId, reason: pendingReason },
        ],
    substitutionsUsed: currentTeam.substitutionsUsed + substitutions.length,
    tactic: tacticForDraft(preparation, currentTeam.tactic),
  };
}

/** Derives substitution facts from the atomic current/next XI difference. */
function deriveLiveSubstitutionDecisions(
  session: WebLiveMatchdaySession,
  currentTeam: LiveMatchTeamState,
  nextTeam: LiveMatchTeamState,
): readonly MatchSubstitutionDecision[] {
  return deriveLineupChanges(currentTeam, nextTeam.lineup).map(({ outgoingPlayerId, incomingPlayerId }) => ({
    outgoingPlayerId,
    incomingPlayerId,
    reasonKey: session.engineState.pendingDecision?.type === "forced_injury"
      && session.engineState.pendingDecision.playerId === outgoingPlayerId
      ? "forced_injury"
      : session.engineState.phase === "half_time"
        ? "half_time_manager_decision"
        : "manager_decision",
  }));
}

function deriveLineupChanges(
  currentTeam: LiveMatchTeamState,
  nextLineup: LiveMatchTeamState["lineup"],
): readonly Pick<MatchSubstitutionDecision, "outgoingPlayerId" | "incomingPlayerId">[] {
  const currentIds = new Set(currentTeam.lineup.map((slot) => slot.playerId));
  const nextIds = new Set(nextLineup.map((slot) => slot.playerId));
  const incoming = nextLineup.filter((slot) => !currentIds.has(slot.playerId));
  const outgoing = currentTeam.lineup.filter((slot) => !nextIds.has(slot.playerId));

  return incoming.flatMap((slot, index) => {
    const sameSlot = outgoing.find((candidate) => candidate.slotId === slot.slotId);
    const removed = sameSlot ?? outgoing[index];
    return removed === undefined ? [] : [{ outgoingPlayerId: removed.playerId, incomingPlayerId: slot.playerId }];
  });
}

/** Rebuilds the domain command snapshot from one private engine minute. */
function toDomainLiveSession(
  session: WebLiveMatchdaySession,
  progress: WebLiveMatchdayProgress = projectLiveProgress(session),
) {
  const pendingDecision = session.engineState.pendingDecision
    ?? (session.engineState.phase === "half_time"
      ? {
          type: "half_time" as const,
          minute: session.engineState.simulation.minute,
          side: session.selectedSide,
        }
      : undefined);
  const report = createMatchReport({
    fixtureId: session.engineState.initialContext.fixtureId,
    finalMinute: session.engineState.simulation.minute,
    isComplete: session.engineState.phase === "full_time",
    score: session.engineState.simulation.score,
    stats: session.engineState.simulation.stats,
    events: session.engineState.events,
  });
  return {
    fixtureId: session.engineState.initialContext.fixtureId,
    controlledSide: session.selectedSide,
    phase: session.engineState.phase,
    currentMinute: session.engineState.simulation.minute,
    runState: session.engineState.runState,
    ...(session.engineState.pauseReason === undefined ? {} : { pauseReason: session.engineState.pauseReason }),
    score: { ...session.engineState.simulation.score },
    statistics: progress.statistics!,
    home: session.homeTeam,
    away: session.awayTeam,
    events: report.events,
    substitutions: session.engineState.appliedSubstitutions,
    ...(pendingDecision === undefined
      ? {}
      : { pendingDecision }),
  } satisfies DomainLiveMatchSession;
}

/** Rebuilds one side's engine team context after a validated live command. */
function matchTeamContextFromLiveTeam(
  session: WebLiveMatchdaySession,
  team: LiveMatchTeamState,
): MatchTeamContext {
  const config = matchdayContentConfig(session.careerState);
  const clubId = team.side === "home"
    ? session.fixtureBefore.homeClubId
    : session.fixtureBefore.awayClubId;
  const condition = session.engineState.simulation.stats.telemetry?.playerCondition ?? {};
  const playerStates = { ...session.careerState.gameState.playerStates };
  for (const slot of team.lineup) {
    const state = playerStates[slot.playerId];
    const fitness = condition[slot.playerId];
    if (state !== undefined && fitness !== undefined) {
      playerStates[slot.playerId] = { ...state, fitness: liveFitnessValue(fitness, state.fitness) };
    }
  }
  return buildTacticTeamContext({
    lineup: {
      clubId,
      slots: team.lineup.map((slot) => ({
        slotKey: slot.slotId,
        playerId: slot.playerId,
        canonicalRole: slot.role,
      })),
    },
    tactic: team.tactic,
    requiredLineupSize: team.lineup.length,
    players: session.careerState.gameState.players,
    roleWeights: config.roleWeights,
    playerStates,
    stateMultiplierCurves: config.stateMultiplierCurves,
    matchTacticsCalibration: config.matchTacticsCalibration,
  });
}

function selectedLiveTeam(session: WebLiveMatchdaySession): LiveMatchTeamState {
  return session.selectedSide === "home" ? session.homeTeam : session.awayTeam;
}

function tacticForDraft(preparation: MatchPreparationDraft, fallback?: TacticSetup): TacticSetup {
  return MATCH_PREPARATION_TACTIC_PROFILES.find(
    (profile) => profile.tacticProfileId === preparation.selectedTacticProfileId,
  )?.values as TacticSetup | undefined ?? fallback ?? balancedTactic();
}

function balancedTactic(): TacticSetup {
  return {
    mentality: "balanced",
    pressing: 0.5,
    directness: 0.5,
    width: 0.5,
    risk: 0.5,
  };
}

function formationKey(value: string): FormationKey {
  const isSupported = tacticalBoardFormationPresets().some((formation) => formation.formationId === value);
  if (!isSupported) throw new Error(`Unsupported live formation: ${value}`);
  return value as FormationKey;
}

/** Preserves the domain state-value brand after validating an engine-owned live value. */
function liveFitnessValue(value: number, _reference: GameState["playerStates"][PlayerId]["fitness"]): GameState["playerStates"][PlayerId]["fitness"] {
  if (!Number.isFinite(value) || value < 0 || value > 100) {
    throw new Error(`Live fitness must stay between 0 and 100: ${value}`);
  }
  return value as GameState["playerStates"][PlayerId]["fitness"];
}

/** Returns the next immutable runtime session while retaining its RNG cursor. */
function withEngineState(
  session: WebLiveMatchdaySession,
  engineState: ProgressiveMatchSessionState,
): WebLiveMatchdaySession {
  const {
    completionPreview: _completionPreview,
    completionFailureReason: _completionFailureReason,
    ...activeSession
  } = session;
  return { ...activeSession, engineState };
}

/** Calculates the pure full-time result once without publishing its career state. */
function withCompletionPreview(session: WebLiveMatchdaySession): WebLiveMatchdaySession {
  const preview = commitProgressiveWebMatchday(session);

  return preview.status === "advanced"
    ? { ...session, completionPreview: preview }
    : { ...session, completionFailureReason: preview.reason };
}

/**
 * Builds real selected/opponent benches without putting career data in the engine.
 *
 * The opponent's substitutes are the ones its own selection chose, not the
 * players left over after its eleven was removed from the roster. Those differ
 * as soon as the selection is a real one: a squad's second goalkeeper is a
 * substitute, and a third-choice striker in a shape with one striker is not.
 */
function buildProgressiveAvailability(
  careerState: CareerState,
  fixture: Fixture,
  selectedSide: MatchSide,
  opponentBenchPlayerIds: readonly PlayerId[],
): ProgressiveMatchAvailability {
  const selectedBench = selectedBenchPlayerIds(careerState);

  const forSide = (side: MatchSide) => {
    const playerIds = side === selectedSide
      ? selectedBench
      : opponentBenchPlayerIds.slice(0, REQUIRED_BENCH_SIZE);

    return {
      bench: playerIds.map((playerId, index) => ({
        slotId: `bench:${String(index + 1).padStart(2, "0")}`,
        playerId,
        status: "available" as const,
      })),
      unavailable: [],
    };
  };

  return { home: forSide("home"), away: forSide("away") };
}

/** Reads the fixed selected-club bench from saved match preparation. */
function selectedBenchPlayerIds(careerState: CareerState): readonly PlayerId[] {
  return (careerState.matchPreparation?.benchSlots ?? []).flatMap((slot) =>
    slot.playerId === null ? [] : [slot.playerId],
  );
}

/** Commits one completed progressive session through the existing career use case. */
function commitProgressiveWebMatchday(
  session: WebLiveMatchdaySession,
): ProgressCareerFixtureAdvanced | { readonly status: "invalid"; readonly reason: string } {
  const finalState = session.engineState;
  const report = createMatchReport({
    fixtureId: finalState.initialContext.fixtureId,
    finalMinute: finalState.simulation.minute,
    isComplete: true,
    score: finalState.simulation.score,
    stats: finalState.simulation.stats,
    events: finalState.events,
  });
  return commitCompletedCareerFixture({
    careerState: session.careerState,
    report,
    initialContext: finalState.initialContext,
    finalContext: finalState.simulation.context,
    selectedClubBenchPlayerIds: session.selectedBenchPlayerIds,
    appliedSubstitutions: finalState.appliedSubstitutions,
    playerRatings: livePlayerRatings(projectLiveProgress(session)),
    competitionMatchRules: matchdayContentConfig(session.careerState).competitionMatchRules,
    wagePolicy: selectPlayerWagePolicyConfig(
      session.careerState.gameState.meta.calibrationVersions,
    ),
    marketBehaviorPolicy: selectMarketBehaviorCalibration(
      session.careerState.gameState.meta.calibrationVersions,
    ),
    valuationConfig: selectPlayerValuationConfig(
      session.careerState.gameState.meta.calibrationVersions,
    ),
    playerDevelopmentEnvironmentConfig: selectPlayerDevelopmentEnvironmentConfig(
      session.careerState.gameState.meta.calibrationVersions,
    ),
  });
}

/** Returns one stable invalid adapter state without mutating durable facts. */
function invalidSessionState(state: WebMatchdayState, invalidReason: string): WebMatchdayState {
  return {
    ...state,
    lastSessionAttempt: {
      status: "invalid",
      blockerKeys: [],
      invalidReason,
      ...(state.liveProgress === undefined ? {} : { fixtureId: state.liveProgress.fixtureBefore.id }),
    },
  };
}

function validatePreparation(preparation: MatchPreparationDraft): readonly WebMatchdayBlockerKey[] {
  const blockers: WebMatchdayBlockerKey[] = [];

  if (preparation.isSaved !== true || completeLineupCount(preparation) !== DEFAULT_MATCH_LINEUP_SIZE) {
    blockers.push("missing_saved_lineup");
  }

  if (preparation.isSaved !== true || completeBenchCount(preparation) !== REQUIRED_BENCH_SIZE) {
    blockers.push("missing_saved_bench");
  }

  if (preparation.isSaved !== true || preparation.selectedTacticProfileId === undefined) {
    blockers.push("missing_saved_tactic");
  }

  return blockers;
}

function completeLineupCount(preparation: MatchPreparationDraft): number {
  return preparation.tacticalBoardDraft.slots.filter((slot) => slot.playerId !== null).length;
}

function completeBenchCount(preparation: MatchPreparationDraft): number {
  return Object.values(preparation.selectedBenchPlayerIdsBySlot).filter((playerId) => playerId.length > 0).length;
}

/**
 * Supplies the one context this driver owns: the manager's prepared team.
 *
 * Every other club selects its own eleven through the AI policy below. Both
 * drivers used to compose a context for every club in the world, each from its
 * own copy of one fixed fallback eleven; that copy is gone from both.
 */
function buildSelectedClubTeam(
  careerState: CareerState,
  contentConfig: Pick<
    MatchdayContentConfig,
    "matchTacticsCalibration" | "roleWeights" | "stateMultiplierCurves"
  >,
): Readonly<Record<ClubId, MatchTeamContext>> {
  const { selectedClubId, matchPreparation } = careerState;

  if (matchPreparation?.selectedLineup === undefined || matchPreparation.tactic === undefined) {
    return {} as Readonly<Record<ClubId, MatchTeamContext>>;
  }

  return {
    [selectedClubId]: buildTacticTeamContext({
      lineup: matchPreparation.selectedLineup,
      tactic: matchPreparation.tactic,
      requiredLineupSize: DEFAULT_MATCH_LINEUP_SIZE,
      players: careerState.gameState.players,
      roleWeights: contentConfig.roleWeights,
      playerStates: careerState.gameState.playerStates,
      stateMultiplierCurves: contentConfig.stateMultiplierCurves,
      matchTacticsCalibration: contentConfig.matchTacticsCalibration,
    }),
  } as Readonly<Record<ClubId, MatchTeamContext>>;
}

/**
 * The one policy every club the manager has not prepared selects through.
 *
 * No formation and no per-club entry, so the clubs the manager faces cannot pick
 * their teams by a different rule from the rest of the league (A2).
 */
function aiTeamSelectionPolicy(
  contentConfig: Pick<MatchdayContentConfig, "roleWeights" | "stateMultiplierCurves">,
): ProgressCareerAiTeamSelectionInput {
  return {
    roleWeights: contentConfig.roleWeights,
    stateMultiplierCurves: contentConfig.stateMultiplierCurves,
    tacticalDistribution: {
      mentality: "balanced",
      pressing: 0.5,
      directness: 0.5,
      width: 0.5,
      risk: 0.5,
    },
  };
}

function engineRoleKeyForBoardRole(role: TacticalBoardRoleCode): string {
  switch (role) {
    case "POR":
      return "gk";

    case "TD":
    case "DC":
    case "TS":
      return "defender";

    case "MED":
    case "CC":
    case "ED":
    case "ES":
    case "TRQ":
      return "midfielder";

    case "AD":
    case "AS":
    case "ATT":
      return "attacker";
  }
}

function nextFixtureOrUndefined(careerState: CareerState): Fixture | undefined {
  const nextFixture = findNextCareerFixture(careerState);

  return nextFixture.status === "found" ? nextFixture.fixture : undefined;
}

function fixtureInput(careerState: CareerState, fixture: Fixture): NonNullable<BuildCareerMatchdayViewInput["fixture"]> {
  const homeClub = careerState.gameState.clubs[fixture.homeClubId];
  const awayClub = careerState.gameState.clubs[fixture.awayClubId];

  return {
    fixtureId: fixture.id,
    dateIso: toISO(fixture.date),
    round: fixture.roundNumber,
    homeClub: {
      clubId: fixture.homeClubId,
      name: homeClub?.name ?? fixture.homeClubId,
    },
    awayClub: {
      clubId: fixture.awayClubId,
      name: awayClub?.name ?? fixture.awayClubId,
    },
    selectedClubSide: fixture.homeClubId === careerState.selectedClubId ? "home" : "away",
  };
}

function resultInput(result: WebMatchdayAdvancedResult): NonNullable<BuildCareerMatchdayViewInput["result"]> {
  const homeClub = clubInput(result.careerState, result.fixtureAfter.homeClubId);
  const awayClub = clubInput(result.careerState, result.fixtureAfter.awayClubId);

  return {
    homeGoals: result.report.score.home,
    awayGoals: result.report.score.away,
    events: eventInputs(result, homeClub, awayClub),
    playerStats: playerStatInputs(result, homeClub, awayClub),
    conditionChanges: result.conditionChanges.map((change) => ({
      playerId: change.playerId,
      playerName: playerName(result.careerState, change.playerId),
      before: change.beforeFitness,
      after: change.afterFitness,
      delta: change.delta,
    })),
    playerStateChanges: result.playerStateConsequences.map((change) => ({
      playerId: change.playerId,
      playerName: playerName(result.careerState, change.playerId),
      formBefore: change.beforeForm,
      formAfter: change.afterForm,
      formDelta: change.formDelta,
      moraleBefore: change.beforeMorale,
      moraleAfter: change.afterMorale,
      moraleDelta: change.moraleDelta,
      reasonKeys: change.reasonKeys,
    })),
  };
}

function eventInputs(
  result: WebMatchdayAdvancedResult,
  homeClub: { readonly clubId: string; readonly name: string },
  awayClub: { readonly clubId: string; readonly name: string },
): NonNullable<BuildCareerMatchdayViewInput["result"]>["events"] {
  return result.report.events.flatMap((event, index) => {
    const eventMinute = eventMinuteOrUndefined(event);

    if (eventMinute === undefined || event.type === "foul") {
      return [];
    }

    return [{
      eventId: `${result.report.fixtureId}:event:${String(index + 1).padStart(3, "0")}`,
      minute: eventMinute,
      sequence: index,
      kind: reportEventPresentationKind(event),
      club: eventSide(event) === "home" ? homeClub : awayClub,
      ...primaryPlayerName(result.careerState, event),
      ...secondaryPlayerName(result.careerState, event),
      detailKeys: eventDetailKeys(event),
    }];
  });
}

function phaseEventInputs(
  careerState: CareerState,
  liveProgress: WebLiveMatchdayProgress,
  events: readonly MatchStepEvent[],
): BuildCareerMatchdayPhaseViewInput["events"] {
  const homeClub = clubInput(careerState, liveProgress.fixtureBefore.homeClubId);
  const awayClub = clubInput(careerState, liveProgress.fixtureBefore.awayClubId);
  const phaseEvents: Array<BuildCareerMatchdayPhaseViewInput["events"][number]> = [];

  events.forEach((event, index) => {
    if (
      event.type === "kickoff"
      || event.type === "half_time"
      || event.type === "full_time"
      || event.type === "foul"
    ) return;
    const base = {
      eventId: `${liveProgress.fixtureBefore.id}:phase-event:${String(index + 1).padStart(3, "0")}`,
      minute: event.minute,
      sequence: index,
      club: event.side === "home" ? homeClub : awayClub,
    };

    if (event.type === "shot_outcome") {
      phaseEvents.push({
        ...base,
        kind: event.outcome === "goal" ? "goal" : event.outcome,
        ...phasePrimaryPlayerName(careerState, event),
        ...phaseSecondaryPlayerName(careerState, event),
        detailKeys: [`chance:${event.chanceType}`, `shot:${event.shotType}`],
      });
      return;
    }

    phaseEvents.push({
      ...base,
      kind: incidentPresentationKind(event),
      ...phaseIncidentPlayerNames(careerState, event),
      detailKeys: phaseIncidentDetailKeys(event),
    });
  });

  return phaseEvents;
}

/** Maps durable report incidents onto the finite localized presentation vocabulary. */
function reportEventPresentationKind(event: MatchEvent): string {
  switch (event.type) {
    case "second_yellow_card":
      return "second_yellow";
    case "penalty_awarded":
      return "penalty";
    case "penalty_outcome":
      return penaltyOutcomePresentationKind(event.outcome);
    case "kickoff":
    case "half_time":
    case "full_time":
    case "foul":
    case "goal":
    case "save":
    case "miss":
    case "block":
    case "yellow_card":
    case "red_card":
    case "injury":
    case "substitution":
      return event.type;
  }
}

/** Maps live incidents onto the same finite localized vocabulary as full-time review. */
function incidentPresentationKind(
  event: Exclude<MatchStepEvent, { readonly type: "shot_outcome" | "kickoff" | "half_time" | "full_time" | "foul" }>,
): string {
  switch (event.type) {
    case "second_yellow_card":
      return "second_yellow";
    case "penalty_awarded":
      return "penalty";
    case "penalty_outcome":
      return penaltyOutcomePresentationKind(event.outcome);
    case "yellow_card":
    case "red_card":
    case "injury":
    case "substitution":
      return event.type;
  }
}

/** Preserves one localized key per structured penalty outcome. */
function penaltyOutcomePresentationKind(outcome: "scored" | "saved" | "missed"): string {
  switch (outcome) {
    case "scored":
      return "penalty_goal";
    case "saved":
      return "penalty_save";
    case "missed":
      return "penalty_miss";
  }
}

function phasePlayerInputs(
  careerState: CareerState,
  liveProgress: WebLiveMatchdayProgress,
  ratings: readonly PlayerMatchRatingRow[],
): BuildCareerMatchdayPhaseViewInput["players"] {
  return ratings.map((rating) => {
    const clubId = rating.side === "home" ? liveProgress.fixtureBefore.homeClubId : liveProgress.fixtureBefore.awayClubId;
    const team = rating.side === "home" ? liveProgress.snapshot.home.team : liveProgress.snapshot.away.team;
    const slot = team.lineup.find((lineupSlot) => lineupSlot.playerId === rating.playerId);
    const condition = liveProgress.snapshot.stats.telemetry?.playerCondition[rating.playerId]
      ?? careerState.gameState.playerStates[rating.playerId]?.fitness;

    return {
      playerId: rating.playerId,
      playerName: playerName(careerState, rating.playerId),
      club: clubInput(careerState, clubId),
      ...(slot === undefined ? {} : { roleKey: roleWeightKeyForCanonicalRole(slot.canonicalRole) }),
      rating: rating.rating,
      ...(condition === undefined ? {} : { condition }),
      status: substitutedStatus(liveProgress, rating.playerId),
      goals: rating.goals,
      assists: rating.assists,
      shots: rating.shots,
      shotsOnTarget: rating.shotsOnTarget,
      saves: rating.saves,
      blocks: rating.blocks,
    };
  });
}

function teamControlPlayerOption(
  careerState: CareerState,
  liveProgress: WebLiveMatchdayProgress,
  playerId: PlayerId,
  roleKey: string | undefined,
  ratingByPlayerId: ReadonlyMap<PlayerId, PlayerMatchRatingRow>,
): WebMatchdayTeamControlPlayerOption {
  const condition = liveProgress.snapshot.stats.telemetry?.playerCondition[playerId]
    ?? careerState.gameState.playerStates[playerId]?.fitness;
  const rating = ratingByPlayerId.get(playerId)?.rating;

  return {
    playerId,
    playerName: playerName(careerState, playerId),
    ...(roleKey === undefined ? {} : { roleKey }),
    ...(rating === undefined ? {} : { rating }),
    ...(condition === undefined ? {} : { condition }),
  };
}

function compareOutgoingSubstitutionOptions(
  first: WebMatchdayTeamControlPlayerOption,
  second: WebMatchdayTeamControlPlayerOption,
): number {
  return (first.rating ?? 10) - (second.rating ?? 10)
    || (first.condition ?? 100) - (second.condition ?? 100)
    || first.playerName.localeCompare(second.playerName)
    || first.playerId.localeCompare(second.playerId);
}

function compareIncomingSubstitutionOptions(
  first: WebMatchdayTeamControlPlayerOption,
  second: WebMatchdayTeamControlPlayerOption,
): number {
  const availabilityRank = { available: 0, substituted_out: 1, dismissed: 2, injured: 2 } as const;
  return (availabilityRank[first.availability ?? "available"] - availabilityRank[second.availability ?? "available"])
    || (second.condition ?? 0) - (first.condition ?? 0)
    || first.playerName.localeCompare(second.playerName)
    || first.playerId.localeCompare(second.playerId);
}

function playerBroadRoleKey(player: Player | undefined): string | undefined {
  switch (player?.primaryRole) {
    case "goalkeeper":
      return "gk";
    case "center_back":
    case "full_back":
    case "wing_back":
      return "defender";
    case "defensive_midfielder":
    case "central_midfielder":
    case "attacking_midfielder":
    case "wide_midfielder":
    case "winger":
      return "midfielder";
    case "striker":
      return "attacker";
    case undefined:
      return undefined;
  }
}

function playerStatInputs(
  result: WebMatchdayAdvancedResult,
  homeClub: { readonly clubId: string; readonly name: string },
  awayClub: { readonly clubId: string; readonly name: string },
): NonNullable<BuildCareerMatchdayViewInput["result"]>["playerStats"] {
  return computePlayerMatchStats({
    report: result.report,
    playerRegistrations: finalPlayerRegistrations(result),
    sortBy: "contribution",
  }).map((row) => ({
    playerId: row.playerId,
    playerName: playerName(result.careerState, row.playerId),
    club: row.side === "home" ? homeClub : awayClub,
    goals: row.goals,
    assists: row.assists,
    shots: row.shots,
    shotsOnTarget: row.shotsOnTarget,
    saves: row.saves,
  }));
}

/** Reads both starting lineups off the played match rather than guessing them. */
function finalPlayerRegistrations(result: WebMatchdayAdvancedResult): readonly Readonly<{
  playerId: PlayerId;
  side: MatchSide;
  roleKey: string;
}>[] {
  // Step 08 left this recomposing the opponent's eleven from its roster, which
  // was correct only while every AI club fielded one fixed shape. A club now
  // lines up in the shape its own squad is built for, so there is nothing left
  // to recompute it from - only the match itself knows who played where.
  return (["home", "away"] as const).flatMap((side) =>
    result.fieldedLineups[side].map((slot) => ({
      playerId: slot.playerId,
      side,
      roleKey: roleWeightKeyForCanonicalRole(slot.canonicalRole),
    })),
  );
}

function substitutedStatus(
  liveProgress: WebLiveMatchdayProgress,
  playerId: PlayerId,
): BuildCareerMatchdayPhaseViewInput["players"][number]["status"] {
  if (liveProgress.snapshot.appliedSubstitutions.some((substitution) => substitution.incomingPlayerId === playerId)) {
    return "substituted_on";
  }

  if (liveProgress.snapshot.appliedSubstitutions.some((substitution) => substitution.outgoingPlayerId === playerId)) {
    return "substituted_off";
  }

  return "on_pitch";
}

/** Reuses the canonical rating formula for the current progressive snapshot. */
function livePlayerRatings(progress: WebLiveMatchdayProgress): readonly PlayerMatchRatingRow[] {
  return progress.playerRatings;
}

/** Keeps former starters and introduced substitutes in one stable live projection. */
function liveProjectionRegistrations(
  snapshot: ProgressiveMatchMinuteSnapshot,
): readonly Readonly<{ playerId: PlayerId; side: MatchSide }>[] {
  const registrations = new Map<PlayerId, MatchSide>();
  for (const side of ["home", "away"] as const) {
    const team = side === "home" ? snapshot.home.team : snapshot.away.team;
    for (const slot of team.lineup) registrations.set(slot.playerId, side);
  }
  for (const substitution of snapshot.appliedSubstitutions) {
    registrations.set(substitution.outgoingPlayerId, substitution.side);
    registrations.set(substitution.incomingPlayerId, substitution.side);
  }

  return [...registrations].map(([playerId, side]) => ({ playerId, side }));
}

function phasePrimaryPlayerName(
  careerState: CareerState,
  event: Extract<MatchStepEvent, { readonly type: "shot_outcome" }>,
): { readonly playerName?: string } {
  const playerId =
    event.outcome === "goal"
      ? event.scorerPlayerId
      : event.outcome === "save"
        ? event.goalkeeperPlayerId
        : event.shooterPlayerId;

  return playerId === undefined ? {} : { playerName: playerName(careerState, playerId) };
}

function phaseSecondaryPlayerName(
  careerState: CareerState,
  event: Extract<MatchStepEvent, { readonly type: "shot_outcome" }>,
): { readonly secondaryPlayerName?: string } {
  const playerId = event.outcome === "goal"
    ? event.assistPlayerId
    : event.outcome === "block"
      ? event.primaryDefenderPlayerId
      : undefined;

  return playerId === undefined ? {} : { secondaryPlayerName: playerName(careerState, playerId) };
}

/** Resolves incident participants without storing presentation prose. */
function phaseIncidentPlayerNames(
  careerState: CareerState,
  event: Exclude<MatchStepEvent, { readonly type: "shot_outcome" | "kickoff" | "half_time" | "full_time" }>,
): { readonly playerName?: string; readonly secondaryPlayerName?: string } {
  switch (event.type) {
    case "foul":
      return {
        playerName: playerName(careerState, event.committedByPlayerId),
        ...(event.sufferedByPlayerId === undefined
          ? {}
          : { secondaryPlayerName: playerName(careerState, event.sufferedByPlayerId) }),
      };
    case "yellow_card":
    case "second_yellow_card":
    case "red_card":
    case "injury":
      return { playerName: playerName(careerState, event.playerId) };
    case "penalty_awarded":
      return {
        ...(event.fouledPlayerId === undefined ? {} : { playerName: playerName(careerState, event.fouledPlayerId) }),
        ...(event.committedByPlayerId === undefined
          ? {}
          : { secondaryPlayerName: playerName(careerState, event.committedByPlayerId) }),
      };
    case "penalty_outcome":
      return {
        playerName: playerName(careerState, event.takerPlayerId),
        secondaryPlayerName: playerName(careerState, event.goalkeeperPlayerId),
      };
    case "substitution":
      return {
        playerName: playerName(careerState, event.incomingPlayerId),
        secondaryPlayerName: playerName(careerState, event.outgoingPlayerId),
      };
  }
}

/** Emits stable detail keys used by later incident-specific presentation. */
function phaseIncidentDetailKeys(
  event: Exclude<MatchStepEvent, { readonly type: "shot_outcome" | "kickoff" | "half_time" | "full_time" }>,
): readonly string[] {
  switch (event.type) {
    case "foul":
      return [`danger:${event.zoneDanger.toFixed(2)}`];
    case "injury":
      return injuryForcesExit(event.severity)
        ? [`severity:${event.severity}`, "requires_substitution"]
        : [`severity:${event.severity}`];
    case "penalty_outcome":
      return [`outcome:${event.outcome}`];
    case "substitution":
      return [`reason:${event.reasonKey}`];
    case "yellow_card":
    case "second_yellow_card":
    case "red_card":
    case "penalty_awarded":
      return [];
  }
}

function clubInput(careerState: CareerState, clubId: ClubId): { readonly clubId: string; readonly name: string } {
  return {
    clubId,
    name: careerState.gameState.clubs[clubId]?.name ?? clubId,
  };
}

function eventMinuteOrUndefined(event: MatchEvent): number | undefined {
  switch (event.type) {
    case "goal":
    case "save":
    case "miss":
    case "block":
      return event.shot.minute;

    case "foul":
    case "yellow_card":
    case "second_yellow_card":
    case "red_card":
    case "penalty_awarded":
    case "penalty_outcome":
    case "injury":
    case "substitution":
      return event.minute;

    case "full_time":
    case "half_time":
    case "kickoff":
      return undefined;
  }
}

function eventSide(event: MatchEvent): MatchEventSide {
  switch (event.type) {
    case "goal":
    case "save":
    case "miss":
    case "block":
      return event.shot.side;

    case "foul":
    case "yellow_card":
    case "second_yellow_card":
    case "red_card":
    case "penalty_awarded":
    case "penalty_outcome":
    case "injury":
    case "substitution":
      return event.side;

    case "full_time":
    case "half_time":
    case "kickoff":
      return "home";
  }
}

function primaryPlayerName(careerState: CareerState, event: MatchEvent): { readonly playerName?: string } {
  const primaryPlayerId = primaryPlayerIdForEvent(event);

  return primaryPlayerId === undefined ? {} : { playerName: playerName(careerState, primaryPlayerId) };
}

function secondaryPlayerName(careerState: CareerState, event: MatchEvent): { readonly secondaryPlayerName?: string } {
  const secondaryPlayerId = event.type === "goal"
    ? event.assistPlayerId
    : event.type === "block"
      ? event.primaryDefenderPlayerId
      : event.type === "substitution"
        ? event.outgoingPlayerId
        : event.type === "penalty_outcome"
          ? event.goalkeeperPlayerId
          : event.type === "penalty_awarded"
            ? event.committedByPlayerId
            : undefined;

  return secondaryPlayerId === undefined ? {} : { secondaryPlayerName: playerName(careerState, secondaryPlayerId) };
}

function primaryPlayerIdForEvent(event: MatchEvent): PlayerId | undefined {
  switch (event.type) {
    case "goal":
      return event.scorerPlayerId;

    case "save":
      return event.goalkeeperPlayerId;

    case "miss":
    case "block":
      return event.shooterPlayerId;

    case "foul":
      return event.committedByPlayerId;

    case "yellow_card":
    case "second_yellow_card":
    case "red_card":
    case "injury":
      return event.playerId;

    case "penalty_awarded":
      return event.fouledPlayerId;

    case "penalty_outcome":
      return event.takerPlayerId;

    case "substitution":
      return event.incomingPlayerId;

    case "full_time":
    case "half_time":
    case "kickoff":
      return undefined;
  }
}

function eventDetailKeys(event: MatchEvent): readonly string[] {
  switch (event.type) {
    case "goal":
    case "save":
    case "miss":
    case "block":
      return [`chance:${event.shot.chanceType}`, `shot:${event.shot.shotType}`];

    case "foul":
      return [`danger:${event.zoneDanger.toFixed(2)}`];
    case "injury":
      return [`severity:${event.severity}`];
    case "penalty_outcome":
      return [`outcome:${event.outcome}`];
    case "substitution":
      return [`reason:${event.reasonKey}`];
    case "yellow_card":
    case "second_yellow_card":
    case "red_card":
    case "penalty_awarded":
      return [];

    case "full_time":
    case "half_time":
    case "kickoff":
      return [];
  }
}

function playerName(careerState: CareerState, id: PlayerId): string {
  const player = careerState.gameState.players[id];

  if (player === undefined) {
    return id;
  }

  return `${player.firstName} ${player.lastName}`;
}
