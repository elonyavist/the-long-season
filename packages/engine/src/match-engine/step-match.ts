import {
  TACTICAL_ROUTES,
  type FixtureId,
  type FoulMatchEvent,
  type InjuryMatchEvent,
  type MatchEventSide,
  type PlayerId,
  type ShotChanceType,
  type ShotType,
  type SubstitutionMatchEvent,
  type TacticalRoute,
} from "@game/domain";
import { deriveRng, type Rng } from "@game/shared";

import { AggregateOccasionResolver } from "./aggregate-occasion-resolver.ts";
import {
  deriveOpportunityRoutePlan,
  EVEN_CONTEST_ROUTE_CAPACITY,
  OPPORTUNITY_ROUTE_CHANCE_TYPE,
  selectOpportunityRoute,
  type OpportunityRoutePlan,
} from "./opportunity-route.ts";
import { selectChanceActors, type ChanceActors } from "./chance-actors.ts";
import { progressOnPitchCondition } from "./match-condition.ts";
import { accumulateControlUnits, deriveMatchMinuteControl } from "./match-control.ts";
import {
  resolveMatchMinuteDiscipline,
  type MatchDisciplineEvent,
  type MatchPenaltyResolution,
} from "./match-discipline.ts";
import { injuryForcesExit, resolveMatchMinuteInjury } from "./match-injury.ts";
import type { MatchContext, MatchTeamContext } from "./match-context.ts";
import { removeForcedOffPlayerFromMatchContext } from "./match-team-exit.ts";
import {
  isMatchSimulationComplete,
  telemetryFor,
  type MatchCausalSideStats,
  type MatchScore,
  type MatchSide,
  type MatchSideStats,
  type MatchSimulationState,
  type MatchSimulationStats,
  type MatchSimulationTelemetry,
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
  | MatchDisciplineEvent
  | InjuryMatchEvent
  | SubstitutionMatchEvent
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
  const routePlans = {
    home: routePlanFor(input.simulation, "home"),
    away: routePlanFor(input.simulation, "away"),
  } as const;
  const events: MatchStepEvent[] = [];
  let nextScore = input.simulation.score;
  let nextStats = input.simulation.stats;
  let nextTelemetry = telemetryFor(input.simulation);
  let nextContext = input.simulation.context;
  const minuteControl = deriveMatchMinuteControl(input.simulation, nextTelemetry);
  nextTelemetry = {
    ...nextTelemetry,
    controlUnits: accumulateControlUnits(nextTelemetry.controlUnits, minuteControl),
  };

  if (!input.simulation.local.hasKickedOff) {
    events.push({ type: "kickoff", minute: 0 });
  }

  for (const attackingSide of processedSides) {
    const defendingSide = otherSide(attackingSide);
    if (
      !shouldGenerateOpportunity(
        input.simulation,
        routePlans[attackingSide],
        minuteControl.chanceCreationMultiplier[attackingSide],
        input.rng,
      )
    ) {
      continue;
    }

    const route = selectOpportunityRoute(
      routePlans[attackingSide],
      deriveRng(
        input.simulation.context.seed,
        OPPORTUNITY_ROUTE_STREAM,
        input.simulation.context.fixtureId,
        currentMinute,
        attackingSide,
        input.simulation.score.home,
        input.simulation.score.away,
      ),
    );

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
    nextTelemetry = applyOccasionToTelemetry(nextTelemetry, attackingSide, resolution);
    const scoreBeforeGoal = nextScore;
    const shotContext = deriveShotContext(route, resolution.quality);
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

  const foulEvents: FoulMatchEvent[] = [];
  for (const defendingSide of processedSides) {
    const discipline = resolveMatchMinuteDiscipline(
      { ...input.simulation, context: nextContext },
      nextTelemetry,
      currentMinute,
      defendingSide,
    );
    events.push(...discipline.events);
    foulEvents.push(...discipline.events.filter((event): event is FoulMatchEvent => event.type === "foul"));
    nextTelemetry = applyDisciplineToTelemetry(nextTelemetry, discipline.events);
    if (discipline.dismissedPlayerId !== undefined) {
      nextContext = removeForcedOffPlayerFromMatchContext(nextContext, defendingSide, discipline.dismissedPlayerId);
    }
    if (discipline.penalty !== undefined) {
      const penaltyApplied = applyPenaltyResolution(
        nextScore,
        nextStats,
        nextTelemetry,
        discipline.penalty,
        currentMinute,
      );
      nextScore = penaltyApplied.score;
      nextStats = penaltyApplied.stats;
      nextTelemetry = penaltyApplied.telemetry;
      if (penaltyApplied.goalEvent !== undefined) events.push(penaltyApplied.goalEvent);
    }
  }

  for (const side of processedSides) {
    const injury = resolveMatchMinuteInjury(
      { ...input.simulation, context: nextContext },
      nextTelemetry,
      currentMinute,
      side,
      foulEvents.filter((foul) => oppositeEventSide(foul.side) === side),
    );
    if (injury === undefined) continue;
    events.push(injury);
    nextTelemetry = {
      ...nextTelemetry,
      injuriesByPlayer: {
        ...nextTelemetry.injuriesByPlayer,
        [injury.playerId]: { severity: injury.severity, continued: !injuryForcesExit(injury.severity) },
      },
    };
    if (injuryForcesExit(injury.severity)) {
      nextContext = removeForcedOffPlayerFromMatchContext(nextContext, side, injury.playerId);
    }
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

  nextTelemetry = {
    ...nextTelemetry,
    playerCondition: progressOnPitchCondition(input.simulation, nextTelemetry),
  };

  const nextSimulation: MatchSimulationState = {
    context: nextContext,
    minute: currentMinute,
    score: nextScore,
    stats: {
      ...nextStats,
      telemetry: nextTelemetry,
    },
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
 * Builds one side's route plan for the minute about to be simulated.
 *
 * Both plans are built once per minute, before either side is processed, so the
 * randomized home/away processing order cannot change what either side intends
 * to do. Order decides who resolves first, never who plans against what.
 */
function routePlanFor(simulation: MatchSimulationState, side: MatchSide): OpportunityRoutePlan {
  const own = teamBySide(simulation, side);
  const opponent = teamBySide(simulation, otherSide(side));

  return deriveOpportunityRoutePlan({
    own: own.shape,
    opponent: opponent.shape,
    ownTactics: own.tacticalDistribution,
    opponentTactics: opponent.tacticalDistribution,
    caps: simulation.context.engineConfig.tacticalDistributionCaps,
    calibration: simulation.context.matchTacticsCalibration,
    goalDifference: goalDifferenceFor(simulation.score, side),
  });
}

/** Goals scored minus goals conceded, from one side's point of view. */
function goalDifferenceFor(score: MatchScore, side: MatchSide): number {
  return side === "home" ? score.home - score.away : score.away - score.home;
}

/**
 * Decides whether a side generates one opportunity this minute.
 */
function shouldGenerateOpportunity(
  simulation: MatchSimulationState,
  plan: OpportunityRoutePlan,
  controlMultiplier: number,
  rng: Rng,
): boolean {
  return rng.nextFloat() < deriveOpportunityRate(simulation, plan, controlMultiplier);
}

/**
 * Derives a bounded per-minute opportunity rate from the side's route plan.
 *
 * Volume used to come from a strength difference, which is why two elevens of
 * equal players produced the same match whatever shape they took. It now comes
 * from what the shapes can actually do to each other: `bestRouteCapacity` is
 * the side's most promising way through, and the plan's own multiplier carries
 * the tactic and commitment decisions.
 *
 * Player quality has not stopped mattering - it is inside every capacity,
 * because capacities are built from per-slot quality - it has stopped being the
 * *only* thing that matters.
 */
function deriveOpportunityRate(
  simulation: MatchSimulationState,
  plan: OpportunityRoutePlan,
  controlMultiplier: number,
): number {
  const rates = simulation.context.engineConfig.rates;
  const bestRouteCapacity = Math.max(
    ...TACTICAL_ROUTES.map((route) => plan.capacityByRoute[route]),
  );
  const routePressure = 1 + (bestRouteCapacity - EVEN_CONTEST_ROUTE_CAPACITY) * ROUTE_CAPACITY_SEPARATION;
  const rate = rates.baseOpportunityRatePerMinute * routePressure * plan.volumeMultiplier * controlMultiplier;

  return clamp(rate, 0, rates.maxOpportunityRatePerMinute);
}

/** Adds one shot's causal facts to live telemetry exactly once. */
function applyOccasionToTelemetry(
  telemetry: MatchSimulationTelemetry,
  attackingSide: MatchSide,
  resolution: OccasionResolution,
): MatchSimulationTelemetry {
  const defendingSide = otherSide(attackingSide);
  const attackingStats = telemetry.stats[attackingSide];
  const defendingStats = telemetry.stats[defendingSide];
  const nextAttackingStats: MatchCausalSideStats = {
    ...attackingStats,
    shots: attackingStats.shots + 1,
    shotsOnTarget: attackingStats.shotsOnTarget + (resolution.isShotOnTarget ? 1 : 0),
    expectedGoals: attackingStats.expectedGoals + resolution.expectedGoals,
    corners: attackingStats.corners + (resolution.resultsInCorner ? 1 : 0),
    goals: attackingStats.goals + (resolution.outcome === "goal" ? 1 : 0),
  };
  const nextDefendingStats: MatchCausalSideStats = {
    ...defendingStats,
    saves: defendingStats.saves + (resolution.outcome === "save" ? 1 : 0),
  };

  return {
    ...telemetry,
    stats:
      attackingSide === "home"
        ? { home: nextAttackingStats, away: nextDefendingStats }
        : { home: nextDefendingStats, away: nextAttackingStats },
  };
}

/**
 * How hard route capacity moves chance volume.
 *
 * Owned here rather than in content because it is the unit conversion between
 * a bounded share and a per-minute rate, not a football judgement. What the
 * shapes do to each other is content's; how a share becomes a rate is the
 * engine's.
 */
const ROUTE_CAPACITY_SEPARATION = 1.6;

/** Stable RNG stream for choosing which route a side takes this minute. */
const OPPORTUNITY_ROUTE_STREAM = "opportunity-route";

const PENALTY_EXPECTED_GOALS = 0.76;

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

function applyDisciplineToTelemetry(
  telemetry: MatchSimulationTelemetry,
  events: readonly MatchDisciplineEvent[],
): MatchSimulationTelemetry {
  let next = telemetry;
  for (const event of events) {
    if (event.type === "foul") {
      next = withCausalSideStat(next, event.side, "fouls");
    } else if (event.type === "yellow_card") {
      next = {
        ...withCausalSideStat(next, event.side, "yellowCards"),
        yellowCardsByPlayer: {
          ...next.yellowCardsByPlayer,
          [event.playerId]: (next.yellowCardsByPlayer[event.playerId] ?? 0) + 1,
        },
      };
    } else if (event.type === "second_yellow_card" || event.type === "red_card") {
      next = withCausalSideStat(next, event.side, "redCards");
    }
  }
  return next;
}

function withCausalSideStat(
  telemetry: MatchSimulationTelemetry,
  side: MatchEventSide,
  key: "fouls" | "yellowCards" | "redCards",
): MatchSimulationTelemetry {
  const current = telemetry.stats[side];
  const updated = { ...current, [key]: current[key] + 1 };
  return {
    ...telemetry,
    stats: side === "home"
      ? { home: updated, away: telemetry.stats.away }
      : { home: telemetry.stats.home, away: updated },
  };
}

function applyPenaltyResolution(
  score: MatchScore,
  stats: MatchSimulationStats,
  telemetry: MatchSimulationTelemetry,
  penalty: MatchPenaltyResolution,
  minute: number,
): {
  readonly score: MatchScore;
  readonly stats: MatchSimulationStats;
  readonly telemetry: MatchSimulationTelemetry;
  readonly goalEvent?: MatchGoalStepEvent;
} {
  const isScored = penalty.outcome === "scored";
  const isSaved = penalty.outcome === "saved";
  const resolution: OccasionResolution = {
    outcome: isScored ? "goal" : isSaved ? "save" : "miss",
    quality: PENALTY_EXPECTED_GOALS,
    expectedGoals: PENALTY_EXPECTED_GOALS,
    isShotOnTarget: isScored || isSaved,
    resultsInCorner: false,
  };
  const nextStats = applyOccasionToStats(stats, penalty.side, resolution);
  const nextTelemetry = applyOccasionToTelemetry(telemetry, penalty.side, resolution);
  if (!isScored) return { score, stats: nextStats, telemetry: nextTelemetry };

  return {
    score: applyGoalToScore(score, penalty.side),
    stats: nextStats,
    telemetry: nextTelemetry,
    goalEvent: {
      type: "shot_outcome",
      minute,
      side: penalty.side,
      outcome: "goal",
      quality: PENALTY_EXPECTED_GOALS,
      isShotOnTarget: true,
      shotType: "set_piece",
      chanceType: "dead_ball",
      scorerPlayerId: penalty.takerPlayerId,
    },
  };
}

function oppositeEventSide(side: MatchEventSide): MatchEventSide {
  return side === "home" ? "away" : "home";
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
 * Derives structured shot context from the route the chance actually came down.
 *
 * The chance type is now a fact about the attack rather than an inference from
 * a minute number: a cross happened because the ball went down a flank. Only
 * the execution type still reads quality, because whether a cross is met with a
 * head depends on how good the delivery was.
 */
function deriveShotContext(
  route: TacticalRoute,
  quality: number,
): { readonly shotType: ShotType; readonly chanceType: ShotChanceType } {
  const chanceType = OPPORTUNITY_ROUTE_CHANCE_TYPE[route];

  return {
    shotType: deriveShotType(chanceType, quality),
    chanceType,
  };
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
