import assert from "node:assert/strict";
import { test } from "vitest";

import { fixtureId, playerId, seasonId } from "@game/domain";

import {
  monthlyDevelopmentPolicy,
  monthlyGrowthAgeMultiplier,
  monthlyOpportunityMultiplier,
  monthlyPerformanceModifier,
} from "./player-development-policy.ts";

test("monthlyOpportunityMultiplier rewards credible minutes without making tiny cameos equal starts", () => {
  assert.equal(monthlyOpportunityMultiplier(0), 0);
  assert.equal(monthlyOpportunityMultiplier(20), 0.15);
  assert.equal(monthlyOpportunityMultiplier(180), 0.45);
  assert.equal(monthlyOpportunityMultiplier(360), 0.75);
  assert.equal(monthlyOpportunityMultiplier(450), 1);
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
    participation: {
      rowKey: "season:0001|2026-08|player:monthly",
      playerId: playerId("player:monthly"),
      seasonId: seasonId("season:0001"),
      monthKey: "2026-08",
      starts: 4,
      substituteAppearances: 0,
      minutes: 360,
      ratingTotal: 16,
      ratingSamples: 2,
      playedRoleMinutes: { central_midfielder: 360 },
      appliedFixtureIds: [fixtureId("fixture:000001")],
    },
  });

  assert.equal(policy.ageMultiplier, 0.85);
  assert.equal(policy.opportunityMultiplier, 0.75);
  assert.equal(policy.performanceModifier, 1.15);
  assert.equal(Number(policy.growthMultiplier.toFixed(4)), 0.7331);
});
