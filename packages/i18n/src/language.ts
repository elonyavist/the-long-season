/**
 * Supported language contract for every presentation layer.
 *
 * Domain and engine packages keep language-agnostic keys; CLI and future UI
 * code use this contract to choose how those keys become user-facing text.
 */
export const SUPPORTED_LANGUAGES = ["it", "en", "de", "es", "fr"] as const;

/** Supported BCP-47-like language code subset for the game UI and CLI. */
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

/** Default language used when a caller does not specify one. */
export const DEFAULT_LANGUAGE: SupportedLanguage = "en";

/** Deterministic fallback used when a requested translation is missing. */
export const FALLBACK_LANGUAGE: SupportedLanguage = "en";

/**
 * Checks whether a string is one of the supported game language codes.
 *
 * @example
 * isSupportedLanguage("it") === true
 */
export function isSupportedLanguage(value: string): value is SupportedLanguage {
  for (const language of SUPPORTED_LANGUAGES) {
    if (value === language) {
      return true;
    }
  }

  return false;
}

/**
 * Parses a user-provided language code.
 *
 * @example
 * parseLanguageCode("fr") // "fr"
 */
export function parseLanguageCode(value: string | undefined): SupportedLanguage | undefined {
  if (value === undefined || !isSupportedLanguage(value)) {
    return undefined;
  }

  return value;
}

/**
 * Formats supported languages for CLI usage and validation messages.
 */
export function formatSupportedLanguages(): string {
  return SUPPORTED_LANGUAGES.join("|");
}
