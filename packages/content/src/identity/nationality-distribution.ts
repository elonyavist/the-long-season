import type { ClubCategory, NameCultureKey, NationalityCode } from "@game/domain";
import { deriveRng } from "@game/shared";

/** League country keys supported by the first fictional identity generator. */
export type LeagueNationCode = Extract<NationalityCode, "italian" | "english" | "spanish" | "german" | "french">;

/** Broad nationality source bucket used for distribution review. */
export type NationalityBucket =
  | "domestic"
  | "regional_european"
  | "broader_european"
  | "south_american"
  | "african"
  | "other_international";

/** Inputs needed to select one deterministic nationality and name culture. */
export interface SelectNationalityInput {
  /** Career or content seed. */
  readonly seed: string;
  /** Country of the generated league. */
  readonly leagueNation: LeagueNationCode;
  /** Generic club tier. */
  readonly clubCategory: ClubCategory;
  /** Lightweight club reputation used to distinguish strong top-tier clubs. */
  readonly clubReputation: number;
  /** Stable player key, usually a generated player ID or slot key. */
  readonly playerKey: string;
}

/** Deterministic nationality and name-culture result for one generated person. */
export interface NationalitySelection {
  /** Selected primary nationality. */
  readonly nationality: NationalityCode;
  /** Optional secondary nationality, usually the league nation for foreign players. */
  readonly secondNationality?: NationalityCode;
  /** Birth country for generated identity. */
  readonly birthCountry: NationalityCode;
  /** Name culture used to pick first and last names. */
  readonly nameCulture: NameCultureKey;
  /** Broad bucket that produced this selection, useful for balancing reviews. */
  readonly bucket: NationalityBucket;
  /** Distribution profile used for this selection. */
  readonly profile: NationalityDistributionProfileKey;
}

/** Coarse distribution profiles used by club tier and reputation. */
export type NationalityDistributionProfileKey =
  | "third_division"
  | "second_division"
  | "first_division_average"
  | "first_division_top";

interface WeightedBucket {
  readonly bucket: NationalityBucket;
  readonly weight: number;
}

interface NationalityDistributionProfile {
  readonly key: NationalityDistributionProfileKey;
  readonly buckets: readonly WeightedBucket[];
}

/** Explicit deterministic order for profile review and tests. */
export const NATIONALITY_DISTRIBUTION_PROFILE_KEYS: readonly NationalityDistributionProfileKey[] = [
  "third_division",
  "second_division",
  "first_division_average",
  "first_division_top",
];

const NATIONALITY_DISTRIBUTION_PROFILES: Readonly<
  Record<NationalityDistributionProfileKey, NationalityDistributionProfile>
> = {
  third_division: {
    key: "third_division",
    buckets: [
      { bucket: "domestic", weight: 80 },
      { bucket: "regional_european", weight: 10 },
      { bucket: "broader_european", weight: 5 },
      { bucket: "south_american", weight: 2 },
      { bucket: "african", weight: 2 },
      { bucket: "other_international", weight: 1 },
    ],
  },
  second_division: {
    key: "second_division",
    buckets: [
      { bucket: "domestic", weight: 65 },
      { bucket: "regional_european", weight: 15 },
      { bucket: "broader_european", weight: 10 },
      { bucket: "south_american", weight: 5 },
      { bucket: "african", weight: 4 },
      { bucket: "other_international", weight: 1 },
    ],
  },
  first_division_average: {
    key: "first_division_average",
    buckets: [
      { bucket: "domestic", weight: 45 },
      { bucket: "regional_european", weight: 20 },
      { bucket: "broader_european", weight: 15 },
      { bucket: "south_american", weight: 8 },
      { bucket: "african", weight: 8 },
      { bucket: "other_international", weight: 4 },
    ],
  },
  first_division_top: {
    key: "first_division_top",
    buckets: [
      { bucket: "domestic", weight: 30 },
      { bucket: "regional_european", weight: 20 },
      { bucket: "broader_european", weight: 20 },
      { bucket: "south_american", weight: 13 },
      { bucket: "african", weight: 10 },
      { bucket: "other_international", weight: 7 },
    ],
  },
};

/**
 * Selects deterministic nationality metadata for one generated player/person.
 */
