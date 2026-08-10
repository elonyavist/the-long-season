import { roleWeightKeyForCanonicalRole } from "./team-strength.ts";
import type { FixtureId, PlayerId, ShotChanceType } from "@game/domain";
import { deriveRng } from "@game/shared";

import type { MatchTeamContext } from "./match-context.ts";
import { incidentProfileFor } from "./match-discipline.ts";
import type { MatchScore, MatchSide } from "./match-simulation-state.ts";
import type { LineupSlot } from "./team-strength.ts";

/**
 * Engine-local deterministic actor selection for one attacking opportunity.
 *
 * It answers *who*, and only who. Whether the chance becomes a goal, save, miss
 * or block is the resolver's question, and how much each of these players tilts
 * it is `occasion-context.ts`'s - which is also the only caller. Reached through
 * `buildOccasionContext` rather than exported from the package, so nothing can
 * pick a shooter without the route and the edges that belong with him.
 */

/** Stable RNG stream name used only for opportunity actor selection. */
const CHANCE_ACTORS_STREAM = "chance-actors";

/** Role weights used when choosing the chance creator from the attacking lineup. */
const CREATOR_ROLE_WEIGHTS_BY_CHANCE_TYPE: Readonly<Record<ShotChanceType, ChanceActorRoleWeights>> = {
  open_play: {
    attacker: 3,
    midfielder: 4,
    defender: 1,
    gk: 0,
  },
  counter: {
    attacker: 5,
    midfielder: 2,
    defender: 1,
    gk: 0,
  },
  cross: {
    attacker: 3,
    midfielder: 2,
    defender: 3,
    gk: 0,
  },
  dead_ball: {
    attacker: 2,
    midfielder: 3,
    defender: 2,
    gk: 0,
  },
};

/** Role weights used when choosing the shooter from the attacking lineup. */
const SHOOTER_ROLE_WEIGHTS: ChanceActorRoleWeights = {
  attacker: 5,
  midfielder: 3,
  defender: 1,
  gk: 0,
};

/** Role weights used when choosing the primary defender from the defending lineup. */
const PRIMARY_DEFENDER_ROLE_WEIGHTS: ChanceActorRoleWeights = {
  attacker: 1,
  midfielder: 3,
  defender: 5,
  gk: 0,
};

/**
 * Weight lookup over the total role-weight vocabulary.
 *
 * `roleWeightKeyForCanonicalRole` maps every canonical role onto exactly one of
 * these four keys, so the tables above are total and no fallback is needed. A
 * missing entry would be a build failure, not a value to guess at.
 */
type ChanceActorRoleWeights = Readonly<Record<ChanceActorRoleKey, number>>;

/** The four role-weight profile keys chance selection distinguishes. */
type ChanceActorRoleKey = "attacker" | "midfielder" | "defender" | "gk";

/**
 * Input needed to select actors for one attacking opportunity.
 */
export interface SelectChanceActorsInput {
  /** Run seed used by the match context. */
  readonly seed: string;
  /** Stable fixture identifier for the match. */
  readonly fixtureId: FixtureId;
  /** Simulated minute of the opportunity. */
  readonly minute: number;
  /** Side that created the attacking opportunity. */
  readonly attackingSide: MatchSide;
  /** Score before resolving this opportunity, used to distinguish contexts. */
  readonly scoreBeforeChance: MatchScore;
  /** Team context for the side creating the opportunity. */
  readonly attackingTeam: MatchTeamContext;
  /** Team context for the side defending the opportunity. */
  readonly defendingTeam: MatchTeamContext;
  /**
   * Structured source type for the chance, derived from the route it came down.
   *
   * The execution type is deliberately absent. It is decided *from* the shooter
   * this call returns - whether a cross is headed depends on who attacked it -
   * so keying selection on it would make the actors depend on a fact that does
   * not exist until they have been chosen.
   */
  readonly chanceType: ShotChanceType;
}

/**
 * Minimal set of nominal players involved in one opportunity.
 */
