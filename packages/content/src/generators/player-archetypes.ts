/** Stable keys for generated player archetypes used by career world creation. */
export type GeneratedPlayerArchetypeKey =
  | "first_team_regular"
  | "rotation_player"
  | "veteran"
  | "prospect"
  | "high_potential_prospect"
  | "rare_wonderkid";

/** Stable depth-role keys used by generated squad composition. */
export type GeneratedPlayerDepthRole = "starter" | "rotation" | "depth" | "prospect";

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
  /** Relative selection weight for the first-team 11. */
  readonly lineupWeight: number;
  /** Relative selection weight for reserve squad slots. */
  readonly reserveWeight: number;
}

/** Explicit deterministic archetype order used by generators and tests. */
export const GENERATED_PLAYER_ARCHETYPE_KEYS: readonly GeneratedPlayerArchetypeKey[] = [
  "first_team_regular",
  "rotation_player",
  "veteran",
  "prospect",
  "high_potential_prospect",
  "rare_wonderkid",
];

/** Content-owned archetype definitions for initial generated career squads. */
export const GENERATED_PLAYER_ARCHETYPES: Readonly<Record<GeneratedPlayerArchetypeKey, GeneratedPlayerArchetype>> = {
  first_team_regular: {
    key: "first_team_regular",
    depthRole: "starter",
    ageYears: { minInclusive: 23, maxInclusive: 29 },
    currentAbilityOffset: { minInclusive: 0, maxInclusive: 1 },
    potentialUplift: { minInclusive: 1, maxInclusive: 3 },
    lineupWeight: 42,
    reserveWeight: 10,
  },
  rotation_player: {
    key: "rotation_player",
    depthRole: "rotation",
    ageYears: { minInclusive: 22, maxInclusive: 31 },
    currentAbilityOffset: { minInclusive: -1, maxInclusive: 0 },
    potentialUplift: { minInclusive: 1, maxInclusive: 3 },
    lineupWeight: 18,
    reserveWeight: 34,
  },
  veteran: {
    key: "veteran",
    depthRole: "rotation",
    ageYears: { minInclusive: 30, maxInclusive: 36 },
    currentAbilityOffset: { minInclusive: 0, maxInclusive: 2 },
    potentialUplift: { minInclusive: 0, maxInclusive: 1 },
    lineupWeight: 14,
    reserveWeight: 16,
  },
  prospect: {
    key: "prospect",
    depthRole: "prospect",
    ageYears: { minInclusive: 17, maxInclusive: 21 },
    currentAbilityOffset: { minInclusive: -3, maxInclusive: -1 },
    potentialUplift: { minInclusive: 3, maxInclusive: 6 },
    lineupWeight: 3,
    reserveWeight: 24,
  },
  high_potential_prospect: {
    key: "high_potential_prospect",
    depthRole: "prospect",
    ageYears: { minInclusive: 16, maxInclusive: 20 },
    currentAbilityOffset: { minInclusive: -4, maxInclusive: -2 },
    potentialUplift: { minInclusive: 6, maxInclusive: 9 },
    lineupWeight: 1,
    reserveWeight: 8,
  },
  rare_wonderkid: {
    key: "rare_wonderkid",
    depthRole: "prospect",
    ageYears: { minInclusive: 15, maxInclusive: 18 },
    currentAbilityOffset: { minInclusive: -3, maxInclusive: 0 },
    potentialUplift: { minInclusive: 8, maxInclusive: 12 },
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
