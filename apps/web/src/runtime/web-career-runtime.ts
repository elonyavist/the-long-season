import {
  createFakeLeagueSystem,
  generateInitialYouthAcademies,
  type FakeLeagueSystem,
  type InitialYouthAcademyClubContext,
} from "@game/content";
import {
  acknowledgeImportantCareerInboxMessage,
  continueCareerUntilAttention,
  createMatchdayAttention,
  deliverCareerInboxMessages,
  findNextCareerFixture,
  openCareerInboxMessage,
  reconcileCareerInboxResolution,
  type ContinueCareerUntilAttentionResult,
} from "@game/engine";
import { generateRoundRobinCalendar } from "@game/engine";
import { fromISO, toISO } from "@game/shared";
import type {
  CareerAutosaveIntervalDays,
  CareerSaveMetadata,
  CareerStorage,
} from "@game/storage";
import {
  SqliteCareerStorageError,
  StorageError,
  type StorageErrorCode,
} from "@game/storage/sqlite";
import type { CareerInboxMessageInput } from "@game/ui";

import {
  applyWebHalfTimeTacticalDecision,
  completeWebMatchday,
  createWebMatchdayState,
  enterWebMatchday,
  progressWebMatchdayToHalfTime,
  type WebMatchdayState,
} from "../features/matchday/matchday-adapter";
import type { MatchPreparationDraft } from "../features/match-preparation/match-preparation-adapter";
import {
  CareerSession,
  type CareerSessionSnapshot,
  type CareerSessionStatus,
} from "./career-session";

/** Career state type exposed through the architecture-approved storage seam. */
export type WebCareerState = Awaited<ReturnType<CareerStorage["loadCareer"]>>;

/** Inbox identity projected through the approved storage-owned career state. */
export type WebCareerInboxMessageId = NonNullable<
  WebCareerState["currentSeasonInbox"]
>[number]["id"];

/** Save ID type exposed through the architecture-approved storage seam. */
export type WebCareerSaveId = Parameters<CareerStorage["loadCareer"]>[0];

type LeagueClubId = FakeLeagueSystem["clubIds"][number];

/** Current generated-world version written by browser-created careers. */
export const WEB_CAREER_WORLD_GENERATOR_VERSION = 1;

/** Stable identity allocated before deterministic world generation starts. */
export interface WebCareerIdentity {
  readonly saveId: WebCareerSaveId;
  readonly worldSeed: string;
}

/** Successful durable new-career result returned to the web composition root. */
export interface CreatedWebCareer {
  readonly metadata: CareerSaveMetadata;
  readonly state: WebCareerState;
}

/** Presentation-safe structured result of inspecting or advancing a career. */
export interface WebCareerContinueResult {
  /** Canonical reason emitted by daily career advancement. */
  readonly stopReason: ContinueCareerUntilAttentionResult["stopReason"];
  readonly startDateIso: string;
  readonly stopDateIso: string;
  readonly daysAdvanced: number;
  readonly titleKey: string;
  readonly summaryKey: string;
  /** Message that owns the current stop, even when older delivered messages precede it. */
  readonly selectedMessageId?: string;
  readonly inboxMessages: readonly CareerInboxMessageInput[];
}

/** Persisted Continue result published only after the save transaction commits. */
export interface ContinuedWebCareer {
  readonly metadata: CareerSaveMetadata;
  readonly state: WebCareerState;
  readonly continueResult: WebCareerContinueResult;
  readonly sessionStatus: CareerSessionStatus;
}

/** Successful explicit or scheduled commit of the current working session. */
export interface CommittedWebCareerSession {
  readonly metadata: CareerSaveMetadata;
  readonly state: WebCareerState;
  readonly continueResult: WebCareerContinueResult;
  readonly sessionStatus: CareerSessionStatus;
}

/** Working-session result after preparation opens the match centre. */
export interface PreparedWebMatchday {
  readonly metadata: CareerSaveMetadata;
  readonly state: WebCareerState;
  readonly continueResult: WebCareerContinueResult;
  readonly sessionStatus: CareerSessionStatus;
  /** Pre-match presentation built from the in-memory active match state. */
  readonly matchdayState: WebMatchdayState;
}

/** Staged-match command result owned by the in-memory career session. */
export interface UpdatedWebMatchday {
  readonly metadata: CareerSaveMetadata;
  readonly state: WebCareerState;
  readonly continueResult: WebCareerContinueResult;
  readonly sessionStatus: CareerSessionStatus;
  readonly matchdayState: WebMatchdayState;
}

