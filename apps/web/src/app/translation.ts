import {
  createTranslator,
  type MessageKey,
  type MessageVariables,
  type SupportedLanguage,
  type Translator,
} from "@game/i18n";

/**
 * Builds the web presentation translator from the shared localization package.
 *
 * Keeping this wrapper small gives React components one import point while the
 * five-language catalog remains owned by `@game/i18n`.
 */
export function createWebTranslator(language: SupportedLanguage): Translator {
  return createTranslator(language);
}

/** Translates one web label key with the shared fallback behavior. */
export function translateWebLabel(
  language: SupportedLanguage,
  key: MessageKey,
  variables?: MessageVariables,
): string {
  return createWebTranslator(language)(key, variables);
}
