import {
  lateralChannelShares,
  TACTICAL_SHAPE_CAPACITIES,
  TACTICAL_SHAPE_CAPACITY_SOURCE,
  TACTICAL_SHAPE_MAXIMUM_CONTRIBUTORS,
  TACTICAL_SHAPE_TASK_KIND,
  type MatchTacticsCalibrationConfig,
  type TacticalShapeCapacity,
  type TacticalShapeTask,
} from "@game/domain";

import type { LineupSlotTacticalEvaluation } from "./team-strength.ts";

/**
 * What one side can do, derived from its shape alone.
 *
 * Every capacity sits in `[0, 1)`. The scale is deliberately relative: `0.5` is
 * roughly what an ordinary balanced eleven of ordinary players produces, so a
 * later relational step can compare two profiles without knowing anything about
 * ability units.
 *
 * This is a *derived* fact, not career truth. It is recomputed from the lineup
 * whenever the lineup changes and never becomes a second durable ledger.
 * `policyVersion` is stamped so a profile carried inside serializable match
 * state can be proven to belong to the calibration currently in force.
 */
export interface TacticalShapeProfile {
  /** Version of the match-tactics calibration that produced these numbers. */
  readonly policyVersion: string;
  /** Bounded capacity per locked football capacity. */
  readonly capacities: Readonly<Record<TacticalShapeCapacity, number>>;
}

/** Input for deriving one side's intrinsic tactical shape. */
export interface DeriveTacticalShapeProfileInput {
  /** Every lineup slot with its already-derived quality, in lineup order. */
  readonly slotScores: readonly LineupSlotTacticalEvaluation[];
  /** Versioned calibration supplied by the caller; the engine owns no numbers. */
  readonly calibration: MatchTacticsCalibrationConfig;
}

/** Error categories exposed by intrinsic tactical-shape derivation. */
export type TacticalShapeErrorCode =
  | "empty_lineup"
  | "too_many_contributors"
  | "missing_policy_version"
  | "incomplete_profile"
  | "capacity_out_of_bounds";

/**
 * Typed error thrown when a shape profile cannot be derived or is not usable.
 *
 * @example
 * if (error instanceof TacticalShapeError && error.code === "too_many_contributors") {
 *   // Caller passed more players than the marginal-contribution ladder covers.
 * }
 */
export class TacticalShapeError extends Error {
  /** Machine-readable failure reason. */
  public readonly code: TacticalShapeErrorCode;

  /** Creates an intrinsic tactical-shape error. */
  public constructor(code: TacticalShapeErrorCode, message: string) {
    super(message);
    this.name = "TacticalShapeError";
    this.code = code;
  }
}

/**
 * Derives one side's intrinsic tactical shape from its lineup.
 *
 * Four football ideas, in order:
 *
 * 1. **Every player contributes to every task**, allocating the same finite
 *    role budget according to his canonical role and quality. A striker helps
 *    build-up a little; a centre back helps final-third presence a little.
 *    Nobody contributes nothing and no role creates a larger total budget.
 * 2. **Lateral work lands on the flank the player occupies.** A left-sided
 *    player covers the left; a central player splits himself. This is where
 *    left/right overload becomes visible instead of averaging away.
 * 3. **Extra occupants of the same task are worth less each time.** The
 *    contributors to a task are ranked best-first and each rank has a smaller
 *    multiplier, so a sixth striker adds real but small presence rather than a
 *    sixth full share.
 * 4. **A man out of position coordinates worse, and nothing else.** Suitability
 *    scales `coordination` tasks only. The winger asked to play centre back is
 *    already scored on a centre back's attributes by the role weights, so his
 *    connections and coverage suffer here while his presence in a box does not
 *    - charging both would price one decision twice.
 *
 * The result is bounded by mapping each raw total `r` to `r / (r + reference)`.
 * That is strictly increasing, never reaches `1`, and has no clamp that can be
 * hit silently. No opponent is read: comparison is a separate concept.
 *
 * Determinism: contributors are ranked by contribution descending with lineup
 * index as the final tie-break, so equal contributions can never reorder.
 *
 * @example
 * const profile = deriveTacticalShapeProfile({ slotScores, calibration });
 * profile.capacities.left_coverage; // 0..1
 */
