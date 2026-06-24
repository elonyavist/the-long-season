import { toSvg } from "./tactical-board-geometry";
import type { TacticalBoardSlot, TacticalBoardZone } from "./tactical-board-types";

/** Long-press duration used to open the tactical-board context menu on touch devices. */
export const TACTICAL_BOARD_LONG_PRESS_MS = 520;

/** Pointer movement, in CSS pixels, after which a long press becomes an intentional move. */
export const TACTICAL_BOARD_LONG_PRESS_CANCEL_DISTANCE = 10;

/** Browser pointer coordinates used by drag and long-press helpers. */
export interface TacticalBoardPointerPoint {
  readonly x: number;
  readonly y: number;
}

/** SVG rectangle that highlights one role movement zone while dragging. */
export interface TacticalBoardZoneRect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/** Returns true when a slot can start a drag operation. */
export function canDragTacticalBoardSlot(slot: TacticalBoardSlot): boolean {
  return !slot.locked && slot.playerId !== null;
}

/** Returns true when a slot can expose role-change actions. */
export function canChangeTacticalBoardSlotRole(slot: TacticalBoardSlot): boolean {
  return !slot.locked;
}

/** Measures pointer travel from the first press location. */
export function tacticalBoardPointerDistance(
  start: TacticalBoardPointerPoint,
  current: TacticalBoardPointerPoint,
): number {
  return Math.hypot(current.x - start.x, current.y - start.y);
}

/** Returns true when pointer travel should cancel a pending long press. */
export function shouldCancelTacticalBoardLongPress(
  start: TacticalBoardPointerPoint,
  current: TacticalBoardPointerPoint,
  threshold = TACTICAL_BOARD_LONG_PRESS_CANCEL_DISTANCE,
): boolean {
  return tacticalBoardPointerDistance(start, current) > threshold;
}

/** Converts one normalized movement zone into an SVG overlay rectangle. */
export function tacticalBoardZoneRect(zone: TacticalBoardZone): TacticalBoardZoneRect {
  const topLeft = toSvg(zone.nxMin, zone.nyMin);
  const bottomRight = toSvg(zone.nxMax, zone.nyMax);

  return {
    x: topLeft.x,
    y: topLeft.y,
    width: bottomRight.x - topLeft.x,
    height: bottomRight.y - topLeft.y,
  };
}
