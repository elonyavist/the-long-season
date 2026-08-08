import type { MatchTeamContext } from "./match-context.ts";
import type { OpportunityRoutePlan } from "./opportunity-route.ts";
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
  plans: Readonly<Record<MatchSide, OpportunityRoutePlan>>,
): MatchMinuteControl {
  const homeWeight = controlWeight(simulation, telemetry, "home", plans.home);
  const awayWeight = controlWeight(simulation, telemetry, "away", plans.away);
  const total = homeWeight + awayWeight;
  const unclampedHomeShare = total === 0 ? 0.5 : homeWeight / total;
  const homeShare = clamp(unclampedHomeShare, MIN_POSSESSION_SHARE, MAX_POSSESSION_SHARE);
  const awayShare = 1 - homeShare;

  return {
    possession: { home: homeShare, away: awayShare },
    chanceCreationMultiplier: {
      home: chanceCreationMultiplier(homeShare, plans.home),
      away: chanceCreationMultiplier(awayShare, plans.away),
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
 * The minute plan has already settled every tactical term: conserved route
 * allocation, the one pressing contest, the four knob directions and their
 * calibrated magnitudes. This function contributes only match-state facts that
 * do not belong to a tactical plan: player quality/condition, score pressure,
 * venue and numerical advantage.
 */
function controlWeight(
  simulation: MatchSimulationState,
  telemetry: MatchSimulationTelemetry,
  side: MatchSide,
  plan: OpportunityRoutePlan,
): number {
  const team = teamFor(simulation, side);
  const opponent = teamFor(simulation, oppositeSide(side));
  const condition = averageLineupCondition(team, telemetry);
  const opponentCondition = averageLineupCondition(opponent, telemetry);
  const lineupRatio = team.lineup.length / Math.max(1, opponent.lineup.length);
  const scorePressure = scoreStatePressure(simulation.score, side);
  const homeFactor = side === "home" ? Math.sqrt(simulation.context.engineConfig.homeAdvantageFactor) : 1;
  return Math.max(
    0.01,
    team.strength.midfield *
      plan.controlMultiplier *
      scorePressure *
      homeFactor *
      clamp(lineupRatio, 0.65, 1.35) *
      clamp(condition / Math.max(1, opponentCondition), 0.8, 1.2),
  );
}

function chanceCreationMultiplier(possessionShare: number, plan: OpportunityRoutePlan): number {
  const possessionInfluence = 0.72 + possessionShare * 0.56;
  const counterRelief = (1 - possessionShare) * plan.counterOpportunityRelief;
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
