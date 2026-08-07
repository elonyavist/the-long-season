import {
  TACTIC_KNOB_CONTROL_DIRECTION,
  TACTIC_KNOBS,
  type MatchTacticsCalibrationConfig,
  type TacticKnob,
} from "@game/domain";

import type { MatchTeamContext } from "./match-context.ts";
import type {
  MatchControlUnits,
  MatchScore,
  MatchSide,
  MatchSimulationState,
  MatchSimulationTelemetry,
} from "./match-simulation-state.ts";

/** Possession and chance-volume control derived for one completed minute. */
export interface MatchMinuteControl {
  readonly possession: { readonly home: number; readonly away: number };
  readonly chanceCreationMultiplier: { readonly home: number; readonly away: number };
}

/**
 * Derives one minute of football control without consuming randomness.
 *
 * Control affects whether chances are created. It never changes the resolver's
 * conversion probability once a chance exists.
 */
export function deriveMatchMinuteControl(
  simulation: MatchSimulationState,
  telemetry: MatchSimulationTelemetry,
): MatchMinuteControl {
  const homeWeight = controlWeight(simulation, telemetry, "home");
  const awayWeight = controlWeight(simulation, telemetry, "away");
  const total = homeWeight + awayWeight;
  const unclampedHomeShare = total === 0 ? 0.5 : homeWeight / total;
  const homeShare = clamp(unclampedHomeShare, MIN_POSSESSION_SHARE, MAX_POSSESSION_SHARE);
  const awayShare = 1 - homeShare;

  return {
    possession: { home: homeShare, away: awayShare },
    chanceCreationMultiplier: {
      home: chanceCreationMultiplier(homeShare, simulation.context.home),
      away: chanceCreationMultiplier(awayShare, simulation.context.away),
    },
  };
}

/** Adds one minute's possession shares to cumulative control units. */
export function accumulateControlUnits(
  current: MatchControlUnits,
  minute: MatchMinuteControl,
): MatchControlUnits {
  return {
    home: current.home + minute.possession.home,
    away: current.away + minute.possession.away,
  };
}

/**
 * How much of the ball one side earns this minute.
 *
 * Two things decide it and the split between them is content's: the midfield
 * department's raw quality, and what the *shape* can do on the ball. Reading
 * only the department was the defect - a side with eleven midfielders who
 * cannot connect kept the ball as well as a side built to keep it, and a side
 * with an empty midfield department was the engine's only way to say "this
 * connection is broken".
 *
 * The shape term is contested by the opponent's press, so possession is a
 * contest rather than two independent readings compared afterwards.
 *
 * The four knob magnitudes are content's, read through the versioned
 * calibration the rest of the tactic model already travels in. They used to be
 * literals here, which meant one stamped version could not describe what a
 * career's tactics actually did.
 */
function controlWeight(
  simulation: MatchSimulationState,
  telemetry: MatchSimulationTelemetry,
  side: MatchSide,
): number {
  const team = teamFor(simulation, side);
  const opponent = teamFor(simulation, oppositeSide(side));
  const condition = averageLineupCondition(team, telemetry);
  const opponentCondition = averageLineupCondition(opponent, telemetry);
  const lineupRatio = team.lineup.length / Math.max(1, opponent.lineup.length);
  const scorePressure = scoreStatePressure(simulation.score, side);
  const homeFactor = side === "home" ? Math.sqrt(simulation.context.engineConfig.homeAdvantageFactor) : 1;
  const control = signedControlMagnitudes(simulation.context.matchTacticsCalibration);
  const tacticalControl =
    1 +
    normalizedTactic(simulation, side, "pressing") * control.pressing +
    normalizedTactic(simulation, side, "risk") * control.risk +
    normalizedTactic(simulation, side, "width") * control.width +
    normalizedTactic(simulation, side, "directness") * control.directness;

  return Math.max(
    0.01,
    onTheBallQuality(simulation, side) *
      tacticalControl *
      scorePressure *
      homeFactor *
      clamp(lineupRatio, 0.65, 1.35) *
      clamp(condition / Math.max(1, opponentCondition), 0.8, 1.2),
  );
}

