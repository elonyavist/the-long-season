import {
  NEUTRAL_TACTIC_MENTALITY,
  TACTIC_MENTALITIES,
  type TacticMentalityKey,
} from "../entities/tactic.entity.ts";
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

/**
 * Reports whether an unknown value is a supported tactical route.
 *
 * A persisted shot carries its route as an open string. Casting that string
 * into the union would let a corrupt row claim a route the engine never
 * produced, and every reader downstream would believe it.
 *
 * @example
 * if (!isTacticalRoute(value)) throw new Error(`unsupported route: ${value}`);
 */
export function isTacticalRoute(value: unknown): value is TacticalRoute {
  return typeof value === "string" && (TACTICAL_ROUTES as readonly string[]).includes(value);
}

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
 * One numeric tactic instruction a manager sets on the `0..1` scale.
 *
 * `mentality` is deliberately absent: it is a five-step ladder rather than a
 * dial, and it is the only input that reads score and minute state, so it is
 * modelled separately below.
 */
export type TacticKnob = "directness" | "pressing" | "width" | "risk";

/** Deterministic knob order used by reports, validation, and tie-breakers. */
export const TACTIC_KNOBS = [
  "directness",
  "pressing",
  "width",
  "risk",
] as const satisfies readonly TacticKnob[];

/**
 * The routes a knob at full intensity makes a side prefer.
 *
 * This is football vocabulary, so it is typed code rather than content, exactly
 * as `TACTICAL_ROUTE_DEFINITION` is: content decides how strongly a preference
 * bites, never which route a manager instruction is about.
 *
 * `risk` favours nothing. It is about how often a side commits to an attempt
 * and what that costs, not about where the ball goes - so giving it a route
 * would be inventing football the contract does not describe.
 */
export const TACTIC_KNOB_FAVOURED_ROUTES = {
  directness: ["direct"],
  pressing: ["transition"],
  width: ["left", "right"],
  risk: [],
} as const satisfies Readonly<Record<TacticKnob, readonly TacticalRoute[]>>;

/**
 * The route a knob at full intensity hands the opponent.
 *
 * Every knob has one, and validation refuses a calibration that prices any of
 * them at zero. That is the contract's "no tactic input is a universal bonus"
 * turned into something a test can fail on.
 *
 * A knob may never expose a route it also favours: that would make its cost and
 * its benefit the same thing, which is a free bonus wearing a disguise.
 *
 * Directness and pressing are deliberate mirror images. Playing long gives the
 * ball back higher up, so it invites the counter; pressing pushes the line up,
 * and the way a side beats a high line is to go over it. Each of them hands the
 * opponent the other one's favourite route.
 */
export const TACTIC_KNOB_EXPOSED_ROUTE = {
  directness: "transition",
  pressing: "direct",
  width: "central",
  risk: "transition",
} as const satisfies Readonly<Record<TacticKnob, TacticalRoute>>;

/** Which way a knob moves the side's share of the possession contest. */
export type TacticKnobControlDirection = "increase" | "decrease";

/**
 * Whether a knob helps or hurts a side's hold on the ball.
 *
 * Football vocabulary, so it is typed code for the same reason
 * `TACTIC_KNOB_EXPOSED_ROUTE` is: content owns how hard an instruction bites,
 * never which way it bites. Splitting the sign out is what keeps the magnitude a
 * plain `0..10000` share, so it passes the same validator every other tactic
 * magnitude passes instead of needing a signed field nothing else has.
 *
 * The football: winning the ball back high up, committing more players, and
 * stretching the pitch all mean a side spends more of the match on the ball.
 * Playing long is the one that gives it away - the ball is contested in the air
 * or behind the defence rather than kept at the feet of the side that hit it.
 */
export const TACTIC_KNOB_CONTROL_DIRECTION = {
  directness: "decrease",
  pressing: "increase",
  width: "increase",
  risk: "increase",
} as const satisfies Readonly<Record<TacticKnob, TacticKnobControlDirection>>;

/**
 * Versioned magnitudes for what the five manager tactic inputs do.
 *
 * Content owns only how far each instruction may move things. Which route each
 * instruction is about, and which route it hands over in exchange, are the two
 * typed mappings above.
 */
