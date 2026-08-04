import {
  CANONICAL_PLAYER_ROLES,
  TACTICAL_SHAPE_CAPACITIES,
  MATCH_TACTICS_CALIBRATION_SCHEMA_VERSION,
  TACTICAL_SHAPE_TASKS,
  type CanonicalPlayerRole,
  type MatchTacticsCalibrationConfig,
  type TacticalMatchupCalibrationConfig,
  type TacticalSemanticsCalibrationConfig,
  type TacticalShapeCapacity,
  type TacticalShapeTask,
} from "@game/domain";

import type { TacticalShapeProfile } from "../match-engine/tactical-shape.ts";

/**
 * A fixture calibration with football character but no shipped numbers.
 *
 * Every outfield role keeps a positive floor on every task, which is what the
 * domain validator requires and what keeps a capacity from being structurally
 * unreachable. Tests share one fixture so a change to the calibration contract
 * breaks in one place rather than drifting into several partial copies, and so
 * a test can never accidentally assert against the shipped content numbers.
 *
 * @example
 * const context = buildTacticTeamContext({
 *   ...,
 *   matchTacticsCalibration: matchTacticsCalibrationFixture(),
 * });
 */
export function matchTacticsCalibrationFixture(): MatchTacticsCalibrationConfig {
  return {
    schemaVersion: MATCH_TACTICS_CALIBRATION_SCHEMA_VERSION,
    version: "match-tactics-fixture",
    classification: "explicit_game_design_target",
    tacticalShape: {
      contributionWeightBasisPointsByRoleAndTask: {
        goalkeeper: taskWeights({}, 0),
        right_full_back: FULL_BACK_WEIGHTS,
        center_back: taskWeights({
          build_up: 7_000,
          central_coverage: 6_000,
          box_protection: 9_500,
          rest_defence: 9_000,
        }),
        left_full_back: FULL_BACK_WEIGHTS,
        defensive_midfielder: taskWeights({
          build_up: 8_000,
          central_progression: 6_000,
          central_coverage: 9_000,
          rest_defence: 8_000,
        }),
        central_midfielder: taskWeights({
          build_up: 6_500,
          central_progression: 8_000,
          pressing_cohesion: 7_000,
          central_coverage: 7_000,
        }),
        right_midfielder: WIDE_MIDFIELD_WEIGHTS,
        left_midfielder: WIDE_MIDFIELD_WEIGHTS,
        attacking_midfielder: taskWeights({
          central_progression: 8_500,
          final_third_presence: 6_000,
          counter_threat: 7_000,
        }),
        right_winger: WINGER_WEIGHTS,
        left_winger: WINGER_WEIGHTS,
        striker: taskWeights({
          final_third_presence: 9_500,
          counter_threat: 8_500,
          central_progression: 4_000,
        }),
      },
      marginalContributionBasisPointsByRank: [10_000, 7_000, 5_000, 3_600, 2_600, 1_900, 1_400, 1_000, 700, 500, 350],
      coordinationMultiplierBasisPointsBySuitability: {
        natural: 10_000,
        adapted: 9_200,
        weak: 7_800,
        invalid: 5_500,
      },
      channelPolicy: { halfChannelOwnShareBasisPoints: 7_500 },
      saturationReferenceMilliByTask: {
        build_up: 21_000,
        central_progression: 19_000,
        lateral_progression: 14_000,
        final_third_presence: 19_500,
        pressing_cohesion: 22_000,
        central_coverage: 19_000,
        lateral_coverage: 15_000,
        box_protection: 22_500,
        counter_threat: 21_500,
        rest_defence: 23_000,
      },
    },
    tacticalMatchup: FIXTURE_TACTICAL_MATCHUP,
    tacticalSemantics: FIXTURE_TACTICAL_SEMANTICS,
  };
}

/**
 * The matchup and semantics halves both fixtures in this file share.
 *
 * Only `tacticalShape` separates them: one gives roles football character, the
 * other makes every outfield role interchangeable. Everything downstream of the
 * shape - how two shapes contest, what a knob buys - is the same calibration in
 * both, so it is declared once rather than kept in step by hand.
 *
 * These numbers deliberately do not track the shipped ones, for the reason on
 * `matchTacticsCalibrationFixture`.
 */
