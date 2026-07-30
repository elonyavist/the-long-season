import { createHash } from "node:crypto";
import { isMainThread, parentPort, Worker, workerData } from "node:worker_threads";
import {
  createAnnualWorldIntakeCandidateProviders,
  createFakeDomesticWorld,
  resolveSeasonTransferWindows,
  seasonStartYearFromDate,
  selectAskingPriceCurves,
  selectMarketBehaviorCalibration,
  selectPlayerValuationConfig,
  selectPlayerWagePolicyConfig,
  type FakeDomesticWorld,
} from "@game/content";
import {
  advanceCareerOneSeason,
  developPlayersForSeason,
  derivePlayerPotentialProjection,
  derivePlayerValuation,
  deriveTeamStrength,
  deriveTransferCommercialSnapshot,
  selectFreeAgentPlayerIds,
  settleSeasonDistribution,
  summarizePlayerDevelopmentAbilities,
  type AdvanceCareerReportRefreshMode,
  type LineupSlot,
  type RoleWeightProfile,
  type SimulateSeasonInput,
  type SimulateSeasonTeamInput,
  type SimulateSeasonResult,
} from "@game/engine";
import { createTranslator, type SupportedLanguage, type Translator } from "@game/i18n";
import {
  createPlayerGenerationAnnualIntakeSummary,
  createPlayerGenerationEconomyAudit,
  createPlayerPotentialOutcomeAudit,
  createLongRunAnomalyReport,
  createLongRunClubStabilityReport,
  createLongRunContractFinanceSeasonRow,
  createLongRunContractFinanceStabilityReport,
  createLongRunPlayerEvolutionReport,
  createLongRunYouthStabilityReport,
  resolveSimulationWorkerCount,
  runCareerLongRunSimulation,
  worstLongRunAnomalyStatus,
  type AdvanceCareerLongRunSeasonContext,
  type AdvanceCareerLongRunSeasonResult,
  type CareerLongRunSeasonResult,
  type LongRunAnomalyReport,
  type LongRunBalanceSeasonRow,
  type LongRunClubSeasonRow,
  type LongRunClubStabilityReport,
  type LongRunContractFinanceStabilityReport,
  type LongRunCrossTierTransferRow,
  type LongRunDivisionMarketEconomyRow,
  type LongRunDivisionWageEconomyRow,
  type LongRunFreeAgentBands,
  type LongRunPermanentTransferFunnel,
  type LongRunPreliminaryAgreementFunnel,
  type LongRunPlayerEvolutionReport,
  type LongRunPlayerProductionRow,
  type LongRunPlayerSnapshotRow,
  type LongRunYouthSeasonRow,
  type LongRunYouthStabilityReport,
  type PlayerGenerationEconomyAudit,
  type PlayerGenerationEconomyGate,
  type PlayerGenerationEconomyObservation,
  type PlayerGenerationAnnualIntakeObservation,
  type PlayerGenerationAnnualIntakeSummary,
  type PlayerGenerationNegotiationObservation,
  type PlayerPotentialOutcomeAudit,
  type PlayerPotentialOutcomeObservation,
  type PotentialProjectionPolicyCalibrationBand,
  type SuppliedNegotiationAggregate,
} from "@game/simulation-tools";
import {
  careerStateFromNewWorld,
  competitionIdForClubInWorld,
} from "../career/scenarios.ts";
import type { CliCareerState, CliPlayer, CliSaveId } from "../career/types.ts";

type Phase79CCalibrationVersions = FakeDomesticWorld["calibrationVersions"];
type Phase79DValuationConfig = ReturnType<typeof selectPlayerValuationConfig>;
type Phase79CClubId = CliCareerState["gameState"]["clubIds"][number];
type Phase79CPlayerId = CliCareerState["gameState"]["playerIds"][number];
type Phase79DTransferNegotiationState =
  NonNullable<CliCareerState["transferNegotiationState"]>;
type Phase79DTransferNegotiation =
  Phase79DTransferNegotiationState["negotiations"][
    Phase79DTransferNegotiationState["negotiationIds"][number]
  ];

/** Candidate pool size per club for long-run squad maintenance stress tests. */
const LONG_RUN_INTAKE_CANDIDATES_PER_CLUB = 8;

/** Minimum club goals needed before creator-share ratios are structurally meaningful. */
const MIN_GOALS_FOR_CREATOR_SHARE = 40;

/** Fixed seed prefix for the Phase 79D pre-change 100-world baseline. */
export const PHASE_79D_BASELINE_SEED_PREFIX = "phase79d-prechange-baseline";

/** Exact world count required by the Phase 79D baseline contract. */
export const PHASE_79D_BASELINE_WORLD_COUNT = 100;

/** Reproduced Phase 79C market cohort retained as supplied aggregate facts. */
export const PHASE_79C_NEGOTIATION_BASELINE: SuppliedNegotiationAggregate = {
  sourceLabel: "phase79c-three-division-short-10x10",
  offerCount: 23_718,
  sellerCounterCount: 0,
  permanentCompletionCount: 12_237,
  askingPriceDistribution: {
    observationCount: 12_237,
    p50MinorUnits: 146_668_271,
    p90MinorUnits: 1_523_434_510,
    p99MinorUnits: 3_140_116_475,
    maximumMinorUnits: 11_736_102_461,
  },
  completedFeeDistribution: {
    observationCount: 12_237,
    p50MinorUnits: 146_668_271,
    p90MinorUnits: 1_523_434_510,
    p99MinorUnits: 3_140_116_475,
    maximumMinorUnits: 11_736_102_461,
  },
};

/** Reproducibility metadata and structured diagnostics for the Step 01 baseline. */
export interface Phase79DInitialWorldBaseline {
  readonly seedPrefix: typeof PHASE_79D_BASELINE_SEED_PREFIX;
  readonly worldCount: typeof PHASE_79D_BASELINE_WORLD_COUNT;
  readonly populationInclusion: "initial contracted senior players only";
  readonly moneyUnit: "integer minor units; 100 minor units = EUR 1";
  readonly percentileMethod: PlayerGenerationEconomyAudit["percentileMethod"];
  readonly calibrationVersions: Phase79CCalibrationVersions;
  readonly compositionHashes: readonly Readonly<{ seed: string; hash: string }>[];
  readonly audit: PlayerGenerationEconomyAudit;
}

/** Reproducibility metadata and report for the development-outcome matrix. */
export interface Phase79DPotentialOutcomeBaseline {
  readonly seedPrefix: "phase79d-potential-outcome";
  readonly sampleStreamsPerCell: 5;
  readonly startAgeMinimum: 15;
  readonly startAgeMaximum: 27;
  readonly finalAge: 35;
  readonly participationMinutesPerMonth: Readonly<Record<
    PlayerPotentialOutcomeObservation["participationBand"],
    number
  >>;
  readonly projectionPolicyCalibration:
    readonly PotentialProjectionPolicyCalibrationBand[];
  readonly audit: PlayerPotentialOutcomeAudit;
}

/** Minimal deterministic season facts retained by the CLI long-run report. */
export interface LongRunRetainedSeasonResult {
  /** Number of completed league fixtures. */
  readonly fixtureCount: number;
  /** Number of completed fixtures that ended level. */
  readonly drawCount: number;
  /** Final league table. */
  readonly table: SimulateSeasonResult["table"];
  /** Goal totals sorted by the season simulator. */
  readonly playerGoalStats: SimulateSeasonResult["playerGoalStats"];
  /** Player production totals used by creator-concentration reports. */
  readonly playerSummaryStats: SimulateSeasonResult["playerSummaryStats"];
}

/** One CLI long-run season with only report-relevant retained facts. */
export type LongRunSeasonResult = CareerLongRunSeasonResult<LongRunRetainedSeasonResult>;

/** Year-ten exceptional-rating stock checked against the versioned rarity contract. */
export interface Phase79CYearTenRatingStock {
  readonly currentFiveAndHalfCount: number;
  readonly currentSixCount: number;
  readonly potentialSixCount: number;
  readonly lowerDivisionPotentialSixCount: number;
  readonly violationCount: number;
  readonly locations: readonly string[];
}

/** Compact distribution for one retained set of market money facts. */
export interface LongRunMoneyDistribution {
  readonly count: number;
  readonly p50: number;
  readonly p90: number;
  readonly p99: number;
  readonly maximum: number;
}

/** One world's closing wage-economy row with deterministic seed provenance. */
export interface LongRunGateDivisionWageEconomySnapshot extends LongRunDivisionWageEconomyRow {
  readonly seed: string;
}

/** One world's closing market-economy row with deterministic seed provenance. */
export interface LongRunGateDivisionMarketEconomySnapshot extends LongRunDivisionMarketEconomyRow {
  readonly seed: string;
}

/** One world's closing cross-tier transfer row with deterministic seed provenance. */
export interface LongRunGateCrossTierTransferSnapshot extends LongRunCrossTierTransferRow {
  readonly seed: string;
}

/** Complete report bundle for one deterministic career world. */
export interface SingleWorldLongRunReport {
  /** Seed used to generate this world. */
  readonly seed: string;
  /** Generated fake league for this world. */
  readonly league: FakeDomesticWorld;
  /** Final canonical career retained for bounded Phase 79C diagnostics. */
  readonly finalCareerState: CliCareerState;
  /** Completed career-aware season rows. */
  readonly seasons: readonly LongRunSeasonResult[];
  /** Player-development and production report. */
  readonly playerEvolutionReport: LongRunPlayerEvolutionReport;
  /** Club-stability and squad-refresh report. */
  readonly clubStabilityReport: LongRunClubStabilityReport;
  /** Youth-academy population and lifecycle report. */
  readonly youthStabilityReport: LongRunYouthStabilityReport;
  /** Contract, registration, finance, and plan-continuity report. */
  readonly contractFinanceStabilityReport: LongRunContractFinanceStabilityReport;
  /** Deterministic anomaly report. */
  readonly anomalyReport: LongRunAnomalyReport;
  /** Annual exceptional-intake funnel observed through canonical rollover. */
  readonly annualIntakeAudit: PlayerGenerationAnnualIntakeSummary;
  /** Joint player/range/value/cap/negotiation facts for Phase 79D gates. */
  readonly playerEconomyAudit: PlayerGenerationEconomyAudit;
  /** Exact season-ten stock; absent when the requested run ends earlier. */
  readonly yearTenExceptionalRatingStock?: Phase79CYearTenRatingStock;
  /** Active exceptional-rating stock after the requested final season. */
  readonly closingExceptionalRatingStock: Phase79CYearTenRatingStock;
  /** Initial/final club ability hierarchy snapshot. */
  readonly strengthHierarchy: ClubAbilityHierarchySummary;
}

/** One world summary inside the explicit long-run regression gate. */
export interface LongRunGateWorldSummary {
  /** Stable generated world seed. */
  readonly seed: string;
  /** Same-seed initial composition hash, independent from the simulated seasons. */
  readonly compositionHash: string;
  /** Exact calibration versions stamped into this career. */
  readonly calibrationVersions: Phase79CCalibrationVersions;
  /** Final exceptional-rating stock and any versioned cap violation. */
  readonly yearTenRatingStock: Phase79CYearTenRatingStock;
  /** Whether this world actually reached the season-ten boundary. */
  readonly yearTenRatingStockObservationCount: 0 | 1;
  /** Non-vacuous Phase 79D gates retained without full player observations. */
  readonly playerEconomyGates: readonly PlayerGenerationEconomyGate[];
  /** Public values frozen for completed permanent transfers. */
  readonly permanentTransferPublicValues: readonly number[];
  /** Initial seller asking prices frozen for completed permanent transfers. */
  readonly permanentTransferAskingPrices: readonly number[];
  /** Exact settled fees for completed permanent transfers. */
  readonly permanentTransferCompletedFees: readonly number[];
  /** Public values retained by completed free-agent signings. */
  readonly freeAgentPublicValues: readonly number[];
  /** Free-agent signings whose completed fee is not exactly zero. */
  readonly freeAgentZeroFeeViolationCount: number;
  /** Closing per-division wage economy. */
  readonly closingDivisionWageEconomy: readonly LongRunDivisionWageEconomyRow[];
  /** Closing per-division cash, transfer room, exposure, and activity. */
  readonly closingDivisionMarketEconomy: readonly LongRunDivisionMarketEconomyRow[];
  /** Closing cross-tier attempt/completion diagnostics. */
  readonly closingCrossTierTransfers: readonly LongRunCrossTierTransferRow[];
  /** PASS/WARN/FAIL status for this world. */
  readonly status: LongRunAnomalyReport["status"];
  /** Average goals per match across this world run. */
  readonly goalsPerMatchAverage: number;
  /** Average draw rate across this world run. */
  readonly drawRateAverage: number;
  /** Highest draw rate observed in one season for this world. */
  readonly drawRateMax: number;
  /** Season number where the highest draw rate happened. */
  readonly highestDrawRateSeasonNumber: number;
  /** Number of distinct champions across this world run. */
  readonly uniqueChampionCount: number;
  /** Longest consecutive champion streak. */
  readonly longestChampionStreak: number;
  /** Club name that produced the longest champion streak. */
  readonly longestChampionStreakClubName: string;
  /** Lowest champion points during the longest streak. */
  readonly championStreakPointsMin: number;
  /** Highest champion points during the longest streak. */
  readonly championStreakPointsMax: number;
  /** Average table spread during the longest streak. */
  readonly championStreakTableSpreadAverage: number;
  /** Initial top-to-bottom club current-ability spread. */
  readonly initialClubAbilitySpread: number;
  /** Final top-to-bottom club current-ability spread. */
  readonly finalClubAbilitySpread: number;
  /** Average first-place points across this world run. */
  readonly firstPlacePointsAverage: number;
  /** Average last-place points across this world run. */
  readonly lastPlacePointsAverage: number;
  /** Average first-minus-last points spread across this world run. */
  readonly tablePointsSpreadAverage: number;
  /** Lowest first-minus-last spread observed in this world run. */
  readonly tablePointsSpreadMin: number;
  /** Highest first-minus-last spread observed in this world run. */
  readonly tablePointsSpreadMax: number;
  /** Season number where the lowest table spread happened. */
  readonly lowestTableSpreadSeasonNumber: number;
  /** Lowest champion points total observed in this world run. */
  readonly firstPlacePointsMin: number;
  /** Highest champion points total observed in this world run. */
  readonly firstPlacePointsMax: number;
  /** Lowest last-place points total observed in this world run. */
  readonly lastPlacePointsMin: number;
  /** Highest last-place points total observed in this world run. */
  readonly lastPlacePointsMax: number;
  /** Maximum top-assist count observed across this world run. */
  readonly topAssistMax: number;
  /** Season number where the strongest creator concentration happened. */
  readonly topCreatorSeasonNumber: number;
  /** Creator-concentration club name for compact gate diagnostics. */
  readonly topCreatorClubName: string;
  /** Creator name for compact gate diagnostics. */
  readonly topCreatorName: string;
  /** Creator assists for the concentration snapshot. */
  readonly topCreatorAssists: number;
  /** Goals scored by the creator's club in the concentration snapshot. */
  readonly topCreatorClubGoals: number;
  /** Highest single-creator club-goal share observed in this world. */
  readonly topCreatorGoalShareMax: number;
  /** Highest top-three creator club-goal share observed in this world. */
  readonly topThreeCreatorGoalShareMax: number;
  /** Global top-assist player name in the creator-concentration season. */
  readonly topAssistName: string;
  /** Global top-scorer player name in the creator-concentration season. */
  readonly topScorerName: string;
  /** Global top-scorer goals in the creator-concentration season. */
  readonly topScorerGoals: number;
  /** Final share of players aged 30 or older. */
  readonly age30PlusShare: number;
  /** Total transfer-turnover movements. */
  readonly transferTurnoverCount: number;
  /** Total squad-turnover movements and additions. */
  readonly squadTurnoverCount: number;
  /** Minimum roster size observed after refresh. */
  readonly minimumSquadSizeObserved: number;
  /** Club-season observations below minimum roster size. */
  readonly clubsBelowMinimumSquadSizeCount: number;
  /** Club-season observations without natural goalkeeper coverage. */
  readonly clubsWithoutNaturalGoalkeeperCount: number;
  /** Role/depth warnings emitted across this world run. */
  readonly roleCoverageWarningCount: number;
  /** Maximum youth roster size observed after refresh. */
  readonly maximumYouthRosterSizeObserved: number;
  /** Minimum active senior player count observed. */
  readonly minimumSeniorPlayerCountObserved: number;
  /** Maximum active senior player count observed. */
  readonly maximumSeniorPlayerCountObserved: number;
  /** Minimum active academy player count observed. */
  readonly minimumYouthPlayerCountObserved: number;
  /** Maximum active academy player count observed. */
  readonly maximumYouthPlayerCountObserved: number;
  /** Minimum total active player count observed. */
  readonly minimumActivePlayerCountObserved: number;
  /** Maximum total active player count observed. */
  readonly maximumActivePlayerCountObserved: number;
  /** Club-season observations above youth roster target. */
  readonly clubsAboveYouthTargetCount: number;
  /** Club-season observations below youth roster minimum. */
  readonly clubsBelowYouthMinimumCount: number;
  /** Structural contract, ownership, finance, and plan violations. */
  readonly contractFinanceStructuralViolationCount: number;
  /** Lowest club cash balance observed, in minor units. */
  readonly minimumCashBalanceObserved: number;
  /** Highest committed annual-wage share observed. */
  readonly maximumWageBudgetUtilizationObserved: number;
  /** Highest free-agent share observed. */
  readonly maximumFreeAgentShareObserved: number;
  /** Lowest sampled player valuation, in minor units. */
  readonly minimumPlayerValueObserved: number;
  /** Highest sampled player valuation, in minor units. */
  readonly maximumPlayerValueObserved: number;
  /** Contract renewals across the world run. */
  readonly renewalCount: number;
  /** Contract releases across the world run. */
  readonly releaseCount: number;
  /** Contract expiries across the world run. */
  readonly expiryCount: number;
  /** Selected-club expiry decisions left explicitly to the manager. */
  readonly selectedClubExpiredDecisionCount: number;
  /** Completed permanent transfers across the world run. */
  readonly completedTransferCount: number;
  /** Permanent-transfer funnel aggregated across the world run. */
  readonly permanentTransferFunnel: LongRunPermanentTransferFunnel;
  /** Preliminary-agreement funnel aggregated across the world run. */
  readonly preliminaryAgreementFunnel: LongRunPreliminaryAgreementFunnel;
  /** Highest useful closing free-agent stock in one season. */
  readonly maximumUsefulFreeAgentCountObserved: number;
  /** Closing free-agent band observations across this world run. */
  readonly freeAgentBandObservations: LongRunFreeAgentBands;
  /** Bounded club-season utilization samples used for exact cohort quantiles. */
  readonly wageBudgetUtilizations: readonly number[];
  /** Bounded club-season headroom samples used for exact cohort quantiles. */
  readonly annualWageHeadrooms: readonly number[];
  /** Share of club-seasons at or above 95% wage utilization. */
  readonly wagePressureClubSeasonShare: number;
  /** Share of club-seasons exactly at the wage ceiling. */
  readonly exactWageCeilingClubSeasonShare: number;
  /** Share of club-seasons above the wage budget. */
  readonly aboveWageBudgetClubSeasonShare: number;
  /** Exact-ceiling club-seasons reached after transfer-to-wage reallocation. */
  readonly reallocationExactCeilingClubSeasonCount: number;
  /** Failing anomaly keys for this world. */
  readonly failingCheckKeys: readonly string[];
  /** Warning-level anomaly keys for this world. */
  readonly warningCheckKeys: readonly string[];
}

