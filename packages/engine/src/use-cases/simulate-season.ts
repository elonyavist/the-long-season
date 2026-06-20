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
} from "../match-engine/index.ts";
import { simulateMatch } from "../match-engine/simulate-match.ts";
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
}

/** Error categories exposed by season simulation. */
export type SimulateSeasonErrorCode =
  | "missing_fixture"
  | "missing_team"
  | "duplicate_setup_override"
  | "invalid_setup_override";

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
  const setupOverrides = setupOverrideContexts(input);
  let state = createFixtureState(input, fixturesById(calendar.fixtures), calendar.fixtureIds);

  for (const fixtureId of calendar.fixtureIds) {
    const fixture = state.fixtures[fixtureId];

    if (fixture === undefined) {
      throw new SimulateSeasonError("missing_fixture", `Missing generated fixture: ${fixtureId}`);
    }

    const report = createMatchReport(simulateMatch(matchContextForFixture(input, fixture, setupOverrides)));
    state = applyMatchReportToFixture({ state, fixtureId, report });
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
  setupOverrides: Readonly<Record<ClubId, MatchTeamContext>>,
) {
  return {
    fixtureId: fixture.id,
    seed: input.seed,
    home: matchTeamContext(input, fixture.homeClubId, setupOverrides),
    away: matchTeamContext(input, fixture.awayClubId, setupOverrides),
    engineConfig: input.matchEngineConfig,
  };
}

/**
 * Builds one side context for a fixture.
 */
function matchTeamContext(
  input: SimulateSeasonInput,
  clubId: ClubId,
  setupOverrides: Readonly<Record<ClubId, MatchTeamContext>>,
): MatchTeamContext {
  const setupOverride = setupOverrides[clubId];

  if (setupOverride !== undefined) {
    return setupOverride;
  }

  const team = input.teamsByClubId[clubId];

  if (team === undefined) {
    throw new SimulateSeasonError("missing_team", `Missing season team input: ${clubId}`);
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
  setupOverrides: Readonly<Record<ClubId, MatchTeamContext>>,
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
 * Builds replacement team contexts for all explicit setup overrides.
 */
function setupOverrideContexts(input: SimulateSeasonInput): Readonly<Record<ClubId, MatchTeamContext>> {
  const contexts: Record<ClubId, MatchTeamContext> = {};
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
    contexts[override.clubId] = buildSetupOverrideContext(override);
  }

  return contexts;
}

/**
 * Converts one selected setup override into a match-team context.
 */
function buildSetupOverrideContext(override: SimulateSeasonSetupOverride): MatchTeamContext {
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
      throw new SimulateSeasonError(
        "invalid_setup_override",
        `Invalid setup override for club ${override.clubId}: ${error.message}`,
      );
    }

    throw error;
  }
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
