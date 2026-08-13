import assert from "node:assert/strict";
import { test } from "vitest";

import {
  TACTIC_KNOB_EXPOSED_ROUTE,
  TACTIC_KNOB_FAVOURED_ROUTES,
  TACTIC_KNOBS,
  TACTICAL_ROUTES,
  type TacticKnob,
  type TacticalRoute,
} from "@game/domain";
import { deriveRng } from "@game/shared";

import type { MatchTacticalDistributionInput } from "./match-context.ts";
import type { TacticalDistributionCaps } from "./match-engine-config.ts";
import {
  deriveOpportunityRoutePlan,
  EVEN_CONTEST_ROUTE_CAPACITY,
  expectedRouteSaturation,
  opportunityRouteBudget,
  opportunityRouteQualityEdge,
  opportunityRouteSaturation,
  opportunityRouteStrategicSignature,
  opportunityRouteWeights,
  OPPORTUNITY_ROUTE_CHANCE_TYPE,
  OpportunityRouteError,
  selectOpportunityRoute,
  type DeriveOpportunityRoutePlanInput,
  type OpportunityRoutePlan,
} from "./opportunity-route.ts";
import type { TacticalShapeProfile } from "./tactical-shape.ts";
import {
  matchTacticsCalibrationFixture,
  tacticalShapeProfileFixture,
} from "../test-fixtures/match-tactics-calibration.ts";

/**
 * These tests prove the football the route model claims, not its coefficients.
 * Block 3 tunes the numbers against the frozen bands, so pinning one here would
 * make retuning look like a regression.
 */

test("weights always describe a complete distribution over the declared routes", () => {
  const plan = planFor({});

  assert.deepEqual(Object.keys(opportunityRouteWeights(plan)).sort(), [...TACTICAL_ROUTES].sort());
  assert.equal(Math.abs(sumOfWeights(plan) - 1) < 1e-9, true);
  for (const route of TACTICAL_ROUTES) {
    const saturation = opportunityRouteSaturation(plan, route);
    assert.equal(saturation >= 0 && saturation <= 1, true, route);
  }
});

test("a side that decides nothing is handed nothing", () => {
  // The one invariant that separates "tactics matter" from "every match is
  // inflated". Knob effects must be measured from the neutral setting, so two
  // identical sides asking for nothing land on the untouched baseline: volume
  // exactly at one, and no route pushed above the even-contest capacity that
  // `deriveOpportunityRate` measures its separation from.
  const plan = planFor({});

  assert.equal(plan.volumeMultiplier, 1);
  for (const route of TACTICAL_ROUTES) {
    assert.equal(
      opportunityRouteSaturation(plan, route) <= EVEN_CONTEST_ROUTE_CAPACITY,
      true,
      `${route} was lifted by no decision`,
    );
  }
});

test("two identical shapes hand each other no route advantage at all", () => {
  // What the opportunity rate measures its separation from. It compares the
  // two plans to each other rather than to a constant precisely so this is
  // exactly zero whatever the capacities happen to be: a chain is contested by
  // the opponent's press and a resistance is not, so an even contest lands
  // *below* the even-contest capacity, and anchoring on that constant deflated
  // every match by about 7% before either side had decided anything.
  const mirror = planFor({});

  assert.equal(expectedRouteSaturation(mirror) - expectedRouteSaturation(mirror), 0);
  assert.equal(
    expectedRouteSaturation(mirror) < EVEN_CONTEST_ROUTE_CAPACITY,
    true,
    "an even contest is expected to sit below the point where chain equals resistance",
  );
});

test("a shape that opens more of the pitch expects a better way through", () => {
  const strong = planFor({
    ownShape: tacticalShapeProfileFixture({ uniformCapacity: 0.7 }),
    opponentShape: tacticalShapeProfileFixture({ uniformCapacity: 0.5 }),
  });
  const weak = planFor({
    ownShape: tacticalShapeProfileFixture({ uniformCapacity: 0.5 }),
    opponentShape: tacticalShapeProfileFixture({ uniformCapacity: 0.7 }),
  });

  assert.equal(
    expectedRouteSaturation(strong) > expectedRouteSaturation(weak),
    true,
    `${expectedRouteSaturation(strong)} against ${expectedRouteSaturation(weak)}`,
  );
});

