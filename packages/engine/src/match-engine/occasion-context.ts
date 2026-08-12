import type { PlayerId, ShotChanceType, ShotType, TacticalRoute } from "@game/domain";
import { deriveRng } from "@game/shared";

import {
  type ChanceActorSelectionWeight,
  primaryDefenderWeightForRole,
  selectChanceActors,
} from "./chance-actors.ts";
import type { MatchPlayerIncidentProfile, MatchTeamContext } from "./match-context.ts";
import { incidentProfileFor } from "./match-discipline.ts";
import type { MatchScore, MatchSide, MatchSimulationState } from "./match-simulation-state.ts";
import { OPPORTUNITY_ROUTE_CHANCE_TYPE } from "./opportunity-route.ts";
import { roleWeightKeyForCanonicalRole } from "./team-strength.ts";

/**
 * Everything about one chance that is true before anyone knows how it ended.
 *
 * The route was chosen, four players are on it, and how far the two of them with
 * peers to be measured against tilt the question each is asked is already
 * settled. Only then is the occasion resolved. That order is the point of this
 * module: the previous chain resolved the outcome first and attached names to it
 * afterwards, so a goal was scored by nobody in particular and the striker who
 * took it could not have made it more likely.
 *
 * It is one football concept, not a bag of optional fields. Every actor is
 * present for every occasion, because every chance in football has someone who
 * worked it, someone who hit it, someone trying to stop it, and a goalkeeper.
 */
export interface OccasionContext {
  /** Simulated minute of the occasion. */
  readonly minute: number;
  /** Side that created the chance. */
  readonly attackingSide: MatchSide;
  /** Side defending it. */
  readonly defendingSide: MatchSide;
  /** The way through the chance came down. */
  readonly route: TacticalRoute;
  /** Signed chance-quality edge already settled by the minute plan. */
  readonly routeQualityEdge: number;
  /** Structured source type, derived from the route alone. */
  readonly chanceType: ShotChanceType;
  /** Structured execution type, derived from the route and the two players contesting it. */
  readonly shotType: ShotType;
  /** Attacking player who worked the chance. */
  readonly creatorPlayerId: PlayerId;
  /** Attacking player who takes the shot. */
  readonly shooterPlayerId: PlayerId;
  /** Defending outfield player most directly in the way. */
  readonly primaryDefenderPlayerId: PlayerId;
  /** Defending goalkeeper for this occasion. */
  readonly goalkeeperPlayerId: PlayerId;
  /**
   * Whether the creator takes assist credit if this occasion becomes a goal.
   *
   * Decided here, before the outcome exists, so nothing about this chance is
   * chosen once the engine already knows it was scored. A miss simply never
   * asks the question.
   */
  readonly creatorIsCreditedWithAssist: boolean;
  /**
   * How much better than the pool he was drawn from this shooter is, as quality.
   *
   * Signed and centred on zero: a shooter exactly as good as the players who
   * could have been picked instead adds nothing. That is the same discipline the
   * route term follows against an even contest, and for the same reason - a term
   * proportional to raw ability would lift every chance in every match and read
   * as a striker mattering when it is only inflation.
   */
  readonly shooterQualityEdge: number;
  /** How much better than his pool the man in the way is, as block probability. */
  readonly primaryDefenderBlockEdge: number;
}

/** Input needed to build one occasion context. */
export interface BuildOccasionContextInput {
  /** Match state before this occasion is applied. */
  readonly simulation: MatchSimulationState;
  /** Side that created the chance. */
  readonly attackingSide: MatchSide;
  /** Side defending it. */
  readonly defendingSide: MatchSide;
  /** Simulated minute of the occasion. */
  readonly minute: number;
  /** Route already selected for this chance. */
  readonly route: TacticalRoute;
  /** Signed quality edge already derived from the selected route. */
  readonly routeQualityEdge: number;
  /** Score before this occasion, which distinguishes two chances in one minute. */
  readonly scoreBeforeOccasion: MatchScore;
}

