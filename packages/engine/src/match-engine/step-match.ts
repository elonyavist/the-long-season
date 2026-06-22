import type { FixtureId, PlayerId, ShotChanceType, ShotType } from "@game/domain";
import { deriveRng, type Rng } from "@game/shared";

import { AggregateOccasionResolver } from "./aggregate-occasion-resolver.ts";
import { selectChanceActors, type ChanceActors } from "./chance-actors.ts";
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
 * This is an engine-local event shape for the minute loop. Durable domain
 * `MatchEvent` values are created later by mapping full match results through
 * `createMatchReport`.
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
export type MatchShotOutcomeStepEvent = MatchGoalStepEvent | MatchNonGoalShotOutcomeStepEvent;

/**
 * Goal outcome event with the engine-local scorer attribution.
 */
export interface MatchGoalStepEvent {
  /** Discriminant for the shot outcome. */
  readonly type: "shot_outcome";
  /** Simulated minute of the shot outcome. */
  readonly minute: number;
  /** Team that produced the opportunity. */
  readonly side: MatchSide;
  /** Goal outcome discriminant. */
  readonly outcome: "goal";
  /** Normalized opportunity quality in the `[0, 1]` range. */
  readonly quality: number;
  /** Whether the shot counted as on target. */
  readonly isShotOnTarget: boolean;
  /** Structured execution type for the shot. */
  readonly shotType: ShotType;
  /** Structured source type for the chance. */
  readonly chanceType: ShotChanceType;
  /** Player from the scoring side lineup credited with the goal. */
  readonly scorerPlayerId: PlayerId;
  /** Player from the scoring side lineup credited with the assist, when any. */
  readonly assistPlayerId?: PlayerId;
  /** Selected chance creator when not already represented by the assist or scorer. */
  readonly creatorPlayerId?: PlayerId;
}

/**
 * Non-goal aggregate shot outcome event.
 */
export interface MatchNonGoalShotOutcomeStepEvent {
  /** Discriminant for the shot outcome. */
  readonly type: "shot_outcome";
  /** Simulated minute of the shot outcome. */
  readonly minute: number;
  /** Team that produced the opportunity. */
  readonly side: MatchSide;
  /** Final aggregate non-goal shot outcome. */
  readonly outcome: Exclude<OccasionOutcome, "goal">;
  /** Normalized opportunity quality in the `[0, 1]` range. */
  readonly quality: number;
  /** Whether the shot counted as on target. */
  readonly isShotOnTarget: boolean;
  /** Structured execution type for the shot. */
  readonly shotType: ShotType;
  /** Structured source type for the chance. */
  readonly chanceType: ShotChanceType;
  /** Player from the attacking side lineup credited with taking this shot. */
  readonly shooterPlayerId: PlayerId;
  /** Defending goalkeeper credited with the save, only for save outcomes. */
  readonly goalkeeperPlayerId?: PlayerId;
  /** Defending outfield player credited as the primary blocker, only for block outcomes. */
  readonly primaryDefenderPlayerId?: PlayerId;
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
    const scoreBeforeGoal = nextScore;
    const shotContext = deriveShotContext(input.simulation, currentMinute, attackingSide, resolution.quality);
    const chanceActors = selectChanceActors({
      seed: input.simulation.context.seed,
      fixtureId: input.simulation.context.fixtureId,
      minute: currentMinute,
      attackingSide,
      scoreBeforeChance: scoreBeforeGoal,
      attackingTeam: teamBySide(input.simulation, attackingSide),
      defendingTeam: teamBySide(input.simulation, defendingSide),
      shotType: shotContext.shotType,
      chanceType: shotContext.chanceType,
    });
    let scorerPlayerId: PlayerId | undefined;
    let assistPlayerId: PlayerId | undefined;
    let creatorPlayerId: PlayerId | undefined;
    let shooterPlayerId: PlayerId | undefined;
    let goalkeeperPlayerId: PlayerId | undefined;
    let primaryDefenderPlayerId: PlayerId | undefined;

