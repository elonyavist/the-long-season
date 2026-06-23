import type { FakeLeagueSystem } from "@game/content";
import type { simulateSeason } from "@game/engine";
import type { Translator } from "@game/i18n";
import type { CliSetupDemo } from "./demo-builders.ts";
import { formatSetupDemoLines } from "./demo-output.ts";
import {
  formatFixtureResult,
  formatFixtureScorers,
} from "./fixture-detail-output.ts";

/** Club ID type derived from fake content without importing domain directly. */
type ClubId = FakeLeagueSystem["clubIds"][number];

/** Player ID type derived from fake content without importing domain directly. */
type PlayerId = FakeLeagueSystem["playerIds"][number];

/** Club type derived from fake content without importing domain directly. */
type Club = FakeLeagueSystem["clubs"][number];

/** League table row type derived from the exported season simulation. */
type LeagueTableRow = ReturnType<typeof simulateSeason>["table"][number];

/** Player goal stat row type derived from the exported season simulation. */
type SeasonPlayerGoalStatRow = ReturnType<typeof simulateSeason>["playerGoalStats"][number];

/** Player summary stat row type derived from the exported season simulation. */
type SeasonPlayerSummaryStatRow = ReturnType<typeof simulateSeason>["playerSummaryStats"][number];

/** Round type derived from the exported season simulation. */
export type SeasonSummaryRound = ReturnType<typeof simulateSeason>["rounds"][number];

/** Fixture type derived from the exported season simulation. */
type Fixture = ReturnType<typeof simulateSeason>["fixtures"][number];

/** Fixture ID type derived from the exported season simulation. */
type FixtureId = ReturnType<typeof simulateSeason>["fixtureIds"][number];

/**
 * Minimal season result needed by default season and round renderers.
 */
export interface SeasonSummaryOutputResult {
  /** Scheduled rounds in deterministic order. */
  readonly rounds: readonly SeasonSummaryRound[];
  /** Played fixtures in deterministic order. */
  readonly fixtures: readonly Fixture[];
  /** Final ranked table. */
  readonly table: readonly LeagueTableRow[];
  /** Best defensive table row from the engine result. */
  readonly bestDefense: LeagueTableRow | undefined;
  /** Worst attacking table row from the engine result. */
  readonly worstAttack: LeagueTableRow | undefined;
  /** Engine-derived player goal ranking. */
  readonly playerGoalStats: readonly SeasonPlayerGoalStatRow[];
  /** Engine-derived player summary stats. */
  readonly playerSummaryStats: readonly SeasonPlayerSummaryStatRow[];
}

/**
 * Formats the complete deterministic default season command output.
 */
export function formatSeasonOutput(
  league: FakeLeagueSystem,
  result: SeasonSummaryOutputResult,
  seed: string,
  text: Translator,
  setupDemo: CliSetupDemo | undefined,
): readonly string[] {
  const lines: string[] = [
    text("season.title"),
    `${text("season.seed")}: ${seed}`,
    `${text("season.competition")}: ${league.competition.name}`,
  ];

  if (setupDemo !== undefined) {
    lines.push(...formatSetupDemoLines(league, setupDemo, text));
  }

  lines.push("");
  lines.push(`${text("season.finalTable")}:`);
  lines.push(text("season.tableHeader"));

  for (const row of result.table) {
    lines.push(formatTableRow(row, league.clubsById));
  }

  lines.push("");
  lines.push(`${text("season.topScorer")}: ${formatTopScorer(result.playerGoalStats[0], league.players, league.clubsById, text)}`);
  lines.push(`${text("season.topAssist")}: ${formatTopAssist(topPlayerByMetric(result.playerSummaryStats, "assists"), league.players, league.clubsById, text)}`);
  lines.push(
    `${text("season.topGoalkeeperSaves")}: ${formatTopGoalkeeperSaves(
      topPlayerByMetric(result.playerSummaryStats, "saves"),
      league.players,
      league.clubsById,
      text,
    )}`,
  );
  lines.push(`${text("season.bestDefense")}: ${formatSummaryRow(result.bestDefense, league.clubsById, "GA", text)}`);
  lines.push(`${text("season.worstAttack")}: ${formatSummaryRow(result.worstAttack, league.clubsById, "GF", text)}`);

  return lines;
}

/**
 * Formats fixture result details for one requested round.
 */
export function formatRoundOutput(
  league: FakeLeagueSystem,
  result: SeasonSummaryOutputResult,
  roundNumber: number,
  text: Translator,
): readonly string[] {
  const round = findRound(result.rounds, roundNumber);

  if (round === undefined) {
    return ["", text("round.fixturesUnavailable", { round: roundNumber })];
  }

  const lines = ["", `${text("round.fixtures", { round: round.roundNumber })}:`];

  for (const fixtureId of round.fixtureIds) {
    const fixture = findFixture(result.fixtures, fixtureId);

    if (fixture === undefined) {
      lines.push(text("fixture.unavailable", { fixture: String(fixtureId) }));
      continue;
    }

    lines.push(formatFixtureResult(fixture, league));

    const scorers = formatFixtureScorers(fixture, league);
    lines.push(`  ${text("fixture.scorers")}: ${scorers.length === 0 ? text("common.none") : scorers.join("; ")}`);
  }

  return lines;
}

/**
 * Finds one round by round number.
 */
export function findRound(rounds: readonly SeasonSummaryRound[], roundNumber: number): SeasonSummaryRound | undefined {
  for (const round of rounds) {
    if (round.roundNumber === roundNumber) {
      return round;
    }
  }

  return undefined;
}

