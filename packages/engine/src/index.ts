/**
 * Public entrypoint for deterministic simulation rules.
 *
 * Engine code may import only `@game/domain` and `@game/shared`. This file is
 * intentionally limited to pure deterministic simulation helpers.
 */
export * from "./match-engine/index.ts";
export * from "./market/index.ts";
export * from "./player-state/index.ts";
export * from "./squad/index.ts";
export * from "./team-selection/index.ts";
export {
  CareerMatchStateConsequenceError,
  applyCareerMatchStateConsequences,
  type ApplyCareerMatchStateConsequencesInput,
  type ApplyCareerMatchStateConsequencesResult,
  type CareerMatchPlayerStateConsequence,
  type CareerMatchStateConsequenceErrorCode,
  type CareerMatchStateConsequenceReasonKey,
  type CareerMatchStateConsequenceSummary,
  type CareerMatchStateParticipantRole,
} from "./career/career-match-state-consequences.ts";
export {
  applyCareerWeeklyRecovery,
  type ApplyCareerWeeklyRecoveryInput,
  type ApplyCareerWeeklyRecoveryResult,
  type CareerWeeklyRecoveryChange,
} from "./career/career-weekly-recovery.ts";
export {
  applyCareerPermanentTransfer,
  type ApplyCareerPermanentTransferInput,
  type ApplyCareerPermanentTransferResult,
} from "./career/apply-career-transfer.ts";
export {
  findNextCareerFixture,
  findUnavailableSelectedClubPlayerIdsForNextFixture,
  type NextCareerFixtureFound,
  type NextCareerFixtureInvalid,
  type NextCareerFixtureInvalidReason,
  type NextCareerFixtureNone,
  type NextCareerFixtureResult,
} from "./career/next-fixture.ts";
export {
  continueCareerUntilAttention,
  createMatchdayAttention,
  type CareerMatchdayAttention,
  type CareerContinueStopReason,
  type ContinueCareerPreparationInput,
  type ContinueCareerUntilAttentionInput,
  type ContinueCareerUntilAttentionResult,
} from "./career/continue-career.ts";
export {
  CareerInboxLifecycleError,
  acknowledgeImportantCareerInboxMessage,
  deliverCareerInboxMessages,
  openCareerInboxMessage,
  reconcileCareerInboxResolution,
  createMatchConsequenceInboxMessages,
  type CareerInboxLifecycleErrorCode,
} from "./career/career-inbox-lifecycle.ts";
export {
  applyMatchAvailabilityConsequences,
  injuryDurationDays,
  type ApplyMatchAvailabilityConsequencesInput,
  type ApplyMatchAvailabilityConsequencesResult,
} from "./career/match-availability-consequences.ts";
export {
  generateNextSeasonCalendar,
  type NextSeasonCalendarGenerated,
  type NextSeasonCalendarInvalid,
  type NextSeasonCalendarInvalidReason,
  type NextSeasonCalendarResult,
} from "./career/next-season-calendar.ts";
export {
  commitCompletedCareerFixture,
  progressNextCareerFixture,
  type CommitCompletedCareerFixtureInput,
  type ProgressCareerFixtureAdvanced,
  type ProgressCareerFixtureInvalid,
  type ProgressCareerFixtureInvalidReason,
  type ProgressCareerFixtureNone,
  type ProgressCareerFixtureResult,
  type ProgressCareerAiTeamSelectionInput,
  type ProgressNextCareerFixtureInput,
} from "./career/progress-fixture.ts";
export {
  advanceCareerMonths,
  monthKeyForCareerDate,
  type AdvanceCareerMonthsInput,
  type AdvanceCareerMonthsResult,
  type CareerMonthlyLifecycleSummary,
} from "./career/advance-career-month.ts";
export {
  accrueCommittedFixtureParticipation,
  buildFixtureParticipationContributions,
  type AccrueCommittedFixtureParticipationInput,
  type BuildFixtureParticipationContributionsInput,
  type BuildFixtureParticipationContributionsResult,
  type FixtureParticipationSideContext,
} from "./career/player-participation.ts";
export {
  developPlayersForSeason,
  summarizePlayerDevelopmentAbilities,
  totalPlayerAbilityDelta,
  type PlayerDevelopmentAbilitySummary,
  type PlayerDevelopmentChange,
  type PlayerDevelopmentInput,
  type PlayerDevelopmentResult,
} from "./career/player-development.ts";
export {
  applyPlayerAgingPolicy,
  currentAbilityFloor,
  monthlyDeclineFor,
  type ApplyPlayerAgingPolicyInput,
  type ApplyPlayerAgingPolicyResult,
} from "./career/player-aging-policy.ts";
export {
  monthlyDevelopmentPolicy,
  monthlyGrowthAgeMultiplier,
  monthlyOpportunityMultiplier,
  monthlyPerformanceModifier,
  type BroadPositionGroup,
  type MonthlyDevelopmentPolicy,
  type MonthlyDevelopmentPolicyInput,
} from "./career/player-development-policy.ts";
export {
  adaptPlayerRolesFromParticipation,
  type PlayerRoleAdaptationChange,
  type PlayerRoleAdaptationInput,
  type PlayerRoleAdaptationResult,
} from "./career/player-role-adaptation.ts";
export {
  applyEndOfSeasonPlayerExits,
  type PlayerExitInput,
  type PlayerExitReason,
  type PlayerExitRecord,
  type PlayerExitResult,
} from "./career/player-exits.ts";
export {
  CareerIntakePoolError,
  createCareerIntakePool,
  type CareerIntakeCandidate,
  type CareerIntakePoolErrorCode,
  type CareerIntakeRecord,
  type CreateCareerIntakePoolInput,
  type CreateCareerIntakePoolResult,
} from "./career/player-intake.ts";
export {
  applySeasonalYouthIntake,
  YOUTH_ACADEMY_TARGET_MAX_SIZE,
  YouthIntakeError,
  type ApplySeasonalYouthIntakeInput,
  type ApplySeasonalYouthIntakeResult,
  type YouthIntakeCandidate,
  type YouthIntakeErrorCode,
  type YouthIntakeRecord,
} from "./career/youth-intake.ts";
export {
  applyYouthAcademyLifecycle,
  type YouthAcademyLifecycleInput,
  type YouthAcademyLifecycleResult,
  type YouthLifecycleOutcome,
  type YouthLifecycleRecord,
} from "./career/youth-lifecycle.ts";
export {
  promoteYouthCandidatesToSeniorSquads,
  YOUTH_PROMOTION_SENIOR_TARGET_SIZE,
  type PromoteYouthCandidatesInput,
  type PromoteYouthCandidatesResult,
  type YouthPromotionReason,
  type YouthPromotionRecord,
} from "./career/youth-promotion.ts";
export {
  maintainCareerSquadShape,
  MINIMUM_CAREER_SQUAD_SIZE,
  TARGET_CAREER_SQUAD_SIZE,
  type MaintainCareerSquadShapeInput,
  type MaintainCareerSquadShapeResult,
  type SquadMaintenanceRecord,
  type SquadMaintenanceWarning,
} from "./career/squad-maintenance.ts";
export {
  simulateTransferTurnover,
  type SimulateTransferTurnoverInput,
  type SimulateTransferTurnoverResult,
  type TransferTurnoverRecord,
} from "./career/transfer-turnover.ts";
export {
  rolloverPlayersForNextSeason,
  type PlayerSeasonRolloverInput,
  type PlayerSeasonRolloverResult,
} from "./career/player-season-rollover.ts";
export {
  assessCareerSeasonCompletion,
  type CareerSeasonComplete,
  type CareerSeasonCompletionInvalid,
  type CareerSeasonCompletionInvalidReason,
  type CareerSeasonCompletionResult,
  type CareerSeasonIncomplete,
} from "./career/season-completion.ts";
export {
  advanceCareerOneSeason,
  type AdvanceCareerCompletedSeasonMode,
  type AdvanceCareerOneSeasonAdvanced,
  type AdvanceCareerOneSeasonInput,
  type AdvanceCareerOneSeasonInvalid,
  type AdvanceCareerOneSeasonInvalidReason,
  type AdvanceCareerOneSeasonMode,
  type AdvanceCareerOneSeasonResult,
  type AdvanceCareerReportRefreshMode,
  type CareerPlayerDevelopmentFact,
  type CareerPlayerExitFact,
  type CareerSeasonAdvancementFacts,
  type CareerSeasonAdvancementOperation,
  type CareerSeasonAdvancementWarning,
  type CareerSeasonArchiveFact,
  type CareerSquadHealthFact,
  type CareerSquadMaintenanceFact,
  type CareerTransferTurnoverFact,
  type CareerYouthHealthFact,
  type CareerYouthIntakeFact,
  type CareerYouthLifecycleFact,
  type CareerYouthPromotionFact,
} from "./career/advance-career-season.ts";
export { createMatchReport } from "./match-engine/create-match-report.ts";
export {
  ApplyMatchReportToFixtureError,
  applyMatchReportToFixture,
  type ApplyMatchReportToFixtureErrorCode,
  type ApplyMatchReportToFixtureInput,
  type ApplyMatchReportToFixtureOptions,
} from "./use-cases/apply-match-report-to-fixture.ts";
export {
  SimulateSeasonError,
  simulateSeason,
  type SimulateSeasonErrorCode,
  type SimulateSeasonAiSquadSelection,
  type SimulateSeasonFixtureLineupOverride,
  type SimulateSeasonInput,
  type SimulateSeasonResult,
  type SimulateSeasonSetupOverride,
  type SimulateSeasonTeamInput,
} from "./use-cases/simulate-season.ts";
export {
  CalendarGenerationError,
  generateRoundRobinCalendar,
  type CalendarGenerationErrorCode,
  type GenerateRoundRobinCalendarInput,
  type RoundRobinCalendar,
} from "./season-engine/calendar.ts";
export { computeLeagueTable, type ComputeLeagueTableInput } from "./season-engine/league-table.ts";
export {
  computeSeasonPlayerGoalStats,
  type ComputeSeasonPlayerGoalStatsInput,
  type SeasonPlayerGoalStatRow,
  type SeasonPlayerStatRegistration,
} from "./season-engine/player-stats.ts";
export {
  computePlayerMatchStats,
  type ComputePlayerMatchStatsInput,
  type PlayerMatchStatRegistration,
  type PlayerMatchStatRow,
  type PlayerMatchStatsSortMode,
} from "./season-engine/player-match-stats.ts";
