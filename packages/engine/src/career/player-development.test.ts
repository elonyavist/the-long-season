import assert from "node:assert/strict";
import { test } from "vitest";

import {
  CAREER_STATE_SCHEMA_VERSION,
  PLAYER_ABILITY_KEYS,
  accruePlayerFixtureParticipation,
  abilityValue,
  clubId,
  createCareerState,
  createEmptyPlayerParticipationLedger,
  createMarketState,
  fixtureId,
  gameDate,
  hardCapForRoleAbility,
  playerId,
  readPlayerAbility,
  saveId,
  seasonId,
  stateValue,
  type CareerState,
  type Club,
  type ClubId,
  type FixtureId,
  type GameState,
  type Player,
  type PlayerAbilities,
  type PlayerDynamicState,
  type PlayerId,
  type PlayerPosition,
  type SeasonId,
} from "@game/domain";

import {
  developPlayersForSeason,
  summarizePlayerDevelopmentAbilities,
} from "./player-development.ts";

/**
 * Player-development tests protect the Phase 28 growth model before decline
 * and long-run reporting are layered on top.
 */

test("developPlayersForSeason grows an ordinary young player deterministically", () => {
  const young = playerId("player:young");
  const careerState = careerStateFixture([
    playerFixture(young, "st", 19, abilitySet(8), abilitySet(11)),
  ]);

  const result = developPlayersForSeason({
    careerState,
    worldSeed: "development-world",
    seasonId: seasonId("season:0001"),
  });
  const developed = requiredPlayer(result.careerState, young);

  assert.equal(result.changes[0]?.playerId, young);
  assert.equal(result.changes[0]?.age, 19);
  assert.equal(result.changes[0]?.improvedAbilityCount > 0, true);
  assert.equal(developed.abilities.technical.finishing > 8, true);
  assert.equal(developed.abilities.technical.finishing <= 11, true);
});

test("developPlayersForSeason reports current and potential through the same role profile", () => {
  const young = playerId("player:role-summary");
  const careerState = careerStateFixture([
    playerFixture(young, "cm", 19, abilitySet(8), abilitySet(11)),
  ]);

  const result = developPlayersForSeason({
    careerState,
    worldSeed: "role-summary-world",
    seasonId: seasonId("season:0001"),
  });
  const change = result.changes[0];

  assert.equal(change?.roleCurrentAbilityBefore, 8);
  assert.equal((change?.roleCurrentAbilityAfter ?? 0) > 8, true);
  assert.equal(Math.abs(Number(change?.rolePotentialAbility) - 11) < 1e-9, true);
  assert.equal(summarizePlayerDevelopmentAbilities(requiredPlayer(result.careerState, young), "central_midfielder").measure, "role");
});

test("developPlayersForSeason stalls cleanly when every attribute has no potential room", () => {
  const player = playerId("player:no-room");
  const careerState = careerStateFixture([
    playerFixture(player, "cm", 18, abilitySet(8), abilitySet(8)),
  ]);

  const result = developPlayersForSeason({
    careerState,
    worldSeed: "no-room-world",
    seasonId: seasonId("season:0001"),
  });

  assert.equal(result.changes[0]?.totalGrowth, 0);
  assert.equal(result.changes[0]?.improvedAbilityCount, 0);
  assert.deepEqual(requiredPlayer(result.careerState, player).abilities, requiredPlayer(careerState, player).abilities);
});

test("developPlayersForSeason gives bigger growth to the same young player with more potential room", () => {
  const player = playerId("player:room-test");
  const ordinary = developPlayersForSeason({
    careerState: careerStateFixture([playerFixture(player, "cm", 18, abilitySet(8), abilitySet(11))]),
    worldSeed: "same-realization-world",
    seasonId: seasonId("season:0001"),
  });
  const seriousProspect = developPlayersForSeason({
    careerState: careerStateFixture([playerFixture(player, "cm", 18, abilitySet(8), abilitySet(16))]),
    worldSeed: "same-realization-world",
    seasonId: seasonId("season:0001"),
  });

  assert.equal((seriousProspect.changes[0]?.totalGrowth ?? 0) > (ordinary.changes[0]?.totalGrowth ?? 0), true);
});

