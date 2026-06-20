import assert from "node:assert/strict";
import { test } from "vitest";

import {
  abilityValue,
  clubId,
  competitionId,
  gameDate,
  playerId,
  seasonId,
  type ClubId,
  type Fixture,
  type FixtureId,
  type Player,
  type PlayerAbilities,
  type PlayerId,
  type SelectedLineup,
  type TacticSetup,
} from "@game/domain";
import { fromISO } from "@game/shared";

import {
  simulateSeason,
  SimulateSeasonError,
  type SimulateSeasonInput,
  type SimulateSeasonSetupOverride,
  type SimulateSeasonTeamInput,
} from "./simulate-season.ts";
import type { RoleWeightProfile } from "../match-engine/index.ts";

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
