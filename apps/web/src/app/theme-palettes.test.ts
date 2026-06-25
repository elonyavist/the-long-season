import { describe, expect, it } from "vitest";

import {
  DEFAULT_WEB_THEME_PALETTE_ID,
  LEGACY_WEB_THEME_PALETTE_ID_MAP,
  WEB_THEME_PALETTES,
  WEB_THEME_PALETTE_IDS,
  isLegacyWebThemePaletteId,
  isWebThemePaletteId,
  resolveWebThemePaletteId,
  webThemePaletteById,
} from "./theme-palettes";

describe("web theme palettes", () => {
  it("defines exactly the accepted production skin ids", () => {
    expect(WEB_THEME_PALETTE_IDS).toEqual([
      "floodlight-navy",
      "club-office",
      "press-room",
    ]);
    expect(WEB_THEME_PALETTES).toHaveLength(3);
  });

  it("uses unique ids and a valid default", () => {
    const ids = WEB_THEME_PALETTES.map((palette) => palette.id);

    expect(new Set(ids).size).toBe(ids.length);
    expect(DEFAULT_WEB_THEME_PALETTE_ID).toBe("floodlight-navy");
    expect(webThemePaletteById(DEFAULT_WEB_THEME_PALETTE_ID).id).toBe(DEFAULT_WEB_THEME_PALETTE_ID);
  });

  it("migrates removed skin ids without exposing them as public skins", () => {
    expect(isWebThemePaletteId("floodlight-navy")).toBe(true);
    expect(isWebThemePaletteId("classic-manager-dark")).toBe(false);
    expect(isWebThemePaletteId("dugout-navy")).toBe(false);
    expect(isLegacyWebThemePaletteId("dugout-navy")).toBe(true);
    expect(isLegacyWebThemePaletteId("classic-manager-dark")).toBe(true);
    expect(resolveWebThemePaletteId("classic-green")).toBe("club-office");
    expect(resolveWebThemePaletteId("classic-manager-dark")).toBe("club-office");
    expect(resolveWebThemePaletteId("dugout-navy")).toBe("floodlight-navy");
    expect(resolveWebThemePaletteId("programme-ivory")).toBe("club-office");
    expect(resolveWebThemePaletteId("archive-sepia")).toBe("press-room");
    expect(resolveWebThemePaletteId("neon-skin")).toBe(DEFAULT_WEB_THEME_PALETTE_ID);
    expect(resolveWebThemePaletteId(undefined)).toBe(DEFAULT_WEB_THEME_PALETTE_ID);
    expect(WEB_THEME_PALETTE_IDS).not.toContain("dugout-navy");
    expect(Object.keys(LEGACY_WEB_THEME_PALETTE_ID_MAP)).toContain("touchline-stone");
  });

  it("keeps pitch, suitability, form, and semantic colors outside the skin contract", () => {
    for (const palette of WEB_THEME_PALETTES) {
      const variableNames = Object.keys(palette.variables).join(" ");

      expect(variableNames).not.toMatch(/pitch|grass|suit|fitness|semantic|danger|success|warning|blocker/i);
      expect(palette.swatch).toHaveLength(3);
    }
  });

  it("uses visual hierarchy variables instead of obsolete generic palette names", () => {
    for (const palette of WEB_THEME_PALETTES) {
      expect(Object.keys(palette.variables)).toEqual([
        "appBackground",
        "shellSurface",
        "panelSurface",
        "elevatedPanelSurface",
        "tableHeaderSurface",
        "tableRowSurface",
        "tableAlternateRowSurface",
        "selectedRowSurface",
        "border",
        "strongBorder",
        "text",
        "mutedText",
        "headingText",
        "primaryActionSurface",
        "primaryActionHover",
        "primaryActionText",
        "secondaryActionSurface",
        "focusRing",
        "shellOverlay",
      ]);
    }
  });
});
