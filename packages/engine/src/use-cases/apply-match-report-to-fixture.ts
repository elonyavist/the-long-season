import type { Fixture, FixtureId, FixtureResult, GameState, MatchReport } from "@game/domain";

/**
 * Fixture slice required by the fixture-result application use-case.
 *
 * The base `GameState` contract has not yet been expanded in a documented step
 * that lists `game-state.ts` as an expected file. This slice keeps the current
 * use-case explicit and copy-on-write without changing unrelated domain state.
 */
export interface FixtureStateSlice {
  /** Fixture lookup table by stable fixture ID. */
  readonly fixtures: Readonly<Record<FixtureId, Fixture>>;
  /** Deterministic fixture traversal order. */
  readonly fixtureIds: readonly FixtureId[];
}

/**
 * Game state shape accepted by fixture result application.
 */
export type ApplyMatchReportToFixtureState = GameState & FixtureStateSlice;

/**
 * Debug options for applying a match report to fixture state.
 */
export interface ApplyMatchReportToFixtureOptions {
  /** Allow replacing an already played fixture result. Defaults to `false`. */
  readonly allowOverwrite?: boolean;
}

/**
 * Input contract for applying a completed match report.
 */
export interface ApplyMatchReportToFixtureInput {
  /** Current immutable game state. */
  readonly state: ApplyMatchReportToFixtureState;
  /** Fixture ID selected by the caller. */
  readonly fixtureId: FixtureId;
  /** Completed report whose score should become the fixture result. */
  readonly report: MatchReport;
  /** Optional debug behavior. */
  readonly options?: ApplyMatchReportToFixtureOptions;
}

/**
 * Stable error codes for fixture result application failures.
 */
export type ApplyMatchReportToFixtureErrorCode =
  | "fixture_already_played"
  | "fixture_report_mismatch"
  | "missing_fixture";

/**
 * Typed error thrown when a report cannot be applied to fixture state.
 */
export class ApplyMatchReportToFixtureError extends Error {
  /** Machine-readable failure reason. */
  readonly code: ApplyMatchReportToFixtureErrorCode;

  /**
   * Creates a typed fixture application error.
   */
  constructor(code: ApplyMatchReportToFixtureErrorCode, message: string) {
    super(message);
    this.name = "ApplyMatchReportToFixtureError";
    this.code = code;
  }
}

/**
 * Applies a completed match report to a fixture using copy-on-write updates.
 *
 * The compact fixture result is the source of truth for future tables. The rich
 * report is retained only as an optional reference and is not required to read
 * goals back from the fixture.
 */
export function applyMatchReportToFixture(
  input: ApplyMatchReportToFixtureInput,
): ApplyMatchReportToFixtureState {
  const fixture = input.state.fixtures[input.fixtureId];

  if (fixture === undefined) {
    throw new ApplyMatchReportToFixtureError("missing_fixture", `Missing fixture: ${input.fixtureId}`);
  }

  if (input.report.fixtureId !== input.fixtureId) {
    throw new ApplyMatchReportToFixtureError(
      "fixture_report_mismatch",
      `Report fixture ${input.report.fixtureId} does not match fixture ${input.fixtureId}`,
    );
  }

  if (fixture.result !== undefined && input.options?.allowOverwrite !== true) {
    throw new ApplyMatchReportToFixtureError(
      "fixture_already_played",
      `Fixture is already played: ${input.fixtureId}`,
    );
  }

  const updatedFixture: Fixture = {
    ...fixture,
    result: fixtureResultFromReport(input.report),
  };

  const fixtures: Readonly<Record<FixtureId, Fixture>> = {
    ...input.state.fixtures,
    [input.fixtureId]: updatedFixture,
  };

  return {
    ...input.state,
    fixtures,
  };
}

/**
 * Converts a rich match report into the compact fixture result used by tables.
 */
function fixtureResultFromReport(report: MatchReport): FixtureResult {
  return {
    played: true,
    homeGoals: report.score.home,
    awayGoals: report.score.away,
    report,
  };
}
