import { describe, expect, it } from "vitest";

import {
  comparePlayerOptionsByPosition,
  orderPlayerOptionsForLineupSlot,
  playerDepartment,
  playerPositionCode,
  playerPositionFitTierForPositionKey,
  playerPositionFitTierForSlot,
  positionSortIndex,
  scorePlayerOptionForLineupSlot,
  type WebPlayerPositionOption,
} from "./player-position-ordering";

describe("web player position ordering", () => {
  it("orders lineup select options by slot suitability before fallback options", () => {
    const players = [
      player("st", "Striker"),
      player("cm", "Central midfielder"),
      player("cb", "Center back"),
      player("gk", "Goalkeeper"),
      player("rb", "Right back"),
    ];

    expect(orderPlayerOptionsForLineupSlot("rb", players).map((option) => option.positionKey)).toEqual([
      "rb",
      "cb",
      "cm",
      "st",
      "gk",
    ]);
  });

  it("puts natural attackers before adapted attacking midfielders in striker slots", () => {
    const players = [
      player("cm", "Central midfielder"),
      player("am", "Attacking midfielder"),
      player("st", "Striker"),
      player("winger", "Winger"),
    ];

    expect(orderPlayerOptionsForLineupSlot("st-left", players).map((option) => option.positionKey)).toEqual([
      "st",
      "am",
      "winger",
      "cm",
    ]);
  });

  it("lets a strong valid adapted player outrank a mediocre natural player", () => {
    const players = [
      player("am", "Natural ten", 50),
      player("cm", "Strong central midfielder", 90),
      player("st", "Striker", 40),
    ];

    expect(orderPlayerOptionsForLineupSlot("am", players).map((option) => option.positionKey)).toEqual([
      "cm",
      "am",
      "st",
    ]);
  });

  it("keeps invalid goalkeeper selections below outfield players even when strong", () => {
    expect(scorePlayerOptionForLineupSlot("rb", player("gk", "Elite keeper", 99))).toBeLessThan(
      scorePlayerOptionForLineupSlot("rb", player("cm", "Average midfielder", 45)),
    );
  });

  it("exposes raw position fit tiers for shared tactical-board suitability", () => {
    expect(playerPositionFitTierForSlot("rb", player("rb", "Right back"))).toBe(0);
    expect(playerPositionFitTierForPositionKey("rw", player("wide", "Wide midfielder"))).toBe(1);
    expect(playerPositionFitTierForPositionKey("st", player("cm", "Central midfielder"))).toBe(2);
    expect(playerPositionFitTierForPositionKey("rb", player("st", "Striker"))).toBe(3);
    expect(playerPositionFitTierForPositionKey("st", player("gk", "Goalkeeper"))).toBe(4);
  });

  it("sorts table role column by position order, not broad role text", () => {
    const players = [
      player("st", "Striker"),
      player("gk", "Goalkeeper"),
      player("cm", "Central midfielder"),
      player("cb", "Center back"),
    ];

    expect([...players].sort(comparePlayerOptionsByPosition).map((option) => option.positionKey)).toEqual([
      "gk",
      "cb",
      "cm",
      "st",
    ]);
  });

  it("falls back from broad role to deterministic position order when position is missing", () => {
    expect(positionSortIndex({ playerId: "player:1", name: "Keeper", roleKey: "goalkeeper" })).toBe(0);
    expect(positionSortIndex({ playerId: "player:2", name: "Forward", roleKey: "attacker" })).toBeGreaterThan(
      positionSortIndex({ playerId: "player:3", name: "Midfielder", roleKey: "midfielder" }),
    );
  });

  it("maps specific positions to canonical squad codes and departments", () => {
    expect(playerPositionCode(player("gk", "Goalkeeper"))).toBe("POR");
    expect(playerPositionCode(player("rb", "Right back"))).toBe("TD");
    expect(playerPositionCode(player("dm", "Defensive midfielder"))).toBe("MED");
    expect(playerPositionCode(player("am", "Attacking midfielder"))).toBe("TRQ");
    expect(playerPositionCode(player("st", "Striker"))).toBe("ATT");
    expect(playerDepartment(player("cb", "Center back"))).toBe("defender");
    expect(playerDepartment(player("wide", "Wide midfielder"))).toBe("midfielder");
    expect(playerDepartment(player("winger", "Winger"))).toBe("attacker");
  });

  it("uses the broad role only when a specific position is unavailable", () => {
    expect(playerPositionCode({ playerId: "player:1", name: "Keeper", roleKey: "goalkeeper" })).toBe("POR");
    expect(playerDepartment({ playerId: "player:2", name: "Forward", roleKey: "attacker" })).toBe("attacker");
  });
});

function player(positionKey: string, name: string, currentAbility?: number): WebPlayerPositionOption {
  const option: WebPlayerPositionOption = {
    playerId: `player:${positionKey}:${name}`,
    name,
    roleKey: roleForPosition(positionKey),
    positionKey,
  };

  return currentAbility === undefined ? option : { ...option, currentAbility };
}

function roleForPosition(positionKey: string): string {
  if (positionKey === "gk") {
    return "goalkeeper";
  }

  if (positionKey === "rb" || positionKey === "cb" || positionKey === "lb") {
    return "defender";
  }

  if (positionKey === "st" || positionKey === "winger") {
    return "attacker";
  }

  return "midfielder";
}
