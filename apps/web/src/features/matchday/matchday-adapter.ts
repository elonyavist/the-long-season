import {
  applyCareerWeeklyRecovery,
  applyHalfTimeSubstitutions,
  buildPlayerMatchRatings,
  buildTacticTeamContext,
  commitStagedCareerFixture,
  createStagedMatchCheckpoint,
  computePlayerMatchStats,
  createInitialStagedMatchState,
  deriveTeamStrength,
  findNextCareerFixture,
  progressStagedMatchToFullTime,
  progressStagedMatchToHalfTime,
  restoreStagedMatchCheckpoint,
  type LineupSlot,
  type MatchContext,
  type MatchSide,
  type MatchStepEvent,
  type MatchTeamContext,
  type HalfTimeTacticalDecisionPlan,
  type PlayerMatchRatingRow,
  type ProgressCareerFixtureAdvanced,
  type StagedMatchSnapshot,
  type StagedMatchState,
  type MatchSubstitutionDecision,
} from "@game/engine";
import { createFakeLeagueSystem } from "@game/content";
import { toISO } from "@game/shared";
import {
  buildCareerMatchdayPhaseView,
  buildCareerMatchdayView,
  type BuildCareerMatchdayPhaseViewInput,
  type BuildCareerMatchdayViewInput,
  type CareerMatchdayPhaseView,
  type CareerMatchdayView,
} from "@game/ui";

import {
  createMatchPreparationDraft,
  type MatchPreparationDraft,
} from "../match-preparation/match-preparation-adapter";
import { TACTICAL_BENCH_SLOT_IDS } from "../tactics-board/tactical-board-bench";
import { selectCurrentTacticalBoardShape } from "../tactics-board/tactical-board-formations";
import type { TacticalBoardRoleCode } from "../tactics-board/tactical-board-types";

import type { WebCareerState as CareerState } from "../../runtime/web-career-runtime";

type GameState = CareerState["gameState"];
type ClubId = CareerState["selectedClubId"];
type FixtureId = GameState["fixtureIds"][number];
type Fixture = GameState["fixtures"][FixtureId];
type PlayerId = GameState["playerIds"][number];
type Player = GameState["players"][PlayerId];
type MatchReport = ProgressCareerFixtureAdvanced["report"];
type MatchEvent = MatchReport["events"][number];
type MatchEventSide = "home" | "away";
type MatchdayContentConfig = Pick<
  ReturnType<typeof createFakeLeagueSystem>,
  "matchEngineConfig" | "roleWeights" | "stateMultiplierCurves"
>;

const CAREER_DEFAULT_LINEUP_SIZE = 11;
const REQUIRED_BENCH_SIZE = 8;

/** Stable validation blockers for the persisted web matchday adapter. */
export type WebMatchdayBlockerKey =
  | "missing_saved_lineup"
  | "missing_saved_bench"
  | "missing_saved_tactic"
  | "already_played";

/** Last action state stored by the browser adapter. */
export type WebMatchdayPlayStatus = "idle" | "blocked" | "advanced" | "invalid" | "none" | "already_played";

/** Current staged matchday phase stored by the browser adapter. */
export type WebMatchdayStagedStatus =
  | "idle"
  | "blocked"
  | "at_half_time"
  | "substitutions_applied"
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

/** String-based substitution decision accepted by the web adapter. */
export interface WebHalfTimeSubstitutionDecision {
  /** Player currently on the pitch who should leave. */
  readonly outgoingPlayerId: string;
  /** Bench player who should enter. */
  readonly incomingPlayerId: string;
}

/** Player option shown by the web half-time substitution panel. */
export interface WebHalfTimeSubstitutionPlayerOption {
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
}

/** Applied substitution row for the half-time panel. */
export interface WebHalfTimeAppliedSubstitutionView {
  /** Player who left the pitch. */
  readonly outgoingPlayerName: string;
  /** Player who entered the pitch. */
  readonly incomingPlayerName: string;
}

/** Web-specific half-time substitution facts derived from staged state. */
export interface WebHalfTimeSubstitutionPanel {
  /** Whether half-time substitution controls can be shown. */
  readonly status: "available" | "unavailable";
  /** Selected-club on-pitch players. */
  readonly lineup: readonly WebHalfTimeSubstitutionPlayerOption[];
  /** Selected-club bench players not already on the pitch. */
  readonly bench: readonly WebHalfTimeSubstitutionPlayerOption[];
  /** Applied substitution summary rows. */
  readonly appliedSubstitutions: readonly WebHalfTimeAppliedSubstitutionView[];
  /** Already applied substitutions. */
  readonly appliedCount: number;
  /** Maximum v1 regulation substitutions. */
  readonly maxCount: number;
  /** Last adapter/engine validation reason, when an apply attempt failed. */
  readonly validationReason?: string;
  /** Structured tactical decision fact keys, when validation failed. */
  readonly validationFactKeys?: readonly string[];
}

