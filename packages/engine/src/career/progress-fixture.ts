import { fieldablePlayerIds, fieldablePlayerIdsFor } from "../squad/squad-depth.ts";
import {
  EMPTY_PLAYER_AVAILABILITY,
  createCareerState,
  findCareerFixtureEligibilityBlockers,
  playerUnavailabilityReason,
  type CareerFixtureEligibilityBlocker,
  type CareerState,
  type ClubFinanceLedgerEntryId,
  type ClubId,
  type CompetitionMatchRules,
  type Fixture,
  type FixtureId,
  type LateralFocus,
  type MatchReport,
  type MarketBehaviorCalibrationConfig,
  type MatchPlayerConsequence,
  type MatchTacticsCalibrationConfig,
  type AppliedMatchSubstitution,
  type PlayerId,
  type PlayerDevelopmentEnvironmentConfig,
  type PlayerStateCurvesConfig,
  type PlayerWagePolicyConfig,
} from "@game/domain";

import type { MatchEngineConfig } from "../match-engine/match-engine-config.ts";
import type { MatchContext, MatchTeamContext } from "../match-engine/match-context.ts";
import { createMatchReport } from "../match-engine/create-match-report.ts";
import type { MatchExplanationConditionSnapshot, MatchExplanationTrace } from "../match-engine/match-explanation-trace.ts";
import type {
  LineupSlot,
  MatchSide,
  MatchTacticalDistributionInput,
  PlayerStateMultiplierCurves,
  RoleWeightProfile,
} from "../match-engine/index.ts";
import { buildPlayerMatchRatings, playerRatingRegistrationsFromContext, type PlayerMatchRatingRow } from "../match-engine/player-match-rating.ts";
import { simulateMatch } from "../match-engine/simulate-match.ts";
import type { PlayerValuationConfig } from "../market/player-valuation.ts";
import { AiSquadSelectionError } from "../team-selection/index.ts";
import { applyMatchReportToFixture } from "../use-cases/apply-match-report-to-fixture.ts";
import { selectCareerAiTeam, type CareerAiTeamSelectionPolicy } from "./career-ai-team-selection.ts";
import { createMatchConsequenceInboxMessages, deliverCareerInboxMessages } from "./career-inbox-lifecycle.ts";
import { applyCareerFixtureConditionConsequences, type CareerFixtureConditionChange } from "./career-condition-consequences.ts";
import {
  applyCareerMatchStateConsequences,
  type CareerMatchPlayerStateConsequence,
  type CareerMatchStateConsequenceSummary,
} from "./career-match-state-consequences.ts";
import { advanceCareerMonths, type CareerMonthlyLifecycleSummary } from "./advance-career-month.ts";
import { findNextCareerFixture, type NextCareerFixtureInvalidReason } from "./next-fixture.ts";
import {
  accrueFixtureParticipationContributions,
  buildFixtureParticipationContributions,
  type FixtureParticipationSideContext,
} from "./player-participation.ts";
import { applyMatchAvailabilityConsequences } from "./match-availability-consequences.ts";
import { settleFixtureContractBonuses } from "./career-finance-lifecycle.ts";

/** Invalid-state reasons specific to career fixture progression. */
export type ProgressCareerFixtureInvalidReason =
  | NextCareerFixtureInvalidReason
  | "fixture_already_played"
  | "fixture_report_mismatch"
  | "missing_home_team_context"
  | "missing_away_team_context"
  | "home_team_context_mismatch"
  | "away_team_context_mismatch"
  | "unavailable_player_selected"
  | "invalid_ai_team_selection"
  | "finance_lifecycle_rejected";

