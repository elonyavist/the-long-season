import assert from "node:assert/strict";
import { test } from "vitest";

import {
  abilityValue,
  clubId,
  competitionId,
  fixtureId,
  gameDate,
  playerId,
  seasonId,
  stateValue,
  type ClubId,
  type Fixture,
  type FixtureId,
  type Player,
  type PlayerAbilities,
  type PlayerDynamicState,
  type PlayerId,
  type SelectedLineup,
  type TacticSetup,
} from "@game/domain";
import { fromISO } from "@game/shared";

import {
  simulateSeason,
  SimulateSeasonError,
  type SimulateSeasonFixtureLineupOverride,
  type SimulateSeasonInput,
  type SimulateSeasonSetupOverride,
  type SimulateSeasonTeamInput,
} from "./simulate-season.ts";
import type { PlayerStateMultiplierCurves, RoleWeightProfile } from "../match-engine/index.ts";

/**
 * Season simulation tests prove the first full-season use-case without content,
 * CLI formatting, persistence, or future management systems.
 */

test("simulateSeason completes one 18-team, 34-round season", () => {
  const result = simulateSeason(seasonInput("season-seed"));

  assert.equal(result.rounds.length, 34);
  assert.equal(result.fixtureIds.length, 306);
  assert.equal(result.fixtures.length, 306);

  for (const fixture of result.fixtures) {
    assert.equal(fixture.result?.played, true);
  }
});

test("same seed produces same final table", () => {
  const first = simulateSeason(seasonInput("repeatable-seed"));
  const second = simulateSeason(seasonInput("repeatable-seed"));

  assert.deepEqual(first.table, second.table);
});

test("stable season seed produces a compact golden sentinel", () => {
  const result = simulateSeason(seasonInput("golden-season-seed"));
  const firstFixture = result.fixtures[0];
  const lastFixture = result.fixtures[result.fixtures.length - 1];
  assert.ok(firstFixture !== undefined);
  assert.ok(lastFixture !== undefined);
  assert.ok(firstFixture.result?.report !== undefined);
  assert.ok(lastFixture.result?.report !== undefined);

  // This sentinel catches accidental engine drift without freezing every event
  // in a full season. Update it only with an intentional gameplay rationale.
  assert.deepEqual(
    {
      rounds: result.rounds.length,
      fixtureCount: result.fixtures.length,
      champion: result.table[0],
      runnerUp: result.table[1],
      bottom: result.table[result.table.length - 1],
      firstFixture: {
        id: firstFixture.id,
        homeGoals: firstFixture.result?.homeGoals,
        awayGoals: firstFixture.result?.awayGoals,
        eventCount: firstFixture.result?.report.events.length,
        homeShots: firstFixture.result?.report.stats.home.shots,
        awayShots: firstFixture.result?.report.stats.away.shots,
      },
      lastFixture: {
        id: lastFixture.id,
        homeGoals: lastFixture.result?.homeGoals,
        awayGoals: lastFixture.result?.awayGoals,
        eventCount: lastFixture.result?.report.events.length,
        homeShots: lastFixture.result?.report.stats.home.shots,
        awayShots: lastFixture.result?.report.stats.away.shots,
      },
      topScorers: result.playerGoalStats.slice(0, 3),
    },
    {
      rounds: 34,
      fixtureCount: 306,
      champion: {
        position: 1,
        clubId: clubId("club:test-02"),
        played: 34,
        wins: 8,
        draws: 24,
        losses: 2,
        goalsFor: 11,
        goalsAgainst: 3,
        goalDifference: 8,
        points: 48,
      },
      runnerUp: {
        position: 2,
        clubId: clubId("club:test-07"),
        played: 34,
        wins: 8,
        draws: 22,
        losses: 4,
        goalsFor: 8,
        goalsAgainst: 4,
        goalDifference: 4,
        points: 46,
      },
      bottom: {
        position: 18,
        clubId: clubId("club:test-17"),
        played: 34,
        wins: 0,
        draws: 25,
        losses: 9,
        goalsFor: 0,
        goalsAgainst: 9,
        goalDifference: -9,
        points: 25,
      },
      firstFixture: {
        id: fixtureId("fixture:000001"),
        homeGoals: 0,
        awayGoals: 0,
        eventCount: 5,
        homeShots: 1,
        awayShots: 1,
      },
      lastFixture: {
        id: fixtureId("fixture:000306"),
        homeGoals: 0,
        awayGoals: 0,
        eventCount: 4,
        homeShots: 0,
        awayShots: 1,
      },
      topScorers: [
        {
          playerId: playerId("player:test-02-02"),
          clubId: clubId("club:test-02"),
          goals: 11,
        },
        {
          playerId: playerId("player:test-07-02"),
          clubId: clubId("club:test-07"),
          goals: 8,
        },
        {
          playerId: playerId("player:test-06-02"),
          clubId: clubId("club:test-06"),
          goals: 7,
        },
      ],
    },
  );
});

