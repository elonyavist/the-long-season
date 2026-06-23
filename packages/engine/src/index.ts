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
  type NextCareerFixtureFound,
  type NextCareerFixtureInvalid,
  type NextCareerFixtureInvalidReason,
  type NextCareerFixtureNone,
  type NextCareerFixtureResult,
} from "./career/next-fixture.ts";
export {
  continueCareerUntilAttention,
  type CareerContinueStopReason,
  type ContinueCareerPreparationInput,
  type ContinueCareerUntilAttentionInput,
  type ContinueCareerUntilAttentionResult,
} from "./career/continue-career.ts";
export {
  generateNextSeasonCalendar,
  type NextSeasonCalendarGenerated,
  type NextSeasonCalendarInvalid,
  type NextSeasonCalendarInvalidReason,
  type NextSeasonCalendarResult,
} from "./career/next-season-calendar.ts";
export {
  progressNextCareerFixture,
  type ProgressCareerFixtureAdvanced,
  type ProgressCareerFixtureInvalid,
  type ProgressCareerFixtureInvalidReason,
  type ProgressCareerFixtureNone,
  type ProgressCareerFixtureResult,
  type ProgressNextCareerFixtureInput,
} from "./career/progress-fixture.ts";
export {
  developPlayersForSeason,
  type PlayerDevelopmentChange,
  type PlayerDevelopmentInput,
  type PlayerDevelopmentResult,
} from "./career/player-development.ts";
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
