import type { TacticalBoardZone } from "./tactical-board-types";

/** SVG pitch geometry used by the shared tactical board. */
export const TACTICAL_BOARD_PITCH = {
  viewBoxW: 800,
  viewBoxH: 1170,
  x0: 60,
  y0: 60,
  fieldW: 680,
  fieldH: 1050,
} as const;

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

/** Converts normalized tactical-board coordinates into SVG viewBox coordinates. */
export function toSvg(nx: number, ny: number): { readonly x: number; readonly y: number } {
  return {
    x: TACTICAL_BOARD_PITCH.x0 + nx * TACTICAL_BOARD_PITCH.fieldW,
    y: TACTICAL_BOARD_PITCH.y0 + ny * TACTICAL_BOARD_PITCH.fieldH,
  };
}

/** Converts SVG viewBox coordinates into normalized tactical-board coordinates. */
export function toNorm(sx: number, sy: number): { readonly nx: number; readonly ny: number } {
  return {
    nx: (sx - TACTICAL_BOARD_PITCH.x0) / TACTICAL_BOARD_PITCH.fieldW,
    ny: (sy - TACTICAL_BOARD_PITCH.y0) / TACTICAL_BOARD_PITCH.fieldH,
  };
}

/** Clamps one normalized position to a role movement zone. */
export function clampToZone(
  nx: number,
  ny: number,
  zone: TacticalBoardZone,
): { readonly nx: number; readonly ny: number } {
  return {
    nx: clamp(nx, zone.nxMin, zone.nxMax),
    ny: clamp(ny, zone.nyMin, zone.nyMax),
  };
}

/** Converts a browser pointer event into normalized tactical-board coordinates. */
export function pointerToNorm(
  svg: SVGSVGElement,
  clientX: number,
  clientY: number,
): { readonly nx: number; readonly ny: number } {
  const point = svg.createSVGPoint();
  point.x = clientX;
  point.y = clientY;

  const ctm = svg.getScreenCTM();
  if (ctm === null) {
    return { nx: 0, ny: 0 };
  }

  const local = point.matrixTransform(ctm.inverse());

  return toNorm(local.x, local.y);
}
