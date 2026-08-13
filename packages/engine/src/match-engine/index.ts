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
  type MatchDisciplineConfig,
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
  type MatchExplanationRouteSnapshot,
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
  type MatchPlayerIncidentProfile,
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
  telemetryFor,
  type MatchCausalSideStats,
  type MatchControlUnits,
  type MatchLocalState,
  type MatchScore,
  type MatchSide,
  type MatchSideStats,
  type MatchSimulationState,
  type MatchSimulationStats,
  type MatchSimulationTelemetry,
  type MatchPlayerInjuryState,
} from "./match-simulation-state.ts";
export {
  accumulateControlUnits,
  deriveMatchMinuteControl,
  opportunityChanceCreationMultiplier,
  type MatchMinuteControl,
} from "./match-control.ts";
export { progressOnPitchCondition } from "./match-condition.ts";
export {
  incidentProfileFor,
  resolveMatchMinuteDiscipline,
  type MatchDisciplineEvent,
  type MatchDisciplineResolution,
  type MatchPenaltyResolution,
  type MatchDirectFreeKickResolution,
} from "./match-discipline.ts";
export {
  MATCH_INJURY_RISK_POLICY,
  injuryForcesExit,
  matchInjuryProbability,
  resolveMatchMinuteInjury,
  severityForRoll,
  type MatchInjuryProbabilityInput,
} from "./match-injury.ts";

export {
  advanceProgressiveMatchMinute,
  applyConfirmedProgressiveTeamChanges,
  applyValidatedLiveMatchCommand,
  createProgressiveMatchMinuteSnapshot,
  createProgressiveMatchSession,
  pauseProgressiveMatchSession,
  progressiveMatchPhaseFor,
  ProgressiveMatchSessionError,
  resumeProgressiveMatchSession,
  resolveProgressiveMatchIncidentDecision,
  runProgressiveMatchToMinute,
  type AdvanceProgressiveMatchMinuteOptions,
  type ApplyConfirmedProgressiveTeamChangesInput,
  type AppliedLiveMatchCommandFact,
  type ApplyValidatedLiveMatchCommandResult,
  type CreateProgressiveMatchSessionOptions,
  type ProgressiveMatchAvailability,
  type ProgressiveMatchBeforeMinute,
  type ProgressiveMatchMinuteSnapshot,
  type ProgressiveMatchSessionErrorCode,
  type ProgressiveMatchSessionState,
  type ProgressiveMatchTeamAvailability,
  type ProgressiveMatchTeamSnapshot,
  type ResolveProgressiveIncidentDecisionInput,
  type RunProgressiveMatchToMinuteOptions,
  type RunProgressiveMatchToMinuteResult,
} from "./progressive-match-session.ts";

export {
  type OccasionOutcome,
  type OccasionResolution,
  type OccasionResolver,
  type ResolveOccasionInput,
} from "./occasion-resolver.ts";

// The occasion is the one door into actor selection and route quality. Chance
// actors are reached through `buildOccasionContext` and are deliberately not a
// second public entry, so nothing outside can pick a shooter without the route
// and the edges that go with him.
export {
  buildOccasionContext,
  type BuildOccasionContextInput,
  type OccasionContext,
} from "./occasion-context.ts";

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
  advancePlayerMatchRatingLedger,
  buildPlayerMatchRatings,
  createPlayerMatchRatingLedger,
  playerRatingRegistrationsFromContext,
  projectPlayerMatchRatings,
  type BuildPlayerMatchRatingsInput,
  type PlayerMatchRatingLedger,
  type PlayerMatchRatingLedgerEntry,
  type PlayerMatchInvolvementSummary,
  type PlayerMatchRatingRegistration,
  type PlayerMatchRatingRow,
  type PlayerMatchRatingSortMode,
} from "./player-match-rating.ts";
export {
  buildLiveMatchProjection,
  livePlayerRegistration,
  LiveMatchProjectionError,
  type BuildLiveMatchProjectionInput,
  type LiveMatchProjection,
  type LiveMatchProjectionErrorCode,
  type LivePlayerMatchProjection,
} from "./live-match-projection.ts";

