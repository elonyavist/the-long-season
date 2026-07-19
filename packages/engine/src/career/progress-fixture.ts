import {
  createCareerState,
  type CareerState,
  type ClubId,
  type Formation,
  type Fixture,
  type FixtureId,
  type MatchReport,
  type AppliedMatchSubstitution,
  type PlayerId,
} from "@game/domain";

import type { MatchEngineConfig } from "../match-engine/match-engine-config.ts";
import type { MatchTeamContext } from "../match-engine/match-context.ts";
import { createMatchReport } from "../match-engine/create-match-report.ts";
import type { MatchExplanationConditionSnapshot, MatchExplanationTrace } from "../match-engine/match-explanation-trace.ts";
import type {
  MatchTacticalDistributionInput,
  PlayerStateMultiplierCurves,
  RoleWeightProfile,
} from "../match-engine/index.ts";
import { buildPlayerMatchRatings, playerRatingRegistrationsFromContext, type PlayerMatchRatingRow } from "../match-engine/player-match-rating.ts";
import { simulateMatch } from "../match-engine/simulate-match.ts";
import { AiSquadSelectionError, buildAiSquadMatchTeamContext } from "../team-selection/index.ts";
import { applyMatchReportToFixture } from "../use-cases/apply-match-report-to-fixture.ts";
import { completeStagedMatchCheckpoint } from "./active-match-checkpoint.ts";
import { applyCareerFixtureConditionConsequences, type CareerFixtureConditionChange } from "./career-condition-consequences.ts";
import {
  applyCareerMatchStateConsequences,
  type CareerMatchPlayerStateConsequence,
  type CareerMatchStateConsequenceSummary,
} from "./career-match-state-consequences.ts";
import { advanceCareerMonths, type CareerMonthlyLifecycleSummary } from "./advance-career-month.ts";
import { findNextCareerFixture, type NextCareerFixtureInvalidReason } from "./next-fixture.ts";
import { accrueCommittedFixtureParticipation, type FixtureParticipationSideContext } from "./player-participation.ts";

/** Invalid-state reasons specific to career fixture progression. */
export type ProgressCareerFixtureInvalidReason =
  | NextCareerFixtureInvalidReason
  | "fixture_already_played"
  | "fixture_report_mismatch"
  | "missing_home_team_context"
  | "missing_away_team_context"
  | "home_team_context_mismatch"
  | "away_team_context_mismatch"
  | "invalid_ai_team_selection";

/** Optional AI team-selection data for non-user fixture sides. */
export interface ProgressCareerAiTeamSelectionInput {
  /** Base formation used for the AI match XI. */
  readonly formation: Formation;
  /** Match-engine role profiles used to derive team strength. */
  readonly roleWeights: Readonly<Record<string, RoleWeightProfile>>;
  /** Tactical distribution used for the AI side. */
  readonly tacticalDistribution: MatchTacticalDistributionInput;
  /** Optional state curves used when deriving strength from selected players. */
  readonly stateMultiplierCurves?: PlayerStateMultiplierCurves;
  /** Maximum substitutes to include in diagnostics. */
  readonly benchSize?: number;
}

/**
 * Input for simulating and applying exactly one next selected-club fixture.
 *
 * Callers own pre-match preparation before this entry point runs: selected
 * lineup, tactic, date-based recovery, and match-ready team contexts must
 * already be reflected in `careerState` and `teamsByClubId`.
 */
export interface ProgressNextCareerFixtureInput {
  /** Current durable career state loaded by the caller. */
  readonly careerState: CareerState;
  /** Match-ready team contexts keyed by club ID. The selected club must be supplied by the caller. */
  readonly teamsByClubId: Readonly<Partial<Record<ClubId, MatchTeamContext>>>;
  /** Optional AI selector config used only for non-selected clubs when their context is missing. */
  readonly aiTeamSelectionByClubId?: Readonly<Partial<Record<ClubId, ProgressCareerAiTeamSelectionInput>>>;
  /** Match-engine tuning supplied by caller content/config. */
  readonly matchEngineConfig: MatchEngineConfig;
  /** Whether to attach optional explanation data for the played fixture. */
  readonly includeExplanationTrace?: boolean;
}

