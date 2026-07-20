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
  const tacticalControl =
    1 +
    normalizedTactic(simulation, side, "pressing") * 0.12 +
    normalizedTactic(simulation, side, "risk") * 0.04 +
    normalizedTactic(simulation, side, "width") * 0.03 -
    normalizedTactic(simulation, side, "directness") * 0.08;

  return Math.max(
    0.01,
    team.strength.midfield *
      tacticalControl *
      scorePressure *
      homeFactor *
      clamp(lineupRatio, 0.65, 1.35) *
      clamp(condition / Math.max(1, opponentCondition), 0.8, 1.2),
  );
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