/** Optional runtime dependencies used to make identity allocation testable. */
export interface WebCareerRuntimeOptions {
  readonly createIdentity?: () => WebCareerIdentity;
}

/** Stable persistence failures that UI surfaces can localize safely. */
export type WebCareerPersistenceFailureCode =
  | "save_not_found"
  | "save_unreadable"
  | "save_unwritable"
  | "storage_busy"
  | "storage_quota_exceeded"
  | "storage_unavailable"
  | "unsupported_schema_version"
  | "unknown";

/** Presentation-safe storage failure without raw SQL or browser prose. */
export interface WebCareerPersistenceFailure {
  readonly code: WebCareerPersistenceFailureCode;
}

/** Converts storage and worker failures into the bounded web recovery contract. */
export function classifyWebCareerPersistenceFailure(error: unknown): WebCareerPersistenceFailure {
  if (error instanceof StorageError) return { code: normalizeStorageFailureCode(error.code) };
  if (error instanceof SqliteCareerStorageError) {
    return { code: error.code === "unsupported_bootstrap_state" ? "unsupported_schema_version" : "storage_unavailable" };
  }

  const code = errorCode(error);
  switch (code) {
    case "save_not_found":
    case "save_unreadable":
    case "save_unwritable":
    case "storage_busy":
    case "storage_quota_exceeded":
    case "unsupported_schema_version":
      return { code };
    case "opfs_unavailable":
    case "sqlite_unavailable":
    case "storage_initialization_failed":
    case "storage_unavailable":
    case "worker_unavailable":
      return { code: "storage_unavailable" };
    case "unsupported_bootstrap_state":
      return { code: "unsupported_schema_version" };
    default:
      return { code: "unknown" };
  }
}

/** Maps package storage codes onto the smaller presentation recovery vocabulary. */
function normalizeStorageFailureCode(code: StorageErrorCode): WebCareerPersistenceFailureCode {
  switch (code) {
    case "save_not_found":
    case "save_unreadable":
    case "save_unwritable":
    case "storage_busy":
    case "storage_quota_exceeded":
    case "unsupported_schema_version":
      return code;
    case "storage_initialization_failed":
    case "storage_unavailable":
      return "storage_unavailable";
  }
}

/** Reads a stable code from worker-shaped failures without exposing their prose. */
function errorCode(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null || !("code" in error)) return undefined;
  return typeof error.code === "string" ? error.code : undefined;
}

/**
 * Coordinates generated career creation and canonical durable persistence.
 *
 * The runtime owns application sequencing only. Content generates the world,
 * engine creates its calendar, domain validates the snapshot, and the injected
 * `CareerStorage` implementation owns durability.
 */
export class WebCareerRuntime {
  private readonly createIdentity: () => WebCareerIdentity;
  private session: CareerSession | undefined;

  public constructor(
    private readonly storage: CareerStorage,
    options: WebCareerRuntimeOptions = {},
  ) {
    this.createIdentity = options.createIdentity ?? createBrowserCareerIdentity;
  }

  /** Lists all durable careers in backend-defined deterministic order. */
  public listCareers(): Promise<readonly CareerSaveMetadata[]> {
    return this.storage.listCareers();
  }

  /** Loads one validated durable career by ID. */
  public async loadCareer(requestedSaveId: WebCareerSaveId): Promise<WebCareerState> {
    const [state, saves] = await Promise.all([
      this.storage.loadCareer(requestedSaveId),
      this.storage.listCareers(),
    ]);
    const metadata = saves.find((entry) => entry.saveId === requestedSaveId);
    if (metadata === undefined) {
      throw new Error(`Loaded career metadata is missing: ${requestedSaveId}`);
    }
    this.session = new CareerSession(state, metadata);
    const refreshedState = refreshExistingInboxFacts(state);
    if (refreshedState !== state) this.session.replaceWorkingState(refreshedState);
    return this.session.workingState();
  }

