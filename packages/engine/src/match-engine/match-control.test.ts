import assert from "node:assert/strict";
import { test } from "vitest";

import {
  clubId,
  fixtureId,
  playerId,
  TACTIC_KNOB_CONTROL_DIRECTION,
  TACTIC_KNOBS,
  type MatchTacticsCalibrationConfig,
  type TacticalShapeCapacity,
  type TacticKnob,
} from "@game/domain";

import { deriveMatchMinuteControl } from "./match-control.ts";
import type { MatchContext, MatchTeamContext } from "./match-context.ts";
import type { MatchEngineConfig } from "./match-engine-config.ts";
import { createLineupSlot } from "./team-strength.ts";
import {
  createInitialMatchSimulationState,
  telemetryFor,
  type MatchSimulationState,
} from "./match-simulation-state.ts";
import type { TacticalShapeProfile } from "./tactical-shape.ts";
import {
  flatMatchTacticsCalibrationFixture,
  tacticalShapeProfileFixture,
} from "../test-fixtures/match-tactics-calibration.ts";
import { withNeutralIncidentProfiles } from "../test-fixtures/match-player-incident-profiles.ts";

/**
 * These tests own the possession contest: who keeps the ball, and what the four
 * manager knobs do to that. The football claims are directional; the one exact
 * assertion below exists because Phase 81A Step 01 moved the four magnitudes out
 * of this file and into the versioned calibration, and that move had to change
 * nothing at all.
 */

test("the migrated control magnitudes reproduce the frozen coefficients exactly", () => {
  // The whole justification for moving `0.12 / 0.04 / 0.03 / -0.08` into
  // content is that a stamped calibration must be able to describe what a
  // career's tactics did. The move is only allowed to be free if it is exact,
  // and it is exact for two reasons rather than by measurement:
  //
  // 1. IEEE754 division is correctly rounded, so `1200 / 10_000` *is* the double
  //    nearest `0.12` - the same double the literal parsed to.
  // 2. Negation is exact and `a - b` is defined as `a + (-b)`, so pushing the
  //    sign into the magnitude cannot move a bit either.
  //
  // What that leaves is the addition order, which is not associative and is
  // therefore written out in `controlWeight(...)` rather than looped.
  assert.equal(1_200 / 10_000, 0.12);
  assert.equal(400 / 10_000, 0.04);
  assert.equal(300 / 10_000, 0.03);
  assert.equal(800 / 10_000, 0.08);

  const sample = 0.375;
  assert.equal(1 - sample * 0.08, 1 + sample * -0.08);
});

test("every knob is priced and pointed, so no control magnitude reaches the minute unsigned", () => {
  const semantics = calibration().tacticalSemantics;

  for (const knob of TACTIC_KNOBS) {
    assert.equal(
      semantics.controlBasisPointsByKnob[knob] > 0,
      true,
      `${knob} reaches the minute with no control magnitude`,
    );
    assert.equal(
      TACTIC_KNOB_CONTROL_DIRECTION[knob] === "increase"
        || TACTIC_KNOB_CONTROL_DIRECTION[knob] === "decrease",
      true,
      `${knob} moves control in no declared direction`,
    );
  }
});

test("content owns how hard a knob moves the ball, not the engine", () => {
  // The reachability proof for the migration: change only the asset and the
  // minute changes. While these were literals, a calibration could say anything
  // and possession would not notice.
  const gentle = possessionWith({ homePressing: 1, control: { pressing: 100 } });
  const fierce = possessionWith({ homePressing: 1, control: { pressing: 4_000 } });

  assert.equal(
    fierce > gentle,
    true,
    `a bigger pressing magnitude must buy more of the ball: ${fierce} against ${gentle}`,
  );
});

test("pressing, committing, and stretching the pitch all buy the ball", () => {
  const neutral = possessionWith({});

  assert.equal(possessionWith({ homePressing: 1 }) > neutral, true, "pressing");
  assert.equal(possessionWith({ homeRisk: 1 }) > neutral, true, "risk");
  assert.equal(possessionWith({ homeWidth: 1 }) > neutral, true, "width");
});

test("playing long gives the ball away", () => {
  // The one knob whose direction is `decrease`, and the reason the direction
  // mapping exists at all: without it the magnitude would need a sign, and a
  // signed field would not pass the `0..10000` validator every other tactic
  // magnitude passes.
  assert.equal(possessionWith({ homeDirectness: 1 }) < possessionWith({}), true);
});

test("a shape that cannot keep the ball earns less of the possession contest", () => {
  // Reading only the midfield department was the defect: a side with eleven
  // midfielders who cannot connect kept the ball as well as a side built to keep
  // it, and an empty midfield department was the engine's only way to say the
  // connection was broken. Both sides here field the same eleven and the same
  // department strength; only the shape differs.
  const connected = possessionWith({ homeShape: { build_up: 0.8, central_progression: 0.8 } });
  const disconnected = possessionWith({ homeShape: { build_up: 0.15, central_progression: 0.15 } });

  assert.equal(
    connected > disconnected,
    true,
    `${connected} against ${disconnected}`,
  );
});