test("no team plays twice in a round", () => {
  const result = simulateSeason(seasonInput("round-seed"));

  for (const round of result.rounds) {
    const clubsInRound: ClubId[] = [];

    for (const fixtureId of round.fixtureIds) {
      const fixture = findFixture(result.fixtures, fixtureId);
      assert.ok(fixture !== undefined);
      assert.equal(clubsInRound.includes(fixture.homeClubId), false);
      assert.equal(clubsInRound.includes(fixture.awayClubId), false);
      clubsInRound.push(fixture.homeClubId, fixture.awayClubId);
    }
  }
});

test("final table contains every club once", () => {
  const input = seasonInput("table-seed");
  const result = simulateSeason(input);
  const tableClubIds: ClubId[] = [];

  for (const row of result.table) {
    assert.equal(tableClubIds.includes(row.clubId), false);
    tableClubIds.push(row.clubId);
  }

  assert.equal(result.table.length, input.clubIds.length);

  for (const clubId of input.clubIds) {
    assert.equal(tableClubIds.includes(clubId), true);
  }
});

test("season player goal stats match table goals", () => {
  const result = simulateSeason(seasonInput("player-stats-seed"));
  const totalTableGoals = result.table.reduce((total, row) => total + row.goalsFor, 0);
  const totalPlayerGoals = result.playerGoalStats.reduce((total, row) => total + row.goals, 0);

  assert.equal(totalPlayerGoals, totalTableGoals);
  assert.equal(result.playerGoalStats.length, 36);
});

test("season player summary stats match durable assist and save events", () => {
  const result = simulateSeason(seasonInput("player-summary-seed"));
  const totalSummaryAssists = result.playerSummaryStats.reduce((total, row) => total + row.assists, 0);
  const totalSummarySaves = result.playerSummaryStats.reduce((total, row) => total + row.saves, 0);

  assert.equal(result.playerSummaryStats.length, 36);
  assert.equal(totalSummaryAssists, countAssists(result.fixtures));
  assert.equal(totalSummarySaves, countSaves(result.fixtures));
});

test("empty setup overrides preserve default output", () => {
  const input = seasonInput("empty-override-seed");

  assert.deepEqual(simulateSeason({ ...input, setupOverrides: [] }), simulateSeason(input));
});

test("empty fixture lineup overrides preserve default output", () => {
  const input = seasonInput("empty-fixture-lineup-override-seed");

  assert.deepEqual(simulateSeason({ ...input, fixtureLineupOverrides: [] }), simulateSeason(input));
});

test("valid fixture lineup override shape is accepted", () => {
  const input = seasonInput("fixture-lineup-override-seed");
  const fixture = firstGeneratedFixture(input);
  const withFixtureLineupOverride: SimulateSeasonInput = {
    ...input,
    fixtureLineupOverrides: [fixtureLineupOverride(input, fixture, fixture.homeClubId)],
  };
  const result = simulateSeason(withFixtureLineupOverride);

  assert.equal(result.fixtures.length, 306);
  assert.equal(result.fixtures.every((playedFixture) => playedFixture.result?.played === true), true);
});

