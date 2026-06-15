/**
 * Public entrypoint for deterministic simulation rules.
 *
 * Engine code may import only `@game/domain` and `@game/shared`. This file is
 * intentionally limited to pure deterministic simulation helpers.
 */
export {
  deriveTeamStrength,
  TeamStrengthError,
  type AbilityWeightKey,
  type DeriveTeamStrengthInput,
  type LineupSlot,
  type PlayerStateMultiplierCurves,
  type RoleWeightProfile,
  type StateMultiplierCurve,
  type TeamStrength,
  type TeamStrengthDepartment,
  type TeamStrengthErrorCode,
} from "./match-engine/team-strength.ts";

export {
  assertValidMatchContext,
  buildMatchRngKey,
  isValidMatchContext,
  matchRngKeyParts,
  MatchContextError,
  type MatchContext,
  type MatchContextErrorCode,
  type MatchRngKey,
  type MatchTacticalDistributionInput,
  type MatchTeamContext,
} from "./match-engine/match-context.ts";

export {
  isValidMatchEngineConfig,
  type ConversionBand,
  type MatchEngineConfig,
  type MatchRateConfig,
  type TacticalDistributionCaps,
  type TacticalKnobCap,
} from "./match-engine/match-engine-config.ts";
