import assert from "node:assert/strict";
import { test } from "vitest";

import {
  deriveOpportunityRoutePlan,
  opportunityRouteBudget,
  opportunityRouteSaturation,
  opportunityRouteStrategicSignature,
  type DeriveOpportunityRoutePlanInput,
  type OpportunityRoutePlan,
} from "@game/engine";
import { tacticalAgencyShapeAsymmetryBasisPoints } from "@game/simulation-tools";

import {
  buildTacticalAgencyLowBlockInput,
  runTacticalAgencyConditionedWorld,
} from "./tactical-agency-world.ts";

test("all lateral focuses reallocate a route budget on production-selected real-career elevens", () => {
  const input = buildTacticalAgencyLowBlockInput({
    worldSeed: "phase81a-step05-lateral-reachability-world",
    seedPrefix: "phase81a-step05-lateral-reachability-replay",
    pairedSeedCount: 1,
  });
  const base: Omit<DeriveOpportunityRoutePlanInput, "lateralFocus" | "opponentLateralFocus"> = {
    own: input.own.shape,
    opponent: input.opponent.shape,
    ownTactics: input.neutralTactics,
    opponentTactics: input.neutralTactics,
    caps: input.engineConfig.tacticalDistributionCaps,
    calibration: input.matchTacticsCalibration,
    goalDifference: 0,
  };
  const plan = (
    lateralFocus: DeriveOpportunityRoutePlanInput["lateralFocus"],
    opponentLateralFocus: DeriveOpportunityRoutePlanInput["opponentLateralFocus"] = "balanced",
  ): OpportunityRoutePlan => deriveOpportunityRoutePlan({ ...base, lateralFocus, opponentLateralFocus });
  const balanced = plan("balanced");
  const left = plan("left");
  const right = plan("right");
  const againstOpponentLeft = plan("balanced", "left");

  assert.equal(opportunityRouteBudget(left), opportunityRouteBudget(balanced));
  assert.equal(opportunityRouteBudget(right), opportunityRouteBudget(balanced));
  assert.equal(left.contestByRoute.left.allocation > balanced.contestByRoute.left.allocation, true);
  assert.equal(left.contestByRoute.right.allocation < balanced.contestByRoute.right.allocation, true);
  assert.equal(right.contestByRoute.right.allocation > balanced.contestByRoute.right.allocation, true);
  assert.equal(right.contestByRoute.left.allocation < balanced.contestByRoute.left.allocation, true);
  assert.equal(opportunityRouteSaturation(left, "left") > opportunityRouteSaturation(balanced, "left"), true);
  assert.equal(opportunityRouteSaturation(right, "right") > opportunityRouteSaturation(balanced, "right"), true);
  assert.equal(
    opportunityRouteSaturation(againstOpponentLeft, "right")
      > opportunityRouteSaturation(balanced, "right"),
    true,
  );
  assert.equal(new Set([balanced, left, right].map(opportunityRouteStrategicSignature)).size, 3);
});

test("B2 selects every domestic club once and retains both directions of each fixture", () => {
  const world = runTacticalAgencyConditionedWorld({
    worldSeed: "phase81a-b2-real-population-reachability",
  });
  const clubCount = world.populationRows.reduce((sum, row) => sum + row.clubCount, 0);
  const ownClubIds = world.matchups.map(({ own }) => String(own.clubId));

  assert.equal(world.populationRows.length, 3);
  assert.equal(world.matchups.length, clubCount);
  assert.equal(world.clubSelections.length, clubCount);
  assert.equal(new Set(ownClubIds).size, clubCount);
  assert.equal(world.matchups.every((matchup) =>
    world.matchups.some((candidate) =>
      candidate.own.clubId === matchup.opponent.clubId
      && candidate.opponent.clubId === matchup.own.clubId)), true);
  assert.equal(world.populationRows.every(({ distinctFormationCount }) => distinctFormationCount > 1), true);
  assert.equal(world.matchups.some((matchup) =>
    tacticalAgencyShapeAsymmetryBasisPoints(matchup.own.shape, matchup.opponent.shape) >= 500), true);
});