export type { MatchSubstitutionDecision } from "@game/domain";

export {
  BALANCED_MATCH_LATERAL_FOCUS_BY_SIDE,
  stepMatch,
  type MatchLateralFocusBySide,
  type MatchFullTimeStepEvent,
  type MatchHalfTimeStepEvent,
  type MatchKickoffStepEvent,
  type MatchShotOutcomeStepEvent,
  type MatchStepEvent,
  type StepMatchInput,
  type StepMatchResult,
} from "./step-match.ts";

export {
  createLineupSlot,
  deriveLineupSlotScores,
  deriveLineupSlotTacticalEvaluations,
  deriveTeamStrength,
  roleWeightKeyForCanonicalRole,
  ROLE_WEIGHT_KEY_BY_CANONICAL_ROLE,
  teamStrengthFromSlotScores,
  TeamStrengthError,
  type CreateLineupSlotInput,
  type AbilityWeightKey,
  type DeriveTeamStrengthInput,
  type LineupSlot,
  type LineupSlotScore,
  type LineupSlotTacticalEvaluation,
  type PlayerStateMultiplierCurves,
  type RoleWeightProfile,
  type StateMultiplierCurve,
  type TeamStrength,
  type TeamStrengthDepartment,
  type TeamStrengthErrorCode,
} from "./team-strength.ts";

export {
  deriveTacticalTaskExecution,
  type TacticalTaskExecution,
} from "./tactical-task-execution.ts";

export {
  assertValidTacticalShapeProfile,
  deriveTacticalShapeProfile,
  TacticalShapeError,
  type DeriveTacticalShapeProfileInput,
  type TacticalShapeErrorCode,
  type TacticalShapeProfile,
} from "./tactical-shape.ts";

export {
  deriveOrdinaryTacticalShapeReference,
  deriveTacticalShapeEmphasis,
  ORDINARY_SHAPE_REFERENCE_ABILITY,
  OrdinaryTacticalShapeError,
  type OrdinaryTacticalShapeErrorCode,
  type OrdinaryTacticalShapeReferenceInput,
  type TacticalShapeCapacityValues,
} from "./ordinary-tactical-shape.ts";

export {
  deriveTacticalMatchup,
  TacticalMatchupError,
  type DeriveTacticalMatchupInput,
  type TacticalMatchup,
  type TacticalMatchupErrorCode,
  type TacticalRouteMatchup,
} from "./tactical-matchup.ts";

export {
  deriveOpportunityRoutePlan,
  expectedRouteSaturation,
  OPPORTUNITY_ROUTE_CHANCE_TYPE,
  opportunityRouteBudget,
  opportunityRouteQualityEdge,
  opportunityRoutePressure,
  opportunityRouteSaturation,
  opportunityRouteStrategicSignature,
  opportunityRouteWeights,
  opportunityRateBeforeClamp,
  OpportunityRouteError,
  selectOpportunityRoute,
  type DeriveOpportunityRoutePlanInput,
  type OpportunityRouteErrorCode,
  type OpportunityRoutePlan,
  type OpportunityRouteContest,
} from "./opportunity-route.ts";
export {
  assembleMatchTeamContext,
  buildTacticTeamContext,
  createMatchPlayerIncidentProfile,
  DEFAULT_MATCH_LINEUP_SIZE,
  deriveTeamShapeAndStrength,
  matchPlayerIncidentProfilesForLineup,
  tacticToMatchDistribution,
  TacticTeamContextError,
  type BuildTacticTeamContextInput,
  type AssembleMatchTeamContextInput,
  type DeriveTeamShapeAndStrengthInput,
  type TacticTeamContextErrorCode,
  type TeamShapeAndStrength,
} from "./tactic-team-context.ts";