export interface TacticalSemanticsCalibrationConfig {
  /**
   * How far a knob at its cap tilts the weight of the routes it favours.
   *
   * Must be zero for a knob that favours no route and positive for one that
   * does, so the numbers cannot quietly disagree with the football.
   */
  readonly routeAffinityBasisPointsByKnob: Readonly<Record<TacticKnob, number>>;
  /** How far a knob at its cap moves this side's own chance volume. */
  readonly volumeBasisPointsByKnob: Readonly<Record<TacticKnob, number>>;
  /**
   * How far a knob at its cap raises the route it hands the opponent.
   *
   * Every knob must price this above zero. A knob that exposes nothing is a
   * free bonus, which the design contract forbids outright.
   */
  readonly exposureBasisPointsByKnob: Readonly<Record<TacticKnob, number>>;
  /**
   * How far a knob at its cap moves this side's share of the possession
   * contest, as an unsigned magnitude.
   *
   * `TACTIC_KNOB_CONTROL_DIRECTION` owns whether that movement is up or down,
   * so content never writes a sign. Every knob must price this above zero: a
   * knob declared to move control by nothing is a direction that describes no
   * football, which is the same defect a zero exposure is.
   */
  readonly controlBasisPointsByKnob: Readonly<Record<TacticKnob, number>>;
  /**
   * Commitment multiplier per mentality, on the ladder's own order.
   *
   * `balanced` is exactly `10000`: committing to neither is the neutral
   * reference, never a bonus. The ladder must be strictly increasing, because a
   * mentality that is not more committed than the one below it is not a step.
   */
  readonly commitmentBasisPointsByMentality: Readonly<Record<TacticMentalityKey, number>>;
  /**
   * How far one goal of deficit bends commitment, in basis points.
   *
   * A side that is losing pushes and a side that is ahead protects. This is the
   * only place score state enters the tactic model, and its effect is capped so
   * a rout cannot turn into an unbounded siege.
   */
  readonly scoreStateCommitmentBasisPoints: number;
  /**
   * How much of possession control comes from shape rather than department
   * strength, in basis points.
   *
   * Must be positive. At zero, control is department strength alone, which is
   * the defect this phase exists to remove: an empty midfield department would
   * again be the only way to express a broken connection.
   */
  readonly shapeControlShareBasisPoints: number;
  /**
   * How far the route actually taken moves the quality of the chance it made,
   * in basis points, measured from an even contest.
   *
   * Must be positive. At zero the route decides only *whether* a chance exists
   * and what type it is, never how good it is - and then two equal-quality
   * elevens produce chances of identical quality whatever shape they take, so
   * structure can only ever separate them on volume. That is measurable: with
   * this at zero the best composition beat a coherent `4-4-2` by `0.0288` win
   * share, inside the `0.0477` measurement noise floor, and the frozen
   * asymmetry invariant had nothing to divide by.
   */
  readonly routeQualityBiasBasisPoints: number;
  /**
   * How decisively a side goes to the routes it is strong on.
   *
   * Selection weights are capacity raised to this power. At `1` a side spreads
   * itself in proportion to capacity, and because capacity is a bounded share
   * that lands in a narrow band, that means attacking down its worst route
   * almost as often as its best - `18%` against `23%` for a coherent shape.
   * Above `1` the split widens and a specialised shape actually uses its
   * specialty.
   *
   * A small positive integer, not a basis-point share: the engine applies it by
   * repeated multiplication because a fractional exponent is a transcendental
   * and the hot path may not use one. Bounded above because a side that ignores
   * four of its five ways through is not playing football either.
   */
  readonly routeSelectionSharpness: number;
}

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
   * Tactical budget every outfield role must allocate across the ten tasks.
   *
   * The budget is authored once and every outfield row must sum to it exactly.
   * A formation may therefore move football between tasks, but a role cannot
   * create more total football merely by having a larger row.
   */
  readonly outfieldRoleBudgetBasisPoints: number;
  /**
   * Allocation of one full-quality player in one role to one task, in basis
   * points. `10000` means "a whole unit of this task per point of role score".
   *
   * The goalkeeper row is all zeros: shape is a property of the outfield ten,
   * and goalkeeper quality already has its own owner in `TeamStrength`.
   */
  readonly taskAllocationBasisPointsByRole: Readonly<
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
  readonly tacticalSemantics: TacticalSemanticsCalibrationConfig;
}

