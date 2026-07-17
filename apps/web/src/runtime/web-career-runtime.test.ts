import { describe, expect, it } from "vitest";

import type {
  CareerAutosaveIntervalDays,
  CareerSaveMetadata,
  CareerStorage,
  SaveCareerInput,
} from "@game/storage";
import { SqliteCareerStorageError, StorageError } from "@game/storage/sqlite";
import { createMatchdayAttention, findNextCareerFixture } from "@game/engine";

import {
  applyMatchPreparationSelectionAction,
  buildDurableMatchPreparation,
  createMatchPreparationDraft,
  selectMatchPreparationTactic,
} from "../features/match-preparation/match-preparation-adapter";

import {
  WebCareerRuntime,
  buildWebCareerState,
  classifyWebCareerPersistenceFailure,
  inspectWebCareerAttention,
  type WebCareerSaveId,
  type WebCareerState,
} from "./web-career-runtime";

describe("WebCareerRuntime", () => {
  it("classifies persistence failures without exposing implementation prose", () => {
    expect(classifyWebCareerPersistenceFailure(
      new StorageError("storage_quota_exceeded", "raw quota implementation detail"),
    )).toEqual({ code: "storage_quota_exceeded" });
    expect(classifyWebCareerPersistenceFailure(
      new SqliteCareerStorageError("opfs_unavailable", "raw browser detail"),
    )).toEqual({ code: "storage_unavailable" });
    expect(classifyWebCareerPersistenceFailure({ code: "unsupported_bootstrap_state" })).toEqual({
      code: "unsupported_schema_version",
    });
    expect(classifyWebCareerPersistenceFailure(new Error("raw unknown detail"))).toEqual({ code: "unknown" });
  });

  it("builds the same validated world from the same explicit seed", () => {
    const identity = { saveId: "save:web-fixed" as WebCareerSaveId, worldSeed: "web-fixed-seed" };

    expect(buildWebCareerState(identity)).toEqual(buildWebCareerState(identity));
  });

  it("writes a generated career before returning it to the caller", async () => {
    const storage = new RecordingCareerStorage();
    const runtime = new WebCareerRuntime(storage, {
      createIdentity: () => ({ saveId: "save:web-created" as WebCareerSaveId, worldSeed: "web-created-seed" }),
    });

    const created = await runtime.createNewCareer();

    expect(storage.savedInputs).toHaveLength(1);
    expect(storage.savedInputs[0]?.state).toEqual(created.state);
    expect(created.state.careerWorld).toEqual({
      worldSeed: "web-created-seed",
      generatorVersion: 1,
      creationSourceKey: "career:web-new-world",
    });
    expect(created.state.currentSeasonInbox).toHaveLength(1);
    expect(created.state.currentSeasonInbox?.[0]).toMatchObject({
      category: "matchday",
      blockerKeys: [
        "missing_saved_lineup",
        "missing_bench_slot",
        "missing_bench_goalkeeper",
        "missing_saved_tactic",
      ],
    });
    expect(created.metadata.saveId).toBe("save:web-created");
  });

  it("delegates deterministic listing and selected save loading", async () => {
    const storage = new RecordingCareerStorage();
    const state = buildWebCareerState({ saveId: "save:web-loaded" as WebCareerSaveId, worldSeed: "web-loaded-seed" });
    storage.states.set(state.saveId, state);
    const runtime = new WebCareerRuntime(storage);

    expect((await runtime.listCareers()).map((entry) => entry.saveId)).toEqual([state.saveId]);
    const loaded = await runtime.loadCareer(state.saveId);

    expect(loaded.currentSeasonInbox).toHaveLength(1);
    expect(loaded.currentSeasonInbox?.[0]?.category).toBe("matchday");
    expect(runtime.careerSessionStatus()).toMatchObject({ dirty: true, autosaveIntervalDays: 7 });
    expect(storage.savedInputs).toHaveLength(0);
  });

  it("refreshes a delivered matchday action in place when a loaded preparation is complete", async () => {
    const storage = new RecordingCareerStorage();
    const generated = buildWebCareerState({
      saveId: "save:web-loaded-readiness" as WebCareerSaveId,
      worldSeed: "web-loaded-readiness-seed",
    });
    const nextFixture = findNextCareerFixture(generated);
    if (nextFixture.status !== "found") throw new Error("Expected selected-club fixture");
    const staleMessage = createMatchdayAttention({
      fixtureId: nextFixture.fixture.id,
      clubId: generated.selectedClubId,
      date: nextFixture.fixture.date,
      preparation: {
        hasSavedLineup: false,
        hasSavedTactic: false,
        hasCompleteBench: false,
        hasBenchGoalkeeper: false,
      },
    }).message;
    const state: WebCareerState = {
      ...generated,
      matchPreparation: completePreparation(generated),
      currentSeasonInbox: [staleMessage],
    };
    storage.states.set(state.saveId, state);
    const runtime = new WebCareerRuntime(storage);

    const loaded = await runtime.loadCareer(state.saveId);

    expect(storage.savedInputs).toHaveLength(0);
    expect(loaded.currentSeasonInbox).toHaveLength(1);
    expect(loaded.currentSeasonInbox?.[0]?.id).toBe(staleMessage.id);
    expect(loaded.currentSeasonInbox?.[0]?.blockerKeys).toEqual([]);
    expect(loaded.currentSeasonInbox?.[0]?.actionIds).toEqual(["open_matchday"]);
    expect(runtime.careerSessionStatus()?.dirty).toBe(true);
  });

  it("updates only the loaded session policy through the narrow storage operation", async () => {
    const storage = new RecordingCareerStorage();
    const state = buildWebCareerState({ saveId: "save:web-policy" as WebCareerSaveId, worldSeed: "web-policy-seed" });
    storage.states.set(state.saveId, state);
    const runtime = new WebCareerRuntime(storage);
    await runtime.loadCareer(state.saveId);

    const session = await runtime.updateAutosavePolicy(15);

    expect(session.autosaveIntervalDays).toBe(15);
    expect(session.dirty).toBe(true);
    expect(storage.savedInputs).toHaveLength(0);
  });

  it("rebuilds the same structured Posta attention from equal loaded careers", () => {
    const identity = { saveId: "save:web-attention" as WebCareerSaveId, worldSeed: "web-attention-seed" };

    const first = inspectWebCareerAttention(buildWebCareerState(identity));
    const second = inspectWebCareerAttention(buildWebCareerState(identity));

    expect(second).toEqual(first);
    expect(first.stopReason).toBe("attention");
    expect(first.inboxMessages[0]?.category).toBe("matchday");
    expect(first.inboxMessages[0]?.actions?.[0]?.actionId).toBe("prepare_match");
  });

  it("does not present a future fixture as current attention before Continue advances the clock", () => {
    const generated = buildWebCareerState({
      saveId: "save:web-current-attention" as WebCareerSaveId,
      worldSeed: "web-current-attention-seed",
    });
    const nextFixture = findNextCareerFixture(generated);
    if (nextFixture.status !== "found") throw new Error("Expected selected-club fixture");
    const currentDate = (nextFixture.fixture.date - 2) as typeof generated.gameState.calendar.currentDate;
    const state: WebCareerState = {
      ...generated,
      gameState: {
        ...generated.gameState,
        calendar: { ...generated.gameState.calendar, currentDate },
      },
    };

    const inspection = inspectWebCareerAttention(state);

    expect(inspection).toMatchObject({
      stopReason: "no_attention",
      daysAdvanced: 0,
      startDateIso: inspection.stopDateIso,
      inboxMessages: [],
    });
  });

  it("updates Continue in the working session without a durable write", async () => {
    const storage = new RecordingCareerStorage();
    const generated = buildWebCareerState({
      saveId: "save:web-continue" as WebCareerSaveId,
      worldSeed: "web-continue-seed",
    });
    const firstFixture = generated.gameState.fixtures[generated.gameState.fixtureIds[0]!];
    if (firstFixture === undefined) throw new Error("Expected generated first fixture");
    const state = {
      ...generated,
      gameState: {
        ...generated.gameState,
        calendar: {
          ...generated.gameState.calendar,
          currentDate: (firstFixture.date - 2) as typeof generated.gameState.calendar.currentDate,
        },
      },
    };
    storage.states.set(state.saveId, state);
    const runtime = new WebCareerRuntime(storage);
    await runtime.loadCareer(state.saveId);

    const continued = await runtime.continueCareer(state.saveId);

    expect(storage.savedInputs).toHaveLength(0);
    expect(continued.state.gameState.calendar.currentDate).toBe(firstFixture.date);
    expect(continued.sessionStatus.dirty).toBe(true);
    expect(continued.continueResult.stopReason).toBe("attention");
    expect(continued.continueResult.daysAdvanced).toBe(2);
    expect(continued.state.currentSeasonInbox).toHaveLength(1);
  });

  it("keeps one stable matchday message across repeated Continue commands", async () => {
    const storage = new RecordingCareerStorage();
    const state = buildWebCareerState({
      saveId: "save:web-repeat-continue" as WebCareerSaveId,
      worldSeed: "web-repeat-continue-seed",
    });
    storage.states.set(state.saveId, state);
    const runtime = new WebCareerRuntime(storage);
    await runtime.loadCareer(state.saveId);

    const first = await runtime.continueCareer(state.saveId);
    const second = await runtime.continueCareer(state.saveId);

    expect(first.state.currentSeasonInbox).toHaveLength(1);
    expect(second.state.currentSeasonInbox).toHaveLength(1);
    expect(second.state.currentSeasonInbox?.[0]?.id).toBe(first.state.currentSeasonInbox?.[0]?.id);
    expect(storage.savedInputs).toHaveLength(0);
  });

  it("opens and acknowledges important Posta in the dirty session without writing storage", async () => {
    const storage = new RecordingCareerStorage();
    const generated = buildWebCareerState({
      saveId: "save:web-open-inbox" as WebCareerSaveId,
      worldSeed: "web-open-inbox-seed",
    });
    const firstFixtureId = generated.gameState.fixtureIds[0];
    if (firstFixtureId === undefined) throw new Error("Expected generated first fixture");
    const messageId = `inbox:matchday:${firstFixtureId}:important` as NonNullable<
      WebCareerState["currentSeasonInbox"]
    >[number]["id"];
    const importantMessage: NonNullable<WebCareerState["currentSeasonInbox"]>[number] = {
      id: messageId,
      date: generated.gameState.calendar.currentDate,
      category: "matchday",
      source: "technical_staff",
      level: "important",
      lifecycle: { read: false, acknowledged: false, resolved: false },
      related: { fixtureId: firstFixtureId, clubId: generated.selectedClubId },
      blockerKeys: [],
      actionIds: [],
    };
    const state: WebCareerState = {
      ...generated,
      currentSeasonInbox: [importantMessage],
    };
    storage.states.set(state.saveId, state);
    const runtime = new WebCareerRuntime(storage);
    await runtime.loadCareer(state.saveId);

    const opened = await runtime.openInboxMessage(state.saveId, messageId);

    expect(storage.savedInputs).toHaveLength(0);
    expect(opened.sessionStatus.dirty).toBe(true);
    expect(opened.state.currentSeasonInbox?.find((message) => message.id === messageId)?.lifecycle).toEqual({
      read: true,
      acknowledged: true,
      resolved: false,
    });
  });

  it("autosaves once when Continue reaches the exact seven-day safe boundary", async () => {
    const storage = new RecordingCareerStorage();
    const generated = buildWebCareerState({
      saveId: "save:web-autosave-seven" as WebCareerSaveId,
      worldSeed: "web-autosave-seven-seed",
    });
    const firstFixture = generated.gameState.fixtures[generated.gameState.fixtureIds[0]!];
    if (firstFixture === undefined) throw new Error("Expected generated first fixture");
    const state = withTestDate(generated, firstFixture.date - 7);
    storage.states.set(state.saveId, state);
    const runtime = new WebCareerRuntime(storage);
    await runtime.loadCareer(state.saveId);

    const continued = await runtime.continueCareer(state.saveId);

    expect(storage.savedInputs).toHaveLength(1);
    expect(continued.sessionStatus).toMatchObject({
      dirty: false,
      lastPersistedGameDate: firstFixture.date,
      autosavePostponed: false,
    });
  });

  it("keeps manual-only sessions dirty until an explicit manual save", async () => {
    const storage = new RecordingCareerStorage();
    const generated = buildWebCareerState({
      saveId: "save:web-manual-only" as WebCareerSaveId,
      worldSeed: "web-manual-only-seed",
    });
    const firstFixture = generated.gameState.fixtures[generated.gameState.fixtureIds[0]!];
    if (firstFixture === undefined) throw new Error("Expected generated first fixture");
    const state = withTestDate(generated, firstFixture.date - 20);
    storage.states.set(state.saveId, state);
    storage.policies.set(state.saveId, null);
    const runtime = new WebCareerRuntime(storage);
    await runtime.loadCareer(state.saveId);

    const continued = await runtime.continueCareer(state.saveId);
    expect(storage.savedInputs).toHaveLength(0);
    expect(continued.sessionStatus.dirty).toBe(true);

    const committed = await runtime.saveCareerNow(state.saveId);
    expect(storage.savedInputs).toHaveLength(1);
    expect(committed.sessionStatus).toMatchObject({
      dirty: false,
      autosaveIntervalDays: null,
      lastPersistedGameDate: firstFixture.date,
    });
  });

  it("commits a complete preparation only with the explicit manual save", async () => {
    const storage = new RecordingCareerStorage();
    const state = buildWebCareerState({
      saveId: "save:web-manual-preparation" as WebCareerSaveId,
      worldSeed: "web-manual-preparation-seed",
    });
    const preparation = completePreparation(state);
    storage.states.set(state.saveId, state);
    const runtime = new WebCareerRuntime(storage);
    await runtime.loadCareer(state.saveId);

    expect(storage.savedInputs).toHaveLength(0);
    const committed = await runtime.saveCareerNow(state.saveId, preparation);

    expect(storage.savedInputs).toHaveLength(1);
    expect(storage.savedInputs[0]?.state.matchPreparation).toEqual(preparation);
    expect(committed.state.matchPreparation).toEqual(preparation);
    expect(committed.sessionStatus.dirty).toBe(false);
  });

  it("preserves working state and the old baseline when a due autosave fails", async () => {
    const storage = new RecordingCareerStorage();
    const generated = buildWebCareerState({
      saveId: "save:web-autosave-failure" as WebCareerSaveId,
      worldSeed: "web-autosave-failure-seed",
    });
    const firstFixture = generated.gameState.fixtures[generated.gameState.fixtureIds[0]!];
    if (firstFixture === undefined) throw new Error("Expected generated first fixture");
    const state = withTestDate(generated, firstFixture.date - 7);
    storage.states.set(state.saveId, state);
    const runtime = new WebCareerRuntime(storage);
    await runtime.loadCareer(state.saveId);
    storage.failNextSave = true;

    await expect(runtime.continueCareer(state.saveId)).rejects.toThrow("Test save failure");

    expect(storage.savedInputs).toHaveLength(1);
    expect(runtime.careerSessionStatus()).toMatchObject({
      dirty: true,
      lastPersistedGameDate: state.gameState.calendar.currentDate,
    });
    const committed = await runtime.saveCareerNow(state.saveId);
    expect(committed.state.gameState.calendar.currentDate).toBe(firstFixture.date);
    expect(committed.sessionStatus.dirty).toBe(false);
  });

  it("opens pre-match from session-owned preparation without a durable write", async () => {
    const storage = new RecordingCareerStorage();
    const state = buildWebCareerState({
      saveId: "save:web-preparation" as WebCareerSaveId,
      worldSeed: "web-preparation-seed",
    });
    const matchPreparation = completePreparation(state);
    storage.states.set(state.saveId, state);
    const runtime = new WebCareerRuntime(storage);
    await runtime.loadCareer(state.saveId);
    const stopped = await runtime.continueCareer(state.saveId);
    const messageId = stopped.state.currentSeasonInbox?.[0]?.id;

    const saved = await runtime.saveMatchPreparation(state.saveId, matchPreparation);

    expect(storage.savedInputs).toHaveLength(0);
    expect(saved.state.matchPreparation).toEqual(matchPreparation);
    expect(saved.state.activeMatchCheckpoint?.phase).toBe("pre_match");
    expect(saved.continueResult.stopReason).toBe("attention");
    expect(saved.state.currentSeasonInbox).toHaveLength(1);
    expect(saved.state.currentSeasonInbox?.[0]?.id).toBe(messageId);
    expect(saved.state.currentSeasonInbox?.[0]?.actionIds).toEqual(["open_matchday"]);
  });

  it("creates a checkpoint when reopening an already confirmed match preparation", async () => {
    const storage = new RecordingCareerStorage();
    const generated = buildWebCareerState({
      saveId: "save:web-reopen-prepared" as WebCareerSaveId,
      worldSeed: "web-reopen-prepared-seed",
    });
    const state = { ...generated, matchPreparation: completePreparation(generated) };
    storage.states.set(state.saveId, state);
    const runtime = new WebCareerRuntime(storage);
    await runtime.loadCareer(state.saveId);

    const entered = runtime.openPreparedMatchday(state.saveId);

    expect(entered.state.activeMatchCheckpoint?.fixtureId).toBe(state.matchPreparation.targetFixtureId);
    expect(entered.state.activeMatchCheckpoint?.phase).toBe("pre_match");
    expect(entered.matchdayState.stagedProgress?.snapshot.phase).toBe("pre_match");
  });

  it("keeps a complete deterministic match journey in memory until an explicit save", async () => {
    const storage = new RecordingCareerStorage();
    const state = buildWebCareerState({
      saveId: "save:web-matchday" as WebCareerSaveId,
      worldSeed: "web-matchday-seed",
    });
    storage.states.set(state.saveId, state);
    const runtime = new WebCareerRuntime(storage);
    await runtime.loadCareer(state.saveId);
    await runtime.continueCareer(state.saveId);
    await runtime.saveMatchPreparation(state.saveId, completePreparation(state));
    const halfTime = await runtime.progressMatchdayToHalfTime(state.saveId);
    const firstCheckpoint = structuredClone(halfTime.state.activeMatchCheckpoint);
    const repeatedHalfTime = await runtime.progressMatchdayToHalfTime(state.saveId);
    const halfTimeDraft = createMatchPreparationDraft(halfTime.state);

    expect(halfTime.state.activeMatchCheckpoint?.phase).toBe("half_time");
    expect(repeatedHalfTime.state.activeMatchCheckpoint).toEqual(firstCheckpoint);
    expect(storage.savedInputs).toHaveLength(0);
    const completed = await runtime.completeMatchday(state.saveId, halfTimeDraft);
    const playedFixture = completed.matchdayState.playedResult?.fixtureAfter;

    expect(storage.savedInputs).toHaveLength(0);
    expect(completed.state.activeMatchCheckpoint).toBeUndefined();
    expect(playedFixture?.result?.played).toBe(true);
    expect(playedFixture?.result?.report).toEqual(completed.matchdayState.playedResult?.report);
    expect(completed.state.currentSeasonInbox?.[0]?.lifecycle.resolved).toBe(true);

    const acknowledged = await runtime.acknowledgeMatchday(state.saveId);
    expect(acknowledged.sessionStatus.dirty).toBe(true);
    expect(storage.savedInputs).toHaveLength(0);

    const reloaded = await runtime.loadCareer(state.saveId);
    expect(reloaded.gameState.fixtures[playedFixture!.id]?.result).toBeUndefined();
  });

  it("carries the previous team plan into the next fixture without treating it as confirmed", async () => {
    const storage = new RecordingCareerStorage();
    const state = buildWebCareerState({
      saveId: "save:web-second-fixture" as WebCareerSaveId,
      worldSeed: "web-second-fixture-seed",
    });
    const firstPreparation = completePreparation(state);
    storage.states.set(state.saveId, state);
    const runtime = new WebCareerRuntime(storage);
    await runtime.loadCareer(state.saveId);
    await runtime.continueCareer(state.saveId);
    await runtime.saveMatchPreparation(state.saveId, firstPreparation);
    const halfTime = await runtime.progressMatchdayToHalfTime(state.saveId);
    const completed = await runtime.completeMatchday(
      state.saveId,
      createMatchPreparationDraft(halfTime.state),
    );
    const firstFixtureId = completed.matchdayState.playedResult?.fixtureId;
    if (firstFixtureId === undefined) throw new Error("Expected completed first fixture");

    const acknowledged = await runtime.acknowledgeMatchday(state.saveId);
    const carriedDraft = createMatchPreparationDraft(acknowledged.state);

    expect(acknowledged.state.matchPreparation).not.toHaveProperty("targetFixtureId");
    expect(acknowledged.state.matchPreparation?.selectedLineup).toEqual(firstPreparation.selectedLineup);
    expect(carriedDraft.selectedPlayerIdsBySlot).toEqual(
      Object.fromEntries(firstPreparation.selectedLineup!.slots.map((slot) => [slot.slotKey, slot.playerId])),
    );
    expect(carriedDraft.isSaved).toBe(false);

    const continued = await runtime.continueCareer(state.saveId);
    const nextFixture = findNextCareerFixture(continued.state);
    if (nextFixture.status !== "found") throw new Error("Expected second selected-club fixture");

    expect(nextFixture.fixture.id).not.toBe(firstFixtureId);
    const selectedMessage = continued.continueResult.inboxMessages.find(
      (message) => message.messageId === continued.continueResult.selectedMessageId,
    );
    expect(selectedMessage?.actions?.[0]?.actionId).toBe("prepare_match");
    expect(continued.state.currentSeasonInbox?.find(
      (message) => String(message.id) === continued.continueResult.selectedMessageId,
    )?.blockerKeys).toEqual([
      "missing_saved_lineup",
      "missing_bench_slot",
      "missing_bench_goalkeeper",
      "missing_saved_tactic",
    ]);

    const secondPreparation = buildDurableMatchPreparation(continued.state, createMatchPreparationDraft(continued.state));
    if (secondPreparation === undefined) throw new Error("Expected reusable second-fixture preparation");
    expect(secondPreparation.targetFixtureId).toBe(nextFixture.fixture.id);

    const entered = await runtime.saveMatchPreparation(state.saveId, secondPreparation);
    expect(entered.state.activeMatchCheckpoint?.fixtureId).toBe(nextFixture.fixture.id);
    await expect(runtime.progressMatchdayToHalfTime(state.saveId)).resolves.toMatchObject({
      matchdayState: { lastStagedAttempt: { status: "at_half_time" } },
    });
  });
});

