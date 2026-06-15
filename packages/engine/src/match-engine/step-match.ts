import type { Rng } from "@game/shared";

import { AggregateOccasionResolver } from "./aggregate-occasion-resolver.ts";
import type { MatchTeamContext } from "./match-context.ts";
import {
  isMatchSimulationComplete,
  type MatchScore,
  type MatchSide,
  type MatchSideStats,
  type MatchSimulationState,
  type MatchSimulationStats,
} from "./match-simulation-state.ts";
import type { OccasionOutcome, OccasionResolver, OccasionResolution } from "./occasion-resolver.ts";

/**
 * Sparse event emitted by one `stepMatch` call.
 *
 * This is an engine-local event shape for the minute loop. The durable domain
 * `MatchEvent` contract is intentionally left to the later match-report step.
 */
export type MatchStepEvent =
  | MatchKickoffStepEvent
  | MatchShotOutcomeStepEvent
  | MatchHalfTimeStepEvent
  | MatchFullTimeStepEvent;

/**
 * Kickoff marker event.
 */
export interface MatchKickoffStepEvent {
  /** Discriminant for kickoff. */
  readonly type: "kickoff";
  /** Kickoff marker minute. */
  readonly minute: 0;
}

/**
 * Aggregate shot outcome event.
 */
export interface MatchShotOutcomeStepEvent {
  /** Discriminant for the shot outcome. */
  readonly type: "shot_outcome";
  /** Simulated minute of the shot outcome. */
  readonly minute: number;
  /** Team that produced the opportunity. */
  readonly side: MatchSide;
  /** Final aggregate shot outcome. */
  readonly outcome: OccasionOutcome;
  /** Normalized opportunity quality in the `[0, 1]` range. */
  readonly quality: number;
  /** Whether the shot counted as on target. */
  readonly isShotOnTarget: boolean;
}

/**
 * Half-time marker event.
 */
export interface MatchHalfTimeStepEvent {
  /** Discriminant for half time. */
  readonly type: "half_time";
  /** Simulated minute of the half-time marker. */
  readonly minute: number;
  /** Score at half time. */
  readonly score: MatchScore;
}

/**
 * Full-time marker event.
 */
export interface MatchFullTimeStepEvent {
  /** Discriminant for full time. */
  readonly type: "full_time";
  /** Simulated final minute. */
  readonly minute: number;
  /** Score at full time. */
  readonly score: MatchScore;
}

/**
 * Input for one match step.
 */
export interface StepMatchInput {
  /** Match-local simulation state before the step. */
  readonly simulation: MatchSimulationState;
  /** Mutable local match RNG stream. */
  readonly rng: Rng;
  /** Optional resolver, mainly for tests and future resolver swaps. */
  readonly occasionResolver?: OccasionResolver;
}

/**
 * Result of one match step.
 */
export interface StepMatchResult {
  /** Next match-local simulation state. */
  readonly simulation: MatchSimulationState;
  /** Same RNG stream after deterministic consumption. */
  readonly rng: Rng;
  /** Sparse events emitted during this step. */
  readonly events: readonly MatchStepEvent[];
  /** Whether the returned simulation has reached full time. */
  readonly isComplete: boolean;
  /** Deterministic home/away processing order used for this minute. */
  readonly processedSides: readonly [MatchSide, MatchSide];
}

/**
 * Advances a match simulation by exactly one minute unless already complete.
 *
 * @example
 * const result = stepMatch({ simulation, rng });
 */
export function stepMatch(input: StepMatchInput): StepMatchResult {
  const resolver = input.occasionResolver ?? DEFAULT_OCCASION_RESOLVER;

  if (isMatchSimulationComplete(input.simulation)) {
    return {
      simulation: input.simulation,
      rng: input.rng,
      events: [],
      isComplete: true,
      processedSides: ["home", "away"],
    };
  }

  const currentMinute = input.simulation.minute + 1;
  const processedSides = deriveProcessingOrder(input.rng);
  const events: MatchStepEvent[] = [];
  let nextScore = input.simulation.score;
  let nextStats = input.simulation.stats;

  if (!input.simulation.local.hasKickedOff) {
    events.push({ type: "kickoff", minute: 0 });
  }

  for (const attackingSide of processedSides) {
    const defendingSide = otherSide(attackingSide);
    if (!shouldGenerateOpportunity(input.simulation, attackingSide, defendingSide, input.rng)) {
      continue;
    }

    const resolution = resolver.resolveOccasion(
      {
        simulation: input.simulation,
        attackingSide,
        defendingSide,
        minute: currentMinute,
      },
      input.rng,
    );

    nextStats = applyOccasionToStats(nextStats, attackingSide, resolution);
    if (resolution.outcome === "goal") {
      nextScore = applyGoalToScore(nextScore, attackingSide);
    }

    events.push({
      type: "shot_outcome",
      minute: currentMinute,
      side: attackingSide,
      outcome: resolution.outcome,
      quality: resolution.quality,
      isShotOnTarget: resolution.isShotOnTarget,
    });
  }

  const isComplete = currentMinute >= input.simulation.context.engineConfig.minuteCount;
  const halfTimeMinute = Math.floor(input.simulation.context.engineConfig.minuteCount / 2);
  const reachesHalfTime = currentMinute === halfTimeMinute && !input.simulation.local.hasReachedHalfTime;

  if (reachesHalfTime) {
    events.push({
      type: "half_time",
      minute: currentMinute,
      score: nextScore,
    });
  }

  if (isComplete && !input.simulation.local.hasReachedFullTime) {
    events.push({
      type: "full_time",
      minute: currentMinute,
      score: nextScore,
    });
  }

  const nextSimulation: MatchSimulationState = {
    context: input.simulation.context,
    minute: currentMinute,
    score: nextScore,
    stats: nextStats,
    local: {
      hasKickedOff: true,
      hasReachedHalfTime: input.simulation.local.hasReachedHalfTime || reachesHalfTime,
      hasReachedFullTime: input.simulation.local.hasReachedFullTime || isComplete,
    },
  };

  return {
    simulation: nextSimulation,
    rng: input.rng,
    events,
    isComplete,
    processedSides,
  };
}

