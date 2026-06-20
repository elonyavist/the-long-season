import {
  createFakeLeagueSystem,
  type FakeLeagueSystem,
} from "@game/content";
import {
  FORMATION_CATALOG,
  FORMATION_KEYS,
  buildFormationSquadFitReport,
  computePlayerMatchStats,
  createMatchReport,
  createSquadDepth,
  buildTacticTeamContext,
  DEFAULT_FITNESS_RULES,
  deriveTeamStrength,
  isFormationKey,
  simulateSeason,
  simulateMatchWithManualTactics,
  TacticTeamContextError,
  type BuildTacticTeamContextInput,
  type FormationKey,
  type FormationSlotFit,
  type FormationSquadFitReport,
  type LineupSlot,
  type MatchTacticalDistributionInput,
  type MatchTeamContext,
  type PlayerMatchStatRegistration,
  type PlayerMatchStatRow,
  type PlayerStateMultiplierCurves,
  type RoleWeightProfile,
  type SimulateSeasonFixtureLineupOverride,
  type SimulateSeasonSetupOverride,
  type TeamStrength,
} from "@game/engine";

/** Fixed seed used when the user does not pass `--seed`. */
export const DEFAULT_SIMULATE_SEASON_SEED = "demo-001";

/** Balanced deterministic PRO01 setup-demo profile. */
export const DEMO_SETUP_PROFILE_PRO01_BALANCED = "pro01-balanced";

/** Attacking deterministic PRO01 setup-demo profile. */
export const DEMO_SETUP_PROFILE_PRO01_ATTACKING = "pro01-attacking";

/** Defensive deterministic PRO01 setup-demo profile. */
export const DEMO_SETUP_PROFILE_PRO01_DEFENSIVE = "pro01-defensive";

/** Deterministic condition demo for the first generated club's fixed season. */
export const CONDITION_DEMO_PROFILE_PRO01_SEASON = "pro01-season";

/** First-team deterministic PRO01 lineup profile. */
export const LINEUP_DEMO_PROFILE_PRO01_FIRST_TEAM = "pro01-first-team";

/** Rotated deterministic PRO01 lineup profile with selected reserves. */
export const LINEUP_DEMO_PROFILE_PRO01_ROTATED = "pro01-rotated";

/** Ordered deterministic setup-demo profiles supported by the CLI MVP. */
export const SUPPORTED_DEMO_SETUP_PROFILES = [
  DEMO_SETUP_PROFILE_PRO01_BALANCED,
  DEMO_SETUP_PROFILE_PRO01_ATTACKING,
  DEMO_SETUP_PROFILE_PRO01_DEFENSIVE,
] as const;

/** Ordered deterministic condition-demo profiles supported by the CLI MVP. */
export const SUPPORTED_CONDITION_DEMO_PROFILES = [CONDITION_DEMO_PROFILE_PRO01_SEASON] as const;