test("fixture lineup override changes only the intended fixture result", () => {
  const input = seasonInput("fixture-lineup-applied-seed");
  const fixture = generatedFixtureById(input, fixtureId("fixture:000004"));
  const overrideResult = simulateSeason({
    ...input,
    fixtureLineupOverrides: [fixtureLineupOverrideWithReserve(input, fixture, fixture.homeClubId)],
  });
  const defaultResult = simulateSeason(input);

  for (const defaultFixture of defaultResult.fixtures) {
    const overriddenFixture = findFixture(overrideResult.fixtures, defaultFixture.id);
    assert.ok(overriddenFixture !== undefined);

    if (defaultFixture.id === fixture.id) {
      assert.notDeepEqual(overriddenFixture.result, defaultFixture.result);
    } else {
      assert.deepEqual(overriddenFixture.result, defaultFixture.result);
    }
  }
});

test("same seed plus same fixture lineup override is deterministic", () => {
  const input = seasonInput("repeatable-fixture-lineup-override-seed");
  const fixture = firstGeneratedFixture(input);
  const withFixtureLineupOverride: SimulateSeasonInput = {
    ...input,
    fixtureLineupOverrides: [fixtureLineupOverrideWithReserve(input, fixture, fixture.homeClubId)],
  };

  assert.deepEqual(simulateSeason(withFixtureLineupOverride), simulateSeason(withFixtureLineupOverride));
});

test("fixture lineup override registrations follow explicit override input order", () => {
  const input = seasonInput("ordered-fixture-lineup-overrides-seed");
  const firstFixture = generatedFixtureById(input, fixtureId("fixture:000001"));
  const secondFixture = generatedFixtureById(input, fixtureId("fixture:000002"));
  const firstOverride = fixtureLineupOverrideWithReserve(input, firstFixture, firstFixture.homeClubId);
  const secondOverride = fixtureLineupOverrideWithReserve(input, secondFixture, secondFixture.homeClubId);
  const withFixtureLineupOverrides: SimulateSeasonInput = {
    ...input,
    fixtureLineupOverrides: [secondOverride, firstOverride],
  };
  const result = simulateSeason(withFixtureLineupOverrides);

  assert.deepEqual(result, simulateSeason(withFixtureLineupOverrides));
  assert.equal(
    result.playerSummaryStats.some((row) => row.playerId === fixtureReservePlayerId(secondFixture.homeClubId)),
    true,
  );
  assert.equal(
    result.playerSummaryStats.some((row) => row.playerId === fixtureReservePlayerId(firstFixture.homeClubId)),
    true,
  );
});

test("setup override changes the selected club setup without mutating base input", () => {
  const input = seasonInput("setup-override-seed");
  const overriddenClubId = input.clubIds[0];
  assert.ok(overriddenClubId !== undefined);

  const beforeLineup = input.teamsByClubId[overriddenClubId]?.lineup;
  const defaultResult = simulateSeason(input);
  const overrideResult = simulateSeason({
    ...input,
    setupOverrides: [setupOverrideFixture(overriddenClubId)],
  });

  assert.notDeepEqual(overrideResult.table, defaultResult.table);
  assert.equal(overrideResult.playerSummaryStats.some((row) => row.playerId === playerId("player:override-01")), true);
  assert.equal(overrideResult.playerSummaryStats.some((row) => row.playerId === playerId("player:test-01-01")), false);
  assert.deepEqual(input.teamsByClubId[overriddenClubId]?.lineup, beforeLineup);
});

test("same seed plus same setup override is deterministic", () => {
  const input = seasonInput("repeatable-override-seed");
  const overriddenClubId = input.clubIds[0];
  assert.ok(overriddenClubId !== undefined);

  const withOverride: SimulateSeasonInput = {
    ...input,
    setupOverrides: [setupOverrideFixture(overriddenClubId)],
  };

  assert.deepEqual(simulateSeason(withOverride), simulateSeason(withOverride));
});

test("duplicate setup overrides fail clearly", () => {
  const input = seasonInput("duplicate-override-seed");
  const overriddenClubId = input.clubIds[0];
  assert.ok(overriddenClubId !== undefined);

  assertSimulateSeasonError(
    () =>
      simulateSeason({
        ...input,
        setupOverrides: [setupOverrideFixture(overriddenClubId), setupOverrideFixture(overriddenClubId)],
      }),
    "duplicate_setup_override",
  );
});

