import { describe, expect, it } from "vitest";

import type { CareerSaveMetadata } from "@game/storage";

import { buildWebCareerState, type WebCareerSaveId } from "./web-career-runtime";
import {
  CareerSession,
  includeDraftInCareerSessionStatus,
  isCareerAutosaveDue,
} from "./career-session";

describe("CareerSession", () => {
  it("uses exact in-world date boundaries for each supported cadence", () => {
    const state = fixtureState("save:session-boundaries");
    const start = state.gameState.calendar.currentDate;
    const dateAfter = (days: number) => (start + days) as typeof start;

    expect(isCareerAutosaveDue(start, dateAfter(6), 7)).toBe(false);
    expect(isCareerAutosaveDue(start, dateAfter(7), 7)).toBe(true);
    expect(isCareerAutosaveDue(start, dateAfter(14), 15)).toBe(false);
    expect(isCareerAutosaveDue(start, dateAfter(15), 15)).toBe(true);
    expect(isCareerAutosaveDue(start, dateAfter(100), null)).toBe(false);
  });

  it("starts clean and isolates the durable baseline from working replacements", () => {
    const state = fixtureState("save:session-clean");
    const session = new CareerSession(state, metadata(state.saveId, 7));
    const changed = {
      ...state,
      gameState: {
        ...state.gameState,
        calendar: {
          ...state.gameState.calendar,
          currentDate: (state.gameState.calendar.currentDate + 1) as typeof state.gameState.calendar.currentDate,
        },
      },
    };

    expect(session.status()).toMatchObject({ dirty: false, autosaveIntervalDays: 7 });
    session.replaceWorkingState(changed);

    const snapshot = session.snapshot();
    expect(snapshot.dirty).toBe(true);
    expect(snapshot.workingState.gameState.calendar.currentDate).not.toBe(
      snapshot.durableBaseline.gameState.calendar.currentDate,
    );
  });

  it("becomes clean only after accepting a successful commit", () => {
    const state = fixtureState("save:session-commit");
    const session = new CareerSession(state, metadata(state.saveId, 7));
    session.replaceWorkingState({ ...state });

    session.acceptCommit(metadata(state.saveId, 7));

    expect(session.status().dirty).toBe(false);
    expect(session.snapshot().durableBaseline).toEqual(session.snapshot().workingState);
  });

  it("updates policy without committing dirty gameplay", () => {
    const state = fixtureState("save:session-policy");
    const session = new CareerSession(state, metadata(state.saveId, 7));
    session.replaceWorkingState({ ...state });

    session.acceptPolicyUpdate(metadata(state.saveId, null));

    expect(session.status()).toMatchObject({ dirty: true, autosaveIntervalDays: null });
    expect(session.snapshot().durableBaseline).toEqual(state);
  });

  it("postpones one due autosave across unsafe commands and clears it on commit", () => {
    const state = fixtureState("save:session-postponed");
    const session = new CareerSession(state, metadata(state.saveId, 7));
    const advance = (days: number) => ({
      ...session.workingState(),
      gameState: {
        ...session.workingState().gameState,
        calendar: {
          ...session.workingState().gameState.calendar,
          currentDate: (state.gameState.calendar.currentDate + days) as typeof state.gameState.calendar.currentDate,
        },
      },
    });

    session.replaceWorkingState(advance(7));
    expect(session.postponeAutosaveIfDue()).toBe(true);
    session.replaceWorkingState(advance(8));

    expect(session.status().autosavePostponed).toBe(true);
    expect(session.shouldAutosave()).toBe(true);
    session.acceptCommit(metadata(state.saveId, 7));
    expect(session.status()).toMatchObject({ dirty: false, autosavePostponed: false });
  });

  it("projects a preparation draft through the existing dirty status without changing cadence", () => {
    const state = fixtureState("save:session-draft");
    const clean = new CareerSession(state, metadata(state.saveId, 15)).status();

    expect(includeDraftInCareerSessionStatus(clean, true)).toEqual({
      ...clean,
      dirty: true,
    });
    expect(includeDraftInCareerSessionStatus(clean, false)).toBe(clean);
    expect(includeDraftInCareerSessionStatus(undefined, true)).toBeUndefined();
  });
});

function fixtureState(id: string) {
  return buildWebCareerState({ saveId: id as WebCareerSaveId, worldSeed: `${id}-seed` });
}

function metadata(
  saveId: CareerSaveMetadata["saveId"],
  autosaveIntervalDays: CareerSaveMetadata["autosaveIntervalDays"],
): CareerSaveMetadata {
  return {
    saveId,
    name: "Session club",
    createdAtISO: "2026-07-13T10:00:00.000Z",
    updatedAtISO: "2026-07-13T10:00:00.000Z",
    saveSchemaVersion: 2,
    autosaveIntervalDays,
  };
}