    if (resolution.outcome === "goal") {
      scorerPlayerId = chanceActors.shooterPlayerId;
      assistPlayerId = selectAssistFromChanceActors({
        seed: input.simulation.context.seed,
        fixtureId: input.simulation.context.fixtureId,
        minute: currentMinute,
        attackingSide,
        scoreBeforeChance: scoreBeforeGoal,
        actors: chanceActors,
        shotType: shotContext.shotType,
        chanceType: shotContext.chanceType,
      });
      creatorPlayerId = selectDurableGoalCreator(chanceActors, assistPlayerId);
      nextScore = applyGoalToScore(nextScore, attackingSide);
    } else {
      shooterPlayerId = chanceActors.shooterPlayerId;
    }

    if (resolution.outcome === "save") {
      goalkeeperPlayerId = chanceActors.goalkeeperPlayerId;
    }

    if (resolution.outcome === "block") {
      primaryDefenderPlayerId = chanceActors.primaryDefenderPlayerId;
    }

    events.push(
      createShotOutcomeEvent(
        currentMinute,
        attackingSide,
        resolution,
        shotContext,
        scorerPlayerId,
        assistPlayerId,
        creatorPlayerId,
        shooterPlayerId,
        goalkeeperPlayerId,
        primaryDefenderPlayerId,
      ),
    );
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
  const strengthModifier = clamp(
    (attackingPressure - defensiveResistance) / OPPORTUNITY_STRENGTH_SEPARATION_DIVISOR,
    -0.6,
    1.5,
  );
  const baseRate = simulation.context.engineConfig.rates.baseOpportunityRatePerMinute;
  const rate = baseRate * (1 + strengthModifier);

  return clamp(rate, 0, simulation.context.engineConfig.rates.maxOpportunityRatePerMinute);
}

/**
 * Converts aggregate team-strength delta into chance-volume separation.
 *
 * Lower-division player ratings sit in a compact range, so using a very large
 * divisor makes strong and weak teams generate nearly the same number of
 * chances. This value increases result separation without touching configured
 * shot-to-goal conversion probabilities.
 */
const OPPORTUNITY_STRENGTH_SEPARATION_DIVISOR = 16;

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
 * Builds a typed shot-outcome event from one aggregate resolution.
 */
function createShotOutcomeEvent(
  minute: number,
  side: MatchSide,
  resolution: OccasionResolution,
  shotContext: { readonly shotType: ShotType; readonly chanceType: ShotChanceType },
  scorerPlayerId: PlayerId | undefined,
  assistPlayerId: PlayerId | undefined,
  creatorPlayerId: PlayerId | undefined,
  shooterPlayerId: PlayerId | undefined,
  goalkeeperPlayerId: PlayerId | undefined,
  primaryDefenderPlayerId: PlayerId | undefined,
): MatchShotOutcomeStepEvent {
  if (resolution.outcome === "goal") {
    if (scorerPlayerId === undefined) {
      throw new Error("Goal step event requires scorerPlayerId");
    }

    return {
      type: "shot_outcome",
      minute,
      side,
      outcome: "goal",
      quality: resolution.quality,
      isShotOnTarget: resolution.isShotOnTarget,
      shotType: shotContext.shotType,
      chanceType: shotContext.chanceType,
      scorerPlayerId,
      ...(assistPlayerId === undefined ? {} : { assistPlayerId }),
      ...(creatorPlayerId === undefined ? {} : { creatorPlayerId }),
    };
  }

  if (shooterPlayerId === undefined) {
    throw new Error("Non-goal shot step event requires shooterPlayerId");
  }

  return {
    type: "shot_outcome",
    minute,
    side,
    outcome: resolution.outcome,
    quality: resolution.quality,
    isShotOnTarget: resolution.isShotOnTarget,
    shotType: shotContext.shotType,
    chanceType: shotContext.chanceType,
    shooterPlayerId,
    ...(goalkeeperPlayerId === undefined ? {} : { goalkeeperPlayerId }),
    ...(primaryDefenderPlayerId === undefined ? {} : { primaryDefenderPlayerId }),
  };
}

/**
 * Input needed to decide whether the selected creator receives assist credit.
 */
