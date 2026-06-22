import type { ClubCategory, PlayerRole } from "@game/domain";
import { deriveRng } from "@game/shared";

import {
  getRoleAttributeClassification,
  hardCapForRoleAbility,
  type PlayerAbilityKey,
  type RoleAttributeBucket,
} from "./player-role-attribute-classification.ts";
import type { PlayerGenerationClubTier } from "./player-generation-bands.ts";

/** Rarity lane for current ability inside a division/age band. */
export type CurrentAbilityRarityLane = "normal" | "rare" | "exceptional";

/** Youth age group used by current-ability generation. */
export type YouthCurrentAbilityAgeGroup = "age_15_17" | "age_18_19";

/** Inclusive numeric current-ability range before per-attribute template offsets. */
export interface CurrentAbilityBandRange {
  /** Lowest value in the range. */
  readonly minInclusive: number;
  /** Highest value in the range. */
  readonly maxInclusive: number;
}

/** Current-ability ranges for one attribute bucket. */
export type CurrentAbilityLaneBands = Readonly<Partial<Record<CurrentAbilityRarityLane, CurrentAbilityBandRange>>>;

/** Senior current-ability band data by role-attribute bucket. */
export type SeniorCurrentAbilityBandsByBucket = Readonly<Record<RoleAttributeBucket, CurrentAbilityLaneBands>>;

/** Youth current-ability band data by role-attribute bucket. */
export type YouthCurrentAbilityBandsByBucket = Readonly<Record<RoleAttributeBucket, CurrentAbilityLaneBands>>;

/** Explicit senior current-ability bands by division. */
export const SENIOR_CURRENT_ABILITY_BANDS: Readonly<Record<ClubCategory, SeniorCurrentAbilityBandsByBucket>> = {
  third_division: {
    coreForRole: lanes({ normal: [8, 13], rare: [14, 15], exceptional: [16, 16.5] }),
    secondaryForRole: lanes({ normal: [6, 11], rare: [12, 13] }),
    allowedButLow: lanes({ normal: [1, 8], rare: [9, 11] }),
    cappedOutOfRole: lanes({ normal: [1, 8], rare: [9, 11] }),
  },
  second_division: {
    coreForRole: lanes({ normal: [10, 15], rare: [16, 16], exceptional: [17, 18] }),
    secondaryForRole: lanes({ normal: [8, 13], rare: [14, 14] }),
    allowedButLow: lanes({ normal: [1, 9], rare: [10, 11] }),
    cappedOutOfRole: lanes({ normal: [1, 9], rare: [10, 11] }),
  },
  first_division: {
    coreForRole: lanes({ normal: [12, 17], rare: [18, 18], exceptional: [19, 20] }),
    secondaryForRole: lanes({ normal: [9, 15], rare: [16, 16] }),
    allowedButLow: lanes({ normal: [1, 10], rare: [11, 11] }),
    cappedOutOfRole: lanes({ normal: [1, 10], rare: [11, 11] }),
  },
};

/** Explicit youth current-ability bands by division and age group. */
export const YOUTH_CURRENT_ABILITY_BANDS: Readonly<
  Record<ClubCategory, Readonly<Record<YouthCurrentAbilityAgeGroup, YouthCurrentAbilityBandsByBucket>>>
> = {
  third_division: {
    age_15_17: {
      coreForRole: lanes({ normal: [4, 9], rare: [10, 11], exceptional: [12, 12] }),
      secondaryForRole: lanes({ normal: [3, 8], rare: [9, 10] }),
      allowedButLow: lanes({ normal: [1, 6], rare: [7, 8] }),
      cappedOutOfRole: lanes({ normal: [1, 6], rare: [7, 8] }),
    },
    age_18_19: {
      coreForRole: lanes({ normal: [6, 11], rare: [12, 13], exceptional: [14, 14] }),
      secondaryForRole: lanes({ normal: [4, 9], rare: [10, 11] }),
      allowedButLow: lanes({ normal: [1, 7], rare: [8, 10] }),
      cappedOutOfRole: lanes({ normal: [1, 7], rare: [8, 10] }),
    },
  },
  second_division: {
    age_15_17: {
      coreForRole: lanes({ normal: [5, 10], rare: [11, 12], exceptional: [13, 13] }),
      secondaryForRole: lanes({ normal: [4, 9], rare: [10, 11] }),
      allowedButLow: lanes({ normal: [1, 7], rare: [8, 9] }),
      cappedOutOfRole: lanes({ normal: [1, 7], rare: [8, 9] }),
    },
    age_18_19: {
      coreForRole: lanes({ normal: [7, 12], rare: [13, 14], exceptional: [15, 15] }),
      secondaryForRole: lanes({ normal: [5, 10], rare: [11, 12] }),
      allowedButLow: lanes({ normal: [1, 8], rare: [9, 10] }),
      cappedOutOfRole: lanes({ normal: [1, 8], rare: [9, 10] }),
    },
  },
  first_division: {
    age_15_17: {
      coreForRole: lanes({ normal: [6, 11], rare: [12, 13], exceptional: [14, 14] }),
      secondaryForRole: lanes({ normal: [5, 10], rare: [11, 12] }),
      allowedButLow: lanes({ normal: [1, 8], rare: [9, 10] }),
      cappedOutOfRole: lanes({ normal: [1, 8], rare: [9, 10] }),
    },
    age_18_19: {
      coreForRole: lanes({ normal: [8, 13], rare: [14, 15], exceptional: [16, 16] }),
      secondaryForRole: lanes({ normal: [6, 11], rare: [12, 13] }),
      allowedButLow: lanes({ normal: [1, 9], rare: [10, 11] }),
      cappedOutOfRole: lanes({ normal: [1, 9], rare: [10, 11] }),
    },
  },
};

