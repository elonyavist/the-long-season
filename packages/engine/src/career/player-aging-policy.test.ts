import assert from "node:assert/strict";
import { test } from "vitest";

import {
  abilityValue,
  playerId,
  readPlayerAbility,
  type Player,
  type PlayerAbilities,
  type PlayerAbilityKey,
  type PlayerPosition,
  type PlayerRole,
} from "@game/domain";

import {
  applyPlayerAgingPolicy,
  currentAbilityFloor,
  monthlyDeclineFor,
} from "./player-aging-policy.ts";

test("monthlyDeclineFor keeps outfield physical decline at the 31 to 32 boundary", () => {
  assert.equal(monthlyDeclineFor("attacker", 31, "physical.pace"), 0);
  assert.equal(monthlyDeclineFor("attacker", 32, "physical.pace") > 0, true);
});

test("applyPlayerAgingPolicy declines old outfield physical ability before skill ability", () => {
  const player = playerFixture("st", "striker", abilitySet(12), abilitySet(14));
  const result = applyPlayerAgingPolicy({
    player,
    age: 34,
    positionGroup: "attacker",
    developmentRole: "striker",
    worldSeed: "aging-outfield",
    seasonId: "season:0001",
    monthKey: "2026-08",
  });

  assert.equal(result.totalDecline > 0, true);
  assert.equal(result.player.abilities.physical.pace < player.abilities.physical.pace, true);
  assert.equal(result.player.abilities.technical.finishing <= player.abilities.technical.finishing, true);
  assert.equal(
    player.abilities.physical.pace - result.player.abilities.physical.pace >
      player.abilities.technical.finishing - result.player.abilities.technical.finishing,
    true,
  );
});

test("applyPlayerAgingPolicy uses a later goalkeeper curve", () => {
  const keeper = playerFixture("gk", "goalkeeper", abilitySet(12), abilitySet(14));
  const age34 = applyPlayerAgingPolicy({
    player: keeper,
    age: 34,
    positionGroup: "goalkeeper",
    developmentRole: "goalkeeper",
    worldSeed: "keeper-aging",
    seasonId: "season:0001",
    monthKey: "2026-08",
  });
  const age36 = applyPlayerAgingPolicy({
    player: keeper,
    age: 36,
    positionGroup: "goalkeeper",
    developmentRole: "goalkeeper",
    worldSeed: "keeper-aging",
    seasonId: "season:0001",
    monthKey: "2026-08",
  });

  assert.equal(age34.totalDecline, 0);
  assert.equal(age36.player.abilities.goalkeeping.footwork < keeper.abilities.goalkeeping.footwork, true);
  assert.equal(age36.player.abilities.goalkeeping.reflexes, keeper.abilities.goalkeeping.reflexes);
});

test("applyPlayerAgingPolicy enforces the active physical floor without flooring non-physical low values", () => {
  const player = playerFixture("st", "striker", abilitySet(5), abilitySet(7));
  const result = applyPlayerAgingPolicy({
    player,
    age: 38,
    positionGroup: "attacker",
    developmentRole: "striker",
    worldSeed: "physical-floor",
    seasonId: "season:0001",
    monthKey: "2026-08",
  });

  assert.equal(currentAbilityFloor("physical.pace"), 7);
  assert.equal(result.player.abilities.physical.pace, 7);
  assert.equal(result.player.abilities.physical.heading, 7);
  assert.equal(result.player.abilities.technical.finishing < 5, true);
  assert.equal(result.player.abilities.technical.finishing >= 1, true);
});

test("applyPlayerAgingPolicy compresses unreachable potential without increasing it", () => {
  const player = playerFixture(
    "st",
    "striker",
    abilitySet(10),
    abilitySet(18),
  );
  const result = applyPlayerAgingPolicy({
    player,
    age: 33,
    positionGroup: "attacker",
    developmentRole: "striker",
    worldSeed: "potential-compression",
    seasonId: "season:0001",
    monthKey: "2026-08",
  });

  for (const key of ["physical.pace", "technical.finishing", "mental.composure"] as const satisfies readonly PlayerAbilityKey[]) {
    const current = Number(readPlayerAbility(result.player.abilities, key));
    const potential = Number(readPlayerAbility(result.player.potential, key));
    const previousPotential = Number(readPlayerAbility(player.potential, key));

    assert.equal(potential >= current, true, `${key} potential=${potential} current=${current}`);
    assert.equal(potential <= previousPotential, true, `${key} potential=${potential} previous=${previousPotential}`);
  }

  assert.equal(result.player.potential.physical.pace, result.player.abilities.physical.pace);
  assert.equal(result.totalPotentialCompression > 0, true);
});

function playerFixture(
  position: PlayerPosition,
  primaryRole: PlayerRole,
  abilities: PlayerAbilities,
  potential: PlayerAbilities,
): Player {
  return {
    id: playerId(`player:aging-${position}`),
    firstName: "Aging",
    lastName: "Policy",
    birthDate: 1 as Player["birthDate"],
    naturalPositions: [position],
    primaryRole,
    abilities,
    potential,
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
