/**
 * Source data for deterministic fictional club identity generation.
 *
 * City names and football naming patterns are content data, not localized
 * labels. The generated club names stay fictional by combining real city names
 * with country-appropriate abbreviations and football identity words.
 */

/** Launch countries supported by the first fictional club identity generator. */
export type ClubCountryCode = "england" | "france" | "germany" | "italy" | "spain";

/** City prominence bucket used to bias clubs by division level. */
export type ClubCityPoolTier = "large" | "medium" | "small";

/** Competition level used by generated club identity weighting. */
export type ClubDivisionLevel = "first_division" | "second_division" | "third_division";

/** One city available to the fictional club generator. */
export interface ClubCitySource {
  /** City name used as the stable visible identity root. */
  readonly name: string;
  /** Prominence bucket for division-based selection. */
  readonly tier: ClubCityPoolTier;
}

/** Weighted city-pool selection rule for one division level. */
export interface ClubCityTierWeight {
  /** Pool tier selected by this weighted bucket. */
  readonly tier: ClubCityPoolTier;
  /** Relative deterministic selection weight. */
  readonly weight: number;
}

/** Placement rule for one football naming token. */
export type ClubNamePatternKind = "prefix_city" | "city_suffix";

/** One weighted name-shape candidate for a supported country. */
export interface ClubNamePatternSource {
  /** Whether the token appears before or after the city name. */
  readonly kind: ClubNamePatternKind;
  /** Abbreviation or football identity word used by this pattern. */
  readonly token: string;
  /** Relative deterministic selection weight within the country. */
  readonly weight: number;
}

/** Football-style naming data for one supported country. */
export interface ClubNamingSource {
  /**
   * Weighted primary name patterns used before fallback disambiguation.
   *
   * Tokens are intentionally not localized because they are part of the
   * fictional club identity itself.
   */
  readonly patterns: readonly ClubNamePatternSource[];
  /**
   * Country-flavoured fallback words used only when a base pattern-city
   * combination is blocked or already used.
   */
  readonly disambiguators: readonly string[];
}

