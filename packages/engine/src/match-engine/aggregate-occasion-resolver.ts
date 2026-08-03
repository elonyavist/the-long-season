import type { MatchTeamContext } from "./match-context.ts";
import type { MatchSide } from "./match-simulation-state.ts";
import { EVEN_CONTEST_ROUTE_CAPACITY } from "./opportunity-route.ts";
import type { OccasionResolution, OccasionResolver, ResolveOccasionInput } from "./occasion-resolver.ts";
import type { Rng } from "@game/shared";

/**
 * Aggregate opportunity resolver for the first match-engine slice.
 *
 * It maps team strength and configured conversion bands to shot outcomes. It
 * intentionally does not inspect individual players or produce duel chains.
 *
 * The four outcomes are resolved in the order the events happen on the pitch,
 * and each actor is asked exactly one question:
 *
 * 1. **Was it blocked?** The defence against the attack, before the ball is
 *    struck cleanly.
 * 2. **Was it on target?** The quality of the position worked, which is the
 *    attack measured against the defence. *The keeper has no say in this.* A
 *    great striker forces the same keeper into more work, and a poor one puts
 *    the same number of shots wide whoever is in goal.
 * 3. **Did it go in?** Only now does the keeper appear, deciding whether a shot
 *    already on target becomes a goal or a save.
 *
 * That ordering is the whole point. An earlier version asked the keeper both
 * how good the chance was and how often the shot was on target, which made a
 * world-class keeper *increase* his opponent's shots on target - every save is
 * on target - while leaving goals untouched, because two keepers nine points
 * apart landed in one conversion band. A weak striker then out-shot a great one
 * and scored just as often. Keeper quality now moves goals into saves without
 * touching the shot count, which is the football everyone expects.
 *
 * @example
 * const resolver = new AggregateOccasionResolver();
 */
export class AggregateOccasionResolver implements OccasionResolver {
  /**
   * Resolves one opportunity from aggregate team strengths.
   *
   * Exactly three floats are drawn in a fixed order whatever the outcome, so
   * one occasion always advances the stream by the same amount.
   */
  public resolveOccasion(input: ResolveOccasionInput, rng: Rng): OccasionResolution {
    const attackingTeam = teamBySide(input.simulation, input.attackingSide);
    const defendingTeam = teamBySide(input.simulation, input.defendingSide);

    const quality = deriveOpportunityQuality(
      attackingTeam,
      defendingTeam,
      input.attackingSide,
      input.simulation.context.engineConfig.homeAdvantageFactor,
      input.routeCapacity,
      input.simulation.context.matchTacticsCalibration.tacticalSemantics.routeQualityBiasBasisPoints,
      rng,
    );
    const placementRoll = rng.nextFloat();
    const keeperRoll = rng.nextFloat();

    const blockProbability = deriveBlockProbability(attackingTeam, defendingTeam);
    const onTargetProbability = deriveOnTargetProbability(quality, blockProbability);
    const goalProbability = deriveGoalProbability(
      input.simulation.context.engineConfig.conversionBands,
      quality,
      attackingTeam,
      defendingTeam,
      onTargetProbability,
    );

    if (placementRoll < blockProbability) {
      return {
        outcome: "block",
        quality,
        isShotOnTarget: false,
        expectedGoals: goalProbability,
        resultsInCorner: quality >= BLOCK_CORNER_QUALITY,
      };
    }

    if (placementRoll < blockProbability + onTargetProbability) {
      // The shot is on target either way. The keeper only decides which side of
      // the line it ends on, so his quality moves goals and saves against each
      // other and never changes how many shots reached him.
      const goalGivenOnTarget = onTargetProbability === 0 ? 0 : goalProbability / onTargetProbability;

      return keeperRoll < goalGivenOnTarget
        ? {
            outcome: "goal",
            quality,
            isShotOnTarget: true,
            expectedGoals: goalProbability,
            resultsInCorner: false,
          }
        : {
            outcome: "save",
            quality,
            isShotOnTarget: true,
            expectedGoals: goalProbability,
            resultsInCorner: quality >= SAVE_CORNER_QUALITY,
          };
    }

    return {
      outcome: "miss",
      quality,
      isShotOnTarget: false,
      expectedGoals: goalProbability,
      resultsInCorner: false,
    };
  }
}

