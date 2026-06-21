import { test } from "vitest";
import assert from "node:assert/strict";

import type { Club } from "../entities/club.entity.ts";
import type { Fixture } from "../entities/fixture.entity.ts";
import type { Player, PlayerAbilities, PlayerDynamicState } from "../entities/player.entity.ts";
import { createMarketState, type MarketState } from "../entities/transfer.entity.ts";
import { clubId, competitionId, fixtureId, playerId, saveId, seasonId } from "../types/ids.ts";
import { gameDate } from "../value-objects/game-date.ts";
import { nonNegativeMoney } from "../value-objects/money.ts";
import { abilityValue, stateValue } from "../value-objects/rating.ts";
import type { GameState } from "./game-state.ts";
import {
  CAREER_STATE_SCHEMA_VERSION,
  CareerStateContractError,
  createCareerState,
  nextTransferHistorySequence,
  type CareerState,
} from "./career-state.ts";

/**
 * Career-state tests cover durable domain shape only.
 *
 * Storage, market evaluation, transfer application, and CLI rendering are later
 * step responsibilities.
 */
test("createCareerState preserves a minimal durable career snapshot", () => {
  const gameState = gameStateFixture();
  const pro01 = clubId("club:pro01");
  const pro18 = clubId("club:pro18");
  const player18 = playerId("player:180010");

  const career = createCareerState({
    saveId: saveId("save:career-demo"),
    schemaVersion: CAREER_STATE_SCHEMA_VERSION,
    selectedClubId: pro01,
    gameState,
    marketState: marketStateFixture(),
    transferHistory: [
      {
        sequenceNumber: 1,
        occurredOn: gameDate(20_000),
        buyingClubId: pro01,
        sellingClubId: pro18,
        playerId: player18,
        transferFee: nonNegativeMoney(1_500_000_00),
      },
    ],
  });

  assert.equal(career.saveId, "save:career-demo");
  assert.equal(career.selectedClubId, pro01);
  assert.equal(career.schemaVersion, CAREER_STATE_SCHEMA_VERSION);
  assert.deepEqual(career.marketState.clubBudgetIds, [pro01, pro18]);
  assert.equal(career.transferHistory[0]?.playerId, player18);
  assert.equal(nextTransferHistorySequence(career), 2);
});

test("createCareerState rejects unsupported schema versions", () => {
  assertCareerStateError(
    () =>
      createCareerState({
        ...careerStateFixture(),
        schemaVersion: CAREER_STATE_SCHEMA_VERSION + 1,
      }),
    "unsupported_schema_version",
  );
});

test("createCareerState rejects missing or unordered selected clubs", () => {
  assertCareerStateError(
    () =>
      createCareerState({
        ...careerStateFixture(),
        selectedClubId: clubId("club:missing"),
      }),
    "selected_club_not_found",
  );

  const gameState = gameStateFixture();
  const unorderedClubId = clubId("club:unordered");

  assertCareerStateError(
    () =>
      createCareerState({
        ...careerStateFixture(),
        selectedClubId: unorderedClubId,
        gameState: {
          ...gameState,
          clubs: {
            ...gameState.clubs,
            [unorderedClubId]: {
              id: unorderedClubId,
              name: "Unordered",
              shortName: "UNO",
              category: "third_division",
              reputation: 1,
              playerIds: [],
            },
          },
        },
      }),
    "selected_club_not_ordered",
  );
});

test("createCareerState rejects market budgets for unknown clubs and invalid money", () => {
  const unknownClubId = clubId("club:unknown");

  assertCareerStateError(
    () =>
      createCareerState({
        ...careerStateFixture(),
        marketState: createMarketState({
          clubBudgets: {
            [unknownClubId]: { clubId: unknownClubId, transferBudget: nonNegativeMoney(10_000_00) },
          },
          clubBudgetIds: [unknownClubId],
        }),
      }),
    "budget_club_not_found",
  );

  const pro01 = clubId("club:pro01");

  assertCareerStateError(
    () =>
      createCareerState({
        ...careerStateFixture(),
        marketState: {
          clubBudgets: {
            [pro01]: { clubId: pro01, transferBudget: -1 as MarketState["clubBudgets"][typeof pro01]["transferBudget"] },
          },
          clubBudgetIds: [pro01],
        },
      }),
    "invalid_money",
  );
});

