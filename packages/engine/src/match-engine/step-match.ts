import {
  type FoulMatchEvent,
  type InjuryMatchEvent,
  type LateralFocus,
  type MatchEventSide,
  type PlayerId,
  type ShotChanceType,
  type ShotDeadBallKind,
  type ShotType,
  type SubstitutionMatchEvent,
  type TacticalRoute,
} from "@game/domain";
import { deriveRng, type Rng } from "@game/shared";

import { AggregateOccasionResolver } from "./aggregate-occasion-resolver.ts";
import {
  deriveOpportunityRoutePlan,
  expectedRouteSaturation,
  opportunityRouteQualityEdge,
  selectOpportunityRoute,
  type OpportunityRoutePlan,
} from "./opportunity-route.ts";
import { buildOccasionContext, type OccasionContext } from "./occasion-context.ts";
import { progressOnPitchCondition } from "./match-condition.ts";
import { accumulateControlUnits, deriveMatchMinuteControl } from "./match-control.ts";
import {
  resolveMatchMinuteDiscipline,
  type MatchDisciplineEvent,
  type MatchDirectFreeKickResolution,
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
  /** Exact restart for a dead-ball shot. */
  readonly deadBallKind?: ShotDeadBallKind;
  /** The way through the chance came down. Absent for a penalty, which had none. */
  readonly route?: TacticalRoute;
  /** Exact creator selected before resolution; absent only for penalties. */
  readonly selectedCreatorPlayerId?: PlayerId;
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
  /** Exact restart for a dead-ball shot. */
  readonly deadBallKind?: ShotDeadBallKind;
  /**
   * The way through the chance came down.
   *
   * Optional for the same two reasons the durable `ShotContext` field is, and
   * this type mirrors that one exactly rather than claiming a stronger promise
   * than its producers can keep. `stepMatch` is not the only one: the web
   * rebuilds step events out of persisted reports to score player ratings, and a
   * report written before match-event schema `8` carries no route at all.
   *
   * Every shot this minute loop emits does have one - a scored penalty is the
   * only shot outcome that skips the route model, and it is a goal - but that is
   * a fact about the loop, asserted in `step-match.test.ts`, not something the
   * shared vocabulary can state on behalf of every producer.
   */
  readonly route?: TacticalRoute;
  /** Exact creator selected before resolution; never persisted to the durable report. */
  readonly selectedCreatorPlayerId?: PlayerId;
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
  /** Complete lateral instruction pair used by both plans this minute. */
  readonly lateralFocusBySide?: MatchLateralFocusBySide;
  /** Optional resolver, mainly for tests and future resolver swaps. */
  readonly occasionResolver?: OccasionResolver;
}

/** One explicit lateral instruction for each side of the same match. */
export interface MatchLateralFocusBySide {
  readonly home: LateralFocus;
  readonly away: LateralFocus;
}