test("developPlayersForSeason gives a rare prodigy upside without exceeding potential", () => {
  const prodigy = playerId("player:rare-prodigy");
  const careerState = careerStateFixture([
    playerFixture(prodigy, "st", 17, abilitySet(6), abilitySet(18)),
  ]);

  const result = developPlayersForSeason({
    careerState,
    worldSeed: "rare-prodigy-world",
    seasonId: seasonId("season:0001"),
  });
  const developed = requiredPlayer(result.careerState, prodigy);

  assert.equal((result.changes[0]?.improvedAbilityCount ?? 0) > 0, true);
  assert.equal(developed.abilities.technical.finishing <= 18, true);
  assert.equal(developed.abilities.physical.pace <= 18, true);
});

test("developPlayersForSeason does not grow a peak-age senior attacker in the growth-only step", () => {
  const senior = playerId("player:senior");
  const careerState = careerStateFixture([
    playerFixture(senior, "st", 28, abilitySet(12), abilitySet(16)),
  ]);

  const result = developPlayersForSeason({
    careerState,
    worldSeed: "senior-world",
    seasonId: seasonId("season:0001"),
  });

  assert.equal(result.changes[0]?.totalGrowth, 0);
  assert.deepEqual(requiredPlayer(result.careerState, senior).abilities, requiredPlayer(careerState, senior).abilities);
});

test("developPlayersForSeason produces identical output for the same seed and season", () => {
  const player = playerId("player:deterministic");
  const careerState = careerStateFixture([
    playerFixture(player, "rw", 20, abilitySet(8), abilitySet(14)),
  ]);

  const first = developPlayersForSeason({
    careerState,
    worldSeed: "deterministic-world",
    seasonId: seasonId("season:0001"),
  });
  const second = developPlayersForSeason({
    careerState,
    worldSeed: "deterministic-world",
    seasonId: seasonId("season:0001"),
  });

  assert.deepEqual(second, first);
});

test("developPlayersForSeason keeps growth role-relevant for an attacker", () => {
  const attacker = playerId("player:role-relevant");
  const careerState = careerStateFixture([
    playerFixture(attacker, "st", 19, abilitySet(8), abilitySet(14)),
  ]);

  const result = developPlayersForSeason({
    careerState,
    worldSeed: "role-world",
    seasonId: seasonId("season:0001"),
  });
  const before = requiredPlayer(careerState, attacker);
  const after = requiredPlayer(result.careerState, attacker);
  const finishingGrowth = after.abilities.technical.finishing - before.abilities.technical.finishing;
  const tacklingGrowth = after.abilities.technical.tackling - before.abilities.technical.tackling;

  assert.equal(finishingGrowth > tacklingGrowth, true);
});

test("developPlayersForSeason does not grow a center back past the finishing hard cap", () => {
  const defender = playerId("player:defender-finishing-cap");
  let careerState = careerStateFixture([
    playerFixture(defender, "cb", 18, abilitySet(10), abilitySet(20)),
  ]);

  for (let seasonNumber = 1; seasonNumber <= 6; seasonNumber += 1) {
    const currentSeasonId = seasonId(`season:${String(seasonNumber).padStart(4, "0")}`);
    careerState = careerStateWithMonthlyParticipation(careerState, currentSeasonId);
    careerState = developPlayersForSeason({
      careerState,
      worldSeed: "defender-cap-world",
      seasonId: currentSeasonId,
    }).careerState;
    careerState = careerStateWithCurrentDate(careerState, gameDate(20_000 + seasonNumber * 365));
  }

  const developed = requiredPlayer(careerState, defender);
  assert.equal(Number(developed.abilities.technical.finishing), 10);
  assert.equal(Number(developed.abilities.technical.tackling) > 10, true);
});

