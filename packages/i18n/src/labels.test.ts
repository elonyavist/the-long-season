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

test("translates the career skip command in every supported language", () => {
  assert.equal(translate("en", "career.shell.skipToContent"), "Skip to current task");
  assert.equal(translate("it", "career.shell.skipToContent"), "Vai al compito corrente");
  assert.equal(translate("de", "career.shell.skipToContent"), "Zur aktuellen Aufgabe springen");
  assert.equal(translate("es", "career.shell.skipToContent"), "Ir a la tarea actual");
  assert.equal(translate("fr", "career.shell.skipToContent"), "Aller a la tache actuelle");
});

test("translates actionable storage recovery without technical exception prose", () => {
  assert.equal(translate("en", "web.app.storage.retry"), "Try again");
  assert.equal(translate("it", "web.app.storage.retry"), "Riprova");
  assert.equal(translate("de", "web.app.storage.retry"), "Erneut versuchen");
  assert.equal(translate("es", "web.app.storage.retry"), "Reintentar");
  assert.equal(translate("fr", "web.app.storage.retry"), "Reessayer");
  assert.match(translate("en", "web.app.storage.error.storage_quota_exceeded"), /last valid save is unchanged/);
});

test("translates match preparation web labels in every supported language", () => {
  assert.equal(translate("en", "career.matchPreparation.summary.blocked"), "Preparation incomplete");
  assert.equal(translate("it", "career.matchPreparation.summary.blocked"), "Preparazione incompleta");
  assert.equal(translate("de", "career.matchPreparation.summary.blocked"), "Vorbereitung unvollstandig");
  assert.equal(translate("es", "career.matchPreparation.summary.blocked"), "Preparacion incompleta");
  assert.equal(translate("fr", "career.matchPreparation.summary.blocked"), "Preparation incomplete");
  assert.equal(translate("en", "career.matchPreparation.action.saveAndGoToMatch"), "Confirm and go to match");
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
  assert.equal(translate("en", "career.preparationDraft.exit.stay"), "Stay");
  assert.equal(translate("it", "career.preparationDraft.exit.discard"), "Scarta modifiche");
  assert.equal(translate("de", "career.preparationDraft.exit.saveAndContinue"), "Speichern und weiter");
  assert.equal(translate("es", "career.preparationDraft.exit.stay"), "Quedarse");
  assert.equal(translate("fr", "career.preparationDraft.exit.discard"), "Supprimer les modifications");
});

test("translates player diagnostics report labels in every supported language", () => {
  assert.equal(translate("en", "playerGeneration.potentialRoomByAge"), "Current-to-potential room by age");
  assert.equal(translate("it", "playerGeneration.matureHighRoomWarnings"), "Avvisi margine alto 26+");
  assert.equal(translate("de", "playerGeneration.ageBand.age26To29"), "26-29");
  assert.equal(translate("es", "career.developmentReport.trajectorySamples"), "Muestras de trayectoria");
  assert.equal(translate("fr", "career.developmentReport.trajectorySampleValue", {
    targetAge: 26,
    player: "Jean Test",
    startAge: 26,
    endAge: 33,
    growth: "0.00",
    decline: "1.00",
    room: "0.50",
  }), "age~26: Jean Test, age 26->33, croissance 0.00, declin 1.00, marge 0.50");
});

