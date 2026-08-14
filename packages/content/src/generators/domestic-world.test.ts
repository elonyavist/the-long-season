import assert from "node:assert/strict";
import {
  PLAYER_ROLES,
  getPlayerRoleProfile,
  roleCurrentAbility,
  rolePotentialAbility,
  type ClubCategory,
  type Player,
} from "@game/domain";
import { completedCivilYears } from "@game/shared";
import { test } from "vitest";

import { playerRatingScale } from "../balance/player-economy-calibration.ts";
import {
  FAKE_DOMESTIC_CLUB_COUNT,
  FAKE_DOMESTIC_COMPETITION_IDS,
  FAKE_DOMESTIC_SENIOR_PLAYER_COUNT,
  createFakeDomesticWorld,
} from "./domestic-world.ts";
import { FAKE_PLAYERS_PER_CLUB } from "./fake-clubs.ts";
import { primaryRoleForPosition } from "./player-role-identity.ts";
import {
  GENERATED_SQUAD_IDENTITY_KEYS,
  assignGeneratedSquadIdentities,
  squadIdentityPositionForSlot,
} from "./squad-identity.ts";
import {
  currentAbilityRarityLaneForGeneratedArchetype,
  resolveGeneratedCurrentAbilityRarityLane,
  resolveGeneratedExceptionalProfile,
} from "./player-archetypes.ts";
import { currentAbilityRarityLaneForYouthProspect } from "./player-potential-rarity.ts";

/** Complete-country tests lock topology, deterministic identity, and rarity. */
test("creates three ordered 18-club tiers with 22 active seniors per club", () => {
  const world = createFakeDomesticWorld({ worldSeed: "three-tier-shape" });

  assert.equal(world.clubIds.length, FAKE_DOMESTIC_CLUB_COUNT);
  assert.equal(world.playerIds.length, FAKE_DOMESTIC_SENIOR_PLAYER_COUNT);
  assert.deepEqual(world.domesticCompetitionWorld.competitionIds, FAKE_DOMESTIC_COMPETITION_IDS);
  for (const category of categories()) {
    assert.equal(world.divisionClubIds[category].length, 18);
  }
  for (const clubId of world.clubIds) {
    assert.equal(world.clubsById[clubId]?.playerIds.length, FAKE_PLAYERS_PER_CLUB);
  }
  assert.equal(new Set(world.clubIds).size, world.clubIds.length);
  assert.equal(new Set(world.playerIds).size, world.playerIds.length);
  assert.equal(
    world.clubsById[world.defaultSelectedClubId]?.category,
    "third_division",
  );
});

test("every domestic division realizes its own balanced club-role identity deck", () => {
  const worldSeed = "three-tier-squad-identities";
  const world = createFakeDomesticWorld({ worldSeed });
  const assignmentVectors: string[] = [];

  for (const [divisionIndex, category] of categories().entries()) {
    const orderedClubIds = world.divisionClubIds[category];
    const competitionIdentityKey = FAKE_DOMESTIC_COMPETITION_IDS[divisionIndex];
    assert.ok(competitionIdentityKey !== undefined);
    const assignments = assignGeneratedSquadIdentities({
      seed: worldSeed,
      competitionIdentityKey,
      orderedClubIds,
    });
    const counts = new Map(GENERATED_SQUAD_IDENTITY_KEYS.map((key) => [key, 0]));
    const roles = new Set<string>();

    for (const clubId of orderedClubIds) {
      const identity = assignments.get(clubId);
      const club = world.clubsById[clubId];
      assert.ok(identity !== undefined);
      assert.ok(club !== undefined);
      const currentCount = counts.get(identity.key);
      assert.ok(currentCount !== undefined);
      counts.set(identity.key, currentCount + 1);

      for (const [slotIndex, playerId] of club.playerIds.entries()) {
        const player = world.players[playerId];
        const expectedPosition = squadIdentityPositionForSlot(identity, slotIndex + 1);
        assert.ok(player !== undefined);
        assert.equal(player.naturalPositions[0], expectedPosition, `${clubId} slot ${String(slotIndex + 1)}`);
        roles.add(primaryRoleForPosition(expectedPosition));
      }
    }

    assert.deepEqual(
      [...counts.values()].toSorted((left, right) => left - right),
      [2, 2, 2, 2, 2, 2, 3, 3],
    );
    assert.deepEqual([...roles].toSorted(), [...PLAYER_ROLES].toSorted());
    assignmentVectors.push(orderedClubIds.map((clubId) => {
      const identity = assignments.get(clubId);
      assert.ok(identity !== undefined);
      return identity.key;
    }).join("|"));
  }

  assert.equal(new Set(assignmentVectors).size >= 2, true, "all divisions repeated one assignment vector");
});