  /** Generates and durably saves a new career before exposing it to the UI. */
  public async createNewCareer(): Promise<CreatedWebCareer> {
    const identity = this.createIdentity();
    const generatedState = refreshExistingInboxFacts(buildWebCareerState(identity));
    const selectedClub = generatedState.gameState.clubs[generatedState.selectedClubId];
    if (selectedClub === undefined) {
      throw new Error(`Generated selected club is missing: ${generatedState.selectedClubId}`);
    }

    const metadata = await this.storage.saveCareer({
      saveId: identity.saveId,
      name: selectedClub.name,
      state: generatedState,
    });

    const state = await this.storage.loadCareer(identity.saveId);
    this.session = new CareerSession(state, metadata);
    return { metadata, state };
  }

  /** Returns the loaded session's bounded save-state projection. */
  public careerSessionStatus(): CareerSessionStatus | undefined {
    return this.session?.status();
  }

  /** Updates only cadence metadata and preserves any dirty working gameplay. */
  public async updateAutosavePolicy(
    autosaveIntervalDays: CareerAutosaveIntervalDays,
  ): Promise<CareerSessionSnapshot> {
    const session = this.requireSession();
    const metadata = await this.storage.updateAutosavePolicy(
      session.snapshot().metadata.saveId,
      autosaveIntervalDays,
    );
    return session.acceptPolicyUpdate(metadata);
  }

  /** Runs canonical Continue against the loaded working session. */
  public async continueCareer(requestedSaveId: WebCareerSaveId): Promise<ContinuedWebCareer> {
    const session = this.requireSession(requestedSaveId);
    const currentState = session.workingState();
    const inspection = advanceCanonicalCareerToAttention(currentState);
    const continueResult = toWebCareerContinueResult(inspection.result);
    const deliveredState = reconcileCareerInboxResolution(
      deliverCareerInboxMessages(currentState, inspection.result.inboxMessages),
    );
    const nextState = withCurrentDate(deliveredState, continueResult.stopDateIso);
    let state = nextState === currentState
      ? currentState
      : session.replaceWorkingState(nextState).workingState;

    await this.autosaveAtSafeStop(session);
    state = session.workingState();

    return {
      metadata: session.metadata(),
      state,
      continueResult,
      sessionStatus: session.status(),
    };
  }

  /** Opens one durable Posta message in memory and acknowledges important attention. */
  public async openInboxMessage(
    requestedSaveId: WebCareerSaveId,
    messageId: WebCareerInboxMessageId,
  ): Promise<ContinuedWebCareer> {
    const session = this.requireSession(requestedSaveId);
    const currentState = session.workingState();
    const openedState = openCareerInboxMessage(currentState, messageId);
    const openedMessage = openedState.currentSeasonInbox?.find((message) => message.id === messageId);
    const nextState = openedMessage?.level === "important"
      ? acknowledgeImportantCareerInboxMessage(openedState, messageId)
      : openedState;
    if (nextState !== currentState) session.replaceWorkingState(nextState);
    const state = session.workingState();

    return {
      metadata: session.metadata(),
      state,
      continueResult: inspectWebCareerAttention(state),
      sessionStatus: session.status(),
    };
  }

  /** Commits the loaded working session and an optional complete preparation draft. */
  public async saveCareerNow(
    requestedSaveId: WebCareerSaveId,
    matchPreparation?: NonNullable<WebCareerState["matchPreparation"]>,
  ): Promise<CommittedWebCareerSession> {
    const session = this.requireSession(requestedSaveId);
    const state = session.workingState();
    if (isUnsafeMatchdayState(state)) {
      throw new Error("Career cannot be saved during an active matchday");
    }

    if (matchPreparation !== undefined) {
      session.replaceWorkingState({ ...state, matchPreparation });
    }

    await this.commitSession(session);
    const committedState = session.workingState();
    return {
      metadata: session.metadata(),
      state: committedState,
      continueResult: inspectWebCareerAttention(committedState),
      sessionStatus: session.status(),
    };
  }

  /** Applies preparation and creates the active pre-match state in memory. */
  public async saveMatchPreparation(
    requestedSaveId: WebCareerSaveId,
    matchPreparation: NonNullable<WebCareerState["matchPreparation"]>,
  ): Promise<PreparedWebMatchday> {
    const session = this.requireSession(requestedSaveId);
    const currentState = session.workingState();

    session.replaceWorkingState({ ...currentState, matchPreparation });
    await this.autosaveAtSafeStop(session);

    return this.enterPreparedMatchday(session);
  }