/** Ordered deterministic lineup-demo profiles supported by the CLI MVP. */
export const SUPPORTED_LINEUP_DEMO_PROFILES = [
  LINEUP_DEMO_PROFILE_PRO01_FIRST_TEAM,
  LINEUP_DEMO_PROFILE_PRO01_ROTATED,
] as const;

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
      `Usage: pnpm cli simulate-season [--seed=<seed>] [--round=<roundNumber>] [--fixture=<fixtureId>] [--setup-demo=${formatSupportedSetupDemoProfiles()}] [--manual-tactic-switch=<minute>:<profile>] [--condition-demo=${formatSupportedConditionDemoProfiles()}] [--lineup-demo=${formatSupportedLineupDemoProfiles()}] [--formation-fit=<formationKey>]`,
    );
    return 1;
  }

  const league = createFakeLeagueSystem();
  const setupDemo = parsed.setupDemo === undefined ? undefined : buildSetupDemo(league, parsed.setupDemo);
  const conditionDemo =
    parsed.conditionDemo === undefined ? undefined : buildConditionDemo(league, parsed.conditionDemo);
  const lineupDemo = parsed.lineupDemo === undefined ? undefined : buildLineupDemo(league, parsed.lineupDemo);
  const manualTacticSwitch =
    parsed.manualTacticSwitch === undefined
      ? undefined
      : {
          minute: parsed.manualTacticSwitch.minute,
          targetSetupDemo: buildSetupDemo(league, parsed.manualTacticSwitch.profileKey),
        };

  if (manualTacticSwitch !== undefined && parsed.fixtureId === undefined) {
    io.stderr("--manual-tactic-switch requires --fixture=<fixtureId>");
    return 1;
  }

  if (manualTacticSwitch !== undefined && setupDemo === undefined) {
    io.stderr("--manual-tactic-switch requires --setup-demo=<initialProfile>");
    return 1;
  }

  if (
    parsed.formationFit !== undefined &&
    (parsed.fixtureId !== undefined ||
      parsed.roundNumber !== undefined ||
      setupDemo !== undefined ||
      manualTacticSwitch !== undefined ||
      conditionDemo !== undefined ||
      lineupDemo !== undefined)
  ) {
    io.stderr("--formation-fit cannot be combined with --round, --fixture, --setup-demo, --manual-tactic-switch, --condition-demo, or --lineup-demo");
    return 1;
  }

  if (parsed.formationFit !== undefined) {
    for (const line of formatFormationFitOutput(league, parsed.seed, parsed.formationFit)) {
      io.stdout(line);
    }

    return 0;
  }

  if (manualTacticSwitch !== undefined && manualTacticSwitch.minute > league.matchEngineConfig.minuteCount) {
    io.stderr(
      `--manual-tactic-switch minute must be between 1 and ${league.matchEngineConfig.minuteCount}: ${manualTacticSwitch.minute}`,
    );
    return 1;
  }

  if (conditionDemo !== undefined && (parsed.fixtureId !== undefined || parsed.roundNumber !== undefined)) {
    io.stderr("--condition-demo cannot be combined with --round or --fixture");
    return 1;
  }

  if (
    lineupDemo !== undefined &&
    (parsed.roundNumber !== undefined || conditionDemo !== undefined || manualTacticSwitch !== undefined)
  ) {
    io.stderr("--lineup-demo cannot be combined with --round, --condition-demo, or --manual-tactic-switch");
    return 1;
  }

  const baseResult = simulateSeasonForCli(league, parsed.seed, setupDemo, conditionDemo);

  if (parsed.roundNumber !== undefined && findRound(baseResult.rounds, parsed.roundNumber) === undefined) {
    io.stderr(`Round not found: ${parsed.roundNumber}`);
    return 1;
  }

  if (parsed.fixtureId !== undefined && findFixtureByValue(baseResult.fixtures, parsed.fixtureId) === undefined) {
    io.stderr(`Fixture not found: ${parsed.fixtureId}`);
    return 1;
  }

  const lineupFixtureInspection =
    parsed.fixtureId === undefined || lineupDemo === undefined
      ? undefined
      : buildLineupFixtureInspection(league, baseResult, parsed.fixtureId, lineupDemo);
  const result =
    lineupFixtureInspection?.fixtureLineupOverride === undefined
      ? baseResult
      : simulateSeasonForCli(league, parsed.seed, setupDemo, undefined, lineupFixtureInspection.fixtureLineupOverride);

  if (parsed.fixtureId !== undefined) {
    for (const line of formatFixtureOnlyOutput(
      league,
      result,
      parsed.seed,
      parsed.fixtureId,
      setupDemo,
      manualTacticSwitch,
      lineupFixtureInspection,
    )) {
      io.stdout(line);
    }

    return 0;
  }

  for (const line of formatSeasonOutput(league, result, parsed.seed, setupDemo)) {
    io.stdout(line);
  }

  if (conditionDemo !== undefined) {
    for (const line of formatConditionDemoOutput(league, result, conditionDemo)) {
      io.stdout(line);
    }
  }

  if (lineupDemo !== undefined) {
    for (const line of formatLineupDemoOutput(league, lineupDemo)) {
      io.stdout(line);
    }
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
  let manualTacticSwitch: ParsedManualTacticSwitchValue | undefined;
  let conditionDemo: ConditionDemoProfileKey | undefined;
  let lineupDemo: LineupDemoProfileKey | undefined;
  let formationFit: FormationKey | undefined;

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

    if (arg === "--manual-tactic-switch") {
      const value = args[index + 1];
      const parsedManualTacticSwitch = parseManualTacticSwitch(value);

      if (!parsedManualTacticSwitch.ok) {
        return parsedManualTacticSwitch;
      }

      manualTacticSwitch = parsedManualTacticSwitch.manualTacticSwitch;
      index += 1;
      continue;
    }

    if (arg.startsWith("--manual-tactic-switch=")) {
      const parsedManualTacticSwitch = parseManualTacticSwitch(arg.slice("--manual-tactic-switch=".length));

      if (!parsedManualTacticSwitch.ok) {
        return parsedManualTacticSwitch;
      }

      manualTacticSwitch = parsedManualTacticSwitch.manualTacticSwitch;
      continue;
    }

    if (arg === "--condition-demo") {
      const value = args[index + 1];
      const parsedConditionDemo = parseConditionDemo(value);

      if (!parsedConditionDemo.ok) {
        return parsedConditionDemo;
      }

      conditionDemo = parsedConditionDemo.conditionDemo;
      index += 1;
      continue;
    }

    if (arg.startsWith("--condition-demo=")) {
      const parsedConditionDemo = parseConditionDemo(arg.slice("--condition-demo=".length));

      if (!parsedConditionDemo.ok) {
        return parsedConditionDemo;
      }

      conditionDemo = parsedConditionDemo.conditionDemo;
      continue;
    }

    if (arg === "--lineup-demo") {
      const value = args[index + 1];
      const parsedLineupDemo = parseLineupDemo(value);

      if (!parsedLineupDemo.ok) {
        return parsedLineupDemo;
      }

      lineupDemo = parsedLineupDemo.lineupDemo;
      index += 1;
      continue;
    }

    if (arg.startsWith("--lineup-demo=")) {
      const parsedLineupDemo = parseLineupDemo(arg.slice("--lineup-demo=".length));

      if (!parsedLineupDemo.ok) {
        return parsedLineupDemo;
      }

      lineupDemo = parsedLineupDemo.lineupDemo;
      continue;
    }

    if (arg === "--formation-fit") {
      const value = args[index + 1];
      const parsedFormationFit = parseFormationFit(value);

      if (!parsedFormationFit.ok) {
        return parsedFormationFit;
      }

      formationFit = parsedFormationFit.formationFit;
      index += 1;
      continue;
    }

    if (arg.startsWith("--formation-fit=")) {
      const parsedFormationFit = parseFormationFit(arg.slice("--formation-fit=".length));

      if (!parsedFormationFit.ok) {
        return parsedFormationFit;
      }

      formationFit = parsedFormationFit.formationFit;
      continue;
    }

    return { ok: false, message: `Unknown argument: ${arg}` };
  }

  return { ok: true, seed, roundNumber, fixtureId, setupDemo, manualTacticSwitch, conditionDemo, lineupDemo, formationFit };
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
    return { ok: false, message: `--setup-demo requires a supported value: ${formatSupportedSetupDemoProfiles()}` };
  }

  if (!isSetupDemoProfileKey(value)) {
    return {
      ok: false,
      message: `Unsupported --setup-demo value: ${value}. Supported values: ${formatSupportedSetupDemoProfiles()}`,
    };
  }

  return { ok: true, setupDemo: value };
}

/**
 * Parses one manual tactic-switch declaration in `<minute>:<profile>` form.
 */
function parseManualTacticSwitch(value: string | undefined): ParsedManualTacticSwitch {
  if (value === undefined || value.length === 0) {
    return {
      ok: false,
      message: `--manual-tactic-switch requires <minute>:<profile>, for example 46:${DEMO_SETUP_PROFILE_PRO01_ATTACKING}`,
    };
  }

  const separatorIndex = value.indexOf(":");

  if (separatorIndex <= 0 || separatorIndex === value.length - 1) {
    return {
      ok: false,
      message: `--manual-tactic-switch requires <minute>:<profile>, for example 46:${DEMO_SETUP_PROFILE_PRO01_ATTACKING}`,
    };
  }

  const minuteValue = value.slice(0, separatorIndex);
  const profileValue = value.slice(separatorIndex + 1);

  if (!/^[1-9][0-9]*$/.test(minuteValue)) {
    return { ok: false, message: "--manual-tactic-switch minute must be a positive integer" };
  }

  if (!isSetupDemoProfileKey(profileValue)) {
    return {
      ok: false,
      message: `Unsupported --manual-tactic-switch profile: ${profileValue}. Supported values: ${formatSupportedSetupDemoProfiles()}`,
    };
  }

  return {
    ok: true,
    manualTacticSwitch: {
      minute: Number(minuteValue),
      profileKey: profileValue,
    },
  };
}

/**
 * Parses the deterministic condition-demo profile key.
 */
function parseConditionDemo(value: string | undefined): ParsedConditionDemo {
  if (value === undefined || value.length === 0) {
    return { ok: false, message: `--condition-demo requires a supported value: ${formatSupportedConditionDemoProfiles()}` };
  }

  if (!isConditionDemoProfileKey(value)) {
    return {
      ok: false,
      message: `Unsupported --condition-demo value: ${value}. Supported values: ${formatSupportedConditionDemoProfiles()}`,
    };
  }

  return { ok: true, conditionDemo: value };
}