/** Last staged action state stored by the browser adapter. */
export interface WebMatchdayStagedAttempt {
  /** Machine-readable staged state. */
  readonly status: WebMatchdayStagedStatus;
  /** Stable blockers when the manager has not prepared the match. */
  readonly blockerKeys: readonly WebMatchdayBlockerKey[];
  /** Fixture connected to this attempt when known. */
  readonly fixtureId?: string;
  /** Engine invalid reason when staged progression refuses to run. */
  readonly invalidReason?: string;
  /** Structured tactical-plan facts when second-half decision validation fails. */
  readonly invalidFactKeys?: readonly string[];
}

/** Successful persisted web matchday commit. */
export type WebMatchdayAdvancedResult = ProgressCareerFixtureAdvanced;

/** Rehydrated staged facts used by the web presentation adapter. */
export interface WebStagedMatchdayProgress {
  /** Fixture before any result is applied. */
  readonly fixtureBefore: Fixture;
  /** Selected-club side for this fixture. */
  readonly selectedSide: MatchSide;
  /** Selected-club bench available for half-time substitutions. */
  readonly selectedBenchPlayerIds: readonly PlayerId[];
  /** Loaded career state whose checkpoint owns this staged match. */
  readonly recoveredCareerState: CareerState;
  /** Current staged engine state. */
  readonly state: StagedMatchState;
  /** Current staged snapshot for phase-aware UI read models. */
  readonly snapshot: StagedMatchSnapshot;
}

/** Presentation state rebuilt from durable career facts after every command. */
export interface WebMatchdayState {
  /** Current loaded career state. */
  readonly careerState: CareerState;
  /** Last structured play attempt. */
  readonly lastPlayAttempt: WebMatchdayPlayAttempt;
  /** Last staged progression attempt. */
  readonly lastStagedAttempt: WebMatchdayStagedAttempt;
  /** Current staged match progress, set after first-half simulation starts. */
  readonly stagedProgress?: WebStagedMatchdayProgress;
  /** Played fixture result, set only after the first successful play. */
  readonly playedResult?: WebMatchdayAdvancedResult;
}

const asPlayerId = (value: string): PlayerId => value as PlayerId;

/** Rebuilds matchday presentation state from one validated durable career. */
export function createWebMatchdayState(
  careerState: CareerState,
  explicitPlayedResult?: WebMatchdayAdvancedResult,
): WebMatchdayState {
  const stagedProgress = restoreWebStagedProgress(careerState);
  const playedResult = explicitPlayedResult ?? rehydrateReviewedResult(careerState);

  return {
    careerState,
    lastPlayAttempt: {
      status: playedResult === undefined ? "idle" : "advanced",
      blockerKeys: [],
      ...(playedResult === undefined ? {} : { fixtureId: playedResult.fixtureId }),
    },
    lastStagedAttempt: {
      status: playedResult !== undefined
        ? "full_time"
        : stagedProgress?.snapshot.phase === "half_time"
          ? "at_half_time"
          : "idle",
      blockerKeys: [],
      ...(playedResult === undefined ? {} : { fixtureId: playedResult.fixtureId }),
    },
    ...(stagedProgress === undefined ? {} : { stagedProgress }),
    ...(playedResult === undefined ? {} : { playedResult }),
  };
}

/** Rebuilds full-time presentation from the played fixture still awaiting review. */
function rehydrateReviewedResult(careerState: CareerState): WebMatchdayAdvancedResult | undefined {
  const fixtureId = careerState.matchPreparation?.targetFixtureId;
  if (fixtureId === undefined || careerState.activeMatchCheckpoint !== undefined) return undefined;
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
    conditionChanges: [],
    playerStateConsequences: [],
    playerStateConsequenceSummary: {
      changedPlayerCount: 0,
      totalFormDelta: 0,
      totalMoraleDelta: 0,
    },
    careerState,
  };
}

/** Creates and attaches the durable pre-match checkpoint from saved preparation. */
export function enterWebMatchday(careerState: CareerState): WebMatchdayState {
  if (careerState.activeMatchCheckpoint !== undefined) return createWebMatchdayState(careerState);
  const preparation = createMatchPreparationDraft(careerState);
  const initial = createWebMatchdayState(careerState);
  const kickoff = prepareWebMatchdayKickoff(initial, preparation);
  if (kickoff.status !== "ready") return kickoff.state;
  const selectedSide = kickoff.fixture.homeClubId === kickoff.recoveredCareerState.selectedClubId ? "home" : "away";
  const state = createInitialStagedMatchState(kickoff.matchContext);
  const checkpoint = createStagedMatchCheckpoint({
    state,
    selectedClubSide: selectedSide,
    selectedClubBenchSlots: durableBenchSlots(kickoff.recoveredCareerState),
  });
  return createWebMatchdayState({ ...kickoff.recoveredCareerState, activeMatchCheckpoint: checkpoint });
}

