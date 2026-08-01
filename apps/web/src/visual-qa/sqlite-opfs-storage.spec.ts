/// <reference types="node" />

import { spawn, type ChildProcess } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { expect, test } from "playwright/test";

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

test("SQLite OPFS resets beta v21, preserves future v23, round-trips v22, and rolls back atomically", async ({ page }) => {
  await page.goto(URL);

  const result = await page.evaluate(async ({ repoRoot }) => {
    const databaseFileName = "the-long-season-careers.sqlite3";
    const storageRoot = await navigator.storage.getDirectory();
    try {
      await storageRoot.removeEntry(databaseFileName);
    } catch (error) {
      if (!(error instanceof DOMException) || error.name !== "NotFoundError") throw error;
    }

    type SqliteFixtureTask =
      | { readonly kind: "seed"; readonly version: number; readonly marker?: string }
      | { readonly kind: "inspect" };
    type SqliteFixtureResult = Readonly<{
      ok: boolean;
      message?: string;
      version?: number;
      marker?: string;
    }>;
    const sqliteModulePath = `${globalThis.location.origin}/@fs${repoRoot}/apps/web/node_modules/@sqlite.org/sqlite-wasm/dist/index.mjs`;
    const fixtureWorkerSource = `
      self.addEventListener("message", async (event) => {
        let database;
        try {
          const { default: sqlite3InitModule } = await import(${JSON.stringify(sqliteModulePath)});
          const sqlite3 = await sqlite3InitModule();
          database = new sqlite3.oo1.OpfsDb("/${databaseFileName}", "c");
          if (event.data.kind === "seed") {
            database.exec("CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY, applied_at_iso TEXT NOT NULL) STRICT");
            database.exec("DELETE FROM schema_migrations");
            database.exec({
              sql: "INSERT INTO schema_migrations (version, applied_at_iso) VALUES (?, '2026-07-31T00:00:00.000Z')",
              bind: [event.data.version],
            });
            if (event.data.marker !== undefined) {
              database.exec("CREATE TABLE IF NOT EXISTS future_schema_marker (marker TEXT NOT NULL) STRICT");
              database.exec("DELETE FROM future_schema_marker");
              database.exec({ sql: "INSERT INTO future_schema_marker (marker) VALUES (?)", bind: [event.data.marker] });
            }
            self.postMessage({ ok: true });
          } else {
            self.postMessage({
              ok: true,
              version: Number(database.selectValue("SELECT MAX(version) FROM schema_migrations")),
              marker: database.selectValue("SELECT marker FROM future_schema_marker"),
            });
          }
        } catch (error) {
          self.postMessage({ ok: false, message: error instanceof Error ? error.message : String(error) });
        } finally {
          database?.close();
        }
      });
    `;
    const runSqliteFixtureTask = async (task: SqliteFixtureTask): Promise<SqliteFixtureResult> => {
      const workerUrl = globalThis.URL.createObjectURL(new Blob([fixtureWorkerSource], { type: "text/javascript" }));
      const worker = new Worker(workerUrl, { type: "module" });
      const result = await new Promise<SqliteFixtureResult>((resolveTask) => {
        worker.addEventListener("message", (event) => resolveTask(event.data), { once: true });
        worker.addEventListener("error", (event) => resolveTask({
          ok: false,
          message: event.message
            || `${event.filename}:${String(event.lineno)}:${String(event.colno)} ${String(event.error)}`,
        }), { once: true });
        worker.postMessage(task);
      });
      worker.terminate();
      globalThis.URL.revokeObjectURL(workerUrl);
      return result;
    };
    const seedResult = await runSqliteFixtureTask({ kind: "seed", version: 21 });
    if (!seedResult.ok) throw new Error(`Unable to seed SQLite beta v21: ${seedResult.message ?? "unknown error"}`);

    const persistenceModulePath = "/src/infrastructure/persistence/create-web-career-storage.ts";
    const runtimeModulePath = "/src/runtime/web-career-runtime.ts";
    const { createWebCareerStorage } = await import(/* @vite-ignore */ persistenceModulePath);
    const { WebCareerRuntime } = await import(/* @vite-ignore */ runtimeModulePath);
    const firstSaveId = "save:phase78-opfs-world-a";
    const secondSaveId = "save:phase78-opfs-world-b";

    const firstHandle = await createWebCareerStorage();
    await firstHandle.storage.deleteCareer(firstSaveId as never);
    await firstHandle.storage.deleteCareer(secondSaveId as never);

    const firstRuntime = new WebCareerRuntime(firstHandle.storage, {
      createIdentity: () => ({ saveId: firstSaveId, worldSeed: "phase78-opfs-world-a" }),
    });
    const secondRuntime = new WebCareerRuntime(firstHandle.storage, {
      createIdentity: () => ({ saveId: secondSaveId, worldSeed: "phase78-opfs-world-b" }),
    });
    const firstCareer = await firstRuntime.createNewCareer();
    await secondRuntime.createNewCareer();
    const pendingState = structuredClone(firstCareer.state);
    const selectedClubId = pendingState.selectedClubId;
    const selectedContractId = pendingState.seniorSquadState.activeContractIds.find(
      (contractId: string) => pendingState.seniorSquadState.contracts[contractId]?.clubId === selectedClubId,
    );
    if (selectedContractId === undefined) throw new Error("Generated career has no selected-club contract");
    const selectedContract = pendingState.seniorSquadState.contracts[selectedContractId];
    const selectedPlayer = pendingState.gameState.players[selectedContract.playerId];
    const selectedClub = pendingState.gameState.clubs[selectedClubId];
    if (selectedPlayer === undefined || selectedClub === undefined) {
      throw new Error("Generated career has no selected-club negotiation participant");
    }
    const marketContractIds = pendingState.seniorSquadState.activeContractIds.filter(
      (contractId: string) => pendingState.seniorSquadState.contracts[contractId]?.clubId !== selectedClubId,
    );
    const transferContract = pendingState.seniorSquadState.contracts[marketContractIds[0]];
    const preliminaryContract = pendingState.seniorSquadState.contracts[marketContractIds[1]];
    if (transferContract === undefined || preliminaryContract === undefined) {
      throw new Error("Generated career has no external market participants");
    }
    const transferPlayer = pendingState.gameState.players[transferContract.playerId];
    const preliminaryPlayer = pendingState.gameState.players[preliminaryContract.playerId];
    if (transferPlayer === undefined || preliminaryPlayer === undefined) {
      throw new Error("Generated career has no external market players");
    }
    const negotiationId = "contract-negotiation:opfs-counteroffer";
    const negotiationCreatedOn = pendingState.gameState.calendar.currentDate;
    const responseDueOn = negotiationCreatedOn + 3;
    const offerTerms = {
      durationYears: 2,
      annualWage: selectedContract.annualWage,
      squadStatus: selectedContract.squadStatus,
      bonuses: {
        signingBonus: 500_000,
        appearanceBonus: 50_000,
        goalBonus: 25_000,
      },
    };
    const counterTerms = { ...offerTerms, annualWage: selectedContract.annualWage + 1_000_000 };
    pendingState.gameState.calendar.currentDate = responseDueOn;
    pendingState.contractNegotiationState = {
      negotiations: {
        [negotiationId]: {
          id: negotiationId,
          playerId: selectedContract.playerId,
          clubId: selectedClubId,
          currentContractId: selectedContractId,
          createdOn: negotiationCreatedOn,
          status: "countered",
          submittedOffer: {
            submittedOn: negotiationCreatedOn + 1,
            responseDueOn,
            terms: offerTerms,
          },
          counterOffer: {
            issuedOn: responseDueOn,
            expiresOn: responseDueOn + 14,
            terms: counterTerms,
            evaluation: {
              decision: "countered",
              scoreBasisPoints: 8_500,
              reasons: ["annual_wage_below_demand"],
              demand: {
                evaluatedOn: responseDueOn,
                age: 27,
                currentAbility: 10,
                publicPotentialP50Ability: 12,
                role: selectedPlayer.primaryRole,
                expectedSquadStatus: selectedContract.squadStatus,
                currentAnnualWage: selectedContract.annualWage,
                remainingContractDays: selectedContract.endsOn - responseDueOn,
                clubReputation: selectedClub.reputation,
                clubCategory: selectedClub.category,
                freeAgentLeverageBasisPoints: 0,
                preferredTerms: { ...counterTerms, annualWage: counterTerms.annualWage + 500_000 },
                minimumTerms: counterTerms,
              },
            },
          },
        },
      },
      negotiationIds: [negotiationId],
    };
    const transferNegotiationId = "transfer-negotiation:opfs-clock";
    const transferResponseDueOn = negotiationCreatedOn + 2;
    pendingState.transferNegotiationState = {
      negotiations: {
        [transferNegotiationId]: {
          id: transferNegotiationId,
          buyingClubId: selectedClubId,
          sellingClubId: transferContract.clubId,
          playerId: transferContract.playerId,
          publicValue: 900_000,
          initialAskingPrice: 1_100_000,
          currentAskingPrice: 1_100_000,
          status: "submitted",
          submittedOn: negotiationCreatedOn,
          offeredFee: 1_000_000,
          clock: {
            submittedOn: negotiationCreatedOn,
            responseDueOn: transferResponseDueOn,
            deadline: negotiationCreatedOn + 3,
          },
        },
      },
      negotiationIds: [transferNegotiationId],
    };
    const preliminaryAgreementId = "preliminary-agreement:opfs-clock";
    const preliminaryResponseDueOn = negotiationCreatedOn + 1;
    const preliminaryTerms = {
      ...offerTerms,
      squadStatus: preliminaryContract.squadStatus,
      annualWage: preliminaryContract.annualWage,
    };
    pendingState.preliminaryAgreementState = {
      agreements: {
        [preliminaryAgreementId]: {
          id: preliminaryAgreementId,
          playerId: preliminaryContract.playerId,
          currentClubId: preliminaryContract.clubId,
          offeringClubId: selectedClubId,
          currentContractId: preliminaryContract.id,
          createdOn: negotiationCreatedOn,
          futureStartsOn: preliminaryContract.endsOn,
          status: "offer_submitted",
          offeredTerms: preliminaryTerms,
          demand: {
            evaluatedOn: negotiationCreatedOn,
            age: 27,
            currentAbility: 10,
            publicPotentialP50Ability: 12,
            role: preliminaryPlayer.primaryRole,
            expectedSquadStatus: preliminaryContract.squadStatus,
            currentAnnualWage: preliminaryContract.annualWage,
            remainingContractDays: preliminaryContract.endsOn - negotiationCreatedOn,
            clubReputation: selectedClub.reputation,
            clubCategory: selectedClub.category,
            freeAgentLeverageBasisPoints: 0,
            preferredTerms: preliminaryTerms,
            minimumTerms: preliminaryTerms,
          },
          clock: {
            submittedOn: negotiationCreatedOn,
            responseDueOn: preliminaryResponseDueOn,
            deadline: negotiationCreatedOn + 3,
          },
        },
      },
      agreementIds: [preliminaryAgreementId],
    };
    pendingState.currentSeasonInbox = [{
      id: `inbox:contract-counteroffer:${negotiationId}`,
      date: responseDueOn,
      category: "contract_counteroffer",
      source: "contract_office",
      level: "blocking",
      continuePolicy: "until_resolved",
      lifecycle: { read: false, acknowledged: false, resolved: false },
      related: {
        clubId: selectedClubId,
        playerId: selectedContract.playerId,
        contractId: selectedContractId,
        contractNegotiationId: negotiationId,
      },
      blockerKeys: [],
      actionIds: ["open_contract_negotiation"],
    }];
    const archivedTableRow = {
      position: 1,
      clubId: selectedClubId,
      played: 2,
      wins: 2,
      draws: 0,
      losses: 0,
      goalsFor: 3,
      goalsAgainst: 1,
      goalDifference: 2,
      points: 6,
    };
    pendingState.seasonHistory = [{
      sequenceNumber: 1,
      seasonId: "season:opfs-archived",
      competitionId: "competition:opfs-archived",
      finalTable: [archivedTableRow],
      championClubId: selectedClubId,
      selectedClubFinish: archivedTableRow,
      aggregateGoals: { fixtureCount: 2, totalGoals: 4 },
      playerStatistics: {
        participationCoverage: "complete",
        eventCoverage: "partial",
        rows: [{
          playerId: "player:retired-opfs",
          starts: 2,
          substituteAppearances: 0,
          minutes: 180,
          ratingTotal: 13.7,
          ratingSamples: 2,
          goals: 2,
          assists: 1,
          saves: 0,
        }],
      },
    }];
    await firstHandle.storage.saveCareer({
      saveId: firstSaveId as never,
      name: firstCareer.metadata.name,
      state: pendingState as never,
    });
    const storageInfo = firstHandle.storageInfo;
    await firstHandle.close();

    const secondHandle = await createWebCareerStorage();
    const loaded = await secondHandle.storage.loadCareer(firstSaveId as never);
    const isolated = await secondHandle.storage.loadCareer(secondSaveId as never);
    const invalidReplacement = structuredClone(pendingState);
    const firstClubId = invalidReplacement.gameState.clubIds[0];
    if (firstClubId === undefined) throw new Error("Generated career has no club");
    const firstClub = invalidReplacement.gameState.clubs[firstClubId];
    const firstPlayerId = firstClub?.playerIds[0];
    if (firstClub === undefined || firstPlayerId === undefined) throw new Error("Generated career has no senior player");
    firstClub.playerIds = [firstPlayerId, firstPlayerId];

    let replacementFailed = false;
    try {
      await secondHandle.storage.saveCareer({
        saveId: firstSaveId as never,
        name: "Broken replacement",
        state: invalidReplacement as never,
      });
    } catch {
      replacementFailed = true;
    }

    const afterFailedReplacement = await secondHandle.storage.loadCareer(firstSaveId as never);
    const listed = await secondHandle.storage.listCareers();
    const loadedNegotiation = loaded.contractNegotiationState?.negotiations[negotiationId];
    const loadedTransferNegotiation = loaded.transferNegotiationState?.negotiations[transferNegotiationId];
    const loadedPreliminaryAgreement = loaded.preliminaryAgreementState?.agreements[preliminaryAgreementId];
    const loadedCounterMessage = loaded.currentSeasonInbox?.find(
      (message: { readonly related: { readonly contractNegotiationId?: string } }) => (
        message.related.contractNegotiationId === negotiationId
      ),
    );
    const selectedClubContractIds = loaded.seniorSquadState.contractIds.filter(
      (contractId: string) => loaded.seniorSquadState.contracts[contractId]?.clubId === selectedClubId,
    );
    const selectedClubAccount = loaded.clubFinanceState.accounts[selectedClubId];
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

    const canonical = (value: unknown): string => JSON.stringify(value, (_key, nested) => {
      if (nested === null || typeof nested !== "object" || Array.isArray(nested)) return nested;
      return Object.fromEntries(Object.entries(nested).sort(([left], [right]) => left.localeCompare(right)));
    });
    const response = {
      metadata: firstCareer.metadata,
      storageInfo,
      worldRoundTripExact: canonical(loaded) === canonical(pendingState),
      negotiationRoundTripExact: canonical(loadedNegotiation) === canonical(
        pendingState.contractNegotiationState.negotiations[negotiationId],
      ),
      archivedPlayerStatisticsRoundTripExact: canonical(loaded.seasonHistory?.[0]?.playerStatistics)
        === canonical(pendingState.seasonHistory[0]?.playerStatistics),
      counterContinuePolicy: loadedCounterMessage?.continuePolicy,
      counterResponseDueOn: loadedNegotiation?.status === "countered"
        ? loadedNegotiation.submittedOffer.responseDueOn
        : undefined,
      transferResponseDueOn: loadedTransferNegotiation?.status === "submitted"
        ? loadedTransferNegotiation.clock.responseDueOn
        : undefined,
      preliminaryResponseDueOn: loadedPreliminaryAgreement?.status === "offer_submitted"
        ? loadedPreliminaryAgreement.clock.responseDueOn
        : undefined,
      isolatedSeed: isolated.gameState.meta.seed,
      isolatedSaveCount: listed.filter((entry: { readonly saveId: string }) => (
        entry.saveId === firstSaveId || entry.saveId === secondSaveId
      )).length,
      replacementFailed,
      rollbackPreserved: canonical(afterFailedReplacement) === canonical(pendingState),
      selectedClubPlayerCount: loaded.gameState.clubs[selectedClubId]?.playerIds.length ?? 0,
      selectedClubRegistrationCount: loaded.seniorSquadState.registrationIds.filter(
        (registrationId: string) => loaded.seniorSquadState.registrations[registrationId]?.clubId === selectedClubId,
      ).length,
      selectedClubContractCount: selectedClubContractIds.length,
      activeContractCount: selectedClubContractIds.filter((contractId: string) => (
        loaded.seniorSquadState.activeContractIds.includes(contractId)
      )).length,
      selectedClubAccount,
      selectedClubLedgerEntries: loaded.clubFinanceState.ledgerEntryIds.filter(
        (ledgerId: string) => loaded.clubFinanceState.ledgerEntries[ledgerId]?.clubId === selectedClubId,
      ).length,
      opfsDatabaseExists,
      indexedDbNames,
      localCareerKeys,
      crossOriginIsolated,
    };

    await secondHandle.storage.deleteCareer(firstSaveId as never);
    await secondHandle.storage.deleteCareer(secondSaveId as never);
    await secondHandle.close();

    const futureMarker = "preserve-future-schema-v23";
    const futureSeed = await runSqliteFixtureTask({ kind: "seed", version: 23, marker: futureMarker });
    if (!futureSeed.ok) throw new Error(`Unable to seed SQLite future v23: ${futureSeed.message ?? "unknown error"}`);

    let futureSchemaRejected = false;
    let futureSchemaErrorCode: string | undefined;
    try {
      const unexpectedHandle = await createWebCareerStorage();
      await unexpectedHandle.close();
    } catch (error) {
      futureSchemaRejected = true;
      futureSchemaErrorCode = typeof error === "object"
        && error !== null
        && "code" in error
        && typeof error.code === "string"
        ? error.code
        : undefined;
    }
    const futureInspection = await runSqliteFixtureTask({ kind: "inspect" });
    if (!futureInspection.ok) {
      throw new Error(`Unable to inspect SQLite future v23: ${futureInspection.message ?? "unknown error"}`);
    }
    let futureDatabaseExists = false;
    try {
      await root.getFileHandle(databaseFileName);
      futureDatabaseExists = true;
    } catch {
      futureDatabaseExists = false;
    }
    await root.removeEntry(databaseFileName);

    return {
      ...response,
      futureSchemaRejected,
      futureSchemaErrorCode,
      futureSchemaVersion: futureInspection.version,
      futureSchemaMarker: futureInspection.marker,
      futureDatabaseExists,
    };
  }, { repoRoot: REPO_ROOT });

  expect(result.crossOriginIsolated).toBe(true);
  expect(result.metadata.name.length).toBeGreaterThan(0);
  expect(result.storageInfo).toMatchObject({ schemaVersion: 22, betaResetPerformed: true });
  expect(result.worldRoundTripExact).toBe(true);
  expect(result.negotiationRoundTripExact).toBe(true);
  expect(result.archivedPlayerStatisticsRoundTripExact).toBe(true);
  expect(result.counterContinuePolicy).toBe("until_resolved");
  expect(result.counterResponseDueOn).toBeGreaterThan(0);
  expect(result.transferResponseDueOn).toBeGreaterThan(0);
  expect(result.preliminaryResponseDueOn).toBeGreaterThan(0);
  expect(result.isolatedSeed).toBe("phase78-opfs-world-b");
  expect(result.isolatedSaveCount).toBe(2);
  expect(result.replacementFailed).toBe(true);
  expect(result.rollbackPreserved).toBe(true);
  expect(result.selectedClubRegistrationCount).toBe(result.selectedClubPlayerCount);
  expect(result.selectedClubContractCount).toBe(result.selectedClubPlayerCount);
  expect(result.activeContractCount).toBe(result.selectedClubPlayerCount);
  expect(result.selectedClubAccount?.currency).toBe("EUR");
  expect(result.selectedClubAccount?.cashBalance).toBeGreaterThan(0);
  expect(result.selectedClubLedgerEntries).toBeGreaterThan(0);
  expect(result.opfsDatabaseExists).toBe(true);
  expect(result.indexedDbNames.filter((name) => /career|save/i.test(name))).toEqual([]);
  expect(result.localCareerKeys).toEqual([]);
  expect(result.futureSchemaRejected).toBe(true);
  expect(result.futureSchemaErrorCode).toBe("unsupported_schema_version");
  expect(result.futureSchemaVersion).toBe(23);
  expect(result.futureSchemaMarker).toBe("preserve-future-schema-v23");
  expect(result.futureDatabaseExists).toBe(true);
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
