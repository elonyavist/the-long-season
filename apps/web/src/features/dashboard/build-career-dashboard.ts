import { computeLeagueTable, findNextCareerFixture } from "@game/engine";
import { toISO } from "@game/shared";
import {
  buildCareerDashboardView,
  type BuildCareerDashboardViewInput,
  type CareerDashboardView,
} from "@game/ui";

import type { WebCareerState } from "../../runtime/web-career-runtime";

type WebCareerFixture = NonNullable<
  WebCareerState["gameState"]["fixtures"][keyof WebCareerState["gameState"]["fixtures"]]
>;

/** Builds the dashboard read model from one validated durable career. */
export function buildCareerDashboard(careerState: WebCareerState): CareerDashboardView {
  return buildCareerDashboardView(buildCareerDashboardInput(careerState));
}

/** Maps durable career facts into the framework-free dashboard input contract. */
export function buildCareerDashboardInput(careerState: WebCareerState): BuildCareerDashboardViewInput {
  const selectedClub = careerState.gameState.clubs[careerState.selectedClubId];
  if (selectedClub === undefined) {
    throw new Error(`Loaded career selected club is missing: ${careerState.selectedClubId}`);
  }

  const nextFixture = findNextCareerFixture(careerState);
  if (nextFixture.status === "invalid") {
    throw new Error(`Loaded career next fixture is invalid: ${nextFixture.reason}`);
  }

  const preparation = careerState.matchPreparation;
  const preparationTargetsNextFixture = nextFixture.status === "found"
    && preparation?.targetFixtureId === nextFixture.fixture.id;
  const leagueTableRows = buildCurrentLeagueTableRows(careerState);
  const playedSeasonFixtures = findCurrentSeasonPlayedFixtures(careerState);
  const leagueResults = findLatestLeagueRoundFixtures(playedSeasonFixtures).map((fixture) => ({
    fixtureId: fixture.id,
    round: fixture.roundNumber,
    homeClub: requiredDashboardClub(careerState, fixture.homeClubId),
    awayClub: requiredDashboardClub(careerState, fixture.awayClubId),
    isSelectedClubFixture:
      fixture.homeClubId === careerState.selectedClubId
      || fixture.awayClubId === careerState.selectedClubId,
    homeGoals: fixture.result?.homeGoals ?? 0,
    awayGoals: fixture.result?.awayGoals ?? 0,
  }));
  const latestSelectedResult = findLatestSelectedClubFixture(
    playedSeasonFixtures,
    careerState.selectedClubId,
  );

  return {
    saveId: careerState.saveId,
    ...(careerState.careerWorld === undefined
      ? {}
      : {
          worldSeed: careerState.careerWorld.worldSeed,
          generatorVersion: careerState.careerWorld.generatorVersion,
        }),
    currentDateIso: toISO(careerState.gameState.calendar.currentDate),
    currentSeasonId: careerState.gameState.calendar.currentSeasonId,
    selectedClub: {
      clubId: selectedClub.id,
      name: selectedClub.name,
      rosterSize: selectedClub.playerIds.length,
    },
    ...(nextFixture.status === "found"
      ? { nextFixture: toDashboardFixture(careerState, nextFixture.fixture) }
      : {}),
    preparation: {
      hasSavedLineup: preparationTargetsNextFixture && preparation?.selectedLineup !== undefined,
      hasSavedTactic: preparationTargetsNextFixture && preparation?.tactic !== undefined,
      ...(!preparationTargetsNextFixture
        ? {}
        : { targetFixtureId: nextFixture.fixture.id }),
    },
    playerConditions: selectedClub.playerIds.map((playerId) => ({
      playerId,
      fitness: careerState.gameState.playerStates[playerId]?.fitness ?? 0,
    })),
    ...(leagueTableRows === undefined ? {} : { leagueTableRows }),
    ...(leagueResults.length === 0 ? {} : { leagueResults }),
    ...(latestSelectedResult === undefined
      ? {}
      : {
          recentMatch: {
            fixtureId: latestSelectedResult.id,
            homeClub: requiredDashboardClub(careerState, latestSelectedResult.homeClubId),
            awayClub: requiredDashboardClub(careerState, latestSelectedResult.awayClubId),
            homeGoals: latestSelectedResult.result?.homeGoals ?? 0,
            awayGoals: latestSelectedResult.result?.awayGoals ?? 0,
          },
        }),
  };
}

