import assert from "node:assert/strict";
import { test } from "vitest";

import {
  CAREER_STATE_SCHEMA_VERSION,
  abilityValue,
  clubId,
  createCareerState,
  gameDate,
  playerId,
  saveId,
  seasonId,
  stateValue,
  type CareerState,
  type Club,
  type ClubCategory,
  type ClubId,
  type GameState,
  type Player,
  type PlayerAbilities,
} from "@game/domain";

import {
  completedResultPyramidCoordinate,
  deriveClubRosterStrength,
  deriveClubSeasonTierUpdate,
} from "./club-season-tier.ts";

test("deriveClubRosterStrength uses a balanced XI before the useful bench", () => {
  const fixture = rosterFixture("club:balanced", [
    ["goalkeeper", 6, 1],
    ["center_back", 6, 4],
    ["central_midfielder", 6, 4],
    ["striker", 20, 8],
  ]);

  const strength = deriveClubRosterStrength(fixture.club, fixture.players);

  assert.equal(round(strength.bestXiStrength), round(94 / 11));
  assert.equal(round(strength.usefulBenchStrength), 20);
  assert.equal(round(strength.rawRosterStrength), 11);
});

test("deriveClubSeasonTierUpdate freezes exact 4/4/6/4 buckets and bounded reputation", () => {
  const careerState = divisionCareerFixture();
  const completedResultByClubId = Object.fromEntries(
    careerState.gameState.clubIds.map((id, index) => [
      id,
      {
        previousCategory: "first_division" as const,
        finalPosition: index + 1,
        clubCount: 18,
        champion: index === 0,
      },
    ]),
  );

  const update = deriveClubSeasonTierUpdate({
    careerState,
    nextSeasonId: seasonId("season:0002"),
    completedResultByClubId,
  });
  const tiers = update.facts.map((fact) => fact.tier);

  assert.equal(tiers.filter((tier) => tier === "title_contender").length, 4);
  assert.equal(tiers.filter((tier) => tier === "playoff_contender").length, 4);
  assert.equal(tiers.filter((tier) => tier === "mid_table").length, 6);
  assert.equal(tiers.filter((tier) => tier === "survival").length, 4);
  assert.equal(update.tierState.seasonId, "season:0002");
  assert.ok(update.facts.every(
    (fact) => Math.abs(fact.nextReputation - fact.previousReputation) <= 2,
  ));
  assert.deepEqual(
    update.facts.map((fact) => fact.clubId),
    [...careerState.gameState.clubIds].reverse(),
  );
});

test("deriveClubSeasonTierUpdate carries an incomplete division without reading empty rosters", () => {
  const id = clubId("club:report-only");
  const careerState = createCareerState({
    saveId: saveId("save:report-only-tier"),
    schemaVersion: CAREER_STATE_SCHEMA_VERSION,
    selectedClubId: id,
    gameState: gameStateFixture(
      [clubFixture(id, "second_division", 11, [])],
      [],
    ),
    transferHistory: [],
  });

  const update = deriveClubSeasonTierUpdate({
    careerState,
    nextSeasonId: seasonId("season:0002"),
    completedResultByClubId: {},
  });

  assert.equal(update.facts[0]?.calculation, "carried_forward");
  assert.equal(update.facts[0]?.rawRosterStrength, null);
  assert.equal(update.facts[0]?.nextReputation, 11);
  assert.equal(
    update.tierState.tierByClubId[id],
    careerState.clubCompetitiveTierState.tierByClubId[id],
  );
});

test("completedResultPyramidCoordinate orders promoted clubs after the division above", () => {
  assert.equal(completedResultPyramidCoordinate({
    previousCategory: "first_division",
    finalPosition: 18,
    clubCount: 18,
    champion: false,
  }), 17);
  assert.equal(completedResultPyramidCoordinate({
    previousCategory: "second_division",
    finalPosition: 1,
    clubCount: 18,
    champion: true,
    movement: "promoted",
  }), 18);
  assert.equal(completedResultPyramidCoordinate({
    previousCategory: "third_division",
    finalPosition: 1,
    clubCount: 18,
    champion: true,
    movement: "promoted",
  }), 36);
});

