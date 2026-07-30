import {
  clubId,
  playerId,
  type Club,
  type ClubCategory,
  type ClubId,
  type PlayerId,
} from "@game/domain";
import { deriveRng, type Rng } from "@game/shared";

import {
  BLOCKED_FICTIONAL_CLUB_NAMES,
  CLUB_CITY_POOLS,
  CLUB_CITY_TIER_WEIGHTS,
  CLUB_NAMING_SOURCES,
  type ClubCityPoolTier,
  type ClubCitySource,
  type ClubCountryCode,
  type ClubDivisionLevel,
  type ClubNamePatternSource,
} from "../clubs/club-identity-source-data.ts";

/** Number of fake clubs in the first deterministic demo league. */
export const FAKE_CLUB_COUNT = 18;

/** Number of generated senior players per fake club, including reserves. */
export const FAKE_PLAYERS_PER_CLUB = 22;

/** Number of players selected by the default fixed fake lineup. */
export const FAKE_LINEUP_SIZE = 11;

/** Default generated world seed for deterministic fake club identities. */
export const DEFAULT_FAKE_CLUB_IDENTITY_SEED = "demo-001";

/** Options for deterministic fake club generation. */
export interface FakeClubGenerationOptions {
  /** World/content seed used to vary visible fictional club names. */
  readonly seed?: string;
  /** Country source data used for city selection. */
  readonly country?: ClubCountryCode;
  /** Division level used to weight large, medium, and small city pools. */
  readonly divisionLevel?: ClubDivisionLevel;
  /** Domain category written to every generated club. */
  readonly category?: ClubCategory;
  /** Optional stable club-ID namespace for a multi-division world. */
  readonly clubIdNamespace?: string;
  /** Optional stable player-ID namespace matching the associated player generator. */
  readonly playerIdNamespace?: string;
  /** Optional compact prefix used by table labels. */
  readonly shortNamePrefix?: string;
  /** Names already used by earlier generated divisions in the same country. */
  readonly excludedNames?: readonly string[];
}

/** Visible fictional identity generated for one fake club slot. */
export interface GeneratedClubIdentity {
  /** Stable visible club name, for example `A.C. Arezzo` or `Arezzo Calcio`. */
  readonly name: string;
  /** City selected for the generated club name. */
  readonly city: string;
  /** City prominence bucket used by the selection algorithm. */
  readonly cityTier: ClubCityPoolTier;
}

/**
 * Generated fake club collection for the first CLI milestone.
 */
export interface FakeClubs {
  /** Clubs in deterministic display order. */
  readonly clubs: readonly Club[];
  /** Explicit deterministic club ID order. */
  readonly clubIds: readonly ClubId[];
  /** Club lookup by ID. */
  readonly clubsById: Readonly<Record<ClubId, Club>>;
}

/**
 * Generates a fictional 18-team third-division league.
 *
 * @example
 * const clubs = generateFakeClubs({ seed: "world-a" });
 */
export function generateFakeClubs(options: FakeClubGenerationOptions = {}): FakeClubs {
  const identities = generateFakeClubIdentities(FAKE_CLUB_COUNT, options);
  const category = options.category ?? options.divisionLevel ?? "third_division";
  const clubs: Club[] = [];
  const clubIds: ClubId[] = [];
  const clubsById: Record<ClubId, Club> = {};

  for (let clubNumber = 1; clubNumber <= FAKE_CLUB_COUNT; clubNumber += 1) {
    const id = generatedFakeClubId(clubNumber, options.clubIdNamespace);
    const identity = identities[clubNumber - 1];
    assertGeneratedClubIdentity(identity, clubNumber);
    const club: Club = {
      id,
      name: identity.name,
      shortName: `${options.shortNamePrefix ?? "PRO"}${String(clubNumber).padStart(2, "0")}`,
      category,
      reputation: categoryReputation(category, clubNumber),
      playerIds: fakeClubPlayerIds(clubNumber, options.playerIdNamespace),
    };

    clubs.push(club);
    clubIds.push(id);
    clubsById[id] = club;
  }

  return {
    clubs,
    clubIds,
    clubsById,
  };
}

/**
 * Generates deterministic fictional club identities from country city pools.
 *
 * The returned identities are display content only: callers must still create
 * stable domain IDs separately through the domain constructors.
 *
 * @example
 * const identities = generateFakeClubIdentities(18, { seed: "world-a" });
 */
