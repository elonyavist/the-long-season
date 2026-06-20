import {
  type Player,
  type PlayerDynamicState,
  type PlayerId,
  type SelectedLineup,
  type TacticSetup,
  type ClubId,
  type CompetitionId,
  type Fixture,
  type FixtureId,
  type GameDate,
  type GameState,
  type LeagueTableRow,
  type LeagueTableRules,
  type Round,
  type SeasonId,
} from "@game/domain";
import { diffDays } from "@game/shared";

import { createMatchReport } from "../match-engine/create-match-report.ts";
import {
  buildTacticTeamContext,
  TacticTeamContextError,
  type BuildTacticTeamContextInput,
  type LineupSlot,
  type MatchEngineConfig,
  type MatchTacticalDistributionInput,
  type MatchTeamContext,
  type PlayerStateMultiplierCurves,
  type RoleWeightProfile,
  type TeamStrength,
  deriveTeamStrength,
  TeamStrengthError,
} from "../match-engine/index.ts";
import { simulateMatch } from "../match-engine/simulate-match.ts";
import {
  recoverFitnessForPlayers,
  spendFitnessForPlayers,
  type FitnessRules,
} from "../player-state/index.ts";
import { generateRoundRobinCalendar } from "../season-engine/calendar.ts";
import { computeLeagueTable } from "../season-engine/league-table.ts";
import {
  computeSeasonPlayerGoalStats,
  computeSeasonPlayerSummaryStats,
  type SeasonPlayerGoalStatRow,
  type SeasonPlayerSummaryStatRow,
  type SeasonPlayerStatRegistration,
} from "../season-engine/player-stats.ts";
import {
  applyMatchReportToFixture,
  type ApplyMatchReportToFixtureState,
} from "./apply-match-report-to-fixture.ts";

/**
 * Team data required to simulate all fixtures for one club.
 */
export interface SimulateSeasonTeamInput {
  /** Explicit ordered lineup used for every match in this first milestone. */
  readonly lineup: readonly LineupSlot[];
  /** Precomputed aggregate strength for the lineup. */
  readonly strength: TeamStrength;
  /** Tactical distribution input for every match in this first milestone. */
  readonly tacticalDistribution: MatchTacticalDistributionInput;
  /** Optional player lookup used only when season fitness lifecycle is enabled. */
  readonly players?: Readonly<Record<PlayerId, Player>>;
  /** Optional role profiles used only when season fitness lifecycle is enabled. */
  readonly roleWeights?: Readonly<Record<string, RoleWeightProfile>>;
  /** Optional state curves used only when season fitness lifecycle is enabled. */
  readonly stateMultiplierCurves?: PlayerStateMultiplierCurves;
}

/**
 * Explicit selected setup override for one club in one season simulation.
 *
 * The override is self-contained so the season use-case can build a replacement
 * match-team context without reading content packages or mutating base team
 * input. The array order in `SimulateSeasonInput.setupOverrides` is the only
 * traversal order used for duplicate checks.
 */
export interface SimulateSeasonSetupOverride {
  /** Club whose fixed season setup should be replaced. */
  readonly clubId: ClubId;
  /** Selected lineup to use for this club in every fixture. */
  readonly lineup: SelectedLineup;
  /** Tactical setup to use for this club in every fixture. */
  readonly tactic: TacticSetup;
  /** Explicit required lineup size for this override. */
  readonly requiredLineupSize: number;
  /** Player lookup available to the selected lineup. */
  readonly players: Readonly<Record<PlayerId, Player>>;
  /** Role profiles available to the selected lineup. */
  readonly roleWeights: Readonly<Record<string, RoleWeightProfile>>;
  /** Optional dynamic states used only when multiplier curves are supplied. */
  readonly playerStates?: Readonly<Record<PlayerId, PlayerDynamicState>>;
  /** Optional state multiplier curves for deriving team strength. */
  readonly stateMultiplierCurves?: PlayerStateMultiplierCurves;
}