/** Stable validation failures for the match-tactics calibration asset. */
export type MatchTacticsCalibrationErrorCode =
  | "invalid_schema_version"
  | "invalid_version"
  | "invalid_classification"
  | "incomplete_contribution_weights"
  | "negative_contribution_weight"
  | "invalid_outfield_role_budget"
  | "outfield_role_budget_not_conserved"
  | "goalkeeper_is_not_isolated"
  | "outfield_role_leaves_task_empty"
  | "invalid_marginal_contribution_ladder"
  | "invalid_channel_policy"
  | "incomplete_saturation_references"
  | "invalid_saturation_reference"
  | "invalid_chain_bottleneck_weight"
  | "invalid_pressing_contest_weight"
  | "incomplete_tactic_knob_magnitudes"
  | "invalid_route_affinity"
  | "knob_without_a_cost"
  | "invalid_volume_magnitude"
  | "invalid_control_magnitude"
  | "incomplete_commitment_ladder"
  | "invalid_commitment_ladder"
  | "invalid_score_state_commitment"
  | "invalid_shape_control_share"
  | "invalid_route_quality_bias"
  | "invalid_route_selection_sharpness"
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
 * The first four were declared in Phase 81 before any coefficient was written;
 * conservation was added by Phase 81A Step 04 after the real-career audit
 * measured role totals ranging from `33100` to `52300`.
 *
 * 1. **Conserved outfield budget.** Every outfield role allocates the same
 *    exact total, so buying one task necessarily spends less elsewhere.
 * 2. **Non-negative allocations.** A player never makes his own team worse at
 *    a task by being on the pitch.
 * 3. **Strictly decreasing marginal contribution.** The nth contributor to one
 *    task is worth strictly less than the (n-1)th, and still strictly more
 *    than nothing. Strictly positive is what makes an extra body always a
 *    small gain rather than a silent loss.
 * 4. **Bounded capacities.** Every capacity lands in `[0, 1)` for every legal
 *    lineup, with no clamp that can be hit and no unbounded multiplier.
 * 5. **Left/right mirror symmetry.** Mirroring a lineup mirrors its profile
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
  validateTacticalSemanticsCalibration(config.tacticalSemantics);
}

/**
 * Validates the tactic-semantics section on its own.
 *
 * Two rules carry the football and the rest are bounds:
 *
 * 1. **Route affinity must agree with the typed mapping.** A knob that favours
 *    routes must price that preference above zero, and a knob that favours none
 *    must price it at exactly zero. Otherwise the numbers and the football
 *    could describe different games.
 * 2. **Every knob must cost something.** The design contract says no tactic
 *    input is a universal bonus, so a zero exposure is refused rather than
 *    trusted to a reviewer noticing it.
 * 3. **Every knob must price the control direction it is declared to have.**
 *    `TACTIC_KNOB_CONTROL_DIRECTION` says pressing wins the ball back and
 *    playing long gives it away; a zero magnitude would leave that football
 *    written down and never applied, which is the same disagreement rule 1
 *    catches on the route side.
 *
 * The commitment ladder is validated the way the suitability ladder is: it
 * walks `TACTIC_MENTALITIES` instead of restating which mentality outranks
 * which, and the neutral step is pinned to `10000` so it can never become a
 * quiet bonus.
 */
