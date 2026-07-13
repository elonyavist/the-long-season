import {
  DEFAULT_LANGUAGE,
  SUPPORTED_LANGUAGES,
  isSupportedLanguage,
  type MessageKey,
  type SupportedLanguage,
} from "@game/i18n";

/** Currency display choices supported by the first web prototype. */
export const SUPPORTED_CURRENCIES = ["EUR", "GBP", "USD"] as const;

/** Currency display code used by the web shell; it is not an economy rule. */
export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number];

/** Language, currency, and display preferences kept in memory by the web prototype. */
export type WebPreferences = Readonly<{
  language: SupportedLanguage;
  currency: CurrencyCode;
}>;

/** Deterministic defaults for a new web app session. */
export const DEFAULT_WEB_PREFERENCES: WebPreferences = {
  language: DEFAULT_LANGUAGE,
  currency: "EUR",
};

/** Returns whether a raw value is a supported currency display code. */
export function isSupportedCurrency(value: string): value is CurrencyCode {
  for (const currency of SUPPORTED_CURRENCIES) {
    if (value === currency) {
      return true;
    }
  }

  return false;
}

/** Parses a raw currency value while preserving deterministic fallback behavior. */
export function parseCurrencyCode(value: string | undefined): CurrencyCode | undefined {
  if (value === undefined || !isSupportedCurrency(value)) {
    return undefined;
  }

  return value;
}

/** Parses a raw language value while reusing the shared supported-language contract. */
export function parseWebLanguage(value: string | undefined): SupportedLanguage | undefined {
  if (value === undefined || !isSupportedLanguage(value)) {
    return undefined;
  }

  return value;
}

/** Creates a new immutable preference object from raw UI control values. */
export function updateWebPreferences(
  current: WebPreferences,
  next: Partial<Readonly<{ language: string; currency: string }>>,
): WebPreferences {
  return {
    language: parseWebLanguage(next.language) ?? current.language,
    currency: parseCurrencyCode(next.currency) ?? current.currency,
  };
}

/** Returns the localization key for a language option label. */
export function languageLabelKey(language: SupportedLanguage): MessageKey {
  return `web.language.${language}`;
}

/** Returns the localization key for a currency option label. */
export function currencyLabelKey(currency: CurrencyCode): MessageKey {
  return `web.currency.${currency.toLowerCase() as Lowercase<CurrencyCode>}`;
}

/** Language choices exposed to the web settings controls. */
export const WEB_LANGUAGE_OPTIONS = SUPPORTED_LANGUAGES;
