import { CANONICAL_PLAYER_ROLES, type CanonicalPlayerRole } from "../tactics/player-roles.ts";
import type { FormationSide } from "../tactics/formations.ts";
import { POSITION_SUITABILITIES, type PositionSuitability } from "../tactics/position-suitability.ts";

/**
 * One bounded football capacity a single side has by virtue of its shape.
 *
 * These are the twelve capacities the Phase 81 design contract locks. They
 * describe what a team *can do* without knowing anything about its opponent:
 * the opponent comparison is a separate relational concept.
 *
 * Left and right are separate capacities because a side that stacks one flank
 * is a real football choice with a real cost, and collapsing them into one
 * "width" number would hide exactly that.
 */
export type TacticalShapeCapacity =
  | "build_up"
  | "central_progression"
  | "left_progression"
  | "right_progression"
  | "final_third_presence"
  | "pressing_cohesion"
  | "central_coverage"
  | "left_coverage"
  | "right_coverage"
  | "box_protection"
  | "counter_threat"
  | "rest_defence";

/**
 * Deterministic capacity order used by reports, tests, and tie-breakers.
 *
 * Iteration over capacities always follows this array. Nothing iterates the
 * object keys of a capacity record, because key order is not a contract.
 */
export const TACTICAL_SHAPE_CAPACITIES = [
  "build_up",
  "central_progression",
  "left_progression",
  "right_progression",
  "final_third_presence",
  "pressing_cohesion",
  "central_coverage",
  "left_coverage",
  "right_coverage",
  "box_protection",
  "counter_threat",
  "rest_defence",
] as const satisfies readonly TacticalShapeCapacity[];

/**
 * One football task a player contributes to, stated without a flank.
 *
 * Tasks are what content declares weights for; capacities are what the engine
 * produces. The two differ by exactly one thing: the two lateral tasks each
 * split into a left and a right capacity according to where the player stands.
 *
 * Declaring weights per task rather than per capacity is what makes left/right
 * mirror symmetry structural. There is no way to write down a calibration in
 * which right backs cover the right flank better than left backs cover the
 * left, because there is only one number for both.
 */
export type TacticalShapeTask =
  | "build_up"
  | "central_progression"
  | "lateral_progression"
  | "final_third_presence"
  | "pressing_cohesion"
  | "central_coverage"
  | "lateral_coverage"
  | "box_protection"
  | "counter_threat"
  | "rest_defence";

/**
 * What kind of thing a task is, which decides whether suitability touches it.
 *
 * A `coordination` task is about players working together: connecting, timing a
 * press, holding a line, covering for each other. Playing a man out of position
 * degrades exactly that, which is why suitability acts here and nowhere else.
 *
 * A `presence` task is about being somewhere and being dangerous there. A
 * winger deployed as a striker is still a body in the box and still runs in
 * behind - he is worse at linking with the side, not worse at existing. This
 * split is what keeps the modifier narrow: the destination role's ability
 * weights already price how good he is at the job, so multiplying presence too
 * would charge him twice for the same move.
 */
export type TacticalShapeTaskKind = "coordination" | "presence";

/**
 * Which tasks suitability may touch.
 *
 * Declared with `satisfies` so a new task must state its kind rather than
 * silently inheriting one.
 */
export const TACTICAL_SHAPE_TASK_KIND = {
  build_up: "coordination",
  central_progression: "coordination",
  lateral_progression: "coordination",
  final_third_presence: "presence",
  pressing_cohesion: "coordination",
  central_coverage: "coordination",
  lateral_coverage: "coordination",
  box_protection: "coordination",
  counter_threat: "presence",
  rest_defence: "coordination",
} as const satisfies Readonly<Record<TacticalShapeTask, TacticalShapeTaskKind>>;

/** Deterministic task order used by validation and calibration authoring. */
export const TACTICAL_SHAPE_TASKS = [
  "build_up",
  "central_progression",
  "lateral_progression",
  "final_third_presence",
  "pressing_cohesion",
  "central_coverage",
  "lateral_coverage",
  "box_protection",
  "counter_threat",
  "rest_defence",
] as const satisfies readonly TacticalShapeTask[];

/** Which flank a capacity belongs to, or neither for a central capacity. */
export type TacticalShapeFlank = "left" | "right" | "none";

