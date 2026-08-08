import assert from "node:assert/strict";
import { test } from "vitest";

import {
  getPlayerRoleProfile,
  roleCurrentAbility,
  rolePotentialAbility,
  type ClubCategory,
  type Player,
  type PlayerStarRating,
} from "@game/domain";
import { completedCivilYears } from "@game/shared";

import { playerRatingScale } from "../balance/player-economy-calibration.ts";
import { fakePlayerId, generateFakeClubs } from "./fake-clubs.ts";
import {
  generateFakePlayersForClubs,
  type FakePlayers,
} from "./fake-players.ts";
import { createFakeDomesticWorld } from "./domestic-world.ts";
import { getGeneratedPlayerArchetype } from "./player-archetypes.ts";
import { openingCompetitiveTierForClubRank } from "./player-generation-bands.ts";

/** Product-level tests for generated third-division squad quality. */

test("generated leagues are stable for the same seed and varied across different seeds", () => {
  const clubs = generateFakeClubs();
  const first = generateFakePlayersForClubs(clubs.clubIds, { seed: "quality-stable" });
  const second = generateFakePlayersForClubs(clubs.clubIds, { seed: "quality-stable" });
  const different = generateFakePlayersForClubs(clubs.clubIds, { seed: "quality-different" });
  const inspectedPlayerId = fakePlayerId(1, 10);

  assert.deepEqual(first, second);
  assert.notEqual(
    playerDisplayName(requiredPlayer(first.players[inspectedPlayerId])),
    playerDisplayName(requiredPlayer(different.players[inspectedPlayerId])),
  );
});

test("third-division generated players keep role-incoherent spikes out of ordinary squads", () => {
  const generated = generatedLeague("quality-role-coherence");

  for (const playerId of generated.playerIds) {
    const player = requiredPlayer(generated.players[playerId]);
    const position = player.naturalPositions[0];
    assert.ok(position !== undefined);

    if (isDefensivePosition(position)) {
      assert.equal(Number(player.abilities.technical.finishing) <= 11, true, `${playerId} defender finishing`);
    }

    if (position === "st") {
      assert.equal(Number(player.abilities.technical.tackling) <= 10, true, `${playerId} striker tackling`);
    }

    if (position !== "gk") {
      assert.equal(Number(player.abilities.goalkeeping.reflexes) <= 4, true, `${playerId} outfield reflexes`);
    }
  }
});

test("third-division high-current-ability players stay rare", () => {
  for (const seed of ["world-a", "world-b", "demo-001"]) {
    const generated = generatedLeague(seed);
    const highCurrentPlayers = generated.playerIds.filter((playerId) => {
      const player = requiredPlayer(generated.players[playerId]);
      return currentRolePeak(player) >= 15;
    });

    assert.equal(highCurrentPlayers.length <= 6, true, `${seed} high-current count ${highCurrentPlayers.length}`);
  }
});

test("routine league generation budgets serious prospects and never creates national exceptions", () => {
  for (const seed of ["world-a", "world-b", "demo-001"]) {
    const generated = generatedLeague(seed);
    let seriousProspects = 0;
    let rareProdigies = 0;

    for (const playerId of generated.playerIds) {
      const archetypeKey = generated.playerArchetypes[playerId];
      if (archetypeKey === "serious_prospect") {
        seriousProspects += 1;
      }

      if (archetypeKey === "rare_prodigy") {
        rareProdigies += 1;
      }
    }

    assert.equal(seriousProspects, generated.playerRarityBudget.seriousProspectCount, seed);
    assert.equal(rareProdigies, 0, seed);
    assert.equal(seriousProspects <= 5, true, seed);
  }
});

test("every generated third-division club has at least one prospect without guaranteeing a star", () => {
  const clubs = generateFakeClubs();
  const generated = generateFakePlayersForClubs(clubs.clubIds, { seed: "quality-club-prospects" });

  for (const clubId of clubs.clubIds) {
    const club = clubs.clubsById[clubId];
    assert.ok(club !== undefined);
    const prospectCount = club.playerIds.filter((playerId) => {
      const archetypeKey = generated.playerArchetypes[playerId];
      assert.ok(archetypeKey !== undefined);
      return getGeneratedPlayerArchetype(archetypeKey).depthRole === "prospect";
    }).length;

    assert.equal(prospectCount >= 1, true, club.shortName);
  }
});

