/** Stable keys for generated player archetypes used by career world creation. */
export type GeneratedPlayerArchetypeKey =
  | "senior_regular"
  | "category_starter"
  | "category_star"
  | "veteran_drop_down"
  | "normal_youth"
  | "good_prospect"
  | "serious_prospect"
  | "rare_prodigy";

/** Stable depth-role keys used by generated squad composition. */
export type GeneratedPlayerDepthRole = "starter" | "rotation" | "depth" | "prospect";

/** Broad potential class used by tests and quality reports. */
export type GeneratedPlayerPotentialClass = "limited" | "category" | "interesting" | "serious" | "elite";

/** Inclusive numeric range used by deterministic content generators. */
export interface GeneratedPlayerRange {
  /** Minimum inclusive value. */
  readonly minInclusive: number;
  /** Maximum inclusive value. */
  readonly maxInclusive: number;
}

/**
 * Content-owned archetype definition for one generated player.
 *
 * Archetypes are generation data, not UI labels. Presentation layers can map
 * the stable `key` later if they need to show a localized summary.
 */
export interface GeneratedPlayerArchetype {
  /** Stable machine key for the archetype. */
  readonly key: GeneratedPlayerArchetypeKey;
  /** Coarse squad-depth role implied by the archetype. */
  readonly depthRole: GeneratedPlayerDepthRole;
  /** Age range in years at career start. */
  readonly ageYears: GeneratedPlayerRange;
  /** Ability adjustment applied to the club/slot base ability. */
  readonly currentAbilityOffset: GeneratedPlayerRange;
  /** Potential uplift above generated current ability. */
  readonly potentialUplift: GeneratedPlayerRange;
  /** Broad machine-readable potential class; not a user-facing label. */
  readonly potentialClass: GeneratedPlayerPotentialClass;
  /** Relative selection weight for the first-team 11. */
  readonly lineupWeight: number;
  /** Relative selection weight for reserve squad slots. */
  readonly reserveWeight: number;
}

/** Explicit deterministic archetype order used by generators and tests. */
export const GENERATED_PLAYER_ARCHETYPE_KEYS: readonly GeneratedPlayerArchetypeKey[] = [
  "senior_regular",
  "category_starter",
  "category_star",
  "veteran_drop_down",
  "normal_youth",
  "good_prospect",
  "serious_prospect",
  "rare_prodigy",
];

/** Content-owned archetype definitions for initial generated career squads. */
export const GENERATED_PLAYER_ARCHETYPES: Readonly<Record<GeneratedPlayerArchetypeKey, GeneratedPlayerArchetype>> = {
  senior_regular: {
    key: "senior_regular",
    depthRole: "rotation",
    ageYears: { minInclusive: 23, maxInclusive: 29 },
    currentAbilityOffset: { minInclusive: -0.3, maxInclusive: 0.5 },
    potentialUplift: { minInclusive: 0.5, maxInclusive: 2 },
    potentialClass: "category",
    lineupWeight: 30,
    reserveWeight: 12,
  },
  category_starter: {
    key: "category_starter",
    depthRole: "starter",
    ageYears: { minInclusive: 24, maxInclusive: 30 },
    currentAbilityOffset: { minInclusive: 0.2, maxInclusive: 0.9 },
    potentialUplift: { minInclusive: 0.5, maxInclusive: 1.5 },
    potentialClass: "category",
    lineupWeight: 34,
    reserveWeight: 8,
  },
  category_star: {
    key: "category_star",
    depthRole: "starter",
    ageYears: { minInclusive: 24, maxInclusive: 32 },
    currentAbilityOffset: { minInclusive: 1, maxInclusive: 1.8 },
    potentialUplift: { minInclusive: 0, maxInclusive: 1 },
    potentialClass: "category",
    lineupWeight: 4,
    reserveWeight: 1,
  },
  veteran_drop_down: {
    key: "veteran_drop_down",
    depthRole: "rotation",
    ageYears: { minInclusive: 31, maxInclusive: 37 },
    currentAbilityOffset: { minInclusive: 0.6, maxInclusive: 1.5 },
    potentialUplift: { minInclusive: 0, maxInclusive: 0.4 },
    potentialClass: "limited",
    lineupWeight: 8,
    reserveWeight: 7,
  },
  normal_youth: {
    key: "normal_youth",
    depthRole: "prospect",
    ageYears: { minInclusive: 17, maxInclusive: 21 },
    currentAbilityOffset: { minInclusive: -2.6, maxInclusive: -1.2 },
    potentialUplift: { minInclusive: 2, maxInclusive: 4.5 },
    potentialClass: "interesting",
    lineupWeight: 2,
    reserveWeight: 32,
  },
  good_prospect: {
    key: "good_prospect",
    depthRole: "prospect",
    ageYears: { minInclusive: 16, maxInclusive: 20 },
    currentAbilityOffset: { minInclusive: -3.2, maxInclusive: -1.8 },
    potentialUplift: { minInclusive: 4, maxInclusive: 6.5 },
    potentialClass: "interesting",
    lineupWeight: 1,
    reserveWeight: 14,
  },
  serious_prospect: {
    key: "serious_prospect",
    depthRole: "prospect",
    ageYears: { minInclusive: 16, maxInclusive: 19 },
    currentAbilityOffset: { minInclusive: -4, maxInclusive: -2.4 },
    potentialUplift: { minInclusive: 6.5, maxInclusive: 9 },
    potentialClass: "serious",
    lineupWeight: 0,
    reserveWeight: 3,
  },
  rare_prodigy: {
    key: "rare_prodigy",
    depthRole: "prospect",
    ageYears: { minInclusive: 15, maxInclusive: 18 },
    currentAbilityOffset: { minInclusive: -4.5, maxInclusive: -2.5 },
    potentialUplift: { minInclusive: 9, maxInclusive: 12 },
    potentialClass: "elite",
    lineupWeight: 0,
    reserveWeight: 1,
  },
};

/**
 * Returns one generated player archetype by stable key.
 */
export function getGeneratedPlayerArchetype(key: GeneratedPlayerArchetypeKey): GeneratedPlayerArchetype {
  return GENERATED_PLAYER_ARCHETYPES[key];
}
