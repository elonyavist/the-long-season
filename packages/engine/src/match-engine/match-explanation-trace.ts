import {
  TACTICAL_ROUTES,
  type CanonicalPlayerRole,
  type ClubId,
  type FixtureId,
  type TacticMentalityKey,
  type PlayerId,
  type MatchTacticalChapterChangeKind,
  type MatchTacticalChapterFact,
  type MatchTacticalChapterSideFact,
  type MatchTacticalCommandOwner,
  type MatchEvent,
  type MatchReport,
  type TacticalRoute,
  type TacticalShapeCapacity,
} from "@game/domain";

import type { MatchContext, MatchTeamContext } from "./match-context.ts";
import type { AppliedLiveMatchTacticalCommandFact } from "./progressive-match-session.ts";
import { deriveOpportunityRoutePlan, opportunityRouteSaturation } from "./opportunity-route.ts";
import type { MatchScore, MatchSide, MatchSimulationStats } from "./match-simulation-state.ts";
import {
  BALANCED_MATCH_LATERAL_FOCUS_BY_SIDE,
  PENALTY_EXPECTED_GOALS,
  type MatchLateralFocusBySide,
  type MatchShotOutcomeStepEvent,
  type MatchStepEvent,
} from "./step-match.ts";

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
export const MATCH_EXPLANATION_TRACE_SCHEMA_VERSION = 3;

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
  /** Temporally local football chapters derived from accepted commands and shots. */
  readonly tacticalChapters: readonly MatchTacticalChapterFact[];
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
  /** Lateral plan the minute loop consumed. */
  readonly lateralFocusBySide?: MatchLateralFocusBySide;
  /** Accepted tactical deltas; substitutions remain canonical match events. */
  readonly tacticalCommandFacts?: readonly AppliedLiveMatchTacticalCommandFact[];
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
    home: createTeamSnapshot(
      "home",
      input.context,
      input.lateralFocusBySide ?? BALANCED_MATCH_LATERAL_FOCUS_BY_SIDE,
    ),
    away: createTeamSnapshot(
      "away",
      input.context,
      input.lateralFocusBySide ?? BALANCED_MATCH_LATERAL_FOCUS_BY_SIDE,
    ),
    opportunitySummary: {
      home: createOpportunitySideSummary("home", input.stats, input.events),
      away: createOpportunitySideSummary("away", input.stats, input.events),
    },
    tacticalChapters: createMatchTacticalChapters({
      score: input.score,
      stats: input.stats,
      events: input.events,
      tacticalCommandFacts: input.tacticalCommandFacts ?? [],
    }),
    variance: {
      rngStreamName: "match",
      fixtureKey: input.context.fixtureId,
      markers: createVarianceMarkers(input.context, input.score, input.stats),
    },
  };
}

/** Input facts for the chapter derivation, kept separate for focused tests. */
export interface CreateMatchTacticalChaptersInput {
  readonly score: MatchScore;
  readonly stats: MatchSimulationStats;
  readonly events: readonly TacticalChapterEvent[];
  readonly tacticalCommandFacts: readonly AppliedLiveMatchTacticalCommandFact[];
}

type TacticalChapterEvent = MatchStepEvent | MatchEvent;

interface ChapterBoundaryAccumulator {
  readonly effectiveMinute: number;
  readonly owners: Set<MatchTacticalCommandOwner>;
  readonly sides: Set<MatchSide>;
  readonly changeKinds: Set<MatchTacticalChapterChangeKind>;
}

/**
 * Builds closed minute chapters without reconstructing any historical team.
 *
 * Accepted changes at minute N first affect minute N+1. Shot events are the
 * canonical observable outcome, so chapter totals can reconcile exactly with
 * final match facts and no presentation formula needs to estimate control.
 */
export function createMatchTacticalChapters(
  input: CreateMatchTacticalChaptersInput,
): readonly MatchTacticalChapterFact[] {
  const finalMinute = fullTimeMinute(input.events);
  const boundaries = new Map<number, ChapterBoundaryAccumulator>();

  for (const retained of input.tacticalCommandFacts) {
    addChapterBoundary(
      boundaries,
      retained.fact.minute + 1,
      retained.owner,
      retained.fact.side,
      tacticalChangeKind(retained.fact.type),
      finalMinute,
    );
  }
  for (const event of input.events) {
    if (event.type !== "substitution") continue;
    addChapterBoundary(
      boundaries,
      event.minute + 1,
      event.reasonKey === "ai_decision" ? "ai" : "manager",
      event.side,
      "substitution",
      finalMinute,
    );
  }

  const orderedBoundaries = [...boundaries.values()].toSorted(
    (left, right) => left.effectiveMinute - right.effectiveMinute,
  );
  const starts = [1, ...orderedBoundaries.map(({ effectiveMinute }) => effectiveMinute)];
  const chapters = starts.flatMap((startMinute, index): readonly MatchTacticalChapterFact[] => {
    const endMinute = index + 1 < starts.length
      ? (starts[index + 1] as number) - 1
      : finalMinute;
    if (startMinute > endMinute) return [];
    const boundary = index === 0 ? undefined : orderedBoundaries[index - 1];
    const trigger = boundary === undefined
      ? { type: "kickoff" as const }
      : {
          type: "command" as const,
          owners: orderedOwners(boundary.owners),
          sides: orderedSides(boundary.sides),
          changeKinds: orderedChangeKinds(boundary.changeKinds),
        };
    return [{
      startMinute,
      endMinute,
      trigger,
      home: chapterSideFacts("home", startMinute, endMinute, input.events),
      away: chapterSideFacts("away", startMinute, endMinute, input.events),
    }];
  });

  assertChapterReconciliation(chapters, input);
  return chapters;
}

