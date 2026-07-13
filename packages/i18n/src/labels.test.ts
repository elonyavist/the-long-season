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
  assert.equal(translate("en", "career.matchPreparation.action.saveAndGoToMatch"), "Save and go to match");
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
  assert.equal(translate("en", "career.matchPreparation.squadFilter.defender"), "DEF");
  assert.equal(translate("it", "career.matchPreparation.squadFilter.goalkeeper"), "POR");
  assert.equal(translate("de", "career.matchPreparation.squadFilter.midfielder"), "MIT");
  assert.equal(translate("es", "career.matchPreparation.squadFilter.attacker"), "ATA");
  assert.equal(translate("fr", "career.matchPreparation.column.fitness"), "Cond.");
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

test("translates web matchday labels in every supported language", () => {
  assert.equal(translate("en", "career.matchday.title"), "Matchday");
  assert.equal(translate("it", "career.matchday.title"), "Giorno partita");
  assert.equal(translate("it", "career.dashboard.action.go_to_matchday"), "Vai alla partita");
  assert.equal(translate("de", "career.matchday.status.played"), "Abpfiff");
  assert.equal(translate("es", "career.matchday.action.play_fixture"), "Jugar partido");
  assert.equal(translate("fr", "career.matchday.blocker.missing_saved_tactic"), "tactique sauvegardee manquante");
  assert.equal(translate("en", "career.matchday.phase.half_time"), "Half-time");
  assert.equal(translate("it", "career.matchday.action.start_first_half"), "Inizia partita");
  assert.equal(translate("it", "career.matchday.action.start_second_half"), "Inizia secondo tempo");
  assert.equal(translate("en", "career.matchday.action.back_to_dashboard"), "Return to dashboard");
  assert.equal(translate("it", "career.matchday.fixture"), "Partita");
  assert.equal(translate("en", "career.matchday.scoreState.label"), "Your side");
  assert.equal(translate("en", "career.matchday.phaseProgress"), "Match phase progress");
  assert.equal(translate("fr", "career.matchday.playerRatingsTable"), "Tableau des notes joueurs");
  assert.equal(translate("de", "career.matchday.table.rating"), "Note");
  assert.equal(translate("es", "career.matchday.playerStatus.substituted_on"), "entro");
  assert.equal(translate("fr", "career.matchday.scoreState.trailing"), "mene");
  assert.equal(
    translate("en", "career.matchday.eventLine", {
      minute: "54",
      kind: "Goal",
      club: "S.S. Perugia",
      player: "Nico Rinaldi",
    }),
    "54' Goal S.S. Perugia Nico Rinaldi",
  );
});

test("translates half-time substitution labels in every supported language", () => {
  assert.equal(translate("en", "career.matchday.halfTimeDecision"), "Half-time decisions");
  assert.equal(translate("en", "career.matchday.halfTimeTacticalWorkspace"), "Half-time tactics");
  assert.equal(translate("it", "career.matchday.halfTimeValidation.missing_lineup_slot"), "L'undici ha uno slot vuoto.");
  assert.equal(translate("it", "career.matchday.substitution.apply"), "Applica cambio");
  assert.equal(translate("de", "career.matchday.substitution.validation.incoming_already_on_pitch"), "Der einzuwechselnde Spieler ist bereits auf dem Feld.");
  assert.equal(translate("de", "career.matchday.halfTimeValidation.missing_goalkeeper"), "Die Elf braucht einen Torwart.");
  assert.equal(
    translate("es", "career.matchday.substitution.count", {
      count: "1",
      max: "5",
    }),
    "1/5 cambios",
  );
  assert.equal(translate("es", "career.matchday.halfTimeTacticalWorkspace"), "Tactica del descanso");
  assert.equal(translate("fr", "career.matchday.substitution.noneApplied"), "Aucun changement applique.");
  assert.equal(translate("fr", "career.matchday.halfTimeValidation.player_in_lineup_and_bench"), "Un joueur ne peut pas etre dans le onze et sur le banc.");
});

test("translates career post-match player-state consequence labels", () => {
  assert.equal(translate("en", "career.advance.playerStateChanges"), "Post-match player state");
  assert.equal(translate("it", "career.advance.playerStateChanges"), "Stato giocatori post-partita");
  assert.equal(translate("de", "career.advance.playerStateReason.player_goal"), "Tor");
  assert.equal(translate("es", "career.advance.playerStateReason.team_clean_sheet"), "porteria a cero");
  assert.equal(translate("fr", "career.advance.playerStateReason.goalkeeper_saves"), "arrets gardien");
  assert.equal(
    translate("en", "career.advance.playerStateLine", {
      player: "Player One",
      formBefore: "50",
      formAfter: "53",
      formDelta: "+3",
      moraleBefore: "50",
      moraleAfter: "52",
      moraleDelta: "+2",
      reasons: "win, goal",
    }),
    "Player One: form 50 -> 53 (+3), morale 50 -> 52 (+2); reasons: win, goal",
  );
});

test("unknown keys fail clearly at runtime", () => {
  assert.throws(
    () => translate("en", "missing.key" as never),
    /Unknown localization key: missing\.key/,
  );
});
