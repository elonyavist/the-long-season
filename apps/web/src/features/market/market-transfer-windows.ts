import { resolveSeasonTransferWindows, seasonStartYearFromDate } from "@game/content";

import type { WebCareerState } from "../../runtime/web-career-runtime";

/**
 * Resolves the current season's competition-owned transfer windows.
 *
 * Shared by the Market read model and every market-command runtime call so
 * window resolution has exactly one owner instead of being duplicated inline.
 *
 * @throws When the current season has no fixture yet (world generation
 * invariant: every generated season has at least one fixture).
 */
export function resolveCareerTransferWindows(
  career: WebCareerState,
): ReturnType<typeof resolveSeasonTransferWindows> {
  const currentSeasonId = career.gameState.calendar.currentSeasonId;
  const seasonFixtures = career.gameState.fixtureIds
    .flatMap((fixtureId) => {
      const fixture = career.gameState.fixtures[fixtureId];
      return fixture === undefined || fixture.seasonId !== currentSeasonId ? [] : [fixture];
    })
    .sort((left, right) => left.date - right.date || String(left.id).localeCompare(String(right.id)));
  const firstFixture = seasonFixtures[0];
  if (firstFixture === undefined) throw new Error("Current-season fixture not found.");

  return resolveSeasonTransferWindows({
    competitionId: firstFixture.competitionId,
    seasonId: currentSeasonId,
    seasonStartYear: seasonStartYearFromDate(firstFixture.date),
  });
}
