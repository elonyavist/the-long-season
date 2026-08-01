import type { CurrentAbilityRarityLane } from "./player-current-ability-bands.ts";

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

/** Archetypes whose current profile may be built without an explicit ceiling fact. */
export type GeneratedRoutinePlayerArchetypeKey =
  | "senior_regular"
  | "category_starter"
  | "category_star"
  | "veteran_drop_down"
  | "normal_youth";

/** Stable depth-role keys used by generated squad composition. */
export type GeneratedPlayerDepthRole = "starter" | "rotation" | "depth" | "prospect";

/** Broad potential class used by tests and quality reports. */
export type GeneratedPlayerPotentialClass = "limited" | "category" | "interesting" | "serious" | "elite";

/**
 * Speaking current-quality role used before division and club-tier tuning.
 *
 * Potential class deliberately stays separate: a prospect can have a high
 * ceiling while remaining raw today, whereas a starter must be stronger now
 * without receiving hidden extra potential.
 */
export type GeneratedCurrentQualityProfile =
  | "senior_regular"
  | "category_starter"
  | "category_star"
  | "veteran_drop_down"
  | "youth_prospect"
  | "established_champion";

/** Current-quality profiles that can be authored directly on an archetype. */
export type GeneratedArchetypeCurrentQualityProfile = Exclude<
  GeneratedCurrentQualityProfile,
  "established_champion"
>;

/** Exceptional construction lane selected before sampling a generated profile. */
export type GeneratedExceptionalProfileKind =
  | "ordinary"
  | "current_six"
  | "potential_only_six";

/** Allocation facts required to select one compatible exceptional lane. */
export interface ResolveGeneratedExceptionalProfileInput {
  readonly currentSixAllocated: boolean;
  readonly potentialSixAllocated: boolean;
}

