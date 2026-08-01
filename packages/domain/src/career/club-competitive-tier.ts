import type { ClubCategory, ClubCompetitiveTier } from "../entities/club.entity.ts";
import type { GameState } from "../state/game-state.ts";
import type { ClubId, SeasonId } from "../types/ids.ts";

/** Durable policy stamp for the first dynamic competitive-tier model. */
export const CLUB_COMPETITIVE_TIER_POLICY_VERSION = "club-competitive-tier-v1";

/** Ordered strongest-to-weakest tiers used by ranking and presentation. */
export const CLUB_COMPETITIVE_TIERS: readonly ClubCompetitiveTier[] = [
  "title_contender",
  "playoff_contender",
  "mid_table",
  "survival",
];

/** One season-frozen tier for every active club. */
export interface ClubCompetitiveTierState {
  /** Version of the ranking policy that produced these assignments. */
  readonly policyVersion: typeof CLUB_COMPETITIVE_TIER_POLICY_VERSION;
  /** Active season for which assignments remain immutable. */
  readonly seasonId: SeasonId;
  /** Exact active-club assignment lookup. */
  readonly tierByClubId: Readonly<Record<ClubId, ClubCompetitiveTier>>;
}

/** Machine-readable invalid competitive-tier state. */
export type ClubCompetitiveTierStateErrorCode =
  | "competitive_tier_policy_version_invalid"
  | "competitive_tier_season_mismatch"
  | "competitive_tier_club_missing"
  | "competitive_tier_unknown_club"
  | "competitive_tier_value_invalid";

/** Typed failure raised when a frozen tier snapshot is incomplete or stale. */
export class ClubCompetitiveTierStateError extends Error {
  public readonly code: ClubCompetitiveTierStateErrorCode;

  public constructor(code: ClubCompetitiveTierStateErrorCode, message: string) {
    super(message);
    this.name = "ClubCompetitiveTierStateError";
    this.code = code;
  }
}

/**
 * Validates and copies one complete season-frozen tier snapshot.
 *
 * Every active club must appear exactly once and no stale club may remain.
 */
export function createClubCompetitiveTierState(
  input: ClubCompetitiveTierState,
  activeClubIds: readonly ClubId[],
  activeSeasonId: SeasonId,
): ClubCompetitiveTierState {
  if (input.policyVersion !== CLUB_COMPETITIVE_TIER_POLICY_VERSION) {
    throw new ClubCompetitiveTierStateError(
      "competitive_tier_policy_version_invalid",
      `unsupported club competitive-tier policy: ${String(input.policyVersion)}`,
    );
  }
  if (input.seasonId !== activeSeasonId) {
    throw new ClubCompetitiveTierStateError(
      "competitive_tier_season_mismatch",
      `club competitive tiers belong to ${input.seasonId}, expected ${activeSeasonId}`,
    );
  }

  const active = new Set(activeClubIds);
  const tierByClubId = {} as Record<ClubId, ClubCompetitiveTier>;
  for (const clubId of activeClubIds) {
    const tier = input.tierByClubId[clubId];
    if (tier === undefined) {
      throw new ClubCompetitiveTierStateError(
        "competitive_tier_club_missing",
        `active club has no competitive tier: ${clubId}`,
      );
    }
    if (!isClubCompetitiveTier(tier)) {
      throw new ClubCompetitiveTierStateError(
        "competitive_tier_value_invalid",
        `invalid competitive tier for ${clubId}: ${String(tier)}`,
      );
    }
    tierByClubId[clubId] = tier;
  }

  for (const clubId of Object.keys(input.tierByClubId) as ClubId[]) {
    if (!active.has(clubId)) {
      throw new ClubCompetitiveTierStateError(
        "competitive_tier_unknown_club",
        `competitive tier references an inactive club: ${clubId}`,
      );
    }
  }

  return {
    policyVersion: CLUB_COMPETITIVE_TIER_POLICY_VERSION,
    seasonId: input.seasonId,
    tierByClubId,
  };
}

/**
 * Builds the first frozen snapshot from authored club order.
 *
 * New generated worlds already order clubs strongest-to-weakest inside each
 * division. Later seasons replace this bootstrap with the roster/result model.
 */
export function createInitialClubCompetitiveTierState(gameState: GameState): ClubCompetitiveTierState {
  const tierByClubId = {} as Record<ClubId, ClubCompetitiveTier>;
  const categories: readonly ClubCategory[] = [
    "first_division",
    "second_division",
    "third_division",
  ];

  for (const category of categories) {
    const divisionClubIds = gameState.clubIds.filter(
      (clubId) => gameState.clubs[clubId]?.category === category,
    );
    divisionClubIds.forEach((clubId, index) => {
      tierByClubId[clubId] = competitiveTierForRank(index + 1);
    });
  }

  return createClubCompetitiveTierState(
    {
      policyVersion: CLUB_COMPETITIVE_TIER_POLICY_VERSION,
      seasonId: gameState.calendar.currentSeasonId,
      tierByClubId,
    },
    gameState.clubIds,
    gameState.calendar.currentSeasonId,
  );
}

/** Returns the fixed 4/4/6/4 tier bucket for a 1-based division rank. */
export function competitiveTierForRank(rank: number): ClubCompetitiveTier {
  if (!Number.isSafeInteger(rank) || rank <= 0) {
    throw new RangeError(`competitive tier rank must be a positive safe integer: ${rank}`);
  }
  if (rank <= 4) return "title_contender";
  if (rank <= 8) return "playoff_contender";
  if (rank <= 14) return "mid_table";
  return "survival";
}

/** Reads one required active-club tier without a presentation fallback. */
export function clubCompetitiveTierFor(
  state: ClubCompetitiveTierState,
  clubId: ClubId,
): ClubCompetitiveTier {
  const tier = state.tierByClubId[clubId];
  if (tier === undefined) {
    throw new ClubCompetitiveTierStateError(
      "competitive_tier_club_missing",
      `active club has no competitive tier: ${clubId}`,
    );
  }
  return tier;
}

function isClubCompetitiveTier(value: unknown): value is ClubCompetitiveTier {
  return CLUB_COMPETITIVE_TIERS.some((tier) => tier === value);
}
