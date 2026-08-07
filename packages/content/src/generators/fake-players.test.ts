import assert from "node:assert/strict";
import { test } from "vitest";

import {
  evaluatePositionSuitability,
  getPlayerRoleProfile,
  isPotentialAtLeastCurrent,
  PLAYER_ABILITY_KEYS,
  PLAYER_ROLES,
  readPlayerAbility,
  roleCurrentAbility,
  rolePotentialAbility,
  type ClubId,
  type Player,
  type PlayerRole,
} from "@game/domain";
import { completedCivilYears, fromISO } from "@game/shared";

import { playerRatingScale } from "../balance/player-economy-calibration.ts";
import { fakePlayerId, generateFakeClubs } from "./fake-clubs.ts";
import { generateFakePlayersForClubs } from "./fake-players.ts";
import { getGeneratedPlayerArchetype, type GeneratedPlayerArchetypeKey } from "./player-archetypes.ts";
import {
  openingCompetitiveTierForClubRank,
  type OpeningPlayerGenerationClubContext,
} from "./player-generation-bands.ts";
import { contextualProspectClassForArchetype } from "./player-potential-rarity.ts";
import { ContextualProspectJointProfileError } from "./player-prospect-joint-profile.ts";
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
  let explicitYoungProspectCount = 0;
  let routineYoungPlateauCount = 0;

  for (const playerId of generated.playerIds) {
    const player = requiredPlayer(generated.players[playerId]);
    const archetypeKey = generated.playerArchetypes[playerId];
    assert.ok(archetypeKey !== undefined);
    const archetype = getGeneratedPlayerArchetype(archetypeKey);
    const age = completedCivilYears(Number(player.birthDate), CAREER_START_EPOCH_DAY);
    const currentFinishing = Number(player.abilities.technical.finishing);
    const potentialFinishing = Number(player.potential.technical.finishing);
    const prospectClass = contextualProspectClassForArchetype(archetypeKey);
    const ratingGap = potentialRoleRating(player) - currentRoleRating(player);

    assert.equal(age >= archetype.ageYears.minInclusive, true);
    assert.equal(age <= archetype.ageYears.maxInclusive, true);
    assert.equal(potentialFinishing >= currentFinishing, true);
    if (age <= 20 && prospectClass !== "routine") {
      assert.equal(ratingGap >= 1, true, `${player.id} ${prospectClass} gap ${ratingGap}`);
      explicitYoungProspectCount += 1;
    }
    if (age <= 20 && prospectClass === "routine" && ratingGap === 0) {
      routineYoungPlateauCount += 1;
    }
  }

  assert.equal(explicitYoungProspectCount > 0, true);
  assert.equal(routineYoungPlateauCount > 0, true);
});

test("joint exceptional assignments construct a senior current star before sampling youth prodigies", () => {
  const clubs = generateFakeClubs();
  const currentAndPotentialId = fakePlayerId(1, 1);
  const potentialOnlyId = fakePlayerId(1, 2);
  const clubContexts = Object.fromEntries(clubs.clubIds.map((clubId, index) => [
    clubId,
    {
      category: "first_division",
      reputation: 100 - index,
      competitiveTier: openingCompetitiveTierForClubRank(index + 1),
    },
  ])) as Record<ClubId, OpeningPlayerGenerationClubContext>;
  const generated = generateFakePlayersForClubs(clubs.clubIds, {
    seed: "joint-exceptional-profile",
    clubContexts,
    exceptionalAssignments: {
      currentSixPlayerIds: [currentAndPotentialId],
      potentialSixPlayerIds: [currentAndPotentialId, potentialOnlyId],
    },
  });
  const currentStar = requiredPlayer(generated.players[currentAndPotentialId]);
  const futureProspect = requiredPlayer(generated.players[potentialOnlyId]);
  const currentStarAge = generatedAge(currentStar);
  const futureProspectAge = generatedAge(futureProspect);

  assert.equal(generated.playerArchetypes[currentAndPotentialId], "category_star");
  assert.equal(currentStarAge >= 24 && currentStarAge <= 32, true);
  assert.equal(currentRoleAbility(currentStar) >= 17, true);
  assert.equal(potentialRoleAbility(currentStar) >= 17, true);

  assert.equal(generated.playerArchetypes[potentialOnlyId], "rare_prodigy");
  assert.equal(futureProspectAge >= 15 && futureProspectAge <= 20, true);
  assert.equal(currentRoleAbility(futureProspect) < 17, true);
  assert.equal(potentialRoleAbility(futureProspect) >= 17, true);
  assert.equal(potentialRoleRating(futureProspect) - currentRoleRating(futureProspect) >= 1, true);
});