/** Rebuilds chapters from persisted raw facts without a parallel formula. */
export function createMatchTacticalChaptersFromReport(
  report: MatchReport,
): readonly MatchTacticalChapterFact[] {
  return createMatchTacticalChapters({
    score: report.score,
    stats: report.stats,
    events: report.events,
    tacticalCommandFacts: report.tacticalContext.commands,
  });
}

function addChapterBoundary(
  boundaries: Map<number, ChapterBoundaryAccumulator>,
  effectiveMinute: number,
  owner: MatchTacticalCommandOwner,
  side: MatchSide,
  changeKind: MatchTacticalChapterChangeKind,
  finalMinute: number,
): void {
  if (effectiveMinute > finalMinute) return;
  const existing = boundaries.get(effectiveMinute);
  if (existing === undefined) {
    boundaries.set(effectiveMinute, {
      effectiveMinute,
      owners: new Set([owner]),
      sides: new Set([side]),
      changeKinds: new Set([changeKind]),
    });
    return;
  }
  existing.owners.add(owner);
  existing.sides.add(side);
  existing.changeKinds.add(changeKind);
}

function chapterSideFacts(
  side: MatchSide,
  startMinute: number,
  endMinute: number,
  events: readonly TacticalChapterEvent[],
): MatchTacticalChapterSideFact {
  const routedShots: { readonly route?: TacticalRoute; readonly isGoal: boolean }[] = [];
  let shots = 0;
  let goals = 0;
  let expectedGoals = 0;
  for (const event of events) {
    const eventMinute = "shot" in event ? event.shot.minute : event.minute;
    const eventSide = "shot" in event ? event.shot.side : "side" in event ? event.side : undefined;
    if (eventMinute < startMinute || eventMinute > endMinute || eventSide !== side) {
      continue;
    }
    if (event.type === "penalty_outcome") {
      shots += 1;
      goals += event.outcome === "scored" ? 1 : 0;
      expectedGoals += PENALTY_EXPECTED_GOALS;
      continue;
    }
    if (isShotOutcome(event)) {
      if (event.deadBallKind === "penalty") continue;
      routedShots.push({
        ...(event.route === undefined ? {} : { route: event.route }),
        isGoal: event.outcome === "goal",
      });
      shots += 1;
      goals += event.outcome === "goal" ? 1 : 0;
      expectedGoals += event.expectedGoals ?? event.quality;
      continue;
    }
    if (!("shot" in event) || isPersistedPenaltyShot(event, events)) continue;
    routedShots.push({
      ...(event.shot.route === undefined ? {} : { route: event.shot.route }),
      isGoal: event.type === "goal",
    });
    shots += 1;
    goals += event.type === "goal" ? 1 : 0;
    expectedGoals += event.shot.expectedGoals;
  }
  return {
    shots,
    goals,
    expectedGoals,
    averageChanceQuality: shots === 0 ? "not_observed" : expectedGoals / shots,
    attemptedRoutes: routeCounts(routedShots),
    scoringRoutes: routeCounts(routedShots.filter(({ isGoal }) => isGoal)),
  };
}

function routeCounts(
  shots: readonly { readonly route?: TacticalRoute }[],
): MatchTacticalChapterSideFact["attemptedRoutes"] {
  return TACTICAL_ROUTES.map((route) => ({
    route,
    count: shots.filter((shot) => shot.route === route).length,
  })).filter(({ count }) => count > 0);
}

/** Identifies the durable shot copy emitted beside the canonical penalty outcome. */
function isPersistedPenaltyShot(
  event: MatchEvent,
  events: readonly TacticalChapterEvent[],
): boolean {
  return "shot" in event
    && event.shot.chanceType === "dead_ball"
    && events.some((candidate) =>
      candidate.type === "penalty_outcome"
      && candidate.minute === event.shot.minute
      && candidate.side === event.shot.side
    );
}

function isShotOutcome(event: TacticalChapterEvent): event is MatchShotOutcomeStepEvent {
  return event.type === "shot_outcome";
}

function fullTimeMinute(events: readonly TacticalChapterEvent[]): number {
  const fullTime = events.findLast((event) => event.type === "full_time");
  if (fullTime === undefined) throw new Error("Tactical chapters require a full-time event");
  return fullTime.minute;
}

