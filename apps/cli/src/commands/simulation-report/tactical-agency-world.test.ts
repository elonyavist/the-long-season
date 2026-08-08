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

import { buildTacticalAgencyLowBlockInput } from "./tactical-agency-world.ts";

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
