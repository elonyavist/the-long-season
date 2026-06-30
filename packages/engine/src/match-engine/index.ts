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
  createMatchExplanationTrace,
  MATCH_EXPLANATION_TRACE_SCHEMA_VERSION,
  type CreateMatchExplanationTraceInput,
  type MatchExplanationConditionSnapshot,
  type MatchExplanationCountBucket,
  type MatchExplanationEffectDirection,
  type MatchExplanationFactorKey,
  type MatchExplanationLineupSlotSnapshot,
  type MatchExplanationLineupSnapshot,
  type MatchExplanationOpportunitySideSummary,
  type MatchExplanationOpportunitySummary,
  type MatchExplanationSide,
  type MatchExplanationStrengthSnapshot,
  type MatchExplanationTacticSnapshot,
  type MatchExplanationTeamSnapshot,
  type MatchExplanationTrace,
  type MatchExplanationVarianceMarker,
  type MatchExplanationVarianceSnapshot,
} from "./match-explanation-trace.ts";

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
  buildPlayerMatchRatings,
  playerRatingRegistrationsFromContext,
  type BuildPlayerMatchRatingsInput,
  type PlayerMatchInvolvementSummary,
  type PlayerMatchRatingRegistration,
  type PlayerMatchRatingRow,
  type PlayerMatchRatingSortMode,
} from "./player-match-rating.ts";

export {
  applyHalfTimeSubstitutions,
  type ApplyHalfTimeSubstitutionsInput,
  type ApplyHalfTimeSubstitutionsResult,
  type HalfTimeSubstitutionInvalidReason,
  type HalfTimeSubstitutionsApplied,
  type HalfTimeSubstitutionsInvalid,
} from "./half-time-substitutions.ts";

export type { HalfTimeTacticalDecisionPlan, MatchSubstitutionDecision } from "@game/domain";

export {
  createInitialStagedMatchState,
  phaseForMinute,
  progressStagedMatchToFullTime,
  progressStagedMatchToHalfTime,
  progressStagedMatchToPhase,
  StagedMatchProgressionError,
  type StagedMatchProgressionErrorCode,
  type StagedMatchProgressionOptions,
  type StagedMatchProgressionResult,
  type StagedMatchSnapshot,
  type StagedMatchState,
  type StagedMatchTargetPhase,
} from "./staged-match-progression.ts";

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
