import { createLineupSlot, type CanonicalPlayerRole } from "@game/engine";
import { longRunGateStatus } from "./long-run-gate-status.ts";
import { createHash } from "node:crypto";
import { isMainThread, parentPort, Worker, workerData } from "node:worker_threads";
import {
  createAnnualWorldIntakeCandidateProviders,
  createFakeDomesticWorld,
  resolveRareProdigyCurrentRatingGuardrail,
  resolveSeasonTransferWindows,
  seasonStartYearFromDate,
  selectAskingPriceCurves,
  selectMarketBehaviorCalibration,
  selectPlayerDevelopmentEnvironmentConfig,
  selectPlayerValuationConfig,
  selectPlayerWagePolicyConfig,
  type FakeDomesticWorld,
} from "@game/content";
import {
  FORMATION_CATALOG,
  accrueFixtureParticipationContributions,
  advanceCareerOneSeason,
  completedPlayerAge,
  createFreshCareerState,
  developPlayersFromParticipationRows,
  derivePlayerDevelopmentEnvironmentEvidence,
  deriveAiMarketTargetScore,
  deriveAiTransferAffordabilitySnapshot,
  deriveAiTransferOfferFee,
  derivePlayerWillingness,
  derivePlayerPotentialProjection,
  derivePlayerValuation,
  derivePublicPlayerAssessment,
  deriveTeamStrength,
  deriveTransferCommercialSnapshot,
  selectCareerActivePlayerStock,
  simulateSeason,
  summarizePlayerDevelopmentAbilities,
  type AdvanceCareerReportRefreshMode,
  type CareerActivePlayerStockEntry,
  type FormationKey,
  type LineupSlot,
  type RoleWeightProfile,
  type SimulateSeasonInput,
  type SimulateSeasonTeamInput,
  type SimulateSeasonResult,
} from "@game/engine";
import { createTranslator, type SupportedLanguage, type Translator } from "@game/i18n";
import { addCivilYears, fromISO, toISO } from "@game/shared";
import {
  createPlayerGenerationAnnualIntakeSummary,
  createPlayerDevelopmentCohortWorldSummary,
  createPlayerGenerationEconomyAudit,
  createPlayerMarketCalibrationReport,
  createPlayerPotentialOutcomeAudit,
  createLongRunAnomalyReport,
  createLongRunClubStabilityReport,
  createLongRunContractFinanceSeasonRow,
  createLongRunContractFinanceStabilityReport,
  createLongRunPlayerEvolutionReport,
  createLongRunYouthStabilityReport,
  LONG_RUN_ANOMALY_KEYS,
  longRunAnomalySemanticClass,
  mergePlayerDevelopmentCohortWorldSummaries,
  PLAYER_DEVELOPMENT_COHORT_CONTRACT_VERSION,
  resolveSimulationWorkerCount,
  runCareerLongRunSimulation,
  validatePlayerDevelopmentCohortAggregateSummary,
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
  type PlayerGenerationInitialRarityConstraints,
  type PlayerGenerationAnnualIntakeObservation,
  type PlayerGenerationAnnualIntakeSummary,
  type PlayerGenerationAiInformationParityObservation,
  type PlayerGenerationNegotiationObservation,
  type PlayerGenerationFreeAgentSigningObservation,
  type PlayerGenerationIntrinsicValueInvarianceObservation,
  type PlayerMarketCalibrationObservation,
  type PlayerMarketCalibrationReport,
  type PlayerMarketClubSquadObservation,
  type PlayerPotentialOutcomeAudit,
  type PlayerPotentialOutcomeObservation,
  type PlayerDevelopmentCheckpointObservation,
  type PlayerDevelopmentCohortAggregateSummary,
  type PlayerDevelopmentCohortWorldSummary,
  type PlayerDevelopmentParticipationObservation,
  type LongRunAnomalySemanticClass,
  type LongRunAnomalyStatus,
  type PotentialProjectionPolicyCalibrationBand,
  type SuppliedNegotiationAggregate,
} from "@game/simulation-tools";
import {
  careerStateFromNewWorld,
  competitionIdForClubInWorld,
} from "../career/scenarios.ts";
import type { CliCareerState, CliPlayer, CliSaveId } from "../career/types.ts";

/**
 * The footballer-identity role, read off the player the CLI already has.
 *
 * Taken from `CliPlayer` rather than imported from `@game/domain`, which the
 * CLI is not allowed to reach into directly. It is also the tighter type: the
 * template roles below are matched against this exact field, so deriving it
 * from the field makes a mismatch impossible to write.
 */
type PlayerRole = CliPlayer["primaryRole"];

type Phase79CCalibrationVersions = FakeDomesticWorld["calibrationVersions"];
type Phase80AValuationConfig = ReturnType<typeof selectPlayerValuationConfig>;
type Phase79CClubId = CliCareerState["gameState"]["clubIds"][number];
type Phase79CPlayerId = CliCareerState["gameState"]["playerIds"][number];
type PotentialOutcomeFixtureId =
  CliCareerState["gameState"]["fixtureIds"][number];
type Phase80ATransferNegotiationState =
  NonNullable<CliCareerState["transferNegotiationState"]>;
type Phase80ATransferNegotiation =
  Phase80ATransferNegotiationState["negotiations"][
    Phase80ATransferNegotiationState["negotiationIds"][number]
  ];
type Phase80AExceptionalStockSnapshotObservation = NonNullable<
  Parameters<typeof createPlayerGenerationEconomyAudit>[0]["exceptionalStockSnapshots"]
>[number];
type Phase80AOutfieldTemplateDepartment = "attacker" | "defender" | "midfielder";
type CliPlayerParticipationRow = NonNullable<
  CliCareerState["playerParticipationLedger"]
>["rows"][string];

/** Candidate pool size per club for long-run squad maintenance stress tests. */
const LONG_RUN_INTAKE_CANDIDATES_PER_CLUB = 8;

/** Minimum club goals needed before creator-share ratios are structurally meaningful. */
const MIN_GOALS_FOR_CREATOR_SHARE = 40;

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

/** Reproducibility metadata and report for the development-outcome matrix. */
export interface Phase80APotentialOutcomeCalibration {
  readonly seedPrefix: "phase80a-potential-outcome";
  readonly sampleStreamsPerCell: 5;
  readonly startAgeMinimum: 15;
  readonly startAgeMaximum: 32;
  readonly finalAge: 35;
  /** Distinct source templates selected for the declared 4-4-2-style mix. */
  readonly outfieldTemplateSelections: readonly {
    readonly playerId: string;
    readonly primaryRole: PlayerRole;
    readonly department: Phase80AOutfieldTemplateDepartment;
  }[];
  readonly participationMinutesPerMonth: Readonly<Record<
    PlayerPotentialOutcomeObservation["participationBand"],
    number
  >>;
  readonly projectionPolicyCalibration:
    readonly PotentialProjectionPolicyCalibrationBand[];
  readonly audit: PlayerPotentialOutcomeAudit;
}

/** Minimal deterministic season facts retained by the CLI long-run report. */
/**
 * Optional hooks that let one inspection run vary shapes and read seasons.
 *
 * Both are absent for every carried report. With no `formationForClub` the
 * season input is byte-identical to what it always was, so the `goals_per_match`
 * monitor and every other carried number stay comparable; with no
 * `observeSeasonResult` nothing retains a full `SimulateSeasonResult`, which is
 * what keeps the 750-world gate inside its memory budget.
 *
 * `observeSeasonResult` fires for the selected competition only, before the
 * post-season career refresh, and must stay read-only.
 */
export interface CareerWorldInspection {
  /** Let the canonical AI selector choose from the whole catalog each fixture. */
  readonly selectCatalogFormation?: boolean;
  /** Shape a club fields, replacing the report's fixed `4-4-2`. */
  readonly formationForClub?: (clubId: string) => FormationKey;
  /** Receives each completed selected-competition season. */
  readonly observeSeasonResult?: (context: {
    readonly seasonNumber: number;
    readonly seasonSeed: string;
    readonly result: SimulateSeasonResult;
    readonly careerState: CliCareerState;
    /** Generated world, so an observer can resolve club display names. */
    readonly league: FakeDomesticWorld;
  }) => void;
  /** Reads durable post-rollover facts at the boundary where they were written. */
  readonly observeSeasonBoundary?: (context: {
    readonly seasonNumber: number;
    readonly previousCareerState: CliCareerState;
    readonly careerState: CliCareerState;
  }) => void;
}

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

