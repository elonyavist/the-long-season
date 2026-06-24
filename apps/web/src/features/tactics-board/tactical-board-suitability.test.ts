import { describe, expect, it } from "vitest";

import {
  sortTacticalBoardAssignmentCandidates,
  suitFor,
  type TacticalBoardRoleSuitability,
  type TacticalBoardSuitabilityPlayer,
} from "./tactical-board-suitability";

describe("tactical-board-suitability", () => {
  it("maps natural, adapted, weak, and invalid position fit into board suitability", () => {
    expect(suitFor(player("rb"), "TD")).toBe("natural");
    expect(suitFor(player("wide"), "AD")).toBe("accomplished");
    expect(suitFor(player("cm"), "ATT")).toBe("competent");
    expect(suitFor(player("st"), "TD")).toBe("unconvincing");
    expect(suitFor(player("gk"), "ATT")).toBe("makeshift");
  });

  it("changes suitability when the same player is evaluated in a less natural role", () => {
    const midfielder = player("cm", 90);

    expect(suitFor(midfielder, "CC")).toBe("natural");
    expect(suitFor(midfielder, "AD")).toBe("competent");
    expect(suitFor(midfielder, "POR")).toBe("makeshift");
  });

  it("orders assignment candidates by suitability ability fitness and stable identity", () => {
    const ordered = sortTacticalBoardAssignmentCandidates(
      [
        candidate("player:weak", "Weak", "unconvincing", 99, 100),
        candidate("player:natural-low", "Bianchi", "natural", 65, 100),
        candidate("player:natural-high-tired", "Rossi", "natural", 80, 70),
        candidate("player:natural-high-fit", "Abate", "natural", 80, 95),
        candidate("player:natural-high-fit-z", "Zani", "natural", 80, 95),
      ],
      "CC",
      "cm-center",
    );

    expect(ordered.map((playerOption) => playerOption.playerId)).toEqual([
      "player:natural-high-fit",
      "player:natural-high-fit-z",
      "player:natural-high-tired",
      "player:natural-low",
      "player:weak",
    ]);
  });
});

function candidate(
  playerId: string,
  surname: string,
  suitability: TacticalBoardRoleSuitability,
  currentAbility: number,
  fitness: number,
) {
  return {
    playerId,
    surname,
    currentAbility,
    fitness,
    suitabilityByRole: { CC: suitability },
  };
}

function player(positionKey: string, currentAbility = 70): TacticalBoardSuitabilityPlayer {
  return {
    playerId: `player:${positionKey}`,
    name: `Player ${positionKey}`,
    roleKey: roleForPosition(positionKey),
    positionKey,
    currentAbility,
    primaryRole: "central_midfielder",
    altRoles: [],
  };
}

function roleForPosition(positionKey: string): string {
  if (positionKey === "gk") {
    return "goalkeeper";
  }

  if (positionKey === "rb" || positionKey === "cb" || positionKey === "lb") {
    return "defender";
  }

  if (positionKey === "st" || positionKey === "winger" || positionKey === "rw" || positionKey === "lw") {
    return "attacker";
  }

  return "midfielder";
}
