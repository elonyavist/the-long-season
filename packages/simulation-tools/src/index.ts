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
