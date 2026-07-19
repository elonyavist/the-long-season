import type { ClubCategory } from "@game/domain";

/** Club-strength tiers used by deterministic player generation. */
export type PlayerGenerationClubTier = "title_contender" | "playoff_contender" | "mid_table" | "survival";

/** Inclusive numeric band used by player-generation profiles. */
export interface PlayerGenerationBandRange {
  /** Lowest generated value for this band. */
  readonly minInclusive: number;
  /** Highest generated value for this band. */
  readonly maxInclusive: number;
}

/**
 * Ability bands for one division and club tier.
 *
 * The current band controls starting ability only. Reachable potential is
 * allocated later from the generated current profile, player age, role, and
 * rarity class.
 */
export interface PlayerGenerationBandProfile {
  /** Broad division/category where the club plays. */
  readonly division: ClubCategory;
  /** Strength tier inside that division. */
  readonly clubTier: PlayerGenerationClubTier;
  /** Current-ability anchor before role templates and archetype offsets. */
  readonly currentAbility: PlayerGenerationBandRange;
}

/** Explicit deterministic tier order for tests and reports. */
export const PLAYER_GENERATION_CLUB_TIERS: readonly PlayerGenerationClubTier[] = [
  "title_contender",
  "playoff_contender",
  "mid_table",
  "survival",
];

/** Explicit deterministic division order for tests and reports. */
export const PLAYER_GENERATION_DIVISIONS: readonly ClubCategory[] = [
  "first_division",
  "second_division",
  "third_division",
];

/** Content-owned ability bands by division and club tier. */
export const PLAYER_GENERATION_BANDS: Readonly<
  Record<ClubCategory, Readonly<Record<PlayerGenerationClubTier, PlayerGenerationBandProfile>>>
> = {
  first_division: {
    title_contender: band("first_division", "title_contender", [15.4, 18.2]),
    playoff_contender: band("first_division", "playoff_contender", [13.8, 16.2]),
    mid_table: band("first_division", "mid_table", [12.4, 14.6]),
    survival: band("first_division", "survival", [11, 13.2]),
  },
  second_division: {
    title_contender: band("second_division", "title_contender", [12.4, 14.2]),
    playoff_contender: band("second_division", "playoff_contender", [11.4, 13.1]),
    mid_table: band("second_division", "mid_table", [10.3, 12]),
    survival: band("second_division", "survival", [9.3, 10.8]),
  },
  third_division: {
    title_contender: band("third_division", "title_contender", [9.7, 11]),
    playoff_contender: band("third_division", "playoff_contender", [8.2, 9.7]),
    mid_table: band("third_division", "mid_table", [6.7, 8.2]),
    survival: band("third_division", "survival", [5.2, 6.7]),
  },
};

/**
 * Returns the band profile for one division and tier.
 */
export function getPlayerGenerationBand(
  division: ClubCategory,
  clubTier: PlayerGenerationClubTier,
): PlayerGenerationBandProfile {
  return PLAYER_GENERATION_BANDS[division][clubTier];
}

/**
 * Maps the current generated 18-club league order to a club tier.
 *
 * The early fake league intentionally orders stronger clubs first. Future
 * authored content can provide tier metadata directly instead of using this
 * generated-order helper.
 */
export function clubTierForGeneratedClubNumber(clubNumber: number): PlayerGenerationClubTier {
  if (clubNumber <= 4) {
    return "title_contender";
  }

  if (clubNumber <= 8) {
    return "playoff_contender";
  }

  if (clubNumber <= 14) {
    return "mid_table";
  }

  return "survival";
}

/** Builds a strongly typed band profile with compact data syntax. */
function band(
  division: ClubCategory,
  clubTier: PlayerGenerationClubTier,
  currentAbility: readonly [number, number],
): PlayerGenerationBandProfile {
  return {
    division,
    clubTier,
    currentAbility: { minInclusive: currentAbility[0], maxInclusive: currentAbility[1] },
  };
}
