import { beforeEach, describe, expect, it } from "vitest";
import type { CareerSaveMetadata } from "@game/storage";
import { createMatchdayAttention, findNextCareerFixture } from "@game/engine";

import { DEFAULT_WEB_PREFERENCES } from "../app/preferences";
import { buildDurableMatchPreparation } from "../features/match-preparation/match-preparation-adapter";
import { enterWebMatchday } from "../features/matchday/matchday-adapter";
import {
  buildWebCareerState,
  inspectWebCareerAttention,
  type WebCareerSaveId,
} from "../runtime/web-career-runtime";
import { resetCareerUiStore, useCareerUiStore } from "./career-ui-store";

/** Reads the current Zustand snapshot without mounting React. */
function state(): ReturnType<typeof useCareerUiStore.getState> {
  return useCareerUiStore.getState();
}

describe("career UI store", () => {
  beforeEach(() => {
    resetCareerUiStore();
  });

  it("starts without fabricated career or match-preparation data", () => {
    expect(state().preferences).toEqual(DEFAULT_WEB_PREFERENCES);
    expect(state().storageLifecycleStatus).toBe("storage_loading");
    expect(state().availableSaves).toEqual([]);
    expect(state().activeCareerState).toBeUndefined();
    expect(state().matchPreparationState).toBeUndefined();
    expect(state().screen).toBe("app_entry");
  });

  it("receives and selects only durable save metadata", () => {
    const alpha = metadata("save:alpha" as CareerSaveMetadata["saveId"], "Alpha");
    const zeta = metadata("save:zeta" as CareerSaveMetadata["saveId"], "Zeta");

    state().receiveAvailableSaves([alpha, zeta]);
    state().selectSave(zeta.saveId);

    expect(state().storageLifecycleStatus).toBe("ready");
    expect(state().selectedSaveId).toBe(zeta.saveId);
  });

  it("publishes one command synchronously and rejects conflicts until completion", () => {
    expect(state().beginCareerCommand("continue_career", "career.dashboard.continue")).toBe(true);
    expect(state().commandActivity).toEqual({
      commandId: "continue_career",
      status: "pending",
      statusLabelKey: "career.dashboard.continue",
    });
    expect(state().beginCareerCommand("manual_save", "career.saveControl.saving")).toBe(false);

    state().completeCareerCommand("continue_career");
    expect(state().commandActivity).toBeUndefined();
  });

  it("accepts the bounded Inbox lifecycle command without adding local message state", () => {
    expect(state().beginCareerCommand(
      "open_inbox_message",
      "career.inbox.subject.matchday",
    )).toBe(true);
    expect(state().commandActivity?.commandId).toBe("open_inbox_message");
    expect("inboxMessages" in state()).toBe(false);
  });

  it("releases pending state into one bounded failed command snapshot", () => {
    state().beginCareerCommand("manual_save", "career.saveControl.saving");
    state().failCareerCommand("manual_save", "save_unwritable");

    expect(state().commandActivity).toEqual({
      commandId: "manual_save",
      status: "failed",
      statusLabelKey: "career.saveControl.saving",
      errorCode: "save_unwritable",
    });
    expect(state().beginCareerCommand("continue_career", "career.dashboard.continue")).toBe(true);
  });

  it("routes the bounded synchronous Inbox/Posta actions", () => {
    state().handleInboxAction("prepare_match");
    expect(state().screen).toBe("match_preparation");
  });

  it("owns only Posta filter and selection while durable lifecycle stays in the career", () => {
    const career = generatedCareerWithInbox("inbox-state");
    state().openPersistedCareer(career, metadata(career.saveId, "Inbox club"), inspectWebCareerAttention(career));

    state().openInbox();
    const selectedMessageId = String(career.currentSeasonInbox?.[0]?.id);
    expect(state().screen).toBe("career_inbox");
    expect(state().selectedInboxMessageId).toBe(selectedMessageId);

    state().setInboxFilter("unread");
    expect(state().inboxFilter).toBe("unread");
    expect(state().activeCareerState?.currentSeasonInbox).toEqual(career.currentSeasonInbox);
  });

  it("keeps Posta and the explicit message selected after a lifecycle update", () => {
    const career = generatedCareerWithInbox("inbox-lifecycle-route");
    const save = metadata(career.saveId, "Inbox club");
    const messageId = String(career.currentSeasonInbox?.[0]?.id);
    state().openPersistedCareer(career, save, inspectWebCareerAttention(career));
    state().openInbox();

    state().receiveInboxSessionUpdate(
      career,
      save,
      { ...inspectWebCareerAttention(career), stopReason: "no_attention", inboxMessages: [] },
      {
        dirty: true,
        autosaveIntervalDays: 7,
        lastPersistedGameDate: career.gameState.calendar.currentDate,
        autosavePostponed: false,
      },
      messageId,
    );

    expect(state().screen).toBe("career_inbox");
    expect(state().selectedInboxMessageId).toBe(messageId);
  });

  it("opens Posta on a Continue attention stop and clears stale selection after season reset", () => {
    const career = generatedCareerWithInbox("continue-inbox");
    const save = metadata(career.saveId, "Inbox club");
    state().openPersistedCareer(career, save, inspectWebCareerAttention(career));
    const result = inspectWebCareerAttention(career);

    state().receiveCareerSessionUpdate(career, save, result, {
      dirty: true,
      autosaveIntervalDays: 7,
      lastPersistedGameDate: career.gameState.calendar.currentDate,
      autosavePostponed: false,
    });

    expect(state().screen).toBe("career_inbox");
    expect(state().selectedInboxMessageId).toBe(result.inboxMessages[0]?.messageId);

    state().receiveCareerSessionUpdate({ ...career, currentSeasonInbox: [] }, save, {
      ...result,
      stopReason: "no_attention",
      inboxMessages: [],
    }, {
      dirty: true,
      autosaveIntervalDays: 7,
      lastPersistedGameDate: career.gameState.calendar.currentDate,
      autosavePostponed: false,
    });
    expect(state().selectedInboxMessageId).toBeUndefined();
    expect(state().screen).toBe("career_dashboard");
  });

  it("keeps the canonical command pending while presenting dates, then routes at the final date", () => {
    const career = generatedCareerWithInbox("calendar-transition");
    const save = metadata(career.saveId, "Calendar club");
    state().openPersistedCareer(career, save, inspectWebCareerAttention(career));
    const result = {
      ...inspectWebCareerAttention(career),
      startDateIso: "2026-08-01",
      stopDateIso: "2026-08-04",
      daysAdvanced: 3,
    };

    state().beginCareerCommand("continue_career", "career.command.advancingCareer");
    state().beginCalendarAdvanceTransition({
      startDateIso: result.startDateIso,
      stopDateIso: result.stopDateIso,
      initialDateIso: result.startDateIso,
      elapsedDays: result.daysAdvanced,
    });
    state().showCalendarAdvanceDate("2026-08-03");

    expect(state().screen).toBe("career_dashboard");
    expect(state().commandActivity?.status).toBe("pending");
    expect(state().calendarAdvanceTransition).toMatchObject({
      visibleDateIso: "2026-08-03",
      status: "advancing",
    });

    state().showCalendarAdvanceDate(result.stopDateIso);
    state().receiveCareerSessionUpdate(career, save, result, {
      dirty: true,
      autosaveIntervalDays: 7,
      lastPersistedGameDate: career.gameState.calendar.currentDate,
      autosavePostponed: false,
    });

    expect(state().screen).toBe("career_inbox");
    expect(state().selectedInboxMessageId).toBe(result.inboxMessages[0]?.messageId);
    expect(state().calendarAdvanceTransition).toMatchObject({
      visibleDateIso: "2026-08-04",
      status: "complete",
    });
  });

  it("skips calendar presentation updates outside the Continue command", () => {
    state().beginCalendarAdvanceTransition({
      startDateIso: "2026-08-01",
      stopDateIso: "2026-08-02",
      initialDateIso: "2026-08-01",
      elapsedDays: 1,
    });

    expect(state().calendarAdvanceTransition).toBeUndefined();
  });

  it("opens a loaded career with a draft rehydrated from durable facts", () => {
    const career = generatedCareer("loaded");
    const save = metadata(career.saveId, "Loaded club");

    state().openPersistedCareer(career, save, inspectWebCareerAttention(career));

    expect(state().activeCareerState).toEqual(career);
    expect(state().matchPreparationState?.isSaved).toBe(false);
    expect(state().matchPreparationState?.selectedPlayerIdsBySlot).toEqual({});
    expect(state().screen).toBe("career_dashboard");
  });

  it("preserves the loaded career and current screen after a failed current-career write", () => {
    const career = openGeneratedCareer("write-failure");
    state().openMatchPreparation();

    state().failCareerStorage({ code: "save_unwritable" }, "current_career");

    expect(state().activeCareerState).toEqual(career);
    expect(state().screen).toBe("match_preparation");
    expect(state().storageLifecycleStatus).toBe("ready");
    expect(state().storageFailure).toEqual({ code: "save_unwritable" });
    expect(state().storageFailureScope).toBe("current_career");
  });

  it("returns startup failures to app entry without fabricating a loaded career", () => {
    state().failCareerStorage({ code: "storage_unavailable" }, "app_entry");

    expect(state().activeCareerState).toBeUndefined();
    expect(state().screen).toBe("app_entry");
    expect(state().storageLifecycleStatus).toBe("storage_error");
    expect(state().storageFailureScope).toBe("app_entry");
  });

  it("keeps manager edits unsaved until a runtime result is published", () => {
    openGeneratedCareer("draft");

    state().applySelectionAction("auto");
    state().selectTacticProfile("tactic:balanced");

    expect(Object.keys(requiredDraft().selectedPlayerIdsBySlot)).toHaveLength(11);
    expect(Object.keys(requiredDraft().selectedBenchPlayerIdsBySlot)).toHaveLength(8);
    expect(requiredDraft().isSaved).toBe(false);
    expect(state().activeCareerState?.matchPreparation).toBeUndefined();
  });

  it("discards the preparation draft back to the loaded career baseline", () => {
    openGeneratedCareer("discard-draft");
    state().openMatchPreparation();
    state().applySelectionAction("auto");
    expect(Object.keys(requiredDraft().selectedPlayerIdsBySlot)).toHaveLength(11);

    state().discardMatchPreparationDraft();

    expect(state().screen).toBe("match_preparation");
    expect(requiredDraft().selectedPlayerIdsBySlot).toEqual({});
    expect(requiredDraft().selectedBenchPlayerIdsBySlot).toEqual({});
  });

  it("publishes a manual preparation commit without changing the current route", () => {
    const career = openGeneratedCareer("manual-preparation");
    state().openMatchPreparation();
    state().applySelectionAction("auto");
    state().selectTacticProfile("tactic:balanced");
    const durable = buildDurableMatchPreparation(career, requiredDraft());
    if (durable === undefined) throw new Error("Expected complete durable preparation");
    const committed = { ...career, matchPreparation: durable };
    const save = metadata(career.saveId, "Manual preparation club");

    state().receiveManualCareerSave(
      committed,
      save,
      inspectWebCareerAttention(committed),
      {
        dirty: false,
        autosaveIntervalDays: 7,
        lastPersistedGameDate: committed.gameState.calendar.currentDate,
        autosavePostponed: false,
      },
    );

    expect(state().screen).toBe("match_preparation");
    expect(state().activeCareerState?.matchPreparation).toEqual(durable);
    expect(requiredDraft().isSaved).toBe(true);
  });

  it("publishes session preparation, rehydrates it, and only then opens pre-match", () => {
    const career = generatedCareerWithInbox("committed");
    state().openPersistedCareer(career, metadata(career.saveId, "Committed club"), inspectWebCareerAttention(career));
    const selectedInboxMessageId = state().selectedInboxMessageId;
    state().applySelectionAction("auto");
    state().selectTacticProfile("tactic:balanced");
    state().moveBoardSlot("rm", 0.84, 0.42);
    const durable = buildDurableMatchPreparation(career, requiredDraft());
    if (durable === undefined) throw new Error("Expected complete durable preparation");
    const prepared = { ...career, matchPreparation: durable };
    const matchdayState = enterWebMatchday(prepared);
    const persisted = matchdayState.careerState;
    const save = metadata(persisted.saveId, "Committed club");

    state().receiveMatchdaySessionUpdate(
      persisted,
      save,
      inspectWebCareerAttention(persisted),
      matchdayState,
      {
        dirty: true,
        autosaveIntervalDays: 7,
        lastPersistedGameDate: career.gameState.calendar.currentDate,
        autosavePostponed: false,
      },
    );

    expect(state().activeCareerState?.matchPreparation).toEqual(durable);
    expect(requiredDraft().isSaved).toBe(true);
    expect(requiredDraft().tacticalBoardDraft.slots.find((slot) => slot.slotId === "rm")).toMatchObject({
      nx: durable.boardSlots?.find((slot) => slot.slotKey === "rm")?.nx,
      ny: durable.boardSlots?.find((slot) => slot.slotKey === "rm")?.ny,
    });
    expect(state().screen).toBe("matchday");
    expect(state().selectedInboxMessageId).toBe(selectedInboxMessageId);
  });

  it("enforces XI and bench mutual exclusivity in the draft", () => {
    openGeneratedCareer("exclusive");
    const playerId = selectedClubPlayerIds()[0];
    if (playerId === undefined) throw new Error("Expected selected-club player");

    state().selectLineupPlayer("gk", playerId);
    state().selectBenchPlayer("bench:01", playerId);

    expect(requiredDraft().selectedPlayerIdsBySlot.gk).toBeUndefined();
    expect(requiredDraft().selectedBenchPlayerIdsBySlot["bench:01"]).toBe(playerId);

    state().selectLineupPlayer("gk", playerId);

    expect(requiredDraft().selectedPlayerIdsBySlot.gk).toBe(playerId);
    expect(requiredDraft().selectedBenchPlayerIdsBySlot["bench:01"]).toBeUndefined();
  });

  it("updates normalized board position and role through store actions", () => {
    openGeneratedCareer("board");
    const playerId = selectedClubPlayerIds()[0];
    if (playerId === undefined) throw new Error("Expected selected-club player");
    state().selectLineupPlayer("rm", playerId);

    state().moveBoardSlot("rm", 0.95, 0.2);
    state().changeBoardSlotRole("rm", "AD");

    expect(requiredDraft().tacticalBoardDraft.slots.find((slot) => slot.slotId === "rm")).toMatchObject({
      role: "AD",
      canonicalRole: "right_winger",
      playerId,
    });
  });
});

