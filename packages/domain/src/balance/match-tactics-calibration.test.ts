import assert from "node:assert/strict";
import { test } from "vitest";

import { CANONICAL_PLAYER_ROLES, type CanonicalPlayerRole } from "../tactics/player-roles.ts";
import type { PositionSuitability } from "../tactics/position-suitability.ts";
import type { FormationSide } from "../tactics/formations.ts";
import {
  lateralChannelShares,
  MATCH_TACTICS_CALIBRATION_SCHEMA_VERSION,
  MatchTacticsCalibrationError,
  TACTICAL_ROUTE_DEFINITION,
  TACTICAL_ROUTE_MIRROR,
  TACTICAL_ROUTES,
  TACTICAL_SHAPE_CAPACITIES,
  TACTICAL_SHAPE_CAPACITY_MIRROR,
  TACTICAL_SHAPE_CAPACITY_SOURCE,
  TACTICAL_SHAPE_MAXIMUM_CONTRIBUTORS,
  TACTICAL_SHAPE_TASK_KIND,
  TACTICAL_SHAPE_TASKS,
  TACTIC_KNOB_EXPOSED_ROUTE,
  TACTIC_KNOB_FAVOURED_ROUTES,
  TACTIC_KNOBS,
  validateMatchTacticsCalibration,
  type MatchTacticsCalibrationConfig,
  type MatchTacticsCalibrationErrorCode,
  type TacticalMatchupCalibrationConfig,
  type TacticalRoute,
  type TacticalShapeCapacity,
  type TacticalShapeCalibrationConfig,
  type TacticalShapeTask,
  type TacticalSemanticsCalibrationConfig,
} from "./match-tactics-calibration.ts";

/**
 * These tests protect the declared mathematical constraints, not the shipped
 * coefficients. Content owns the numbers; this file owns the rules a number
 * has to obey before the match engine is allowed to see it.
 */

test("every capacity names a task and a flank exactly once", () => {
  assert.equal(Object.keys(TACTICAL_SHAPE_CAPACITY_SOURCE).length, TACTICAL_SHAPE_CAPACITIES.length);

  for (const capacity of TACTICAL_SHAPE_CAPACITIES) {
    const source = TACTICAL_SHAPE_CAPACITY_SOURCE[capacity];
    assert.equal(TACTICAL_SHAPE_TASKS.includes(source.task), true, `${capacity} names an unknown task`);
  }
});

test("exactly the two lateral tasks split into a left and a right capacity", () => {
  const flankedByTask = new Map<TacticalShapeTask, Set<string>>();
  for (const capacity of TACTICAL_SHAPE_CAPACITIES) {
    const { task, flank } = TACTICAL_SHAPE_CAPACITY_SOURCE[capacity];
    if (flank === "none") {
      continue;
    }
    const flanks = flankedByTask.get(task) ?? new Set<string>();
    flanks.add(flank);
    flankedByTask.set(task, flanks);
  }

  assert.deepEqual([...flankedByTask.keys()].sort(), ["lateral_coverage", "lateral_progression"]);
  for (const flanks of flankedByTask.values()) {
    assert.deepEqual([...flanks].sort(), ["left", "right"]);
  }
});

test("channel shares are mirror symmetric and always sum to one", () => {
  const policy = { halfChannelOwnShareBasisPoints: 7_500 };
  const sides: readonly FormationSide[] = ["left", "left_center", "center", "right_center", "right"];

  for (const side of sides) {
    const shares = lateralChannelShares(side, policy);
    assert.equal(shares.left + shares.right, 1, `${side} shares must sum to one`);
  }

  assert.deepEqual(lateralChannelShares("left", policy), {
    left: lateralChannelShares("right", policy).right,
    right: lateralChannelShares("right", policy).left,
  });
  assert.deepEqual(lateralChannelShares("left_center", policy), {
    left: lateralChannelShares("right_center", policy).right,
    right: lateralChannelShares("right_center", policy).left,
  });
  assert.deepEqual(lateralChannelShares("center", policy), { left: 0.5, right: 0.5 });
});

