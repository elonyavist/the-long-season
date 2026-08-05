import { describe, expect, it } from "vitest";
import {
  TACTIC_KNOB_EXPOSED_ROUTE,
  TACTICAL_ROUTE_DEFINITION,
  TACTICAL_SHAPE_CAPACITIES,
  type TacticalShapeCapacity,
} from "@game/domain";

import {
  buildTacticalConsequenceView,
  MAX_TACTICAL_CONSEQUENCES,
  TACTICAL_CONSEQUENCE_EMPHASIS_AT_LEAST,
  TACTICAL_CONSEQUENCE_EXPOSURE_BELOW,
  TACTICAL_CONSEQUENCE_KEYS,
  TACTICAL_CONSEQUENCE_OVERLOAD_RATIO,
  TACTICAL_CONSEQUENCE_RULES,
  TACTICAL_CONSEQUENCE_KNOB_ABOVE,
  TACTICAL_CONSEQUENCE_UNREAD_CAPACITIES,
  tacticalConsequenceCapacities,
  type TacticalConsequenceReading,
  type TacticalConsequenceShapeReading,
  type TacticalConsequenceTacticReading,
} from "./tactical-consequence-view.ts";

/** An eleven that is ordinary in every respect, with no tactic chosen yet. */
function ordinaryReading(
  overrides: Partial<Record<TacticalShapeCapacity, number>> = {},
): TacticalConsequenceReading {
  return { shape: ordinaryShape(overrides) };
}

function ordinaryShape(
  overrides: Partial<Record<TacticalShapeCapacity, number>> = {},
): TacticalConsequenceShapeReading {
  return Object.fromEntries(
    TACTICAL_SHAPE_CAPACITIES.map((capacity) => [capacity, overrides[capacity] ?? 1]),
  ) as TacticalConsequenceShapeReading;
}

/** The four knobs at their neutral setting, overridden where a test needs it. */
function tactic(
  overrides: Partial<TacticalConsequenceTacticReading> = {},
): TacticalConsequenceTacticReading {
  return { directness: 0.5, pressing: 0.5, width: 0.5, risk: 0.5, ...overrides };
}

function observationKeys(reading: TacticalConsequenceReading): readonly string[] {
  return buildTacticalConsequenceView(reading).observations.map((observation) => observation.observationKey);
}

/** An eleven that has given up almost everything to stand in one box. */
function collapsedReading(): TacticalConsequenceReading {
  return {
    shape: Object.fromEntries(
      TACTICAL_SHAPE_CAPACITIES.map((capacity) => [
        capacity,
        capacity === "final_third_presence" || capacity === "counter_threat" ? 3 : 0.1,
      ]),
    ) as TacticalConsequenceShapeReading,
  };
}

