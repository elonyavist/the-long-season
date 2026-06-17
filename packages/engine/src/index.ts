/**
 * Public entrypoint for deterministic simulation rules.
 *
 * Engine code may import only `@game/domain` and `@game/shared`. This file is
 * intentionally limited to pure deterministic simulation helpers.
 */
export * from "./match-engine/index.ts";
export { createMatchReport } from "./match-engine/create-match-report.ts";
export {
  ApplyMatchReportToFixtureError,
  applyMatchReportToFixture,
  type ApplyMatchReportToFixtureErrorCode,
  type ApplyMatchReportToFixtureInput,
  type ApplyMatchReportToFixtureOptions,
  type ApplyMatchReportToFixtureState,
  type FixtureStateSlice,
} from "./use-cases/apply-match-report-to-fixture.ts";
export {
  SimulateSeasonError,
  simulateSeason,
  type SimulateSeasonErrorCode,
  type SimulateSeasonInput,
  type SimulateSeasonResult,
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
