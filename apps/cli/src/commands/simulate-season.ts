import {
  createFakeLeagueSystem,
  type FakeLeagueSystem,
} from "@game/content";
import {
  applyMatchReportToFixture,
  computeLeagueTable,
  createMatchReport,
  deriveTeamStrength,
  generateRoundRobinCalendar,
  simulateMatch,
  type ApplyMatchReportToFixtureState,
  type LineupSlot,
  type MatchTacticalDistributionInput,
  type RoleWeightProfile,
  type TeamStrength,
} from "@game/engine";

/** Fixed seed used when the user does not pass `--seed`. */
export const DEFAULT_SIMULATE_SEASON_SEED = "demo-001";

/**
 * Minimal IO adapter used by command tests.
 */
export interface SimulateSeasonCommandIo {
  /** Writes normal command output. */
  readonly stdout: (line: string) => void;
  /** Writes command errors. */
  readonly stderr: (line: string) => void;
}

/**
 * Runs the first deterministic gameplay CLI command.
 *
 * @example
 * await runSimulateSeasonCommand(["--seed=demo-001"]);
 */
export async function runSimulateSeasonCommand(
  args: readonly string[],
  io: SimulateSeasonCommandIo = defaultIo(),
): Promise<number> {
  const parsed = parseArgs(args);

  if (!parsed.ok) {
    io.stderr(parsed.message);
    io.stderr("Usage: pnpm cli simulate-season [--seed=<seed>]");
    return 1;
  }

  const league = createFakeLeagueSystem();
  const result = simulateSeasonForCli(league, parsed.seed);

  for (const line of formatSeasonOutput(league, result, parsed.seed)) {
    io.stdout(line);
  }

  return 0;
}

/**
 * Creates the default console-backed IO adapter.
 */
function defaultIo(): SimulateSeasonCommandIo {
  return {
    stdout: (line) => console.log(line),
    stderr: (line) => console.error(line),
  };
}

/**
 * Parses supported simulate-season command arguments.
 */
function parseArgs(args: readonly string[]): ParsedSimulateSeasonArgs {
  let seed = DEFAULT_SIMULATE_SEASON_SEED;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === undefined) {
      continue;
    }

    if (arg === "--seed") {
      const value = args[index + 1];

      if (value === undefined || value.length === 0) {
        return { ok: false, message: "--seed requires a non-empty value" };
      }

      seed = value;
      index += 1;
      continue;
    }

    if (arg.startsWith("--seed=")) {
      const value = arg.slice("--seed=".length);

      if (value.length === 0) {
        return { ok: false, message: "--seed requires a non-empty value" };
      }

      seed = value;
      continue;
    }

    return { ok: false, message: `Unknown argument: ${arg}` };
  }

  return { ok: true, seed };
}

/**
 * Simulates the fake league season using currently exported engine primitives.
 */
function simulateSeasonForCli(league: FakeLeagueSystem, seed: string): CliSeasonResult {
  const calendar = generateRoundRobinCalendar({
    seed,
    seasonId: league.seasonId,
    competitionId: league.competition.id,
    clubIds: league.clubIds,
    seasonStartDate: league.seasonStartDate,
  });
  let state = createFixtureState(league, seed, fixturesById(calendar.fixtures), calendar.fixtureIds);
  const teamsByClubId = createTeamsByClubId(league);

  for (const fixtureId of calendar.fixtureIds) {
    const fixture = state.fixtures[fixtureId];

    if (fixture === undefined) {
      throw new Error(`Missing generated fixture: ${fixtureId}`);
    }

    const report = createMatchReport(
      simulateMatch({
        fixtureId: fixture.id,
        seed,
        home: matchTeamContext(teamsByClubId, fixture.homeClubId),
        away: matchTeamContext(teamsByClubId, fixture.awayClubId),
        engineConfig: league.matchEngineConfig,
      }),
    );
    state = applyMatchReportToFixture({ state, fixtureId, report });
  }

  const table = computeLeagueTable({
    clubIds: league.clubIds,
    fixtures: state.fixtures,
    fixtureIds: state.fixtureIds,
    rules: league.tableRules,
  });

  return {
    table,
    bestDefense: bestDefense(table),
    worstAttack: worstAttack(table),
  };
}

/**
 * Builds aggregate team contexts for all fake clubs.
 */
function createTeamsByClubId(league: FakeLeagueSystem): Readonly<Record<ClubId, CliTeamContext>> {
  const teamsByClubId: Record<ClubId, CliTeamContext> = {};
  const roleWeights: Readonly<Record<string, RoleWeightProfile>> = league.roleWeights;

  for (const clubId of league.clubIds) {
    const lineup = league.lineupsByClubId[clubId];

    if (lineup === undefined) {
      throw new Error(`Missing fake lineup for club: ${clubId}`);
    }

    const typedLineup: readonly LineupSlot[] = lineup;
    teamsByClubId[clubId] = {
      clubId,
      lineup: typedLineup,
      strength: deriveTeamStrength({
        lineup: typedLineup,
        players: league.players,
        playerStates: league.playerStates,
        roleWeights,
      }),
      tacticalDistribution: {
        directness: 0.5,
        pressing: 0.5,
        width: 0.5,
        risk: 0.5,
      },
    };
  }

  return teamsByClubId;
}

/**
 * Creates the temporary fixture state used while applying reports.
 */