/**
 * Randomizes the side processing order for one minute.
 */
function deriveProcessingOrder(rng: Rng): readonly [MatchSide, MatchSide] {
  return rng.nextInt(0, 2) === 0 ? ["home", "away"] : ["away", "home"];
}

/**
 * Decides whether a side generates one opportunity this minute.
 */
function shouldGenerateOpportunity(
  simulation: MatchSimulationState,
  attackingSide: MatchSide,
  defendingSide: MatchSide,
  rng: Rng,
): boolean {
  const rate = deriveOpportunityRate(simulation, attackingSide, defendingSide);
  return rng.nextFloat() < rate;
}

/**
 * Derives a bounded per-minute Bernoulli opportunity rate from team strengths.
 */
function deriveOpportunityRate(
  simulation: MatchSimulationState,
  attackingSide: MatchSide,
  defendingSide: MatchSide,
): number {
  const attackingTeam = teamBySide(simulation, attackingSide);
  const defendingTeam = teamBySide(simulation, defendingSide);
  const homeFactor = attackingSide === "home" ? simulation.context.engineConfig.homeAdvantageFactor : 1;
  const attackingPressure = (attackingTeam.strength.attack * 0.65 + attackingTeam.strength.midfield * 0.35) * homeFactor;
  const defensiveResistance = defendingTeam.strength.defense * 0.65 + defendingTeam.strength.midfield * 0.25 + defendingTeam.strength.goalkeeper * 0.1;
  const strengthModifier = clamp((attackingPressure - defensiveResistance) / 50, -0.6, 1.5);
  const baseRate = simulation.context.engineConfig.rates.baseOpportunityRatePerMinute;
  const rate = baseRate * (1 + strengthModifier);

  return clamp(rate, 0, simulation.context.engineConfig.rates.maxOpportunityRatePerMinute);
}

/**
 * Applies one resolved opportunity to accumulated stats.
 */
function applyOccasionToStats(
  stats: MatchSimulationStats,
  side: MatchSide,
  resolution: OccasionResolution,
): MatchSimulationStats {
  const current = stats[side];
  const nextSideStats: MatchSideStats = {
    opportunities: current.opportunities + 1,
    shots: current.shots + 1,
    shotsOnTarget: current.shotsOnTarget + (resolution.isShotOnTarget ? 1 : 0),
    goals: current.goals + (resolution.outcome === "goal" ? 1 : 0),
  };

  return side === "home"
    ? {
        home: nextSideStats,
        away: stats.away,
      }
    : {
        home: stats.home,
        away: nextSideStats,
      };
}

/**
 * Applies one goal to the score.
 */
function applyGoalToScore(score: MatchScore, side: MatchSide): MatchScore {
  return side === "home"
    ? {
        home: score.home + 1,
        away: score.away,
      }
    : {
        home: score.home,
        away: score.away + 1,
      };
}

/**
 * Returns the opposite match side.
 */
function otherSide(side: MatchSide): MatchSide {
  return side === "home" ? "away" : "home";
}

/**
 * Reads one team context by explicit side.
 */
function teamBySide(simulation: MatchSimulationState, side: MatchSide): MatchTeamContext {
  return side === "home" ? simulation.context.home : simulation.context.away;
}

/**
 * Clamps a number into an inclusive range.
 */
function clamp(value: number, minInclusive: number, maxInclusive: number): number {
  return Math.min(maxInclusive, Math.max(minInclusive, value));
}

/** Default aggregate resolver used until duel resolution becomes an active step. */
const DEFAULT_OCCASION_RESOLVER = new AggregateOccasionResolver();