describe("buildTacticalConsequenceView", () => {
  it("says nothing about an ordinary shape", () => {
    const view = buildTacticalConsequenceView(ordinaryReading());

    expect(view.observations).toStrictEqual([]);
    expect(view.summaryKey).toBe("career.tacticalConsequence.summary.balanced");
  });

  it("stays silent right up to the frozen thresholds", () => {
    const justInside = ordinaryReading({
      box_protection: TACTICAL_CONSEQUENCE_EXPOSURE_BELOW,
      final_third_presence: TACTICAL_CONSEQUENCE_EMPHASIS_AT_LEAST - 0.0001,
    });

    expect(buildTacticalConsequenceView(justInside).observations).toStrictEqual([]);
  });

  it("reports a capacity the shape has given up", () => {
    const view = buildTacticalConsequenceView(ordinaryReading({ box_protection: 0.4 }));

    expect(view.observations).toStrictEqual([{
      observationKey: "unprotected_box",
      kind: "exposure",
      labelKey: "career.tacticalConsequence.observation.unprotected_box",
      kindLabelKey: "career.tacticalConsequence.kind.exposure",
    }]);
    expect(view.summaryKey).toBe("career.tacticalConsequence.summary.some");
  });

  it("reports a capacity the shape concentrates in", () => {
    expect(observationKeys(ordinaryReading({ final_third_presence: 1.9 })))
      .toStrictEqual(["heavy_box_presence"]);
  });

  it("separates having no width at all from having it all on one side", () => {
    const noWidth = ordinaryReading({ left_progression: 0.5, right_progression: 0.5 });
    const oneSided = ordinaryReading({ left_progression: 0.4, right_progression: 1.6 });

    expect(observationKeys(noWidth)).toStrictEqual(["no_attacking_width"]);
    expect(observationKeys(oneSided)).toStrictEqual(["right_overload"]);
  });

  it("names the loaded side, and only one of them", () => {
    const leftHeavy = ordinaryReading({ left_progression: 1.6, right_progression: 0.4 });

    expect(observationKeys(leftHeavy)).toStrictEqual(["left_overload"]);
  });

  it("stays quiet at a flank imbalance below the frozen ratio", () => {
    const barelyUneven = ordinaryReading({
      left_progression: 1,
      right_progression: TACTICAL_CONSEQUENCE_OVERLOAD_RATIO - 0.01,
    });

    expect(observationKeys(barelyUneven)).toStrictEqual([]);
  });

  it("reports the cost before the loaded side before the concentration", () => {
    const view = buildTacticalConsequenceView(ordinaryReading({
      left_progression: 0.4,
      right_progression: 1.6,
      final_third_presence: 1.9,
      box_protection: 0.3,
    }));

    expect(view.observations.map((observation) => observation.kind))
      .toStrictEqual(["exposure", "overload", "emphasis"]);
    expect(view.observations.map((observation) => observation.observationKey))
      .toStrictEqual(["unprotected_box", "right_overload", "heavy_box_presence"]);
  });

  it("puts the largest cost first when several costs fire", () => {
    const view = buildTacticalConsequenceView(ordinaryReading({
      build_up: 0.7,
      central_coverage: 0.2,
      rest_defence: 0.45,
    }));

    expect(view.observations.map((observation) => observation.observationKey))
      .toStrictEqual(["open_centre", "exposed_transition", "weak_build_up"]);
  });

  it("breaks an exact tie on the frozen key order, not on object key order", () => {
    const view = buildTacticalConsequenceView(ordinaryReading({
      rest_defence: 0.5,
      build_up: 0.5,
      central_coverage: 0.5,
      box_protection: 0.5,
    }));

    expect(view.observations.map((observation) => observation.observationKey))
      .toStrictEqual(["weak_build_up", "open_centre", "unprotected_box"]);
  });

  it("never shows more than the frozen count, however broken the shape", () => {
    const view = buildTacticalConsequenceView(collapsedReading());

    expect(view.observations).toHaveLength(MAX_TACTICAL_CONSEQUENCES);
  });

  it("always keeps room for what a broken shape bought", () => {
    // Seven costs fire here. Filling all three slots with them would tell a
    // manager who fielded five forwards only that he has no defence, which he
    // knows - the point is the trade he made for it.
    const view = buildTacticalConsequenceView(collapsedReading());

    expect(view.observations.map((observation) => observation.kind))
      .toStrictEqual(["exposure", "exposure", "emphasis"]);
  });

  it("uses every slot for costs when the shape bought nothing", () => {
    const view = buildTacticalConsequenceView(ordinaryReading({
      build_up: 0.2,
      central_coverage: 0.2,
      box_protection: 0.2,
      rest_defence: 0.2,
    }));

    expect(view.observations).toHaveLength(MAX_TACTICAL_CONSEQUENCES);
    expect(view.observations.every((observation) => observation.kind === "exposure")).toBe(true);
  });

  it("uses every slot for gains when the shape paid nothing", () => {
    const view = buildTacticalConsequenceView(ordinaryReading({
      final_third_presence: 1.6,
      counter_threat: 1.6,
      central_coverage: 1.6,
      rest_defence: 1.6,
    }));

    expect(view.observations).toHaveLength(MAX_TACTICAL_CONSEQUENCES);
    expect(view.observations.every((observation) => observation.kind === "emphasis")).toBe(true);
  });

  it("exposes no capacity number anywhere in the view", () => {
    const view = buildTacticalConsequenceView(ordinaryReading({ box_protection: 0.123456 }));

    expect(JSON.stringify(view)).not.toMatch(/[0-9]/);
  });

  it("is a pure reading of its input", () => {
    const reading = ordinaryReading({ box_protection: 0.4, final_third_presence: 1.9 });

    expect(buildTacticalConsequenceView(reading)).toStrictEqual(buildTacticalConsequenceView(reading));
  });

  it("says both true things when the little width there is sits on one side", () => {
    const view = buildTacticalConsequenceView(ordinaryReading({
      left_progression: 0,
      right_progression: 1.2,
    }));

    // Below ordinary in total *and* entirely one-sided. Both are facts, and the
    // cost is reported before the loaded side.
    expect(view.observations.map((observation) => observation.observationKey))
      .toStrictEqual(["no_attacking_width", "right_overload"]);
  });
});