test("developPlayersForSeason does not grow a striker past the tackling hard cap", () => {
  const striker = playerId("player:striker-tackling-cap");
  let careerState = careerStateFixture([
    playerFixture(striker, "st", 18, abilitySet(10), abilitySet(20)),
  ]);

  for (let seasonNumber = 1; seasonNumber <= 6; seasonNumber += 1) {
    const currentSeasonId = seasonId(`season:${String(seasonNumber).padStart(4, "0")}`);
    careerState = careerStateWithMonthlyParticipation(careerState, currentSeasonId);
    careerState = developPlayersForSeason({
      careerState,
      worldSeed: "striker-cap-world",
      seasonId: currentSeasonId,
    }).careerState;
    careerState = careerStateWithCurrentDate(careerState, gameDate(20_000 + seasonNumber * 365));
  }

  const developed = requiredPlayer(careerState, striker);
  assert.equal(Number(developed.abilities.technical.tackling), 10);
  assert.equal(Number(developed.abilities.technical.finishing) > 10, true);
});

test("developPlayersForSeason keeps every seven-season center-back ability inside potential, scale, and role caps", () => {
  const defender = playerId("player:all-center-back-caps");
  let careerState = careerStateFixture([
    playerFixture(defender, "cb", 17, abilitySet(4), abilitySet(20)),
  ]);

  for (let seasonNumber = 1; seasonNumber <= 7; seasonNumber += 1) {
    const currentSeasonId = seasonId(`season:${String(seasonNumber).padStart(4, "0")}`);
    careerState = careerStateWithMonthlyParticipation(careerState, currentSeasonId);
    careerState = developPlayersForSeason({
      careerState,
      worldSeed: "all-center-back-caps-world",
      seasonId: currentSeasonId,
    }).careerState;
    careerState = careerStateWithCurrentDate(careerState, gameDate(20_000 + seasonNumber * 365));
  }

  const developed = requiredPlayer(careerState, defender);
  for (const key of PLAYER_ABILITY_KEYS) {
    const value = Number(readPlayerAbility(developed.abilities, key));
    const potential = Number(readPlayerAbility(developed.potential, key));
    const cap = hardCapForRoleAbility("center_back", key) ?? 20;
    assert.equal(value >= 1 && value <= Math.min(potential, cap), true, `${key}=${value}`);
  }
});

test("developPlayersForSeason keeps goalkeepers goalkeeper-shaped", () => {
  const goalkeeper = playerId("player:keeper-shape");
  const careerState = careerStateFixture([
    playerFixture(goalkeeper, "gk", 19, abilitySet(5), abilitySet(18)),
  ]);

  const result = developPlayersForSeason({
    careerState,
    worldSeed: "goalkeeper-shape-world",
    seasonId: seasonId("season:0001"),
  });
  const developed = requiredPlayer(result.careerState, goalkeeper);

  assert.equal(Number(developed.abilities.goalkeeping.reflexes) > 5, true);
  assert.equal(Number(developed.abilities.technical.finishing), 5);
  assert.equal(Number(developed.abilities.technical.tackling), 5);
});

test("developPlayersForSeason preserves explicit primary role while developing", () => {
  const player = playerId("player:stable-primary-role");
  const careerState = careerStateFixture([
    {
      ...playerFixture(player, "cm", 18, abilitySet(8), abilitySet(16)),
      primaryRole: "defensive_midfielder",
    },
  ]);

  const result = developPlayersForSeason({
    careerState,
    worldSeed: "stable-primary-role-world",
    seasonId: seasonId("season:0001"),
  });

  assert.equal(requiredPlayer(result.careerState, player).primaryRole, "defensive_midfielder");
});

test("developPlayersForSeason declines old outfield physical ability before technical ability", () => {
  const defender = playerId("player:old-defender");
  const careerState = careerStateFixture([
    playerFixture(defender, "cb", 34, abilitySet(12), abilitySet(12)),
  ]);

  const result = developPlayersForSeason({
    careerState,
    worldSeed: "decline-defender-world",
    seasonId: seasonId("season:0001"),
  });
  const before = requiredPlayer(careerState, defender);
  const after = requiredPlayer(result.careerState, defender);
  const paceDecline = before.abilities.physical.pace - after.abilities.physical.pace;
  const passingDecline = before.abilities.technical.passing - after.abilities.technical.passing;

  assert.equal((result.changes[0]?.totalDecline ?? 0) > 0, true);
  assert.equal(paceDecline > passingDecline, true);
});

