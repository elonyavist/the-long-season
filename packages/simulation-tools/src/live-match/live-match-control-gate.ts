import {
  createLiveMatchSession,
  emptyLiveMatchStatistics,
  type ClubId,
  type CompetitionId,
  type CompetitionMatchRules,
  type Fixture,
  type GameDate,
  type GameState,
  type LeagueTableRow,
  type LeagueTableRules,
  type LiveMatchSession,
  type LiveMatchTeamState,
  type MatchEventSide,
  type MatchInjurySeverity,
  type Player,
  type PlayerId,
  type SeasonId,
} from "@game/domain";
import {
  applyMatchReportToFixture,
  buildLiveMatchProjection,
  computeLeagueTable,
  createMatchReport,
  generateRoundRobinCalendar,
  runAutomatedProgressiveMatch,
  type MatchContext,
  type MatchTeamContext,
  type PlayerMatchRatingRegistration,
  type ProgressiveMatchSessionState,
  type SimulateMatchResult,
} from "@game/engine";
import { hashStringToSeedWords, RNG_ALGORITHM_VERSION } from "@game/shared";

/** Numeric distributions emitted by the long-run live-match gate. */
export type LiveMatchControlDistributionKey =
  | "ai_changes_per_team"
  | "ai_decisions_per_team"
  | "bottom_points"
  | "champion_points"
  | "corners_per_team"
  | "fouls_per_team"
  | "goals_per_team"
  | "injuries_knock_per_match"
  | "injuries_minor_per_match"
  | "injuries_moderate_per_match"
  | "injuries_serious_per_match"
  | "penalties_awarded_per_match"
  | "penalty_goals_per_match"
  | "player_rating"
  | "possession_percent"
  | "red_cards_per_team"
  | "saves_per_team"
  | "shots_on_target_per_team"
  | "shots_per_team"
  | "substitutions_per_team"
  | "table_points_spread"
  | "xg_per_team"
  | "yellow_cards_per_team";

/** Compact exact distribution used for report review without retaining matches. */
export interface LiveMatchControlDistribution {
  readonly count: number;
  readonly min: number;
  readonly p50: number;
  readonly p95: number;
  readonly max: number;
  readonly mean: number;
}

/** Machine-readable structural invariant checked by the gate. */
export type LiveMatchControlInvariantKey =
  | "ai_command_application"
  | "card_event_agreement"
  | "duplicate_player"
  | "fixture_commit"
  | "full_time"
  | "goalkeeper_coverage"
  | "no_reentry"
  | "possession_total"
  | "rating_bounds"
  | "same_seed_reproducibility"
  | "score_event_agreement"
  | "season_completion"
  | "shot_coherence"
  | "substitution_limit";

/** One actionable structural failure with stable world and fixture identity. */
export interface LiveMatchControlFailure {
  readonly invariant: LiveMatchControlInvariantKey;
  readonly worldSeed: string;
  readonly fixtureId?: string;
  readonly message: string;
}

/** One season-sized world summary retained for outlier inspection. */
export interface LiveMatchControlWorldSummary {
  readonly worldSeed: string;
  readonly fixtureCount: number;
  readonly championClubId: ClubId;
  readonly championPoints: number;
  readonly bottomPoints: number;
  readonly tablePointsSpread: number;
  readonly goalCount: number;
  readonly homeWins: number;
  readonly draws: number;
  readonly awayWins: number;
}

/** Result rates across every completed fixture in the gate. */
export interface LiveMatchControlResultRates {
  readonly homeWin: number;
  readonly draw: number;
  readonly awayWin: number;
}

/** Same-seed comparison attached by the two-pass gate entrypoint. */
export interface LiveMatchControlReproducibility {
  readonly checked: boolean;
  readonly firstHash: string;
  readonly secondHash?: string;
  readonly matches: boolean;
}

/** Complete structured report for the Phase 77 live-match quality gate. */
export interface LiveMatchControlGateReport {
  readonly seedPrefix: string;
  readonly worldCount: number;
  readonly fixtureCount: number;
  readonly status: "fail" | "pass";
  readonly structuredHash: string;
  readonly reproducibility: LiveMatchControlReproducibility;
  readonly resultRates: LiveMatchControlResultRates;
  readonly distributions: Readonly<Record<LiveMatchControlDistributionKey, LiveMatchControlDistribution>>;
  readonly worlds: readonly LiveMatchControlWorldSummary[];
  readonly failures: readonly LiveMatchControlFailure[];
}

