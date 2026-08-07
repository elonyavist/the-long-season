import {
  TACTICAL_ROUTES,
  type CanonicalPlayerRole,
  type ClubId,
  type FixtureId,
  type TacticMentalityKey,
  type PlayerId,
  type TacticalRoute,
  type TacticalShapeCapacity,
} from "@game/domain";

import type { MatchContext, MatchTeamContext } from "./match-context.ts";
import { deriveOpportunityRoutePlan } from "./opportunity-route.ts";
import type { MatchScore, MatchSide, MatchSimulationStats } from "./match-simulation-state.ts";
import type { MatchStepEvent } from "./step-match.ts";

/**
 * Schema version for engine-local match explanation traces.
 *
 * The trace is diagnostic data for CLI/UI inspection. Match reports and match
 * results remain authoritative for saved gameplay outcomes.
 *
 * `2` added the per-side route and shooter counts, which is what makes the
 * causal chain readable end to end: the route rows above say which way through
 * this shape *could* open, and these say which one the chances actually came
 * down and who was on the end of them.
 */
export const MATCH_EXPLANATION_TRACE_SCHEMA_VERSION = 2;

/**
 * Stable high-level factors that can shape a match result.
 *
 * These keys are intentionally language-agnostic so presentation layers can
 * localize them without hardcoded CLI/UI labels.
 */
export type MatchExplanationFactorKey =
  | "team_strength"
  | "tactic_distribution"
  | "lineup_roles"
  | "condition_impact"
  | "tactical_matchup"
  | "opportunity_context"
  | "variance";

/** Side key used by explanation traces. */
export type MatchExplanationSide = "home" | "away";

/** Broad marker for whether a factor helped, hurt, or stayed neutral. */
export type MatchExplanationEffectDirection = "positive" | "neutral" | "negative" | "unknown";

/** Diagnostic bucket for stochastic match variance. */
export type MatchExplanationVarianceMarker =
  | "low_event_volume"
  | "normal_event_volume"
  | "high_event_volume"
  | "low_conversion"
  | "normal_conversion"
  | "high_conversion";

/**
 * Numeric team-strength snapshot used by explanation rendering.
 */
export interface MatchExplanationStrengthSnapshot {
  /** Attacking department strength. */
  readonly attack: number;
  /** Midfield department strength. */
  readonly midfield: number;
  /** Defensive outfield department strength. */
  readonly defense: number;
  /** Goalkeeper department strength. */
  readonly goalkeeper: number;
  /** Overall lineup strength. */
  readonly overall: number;
}

/**
 * Tactical inputs that shaped chance style and risk.
 */
export interface MatchExplanationTacticSnapshot {
  /** Directness or route-one tendency. */
  readonly directness: number;
  /** Pressing intensity. */
  readonly pressing: number;
  /** Width tendency. */
  readonly width: number;
  /** Attacking risk tendency. */
  readonly risk: number;
  /** Commitment ladder step chosen for this match. */
  readonly mentality: TacticMentalityKey;
}

/**
 * One player slot in the lineup used for the match.
 */
export interface MatchExplanationLineupSlotSnapshot {
  /** Stable lineup slot ID. */
  readonly slotId: string;
  /** Player assigned to the slot. */
  readonly playerId: PlayerId;
  /** Canonical role the manager assigned to the slot. */
  readonly canonicalRole: CanonicalPlayerRole;
}

/**
 * Ordered lineup-role snapshot for one team.
 */
export interface MatchExplanationLineupSnapshot {
  /** Explicit lineup slots in simulation order. */
  readonly slots: readonly MatchExplanationLineupSlotSnapshot[];
}

/**
 * Dynamic-state impact summary.
 *
 * Step 04 defines the contract only. Later emission can set `tracking` to
 * `tracked` when condition multipliers are available, or `not_tracked` when the
 * match context only contains already-derived strengths.
 */
export interface MatchExplanationConditionSnapshot {
  /** Whether condition data was available when the trace was produced. */
  readonly tracking: "tracked" | "not_tracked";
  /** Direction of the observed condition impact. */
  readonly effectDirection: MatchExplanationEffectDirection;
  /** Count of players whose condition affected the computed side snapshot. */
  readonly affectedPlayerCount: number;
  /** Optional average multiplier when caller data exposes it. */
  readonly averageMultiplier?: number;
}

/**
 * Count bucket for opportunity and shot-context summaries.
 */
