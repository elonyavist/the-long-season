/**
 * Public match-engine entrypoint.
 *
 * This module groups match-engine contracts without introducing dependencies
 * outside `domain` and `shared`.
 */
export {
  AggregateOccasionResolver,
} from "./aggregate-occasion-resolver.ts";

export {
  isValidMatchEngineConfig,
  type ConversionBand,
  type MatchEngineConfig,
  type MatchRateConfig,
  type TacticalDistributionCaps,
  type TacticalKnobCap,
} from "./match-engine-config.ts";

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
} from "./match-context.ts";

export {
  buildManualTacticChangeSchedule,
  isValidManualTacticChangeSchedule,
  ManualTacticChangeError,
  type BuildManualTacticChangeScheduleInput,
  type ManualTacticChange,
  type ManualTacticChangeErrorCode,
  type ManualTacticChangeSchedule,
} from "./manual-tactic-change.ts";

export {
  createInitialMatchSimulationState,
  isMatchSimulationComplete,
  type MatchLocalState,
  type MatchScore,
  type MatchSide,
  type MatchSideStats,
  type MatchSimulationState,
  type MatchSimulationStats,
} from "./match-simulation-state.ts";

export {
  type OccasionOutcome,
  type OccasionResolution,
  type OccasionResolver,
  type ResolveOccasionInput,
} from "./occasion-resolver.ts";

export {
  simulateMatch,
  SimulateMatchError,
  type SimulateMatchErrorCode,
  type SimulateMatchOptions,
  type SimulateMatchResult,
} from "./simulate-match.ts";

export {
  simulateMatchWithManualTactics,
  type SimulateMatchWithManualTacticsOptions,
} from "./simulate-match-with-manual-tactics.ts";

export {
  stepMatch,
  type MatchFullTimeStepEvent,
  type MatchHalfTimeStepEvent,
  type MatchKickoffStepEvent,
  type MatchShotOutcomeStepEvent,
  type MatchStepEvent,
  type StepMatchInput,
  type StepMatchResult,
} from "./step-match.ts";

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
} from "./team-strength.ts";

export {
  buildTacticTeamContext,
  tacticToMatchDistribution,
  TacticTeamContextError,
  type BuildTacticTeamContextInput,
  type TacticTeamContextErrorCode,
} from "./tactic-team-context.ts";