/** City pools by supported country. */
export const CLUB_CITY_POOLS: Readonly<Record<ClubCountryCode, readonly ClubCitySource[]>> = {
  italy: [
    { name: "Bologna", tier: "large" },
    { name: "Florence", tier: "large" },
    { name: "Genoa", tier: "large" },
    { name: "Milan", tier: "large" },
    { name: "Naples", tier: "large" },
    { name: "Palermo", tier: "large" },
    { name: "Rome", tier: "large" },
    { name: "Turin", tier: "large" },
    { name: "Brescia", tier: "medium" },
    { name: "Cagliari", tier: "medium" },
    { name: "Catania", tier: "medium" },
    { name: "Modena", tier: "medium" },
    { name: "Padova", tier: "medium" },
    { name: "Parma", tier: "medium" },
    { name: "Perugia", tier: "medium" },
    { name: "Salerno", tier: "medium" },
    { name: "Taranto", tier: "medium" },
    { name: "Trieste", tier: "medium" },
    { name: "Arezzo", tier: "small" },
    { name: "Ascoli", tier: "small" },
    { name: "Carpi", tier: "small" },
    { name: "Cesena", tier: "small" },
    { name: "Como", tier: "small" },
    { name: "Cosenza", tier: "small" },
    { name: "Foggia", tier: "small" },
    { name: "Lecco", tier: "small" },
    { name: "Lucca", tier: "small" },
    { name: "Mantova", tier: "small" },
    { name: "Matera", tier: "small" },
    { name: "Pescara", tier: "small" },
    { name: "Pisa", tier: "small" },
    { name: "Ravenna", tier: "small" },
    { name: "Rimini", tier: "small" },
    { name: "Siena", tier: "small" },
    { name: "Terni", tier: "small" },
    { name: "Trento", tier: "small" },
    { name: "Vicenza", tier: "small" },
  ],
  england: [
    { name: "Birmingham", tier: "large" },
    { name: "Bristol", tier: "large" },
    { name: "Leeds", tier: "large" },
    { name: "Liverpool", tier: "large" },
    { name: "London", tier: "large" },
    { name: "Manchester", tier: "large" },
    { name: "Newcastle", tier: "large" },
    { name: "Sheffield", tier: "large" },
    { name: "Coventry", tier: "medium" },
    { name: "Derby", tier: "medium" },
    { name: "Hull", tier: "medium" },
    { name: "Leicester", tier: "medium" },
    { name: "Norwich", tier: "medium" },
    { name: "Nottingham", tier: "medium" },
    { name: "Plymouth", tier: "medium" },
    { name: "Portsmouth", tier: "medium" },
    { name: "Preston", tier: "medium" },
    { name: "Sunderland", tier: "medium" },
    { name: "Carlisle", tier: "small" },
    { name: "Chesterfield", tier: "small" },
    { name: "Crewe", tier: "small" },
    { name: "Doncaster", tier: "small" },
    { name: "Exeter", tier: "small" },
    { name: "Grimsby", tier: "small" },
    { name: "Lincoln", tier: "small" },
    { name: "Mansfield", tier: "small" },
    { name: "Shrewsbury", tier: "small" },
    { name: "Stevenage", tier: "small" },
  ],
  spain: [
    { name: "Barcelona", tier: "large" },
    { name: "Bilbao", tier: "large" },
    { name: "Madrid", tier: "large" },
    { name: "Malaga", tier: "large" },
    { name: "Seville", tier: "large" },
    { name: "Valencia", tier: "large" },
    { name: "Valladolid", tier: "large" },
    { name: "Zaragoza", tier: "large" },
    { name: "Alicante", tier: "medium" },
    { name: "Cordoba", tier: "medium" },
    { name: "Gijon", tier: "medium" },
    { name: "Granada", tier: "medium" },
    { name: "Murcia", tier: "medium" },
    { name: "Oviedo", tier: "medium" },
    { name: "Santander", tier: "medium" },
    { name: "Vigo", tier: "medium" },
    { name: "Albacete", tier: "small" },
    { name: "Badajoz", tier: "small" },
    { name: "Burgos", tier: "small" },
    { name: "Cadiz", tier: "small" },
    { name: "Cartagena", tier: "small" },
    { name: "Huelva", tier: "small" },
    { name: "Linares", tier: "small" },
    { name: "Lugo", tier: "small" },
    { name: "Merida", tier: "small" },
    { name: "Teruel", tier: "small" },
  ],
  germany: [
    { name: "Berlin", tier: "large" },
    { name: "Cologne", tier: "large" },
    { name: "Dortmund", tier: "large" },
    { name: "Dresden", tier: "large" },
    { name: "Frankfurt", tier: "large" },
    { name: "Hamburg", tier: "large" },
    { name: "Munich", tier: "large" },
    { name: "Stuttgart", tier: "large" },
    { name: "Augsburg", tier: "medium" },
    { name: "Bielefeld", tier: "medium" },
    { name: "Bochum", tier: "medium" },
    { name: "Bonn", tier: "medium" },
    { name: "Kiel", tier: "medium" },
    { name: "Mannheim", tier: "medium" },
    { name: "Munster", tier: "medium" },
    { name: "Rostock", tier: "medium" },
    { name: "Cottbus", tier: "small" },
    { name: "Essen", tier: "small" },
    { name: "Jena", tier: "small" },
    { name: "Kassel", tier: "small" },
    { name: "Lubeck", tier: "small" },
    { name: "Osnabruck", tier: "small" },
    { name: "Regensburg", tier: "small" },
    { name: "Ulm", tier: "small" },
    { name: "Wiesbaden", tier: "small" },
    { name: "Zwickau", tier: "small" },
  ],
  france: [
    { name: "Bordeaux", tier: "large" },
    { name: "Lille", tier: "large" },
    { name: "Lyon", tier: "large" },
    { name: "Marseille", tier: "large" },
    { name: "Nantes", tier: "large" },
    { name: "Nice", tier: "large" },
    { name: "Paris", tier: "large" },
    { name: "Toulouse", tier: "large" },
    { name: "Amiens", tier: "medium" },
    { name: "Angers", tier: "medium" },
    { name: "Caen", tier: "medium" },
    { name: "Dijon", tier: "medium" },
    { name: "Grenoble", tier: "medium" },
    { name: "Metz", tier: "medium" },
    { name: "Nancy", tier: "medium" },
    { name: "Tours", tier: "medium" },
    { name: "Avignon", tier: "small" },
    { name: "Bastia", tier: "small" },
    { name: "Beziers", tier: "small" },
    { name: "Calais", tier: "small" },
    { name: "Chateauroux", tier: "small" },
    { name: "Laval", tier: "small" },
    { name: "Niort", tier: "small" },
    { name: "Rodez", tier: "small" },
    { name: "Sedan", tier: "small" },
    { name: "Valence", tier: "small" },
  ],
};

/** Division-to-city-pool weights for generated club identity. */
export const CLUB_CITY_TIER_WEIGHTS: Readonly<Record<ClubDivisionLevel, readonly ClubCityTierWeight[]>> = {
  first_division: [
    { tier: "large", weight: 7 },
    { tier: "medium", weight: 3 },
    { tier: "small", weight: 1 },
  ],
  second_division: [
    { tier: "large", weight: 2 },
    { tier: "medium", weight: 6 },
    { tier: "small", weight: 3 },
  ],
  third_division: [
    { tier: "large", weight: 1 },
    { tier: "medium", weight: 4 },
    { tier: "small", weight: 7 },
  ],
};

