import {
  LATERAL_FOCUS_EXPOSED_ROUTE,
  LATERAL_FOCUS_ROUTE,
  TACTIC_KNOB_CONTROL_DIRECTION,
  TACTIC_KNOB_EXPOSED_ROUTE,
  TACTIC_KNOB_FAVOURED_ROUTES,
  TACTIC_KNOBS,
  TACTICAL_ROUTES,
  type MatchTacticsCalibrationConfig,
  type LateralFocus,
  type ShotChanceType,
  type TacticKnob,
  type TacticalRoute,
  type TacticalShapeCapacity,
} from "@game/domain";
import type { Rng } from "@game/shared";

import type { MatchTacticalDistributionInput } from "./match-context.ts";
import type { TacticalDistributionCaps } from "./match-engine-config.ts";
import { deriveTacticalMatchup } from "./tactical-matchup.ts";
import type { TacticalShapeProfile } from "./tactical-shape.ts";

/**
 * Irreducible facts for one route before saturation and selection are derived.
 *
 * Allocation and resistance must remain separate: their ratio is derivable,
 * while the two inputs say whether a route failed because the side starved it
 * or because the opponent genuinely closed it.
 */
export interface OpportunityRouteContest {
  /** Conserved amount of the side's available route-chain budget. */
  readonly allocation: number;
  /** Opponent chain standing in the way before connected exposure acts. */
  readonly resistance: number;
  /** Signed space handed over by the opponent's commitments. */
  readonly exposure: number;
  /** Own phase that limited the route before allocation. */
  readonly bottleneck: TacticalShapeCapacity;
}

/**
 * How one side intends to attack this minute, and what that costs it.
 *
 * A plan is a pure function of the two shapes, the two tactic setups, both
 * lateral instructions and the score. It is rebuilt each minute rather than
 * carried in state, because any one of those inputs can change at a minute
 * boundary and a cached plan would quietly describe football that is gone.
 */
export interface OpportunityRoutePlan {
  /** Calibration version both shapes were derived under. */
  readonly policyVersion: string;
  /** Match-time lateral instruction; durable ownership arrives in Step 14. */
  readonly lateralFocus: LateralFocus;
  /** Irreducible allocation, resistance and exposure facts per route. */
  readonly contestByRoute: Readonly<Record<TacticalRoute, OpportunityRouteContest>>;
  /** Bounded multiplier on this side's per-minute opportunity rate. */
  readonly volumeMultiplier: number;
  /**
   * Tactical/shape multiplier applied to the midfield's possession claim.
   * Match state still owns condition, venue, score pressure and dismissals.
   */
  readonly controlMultiplier: number;
  /** Relief direct play receives when this side has less of the ball. */
  readonly counterOpportunityRelief: number;
  /** Integer power used when derived route saturations become selection weights. */
  readonly routeSelectionSharpness: number;
  /** Magnitude that turns route saturation into a chance-quality edge. */
  readonly routeQualityBias: number;
}

/** Input for planning one side's minute. */
export interface DeriveOpportunityRoutePlanInput {
  /** Intrinsic shape of the side being planned for. */
  readonly own: TacticalShapeProfile;
  /** Intrinsic shape of the opponent. */
  readonly opponent: TacticalShapeProfile;
  /** Tactic setup of the side being planned for. */
  readonly ownTactics: MatchTacticalDistributionInput;
  /** Tactic setup of the opponent, which decides what this side is handed. */
  readonly opponentTactics: MatchTacticalDistributionInput;
  /** Which flank this side commits to for this minute. */
  readonly lateralFocus: LateralFocus;
  /** Opponent's commitment, which decides the connected flank exposed here. */
  readonly opponentLateralFocus: LateralFocus;
  /** Caps used to read each knob as an intensity in `0..1`. */
  readonly caps: TacticalDistributionCaps;
  /** Versioned calibration supplied by the caller. */
  readonly calibration: MatchTacticsCalibrationConfig;
  /** Goals scored minus goals conceded, from this side's point of view. */
  readonly goalDifference: number;
}

