import {
  createFakeLeagueSystem,
  type FakeLeagueSystem,
} from "@game/content";
import {
  createMatchReport,
  buildTacticTeamContext,
  DEFAULT_FITNESS_RULES,
  deriveTeamStrength,
  simulateSeason,
  simulateMatchWithManualTactics,
  TacticTeamContextError,
  type BuildTacticTeamContextInput,
  type MatchExplanationTrace,
  type MatchTeamContext,
  type SimulateSeasonFixtureLineupOverride,
  type SimulateSeasonSetupOverride,
} from "@game/engine";
import {
  createTranslator,
  type Translator,
} from "@game/i18n";
import { formatFormationFitOutput } from "./simulate-season/formation-fit-output.ts";
import {
  buildConditionDemo,
  buildLineupDemo,
  buildLineupFixtureInspection,
  buildSetupDemo,
  selectedSetupSideForFixture,
  type CliConditionDemo,
  type CliLineupDemo,
  type CliLineupDemoPlayerChange,
  type CliLineupFixtureInspection,
  type CliManualTacticSwitch,
  type CliSetupDemo,
  type MatchEventSide,
} from "./simulate-season/demo-builders.ts";
import {
  formatConditionDemoOutput,
  formatLineupDemoOutput,
  formatLineupFixtureInspectionLines,
  formatManualTacticSwitchLines,
  formatSetupDemoLines,
} from "./simulate-season/demo-output.ts";
import { formatFixtureDetailOutput } from "./simulate-season/fixture-detail-output.ts";
import {
  createFakeSeasonInput,
  createFakeTeamsByClubId,
  type FakeCliTeamContext,
} from "./fake-season-input.ts";
import {
  formatIdentityReviewOutput,
  formatPlayerGenerationReportOutput,
} from "./simulate-season/generated-inspection-output.ts";
import {
  findRound,
  formatRoundOutput,
  formatSeasonOutput,
} from "./simulate-season/season-summary-output.ts";
import { formatMarketDemoOutput } from "./simulate-season/market-demo-output.ts";
import {
  formatSupportedConditionDemoProfiles,
  formatSupportedLineupDemoProfiles,
  formatSupportedMarketDemoProfiles,
  formatSupportedSetupDemoProfiles,
  parseArgs,
} from "./simulate-season/parse-args.ts";
import {
  MARKET_DEMO_PROFILE_PRO01_AFFORDABLE_PERMANENT,
  MARKET_DEMO_PROFILE_PRO01_STAR_REJECTED,
} from "./simulate-season/profile-keys.ts";