export function generateFakeClubIdentities(
  count: number,
  options: FakeClubGenerationOptions = {},
): readonly GeneratedClubIdentity[] {
  const seed = options.seed ?? DEFAULT_FAKE_CLUB_IDENTITY_SEED;
  const country = options.country ?? "italy";
  const divisionLevel = options.divisionLevel ?? "third_division";
  const cities = CLUB_CITY_POOLS[country];
  const tierWeights = CLUB_CITY_TIER_WEIGHTS[divisionLevel];
  const usedCities = new Set<string>();
  const usedNames = new Set<string>(options.excludedNames ?? []);
  const identities: GeneratedClubIdentity[] = [];

  for (let slotNumber = 1; slotNumber <= count; slotNumber += 1) {
    const rng = deriveRng(seed, "fake-club-identity", country, divisionLevel, slotNumber);
    const preferredTier = selectCityTier(tierWeights, rng);
    const city = selectCity(cities, preferredTier, usedCities, rng);
    const name = buildUniqueClubName(country, city.name, usedNames, rng);

    usedCities.add(city.name);
    usedNames.add(name);
    identities.push({
      name,
      city: city.name,
      cityTier: city.tier,
    });
  }

  return identities;
}

/**
 * Builds one fake club ID from its one-based generated number.
 */
export function fakeClubId(clubNumber: number): ClubId {
  return clubId(`club:province-${String(clubNumber).padStart(2, "0")}`);
}

/** Builds a stable club ID inside an optional multi-division namespace. */
export function generatedFakeClubId(clubNumber: number, namespace?: string): ClubId {
  if (namespace === undefined) return fakeClubId(clubNumber);
  return clubId(`club:${safeIdNamespace(namespace)}-${String(clubNumber).padStart(2, "0")}`);
}

/**
 * Builds one fake player ID from one-based club and slot numbers.
 */
export function fakePlayerId(clubNumber: number, slotNumber: number): PlayerId {
  return playerId(
    `player:province-${String(clubNumber).padStart(2, "0")}-${String(slotNumber).padStart(2, "0")}`,
  );
}

/**
 * Builds the deterministic first-team player ID order for one fake club.
 */
function fakeClubPlayerIds(clubNumber: number, namespace?: string): readonly PlayerId[] {
  const playerIds: PlayerId[] = [];

  for (let slotNumber = 1; slotNumber <= FAKE_PLAYERS_PER_CLUB; slotNumber += 1) {
    playerIds.push(namespace === undefined
      ? fakePlayerId(clubNumber, slotNumber)
      : playerId(
          `player:${safeIdNamespace(namespace)}-${String(clubNumber).padStart(2, "0")}-${String(slotNumber).padStart(2, "0")}`,
        ));
  }

  return playerIds;
}

/** Gives generated tiers distinct but deterministic sporting reputation bands. */
function categoryReputation(category: ClubCategory, clubNumber: number): number {
  const base = category === "first_division" ? 14 : category === "second_division" ? 9 : 4;
  return base + ((clubNumber - 1) % 6);
}

/** Normalizes a caller-owned namespace for branded generated IDs. */
function safeIdNamespace(namespace: string): string {
  return namespace.replaceAll(":", "-");
}

/**
 * Selects one city prominence bucket from deterministic weighted data.
 */
function selectCityTier(weights: readonly { readonly tier: ClubCityPoolTier; readonly weight: number }[], rng: Rng): ClubCityPoolTier {
  const totalWeight = weights.reduce((sum, item) => sum + item.weight, 0);
  let cursor = rng.nextFloat() * totalWeight;

  for (const item of weights) {
    cursor -= item.weight;
    if (cursor <= 0) {
      return item.tier;
    }
  }

  const fallback = weights[weights.length - 1];
  if (fallback === undefined) {
    throw new Error("Club city tier weights must not be empty");
  }

  return fallback.tier;
}

/**
 * Selects an unused city, preferring the requested tier and then falling back
 * to the full country pool only if that tier is exhausted.
 */
function selectCity(
  cities: readonly ClubCitySource[],
  preferredTier: ClubCityPoolTier,
  usedCities: ReadonlySet<string>,
  rng: Rng,
): ClubCitySource {
  const preferredCities = cities.filter((city) => city.tier === preferredTier);
  const preferredCity = selectUnusedCity(preferredCities, usedCities, rng);

  if (preferredCity !== undefined) {
    return preferredCity;
  }

  const fallbackCity = selectUnusedCity(cities, usedCities, rng);
  if (fallbackCity !== undefined) {
    return fallbackCity;
  }

  return rng.pick(cities);
}