/** Initial and rebuildable tactical facts required for one generated fixture. */
export interface LiveMatchControlFixtureSetup {
  readonly context: MatchContext;
  readonly home: LiveMatchTeamState;
  readonly away: LiveMatchTeamState;
  /** Rebuilds current engine strength after a validated AI team change. */
  readonly buildMatchTeamContext: (
    team: LiveMatchTeamState,
    playerCondition: Readonly<Partial<Record<PlayerId, number>>>,
  ) => MatchTeamContext;
}

/** Content-free season input supplied by an app or CLI adapter. */
export interface LiveMatchControlGateWorld {
  readonly seed: string;
  readonly seasonId: SeasonId;
  readonly competitionId: CompetitionId;
  readonly clubIds: readonly ClubId[];
  readonly seasonStartDate: GameDate;
  readonly tableRules: LeagueTableRules;
  readonly matchRules: CompetitionMatchRules;
  readonly players: Readonly<Record<PlayerId, Player>>;
  readonly playerIds: readonly PlayerId[];
  readonly createFixtureSetup: (fixture: Fixture) => LiveMatchControlFixtureSetup;
}

/** Input for a streaming multi-world progressive-match gate. */
export interface RunLiveMatchControlGateInput {
  readonly seedPrefix: string;
  readonly worldCount: number;
  readonly createWorld: (worldSeed: string, worldIndex: number) => LiveMatchControlGateWorld;
}

interface FixtureRunResult {
  readonly state: ProgressiveMatchSessionState;
  readonly home: LiveMatchTeamState;
  readonly away: LiveMatchTeamState;
  readonly projection: ReturnType<typeof buildLiveMatchProjection>;
  readonly aiDecisionCount: Readonly<Record<MatchEventSide, number>>;
  readonly aiChangeCount: Readonly<Record<MatchEventSide, number>>;
}

interface MutableGateTotals {
  fixtureCount: number;
  goalCount: number;
  homeWins: number;
  draws: number;
  awayWins: number;
}

/** Runs one deterministic progressive season for every requested world. */
export function runLiveMatchControlGate(input: RunLiveMatchControlGateInput): LiveMatchControlGateReport {
  assertValidInput(input);
  const samples = createSampleRecord();
  const failures: LiveMatchControlFailure[] = [];
  const worlds: LiveMatchControlWorldSummary[] = [];
  const fixtureFingerprints: string[] = [];
  const totals: MutableGateTotals = { fixtureCount: 0, goalCount: 0, homeWins: 0, draws: 0, awayWins: 0 };

  for (let worldIndex = 0; worldIndex < input.worldCount; worldIndex += 1) {
    const worldSeed = liveMatchControlWorldSeed(input.seedPrefix, worldIndex);
    const world = input.createWorld(worldSeed, worldIndex);
    const calendar = generateRoundRobinCalendar({
      seed: world.seed,
      seasonId: world.seasonId,
      competitionId: world.competitionId,
      clubIds: world.clubIds,
      seasonStartDate: world.seasonStartDate,
    });
    let gameState = initialGateGameState(world, calendar.fixtures);
    let worldGoals = 0;
    let worldHomeWins = 0;
    let worldDraws = 0;
    let worldAwayWins = 0;

    for (const fixture of calendar.fixtures) {
      try {
        const setup = world.createFixtureSetup(fixture);
        assertFixtureSetup(fixture, setup);
        const completed = runFixture(world, fixture, setup, failures);
        collectFixtureSamples(samples, completed);
        collectFixtureFailures(world.seed, fixture, completed, world.matchRules, failures);

        const result = simulationResultFrom(completed.state);
        gameState = applyMatchReportToFixture({
          state: gameState,
          fixtureId: fixture.id,
          report: createMatchReport(result),
        });
        const committed = gameState.fixtures[fixture.id]?.result;
        if (committed?.played !== true) {
          addFailure(failures, world.seed, fixture, "fixture_commit", "Completed fixture was not committed as played");
          continue;
        }

        totals.fixtureCount += 1;
        totals.goalCount += result.score.home + result.score.away;
        worldGoals += result.score.home + result.score.away;
        if (result.score.home > result.score.away) {
          totals.homeWins += 1;
          worldHomeWins += 1;
        } else if (result.score.home < result.score.away) {
          totals.awayWins += 1;
          worldAwayWins += 1;
        } else {
          totals.draws += 1;
          worldDraws += 1;
        }
        fixtureFingerprints.push(fingerprintFixture(world.seed, fixture, completed));
      } catch (error) {
        addFailure(
          failures,
          world.seed,
          fixture,
          "fixture_commit",
          error instanceof Error ? error.message : String(error),
        );
      }
    }

    const table = computeLeagueTable({
      clubIds: world.clubIds,
      fixtures: gameState.fixtures,
      fixtureIds: calendar.fixtureIds,
      rules: world.tableRules,
    });
    const summary = summarizeWorld(
      world,
      table,
      calendar.fixtureIds.length,
      worldGoals,
      worldHomeWins,
      worldDraws,
      worldAwayWins,
      failures,
    );
    worlds.push(summary);
    samples.champion_points.push(summary.championPoints);
    samples.bottom_points.push(summary.bottomPoints);
    samples.table_points_spread.push(summary.tablePointsSpread);
  }

  const distributions = summarizeSamples(samples);
  const resultRates = resultRatesFrom(totals);
  const hashPayload = {
    seedPrefix: input.seedPrefix,
    worldCount: input.worldCount,
    fixtureCount: totals.fixtureCount,
    resultRates,
    distributions,
    worlds,
    failures,
    fixtureFingerprints,
  };
  const structuredHash = stableHash(hashPayload);

  return {
    seedPrefix: input.seedPrefix,
    worldCount: input.worldCount,
    fixtureCount: totals.fixtureCount,
    status: failures.length === 0 ? "pass" : "fail",
    structuredHash,
    reproducibility: { checked: false, firstHash: structuredHash, matches: false },
    resultRates,
    distributions,
    worlds,
    failures,
  };
}

