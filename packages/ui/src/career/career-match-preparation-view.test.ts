import { describe, expect, it } from "vitest";

import { FORMATION_CATALOG, type CanonicalPlayerRole } from "@game/domain";

import { CAREER_MATCH_PREPARATION_FORMATIONS, buildCareerMatchPreparationView } from "./career-match-preparation-view.ts";
import type { BuildCareerMatchPreparationViewInput } from "./career-match-preparation-view.ts";

describe("buildCareerMatchPreparationView", () => {
  it("blocks saving when lineup slots and tactic are missing", () => {
    const input = baseInput();
    const view = buildCareerMatchPreparationView({
      saveId: input.saveId,
      selectedClub: input.selectedClub,
      nextFixture: input.nextFixture!,
      lineupSlots: [
        slot("slot:01", undefined),
        slot("slot:02", "player:002"),
      ],
      tacticProfiles: input.tacticProfiles,
    });

    expect(view.status).toBe("blocked");
    expect(view.blockerKeys).toEqual(["missing_lineup_slot", "missing_tactic"]);
    expect(view.lineup.selectedSlotCount).toBe(1);
    expect(view.lineup.slots[0]?.status).toBe("missing_player");
    expect(view.saveAction).toEqual({
      actionId: "save_preparation",
      status: "blocked",
      blockerKeys: ["missing_lineup_slot", "missing_tactic"],
      labelKey: "career.matchPreparation.action.save",
    });
  });

  it("allows saving when fixture, lineup, and tactic are complete", () => {
    const view = buildCareerMatchPreparationView(baseInput());

    expect(view.status).toBe("ready_to_save");
    expect(view.blockerKeys).toEqual([]);
    expect(view.lineup.selectedSlotCount).toBe(2);
    expect(view.lineup.requiredSlotCount).toBe(2);
    expect(view.lineup.slots.map((slotView) => slotView.status)).toEqual(["valid", "valid"]);
    expect(view.tactic.selectedTacticProfileId).toBe("tactic:balanced");
    expect(view.saveAction.status).toBe("available");
    expect(view.summaryKey).toBe("career.matchPreparation.summary.ready_to_save");
  });

  it("exposes the default formation catalog and selected formation", () => {
    const view = buildCareerMatchPreparationView(baseInput());

    expect(view.formation.selectedFormationId).toBe("4-4-2");
    expect(view.formation.formations.map((formation) => formation.formationId)).toEqual([
      "4-4-2",
      "4-3-3",
      "4-2-3-1",
      "4-3-1-2",
      "3-5-2",
      "3-4-3",
      "3-6-1",
      "5-3-2",
      "4-1-4-1",
    ]);
    expect(view.formation.selectedSlots).toHaveLength(11);
    expect(view.formation.selectedSlots.map((slotView) => slotView.slotKey)).toEqual([
      "gk",
      "rb",
      "cb-right",
      "cb-left",
      "lb",
      "rm",
      "cm-right",
      "cm-left",
      "lm",
      "st-right",
      "st-left",
    ]);
  });

  it("exposes alternate formation slot order", () => {
    const view = buildCareerMatchPreparationView({
      ...baseInput(),
      selectedFormationId: "4-2-3-1",
    });

    expect(view.formation.selectedFormationId).toBe("4-2-3-1");
    expect(view.formation.selectedSlots.map((slotView) => slotView.slotKey)).toEqual([
      "gk",
      "rb",
      "cb-right",
      "cb-left",
      "lb",
      "dm-right",
      "dm-left",
      "rw",
      "am",
      "lw",
      "st",
    ]);
  });

  it("exposes three-six-one with a defensive midfielder below central midfield", () => {
    const view = buildCareerMatchPreparationView({
      ...baseInput(),
      selectedFormationId: "3-6-1",
    });

    expect(view.formation.selectedSlots.map((slotView) => slotView.slotKey)).toEqual([
      "gk",
      "cb-right",
      "cb-center",
      "cb-left",
      "dm",
      "rm",
      "cm-right",
      "cm-left",
      "lm",
      "am",
      "st",
    ]);
  });

  it("labels two-forward formations as two central attackers", () => {
    for (const selectedFormationId of ["3-5-2", "5-3-2"] as const) {
      const view = buildCareerMatchPreparationView({
        ...baseInput(),
        selectedFormationId,
      });
      const forwardSlots = view.formation.selectedSlots.filter((slot) => slot.slotKey === "st-right" || slot.slotKey === "st-left");

      expect(forwardSlots.map((slot) => slot.labelKey)).toEqual([
        "career.matchPreparation.slot.st",
        "career.matchPreparation.slot.st",
      ]);
    }
  });

  it("labels three-forward formations with one striker and two wide forwards", () => {
    const view = buildCareerMatchPreparationView({
      ...baseInput(),
      selectedFormationId: "4-3-3",
    });

    expect(view.formation.selectedSlots.slice(-3).map((slot) => slot.labelKey)).toEqual([
      "career.matchPreparation.slot.rw",
      "career.matchPreparation.slot.lw",
      "career.matchPreparation.slot.st",
    ]);
  });

  it("derives formation slots from the domain catalog", () => {
    for (const formation of CAREER_MATCH_PREPARATION_FORMATIONS) {
      expect(formation.slots.map((slot) => slot.slotKey)).toEqual(
        FORMATION_CATALOG[formation.formationId].slots.map((slot) => slot.slotKey),
      );
      expect(formation.slots.map((slot) => slot.positionKey)).toEqual(
        FORMATION_CATALOG[formation.formationId].slots.map((slot) => positionKeyForRole(slot.playerRole)),
      );
    }
  });

  it("allows saving when formation, lineup, bench, and tactic are complete", () => {
    const view = buildCareerMatchPreparationView({
      ...baseInput(),
      formations: CAREER_MATCH_PREPARATION_FORMATIONS,
      selectedFormationId: "4-3-3",
      benchSlots: [
        benchSlot("bench:01", "player:003"),
        benchSlot("bench:02", "player:004"),
      ],
    });

    expect(view.status).toBe("ready_to_save");
    expect(view.blockerKeys).toEqual([]);
    expect(view.formation.selectedFormationId).toBe("4-3-3");
    expect(view.bench.selectedSlotCount).toBe(2);
    expect(view.bench.requiredSlotCount).toBe(2);
    expect(view.bench.slots.map((slotView) => slotView.status)).toEqual(["valid", "valid"]);
    expect(view.saveAction.status).toBe("available");
  });

  it("marks complete preparation as saved when caller state says it was saved", () => {
    const view = buildCareerMatchPreparationView({
      ...baseInput(),
      isSaved: true,
    });

    expect(view.status).toBe("saved");
    expect(view.summaryKey).toBe("career.matchPreparation.summary.saved");
    expect(view.saveAction.status).toBe("available");
  });

  it("blocks duplicate player selections and marks both affected slots", () => {
    const view = buildCareerMatchPreparationView({
      ...baseInput(),
      lineupSlots: [
        slot("slot:01", "player:001"),
        slot("slot:02", "player:001"),
      ],
    });

    expect(view.status).toBe("blocked");
    expect(view.blockerKeys).toEqual(["duplicate_lineup_player"]);
    expect(view.lineup.slots.map((slotView) => slotView.status)).toEqual([
      "duplicate_player",
      "duplicate_player",
    ]);
  });

  it("blocks a player selected in both lineup and bench", () => {
    const view = buildCareerMatchPreparationView({
      ...baseInput(),
      benchSlots: [
        benchSlot("bench:01", "player:001"),
        benchSlot("bench:02", "player:004"),
      ],
    });

    expect(view.status).toBe("blocked");
    expect(view.blockerKeys).toEqual(["player_in_lineup_and_bench"]);
    expect(view.bench.slots.map((slotView) => slotView.status)).toEqual(["lineup_player", "valid"]);
  });

  it("blocks missing and duplicate bench players", () => {
    const view = buildCareerMatchPreparationView({
      ...baseInput(),
      benchSlots: [
        benchSlot("bench:01", undefined),
        benchSlot("bench:02", "player:003"),
        benchSlot("bench:03", "player:003"),
      ],
    });

    expect(view.status).toBe("blocked");
    expect(view.blockerKeys).toEqual(["missing_bench_slot", "duplicate_bench_player"]);
    expect(view.bench.slots.map((slotView) => slotView.status)).toEqual([
      "missing_player",
      "duplicate_player",
      "duplicate_player",
    ]);
  });

  it("blocks missing selected formation", () => {
    const view = buildCareerMatchPreparationView({
      ...baseInput(),
      formations: [],
      selectedFormationId: "4-4-2",
    });

    expect(view.status).toBe("blocked");
    expect(view.blockerKeys).toEqual(["missing_formation"]);
    expect(view.formation.selectedFormationId).toBeUndefined();
  });

  it("blocks when no next fixture exists", () => {
    const input = baseInput();
    const view = buildCareerMatchPreparationView({
      saveId: input.saveId,
      selectedClub: input.selectedClub,
      lineupSlots: input.lineupSlots,
      tacticProfiles: input.tacticProfiles,
      selectedTacticProfileId: "tactic:balanced",
    });

    expect(view.status).toBe("blocked");
    expect(view.blockerKeys).toEqual(["no_next_fixture"]);
    expect(view.nextFixture).toBeUndefined();
  });
});

