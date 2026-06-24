import { describe, expect, it } from "vitest";

import { createTacticalBoardDraft } from "./tactical-board-state";
import {
  canChangeTacticalBoardSlotRole,
  canDragTacticalBoardSlot,
  shouldCancelTacticalBoardLongPress,
  tacticalBoardPointerDistance,
  tacticalBoardZoneRect,
} from "./tactical-board-interactions";
import { TACTICAL_BOARD_ROLES } from "./tactical-board-roles";

describe("tactical-board-interactions", () => {
  it("keeps locked goalkeepers fixed while allowing normal occupied slots to drag", () => {
    const draft = createTacticalBoardDraft("4-4-2", { gk: "player:gk", "st-left": "player:st" });
    const goalkeeper = draft.slots.find((slot) => slot.slotId === "gk");
    const striker = draft.slots.find((slot) => slot.slotId === "st-left");

    expect(goalkeeper).toBeDefined();
    expect(striker).toBeDefined();
    expect(canDragTacticalBoardSlot(goalkeeper!)).toBe(false);
    expect(canChangeTacticalBoardSlotRole(goalkeeper!)).toBe(false);
    expect(canDragTacticalBoardSlot(striker!)).toBe(true);
    expect(canChangeTacticalBoardSlotRole(striker!)).toBe(true);
  });

  it("requires an occupied non-locked slot before drag can start", () => {
    const draft = createTacticalBoardDraft("4-4-2");
    const emptyStriker = draft.slots.find((slot) => slot.slotId === "st-left");

    expect(emptyStriker).toBeDefined();
    expect(canDragTacticalBoardSlot(emptyStriker!)).toBe(false);
  });

  it("cancels long press only after the movement threshold is exceeded", () => {
    const start = { x: 10, y: 10 };

    expect(tacticalBoardPointerDistance(start, { x: 16, y: 18 })).toBe(10);
    expect(shouldCancelTacticalBoardLongPress(start, { x: 16, y: 18 })).toBe(false);
    expect(shouldCancelTacticalBoardLongPress(start, { x: 17, y: 18 })).toBe(true);
  });

  it("creates an SVG rectangle for the active movement zone", () => {
    const rect = tacticalBoardZoneRect(TACTICAL_BOARD_ROLES.CC.zone);

    expect(rect.x).toBeGreaterThanOrEqual(60);
    expect(rect.y).toBeGreaterThanOrEqual(60);
    expect(rect.width).toBeGreaterThan(0);
    expect(rect.height).toBeGreaterThan(0);
  });
});