test("a well-formed calibration validates", () => {
  assert.doesNotThrow(() => {
    validateMatchTacticsCalibration(validCalibration());
  });
});

test("the goalkeeper may not contribute to intrinsic shape", () => {
  assertRejects(
    withShape({
      contributionWeightBasisPointsByRoleAndTask: {
        ...validShape().contributionWeightBasisPointsByRoleAndTask,
        goalkeeper: taskWeights(1),
      },
    }),
    "goalkeeper_is_not_isolated",
  );
});

test("an outfield role may not leave a task empty", () => {
  assertRejects(
    withShape({
      contributionWeightBasisPointsByRoleAndTask: {
        ...validShape().contributionWeightBasisPointsByRoleAndTask,
        striker: { ...taskWeights(2_000), box_protection: 0 },
      },
    }),
    "outfield_role_leaves_task_empty",
  );
});

test("contribution weights may not be negative", () => {
  assertRejects(
    withShape({
      contributionWeightBasisPointsByRoleAndTask: {
        ...validShape().contributionWeightBasisPointsByRoleAndTask,
        striker: { ...taskWeights(2_000), counter_threat: -1 },
      },
    }),
    "negative_contribution_weight",
  );
});

test("the marginal contribution ladder must cover every rank", () => {
  assertRejects(
    withShape({ marginalContributionBasisPointsByRank: [10_000, 5_000] }),
    "invalid_marginal_contribution_ladder",
  );
});

test("the best contributor to a task counts in full", () => {
  assertRejects(
    withShape({
      marginalContributionBasisPointsByRank: decreasingLadder().map((band, rank) =>
        rank === 0 ? 9_000 : band,
      ),
    }),
    "invalid_marginal_contribution_ladder",
  );
});

test("marginal contribution must strictly decrease", () => {
  const ladder = decreasingLadder();
  ladder[3] = ladder[2] as number;

  assertRejects(withShape({ marginalContributionBasisPointsByRank: ladder }), "invalid_marginal_contribution_ladder");
});

test("marginal contribution must stay strictly positive", () => {
  const ladder = decreasingLadder();
  ladder[TACTICAL_SHAPE_MAXIMUM_CONTRIBUTORS - 1] = 0;

  assertRejects(withShape({ marginalContributionBasisPointsByRank: ladder }), "invalid_marginal_contribution_ladder");
});

test("the half-channel share may not cross the centre line", () => {
  assertRejects(withShape({ channelPolicy: { halfChannelOwnShareBasisPoints: 4_999 } }), "invalid_channel_policy");
  assertRejects(withShape({ channelPolicy: { halfChannelOwnShareBasisPoints: 10_001 } }), "invalid_channel_policy");
});

test("every task needs a positive saturation reference", () => {
  assertRejects(
    withShape({
      saturationReferenceMilliByTask: { ...taskReferences(), build_up: 0 },
    }),
    "invalid_saturation_reference",
  );
});

test("the asset version and classification are part of the contract", () => {
  assertRejects({ ...validCalibration(), version: "  " }, "invalid_version");
  assertRejects({ ...validCalibration(), schemaVersion: 99 }, "invalid_schema_version");
});

test("every capacity has a mirror, and mirroring twice is the identity", () => {
  for (const capacity of TACTICAL_SHAPE_CAPACITIES) {
    const mirrored = TACTICAL_SHAPE_CAPACITY_MIRROR[capacity];
    assert.equal(TACTICAL_SHAPE_CAPACITIES.includes(mirrored), true, `${capacity} mirrors to an unknown capacity`);
    assert.equal(TACTICAL_SHAPE_CAPACITY_MIRROR[mirrored], capacity, `${capacity} does not mirror back`);
  }

  const flanked = TACTICAL_SHAPE_CAPACITIES.filter(
    (capacity) => TACTICAL_SHAPE_CAPACITY_MIRROR[capacity] !== capacity,
  );
  assert.deepEqual([...flanked].sort(), [
    "left_coverage",
    "left_progression",
    "right_coverage",
    "right_progression",
  ]);
});

