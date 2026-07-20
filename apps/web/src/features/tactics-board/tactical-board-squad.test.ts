import { describe, expect, it } from "vitest";

import {
  buildTacticalBoardSquadPlayer,
  buildTacticalBoardSquadPlayers,
  formTrendFromFitness,
  surnameFromDisplayName,
} from "./tactical-board-squad";

describe("tactical-board-squad", () => {
  it("maps match-preparation player options into board-ready player facts", () => {
    const [player] = buildTacticalBoardSquadPlayers([
      {
        playerId: "player:demo-10",
        name: "Nico Rinaldi",
        roleKey: "attacker",
        positionKey: "st",
        fitness: 82,
        currentAbility: 79,
      },
    ]);

    expect(player).toMatchObject({
      id: "player:demo-10",
      playerId: "player:demo-10",
      number: 1,
      surname: "Rinaldi",
      formTrend: "flat",
      primaryRole: "striker",
      roleCode: "ATT",
      fitness: 82,
      currentAbility: 79,
    });
    expect(player?.altRoles).toContain("right_winger");
    expect(player?.suitabilityByRole.ATT).toBe("natural");
    expect(player?.suitabilityByRole.TD).toBe("unconvincing");
  });

  it("builds deterministic shirt numbers from option order", () => {
    const players = buildTacticalBoardSquadPlayers([
      { playerId: "player:one", name: "One Keeper", roleKey: "goalkeeper", positionKey: "gk" },
      { playerId: "player:two", name: "Two Defender", roleKey: "defender", positionKey: "cb" },
    ]);

    expect(players.map((player) => player.number)).toEqual([1, 2]);
  });

  it("derives role suitability without storing it as mutable state", () => {
    const player = buildTacticalBoardSquadPlayer(
      {
        playerId: "player:wide",
        name: "Kaito Tanaka",
        roleKey: "midfielder",
        positionKey: "wide",
        fitness: 100,
      },
      17,
    );

    expect(player.suitabilityByRole.ED).toBe("natural");
    expect(player.suitabilityByRole.AD).toBe("accomplished");
    expect(player.suitabilityByRole.POR).toBe("makeshift");
  });

  it("keeps surname and form trend derivation simple and deterministic", () => {
    expect(surnameFromDisplayName("Davide De Marchi")).toBe("Marchi");
    expect(formTrendFromFitness(95)).toBe("up");
    expect(formTrendFromFitness(70)).toBe("flat");
    expect(formTrendFromFitness(69)).toBe("down");
    expect(formTrendFromFitness(undefined)).toBe("up");
  });
});