/** Derives the current competition table only after its first completed fixture. */
function buildCurrentLeagueTableRows(
  careerState: WebCareerState,
): BuildCareerDashboardViewInput["leagueTableRows"] {
  const currentSeasonId = careerState.gameState.calendar.currentSeasonId;
  const currentFixtureIds = careerState.gameState.fixtureIds.filter((fixtureId) =>
    careerState.gameState.fixtures[fixtureId]?.seasonId === currentSeasonId,
  );
  const hasPlayedFixture = currentFixtureIds.some((fixtureId) =>
    careerState.gameState.fixtures[fixtureId]?.result?.played === true,
  );
  if (!hasPlayedFixture) return undefined;

  return computeLeagueTable({
    clubIds: careerState.gameState.clubIds,
    fixtures: careerState.gameState.fixtures,
    fixtureIds: currentFixtureIds,
    rules: {
      pointsForWin: 3,
      pointsForDraw: 1,
      pointsForLoss: 0,
    },
  }).map((row) => ({
    position: row.position,
    club: requiredDashboardClub(careerState, row.clubId),
    played: row.played,
    wins: row.wins,
    draws: row.draws,
    losses: row.losses,
    goalDifference: row.goalDifference,
    points: row.points,
  }));
}

/** Converts one engine-selected fixture without reimplementing fixture choice. */
function toDashboardFixture(
  careerState: WebCareerState,
  fixture: WebCareerState["gameState"]["fixtures"][keyof WebCareerState["gameState"]["fixtures"]],
): NonNullable<BuildCareerDashboardViewInput["nextFixture"]> {
  if (fixture === undefined) throw new Error("Loaded career next fixture is missing");

  return {
    fixtureId: fixture.id,
    dateIso: toISO(fixture.date),
    round: fixture.roundNumber,
    homeClub: requiredDashboardClub(careerState, fixture.homeClubId),
    awayClub: requiredDashboardClub(careerState, fixture.awayClubId),
    selectedClubSide: fixture.homeClubId === careerState.selectedClubId ? "home" : "away",
  };
}

/** Returns every completed fixture in the active season. */
function findCurrentSeasonPlayedFixtures(careerState: WebCareerState): WebCareerFixture[] {
  const fixtures: WebCareerFixture[] = [];
  const currentSeasonId = careerState.gameState.calendar.currentSeasonId;

  for (const fixtureId of careerState.gameState.fixtureIds) {
    const fixture = careerState.gameState.fixtures[fixtureId];
    if (fixture?.result?.played === true && fixture.seasonId === currentSeasonId) {
      fixtures.push(fixture);
    }
  }

  return fixtures;
}

/** Returns every completed result from the newest played round. */
function findLatestLeagueRoundFixtures(fixtures: readonly WebCareerFixture[]): WebCareerFixture[] {
  let latestRound: number | undefined;
  for (const fixture of fixtures) {
    latestRound = latestRound === undefined
      ? fixture.roundNumber
      : Math.max(latestRound, fixture.roundNumber);
  }

  return latestRound === undefined
    ? []
    : fixtures.filter((fixture) => fixture.roundNumber === latestRound);
}

/** Finds the selected club's chronologically newest completed fixture. */
function findLatestSelectedClubFixture(
  fixtures: readonly WebCareerFixture[],
  selectedClubId: string,
): WebCareerFixture | undefined {
  let latest: WebCareerFixture | undefined;

  for (const fixture of fixtures) {
    if (fixture.homeClubId !== selectedClubId && fixture.awayClubId !== selectedClubId) continue;
    if (latest === undefined || compareFixtureChronology(fixture, latest) > 0) latest = fixture;
  }

  return latest;
}

function compareFixtureChronology(left: WebCareerFixture, right: WebCareerFixture): number {
  return toISO(left.date).localeCompare(toISO(right.date))
    || left.roundNumber - right.roundNumber
    || String(left.id).localeCompare(String(right.id));
}

/** Resolves a validated club into the UI package's narrow identity shape. */
function requiredDashboardClub(careerState: WebCareerState, clubId: string) {
  const club = careerState.gameState.clubs[clubId as keyof WebCareerState["gameState"]["clubs"]];
  if (club === undefined) throw new Error(`Loaded career fixture club is missing: ${clubId}`);
  return { clubId: club.id, name: club.name };
}