/**
 * The chance type each route produces.
 *
 * Total and typed, so a new route is a build failure rather than a silent
 * `open_play`. This mapping is what replaced the old texture inference: a cross
 * is now a cross because the ball went down a flank, not because a minute
 * number happened to be divisible by three.
 */
export const OPPORTUNITY_ROUTE_CHANCE_TYPE = {
  central: "open_play",
  left: "cross",
  right: "cross",
  direct: "open_play",
  transition: "counter",
} as const satisfies Readonly<Record<TacticalRoute, ShotChanceType>>;

/** Error categories exposed by opportunity-route planning. */
export type OpportunityRouteErrorCode = "mismatched_policy_version";

/**
 * Typed error thrown when a route plan cannot be trusted.
 *
 * @example
 * if (error instanceof OpportunityRouteError) {
 *   // Two shapes were derived under different calibrations.
 * }
 */
export class OpportunityRouteError extends Error {
  /** Machine-readable failure reason. */
  public readonly code: OpportunityRouteErrorCode;

  /** Creates an opportunity-route error. */
  public constructor(code: OpportunityRouteErrorCode, message: string) {
    super(message);
    this.name = "OpportunityRouteError";
    this.code = code;
  }
}

/**
 * Plans how one side will try to create a chance this minute.
 *
 * Four football ideas, in order:
 *
 * 1. **Pressing acts once, before anything else.** The opponent's pressing knob
 *    scales its own `pressing_cohesion` before the matchup runs, and the
 *    matchup is the only place that capacity contests build-up. Pressing is
 *    never multiplied a second time afterwards, which is what keeps a press
 *    from paying twice for one instruction.
 * 2. **A knob reallocates towards the routes it is about.** Directness buys the
 *    long ball, width buys both flanks, pressing buys transition - and the one
 *    common scale takes the same amount out of the other routes. Risk favours
 *    none: it is about how often a side commits, not where it goes.
 * 3. **A knob hands the opponent exactly one route.** Playing long invites the
 *    counter; pressing invites the ball over the top; going wide opens the
 *    middle. This is the same magnitude arriving from the *other* side's
 *    setup, so an aggressive opponent is felt as a real opened route rather
 *    than as an invisible penalty.
 * 4. **Commitment decides how often, not where.** Mentality and score state
 *    scale volume alone. A side chasing a goal attacks more often; it does not
 *    suddenly discover a flank it did not have.
 *
 * Lateral focus uses its own authored magnitude to move budget from one flank
 * to the other. Width spreads a whole team; focus commits that width to a side,
 * and B2.1 proved that treating those as one magnitude made focus inert.
 * Weights derive from the resulting saturations, so a side with one open
 * route uses it and a side with five equal routes spreads across them. Nothing
 * here consumes randomness: selection is a separate, explicit step.
 *
 * @example
 * const plan = deriveOpportunityRoutePlan({ own, opponent, ownTactics, opponentTactics, lateralFocus: "left", opponentLateralFocus: "balanced", caps, calibration, goalDifference: 0 });
 * opportunityRouteWeights(plan).left; // how much this side wants the left flank
 */