/**
 * Optional dynamic fitness lifecycle for one simulated season.
 *
 * The lifecycle is explicit and opt-in. Existing callers that omit it keep using
 * precomputed team strength, while callers that provide it get deterministic
 * recovery before each new fixture date and fitness spend after each played
 * fixture.
 */
export interface SimulateSeasonFitnessLifecycle {
  /** Current player-state lookup at season start. The use-case never mutates it. */
  readonly playerStates: Readonly<Record<PlayerId, PlayerDynamicState>>;
  /** Explicit ordered players who recover between match dates. */
  readonly playerIds: readonly PlayerId[];
  /** Optional fitness rules; defaults are used when omitted. */
  readonly rules?: FitnessRules;
}

/**
 * Input for deterministic one-season simulation.
 */
export interface SimulateSeasonInput {
  /** Run seed used by schedule and match RNG streams. */
  readonly seed: string;
  /** Season identity used by generated fixtures. */
  readonly seasonId: SeasonId;
  /** Competition identity used by generated fixtures. */
  readonly competitionId: CompetitionId;
  /** Explicit ordered competition participants. */
  readonly clubIds: readonly ClubId[];
  /** First round date. */
  readonly seasonStartDate: GameDate;
  /** Team simulation data keyed by club ID. */
  readonly teamsByClubId: Readonly<Record<ClubId, SimulateSeasonTeamInput>>;
  /** Ordered selected setup overrides for clubs that should not use base team input. */
  readonly setupOverrides?: readonly SimulateSeasonSetupOverride[];
  /** Optional dynamic fitness lifecycle applied across the simulated season. */
  readonly fitnessLifecycle?: SimulateSeasonFitnessLifecycle;
  /** Match engine config reused for each fixture. */
  readonly matchEngineConfig: MatchEngineConfig;
  /** Competition point rules for the final derived table. */
  readonly tableRules: LeagueTableRules;
}

/**
 * Result of one deterministic season simulation.
 */
export interface SimulateSeasonResult {
  /** Ordered generated rounds. */
  readonly rounds: readonly Round[];
  /** Ordered fixture IDs across the season. */
  readonly fixtureIds: readonly FixtureId[];
  /** Ordered fixtures after match reports have been applied. */
  readonly fixtures: readonly Fixture[];
  /** Final derived league table. */
  readonly table: readonly LeagueTableRow[];
  /** Best defense by goals against, using table order as tie-breaker. */
  readonly bestDefense: LeagueTableRow | undefined;
  /** Worst attack by goals for, using table order as tie-breaker. */
  readonly worstAttack: LeagueTableRow | undefined;
  /** Derived player goal statistics for the simulated season. */
  readonly playerGoalStats: readonly SeasonPlayerGoalStatRow[];
  /** Derived player summary statistics for currently supported season facts. */
  readonly playerSummaryStats: readonly SeasonPlayerSummaryStatRow[];
  /** Final dynamic player states when a fitness lifecycle was supplied. */
  readonly finalPlayerStates?: Readonly<Record<PlayerId, PlayerDynamicState>>;
}

/** Error categories exposed by season simulation. */
export type SimulateSeasonErrorCode =
  | "missing_fixture"
  | "missing_team"
  | "duplicate_setup_override"
  | "invalid_setup_override"
  | "invalid_fitness_lifecycle";

/**
 * Typed error thrown when a season cannot be simulated from its input.
 */
export class SimulateSeasonError extends Error {
  /** Machine-readable failure reason. */
  public readonly code: SimulateSeasonErrorCode;

  /**
   * Creates a season-simulation error.
   */
  public constructor(code: SimulateSeasonErrorCode, message: string) {
    super(message);
    this.name = "SimulateSeasonError";
    this.code = code;
  }
}

/**
 * Simulates one deterministic double round-robin season and derives its table.
 *
 * The use-case does not persist state. It generates fixtures, simulates each
 * match, applies reports to fixture results, and computes the final table.
 */
