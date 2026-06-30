import {
  applyCareerWeeklyRecovery,
  applyHalfTimeSubstitutions,
  buildTacticTeamContext,
  computePlayerMatchStats,
  createInitialStagedMatchState,
  deriveTeamStrength,
  findNextCareerFixture,
  progressStagedMatchToFullTime,
  progressStagedMatchToHalfTime,
  progressNextCareerFixture,
  type ApplyCareerWeeklyRecoveryResult,
  type LineupSlot,
  type MatchContext,
  type MatchEngineConfig,
  type MatchSide,
  type MatchStepEvent,
  type MatchTeamContext,
  type HalfTimeTacticalDecisionPlan,
  type PlayerMatchRatingRow,
  type PlayerStateMultiplierCurves,
  type ProgressCareerFixtureAdvanced,
  type ProgressCareerFixtureResult,
  type RoleWeightProfile,
  type StagedMatchSnapshot,
  type StagedMatchState,
  type MatchSubstitutionDecision,
} from "@game/engine";
import { fromISO, toISO } from "@game/shared";
import {
  buildCareerMatchdayPhaseView,
  buildCareerMatchdayView,
  type BuildCareerMatchdayPhaseViewInput,
  type BuildCareerMatchdayViewInput,
  type CareerMatchdayPhaseView,
  type CareerMatchdayView,
} from "@game/ui";

import { WEB_DEMO_DASHBOARD_SAVE_ID, WEB_DEMO_DASHBOARD_SEED } from "../dashboard/build-demo-career-dashboard";
import type { DemoMatchPreparationState } from "../match-preparation/match-preparation-demo";
import { TACTICAL_BENCH_SLOT_IDS } from "../tactics-board/tactical-board-bench";
import { selectCurrentTacticalBoardShape } from "../tactics-board/tactical-board-formations";
import type { TacticalBoardRoleCode } from "../tactics-board/tactical-board-types";

type CareerState = Parameters<typeof progressNextCareerFixture>[0]["careerState"];
type GameState = CareerState["gameState"];
type ClubId = CareerState["selectedClubId"];
type FixtureId = GameState["fixtureIds"][number];
type Fixture = GameState["fixtures"][FixtureId];
type Club = GameState["clubs"][ClubId];
type PlayerId = GameState["playerIds"][number];
type Player = GameState["players"][PlayerId];
type PlayerDynamicState = GameState["playerStates"][PlayerId];
type PlayerPosition = Player["naturalPositions"][number];
type PlayerRole = NonNullable<Player["primaryRole"]>;
type TacticSetup = NonNullable<NonNullable<CareerState["matchPreparation"]>["tactic"]>;
type MatchReport = ProgressCareerFixtureAdvanced["report"];
type MatchEvent = MatchReport["events"][number];
type MatchEventSide = "home" | "away";
type AbilityValue = Player["abilities"]["technical"]["finishing"];
type StateValue = PlayerDynamicState["fitness"];
type GameDate = GameState["calendar"]["currentDate"];
type SaveId = CareerState["saveId"];
type CompetitionId = Fixture["competitionId"];
type SeasonId = GameState["calendar"]["currentSeasonId"];
type Money = CareerState["marketState"]["clubBudgets"][ClubId]["transferBudget"];

