import assert from "node:assert/strict";
import { test } from "vitest";

import {
  CAREER_STATE_SCHEMA_VERSION,
  MATCH_EVENT_SCHEMA_VERSION,
  abilityValue,
  accruePlayerFixtureParticipation,
  clubId,
  competitionId,
  createCareerState,
  createEmptyPlayerParticipationLedger,
  fixtureId,
  gameDate,
  playerId,
  saveId,
  seasonId,
  stateValue,
  type CareerSeasonArchiveEntry,
  type CareerState,
  type Club,
  type Fixture,
  type GameState,
  type MatchReport,
  type Player,
  type PlayerAbilities,
  type PlayerDynamicState,
  type PlayerId,
  type PlayerParticipationLedger,
  type SeasonId,
} from "@game/domain";

import {
  buildCareerPlayerSeasonStatistics,
  selectCareerPlayerStatistics,
} from "./player-statistics.ts";

/** Engine tests protect statistics source coverage, event reuse, and weighted totals. */

const CURRENT_SEASON_ID = seasonId("season:current");
const ALPHA_ID = playerId("player:alpha");
const BETA_ID = playerId("player:beta");
const KEEPER_ID = playerId("player:keeper");

test("buildCareerPlayerSeasonStatistics merges ordered participation and structured event totals", () => {
  const fixture = fixtureWithReport(fixtureId("fixture:one"), CURRENT_SEASON_ID);
  const ledger = participationLedger([
    contribution(fixture.id, ALPHA_ID, { started: true, minutes: 90, rating: 8 }),
    contribution(fixture.id, BETA_ID, {
      substituteAppearance: true,
      minutes: 30,
      rating: 7,
    }),
  ]);
  const statistics = buildCareerPlayerSeasonStatistics({
    careerState: careerStateFixture({ fixtures: [fixture], playerParticipationLedger: ledger }),
    seasonId: CURRENT_SEASON_ID,
  });

  assert.equal(statistics.participationCoverage, "complete");
  assert.equal(statistics.eventCoverage, "complete");
  assert.deepEqual(statistics.rows, [
    {
      playerId: ALPHA_ID,
      starts: 1,
      substituteAppearances: 0,
      minutes: 90,
      ratingTotal: 8,
      ratingSamples: 1,
      goals: 1,
      assists: 0,
      saves: 0,
    },
    {
      playerId: BETA_ID,
      starts: 0,
      substituteAppearances: 1,
      minutes: 30,
      ratingTotal: 7,
      ratingSamples: 1,
      goals: 0,
      assists: 1,
      saves: 0,
    },
    {
      playerId: KEEPER_ID,
      starts: 0,
      substituteAppearances: 0,
      minutes: 0,
      ratingTotal: 0,
      ratingSamples: 0,
      goals: 0,
      assists: 0,
      saves: 1,
    },
  ]);
});

test("buildCareerPlayerSeasonStatistics reports partial coverage for a missing accrual and compact result", () => {
  const reported = fixtureWithReport(fixtureId("fixture:reported"), CURRENT_SEASON_ID);
  const compact = fixtureWithCompactResult(fixtureId("fixture:compact"), CURRENT_SEASON_ID);
  const ledger = participationLedger([
    contribution(reported.id, ALPHA_ID, { started: true, minutes: 90, rating: 8 }),
  ]);
  const statistics = buildCareerPlayerSeasonStatistics({
    careerState: careerStateFixture({
      fixtures: [reported, compact],
      playerParticipationLedger: ledger,
    }),
    seasonId: CURRENT_SEASON_ID,
  });

  assert.equal(statistics.participationCoverage, "partial");
  assert.equal(statistics.eventCoverage, "partial");
});

test("buildCareerPlayerSeasonStatistics keeps participation and event coverage independent", () => {
  const reportOnlyFixture = fixtureWithReport(fixtureId("fixture:report-only"), CURRENT_SEASON_ID);
  const reportOnlyStatistics = buildCareerPlayerSeasonStatistics({
    careerState: careerStateFixture({ fixtures: [reportOnlyFixture] }),
    seasonId: CURRENT_SEASON_ID,
  });
  assert.equal(reportOnlyStatistics.participationCoverage, "unavailable");
  assert.equal(reportOnlyStatistics.eventCoverage, "complete");

  const compactFixture = fixtureWithCompactResult(fixtureId("fixture:ledger-only"), CURRENT_SEASON_ID);
  const ledgerOnlyStatistics = buildCareerPlayerSeasonStatistics({
    careerState: careerStateFixture({
      fixtures: [compactFixture],
      playerParticipationLedger: participationLedger([
        contribution(compactFixture.id, ALPHA_ID, { started: true, minutes: 90, rating: 7 }),
      ]),
    }),
    seasonId: CURRENT_SEASON_ID,
  });
  assert.equal(ledgerOnlyStatistics.participationCoverage, "complete");
  assert.equal(ledgerOnlyStatistics.eventCoverage, "unavailable");
});

