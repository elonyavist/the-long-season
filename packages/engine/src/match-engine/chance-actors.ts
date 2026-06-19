import type { FixtureId, PlayerId, ShotChanceType, ShotType } from "@game/domain";
import { deriveRng } from "@game/shared";

import type { MatchTeamContext } from "./match-context.ts";
import type { MatchScore, MatchSide } from "./match-simulation-state.ts";
import type { LineupSlot } from "./team-strength.ts";

/**
 * Engine-local deterministic actor selection for one attacking opportunity.
 *
 * This module chooses the nominal players involved in a chance before later
 * steps wire that data into match stepping and durable reports. It deliberately
 * does not decide whether the chance becomes a goal, save, miss, or block.
 */

/** Stable RNG stream name used only for opportunity actor selection. */
const CHANCE_ACTORS_STREAM = "chance-actors";

/** Role weights used when choosing the chance creator from the attacking lineup. */
const CREATOR_ROLE_WEIGHTS: Readonly<Record<string, number>> = {
  attacker: 3,
  midfielder: 5,
  defender: 1,
  gk: 0,
};

/** Role weights used when choosing the shooter from the attacking lineup. */
const SHOOTER_ROLE_WEIGHTS: Readonly<Record<string, number>> = {
  attacker: 5,
  midfielder: 3,
  defender: 1,
  gk: 0,
};

/** Role weights used when choosing the primary defender from the defending lineup. */
const PRIMARY_DEFENDER_ROLE_WEIGHTS: Readonly<Record<string, number>> = {
  attacker: 1,
  midfielder: 3,
  defender: 5,
  gk: 0,
};

/** Default positive weight for custom outfield role keys unknown to this early engine step. */
const DEFAULT_OUTFIELD_ROLE_WEIGHT = 1;

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
  /** Structured execution type for the eventual shot. */
  readonly shotType: ShotType;
  /** Structured source type for the chance. */
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
 *   shotType: "normal",
 *   chanceType: "open_play",
 * });
 */
export function selectChanceActors(input: SelectChanceActorsInput): ChanceActors {
  const creatorCandidates = weightedCandidates(input.attackingTeam.lineup, chanceCreatorWeightForRole);
  const shooterCandidates = weightedCandidates(input.attackingTeam.lineup, chanceShooterWeightForRole);
  const defenderCandidates = weightedCandidates(input.defendingTeam.lineup, primaryDefenderWeightForRole);
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
    input.shotType,
    input.chanceType,
  );
  const creatorPlayerId = pickWeightedPlayer(creatorCandidates, chanceCreatorWeightForRole, rng.nextFloat());
  const shooterPool = excludePlayerWhenPossible(shooterCandidates, creatorPlayerId);

  return {
    creatorPlayerId,
    shooterPlayerId: pickWeightedPlayer(shooterPool, chanceShooterWeightForRole, rng.nextFloat()),
    primaryDefenderPlayerId: pickWeightedPlayer(defenderCandidates, primaryDefenderWeightForRole, rng.nextFloat()),
    goalkeeperPlayerId,
  };
}

/**
 * Returns the creator weight for a role key.
 *
 * Midfielders are favored as creators, attackers remain common, defenders are
 * rare, and goalkeepers are excluded from attacking creation.
 *
 * @example
 * const weight = chanceCreatorWeightForRole("midfielder");
 */
export function chanceCreatorWeightForRole(roleKey: string): number {
  return CREATOR_ROLE_WEIGHTS[roleKey] ?? DEFAULT_OUTFIELD_ROLE_WEIGHT;
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
  return SHOOTER_ROLE_WEIGHTS[roleKey] ?? DEFAULT_OUTFIELD_ROLE_WEIGHT;
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
  return PRIMARY_DEFENDER_ROLE_WEIGHTS[roleKey] ?? DEFAULT_OUTFIELD_ROLE_WEIGHT;
}

/**
 * Builds an ordered weighted candidate list from lineup slots.
 */
function weightedCandidates(
  lineup: readonly LineupSlot[],
  weightForRole: (roleKey: string) => number,
): readonly LineupSlot[] {
  const candidates: LineupSlot[] = [];

  for (const slot of lineup) {
    if (weightForRole(slot.roleKey) > 0) {
      candidates.push(slot);
    }
  }

  return candidates;
}

/**
 * Removes a player from a candidate list when at least one alternative exists.
 */
function excludePlayerWhenPossible(candidates: readonly LineupSlot[], playerId: PlayerId): readonly LineupSlot[] {
  const alternatives: LineupSlot[] = [];

  for (const candidate of candidates) {
    if (candidate.playerId !== playerId) {
      alternatives.push(candidate);
    }
  }

  return alternatives.length > 0 ? alternatives : candidates;
}

/**
 * Selects the defending goalkeeper from explicit lineup order.
 */
function selectGoalkeeper(team: MatchTeamContext): PlayerId {
  for (const slot of team.lineup) {
    if (slot.roleKey === "gk") {
      return slot.playerId;
    }
  }

  throw new Error(`Cannot select goalkeeper for ${team.clubId} without a goalkeeper slot`);
}

/**
 * Picks one candidate by cumulative weight and lineup order.
 */
function pickWeightedPlayer(
  candidates: readonly LineupSlot[],
  weightForRole: (roleKey: string) => number,
  roll: number,
): PlayerId {
  const totalWeight = candidates.reduce((total, slot) => total + weightForRole(slot.roleKey), 0);
  const scaledRoll = roll * totalWeight;
  let cumulativeWeight = 0;

  for (const slot of candidates) {
    cumulativeWeight += weightForRole(slot.roleKey);

    if (scaledRoll < cumulativeWeight) {
      return slot.playerId;
    }
  }

  const fallbackSlot = candidates[candidates.length - 1];
  if (fallbackSlot === undefined) {
    throw new Error("Cannot pick chance actor from an empty candidate list");
  }

  return fallbackSlot.playerId;
}