function generatedCareer(suffix: string) {
  return buildWebCareerState({
    saveId: `save:store-${suffix}` as WebCareerSaveId,
    worldSeed: `store-${suffix}-seed`,
  });
}

function generatedCareerWithInbox(suffix: string) {
  const career = generatedCareer(suffix);
  const nextFixture = findNextCareerFixture(career);
  if (nextFixture.status !== "found") throw new Error("Expected selected-club fixture");
  const message = createMatchdayAttention({
    fixtureId: nextFixture.fixture.id,
    clubId: career.selectedClubId,
    date: nextFixture.fixture.date,
    preparation: {
      hasSavedLineup: false,
      hasSavedTactic: false,
      hasCompleteBench: false,
      hasBenchGoalkeeper: false,
    },
  }).message;
  return { ...career, currentSeasonInbox: [message] };
}

function openGeneratedCareer(suffix: string) {
  const career = generatedCareer(suffix);
  state().openPersistedCareer(career, metadata(career.saveId, "Test club"), inspectWebCareerAttention(career));
  return career;
}

function requiredDraft() {
  const draft = state().matchPreparationState;
  if (draft === undefined) throw new Error("Expected loaded match-preparation draft");
  return draft;
}

function selectedClubPlayerIds(): readonly string[] {
  const career = state().activeCareerState;
  if (career === undefined) return [];
  return career.gameState.clubs[career.selectedClubId]?.playerIds ?? [];
}

function metadata(saveId: CareerSaveMetadata["saveId"], name: string): CareerSaveMetadata {
  return {
    saveId,
    name,
    createdAtISO: "2026-07-13T10:00:00.000Z",
    updatedAtISO: "2026-07-13T10:00:00.000Z",
    saveSchemaVersion: 1,
    autosaveIntervalDays: 7,
  };
}