test("opening senior generation propagates unsupported rare-prodigy placement as a typed failure", () => {
  const clubs = generateFakeClubs();
  const forcedPlayerId = fakePlayerId(1, 1);
  const clubContexts = Object.fromEntries(clubs.clubIds.map((clubId, index) => [
    clubId,
    {
      category: "first_division",
      reputation: 100 - index,
      competitiveTier: index === 0
        ? "survival"
        : openingCompetitiveTierForClubRank(index + 1),
    },
  ])) as Record<ClubId, OpeningPlayerGenerationClubContext>;

  assert.throws(
    () => generateFakePlayersForClubs(clubs.clubIds, {
      seed: "unsupported-opening-senior-prodigy",
      clubContexts,
      exceptionalAssignments: {
        currentSixPlayerIds: [],
        potentialSixPlayerIds: [forcedPlayerId],
      },
    }),
    (error: unknown) => {
      assert.ok(error instanceof ContextualProspectJointProfileError);
      assert.equal(error.code, "unsupported_rare_prodigy_placement");
      assert.equal(error.context.clubTier, "survival");
      return true;
    },
  );
});

test("routine league generation never creates nationally budgeted rare prodigies", () => {
  const clubs = generateFakeClubs();
  const first = generateFakePlayersForClubs(clubs.clubIds, { seed: "wonderkid-sample-0" });
  const second = generateFakePlayersForClubs(clubs.clubIds, { seed: "wonderkid-sample-1" });

  assert.equal(hasArchetype(first.playerArchetypes, "rare_prodigy"), false);
  assert.equal(hasArchetype(second.playerArchetypes, "rare_prodigy"), false);
});

test("routine budget archetypes come only from league-level rarity assignments", () => {
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
    if (archetypeKey === "category_star" || archetypeKey === "veteran_drop_down" || archetypeKey === "serious_prospect") {
      assert.ok(generated.playerRarityAssignments[playerId] !== undefined, `${playerId} ${archetypeKey}`);
    }
    assert.notEqual(archetypeKey, "rare_prodigy");
  }

  assert.equal((assignedArchetypeCounts.get("serious_prospect") ?? 0) >= 2, true);
  assert.equal(assignedArchetypeCounts.has("rare_prodigy"), false);
});

test("world-level exceptional construction removes superseded division rarity metadata", () => {
  const clubs = generateFakeClubs();
  const ordinary = generateFakePlayersForClubs(clubs.clubIds, {
    seed: "superseded-division-rarity",
  });
  const supersededAssignment = Object.values(ordinary.playerRarityAssignments)[0];
  assert.ok(supersededAssignment !== undefined);
  const id = fakePlayerId(
    Number(supersededAssignment.slotKey.split(":")[0]),
    Number(supersededAssignment.slotKey.split(":")[1]),
  );
  const exceptional = generateFakePlayersForClubs(clubs.clubIds, {
    seed: "superseded-division-rarity",
    exceptionalAssignments: {
      currentSixPlayerIds: [],
      potentialSixPlayerIds: [id],
    },
  });

  assert.equal(exceptional.playerArchetypes[id], "rare_prodigy");
  assert.equal(exceptional.playerRarityAssignments[id], undefined);
});