test("duplicate fixture lineup overrides fail clearly", () => {
  const input = seasonInput("duplicate-fixture-lineup-override-seed");
  const fixture = firstGeneratedFixture(input);
  const override = fixtureLineupOverride(input, fixture, fixture.homeClubId);

  assertSimulateSeasonError(
    () =>
      simulateSeason({
        ...input,
        fixtureLineupOverrides: [override, override],
      }),
    "duplicate_fixture_lineup_override",
  );
});

test("fixture lineup override rejects missing fixture and wrong fixture club", () => {
  const input = seasonInput("invalid-fixture-lineup-scope-seed");
  const fixture = firstGeneratedFixture(input);
  const missingFixtureOverride = {
    ...fixtureLineupOverride(input, fixture, fixture.homeClubId),
    fixtureId: fixtureId("fixture:999999"),
  };
  const wrongClubId = nonParticipantClubId(input, fixture);

  assertSimulateSeasonError(
    () =>
      simulateSeason({
        ...input,
        fixtureLineupOverrides: [missingFixtureOverride],
      }),
    "missing_fixture",
  );

  assertSimulateSeasonError(
    () =>
      simulateSeason({
        ...input,
        fixtureLineupOverrides: [fixtureLineupOverride(input, fixture, wrongClubId)],
      }),
    "invalid_fixture_lineup_override",
  );
});

test("invalid setup overrides fail clearly", () => {
  const input = seasonInput("invalid-override-seed");
  const overriddenClubId = input.clubIds[0];
  assert.ok(overriddenClubId !== undefined);

  assertSimulateSeasonError(
    () =>
      simulateSeason({
        ...input,
        setupOverrides: [
          {
            ...setupOverrideFixture(overriddenClubId),
            requiredLineupSize: 11,
          },
        ],
      }),
    "invalid_setup_override",
  );
});

test("invalid fixture lineup override data fails clearly", () => {
  const input = seasonInput("invalid-fixture-lineup-data-seed");
  const fixture = firstGeneratedFixture(input);
  const validOverride = fixtureLineupOverride(input, fixture, fixture.homeClubId);

  assertSimulateSeasonError(
    () =>
      simulateSeason({
        ...input,
        fixtureLineupOverrides: [
          {
            ...validOverride,
            requiredLineupSize: 11,
          },
        ],
      }),
    "invalid_fixture_lineup_override",
  );

  assertSimulateSeasonError(
    () =>
      simulateSeason({
        ...input,
        fixtureLineupOverrides: [
          {
            ...validOverride,
            players: {},
          },
        ],
      }),
    "invalid_fixture_lineup_override",
  );
});

test("omitted fitness lifecycle keeps final player states absent", () => {
  const result = simulateSeason(seasonInput("no-fitness-lifecycle-seed"));

  assert.equal(result.finalPlayerStates, undefined);
});

test("inactive fitness-ready team data preserves default output", () => {
  const input = seasonInput("inactive-fitness-data-seed");

  assert.deepEqual(simulateSeason({ ...input, teamsByClubId: fitnessReadyTeams(input) }), simulateSeason(input));
});

test("fitness lifecycle spends match fitness and recovers between fixture dates", () => {
  const input = seasonInputWithFitnessLifecycle("fitness-lifecycle-seed", 100);
  const result = simulateSeason(input);
  const lifecycle = input.fitnessLifecycle;
  assert.ok(lifecycle !== undefined);
  assert.ok(result.finalPlayerStates !== undefined);
  const finalPlayerStates: Readonly<Record<PlayerId, PlayerDynamicState>> = result.finalPlayerStates;

  for (const playerId of lifecycle.playerIds) {
    const playerState = finalPlayerStates[playerId];
    assert.ok(playerState !== undefined);
    assert.equal(Number(playerState.fitness), 92);
    assert.equal(Number(playerState.form), 50);
    assert.equal(Number(playerState.morale), 50);
  }
});

