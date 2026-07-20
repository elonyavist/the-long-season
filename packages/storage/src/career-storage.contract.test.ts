import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { test } from "vitest";

import {
  CAREER_STATE_SCHEMA_VERSION,
  accruePlayerFixtureParticipation,
  closePlayerParticipationMonth,
  createCareerState,
  createEmptyPlayerParticipationLedger,
  createMarketState,
  clubId,
  competitionId,
  fixtureId,
  gameDate,
  nonNegativeMoney,
  playerId,
  saveId,
  seasonId,
  stateValue,
  type CareerState,
  type GameState,
  type PlayerAbilities,
} from "@game/domain";

import { contractSaveIds, runCareerStorageContract } from "./career-storage.contract.ts";
import { JsonCareerStorage } from "./json-career-storage.ts";

/** The JSON adapter obeys the same lifecycle contract required from SQLite. */
test("JsonCareerStorage satisfies the canonical career lifecycle contract", async () => {
  const directoryPath = await mkdtemp(join(tmpdir(), "the-long-season-storage-contract-"));
  const storage = new JsonCareerStorage({
    directoryPath,
    nowISO: fixedClock(
      "2026-07-13T10:00:00.000Z",
      "2026-07-13T10:01:00.000Z",
      "2026-07-13T10:02:00.000Z",
    ),
  });
  const firstState = careerFixture("save:contract-zeta", "contract-first", 20_000);
  const secondState = careerFixture("save:contract-alpha", "contract-second", 20_001);
  const replacementState = careerFixture("save:contract-zeta", "contract-replacement", 20_010);

  try {
    const result = await runCareerStorageContract(storage, {
      firstName: "Zeta",
      firstState,
      secondName: "Alpha",
      secondState,
      replacementName: "Zeta replaced",
      replacementState,
    });

    assert.deepEqual(result.loadedFirst, firstState);
    assert.deepEqual(result.loadedReplacement, replacementState);
    assert.deepEqual(contractSaveIds(result.initialList), [saveId("save:contract-alpha"), saveId("save:contract-zeta")]);
    assert.deepEqual(contractSaveIds(result.finalList), [saveId("save:contract-zeta")]);
    assert.equal(result.replacementMetadata.name, "Zeta replaced");
    assert.equal(result.replacementMetadata.createdAtISO, result.firstMetadata.createdAtISO);
    assert.notEqual(result.replacementMetadata.updatedAtISO, result.firstMetadata.updatedAtISO);
  } finally {
    await rm(directoryPath, { recursive: true, force: true });
  }
});

/** Builds one compact but fully validated career snapshot for contract tests. */
function careerFixture(id: string, seed: string, currentDate: number): CareerState {
  const club = "club:contract" as CareerState["selectedClubId"];
  const opponent = clubId("club:opponent");
  const player = playerId("player:contract-01");
  const playedFixture = fixtureId("fixture:contract-played");
  const gameState: GameState = {
    meta: { seed, rngAlgorithmVersion: "sfc32-cyrb128-v1", saveSchemaVersion: 1 },
    calendar: { currentDate: gameDate(currentDate), currentSeasonId: seasonId("season:contract") },
    players: {
      [player]: {
        id: player,
        firstName: "Contract",
        lastName: "Player",
        birthDate: gameDate(10_000),
        naturalPositions: ["gk"],
        primaryRole: "goalkeeper",
        archetype: "goalkeeper_shot_stopper",
        naturalRoles: ["goalkeeper"],
        adaptedRoles: [],
        weakRoles: [],
        roleFamiliarity: { goalkeeper: "natural" },
        abilities: abilitySet(10),
        potential: abilitySet(12),
      },
    },
    playerIds: [player],
    playerStates: { [player]: { fitness: stateValue(100), form: stateValue(50), morale: stateValue(50) } },
    clubs: {
      [club]: { id: club, name: "Contract Club", shortName: "Contract", category: "third_division", reputation: 5, playerIds: [player] },
      [opponent]: { id: opponent, name: "Opponent Club", shortName: "Opponent", category: "third_division", reputation: 4, playerIds: [] },
    },
    clubIds: [club, opponent],
    fixtures: {
      [playedFixture]: {
        id: playedFixture,
        competitionId: competitionId("competition:contract"),
        seasonId: seasonId("season:contract"),
        roundNumber: 1,
        date: gameDate(currentDate - 1),
        homeClubId: club,
        awayClubId: opponent,
        result: { played: true, homeGoals: 1, awayGoals: 0 },
      },
    },
    fixtureIds: [playedFixture],
  };

  return createCareerState({
    saveId: saveId(id),
    schemaVersion: CAREER_STATE_SCHEMA_VERSION,
    selectedClubId: club,
    gameState,
    marketState: createMarketState({
      clubBudgets: { [club]: { clubId: club, transferBudget: nonNegativeMoney(6_000_000_00) } },
      clubBudgetIds: [club],
    }),
    transferHistory: [],
    playerAvailability: {
      injuries: [{
        fixtureId: playedFixture,
        playerId: player,
        severity: "minor",
        occurredOn: gameDate(currentDate - 1),
        unavailableUntil: gameDate(currentDate + 5),
      }],
      suspensions: [],
      yellowCards: [{
        competitionId: competitionId("competition:contract"),
        playerId: player,
        count: 2,
      }],
    },
    playerParticipationLedger: playerParticipationLedgerFixture(player),
  });
}

/** Builds one closed monthly participation ledger for save/load contracts. */
function playerParticipationLedgerFixture(player: ReturnType<typeof playerId>) {
  const season = seasonId("season:contract");
  const monthKey = "2026-08";
  const accrued = accruePlayerFixtureParticipation(createEmptyPlayerParticipationLedger(), {
    fixtureId: fixtureId("fixture:contract-001"),
    playerId: player,
    seasonId: season,
    monthKey,
    started: true,
    substituteAppearance: false,
    minutes: 90,
    rating: 7.2,
    playedRoleMinutes: { goalkeeper: 90 },
  });

  return closePlayerParticipationMonth(accrued, season, monthKey);
}

/** Creates complete ability groups with one deterministic value. */
function abilitySet(value: number): PlayerAbilities {
  const ability = value as PlayerAbilities["technical"]["finishing"];
  return {
    technical: { finishing: ability, passing: ability, longPassing: ability, crossing: ability, dribbling: ability, technique: ability, tackling: ability, penalties: ability, freeKicks: ability },
    physical: { pace: ability, strength: ability, stamina: ability, agility: ability, heading: ability },
    mental: { positioning: ability, vision: ability, anticipation: ability, composure: ability, determination: ability, leadership: ability },
    goalkeeping: { reflexes: ability, handling: ability, rushingOut: ability, goalkeeperPositioning: ability, footwork: ability },
  };
}

/** Returns deterministic timestamps while preserving the last supplied value. */
function fixedClock(...timestamps: readonly string[]): () => string {
  let index = 0;
  return () => timestamps[Math.min(index++, timestamps.length - 1)]!;
}