test("complete world owns registrations, contracts, youth, finance, and windows", () => {
  const world = createFakeDomesticWorld({ worldSeed: "three-tier-systems" });

  assert.equal(world.seniorSquadState.registrationIds.length, world.playerIds.length);
  assert.equal(world.seniorSquadState.activeContractIds.length, world.playerIds.length);
  assert.equal(world.clubFinanceState.clubIds.length, world.clubIds.length);
  assert.equal(world.initialYouthAcademies.youthAcademyState.clubRosterIds.length, world.clubIds.length);
  assert.equal(world.initialYouthAcademies.playerIds.length, world.clubIds.length * 11);
  assert.deepEqual(world.transferWindowCompetitionIds, FAKE_DOMESTIC_COMPETITION_IDS);
  for (const competitionId of world.transferWindowCompetitionIds) {
    assert.equal(world.transferWindowsByCompetitionId[competitionId]?.windows.length, 2);
    assert.equal(
      world.domesticCompetitionWorld.competitions[competitionId]?.seasonDistribution?.prizes.length,
      18,
    );
  }
  assert.equal(world.calibrationVersions.topologyDecisionId, "fictional-three-tier-v1");
  assert.equal(Object.keys(world.calibrationVersions).length, 8);
});

test("the blueprint-off analysis seam is deterministic and leaves ordinary worlds exact", () => {
  const ordinary = createFakeDomesticWorld({ worldSeed: "blueprint-ablation" });
  const explicitOrdinary = createFakeDomesticWorld({
    worldSeed: "blueprint-ablation",
    useSquadIdentityRoleBlueprint: true,
  });
  const legacy = createFakeDomesticWorld({
    worldSeed: "blueprint-ablation",
    useSquadIdentityRoleBlueprint: false,
  });
  const repeatedLegacy = createFakeDomesticWorld({
    worldSeed: "blueprint-ablation",
    useSquadIdentityRoleBlueprint: false,
  });

  assert.deepEqual(explicitOrdinary, ordinary);
  assert.deepEqual(repeatedLegacy, legacy);
  assert.notDeepEqual(
    legacy.initialYouthAcademies.playerIds.map((id) =>
      legacy.initialYouthAcademies.players[id]?.naturalPositions[0]),
    ordinary.initialYouthAcademies.playerIds.map((id) =>
      ordinary.initialYouthAcademies.players[id]?.naturalPositions[0]),
  );
  assert.deepEqual(
    legacy.playerIds.map((id) => legacy.players[id]?.naturalPositions),
    ordinary.playerIds.map((id) => ordinary.players[id]?.naturalPositions),
  );
});

test("the runway control seam changes academy potential without changing opening senior squads", () => {
  const candidate = createFakeDomesticWorld({ worldSeed: "runway-world-seam" });
  const control = createFakeDomesticWorld({
    worldSeed: "runway-world-seam",
    useRoutineYouthStationaryRunway: false,
  });

  assert.deepEqual(candidate.players, control.players);
  assert.deepEqual(candidate.playerIds, control.playerIds);
  assert.deepEqual(candidate.initialYouthAcademies.playerIds, control.initialYouthAcademies.playerIds);
  assert.notDeepEqual(
    candidate.initialYouthAcademies.players,
    control.initialYouthAcademies.players,
  );
});