/** Uses the same public adapter actions as the manager-facing preparation screen. */
function completePreparation(career: WebCareerState): NonNullable<WebCareerState["matchPreparation"]> {
  const auto = applyMatchPreparationSelectionAction(career, createMatchPreparationDraft(career), "auto");
  const draft = selectMatchPreparationTactic(auto, "tactic:balanced");
  const preparation = buildDurableMatchPreparation(career, draft);
  if (preparation === undefined) throw new Error("Expected complete generated match preparation");
  return preparation;
}

/** Minimal recording adapter used to test runtime orchestration, not SQLite. */
class RecordingCareerStorage implements CareerStorage {
  public readonly savedInputs: SaveCareerInput[] = [];
  public readonly states = new Map<WebCareerSaveId, WebCareerState>();
  public readonly policies = new Map<WebCareerSaveId, CareerAutosaveIntervalDays>();
  public failNextSave = false;

  public async saveCareer(input: SaveCareerInput): Promise<CareerSaveMetadata> {
    this.savedInputs.push(input);
    if (this.failNextSave) {
      this.failNextSave = false;
      throw new Error("Test save failure");
    }
    this.states.set(input.saveId, input.state);
    return metadata(input.saveId, input.name, this.policyFor(input.saveId));
  }

  public async loadCareer(requestedSaveId: WebCareerSaveId): Promise<WebCareerState> {
    const state = this.states.get(requestedSaveId);
    if (state === undefined) throw new Error(`Missing test career: ${requestedSaveId}`);
    return state;
  }