test("complete initial world respects first-team bands and exact global six-star budgets", () => {
  const first = createFakeDomesticWorld({ worldSeed: "quality-global-world" });
  const repeated = createFakeDomesticWorld({ worldSeed: "quality-global-world" });

  assert.deepEqual(first, repeated);
  assert.equal(
    first.exceptionalAllocation.currentSixPlayerKeys.length >= 2
      && first.exceptionalAllocation.currentSixPlayerKeys.length <= 3,
    true,
  );
  assert.equal(
    first.exceptionalAllocation.youngPotentialSixPlayerKeys.length >= 4
      && first.exceptionalAllocation.youngPotentialSixPlayerKeys.length <= 5,
    true,
  );
  assert.equal(
    first.exceptionalAllocation.potentialSixPlayerKeys.length >= 6
      && first.exceptionalAllocation.potentialSixPlayerKeys.length <= 8,
    true,
  );
  assert.equal(
    first.exceptionalAllocation.youngPotentialSixPlayerKeys.filter((id) =>
      clubForPlayer(first, id)?.category !== "first_division"
    ).length <= 1,
    true,
  );

  for (const id of first.playerIds) {
    const player = requiredPlayer(first.players[id]);
    const roleProfile = roleProfileFor(player);
    const currentRating = ratingForAbility(Number(roleCurrentAbility(
      player.abilities,
      roleProfile,
    )));
    const potentialRating = ratingForAbility(Number(rolePotentialAbility(
      player.potential,
      roleProfile,
    )));
    const club = clubForPlayer(first, id);
    assert.ok(club !== undefined);
    const placement = first.lineupsByClubId[club.id]?.some(
      (slot) => slot.playerId === id,
    )
      ? "starter"
      : "reserve";

    if (placement === "starter") {
      const exceptional = first.exceptionalAllocation.currentSixPlayerKeys.includes(id);
      const localWhiteFly =
        first.playerRarityAssignments[id]?.rarityKind === "white_fly";
      const band = playerRatingScale.divisionFirstTeamBands.find((candidate) =>
        candidate.division === club.category
      );
      assert.ok(band !== undefined);
      assert.equal(
        currentRating >= band.normalMinimum,
        true,
        `${id} ${club.category} starter floor`,
      );
      assert.equal(
        currentRating <= (exceptional || localWhiteFly ? band.exceptionalMaximum : band.normalMaximum),
        true,
        `${id} ${club.category} starter ceiling`,
      );
    }

    assert.equal(potentialRating >= currentRating, true, `${id} potential`);
  }

  const allPlayerIds = [
    ...first.playerIds,
    ...first.initialYouthAcademies.playerIds,
  ];
  const actualCurrentSix = allPlayerIds.filter((id) => {
    const player = requiredPlayer(
      first.players[id] ?? first.initialYouthAcademies.players[id],
    );
    return ratingForAbility(Number(roleCurrentAbility(
      player.abilities,
      roleProfileFor(player),
    ))) === 6;
  });
  const actualPotentialSix = allPlayerIds.filter((id) => {
    const player = requiredPlayer(
      first.players[id] ?? first.initialYouthAcademies.players[id],
    );
    return ratingForAbility(Number(rolePotentialAbility(
      player.potential,
      roleProfileFor(player),
    ))) === 6;
  });

  assert.deepEqual(
    actualCurrentSix.map(String).toSorted(),
    [...first.exceptionalAllocation.currentSixPlayerKeys].toSorted(),
  );
  assert.deepEqual(
    actualPotentialSix.map(String).toSorted(),
    [...first.exceptionalAllocation.potentialSixPlayerKeys].toSorted(),
  );
  for (const id of actualCurrentSix) {
    const club = clubForPlayer(first, id);
    assert.equal(club?.category, "first_division");
    assert.equal(first.lineupsByClubId[club!.id]?.some((slot) => slot.playerId === id), true);
    const divisionIndex = first.divisionClubIds.first_division.indexOf(club!.id);
    assert.equal(
      ["title_contender", "playoff_contender"].includes(
        openingCompetitiveTierForClubRank(divisionIndex + 1),
      ),
      true,
    );
  }
});