test("developPlayersForSeason uses later decline windows for goalkeepers", () => {
  const earlyKeeper = playerId("player:early-keeper");
  const decliningKeeper = playerId("player:declining-keeper");

  const early = developPlayersForSeason({
    careerState: careerStateFixture([playerFixture(earlyKeeper, "gk", 32, abilitySet(12), abilitySet(12))]),
    worldSeed: "keeper-decline-world",
    seasonId: seasonId("season:0001"),
  });
  const declining = developPlayersForSeason({
    careerState: careerStateFixture([playerFixture(decliningKeeper, "gk", 35, abilitySet(12), abilitySet(12))]),
    worldSeed: "keeper-decline-world",
    seasonId: seasonId("season:0001"),
  });

  assert.equal(early.changes[0]?.totalDecline, 0);
  assert.equal((declining.changes[0]?.totalDecline ?? 0) > 0, true);
  assert.equal(requiredPlayer(declining.careerState, decliningKeeper).abilities.goalkeeping.footwork < 12, true);
});

test("developPlayersForSeason declines late-career attackers", () => {
  const attacker = playerId("player:old-attacker");
  const careerState = careerStateFixture([
    playerFixture(attacker, "st", 33, abilitySet(13), abilitySet(13)),
  ]);

  const result = developPlayersForSeason({
    careerState,
    worldSeed: "decline-attacker-world",
    seasonId: seasonId("season:0001"),
  });
  const after = requiredPlayer(result.careerState, attacker);

  assert.equal((result.changes[0]?.declinedAbilityCount ?? 0) > 0, true);
  assert.equal(after.abilities.physical.pace < 13, true);
});

test("developPlayersForSeason never declines an ability below the generated scale floor", () => {
  const veteran = playerId("player:decline-floor");
  const careerState = careerStateFixture([
    playerFixture(veteran, "st", 38, abilitySet(1), abilitySet(7)),
  ]);

  const result = developPlayersForSeason({
    careerState,
    worldSeed: "decline-floor-world",
    seasonId: seasonId("season:0001"),
  });
  const developed = requiredPlayer(result.careerState, veteran);

  assert.equal(result.changes[0]?.totalDecline, 0);
  assert.equal(developed.abilities.physical.pace, 7);
  assert.equal(developed.abilities.physical.stamina, 7);
  assert.equal(developed.abilities.physical.agility, 7);
  assert.equal(developed.abilities.physical.strength, 7);
  assert.equal(developed.abilities.physical.heading, 7);
  assert.equal(developed.abilities.technical.finishing, 1);
  assert.equal(developed.abilities.mental.composure, 1);
});

test("developPlayersForSeason does not decline young players", () => {
  const young = playerId("player:no-decline-young");
  const careerState = careerStateFixture([
    playerFixture(young, "cb", 20, abilitySet(10), abilitySet(10)),
  ]);

  const result = developPlayersForSeason({
    careerState,
    worldSeed: "no-decline-world",
    seasonId: seasonId("season:0001"),
  });

  assert.equal(result.changes[0]?.totalDecline, 0);
  assert.deepEqual(requiredPlayer(result.careerState, young).abilities, requiredPlayer(careerState, young).abilities);
});

test("developPlayersForSeason creates varied deterministic paths for similar prospects", () => {
  const first = playerId("player:similar-01");
  const second = playerId("player:similar-02");
  const third = playerId("player:similar-03");
  const careerState = careerStateFixture([
    playerFixture(first, "cm", 18, abilitySet(8), abilitySet(15)),
    playerFixture(second, "cm", 18, abilitySet(8), abilitySet(15)),
    playerFixture(third, "cm", 18, abilitySet(8), abilitySet(15)),
  ]);

  const result = developPlayersForSeason({
    careerState,
    worldSeed: "varied-prospects-world",
    seasonId: seasonId("season:0001"),
  });
  const growthValues = result.changes.map((change) => change.totalGrowth);

  assert.equal(new Set(growthValues).size > 1, true);
});

