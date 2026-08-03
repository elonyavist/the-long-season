import assert from "node:assert/strict";
import { test } from "vitest";

import {
  MATCH_TACTICS_CALIBRATION_SCHEMA_VERSION,
  TACTICAL_ROUTE_MIRROR,
  TACTICAL_ROUTES,
  TACTICAL_SHAPE_CAPACITIES,
  TACTICAL_SHAPE_CAPACITY_MIRROR,
  TACTICAL_SHAPE_TASKS,
  type CanonicalPlayerRole,
  type MatchTacticsCalibrationConfig,
  type TacticalShapeCapacity,
  type TacticalShapeTask,
} from "@game/domain";

import {
  deriveTacticalMatchup,
  TacticalMatchupError,
  type TacticalMatchup,
} from "./tactical-matchup.ts";
import { flatMatchTacticsCalibrationFixture } from "../test-fixtures/match-tactics-calibration.ts";
import type { TacticalShapeProfile } from "./tactical-shape.ts";

/**
 * The matchup module owns one question: given two shapes, how does each route
 * fare. The shape module already proves which lineup produces which profile, so
 * these tests start from profiles and never rebuild a lineup - that would put
 * the same football fact in two places.
 *
 * The named profiles below are the *kind* of profile each shape produces, taken
 * from the intrinsic-shape measurements recorded in Step 03.
 */

const POLICY = "match-tactics-matchup-fixture";

/* -------------------------------------------------------------------------- */
/* Symmetry and determinism                                                   */
/* -------------------------------------------------------------------------- */

test("two identical shapes contest every route evenly", () => {
  const matchup = matchupOf(BALANCED, BALANCED);

  for (const route of TACTICAL_ROUTES) {
    assert.equal(matchup.routes[route].ownChain, matchupOf(BALANCED, BALANCED).routes[route].ownChain);
    assert.equal(
      matchup.routes[route].capacity,
      matchupOf(BALANCED, BALANCED).routes[route].capacity,
      `${route} must be identical for identical shapes`,
    );
  }

  assert.equal(matchup.routes.left.capacity, matchup.routes.right.capacity);
});

test("swapping which side attacks is stable, not order dependent", () => {
  const forward = matchupOf(BALANCED, EXTREME_ATTACK);
  const reverse = matchupOf(EXTREME_ATTACK, BALANCED);

  assert.deepEqual(matchupOf(BALANCED, EXTREME_ATTACK), forward);
  assert.deepEqual(matchupOf(EXTREME_ATTACK, BALANCED), reverse);
  assert.notDeepEqual(reverse.routes, forward.routes);
});

test("mirroring both shapes mirrors every route", () => {
  const original = matchupOf(LEFT_OVERLOAD, BALANCED);
  const mirrored = matchupOf(mirror(LEFT_OVERLOAD), mirror(BALANCED));

  for (const route of TACTICAL_ROUTES) {
    assert.equal(
      mirrored.routes[TACTICAL_ROUTE_MIRROR[route]].capacity,
      original.routes[route].capacity,
      `${route} must mirror onto ${TACTICAL_ROUTE_MIRROR[route]}`,
    );
  }
});

test("the same pair always produces the same matchup", () => {
  assert.deepEqual(matchupOf(EXTREME_ATTACK, DEEP_BLOCK), matchupOf(EXTREME_ATTACK, DEEP_BLOCK));
});

/* -------------------------------------------------------------------------- */
/* Bounds                                                                     */
/* -------------------------------------------------------------------------- */

test("no shape pairing produces NaN, a negative value, or an unclamped one", () => {
  const shapes = [BALANCED, EXTREME_ATTACK, EXTREME_DEFENCE, DEEP_BLOCK, LEFT_OVERLOAD, NO_LEFT_SIDE];

  for (const own of shapes) {
    for (const opponent of shapes) {
      const matchup = matchupOf(own, opponent);
      for (const route of TACTICAL_ROUTES) {
        const { capacity, ownChain, opponentResistance } = matchup.routes[route];
        assert.equal(Number.isFinite(capacity) && capacity >= 0 && capacity <= 1, true, `${route} capacity ${capacity}`);
        assert.equal(Number.isFinite(ownChain) && ownChain >= 0, true, `${route} chain ${ownChain}`);
        assert.equal(
          Number.isFinite(opponentResistance) && opponentResistance >= 0,
          true,
          `${route} resistance ${opponentResistance}`,
        );
      }
    }
  }
});