/** Result returned when one selected-club fixture was simulated and applied. */
export interface ProgressCareerFixtureAdvanced {
  /** Discriminator for successful progression. */
  readonly status: "advanced";
  /** Fixture ID that was selected and played. */
  readonly fixtureId: FixtureId;
  /** Fixture before applying the match report. */
  readonly fixtureBefore: Fixture;
  /** Fixture after applying the match report. */
  readonly fixtureAfter: Fixture;
  /** Durable match report produced by the simulation. */
  readonly report: MatchReport;
  /** Optional language-agnostic explanation trace for the played fixture. */
  readonly explanationTrace?: MatchExplanationTrace;
  /** Selected-club condition changes caused by this played fixture. */
  readonly conditionChanges: readonly CareerFixtureConditionChange[];
  /** Selected-club form/morale changes caused by this played fixture. */
  readonly playerStateConsequences: readonly CareerMatchPlayerStateConsequence[];
  /** Aggregate selected-club form/morale consequence facts. */
  readonly playerStateConsequenceSummary: CareerMatchStateConsequenceSummary;
  /** Monthly player lifecycle checkpoints closed before this fixture was accrued. */
  readonly monthlyLifecycle: readonly CareerMonthlyLifecycleSummary[];
  /** Copied career state with the fixture result applied. */
  readonly careerState: CareerState;
}

/** Result returned when there is no selected-club fixture left to play. */
export interface ProgressCareerFixtureNone {
  /** Discriminator for the no-op no-fixture branch. */
  readonly status: "none";
  /** Original career state reference, unchanged. */
  readonly careerState: CareerState;
}

/** Result returned when progression cannot safely run from the supplied state. */
export interface ProgressCareerFixtureInvalid {
  /** Discriminator for validation failures. */
  readonly status: "invalid";
  /** Stable invalid-state reason. */
  readonly reason: ProgressCareerFixtureInvalidReason;
  /** Fixture related to the failure when available. */
  readonly fixtureId?: FixtureId;
  /** Original career state reference, unchanged. */
  readonly careerState: CareerState;
}

/** Result of trying to progress exactly one career fixture. */
export type ProgressCareerFixtureResult =
  | ProgressCareerFixtureAdvanced
  | ProgressCareerFixtureInvalid
  | ProgressCareerFixtureNone;

/** Input for atomically committing a report already produced by staged progression. */
export interface CommitStagedCareerFixtureInput {
  /** Recovered durable career that owns the active match checkpoint. */
  readonly careerState: CareerState;
  /** Completed staged report to make authoritative. */
  readonly report: MatchReport;
  /** Selected-club starters whose existing v1 match consequences must apply. */
  readonly selectedStarterIds: readonly PlayerId[];
  /** Final staged ratings from the completed match, when already available to the caller. */
  readonly playerRatings?: readonly PlayerMatchRatingRow[];
}

/**
 * Applies one already-simulated staged report without running the match again.
 *
 * The returned state applies the fixture result and player consequences and
 * clears the active checkpoint in the same immutable domain transition. The
 * storage adapter can therefore publish full time with one atomic save.
 */