/** Runs the complete gate twice and turns hash disagreement into a failure. */
export function verifyLiveMatchControlGateReproducibility(
  input: RunLiveMatchControlGateInput,
): LiveMatchControlGateReport {
  const first = runLiveMatchControlGate(input);
  const second = runLiveMatchControlGate(input);
  const matches = first.structuredHash === second.structuredHash;
  const failures = matches
    ? first.failures
    : [
        ...first.failures,
        {
          invariant: "same_seed_reproducibility" as const,
          worldSeed: input.seedPrefix,
          message: `Repeated gate hashes differ: ${first.structuredHash} != ${second.structuredHash}`,
        },
      ];

  return {
    ...first,
    status: failures.length === 0 ? "pass" : "fail",
    reproducibility: {
      checked: true,
      firstHash: first.structuredHash,
      secondHash: second.structuredHash,
      matches,
    },
    failures,
  };
}

/** Creates the stable seed used for one world in the gate. */
export function liveMatchControlWorldSeed(seedPrefix: string, worldIndex: number): string {
  return `${seedPrefix}-world-${String(worldIndex + 1).padStart(5, "0")}`;
}

function runFixture(
  world: LiveMatchControlGateWorld,
  fixture: Fixture,
  setup: LiveMatchControlFixtureSetup,
  failures: LiveMatchControlFailure[],
): FixtureRunResult {
  assertInitialLiveTeams(fixture, world.matchRules, setup.home, setup.away);
  const registrations = ratingRegistrations(setup.home, setup.away);
  const aiDecisionCount: Record<MatchEventSide, number> = { home: 0, away: 0 };
  const aiChangeCount: Record<MatchEventSide, number> = { home: 0, away: 0 };
  const completed = runAutomatedProgressiveMatch({
    context: setup.context,
    rules: world.matchRules,
    players: world.players,
    home: setup.home,
    away: setup.away,
    aiControlledSides: ["home", "away"],
    buildMatchTeamContext: setup.buildMatchTeamContext,
  });
  const { state, home, away } = completed;

  for (const side of ["home", "away"] as const) {
      const sideDecisions = completed.decisions.filter((decision) => decision.side === side);
      aiDecisionCount[side] = sideDecisions.length;
      aiChangeCount[side] = sideDecisions.filter((decision) => decision.facts.length > 0).length;
      const rejectionCodes = sideDecisions.flatMap((decision) => decision.selection.reasons.flatMap((reason) =>
        reason.reasonKey === "command_rejected" ? reason.rejectionCodes ?? [] : []
      ));
      const rejectedPlayers = sideDecisions.flatMap((decision) => decision.selection.reasons.flatMap((reason) =>
        reason.reasonKey === "command_rejected" ? reason.rejectedPlayerIds ?? [] : []
      ));
      const rejectionMinutes = sideDecisions.flatMap((decision) => decision.selection.reasons.flatMap((reason) =>
        reason.reasonKey === "command_rejected" ? [reason.minute] : []
      ));
      const rejectedDecisionContext = sideDecisions.flatMap((decision) => {
        const rejected = decision.selection.reasons.some((reason) => reason.reasonKey === "command_rejected");
        if (!rejected) return [];
        return decision.selection.reasons.flatMap((reason) =>
          reason.reasonKey === "command_rejected"
            ? []
            : [`${reason.reasonKey}:${reason.playerId ?? "-"}->${reason.replacementPlayerId ?? "-"}`]
        );
      });
      if (rejectionCodes.length > 0) {
        const rejectedTeam = side === "home" ? home : away;
        const progressiveAvailability = side === "home" ? state.availability.home : state.availability.away;
        const currentMinuteEvents = state.events.filter((event) => event.minute === state.simulation.minute);
        addFailure(
          failures,
          world.seed,
          fixture,
          "ai_command_application",
          `${side} AI command rejected: ${[...new Set(rejectionCodes)].sort().join(", ")}`
            + ` at ${[...new Set(rejectionMinutes)].sort((left, right) => left - right).join("/")}'`
            + (rejectedPlayers.length === 0 ? "" : ` (${[...new Set(rejectedPlayers)].sort().join(", ")})`)
            + (rejectedDecisionContext.length === 0 ? "" : ` [${rejectedDecisionContext.join(", ")}]`)
            + ` {lineup=${rejectedTeam.lineup.map((slot) => slot.playerId).join("|")}`
            + `; teamUnavailable=${rejectedTeam.unavailable.map((entry) => `${entry.playerId}:${entry.reason}`).join("|") || "none"}`
            + `; progressiveUnavailable=${progressiveAvailability.unavailable.map((entry) => `${entry.playerId}:${entry.reason}`).join("|") || "none"}`
            + `; events=${JSON.stringify(currentMinuteEvents)}}`,
        );
      }
      assertPlayableTeamAfterDecision(world.seed, fixture, state, home, away, world.matchRules, failures);
  }

  return {
    state,
    home,
    away,
    projection: buildLiveMatchProjection({
      simulation: state.simulation,
      events: state.events,
      playerRegistrations: registrations,
    }),
    aiDecisionCount,
    aiChangeCount,
  };
}