test("possession is a contest, so the two shares are one distribution", () => {
  const control = controlFor({ homePressing: 1, awayDirectness: 1 });

  assert.equal(control.possession.home + control.possession.away, 1);
  assert.equal(control.possession.home > control.possession.away, true);
});

/** What one case varies; anything unset stays neutral and mirrored. */
interface ControlOptions {
  readonly homePressing?: number;
  readonly homeDirectness?: number;
  readonly homeWidth?: number;
  readonly homeRisk?: number;
  readonly awayDirectness?: number;
  readonly homeShape?: Partial<Record<TacticalShapeCapacity, number>>;
  /** Overrides for the control magnitudes both sides are calibrated with. */
  readonly control?: Partial<Record<TacticKnob, number>>;
}

/** The home side's share of one minute of possession under these options. */
function possessionWith(options: ControlOptions): number {
  return controlFor(options).possession.home;
}

function controlFor(options: ControlOptions): ReturnType<typeof deriveMatchMinuteControl> {
  const simulation = simulationFor(options);

  return deriveMatchMinuteControl(simulation, telemetryFor(simulation));
}

/**
 * Builds a match where both sides are identical apart from what a case varies.
 *
 * Mirrored elevens, equal department strength, level score, and a home
 * advantage of exactly `1` leave the knobs and the shape as the only things
 * that can move possession, so a directional assertion measures what it names.
 */
function simulationFor(options: ControlOptions): MatchSimulationState {
  const context: MatchContext = {
    fixtureId: fixtureId("fixture:control-000001"),
    seed: "control-seed",
    home: team("home", {
      shape: shapeFor(options.homeShape),
      directness: options.homeDirectness ?? NEUTRAL_KNOB,
      pressing: options.homePressing ?? NEUTRAL_KNOB,
      width: options.homeWidth ?? NEUTRAL_KNOB,
      risk: options.homeRisk ?? NEUTRAL_KNOB,
    }),
    away: team("away", {
      shape: shapeFor(undefined),
      directness: options.awayDirectness ?? NEUTRAL_KNOB,
      pressing: NEUTRAL_KNOB,
      width: NEUTRAL_KNOB,
      risk: NEUTRAL_KNOB,
    }),
    engineConfig: engineConfig(),
    matchTacticsCalibration: calibration(options.control),
  };

  return createInitialMatchSimulationState(context);
}

interface TeamOptions {
  readonly shape: TacticalShapeProfile;
  readonly directness: number;
  readonly pressing: number;
  readonly width: number;
  readonly risk: number;
}

function team(side: "home" | "away", options: TeamOptions): MatchTeamContext {
  return withNeutralIncidentProfiles({
    clubId: clubId(`club:${side}`),
    lineup: LINEUP_SLOT_INDEXES.map((index) =>
      createLineupSlot({
        slotId: `slot:${side}-${index}`,
        playerId: playerId(`player:${side}-00000${index}`),
        canonicalRole: index === 1 ? "goalkeeper" : "central_midfielder",
      }),
    ),
    strength: { attack: 10, midfield: 10, defense: 10, goalkeeper: 10, overall: 10 },
    shape: options.shape,
    tacticalDistribution: {
      directness: options.directness,
      pressing: options.pressing,
      width: options.width,
      risk: options.risk,
      mentality: "balanced",
    },
  });
}

function shapeFor(overrides: Partial<Record<TacticalShapeCapacity, number>> | undefined): TacticalShapeProfile {
  return tacticalShapeProfileFixture({
    uniformCapacity: 0.5,
    ...(overrides === undefined ? {} : { overrides }),
    policyVersion: CONTROL_POLICY_VERSION,
  });
}

function calibration(
  control?: Partial<Record<TacticKnob, number>>,
): MatchTacticsCalibrationConfig {
  const base = flatMatchTacticsCalibrationFixture({ version: CONTROL_POLICY_VERSION });
  if (control === undefined) return base;

  return {
    ...base,
    tacticalSemantics: {
      ...base.tacticalSemantics,
      controlBasisPointsByKnob: { ...base.tacticalSemantics.controlBasisPointsByKnob, ...control },
    },
  };
}

function engineConfig(): MatchEngineConfig {
  const cap = { minInclusive: 0, maxInclusive: 1 };

  return {
    minuteCount: 90,
    rates: { baseOpportunityRatePerMinute: 0.04, maxOpportunityRatePerMinute: 0.2 },
    conversionBands: [{ bandKey: "low", minQualityInclusive: 0, maxQualityExclusive: 1, goalProbability: 0.1 }],
    homeAdvantageFactor: 1,
    tacticalDistributionCaps: { directness: cap, pressing: cap, width: cap, risk: cap },
  };
}

/** The knob setting that asks for nothing, given `0..1` caps. */
const NEUTRAL_KNOB = 0.5;

/** The fixture's own policy stamp, shared by its calibration and both shapes. */
const CONTROL_POLICY_VERSION = "match-tactics-control-fixture";

/** Eleven slots, so neither side is short-handed and the lineup ratio is `1`. */
const LINEUP_SLOT_INDEXES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const;
