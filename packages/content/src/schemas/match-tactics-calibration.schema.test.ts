import assert from "node:assert/strict";
import { test } from "vitest";

import matchTacticsCalibrationJson from "../balance/match-tactics-calibration.json" with { type: "json" };
import {
  MatchTacticsCalibrationValidationError,
  parseMatchTacticsCalibrationAsset,
} from "./match-tactics-calibration.schema.ts";

/**
 * Schema tests prove the two validation layers actually run: the structural
 * one that rejects unknown or missing keys, and the domain one that rejects
 * numbers which parse fine but break a football invariant.
 */

test("the shipped asset parses and is deeply frozen", () => {
  const calibration = parseMatchTacticsCalibrationAsset(matchTacticsCalibrationJson);

  assert.equal(Object.isFrozen(calibration), true);
  assert.equal(Object.isFrozen(calibration.tacticalShape.contributionWeightBasisPointsByRoleAndTask), true);
  assert.equal(Object.isFrozen(calibration.tacticalShape.contributionWeightBasisPointsByRoleAndTask.striker), true);
});

test("an unknown key is rejected instead of ignored", () => {
  assert.throws(
    () => {
      parseMatchTacticsCalibrationAsset({
        ...structuredClone(matchTacticsCalibrationJson),
        unexpected: 1,
      });
    },
    MatchTacticsCalibrationValidationError,
  );
});

test("a missing task weight is rejected", () => {
  const raw = structuredClone(matchTacticsCalibrationJson) as Record<string, unknown>;
  const shape = raw["tacticalShape"] as Record<string, Record<string, Record<string, number>>>;
  delete shape["contributionWeightBasisPointsByRoleAndTask"]?.["striker"]?.["build_up"];

  assert.throws(() => {
    parseMatchTacticsCalibrationAsset(raw);
  }, MatchTacticsCalibrationValidationError);
});

test("a matchup weight outside its band is rejected by the policy layer", () => {
  const raw = structuredClone(matchTacticsCalibrationJson) as Record<string, unknown>;
  const matchup = raw["tacticalMatchup"] as Record<string, number>;
  matchup["chainBottleneckWeightBasisPoints"] = 1_000;

  assert.throws(
    () => {
      parseMatchTacticsCalibrationAsset(raw);
    },
    (error: unknown) =>
      error instanceof MatchTacticsCalibrationValidationError && error.message.includes("policy validation failed"),
  );
});

test("a structurally valid asset that breaks a football invariant is still rejected", () => {
  const raw = structuredClone(matchTacticsCalibrationJson) as Record<string, unknown>;
  const shape = raw["tacticalShape"] as Record<string, Record<string, Record<string, number>>>;
  const goalkeeper = shape["contributionWeightBasisPointsByRoleAndTask"]?.["goalkeeper"];
  assert.notEqual(goalkeeper, undefined);
  (goalkeeper as Record<string, number>)["build_up"] = 5_000;

  assert.throws(
    () => {
      parseMatchTacticsCalibrationAsset(raw);
    },
    (error: unknown) =>
      error instanceof MatchTacticsCalibrationValidationError && error.message.includes("policy validation failed"),
  );
});
