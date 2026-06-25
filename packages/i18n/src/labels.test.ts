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
  assert.equal(translate("en", "career.matchPreparation.action.auto"), "Auto");
  assert.equal(translate("it", "career.matchPreparation.action.fillGaps"), "Riempi");
  assert.equal(translate("de", "career.matchPreparation.action.clear"), "Leeren");
  assert.equal(translate("es", "career.matchPreparation.action.fillGaps"), "Rellenar");
  assert.equal(translate("fr", "career.matchPreparation.action.clear"), "Vider");
  assert.equal(translate("it", "career.matchPreparation.tactic.attacking"), "Offensiva");
  assert.equal(translate("en", "career.matchPreparation.formation.4-2-3-1"), "4-2-3-1");
  assert.equal(translate("en", "career.matchPreparation.formation.5-2-2-1"), "5-2-2-1");
  assert.equal(translate("it", "career.matchPreparation.bench"), "Panchina");
  assert.equal(translate("de", "career.matchPreparation.blocker.missing_bench_slot"), "Ersatzbank hat leere Slots");
  assert.equal(translate("it", "career.matchPreparation.blocker.missing_bench_goalkeeper"), "la panchina richiede un portiere");
  assert.equal(translate("es", "career.matchPreparation.benchStatus.lineup_player"), "en el once");
  assert.equal(translate("fr", "career.matchPreparation.playerStatus.bench"), "remplacant");
  assert.equal(translate("en", "career.tacticalBoard.title"), "Tactical board");
  assert.equal(translate("it", "career.tacticalBoard.currentShape"), "Modulo in campo");
  assert.equal(translate("it", "career.tacticalBench.emptySlot"), "Slot riserva vuoto");
  assert.equal(translate("it", "career.tacticalBench.removeFromBench"), "Togli dalla panchina");
  assert.equal(translate("de", "career.tacticalBoard.assignPlayer"), "Spieler zuweisen");
  assert.equal(translate("es", "career.tacticalBoard.suit.makeshift"), "Improvisado");
  assert.equal(translate("fr", "career.tacticalBoard.removeFromLineup"), "Retirer du onze");
});

test("translates every documented match-preparation formation label in every supported language", () => {
  const formationKeys = [
    "4-4-2",
    "4-4-1-1",
    "4-3-3",
    "4-2-3-1",
    "4-1-4-1",
    "4-1-2-1-2",
    "4-3-1-2",
    "4-3-2-1",
    "4-5-1",
    "4-2-2-2",
    "4-2-4",
    "3-5-2",
    "3-4-3",
    "3-4-1-2",
    "3-4-2-1",
    "3-1-4-2",
    "3-6-1",
    "3-3-3-1",
    "5-3-2",
    "5-4-1",
    "5-2-3",
    "5-2-1-2",
    "5-2-2-1",
  ] as const;

  for (const formationKey of formationKeys) {
    assert.equal(translate("en", `career.matchPreparation.formation.${formationKey}`), formationKey);
    assert.equal(translate("it", `career.matchPreparation.formation.${formationKey}`), formationKey);
    assert.equal(translate("de", `career.matchPreparation.formation.${formationKey}`), formationKey);
    assert.equal(translate("es", `career.matchPreparation.formation.${formationKey}`), formationKey);
    assert.equal(translate("fr", `career.matchPreparation.formation.${formationKey}`), formationKey);
  }
});

test("translates web theme palette settings in every supported language", () => {
  assert.equal(translate("en", "web.preferences.themePalette"), "Color theme");
  assert.equal(translate("it", "web.preferences.themePalette"), "Tema colori");
  assert.equal(translate("de", "web.preferences.themePalette"), "Farbthema");
  assert.equal(translate("es", "web.preferences.themePalette"), "Tema de color");
  assert.equal(translate("fr", "web.preferences.themePalette"), "Theme couleur");
  assert.equal(translate("en", "web.themePalette.floodlightNavy"), "Floodlight navy");
  assert.equal(translate("it", "web.themePalette.floodlightNavy"), "Notte stadio");
  assert.equal(translate("de", "web.themePalette.clubOffice"), "Clubbuero");
  assert.equal(translate("es", "web.themePalette.clubOffice"), "Oficina club");
  assert.equal(translate("fr", "web.themePalette.pressRoom"), "Salle presse");
});

test("translates every accepted web skin in every supported language", () => {
  const skinKeys = [
    "web.themePalette.floodlightNavy",
    "web.themePalette.clubOffice",
    "web.themePalette.pressRoom",
  ] as const;
  const languages = ["en", "it", "de", "es", "fr"] as const;

  for (const language of languages) {
    for (const skinKey of skinKeys) {
      assert.notEqual(translate(language, skinKey), skinKey);
    }
  }
});

test("unknown keys fail clearly at runtime", () => {
  assert.throws(
    () => translate("en", "missing.key" as never),
    /Unknown localization key: missing\.key/,
  );
});
