import {
  CANONICAL_PLAYER_ROLES,
  MATCH_TACTICS_CALIBRATION_SCHEMA_VERSION,
  TACTICAL_SHAPE_TASKS,
  type CanonicalPlayerRole,
  type MatchTacticsCalibrationConfig,
  type TacticalShapeTask,
} from "@game/domain";

/**
 * A flat match-tactics calibration for simulation-tools tests.
 *
 * Simulation tools may not import content, so a test that needs a calibration
 * has to build one. It is deliberately flat - every outfield role is worth the
 * same on every task - because these tests check that the tools thread a policy
 * through, never what the football numbers should be. The shipped numbers are
 * asserted in the content package that owns them.
 *
 * @example
 * runTacticalShapeSeries({ ..., matchTacticsCalibration: matchTacticsCalibrationFixture() });
 */
export function matchTacticsCalibrationFixture(): MatchTacticsCalibrationConfig {
  const flatTasks = uniformTaskValues(5_000);
  const zeroTasks = uniformTaskValues(0);

  return {
    schemaVersion: MATCH_TACTICS_CALIBRATION_SCHEMA_VERSION,
    version: "match-tactics-simulation-tools-fixture",
    classification: "explicit_game_design_target",
    tacticalShape: {
      contributionWeightBasisPointsByRoleAndTask: Object.fromEntries(
        CANONICAL_PLAYER_ROLES.map((role) => [role, role === "goalkeeper" ? zeroTasks : flatTasks]),
      ) as Readonly<Record<CanonicalPlayerRole, Readonly<Record<TacticalShapeTask, number>>>>,
      marginalContributionBasisPointsByRank: Array.from({ length: 11 }, (_, rank) => 10_000 - rank * 800),
      coordinationMultiplierBasisPointsBySuitability: {
        natural: 10_000,
        adapted: 9_200,
        weak: 7_800,
        invalid: 5_500,
      },
      channelPolicy: { halfChannelOwnShareBasisPoints: 7_500 },
      saturationReferenceMilliByTask: uniformTaskValues(20_000),
    },
    tacticalMatchup: {
      chainBottleneckWeightBasisPoints: 6_500,
      pressingContestWeightBasisPoints: 5_000,
    },
    tacticalSemantics: {
      routeAffinityBasisPointsByKnob: { directness: 3_000, pressing: 2_200, width: 3_200, risk: 0 },
      volumeBasisPointsByKnob: { directness: 900, pressing: 700, width: 500, risk: 1_800 },
      exposureBasisPointsByKnob: { directness: 1_600, pressing: 1_900, width: 1_300, risk: 2_200 },
      commitmentBasisPointsByMentality: {
        very_defensive: 8_600,
        defensive: 9_300,
        balanced: 10_000,
        attacking: 10_800,
        very_attacking: 11_700,
      },
      scoreStateCommitmentBasisPoints: 550,
      shapeControlShareBasisPoints: 5_500,
    },
  };
}

/** Gives every task the same number, for a calibration that isolates one variable. */
function uniformTaskValues(value: number): Readonly<Record<TacticalShapeTask, number>> {
  return Object.fromEntries(
    TACTICAL_SHAPE_TASKS.map((task) => [task, value]),
  ) as Readonly<Record<TacticalShapeTask, number>>;
}