/**
 * Turns each knob's control magnitude into the signed factor the sum applies.
 *
 * Content stores an unsigned `0..10000` share so it passes the same validator
 * every other tactic magnitude passes, and `TACTIC_KNOB_CONTROL_DIRECTION`
 * owns which way it points. Walking `TACTIC_KNOBS` here is what makes the
 * mapping total: a knob without a direction or a magnitude cannot reach the
 * minute loop.
 *
 * The caller applies these in its own written order rather than in this one.
 * That is deliberate and it is the whole reason this returns a record instead
 * of a total: floating-point addition is not associative, so summing the four
 * terms in a different order moves the result by an ulp, and the phase's
 * before/after replay proof is bit-exact. The order the terms are added in is
 * arithmetic, not football, so it belongs beside the arithmetic.
 */
function signedControlMagnitudes(
  calibration: MatchTacticsCalibrationConfig,
): Readonly<Record<TacticKnob, number>> {
  const magnitudes = {} as Record<TacticKnob, number>;
  for (const knob of TACTIC_KNOBS) {
    const share = calibration.tacticalSemantics.controlBasisPointsByKnob[knob] / 10_000;
    magnitudes[knob] = TACTIC_KNOB_CONTROL_DIRECTION[knob] === "increase" ? share : -share;
  }

  return magnitudes;
}

/**
 * Blends department strength with what the shape does on the ball.
 *
 * The shape term is expressed on the department scale before blending, so the
 * two halves are commensurable and the configured share means what it says: at
 * `5000` basis points, exactly half of who keeps the ball is structure.
 */
function onTheBallQuality(simulation: MatchSimulationState, side: MatchSide): number {
  const team = teamFor(simulation, side);
  const opponent = teamFor(simulation, oppositeSide(side));
  const shapeShare =
    simulation.context.matchTacticsCalibration.tacticalSemantics.shapeControlShareBasisPoints / 10_000;

  const press = team.shape.capacities.pressing_cohesion
    * (0.5 + normalizedTactic(simulation, side, "pressing"));
  const onTheBall = (team.shape.capacities.build_up + team.shape.capacities.central_progression + press) / 3;
  const contested = onTheBall * (1 - shapeShare * opponent.shape.capacities.pressing_cohesion);
  const shapeOnDepartmentScale = contested / NEUTRAL_SHAPE_CAPACITY;

  return team.strength.midfield * ((1 - shapeShare) + shapeShare * shapeOnDepartmentScale);
}

function chanceCreationMultiplier(possessionShare: number, team: MatchTeamContext): number {
  const possessionInfluence = 0.72 + possessionShare * 0.56;
  const counterRelief = (1 - possessionShare) * clamp(team.tacticalDistribution.directness, 0, 1) * 0.18;
  return clamp(possessionInfluence + counterRelief, 0.72, 1.28);
}

function averageLineupCondition(team: MatchTeamContext, telemetry: MatchSimulationTelemetry): number {
  if (team.lineup.length === 0) return 100;

  const total = team.lineup.reduce(
    (sum, slot) => sum + (telemetry.playerCondition[slot.playerId] ?? 100),
    0,
  );
  return total / team.lineup.length;
}

function scoreStatePressure(score: MatchScore, side: MatchSide): number {
  const difference = side === "home" ? score.home - score.away : score.away - score.home;
  if (difference < 0) return 1.08;
  if (difference > 0) return 0.96;
  return 1;
}

function normalizedTactic(
  simulation: MatchSimulationState,
  side: MatchSide,
  key: "directness" | "pressing" | "width" | "risk",
): number {
  const cap = simulation.context.engineConfig.tacticalDistributionCaps[key];
  const value = teamFor(simulation, side).tacticalDistribution[key];
  const range = cap.maxInclusive - cap.minInclusive;
  return range === 0 ? 0.5 : (value - cap.minInclusive) / range;
}

function teamFor(simulation: MatchSimulationState, side: MatchSide): MatchTeamContext {
  return side === "home" ? simulation.context.home : simulation.context.away;
}

function oppositeSide(side: MatchSide): MatchSide {
  return side === "home" ? "away" : "home";
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

const MIN_POSSESSION_SHARE = 0.18;
const MAX_POSSESSION_SHARE = 0.82;

/**
 * Capacity an ordinary balanced eleven of ordinary players reaches.
 *
 * Dividing by it turns a bounded capacity into a multiplier around `1`, so a
 * coherent shape neither inflates nor deflates the department scale it is
 * blended with. Shipped calibrations put a reference `4-4-2` near this value.
 */
const NEUTRAL_SHAPE_CAPACITY = 0.5;