/**
 * The one place a capacity is decomposed into its task and its flank.
 *
 * Declared with `satisfies` so adding a capacity is a build failure here rather
 * than a silent gap in the engine. A future capacity must state which task
 * feeds it and which flank it belongs to; there is no default for either.
 */
export const TACTICAL_SHAPE_CAPACITY_SOURCE = {
  build_up: { task: "build_up", flank: "none" },
  central_progression: { task: "central_progression", flank: "none" },
  left_progression: { task: "lateral_progression", flank: "left" },
  right_progression: { task: "lateral_progression", flank: "right" },
  final_third_presence: { task: "final_third_presence", flank: "none" },
  pressing_cohesion: { task: "pressing_cohesion", flank: "none" },
  central_coverage: { task: "central_coverage", flank: "none" },
  left_coverage: { task: "lateral_coverage", flank: "left" },
  right_coverage: { task: "lateral_coverage", flank: "right" },
  box_protection: { task: "box_protection", flank: "none" },
  counter_threat: { task: "counter_threat", flank: "none" },
  rest_defence: { task: "rest_defence", flank: "none" },
} as const satisfies Readonly<
  Record<TacticalShapeCapacity, { readonly task: TacticalShapeTask; readonly flank: TacticalShapeFlank }>
>;

/**
 * Mirror image of one capacity across the halfway line.
 *
 * Two different things need it. A mirrored lineup must produce a mirrored
 * profile, which is how the symmetry invariant is stated; and a route down
 * *your* left meets the opponent's *right*, because the two sides face each
 * other. Writing that down once is what stops the second fact being quietly
 * inverted somewhere downstream.
 */
export const TACTICAL_SHAPE_CAPACITY_MIRROR = {
  build_up: "build_up",
  central_progression: "central_progression",
  left_progression: "right_progression",
  right_progression: "left_progression",
  final_third_presence: "final_third_presence",
  pressing_cohesion: "pressing_cohesion",
  central_coverage: "central_coverage",
  left_coverage: "right_coverage",
  right_coverage: "left_coverage",
  box_protection: "box_protection",
  counter_threat: "counter_threat",
  rest_defence: "rest_defence",
} as const satisfies Readonly<Record<TacticalShapeCapacity, TacticalShapeCapacity>>;

/**
 * One way a side can try to reach a shooting position.
 *
 * Five routes, not fifteen zones. They are the paths a manager can recognise
 * being opened or closed, which is what makes the consequence explainable.
 */
export type TacticalRoute = "central" | "left" | "right" | "direct" | "transition";

/** Deterministic route order used by matchup output, reports, and tests. */
export const TACTICAL_ROUTES = [
  "central",
  "left",
  "right",
  "direct",
  "transition",
] as const satisfies readonly TacticalRoute[];

/** The phases a route needs from its own side, and what resists it. */
export interface TacticalRouteDefinition {
  /**
   * Own capacities the route passes through, in football order.
   *
   * A chain is as strong as its weakest link, so this order is also the
   * deterministic tie-break when two links are equally weak.
   */
  readonly ownChain: readonly TacticalShapeCapacity[];
  /** Opponent capacities standing in the way, stated from the opponent's view. */
  readonly opponentResistance: readonly TacticalShapeCapacity[];
}

/**
 * What each route is made of.
 *
 * These are football semantics, so they live in typed code rather than in
 * content: content owns how strongly a bottleneck bites, not whether a route
 * down the left meets the opponent's right.
 *
 * Two of them carry the design's whole argument. `direct` skips progression
 * entirely - that is what going long means - so a side with no midfield can
 * still play, badly, through the air. `transition` skips build-up too, which
 * is why a shape that cannot build can still hurt you on the counter, and why
 * the answer to it is rest defence rather than pressing.
 */
export const TACTICAL_ROUTE_DEFINITION = {
  central: {
    ownChain: ["build_up", "central_progression", "final_third_presence"],
    opponentResistance: ["central_coverage", "box_protection"],
  },
  left: {
    ownChain: ["build_up", "left_progression", "final_third_presence"],
    opponentResistance: ["right_coverage", "box_protection"],
  },
  right: {
    ownChain: ["build_up", "right_progression", "final_third_presence"],
    opponentResistance: ["left_coverage", "box_protection"],
  },
  direct: {
    ownChain: ["build_up", "final_third_presence"],
    opponentResistance: ["box_protection", "central_coverage"],
  },
  transition: {
    ownChain: ["counter_threat", "final_third_presence"],
    opponentResistance: ["rest_defence", "box_protection"],
  },
} as const satisfies Readonly<Record<TacticalRoute, TacticalRouteDefinition>>;