/** Progresses the loaded durable checkpoint to the real half-time stop. */
export function progressWebMatchdayToHalfTime(state: WebMatchdayState): WebMatchdayState {
  if (state.playedResult !== undefined) {
    return {
      ...state,
      lastStagedAttempt: {
        status: "already_played",
        blockerKeys: ["already_played"],
        fixtureId: state.playedResult.fixtureId,
      },
    };
  }

  const stagedProgress = state.stagedProgress;
  if (stagedProgress === undefined) return invalidStagedState(state, "missing_staged_match");
  const staged = progressStagedMatchToHalfTime(stagedProgress.state);
  const checkpoint = createStagedMatchCheckpoint({
    state: staged.state,
    selectedClubSide: stagedProgress.selectedSide,
    selectedClubBenchSlots: durableBenchSlots(state.careerState),
  });
  const careerState = { ...state.careerState, activeMatchCheckpoint: checkpoint };

  return {
    ...state,
    careerState,
    lastStagedAttempt: {
      status: "at_half_time",
      blockerKeys: [],
      fixtureId: stagedProgress.fixtureBefore.id,
    },
    stagedProgress: {
      ...stagedProgress,
      recoveredCareerState: careerState,
      state: staged.state,
      snapshot: staged.snapshot,
    },
  };
}

/** Applies explicit manager-declared half-time substitutions to the loaded checkpoint. */
export function applyWebHalfTimeSubstitutions(
  state: WebMatchdayState,
  decisions: readonly WebHalfTimeSubstitutionDecision[],
): WebMatchdayState {
  const stagedProgress = state.stagedProgress;

  if (stagedProgress === undefined) {
    return {
      ...state,
      lastStagedAttempt: {
        status: "invalid",
        blockerKeys: [],
        invalidReason: "missing_staged_match",
      },
    };
  }

  const applied = applyHalfTimeSubstitutions({
    state: stagedProgress.state,
    selectedSide: stagedProgress.selectedSide,
    benchPlayerIds: stagedProgress.selectedBenchPlayerIds,
    decisions: decisions.map((decision) => ({
      outgoingPlayerId: asPlayerId(decision.outgoingPlayerId),
      incomingPlayerId: asPlayerId(decision.incomingPlayerId),
      reasonKey: "half_time_manager_decision",
    })),
  });

  if (applied.status !== "applied") {
    return {
      ...state,
      lastStagedAttempt: {
        status: "invalid",
        blockerKeys: [],
        invalidReason: applied.reason,
        fixtureId: stagedProgress.fixtureBefore.id,
      },
    };
  }

  const refreshed = progressStagedMatchToHalfTime(applied.state);
  const checkpoint = createStagedMatchCheckpoint({
    state: refreshed.state,
    selectedClubSide: stagedProgress.selectedSide,
    selectedClubBenchSlots: durableBenchSlots(state.careerState),
  });
  const careerState = { ...state.careerState, activeMatchCheckpoint: checkpoint };

  return {
    ...state,
    careerState,
    lastStagedAttempt: {
      status: "substitutions_applied",
      blockerKeys: [],
      fixtureId: stagedProgress.fixtureBefore.id,
    },
    stagedProgress: {
      ...stagedProgress,
      recoveredCareerState: careerState,
      state: refreshed.state,
      snapshot: refreshed.snapshot,
    },
  };
}

/** Persists the complete half-time tactical plan without starting the second half. */
export function applyWebHalfTimeTacticalDecision(
  state: WebMatchdayState,
  preparation: MatchPreparationDraft,
): WebMatchdayState {
  const stagedProgress = state.stagedProgress;

  if (state.playedResult !== undefined) {
    return {
      ...state,
      lastStagedAttempt: {
        status: "already_played",
        blockerKeys: ["already_played"],
        fixtureId: state.playedResult.fixtureId,
      },
    };
  }

  if (stagedProgress === undefined) {
    return {
      ...state,
      lastStagedAttempt: {
        status: "invalid",
        blockerKeys: [],
        invalidReason: "missing_staged_match",
      },
    };
  }

  const tacticalPlan = buildHalfTimeTacticalDecisionPlan(stagedProgress, preparation);
  const tacticalDecision = applyHalfTimeSubstitutions({
    state: stagedProgress.state,
    selectedSide: stagedProgress.selectedSide,
    benchPlayerIds: stagedProgress.selectedBenchPlayerIds,
    decisions: [],
    tacticalPlan,
  });

  if (tacticalDecision.status !== "applied") {
    return {
      ...state,
      lastStagedAttempt: {
        status: "invalid",
        blockerKeys: [],
        invalidReason: tacticalDecision.reason,
        ...(tacticalDecision.tacticalPlanFacts === undefined
          ? {}
          : { invalidFactKeys: tacticalDecision.tacticalPlanFacts.map((fact) => fact.key) }),
        fixtureId: stagedProgress.fixtureBefore.id,
      },
    };
  }

  const refreshed = progressStagedMatchToHalfTime(tacticalDecision.state);
  const checkpoint = createStagedMatchCheckpoint({
    state: refreshed.state,
    selectedClubSide: stagedProgress.selectedSide,
    selectedClubBenchSlots: durableBenchSlots(state.careerState),
  });
  const careerState = { ...state.careerState, activeMatchCheckpoint: checkpoint };

  return {
    ...state,
    careerState,
    lastStagedAttempt: {
      status: "substitutions_applied",
      blockerKeys: [],
      fixtureId: stagedProgress.fixtureBefore.id,
    },
    stagedProgress: {
      ...stagedProgress,
      recoveredCareerState: careerState,
      state: refreshed.state,
      snapshot: refreshed.snapshot,
    },
  };
}