/** AI team-selection policy for every club the caller has not prepared. */
export type ProgressCareerAiTeamSelectionInput = CareerAiTeamSelectionPolicy;

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
  /** Version-linked wage policy used if fixture-date advancement crosses a month. */
  readonly wagePolicy: PlayerWagePolicyConfig;
  readonly marketBehaviorPolicy: MarketBehaviorCalibrationConfig;
  /** Canonical public-assessment policy used by crossed contract checkpoints. */
  readonly valuationConfig: PlayerValuationConfig;
  /** Version-linked club-environment policy used by quarterly development. */
  readonly playerDevelopmentEnvironmentConfig: PlayerDevelopmentEnvironmentConfig;
  readonly playerStateCurvesConfig: PlayerStateCurvesConfig;
  /** Match-ready team contexts keyed by club ID. The selected club must be supplied by the caller. */
  readonly teamsByClubId: Readonly<Partial<Record<ClubId, MatchTeamContext>>>;
  /** AI selector policy used for any non-selected club whose context is missing. */
  readonly aiTeamSelection?: ProgressCareerAiTeamSelectionInput;
  /** Match-engine tuning supplied by caller content/config. */
  readonly matchEngineConfig: MatchEngineConfig;
  /** Versioned match-tactics calibration used when this input builds an AI context. */
  readonly matchTacticsCalibration: MatchTacticsCalibrationConfig;
  /** Competition-owned discipline rules for the fixture being progressed. */
  readonly competitionMatchRules: CompetitionMatchRules;
  /** Whether to attach optional explanation data for the played fixture. */
  readonly includeExplanationTrace?: boolean;
}

/**
 * The eleven each side kicked off with, kept as a fact of the played match.
 *
 * Presentation needs to name who played and in which role, and until Step 09
 * the web recomposed the opponent's eleven from its roster to find out. That
 * was only ever correct while every AI club fielded one fixed shape. Now that a
 * club lines up in the shape its squad is built for, a second answer to "who
 * played where" would simply be a wrong one, so the played match carries the
 * only answer there is.
 */
export interface FixtureFieldedLineups {
  /** Home side's starting eleven in canonical slot order. */
  readonly home: readonly LineupSlot[];
  /** Away side's starting eleven in canonical slot order. */
  readonly away: readonly LineupSlot[];
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
  /** Eleven each side actually kicked off with. */
  readonly fieldedLineups: FixtureFieldedLineups;
  /** Optional language-agnostic explanation trace for the played fixture. */
  readonly explanationTrace?: MatchExplanationTrace;
  /** Selected-club condition changes caused by this played fixture. */
  readonly conditionChanges: readonly CareerFixtureConditionChange[];
  /** Selected-club form/morale changes caused by this played fixture. */
  readonly playerStateConsequences: readonly CareerMatchPlayerStateConsequence[];
  /** Aggregate selected-club form/morale consequence facts. */
  readonly playerStateConsequenceSummary: CareerMatchStateConsequenceSummary;
  /** New durable injury and suspension facts caused by this fixture. */
  readonly playerAvailabilityConsequences: readonly MatchPlayerConsequence[];
  /** Monthly player lifecycle checkpoints closed before this fixture was accrued. */
  readonly monthlyLifecycle: readonly CareerMonthlyLifecycleSummary[];
  /** Finance entries committed by full-time contract bonuses. */
  readonly financeLedgerEntryIds: readonly ClubFinanceLedgerEntryId[];
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
  /** Selected players that cannot participate, when eligibility caused the rejection. */
  readonly eligibilityBlockers?: readonly CareerFixtureEligibilityBlocker[];
  /** Original career state reference, unchanged. */
  readonly careerState: CareerState;
}

/** Result of trying to progress exactly one career fixture. */
export type ProgressCareerFixtureResult =
  | ProgressCareerFixtureAdvanced
  | ProgressCareerFixtureInvalid
  | ProgressCareerFixtureNone;