function divisionCareerFixture(): CareerState {
  const clubs: Club[] = [];
  const players: Player[] = [];
  for (let index = 0; index < 18; index += 1) {
    const numericId = String(index + 1).padStart(2, "0");
    const fixture = rosterFixture(`club:tier-${numericId}`, [
      ["goalkeeper", 3 + index, 1],
      ["center_back", 3 + index, 4],
      ["central_midfielder", 3 + index, 4],
      ["striker", 3 + index, 2],
    ]);
    clubs.push(fixture.club);
    players.push(...Object.values(fixture.players));
  }
  const gameState = gameStateFixture(clubs, players);
  return createCareerState({
    saveId: saveId("save:club-season-tier"),
    schemaVersion: CAREER_STATE_SCHEMA_VERSION,
    selectedClubId: gameState.clubIds[0]!,
    gameState,
    transferHistory: [],
  });
}

function rosterFixture(
  rawClubId: string,
  groups: readonly [NonNullable<Player["primaryRole"]>, number, number][],
): { readonly club: Club; readonly players: GameState["players"] } {
  const id = clubId(rawClubId);
  const players = {} as Record<ReturnType<typeof playerId>, Player>;
  const playerIds: ReturnType<typeof playerId>[] = [];
  let sequence = 0;
  for (const [role, rating, count] of groups) {
    for (let index = 0; index < count; index += 1) {
      sequence += 1;
      const idPart = String(sequence).padStart(2, "0");
      const currentPlayerId = playerId(`player:${rawClubId}:${idPart}`);
      players[currentPlayerId] = playerFixture(currentPlayerId, role, rating);
      playerIds.push(currentPlayerId);
    }
  }
  return {
    club: clubFixture(id, "first_division", 14, playerIds),
    players,
  };
}

function gameStateFixture(clubs: readonly Club[], players: readonly Player[]): GameState {
  const clubIds = clubs.map((club) => club.id);
  const playersById = Object.fromEntries(players.map((player) => [player.id, player])) as GameState["players"];
  return {
    meta: {
      seed: "club-season-tier-test",
      rngAlgorithmVersion: "test",
      saveSchemaVersion: 1,
    },
    calendar: {
      currentDate: gameDate(20_000),
      currentSeasonId: seasonId("season:0001"),
    },
    players: playersById,
    playerIds: players.map((player) => player.id),
    playerStates: Object.fromEntries(players.map((player) => [
      player.id,
      { fitness: stateValue(100), form: stateValue(50), morale: stateValue(50) },
    ])) as GameState["playerStates"],
    clubs: Object.fromEntries(clubs.map((club) => [club.id, club])) as GameState["clubs"],
    clubIds,
    fixtures: {},
    fixtureIds: [],
  };
}

function clubFixture(
  id: ClubId,
  category: ClubCategory,
  reputation: number,
  playerIds: readonly Player["id"][],
): Club {
  return {
    id,
    name: String(id),
    shortName: String(id).slice(-8),
    category,
    reputation,
    playerIds,
  };
}

function playerFixture(
  id: Player["id"],
  role: NonNullable<Player["primaryRole"]>,
  rating: number,
): Player {
  return {
    id,
    firstName: "Tier",
    lastName: String(id),
    birthDate: gameDate(10_000),
    naturalPositions: role === "goalkeeper"
      ? ["gk"]
      : role === "center_back"
        ? ["cb"]
        : role === "central_midfielder"
          ? ["cm"]
          : ["st"],
    primaryRole: role,
    abilities: abilitySet(rating),
    potential: abilitySet(rating),
  };
}

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

function round(value: number): number {
  return Math.round(value * 1_000_000) / 1_000_000;
}
