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
  DEFAULT_LONG_RUN_SEASON_COUNT,
  longRunSeasonSeed,
  runLongRunSimulation,
  type CreateLongRunSeasonInputContext,
  type LongRunSeasonResult,
  type LongRunSimulationResult,
  type RunLongRunSimulationInput,
} from "./long-run/long-runner.ts";

export {
  createLongRunPlayerEvolutionReport,
  type CreateLongRunPlayerEvolutionReportInput,
  type LongRunPlayerEvolutionReport,
  type LongRunPlayerMovementRow,
  type LongRunPlayerProductionRow,
  type LongRunPlayerSnapshotRow,
} from "./long-run/player-evolution.ts";

export {
  createLongRunClubStabilityReport,
  type LongRunClubSeasonRow,
  type LongRunClubStabilityReport,
} from "./long-run/club-stability.ts";

export {
  createLongRunAnomalyReport,
  type CreateLongRunAnomalyReportInput,
  type LongRunAnomalyCheck,
  type LongRunAnomalyReport,
  type LongRunAnomalyStatus,
  type LongRunBalanceSeasonRow,
} from "./long-run/anomaly-scoring.ts";