/** Input for atomically publishing one completed in-memory match. */
export interface CommitCompletedCareerFixtureInput {
  /** Durable career that must remain unchanged until this commit succeeds. */
  readonly careerState: CareerState;
  /** Version-linked wage policy used by fixture-date monthly advancement. */
  readonly wagePolicy: PlayerWagePolicyConfig;
  readonly marketBehaviorPolicy: MarketBehaviorCalibrationConfig;
  /** Canonical public-assessment policy used by crossed contract checkpoints. */
  readonly valuationConfig: PlayerValuationConfig;
  /** Version-linked club-environment policy used by quarterly development. */
  readonly playerDevelopmentEnvironmentConfig: PlayerDevelopmentEnvironmentConfig;
  readonly playerStateCurvesConfig: PlayerStateCurvesConfig;
  /** Final structured report produced by the completed live match. */
  readonly report: MatchReport;
  /** Frozen kickoff context used to identify starters and participation. */
  readonly initialContext: MatchContext;
  /** Final live context after accepted substitutions and tactical decisions. */
  readonly finalContext: MatchContext;
  /** Selected-club bench registered for this fixture. */
  readonly selectedClubBenchPlayerIds: readonly PlayerId[];
  /** Substitutions accepted during the completed match. */
  readonly appliedSubstitutions: readonly AppliedMatchSubstitution[];
  /** Final player ratings derived from the same completed match facts. */
  readonly playerRatings?: readonly PlayerMatchRatingRow[];
  /** Competition-owned discipline rules for the completed fixture. */
  readonly competitionMatchRules: CompetitionMatchRules;
  /** Already-derived trace for this exact completed minute state. */
  readonly explanationTrace?: MatchExplanationTrace;
}

/**
 * Publishes an already-completed in-memory match exactly once.
 *
 * Live drivers use this boundary only after the manager confirms full time.
 * It never re-simulates a minute or creates an artificial active checkpoint,
 * so accepted red cards, substitutions, and tactical context cannot diverge
 * from the report the manager has just watched.
 */
export function commitCompletedCareerFixture(
  input: CommitCompletedCareerFixtureInput,
): ProgressCareerFixtureAdvanced | ProgressCareerFixtureInvalid {
  const fixture = input.careerState.gameState.fixtures[input.report.fixtureId];

  if (fixture === undefined) {
    return invalidResult(input.careerState, "fixture_missing", input.report.fixtureId);
  }

  if (fixture.result?.played === true) {
    return invalidResult(input.careerState, "fixture_already_played", fixture.id);
  }

  if (!contextsMatchFixture(input.initialContext, input.finalContext, fixture)) {
    return invalidResult(input.careerState, "fixture_report_mismatch", fixture.id);
  }

  const selectedClubSide = selectedClubFixtureSide(input.careerState.selectedClubId, fixture);
  if (selectedClubSide === undefined) {
    return invalidResult(input.careerState, "fixture_report_mismatch", fixture.id);
  }

  const selectedInitialTeam = selectedClubSide === "home"
    ? input.initialContext.home
    : input.initialContext.away;

  const applied = applyCareerFixtureReport({
    careerState: input.careerState,
    wagePolicy: input.wagePolicy,
    marketBehaviorPolicy: input.marketBehaviorPolicy,
    valuationConfig: input.valuationConfig,
    playerDevelopmentEnvironmentConfig: input.playerDevelopmentEnvironmentConfig,
    playerStateCurvesConfig: input.playerStateCurvesConfig,
    fixture,
    report: input.report,
    selectedStarterIds: selectedInitialTeam.lineup.map((slot) => slot.playerId),
    participationSides: sideContextsFromCompletedMatch(
      input.initialContext,
      input.finalContext,
      selectedClubSide,
      input.selectedClubBenchPlayerIds,
    ),
    appliedSubstitutions: input.appliedSubstitutions,
    ...(input.playerRatings === undefined ? {} : { playerRatings: input.playerRatings }),
    competitionMatchRules: input.competitionMatchRules,
  });
  if (applied.status === "invalid" || input.explanationTrace === undefined) return applied;
  return { ...applied, explanationTrace: input.explanationTrace };
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

  const simulatedFixture = simulateFixtureAndCreateReport(
    input,
    nextFixture.fixtureId,
    resolvedContexts.home,
    resolvedContexts.away,
  );
  const selectedClubContext = selectedClubTeamContext(
    input.careerState.selectedClubId,
    nextFixture.fixture,
    resolvedContexts.home.context,
    resolvedContexts.away.context,
  );
  const selectedStarterIds = selectedClubContext.lineup.map((slot) => slot.playerId);
  const applied = applyCareerFixtureReport({
    careerState: input.careerState,
    wagePolicy: input.wagePolicy,
    marketBehaviorPolicy: input.marketBehaviorPolicy,
    valuationConfig: input.valuationConfig,
    playerDevelopmentEnvironmentConfig: input.playerDevelopmentEnvironmentConfig,
    playerStateCurvesConfig: input.playerStateCurvesConfig,
    fixture: nextFixture.fixture,
    report: simulatedFixture.report,
    selectedStarterIds,
    participationSides: [
      {
        side: "home",
        initialContext: resolvedContexts.home.context,
        finalContext: resolvedContexts.home.context,
      },
      {
        side: "away",
        initialContext: resolvedContexts.away.context,
        finalContext: resolvedContexts.away.context,
      },
    ],
    playerRatings: simulatedFixture.playerRatings,
    competitionMatchRules: input.competitionMatchRules,
  });

  if (applied.status === "invalid") {
    return applied;
  }

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
  readonly wagePolicy: PlayerWagePolicyConfig;
  readonly marketBehaviorPolicy: MarketBehaviorCalibrationConfig;
  readonly valuationConfig: PlayerValuationConfig;
  readonly playerDevelopmentEnvironmentConfig: PlayerDevelopmentEnvironmentConfig;
  readonly playerStateCurvesConfig: PlayerStateCurvesConfig;
  readonly fixture: Fixture;
  readonly report: MatchReport;
  readonly selectedStarterIds: readonly PlayerId[];
  readonly participationSides: readonly FixtureParticipationSideContext[];
  readonly appliedSubstitutions?: readonly AppliedMatchSubstitution[];
  readonly playerRatings?: readonly PlayerMatchRatingRow[];
  readonly competitionMatchRules: CompetitionMatchRules;
}