export function validateTacticalSemanticsCalibration(config: TacticalSemanticsCalibrationConfig): void {
  for (const knob of TACTIC_KNOBS) {
    const affinity = config.routeAffinityBasisPointsByKnob[knob];
    const volume = config.volumeBasisPointsByKnob[knob];
    const exposure = config.exposureBasisPointsByKnob[knob];
    const control = config.controlBasisPointsByKnob[knob];

    if (
      affinity === undefined
      || volume === undefined
      || exposure === undefined
      || control === undefined
    ) {
      throw new MatchTacticsCalibrationError(
        "incomplete_tactic_knob_magnitudes",
        `Tactic semantics must declare affinity, volume, exposure, and control for ${knob}`,
      );
    }

    const favoursRoutes = TACTIC_KNOB_FAVOURED_ROUTES[knob].length > 0;
    if (!isBasisPointShare(affinity) || (favoursRoutes ? affinity === 0 : affinity !== 0)) {
      throw new MatchTacticsCalibrationError(
        "invalid_route_affinity",
        favoursRoutes
          ? `${knob} favours a route, so its affinity must be a positive share: ${affinity}`
          : `${knob} favours no route, so its affinity must be exactly 0: ${affinity}`,
      );
    }

    if (!isBasisPointShare(volume)) {
      throw new MatchTacticsCalibrationError(
        "invalid_volume_magnitude",
        `${knob} volume magnitude must be an integer between 0 and 10000 basis points: ${volume}`,
      );
    }

    if (!isBasisPointShare(exposure) || exposure === 0) {
      throw new MatchTacticsCalibrationError(
        "knob_without_a_cost",
        `${knob} must hand the opponent something: exposure cannot be ${exposure}`,
      );
    }

    if (!isBasisPointShare(control) || control === 0) {
      throw new MatchTacticsCalibrationError(
        "invalid_control_magnitude",
        `${knob} is declared to ${TACTIC_KNOB_CONTROL_DIRECTION[knob]} control, so it must price it: ${control}`,
      );
    }
  }

  let previousCommitment = Number.NEGATIVE_INFINITY;
  for (const mentality of TACTIC_MENTALITIES) {
    const commitment = config.commitmentBasisPointsByMentality[mentality];
    if (commitment === undefined) {
      throw new MatchTacticsCalibrationError(
        "incomplete_commitment_ladder",
        `Tactic semantics must declare a commitment for ${mentality}`,
      );
    }
    if (!Number.isSafeInteger(commitment) || commitment <= 0 || commitment <= previousCommitment) {
      throw new MatchTacticsCalibrationError(
        "invalid_commitment_ladder",
        `Commitment must be a positive integer strictly above the previous mentality: ${mentality} is ${commitment}`,
      );
    }
    previousCommitment = commitment;
  }

  if (config.commitmentBasisPointsByMentality[NEUTRAL_TACTIC_MENTALITY] !== 10_000) {
    throw new MatchTacticsCalibrationError(
      "invalid_commitment_ladder",
      `${NEUTRAL_TACTIC_MENTALITY} must sit at exactly 10000 basis points, never at a bonus`,
    );
  }

  if (!isBasisPointShare(config.scoreStateCommitmentBasisPoints)) {
    throw new MatchTacticsCalibrationError(
      "invalid_score_state_commitment",
      `Score-state commitment must be an integer between 0 and 10000 basis points: ${config.scoreStateCommitmentBasisPoints}`,
    );
  }

  const shapeControlShare = config.shapeControlShareBasisPoints;
  if (!isBasisPointShare(shapeControlShare) || shapeControlShare === 0) {
    throw new MatchTacticsCalibrationError(
      "invalid_shape_control_share",
      `Shape must decide some of possession control, or an empty department is again the only broken connection: ${shapeControlShare}`,
    );
  }

  const routeQualityBias = config.routeQualityBiasBasisPoints;
  if (!isBasisPointShare(routeQualityBias) || routeQualityBias === 0) {
    throw new MatchTacticsCalibrationError(
      "invalid_route_quality_bias",
      `The route taken must change how good the chance is, or shape separates on volume alone: ${routeQualityBias}`,
    );
  }

  const sharpness = config.routeSelectionSharpness;
  if (
    !Number.isSafeInteger(sharpness)
    || sharpness < MINIMUM_ROUTE_SELECTION_SHARPNESS
    || sharpness > MAXIMUM_ROUTE_SELECTION_SHARPNESS
  ) {
    throw new MatchTacticsCalibrationError(
      "invalid_route_selection_sharpness",
      `Route selection sharpness must be an integer between ${MINIMUM_ROUTE_SELECTION_SHARPNESS} and ${MAXIMUM_ROUTE_SELECTION_SHARPNESS}: ${sharpness}`,
    );
  }
}