/**
 * Mirror image of one route.
 *
 * Only the two flank routes have a distinct mirror; the rest are their own.
 * Declared so the symmetry invariant reads the same way for routes as for
 * capacities instead of hard-coding a left/right swap in a test.
 */
export const TACTICAL_ROUTE_MIRROR = {
  central: "central",
  left: "right",
  right: "left",
  direct: "direct",
  transition: "transition",
} as const satisfies Readonly<Record<TacticalRoute, TacticalRoute>>;

/**
 * Versioned coefficients for comparing two intrinsic profiles.
 *
 * Only two numbers, on purpose. The route definitions above carry the
 * football; content decides how sharply a bottleneck bites and how hard a
 * press bites into build-up.
 */
export interface TacticalMatchupCalibrationConfig {
  /**
   * How much a chain is worth its weakest link rather than its average, in
   * basis points.
   *
   * `10000` is a pure bottleneck: one broken phase kills the route outright.
   * `0` is a pure average, which would let a huge front line paper over a
   * missing midfield. The football answer is close to the bottleneck end
   * without reaching it, because a strong finish does partly rescue a shaky
   * build-up.
   */
  readonly chainBottleneckWeightBasisPoints: number;
  /**
   * How much opponent pressing cohesion suppresses build-up, in basis points.
   *
   * This is the one place pressing acts, and it is why pressing only pays when
   * the pressing side's own shape is coherent: `pressing_cohesion` is itself a
   * shape capacity, so an incoherent press is a weak press.
   */
  readonly pressingContestWeightBasisPoints: number;
}

/**
 * Largest number of contributors one capacity can have.
 *
 * Every player on the pitch contributes to every task, so this is the lineup
 * size. The marginal-contribution ladder must be exactly this long: a rank
 * without a declared band would need a default, and a default is a guess where
 * a validation failure belongs.
 */
export const TACTICAL_SHAPE_MAXIMUM_CONTRIBUTORS = 11;

/**
 * How much of a lateral contribution stays on the player's own flank.
 *
 * A left-centre defender covers the left half more than the right half but is
 * not a full left-sided player. Content declares one number for the half-centre
 * channels; the five `FormationSide` values are derived from it symmetrically,
 * so a calibration cannot express an asymmetric pitch.
 */
export interface TacticalShapeChannelPolicy {
  /** Own-flank share for `left_center`/`right_center`, in basis points. */
  readonly halfChannelOwnShareBasisPoints: number;
}

/**
 * Versioned intrinsic tactical-shape calibration.
 *
 * Every number is an integer so the shipped asset stays exact and reviewable.
 * The engine converts to floats once, at derivation time.
 */
export interface TacticalShapeCalibrationConfig {
  /**
   * Contribution of one full-quality player in one role to one task, in basis
   * points. `10000` means "a whole unit of this task per point of role score".
   *
   * The goalkeeper row is all zeros: shape is a property of the outfield ten,
   * and goalkeeper quality already has its own owner in `TeamStrength`.
   */
  readonly contributionWeightBasisPointsByRoleAndTask: Readonly<
    Record<CanonicalPlayerRole, Readonly<Record<TacticalShapeTask, number>>>
  >;
  /**
   * Multiplier applied to the nth best contributor to one task, in basis
   * points, strictly decreasing and strictly positive.
   *
   * This is the diminishing return. The sixth striker still adds something -
   * strictly positive is what keeps "more of a thing is more of that thing"
   * true - but he adds far less than the first.
   */
  readonly marginalContributionBasisPointsByRank: readonly number[];
  /** How lateral contributions are split between the two flanks. */
  readonly channelPolicy: TacticalShapeChannelPolicy;
  /**
   * What a player out of position keeps of his coordinated contribution, in
   * basis points, applied to `coordination` tasks only.
   *
   * `natural` is exactly `10000`: playing a man in his own position is the
   * neutral reference, not a bonus. Everything else is a cost, and the costs
   * decrease strictly from `natural` down to `invalid`.
   *
   * This is the *only* effect suitability has. The destination role's ability
   * weights already make a winger a poor centre back on the numbers that
   * matter for centre-back play; charging a second blanket multiplier on top
   * would price the same decision twice.
   */
  readonly coordinationMultiplierBasisPointsBySuitability: Readonly<Record<PositionSuitability, number>>;
  /**
   * Raw contribution total that maps a task to a mid-range capacity, in
   * thousandths.
   *
   * The engine maps a raw total `r` to `r / (r + reference)`. That is bounded
   * in `[0, 1)` by construction with no clamp to fall off, stays strictly
   * increasing, needs no transcendental function, and puts an ordinary
   * reference shape near the middle of the range so both directions have room.
   */
  readonly saturationReferenceMilliByTask: Readonly<Record<TacticalShapeTask, number>>;
}

