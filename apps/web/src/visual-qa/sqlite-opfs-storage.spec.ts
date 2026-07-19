/// <reference types="node" />

import { spawn, type ChildProcess } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { expect, test } from "playwright/test";
import { completeStagedMatchCheckpoint } from "@game/engine";

const CURRENT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(CURRENT_DIR, "../../../..");
const PORT = 5192;
const URL = `http://127.0.0.1:${PORT}/`;
let server: ChildProcess;

test.beforeAll(async () => {
  server = spawn("pnpm", ["--filter", "@game/web", "exec", "vite", "--host", "127.0.0.1", "--port", String(PORT)], {
    cwd: REPO_ROOT,
    stdio: "pipe",
  });
  await waitForServer();
});

test.afterAll(() => {
  server.kill("SIGTERM");
});

test("SQLite OPFS round-trips isolated ordered worlds and rolls back a failed replacement", async ({ page }) => {
  await page.goto(URL);

  const result = await page.evaluate(async () => {
    const persistenceModulePath = "/src/infrastructure/persistence/create-web-career-storage.ts";
    const { createWebCareerStorage } = await import(/* @vite-ignore */ persistenceModulePath);
    const firstSaveId = "save:phase71-opfs-world-a";
    const secondSaveId = "save:phase71-opfs-world-b";
    const abilitySet = (value: number) => ({
      technical: { finishing: value, passing: value, longPassing: value, crossing: value, dribbling: value, technique: value, tackling: value, penalties: value, freeKicks: value },
      physical: { pace: value, strength: value, stamina: value, agility: value, heading: value },
      mental: { positioning: value, vision: value, anticipation: value, composure: value, determination: value, leadership: value },
      goalkeeping: { reflexes: value, handling: value, rushingOut: value, goalkeeperPositioning: value, footwork: value },
    });
    const roleIdentity = (primaryRole: string, archetype: string) => ({
      primaryRole,
      archetype,
      naturalRoles: [primaryRole],
      adaptedRoles: [],
      weakRoles: [],
      roleFamiliarity: { [primaryRole]: "natural" },
    });
    const state = {
      saveId: firstSaveId,
      schemaVersion: 1,
      selectedClubId: "club:home",
      gameState: {
        meta: { seed: "phase71-world-a", rngAlgorithmVersion: "sfc32-v1", saveSchemaVersion: 1 },
        calendar: { currentDate: 20_100, currentSeasonId: "season:2026" },
        players: {
          "player:away-01": {
            id: "player:away-01", firstName: "Marco", lastName: "Bianchi", birthDate: 10_500,
            ...roleIdentity("goalkeeper", "goalkeeper_shot_stopper"),
            naturalPositions: ["gk"], abilities: abilitySet(9), potential: abilitySet(12),
          },
          "player:away-02": {
            id: "player:away-02", firstName: "Andrea", lastName: "Neri", birthDate: 11_100,
            ...roleIdentity("striker", "striker_poacher"),
            naturalPositions: ["st"], abilities: abilitySet(8), potential: abilitySet(11),
          },
          "player:home-01": {
            id: "player:home-01", firstName: "Luca", lastName: "Rossi", birthDate: 11_000,
            naturalPositions: ["cm", "dm"], primaryRole: "central_midfielder", archetype: "central_midfielder_playmaker",
            naturalRoles: ["central_midfielder"], adaptedRoles: [], weakRoles: ["attacking_midfielder"],
            roleFamiliarity: { central_midfielder: "natural", attacking_midfielder: "weak" },
            abilities: abilitySet(11), potential: abilitySet(15),
          },
          "player:home-02": {
            id: "player:home-02", firstName: "Davide", lastName: "Blu", birthDate: 10_900,
            ...roleIdentity("goalkeeper", "goalkeeper_shot_stopper"),
            naturalPositions: ["gk"], abilities: abilitySet(10), potential: abilitySet(13),
          },
          "player:youth-01": {
            id: "player:youth-01", firstName: "Paolo", lastName: "Verdi", birthDate: 15_000,
            ...roleIdentity("striker", "striker_poacher"),
            naturalPositions: ["st"], abilities: abilitySet(6), potential: abilitySet(14),
          },
        },
        playerIds: ["player:away-01", "player:away-02", "player:home-01", "player:home-02", "player:youth-01"],
        playerStates: {
          "player:away-01": { fitness: 98, form: 51, morale: 49 },
          "player:away-02": { fitness: 96, form: 53, morale: 50 },
          "player:home-01": { fitness: 91, form: 64, morale: 72 },
          "player:home-02": { fitness: 94, form: 58, morale: 68 },
          "player:youth-01": { fitness: 100, form: 50, morale: 55 },
        },
        clubs: {
          "club:away": { id: "club:away", name: "Away Calcio", shortName: "Away", category: "third_division", reputation: 4, playerIds: ["player:away-01", "player:away-02"] },
          "club:home": { id: "club:home", name: "Home Calcio", shortName: "Home", category: "third_division", reputation: 5, playerIds: ["player:home-01", "player:home-02"] },
        },
        clubIds: ["club:away", "club:home"],
        fixtures: {
          "fixture:future": { id: "fixture:future", competitionId: "competition:ita-3", seasonId: "season:2026", roundNumber: 2, date: 20_107, homeClubId: "club:away", awayClubId: "club:home" },
          "fixture:played": { id: "fixture:played", competitionId: "competition:ita-3", seasonId: "season:2026", roundNumber: 1, date: 20_100, homeClubId: "club:home", awayClubId: "club:away", result: { played: true, homeGoals: 1, awayGoals: 0, report: {
            eventSchemaVersion: 7, fixtureId: "fixture:played", finalMinute: 90,
            score: { home: 1, away: 0 },
            stats: { home: { opportunities: 1, shots: 1, shotsOnTarget: 1, goals: 1 }, away: { opportunities: 0, shots: 0, shotsOnTarget: 0, goals: 0 } },
            events: [
              { type: "kickoff", minute: 0 },
              { type: "goal", shot: { minute: 21, side: "home", quality: 0.72, isShotOnTarget: true, shotType: "normal", chanceType: "open_play" }, scorerPlayerId: "player:home-01" },
              { type: "half_time", minute: 45, score: { home: 1, away: 0 } },
              { type: "full_time", minute: 90, score: { home: 1, away: 0 } },
            ],
          } } },
        },
        fixtureIds: ["fixture:future", "fixture:played"],
      },
      careerWorld: { worldSeed: "phase71-generated-world", generatorVersion: 1, creationSourceKey: "career:web" },
      marketState: {
        clubBudgets: {
          "club:away": { clubId: "club:away", transferBudget: 4_000_000_00 },
          "club:home": { clubId: "club:home", transferBudget: 6_000_000_00 },
        },
        clubBudgetIds: ["club:away", "club:home"],
      },
      transferHistory: [{ sequenceNumber: 1, occurredOn: 20_090, buyingClubId: "club:home", sellingClubId: "club:away", playerId: "player:away-01", transferFee: 1_000_000_00 }],
      currentSeasonInbox: [],
      youthAcademyState: {
        clubRosters: { "club:home": { clubId: "club:home", playerIds: ["player:youth-01"] } },
        clubRosterIds: ["club:home"],
        playerLifecycle: { "player:youth-01": { playerId: "player:youth-01", clubId: "club:home", status: "academy", academyEntrySeasonId: "season:2026", academyEntryDate: 20_050 } },
        playerLifecycleIds: ["player:youth-01"],
      },
      seasonHistory: [{
        sequenceNumber: 1, seasonId: "season:2025", competitionId: "competition:ita-3",
        finalTable: [
          { position: 1, clubId: "club:home", played: 1, wins: 1, draws: 0, losses: 0, goalsFor: 1, goalsAgainst: 0, goalDifference: 1, points: 3 },
          { position: 2, clubId: "club:away", played: 1, wins: 0, draws: 0, losses: 1, goalsFor: 0, goalsAgainst: 1, goalDifference: -1, points: 0 },
        ],
        championClubId: "club:home",
        selectedClubFinish: { position: 1, clubId: "club:home", played: 1, wins: 1, draws: 0, losses: 0, goalsFor: 1, goalsAgainst: 0, goalDifference: 1, points: 3 },
        aggregateGoals: { fixtureCount: 1, totalGoals: 1 },
      }],
      matchPreparation: {
        selectedClubId: "club:home", targetFixtureId: "fixture:future", updatedAt: 20_100,
        selectedLineup: { clubId: "club:home", slots: [{ slotKey: "st", playerId: "player:home-01", roleKey: "attacker" }] },
        baseFormationId: "4-4-2",
        boardSlots: [{ slotKey: "st", nx: 0.5, ny: 0.18, roleKey: "ATT" }],
        benchSlots: [{ slotKey: "bench:01", playerId: "player:home-02" }],
        tactic: { mentality: "balanced", pressing: 0.5, directness: 0.4, width: 0.6, risk: 0.5 },
      },
      activeMatchCheckpoint: {
        schemaVersion: 1, fixtureId: "fixture:future", selectedClubSide: "away", phase: "half_time",
        initialContext: {
          fixtureId: "fixture:future", seed: "phase71-active-match",
          home: { clubId: "club:away", lineup: [{ slotId: "home-1", playerId: "player:away-01", roleKey: "gk" }, { slotId: "home-2", playerId: "player:away-02", roleKey: "attacker" }], strength: { attack: 9, midfield: 9, defense: 9, goalkeeper: 9, overall: 9 }, tacticalDistribution: { directness: 0, pressing: 0, width: 0, risk: 0 } },
          away: { clubId: "club:home", lineup: [{ slotId: "away-1", playerId: "player:home-02", roleKey: "gk" }, { slotId: "away-2", playerId: "player:home-01", roleKey: "attacker" }], strength: { attack: 10, midfield: 10, defense: 10, goalkeeper: 10, overall: 10 }, tacticalDistribution: { directness: 0, pressing: 0, width: 0, risk: 0 } },
          engineConfig: {
            minuteCount: 90, rates: { baseOpportunityRatePerMinute: 0.1, maxOpportunityRatePerMinute: 0.3 },
            conversionBands: [{ bandKey: "all", minQualityInclusive: 0, maxQualityExclusive: 1.01, goalProbability: 0.1 }],
            homeAdvantageFactor: 1.05,
            tacticalDistributionCaps: {
              directness: { minInclusive: -1, maxInclusive: 1 }, pressing: { minInclusive: -1, maxInclusive: 1 },
              width: { minInclusive: -1, maxInclusive: 1 }, risk: { minInclusive: -1, maxInclusive: 1 },
            },
          },
        },
        simulation: { minute: 45, score: { home: 0, away: 0 }, stats: { home: { opportunities: 0, shots: 0, shotsOnTarget: 0, goals: 0 }, away: { opportunities: 0, shots: 0, shotsOnTarget: 0, goals: 0 } }, local: { hasKickedOff: true, hasReachedHalfTime: true, hasReachedFullTime: false } },
        events: [{ type: "kickoff", minute: 0 }, { type: "half_time", minute: 45, score: { home: 0, away: 0 } }],
        selectedClubBenchSlots: [], appliedSubstitutions: [],
      },
      playerParticipationLedger: {
        rows: {
          "season:2026|2026-08|player:home-01": {
            rowKey: "season:2026|2026-08|player:home-01",
            playerId: "player:home-01",
            seasonId: "season:2026",
            monthKey: "2026-08",
            starts: 1,
            substituteAppearances: 0,
            minutes: 90,
            ratingTotal: 7.3,
            ratingSamples: 1,
            playedRoleMinutes: { central_midfielder: 90 },
            appliedFixtureIds: ["fixture:played"],
          },
        },
        rowKeys: ["season:2026|2026-08|player:home-01"],
        closedMonthKeys: ["season:2026|2026-08"],
      },
    };
    const secondState = structuredClone(state);
    secondState.saveId = secondSaveId;
    secondState.gameState.meta.seed = "phase71-world-b";

    const first = await createWebCareerStorage();
    await first.storage.deleteCareer(firstSaveId as never);
    await first.storage.deleteCareer(secondSaveId as never);
    const metadata = await first.storage.saveCareer({ saveId: firstSaveId as never, name: "Phase 71 World A", state: state as never });
    await first.storage.saveCareer({ saveId: secondSaveId as never, name: "Phase 71 World B", state: secondState as never });
    await first.close();

    const second = await createWebCareerStorage();
    const loaded = await second.storage.loadCareer(firstSaveId as never);
    const isolated = await second.storage.loadCareer(secondSaveId as never);
    const invalidReplacement = structuredClone(state);
    invalidReplacement.gameState.clubs["club:away"].playerIds = ["player:away-01", "player:away-01"];
    let replacementFailed = false;
    try {
      await second.storage.saveCareer({ saveId: firstSaveId as never, name: "Broken replacement", state: invalidReplacement as never });
    } catch {
      replacementFailed = true;
    }
    const afterFailedReplacement = await second.storage.loadCareer(firstSaveId as never);
    const listed = await second.storage.listCareers();
    const root = await navigator.storage.getDirectory();
    let opfsDatabaseExists = false;
    try {
      await root.getFileHandle("the-long-season-careers.sqlite3");
      opfsDatabaseExists = true;
    } catch {
      opfsDatabaseExists = false;
    }
    const indexedDbNames = typeof indexedDB.databases === "function"
      ? (await indexedDB.databases()).map((database) => database.name ?? "")
      : [];
    const localCareerKeys = Object.keys(localStorage).filter((key) => /career|save/i.test(key));
    await second.storage.deleteCareer(firstSaveId as never);
    await second.storage.deleteCareer(secondSaveId as never);
    await second.close();

    const canonical = (value: unknown): string => JSON.stringify(value, (_key, nested) => {
      if (nested === null || typeof nested !== "object" || Array.isArray(nested)) return nested;
      return Object.fromEntries(Object.entries(nested).sort(([left], [right]) => left.localeCompare(right)));
    });

    return {
      metadata,
      worldRoundTripExact: canonical(loaded) === canonical(state),
      isolatedSeed: isolated.gameState.meta.seed,
      isolatedSaveCount: listed.filter((entry: { readonly saveId: string }) => entry.saveId === firstSaveId || entry.saveId === secondSaveId).length,
      replacementFailed,
      rollbackPreserved: canonical(afterFailedReplacement) === canonical(state),
      sourceCheckpoint: state.activeMatchCheckpoint,
      restoredCheckpoint: loaded.activeMatchCheckpoint,
      sourcePreparation: state.matchPreparation,
      restoredPreparation: loaded.matchPreparation,
      restoredPlayerFacts: {
        roleIdentity: loaded.gameState.players["player:home-01"],
        dynamicState: loaded.gameState.playerStates["player:home-01"],
        playerParticipationLedger: loaded.playerParticipationLedger,
        youthPlayer: loaded.gameState.players["player:youth-01"],
        youthAcademy: loaded.youthAcademyState,
      },
      opfsDatabaseExists,
      indexedDbNames,
      localCareerKeys,
      crossOriginIsolated,
    };
  });

  expect(result.crossOriginIsolated).toBe(true);
  expect(result.metadata.name).toBe("Phase 71 World A");
  expect(result.worldRoundTripExact).toBe(true);
  expect(result.isolatedSeed).toBe("phase71-world-b");
  expect(result.isolatedSaveCount).toBe(2);
  expect(result.replacementFailed).toBe(true);
  expect(result.rollbackPreserved).toBe(true);
  expect(completeStagedMatchCheckpoint(result.restoredCheckpoint as never)).toEqual(
    completeStagedMatchCheckpoint(result.sourceCheckpoint as never),
  );
  expect(result.restoredPreparation).toEqual(result.sourcePreparation);
  expect(result.restoredPlayerFacts.roleIdentity.primaryRole).toBe("central_midfielder");
  expect(result.restoredPlayerFacts.roleIdentity.abilities.technical.passing).toBe(11);
  expect(result.restoredPlayerFacts.roleIdentity.potential.technical.passing).toBe(15);
  expect(result.restoredPlayerFacts.dynamicState).toEqual({ fitness: 91, form: 64, morale: 72 });
  expect(result.restoredPlayerFacts.playerParticipationLedger?.rowKeys).toEqual(["season:2026|2026-08|player:home-01"]);
  expect(result.restoredPlayerFacts.playerParticipationLedger?.closedMonthKeys).toEqual(["season:2026|2026-08"]);
  expect(result.restoredPlayerFacts.youthPlayer.primaryRole).toBe("striker");
  expect(result.restoredPlayerFacts.youthAcademy.playerLifecycleIds).toEqual(["player:youth-01"]);
  expect(result.opfsDatabaseExists).toBe(true);
  expect(result.indexedDbNames.filter((name) => /career|save/i.test(name))).toEqual([]);
  expect(result.localCareerKeys).toEqual([]);
});

async function waitForServer(): Promise<void> {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(URL);
      if (response.ok) return;
    } catch {
      // Vite is still starting.
    }
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 100));
  }
  throw new Error(`Vite did not start at ${URL}`);
}