test("translates senior squad, player-profile, and annual contract labels", () => {
  assert.equal(translate("en", "career.contract.field.annualWage"), "Annual wage");
  assert.equal(translate("it", "career.contract.field.annualWage"), "Stipendio annuale");
  assert.equal(translate("de", "career.contract.field.annualWage"), "Jahresgehalt");
  assert.equal(translate("es", "career.contract.field.annualWage"), "Salario anual");
  assert.equal(translate("fr", "career.contract.field.annualWage"), "Salaire annuel");
  assert.equal(translate("it", "career.player.role.attacking_midfielder"), "Trequartista");
  assert.equal(translate("en", "career.player.attribute.physical.stamina"), "Stamina");
  assert.equal(translate("it", "career.squad.column.placement"), "Schieramento");
  assert.equal(
    translate("en", "career.squad.action.openMenu", { player: "Ada Rossi" }),
    "Actions for Ada Rossi",
  );
  assert.equal(
    translate("it", "career.squad.placement.suitability.weak"),
    "Fuori ruolo",
  );
  assert.equal(
    translate("it", "career.squad.placement.lineupOption", {
      slot: "AD",
      suitability: "Naturale",
    }),
    "Titolare · AD — Naturale",
  );
  assert.equal(
    translate("fr", "career.squad.placement.lineupOptionOccupied", {
      slot: "BU-D",
      suitability: "Adapte",
      player: "Jean Test",
    }),
    "Titulaire · BU-D — Adapte · remplace Jean Test",
  );
  assert.equal(translate("en", "career.playerProfile.tabs.statistics"), "Statistics");
  assert.equal(translate("it", "career.playerProfile.tabs.contract"), "Contratto");
  assert.equal(
    translate("it", "career.market.profile.tabs.contractOffer"),
    "Contratto e offerta",
  );
  assert.equal(
    translate("de", "career.playerProfile.statistics.coverage.unavailable"),
    "Daten nicht verfugbar",
  );
  assert.equal(
    translate("es", "career.playerProfile.statistics.field.substituteAppearances"),
    "Apariciones como suplente",
  );
  assert.equal(
    translate("fr", "career.playerProfile.statistics.scope.current_season"),
    "Saison actuelle",
  );
});