test("developPlayersForSeason never lets long-run growth exceed true potential", () => {
  const prospect = playerId("player:bounded-prospect");
  let careerState = careerStateFixture([
    playerFixture(prospect, "st", 17, abilitySet(8), abilitySet(11)),
  ]);

  for (let seasonNumber = 1; seasonNumber <= 7; seasonNumber += 1) {
    const currentSeasonId = seasonId(`season:${String(seasonNumber).padStart(4, "0")}`);
    careerState = careerStateWithMonthlyParticipation(careerState, currentSeasonId);
    careerState = developPlayersForSeason({
      careerState,
      worldSeed: "bounded-world",
      seasonId: currentSeasonId,
    }).careerState;
    careerState = careerStateWithCurrentDate(careerState, gameDate(20_000 + seasonNumber * 365));
  }

  const player = requiredPlayer(careerState, prospect);
  assert.equal(player.abilities.technical.finishing <= 11, true);
  assert.equal(player.abilities.physical.pace <= 11, true);
});

test("developPlayersForSeason does not turn every high-upside youth into a star", () => {
  let careerState = careerStateFixture([
    playerFixture(playerId("player:sample-01"), "st", 17, abilitySet(6), abilitySet(18)),
    playerFixture(playerId("player:sample-02"), "st", 17, abilitySet(6), abilitySet(18)),
    playerFixture(playerId("player:sample-03"), "st", 17, abilitySet(6), abilitySet(18)),
    playerFixture(playerId("player:sample-04"), "st", 17, abilitySet(6), abilitySet(18)),
    playerFixture(playerId("player:sample-05"), "st", 17, abilitySet(6), abilitySet(18)),
    playerFixture(playerId("player:sample-06"), "st", 17, abilitySet(6), abilitySet(18)),
    playerFixture(playerId("player:sample-07"), "st", 17, abilitySet(6), abilitySet(18)),
    playerFixture(playerId("player:sample-08"), "st", 17, abilitySet(6), abilitySet(18)),
  ]);

  for (let seasonNumber = 1; seasonNumber <= 7; seasonNumber += 1) {
    const currentSeasonId = seasonId(`season:${String(seasonNumber).padStart(4, "0")}`);
    careerState = careerStateWithMonthlyParticipation(careerState, currentSeasonId);
    careerState = developPlayersForSeason({
      careerState,
      worldSeed: "not-all-stars-world",
      seasonId: currentSeasonId,
    }).careerState;
    careerState = careerStateWithCurrentDate(careerState, gameDate(20_000 + seasonNumber * 365));
  }

  let firstDivisionReadyCount = 0;
  for (const playerIdValue of careerState.gameState.playerIds) {
    if (requiredPlayer(careerState, playerIdValue).abilities.technical.finishing >= 15) {
      firstDivisionReadyCount += 1;
    }
  }

  assert.equal(firstDivisionReadyCount < careerState.gameState.playerIds.length, true);
});

function careerStateFixture(players: readonly Player[]): CareerState {
  const selectedClubId = clubId("club:selected");

  const careerState = createCareerState({
    saveId: saveId("save:player-development"),
    schemaVersion: CAREER_STATE_SCHEMA_VERSION,
    selectedClubId,
    gameState: gameStateFixture(selectedClubId, players),
    marketState: createMarketState({
      clubBudgets: {},
      clubBudgetIds: [],
    }),
    transferHistory: [],
  });
  return careerStateWithMonthlyParticipation(careerState, careerState.gameState.calendar.currentSeasonId);
}

