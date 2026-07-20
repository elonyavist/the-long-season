import { describe, expect, it } from "vitest";

import {
  adaptTacticalBoardSlot,
  assignTacticalBoardPlayer,
  changeTacticalBoardSlotRole,
  clearTacticalBoardSlot,
  createTacticalBoardDraft,
  exchangeTacticalBoardSlotPlayers,
  loadTacticalBoardBaseFormation,
  moveTacticalBoardSlot,
  removeTacticalBoardPlayer,
  tacticalBoardSelectedPlayerIdsBySlot,
} from "./tactical-board-state";

describe("tactical board state", () => {
  it("starts from a base formation with eleven empty slots", () => {
    const draft = createTacticalBoardDraft("4-4-2");

    expect(draft.baseFormationId).toBe("4-4-2");
    expect(draft.slots).toHaveLength(11);
    expect(draft.slots.every((slot) => slot.playerId === null)).toBe(true);
  });

  it("prevents one player from occupying two XI slots", () => {
    let draft = createTacticalBoardDraft("4-4-2");
    draft = assignTacticalBoardPlayer(draft, "gk", "player:one");
    draft = assignTacticalBoardPlayer(draft, "st-left", "player:one");

    expect(tacticalBoardSelectedPlayerIdsBySlot(draft)).toEqual({
      "st-left": "player:one",
    });
  });

  it("removes one player from the XI without changing the tactical structure", () => {
    let draft = createTacticalBoardDraft("4-4-2");
    draft = assignTacticalBoardPlayer(draft, "gk", "player:one");
    draft = assignTacticalBoardPlayer(draft, "st-left", "player:two");

    const nextDraft = removeTacticalBoardPlayer(draft, "player:one");

    expect(nextDraft.baseFormationId).toBe("4-4-2");
    expect(nextDraft.slots).toHaveLength(11);
    expect(tacticalBoardSelectedPlayerIdsBySlot(nextDraft)).toEqual({
      "st-left": "player:two",
    });
  });

  it("preserves only compatible same-slot selections when formation changes", () => {
    let draft = createTacticalBoardDraft("4-4-2");
    draft = assignTacticalBoardPlayer(draft, "gk", "player:gk");
    draft = assignTacticalBoardPlayer(draft, "cm-right", "player:cm");
    draft = assignTacticalBoardPlayer(draft, "rm", "player:rm");

    const nextDraft = loadTacticalBoardBaseFormation(draft, "4-2-3-1");

    expect(tacticalBoardSelectedPlayerIdsBySlot(nextDraft)).toEqual({
      gk: "player:gk",
    });
  });

  it("does not move or change the goalkeeper role", () => {
    let draft = createTacticalBoardDraft("4-4-2");
    const goalkeeper = draft.slots.find((slot) => slot.slotId === "gk");

    draft = moveTacticalBoardSlot(draft, "gk", 0.1, 0.1);
    draft = changeTacticalBoardSlotRole(draft, "gk", "ATT");

    expect(draft.slots.find((slot) => slot.slotId === "gk")).toMatchObject({
      nx: goalkeeper?.nx,
      ny: goalkeeper?.ny,
      role: "POR",
      canonicalRole: "goalkeeper",
    });
  });

  it("moves and changes non-goalkeeper slots through role zones", () => {
    let draft = createTacticalBoardDraft("4-4-2");
    draft = moveTacticalBoardSlot(draft, "rm", 0.9, 0.32);
    draft = changeTacticalBoardSlotRole(draft, "rm", "AD");

    const slot = draft.slots.find((candidate) => candidate.slotId === "rm");

    expect(slot).toMatchObject({
      role: "AD",
      canonicalRole: "right_winger",
    });
    expect(slot?.ny).toBeGreaterThanOrEqual(0.08);
    expect(slot?.ny).toBeLessThanOrEqual(0.42);
  });

  it("clears only the player assignment", () => {
    let draft = createTacticalBoardDraft("4-4-2");
    draft = assignTacticalBoardPlayer(draft, "st-left", "player:st");
    draft = clearTacticalBoardSlot(draft, "st-left");

    const slot = draft.slots.find((candidate) => candidate.slotId === "st-left");

    expect(slot).toMatchObject({
      role: "ATT",
      playerId: null,
    });
  });

  it("confirms role and destination adaptation atomically", () => {
    let draft = createTacticalBoardDraft("4-4-2");
    draft = assignTacticalBoardPlayer(draft, "cm-left", "player:cm");

    const adapted = adaptTacticalBoardSlot(draft, "cm-left", "TRQ", 0.52, 0.31);

    expect(adapted.slots.find((slot) => slot.slotId === "cm-left")).toMatchObject({
      playerId: "player:cm",
      role: "TRQ",
      canonicalRole: "attacking_midfielder",
      nx: 0.52,
      ny: 0.31,
    });
  });

  it("exchanges XI players without moving their tactical slots", () => {
    let draft = createTacticalBoardDraft("4-4-2");
    draft = assignTacticalBoardPlayer(draft, "cm-left", "player:left");
    draft = assignTacticalBoardPlayer(draft, "cm-right", "player:right");

    const exchanged = exchangeTacticalBoardSlotPlayers(draft, "cm-left", "cm-right");

    expect(tacticalBoardSelectedPlayerIdsBySlot(exchanged)).toMatchObject({
      "cm-left": "player:right",
      "cm-right": "player:left",
    });
    expect(exchanged.slots.find((slot) => slot.slotId === "cm-left")?.nx)
      .toBe(draft.slots.find((slot) => slot.slotId === "cm-left")?.nx);
  });
});
