import { describe, expect, it } from "vitest";

import type { TacticalBoardRoleCode, TacticalBoardSlot } from "./tactical-board-types";

describe("tactical board types", () => {
  it("keeps slot and player assignment separate", () => {
    const slot = {
      slotId: "gk",
      nx: 0.5,
      ny: 0.93,
      role: "POR",
      canonicalRole: "goalkeeper",
      playerId: null,
      locked: true,
    } satisfies TacticalBoardSlot;

    expect(slot.playerId).toBeNull();
    expect(slot.slotId).toBe("gk");
  });

  it("does not include reference-only role codes in the board role type", () => {
    const supported = ["POR", "TD", "DC", "TS", "MED", "CC", "ED", "ES", "TRQ", "AD", "AS", "ATT"] satisfies TacticalBoardRoleCode[];

    expect(supported).not.toContain("REG" as TacticalBoardRoleCode);
    expect(supported).not.toContain("SP" as TacticalBoardRoleCode);
    expect(supported).not.toContain("PC" as TacticalBoardRoleCode);
  });
});