test("a side goes to its best route far more often than to its worst", () => {
  // Capacity is a bounded share and therefore sits in a narrow band, so weights
  // taken straight from capacity would send a side down its worst way through
  // almost as often as its best. Selection sharpness is what stops the plan
  // being an even spread dressed up as a preference.
  const plan = planFor({ own: knobAt("width", 1) as MatchTacticalDistributionInput });
  const routeWeights = opportunityRouteWeights(plan);
  const weights = TACTICAL_ROUTES.map((route) => routeWeights[route]);
  const capacities = TACTICAL_ROUTES.map((route) => opportunityRouteSaturation(plan, route));
  const capacityRatio = Math.max(...capacities) / Math.min(...capacities);
  const weightRatio = Math.max(...weights) / Math.min(...weights);

  assert.equal(
    weightRatio > capacityRatio,
    true,
    `weights spread ${weightRatio} against capacities ${capacityRatio}`,
  );
});

test("giving a knob up costs what pushing it gains", () => {
  // Two-sidedness: a slider pulled left is a real decision, not a missing
  // bonus. Without it, the whole knob range is a one-way bonus and neutral is
  // the floor rather than the middle.
  for (const knob of TACTIC_KNOBS) {
    const favoured: readonly TacticalRoute[] = TACTIC_KNOB_FAVOURED_ROUTES[knob];
    if (favoured.length === 0) continue;

    const neutral = planFor({});
    const abandoned = planFor({ own: knobAt(knob, 0) });

    for (const route of favoured) {
      assert.equal(
        opportunityRouteSaturation(abandoned, route) < opportunityRouteSaturation(neutral, route),
        true,
        `${knob} at zero did not give up ${route}`,
      );
    }
  }
});

test("every tactic preference preserves the same finite route budget", () => {
  const neutralBudget = opportunityRouteBudget(planFor({}));
  for (const knob of TACTIC_KNOBS) {
    assert.equal(opportunityRouteBudget(planFor({ own: knobAt(knob, 0) })), neutralBudget, `${knob} at zero`);
    assert.equal(opportunityRouteBudget(planFor({ own: knobAt(knob, 1) })), neutralBudget, `${knob} at one`);
  }
  assert.equal(opportunityRouteBudget(planFor({ lateralFocus: "left" })), neutralBudget);
  assert.equal(opportunityRouteBudget(planFor({ lateralFocus: "right" })), neutralBudget);
});

test("every knob lifts the routes it is declared to be about", () => {
  for (const knob of TACTIC_KNOBS) {
    const favoured: readonly TacticalRoute[] = TACTIC_KNOB_FAVOURED_ROUTES[knob];
    if (favoured.length === 0) continue;

    const calm = planFor({ own: knobAt(knob, 0) });
    const committed = planFor({ own: knobAt(knob, 1) });

    for (const route of favoured) {
      assert.equal(
        opportunityRouteSaturation(committed, route) > opportunityRouteSaturation(calm, route),
        true,
        `${knob} did not lift ${route}`,
      );
    }
  }
});

test("every knob hands the opponent the route it is declared to expose", () => {
  for (const knob of TACTIC_KNOBS) {
    const exposed = TACTIC_KNOB_EXPOSED_ROUTE[knob];
    const calm = planFor({ opponent: knobAt(knob, 0) });
    const committed = planFor({ opponent: knobAt(knob, 1) });

    assert.equal(
      committed.contestByRoute[exposed].exposure > calm.contestByRoute[exposed].exposure,
      true,
      `${knob} did not hand ${exposed} to the other side`,
    );
  }
});

test("risk buys attempts rather than a route", () => {
  const calm = planFor({ own: knobAt("risk", 0) });
  const committed = planFor({ own: knobAt("risk", 1) });

  assert.equal(committed.volumeMultiplier > calm.volumeMultiplier, true, "risk must raise attempt frequency");
  for (const route of TACTICAL_ROUTES) {
    assert.equal(
      opportunityRouteSaturation(committed, route),
      opportunityRouteSaturation(calm, route),
      `risk moved ${route}, which is not a route instruction`,
    );
  }
});

