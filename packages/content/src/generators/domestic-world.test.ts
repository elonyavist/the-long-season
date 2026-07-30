import assert from "node:assert/strict";
import {
  getPlayerRoleProfile,
  roleCurrentAbility,
  rolePotentialAbility,
  type ClubCategory,
  type Player,
} from "@game/domain";
import { test } from "vitest";

import { playerRatingScale } from "../balance/player-economy-calibration.ts";
import {
  FAKE_DOMESTIC_CLUB_COUNT,
  FAKE_DOMESTIC_COMPETITION_IDS,
  FAKE_DOMESTIC_SENIOR_PLAYER_COUNT,
  createFakeDomesticWorld,
} from "./domestic-world.ts";
import { FAKE_PLAYERS_PER_CLUB } from "./fake-clubs.ts";
import { currentAbilityRarityLaneForGeneratedArchetype } from "./fake-players.ts";
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
  assert.equal(Object.keys(world.calibrationVersions).length, 7);
});

test("initial six-star budgets are exact and current champions are credible", () => {
  const world = createFakeDomesticWorld({ worldSeed: "three-tier-rarity" });
  const allPlayers = [
    ...world.playerIds.map((id) => world.players[id]!),
    ...world.initialYouthAcademies.playerIds.map((id) => world.initialYouthAcademies.players[id]!),
  ];
  const currentSix = allPlayers.filter((player) => rating(player, "current") === 6);
  const potentialSix = allPlayers.filter((player) => rating(player, "potential") === 6);
  const lowerPotentialSix = potentialSix.filter((player) => {
    const club = clubForPlayer(world, player.id);
    return club?.category !== "first_division";
  });

  assert.equal(
    currentSix.length >= playerRatingScale.rarity.initialWorld.currentSixMinimum,
    true,
  );
  assert.equal(
    currentSix.length <= playerRatingScale.rarity.initialWorld.currentSixMaximum,
    true,
  );
  assert.equal(
    potentialSix.length >= playerRatingScale.rarity.initialWorld.potentialSixMinimum,
    true,
  );
  assert.equal(
    potentialSix.length <= playerRatingScale.rarity.initialWorld.potentialSixMaximum,
    true,
  );
  assert.equal(
    lowerPotentialSix.length <= playerRatingScale.rarity.initialWorld.lowerDivisionPotentialSixMaximum,
    true,
  );
  for (const player of currentSix) {
    const club = clubForPlayer(world, player.id);
    assert.equal(club?.category, "first_division");
    assert.equal((club?.reputation ?? 0) >= 14, true);
    assert.equal(world.lineupsByClubId[club!.id]?.some((slot) => slot.playerId === player.id), true);
  }
});

/**
 * Exercises the complete deterministic opening-world allocation over the
 * canonical 100-seed cohort. The timeout is an execution budget only: the
 * assertions and accepted rarity bounds remain unchanged, while a full
 * parallel repository run may take longer than an isolated content run.
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
    const lowerPotentialSixCount = allPlayers.filter((player) =>
      rating(player, "potential") === 6
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
    assert.equal(currentSixIds.length >= 1 && currentSixIds.length <= 2, true);
    assert.equal(potentialSixIds.length >= 2 && potentialSixIds.length <= 4, true);
    assert.equal(lowerPotentialSixCount <= 1, true);

    for (const assignment of Object.values(
      world.exceptionalAllocation.assignmentsByPlayerKey,
    )) {
      const id = assignment.playerKey as Player["id"];
      const seniorArchetype = world.playerArchetypes[id];
      const youthArchetype = world.initialYouthAcademies.playerArchetypes[id];
      const actualArchetype = seniorArchetype ?? youthArchetype;
      assert.equal(actualArchetype, assignment.archetypeKey, assignment.playerKey);

      const actualLane = assignment.source === "constructed"
        ? assignment.currentSix
          ? "exceptional"
          : "normal"
        : seniorArchetype !== undefined
          ? currentAbilityRarityLaneForGeneratedArchetype(seniorArchetype)
          : currentAbilityRarityLaneForYouthProspect(
              requiredYouthArchetype(youthArchetype, assignment.playerKey),
              Number(
                world.initialYouthAcademies.clubYouthDevelopmentLevels[
                  requiredClubForPlayer(world, id).id
                ],
              ),
            );
      assert.equal(actualLane, assignment.currentAbilityLane, assignment.playerKey);

      if (assignment.source === "constructed" && seniorArchetype !== undefined) {
        assert.equal(world.playerRarityAssignments[id], undefined);
      }
    }
  }
}, 300_000);

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