/** Proportional selection: a side spreads itself exactly by capacity. */
const MINIMUM_ROUTE_SELECTION_SHARPNESS = 1;

/**
 * Hardest a side may commit to its best ways through.
 *
 * Above this, the two weakest routes stop being played at all, and a side that
 * never tries four of its five options cannot be surprised, pressed off one
 * route, or forced into a plan B - all of which the route model exists to
 * express.
 */
const MAXIMUM_ROUTE_SELECTION_SHARPNESS = 4;

/** Whether a value is an integer share of the `0..10000` basis-point scale. */
function isBasisPointShare(value: number): boolean {
  return Number.isSafeInteger(value) && value >= 0 && value <= 10_000;
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
  validateContributionAllocations(
    config.outfieldRoleBudgetBasisPoints,
    config.taskAllocationBasisPointsByRole,
  );
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
export const MATCH_TACTICS_CALIBRATION_SCHEMA_VERSION = 2;

/**
 * Derives the exact budget allocated by one role row.
 *
 * The total is never stored beside the row. Validation, diagnostics and tests
 * share this ordered derivation so a second summation cannot drift from the
 * rule that accepts the asset.
 */
export function tacticalRoleAllocationTotal(
  allocations: Readonly<Record<TacticalShapeTask, number>>,
): number {
  let total = 0;
  for (const task of TACTICAL_SHAPE_TASKS) {
    total += allocations[task];
  }
  return total;
}

function validateContributionAllocations(
  outfieldRoleBudgetBasisPoints: number,
  allocationsByRole: Readonly<
    Record<CanonicalPlayerRole, Readonly<Record<TacticalShapeTask, number>>>
  >,
): void {
  if (!Number.isSafeInteger(outfieldRoleBudgetBasisPoints) || outfieldRoleBudgetBasisPoints <= 0) {
    throw new MatchTacticsCalibrationError(
      "invalid_outfield_role_budget",
      `Outfield tactical budget must be a positive safe integer: ${outfieldRoleBudgetBasisPoints}`,
    );
  }

  for (const role of CANONICAL_PLAYER_ROLES) {
    const taskAllocations = allocationsByRole[role];
    if (taskAllocations === undefined) {
      throw new MatchTacticsCalibrationError(
        "incomplete_contribution_weights",
        `Match-tactics calibration has no task allocations for ${role}`,
      );
    }

    for (const task of TACTICAL_SHAPE_TASKS) {
      const allocation = taskAllocations[task];
      if (allocation === undefined) {
        throw new MatchTacticsCalibrationError(
          "incomplete_contribution_weights",
          `Match-tactics calibration has no ${task} allocation for ${role}`,
        );
      }
      if (!Number.isSafeInteger(allocation) || allocation < 0) {
        throw new MatchTacticsCalibrationError(
          "negative_contribution_weight",
          `Task allocation must be a non-negative integer for ${role}.${task}: ${allocation}`,
        );
      }
      if (role === "goalkeeper" && allocation !== 0) {
        throw new MatchTacticsCalibrationError(
          "goalkeeper_is_not_isolated",
          `Goalkeeper must not contribute to intrinsic shape: ${task} is ${allocation}`,
        );
      }
      if (role !== "goalkeeper" && allocation === 0) {
        throw new MatchTacticsCalibrationError(
          "outfield_role_leaves_task_empty",
          `Every outfield role must contribute to every task, so no legal lineup empties one: ${role}.${task}`,
        );
      }
    }

    const allocated = tacticalRoleAllocationTotal(taskAllocations);
    if (!Number.isSafeInteger(allocated)) {
      throw new MatchTacticsCalibrationError(
        "outfield_role_budget_not_conserved",
        `Task allocations overflow the safe integer range for ${role}: ${allocated}`,
      );
    }
    if (role !== "goalkeeper" && allocated !== outfieldRoleBudgetBasisPoints) {
      throw new MatchTacticsCalibrationError(
        "outfield_role_budget_not_conserved",
        `Outfield role ${role} allocates ${allocated}, expected ${outfieldRoleBudgetBasisPoints}`,
      );
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
