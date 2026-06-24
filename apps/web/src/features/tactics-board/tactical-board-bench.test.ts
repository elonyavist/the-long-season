import { describe, expect, it } from "vitest";

import {
  createEmptyTacticalBenchSlots,
  TACTICAL_BENCH_SLOT_IDS,
  tacticalBenchSlotLabelKey,
} from "./tactical-board-bench";

describe("tactical-board-bench", () => {
  it("exposes exactly eight fixed substitute slots", () => {
    expect(TACTICAL_BENCH_SLOT_IDS).toEqual([
      "bench:01",
      "bench:02",
      "bench:03",
      "bench:04",
      "bench:05",
      "bench:06",
      "bench:07",
      "bench:08",
    ]);
  });

  it("maps fixed slot ids to localized match-preparation bench labels", () => {
    expect(tacticalBenchSlotLabelKey("bench:01")).toBe("career.matchPreparation.benchSlot.01");
    expect(tacticalBenchSlotLabelKey("bench:08")).toBe("career.matchPreparation.benchSlot.08");
  });

  it("builds empty slot views in deterministic order", () => {
    const slots = createEmptyTacticalBenchSlots();

    expect(slots).toHaveLength(8);
    expect(slots.map((slot) => slot.slotId)).toEqual(TACTICAL_BENCH_SLOT_IDS);
    expect(slots.every((slot) => slot.player === undefined)).toBe(true);
    expect(slots.every((slot) => slot.status === "missing_player")).toBe(true);
  });
});