function liveSessionForAi(
  fixture: Fixture,
  state: ProgressiveMatchSessionState,
  home: LiveMatchTeamState,
  away: LiveMatchTeamState,
  statistics: ReturnType<typeof buildLiveMatchProjection>["statistics"],
  controlledSide: MatchEventSide,
  rules: CompetitionMatchRules,
): LiveMatchSession {
  return createLiveMatchSession({
    fixtureId: fixture.id,
    controlledSide,
    phase: state.phase,
    currentMinute: state.simulation.minute,
    runState: state.runState,
    ...(state.runState === "paused" ? { pauseReason: "manual" as const } : {}),
    score: { ...state.simulation.score },
    statistics,
    home,
    away,
    events: [],
    substitutions: state.appliedSubstitutions,
  }, rules);
}

function assertInitialLiveTeams(
  fixture: Fixture,
  rules: CompetitionMatchRules,
  home: LiveMatchTeamState,
  away: LiveMatchTeamState,
): void {
  createLiveMatchSession({
    fixtureId: fixture.id,
    controlledSide: "home",
    phase: "pre_match",
    currentMinute: 0,
    runState: "paused",
    pauseReason: "pre_match",
    score: { home: 0, away: 0 },
    statistics: emptyLiveMatchStatistics(),
    home,
    away,
    events: [],
    substitutions: [],
  }, rules);
}

