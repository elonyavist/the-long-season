import { describe, expect, it } from "vitest";

import {
  TACTICAL_BOARD_ROLE_CODES,
  TACTICAL_BOARD_ROLES,
  canonicalRoleForBoardRole,
  tacticalBoardRoleDestinationAt,
  tacticalBoardRoleOptionsForPosition,
} from "./tactical-board-roles";

describe("tactical board roles", () => {
  it("maps every board role to one canonical role", () => {
    expect(TACTICAL_BOARD_ROLE_CODES).toHaveLength(12);

    for (const role of TACTICAL_BOARD_ROLE_CODES) {
      expect(canonicalRoleForBoardRole(role)).toBe(TACTICAL_BOARD_ROLES[role].canonicalRole);
    }
  });

  it("does not expose reference-only roles", () => {
    expect(TACTICAL_BOARD_ROLE_CODES).not.toContain("REG");
    expect(TACTICAL_BOARD_ROLE_CODES).not.toContain("SP");
    expect(TACTICAL_BOARD_ROLE_CODES).not.toContain("PC");
  });

  it("exposes winger conversion when a right midfielder is dragged forward", () => {
    expect(tacticalBoardRoleOptionsForPosition(0.86, 0.34, "ED")).toContain("AD");
  });

  it("does not offer striker while a player remains in the attacking-midfielder destination", () => {
    expect(tacticalBoardRoleOptionsForPosition(0.5, 0.33, "TRQ")).toEqual(["TRQ"]);
    expect(tacticalBoardRoleOptionsForPosition(0.5, 0.18, "TRQ")).toEqual(["TRQ", "ATT"]);
  });

  it("keeps central midfielders outside the attacking third through their role zone", () => {
    expect(TACTICAL_BOARD_ROLES.CC.zone.nyMin).toBeGreaterThanOrEqual(0.4);
  });

  it("separates overlapping central destinations into explicit role intent", () => {
    expect(tacticalBoardRoleDestinationAt(0.5, 0.12)).toBe("ATT");
    expect(tacticalBoardRoleDestinationAt(0.5, 0.33)).toBe("TRQ");
    expect(tacticalBoardRoleDestinationAt(0.5, 0.48)).toBe("CC");
    expect(tacticalBoardRoleDestinationAt(0.5, 0.6)).toBe("MED");
  });

  it("maps forward right-side drag intent to right winger", () => {
    expect(tacticalBoardRoleDestinationAt(0.84, 0.25)).toBe("AD");
  });
});