function tacticalChangeKind(
  type: Exclude<AppliedLiveMatchTacticalCommandFact["fact"]["type"], "substitution">,
): MatchTacticalChapterChangeKind {
  switch (type) {
    case "formation_change": return "formation";
    case "role_change": return "role";
    case "tactic_change": return "tactic";
  }
}

const COMMAND_OWNER_ORDER: readonly MatchTacticalCommandOwner[] = ["manager", "ai"];
const MATCH_SIDE_ORDER: readonly MatchSide[] = ["home", "away"];
const CHAPTER_CHANGE_KIND_ORDER: readonly MatchTacticalChapterChangeKind[] = [
  "substitution",
  "formation",
  "role",
  "tactic",
];

function orderedOwners(values: ReadonlySet<MatchTacticalCommandOwner>): readonly MatchTacticalCommandOwner[] {
  return COMMAND_OWNER_ORDER.filter((value) => values.has(value));
}

function orderedSides(values: ReadonlySet<MatchSide>): readonly MatchSide[] {
  return MATCH_SIDE_ORDER.filter((value) => values.has(value));
}

function orderedChangeKinds(
  values: ReadonlySet<MatchTacticalChapterChangeKind>,
): readonly MatchTacticalChapterChangeKind[] {
  return CHAPTER_CHANGE_KIND_ORDER.filter((value) => values.has(value));
}

function assertChapterReconciliation(
  chapters: readonly MatchTacticalChapterFact[],
  input: Pick<CreateMatchTacticalChaptersInput, "score" | "stats" | "events">,
): void {
  for (const side of MATCH_SIDE_ORDER) {
    const shots = chapters.reduce((total, chapter) => total + chapter[side].shots, 0);
    const goals = chapters.reduce((total, chapter) => total + chapter[side].goals, 0);
    const expectedGoals = chapters.reduce((total, chapter) => total + chapter[side].expectedGoals, 0);
    const telemetryExpectedGoals = input.stats.telemetry?.stats[side].expectedGoals;
    if (shots !== input.stats[side].shots || goals !== input.score[side]) {
      throw new Error(`Tactical chapter ${side} totals do not reconcile with match facts`);
    }
    if (telemetryExpectedGoals !== undefined) {
      const sourceExpectedGoals = canonicalEventExpectedGoals(side, input.events);
      if (sourceExpectedGoals !== telemetryExpectedGoals) {
        throw new Error(`Tactical chapter ${side} source xG does not reconcile with match telemetry`);
      }
      if (Math.abs(expectedGoals - telemetryExpectedGoals) > 1e-12) {
        throw new Error(`Tactical chapter ${side} xG does not reconcile with match telemetry`);
      }
    }
  }
}

/** Replays only the event-owned xG additions, in original simulation order. */
function canonicalEventExpectedGoals(
  side: MatchSide,
  events: readonly TacticalChapterEvent[],
): number {
  let total = 0;
  for (const event of events) {
    const eventSide = "shot" in event ? event.shot.side : "side" in event ? event.side : undefined;
    if (eventSide !== side) continue;
    if (event.type === "penalty_outcome") {
      total += PENALTY_EXPECTED_GOALS;
    } else if (event.type === "shot_outcome" && event.deadBallKind !== "penalty") {
      if (event.expectedGoals === undefined) {
        throw new Error("Tactical chapter source event is missing canonical xG");
      }
      total += event.expectedGoals;
    } else if ("shot" in event && !isPersistedPenaltyShot(event, events)) {
      total += event.shot.expectedGoals;
    }
  }
  return total;
}

/**
 * Builds one team snapshot from match context inputs.
 */
function createTeamSnapshot(
  side: MatchSide,
  context: MatchContext,
  lateralFocusBySide: MatchLateralFocusBySide,
): MatchExplanationTeamSnapshot {
  const team = context[side];

  return {
    routes: createRouteSnapshots(
      team,
      context[side === "home" ? "away" : "home"],
      context,
      lateralFocusBySide,
      side,
    ),
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
  lateralFocusBySide: MatchLateralFocusBySide,
  side: MatchSide,
): readonly MatchExplanationRouteSnapshot[] {
  const plan = deriveOpportunityRoutePlan({
    own: team.shape,
    opponent: opponent.shape,
    ownTactics: team.tacticalDistribution,
    opponentTactics: opponent.tacticalDistribution,
    lateralFocus: lateralFocusBySide[side],
    opponentLateralFocus: lateralFocusBySide[side === "home" ? "away" : "home"],
    caps: context.engineConfig.tacticalDistributionCaps,
    calibration: context.matchTacticsCalibration,
    goalDifference: KICKOFF_GOAL_DIFFERENCE,
  });

  return TACTICAL_ROUTES.map((route) => ({
    route,
    capacity: opportunityRouteSaturation(plan, route),
    bottleneck: plan.contestByRoute[route].bottleneck,
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