export interface MatchExplanationCountBucket {
  /** Stable machine key such as `counter`, `cross`, or `normal`. */
  readonly key: string;
  /** Number of matching events. */
  readonly count: number;
}

/**
 * Chance and opportunity summary for one side.
 */
export interface MatchExplanationOpportunitySideSummary {
  /** Generated opportunity count. */
  readonly opportunities: number;
  /** Total shots recorded by the side. */
  readonly shots: number;
  /** Shots on target recorded by the side. */
  readonly shotsOnTarget: number;
  /** Goals recorded by the side. */
  readonly goals: number;
  /** Blocked shots recorded by the side. */
  readonly blockedShots: number;
  /** Saves made by the opposing goalkeeper against this side. */
  readonly savedShots: number;
  /** Count of opportunity contexts by stable key. */
  readonly chanceTypeCounts: readonly MatchExplanationCountBucket[];
  /** Count of shot types by stable key. */
  readonly shotTypeCounts: readonly MatchExplanationCountBucket[];
  /**
   * Count of shots by the route they came down.
   *
   * The route rows on the team snapshot say what this shape opened against this
   * opponent; these say what it actually used. A manager who widened his team
   * and saw nothing change can compare the two directly. A scored penalty has no
   * route and is in no bucket, so these need not sum to `shots`.
   */
  readonly routeCounts: readonly MatchExplanationCountBucket[];
  /**
   * Count of shots by the player who took them, keyed by player ID.
   *
   * This is what makes the actors causal rather than decorative: if the same
   * eleven produces the same shooter distribution whatever the manager does, the
   * selection is not reading the lineup.
   */
  readonly shooterCounts: readonly MatchExplanationCountBucket[];
}

/**
 * Match-level opportunity summary.
 */
export interface MatchExplanationOpportunitySummary {
  /** Home-side opportunity data. */
  readonly home: MatchExplanationOpportunitySideSummary;
  /** Away-side opportunity data. */
  readonly away: MatchExplanationOpportunitySideSummary;
}

/**
 * Data-only stochastic variance summary.
 */
export interface MatchExplanationVarianceSnapshot {
  /** RNG stream name used by match simulation. */
  readonly rngStreamName: "match";
  /** Fixture ID used as the current match RNG key part. */
  readonly fixtureKey: FixtureId;
  /** Stable variance markers. */
  readonly markers: readonly MatchExplanationVarianceMarker[];
}

/**
 * How one route looked for one side against this particular opponent.
 *
 * Diagnostic only. Simulation reads the matchup directly, so this row is a
 * readout of the same derivation rather than a second copy of it.
 */
export interface MatchExplanationRouteSnapshot {
  /** Route described by this row. */
  readonly route: TacticalRoute;
  /** Bounded share of the contest on this route. */
  readonly capacity: number;
  /** The own phase that limited the route. */
  readonly bottleneck: TacticalShapeCapacity;
}

/**
 * Complete explanation data for one team.
 */
export interface MatchExplanationTeamSnapshot {
  /** Side represented by this snapshot. */
  readonly side: MatchExplanationSide;
  /** Club represented by this snapshot. */
  readonly clubId: ClubId;
  /** Strength inputs available before match resolution. */
  readonly strength: MatchExplanationStrengthSnapshot;
  /** Tactical inputs available before match resolution. */
  readonly tacticDistribution: MatchExplanationTacticSnapshot;
  /** Ordered lineup roles available before match resolution. */
  readonly lineup: MatchExplanationLineupSnapshot;
  /** Dynamic-state impact summary. */
  readonly conditionImpact: MatchExplanationConditionSnapshot;
  /** Route facts against this specific opponent, in route order. */
  readonly routes: readonly MatchExplanationRouteSnapshot[];
}

/**
 * Engine-local structured explanation trace for one simulated match.
 */
export interface MatchExplanationTrace {
  /** Trace schema version. */
  readonly schemaVersion: typeof MATCH_EXPLANATION_TRACE_SCHEMA_VERSION;
  /** Fixture explained by this trace. */
  readonly fixtureId: FixtureId;
  /** Seed used by the simulated match. */
  readonly seed: string;
  /** Ordered factor keys present in the trace. */
  readonly factors: readonly MatchExplanationFactorKey[];
  /** Home-side snapshot. */
  readonly home: MatchExplanationTeamSnapshot;
  /** Away-side snapshot. */
  readonly away: MatchExplanationTeamSnapshot;
  /** Match opportunity and shot-context summary. */
  readonly opportunitySummary: MatchExplanationOpportunitySummary;
  /** Data-only variance summary. */
  readonly variance: MatchExplanationVarianceSnapshot;
}

