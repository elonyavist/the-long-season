import assert from "node:assert/strict";
import { test } from "vitest";

import { validatePlayerStateCurvesConfig, type PlayerStateCurvesConfig } from "./player-state-curves.ts";

const VALID: PlayerStateCurvesConfig = {
  schemaVersion: 1,
  version: "test-v1",
  baseRecoveryHalfLifeDaysBasisPoints: 7_500,
  ageHalfLifeDaysPerYearBasisPoints: 5_000,
  agePenaltyStartsAtYears: 30,
  ageMatchLoadPerYearBasisPoints: 3_000,
  maximumAgeMatchLoadMultiplierBasisPoints: 25_000,
  resilienceWeightsBasisPoints: { stamina: 6_000, agility: 2_500, strength: 1_500 },
  lowResilienceHalfLifeMultiplierBasisPoints: 18_000,
  highResilienceHalfLifeMultiplierBasisPoints: 2_000,
};

test("player-state curves accept one total resilience policy", () => {
  assert.equal(validatePlayerStateCurvesConfig(VALID), VALID);
});

test("player-state curves reject non-total weights and reversed resilience", () => {
  assert.throws(() => validatePlayerStateCurvesConfig({
    ...VALID,
    resilienceWeightsBasisPoints: { ...VALID.resilienceWeightsBasisPoints, strength: 1_499 },
  }), /sum to 10000/);
  assert.throws(() => validatePlayerStateCurvesConfig({
    ...VALID,
    highResilienceHalfLifeMultiplierBasisPoints: 19_000,
  }), /reduce recovery half-life/);
  assert.throws(() => validatePlayerStateCurvesConfig({
    ...VALID,
    maximumAgeMatchLoadMultiplierBasisPoints: 9_999,
  }), /at least neutral/);
});