/** Aggregate report for an explicit long-run regression gate. */
export interface LongRunGateReport {
  /** Seed prefix used to derive world seeds. */
  readonly seedPrefix: string;
  /** Number of simulated worlds. */
  readonly worldCount: number;
  /** Number of seasons simulated per world. */
  readonly seasonCount: number;
  /** Deterministic execution metadata for reproducing large gates. */
  readonly execution: LongRunGateExecutionSummary;
  /** Total simulated seasons. */
  readonly totalSeasonCount: number;
  /** Number of worlds breaching the versioned year-ten exceptional-rating caps. */
  readonly ratingInflationViolationWorldCount: number;
  /** Worlds that actually reached and observed the season-ten stock boundary. */
  readonly yearTenRatingStockObservationCount: number;
  /** Aggregated Phase 79D gate observations and non-pass world counts. */
  readonly playerEconomyGates: readonly LongRunGatePlayerEconomyGateSummary[];
  /** Highest year-ten current-six stock across worlds. */
  readonly yearTenCurrentSixMaximumObserved: number;
  /** Highest year-ten potential-six stock across worlds. */
  readonly yearTenPotentialSixMaximumObserved: number;
  /** Highest lower-division potential-six stock across worlds. */
  readonly yearTenLowerDivisionPotentialSixMaximumObserved: number;
  /** Exact calibration-version bundles observed, keyed by their stable JSON form. */
  readonly calibrationVersionBundles: readonly Phase79CCalibrationVersions[];
  /** Deterministic initial composition hash per seed. */
  readonly compositionHashes: readonly Readonly<{ seed: string; hash: string }>[];
  /** Number of worlds with failing anomaly checks. */
  readonly failedWorldCount: number;
  /** Number of worlds with warning-level anomaly checks. */
  readonly warningWorldCount: number;
  /** Minimum squad size observed across every world. */
  readonly minimumSquadSizeObserved: number;
  /** Total club-season observations below minimum roster size. */
  readonly clubsBelowMinimumSquadSizeCount: number;
  /** Total club-season observations without natural goalkeeper coverage. */
  readonly clubsWithoutNaturalGoalkeeperCount: number;
  /** Total role/depth warnings emitted across every world. */
  readonly roleCoverageWarningCount: number;
  /** Maximum youth roster size observed across every world. */
  readonly maximumYouthRosterSizeObserved: number;
  /** Minimum active senior player count observed across every world. */
  readonly minimumSeniorPlayerCountObserved: number;
  /** Maximum active senior player count observed across every world. */
  readonly maximumSeniorPlayerCountObserved: number;
  /** Minimum active academy player count observed across every world. */
  readonly minimumYouthPlayerCountObserved: number;
  /** Maximum active academy player count observed across every world. */
  readonly maximumYouthPlayerCountObserved: number;
  /** Minimum total active player count observed across every world. */
  readonly minimumActivePlayerCountObserved: number;
  /** Maximum total active player count observed across every world. */
  readonly maximumActivePlayerCountObserved: number;
  /** Total club-season observations above youth roster target. */
  readonly clubsAboveYouthTargetCount: number;
  /** Total club-season observations below youth roster minimum. */
  readonly clubsBelowYouthMinimumCount: number;
  /** Total structural contract, ownership, finance, and plan violations. */
  readonly contractFinanceStructuralViolationCount: number;
  /** Lowest club cash balance observed, in minor units. */
  readonly minimumCashBalanceObserved: number;
  /** Highest committed annual-wage share observed. */
  readonly maximumWageBudgetUtilizationObserved: number;
  /** Highest free-agent share observed. */
  readonly maximumFreeAgentShareObserved: number;
  /** Lowest sampled player valuation, in minor units. */
  readonly minimumPlayerValueObserved: number;
  /** Highest sampled player valuation, in minor units. */
  readonly maximumPlayerValueObserved: number;
  /** Total contract renewals across every world. */
  readonly renewalCount: number;
  /** Total contract releases across every world. */
  readonly releaseCount: number;
  /** Total contract expiries across every world. */
  readonly expiryCount: number;
  /** Total selected-club expiry decisions intentionally left to managers. */
  readonly selectedClubExpiredDecisionCount: number;
  /** Total completed permanent transfers. */
  readonly completedTransferCount: number;
  /** Completed permanent-transfer public-value distribution. */
  readonly permanentTransferPublicValueDistribution: LongRunMoneyDistribution;
  /** Completed permanent-transfer asking-price distribution. */
  readonly permanentTransferAskingPriceDistribution: LongRunMoneyDistribution;
  /** Completed permanent-transfer settled-fee distribution. */
  readonly permanentTransferCompletedFeeDistribution: LongRunMoneyDistribution;
  /** Completed free-agent public-value distribution. */
  readonly freeAgentPublicValueDistribution: LongRunMoneyDistribution;
  /** Exact-zero-fee invariant violations across free-agent signings. */
  readonly freeAgentZeroFeeViolationCount: number;
  /** Permanent-transfer funnel aggregated across every world. */
  readonly permanentTransferFunnel: LongRunPermanentTransferFunnel;
  /** Preliminary-agreement funnel aggregated across every world. */
  readonly preliminaryAgreementFunnel: LongRunPreliminaryAgreementFunnel;
  /** Highest useful closing free-agent stock in one world-season. */
  readonly maximumUsefulFreeAgentCountObserved: number;
  /** Closing free-agent band observations across every world-season. */
  readonly freeAgentBandObservations: LongRunFreeAgentBands;
  /** Median wage utilization across every club-season. */
  readonly wageBudgetUtilizationP50: number;
  /** 90th-percentile wage utilization across every club-season. */
  readonly wageBudgetUtilizationP90: number;
  /** 95th-percentile wage utilization across every club-season. */
  readonly wageBudgetUtilizationP95: number;
  /** 99th-percentile wage utilization across every club-season. */
  readonly wageBudgetUtilizationP99: number;
  /** Share of club-seasons at or above 95% wage utilization. */
  readonly wagePressureClubSeasonShare: number;
  /** Share of club-seasons exactly at the wage ceiling. */
  readonly exactWageCeilingClubSeasonShare: number;
  /** Share of club-seasons above the wage budget. */
  readonly aboveWageBudgetClubSeasonShare: number;
  /** Median remaining annual-wage headroom in minor units. */
  readonly annualWageHeadroomP50: number;
  /** 10th-percentile remaining annual-wage headroom in minor units. */
  readonly annualWageHeadroomP10: number;
  /** Exact-ceiling club-seasons reached after transfer-to-wage reallocation. */
  readonly reallocationExactCeilingClubSeasonCount: number;
  /** Average goals-per-match value across world averages. */
  readonly goalsPerMatchAverage: number;
  /** 95th percentile goals-per-match world average. */
  readonly goalsPerMatchP95: number;
  /** Average table spread across world averages. */
  readonly tablePointsSpreadAverage: number;
  /** Lowest table spread average observed across worlds. */
  readonly tablePointsSpreadMin: number;
  /** Average draw rate across world averages. */
  readonly drawRateAverage: number;
  /** Highest average draw rate observed across worlds. */
  readonly drawRateMax: number;
  /** Highest champion streak observed across worlds. */
  readonly championStreakMaxObserved: number;
  /** 95th percentile top-assist maximum per world. */
  readonly topAssistMaxP95: number;
  /** Highest top-assist maximum observed across all worlds. */
  readonly topAssistMaxObserved: number;
  /** Highest single-creator club-goal share observed across all worlds. */
  readonly topCreatorGoalShareMaxObserved: number;
  /** Highest top-three creator club-goal share observed across all worlds. */
  readonly topThreeCreatorGoalShareMaxObserved: number;
  /** 95th percentile final 30-plus player share per world. */
  readonly age30PlusShareP95: number;
  /** 95th percentile role/depth warnings per world. */
  readonly roleCoverageWarningP95: number;
  /** Warning-level anomaly counts grouped by stable check key. */
  readonly warningCheckCounts: readonly LongRunGateCheckCount[];
  /** Warning-level checks grouped by gameplay meaning. */
  readonly signalCheckCounts: readonly LongRunGateCheckCount[];
  /** Failing anomaly counts grouped by stable check key. */
  readonly failingCheckCounts: readonly LongRunGateCheckCount[];
  /** Reproducible worst worlds sorted by severity. */
  readonly worstWorlds: readonly LongRunGateWorldSummary[];
  /** Worlds with the strongest assist or creator-concentration stories. */
  readonly productionWarningWorlds: readonly LongRunGateWorldSummary[];
  /** Worlds with the longest champion streaks. */
  readonly dynastyWarningWorlds: readonly LongRunGateWorldSummary[];
  /** Worlds with the tightest average first-to-last table spread. */
  readonly tableSpreadWarningWorlds: readonly LongRunGateWorldSummary[];
  /** Worlds with recruitment needs but no completed permanent transfer. */
  readonly zeroPermanentTransferWorlds: readonly LongRunGateWorldSummary[];
  /** Worlds with the largest useful free-agent stock. */
  readonly usefulFreeAgentWorlds: readonly LongRunGateWorldSummary[];
  /** Worlds with the broadest club-season wage pressure. */
  readonly wagePressureWorlds: readonly LongRunGateWorldSummary[];
  /** Closing wage-economy rows for every world and division. */
  readonly divisionWageEconomySnapshots: readonly LongRunGateDivisionWageEconomySnapshot[];
  /** Closing market-economy rows for every world and division. */
  readonly divisionMarketEconomySnapshots: readonly LongRunGateDivisionMarketEconomySnapshot[];
  /** Closing cross-tier transfer rows for every world. */
  readonly crossTierTransferSnapshots: readonly LongRunGateCrossTierTransferSnapshot[];
  /** Exceptional year-ten locations for each deterministic world. */
  readonly yearTenExceptionalLocations: readonly Readonly<{
    seed: string;
    locations: readonly string[];
  }>[];
}

/** Cohort aggregate for one stable Phase 79D player/economy gate key. */
export interface LongRunGatePlayerEconomyGateSummary {
  readonly key: string;
  readonly observationCount: number;
  readonly violationCount: number;
  readonly failedWorldCount: number;
  readonly notEvaluatedWorldCount: number;
  readonly threshold: string;
}

/** Aggregate count for one anomaly key in a batch gate report. */
export interface LongRunGateCheckCount {
  /** Stable anomaly check key. */
  readonly key: string;
  /** Number of worlds that emitted this status for the key. */
  readonly count: number;
}

/** Deterministic metadata for the way a long-run gate was executed. */
export interface LongRunGateExecutionSummary {
  /** Execution strategy used without changing generated seeds or summaries. */
  readonly mode: "sequential" | "parallel" | "sharded";
  /** Number of worker partitions used to create world summaries. */
  readonly workerCount: number;
  /** Stable partition summary hashes in partition order. */
  readonly partitionHashes: readonly string[];
  /** Stable shard count when checkpoints were requested. */
  readonly shardCount?: number;
  /** Checkpoints reused instead of recomputed during this invocation. */
  readonly resumedShardCount?: number;
}

/** Input for the explicit long-run gate report. */
export interface CreateLongRunGateReportInput {
  /** Seed prefix used to derive world seeds. */
  readonly seedPrefix: string;
  /** Number of worlds to simulate. */
  readonly worldCount: number;
  /** Number of seasons per world. */
  readonly seasonCount: number;
  /** Presentation translator used for fallback labels. */
  readonly text: Translator;
  /** Language used by worker partitions to recreate the translator. */
  readonly language?: SupportedLanguage;
  /** Optional deterministic override for tests and local performance tuning. */
  readonly workerCount?: number;
}

/** Inputs for aggregating already-computed compact world summaries. */
export interface CreateLongRunGateReportFromWorldsInput {
  /** Seed prefix shared by every world summary. */
  readonly seedPrefix: string;
  /** Expected number of world summaries. */
  readonly worldCount: number;
  /** Seasons simulated in every world. */
  readonly seasonCount: number;
  /** Deterministic execution evidence for this invocation. */
  readonly execution: LongRunGateExecutionSummary;
  /** Compact summaries in any order; aggregation restores seed order. */
  readonly worlds: readonly LongRunGateWorldSummary[];
}

/** A contiguous world-index partition for a long-run gate worker. */
export interface LongRunGateWorkerPartition {
  /** First one-based world index in the partition. */
  readonly startIndex: number;
  /** Last one-based world index in the partition. */
  readonly endIndex: number;
}

/** Serializable worker input for a long-run gate partition. */
export interface LongRunGateWorkerData extends LongRunGateWorkerPartition {
  /** Seed prefix used to derive world seeds. */
  readonly seedPrefix: string;
  /** Number of seasons per world. */
  readonly seasonCount: number;
  /** Language used for fallback labels inside reports. */
  readonly language: SupportedLanguage;
}

/** Successful worker response with compact deterministic summaries. */
export interface LongRunGateWorkerSuccess {
  /** Worker success marker. */
  readonly ok: true;
  /** Completed partition. */
  readonly partition: LongRunGateWorkerPartition;
  /** Compact summaries for the partition worlds. */
  readonly worlds: readonly LongRunGateWorldSummary[];
}

/** Failed worker response with a serializable message. */
interface LongRunGateWorkerFailure {
  /** Worker failure marker. */
  readonly ok: false;
  /** Error message emitted by the worker. */
  readonly message: string;
}

/** Response sent from a long-run gate worker. */
type LongRunGateWorkerMessage = LongRunGateWorkerSuccess | LongRunGateWorkerFailure;

/**
 * Builds the full single-world report bundle used by both normal output and
 * long-run batch gates. Keeping one path avoids report drift.
 */
export function createSingleWorldReport(seed: string, seasonCount: number, text: Translator): SingleWorldLongRunReport {
  const league = createFakeDomesticWorld({ worldSeed: seed });
  const initialCareerState = careerStateFromNewWorld("save:ten-season-report" as CliSaveId, league, seed);
  const annualIntakeObservations: PlayerGenerationAnnualIntakeObservation[] = [];
  let yearTenCareerState: CliCareerState | undefined;
  const usefulLowerDivisionAbilityThreshold =
    lowerDivisionUsefulAbilityThreshold(initialCareerState);
  const report = runCareerLongRunSimulation({
    seed,
    seasonCount,
    initialCareerState,
    retainSeasonResult: retainLongRunSeasonResult,
    createSeasonInput: ({ seasonSeed, careerState }) =>
      createDomesticCareerSeasonInput(league, careerState as CliCareerState, seasonSeed),
    advanceCareerState: (context) =>
      advanceCareerForReport(league, seed, context, annualIntakeObservations),
    observeAdvancedSeason: ({ seasonNumber, careerState }) => {
      if (seasonNumber === 10) {
        yearTenCareerState = careerState as CliCareerState;
      }
    },
  });
  const rawPlayerEvolutionReport = createLongRunPlayerEvolutionReport({
    initialPlayers: snapshotPlayers(initialCareerState),
    finalPlayers: snapshotPlayers(report.finalCareerState as CliCareerState),
    production: productionRows(report.finalCareerState as CliCareerState, report.seasons, text),
    usefulPlayerCurrentAbilityThreshold:
      usefulLowerDivisionAbilityThreshold,
  });
  const playerEvolutionReport: LongRunPlayerEvolutionReport = {
    ...rawPlayerEvolutionReport,
    // The legacy one-league gate measured lower-division overproduction. A
    // complete three-tier world must not count normal First/Second players as
    // failures, so only the current Third Division population enters this
    // unchanged threshold.
    usefulAfterLongRun: usefulThirdDivisionPlayerCount(
      report.finalCareerState as CliCareerState,
      usefulLowerDivisionAbilityThreshold,
    ),
  };
  const clubStabilityReport = createLongRunClubStabilityReport(clubSeasonRows(league, report.seasons), refreshTotals(report.seasons));
  const youthStabilityReport = createLongRunYouthStabilityReport(youthSeasonRows(report.seasons));
  const contractFinanceStabilityReport = createLongRunContractFinanceStabilityReport(
    report.seasons.map((season) => season.refresh.contractFinance),
  );
  const anomalyReport = createLongRunAnomalyReport({
    balance: balanceSeasonRows(report.seasons),
    playerEvolution: playerEvolutionReport,
    clubStability: clubStabilityReport,
  });
  const finalCareerState = report.finalCareerState as CliCareerState;
  const valuationConfig = selectPlayerValuationConfig(
    requireCalibrationVersions(finalCareerState),
  );
  const initialObservations = phase79DInitialWorldObservations(seed, league);
  const finalObservations = phase79DActiveCareerObservations({
    seed,
    seasonIndex: seasonCount,
    careerState: finalCareerState,
    valuationConfig,
  });
  const playerEconomyAudit = createPlayerGenerationEconomyAudit({
    observations: [...initialObservations, ...finalObservations],
    negotiationObservations: phase79DNegotiationObservations({
      seed,
      seasonStartDate: league.seasonStartDate,
      careerState: finalCareerState,
    }),
    hardCapMinorUnits:
      valuationConfig.valuationCurves.upperTail.hardCapMinorUnits,
    initialRarityConstraints: {
      ...valuationConfig.ratingScale.rarity.initialWorld,
    },
    annualIntakeObservations,
  });

  return {
    seed,
    league,
    finalCareerState,
    seasons: report.seasons,
    playerEvolutionReport,
    clubStabilityReport,
    youthStabilityReport,
    contractFinanceStabilityReport,
    anomalyReport,
    annualIntakeAudit: createPlayerGenerationAnnualIntakeSummary(
      annualIntakeObservations,
    ),
    playerEconomyAudit,
    ...(yearTenCareerState === undefined
      ? {}
      : {
          yearTenExceptionalRatingStock:
            summarizePhase79CYearTenRatingStock(
              yearTenCareerState,
              selectPlayerValuationConfig(
                requireCalibrationVersions(yearTenCareerState),
              ),
            ),
        }),
    closingExceptionalRatingStock: summarizePhase79CYearTenRatingStock(
      finalCareerState,
      valuationConfig,
    ),
    strengthHierarchy: summarizeClubAbilityHierarchy(league, initialCareerState, report.finalCareerState as CliCareerState),
  };
}

/** Counts genuinely high-ability players currently registered in tier three. */
function usefulThirdDivisionPlayerCount(
  careerState: CliCareerState,
  usefulAbilityThreshold: number,
): number {
  const playerIds = new Set(
    careerState.gameState.clubIds.flatMap((clubId) => {
      const club = careerState.gameState.clubs[clubId];
      return club?.category === "third_division" ? club.playerIds : [];
    }),
  );
  return snapshotPlayers(careerState).filter(
    (player) =>
      playerIds.has(player.playerId as Phase79CPlayerId)
      && player.currentAbility >= usefulAbilityThreshold,
  ).length;
}