/** Returns the youth age group for a 15..19-year-old player. */
export function youthCurrentAbilityAgeGroup(ageYears: number): YouthCurrentAbilityAgeGroup {
  return ageYears <= 17 ? "age_15_17" : "age_18_19";
}

/** Resolves a senior current-ability band after applying a bounded club-tier modifier. */
export function resolveSeniorCurrentAbilityBand(input: {
  readonly division: ClubCategory;
  readonly clubTier: PlayerGenerationClubTier;
  readonly bucket: RoleAttributeBucket;
  readonly rarityLane?: CurrentAbilityRarityLane;
}): CurrentAbilityBandRange {
  const rarityLane = input.rarityLane ?? "normal";
  const laneBand = SENIOR_CURRENT_ABILITY_BANDS[input.division][input.bucket][rarityLane];

  if (laneBand === undefined) {
    throw new Error(`Missing senior current ability band: ${input.division} ${input.bucket} ${rarityLane}`);
  }

  return applyTierModifier(laneBand, input.clubTier);
}

/** Resolves a youth current-ability band after applying a bounded club-tier modifier. */
export function resolveYouthCurrentAbilityBand(input: {
  readonly division: ClubCategory;
  readonly clubTier: PlayerGenerationClubTier;
  readonly ageYears: number;
  readonly bucket: RoleAttributeBucket;
  readonly rarityLane?: CurrentAbilityRarityLane;
}): CurrentAbilityBandRange {
  const rarityLane = input.rarityLane ?? "normal";
  const ageGroup = youthCurrentAbilityAgeGroup(input.ageYears);
  const laneBand = YOUTH_CURRENT_ABILITY_BANDS[input.division][ageGroup][input.bucket][rarityLane];

  if (laneBand === undefined) {
    throw new Error(`Missing youth current ability band: ${input.division} ${ageGroup} ${input.bucket} ${rarityLane}`);
  }

  return applyTierModifier(laneBand, input.clubTier);
}

/** Resolves the effective ability range for one role-specific attribute after hard caps. */
export function resolveEffectiveCurrentAbilityBandForRoleAbility(input: {
  readonly division: ClubCategory;
  readonly clubTier: PlayerGenerationClubTier;
  readonly role: PlayerRole;
  readonly abilityKey: PlayerAbilityKey;
  readonly ageYears?: number;
  readonly rarityLane?: CurrentAbilityRarityLane;
}): CurrentAbilityBandRange {
  const bucket = bucketForRoleAbility(input.role, input.abilityKey);
  const range = input.ageYears === undefined || input.ageYears >= 20
    ? resolveSeniorCurrentAbilityBand({ ...input, bucket })
    : resolveYouthCurrentAbilityBand({ ...input, ageYears: input.ageYears, bucket });
  const hardCap = hardCapForRoleAbility(input.role, input.abilityKey);

  if (hardCap === undefined) {
    return range;
  }

  return {
    minInclusive: Math.min(range.minInclusive, hardCap),
    maxInclusive: Math.min(range.maxInclusive, hardCap),
  };
}

/** Samples a deterministic value from a resolved current-ability range. */
export function sampleCurrentAbilityInBand(input: {
  readonly seed: string;
  readonly playerKey: string;
  readonly streamName: string;
  readonly range: CurrentAbilityBandRange;
}): number {
  const rng = deriveRng(input.seed, input.streamName, input.playerKey);
  return input.range.minInclusive + rng.nextFloat() * (input.range.maxInclusive - input.range.minInclusive);
}

function bucketForRoleAbility(role: PlayerRole, abilityKey: PlayerAbilityKey): RoleAttributeBucket {
  const classification = getRoleAttributeClassification(role);

  if (classification.coreForRole.includes(abilityKey)) return "coreForRole";
  if (classification.secondaryForRole.includes(abilityKey)) return "secondaryForRole";
  if (classification.allowedButLow.includes(abilityKey)) return "allowedButLow";
  return "cappedOutOfRole";
}

function applyTierModifier(range: CurrentAbilityBandRange, clubTier: PlayerGenerationClubTier): CurrentAbilityBandRange {
  const modifier = clubTierModifier(clubTier);
  const min = clamp(range.minInclusive + modifier, range.minInclusive, range.maxInclusive);
  const max = clamp(range.maxInclusive + modifier, range.minInclusive, range.maxInclusive);

  return {
    minInclusive: min,
    maxInclusive: Math.max(min, max),
  };
}

function clubTierModifier(clubTier: PlayerGenerationClubTier): number {
  switch (clubTier) {
    case "title_contender":
      return 2.5;
    case "playoff_contender":
      return 0.8;
    case "mid_table":
      return -0.8;
    case "survival":
      return -2;
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function lanes(input: {
  readonly normal: readonly [number, number];
  readonly rare?: readonly [number, number];
  readonly exceptional?: readonly [number, number];
}): CurrentAbilityLaneBands {
  return {
    normal: range(input.normal),
    ...(input.rare === undefined ? {} : { rare: range(input.rare) }),
    ...(input.exceptional === undefined ? {} : { exceptional: range(input.exceptional) }),
  };
}

function range(input: readonly [number, number]): CurrentAbilityBandRange {
  return {
    minInclusive: input[0],
    maxInclusive: input[1],
  };
}