test("initial six-star budgets are exact and current champions are credible", () => {
  const world = createFakeDomesticWorld({ worldSeed: "three-tier-rarity" });
  const allPlayers = [
    ...world.playerIds.map((id) => world.players[id]!),
    ...world.initialYouthAcademies.playerIds.map((id) => world.initialYouthAcademies.players[id]!),
  ];
  const currentSix = allPlayers.filter((player) => rating(player, "current") === 6);
  const potentialSix = allPlayers.filter((player) => rating(player, "potential") === 6);
  const youngPotentialSix = potentialSix.filter((player) =>
    isYoungPlayer(player, world.seasonStartDate)
  );
  const lowerPotentialSix = youngPotentialSix.filter((player) => {
    const club = clubForPlayer(world, player.id);
    return club?.category !== "first_division";
  });

  assert.equal(
    currentSix.length >= playerRatingScale.rarity.initialWorld.establishedCurrentSixMinimum,
    true,
  );
  assert.equal(
    currentSix.length <= playerRatingScale.rarity.initialWorld.establishedCurrentSixMaximum,
    true,
  );
  assert.equal(
    youngPotentialSix.length >= playerRatingScale.rarity.initialWorld.youngStoredCeilingSixMinimum,
    true,
  );
  assert.equal(
    youngPotentialSix.length <= playerRatingScale.rarity.initialWorld.youngStoredCeilingSixMaximum,
    true,
  );
  assert.equal(
    lowerPotentialSix.length <= playerRatingScale.rarity.initialWorld.lowerDivisionYoungStoredCeilingSixMaximum,
    true,
  );
  for (const player of currentSix) {
    const club = clubForPlayer(world, player.id);
    assert.equal(club?.category, "first_division");
    assert.equal(completedCivilYears(player.birthDate, world.seasonStartDate) > 20, true);
    assert.equal((club?.reputation ?? 0) >= 14, true);
    assert.equal(world.lineupsByClubId[club!.id]?.some((slot) => slot.playerId === player.id), true);
  }
  assert.equal(potentialSix.length, currentSix.length + youngPotentialSix.length);
  assert.equal(
    new Set(youngPotentialSix.map((player) => clubForPlayer(world, player.id)?.id)).size,
    youngPotentialSix.length,
  );
});

/**
 * Exercises the complete deterministic opening-world allocation over the
 * canonical 100-seed cohort. `vitest.config.ts` owns its execution budget; the
 * assertions and accepted rarity bounds remain local to this population.
 */