function collectFixtureFailures(
  worldSeed: string,
  fixture: Fixture,
  completed: FixtureRunResult,
  rules: CompetitionMatchRules,
  failures: LiveMatchControlFailure[],
): void {
  const { state, projection } = completed;
  if (state.phase !== "full_time" || state.simulation.minute !== state.simulation.context.engineConfig.minuteCount) {
    addFailure(failures, worldSeed, fixture, "full_time", `Fixture stopped at ${state.phase} minute ${state.simulation.minute}`);
  }

  const goals = countEventsBySide(state, "shot_outcome", (event) => event.outcome === "goal");
  if (goals.home !== state.simulation.score.home || goals.away !== state.simulation.score.away) {
    addFailure(failures, worldSeed, fixture, "score_event_agreement", "Score differs from emitted goal events");
  }
  const possessionTotal = projection.statistics.home.possessionShare + projection.statistics.away.possessionShare;
  if (Math.abs(possessionTotal - 1) > 0.000_001) {
    addFailure(failures, worldSeed, fixture, "possession_total", `Possession totals ${possessionTotal}`);
  }
  for (const side of ["home", "away"] as const) {
    const stats = projection.statistics[side];
    if (stats.shotsOnTarget > stats.shots || stats.expectedGoals > stats.shots + 0.000_001) {
      addFailure(failures, worldSeed, fixture, "shot_coherence", `${side} shot/xG totals are incoherent`);
    }
    const yellowEvents = countSideEvents(state, side, "yellow_card");
    const redEvents = countSideEvents(state, side, "red_card") + countSideEvents(state, side, "second_yellow_card");
    if (yellowEvents !== stats.yellowCards || redEvents !== stats.redCards) {
      addFailure(failures, worldSeed, fixture, "card_event_agreement", `${side} card statistics differ from events`);
    }
    const team = side === "home" ? completed.home : completed.away;
    if (team.substitutionsUsed > rules.maximumSubstitutions) {
      addFailure(failures, worldSeed, fixture, "substitution_limit", `${side} used ${team.substitutionsUsed} substitutions`);
    }
    if (hasReentry(state, side)) {
      addFailure(failures, worldSeed, fixture, "no_reentry", `${side} returned an outgoing player to the pitch`);
    }
  }
  if (projection.players.some((player) => player.rating < 1 || player.rating > 10)) {
    addFailure(failures, worldSeed, fixture, "rating_bounds", "At least one player rating is outside 1..10");
  }
}

function assertPlayableTeamAfterDecision(
  worldSeed: string,
  fixture: Fixture,
  state: ProgressiveMatchSessionState,
  home: LiveMatchTeamState,
  away: LiveMatchTeamState,
  rules: CompetitionMatchRules,
  failures: LiveMatchControlFailure[],
): void {
  if (state.phase === "full_time") return;
  try {
    const projection = buildLiveMatchProjection({ simulation: state.simulation, events: state.events });
    liveSessionForAi(fixture, state, home, away, projection.statistics, "home", rules);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const invariant = message.toLowerCase().includes("goalkeeper") ? "goalkeeper_coverage" : "duplicate_player";
    addFailure(failures, worldSeed, fixture, invariant, message);
  }
}

function collectFixtureSamples(
  samples: MutableSampleRecord,
  completed: FixtureRunResult,
): void {
  for (const side of ["home", "away"] as const) {
    const stats = completed.projection.statistics[side];
    samples.possession_percent.push(stats.possessionShare * 100);
    samples.shots_per_team.push(stats.shots);
    samples.shots_on_target_per_team.push(stats.shotsOnTarget);
    samples.xg_per_team.push(stats.expectedGoals);
    samples.corners_per_team.push(stats.corners);
    samples.fouls_per_team.push(stats.fouls);
    samples.yellow_cards_per_team.push(stats.yellowCards);
    samples.red_cards_per_team.push(stats.redCards);
    samples.saves_per_team.push(stats.saves);
    samples.goals_per_team.push(stats.goals);
    const team = side === "home" ? completed.home : completed.away;
    samples.substitutions_per_team.push(team.substitutionsUsed);
    samples.ai_decisions_per_team.push(completed.aiDecisionCount[side]);
    samples.ai_changes_per_team.push(completed.aiChangeCount[side]);
  }
  for (const rating of completed.projection.players) samples.player_rating.push(rating.rating);
  samples.penalties_awarded_per_match.push(countMatchEvents(completed.state, "penalty_awarded"));
  samples.penalty_goals_per_match.push(
    completed.state.events.filter((event) => event.type === "penalty_outcome" && event.outcome === "scored").length,
  );
  for (const severity of ["knock", "minor", "moderate", "serious"] as const) {
    samples[`injuries_${severity}_per_match`].push(countInjuries(completed.state, severity));
  }
}

