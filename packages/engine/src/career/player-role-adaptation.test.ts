import assert from "node:assert/strict";
import { test } from "vitest";

import {
  CAREER_STATE_SCHEMA_VERSION,
  accruePlayerFixtureParticipation,
  abilityValue,
  clubId,
  createCareerState,
  createEmptyPlayerParticipationLedger,
  createMarketState,
  fixtureId,
  gameDate,
  playerId,
  saveId,
  seasonId,
  stateValue,
  type CanonicalPlayerRole,
  type CareerState,
  type Club,
  type ClubId,
  type GameState,
  type Player,
  type PlayerAbilities,
  type PlayerDynamicState,
  type PlayerId,
  type PlayerParticipationLedger,
  type PlayerRole,
} from "@game/domain";

import { adaptPlayerRolesFromParticipation } from "./player-role-adaptation.ts";

test("adaptPlayerRolesFromParticipation promotes sustained center-back full-back exposure to adapted", () => {
  const player = playerId("player:center-back");
  const careerState = careerStateFixture(
    playerFixture(player, "center_back", ["center_back"], [], ["full_back"]),
    participationLedgerFixture(player, "right_full_back", ["2026-08", "2026-09", "2026-10"], 2),
  );

  const result = adaptPlayerRolesFromParticipation({
    careerState,
    seasonId: seasonId("season:0001"),
  });
  const adapted = requiredPlayer(result.careerState, player);

  assert.equal(result.changes[0]?.targetRole, "full_back");
  assert.equal(result.changes[0]?.nextFamiliarity, "adapted");
  assert.deepEqual(adapted.adaptedRoles, ["full_back"]);
  assert.deepEqual(adapted.weakRoles, []);
  assert.equal(adapted.primaryRole, "center_back");
  assert.equal(adapted.archetype, "center_back_stopper");
});

test("adaptPlayerRolesFromParticipation requires sustained multi-month exposure", () => {
  const player = playerId("player:tiny-sample");
  const careerState = careerStateFixture(
    playerFixture(player, "center_back", ["center_back"], [], ["full_back"]),
    participationLedgerFixture(player, "right_full_back", ["2026-08"], 2),
  );

  const result = adaptPlayerRolesFromParticipation({
    careerState,
    seasonId: seasonId("season:0001"),
  });

  assert.equal(result.changes.length, 0);
  assert.equal(requiredPlayer(result.careerState, player).roleFamiliarity?.full_back, "weak");
});

test("adaptPlayerRolesFromParticipation ignores unrelated roles even with many minutes", () => {
  const player = playerId("player:unrelated");
  const careerState = careerStateFixture(
    playerFixture(player, "center_back", ["center_back"], [], ["winger"]),
    participationLedgerFixture(player, "right_winger", ["2026-08", "2026-09", "2026-10", "2026-11", "2026-12"], 3),
  );

  const result = adaptPlayerRolesFromParticipation({
    careerState,
    seasonId: seasonId("season:0001"),
  });

  assert.equal(result.changes.length, 0);
  assert.equal(requiredPlayer(result.careerState, player).roleFamiliarity?.winger, "weak");
});

test("adaptPlayerRolesFromParticipation can promote adapted related roles to natural when the graph allows it", () => {
  const player = playerId("player:winger");
  const careerState = careerStateFixture(
    playerFixture(player, "winger", ["winger"], ["wide_midfielder"], []),
    participationLedgerFixture(player, "right_midfielder", ["2026-08", "2026-09", "2026-10", "2026-11", "2026-12"], 3),
  );

  const result = adaptPlayerRolesFromParticipation({
    careerState,
    seasonId: seasonId("season:0001"),
  });
  const adapted = requiredPlayer(result.careerState, player);

  assert.equal(result.changes[0]?.targetRole, "wide_midfielder");
  assert.equal(result.changes[0]?.nextFamiliarity, "natural");
  assert.deepEqual(adapted.naturalRoles, ["winger", "wide_midfielder"]);
  assert.deepEqual(adapted.adaptedRoles, []);
});

