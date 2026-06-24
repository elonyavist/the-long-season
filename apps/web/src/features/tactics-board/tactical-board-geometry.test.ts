import { describe, expect, it } from "vitest";

import { clampToZone, toNorm, toSvg } from "./tactical-board-geometry";

describe("tactical board geometry", () => {
  it("round-trips normalized coordinates through the SVG viewBox", () => {
    const svg = toSvg(0.35, 0.62);
    const normalized = toNorm(svg.x, svg.y);

    expect(normalized.nx).toBeCloseTo(0.35);
    expect(normalized.ny).toBeCloseTo(0.62);
  });

  it("clamps movement to the supplied normalized zone", () => {
    const clamped = clampToZone(-1, 2, {
      nxMin: 0.25,
      nxMax: 0.75,
      nyMin: 0.4,
      nyMax: 0.66,
    });

    expect(clamped).toEqual({ nx: 0.25, ny: 0.66 });
  });
});