test.each([
  [1, "unavailable"],
  [2, "partial"],
  [4, "partial"],
  [5, "complete"],
] as const)(
  "buildCareerPlayerSeasonStatistics maps event schema %s to %s coverage",
  (eventSchemaVersion, expectedCoverage) => {
    const fixture = fixtureWithReport(
      fixtureId(`fixture:schema-${eventSchemaVersion}`),
      CURRENT_SEASON_ID,
      eventSchemaVersion,
    );
    const statistics = buildCareerPlayerSeasonStatistics({
      careerState: careerStateFixture({ fixtures: [fixture] }),
      seasonId: CURRENT_SEASON_ID,
    });

    assert.equal(statistics.eventCoverage, expectedCoverage);
  },
);

test("buildCareerPlayerSeasonStatistics reports partial participation when an appearance has no rating", () => {
  const fixture = fixtureWithReport(fixtureId("fixture:unrated"), CURRENT_SEASON_ID);
  const ledger = participationLedger([
    contribution(fixture.id, ALPHA_ID, { started: true, minutes: 90 }),
  ]);
  const statistics = buildCareerPlayerSeasonStatistics({
    careerState: careerStateFixture({ fixtures: [fixture], playerParticipationLedger: ledger }),
    seasonId: CURRENT_SEASON_ID,
  });

  assert.equal(statistics.participationCoverage, "partial");
  assert.equal(statistics.eventCoverage, "complete");
});

test("buildCareerPlayerSeasonStatistics marks compact results without accruals as unavailable", () => {
  const statistics = buildCareerPlayerSeasonStatistics({
    careerState: careerStateFixture({
      fixtures: [fixtureWithCompactResult(fixtureId("fixture:compact"), CURRENT_SEASON_ID)],
    }),
    seasonId: CURRENT_SEASON_ID,
  });

  assert.deepEqual(statistics, {
    participationCoverage: "unavailable",
    eventCoverage: "unavailable",
    rows: [],
  });
});

test("buildCareerPlayerSeasonStatistics treats a season with no played fixtures as complete zero", () => {
  const statistics = buildCareerPlayerSeasonStatistics({
    careerState: careerStateFixture({ fixtures: [] }),
    seasonId: CURRENT_SEASON_ID,
  });

  assert.deepEqual(statistics, {
    participationCoverage: "complete",
    eventCoverage: "complete",
    rows: [],
  });
});

test("selectCareerPlayerStatistics keeps weighted rating totals across current and archived seasons", () => {
  const fixture = fixtureWithReport(fixtureId("fixture:current"), CURRENT_SEASON_ID);
  const ledger = participationLedger([
    contribution(fixture.id, ALPHA_ID, {
      substituteAppearance: true,
      minutes: 25,
      rating: 8,
    }),
  ]);
  const careerState = careerStateFixture({
    fixtures: [fixture],
    playerParticipationLedger: ledger,
    seasonHistory: [
      archiveEntry(1, seasonId("season:legacy")),
      archiveEntry(2, seasonId("season:archived"), {
        participationCoverage: "complete",
        eventCoverage: "complete",
        rows: [{
          playerId: ALPHA_ID,
          starts: 2,
          substituteAppearances: 0,
          minutes: 180,
          ratingTotal: 12,
          ratingSamples: 2,
          goals: 1,
          assists: 0,
          saves: 0,
        }],
      }),
    ],
  });

  const selection = selectCareerPlayerStatistics({ careerState, playerId: ALPHA_ID });

  assert.equal(selection.currentSeasonId, CURRENT_SEASON_ID);
  assert.deepEqual(selection.currentSeason, {
    playerId: ALPHA_ID,
    starts: 0,
    substituteAppearances: 1,
    appearances: 1,
    minutes: 25,
    ratingTotal: 8,
    ratingSamples: 1,
    averageRating: 8,
    goals: 1,
    assists: 0,
    saves: 0,
    participationCoverage: "complete",
    eventCoverage: "complete",
  });
  assert.equal(selection.career.starts, 2);
  assert.equal(selection.career.substituteAppearances, 1);
  assert.equal(selection.career.appearances, 3);
  assert.equal(selection.career.ratingTotal, 20);
  assert.equal(selection.career.ratingSamples, 3);
  assert.equal(selection.career.averageRating, 20 / 3);
  assert.equal(selection.career.goals, 2);
  assert.equal(selection.career.participationCoverage, "partial");
  assert.equal(selection.career.eventCoverage, "partial");
});

