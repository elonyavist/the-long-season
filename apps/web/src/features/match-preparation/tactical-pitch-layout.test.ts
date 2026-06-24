import { describe, expect, it } from "vitest";

import { CAREER_MATCH_PREPARATION_FORMATIONS } from "@game/ui";

import { tacticalPitchSlotStyle } from "./tactical-pitch-layout";

/**
 * Pitch-coordinate tests protect the reusable tactical board from visual
 * regressions where multiple slots accidentally share the same grid cell.
 */
describe("tacticalPitchSlotStyle", () => {
  it.each(["4-4-2", "4-3-3", "4-2-3-1", "3-5-2", "3-6-1", "5-3-2"] as const)(
    "assigns unique visible cells for %s",
    (formationId) => {
      const formation = CAREER_MATCH_PREPARATION_FORMATIONS.find((option) => option.formationId === formationId);

      expect(formation).toBeDefined();

      const occupiedCells = (formation?.slots ?? []).map((slot) => {
        const style = tacticalPitchSlotStyle(slot.slotKey);
        return `${style["--tls-slot-column"]}:${style["--tls-slot-row"]}`;
      });

      expect(new Set(occupiedCells).size).toBe(11);
    },
  );

  it.each(["4-4-2", "4-3-3", "4-2-3-1", "3-5-2", "3-6-1", "5-3-2"] as const)(
    "keeps every %s slot inside the pitch grid",
    (formationId) => {
      const formation = CAREER_MATCH_PREPARATION_FORMATIONS.find((option) => option.formationId === formationId);

      expect(formation).toBeDefined();

      for (const slot of formation?.slots ?? []) {
        const style = tacticalPitchSlotStyle(slot.slotKey);
        const column = Number(style["--tls-slot-column"]);
        const row = Number(style["--tls-slot-row"]);

        expect(column).toBeGreaterThanOrEqual(1);
        expect(column).toBeLessThanOrEqual(7);
        expect(row).toBeGreaterThanOrEqual(1);
        expect(row).toBeLessThanOrEqual(6);
      }
    },
  );

  it("places defensive midfielders below central midfielders and above center backs", () => {
    const defensiveMidfielderRow = Number(tacticalPitchSlotStyle("dm")["--tls-slot-row"]);
    const centralMidfielderRow = Number(tacticalPitchSlotStyle("cm-center")["--tls-slot-row"]);
    const centerBackRow = Number(tacticalPitchSlotStyle("cb-center")["--tls-slot-row"]);

    expect(defensiveMidfielderRow).toBeGreaterThan(centralMidfielderRow);
    expect(defensiveMidfielderRow).toBeLessThan(centerBackRow);
  });

  it("keeps two-striker pairs central instead of wide-forward positions", () => {
    expect(tacticalPitchSlotStyle("st-left")).toMatchObject({
      "--tls-slot-column": "3",
      "--tls-slot-row": "1",
    });
    expect(tacticalPitchSlotStyle("st-right")).toMatchObject({
      "--tls-slot-column": "5",
      "--tls-slot-row": "1",
    });
  });
});