export function deriveOpportunityRoutePlan(input: DeriveOpportunityRoutePlanInput): OpportunityRoutePlan {
  const {
    own,
    opponent,
    ownTactics,
    opponentTactics,
    lateralFocus,
    opponentLateralFocus,
    caps,
    calibration,
  } = input;

  if (own.policyVersion !== opponent.policyVersion) {
    throw new OpportunityRouteError(
      "mismatched_policy_version",
      `Both shapes must come from one calibration: ${own.policyVersion} against ${opponent.policyVersion}`,
    );
  }

  const semantics = calibration.tacticalSemantics;
  const matchup = deriveTacticalMatchup({
    own,
    opponent: withPressingIntensity(opponent, lean(opponentTactics, caps, "pressing")),
    calibration,
  });

  const routeBias = {} as Record<TacticalRoute, number>;
  const baseAllocation = {} as Record<TacticalRoute, number>;
  for (const route of TACTICAL_ROUTES) {
    baseAllocation[route] = matchup.routes[route].ownChain;
    let bias = 0;

    for (const knob of TACTIC_KNOBS) {
      const favoured: readonly TacticalRoute[] = TACTIC_KNOB_FAVOURED_ROUTES[knob];
      if (favoured.includes(route)) {
        bias += share(semantics.routeAffinityBasisPointsByKnob[knob]) * lean(ownTactics, caps, knob);
      }
    }

    const focusRoute = LATERAL_FOCUS_ROUTE[lateralFocus];
    const abandonedRoute = LATERAL_FOCUS_EXPOSED_ROUTE[lateralFocus];
    const focusMagnitude = share(semantics.lateralFocusAffinityBasisPoints);
    if (focusRoute === route) bias += focusMagnitude;
    if (abandonedRoute === route) bias -= focusMagnitude;
    routeBias[route] = bias;
  }

  const allocationByRoute = conserveRouteBudget(baseAllocation, routeBias);
  const contestByRoute = {} as Record<TacticalRoute, OpportunityRouteContest>;
  for (const route of TACTICAL_ROUTES) {
    let exposure = 0;
    for (const knob of TACTIC_KNOBS) {
      if (TACTIC_KNOB_EXPOSED_ROUTE[knob] === route) {
        exposure += share(semantics.exposureBasisPointsByKnob[knob]) * lean(opponentTactics, caps, knob);
      }
    }

    if (LATERAL_FOCUS_EXPOSED_ROUTE[opponentLateralFocus] === route) {
      exposure += share(semantics.exposureBasisPointsByKnob.width);
    }

    contestByRoute[route] = {
      allocation: allocationByRoute[route],
      resistance: matchup.routes[route].opponentResistance,
      exposure,
      bottleneck: matchup.routes[route].bottleneck,
    };
  }

  return {
    policyVersion: own.policyVersion,
    lateralFocus,
    contestByRoute,
    volumeMultiplier: deriveVolumeMultiplier(input, semantics),
    controlMultiplier: derivePlanControlMultiplier(input, allocationByRoute),
    counterOpportunityRelief: knobIntensity(ownTactics, caps, "directness") * COUNTER_RELIEF_AT_FULL_DIRECTNESS,
    routeSelectionSharpness: semantics.routeSelectionSharpness,
    routeQualityBias: share(semantics.routeQualityBiasBasisPoints),
  };
}

/** Derives how much of one route's allocation survives its resistance. */
export function opportunityRouteSaturation(plan: OpportunityRoutePlan, route: TacticalRoute): number {
  const contest = plan.contestByRoute[route];
  const exposedAllocation = Math.max(0, contest.allocation * (1 + contest.exposure));
  const total = exposedAllocation + contest.resistance;

  return total === 0 ? 0 : exposedAllocation / total;
}

/** Derives the complete route-selection distribution without storing a copy. */
export function opportunityRouteWeights(
  plan: OpportunityRoutePlan,
): Readonly<Record<TacticalRoute, number>> {
  const saturationByRoute = {} as Record<TacticalRoute, number>;
  for (const route of TACTICAL_ROUTES) {
    saturationByRoute[route] = opportunityRouteSaturation(plan, route);
  }

  return normalizedWeights(saturationByRoute, plan.routeSelectionSharpness);
}

/** Tactical quality edge already settled before an occasion chooses actors. */
export function opportunityRouteQualityEdge(plan: OpportunityRoutePlan, route: TacticalRoute): number {
  return (opportunityRouteSaturation(plan, route) - EVEN_CONTEST_ROUTE_CAPACITY) * plan.routeQualityBias;
}

/** Exact route-chain budget available before opponent exposure acts. */
export function opportunityRouteBudget(plan: OpportunityRoutePlan): number {
  let total = 0;
  for (const route of TACTICAL_ROUTES) total += plan.contestByRoute[route].allocation;
  return total;
}