test("the left and right routes are exact mirrors of each other", () => {
  for (const route of TACTICAL_ROUTES) {
    const mirroredRoute = TACTICAL_ROUTE_MIRROR[route];
    assert.equal(TACTICAL_ROUTE_MIRROR[mirroredRoute], route, `${route} does not mirror back`);

    const definition = TACTICAL_ROUTE_DEFINITION[route];
    const mirrored = TACTICAL_ROUTE_DEFINITION[mirroredRoute];
    assert.deepEqual(
      definition.ownChain.map((capacity) => TACTICAL_SHAPE_CAPACITY_MIRROR[capacity]),
      [...mirrored.ownChain],
      `${route} own chain is not the mirror of ${mirroredRoute}`,
    );
    assert.deepEqual(
      definition.opponentResistance.map((capacity) => TACTICAL_SHAPE_CAPACITY_MIRROR[capacity]),
      [...mirrored.opponentResistance],
      `${route} resistance is not the mirror of ${mirroredRoute}`,
    );
  }
});

test("a route down one flank meets the opponent's opposite flank", () => {
  assert.equal(TACTICAL_ROUTE_DEFINITION.left.opponentResistance.includes("right_coverage"), true);
  assert.equal(TACTICAL_ROUTE_DEFINITION.right.opponentResistance.includes("left_coverage"), true);
});

test("direct and transition are the two routes that skip a phase", () => {
  assert.equal(ownChainOf("direct").includes("build_up"), true);
  assert.equal(
    TACTICAL_ROUTE_DEFINITION.direct.ownChain.some((capacity) => capacity.endsWith("progression")),
    false,
    "direct play skips progression",
  );
  assert.equal(
    ownChainOf("transition").includes("build_up"),
    false,
    "a counter does not wait for build-up",
  );
  assert.equal(TACTICAL_ROUTE_DEFINITION.transition.opponentResistance.includes("rest_defence"), true);
});

test("every route needs at least two own phases and something resisting it", () => {
  for (const route of TACTICAL_ROUTES) {
    const definition = TACTICAL_ROUTE_DEFINITION[route];
    assert.equal(definition.ownChain.length >= 2, true, `${route} is not a chain`);
    assert.equal(definition.opponentResistance.length >= 1, true, `${route} is unopposed`);
  }
});

test("every task states whether suitability may touch it", () => {
  const kinds = TACTICAL_SHAPE_TASKS.map((task) => TACTICAL_SHAPE_TASK_KIND[task]);

  assert.equal(kinds.every((kind) => kind === "coordination" || kind === "presence"), true);
  assert.equal(TACTICAL_SHAPE_TASK_KIND.final_third_presence, "presence", "being in the box is not coordination");
  assert.equal(TACTICAL_SHAPE_TASK_KIND.counter_threat, "presence", "nor is running in behind");
  assert.equal(TACTICAL_SHAPE_TASK_KIND.pressing_cohesion, "coordination");
  assert.equal(TACTICAL_SHAPE_TASK_KIND.lateral_coverage, "coordination");
  assert.equal(kinds.includes("coordination"), true);
});

test("playing a man in his own position is the neutral reference", () => {
  assertRejects(
    withShape({
      coordinationMultiplierBasisPointsBySuitability: { ...coordinationMultipliers(), natural: 9_000 },
    }),
    "invalid_coordination_multipliers",
  );
});

test("a worse fit must cost strictly more and never zero out a player", () => {
  assertRejects(
    withShape({
      coordinationMultiplierBasisPointsBySuitability: { ...coordinationMultipliers(), weak: 9_200 },
    }),
    "invalid_coordination_multipliers",
  );
  assertRejects(
    withShape({
      coordinationMultiplierBasisPointsBySuitability: { ...coordinationMultipliers(), invalid: 0 },
    }),
    "invalid_coordination_multipliers",
  );
});