/** Compatible construction decision shared by fake senior generators. */
export interface GeneratedExceptionalProfile {
  readonly kind: GeneratedExceptionalProfileKind;
  readonly archetypeKey?: GeneratedPlayerArchetypeKey;
  readonly currentAbilityLane: CurrentAbilityRarityLane;
  readonly requiresSixStarPotentialFloor: boolean;
}

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
  /** Broad machine-readable potential class; not a user-facing label. */
  readonly potentialClass: GeneratedPlayerPotentialClass;
  /** Current-quality semantics, independent from reachable potential. */
  readonly currentQualityProfile: GeneratedArchetypeCurrentQualityProfile;
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
    potentialClass: "category",
    currentQualityProfile: "senior_regular",
    lineupWeight: 30,
    reserveWeight: 12,
  },
  category_starter: {
    key: "category_starter",
    depthRole: "starter",
    ageYears: { minInclusive: 24, maxInclusive: 30 },
    potentialClass: "category",
    currentQualityProfile: "category_starter",
    lineupWeight: 34,
    reserveWeight: 8,
  },
  category_star: {
    key: "category_star",
    depthRole: "starter",
    ageYears: { minInclusive: 24, maxInclusive: 32 },
    potentialClass: "category",
    currentQualityProfile: "category_star",
    lineupWeight: 4,
    reserveWeight: 1,
  },
  veteran_drop_down: {
    key: "veteran_drop_down",
    depthRole: "rotation",
    ageYears: { minInclusive: 31, maxInclusive: 37 },
    potentialClass: "limited",
    currentQualityProfile: "veteran_drop_down",
    lineupWeight: 8,
    reserveWeight: 7,
  },
  normal_youth: {
    key: "normal_youth",
    depthRole: "prospect",
    ageYears: { minInclusive: 17, maxInclusive: 21 },
    potentialClass: "interesting",
    currentQualityProfile: "youth_prospect",
    lineupWeight: 2,
    reserveWeight: 32,
  },
  good_prospect: {
    key: "good_prospect",
    depthRole: "prospect",
    ageYears: { minInclusive: 16, maxInclusive: 20 },
    potentialClass: "interesting",
    currentQualityProfile: "youth_prospect",
    lineupWeight: 1,
    reserveWeight: 4,
  },
  serious_prospect: {
    key: "serious_prospect",
    depthRole: "prospect",
    ageYears: { minInclusive: 16, maxInclusive: 20 },
    potentialClass: "serious",
    currentQualityProfile: "youth_prospect",
    lineupWeight: 0,
    reserveWeight: 3,
  },
  rare_prodigy: {
    key: "rare_prodigy",
    depthRole: "prospect",
    ageYears: { minInclusive: 15, maxInclusive: 20 },
    potentialClass: "elite",
    currentQualityProfile: "youth_prospect",
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

/**
 * Returns the weakest current-ability lane compatible with an archetype.
 *
 * Potential class and current quality are deliberately separate facts. A good
 * prospect can still be raw, so `serious_prospect` deliberately shares the
 * normal current lane with other youth. Its stronger future belongs to the
 * separate ceiling policy. A rare prodigy still uses the contextual
 * exceptional-youth bands. Callers may request a stronger lane for a
 * world-budgeted current champion, but never a weaker one.
 */
export function currentAbilityRarityLaneForGeneratedArchetype(
  archetypeKey: GeneratedPlayerArchetypeKey,
): CurrentAbilityRarityLane {
  switch (archetypeKey) {
    case "category_star":
    case "veteran_drop_down":
      return "rare";
    case "rare_prodigy":
      return "exceptional";
    case "senior_regular":
    case "category_starter":
    case "normal_youth":
    case "good_prospect":
    case "serious_prospect":
      return "normal";
  }
}

/**
 * Combines an archetype's semantic floor with a caller's bounded context nudge.
 *
 * This makes the rare-prodigy rule defensive at the policy owner: a stale
 * composition root that still requests `normal` cannot silently recreate the
 * former rare-prodigy-to-routine shortcut.
 */
export function resolveGeneratedCurrentAbilityRarityLane(input: {
  readonly archetypeKey: GeneratedPlayerArchetypeKey;
  readonly requestedLane: CurrentAbilityRarityLane;
}): CurrentAbilityRarityLane {
  const archetypeFloor = currentAbilityRarityLaneForGeneratedArchetype(input.archetypeKey);
  return CURRENT_ABILITY_RARITY_LANE_ORDER[archetypeFloor]
      >= CURRENT_ABILITY_RARITY_LANE_ORDER[input.requestedLane]
    ? archetypeFloor
    : input.requestedLane;
}

/**
 * Resolves the current-quality profile after exceptional precedence.
 *
 * A world-budgeted current-six player deliberately shares the public
 * `category_star` archetype label but must not receive the ordinary star
 * adjustment. Naming the champion profile here keeps that exception total and
 * prevents callers from re-creating it with booleans.
 */
export function resolveGeneratedCurrentQualityProfile(input: {
  readonly archetypeKey: GeneratedPlayerArchetypeKey;
  readonly effectiveRarityLane: CurrentAbilityRarityLane;
}): GeneratedCurrentQualityProfile {
  if (
    input.archetypeKey === "category_star"
    && input.effectiveRarityLane === "exceptional"
  ) {
    return "established_champion";
  }

  return getGeneratedPlayerArchetype(input.archetypeKey).currentQualityProfile;
}

const CURRENT_ABILITY_RARITY_LANE_ORDER: Readonly<Record<CurrentAbilityRarityLane, number>> = {
  normal: 0,
  rare: 1,
  exceptional: 2,
};

/**
 * Resolves exceptional profile precedence before age or abilities are sampled.
 *
 * Current-six status wins when both allocations identify the same slot because
 * an already world-class player must use the senior `category_star` lane.
 * Only potential-only exceptional players use the youth prodigy lane.
 */
export function resolveGeneratedExceptionalProfile(
  input: ResolveGeneratedExceptionalProfileInput,
): GeneratedExceptionalProfile {
  if (input.currentSixAllocated) {
    return {
      kind: "current_six",
      archetypeKey: "category_star",
      currentAbilityLane: "exceptional",
      requiresSixStarPotentialFloor: input.potentialSixAllocated,
    };
  }
  if (input.potentialSixAllocated) {
    return {
      kind: "potential_only_six",
      archetypeKey: "rare_prodigy",
      currentAbilityLane: "exceptional",
      requiresSixStarPotentialFloor: true,
    };
  }
  return {
    kind: "ordinary",
    currentAbilityLane: "normal",
    requiresSixStarPotentialFloor: false,
  };
}
