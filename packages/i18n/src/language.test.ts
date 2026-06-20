import assert from "node:assert/strict";
import { test } from "vitest";

import {
  DEFAULT_LANGUAGE,
  FALLBACK_LANGUAGE,
  SUPPORTED_LANGUAGES,
  formatSupportedLanguages,
  isSupportedLanguage,
  parseLanguageCode,
} from "./language.ts";

test("recognizes the five supported game languages", () => {
  assert.deepEqual(SUPPORTED_LANGUAGES, ["it", "en", "de", "es", "fr"]);
  assert.equal(DEFAULT_LANGUAGE, "en");
  assert.equal(FALLBACK_LANGUAGE, "en");
  assert.equal(formatSupportedLanguages(), "it|en|de|es|fr");
});

test("parses supported language codes and rejects unknown values", () => {
  assert.equal(parseLanguageCode("it"), "it");
  assert.equal(parseLanguageCode("en"), "en");
  assert.equal(parseLanguageCode("de"), "de");
  assert.equal(parseLanguageCode("es"), "es");
  assert.equal(parseLanguageCode("fr"), "fr");
  assert.equal(parseLanguageCode("pt"), undefined);
  assert.equal(parseLanguageCode(undefined), undefined);
  assert.equal(isSupportedLanguage("it"), true);
  assert.equal(isSupportedLanguage("pt"), false);
});