test("the chain bottleneck weight must keep a real bottleneck", () => {
  assertRejects(withMatchup({ chainBottleneckWeightBasisPoints: 4_999 }), "invalid_chain_bottleneck_weight");
  assertRejects(withMatchup({ chainBottleneckWeightBasisPoints: 10_001 }), "invalid_chain_bottleneck_weight");
});

test("the pressing contest weight is a bounded share", () => {
  assertRejects(withMatchup({ pressingContestWeightBasisPoints: -1 }), "invalid_pressing_contest_weight");
  assertRejects(withMatchup({ pressingContestWeightBasisPoints: 10_001 }), "invalid_pressing_contest_weight");
});

function ownChainOf(route: TacticalRoute): readonly TacticalShapeCapacity[] {
  return TACTICAL_ROUTE_DEFINITION[route].ownChain;
}

function withMatchup(overrides: Partial<TacticalMatchupCalibrationConfig>): MatchTacticsCalibrationConfig {
  const base = validCalibration();

  return { ...base, tacticalMatchup: { ...base.tacticalMatchup, ...overrides } };
}

function assertRejects(config: MatchTacticsCalibrationConfig, code: MatchTacticsCalibrationErrorCode): void {
  assert.throws(
    () => {
      validateMatchTacticsCalibration(config);
    },
    (error: unknown) => error instanceof MatchTacticsCalibrationError && error.code === code,
    `expected ${code}`,
  );
}

function withShape(overrides: Partial<TacticalShapeCalibrationConfig>): MatchTacticsCalibrationConfig {
  return { ...validCalibration(), tacticalShape: { ...validShape(), ...overrides } };
}

function validCalibration(): MatchTacticsCalibrationConfig {
  return {
    schemaVersion: MATCH_TACTICS_CALIBRATION_SCHEMA_VERSION,
    version: "match-tactics-test",
    classification: "explicit_game_design_target",
    tacticalShape: validShape(),
    tacticalMatchup: { chainBottleneckWeightBasisPoints: 6_500, pressingContestWeightBasisPoints: 5_000 },
    tacticalSemantics: validSemantics(),
  };
}

function withSemantics(
  overrides: Partial<TacticalSemanticsCalibrationConfig>,
): MatchTacticsCalibrationConfig {
  return { ...validCalibration(), tacticalSemantics: { ...validSemantics(), ...overrides } };
}

function validSemantics(): TacticalSemanticsCalibrationConfig {
  return {
    routeAffinityBasisPointsByKnob: { directness: 3_000, pressing: 2_000, width: 3_500, risk: 0 },
    volumeBasisPointsByKnob: { directness: 1_200, pressing: 800, width: 600, risk: 2_000 },
    exposureBasisPointsByKnob: { directness: 1_500, pressing: 2_000, width: 1_200, risk: 2_500 },
    commitmentBasisPointsByMentality: {
      very_defensive: 8_400,
      defensive: 9_200,
      balanced: 10_000,
      attacking: 10_900,
      very_attacking: 11_900,
    },
    scoreStateCommitmentBasisPoints: 600,
    shapeControlShareBasisPoints: 5_000,
  };
}

function validShape(): TacticalShapeCalibrationConfig {
  return {
    contributionWeightBasisPointsByRoleAndTask: Object.fromEntries(
      CANONICAL_PLAYER_ROLES.map((role) => [role, role === "goalkeeper" ? taskWeights(0) : taskWeights(2_000)]),
    ) as Readonly<Record<CanonicalPlayerRole, Readonly<Record<TacticalShapeTask, number>>>>,
    marginalContributionBasisPointsByRank: decreasingLadder(),
    coordinationMultiplierBasisPointsBySuitability: coordinationMultipliers(),
    channelPolicy: { halfChannelOwnShareBasisPoints: 7_500 },
    saturationReferenceMilliByTask: taskReferences(),
  };
}