function summarizeWorld(
  world: LiveMatchControlGateWorld,
  table: readonly LeagueTableRow[],
  expectedFixtureCount: number,
  goalCount: number,
  homeWins: number,
  draws: number,
  awayWins: number,
  failures: LiveMatchControlFailure[],
): LiveMatchControlWorldSummary {
  const champion = table[0];
  const bottom = table.at(-1);
  if (champion === undefined || bottom === undefined) throw new Error(`Empty table for ${world.seed}`);
  const playedFixtureCount = table.reduce((sum, row) => sum + row.played, 0) / 2;
  if (playedFixtureCount !== expectedFixtureCount || table.length !== world.clubIds.length) {
    failures.push({
      invariant: "season_completion",
      worldSeed: world.seed,
      message: `Season committed ${playedFixtureCount}/${expectedFixtureCount} fixtures and ${table.length}/${world.clubIds.length} rows`,
    });
  }
  return {
    worldSeed: world.seed,
    fixtureCount: playedFixtureCount,
    championClubId: champion.clubId,
    championPoints: champion.points,
    bottomPoints: bottom.points,
    tablePointsSpread: champion.points - bottom.points,
    goalCount,
    homeWins,
    draws,
    awayWins,
  };
}

function initialGateGameState(world: LiveMatchControlGateWorld, fixtures: readonly Fixture[]): GameState {
  return {
    meta: { seed: world.seed, rngAlgorithmVersion: RNG_ALGORITHM_VERSION, saveSchemaVersion: 1 },
    calendar: { currentDate: world.seasonStartDate, currentSeasonId: world.seasonId },
    players: world.players,
    playerIds: world.playerIds,
    playerStates: {},
    clubs: {},
    clubIds: world.clubIds,
    fixtures: Object.fromEntries(fixtures.map((fixture) => [fixture.id, fixture])),
    fixtureIds: fixtures.map((fixture) => fixture.id),
  };
}

function simulationResultFrom(state: ProgressiveMatchSessionState): SimulateMatchResult {
  return {
    fixtureId: state.simulation.context.fixtureId,
    finalMinute: state.simulation.minute,
    isComplete: state.phase === "full_time",
    score: state.simulation.score,
    stats: state.simulation.stats,
    events: state.events,
  };
}

function ratingRegistrations(
  home: LiveMatchTeamState,
  away: LiveMatchTeamState,
): readonly PlayerMatchRatingRegistration[] {
  return [
    ...teamRegistrations(home),
    ...teamRegistrations(away),
  ];
}

function teamRegistrations(team: LiveMatchTeamState): readonly PlayerMatchRatingRegistration[] {
  const seen = new Set<PlayerId>();
  return [...team.lineup, ...team.bench]
    .filter((entry) => {
      if (seen.has(entry.playerId)) return false;
      seen.add(entry.playerId);
      return true;
    })
    .map((entry) => ({ playerId: entry.playerId, side: team.side }));
}

function assertFixtureSetup(fixture: Fixture, setup: LiveMatchControlFixtureSetup): void {
  if (setup.context.fixtureId !== fixture.id) {
    throw new Error(`Fixture setup context mismatch: ${setup.context.fixtureId} != ${fixture.id}`);
  }
  if (setup.context.home.clubId !== fixture.homeClubId || setup.context.away.clubId !== fixture.awayClubId) {
    throw new Error(`Fixture setup club mismatch for ${fixture.id}`);
  }
}

function hasReentry(state: ProgressiveMatchSessionState, side: MatchEventSide): boolean {
  const outgoing = new Set<PlayerId>();
  for (const substitution of state.appliedSubstitutions.filter((entry) => entry.side === side)) {
    if (outgoing.has(substitution.incomingPlayerId)) return true;
    outgoing.add(substitution.outgoingPlayerId);
  }
  return false;
}

function countInjuries(state: ProgressiveMatchSessionState, severity: MatchInjurySeverity): number {
  return state.events.filter((event) => event.type === "injury" && event.severity === severity).length;
}

function countMatchEvents(
  state: ProgressiveMatchSessionState,
  type: ProgressiveMatchSessionState["events"][number]["type"],
): number {
  return state.events.filter((event) => event.type === type).length;
}

function countSideEvents(
  state: ProgressiveMatchSessionState,
  side: MatchEventSide,
  type: "red_card" | "second_yellow_card" | "yellow_card",
): number {
  return state.events.filter((event) => event.type === type && event.side === side).length;
}

