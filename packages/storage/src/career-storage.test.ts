import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "vitest";

import {
  CAREER_STATE_SCHEMA_VERSION,
  createCareerState,
  createMarketState,
  gameDate,
  nonNegativeMoney,
  playerId,
  saveId,
  seasonId,
  type CareerState,
  type GameState,
  type Player,
  type PlayerAbilities,
  type PlayerDynamicState,
} from "@game/domain";

import { JsonCareerStorage } from "./career-storage.ts";
import { StorageError } from "./game-storage.interface.ts";

/**
 * JSON career storage tests protect durable career-state round trips.
 */

test("save then load returns the same CareerState snapshot", async () => {
  const directoryPath = await createTempSaveDirectory();
  const storage = new JsonCareerStorage({
    directoryPath,
    nowISO: fixedClock("2026-06-21T10:00:00.000Z"),
  });
  const state = minimalCareerState();

  try {
    const metadata = await storage.saveCareer({
      saveId: saveId("save:career-demo"),
      name: "Career Demo",
      state,
    });
    const loaded = await storage.loadCareer(saveId("save:career-demo"));

    assert.deepEqual(loaded, state);
    assert.equal(metadata.saveId, "save:career-demo");
    assert.equal(metadata.name, "Career Demo");
    assert.equal(metadata.createdAtISO, "2026-06-21T10:00:00.000Z");
    assert.equal(metadata.updatedAtISO, "2026-06-21T10:00:00.000Z");
  } finally {
    await removeTempSaveDirectory(directoryPath);
  }
});

test("saving a career does not mutate the input object", async () => {
  const directoryPath = await createTempSaveDirectory();
  const storage = new JsonCareerStorage({
    directoryPath,
    nowISO: fixedClock("2026-06-21T10:00:00.000Z"),
  });
  const state = minimalCareerState();
  const beforeSave = JSON.stringify(state);

  try {
    await storage.saveCareer({
      saveId: saveId("save:career-demo"),
      name: "Career Demo",
      state,
    });

    assert.equal(JSON.stringify(state), beforeSave);
  } finally {
    await removeTempSaveDirectory(directoryPath);
  }
});

test("save then load preserves career match preparation", async () => {
  const directoryPath = await createTempSaveDirectory();
  const storage = new JsonCareerStorage({
    directoryPath,
    nowISO: fixedClock("2026-06-21T10:00:00.000Z"),
  });
  const pro01 = "club:pro01" as CareerState["selectedClubId"];
  const player01 = playerId("player:pro01-01");
  const state = createCareerState({
    ...minimalCareerState(),
    matchPreparation: {
      selectedClubId: pro01,
      selectedLineup: {
        clubId: pro01,
        slots: [
          { slotKey: "gk", playerId: player01, roleKey: "gk" },
        ],
      },
      tactic: {
        mentality: "balanced",
        pressing: 0.5,
        directness: 0.5,
        width: 0.5,
        risk: 0.5,
      },
      updatedAt: gameDate(20_000),
    },
  });

  try {
    await storage.saveCareer({
      saveId: saveId("save:career-prep"),
      name: "Career Prep",
      state,
    });

    const loaded = await storage.loadCareer(saveId("save:career-prep"));

    assert.deepEqual(loaded.matchPreparation, state.matchPreparation);
  } finally {
    await removeTempSaveDirectory(directoryPath);
  }
});

test("save then load preserves compact season history", async () => {
  const directoryPath = await createTempSaveDirectory();
  const storage = new JsonCareerStorage({
    directoryPath,
    nowISO: fixedClock("2026-06-21T10:00:00.000Z"),
  });
  const pro01 = "club:pro01" as CareerState["selectedClubId"];
  const state = createCareerState({
    ...minimalCareerState(),
    seasonHistory: [
      {
        sequenceNumber: 1,
        seasonId: seasonId("season:2026"),
        competitionId: "competition:demo" as NonNullable<CareerState["seasonHistory"]>[number]["competitionId"],
        finalTable: [leagueTableRowFixture(1, pro01, 3)],
        championClubId: pro01,
        selectedClubFinish: leagueTableRowFixture(1, pro01, 3),
        aggregateGoals: {
          fixtureCount: 1,
          totalGoals: 2,
        },
      },
    ],
  });

  try {
    await storage.saveCareer({
      saveId: saveId("save:career-history"),
      name: "Career History",
      state,
    });

    const loaded = await storage.loadCareer(saveId("save:career-history"));

    assert.deepEqual(loaded.seasonHistory, state.seasonHistory);
  } finally {
    await removeTempSaveDirectory(directoryPath);
  }
});

test("loading a missing career save throws a typed storage error", async () => {
  const directoryPath = await createTempSaveDirectory();
  const storage = new JsonCareerStorage({ directoryPath });

  try {
    await assert.rejects(
      () => storage.loadCareer(saveId("save:missing")),
      (error: unknown) => error instanceof StorageError && error.code === "save_not_found",
    );
  } finally {
    await removeTempSaveDirectory(directoryPath);
  }
});

