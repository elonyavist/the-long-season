import { describe, expect, it } from "vitest";

import {
  buildWebCareerState,
  rolloverCompletedWebCareerSeason,
  type WebCareerSaveId,
  type WebCareerState,
} from "../../runtime/web-career-runtime";
import { resolveCareerTransferWindows } from "./market-transfer-windows";

describe("career transfer-window resolution", () => {
  it("uses the managed club's canonical competition instead of world fixture order", () => {
    const career = buildWebCareerState({
      saveId: "save:web-window" as WebCareerSaveId,
      worldSeed: "web-window",
    });
    const world = career.gameState.domesticCompetitionWorld;
    if (world === undefined) throw new Error("Expected domestic competition world");

    const selectedCompetitionId = world.competitionIds.find(
      (competitionId) =>
        world.competitions[competitionId]?.clubIds.includes(career.selectedClubId)
        === true,
    );
    const windows = resolveCareerTransferWindows(career);

    expect(selectedCompetitionId).toBe("competition:ita-3");
    expect(windows.competitionId).toBe(selectedCompetitionId);
    expect(career.gameState.fixtures[career.gameState.fixtureIds[0]!]!.competitionId)
      .toBe("competition:ita-1");
  });

  it("follows promoted selected-club membership into the next season", () => {
    const career = buildWebCareerState({
      saveId: "save:web-promoted-window" as WebCareerSaveId,
      worldSeed: "web-promoted-window",
    });
    const fixtures = Object.fromEntries(career.gameState.fixtureIds.map((fixtureId) => {
      const fixture = career.gameState.fixtures[fixtureId]!;
      const homeRank = Number(String(fixture.homeClubId).slice(-2));
      const awayRank = Number(String(fixture.awayClubId).slice(-2));
      return [fixtureId, {
        ...fixture,
        result: homeRank < awayRank
          ? { played: true as const, homeGoals: 2, awayGoals: 1 }
          : { played: true as const, homeGoals: 1, awayGoals: 2 },
      }];
    })) as WebCareerState["gameState"]["fixtures"];
    const result = rolloverCompletedWebCareerSeason({
      ...career,
      gameState: { ...career.gameState, fixtures },
    });

    expect(result.status).toBe("advanced");
    if (result.status !== "advanced") throw new Error("Expected completed rollover");
    const windows = resolveCareerTransferWindows(result.careerState);
    expect(windows.competitionId).toBe("competition:ita-2");
    expect(windows.seasonId).toBe("season:2027");
  });
});
