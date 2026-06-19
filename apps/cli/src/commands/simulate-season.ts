import {
  createFakeLeagueSystem,
  type FakeLeagueSystem,
} from "@game/content";
import {
  deriveTeamStrength,
  simulateSeason,
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
    io.stderr("Usage: pnpm cli simulate-season [--seed=<seed>] [--round=<roundNumber>]");
    return 1;
  }

  const league = createFakeLeagueSystem();
  const result = simulateSeasonForCli(league, parsed.seed);

  if (parsed.roundNumber !== undefined && findRound(result.rounds, parsed.roundNumber) === undefined) {
    io.stderr(`Round not found: ${parsed.roundNumber}`);
    return 1;
  }

  for (const line of formatSeasonOutput(league, result, parsed.seed)) {
    io.stdout(line);
  }

  if (parsed.roundNumber !== undefined) {
    for (const line of formatRoundOutput(league, result, parsed.roundNumber)) {
      io.stdout(line);
    }
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
  let roundNumber: number | undefined;

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

    if (arg === "--round") {
      const value = args[index + 1];
      const parsedRound = parseRoundNumber(value);

      if (!parsedRound.ok) {
        return parsedRound;
      }

      roundNumber = parsedRound.roundNumber;
      index += 1;
      continue;
    }

    if (arg.startsWith("--round=")) {
      const parsedRound = parseRoundNumber(arg.slice("--round=".length));

      if (!parsedRound.ok) {
        return parsedRound;
      }

      roundNumber = parsedRound.roundNumber;
      continue;
    }

    return { ok: false, message: `Unknown argument: ${arg}` };
  }

  return { ok: true, seed, roundNumber };
}

/**
 * Parses one positive round number argument.
 */
function parseRoundNumber(value: string | undefined): ParsedRoundNumber {
  if (value === undefined || value.length === 0) {
    return { ok: false, message: "--round requires a positive integer value" };
  }

  if (!/^[1-9][0-9]*$/.test(value)) {
    return { ok: false, message: "--round requires a positive integer value" };
  }

  return { ok: true, roundNumber: Number(value) };
}

/**
 * Simulates the fake league season using currently exported engine primitives.
 */
function simulateSeasonForCli(league: FakeLeagueSystem, seed: string): CliSeasonResult {
  const result = simulateSeason({
    seed,
    seasonId: league.seasonId,
    competitionId: league.competition.id,
    clubIds: league.clubIds,
    seasonStartDate: league.seasonStartDate,
    teamsByClubId: createTeamsByClubId(league),
    matchEngineConfig: league.matchEngineConfig,
    tableRules: league.tableRules,
  });

  return {
    rounds: result.rounds,
    fixtures: result.fixtures,
    table: result.table,
    bestDefense: result.bestDefense,
    worstAttack: result.worstAttack,
    playerGoalStats: result.playerGoalStats,
  };
}

/**
 * Formats fixture result details for one requested round.
 */
function formatRoundOutput(league: FakeLeagueSystem, result: CliSeasonResult, roundNumber: number): readonly string[] {
  const round = findRound(result.rounds, roundNumber);

  if (round === undefined) {
    return ["", `Round ${roundNumber} fixtures: unavailable`];
  }

  const lines = ["", `Round ${round.roundNumber} fixtures:`];

  for (const fixtureId of round.fixtureIds) {
    const fixture = findFixture(result.fixtures, fixtureId);

    if (fixture === undefined) {
      lines.push(`${fixtureId} unavailable`);
      continue;
    }

    lines.push(formatFixtureResult(fixture, league));

    const scorers = formatFixtureScorers(fixture, league);
    lines.push(`  Scorers: ${scorers.length === 0 ? "none" : scorers.join("; ")}`);
  }

  return lines;
}

/**
 * Formats one fixture result line.
 */
function formatFixtureResult(fixture: Fixture, league: FakeLeagueSystem): string {
  const result = fixture.result;
  const score = result === undefined ? "vs" : `${result.homeGoals}-${result.awayGoals}`;

  return [
    String(fixture.id),
    clubLabel(fixture.homeClubId, league.clubsById),
    score,
    clubLabel(fixture.awayClubId, league.clubsById),
  ].join(" ");
}

/**
 * Formats available goal scorers from one fixture report.
 */
function formatFixtureScorers(fixture: Fixture, league: FakeLeagueSystem): readonly string[] {
  const report = fixture.result?.report;
  const scorers: string[] = [];

  if (report === undefined) {
    return scorers;
  }

  for (const event of report.events) {
    if (event.type !== "goal") {
      continue;
    }

    const clubId = event.shot.side === "home" ? fixture.homeClubId : fixture.awayClubId;
    scorers.push(`${event.shot.minute}' ${playerLabel(event.scorerPlayerId, league.players)} (${clubLabel(clubId, league.clubsById)})`);
  }

  return scorers;
}

/**
 * Finds one round by round number.
 */
function findRound(rounds: readonly Round[], roundNumber: number): Round | undefined {
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
  lines.push(`Top scorer: ${formatTopScorer(result.playerGoalStats[0], league.players, league.clubsById)}`);
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
 * Formats the top scorer summary from engine-derived player goal stats.
 */
function formatTopScorer(
  row: SeasonPlayerGoalStatRow | undefined,
  players: FakeLeagueSystem["players"],
  clubsById: Readonly<Record<ClubId, Club>>,
): string {
  if (row === undefined) {
    return "unavailable";
  }

  return `${playerLabel(row.playerId, players)} (${clubLabel(row.clubId, clubsById)}) - ${formatGoalCount(row.goals)}`;
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
 * Formats a goal count with a stable singular/plural suffix.
 */
function formatGoalCount(goals: number): string {
  return `${goals} ${goals === 1 ? "goal" : "goals"}`;
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
 * Parsed command arguments.
 */
type ParsedSimulateSeasonArgs =
  | {
      readonly ok: true;
      readonly seed: string;
      readonly roundNumber: number | undefined;
    }
  | {
      readonly ok: false;
      readonly message: string;
    };

/** Parsed round-number argument result. */
type ParsedRoundNumber =
  | {
      readonly ok: true;
      readonly roundNumber: number;
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
  readonly rounds: readonly Round[];
  readonly fixtures: readonly Fixture[];
  readonly table: readonly LeagueTableRow[];
  readonly bestDefense: LeagueTableRow | undefined;
  readonly worstAttack: LeagueTableRow | undefined;
  readonly playerGoalStats: readonly SeasonPlayerGoalStatRow[];
}

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

/** Round type derived from the exported season simulation. */
type Round = ReturnType<typeof simulateSeason>["rounds"][number];

/** Fixture type derived from the exported season simulation. */
type Fixture = ReturnType<typeof simulateSeason>["fixtures"][number];

/** Fixture ID type derived from the exported season simulation. */
type FixtureId = ReturnType<typeof simulateSeason>["fixtureIds"][number];
