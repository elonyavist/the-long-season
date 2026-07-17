import type {
  CareerAutosaveIntervalDays,
  CareerSaveMetadata,
  CareerStorage,
} from "@game/storage";
import { diffDays } from "@game/shared";

type CareerState = Awaited<ReturnType<CareerStorage["loadCareer"]>>;
type GameDate = CareerState["gameState"]["calendar"]["currentDate"];

/** Small projection consumed by Zustand and presentation without copying baselines. */
export interface CareerSessionStatus {
  readonly dirty: boolean;
  readonly autosaveIntervalDays: CareerAutosaveIntervalDays;
  readonly lastPersistedGameDate: GameDate;
  readonly autosavePostponed: boolean;
}

/** Read-only session snapshot used by runtime tests and explicit application seams. */
export interface CareerSessionSnapshot extends CareerSessionStatus {
  readonly metadata: CareerSaveMetadata;
  readonly durableBaseline: CareerState;
  readonly workingState: CareerState;
}

/**
 * Owns one loaded career's durable baseline and mutable working replacement.
 *
 * State is cloned at the boundary so a screen cannot mutate the durable
 * baseline through an object alias. Persistence remains an explicit runtime
 * operation; this class never writes storage itself.
 */
export class CareerSession {
  private baseline: CareerState;
  private working: CareerState;
  private currentMetadata: CareerSaveMetadata;
  private hasUnsavedChanges = false;
  private hasPostponedAutosave = false;

  public constructor(state: CareerState, metadata: CareerSaveMetadata) {
    assertMatchingSave(state, metadata);
    this.baseline = cloneCareerState(state);
    this.working = cloneCareerState(state);
    this.currentMetadata = metadata;
  }

  /** Returns a defensive copy of the current gameplay snapshot. */
  public workingState(): CareerState {
    return cloneCareerState(this.working);
  }

  /** Returns immutable storage metadata for command result projections. */
  public metadata(): CareerSaveMetadata {
    return this.currentMetadata;
  }

  /** Replaces working gameplay and marks it dirty without touching storage. */
  public replaceWorkingState(state: CareerState): CareerSessionSnapshot {
    assertMatchingSave(state, this.currentMetadata);
    this.working = cloneCareerState(state);
    this.hasUnsavedChanges = true;
    return this.snapshot();
  }

  /** Accepts a successful full commit as the new clean durable baseline. */
  public acceptCommit(metadata: CareerSaveMetadata): CareerSessionSnapshot {
    assertMatchingSave(this.working, metadata);
    this.baseline = cloneCareerState(this.working);
    this.currentMetadata = metadata;
    this.hasUnsavedChanges = false;
    this.hasPostponedAutosave = false;
    return this.snapshot();
  }

  /** Applies a policy-only metadata write without changing gameplay dirtiness. */
  public acceptPolicyUpdate(metadata: CareerSaveMetadata): CareerSessionSnapshot {
    assertMatchingSave(this.working, metadata);
    this.currentMetadata = metadata;
    if (!this.isAutosaveDue()) this.hasPostponedAutosave = false;
    return this.snapshot();
  }

  /** Returns whether dirty gameplay now requires a scheduled commit. */
  public shouldAutosave(): boolean {
    return this.hasUnsavedChanges && (this.hasPostponedAutosave || this.isAutosaveDue());
  }

  /** Records a due save that cannot run at the current unsafe match stop. */
  public postponeAutosaveIfDue(): boolean {
    if (!this.hasUnsavedChanges || !this.isAutosaveDue()) return false;
    this.hasPostponedAutosave = true;
    return true;
  }

  /** Returns isolated state plus the canonical save-status projection. */
  public snapshot(): CareerSessionSnapshot {
    return {
      metadata: this.currentMetadata,
      durableBaseline: cloneCareerState(this.baseline),
      workingState: cloneCareerState(this.working),
      ...this.status(),
    };
  }

  /** Returns the bounded fields presentation needs to explain save state. */
  public status(): CareerSessionStatus {
    return {
      dirty: this.hasUnsavedChanges,
      autosaveIntervalDays: this.currentMetadata.autosaveIntervalDays,
      lastPersistedGameDate: this.baseline.gameState.calendar.currentDate,
      autosavePostponed: this.hasPostponedAutosave,
    };
  }

  private isAutosaveDue(): boolean {
    return isCareerAutosaveDue(
      this.baseline.gameState.calendar.currentDate,
      this.working.gameState.calendar.currentDate,
      this.currentMetadata.autosaveIntervalDays,
    );
  }
}

/** Calculates autosave cadence from in-world dates without wall-clock state. */
export function isCareerAutosaveDue(
  lastPersistedGameDate: GameDate,
  currentGameDate: GameDate,
  autosaveIntervalDays: CareerAutosaveIntervalDays,
): boolean {
  if (autosaveIntervalDays === null) return false;
  return diffDays(Number(currentGameDate), Number(lastPersistedGameDate)) >= autosaveIntervalDays;
}

/** Builds the clean presentation status for a just-loaded durable career. */
export function createCleanCareerSessionStatus(
  state: CareerState,
  metadata: CareerSaveMetadata,
): CareerSessionStatus {
  assertMatchingSave(state, metadata);
  return {
    dirty: false,
    autosaveIntervalDays: metadata.autosaveIntervalDays,
    lastPersistedGameDate: state.gameState.calendar.currentDate,
    autosavePostponed: false,
  };
}

/** Projects an additional in-memory draft through the canonical dirty contract. */
export function includeDraftInCareerSessionStatus(
  status: CareerSessionStatus | undefined,
  draftDirty: boolean,
): CareerSessionStatus | undefined {
  if (status === undefined || !draftDirty || status.dirty) return status;
  return { ...status, dirty: true };
}

function cloneCareerState(state: CareerState): CareerState {
  return structuredClone(state);
}

function assertMatchingSave(state: CareerState, metadata: CareerSaveMetadata): void {
  if (state.saveId !== metadata.saveId) {
    throw new Error(`Career session metadata mismatch: ${metadata.saveId} != ${state.saveId}`);
  }
}