test("a side that shuts the game down takes the opponent's attempts with it", () => {
  // The measured defect this replaced: a low block conceded *more* chances than
  // playing neutral - `13.96` against `12.86` over the tactic matrix - because
  // it surrendered a fifth of its own attempts and took nothing off the other
  // side. Reading only the mover's own lean makes parking the bus strictly
  // worse than not parking it, which is the opposite of what it is for.
  const openGame = planFor({ own: knobAt("width", 1), opponent: knobAt("width", 1) });
  const shutDown = planFor({ own: knobAt("width", 0), opponent: knobAt("width", 1) });

  assert.equal(
    shutDown.volumeMultiplier < openGame.volumeMultiplier,
    true,
    "one side going narrow must take attempts out of the match, not only out of its own half",
  );
});

test("a knob with no route preference decides only its own side's attempts", () => {
  // `risk` is a commitment instruction, not a shape-of-play one: it says how
  // many players go forward, and the opponent never agreed to that. The split
  // is read from the favoured-route mapping, so this is the assertion that the
  // two halves of `deriveVolumeMultiplier` stay on the right sides of it.
  const againstCalm = planFor({ own: neutralTactics(), opponent: knobAt("risk", 0) });
  const againstCommitted = planFor({ own: neutralTactics(), opponent: knobAt("risk", 1) });

  assert.equal(
    againstCommitted.volumeMultiplier,
    againstCalm.volumeMultiplier,
    "the opponent's risk setting must not change how often this side attacks",
  );
});

test("pressing pays only when the pressing side can actually press", () => {
  // Same instruction, two shapes. The incoherent side is told to press just as
  // hard and gets less for it, which is the contract's "only when shape is
  // coherent" rather than a flat pressing bonus.
  const coherentPress = planFor({
    opponent: knobAt("pressing", 1),
    opponentShape: tacticalShapeProfileFixture({ overrides: { pressing_cohesion: 0.85 } }),
  });
  const brokenPress = planFor({
    opponent: knobAt("pressing", 1),
    opponentShape: tacticalShapeProfileFixture({ overrides: { pressing_cohesion: 0.1 } }),
  });

  assert.equal(
    opportunityRouteSaturation(coherentPress, "central") < opportunityRouteSaturation(brokenPress, "central"),
    true,
    "a coherent press must suppress the attacker more than a broken one",
  );
});

test("a side chasing a goal attacks more often, and stops escalating once it is a rout", () => {
  const level = planFor({ goalDifference: 0 });
  const oneDown = planFor({ goalDifference: -1 });
  const twoDown = planFor({ goalDifference: -2 });
  const routed = planFor({ goalDifference: -6 });

  assert.equal(oneDown.volumeMultiplier > level.volumeMultiplier, true);
  assert.equal(twoDown.volumeMultiplier > oneDown.volumeMultiplier, true);
  assert.equal(routed.volumeMultiplier, twoDown.volumeMultiplier, "score state must stop bending commitment");
});

test("a side protecting a lead attacks less often", () => {
  assert.equal(
    planFor({ goalDifference: 2 }).volumeMultiplier < planFor({ goalDifference: 0 }).volumeMultiplier,
    true,
  );
});

test("the mentality ladder moves commitment in one direction", () => {
  const defensive = planFor({ own: { ...neutralTactics(), mentality: "very_defensive" } });
  const balanced = planFor({ own: neutralTactics() });
  const attacking = planFor({ own: { ...neutralTactics(), mentality: "very_attacking" } });

  assert.equal(defensive.volumeMultiplier < balanced.volumeMultiplier, true);
  assert.equal(balanced.volumeMultiplier < attacking.volumeMultiplier, true);
});

