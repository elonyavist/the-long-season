import {
  TACTICAL_ROUTE_DEFINITION,
  TACTICAL_ROUTES,
  type MatchTacticsCalibrationConfig,
  type TacticalRoute,
  type TacticalShapeCapacity,
} from "@game/domain";

import type { TacticalShapeProfile } from "./tactical-shape.ts";

/** How one side's route fares against this particular opponent. */
export interface TacticalRouteMatchup {
  /**
   * Bounded share of the contest on this route, in `[0, 1]`.
   *
   * `0.5` means the attacking chain and the opposing resistance are evenly
   * matched. It is a comparison, never a probability and never a goal.
   */
  readonly capacity: number;
  /** The attacking chain after the opponent's press has bitten into build-up. */
  readonly ownChain: number;
  /** What the opponent puts in the way, read from its own capacities. */
  readonly opponentResistance: number;
  /**
   * The own phase that limits this route.
   *
   * This is the fact a manager can act on - "your build-up is the problem, not
   * your forwards" - and the one the explanation surface is built from.
   */
  readonly bottleneck: TacticalShapeCapacity;
}

/**
 * One side's five routes against one specific opponent.
 *
 * The matchup is relational and therefore not a property of either side alone:
 * the same shape produces different routes against a different opponent, which
 * is the whole point.
 */
export interface TacticalMatchup {
  /** Version of the calibration that produced these numbers. */
  readonly policyVersion: string;
  /** Route facts in the deterministic route order. */
  readonly routes: Readonly<Record<TacticalRoute, TacticalRouteMatchup>>;
}

/** Input for comparing one side's shape against its opponent's. */
export interface DeriveTacticalMatchupInput {
  /** Intrinsic shape of the side trying to attack. */
  readonly own: TacticalShapeProfile;
  /** Intrinsic shape of the side trying to stop it. */
  readonly opponent: TacticalShapeProfile;
  /** Versioned calibration supplied by the caller. */
  readonly calibration: MatchTacticsCalibrationConfig;
}

/** Error categories exposed by relational matchup derivation. */
export type TacticalMatchupErrorCode = "mismatched_policy_version";

/**
 * Typed error thrown when two profiles cannot legitimately be compared.
 *
 * @example
 * if (error instanceof TacticalMatchupError) {
 *   // One side's profile was built by a different calibration.
 * }
 */
export class TacticalMatchupError extends Error {
  /** Machine-readable failure reason. */
  public readonly code: TacticalMatchupErrorCode;

  /** Creates a relational matchup error. */
  public constructor(code: TacticalMatchupErrorCode, message: string) {
    super(message);
    this.name = "TacticalMatchupError";
    this.code = code;
  }
}

/**
 * Compares one side's intrinsic shape against its opponent's.
 *
 * Three ideas, and no opponent data ever flows back into intrinsic shape:
 *
 * 1. **A route is a chain, and a chain is worth its weakest link.** Six
 *    forwards do not help if nothing reaches them. The calibration decides how
 *    sharply the weakest phase dominates, but it can never be discounted away.
 * 2. **Pressing bites into build-up, and only build-up.** That is why a press
 *    only pays when the pressing side is itself coherent, and why the two
 *    routes that skip build-up - direct and transition - are the ones a pressed
 *    side falls back on.
 * 3. **Resistance is a chain too.** The attacker exploits the weakest defensive
 *    phase, so the same weakest-link arithmetic serves both sides and there is
 *    one formula rather than two that can disagree.
 *
 * Determinism: no RNG, no iteration over object keys, and the declared chain
 * order is the final tie-break when two links are equally weak.
 *
 * @example
 * const home = deriveTacticalMatchup({ own: homeShape, opponent: awayShape, calibration });
 * home.routes.left.bottleneck; // which phase limits the left-side route
 */
export function deriveTacticalMatchup(input: DeriveTacticalMatchupInput): TacticalMatchup {
  const { own, opponent, calibration } = input;
  if (own.policyVersion !== opponent.policyVersion) {
    throw new TacticalMatchupError(
      "mismatched_policy_version",
      `Both sides must come from one calibration: ${own.policyVersion} versus ${opponent.policyVersion}`,
    );
  }

  const bottleneckWeight = calibration.tacticalMatchup.chainBottleneckWeightBasisPoints / 10_000;
  const pressingWeight = calibration.tacticalMatchup.pressingContestWeightBasisPoints / 10_000;
  const contestedBuildUp = own.capacities.build_up * (1 - pressingWeight * opponent.capacities.pressing_cohesion);

  const routes = {} as Record<TacticalRoute, TacticalRouteMatchup>;
  for (const route of TACTICAL_ROUTES) {
    const definition = TACTICAL_ROUTE_DEFINITION[route];
    const links = definition.ownChain.map((capacity) =>
      capacity === "build_up" ? contestedBuildUp : own.capacities[capacity],
    );
    const resistances = definition.opponentResistance.map((capacity) => opponent.capacities[capacity]);
    const ownChain = chainCapacity(links, bottleneckWeight);
    const opponentResistance = chainCapacity(resistances, bottleneckWeight);

    routes[route] = {
      capacity: ownChain === 0 ? 0 : ownChain / (ownChain + opponentResistance),
      ownChain,
      opponentResistance,
      bottleneck: definition.ownChain[weakestLinkIndex(links)] as TacticalShapeCapacity,
    };
  }

  return { policyVersion: own.policyVersion, routes };
}

/**
 * Blends the weakest link with the chain average.
 *
 * A pure minimum would make one dead phase delete a route outright, and a pure
 * average would let a huge front line hide a missing midfield. The blend keeps
 * the weakest phase dominant while letting the rest of the chain still count.
 */
function chainCapacity(values: readonly number[], bottleneckWeight: number): number {
  let weakest = Number.POSITIVE_INFINITY;
  let total = 0;
  for (const value of values) {
    weakest = Math.min(weakest, value);
    total += value;
  }

  return bottleneckWeight * weakest + (1 - bottleneckWeight) * (total / values.length);
}

/** First index holding the smallest value, so the declared order breaks ties. */
function weakestLinkIndex(values: readonly number[]): number {
  let index = 0;
  for (let candidate = 1; candidate < values.length; candidate += 1) {
    if ((values[candidate] as number) < (values[index] as number)) {
      index = candidate;
    }
  }

  return index;
}