describe("tactical consequence contract", () => {
  it("orders every declared key exactly once", () => {
    expect([...TACTICAL_CONSEQUENCE_KEYS].toSorted())
      .toStrictEqual(Object.keys(TACTICAL_CONSEQUENCE_RULES).toSorted());
    expect(new Set(TACTICAL_CONSEQUENCE_KEYS).size).toBe(TACTICAL_CONSEQUENCE_KEYS.length);
  });

  it("reads only capacities the domain actually locks", () => {
    for (const key of TACTICAL_CONSEQUENCE_KEYS) {
      for (const capacity of tacticalConsequenceCapacities(key)) {
        expect(TACTICAL_SHAPE_CAPACITIES).toContain(capacity);
      }
    }
  });

  it("accounts for every locked capacity, as read or as declared unread", () => {
    // Widened to the full union on purpose: the rules narrow to whatever they
    // happen to read, so a `has(...)` against a declared-unread capacity would
    // be a type error rather than the check it is meant to be.
    const read = new Set<TacticalShapeCapacity>(
      TACTICAL_CONSEQUENCE_KEYS.flatMap((key) => [...tacticalConsequenceCapacities(key)]),
    );

    // A capacity may go unreported, but never silently: adding one without
    // either a rule or an entry in the unread list fails here.
    expect([...read, ...TACTICAL_CONSEQUENCE_UNREAD_CAPACITIES].toSorted())
      .toStrictEqual([...TACTICAL_SHAPE_CAPACITIES].toSorted());
    for (const capacity of TACTICAL_CONSEQUENCE_UNREAD_CAPACITIES) {
      expect(read.has(capacity), `${capacity} is both read and declared unread`).toBe(false);
    }
  });

  it("takes what pressing concedes from the mappings Step 06 owns", () => {
    // Not a restatement: if Step 06 ever decides pressing concedes a different
    // route, or Step 04 changes what resists it, this observation follows and
    // this assertion is what proves it still does.
    const conceded = TACTIC_KNOB_EXPOSED_ROUTE.pressing;

    expect(tacticalConsequenceCapacities("press_without_cover"))
      .toStrictEqual(TACTICAL_ROUTE_DEFINITION[conceded].opponentResistance);
  });

  it("reports a flank the shape has abandoned entirely", () => {
    // The loudest imbalance in the model. Dividing by an empty flank used to
    // return nothing, so eleven right backs said nothing about their left.
    const emptyLeft = ordinaryReading({ left_progression: 0, right_progression: 1.4 });

    expect(observationKeys(emptyLeft)).toContain("right_overload");
  });

  it("still says nothing when neither flank has anything", () => {
    const noWidthAtAll = ordinaryReading({ left_progression: 0, right_progression: 0 });
    const keys = observationKeys(noWidthAtAll);

    expect(keys).toContain("no_attacking_width");
    expect(keys).not.toContain("left_overload");
    expect(keys).not.toContain("right_overload");
  });
});

describe("pressing without cover", () => {
  /** Thin exactly where the ball over the top lands. */
  const thinBehind = { box_protection: 0.4, central_coverage: 0.4 };

  it("says nothing until a tactic has been chosen", () => {
    expect(observationKeys({ shape: ordinaryShape(thinBehind) }))
      .not.toContain("press_without_cover");
  });

  it("says nothing while the press is at its neutral setting", () => {
    expect(observationKeys({ shape: ordinaryShape(thinBehind), tactic: tactic() }))
      .not.toContain("press_without_cover");
  });

  it("reports a high press over a shape that cannot cover what it concedes", () => {
    const keys = observationKeys({
      shape: ordinaryShape(thinBehind),
      tactic: tactic({ pressing: 0.85 }),
    });

    expect(keys).toContain("press_without_cover");
  });

  it("stays quiet when the same press sits over a shape that can hold the ball over the top", () => {
    expect(observationKeys({ shape: ordinaryShape(), tactic: tactic({ pressing: 0.85 }) }))
      .not.toContain("press_without_cover");
  });

  it("holds its frozen knob threshold", () => {
    const atThreshold = observationKeys({
      shape: ordinaryShape(thinBehind),
      tactic: tactic({ pressing: TACTICAL_CONSEQUENCE_KNOB_ABOVE }),
    });
    const justAbove = observationKeys({
      shape: ordinaryShape(thinBehind),
      tactic: tactic({ pressing: TACTICAL_CONSEQUENCE_KNOB_ABOVE + 0.01 }),
    });

    expect(atThreshold).not.toContain("press_without_cover");
    expect(justAbove).toContain("press_without_cover");
  });

  it("is about the press, not the other three knobs", () => {
    for (const knob of ["directness", "width", "risk"] as const) {
      expect(observationKeys({
        shape: ordinaryShape(thinBehind),
        tactic: tactic({ [knob]: 0.9 }),
      }), knob).not.toContain("press_without_cover");
    }
  });
});

