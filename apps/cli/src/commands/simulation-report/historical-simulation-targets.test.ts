import assert from "node:assert/strict";
import { test } from "vitest";

import {
  HISTORICAL_ASSIST_SUPPLY_TARGETS,
  HISTORICAL_DEAD_BALL_TARGETS,
  HISTORICAL_DIVISION_TABLE_TARGETS,
  HISTORICAL_FIRST_DIVISION_PLAYER_TARGETS,
  HISTORICAL_FIRST_DIVISION_UPSET_TARGETS,
  HISTORICAL_UPSET_RANK_GAP_KEYS,
  INTEGRATED_LEADER_AGE_DRIFT_TARGET,
} from "./historical-simulation-targets.ts";

test("assist supply owns the frozen external denominators and material floors", () => {
  assert.deepEqual(HISTORICAL_ASSIST_SUPPLY_TARGETS, {
    allGoalAssistedShare: 0.670974411992763,
    nonSetPieceAssistedShare: 0.7511574074074074,
    deadBallGoalShare: 0.1067459291819589,
    materialSupplyGap: 0.05,
    materialDeadBallGap: 0.02,
    comparisonTolerance: 0.02,
  });
});

test("dead-ball supply keeps penalty frequency and conversion separate", () => {
  assert.deepEqual(HISTORICAL_DEAD_BALL_TARGETS, {
    penaltyAttemptsPerMatch: 0.26367831245880025,
    penaltyAttemptsPerMatchTolerance: 0.03,
    penaltyConversion: 0.75,
    penaltyConversionTolerance: 0.04,
    penaltyGoalsPerMatch: 0.19775873434410018,
    directFreeKickAttemptsPerMatch: 1.1529334212261042,
    directFreeKickAttemptsPerMatchTolerance: 0.10,
    directFreeKickConversion: 0.06460834762721555,
    directFreeKickConversionTolerance: 0.02,
    directFreeKickGoalsPerMatch: 0.07448912326961107,
    directFreeKickGoalsPerMatchTolerance: 0.025,
  });
});

test("every frozen historical target is a reachable ordered interval", () => {
  const bands = [
    ...Object.values(HISTORICAL_DIVISION_TABLE_TARGETS).flatMap(Object.values),
    ...Object.values(HISTORICAL_FIRST_DIVISION_PLAYER_TARGETS),
    ...Object.values(HISTORICAL_FIRST_DIVISION_UPSET_TARGETS.rankGap)
      .flatMap(({ winShare, nonLossShare }) => [winShare, nonLossShare]),
    HISTORICAL_FIRST_DIVISION_UPSET_TARGETS.firstVersusLast.winShare,
    HISTORICAL_FIRST_DIVISION_UPSET_TARGETS.firstVersusLast.nonLossShare,
    INTEGRATED_LEADER_AGE_DRIFT_TARGET,
  ];

  assert.equal(bands.every(({ min, max }) => Number.isFinite(min) && Number.isFinite(max) && min <= max), true);
  assert.equal(HISTORICAL_DIVISION_TABLE_TARGETS[1].championPoints.min >
    HISTORICAL_DIVISION_TABLE_TARGETS[2].championPoints.min, true);
  assert.notDeepEqual(HISTORICAL_DIVISION_TABLE_TARGETS[2], HISTORICAL_DIVISION_TABLE_TARGETS[3]);
});

test("the upset register is total and keeps exact first-versus-last powered", () => {
  assert.deepEqual(
    Object.keys(HISTORICAL_FIRST_DIVISION_UPSET_TARGETS.rankGap),
    HISTORICAL_UPSET_RANK_GAP_KEYS,
  );
  assert.equal(
    HISTORICAL_FIRST_DIVISION_UPSET_TARGETS.rankGap["7_to_9"].winShare.min
      > HISTORICAL_FIRST_DIVISION_UPSET_TARGETS.rankGap["15_plus"].winShare.min,
    true,
  );
  assert.equal(
    HISTORICAL_FIRST_DIVISION_UPSET_TARGETS.firstVersusLast.minimumObservationCount,
    50,
  );
});

test("the season-ten leader gate is one band with the effective 0.50 threshold", () => {
  const register = HISTORICAL_FIRST_DIVISION_PLAYER_TARGETS;

  assert.deepEqual(register.careerGeneratedLeaderShareSeasonTen, { min: 0.5, max: 1 });
  assert.equal("generatedLeaderShareSeasonTen" in register, false);
  assert.equal("openingLeaderShareSeasonTen" in register, false);
});