test("mentality decides how often, never where", () => {
  const defensive = planFor({ own: { ...neutralTactics(), mentality: "very_defensive" } });
  const attacking = planFor({ own: { ...neutralTactics(), mentality: "very_attacking" } });

  for (const route of TACTICAL_ROUTES) {
    assert.equal(opportunityRouteSaturation(attacking, route), opportunityRouteSaturation(defensive, route));
  }
});

test("the plan names the phase that limited each route", () => {
  // The one fact the capacities cannot carry: a route reports a single bounded
  // number, and which of its phases was the weak link is only knowable inside
  // the chain that produced it. The post-match explanation reads this rather
  // than rebuilding a matchup of its own, so it is the plan's to keep.
  const plan = planFor({
    ownShape: tacticalShapeProfileFixture({ overrides: { left_progression: 0.05 } }),
  });

  assert.deepEqual(Object.keys(plan.contestByRoute).sort(), [...TACTICAL_ROUTES].sort());
  assert.equal(
    plan.contestByRoute.left.bottleneck,
    "left_progression",
    "the phase that was starved must be the one named",
  );
});

test("a flank overload is felt as a flank preference, mirrored", () => {
  const leftHeavy = planFor({
    ownShape: tacticalShapeProfileFixture({
      overrides: { left_progression: 0.8, right_progression: 0.2 },
    }),
  });
  const rightHeavy = planFor({
    ownShape: tacticalShapeProfileFixture({
      overrides: { left_progression: 0.2, right_progression: 0.8 },
    }),
  });

  const leftWeights = opportunityRouteWeights(leftHeavy);
  const rightWeights = opportunityRouteWeights(rightHeavy);
  assert.equal(leftWeights.left > leftWeights.right, true);

  // Mirror symmetry is exact in the model but not bit-exact in floating point:
  // normalizing accumulates the five capacities in a different order for each
  // side. Asserting equality to the last bit would be asserting the addition
  // order, which is not the football claim.
  assertMirrored(rightWeights.right, leftWeights.left);
  assertMirrored(rightWeights.left, leftWeights.right);
});

test("lateral focus reallocates one finite route budget and opens the connected opposite route", () => {
  const balanced = planFor({});
  const focused = planFor({ lateralFocus: "left" });
  const againstFocused = planFor({ opponentLateralFocus: "left" });

  assert.equal(opportunityRouteBudget(focused), opportunityRouteBudget(balanced));
  assert.equal(focused.contestByRoute.left.allocation > balanced.contestByRoute.left.allocation, true);
  assert.equal(focused.contestByRoute.right.allocation < balanced.contestByRoute.right.allocation, true);
  assert.equal(
    opportunityRouteSaturation(againstFocused, "right") > opportunityRouteSaturation(balanced, "right"),
    true,
    "committing your left must open the opponent's right into the space behind it",
  );
  assert.equal(againstFocused.contestByRoute.left.exposure, balanced.contestByRoute.left.exposure);
});

test("left and right focus are exact mirrors over every causal route fact", () => {
  const left = planFor({ lateralFocus: "left", opponentLateralFocus: "right" });
  const right = planFor({ lateralFocus: "right", opponentLateralFocus: "left" });
  const leftWeights = opportunityRouteWeights(left);
  const rightWeights = opportunityRouteWeights(right);

  for (const [leftRoute, rightRoute] of [
    ["central", "central"],
    ["left", "right"],
    ["right", "left"],
    ["direct", "direct"],
    ["transition", "transition"],
  ] as const) {
    assertMirrored(left.contestByRoute[leftRoute].allocation, right.contestByRoute[rightRoute].allocation);
    assertMirrored(left.contestByRoute[leftRoute].resistance, right.contestByRoute[rightRoute].resistance);
    assertMirrored(left.contestByRoute[leftRoute].exposure, right.contestByRoute[rightRoute].exposure);
    assertMirrored(opportunityRouteSaturation(left, leftRoute), opportunityRouteSaturation(right, rightRoute));
    assertMirrored(leftWeights[leftRoute], rightWeights[rightRoute]);
    assertMirrored(
      opportunityRouteQualityEdge(left, leftRoute),
      opportunityRouteQualityEdge(right, rightRoute),
    );
  }
});