/**
 * Input for building a trace from already-computed match data.
 */
export interface CreateMatchExplanationTraceInput {
  /** Initial match context. */
  readonly context: MatchContext;
  /** Final score already produced by simulation. */
  readonly score: MatchScore;
  /** Final aggregate stats already produced by simulation. */
  readonly stats: MatchSimulationStats;
  /** Sparse events already produced by simulation. */
  readonly events: readonly MatchStepEvent[];
}

/**
 * Builds deterministic explanation data without consuming RNG or changing
 * simulation state.
 */
export function createMatchExplanationTrace(input: CreateMatchExplanationTraceInput): MatchExplanationTrace {
  return {
    schemaVersion: MATCH_EXPLANATION_TRACE_SCHEMA_VERSION,
    fixtureId: input.context.fixtureId,
    seed: input.context.seed,
    factors: [
      "team_strength",
      "tactic_distribution",
      "lineup_roles",
      "condition_impact",
      "tactical_matchup",
      "opportunity_context",
      "variance",
    ],
    home: createTeamSnapshot("home", input.context),
    away: createTeamSnapshot("away", input.context),
    opportunitySummary: {
      home: createOpportunitySideSummary("home", input.stats, input.events),
      away: createOpportunitySideSummary("away", input.stats, input.events),
    },
    variance: {
      rngStreamName: "match",
      fixtureKey: input.context.fixtureId,
      markers: createVarianceMarkers(input.context, input.score, input.stats),
    },
  };
}

/**
 * Builds one team snapshot from match context inputs.
 */
function createTeamSnapshot(side: MatchSide, context: MatchContext): MatchExplanationTeamSnapshot {
  const team = context[side];

  return {
    routes: createRouteSnapshots(team, context[side === "home" ? "away" : "home"], context),
    side,
    clubId: team.clubId,
    strength: {
      attack: team.strength.attack,
      midfield: team.strength.midfield,
      defense: team.strength.defense,
      goalkeeper: team.strength.goalkeeper,
      overall: team.strength.overall,
    },
    tacticDistribution: {
      directness: team.tacticalDistribution.directness,
      pressing: team.tacticalDistribution.pressing,
      width: team.tacticalDistribution.width,
      risk: team.tacticalDistribution.risk,
      mentality: team.tacticalDistribution.mentality,
    },
    lineup: {
      slots: team.lineup.map((slot) => ({
        slotId: slot.slotId,
        playerId: slot.playerId,
        canonicalRole: slot.canonicalRole,
      })),
    },
    conditionImpact: {
      tracking: "not_tracked",
      effectDirection: "unknown",
      affectedPlayerCount: 0,
    },
  };
}

/**
 * Builds one side's route diagnostics against the opponent it actually faced.
 *
 * These rows come from `deriveOpportunityRoutePlan(...)` - the same function
 * the minute loop plans with - so they describe the match that was played
 * rather than a parallel model of it. Reading the bare matchup instead was
 * exactly that parallel model: it applied no tactic at all, so a side told to
 * go wide reported the flank capacity of a side that had been told nothing, and
 * the rows contradicted the football the minutes were resolving.
 *
 * The plan is built at kickoff state. That is not an approximation of the
 * capacities: `goalDifference` only moves `volumeMultiplier`, and the tactic
 * setup on the context is the one the side started with. What the rows cannot
 * show is a mid-match tactic change - the trace receives one context, and
 * chapters are Step 13's.
 */
function createRouteSnapshots(
  team: MatchTeamContext,
  opponent: MatchTeamContext,
  context: MatchContext,
): readonly MatchExplanationRouteSnapshot[] {
  const plan = deriveOpportunityRoutePlan({
    own: team.shape,
    opponent: opponent.shape,
    ownTactics: team.tacticalDistribution,
    opponentTactics: opponent.tacticalDistribution,
    caps: context.engineConfig.tacticalDistributionCaps,
    calibration: context.matchTacticsCalibration,
    goalDifference: KICKOFF_GOAL_DIFFERENCE,
  });

  return TACTICAL_ROUTES.map((route) => ({
    route,
    capacity: plan.capacityByRoute[route],
    bottleneck: plan.bottleneckByRoute[route],
  }));
}

/** Score state the plan is read at: nobody has scored when a match is planned. */
const KICKOFF_GOAL_DIFFERENCE = 0;