/**
 * Reads one team context by explicit side.
 */
function teamBySide(simulation: ResolveOccasionInput["simulation"], side: MatchSide): MatchTeamContext {
  return side === "home" ? simulation.context.home : simulation.context.away;
}

/**
 * Derives a bounded opportunity quality score from aggregate strengths.
 *
 * This is how good a position the attack worked itself into, which is contested
 * by the outfield players only. A keeper does not defend the build-up; he
 * defends the goal, and does it once, at the end of the chain.
 *
 * Two independent things decide it, and neither can stand in for the other.
 * **Who has the better players** is the strength edge. **How they got there**
 * is the route: a chance worked down a flank the attack owns is a better chance
 * than the same chance forced down one the opponent owns. Without the second
 * term, two elevens of equal quality produce chances of identical quality
 * whatever shape they take, and structure can separate them on volume alone.
 *
 * The route term is measured from `EVEN_CONTEST_ROUTE_CAPACITY`, so a route the
 * two shapes contest evenly adds exactly nothing. That is not a formality: a
 * term proportional to raw capacity would shift every chance in every match
 * upward and call a global inflation "separation".
 */
function deriveOpportunityQuality(
  attackingTeam: MatchTeamContext,
  defendingTeam: MatchTeamContext,
  attackingSide: MatchSide,
  homeAdvantageFactor: number,
  routeCapacity: number,
  routeQualityBiasBasisPoints: number,
  rng: Rng,
): number {
  const homeFactor = attackingSide === "home" ? homeAdvantageFactor : 1;
  const attackingScore = (attackingTeam.strength.attack * 0.7 + attackingTeam.strength.midfield * 0.3) * homeFactor;
  const defendingScore = defendingTeam.strength.defense * 0.7 + defendingTeam.strength.midfield * 0.3;
  const strengthEdge = (attackingScore - defendingScore) / 40;
  const routeEdge =
    (routeCapacity - EVEN_CONTEST_ROUTE_CAPACITY) * (routeQualityBiasBasisPoints / 10_000);
  const randomTexture = (rng.nextFloat() - 0.5) * 0.3;

  return clamp(0.5 + strengthEdge + routeEdge + randomTexture, 0, 1);
}

/**
 * Derives how often the defence gets a body in the way.
 */
function deriveBlockProbability(attackingTeam: MatchTeamContext, defendingTeam: MatchTeamContext): number {
  return clamp(
    BASE_BLOCK_PROBABILITY + (defendingTeam.strength.defense - attackingTeam.strength.attack) / BLOCK_STRENGTH_DIVISOR,
    MIN_BLOCK_PROBABILITY,
    MAX_BLOCK_PROBABILITY,
  );
}

/**
 * Derives how often an unblocked shot is struck on target.
 *
 * It reads opportunity quality, and quality alone. Quality is already the
 * attack measured against the defence it faced, so a better striker reaches the
 * target more often by having worked a better position - and the keeper, who is
 * absent from quality, still has no say in whether the ball is on target.
 *
 * Reading raw attack strength instead looks equivalent and is not. Conversion
 * reads quality, which is *relative*, so in a division where attack and defence
 * are both poor an even contest still produces ordinary quality and its
 * ordinary goal probability. An absolute reading sent accuracy to its floor in
 * exactly those matches while conversion stayed put, and almost every shot on
 * target went in: third-division keepers stopped making saves at all. Both ends
 * of the chain have to be measured against the same thing.
 */
function deriveOnTargetProbability(quality: number, blockProbability: number): number {
  const accuracy = BASE_ON_TARGET_PROBABILITY + (quality - NEUTRAL_QUALITY) * ON_TARGET_QUALITY_WEIGHT;

  return Math.min(
    clamp(accuracy, MIN_ON_TARGET_PROBABILITY, MAX_ON_TARGET_PROBABILITY),
    1 - blockProbability,
  );
}