test("a flank with nobody on it is nearly shut, but the ball can still go long", () => {
  const matchup = matchupOf(NO_LEFT_SIDE, BALANCED);

  assert.equal(matchup.routes.left.bottleneck, "left_progression");
  assert.equal(matchup.routes.left.capacity < matchup.routes.right.capacity * 0.6, true, "the dead flank must collapse");
  assert.equal(matchup.routes.left.capacity > 0, true, "without deleting the route: a long ball still exists");
  assert.equal(
    matchup.routes.direct.capacity,
    matchupOf(BALANCED, BALANCED).routes.direct.capacity,
    "and the direct route is untouched by it",
  );
});

test("a shape with no capacity anywhere produces zeroes rather than NaN", () => {
  const nothing = Object.fromEntries(TACTICAL_SHAPE_CAPACITIES.map((capacity) => [capacity, 0]));
  const empty: TacticalShapeProfile = {
    policyVersion: POLICY,
    capacities: nothing as Readonly<Record<TacticalShapeCapacity, number>>,
  };

  for (const route of TACTICAL_ROUTES) {
    assert.equal(matchupOf(empty, empty).routes[route].capacity, 0, `${route} must be zero, not NaN`);
  }
});

test("comparing profiles from two different calibrations is refused", () => {
  assert.throws(
    () =>
      deriveTacticalMatchup({
        own: BALANCED,
        opponent: { ...BALANCED, policyVersion: "something-else" },
        calibration: calibration(),
      }),
    (error: unknown) => error instanceof TacticalMatchupError && error.code === "mismatched_policy_version",
  );
});

/* -------------------------------------------------------------------------- */
/* Football behaviour                                                         */
/* -------------------------------------------------------------------------- */

test("a route is limited by its weakest phase, and says which one", () => {
  const brokenMiddle = profile({ central_progression: 0.08 });

  assert.equal(matchupOf(brokenMiddle, BALANCED).routes.central.bottleneck, "central_progression");
  assert.equal(
    matchupOf(brokenMiddle, BALANCED).routes.central.capacity < matchupOf(BALANCED, BALANCED).routes.central.capacity,
    true,
    "a broken middle must cost the central route",
  );
  assert.equal(
    matchupOf(brokenMiddle, BALANCED).routes.direct.capacity,
    matchupOf(BALANCED, BALANCED).routes.direct.capacity,
    "going direct skips the broken phase entirely",
  );
});

test("repairing the bottleneck helps more than improving what already works", () => {
  const broken = profile({ central_progression: 0.15 });
  const base = matchupOf(broken, BALANCED).routes.central.capacity;

  const repaired = matchupOf(profile({ central_progression: 0.35 }), BALANCED).routes.central.capacity;
  const polished = matchupOf(
    profile({ central_progression: 0.15, final_third_presence: 0.72 }),
    BALANCED,
  ).routes.central.capacity;

  assert.equal(repaired > base, true, "fixing the bottleneck must help");
  assert.equal(polished > base, true, "a stronger front line still counts for something");
  assert.equal(repaired > polished, true, "but it must count for less than fixing the bottleneck");
});

test("a coherent press bites into build-up and only into build-up", () => {
  const looseOpponent = profile({ pressing_cohesion: 0.10 });
  const fierceOpponent = profile({ pressing_cohesion: 0.90 });

  const loose = matchupOf(BALANCED, looseOpponent).routes;
  const fierce = matchupOf(BALANCED, fierceOpponent).routes;

  assert.equal(fierce.central.capacity < loose.central.capacity, true, "pressing must hurt the built-up routes");
  assert.equal(fierce.direct.capacity < loose.direct.capacity, true, "direct play still starts from the back");
  assert.equal(fierce.transition.capacity, loose.transition.capacity, "a counter does not wait for build-up");
  assert.equal(fierce.central.bottleneck, "build_up", "and the press is named as the reason");
});

test("an incoherent press is a weak press", () => {
  const coherent = profile({ pressing_cohesion: 0.80 });
  const incoherent = profile({ pressing_cohesion: 0.20 });

  assert.equal(
    matchupOf(BALANCED, coherent).routes.central.capacity < matchupOf(BALANCED, incoherent).routes.central.capacity,
    true,
  );
});

test("a flank overload is punished by whoever is weak on the opposite flank", () => {
  const weakOnItsRight = profile({ right_coverage: 0.12 });

  const versusWeak = matchupOf(LEFT_OVERLOAD, weakOnItsRight).routes;
  const versusBalanced = matchupOf(LEFT_OVERLOAD, BALANCED).routes;

  assert.equal(versusWeak.left.capacity > versusBalanced.left.capacity, true, "the overloaded flank must open up");
  assert.equal(versusWeak.right.capacity, versusBalanced.right.capacity, "the other flank is untouched");
});