/**
 * Builds one side's opportunity summary from final stats and shot events.
 */
function createOpportunitySideSummary(
  side: MatchSide,
  stats: MatchSimulationStats,
  events: readonly MatchStepEvent[],
): MatchExplanationOpportunitySideSummary {
  const chanceTypeCounts: MatchExplanationCountBucket[] = [];
  const shotTypeCounts: MatchExplanationCountBucket[] = [];
  const routeCounts: MatchExplanationCountBucket[] = [];
  const shooterCounts: MatchExplanationCountBucket[] = [];
  let blockedShots = 0;
  let savedShots = 0;

  for (const event of events) {
    if (event.type !== "shot_outcome" || event.side !== side) {
      continue;
    }

    incrementBucket(chanceTypeCounts, event.chanceType);
    incrementBucket(shotTypeCounts, event.shotType);
    incrementBucket(shooterCounts, event.outcome === "goal" ? event.scorerPlayerId : event.shooterPlayerId);

    if (event.route !== undefined) {
      incrementBucket(routeCounts, event.route);
    }

    if (event.outcome === "block") {
      blockedShots += 1;
    }

    if (event.outcome === "save") {
      savedShots += 1;
    }
  }

  return {
    opportunities: stats[side].opportunities,
    shots: stats[side].shots,
    shotsOnTarget: stats[side].shotsOnTarget,
    goals: stats[side].goals,
    blockedShots,
    savedShots,
    chanceTypeCounts: sortBuckets(chanceTypeCounts),
    shotTypeCounts: sortBuckets(shotTypeCounts),
    routeCounts: sortBuckets(routeCounts),
    shooterCounts: sortBuckets(shooterCounts),
  };
}

/**
 * Increments an existing count bucket or appends a new one.
 */
function incrementBucket(buckets: MatchExplanationCountBucket[], key: string): void {
  const bucket = buckets.find((candidate) => candidate.key === key);
  if (bucket === undefined) {
    buckets.push({ key, count: 1 });
    return;
  }

  buckets.splice(buckets.indexOf(bucket), 1, { key: bucket.key, count: bucket.count + 1 });
}

/**
 * Sorts count buckets by stable ASCII machine key.
 */
function sortBuckets(buckets: readonly MatchExplanationCountBucket[]): readonly MatchExplanationCountBucket[] {
  return [...buckets].sort((left, right) => compareAscii(left.key, right.key));
}

/**
 * Builds compact variance markers from final aggregate output.
 */
function createVarianceMarkers(
  context: MatchContext,
  score: MatchScore,
  stats: MatchSimulationStats,
): readonly MatchExplanationVarianceMarker[] {
  const totalOpportunities = stats.home.opportunities + stats.away.opportunities;
  const totalShots = stats.home.shots + stats.away.shots;
  const totalGoals = score.home + score.away;
  const expectedBaseOpportunities =
    context.engineConfig.minuteCount * 2 * context.engineConfig.rates.baseOpportunityRatePerMinute;

  return [
    eventVolumeMarker(totalOpportunities, expectedBaseOpportunities),
    conversionMarker(totalGoals, totalShots),
  ];
}

/**
 * Classifies event volume without feeding back into simulation.
 */
function eventVolumeMarker(totalOpportunities: number, expectedBaseOpportunities: number): MatchExplanationVarianceMarker {
  if (expectedBaseOpportunities <= 0) {
    return totalOpportunities === 0 ? "normal_event_volume" : "high_event_volume";
  }

  if (totalOpportunities < expectedBaseOpportunities * 0.75) {
    return "low_event_volume";
  }

  if (totalOpportunities > expectedBaseOpportunities * 1.5) {
    return "high_event_volume";
  }

  return "normal_event_volume";
}

/**
 * Classifies conversion after the match using final shot and goal totals.
 */
function conversionMarker(totalGoals: number, totalShots: number): MatchExplanationVarianceMarker {
  if (totalShots === 0) {
    return totalGoals === 0 ? "normal_conversion" : "high_conversion";
  }

  const conversionRate = totalGoals / totalShots;

  if (conversionRate < 0.12) {
    return "low_conversion";
  }

  if (conversionRate > 0.38) {
    return "high_conversion";
  }

  return "normal_conversion";
}

/**
 * Compares stable ASCII keys without locale-dependent ordering.
 */
function compareAscii(left: string, right: string): number {
  if (left < right) {
    return -1;
  }

  if (left > right) {
    return 1;
  }

  return 0;
}
