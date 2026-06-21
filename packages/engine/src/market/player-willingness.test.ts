import assert from "node:assert/strict";
import { test } from "vitest";

import {
  abilityValue,
  clubId,
  gameDate,
  playerId,
  type Club,
  type Player,
  type PlayerAbilities,
  type PlayerPosition,
} from "@game/domain";

import { derivePlayerWillingness } from "./player-willingness.ts";

/**
 * Player willingness tests lock only the early sporting-level behavior.
 *
 * Later career systems can add new inputs through documented phases without
 * changing these baseline guarantees.
 */
test("accepts a plausible same-level move", () => {
  const result = derivePlayerWillingness({
    player: playerFixture("01", "st", 11, 25),
    sellingClub: clubFixture("pro08", "third_division", 5),
    buyingClub: clubFixture("pro01", "third_division", 6),
    currentDate: gameDate(20_000),
  });

  assert.equal(result.status, "accepted");
  assert.deepEqual(result.reasons, []);
  assert.equal(result.categoryDrop, 0);
});

test("rejects a strong first-division prime player moving to a third-division club", () => {
  const result = derivePlayerWillingness({
    player: playerFixture("01", "st", 15, 27),
    sellingClub: clubFixture("elite01", "first_division", 10),
    buyingClub: clubFixture("pro01", "third_division", 5),
    currentDate: gameDate(20_000),
  });

  assert.equal(result.status, "rejected");
  assert.deepEqual(
    result.reasons.map((reason) => reason.code),
    ["sporting_level_too_low", "reputation_drop_too_large", "prime_player_downward_move"],
  );
});

test("rejects a high-reputation one-level downgrade for a strong player", () => {
  const result = derivePlayerWillingness({
    player: playerFixture("01", "am", 13, 26),
    sellingClub: clubFixture("elite01", "first_division", 9),
    buyingClub: clubFixture("pro01", "second_division", 4),
    currentDate: gameDate(20_000),
  });

  assert.equal(result.status, "rejected");
  assert.deepEqual(
    result.reasons.map((reason) => reason.code),
    ["reputation_drop_too_large", "prime_player_downward_move"],
  );
});

test("accepts a younger non-star one-level downgrade", () => {
  const result = derivePlayerWillingness({
    player: playerFixture("01", "cm", 10.5, 20),
    sellingClub: clubFixture("elite01", "first_division", 7),
    buyingClub: clubFixture("pro01", "second_division", 5),
    currentDate: gameDate(20_000),
  });

  assert.equal(result.status, "accepted");
  assert.deepEqual(result.reasons, []);
  assert.equal(result.age, 20);
});

test("returns structured category and reputation gaps", () => {
  const result = derivePlayerWillingness({
    player: playerFixture("01", "st", 14, 28),
    sellingClub: clubFixture("elite01", "first_division", 9),
    buyingClub: clubFixture("pro01", "third_division", 4),
    currentDate: gameDate(20_000),
  });

  assert.equal(result.categoryDrop, 2);
  assert.equal(result.reputationDrop, 5);
  assert.equal(result.currentAbilityAverage, 14);
});

function playerFixture(suffix: string, primaryPosition: PlayerPosition, currentAbility: number, age: number): Player {
  return {
    id: playerId(`player:test-${suffix}`),
    firstName: "Test",
    lastName: `Player${suffix}`,
    birthDate: gameDate(20_000 - age * 365),
    naturalPositions: [primaryPosition],
    abilities: abilitiesFixture(currentAbility),
    potential: abilitiesFixture(currentAbility + 1),
  };
}

function clubFixture(suffix: string, category: Club["category"], reputation: number): Club {
  return {
    id: clubId(`club:${suffix}`),
    name: `Club ${suffix}`,
    shortName: suffix.toUpperCase(),
    category,
    reputation,
    playerIds: [],
  };
}

function abilitiesFixture(value: number): PlayerAbilities {
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