/**
 * Builds the complete pre-resolution context for one chance.
 *
 * Nothing here consumes the match RNG stream. Actor selection and assist credit
 * both derive their own streams from the seed and the occasion key, so adding a
 * causal actor cannot shift the outcome of an unrelated minute.
 *
 * @example
 * const occasion = buildOccasionContext({
 *   simulation,
 *   attackingSide: "home",
 *   defendingSide: "away",
 *   minute: 18,
 *   route: "left",
 *   routeQualityEdge: 0.0125,
 *   scoreBeforeOccasion: simulation.score,
 * });
 * occasion.shooterPlayerId; // decided before the shot is resolved
 */
export function buildOccasionContext(input: BuildOccasionContextInput): OccasionContext {
  const attackingTeam = teamBySide(input.simulation, input.attackingSide);
  const defendingTeam = teamBySide(input.simulation, input.defendingSide);
  const chanceType = OPPORTUNITY_ROUTE_CHANCE_TYPE[input.route];
  const assistEligibilityRequested = requestsAssistEligibleCreator({
    seed: input.simulation.context.seed,
    fixtureId: input.simulation.context.fixtureId,
    minute: input.minute,
    attackingSide: input.attackingSide,
    scoreBeforeOccasion: input.scoreBeforeOccasion,
    route: input.route,
    probabilityBasisPoints: input.simulation.context.matchTacticsCalibration
      .chanceActorSelection.nonSetPieceAssistEligibilityBasisPoints,
  });
  const actors = selectChanceActors({
    seed: input.simulation.context.seed,
    fixtureId: input.simulation.context.fixtureId,
    minute: input.minute,
    attackingSide: input.attackingSide,
    scoreBeforeChance: input.scoreBeforeOccasion,
    attackingTeam,
    defendingTeam,
    route: input.route,
    matchTacticsCalibration: input.simulation.context.matchTacticsCalibration,
    requiresDistinctCreator: assistEligibilityRequested,
  });

  const shooter = incidentProfileFor(attackingTeam, actors.shooterPlayerId);
  const primaryDefender = incidentProfileFor(defendingTeam, actors.primaryDefenderPlayerId);
  const shotType = deriveShotType(chanceType, shooter, primaryDefender);
  const shooterAttribute = SHOOTER_ATTRIBUTE_BY_SHOT_TYPE[shotType];

  return {
    minute: input.minute,
    attackingSide: input.attackingSide,
    defendingSide: input.defendingSide,
    route: input.route,
    routeQualityEdge: input.routeQualityEdge,
    chanceType,
    shotType,
    creatorPlayerId: actors.creatorPlayerId,
    shooterPlayerId: actors.shooterPlayerId,
    primaryDefenderPlayerId: actors.primaryDefenderPlayerId,
    goalkeeperPlayerId: actors.goalkeeperPlayerId,
    creatorIsCreditedWithAssist:
      assistEligibilityRequested && actors.creatorPlayerId !== actors.shooterPlayerId,
    shooterQualityEdge: shooterQualityEdgeFor(
      attackingTeam,
      shooter,
      shooterAttribute,
      actors.shooterSelectionPool,
    ),
    primaryDefenderBlockEdge: primaryDefenderBlockEdgeFor(defendingTeam, primaryDefender),
  };
}

/**
 * The attribute that decides how well a shooter executes each kind of shot.
 *
 * Total and typed, so a new shot type is a build failure rather than a silent
 * fall through to composure. These are the attributes the match context
 * actually carries; there is no finishing rating on this seam, and composure is
 * the one it does carry that describes striking a chance rather than creating
 * it. A header is a different act and reads the physical attribute that decides
 * it.
 */
const SHOOTER_ATTRIBUTE_BY_SHOT_TYPE = {
  normal: "composure",
  header: "strength",
  set_piece: "composure",
} as const satisfies Readonly<Record<ShotType, OccasionAttributeKey>>;

/** The numeric attributes an occasion reads off a player. */
type OccasionAttributeKey = "composure" | "strength" | "tackling";