function baseInput(): BuildCareerMatchPreparationViewInput {
  return {
    saveId: "save:phase52",
    selectedClub: {
      clubId: "club:perugia",
      name: "S.S. Perugia",
    },
    nextFixture: {
      fixtureId: "fixture:000003",
      dateIso: "2026-08-01",
      round: 1,
      homeClub: {
        clubId: "club:pisa",
        name: "U.S. Pisa",
      },
      awayClub: {
        clubId: "club:perugia",
        name: "S.S. Perugia",
      },
      selectedClubSide: "away",
    },
    lineupSlots: [
      slot("slot:01", "player:001"),
      slot("slot:02", "player:002"),
    ],
    tacticProfiles: [
      {
        tacticProfileId: "tactic:balanced",
        labelKey: "career.matchPreparation.tactic.balanced",
        values: {
          mentality: "balanced",
          pressing: 0.5,
          directness: 0.5,
          width: 0.5,
          risk: 0.5,
        },
      },
    ],
    selectedTacticProfileId: "tactic:balanced",
  };
}

function slot(slotKey: string, selectedPlayerId: string | undefined) {
  return {
    slotKey,
    labelKey: `career.matchPreparation.slot.${slotKey}`,
    roleKey: "midfielder",
    ...(selectedPlayerId === undefined ? {} : { selectedPlayerId }),
    playerOptions: [
      {
        playerId: "player:001",
        name: "Luca Ferri",
        roleKey: "goalkeeper",
        positionKey: "gk",
        fitness: 100,
      },
      {
        playerId: "player:002",
        name: "Marco Rossi",
        roleKey: "defender",
        positionKey: "cb",
        fitness: 92,
      },
    ],
  };
}