test("adaptPlayerRolesFromParticipation ignores rows from already closed months", () => {
  const player = playerId("player:closed-month");
  const ledger = {
    ...participationLedgerFixture(player, "right_full_back", ["2026-08", "2026-09", "2026-10"], 2),
    closedMonthKeys: ["season:0001|2026-08", "season:0001|2026-09", "season:0001|2026-10"],
  };
  const careerState = careerStateFixture(
    playerFixture(player, "center_back", ["center_back"], [], ["full_back"]),
    ledger,
  );

  const result = adaptPlayerRolesFromParticipation({
    careerState,
    seasonId: seasonId("season:0001"),
  });

  assert.equal(result.changes.length, 0);
});

function careerStateFixture(player: Player, playerParticipationLedger: PlayerParticipationLedger): CareerState {
  const selectedClubId = clubId("club:selected");

  return createCareerState({
    saveId: saveId("save:role-adaptation"),
    schemaVersion: CAREER_STATE_SCHEMA_VERSION,
    selectedClubId,
    gameState: gameStateFixture(selectedClubId, [player]),
    marketState: createMarketState({
      clubBudgets: {},
      clubBudgetIds: [],
    }),
    transferHistory: [],
    playerParticipationLedger,
  });
}

function participationLedgerFixture(
  id: PlayerId,
  playedRole: CanonicalPlayerRole,
  monthKeys: readonly string[],
  fixturesPerMonth: number,
): PlayerParticipationLedger {
  let ledger = createEmptyPlayerParticipationLedger();

  monthKeys.forEach((monthKey, monthIndex) => {
    for (let fixtureNumber = 1; fixtureNumber <= fixturesPerMonth; fixtureNumber += 1) {
      ledger = accruePlayerFixtureParticipation(ledger, {
        fixtureId: fixtureId(`fixture:${monthIndex + 1}-${fixtureNumber}`),
        playerId: id,
        seasonId: seasonId("season:0001"),
        monthKey,
        started: true,
        substituteAppearance: false,
        minutes: 90,
        rating: 6.8,
        playedRoleMinutes: { [playedRole]: 90 },
      });
    }
  });

  return ledger;
}

function gameStateFixture(selectedClubId: ClubId, players: readonly Player[]): GameState {
  const playersById: Partial<Record<PlayerId, Player>> = {};
  const playerIds: PlayerId[] = [];
  const playerStates: Partial<Record<PlayerId, PlayerDynamicState>> = {};

  for (const player of players) {
    playersById[player.id] = player;
    playerIds.push(player.id);
    playerStates[player.id] = { fitness: stateValue(100), form: stateValue(50), morale: stateValue(50) };
  }

  return {
    meta: { seed: "role-adaptation-test", rngAlgorithmVersion: "test", saveSchemaVersion: 1 },
    calendar: { currentDate: gameDate(20_000), currentSeasonId: seasonId("season:0001") },
    players: playersById as GameState["players"],
    playerIds,
    playerStates: playerStates as GameState["playerStates"],
    clubs: { [selectedClubId]: clubFixture(selectedClubId, playerIds) },
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
  primaryRole: PlayerRole,
  naturalRoles: readonly PlayerRole[],
  adaptedRoles: readonly PlayerRole[],
  weakRoles: readonly PlayerRole[],
): Player {
  return {
    id,
    firstName: String(id),
    lastName: "Adaptation",
    birthDate: gameDate(12_000),
    naturalPositions: ["cb"],
    primaryRole,
    archetype: archetypeForRole(primaryRole),
    naturalRoles,
    adaptedRoles,
    weakRoles,
    roleFamiliarity: Object.fromEntries([
      ...naturalRoles.map((role) => [role, "natural"] as const),
      ...adaptedRoles.map((role) => [role, "adapted"] as const),
      ...weakRoles.map((role) => [role, "weak"] as const),
    ]),
    abilities: abilitySet(10),
    potential: abilitySet(12),
  };
}

function archetypeForRole(role: PlayerRole): NonNullable<Player["archetype"]> {
  switch (role) {
    case "full_back":
      return "full_back_defensive";
    case "winger":
      return "winger_creator";
    case "center_back":
    default:
      return "center_back_stopper";
  }
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

function requiredPlayer(careerState: CareerState, id: PlayerId): Player {
  const player = careerState.gameState.players[id];
  if (player === undefined) {
    throw new Error(`Missing player fixture: ${id}`);
  }

  return player;
}
