/**
 * Public entrypoint for deterministic offline simulation tooling.
 *
 * Simulation tools may depend on `domain`, `engine`, and `shared`, but must not
 * import content, storage, or apps. App shells provide content-specific input.
 */
export {
  createCalibrationReport,
  seasonSeed,
  type CalibrationMetricKey,
  type CalibrationMetricResult,
  type CalibrationReport,
  type CalibrationSeasonSummary,
  type CalibrationTarget,
  type CreateCalibrationReportInput,
} from "./calibration-report.ts";

export {
  createPlayerMarketCalibrationReport,
  type CreatePlayerMarketCalibrationReportInput,
  type PlayerMarketCalibrationObservation,
  type PlayerMarketCalibrationReport,
  type PlayerMarketCalibrationSampleMetadata,
  type PlayerMarketClubSquadObservation,
  type PlayerMarketDivisionDiagnostic,
  type PlayerMarketDivisionValueFit,
  type PlayerMarketSquadComparator,
  type PlayerMarketValueFitCheck,
  type PlayerRatingHistogram,
} from "./player-market-calibration-report.ts";

export {
  createPlayerGenerationEconomyAudit,
  createPlayerGenerationAnnualIntakeSummary,
  type CreatePlayerGenerationEconomyAuditInput,
  type PlayerGenerationAnnualIntakeObservation,
  type PlayerGenerationAnnualIntakeSummary,
  type PlayerExceptionalAllocationLabels,
  type PlayerGenerationAllocationSummary,
  type PlayerGenerationCapSummary,
  type PlayerGenerationEconomyAudit,
  type PlayerGenerationEconomyGate,
  type PlayerGenerationEconomyObservation,
  type PlayerGenerationExceptionalSlice,
  type PlayerGenerationGateExample,
  type PlayerGenerationGateStatus,
  type PlayerGenerationInitialRarityConstraints,
  type PlayerGenerationMoneyDistribution,
  type PlayerGenerationNegotiationObservation,
  type PlayerGenerationNegotiationSummary,
  type PlayerGenerationCounterOutcome,
  type PlayerGenerationNumberDistribution,
  type PlayerGenerationPopulation,
  type PlayerGenerationPotentialRangeSlice,
  type PlayerGenerationRatioDistribution,
  type PlayerGenerationRatingDistribution,
  type PlayerGenerationRoleGroup,
  type PlayerGenerationSellerOutcome,
  type SuppliedNegotiationAggregate,
} from "./player-generation-economy-audit.ts";

export {
  PUBLIC_UPPER_EXCEEDANCE_MAXIMUM_BASIS_POINTS,
  PUBLIC_UPPER_EXCEEDANCE_MINIMUM_BASIS_POINTS,
  createPotentialProjectionPolicyCalibration,
  createPlayerPotentialOutcomeAudit,
  type CreatePlayerPotentialOutcomeAuditInput,
  type PlayerPotentialOutcomeAudit,
  type PlayerPotentialOutcomeCell,
  type PlayerPotentialOutcomeCoverageContract,
  type PlayerPotentialOutcomeGate,
  type PlayerPotentialOutcomeGateExample,
  type PlayerPotentialOutcomeObservation,
  type PotentialProjectionCalibrationAgeBand,
  type PotentialProjectionPolicyCalibrationBand,
  type PotentialOutcomeDistribution,
  type PotentialOutcomeParticipationBand,
  type PotentialOutcomeRoleGroup,
  type PotentialOutcomeRoomBand,
} from "./player-potential-outcome-audit.ts";

export {
  DEFAULT_LONG_RUN_SEASON_COUNT,
  longRunSeasonSeed,
  runLongRunSimulation,
  type CreateLongRunSeasonInputContext,
  type LongRunSeasonResult,
  type LongRunSimulationResult,
  type RunLongRunSimulationInput,
} from "./long-run/long-runner.ts";

export {
  SIMULATION_WORKER_LIMIT,
  resolveSimulationWorkerCount,
  type ResolveSimulationWorkerCountInput,
} from "./simulation-execution-policy.ts";

export {
  runCareerLongRunSimulation,
  type AdvanceCareerLongRunSeasonContext,
  type AdvanceCareerLongRunSeasonResult,
  type CareerLongRunAdvancedSeasonObservation,
  type CareerLongRunRefreshSummary,
  type CareerLongRunSeasonResult,
  type CareerLongRunSimulationResult,
  type CreateCareerLongRunSeasonInputContext,
  type RunCareerLongRunSimulationInput,
} from "./long-run/career-long-runner.ts";

export {
  createLongRunPlayerEvolutionReport,
  type CreateLongRunPlayerEvolutionReportInput,
  type LongRunPlayerEvolutionReport,
  type LongRunPlayerMovementRow,
  type LongRunPlayerProductionRow,
  type LongRunPlayerSnapshotRow,
  type LongRunPlayerTrajectoryCheck,
  type LongRunPlayerTrajectoryDiagnostics,
  type LongRunPlayerTrajectorySampleRow,
} from "./long-run/player-evolution.ts";

export {
  createLongRunClubStabilityReport,
  type LongRunClubSeasonRow,
  type LongRunClubStabilityReport,
  type LongRunRefreshTotals,
} from "./long-run/club-stability.ts";

export {
  createLongRunAnomalyReport,
  worstLongRunAnomalyStatus,
  type CreateLongRunAnomalyReportInput,
  type LongRunAnomalyCheck,
  type LongRunAnomalyReport,
  type LongRunAnomalyStatus,
  type LongRunBalanceSeasonRow,
} from "./long-run/anomaly-scoring.ts";

export {
  createLongRunYouthStabilityReport,
  type CreateLongRunYouthStabilityReportOptions,
  type LongRunYouthSeasonRow,
  type LongRunYouthStabilityCheck,
  type LongRunYouthStabilityReport,
} from "./long-run/youth-stability.ts";

export {
  createLongRunContractFinanceSeasonRow,
  createLongRunContractFinanceStabilityReport,
  type CreateLongRunContractFinanceSeasonRowInput,
  type LongRunContractFinanceCheck,
  type LongRunContractFinanceSeasonRow,
  type LongRunContractFinanceStabilityReport,
  type LongRunCrossTierTransferRow,
  type LongRunDivisionMarketEconomyRow,
  type LongRunDivisionWageEconomyRow,
  type LongRunFreeAgentBands,
  type LongRunFreeAgentFlow,
  type LongRunLedgerReasonAmounts,
  type LongRunPermanentTransferFunnel,
  type LongRunPreliminaryAgreementFunnel,
  type LongRunSquadDepartment,
} from "./long-run/contract-finance-stability.ts";

export {
  liveMatchControlWorldSeed,
  runLiveMatchControlGate,
  verifyLiveMatchControlGateReproducibility,
  type LiveMatchControlDistribution,
  type LiveMatchControlDistributionKey,
  type LiveMatchControlFailure,
  type LiveMatchControlFixtureSetup,
  type LiveMatchControlGateReport,
  type LiveMatchControlGateWorld,
  type LiveMatchControlInvariantKey,
  type LiveMatchControlReproducibility,
  type LiveMatchControlResultRates,
  type LiveMatchControlWorldSummary,
  type RunLiveMatchControlGateInput,
} from "./live-match/live-match-control-gate.ts";
