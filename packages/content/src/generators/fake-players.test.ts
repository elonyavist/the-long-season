import assert from "node:assert/strict";
import { test } from "vitest";

import type { ClubId, Player } from "@game/domain";
import { fromISO } from "@game/shared";

import { fakePlayerId, generateFakeClubs } from "./fake-clubs.ts";
import { generateFakePlayersForClubs } from "./fake-players.ts";
import { getGeneratedPlayerArchetype, type GeneratedPlayerArchetypeKey } from "./player-archetypes.ts";
import { primaryRoleForPosition } from "./player-role-identity.ts";

const CAREER_START_EPOCH_DAY = fromISO("2026-08-01");

/**
 * Fake player tests lock the deterministic content hierarchy without importing
 * engine strength derivation into the content package.
 */

test("fake players are deterministic for the same club list", () => {
  const clubs = generateFakeClubs();
  const first = generateFakePlayersForClubs(clubs.clubIds);
  const second = generateFakePlayersForClubs(clubs.clubIds);

  assert.deepEqual(first, second);
});

test("different fake player seeds produce visible squad variation with stable IDs", () => {
  const clubs = generateFakeClubs();
  const first = generateFakePlayersForClubs(clubs.clubIds, { seed: "world-a" });
  const second = generateFakePlayersForClubs(clubs.clubIds, { seed: "world-b" });
  const playerId = fakePlayerId(1, 10);
  const firstPlayer = requiredPlayer(first.players[playerId]);
  const secondPlayer = requiredPlayer(second.players[playerId]);

  assert.equal(first.playerIds[9], playerId);
  assert.equal(second.playerIds[9], playerId);
  assert.notEqual(`${firstPlayer.firstName} ${firstPlayer.lastName}`, `${secondPlayer.firstName} ${secondPlayer.lastName}`);
  assert.notEqual(Number(firstPlayer.abilities.technical.finishing), Number(secondPlayer.abilities.technical.finishing));
});

test("fake player IDs stay stable while display names become fictional names", () => {
  const clubs = generateFakeClubs();
  const generated = generateFakePlayersForClubs(clubs.clubIds);
  const firstPlayer = requiredPlayer(generated.players[fakePlayerId(1, 1)]);
  const firstIdentity = generated.playerIdentities[firstPlayer.id];

  assert.equal(generated.playerIds[0], fakePlayerId(1, 1));
  assert.equal(firstIdentity?.firstName, firstPlayer.firstName);
  assert.equal(firstIdentity?.lastName, firstPlayer.lastName);
  assert.doesNotMatch(`${firstPlayer.firstName} ${firstPlayer.lastName}`, /^Player[0-9]{2} No[0-9]{2}$/);
});

test("third-division fake content is mostly domestic but not entirely domestic", () => {
  const clubs = generateFakeClubs();
  const generated = generateFakePlayersForClubs(clubs.clubIds);
  const identities = Object.values(generated.playerIdentities);
  const domesticCount = identities.filter((identity) => identity.nationality === "italian").length;

  assert.equal(domesticCount > identities.length * 0.65, true);
  assert.equal(domesticCount < identities.length, true);
});

test("fake player generation avoids duplicate full names and repeated surnames inside one club", () => {
  const clubs = generateFakeClubs();
  const generated = generateFakePlayersForClubs(clubs.clubIds, { seed: "name-variety" });

  for (const clubId of clubs.clubIds) {
    const club = clubs.clubsById[clubId];
    assert.ok(club !== undefined);
    const fullNames = playerNamesForIds(generated, club.playerIds).map((name) => `${name.firstName} ${name.lastName}`);
    const lastNames = playerNamesForIds(generated, club.playerIds).map((name) => name.lastName);

    assert.equal(new Set(fullNames).size, fullNames.length, `${club.shortName} full names`);
    assert.equal(new Set(lastNames).size, lastNames.length, `${club.shortName} last names`);
    assert.equal(new Set(lastNames).size >= 21, true, `${club.shortName} surname variety`);
  }
});