export function simulateSeason(input: SimulateSeasonInput): SimulateSeasonResult {
  const calendar = generateRoundRobinCalendar({
    seed: input.seed,
    seasonId: input.seasonId,
    competitionId: input.competitionId,
    clubIds: input.clubIds,
    seasonStartDate: input.seasonStartDate,
  });
  const setupOverrides = setupOverridesByClubId(input);
  let fitnessRuntime = initialFitnessRuntime(input);
  let state = createFixtureState(input, fixturesById(calendar.fixtures), calendar.fixtureIds);

  for (const fixtureId of calendar.fixtureIds) {
    const fixture = state.fixtures[fixtureId];

    if (fixture === undefined) {
      throw new SimulateSeasonError("missing_fixture", `Missing generated fixture: ${fixtureId}`);
    }

    fitnessRuntime = recoverFitnessBeforeFixture(input, fixture, fitnessRuntime);

    const matchContext = matchContextForFixture(input, fixture, setupOverrides, fitnessRuntime?.playerStates);
    const report = createMatchReport(simulateMatch(matchContext));
    state = applyMatchReportToFixture({ state, fixtureId, report });
    fitnessRuntime = spendFitnessAfterFixture(input, fixture, matchContext, fitnessRuntime);
  }

  const table = computeLeagueTable({
    clubIds: input.clubIds,
    fixtures: state.fixtures,
    fixtureIds: state.fixtureIds,
    rules: input.tableRules,
  });

  const registeredPlayers = playerRegistrations(input, setupOverrides);

  return {
    rounds: calendar.rounds,
    fixtureIds: state.fixtureIds,
    fixtures: orderedFixtures(state.fixtures, state.fixtureIds),
    table,
    bestDefense: bestDefense(table),
    worstAttack: worstAttack(table),
    playerGoalStats: computeSeasonPlayerGoalStats({
      fixtures: state.fixtures,
      fixtureIds: state.fixtureIds,
      playerRegistrations: registeredPlayers,
    }),
    playerSummaryStats: computeSeasonPlayerSummaryStats({
      fixtures: state.fixtures,
      fixtureIds: state.fixtureIds,
      playerRegistrations: registeredPlayers,
    }),
    ...(fitnessRuntime === undefined ? {} : { finalPlayerStates: fitnessRuntime.playerStates }),
  };
}

/**
 * Creates the temporary fixture state used while applying match reports.
 */
function createFixtureState(
  input: SimulateSeasonInput,
  fixtures: Readonly<Record<FixtureId, Fixture>>,
  fixtureIds: readonly FixtureId[],
): ApplyMatchReportToFixtureState {
  const state: GameState = {
    meta: {
      seed: input.seed,
      rngAlgorithmVersion: "sfc32-v1",
      saveSchemaVersion: 1,
    },
    calendar: {
      currentDate: input.seasonStartDate,
      currentSeasonId: input.seasonId,
    },
    players: {},
    playerIds: [],
    playerStates: {},
    clubs: {},
    clubIds: input.clubIds,
  };

  return {
    ...state,
    fixtures,
    fixtureIds,
  };
}

/**
 * Builds one match context from fixture sides and season team data.
 */
function matchContextForFixture(
  input: SimulateSeasonInput,
  fixture: Fixture,
  setupOverrides: Readonly<Record<ClubId, SimulateSeasonSetupOverride>>,
  playerStates?: Readonly<Record<PlayerId, PlayerDynamicState>>,
) {
  return {
    fixtureId: fixture.id,
    seed: input.seed,
    home: matchTeamContext(input, fixture.homeClubId, setupOverrides, playerStates),
    away: matchTeamContext(input, fixture.awayClubId, setupOverrides, playerStates),
    engineConfig: input.matchEngineConfig,
  };
}

/** Runtime fitness state carried while the season loop walks fixture dates. */
interface SeasonFitnessRuntime {
  /** Latest player states after recovery/spend. */
  readonly playerStates: Readonly<Record<PlayerId, PlayerDynamicState>>;
  /** Last fixture date already processed, used to compute deterministic rest days. */
  readonly previousFixtureDate?: GameDate;
}

/**
 * Builds one side context for a fixture.
 */