/**
 * Parses the deterministic lineup-demo profile key.
 */
function parseLineupDemo(value: string | undefined): ParsedLineupDemo {
  if (value === undefined || value.length === 0) {
    return { ok: false, message: `--lineup-demo requires a supported value: ${formatSupportedLineupDemoProfiles()}` };
  }

  if (!isLineupDemoProfileKey(value)) {
    return {
      ok: false,
      message: `Unsupported --lineup-demo value: ${value}. Supported values: ${formatSupportedLineupDemoProfiles()}`,
    };
  }

  return { ok: true, lineupDemo: value };
}

/**
 * Parses one supported formation key for squad-fit inspection.
 */
function parseFormationFit(value: string | undefined): ParsedFormationFit {
  if (value === undefined || value.length === 0) {
    return { ok: false, message: `--formation-fit requires a supported value: ${formatSupportedFormationKeys()}` };
  }

  if (!isFormationKey(value)) {
    return {
      ok: false,
      message: `Unsupported --formation-fit value: ${value}. Supported values: ${formatSupportedFormationKeys()}`,
    };
  }

  return { ok: true, formationFit: value };
}

/**
 * Checks whether a string is one of the supported setup-demo profiles.
 */
function isSetupDemoProfileKey(value: string): value is SetupDemoProfileKey {
  for (const profileKey of SUPPORTED_DEMO_SETUP_PROFILES) {
    if (value === profileKey) {
      return true;
    }
  }

  return false;
}

/**
 * Checks whether a string is one of the supported condition-demo profiles.
 */
function isConditionDemoProfileKey(value: string): value is ConditionDemoProfileKey {
  for (const profileKey of SUPPORTED_CONDITION_DEMO_PROFILES) {
    if (value === profileKey) {
      return true;
    }
  }

  return false;
}

/**
 * Checks whether a string is one of the supported lineup-demo profiles.
 */
function isLineupDemoProfileKey(value: string): value is LineupDemoProfileKey {
  for (const profileKey of SUPPORTED_LINEUP_DEMO_PROFILES) {
    if (value === profileKey) {
      return true;
    }
  }

  return false;
}

/**
 * Formats supported setup-demo profiles for usage and error messages.
 */
function formatSupportedSetupDemoProfiles(): string {
  return SUPPORTED_DEMO_SETUP_PROFILES.join("|");
}

/**
 * Formats supported condition-demo profiles for usage and error messages.
 */
function formatSupportedConditionDemoProfiles(): string {
  return SUPPORTED_CONDITION_DEMO_PROFILES.join("|");
}

/**
 * Formats supported lineup-demo profiles for usage and error messages.
 */
function formatSupportedLineupDemoProfiles(): string {
  return SUPPORTED_LINEUP_DEMO_PROFILES.join("|");
}

/**
 * Formats supported formation keys for usage and error messages.
 */
function formatSupportedFormationKeys(): string {
  return FORMATION_KEYS.join("|");
}

/**
 * Simulates the fake league season using currently exported engine primitives.
 */
