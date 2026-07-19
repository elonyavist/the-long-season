import assert from "node:assert/strict";
import { test } from "vitest";

import {
  CAREER_STATE_SCHEMA_VERSION,
  abilityValue,
  clubId,
  competitionId,
  createCareerState,
  createMarketState,
  fixtureId,
  gameDate,
  playerId,
  saveId,
  seasonId,
  stateValue,
  type CareerState,
  type Club,
  type ClubId,
  type Fixture,
  type GameState,
  type LeagueTableRules,
  type Player,
  type PlayerAbilities,
  type PlayerDynamicState,
  type PlayerId,
  type PlayerPosition,
} from "@game/domain";
import { addDays } from "@game/shared";

import { advanceCareerOneSeason } from "./advance-career-season.ts";

/**
 * Canonical season-advancement tests protect the single engine use-case that
 * future CLI and web adapters must call instead of reimplementing rollover.
 */

const TABLE_RULES: LeagueTableRules = {
  pointsForWin: 3,
  pointsForDraw: 1,
  pointsForLoss: 0,
};

test("advanceCareerOneSeason advances a completed durable season through the documented operation order", () => {
  const state = completedCareerStateFixture();

  const result = advanceCareerOneSeason({
    careerState: state,
    worldSeed: "canonical-advancement-world",
    mode: {
      kind: "completedSeason",
      tableRules: TABLE_RULES,
    },
  });

  assert.equal(result.status, "advanced");
  if (result.status === "advanced") {
    assert.deepEqual(result.facts.operationOrder, [
      "completed_season_validation",
      "season_archive",
      "monthly_lifecycle",
      "player_exits",
      "youth_lifecycle",
      "youth_intake",
      "youth_promotion",
      "squad_maintenance",
      "transfer_turnover",
      "post_transfer_squad_maintenance",
      "next_calendar_merge",
      "player_state_rollover",
      "season_inbox_delivery",
    ]);
    assert.equal(result.facts.selectedClubId, "club:selected");
    assert.equal(result.facts.previousSeasonId, "season:0001");
    assert.equal(result.facts.nextSeasonId, "season:0002");
    assert.equal(result.facts.playerDevelopment.changeCount, 0);
    assert.equal(result.facts.playerExits.exitCount, 0);
    assert.equal(result.facts.youthLifecycle.recordCount, 0);
    assert.equal(result.facts.youthLifecycle.promotionCandidateCount, 0);
    assert.equal(result.facts.youthLifecycle.externalMoveCandidateCount, 0);
    assert.equal(result.facts.youthLifecycle.releasedCount, 0);
    assert.equal(result.facts.youthIntake.acceptedPlayerCount, 0);
    assert.equal(result.facts.youthPromotions.promotedCount, 0);
    assert.equal(result.facts.squadMaintenance.warningCount > 0, true);
    assert.equal(result.facts.transferTurnover.transferCount, 0);
    assert.equal(result.facts.squadHealth.seniorPlayerCount, 8);
    assert.equal(result.facts.youthHealth.activePlayerCount, 8);
    assert.equal(result.facts.seasonArchive?.championClubId, "club:selected");
    assert.equal(result.careerState.gameState.calendar.currentSeasonId, "season:0002");
    assert.equal(result.careerState.gameState.calendar.currentDate, gameDate(addDays(gameDate(20_007), 70)));
    assert.equal(result.careerState.seasonHistory?.length, 1);
    assert.equal(result.careerState.matchPreparation, undefined);
    assert.deepEqual(result.careerState.currentSeasonInbox, [{
      id: "inbox:season-rollover:season:0002",
      date: gameDate(addDays(gameDate(20_007), 70)),
      category: "season_rollover",
      source: "competition_office",
      level: "important",
      lifecycle: { read: false, acknowledged: false, resolved: false },
      related: { clubId: "club:selected" },
      blockerKeys: [],
      actionIds: [],
    }]);
    assert.equal(result.careerState.gameState.fixtureIds.includes(fixtureId("fixture:000003")), true);
  }
});

test("advanceCareerOneSeason facts are enough for an adapter report without rerunning season rules", () => {
  const result = advanceCareerOneSeason({
    careerState: completedCareerStateFixture(),
    worldSeed: "adapter-facts-world",
    mode: {
      kind: "completedSeason",
      tableRules: TABLE_RULES,
    },
  });

  assert.equal(result.status, "advanced");
  if (result.status === "advanced") {
    const adapterReport = factsOnlyReport(result.facts);

    assert.deepEqual(adapterReport, {
      selectedClubId: "club:selected",
      season: {
        from: "season:0001",
        to: "season:0002",
        startDate: gameDate(addDays(gameDate(20_007), 70)),
      },
      archive: {
        championClubId: "club:selected",
        selectedClubPosition: 1,
        fixtureCount: 2,
        totalGoals: 3,
      },
      activity: {
        developmentRows: 0,
        playerExits: 0,
        youthLifecycleRows: 0,
        youthPromotionCandidates: 0,
        youthPromotions: 0,
        seniorAdds: 0,
        transfers: 0,
      },
      health: {
        seniorPlayers: 8,
        activePlayers: 8,
        clubsBelowMinimumSquadSize: 2,
        clubsWithoutNaturalGoalkeeper: 0,
      },
      warnings: [],
    });
  }
});