test("fitness lifecycle can recover tired starters over a season", () => {
  const input = seasonInputWithFitnessLifecycle("fitness-recovery-seed", 50);
  const result = simulateSeason(input);
  const lifecycle = input.fitnessLifecycle;
  assert.ok(lifecycle !== undefined);
  assert.ok(result.finalPlayerStates !== undefined);
  const finalPlayerStates: Readonly<Record<PlayerId, PlayerDynamicState>> = result.finalPlayerStates;

  for (const playerId of lifecycle.playerIds) {
    const playerState = finalPlayerStates[playerId];
    assert.ok(playerState !== undefined);
    assert.equal(Number(playerState.fitness), 92);
  }
});

test("fixture lineup override spends fitness for selected reserve and rests replaced starter", () => {
  const baseInput = seasonInputWithFitnessLifecycle("fixture-lineup-fitness-seed", 100);
  const selectedClubId = baseInput.clubIds[0];
  assert.ok(selectedClubId !== undefined);
  const fixture = lastFixtureForClub(baseInput, selectedClubId);
  const override = fixtureLineupOverrideWithReserve(baseInput, fixture, selectedClubId);
  const reservePlayerId = override.lineup[1]?.playerId;
  const restedPlayerId = baseInput.teamsByClubId[selectedClubId]?.lineup[1]?.playerId;
  const unchangedStarterId = baseInput.teamsByClubId[selectedClubId]?.lineup[0]?.playerId;
  assert.ok(reservePlayerId !== undefined);
  assert.ok(restedPlayerId !== undefined);
  assert.ok(unchangedStarterId !== undefined);
  const input = addLifecyclePlayers(baseInput, [reservePlayerId]);
  const result = simulateSeason({
    ...input,
    fixtureLineupOverrides: [override],
  });

  assert.ok(result.finalPlayerStates !== undefined);
  assert.equal(Number(result.finalPlayerStates[reservePlayerId]?.fitness), 92);
  assert.equal(Number(result.finalPlayerStates[restedPlayerId]?.fitness), 100);
  assert.equal(Number(result.finalPlayerStates[unchangedStarterId]?.fitness), 92);
});

test("fitness lifecycle fails clearly when team data cannot rebuild strength", () => {
  const input = seasonInput("missing-fitness-team-data-seed");
  const { playerStates, playerIds } = initialPlayerStates(input, 100);

  assertSimulateSeasonError(
    () =>
      simulateSeason({
        ...input,
        fitnessLifecycle: {
          playerStates,
          playerIds,
        },
      }),
    "invalid_fitness_lifecycle",
  );
});

/**
 * Builds deterministic season input with 18 synthetic team contexts.
 */
function seasonInput(seed: string): SimulateSeasonInput {
  const clubIds = demoClubIds();

  return {
    seed,
    seasonId: seasonId("season:2026"),
    competitionId: competitionId("competition:test-league"),
    clubIds,
    seasonStartDate: gameDate(fromISO("2026-08-01")),
    teamsByClubId: teamsByClubId(clubIds),
    matchEngineConfig: {
      minuteCount: 12,
      rates: {
        baseOpportunityRatePerMinute: 0.06,
        maxOpportunityRatePerMinute: 0.18,
      },
      conversionBands: [
        {
          bandKey: "low",
          minQualityInclusive: 0,
          maxQualityExclusive: 0.5,
          goalProbability: 0.1,
        },
        {
          bandKey: "high",
          minQualityInclusive: 0.5,
          maxQualityExclusive: 1.01,
          goalProbability: 0.25,
        },
      ],
      homeAdvantageFactor: 1.05,
      tacticalDistributionCaps: {
        directness: { minInclusive: 0, maxInclusive: 1 },
        pressing: { minInclusive: 0, maxInclusive: 1 },
        width: { minInclusive: 0, maxInclusive: 1 },
        risk: { minInclusive: 0, maxInclusive: 1 },
      },
    },
    tableRules: {
      pointsForWin: 3,
      pointsForDraw: 1,
      pointsForLoss: 0,
    },
  };
}

/**
 * Builds season input with explicit dynamic fitness lifecycle enabled.
 */