/**
 * Resolves the first global rating above Third Division's documented
 * exceptional maximum. This keeps the legacy usefulness check semantically
 * stable after replacing the old relative ability scale.
 */
function lowerDivisionUsefulAbilityThreshold(
  careerState: CliCareerState,
): number {
  const ratingScale = selectPlayerValuationConfig(
    careerState.gameState.meta.calibrationVersions,
  ).ratingScale;
  const exceptionalMaximum = ratingScale.divisionFirstTeamBands.find(
    (band) => band.division === "third_division",
  )?.exceptionalMaximum;
  const nextRating = ratingScale.supportedRatings.find(
    (rating) => exceptionalMaximum !== undefined && rating > exceptionalMaximum,
  );
  const threshold = ratingScale.abilityThresholds.find(
    (candidate) => candidate.rating === nextRating,
  )?.minimumAbilityInclusive;
  if (threshold === undefined) {
    throw new Error("Third Division usefulness threshold is missing");
  }
  return threshold;
}

/**
 * Runs an explicit multi-world long-run gate and returns compact aggregate
 * metrics. This is intentionally outside `pnpm check` because large gates can
 * be expensive.
 */
export async function createLongRunGateReport(input: CreateLongRunGateReportInput): Promise<LongRunGateReport> {
  const workerCount = resolveLongRunGateWorkerCount(input);
  const partitions = createLongRunGatePartitions(input.worldCount, workerCount);
  const partitionWorlds =
    workerCount === 1
      ? [runLongRunGatePartition({
          seedPrefix: input.seedPrefix,
          seasonCount: input.seasonCount,
          language: input.language ?? "en",
          startIndex: 1,
          endIndex: input.worldCount,
        })]
      : await runLongRunGatePartitions(partitions, {
          seedPrefix: input.seedPrefix,
          seasonCount: input.seasonCount,
          language: input.language ?? "en",
        });
  const worlds = partitionWorlds.flatMap((partition) => partition.worlds).sort((left, right) => left.seed.localeCompare(right.seed));
  const execution: LongRunGateExecutionSummary = {
    mode: workerCount === 1 ? "sequential" : "parallel",
    workerCount,
    partitionHashes: partitionWorlds.map((partition) => hashGateWorldSummaries(partition.worlds)),
  };

  return createLongRunGateReportFromWorlds({
    seedPrefix: input.seedPrefix,
    worldCount: input.worldCount,
    seasonCount: input.seasonCount,
    execution,
    worlds,
  });
}

/**
 * Resolves the worker count for a gate without changing the deterministic
 * world seeds or result ordering.
 */
export function resolveLongRunGateWorkerCount(
  input: Pick<CreateLongRunGateReportInput, "workerCount" | "worldCount">,
): number {
  return resolveSimulationWorkerCount({
    workItemCount: input.worldCount,
    ...(input.workerCount !== undefined
      ? { requestedWorkerCount: input.workerCount }
      : simulationWorkerEnvironmentOverride()),
  });
}

/**
 * Reads the optional process-level simulation override for CLI batch runners.
 */
function simulationWorkerEnvironmentOverride(): {
  readonly requestedWorkerCount?: number;
} {
  const value = process.env.TLS_SIMULATION_WORKERS;

  if (value === undefined) {
    return {};
  }

  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    throw new RangeError(
      `TLS_SIMULATION_WORKERS must be a positive safe integer: ${value}`,
    );
  }

  return { requestedWorkerCount: parsed };
}

/**
 * Splits one-based world indexes into stable contiguous partitions.
 */
export function createLongRunGatePartitions(
  worldCount: number,
  workerCount: number,
): readonly LongRunGateWorkerPartition[] {
  const partitions: LongRunGateWorkerPartition[] = [];
  const baseSize = Math.floor(worldCount / workerCount);
  const remainder = worldCount % workerCount;
  let startIndex = 1;

  for (let index = 0; index < workerCount; index += 1) {
    const size = baseSize + (index < remainder ? 1 : 0);
    const endIndex = startIndex + size - 1;
    partitions.push({ startIndex, endIndex });
    startIndex = endIndex + 1;
  }

  return partitions;
}

/**
 * Runs all worker partitions and returns them in deterministic partition order.
 */
async function runLongRunGatePartitions(
  partitions: readonly LongRunGateWorkerPartition[],
  input: Pick<LongRunGateWorkerData, "language" | "seasonCount" | "seedPrefix">,
): Promise<readonly LongRunGateWorkerSuccess[]> {
  const results = await Promise.all(
    partitions.map((partition) =>
      runLongRunGateWorkerThread({
        ...input,
        ...partition,
      }),
    ),
  );

  return results.sort((left, right) => left.partition.startIndex - right.partition.startIndex);
}

/**
 * Starts one Node worker for a long-run gate partition.
 */
export function runLongRunGateWorkerThread(input: LongRunGateWorkerData): Promise<LongRunGateWorkerSuccess> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL("./report-data.ts", import.meta.url), {
      workerData: input,
    });

    worker.once("message", (message: LongRunGateWorkerMessage) => {
      if (message.ok) {
        resolve(message);
        return;
      }

      reject(new Error(message.message));
    });
    worker.once("error", reject);
    worker.once("exit", (code) => {
      if (code !== 0) {
        reject(new Error(`Long-run gate worker exited with code ${code}`));
      }
    });
  });
}

/**
 * Runs a partition in the current thread or inside a worker thread.
 */