export {
  CONDITION_DEMO_PROFILE_PRO01_SEASON,
  DEFAULT_SIMULATE_SEASON_SEED,
  DEMO_SETUP_PROFILE_PRO01_ATTACKING,
  DEMO_SETUP_PROFILE_PRO01_BALANCED,
  DEMO_SETUP_PROFILE_PRO01_DEFENSIVE,
  LINEUP_DEMO_PROFILE_PRO01_FIRST_TEAM,
  LINEUP_DEMO_PROFILE_PRO01_ROTATED,
  MARKET_DEMO_PROFILE_PRO01_AFFORDABLE_PERMANENT,
  MARKET_DEMO_PROFILE_PRO01_STAR_REJECTED,
} from "./simulate-season/profile-keys.ts";

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
  const text = createTranslator(parsed.language);

  if (!parsed.ok) {
    io.stderr(parsed.message);
    io.stderr(
      text("season.usage", {
        setupProfiles: formatSupportedSetupDemoProfiles(),
        conditionProfiles: formatSupportedConditionDemoProfiles(),
        lineupProfiles: formatSupportedLineupDemoProfiles(),
        marketProfiles: formatSupportedMarketDemoProfiles(),
      }),
    );
    return 1;
  }

  const league = createFakeLeagueSystem({ worldSeed: parsed.seed });
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
    io.stderr(text("manualSwitch.error.requiresFixture"));
    return 1;
  }

  if (parsed.fixtureExplanation && parsed.fixtureId === undefined) {
    io.stderr(text("fixture.explanation.error.requiresFixture"));
    return 1;
  }

  if (manualTacticSwitch !== undefined && setupDemo === undefined) {
    io.stderr(text("manualSwitch.error.requiresSetupDemo"));
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
    io.stderr(text("formation.error.cannotCombine"));
    return 1;
  }

  if (
    parsed.identityReview &&
    (parsed.fixtureId !== undefined ||
      parsed.roundNumber !== undefined ||
      setupDemo !== undefined ||
      manualTacticSwitch !== undefined ||
      conditionDemo !== undefined ||
      lineupDemo !== undefined ||
      parsed.marketDemo !== undefined ||
      parsed.formationFit !== undefined)
  ) {
    io.stderr(text("identity.error.cannotCombine"));
    return 1;
  }

  if (
    parsed.playerGenerationReport &&
    (parsed.fixtureId !== undefined ||
      parsed.roundNumber !== undefined ||
      setupDemo !== undefined ||
      manualTacticSwitch !== undefined ||
      conditionDemo !== undefined ||
      lineupDemo !== undefined ||
      parsed.marketDemo !== undefined ||
      parsed.formationFit !== undefined ||
      parsed.identityReview)
  ) {
    io.stderr(text("playerGeneration.error.cannotCombine"));
    return 1;
  }

  if (
    parsed.marketDemo !== undefined &&
    (parsed.fixtureId !== undefined ||
      parsed.roundNumber !== undefined ||
      setupDemo !== undefined ||
      manualTacticSwitch !== undefined ||
      conditionDemo !== undefined ||
      lineupDemo !== undefined ||
      parsed.formationFit !== undefined)
  ) {
    io.stderr(text("market.error.cannotCombine"));
    return 1;
  }

  if (parsed.marketDemo !== undefined) {
    for (const line of formatMarketDemoOutput(league, parsed.seed, parsed.marketDemo, text)) {
      io.stdout(line);
    }

    return 0;
  }

  if (parsed.identityReview) {
    for (const line of formatIdentityReviewOutput(league, parsed.seed, text)) {
      io.stdout(line);
    }

    return 0;
  }

  if (parsed.playerGenerationReport) {
    for (const line of formatPlayerGenerationReportOutput(league, parsed.seed, text)) {
      io.stdout(line);
    }

    return 0;
  }

  if (parsed.formationFit !== undefined) {
    for (const line of formatFormationFitOutput(league, parsed.seed, parsed.formationFit, text)) {
      io.stdout(line);
    }

    return 0;
  }

  if (manualTacticSwitch !== undefined && manualTacticSwitch.minute > league.matchEngineConfig.minuteCount) {
    io.stderr(
      text("manualSwitch.error.minuteRange", {
        max: league.matchEngineConfig.minuteCount,
        value: manualTacticSwitch.minute,
      }),
    );
    return 1;
  }

  if (conditionDemo !== undefined && (parsed.fixtureId !== undefined || parsed.roundNumber !== undefined)) {
    io.stderr(text("condition.error.cannotCombine"));
    return 1;
  }

  if (
    lineupDemo !== undefined &&
    (parsed.roundNumber !== undefined || conditionDemo !== undefined || manualTacticSwitch !== undefined)
  ) {
    io.stderr(text("lineup.error.cannotCombine"));
    return 1;
  }

  const baseResult = simulateSeasonForCli(league, parsed.seed, setupDemo, conditionDemo);

  if (parsed.roundNumber !== undefined && findRound(baseResult.rounds, parsed.roundNumber) === undefined) {
    io.stderr(text("fixture.roundNotFound", { round: parsed.roundNumber }));
    return 1;
  }

  if (parsed.fixtureId !== undefined && findFixtureByValue(baseResult.fixtures, parsed.fixtureId) === undefined) {
    io.stderr(text("fixture.notFound", { fixture: parsed.fixtureId }));
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
      text,
      setupDemo,
      manualTacticSwitch,
      lineupFixtureInspection,
      parsed.fixtureExplanation,
    )) {
      io.stdout(line);
    }

    return 0;
  }

  for (const line of formatSeasonOutput(league, result, parsed.seed, text, setupDemo)) {
    io.stdout(line);
  }

  if (conditionDemo !== undefined) {
    for (const line of formatConditionDemoOutput(league, result, conditionDemo, text)) {
      io.stdout(line);
    }
  }

  if (lineupDemo !== undefined) {
    for (const line of formatLineupDemoOutput(league, lineupDemo, text)) {
      io.stdout(line);
    }
  }

  if (parsed.roundNumber !== undefined) {
    for (const line of formatRoundOutput(league, result, parsed.roundNumber, text)) {
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
 * Simulates the fake league season using currently exported engine primitives.
 */
function simulateSeasonForCli(
  league: FakeLeagueSystem,
  seed: string,
  setupDemo: CliSetupDemo | undefined,
  conditionDemo: CliConditionDemo | undefined,
  fixtureLineupOverride?: SimulateSeasonFixtureLineupOverride,
): CliSeasonResult {
  const seasonInput = createFakeSeasonInput(league, seed);
  const result = simulateSeason({
    ...seasonInput,
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
 * Formats a fixture-focused command output without the full season table.
 */
function formatFixtureOnlyOutput(
  league: FakeLeagueSystem,
  result: CliSeasonResult,
  seed: string,
  fixtureValue: string,
  text: Translator,
  setupDemo: CliSetupDemo | undefined,
  manualTacticSwitch: CliManualTacticSwitch | undefined,
  lineupFixtureInspection: CliLineupFixtureInspection | undefined,
  includeFixtureExplanation: boolean,
): readonly string[] {
  const lines = [
    text("fixture.title"),
    `${text("season.seed")}: ${seed}`,
    `${text("fixture.fixture")}: ${fixtureValue}`,
    `${text("season.competition")}: ${league.competition.name}`,
  ];

  if (setupDemo !== undefined) {
    lines.push(...formatSetupDemoLines(league, setupDemo, text));
  }

  if (lineupFixtureInspection !== undefined) {
    lines.push(...formatLineupFixtureInspectionLines(league, result, lineupFixtureInspection, text));
  }

  const manualFixture = manualTacticSwitch === undefined || setupDemo === undefined
    ? undefined
    : buildManualTacticFixture(league, result, seed, fixtureValue, setupDemo, manualTacticSwitch, includeFixtureExplanation);

  if (manualFixture !== undefined && setupDemo !== undefined && manualTacticSwitch !== undefined) {
    lines.push(...formatManualTacticSwitchLines(league, setupDemo, manualTacticSwitch, manualFixture, text));
  }

  lines.push("");
  const explanationTrace = includeFixtureExplanation
    ? manualFixture?.explanationTrace ?? buildFixtureExplanationTrace(league, result, seed, fixtureValue, setupDemo, lineupFixtureInspection)
    : undefined;
  lines.push(
    ...formatFixtureDetailOutput({
      league,
      fixture: manualFixture?.fixture ?? findFixtureByValue(result.fixtures, fixtureValue),
      fixtureValue,
      text,
      lineupFixtureInspection,
      explanationTrace,
    }),
  );

  return lines;
}

/**
 * Rebuilds the requested fixture context and asks the engine for trace data.
 */
function buildFixtureExplanationTrace(
  league: FakeLeagueSystem,
  result: CliSeasonResult,
  seed: string,
  fixtureValue: string,
  setupDemo: CliSetupDemo | undefined,
  lineupFixtureInspection: CliLineupFixtureInspection | undefined,
): MatchExplanationTrace | undefined {
  const fixture = findFixtureByValue(result.fixtures, fixtureValue);

  if (fixture === undefined) {
    return undefined;
  }

  const teamsByClubId = createFakeTeamsByClubId(league);
  const simulated = simulateMatchWithManualTactics(
    {
      fixtureId: fixture.id,
      seed,
      home: matchTeamContextForFixtureExplanation(
        league,
        teamsByClubId,
        fixture.id,
        fixture.homeClubId,
        setupDemo,
        lineupFixtureInspection,
      ),
      away: matchTeamContextForFixtureExplanation(
        league,
        teamsByClubId,
        fixture.id,
        fixture.awayClubId,
        setupDemo,
        lineupFixtureInspection,
      ),
      engineConfig: league.matchEngineConfig,
    },
    { includeExplanationTrace: true },
  );

  return simulated.explanationTrace;
}

/**
 * Builds the team context used by the fixture explanation trace.
 */
function matchTeamContextForFixtureExplanation(
  league: FakeLeagueSystem,
  teamsByClubId: Readonly<Record<ClubId, CliTeamContext>>,
  fixtureId: FixtureId,
  clubId: ClubId,
  setupDemo: CliSetupDemo | undefined,
  lineupFixtureInspection: CliLineupFixtureInspection | undefined,
): MatchTeamContext {
  const baseTeam = matchTeamContextForCli(teamsByClubId, clubId);
  const setupTeam = setupDemo?.clubId === clubId ? buildSetupOverrideContextForCli(setupDemo.override) : undefined;
  const lineupOverride =
    lineupFixtureInspection?.appliesToFixture === true &&
    lineupFixtureInspection.clubId === clubId &&
    lineupFixtureInspection.fixtureLineupOverride?.fixtureId === fixtureId
      ? lineupFixtureInspection.fixtureLineupOverride
      : undefined;

  if (lineupOverride === undefined) {
    return setupTeam ?? baseTeam;
  }

  return {
    clubId,
    lineup: lineupOverride.lineup,
    strength: deriveTeamStrength({
      lineup: lineupOverride.lineup,
      players: lineupOverride.players,
      roleWeights: lineupOverride.roleWeights,
      ...(lineupOverride.playerStates === undefined ? {} : { playerStates: lineupOverride.playerStates }),
      ...(lineupOverride.stateMultiplierCurves === undefined ? {} : { stateMultiplierCurves: lineupOverride.stateMultiplierCurves }),
    }),
    tacticalDistribution: setupTeam?.tacticalDistribution ?? baseTeam.tacticalDistribution,
  };
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
  includeFixtureExplanation: boolean,
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

  const teamsByClubId = createFakeTeamsByClubId(league);
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
      ...(includeFixtureExplanation ? { includeExplanationTrace: true } : {}),
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
    ...(simulated.explanationTrace === undefined ? {} : { explanationTrace: simulated.explanationTrace }),
  };
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
 * Fixture detail built for manual tactic-switch inspection.
 */
interface CliManualTacticFixture {
  /** Fixture to render, either unchanged or manually re-simulated. */
  readonly fixture: Fixture;
  /** Whether the selected setup club actually played this fixture. */
  readonly appliesToFixture: boolean;
  /** Optional explanation trace for a manually re-simulated fixture. */
  readonly explanationTrace?: MatchExplanationTrace;
}

/**
 * Aggregate team context used by the CLI command.
 */
type CliTeamContext = FakeCliTeamContext;

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