export function commitStagedCareerFixture(
  input: CommitStagedCareerFixtureInput,
): ProgressCareerFixtureAdvanced | ProgressCareerFixtureInvalid {
  const fixture = input.careerState.gameState.fixtures[input.report.fixtureId];

  if (fixture === undefined) {
    return invalidResult(input.careerState, "fixture_missing", input.report.fixtureId);
  }

  if (fixture.result?.played === true) {
    return invalidResult(input.careerState, "fixture_already_played", fixture.id);
  }

  if (input.careerState.activeMatchCheckpoint?.fixtureId !== fixture.id) {
    return invalidResult(input.careerState, "fixture_report_mismatch", fixture.id);
  }

  const checkpointCompletion = completeStagedMatchCheckpoint(input.careerState.activeMatchCheckpoint);
  const checkpointReport = checkpointCompletion.snapshot.fullTimeReport;

  if (checkpointReport === undefined || JSON.stringify(checkpointReport) !== JSON.stringify(input.report)) {
    return invalidResult(input.careerState, "fixture_report_mismatch", fixture.id);
  }

  const selectedClubSide = input.careerState.activeMatchCheckpoint.selectedClubSide;
  const selectedBenchPlayerIds = input.careerState.activeMatchCheckpoint.selectedClubBenchSlots
    .map((slot) => slot.playerId)
    .filter((playerId): playerId is PlayerId => playerId !== null);

  return applyCareerFixtureReport({
    careerState: input.careerState,
    fixture,
    report: input.report,
    selectedStarterIds: input.selectedStarterIds,
    participationSides: sideContextsFromStagedMatch(
      checkpointCompletion.state.initialContext,
      checkpointCompletion.state.simulation.context,
      selectedClubSide,
      selectedBenchPlayerIds,
    ),
    appliedSubstitutions: checkpointCompletion.snapshot.appliedSubstitutions,
    playerRatings: input.playerRatings ?? checkpointCompletion.snapshot.playerRatings,
  });
}

/**
 * Simulates and applies the selected club's next unplayed fixture.
 *
 * This function is deterministic for the same `CareerState`, team contexts,
 * and match config. It does not write storage, advance unrelated fixtures,
 * choose lineups, choose tactics, apply pre-match recovery, or run a full
 * season. The flow is intentionally narrow:
 *
 * 1. find the next selected-club fixture;
 * 2. validate caller-supplied home/away team contexts;
 * 3. simulate the fixture and create a durable report;
 * 4. apply the fixture result, selected-club condition spend, and post-match state consequences;
 * 5. return the copied career state plus structured facts for presentation.
 */
export function progressNextCareerFixture(input: ProgressNextCareerFixtureInput): ProgressCareerFixtureResult {
  const nextFixture = findNextCareerFixture(input.careerState);

  if (nextFixture.status === "none") {
    return {
      status: "none",
      careerState: input.careerState,
    };
  }

  if (nextFixture.status === "invalid") {
    return {
      status: "invalid",
      reason: nextFixture.reason,
      ...(nextFixture.fixtureId === undefined ? {} : { fixtureId: nextFixture.fixtureId }),
      careerState: input.careerState,
    };
  }

  const resolvedContexts = resolveFixtureTeamContexts(input.careerState, nextFixture.fixture, input);

  if (resolvedContexts.status === "invalid") {
    return resolvedContexts.result;
  }

  const simulatedFixture = simulateFixtureAndCreateReport(input, nextFixture.fixtureId, resolvedContexts.home, resolvedContexts.away);
  const selectedClubContext = selectedClubTeamContext(
    input.careerState.selectedClubId,
    nextFixture.fixture,
    resolvedContexts.home,
    resolvedContexts.away,
  );
  const selectedStarterIds = selectedClubContext.lineup.map((slot) => slot.playerId);
  const applied = applyCareerFixtureReport({
    careerState: input.careerState,
    fixture: nextFixture.fixture,
    report: simulatedFixture.report,
    selectedStarterIds,
    participationSides: [
      {
        side: "home",
        initialContext: resolvedContexts.home,
        finalContext: resolvedContexts.home,
      },
      {
        side: "away",
        initialContext: resolvedContexts.away,
        finalContext: resolvedContexts.away,
      },
    ],
    playerRatings: simulatedFixture.playerRatings,
  });

  return {
    ...applied,
    ...(simulatedFixture.explanationTrace === undefined
      ? {}
      : {
          explanationTrace: withSelectedClubConditionTrace(
            simulatedFixture.explanationTrace,
            input.careerState.selectedClubId,
            applied.conditionChanges,
          ),
        }),
  };
}