  /** Enters pre-match from an already confirmed fixture-scoped preparation. */
  public openPreparedMatchday(requestedSaveId: WebCareerSaveId): PreparedWebMatchday {
    return this.enterPreparedMatchday(this.requireSession(requestedSaveId));
  }

  /** Creates or resumes the active checkpoint before publishing the matchday screen. */
  private enterPreparedMatchday(session: CareerSession): PreparedWebMatchday {
    const entered = enterWebMatchday(session.workingState());

    if (entered.careerState.activeMatchCheckpoint === undefined) {
      throw new Error(entered.lastStagedAttempt.invalidReason ?? "Matchday checkpoint could not be created");
    }

    const state = session.replaceWorkingState(refreshExistingInboxFacts(entered.careerState)).workingState;
    session.postponeAutosaveIfDue();

    return {
      metadata: session.metadata(),
      state,
      continueResult: inspectWebCareerAttention(state),
      sessionStatus: session.status(),
      matchdayState: createWebMatchdayState(state),
    };
  }

  /** Advances the in-memory pre-match state to half-time. */
  public async progressMatchdayToHalfTime(requestedSaveId: WebCareerSaveId): Promise<UpdatedWebMatchday> {
    const session = this.requireSession(requestedSaveId);
    const currentState = session.workingState();
    const progressed = progressWebMatchdayToHalfTime(createWebMatchdayState(currentState));
    if (progressed.lastStagedAttempt.status !== "at_half_time") {
      throw new Error(progressed.lastStagedAttempt.invalidReason ?? "Matchday did not reach half-time");
    }

    return this.publishMatchdayUpdate(session, progressed.careerState);
  }

  /** Applies half-time decisions and completes the same staged report in memory. */
  public async completeMatchday(
    requestedSaveId: WebCareerSaveId,
    preparation: MatchPreparationDraft,
  ): Promise<UpdatedWebMatchday> {
    const session = this.requireSession(requestedSaveId);
    const currentState = session.workingState();
    const decided = applyWebHalfTimeTacticalDecision(createWebMatchdayState(currentState), preparation);
    if (decided.lastStagedAttempt.status !== "substitutions_applied") {
      throw new Error(decided.lastStagedAttempt.invalidReason ?? "Half-time decisions are invalid");
    }

    const completed = completeWebMatchday(createWebMatchdayState(decided.careerState));
    if (completed.playedResult === undefined || completed.lastStagedAttempt.status !== "full_time") {
      throw new Error(completed.lastStagedAttempt.invalidReason ?? "Matchday did not reach full time");
    }

    const state = session.replaceWorkingState(refreshExistingInboxFacts(completed.careerState)).workingState;
    session.postponeAutosaveIfDue();
    return {
      metadata: session.metadata(),
      state,
      continueResult: inspectWebCareerAttention(state),
      sessionStatus: session.status(),
      matchdayState: createWebMatchdayState(state, completed.playedResult),
    };
  }

  /** Acknowledges full time and keeps the used plan as an unconfirmed next-match draft. */
  public async acknowledgeMatchday(requestedSaveId: WebCareerSaveId): Promise<UpdatedWebMatchday> {
    const session = this.requireSession(requestedSaveId);
    const currentState = session.workingState();
    const nextState = carryCompletedPreparationAsDraft(currentState);
    session.replaceWorkingState(refreshExistingInboxFacts(nextState));
    await this.autosaveAtSafeStop(session);
    return this.buildMatchdayUpdate(session);
  }

  /** Replaces working match state and builds its structured presentation result. */
  private publishMatchdayUpdate(
    session: CareerSession,
    nextState: WebCareerState,
  ): UpdatedWebMatchday {
    const state = session.replaceWorkingState(nextState).workingState;
    session.postponeAutosaveIfDue();
    return {
      metadata: session.metadata(),
      state,
      continueResult: inspectWebCareerAttention(state),
      sessionStatus: session.status(),
      matchdayState: createWebMatchdayState(state),
    };
  }

  /** Builds the current matchday projection without mutating or persisting it. */
  private buildMatchdayUpdate(session: CareerSession): UpdatedWebMatchday {
    const state = session.workingState();
    return {
      metadata: session.metadata(),
      state,
      continueResult: inspectWebCareerAttention(state),
      sessionStatus: session.status(),
      matchdayState: createWebMatchdayState(state),
    };
  }

  /** Runs a due or postponed autosave only after reaching a documented safe stop. */
  private async autosaveAtSafeStop(session: CareerSession): Promise<void> {
    if (!session.shouldAutosave()) return;
    await this.commitSession(session);
  }

