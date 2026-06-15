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