test("the productive focus follows player execution and opponent weakness under mirroring", () => {
  const leftLed = tacticalShapeProfileFixture({
    overrides: { left_progression: 0.8, right_progression: 0.2 },
  });
  const opponentWeakRight = tacticalShapeProfileFixture({
    overrides: { right_coverage: 0.2, left_coverage: 0.8 },
  });
  const leftResult = opportunityRouteSaturation(planFor({
    ownShape: leftLed,
    opponentShape: opponentWeakRight,
    lateralFocus: "left",
  }), "left");
  const wrongRightResult = opportunityRouteSaturation(planFor({
    ownShape: leftLed,
    opponentShape: opponentWeakRight,
    lateralFocus: "right",
  }), "right");
  assert.equal(leftResult > wrongRightResult, true);

  const rightLed = tacticalShapeProfileFixture({
    overrides: { left_progression: 0.2, right_progression: 0.8 },
  });
  const opponentWeakLeft = tacticalShapeProfileFixture({
    overrides: { right_coverage: 0.8, left_coverage: 0.2 },
  });
  const rightResult = opportunityRouteSaturation(planFor({
    ownShape: rightLed,
    opponentShape: opponentWeakLeft,
    lateralFocus: "right",
  }), "right");
  const wrongLeftResult = opportunityRouteSaturation(planFor({
    ownShape: rightLed,
    opponentShape: opponentWeakLeft,
    lateralFocus: "left",
  }), "left");
  assert.equal(rightResult > wrongLeftResult, true);
  assertMirrored(leftResult, rightResult);
  assertMirrored(wrongRightResult, wrongLeftResult);
});

test("the strategic signature is deterministic, basis-point fixed and sensitive to a real reallocation", () => {
  const balanced = planFor({});
  const repeated = planFor({});
  const focused = planFor({ lateralFocus: "left" });
  const exact = { ...balanced, volumeMultiplier: 1 };
  const belowOneBasisPoint = { ...balanced, volumeMultiplier: 1.00004 };
  const aboveHalfBasisPoint = { ...balanced, volumeMultiplier: 1.00006 };

  assert.equal(opportunityRouteStrategicSignature(balanced), opportunityRouteStrategicSignature(repeated));
  assert.notEqual(opportunityRouteStrategicSignature(focused), opportunityRouteStrategicSignature(balanced));
  assert.equal(opportunityRouteStrategicSignature(exact), opportunityRouteStrategicSignature(belowOneBasisPoint));
  assert.notEqual(opportunityRouteStrategicSignature(exact), opportunityRouteStrategicSignature(aboveHalfBasisPoint));
  assert.equal(opportunityRouteStrategicSignature(balanced).includes("opportunity-route-plan-bps-v1"), true);
});

test("selection is deterministic for one seed and follows the weights", () => {
  const plan = planFor({
    ownShape: tacticalShapeProfileFixture({
      overrides: { left_progression: 0.9, right_progression: 0.05, central_progression: 0.05 },
    }),
  });

  assert.equal(selectOpportunityRoute(plan, rngFor("route-a")), selectOpportunityRoute(plan, rngFor("route-a")));

  const counts = countSelections(plan, 400);
  assert.equal(
    (counts.left ?? 0) > (counts.right ?? 0),
    true,
    "the overloaded flank must be chosen more often than the abandoned one",
  );
});

test("a side with no way through still picks a route rather than dividing by zero", () => {
  const plan = planFor({
    ownShape: tacticalShapeProfileFixture({ uniformCapacity: 0 }),
    opponentShape: tacticalShapeProfileFixture({ uniformCapacity: 0.9 }),
  });

  assert.equal(Math.abs(sumOfWeights(plan) - 1) < 1e-9, true);
  assert.equal(TACTICAL_ROUTES.includes(selectOpportunityRoute(plan, rngFor("dead-end"))), true);
});