test("fake player generation limits repeated surnames across one generated league", () => {
  const clubs = generateFakeClubs();
  const generated = generateFakePlayersForClubs(clubs.clubIds, { seed: "name-variety" });
  const namesByLastName = new Map<string, string[]>();

  for (const playerId of generated.playerIds) {
    const player = requiredPlayer(generated.players[playerId]);
    const firstNames = namesByLastName.get(player.lastName) ?? [];
    firstNames.push(player.firstName);
    namesByLastName.set(player.lastName, firstNames);
  }

  for (const [lastName, firstNames] of namesByLastName) {
    assert.equal(firstNames.length <= 2, true, `${lastName} appears ${firstNames.length} times`);
    assert.equal(new Set(firstNames).size, firstNames.length, `${lastName} repeated with duplicate first name`);
  }
});

test("fake player generation assigns archetypes with coherent age and potential", () => {
  const clubs = generateFakeClubs();
  const generated = generateFakePlayersForClubs(clubs.clubIds, { seed: "archetype-world" });

  for (const playerId of generated.playerIds) {
    const player = requiredPlayer(generated.players[playerId]);
    const archetypeKey = generated.playerArchetypes[playerId];
    assert.ok(archetypeKey !== undefined);
    const archetype = getGeneratedPlayerArchetype(archetypeKey);
    const age = Math.floor((CAREER_START_EPOCH_DAY - Number(player.birthDate)) / 365);
    const currentFinishing = Number(player.abilities.technical.finishing);
    const potentialFinishing = Number(player.potential.technical.finishing);

    assert.equal(age >= archetype.ageYears.minInclusive, true);
    assert.equal(age <= archetype.ageYears.maxInclusive, true);
    assert.equal(potentialFinishing >= currentFinishing, true);
  }
});

test("rare prodigies are possible across generated career worlds but not guaranteed", () => {
  const clubs = generateFakeClubs();
  const generatedWithProdigy = generateFakePlayersForClubs(clubs.clubIds, { seed: "wonderkid-sample-0" });
  const generatedWithoutProdigy = generateFakePlayersForClubs(clubs.clubIds, { seed: "wonderkid-sample-1" });

  assert.equal(hasArchetype(generatedWithProdigy.playerArchetypes, "rare_prodigy"), true);
  assert.equal(hasArchetype(generatedWithoutProdigy.playerArchetypes, "rare_prodigy"), false);
});

test("budgeted archetypes come only from league-level rarity assignments", () => {
  const clubs = generateFakeClubs();
  const generated = generateFakePlayersForClubs(clubs.clubIds, { seed: "rarity-budget-world" });
  const assignments = Object.values(generated.playerRarityAssignments);
  const assignedArchetypeCounts = new Map<GeneratedPlayerArchetypeKey, number>();

  for (const assignment of assignments) {
    assignedArchetypeCounts.set(assignment.archetypeKey, (assignedArchetypeCounts.get(assignment.archetypeKey) ?? 0) + 1);
  }

  assert.equal(assignments.length > 0, true);
  assert.equal(assignments.length <= 10, true);

  for (const playerId of generated.playerIds) {
    const archetypeKey = generated.playerArchetypes[playerId];
    assert.ok(archetypeKey !== undefined);
    if (archetypeKey === "category_star" || archetypeKey === "veteran_drop_down" || archetypeKey === "serious_prospect" || archetypeKey === "rare_prodigy") {
      assert.ok(generated.playerRarityAssignments[playerId] !== undefined, `${playerId} ${archetypeKey}`);
    }
  }

  assert.equal((assignedArchetypeCounts.get("serious_prospect") ?? 0) >= 2, true);
  assert.equal((assignedArchetypeCounts.get("rare_prodigy") ?? 0) <= 1, true);
});

test("first-division top-club context creates a more international squad pool", () => {
  const clubs = generateFakeClubs();
  const clubContexts = Object.fromEntries(
    clubs.clubIds.map((clubId) => [
      clubId,
      {
        category: "first_division",
        reputation: 9,
      },
    ]),
  ) as Record<ClubId, { readonly category: "first_division"; readonly reputation: 9 }>;
  const generated = generateFakePlayersForClubs(clubs.clubIds, { clubContexts });
  const identities = Object.values(generated.playerIdentities);
  const foreignCount = identities.filter((identity) => identity.nationality !== "italian").length;

  assert.equal(foreignCount > identities.length * 0.5, true);
});

test("fake player generation gives top clubs a visible starting-lineup ability edge", () => {
  const clubs = generateFakeClubs();
  const generated = generateFakePlayersForClubs(clubs.clubIds);
  const topAverage = lineupCurrentAbilityAverage(generated, 1);
  const bottomAverage = lineupCurrentAbilityAverage(generated, 18);

  assert.equal(topAverage - bottomAverage >= 1.5, true);
});

