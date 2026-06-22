import assert from "node:assert/strict";
import { test } from "vitest";

import { clubId, gameDate, seasonId, type ClubId } from "@game/domain";
import { fromISO } from "@game/shared";

import {
  generateInitialYouthAcademies,
  generateSeasonalYouthIntakePlayers,
  INITIAL_YOUTH_PLAYERS_PER_CLUB,
  type InitialYouthAcademyClubContext,
  YOUTH_INTAKE_MAX_PLAYERS_PER_CLUB,
  YOUTH_INTAKE_MIN_PLAYERS_PER_CLUB,
} from "./initial-youth-academies.ts";

const CAREER_START_EPOCH_DAY = fromISO("2026-08-01");

/** Tests for deterministic initial youth academy generation. */

test("generateInitialYouthAcademies creates exactly eight youth players per club", () => {
  const result = generateInitialYouthAcademies(input("academy-world"));

  assert.equal(result.playerIds.length, 16);
  assert.equal(result.youthAcademyState.clubRosterIds.length, 2);

  for (const rosterId of result.youthAcademyState.clubRosterIds) {
    assert.equal(result.youthAcademyState.clubRosters[rosterId]?.playerIds.length, INITIAL_YOUTH_PLAYERS_PER_CLUB);
  }
});

test("generateInitialYouthAcademies is deterministic for the same seed", () => {
  assert.deepEqual(generateInitialYouthAcademies(input("stable-academy")), generateInitialYouthAcademies(input("stable-academy")));
});

test("generateInitialYouthAcademies changes player identities for different seeds", () => {
  const first = generateInitialYouthAcademies(input("academy-a"));
  const second = generateInitialYouthAcademies(input("academy-b"));
  const firstNames = first.playerIds.map((playerId) => `${first.players[playerId]?.firstName} ${first.players[playerId]?.lastName}`);
  const secondNames = second.playerIds.map((playerId) => `${second.players[playerId]?.firstName} ${second.players[playerId]?.lastName}`);

  assert.notDeepEqual(firstNames, secondNames);
});

test("generateInitialYouthAcademies keeps ages inside the 15..19 range", () => {
  const result = generateInitialYouthAcademies(input("age-academy"));

  for (const playerId of result.playerIds) {
    const player = result.players[playerId];
    assert.ok(player !== undefined);
    const age = Math.floor((CAREER_START_EPOCH_DAY - Number(player.birthDate)) / 365);
    assert.equal(age >= 15, true, player.id);
    assert.equal(age <= 19, true, player.id);
  }
});

test("generateInitialYouthAcademies keeps names varied inside each club", () => {
  const result = generateInitialYouthAcademies(input("name-academy"));

  for (const clubIdValue of result.youthAcademyState.clubRosterIds) {
    const roster = result.youthAcademyState.clubRosters[clubIdValue];
    assert.ok(roster !== undefined);
    const fullNames = roster.playerIds.map((playerId) => `${result.players[playerId]?.firstName} ${result.players[playerId]?.lastName}`);
    const lastNames = roster.playerIds.map((playerId) => result.players[playerId]?.lastName);

    assert.equal(new Set(fullNames).size, fullNames.length);
    assert.equal(new Set(lastNames).size, lastNames.length);
  }
});

test("generateInitialYouthAcademies creates role-coherent lower-division youth players", () => {
  const result = generateInitialYouthAcademies(input("role-academy"));

  for (const playerId of result.playerIds) {
    const player = result.players[playerId];
    assert.ok(player !== undefined);
    const position = player.naturalPositions[0];
    assert.ok(position !== undefined);

    if (position !== "gk") {
      assert.equal(Number(player.abilities.goalkeeping.reflexes) <= 4, true, player.id);
    }

    if (position === "cb" || position === "rb" || position === "lb") {
      assert.equal(Number(player.abilities.technical.finishing) <= 8, true, player.id);
    }
  }
});

test("generateInitialYouthAcademies attaches lifecycle rows to active youth rosters", () => {
  const result = generateInitialYouthAcademies(input("lifecycle-academy"));

  for (const playerId of result.youthAcademyState.playerLifecycleIds) {
    const lifecycle = result.youthAcademyState.playerLifecycle[playerId];
    assert.ok(lifecycle !== undefined);
    assert.equal(lifecycle.status, "academy");
    assert.equal(lifecycle.academyEntrySeasonId, "season:demo-001");
    assert.equal(lifecycle.academyEntryDate, gameDate(CAREER_START_EPOCH_DAY));
  }
});

test("generateSeasonalYouthIntakePlayers creates a bounded annual intake", () => {
  const result = generateSeasonalYouthIntakePlayers(seasonalInput("annual-intake"));

  assert.equal(result.generatedPlayers.length >= YOUTH_INTAKE_MIN_PLAYERS_PER_CLUB, true);
  assert.equal(result.generatedPlayers.length <= YOUTH_INTAKE_MAX_PLAYERS_PER_CLUB, true);
});

test("generateSeasonalYouthIntakePlayers creates 15..17 year old players", () => {
  const result = generateSeasonalYouthIntakePlayers(seasonalInput("young-annual-intake"));

  for (const generated of result.generatedPlayers) {
    const age = Math.floor((CAREER_START_EPOCH_DAY - Number(generated.player.birthDate)) / 365);
    assert.equal(age >= 15, true, generated.player.id);
    assert.equal(age <= 17, true, generated.player.id);
  }
});

test("generateSeasonalYouthIntakePlayers is deterministic and avoids routine rare prodigies", () => {
  const inputValue = seasonalInput("stable-annual-intake");
  const result = generateSeasonalYouthIntakePlayers(inputValue);

  assert.deepEqual(result, generateSeasonalYouthIntakePlayers(inputValue));
  assert.equal(result.generatedPlayers.some((generated) => generated.archetypeKey === "rare_prodigy"), false);
  assert.equal(new Set(result.generatedPlayers.map((generated) => generated.player.id)).size, result.generatedPlayers.length);
});

function input(worldSeed: string): Parameters<typeof generateInitialYouthAcademies>[0] {
  const firstClub = clubId("club:province-01");
  const secondClub = clubId("club:province-02");

  return {
    worldSeed,
    seasonId: seasonId("season:demo-001"),
    referenceDate: gameDate(CAREER_START_EPOCH_DAY),
    clubIds: [firstClub, secondClub],
    clubContexts: clubContexts([firstClub, secondClub]),
  };
}

function clubContexts(clubIds: readonly ClubId[]): Parameters<typeof generateInitialYouthAcademies>[0]["clubContexts"] {
  const contexts: Partial<Record<ClubId, InitialYouthAcademyClubContext>> = {};

  for (const clubIdValue of clubIds) {
    contexts[clubIdValue] = {
      category: "third_division",
      reputation: clubIdValue === "club:province-01" ? 8 : 4,
    };
  }

  return contexts as Parameters<typeof generateInitialYouthAcademies>[0]["clubContexts"];
}

function seasonalInput(worldSeed: string): Parameters<typeof generateSeasonalYouthIntakePlayers>[0] {
  return {
    worldSeed,
    seasonId: seasonId("season:demo-002"),
    referenceDate: gameDate(CAREER_START_EPOCH_DAY),
    clubId: clubId("club:province-01"),
    clubContext: {
      category: "third_division",
      reputation: 8,
    },
  };
}
