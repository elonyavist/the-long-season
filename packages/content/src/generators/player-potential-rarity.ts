import type { ClubCategory, PlayerStarRating } from "@game/domain";

import type { GeneratedPlayerArchetypeKey, GeneratedPlayerPotentialClass } from "./player-archetypes.ts";
import type { CurrentAbilityRarityLane } from "./player-current-ability-bands.ts";

/** Product-facing potential rarity scale used by generation budgets and reports. */
export type PlayerPotentialRarityBand = "ordinary" | "interesting" | "high" | "elite";

/**
 * Contextual youth class used to decide whether a generated ceiling receives
 * a division-specific prospect band.
 *
 * This is intentionally separate from `GeneratedPlayerPotentialClass`:
 * `normal_youth` and `good_prospect` share the same broad growth-budget class,
 * but only the latter is a genuine interesting prospect. Keeping `routine`
 * explicit prevents ordinary academy players from inheriting a serious floor.
 */
export type ContextualProspectClass = "routine" | "interesting" | "serious" | "rare";

/** Inclusive public-star band for one contextual prospect class. */
export interface ContextualProspectCeilingRatingBand {
  /** Lowest allowed stored-ceiling rating. */
  readonly minimumRating: PlayerStarRating;
  /** Highest allowed stored-ceiling rating. */
  readonly maximumRating: PlayerStarRating;
  /** Explicit outcome weighting inside the inclusive half-star band. */
  readonly selection:
    | Readonly<{ readonly kind: "uniform" }>
    | Readonly<{
        readonly kind: "weighted_maximum";
        readonly maximumRatingBasisPoints: number;
      }>;
}

/** Prospect classes that own an explicit division ceiling band. */
export type BandedContextualProspectClass = Exclude<ContextualProspectClass, "routine">;

/**
 * Accepted Phase 80A prospect-ceiling matrix.
 *
 * Routine players are deliberately absent: their reachable potential remains
 * the result of the age/role growth allocator and receives no contextual
 * minimum. Future countries reuse this national football-context policy from
 * their own world composition root instead of multiplying it here.
 */
export const CONTEXTUAL_PROSPECT_CEILING_RATING_BANDS: Readonly<
  Record<ClubCategory, Readonly<Record<BandedContextualProspectClass, ContextualProspectCeilingRatingBand>>>
> = {
  third_division: {
    interesting: ceilingBand(2.5, 3.5, {
      kind: "weighted_maximum",
      maximumRatingBasisPoints: 2_500,
    }),
    serious: ceilingBand(3.5, 4),
    rare: ceilingBand(5, 6),
  },
  second_division: {
    interesting: ceilingBand(3, 3.5),
    serious: ceilingBand(3.5, 4.5),
    rare: ceilingBand(5, 6),
  },
  first_division: {
    interesting: ceilingBand(3.5, 4),
    serious: ceilingBand(4, 5),
    rare: ceilingBand(5.5, 6),
  },
};

/** Lower-division white-fly story type. */
export type WhiteFlyStoryKind = "high_current_specialist" | "veteran_drop_down" | "high_potential_young_player";

/** Explicit deterministic potential-rarity order. */
export const PLAYER_POTENTIAL_RARITY_BANDS: readonly PlayerPotentialRarityBand[] = [
  "ordinary",
  "interesting",
  "high",
  "elite",
];

/** Inclusive count range for one league/division/season rarity budget. */
export interface PotentialRarityCountRange {
  /** Minimum count. */
  readonly minInclusive: number;
  /** Maximum count. */
  readonly maxInclusive: number;
}

/** Rarity budget for one division and season. */
export interface DivisionPotentialRarityBudget {
  /** Routine players; this should remain the majority of every generated league. */
  readonly ordinary: "majority";
  /** Players worth monitoring, but not guaranteed to become first-division quality. */
  readonly interestingPerClub: PotentialRarityCountRange;
  /** Strong future candidates across the whole division. */
  readonly highPerDivision: PotentialRarityCountRange;
  /** High-current lower-division exception stories. */
  readonly whiteFlyPerDivision: PotentialRarityCountRange;
}