/** Descriptive exceptional-rating stock at one retained career checkpoint. */
export interface ExceptionalRatingStockSnapshot {
  readonly currentFiveAndHalfCount: number;
  readonly currentSixCount: number;
  readonly storedCeilingSixCount: number;
  readonly lowerDivisionStoredCeilingSixCount: number;
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

/**
 * The two canonical observation snapshots one world's economy audit is built
 * from, kept apart instead of pre-merged.
 *
 * The audit is handed a single flat list and returns only aggregates, so a
 * caller that wants per-snapshot facts - "did the opening population already
 * hold this, or did ten seasons of growth produce it?" - cannot recover them
 * from the audit afterwards. Splitting the aggregate back in two is impossible,
 * and rebuilding one half independently would measure a second derivation
 * rather than the one the audit actually counted.
 *
 * `hardCapMinorUnits` travels with the observations for the same reason. Any
 * consumer banding values against the cap must use the exact number the audit
 * counted with; re-deriving it from the career state would agree today and
 * could silently stop agreeing the moment the report changes which config it
 * reads.
 */
export interface PlayerEconomyObservationSnapshots {
  /** Observations taken on the freshly generated world, before any season. */
  readonly opening: readonly PlayerGenerationEconomyObservation[];
  /** Observations taken on the closing career state, after every season. */
  readonly closing: readonly PlayerGenerationEconomyObservation[];
  /** Exact public-value hard cap both snapshots were measured against. */
  readonly hardCapMinorUnits: number;
}

/** Complete report bundle for one deterministic career world. */
export interface CareerWorldFacts {
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
  /** Joint player/range/value/cap/negotiation facts for current economy gates. */
  readonly playerEconomyAudit: PlayerGenerationEconomyAudit;
  /** The exact two snapshots `playerEconomyAudit` above was computed from. */
  readonly playerEconomyObservationSnapshots: PlayerEconomyObservationSnapshots;
  /** Closing senior population retained for one cohort-level value fit. */
  readonly closingPlayerMarketObservations:
    readonly PlayerMarketCalibrationObservation[];
  /** Closing club values normalized to the source comparator's 22 seniors. */
  readonly closingPlayerMarketClubSquadObservations:
    readonly PlayerMarketClubSquadObservation[];
  /** Exact season-ten stock; absent when the requested run ends earlier. */
  readonly yearTenExceptionalRatingStock?: ExceptionalRatingStockSnapshot;
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
  /** Exact season-ten exceptional-rating stock when that boundary was reached. */
  readonly yearTenRatingStock?: ExceptionalRatingStockSnapshot;
  /** Whether this world actually reached the season-ten boundary. */
  readonly yearTenRatingStockObservationCount: 0 | 1;
  /** Non-vacuous player-economy gates retained without full observations. */
  readonly playerEconomyGates: readonly PlayerGenerationEconomyGate[];
  /** Exact closing senior facts aggregated before percentile evaluation. */
  readonly closingPlayerMarketObservations:
    readonly PlayerMarketCalibrationObservation[];
  /** Exact closing normalized club facts retained with the same checkpoint. */
  readonly closingPlayerMarketClubSquadObservations:
    readonly PlayerMarketClubSquadObservation[];
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
export interface LongRunGateFacts {
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
  /** Binary gate outcome including world-local and cohort-level evidence. */
  readonly status: "pass" | "fail";
  /** Total violations across the aggregated player-economy gates. */
  readonly playerEconomyViolationCount: number;
  /** Worlds that actually reached and observed the season-ten stock boundary. */
  readonly yearTenRatingStockObservationCount: number;
  /** Aggregated player-economy gate observations and non-pass world counts. */
  readonly playerEconomyGates: readonly LongRunGatePlayerEconomyGateSummary[];
  /** Cohort-level fit for the explicitly named closing checkpoint population. */
  readonly closingPlayerMarketCalibration: PlayerMarketCalibrationReport;
  /** Failed percentile/max checks in the closing division-value fit. */
  readonly closingDivisionValueFitViolationCount: number;
  /** Highest year-ten current-six stock, or null without year-ten evidence. */
  readonly yearTenCurrentSixMaximumObserved: number | null;
  /** Highest year-ten stored-ceiling-six stock, or null without year-ten evidence. */
  readonly yearTenStoredCeilingSixMaximumObserved: number | null;
  /** Highest lower-division stored-ceiling-six stock, or null without year-ten evidence. */
  readonly yearTenLowerDivisionStoredCeilingSixMaximumObserved: number | null;
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

/** Cohort aggregate for one stable player/economy gate key. */
export interface LongRunGatePlayerEconomyGateSummary {
  readonly key: string;
  readonly observationCount: number;
  readonly violationCount: number;
  readonly failedWorldCount: number;
  readonly notEvaluatedWorldCount: number;
  readonly threshold: string;
  /** Additive numerator when this is a cohort-level share gate. */
  readonly matchingObservationCount?: number;
  /** Combined cohort share in basis points when its denominator is positive. */
  readonly shareBasisPoints?: number;
  /** Additive positive evidence owned by the cohort rather than one world. */
  readonly cohortEvidenceObservationCount?: number;
  /** Frozen minimum positive-evidence count required across the cohort. */
  readonly minimumCohortEvidenceObservationCount?: number;
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
  /** World summaries loaded from validated checkpoints. */
  readonly resumedWorldCount: number;
  /** World summaries simulated during this invocation. */
  readonly simulatedWorldCount: number;
}

/** Input for the explicit long-run gate report. */
export interface CreateLongRunGateFactsInput {
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
export interface CreateLongRunGateFactsFromWorldsInput {
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

/** Aggregate anomaly evidence retained by the compact development report. */
export interface PlayerDevelopmentCohortAnomalyCheckCount {
  readonly key: string;
  readonly semanticClass: LongRunAnomalySemanticClass;
  readonly rawStatusCounts: Readonly<Record<LongRunAnomalyStatus, number>>;
  readonly worldGateStatusCounts: Readonly<Record<LongRunAnomalyStatus, number>>;
}

/** Final compact report for the frozen Phase 80A 750x3 cohort. */
export interface PlayerDevelopmentCohortFacts {
  readonly reportKind: "player-development-cohort";
  readonly diagnosticContractVersion:
    typeof PLAYER_DEVELOPMENT_COHORT_CONTRACT_VERSION;
  readonly seedPrefix: string;
  readonly worldCount: number;
  readonly seasonCount: number;
  readonly totalSeasonCount: number;
  readonly status: "pass" | "fail";
  readonly execution: LongRunGateExecutionSummary;
  readonly aggregate: PlayerDevelopmentCohortAggregateSummary;
  readonly anomalyCheckCounts:
    readonly PlayerDevelopmentCohortAnomalyCheckCount[];
  /** SHA-256 of the complete canonical aggregate evidence, excluding execution metadata. */
  readonly finalAggregateHash: string;
}

/** Inputs for aggregating validated compact development-world summaries. */
export interface CreatePlayerDevelopmentCohortFactsFromWorldsInput {
  readonly seedPrefix: string;
  readonly worldCount: number;
  readonly seasonCount: number;
  readonly execution: LongRunGateExecutionSummary;
  readonly worlds: readonly PlayerDevelopmentCohortWorldSummary[];
}

/** Inputs for finalizing an already-folded development cohort. */
export interface CreatePlayerDevelopmentCohortFactsFromAggregateInput {
  readonly seedPrefix: string;
  readonly worldCount: number;
  readonly seasonCount: number;
  readonly execution: LongRunGateExecutionSummary;
  readonly aggregate: PlayerDevelopmentCohortAggregateSummary;
  readonly anomalyCheckCounts:
    readonly PlayerDevelopmentCohortAnomalyCheckCount[];
}

/** Serializable one-world worker input for the development cohort. */
export interface PlayerDevelopmentCohortWorkerData {
  readonly seedPrefix: string;
  readonly seasonCount: number;
  readonly language: SupportedLanguage;
  readonly worldIndex: number;
}

/** Successful one-world response from a development-cohort worker. */
export interface PlayerDevelopmentCohortWorkerSuccess {
  readonly ok: true;
  readonly worldIndex: number;
  readonly world: PlayerDevelopmentCohortWorldSummary;
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

type PlayerDevelopmentCohortWorkerMessage =
  | PlayerDevelopmentCohortWorkerSuccess
  | LongRunGateWorkerFailure;

/**
 * Builds one compact three-season development world from canonical gameplay.
 *
 * Raw players and monthly rows exist only while the audit owner composes this
 * summary. The returned object is safe for one-world checkpoint persistence.
 */
export function createPlayerDevelopmentCohortWorld(
  seed: string,
  seasonCount: number,
  text: Translator,
): PlayerDevelopmentCohortWorldSummary {
  const participation: PlayerDevelopmentParticipationObservation[] = [];
  let openingCareerState: CliCareerState | undefined;
  const report = createCareerWorldFacts(
    seed,
    seasonCount,
    text,
    (seasonNumber, rows, careerState) => {
      const evidence = derivePlayerDevelopmentEnvironmentEvidence({
        careerState,
        participationRows: rows,
        developmentEnvironmentConfig:
          selectPlayerDevelopmentEnvironmentConfig(
            careerState.gameState.meta.calibrationVersions,
          ),
      });
      for (let index = 0; index < rows.length; index += 1) {
        const row = rows[index];
        const environment = evidence[index];
        if (row === undefined || environment?.rowKey !== row.rowKey) {
          throw new Error(
            `Player-development environment evidence lost row order in ${seed}`,
          );
        }
        participation.push({
          observationId: `${seed}|season-${seasonNumber}|${row.rowKey}`,
          playerId: String(row.playerId),
          seasonIndex: seasonNumber,
          monthKey: row.monthKey,
          minutes: row.minutes,
          ratingTotal: row.ratingTotal,
          ratingSamples: row.ratingSamples,
          positiveGrowthEnvironmentBasisPoints:
            environment.sourceMinutes === 0
              ? null
              : environment.positiveGrowthEnvironmentBasisPoints,
        });
      }
    },
    (careerState) => {
      openingCareerState = careerState;
    },
  );
  if (openingCareerState === undefined) {
    throw new Error(`Player-development opening checkpoint was not captured: ${seed}`);
  }

  return createPlayerDevelopmentCohortWorldSummary({
    worldId: seed,
    completedRolloverCount: seasonCount,
    opening: playerDevelopmentCheckpointObservations({
      seed,
      checkpoint: "opening",
      careerState: openingCareerState,
    }),
    closing: playerDevelopmentCheckpointObservations({
      seed,
      checkpoint: "closing",
      careerState: report.finalCareerState,
    }),
    participation,
    anomalyChecks: report.anomalyReport.checks,
  });
}

/** Projects exact active stock into the audit's opening/closing checkpoint. */
function playerDevelopmentCheckpointObservations(input: {
  readonly seed: string;
  readonly checkpoint: "opening" | "closing";
  readonly careerState: CliCareerState;
}): readonly PlayerDevelopmentCheckpointObservation[] {
  const valuationConfig = selectPlayerValuationConfig(
    input.careerState.gameState.meta.calibrationVersions,
  );
  const economyByPlayerId = new Map(
    phase80AActiveCareerObservations({
      seed: input.seed,
      seasonStartYear: seasonStartYearFromDate(
        input.careerState.gameState.calendar.currentDate,
      ),
      careerState: input.careerState,
      valuationConfig,
    }).map((observation) => [observation.playerId, observation] as const),
  );

  return selectCareerActivePlayerStock(input.careerState).map((stockEntry) => {
    const player = input.careerState.gameState.players[stockEntry.playerId];
    const economy = economyByPlayerId.get(String(stockEntry.playerId));
    if (player === undefined || economy === undefined) {
      throw new Error(
        `Player-development checkpoint is incomplete: ${stockEntry.playerId}`,
      );
    }
    const projection = derivePlayerPotentialProjection({
      player,
      currentDate: input.careerState.gameState.calendar.currentDate,
      policy: valuationConfig.potentialProjectionPolicy,
      ratingScale: valuationConfig.ratingScale,
    });
    return {
      observationId:
        `${input.seed}|${input.checkpoint}|${String(stockEntry.playerId)}`,
      playerId: String(stockEntry.playerId),
      age: projection.age,
      population: stockEntry.source,
      currentAbility: projection.currentAbility,
      publicP50Ability: projection.p50Ability,
      publicUpperAbility: projection.upperAbility,
      storedCeilingAbility: projection.storedCeilingAbility,
      currentRating: projection.currentRating,
      publicP50Rating: projection.p50Rating,
      publicUpperRating: projection.upperRating,
      storedCeilingRating: projection.storedCeilingRating,
      publicValueMinorUnits: economy.publicValueMinorUnits,
      askingFeeMinorUnits: economy.askingPriceMinorUnits ?? null,
    };
  });
}

/** Aggregates validated one-world development summaries in stable world order. */
export function createPlayerDevelopmentCohortFactsFromWorlds(
  input: CreatePlayerDevelopmentCohortFactsFromWorldsInput,
): PlayerDevelopmentCohortFacts {
  if (input.worlds.length !== input.worldCount) {
    throw new Error(
      `Player-development cohort expected ${input.worldCount} worlds but received ${input.worlds.length}`,
    );
  }
  const worlds = [...input.worlds].sort((left, right) =>
    left.worldId.localeCompare(right.worldId)
  );
  for (let index = 0; index < worlds.length; index += 1) {
    const expectedWorldId = `${input.seedPrefix}-world-${String(index + 1).padStart(5, "0")}`;
    if (worlds[index]?.worldId !== expectedWorldId) {
      throw new Error(
        `Player-development cohort world order mismatch: expected ${expectedWorldId}`,
      );
    }
  }
  const aggregate = mergePlayerDevelopmentCohortWorldSummaries(worlds);
  const anomalyCheckCounts = aggregateDevelopmentAnomalyChecks(worlds);
  return createPlayerDevelopmentCohortFactsFromAggregate({
    seedPrefix: input.seedPrefix,
    worldCount: input.worldCount,
    seasonCount: input.seasonCount,
    execution: input.execution,
    aggregate,
    anomalyCheckCounts,
  });
}

/** Finalizes folded evidence without retaining every one-world payload. */
export function createPlayerDevelopmentCohortFactsFromAggregate(
  input: CreatePlayerDevelopmentCohortFactsFromAggregateInput,
): PlayerDevelopmentCohortFacts {
  validatePlayerDevelopmentCohortAggregateSummary(input.aggregate);
  if (input.aggregate.worldCount !== input.worldCount) {
    throw new Error(
      `Player-development aggregate expected ${input.worldCount} worlds but contains ${input.aggregate.worldCount}`,
    );
  }
  validatePlayerDevelopmentCohortAnomalyCheckCounts(
    input.anomalyCheckCounts,
    input.worldCount,
  );
  const finalAggregateHash = hashPlayerDevelopmentCohortAggregateEvidence({
    aggregate: input.aggregate,
    anomalyCheckCounts: input.anomalyCheckCounts,
  });
  const hasGateFailure = input.aggregate.gates.some(
    ({ status, failedWorldCount, notEvaluatedWorldCount }) =>
      status !== "pass"
      || failedWorldCount > 0
      || notEvaluatedWorldCount > 0,
  );

  return {
    reportKind: "player-development-cohort",
    diagnosticContractVersion:
      PLAYER_DEVELOPMENT_COHORT_CONTRACT_VERSION,
    seedPrefix: input.seedPrefix,
    worldCount: input.worldCount,
    seasonCount: input.seasonCount,
    totalSeasonCount: input.worldCount * input.seasonCount,
    status:
      hasGateFailure || input.aggregate.worldGateAnomalyStatusCounts.fail > 0
        ? "fail"
        : "pass",
    execution: input.execution,
    aggregate: input.aggregate,
    anomalyCheckCounts: input.anomalyCheckCounts,
    finalAggregateHash,
  };
}

/**
 * Hashes only complete aggregate evidence, so fresh and resumed executions
 * remain directly comparable even though their execution counters differ.
 */
function hashPlayerDevelopmentCohortAggregateEvidence(evidence: {
  readonly aggregate: PlayerDevelopmentCohortAggregateSummary;
  readonly anomalyCheckCounts:
    readonly PlayerDevelopmentCohortAnomalyCheckCount[];
}): string {
  return createHash("sha256")
    .update(JSON.stringify(evidence))
    .digest("hex");
}

/** Stable full-payload hash used by one-world development checkpoints. */
export function hashPlayerDevelopmentCohortWorldSummary(
  world: PlayerDevelopmentCohortWorldSummary,
): string {
  return createHash("sha256")
    .update(JSON.stringify(world))
    .digest("hex")
    .slice(0, 16);
}

/** Starts one Node worker for one compact development world. */
export function runPlayerDevelopmentCohortWorkerThread(
  input: PlayerDevelopmentCohortWorkerData,
): Promise<PlayerDevelopmentCohortWorkerSuccess> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL("./career-world-facts.ts", import.meta.url), {
      workerData: {
        reportKind: "player-development-cohort",
        ...input,
      },
    });
    worker.once("message", (message: PlayerDevelopmentCohortWorkerMessage) => {
      if (message.ok) {
        resolve(message);
        return;
      }
      reject(new Error(message.message));
    });
    worker.once("error", reject);
    worker.once("exit", (code) => {
      if (code !== 0) {
        reject(new Error(`Player-development cohort worker exited with code ${code}`));
      }
    });
  });
}

export function aggregateDevelopmentAnomalyChecks(
  worlds: readonly PlayerDevelopmentCohortWorldSummary[],
): readonly PlayerDevelopmentCohortAnomalyCheckCount[] {
  const byKey = new Map<string, PlayerDevelopmentCohortAnomalyCheckCount>();
  for (const world of worlds) {
    for (const check of world.anomalyChecks) {
      const current = byKey.get(check.key) ?? {
        key: check.key,
        semanticClass: check.semanticClass,
        rawStatusCounts: emptyAnomalyStatusCounts(),
        worldGateStatusCounts: emptyAnomalyStatusCounts(),
      };
      if (current.semanticClass !== check.semanticClass) {
        throw new Error(`Anomaly semantic class drifted for ${check.key}`);
      }
      byKey.set(check.key, {
        ...current,
        rawStatusCounts: incrementAnomalyStatus(
          current.rawStatusCounts,
          check.status,
        ),
        worldGateStatusCounts: incrementAnomalyStatus(
          current.worldGateStatusCounts,
          check.worldGateStatus,
        ),
      });
    }
  }
  return [...byKey.values()].sort((left, right) =>
    left.key.localeCompare(right.key)
  );
}

/** Adds compact per-key anomaly counters while preserving semantic classes. */
export function mergePlayerDevelopmentCohortAnomalyCheckCounts(
  groups: readonly (readonly PlayerDevelopmentCohortAnomalyCheckCount[])[],
): readonly PlayerDevelopmentCohortAnomalyCheckCount[] {
  const byKey = new Map<string, PlayerDevelopmentCohortAnomalyCheckCount>();
  for (const group of groups) {
    for (const check of group) {
      const current = byKey.get(check.key) ?? {
        key: check.key,
        semanticClass: check.semanticClass,
        rawStatusCounts: emptyAnomalyStatusCounts(),
        worldGateStatusCounts: emptyAnomalyStatusCounts(),
      };
      if (current.semanticClass !== check.semanticClass) {
        throw new Error(`Anomaly semantic class drifted for ${check.key}`);
      }
      byKey.set(check.key, {
        ...current,
        rawStatusCounts: sumAnomalyStatusCounts(
          current.rawStatusCounts,
          check.rawStatusCounts,
        ),
        worldGateStatusCounts: sumAnomalyStatusCounts(
          current.worldGateStatusCounts,
          check.worldGateStatusCounts,
        ),
      });
    }
  }
  return [...byKey.values()].sort((left, right) =>
    left.key.localeCompare(right.key)
  );
}

function sumAnomalyStatusCounts(
  left: Readonly<Record<LongRunAnomalyStatus, number>>,
  right: Readonly<Record<LongRunAnomalyStatus, number>>,
): Readonly<Record<LongRunAnomalyStatus, number>> {
  return {
    pass: left.pass + right.pass,
    warn: left.warn + right.warn,
    fail: left.fail + right.fail,
  };
}

function validatePlayerDevelopmentCohortAnomalyCheckCounts(
  rows: readonly PlayerDevelopmentCohortAnomalyCheckCount[],
  worldCount: number,
): void {
  const expectedKeys = [...LONG_RUN_ANOMALY_KEYS].sort((left, right) =>
    left.localeCompare(right)
  );
  if (rows.length !== expectedKeys.length) {
    throw new Error("Player-development anomaly counts are incomplete");
  }
  for (let index = 0; index < expectedKeys.length; index += 1) {
    const row = rows[index];
    const expectedKey = expectedKeys[index];
    if (
      row === undefined
      || expectedKey === undefined
      || row.key !== expectedKey
      || !hasExactObjectKeys(row, [
        "key",
        "semanticClass",
        "rawStatusCounts",
        "worldGateStatusCounts",
      ])
      || row.semanticClass !== longRunAnomalySemanticClass(expectedKey)
      || !isCompleteAnomalyStatusCounts(row.rawStatusCounts, worldCount)
      || !isCompleteAnomalyStatusCounts(row.worldGateStatusCounts, worldCount)
    ) {
      throw new Error(
        `Player-development anomaly count is invalid: ${expectedKey}`,
      );
    }
  }
}

function isCompleteAnomalyStatusCounts(
  value: Readonly<Record<LongRunAnomalyStatus, number>>,
  worldCount: number,
): boolean {
  return hasExactObjectKeys(value, ["pass", "warn", "fail"])
    && Object.values(value).every(
      (count) => Number.isSafeInteger(count) && count >= 0,
    )
    && value.pass + value.warn + value.fail === worldCount;
}

function hasExactObjectKeys(
  value: object,
  expectedKeys: readonly string[],
): boolean {
  const actualKeys = Object.keys(value);
  return actualKeys.length === expectedKeys.length
    && expectedKeys.every((key) => Object.hasOwn(value, key));
}

function emptyAnomalyStatusCounts(): Record<LongRunAnomalyStatus, number> {
  return { pass: 0, warn: 0, fail: 0 };
}

function incrementAnomalyStatus(
  counts: Readonly<Record<LongRunAnomalyStatus, number>>,
  status: LongRunAnomalyStatus,
): Readonly<Record<LongRunAnomalyStatus, number>> {
  return { ...counts, [status]: counts[status] + 1 };
}

/**
 * The exact observation list the economy audit is fed, in the exact order.
 *
 * One definition of "what the audit saw", so that anything counting the two
 * snapshots separately adds up to the audit's totals by construction rather
 * than by a coincidence that has to be re-checked whenever either side moves.
 */
export function auditedPlayerEconomyObservations(
  snapshots: PlayerEconomyObservationSnapshots,
): readonly PlayerGenerationEconomyObservation[] {
  return [...snapshots.opening, ...snapshots.closing];
}

/**
 * Builds the full single-world report bundle used by both normal output and
 * long-run batch gates. Keeping one path avoids report drift.
 */
export function createCareerWorldFacts(
  seed: string,
  seasonCount: number,
  text: Translator,
  observeParticipationRows?: (
    seasonNumber: number,
    rows: readonly CliPlayerParticipationRow[],
    careerState: CliCareerState,
  ) => void,
  observeOpeningCareerState?: (careerState: CliCareerState) => void,
  inspection?: CareerWorldInspection,
): CareerWorldFacts {
  const league = createFakeDomesticWorld({ worldSeed: seed });
  const initialCareerState = careerStateFromNewWorld("save:simulation-report" as CliSaveId, league, seed);
  observeOpeningCareerState?.(initialCareerState);
  const annualIntakeObservations: PlayerGenerationAnnualIntakeObservation[] = [];
  const canonicalFreeAgentSigningObservations:
    PlayerGenerationFreeAgentSigningObservation[] = [];
  const initialObservations = phase80AInitialWorldObservations(seed, league);
  const exceptionalStockSnapshots: Phase80AExceptionalStockSnapshotObservation[] = [
    phase80AExceptionalStockSnapshot({
      seed,
      seasonIndex: 0,
      targetYoungStoredCeilingSixCount:
        league.exceptionalAllocation.youngPotentialSixPlayerKeys.length,
      careerState: initialCareerState,
      observations: initialObservations,
    }),
  ];
  let yearTenCareerState: CliCareerState | undefined;
  const usefulLowerDivisionAbilityThreshold =
    lowerDivisionUsefulAbilityThreshold(initialCareerState);
  const report = runCareerLongRunSimulation({
    seed,
    seasonCount,
    initialCareerState,
    retainSeasonResult: retainLongRunSeasonResult,
    createSeasonInput: ({ seasonSeed, careerState }) =>
      createDomesticCareerSeasonInput(league, careerState as CliCareerState, seasonSeed, inspection),
    advanceCareerState: (context) =>
      advanceCareerForReport(
        league,
        seed,
        context,
        annualIntakeObservations,
        exceptionalStockSnapshots,
        canonicalFreeAgentSigningObservations,
        observeParticipationRows,
        inspection,
      ),
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
  const finalObservations = phase80AActiveCareerObservations({
    seed,
    seasonStartYear: seasonStartYearFromDate(
      finalCareerState.gameState.calendar.currentDate,
    ),
    careerState: finalCareerState,
    valuationConfig,
  });
  const closingPlayerMarketEvidence = phase80AClosingPlayerMarketEvidence(
    finalCareerState,
    finalObservations,
  );
  // Built here rather than by a factory: the two sets are produced at opposite
  // ends of this function, so anything that derived both would rebuild the
  // opening set the exceptional-stock snapshot already used.
  const playerEconomyObservationSnapshots: PlayerEconomyObservationSnapshots = {
    opening: initialObservations,
    closing: finalObservations,
    hardCapMinorUnits:
      valuationConfig.valuationCurves.upperTail.hardCapMinorUnits,
  };
  const playerEconomyAudit = createPlayerGenerationEconomyAudit({
    observations: auditedPlayerEconomyObservations(
      playerEconomyObservationSnapshots,
    ),
    negotiationObservations: phase80ANegotiationObservations({
      seed,
      seasonStartDate: league.seasonStartDate,
      careerState: finalCareerState,
    }),
    hardCapMinorUnits: playerEconomyObservationSnapshots.hardCapMinorUnits,
    initialRarityConstraints: initialRarityAuditConstraints(
      valuationConfig.ratingScale.rarity.initialWorld,
    ),
    annualIntakeObservations,
    exceptionalStockSnapshots,
    intrinsicValueInvarianceObservations:
      phase80AIntrinsicValueInvarianceObservations({
        seed,
        careerState: finalCareerState,
        valuationConfig,
        observations: finalObservations,
      }),
    freeAgentSigningObservations: phase80AFreeAgentSigningObservations({
      seed,
      careerState: finalCareerState,
      canonicalSeasonSignings: canonicalFreeAgentSigningObservations,
    }),
    aiInformationParityObservations:
      phase80AAiInformationParityObservations({
        seed,
        careerState: finalCareerState,
        valuationConfig,
      }),
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
    playerEconomyObservationSnapshots,
    closingPlayerMarketObservations:
      closingPlayerMarketEvidence.observations,
    closingPlayerMarketClubSquadObservations:
      closingPlayerMarketEvidence.clubSquadObservations,
    ...(yearTenCareerState === undefined
      ? {}
      : {
          yearTenExceptionalRatingStock:
            summarizeExceptionalRatingStock(
              yearTenCareerState,
              selectPlayerValuationConfig(
                requireCalibrationVersions(yearTenCareerState),
              ),
            ),
        }),
    strengthHierarchy: summarizeClubAbilityHierarchy(league, initialCareerState, report.finalCareerState as CliCareerState),
  };
}

/**
 * Adapts the Phase 80A age-separated stock contract to the legacy aggregate
 * audit shape without letting a public projection redefine stored rarity.
 */
function initialRarityAuditConstraints(
  rarity: Phase80AValuationConfig["ratingScale"]["rarity"]["initialWorld"],
): PlayerGenerationInitialRarityConstraints {
  return {
    establishedCurrentSixMinimum: rarity.establishedCurrentSixMinimum,
    establishedCurrentSixMaximum: rarity.establishedCurrentSixMaximum,
    youngStoredCeilingSixMinimum: rarity.youngStoredCeilingSixMinimum,
    youngStoredCeilingSixMaximum: rarity.youngStoredCeilingSixMaximum,
    lowerDivisionYoungStoredCeilingSixMaximum:
      rarity.lowerDivisionYoungStoredCeilingSixMaximum,
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
export async function createLongRunGateFacts(input: CreateLongRunGateFactsInput): Promise<LongRunGateFacts> {
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
    resumedWorldCount: 0,
    simulatedWorldCount: input.worldCount,
  };

  return createLongRunGateFactsFromWorlds({
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
  input: Pick<CreateLongRunGateFactsInput, "workerCount" | "worldCount">,
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
    const worker = new Worker(new URL("./career-world-facts.ts", import.meta.url), {
      workerData: {
        reportKind: "long-run-gate",
        ...input,
      },
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
      const report = createCareerWorldFacts(seed, input.seasonCount, text);
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
  const input = value as (LongRunGateWorkerData & {
    readonly reportKind?: string;
  }) | undefined;

  return (
    input !== undefined &&
    input.reportKind === "long-run-gate" &&
    typeof input.seedPrefix === "string" &&
    Number.isSafeInteger(input.seasonCount) &&
    Number.isSafeInteger(input.startIndex) &&
    Number.isSafeInteger(input.endIndex) &&
    typeof input.language === "string"
  );
}

function isPlayerDevelopmentCohortWorkerData(
  value: unknown,
): value is PlayerDevelopmentCohortWorkerData & {
  readonly reportKind: "player-development-cohort";
} {
  const input = value as (PlayerDevelopmentCohortWorkerData & {
    readonly reportKind?: string;
  }) | undefined;
  return input !== undefined
    && input.reportKind === "player-development-cohort"
    && typeof input.seedPrefix === "string"
    && Number.isSafeInteger(input.seasonCount)
    && Number.isSafeInteger(input.worldIndex)
    && typeof input.language === "string";
}

function runPlayerDevelopmentCohortWorker(
  input: PlayerDevelopmentCohortWorkerData,
): PlayerDevelopmentCohortWorkerSuccess {
  const seed = `${input.seedPrefix}-world-${String(input.worldIndex).padStart(5, "0")}`;
  try {
    return {
      ok: true,
      worldIndex: input.worldIndex,
      world: createPlayerDevelopmentCohortWorld(
        seed,
        input.seasonCount,
        createTranslator(input.language),
      ),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Player-development cohort world ${input.worldIndex} (${seed}) failed: ${message}`,
      { cause: error },
    );
  }
}

/**
 * Extracts compact world-level gate metrics from one full report bundle.
 */
function summarizeGateWorld(report: CareerWorldFacts): LongRunGateWorldSummary {
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
  const yearTenRatingStock = report.yearTenExceptionalRatingStock;
  const yearTenRatingStockObservationCount =
    report.yearTenExceptionalRatingStock === undefined ? 0 : 1;
  const failedPlayerEconomyGates = report.playerEconomyAudit.gates.filter(
    (gate) =>
      gate.status === "fail"
      || (
        gate.status === "not_evaluated"
        && gate.cohortShareEvidence === undefined
        && gate.cohortMinimumEvidence === undefined
      ),
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
    ...(yearTenRatingStock === undefined ? {} : { yearTenRatingStock }),
    yearTenRatingStockObservationCount,
    playerEconomyGates: report.playerEconomyAudit.gates,
    closingPlayerMarketObservations:
      report.closingPlayerMarketObservations,
    closingPlayerMarketClubSquadObservations:
      report.closingPlayerMarketClubSquadObservations,
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
      freeAgentZeroFeeViolationCount > 0
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
      ...(freeAgentZeroFeeViolationCount > 0
        ? ["phase79c_free_agent_non_zero_fee"]
        : []),
      ...failedPlayerEconomyGates.map(
        ({ key }) => `player_economy_${key}`,
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
 * Runs the existing engine development and aging owners over the complete
 * Phase 80A age/role/room/participation calibration matrix.
 *
 * The adapter constructs only deterministic input state. It intentionally owns
 * no growth, decline, realization, role weighting, or potential formula.
 */
export function createPhase80APotentialOutcomeCalibration(): Phase80APotentialOutcomeCalibration {
  const seedPrefix = "phase80a-potential-outcome";
  const sourceWorld = createFakeDomesticWorld({
    worldSeed: `${seedPrefix}-templates`,
  });
  const sourceCareer = careerStateFromNewWorld(
    "save:phase80a-potential-templates" as CliSaveId,
    sourceWorld,
    `${seedPrefix}-templates`,
  );
  const outfieldTemplates = selectPhase80AOutfieldTemplates(
    sourceWorld,
    PHASE_80A_OUTFIELD_TEMPLATE_ROLES,
  );
  const outfieldTemplateSelections = outfieldTemplates.map((player, index) => {
    const department = phase80AOutfieldTemplateDepartment(player);
    if (department === "goalkeeper") {
      throw new Error(
        `Phase 80A outfield template ${String(player.id)} cannot be a goalkeeper`,
      );
    }
    return {
      playerId: String(player.id),
      primaryRole: PHASE_80A_OUTFIELD_TEMPLATE_ROLES[index] as PlayerRole,
      department,
    };
  });
  const goalkeeper = sourceWorld.playerIds
    .map((playerId) => sourceWorld.players[playerId])
    .find((player) => player?.naturalPositions[0] === "gk");
  if (goalkeeper === undefined) {
    throw new Error("Phase 80A development matrix requires a goalkeeper template");
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

  for (let startAge = 15; startAge <= 32; startAge += 1) {
    for (const roleGroup of ["outfield", "goalkeeper"] as const) {
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
            const template = roleGroup === "goalkeeper"
              ? goalkeeper
              : outfieldTemplates[stream - 1]!;
            observations.push(runPhase80APotentialOutcome({
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
      startAges: Array.from({ length: 18 }, (_, index) => index + 15),
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
    startAgeMaximum: 32,
    finalAge: 35,
    outfieldTemplateSelections,
    participationMinutesPerMonth: participationMinutes,
    projectionPolicyCalibration: audit.projectionPolicyCalibration,
    audit,
  };
}

/**
 * The five outfield roles the calibration matrix measures, named explicitly.
 *
 * Two defenders, two midfielders and one attacker sample a conventional 4-4-2
 * outfield: a centre-back and a full-back behind a central and a wide
 * midfielder, in front of a striker.
 *
 * **Naming the roles is what makes the matrix a controlled measurement.** The
 * matrix declares four dimensions - age, role family, remaining room and
 * participation - and it flattens every template's abilities to a constant
 * before running it (`currentAbility = 7`, potential `7 + room`). So the *only*
 * thing a template still contributes is its role identity, and until Phase 81A
 * that role was whatever the n-th player of a macro-department happened to be
 * in world order. That made squad composition an undeclared fifth dimension:
 * give clubs different depth charts and "the second midfielder found" stops
 * being the same footballer, so the measurement moves without the thing being
 * measured moving.
 *
 * These roles are chosen from the football the matrix says it samples, not from
 * any output. Changing one changes what the calibration means.
 */
const PHASE_80A_OUTFIELD_TEMPLATE_ROLES = [
  "center_back",
  "full_back",
  "central_midfielder",
  "wide_midfielder",
  "striker",
] as const satisfies readonly PlayerRole[];

/**
 * Selects one template per declared role, in deterministic world order.
 *
 * Selection is by exact `primaryRole`, never by macro-department, so which
 * footballer stands in for "the wide midfielder" cannot change because a club
 * was generated with a different depth chart. A missing role is a throw and not
 * a substitution: silently standing a central midfielder in for a wide one is
 * the failure this function exists to prevent.
 */
function selectPhase80AOutfieldTemplates(
  world: FakeDomesticWorld,
  roles: readonly PlayerRole[],
): readonly CliPlayer[] {
  const players = world.playerIds.flatMap((playerId) => {
    const player = world.players[playerId];
    return player === undefined ? [] : [player];
  });

  return roles.map((role) => {
    const template = players.find((player) => player.primaryRole === role);
    if (template === undefined) {
      throw new Error(
        `Phase 80A development matrix requires a ${role} template and the source world has none`,
      );
    }
    return template;
  });
}

/** Classifies one complete role identity for the fixed matrix composition. */
function phase80AOutfieldTemplateDepartment(
  player: CliPlayer,
): Phase80AOutfieldTemplateDepartment | "goalkeeper" {
  switch (player.primaryRole) {
    case "goalkeeper":
      return "goalkeeper";
    case "center_back":
    case "full_back":
    case "wing_back":
      return "defender";
    case "defensive_midfielder":
    case "central_midfielder":
    case "attacking_midfielder":
    case "wide_midfielder":
      return "midfielder";
    case "winger":
    case "striker":
      return "attacker";
    case undefined:
      throw new Error(
        `Phase 80A development template requires a role identity: ${String(player.id)}`,
      );
    default: {
      const exhaustiveRole: never = player.primaryRole;
      throw new Error(`Unsupported Phase 80A development role: ${String(exhaustiveRole)}`);
    }
  }
}

interface RunPhase80APotentialOutcomeInput {
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

function runPhase80APotentialOutcome(
  input: RunPhase80APotentialOutcomeInput,
): PlayerPotentialOutcomeObservation {
  const templatePlayerState = input.sourceCareer.gameState.playerStates[input.template.id];
  const sourceClub = input.sourceCareer.gameState.clubs[input.sourceCareer.selectedClubId];
  if (templatePlayerState === undefined || sourceClub === undefined) {
    throw new Error("Phase 80A development template state is incomplete");
  }
  const startCurrentDate = input.sourceCareer.gameState.calendar.currentDate;
  const currentAbility = 7;
  const player: CliPlayer = {
    ...input.template,
    birthDate: birthDateForCompletedAge(
      startCurrentDate,
      input.startAge,
    ) as CliPlayer["birthDate"],
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
  let careerState: CliCareerState = createFreshCareerState({
    saveId: `save:${input.sourceId}` as CliSaveId,
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
  });
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
  if (startingProjection.age !== input.startAge) {
    throw new Error(
      `Phase 80A matrix age mismatch: expected ${input.startAge}, received ${startingProjection.age}`,
    );
  }
  let peakRoleAbility = starting.currentAbility;

  for (let age = input.startAge; age <= input.finalAge; age += 1) {
    const seasonKey = `season:phase80a-${input.sourceId}-${age}`;
    const seasonId = seasonKey as CliCareerState["gameState"]["calendar"]["currentSeasonId"];
    const developedPlayer = careerState.gameState.players[player.id];
    if (developedPlayer === undefined || developedPlayer.primaryRole === undefined) {
      throw new Error("Phase 80A development player lost its stable role");
    }
    const playedRole = canonicalPlayedRoleForPosition(
      developedPlayer.naturalPositions[0],
    );
    const rows = Object.fromEntries(
      phase80APotentialOutcomeMonthKeys(
        startCurrentDate,
        age - input.startAge,
      ).map((monthKey, monthIndex) => {
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
          clubMinutes: input.minutesPerMonth === 0
            ? {}
            : { [sourceClub.id]: input.minutesPerMonth },
          playedRoleMinutes: {
            [playedRole]: input.minutesPerMonth,
          },
          appliedFixtureIds: [
            `fixture:phase80a-${input.sourceId}-${age}-${monthIndex + 1}` as PotentialOutcomeFixtureId,
          ],
        }];
      }),
    );
    careerState = {
      ...careerState,
      clubCompetitiveTierState: {
        ...careerState.clubCompetitiveTierState,
        seasonId,
      },
      gameState: {
        ...careerState.gameState,
        calendar: {
          currentDate: addCivilYears(
            startCurrentDate,
            age - input.startAge,
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
    const orderedRows = Object.values(rows);
    for (let rowIndex = 0; rowIndex < orderedRows.length; rowIndex += 3) {
      careerState = developPlayersFromParticipationRows({
        careerState,
        worldSeed: input.sourceId,
        seasonId,
        participationRows: orderedRows.slice(rowIndex, rowIndex + 3),
        developmentEnvironmentConfig: selectPlayerDevelopmentEnvironmentConfig(
          careerState.gameState.meta.calibrationVersions,
        ),
      }).careerState as CliCareerState;
      const summary = summarizePlayerDevelopmentAbilities(
        careerState.gameState.players[player.id]!,
      );
      peakRoleAbility = Math.max(peakRoleAbility, summary.currentAbility);
    }
  }

  const finalPlayer = careerState.gameState.players[player.id];
  if (finalPlayer === undefined) {
    throw new Error("Phase 80A development matrix lost its player");
  }
  const final = summarizePlayerDevelopmentAbilities(finalPlayer);
  return {
    sourceId: input.sourceId,
    startAge: input.startAge,
    roleGroup: input.roleGroup,
    roomBand: input.roomBand,
    participationBand: input.participationBand,
    currentRoleAbility: starting.currentAbility,
    storedCeilingRoleAbility: starting.potentialAbility,
    peakRoleAbility,
    finalRoleAbility: final.currentAbility,
    remainingRoom: final.potentialRoom,
    publicP50RoleAbility: startingProjection.p50Ability,
    publicUpperRoleAbility: startingProjection.upperAbility,
    currentRating: startingProjection.currentRating,
    publicP50Rating: startingProjection.p50Rating,
    publicUpperRating: startingProjection.upperRating,
    storedCeilingRating: startingProjection.storedCeilingRating,
  };
}

/**
 * Returns one August-to-July development cycle from a career opening date.
 *
 * The season offset advances by complete twelve-month cycles. Using calendar
 * years here would incorrectly send January-to-July through the previous
 * completed age when the career opens on 1 August.
 */
export function phase80APotentialOutcomeMonthKeys(
  openingDate: number,
  seasonOffset: number,
): readonly string[] {
  if (!Number.isSafeInteger(seasonOffset) || seasonOffset < 0) {
    throw new Error("Phase 80A season offset must be a non-negative safe integer");
  }
  const [openingYearText, openingMonthText] = toISO(openingDate).split("-");
  const openingYear = Number(openingYearText);
  const openingMonthIndex = Number(openingMonthText) - 1;
  if (
    !Number.isSafeInteger(openingYear)
    || !Number.isSafeInteger(openingMonthIndex)
    || openingMonthIndex < 0
    || openingMonthIndex > 11
  ) {
    throw new Error("Phase 80A opening date must contain a valid civil month");
  }

  return Object.freeze(Array.from({ length: 12 }, (_, monthOffset) => {
    const absoluteMonthIndex = openingMonthIndex + seasonOffset * 12 + monthOffset;
    const year = openingYear + Math.floor(absoluteMonthIndex / 12);
    const month = absoluteMonthIndex % 12 + 1;
    return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}`;
  }));
}

/** Creates a matrix birth date whose civil birthday is the reference date. */
function birthDateForCompletedAge(referenceDate: number, age: number): number {
  const [referenceYear, month, day] = toISO(referenceDate).split("-");
  if (referenceYear === undefined || month === undefined || day === undefined) {
    throw new Error("Phase 80A reference date must be a valid ISO date");
  }
  return fromISO(
    `${String(Number(referenceYear) - age).padStart(4, "0")}-${month}-${day}`,
  );
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
    case "rm": return "right_midfielder";
    case "lm": return "left_midfielder";
    default: return "central_midfielder";
  }
}

/**
 * Opening-world economy observations for one generated world.
 *
 * Exported so the hard-cap reachability proof reads the same opening
 * observations the audit is fed, for the same reason the snapshot pair is
 * returned on the report: a proof built on its own second derivation proves
 * something about that derivation, not about the population the gates read.
 */
export function phase80AInitialWorldObservations(
  seed: string,
  world: FakeDomesticWorld,
): readonly PlayerGenerationEconomyObservation[] {
  const careerState = careerStateFromNewWorld(
    `save:phase80a-report:${seed}` as CliSaveId,
    world,
    seed,
  );
  const valuationConfig = selectPlayerValuationConfig(world.calibrationVersions);
  const allocatedCurrentSix = new Set(
    world.exceptionalAllocation.currentSixPlayerKeys,
  );
  const allocatedYoungStoredCeilingSix = new Set(
    world.exceptionalAllocation.youngPotentialSixPlayerKeys,
  );
  return phase80AActiveCareerObservations({
    seed,
    seasonStartYear: seasonStartYearFromDate(
      careerState.gameState.calendar.currentDate,
    ),
    careerState,
    valuationConfig,
  }).map((observation) => {
    const playerId = observation.playerId as Phase79CPlayerId;
    const rarityAssignment = world.playerRarityAssignments[playerId];
    const initialClub = world.clubIds.find((clubId) =>
      world.clubsById[clubId]?.playerIds.includes(playerId)
    );
    const isFirstTeamPlayer = initialClub !== undefined
      && (world.lineupsByClubId[initialClub] ?? []).some(
        ({ playerId: lineupPlayerId }) => lineupPlayerId === playerId,
    );
    const youngStoredCeilingSixAllocated =
      allocatedYoungStoredCeilingSix.has(observation.playerId);
    const youngGuardrail = youngStoredCeilingSixAllocated
      ? resolveInitialYoungProspectGuardrail(observation)
      : undefined;
    return {
      ...observation,
      squadPlacement: isFirstTeamPlayer
        ? "first_team" as const
        : observation.squadPlacement,
      allocation: {
        establishedCurrentSixAllocated:
          allocatedCurrentSix.has(observation.playerId),
        youngStoredCeilingSixAllocated,
        ...(youngGuardrail === undefined
          ? {}
          : {
              youngStoredCeilingSixCurrentRatingGuardrail: youngGuardrail,
            }),
        ...(rarityAssignment === undefined
          ? {}
          : { rarityKind: rarityAssignment.rarityKind }),
      },
    };
  });
}

/** Resolves the generator-owned current-rating lane for one allocated prodigy. */
function resolveInitialYoungProspectGuardrail(
  observation: PlayerGenerationEconomyObservation,
) {
  if (
    observation.division === "free_agent"
    || observation.clubCompetitiveTier === null
  ) {
    throw new Error(
      `Allocated young ceiling-six player has no club context: ${observation.playerId}`,
    );
  }
  return resolveRareProdigyCurrentRatingGuardrail({
    division: observation.division,
    clubTier: observation.clubCompetitiveTier,
    ageYears: observation.age,
  });
}

/**
 * Projects one active career checkpoint into the same public range/value facts
 * used by the initial-world audit.
 */
function phase80AActiveCareerObservations(input: {
  readonly seed: string;
  readonly seasonStartYear: number;
  readonly careerState: CliCareerState;
  readonly valuationConfig: Phase80AValuationConfig;
}): readonly PlayerGenerationEconomyObservation[] {
  const activeStock = selectCareerActivePlayerStock(input.careerState);
  const assessmentByPlayerId = new Map(
    activeStock.map(({ playerId }) => {
      const player = input.careerState.gameState.players[playerId];
      if (player === undefined) {
        throw new Error(`Player-economy active player is missing: ${playerId}`);
      }
      const assessment = derivePublicPlayerAssessment({
        player,
        currentDate: input.careerState.gameState.calendar.currentDate,
        potentialProjectionPolicy: input.valuationConfig.potentialProjectionPolicy,
        ratingScale: input.valuationConfig.ratingScale,
      });
      const projection = derivePlayerPotentialProjection({
        player,
        currentDate: input.careerState.gameState.calendar.currentDate,
        policy: input.valuationConfig.potentialProjectionPolicy,
        ratingScale: input.valuationConfig.ratingScale,
      });
      return [assessment.playerId, { assessment, projection }] as const;
    }),
  );

  return activeStock.map((stockEntry) => {
    const { playerId } = stockEntry;
    const player = input.careerState.gameState.players[playerId];
    const publicFacts = assessmentByPlayerId.get(playerId);
    const clubId = stockEntry.source === "free_agent"
      ? undefined
      : stockEntry.clubId;
    const club = clubId === undefined
      ? undefined
      : input.careerState.gameState.clubs[clubId];
    const primaryPosition = player?.naturalPositions[0];
    if (player === undefined || publicFacts === undefined || primaryPosition === undefined) {
      throw new Error(`Player-economy active observation is incomplete: ${playerId}`);
    }
    const { assessment, projection } = publicFacts;
    const division = club?.category ?? "free_agent";
    const valuation = derivePlayerValuation({
      assessment,
      primaryPosition,
      config: input.valuationConfig,
    });
    const commercial = stockEntry.source !== "senior"
      ? undefined
      : deriveTransferCommercialSnapshot({
          careerState: input.careerState,
          sellingClubId: stockEntry.clubId,
          playerId,
          asOf: input.careerState.gameState.calendar.currentDate,
          publicAssessment: assessment,
          valuationConfig: input.valuationConfig,
          askingPriceConfig: selectAskingPriceCurves(
            requireCalibrationVersions(input.careerState),
          ),
        });
    return {
      observationId:
        `${input.seed}|${input.seasonStartYear}|${String(playerId)}`,
      worldId: input.seed,
      playerId: String(playerId),
      playerName: `${player.firstName} ${player.lastName}`,
      age: assessment.age,
      seasonStartYear: input.seasonStartYear,
      division,
      population: stockEntry.source,
      clubCompetitiveTier: clubId === undefined
        ? null
        : input.careerState.clubCompetitiveTierState.tierByClubId[clubId]
          ?? null,
      squadPlacement: squadPlacementForActiveStockSource(stockEntry.source),
      roleGroup: player.naturalPositions[0] === "gk"
        ? "goalkeeper"
        : "outfield",
      currentRating: assessment.currentRating.stars,
      storedPotentialCeilingRating: projection.storedCeilingRating,
      publicPotentialP50Rating:
        assessment.p50Rating.stars,
      publicPotentialUpperRating:
        assessment.upperRating.stars,
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
 * Maps every active-stock source to its diagnostic sporting placement.
 *
 * Promotion candidates have left the active academy roster but have not yet
 * joined the senior squad. The stock source keeps that transition explicit;
 * the broader placement remains reserve until the same rollover resolves it.
 */
function squadPlacementForActiveStockSource(
  source: CareerActivePlayerStockEntry["source"],
): PlayerGenerationEconomyObservation["squadPlacement"] {
  switch (source) {
    case "senior":
    case "promotion_candidate":
      return "reserve";
    case "academy":
      return "academy";
    case "free_agent":
      return "unattached";
    default:
      return unreachableActiveStockSource(source);
  }
}

function unreachableActiveStockSource(source: never): never {
  throw new Error(`Unsupported active-player stock source: ${String(source)}`);
}

/**
 * Retains the exact closing senior population until all worlds can be pooled.
 * Percentiles are deliberately not computed per world: the frozen division
 * bands own one additive cohort denominator at the named closing checkpoint.
 */
function phase80AClosingPlayerMarketEvidence(
  careerState: CliCareerState,
  observations: readonly PlayerGenerationEconomyObservation[],
): Readonly<{
  observations: readonly PlayerMarketCalibrationObservation[];
  clubSquadObservations: readonly PlayerMarketClubSquadObservation[];
}> {
  const closingObservations = observations.flatMap((observation) =>
    observation.population === "senior"
      && observation.division !== "free_agent"
      ? [{
          division: observation.division,
          currentRating: observation.currentRating,
          publicP50Rating: observation.publicPotentialP50Rating,
          publicValueMinorUnits: observation.publicValueMinorUnits,
          population: "active_closing_checkpoint" as const,
          seasonStartYear: observation.seasonStartYear,
          sourceLabel: "phase80a-closing-public-assessment",
        }]
      : []
  );
  const byPlayerId = new Map(
    observations.map((observation) => [observation.playerId, observation]),
  );
  const seasonStartYear = seasonStartYearFromDate(
    careerState.gameState.calendar.currentDate,
  );
  const clubSquadObservations = careerState.gameState.clubIds.map((clubId) => {
    const club = careerState.gameState.clubs[clubId];
    if (club === undefined) {
      throw new Error(`Closing market-evidence club is missing: ${clubId}`);
    }
    const values = club.playerIds.map((playerId) => {
      const observation = byPlayerId.get(String(playerId));
      if (observation === undefined || observation.population !== "senior") {
        throw new Error(
          `Closing market-evidence player is missing from senior stock: ${playerId}`,
        );
      }
      return observation.publicValueMinorUnits;
    });
    if (values.length === 0) {
      throw new Error(`Closing market-evidence club has no senior players: ${clubId}`);
    }
    const normalizedValue = Math.round(
      values.reduce((sum, value) => sum + value, 0) * 22 / values.length,
    );
    return {
      division: club.category,
      activeSeniorCount: 22 as const,
      publicSquadValueMinorUnits: normalizedValue,
      seasonStartYear,
      sourceLabel: "phase80a-closing-normalized-22-seniors",
    };
  });

  return {
    observations: closingObservations,
    clubSquadObservations,
  };
}

/** Re-evaluates one player's intrinsic value independently across forbidden contexts. */
function phase80AIntrinsicValueInvarianceObservations(input: {
  readonly seed: string;
  readonly careerState: CliCareerState;
  readonly valuationConfig: Phase80AValuationConfig;
  readonly observations: readonly PlayerGenerationEconomyObservation[];
}): readonly PlayerGenerationIntrinsicValueInvarianceObservation[] {
  const reference = input.observations.find(
    ({ publicValueMinorUnits }) => publicValueMinorUnits > 0,
  );
  if (reference === undefined) {
    throw new Error("Intrinsic-value invariance requires one positive player value");
  }
  const player = input.careerState.gameState.players[
    reference.playerId as Phase79CPlayerId
  ];
  const primaryPosition = player?.naturalPositions[0];
  if (player === undefined || primaryPosition === undefined) {
    throw new Error("Intrinsic-value invariance reference player is incomplete");
  }
  const contexts = [
    {
      transition: "owner_category",
      before: { ownerCategory: "first_division" },
      after: { ownerCategory: "third_division" },
    },
    {
      transition: "promotion_relegation",
      before: { competitionCategory: "third_division" },
      after: { competitionCategory: "second_division" },
    },
    {
      transition: "transfer",
      before: { registration: "selling_club" },
      after: { registration: "buying_club" },
    },
    {
      transition: "contract_expiry",
      before: { employment: "contracted" },
      after: { employment: "expired_contract" },
    },
    {
      transition: "free_agent",
      before: { employment: "contracted" },
      after: { employment: "free_agent" },
    },
  ] as const;
  return contexts.map(({ transition, before, after }) => {
    const beforeAssessment = derivePublicPlayerAssessment({
      player,
      currentDate: input.careerState.gameState.calendar.currentDate,
      potentialProjectionPolicy:
        input.valuationConfig.potentialProjectionPolicy,
      ratingScale: input.valuationConfig.ratingScale,
    });
    const beforeValue = derivePlayerValuation({
      assessment: beforeAssessment,
      primaryPosition,
      config: input.valuationConfig,
    });
    const afterAssessment = derivePublicPlayerAssessment({
      player,
      currentDate: input.careerState.gameState.calendar.currentDate,
      potentialProjectionPolicy:
        input.valuationConfig.potentialProjectionPolicy,
      ratingScale: input.valuationConfig.ratingScale,
    });
    const afterValue = derivePlayerValuation({
      assessment: afterAssessment,
      primaryPosition,
      config: input.valuationConfig,
    });
    return {
      observationId:
        `${input.seed}|value-invariance|${transition}|${reference.playerId}`,
      playerId: reference.playerId,
      transition,
      beforeContextFingerprint: stableDiagnosticFingerprint(before),
      afterContextFingerprint: stableDiagnosticFingerprint(after),
      beforePublicValueMinorUnits: Number(beforeValue.value),
      afterPublicValueMinorUnits: Number(afterValue.value),
    };
  });
}

/** Retains only completed canonical free-agent movements as audit evidence. */
function phase80AFreeAgentSigningObservations(input: {
  readonly seed: string;
  readonly careerState: CliCareerState;
  readonly canonicalSeasonSignings:
    readonly PlayerGenerationFreeAgentSigningObservation[];
}): readonly PlayerGenerationFreeAgentSigningObservation[] {
  const durableHistorySignings = input.careerState.transferHistory.flatMap((entry) =>
    entry.kind === "free_agent_signing"
      ? [{
          observationId:
            `${input.seed}|free-agent-history|${entry.sequenceNumber}`,
          playerId: String(entry.playerId),
          completedSigningFingerprint: stableDiagnosticFingerprint({
            sequenceNumber: entry.sequenceNumber,
            occurredOn: entry.occurredOn,
            buyingClubId: entry.buyingClubId,
            playerId: entry.playerId,
          }),
          publicValueMinorUnits: Number(entry.publicValue),
          transferFeeMinorUnits: Number(entry.completedFee),
        }]
      : []
  );
  return [...durableHistorySignings, ...input.canonicalSeasonSignings];
}

/** Executes every AI market surface independently over two real ceiling variants. */
function phase80AAiInformationParityObservations(input: {
  readonly seed: string;
  readonly careerState: CliCareerState;
  readonly valuationConfig: Phase80AValuationConfig;
}): readonly PlayerGenerationAiInformationParityObservation[] {
  const marketBehaviorPolicy = selectMarketBehaviorCalibration(
    requireCalibrationVersions(input.careerState),
  );
  const askingPriceConfig = selectAskingPriceCurves(
    requireCalibrationVersions(input.careerState),
  );
  const pair = phase80AAiCeilingVariantPair(input);
  const sellingClub = input.careerState.gameState.clubs[pair.sellingClubId];
  const buyingClubId = input.careerState.gameState.clubIds.find(
    (clubId) => clubId !== pair.sellingClubId,
  );
  const buyingClub = buyingClubId === undefined
    ? undefined
    : input.careerState.gameState.clubs[buyingClubId];
  if (sellingClub === undefined || buyingClub === undefined) {
    throw new Error("AI information parity target parties are incomplete");
  }
  const leftCommercial = deriveTransferCommercialSnapshot({
    careerState: pair.leftCareerState,
    sellingClubId: sellingClub.id,
    playerId: pair.playerId,
    asOf: input.careerState.gameState.calendar.currentDate,
    publicAssessment: pair.leftAssessment,
    valuationConfig: input.valuationConfig,
    askingPriceConfig,
  });
  const rightCommercial = deriveTransferCommercialSnapshot({
    careerState: pair.rightCareerState,
    sellingClubId: sellingClub.id,
    playerId: pair.playerId,
    asOf: input.careerState.gameState.calendar.currentDate,
    publicAssessment: pair.rightAssessment,
    valuationConfig: input.valuationConfig,
    askingPriceConfig,
  });
  if (leftCommercial === undefined || rightCommercial === undefined) {
    throw new Error("AI information parity target has no commercial snapshot");
  }
  const leftBuyingAccount =
    pair.leftCareerState.clubFinanceState?.accounts[buyingClub.id];
  const rightBuyingAccount =
    pair.rightCareerState.clubFinanceState?.accounts[buyingClub.id];
  if (leftBuyingAccount === undefined || rightBuyingAccount === undefined) {
    throw new Error("AI information parity buyer has no finance account");
  }
  const leftAffordability = deriveAiTransferAffordabilitySnapshot({
    account: leftBuyingAccount,
    policy: marketBehaviorPolicy.affordability,
  });
  const rightAffordability = deriveAiTransferAffordabilitySnapshot({
    account: rightBuyingAccount,
    policy: marketBehaviorPolicy.affordability,
  });
  const leftOfferFee = deriveAiTransferOfferFee({
    askingPrice: leftCommercial.currentAskingPrice,
    maximumAffordableFee: leftAffordability.maximumAffordableFee,
    buyingClubId: buyingClub.id,
    playerId: pair.playerId,
    submittedOn: pair.leftCareerState.gameState.calendar.currentDate,
    policy: marketBehaviorPolicy.aiTransferOffer,
  });
  const rightOfferFee = deriveAiTransferOfferFee({
    askingPrice: rightCommercial.currentAskingPrice,
    maximumAffordableFee: rightAffordability.maximumAffordableFee,
    buyingClubId: buyingClub.id,
    playerId: pair.playerId,
    submittedOn: pair.rightCareerState.gameState.calendar.currentDate,
    policy: marketBehaviorPolicy.aiTransferOffer,
  });
  if (leftOfferFee <= 0 || rightOfferFee <= 0) {
    throw new Error("AI information parity target produced no live offer");
  }
  const leftTargetScore = deriveAiMarketTargetScore({
    assessment: pair.leftAssessment,
    roleNeedScore: 50,
    affordabilityScore: 50,
    buyingClubCategory: buyingClub.category,
    policy: marketBehaviorPolicy,
  });
  const rightTargetScore = deriveAiMarketTargetScore({
    assessment: pair.rightAssessment,
    roleNeedScore: 50,
    affordabilityScore: 50,
    buyingClubCategory: buyingClub.category,
    policy: marketBehaviorPolicy,
  });
  const leftWillingness = derivePlayerWillingness({
    publicAssessment: pair.leftAssessment,
    sellingClub,
    buyingClub,
    currentTier: sellingClub.category,
    destinationTier: buyingClub.category,
    marketBehaviorPolicy,
  });
  const rightWillingness = derivePlayerWillingness({
    publicAssessment: pair.rightAssessment,
    sellingClub,
    buyingClub,
    currentTier: sellingClub.category,
    destinationTier: buyingClub.category,
    marketBehaviorPolicy,
  });
  const leftPublicAssessmentFingerprint = stableDiagnosticFingerprint(
    publicAssessmentDiagnosticFacts(pair.leftAssessment),
  );
  const rightPublicAssessmentFingerprint = stableDiagnosticFingerprint(
    publicAssessmentDiagnosticFacts(pair.rightAssessment),
  );
  const common = {
    leftStoredCeilingRating: pair.leftStoredCeilingRating,
    rightStoredCeilingRating: pair.rightStoredCeilingRating,
    leftPublicAssessmentFingerprint,
    rightPublicAssessmentFingerprint,
  } as const;
  return [
    {
      ...common,
      observationId:
        `${input.seed}|ai-information-parity|target_ranking|${pair.playerId}`,
      decisionKind: "target_ranking",
      leftDecisionFingerprint: stableDiagnosticFingerprint(leftTargetScore),
      rightDecisionFingerprint: stableDiagnosticFingerprint(rightTargetScore),
    },
    {
      ...common,
      observationId:
        `${input.seed}|ai-information-parity|offer_selection|${pair.playerId}`,
      decisionKind: "offer_selection",
      leftDecisionFingerprint: stableDiagnosticFingerprint(leftOfferFee),
      rightDecisionFingerprint: stableDiagnosticFingerprint(rightOfferFee),
    },
    {
      ...common,
      observationId:
        `${input.seed}|ai-information-parity|willingness|${pair.playerId}`,
      decisionKind: "willingness",
      leftDecisionFingerprint: stableDiagnosticFingerprint(leftWillingness),
      rightDecisionFingerprint: stableDiagnosticFingerprint(rightWillingness),
    },
  ];
}

/** Selects one mature outfield player whose public range hides 5.5/6 ceilings. */
function phase80AAiCeilingVariantPair(input: {
  readonly careerState: CliCareerState;
  readonly valuationConfig: Phase80AValuationConfig;
}) {
  const leftThreshold = input.valuationConfig.ratingScale.abilityThresholds.find(
    ({ rating }) => rating === 5.5,
  );
  const rightThreshold = input.valuationConfig.ratingScale.abilityThresholds.find(
    ({ rating }) => rating === 6,
  );
  if (leftThreshold === undefined || rightThreshold === undefined) {
    throw new Error("AI information parity requires 5.5/6 rating thresholds");
  }
  const currentDate = input.careerState.gameState.calendar.currentDate;
  for (const entry of selectCareerActivePlayerStock(input.careerState)) {
    if (entry.source !== "senior") continue;
    const player = input.careerState.gameState.players[entry.playerId];
    if (player === undefined || player.naturalPositions[0] === "gk") continue;
    const currentAssessment = derivePublicPlayerAssessment({
      player,
      currentDate,
      potentialProjectionPolicy:
        input.valuationConfig.potentialProjectionPolicy,
      ratingScale: input.valuationConfig.ratingScale,
    });
    if (currentAssessment.age < 28 || currentAssessment.currentRating.stars > 5) {
      continue;
    }
    const leftPlayer = {
      ...player,
      potential: abilityShapeAtLeast(
        player,
        leftThreshold.minimumAbilityInclusive,
      ),
    };
    const rightPlayer = {
      ...player,
      potential: abilityShapeAtLeast(
        player,
        rightThreshold.minimumAbilityInclusive,
      ),
    };
    const leftCareerState = careerStateWithPlayer(
      input.careerState,
      leftPlayer,
    );
    const rightCareerState = careerStateWithPlayer(
      input.careerState,
      rightPlayer,
    );
    const leftAssessment = derivePublicPlayerAssessment({
      player: leftPlayer,
      currentDate,
      potentialProjectionPolicy:
        input.valuationConfig.potentialProjectionPolicy,
      ratingScale: input.valuationConfig.ratingScale,
    });
    const rightAssessment = derivePublicPlayerAssessment({
      player: rightPlayer,
      currentDate,
      potentialProjectionPolicy:
        input.valuationConfig.potentialProjectionPolicy,
      ratingScale: input.valuationConfig.ratingScale,
    });
    const leftProjection = derivePlayerPotentialProjection({
      player: leftPlayer,
      currentDate,
      policy: input.valuationConfig.potentialProjectionPolicy,
      ratingScale: input.valuationConfig.ratingScale,
    });
    const rightProjection = derivePlayerPotentialProjection({
      player: rightPlayer,
      currentDate,
      policy: input.valuationConfig.potentialProjectionPolicy,
      ratingScale: input.valuationConfig.ratingScale,
    });
    if (
      leftProjection.storedCeilingRating !== 5.5
      || rightProjection.storedCeilingRating !== 6
      || stableDiagnosticFingerprint(publicAssessmentDiagnosticFacts(leftAssessment))
        !== stableDiagnosticFingerprint(publicAssessmentDiagnosticFacts(rightAssessment))
    ) {
      continue;
    }
    return {
      playerId: player.id,
      sellingClubId: entry.clubId,
      leftCareerState,
      rightCareerState,
      leftAssessment,
      rightAssessment,
      leftStoredCeilingRating: leftProjection.storedCeilingRating,
      rightStoredCeilingRating: rightProjection.storedCeilingRating,
    };
  }
  throw new Error(
    "AI information parity requires one mature public-equivalent 5.5/6 pair",
  );
}

/** Keeps every underlying potential at or above current before changing its ceiling. */
function abilityShapeAtLeast(
  player: CliPlayer,
  minimumAbility: number,
): CliPlayer["potential"] {
  return Object.fromEntries(
    Object.entries(player.potential).map(([group, potentialAbilities]) => {
      const currentAbilities = player.abilities[
        group as keyof CliPlayer["abilities"]
      ] as unknown as Readonly<Record<string, number>>;
      return [group, Object.fromEntries(
        Object.keys(potentialAbilities).map((ability) => [
          ability,
          Math.max(currentAbilities[ability] ?? 0, minimumAbility),
        ]),
      )];
    }),
  ) as unknown as CliPlayer["potential"];
}

/** Replaces exactly one canonical player while preserving every contextual fact. */
function careerStateWithPlayer(
  careerState: CliCareerState,
  player: CliPlayer,
): CliCareerState {
  return {
    ...careerState,
    gameState: {
      ...careerState.gameState,
      players: {
        ...careerState.gameState.players,
        [player.id]: player,
      },
    },
  };
}

/** Extracts only the public facts permitted to reach live AI decisions. */
function publicAssessmentDiagnosticFacts(
  assessment: ReturnType<typeof derivePublicPlayerAssessment>,
) {
  return {
    playerId: assessment.playerId,
    assessedOn: assessment.assessedOn,
    age: assessment.age,
    roleFamily: assessment.roleFamily,
    currentAbility: assessment.currentAbility,
    p50Ability: assessment.p50Ability,
    upperAbility: assessment.upperAbility,
    currentRating: assessment.currentRating,
    p50Rating: assessment.p50Rating,
    upperRating: assessment.upperRating,
  };
}

/** Creates one compact deterministic diagnostic identity from structured facts. */
function stableDiagnosticFingerprint(value: unknown): string {
  return createHash("sha256")
    .update(JSON.stringify(value))
    .digest("hex")
    .slice(0, 16);
}

/**
 * Projects one complete active career checkpoint into the national exceptional
 * stock contract. Stored ceiling owns stock membership; public upper remains a
 * separate comparison fact and can never redefine the population.
 */
function phase80AExceptionalStockSnapshot(input: {
  readonly seed: string;
  readonly seasonIndex: number;
  readonly targetYoungStoredCeilingSixCount: number;
  readonly careerState: CliCareerState;
  readonly observations: readonly PlayerGenerationEconomyObservation[];
}): Phase80AExceptionalStockSnapshotObservation {
  const activeStockByPlayerId = new Map(
    selectCareerActivePlayerStock(input.careerState).map((entry) => [
      String(entry.playerId),
      entry,
    ]),
  );
  if (activeStockByPlayerId.size !== input.observations.length) {
    throw new Error("Exceptional-stock snapshot does not cover the canonical active stock");
  }

  return {
    observationId: `${input.seed}|stock|${input.seasonIndex}`,
    worldId: input.seed,
    seasonIndex: input.seasonIndex,
    targetYoungStoredCeilingSixCount:
      input.targetYoungStoredCeilingSixCount,
    players: input.observations.map((observation) => {
      const stockEntry = activeStockByPlayerId.get(observation.playerId);
      if (stockEntry === undefined || stockEntry.source !== observation.population) {
        throw new Error(
          `Exceptional-stock association is inconsistent: ${observation.playerId}`,
        );
      }
      if (stockEntry.source === "free_agent") {
        return {
          playerId: observation.playerId,
          age: observation.age,
          population: observation.population,
          storedPotentialCeilingRating:
            observation.storedPotentialCeilingRating,
          publicPotentialUpperRating: observation.publicPotentialUpperRating,
          clubAssociation: { kind: "unattached" as const },
        };
      }
      const club = input.careerState.gameState.clubs[stockEntry.clubId];
      const competitiveTier =
        input.careerState.clubCompetitiveTierState.tierByClubId[stockEntry.clubId];
      if (club === undefined || competitiveTier === undefined) {
        throw new Error(
          `Exceptional-stock club association is missing: ${observation.playerId}`,
        );
      }
      return {
        playerId: observation.playerId,
        age: observation.age,
        population: observation.population,
        storedPotentialCeilingRating:
          observation.storedPotentialCeilingRating,
        publicPotentialUpperRating: observation.publicPotentialUpperRating,
        clubAssociation: {
          kind: "club" as const,
          clubId: String(stockEntry.clubId),
          category: club.category,
          competitiveTier,
        },
      };
    }),
  };
}

/**
 * Retains every durable transfer stage separately so completion cannot stand
 * in for seller/counter-path coverage.
 */
function phase80ANegotiationObservations(input: {
  readonly seed: string;
  readonly seasonStartDate: number;
  readonly careerState: CliCareerState;
}): readonly PlayerGenerationNegotiationObservation[] {
  const state = input.careerState.transferNegotiationState;
  if (state === undefined) return [];
  return state.negotiationIds.map((negotiationId) => {
    const negotiation = state.negotiations[negotiationId];
    if (negotiation === undefined) {
      throw new Error(`Player-economy negotiation is missing: ${negotiationId}`);
    }
    const player = input.careerState.gameState.players[negotiation.playerId];
    const sellingClub =
      input.careerState.gameState.clubs[negotiation.sellingClubId];
    if (player === undefined || sellingClub === undefined) {
      throw new Error(`Player-economy negotiation parties are incomplete: ${negotiationId}`);
    }
    const eventDate = transferNegotiationEventDate(
      negotiation,
      input.careerState.gameState.calendar.currentDate,
    );
    return {
      negotiationId: `${input.seed}|${String(negotiationId)}`,
      playerId: String(player.id),
      playerName: `${player.firstName} ${player.lastName}`,
      age: completedPlayerAge(player.birthDate, eventDate),
      seasonStartYear: seasonStartYearAtDate(
        eventDate,
        input.seasonStartDate,
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
  negotiation: Phase80ATransferNegotiation,
): PlayerGenerationNegotiationObservation["sellerOutcome"] {
  if (negotiation.status === "submitted") return "open";
  if (negotiation.status === "rejected") return "rejected";
  if (negotiation.status === "expired") return "expired";
  if (negotiation.status === "withdrawn") return "withdrawn";
  if (negotiation.counterFee !== undefined) return "countered";
  return "accepted";
}

function counterOutcomeForNegotiation(
  negotiation: Phase80ATransferNegotiation,
): PlayerGenerationNegotiationObservation["counterOutcome"] {
  if (negotiation.counterFee === undefined) return "not_observed";
  if (negotiation.status === "countered") return "open";
  if (negotiation.status === "expired") return "expired";
  if (negotiation.status === "withdrawn") return "rejected";
  return "accepted";
}

/** Returns the civil date of the latest durable stage represented by a negotiation. */
export function transferNegotiationEventDate(
  negotiation: Phase80ATransferNegotiation,
  fallback: CliCareerState["gameState"]["calendar"]["currentDate"],
): CliCareerState["gameState"]["calendar"]["currentDate"] {
  if (
    (negotiation.status === "countered"
      || negotiation.status === "player_countered")
    && "counterIssuedOn" in negotiation
  ) {
    return negotiation.counterIssuedOn;
  }
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

/**
 * Identifies the football season by the civil year in which its boundary
 * starts. This remains exact for winter events and leap years; elapsed-day
 * division would assign events near a boundary to the wrong season.
 */
export function seasonStartYearAtDate(
  eventDate: number,
  referenceSeasonStartDate: number,
): number {
  const [eventYear, eventMonth, eventDay] = toISO(eventDate).split("-");
  const [, boundaryMonth, boundaryDay] = toISO(referenceSeasonStartDate).split("-");
  if (
    eventYear === undefined
    || eventMonth === undefined
    || eventDay === undefined
    || boundaryMonth === undefined
    || boundaryDay === undefined
  ) {
    throw new Error("Transfer diagnostic dates must have a complete civil identity");
  }
  const eventMonthDay = `${eventMonth}-${eventDay}`;
  const boundaryMonthDay = `${boundaryMonth}-${boundaryDay}`;
  return Number(eventYear) - (eventMonthDay < boundaryMonthDay ? 1 : 0);
}

/** Requires the immutable version bundle before a report can select calibration. */
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
 * Summarizes active `5.5`/`6` stock as descriptive longitudinal evidence.
 *
 * The annual young-stock transition gates own inflation control. A fixed cap
 * over every active stored ceiling would conflict with intentional replenishment
 * while older exceptional players remain in the active world.
 */
export function summarizeExceptionalRatingStock(
  careerState: CliCareerState,
  valuationConfig: Phase80AValuationConfig,
): ExceptionalRatingStockSnapshot {
  const activeStock = selectCareerActivePlayerStock(careerState);
  const stockByPlayerId = new Map(
    activeStock.map((entry) => [entry.playerId, entry]),
  );
  const projections = activeStock.map(({ playerId }) => {
      const player = careerState.gameState.players[playerId];
      if (player === undefined) {
        throw new Error(`Active rating-stock player is missing: ${playerId}`);
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
  let storedCeilingSixCount = 0;
  let lowerDivisionStoredCeilingSixCount = 0;
  const locations: string[] = [];

  for (const projection of projections) {
    const currentRating = projection.currentRating;
    const storedCeilingRating = projection.storedCeilingRating;
    if (currentRating === 5.5) currentFiveAndHalfCount += 1;
    if (currentRating === 6) currentSixCount += 1;
    if (storedCeilingRating === 6) storedCeilingSixCount += 1;
    const stockEntry = stockByPlayerId.get(projection.playerId);
    if (stockEntry === undefined) {
      throw new Error(`Rating-stock association is missing: ${projection.playerId}`);
    }
    const clubId = stockEntry.source === "free_agent"
      ? undefined
      : stockEntry.clubId;
    const division = clubId === undefined
      ? undefined
      : careerState.gameState.clubs[clubId]?.category;
    if (
      storedCeilingRating === 6
      && (division === "second_division" || division === "third_division")
    ) {
      lowerDivisionStoredCeilingSixCount += 1;
    }
    if (currentRating >= 5.5 || storedCeilingRating === 6) {
      const slot = stockEntry.source;
      locations.push(
        `${projection.playerId}|current=${currentRating}`
        + `|storedCeiling=${storedCeilingRating}`
        + `|division=${division ?? "free_agent"}|club=${clubId ?? "none"}|slot=${slot}`,
      );
    }
  }

  return {
    currentFiveAndHalfCount,
    currentSixCount,
    storedCeilingSixCount,
    lowerDivisionStoredCeilingSixCount,
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
 *
 * Exported so a per-season trace reads the same definition of "how strong a
 * club is" that the initial/final hierarchy already reports. A second local
 * average would let the two disagree while both looked right.
 */
export function summarizeClubAbilityHierarchySnapshot(
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
export function createLongRunGateFactsFromWorlds(
  input: CreateLongRunGateFactsFromWorldsInput,
): LongRunGateFacts {
  if (input.worlds.length !== input.worldCount) {
    throw new Error(
      `Long-run gate expected ${input.worldCount} world summaries but received ${input.worlds.length}`,
    );
  }

  const worlds = [...input.worlds].sort((left, right) => left.seed.localeCompare(right.seed));
  const wageBudgetUtilizations = worlds.flatMap((world) => world.wageBudgetUtilizations);
  const annualWageHeadrooms = worlds.flatMap((world) => world.annualWageHeadrooms);
  const playerEconomyGates = aggregatePlayerEconomyGateEvidence(
    worlds.map((world) => world.playerEconomyGates),
  );
  const playerEconomyViolationCount = playerEconomyGates.reduce(
    (sum, gate) => sum + gate.violationCount,
    0,
  );
  const failedWorldCount = worlds.filter(
    (world) => world.status === "fail",
  ).length;
  const yearTenRatingStocks = worlds.flatMap((world) =>
    world.yearTenRatingStock === undefined ? [] : [world.yearTenRatingStock]
  );
  const calibrationVersionBundles = uniqueCalibrationVersionBundles(
    worlds.map((world) => world.calibrationVersions),
  );
  if (calibrationVersionBundles.length !== 1) {
    throw new Error(
      `Closing player-market calibration requires one version bundle, received ${calibrationVersionBundles.length}`,
    );
  }
  const calibrationVersions = calibrationVersionBundles[0];
  if (calibrationVersions === undefined) {
    throw new Error("Closing player-market calibration has no version bundle");
  }
  const valuationConfig = selectPlayerValuationConfig(calibrationVersions);
  const closingPlayerMarketCalibration = createPlayerMarketCalibrationReport({
    versions: calibrationVersions,
    metadata: {
      seedPrefix: input.seedPrefix,
      worldCount: input.worldCount,
      projectionMethod:
        "Phase 80A canonical active senior stock at the closing season checkpoint",
    },
    observations: worlds.flatMap(
      (world) => world.closingPlayerMarketObservations,
    ),
    divisionValuePopulation: "active_closing_checkpoint",
    clubSquadObservations: worlds.flatMap(
      (world) => world.closingPlayerMarketClubSquadObservations,
    ),
    targets: valuationConfig.marketCalibration.gameDesignTargets,
    divisionBaselines: valuationConfig.marketCalibration.divisionBaselines,
  });
  const closingDivisionValueFitViolationCount =
    closingPlayerMarketCalibration.divisions.reduce((sum, division) => {
      if (division.valueFit.status === "pass") return sum;
      const failedCheckCount = division.valueFit.checks.filter(
        ({ status }) => status === "fail",
      ).length;
      return sum + Math.max(1, failedCheckCount);
    }, 0);

  return {
    seedPrefix: input.seedPrefix,
    worldCount: input.worldCount,
    seasonCount: input.seasonCount,
    execution: input.execution,
    totalSeasonCount: input.worldCount * input.seasonCount,
    status: longRunGateStatus({
      failedWorldCount,
      playerEconomyViolationCount,
      closingPlayerMarketFitStatus: closingPlayerMarketCalibration.fitStatus,
    }),
    playerEconomyViolationCount,
    closingPlayerMarketCalibration,
    closingDivisionValueFitViolationCount,
    yearTenRatingStockObservationCount: worlds.reduce(
      (sum, world) => sum + world.yearTenRatingStockObservationCount,
      0,
    ),
    playerEconomyGates,
    yearTenCurrentSixMaximumObserved: maximumObservedOrNull(
      yearTenRatingStocks.map(({ currentSixCount }) => currentSixCount),
    ),
    yearTenStoredCeilingSixMaximumObserved: maximumObservedOrNull(
      yearTenRatingStocks.map(({ storedCeilingSixCount }) =>
        storedCeilingSixCount
      ),
    ),
    yearTenLowerDivisionStoredCeilingSixMaximumObserved: maximumObservedOrNull(
      yearTenRatingStocks.map(
        ({ lowerDivisionStoredCeilingSixCount }) =>
          lowerDivisionStoredCeilingSixCount,
      ),
    ),
    calibrationVersionBundles,
    compositionHashes: worlds.map((world) => ({
      seed: world.seed,
      hash: world.compositionHash,
    })),
    failedWorldCount,
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
    yearTenExceptionalLocations: worlds.flatMap((world) =>
      world.yearTenRatingStock === undefined
        ? []
        : [{
            seed: world.seed,
            locations: world.yearTenRatingStock.locations,
          }]
    ),
  };
}

/** Returns a real observed maximum without fabricating a value for an empty sample. */
function maximumObservedOrNull(values: readonly number[]): number | null {
  return values.length === 0 ? null : Math.max(...values);
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

/** Builds one simulated season for the managed club's canonical competition. */
function createDomesticCareerSeasonInput(
  world: FakeDomesticWorld,
  careerState: CliCareerState,
  seed: string,
  inspection?: CareerWorldInspection,
): SimulateSeasonInput {
  const competition = selectedCompetition(world, careerState);
  return createCompetitionCareerSeasonInput(
    world,
    careerState,
    competitionSeasonSeed(seed, competition.id),
    competition.id,
    inspection,
  );
}

/** Builds one canonical competition season from the current registry. */
function createCompetitionCareerSeasonInput(
  world: FakeDomesticWorld,
  careerState: CliCareerState,
  seed: string,
  competitionId: FakeDomesticWorld["domesticCompetitionWorld"]["competitionIds"][number],
  inspection?: CareerWorldInspection,
): SimulateSeasonInput {
  const competition =
    careerState.gameState.domesticCompetitionWorld?.competitions[competitionId];
  if (competition === undefined) {
    throw new Error(`Report competition is unavailable: ${competitionId}`);
  }
  const teamsByClubId: Record<string, SimulateSeasonTeamInput> = {};
  const roleWeights: Readonly<Record<string, RoleWeightProfile>> = world.roleWeights;
  const valuationConfig = selectPlayerValuationConfig(
    careerState.gameState.meta.calibrationVersions,
  );
  for (const clubId of competition.clubIds) {
    const club = careerState.gameState.clubs[clubId];
    if (club === undefined) throw new Error(`Missing report club: ${clubId}`);
    const lineup = reportLineup(club.playerIds, careerState);
    const players = reportClubPlayers(club.playerIds, careerState);
    teamsByClubId[clubId] = {
      lineup,
      players,
      roleWeights,
      playerStates: careerState.gameState.playerStates,
      stateMultiplierCurves: world.stateMultiplierCurves,
      tacticalDistribution: {
        directness: 0.5,
        pressing: 0.5,
        width: 0.5,
        risk: 0.5,
        mentality: "balanced",
      },
      aiSelection: {
        // The report has always fielded one shape for every club, because
        // `simulateSeason(...)` holds the formation still on purpose and Step 09
        // gave real shape choice to the career path only. An inspection run may
        // supply a per-club shape; with no policy this stays exactly the fixed
        // `4-4-2` every carried report was measured against.
        ...(inspection?.selectCatalogFormation === true
          ? {}
          : {
              formation: FORMATION_CATALOG[
                inspection?.formationForClub?.(clubId) ?? "4-4-2"
              ],
            }),
        potentialProjectionPolicy:
          valuationConfig.potentialProjectionPolicy,
        ratingScale: valuationConfig.ratingScale,
        benchSize: 8,
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
    fitnessLifecycle: {
      playerStates: careerState.gameState.playerStates,
      playerIds: competition.clubIds.flatMap((clubId) => {
        const club = careerState.gameState.clubs[clubId];
        if (club === undefined) {
          throw new Error(`Missing report fitness club: ${clubId}`);
        }
        return club.playerIds;
      }),
    },
    matchEngineConfig: world.matchEngineConfig,
    matchTacticsCalibration: world.matchTacticsCalibration,
    tableRules: world.tableRules,
  };
}

/** Copies one club's exact senior roster into the AI selection boundary. */
function reportClubPlayers(
  playerIds: readonly CliCareerState["gameState"]["playerIds"][number][],
  careerState: CliCareerState,
): Readonly<Record<Phase79CPlayerId, CliPlayer>> {
  const players: Partial<Record<Phase79CPlayerId, CliPlayer>> = {};
  for (const playerId of playerIds) {
    const player = careerState.gameState.players[playerId];
    if (player === undefined) {
      throw new Error(`Missing report roster player: ${playerId}`);
    }
    players[playerId] = player;
  }
  return players as Readonly<Record<Phase79CPlayerId, CliPlayer>>;
}

/** Stable report-only match seed for one non-selected competition. */
function competitionSeasonSeed(
  seasonSeed: string,
  competitionId: FakeDomesticWorld["domesticCompetitionWorld"]["competitionIds"][number],
): string {
  return `${seasonSeed}|competition|${competitionId}`;
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
    return createLineupSlot({
      slotId: `slot:${String(index + 1).padStart(2, "0")}`,
      playerId,
      canonicalRole: canonicalRoleForReportGroup(group),
    });
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

/** Maps one broad report position group onto the canonical role it stands for. */
function canonicalRoleForReportGroup(
  group: "goalkeeper" | "defender" | "midfielder" | "attacker",
): CanonicalPlayerRole {
  switch (group) {
    case "goalkeeper":
      return "goalkeeper";
    case "defender":
      return "center_back";
    case "midfielder":
      return "central_midfielder";
    case "attacker":
      return "striker";
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

/** Accrues season-owned fixture contributions before rollover clears the ledger. */
function accrueCompletedSeasonParticipation(input: {
  readonly careerState: CliCareerState;
  readonly seasonResults: readonly SimulateSeasonResult[];
}): CliCareerState {
  return accrueFixtureParticipationContributions({
    careerState: input.careerState,
    contributions: input.seasonResults.flatMap((seasonResult) =>
      seasonResult.fixtureParticipation.flatMap(
        ({ contributions }) => contributions,
      ),
    ),
  }) as CliCareerState;
}


/**
 * Applies deterministic post-season career refresh in memory for the report.
 */
function advanceCareerForReport(
  league: FakeDomesticWorld,
  worldSeed: string,
  context: AdvanceCareerLongRunSeasonContext,
  annualIntakeObservations: PlayerGenerationAnnualIntakeObservation[],
  exceptionalStockSnapshots: Phase80AExceptionalStockSnapshotObservation[],
  canonicalFreeAgentSigningObservations:
    PlayerGenerationFreeAgentSigningObservation[],
  observeParticipationRows?: (
    seasonNumber: number,
    rows: readonly CliPlayerParticipationRow[],
    careerState: CliCareerState,
  ) => void,
  inspection?: CareerWorldInspection,
): AdvanceCareerLongRunSeasonResult {
  const nextSeasonId =
    `${context.careerState.gameState.calendar.currentSeasonId}:long-run-${context.seasonNumber}` as AdvanceCareerReportRefreshMode["nextSeasonId"];
  const nextSeasonStartDate = addCivilYears(
    context.careerState.gameState.calendar.currentDate,
    1,
  ) as AdvanceCareerReportRefreshMode["nextSeasonStartDate"];
  const reportCareerState = context.careerState as CliCareerState;
  const registry = reportCareerState.gameState.domesticCompetitionWorld;
  if (registry === undefined) {
    throw new Error("Report career has no domestic competition registry");
  }
  const selectedCompetitionId = selectedCompetition(
    league,
    reportCareerState,
  ).id;
  const seasonResults = registry.competitionIds.map((competitionId) =>
    competitionId === selectedCompetitionId
      ? context.seasonResult
      : simulateSeason(createCompetitionCareerSeasonInput(
          league,
          reportCareerState,
          competitionSeasonSeed(context.seasonSeed, competitionId),
          competitionId,
          inspection,
        )),
  );
  // The selected competition is the one the charts read, and this is the last
  // point at which its full result exists: the runner projects it away next.
  inspection?.observeSeasonResult?.({
    seasonNumber: context.seasonNumber,
    seasonSeed: context.seasonSeed,
    result: context.seasonResult,
    careerState: reportCareerState,
    league,
  });
  const careerStateWithParticipation = accrueCompletedSeasonParticipation({
    careerState: reportCareerState,
    seasonResults,
  });
  const participationLedger = careerStateWithParticipation.playerParticipationLedger;
  const participationRows = participationLedger?.rowKeys.flatMap((rowKey) => {
    const row = participationLedger.rows[rowKey];
    return row === undefined ? [] : [row];
  }) ?? [];
  observeParticipationRows?.(
    context.seasonNumber,
    participationRows,
    careerStateWithParticipation,
  );
  const competition = selectedCompetition(league, careerStateWithParticipation);
  const transferWindows = resolveSeasonTransferWindows({
    competitionId: competition.id,
    seasonId: context.careerState.gameState.calendar.currentSeasonId,
    seasonStartYear: seasonStartYearFromDate(
      context.careerState.gameState.calendar.currentDate,
    ),
  });
  const valuationConfig = selectPlayerValuationConfig(
    careerStateWithParticipation.gameState.meta.calibrationVersions,
  );
  const wagePolicy = selectPlayerWagePolicyConfig(
    careerStateWithParticipation.gameState.meta.calibrationVersions,
  );
  const marketBehaviorPolicy = selectMarketBehaviorCalibration(
    careerStateWithParticipation.gameState.meta.calibrationVersions,
  );
  const askingPriceConfig = selectAskingPriceCurves(
    careerStateWithParticipation.gameState.meta.calibrationVersions,
  );
  const annualIntake = createAnnualWorldIntakeCandidateProviders({
    worldSeed,
    seasonIndex: context.seasonNumber - 1,
    seniorCandidatesPerClub: LONG_RUN_INTAKE_CANDIDATES_PER_CLUB,
  });
  const advanced = advanceCareerOneSeason({
    careerState: careerStateWithParticipation,
    worldSeed,
    mode: {
      kind: "reportRefresh",
      nextSeasonId,
      nextSeasonStartDate,
      competitionResults: registry.competitionIds.map(
        (competitionId, index) => {
          const competitionResult = seasonResults[index];
          const registeredCompetition = registry.competitions[competitionId];
          if (competitionResult === undefined || registeredCompetition === undefined) {
            throw new Error(`Report competition result is missing: ${competitionId}`);
          }
          return {
            competitionId,
            finalTable: competitionResult.table,
            ...(registeredCompetition.seasonDistribution === undefined
              ? {}
              : { seasonDistribution: registeredCompetition.seasonDistribution }),
          };
        },
      ),
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
    playerDevelopmentEnvironmentConfig: selectPlayerDevelopmentEnvironmentConfig(
      careerStateWithParticipation.gameState.meta.calibrationVersions,
    ),
  });

  if (advanced.status !== "advanced") {
    throw new Error(`Cannot advance report career season ${context.seasonNumber}: ${advanced.reason}`);
  }
  for (const signing of advanced.facts.squadMaintenance.freeAgentSignings) {
    const player = advanced.careerState.gameState.players[signing.playerId];
    const primaryPosition = player?.naturalPositions[0];
    if (player === undefined || primaryPosition === undefined) {
      throw new Error(
        `Canonical free-agent signing lost its player: ${signing.playerId}`,
      );
    }
    const assessment = derivePublicPlayerAssessment({
      player,
      currentDate: advanced.careerState.gameState.calendar.currentDate,
      potentialProjectionPolicy: valuationConfig.potentialProjectionPolicy,
      ratingScale: valuationConfig.ratingScale,
    });
    const publicValue = derivePlayerValuation({
      assessment,
      primaryPosition,
      config: valuationConfig,
    }).value;
    canonicalFreeAgentSigningObservations.push({
      observationId:
        `${worldSeed}|free-agent-maintenance|${context.seasonNumber}|${signing.clubId}|${signing.playerId}`,
      playerId: String(signing.playerId),
      completedSigningFingerprint: stableDiagnosticFingerprint({
        seasonNumber: context.seasonNumber,
        occurredOn: advanced.careerState.gameState.calendar.currentDate,
        clubId: signing.clubId,
        playerId: signing.playerId,
        completedFeeMinorUnits: 0,
      }),
      publicValueMinorUnits: Number(publicValue),
      // Canonical free-agent replenishment has no seller or transfer-fee leg.
      transferFeeMinorUnits: 0,
    });
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
  const allocatedStoredCeilingSixPlayerIds =
    annualIntakeDiagnostics.allocation.potentialSixPlayerKeys.map(String);
  const generatedStoredCeilingSixPlayerIds =
    annualIntakeDiagnostics.generatedStoredCeilingSixPlayerIds.map(String);
  const seasonIndex = context.seasonNumber;
  const postRolloverObservations = phase80AActiveCareerObservations({
    seed: worldSeed,
    seasonStartYear: seasonStartYearFromDate(
      advanced.careerState.gameState.calendar.currentDate,
    ),
    careerState: advanced.careerState,
    valuationConfig,
  });
  const stockSnapshot = phase80AExceptionalStockSnapshot({
    seed: worldSeed,
    seasonIndex,
    targetYoungStoredCeilingSixCount:
      annualIntakeDiagnostics.allocation.targetActiveYoungPotentialSixCount,
    careerState: advanced.careerState,
    observations: postRolloverObservations,
  });
  exceptionalStockSnapshots.push(stockSnapshot);
  const activeStoredCeilingSixPlayerIds = stockSnapshot.players
    .filter(
      ({ age, storedPotentialCeilingRating }) =>
        age >= 15
        && age <= 20
        && storedPotentialCeilingRating === 6,
    )
    .map(({ playerId }) => playerId);
  annualIntakeObservations.push({
    seasonIndex: context.seasonNumber - 1,
    allocatedStoredCeilingSixPlayerIds,
    generatedStoredCeilingSixPlayerIds,
    acceptedStoredCeilingSixPlayerIds:
      generatedStoredCeilingSixPlayerIds.filter((id) =>
        acceptedYouthIds.has(id)
      ),
    activeStoredCeilingSixPlayerIds,
  });
  inspection?.observeSeasonBoundary?.({
    seasonNumber: context.seasonNumber,
    previousCareerState: reportCareerState,
    careerState: advanced.careerState,
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
  return completedPlayerAge(
    player.birthDate,
    careerState.gameState.calendar.currentDate,
  );
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
 * Aggregates stable player-economy gate keys without retaining player rows.
 *
 * Threshold disagreement is rejected because it would make two worker
 * partitions interpret the same key differently. Phase 80A prospect shares
 * sum their additive numerator and denominator before applying the frozen
 * cohort band once.
 */
export function aggregatePlayerEconomyGateEvidence(
  gatesByWorld: readonly (readonly PlayerGenerationEconomyGate[])[],
): readonly LongRunGatePlayerEconomyGateSummary[] {
  const keys = assertMatchingPlayerEconomyGateKeySets(gatesByWorld);
  return keys.map((key) => {
    const gates = gatesByWorld.flatMap((worldGates) =>
      worldGates.filter((gate) => gate.key === key)
    );
    const thresholds = new Set(gates.map(({ threshold }) => threshold));
    if (thresholds.size !== 1) {
      throw new Error(`Player-economy gate threshold mismatch: ${key}`);
    }
    const base = {
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
    const shareEvidence = gates.flatMap((gate) =>
      gate.cohortShareEvidence === undefined
        ? []
        : [gate.cohortShareEvidence]
    );
    const minimumEvidence = gates.flatMap((gate) =>
      gate.cohortMinimumEvidence === undefined
        ? []
        : [gate.cohortMinimumEvidence]
    );
    if (shareEvidence.length > 0 && minimumEvidence.length > 0) {
      throw new Error(`Player-economy gate mixes cohort evidence modes: ${key}`);
    }
    if (shareEvidence.length === 0 && minimumEvidence.length === 0) return base;
    if (shareEvidence.length > 0 && shareEvidence.length !== gates.length) {
      throw new Error(`Phase 80A cohort-share evidence mismatch: ${key}`);
    }
    if (shareEvidence.length > 0 && gates.some((gate, index) => {
      const evidence = shareEvidence[index];
      return evidence === undefined
        || !Number.isSafeInteger(evidence.matchingObservationCount)
        || evidence.matchingObservationCount < 0
        || evidence.matchingObservationCount > gate.observationCount
        || !Number.isSafeInteger(evidence.minimumBasisPoints)
        || !Number.isSafeInteger(evidence.maximumBasisPoints)
        || evidence.minimumBasisPoints < 0
        || evidence.minimumBasisPoints > evidence.maximumBasisPoints
        || evidence.maximumBasisPoints > 10_000;
    })) {
      throw new Error(`Phase 80A cohort-share evidence is invalid: ${key}`);
    }
    if (shareEvidence.length === 0) {
      if (minimumEvidence.length !== gates.length) {
        throw new Error(`Phase 80A cohort-minimum evidence mismatch: ${key}`);
      }
      if (minimumEvidence.some((evidence) =>
        !Number.isSafeInteger(evidence.evidenceObservationCount)
        || evidence.evidenceObservationCount < 0
        || !Number.isSafeInteger(evidence.minimumObservationCount)
        || evidence.minimumObservationCount < 1
      )) {
        throw new Error(`Phase 80A cohort-minimum evidence is invalid: ${key}`);
      }
      const minimums = new Set(
        minimumEvidence.map(({ minimumObservationCount }) => minimumObservationCount),
      );
      if (minimums.size !== 1) {
        throw new Error(`Phase 80A cohort-minimum threshold mismatch: ${key}`);
      }
      const minimumObservationCount = minimumEvidence[0]!.minimumObservationCount;
      const evidenceObservationCount = minimumEvidence.reduce(
        (sum, evidence) => sum + evidence.evidenceObservationCount,
        0,
      );
      return {
        ...base,
        cohortEvidenceObservationCount: evidenceObservationCount,
        minimumCohortEvidenceObservationCount: minimumObservationCount,
        violationCount:
          base.violationCount
          + (evidenceObservationCount < minimumObservationCount ? 1 : 0),
      };
    }
    const shareBands = new Set(shareEvidence.map((evidence) =>
      `${evidence.minimumBasisPoints}:${evidence.maximumBasisPoints}`
    ));
    if (shareBands.size !== 1) {
      throw new Error(`Phase 80A cohort-share band mismatch: ${key}`);
    }
    const firstEvidence = shareEvidence[0]!;
    const matchingObservationCount = shareEvidence.reduce(
      (sum, evidence) => sum + evidence.matchingObservationCount,
      0,
    );
    const shareBasisPoints = base.observationCount === 0
      ? undefined
      : Math.round(
          matchingObservationCount * 10_000 / base.observationCount,
        );
    const cohortViolationCount = shareBasisPoints === undefined
      || shareBasisPoints < firstEvidence.minimumBasisPoints
      || shareBasisPoints > firstEvidence.maximumBasisPoints
      ? 1
      : 0;
    return {
      ...base,
      matchingObservationCount,
      ...(shareBasisPoints === undefined ? {} : { shareBasisPoints }),
      violationCount: base.violationCount + cohortViolationCount,
    };
  });
}

/**
 * Requires every world to expose the same unique gate contract.
 *
 * Aggregating the union would let a stale checkpoint contribute a partial
 * denominator for a gate that exists only in newer shards.
 */
function assertMatchingPlayerEconomyGateKeySets(
  gatesByWorld: readonly (readonly PlayerGenerationEconomyGate[])[],
): readonly string[] {
  const expectedKeys = sortedUniquePlayerEconomyGateKeys(gatesByWorld[0] ?? []);
  for (const [worldIndex, gates] of gatesByWorld.entries()) {
    const keys = sortedUniquePlayerEconomyGateKeys(gates);
    if (keys.length !== gates.length) {
      throw new Error(
        `Player-economy gate keys must be unique in world ${worldIndex + 1}`,
      );
    }
    if (
      keys.length !== expectedKeys.length
      || keys.some((key, index) => key !== expectedKeys[index])
    ) {
      throw new Error(
        `Player-economy gate key-set mismatch in world ${worldIndex + 1}`,
      );
    }
  }
  return expectedKeys;
}

/** Produces one deterministic key set for semantic checkpoint comparison. */
function sortedUniquePlayerEconomyGateKeys(
  gates: readonly PlayerGenerationEconomyGate[],
): string[] {
  return [...new Set(gates.map(({ key }) => key))].sort();
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

/** Worker payload kinds this module is the entry point for. */
const TEN_SEASON_REPORT_WORKER_KINDS: ReadonlySet<string> = new Set([
  "long-run-gate",
  "player-development-cohort",
]);

/**
 * Whether a worker payload belongs to this module at all.
 *
 * This block runs on import, so it also runs inside *other* modules' workers
 * that happen to import this one. Answering their payloads - even to reject
 * them - posts a failure message their own entry point never sent, and the run
 * dies with this module's error. Claim only what this module owns.
 */
function isTenSeasonReportWorkerPayload(value: unknown): boolean {
  const kind = (value as { readonly reportKind?: string } | undefined)?.reportKind;

  return kind !== undefined && TEN_SEASON_REPORT_WORKER_KINDS.has(kind);
}

if (!isMainThread && isTenSeasonReportWorkerPayload(workerData)) {
  try {
    if (isLongRunGateWorkerData(workerData)) {
      parentPort?.postMessage(runLongRunGatePartition(workerData));
    } else if (isPlayerDevelopmentCohortWorkerData(workerData)) {
      parentPort?.postMessage(runPlayerDevelopmentCohortWorker(workerData));
    } else {
      throw new Error("Malformed ten-season report worker payload");
    }
  } catch (error) {
    parentPort?.postMessage({
      ok: false,
      message: error instanceof Error ? error.message : String(error),
    } satisfies LongRunGateWorkerFailure);
  }
}