interface ApplyCareerFixtureReportInput {
  readonly careerState: CareerState;
  readonly fixture: Fixture;
  readonly report: MatchReport;
  readonly selectedStarterIds: readonly PlayerId[];
  readonly participationSides?: readonly FixtureParticipationSideContext[];
  readonly appliedSubstitutions?: readonly AppliedMatchSubstitution[];
  readonly playerRatings?: readonly PlayerMatchRatingRow[];
}

/** Applies report, condition, form, morale, calendar, and checkpoint changes once. */
function applyCareerFixtureReport(input: ApplyCareerFixtureReportInput): ProgressCareerFixtureAdvanced {
  const monthlyLifecycle = advanceCareerMonths({
    careerState: input.careerState,
    worldSeed: input.careerState.gameState.meta.seed,
    fromDate: input.careerState.gameState.calendar.currentDate,
    toDate: input.fixture.date,
    seasonId: input.fixture.seasonId,
  });
  const gameStateWithResult = applyMatchReportToFixture({
    state: monthlyLifecycle.careerState.gameState,
    fixtureId: input.fixture.id,
    report: input.report,
  });
  const selectedClub = gameStateWithResult.clubs[monthlyLifecycle.careerState.selectedClubId];
  const conditionConsequences = applyCareerFixtureConditionConsequences({
    playerStates: gameStateWithResult.playerStates,
    selectedStarterIds: input.selectedStarterIds,
    reportPlayerIds: selectedClub?.playerIds ?? input.selectedStarterIds,
  });
  const matchStateConsequences = applyCareerMatchStateConsequences({
    playerStates: conditionConsequences.playerStates,
    selectedClubId: input.careerState.selectedClubId,
    fixture: input.fixture,
    report: input.report,
    selectedStarterIds: input.selectedStarterIds,
  });
  const gameStateWithConsequences = {
    ...gameStateWithResult,
    playerStates: matchStateConsequences.playerStates,
  };
  const { activeMatchCheckpoint: _completedCheckpoint, ...careerWithoutCheckpoint } = monthlyLifecycle.careerState;
  const progressedCareerStateWithoutParticipation = createCareerState({
    ...careerWithoutCheckpoint,
    gameState: {
      ...gameStateWithConsequences,
      calendar: {
        ...gameStateWithConsequences.calendar,
        currentDate: input.fixture.date > gameStateWithConsequences.calendar.currentDate
          ? input.fixture.date
          : gameStateWithConsequences.calendar.currentDate,
      },
    },
  });
  const progressedCareerState = input.participationSides === undefined
    ? progressedCareerStateWithoutParticipation
    : accrueCommittedFixtureParticipation({
        careerState: progressedCareerStateWithoutParticipation,
        fixtureId: input.fixture.id,
        seasonId: input.fixture.seasonId,
        fixtureDate: input.fixture.date,
        finalMinute: input.report.finalMinute,
        sides: input.participationSides,
        ...(input.appliedSubstitutions === undefined ? {} : { appliedSubstitutions: input.appliedSubstitutions }),
        ...(input.playerRatings === undefined ? {} : { playerRatings: input.playerRatings }),
      });
  const fixtureAfter = progressedCareerState.gameState.fixtures[input.fixture.id];

  if (fixtureAfter === undefined) {
    throw new Error(`Committed fixture disappeared from career state: ${input.fixture.id}`);
  }

  return {
    status: "advanced",
    fixtureId: input.fixture.id,
    fixtureBefore: input.fixture,
    fixtureAfter,
    report: input.report,
    conditionChanges: conditionConsequences.changes,
    playerStateConsequences: matchStateConsequences.changes,
    playerStateConsequenceSummary: matchStateConsequences.summary,
    monthlyLifecycle: monthlyLifecycle.summaries,
    careerState: progressedCareerState,
  };
}

