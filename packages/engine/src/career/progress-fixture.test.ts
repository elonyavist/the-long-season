import assert from "node:assert/strict";
import { test } from "vitest";

import {
  CAREER_STATE_SCHEMA_VERSION,
  clubId,
  competitionId,
  createCareerState,
  createMarketState,
  fixtureId,
  gameDate,
  playerId,
  saveId,
  seasonId,
  type CareerState,
  type Club,
  type ClubId,
  type Fixture,
  type GameState,
} from "@game/domain";

import type { MatchEngineConfig, MatchTeamContext } from "../match-engine/index.ts";
import { progressNextCareerFixture } from "./progress-fixture.ts";

/**
 * Career progression tests prove one selected-club fixture can be simulated and
 * applied without writing storage or advancing unrelated fixtures.
 */

test("progressNextCareerFixture simulates and applies the next selected-club fixture without mutating input", () => {
  const selectedClubId = clubId("club:selected");
  const otherClubId = clubId("club:other");
  const selectedFixtureId = fixtureId("fixture:000001");
  const careerState = careerStateFixture({
    selectedClubId,
    clubs: [clubFixture(selectedClubId), clubFixture(otherClubId)],
    fixtures: [fixtureFixture(selectedFixtureId, selectedClubId, otherClubId)],
  });
  const before = JSON.stringify(careerState);

  const result = progressNextCareerFixture({
    careerState,
    teamsByClubId: {
      [selectedClubId]: teamContextFixture(selectedClubId, 12),
      [otherClubId]: teamContextFixture(otherClubId, 10),
    } as Record<ClubId, MatchTeamContext>,
    matchEngineConfig: matchEngineConfigFixture(),
  });

  assert.equal(result.status, "advanced");
  assert.equal(JSON.stringify(careerState), before);
  if (result.status === "advanced") {
    assert.equal(result.fixtureId, selectedFixtureId);
    assert.equal(result.report.fixtureId, selectedFixtureId);
    assert.equal(result.fixtureBefore.result, undefined);
    assert.equal(result.fixtureAfter.result?.played, true);
    assert.equal(result.careerState.gameState.fixtures[selectedFixtureId]?.result?.played, true);
    assert.equal(result.careerState.gameState.calendar.currentDate, careerState.gameState.calendar.currentDate);
  }
});

test("progressNextCareerFixture is deterministic for the same state and team contexts", () => {
  const selectedClubId = clubId("club:selected");
  const otherClubId = clubId("club:other");
  const careerState = careerStateFixture({
    selectedClubId,
    clubs: [clubFixture(selectedClubId), clubFixture(otherClubId)],
    fixtures: [fixtureFixture(fixtureId("fixture:000001"), selectedClubId, otherClubId)],
  });
  const input = {
    careerState,
    teamsByClubId: {
      [selectedClubId]: teamContextFixture(selectedClubId, 12),
      [otherClubId]: teamContextFixture(otherClubId, 10),
    } as Record<ClubId, MatchTeamContext>,
    matchEngineConfig: matchEngineConfigFixture(),
  };

  assert.deepEqual(progressNextCareerFixture(input), progressNextCareerFixture(input));
});

test("progressNextCareerFixture returns none when there is no fixture to advance", () => {
  const selectedClubId = clubId("club:selected");
  const otherClubId = clubId("club:other");
  const careerState = careerStateFixture({
    selectedClubId,
    clubs: [clubFixture(selectedClubId), clubFixture(otherClubId)],
    fixtures: [fixtureFixture(fixtureId("fixture:000001"), selectedClubId, otherClubId, true)],
  });

  const result = progressNextCareerFixture({
    careerState,
    teamsByClubId: {
      [selectedClubId]: teamContextFixture(selectedClubId, 12),
      [otherClubId]: teamContextFixture(otherClubId, 10),
    } as Record<ClubId, MatchTeamContext>,
    matchEngineConfig: matchEngineConfigFixture(),
  });

  assert.deepEqual(result, {
    status: "none",
    careerState,
  });
});

test("progressNextCareerFixture reports missing team context without simulating", () => {
  const selectedClubId = clubId("club:selected");
  const otherClubId = clubId("club:other");
  const fixtureToPlayId = fixtureId("fixture:000001");
  const careerState = careerStateFixture({
    selectedClubId,
    clubs: [clubFixture(selectedClubId), clubFixture(otherClubId)],
    fixtures: [fixtureFixture(fixtureToPlayId, selectedClubId, otherClubId)],
  });

  const result = progressNextCareerFixture({
    careerState,
    teamsByClubId: {
      [selectedClubId]: teamContextFixture(selectedClubId, 12),
    } as Record<ClubId, MatchTeamContext>,
    matchEngineConfig: matchEngineConfigFixture(),
  });

  assert.deepEqual(result, {
    status: "invalid",
    reason: "missing_away_team_context",
    fixtureId: fixtureToPlayId,
    careerState,
  });
});