export interface ChanceActors {
  /** Attacking player who created the opportunity. */
  readonly creatorPlayerId: PlayerId;
  /** Attacking player who took the shot. */
  readonly shooterPlayerId: PlayerId;
  /** Defending outfield player most directly involved in the chance. */
  readonly primaryDefenderPlayerId: PlayerId;
  /** Defending goalkeeper for this opportunity. */
  readonly goalkeeperPlayerId: PlayerId;
  /**
   * Exact shooter pool used by this opportunity.
   *
   * The conversion owner consumes these ephemeral weights to centre the
   * selected shooter's execution edge on the distribution that actually chose
   * him. Keeping the pool here avoids a second task table or a reconstructed
   * selection after the actor is known.
   */
  readonly shooterSelectionPool: readonly ChanceActorSelectionWeight[];
}

/** One ephemeral actor-selection weight carried into occasion construction. */
export interface ChanceActorSelectionWeight {
  readonly playerId: PlayerId;
  readonly weight: number;
}

/**
 * Selects chance actors from explicit attacking and defending lineups.
 *
 * The selection uses a separate deterministic stream so introducing actor
 * selection does not consume the main match RNG. Goalkeepers are excluded from
 * attacking creator/shooter roles in this early causal model, while the
 * defending goalkeeper must come from the explicit `roleKey: "gk"` slot.
 *
 * @example
 * const actors = selectChanceActors({
 *   seed: context.seed,
 *   fixtureId: context.fixtureId,
 *   minute: 18,
 *   attackingSide: "home",
 *   scoreBeforeChance: { home: 0, away: 0 },
 *   attackingTeam: context.home,
 *   defendingTeam: context.away,
 *   chanceType: "open_play",
 * });
 */
export function selectChanceActors(input: SelectChanceActorsInput): ChanceActors {
  const creatorWeightForRole = (roleKey: string): number => chanceCreatorWeightForRole(roleKey, input.chanceType);
  const creatorCandidates = taskWeightedCandidates(
    input.attackingTeam,
    creatorWeightForRole,
    (profile) => creatorTaskQuality(profile, input.chanceType),
    CREATOR_TASK_WEIGHT_POLICY,
  );
  const shooterCandidates = taskWeightedCandidates(
    input.attackingTeam,
    chanceShooterWeightForRole,
    (profile) => shooterTaskQuality(profile, input.chanceType),
    SHOOTER_TASK_WEIGHT_POLICY,
  );
  const defenderCandidates = roleWeightedCandidates(
    input.defendingTeam.lineup,
    primaryDefenderWeightForRole,
  );
  const goalkeeperPlayerId = selectGoalkeeper(input.defendingTeam);

  if (creatorCandidates.length === 0 || shooterCandidates.length === 0) {
    throw new Error(`Cannot select ${input.attackingSide} chance actors without attacking outfield players`);
  }

  if (defenderCandidates.length === 0) {
    throw new Error(`Cannot select primary defender for ${input.defendingTeam.clubId} without defending outfield players`);
  }

  const rng = deriveRng(
    input.seed,
    CHANCE_ACTORS_STREAM,
    input.fixtureId,
    input.minute,
    input.attackingSide,
    input.scoreBeforeChance.home,
    input.scoreBeforeChance.away,
    input.chanceType,
  );
  const creatorPlayerId = pickWeightedPlayer(creatorCandidates, rng.nextFloat());
  const shooterPool = shooterCandidates;

  return {
    creatorPlayerId,
    shooterPlayerId: pickWeightedPlayer(shooterPool, rng.nextFloat()),
    primaryDefenderPlayerId: pickWeightedPlayer(defenderCandidates, rng.nextFloat()),
    goalkeeperPlayerId,
    shooterSelectionPool: shooterPool.map(({ slot, weight }) => ({
      playerId: slot.playerId,
      weight,
    })),
  };
}

