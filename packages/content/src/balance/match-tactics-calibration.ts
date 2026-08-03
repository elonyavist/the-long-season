import matchTacticsCalibrationJson from "./match-tactics-calibration.json" with { type: "json" };
import { parseMatchTacticsCalibrationAsset } from "../schemas/match-tactics-calibration.schema.ts";

/**
 * Validated, immutable match-tactics calibration.
 *
 * Composition roots pass this to the engine explicitly, because engine and
 * simulation-tools never import content. This is the only place the shipped
 * football coefficients exist: the engine owns the arithmetic and none of the
 * numbers.
 *
 * Parsing happens at import time, so a malformed or unbalanced asset fails
 * immediately rather than producing a quietly wrong match.
 */
export const matchTacticsCalibration = parseMatchTacticsCalibrationAsset(matchTacticsCalibrationJson);