test("canonical Phase 80A worlds keep prospect shares and senior quality continuous", () => {
  const observations: Record<ClubCategory, { eligible: number; atLeastThreeAndHalf: number }> = {
    first_division: { eligible: 0, atLeastThreeAndHalf: 0 },
    second_division: { eligible: 0, atLeastThreeAndHalf: 0 },
    third_division: { eligible: 0, atLeastThreeAndHalf: 0 },
  };
  const acceptedShares: Readonly<Record<ClubCategory, readonly [number, number]>> = {
    first_division: [0.15, 0.25],
    second_division: [0.08, 0.15],
    third_division: [0.04, 0.08],
  };
  const firstDivisionOrdinaryStarRatings = new Map<PlayerStarRating, number>();
  const lowerDivisionWhiteFlyMaximums: Record<"second_division" | "third_division", number> = {
    second_division: 0,
    third_division: 0,
  };

  for (let seedIndex = 1; seedIndex <= 20; seedIndex += 1) {
    const world = createFakeDomesticWorld({
      worldSeed:
        `phase80a-prechange-baseline-world-${String(seedIndex).padStart(5, "0")}`,
    });
    const categoryByPlayerId = new Map(
      world.clubs.flatMap((club) => club.playerIds.map((id) => [id, club.category] as const)),
    );

    for (const id of world.playerIds) {
      const player = requiredPlayer(world.players[id]);
      const age = completedCivilYears(Number(player.birthDate), Number(world.seasonStartDate));
      const category = categoryByPlayerId.get(id);
      assert.ok(category !== undefined);
      const currentRating = ratingForAbility(Number(roleCurrentAbility(
        player.abilities,
        roleProfileFor(player),
      )));
      const archetype = world.playerArchetypes[id];
      if (
        category === "first_division"
        && archetype === "category_star"
        && !world.exceptionalAllocation.currentSixPlayerKeys.includes(id)
      ) {
        firstDivisionOrdinaryStarRatings.set(
          currentRating,
          (firstDivisionOrdinaryStarRatings.get(currentRating) ?? 0) + 1,
        );
      }
      if (
        (category === "second_division" || category === "third_division")
        && archetype === "category_star"
      ) {
        lowerDivisionWhiteFlyMaximums[category] = Math.max(
          lowerDivisionWhiteFlyMaximums[category],
          Number(roleCurrentAbility(player.abilities, roleProfileFor(player))),
        );
      }
      if (age < 15 || age > 20) continue;
      const observation = observations[category];
      observation.eligible += 1;
      const potentialRating = ratingForAbility(Number(rolePotentialAbility(
        player.potential,
        roleProfileFor(player),
      )));
      if (potentialRating >= 3.5) observation.atLeastThreeAndHalf += 1;
    }
  }

  assert.equal((firstDivisionOrdinaryStarRatings.get(4.5) ?? 0) > 0, true);
  assert.equal((firstDivisionOrdinaryStarRatings.get(5) ?? 0) > 0, true);
  assert.equal(lowerDivisionWhiteFlyMaximums.second_division <= 14.25, true);
  assert.equal(lowerDivisionWhiteFlyMaximums.third_division <= 13.25, true);

  for (const category of ["first_division", "second_division", "third_division"] as const) {
    const observation = observations[category];
    const [minimumShare, maximumShare] = acceptedShares[category];
    assert.equal(observation.eligible > 0, true, `${category} denominator`);
    const share = observation.atLeastThreeAndHalf / observation.eligible;
    assert.equal(share >= minimumShare, true, `${category} lower share ${share}`);
    assert.equal(share <= maximumShare, true, `${category} upper share ${share}`);
  }
  // A continuity record, not a gate: the gate is `acceptedShares` above, and it
  // has never moved. Phase 81A Step 03A gave each generated club its own squad
  // identity, so a player's role - which both generates his potential and
  // weights the reading of it - now varies by club. First division moved by one
  // youngster of 2144; the other two divisions and all three denominators came
  // through unchanged. Re-record it only with that kind of account.
  assert.deepEqual(observations, {
    first_division: { eligible: 2_144, atLeastThreeAndHalf: 422 },
    second_division: { eligible: 2_176, atLeastThreeAndHalf: 252 },
    third_division: { eligible: 2_095, atLeastThreeAndHalf: 130 },
  });
});

function generatedLeague(seed: string): FakePlayers {
  const clubs = generateFakeClubs();
  return generateFakePlayersForClubs(clubs.clubIds, { seed });
}

function ratingForAbility(ability: number): PlayerStarRating {
  let rating: PlayerStarRating = 1;
  for (const threshold of playerRatingScale.abilityThresholds) {
    if (ability >= threshold.minimumAbilityInclusive) rating = threshold.rating;
  }
  return rating;
}

function requiredPlayer(player: Player | undefined): Player {
  assert.ok(player !== undefined);
  return player;
}

function roleProfileFor(player: Player) {
  assert.ok(player.primaryRole !== undefined);
  return getPlayerRoleProfile(player.primaryRole);
}

function playerDisplayName(player: Player): string {
  return `${player.firstName} ${player.lastName}`;
}

function isDefensivePosition(position: string): boolean {
  return position === "rb" || position === "cb" || position === "lb" || position === "rwb" || position === "lwb";
}

function currentRolePeak(player: Player): number {
  const abilities = player.abilities;

  return Math.max(
    Number(abilities.technical.finishing),
    Number(abilities.technical.passing),
    Number(abilities.technical.tackling),
    Number(abilities.mental.positioning),
    Number(abilities.goalkeeping.reflexes),
  );
}

function clubForPlayer(
  world: ReturnType<typeof createFakeDomesticWorld>,
  id: string,
) {
  return world.clubs.find((club) =>
    club.playerIds.includes(id as Player["id"])
    || world.initialYouthAcademies.youthAcademyState.clubRosters[
      club.id
    ]?.playerIds.includes(id as Player["id"])
  );
}