type ResolvedFixtureTeamContexts =
  | {
      readonly status: "resolved";
      readonly home: MatchTeamContext;
      readonly away: MatchTeamContext;
    }
  | {
      readonly status: "invalid";
      readonly result: ProgressCareerFixtureInvalid;
    };

/**
 * Validates the caller-supplied match contexts before the fixture can run.
 */
function resolveFixtureTeamContexts(
  careerState: CareerState,
  fixture: Fixture,
  input: ProgressNextCareerFixtureInput,
): ResolvedFixtureTeamContexts {
  const home = resolveTeamContext(careerState, fixture, fixture.homeClubId, input);
  const away = resolveTeamContext(careerState, fixture, fixture.awayClubId, input);

  if (home.status === "invalid") {
    return home;
  }

  if (away.status === "invalid") {
    return away;
  }

  if (home.context === undefined) {
    return { status: "invalid", result: invalidResult(careerState, "missing_home_team_context", fixture.id) };
  }

  if (away.context === undefined) {
    return { status: "invalid", result: invalidResult(careerState, "missing_away_team_context", fixture.id) };
  }

  if (home.context.clubId !== fixture.homeClubId) {
    return { status: "invalid", result: invalidResult(careerState, "home_team_context_mismatch", fixture.id) };
  }

  if (away.context.clubId !== fixture.awayClubId) {
    return { status: "invalid", result: invalidResult(careerState, "away_team_context_mismatch", fixture.id) };
  }

  return {
    status: "resolved",
    home: home.context,
    away: away.context,
  };
}

type ResolveTeamContextResult =
  | {
      readonly status: "resolved";
      readonly context: MatchTeamContext | undefined;
    }
  | {
      readonly status: "invalid";
      readonly result: ProgressCareerFixtureInvalid;
    };

/**
 * Resolves one side, allowing AI construction only for non-selected clubs.
 */
function resolveTeamContext(
  careerState: CareerState,
  fixture: Fixture,
  clubId: ClubId,
  input: ProgressNextCareerFixtureInput,
): ResolveTeamContextResult {
  const suppliedContext = input.teamsByClubId[clubId];
  if (suppliedContext !== undefined || clubId === careerState.selectedClubId) {
    return {
      status: "resolved",
      context: suppliedContext,
    };
  }

  const aiSelection = input.aiTeamSelectionByClubId?.[clubId];
  if (aiSelection === undefined) {
    return {
      status: "resolved",
      context: undefined,
    };
  }

  const club = careerState.gameState.clubs[clubId];
  if (club === undefined) {
    return {
      status: "invalid",
      result: invalidResult(careerState, "invalid_ai_team_selection", fixture.id),
    };
  }

  try {
    return {
      status: "resolved",
      context: buildAiSquadMatchTeamContext({
        clubId,
        formation: aiSelection.formation,
        playerIds: club.playerIds,
        players: careerState.gameState.players,
        playerStates: careerState.gameState.playerStates,
        roleWeights: aiSelection.roleWeights,
        tacticalDistribution: aiSelection.tacticalDistribution,
        currentDate: fixture.date,
        ...(aiSelection.stateMultiplierCurves === undefined ? {} : { stateMultiplierCurves: aiSelection.stateMultiplierCurves }),
        ...(aiSelection.benchSize === undefined ? {} : { benchSize: aiSelection.benchSize }),
      }).teamContext,
    };
  } catch (error) {
    if (error instanceof AiSquadSelectionError) {
      return {
        status: "invalid",
        result: invalidResult(careerState, "invalid_ai_team_selection", fixture.id),
      };
    }

    throw error;
  }
}