/**
 * Returns the creator weight for a role key.
 *
 * Creator weights vary by chance type so goal creation does not always flow
 * through the same broad midfield pool. Open play still favors midfielders;
 * counters favor attackers; crosses give defenders and attackers more share;
 * dead balls keep a mixed outfield pool. Goalkeepers are excluded.
 *
 * @example
 * const weight = chanceCreatorWeightForRole("midfielder", "open_play");
 */
export function chanceCreatorWeightForRole(roleKey: string, chanceType: ShotChanceType = "open_play"): number {
  return CREATOR_ROLE_WEIGHTS_BY_CHANCE_TYPE[chanceType][roleKey as ChanceActorRoleKey];
}

/**
 * Returns the shooter weight for a role key.
 *
 * Attackers are favored as shooters, midfielders remain common, defenders are
 * rare, and goalkeepers are excluded from shooting in this early causal model.
 *
 * @example
 * const weight = chanceShooterWeightForRole("attacker");
 */
export function chanceShooterWeightForRole(roleKey: string): number {
  return SHOOTER_ROLE_WEIGHTS[roleKey as ChanceActorRoleKey];
}

/**
 * Returns the primary-defender weight for a role key.
 *
 * Defenders are favored, midfielders can be involved, attackers are rare, and
 * the goalkeeper is represented separately by `goalkeeperPlayerId`.
 *
 * @example
 * const weight = primaryDefenderWeightForRole("defender");
 */
export function primaryDefenderWeightForRole(roleKey: string): number {
  return PRIMARY_DEFENDER_ROLE_WEIGHTS[roleKey as ChanceActorRoleKey];
}

/**
 * Builds an ordered weighted candidate list from lineup slots.
 */
interface WeightedChanceActorCandidate {
  readonly slot: LineupSlot;
  readonly weight: number;
}

/** Builds role-only candidates for actors whose task quality is owned elsewhere. */
function roleWeightedCandidates(
  lineup: readonly LineupSlot[],
  weightForRole: (roleKey: string) => number,
): readonly WeightedChanceActorCandidate[] {
  const candidates: WeightedChanceActorCandidate[] = [];

  for (const slot of lineup) {
    const weight = weightForRole(roleWeightKeyForCanonicalRole(slot.canonicalRole));
    if (weight > 0) candidates.push({ slot, weight });
  }

  return candidates;
}

/**
 * Adds a centred within-pool skill multiplier to the existing role weight.
 *
 * Centring against the role-weighted pool keeps an ordinary player at `1` and
 * prevents raw squad quality from inflating every actor in a strong team. The
 * bounds keep role responsibility meaningful: skill distinguishes two players
 * asked to do the same job, but cannot turn a centre-back into the default
 * finisher merely because his attributes are unusual.
 */
function taskWeightedCandidates(
  team: MatchTeamContext,
  weightForRole: (roleKey: string) => number,
  taskQualityFor: (profile: MatchTeamContext["incidentProfiles"][number]) => number,
  policy: TaskWeightPolicy,
): readonly WeightedChanceActorCandidate[] {
  const roleCandidates = roleWeightedCandidates(team.lineup, weightForRole);
  const weightedQualityTotal = roleCandidates.reduce((total, candidate) =>
    total + candidate.weight * taskQualityFor(incidentProfileFor(team, candidate.slot.playerId)), 0);
  const roleWeightTotal = roleCandidates.reduce((total, candidate) => total + candidate.weight, 0);
  const poolMean = roleWeightTotal === 0 ? 0 : weightedQualityTotal / roleWeightTotal;

  return roleCandidates.map((candidate) => {
    const quality = taskQualityFor(incidentProfileFor(team, candidate.slot.playerId));
    const multiplier = clamp(
      1 + (quality - poolMean) / policy.divisor,
      policy.minimumMultiplier,
      policy.maximumMultiplier,
    );
    return { slot: candidate.slot, weight: candidate.weight * multiplier };
  });
}

/**
 * Selects the defending goalkeeper from explicit lineup order.
 */
function selectGoalkeeper(team: MatchTeamContext): PlayerId {
  for (const slot of team.lineup) {
    if (slot.canonicalRole === "goalkeeper") {
      return slot.playerId;
    }
  }

  throw new Error(`Cannot select goalkeeper for ${team.clubId} without a goalkeeper slot`);
}

