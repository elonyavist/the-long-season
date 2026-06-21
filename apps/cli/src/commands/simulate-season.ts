import {
  createFakeLeagueSystem,
  type FakeLeagueSystem,
} from "@game/content";
import {
  computePlayerMatchStats,
  createMatchReport,
  buildTacticTeamContext,
  DEFAULT_FITNESS_RULES,
  deriveTeamStrength,
  simulateSeason,
  simulateMatchWithManualTactics,
  TacticTeamContextError,
  type BuildTacticTeamContextInput,
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
import {
  createTranslator,
  type MessageKey,
  type Translator,
} from "@game/i18n";
import { formatFormationFitOutput } from "./simulate-season/formation-fit-output.ts";
import { formatMarketDemoOutput } from "./simulate-season/market-demo-output.ts";
import {
  formatSupportedConditionDemoProfiles,
  formatSupportedLineupDemoProfiles,
  formatSupportedMarketDemoProfiles,
  formatSupportedSetupDemoProfiles,
  parseArgs,
} from "./simulate-season/parse-args.ts";
import {
  CONDITION_DEMO_PROFILE_PRO01_SEASON,
  DEMO_SETUP_PROFILE_PRO01_ATTACKING,
  DEMO_SETUP_PROFILE_PRO01_BALANCED,
  DEMO_SETUP_PROFILE_PRO01_DEFENSIVE,
  LINEUP_DEMO_PROFILE_PRO01_FIRST_TEAM,
  LINEUP_DEMO_PROFILE_PRO01_ROTATED,
  MARKET_DEMO_PROFILE_PRO01_AFFORDABLE_PERMANENT,
  MARKET_DEMO_PROFILE_PRO01_STAR_REJECTED,
  type ConditionDemoProfileKey,
  type LineupDemoProfileKey,
  type SetupDemoProfileKey,
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
    io.stderr(text("manualSwitch.error.requiresFixture"));
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
 * Formats a read-only review of generated player identity metadata.
 */
function formatIdentityReviewOutput(league: FakeLeagueSystem, seed: string, text: Translator): readonly string[] {
  const clubId = firstGeneratedClubId(league, "identity review");
  const club = league.clubsById[clubId];

  if (club === undefined) {
    throw new Error(`Cannot build identity review without club: ${clubId}`);
  }

  const lines = [
    text("identity.title"),
    `${text("season.seed")}: ${seed}`,
    `${text("season.competition")}: ${league.competition.name}`,
    `${text("setup.selectedClub")}: ${clubLabel(clubId, league.clubsById)}`,
    `${text("formation.squadSize")}: ${club.playerIds.length}`,
    `${text("identity.scope")}: ${text("identity.scopeValue")}`,
    "",
    `${text("identity.players")}:`,
    text("identity.playerHeader"),
  ];

  for (const playerId of club.playerIds) {
    lines.push(formatIdentityPlayerRow(playerId, league, text));
  }

  lines.push("");
  lines.push(`${text("identity.nationalitySummary")}:`);

  for (const summaryLine of formatIdentityNationalitySummary(club.playerIds, league, text)) {
    lines.push(summaryLine);
  }

  return lines;
}

/**
 * Formats one player row for the generated identity review.
 */
function formatIdentityPlayerRow(playerId: PlayerId, league: FakeLeagueSystem, text: Translator): string {
  const identity = league.playerIdentities[playerId];

  if (identity === undefined) {
    return `  ${playerLabel(playerId, league.players).padEnd(19, " ")} ${text("common.unavailable")}`;
  }

  const player = playerLabel(playerId, league.players).padEnd(19, " ");
  const nationality = formatIdentityNationality(identity.nationality, text).padEnd(14, " ");
  const secondNationality = (identity.secondNationality === undefined
    ? text("common.none")
    : formatIdentityNationality(identity.secondNationality, text)
  ).padEnd(14, " ");
  const birthCountry = formatIdentityNationality(identity.birthCountry, text).padEnd(14, " ");
  const nameCulture = formatIdentityNameCulture(identity.nameCulture, text);

  return `  ${player} ${nationality} ${secondNationality} ${birthCountry} ${nameCulture}`;
}

/**
 * Formats the deterministic nationality mix for the reviewed club.
 */
function formatIdentityNationalitySummary(
  playerIds: readonly PlayerId[],
  league: FakeLeagueSystem,
  text: Translator,
): readonly string[] {
  const counts: Record<string, number> = {};

  for (const playerId of playerIds) {
    const identity = league.playerIdentities[playerId];

    if (identity === undefined) {
      continue;
    }

    counts[identity.nationality] = (counts[identity.nationality] ?? 0) + 1;
  }

  return Object.keys(counts)
    .sort()
    .map((nationality) => `  ${formatIdentityNationality(nationality, text)}: ${counts[nationality] ?? 0}`);
}

/**
 * Localizes a supported nationality code for CLI presentation.
 */
function formatIdentityNationality(nationality: string, text: Translator): string {
  return text(presentationMessageKey("identity.nationality", nationality));
}

/**
 * Localizes a supported name-culture code for CLI presentation.
 */
function formatIdentityNameCulture(nameCulture: string, text: Translator): string {
  return text(presentationMessageKey("identity.nameCulture", nameCulture));
}

/**
 * Formats fixture result details for one requested round.
 */
function formatRoundOutput(
  league: FakeLeagueSystem,
  result: CliSeasonResult,
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
    : buildManualTacticFixture(league, result, seed, fixtureValue, setupDemo, manualTacticSwitch);

  if (manualFixture !== undefined && setupDemo !== undefined && manualTacticSwitch !== undefined) {
    lines.push(...formatManualTacticSwitchLines(league, setupDemo, manualTacticSwitch, manualFixture, text));
  }

  lines.push("");
  lines.push(...formatFixtureDetailOutput(league, result, fixtureValue, text, manualFixture?.fixture, lineupFixtureInspection));

  return lines;
}

/**
 * Formats rich structured detail for one requested fixture.
 */
function formatFixtureDetailOutput(
  league: FakeLeagueSystem,
  result: CliSeasonResult,
  fixtureValue: string,
  text: Translator,
  overrideFixture: Fixture | undefined = undefined,
  lineupFixtureInspection: CliLineupFixtureInspection | undefined = undefined,
): readonly string[] {
  const fixture = overrideFixture ?? findFixtureByValue(result.fixtures, fixtureValue);

  if (fixture === undefined) {
    return ["", `${text("fixture.fixture")} ${fixtureValue}: ${text("common.unavailable")}`];
  }

  const report = fixture.result?.report;
  const lines = [formatFixtureResult(fixture, league)];

  if (report === undefined) {
    lines.push(text("fixture.eventsUnavailable"));
    lines.push(text("fixture.playerStatsUnavailable"));
    return lines;
  }

  lines.push(`${text("fixture.events")}:`);

  const eventLines = formatFixtureEvents(fixture, league, text);
  if (eventLines.length === 0) {
    lines.push(`  ${text("common.none")}`);
  } else {
    lines.push(...eventLines);
  }

  lines.push(`${text("fixture.playerStatsAllStarters")}:`);

  const statLines = formatFixturePlayerStats(fixture, league, lineupFixtureInspection);
  if (statLines.length === 0) {
    lines.push(`  ${text("common.none")}`);
  } else {
    lines.push(text("fixture.playerStatsHeader"));
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
  text: Translator,
): readonly string[] {
  const lines = [
    `${text("manualSwitch.title")}:`,
    `  ${text("setup.selectedClub")}: ${clubLabel(setupDemo.clubId, league.clubsById)}`,
    `  ${text("manualSwitch.initialProfile")}: ${setupDemo.profileKey}`,
    `  ${text("manualSwitch.switch")}: ${manualTacticSwitch.minute}' -> ${manualTacticSwitch.targetSetupDemo.profileKey}`,
    `  ${text("manualSwitch.appliesToFixture")}: ${manualFixture.appliesToFixture ? text("common.yes") : text("common.no")}`,
  ];

  if (!manualFixture.appliesToFixture) {
    lines.push(
      `  ${text("manualSwitch.reason")}: ${text("common.notPlayingReason", { club: clubLabel(setupDemo.clubId, league.clubsById) })}`,
      `${text("manualSwitch.profileTimeline")}:`,
      `  ${text("manualSwitch.unchanged")}: ${formatFixtureResult(manualFixture.fixture, league)}`,
    );
    return lines;
  }

  lines.push(`${text("manualSwitch.profileTimeline")}:`);

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
function formatFixtureEvents(fixture: Fixture, league: FakeLeagueSystem, text: Translator): readonly string[] {
  const report = fixture.result?.report;
  const events: string[] = [];

  if (report === undefined) {
    return events;
  }

  for (const event of report.events) {
    switch (event.type) {
      case "goal": {
        const clubId = sideClubId(fixture, event.shot.side);
        const assist = event.assistPlayerId === undefined ? "" : ` ${text("event.assist")}=${playerLabel(event.assistPlayerId, league.players)}`;
        const creator = event.creatorPlayerId === undefined ? "" : ` ${text("event.creator")}=${playerLabel(event.creatorPlayerId, league.players)}`;
        events.push(
          `  ${event.shot.minute}' ${text("event.goal")} ${clubLabel(clubId, league.clubsById)} ${playerLabel(event.scorerPlayerId, league.players)}${assist}${creator} ${text("event.shot")}=${formatShotType(event.shot.shotType, text)} ${text("event.chance")}=${formatChanceType(event.shot.chanceType, text)}`,
        );
        break;
      }

      case "save": {
        const defendingClubId = sideClubId(fixture, oppositeSide(event.shot.side));
        const attackingClubId = sideClubId(fixture, event.shot.side);
        events.push(
          `  ${event.shot.minute}' ${text("event.save")} ${clubLabel(defendingClubId, league.clubsById)} ${playerLabel(event.goalkeeperPlayerId, league.players)} ${text("event.vs")} ${clubLabel(attackingClubId, league.clubsById)} ${text("event.shot")}=${formatShotType(event.shot.shotType, text)} ${text("event.chance")}=${formatChanceType(event.shot.chanceType, text)}`,
        );
        break;
      }

      case "miss": {
        const clubId = sideClubId(fixture, event.shot.side);
        events.push(
          `  ${event.shot.minute}' ${text("event.miss")} ${clubLabel(clubId, league.clubsById)} ${text("event.shot")}=${formatShotType(event.shot.shotType, text)} ${text("event.chance")}=${formatChanceType(event.shot.chanceType, text)}`,
        );
        break;
      }

      case "block": {
        const clubId = sideClubId(fixture, event.shot.side);
        const defender = event.primaryDefenderPlayerId === undefined
          ? ""
          : ` ${text("event.defender")}=${playerLabel(event.primaryDefenderPlayerId, league.players)}`;
        events.push(
          `  ${event.shot.minute}' ${text("event.block")} ${clubLabel(clubId, league.clubsById)}${defender} ${text("event.shot")}=${formatShotType(event.shot.shotType, text)} ${text("event.chance")}=${formatChanceType(event.shot.chanceType, text)}`,
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
 * Builds a typed localization key for curated formation vocabulary.
 */
function presentationMessageKey(prefix: string, value: string): MessageKey {
  return `${prefix}.${value}` as MessageKey;
}

/**
 * Formats deterministic fitness lifecycle inspection for one condition demo.
 */
function formatConditionDemoOutput(
  league: FakeLeagueSystem,
  result: CliSeasonResult,
  conditionDemo: CliConditionDemo,
  text: Translator,
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
    `${text("condition.demo")}: ${conditionDemo.profileKey}`,
    `  ${text("setup.selectedClub")}: ${clubLabel(conditionDemo.clubId, league.clubsById)}`,
    `  ${text("condition.lifecycle")}: ${text("common.enabled")}`,
    `  ${text("condition.rules")}: ${text("condition.matchCost")}=${DEFAULT_FITNESS_RULES.matchFitnessCost} ${text("condition.dailyRecovery")}=${DEFAULT_FITNESS_RULES.dailyRecovery} ${text("condition.clamp")}=${DEFAULT_FITNESS_RULES.minFitness}..${DEFAULT_FITNESS_RULES.maxFitness}`,
    `  ${text("condition.firstFixture")}: ${firstFixtureLabel}`,
    `  ${text("condition.afterFirstMatch")}: ${firstMatchFitness}`,
    `  ${text("condition.beforeNextFixture", { days: recoveryDays ?? text("common.unknown") })}: ${recoveredFitness ?? text("common.unavailable")}`,
    `  ${text("condition.finalTable")}: ${formatConditionTableImpact(tableRow, league, text)}`,
    `  ${text("condition.finalCondition")}:`,
    text("condition.playerHeader"),
  ];

  for (const slot of conditionDemo.lineup) {
    lines.push(formatConditionPlayerRow(slot.playerId, league, result));
  }

  return lines;
}

/**
 * Formats a selected-lineup profile without applying it to fixtures or seasons.
 */
function formatLineupDemoOutput(league: FakeLeagueSystem, lineupDemo: CliLineupDemo, text: Translator): readonly string[] {
  const lines = [
    "",
    `${text("lineup.demo")}: ${lineupDemo.profileKey}`,
    `  ${text("setup.selectedClub")}: ${clubLabel(lineupDemo.clubId, league.clubsById)}`,
    `  ${text("lineup.appliedToFixtures")}: ${text("lineup.profileInspectionOnly")}`,
    `  ${text("lineup.changesFromFirstTeam")}:`,
  ];

  if (lineupDemo.playerChanges.length === 0) {
    lines.push(`  ${text("common.none")}`);
  } else {
    for (const change of lineupDemo.playerChanges) {
      lines.push(formatLineupDemoChange(change, league, text));
    }
  }

  lines.push(`  ${text("lineup.selectedStarters")}:`);

  for (const slot of lineupDemo.lineup) {
    lines.push(formatLineupDemoStarter(slot, league, text));
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
  text: Translator,
): readonly string[] {
  const fixture = findFixtureByValue(result.fixtures, inspection.fixtureValue);
  const fixtureLabel = fixture === undefined ? inspection.fixtureValue : formatFixtureResult(fixture, league);
  const lines = [
    `${text("lineup.override")}: ${inspection.profileKey}`,
    `  ${text("setup.selectedClub")}: ${clubLabel(inspection.clubId, league.clubsById)}`,
    `  ${text("fixture.fixture")}: ${fixtureLabel}`,
    `  ${text("manualSwitch.appliesToFixture")}: ${inspection.appliesToFixture ? text("common.yes") : text("common.no")}`,
  ];

  if (!inspection.appliesToFixture) {
    lines.push(`  ${text("manualSwitch.reason")}: ${text("common.notPlayingReason", { club: clubLabel(inspection.clubId, league.clubsById) })}`);
  }

  lines.push(`  ${text("lineup.selectedStarters")}:`);

  for (const slot of inspection.lineup) {
    lines.push(formatLineupDemoStarter(slot, league, text));
  }

  lines.push(`  ${text("lineup.restedFromFirstTeam")}:`);

  if (inspection.playerChanges.length === 0) {
    lines.push(`  ${text("common.none")}`);
  } else {
    for (const change of inspection.playerChanges) {
      lines.push(`  ${text("lineup.replacedBy", {
        from: playerLabel(change.fromPlayerId, league.players),
        to: playerLabel(change.toPlayerId, league.players),
      })}`);
    }
  }

  lines.push(...formatLineupConditionImpactLines(league, inspection, text));

  return lines;
}

/**
 * Formats the per-fixture fitness consequence of the selected lineup.
 */
function formatLineupConditionImpactLines(
  league: FakeLeagueSystem,
  inspection: CliLineupFixtureInspection,
  text: Translator,
): readonly string[] {
  const lines = [`  ${text("lineup.conditionImpact")}:`];

  if (!inspection.appliesToFixture) {
    lines.push(`  ${text("lineup.selectedStartersSpendZero")}`);
    return lines;
  }

  lines.push(`  ${text("lineup.selectedStartersSpend", { fitness: DEFAULT_FITNESS_RULES.matchFitnessCost })}`);

  if (inspection.playerChanges.length === 0) {
    lines.push(`  ${text("lineup.restedFirstTeamPlayers")}: ${text("common.none")}`);
    return lines;
  }

  lines.push(`  ${text("lineup.selectedReplacementsAfterFixture")}:`);
  for (const change of inspection.playerChanges) {
    lines.push(
      `  ${text("lineup.expectedFitness", {
        player: playerLabel(change.toPlayerId, league.players),
        fitness: DEFAULT_FITNESS_RULES.maxFitness - DEFAULT_FITNESS_RULES.matchFitnessCost,
      })}`,
    );
  }

  lines.push(`  ${text("lineup.restedFirstTeamAfterFixture")}:`);
  for (const change of inspection.playerChanges) {
    lines.push(`  ${text("lineup.expectedFitness", {
      player: playerLabel(change.fromPlayerId, league.players),
      fitness: DEFAULT_FITNESS_RULES.maxFitness,
    })}`);
  }

  return lines;
}

/**
 * Formats one player change relative to PRO01's first-team lineup.
 */
function formatLineupDemoChange(change: CliLineupDemoPlayerChange, league: FakeLeagueSystem, text: Translator): string {
  return `  ${change.slotId}: ${playerLabel(change.fromPlayerId, league.players)} -> ${playerLabel(
    change.toPlayerId,
    league.players,
  )} (${formatLineupRole(change.roleKey, text)})`;
}

/**
 * Formats one selected starter row for the lineup-demo inspection block.
 */
function formatLineupDemoStarter(slot: LineupSlot, league: FakeLeagueSystem, text: Translator): string {
  return `  ${slot.slotId} ${playerLabel(slot.playerId, league.players)} ${formatLineupRole(slot.roleKey, text)}`;
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
function formatSetupDemoLines(league: FakeLeagueSystem, setupDemo: CliSetupDemo, text: Translator): readonly string[] {
  const lines = [
    `${text("setup.demo")}: ${setupDemo.profileKey}`,
    `${text("setup.selectedClub")}: ${clubLabel(setupDemo.clubId, league.clubsById)}`,
    `${text("setup.tactic")}: ${text("setup.mentality")}=${formatMentality(setupDemo.tactic.mentality, text)} ${text("setup.pressing")}=${formatTacticKnob(setupDemo.tactic.pressing)} ${text("setup.directness")}=${formatTacticKnob(setupDemo.tactic.directness)} ${text("setup.width")}=${formatTacticKnob(setupDemo.tactic.width)} ${text("setup.risk")}=${formatTacticKnob(setupDemo.tactic.risk)}`,
    `${text("setup.lineupRoleChanges")}:`,
  ];

  if (setupDemo.roleChanges.length === 0) {
    lines.push(`  ${text("common.none")}`);
    return lines;
  }

  for (const change of setupDemo.roleChanges) {
    lines.push(
      `  ${change.slotKey}: ${playerLabel(change.playerId, league.players)} ${formatLineupRole(change.fromRoleKey, text)} -> ${formatLineupRole(change.toRoleKey, text)}`,
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
 * Formats a stable shot-type key for presentation output.
 */
function formatShotType(shotType: string, text: Translator): string {
  return text(presentationMessageKey("event.shotType", shotType));
}

/**
 * Formats a stable chance-type key for presentation output.
 */
function formatChanceType(chanceType: string, text: Translator): string {
  return text(presentationMessageKey("event.chanceType", chanceType));
}

/**
 * Formats a stable lineup role key for presentation output.
 */
function formatLineupRole(roleKey: string, text: Translator): string {
  return text(presentationMessageKey("lineup.role", roleKey));
}

/**
 * Formats a stable tactic mentality key for presentation output.
 */
function formatMentality(mentality: string, text: Translator): string {
  return text(presentationMessageKey("setup.mentalityValue", mentality));
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
function formatConditionTableImpact(row: LeagueTableRow | undefined, league: FakeLeagueSystem, text: Translator): string {
  if (row === undefined) {
    return text("common.unavailable");
  }

  return text("condition.tableImpact", {
    club: clubLabel(row.clubId, league.clubsById),
    position: row.position,
    points: row.points,
    goalDifference: formatSignedNumber(row.goalDifference),
  });
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
 * Reads a compact club label for CLI output.
 */
function clubLabel(clubId: ClubId, clubsById: Readonly<Record<ClubId, Club>>): string {
  return clubsById[clubId]?.shortName ?? String(clubId);
}

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