const CAREER_DEFAULT_LINEUP_SIZE = 11;
const CAREER_STATE_SCHEMA_VERSION = 1;
const REQUIRED_BENCH_SIZE = 8;
const WEB_DEMO_WORLD_GENERATOR_VERSION = 1;
const WEB_DEMO_SELECTED_PLAYER_NAMES: readonly DemoPlayerSeed[] = [
  { firstName: "Davide", lastName: "Valentini", position: "gk", role: "goalkeeper", ability: 10 },
  { firstName: "Enrico", lastName: "Magnani", position: "rb", role: "full_back", ability: 9 },
  { firstName: "Davide", lastName: "Romano", position: "cb", role: "center_back", ability: 10 },
  { firstName: "Luca", lastName: "Franchi", position: "cb", role: "center_back", ability: 10 },
  { firstName: "Marko", lastName: "Milosevic", position: "lb", role: "full_back", ability: 9 },
  { firstName: "Matteo", lastName: "Pavan", position: "cm", role: "central_midfielder", ability: 11 },
  { firstName: "Giorgio", lastName: "Mazza", position: "cm", role: "central_midfielder", ability: 10 },
  { firstName: "Enrico", lastName: "Rosati", position: "am", role: "attacking_midfielder", ability: 9 },
  { firstName: "Dario", lastName: "Kovac", position: "am", role: "attacking_midfielder", ability: 9 },
  { firstName: "Nico", lastName: "Rinaldi", position: "st", role: "striker", ability: 11 },
  { firstName: "Nico", lastName: "Morandi", position: "st", role: "striker", ability: 10 },
  { firstName: "Marco", lastName: "Esposito", position: "gk", role: "goalkeeper", ability: 8 },
  { firstName: "Andrea", lastName: "Sala", position: "cb", role: "center_back", ability: 9 },
  { firstName: "Giorgio", lastName: "Bosco", position: "lb", role: "full_back", ability: 8 },
  { firstName: "Theo", lastName: "Rousseau", position: "cm", role: "central_midfielder", ability: 9 },
  { firstName: "Ivan", lastName: "Radic", position: "st", role: "striker", ability: 9 },
  { firstName: "Kaito", lastName: "Tanaka", position: "rw", role: "winger", ability: 8 },
  { firstName: "Nico", lastName: "Pavoni", position: "rb", role: "full_back", ability: 8 },
  { firstName: "Matteo", lastName: "Guerra", position: "dm", role: "defensive_midfielder", ability: 10 },
  { firstName: "Enrico", lastName: "Bonacina", position: "lw", role: "winger", ability: 9 },
  { firstName: "Dario", lastName: "Ricci", position: "cb", role: "center_back", ability: 8 },
  { firstName: "Luca", lastName: "Moretti", position: "cm", role: "central_midfielder", ability: 8 },
];
const WEB_DEMO_OPPONENT_PLAYER_NAMES: readonly DemoPlayerSeed[] = [
  { firstName: "Federico", lastName: "Fontana", position: "gk", role: "goalkeeper", ability: 10 },
  { firstName: "Alessio", lastName: "Greco", position: "rb", role: "full_back", ability: 9 },
  { firstName: "Marco", lastName: "Neri", position: "cb", role: "center_back", ability: 10 },
  { firstName: "Gabriele", lastName: "Sarti", position: "cb", role: "center_back", ability: 9 },
  { firstName: "Tommaso", lastName: "Leoni", position: "lb", role: "full_back", ability: 9 },
  { firstName: "Riccardo", lastName: "Ferri", position: "cm", role: "central_midfielder", ability: 10 },
  { firstName: "Lorenzo", lastName: "Marini", position: "cm", role: "central_midfielder", ability: 10 },
  { firstName: "Samuele", lastName: "Riva", position: "am", role: "attacking_midfielder", ability: 9 },
  { firstName: "Andrea", lastName: "Conti", position: "cm", role: "central_midfielder", ability: 9 },
  { firstName: "Filippo", lastName: "Costa", position: "st", role: "striker", ability: 10 },
  { firstName: "Matias", lastName: "Silva", position: "st", role: "striker", ability: 10 },
  { firstName: "Pietro", lastName: "Rossi", position: "gk", role: "goalkeeper", ability: 8 },
  { firstName: "Nicolo", lastName: "Galli", position: "cb", role: "center_back", ability: 8 },
  { firstName: "Diego", lastName: "Barbieri", position: "lb", role: "full_back", ability: 8 },
  { firstName: "Manuel", lastName: "Lombardi", position: "cm", role: "central_midfielder", ability: 8 },
  { firstName: "Cristian", lastName: "De Luca", position: "st", role: "striker", ability: 8 },
  { firstName: "Edoardo", lastName: "Pellegrini", position: "rw", role: "winger", ability: 8 },
  { firstName: "Fabio", lastName: "Morelli", position: "rb", role: "full_back", ability: 8 },
  { firstName: "Michele", lastName: "Serra", position: "dm", role: "defensive_midfielder", ability: 8 },
  { firstName: "Giacomo", lastName: "Villa", position: "lw", role: "winger", ability: 8 },
  { firstName: "Leonardo", lastName: "Bassi", position: "cb", role: "center_back", ability: 8 },
  { firstName: "Davide", lastName: "Mancini", position: "cm", role: "central_midfielder", ability: 8 },
];
const WEB_DEMO_MATCH_ENGINE_CONFIG: MatchEngineConfig = {
  minuteCount: 90,
  rates: {
    baseOpportunityRatePerMinute: 0.09,
    maxOpportunityRatePerMinute: 0.24,
  },
  conversionBands: [
    { bandKey: "low", minQualityInclusive: 0, maxQualityExclusive: 0.45, goalProbability: 0.105 },
    { bandKey: "medium", minQualityInclusive: 0.45, maxQualityExclusive: 0.65, goalProbability: 0.2 },
    { bandKey: "high", minQualityInclusive: 0.65, maxQualityExclusive: 1.01, goalProbability: 0.35 },
  ],
  homeAdvantageFactor: 1.1,
  tacticalDistributionCaps: {
    directness: { minInclusive: 0, maxInclusive: 1 },
    pressing: { minInclusive: 0, maxInclusive: 1 },
    width: { minInclusive: 0, maxInclusive: 1 },
    risk: { minInclusive: 0, maxInclusive: 1 },
  },
};
const WEB_DEMO_ROLE_WEIGHTS: Readonly<Record<string, RoleWeightProfile>> = {
  gk: {
    roleKey: "gk",
    department: "goalkeeper",
    abilityWeights: {
      "goalkeeping.reflexes": 3,
      "goalkeeping.handling": 2,
      "goalkeeping.goalkeeperPositioning": 2,
      "goalkeeping.footwork": 1,
    },
  },
  defender: {
    roleKey: "defender",
    department: "defense",
    abilityWeights: {
      "technical.tackling": 2,
      "physical.strength": 1,
      "physical.heading": 1,
      "mental.positioning": 2,
      "mental.anticipation": 1,
    },
  },
  midfielder: {
    roleKey: "midfielder",
    department: "midfield",
    abilityWeights: {
      "technical.passing": 2,
      "technical.technique": 1,
      "physical.stamina": 1,
      "mental.vision": 2,
      "mental.determination": 1,
    },
  },
  attacker: {
    roleKey: "attacker",
    department: "attack",
    abilityWeights: {
      "technical.finishing": 3,
      "technical.dribbling": 1,
      "physical.pace": 1,
      "mental.composure": 2,
      "physical.heading": 1,
    },
  },
};
const WEB_DEMO_STATE_MULTIPLIER_CURVES: PlayerStateMultiplierCurves = {
  fitness: [
    { maxValueInclusive: 39, multiplier: 0.88 },
    { maxValueInclusive: 59, multiplier: 0.94 },
    { maxValueInclusive: 79, multiplier: 0.98 },
    { maxValueInclusive: 100, multiplier: 1 },
  ],
};

