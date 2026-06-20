/**
 * Localization package public API.
 *
 * This package is intentionally dependency-free so CLI and future UI code can
 * share presentation labels without pulling game simulation dependencies into
 * localization.
 */
export {
  DEFAULT_LANGUAGE,
  FALLBACK_LANGUAGE,
  SUPPORTED_LANGUAGES,
  formatSupportedLanguages,
  isSupportedLanguage,
  parseLanguageCode,
  type SupportedLanguage,
} from "./language.ts";
export {
  MESSAGE_KEYS,
  createTranslator,
  hasConcreteTranslation,
  missingTranslationsFor,
  translate,
  type MessageKey,
  type MessageVariables,
  type Translator,
} from "./labels.ts";