/**
 * Complete basis-point signature consumed by structural analysis.
 *
 * The encoding is ordered, versioned and outcome-blind. Every dimensionless
 * numeric fact is rounded once to one basis point; categorical bottlenecks use
 * their stable keys. It deliberately does not read a win share, response ID or
 * catalog order, so equivalent grouping cannot become post-output tuning.
 */
export function opportunityRouteStrategicSignature(plan: OpportunityRoutePlan): string {
  const weights = opportunityRouteWeights(plan);
  const fields: string[] = [STRATEGIC_SIGNATURE_VERSION, plan.policyVersion];
  for (const route of TACTICAL_ROUTES) {
    const contest = plan.contestByRoute[route];
    fields.push(
      route,
      fixedPointBasisPoints(contest.allocation),
      fixedPointBasisPoints(contest.resistance),
      fixedPointBasisPoints(contest.exposure),
      fixedPointBasisPoints(opportunityRouteSaturation(plan, route)),
      fixedPointBasisPoints(weights[route]),
      fixedPointBasisPoints(opportunityRouteQualityEdge(plan, route)),
      contest.bottleneck,
    );
  }
  fields.push(
    fixedPointBasisPoints(opportunityRouteBudget(plan)),
    fixedPointBasisPoints(plan.volumeMultiplier),
    fixedPointBasisPoints(plan.controlMultiplier),
    fixedPointBasisPoints(plan.counterOpportunityRelief),
    String(plan.routeSelectionSharpness),
    fixedPointBasisPoints(plan.routeQualityBias),
  );

  return fields.join("|");
}

/**
 * The route saturation this plan will produce on average.
 *
 * Every route is weighted by how often the plan actually takes it, so this is
 * "how good the way through you will really use is" rather than the maximum
 * route a lopsided shape happens to own.
 */
export function expectedRouteSaturation(plan: OpportunityRoutePlan): number {
  const weights = opportunityRouteWeights(plan);
  let total = 0;
  for (const route of TACTICAL_ROUTES) {
    total += opportunityRouteSaturation(plan, route) * weights[route];
  }

  return total;
}

/**
 * Picks this minute's route from the plan's weights.
 *
 * Walks `TACTICAL_ROUTES` in its declared order and consumes exactly one float,
 * so the same seed and the same plan always produce the same route regardless
 * of which side, minute, or fixture is being resolved first.
 *
 * @example
 * const route = selectOpportunityRoute(plan, rng);
 */
export function selectOpportunityRoute(plan: OpportunityRoutePlan, rng: Rng): TacticalRoute {
  const roll = rng.nextFloat();
  const weights = opportunityRouteWeights(plan);
  let cumulative = 0;

  for (const route of TACTICAL_ROUTES) {
    cumulative += weights[route];
    if (roll < cumulative) return route;
  }

  // Floating-point accumulation can leave the last slice a hair short of one.
  // Falling through means the roll landed inside that gap, which belongs to the
  // final route rather than to nothing.
  return TACTICAL_ROUTES[TACTICAL_ROUTES.length - 1] as TacticalRoute;
}

/**
 * Returns the opponent's shape with its press scaled by its own instruction.
 *
 * Pressing intensity multiplies `pressing_cohesion` rather than being added to
 * the matchup, so an incoherent side that is told to press hard still presses
 * badly. That is the contract's "only when shape is coherent" made structural
 * instead of promised.
 */
function withPressingIntensity(shape: TacticalShapeProfile, pressingLean: number): TacticalShapeProfile {
  return {
    policyVersion: shape.policyVersion,
    capacities: {
      ...shape.capacities,
      pressing_cohesion: clamp(shape.capacities.pressing_cohesion * (1 + pressingLean), 0, 1),
    },
  };
}