  public async listCareers(): Promise<readonly CareerSaveMetadata[]> {
    return [...this.states.values()].map((state) => metadata(
      state.saveId,
      state.gameState.clubs[state.selectedClubId]?.name ?? "Test club",
      this.policyFor(state.saveId),
    ));
  }

  public async updateAutosavePolicy(
    saveId: WebCareerSaveId,
    autosaveIntervalDays: CareerAutosaveIntervalDays,
  ): Promise<CareerSaveMetadata> {
    const state = this.states.get(saveId);
    if (state === undefined) throw new Error(`Missing test career: ${saveId}`);
    this.policies.set(saveId, autosaveIntervalDays);
    return metadata(saveId, state.gameState.clubs[state.selectedClubId]?.name ?? "Test club", autosaveIntervalDays);
  }

  public async deleteCareer(requestedSaveId: WebCareerSaveId): Promise<void> {
    this.states.delete(requestedSaveId);
  }

  private policyFor(saveId: WebCareerSaveId): CareerAutosaveIntervalDays {
    return this.policies.has(saveId) ? this.policies.get(saveId)! : 7;
  }
}

function withTestDate(
  state: WebCareerState,
  currentDate: number,
): WebCareerState {
  return {
    ...state,
    gameState: {
      ...state.gameState,
      calendar: {
        ...state.gameState.calendar,
        currentDate: currentDate as WebCareerState["gameState"]["calendar"]["currentDate"],
      },
    },
  };
}

/** Builds deterministic metadata for the recording adapter. */
function metadata(
  id: WebCareerSaveId,
  name: string,
  autosaveIntervalDays: CareerAutosaveIntervalDays = 7,
): CareerSaveMetadata {
  return {
    saveId: id,
    name,
    createdAtISO: "2026-07-13T10:00:00.000Z",
    updatedAtISO: "2026-07-13T10:00:00.000Z",
    saveSchemaVersion: 1,
    autosaveIntervalDays,
  };
}
