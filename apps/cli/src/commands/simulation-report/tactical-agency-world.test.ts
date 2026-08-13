import assert from "node:assert/strict";
import { test } from "vitest";

import { matchTacticsCalibration } from "@game/content";
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
  const reachabilityWorlds = Array.from({ length: 7 }, (_, index) =>
    runTacticalAgencyConditionedWorld({
      worldSeed: `phase81a-b2-real-population-reachability-${String(index).padStart(2, "0")}`,
    }));
  assert.equal(reachabilityWorlds.some(({ matchups }) => matchups.some((matchup) =>
    tacticalAgencyShapeAsymmetryBasisPoints(matchup.own.shape, matchup.opponent.shape) >= 500)), true);
  const tacticalSelections = reachabilityWorlds.flatMap(({ clubSelections }) => clubSelections);
  const profileKeys = matchTacticsCalibration.ownSquadTacticalPolicy.profiles.map(({ profileKey }) => profileKey);
  const selectedProfileCounts = Object.fromEntries(profileKeys.map((profileKey) => [
    profileKey,
    tacticalSelections.filter(({ tacticalPolicy }) => tacticalPolicy.ownFit.profileKey === profileKey).length,
  ]));
  const balancedMargins = tacticalSelections.map(({ tacticalPolicy }) => {
    const balancedBest = Math.max(...tacticalPolicy.candidates
      .filter(({ profileKey }) => profileKey === "balanced")
      .map(({ totalFit }) => totalFit));
    const committedBest = Math.max(...tacticalPolicy.candidates
      .filter(({ profileKey }) => profileKey !== "balanced")
      .map(({ totalFit }) => totalFit));
    return balancedBest - committedBest;
  });
  const reachabilityDiagnostic = {
    selectedProfileCounts,
    balancedMarginMinimum: Math.min(...balancedMargins),
    balancedMarginMaximum: Math.max(...balancedMargins),
    profileFitRanges: Object.fromEntries(profileKeys.map((profileKey) => {
      const fits = tacticalSelections.flatMap(({ tacticalPolicy }) => tacticalPolicy.candidates
        .filter((candidate) => candidate.profileKey === profileKey && candidate.lateralFocus === "balanced")
        .map(({ profileFit }) => profileFit));
      return [profileKey, { minimum: Math.min(...fits), maximum: Math.max(...fits) }];
    })),
  };
  assert.deepEqual(selectedProfileCounts, {
    balanced: 1,
    patient_possession: 67,
    high_press: 3,
    direct_transition: 60,
    wide_overload: 200,
    compact_counter: 47,
  });
  assert.deepEqual(
    new Set(tacticalSelections.map(({ tacticalPolicy }) => tacticalPolicy.ownFit.profileKey)),
    new Set(profileKeys),
    JSON.stringify(reachabilityDiagnostic),
  );
  assert.deepEqual(
    new Set(tacticalSelections.map(({ tacticalPolicy }) => tacticalPolicy.ownFit.lateralFocus)),
    new Set(["balanced", "left", "right"]),
  );
  assert.equal(tacticalSelections.every(({ tacticalPolicy }) => tacticalPolicy.tiedAtBestCount === 1), true);
  assert.equal(tacticalSelections.every(({ tacticalPolicy }) =>
    tacticalPolicy.candidates.length === profileKeys.length * 3
    && tacticalPolicy.candidates.includes(tacticalPolicy.ownFit)
    && tacticalPolicy.candidates.includes(tacticalPolicy.mismatch)
    && tacticalPolicy.candidates.includes(tacticalPolicy.nonCommit)
    && tacticalPolicy.candidates.includes(tacticalPolicy.blind)), true);
});