function seasonInputWithFitnessLifecycle(seed: string, initialFitness: number): SimulateSeasonInput {
  const input = seasonInput(seed);
  const { playerStates, playerIds } = initialPlayerStates(input, initialFitness);

  return {
    ...input,
    teamsByClubId: fitnessReadyTeams(input),
    fitnessLifecycle: {
      playerStates,
      playerIds,
    },
  };
}

/**
 * Adds optional player, role, and state-curve data needed only by lifecycle simulations.
 */
function fitnessReadyTeams(input: SimulateSeasonInput): Readonly<Record<ClubId, SimulateSeasonTeamInput>> {
  const teams: Record<ClubId, SimulateSeasonTeamInput> = {};

  for (const clubId of input.clubIds) {
    const team = input.teamsByClubId[clubId];
    assert.ok(team !== undefined);

    const players: Record<PlayerId, Player> = {};
    for (const slot of team.lineup) {
      players[slot.playerId] = makePlayer(slot.playerId, team.strength.overall);
    }

    teams[clubId] = {
      ...team,
      players,
      roleWeights: overrideRoleWeights(),
      stateMultiplierCurves: testFitnessCurves(),
    };
  }

  return teams;
}

/**
 * Builds initial dynamic states for every fixed lineup player in deterministic order.
 */
function initialPlayerStates(
  input: SimulateSeasonInput,
  fitness: number,
): {
  readonly playerStates: Readonly<Record<PlayerId, PlayerDynamicState>>;
  readonly playerIds: readonly PlayerId[];
} {
  const playerStates: Record<PlayerId, PlayerDynamicState> = {};
  const playerIds: PlayerId[] = [];

  for (const clubId of input.clubIds) {
    const team = input.teamsByClubId[clubId];
    assert.ok(team !== undefined);

    for (const slot of team.lineup) {
      playerIds.push(slot.playerId);
      playerStates[slot.playerId] = {
        fitness: stateValue(fitness),
        form: stateValue(50),
        morale: stateValue(50),
      };
    }
  }

  return { playerStates, playerIds };
}

/**
 * Extends one fitness lifecycle input with additional tracked players.
 */
function addLifecyclePlayers(input: SimulateSeasonInput, playerIds: readonly PlayerId[]): SimulateSeasonInput {
  const lifecycle = input.fitnessLifecycle;
  assert.ok(lifecycle !== undefined);
  const playerStates: Record<PlayerId, PlayerDynamicState> = { ...lifecycle.playerStates };

  for (const playerId of playerIds) {
    playerStates[playerId] = {
      fitness: stateValue(100),
      form: stateValue(50),
      morale: stateValue(50),
    };
  }

  return {
    ...input,
    fitnessLifecycle: {
      ...lifecycle,
      playerStates,
      playerIds: [...lifecycle.playerIds, ...playerIds],
    },
  };
}

/**
 * Test curve that makes low fitness affect rebuilt team strength.
 */
function testFitnessCurves(): PlayerStateMultiplierCurves {
  return {
    fitness: [
      { maxValueInclusive: 59, multiplier: 0.9 },
      { maxValueInclusive: 100, multiplier: 1 },
    ],
  };
}

/**
 * Builds 18 namespaced demo club IDs.
 */
function demoClubIds(): readonly ClubId[] {
  const clubIds: ClubId[] = [];

  for (let clubNumber = 1; clubNumber <= 18; clubNumber += 1) {
    clubIds.push(clubId(`club:test-${String(clubNumber).padStart(2, "0")}`));
  }

  return clubIds;
}

/**
 * Builds team contexts keyed by club ID.
 */
function teamsByClubId(clubIds: readonly ClubId[]): Readonly<Record<ClubId, SimulateSeasonTeamInput>> {
  const teams: Record<ClubId, SimulateSeasonTeamInput> = {};

  for (let index = 0; index < clubIds.length; index += 1) {
    const clubId = clubIds[index];
    assert.ok(clubId !== undefined);

    const rating = 8 + (clubIds.length - index) / 3;
    teams[clubId] = {
      lineup: [
        {
          slotId: "slot:01",
          playerId: playerId(`player:test-${String(index + 1).padStart(2, "0")}-01`),
          roleKey: "gk",
        },
        {
          slotId: "slot:02",
          playerId: playerId(`player:test-${String(index + 1).padStart(2, "0")}-02`),
          roleKey: "synthetic",
        },
      ],
      strength: {
        attack: rating,
        midfield: rating,
        defense: rating,
        goalkeeper: rating,
        overall: rating,
      },
      tacticalDistribution: {
        directness: 0.5,
        pressing: 0.5,
        width: 0.5,
        risk: 0.5,
      },
    };
  }

  return teams;
}