  /** Validates and commits the whole working snapshot through the canonical storage seam. */
  private async commitSession(session: CareerSession): Promise<CareerSessionSnapshot> {
    const state = session.workingState();
    const selectedClub = state.gameState.clubs[state.selectedClubId];
    if (selectedClub === undefined) {
      throw new Error(`Selected club is missing from career state: ${state.selectedClubId}`);
    }
    const metadata = await this.storage.saveCareer({
      saveId: state.saveId,
      name: selectedClub.name,
      state,
    });
    return session.acceptCommit(metadata);
  }

  private requireSession(requestedSaveId?: WebCareerSaveId): CareerSession {
    if (this.session === undefined) throw new Error("No career session is loaded");
    if (requestedSaveId !== undefined && this.session.metadata().saveId !== requestedSaveId) {
      throw new Error(`Loaded session does not match requested save: ${requestedSaveId}`);
    }
    return this.session;
  }
}

/** Keeps every live-match phase, including full-time review, outside save boundaries. */
function isUnsafeMatchdayState(state: WebCareerState): boolean {
  if (state.activeMatchCheckpoint !== undefined) return true;
  const targetFixtureId = state.matchPreparation?.targetFixtureId;
  if (targetFixtureId === undefined) return false;
  return state.gameState.fixtures[targetFixtureId]?.result?.played === true;
}

/** Removes fixture confirmation while preserving the manager's last team plan as a reusable draft. */
function carryCompletedPreparationAsDraft(careerState: WebCareerState): WebCareerState {
  const preparation = careerState.matchPreparation;
  if (preparation === undefined) return careerState;
  const reviewedFixture = preparation.targetFixtureId === undefined
    ? undefined
    : careerState.gameState.fixtures[preparation.targetFixtureId];
  if (reviewedFixture?.result?.played !== true) return careerState;
  const { targetFixtureId: _reviewedFixtureId, ...preparationWithoutTarget } = preparation;

  return {
    ...careerState,
    matchPreparation: {
      ...preparationWithoutTarget,
      updatedAt: careerState.gameState.calendar.currentDate,
    },
  };
}

/** Rebuilds current structured attention from durable career facts. */
export function inspectWebCareerAttention(careerState: WebCareerState): WebCareerContinueResult {
  return toWebCareerContinueResult(inspectCanonicalCareerAttention(careerState).result);
}

/** Inspects attention due on the current date without moving the career clock. */
function inspectCanonicalCareerAttention(careerState: WebCareerState): {
  readonly result: ContinueCareerUntilAttentionResult;
} {
  return evaluateCanonicalCareerAttention(
    careerState,
    careerState.gameState.calendar.currentDate,
  );
}

/** Evaluates the next selected-club fixture as Continue's deterministic boundary. */
function advanceCanonicalCareerToAttention(careerState: WebCareerState): {
  readonly result: ContinueCareerUntilAttentionResult;
} {
  const nextFixture = findNextCareerFixture(careerState);
  if (nextFixture.status === "invalid") {
    throw new Error(`Loaded career next fixture is invalid: ${nextFixture.reason}`);
  }

  return evaluateCanonicalCareerAttention(
    careerState,
    nextFixture.status === "found"
      ? nextFixture.fixture.date
      : careerState.gameState.calendar.currentDate,
  );
}

/** Projects Inbox facts due by one explicit date and runs the pure engine stop rule. */
function evaluateCanonicalCareerAttention(
  careerState: WebCareerState,
  boundaryDate: WebCareerState["gameState"]["calendar"]["currentDate"],
): { readonly result: ContinueCareerUntilAttentionResult } {
  const nextFixture = findNextCareerFixture(careerState);
  if (nextFixture.status === "invalid") {
    throw new Error(`Loaded career next fixture is invalid: ${nextFixture.reason}`);
  }

  const currentDate = careerState.gameState.calendar.currentDate;
  const matchday = nextFixture.status === "found"
    ? createMatchdayAttention({
        fixtureId: nextFixture.fixture.id,
        clubId: careerState.selectedClubId,
        date: nextFixture.fixture.date,
        preparation: matchdayPreparationFacts(careerState, nextFixture.fixture.id),
      })
    : undefined;
  const projectedState = reconcileCareerInboxResolution(
    matchday === undefined || matchday.message.date > boundaryDate
      ? careerState
      : deliverCareerInboxMessages(careerState, [matchday.message]),
  );
  const result = continueCareerUntilAttention({
    currentDate,
    boundaryDate,
    messages: projectedState.currentSeasonInbox ?? [],
  });

  return { result };
}