/**
 * Derives how often this side commits to an attempt, relative to the baseline.
 *
 * Two different ideas, deliberately kept apart:
 *
 * 1. **How open the match is, decided by both managers.** A knob that changes
 *    where the ball goes changes the game both sides are playing, so its volume
 *    magnitude reads both leans: a long, pressed, stretched match has more
 *    football in it for everybody, and a deep, narrow, patient one has less.
 *    Reading only the mover's own lean makes a low block concede *more* than
 *    playing neutral - measured at `13.96` chances against `12.86` - because it
 *    surrenders a fifth of its own attempts and takes nothing off the opponent.
 *    That is the opposite of what parking the bus is for.
 * 2. **How much this side commits, decided by this manager alone.** A knob with
 *    no route preference is not shaping the game, only deciding how many
 *    players go forward, so it is one-sided - which is why `risk` sits here and
 *    not above, and why it is the same kind of instruction as mentality.
 *    Mentality and score state join it: a team chasing a goal attacks more, and
 *    that is not something its opponent agreed to. Score state is capped at a
 *    two-goal swing, so a rout bends commitment once and stops.
 *
 * The split is read from `TACTIC_KNOB_FAVOURED_ROUTES` rather than declared a
 * second time, because "does this instruction change where the ball goes" is
 * already written there and two copies of it could disagree.
 */
function deriveVolumeMultiplier(
  input: DeriveOpportunityRoutePlanInput,
  semantics: MatchTacticsCalibrationConfig["tacticalSemantics"],
): number {
  let volume = 1;
  for (const knob of TACTIC_KNOBS) {
    const magnitude = share(semantics.volumeBasisPointsByKnob[knob]);
    const shapesTheGame = TACTIC_KNOB_FAVOURED_ROUTES[knob].length > 0;
    volume += magnitude * lean(input.ownTactics, input.caps, knob);
    if (shapesTheGame) volume += magnitude * lean(input.opponentTactics, input.caps, knob);
  }

  const commitment = share(semantics.commitmentBasisPointsByMentality[input.ownTactics.mentality]);
  const chase = clamp(-input.goalDifference, -SCORE_STATE_GOAL_CAP, SCORE_STATE_GOAL_CAP);
  const scoreState = 1 + share(semantics.scoreStateCommitmentBasisPoints) * chase;

  return clamp(volume * commitment * scoreState, MIN_VOLUME_MULTIPLIER, MAX_VOLUME_MULTIPLIER);
}

/**
 * Reallocates an existing route-chain budget without creating any new one.
 *
 * Bias changes relative emphasis first; one common scale then returns the sum
 * to the incoming budget. The final declared route receives the floating-point
 * remainder, which makes conservation exact in the arithmetic the engine
 * actually executes. `transition` is its own mirror, so this remainder owner
 * cannot introduce a left/right preference.
 */
function conserveRouteBudget(
  baseAllocation: Readonly<Record<TacticalRoute, number>>,
  biasByRoute: Readonly<Record<TacticalRoute, number>>,
): Readonly<Record<TacticalRoute, number>> {
  let budget = 0;
  let biasedTotal = 0;
  const biased = {} as Record<TacticalRoute, number>;
  for (const route of TACTICAL_ROUTES) {
    const allocation = baseAllocation[route];
    const candidate = Math.max(0, allocation * (1 + biasByRoute[route]));
    budget += allocation;
    biased[route] = candidate;
    biasedTotal += candidate;
  }

  const allocated = {} as Record<TacticalRoute, number>;
  if (budget === 0 || biasedTotal === 0) {
    for (const route of TACTICAL_ROUTES) allocated[route] = 0;
    return allocated;
  }

  let assigned = 0;
  const finalRoute = TACTICAL_ROUTES[TACTICAL_ROUTES.length - 1] as TacticalRoute;
  for (const route of TACTICAL_ROUTES) {
    const value = route === finalRoute ? budget - assigned : biased[route] * (budget / biasedTotal);
    allocated[route] = value;
    assigned += value;
  }

  return allocated;
}

