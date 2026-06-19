import type { FixtureId, PlayerId, ShotChanceType, ShotType } from "@game/domain";
import { deriveRng } from "@game/shared";

import type { MatchTeamContext } from "./match-context.ts";
import type { MatchScore, MatchSide } from "./match-simulation-state.ts";
import type { OccasionOutcome } from "./occasion-resolver.ts";
import type { LineupSlot } from "./team-strength.ts";

/**
 * Engine-local deterministic shot-taker attribution.
 *
 * The aggregate resolver still decides whether a shot is a goal, save, miss,
 * or block. This module only identifies the attacking player credited with the
 * shot and never consumes the main match RNG.
 */

/** Stable RNG stream name used only for non-goal shot-taker attribution. */
const SHOT_ATTRIBUTION_STREAM = "shot-attribution";

/** Role weights used when choosing a shooter from the attacking team's lineup. */
const SHOT_TAKER_ROLE_WEIGHTS: Readonly<Record<string, number>> = {
  attacker: 5,
  midfielder: 3,
  defender: 1,
  gk: 0,
};

/** Default shooter weight for custom role keys unknown to this early engine step. */
const DEFAULT_SHOT_TAKER_WEIGHT = 1;

/**
 * Input needed to attribute one already-resolved non-goal shot.
 */
export interface AttributeShotTakerInput {
  /** Run seed used by the match context. */
  readonly seed: string;
  /** Stable fixture identifier for the match. */
  readonly fixtureId: FixtureId;
  /** Simulated minute of the shot. */
  readonly minute: number;
  /** Side that took the shot. */
  readonly side: MatchSide;
  /** Score before applying this shot outcome, used to distinguish contexts. */
  readonly scoreBeforeShot: MatchScore;
  /** Team context for the attacking side. */
  readonly team: MatchTeamContext;
  /** Already-resolved shot outcome. */
  readonly outcome: Exclude<OccasionOutcome, "goal">;
  /** Structured execution type for the shot. */
  readonly shotType: ShotType;
  /** Structured source type for the chance. */
  readonly chanceType: ShotChanceType;
}

/**
 * Result of deterministic shot-taker attribution.
 */
export interface ShotTakerAttribution {
  /** Player from the attacking lineup credited with taking the shot. */
  readonly shooterPlayerId: PlayerId;
}

/**
 * Chooses one shooter from the attacking team's ordered lineup.
 *
 * @example
 * const attribution = attributeShotTaker({
 *   seed: context.seed,
 *   fixtureId: context.fixtureId,
 *   minute: 18,
 *   side: "home",
 *   scoreBeforeShot: { home: 0, away: 0 },
 *   team: context.home,
 *   outcome: "miss",
 *   shotType: "normal",
 *   chanceType: "open_play",
 * });
 */
export function attributeShotTaker(input: AttributeShotTakerInput): ShotTakerAttribution {
  const candidates = shotTakerCandidates(input.team.lineup);

  if (candidates.length === 0) {
    throw new Error(`Cannot attribute ${input.side} shot without lineup players`);
  }

  const rng = deriveRng(
    input.seed,
    SHOT_ATTRIBUTION_STREAM,
    input.fixtureId,
    input.minute,
    input.side,
    input.scoreBeforeShot.home,
    input.scoreBeforeShot.away,
    input.outcome,
    input.shotType,
    input.chanceType,
  );

  return {
    shooterPlayerId: pickWeightedShooter(candidates, rng.nextFloat()),
  };
}

/**
 * Returns the shooter weight for a role key.
 *
 * Attackers are favored, midfielders remain common, defenders are rare, and
 * goalkeepers are excluded when any outfield candidate exists.
 *
 * @example
 * const weight = shotTakerWeightForRole("attacker");
 */
export function shotTakerWeightForRole(roleKey: string): number {
  return SHOT_TAKER_ROLE_WEIGHTS[roleKey] ?? DEFAULT_SHOT_TAKER_WEIGHT;
}

/**
 * Builds the ordered shot-taker candidate list from lineup slots.
 */
function shotTakerCandidates(lineup: readonly LineupSlot[]): readonly LineupSlot[] {
  const weightedCandidates: LineupSlot[] = [];

  for (const slot of lineup) {
    if (shotTakerWeightForRole(slot.roleKey) > 0) {
      weightedCandidates.push(slot);
    }
  }

  if (weightedCandidates.length > 0) {
    return weightedCandidates;
  }

  return lineup;
}

/**
 * Picks one lineup slot by cumulative shooter weight and lineup order.
 */
function pickWeightedShooter(lineup: readonly LineupSlot[], roll: number): PlayerId {
  const totalWeight = lineup.reduce((total, slot) => total + fallbackShotTakerWeight(slot.roleKey), 0);
  const scaledRoll = roll * totalWeight;
  let cumulativeWeight = 0;

  for (const slot of lineup) {
    cumulativeWeight += fallbackShotTakerWeight(slot.roleKey);

    if (scaledRoll < cumulativeWeight) {
      return slot.playerId;
    }
  }

  const fallbackSlot = lineup[lineup.length - 1];
  if (fallbackSlot === undefined) {
    throw new Error("Cannot pick shooter from an empty lineup");
  }

  return fallbackSlot.playerId;
}

/**
 * Returns a positive weight for candidate picking, including goalkeeper-only lineups.
 */
function fallbackShotTakerWeight(roleKey: string): number {
  const roleWeight = shotTakerWeightForRole(roleKey);
  return roleWeight > 0 ? roleWeight : 1;
}