test("first-division top-club context creates a more international squad pool", () => {
  const clubs = generateFakeClubs();
  const clubContexts = Object.fromEntries(
    clubs.clubIds.map((clubId, index) => [
      clubId,
      {
        category: "first_division",
        reputation: 9,
        competitiveTier: openingCompetitiveTierForClubRank(index + 1),
      },
    ]),
  ) as Record<ClubId, OpeningPlayerGenerationClubContext>;
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

test("one generated division reaches every primary role", () => {
  const clubs = generateFakeClubs();
  const generated = generateFakePlayersForClubs(clubs.clubIds, { seed: "role-reachability" });
  const reached = new Set<PlayerRole>();

  for (const playerId of generated.playerIds) {
    const player = requiredPlayer(generated.players[playerId]);
    const primaryRole = player.primaryRole;
    assert.ok(primaryRole !== undefined, playerId);
    reached.add(primaryRole);
  }

  assert.deepEqual([...reached].toSorted(), [...PLAYER_ROLES].toSorted());
});

test("generated clubs field their footballers in their own natural roles", () => {
  const clubs = generateFakeClubs();
  const generated = generateFakePlayersForClubs(clubs.clubIds, { seed: "natural-lineup" });

  for (const clubId of clubs.clubIds) {
    const lineup = generated.lineupsByClubId[clubId];
    assert.ok(lineup !== undefined, clubId);

    for (const slot of lineup) {
      const player = requiredPlayer(generated.players[slot.playerId]);
      const suitability = evaluatePositionSuitability(player.naturalPositions, {
        playerRole: slot.canonicalRole,
      });

      assert.equal(suitability, "natural", `${clubId} ${slot.slotId}`);
    }
  }
});

test("different clubs in one division line up in different football shapes", () => {
  const clubs = generateFakeClubs();
  const generated = generateFakePlayersForClubs(clubs.clubIds, { seed: "shape-variety" });
  const roleMultisets = new Set<string>();

  for (const clubId of clubs.clubIds) {
    const lineup = generated.lineupsByClubId[clubId];
    assert.ok(lineup !== undefined, clubId);
    roleMultisets.add(lineup.map((slot) => slot.canonicalRole).toSorted().join(","));
  }

  assert.equal(roleMultisets.size >= 4, true, `one division fielded ${String(roleMultisets.size)} shapes`);
});

test("fake player generation writes explicit role identity fields", () => {
  const clubs = generateFakeClubs();
  const generated = generateFakePlayersForClubs(clubs.clubIds, { seed: "role-identity-world" });

  for (const playerId of generated.playerIds) {
    const player = requiredPlayer(generated.players[playerId]);
    assertGeneratedRoleIdentity(player);
  }
});

test("fake player generation satisfies the canonical potential invariant", () => {
  const clubs = generateFakeClubs();
  const generated = generateFakePlayersForClubs(clubs.clubIds, { seed: "world-a" });

  for (const playerId of generated.playerIds) {
    const player = requiredPlayer(generated.players[playerId]);
    assert.equal(isPotentialAtLeastCurrent(player.abilities, player.potential), true, playerId);
  }
});

test("fake player generation emits only complete new-player construction values", () => {
  const clubs = generateFakeClubs();
  const generated = generateFakePlayersForClubs(clubs.clubIds, { seed: "construction-contract" });

  for (const playerId of generated.playerIds) {
    const player = requiredPlayer(generated.players[playerId]);
    const dynamicState = generated.playerStates[playerId];
    assert.ok(dynamicState !== undefined);
    assertGeneratedRoleIdentity(player);

    for (const key of PLAYER_ABILITY_KEYS) {
      const current = Number(readPlayerAbility(player.abilities, key));
      const potential = Number(readPlayerAbility(player.potential, key));
      assert.equal(current >= 1 && current <= 20, true, `${playerId} current ${key}`);
      assert.equal(potential >= current && potential <= 20, true, `${playerId} potential ${key}`);
    }

    assert.equal(Number(dynamicState.fitness), 100);
    assert.equal(Number(dynamicState.form), 50);
    assert.equal(Number(dynamicState.morale), 50);
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

/** Returns the generated age at the fixed career start date. */
function generatedAge(player: Player): number {
  return completedCivilYears(Number(player.birthDate), CAREER_START_EPOCH_DAY);
}

/** Returns the current weighted ability for the player's canonical role. */
function currentRoleAbility(player: Player): number {
  assert.ok(player.primaryRole !== undefined);
  return Number(roleCurrentAbility(player.abilities, getPlayerRoleProfile(player.primaryRole)));
}

/** Returns the potential weighted ability for the player's canonical role. */
function potentialRoleAbility(player: Player): number {
  assert.ok(player.primaryRole !== undefined);
  return Number(rolePotentialAbility(player.potential, getPlayerRoleProfile(player.primaryRole)));
}

/** Returns the canonical current star rating for the player's primary role. */
function currentRoleRating(player: Player): number {
  return ratingForRoleAbility(currentRoleAbility(player));
}

/** Returns the canonical stored-ceiling rating for the player's primary role. */
function potentialRoleRating(player: Player): number {
  return ratingForRoleAbility(potentialRoleAbility(player));
}

/** Converts one exact role ability through the versioned global rating scale. */
function ratingForRoleAbility(ability: number): number {
  let rating = 1;
  for (const threshold of playerRatingScale.abilityThresholds) {
    if (ability >= threshold.minimumAbilityInclusive) rating = threshold.rating;
  }
  return rating;
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
