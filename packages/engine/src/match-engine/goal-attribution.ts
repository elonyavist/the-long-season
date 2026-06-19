import type { FixtureId, PlayerId } from "@game/domain";
import { deriveRng } from "@game/shared";

import type { MatchTeamContext } from "./match-context.ts";
import type { MatchScore, MatchSide } from "./match-simulation-state.ts";
import type { LineupSlot } from "./team-strength.ts";

/**
 * Engine-local deterministic goal scorer attribution.
 *
 * This module deliberately assigns only the scorer. Assists, shot creators,
 * defensive mistakes, and keeper events belong to later match-detail steps.
 */

/** Stable RNG stream name used only for goal scorer attribution. */
const GOAL_ATTRIBUTION_STREAM = "goal-attribution";

/** Role weights used when choosing a scorer from the scoring team's lineup. */
const GOAL_SCORER_ROLE_WEIGHTS: Readonly<Record<string, number>> = {
  attacker: 6,
  midfielder: 3,
  defender: 1,
  gk: 0.05,
};

/** Default scorer weight for custom role keys unknown to this early engine step. */
const DEFAULT_GOAL_SCORER_WEIGHT = 1;

/**
 * Input needed to attribute one already-scored goal.
 */
export interface AttributeGoalInput {
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
}

/**
 * Result of deterministic goal scorer attribution.
 */
export interface GoalAttribution {
  /** Player from the scoring team's explicit lineup who scored the goal. */
  readonly scorerPlayerId: PlayerId;
}

/**
 * Chooses one scorer from the scoring team's ordered lineup.
 *
 * The selection uses a separate deterministic stream so adding scorer
 * attribution does not consume the main match RNG and therefore does not change
 * shot generation, goals, or balance calibration.
 *
 * @example
 * const attribution = attributeGoal({
 *   seed: context.seed,
 *   fixtureId: context.fixtureId,
 *   minute: 42,
 *   side: "home",
 *   scoreBeforeGoal: { home: 1, away: 0 },
 *   team: context.home,
 * });
 */
export function attributeGoal(input: AttributeGoalInput): GoalAttribution {
  if (input.team.lineup.length === 0) {
    throw new Error(`Cannot attribute ${input.side} goal without lineup players`);
  }

  const rng = deriveRng(
    input.seed,
    GOAL_ATTRIBUTION_STREAM,
    input.fixtureId,
    input.minute,
    input.side,
    input.scoreBeforeGoal.home,
    input.scoreBeforeGoal.away,
  );

  return {
    scorerPlayerId: pickWeightedScorer(input.team.lineup, rng.nextFloat()),
  };
}

/**
 * Returns the scorer weight for a role key.
 *
 * Attackers are favored, midfielders remain plausible, defenders are rare, and
 * goalkeepers are near-zero but still possible for synthetic edge fixtures that
 * contain only goalkeeper slots.
 *
 * @example
 * const strikerWeight = goalScorerWeightForRole("attacker");
 */
export function goalScorerWeightForRole(roleKey: string): number {
  return GOAL_SCORER_ROLE_WEIGHTS[roleKey] ?? DEFAULT_GOAL_SCORER_WEIGHT;
}

/**
 * Picks one lineup slot by cumulative role weight and lineup order.
 */
function pickWeightedScorer(lineup: readonly LineupSlot[], roll: number): PlayerId {
  const totalWeight = lineup.reduce((total, slot) => total + goalScorerWeightForRole(slot.roleKey), 0);
  const scaledRoll = roll * totalWeight;
  let cumulativeWeight = 0;

  for (const slot of lineup) {
    cumulativeWeight += goalScorerWeightForRole(slot.roleKey);

    if (scaledRoll < cumulativeWeight) {
      return slot.playerId;
    }
  }

  const fallbackSlot = lineup[lineup.length - 1];
  if (fallbackSlot === undefined) {
    throw new Error("Cannot pick scorer from an empty lineup");
  }

  return fallbackSlot.playerId;
}