export function selectNationality(input: SelectNationalityInput): NationalitySelection {
  const profile = selectDistributionProfile(input.clubCategory, input.clubReputation);
  const rng = deriveRng(
    input.seed,
    "person-nationality",
    input.leagueNation,
    input.clubCategory,
    input.clubReputation,
    input.playerKey,
  );
  const bucket = selectWeightedBucket(profile.buckets, rng.nextFloat());
  const nationality = selectNationalityFromBucket(input.leagueNation, bucket, rng.nextFloat());
  const secondNationality =
    nationality !== input.leagueNation && rng.nextFloat() < 0.18 ? input.leagueNation : undefined;

  return {
    nationality,
    ...(secondNationality === undefined ? {} : { secondNationality }),
    birthCountry: nationality,
    nameCulture: nameCultureForNationality(nationality),
    bucket,
    profile: profile.key,
  };
}

/**
 * Chooses the broad distribution profile for a club tier and reputation.
 */
export function selectDistributionProfile(
  clubCategory: ClubCategory,
  clubReputation: number,
): NationalityDistributionProfile {
  if (clubCategory === "third_division") {
    return NATIONALITY_DISTRIBUTION_PROFILES.third_division;
  }

  if (clubCategory === "second_division") {
    return NATIONALITY_DISTRIBUTION_PROFILES.second_division;
  }

  return clubReputation >= 8
    ? NATIONALITY_DISTRIBUTION_PROFILES.first_division_top
    : NATIONALITY_DISTRIBUTION_PROFILES.first_division_average;
}

function selectWeightedBucket(buckets: readonly WeightedBucket[], roll: number): NationalityBucket {
  const totalWeight = buckets.reduce((sum, bucket) => sum + bucket.weight, 0);
  let cursor = roll * totalWeight;

  for (const bucket of buckets) {
    cursor -= bucket.weight;
    if (cursor < 0) {
      return bucket.bucket;
    }
  }

  const fallback = buckets[buckets.length - 1];
  if (fallback === undefined) {
    throw new Error("Nationality bucket profile must not be empty");
  }

  return fallback.bucket;
}

function selectNationalityFromBucket(
  leagueNation: LeagueNationCode,
  bucket: NationalityBucket,
  roll: number,
): NationalityCode {
  return selectFromStableList(nationalitiesForBucket(leagueNation, bucket), roll);
}

function nationalitiesForBucket(
  leagueNation: LeagueNationCode,
  bucket: NationalityBucket,
): readonly NationalityCode[] {
  if (bucket === "domestic") {
    return [leagueNation];
  }

  if (bucket === "regional_european") {
    return regionalEuropeanNationalities(leagueNation);
  }

  if (bucket === "broader_european") {
    return ["portuguese", "dutch", "croatian", "serbian", "albanian", "polish", "russian", "turkish", "welsh", "scottish"];
  }

  if (bucket === "south_american") {
    return ["brazilian", "argentinian", "colombian", "mexican"];
  }

  if (bucket === "african") {
    return ["nigerian", "senegalese", "ghanaian", "ivorian", "moroccan"];
  }

  return ["american", "japanese", "south_korean"];
}

function regionalEuropeanNationalities(leagueNation: LeagueNationCode): readonly NationalityCode[] {
  if (leagueNation === "italian") {
    return ["french", "german", "spanish", "croatian", "serbian", "albanian", "turkish"];
  }

  if (leagueNation === "english") {
    return ["scottish", "welsh", "french", "dutch", "portuguese", "spanish", "german"];
  }

  if (leagueNation === "spanish") {
    return ["portuguese", "french", "italian", "german", "dutch", "turkish"];
  }

  if (leagueNation === "german") {
    return ["dutch", "polish", "russian", "turkish", "french", "croatian", "italian"];
  }

  return ["spanish", "italian", "german", "portuguese", "dutch", "albanian", "turkish"];
}

function nameCultureForNationality(nationality: NationalityCode): NameCultureKey {
  if (nationality === "argentinian" || nationality === "colombian" || nationality === "mexican") {
    return "spanish_american";
  }

  if (nationality === "welsh" || nationality === "scottish") {
    return "english";
  }

  if (nationality === "croatian" || nationality === "serbian" || nationality === "albanian") {
    return "balkan";
  }

  if (nationality === "polish" || nationality === "russian") {
    return "central_eastern_european";
  }

  if (nationality === "nigerian" || nationality === "senegalese" || nationality === "ghanaian" || nationality === "ivorian") {
    return "west_african";
  }

  if (nationality === "moroccan") {
    return "north_african";
  }

  if (nationality === "south_korean") {
    return "korean";
  }

  return nationality;
}

function selectFromStableList<T>(items: readonly T[], roll: number): T {
  const index = Math.min(Math.floor(roll * items.length), items.length - 1);
  const item = items[index];

  if (item === undefined) {
    throw new Error("Stable list must not be empty");
  }

  return item;
}
