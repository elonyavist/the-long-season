import assert from "node:assert/strict";
import { test } from "vitest";

import { clubId, fixtureId, playerId, seasonId } from "@game/domain";

import {
  environmentMultiplierFromBasisPoints,
  monthlyDevelopmentPolicy,
  monthlyGrowthAgeMultiplier,
  monthlyOpportunityMultiplier,
  monthlyPerformanceModifier,
} from "./player-development-policy.ts";

test("monthlyOpportunityMultiplier rewards credible minutes without making tiny cameos equal starts", () => {
  assert.equal(monthlyOpportunityMultiplier(0), 0);
  assert.equal(monthlyOpportunityMultiplier(20), 0.15);
  assert.equal(monthlyOpportunityMultiplier(90), 0.45);
  assert.equal(monthlyOpportunityMultiplier(180), 0.75);
  assert.equal(monthlyOpportunityMultiplier(270), 1);
});

test("monthlyPerformanceModifier is bounded to roughly fifteen percent", () => {
  assert.equal(monthlyPerformanceModifier(undefined), 1);
  assert.equal(monthlyPerformanceModifier(4), 0.85);
  assert.equal(monthlyPerformanceModifier(6.5), 1);
  assert.equal(monthlyPerformanceModifier(9), 1.15);
});

test("monthlyGrowthAgeMultiplier keeps mature outfield growth small", () => {
  assert.equal(monthlyGrowthAgeMultiplier("attacker", 19), 0.85);
  assert.equal(monthlyGrowthAgeMultiplier("midfielder", 26), 0.2);
  assert.equal(monthlyGrowthAgeMultiplier("attacker", 28), 0);
  assert.equal(monthlyGrowthAgeMultiplier("goalkeeper", 26), 0.45);
});

test("monthlyDevelopmentPolicy combines age, minutes, and bounded performance", () => {
  const policy = monthlyDevelopmentPolicy({
    positionGroup: "midfielder",
    age: 19,
    // Exactly the three facts the policy reads. A full ledger row still
    // satisfies this input structurally, as the production call site proves.
    participation: { minutes: 360, ratingTotal: 16, ratingSamples: 2 },
    positiveGrowthEnvironmentBasisPoints: 11_000,
  });

  assert.equal(policy.ageMultiplier, 0.85);
  assert.equal(policy.opportunityMultiplier, 1);
  assert.equal(policy.performanceModifier, 1.15);
  assert.equal(policy.environmentMultiplier, 1.1);
  assert.equal(Number(policy.growthMultiplier.toFixed(4)), 1.0753);
});

test("environmentMultiplierFromBasisPoints keeps club context bounded and explicit", () => {
  assert.equal(environmentMultiplierFromBasisPoints(9_200), 0.92);
  assert.equal(environmentMultiplierFromBasisPoints(10_000), 1);
  assert.equal(environmentMultiplierFromBasisPoints(11_000), 1.1);
  assert.throws(() => environmentMultiplierFromBasisPoints(0), RangeError);
});