/**
 * Selects one unused city from a deterministic circular scan.
 */
function selectUnusedCity(
  cities: readonly ClubCitySource[],
  usedCities: ReadonlySet<string>,
  rng: Rng,
): ClubCitySource | undefined {
  if (cities.length === 0) {
    return undefined;
  }

  const startIndex = rng.nextInt(0, cities.length);

  for (let offset = 0; offset < cities.length; offset += 1) {
    const index = (startIndex + offset) % cities.length;
    const city = cities[index];

    if (city !== undefined && !usedCities.has(city.name)) {
      return city;
    }
  }

  return undefined;
}

/**
 * Builds a unique fictional name from country patterns and a city.
 *
 * Each country owns realistic football-name shapes: initials, city suffixes,
 * and identity words. Fallback disambiguators are used only when every primary
 * pattern for the selected city is blocked or already used.
 */
function buildUniqueClubName(
  country: ClubCountryCode,
  cityName: string,
  usedNames: ReadonlySet<string>,
  rng: Rng,
): string {
  const namingSource = CLUB_NAMING_SOURCES[country];
  const startIndex = selectWeightedPatternIndex(namingSource.patterns, rng);

  for (const pattern of rotateItems(namingSource.patterns, startIndex)) {
    const name = formatClubName(pattern, cityName);

    if (!usedNames.has(name) && !BLOCKED_FICTIONAL_CLUB_NAMES.has(name)) {
      return name;
    }
  }

  for (const pattern of rotateItems(namingSource.patterns, startIndex)) {
    for (const disambiguator of rotateItems(namingSource.disambiguators, rng.nextInt(0, namingSource.disambiguators.length))) {
      const fallbackName = `${formatClubName(pattern, cityName)} ${disambiguator}`;

      if (!usedNames.has(fallbackName) && !BLOCKED_FICTIONAL_CLUB_NAMES.has(fallbackName)) {
        return fallbackName;
      }
    }
  }

  for (let fallbackIndex = 2; fallbackIndex < 100; fallbackIndex += 1) {
    const fallbackPattern = namingSource.patterns[0];

    if (fallbackPattern === undefined) {
      break;
    }

    const fallbackName = `${formatClubName(fallbackPattern, cityName)} ${fallbackIndex}`;

    if (
      !usedNames.has(fallbackName) &&
      !BLOCKED_FICTIONAL_CLUB_NAMES.has(fallbackName)
    ) {
      return fallbackName;
    }
  }

  throw new Error(`Could not create a unique fictional club name for ${cityName}`);
}

/**
 * Selects a starting pattern index from weighted country naming data.
 */
function selectWeightedPatternIndex(patterns: readonly ClubNamePatternSource[], rng: Rng): number {
  const totalWeight = patterns.reduce((sum, pattern) => sum + pattern.weight, 0);
  let cursor = rng.nextFloat() * totalWeight;

  for (let index = 0; index < patterns.length; index += 1) {
    const pattern = patterns[index];

    if (pattern === undefined) {
      continue;
    }

    cursor -= pattern.weight;
    if (cursor <= 0) {
      return index;
    }
  }

  return Math.max(0, patterns.length - 1);
}

/**
 * Formats one source pattern into the visible fictional club name.
 */
function formatClubName(pattern: ClubNamePatternSource, cityName: string): string {
  switch (pattern.kind) {
    case "prefix_city":
      return `${pattern.token} ${cityName}`;
    case "city_suffix":
      return `${cityName} ${pattern.token}`;
  }
}

/**
 * Returns all items from a deterministic circular scan.
 */
function rotateItems<T>(items: readonly T[], startIndex: number): readonly T[] {
  const rotatedItems: T[] = [];

  for (let offset = 0; offset < items.length; offset += 1) {
    const item = items[(startIndex + offset) % items.length];

    if (item !== undefined) {
      rotatedItems.push(item);
    }
  }

  return rotatedItems;
}

/**
 * Narrows a generated identity before writing it into a `Club` entity.
 */
function assertGeneratedClubIdentity(
  identity: GeneratedClubIdentity | undefined,
  clubNumber: number,
): asserts identity is GeneratedClubIdentity {
  if (identity === undefined) {
    throw new Error(`Missing generated club identity for club ${clubNumber}`);
  }
}