/** Maps canonical Inbox facts onto the web presentation contract. */
function toWebCareerContinueResult(result: ContinueCareerUntilAttentionResult): WebCareerContinueResult {
  const firstMessage = result.stopReason === "attention"
    ? result.stopDateMessages[0]
    : undefined;
  const titleKey = firstMessage === undefined
    ? "career.dashboard.continueStopped.no_attention"
    : `career.inbox.subject.${firstMessage.category}`;
  const summaryKey = firstMessage === undefined
    ? "career.dashboard.continueStopped.no_attention"
    : inboxMessagePreviewKey(firstMessage);

  return {
    stopReason: result.stopReason,
    startDateIso: toISO(result.startDate),
    stopDateIso: toISO(result.stopDate),
    daysAdvanced: result.daysAdvanced,
    titleKey,
    summaryKey,
    ...(result.selectedMessageId === undefined
      ? {}
      : { selectedMessageId: String(result.selectedMessageId) }),
    inboxMessages: result.inboxMessages.map((message) => ({
      messageId: message.id,
      dateIso: toISO(message.date),
      category: message.category,
      priority: message.level === "blocking" ? "urgent" : message.level === "important" ? "important" : "routine",
      status: message.lifecycle.resolved ? "resolved" : message.lifecycle.read ? "read" : "unread",
      titleKey: `career.inbox.subject.${message.category}`,
      summaryKey: inboxMessagePreviewKey(message),
      actionRequired: message.level === "blocking" && !message.lifecycle.resolved,
      actions: message.actionIds.map((actionId) => ({
        actionId,
        labelKey: `career.inbox.action.${actionId}`,
      })),
    })),
  };
}

/** Selects the compact summary for a canonical current-season message. */
function inboxMessagePreviewKey(
  message: ContinueCareerUntilAttentionResult["inboxMessages"][number],
): string {
  if (message.category === "matchday") {
    return message.blockerKeys.length > 0
      ? "career.inbox.preview.matchdayPreparation"
      : "career.inbox.preview.matchdayReady";
  }

  return `career.inbox.preview.${message.category}`;
}

/** Delivers a due matchday fact or refreshes its existing current-season message. */
function refreshExistingInboxFacts(careerState: WebCareerState): WebCareerState {
  let refreshed = reconcileCareerInboxResolution(careerState);
  const nextFixture = findNextCareerFixture(refreshed);
  if (nextFixture.status !== "found") return refreshed;
  const message = createMatchdayAttention({
    fixtureId: nextFixture.fixture.id,
    clubId: refreshed.selectedClubId,
    date: nextFixture.fixture.date,
    preparation: matchdayPreparationFacts(refreshed, nextFixture.fixture.id),
  }).message;
  const isDelivered = refreshed.currentSeasonInbox?.some((candidate) => candidate.id === message.id) === true;
  const isDue = message.date <= refreshed.gameState.calendar.currentDate;
  if (isDelivered || isDue) refreshed = deliverCareerInboxMessages(refreshed, [message]);
  return refreshed;
}

/** Derives fixture readiness without mutating the durable preparation. */
function matchdayPreparationFacts(
  careerState: WebCareerState,
  fixtureId: WebCareerState["gameState"]["fixtureIds"][number],
): Parameters<typeof createMatchdayAttention>[0]["preparation"] {
  const preparation = careerState.matchPreparation;
  const targetsFixture = preparation?.targetFixtureId === fixtureId;
  const benchSlots = targetsFixture ? preparation?.benchSlots ?? [] : [];
  const hasBenchGoalkeeper = benchSlots.some((slot) =>
    careerState.gameState.players[slot.playerId]?.naturalPositions.includes("gk") === true,
  );

  return {
    hasSavedLineup: targetsFixture && preparation?.selectedLineup !== undefined,
    hasSavedTactic: targetsFixture && preparation?.tactic !== undefined,
    hasCompleteBench: benchSlots.length === 8,
    hasBenchGoalkeeper,
    ...(targetsFixture ? { targetFixtureId: fixtureId } : {}),
  };
}