function runLongRunGatePartition(input: LongRunGateWorkerData): LongRunGateWorkerSuccess {
  const text = createTranslator(input.language);
  const worlds: LongRunGateWorldSummary[] = [];

  for (let index = input.startIndex; index <= input.endIndex; index += 1) {
    const seed = `${input.seedPrefix}-world-${String(index).padStart(5, "0")}`;
    try {
      const report = createSingleWorldReport(seed, input.seasonCount, text);
      worlds.push(summarizeGateWorld(report));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Long-run gate world ${index} (${seed}) failed: ${message}`, { cause: error });
    }
  }

  return {
    ok: true,
    partition: {
      startIndex: input.startIndex,
      endIndex: input.endIndex,
    },
    worlds,
  };
}

/**
 * Produces a compact stable hash for each gate partition.
 */
export function hashGateWorldSummaries(worlds: readonly LongRunGateWorldSummary[]): string {
  return createHash("sha256").update(JSON.stringify(worlds)).digest("hex").slice(0, 16);
}

/**
 * Checks worker input before executing this module as a worker entry point.
 */
function isLongRunGateWorkerData(value: unknown): value is LongRunGateWorkerData {
  const input = value as LongRunGateWorkerData | undefined;

  return (
    input !== undefined &&
    typeof input.seedPrefix === "string" &&
    Number.isSafeInteger(input.seasonCount) &&
    Number.isSafeInteger(input.startIndex) &&
    Number.isSafeInteger(input.endIndex) &&
    typeof input.language === "string"
  );
}

/**
 * Extracts compact world-level gate metrics from one full report bundle.
 */
function summarizeGateWorld(report: SingleWorldLongRunReport): LongRunGateWorldSummary {
  const finalAgeTotal =
    report.playerEvolutionReport.finalAgeUnder22 +
    report.playerEvolutionReport.finalAge22To29 +
    report.playerEvolutionReport.finalAge30Plus;
  const concentration = topCreatorConcentrationProductionRow(report.playerEvolutionReport.production);
  const balanceRows = balanceSeasonRows(report.seasons);
  const tableSpreadSnapshot = summarizeTableSpread(balanceRows);
  const drawSnapshot = summarizeDrawRates(report.seasons);
  const championStreakSnapshot = summarizeChampionStreak(report.clubStabilityReport.seasons, balanceRows);
  const calibrationVersions = requireCalibrationVersions(report.finalCareerState);
  const yearTenRatingStock = report.yearTenExceptionalRatingStock
    ?? report.closingExceptionalRatingStock;
  const yearTenRatingStockObservationCount =
    report.yearTenExceptionalRatingStock === undefined ? 0 : 1;
  const failedPlayerEconomyGates = report.playerEconomyAudit.gates.filter(
    ({ status }) => status === "fail" || status === "not_evaluated",
  );
  const permanentTransfers = report.finalCareerState.transferHistory.filter(
    (entry) => entry.kind === "permanent_transfer",
  );
  const freeAgentSignings = report.finalCareerState.transferHistory.filter(
    (entry) => entry.kind === "free_agent_signing",
  );
  const replenishmentFreeAgentPublicValues =
    report.contractFinanceStabilityReport.seasons.flatMap(
      (season) => season.freeAgentSigningPublicValues,
    );
  const freeAgentZeroFeeViolationCount = freeAgentSignings.filter(
    (entry) => entry.completedFee !== 0,
  ).length;
  const baseStatus = worstLongRunAnomalyStatus([
    report.anomalyReport.status,
    report.youthStabilityReport.status,
    report.contractFinanceStabilityReport.status,
  ]);

  return {
    seed: report.seed,
    compositionHash: hashPhase79CComposition(report.league),
    calibrationVersions,
    yearTenRatingStock,
    yearTenRatingStockObservationCount,
    playerEconomyGates: report.playerEconomyAudit.gates,
    permanentTransferPublicValues: permanentTransfers.map((entry) => entry.publicValue),
    permanentTransferAskingPrices: permanentTransfers.map(
      (entry) => entry.initialAskingPrice,
    ),
    permanentTransferCompletedFees: permanentTransfers.map(
      (entry) => entry.completedFee,
    ),
    freeAgentPublicValues: [
      ...freeAgentSignings.map((entry) => entry.publicValue),
      ...replenishmentFreeAgentPublicValues,
    ],
    freeAgentZeroFeeViolationCount,
    closingDivisionWageEconomy:
      report.contractFinanceStabilityReport.closingDivisionWageEconomy,
    closingDivisionMarketEconomy:
      report.contractFinanceStabilityReport.closingDivisionMarketEconomy,
    closingCrossTierTransfers:
      report.contractFinanceStabilityReport.closingCrossTierTransfers,
    status:
      (
        yearTenRatingStockObservationCount > 0
        && yearTenRatingStock.violationCount > 0
      )
        || freeAgentZeroFeeViolationCount > 0
        || failedPlayerEconomyGates.length > 0
        ? "fail"
        : baseStatus,
    goalsPerMatchAverage: roundReportNumber(average(balanceRows.map((season) => season.goalsPerMatch))),
    drawRateAverage: drawSnapshot.average,
    drawRateMax: drawSnapshot.max,
    highestDrawRateSeasonNumber: drawSnapshot.highestSeasonNumber,
    uniqueChampionCount: report.clubStabilityReport.uniqueChampionCount,
    longestChampionStreak: championStreakSnapshot.length,
    longestChampionStreakClubName: championStreakSnapshot.clubName,
    championStreakPointsMin: championStreakSnapshot.pointsMin,
    championStreakPointsMax: championStreakSnapshot.pointsMax,
    championStreakTableSpreadAverage: championStreakSnapshot.tableSpreadAverage,
    initialClubAbilitySpread: report.strengthHierarchy.initial.spread,
    finalClubAbilitySpread: report.strengthHierarchy.final.spread,
    firstPlacePointsAverage: tableSpreadSnapshot.firstPlacePointsAverage,
    lastPlacePointsAverage: tableSpreadSnapshot.lastPlacePointsAverage,
    tablePointsSpreadAverage: tableSpreadSnapshot.tablePointsSpreadAverage,
    tablePointsSpreadMin: tableSpreadSnapshot.tablePointsSpreadMin,
    tablePointsSpreadMax: tableSpreadSnapshot.tablePointsSpreadMax,
    lowestTableSpreadSeasonNumber: tableSpreadSnapshot.lowestTableSpreadSeasonNumber,
    firstPlacePointsMin: tableSpreadSnapshot.firstPlacePointsMin,
    firstPlacePointsMax: tableSpreadSnapshot.firstPlacePointsMax,
    lastPlacePointsMin: tableSpreadSnapshot.lastPlacePointsMin,
    lastPlacePointsMax: tableSpreadSnapshot.lastPlacePointsMax,
    topAssistMax: Math.max(...report.playerEvolutionReport.production.map((row) => row.topAssists), 0),
    topCreatorSeasonNumber: concentration?.seasonNumber ?? 0,
    topCreatorClubName: concentration?.topCreatorClubName ?? "unavailable",
    topCreatorName: concentration?.topCreatorName ?? "unavailable",
    topCreatorAssists: concentration?.topCreatorAssists ?? 0,
    topCreatorClubGoals: concentration?.topCreatorClubGoals ?? 0,
    topCreatorGoalShareMax: concentration?.topAssistClubGoalShare ?? 0,
    topThreeCreatorGoalShareMax: concentration?.topThreeAssistClubGoalShare ?? 0,
    topAssistName: concentration?.topAssistName ?? "unavailable",
    topScorerName: concentration?.topScorerName ?? "unavailable",
    topScorerGoals: concentration?.topScorerGoals ?? 0,
    age30PlusShare: finalAgeTotal === 0 ? 0 : roundReportNumber(report.playerEvolutionReport.finalAge30Plus / finalAgeTotal),
    transferTurnoverCount: report.clubStabilityReport.transferTurnoverCount,
    squadTurnoverCount:
      report.clubStabilityReport.playerExitCount +
      report.clubStabilityReport.squadMaintenanceAddedCount +
      report.clubStabilityReport.transferTurnoverCount,
    minimumSquadSizeObserved: report.clubStabilityReport.minimumSquadSizeObserved,
    clubsBelowMinimumSquadSizeCount: report.clubStabilityReport.clubsBelowMinimumSquadSizeCount,
    clubsWithoutNaturalGoalkeeperCount: report.clubStabilityReport.clubsWithoutNaturalGoalkeeperCount,
    roleCoverageWarningCount: report.clubStabilityReport.roleCoverageWarningCount,
    maximumYouthRosterSizeObserved: report.youthStabilityReport.maximumYouthRosterSizeObserved,
    minimumSeniorPlayerCountObserved: report.youthStabilityReport.minimumSeniorPlayerCountObserved,
    maximumSeniorPlayerCountObserved: report.youthStabilityReport.maximumSeniorPlayerCountObserved,
    minimumYouthPlayerCountObserved: report.youthStabilityReport.minimumYouthPlayerCountObserved,
    maximumYouthPlayerCountObserved: report.youthStabilityReport.maximumYouthPlayerCountObserved,
    minimumActivePlayerCountObserved: report.youthStabilityReport.minimumActivePlayerCountObserved,
    maximumActivePlayerCountObserved: report.youthStabilityReport.maximumActivePlayerCountObserved,
    clubsAboveYouthTargetCount: report.youthStabilityReport.clubsAboveYouthTargetCount,
    clubsBelowYouthMinimumCount: report.youthStabilityReport.clubsBelowYouthMinimumCount,
    contractFinanceStructuralViolationCount: report.contractFinanceStabilityReport.structuralViolationCount,
    minimumCashBalanceObserved: report.contractFinanceStabilityReport.minimumCashBalanceObserved,
    maximumWageBudgetUtilizationObserved: report.contractFinanceStabilityReport.maximumWageBudgetUtilizationObserved,
    maximumFreeAgentShareObserved: report.contractFinanceStabilityReport.maximumFreeAgentShareObserved,
    minimumPlayerValueObserved: report.contractFinanceStabilityReport.minimumPlayerValueObserved,
    maximumPlayerValueObserved: report.contractFinanceStabilityReport.maximumPlayerValueObserved,
    renewalCount: report.contractFinanceStabilityReport.renewalCount,
    releaseCount: report.contractFinanceStabilityReport.releaseCount,
    expiryCount: report.contractFinanceStabilityReport.expiryCount,
    selectedClubExpiredDecisionCount: report.contractFinanceStabilityReport.selectedClubExpiredDecisionCount,
    completedTransferCount: report.contractFinanceStabilityReport.completedTransferCount,
    permanentTransferFunnel: report.contractFinanceStabilityReport.permanentTransferFunnel,
    preliminaryAgreementFunnel: report.contractFinanceStabilityReport.preliminaryAgreementFunnel,
    maximumUsefulFreeAgentCountObserved:
      report.contractFinanceStabilityReport.maximumUsefulFreeAgentCountObserved,
    freeAgentBandObservations: report.contractFinanceStabilityReport.freeAgentBandObservations,
    wageBudgetUtilizations: report.contractFinanceStabilityReport.seasons.flatMap(
      (season) => season.wageBudgetUtilizations,
    ),
    annualWageHeadrooms: report.contractFinanceStabilityReport.seasons.flatMap(
      (season) => season.annualWageHeadrooms,
    ),
    wagePressureClubSeasonShare: report.contractFinanceStabilityReport.wagePressureClubSeasonShare,
    exactWageCeilingClubSeasonShare:
      report.contractFinanceStabilityReport.exactWageCeilingClubSeasonShare,
    aboveWageBudgetClubSeasonShare:
      report.contractFinanceStabilityReport.aboveWageBudgetClubSeasonShare,
    reallocationExactCeilingClubSeasonCount:
      report.contractFinanceStabilityReport.reallocationExactCeilingClubSeasonCount,
    failingCheckKeys: [
      ...report.anomalyReport.checks.filter((check) => check.status === "fail").map((check) => check.key),
      ...report.youthStabilityReport.checks.filter((check) => check.status === "fail").map((check) => check.key),
      ...report.contractFinanceStabilityReport.checks.filter((check) => check.status === "fail").map((check) => check.key),
      ...(yearTenRatingStockObservationCount > 0
          && yearTenRatingStock.violationCount > 0
        ? ["phase79c_year_ten_rating_inflation"]
        : []),
      ...(freeAgentZeroFeeViolationCount > 0
        ? ["phase79c_free_agent_non_zero_fee"]
        : []),
      ...failedPlayerEconomyGates.map(
        ({ key }) => `phase79d_${key}`,
      ),
    ],
    warningCheckKeys: [
      ...report.anomalyReport.checks.filter((check) => check.status === "warn").map((check) => check.key),
      ...report.youthStabilityReport.checks.filter((check) => check.status === "warn").map((check) => check.key),
      ...report.contractFinanceStabilityReport.checks.filter((check) => check.status === "warn").map((check) => check.key),
    ],
  };
}

/**
 * Hashes the complete initial composition facts needed to prove a same-seed
 * replay without executing a second long-run cohort.
 */
export function hashPhase79CComposition(world: FakeDomesticWorld): string {
  return createHash("sha256").update(JSON.stringify({
    versions: world.calibrationVersions,
    competitionIds: world.domesticCompetitionWorld.competitionIds,
    competitions: world.domesticCompetitionWorld.competitionIds.map((competitionId) => {
      const competition = world.domesticCompetitionWorld.competitions[competitionId];
      return {
        id: competitionId,
        clubIds: competition?.clubIds ?? [],
      };
    }),
    clubs: world.clubIds.map((clubId) => {
      const club = world.clubsById[clubId];
      return {
        id: clubId,
        name: club?.name,
        category: club?.category,
        reputation: club?.reputation,
        playerIds: club?.playerIds ?? [],
      };
    }),
    players: world.playerIds.map((playerId) => {
      const player = world.players[playerId];
      return {
        id: playerId,
        birthDate: player?.birthDate,
        naturalPositions: player?.naturalPositions,
        primaryRole: player?.primaryRole,
        abilities: player?.abilities,
        potential: player?.potential,
        identity: world.playerIdentities[playerId],
      };
    }),
    exceptionalAllocation: world.exceptionalAllocation,
  })).digest("hex").slice(0, 16);
}

/**
 * Reproduces the Phase 79D pre-change initial-world baseline over exactly one
 * hundred canonical three-division worlds.
 *
 * Only contracted senior players are included because this baseline explains
 * the public Market contradictions. Academy outcomes are covered separately by
 * the development matrix and later intake diagnostics.
 */
export function createPhase79DInitialWorldBaseline(): Phase79DInitialWorldBaseline {
  const worlds = Array.from(
    { length: PHASE_79D_BASELINE_WORLD_COUNT },
    (_, index) => {
      const seed = `${PHASE_79D_BASELINE_SEED_PREFIX}-world-${String(index + 1).padStart(5, "0")}`;
      return { seed, world: createFakeDomesticWorld({ worldSeed: seed }) };
    },
  );
  const firstWorld = worlds[0]?.world;
  if (firstWorld === undefined) {
    throw new Error("Phase 79D baseline requires at least one generated world");
  }
  const observations = worlds.flatMap(({ seed, world }) =>
    phase79DInitialWorldObservations(seed, world),
  );
  const valuationConfig = selectPlayerValuationConfig(firstWorld.calibrationVersions);

  return {
    seedPrefix: PHASE_79D_BASELINE_SEED_PREFIX,
    worldCount: PHASE_79D_BASELINE_WORLD_COUNT,
    populationInclusion: "initial contracted senior players only",
    moneyUnit: "integer minor units; 100 minor units = EUR 1",
    percentileMethod: "Hyndman-Fan type 7 linear interpolation, rounded to nearest integer",
    calibrationVersions: { ...firstWorld.calibrationVersions },
    compositionHashes: worlds.map(({ seed, world }) => ({
      seed,
      hash: hashPhase79CComposition(world),
    })),
    audit: createPlayerGenerationEconomyAudit({
      observations,
      hardCapMinorUnits: valuationConfig.valuationCurves.upperTail.hardCapMinorUnits,
      initialRarityConstraints: {
        ...valuationConfig.ratingScale.rarity.initialWorld,
      },
      suppliedNegotiationAggregates: [PHASE_79C_NEGOTIATION_BASELINE],
    }),
  };
}

/**
 * Runs the existing engine development and aging owners over the complete
 * Phase 79D age/role/room/participation matrix.
 *
 * The adapter constructs only deterministic input state. It intentionally owns
 * no growth, decline, realization, role weighting, or potential formula.
 */
export function createPhase79DPotentialOutcomeBaseline(): Phase79DPotentialOutcomeBaseline {
  const seedPrefix = "phase79d-potential-outcome";
  const sourceWorld = createFakeDomesticWorld({
    worldSeed: `${seedPrefix}-templates`,
  });
  const sourceCareer = careerStateFromNewWorld(
    "save:phase79d-potential-templates" as CliSaveId,
    sourceWorld,
    `${seedPrefix}-templates`,
  );
  const outfield = sourceWorld.playerIds
    .map((playerId) => sourceWorld.players[playerId])
    .find((player) => player?.naturalPositions[0] !== "gk");
  const goalkeeper = sourceWorld.playerIds
    .map((playerId) => sourceWorld.players[playerId])
    .find((player) => player?.naturalPositions[0] === "gk");
  if (outfield === undefined || goalkeeper === undefined) {
    throw new Error("Phase 79D development matrix requires outfield and goalkeeper templates");
  }

  const observations: PlayerPotentialOutcomeObservation[] = [];
  const roomValues = {
    small: 2,
    medium: 5,
    large: 10,
  } as const;
  const participationMinutes = {
    low: 60,
    typical: 300,
    high: 540,
  } as const;

  for (let startAge = 15; startAge <= 27; startAge += 1) {
    for (const [roleGroup, template] of [
      ["outfield", outfield],
      ["goalkeeper", goalkeeper],
    ] as const) {
      for (const [roomBand, room] of Object.entries(roomValues) as readonly [
        PlayerPotentialOutcomeObservation["roomBand"],
        number,
      ][]) {
        for (
          const [participationBand, minutesPerMonth]
          of Object.entries(participationMinutes) as readonly [
            PlayerPotentialOutcomeObservation["participationBand"],
            number,
          ][]
        ) {
          for (let stream = 1; stream <= 5; stream += 1) {
            observations.push(runPhase79DPotentialOutcome({
              sourceCareer,
              template,
              sourceId: [
                seedPrefix,
                startAge,
                roleGroup,
                roomBand,
                participationBand,
                stream,
              ].join(":"),
              startAge,
              roleGroup,
              roomBand,
              participationBand,
              room,
              minutesPerMonth,
              finalAge: 35,
            }));
          }
        }
      }
    }
  }

  const projectionPolicy = selectPlayerValuationConfig(
    sourceCareer.gameState.meta.calibrationVersions,
  ).potentialProjectionPolicy;
  const projectionAgeBands = (
    ["goalkeeper", "outfield"] as const
  ).flatMap((roleGroup) =>
    projectionPolicy.ageBandsByRoleFamily[roleGroup].map((ageBand) => ({
      roleGroup,
      minimumAge: ageBand.minimumAge,
      maximumAge: ageBand.maximumAge,
    }))
  );
  const audit = createPlayerPotentialOutcomeAudit({
    observations,
    coverage: {
      startAges: Array.from({ length: 13 }, (_, index) => index + 15),
      roleGroups: ["outfield", "goalkeeper"],
      roomBands: ["small", "medium", "large"],
      participationBands: ["low", "typical", "high"],
      observationsPerCell: 5,
    },
    projectionAgeBands,
  });

  return {
    seedPrefix,
    sampleStreamsPerCell: 5,
    startAgeMinimum: 15,
    startAgeMaximum: 27,
    finalAge: 35,
    participationMinutesPerMonth: participationMinutes,
    projectionPolicyCalibration: audit.projectionPolicyCalibration,
    audit,
  };
}

interface RunPhase79DPotentialOutcomeInput {
  readonly sourceCareer: CliCareerState;
  readonly template: CliPlayer;
  readonly sourceId: string;
  readonly startAge: number;
  readonly roleGroup: PlayerPotentialOutcomeObservation["roleGroup"];
  readonly roomBand: PlayerPotentialOutcomeObservation["roomBand"];
  readonly participationBand: PlayerPotentialOutcomeObservation["participationBand"];
  readonly room: number;
  readonly minutesPerMonth: number;
  readonly finalAge: number;
}

function runPhase79DPotentialOutcome(
  input: RunPhase79DPotentialOutcomeInput,
): PlayerPotentialOutcomeObservation {
  const templatePlayerState = input.sourceCareer.gameState.playerStates[input.template.id];
  const sourceClub = input.sourceCareer.gameState.clubs[input.sourceCareer.selectedClubId];
  if (templatePlayerState === undefined || sourceClub === undefined) {
    throw new Error("Phase 79D development template state is incomplete");
  }
  const startCurrentDate = input.sourceCareer.gameState.calendar.currentDate;
  const currentAbility = 7;
  const player: CliPlayer = {
    ...input.template,
    birthDate: (startCurrentDate - input.startAge * 365) as CliPlayer["birthDate"],
    abilities: constantAbilityShape(input.template.abilities, currentAbility),
    potential: constantAbilityShape(
      input.template.potential,
      Math.min(20, currentAbility + input.room),
    ),
  };
  const onePlayerClub = {
    ...sourceClub,
    playerIds: [player.id],
  };
  const {
    domesticCompetitionWorld: _domesticCompetitionWorld,
    ...baseGameState
  } = input.sourceCareer.gameState;
  let careerState: CliCareerState = {
    saveId: `save:${input.sourceId}` as CliSaveId,
    schemaVersion: input.sourceCareer.schemaVersion,
    selectedClubId: sourceClub.id,
    gameState: {
      ...baseGameState,
      calendar: {
        ...baseGameState.calendar,
        currentDate: startCurrentDate,
      },
      players: { [player.id]: player } as CliCareerState["gameState"]["players"],
      playerIds: [player.id],
      playerStates: {
        [player.id]: templatePlayerState,
      } as CliCareerState["gameState"]["playerStates"],
      clubs: {
        [sourceClub.id]: onePlayerClub,
      } as CliCareerState["gameState"]["clubs"],
      clubIds: [sourceClub.id],
      fixtures: {},
      fixtureIds: [],
    },
    transferHistory: [],
  };
  const starting = summarizePlayerDevelopmentAbilities(player);
  const valuationConfig = selectPlayerValuationConfig(
    requireCalibrationVersions(input.sourceCareer),
  );
  const startingProjection = derivePlayerPotentialProjection({
    player,
    currentDate: startCurrentDate,
    policy: valuationConfig.potentialProjectionPolicy,
    ratingScale: valuationConfig.ratingScale,
  });
  let peakRoleAbility = starting.currentAbility;

  for (let age = input.startAge; age <= input.finalAge; age += 1) {
    const seasonKey = `season:phase79d-${input.sourceId}-${age}`;
    const seasonId = seasonKey as CliCareerState["gameState"]["calendar"]["currentSeasonId"];
    const developedPlayer = careerState.gameState.players[player.id];
    if (developedPlayer === undefined || developedPlayer.primaryRole === undefined) {
      throw new Error("Phase 79D development player lost its stable role");
    }
    const playedRole = canonicalPlayedRoleForPosition(
      developedPlayer.naturalPositions[0],
    );
    const rows = Object.fromEntries(
      Array.from({ length: 12 }, (_, monthIndex) => {
        const monthKey = `${String(2026 + age - input.startAge)}-${String(monthIndex + 1).padStart(2, "0")}`;
        const rowKey = `${seasonKey}|${monthKey}|${String(player.id)}`;
        return [rowKey, {
          rowKey,
          playerId: player.id,
          seasonId,
          monthKey,
          starts: input.minutesPerMonth >= 270 ? 4 : 0,
          substituteAppearances: input.minutesPerMonth < 270 ? 2 : 0,
          minutes: input.minutesPerMonth,
          ratingTotal: 6.5,
          ratingSamples: 1,
          playedRoleMinutes: {
            [playedRole]: input.minutesPerMonth,
          },
          appliedFixtureIds: [
            `fixture:phase79d-${input.sourceId}-${age}-${monthIndex + 1}`,
          ],
        }];
      }),
    );
    careerState = {
      ...careerState,
      gameState: {
        ...careerState.gameState,
        calendar: {
          currentDate: (
            startCurrentDate + (age - input.startAge) * 365
          ) as CliCareerState["gameState"]["calendar"]["currentDate"],
          currentSeasonId: seasonId,
        },
      },
      playerParticipationLedger: {
        rows,
        rowKeys: Object.keys(rows),
        closedMonthKeys: [],
      } as unknown as NonNullable<CliCareerState["playerParticipationLedger"]>,
    };
    careerState = developPlayersForSeason({
      careerState,
      worldSeed: input.sourceId,
      seasonId,
      playerIds: [player.id],
    }).careerState as CliCareerState;
    const summary = summarizePlayerDevelopmentAbilities(
      careerState.gameState.players[player.id]!,
    );
    peakRoleAbility = Math.max(peakRoleAbility, summary.currentAbility);
  }

  const finalPlayer = careerState.gameState.players[player.id];
  if (finalPlayer === undefined) {
    throw new Error("Phase 79D development matrix lost its player");
  }
  const final = summarizePlayerDevelopmentAbilities(finalPlayer);
  return {
    sourceId: input.sourceId,
    startAge: input.startAge,
    roleGroup: input.roleGroup,
    roomBand: input.roomBand,
    participationBand: input.participationBand,
    startingRoleAbility: starting.currentAbility,
    ceilingRoleAbility: starting.potentialAbility,
    peakRoleAbility,
    finalRoleAbility: final.currentAbility,
    remainingRoom: final.potentialRoom,
    publicLowerRoleAbility: startingProjection.conservativeLowerAbility,
    publicExpectedRoleAbility: startingProjection.expectedAbility,
    publicUpperRoleAbility: startingProjection.upperAbility,
    publicLowerRating:
      startingProjection.conservativeLowerRating,
    publicExpectedRating:
      startingProjection.expectedRating,
    publicUpperRating:
      startingProjection.upperRating,
  };
}

function constantAbilityShape(
  source: CliPlayer["abilities"],
  value: number,
): CliPlayer["abilities"] {
  return Object.fromEntries(
    Object.entries(source).map(([group, abilities]) => [
      group,
      Object.fromEntries(
        Object.keys(abilities).map((ability) => [ability, value]),
      ),
    ]),
  ) as unknown as CliPlayer["abilities"];
}

function canonicalPlayedRoleForPosition(
  position: CliPlayer["naturalPositions"][number] | undefined,
): string {
  switch (position) {
    case "gk": return "goalkeeper";
    case "rb": return "right_full_back";
    case "cb": return "center_back";
    case "lb": return "left_full_back";
    case "dm": return "defensive_midfielder";
    case "cm": return "central_midfielder";
    case "am": return "attacking_midfielder";
    case "rw": return "right_winger";
    case "lw": return "left_winger";
    case "st": return "striker";
    case "rwb": return "right_full_back";
    case "lwb": return "left_full_back";
    default: return "central_midfielder";
  }
}

function phase79DInitialWorldObservations(
  seed: string,
  world: FakeDomesticWorld,
): readonly PlayerGenerationEconomyObservation[] {
  const careerState = careerStateFromNewWorld(
    `save:phase79d-baseline:${seed}` as CliSaveId,
    world,
    seed,
  );
  const valuationConfig = selectPlayerValuationConfig(world.calibrationVersions);
  const askingPriceConfig = selectAskingPriceCurves(world.calibrationVersions);
  const projectionByPlayerId = new Map(
    world.playerIds.map((playerId) => {
      const player = world.players[playerId];
      if (player === undefined) {
        throw new Error(`Phase 79D baseline player is missing: ${playerId}`);
      }
      const projection = derivePlayerPotentialProjection({
        player,
        currentDate: world.seasonStartDate,
        policy: valuationConfig.potentialProjectionPolicy,
        ratingScale: valuationConfig.ratingScale,
      });
      return [projection.playerId, projection] as const;
    }),
  );
  const clubByPlayerId = new Map<Phase79CPlayerId, Phase79CClubId>();
  for (const clubId of world.clubIds) {
    for (const playerId of world.clubsById[clubId]?.playerIds ?? []) {
      clubByPlayerId.set(playerId, clubId);
    }
  }
  const allocatedCurrentSix = new Set(
    world.exceptionalAllocation.currentSixPlayerKeys,
  );
  const allocatedPotentialSix = new Set(
    world.exceptionalAllocation.potentialSixPlayerKeys,
  );

  return world.playerIds.map((playerId) => {
    const player = world.players[playerId];
    const clubId = clubByPlayerId.get(playerId);
    const club = clubId === undefined ? undefined : world.clubsById[clubId];
    const projection = projectionByPlayerId.get(playerId);
    if (player === undefined || clubId === undefined || club === undefined || projection === undefined) {
      throw new Error(`Phase 79D baseline ownership is incomplete: ${playerId}`);
    }
    const valuation = derivePlayerValuation({
      player,
      currentDate: world.seasonStartDate,
      config: valuationConfig,
      marketContext: {
        kind: "contracted",
        division: club.category,
      },
    });
    const commercial = deriveTransferCommercialSnapshot({
      careerState,
      sellingClubId: clubId,
      playerId,
      asOf: world.seasonStartDate,
      valuationConfig,
      askingPriceConfig,
    });
    const rarityAssignment = world.playerRarityAssignments[playerId];
    return {
      observationId: `${seed}|0|${String(playerId)}`,
      worldId: seed,
      playerId: String(playerId),
      playerName: `${player.firstName} ${player.lastName}`,
      age: playerAgeYears(careerState, player),
      seasonIndex: 0,
      division: club.category,
      population: "senior",
      roleGroup: player.naturalPositions[0] === "gk"
        ? "goalkeeper"
        : "outfield",
      currentRating: projection.currentRating,
      storedPotentialCeilingRating: projection.storedCeilingRating,
      publicPotentialLowerRating:
        projection.conservativeLowerRating,
      publicPotentialExpectedRating:
        projection.expectedRating,
      publicPotentialUpperRating:
        projection.upperRating,
      publicValueMinorUnits: Number(valuation.value),
      ...(commercial === undefined
        ? {}
        : { askingPriceMinorUnits: Number(commercial.initialAskingPrice) }),
      allocation: {
        currentSixAllocated: allocatedCurrentSix.has(String(playerId)),
        potentialSixAllocated: allocatedPotentialSix.has(String(playerId)),
        ...(rarityAssignment === undefined
          ? {}
          : { rarityKind: rarityAssignment.rarityKind }),
      },
      archetype: world.playerArchetypes[playerId] ?? "unknown",
      hardCapEligible: valuation.components.hardCapEligible,
    };
  });
}

/**
 * Projects one active career checkpoint into the same public range/value facts
 * used by the initial-world audit.
 */
function phase79DActiveCareerObservations(input: {
  readonly seed: string;
  readonly seasonIndex: number;
  readonly careerState: CliCareerState;
  readonly valuationConfig: Phase79DValuationConfig;
}): readonly PlayerGenerationEconomyObservation[] {
  const seniorClubByPlayer = new Map<Phase79CPlayerId, Phase79CClubId>();
  for (const clubId of input.careerState.gameState.clubIds) {
    for (
      const playerId of input.careerState.gameState.clubs[clubId]?.playerIds
        ?? []
    ) {
      seniorClubByPlayer.set(playerId, clubId);
    }
  }
  const academyClubByPlayer = new Map<Phase79CPlayerId, Phase79CClubId>();
  for (const clubId of input.careerState.youthAcademyState?.clubRosterIds ?? []) {
    for (
      const playerId
      of input.careerState.youthAcademyState?.clubRosters[clubId]?.playerIds
        ?? []
    ) {
      academyClubByPlayer.set(playerId, clubId);
    }
  }
  const freeAgentIds = new Set(selectFreeAgentPlayerIds(input.careerState));
  const activeIds = input.careerState.gameState.playerIds.filter((playerId) =>
    seniorClubByPlayer.has(playerId)
    || academyClubByPlayer.has(playerId)
    || freeAgentIds.has(playerId)
  );
  const projectionByPlayerId = new Map(
    activeIds.map((playerId) => {
      const player = input.careerState.gameState.players[playerId];
      if (player === undefined) {
        throw new Error(`Phase 79D active player is missing: ${playerId}`);
      }
      const projection = derivePlayerPotentialProjection({
        player,
        currentDate: input.careerState.gameState.calendar.currentDate,
        policy: input.valuationConfig.potentialProjectionPolicy,
        ratingScale: input.valuationConfig.ratingScale,
      });
      return [projection.playerId, projection] as const;
    }),
  );

  return activeIds.map((playerId) => {
    const player = input.careerState.gameState.players[playerId];
    const projection = projectionByPlayerId.get(playerId);
    const clubId = seniorClubByPlayer.get(playerId)
      ?? academyClubByPlayer.get(playerId);
    const club = clubId === undefined
      ? undefined
      : input.careerState.gameState.clubs[clubId];
    if (player === undefined || projection === undefined) {
      throw new Error(`Phase 79D active observation is incomplete: ${playerId}`);
    }
    const division = club?.category ?? "free_agent";
    const valuation = derivePlayerValuation({
      player,
      currentDate: input.careerState.gameState.calendar.currentDate,
      config: input.valuationConfig,
      marketContext: division === "free_agent"
        ? { kind: "free_agent" }
        : { kind: "contracted", division },
    });
    const commercial = clubId === undefined || !seniorClubByPlayer.has(playerId)
      ? undefined
      : deriveTransferCommercialSnapshot({
          careerState: input.careerState,
          sellingClubId: clubId,
          playerId,
          asOf: input.careerState.gameState.calendar.currentDate,
          valuationConfig: input.valuationConfig,
          askingPriceConfig: selectAskingPriceCurves(
            requireCalibrationVersions(input.careerState),
          ),
        });
    return {
      observationId:
        `${input.seed}|${input.seasonIndex}|${String(playerId)}`,
      worldId: input.seed,
      playerId: String(playerId),
      playerName: `${player.firstName} ${player.lastName}`,
      age: playerAgeYears(input.careerState, player),
      seasonIndex: input.seasonIndex,
      division,
      population: seniorClubByPlayer.has(playerId)
        ? "senior"
        : academyClubByPlayer.has(playerId) ? "academy" : "free_agent",
      roleGroup: player.naturalPositions[0] === "gk"
        ? "goalkeeper"
        : "outfield",
      currentRating: projection.currentRating,
      storedPotentialCeilingRating: projection.storedCeilingRating,
      publicPotentialLowerRating:
        projection.conservativeLowerRating,
      publicPotentialExpectedRating:
        projection.expectedRating,
      publicPotentialUpperRating:
        projection.upperRating,
      publicValueMinorUnits: Number(valuation.value),
      ...(commercial === undefined
        ? {}
        : { askingPriceMinorUnits: Number(commercial.initialAskingPrice) }),
      archetype: player.archetype ?? "unknown",
      hardCapEligible: valuation.components.hardCapEligible,
    };
  });
}

/**
 * Retains every durable transfer stage separately so completion cannot stand
 * in for seller/counter-path coverage.
 */
function phase79DNegotiationObservations(input: {
  readonly seed: string;
  readonly seasonStartDate: number;
  readonly careerState: CliCareerState;
}): readonly PlayerGenerationNegotiationObservation[] {
  const state = input.careerState.transferNegotiationState;
  if (state === undefined) return [];
  return state.negotiationIds.map((negotiationId) => {
    const negotiation = state.negotiations[negotiationId];
    if (negotiation === undefined) {
      throw new Error(`Phase 79D negotiation is missing: ${negotiationId}`);
    }
    const player = input.careerState.gameState.players[negotiation.playerId];
    const sellingClub =
      input.careerState.gameState.clubs[negotiation.sellingClubId];
    if (player === undefined || sellingClub === undefined) {
      throw new Error(`Phase 79D negotiation parties are incomplete: ${negotiationId}`);
    }
    const eventDate = transferNegotiationEventDate(
      negotiation,
      input.careerState.gameState.calendar.currentDate,
    );
    return {
      negotiationId: `${input.seed}|${String(negotiationId)}`,
      playerId: String(player.id),
      playerName: `${player.firstName} ${player.lastName}`,
      age: Math.max(0, Math.floor((eventDate - player.birthDate) / 365)),
      seasonIndex: Math.max(
        0,
        Math.floor((eventDate - input.seasonStartDate) / 365),
      ),
      division: sellingClub.category,
      askingPriceMinorUnits: Number(negotiation.initialAskingPrice),
      offeredFeeMinorUnits: Number(negotiation.offeredFee),
      ...(negotiation.counterFee === undefined
        ? {}
        : { counterFeeMinorUnits: Number(negotiation.counterFee) }),
      ...("agreedFee" in negotiation
        ? { agreedFeeMinorUnits: Number(negotiation.agreedFee) }
        : {}),
      ...(negotiation.status === "completed"
        ? { completedFeeMinorUnits: Number(negotiation.completedFee) }
        : {}),
      sellerOutcome: sellerOutcomeForNegotiation(negotiation),
      counterOutcome: counterOutcomeForNegotiation(negotiation),
    };
  });
}

function sellerOutcomeForNegotiation(
  negotiation: Phase79DTransferNegotiation,
): PlayerGenerationNegotiationObservation["sellerOutcome"] {
  if (negotiation.status === "submitted") return "open";
  if (negotiation.status === "rejected") return "rejected";
  if (negotiation.status === "expired") return "expired";
  if (negotiation.status === "withdrawn") return "withdrawn";
  if (negotiation.counterFee !== undefined) return "countered";
  return "accepted";
}

function counterOutcomeForNegotiation(
  negotiation: Phase79DTransferNegotiation,
): PlayerGenerationNegotiationObservation["counterOutcome"] {
  if (negotiation.counterFee === undefined) return "not_observed";
  if (negotiation.status === "countered") return "open";
  if (negotiation.status === "expired") return "expired";
  if (negotiation.status === "withdrawn") return "rejected";
  return "accepted";
}

function transferNegotiationEventDate(
  negotiation: Phase79DTransferNegotiation,
  fallback: number,
): number {
  if ("completedOn" in negotiation) return negotiation.completedOn;
  if ("failedOn" in negotiation) return negotiation.failedOn;
  if ("rejectedOn" in negotiation) return negotiation.rejectedOn;
  if ("expiredOn" in negotiation) return negotiation.expiredOn;
  if ("withdrawnOn" in negotiation) return negotiation.withdrawnOn;
  if ("cancelledOn" in negotiation) return negotiation.cancelledOn;
  if ("acceptedOn" in negotiation) return negotiation.acceptedOn;
  if ("submittedOn" in negotiation) return negotiation.submittedOn;
  return fallback;
}

/** Requires the immutable version bundle before a gate can interpret rarity caps. */
function requireCalibrationVersions(
  careerState: CliCareerState,
): Phase79CCalibrationVersions {
  const versions = careerState.gameState.meta.calibrationVersions;
  if (versions === undefined) {
    throw new Error("Phase 79C long-run career is missing calibration versions");
  }
  return versions;
}

/**
 * Summarizes active year-ten `5.5`/`6` stock and validates only the already
 * versioned rarity caps. It does not invent or relax a closeout threshold.
 */
export function summarizePhase79CYearTenRatingStock(
  careerState: CliCareerState,
  valuationConfig: Phase79DValuationConfig,
): Phase79CYearTenRatingStock {
  const seniorClubByPlayer = new Map<Phase79CPlayerId, Phase79CClubId>();
  for (const clubId of careerState.gameState.clubIds) {
    for (const playerId of careerState.gameState.clubs[clubId]?.playerIds ?? []) {
      seniorClubByPlayer.set(playerId, clubId);
    }
  }
  const academyClubByPlayer = new Map<Phase79CPlayerId, Phase79CClubId>();
  for (const clubId of careerState.youthAcademyState?.clubRosterIds ?? []) {
    for (const playerId of careerState.youthAcademyState?.clubRosters[clubId]?.playerIds ?? []) {
      academyClubByPlayer.set(playerId, clubId);
    }
  }
  const freeAgentIds = new Set(selectFreeAgentPlayerIds(careerState));
  const activePlayerIds = careerState.gameState.playerIds.filter(
    (playerId) =>
      seniorClubByPlayer.has(playerId)
      || academyClubByPlayer.has(playerId)
      || freeAgentIds.has(playerId),
  );
  const projections = activePlayerIds.map((playerId) => {
      const player = careerState.gameState.players[playerId];
      if (player === undefined) {
        throw new Error(`Active Phase 79C rating player is missing: ${playerId}`);
      }
      return derivePlayerPotentialProjection({
        player,
        currentDate: careerState.gameState.calendar.currentDate,
        policy: valuationConfig.potentialProjectionPolicy,
        ratingScale: valuationConfig.ratingScale,
      });
  });
  let currentFiveAndHalfCount = 0;
  let currentSixCount = 0;
  let potentialSixCount = 0;
  let lowerDivisionPotentialSixCount = 0;
  const locations: string[] = [];

  for (const projection of projections) {
    const currentRating = projection.currentRating;
    const storedCeilingRating = projection.storedCeilingRating;
    if (currentRating === 5.5) currentFiveAndHalfCount += 1;
    if (currentRating === 6) currentSixCount += 1;
    if (storedCeilingRating === 6) potentialSixCount += 1;
    const clubId = seniorClubByPlayer.get(projection.playerId)
      ?? academyClubByPlayer.get(projection.playerId);
    const division = clubId === undefined
      ? undefined
      : careerState.gameState.clubs[clubId]?.category;
    if (
      storedCeilingRating === 6
      && (division === "second_division" || division === "third_division")
    ) {
      lowerDivisionPotentialSixCount += 1;
    }
    if (currentRating >= 5.5 || storedCeilingRating === 6) {
      const slot = seniorClubByPlayer.has(projection.playerId)
        ? "senior"
        : academyClubByPlayer.has(projection.playerId)
          ? "academy"
          : "free_agent";
      locations.push(
        `${projection.playerId}|current=${currentRating}`
        + `|storedCeiling=${storedCeilingRating}`
        + `|division=${division ?? "free_agent"}|club=${clubId ?? "none"}|slot=${slot}`,
      );
    }
  }

  const caps = valuationConfig.ratingScale.rarity.yearTen;
  const violationCount = [
    currentSixCount > caps.activeCurrentSixMaximum,
    potentialSixCount > caps.activePotentialSixMaximum,
    lowerDivisionPotentialSixCount > caps.lowerDivisionPotentialSixMaximum,
  ].filter(Boolean).length;
  return {
    currentFiveAndHalfCount,
    currentSixCount,
    potentialSixCount,
    lowerDivisionPotentialSixCount,
    violationCount,
    locations: locations.sort(),
  };
}

/** Compact table-spread snapshot for one world in a long-run gate. */
interface TableSpreadSnapshot {
  /** Average first-place points. */
  readonly firstPlacePointsAverage: number;
  /** Average last-place points. */
  readonly lastPlacePointsAverage: number;
  /** Average first-minus-last spread. */
  readonly tablePointsSpreadAverage: number;
  /** Lowest season spread. */
  readonly tablePointsSpreadMin: number;
  /** Highest season spread. */
  readonly tablePointsSpreadMax: number;
  /** Season number where the lowest spread happened. */
  readonly lowestTableSpreadSeasonNumber: number;
  /** Lowest champion points. */
  readonly firstPlacePointsMin: number;
  /** Highest champion points. */
  readonly firstPlacePointsMax: number;
  /** Lowest last-place points. */
  readonly lastPlacePointsMin: number;
  /** Highest last-place points. */
  readonly lastPlacePointsMax: number;
}

/** Compact draw-rate snapshot for one world in a long-run gate. */
interface DrawRateSnapshot {
  /** Average draw rate across the world run. */
  readonly average: number;
  /** Highest single-season draw rate. */
  readonly max: number;
  /** Season number where the highest draw rate happened. */
  readonly highestSeasonNumber: number;
}

/** Compact snapshot of the longest champion run in one world. */
interface ChampionStreakSnapshot {
  /** Consecutive titles in the streak. */
  readonly length: number;
  /** Club name that won the streak. */
  readonly clubName: string;
  /** Lowest champion points total inside the streak. */
  readonly pointsMin: number;
  /** Highest champion points total inside the streak. */
  readonly pointsMax: number;
  /** Average table spread across the streak seasons. */
  readonly tableSpreadAverage: number;
}

/** One side of a club current-ability hierarchy snapshot. */
export interface ClubAbilityHierarchyEdge {
  /** Club name at the edge of the hierarchy. */
  readonly clubName: string;
  /** Average senior current ability for the club. */
  readonly averageCurrentAbility: number;
}

/** One current-ability hierarchy snapshot for all senior club squads. */
export interface ClubAbilityHierarchySnapshot {
  /** Strongest average senior squad. */
  readonly top: ClubAbilityHierarchyEdge;
  /** Weakest average senior squad. */
  readonly bottom: ClubAbilityHierarchyEdge;
  /** Top average minus bottom average. */
  readonly spread: number;
}

/** Initial/final current-ability hierarchy snapshot for one long run. */
export interface ClubAbilityHierarchySummary {
  /** Hierarchy before long-run seasons are simulated. */
  readonly initial: ClubAbilityHierarchySnapshot;
  /** Hierarchy after long-run refresh/development. */
  readonly final: ClubAbilityHierarchySnapshot;
}

/**
 * Summarizes table compression without changing anomaly thresholds.
 */
function summarizeTableSpread(rows: readonly LongRunBalanceSeasonRow[]): TableSpreadSnapshot {
  let lowestSpreadRowIndex = 0;

  for (let index = 1; index < rows.length; index += 1) {
    const row = rows[index];
    const currentLowest = rows[lowestSpreadRowIndex];

    if (row !== undefined && currentLowest !== undefined && row.tablePointsSpread < currentLowest.tablePointsSpread) {
      lowestSpreadRowIndex = index;
    }
  }

  return {
    firstPlacePointsAverage: roundReportNumber(average(rows.map((row) => row.firstPlacePoints))),
    lastPlacePointsAverage: roundReportNumber(average(rows.map((row) => row.lastPlacePoints))),
    tablePointsSpreadAverage: roundReportNumber(average(rows.map((row) => row.tablePointsSpread))),
    tablePointsSpreadMin: Math.min(...rows.map((row) => row.tablePointsSpread)),
    tablePointsSpreadMax: Math.max(...rows.map((row) => row.tablePointsSpread)),
    lowestTableSpreadSeasonNumber: lowestSpreadRowIndex + 1,
    firstPlacePointsMin: Math.min(...rows.map((row) => row.firstPlacePoints)),
    firstPlacePointsMax: Math.max(...rows.map((row) => row.firstPlacePoints)),
    lastPlacePointsMin: Math.min(...rows.map((row) => row.lastPlacePoints)),
    lastPlacePointsMax: Math.max(...rows.map((row) => row.lastPlacePoints)),
  };
}

/**
 * Summarizes draw concentration because high draw rates can compress a table
 * even when goals and squad structure look healthy.
 */
function summarizeDrawRates(seasons: readonly LongRunSeasonResult[]): DrawRateSnapshot {
  let highestSeasonIndex = 0;
  const rates = seasons.map((season) => drawRate(season));

  for (let index = 1; index < rates.length; index += 1) {
    if ((rates[index] ?? 0) > (rates[highestSeasonIndex] ?? 0)) {
      highestSeasonIndex = index;
    }
  }

  return {
    average: roundReportNumber(average(rates)),
    max: roundReportNumber(rates[highestSeasonIndex] ?? 0),
    highestSeasonNumber: highestSeasonIndex + 1,
  };
}

/**
 * Summarizes the longest title streak with table context so dynasties can be
 * judged as football stories before changing thresholds.
 */
function summarizeChampionStreak(
  clubRows: readonly LongRunClubSeasonRow[],
  balanceRows: readonly LongRunBalanceSeasonRow[],
): ChampionStreakSnapshot {
  let bestStartIndex = 0;
  let bestLength = 0;
  let currentStartIndex = 0;
  let currentLength = 0;
  let previousChampionId = "";

  for (let index = 0; index < clubRows.length; index += 1) {
    const row = clubRows[index];
    if (row === undefined) {
      continue;
    }

    if (row.championClubId === previousChampionId) {
      currentLength += 1;
    } else {
      currentStartIndex = index;
      currentLength = 1;
      previousChampionId = row.championClubId;
    }

    if (currentLength > bestLength) {
      bestStartIndex = currentStartIndex;
      bestLength = currentLength;
    }
  }

  const streakRows = clubRows.slice(bestStartIndex, bestStartIndex + bestLength);
  const spreadRows = balanceRows.slice(bestStartIndex, bestStartIndex + bestLength);
  const firstRow = streakRows[0];

  return {
    length: bestLength,
    clubName: firstRow?.championClubName ?? "unavailable",
    pointsMin: Math.min(...streakRows.map((row) => row.championPoints)),
    pointsMax: Math.max(...streakRows.map((row) => row.championPoints)),
    tableSpreadAverage: roundReportNumber(average(spreadRows.map((row) => row.tablePointsSpread))),
  };
}

/**
 * Summarizes whether senior squad current ability stays separated by club.
 *
 * This is diagnostic only: it reads existing players and does not alter
 * development, transfers, lineups, or match simulation.
 */
function summarizeClubAbilityHierarchy(
  league: FakeDomesticWorld,
  initialCareerState: CliCareerState,
  finalCareerState: CliCareerState,
): ClubAbilityHierarchySummary {
  return {
    initial: summarizeClubAbilityHierarchySnapshot(league, initialCareerState),
    final: summarizeClubAbilityHierarchySnapshot(league, finalCareerState),
  };
}

/**
 * Computes the top-to-bottom average current-ability spread for senior squads.
 */
function summarizeClubAbilityHierarchySnapshot(
  league: FakeDomesticWorld,
  careerState: CliCareerState,
): ClubAbilityHierarchySnapshot {
  const rows = careerState.gameState.clubIds.map((clubId) => {
    const club = careerState.gameState.clubs[clubId];
    const playerIds = club?.playerIds ?? [];
    const averageCurrentAbility = roundReportNumber(
      average(
        playerIds.flatMap((playerId): readonly number[] => {
          const player = careerState.gameState.players[playerId];
          return player === undefined ? [] : [reportCurrentAbility(player)];
        }),
      ),
    );

    return {
      clubId: String(clubId),
      clubName: clubLabel(league, clubId),
      averageCurrentAbility,
    };
  });

  const ordered = rows.sort(
    (left, right) => right.averageCurrentAbility - left.averageCurrentAbility || left.clubId.localeCompare(right.clubId),
  );
  const top = ordered[0];
  const bottom = ordered[ordered.length - 1];

  if (top === undefined || bottom === undefined) {
    throw new Error("Cannot summarize club ability hierarchy without clubs");
  }

  return {
    top: {
      clubName: top.clubName,
      averageCurrentAbility: top.averageCurrentAbility,
    },
    bottom: {
      clubName: bottom.clubName,
      averageCurrentAbility: bottom.averageCurrentAbility,
    },
    spread: roundReportNumber(top.averageCurrentAbility - bottom.averageCurrentAbility),
  };
}

/**
 * Finds the production row that drives the maximum single-creator share.
 */
function topCreatorConcentrationProductionRow(
  rows: readonly LongRunPlayerProductionRow[],
): LongRunPlayerProductionRow | undefined {
  let best: LongRunPlayerProductionRow | undefined;

  for (const row of rows) {
    if (
      best === undefined ||
      row.topAssistClubGoalShare > best.topAssistClubGoalShare ||
      (row.topAssistClubGoalShare === best.topAssistClubGoalShare && row.topCreatorAssists > best.topCreatorAssists) ||
      (row.topAssistClubGoalShare === best.topAssistClubGoalShare &&
        row.topCreatorAssists === best.topCreatorAssists &&
        row.seasonNumber < best.seasonNumber)
    ) {
      best = row;
    }
  }

  return best;
}

/**
 * Aggregates per-world summaries into the final gate report.
 *
 * Checkpoint adapters call this boundary after validating and ordering their
 * compact shard results. Gameplay simulation remains owned by the canonical
 * single-world runner above.
 */
export function createLongRunGateReportFromWorlds(
  input: CreateLongRunGateReportFromWorldsInput,
): LongRunGateReport {
  if (input.worlds.length !== input.worldCount) {
    throw new Error(
      `Long-run gate expected ${input.worldCount} world summaries but received ${input.worlds.length}`,
    );
  }

  const worlds = [...input.worlds].sort((left, right) => left.seed.localeCompare(right.seed));
  const wageBudgetUtilizations = worlds.flatMap((world) => world.wageBudgetUtilizations);
  const annualWageHeadrooms = worlds.flatMap((world) => world.annualWageHeadrooms);

  return {
    seedPrefix: input.seedPrefix,
    worldCount: input.worldCount,
    seasonCount: input.seasonCount,
    execution: input.execution,
    totalSeasonCount: input.worldCount * input.seasonCount,
    ratingInflationViolationWorldCount: worlds.filter(
      (world) =>
        world.yearTenRatingStockObservationCount > 0
        && world.yearTenRatingStock.violationCount > 0,
    ).length,
    yearTenRatingStockObservationCount: worlds.reduce(
      (sum, world) => sum + world.yearTenRatingStockObservationCount,
      0,
    ),
    playerEconomyGates: aggregatePlayerEconomyGates(worlds),
    yearTenCurrentSixMaximumObserved: Math.max(
      ...worlds.map((world) => world.yearTenRatingStock.currentSixCount),
    ),
    yearTenPotentialSixMaximumObserved: Math.max(
      ...worlds.map((world) => world.yearTenRatingStock.potentialSixCount),
    ),
    yearTenLowerDivisionPotentialSixMaximumObserved: Math.max(
      ...worlds.map(
        (world) => world.yearTenRatingStock.lowerDivisionPotentialSixCount,
      ),
    ),
    calibrationVersionBundles: uniqueCalibrationVersionBundles(
      worlds.map((world) => world.calibrationVersions),
    ),
    compositionHashes: worlds.map((world) => ({
      seed: world.seed,
      hash: world.compositionHash,
    })),
    failedWorldCount: worlds.filter((world) => world.status === "fail").length,
    warningWorldCount: worlds.filter((world) => world.status === "warn").length,
    minimumSquadSizeObserved: Math.min(...worlds.map((world) => world.minimumSquadSizeObserved)),
    clubsBelowMinimumSquadSizeCount: worlds.reduce((sum, world) => sum + world.clubsBelowMinimumSquadSizeCount, 0),
    clubsWithoutNaturalGoalkeeperCount: worlds.reduce((sum, world) => sum + world.clubsWithoutNaturalGoalkeeperCount, 0),
    roleCoverageWarningCount: worlds.reduce((sum, world) => sum + world.roleCoverageWarningCount, 0),
    maximumYouthRosterSizeObserved: Math.max(...worlds.map((world) => world.maximumYouthRosterSizeObserved)),
    minimumSeniorPlayerCountObserved: Math.min(...worlds.map((world) => world.minimumSeniorPlayerCountObserved)),
    maximumSeniorPlayerCountObserved: Math.max(...worlds.map((world) => world.maximumSeniorPlayerCountObserved)),
    minimumYouthPlayerCountObserved: Math.min(...worlds.map((world) => world.minimumYouthPlayerCountObserved)),
    maximumYouthPlayerCountObserved: Math.max(...worlds.map((world) => world.maximumYouthPlayerCountObserved)),
    minimumActivePlayerCountObserved: Math.min(...worlds.map((world) => world.minimumActivePlayerCountObserved)),
    maximumActivePlayerCountObserved: Math.max(...worlds.map((world) => world.maximumActivePlayerCountObserved)),
    clubsAboveYouthTargetCount: worlds.reduce((sum, world) => sum + world.clubsAboveYouthTargetCount, 0),
    clubsBelowYouthMinimumCount: worlds.reduce((sum, world) => sum + world.clubsBelowYouthMinimumCount, 0),
    contractFinanceStructuralViolationCount: worlds.reduce(
      (sum, world) => sum + world.contractFinanceStructuralViolationCount,
      0,
    ),
    minimumCashBalanceObserved: Math.min(...worlds.map((world) => world.minimumCashBalanceObserved)),
    maximumWageBudgetUtilizationObserved: Math.max(
      ...worlds.map((world) => world.maximumWageBudgetUtilizationObserved),
    ),
    maximumFreeAgentShareObserved: Math.max(...worlds.map((world) => world.maximumFreeAgentShareObserved)),
    minimumPlayerValueObserved: Math.min(...worlds.map((world) => world.minimumPlayerValueObserved)),
    maximumPlayerValueObserved: Math.max(...worlds.map((world) => world.maximumPlayerValueObserved)),
    renewalCount: worlds.reduce((sum, world) => sum + world.renewalCount, 0),
    releaseCount: worlds.reduce((sum, world) => sum + world.releaseCount, 0),
    expiryCount: worlds.reduce((sum, world) => sum + world.expiryCount, 0),
    selectedClubExpiredDecisionCount: worlds.reduce(
      (sum, world) => sum + world.selectedClubExpiredDecisionCount,
      0,
    ),
    completedTransferCount: worlds.reduce((sum, world) => sum + world.completedTransferCount, 0),
    permanentTransferPublicValueDistribution: moneyDistribution(
      worlds.flatMap((world) => world.permanentTransferPublicValues),
    ),
    permanentTransferAskingPriceDistribution: moneyDistribution(
      worlds.flatMap((world) => world.permanentTransferAskingPrices),
    ),
    permanentTransferCompletedFeeDistribution: moneyDistribution(
      worlds.flatMap((world) => world.permanentTransferCompletedFees),
    ),
    freeAgentPublicValueDistribution: moneyDistribution(
      worlds.flatMap((world) => world.freeAgentPublicValues),
    ),
    freeAgentZeroFeeViolationCount: worlds.reduce(
      (sum, world) => sum + world.freeAgentZeroFeeViolationCount,
      0,
    ),
    permanentTransferFunnel: aggregatePermanentTransferFunnels(
      worlds.map((world) => world.permanentTransferFunnel),
    ),
    preliminaryAgreementFunnel: aggregatePreliminaryAgreementFunnels(
      worlds.map((world) => world.preliminaryAgreementFunnel),
    ),
    maximumUsefulFreeAgentCountObserved: Math.max(
      ...worlds.map((world) => world.maximumUsefulFreeAgentCountObserved),
    ),
    freeAgentBandObservations: aggregateFreeAgentBands(
      worlds.map((world) => world.freeAgentBandObservations),
    ),
    wageBudgetUtilizationP50: percentile(wageBudgetUtilizations, 0.5),
    wageBudgetUtilizationP90: percentile(wageBudgetUtilizations, 0.9),
    wageBudgetUtilizationP95: percentile(wageBudgetUtilizations, 0.95),
    wageBudgetUtilizationP99: percentile(wageBudgetUtilizations, 0.99),
    wagePressureClubSeasonShare: roundReportNumber(
      safeReportRatio(
        wageBudgetUtilizations.filter((value) => value >= 0.95).length,
        wageBudgetUtilizations.length,
      ),
    ),
    exactWageCeilingClubSeasonShare: roundReportNumber(
      safeReportRatio(
        wageBudgetUtilizations.filter((value) => value === 1).length,
        wageBudgetUtilizations.length,
      ),
    ),
    aboveWageBudgetClubSeasonShare: roundReportNumber(
      safeReportRatio(
        wageBudgetUtilizations.filter((value) => value > 1).length,
        wageBudgetUtilizations.length,
      ),
    ),
    annualWageHeadroomP50: percentile(annualWageHeadrooms, 0.5),
    annualWageHeadroomP10: percentile(annualWageHeadrooms, 0.1),
    reallocationExactCeilingClubSeasonCount: worlds.reduce(
      (sum, world) => sum + world.reallocationExactCeilingClubSeasonCount,
      0,
    ),
    goalsPerMatchAverage: roundReportNumber(average(worlds.map((world) => world.goalsPerMatchAverage))),
    goalsPerMatchP95: percentile(worlds.map((world) => world.goalsPerMatchAverage), 0.95),
    tablePointsSpreadAverage: roundReportNumber(average(worlds.map((world) => world.tablePointsSpreadAverage))),
    tablePointsSpreadMin: Math.min(...worlds.map((world) => world.tablePointsSpreadAverage)),
    drawRateAverage: roundReportNumber(average(worlds.map((world) => world.drawRateAverage))),
    drawRateMax: Math.max(...worlds.map((world) => world.drawRateAverage)),
    championStreakMaxObserved: Math.max(...worlds.map((world) => world.longestChampionStreak)),
    topAssistMaxP95: percentile(worlds.map((world) => world.topAssistMax), 0.95),
    topAssistMaxObserved: Math.max(...worlds.map((world) => world.topAssistMax)),
    topCreatorGoalShareMaxObserved: Math.max(...worlds.map((world) => world.topCreatorGoalShareMax)),
    topThreeCreatorGoalShareMaxObserved: Math.max(...worlds.map((world) => world.topThreeCreatorGoalShareMax)),
    age30PlusShareP95: percentile(worlds.map((world) => world.age30PlusShare), 0.95),
    roleCoverageWarningP95: percentile(worlds.map((world) => world.roleCoverageWarningCount), 0.95),
    warningCheckCounts: countCheckKeys(worlds.flatMap((world) => world.warningCheckKeys)),
    signalCheckCounts: countSignalKinds(worlds.flatMap((world) => world.warningCheckKeys)),
    failingCheckCounts: countCheckKeys(worlds.flatMap((world) => world.failingCheckKeys)),
    worstWorlds: [...worlds].sort(compareWorstGateWorld).slice(0, 10),
    productionWarningWorlds: [...worlds].sort(compareProductionWarningWorld).slice(0, 10),
    dynastyWarningWorlds: [...worlds].sort(compareDynastyWarningWorld).slice(0, 10),
    tableSpreadWarningWorlds: [...worlds].sort(compareTableSpreadWarningWorld).slice(0, 10),
    zeroPermanentTransferWorlds: worlds
      .filter(
        (world) =>
          world.completedTransferCount === 0
          && world.permanentTransferFunnel.needsEvaluatedCount > 0,
      )
      .sort((left, right) =>
        right.permanentTransferFunnel.needsEvaluatedCount
        - left.permanentTransferFunnel.needsEvaluatedCount
        || left.seed.localeCompare(right.seed)
      )
      .slice(0, 10),
    usefulFreeAgentWorlds: [...worlds]
      .sort((left, right) =>
        right.maximumUsefulFreeAgentCountObserved - left.maximumUsefulFreeAgentCountObserved
        || right.maximumFreeAgentShareObserved - left.maximumFreeAgentShareObserved
        || left.seed.localeCompare(right.seed)
      )
      .slice(0, 10),
    wagePressureWorlds: [...worlds]
      .sort((left, right) =>
        right.wagePressureClubSeasonShare - left.wagePressureClubSeasonShare
        || right.exactWageCeilingClubSeasonShare - left.exactWageCeilingClubSeasonShare
        || left.seed.localeCompare(right.seed)
      )
      .slice(0, 10),
    divisionWageEconomySnapshots: worlds.flatMap((world) =>
      world.closingDivisionWageEconomy.map((row) => ({
        seed: world.seed,
        ...row,
      }))
    ),
    divisionMarketEconomySnapshots: worlds.flatMap((world) =>
      world.closingDivisionMarketEconomy.map((row) => ({
        seed: world.seed,
        ...row,
      }))
    ),
    crossTierTransferSnapshots: worlds.flatMap((world) =>
      world.closingCrossTierTransfers.map((row) => ({
        seed: world.seed,
        ...row,
      }))
    ),
    yearTenExceptionalLocations: worlds.map((world) => ({
      seed: world.seed,
      locations: world.yearTenRatingStock.locations,
    })),
  };
}

/**
 * Sorts worlds by assist/creator concentration so warning audits can review
 * standout-playmaker stories without changing anomaly scoring.
 */
function compareProductionWarningWorld(left: LongRunGateWorldSummary, right: LongRunGateWorldSummary): number {
  return (
    right.topAssistMax - left.topAssistMax ||
    right.topCreatorGoalShareMax - left.topCreatorGoalShareMax ||
    right.topThreeCreatorGoalShareMax - left.topThreeCreatorGoalShareMax ||
    left.seed.localeCompare(right.seed)
  );
}

/**
 * Sorts worlds by longest title run for dynasty warning audits.
 */
function compareDynastyWarningWorld(left: LongRunGateWorldSummary, right: LongRunGateWorldSummary): number {
  return (
    right.longestChampionStreak - left.longestChampionStreak ||
    right.championStreakTableSpreadAverage - left.championStreakTableSpreadAverage ||
    right.transferTurnoverCount - left.transferTurnoverCount ||
    left.seed.localeCompare(right.seed)
  );
}

/**
 * Sorts worlds by the tightest long-run table spread for compression audits.
 */
function compareTableSpreadWarningWorld(left: LongRunGateWorldSummary, right: LongRunGateWorldSummary): number {
  return (
    left.tablePointsSpreadAverage - right.tablePointsSpreadAverage ||
    left.tablePointsSpreadMin - right.tablePointsSpreadMin ||
    left.firstPlacePointsAverage - right.firstPlacePointsAverage ||
    right.lastPlacePointsAverage - left.lastPlacePointsAverage ||
    left.seed.localeCompare(right.seed)
  );
}

/**
 * Counts anomaly keys and returns them sorted by frequency, then key.
 */
function countCheckKeys(keys: readonly string[]): readonly LongRunGateCheckCount[] {
  const counts = new Map<string, number>();

  for (const key of keys) {
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((left, right) => right.count - left.count || left.key.localeCompare(right.key));
}

/**
 * Groups warning-level checks by player-facing meaning.
 *
 * This is report language only: it does not change anomaly keys, thresholds, or
 * final gate status.
 */
function countSignalKinds(keys: readonly string[]): readonly LongRunGateCheckCount[] {
  return countCheckKeys(keys.map(signalKindForCheckKey));
}

/**
 * Classifies a stable check key by how a designer should read it.
 */
function signalKindForCheckKey(key: string): string {
  switch (key) {
    case "top_assist_max":
    case "champion_streak":
    case "table_points_spread_avg":
      return "story";
    case "top_creator_goal_share_max":
    case "top_three_creator_goal_share_max":
    case "role_coverage_warning_count":
    case "goals_per_match_avg":
    case "age_30_plus_share":
    case "useful_players_after_long_run":
    case "transfer_turnover_available":
    case "squad_turnover_available":
    case "senior_active_player_population":
    case "youth_active_player_population":
    case "total_active_player_population":
    case "wage_budget_pressure_prevalence":
    case "wage_budget_exact_ceiling_prevalence":
    case "wage_budget_headroom_p10":
    case "free_agent_share":
    case "selected_club_expiry_decisions":
      return "monitor";
    default:
      return "structural";
  }
}

/**
 * Sorts gate worlds by failure severity, then by structural collapse signals,
 * then by stable seed for deterministic output.
 */
function compareWorstGateWorld(left: LongRunGateWorldSummary, right: LongRunGateWorldSummary): number {
  const statusDelta = gateStatusSeverity(right.status) - gateStatusSeverity(left.status);
  if (statusDelta !== 0) {
    return statusDelta;
  }

  const structuralDelta =
    right.clubsBelowMinimumSquadSizeCount +
    right.clubsWithoutNaturalGoalkeeperCount +
    right.contractFinanceStructuralViolationCount -
    (left.clubsBelowMinimumSquadSizeCount +
      left.clubsWithoutNaturalGoalkeeperCount +
      left.contractFinanceStructuralViolationCount);
  if (structuralDelta !== 0) {
    return structuralDelta;
  }

  return (
    right.maximumWageBudgetUtilizationObserved - left.maximumWageBudgetUtilizationObserved ||
    right.maximumFreeAgentShareObserved - left.maximumFreeAgentShareObserved ||
    left.minimumCashBalanceObserved - right.minimumCashBalanceObserved ||
    left.seed.localeCompare(right.seed)
  );
}

/**
 * Converts PASS/WARN/FAIL into a sortable severity value.
 */
function gateStatusSeverity(status: LongRunAnomalyReport["status"]): number {
  if (status === "fail") {
    return 2;
  }

  if (status === "warn") {
    return 1;
  }

  return 0;
}

/**
 * Builds one simulated season for the managed club's canonical competition.
 *
 * The career still contains all 54 clubs for contracts, finance, development,
 * and market lifecycle; this bounded season result covers the selected tier
 * until Step 08 integrates all three tables into rollover.
 */
function createDomesticCareerSeasonInput(
  world: FakeDomesticWorld,
  careerState: CliCareerState,
  seed: string,
): SimulateSeasonInput {
  const competition = selectedCompetition(world, careerState);
  const teamsByClubId: Record<string, SimulateSeasonTeamInput> = {};
  const roleWeights: Readonly<Record<string, RoleWeightProfile>> = world.roleWeights;
  for (const clubId of competition.clubIds) {
    const club = careerState.gameState.clubs[clubId];
    if (club === undefined) throw new Error(`Missing report club: ${clubId}`);
    const lineup = reportLineup(club.playerIds, careerState);
    teamsByClubId[clubId] = {
      lineup,
      players: careerState.gameState.players,
      roleWeights,
      stateMultiplierCurves: world.stateMultiplierCurves,
      strength: deriveTeamStrength({
        lineup,
        players: careerState.gameState.players,
        playerStates: careerState.gameState.playerStates,
        roleWeights,
        stateMultiplierCurves: world.stateMultiplierCurves,
      }),
      tacticalDistribution: {
        directness: 0.5,
        pressing: 0.5,
        width: 0.5,
        risk: 0.5,
      },
    };
  }
  return {
    seed,
    seasonId: careerState.gameState.calendar.currentSeasonId,
    competitionId: competition.id,
    clubIds: competition.clubIds,
    seasonStartDate: careerState.gameState.calendar.currentDate,
    teamsByClubId,
    matchEngineConfig: world.matchEngineConfig,
    tableRules: world.tableRules,
  };
}

/** Selects a balanced deterministic XI from one current senior roster. */
function reportLineup(
  playerIds: readonly CliCareerState["gameState"]["playerIds"][number][],
  careerState: CliCareerState,
): readonly LineupSlot[] {
  const selected: CliCareerState["gameState"]["playerIds"][number][] = [];
  addReportPlayers(selected, playerIds, careerState, "goalkeeper", 1);
  addReportPlayers(selected, playerIds, careerState, "defender", 4);
  addReportPlayers(selected, playerIds, careerState, "midfielder", 4);
  addReportPlayers(selected, playerIds, careerState, "attacker", 2);
  for (const playerId of playerIds) {
    if (selected.length >= 11) break;
    if (!selected.includes(playerId)) selected.push(playerId);
  }
  return selected.slice(0, 11).map((playerId, index) => {
    const group = reportPositionGroup(careerState.gameState.players[playerId]?.naturalPositions[0]);
    return {
      slotId: `slot:${String(index + 1).padStart(2, "0")}`,
      playerId,
      roleKey: group === "goalkeeper" ? "gk" : group,
    };
  });
}

function addReportPlayers(
  selected: CliCareerState["gameState"]["playerIds"][number][],
  playerIds: readonly CliCareerState["gameState"]["playerIds"][number][],
  careerState: CliCareerState,
  group: "goalkeeper" | "defender" | "midfielder" | "attacker",
  count: number,
): void {
  for (const playerId of playerIds) {
    if (selected.filter((id) =>
      reportPositionGroup(careerState.gameState.players[id]?.naturalPositions[0]) === group
    ).length >= count) break;
    if (
      !selected.includes(playerId)
      && reportPositionGroup(careerState.gameState.players[playerId]?.naturalPositions[0]) === group
    ) {
      selected.push(playerId);
    }
  }
}

function reportPositionGroup(
  position: CliPlayer["naturalPositions"][number] | undefined,
): "goalkeeper" | "defender" | "midfielder" | "attacker" {
  if (position === "gk") return "goalkeeper";
  if (["rb", "cb", "lb", "rwb", "lwb"].includes(position ?? "")) return "defender";
  if (["dm", "cm", "am"].includes(position ?? "")) return "midfielder";
  return "attacker";
}

/** Derives the managed club's current competition from canonical membership. */
function selectedCompetition(
  _world: FakeDomesticWorld,
  careerState: CliCareerState,
) {
  const registry = careerState.gameState.domesticCompetitionWorld;
  if (registry === undefined) {
    throw new Error("Report career has no domestic competition registry");
  }
  const competitionId = competitionIdForClubInWorld(
    registry,
    careerState.selectedClubId,
  );
  const competition = competitionId === undefined
    ? undefined
    : registry.competitions[competitionId];
  if (competition === undefined) {
    throw new Error("Managed club competition is unavailable in report world");
  }
  return competition;
}


/**
 * Applies deterministic post-season career refresh in memory for the report.
 */
function advanceCareerForReport(
  league: FakeDomesticWorld,
  worldSeed: string,
  context: AdvanceCareerLongRunSeasonContext,
  annualIntakeObservations: PlayerGenerationAnnualIntakeObservation[],
): AdvanceCareerLongRunSeasonResult {
  const nextSeasonId =
    `${context.careerState.gameState.calendar.currentSeasonId}:long-run-${context.seasonNumber}` as AdvanceCareerReportRefreshMode["nextSeasonId"];
  const nextSeasonStartDate = (context.careerState.gameState.calendar.currentDate + 365) as AdvanceCareerReportRefreshMode["nextSeasonStartDate"];
  const competition = selectedCompetition(league, context.careerState as CliCareerState);
  const transferWindows = resolveSeasonTransferWindows({
    competitionId: competition.id,
    seasonId: context.careerState.gameState.calendar.currentSeasonId,
    seasonStartYear: seasonStartYearFromDate(
      context.careerState.gameState.calendar.currentDate,
    ),
  });
  const fundedCareerState = settleUnsimulatedCompetitionDistributions(
    league,
    context.careerState as CliCareerState,
    competition.id,
    context.careerState.gameState.calendar.currentSeasonId,
    context.careerState.gameState.calendar.currentDate,
  );
  const valuationConfig = selectPlayerValuationConfig(
    fundedCareerState.gameState.meta.calibrationVersions,
  );
  const wagePolicy = selectPlayerWagePolicyConfig(
    fundedCareerState.gameState.meta.calibrationVersions,
  );
  const marketBehaviorPolicy = selectMarketBehaviorCalibration(
    fundedCareerState.gameState.meta.calibrationVersions,
  );
  const askingPriceConfig = selectAskingPriceCurves(
    fundedCareerState.gameState.meta.calibrationVersions,
  );
  const annualIntake = createAnnualWorldIntakeCandidateProviders({
    worldSeed,
    seasonIndex: context.seasonNumber - 1,
    seniorCandidatesPerClub: LONG_RUN_INTAKE_CANDIDATES_PER_CLUB,
  });
  const advanced = advanceCareerOneSeason({
    careerState: fundedCareerState,
    worldSeed,
    mode: {
      kind: "reportRefresh",
      nextSeasonId,
      nextSeasonStartDate,
      ...(competition.seasonDistribution === undefined
        ? {}
        : {
            seasonDistribution: competition.seasonDistribution,
            finalTable: context.seasonResult.table,
          }),
    },
    createYouthIntakeCandidates: annualIntake.createYouthIntakeCandidates,
    createSeniorIntakeCandidates: annualIntake.createSeniorIntakeCandidates,
    allowSelectedClubYouthPromotion: true,
    allowSelectedClubSquadReplenishment: true,
    transferWindows,
    valuationConfig,
    askingPriceConfig,
    wagePolicy,
    marketBehaviorPolicy,
  });

  if (advanced.status !== "advanced") {
    throw new Error(`Cannot advance report career season ${context.seasonNumber}: ${advanced.reason}`);
  }
  const annualIntakeDiagnostics = annualIntake.diagnostics();
  const acceptedYouthIds = new Set(
    advanced.facts.youthIntake.acceptedPlayerIds.map(String),
  );
  if (
    annualIntakeDiagnostics.allocation.potentialSixPlayerKeys.some(
      (id) => !acceptedYouthIds.has(id),
    )
  ) {
    throw new Error(
      `Exceptional annual intake was generated but not accepted in season ${context.seasonNumber}`,
    );
  }
  const allocatedPotentialSixPlayerIds =
    annualIntakeDiagnostics.allocation.potentialSixPlayerKeys.map(String);
  const allocatedThroughCurrentSeason = [
    ...annualIntakeObservations.flatMap(
      (observation) => observation.allocatedPotentialSixPlayerIds,
    ),
    ...allocatedPotentialSixPlayerIds,
  ];
  const activePlayerIds = activeCareerPlayerIds(advanced.careerState);
  const activeAllocatedPlayers = allocatedThroughCurrentSeason
    .filter((id) => activePlayerIds.has(id))
    .map((id) => advanced.careerState.gameState.players[id as Phase79CPlayerId])
    .filter((player): player is CliPlayer => player !== undefined);
  const activePotentialSixPlayerIds = activeAllocatedPlayers
    .map((player) =>
      derivePlayerPotentialProjection({
        player,
        currentDate: advanced.careerState.gameState.calendar.currentDate,
        policy: valuationConfig.potentialProjectionPolicy,
        ratingScale: valuationConfig.ratingScale,
      })
    )
    .filter(({ storedCeilingRating }) => storedCeilingRating === 6)
    .map(({ playerId }) => String(playerId));
  annualIntakeObservations.push({
    seasonIndex: context.seasonNumber - 1,
    allocatedPotentialSixPlayerIds,
    generatedPotentialSixPlayerIds:
      annualIntakeDiagnostics.generatedPotentialSixPlayerIds.map(String),
    acceptedPlayerIds: advanced.facts.youthIntake.acceptedPlayerIds.map(String),
    activePotentialSixPlayerIds,
  });

  return {
    careerState: advanced.careerState,
    refresh: {
      contractFinance: createLongRunContractFinanceSeasonRow({
        seasonNumber: context.seasonNumber,
        previousCareerState: context.careerState,
        careerState: advanced.careerState,
        transferWindows,
        valuationConfig,
        wagePolicy,
        ...(advanced.facts.marketLifecycle === undefined
          ? {}
          : { marketLifecycle: advanced.facts.marketLifecycle }),
        playerExits: advanced.facts.playerExits,
        squadMaintenance: advanced.facts.squadMaintenance,
        youthLifecycle: advanced.facts.youthLifecycle,
      }),
      exitCount: advanced.facts.playerExits.exitCount,
      exitReasons: {
        retirement: advanced.facts.playerExits.reasons.retirement,
        released: advanced.facts.playerExits.reasons.released,
        careerStepDown: advanced.facts.playerExits.reasons.career_step_down,
      },
      intakeCount: advanced.facts.squadMaintenance.candidateCount,
      squadMaintenanceAddedCount: advanced.facts.squadMaintenance.addedPlayerCount,
      youthPromotionCount: advanced.facts.youthPromotions.promotedCount,
      youthIntakeCount: advanced.facts.youthIntake.acceptedPlayerCount,
      youthExitCount: advanced.facts.youthLifecycle.recordCount,
      transferTurnoverCount: advanced.facts.transferTurnover.transferCount,
      seniorPlayerCount: advanced.facts.squadHealth.seniorPlayerCount,
      youthPlayerCount: advanced.facts.youthHealth.youthPlayerCount,
      activePlayerCount: advanced.facts.youthHealth.activePlayerCount,
      minimumSquadSize: advanced.facts.squadHealth.minimumSquadSize,
      averageSquadSize: advanced.facts.squadHealth.averageSquadSize,
      maximumSquadSize: advanced.facts.squadHealth.maximumSquadSize,
      clubsBelowMinimumSquadSize: advanced.facts.squadHealth.clubsBelowMinimumSquadSize,
      clubsWithoutNaturalGoalkeeper: advanced.facts.squadHealth.clubsWithoutNaturalGoalkeeper,
      roleCoverageWarningCount: advanced.facts.squadMaintenance.warningCount,
      minimumYouthRosterSize: advanced.facts.youthHealth.minimumYouthRosterSize,
      averageYouthRosterSize: advanced.facts.youthHealth.averageYouthRosterSize,
      maximumYouthRosterSize: advanced.facts.youthHealth.maximumYouthRosterSize,
      selectedClubYouthSize: advanced.facts.youthHealth.selectedClubYouthSize,
      clubsAboveYouthTarget: advanced.facts.youthHealth.clubsAboveYouthTarget,
      clubsBelowYouthMinimum: advanced.facts.youthHealth.clubsBelowYouthMinimum,
    },
  };
}

/**
 * Returns canonical active ownership across senior, academy, and free-agent
 * populations. Retained historical player entities do not count as active.
 */
function activeCareerPlayerIds(careerState: CliCareerState): ReadonlySet<string> {
  const activeIds = new Set<string>(selectFreeAgentPlayerIds(careerState).map(String));
  for (const clubId of careerState.gameState.clubIds) {
    for (const playerId of careerState.gameState.clubs[clubId]?.playerIds ?? []) {
      activeIds.add(String(playerId));
    }
  }
  for (const clubId of careerState.youthAcademyState?.clubRosterIds ?? []) {
    for (const playerId of careerState.youthAcademyState?.clubRosters[clubId]?.playerIds ?? []) {
      activeIds.add(String(playerId));
    }
  }
  return activeIds;
}

/**
 * Credits canonical distributions for the tiers outside the focused report.
 *
 * The bounded pre-calibration report retains only the managed competition's
 * match result. Country-wide payroll still needs the other two competitions'
 * operating distributions until Step 14 enables the fully integrated cohort
 * after economic calibration.
 */
function settleUnsimulatedCompetitionDistributions(
  world: FakeDomesticWorld,
  careerState: CliCareerState,
  selectedCompetitionId: FakeDomesticWorld["domesticCompetitionWorld"]["competitionIds"][number],
  season: CliCareerState["gameState"]["calendar"]["currentSeasonId"],
  occurredOn: CliCareerState["gameState"]["calendar"]["currentDate"],
): CliCareerState {
  let fundedCareerState = careerState;
  for (const competitionId of world.domesticCompetitionWorld.competitionIds) {
    if (competitionId === selectedCompetitionId) continue;
    const competition = world.domesticCompetitionWorld.competitions[competitionId];
    if (competition?.seasonDistribution === undefined) continue;
    const finalTable: SimulateSeasonResult["table"] = competition.clubIds.map(
      (clubId, index) => ({
        position: index + 1,
        clubId,
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
      }),
    );
    const settled = settleSeasonDistribution({
      careerState: fundedCareerState,
      seasonId: season,
      occurredOn,
      distribution: competition.seasonDistribution,
      finalTable,
    });
    if (settled.status === "rejected") {
      throw new Error(
        `Cannot fund report competition ${competitionId}: ${settled.reason}`,
      );
    }
    fundedCareerState = settled.careerState as CliCareerState;
  }
  return fundedCareerState;
}

/**
 * Releases fixture and player-state histories after career advancement while
 * preserving every fact consumed by balance and stability reports.
 */
function retainLongRunSeasonResult(result: SimulateSeasonResult): LongRunRetainedSeasonResult {
  return {
    fixtureCount: result.fixtures.length,
    drawCount: result.fixtures.reduce(
      (count, fixture) =>
        fixture.result !== undefined && fixture.result.homeGoals === fixture.result.awayGoals
          ? count + 1
          : count,
      0,
    ),
    table: result.table,
    playerGoalStats: result.playerGoalStats,
    playerSummaryStats: result.playerSummaryStats,
  };
}

/**
 * Builds report-safe player snapshots from a career state.
 */
function snapshotPlayers(careerState: CliCareerState): readonly LongRunPlayerSnapshotRow[] {
  const rows: LongRunPlayerSnapshotRow[] = [];

  for (const playerId of careerState.gameState.playerIds) {
    const player = careerState.gameState.players[playerId];

    if (player === undefined) {
      continue;
    }

    rows.push({
      playerId: String(playerId),
      displayName: playerName(player),
      age: playerAgeYears(careerState, player),
      currentAbility: reportCurrentAbility(player),
      potentialRoom: reportPotentialRoom(player),
    });
  }

  return rows;
}

/**
 * Builds production rows from completed simulated seasons.
 */
function productionRows(
  careerState: CliCareerState,
  seasons: readonly LongRunSeasonResult[],
  text: Translator,
): readonly LongRunPlayerProductionRow[] {
  return seasons.map((season) => {
    const topScorer = season.result.playerGoalStats[0];
    const topAssist = topAssistRow(season);
    const topCreator = topCreatorShareRow(season);
    const topCreatorClubTopScorer = topCreatorClubScorerRow(season, topCreator?.clubId);

    return {
      seasonNumber: season.seasonNumber,
      topScorerName: topScorer === undefined ? text("common.unavailable") : playerNameById(careerState, topScorer.playerId),
      topScorerGoals: topScorer?.goals ?? 0,
      topAssistName: topAssist === undefined ? text("common.unavailable") : playerNameById(careerState, topAssist.playerId),
      topAssists: topAssist?.assists ?? 0,
      topCreatorClubName: topCreator === undefined ? text("common.unavailable") : clubNameById(careerState, topCreator.clubId),
      topCreatorName: topCreator === undefined ? text("common.unavailable") : playerNameById(careerState, topCreator.playerId),
      topCreatorAssists: topCreator?.assists ?? 0,
      topCreatorClubGoals: topCreator?.clubGoals ?? 0,
      topCreatorClubTopScorerName:
        topCreatorClubTopScorer === undefined ? text("common.unavailable") : playerNameById(careerState, topCreatorClubTopScorer.playerId),
      topCreatorClubTopScorerGoals: topCreatorClubTopScorer?.goals ?? 0,
      assistPlayersAtLeastFive: assistDepth(season, 5),
      assistPlayersAtLeastEight: assistDepth(season, 8),
      assistPlayersAtLeastTen: assistDepth(season, 10),
      assistPlayersAtLeastTwelve: assistDepth(season, 12),
      topAssistClubGoalShare: maxSingleAssistShare(season),
      topThreeAssistClubGoalShare: maxTopThreeAssistShare(season),
    };
  });
}

/**
 * Finds the player with the highest meaningful share of their own club's goals
 * created by assists.
 *
 * Low-scoring clubs can produce misleading ratios such as `6 assists / 13
 * goals`. That is a compact story, not structural creator dominance, so the
 * gate ignores share ratios until a club scored enough goals for the denominator
 * to be useful.
 */
function topCreatorShareRow(
  season: LongRunSeasonResult,
): (LongRunSeasonResult["result"]["playerSummaryStats"][number] & { readonly clubGoals: number; readonly creatorShare: number }) | undefined {
  let best:
    | (LongRunSeasonResult["result"]["playerSummaryStats"][number] & { readonly clubGoals: number; readonly creatorShare: number })
    | undefined;

  for (const row of season.result.playerSummaryStats) {
    const clubGoals = season.result.table.find((tableRow) => tableRow.clubId === row.clubId)?.goalsFor ?? 0;

    if (clubGoals < MIN_GOALS_FOR_CREATOR_SHARE) {
      continue;
    }

    const candidate = {
      ...row,
      clubGoals,
      creatorShare: row.assists / clubGoals,
    };

    if (
      best === undefined ||
      candidate.creatorShare > best.creatorShare ||
      (candidate.creatorShare === best.creatorShare && candidate.assists > best.assists) ||
      (candidate.creatorShare === best.creatorShare &&
        candidate.assists === best.assists &&
        String(candidate.playerId) < String(best.playerId))
    ) {
      best = candidate;
    }
  }

  return best;
}

/**
 * Finds the top scorer in the same club as a creator-concentration row.
 */
function topCreatorClubScorerRow(
  season: LongRunSeasonResult,
  clubId: LongRunSeasonResult["result"]["playerSummaryStats"][number]["clubId"] | undefined,
): LongRunSeasonResult["result"]["playerSummaryStats"][number] | undefined {
  if (clubId === undefined) {
    return undefined;
  }

  let best: LongRunSeasonResult["result"]["playerSummaryStats"][number] | undefined;

  for (const row of season.result.playerSummaryStats) {
    if (row.clubId !== clubId) {
      continue;
    }

    if (best === undefined || row.goals > best.goals || (row.goals === best.goals && String(row.playerId) < String(best.playerId))) {
      best = row;
    }
  }

  return best;
}

/**
 * Finds the top assist row for a season.
 */
function topAssistRow(season: LongRunSeasonResult): LongRunSeasonResult["result"]["playerSummaryStats"][number] | undefined {
  let best: LongRunSeasonResult["result"]["playerSummaryStats"][number] | undefined;

  for (const row of season.result.playerSummaryStats) {
    if (best === undefined || row.assists > best.assists || (row.assists === best.assists && String(row.playerId) < String(best.playerId))) {
      best = row;
    }
  }

  return best;
}

/**
 * Reads a club name from the report career state.
 */
function clubNameById(careerState: CliCareerState, clubId: CliCareerState["gameState"]["clubIds"][number]): string {
  return careerState.gameState.clubs[clubId]?.name ?? String(clubId);
}

/**
 * Counts how many players reached an assist threshold.
 */
function assistDepth(season: LongRunSeasonResult, threshold: number): number {
  return season.result.playerSummaryStats.filter((row) => row.assists >= threshold).length;
}

/**
 * Calculates the highest meaningful single-player assist share of his club's
 * goals.
 */
function maxSingleAssistShare(season: LongRunSeasonResult): number {
  let maxShare = 0;

  for (const row of season.result.playerSummaryStats) {
    const goalsFor = season.result.table.find((tableRow) => tableRow.clubId === row.clubId)?.goalsFor ?? 0;

    if (goalsFor >= MIN_GOALS_FOR_CREATOR_SHARE) {
      maxShare = Math.max(maxShare, row.assists / goalsFor);
    }
  }

  return maxShare;
}

/**
 * Calculates the highest top-three assist share for any club.
 */
function maxTopThreeAssistShare(season: LongRunSeasonResult): number {
  let maxShare = 0;

  for (const tableRow of season.result.table) {
    if (tableRow.goalsFor < MIN_GOALS_FOR_CREATOR_SHARE) {
      continue;
    }

    const assists = season.result.playerSummaryStats
      .filter((row) => row.clubId === tableRow.clubId)
      .map((row) => row.assists)
      .sort((left, right) => right - left)
      .slice(0, 3)
      .reduce((sum, assists) => sum + assists, 0);

    if (tableRow.goalsFor > 0) {
      maxShare = Math.max(maxShare, assists / tableRow.goalsFor);
    }
  }

  return maxShare;
}

/**
 * Builds club-stability season rows from completed simulated seasons.
 */
function clubSeasonRows(league: FakeDomesticWorld, seasons: readonly LongRunSeasonResult[]): readonly LongRunClubSeasonRow[] {
  const selectedClubId = league.defaultSelectedClubId;

  if (selectedClubId === undefined) {
    throw new Error("Cannot build club stability rows without clubs");
  }

  return seasons.map((season) => {
    const champion = season.result.table[0];
    const selectedIndex = season.result.table.findIndex((row) => row.clubId === selectedClubId);
    const selectedRow = selectedIndex < 0 ? undefined : season.result.table[selectedIndex];

    if (champion === undefined || selectedRow === undefined) {
      throw new Error(`Cannot build club stability row for season: ${season.seasonNumber}`);
    }

    return {
      seasonNumber: season.seasonNumber,
      championClubId: String(champion.clubId),
      championClubName: clubLabel(league, champion.clubId),
      championPoints: champion.points,
      selectedClubPosition: selectedIndex + 1,
      selectedClubPoints: selectedRow.points,
    };
  });
}

function refreshTotals(seasons: readonly LongRunSeasonResult[]): {
  readonly transferTurnoverCount: number;
  readonly playerExitCount: number;
  readonly retirementExitCount: number;
  readonly releasedExitCount: number;
  readonly careerStepDownExitCount: number;
  readonly playerIntakeCount: number;
  readonly squadMaintenanceAddedCount: number;
  readonly minimumSquadSizeObserved: number;
  readonly maximumSquadSizeObserved: number;
  readonly averageSquadSizeObserved: number;
  readonly clubsBelowMinimumSquadSizeCount: number;
  readonly clubsWithoutNaturalGoalkeeperCount: number;
  readonly roleCoverageWarningCount: number;
} {
  const averageSquadSizes = seasons.map((season) => season.refresh.averageSquadSize);

  return {
    transferTurnoverCount: seasons.reduce((sum, season) => sum + season.refresh.transferTurnoverCount, 0),
    playerExitCount: seasons.reduce((sum, season) => sum + season.refresh.exitCount, 0),
    retirementExitCount: seasons.reduce((sum, season) => sum + season.refresh.exitReasons.retirement, 0),
    releasedExitCount: seasons.reduce((sum, season) => sum + season.refresh.exitReasons.released, 0),
    careerStepDownExitCount: seasons.reduce((sum, season) => sum + season.refresh.exitReasons.careerStepDown, 0),
    playerIntakeCount: seasons.reduce((sum, season) => sum + season.refresh.intakeCount, 0),
    squadMaintenanceAddedCount: seasons.reduce((sum, season) => sum + season.refresh.squadMaintenanceAddedCount, 0),
    minimumSquadSizeObserved: Math.min(...seasons.map((season) => season.refresh.minimumSquadSize)),
    maximumSquadSizeObserved: Math.max(...seasons.map((season) => season.refresh.maximumSquadSize)),
    averageSquadSizeObserved: roundReportNumber(
      averageSquadSizes.reduce((sum, value) => sum + value, 0) / averageSquadSizes.length,
    ),
    clubsBelowMinimumSquadSizeCount: seasons.reduce((sum, season) => sum + season.refresh.clubsBelowMinimumSquadSize, 0),
    clubsWithoutNaturalGoalkeeperCount: seasons.reduce((sum, season) => sum + season.refresh.clubsWithoutNaturalGoalkeeper, 0),
    roleCoverageWarningCount: seasons.reduce((sum, season) => sum + season.refresh.roleCoverageWarningCount, 0),
  };
}

/**
 * Builds youth-population season rows from completed career refresh snapshots.
 */
function youthSeasonRows(seasons: readonly LongRunSeasonResult[]): readonly LongRunYouthSeasonRow[] {
  return seasons.map((season) => ({
    seasonNumber: season.seasonNumber,
    seniorPlayerCount: season.refresh.seniorPlayerCount,
    youthPlayerCount: season.refresh.youthPlayerCount,
    activePlayerCount: season.refresh.activePlayerCount,
    minimumYouthRosterSize: season.refresh.minimumYouthRosterSize,
    averageYouthRosterSize: season.refresh.averageYouthRosterSize,
    maximumYouthRosterSize: season.refresh.maximumYouthRosterSize,
    youthIntakeCount: season.refresh.youthIntakeCount,
    youthExitCount: season.refresh.youthExitCount,
    youthPromotionCount: season.refresh.youthPromotionCount,
    selectedClubYouthSize: season.refresh.selectedClubYouthSize,
    clubsAboveYouthTarget: season.refresh.clubsAboveYouthTarget,
    clubsBelowYouthMinimum: season.refresh.clubsBelowYouthMinimum,
  }));
}

/**
 * Builds balance rows for deterministic anomaly scoring.
 */
function balanceSeasonRows(seasons: readonly LongRunSeasonResult[]): readonly LongRunBalanceSeasonRow[] {
  return seasons.map((season) => {
    const first = season.result.table[0];
    const last = season.result.table[season.result.table.length - 1];

    if (first === undefined || last === undefined) {
      throw new Error(`Cannot score balance for empty season table: ${season.seasonNumber}`);
    }

    return {
      goalsPerMatch: goalsPerMatch(season),
      firstPlacePoints: first.points,
      lastPlacePoints: last.points,
      tablePointsSpread: first.points - last.points,
    };
  });
}

/**
 * Calculates league goals per match from the completed season result.
 */
export function goalsPerMatch(season: LongRunSeasonResult): number {
  const totalGoals = season.result.table.reduce((sum, row) => sum + row.goalsFor, 0);

  return totalGoals / season.result.fixtureCount;
}

/**
 * Calculates the share of completed fixtures that ended in a draw.
 */
export function drawRate(season: LongRunSeasonResult): number {
  return season.result.drawCount / season.result.fixtureCount;
}

/**
 * Resolves a generated club display name for report output.
 */
export function clubLabel(league: FakeDomesticWorld, clubId: FakeDomesticWorld["clubIds"][number]): string {
  const club = league.clubsById[clubId];

  if (club === undefined) {
    return String(clubId);
  }

  return club.name;
}

/**
 * Resolves a generated player display name by ID.
 */
function playerNameById(careerState: CliCareerState, playerId: CliCareerState["gameState"]["playerIds"][number]): string {
  const player = careerState.gameState.players[playerId];

  if (player === undefined) {
    return String(playerId);
  }

  return playerName(player);
}

/**
 * Formats a player's generated name.
 */
function playerName(player: Pick<CliPlayer, "firstName" | "lastName">): string {
  return `${player.firstName} ${player.lastName}`;
}

/**
 * Calculates a player's age in years at the career state's current date.
 */
function playerAgeYears(careerState: CliCareerState, player: Pick<CliPlayer, "birthDate">): number {
  return Math.floor((careerState.gameState.calendar.currentDate - player.birthDate) / 365);
}

/**
 * Projects current football quality for the player's stable role.
 *
 * Historical players without role identity retain the explicit raw diagnostic
 * measure used by reports before role metadata became durable.
 */
function reportCurrentAbility(player: CliPlayer): number {
  return roundReportNumber(summarizePlayerDevelopmentAbilities(player).currentAbility);
}

/**
 * Projects role-weighted potential room without exposing exact hidden potential.
 */
function reportPotentialRoom(player: CliPlayer): number {
  return roundReportNumber(summarizePlayerDevelopmentAbilities(player).potentialRoom);
}

function aggregatePermanentTransferFunnels(
  funnels: readonly LongRunPermanentTransferFunnel[],
): LongRunPermanentTransferFunnel {
  return {
    needsEvaluatedCount: sumFunnelField(funnels, "needsEvaluatedCount"),
    recruitableNeedCount: sumFunnelField(funnels, "recruitableNeedCount"),
    targetFoundCount: sumFunnelField(funnels, "targetFoundCount"),
    targetUnavailableCount: sumFunnelField(funnels, "targetUnavailableCount"),
    offerSubmittedCount: sumFunnelField(funnels, "offerSubmittedCount"),
    sellerRejectedCount: sumFunnelField(funnels, "sellerRejectedCount"),
    sellerCounteredCount: sumFunnelField(funnels, "sellerCounteredCount"),
    sellerAcceptedCount: sumFunnelField(funnels, "sellerAcceptedCount"),
    sellerExpiredCount: sumFunnelField(funnels, "sellerExpiredCount"),
    sellerWithdrawnCount: sumFunnelField(funnels, "sellerWithdrawnCount"),
    playerTermsStartedCount: sumFunnelField(funnels, "playerTermsStartedCount"),
    playerCounteredCount: sumFunnelField(funnels, "playerCounteredCount"),
    playerRejectedCount: sumFunnelField(funnels, "playerRejectedCount"),
    playerCounterAcceptedCount: sumFunnelField(funnels, "playerCounterAcceptedCount"),
    unaffordableCompletionCount: sumFunnelField(funnels, "unaffordableCompletionCount"),
    completedCount: sumFunnelField(funnels, "completedCount"),
    lostReasonCounts: aggregateReasonCounts(funnels.map((funnel) => funnel.lostReasonCounts)),
    lostByClubDepartment: aggregateMarketLossSlices(
      funnels.flatMap((funnel) => funnel.lostByClubDepartment),
    ),
    clubActivity: aggregateMarketClubActivity(
      funnels.flatMap((funnel) => funnel.clubActivity),
    ),
  };
}

function aggregatePreliminaryAgreementFunnels(
  funnels: readonly LongRunPreliminaryAgreementFunnel[],
): LongRunPreliminaryAgreementFunnel {
  return {
    candidateFoundCount: sumFunnelField(funnels, "candidateFoundCount"),
    candidateUnavailableCount: sumFunnelField(funnels, "candidateUnavailableCount"),
    offerSubmittedCount: sumFunnelField(funnels, "offerSubmittedCount"),
    offerRejectedCount: sumFunnelField(funnels, "offerRejectedCount"),
    counteredCount: sumFunnelField(funnels, "counteredCount"),
    counterAcceptedCount: sumFunnelField(funnels, "counterAcceptedCount"),
    counterRejectedCount: sumFunnelField(funnels, "counterRejectedCount"),
    agreementCreatedCount: sumFunnelField(funnels, "agreementCreatedCount"),
    expiredCount: sumFunnelField(funnels, "expiredCount"),
    activationCount: sumFunnelField(funnels, "activationCount"),
    activationFailureCount: sumFunnelField(funnels, "activationFailureCount"),
    lostReasonCounts: aggregateReasonCounts(funnels.map((funnel) => funnel.lostReasonCounts)),
  };
}

function sumFunnelField<T extends object, K extends keyof T>(
  funnels: readonly T[],
  key: K,
): number {
  return funnels.reduce((sum, funnel) => sum + Number(funnel[key]), 0);
}

function aggregateReasonCounts(
  rows: readonly Readonly<Record<string, number>>[],
): Readonly<Record<string, number>> {
  const totals = new Map<string, number>();
  for (const row of rows) {
    for (const [reason, count] of Object.entries(row)) {
      totals.set(reason, (totals.get(reason) ?? 0) + count);
    }
  }
  return Object.fromEntries([...totals].sort(([left], [right]) => left.localeCompare(right)));
}

function aggregateMarketLossSlices(
  rows: LongRunPermanentTransferFunnel["lostByClubDepartment"],
): LongRunPermanentTransferFunnel["lostByClubDepartment"] {
  const totals = new Map<string, LongRunPermanentTransferFunnel["lostByClubDepartment"][number]>();
  for (const row of rows) {
    const key = `${row.clubId}|${row.department}|${row.reason}|${row.transferWindowOpen}`;
    const previous = totals.get(key);
    totals.set(key, { ...row, count: (previous?.count ?? 0) + row.count });
  }
  return [...totals.values()].sort((left, right) =>
    left.clubId.localeCompare(right.clubId)
    || left.department.localeCompare(right.department)
    || left.reason.localeCompare(right.reason)
    || Number(right.transferWindowOpen) - Number(left.transferWindowOpen)
  );
}

function aggregateMarketClubActivity(
  rows: LongRunPermanentTransferFunnel["clubActivity"],
): LongRunPermanentTransferFunnel["clubActivity"] {
  const totals = new Map<string, LongRunPermanentTransferFunnel["clubActivity"][number]>();
  for (const row of rows) {
    const previous = totals.get(row.clubId);
    totals.set(row.clubId, {
      clubId: row.clubId,
      needsEvaluatedCount: (previous?.needsEvaluatedCount ?? 0) + row.needsEvaluatedCount,
      recruitableNeedCount: (previous?.recruitableNeedCount ?? 0) + row.recruitableNeedCount,
      permanentTargetFoundCount:
        (previous?.permanentTargetFoundCount ?? 0) + row.permanentTargetFoundCount,
      permanentOfferSubmittedCount:
        (previous?.permanentOfferSubmittedCount ?? 0) + row.permanentOfferSubmittedCount,
      permanentCompletedCount:
        (previous?.permanentCompletedCount ?? 0) + row.permanentCompletedCount,
      preliminaryOfferSubmittedCount:
        (previous?.preliminaryOfferSubmittedCount ?? 0) + row.preliminaryOfferSubmittedCount,
    });
  }
  return [...totals.values()].sort((left, right) => left.clubId.localeCompare(right.clubId));
}

function aggregateFreeAgentBands(rows: readonly LongRunFreeAgentBands[]): LongRunFreeAgentBands {
  return {
    age: {
      under_23: rows.reduce((sum, row) => sum + row.age.under_23, 0),
      prime_23_29: rows.reduce((sum, row) => sum + row.age.prime_23_29, 0),
      age_30_34: rows.reduce((sum, row) => sum + row.age.age_30_34, 0),
      age_35_plus: rows.reduce((sum, row) => sum + row.age.age_35_plus, 0),
    },
    currentAbility: {
      under_8: rows.reduce((sum, row) => sum + row.currentAbility.under_8, 0),
      ability_8_9: rows.reduce((sum, row) => sum + row.currentAbility.ability_8_9, 0),
      ability_10_11: rows.reduce((sum, row) => sum + row.currentAbility.ability_10_11, 0),
      ability_12_plus: rows.reduce((sum, row) => sum + row.currentAbility.ability_12_plus, 0),
    },
    unattached: {
      under_1_season: rows.reduce((sum, row) => sum + row.unattached.under_1_season, 0),
      one_to_two_seasons: rows.reduce((sum, row) => sum + row.unattached.one_to_two_seasons, 0),
      three_plus_seasons: rows.reduce((sum, row) => sum + row.unattached.three_plus_seasons, 0),
    },
  };
}

/**
 * Aggregates stable Phase 79D gate keys without retaining player observations.
 *
 * Threshold disagreement is rejected because it would make two worker
 * partitions interpret the same key differently.
 */
function aggregatePlayerEconomyGates(
  worlds: readonly LongRunGateWorldSummary[],
): readonly LongRunGatePlayerEconomyGateSummary[] {
  const keys = [...new Set(
    worlds.flatMap((world) => world.playerEconomyGates.map(({ key }) => key)),
  )].sort();
  return keys.map((key) => {
    const gates = worlds.flatMap((world) =>
      world.playerEconomyGates.filter((gate) => gate.key === key)
    );
    const thresholds = new Set(gates.map(({ threshold }) => threshold));
    if (thresholds.size !== 1) {
      throw new Error(`Phase 79D gate threshold mismatch: ${key}`);
    }
    return {
      key,
      observationCount: gates.reduce(
        (sum, gate) => sum + gate.observationCount,
        0,
      ),
      violationCount: gates.reduce(
        (sum, gate) => sum + gate.violationCount,
        0,
      ),
      failedWorldCount: gates.filter(({ status }) => status === "fail").length,
      notEvaluatedWorldCount: gates.filter(
        ({ status }) => status === "not_evaluated",
      ).length,
      threshold: gates[0]!.threshold,
    };
  });
}

/** Retains each exact immutable version bundle once in deterministic order. */
function uniqueCalibrationVersionBundles(
  bundles: readonly Phase79CCalibrationVersions[],
): readonly Phase79CCalibrationVersions[] {
  const unique = new Map<string, Phase79CCalibrationVersions>();
  for (const bundle of bundles) {
    unique.set(JSON.stringify(bundle), bundle);
  }
  return [...unique.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([, bundle]) => ({ ...bundle }));
}

/** Creates one compact exact-money distribution for Phase 79C audit output. */
function moneyDistribution(values: readonly number[]): LongRunMoneyDistribution {
  return {
    count: values.length,
    p50: percentile(values, 0.5),
    p90: percentile(values, 0.9),
    p99: percentile(values, 0.99),
    maximum: Math.max(...values, 0),
  };
}

function safeReportRatio(numerator: number, denominator: number): number {
  return denominator <= 0 ? 0 : numerator / denominator;
}

/**
 * Rounds lab-report numeric values to two decimals.
 */
function roundReportNumber(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Calculates a numeric average with an explicit empty fallback for reports.
 */
function average(values: readonly number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

/**
 * Calculates a nearest-rank percentile in deterministic sorted order.
 */
function percentile(values: readonly number[], rank: number): number {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort((left, right) => left - right);
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil(sorted.length * rank) - 1));

  return roundReportNumber(sorted[index] ?? 0);
}

if (!isMainThread && isLongRunGateWorkerData(workerData)) {
  try {
    parentPort?.postMessage(runLongRunGatePartition(workerData));
  } catch (error) {
    parentPort?.postMessage({
      ok: false,
      message: error instanceof Error ? error.message : String(error),
    } satisfies LongRunGateWorkerFailure);
  }
}