/**
 * Decides how the shot is executed, before anyone knows how good the chance was.
 *
 * A cross is met with a head when the man attacking it beats the man marking
 * him physically, which is a contest between two named players and needs no
 * randomness. The version before this asked whether the chance quality was
 * above `0.45`, which could only be answered *after* the occasion had been
 * resolved - so the shot type was a consequence of the outcome rather than a
 * fact about the two players contesting the ball.
 *
 * Shot type does not feed conversion anywhere; it decides how the event reads
 * and how likely the creator is to be credited with the assist.
 */
function deriveShotType(
  chanceType: ShotChanceType,
  shooter: MatchPlayerIncidentProfile,
  primaryDefender: MatchPlayerIncidentProfile,
): ShotType {
  return chanceType === "cross" && shooter.strength >= primaryDefender.strength ? "header" : "normal";
}

/*
 * An actor edge is a deviation from the pool the actor was drawn from, measured
 * in the same attribute off the same source. The two functions below are the
 * only places that rule is applied, and it is what makes them safe rather than
 * merely bounded.
 *
 * Both read `incidentProfileFor`, so a context assembled without real player
 * attributes gives every candidate the same neutral profile, the pool mean
 * equals the actor's own value, and the edge is exactly `0`. No branch, no
 * fallback: with nothing to separate the eleven, there is nothing to add.
 *
 * The goalkeeper has no edge for the same reason. He is drawn from a pool of
 * one, so the only anchor available is `strength.goalkeeper` - a role-weighted
 * department score, not a raw attribute - and subtracting one from the other
 * compares two different scales. Against a neutral profile that difference is a
 * large constant rather than zero, which would make every aggregate-only match
 * concede. He is still causal: he is named before the occasion resolves, and the
 * department the conversion term reads was derived from him.
 *
 * The gap that leaves is real and is not papered over. When a dismissal or an
 * injury promotes an outfield player into goal, `match-team-exit.ts` rewrites
 * the lineup without recomputing `strength`, so an emergency keeper still
 * defends the goal as well as the specialist he replaced. Closing it means
 * recomputing team strength on promotion, which is that module's job.
 */

/**
 * Measures the shooter against the players who could have taken it instead.
 *
 * Capped because quality has no natural bound of its own the way block
 * probability and the keeper factor do: without a cap a single outlier attribute
 * would move a chance further than the whole strength difference between the two
 * teams.
 */
function shooterQualityEdgeFor(
  attackingTeam: MatchTeamContext,
  shooter: MatchPlayerIncidentProfile,
  attribute: OccasionAttributeKey,
  shooterSelectionPool: readonly ChanceActorSelectionWeight[],
): number {
  const poolMean = weightedSelectionPoolMean(
    attackingTeam,
    shooterSelectionPool,
    (profile) => profile[attribute],
  );

  return clamp(
    (shooter[attribute] - poolMean) / SHOOTER_QUALITY_DIVISOR,
    -MAX_SHOOTER_QUALITY_EDGE,
    MAX_SHOOTER_QUALITY_EDGE,
  );
}

/**
 * Centres execution on the exact pool that selected the shooter.
 *
 * Actor task quality is already present in these weights. Rebuilding the pool
 * from role weights here would give good shooters both more nominations and a
 * positive expected conversion edge.
 */
function weightedSelectionPoolMean(
  team: MatchTeamContext,
  pool: readonly ChanceActorSelectionWeight[],
  valueOf: (profile: MatchPlayerIncidentProfile) => number,
): number {
  const totalWeight = pool.reduce((sum, { weight }) => sum + weight, 0);
  return totalWeight === 0
    ? 0
    : pool.reduce((sum, { playerId, weight }) =>
        sum + weight * valueOf(incidentProfileFor(team, playerId)), 0)
      / totalWeight;
}

/**
 * Measures the man in the way against the defenders who could have been there.
 *
 * Divided by the same divisor the two departments are compared with, so a
 * ten-point gap between this defender and his peers is worth exactly what a
 * ten-point gap between the two defences is worth. The block probability's own
 * bounds are what keep the total honest, so this term needs no second cap.
 */