/** Completes and atomically commits the already-persisted half-time checkpoint. */
export function completeWebMatchday(state: WebMatchdayState): WebMatchdayState {
  const stagedProgress = state.stagedProgress;
  if (state.playedResult !== undefined) return state;
  if (stagedProgress === undefined) return invalidStagedState(state, "missing_staged_match");

  const fullTime = progressStagedMatchToFullTime(stagedProgress.state);
  if (fullTime.snapshot.fullTimeReport === undefined) {
    return invalidStagedState(state, "missing_full_time_report");
  }

  const selectedLineup = stagedProgress.selectedSide === "home"
    ? stagedProgress.state.initialContext.home.lineup
    : stagedProgress.state.initialContext.away.lineup;
  const progressed = commitStagedCareerFixture({
    careerState: state.careerState,
    report: fullTime.snapshot.fullTimeReport,
    selectedStarterIds: selectedLineup.map((slot) => slot.playerId),
  });

  if (progressed.status !== "advanced") {
    return {
      ...state,
      lastStagedAttempt: {
        status: "invalid",
        blockerKeys: [],
        invalidReason: progressed.reason,
        ...(progressed.fixtureId === undefined ? {} : { fixtureId: progressed.fixtureId }),
      },
    };
  }

  const playedResult: WebMatchdayAdvancedResult = {
    ...progressed,
    careerState: progressed.careerState,
  };

  return {
    careerState: playedResult.careerState,
    lastPlayAttempt: {
      status: "advanced",
      blockerKeys: [],
      fixtureId: playedResult.fixtureId,
    },
    lastStagedAttempt: {
      status: "full_time",
      blockerKeys: [],
      fixtureId: playedResult.fixtureId,
    },
    stagedProgress: {
      ...stagedProgress,
      state: fullTime.state,
      snapshot: fullTime.snapshot,
    },
    playedResult,
  };
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

/** Builds the half-time substitution panel from staged structured facts only. */
export function buildWebHalfTimeSubstitutionPanel(state: WebMatchdayState): WebHalfTimeSubstitutionPanel {
  const stagedProgress = state.stagedProgress;
  const validationReason = state.lastStagedAttempt.status === "invalid" ? state.lastStagedAttempt.invalidReason : undefined;
  const validationFactKeys = state.lastStagedAttempt.status === "invalid" ? state.lastStagedAttempt.invalidFactKeys : undefined;

  if (stagedProgress === undefined || stagedProgress.snapshot.phase !== "half_time") {
    return {
      status: "unavailable",
      lineup: [],
      bench: [],
      appliedSubstitutions: [],
      appliedCount: 0,
      maxCount: 5,
      ...(validationReason === undefined ? {} : { validationReason }),
      ...(validationFactKeys === undefined ? {} : { validationFactKeys }),
    };
  }

  const selectedLineup = stagedProgress.selectedSide === "home"
    ? stagedProgress.state.simulation.context.home.lineup
    : stagedProgress.state.simulation.context.away.lineup;
  const selectedLineupIds = new Set(selectedLineup.map((slot) => slot.playerId));
  const ratingByPlayerId = new Map(stagedProgress.snapshot.playerRatings.map((rating) => [rating.playerId, rating]));
  const lineup = selectedLineup
    .map((slot) => halfTimePlayerOption(stagedProgress, slot.playerId, slot.roleKey, ratingByPlayerId))
    .toSorted(compareOutgoingSubstitutionOptions);
  const bench = stagedProgress.selectedBenchPlayerIds
    .filter((playerId) => !selectedLineupIds.has(playerId))
    .map((playerId) => halfTimePlayerOption(stagedProgress, playerId, playerBroadRoleKey(stagedProgress.recoveredCareerState.gameState.players[playerId]), ratingByPlayerId))
    .toSorted(compareIncomingSubstitutionOptions);

  return {
    status: "available",
    lineup,
    bench,
    appliedSubstitutions: stagedProgress.snapshot.appliedSubstitutions.map((substitution) => ({
      outgoingPlayerName: playerName(stagedProgress.recoveredCareerState, substitution.outgoingPlayerId),
      incomingPlayerName: playerName(stagedProgress.recoveredCareerState, substitution.incomingPlayerId),
    })),
    appliedCount: stagedProgress.snapshot.appliedSubstitutions.length,
    maxCount: 5,
    ...(validationReason === undefined ? {} : { validationReason }),
    ...(validationFactKeys === undefined ? {} : { validationFactKeys }),
  };
}

/** Builds the selected-club half-time tactical decision from the shared board state. */
export function buildWebHalfTimeTacticalDecisionPlan(
  state: WebMatchdayState,
  preparation: MatchPreparationDraft,
): HalfTimeTacticalDecisionPlan | undefined {
  const stagedProgress = state.stagedProgress;

  if (stagedProgress === undefined || stagedProgress.snapshot.phase !== "half_time") {
    return undefined;
  }

  return buildHalfTimeTacticalDecisionPlan(stagedProgress, preparation);
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
      hasSavedLineup: preparation?.isSaved === true && completeLineupCount(preparation) === CAREER_DEFAULT_LINEUP_SIZE,
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
  const stagedProgress = state.stagedProgress;
  const playedResult = state.playedResult;
  const fixture = playedResult?.fixtureBefore ?? stagedProgress?.fixtureBefore ?? nextFixtureOrUndefined(state.careerState);

  if (fixture === undefined) {
    throw new Error("Cannot build matchday phase view without a fixture");
  }

  const snapshot = stagedProgress?.snapshot;
  const phaseEvents = playedResult !== undefined
    ? eventInputs(
        playedResult,
        clubInput(playedResult.careerState, playedResult.fixtureAfter.homeClubId),
        clubInput(playedResult.careerState, playedResult.fixtureAfter.awayClubId),
      )
    : stagedProgress === undefined || snapshot === undefined
      ? []
      : phaseEventInputs(stagedProgress, snapshot.events);
  const phasePlayers = playedResult !== undefined
    ? completedPhasePlayerInputs(playedResult)
    : stagedProgress === undefined || snapshot === undefined
      ? []
      : phasePlayerInputs(stagedProgress, snapshot.playerRatings);

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
    events: phaseEvents,
    players: phasePlayers,
    halfTimeSubstitutions: {
      canApply: snapshot?.phase === "half_time",
      appliedCount: snapshot?.appliedSubstitutions.length ?? 0,
      maxCount: 5,
    },
    ...(state.playedResult === undefined
      ? {}
      : {
          conditionChanges: resultInput(state.playedResult).conditionChanges,
          playerStateChanges: resultInput(state.playedResult).playerStateChanges,
          nextActionId: "back_to_dashboard" as const,
        }),
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
          shooterPlayerId: event.shooterPlayerId,
          ...(event.primaryDefenderPlayerId === undefined ? {} : { primaryDefenderPlayerId: event.primaryDefenderPlayerId }),
        }];
    }
  });
}