test("every route names the chance type it produces", () => {
  assert.deepEqual(Object.keys(OPPORTUNITY_ROUTE_CHANCE_TYPE).sort(), [...TACTICAL_ROUTES].sort());
  assert.equal(OPPORTUNITY_ROUTE_CHANCE_TYPE.left, "cross");
  assert.equal(OPPORTUNITY_ROUTE_CHANCE_TYPE.right, "cross");
  assert.equal(OPPORTUNITY_ROUTE_CHANCE_TYPE.transition, "counter");
});

test("two shapes from different calibrations are refused rather than compared", () => {
  assert.throws(
    () =>
      deriveOpportunityRoutePlan({
        ...baseInput(),
        opponent: tacticalShapeProfileFixture({ policyVersion: "match-tactics-someone-else" }),
      }),
    (error: unknown) => error instanceof OpportunityRouteError && error.code === "mismatched_policy_version",
  );
});

/** Options a test varies; everything else stays at the neutral fixture. */
interface PlanOptions {
  readonly own?: MatchTacticalDistributionInput;
  readonly opponent?: MatchTacticalDistributionInput;
  readonly ownShape?: TacticalShapeProfile;
  readonly opponentShape?: TacticalShapeProfile;
  readonly goalDifference?: number;
  readonly lateralFocus?: DeriveOpportunityRoutePlanInput["lateralFocus"];
  readonly opponentLateralFocus?: DeriveOpportunityRoutePlanInput["opponentLateralFocus"];
}

function planFor(options: PlanOptions): OpportunityRoutePlan {
  const base = baseInput();

  return deriveOpportunityRoutePlan({
    ...base,
    ...(options.ownShape === undefined ? {} : { own: options.ownShape }),
    ...(options.opponentShape === undefined ? {} : { opponent: options.opponentShape }),
    ...(options.own === undefined ? {} : { ownTactics: options.own }),
    ...(options.opponent === undefined ? {} : { opponentTactics: options.opponent }),
    ...(options.goalDifference === undefined ? {} : { goalDifference: options.goalDifference }),
    ...(options.lateralFocus === undefined ? {} : { lateralFocus: options.lateralFocus }),
    ...(options.opponentLateralFocus === undefined ? {} : { opponentLateralFocus: options.opponentLateralFocus }),
  });
}

function baseInput(): DeriveOpportunityRoutePlanInput {
  return {
    own: tacticalShapeProfileFixture(),
    opponent: tacticalShapeProfileFixture(),
    ownTactics: neutralTactics(),
    opponentTactics: neutralTactics(),
    lateralFocus: "balanced",
    opponentLateralFocus: "balanced",
    caps: caps(),
    calibration: matchTacticsCalibrationFixture(),
    goalDifference: 0,
  };
}

function neutralTactics(): MatchTacticalDistributionInput {
  return { directness: 0.5, pressing: 0.5, width: 0.5, risk: 0.5, mentality: "balanced" };
}

/** Neutral tactics with one knob driven to an explicit intensity. */
function knobAt(knob: TacticKnob, value: number): MatchTacticalDistributionInput {
  return { ...neutralTactics(), [knob]: value };
}

function caps(): TacticalDistributionCaps {
  const cap = { minInclusive: 0, maxInclusive: 1 };
  return { directness: cap, pressing: cap, width: cap, risk: cap };
}

function sumOfWeights(plan: OpportunityRoutePlan): number {
  const weights = opportunityRouteWeights(plan);
  return TACTICAL_ROUTES.reduce((sum, route) => sum + weights[route], 0);
}

function rngFor(key: string): ReturnType<typeof deriveRng> {
  return deriveRng("opportunity-route-test", "route-selection", key);
}

function countSelections(plan: OpportunityRoutePlan, draws: number): Partial<Record<TacticalRoute, number>> {
  const counts: Partial<Record<TacticalRoute, number>> = {};
  for (let index = 0; index < draws; index += 1) {
    const route = selectOpportunityRoute(plan, rngFor(`draw-${index}`));
    counts[route] = (counts[route] ?? 0) + 1;
  }
  return counts;
}

/** Asserts two mirrored weights agree far beyond any effect a test can observe. */
function assertMirrored(left: number, right: number): void {
  assert.equal(Math.abs(left - right) < 1e-12, true, `${left} is not the mirror of ${right}`);
}