const FIXTURE_TACTICAL_MATCHUP = {
  chainBottleneckWeightBasisPoints: 6_500,
  pressingContestWeightBasisPoints: 5_000,
} as const satisfies TacticalMatchupCalibrationConfig;

const FIXTURE_TACTICAL_SEMANTICS = {
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
  routeQualityBiasBasisPoints: 2_500,
  routeSelectionSharpness: 3,
} as const satisfies TacticalSemanticsCalibrationConfig;

const FULL_BACK_WEIGHTS = taskWeights({
  build_up: 5_500,
  lateral_progression: 6_500,
  lateral_coverage: 8_000,
  box_protection: 5_000,
  rest_defence: 6_000,
});

const WIDE_MIDFIELD_WEIGHTS = taskWeights({
  lateral_progression: 7_500,
  lateral_coverage: 7_000,
  pressing_cohesion: 7_000,
  counter_threat: 5_000,
});

const WINGER_WEIGHTS = taskWeights({
  lateral_progression: 8_000,
  final_third_presence: 6_500,
  counter_threat: 8_000,
  lateral_coverage: 3_500,
});

function taskWeights(
  overrides: Partial<Record<TacticalShapeTask, number>>,
  floor = 1_500,
): Readonly<Record<TacticalShapeTask, number>> {
  return Object.fromEntries(
    TACTICAL_SHAPE_TASKS.map((task) => [task, overrides[task] ?? floor]),
  ) as Readonly<Record<TacticalShapeTask, number>>;
}

/**
 * A valid intrinsic shape profile stamped with the fixture calibration version.
 *
 * For tests that assemble a `MatchTeamContext` by hand rather than by scoring a
 * lineup. `uniformCapacity` is the level every capacity sits at unless
 * `overrides` names it, which keeps a test that only cares about one capacity
 * from having to spell out the other eleven.
 *
 * @example
 * tacticalShapeProfileFixture({ overrides: { pressing_cohesion: 0.9 } });
 */
export function tacticalShapeProfileFixture(input: {
  readonly uniformCapacity?: number;
  readonly overrides?: Readonly<Partial<Record<TacticalShapeCapacity, number>>>;
  readonly policyVersion?: string;
} = {}): TacticalShapeProfile {
  const uniformCapacity = input.uniformCapacity ?? 0.5;

  return {
    policyVersion: input.policyVersion ?? matchTacticsCalibrationFixture().version,
    capacities: Object.fromEntries(
      TACTICAL_SHAPE_CAPACITIES.map((capacity) => [capacity, input.overrides?.[capacity] ?? uniformCapacity]),
    ) as Readonly<Record<TacticalShapeCapacity, number>>,
  };
}

/**
 * A deliberately flat calibration where every outfield role is interchangeable.
 *
 * Use it when a test proves that a *seam* is wired - that a shape reaches the
 * context, that a matchup reads both sides - rather than what the football
 * numbers should be. Flatness is the point: any difference the test observes
 * comes from the code under test, never from role weights.
 *
 * `saturationReferenceMilli` moves where capacities land on the bounded curve,
 * which is how a test picks a working range without restating a whole table.
 *
 * @example
 * flatMatchTacticsCalibrationFixture({ version: "match-tactics-seam-fixture" });
 */
export function flatMatchTacticsCalibrationFixture(input: {
  readonly version?: string;
  readonly saturationReferenceMilli?: number;
} = {}): MatchTacticsCalibrationConfig {
  const flatTasks = uniformTaskWeights(5_000);
  const zeroTasks = uniformTaskWeights(0);

  return {
    schemaVersion: MATCH_TACTICS_CALIBRATION_SCHEMA_VERSION,
    version: input.version ?? "match-tactics-flat-fixture",
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
      saturationReferenceMilliByTask: uniformTaskWeights(input.saturationReferenceMilli ?? 20_000),
    },
    tacticalMatchup: FIXTURE_TACTICAL_MATCHUP,
    tacticalSemantics: FIXTURE_TACTICAL_SEMANTICS,
  };
}

/** Gives every task the same number, for calibrations that isolate one variable. */
function uniformTaskWeights(value: number): Readonly<Record<TacticalShapeTask, number>> {
  return Object.fromEntries(
    TACTICAL_SHAPE_TASKS.map((task) => [task, value]),
  ) as Readonly<Record<TacticalShapeTask, number>>;
}