/** Current product behaviour until durable preparation lands in Step 14. */
export const BALANCED_MATCH_LATERAL_FOCUS_BY_SIDE = {
  home: "balanced",
  away: "balanced",
} as const satisfies MatchLateralFocusBySide;

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
  const lateralFocusBySide = input.lateralFocusBySide
    ?? BALANCED_MATCH_LATERAL_FOCUS_BY_SIDE;
  const routePlans = {
    home: routePlanFor(input.simulation, "home", lateralFocusBySide),
    away: routePlanFor(input.simulation, "away", lateralFocusBySide),
  } as const;
  const events: MatchStepEvent[] = [];
  let nextScore = input.simulation.score;
  let nextStats = input.simulation.stats;
  let nextTelemetry = telemetryFor(input.simulation);
  let nextContext = input.simulation.context;
  const minuteControl = deriveMatchMinuteControl(input.simulation, nextTelemetry, routePlans);
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
        routePlans[defendingSide],
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

    // Everything about this chance that is true before it is resolved: the way
    // through, the four players on it, and how far each of them tilts the one
    // question he is asked. Building it here rather than after the outcome is
    // the whole of Step 07: a striker cannot make a goal more likely if he is
    // chosen once the engine has already decided there was one.
    const occasion = buildOccasionContext({
      simulation: input.simulation,
      attackingSide,
      defendingSide,
      minute: currentMinute,
      route,
      routeQualityEdge: opportunityRouteQualityEdge(routePlans[attackingSide], route),
      scoreBeforeOccasion: nextScore,
    });
    const resolution = resolver.resolveOccasion({ simulation: input.simulation, occasion }, input.rng);

    nextStats = applyOccasionToStats(nextStats, attackingSide, resolution);
    nextTelemetry = applyOccasionToTelemetry(nextTelemetry, attackingSide, resolution);

    if (resolution.outcome === "goal") {
      nextScore = applyGoalToScore(nextScore, attackingSide);
    }

    events.push(createShotOutcomeEvent(occasion, resolution));
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
    if (discipline.directFreeKick !== undefined) {
      const directFreeKickApplied = applyDirectFreeKickResolution(
        nextScore,
        nextStats,
        nextTelemetry,
        discipline.directFreeKick,
        currentMinute,
      );
      nextScore = directFreeKickApplied.score;
      nextStats = directFreeKickApplied.stats;
      nextTelemetry = directFreeKickApplied.telemetry;
      events.push(directFreeKickApplied.shotEvent);
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
function routePlanFor(
  simulation: MatchSimulationState,
  side: MatchSide,
  lateralFocusBySide: MatchLateralFocusBySide,
): OpportunityRoutePlan {
  const own = teamBySide(simulation, side);
  const opponent = teamBySide(simulation, otherSide(side));

  return deriveOpportunityRoutePlan({
    own: own.shape,
    opponent: opponent.shape,
    ownTactics: own.tacticalDistribution,
    opponentTactics: opponent.tacticalDistribution,
    lateralFocus: lateralFocusBySide[side],
    opponentLateralFocus: lateralFocusBySide[otherSide(side)],
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
  opponentPlan: OpportunityRoutePlan,
  controlMultiplier: number,
  rng: Rng,
): boolean {
  return rng.nextFloat() < deriveOpportunityRate(simulation, plan, opponentPlan, controlMultiplier);
}

/**
 * Derives a bounded per-minute opportunity rate from the side's route plan.
 *
 * Volume used to come from a strength difference, which is why two elevens of
 * equal players produced the same match whatever shape they took. It now comes
 * from what the shapes can actually do to each other: how much better this
 * side's real way through is than the one it is conceding.
 *
 * It is a *difference between the two plans*, not this side's capacity against
 * a constant, so two identical shapes produce exactly the base rate whatever
 * that capacity happens to be. Measured against a constant it did not: two
 * identical `4-4-2`s expect `0.4576`, so every match ran `7%` below the base
 * rate before either side had decided anything. A constant can only be right
 * for one population, and the two populations this engine is measured on -
 * department compositions and real formations - do not agree on it.
 *
 * Player quality has not stopped mattering - it is inside every capacity,
 * because capacities are built from per-slot quality - it has stopped being the
 * *only* thing that matters.
 */
function deriveOpportunityRate(
  simulation: MatchSimulationState,
  plan: OpportunityRoutePlan,
  opponentPlan: OpportunityRoutePlan,
  controlMultiplier: number,
): number {
  const rates = simulation.context.engineConfig.rates;
  const routeAdvantage = expectedRouteSaturation(plan) - expectedRouteSaturation(opponentPlan);
  const routeCapacitySeparation =
    simulation.context.matchTacticsCalibration.tacticalSemantics
      .routeCapacitySeparationBasisPoints / 10_000;
  const routePressure = 1 + routeAdvantage * routeCapacitySeparation;
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
      deadBallKind: "penalty",
      scorerPlayerId: penalty.takerPlayerId,
    },
  };
}

function applyDirectFreeKickResolution(
  score: MatchScore,
  stats: MatchSimulationStats,
  telemetry: MatchSimulationTelemetry,
  directFreeKick: MatchDirectFreeKickResolution,
  minute: number,
): {
  readonly score: MatchScore;
  readonly stats: MatchSimulationStats;
  readonly telemetry: MatchSimulationTelemetry;
  readonly shotEvent: MatchShotOutcomeStepEvent;
} {
  const isScored = directFreeKick.outcome === "scored";
  const isSaved = directFreeKick.outcome === "saved";
  const resolution: OccasionResolution = {
    outcome: isScored ? "goal" : isSaved ? "save" : "miss",
    quality: directFreeKick.expectedGoals,
    expectedGoals: directFreeKick.expectedGoals,
    isShotOnTarget: isScored || isSaved,
    resultsInCorner: false,
  };
  const nextStats = applyOccasionToStats(stats, directFreeKick.side, resolution);
  const nextTelemetry = applyOccasionToTelemetry(telemetry, directFreeKick.side, resolution);
  const common = {
    type: "shot_outcome" as const,
    minute,
    side: directFreeKick.side,
    quality: directFreeKick.expectedGoals,
    isShotOnTarget: isScored || isSaved,
    shotType: "set_piece" as const,
    chanceType: "dead_ball" as const,
    deadBallKind: "direct_free_kick" as const,
  };
  if (isScored) {
    return {
      score: applyGoalToScore(score, directFreeKick.side),
      stats: nextStats,
      telemetry: nextTelemetry,
      shotEvent: { ...common, outcome: "goal", scorerPlayerId: directFreeKick.takerPlayerId },
    };
  }
  return {
    score,
    stats: nextStats,
    telemetry: nextTelemetry,
    shotEvent: {
      ...common,
      outcome: isSaved ? "save" : "miss",
      shooterPlayerId: directFreeKick.takerPlayerId,
      ...(isSaved ? { goalkeeperPlayerId: directFreeKick.goalkeeperPlayerId } : {}),
    },
  };
}

function oppositeEventSide(side: MatchEventSide): MatchEventSide {
  return side === "home" ? "away" : "home";
}

/**
 * Projects one resolved occasion into the sparse step event for it.
 *
 * Pure projection: everything it reads was already decided, so no player is
 * chosen and no probability is drawn here. Which actors reach the event depends
 * on the outcome only because a save has a goalkeeper and a block has a blocker,
 * while a missed shot has neither.
 */
function createShotOutcomeEvent(
  occasion: OccasionContext,
  resolution: OccasionResolution,
): MatchShotOutcomeStepEvent {
  const shot = {
    minute: occasion.minute,
    side: occasion.attackingSide,
    quality: resolution.quality,
    isShotOnTarget: resolution.isShotOnTarget,
    shotType: occasion.shotType,
    chanceType: occasion.chanceType,
    route: occasion.route,
  } as const;

  if (resolution.outcome === "goal") {
    const assistPlayerId = occasion.creatorIsCreditedWithAssist ? occasion.creatorPlayerId : undefined;
    const creatorPlayerId = durableGoalCreator(occasion);

    return {
      type: "shot_outcome",
      ...shot,
      outcome: "goal",
      selectedCreatorPlayerId: occasion.creatorPlayerId,
      scorerPlayerId: occasion.shooterPlayerId,
      ...(assistPlayerId === undefined ? {} : { assistPlayerId }),
      ...(creatorPlayerId === undefined ? {} : { creatorPlayerId }),
    };
  }

  return {
    type: "shot_outcome",
    ...shot,
    outcome: resolution.outcome,
    selectedCreatorPlayerId: occasion.creatorPlayerId,
    shooterPlayerId: occasion.shooterPlayerId,
    ...(resolution.outcome === "save" ? { goalkeeperPlayerId: occasion.goalkeeperPlayerId } : {}),
    ...(resolution.outcome === "block" ? { primaryDefenderPlayerId: occasion.primaryDefenderPlayerId } : {}),
  };
}

/**
 * Keeps only creator context that adds durable information beyond scorer/assist.
 *
 * A player already named as scorer or assister is not named a third time. That
 * is the same rule the durable event contract states by making the field
 * optional, written once here rather than at each projection site.
 */
function durableGoalCreator(occasion: OccasionContext): PlayerId | undefined {
  if (occasion.creatorPlayerId === occasion.shooterPlayerId) {
    return undefined;
  }

  return occasion.creatorIsCreditedWithAssist ? undefined : occasion.creatorPlayerId;
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