/** Stable validation blockers for the web demo matchday adapter. */
export type DemoMatchdayBlockerKey =
  | "missing_saved_lineup"
  | "missing_saved_bench"
  | "missing_saved_tactic"
  | "already_played";

/** Last action state stored by the browser adapter. */
export type DemoMatchdayPlayStatus = "idle" | "blocked" | "advanced" | "invalid" | "none" | "already_played";

/** Current staged matchday phase stored by the browser adapter. */
export type DemoMatchdayStagedStatus =
  | "idle"
  | "blocked"
  | "at_half_time"
  | "substitutions_applied"
  | "full_time"
  | "invalid"
  | "already_played";

/** A single-use web matchday play attempt. */
export interface DemoMatchdayPlayAttempt {
  /** Machine-readable play state. */
  readonly status: DemoMatchdayPlayStatus;
  /** Stable blockers when the manager has not prepared the match. */
  readonly blockerKeys: readonly DemoMatchdayBlockerKey[];
  /** Fixture connected to this attempt when known. */
  readonly fixtureId?: string;
  /** Engine invalid reason when progression refuses to run. */
  readonly invalidReason?: string;
}

/** String-based substitution decision accepted by the web adapter. */
export interface DemoHalfTimeSubstitutionDecision {
  /** Player currently on the pitch who should leave. */
  readonly outgoingPlayerId: string;
  /** Bench player who should enter. */
  readonly incomingPlayerId: string;
}