test("third-division generated bands keep title contenders below first-division quality", () => {
  const clubs = generateFakeClubs();
  const generated = generateFakePlayersForClubs(clubs.clubIds, { seed: "band-world" });
  const topAverage = lineupCurrentAbilityAverage(generated, 1);

  assert.equal(topAverage < 13, true);
});

test("fake player generation keeps ordinary role attributes coherent", () => {
  const clubs = generateFakeClubs();
  const generated = generateFakePlayersForClubs(clubs.clubIds, { seed: "role-quality" });

  for (const playerId of generated.playerIds) {
    const player = requiredPlayer(generated.players[playerId]);
    const position = player.naturalPositions[0];
    assert.ok(position !== undefined);

    if (position === "cb" || position === "rb" || position === "lb" || position === "rwb" || position === "lwb") {
      assert.equal(Number(player.abilities.technical.finishing) <= 11, true, playerId);
    }

    if (position === "st") {
      assert.equal(Number(player.abilities.technical.tackling) <= 10, true, playerId);
    }

    if (position !== "gk") {
      assert.equal(Number(player.abilities.goalkeeping.reflexes) <= 4, true, playerId);
    }
  }
});

test("fake player generation writes explicit role identity fields", () => {
  const clubs = generateFakeClubs();
  const generated = generateFakePlayersForClubs(clubs.clubIds, { seed: "role-identity-world" });

  for (const playerId of generated.playerIds) {
    const player = requiredPlayer(generated.players[playerId]);
    assertGeneratedRoleIdentity(player);
  }
});

/**
 * Returns a generated player or fails the test with a clear message.
 */
function requiredPlayer(player: Player | undefined): Player {
  assert.ok(player !== undefined);
  return player;
}

function playerNamesForIds(
  generated: ReturnType<typeof generateFakePlayersForClubs>,
  playerIds: readonly ReturnType<typeof fakePlayerId>[],
): readonly { readonly firstName: string; readonly lastName: string }[] {
  return playerIds.map((playerId) => {
    const player = requiredPlayer(generated.players[playerId]);
    return {
      firstName: player.firstName,
      lastName: player.lastName,
    };
  });
}

/** Returns the current ability average for one generated club's default lineup. */
function lineupCurrentAbilityAverage(generated: ReturnType<typeof generateFakePlayersForClubs>, clubNumber: number): number {
  let total = 0;

  for (let slotNumber = 1; slotNumber <= 11; slotNumber += 1) {
    total += playerCurrentAbilityAverage(requiredPlayer(generated.players[fakePlayerId(clubNumber, slotNumber)]));
  }

  return total / 11;
}

/** Returns a compact current ability average for one generated player. */
function playerCurrentAbilityAverage(player: Player): number {
  return (
    Number(player.abilities.technical.finishing) +
    Number(player.abilities.technical.passing) +
    Number(player.abilities.technical.tackling) +
    Number(player.abilities.physical.pace) +
    Number(player.abilities.mental.positioning) +
    Number(player.abilities.goalkeeping.reflexes)
  ) / 6;
}

/** Returns whether a generated archetype lookup contains the requested key. */
function hasArchetype(
  archetypes: Readonly<Record<string, GeneratedPlayerArchetypeKey>>,
  expected: GeneratedPlayerArchetypeKey,
): boolean {
  for (const playerId of Object.keys(archetypes)) {
    if (archetypes[playerId] === expected) {
      return true;
    }
  }

  return false;
}

/** Verifies the Phase 33 role identity contract on one generated player. */
function assertGeneratedRoleIdentity(player: Player): void {
  const position = player.naturalPositions[0];
  assert.ok(position !== undefined);
  const expectedRole = primaryRoleForPosition(position);

  assert.equal(player.primaryRole, expectedRole);
  assert.ok(player.archetype !== undefined);
  assert.deepEqual(player.naturalRoles, [expectedRole]);
  assert.equal(player.roleFamiliarity?.[expectedRole], "natural");
  assert.equal(new Set([...(player.naturalRoles ?? []), ...(player.adaptedRoles ?? []), ...(player.weakRoles ?? [])]).size, (
    (player.naturalRoles?.length ?? 0) + (player.adaptedRoles?.length ?? 0) + (player.weakRoles?.length ?? 0)
  ));
}