/**
 * Picks one candidate by cumulative weight and lineup order.
 */
function pickWeightedPlayer(
  candidates: readonly WeightedChanceActorCandidate[],
  roll: number,
): PlayerId {
  const totalWeight = candidates.reduce((total, candidate) => total + candidate.weight, 0);
  const scaledRoll = roll * totalWeight;
  let cumulativeWeight = 0;

  for (const candidate of candidates) {
    cumulativeWeight += candidate.weight;

    if (scaledRoll < cumulativeWeight) {
      return candidate.slot.playerId;
    }
  }

  const fallbackSlot = candidates[candidates.length - 1];
  if (fallbackSlot === undefined) {
    throw new Error("Cannot pick chance actor from an empty candidate list");
  }

  return fallbackSlot.slot.playerId;
}

/** Task quality of the player working the chance, on the canonical 0..20 scale. */
function creatorTaskQuality(
  profile: MatchTeamContext["incidentProfiles"][number],
  chanceType: ShotChanceType,
): number {
  switch (chanceType) {
    case "open_play":
      return weightedMean([
        [profile.passing, 3], [profile.vision, 3], [profile.technique, 2],
        [profile.dribbling, 1], [profile.anticipation, 1],
      ]);
    case "counter":
      return weightedMean([
        [profile.passing, 2], [profile.vision, 2], [profile.technique, 1],
        [profile.pace, 2], [profile.dribbling, 2], [profile.anticipation, 1],
      ]);
    case "cross":
      return weightedMean([
        [profile.crossing, 4], [profile.vision, 2], [profile.technique, 2],
        [profile.passing, 1],
      ]);
    case "dead_ball":
      return weightedMean([
        [profile.freeKicks, 3], [profile.crossing, 2], [profile.passing, 2],
        [profile.vision, 2], [profile.technique, 1],
      ]);
  }
}

/** Task quality of the player finishing the chance, on the canonical 0..20 scale. */
function shooterTaskQuality(
  profile: MatchTeamContext["incidentProfiles"][number],
  chanceType: ShotChanceType,
): number {
  switch (chanceType) {
    case "open_play":
      return weightedMean([
        [profile.finishing, 3], [profile.composure, 2], [profile.technique, 1],
        [profile.anticipation, 1],
      ]);
    case "counter":
      return weightedMean([
        [profile.finishing, 3], [profile.composure, 2], [profile.pace, 2],
        [profile.anticipation, 1], [profile.technique, 1],
      ]);
    case "cross":
      return weightedMean([
        [profile.heading, 3], [profile.finishing, 2], [profile.anticipation, 1],
        [profile.composure, 1], [profile.strength, 1],
      ]);
    case "dead_ball":
      return weightedMean([
        [profile.freeKicks, 3], [profile.penalties, 2], [profile.technique, 2],
        [profile.composure, 2], [profile.finishing, 1],
      ]);
  }
}

/** Computes one explicit weighted mean without storing a derived player score. */
function weightedMean(entries: readonly (readonly [value: number, weight: number])[]): number {
  const totalWeight = entries.reduce((total, [, weight]) => total + weight, 0);
  return entries.reduce((total, [value, weight]) => total + value * weight, 0) / totalWeight;
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

interface TaskWeightPolicy {
  readonly divisor: number;
  readonly minimumMultiplier: number;
  readonly maximumMultiplier: number;
}

/** Creators own the chance without a second conversion-quality path. */
const CREATOR_TASK_WEIGHT_POLICY = {
  divisor: 10,
  minimumMultiplier: 0.625,
  maximumMultiplier: 1.375,
} as const satisfies TaskWeightPolicy;

/** Shooters already matter again when their named execution edge is resolved. */
const SHOOTER_TASK_WEIGHT_POLICY = {
  divisor: 70,
  minimumMultiplier: 0.95,
  maximumMultiplier: 1.05,
} as const satisfies TaskWeightPolicy;