/**
 * Versioned calibration for everything the match engine derives from tactics.
 *
 * Phase 81 fills this asset one section at a time: intrinsic shape here,
 * relational matchup and coordination suitability in the steps that own them.
 * Keeping one versioned asset means one stamped version travels with a career
 * instead of three that can drift apart.
 */
export interface MatchTacticsCalibrationConfig {
  readonly schemaVersion: number;
  readonly version: string;
  readonly classification: "explicit_game_design_target";
  readonly tacticalShape: TacticalShapeCalibrationConfig;
  readonly tacticalMatchup: TacticalMatchupCalibrationConfig;
}

/** Stable validation failures for the match-tactics calibration asset. */
export type MatchTacticsCalibrationErrorCode =
  | "invalid_schema_version"
  | "invalid_version"
  | "invalid_classification"
  | "incomplete_contribution_weights"
  | "negative_contribution_weight"
  | "goalkeeper_is_not_isolated"
  | "outfield_role_leaves_task_empty"
  | "invalid_marginal_contribution_ladder"
  | "invalid_channel_policy"
  | "incomplete_saturation_references"
  | "invalid_saturation_reference"
  | "invalid_chain_bottleneck_weight"
  | "invalid_pressing_contest_weight"
  | "incomplete_coordination_multipliers"
  | "invalid_coordination_multipliers";

/** Typed policy error raised before bad tuning can reach the match engine. */
export class MatchTacticsCalibrationError extends Error {
  /** Machine-readable failure reason. */
  public readonly code: MatchTacticsCalibrationErrorCode;

  /** Creates one stable calibration validation failure. */
  public constructor(code: MatchTacticsCalibrationErrorCode, message: string) {
    super(message);
    this.name = "MatchTacticsCalibrationError";
    this.code = code;
  }
}

/**
 * The mathematical constraints every intrinsic-shape calibration must satisfy.
 *
 * These were declared here, at Step 03, before any coefficient was written.
 * Step 01 froze the *product outcome* bands - what structure may be worth
 * against squad quality - and deliberately did not constrain the internal
 * mathematics, so nothing about this list is inherited.
 *
 * 1. **Non-negative weights.** A player never makes his own team worse at a
 *    task by being on the pitch.
 * 2. **Strictly decreasing marginal contribution.** The nth contributor to one
 *    task is worth strictly less than the (n-1)th, and still strictly more
 *    than nothing. Strictly positive is what makes an extra body always a
 *    small gain rather than a silent loss.
 * 3. **Bounded capacities.** Every capacity lands in `[0, 1)` for every legal
 *    lineup, with no clamp that can be hit and no unbounded multiplier.
 * 4. **Left/right mirror symmetry.** Mirroring a lineup mirrors its profile
 *    exactly. Weights are declared per task rather than per flank and the five
 *    channels derive from one number, so this holds by construction; the
 *    engine tests prove it end to end.
 *
 * Two football invariants are validated alongside them: the goalkeeper
 * contributes to nothing, and every outfield role contributes something to
 * every task, so no legal lineup can produce a structurally empty capacity.
 */