/**
 * Finds one fixture by ID in explicit fixture result order.
 */
function findFixture(fixtures: readonly Fixture[], fixtureId: FixtureId): Fixture | undefined {
  for (const fixture of fixtures) {
    if (fixture.id === fixtureId) {
      return fixture;
    }
  }

  return undefined;
}

/**
 * Formats one final table row.
 */
function formatTableRow(row: LeagueTableRow, clubsById: Readonly<Record<ClubId, Club>>): string {
  const clubName = clubLabel(row.clubId, clubsById).padEnd(22, " ");
  const goalDifference = row.goalDifference >= 0 ? `+${row.goalDifference}` : String(row.goalDifference);

  return [
    String(row.position).padStart(2, " "),
    clubName,
    String(row.played).padStart(2, " "),
    String(row.wins).padStart(2, " "),
    String(row.draws).padStart(2, " "),
    String(row.losses).padStart(2, " "),
    String(row.goalsFor).padStart(2, " "),
    String(row.goalsAgainst).padStart(2, " "),
    goalDifference.padStart(3, " "),
    String(row.points).padStart(3, " "),
  ].join(" ");
}

/**
 * Finds the top season player row for one current player-counted metric.
 */
function topPlayerByMetric(
  rows: readonly SeasonPlayerSummaryStatRow[],
  metric: "assists" | "saves",
): SeasonPlayerSummaryStatRow | undefined {
  let best: SeasonPlayerSummaryStatRow | undefined;

  for (const row of rows) {
    if (row[metric] === 0) {
      continue;
    }

    if (
      best === undefined ||
      row[metric] > best[metric] ||
      (row[metric] === best[metric] && comparePlayerIdsAscending(row.playerId, best.playerId) < 0)
    ) {
      best = row;
    }
  }

  return best;
}

/**
 * Formats the top scorer summary from engine-derived player goal stats.
 */
function formatTopScorer(
  row: SeasonPlayerGoalStatRow | undefined,
  players: FakeLeagueSystem["players"],
  clubsById: Readonly<Record<ClubId, Club>>,
  text: Translator,
): string {
  if (row === undefined) {
    return text("common.unavailable");
  }

  return `${playerLabel(row.playerId, players)} (${clubLabel(row.clubId, clubsById)}) - ${formatGoalCount(row.goals, text)}`;
}

/**
 * Formats the top assist-provider summary from engine-derived season stats.
 */
function formatTopAssist(
  row: SeasonPlayerSummaryStatRow | undefined,
  players: FakeLeagueSystem["players"],
  clubsById: Readonly<Record<ClubId, Club>>,
  text: Translator,
): string {
  if (row === undefined) {
    return text("common.unavailable");
  }

  return `${playerLabel(row.playerId, players)} (${clubLabel(row.clubId, clubsById)}) - ${formatAssistCount(row.assists, text)}`;
}

/**
 * Formats the top goalkeeper-save summary from engine-derived season stats.
 */
function formatTopGoalkeeperSaves(
  row: SeasonPlayerSummaryStatRow | undefined,
  players: FakeLeagueSystem["players"],
  clubsById: Readonly<Record<ClubId, Club>>,
  text: Translator,
): string {
  if (row === undefined) {
    return text("common.unavailable");
  }

  return `${playerLabel(row.playerId, players)} (${clubLabel(row.clubId, clubsById)}) - ${formatSaveCount(row.saves, text)}`;
}

/**
 * Compares player IDs by stable ASCII/code-unit order.
 */
function comparePlayerIdsAscending(first: PlayerId, second: PlayerId): number {
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
 * Formats a goal count with a stable singular/plural suffix.
 */
function formatGoalCount(goals: number, text: Translator): string {
  return `${goals} ${goals === 1 ? text("season.unit.goal.one") : text("season.unit.goal.many")}`;
}

/**
 * Formats an assist count with a stable singular/plural suffix.
 */
function formatAssistCount(assists: number, text: Translator): string {
  return `${assists} ${assists === 1 ? text("season.unit.assist.one") : text("season.unit.assist.many")}`;
}

/**
 * Formats a goalkeeper-save count with a stable singular/plural suffix.
 */
function formatSaveCount(saves: number, text: Translator): string {
  return `${saves} ${saves === 1 ? text("season.unit.save.one") : text("season.unit.save.many")}`;
}

/**
 * Formats one best/worst summary row.
 */
function formatSummaryRow(
  row: LeagueTableRow | undefined,
  clubsById: Readonly<Record<ClubId, Club>>,
  metric: "GA" | "GF",
  text: Translator,
): string {
  if (row === undefined) {
    return text("common.unavailable");
  }

  const metricLabel = metric === "GA" ? text("season.metric.goalsAgainst") : text("season.metric.goalsFor");
  const metricValue = metric === "GA" ? row.goalsAgainst : row.goalsFor;

  return `${clubLabel(row.clubId, clubsById)} (${metricLabel} ${metricValue})`;
}

/**
 * Formats a generated player display name for CLI output.
 */
function playerLabel(playerId: PlayerId, players: FakeLeagueSystem["players"]): string {
  const player = players[playerId];

  if (player === undefined) {
    return String(playerId);
  }

  return `${player.firstName} ${player.lastName}`;
}

/**
 * Reads the visible generated club name for CLI output.
 */
function clubLabel(clubId: ClubId, clubsById: Readonly<Record<ClubId, Club>>): string {
  return clubsById[clubId]?.name ?? String(clubId);
}