test("one hundred initial worlds reconcile effective six-star stock with truthful assignments", () => {
  for (let seedIndex = 0; seedIndex < 100; seedIndex += 1) {
    const world = createFakeDomesticWorld({
      worldSeed: `phase79d-effective-rarity-${seedIndex}`,
    });
    const allPlayers = [
      ...world.playerIds.map((id) => world.players[id]!),
      ...world.initialYouthAcademies.playerIds.map(
        (id) => world.initialYouthAcademies.players[id]!,
      ),
    ];
    const currentSixIds = allPlayers
      .filter((player) => rating(player, "current") === 6)
      .map((player) => String(player.id))
      .toSorted();
    const potentialSixIds = allPlayers
      .filter((player) => rating(player, "potential") === 6)
      .map((player) => String(player.id))
      .toSorted();
    const youngPotentialSixIds = allPlayers
      .filter((player) =>
        rating(player, "potential") === 6
        && isYoungPlayer(player, world.seasonStartDate)
      )
      .map((player) => String(player.id))
      .toSorted();
    const lowerPotentialSixCount = allPlayers.filter((player) =>
      rating(player, "potential") === 6
      && isYoungPlayer(player, world.seasonStartDate)
      && clubForPlayer(world, player.id)?.category !== "first_division"
    ).length;

    assert.deepEqual(
      currentSixIds,
      [...world.exceptionalAllocation.currentSixPlayerKeys].toSorted(),
      `current truth ${seedIndex}`,
    );
    assert.deepEqual(
      potentialSixIds,
      [...world.exceptionalAllocation.potentialSixPlayerKeys].toSorted(),
      `potential truth ${seedIndex}`,
    );
    assert.deepEqual(
      youngPotentialSixIds,
      [...world.exceptionalAllocation.youngPotentialSixPlayerKeys].toSorted(),
      `young potential truth ${seedIndex}`,
    );
    assert.equal(currentSixIds.length >= 2 && currentSixIds.length <= 3, true);
    assert.equal(youngPotentialSixIds.length >= 4 && youngPotentialSixIds.length <= 5, true);
    assert.equal(potentialSixIds.length >= 6 && potentialSixIds.length <= 8, true);
    assert.equal(lowerPotentialSixCount <= 1, true);

    for (const assignment of Object.values(
      world.exceptionalAllocation.assignmentsByPlayerKey,
    )) {
      const id = assignment.playerKey as Player["id"];
      const seniorArchetype = world.playerArchetypes[id];
      const youthArchetype = world.initialYouthAcademies.playerArchetypes[id];
      const actualArchetype = seniorArchetype ?? youthArchetype;
      assert.equal(actualArchetype, assignment.archetypeKey, assignment.playerKey);

      const effectiveArchetype = requiredYouthArchetype(
        actualArchetype,
        assignment.playerKey,
      );
      const requestedLane = seniorArchetype !== undefined
        ? assignment.source === "constructed"
          ? resolveGeneratedExceptionalProfile({
              currentSixAllocated: assignment.currentSix,
              potentialSixAllocated: assignment.potentialSix,
            }).currentAbilityLane
          : currentAbilityRarityLaneForGeneratedArchetype(seniorArchetype)
        : currentAbilityRarityLaneForYouthProspect(
            effectiveArchetype,
            Number(
              world.initialYouthAcademies.clubYouthDevelopmentLevels[
                requiredClubForPlayer(world, id).id
              ],
            ),
          );
      const actualLane = resolveGeneratedCurrentAbilityRarityLane({
        archetypeKey: effectiveArchetype,
        requestedLane,
      });
      assert.equal(actualLane, assignment.currentAbilityLane, assignment.playerKey);

      if (assignment.source === "constructed" && seniorArchetype !== undefined) {
        assert.equal(world.playerRarityAssignments[id], undefined);
      }
    }
  }
});

test("same seed complete-world output is byte-identical", () => {
  const first = createFakeDomesticWorld({ worldSeed: "three-tier-repeat" });
  const second = createFakeDomesticWorld({ worldSeed: "three-tier-repeat" });

  assert.equal(JSON.stringify(first), JSON.stringify(second));
});

function categories(): readonly ClubCategory[] {
  return ["first_division", "second_division", "third_division"];
}

function rating(player: Player, kind: "current" | "potential"): number {
  const profile = getPlayerRoleProfile(player.primaryRole!);
  const ability = kind === "current"
    ? Number(roleCurrentAbility(player.abilities, profile))
    : Number(rolePotentialAbility(player.potential, profile));
  let result = 1;
  for (const threshold of playerRatingScale.abilityThresholds) {
    if (ability < threshold.minimumAbilityInclusive) break;
    result = threshold.rating;
  }
  return result;
}

function isYoungPlayer(
  player: Player,
  referenceDate: ReturnType<typeof createFakeDomesticWorld>["seasonStartDate"],
): boolean {
  const age = completedCivilYears(player.birthDate, referenceDate);
  return age >= 15 && age <= 20;
}

function clubForPlayer(
  world: ReturnType<typeof createFakeDomesticWorld>,
  playerId: Player["id"],
) {
  return world.clubs.find((club) =>
    club.playerIds.includes(playerId)
    || world.initialYouthAcademies.youthAcademyState.clubRosters[club.id]?.playerIds.includes(playerId)
  );
}

function requiredClubForPlayer(
  world: ReturnType<typeof createFakeDomesticWorld>,
  playerId: Player["id"],
) {
  const club = clubForPlayer(world, playerId);
  assert.ok(club !== undefined);
  return club;
}

function requiredYouthArchetype<T>(
  archetype: T | undefined,
  playerId: string,
): T {
  assert.ok(archetype !== undefined, playerId);
  return archetype;
}