function matchTeamContext(
  input: SimulateSeasonInput,
  clubId: ClubId,
  setupOverrides: Readonly<Record<ClubId, SimulateSeasonSetupOverride>>,
  playerStates?: Readonly<Record<PlayerId, PlayerDynamicState>>,
): MatchTeamContext {
  const setupOverride = setupOverrides[clubId];

  if (setupOverride !== undefined) {
    return buildSetupOverrideContext(setupOverride, playerStates ?? setupOverride.playerStates);
  }

  const team = input.teamsByClubId[clubId];

  if (team === undefined) {
    throw new SimulateSeasonError("missing_team", `Missing season team input: ${clubId}`);
  }

  if (playerStates !== undefined) {
    return fitnessAwareMatchTeamContext(clubId, team, playerStates);
  }

  return {
    clubId,
    lineup: team.lineup,
    strength: team.strength,
    tacticalDistribution: team.tacticalDistribution,
  };
}

/**
 * Builds explicit player registrations from fixed season lineups.
 */
function playerRegistrations(
  input: SimulateSeasonInput,
  setupOverrides: Readonly<Record<ClubId, SimulateSeasonSetupOverride>>,
): readonly SeasonPlayerStatRegistration[] {
  const registrations: SeasonPlayerStatRegistration[] = [];

  for (const clubId of input.clubIds) {
    const team = matchTeamContext(input, clubId, setupOverrides);

    for (const slot of team.lineup) {
      registrations.push({
        playerId: slot.playerId,
        clubId,
      });
    }
  }

  return registrations;
}

/**
 * Indexes explicit setup overrides by club while validating duplicates.
 */
function setupOverridesByClubId(input: SimulateSeasonInput): Readonly<Record<ClubId, SimulateSeasonSetupOverride>> {
  const overrides: Record<ClubId, SimulateSeasonSetupOverride> = {};
  const seenClubIds = new Set<ClubId>();

  for (const override of input.setupOverrides ?? []) {
    if (seenClubIds.has(override.clubId)) {
      throw new SimulateSeasonError("duplicate_setup_override", `Duplicate setup override for club: ${override.clubId}`);
    }

    const baseTeam = input.teamsByClubId[override.clubId];
    if (baseTeam === undefined) {
      throw new SimulateSeasonError("missing_team", `Missing base team input for setup override: ${override.clubId}`);
    }

    seenClubIds.add(override.clubId);
    overrides[override.clubId] = override;
  }

  return overrides;
}

/**
 * Converts one selected setup override into a match-team context.
 */
function buildSetupOverrideContext(
  override: SimulateSeasonSetupOverride,
  playerStates?: Readonly<Record<PlayerId, PlayerDynamicState>>,
): MatchTeamContext {
  const builderInput: BuildTacticTeamContextInput = {
    lineup: override.lineup,
    tactic: override.tactic,
    requiredLineupSize: override.requiredLineupSize,
    players: override.players,
    roleWeights: override.roleWeights,
    ...(playerStates === undefined ? {} : { playerStates }),
    ...(override.stateMultiplierCurves === undefined ? {} : { stateMultiplierCurves: override.stateMultiplierCurves }),
  };

  try {
    return buildTacticTeamContext(builderInput);
  } catch (error) {
    if (error instanceof TacticTeamContextError) {
      throw new SimulateSeasonError(
        "invalid_setup_override",
        `Invalid setup override for club ${override.clubId}: ${error.message}`,
      );
    }

    throw error;
  }
}

/**
 * Builds a match-team context whose strength reflects the latest fitness state.
 */
function fitnessAwareMatchTeamContext(
  clubId: ClubId,
  team: SimulateSeasonTeamInput,
  playerStates: Readonly<Record<PlayerId, PlayerDynamicState>>,
): MatchTeamContext {
  if (team.players === undefined || team.roleWeights === undefined || team.stateMultiplierCurves === undefined) {
    throw new SimulateSeasonError(
      "invalid_fitness_lifecycle",
      `Fitness lifecycle requires players, role weights, and state curves for team: ${clubId}`,
    );
  }

  try {
    return {
      clubId,
      lineup: team.lineup,
      strength: deriveTeamStrength({
        lineup: team.lineup,
        players: team.players,
        playerStates,
        roleWeights: team.roleWeights,
        stateMultiplierCurves: team.stateMultiplierCurves,
      }),
      tacticalDistribution: team.tacticalDistribution,
    };
  } catch (error) {
    if (error instanceof TeamStrengthError) {
      throw new SimulateSeasonError(
        "invalid_fitness_lifecycle",
        `Invalid fitness lifecycle strength input for club ${clubId}: ${error.message}`,
      );
    }

    throw error;
  }
}