/**
 * Derives the chance this occasion ends in a goal.
 *
 * The configured bands still say what a chance of this quality is worth, and
 * the keeper scales that outcome rather than the chance itself. Bounded above
 * by the on-target probability, because a goal is one kind of shot on target
 * and can never be more common than the set it belongs to.
 */
function deriveGoalProbability(
  bands: ResolveOccasionInput["simulation"]["context"]["engineConfig"]["conversionBands"],
  quality: number,
  attackingTeam: MatchTeamContext,
  defendingTeam: MatchTeamContext,
  onTargetProbability: number,
): number {
  const keeperFactor = clamp(
    1 + (attackingTeam.strength.attack - defendingTeam.strength.goalkeeper) / KEEPER_CONTEST_DIVISOR,
    MIN_KEEPER_FACTOR,
    MAX_KEEPER_FACTOR,
  );

  return clamp(
    bandGoalProbability(bands, quality) * keeperFactor,
    0,
    onTargetProbability * MAX_GOAL_SHARE_OF_ON_TARGET,
  );
}

/**
 * Resolves the configured conversion probability for one quality value.
 */
function bandGoalProbability(
  bands: ResolveOccasionInput["simulation"]["context"]["engineConfig"]["conversionBands"],
  quality: number,
): number {
  for (const band of bands) {
    if (quality >= band.minQualityInclusive && quality < band.maxQualityExclusive) {
      return band.goalProbability;
    }
  }

  const lastBand = bands[bands.length - 1];
  return lastBand === undefined ? 0 : lastBand.goalProbability;
}

/**
 * Clamps a number into an inclusive range.
 */
function clamp(value: number, minInclusive: number, maxInclusive: number): number {
  return Math.min(maxInclusive, Math.max(minInclusive, value));
}

/** Share of occasions a perfectly even contest sees blocked. */
const BASE_BLOCK_PROBABILITY = 0.08;

/** How far a defence-minus-attack gap moves the block share. */
const BLOCK_STRENGTH_DIVISOR = 120;

const MIN_BLOCK_PROBABILITY = 0.04;
const MAX_BLOCK_PROBABILITY = 0.28;

/**
 * Share of occasions an even contest strikes on target.
 *
 * Anchored on the third of shots real football puts on target, which is also
 * what keeps conversion honest: the middle conversion band against this base is
 * roughly the `39%` of shots on target that become goals in the real sport.
 */
const BASE_ON_TARGET_PROBABILITY = 0.33;

/** How far opportunity quality moves shooting accuracy either side of the base. */
const ON_TARGET_QUALITY_WEIGHT = 0.55;

/** Opportunity quality an even contest produces before any random texture. */
const NEUTRAL_QUALITY = 0.5;

const MIN_ON_TARGET_PROBABILITY = 0.15;
const MAX_ON_TARGET_PROBABILITY = 0.6;

/**
 * How far the striker-against-keeper gap scales a band's conversion.
 *
 * Centred so that a striker and keeper of equal quality leave the configured
 * band untouched, which keeps the bands meaning what they say and makes keeper
 * quality a contest rather than a flat tax.
 */
const KEEPER_CONTEST_DIVISOR = 30;

const MIN_KEEPER_FACTOR = 0.5;
const MAX_KEEPER_FACTOR = 1.5;

/**
 * Most of a side's shots on target that may ever become goals.
 *
 * Without it, a strong enough attack against a weak enough keeper reaches the
 * point where every shot on target goes in and the keeper stops existing. No
 * keeper in football saves nothing, so this is a statement about the sport
 * rather than a coefficient to tune: whatever the mismatch, some share of what
 * reaches the goal is kept out.
 */
const MAX_GOAL_SHARE_OF_ON_TARGET = 0.75;

/** Quality at or above which a blocked shot goes out for a corner. */
const BLOCK_CORNER_QUALITY = 0.35;

/** Quality at or above which a save is pushed out for a corner. */
const SAVE_CORNER_QUALITY = 0.72;