interface SelectAssistFromChanceActorsInput {
  /** Run seed used by the match context. */
  readonly seed: string;
  /** Stable fixture identifier for the match. */
  readonly fixtureId: FixtureId;
  /** Simulated minute of the chance. */
  readonly minute: number;
  /** Side that produced the chance. */
  readonly attackingSide: MatchSide;
  /** Score before resolving this chance. */
  readonly scoreBeforeChance: MatchScore;
  /** Coherent opportunity actors selected for this chance. */
  readonly actors: ChanceActors;
  /** Structured execution type for the shot. */
  readonly shotType: ShotType;
  /** Structured source type for the chance. */
  readonly chanceType: ShotChanceType;
}

/** Stable RNG stream name used only for optional selected-creator assist credit. */
const CHANCE_ACTOR_ASSIST_STREAM = "chance-actor-assist";

/**
 * Credits the selected creator as assister when the chance is assist-eligible.
 */
function selectAssistFromChanceActors(input: SelectAssistFromChanceActorsInput): PlayerId | undefined {
  if (input.actors.creatorPlayerId === input.actors.shooterPlayerId) {
    return undefined;
  }

  const rng = deriveRng(
    input.seed,
    CHANCE_ACTOR_ASSIST_STREAM,
    input.fixtureId,
    input.minute,
    input.attackingSide,
    input.scoreBeforeChance.home,
    input.scoreBeforeChance.away,
    input.actors.creatorPlayerId,
    input.actors.shooterPlayerId,
    input.shotType,
    input.chanceType,
  );

  return rng.nextFloat() < assistProbabilityForShot(input.shotType, input.chanceType)
    ? input.actors.creatorPlayerId
    : undefined;
}

/**
 * Keeps only creator context that adds durable information beyond scorer/assist.
 */
function selectDurableGoalCreator(actors: ChanceActors, assistPlayerId: PlayerId | undefined): PlayerId | undefined {
  if (actors.creatorPlayerId === actors.shooterPlayerId) {
    return undefined;
  }

  if (assistPlayerId === actors.creatorPlayerId) {
    return undefined;
  }

  return actors.creatorPlayerId;
}

/**
 * Derives the probability that a goal credits the selected creator as assister.
 */
function assistProbabilityForShot(shotType: ShotType, chanceType: ShotChanceType): number {
  if (chanceType === "dead_ball" || shotType === "set_piece") {
    return 0.25;
  }

  if (chanceType === "cross" && shotType === "header") {
    return 0.85;
  }

  if (chanceType === "cross") {
    return 0.75;
  }

  if (chanceType === "counter") {
    return 0.6;
  }

  return 0.5;
}

/**
 * Derives stable structured shot context from existing aggregate match inputs.
 */
function deriveShotContext(
  simulation: MatchSimulationState,
  minute: number,
  side: MatchSide,
  quality: number,
): { readonly shotType: ShotType; readonly chanceType: ShotChanceType } {
  const chanceType = deriveChanceType(simulation, minute, side, quality);

  return {
    shotType: deriveShotType(chanceType, quality),
    chanceType,
  };
}

/**
 * Derives a stable chance type from existing aggregate match inputs.
 */
function deriveChanceType(
  simulation: MatchSimulationState,
  minute: number,
  side: MatchSide,
  quality: number,
): ShotChanceType {
  const team = teamBySide(simulation, side);
  const texture = deterministicShotTexture(minute, side, quality);

  if (team.tacticalDistribution.width > 0.25 && texture % 3 === 0) {
    return "cross";
  }

  if ((team.tacticalDistribution.directness > 0.35 || team.tacticalDistribution.risk > 0.35) && texture % 2 === 0) {
    return "counter";
  }

  return "open_play";
}

/**
 * Derives a stable shot type from the structured chance type.
 */
function deriveShotType(chanceType: ShotChanceType, quality: number): ShotType {
  if (chanceType === "cross" && quality >= 0.45) {
    return "header";
  }

  return "normal";
}

/**
 * Produces deterministic non-RNG texture for event context labels.
 */
function deterministicShotTexture(minute: number, side: MatchSide, quality: number): number {
  const sideOffset = side === "home" ? 7 : 13;
  return (minute * 31 + Math.floor(quality * 1_000) + sideOffset) % 6;
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