export function validateMatchTacticsCalibration(config: MatchTacticsCalibrationConfig): void {
  if (config.schemaVersion !== MATCH_TACTICS_CALIBRATION_SCHEMA_VERSION) {
    throw new MatchTacticsCalibrationError(
      "invalid_schema_version",
      `Match-tactics calibration requires schema version ${MATCH_TACTICS_CALIBRATION_SCHEMA_VERSION}: ${config.schemaVersion}`,
    );
  }
  if (config.version.trim().length === 0) {
    throw new MatchTacticsCalibrationError("invalid_version", "Match-tactics calibration requires a stable version");
  }
  if (config.classification !== "explicit_game_design_target") {
    throw new MatchTacticsCalibrationError(
      "invalid_classification",
      "Match-tactics calibration must be an explicit game design target",
    );
  }

  validateTacticalShapeCalibration(config.tacticalShape);
  validateTacticalMatchupCalibration(config.tacticalMatchup);
}

/**
 * Validates the relational-matchup section on its own.
 *
 * Both coefficients are shares, so both are bounded to `0..10000`. The
 * bottleneck weight additionally must keep a real bottleneck: below half, the
 * average would dominate and a route with one dead phase would still look
 * playable, which is the exact failure this phase exists to remove.
 */
export function validateTacticalMatchupCalibration(config: TacticalMatchupCalibrationConfig): void {
  const bottleneck = config.chainBottleneckWeightBasisPoints;
  if (!Number.isSafeInteger(bottleneck) || bottleneck < 5_000 || bottleneck > 10_000) {
    throw new MatchTacticsCalibrationError(
      "invalid_chain_bottleneck_weight",
      `Chain bottleneck weight must be an integer between 5000 and 10000 basis points: ${bottleneck}`,
    );
  }

  const pressing = config.pressingContestWeightBasisPoints;
  if (!Number.isSafeInteger(pressing) || pressing < 0 || pressing > 10_000) {
    throw new MatchTacticsCalibrationError(
      "invalid_pressing_contest_weight",
      `Pressing contest weight must be an integer between 0 and 10000 basis points: ${pressing}`,
    );
  }
}

/**
 * Validates the intrinsic-shape section on its own.
 *
 * Split out from the asset check so a focused test can exercise one section
 * without building a whole asset around it.
 */
export function validateTacticalShapeCalibration(config: TacticalShapeCalibrationConfig): void {
  validateContributionWeights(config.contributionWeightBasisPointsByRoleAndTask);
  validateMarginalContributionLadder(config.marginalContributionBasisPointsByRank);
  validateChannelPolicy(config.channelPolicy);
  validateCoordinationMultipliers(config.coordinationMultiplierBasisPointsBySuitability);
  validateSaturationReferences(config.saturationReferenceMilliByTask);
}

/**
 * Splits one lateral contribution between the two flanks.
 *
 * The five channels derive from a single authored number, mirrored around the
 * centre. `center` is exactly half and half; the wide channels are entirely
 * one-sided. This is the only place the pitch has a left and a right.
 *
 * @example
 * lateralChannelShares("left_center", { halfChannelOwnShareBasisPoints: 7500 });
 * // { left: 0.75, right: 0.25 }
 */
export function lateralChannelShares(
  side: FormationSide,
  policy: TacticalShapeChannelPolicy,
): { readonly left: number; readonly right: number } {
  const own = policy.halfChannelOwnShareBasisPoints / 10_000;
  const other = 1 - own;

  switch (side) {
    case "left":
      return { left: 1, right: 0 };
    case "left_center":
      return { left: own, right: other };
    case "center":
      return { left: 0.5, right: 0.5 };
    case "right_center":
      return { left: other, right: own };
    case "right":
      return { left: 0, right: 1 };
  }
}

/** Schema version of the match-tactics calibration asset. */
export const MATCH_TACTICS_CALIBRATION_SCHEMA_VERSION = 1;