function coordinationMultipliers(): Readonly<Record<PositionSuitability, number>> {
  return { natural: 10_000, adapted: 9_200, weak: 7_800, invalid: 5_500 };
}

function taskWeights(weight: number): Readonly<Record<TacticalShapeTask, number>> {
  return Object.fromEntries(TACTICAL_SHAPE_TASKS.map((task) => [task, weight])) as Readonly<
    Record<TacticalShapeTask, number>
  >;
}

function taskReferences(): Readonly<Record<TacticalShapeTask, number>> {
  return Object.fromEntries(TACTICAL_SHAPE_TASKS.map((task) => [task, 20_000])) as Readonly<
    Record<TacticalShapeTask, number>
  >;
}

function decreasingLadder(): number[] {
  return Array.from({ length: TACTICAL_SHAPE_MAXIMUM_CONTRIBUTORS }, (_, rank) => 10_000 - rank * 800);
}

/**
 * The tactic-semantics rules that carry football rather than bounds.
 *
 * The two that matter are the ones a reviewer would otherwise have to notice by
 * eye: a knob whose numbers disagree with the routes it is declared to be
 * about, and a knob that costs nothing.
 */

test("a knob that favours routes must price that preference", () => {
  assertRejects(
    withSemantics({
      routeAffinityBasisPointsByKnob: { directness: 0, pressing: 2_000, width: 3_500, risk: 0 },
    }),
    "invalid_route_affinity",
  );
});

test("a knob that favours no route may not price a preference either", () => {
  assertRejects(
    withSemantics({
      routeAffinityBasisPointsByKnob: { directness: 3_000, pressing: 2_000, width: 3_500, risk: 500 },
    }),
    "invalid_route_affinity",
  );
});

test("no tactic input may be a free bonus", () => {
  for (const knob of TACTIC_KNOBS) {
    assertRejects(
      withSemantics({
        exposureBasisPointsByKnob: { ...validSemantics().exposureBasisPointsByKnob, [knob]: 0 },
      }),
      "knob_without_a_cost",
    );
  }
});

test("every knob is declared to hand the opponent exactly one route", () => {
  for (const knob of TACTIC_KNOBS) {
    assert.equal(
      TACTICAL_ROUTES.includes(TACTIC_KNOB_EXPOSED_ROUTE[knob]),
      true,
      `${knob} exposes an unknown route`,
    );
  }
});

test("a knob never favours the route it exposes, or its cost would be its benefit", () => {
  for (const knob of TACTIC_KNOBS) {
    const favoured: readonly TacticalRoute[] = TACTIC_KNOB_FAVOURED_ROUTES[knob];
    assert.equal(
      favoured.includes(TACTIC_KNOB_EXPOSED_ROUTE[knob]),
      false,
      `${knob} both favours and exposes ${TACTIC_KNOB_EXPOSED_ROUTE[knob]}`,
    );
  }
});

test("the commitment ladder is strictly increasing along the mentality order", () => {
  assertRejects(
    withSemantics({
      commitmentBasisPointsByMentality: {
        very_defensive: 8_400,
        defensive: 9_200,
        balanced: 10_000,
        attacking: 9_900,
        very_attacking: 11_900,
      },
    }),
    "invalid_commitment_ladder",
  );
});

test("committing to neither is the neutral reference, never a bonus", () => {
  assertRejects(
    withSemantics({
      commitmentBasisPointsByMentality: {
        very_defensive: 8_400,
        defensive: 9_200,
        balanced: 10_400,
        attacking: 10_900,
        very_attacking: 11_900,
      },
    }),
    "invalid_commitment_ladder",
  );
});

test("shape must decide some of possession control", () => {
  assertRejects(withSemantics({ shapeControlShareBasisPoints: 0 }), "invalid_shape_control_share");
});
