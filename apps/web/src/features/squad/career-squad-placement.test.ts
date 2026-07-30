import { describe, expect, it } from "vitest";

import {
  planCareerSquadPlacement,
  type CareerSquadPlacementSlot,
} from "./career-squad-placement";

const LINEUP: readonly CareerSquadPlacementSlot[] = [
  { slotKey: "lineup:gk", playerId: "player:gk" },
  { slotKey: "lineup:left", playerId: "player:left" },
  { slotKey: "lineup:right", playerId: "player:right" },
];

const BENCH: readonly CareerSquadPlacementSlot[] = [
  { slotKey: "bench:01", playerId: "player:bench" },
  { slotKey: "bench:02" },
  { slotKey: "bench:03" },
];

describe("planCareerSquadPlacement", () => {
  it("returns an explicit no-op for the player's current XI destination", () => {
    expect(planCareerSquadPlacement({
      playerId: "player:left",
      lineupSlots: LINEUP,
      benchSlots: BENCH,
      target: { kind: "lineup", slotKey: "lineup:left" },
    })).toEqual({ status: "noop", operations: [] });
  });

  it("swaps two occupied XI slots in deterministic callback order", () => {
    expect(planCareerSquadPlacement({
      playerId: "player:left",
      lineupSlots: LINEUP,
      benchSlots: BENCH,
      target: { kind: "lineup", slotKey: "lineup:right" },
    })).toEqual({
      status: "planned",
      operations: [
        { kind: "lineup", slotKey: "lineup:right", playerId: "player:left" },
        { kind: "lineup", slotKey: "lineup:left", playerId: "player:right" },
      ],
    });
  });

  it("moves a substitute into an occupied XI slot and preserves the same bench slot", () => {
    expect(planCareerSquadPlacement({
      playerId: "player:bench",
      lineupSlots: LINEUP,
      benchSlots: BENCH,
      target: { kind: "lineup", slotKey: "lineup:left" },
    })).toEqual({
      status: "planned",
      operations: [
        { kind: "lineup", slotKey: "lineup:left", playerId: "player:bench" },
        { kind: "bench", slotKey: "bench:01", playerId: "player:left" },
      ],
    });
  });

  it("moves an unselected player into an occupied XI slot and leaves the starter unselected", () => {
    expect(planCareerSquadPlacement({
      playerId: "player:new",
      lineupSlots: LINEUP,
      benchSlots: BENCH,
      target: { kind: "lineup", slotKey: "lineup:left" },
    })).toEqual({
      status: "planned",
      operations: [
        { kind: "lineup", slotKey: "lineup:left", playerId: "player:new" },
      ],
    });
  });

  it.each([
    ["XI", "player:left"],
    ["bench", "player:bench"],
    ["unselected", "player:new"],
  ])("moves a player from %s into an empty XI slot", (_source, playerId) => {
    const lineupSlots = LINEUP.map((slot) =>
      slot.slotKey === "lineup:right" ? { slotKey: slot.slotKey } : slot,
    );

    expect(planCareerSquadPlacement({
      playerId,
      lineupSlots,
      benchSlots: BENCH,
      target: { kind: "lineup", slotKey: "lineup:right" },
    })).toEqual({
      status: "planned",
      operations: [
        { kind: "lineup", slotKey: "lineup:right", playerId },
      ],
    });
  });

  it.each([
    ["XI", "player:left"],
    ["unselected", "player:new"],
  ])("moves a player from %s to the first free bench slot", (_source, playerId) => {
    expect(planCareerSquadPlacement({
      playerId,
      lineupSlots: LINEUP,
      benchSlots: BENCH,
      target: { kind: "bench", slotKey: "bench:02" },
    })).toEqual({
      status: "planned",
      operations: [
        { kind: "bench", slotKey: "bench:02", playerId },
      ],
    });
  });

  it.each([
    ["XI", "player:left", "lineup", "lineup:left"],
    ["bench", "player:bench", "bench", "bench:01"],
  ] as const)("removes a player from the %s", (_source, playerId, kind, slotKey) => {
    expect(planCareerSquadPlacement({
      playerId,
      lineupSlots: LINEUP,
      benchSlots: BENCH,
      target: { kind: "unselected" },
    })).toEqual({
      status: "planned",
      operations: [
        { kind, slotKey },
      ],
    });
  });

  it("returns a no-op when an unselected player stays unselected", () => {
    expect(planCareerSquadPlacement({
      playerId: "player:new",
      lineupSlots: LINEUP,
      benchSlots: BENCH,
      target: { kind: "unselected" },
    })).toEqual({ status: "noop", operations: [] });
  });

  it("rejects a bench target when the bench is full", () => {
    expect(planCareerSquadPlacement({
      playerId: "player:new",
      lineupSlots: LINEUP,
      benchSlots: BENCH.map((slot, index) => ({
        slotKey: slot.slotKey,
        playerId: slot.playerId ?? `player:reserve-${index}`,
      })),
      target: { kind: "bench", slotKey: "bench:02" },
    })).toEqual({
      status: "rejected",
      reason: "bench_full",
      operations: [],
    });
  });

  it("rejects a stale bench option instead of picking a different free slot", () => {
    expect(planCareerSquadPlacement({
      playerId: "player:new",
      lineupSlots: LINEUP,
      benchSlots: BENCH,
      target: { kind: "bench", slotKey: "bench:03" },
    })).toEqual({
      status: "rejected",
      reason: "stale_target",
      operations: [],
    });
  });

  it("rejects an explicitly stale rendered XI occupant", () => {
    expect(planCareerSquadPlacement({
      playerId: "player:new",
      lineupSlots: LINEUP,
      benchSlots: BENCH,
      target: {
        kind: "lineup",
        slotKey: "lineup:left",
        expectedPlayerId: "player:old-occupant",
      },
    })).toEqual({
      status: "rejected",
      reason: "stale_target",
      operations: [],
    });
  });

  it("accepts an explicit empty-target expectation", () => {
    const lineupSlots = LINEUP.map((slot) =>
      slot.slotKey === "lineup:right" ? { slotKey: slot.slotKey } : slot,
    );

    expect(planCareerSquadPlacement({
      playerId: "player:new",
      lineupSlots,
      benchSlots: BENCH,
      target: {
        kind: "lineup",
        slotKey: "lineup:right",
        expectedPlayerId: null,
      },
    })).toMatchObject({ status: "planned" });
  });

  it("rejects unknown targets and invalid duplicate assignments explicitly", () => {
    expect(planCareerSquadPlacement({
      playerId: "player:new",
      lineupSlots: LINEUP,
      benchSlots: BENCH,
      target: { kind: "lineup", slotKey: "lineup:missing" },
    })).toEqual({
      status: "rejected",
      reason: "unknown_target_slot",
      operations: [],
    });

    expect(planCareerSquadPlacement({
      playerId: "player:new",
      lineupSlots: LINEUP,
      benchSlots: [
        ...BENCH,
        { slotKey: "bench:04", playerId: "player:left" },
      ],
      target: { kind: "unselected" },
    })).toEqual({
      status: "rejected",
      reason: "duplicate_player_assignment",
      operations: [],
    });
  });

  it("does not invent a bench-to-bench move", () => {
    expect(planCareerSquadPlacement({
      playerId: "player:bench",
      lineupSlots: LINEUP,
      benchSlots: BENCH,
      target: { kind: "bench", slotKey: "bench:02" },
    })).toEqual({
      status: "rejected",
      reason: "unsupported_bench_move",
      operations: [],
    });
  });
});
