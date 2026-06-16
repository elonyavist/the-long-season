import type { ClubId, Fixture, FixtureId, LeagueTableRow, LeagueTableRules } from "@game/domain";

/**
 * Input for derived league-table computation.
 */
export interface ComputeLeagueTableInput {
  /** Explicit ordered competition participants. */
  readonly clubIds: readonly ClubId[];
  /** Fixture lookup table keyed by fixture ID. */
  readonly fixtures: Readonly<Record<FixtureId, Fixture>>;
  /** Explicit ordered fixture IDs to read. */
  readonly fixtureIds: readonly FixtureId[];
  /** Competition point rules. */
  readonly rules: LeagueTableRules;
}

/**
 * Computes a deterministic league table from played fixture results.
 *
 * Unplayed fixtures are ignored. Sorting uses points, goal difference, goals
 * for, then the stable club ID as a deterministic final fallback.
 */
export function computeLeagueTable(input: ComputeLeagueTableInput): readonly LeagueTableRow[] {
  const rows = initialRows(input.clubIds);

  for (const fixtureId of input.fixtureIds) {
    const fixture = input.fixtures[fixtureId];

    if (fixture === undefined || fixture.result === undefined) {
      continue;
    }

    const homeRow = findRow(rows, fixture.homeClubId);
    const awayRow = findRow(rows, fixture.awayClubId);

    if (homeRow === undefined || awayRow === undefined) {
      continue;
    }

    applyFixtureResult(homeRow, awayRow, fixture.result.homeGoals, fixture.result.awayGoals, input.rules);
  }

  rows.sort(compareMutableRows);

  return rows.map((row, index) => freezeRow(row, index + 1));
}

/**
 * Creates mutable row accumulators in explicit club order.
 */
function initialRows(clubIds: readonly ClubId[]): MutableLeagueTableRow[] {
  const rows: MutableLeagueTableRow[] = [];

  for (const clubId of clubIds) {
    rows.push({
      position: 0,
      clubId,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
    });
  }

  return rows;
}

/**
 * Finds one mutable table row by club ID.
 */
function findRow(rows: readonly MutableLeagueTableRow[], clubId: ClubId): MutableLeagueTableRow | undefined {
  for (const row of rows) {
    if (row.clubId === clubId) {
      return row;
    }
  }

  return undefined;
}

/**
 * Applies one played fixture to home and away table rows.
 */
function applyFixtureResult(
  homeRow: MutableLeagueTableRow,
  awayRow: MutableLeagueTableRow,
  homeGoals: number,
  awayGoals: number,
  rules: LeagueTableRules,
): void {
  homeRow.played += 1;
  awayRow.played += 1;
  homeRow.goalsFor += homeGoals;
  homeRow.goalsAgainst += awayGoals;
  awayRow.goalsFor += awayGoals;
  awayRow.goalsAgainst += homeGoals;
  refreshGoalDifference(homeRow);
  refreshGoalDifference(awayRow);

  if (homeGoals > awayGoals) {
    homeRow.wins += 1;
    awayRow.losses += 1;
    homeRow.points += rules.pointsForWin;
    awayRow.points += rules.pointsForLoss;
    return;
  }

  if (awayGoals > homeGoals) {
    awayRow.wins += 1;
    homeRow.losses += 1;
    awayRow.points += rules.pointsForWin;
    homeRow.points += rules.pointsForLoss;
    return;
  }

  homeRow.draws += 1;
  awayRow.draws += 1;
  homeRow.points += rules.pointsForDraw;
  awayRow.points += rules.pointsForDraw;
}

/**
 * Recomputes goal difference after goals change.
 */
function refreshGoalDifference(row: MutableLeagueTableRow): void {
  row.goalDifference = row.goalsFor - row.goalsAgainst;
}

/**
 * Compares mutable rows using deterministic table tie-breakers.
 */
function compareMutableRows(first: MutableLeagueTableRow, second: MutableLeagueTableRow): number {
  return (
    compareDescending(first.points, second.points) ||
    compareDescending(first.goalDifference, second.goalDifference) ||
    compareDescending(first.goalsFor, second.goalsFor) ||
    compareClubIdsAscending(first.clubId, second.clubId)
  );
}

/**
 * Compares numeric values in descending order.
 */
function compareDescending(first: number, second: number): number {
  return second - first;
}

/**
 * Compares club IDs by stable ASCII/code-unit order.
 */
function compareClubIdsAscending(first: ClubId, second: ClubId): number {
  const firstValue = String(first);
  const secondValue = String(second);

  if (firstValue < secondValue) {
    return -1;
  }

  if (firstValue > secondValue) {
    return 1;
  }

  return 0;
}

/**
 * Creates an immutable table row with its final table position.
 */
function freezeRow(row: MutableLeagueTableRow, position: number): LeagueTableRow {
  return {
    position,
    clubId: row.clubId,
    played: row.played,
    wins: row.wins,
    draws: row.draws,
    losses: row.losses,
    goalsFor: row.goalsFor,
    goalsAgainst: row.goalsAgainst,
    goalDifference: row.goalDifference,
    points: row.points,
  };
}

/**
 * Mutable accumulator used internally while deriving a table.
 */
interface MutableLeagueTableRow extends LeagueTableRow {
  position: number;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}