test("translates accessible public player ratings in every supported language", () => {
  assert.equal(
    translate("en", "career.playerRating.accessible", { label: "Potential", stars: "3.5" }),
    "Potential: 3.5 out of 6 stars",
  );
  assert.equal(
    translate("it", "career.playerRating.accessible", { label: "Potenziale", stars: "5.5" }),
    "Potenziale: 5.5 stelle su 6",
  );
  assert.equal(
    translate("de", "career.playerRating.accessible", { label: "Potenzial", stars: 4 }),
    "Potenzial: 4 von 6 Sternen",
  );
  assert.equal(
    translate("es", "career.playerRating.accessible", { label: "Potencial", stars: 6 }),
    "Potencial: 6 de 6 estrellas",
  );
  assert.equal(
    translate("fr", "career.playerRating.accessible", { label: "Potentiel", stars: 6 }),
    "Potentiel : 6 étoiles sur 6",
  );
  assert.equal(
    translate("it", "career.playerPotentialRange.accessibleRange", {
      lower: "3,5",
      upper: "5",
      uncertainty: "1,5",
    }),
    "Potenziale stimato da 3,5 a 5 stelle. Fascia incerta: 1,5 stelle.",
  );
  assert.equal(
    translate("en", "career.playerPotentialRange.accessibleSingular", {
      stars: "4.5",
    }),
    "Estimated potential: 4.5 out of 6 stars.",
  );
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
  assert.equal(translate("en", "career.matchday.broadcast.firstHalfUnderway"), "The first half is under way.");
  assert.equal(translate("it", "career.matchday.broadcast.halfTimeApproaching"), "Il primo tempo e concluso. Ora arriva l'intervallo.");
  assert.equal(translate("en", "career.matchday.broadcast.secondHalfUnderway"), "The second half is under way.");
  assert.equal(translate("it", "career.matchday.broadcast.fullTimeApproaching"), "La partita e arrivata al 90'.");
  assert.equal(translate("it", "career.matchday.action.start_second_half"), "Inizia secondo tempo");
  assert.equal(translate("en", "career.matchday.halfTimeTabs"), "Half-time views");
  assert.equal(translate("en", "career.matchday.fullTimeTabs"), "Full-time review views");
  assert.equal(translate("it", "career.matchday.fullTimeTab.summary"), "Riepilogo");
  assert.equal(translate("it", "career.matchday.halfTimeTab.summary"), "Sintesi");
  assert.equal(translate("de", "career.matchday.halfTimeTab.tactics"), "Taktik");
  assert.equal(translate("es", "career.matchday.halfTimeTab.selectedTeam"), "Tu equipo");
  assert.equal(translate("fr", "career.matchday.halfTimeTab.opponent"), "Adversaire");
  assert.equal(translate("en", "career.matchday.teamRatings", { club: "S.S. Perugia" }), "S.S. Perugia ratings");
  assert.equal(translate("it", "career.matchday.halfTimeSignal.watch"), "Occhio");
  assert.equal(translate("de", "career.matchday.halfTimeSignal.contributor"), "Schlussel");
  assert.equal(translate("es", "career.matchday.noPlayerRatings"), "Todavia no hay valoraciones disponibles.");
  assert.equal(
    translate("fr", "career.matchday.consequence.injury", { severity: "legere", date: "2026-08-08" }),
    "Blessure : legere, indisponible jusqu'au 2026-08-08",
  );
  assert.equal(
    translate("fr", "career.matchday.halfTimeTacticsUnavailable"),
    "La tactique de mi-temps n'est pas disponible pour ce match.",
  );
  assert.equal(translate("en", "career.matchday.action.back_to_dashboard"), "Continue");
  assert.equal(translate("en", "career.matchday.scoreState.label"), "Your side");
  assert.equal(translate("en", "career.matchday.phaseProgress"), "Match phase progress");
  assert.equal(translate("en", "career.matchday.playback.pause"), "Pause");
  assert.equal(translate("it", "career.matchday.playback.resume"), "Riprendi");
  assert.equal(translate("de", "career.matchday.playback.speedOption", { speed: 4 }), "Wiedergabegeschwindigkeit 4x");
  assert.equal(translate("es", "career.matchday.playback.speed"), "Velocidad del partido");
  assert.equal(translate("fr", "career.matchday.playback.controls"), "Commandes du match");
  assert.equal(translate("en", "career.matchday.fullMatchTabellino"), "Match tabellino");
  assert.equal(translate("it", "career.matchday.fullMatchTabellino"), "Tabellino partita");
  assert.equal(translate("de", "career.matchday.fullMatchTabellino"), "Spiel-Tabellino");
  assert.equal(translate("es", "career.matchday.fullMatchTabellino"), "Acta del partido");
  assert.equal(translate("fr", "career.matchday.fullMatchTabellino"), "Feuille de match");
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

test("translates dashboard task hierarchy without technical fallback copy", () => {
  assert.equal(translate("en", "career.dashboard.task.attention"), "Decision required");
  assert.equal(translate("it", "career.dashboard.readiness.missing_saved_lineup"), "Scegli gli undici titolari");
  assert.equal(translate("de", "career.dashboard.task.ready"), "Bereit zum Fortfahren");
  assert.equal(translate("es", "career.dashboard.task.post_match"), "Analisis del partido");
  assert.equal(translate("fr", "career.dashboard.readiness.missing_saved_tactic"), "Choisis l'approche du match");
  assert.equal(
    translate("en", "career.dashboard.recentMatchCompactLine", {
      home: "Pisa",
      homeGoals: 1,
      awayGoals: 2,
      away: "Perugia",
    }),
    "Pisa 1-2 Perugia",
  );
});

test("translates half-time substitution labels in every supported language", () => {
  assert.equal(translate("en", "career.matchday.halfTimeDecision"), "Half-time decisions");
  assert.equal(translate("en", "career.matchday.halfTimeTacticalWorkspace"), "Half-time tactics");
  assert.equal(translate("it", "career.matchday.halfTimeValidation.missing_lineup_slot"), "L'undici ha uno slot vuoto.");
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

test("translates match-result and season-rollover Posta facts in every supported language", () => {
  assert.equal(translate("en", "career.inbox.subject.match_result"), "Match result");
  assert.equal(translate("it", "career.inbox.subject.season_rollover"), "Riepilogo stagione");
  assert.equal(translate("de", "career.inbox.source.match_report"), "Spielbericht");
  assert.equal(translate("es", "career.inbox.fact.finalScore"), "Resultado final");
  assert.equal(translate("fr", "career.inbox.source.competition_office"), "Bureau des competitions");
});

test("translates the bounded calendar advancement feedback", () => {
  assert.equal(translate("en", "career.calendarAdvance.label"), "Calendar advancing");
  assert.equal(translate("it", "career.calendarAdvance.complete", { date: "2026-08-08" }), "Carriera avanzata al 2026-08-08.");
  assert.equal(translate("de", "career.calendarAdvance.label"), "Kalender laeuft weiter");
  assert.equal(translate("es", "career.calendarAdvance.complete", { date: "2026-08-08" }), "Carrera avanzada hasta 2026-08-08.");
  assert.equal(translate("fr", "career.calendarAdvance.label"), "Avancement du calendrier");
});

test("unknown keys fail clearly at runtime", () => {
  assert.throws(
    () => translate("en", "missing.key" as never),
    /Unknown localization key: missing\.key/,
  );
});
