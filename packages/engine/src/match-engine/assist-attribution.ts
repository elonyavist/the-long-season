import type { FixtureId, PlayerId, ShotChanceType, ShotType } from "@game/domain";
import { deriveRng } from "@game/shared";

import type { MatchTeamContext } from "./match-context.ts";
import type { MatchScore, MatchSide } from "./match-simulation-state.ts";
import type { LineupSlot } from "./team-strength.ts";

/**
 * Engine-local deterministic assist attribution.
 *
 * Assists are optional and derived after a goal already exists. This module
 * never decides whether a goal is scored and never consumes the main match RNG.
 */

/** Stable RNG stream name used only for assist attribution. */
const ASSIST_ATTRIBUTION_STREAM = "assist-attribution";

/** Role weights used when choosing a creator from the scoring team's lineup. */
const ASSIST_CREATOR_ROLE_WEIGHTS: Readonly<Record<string, number>> = {
  attacker: 3,
  midfielder: 5,
  defender: 1.5,
  gk: 0,
};

/** Default creator weight for custom role keys unknown to this early engine step. */
const DEFAULT_ASSIST_CREATOR_WEIGHT = 1;

/**
 * Input needed to attribute an optional assist for one already-scored goal.
 */
export interface AttributeAssistInput {
  /** Run seed used by the match context. */
  readonly seed: string;
  /** Stable fixture identifier for the match. */
  readonly fixtureId: FixtureId;
  /** Simulated minute of the goal. */
  readonly minute: number;
  /** Side that scored the goal. */
  readonly side: MatchSide;
  /** Score before applying this goal, used to distinguish same-minute goals. */
  readonly scoreBeforeGoal: MatchScore;
  /** Team context for the scoring side. */
  readonly team: MatchTeamContext;
  /** Player credited with the goal. */
  readonly scorerPlayerId: PlayerId;
  /** Structured execution type for the shot. */
  readonly shotType: ShotType;
  /** Structured source type for the chance. */
  readonly chanceType: ShotChanceType;
}

/**
 * Result of deterministic optional assist attribution.
 */
export interface AssistAttribution {
  /** Player from the scoring team's lineup credited with the assist, when any. */
  readonly assistPlayerId: PlayerId | undefined;
}

/**
 * Chooses an optional assist for a goal.
 *
 * @example
 * const attribution = attributeAssist({
 *   seed: context.seed,
 *   fixtureId: context.fixtureId,
 *   minute: 42,
 *   side: "home",
 *   scoreBeforeGoal: { home: 1, away: 0 },
 *   team: context.home,
 *   scorerPlayerId,
 *   shotType: "normal",
 *   chanceType: "open_play",
 * });
 */
export function attributeAssist(input: AttributeAssistInput): AssistAttribution {
  const candidates = assistCandidates(input.team.lineup, input.scorerPlayerId);

  if (candidates.length === 0) {
    return { assistPlayerId: undefined };
  }

  const rng = deriveRng(
    input.seed,
    ASSIST_ATTRIBUTION_STREAM,
    input.fixtureId,
    input.minute,
    input.side,
    input.scoreBeforeGoal.home,
    input.scoreBeforeGoal.away,
    input.scorerPlayerId,
    input.shotType,
    input.chanceType,
  );
  const assistProbability = assistProbabilityForShot(input.shotType, input.chanceType);

  if (rng.nextFloat() >= assistProbability) {
    return { assistPlayerId: undefined };
  }

  return {
    assistPlayerId: pickWeightedAssistant(candidates, rng.nextFloat()),
  };
}

/**
 * Returns the creator weight for a role key.
 *
 * Midfielders are favored as chance creators, attackers remain plausible,
 * defenders are rare, and goalkeepers are excluded from this early assist step.
 *
 * @example
 * const creatorWeight = assistCreatorWeightForRole("midfielder");
 */
export function assistCreatorWeightForRole(roleKey: string): number {
  return ASSIST_CREATOR_ROLE_WEIGHTS[roleKey] ?? DEFAULT_ASSIST_CREATOR_WEIGHT;
}

/**
 * Derives the probability that a goal has an assist from structured shot data.
 */
function assistProbabilityForShot(shotType: ShotType, chanceType: ShotChanceType): number {
  if (chanceType === "dead_ball" || shotType === "set_piece") {
    return 0.25;
  }

  if (chanceType === "cross" && shotType === "header") {
    return 0.85;
  }

  if (chanceType === "cross") {
    return 0.75;
  }

  if (chanceType === "counter") {
    return 0.6;
  }

  return 0.5;
}

/**
 * Builds the assist candidate list from ordered lineup slots.
 */
function assistCandidates(lineup: readonly LineupSlot[], scorerPlayerId: PlayerId): readonly LineupSlot[] {
  const candidates: LineupSlot[] = [];

  for (const slot of lineup) {
    if (slot.playerId === scorerPlayerId) {
      continue;
    }

    if (assistCreatorWeightForRole(slot.roleKey) <= 0) {
      continue;
    }

    candidates.push(slot);
  }

  return candidates;
}

/**
 * Picks one lineup slot by cumulative creator weight and lineup order.
 */
function pickWeightedAssistant(lineup: readonly LineupSlot[], roll: number): PlayerId {
  const totalWeight = lineup.reduce((total, slot) => total + assistCreatorWeightForRole(slot.roleKey), 0);
  const scaledRoll = roll * totalWeight;
  let cumulativeWeight = 0;

  for (const slot of lineup) {
    cumulativeWeight += assistCreatorWeightForRole(slot.roleKey);

    if (scaledRoll < cumulativeWeight) {
      return slot.playerId;
    }
  }

  const fallbackSlot = lineup[lineup.length - 1];
  if (fallbackSlot === undefined) {
    throw new Error("Cannot pick assistant from an empty lineup");
  }

  return fallbackSlot.playerId;
}
