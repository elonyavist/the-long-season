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
