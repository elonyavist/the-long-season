import assert from "node:assert/strict";
import { test } from "vitest";

import {
  abilityValue,
  isPotentialAtLeastCurrent,
  getPlayerRoleProfile,
  PLAYER_ABILITY_KEYS,
  readPlayerAbility,
  rolePotentialAbility,
  type PlayerAbilities,
} from "@game/domain";

import { allocateReachablePotential } from "./player-potential-allocation.ts";

/** Tests for age-aware reachable potential allocation from current ability. */

test("age-26 outfield physical and wide technical potential cannot make impossible jumps", () => {
  const current = filledAbilities(8, {
    physical: { pace: 10 },
    technical: { crossing: 4.3 },
  });
  const potential = allocateReachablePotential({
    seed: "age-26-boundary",
    playerKey: "player:age-26-winger",
    abilities: current,
    ageYears: 26,
    role: "winger",
    division: "third_division",
    clubTier: "title_contender",
    potentialClass: "elite",
  });

  assert.equal(Number(potential.physical.pace) <= 10.6, true);
  assert.equal(Number(potential.technical.crossing) <= 5.5, true);
});

test("young elite players can have meaningful but focused reachable upside", () => {
  const current = filledAbilities(9, {
    physical: { pace: 14 },
    technical: { crossing: 12, dribbling: 11 },
  });
  const potential = allocateReachablePotential({
    seed: "age-18-winger-upside",
    playerKey: "player:age-18-winger",
    abilities: current,
    ageYears: 18,
    role: "winger",
    division: "third_division",
    clubTier: "playoff_contender",
    potentialClass: "elite",
  });
  const highGrowthCount = PLAYER_ABILITY_KEYS.filter(
    (key) => Number(readPlayerAbility(potential, key)) - Number(readPlayerAbility(current, key)) >= 2,
  ).length;

  assert.equal(Number(potential.physical.pace) > 14, true);
  assert.equal(highGrowthCount >= 3, true);
  assert.equal(highGrowthCount < 18, true);
});

test("potential remains ordered, capped, and valid for every ability", () => {
  const current = filledAbilities(13);
  const potential = allocateReachablePotential({
    seed: "valid-potential",
    playerKey: "player:valid",
    abilities: current,
    ageYears: 22,
    role: "central_midfielder",
    division: "second_division",
    clubTier: "mid_table",
    potentialClass: "interesting",
  });

  assert.equal(isPotentialAtLeastCurrent(current, potential), true);
  for (const key of PLAYER_ABILITY_KEYS) {
    const value = Number(readPlayerAbility(potential, key));
    assert.equal(value >= Number(readPlayerAbility(current, key)) && value <= 20, true, key);
  }
});

test("role caps still constrain potential for incoherent attributes", () => {
  const potential = allocateReachablePotential({
    seed: "potential-role-cap",
    playerKey: "player:center-back",
    abilities: filledAbilities(9, {
      technical: { finishing: 9.8 },
      goalkeeping: {
        reflexes: 4,
        handling: 4,
        rushingOut: 4,
        goalkeeperPositioning: 4,
        footwork: 4,
      },
    }),
    ageYears: 18,
    role: "center_back",
    division: "first_division",
    clubTier: "title_contender",
    potentialClass: "elite",
  });

  assert.equal(Number(potential.technical.finishing) <= 10, true);
  assert.equal(Number(potential.goalkeeping.reflexes) <= 4, true);
});

test("goalkeeper potential keeps a later curve than outfield physical growth", () => {
  const goalkeeper = allocateReachablePotential({
    seed: "goalkeeper-curve",
    playerKey: "player:gk",
    abilities: filledAbilities(10),
    ageYears: 29,
    role: "goalkeeper",
    division: "second_division",
    clubTier: "playoff_contender",
    potentialClass: "interesting",
  });
  const winger = allocateReachablePotential({
    seed: "goalkeeper-curve",
    playerKey: "player:winger",
    abilities: filledAbilities(10),
    ageYears: 29,
    role: "winger",
    division: "second_division",
    clubTier: "playoff_contender",
    potentialClass: "interesting",
  });

  assert.equal(Number(goalkeeper.goalkeeping.reflexes) > 10, true);
  assert.equal(Number(winger.physical.pace) <= 10.2, true);
});

test("an explicit world intake assignment reaches its requested role-potential floor", () => {
  const current = filledAbilities(8);
  const potential = allocateReachablePotential({
    seed: "world-potential-six",
    playerKey: "player:world-potential-six",
    abilities: current,
    ageYears: 17,
    role: "central_midfielder",
    division: "second_division",
    clubTier: "playoff_contender",
    potentialClass: "elite",
    minimumRolePotentialAbility: 17,
  });

  assert.equal(
    Number(rolePotentialAbility(potential, getPlayerRoleProfile("central_midfielder"))) >= 17,
    true,
  );
  assert.equal(isPotentialAtLeastCurrent(current, potential), true);
});

function filledAbilities(value: number, overrides: PartialDeepPlayerAbilities = {}): PlayerAbilities {
  return {
    technical: {
      finishing: rating(overrides.technical?.finishing ?? value),
      passing: rating(overrides.technical?.passing ?? value),
      longPassing: rating(overrides.technical?.longPassing ?? value),
      crossing: rating(overrides.technical?.crossing ?? value),
      dribbling: rating(overrides.technical?.dribbling ?? value),
      technique: rating(overrides.technical?.technique ?? value),
      tackling: rating(overrides.technical?.tackling ?? value),
      penalties: rating(overrides.technical?.penalties ?? value),
      freeKicks: rating(overrides.technical?.freeKicks ?? value),
    },
    physical: {
      pace: rating(overrides.physical?.pace ?? value),
      strength: rating(overrides.physical?.strength ?? value),
      stamina: rating(overrides.physical?.stamina ?? value),
      agility: rating(overrides.physical?.agility ?? value),
      heading: rating(overrides.physical?.heading ?? value),
    },
    mental: {
      positioning: rating(overrides.mental?.positioning ?? value),
      vision: rating(overrides.mental?.vision ?? value),
      anticipation: rating(overrides.mental?.anticipation ?? value),
      composure: rating(overrides.mental?.composure ?? value),
      determination: rating(overrides.mental?.determination ?? value),
      leadership: rating(overrides.mental?.leadership ?? value),
    },
    goalkeeping: {
      reflexes: rating(overrides.goalkeeping?.reflexes ?? value),
      handling: rating(overrides.goalkeeping?.handling ?? value),
      rushingOut: rating(overrides.goalkeeping?.rushingOut ?? value),
      goalkeeperPositioning: rating(overrides.goalkeeping?.goalkeeperPositioning ?? value),
      footwork: rating(overrides.goalkeeping?.footwork ?? value),
    },
  };
}

function rating(value: number) {
  return abilityValue(value);
}

type PartialDeepPlayerAbilities = {
  readonly [Group in keyof PlayerAbilities]?: Partial<Record<keyof PlayerAbilities[Group], number>>;
};
