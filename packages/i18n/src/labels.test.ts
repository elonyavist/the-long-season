import assert from "node:assert/strict";
import { test } from "vitest";

import {
  MESSAGE_KEYS,
  hasConcreteTranslation,
  missingTranslationsFor,
  translate,
} from "./labels.ts";

test("translates known labels and interpolates variables", () => {
  assert.equal(translate("en", "event.goal"), "GOAL");
  assert.equal(translate("it", "event.goal"), "GOL");
  assert.equal(translate("en", "round.fixtures", { round: 3 }), "Round 3 fixtures");
});

test("translates the current catalog in every supported language", () => {
  assert.equal(hasConcreteTranslation("de", "event.goal"), true);
  assert.equal(translate("de", "event.goal"), "TOR");
  assert.equal(translate("es", "event.goal"), "GOL");
  assert.equal(translate("fr", "event.goal"), "BUT");
});

test("all five supported languages cover the current catalog", () => {
  assert.equal(missingTranslationsFor("en").length, 0);
  assert.equal(missingTranslationsFor("it").length, 0);
  assert.equal(missingTranslationsFor("de").length, 0);
  assert.equal(missingTranslationsFor("es").length, 0);
  assert.equal(missingTranslationsFor("fr").length, 0);
  assert.equal(MESSAGE_KEYS.length > 0, true);
});

test("translates match preparation web labels in every supported language", () => {
  assert.equal(translate("en", "career.matchPreparation.summary.blocked"), "Preparation incomplete");
  assert.equal(translate("it", "career.matchPreparation.summary.blocked"), "Preparazione incompleta");
  assert.equal(translate("de", "career.matchPreparation.summary.blocked"), "Vorbereitung unvollstandig");
  assert.equal(translate("es", "career.matchPreparation.summary.blocked"), "Preparacion incompleta");
  assert.equal(translate("fr", "career.matchPreparation.summary.blocked"), "Preparation incomplete");
  assert.equal(translate("en", "career.matchPreparation.action.save"), "Save preparation");
  assert.equal(translate("it", "career.matchPreparation.tactic.attacking"), "Offensiva");
});

test("unknown keys fail clearly at runtime", () => {
  assert.throws(
    () => translate("en", "missing.key" as never),
    /Unknown localization key: missing\.key/,
  );
});