function countEventsBySide(
  state: ProgressiveMatchSessionState,
  type: "shot_outcome",
  predicate: (event: Extract<ProgressiveMatchSessionState["events"][number], { readonly type: "shot_outcome" }>) => boolean,
): Readonly<Record<MatchEventSide, number>> {
  const totals: Record<MatchEventSide, number> = { home: 0, away: 0 };
  for (const event of state.events) {
    if (event.type === type && predicate(event)) totals[event.side] += 1;
  }
  return totals;
}

function fingerprintFixture(worldSeed: string, fixture: Fixture, result: FixtureRunResult): string {
  const stats = result.projection.statistics;
  return JSON.stringify({
    worldSeed,
    fixtureId: fixture.id,
    score: result.state.simulation.score,
    statistics: stats,
    substitutions: result.state.appliedSubstitutions,
    aiChanges: result.aiChangeCount,
  });
}

type MutableSampleRecord = { -readonly [K in LiveMatchControlDistributionKey]: number[] };

function createSampleRecord(): MutableSampleRecord {
  return {
    ai_changes_per_team: [],
    ai_decisions_per_team: [],
    bottom_points: [],
    champion_points: [],
    corners_per_team: [],
    fouls_per_team: [],
    goals_per_team: [],
    injuries_knock_per_match: [],
    injuries_minor_per_match: [],
    injuries_moderate_per_match: [],
    injuries_serious_per_match: [],
    penalties_awarded_per_match: [],
    penalty_goals_per_match: [],
    player_rating: [],
    possession_percent: [],
    red_cards_per_team: [],
    saves_per_team: [],
    shots_on_target_per_team: [],
    shots_per_team: [],
    substitutions_per_team: [],
    table_points_spread: [],
    xg_per_team: [],
    yellow_cards_per_team: [],
  };
}

function summarizeSamples(samples: MutableSampleRecord): Readonly<Record<LiveMatchControlDistributionKey, LiveMatchControlDistribution>> {
  return Object.fromEntries(
    (Object.keys(samples) as LiveMatchControlDistributionKey[]).map((key) => [key, summarizeDistribution(samples[key])]),
  ) as Readonly<Record<LiveMatchControlDistributionKey, LiveMatchControlDistribution>>;
}

function summarizeDistribution(values: readonly number[]): LiveMatchControlDistribution {
  if (values.length === 0) return { count: 0, min: 0, p50: 0, p95: 0, max: 0, mean: 0 };
  const sorted = [...values].sort((left, right) => left - right);
  return {
    count: sorted.length,
    min: roundThree(sorted[0] ?? 0),
    p50: roundThree(percentile(sorted, 0.5)),
    p95: roundThree(percentile(sorted, 0.95)),
    max: roundThree(sorted.at(-1) ?? 0),
    mean: roundThree(sorted.reduce((sum, value) => sum + value, 0) / sorted.length),
  };
}

function percentile(sorted: readonly number[], fraction: number): number {
  return sorted[Math.floor((sorted.length - 1) * fraction)] ?? 0;
}

function resultRatesFrom(totals: MutableGateTotals): LiveMatchControlResultRates {
  if (totals.fixtureCount === 0) return { homeWin: 0, draw: 0, awayWin: 0 };
  return {
    homeWin: roundThree(totals.homeWins / totals.fixtureCount),
    draw: roundThree(totals.draws / totals.fixtureCount),
    awayWin: roundThree(totals.awayWins / totals.fixtureCount),
  };
}

function stableHash(value: unknown): string {
  return hashStringToSeedWords(JSON.stringify(value))
    .map((word) => word.toString(16).padStart(8, "0"))
    .join("");
}

function addFailure(
  failures: LiveMatchControlFailure[],
  worldSeed: string,
  fixture: Fixture,
  invariant: LiveMatchControlInvariantKey,
  message: string,
): void {
  failures.push({ invariant, worldSeed, fixtureId: String(fixture.id), message });
}

function assertValidInput(input: RunLiveMatchControlGateInput): void {
  if (input.seedPrefix.length === 0) throw new Error("Live-match gate seedPrefix must not be empty");
  if (!Number.isSafeInteger(input.worldCount) || input.worldCount <= 0) {
    throw new Error(`Live-match gate worldCount must be a positive safe integer: ${input.worldCount}`);
  }
}

function roundThree(value: number): number {
  return Math.round(value * 1_000) / 1_000;
}