test("a front-loaded shape trades its flanks for the counter", () => {
  const extremeAttacks = matchupOf(EXTREME_ATTACK, BALANCED).routes;
  const balancedAttacks = matchupOf(BALANCED, EXTREME_ATTACK).routes;

  assert.equal(extremeAttacks.transition.capacity > balancedAttacks.transition.capacity, true, "it counters better");
  assert.equal(extremeAttacks.left.capacity < balancedAttacks.left.capacity, true, "and is worse down the flanks");
  assert.equal(balancedAttacks.left.capacity > 0.5, true, "which the balanced side can exploit");
});

test("a defence-loaded shape is hard to break down and cannot get out", () => {
  const deepBlockAttacks = matchupOf(EXTREME_DEFENCE, BALANCED).routes;
  const balancedAttacks = matchupOf(BALANCED, EXTREME_DEFENCE).routes;

  assert.equal(balancedAttacks.central.capacity < 0.5, true, "attacking it must be hard");
  assert.equal(deepBlockAttacks.central.capacity < 0.5, true, "but it cannot progress either");
  assert.equal(
    deepBlockAttacks.direct.capacity > deepBlockAttacks.central.capacity,
    true,
    "so its best way out is direct",
  );
});

test("stronger players in the same shape improve every route", () => {
  const better = scale(BALANCED, 1.25);

  for (const route of TACTICAL_ROUTES) {
    assert.equal(
      matchupOf(better, BALANCED).routes[route].capacity > matchupOf(BALANCED, BALANCED).routes[route].capacity,
      true,
      `${route} must reward quality`,
    );
  }
});

/* -------------------------------------------------------------------------- */
/* Fixtures                                                                   */
/* -------------------------------------------------------------------------- */

function matchupOf(own: TacticalShapeProfile, opponent: TacticalShapeProfile): TacticalMatchup {
  return deriveTacticalMatchup({ own, opponent, calibration: calibration() });
}

/** A profile at the ordinary mid-range, with named capacities overridden. */
function profile(overrides: Partial<Record<TacticalShapeCapacity, number>>): TacticalShapeProfile {
  return {
    policyVersion: POLICY,
    capacities: Object.fromEntries(
      TACTICAL_SHAPE_CAPACITIES.map((capacity) => [capacity, overrides[capacity] ?? 0.52]),
    ) as Readonly<Record<TacticalShapeCapacity, number>>,
  };
}

function mirror(source: TacticalShapeProfile): TacticalShapeProfile {
  return {
    policyVersion: source.policyVersion,
    capacities: Object.fromEntries(
      TACTICAL_SHAPE_CAPACITIES.map((capacity) => [
        capacity,
        source.capacities[TACTICAL_SHAPE_CAPACITY_MIRROR[capacity]],
      ]),
    ) as Readonly<Record<TacticalShapeCapacity, number>>,
  };
}

function scale(source: TacticalShapeProfile, factor: number): TacticalShapeProfile {
  return {
    policyVersion: source.policyVersion,
    capacities: Object.fromEntries(
      TACTICAL_SHAPE_CAPACITIES.map((capacity) => [capacity, Math.min(0.99, source.capacities[capacity] * factor)]),
    ) as Readonly<Record<TacticalShapeCapacity, number>>,
  };
}

/** An ordinary balanced eleven: everything mid-range, both flanks equal. */
const BALANCED = profile({});

/** The profile a `3-1-6` produces: presence and counter bought with the flanks. */
const EXTREME_ATTACK = profile({
  central_progression: 0.45,
  left_progression: 0.44,
  right_progression: 0.44,
  final_third_presence: 0.61,
  left_coverage: 0.29,
  right_coverage: 0.29,
  counter_threat: 0.57,
});

/** The profile an `8-0-2` produces: a protected box and nowhere to go. */
const EXTREME_DEFENCE = profile({
  build_up: 0.54,
  central_progression: 0.34,
  left_progression: 0.38,
  right_progression: 0.38,
  final_third_presence: 0.49,
  left_coverage: 0.42,
  right_coverage: 0.42,
  box_protection: 0.59,
  rest_defence: 0.58,
});

/** A low block: everything behind the ball, pressing deliberately abandoned. */
const DEEP_BLOCK = profile({
  pressing_cohesion: 0.18,
  central_coverage: 0.66,
  box_protection: 0.68,
  rest_defence: 0.64,
  final_third_presence: 0.31,
});

/** One flank loaded at the expense of the other. */
const LEFT_OVERLOAD = profile({
  left_progression: 0.74,
  right_progression: 0.24,
  left_coverage: 0.66,
  right_coverage: 0.32,
});

/** Nobody at all on one flank, which the intrinsic step allows. */
const NO_LEFT_SIDE = profile({ left_progression: 0, left_coverage: 0 });

function calibration(): MatchTacticsCalibrationConfig {
  return flatMatchTacticsCalibrationFixture({ version: POLICY });
}
