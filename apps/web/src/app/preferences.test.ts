import { describe, expect, it } from "vitest";

import {
  DEFAULT_WEB_PREFERENCES,
  currencyLabelKey,
  isSupportedCurrency,
  languageLabelKey,
  parseCurrencyCode,
  parseWebLanguage,
  updateWebPreferences,
} from "./preferences";

describe("web preferences", () => {
  it("uses deterministic defaults", () => {
    expect(DEFAULT_WEB_PREFERENCES).toEqual({
      language: "en",
      currency: "EUR",
      themePaletteId: "floodlight-navy",
    });
  });

  it("accepts only supported currency display codes", () => {
    expect(isSupportedCurrency("EUR")).toBe(true);
    expect(parseCurrencyCode("GBP")).toBe("GBP");
    expect(parseCurrencyCode("CHF")).toBeUndefined();
  });

  it("accepts only supported language codes", () => {
    expect(parseWebLanguage("it")).toBe("it");
    expect(parseWebLanguage("pt")).toBeUndefined();
  });

  it("updates preferences immutably and ignores unsupported values", () => {
    const updated = updateWebPreferences(DEFAULT_WEB_PREFERENCES, {
      language: "fr",
      currency: "USD",
      themePaletteId: "heritage-cream",
    });
    const ignored = updateWebPreferences(updated, {
      language: "pt",
      currency: "CHF",
      themePaletteId: "neon-skin",
    });

    expect(updated).toEqual({ language: "fr", currency: "USD", themePaletteId: "club-office" });
    expect(ignored).toEqual({ language: "fr", currency: "USD", themePaletteId: "floodlight-navy" });
  });

  it("maps option values to localization keys", () => {
    expect(languageLabelKey("de")).toBe("web.language.de");
    expect(currencyLabelKey("GBP")).toBe("web.currency.gbp");
  });
});