/**
 * Builds a selected setup override for one club.
 */
function setupOverrideFixture(clubId: ClubId): SimulateSeasonSetupOverride {
  return {
    clubId,
    lineup: selectedLineupFixture(clubId),
    tactic: tacticFixture(),
    requiredLineupSize: 2,
    players: overridePlayers(),
    roleWeights: overrideRoleWeights(),
  };
}

/**
 * Finds the first generated fixture for one deterministic input.
 */
function firstGeneratedFixture(input: SimulateSeasonInput): Fixture {
  const fixture = simulateSeason(input).fixtures[0];
  assert.ok(fixture !== undefined);

  return fixture;
}

/**
 * Finds one generated fixture by ID for tests that need a stable target.
 */
function generatedFixtureById(input: SimulateSeasonInput, id: FixtureId): Fixture {
  const fixture = findFixture(simulateSeason(input).fixtures, id);
  assert.ok(fixture !== undefined);

  return fixture;
}

/**
 * Finds the final fixture involving one club in generated season order.
 */
function lastFixtureForClub(input: SimulateSeasonInput, clubId: ClubId): Fixture {
  let lastFixture: Fixture | undefined;

  for (const fixture of simulateSeason(input).fixtures) {
    if (fixture.homeClubId === clubId || fixture.awayClubId === clubId) {
      lastFixture = fixture;
    }
  }

  assert.ok(lastFixture !== undefined);

  return lastFixture;
}

/**
 * Finds a club from the input that does not participate in one fixture.
 */
function nonParticipantClubId(input: SimulateSeasonInput, fixture: Fixture): ClubId {
  for (const clubId of input.clubIds) {
    if (clubId !== fixture.homeClubId && clubId !== fixture.awayClubId) {
      return clubId;
    }
  }

  throw new Error(`Cannot find non-participant club for fixture: ${fixture.id}`);
}

/**
 * Builds a fixture-scoped lineup override for one club.
 */
function fixtureLineupOverride(
  input: SimulateSeasonInput,
  fixture: Fixture,
  clubId: ClubId,
): SimulateSeasonFixtureLineupOverride {
  const team = input.teamsByClubId[clubId];
  assert.ok(team !== undefined);

  return {
    fixtureId: fixture.id,
    clubId,
    lineup: team.lineup,
    requiredLineupSize: team.lineup.length,
    players: playersForLineup(team.lineup, team.strength.overall),
    roleWeights: overrideRoleWeights(),
  };
}

/**
 * Builds a fixture-scoped lineup override that replaces the second starter.
 */
function fixtureLineupOverrideWithReserve(
  input: SimulateSeasonInput,
  fixture: Fixture,
  clubId: ClubId,
): SimulateSeasonFixtureLineupOverride {
  const baseOverride = fixtureLineupOverride(input, fixture, clubId);
  const reservePlayerId = fixtureReservePlayerId(clubId);
  const lineup = baseOverride.lineup.map((slot, index) =>
    index === 1
      ? {
          ...slot,
          playerId: reservePlayerId,
        }
      : slot,
  );

  return {
    ...baseOverride,
    lineup,
    players: {
      ...baseOverride.players,
      [reservePlayerId]: makePlayer(reservePlayerId, 20),
    },
  };
}

/**
 * Builds the deterministic reserve player ID used by fixture override tests.
 */
function fixtureReservePlayerId(clubId: ClubId): PlayerId {
  return playerId(`player:reserve-${String(clubId).slice("club:".length)}`);
}

/**
 * Builds player lookup data for every player in one test lineup.
 */
function playersForLineup(lineup: SimulateSeasonTeamInput["lineup"], ability: number): Readonly<Record<PlayerId, Player>> {
  const players: Record<PlayerId, Player> = {};

  for (const slot of lineup) {
    players[slot.playerId] = makePlayer(slot.playerId, ability);
  }

  return players;
}