function careerStateWithCurrentDate(careerState: CareerState, currentDate: GameState["calendar"]["currentDate"]): CareerState {
  return createCareerState({
    ...careerState,
    gameState: {
      ...careerState.gameState,
      calendar: {
        ...careerState.gameState.calendar,
        currentDate,
      },
    },
  });
}

function careerStateWithMonthlyParticipation(careerState: CareerState, targetSeasonId: SeasonId): CareerState {
  if (careerState.playerParticipationLedger?.rowKeys.some((rowKey) => rowKey.startsWith(`${targetSeasonId}|`)) === true) {
    return careerState;
  }

  let playerParticipationLedger = careerState.playerParticipationLedger ?? createEmptyPlayerParticipationLedger();
  careerState.gameState.playerIds.forEach((id, playerIndex) => {
    const player = requiredPlayer(careerState, id);
    const role = roleForPosition(player.naturalPositions[0]);
    for (let fixtureNumber = 1; fixtureNumber <= 5; fixtureNumber += 1) {
      const minutes = 90;
      playerParticipationLedger = accruePlayerFixtureParticipation(playerParticipationLedger, {
        fixtureId: fixtureIdForParticipation(targetSeasonId, id, fixtureNumber),
        playerId: id,
        seasonId: targetSeasonId,
        monthKey: "2026-08",
        started: fixtureNumber <= 4,
        substituteAppearance: fixtureNumber === 5,
        minutes,
        rating: 6.8 + ((playerIndex + fixtureNumber) % 3) * 0.2,
        playedRoleMinutes: { [role]: minutes },
      });
    }
  });

  return createCareerState({
    ...careerState,
    playerParticipationLedger,
  });
}

function fixtureIdForParticipation(targetSeasonId: SeasonId, id: PlayerId, fixtureNumber: number): FixtureId {
  return fixtureId(`fixture:${String(targetSeasonId).replace("season:", "")}-${String(id).replace("player:", "")}-${fixtureNumber}`);
}

function roleForPosition(position: PlayerPosition | undefined) {
  switch (position) {
    case "gk":
      return "goalkeeper";
    case "cb":
      return "center_back";
    case "rb":
    case "lb":
      return "full_back";
    case "rwb":
    case "lwb":
      return "wing_back";
    case "dm":
      return "defensive_midfielder";
    case "am":
      return "attacking_midfielder";
    case "rw":
      return "right_winger";
    case "lw":
      return "left_winger";
    case "st":
      return "striker";
    case "cm":
    default:
      return "central_midfielder";
  }
}

function gameStateFixture(selectedClubId: ClubId, players: readonly Player[]): GameState {
  const playersById: Partial<Record<PlayerId, Player>> = {};
  const playerIds: PlayerId[] = [];
  const playerStates: Partial<Record<PlayerId, PlayerDynamicState>> = {};

  for (const player of players) {
    playersById[player.id] = player;
    playerIds.push(player.id);
    playerStates[player.id] = playerStateFixture();
  }

  return {
    meta: {
      seed: "player-development-test",
      rngAlgorithmVersion: "test",
      saveSchemaVersion: 1,
    },
    calendar: {
      currentDate: gameDate(20_000),
      currentSeasonId: seasonId("season:0001"),
    },
    players: playersById as GameState["players"],
    playerIds,
    playerStates: playerStates as GameState["playerStates"],
    clubs: {
      [selectedClubId]: clubFixture(selectedClubId, playerIds),
    },
    clubIds: [selectedClubId],
    fixtures: {},
    fixtureIds: [],
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

function playerFixture(
  id: PlayerId,
  primaryPosition: PlayerPosition,
  ageYears: number,
  abilities: PlayerAbilities,
  potential: PlayerAbilities,
): Player {
  return {
    id,
    firstName: String(id),
    lastName: "Development",
    birthDate: gameDate(20_000 - ageYears * 365),
    naturalPositions: [primaryPosition],
    abilities,
    potential,
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

function requiredPlayer(careerState: CareerState, id: PlayerId): Player {
  const player = careerState.gameState.players[id];
  if (player === undefined) {
    throw new Error(`Missing player fixture: ${id}`);
  }

  return player;
}
