import assert from "node:assert/strict";
import { test } from "vitest";

import {
  clubId,
  gameDate,
  nonNegativeMoney,
  playerContractId,
  playerId,
  type Club,
} from "@game/domain";

import type { PublicPlayerAssessment } from "../squad/public-player-assessment.ts";
import { marketBehaviorConfigFixture } from "../test-fixtures/market-behavior-config.ts";
import { derivePlayerWillingness as derivePlayerWillingnessWithPolicy } from "./player-willingness.ts";

const ASSESSED_ON = gameDate(20_000);

function derivePlayerWillingness(
  input: Omit<
    Parameters<typeof derivePlayerWillingnessWithPolicy>[0],
    "marketBehaviorPolicy"
  >,
) {
  return derivePlayerWillingnessWithPolicy({
    ...input,
    marketBehaviorPolicy: marketBehaviorConfigFixture(),
  });
}

/** Player willingness is based on the same public facts visible to the manager. */
test("accepts a plausible same-level move", () => {
  const result = derivePlayerWillingness({
    publicAssessment: assessmentFixture("01", 11, 25),
    sellingClub: clubFixture("pro08", "third_division", 5),
    buyingClub: clubFixture("pro01", "third_division", 6),
    currentTier: "third_division",
    destinationTier: "third_division",
  });

  assert.equal(result.status, "accepted");
  assert.deepEqual(result.reasons, []);
  assert.equal(result.categoryDrop, 0);
});

test("rejects a strong first-division prime player moving to a third-division club", () => {
  const result = derivePlayerWillingness({
    publicAssessment: assessmentFixture("01", 15, 27),
    sellingClub: clubFixture("elite01", "first_division", 10),
    buyingClub: clubFixture("pro01", "third_division", 5),
    currentTier: "first_division",
    destinationTier: "third_division",
  });

  assert.equal(result.status, "rejected");
  assert.deepEqual(
    result.reasons.map((reason) => reason.code),
    ["sporting_level_too_low", "reputation_drop_too_large", "prime_player_downward_move"],
  );
});

test("rejects a high-reputation one-level downgrade for a strong player", () => {
  const result = derivePlayerWillingness({
    publicAssessment: assessmentFixture("01", 13, 26),
    sellingClub: clubFixture("elite01", "first_division", 9),
    buyingClub: clubFixture("pro01", "second_division", 4),
    currentTier: "first_division",
    destinationTier: "second_division",
  });

  assert.equal(result.status, "rejected");
  assert.deepEqual(
    result.reasons.map((reason) => reason.code),
    ["reputation_drop_too_large", "prime_player_downward_move"],
  );
});

test("accepts a younger non-star one-level downgrade", () => {
  const result = derivePlayerWillingness({
    publicAssessment: assessmentFixture("01", 10.5, 20),
    sellingClub: clubFixture("elite01", "first_division", 7),
    buyingClub: clubFixture("pro01", "second_division", 5),
    currentTier: "first_division",
    destinationTier: "second_division",
  });

  assert.equal(result.status, "accepted");
  assert.deepEqual(result.reasons, []);
  assert.equal(result.age, 20);
});

test("protects a young player whose public upper estimate reaches six stars", () => {
  const result = derivePlayerWillingness({
    publicAssessment: assessmentFixture("elite-prospect", 8, 18, 6),
    sellingClub: clubFixture("elite01", "first_division", 7),
    buyingClub: clubFixture("pro01", "second_division", 5),
    currentTier: "first_division",
    destinationTier: "second_division",
  });

  assert.equal(result.status, "rejected");
  assert.deepEqual(
    result.reasons.map((reason) => reason.code),
    ["sporting_level_too_low"],
  );
});

test("returns structured category and reputation gaps", () => {
  const result = derivePlayerWillingness({
    publicAssessment: assessmentFixture("01", 14, 28),
    sellingClub: clubFixture("elite01", "first_division", 9),
    buyingClub: clubFixture("pro01", "third_division", 4),
    currentTier: "first_division",
    destinationTier: "third_division",
  });

  assert.equal(result.categoryDrop, 2);
  assert.equal(result.reputationDrop, 5);
  assert.ok(Math.abs(result.currentAbility - 14) < 1e-9);
});

test("uses canonical public current ability without reopening player attributes", () => {
  const result = derivePlayerWillingness({
    publicAssessment: assessmentFixture("specialist", 13.5, 27),
    sellingClub: clubFixture("elite01", "first_division", 9),
    buyingClub: clubFixture("pro01", "second_division", 4),
    currentTier: "first_division",
    destinationTier: "second_division",
  });

  assert.equal(result.currentAbility, 13.5);
  assert.equal(result.status, "rejected");
  assert.deepEqual(
    result.reasons.map((reason) => reason.code),
    [
      "reputation_drop_too_large",
      "prime_player_downward_move",
    ],
  );
});

test("rejects same-tier terms that regress wage, status, and contract security", () => {
  const publicAssessment = assessmentFixture("terms", 11, 25);
  const sellingClub = clubFixture("pro08", "third_division", 6);
  const buyingClub = clubFixture("pro01", "third_division", 6);
  const result = derivePlayerWillingness({
    publicAssessment,
    sellingClub,
    buyingClub,
    currentTier: "third_division",
    destinationTier: "third_division",
    currentContract: {
      id: playerContractId("contract:terms-current"),
      playerId: publicAssessment.playerId,
      clubId: sellingClub.id,
      type: "professional",
      startsOn: gameDate(ASSESSED_ON - 365),
      endsOn: gameDate(ASSESSED_ON + 3 * 365),
      annualWage: nonNegativeMoney(100_000_00),
      squadStatus: "regular_starter",
      bonuses: {
        signingBonus: nonNegativeMoney(0),
        appearanceBonus: nonNegativeMoney(0),
      },
    },
    proposedTerms: {
      durationYears: 2,
      annualWage: nonNegativeMoney(80_000_00),
      squadStatus: "squad_player",
      bonuses: {
        signingBonus: nonNegativeMoney(0),
        appearanceBonus: nonNegativeMoney(0),
      },
    },
  });

  assert.equal(result.status, "rejected");
  assert.deepEqual(
    result.reasons.map((reason) => reason.code),
    [
      "annual_wage_regression",
      "squad_status_regression",
      "contract_security_regression",
    ],
  );
});

function assessmentFixture(
  suffix: string,
  currentAbility: number,
  age: number,
  upperStars: PublicPlayerAssessment["upperRating"]["stars"] = 4,
): PublicPlayerAssessment {
  return {
    playerId: playerId(`player:test-${suffix}`),
    assessedOn: ASSESSED_ON,
    age,
    roleFamily: "outfield",
    currentAbility,
    p50Ability: currentAbility + 0.5,
    upperAbility: currentAbility + 1,
    currentRating: { stars: 3 },
    p50Rating: { stars: 3.5 },
    upperRating: { stars: upperStars },
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