test("advanceCareerOneSeason is deterministic and does not mutate the input career state", () => {
  const state = completedCareerStateFixture();
  const snapshot = structuredClone(state);

  const first = advanceCareerOneSeason({
    careerState: state,
    worldSeed: "same-world",
    mode: {
      kind: "completedSeason",
      tableRules: TABLE_RULES,
    },
  });
  const second = advanceCareerOneSeason({
    careerState: state,
    worldSeed: "same-world",
    mode: {
      kind: "completedSeason",
      tableRules: TABLE_RULES,
    },
  });

  assert.deepEqual(first, second);
  assert.deepEqual(state, snapshot);
});

test("advanceCareerOneSeason returns an invalid result for an incomplete durable season", () => {
  const unplayedFixtureId = fixtureId("fixture:000002");
  const result = advanceCareerOneSeason({
    careerState: incompleteCareerStateFixture(unplayedFixtureId),
    worldSeed: "canonical-advancement-world",
    mode: {
      kind: "completedSeason",
      tableRules: TABLE_RULES,
    },
  });

  assert.deepEqual(result, {
    status: "invalid",
    careerState: incompleteCareerStateFixture(unplayedFixtureId),
    reason: "current_season_incomplete",
    fixtureId: unplayedFixtureId,
  });
});

test("advanceCareerOneSeason supports report refresh without completed-season archive work", () => {
  const state = incompleteCareerStateFixture(fixtureId("fixture:000002"));

  const result = advanceCareerOneSeason({
    careerState: state,
    worldSeed: "report-refresh-world",
    mode: {
      kind: "reportRefresh",
      nextSeasonId: seasonId("season:report-0002"),
      nextSeasonStartDate: gameDate(20_365),
    },
  });

  assert.equal(result.status, "advanced");
  if (result.status === "advanced") {
    assert.deepEqual(result.facts.operationOrder, [
      "monthly_lifecycle",
      "player_exits",
      "youth_lifecycle",
      "youth_intake",
      "youth_promotion",
      "squad_maintenance",
      "transfer_turnover",
      "post_transfer_squad_maintenance",
      "player_state_rollover",
    ]);
    assert.equal(result.facts.seasonArchive, undefined);
    assert.equal(result.careerState.seasonHistory, undefined);
    assert.equal(result.careerState.gameState.calendar.currentSeasonId, "season:report-0002");
    assert.equal(result.careerState.gameState.calendar.currentDate, gameDate(20_365));
  }
});

function completedCareerStateFixture(): CareerState {
  return careerStateFixture({
    currentSeasonId: seasonId("season:0001"),
    fixtures: [
      fixtureFixture(fixtureId("fixture:000001"), seasonId("season:0001"), clubId("club:selected"), clubId("club:other"), true, gameDate(20_000)),
      fixtureFixture(fixtureId("fixture:000002"), seasonId("season:0001"), clubId("club:other"), clubId("club:selected"), true, gameDate(20_007)),
    ],
  });
}

function factsOnlyReport(facts: Extract<ReturnType<typeof advanceCareerOneSeason>, { status: "advanced" }>["facts"]) {
  return {
    selectedClubId: facts.selectedClubId,
    season: {
      from: facts.previousSeasonId,
      to: facts.nextSeasonId,
      startDate: facts.nextSeasonStartDate,
    },
    archive: facts.seasonArchive === undefined
      ? undefined
      : {
          championClubId: facts.seasonArchive.championClubId,
          selectedClubPosition: facts.seasonArchive.selectedClubPosition,
          fixtureCount: facts.seasonArchive.aggregateGoals.fixtureCount,
          totalGoals: facts.seasonArchive.aggregateGoals.totalGoals,
        },
    activity: {
      developmentRows: facts.playerDevelopment.changeCount,
      playerExits: facts.playerExits.exitCount,
      youthLifecycleRows: facts.youthLifecycle.recordCount,
      youthPromotionCandidates: facts.youthLifecycle.promotionCandidateCount,
      youthPromotions: facts.youthPromotions.promotedCount,
      seniorAdds: facts.squadMaintenance.addedPlayerCount,
      transfers: facts.transferTurnover.transferCount,
    },
    health: {
      seniorPlayers: facts.squadHealth.seniorPlayerCount,
      activePlayers: facts.youthHealth.activePlayerCount,
      clubsBelowMinimumSquadSize: facts.squadHealth.clubsBelowMinimumSquadSize,
      clubsWithoutNaturalGoalkeeper: facts.squadHealth.clubsWithoutNaturalGoalkeeper,
    },
    warnings: facts.warnings,
  };
}