function careerStateFixture(input: {
  readonly selectedClubId: ClubId;
  readonly clubs: readonly Club[];
  readonly fixtures: readonly Fixture[];
}): CareerState {
  return createCareerState({
    saveId: saveId("save:career-progress-fixture"),
    schemaVersion: CAREER_STATE_SCHEMA_VERSION,
    selectedClubId: input.selectedClubId,
    gameState: gameStateFixture(input.clubs, input.fixtures),
    marketState: createMarketState({
      clubBudgets: {},
      clubBudgetIds: [],
    }),
    transferHistory: [],
  });
}

function gameStateFixture(clubs: readonly Club[], fixtures: readonly Fixture[]): GameState {
  const clubsById: Partial<Record<ClubId, Club>> = {};
  const clubIds: ClubId[] = [];
  const fixturesById: Partial<Record<Fixture["id"], Fixture>> = {};
  const fixtureIds: Fixture["id"][] = [];

  for (const club of clubs) {
    clubsById[club.id] = club;
    clubIds.push(club.id);
  }

  for (const fixture of fixtures) {
    fixturesById[fixture.id] = fixture;
    fixtureIds.push(fixture.id);
  }

  return {
    meta: {
      seed: "career-progress-test",
      rngAlgorithmVersion: "test",
      saveSchemaVersion: 1,
    },
    calendar: {
      currentDate: gameDate(20_000),
      currentSeasonId: seasonId("season:test"),
    },
    players: {},
    playerIds: [],
    playerStates: {},
    clubs: clubsById as GameState["clubs"],
    clubIds,
    fixtures: fixturesById as GameState["fixtures"],
    fixtureIds,
  };
}

function clubFixture(id: ClubId): Club {
  return {
    id,
    name: String(id),
    shortName: String(id).slice("club:".length).toUpperCase(),
    category: "third_division",
    reputation: 5,
    playerIds: [],
  };
}

function fixtureFixture(id: Fixture["id"], homeClubId: ClubId, awayClubId: ClubId, played = false): Fixture {
  return {
    id,
    competitionId: competitionId("competition:test"),
    seasonId: seasonId("season:test"),
    roundNumber: 1,
    date: gameDate(20_000),
    homeClubId,
    awayClubId,
    ...(played
      ? {
          result: {
            played: true,
            homeGoals: 1,
            awayGoals: 0,
          },
        }
      : {}),
  };
}

function teamContextFixture(clubIdValue: ClubId, strength: number): MatchTeamContext {
  const playerPrefix = String(clubIdValue).slice("club:".length);

  return {
    clubId: clubIdValue,
    lineup: [
      {
        slotId: "slot:01",
        playerId: playerId(`player:${playerPrefix}-01`),
        roleKey: "gk",
      },
      {
        slotId: "slot:02",
        playerId: playerId(`player:${playerPrefix}-02`),
        roleKey: "starter",
      },
    ],
    strength: {
      attack: strength,
      midfield: strength,
      defense: strength,
      goalkeeper: strength,
      overall: strength,
    },
    tacticalDistribution: {
      directness: 0.5,
      pressing: 0.5,
      width: 0.5,
      risk: 0.5,
    },
  };
}

function matchEngineConfigFixture(): MatchEngineConfig {
  return {
    minuteCount: 90,
    rates: {
      baseOpportunityRatePerMinute: 0.09,
      maxOpportunityRatePerMinute: 0.24,
    },
    conversionBands: [
      {
        bandKey: "low",
        minQualityInclusive: 0,
        maxQualityExclusive: 0.45,
        goalProbability: 0.105,
      },
      {
        bandKey: "medium",
        minQualityInclusive: 0.45,
        maxQualityExclusive: 0.65,
        goalProbability: 0.2,
      },
      {
        bandKey: "high",
        minQualityInclusive: 0.65,
        maxQualityExclusive: 1.01,
        goalProbability: 0.35,
      },
    ],
    homeAdvantageFactor: 1.1,
    tacticalDistributionCaps: {
      directness: { minInclusive: 0, maxInclusive: 1 },
      pressing: { minInclusive: 0, maxInclusive: 1 },
      width: { minInclusive: 0, maxInclusive: 1 },
      risk: { minInclusive: 0, maxInclusive: 1 },
    },
  };
}
