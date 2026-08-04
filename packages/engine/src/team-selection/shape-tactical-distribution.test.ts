import assert from "node:assert/strict";
import { test } from "vitest";

import { FORMATIONS, getFormation } from "@game/domain";

import { deriveShapeTacticalDistribution } from "./shape-tactical-distribution.ts";
import type { MatchTacticalDistributionInput } from "../match-engine/index.ts";

const NEUTRAL: MatchTacticalDistributionInput = {
  directness: 0.5,
  pressing: 0.5,
  width: 0.5,
  risk: 0.5,
  mentality: "balanced",
};

test("a committed shape and a protective one are not given the same instructions", () => {
  const committed = deriveShapeTacticalDistribution(getFormation("4-2-4"), NEUTRAL);
  const protective = deriveShapeTacticalDistribution(getFormation("5-4-1"), NEUTRAL);

  assert.equal(committed.risk > protective.risk, true);
});

test("a shape with fewer midfielders to play through goes more direct", () => {
  const thin = deriveShapeTacticalDistribution(getFormation("4-2-4"), NEUTRAL);
  const packed = deriveShapeTacticalDistribution(getFormation("3-6-1"), NEUTRAL);

  assert.equal(thin.directness > packed.directness, true);
});

test("a shape with more wide slots plays wider", () => {
  const wide = deriveShapeTacticalDistribution(getFormation("4-4-2"), NEUTRAL);
  const narrow = deriveShapeTacticalDistribution(getFormation("4-3-1-2"), NEUTRAL);

  assert.equal(wide.width > narrow.width, true);
});

/**
 * Holds this to a model of variation rather than a global rebalance.
 *
 * Every knob is a deviation from the average curated shape, so the twenty-three
 * of them average back to the setup the caller asked for. A derivation that
 * drifted off that centre would quietly move the whole game's balance point
 * while looking like it only varied opponents.
 */
test("the catalog as a whole still plays the setup it was given", () => {
  const derived = FORMATIONS.map((formation) => deriveShapeTacticalDistribution(formation, NEUTRAL));
  const mean = (read: (value: MatchTacticalDistributionInput) => number): number =>
    derived.reduce((total, value) => total + read(value), 0) / derived.length;

  assert.equal(Math.abs(mean((value) => value.risk) - NEUTRAL.risk) < 0.01, true);
  assert.equal(Math.abs(mean((value) => value.width) - NEUTRAL.width) < 0.01, true);
  assert.equal(Math.abs(mean((value) => value.directness) - NEUTRAL.directness) < 0.01, true);
});

test("pressing and mentality are left to their owners", () => {
  for (const formation of FORMATIONS) {
    const derived = deriveShapeTacticalDistribution(formation, NEUTRAL);

    assert.equal(derived.pressing, NEUTRAL.pressing);
    assert.equal(derived.mentality, NEUTRAL.mentality);
  }
});

test("every derived knob stays on the shared 0..1 scale", () => {
  for (const baseline of [0, 0.5, 1]) {
    for (const formation of FORMATIONS) {
      const derived = deriveShapeTacticalDistribution(formation, {
        ...NEUTRAL,
        directness: baseline,
        width: baseline,
        risk: baseline,
      });

      for (const value of [derived.directness, derived.width, derived.risk]) {
        assert.equal(value >= 0 && value <= 1, true);
      }
    }
  }
});