interface SimulatedFixtureProgression {
  readonly report: MatchReport;
  readonly explanationTrace?: MatchExplanationTrace;
  readonly playerRatings: readonly PlayerMatchRatingRow[];
}

/**
 * Runs the pure match simulation and converts it to the durable report shape.
 */
function simulateFixtureAndCreateReport(
  input: ProgressNextCareerFixtureInput,
  fixtureId: FixtureId,
  home: MatchTeamContext,
  away: MatchTeamContext,
): SimulatedFixtureProgression {
  const simulatedMatch = simulateMatch({
    fixtureId,
    seed: input.careerState.gameState.meta.seed,
    home,
    away,
    engineConfig: input.matchEngineConfig,
  }, {
    includeExplanationTrace: input.includeExplanationTrace === true,
  });

  return {
    report: createMatchReport(simulatedMatch),
    playerRatings: buildPlayerMatchRatings({
      events: simulatedMatch.events,
      playerRegistrations: playerRatingRegistrationsFromContext({
        fixtureId,
        seed: input.careerState.gameState.meta.seed,
        home,
        away,
        engineConfig: input.matchEngineConfig,
      }),
    }),
    ...(simulatedMatch.explanationTrace === undefined ? {} : { explanationTrace: simulatedMatch.explanationTrace }),
  };
}

function sideContextsFromStagedMatch(
  initialContext: { readonly home: MatchTeamContext; readonly away: MatchTeamContext },
  finalContext: { readonly home: MatchTeamContext; readonly away: MatchTeamContext },
  selectedClubSide: "home" | "away",
  selectedBenchPlayerIds: readonly PlayerId[],
): readonly FixtureParticipationSideContext[] {
  return [
    {
      side: "home",
      initialContext: initialContext.home,
      finalContext: finalContext.home,
      benchPlayerIds: selectedClubSide === "home" ? selectedBenchPlayerIds : [],
    },
    {
      side: "away",
      initialContext: initialContext.away,
      finalContext: finalContext.away,
      benchPlayerIds: selectedClubSide === "away" ? selectedBenchPlayerIds : [],
    },
  ];
}

/**
 * Returns the match team context belonging to the selected club.
 */
function selectedClubTeamContext(
  selectedClubId: ClubId,
  fixture: Fixture,
  home: MatchTeamContext,
  away: MatchTeamContext,
): MatchTeamContext {
  return fixture.homeClubId === selectedClubId ? home : away;
}

/**
 * Marks selected-club condition tracking inside an optional explanation trace.
 */
function withSelectedClubConditionTrace(
  trace: MatchExplanationTrace,
  selectedClubId: ClubId,
  conditionChanges: readonly CareerFixtureConditionChange[],
): MatchExplanationTrace {
  const conditionImpact = conditionImpactFromChanges(conditionChanges);

  if (trace.home.clubId === selectedClubId) {
    return {
      ...trace,
      home: {
        ...trace.home,
        conditionImpact,
      },
    };
  }

  if (trace.away.clubId === selectedClubId) {
    return {
      ...trace,
      away: {
        ...trace.away,
        conditionImpact,
      },
    };
  }

  return trace;
}

/**
 * Converts pre-match starter fitness into a trace-level condition summary.
 */
function conditionImpactFromChanges(
  conditionChanges: readonly CareerFixtureConditionChange[],
): MatchExplanationConditionSnapshot {
  const tiredStarterCount = conditionChanges.filter((change) => change.started && change.beforeFitness < 100).length;

  return {
    tracking: "tracked",
    effectDirection: tiredStarterCount > 0 ? "negative" : "neutral",
    affectedPlayerCount: tiredStarterCount,
  };
}

function invalidResult(
  careerState: CareerState,
  reason: ProgressCareerFixtureInvalidReason,
  fixtureId: FixtureId,
): ProgressCareerFixtureInvalid {
  return {
    status: "invalid",
    reason,
    fixtureId,
    careerState,
  };
}