/** Builds one validated career fixture around current and archived statistics facts. */
function careerStateFixture(input: {
  readonly fixtures: readonly Fixture[];
  readonly playerParticipationLedger?: PlayerParticipationLedger;
  readonly seasonHistory?: readonly CareerSeasonArchiveEntry[];
}): CareerState {
  const selectedClubId = clubId("club:selected");
  const otherClubId = clubId("club:other");
  const players = [
    playerFixture(ALPHA_ID),
    playerFixture(BETA_ID),
    playerFixture(KEEPER_ID),
  ];

  return createCareerState({
    saveId: saveId("save:player-statistics"),
    schemaVersion: CAREER_STATE_SCHEMA_VERSION,
    selectedClubId,
    gameState: gameStateFixture({
      fixtures: input.fixtures,
      players,
      clubs: [
        clubFixture(selectedClubId, [ALPHA_ID, BETA_ID]),
        clubFixture(otherClubId, [KEEPER_ID]),
      ],
    }),
    transferHistory: [],
    ...(input.playerParticipationLedger === undefined
      ? {}
      : { playerParticipationLedger: input.playerParticipationLedger }),
    ...(input.seasonHistory === undefined ? {} : { seasonHistory: input.seasonHistory }),
  });
}

/** Builds a valid completed-season archive entry for selector tests. */
function archiveEntry(
  sequenceNumber: number,
  archivedSeasonId: SeasonId,
  playerStatistics?: CareerSeasonArchiveEntry["playerStatistics"],
): CareerSeasonArchiveEntry {
  const selectedClubId = clubId("club:selected");
  const otherClubId = clubId("club:other");
  const finalTable = [
    tableRow(1, selectedClubId, 3),
    tableRow(2, otherClubId, 0),
  ];

  return {
    sequenceNumber,
    seasonId: archivedSeasonId,
    competitionId: competitionId("competition:test"),
    finalTable,
    championClubId: selectedClubId,
    selectedClubFinish: finalTable[0]!,
    aggregateGoals: { fixtureCount: 1, totalGoals: 1 },
    ...(playerStatistics === undefined ? {} : { playerStatistics }),
  };
}

/** Builds one participation ledger from deterministic fixture contributions. */
function participationLedger(
  contributions: readonly Parameters<typeof accruePlayerFixtureParticipation>[1][],
): PlayerParticipationLedger {
  return contributions.reduce(
    (ledger, row) => accruePlayerFixtureParticipation(ledger, row),
    createEmptyPlayerParticipationLedger(),
  );
}

/** Builds one participation contribution with explicit match facts. */
function contribution(
  id: Fixture["id"],
  participantId: PlayerId,
  input: {
    readonly started?: boolean;
    readonly substituteAppearance?: boolean;
    readonly minutes: number;
    readonly rating?: number;
  },
): Parameters<typeof accruePlayerFixtureParticipation>[1] {
  return {
    fixtureId: id,
    playerId: participantId,
    clubId: clubId("club:selected"),
    seasonId: CURRENT_SEASON_ID,
    monthKey: "2026-08",
    started: input.started ?? false,
    substituteAppearance: input.substituteAppearance ?? false,
    minutes: input.minutes,
    ...(input.rating === undefined ? {} : { rating: input.rating }),
    playedRoleMinutes: input.minutes === 0 ? {} : { central_midfielder: input.minutes },
  };
}

/** Builds a played fixture with the current structured event schema. */
function fixtureWithReport(
  id: Fixture["id"],
  fixtureSeasonId: SeasonId,
  eventSchemaVersion: number = MATCH_EVENT_SCHEMA_VERSION,
): Fixture {
  return {
    ...fixtureWithCompactResult(id, fixtureSeasonId),
    result: {
      played: true,
      homeGoals: 1,
      awayGoals: 0,
      report: {
        ...matchReport(id),
        eventSchemaVersion: eventSchemaVersion as MatchReport["eventSchemaVersion"],
      },
    },
  };
}

/** Builds a played fixture whose compact score has no report-level player facts. */
function fixtureWithCompactResult(id: Fixture["id"], fixtureSeasonId: SeasonId): Fixture {
  return {
    id,
    competitionId: competitionId("competition:test"),
    seasonId: fixtureSeasonId,
    roundNumber: 1,
    date: gameDate(20_000),
    homeClubId: clubId("club:selected"),
    awayClubId: clubId("club:other"),
    result: {
      played: true,
      homeGoals: 1,
      awayGoals: 0,
    },
  };
}