function buildHalfTimeTacticalDecisionPlan(
  stagedProgress: WebStagedMatchdayProgress,
  preparation: MatchPreparationDraft,
): HalfTimeTacticalDecisionPlan {
  const lineupSlots = preparation.tacticalBoardDraft.slots.map((slot) => ({
    slotId: slot.slotId,
    playerId: slot.playerId === null ? null : asPlayerId(slot.playerId),
    roleKey: engineRoleKeyForBoardRole(slot.role),
    positionKey: slot.role,
  }));

  return {
    baseFormationId: preparation.tacticalBoardDraft.baseFormationId,
    currentShape: selectCurrentTacticalBoardShape(preparation.tacticalBoardDraft.slots),
    lineupSlots,
    benchSlots: TACTICAL_BENCH_SLOT_IDS.map((slotId) => {
      const selectedPlayerId = preparation.selectedBenchPlayerIdsBySlot[slotId];

      return {
        slotId,
        playerId: selectedPlayerId === undefined ? null : asPlayerId(selectedPlayerId),
      };
    }),
    substitutions: deriveHalfTimeSubstitutionDecisions(stagedProgress, lineupSlots),
  };
}

function deriveHalfTimeSubstitutionDecisions(
  stagedProgress: WebStagedMatchdayProgress,
  nextLineupSlots: HalfTimeTacticalDecisionPlan["lineupSlots"],
): readonly MatchSubstitutionDecision[] {
  const currentLineup = stagedProgress.selectedSide === "home"
    ? stagedProgress.state.simulation.context.home.lineup
    : stagedProgress.state.simulation.context.away.lineup;
  const currentPlayerIds = new Set(currentLineup.map((slot) => slot.playerId));
  const nextPlayerIds = new Set(
    nextLineupSlots.flatMap((slot) => (slot.playerId === null ? [] : [slot.playerId])),
  );
  const incomingPlayerIds = [...nextPlayerIds].filter((playerId) => !currentPlayerIds.has(playerId));
  const outgoingPlayerIds = currentLineup
    .map((slot) => slot.playerId)
    .filter((playerId) => !nextPlayerIds.has(playerId));

  return incomingPlayerIds.flatMap((incomingPlayerId, index) => {
    const outgoingPlayerId = outgoingPlayerIds[index];

    if (outgoingPlayerId === undefined) {
      return [];
    }

    return [{
      outgoingPlayerId,
      incomingPlayerId,
      reasonKey: "half_time_manager_decision",
    }];
  });
}

type WebMatchdayKickoffPrepared =
  | {
      readonly status: "ready";
      readonly fixture: Fixture;
      readonly recoveredCareerState: CareerState;
      readonly matchContext: MatchContext;
    }
  | {
      readonly status: "not_ready";
      readonly state: WebMatchdayState;
    };