/** Tactical and structural share of control, before match-state effects. */
function derivePlanControlMultiplier(
  input: DeriveOpportunityRoutePlanInput,
  allocationByRoute: Readonly<Record<TacticalRoute, number>>,
): number {
  const semantics = input.calibration.tacticalSemantics;
  const builtRouteCapacity = (
    allocationByRoute.central
    + allocationByRoute.left
    + allocationByRoute.right
    + allocationByRoute.direct
  ) / BUILT_ROUTE_COUNT;
  const shapeShare = share(semantics.shapeControlShareBasisPoints);
  const shapeControl = (1 - shapeShare) + shapeShare * (builtRouteCapacity / NEUTRAL_CONTROL_ALLOCATION);
  const control = signedControlMagnitudes(semantics);
  const tacticalControl =
    1
    + lean(input.ownTactics, input.caps, "pressing") * control.pressing
    + lean(input.ownTactics, input.caps, "risk") * control.risk
    + lean(input.ownTactics, input.caps, "width") * control.width
    + lean(input.ownTactics, input.caps, "directness") * control.directness;

  return Math.max(MIN_PLAN_CONTROL_MULTIPLIER, shapeControl * tacticalControl);
}

/** Signed control magnitudes derived from the one typed direction mapping. */
function signedControlMagnitudes(
  semantics: MatchTacticsCalibrationConfig["tacticalSemantics"],
): Readonly<Record<TacticKnob, number>> {
  const magnitudes = {} as Record<TacticKnob, number>;
  for (const knob of TACTIC_KNOBS) {
    const magnitude = share(semantics.controlBasisPointsByKnob[knob]);
    magnitudes[knob] = TACTIC_KNOB_CONTROL_DIRECTION[knob] === "increase" ? magnitude : -magnitude;
  }
  return magnitudes;
}

/** Reads one knob as an intensity in `0..1` against its configured cap. */
function knobIntensity(
  tactics: MatchTacticalDistributionInput,
  caps: TacticalDistributionCaps,
  knob: TacticKnob,
): number {
  const cap = caps[knob];
  const range = cap.maxInclusive - cap.minInclusive;

  return range === 0 ? NEUTRAL_KNOB_INTENSITY : clamp((tactics[knob] - cap.minInclusive) / range, 0, 1);
}

/**
 * How far a knob leans from its neutral setting, in `-0.5..0.5`.
 *
 * Every knob effect is proportional to this rather than to raw intensity, so a
 * side that changes nothing is handed nothing: at neutral each factor is
 * exactly `1`. Reading raw intensity instead would multiply every capacity and
 * every volume upward in every match, which is a global shift dressed up as
 * separation - the model would claim tactics matter while actually only
 * inflating the scoreline.
 *
 * It also makes the knobs two-sided. A slider pulled left is a genuine
 * decision to give something up, not the absence of a bonus.
 */
function lean(
  tactics: MatchTacticalDistributionInput,
  caps: TacticalDistributionCaps,
  knob: TacticKnob,
): number {
  return knobIntensity(tactics, caps, knob) - NEUTRAL_KNOB_INTENSITY;
}

/**
 * Knob intensity that expresses no preference either way.
 *
 * Intensity is normalized against its cap, so the midpoint is always `0.5`
 * whatever range content declares.
 */
const NEUTRAL_KNOB_INTENSITY = 0.5;

/**
 * Route capacity at which an attacking chain and the resistance it meets are
 * worth exactly the same.
 *
 * This is a definition, not a measurement: capacity is `chain / (chain +
 * resistance)`, so `0.5` is where the two are equal and above it is where the
 * chain wins. It is deliberately *not* "what two identical sides produce" -
 * they produce less, because a chain is contested by the opponent's press and
 * a resistance is not, and because the chains blend three phases against the
 * resistances' two. Two identical `4-4-2`s expect `0.4576`.
 *
 * So anything that must be neutral when nothing has been decided compares the
 * two sides to each other rather than to this constant. What this constant is
 * for is the opposite question - whether *this* route beat the resistance in
 * front of it - which is exactly what decides how good a chance is.
 */