/** Country-aware fictional club naming patterns. */
export const CLUB_NAMING_SOURCES: Readonly<Record<ClubCountryCode, ClubNamingSource>> = {
  italy: {
    patterns: [
      { kind: "prefix_city", token: "A.C.", weight: 5 },
      { kind: "prefix_city", token: "A.S.", weight: 5 },
      { kind: "prefix_city", token: "U.S.", weight: 5 },
      { kind: "prefix_city", token: "S.S.", weight: 4 },
      { kind: "city_suffix", token: "Calcio", weight: 4 },
      { kind: "prefix_city", token: "F.C.", weight: 2 },
      { kind: "prefix_city", token: "A.S.D.", weight: 2 },
      { kind: "prefix_city", token: "Pro", weight: 2 },
      { kind: "prefix_city", token: "Virtus", weight: 2 },
      { kind: "prefix_city", token: "Real", weight: 1 },
    ],
    disambiguators: ["Nord", "Sud", "Citta", "Valli", "Marina", "Colli"],
  },
  england: {
    patterns: [
      { kind: "city_suffix", token: "F.C.", weight: 4 },
      { kind: "prefix_city", token: "A.F.C.", weight: 3 },
      { kind: "city_suffix", token: "United", weight: 4 },
      { kind: "city_suffix", token: "Town", weight: 4 },
      { kind: "city_suffix", token: "County", weight: 3 },
      { kind: "city_suffix", token: "Rovers", weight: 3 },
      { kind: "city_suffix", token: "Athletic", weight: 3 },
      { kind: "city_suffix", token: "Albion", weight: 2 },
      { kind: "city_suffix", token: "Wanderers", weight: 2 },
      { kind: "city_suffix", token: "City", weight: 1 },
    ],
    disambiguators: ["North", "South", "County", "Vale", "Borough", "Heath"],
  },
  spain: {
    patterns: [
      { kind: "city_suffix", token: "C.F.", weight: 4 },
      { kind: "prefix_city", token: "C.D.", weight: 4 },
      { kind: "prefix_city", token: "U.D.", weight: 3 },
      { kind: "prefix_city", token: "A.D.", weight: 2 },
      { kind: "prefix_city", token: "Real", weight: 3 },
      { kind: "prefix_city", token: "Atletico", weight: 3 },
      { kind: "prefix_city", token: "Athletic", weight: 2 },
      { kind: "prefix_city", token: "Sporting", weight: 2 },
      { kind: "prefix_city", token: "Racing", weight: 2 },
      { kind: "prefix_city", token: "Deportivo", weight: 2 },
    ],
    disambiguators: ["Norte", "Sur", "Ciudad", "Costa", "Sierra", "Ribera"],
  },
  germany: {
    patterns: [
      { kind: "prefix_city", token: "F.C.", weight: 4 },
      { kind: "prefix_city", token: "S.C.", weight: 4 },
      { kind: "prefix_city", token: "S.V.", weight: 4 },
      { kind: "prefix_city", token: "T.S.V.", weight: 3 },
      { kind: "prefix_city", token: "VfB", weight: 3 },
      { kind: "prefix_city", token: "VfL", weight: 3 },
      { kind: "prefix_city", token: "F.S.V.", weight: 2 },
      { kind: "prefix_city", token: "Fortuna", weight: 2 },
      { kind: "prefix_city", token: "Dynamo", weight: 2 },
      { kind: "city_suffix", token: "Kickers", weight: 1 },
    ],
    disambiguators: ["Nord", "Sud", "Stadt", "Hafen", "Berg", "Tal"],
  },
  france: {
    patterns: [
      { kind: "prefix_city", token: "F.C.", weight: 4 },
      { kind: "prefix_city", token: "A.S.", weight: 4 },
      { kind: "prefix_city", token: "R.C.", weight: 3 },
      { kind: "prefix_city", token: "S.C.", weight: 3 },
      { kind: "prefix_city", token: "U.S.", weight: 3 },
      { kind: "prefix_city", token: "Stade", weight: 3 },
      { kind: "prefix_city", token: "Olympique", weight: 2 },
      { kind: "prefix_city", token: "Racing", weight: 2 },
      { kind: "prefix_city", token: "Sporting", weight: 1 },
      { kind: "city_suffix", token: "F.C.", weight: 1 },
    ],
    disambiguators: ["Nord", "Sud", "Ville", "Vallee", "Cote", "Rive"],
  },
};

/** Explicitly blocked exact generated names for known unsafe combinations. */
export const BLOCKED_FICTIONAL_CLUB_NAMES = new Set<string>([
  "A.C. Milan",
  "A.S. Rome",
  "S.S. Rome",
  "F.C. Barcelona",
  "Barcelona C.F.",
  "C.F. Madrid",
  "Real Madrid",
  "Atletico Madrid",
  "F.C. Liverpool",
  "Liverpool F.C.",
  "F.C. Manchester",
  "Manchester City",
  "Manchester United",
  "F.C. Paris",
  "F.C. Berlin",
  "VfB Stuttgart",
]);
