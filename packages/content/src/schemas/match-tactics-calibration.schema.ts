import * as v from "valibot";

import {
  CANONICAL_PLAYER_ROLES,
  MATCH_TACTICS_CALIBRATION_SCHEMA_VERSION,
  PLAYER_ABILITY_KEYS,
  POSITION_SUITABILITIES,
  TACTIC_KNOBS,
  TACTIC_MENTALITIES,
  OWN_SQUAD_TACTIC_PROFILE_KEYS,
  TACTICAL_SHAPE_CAPACITIES,
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
const positiveBasisPoints = v.pipe(safeInteger, v.minValue(1), v.maxValue(10_000));
const nonNegativeInteger = v.pipe(safeInteger, v.minValue(0));
const positiveInteger = v.pipe(safeInteger, v.minValue(1));

const taskAllocationsSchema = v.strictObject(
  Object.fromEntries(TACTICAL_SHAPE_TASKS.map((task) => [task, nonNegativeInteger])) as Record<
    (typeof TACTICAL_SHAPE_TASKS)[number],
    typeof nonNegativeInteger
  >,
);

const taskAbilityWeightsSchema = v.record(
  v.picklist(PLAYER_ABILITY_KEYS),
  nonNegativeInteger,
);

const tacticalShapeSchema = v.strictObject({
  outfieldRoleBudgetBasisPoints: positiveInteger,
  taskAllocationBasisPointsByRole: v.strictObject(
    Object.fromEntries(CANONICAL_PLAYER_ROLES.map((role) => [role, taskAllocationsSchema])) as Record<
      (typeof CANONICAL_PLAYER_ROLES)[number],
      typeof taskAllocationsSchema
    >,
  ),
  taskAbilityWeightsBasisPointsByTask: v.strictObject(
    Object.fromEntries(TACTICAL_SHAPE_TASKS.map((task) => [
      task,
      v.record(v.picklist(PLAYER_ABILITY_KEYS), nonNegativeInteger),
    ])) as Record<
      (typeof TACTICAL_SHAPE_TASKS)[number],
      typeof taskAbilityWeightsSchema
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

const chanceActorSelectionSchema = v.strictObject({
  nonSetPieceAssistEligibilityBasisPoints: basisPoints,
  shooterPropensityBasisPointsByRole: v.strictObject(
    Object.fromEntries(CANONICAL_PLAYER_ROLES.map((role) => [role, nonNegativeInteger])) as Record<
      (typeof CANONICAL_PLAYER_ROLES)[number],
      typeof nonNegativeInteger
    >,
  ),
});

const tacticalMatchupSchema = v.strictObject({
  chainBottleneckWeightBasisPoints: basisPoints,
  pressingContestWeightBasisPoints: basisPoints,
});

const knobMagnitudesSchema = v.strictObject(
  Object.fromEntries(TACTIC_KNOBS.map((knob) => [knob, basisPoints])) as Record<
    (typeof TACTIC_KNOBS)[number],
    typeof basisPoints
  >,
);

const tacticalSemanticsSchema = v.strictObject({
  routeAffinityBasisPointsByKnob: knobMagnitudesSchema,
  lateralFocusAffinityBasisPoints: basisPoints,
  volumeBasisPointsByKnob: knobMagnitudesSchema,
  exposureBasisPointsByKnob: knobMagnitudesSchema,
  controlBasisPointsByKnob: knobMagnitudesSchema,
  commitmentBasisPointsByMentality: v.strictObject(
    Object.fromEntries(TACTIC_MENTALITIES.map((mentality) => [mentality, positiveInteger])) as Record<
      (typeof TACTIC_MENTALITIES)[number],
      typeof positiveInteger
    >,
  ),
  scoreStateCommitmentBasisPoints: basisPoints,
  shapeControlShareBasisPoints: basisPoints,
  routeCapacitySeparationBasisPoints: positiveInteger,
  possessionChanceInfluenceBasisPoints: positiveInteger,
  routeQualityBiasBasisPoints: basisPoints,
  routeSelectionSharpness: positiveInteger,
});

const ownSquadDemandSchema = v.strictObject(
  Object.fromEntries(TACTICAL_SHAPE_CAPACITIES.map((capacity) => [capacity, basisPoints])) as Record<
    (typeof TACTICAL_SHAPE_CAPACITIES)[number],
    typeof basisPoints
  >,
);

const ownSquadTacticalPolicySchema = v.strictObject({
  profileFitShareBasisPoints: basisPoints,
  profileFitReferenceBasisPointsByCapacity: ownSquadDemandSchema,
  profileFitScaleBasisPointsByCapacity: v.strictObject(
    Object.fromEntries(TACTICAL_SHAPE_CAPACITIES.map((capacity) => [capacity, positiveBasisPoints])) as Record<
      (typeof TACTICAL_SHAPE_CAPACITIES)[number],
      typeof positiveBasisPoints
    >,
  ),
  minimumCommitmentAdvantageBasisPoints: positiveBasisPoints,
  minimumLateralFocusAdvantageBasisPoints: positiveBasisPoints,
  profiles: v.array(v.strictObject({
    profileKey: v.picklist(OWN_SQUAD_TACTIC_PROFILE_KEYS),
    tactic: v.strictObject({
      mentality: v.picklist(TACTIC_MENTALITIES),
      directness: v.pipe(v.number(), v.minValue(0), v.maxValue(1)),
      pressing: v.pipe(v.number(), v.minValue(0), v.maxValue(1)),
      width: v.pipe(v.number(), v.minValue(0), v.maxValue(1)),
      risk: v.pipe(v.number(), v.minValue(0), v.maxValue(1)),
    }),
    demandBasisPointsByCapacity: ownSquadDemandSchema,
  })),
});

const matchTacticsCalibrationSchema = v.strictObject({
  schemaVersion: v.literal(MATCH_TACTICS_CALIBRATION_SCHEMA_VERSION),
  version: nonEmptyString,
  classification: v.literal("explicit_game_design_target"),
  chanceActorSelection: chanceActorSelectionSchema,
  tacticalShape: tacticalShapeSchema,
  tacticalMatchup: tacticalMatchupSchema,
  tacticalSemantics: tacticalSemanticsSchema,
  ownSquadTacticalPolicy: ownSquadTacticalPolicySchema,
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
 * its own beyond lineup size. Task allocations are not individually capped at
 * `10000`: one task may receive more than one full unit, while the domain owns
 * the exact common row total that makes the allocation finite.
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