/** Player option shown by the web half-time substitution panel. */
export interface DemoHalfTimeSubstitutionPlayerOption {
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
export interface DemoHalfTimeAppliedSubstitutionView {
  /** Player who left the pitch. */
  readonly outgoingPlayerName: string;
  /** Player who entered the pitch. */
  readonly incomingPlayerName: string;
}

/** Web-specific half-time substitution facts derived from staged demo state. */
export interface DemoHalfTimeSubstitutionPanel {
  /** Whether half-time substitution controls can be shown. */
  readonly status: "available" | "unavailable";
  /** Selected-club on-pitch players. */
  readonly lineup: readonly DemoHalfTimeSubstitutionPlayerOption[];
  /** Selected-club bench players not already on the pitch. */
  readonly bench: readonly DemoHalfTimeSubstitutionPlayerOption[];
  /** Applied substitution summary rows. */
  readonly appliedSubstitutions: readonly DemoHalfTimeAppliedSubstitutionView[];
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
export interface DemoMatchdayStagedAttempt {
  /** Machine-readable staged state. */
  readonly status: DemoMatchdayStagedStatus;
  /** Stable blockers when the manager has not prepared the match. */
  readonly blockerKeys: readonly DemoMatchdayBlockerKey[];
  /** Fixture connected to this attempt when known. */
  readonly fixtureId?: string;
  /** Engine invalid reason when staged progression refuses to run. */
  readonly invalidReason?: string;
  /** Structured tactical-plan facts when second-half decision validation fails. */
  readonly invalidFactKeys?: readonly string[];
}

/** Successful web matchday play with the engine result and pre-match recovery. */
export interface DemoMatchdayAdvancedResult extends ProgressCareerFixtureAdvanced {
  /** Recovery applied before kickoff so condition changes start from matchday truth. */
  readonly preMatchRecovery: ApplyCareerWeeklyRecoveryResult;
}

/** In-memory staged match data for the web demo adapter. */
export interface DemoStagedMatchdayProgress {
  /** Fixture before any result is applied. */
  readonly fixtureBefore: Fixture;
  /** Selected-club side for this fixture. */
  readonly selectedSide: MatchSide;
  /** Selected-club bench available for half-time substitutions. */
  readonly selectedBenchPlayerIds: readonly PlayerId[];
  /** Recovery applied before kickoff. */
  readonly preMatchRecovery: ApplyCareerWeeklyRecoveryResult;
  /** Recovered and prepared career state used at kickoff. */
  readonly recoveredCareerState: CareerState;
  /** Current staged engine state. */
  readonly state: StagedMatchState;
  /** Current staged snapshot for phase-aware UI read models. */
  readonly snapshot: StagedMatchSnapshot;
}

/** In-memory web adapter state for the playable matchday slice. */
export interface DemoMatchdayState {
  /** Current generated career state used by the web demo adapter. */
  readonly careerState: CareerState;
  /** Last structured play attempt. */
  readonly lastPlayAttempt: DemoMatchdayPlayAttempt;
  /** Last staged progression attempt. */
  readonly lastStagedAttempt: DemoMatchdayStagedAttempt;
  /** Current staged match progress, set after first-half simulation starts. */
  readonly stagedProgress?: DemoStagedMatchdayProgress;
  /** Played fixture result, set only after the first successful play. */
  readonly playedResult?: DemoMatchdayAdvancedResult;
}

const asClubId = (value: string): ClubId => value as ClubId;
const asCompetitionId = (value: string): CompetitionId => value as CompetitionId;
const asFixtureId = (value: string): FixtureId => value as FixtureId;
const asGameDate = (value: number): GameDate => value as GameDate;
const asMoney = (value: number): Money => value as Money;
const asPlayerId = (value: string): PlayerId => value as PlayerId;
const asSaveId = (value: string): SaveId => value as SaveId;
const asSeasonId = (value: string): SeasonId => value as SeasonId;
const asStateValue = (value: number): StateValue => value as StateValue;
const asAbilityValue = (value: number): AbilityValue => value as AbilityValue;

/** Creates the deterministic web career state used until real save loading exists. */
export function createInitialDemoMatchdayState(): DemoMatchdayState {
  return {
    careerState: createDemoCareerState(),
    lastPlayAttempt: {
      status: "idle",
      blockerKeys: [],
    },
    lastStagedAttempt: {
      status: "idle",
      blockerKeys: [],
    },
  };
}

/**
 * Plays the prepared selected-club fixture exactly once through the engine.
 *
 * This is a browser adapter, not a new engine rule. It translates the current
 * in-memory preparation draft into domain lineup/tactic data, runs the same
 * `progressNextCareerFixture` use case used by CLI flows, and stores structured
 * facts for later presentation.
 */
export function playDemoMatchdayFixture(
  state: DemoMatchdayState,
  preparation: DemoMatchPreparationState,
): DemoMatchdayState {
  if (state.playedResult !== undefined) {
    return {
      ...state,
      lastPlayAttempt: {
        status: "already_played",
        blockerKeys: ["already_played"],
        fixtureId: state.playedResult.fixtureId,
      },
    };
  }

  const preparationBlockers = validatePreparation(preparation);
  if (preparationBlockers.length > 0) {
    return {
      ...state,
      lastPlayAttempt: {
        status: "blocked",
        blockerKeys: preparationBlockers,
      },
    };
  }

  const preparedCareerState = withSelectedClubPreparation(state.careerState, preparation);
  const nextFixture = findNextCareerFixture(preparedCareerState);

  if (nextFixture.status === "none") {
    return {
      ...state,
      lastPlayAttempt: {
        status: "none",
        blockerKeys: [],
      },
    };
  }

  if (nextFixture.status === "invalid") {
    return {
      ...state,
      lastPlayAttempt: {
        status: "invalid",
        blockerKeys: [],
        invalidReason: nextFixture.reason,
        ...(nextFixture.fixtureId === undefined ? {} : { fixtureId: nextFixture.fixtureId }),
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
  const progressed = progressNextCareerFixture({
    careerState: recoveredCareerState,
    teamsByClubId: buildCareerTeamsByClubId(recoveredCareerState, {
      roleWeights: WEB_DEMO_ROLE_WEIGHTS,
      stateMultiplierCurves: WEB_DEMO_STATE_MULTIPLIER_CURVES,
    }),
    matchEngineConfig: WEB_DEMO_MATCH_ENGINE_CONFIG,
  });

  if (progressed.status !== "advanced") {
    return {
      ...state,
      careerState: progressed.careerState,
      lastPlayAttempt: {
        status: progressed.status,
        blockerKeys: [],
        ...(progressed.status === "invalid" ? { invalidReason: progressed.reason } : {}),
        ...("fixtureId" in progressed && progressed.fixtureId !== undefined ? { fixtureId: progressed.fixtureId } : {}),
      },
    };
  }

  const playedResult: DemoMatchdayAdvancedResult = {
    ...progressed,
    preMatchRecovery,
    careerState: retargetPreparationAfterAdvance(progressed.careerState),
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
    playedResult,
  };
}

/** Progresses the demo matchday from pre-match to a real half-time stop. */
export function playDemoMatchdayFirstHalf(
  state: DemoMatchdayState,
  preparation: DemoMatchPreparationState,
): DemoMatchdayState {
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

  const kickoff = prepareDemoMatchdayKickoff(state, preparation);

  if (kickoff.status !== "ready") {
    return kickoff.state;
  }

  const staged = progressStagedMatchToHalfTime(createInitialStagedMatchState(kickoff.matchContext));

  return {
    ...state,
    careerState: kickoff.recoveredCareerState,
    lastStagedAttempt: {
      status: "at_half_time",
      blockerKeys: [],
      fixtureId: kickoff.fixture.id,
    },
    stagedProgress: {
      fixtureBefore: kickoff.fixture,
      selectedSide: kickoff.fixture.homeClubId === kickoff.recoveredCareerState.selectedClubId ? "home" : "away",
      selectedBenchPlayerIds: selectedBenchPlayerIds(preparation),
      preMatchRecovery: kickoff.preMatchRecovery,
      recoveredCareerState: kickoff.recoveredCareerState,
      state: staged.state,
      snapshot: staged.snapshot,
    },
  };
}

/** Applies explicit manager-declared half-time substitutions to the staged demo match. */
export function applyDemoHalfTimeSubstitutions(
  state: DemoMatchdayState,
  decisions: readonly DemoHalfTimeSubstitutionDecision[],
): DemoMatchdayState {
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

  return {
    ...state,
    lastStagedAttempt: {
      status: "substitutions_applied",
      blockerKeys: [],
      fixtureId: stagedProgress.fixtureBefore.id,
    },
    stagedProgress: {
      ...stagedProgress,
      state: refreshed.state,
      snapshot: refreshed.snapshot,
    },
  };
}

/** Progresses the staged demo match from half-time to full time after applying the declared tactical plan. */
export function playDemoMatchdaySecondHalf(
  state: DemoMatchdayState,
  preparation: DemoMatchPreparationState,
): DemoMatchdayState {
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

  const fullTime = progressStagedMatchToFullTime(tacticalDecision.state);
  const progressed = progressNextCareerFixture({
    careerState: stagedProgress.recoveredCareerState,
    teamsByClubId: buildCareerTeamsByClubId(stagedProgress.recoveredCareerState, {
      roleWeights: WEB_DEMO_ROLE_WEIGHTS,
      stateMultiplierCurves: WEB_DEMO_STATE_MULTIPLIER_CURVES,
    }),
    matchEngineConfig: WEB_DEMO_MATCH_ENGINE_CONFIG,
  });

  if (progressed.status !== "advanced") {
    return {
      ...state,
      lastStagedAttempt: {
        status: "invalid",
        blockerKeys: [],
        invalidReason: progressed.status === "invalid" ? progressed.reason : progressed.status,
        ...("fixtureId" in progressed && progressed.fixtureId !== undefined ? { fixtureId: progressed.fixtureId } : {}),
      },
    };
  }

  const playedResult: DemoMatchdayAdvancedResult = {
    ...progressed,
    preMatchRecovery: stagedProgress.preMatchRecovery,
    careerState: retargetPreparationAfterAdvance(progressed.careerState),
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

/** Builds a framework-free matchday view from the current demo adapter state. */
export function buildDemoMatchdayView(
  state: DemoMatchdayState,
  preparation?: DemoMatchPreparationState,
): CareerMatchdayView {
  return buildCareerMatchdayView(buildDemoMatchdayInput(state, preparation));
}

/** Builds the phase-aware `@game/ui` view for the current staged demo matchday state. */
export function buildDemoMatchdayPhaseView(state: DemoMatchdayState): CareerMatchdayPhaseView {
  return buildCareerMatchdayPhaseView(buildDemoMatchdayPhaseInput(state));
}

/** Builds the half-time substitution panel from staged demo facts only. */
export function buildDemoHalfTimeSubstitutionPanel(state: DemoMatchdayState): DemoHalfTimeSubstitutionPanel {
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
export function buildDemoHalfTimeTacticalDecisionPlan(
  state: DemoMatchdayState,
  preparation: DemoMatchPreparationState,
): HalfTimeTacticalDecisionPlan | undefined {
  const stagedProgress = state.stagedProgress;

  if (stagedProgress === undefined || stagedProgress.snapshot.phase !== "half_time") {
    return undefined;
  }

  return buildHalfTimeTacticalDecisionPlan(stagedProgress, preparation);
}

/** Builds the explicit `@game/ui` input for the current demo matchday state. */
export function buildDemoMatchdayInput(
  state: DemoMatchdayState,
  preparation?: DemoMatchPreparationState,
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

function buildDemoMatchdayPhaseInput(state: DemoMatchdayState): BuildCareerMatchdayPhaseViewInput {
  const stagedProgress = state.stagedProgress;
  const fixture = stagedProgress?.fixtureBefore ?? nextFixtureOrUndefined(state.careerState);

  if (fixture === undefined) {
    throw new Error("Cannot build demo matchday phase view without a fixture");
  }

  const snapshot = stagedProgress?.snapshot;
  const phaseEvents = stagedProgress === undefined || snapshot === undefined
    ? []
    : phaseEventInputs(stagedProgress, snapshot.events);
  const phasePlayers = stagedProgress === undefined || snapshot === undefined
    ? []
    : phasePlayerInputs(stagedProgress, snapshot.playerRatings);

  return {
    saveId: state.careerState.saveId,
    currentDateIso: toISO(state.careerState.gameState.calendar.currentDate),
    selectedClub: clubInput(state.careerState, state.careerState.selectedClubId),
    fixture: fixtureInput(state.careerState, fixture),
    phase: snapshot?.phase ?? "pre_match",
    currentMinute: snapshot?.currentMinute ?? 0,
    scoreboard: {
      homeGoals: snapshot?.score.home ?? 0,
      awayGoals: snapshot?.score.away ?? 0,
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

function buildHalfTimeTacticalDecisionPlan(
  stagedProgress: DemoStagedMatchdayProgress,
  preparation: DemoMatchPreparationState,
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
  stagedProgress: DemoStagedMatchdayProgress,
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

type DemoMatchdayKickoffPrepared =
  | {
      readonly status: "ready";
      readonly fixture: Fixture;
      readonly recoveredCareerState: CareerState;
      readonly preMatchRecovery: ApplyCareerWeeklyRecoveryResult;
      readonly matchContext: MatchContext;
    }
  | {
      readonly status: "not_ready";
      readonly state: DemoMatchdayState;
    };

function prepareDemoMatchdayKickoff(
  state: DemoMatchdayState,
  preparation: DemoMatchPreparationState,
): DemoMatchdayKickoffPrepared {
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

  const preparedCareerState = withSelectedClubPreparation(state.careerState, preparation);
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
  const teamsByClubId = buildCareerTeamsByClubId(recoveredCareerState, {
    roleWeights: WEB_DEMO_ROLE_WEIGHTS,
    stateMultiplierCurves: WEB_DEMO_STATE_MULTIPLIER_CURVES,
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
    preMatchRecovery,
    matchContext: {
      fixtureId: nextFixture.fixtureId,
      seed: recoveredCareerState.gameState.meta.seed,
      home,
      away,
      engineConfig: WEB_DEMO_MATCH_ENGINE_CONFIG,
    },
  };
}

function createDemoCareerState(): CareerState {
  const selectedClubId = asClubId("club:perugia");
  const opponentClubId = asClubId("club:pisa");
  const season = asSeasonId("season:demo-001");
  const competition = asCompetitionId("competition:demo-third-division");
  const openingDay = asGameDate(fromISO("2026-08-01"));
  const selectedPlayerIds = Array.from({ length: 22 }, (_, index) => asPlayerId(`player:demo-${String(index + 1).padStart(2, "0")}`));
  const opponentPlayerIds = Array.from({ length: 22 }, (_, index) => asPlayerId(`player:pisa-${String(index + 1).padStart(2, "0")}`));
  const selectedClub: Club = {
    id: selectedClubId,
    name: "S.S. Perugia",
    shortName: "Perugia",
    category: "third_division",
    reputation: 6,
    playerIds: selectedPlayerIds,
  };
  const opponentClub: Club = {
    id: opponentClubId,
    name: "U.S. Pisa",
    shortName: "Pisa",
    category: "third_division",
    reputation: 6,
    playerIds: opponentPlayerIds,
  };
  const fixture: Fixture = {
    id: asFixtureId("fixture:000003"),
    competitionId: competition,
    seasonId: season,
    roundNumber: 1,
    date: openingDay,
    homeClubId: opponentClubId,
    awayClubId: selectedClubId,
  };
  const selectedPlayers = createDemoPlayers(selectedPlayerIds, WEB_DEMO_SELECTED_PLAYER_NAMES);
  const opponentPlayers = createDemoPlayers(opponentPlayerIds, WEB_DEMO_OPPONENT_PLAYER_NAMES);
  const players = { ...selectedPlayers.players, ...opponentPlayers.players };
  const playerIds = [...selectedPlayers.playerIds, ...opponentPlayers.playerIds];
  const playerStates = { ...selectedPlayers.playerStates, ...opponentPlayers.playerStates };
  const gameState: GameState = {
    meta: {
      seed: WEB_DEMO_DASHBOARD_SEED,
      rngAlgorithmVersion: "web-demo",
      saveSchemaVersion: 1,
    },
    calendar: {
      currentDate: openingDay,
      currentSeasonId: season,
    },
    players,
    playerIds,
    playerStates,
    clubs: {
      [selectedClubId]: selectedClub,
      [opponentClubId]: opponentClub,
    },
    clubIds: [selectedClubId, opponentClubId],
    fixtures: {
      [fixture.id]: fixture,
    },
    fixtureIds: [fixture.id],
  };

  return {
    saveId: asSaveId(WEB_DEMO_DASHBOARD_SAVE_ID),
    schemaVersion: CAREER_STATE_SCHEMA_VERSION,
    careerWorld: {
      worldSeed: WEB_DEMO_DASHBOARD_SEED,
      generatorVersion: WEB_DEMO_WORLD_GENERATOR_VERSION,
      creationSourceKey: "career:web-demo-world",
    },
    selectedClubId,
    gameState,
    marketState: {
      clubBudgets: {
        [selectedClubId]: {
          clubId: selectedClubId,
          transferBudget: asMoney(6_000_000_00),
        },
      },
      clubBudgetIds: [selectedClubId],
    },
    transferHistory: [],
  };
}

interface DemoPlayerSeed {
  readonly firstName: string;
  readonly lastName: string;
  readonly position: PlayerPosition;
  readonly role: PlayerRole;
  readonly ability: number;
}

function createDemoPlayers(
  orderedPlayerIds: readonly PlayerId[],
  seeds: readonly DemoPlayerSeed[],
): {
  readonly players: Readonly<Record<PlayerId, Player>>;
  readonly playerIds: readonly PlayerId[];
  readonly playerStates: Readonly<Record<PlayerId, PlayerDynamicState>>;
} {
  const players: Record<PlayerId, Player> = {};
  const playerStates: Record<PlayerId, PlayerDynamicState> = {};

  orderedPlayerIds.forEach((id, index) => {
    const seed = seeds[index] ?? fallbackPlayerSeed(index);
    players[id] = {
      id,
      firstName: seed.firstName,
      lastName: seed.lastName,
      birthDate: asGameDate(fromISO("1998-01-01") - index * 180),
      naturalPositions: [seed.position],
      primaryRole: seed.role,
      naturalRoles: [seed.role],
      adaptedRoles: [],
      weakRoles: [],
      abilities: abilitiesForRole(seed.role, seed.ability),
      potential: abilitiesForRole(seed.role, Math.min(seed.ability + 2, 20)),
    };
    playerStates[id] = {
      fitness: asStateValue(100),
      form: asStateValue(50),
      morale: asStateValue(50),
    };
  });

  return {
    players,
    playerIds: orderedPlayerIds,
    playerStates,
  };
}

function fallbackPlayerSeed(index: number): DemoPlayerSeed {
  return {
    firstName: "Demo",
    lastName: `Player${index + 1}`,
    position: index === 0 ? "gk" : index <= 4 ? "cb" : index <= 8 ? "cm" : "st",
    role: index === 0 ? "goalkeeper" : index <= 4 ? "center_back" : index <= 8 ? "central_midfielder" : "striker",
    ability: 9,
  };
}

function abilitiesForRole(role: PlayerRole, base: number): Player["abilities"] {
  const value = (offset = 0) => asAbilityValue(clampAbility(base + offset));
  const isGoalkeeper = role === "goalkeeper";
  const isDefender = role === "center_back" || role === "full_back" || role === "wing_back";
  const isMidfielder = role === "defensive_midfielder" || role === "central_midfielder" || role === "attacking_midfielder" || role === "wide_midfielder";
  const isAttacker = role === "winger" || role === "striker";

  return {
    technical: {
      finishing: value(isAttacker ? 2 : isMidfielder ? -1 : -4),
      passing: value(isMidfielder ? 2 : 0),
      longPassing: value(isMidfielder ? 1 : -1),
      crossing: value(role === "wide_midfielder" || role === "winger" || role === "full_back" ? 2 : -1),
      dribbling: value(isAttacker ? 1 : isMidfielder ? 0 : -2),
      technique: value(isMidfielder || isAttacker ? 1 : -1),
      tackling: value(isDefender || role === "defensive_midfielder" ? 2 : -3),
      penalties: value(isAttacker ? 1 : -3),
      freeKicks: value(isMidfielder ? 0 : -2),
    },
    physical: {
      pace: value(isAttacker || role === "full_back" ? 1 : 0),
      strength: value(isDefender || role === "striker" ? 1 : 0),
      stamina: value(isMidfielder ? 2 : 0),
      agility: value(isAttacker || isGoalkeeper ? 1 : 0),
      heading: value(isDefender || role === "striker" ? 2 : -1),
    },
    mental: {
      positioning: value(isDefender || isGoalkeeper ? 2 : 0),
      vision: value(isMidfielder ? 2 : 0),
      anticipation: value(isDefender || isMidfielder ? 1 : 0),
      composure: value(isAttacker || isGoalkeeper ? 2 : 0),
      determination: value(0),
      leadership: value(-1),
    },
    goalkeeping: {
      reflexes: value(isGoalkeeper ? 4 : -7),
      handling: value(isGoalkeeper ? 3 : -7),
      rushingOut: value(isGoalkeeper ? 2 : -7),
      goalkeeperPositioning: value(isGoalkeeper ? 3 : -7),
      footwork: value(isGoalkeeper ? 1 : -6),
    },
  };
}

function clampAbility(value: number): number {
  return Math.max(1, Math.min(value, 20));
}

function validatePreparation(preparation: DemoMatchPreparationState): readonly DemoMatchdayBlockerKey[] {
  const blockers: DemoMatchdayBlockerKey[] = [];

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

function completeLineupCount(preparation: DemoMatchPreparationState): number {
  return preparation.tacticalBoardDraft.slots.filter((slot) => slot.playerId !== null).length;
}

function completeBenchCount(preparation: DemoMatchPreparationState): number {
  return Object.values(preparation.selectedBenchPlayerIdsBySlot).filter((playerId) => playerId.length > 0).length;
}

function withSelectedClubPreparation(
  careerState: CareerState,
  preparation: DemoMatchPreparationState,
): CareerState {
  const nextFixture = findNextCareerFixture(careerState);
  const selectedLineup = {
    clubId: careerState.selectedClubId,
    slots: preparation.tacticalBoardDraft.slots.map((slot) => {
      if (slot.playerId === null) {
        throw new Error(`Cannot build selected lineup with empty slot: ${slot.slotId}`);
      }

      return {
        slotKey: slot.slotId,
        playerId: asPlayerId(slot.playerId),
        roleKey: engineRoleKeyForBoardRole(slot.role),
      };
    }),
  };

  return {
    ...careerState,
    matchPreparation: {
      selectedClubId: careerState.selectedClubId,
      ...(nextFixture.status === "found" ? { targetFixtureId: nextFixture.fixtureId } : {}),
      selectedLineup,
      tactic: tacticSetupForProfile(preparation.selectedTacticProfileId),
      updatedAt: careerState.gameState.calendar.currentDate,
    },
  };
}

function tacticSetupForProfile(tacticProfileId: string | undefined): TacticSetup {
  switch (tacticProfileId) {
    case "tactic:attacking":
      return {
        mentality: "attacking",
        pressing: 0.85,
        directness: 0.75,
        width: 0.8,
        risk: 0.7,
      };

    case "tactic:defensive":
      return {
        mentality: "defensive",
        pressing: 0.35,
        directness: 0.3,
        width: 0.4,
        risk: 0.2,
      };

    case "tactic:balanced":
    default:
      return {
        mentality: "balanced",
        pressing: 0.5,
        directness: 0.5,
        width: 0.5,
        risk: 0.5,
      };
  }
}

function buildCareerTeamsByClubId(
  careerState: CareerState,
  contentConfig: {
    readonly roleWeights: Readonly<Record<string, RoleWeightProfile>>;
    readonly stateMultiplierCurves: PlayerStateMultiplierCurves;
  },
): Readonly<Record<ClubId, MatchTeamContext>> {
  const teamsByClubId: Partial<Record<ClubId, MatchTeamContext>> = {};

  for (const clubId of careerState.gameState.clubIds) {
    const club = careerState.gameState.clubs[clubId];

    if (club === undefined) {
      continue;
    }

    if (clubId === careerState.selectedClubId && careerState.matchPreparation?.selectedLineup !== undefined && careerState.matchPreparation.tactic !== undefined) {
      teamsByClubId[clubId] = buildTacticTeamContext({
        lineup: careerState.matchPreparation.selectedLineup,
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

function retargetPreparationAfterAdvance(careerState: CareerState): CareerState {
  if (careerState.matchPreparation === undefined) {
    return careerState;
  }

  const nextFixtureId = nextSelectedClubFixtureId(careerState);
  const { targetFixtureId: _previousTargetFixtureId, ...preparationWithoutTarget } = careerState.matchPreparation;

  return {
    ...careerState,
    matchPreparation: {
      ...preparationWithoutTarget,
      ...(nextFixtureId === undefined ? {} : { targetFixtureId: nextFixtureId }),
      updatedAt: careerState.gameState.calendar.currentDate,
    },
  };
}

function nextSelectedClubFixtureId(careerState: CareerState): FixtureId | undefined {
  for (const fixtureId of careerState.gameState.fixtureIds) {
    const fixture = careerState.gameState.fixtures[fixtureId];

    if (fixture === undefined || fixture.result?.played === true) {
      continue;
    }

    if (fixture.homeClubId === careerState.selectedClubId || fixture.awayClubId === careerState.selectedClubId) {
      return fixtureId;
    }
  }

  return undefined;
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

function resultInput(result: DemoMatchdayAdvancedResult): NonNullable<BuildCareerMatchdayViewInput["result"]> {
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
  result: DemoMatchdayAdvancedResult,
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
  stagedProgress: DemoStagedMatchdayProgress,
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
  stagedProgress: DemoStagedMatchdayProgress,
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
  stagedProgress: DemoStagedMatchdayProgress,
  playerId: PlayerId,
  roleKey: string | undefined,
  ratingByPlayerId: ReadonlyMap<PlayerId, PlayerMatchRatingRow>,
): DemoHalfTimeSubstitutionPlayerOption {
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
  first: DemoHalfTimeSubstitutionPlayerOption,
  second: DemoHalfTimeSubstitutionPlayerOption,
): number {
  return (first.rating ?? 10) - (second.rating ?? 10)
    || (first.condition ?? 100) - (second.condition ?? 100)
    || first.playerName.localeCompare(second.playerName)
    || first.playerId.localeCompare(second.playerId);
}

function compareIncomingSubstitutionOptions(
  first: DemoHalfTimeSubstitutionPlayerOption,
  second: DemoHalfTimeSubstitutionPlayerOption,
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
  result: DemoMatchdayAdvancedResult,
  homeClub: { readonly clubId: string; readonly name: string },
  awayClub: { readonly clubId: string; readonly name: string },
): NonNullable<BuildCareerMatchdayViewInput["result"]>["playerStats"] {
  const homeRegistrations = result.fixtureAfter.homeClubId === result.careerState.selectedClubId
    ? result.careerState.matchPreparation?.selectedLineup?.slots.map((slot) => ({ playerId: slot.playerId, side: "home" as const })) ?? []
    : defaultOpponentLineupFromRoster(result.careerState.gameState.clubs[result.fixtureAfter.homeClubId]?.playerIds ?? [])
      .map((slot) => ({ playerId: slot.playerId, side: "home" as const }));
  const awayRegistrations = result.fixtureAfter.awayClubId === result.careerState.selectedClubId
    ? result.careerState.matchPreparation?.selectedLineup?.slots.map((slot) => ({ playerId: slot.playerId, side: "away" as const })) ?? []
    : defaultOpponentLineupFromRoster(result.careerState.gameState.clubs[result.fixtureAfter.awayClubId]?.playerIds ?? [])
      .map((slot) => ({ playerId: slot.playerId, side: "away" as const }));

  return computePlayerMatchStats({
    report: result.report,
    playerRegistrations: [...homeRegistrations, ...awayRegistrations],
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

function selectedBenchPlayerIds(preparation: DemoMatchPreparationState): readonly PlayerId[] {
  return Object.values(preparation.selectedBenchPlayerIdsBySlot)
    .filter((playerId) => playerId.length > 0)
    .map(asPlayerId);
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
  stagedProgress: DemoStagedMatchdayProgress,
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
