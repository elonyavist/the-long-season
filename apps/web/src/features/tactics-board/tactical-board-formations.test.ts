import { describe, expect, it } from "vitest";

import {
  DEFAULT_TACTICAL_BOARD_FORMATION_ID,
  selectCurrentTacticalBoardShape,
  tacticalBoardFormationPreset,
  tacticalBoardFormationPresets,
  tacticalBoardSlotsFromFormation,
} from "./tactical-board-formations";

describe("tactical board formations", () => {
  it("adapts formation presets from the UI formation catalog", () => {
    const presets = tacticalBoardFormationPresets();

    expect(presets.length).toBeGreaterThan(0);
    expect(presets.some((preset) => preset.formationId === DEFAULT_TACTICAL_BOARD_FORMATION_ID)).toBe(true);
    expect(tacticalBoardFormationPreset("4-4-2").slots).toHaveLength(11);
  });

  it.each([
    ["4-4-2", "4-4-2"],
    ["4-3-3", "4-3-3"],
    ["3-5-2", "3-5-2"],
  ] as const)("derives %s from adapted slot roles", (formationId, expectedShape) => {
    expect(selectCurrentTacticalBoardShape(tacticalBoardSlotsFromFormation(formationId))).toBe(expectedShape);
  });

  it("derives 4-3-3 after the ED slot becomes AD", () => {
    const slots = tacticalBoardSlotsFromFormation("4-4-2").map((slot) =>
      slot.slotId === "rm" ? { ...slot, role: "AD" as const, canonicalRole: "right_winger" as const } : slot,
    );

    expect(selectCurrentTacticalBoardShape(slots)).toBe("4-3-3");
  });

  it("keeps every adapted coordinate normalized", () => {
    for (const preset of tacticalBoardFormationPresets()) {
      for (const slot of preset.slots) {
        expect(slot.nx).toBeGreaterThanOrEqual(0);
        expect(slot.nx).toBeLessThanOrEqual(1);
        expect(slot.ny).toBeGreaterThanOrEqual(0);
        expect(slot.ny).toBeLessThanOrEqual(1);
      }
    }
  });

  it("adds horizontal separation to dense central lines", () => {
    const twoAttackers = tacticalBoardSlotsFromFormation("4-4-2")
      .filter((slot) => slot.role === "ATT")
      .map((slot) => slot.nx);
    const twoCentralMidfielders = tacticalBoardSlotsFromFormation("4-4-2")
      .filter((slot) => slot.role === "CC")
      .map((slot) => slot.nx);
    const threeCentralMidfielders = tacticalBoardSlotsFromFormation("4-3-3")
      .filter((slot) => slot.role === "CC")
      .map((slot) => slot.nx);
    const threeCenterBacks = tacticalBoardSlotsFromFormation("3-5-2")
      .filter((slot) => slot.role === "DC")
      .map((slot) => slot.nx);
    const twoCenterBacks = tacticalBoardSlotsFromFormation("4-4-2")
      .filter((slot) => slot.role === "DC")
      .map((slot) => slot.nx);

    expect(twoAttackers).toEqual([0.62, 0.38]);
    expect(twoCentralMidfielders).toEqual([0.63, 0.37]);
    expect(threeCentralMidfielders).toEqual([0.68, 0.5, 0.32]);
    expect(threeCenterBacks).toEqual([0.68, 0.5, 0.32]);
    expect(twoCenterBacks).toEqual([0.62, 0.38]);
  });
});