/** Division-level potential-rarity budgets. */
export const DIVISION_POTENTIAL_RARITY_BUDGETS: Readonly<Record<ClubCategory, DivisionPotentialRarityBudget>> = {
  third_division: {
    ordinary: "majority",
    interestingPerClub: { minInclusive: 1, maxInclusive: 3 },
    highPerDivision: { minInclusive: 2, maxInclusive: 5 },
    whiteFlyPerDivision: { minInclusive: 1, maxInclusive: 4 },
  },
  second_division: {
    ordinary: "majority",
    interestingPerClub: { minInclusive: 1, maxInclusive: 3 },
    highPerDivision: { minInclusive: 3, maxInclusive: 6 },
    whiteFlyPerDivision: { minInclusive: 1, maxInclusive: 5 },
  },
  first_division: {
    ordinary: "majority",
    interestingPerClub: { minInclusive: 1, maxInclusive: 4 },
    highPerDivision: { minInclusive: 4, maxInclusive: 8 },
    whiteFlyPerDivision: { minInclusive: 1, maxInclusive: 5 },
  },
};

/** Maps existing generation archetypes onto the Phase 33 potential rarity scale. */
export function potentialRarityForArchetype(key: GeneratedPlayerArchetypeKey): PlayerPotentialRarityBand {
  switch (key) {
    case "senior_regular":
    case "category_starter":
    case "category_star":
    case "veteran_drop_down":
      return "ordinary";
    case "normal_youth":
    case "good_prospect":
      return "interesting";
    case "serious_prospect":
      return "high";
    case "rare_prodigy":
      return "elite";
  }
}

/** Maps the older content potential class to the Phase 33 potential rarity scale. */
export function potentialRarityForPotentialClass(potentialClass: GeneratedPlayerPotentialClass): PlayerPotentialRarityBand {
  switch (potentialClass) {
    case "limited":
    case "category":
      return "ordinary";
    case "interesting":
      return "interesting";
    case "serious":
      return "high";
    case "elite":
      return "elite";
  }
}

/**
 * Maps generated archetypes onto the contextual prospect-ceiling policy.
 *
 * Senior profiles and normal youth stay routine. In particular, this mapping
 * must not be replaced with a direct mapping from `potentialClass`, because
 * doing so would promote every `normal_youth` player into the interesting
 * ceiling matrix.
 */
export function contextualProspectClassForArchetype(
  archetypeKey: GeneratedPlayerArchetypeKey,
): ContextualProspectClass {
  switch (archetypeKey) {
    case "senior_regular":
    case "category_starter":
    case "category_star":
    case "veteran_drop_down":
    case "normal_youth":
      return "routine";
    case "good_prospect":
      return "interesting";
    case "serious_prospect":
      return "serious";
    case "rare_prodigy":
      return "rare";
  }
}

/** Returns the accepted ceiling band, or `undefined` for routine generation. */
export function contextualProspectCeilingRatingBand(
  division: ClubCategory,
  prospectClass: ContextualProspectClass,
): ContextualProspectCeilingRatingBand | undefined {
  return prospectClass === "routine"
    ? undefined
    : CONTEXTUAL_PROSPECT_CEILING_RATING_BANDS[division][prospectClass];
}

/**
 * Maps a youth archetype and academy level to the bounded current-profile lane.
 *
 * Youth development level can add a small current-quality nudge only for
 * prospects that are already interesting or better. Ordinary academy players
 * stay ordinary-current even at excellent academies.
 */
export function currentAbilityRarityLaneForYouthProspect(
  archetypeKey: GeneratedPlayerArchetypeKey,
  youthDevelopmentLevel: number,
): CurrentAbilityRarityLane {
  const prospectClass = contextualProspectClassForArchetype(archetypeKey);

  if (prospectClass === "rare" || prospectClass === "serious") {
    return youthDevelopmentLevel >= 4 ? "rare" : "normal";
  }

  if (prospectClass === "interesting") {
    return youthDevelopmentLevel >= 5 ? "rare" : "normal";
  }

  return "normal";
}

/** Returns the budget profile for one division. */
export function potentialRarityBudgetForDivision(division: ClubCategory): DivisionPotentialRarityBudget {
  return DIVISION_POTENTIAL_RARITY_BUDGETS[division];
}

function ceilingBand(
  minimumRating: PlayerStarRating,
  maximumRating: PlayerStarRating,
  selection: ContextualProspectCeilingRatingBand["selection"] = {
    kind: "uniform",
  },
): ContextualProspectCeilingRatingBand {
  return { minimumRating, maximumRating, selection };
}
