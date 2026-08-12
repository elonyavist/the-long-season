import assert from "node:assert/strict";
import { test } from "vitest";

import {
  createFakeGameplayConfig,
  PRODUCT_STRENGTH_GAP_MULTIPLIER,
} from "./gameplay-config.ts";
import { createFakeLeagueSystem } from "./league-system.ts";

/** Shared gameplay configuration tests prevent facade-specific tuning copies. */
test("focused league uses the reusable generated gameplay configuration", () => {
  const expected = createFakeGameplayConfig();
  const league = createFakeLeagueSystem();

  assert.deepEqual(league.matchEngineConfig, expected.matchEngineConfig);
  assert.deepEqual(league.roleWeights, expected.roleWeights);
  assert.equal(league.matchEngineConfig.strengthGapMultiplier, PRODUCT_STRENGTH_GAP_MULTIPLIER);
  assert.deepEqual(league.matchEngineConfig.discipline, {
    version: "match-discipline-calibration-v2",
    penaltyAwardProbabilityAfterDangerousFoulBasisPoints: 3_500,
    directFreeKickMinimumZoneDangerBasisPoints: 8_000,
    directFreeKickShotProbabilityBasisPoints: 7_500,
    directFreeKickBaseGoalProbabilityBasisPoints: 646,
    directFreeKickReferenceTakerAbility: 14,
    directFreeKickTakerAbilityStepBasisPoints: 30,
    directFreeKickReferenceGoalkeeperReflexes: 12,
    directFreeKickGoalkeeperAbilityStepBasisPoints: 15,
    directFreeKickMinimumGoalProbabilityBasisPoints: 250,
    directFreeKickMaximumGoalProbabilityBasisPoints: 1_300,
  });
  assert.deepEqual(league.stateMultiplierCurves, expected.stateMultiplierCurves);
});

test("canonical conversion bands remain shared across every division", () => {
  assert.deepEqual(
    createFakeGameplayConfig().matchEngineConfig.conversionBands.map(
      ({ bandKey, goalProbability }) => ({ bandKey, goalProbability }),
    ),
    [
      { bandKey: "low", goalProbability: 0.0575 },
      { bandKey: "medium", goalProbability: 0.11 },
      { bandKey: "high", goalProbability: 0.193 },
    ],
  );
});