export const EVEN_CONTEST_ROUTE_CAPACITY = 0.5;

/**
 * Normalizes route capacities into selection weights.
 *
 * Weights are proportional to capacity *raised to the configured sharpness*,
 * because a side does not spread itself evenly over five ways through in
 * proportion to how good each one is. Capacities are a bounded share and
 * therefore sit in a narrow band - a coherent shape against a coherent shape
 * runs about `0.45` to `0.57` - so weighting by capacity alone sends a side
 * down its *worst* route `18%` of the time and its best only `23%`. Nobody
 * plays that way. Squaring or cubing that same band pushes the split towards
 * `14%` and `30%`, which is a side actually going where it is strong.
 *
 * The sharpness is a small integer and is applied by repeated multiplication,
 * because a fractional exponent is a transcendental and the engine's hot path
 * may not use one (`requirements.md`).
 *
 * A side whose every route is shut still has to try something, so an all-zero
 * plan spreads evenly rather than dividing by zero. That case means the shape
 * cannot create, which the capacities themselves already say; it is not a
 * licence to invent a preference.
 */
function normalizedWeights(
  capacityByRoute: Readonly<Record<TacticalRoute, number>>,
  sharpness: number,
): Readonly<Record<TacticalRoute, number>> {
  const emphasis = {} as Record<TacticalRoute, number>;
  let total = 0;
  for (const route of TACTICAL_ROUTES) {
    const value = raisedToSharpness(capacityByRoute[route], sharpness);
    emphasis[route] = value;
    total += value;
  }

  const weights = {} as Record<TacticalRoute, number>;
  for (const route of TACTICAL_ROUTES) {
    weights[route] = total === 0 ? 1 / TACTICAL_ROUTES.length : emphasis[route] / total;
  }

  return weights;
}

/** Raises a capacity to a small positive integer power, without `Math.pow`. */
function raisedToSharpness(capacity: number, sharpness: number): number {
  let value = capacity;
  for (let power = 1; power < sharpness; power += 1) {
    value *= capacity;
  }

  return value;
}

/** Converts a basis-point share into a plain multiplier fraction. */
function share(basisPoints: number): number {
  return basisPoints / 10_000;
}

/** Stable signed basis-point encoding for one dimensionless analytic fact. */
function fixedPointBasisPoints(value: number): string {
  return String(Math.round(value * 10_000));
}

function clamp(value: number, minInclusive: number, maxInclusive: number): number {
  return Math.min(maxInclusive, Math.max(minInclusive, value));
}

/**
 * Largest deficit that still changes commitment.
 *
 * Two goals down is already "throw everything forward". Letting a five-goal
 * deficit keep scaling would turn a bad afternoon into an unbounded siege, and
 * the losing side would out-shoot the winner in exactly the matches where that
 * reads as broken.
 */
const SCORE_STATE_GOAL_CAP = 2;

/** Bounds on the per-minute volume multiplier, so no setup can run away. */
const MIN_VOLUME_MULTIPLIER = 0.6;
const MAX_VOLUME_MULTIPLIER = 1.7;

/** Encoding contract for complete analytic minute-plan signatures. */
const STRATEGIC_SIGNATURE_VERSION = "opportunity-route-plan-bps-v1";

/** Four routes retain settled possession; transition starts after possession changes. */
const BUILT_ROUTE_COUNT = 4;

/** Ordinary chain allocation on the intrinsic tactical-capacity scale. */
const NEUTRAL_CONTROL_ALLOCATION = 0.5;

/** Keeps a pathological legal plan from deleting its control claim entirely. */
const MIN_PLAN_CONTROL_MULTIPLIER = 0.01;

/** Existing direct-play relief, moved under the minute plan's single ownership. */
const COUNTER_RELIEF_AT_FULL_DIRECTNESS = 0.18;