/** Applies report, condition, form, morale, calendar, and checkpoint changes once. */
function applyCareerFixtureReport(
  input: ApplyCareerFixtureReportInput,
): ProgressCareerFixtureAdvanced | ProgressCareerFixtureInvalid {
  const monthlyLifecycle = advanceCareerMonths({
    careerState: input.careerState,
    wagePolicy: input.wagePolicy,
    marketBehaviorPolicy: input.marketBehaviorPolicy,
    valuationConfig: input.valuationConfig,
    playerDevelopmentEnvironmentConfig: input.playerDevelopmentEnvironmentConfig,
    developmentCheckpointMode: "complete_quarters",
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
  const participation = buildFixtureParticipationContributions({
    fixtureId: input.fixture.id,
    seasonId: input.fixture.seasonId,
    fixtureDate: input.fixture.date,
    finalMinute: input.report.finalMinute,
    sides: input.participationSides,
    ...(input.appliedSubstitutions === undefined ? {} : { appliedSubstitutions: input.appliedSubstitutions }),
    playerExits: incidentPlayerExits(input.report, input.participationSides),
    ...(input.playerRatings === undefined ? {} : { playerRatings: input.playerRatings }),
  });
  const selectedClub = gameStateWithResult.clubs[monthlyLifecycle.careerState.selectedClubId];
  const conditionConsequences = applyCareerFixtureConditionConsequences({
    playerStates: gameStateWithResult.playerStates,
    contributions: participation.contributions,
    players: gameStateWithResult.players,
    fixtureDate: input.fixture.date,
    playerStateCurves: input.playerStateCurvesConfig,
    reportPlayerIds: selectedClub === undefined ? input.selectedStarterIds : fieldablePlayerIds(selectedClub),
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
  const availabilityConsequences = applyMatchAvailabilityConsequences({
    ...(monthlyLifecycle.careerState.playerAvailability === undefined
      ? {}
      : { availability: monthlyLifecycle.careerState.playerAvailability }),
    fixture: input.fixture,
    report: input.report,
    rules: input.competitionMatchRules,
    worldSeed: input.careerState.gameState.meta.seed,
    participatingPlayerIds: [
      ...fieldablePlayerIdsFor(input.careerState.gameState.clubs[input.fixture.homeClubId]),
      ...fieldablePlayerIdsFor(input.careerState.gameState.clubs[input.fixture.awayClubId]),
    ],
  });
  const progressedCareerStateWithoutParticipation = createCareerState({
    ...monthlyLifecycle.careerState,
    gameState: {
      ...gameStateWithConsequences,
      calendar: {
        ...gameStateWithConsequences.calendar,
        currentDate: input.fixture.date > gameStateWithConsequences.calendar.currentDate
          ? input.fixture.date
          : gameStateWithConsequences.calendar.currentDate,
      },
    },
    playerAvailability: availabilityConsequences.availability,
  });
  const progressedCareerStateWithParticipation = accrueFixtureParticipationContributions({
    careerState: progressedCareerStateWithoutParticipation,
    contributions: participation.contributions,
  });
  const fixtureBonuses = progressedCareerStateWithParticipation.clubFinanceState === undefined
    && progressedCareerStateWithParticipation.seniorSquadState === undefined
    ? undefined
    : settleFixtureContractBonuses({
        careerState: progressedCareerStateWithParticipation,
        fixture: input.fixture,
        report: input.report,
        participationSides: input.participationSides,
        ...(input.appliedSubstitutions === undefined ? {} : { appliedSubstitutions: input.appliedSubstitutions }),
      });
  if (fixtureBonuses?.status === "rejected") {
    return invalidResult(input.careerState, "finance_lifecycle_rejected", input.fixture.id);
  }
  const progressedCareerStateAfterFinance = fixtureBonuses?.careerState
    ?? progressedCareerStateWithParticipation;
  const progressedCareerState = deliverCareerInboxMessages(
    progressedCareerStateAfterFinance,
    createMatchConsequenceInboxMessages(progressedCareerStateAfterFinance, availabilityConsequences.consequences),
  );
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
    fieldedLineups: fieldedLineupsFromParticipation(input.participationSides),
    conditionChanges: conditionConsequences.changes,
    playerStateConsequences: matchStateConsequences.changes,
    playerStateConsequenceSummary: matchStateConsequences.summary,
    playerAvailabilityConsequences: availabilityConsequences.consequences,
    monthlyLifecycle: monthlyLifecycle.summaries,
    financeLedgerEntryIds: fixtureBonuses?.postedEntryIds ?? [],
    careerState: progressedCareerState,
  };
}

type ResolvedFixtureTeamContexts =
  | {
      readonly status: "resolved";
      readonly home: ResolvedTeamContext;
      readonly away: ResolvedTeamContext;
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

  if (home.context.context.clubId !== fixture.homeClubId) {
    return { status: "invalid", result: invalidResult(careerState, "home_team_context_mismatch", fixture.id) };
  }

  if (away.context.context.clubId !== fixture.awayClubId) {
    return { status: "invalid", result: invalidResult(careerState, "away_team_context_mismatch", fixture.id) };
  }

  return {
    status: "resolved",
    home: home.context,
    away: away.context,
  };
}

interface ResolvedTeamContext {
  readonly context: MatchTeamContext;
  /** The selection-owned focus consumed at kickoff without a second evaluation. */
  readonly lateralFocus: LateralFocus;
}

type ResolveTeamContextResult =
  | {
      readonly status: "resolved";
      readonly context: ResolvedTeamContext | undefined;
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
    if (suppliedContext !== undefined) {
      const eligibilityBlockers = findCareerFixtureEligibilityBlockers(
        careerState.playerAvailability ?? EMPTY_PLAYER_AVAILABILITY,
        suppliedContext.lineup.map((slot) => slot.playerId),
        fixture.date,
        fixture.competitionId,
      );
      if (eligibilityBlockers.length > 0) {
        return {
          status: "invalid",
          result: invalidResult(
            careerState,
            "unavailable_player_selected",
            fixture.id,
            eligibilityBlockers,
          ),
        };
      }
    }
    return {
      status: "resolved",
      context: suppliedContext === undefined
        ? undefined
        : { context: suppliedContext, lateralFocus: "balanced" },
    };
  }

  const aiSelection = input.aiTeamSelection;
  if (aiSelection === undefined) {
    return {
      status: "resolved",
      context: undefined,
    };
  }

  try {
    const selection = selectCareerAiTeam({
      careerState,
      clubId,
      fixture,
      policy: aiSelection,
      matchTacticsCalibration: input.matchTacticsCalibration,
      valuationConfig: input.valuationConfig,
    });
    return {
      status: "resolved",
      context: {
        context: selection.teamContext,
        lateralFocus: selection.tacticalPolicy.ownFit.lateralFocus,
      },
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
  home: ResolvedTeamContext,
  away: ResolvedTeamContext,
): SimulatedFixtureProgression {
  const simulatedMatch = simulateMatch({
    fixtureId,
    seed: input.careerState.gameState.meta.seed,
    home: home.context,
    away: away.context,
    engineConfig: input.matchEngineConfig,
    matchTacticsCalibration: input.matchTacticsCalibration,
  }, {
    includeExplanationTrace: input.includeExplanationTrace === true,
    lateralFocusBySide: {
      home: home.lateralFocus,
      away: away.lateralFocus,
    },
  });

  return {
    report: createMatchReport(simulatedMatch),
    playerRatings: buildPlayerMatchRatings({
      events: simulatedMatch.events,
      playerRegistrations: playerRatingRegistrationsFromContext({
        fixtureId,
        seed: input.careerState.gameState.meta.seed,
        home: home.context,
        away: away.context,
        engineConfig: input.matchEngineConfig,
        matchTacticsCalibration: input.matchTacticsCalibration,
      }),
    }),
    ...(simulatedMatch.explanationTrace === undefined ? {} : { explanationTrace: simulatedMatch.explanationTrace }),
  };
}

/** Reads both kickoff elevens off the participation facts already assembled. */
function fieldedLineupsFromParticipation(
  sides: readonly FixtureParticipationSideContext[],
): FixtureFieldedLineups {
  const lineupFor = (side: MatchSide): readonly LineupSlot[] => {
    const context = sides.find((entry) => entry.side === side)?.initialContext;
    if (context === undefined) {
      throw new Error(`Committed fixture has no ${side} participation context`);
    }
    return context.lineup;
  };

  return { home: lineupFor("home"), away: lineupFor("away") };
}

/** Reads only incident exits confirmed by the committed final team contexts. */
function incidentPlayerExits(
  report: MatchReport,
  sides: readonly FixtureParticipationSideContext[],
): readonly { readonly side: MatchSide; readonly playerId: PlayerId; readonly minute: number }[] {
  return report.events.flatMap((event) => {
    if (
      event.type !== "red_card"
      && event.type !== "second_yellow_card"
      && event.type !== "injury"
    ) return [];
    const side = sides.find((candidate) => candidate.side === event.side);
    if (side === undefined || side.finalContext.lineup.some(({ playerId }) => playerId === event.playerId)) {
      return [];
    }
    return [{ side: event.side, playerId: event.playerId, minute: event.minute }];
  });
}

function sideContextsFromCompletedMatch(
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

/** Ensures one final report belongs to the same fixture and clubs that kicked off. */
function contextsMatchFixture(initial: MatchContext, final: MatchContext, fixture: Fixture): boolean {
  return initial.fixtureId === fixture.id
    && final.fixtureId === fixture.id
    && initial.home.clubId === fixture.homeClubId
    && initial.away.clubId === fixture.awayClubId
    && final.home.clubId === fixture.homeClubId
    && final.away.clubId === fixture.awayClubId;
}

/** Resolves which fixture side belongs to the manager's selected club. */
function selectedClubFixtureSide(selectedClubId: ClubId, fixture: Fixture): "home" | "away" | undefined {
  if (fixture.homeClubId === selectedClubId) return "home";
  if (fixture.awayClubId === selectedClubId) return "away";
  return undefined;
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
  eligibilityBlockers?: readonly CareerFixtureEligibilityBlocker[],
): ProgressCareerFixtureInvalid {
  return {
    status: "invalid",
    reason,
    fixtureId,
    ...(eligibilityBlockers === undefined ? {} : { eligibilityBlockers }),
    careerState,
  };
}
