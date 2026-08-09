import assert from "node:assert/strict";
import { test } from "vitest";

import {
  CAREER_STATE_SCHEMA_VERSION,
  accruePlayerFixtureParticipations,
  abilityValue,
  clubId,
  createCareerState,
  createEmptyPlayerParticipationLedger,
  fixtureId,
  gameDate,
  playerId,
  saveId,
  seasonId,
  stateValue,
  type CareerState,
  type GameState,
  type PlayerAbilities,
  type PlayerId,
} from "@game/domain";

import {
  buildLowDetailAcademyParticipation,
  isLowDetailAcademyFixtureId,
} from "./academy-participation.ts";

test("low-detail academy participation records three fixtures and replaces whole senior-match load", () => {
  const season = seasonId("season:academy-participation");
  const careerState = academyCareerState(season);
  const reducedPlayerId = careerState.youthAcademyState!.playerLifecycleIds[0]!;
  const seniorLoadedLedger = accruePlayerFixtureParticipations(
    careerState.playerParticipationLedger!,
    [1, 2].map((ordinal) => ({
      fixtureId: fixtureId(`fixture:senior-emergency-${ordinal}`),
      playerId: reducedPlayerId,
      clubId: careerState.selectedClubId,
      seasonId: season,
      monthKey: "2026-08",
      started: true,
      substituteAppearance: false,
      minutes: 90,
      playedRoleMinutes: { central_midfielder: 90 },
    })),
  );
  const stateWithSeniorLoad = createCareerState({
    ...careerState,
    playerParticipationLedger: seniorLoadedLedger,
  });

  const contributions = buildLowDetailAcademyParticipation({
    careerState: stateWithSeniorLoad,
    seasonId: season,
    beforeMonthKey: "2026-09",
  });

  assert.equal(contributions.length, 31);
  assert.equal(contributions.filter(({ playerId }) => playerId === reducedPlayerId).length, 1);
  assert.equal(contributions.every(({ minutes }) => minutes === 90), true);
  assert.equal(contributions.every(({ fixtureId }) => isLowDetailAcademyFixtureId(fixtureId)), true);
  assert.equal(new Set(contributions.map(({ fixtureId }) => fixtureId)).size, 3);
});

test("low-detail academy participation is reload-idempotent and leaves the current month open", () => {
  const season = seasonId("season:academy-reload");
  const careerState = academyCareerState(season);
  const first = buildLowDetailAcademyParticipation({
    careerState,
    seasonId: season,
    beforeMonthKey: "2026-09",
  });
  const accrued = createCareerState({
    ...careerState,
    playerParticipationLedger: accruePlayerFixtureParticipations(
      careerState.playerParticipationLedger!,
      first,
    ),
  });
  const repeated = buildLowDetailAcademyParticipation({
    careerState: accrued,
    seasonId: season,
    beforeMonthKey: "2026-09",
  });
  const currentMonth = buildLowDetailAcademyParticipation({
    careerState,
    seasonId: season,
    beforeMonthKey: "2026-08",
  });

  assert.equal(first.length, 33);
  assert.deepEqual(repeated, []);
  assert.deepEqual(currentMonth, []);
});

function academyCareerState(season: ReturnType<typeof seasonId>): CareerState {
  const academyClubId = clubId("club:academy-participation");
  const seniorPlayerId = playerId("player:academy-senior");
  const youthPlayerIds = Array.from(
    { length: 11 },
    (_, index) => playerId(`player:academy-${String(index + 1).padStart(2, "0")}`),
  );
  const allPlayerIds = [seniorPlayerId, ...youthPlayerIds];
  const players = Object.fromEntries(allPlayerIds.map((id) => [id, playerFixture(id)])) as GameState["players"];
  const playerStates = Object.fromEntries(allPlayerIds.map((id) => [id, {
    fitness: stateValue(100),
    form: stateValue(50),
    morale: stateValue(50),
  }])) as GameState["playerStates"];
  const gameState: GameState = {
    meta: {
      seed: "academy-participation-test",
      rngAlgorithmVersion: "test",
      saveSchemaVersion: 1,
    },
    calendar: {
      currentDate: gameDate(20_000),
      currentSeasonId: season,
    },
    players,
    playerIds: allPlayerIds,
    playerStates,
    clubs: {
      [academyClubId]: {
        id: academyClubId,
        name: "Academy Club",
        shortName: "ACA",
        category: "third_division",
        reputation: 5,
        playerIds: [seniorPlayerId],
      },
    },
    clubIds: [academyClubId],
    fixtures: {},
    fixtureIds: [],
  };
  const initialLedger = accruePlayerFixtureParticipations(
    createEmptyPlayerParticipationLedger(),
    [{
      fixtureId: fixtureId("fixture:senior-august"),
      playerId: seniorPlayerId,
      clubId: academyClubId,
      seasonId: season,
      monthKey: "2026-08",
      started: true,
      substituteAppearance: false,
      minutes: 90,
      playedRoleMinutes: { central_midfielder: 90 },
    }],
  );

  return createCareerState({
    saveId: saveId("save:academy-participation"),
    schemaVersion: CAREER_STATE_SCHEMA_VERSION,
    selectedClubId: academyClubId,
    gameState,
    transferHistory: [],
    playerParticipationLedger: initialLedger,
    youthAcademyState: {
      clubRosters: {
        [academyClubId]: {
          clubId: academyClubId,
          playerIds: youthPlayerIds,
        },
      },
      clubRosterIds: [academyClubId],
      playerLifecycle: Object.fromEntries(youthPlayerIds.map((id) => [id, {
        playerId: id,
        clubId: academyClubId,
        status: "academy" as const,
        academyEntrySeasonId: season,
        academyEntryDate: gameDate(20_000),
      }])) as NonNullable<CareerState["youthAcademyState"]>["playerLifecycle"],
      playerLifecycleIds: youthPlayerIds,
    },
  });
}

function playerFixture(id: PlayerId) {
  return {
    id,
    firstName: "Academy",
    lastName: String(id),
    birthDate: gameDate(14_000),
    naturalPositions: ["cm" as const],
    primaryRole: "central_midfielder" as const,
    abilities: abilitySet(7),
    potential: abilitySet(11),
  };
}

function abilitySet(value: number): PlayerAbilities {
  const ability = abilityValue(value);
  return {
    technical: { finishing: ability, passing: ability, longPassing: ability, crossing: ability, dribbling: ability, technique: ability, tackling: ability, penalties: ability, freeKicks: ability },
    physical: { pace: ability, strength: ability, stamina: ability, agility: ability, heading: ability },
    mental: { positioning: ability, vision: ability, anticipation: ability, composure: ability, determination: ability, leadership: ability },
    goalkeeping: { reflexes: ability, handling: ability, rushingOut: ability, goalkeeperPositioning: ability, footwork: ability },
  };
}
