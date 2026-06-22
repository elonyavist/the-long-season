import type { ClubCategory } from "@game/domain";

import type { GeneratedPlayerArchetypeKey, GeneratedPlayerPotentialClass } from "./player-archetypes.ts";

/** Product-facing potential rarity scale used by generation budgets and reports. */
export type PlayerPotentialRarityBand = "ordinary" | "interesting" | "high" | "elite";

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
  /** Elite-potential players across the whole division; often zero. */
  readonly elitePerDivision: PotentialRarityCountRange;
  /** Chance that the elite budget reaches `1` in a generated division/season. */
  readonly eliteChance: number;
  /** High-current lower-division exception stories. */
  readonly whiteFlyPerDivision: PotentialRarityCountRange;
}

/** Division-level potential-rarity budgets. */
export const DIVISION_POTENTIAL_RARITY_BUDGETS: Readonly<Record<ClubCategory, DivisionPotentialRarityBudget>> = {
  third_division: {
    ordinary: "majority",
    interestingPerClub: { minInclusive: 1, maxInclusive: 3 },
    highPerDivision: { minInclusive: 2, maxInclusive: 5 },
    elitePerDivision: { minInclusive: 0, maxInclusive: 1 },
    eliteChance: 0.35,
    whiteFlyPerDivision: { minInclusive: 1, maxInclusive: 4 },
  },
  second_division: {
    ordinary: "majority",
    interestingPerClub: { minInclusive: 1, maxInclusive: 3 },
    highPerDivision: { minInclusive: 3, maxInclusive: 6 },
    elitePerDivision: { minInclusive: 0, maxInclusive: 1 },
    eliteChance: 0.45,
    whiteFlyPerDivision: { minInclusive: 1, maxInclusive: 5 },
  },
  first_division: {
    ordinary: "majority",
    interestingPerClub: { minInclusive: 1, maxInclusive: 4 },
    highPerDivision: { minInclusive: 4, maxInclusive: 8 },
    elitePerDivision: { minInclusive: 0, maxInclusive: 1 },
    eliteChance: 0.55,
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

/** Returns the budget profile for one division. */
export function potentialRarityBudgetForDivision(division: ClubCategory): DivisionPotentialRarityBudget {
  return DIVISION_POTENTIAL_RARITY_BUDGETS[division];
}
