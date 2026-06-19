import {
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
import type {
  LineupSlot,
  MatchEngineConfig,
  MatchTacticalDistributionInput,
  MatchTeamContext,
  TeamStrength,
} from "../match-engine/index.ts";
import { simulateMatch } from "../match-engine/simulate-match.ts";
import { generateRoundRobinCalendar } from "../season-engine/calendar.ts";
import { computeLeagueTable } from "../season-engine/league-table.ts";
import {
  computeSeasonPlayerGoalStats,
  type SeasonPlayerGoalStatRow,
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
}

/** Error categories exposed by season simulation. */
export type SimulateSeasonErrorCode = "missing_fixture" | "missing_team";

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
  let state = createFixtureState(input, fixturesById(calendar.fixtures), calendar.fixtureIds);

  for (const fixtureId of calendar.fixtureIds) {
    const fixture = state.fixtures[fixtureId];

    if (fixture === undefined) {
      throw new SimulateSeasonError("missing_fixture", `Missing generated fixture: ${fixtureId}`);
    }

    const report = createMatchReport(simulateMatch(matchContextForFixture(input, fixture)));
    state = applyMatchReportToFixture({ state, fixtureId, report });
  }

  const table = computeLeagueTable({
    clubIds: input.clubIds,
    fixtures: state.fixtures,
    fixtureIds: state.fixtureIds,
    rules: input.tableRules,
  });

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
      playerRegistrations: playerRegistrations(input),
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
function matchContextForFixture(input: SimulateSeasonInput, fixture: Fixture) {
  return {
    fixtureId: fixture.id,
    seed: input.seed,
    home: matchTeamContext(input, fixture.homeClubId),
    away: matchTeamContext(input, fixture.awayClubId),
    engineConfig: input.matchEngineConfig,
  };
}

/**
 * Builds one side context for a fixture.
 */
function matchTeamContext(input: SimulateSeasonInput, clubId: ClubId): MatchTeamContext {
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
function playerRegistrations(input: SimulateSeasonInput): readonly SeasonPlayerStatRegistration[] {
  const registrations: SeasonPlayerStatRegistration[] = [];

  for (const clubId of input.clubIds) {
    const team = input.teamsByClubId[clubId];

    if (team === undefined) {
      throw new SimulateSeasonError("missing_team", `Missing season team input: ${clubId}`);
    }

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
