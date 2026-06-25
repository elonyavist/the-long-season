import type { MessageKey } from "@game/i18n";

/** Stable ids for the accepted web UI skin choices. */
export const WEB_THEME_PALETTE_IDS = [
  "floodlight-navy",
  "club-office",
  "press-room",
] as const;

/** Stable id for a user-selectable web UI skin. */
export type WebThemePaletteId = (typeof WEB_THEME_PALETTE_IDS)[number];

/** Legacy Phase 60 ids accepted only as deterministic preference fallbacks. */
export type LegacyWebThemePaletteId =
  | "classic-manager-dark"
  | "classic-green"
  | "nocturne-navy"
  | "dugout-navy"
  | "heritage-cream"
  | "azzurri-office"
  | "violet-director"
  | "programme-paper"
  | "programme-ivory"
  | "clubhouse-sage"
  | "touchline-stone"
  | "archive-sepia";

/**
 * CSS-variable values controlled by one web skin.
 *
 * These are app-chrome responsibilities, not gameplay or field-state colors.
 * Tactical pitch, suitability, fitness, danger, success, and warning colors are
 * intentionally outside this contract.
 */
export type WebThemePaletteVariables = Readonly<{
  appBackground: string;
  shellSurface: string;
  panelSurface: string;
  elevatedPanelSurface: string;
  tableHeaderSurface: string;
  tableRowSurface: string;
  tableAlternateRowSurface: string;
  selectedRowSurface: string;
  border: string;
  strongBorder: string;
  text: string;
  mutedText: string;
  headingText: string;
  primaryActionSurface: string;
  primaryActionHover: string;
  primaryActionText: string;
  secondaryActionSurface: string;
  focusRing: string;
  shellOverlay: string;
}>;

/** One complete, bounded UI skin option for the web shell. */
export type WebThemePalette = Readonly<{
  id: WebThemePaletteId;
  labelKey: MessageKey;
  swatch: readonly [string, string, string];
  variables: WebThemePaletteVariables;
}>;

/** Default skin used when no user preference is available or valid. */
export const DEFAULT_WEB_THEME_PALETTE_ID: WebThemePaletteId = "floodlight-navy";

/** Compatibility map for previously stored palette ids that are no longer public choices. */
export const LEGACY_WEB_THEME_PALETTE_ID_MAP: Readonly<Record<LegacyWebThemePaletteId, WebThemePaletteId>> = {
  "classic-manager-dark": "club-office",
  "classic-green": "club-office",
  "nocturne-navy": "floodlight-navy",
  "dugout-navy": "floodlight-navy",
  "heritage-cream": "club-office",
  "azzurri-office": "club-office",
  "violet-director": "press-room",
  "programme-paper": "club-office",
  "programme-ivory": "club-office",
  "clubhouse-sage": "club-office",
  "touchline-stone": "press-room",
  "archive-sepia": "press-room",
};

/** Football-manager skin options for non-semantic UI chrome. */
export const WEB_THEME_PALETTES: readonly WebThemePalette[] = [
  {
    id: "floodlight-navy",
    labelKey: "web.themePalette.floodlightNavy" as MessageKey,
    swatch: ["#101827", "#1d2d44", "#d9b95d"],
    variables: {
      appBackground: "#070b13",
      shellSurface: "#101827",
      panelSurface: "#162238",
      elevatedPanelSurface: "#20314b",
      tableHeaderSurface: "#0b1320",
      tableRowSurface: "#1a2940",
      tableAlternateRowSurface: "#20314a",
      selectedRowSurface: "#293c59",
      border: "rgba(232, 224, 202, 0.17)",
      strongBorder: "rgba(232, 224, 202, 0.4)",
      text: "#f2ead7",
      mutedText: "#aeb8c8",
      headingText: "#f7edcf",
      primaryActionSurface: "#d9b95d",
      primaryActionHover: "#e9ca75",
      primaryActionText: "#10141b",
      secondaryActionSurface: "#243652",
      focusRing: "#d9b95d",
      shellOverlay: "rgba(91, 126, 174, 0.15)",
    },
  },
  {
    id: "club-office",
    labelKey: "web.themePalette.clubOffice" as MessageKey,
    swatch: ["#243329", "#344538", "#c7a24a"],
    variables: {
      appBackground: "#121916",
      shellSurface: "#202d25",
      panelSurface: "#26362c",
      elevatedPanelSurface: "#32463a",
      tableHeaderSurface: "#172119",
      tableRowSurface: "#2b3d32",
      tableAlternateRowSurface: "#31473a",
      selectedRowSurface: "#3d5545",
      border: "rgba(236, 226, 199, 0.18)",
      strongBorder: "rgba(236, 226, 199, 0.38)",
      text: "#eee5cf",
      mutedText: "#b9b29c",
      headingText: "#f4ebd2",
      primaryActionSurface: "#c7a24a",
      primaryActionHover: "#d9b966",
      primaryActionText: "#131812",
      secondaryActionSurface: "#34483c",
      focusRing: "#c7a24a",
      shellOverlay: "rgba(199, 162, 74, 0.1)",
    },
  },
  {
    id: "press-room",
    labelKey: "web.themePalette.pressRoom" as MessageKey,
    swatch: ["#181d21", "#2c343a", "#c9aa5a"],
    variables: {
      appBackground: "#0d1013",
      shellSurface: "#181d21",
      panelSurface: "#222a2f",
      elevatedPanelSurface: "#2d373d",
      tableHeaderSurface: "#101519",
      tableRowSurface: "#273137",
      tableAlternateRowSurface: "#2e393f",
      selectedRowSurface: "#39464e",
      border: "rgba(235, 229, 211, 0.17)",
      strongBorder: "rgba(235, 229, 211, 0.39)",
      text: "#f1ead9",
      mutedText: "#b5b4aa",
      headingText: "#f7efdc",
      primaryActionSurface: "#c9aa5a",
      primaryActionHover: "#dac171",
      primaryActionText: "#121416",
      secondaryActionSurface: "#333f46",
      focusRing: "#c9aa5a",
      shellOverlay: "rgba(201, 170, 90, 0.1)",
    },
  },
];

/** Returns whether a raw value is one of the accepted public skin ids. */
export function isWebThemePaletteId(value: string): value is WebThemePaletteId {
  for (const paletteId of WEB_THEME_PALETTE_IDS) {
    if (value === paletteId) {
      return true;
    }
  }

  return false;
}

/** Returns whether a raw value is one of the removed Phase 60 palette ids. */
export function isLegacyWebThemePaletteId(value: string): value is LegacyWebThemePaletteId {
  return Object.hasOwn(LEGACY_WEB_THEME_PALETTE_ID_MAP, value);
}

/** Parses a raw skin id with deterministic fallback and legacy migration. */
export function resolveWebThemePaletteId(value: string | undefined): WebThemePaletteId {
  if (value === undefined) {
    return DEFAULT_WEB_THEME_PALETTE_ID;
  }

  if (isWebThemePaletteId(value)) {
    return value;
  }

  if (isLegacyWebThemePaletteId(value)) {
    return LEGACY_WEB_THEME_PALETTE_ID_MAP[value];
  }

  return DEFAULT_WEB_THEME_PALETTE_ID;
}

/** Finds one skin by id, failing loudly if the static table ever drifts. */
export function webThemePaletteById(id: WebThemePaletteId): WebThemePalette {
  for (const palette of WEB_THEME_PALETTES) {
    if (palette.id === id) {
      return palette;
    }
  }

  throw new Error(`Missing web theme palette: ${id}`);
}
