import assert from "node:assert/strict";
import { test } from "vitest";

import type { PlayerAbilities } from "../entities/player.entity.ts";
import { abilityValue } from "../value-objects/rating.ts";
import {
  InvalidAbilityWeightProfileError,
  PLAYER_ABILITY_KEYS,
  foldPlayerAbilities,
  isPotentialAtLeastCurrent,
  mapPlayerAbilities,
  potentialAtLeastCurrent,
  rawDiagnosticAbilityAverage,
  readPlayerAbility,
  roleCurrentAbility,
  rolePotentialAbility,
} from "./player-abilities.ts";

test("canonical ability order contains every stored attribute exactly once", () => {
  assert.equal(PLAYER_ABILITY_KEYS.length, 25);
  assert.equal(new Set(PLAYER_ABILITY_KEYS).size, 25);
  assert.deepEqual(PLAYER_ABILITY_KEYS.slice(0, 3), [
    "technical.finishing",
    "technical.passing",
    "technical.longPassing",
  ]);
  assert.deepEqual(PLAYER_ABILITY_KEYS.slice(-3), [
    "goalkeeping.rushingOut",
    "goalkeeping.goalkeeperPositioning",
    "goalkeeping.footwork",
  ]);
});

test("read, map, and fold share the same deterministic traversal", () => {
  const mapped = mapPlayerAbilities(filledAbilities(1), (_value, _key, index) => abilityValue((index % 20) + 1));
  const visited = foldPlayerAbilities(mapped, [] as number[], (values, value) => [...values, Number(value)]);

  assert.equal(Number(readPlayerAbility(mapped, "technical.finishing")), 1);
  assert.equal(Number(readPlayerAbility(mapped, "goalkeeping.footwork")), 5);
  assert.deepEqual(visited, [...Array.from({ length: 20 }, (_, index) => index + 1), 1, 2, 3, 4, 5]);
  assert.equal(Number(rawDiagnosticAbilityAverage(mapped)), 9);
});

test("current and potential role ability use identical weights without rounding", () => {
  const current = mapPlayerAbilities(filledAbilities(1), (value, key) =>
    key === "technical.finishing" ? abilityValue(14.5) : value,
  );
  const potential = mapPlayerAbilities(current, (value, key) =>
    key === "technical.finishing" ? abilityValue(18.5) : value,
  );
  const profile = {
    weights: {
      "technical.finishing": 3,
      "mental.composure": 1,
    },
  } as const;

  assert.equal(Number(roleCurrentAbility(current, profile)), 11.125);
  assert.equal(Number(rolePotentialAbility(potential, profile)), 14.125);
});

test("role ability rejects empty, negative, and non-finite weight profiles", () => {
  const abilities = filledAbilities(10);

  assert.throws(() => roleCurrentAbility(abilities, { weights: {} }), InvalidAbilityWeightProfileError);
  assert.throws(
    () => roleCurrentAbility(abilities, { weights: { "technical.finishing": -1 } }),
    InvalidAbilityWeightProfileError,
  );
  assert.throws(
    () => roleCurrentAbility(abilities, { weights: { "technical.finishing": Number.NaN } }),
    InvalidAbilityWeightProfileError,
  );
});

test("potential clamp raises only attributes below current", () => {
  const current = mapPlayerAbilities(filledAbilities(10), (_value, _key, index) => abilityValue(index % 2 === 0 ? 12 : 8));
  const proposed = filledAbilities(10);
  const clamped = potentialAtLeastCurrent(current, proposed);

  assert.equal(isPotentialAtLeastCurrent(current, proposed), false);
  assert.equal(isPotentialAtLeastCurrent(current, clamped), true);
  assert.equal(Number(readPlayerAbility(clamped, "technical.finishing")), 12);
  assert.equal(Number(readPlayerAbility(clamped, "technical.passing")), 10);
});

function filledAbilities(value: number): PlayerAbilities {
  const rated = abilityValue(value);
  return {
    technical: {
      finishing: rated,
      passing: rated,
      longPassing: rated,
      crossing: rated,
      dribbling: rated,
      technique: rated,
      tackling: rated,
      penalties: rated,
      freeKicks: rated,
    },
    physical: {
      pace: rated,
      strength: rated,
      stamina: rated,
      agility: rated,
      heading: rated,
    },
    mental: {
      positioning: rated,
      vision: rated,
      anticipation: rated,
      composure: rated,
      determination: rated,
      leadership: rated,
    },
    goalkeeping: {
      reflexes: rated,
      handling: rated,
      rushingOut: rated,
      goalkeeperPositioning: rated,
      footwork: rated,
    },
  };
}