test("createCareerState rejects invalid transfer history references", () => {
  assertCareerStateError(
    () =>
      createCareerState({
        ...careerStateFixture(),
        transferHistory: [
          {
            sequenceNumber: 0,
            occurredOn: gameDate(20_000),
            buyingClubId: clubId("club:pro01"),
            sellingClubId: clubId("club:pro18"),
            playerId: playerId("player:180010"),
            transferFee: nonNegativeMoney(1_500_000_00),
          },
        ],
      }),
    "invalid_history_sequence",
  );

  assertCareerStateError(
    () =>
      createCareerState({
        ...careerStateFixture(),
        transferHistory: [
          historyEntryFixture(1),
          historyEntryFixture(1),
        ],
      }),
    "duplicate_history_sequence",
  );

  assertCareerStateError(
    () =>
      createCareerState({
        ...careerStateFixture(),
        transferHistory: [
          {
            ...historyEntryFixture(1),
            playerId: playerId("player:missing"),
          },
        ],
      }),
    "history_player_not_found",
  );
});

/** Builds a valid career-state fixture for mutation inside tests. */
function careerStateFixture(): CareerState {
  return {
    saveId: saveId("save:career-demo"),
    schemaVersion: CAREER_STATE_SCHEMA_VERSION,
    selectedClubId: clubId("club:pro01"),
    gameState: gameStateFixture(),
    marketState: marketStateFixture(),
    transferHistory: [],
  };
}

/** Builds a valid history entry fixture. */
function historyEntryFixture(sequenceNumber: number): CareerState["transferHistory"][number] {
  return {
    sequenceNumber,
    occurredOn: gameDate(20_000),
    buyingClubId: clubId("club:pro01"),
    sellingClubId: clubId("club:pro18"),
    playerId: playerId("player:180010"),
    transferFee: nonNegativeMoney(1_500_000_00),
  };
}

/** Builds a compact market state fixture with two budgeted clubs. */
function marketStateFixture(): MarketState {
  const pro01 = clubId("club:pro01");
  const pro18 = clubId("club:pro18");

  return createMarketState({
    clubBudgets: {
      [pro01]: { clubId: pro01, transferBudget: nonNegativeMoney(6_000_000_00) },
      [pro18]: { clubId: pro18, transferBudget: nonNegativeMoney(500_000_00) },
    },
    clubBudgetIds: [pro01, pro18],
  });
}

/** Builds a minimal game snapshot containing two clubs and two players. */
function gameStateFixture(): GameState {
  const pro01 = clubId("club:pro01");
  const pro18 = clubId("club:pro18");
  const player01 = playerId("player:010010");
  const player18 = playerId("player:180010");
  const fixture = fixtureId("fixture:000001");

  const clubs: Record<Club["id"], Club> = {
    [pro01]: {
      id: pro01,
      name: "PRO01",
      shortName: "PRO01",
      category: "third_division",
      reputation: 5,
      playerIds: [player01],
    },
    [pro18]: {
      id: pro18,
      name: "PRO18",
      shortName: "PRO18",
      category: "third_division",
      reputation: 2,
      playerIds: [player18],
    },
  };

  const players: Record<Player["id"], Player> = {
    [player01]: playerFixture(player01, "Player01"),
    [player18]: playerFixture(player18, "Player18"),
  };

  const playerStates: Record<Player["id"], PlayerDynamicState> = {
    [player01]: playerStateFixture(),
    [player18]: playerStateFixture(),
  };

  const fixtures: Record<Fixture["id"], Fixture> = {
    [fixture]: {
      id: fixture,
      competitionId: competitionId("competition:0001"),
      seasonId: seasonId("season:0001"),
      roundNumber: 1,
      date: gameDate(20_000),
      homeClubId: pro01,
      awayClubId: pro18,
    },
  };

  return {
    meta: {
      seed: "demo-001",
      rngAlgorithmVersion: "sfc32-v1",
      saveSchemaVersion: 1,
    },
    calendar: {
      currentDate: gameDate(20_000),
      currentSeasonId: seasonId("season:0001"),
    },
    players,
    playerIds: [player01, player18],
    playerStates,
    clubs,
    clubIds: [pro01, pro18],
    fixtures,
    fixtureIds: [fixture],
  };
}

/** Builds a compact player fixture. */
function playerFixture(id: Player["id"], firstName: string): Player {
  return {
    id,
    firstName,
    lastName: "No10",
    birthDate: gameDate(10_000),
    naturalPositions: ["st"],
    abilities: abilitySet(10),
    potential: abilitySet(12),
  };
}

/** Builds a complete ability object with the same value everywhere. */
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

/** Builds the default dynamic state used by tests. */
function playerStateFixture(): PlayerDynamicState {
  return {
    fitness: stateValue(100),
    form: stateValue(50),
    morale: stateValue(50),
  };
}

/** Asserts a typed career-state failure and its machine-readable code. */
function assertCareerStateError(
  action: () => void,
  code: CareerStateContractError["code"],
): void {
  assert.throws(
    action,
    (error) => error instanceof CareerStateContractError && error.code === code,
  );
}