/**
 * Creates runtime state only when the caller explicitly enables fitness lifecycle.
 */
function initialFitnessRuntime(input: SimulateSeasonInput): SeasonFitnessRuntime | undefined {
  if (input.fitnessLifecycle === undefined) {
    return undefined;
  }

  return {
    playerStates: input.fitnessLifecycle.playerStates,
  };
}

/**
 * Recovers all lifecycle-tracked players once for each new fixture date.
 */
function recoverFitnessBeforeFixture(
  input: SimulateSeasonInput,
  fixture: Fixture,
  runtime: SeasonFitnessRuntime | undefined,
): SeasonFitnessRuntime | undefined {
  if (runtime === undefined || input.fitnessLifecycle === undefined) {
    return runtime;
  }

  const previousFixtureDate = runtime.previousFixtureDate;
  if (previousFixtureDate === undefined) {
    return {
      ...runtime,
      previousFixtureDate: fixture.date,
    };
  }

  const dayCount = diffDays(Number(fixture.date), Number(previousFixtureDate));
  if (dayCount <= 0) {
    return runtime;
  }

  return {
    playerStates: recoverFitnessForPlayers({
      playerStates: runtime.playerStates,
      playerIds: input.fitnessLifecycle.playerIds,
      dayCount,
      ...(input.fitnessLifecycle.rules === undefined ? {} : { rules: input.fitnessLifecycle.rules }),
    }),
    previousFixtureDate: fixture.date,
  };
}

/**
 * Spends match fitness for the two selected starting lineups after one fixture.
 */
function spendFitnessAfterFixture(
  input: SimulateSeasonInput,
  fixture: Fixture,
  matchContext: ReturnType<typeof matchContextForFixture>,
  runtime: SeasonFitnessRuntime | undefined,
): SeasonFitnessRuntime | undefined {
  if (runtime === undefined || input.fitnessLifecycle === undefined) {
    return runtime;
  }

  return {
    playerStates: spendFitnessForPlayers({
      playerStates: runtime.playerStates,
      playerIds: fixturePlayerIds(matchContext),
      ...(input.fitnessLifecycle.rules === undefined ? {} : { rules: input.fitnessLifecycle.rules }),
    }),
    previousFixtureDate: fixture.date,
  };
}

/**
 * Returns ordered player IDs that appeared in one simulated fixture.
 */
function fixturePlayerIds(matchContext: ReturnType<typeof matchContextForFixture>): readonly PlayerId[] {
  return [
    ...matchContext.home.lineup.map((slot) => slot.playerId),
    ...matchContext.away.lineup.map((slot) => slot.playerId),
  ];
}

/**
 * Indexes fixtures by ID without relying on object-key order.
 */
function fixturesById(fixtures: readonly Fixture[]): Readonly<Record<FixtureId, Fixture>> {
  const lookup: Record<FixtureId, Fixture> = {};

  for (const fixture of fixtures) {
    lookup[fixture.id] = fixture;
  }

  return lookup;
}

/**
 * Rebuilds ordered fixtures from the explicit fixture ID order.
 */
function orderedFixtures(
  fixtures: Readonly<Record<FixtureId, Fixture>>,
  fixtureIds: readonly FixtureId[],
): readonly Fixture[] {
  const ordered: Fixture[] = [];

  for (const fixtureId of fixtureIds) {
    const fixture = fixtures[fixtureId];

    if (fixture === undefined) {
      throw new SimulateSeasonError("missing_fixture", `Missing fixture in final state: ${fixtureId}`);
    }

    ordered.push(fixture);
  }

  return ordered;
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