function validateContributionWeights(
  weights: Readonly<Record<CanonicalPlayerRole, Readonly<Record<TacticalShapeTask, number>>>>,
): void {
  for (const role of CANONICAL_PLAYER_ROLES) {
    const taskWeights = weights[role];
    if (taskWeights === undefined) {
      throw new MatchTacticsCalibrationError(
        "incomplete_contribution_weights",
        `Match-tactics calibration has no contribution weights for ${role}`,
      );
    }

    for (const task of TACTICAL_SHAPE_TASKS) {
      const weight = taskWeights[task];
      if (weight === undefined) {
        throw new MatchTacticsCalibrationError(
          "incomplete_contribution_weights",
          `Match-tactics calibration has no ${task} weight for ${role}`,
        );
      }
      if (!Number.isSafeInteger(weight) || weight < 0) {
        throw new MatchTacticsCalibrationError(
          "negative_contribution_weight",
          `Contribution weight must be a non-negative integer for ${role}.${task}: ${weight}`,
        );
      }
      if (role === "goalkeeper" && weight !== 0) {
        throw new MatchTacticsCalibrationError(
          "goalkeeper_is_not_isolated",
          `Goalkeeper must not contribute to intrinsic shape: ${task} is ${weight}`,
        );
      }
      if (role !== "goalkeeper" && weight === 0) {
        throw new MatchTacticsCalibrationError(
          "outfield_role_leaves_task_empty",
          `Every outfield role must contribute to every task, so no legal lineup empties one: ${role}.${task}`,
        );
      }
    }
  }
}

function validateMarginalContributionLadder(ladder: readonly number[]): void {
  if (ladder.length !== TACTICAL_SHAPE_MAXIMUM_CONTRIBUTORS) {
    throw new MatchTacticsCalibrationError(
      "invalid_marginal_contribution_ladder",
      `Marginal contribution ladder must declare exactly ${TACTICAL_SHAPE_MAXIMUM_CONTRIBUTORS} ranks: ${ladder.length}`,
    );
  }
  if (ladder[0] !== 10_000) {
    throw new MatchTacticsCalibrationError(
      "invalid_marginal_contribution_ladder",
      `The best contributor to a task counts in full: rank 1 must be 10000, not ${String(ladder[0])}`,
    );
  }

  let previous = Number.POSITIVE_INFINITY;
  for (const [rank, band] of ladder.entries()) {
    if (!Number.isSafeInteger(band) || band <= 0 || band >= previous) {
      throw new MatchTacticsCalibrationError(
        "invalid_marginal_contribution_ladder",
        `Marginal contribution must be a strictly decreasing positive integer at rank ${rank + 1}: ${band}`,
      );
    }
    previous = band;
  }
}

function validateChannelPolicy(policy: TacticalShapeChannelPolicy): void {
  const own = policy.halfChannelOwnShareBasisPoints;
  if (!Number.isSafeInteger(own) || own < 5_000 || own > 10_000) {
    throw new MatchTacticsCalibrationError(
      "invalid_channel_policy",
      `Half-channel own share must be an integer between 5000 and 10000 basis points: ${own}`,
    );
  }
}

function validateCoordinationMultipliers(
  multipliers: Readonly<Record<PositionSuitability, number>>,
): void {
  let previous = Number.POSITIVE_INFINITY;
  for (const suitability of POSITION_SUITABILITIES) {
    const multiplier = multipliers[suitability];
    if (multiplier === undefined) {
      throw new MatchTacticsCalibrationError(
        "incomplete_coordination_multipliers",
        `Match-tactics calibration has no coordination multiplier for ${suitability}`,
      );
    }
    if (!Number.isSafeInteger(multiplier) || multiplier <= 0 || multiplier >= previous) {
      throw new MatchTacticsCalibrationError(
        "invalid_coordination_multipliers",
        `Coordination multipliers must strictly decrease from natural and stay positive: ${suitability} is ${multiplier}`,
      );
    }
    previous = multiplier;
  }

  if (multipliers.natural !== 10_000) {
    throw new MatchTacticsCalibrationError(
      "invalid_coordination_multipliers",
      `Playing a man in his own position is the neutral reference: natural must be 10000, not ${multipliers.natural}`,
    );
  }
}

function validateSaturationReferences(
  references: Readonly<Record<TacticalShapeTask, number>>,
): void {
  for (const task of TACTICAL_SHAPE_TASKS) {
    const reference = references[task];
    if (reference === undefined) {
      throw new MatchTacticsCalibrationError(
        "incomplete_saturation_references",
        `Match-tactics calibration has no saturation reference for ${task}`,
      );
    }
    if (!Number.isSafeInteger(reference) || reference <= 0) {
      throw new MatchTacticsCalibrationError(
        "invalid_saturation_reference",
        `Saturation reference must be a positive integer in thousandths for ${task}: ${reference}`,
      );
    }
  }
}