/** Builds the structured goal, assist, and save facts consumed by the canonical aggregator. */
function matchReport(id: Fixture["id"]): MatchReport {
  return {
    eventSchemaVersion: MATCH_EVENT_SCHEMA_VERSION,
    fixtureId: id,
    finalMinute: 90,
    score: { home: 1, away: 0 },
    stats: {
      home: { opportunities: 2, shots: 2, shotsOnTarget: 2, goals: 1 },
      away: { opportunities: 0, shots: 0, shotsOnTarget: 0, goals: 0 },
    },
    events: [
      {
        type: "goal",
        shot: shotContext("home", 20),
        scorerPlayerId: ALPHA_ID,
        assistPlayerId: BETA_ID,
      },
      {
        type: "save",
        shot: shotContext("home", 35),
        shooterPlayerId: ALPHA_ID,
        goalkeeperPlayerId: KEEPER_ID,
      },
    ],
  };
}

/** Builds a valid shot context shared by test match events. */
function shotContext(side: "home" | "away", minute: number) {
  return {
    minute,
    side,
    quality: 0.6,
    isShotOnTarget: true,
    shotType: "normal" as const,
    chanceType: "open_play" as const,
  };
}

/** Builds the minimal game state needed by statistics aggregation. */
function gameStateFixture(input: {
  readonly fixtures: readonly Fixture[];
  readonly players: readonly Player[];
  readonly clubs: readonly Club[];
}): GameState {
  return {
    meta: { seed: "statistics-test", rngAlgorithmVersion: "test", saveSchemaVersion: 1 },
    calendar: { currentDate: gameDate(20_000), currentSeasonId: CURRENT_SEASON_ID },
    players: Object.fromEntries(input.players.map((player) => [player.id, player])) as GameState["players"],
    playerIds: input.players.map((player) => player.id),
    playerStates: Object.fromEntries(
      input.players.map((player) => [player.id, playerStateFixture()]),
    ) as GameState["playerStates"],
    clubs: Object.fromEntries(input.clubs.map((club) => [club.id, club])) as GameState["clubs"],
    clubIds: input.clubs.map((club) => club.id),
    fixtures: Object.fromEntries(input.fixtures.map((fixture) => [fixture.id, fixture])) as GameState["fixtures"],
    fixtureIds: input.fixtures.map((fixture) => fixture.id),
  };
}

/** Builds one club fixture with ordered player ownership. */
function clubFixture(id: Club["id"], playerIds: readonly PlayerId[]): Club {
  return {
    id,
    name: String(id),
    shortName: String(id).slice("club:".length).toUpperCase(),
    category: "third_division",
    reputation: 5,
    playerIds,
  };
}

/** Builds one player fixture whose abilities are irrelevant to statistics aggregation. */
function playerFixture(id: PlayerId): Player {
  return {
    id,
    firstName: String(id),
    lastName: "Fixture",
    birthDate: gameDate(10_000),
    naturalPositions: [id === KEEPER_ID ? "gk" : "cm"],
    abilities: abilitySet(10),
    potential: abilitySet(12),
  };
}

/** Builds a complete ability object with one repeated value. */
function abilitySet(value: number): PlayerAbilities {
  const ability = abilityValue(value);
  return {
    technical: {
      finishing: ability,
      passing: ability,
      longPassing: ability,
      crossing: ability,
      dribbling: ability,
      technique: ability,
      tackling: ability,
      penalties: ability,
      freeKicks: ability,
    },
    physical: {
      pace: ability,
      strength: ability,
      stamina: ability,
      agility: ability,
      heading: ability,
    },
    mental: {
      positioning: ability,
      vision: ability,
      anticipation: ability,
      composure: ability,
      determination: ability,
      leadership: ability,
    },
    goalkeeping: {
      reflexes: ability,
      handling: ability,
      rushingOut: ability,
      goalkeeperPositioning: ability,
      footwork: ability,
    },
  };
}

/** Builds the current dynamic state for one player. */
function playerStateFixture(): PlayerDynamicState {
  return {
    fitness: stateValue(100),
    form: stateValue(50),
    morale: stateValue(50),
  };
}

/** Builds one deterministic final-table row. */
function tableRow(position: number, id: Club["id"], points: number) {
  return {
    position,
    clubId: id,
    played: 1,
    wins: points === 3 ? 1 : 0,
    draws: 0,
    losses: points === 0 ? 1 : 0,
    goalsFor: points === 3 ? 1 : 0,
    goalsAgainst: points === 0 ? 1 : 0,
    goalDifference: points === 3 ? 1 : -1,
    points,
  };
}
