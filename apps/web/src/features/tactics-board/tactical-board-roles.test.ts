import { describe, expect, it } from "vitest";

import {
  TACTICAL_BOARD_ROLE_CODES,
  TACTICAL_BOARD_ROLES,
  canonicalRoleForBoardRole,
  tacticalBoardCellOf,
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
    expect(tacticalBoardCellOf(0.86, 0.34)).toBe("att-R");
    expect(tacticalBoardRoleOptionsForPosition(0.86, 0.34, "ED")).toContain("AD");
  });

  it("keeps central midfielders outside the attacking third through their role zone", () => {
    expect(TACTICAL_BOARD_ROLES.CC.zone.nyMin).toBeGreaterThanOrEqual(0.4);
  });
});