/** Returns a structural state copy whose only changed fact is the world date. */
function withCurrentDate(careerState: WebCareerState, dateIso: string): WebCareerState {
  const stopDate = fromISO(dateIso);
  if (stopDate === careerState.gameState.calendar.currentDate) return careerState;

  return {
    ...careerState,
    gameState: {
      ...careerState.gameState,
      calendar: {
        ...careerState.gameState.calendar,
        currentDate: stopDate as WebCareerState["gameState"]["calendar"]["currentDate"],
      },
    },
  };
}

/** Builds one validated career snapshot from an explicit durable identity. */
export function buildWebCareerState(identity: WebCareerIdentity): WebCareerState {
  const league = createFakeLeagueSystem({ worldSeed: identity.worldSeed });
  const selectedClubId = requiredSelectedClubId(league);
  const calendar = generateRoundRobinCalendar({
    seed: identity.worldSeed,
    seasonId: league.seasonId,
    competitionId: league.competition.id,
    clubIds: league.clubIds,
    seasonStartDate: league.seasonStartDate,
  });
  const youthAcademies = generateInitialYouthAcademies({
    worldSeed: identity.worldSeed,
    seasonId: league.seasonId,
    referenceDate: league.seasonStartDate,
    clubIds: league.clubIds,
    clubContexts: youthClubContexts(league),
  });

  return {
    saveId: identity.saveId,
    schemaVersion: 1,
    careerWorld: {
      worldSeed: identity.worldSeed,
      generatorVersion: WEB_CAREER_WORLD_GENERATOR_VERSION,
      creationSourceKey: "career:web-new-world",
    },
    selectedClubId,
    gameState: {
      meta: {
        seed: identity.worldSeed,
        rngAlgorithmVersion: "sfc32-cyrb128-v1",
        saveSchemaVersion: 1,
      },
      calendar: {
        currentDate: league.seasonStartDate,
        currentSeasonId: league.seasonId,
      },
      players: { ...league.players, ...youthAcademies.players },
      playerIds: [...league.playerIds, ...youthAcademies.playerIds],
      playerStates: { ...league.playerStates, ...youthAcademies.playerStates },
      clubs: league.clubsById,
      clubIds: league.clubIds,
      fixtures: indexFixtures(calendar.fixtures),
      fixtureIds: calendar.fixtureIds,
    },
    youthAcademyState: youthAcademies.youthAcademyState,
    marketState: {
      clubBudgets: {
        [selectedClubId]: { clubId: selectedClubId, transferBudget: 6_000_000_00 },
      },
      clubBudgetIds: [selectedClubId],
    },
    transferHistory: [],
  } as unknown as WebCareerState;
}

/** Allocates one browser career ID and uses the same stable token as its seed. */
function createBrowserCareerIdentity(): WebCareerIdentity {
  const token = globalThis.crypto?.randomUUID();
  if (token === undefined) {
    throw new Error("Browser cryptographic identity allocation is unavailable");
  }

  return {
    saveId: `save:web-${token}` as WebCareerSaveId,
    worldSeed: `web-${token}`,
  };
}

/** Selects the first deterministic generated club for the first web MVP. */
function requiredSelectedClubId(league: FakeLeagueSystem): LeagueClubId {
  const selectedClubId = league.clubIds[0];
  if (selectedClubId === undefined) throw new Error("Generated league has no selectable club");
  return selectedClubId;
}

/** Indexes engine-generated fixtures while preserving their separate order. */
function indexFixtures(
  fixtures: ReturnType<typeof generateRoundRobinCalendar>["fixtures"],
): WebCareerState["gameState"]["fixtures"] {
  return Object.fromEntries(fixtures.map((fixture) => [fixture.id, fixture])) as WebCareerState["gameState"]["fixtures"];
}

/** Supplies division and reputation facts required by youth generation. */
function youthClubContexts(league: FakeLeagueSystem): Parameters<typeof generateInitialYouthAcademies>[0]["clubContexts"] {
  const contexts: Partial<Record<LeagueClubId, InitialYouthAcademyClubContext>> = {};
  for (const clubId of league.clubIds) {
    const club = league.clubsById[clubId];
    if (club !== undefined) contexts[clubId] = { category: club.category, reputation: club.reputation };
  }
  return contexts as Parameters<typeof generateInitialYouthAcademies>[0]["clubContexts"];
}