function incompleteCareerStateFixture(unplayedFixtureId: Fixture["id"]): CareerState {
  return careerStateFixture({
    currentSeasonId: seasonId("season:0001"),
    fixtures: [
      fixtureFixture(fixtureId("fixture:000001"), seasonId("season:0001"), clubId("club:selected"), clubId("club:other"), true, gameDate(20_000)),
      fixtureFixture(unplayedFixtureId, seasonId("season:0001"), clubId("club:other"), clubId("club:selected"), false, gameDate(20_007)),
    ],
  });
}

function careerStateFixture(input: {
  readonly currentSeasonId: GameState["calendar"]["currentSeasonId"];
  readonly fixtures: readonly Fixture[];
}): CareerState {
  const selectedClubId = clubId("club:selected");
  const otherClubId = clubId("club:other");
  const selectedPlayers = [
    playerFixture(playerId("player:selected-gk"), "gk", 24),
    playerFixture(playerId("player:selected-cb"), "cb", 25),
    playerFixture(playerId("player:selected-cm"), "cm", 23),
    playerFixture(playerId("player:selected-st"), "st", 22),
  ];
  const otherPlayers = [
    playerFixture(playerId("player:other-gk"), "gk", 24),
    playerFixture(playerId("player:other-cb"), "cb", 25),
    playerFixture(playerId("player:other-cm"), "cm", 23),
    playerFixture(playerId("player:other-st"), "st", 22),
  ];
  const players = [...selectedPlayers, ...otherPlayers];

  return createCareerState({
    saveId: saveId("save:canonical-advancement"),
    schemaVersion: CAREER_STATE_SCHEMA_VERSION,
    selectedClubId,
    gameState: gameStateFixture({
      currentSeasonId: input.currentSeasonId,
      clubs: [
        clubFixture(selectedClubId, selectedPlayers.map((player) => player.id)),
        clubFixture(otherClubId, otherPlayers.map((player) => player.id)),
      ],
      fixtures: input.fixtures,
      players,
    }),
    marketState: createMarketState({
      clubBudgets: {},
      clubBudgetIds: [],
    }),
    transferHistory: [],
  });
}

function gameStateFixture(input: {
  readonly currentSeasonId: GameState["calendar"]["currentSeasonId"];
  readonly clubs: readonly Club[];
  readonly fixtures: readonly Fixture[];
  readonly players: readonly Player[];
}): GameState {
  const clubsById: Partial<Record<ClubId, Club>> = {};
  const clubIds: ClubId[] = [];
  const fixturesById: Partial<Record<Fixture["id"], Fixture>> = {};
  const fixtureIds: Fixture["id"][] = [];
  const playersById: Partial<Record<PlayerId, Player>> = {};
  const playerIds: PlayerId[] = [];
  const playerStates: Partial<Record<PlayerId, PlayerDynamicState>> = {};

  for (const club of input.clubs) {
    clubsById[club.id] = club;
    clubIds.push(club.id);
  }

  for (const fixture of input.fixtures) {
    fixturesById[fixture.id] = fixture;
    fixtureIds.push(fixture.id);
  }

  for (const player of input.players) {
    playersById[player.id] = player;
    playerIds.push(player.id);
    playerStates[player.id] = playerStateFixture();
  }

  return {
    meta: {
      seed: "canonical-advancement-test",
      rngAlgorithmVersion: "test",
      saveSchemaVersion: 1,
    },
    calendar: {
      currentDate: gameDate(20_000),
      currentSeasonId: input.currentSeasonId,
    },
    players: playersById as GameState["players"],
    playerIds,
    playerStates: playerStates as GameState["playerStates"],
    clubs: clubsById as GameState["clubs"],
    clubIds,
    fixtures: fixturesById as GameState["fixtures"],
    fixtureIds,
  };
}

function clubFixture(id: ClubId, playerIds: readonly PlayerId[]): Club {
  return {
    id,
    name: String(id),
    shortName: String(id).slice("club:".length).toUpperCase(),
    category: "third_division",
    reputation: 5,
    playerIds,
  };
}

function fixtureFixture(
  id: Fixture["id"],
  fixtureSeasonId: Fixture["seasonId"],
  homeClubId: ClubId,
  awayClubId: ClubId,
  played: boolean,
  date: Fixture["date"],
): Fixture {
  return {
    id,
    competitionId: competitionId("competition:test"),
    seasonId: fixtureSeasonId,
    roundNumber: 1,
    date,
    homeClubId,
    awayClubId,
    ...(played
      ? {
          result: {
            played: true,
            homeGoals: homeClubId === clubId("club:selected") ? 2 : 0,
            awayGoals: awayClubId === clubId("club:selected") ? 1 : 0,
          },
        }
      : {}),
  };
}

function playerFixture(id: PlayerId, naturalPosition: PlayerPosition, age: number): Player {
  return {
    id,
    firstName: String(id),
    lastName: "Fixture",
    birthDate: gameDate(20_000 - age * 365),
    naturalPositions: [naturalPosition],
    abilities: abilitySet(9),
    potential: abilitySet(12),
  };
}

function playerStateFixture(): PlayerDynamicState {
  return {
    fitness: stateValue(100),
    form: stateValue(50),
    morale: stateValue(50),
  };
}

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