function createFixtureState(
  league: FakeLeagueSystem,
  seed: string,
  fixtures: Readonly<Record<FixtureId, Fixture>>,
  fixtureIds: readonly FixtureId[],
): ApplyMatchReportToFixtureState {
  return {
    meta: {
      seed,
      rngAlgorithmVersion: "sfc32-v1",
      saveSchemaVersion: 1,
    },
    calendar: {
      currentDate: league.seasonStartDate,
      currentSeasonId: league.seasonId,
    },
    players: league.players,
    playerIds: league.playerIds,
    playerStates: league.playerStates,
    clubs: league.clubsById,
    clubIds: league.clubIds,
    fixtures,
    fixtureIds,
  };
}

/**
 * Builds a fixture lookup by ID without relying on object-key order.
 */
function fixturesById(fixtures: readonly Fixture[]): Readonly<Record<FixtureId, Fixture>> {
  const lookup: Record<FixtureId, Fixture> = {};

  for (const fixture of fixtures) {
    lookup[fixture.id] = fixture;
  }

  return lookup;
}

/**
 * Reads one generated CLI team context by club ID.
 */
function matchTeamContext(
  teamsByClubId: Readonly<Record<ClubId, CliTeamContext>>,
  clubId: ClubId,
): CliTeamContext {
  const team = teamsByClubId[clubId];

  if (team === undefined) {
    throw new Error(`Missing team context for club: ${clubId}`);
  }

  return team;
}

/**
 * Formats the complete deterministic command output.
 */
function formatSeasonOutput(league: FakeLeagueSystem, result: CliSeasonResult, seed: string): readonly string[] {
  const lines: string[] = [
    "The Long Season simulated season",
    `Seed: ${seed}`,
    `Competition: ${league.competition.name}`,
    "",
    "Final table:",
    "Pos Club          P  W  D  L  GF GA GD  Pts",
  ];

  for (const row of result.table) {
    lines.push(formatTableRow(row, league.clubsById));
  }

  lines.push("");
  lines.push("Top scorer: unavailable in aggregate engine v1");
  lines.push(`Best defense: ${formatSummaryRow(result.bestDefense, league.clubsById, "GA")}`);
  lines.push(`Worst attack: ${formatSummaryRow(result.worstAttack, league.clubsById, "GF")}`);

  return lines;
}

/**
 * Formats one final table row.
 */
function formatTableRow(row: LeagueTableRow, clubsById: Readonly<Record<ClubId, Club>>): string {
  const clubName = clubLabel(row.clubId, clubsById).padEnd(12, " ");
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
 * Formats one best/worst summary row.
 */
function formatSummaryRow(
  row: LeagueTableRow | undefined,
  clubsById: Readonly<Record<ClubId, Club>>,
  metric: "GA" | "GF",
): string {
  if (row === undefined) {
    return "unavailable";
  }

  return `${clubLabel(row.clubId, clubsById)} (${metric} ${metric === "GA" ? row.goalsAgainst : row.goalsFor})`;
}

/**
 * Reads a compact club label for CLI output.
 */
function clubLabel(clubId: ClubId, clubsById: Readonly<Record<ClubId, Club>>): string {
  return clubsById[clubId]?.shortName ?? String(clubId);
}

/**
 * Finds the best defense by goals against.
 */
function bestDefense(table: readonly LeagueTableRow[]): LeagueTableRow | undefined {
  let best: LeagueTableRow | undefined;

  for (const row of table) {
    if (best === undefined || row.goalsAgainst < best.goalsAgainst) {
      best = row;
    }
  }

  return best;
}

/**
 * Finds the worst attack by goals for.
 */
function worstAttack(table: readonly LeagueTableRow[]): LeagueTableRow | undefined {
  let worst: LeagueTableRow | undefined;

  for (const row of table) {
    if (worst === undefined || row.goalsFor < worst.goalsFor) {
      worst = row;
    }
  }

  return worst;
}

/**
 * Parsed command arguments.
 */
type ParsedSimulateSeasonArgs =
  | {
      readonly ok: true;
      readonly seed: string;
    }
  | {
      readonly ok: false;
      readonly message: string;
    };

/**
 * Aggregate team context used by the CLI command.
 */
interface CliTeamContext {
  readonly clubId: ClubId;
  readonly lineup: readonly LineupSlot[];
  readonly strength: TeamStrength;
  readonly tacticalDistribution: MatchTacticalDistributionInput;
}

/**
 * Minimal season result needed for CLI output.
 */
interface CliSeasonResult {
  readonly table: readonly LeagueTableRow[];
  readonly bestDefense: LeagueTableRow | undefined;
  readonly worstAttack: LeagueTableRow | undefined;
}

/** Club ID type derived from fake content without importing domain directly. */
type ClubId = FakeLeagueSystem["clubIds"][number];

/** Club type derived from fake content without importing domain directly. */
type Club = FakeLeagueSystem["clubs"][number];

/** Fixture type derived from the exported calendar generator. */
type Fixture = ReturnType<typeof generateRoundRobinCalendar>["fixtures"][number];

/** Fixture ID type derived from the exported calendar generator. */
type FixtureId = ReturnType<typeof generateRoundRobinCalendar>["fixtureIds"][number];

/** League table row type derived from the exported table computation. */
type LeagueTableRow = ReturnType<typeof computeLeagueTable>[number];
