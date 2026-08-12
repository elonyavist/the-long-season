import assert from "node:assert/strict";
import { test } from "vitest";

import {
  CANONICAL_PLAYER_ROLES,
  MATCH_TACTICS_CALIBRATION_SCHEMA_VERSION,
  TACTICAL_SHAPE_MAXIMUM_CONTRIBUTORS,
  TACTICAL_SHAPE_TASK_KIND,
  TACTICAL_SHAPE_TASKS,
  tacticalRoleAllocationTotal,
} from "@game/domain";

import { matchTacticsCalibration } from "./match-tactics-calibration.ts";

/**
 * These tests assert the football *shape* of shipped tuning rather than its
 * coefficients. The one exception is external shooter propensity: those values
 * reproduce an immutable empirical audit and may not drift like game tuning.
 */

test("the shipped calibration exposes one stable version and schema", () => {
  assert.equal(matchTacticsCalibration.schemaVersion, MATCH_TACTICS_CALIBRATION_SCHEMA_VERSION);
  assert.equal(matchTacticsCalibration.version, "match-tactics-calibration-v7");
  assert.equal(matchTacticsCalibration.classification, "explicit_game_design_target");
  assert.equal(matchTacticsCalibration.version.length > 0, true);
});

test("the shipped route-volume conversion is the exact migrated 1.6 multiplier", () => {
  assert.equal(
    matchTacticsCalibration.tacticalSemantics.routeCapacitySeparationBasisPoints,
    16_000,
  );
});

test("assist eligibility reproduces the frozen non-dead-ball external share", () => {
  assert.equal(matchTacticsCalibration.chanceActorSelection.nonSetPieceAssistEligibilityBasisPoints, 7_512);
});

test("shooter propensity reproduces the frozen external baseline exactly", () => {
  assert.deepEqual(matchTacticsCalibration.chanceActorSelection.shooterPropensityBasisPointsByRole, {
    goalkeeper: 0,
    right_full_back: 4_372,
    center_back: 4_011,
    left_full_back: 4_417,
    defensive_midfielder: 7_704,
    central_midfielder: 12_079,
    right_midfielder: 13_335,
    left_midfielder: 13_990,
    attacking_midfielder: 18_573,
    right_winger: 18_366,
    left_winger: 20_442,
    striker: 24_234,
  });
});

test("mirrored roles are given identical weights", () => {
  const weights = matchTacticsCalibration.tacticalShape.taskAllocationBasisPointsByRole;

  assert.deepEqual(weights.right_full_back, weights.left_full_back);
  assert.deepEqual(weights.right_midfielder, weights.left_midfielder);
  assert.deepEqual(weights.right_winger, weights.left_winger);
});

test("the marginal ladder covers every rank a lineup can fill", () => {
  assert.equal(
    matchTacticsCalibration.tacticalShape.marginalContributionBasisPointsByRank.length,
    TACTICAL_SHAPE_MAXIMUM_CONTRIBUTORS,
  );
});

test("each task's best specialist is a role that owns it in football", () => {
  const weights = matchTacticsCalibration.tacticalShape.taskAllocationBasisPointsByRole;
  const expectedOwners: Readonly<Record<(typeof TACTICAL_SHAPE_TASKS)[number], readonly string[]>> = {
    build_up: ["defensive_midfielder"],
    central_progression: ["attacking_midfielder"],
    lateral_progression: ["right_winger", "left_winger"],
    final_third_presence: ["striker"],
    pressing_cohesion: ["central_midfielder", "right_midfielder", "left_midfielder"],
    central_coverage: ["defensive_midfielder"],
    lateral_coverage: ["right_full_back", "left_full_back"],
    box_protection: ["center_back"],
    counter_threat: ["striker"],
    rest_defence: ["center_back"],
  };

  for (const task of TACTICAL_SHAPE_TASKS) {
    const best = CANONICAL_PLAYER_ROLES.reduce((leader, role) =>
      weights[role][task] > weights[leader][task] ? role : leader,
    );

    assert.equal(
      expectedOwners[task].includes(best),
      true,
      `${task} should be owned by ${expectedOwners[task].join(" or ")}, not ${best}`,
    );
  }
});

test("the shipped chain stays bottleneck-dominated", () => {
  const { chainBottleneckWeightBasisPoints } = matchTacticsCalibration.tacticalMatchup;

  assert.equal(
    chainBottleneckWeightBasisPoints > 5_000,
    true,
    "the weakest phase must outweigh the average, or a dead phase stops mattering",
  );
});

test("pressing actually contests build-up", () => {
  assert.equal(
    matchTacticsCalibration.tacticalMatchup.pressingContestWeightBasisPoints > 0,
    true,
    "a zero contest weight would make pressing inert again",
  );
});

test("only coordination tasks can be touched by playing a man out of position", () => {
  const coordinationTasks = TACTICAL_SHAPE_TASKS.filter(
    (task) => TACTICAL_SHAPE_TASK_KIND[task] === "coordination",
  );

  assert.equal(coordinationTasks.length > 0, true);
  assert.equal(TACTICAL_SHAPE_TASK_KIND.final_third_presence, "presence");
  assert.equal(TACTICAL_SHAPE_TASK_KIND.counter_threat, "presence");
});

test("the shipped fit ladder charges a real but survivable cost", () => {
  const ladder = matchTacticsCalibration.tacticalShape.coordinationMultiplierBasisPointsBySuitability;

  assert.equal(ladder.natural, 10_000, "a natural fit is the neutral reference, never a bonus");
  assert.equal(ladder.invalid > 0, true, "even a nonsense fit leaves a player on the pitch");
  assert.equal(
    ladder.adapted > 8_000,
    true,
    "an adapted player must stay usable, or squad rotation becomes impossible",
  );
});

test("the goalkeeper is isolated from every shape task", () => {
  const goalkeeper = matchTacticsCalibration.tacticalShape.taskAllocationBasisPointsByRole.goalkeeper;

  for (const task of TACTICAL_SHAPE_TASKS) {
    assert.equal(goalkeeper[task], 0, `goalkeeper must not contribute to ${task}`);
  }
});

test("every shipped outfield role allocates the same finite tactical budget", () => {
  const shape = matchTacticsCalibration.tacticalShape;

  assert.equal(shape.outfieldRoleBudgetBasisPoints, 42_000);
  for (const role of CANONICAL_PLAYER_ROLES) {
    const allocations = shape.taskAllocationBasisPointsByRole[role];
    const total = tacticalRoleAllocationTotal(allocations);

    assert.equal(total, role === "goalkeeper" ? 0 : shape.outfieldRoleBudgetBasisPoints, role);
    for (const task of TACTICAL_SHAPE_TASKS) {
      assert.equal(role === "goalkeeper" ? allocations[task] === 0 : allocations[task] > 0, true, `${role}.${task}`);
    }
  }
});
