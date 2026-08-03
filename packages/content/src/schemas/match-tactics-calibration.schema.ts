import * as v from "valibot";

import {
  CANONICAL_PLAYER_ROLES,
  MATCH_TACTICS_CALIBRATION_SCHEMA_VERSION,
  POSITION_SUITABILITIES,
  TACTICAL_SHAPE_TASKS,
  validateMatchTacticsCalibration,
  type MatchTacticsCalibrationConfig,
} from "@game/domain";

/**
 * Raw asset shape accepted before validation.
 *
 * The parser exists so a malformed JSON file fails at import time with a
 * readable message instead of producing silent `undefined` weights inside the
 * match engine.
 */
export type RawMatchTacticsCalibrationAsset = unknown;

/** Typed failure raised when the match-tactics asset is unusable. */
export class MatchTacticsCalibrationValidationError extends Error {
  /** Creates one content-side match-tactics validation failure. */
  public constructor(message: string) {
    super(message);
    this.name = "MatchTacticsCalibrationValidationError";
  }
}

const nonEmptyString = v.pipe(v.string(), v.minLength(1));
const safeInteger = v.pipe(v.number(), v.safeInteger());
const basisPoints = v.pipe(safeInteger, v.minValue(0), v.maxValue(10_000));
const positiveInteger = v.pipe(safeInteger, v.minValue(1));

const taskWeightsSchema = v.strictObject(
  Object.fromEntries(TACTICAL_SHAPE_TASKS.map((task) => [task, basisPoints])) as Record<
    (typeof TACTICAL_SHAPE_TASKS)[number],
    typeof basisPoints
  >,
);

const tacticalShapeSchema = v.strictObject({
  contributionWeightBasisPointsByRoleAndTask: v.strictObject(
    Object.fromEntries(CANONICAL_PLAYER_ROLES.map((role) => [role, taskWeightsSchema])) as Record<
      (typeof CANONICAL_PLAYER_ROLES)[number],
      typeof taskWeightsSchema
    >,
  ),
  marginalContributionBasisPointsByRank: v.array(basisPoints),
  channelPolicy: v.strictObject({
    halfChannelOwnShareBasisPoints: basisPoints,
  }),
  coordinationMultiplierBasisPointsBySuitability: v.strictObject(
    Object.fromEntries(POSITION_SUITABILITIES.map((suitability) => [suitability, basisPoints])) as Record<
      (typeof POSITION_SUITABILITIES)[number],
      typeof basisPoints
    >,
  ),
  saturationReferenceMilliByTask: v.strictObject(
    Object.fromEntries(TACTICAL_SHAPE_TASKS.map((task) => [task, positiveInteger])) as Record<
      (typeof TACTICAL_SHAPE_TASKS)[number],
      typeof positiveInteger
    >,
  ),
});

const tacticalMatchupSchema = v.strictObject({
  chainBottleneckWeightBasisPoints: basisPoints,
  pressingContestWeightBasisPoints: basisPoints,
});

const matchTacticsCalibrationSchema = v.strictObject({
  schemaVersion: v.literal(MATCH_TACTICS_CALIBRATION_SCHEMA_VERSION),
  version: nonEmptyString,
  classification: v.literal("explicit_game_design_target"),
  tacticalShape: tacticalShapeSchema,
  tacticalMatchup: tacticalMatchupSchema,
});

/**
 * Parses and validates the versioned match-tactics calibration asset.
 *
 * Two layers, on purpose. The schema proves the file has exactly the declared
 * keys and integer ranges; the domain validator proves the numbers obey the
 * football and mathematical constraints - non-negative weights, a strictly
 * decreasing and strictly positive marginal ladder, a goalkeeper who
 * contributes to nothing, and no outfield role that leaves a task empty.
 *
 * Anything that passes both is safe for the match engine to consume without
 * re-checking, which is why the engine derivation contains no validation of
 * its own beyond lineup size.
 *
 * @example
 * const calibration = parseMatchTacticsCalibrationAsset(rawJson);
 */
export function parseMatchTacticsCalibrationAsset(
  raw: RawMatchTacticsCalibrationAsset,
): MatchTacticsCalibrationConfig {
  let parsed: MatchTacticsCalibrationConfig;

  try {
    parsed = v.parse(matchTacticsCalibrationSchema, raw);
  } catch (error) {
    throw validationError("match-tactics schema validation failed", error);
  }

  try {
    validateMatchTacticsCalibration(parsed);
  } catch (error) {
    throw validationError("match-tactics policy validation failed", error);
  }

  return deepFreeze(parsed);
}

function validationError(message: string, cause: unknown): MatchTacticsCalibrationValidationError {
  const detail = cause instanceof Error ? cause.message : String(cause);
  return new MatchTacticsCalibrationValidationError(`${message}: ${detail}`);
}

function deepFreeze<T>(value: T): T {
  if (typeof value !== "object" || value === null || Object.isFrozen(value)) {
    return value;
  }

  for (const child of Object.values(value)) {
    deepFreeze(child);
  }

  return Object.freeze(value);
}
