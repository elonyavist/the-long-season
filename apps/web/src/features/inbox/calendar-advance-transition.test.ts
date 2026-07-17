import { describe, expect, it } from "vitest";

import { buildCalendarAdvanceTransition } from "./calendar-advance-transition";

describe("buildCalendarAdvanceTransition", () => {
  it("shows each ordinary day at a readable pace", () => {
    const plan = buildCalendarAdvanceTransition("2026-08-01", "2026-08-04");

    expect(plan.frames).toEqual([
      { dateIso: "2026-08-02", delayMs: 120 },
      { dateIso: "2026-08-03", delayMs: 120 },
      { dateIso: "2026-08-04", delayMs: 120 },
    ]);
    expect(plan.totalDurationMs).toBe(360);
  });

  it("accelerates long advances while ending on the real stop date", () => {
    const plan = buildCalendarAdvanceTransition("2026-08-01", "2026-12-01");

    expect(plan.frames.slice(0, 7).every((frame) => frame.delayMs === 120)).toBe(true);
    expect(plan.frames.at(-1)?.dateIso).toBe("2026-12-01");
    expect(plan.frames).toHaveLength(31);
    expect(plan.totalDurationMs).toBeLessThanOrEqual(1_800);
  });

  it("handles leap days with canonical UTC date arithmetic", () => {
    const plan = buildCalendarAdvanceTransition("2028-02-27", "2028-03-01");

    expect(plan.frames.map((frame) => frame.dateIso)).toEqual([
      "2028-02-28",
      "2028-02-29",
      "2028-03-01",
    ]);
  });

  it("presents the final date immediately for reduced motion and same-day stops", () => {
    expect(buildCalendarAdvanceTransition("2026-08-01", "2026-08-10", true)).toMatchObject({
      initialDateIso: "2026-08-10",
      totalDurationMs: 0,
      frames: [],
    });
    expect(buildCalendarAdvanceTransition("2026-08-01", "2026-08-01")).toMatchObject({
      initialDateIso: "2026-08-01",
      elapsedDays: 0,
      frames: [],
    });
  });

  it("rejects invalid or backwards dates", () => {
    expect(() => buildCalendarAdvanceTransition("2026-02-30", "2026-03-01")).toThrow(RangeError);
    expect(() => buildCalendarAdvanceTransition("2026-08-02", "2026-08-01")).toThrow(RangeError);
  });
});