function benchSlot(slotKey: string, selectedPlayerId: string | undefined) {
  return {
    slotKey,
    labelKey: `career.matchPreparation.bench.${slotKey}`,
    ...(selectedPlayerId === undefined ? {} : { selectedPlayerId }),
    playerOptions: [
      {
        playerId: "player:001",
        name: "Luca Ferri",
        roleKey: "goalkeeper",
        positionKey: "gk",
        fitness: 100,
      },
      {
        playerId: "player:002",
        name: "Marco Rossi",
        roleKey: "defender",
        positionKey: "cb",
        fitness: 92,
      },
      {
        playerId: "player:003",
        name: "Nico Bianchi",
        roleKey: "midfielder",
        positionKey: "cm",
        fitness: 89,
      },
      {
        playerId: "player:004",
        name: "Dario Galli",
        roleKey: "attacker",
        positionKey: "st",
        fitness: 95,
      },
    ],
  };
}

function positionKeyForRole(playerRole: CanonicalPlayerRole): string {
  const positionKeyByRole: Readonly<Record<CanonicalPlayerRole, string>> = {
    goalkeeper: "gk",
    right_full_back: "rb",
    center_back: "cb",
    left_full_back: "lb",
    defensive_midfielder: "dm",
    central_midfielder: "cm",
    right_midfielder: "rm",
    left_midfielder: "lm",
    attacking_midfielder: "am",
    right_winger: "rw",
    left_winger: "lw",
    striker: "st",
  };

  return positionKeyByRole[playerRole];
}
