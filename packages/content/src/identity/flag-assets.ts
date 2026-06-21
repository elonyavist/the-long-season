import type { NationalityCode } from "@game/domain";

/** Stable SVG asset code under `assets/flags/` for a supported nationality. */
export type FlagAssetCode =
  | "it"
  | "gb-eng"
  | "es"
  | "de"
  | "fr"
  | "pt"
  | "br"
  | "ar"
  | "co"
  | "mx"
  | "nl"
  | "gb-wls"
  | "gb-sct"
  | "hr"
  | "rs"
  | "al"
  | "ru"
  | "tr"
  | "pl"
  | "ng"
  | "sn"
  | "gh"
  | "ci"
  | "ma"
  | "us"
  | "jp"
  | "kr";

/** Presentation-facing flag metadata derived from a language-agnostic nationality key. */
export interface NationalityFlagAsset {
  /** Domain nationality key stored on generated fictional people. */
  readonly nationality: NationalityCode;
  /** Filename stem of the SVG asset under `assets/flags/`. */
  readonly assetCode: FlagAssetCode;
  /** Stable project-relative SVG asset path for UI or CLI presentation layers. */
  readonly assetPath: `assets/flags/${FlagAssetCode}.svg`;
}

const NATIONALITY_FLAG_ASSET_CODES: Readonly<Record<NationalityCode, FlagAssetCode>> = {
  italian: "it",
  english: "gb-eng",
  spanish: "es",
  german: "de",
  french: "fr",
  portuguese: "pt",
  brazilian: "br",
  argentinian: "ar",
  colombian: "co",
  mexican: "mx",
  dutch: "nl",
  welsh: "gb-wls",
  scottish: "gb-sct",
  croatian: "hr",
  serbian: "rs",
  albanian: "al",
  russian: "ru",
  turkish: "tr",
  polish: "pl",
  nigerian: "ng",
  senegalese: "sn",
  ghanaian: "gh",
  ivorian: "ci",
  moroccan: "ma",
  american: "us",
  japanese: "jp",
  south_korean: "kr",
};

/**
 * Resolves the SVG flag asset metadata for one supported nationality.
 *
 * This helper intentionally lives in `content`, not `domain` or `engine`,
 * because flags are presentation assets. Domain data should keep storing only
 * the stable `NationalityCode`.
 *
 * @example
 * flagAssetForNationality("italian").assetPath
 */
export function flagAssetForNationality(nationality: NationalityCode): NationalityFlagAsset {
  const assetCode = NATIONALITY_FLAG_ASSET_CODES[nationality];

  return {
    nationality,
    assetCode,
    assetPath: `assets/flags/${assetCode}.svg`,
  };
}

