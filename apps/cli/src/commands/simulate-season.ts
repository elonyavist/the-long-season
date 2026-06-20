import {
  createFakeLeagueSystem,
  type FakeLeagueSystem,
} from "@game/content";
import {
  computePlayerMatchStats,
  deriveTeamStrength,
  simulateSeason,
  type LineupSlot,
  type MatchTacticalDistributionInput,
  type PlayerMatchStatRegistration,
  type PlayerMatchStatRow,
  type RoleWeightProfile,
  type SimulateSeasonSetupOverride,
  type TeamStrength,
} from "@game/engine";

/** Fixed seed used when the user does not pass `--seed`. */
export const DEFAULT_SIMULATE_SEASON_SEED = "demo-001";

/** Deterministic tactic/lineup demo profile supported by the CLI MVP. */
export const DEMO_SETUP_PROFILE_PRO01_ATTACKING = "pro01-attacking";

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
    io.stderr(
      "Usage: pnpm cli simulate-season [--seed=<seed>] [--round=<roundNumber>] [--fixture=<fixtureId>] [--setup-demo=pro01-attacking]",
    );
    return 1;
  }

  const league = createFakeLeagueSystem();
  const setupDemo = parsed.setupDemo === undefined ? undefined : buildSetupDemo(league, parsed.setupDemo);
  const result = simulateSeasonForCli(league, parsed.seed, setupDemo);

  if (parsed.roundNumber !== undefined && findRound(result.rounds, parsed.roundNumber) === undefined) {
    io.stderr(`Round not found: ${parsed.roundNumber}`);
    return 1;
  }

  if (parsed.fixtureId !== undefined && findFixtureByValue(result.fixtures, parsed.fixtureId) === undefined) {
    io.stderr(`Fixture not found: ${parsed.fixtureId}`);
    return 1;
  }

  if (parsed.fixtureId !== undefined) {
    for (const line of formatFixtureOnlyOutput(league, result, parsed.seed, parsed.fixtureId, setupDemo)) {
      io.stdout(line);
    }

    return 0;
  }

  for (const line of formatSeasonOutput(league, result, parsed.seed, setupDemo)) {
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
  let fixtureId: string | undefined;
  let setupDemo: SetupDemoProfileKey | undefined;

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

    if (arg === "--fixture") {
      const value = args[index + 1];
      const parsedFixture = parseFixtureId(value);

      if (!parsedFixture.ok) {
        return parsedFixture;
      }

      fixtureId = parsedFixture.fixtureId;
      index += 1;
      continue;
    }

    if (arg.startsWith("--fixture=")) {
      const parsedFixture = parseFixtureId(arg.slice("--fixture=".length));

      if (!parsedFixture.ok) {
        return parsedFixture;
      }

      fixtureId = parsedFixture.fixtureId;
      continue;
    }

    if (arg === "--setup-demo") {
      const value = args[index + 1];
      const parsedSetupDemo = parseSetupDemo(value);

      if (!parsedSetupDemo.ok) {
        return parsedSetupDemo;
      }

      setupDemo = parsedSetupDemo.setupDemo;
      index += 1;
      continue;
    }

    if (arg.startsWith("--setup-demo=")) {
      const parsedSetupDemo = parseSetupDemo(arg.slice("--setup-demo=".length));

      if (!parsedSetupDemo.ok) {
        return parsedSetupDemo;
      }

      setupDemo = parsedSetupDemo.setupDemo;
      continue;
    }

    return { ok: false, message: `Unknown argument: ${arg}` };
  }

  return { ok: true, seed, roundNumber, fixtureId, setupDemo };
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
 * Parses one stable fixture ID argument.
 */
function parseFixtureId(value: string | undefined): ParsedFixtureId {
  if (value === undefined || value.length === 0) {
    return { ok: false, message: "--fixture requires a non-empty fixture ID" };
  }

  if (!/^fixture:[A-Za-z0-9:_-]+$/.test(value)) {
    return { ok: false, message: "--fixture requires a namespaced fixture ID" };
  }

  return { ok: true, fixtureId: value };
}

/**
 * Parses the deterministic setup-demo profile key.
 */
