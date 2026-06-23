import { describe, expect, it } from "vitest";

import { buildCareerMatchPreparationView } from "./career-match-preparation-view.ts";
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
