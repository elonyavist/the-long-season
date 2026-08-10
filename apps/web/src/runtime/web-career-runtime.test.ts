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
  selectMatchPreparationBenchPlayer,
  selectMatchPreparationPlayer,
  selectMatchPreparationTactic,
} from "../features/match-preparation/match-preparation-adapter";

import {
  WebCareerRuntime,
  type AdvancedWebMatchdayMinute,
  buildWebCareerState,
  classifyWebCareerPersistenceFailure,
  inspectWebCareerAttention,
  rolloverCompletedWebCareerSeason,
  type WebCareerInboxMessageId,
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

  it("builds the canonical three-division topology and stable identity hash", () => {
    const state = buildWebCareerState({
      saveId: "save:web-shared-hash" as WebCareerSaveId,
      worldSeed: "shared-three-division-seed",
    });

    expect(state.selectedClubId).toBe("club:ita-3-01");
    expect(state.gameState.clubIds).toHaveLength(54);
    expect(state.gameState.fixtureIds).toHaveLength(918);
    expect(state.gameState.domesticCompetitionWorld?.competitionIds).toEqual([
      "competition:ita-1",
      "competition:ita-2",
      "competition:ita-3",
    ]);
    // RE-RECORDED for Phase 81A squad identities and Step 06A's competition-
    // balanced assignment and v10 projection bundle:
    // `b12d5dd0` -> `620ad19b` -> `f1527230` -> `958f692d` -> `0268597d` -> `aca4502a` -> `ee653cba` -> `cf92db55` -> `da43409b`.
    // The last move is Step 06B16's v9 market policy and soft academy blueprint.
    // The other half of this record lives in `apps/cli/src/commands/career.test.ts`
    // and carries the account. Both were changed in the same edit: a pair that
    // proves CLI and web agree proves nothing if one side is updated alone.
    expect(canonicalCareerIdentityHash(state)).toBe("da43409b");
  });

  it("publishes one completed three-division boundary atomically and deterministically", () => {
    const generated = buildWebCareerState({
      saveId: "save:web-rollover" as WebCareerSaveId,
      worldSeed: "web-rollover-seed",
    });
    const completed = completeWebCareerSeason(generated);
    const first = rolloverCompletedWebCareerSeason(completed);
    const repeated = rolloverCompletedWebCareerSeason(completed);

    expect(first).toEqual(repeated);
    expect(first.status).toBe("advanced");
    if (first.status !== "advanced") throw new Error("Expected completed season rollover");
    expect(first.careerState.gameState.calendar.currentSeasonId).toBe("season:2027");
    expect(first.careerState.gameState.fixtureIds).toHaveLength(1_836);
    expect(first.careerState.gameState.domesticCompetitionWorld?.seasonHistory).toHaveLength(3);
    expect(first.facts.competitionMovements).toHaveLength(10);
    expect(first.facts.youthIntake.acceptedPlayerCount).toBe(
      first.facts.youthIntake.candidateCount,
    );
    expect(first.facts.youthIntake.skippedPlayerCount).toBe(0);
    expect(first.facts.youthIntake.acceptedPlayerIds).toHaveLength(
      first.facts.youthIntake.acceptedPlayerCount,
    );
    expect(first.careerState.gameState.domesticCompetitionWorld?.competitions[
      "competition:ita-2" as keyof NonNullable<
        WebCareerState["gameState"]["domesticCompetitionWorld"]
      >["competitions"]
    ]?.clubIds).toContain(generated.selectedClubId);
    expect(first.careerState.selectedClubId).toBe(generated.selectedClubId);
    const promotedFixture = findNextCareerFixture(first.careerState);
    expect(promotedFixture.status).toBe("found");
    if (promotedFixture.status !== "found") throw new Error("Expected promoted-club fixture");
    expect(promotedFixture.fixture.competitionId).toBe("competition:ita-2");

    const secondBoundary = rolloverCompletedWebCareerSeason(
      completeWebCareerSeason(first.careerState),
    );
    expect(secondBoundary.status).toBe("advanced");
    if (secondBoundary.status !== "advanced") throw new Error("Expected second season rollover");
    expect(secondBoundary.careerState.gameState.calendar.currentSeasonId).toBe("season:2028");
    expect(secondBoundary.careerState.gameState.domesticCompetitionWorld?.seasonHistory).toHaveLength(6);
    expect(secondBoundary.careerState.gameState.domesticCompetitionWorld?.competitionIds.map(
      (competitionId) =>
        secondBoundary.careerState.gameState.domesticCompetitionWorld?.competitions[
          competitionId
        ]?.clubIds.length,
    )).toEqual([18, 18, 18]);
    const secondPromotedFixture = findNextCareerFixture(secondBoundary.careerState);
    expect(secondPromotedFixture.status).toBe("found");
    if (secondPromotedFixture.status !== "found") {
      throw new Error("Expected twice-promoted club fixture");
    }
    expect(secondPromotedFixture.fixture.competitionId).toBe("competition:ita-1");
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

  it("deletes only the loaded beta career with a mismatched calibration version", async () => {
    const storage = new RecordingCareerStorage();
    const generated = buildWebCareerState({
      saveId: "save:web-version-mismatch" as WebCareerSaveId,
      worldSeed: "web-version-mismatch",
    });
    const state = {
      ...generated,
      gameState: {
        ...generated.gameState,
        meta: {
          ...generated.gameState.meta,
          calibrationVersions: {
            ...generated.gameState.meta.calibrationVersions,
            playerRatingScaleVersion: "player-rating-scale-v1",
          },
        },
      },
    } as WebCareerState;
    const compatible = buildWebCareerState({
      saveId: "save:web-version-compatible" as WebCareerSaveId,
      worldSeed: "web-version-compatible",
    });
    storage.states.set(state.saveId, state);
    storage.states.set(compatible.saveId, compatible);
    const runtime = new WebCareerRuntime(storage);

    await expect(runtime.loadCareer(state.saveId)).rejects.toMatchObject({
      name: "StorageError",
      code: "unsupported_schema_version",
    });
    expect(storage.states.has(state.saveId)).toBe(false);
    expect(storage.states.has(compatible.saveId)).toBe(true);
    await expect(runtime.loadCareer(compatible.saveId)).resolves.toEqual(
      expect.objectContaining({ saveId: compatible.saveId }),
    );
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
      continuePolicy: "until_acknowledged",
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

  it("routes selected-club contract decisions through one memory-only command seam", async () => {
    const storage = new RecordingCareerStorage();
    const state = buildWebCareerState({
      saveId: "save:web-contract-command" as WebCareerSaveId,
      worldSeed: "web-contract-command-seed",
    });
    const contract = state.seniorSquadState?.activeContractIds
      .map((id) => state.seniorSquadState?.contracts[id])
      .find((candidate) => candidate?.clubId === state.selectedClubId);
    if (contract === undefined) throw new Error("Expected selected-club active contract");
    storage.states.set(state.saveId, state);
    const runtime = new WebCareerRuntime(storage);
    await runtime.loadCareer(state.saveId);

    const offered = runtime.applySelectedClubContractCommand(state.saveId, {
      type: "offer_renewal",
      playerId: contract.playerId,
      terms: {
        durationYears: 2,
        annualWage: contract.annualWage,
        squadStatus: contract.squadStatus,
        bonuses: contract.bonuses,
      },
    });

    expect(offered.status).toBe("applied");
    if (offered.status !== "applied") throw new Error("Expected applied renewal offer");
    expect(offered.negotiation).toMatchObject({
      playerId: contract.playerId,
      clubId: state.selectedClubId,
      status: "awaiting_response",
    });
    expect(offered.sessionStatus.dirty).toBe(true);
    expect(storage.savedInputs).toHaveLength(0);

    const withdrawn = runtime.applySelectedClubContractCommand(state.saveId, {
      type: "withdraw_offer",
      negotiationId: offered.negotiation.id,
    });
    expect(withdrawn.status).toBe("applied");
    if (withdrawn.status !== "applied") throw new Error("Expected withdrawn renewal offer");
    expect(withdrawn.negotiation.status).toBe("withdrawn");

    const released = runtime.applySelectedClubContractCommand(state.saveId, {
      type: "release_at_expiry",
      playerId: contract.playerId,
    });
    expect(released.status).toBe("applied");
    if (released.status !== "applied") throw new Error("Expected release-at-expiry decision");
    expect(released.negotiation.status).toBe("release_at_expiry");
    expect(released.state.seniorSquadState?.activeContractIds).toContain(contract.id);
    expect(storage.savedInputs).toHaveLength(0);
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
    expect(saved.matchdayState.liveProgress?.snapshot.phase).toBe("pre_match");
    expect(saved.continueResult.stopReason).toBe("attention");
    expect(saved.state.currentSeasonInbox).toHaveLength(1);
    expect(saved.state.currentSeasonInbox?.[0]?.id).toBe(messageId);
    expect(saved.state.currentSeasonInbox?.[0]?.actionIds).toEqual(["open_matchday"]);
  });

  it("creates a fresh memory-only session when reopening confirmed preparation", async () => {
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

    expect(entered.matchdayState.liveProgress?.fixtureBefore.id).toBe(state.matchPreparation.targetFixtureId);
    expect(entered.matchdayState.liveProgress?.snapshot.phase).toBe("pre_match");
  });

  it("publishes a narrow live tick without rebuilding global career context", async () => {
    const storage = new RecordingCareerStorage();
    const generated = buildWebCareerState({
      saveId: "save:web-live-tick" as WebCareerSaveId,
      worldSeed: "web-live-tick-seed",
    });
    const state = { ...generated, matchPreparation: completePreparation(generated) };
    storage.states.set(state.saveId, state);
    const runtime = new WebCareerRuntime(storage);
    await runtime.loadCareer(state.saveId);
    runtime.openPreparedMatchday(state.saveId);
    runtime.resumeMatchday(state.saveId);

    const tick = runtime.advanceMatchdayMinute(state.saveId);

    expect(tick.status).toBe("live");
    expect(tick.matchdayState.liveProgress?.snapshot.currentMinute).toBe(1);
    expect(tick).not.toHaveProperty("metadata");
    expect(tick).not.toHaveProperty("continueResult");
    expect(tick).not.toHaveProperty("sessionStatus");
  });

  it("keeps a complete deterministic match journey private until full-time Continue", async () => {
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
    const halfTime = advanceRuntimeToPhase(runtime, state.saveId, "half_time");
    const halfTimeDraft = createMatchPreparationDraft(halfTime.matchdayState.careerState);

    expect(halfTime.matchdayState.liveProgress?.snapshot.phase).toBe("half_time");
    expect(storage.savedInputs).toHaveLength(0);
    const completed = advanceRuntimeToPhase(runtime, state.saveId, "full_time", halfTimeDraft);
    const playedFixture = completed.matchdayState.liveProgress?.fixtureBefore;

    expect(storage.savedInputs).toHaveLength(0);
    expect(completed.matchdayState.playedResult).toBeUndefined();
    expect(completed.matchdayState.liveProgress?.snapshot.phase).toBe("full_time");
    expect(playedFixture?.result).toBeUndefined();
    expect(completed).not.toHaveProperty("metadata");
    expect(completed).not.toHaveProperty("continueResult");
    expect(completed).not.toHaveProperty("sessionStatus");
    expect(completed.matchdayState.careerState.gameState.fixtures[playedFixture!.id]?.result).toBeUndefined();
    expect(completed.matchdayState.careerState.currentSeasonInbox?.[0]?.lifecycle.resolved).toBe(false);

    const acknowledged = await runtime.acknowledgeMatchday(state.saveId);
    expect(acknowledged.state.gameState.fixtures[playedFixture!.id]?.result?.played).toBe(true);
    expect(acknowledged.state.currentSeasonInbox?.[0]?.lifecycle.resolved).toBe(true);
    expect(acknowledged.sessionStatus.dirty).toBe(true);
    expect(storage.savedInputs).toHaveLength(0);

    const reloaded = await runtime.loadCareer(state.saveId);
    expect(reloaded.gameState.fixtures[playedFixture!.id]?.result).toBeUndefined();
  });

  it("keeps the full-time session retryable when a due autosave fails", async () => {
    const storage = new RecordingCareerStorage();
    const generated = buildWebCareerState({
      saveId: "save:web-matchday-commit-retry" as WebCareerSaveId,
      worldSeed: "web-matchday-commit-retry-seed",
    });
    const firstFixture = generated.gameState.fixtures[generated.gameState.fixtureIds[0]!];
    if (firstFixture === undefined) throw new Error("Expected generated first fixture");
    const state = withTestDate(generated, firstFixture.date - 7);
    storage.states.set(state.saveId, state);
    storage.policies.set(state.saveId, null);
    const runtime = new WebCareerRuntime(storage);
    await runtime.loadCareer(state.saveId);
    await runtime.continueCareer(state.saveId);
    await runtime.saveMatchPreparation(state.saveId, completePreparation(state));
    const completed = advanceRuntimeToPhase(runtime, state.saveId, "full_time");
    const fixtureId = completed.matchdayState.liveProgress?.fixtureBefore.id;
    if (fixtureId === undefined) throw new Error("Expected completed fixture");
    await runtime.updateAutosavePolicy(7);
    storage.failNextSave = true;

    await expect(runtime.acknowledgeMatchday(state.saveId)).rejects.toThrow("Test save failure");

    expect(runtime.careerSessionStatus()).toMatchObject({ dirty: true });
    const retried = await runtime.acknowledgeMatchday(state.saveId);
    expect(retried.state.gameState.fixtures[fixtureId]?.result?.played).toBe(true);
    expect(retried.matchdayState.liveProgress).toBeUndefined();
    expect(storage.savedInputs).toHaveLength(2);
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
    const halfTime = advanceRuntimeToPhase(runtime, state.saveId, "half_time");
    const completed = advanceRuntimeToPhase(
      runtime,
      state.saveId,
      "full_time",
      createMatchPreparationDraft(halfTime.matchdayState.careerState),
    );
    const firstFixtureId = completed.matchdayState.liveProgress?.fixtureBefore.id;
    if (firstFixtureId === undefined) throw new Error("Expected completed first fixture");

    const acknowledged = await runtime.acknowledgeMatchday(state.saveId);
    const carriedDraft = createMatchPreparationDraft(acknowledged.state);

    expect(acknowledged.state.matchPreparation).not.toHaveProperty("targetFixtureId");
    expect(acknowledged.state.matchPreparation?.selectedLineup).toEqual(firstPreparation.selectedLineup);
    expect(Object.values(carriedDraft.selectedPlayerIdsBySlot)).not.toEqual([]);
    expect(firstPreparation.selectedLineup!.slots.every(
      (slot) => carriedDraft.selectedPlayerIdsBySlot[slot.slotKey] === slot.playerId,
    )).toBe(true);
    expect(acknowledged.state.matchPreparation?.benchSlots?.every(
      (slot) => carriedDraft.selectedBenchPlayerIdsBySlot[slot.slotKey] === slot.playerId,
    )).toBe(true);
    expect(carriedDraft.isSaved).toBe(false);

    const firstContinue = await runtime.continueCareer(state.saveId);
    const attentionMessageId = firstContinue.continueResult.selectedMessageId;
    if (attentionMessageId !== undefined) {
      await runtime.openInboxMessage(state.saveId, attentionMessageId as WebCareerInboxMessageId);
    }
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

    const reconciledSecondDraft = createMatchPreparationDraft(continued.state);
    const selectedPlayerIds = new Set([
      ...Object.values(reconciledSecondDraft.selectedPlayerIdsBySlot),
      ...Object.values(reconciledSecondDraft.selectedBenchPlayerIdsBySlot),
    ]);
    const suspendedPlayerId = continued.state.playerAvailability?.suspensions.find(
      (entry) => selectedPlayerIds.has(entry.playerId),
    )?.playerId;
    if (suspendedPlayerId !== undefined) {
      expect([
        ...Object.values(reconciledSecondDraft.selectedPlayerIdsBySlot),
        ...Object.values(reconciledSecondDraft.selectedBenchPlayerIdsBySlot),
      ]).toContain(suspendedPlayerId);
    }
    let managerEditedSecondDraft = reconciledSecondDraft;
    if (suspendedPlayerId !== undefined) {
      const lineupSlot = Object.entries(managerEditedSecondDraft.selectedPlayerIdsBySlot)
        .find(([, playerId]) => playerId === suspendedPlayerId)?.[0];
      const benchSlot = Object.entries(managerEditedSecondDraft.selectedBenchPlayerIdsBySlot)
        .find(([, playerId]) => playerId === suspendedPlayerId)?.[0];
      if (lineupSlot !== undefined) {
        managerEditedSecondDraft = selectMatchPreparationPlayer(
          managerEditedSecondDraft,
          lineupSlot,
          undefined,
        );
      } else if (benchSlot !== undefined) {
        managerEditedSecondDraft = selectMatchPreparationBenchPlayer(
          managerEditedSecondDraft,
          benchSlot,
          undefined,
        );
      }
    }
    const validSecondDraft = applyMatchPreparationSelectionAction(
      continued.state,
      managerEditedSecondDraft,
      "fill_gaps",
    );
    const secondPreparation = buildDurableMatchPreparation(continued.state, validSecondDraft);
    if (secondPreparation === undefined) throw new Error("Expected reusable second-fixture preparation");
    expect(secondPreparation.targetFixtureId).toBe(nextFixture.fixture.id);

    const entered = await runtime.saveMatchPreparation(state.saveId, secondPreparation);
    expect(entered.matchdayState.liveProgress?.fixtureBefore.id).toBe(nextFixture.fixture.id);
    expect(advanceRuntimeToPhase(runtime, state.saveId, "half_time").matchdayState).toMatchObject({
      lastSessionAttempt: { status: "paused" },
      liveProgress: { snapshot: { phase: "half_time", currentMinute: 45 } },
    });
  });

  it("proves applied renewal/market commands set CareerSessionStatus dirty=true and explicit save clears it (P79-CF-05)", async () => {
    const storage = new RecordingCareerStorage();
    const runtime = new WebCareerRuntime(storage, {
      createIdentity: () => ({ saveId: "save:web-contract-dirty" as WebCareerSaveId, worldSeed: "web-contract-dirty-seed" }),
    });
    const created = await runtime.createNewCareer();

    expect(runtime.careerSessionStatus()?.dirty).toBe(false);

    const club = created.state.gameState.clubs[created.state.selectedClubId];
    if (club === undefined || club.playerIds.length === 0) throw new Error("Expected selected club players");
    const playerId = club.playerIds[0]!;

    const result = runtime.applySelectedClubContractCommand(created.metadata.saveId, {
      type: "offer_renewal",
      playerId,
      terms: {
        durationYears: 2,
        annualWage: 120_000_00 as any,
        squadStatus: "regular_starter",
        bonuses: {
          signingBonus: 0 as any,
          appearanceBonus: 0 as any,
        },
      },
    });

    expect(result.status).toBe("applied");
    expect(runtime.careerSessionStatus()?.dirty).toBe(true);

    await runtime.saveCareerNow(created.metadata.saveId);
    expect(runtime.careerSessionStatus()?.dirty).toBe(false);
  });
});

function advanceRuntimeToPhase(
  runtime: WebCareerRuntime,
  saveId: WebCareerSaveId,
  targetPhase: "half_time" | "full_time",
  halfTimeDraft?: ReturnType<typeof createMatchPreparationDraft>,
): AdvancedWebMatchdayMinute {
  let matchdayState = runtime.resumeMatchday(saveId, halfTimeDraft).matchdayState;

  for (let minute = 0; minute < 140; minute += 1) {
    const update = runtime.advanceMatchdayMinute(saveId);
    matchdayState = update.matchdayState;
    const progress = matchdayState.liveProgress;
    if (progress?.snapshot.phase === targetPhase) return update;

    const decision = progress?.pendingDecision;
    if (decision !== undefined && decision.type !== "half_time") {
      matchdayState = runtime.resolveMatchdayIncident(saveId).matchdayState;
    }
    if (matchdayState.liveProgress?.snapshot.runState !== "running") {
      matchdayState = runtime.resumeMatchday(saveId).matchdayState;
    }
  }

  throw new Error(`Expected runtime match to reach ${targetPhase}`);
}

/** Uses the same public adapter actions as the manager-facing preparation screen. */
function completePreparation(career: WebCareerState): NonNullable<WebCareerState["matchPreparation"]> {
  const auto = applyMatchPreparationSelectionAction(career, createMatchPreparationDraft(career), "auto");
  const draft = selectMatchPreparationTactic(auto, "tactic:balanced");
  const preparation = buildDurableMatchPreparation(career, draft);
  if (preparation === undefined) throw new Error("Expected complete generated match preparation");
  return preparation;
}

/** Completes only the active season with deterministic table-producing scores. */
function completeWebCareerSeason(career: WebCareerState): WebCareerState {
  const fixtures = { ...career.gameState.fixtures };
  for (const fixtureId of career.gameState.fixtureIds) {
    const fixture = career.gameState.fixtures[fixtureId];
    if (
      fixture === undefined
      || fixture.seasonId !== career.gameState.calendar.currentSeasonId
    ) {
      continue;
    }
    const homeRank = Number(String(fixture.homeClubId).slice(-2));
    const awayRank = Number(String(fixture.awayClubId).slice(-2));
    fixtures[fixtureId] = {
      ...fixture,
      result: homeRank < awayRank
        ? { played: true, homeGoals: 2, awayGoals: 1 }
        : { played: true, homeGoals: 1, awayGoals: 2 },
    };
  }
  return {
    ...career,
    gameState: {
      ...career.gameState,
      fixtures,
    },
  };
}

/**
 * Hashes only canonical world identity and ordered topology facts.
 *
 * The CLI suite uses the same projection and expected hash, proving that both
 * composition roots build the same seed-specific world without importing one
 * application from the other.
 */
function canonicalCareerIdentityHash(state: WebCareerState): string {
  const world = state.gameState.domesticCompetitionWorld;
  const serialized = JSON.stringify({
    selectedClubId: state.selectedClubId,
    calibrationVersions: state.gameState.meta.calibrationVersions,
    competitionIds: world?.competitionIds,
    memberships: world?.competitionIds.map((competitionId) => [
      competitionId,
      world.competitions[competitionId]?.clubIds,
    ]),
    clubIds: state.gameState.clubIds,
    clubs: state.gameState.clubIds.map((clubId) => state.gameState.clubs[clubId]),
    playerIds: state.gameState.playerIds,
    players: state.gameState.playerIds.map((playerId) => state.gameState.players[playerId]),
    fixtureIds: state.gameState.fixtureIds,
    fixtures: state.gameState.fixtureIds.map((fixtureId) => state.gameState.fixtures[fixtureId]),
  });
  let hash = 2_166_136_261;
  for (let index = 0; index < serialized.length; index += 1) {
    hash ^= serialized.charCodeAt(index);
    hash = Math.imul(hash, 16_777_619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
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