/**
 * Builds selected lineup data for one override club.
 */
function selectedLineupFixture(clubId: ClubId): SelectedLineup {
  return {
    clubId,
    slots: [
      {
        slotKey: "slot:override-gk",
        playerId: playerId("player:override-01"),
        roleKey: "gk",
      },
      {
        slotKey: "slot:override-st",
        playerId: playerId("player:override-02"),
        roleKey: "synthetic",
      },
    ],
  };
}

/**
 * Builds tactical setup data for override tests.
 */
function tacticFixture(): TacticSetup {
  return {
    mentality: "attacking",
    directness: 1,
    pressing: 1,
    width: 1,
    risk: 1,
  };
}

/**
 * Builds override players with stronger ability values than the base fixtures.
 */
function overridePlayers(): Readonly<Record<PlayerId, Player>> {
  const goalkeeperId = playerId("player:override-01");
  const strikerId = playerId("player:override-02");

  return {
    [goalkeeperId]: makePlayer(goalkeeperId, 20),
    [strikerId]: makePlayer(strikerId, 20),
  };
}

/**
 * Builds role weights used by override setup tests.
 */
function overrideRoleWeights(): Readonly<Record<string, RoleWeightProfile>> {
  return {
    gk: {
      roleKey: "gk",
      department: "goalkeeper",
      abilityWeights: {
        "goalkeeping.reflexes": 1,
      },
    },
    synthetic: {
      roleKey: "synthetic",
      department: "attack",
      abilityWeights: {
        "technical.finishing": 1,
      },
    },
  };
}

/**
 * Builds a test player with all abilities set to the same value.
 */
function makePlayer(id: PlayerId, ability: number): Player {
  const abilities = abilitySet(ability);

  return {
    id,
    firstName: "Override",
    lastName: String(id),
    birthDate: gameDate(10_000),
    naturalPositions: ["cm"],
    abilities,
    potential: abilities,
  };
}

/**
 * Builds a complete 25-attribute ability object for override test players.
 */
function abilitySet(value: number): PlayerAbilities {
  const ability = abilityValue(value);

  return {
    technical: {
      finishing: ability,
      passing: ability,
      longPassing: ability,
      crossing: ability,
      dribbling: ability,
      technique: ability,
      tackling: ability,
      penalties: ability,
      freeKicks: ability,
    },
    physical: {
      pace: ability,
      strength: ability,
      stamina: ability,
      agility: ability,
      heading: ability,
    },
    mental: {
      positioning: ability,
      vision: ability,
      anticipation: ability,
      composure: ability,
      determination: ability,
      leadership: ability,
    },
    goalkeeping: {
      reflexes: ability,
      handling: ability,
      rushingOut: ability,
      goalkeeperPositioning: ability,
      footwork: ability,
    },
  };
}

/**
 * Finds one fixture by ID in explicit result order.
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
 * Counts durable assist IDs across simulated fixture reports.
 */
function countAssists(fixtures: readonly Fixture[]): number {
  let total = 0;

  for (const fixture of fixtures) {
    const events = fixture.result?.report?.events;

    if (events === undefined) {
      continue;
    }

    for (const event of events) {
      if (event.type === "goal" && event.assistPlayerId !== undefined) {
        total += 1;
      }
    }
  }

  return total;
}

/**
 * Counts durable goalkeeper-save IDs across simulated fixture reports.
 */
function countSaves(fixtures: readonly Fixture[]): number {
  let total = 0;

  for (const fixture of fixtures) {
    const events = fixture.result?.report?.events;

    if (events === undefined) {
      continue;
    }

    for (const event of events) {
      if (event.type === "save") {
        total += 1;
      }
    }
  }

  return total;
}

/**
 * Asserts a typed season simulation failure and its machine-readable code.
 */
function assertSimulateSeasonError(action: () => void, code: SimulateSeasonError["code"]): void {
  assert.throws(
    action,
    (error: unknown) => error instanceof SimulateSeasonError && error.code === code,
  );
}
