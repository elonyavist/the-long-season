import assert from "node:assert/strict";
import { test } from "vitest";
import { toISO } from "@game/shared";

import { createFakeLeagueSystem } from "./league-system.ts";
import { FAKE_LINEUP_SIZE, FAKE_PLAYERS_PER_CLUB } from "./fake-clubs.ts";
import {
  GENERATED_SQUAD_IDENTITY_KEYS,
  assignGeneratedSquadIdentities,
} from "./squad-identity.ts";

/**
 * Fake league-system tests lock content-owned configuration without importing
 * engine contracts into the content package.
 */

test("fake league exposes a bounded deterministic fitness multiplier curve", () => {
  const league = createFakeLeagueSystem();
  const curve = league.stateMultiplierCurves.fitness;

  assert.deepEqual(curve, [
    { maxValueInclusive: 39, multiplier: 0.88 },
    { maxValueInclusive: 59, multiplier: 0.94 },
    { maxValueInclusive: 79, multiplier: 0.98 },
    { maxValueInclusive: 100, multiplier: 1 },
  ]);
});

test("fake league keeps all generated players fully fit initially", () => {
  const league = createFakeLeagueSystem();

  for (const playerId of league.playerIds) {
    const playerState = league.playerStates[playerId];

    assert.notEqual(playerState, undefined);
    assert.equal(Number(playerState?.fitness), 100);
  }
});

test("fake league passes the world seed into generated squads", () => {
  const first = createFakeLeagueSystem({ worldSeed: "career-world-a" });
  const second = createFakeLeagueSystem({ worldSeed: "career-world-b" });
  const firstPlayerId = first.playerIds[0];

  assert.ok(firstPlayerId !== undefined);
  assert.equal(second.playerIds[0], firstPlayerId);
  assert.notDeepEqual(first.players[firstPlayerId], second.players[firstPlayerId]);
});

test("fake league assigns every squad identity two or three times", () => {
  const worldSeed = "career-balanced-identities";
  const league = createFakeLeagueSystem({ worldSeed });
  const assignments = assignGeneratedSquadIdentities({
    seed: worldSeed,
    competitionIdentityKey: league.competition.id,
    orderedClubIds: league.clubIds,
  });
  const counts = new Map(GENERATED_SQUAD_IDENTITY_KEYS.map((key) => [key, 0]));

  for (const identity of assignments.values()) {
    const currentCount = counts.get(identity.key);
    assert.ok(currentCount !== undefined);
    counts.set(identity.key, currentCount + 1);
  }

  assert.deepEqual(
    [...counts.values()].toSorted((left, right) => left - right),
    [2, 2, 2, 2, 2, 2, 3, 3],
  );
});

test("fake league facade exposes a coherent generated world bundle", () => {
  const league = createFakeLeagueSystem({ worldSeed: "career-world-a" });
  const firstClubId = league.clubIds[0];

  assert.ok(firstClubId !== undefined);
  assert.equal(league.competition.clubIds, league.clubIds);
  assert.equal(league.clubsById[firstClubId]?.playerIds.length, FAKE_PLAYERS_PER_CLUB);
  assert.equal(league.lineupsByClubId[firstClubId]?.length, FAKE_LINEUP_SIZE);
  assert.equal(toISO(league.seasonStartDate), "2026-08-01");
  assert.equal(league.tableRules.pointsForWin, 3);
  assert.equal(league.matchEngineConfig.minuteCount, 90);
  assert.deepEqual(league.clubFinanceState.clubIds, league.clubIds);
  assert.equal(league.competition.seasonDistribution?.prizes.length, league.clubIds.length);
  assert.deepEqual(Object.keys(league.roleWeights).sort(), ["attacker", "defender", "gk", "midfielder"]);
});

test("current third division owns its exact regulation and discipline rules", () => {
  const league = createFakeLeagueSystem();

  assert.deepEqual(league.competition.matchRules, {
    maximumSubstitutions: 5,
    substitutionWindowLimit: null,
    allowsPlayerReentry: false,
    yellowCardAccumulationThreshold: 5,
    straightRedSuspensionMatches: 3,
    secondYellowSuspensionMatches: 1,
    yellowAccumulationSuspensionMatches: 1,
  });
});

test("fake league generates reserves without changing default lineup size", () => {
  const league = createFakeLeagueSystem();
  const firstClubId = league.clubIds[0];
  assert.ok(firstClubId !== undefined);

  const firstClub = league.clubsById[firstClubId];
  const firstLineup = league.lineupsByClubId[firstClubId];

  assert.ok(firstClub !== undefined);
  assert.ok(firstLineup !== undefined);
  const firstLineupSlot = firstLineup[0];
  assert.ok(firstLineupSlot !== undefined);

  assert.equal(firstClub.playerIds.length, FAKE_PLAYERS_PER_CLUB);
  assert.equal(firstLineup.length, FAKE_LINEUP_SIZE);
  assert.equal(firstClub.playerIds.includes(firstLineupSlot.playerId), true);
  assert.equal(firstLineup.some((slot) => String(slot.playerId).endsWith("-12")), false);
  assert.equal(firstClub.playerIds.some((playerId) => String(playerId).endsWith("-12")), true);
});