function prepareWebMatchdayKickoff(
  state: WebMatchdayState,
  preparation: MatchPreparationDraft,
): WebMatchdayKickoffPrepared {
  const preparationBlockers = validatePreparation(preparation);

  if (preparationBlockers.length > 0) {
    return {
      status: "not_ready",
      state: {
        ...state,
        lastStagedAttempt: {
          status: "blocked",
          blockerKeys: preparationBlockers,
        },
      },
    };
  }

  const preparedCareerState = state.careerState;
  const nextFixture = findNextCareerFixture(preparedCareerState);

  if (nextFixture.status !== "found") {
    return {
      status: "not_ready",
      state: {
        ...state,
        lastStagedAttempt: {
          status: nextFixture.status === "none" ? "invalid" : "invalid",
          blockerKeys: [],
          ...(nextFixture.status === "invalid" ? { invalidReason: nextFixture.reason } : { invalidReason: "none" }),
          ...("fixtureId" in nextFixture && nextFixture.fixtureId !== undefined ? { fixtureId: nextFixture.fixtureId } : {}),
        },
      },
    };
  }

  const selectedClub = preparedCareerState.gameState.clubs[preparedCareerState.selectedClubId];
  const preMatchRecovery = applyCareerWeeklyRecovery({
    playerStates: preparedCareerState.gameState.playerStates,
    playerIds: selectedClub?.playerIds ?? [],
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
  const teamsByClubId = buildCareerTeamsByClubId(recoveredCareerState, {
    roleWeights: contentConfig.roleWeights,
    stateMultiplierCurves: contentConfig.stateMultiplierCurves,
  });
  const home = teamsByClubId[nextFixture.fixture.homeClubId];
  const away = teamsByClubId[nextFixture.fixture.awayClubId];

  if (home === undefined || away === undefined) {
    return {
      status: "not_ready",
      state: {
        ...state,
        lastStagedAttempt: {
          status: "invalid",
          blockerKeys: [],
          invalidReason: "missing_team_context",
          fixtureId: nextFixture.fixtureId,
        },
      },
    };
  }

  return {
    status: "ready",
    fixture: nextFixture.fixture,
    recoveredCareerState,
    matchContext: {
      fixtureId: nextFixture.fixtureId,
      seed: recoveredCareerState.gameState.meta.seed,
      home,
      away,
      engineConfig: contentConfig.matchEngineConfig,
    },
  };
}

/** Recreates canonical match tuning from the loaded career's immutable world seed. */
function matchdayContentConfig(careerState: CareerState): MatchdayContentConfig {
  const league = createFakeLeagueSystem({
    worldSeed: careerState.careerWorld?.worldSeed ?? careerState.gameState.meta.seed,
  });

  return {
    matchEngineConfig: league.matchEngineConfig,
    roleWeights: league.roleWeights,
    stateMultiplierCurves: league.stateMultiplierCurves,
  };
}

/** Restores the engine state and UI snapshot represented by the active checkpoint. */
function restoreWebStagedProgress(careerState: CareerState): WebStagedMatchdayProgress | undefined {
  const checkpoint = careerState.activeMatchCheckpoint;
  if (checkpoint === undefined) return undefined;
  const fixtureBefore = careerState.gameState.fixtures[checkpoint.fixtureId];
  if (fixtureBefore === undefined) throw new Error(`Active match fixture is missing: ${checkpoint.fixtureId}`);
  const state = restoreStagedMatchCheckpoint(checkpoint);
  const snapshot = checkpoint.phase === "half_time"
    ? progressStagedMatchToHalfTime(state).snapshot
    : preMatchSnapshot(state);

  return {
    fixtureBefore,
    selectedSide: checkpoint.selectedClubSide,
    selectedBenchPlayerIds: checkpoint.selectedClubBenchSlots.flatMap((slot) => slot.playerId === null ? [] : [slot.playerId]),
    recoveredCareerState: careerState,
    state,
    snapshot,
  };
}

/** Builds the zero-minute snapshot without advancing the deterministic RNG stream. */
function preMatchSnapshot(state: StagedMatchState): StagedMatchSnapshot {
  return {
    phase: state.phase,
    currentMinute: state.simulation.minute,
    score: state.simulation.score,
    stats: state.simulation.stats,
    events: state.events,
    playerRatings: [],
    appliedSubstitutions: state.appliedSubstitutions,
    ...(state.halfTimeTacticalPlan === undefined ? {} : { halfTimeTacticalPlan: state.halfTimeTacticalPlan }),
  };
}

/** Converts the saved eight-player bench to the checkpoint's nullable slot contract. */
function durableBenchSlots(careerState: CareerState) {
  return (careerState.matchPreparation?.benchSlots ?? []).map((slot) => ({
    slotId: slot.slotKey,
    playerId: slot.playerId,
  }));
}

/** Returns one stable invalid adapter state without mutating durable facts. */
function invalidStagedState(state: WebMatchdayState, invalidReason: string): WebMatchdayState {
  return {
    ...state,
    lastStagedAttempt: {
      status: "invalid",
      blockerKeys: [],
      invalidReason,
      ...(state.stagedProgress === undefined ? {} : { fixtureId: state.stagedProgress.fixtureBefore.id }),
    },
  };
}

function validatePreparation(preparation: MatchPreparationDraft): readonly WebMatchdayBlockerKey[] {
  const blockers: WebMatchdayBlockerKey[] = [];

  if (preparation.isSaved !== true || completeLineupCount(preparation) !== CAREER_DEFAULT_LINEUP_SIZE) {
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

function buildCareerTeamsByClubId(
  careerState: CareerState,
  contentConfig: Pick<MatchdayContentConfig, "roleWeights" | "stateMultiplierCurves">,
): Readonly<Record<ClubId, MatchTeamContext>> {
  const teamsByClubId: Partial<Record<ClubId, MatchTeamContext>> = {};

  for (const clubId of careerState.gameState.clubIds) {
    const club = careerState.gameState.clubs[clubId];

    if (club === undefined) {
      continue;
    }

    if (clubId === careerState.selectedClubId && careerState.matchPreparation?.selectedLineup !== undefined && careerState.matchPreparation.tactic !== undefined) {
      teamsByClubId[clubId] = buildTacticTeamContext({
        lineup: {
          ...careerState.matchPreparation.selectedLineup,
          slots: careerState.matchPreparation.selectedLineup.slots.map((slot) => ({
            ...slot,
            roleKey: engineRoleKeyForPersistedRole(slot.roleKey),
          })),
        },
        tactic: careerState.matchPreparation.tactic,
        requiredLineupSize: CAREER_DEFAULT_LINEUP_SIZE,
        players: careerState.gameState.players,
        roleWeights: contentConfig.roleWeights,
        playerStates: careerState.gameState.playerStates,
        stateMultiplierCurves: contentConfig.stateMultiplierCurves,
      });
      continue;
    }

    const lineup = defaultOpponentLineupFromRoster(club.playerIds);
    teamsByClubId[clubId] = {
      clubId,
      lineup,
      strength: deriveTeamStrength({
        lineup,
        players: careerState.gameState.players,
        playerStates: careerState.gameState.playerStates,
        roleWeights: contentConfig.roleWeights,
        stateMultiplierCurves: contentConfig.stateMultiplierCurves,
      }),
      tacticalDistribution: {
        directness: 0.5,
        pressing: 0.5,
        width: 0.5,
        risk: 0.5,
      },
    };
  }

  return teamsByClubId as Readonly<Record<ClubId, MatchTeamContext>>;
}

/** Maps detailed tactical-board roles to the four current engine departments. */
function engineRoleKeyForPersistedRole(role: string): string {
  if (role === "goalkeeper") return "gk";
  if (role === "right_full_back" || role === "center_back" || role === "left_full_back") return "defender";
  if (role === "right_winger" || role === "left_winger" || role === "striker") return "attacker";
  return "midfielder";
}

function defaultOpponentLineupFromRoster(playerIds: readonly PlayerId[]): readonly LineupSlot[] {
  const lineup: LineupSlot[] = [];

  for (let index = 0; index < CAREER_DEFAULT_LINEUP_SIZE; index += 1) {
    const rosterPlayerId = playerIds[index];

    if (rosterPlayerId === undefined) {
      continue;
    }

    const slotNumber = index + 1;
    lineup.push({
      slotId: `slot:${String(slotNumber).padStart(2, "0")}`,
      playerId: rosterPlayerId,
      roleKey: defaultRoleKeyForSlot(slotNumber),
    });
  }

  return lineup;
}

function defaultRoleKeyForSlot(slotNumber: number): string {
  if (slotNumber === 1) {
    return "gk";
  }

  if (slotNumber <= 5) {
    return "defender";
  }

  if (slotNumber <= 9) {
    return "midfielder";
  }

  return "attacker";
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

    if (eventMinute === undefined) {
      return [];
    }

    return [{
      eventId: `${result.report.fixtureId}:event:${String(index + 1).padStart(3, "0")}`,
      minute: eventMinute,
      sequence: index,
      kind: event.type,
      club: eventSide(event) === "home" ? homeClub : awayClub,
      ...primaryPlayerName(result.careerState, event),
      ...secondaryPlayerName(result.careerState, event),
      detailKeys: eventDetailKeys(event),
    }];
  });
}

function phaseEventInputs(
  stagedProgress: WebStagedMatchdayProgress,
  events: readonly MatchStepEvent[],
): BuildCareerMatchdayPhaseViewInput["events"] {
  const homeClub = clubInput(stagedProgress.recoveredCareerState, stagedProgress.fixtureBefore.homeClubId);
  const awayClub = clubInput(stagedProgress.recoveredCareerState, stagedProgress.fixtureBefore.awayClubId);

  return events.flatMap((event, index) => {
    if (event.type !== "shot_outcome") {
      return [];
    }

    return [{
      eventId: `${stagedProgress.fixtureBefore.id}:phase-event:${String(index + 1).padStart(3, "0")}`,
      minute: event.minute,
      sequence: index,
      kind: event.outcome === "goal" ? "goal" : event.outcome,
      club: event.side === "home" ? homeClub : awayClub,
      ...phasePrimaryPlayerName(stagedProgress.recoveredCareerState, event),
      ...phaseSecondaryPlayerName(stagedProgress.recoveredCareerState, event),
      detailKeys: [`chance:${event.chanceType}`, `shot:${event.shotType}`],
    }];
  });
}

function phasePlayerInputs(
  stagedProgress: WebStagedMatchdayProgress,
  ratings: readonly PlayerMatchRatingRow[],
): BuildCareerMatchdayPhaseViewInput["players"] {
  return ratings.map((rating) => {
    const clubId = rating.side === "home" ? stagedProgress.fixtureBefore.homeClubId : stagedProgress.fixtureBefore.awayClubId;
    const slot = lineupSlotForPlayer(stagedProgress.state.simulation.context, rating.side, rating.playerId);

    const condition = stagedProgress.recoveredCareerState.gameState.playerStates[rating.playerId]?.fitness;

    return {
      playerId: rating.playerId,
      playerName: playerName(stagedProgress.recoveredCareerState, rating.playerId),
      club: clubInput(stagedProgress.recoveredCareerState, clubId),
      ...(slot?.roleKey === undefined ? {} : { roleKey: slot.roleKey }),
      rating: rating.rating,
      ...(condition === undefined ? {} : { condition }),
      status: substitutedStatus(stagedProgress, rating.playerId),
      goals: rating.goals,
      assists: rating.assists,
      shots: rating.shots,
      shotsOnTarget: rating.shotsOnTarget,
      saves: rating.saves,
      blocks: rating.blocks,
    };
  });
}

function halfTimePlayerOption(
  stagedProgress: WebStagedMatchdayProgress,
  playerId: PlayerId,
  roleKey: string | undefined,
  ratingByPlayerId: ReadonlyMap<PlayerId, PlayerMatchRatingRow>,
): WebHalfTimeSubstitutionPlayerOption {
  const condition = stagedProgress.recoveredCareerState.gameState.playerStates[playerId]?.fitness;
  const rating = ratingByPlayerId.get(playerId)?.rating;

  return {
    playerId,
    playerName: playerName(stagedProgress.recoveredCareerState, playerId),
    ...(roleKey === undefined ? {} : { roleKey }),
    ...(rating === undefined ? {} : { rating }),
    ...(condition === undefined ? {} : { condition }),
  };
}

function compareOutgoingSubstitutionOptions(
  first: WebHalfTimeSubstitutionPlayerOption,
  second: WebHalfTimeSubstitutionPlayerOption,
): number {
  return (first.rating ?? 10) - (second.rating ?? 10)
    || (first.condition ?? 100) - (second.condition ?? 100)
    || first.playerName.localeCompare(second.playerName)
    || first.playerId.localeCompare(second.playerId);
}

function compareIncomingSubstitutionOptions(
  first: WebHalfTimeSubstitutionPlayerOption,
  second: WebHalfTimeSubstitutionPlayerOption,
): number {
  return (second.condition ?? 0) - (first.condition ?? 0)
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

/** Rebuilds both starting lineups from durable preparation and club rosters. */
function finalPlayerRegistrations(result: WebMatchdayAdvancedResult): readonly Readonly<{
  playerId: PlayerId;
  side: MatchSide;
  roleKey: string;
}>[] {
  const slotsForClub = (clubId: ClubId): readonly Readonly<{ playerId: PlayerId; roleKey: string }>[] => clubId === result.careerState.selectedClubId
    ? result.careerState.matchPreparation?.selectedLineup?.slots ?? []
    : defaultOpponentLineupFromRoster(result.careerState.gameState.clubs[clubId]?.playerIds ?? []);

  return (["home", "away"] as const).flatMap((side) => {
    const clubId = side === "home" ? result.fixtureAfter.homeClubId : result.fixtureAfter.awayClubId;
    return slotsForClub(clubId).map((slot) => ({
      playerId: slot.playerId,
      side,
      roleKey: slot.roleKey,
    }));
  });
}

function lineupSlotForPlayer(
  context: StagedMatchState["simulation"]["context"],
  side: MatchSide,
  playerId: PlayerId,
): LineupSlot | undefined {
  const lineup = side === "home" ? context.home.lineup : context.away.lineup;
  return lineup.find((slot) => slot.playerId === playerId);
}

function substitutedStatus(
  stagedProgress: WebStagedMatchdayProgress,
  playerId: PlayerId,
): BuildCareerMatchdayPhaseViewInput["players"][number]["status"] {
  if (stagedProgress.snapshot.appliedSubstitutions.some((substitution) => substitution.incomingPlayerId === playerId)) {
    return "substituted_on";
  }

  if (stagedProgress.snapshot.appliedSubstitutions.some((substitution) => substitution.outgoingPlayerId === playerId)) {
    return "substituted_off";
  }

  return "on_pitch";
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
  const secondaryPlayerId = event.type === "goal" ? event.assistPlayerId : event.type === "block" ? event.primaryDefenderPlayerId : undefined;

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