function parseSetupDemo(value: string | undefined): ParsedSetupDemo {
  if (value === undefined || value.length === 0) {
    return { ok: false, message: "--setup-demo requires a supported value: pro01-attacking" };
  }

  if (value !== DEMO_SETUP_PROFILE_PRO01_ATTACKING) {
    return { ok: false, message: `Unsupported --setup-demo value: ${value}. Supported values: pro01-attacking` };
  }

  return { ok: true, setupDemo: value };
}

/**
 * Simulates the fake league season using currently exported engine primitives.
 */
function simulateSeasonForCli(
  league: FakeLeagueSystem,
  seed: string,
  setupDemo: CliSetupDemo | undefined,
): CliSeasonResult {
  const result = simulateSeason({
    seed,
    seasonId: league.seasonId,
    competitionId: league.competition.id,
    clubIds: league.clubIds,
    seasonStartDate: league.seasonStartDate,
    teamsByClubId: createTeamsByClubId(league),
    ...(setupDemo === undefined ? {} : { setupOverrides: [setupDemo.override] }),
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
    playerSummaryStats: result.playerSummaryStats,
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
 * Formats a fixture-focused command output without the full season table.
 */
function formatFixtureOnlyOutput(
  league: FakeLeagueSystem,
  result: CliSeasonResult,
  seed: string,
  fixtureValue: string,
  setupDemo: CliSetupDemo | undefined,
): readonly string[] {
  const lines = [
    "The Long Season fixture detail",
    `Seed: ${seed}`,
    `Fixture: ${fixtureValue}`,
    `Competition: ${league.competition.name}`,
  ];

  if (setupDemo !== undefined) {
    lines.push(...formatSetupDemoLines(league, setupDemo));
  }

  lines.push("");
  lines.push(...formatFixtureDetailOutput(league, result, fixtureValue));

  return lines;
}

/**
 * Formats rich structured detail for one requested fixture.
 */
function formatFixtureDetailOutput(league: FakeLeagueSystem, result: CliSeasonResult, fixtureValue: string): readonly string[] {
  const fixture = findFixtureByValue(result.fixtures, fixtureValue);

  if (fixture === undefined) {
    return ["", `Fixture ${fixtureValue}: unavailable`];
  }

  const report = fixture.result?.report;
  const lines = [formatFixtureResult(fixture, league)];

  if (report === undefined) {
    lines.push("Events: unavailable");
    lines.push("Player stats: unavailable");
    return lines;
  }

  lines.push("Events:");

  const eventLines = formatFixtureEvents(fixture, league);
  if (eventLines.length === 0) {
    lines.push("  none");
  } else {
    lines.push(...eventLines);
  }

  lines.push("Player stats (all starters):");

  const statLines = formatFixturePlayerStats(fixture, league);
  if (statLines.length === 0) {
    lines.push("  none");
  } else {
    lines.push("  Player              Club  G A Sh SoT Sv");
    lines.push(...statLines);
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
 * Formats structured goal, save, miss, and block events for one fixture.
 */
function formatFixtureEvents(fixture: Fixture, league: FakeLeagueSystem): readonly string[] {
  const report = fixture.result?.report;
  const events: string[] = [];

  if (report === undefined) {
    return events;
  }

  for (const event of report.events) {
    switch (event.type) {
      case "goal": {
        const clubId = sideClubId(fixture, event.shot.side);
        const assist = event.assistPlayerId === undefined ? "" : ` assist=${playerLabel(event.assistPlayerId, league.players)}`;
        const creator = event.creatorPlayerId === undefined ? "" : ` creator=${playerLabel(event.creatorPlayerId, league.players)}`;
        events.push(
          `  ${event.shot.minute}' GOAL ${clubLabel(clubId, league.clubsById)} ${playerLabel(event.scorerPlayerId, league.players)}${assist}${creator} shot=${event.shot.shotType} chance=${event.shot.chanceType}`,
        );
        break;
      }

      case "save": {
        const defendingClubId = sideClubId(fixture, oppositeSide(event.shot.side));
        const attackingClubId = sideClubId(fixture, event.shot.side);
        events.push(
          `  ${event.shot.minute}' SAVE ${clubLabel(defendingClubId, league.clubsById)} ${playerLabel(event.goalkeeperPlayerId, league.players)} vs ${clubLabel(attackingClubId, league.clubsById)} shot=${event.shot.shotType} chance=${event.shot.chanceType}`,
        );
        break;
      }

      case "miss": {
        const clubId = sideClubId(fixture, event.shot.side);
        events.push(
          `  ${event.shot.minute}' MISS ${clubLabel(clubId, league.clubsById)} shot=${event.shot.shotType} chance=${event.shot.chanceType}`,
        );
        break;
      }

      case "block": {
        const clubId = sideClubId(fixture, event.shot.side);
        const defender = event.primaryDefenderPlayerId === undefined
          ? ""
          : ` defender=${playerLabel(event.primaryDefenderPlayerId, league.players)}`;
        events.push(
          `  ${event.shot.minute}' BLOCK ${clubLabel(clubId, league.clubsById)}${defender} shot=${event.shot.shotType} chance=${event.shot.chanceType}`,
        );
        break;
      }

      case "full_time":
      case "half_time":
      case "kickoff":
        break;
    }
  }

  return events;
}

/**
 * Formats compact engine-derived player match stats for one fixture.
 */
function formatFixturePlayerStats(fixture: Fixture, league: FakeLeagueSystem): readonly string[] {
  const report = fixture.result?.report;

  if (report === undefined) {
    return [];
  }

  return computePlayerMatchStats({
    report,
    playerRegistrations: fixturePlayerRegistrations(fixture, league),
    sortBy: "contribution",
  }).map((row) => formatPlayerMatchStatRow(row, fixture, league));
}

/**
 * Builds explicit fixture player registrations from the fake home and away lineups.
 */
function fixturePlayerRegistrations(fixture: Fixture, league: FakeLeagueSystem): readonly PlayerMatchStatRegistration[] {
  const registrations: PlayerMatchStatRegistration[] = [];

  appendLineupRegistrations(registrations, league.lineupsByClubId[fixture.homeClubId], "home");
  appendLineupRegistrations(registrations, league.lineupsByClubId[fixture.awayClubId], "away");

  return registrations;
}

/**
 * Appends one side's lineup to the explicit player-registration list.
 */
function appendLineupRegistrations(
  registrations: PlayerMatchStatRegistration[],
  lineup: readonly LineupSlot[] | undefined,
  side: MatchEventSide,
): void {
  if (lineup === undefined) {
    return;
  }

  for (const slot of lineup) {
    registrations.push({
      playerId: slot.playerId,
      side,
    });
  }
}

/**
 * Formats one compact player match-stat row.
 */
function formatPlayerMatchStatRow(row: PlayerMatchStatRow, fixture: Fixture, league: FakeLeagueSystem): string {
  const playerName = playerLabel(row.playerId, league.players).padEnd(19, " ");
  const clubName = clubLabel(sideClubId(fixture, row.side), league.clubsById).padEnd(5, " ");

  return [
    " ",
    playerName,
    clubName,
    String(row.goals).padStart(1, " "),
    String(row.assists).padStart(1, " "),
    String(row.shots).padStart(2, " "),
    String(row.shotsOnTarget).padStart(3, " "),
    String(row.saves).padStart(2, " "),
  ].join(" ");
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
 * Finds one fixture by its string ID value.
 */
function findFixtureByValue(fixtures: readonly Fixture[], fixtureValue: string): Fixture | undefined {
  for (const fixture of fixtures) {
    if (String(fixture.id) === fixtureValue) {
      return fixture;
    }
  }

  return undefined;
}

/**
 * Returns the fixture club ID for one match side.
 */
function sideClubId(fixture: Fixture, side: MatchEventSide): ClubId {
  return side === "home" ? fixture.homeClubId : fixture.awayClubId;
}

/**
 * Returns the other side of one match event.
 */
function oppositeSide(side: MatchEventSide): MatchEventSide {
  return side === "home" ? "away" : "home";
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
function formatSeasonOutput(
  league: FakeLeagueSystem,
  result: CliSeasonResult,
  seed: string,
  setupDemo: CliSetupDemo | undefined,
): readonly string[] {
  const lines: string[] = [
    "The Long Season simulated season",
    `Seed: ${seed}`,
    `Competition: ${league.competition.name}`,
  ];

  if (setupDemo !== undefined) {
    lines.push(...formatSetupDemoLines(league, setupDemo));
  }

  lines.push("");
  lines.push("Final table:");
  lines.push("Pos Club          P  W  D  L  GF GA GD  Pts");

  for (const row of result.table) {
    lines.push(formatTableRow(row, league.clubsById));
  }

  lines.push("");
  lines.push(`Top scorer: ${formatTopScorer(result.playerGoalStats[0], league.players, league.clubsById)}`);
  lines.push(`Top assist: ${formatTopAssist(topPlayerByMetric(result.playerSummaryStats, "assists"), league.players, league.clubsById)}`);
  lines.push(
    `Top goalkeeper saves: ${formatTopGoalkeeperSaves(
      topPlayerByMetric(result.playerSummaryStats, "saves"),
      league.players,
      league.clubsById,
    )}`,
  );
  lines.push(`Best defense: ${formatSummaryRow(result.bestDefense, league.clubsById, "GA")}`);
  lines.push(`Worst attack: ${formatSummaryRow(result.worstAttack, league.clubsById, "GF")}`);

  return lines;
}

/**
 * Builds the single deterministic selected setup used for CLI inspection.
 */
function buildSetupDemo(league: FakeLeagueSystem, profileKey: SetupDemoProfileKey): CliSetupDemo {
  switch (profileKey) {
    case DEMO_SETUP_PROFILE_PRO01_ATTACKING:
      return buildPro01AttackingSetupDemo(league);
  }
}

/**
 * Builds an attacking PRO01 demo setup from generated fake content.
 */
function buildPro01AttackingSetupDemo(league: FakeLeagueSystem): CliSetupDemo {
  const clubId = league.clubIds[0];

  if (clubId === undefined) {
    throw new Error("Cannot build setup demo without a generated club");
  }

  const baseLineup = league.lineupsByClubId[clubId];

  if (baseLineup === undefined) {
    throw new Error(`Cannot build setup demo without a lineup for club: ${clubId}`);
  }

  const roleChanges: CliSetupDemoRoleChange[] = [];
  const selectedSlots = baseLineup.map((slot) => {
    const roleKey = setupDemoRoleKey(slot);

    if (slot.roleKey !== roleKey) {
      roleChanges.push({
        slotKey: slot.slotId,
        playerId: slot.playerId,
        fromRoleKey: slot.roleKey,
        toRoleKey: roleKey,
      });
    }

    return {
      slotKey: slot.slotId,
      playerId: slot.playerId,
      roleKey,
    };
  });

  const tactic: SimulateSeasonSetupOverride["tactic"] = {
    mentality: "attacking",
    pressing: 0.85,
    directness: 0.75,
    width: 0.8,
    risk: 0.7,
  };

  return {
    profileKey: DEMO_SETUP_PROFILE_PRO01_ATTACKING,
    clubId,
    tactic,
    roleChanges,
    override: {
      clubId,
      lineup: {
        clubId,
        slots: selectedSlots,
      },
      tactic,
      requiredLineupSize: baseLineup.length,
      players: league.players,
      roleWeights: league.roleWeights,
      playerStates: league.playerStates,
    },
  };
}

/**
 * Returns the selected role key for the PRO01 attacking demo.
 */
function setupDemoRoleKey(slot: FakeLeagueSystem["lineupsByClubId"][ClubId][number]): string {
  if (slot.slotId === "slot:08" || slot.slotId === "slot:09") {
    return "attacker";
  }

  return slot.roleKey;
}

/**
 * Formats the applied setup demo context for season and fixture outputs.
 */
function formatSetupDemoLines(league: FakeLeagueSystem, setupDemo: CliSetupDemo): readonly string[] {
  const lines = [
    `Setup demo: ${setupDemo.profileKey}`,
    `Selected club: ${clubLabel(setupDemo.clubId, league.clubsById)}`,
    `Tactic: mentality=${setupDemo.tactic.mentality} pressing=${formatTacticKnob(setupDemo.tactic.pressing)} directness=${formatTacticKnob(setupDemo.tactic.directness)} width=${formatTacticKnob(setupDemo.tactic.width)} risk=${formatTacticKnob(setupDemo.tactic.risk)}`,
    "Lineup role changes:",
  ];

  if (setupDemo.roleChanges.length === 0) {
    lines.push("  none");
    return lines;
  }

  for (const change of setupDemo.roleChanges) {
    lines.push(
      `  ${change.slotKey}: ${playerLabel(change.playerId, league.players)} ${change.fromRoleKey} -> ${change.toRoleKey}`,
    );
  }

  return lines;
}

/**
 * Formats a tactic knob with a stable precision for CLI inspection.
 */
function formatTacticKnob(value: number): string {
  return value.toFixed(2);
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
): string {
  if (row === undefined) {
    return "unavailable";
  }

  return `${playerLabel(row.playerId, players)} (${clubLabel(row.clubId, clubsById)}) - ${formatGoalCount(row.goals)}`;
}

/**
 * Formats the top assist-provider summary from engine-derived season stats.
 */
function formatTopAssist(
  row: SeasonPlayerSummaryStatRow | undefined,
  players: FakeLeagueSystem["players"],
  clubsById: Readonly<Record<ClubId, Club>>,
): string {
  if (row === undefined) {
    return "unavailable";
  }

  return `${playerLabel(row.playerId, players)} (${clubLabel(row.clubId, clubsById)}) - ${formatAssistCount(row.assists)}`;
}

/**
 * Formats the top goalkeeper-save summary from engine-derived season stats.
 */
function formatTopGoalkeeperSaves(
  row: SeasonPlayerSummaryStatRow | undefined,
  players: FakeLeagueSystem["players"],
  clubsById: Readonly<Record<ClubId, Club>>,
): string {
  if (row === undefined) {
    return "unavailable";
  }

  return `${playerLabel(row.playerId, players)} (${clubLabel(row.clubId, clubsById)}) - ${formatSaveCount(row.saves)}`;
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
function formatGoalCount(goals: number): string {
  return `${goals} ${goals === 1 ? "goal" : "goals"}`;
}

/**
 * Formats an assist count with a stable singular/plural suffix.
 */
function formatAssistCount(assists: number): string {
  return `${assists} ${assists === 1 ? "assist" : "assists"}`;
}

/**
 * Formats a goalkeeper-save count with a stable singular/plural suffix.
 */
function formatSaveCount(saves: number): string {
  return `${saves} ${saves === 1 ? "save" : "saves"}`;
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
      readonly fixtureId: string | undefined;
      readonly setupDemo: SetupDemoProfileKey | undefined;
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

/** Parsed fixture ID argument result. */
type ParsedFixtureId =
  | {
      readonly ok: true;
      readonly fixtureId: string;
    }
  | {
      readonly ok: false;
      readonly message: string;
    };

/** Parsed setup-demo argument result. */
type ParsedSetupDemo =
  | {
      readonly ok: true;
      readonly setupDemo: SetupDemoProfileKey;
    }
  | {
      readonly ok: false;
      readonly message: string;
    };

/** Supported deterministic setup-demo profile keys. */
type SetupDemoProfileKey = typeof DEMO_SETUP_PROFILE_PRO01_ATTACKING;

/**
 * CLI-owned description of the deterministic selected setup demo.
 */
interface CliSetupDemo {
  /** Stable profile key requested by the user. */
  readonly profileKey: SetupDemoProfileKey;
  /** Club whose setup is overridden. */
  readonly clubId: ClubId;
  /** Tactic setup applied to the selected club. */
  readonly tactic: SimulateSeasonSetupOverride["tactic"];
  /** Role changes applied relative to the generated fake lineup. */
  readonly roleChanges: readonly CliSetupDemoRoleChange[];
  /** Engine input passed through `simulateSeason.setupOverrides`. */
  readonly override: SimulateSeasonSetupOverride;
}

/**
 * One selected-lineup role change rendered by the CLI inspection output.
 */
interface CliSetupDemoRoleChange {
  /** Slot key changed by the demo setup. */
  readonly slotKey: string;
  /** Player occupying the changed slot. */
  readonly playerId: PlayerId;
  /** Original fake-content role key. */
  readonly fromRoleKey: string;
  /** Selected demo role key. */
  readonly toRoleKey: string;
}

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
  readonly playerSummaryStats: readonly SeasonPlayerSummaryStatRow[];
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

/** Player summary stat row type derived from the exported season simulation. */
type SeasonPlayerSummaryStatRow = ReturnType<typeof simulateSeason>["playerSummaryStats"][number];

/** Round type derived from the exported season simulation. */
type Round = ReturnType<typeof simulateSeason>["rounds"][number];

/** Fixture type derived from the exported season simulation. */
type Fixture = ReturnType<typeof simulateSeason>["fixtures"][number];

/** Fixture ID type derived from the exported season simulation. */
type FixtureId = ReturnType<typeof simulateSeason>["fixtureIds"][number];

/** Match event side marker used by durable fixture report events. */
type MatchEventSide = "home" | "away";