function primaryDefenderBlockEdgeFor(
  defendingTeam: MatchTeamContext,
  primaryDefender: MatchPlayerIncidentProfile,
): number {
  const poolMean = weightedLineupMean(
    defendingTeam,
    primaryDefenderWeightForRole,
    (profile) => profile.tackling,
  );

  return (primaryDefender.tackling - poolMean) / DEFENDER_BLOCK_DIVISOR;
}

/**
 * Averages one attribute over a lineup using the same weights selection used.
 *
 * Weighting by selection probability is what makes the resulting edge centre on
 * zero: the expected attribute of the player who *will* be drawn is exactly this
 * mean. An unweighted average would quietly declare every striker above average
 * simply because strikers are picked more often.
 */
function weightedLineupMean(
  team: MatchTeamContext,
  weightForRole: (roleKey: string) => number,
  valueOf: (profile: MatchPlayerIncidentProfile) => number,
): number {
  let totalWeight = 0;
  let weightedTotal = 0;

  for (const slot of team.lineup) {
    const weight = weightForRole(roleWeightKeyForCanonicalRole(slot.canonicalRole));
    if (weight === 0) continue;

    totalWeight += weight;
    weightedTotal += weight * valueOf(incidentProfileFor(team, slot.playerId));
  }

  return totalWeight === 0 ? 0 : weightedTotal / totalWeight;
}

/** Input for the assist-eligibility decision, which happens before resolution. */
interface AssistEligibilityInput {
  readonly seed: string;
  readonly fixtureId: MatchSimulationState["context"]["fixtureId"];
  readonly minute: number;
  readonly attackingSide: MatchSide;
  readonly scoreBeforeOccasion: MatchScore;
  readonly route: TacticalRoute;
  readonly probabilityBasisPoints: number;
}

/**
 * Decides whether an ordinary opportunity requires an assist-eligible creator.
 *
 * This is sampled before actors and outcome. Actor selection then makes the
 * creator distinct when the lineup contains another eligible player, so the
 * external non-dead-ball share is not multiplied by accidental overlap.
 */
function requestsAssistEligibleCreator(input: AssistEligibilityInput): boolean {
  const rng = deriveRng(
    input.seed,
    OCCASION_ASSIST_ELIGIBILITY_STREAM,
    input.fixtureId,
    input.minute,
    input.attackingSide,
    input.scoreBeforeOccasion.home,
    input.scoreBeforeOccasion.away,
    input.route,
  );

  return rng.nextFloat() < input.probabilityBasisPoints / 10_000;
}

/** Reads one team context by explicit side. */
function teamBySide(simulation: MatchSimulationState, side: MatchSide): MatchTeamContext {
  return side === "home" ? simulation.context.home : simulation.context.away;
}

/** Clamps a number into an inclusive range. */
function clamp(value: number, minInclusive: number, maxInclusive: number): number {
  return Math.min(maxInclusive, Math.max(minInclusive, value));
}

/** Stable RNG stream deciding assist credit, separate from selection and resolution. */
const OCCASION_ASSIST_ELIGIBILITY_STREAM = "occasion-assist-eligibility";

/**
 * How far a shooter's attribute gap moves opportunity quality.
 *
 * Deliberately twice the divisor the two team strengths are compared with, so
 * being the best striker in an ordinary eleven is worth less than the eleven
 * being better than the one it faces. Who you pick matters; it does not matter
 * more than which players you have.
 */
const SHOOTER_QUALITY_DIVISOR = 80;

/** Most opportunity quality one shooter may add or lose against his peers. */
const MAX_SHOOTER_QUALITY_EDGE = 0.1;

/**
 * How far a defender's tackling gap moves the block share.
 *
 * The same divisor `deriveBlockProbability` compares the two defences with, so
 * one number says what a ten-point gap is worth wherever it appears.
 */
const DEFENDER_BLOCK_DIVISOR = 120;