test("loading malformed career saves fails clearly", async () => {
  const directoryPath = await createTempSaveDirectory();
  const storage = new JsonCareerStorage({ directoryPath });
  const malformedPath = join(directoryPath, `${encodeURIComponent(saveId("save:bad"))}.career.json`);

  try {
    await writeFile(malformedPath, JSON.stringify({ saveSchemaVersion: 1, metadata: {}, state: {} }), "utf8");

    await assert.rejects(
      () => storage.loadCareer(saveId("save:bad")),
      (error: unknown) => error instanceof StorageError && error.code === "save_unreadable",
    );
  } finally {
    await removeTempSaveDirectory(directoryPath);
  }
});

test("career storage writes a career-specific JSON envelope", async () => {
  const directoryPath = await createTempSaveDirectory();
  const storage = new JsonCareerStorage({
    directoryPath,
    nowISO: fixedClock("2026-06-21T10:00:00.000Z"),
  });

  try {
    await storage.saveCareer({
      saveId: saveId("save:career-demo"),
      name: "Career Demo",
      state: minimalCareerState(),
    });

    const storedPath = join(directoryPath, `${encodeURIComponent(saveId("save:career-demo"))}.career.json`);
    const raw = JSON.parse(await readFile(storedPath, "utf8")) as Readonly<Record<string, unknown>>;

    assert.equal(raw.saveSchemaVersion, 1);
    assert.equal((raw.metadata as { readonly saveId: string }).saveId, "save:career-demo");
    assert.equal((raw.state as { readonly selectedClubId: string }).selectedClubId, "club:pro01");
  } finally {
    await removeTempSaveDirectory(directoryPath);
  }
});

/** Builds the smallest valid durable career state needed for storage tests. */
function minimalCareerState(): CareerState {
  const pro01 = "club:pro01" as CareerState["selectedClubId"];

  return createCareerState({
    saveId: saveId("save:career-demo"),
    schemaVersion: CAREER_STATE_SCHEMA_VERSION,
    selectedClubId: pro01,
    gameState: minimalGameState(),
    marketState: createMarketState({
      clubBudgets: {
        [pro01]: { clubId: pro01, transferBudget: nonNegativeMoney(6_000_000_00) },
      },
      clubBudgetIds: [pro01],
    }),
    transferHistory: [],
  });
}

/** Builds the smallest valid game state with one selected club. */
function minimalGameState(): GameState {
  const pro01 = "club:pro01" as CareerState["selectedClubId"];
  const player01 = playerId("player:pro01-01");

  return {
    meta: {
      seed: "demo-001",
      rngAlgorithmVersion: "sfc32-cyrb128-v1",
      saveSchemaVersion: 1,
    },
    calendar: {
      currentDate: gameDate(20_000),
      currentSeasonId: seasonId("season:2026"),
    },
    players: {
      [player01]: playerFixture(player01),
    },
    playerIds: [player01],
    playerStates: {
      [player01]: playerStateFixture(),
    },
    clubs: {
      [pro01]: {
        id: pro01,
        name: "PRO01",
        shortName: "PRO01",
        category: "third_division",
        reputation: 5,
        playerIds: [player01],
      },
    },
    clubIds: [pro01],
    fixtures: {},
    fixtureIds: [],
  };
}

/** Builds the compact player record needed for match-preparation storage tests. */
function playerFixture(id: Player["id"]): Player {
  return {
    id,
    firstName: "Player",
    lastName: "One",
    birthDate: gameDate(10_000),
    naturalPositions: ["gk"],
    abilities: abilitySet(10),
    potential: abilitySet(12),
  };
}

/** Builds a complete ability object with the same numeric value everywhere. */
function abilitySet(value: number): PlayerAbilities {
  const ability = value as PlayerAbilities["technical"]["finishing"];

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

/** Builds the default dynamic player state used by storage fixtures. */
function playerStateFixture(): PlayerDynamicState {
  return {
    fitness: 100 as PlayerDynamicState["fitness"],
    form: 50 as PlayerDynamicState["form"],
    morale: 50 as PlayerDynamicState["morale"],
  };
}

/** Builds a final-table row for season-history storage round trips. */
function leagueTableRowFixture(
  position: number,
  clubId: CareerState["selectedClubId"],
  points: number,
): NonNullable<CareerState["seasonHistory"]>[number]["finalTable"][number] {
  return {
    position,
    clubId,
    played: 1,
    wins: points === 3 ? 1 : 0,
    draws: 0,
    losses: points === 0 ? 1 : 0,
    goalsFor: points === 3 ? 2 : 0,
    goalsAgainst: points === 0 ? 2 : 0,
    goalDifference: points === 3 ? 2 : -2,
    points,
  };
}

/**
 * Creates a deterministic clock function for metadata assertions.
 */
function fixedClock(...timestamps: readonly string[]): () => string {
  assert.notEqual(timestamps.length, 0);

  let index = 0;

  return () => {
    const timestamp = timestamps[Math.min(index, timestamps.length - 1)]!;
    index += 1;

    return timestamp;
  };
}

/** Creates an isolated temporary save directory for a test case. */
async function createTempSaveDirectory(): Promise<string> {
  return mkdtemp(join(tmpdir(), "the-long-season-career-saves-"));
}

/** Removes a temporary save directory after a test case. */
async function removeTempSaveDirectory(directoryPath: string): Promise<void> {
  await rm(directoryPath, { recursive: true, force: true });
}