export function deriveTacticalShapeProfile(input: DeriveTacticalShapeProfileInput): TacticalShapeProfile {
  const { slotScores, calibration } = input;
  if (slotScores.length === 0) {
    throw new TacticalShapeError("empty_lineup", "Intrinsic shape needs at least one lineup slot");
  }
  if (slotScores.length > TACTICAL_SHAPE_MAXIMUM_CONTRIBUTORS) {
    throw new TacticalShapeError(
      "too_many_contributors",
      `Intrinsic shape covers at most ${TACTICAL_SHAPE_MAXIMUM_CONTRIBUTORS} contributors: ${slotScores.length}`,
    );
  }

  const shape = calibration.tacticalShape;
  const capacities = {} as Record<TacticalShapeCapacity, number>;

  for (const capacity of TACTICAL_SHAPE_CAPACITIES) {
    const { task, flank } = TACTICAL_SHAPE_CAPACITY_SOURCE[capacity];
    const isCoordination = TACTICAL_SHAPE_TASK_KIND[task] === "coordination";
    const contributions = slotScores.map(({ slot, taskExecutionByTask, suitability }, index): RankedContribution => {
      const allocation = shape.taskAllocationBasisPointsByRole[slot.canonicalRole][task] / 10_000;
      const channelShare =
        flank === "none" ? 1 : lateralChannelShares(slot.side, shape.channelPolicy)[flank];
      const coordination = isCoordination
        ? shape.coordinationMultiplierBasisPointsBySuitability[suitability] / 10_000
        : 1;

      return {
        index,
        value: taskExecutionByTask[task] * allocation * channelShare * coordination,
      };
    });

    capacities[capacity] = saturate(
      diminishedTotal(contributions, shape.marginalContributionBasisPointsByRank),
      shape.saturationReferenceMilliByTask[task] / 1_000,
    );
  }

  return { policyVersion: calibration.version, capacities };
}

/**
 * Validates a shape profile that arrived from outside this module.
 *
 * Match contexts are serializable and can be rebuilt from persisted state, so a
 * profile reaching the engine is checked for a stamped version, a complete set
 * of capacities, and values inside the bounded range before anything reads it.
 *
 * @example
 * assertValidTacticalShapeProfile(context.home.shape);
 */
export function assertValidTacticalShapeProfile(profile: TacticalShapeProfile): void {
  if (profile.policyVersion.trim().length === 0) {
    throw new TacticalShapeError("missing_policy_version", "Tactical shape profile has no stamped policy version");
  }

  for (const capacity of TACTICAL_SHAPE_CAPACITIES) {
    const value = profile.capacities[capacity];
    if (value === undefined) {
      throw new TacticalShapeError("incomplete_profile", `Tactical shape profile has no ${capacity}`);
    }
    if (!Number.isFinite(value) || value < 0 || value >= 1) {
      throw new TacticalShapeError(
        "capacity_out_of_bounds",
        `Tactical shape capacity must be finite inside [0, 1): ${capacity} is ${value}`,
      );
    }
  }
}

/** One slot's contribution to one task, kept with its lineup index. */
interface RankedContribution {
  readonly index: number;
  readonly value: number;
}

/**
 * Sums contributions with a strictly decreasing multiplier per rank.
 *
 * Because every rank multiplier is strictly positive, adding a contributor
 * always increases the total even when he displaces better players down a rank:
 * the loss across displaced ranks telescopes to less than the gain at the rank
 * he takes. That is why the calibration forbids a zero band.
 */
function diminishedTotal(
  contributions: readonly RankedContribution[],
  ladderBasisPoints: readonly number[],
): number {
  const ranked = [...contributions].sort(compareContribution);

  let total = 0;
  for (const [rank, contribution] of ranked.entries()) {
    total += contribution.value * ((ladderBasisPoints[rank] as number) / 10_000);
  }

  return total;
}

/** Best contribution first, with the lineup index as the final tie-break. */
function compareContribution(left: RankedContribution, right: RankedContribution): number {
  return right.value - left.value || left.index - right.index;
}

/** Maps an unbounded raw total onto `[0, 1)` without a clamp or a cliff. */
function saturate(raw: number, reference: number): number {
  return raw / (raw + reference);
}