function simulateSeasonForCli(
  league: FakeLeagueSystem,
  seed: string,
  setupDemo: CliSetupDemo | undefined,
  conditionDemo: CliConditionDemo | undefined,
  fixtureLineupOverride?: SimulateSeasonFixtureLineupOverride,
): CliSeasonResult {
  const result = simulateSeason({
    seed,
    seasonId: league.seasonId,
    competitionId: league.competition.id,
    clubIds: league.clubIds,
    seasonStartDate: league.seasonStartDate,
    teamsByClubId: createTeamsByClubId(league),
    ...(setupDemo === undefined ? {} : { setupOverrides: [setupDemo.override] }),
    ...(fixtureLineupOverride === undefined ? {} : { fixtureLineupOverrides: [fixtureLineupOverride] }),
    ...(conditionDemo === undefined && fixtureLineupOverride === undefined
      ? {}
      : {
          fitnessLifecycle: {
            playerStates: league.playerStates,
            playerIds: league.playerIds,
            rules: DEFAULT_FITNESS_RULES,
          },
        }),
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
    finalPlayerStates: result.finalPlayerStates,
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
  manualTacticSwitch: CliManualTacticSwitch | undefined,
  lineupFixtureInspection: CliLineupFixtureInspection | undefined,
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

  if (lineupFixtureInspection !== undefined) {
    lines.push(...formatLineupFixtureInspectionLines(league, result, lineupFixtureInspection));
  }

  const manualFixture = manualTacticSwitch === undefined || setupDemo === undefined
    ? undefined
    : buildManualTacticFixture(league, result, seed, fixtureValue, setupDemo, manualTacticSwitch);

  if (manualFixture !== undefined && setupDemo !== undefined && manualTacticSwitch !== undefined) {
    lines.push(...formatManualTacticSwitchLines(league, setupDemo, manualTacticSwitch, manualFixture));
  }

  lines.push("");
  lines.push(...formatFixtureDetailOutput(league, result, fixtureValue, manualFixture?.fixture, lineupFixtureInspection));

  return lines;
}

/**
 * Formats rich structured detail for one requested fixture.
 */
function formatFixtureDetailOutput(
  league: FakeLeagueSystem,
  result: CliSeasonResult,
  fixtureValue: string,
  overrideFixture: Fixture | undefined = undefined,
  lineupFixtureInspection: CliLineupFixtureInspection | undefined = undefined,
): readonly string[] {
  const fixture = overrideFixture ?? findFixtureByValue(result.fixtures, fixtureValue);

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

  const statLines = formatFixturePlayerStats(fixture, league, lineupFixtureInspection);
  if (statLines.length === 0) {
    lines.push("  none");
  } else {
    lines.push("  Player              Club  G A Sh SoT Sv");
    lines.push(...statLines);
  }

  return lines;
}

/**
 * Builds a single fixture result with an explicit manual tactic switch when it applies.
 */
function buildManualTacticFixture(
  league: FakeLeagueSystem,
  result: CliSeasonResult,
  seed: string,
  fixtureValue: string,
  initialSetupDemo: CliSetupDemo,
  manualTacticSwitch: CliManualTacticSwitch,
): CliManualTacticFixture {
  const fixture = findFixtureByValue(result.fixtures, fixtureValue);

  if (fixture === undefined) {
    throw new Error(`Cannot build manual tactic fixture for missing fixture: ${fixtureValue}`);
  }

  const side = selectedSetupSideForFixture(fixture, initialSetupDemo.clubId);

  if (side === undefined) {
    return {
      fixture,
      appliesToFixture: false,
    };
  }

  const teamsByClubId = createTeamsByClubId(league);
  const initialTeam = buildSetupOverrideContextForCli(initialSetupDemo.override);
  const targetTeam = buildSetupOverrideContextForCli(manualTacticSwitch.targetSetupDemo.override);
  const simulated = simulateMatchWithManualTactics(
    {
      fixtureId: fixture.id,
      seed,
      home: fixture.homeClubId === initialSetupDemo.clubId ? initialTeam : matchTeamContextForCli(teamsByClubId, fixture.homeClubId),
      away: fixture.awayClubId === initialSetupDemo.clubId ? initialTeam : matchTeamContextForCli(teamsByClubId, fixture.awayClubId),
      engineConfig: league.matchEngineConfig,
    },
    {
      manualTacticChanges: [
        {
          side,
          minute: manualTacticSwitch.minute,
          team: targetTeam,
        },
      ],
    },
  );
  const report = createMatchReport(simulated);

  return {
    fixture: {
      ...fixture,
      result: {
        played: true,
        homeGoals: report.score.home,
        awayGoals: report.score.away,
        report,
      },
    },
    appliesToFixture: true,
  };
}

/**
 * Finds the side where the selected demo club participates in a fixture.
 */
function selectedSetupSideForFixture(fixture: Fixture, selectedClubId: ClubId): MatchEventSide | undefined {
  if (fixture.homeClubId === selectedClubId) {
    return "home";
  }

  if (fixture.awayClubId === selectedClubId) {
    return "away";
  }

  return undefined;
}

/**
 * Converts one selected setup override into a match-team context for CLI inspection.
 */
function buildSetupOverrideContextForCli(override: SimulateSeasonSetupOverride): MatchTeamContext {
  const builderInput: BuildTacticTeamContextInput = {
    lineup: override.lineup,
    tactic: override.tactic,
    requiredLineupSize: override.requiredLineupSize,
    players: override.players,
    roleWeights: override.roleWeights,
    ...(override.playerStates === undefined ? {} : { playerStates: override.playerStates }),
    ...(override.stateMultiplierCurves === undefined ? {} : { stateMultiplierCurves: override.stateMultiplierCurves }),
  };

  try {
    return buildTacticTeamContext(builderInput);
  } catch (error) {
    if (error instanceof TacticTeamContextError) {
      throw new Error(`Invalid CLI setup demo for club ${override.clubId}: ${error.message}`);
    }

    throw error;
  }
}

/**
 * Reads one already-built base team context for a club.
 */
function matchTeamContextForCli(
  teamsByClubId: Readonly<Record<ClubId, CliTeamContext>>,
  clubId: ClubId,
): MatchTeamContext {
  const team = teamsByClubId[clubId];

  if (team === undefined) {
    throw new Error(`Missing CLI team context: ${clubId}`);
  }

  return team;
}

/**
 * Formats manual switch inspection metadata for fixture-focused output.
 */
function formatManualTacticSwitchLines(
  league: FakeLeagueSystem,
  setupDemo: CliSetupDemo,
  manualTacticSwitch: CliManualTacticSwitch,
  manualFixture: CliManualTacticFixture,
): readonly string[] {
  const lines = [
    "Manual tactic switch:",
    `  Selected club: ${clubLabel(setupDemo.clubId, league.clubsById)}`,
    `  Initial profile: ${setupDemo.profileKey}`,
    `  Switch: ${manualTacticSwitch.minute}' -> ${manualTacticSwitch.targetSetupDemo.profileKey}`,
    `  Applies to fixture: ${manualFixture.appliesToFixture ? "yes" : "no"}`,
  ];

  if (!manualFixture.appliesToFixture) {
    lines.push(
      `  Reason: ${clubLabel(setupDemo.clubId, league.clubsById)} is not playing this fixture`,
      "Profile timeline:",
      `  unchanged: ${formatFixtureResult(manualFixture.fixture, league)}`,
    );
    return lines;
  }

  lines.push("Profile timeline:");

  if (manualTacticSwitch.minute > 1) {
    lines.push(`  1'-${manualTacticSwitch.minute - 1}': ${setupDemo.profileKey}`);
  }

  lines.push(`  ${manualTacticSwitch.minute}'-${league.matchEngineConfig.minuteCount}': ${manualTacticSwitch.targetSetupDemo.profileKey}`);

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
function formatFixturePlayerStats(
  fixture: Fixture,
  league: FakeLeagueSystem,
  lineupFixtureInspection: CliLineupFixtureInspection | undefined,
): readonly string[] {
  const report = fixture.result?.report;

  if (report === undefined) {
    return [];
  }

  return computePlayerMatchStats({
    report,
    playerRegistrations: fixturePlayerRegistrations(fixture, league, lineupFixtureInspection),
    sortBy: "contribution",
  }).map((row) => formatPlayerMatchStatRow(row, fixture, league));
}

/**
 * Builds explicit fixture player registrations from the fake home and away lineups.
 */
function fixturePlayerRegistrations(
  fixture: Fixture,
  league: FakeLeagueSystem,
  lineupFixtureInspection: CliLineupFixtureInspection | undefined,
): readonly PlayerMatchStatRegistration[] {
  const registrations: PlayerMatchStatRegistration[] = [];
  const overriddenLineup =
    lineupFixtureInspection?.appliesToFixture === true ? lineupFixtureInspection.lineup : undefined;
  const homeLineup =
    fixture.homeClubId === lineupFixtureInspection?.clubId && overriddenLineup !== undefined
      ? overriddenLineup
      : league.lineupsByClubId[fixture.homeClubId];
  const awayLineup =
    fixture.awayClubId === lineupFixtureInspection?.clubId && overriddenLineup !== undefined
      ? overriddenLineup
      : league.lineupsByClubId[fixture.awayClubId];

  appendLineupRegistrations(registrations, homeLineup, "home");
  appendLineupRegistrations(registrations, awayLineup, "away");

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
      players: league.players,
      roleWeights,
      stateMultiplierCurves: league.stateMultiplierCurves,
      strength: deriveTeamStrength({
        lineup: typedLineup,
        players: league.players,
        playerStates: league.playerStates,
        roleWeights,
        stateMultiplierCurves: league.stateMultiplierCurves,
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
 * Formats a standalone formation-fit inspection report.
 */
function formatFormationFitOutput(
  league: FakeLeagueSystem,
  seed: string,
  formationKey: FormationKey,
): readonly string[] {
  const clubId = firstGeneratedClubId(league, "formation-fit inspection");
  const club = league.clubsById[clubId];
  const report = buildFormationFitReportForCli(league, clubId, formationKey);
  const formation = FORMATION_CATALOG[formationKey];
  const lines = [
    "The Long Season formation fit",
    `Seed: ${seed}`,
    `Competition: ${league.competition.name}`,
    `Selected club: ${clubLabel(clubId, league.clubsById)}`,
    `Squad size: ${club?.playerIds.length ?? 0}`,
    `Selected formation: ${formationKey}`,
    "Inspection only: no lineup is auto-selected and no transfer action is created.",
    "",
    "Formation slots:",
  ];

  for (const slot of formation.slots) {
    lines.push(
      `  ${slot.slotKey} ${slot.positionFamily} department=${slot.department}${slot.side === undefined ? "" : ` side=${slot.side}`}`,
    );
  }

  lines.push("Covered slots:");
  lines.push(...formatFormationSlotFitRows(report.coveredSlots));
  lines.push("Adapted/weak slots:");
  lines.push(...formatFormationSlotFitRows([...report.adaptedSlots, ...report.weakSlots]));
  lines.push("Missing slots:");
  lines.push(...formatFormationSlotFitRows(report.uncoveredSlots));
  lines.push("Surplus groups:");

  if (report.surplusGroups.length === 0) {
    lines.push("  none");
  } else {
    for (const group of report.surplusGroups) {
      lines.push(`  ${group.key} players=${group.playerCount} slots=${group.slotCount}`);
    }
  }

  lines.push("Fit warnings:");
  lines.push(...formatFormationFitWarningRows(report));
  lines.push("Market-need hints:");
  lines.push(`  ${report.marketNeedHints.length === 0 ? "none" : report.marketNeedHints.join(", ")}`);

  return lines;
}

/**
 * Builds the first CLI-visible formation-fit report from generated fake content.
 */
function buildFormationFitReportForCli(
  league: FakeLeagueSystem,
  clubId: ClubId,
  formationKey: FormationKey,
): FormationSquadFitReport {
  const club = league.clubsById[clubId];
  const lineup = league.lineupsByClubId[clubId];

  if (club === undefined) {
    throw new Error(`Cannot build formation-fit report without club: ${clubId}`);
  }

  if (lineup === undefined) {
    throw new Error(`Cannot build formation-fit report without lineup: ${clubId}`);
  }

  const starterPlayerIds = lineup.map((slot) => slot.playerId);
  const starterPlayerSet = new Set<PlayerId>(starterPlayerIds);

  return buildFormationSquadFitReport({
    formation: FORMATION_CATALOG[formationKey],
    squadDepth: createSquadDepth({
      clubId,
      squadPlayerIds: club.playerIds,
      starterPlayerIds,
      benchReservePlayerIds: club.playerIds.filter((playerId) => !starterPlayerSet.has(playerId)),
    }),
    players: league.players,
  });
}

/**
 * Formats compact slot-fit rows or a stable `none` marker.
 */
function formatFormationSlotFitRows(slots: readonly FormationSlotFit[]): readonly string[] {
  if (slots.length === 0) {
    return ["  none"];
  }

  return slots.map(
    (slot) =>
      `  ${slot.slotKey} ${slot.positionFamily} best=${slot.bestSuitability} natural=${countSlotCandidates(slot, "natural")} adapted=${countSlotCandidates(slot, "adapted")} weak=${countSlotCandidates(slot, "weak")}`,
  );
}

/**
 * Formats role-depth warnings for slots covered only through adaptation.
 */
function formatFormationFitWarningRows(report: FormationSquadFitReport): readonly string[] {
  const warnings = report.marketNeedHints
    .filter((hint) => hint.startsWith("consider:"))
    .map((hint) => `  weak_depth:${hint.slice("consider:".length)}`);

  return warnings.length === 0 ? ["  none"] : warnings;
}

/**
 * Counts slot candidates by suitability for clearer CLI inspection.
 */
function countSlotCandidates(slot: FormationSlotFit, suitability: FormationSlotFit["bestSuitability"]): number {
  return slot.candidates.filter((candidate) => candidate.suitability === suitability).length;
}

/**
 * Formats deterministic fitness lifecycle inspection for one condition demo.
 */
function formatConditionDemoOutput(
  league: FakeLeagueSystem,
  result: CliSeasonResult,
  conditionDemo: CliConditionDemo,
): readonly string[] {
  const selectedFixtures = clubFixtures(result.fixtures, conditionDemo.clubId);
  const firstFixture = selectedFixtures[0];
  const secondFixture = selectedFixtures[1];
  const firstFixtureLabel = firstFixture === undefined ? "unavailable" : formatFixtureResult(firstFixture, league);
  const recoveryDays = firstFixture === undefined || secondFixture === undefined
    ? undefined
    : Number(secondFixture.date) - Number(firstFixture.date);
  const firstMatchFitness = DEFAULT_FITNESS_RULES.maxFitness - DEFAULT_FITNESS_RULES.matchFitnessCost;
  const recoveredFitness = recoveryDays === undefined
    ? undefined
    : Math.min(
        DEFAULT_FITNESS_RULES.maxFitness,
        firstMatchFitness + DEFAULT_FITNESS_RULES.dailyRecovery * recoveryDays,
      );
  const tableRow = findTableRow(result.table, conditionDemo.clubId);
  const lines = [
    "",
    `Condition demo: ${conditionDemo.profileKey}`,
    `  Selected club: ${clubLabel(conditionDemo.clubId, league.clubsById)}`,
    "  Season fitness lifecycle: enabled",
    `  Rules: match cost=${DEFAULT_FITNESS_RULES.matchFitnessCost} daily recovery=${DEFAULT_FITNESS_RULES.dailyRecovery} clamp=${DEFAULT_FITNESS_RULES.minFitness}..${DEFAULT_FITNESS_RULES.maxFitness}`,
    `  First selected club fixture: ${firstFixtureLabel}`,
    `  After first match selected starters fitness: ${firstMatchFitness}`,
    `  Before next selected fixture fitness after ${recoveryDays ?? "unknown"} days recovery: ${recoveredFitness ?? "unavailable"}`,
    `  Selected club final table: ${formatConditionTableImpact(tableRow, league)}`,
    "  Final selected club condition:",
    "  Player              Start Final Delta",
  ];

  for (const slot of conditionDemo.lineup) {
    lines.push(formatConditionPlayerRow(slot.playerId, league, result));
  }

  return lines;
}

/**
 * Formats a selected-lineup profile without applying it to fixtures or seasons.
 */
function formatLineupDemoOutput(league: FakeLeagueSystem, lineupDemo: CliLineupDemo): readonly string[] {
  const lines = [
    "",
    `Lineup demo: ${lineupDemo.profileKey}`,
    `  Selected club: ${clubLabel(lineupDemo.clubId, league.clubsById)}`,
    "  Applied to fixtures: no (profile inspection only)",
    "  Changes from first team:",
  ];

  if (lineupDemo.playerChanges.length === 0) {
    lines.push("  none");
  } else {
    for (const change of lineupDemo.playerChanges) {
      lines.push(formatLineupDemoChange(change, league));
    }
  }

  lines.push("  Selected starters:");

  for (const slot of lineupDemo.lineup) {
    lines.push(formatLineupDemoStarter(slot, league));
  }

  return lines;
}

/**
 * Formats fixture-scoped manual lineup inspection metadata.
 */
function formatLineupFixtureInspectionLines(
  league: FakeLeagueSystem,
  result: CliSeasonResult,
  inspection: CliLineupFixtureInspection,
): readonly string[] {
  const fixture = findFixtureByValue(result.fixtures, inspection.fixtureValue);
  const fixtureLabel = fixture === undefined ? inspection.fixtureValue : formatFixtureResult(fixture, league);
  const lines = [
    `Lineup override: ${inspection.profileKey}`,
    `  Selected club: ${clubLabel(inspection.clubId, league.clubsById)}`,
    `  Fixture: ${fixtureLabel}`,
    `  Applies to fixture: ${inspection.appliesToFixture ? "yes" : "no"}`,
  ];

  if (!inspection.appliesToFixture) {
    lines.push(`  Reason: ${clubLabel(inspection.clubId, league.clubsById)} is not playing this fixture`);
  }

  lines.push("  Selected starters:");

  for (const slot of inspection.lineup) {
    lines.push(formatLineupDemoStarter(slot, league));
  }

  lines.push("  Rested from first team:");

  if (inspection.playerChanges.length === 0) {
    lines.push("  none");
  } else {
    for (const change of inspection.playerChanges) {
      lines.push(`  ${playerLabel(change.fromPlayerId, league.players)} replaced by ${playerLabel(change.toPlayerId, league.players)}`);
    }
  }

  lines.push(...formatLineupConditionImpactLines(league, inspection));

  return lines;
}

/**
 * Formats the per-fixture fitness consequence of the selected lineup.
 */
function formatLineupConditionImpactLines(
  league: FakeLeagueSystem,
  inspection: CliLineupFixtureInspection,
): readonly string[] {
  const lines = ["  Condition impact for this fixture:"];

  if (!inspection.appliesToFixture) {
    lines.push("  Selected starters spend 0 fitness because the selected club is not playing");
    return lines;
  }

  lines.push(`  Selected starters spend ${DEFAULT_FITNESS_RULES.matchFitnessCost} fitness`);

  if (inspection.playerChanges.length === 0) {
    lines.push("  Rested first-team players: none");
    return lines;
  }

  lines.push("  Selected replacements after fixture:");
  for (const change of inspection.playerChanges) {
    lines.push(
      `  ${playerLabel(change.toPlayerId, league.players)} expected fitness ${DEFAULT_FITNESS_RULES.maxFitness - DEFAULT_FITNESS_RULES.matchFitnessCost}`,
    );
  }

  lines.push("  Rested first-team players after fixture:");
  for (const change of inspection.playerChanges) {
    lines.push(`  ${playerLabel(change.fromPlayerId, league.players)} expected fitness ${DEFAULT_FITNESS_RULES.maxFitness}`);
  }

  return lines;
}

/**
 * Formats one player change relative to PRO01's first-team lineup.
 */
function formatLineupDemoChange(change: CliLineupDemoPlayerChange, league: FakeLeagueSystem): string {
  return `  ${change.slotId}: ${playerLabel(change.fromPlayerId, league.players)} -> ${playerLabel(
    change.toPlayerId,
    league.players,
  )} (${change.roleKey})`;
}

/**
 * Formats one selected starter row for the lineup-demo inspection block.
 */
function formatLineupDemoStarter(slot: LineupSlot, league: FakeLeagueSystem): string {
  return `  ${slot.slotId} ${playerLabel(slot.playerId, league.players)} ${slot.roleKey}`;
}

/**
 * Builds one deterministic condition demo from generated fake content.
 */
function buildConditionDemo(league: FakeLeagueSystem, profileKey: ConditionDemoProfileKey): CliConditionDemo {
  switch (profileKey) {
    case CONDITION_DEMO_PROFILE_PRO01_SEASON: {
      const clubId = league.clubIds[0];

      if (clubId === undefined) {
        throw new Error("Cannot build condition demo without a generated club");
      }

      const lineup = league.lineupsByClubId[clubId];

      if (lineup === undefined) {
        throw new Error(`Cannot build condition demo without a lineup for club: ${clubId}`);
      }

      return {
        profileKey,
        clubId,
        lineup,
      };
    }
  }
}

/**
 * Builds one deterministic lineup demo from generated fake content.
 */
function buildLineupDemo(league: FakeLeagueSystem, profileKey: LineupDemoProfileKey): CliLineupDemo {
  const clubId = firstGeneratedClubId(league, "lineup demo");
  const firstTeamLineup = firstGeneratedClubLineup(league, clubId, "lineup demo");

  switch (profileKey) {
    case LINEUP_DEMO_PROFILE_PRO01_FIRST_TEAM:
      return {
        profileKey,
        clubId,
        lineup: firstTeamLineup,
        playerChanges: [],
      };

    case LINEUP_DEMO_PROFILE_PRO01_ROTATED:
      return buildRotatedPro01LineupDemo(league, clubId, firstTeamLineup);
  }
}

/**
 * Builds fixture-scoped inspection data for one manually selected lineup demo.
 */
function buildLineupFixtureInspection(
  league: FakeLeagueSystem,
  result: CliSeasonResult,
  fixtureValue: string,
  lineupDemo: CliLineupDemo,
): CliLineupFixtureInspection {
  const fixture = findFixtureByValue(result.fixtures, fixtureValue);

  if (fixture === undefined) {
    throw new Error(`Cannot build lineup fixture inspection for missing fixture: ${fixtureValue}`);
  }

  const appliesToFixture = selectedSetupSideForFixture(fixture, lineupDemo.clubId) !== undefined;

  return {
    profileKey: lineupDemo.profileKey,
    clubId: lineupDemo.clubId,
    fixtureValue,
    lineup: lineupDemo.lineup,
    playerChanges: lineupDemo.playerChanges,
    appliesToFixture,
    ...(appliesToFixture
      ? { fixtureLineupOverride: buildFixtureLineupOverrideForCli(league, fixture, lineupDemo) }
      : {}),
  };
}

/**
 * Builds the engine fixture-lineup override for one applicable CLI inspection.
 */
function buildFixtureLineupOverrideForCli(
  league: FakeLeagueSystem,
  fixture: Fixture,
  lineupDemo: CliLineupDemo,
): SimulateSeasonFixtureLineupOverride {
  return {
    fixtureId: fixture.id,
    clubId: lineupDemo.clubId,
    lineup: lineupDemo.lineup,
    requiredLineupSize: lineupDemo.lineup.length,
    players: league.players,
    roleWeights: league.roleWeights,
    playerStates: league.playerStates,
    stateMultiplierCurves: league.stateMultiplierCurves,
  };
}

/**
 * Builds the first rotated PRO01 demo lineup from deterministic reserve players.
 */
function buildRotatedPro01LineupDemo(
  league: FakeLeagueSystem,
  clubId: ClubId,
  firstTeamLineup: readonly LineupSlot[],
): CliLineupDemo {
  const replacementBySlotId: Readonly<Record<string, PlayerId>> = {
    "slot:01": reservePlayerId(league, clubId, "12"),
    "slot:05": reservePlayerId(league, clubId, "13"),
    "slot:08": reservePlayerId(league, clubId, "15"),
    "slot:11": reservePlayerId(league, clubId, "16"),
  };
  const playerChanges: CliLineupDemoPlayerChange[] = [];
  const lineup = firstTeamLineup.map((slot) => {
    const replacementPlayerId = replacementBySlotId[slot.slotId];

    if (replacementPlayerId === undefined) {
      return slot;
    }

    playerChanges.push({
      slotId: slot.slotId,
      fromPlayerId: slot.playerId,
      toPlayerId: replacementPlayerId,
      roleKey: slot.roleKey,
    });

    return {
      ...slot,
      playerId: replacementPlayerId,
    };
  });

  return {
    profileKey: LINEUP_DEMO_PROFILE_PRO01_ROTATED,
    clubId,
    lineup,
    playerChanges,
  };
}

/**
 * Reads the first generated club ID for deterministic PRO01 demo profiles.
 */
function firstGeneratedClubId(league: FakeLeagueSystem, label: string): ClubId {
  const clubId = league.clubIds[0];

  if (clubId === undefined) {
    throw new Error(`Cannot build ${label} without a generated club`);
  }

  return clubId;
}

/**
 * Reads the generated first-team lineup for one demo club.
 */
function firstGeneratedClubLineup(league: FakeLeagueSystem, clubId: ClubId, label: string): readonly LineupSlot[] {
  const lineup = league.lineupsByClubId[clubId];

  if (lineup === undefined) {
    throw new Error(`Cannot build ${label} without a lineup for club: ${clubId}`);
  }

  return lineup;
}

/**
 * Finds one deterministic reserve player by final generated ID suffix.
 */
function reservePlayerId(league: FakeLeagueSystem, clubId: ClubId, suffix: string): PlayerId {
  const club = league.clubsById[clubId];

  if (club === undefined) {
    throw new Error(`Cannot find reserve player without a generated club: ${clubId}`);
  }

  for (const playerId of club.playerIds) {
    if (String(playerId).endsWith(`-${suffix}`)) {
      return playerId;
    }
  }

  throw new Error(`Missing reserve player ${suffix} for club: ${clubId}`);
}

/**
 * Builds one deterministic selected setup used for CLI inspection.
 */
function buildSetupDemo(league: FakeLeagueSystem, profileKey: SetupDemoProfileKey): CliSetupDemo {
  switch (profileKey) {
    case DEMO_SETUP_PROFILE_PRO01_BALANCED:
      return buildPro01SetupDemo(league, {
        profileKey,
        tactic: {
          mentality: "balanced",
          pressing: 0.5,
          directness: 0.5,
          width: 0.5,
          risk: 0.5,
        },
        selectedRoleKey: pro01BalancedRoleKey,
      });

    case DEMO_SETUP_PROFILE_PRO01_ATTACKING:
      return buildPro01SetupDemo(league, {
        profileKey,
        tactic: {
          mentality: "attacking",
          pressing: 0.85,
          directness: 0.75,
          width: 0.8,
          risk: 0.7,
        },
        selectedRoleKey: pro01AttackingRoleKey,
      });

    case DEMO_SETUP_PROFILE_PRO01_DEFENSIVE:
      return buildPro01SetupDemo(league, {
        profileKey,
        tactic: {
          mentality: "defensive",
          pressing: 0.35,
          directness: 0.3,
          width: 0.4,
          risk: 0.2,
        },
        selectedRoleKey: pro01DefensiveRoleKey,
      });
  }
}

/**
 * Builds a PRO01 demo setup from generated fake content.
 */
function buildPro01SetupDemo(league: FakeLeagueSystem, definition: CliSetupDemoDefinition): CliSetupDemo {
  const clubId = firstGeneratedClubId(league, "setup demo");
  const baseLineup = firstGeneratedClubLineup(league, clubId, "setup demo");

  const roleChanges: CliSetupDemoRoleChange[] = [];
  const selectedSlots = baseLineup.map((slot) => {
    const roleKey = definition.selectedRoleKey(slot);

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

  return {
    profileKey: definition.profileKey,
    clubId,
    tactic: definition.tactic,
    roleChanges,
    override: {
      clubId,
      lineup: {
        clubId,
        slots: selectedSlots,
      },
      tactic: definition.tactic,
      requiredLineupSize: baseLineup.length,
      players: league.players,
      roleWeights: league.roleWeights,
      playerStates: league.playerStates,
      stateMultiplierCurves: league.stateMultiplierCurves,
    },
  };
}

/**
 * Keeps the generated PRO01 lineup roles unchanged for the balanced demo.
 */
function pro01BalancedRoleKey(slot: FakeLineupSlotForCli): string {
  return slot.roleKey;
}

/**
 * Pushes two wide midfield slots into attacking roles for the attacking demo.
 */
function pro01AttackingRoleKey(slot: FakeLineupSlotForCli): string {
  if (slot.slotId === "slot:08" || slot.slotId === "slot:09") {
    return "attacker";
  }

  return slot.roleKey;
}

/**
 * Pulls both striker slots into midfield roles for the defensive demo.
 */
function pro01DefensiveRoleKey(slot: FakeLineupSlotForCli): string {
  if (slot.slotId === "slot:10" || slot.slotId === "slot:11") {
    return "midfielder";
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
 * Formats one final condition row for a selected club player.
 */
function formatConditionPlayerRow(playerId: PlayerId, league: FakeLeagueSystem, result: CliSeasonResult): string {
  const playerName = playerLabel(playerId, league.players).padEnd(19, " ");
  const startFitness = Number(league.playerStates[playerId]?.fitness ?? 0);
  const finalFitness = Number(result.finalPlayerStates?.[playerId]?.fitness ?? 0);
  const delta = finalFitness - startFitness;

  return [
    " ",
    playerName,
    String(startFitness).padStart(5, " "),
    String(finalFitness).padStart(5, " "),
    formatSignedNumber(delta).padStart(5, " "),
  ].join(" ");
}

/**
 * Formats selected-club table impact for the condition demo.
 */
function formatConditionTableImpact(row: LeagueTableRow | undefined, league: FakeLeagueSystem): string {
  if (row === undefined) {
    return "unavailable";
  }

  return `${clubLabel(row.clubId, league.clubsById)} position ${row.position}, ${row.points} pts, GD ${formatSignedNumber(row.goalDifference)}`;
}

/**
 * Formats a number with an explicit sign for compact inspection output.
 */
function formatSignedNumber(value: number): string {
  return value >= 0 ? `+${value}` : String(value);
}

/**
 * Finds all played fixtures involving one club in season order.
 */
function clubFixtures(fixtures: readonly Fixture[], clubId: ClubId): readonly Fixture[] {
  const matching: Fixture[] = [];

  for (const fixture of fixtures) {
    if (fixture.homeClubId === clubId || fixture.awayClubId === clubId) {
      matching.push(fixture);
    }
  }

  return matching;
}

/**
 * Finds one final table row by club ID.
 */
function findTableRow(table: readonly LeagueTableRow[], clubId: ClubId): LeagueTableRow | undefined {
  for (const row of table) {
    if (row.clubId === clubId) {
      return row;
    }
  }

  return undefined;
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
      readonly manualTacticSwitch: ParsedManualTacticSwitchValue | undefined;
      readonly conditionDemo: ConditionDemoProfileKey | undefined;
      readonly lineupDemo: LineupDemoProfileKey | undefined;
      readonly formationFit: FormationKey | undefined;
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

/** Parsed condition-demo argument result. */
type ParsedConditionDemo =
  | {
      readonly ok: true;
      readonly conditionDemo: ConditionDemoProfileKey;
    }
  | {
      readonly ok: false;
      readonly message: string;
    };

/** Parsed lineup-demo argument result. */
type ParsedLineupDemo =
  | {
      readonly ok: true;
      readonly lineupDemo: LineupDemoProfileKey;
    }
  | {
      readonly ok: false;
      readonly message: string;
    };

/** Parsed formation-fit argument result. */
type ParsedFormationFit =
  | {
      readonly ok: true;
      readonly formationFit: FormationKey;
    }
  | {
      readonly ok: false;
      readonly message: string;
    };

/** Parsed manual tactic-switch argument result. */
type ParsedManualTacticSwitch =
  | {
      readonly ok: true;
      readonly manualTacticSwitch: ParsedManualTacticSwitchValue;
    }
  | {
      readonly ok: false;
      readonly message: string;
    };

/** Parsed value for a manual tactic-switch declaration. */
interface ParsedManualTacticSwitchValue {
  /** First minute where the target profile should apply. */
  readonly minute: number;
  /** Target saved demo profile key. */
  readonly profileKey: SetupDemoProfileKey;
}

/** Supported deterministic setup-demo profile keys. */
type SetupDemoProfileKey = (typeof SUPPORTED_DEMO_SETUP_PROFILES)[number];

/** Supported deterministic condition-demo profile keys. */
type ConditionDemoProfileKey = (typeof SUPPORTED_CONDITION_DEMO_PROFILES)[number];

/** Supported deterministic lineup-demo profile keys. */
type LineupDemoProfileKey = (typeof SUPPORTED_LINEUP_DEMO_PROFILES)[number];

/**
 * Definition used to build one deterministic CLI setup-demo profile.
 */
interface CliSetupDemoDefinition {
  /** Stable profile key requested by the user. */
  readonly profileKey: SetupDemoProfileKey;
  /** Tactic setup applied by this profile. */
  readonly tactic: SimulateSeasonSetupOverride["tactic"];
  /** Resolves the selected role key for a generated fake lineup slot. */
  readonly selectedRoleKey: (slot: FakeLineupSlotForCli) => string;
}

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
 * CLI-owned manual tactic switch from one setup demo profile to another.
 */
interface CliManualTacticSwitch {
  /** First minute where the target profile should apply. */
  readonly minute: number;
  /** Target setup demo selected by the caller. */
  readonly targetSetupDemo: CliSetupDemo;
}

/**
 * Fixture detail built for manual tactic-switch inspection.
 */
interface CliManualTacticFixture {
  /** Fixture to render, either unchanged or manually re-simulated. */
  readonly fixture: Fixture;
  /** Whether the selected setup club actually played this fixture. */
  readonly appliesToFixture: boolean;
}

/**
 * CLI-owned condition demo for one selected club's season fitness lifecycle.
 */
interface CliConditionDemo {
  /** Stable profile key requested by the user. */
  readonly profileKey: ConditionDemoProfileKey;
  /** Club whose player condition should be inspected. */
  readonly clubId: ClubId;
  /** Generated fixed lineup inspected by the condition demo. */
  readonly lineup: readonly LineupSlot[];
}

/**
 * CLI-owned selected-lineup demo profile for manual inspection.
 */
interface CliLineupDemo {
  /** Stable profile key requested by the user. */
  readonly profileKey: LineupDemoProfileKey;
  /** Club whose lineup is being inspected. */
  readonly clubId: ClubId;
  /** Ordered selected starters for this profile. */
  readonly lineup: readonly LineupSlot[];
  /** Differences from the generated first-team lineup. */
  readonly playerChanges: readonly CliLineupDemoPlayerChange[];
}

/**
 * CLI-owned inspection state for applying one lineup profile to one fixture.
 */
interface CliLineupFixtureInspection {
  /** Selected lineup profile key requested by the user. */
  readonly profileKey: LineupDemoProfileKey;
  /** Selected club controlled by the lineup profile. */
  readonly clubId: ClubId;
  /** Fixture ID string requested by the user. */
  readonly fixtureValue: string;
  /** Ordered starters selected by this profile. */
  readonly lineup: readonly LineupSlot[];
  /** Player changes relative to the first-team lineup. */
  readonly playerChanges: readonly CliLineupDemoPlayerChange[];
  /** Whether the selected club participates in the requested fixture. */
  readonly appliesToFixture: boolean;
  /** Engine override passed only when the selected club plays the fixture. */
  readonly fixtureLineupOverride?: SimulateSeasonFixtureLineupOverride;
}

/**
 * One explicit player replacement rendered by the lineup-demo output.
 */
interface CliLineupDemoPlayerChange {
  /** Slot changed by the profile. */
  readonly slotId: string;
  /** First-team player originally occupying this slot. */
  readonly fromPlayerId: PlayerId;
  /** Selected replacement player occupying this slot. */
  readonly toPlayerId: PlayerId;
  /** Role key preserved for the selected slot. */
  readonly roleKey: string;
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
  readonly players: FakeLeagueSystem["players"];
  readonly roleWeights: Readonly<Record<string, RoleWeightProfile>>;
  readonly stateMultiplierCurves: PlayerStateMultiplierCurves;
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
  readonly finalPlayerStates: ReturnType<typeof simulateSeason>["finalPlayerStates"];
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

/** Fake lineup slot type derived from generated content. */
type FakeLineupSlotForCli = FakeLeagueSystem["lineupsByClubId"][ClubId][number];
