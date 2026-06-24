import { describe, expect, it } from "vitest";

import {
  lineupSelectionFromTacticalBoardDraft,
  tacticalBoardDraftFromLineupSelection,
} from "./tactical-board-adapters";

describe("tactical board adapters", () => {
  it("round-trips the current lineup selection map through the board draft", () => {
    const draft = tacticalBoardDraftFromLineupSelection("4-4-2", {
      gk: "player:gk",
      "st-left": "player:st",
    });

    expect(lineupSelectionFromTacticalBoardDraft(draft)).toEqual({
      gk: "player:gk",
      "st-left": "player:st",
    });
  });
});
