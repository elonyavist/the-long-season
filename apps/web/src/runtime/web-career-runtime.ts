import {
  createAnnualWorldIntakeCandidateProviders,
  createFakeDomesticWorld,
  playerEconomyCalibration,
  selectAskingPriceCurves,
  selectMarketBehaviorCalibration,
  selectPlayerValuationConfig,
  selectPlayerWagePolicyConfig,
} from "@game/content";
import {
  acceptContractCounterOffer,
  acceptPreliminaryAgreementCounter,
  acceptTransferCounter,
  acceptTransferPlayerCounter,
  acknowledgeImportantCareerInboxMessage,
  advanceCareerOneSeason,
  advanceSelectedClubWorkflowsToAttention,
  applyCareerFreeAgentSigning,
  chooseReleaseAtContractExpiry,
  createMatchdayAttention,
  createPreliminaryAgreementId,
  createRenewalNegotiationId,
  createTransferNegotiationId,
  combineDomesticCompetitionCalendars,
  findNextCareerFixture,
  offerSelectedClubRenewal,
  openCareerInboxMessage,
  rejectContractCounterOffer,
  rejectPreliminaryAgreementCounter,
  rejectTransferPlayerCounter,
  reviseContractOffer,
  submitContractOffer,
  submitPreliminaryAgreementOffer,
  submitTransferOffer,
  submitTransferPlayerOffer,
  withdrawContractNegotiation,
  withdrawPreliminaryAgreement,
  withdrawTransferNegotiation,
  type ApplyCareerFreeAgentSigningResult,
  type AdvanceCareerOneSeasonResult,
  type ContractNegotiationCommandResult,
  type ContractNegotiationRejectionReason,
  type ContinueCareerUntilAttentionResult,
  type PreliminaryAgreementCommandResult,
  type TransferNegotiationCommandResult,
  type TransferPlayerNegotiationCommandResult,
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
import type { CareerContractTermsInput, CareerInboxMessageInput } from "@game/ui";

import { resolveCareerTransferWindows } from "../features/market/market-transfer-windows";
import {
  advanceWebLiveMatchdayMinute,
  applyWebLiveMatchTeamChanges,
  commitWebLiveMatchday,
  createWebLiveMatchdaySession,
  createWebMatchdayState,
  pauseWebLiveMatchday,
  resolveWebLiveMatchdayIncident,
  resumeWebLiveMatchday,
  type WebLiveMatchdaySession,
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
type PlayerEconomyCalibrationVersionBundle = NonNullable<
  WebCareerState["gameState"]["meta"]["calibrationVersions"]
>;

/** Inbox identity projected through the approved storage-owned career state. */
export type WebCareerInboxMessageId = NonNullable<
  WebCareerState["currentSeasonInbox"]
>[number]["id"];

/** Save ID type exposed through the architecture-approved storage seam. */
export type WebCareerSaveId = Parameters<CareerStorage["loadCareer"]>[0];

type WebContractPlayerId = Parameters<typeof offerSelectedClubRenewal>[0]["playerId"];
type WebContractNegotiationId = Parameters<typeof acceptContractCounterOffer>[0]["negotiationId"];
type WebContractNegotiation = Extract<
  ContractNegotiationCommandResult,
  { readonly status: "applied" }
>["negotiation"];

type WebMarketPlayerId = Parameters<typeof submitTransferOffer>[0]["playerId"];
type WebMarketClubId = Parameters<typeof submitTransferOffer>[0]["sellingClubId"];
type WebTransferNegotiationId = Parameters<typeof acceptTransferCounter>[0]["negotiationId"];
type WebPreliminaryAgreementId = Parameters<typeof acceptPreliminaryAgreementCounter>[0]["agreementId"];
type WebTransferFee = Parameters<typeof submitTransferOffer>[0]["offeredFee"];
type WebTransferNegotiation = Extract<
  TransferNegotiationCommandResult | TransferPlayerNegotiationCommandResult,
  { readonly status: "applied" }
>["negotiation"];
type WebPreliminaryAgreement = Extract<
  PreliminaryAgreementCommandResult,
  { readonly status: "applied" }
>["agreement"];

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

/** Working-session result of attempting the complete domestic season boundary. */
export interface RolledOverWebCareerSeason {
  readonly result: AdvanceCareerOneSeasonResult;
  readonly state: WebCareerState;
  readonly sessionStatus: CareerSessionStatus;
}

/** Successful explicit or scheduled commit of the current working session. */
export interface CommittedWebCareerSession {
  readonly metadata: CareerSaveMetadata;
  readonly state: WebCareerState;
  readonly continueResult: WebCareerContinueResult;
  readonly sessionStatus: CareerSessionStatus;
}

/** Explicit selected-club contract action accepted by the web application seam. */
export type WebSelectedClubContractCommand =
  | Readonly<{
      type: "offer_renewal";
      playerId: string;
      terms: CareerContractTermsInput;
    }>
  | Readonly<{
      type: "revise_offer";
      negotiationId: string;
      terms: CareerContractTermsInput;
    }>
  | Readonly<{
      type: "submit_offer";
      negotiationId: string;
    }>
  | Readonly<{
      type: "accept_counter" | "reject_counter" | "withdraw_offer";
      negotiationId: string;
    }>
  | Readonly<{
      type: "release_at_expiry";
      playerId: string;
      negotiationId?: string;
    }>;

/** Successful selected-club contract action projected from the working session. */
export interface AppliedWebSelectedClubContractCommand {
  readonly status: "applied";
  readonly state: WebCareerState;
  readonly negotiation: WebContractNegotiation;
  readonly continueResult: WebCareerContinueResult;
  readonly sessionStatus: CareerSessionStatus;
}

/** Structured contract rejection that preserves the exact working session. */
export interface RejectedWebSelectedClubContractCommand {
  readonly status: "rejected";
  readonly state: WebCareerState;
  readonly reason: ContractNegotiationRejectionReason;
  readonly negotiationId?: WebContractNegotiationId;
  readonly continueResult: WebCareerContinueResult;
  readonly sessionStatus: CareerSessionStatus;
}

/** Result shared by every selected-club contract action in the web runtime. */
export type WebSelectedClubContractCommandResult =
  | AppliedWebSelectedClubContractCommand
  | RejectedWebSelectedClubContractCommand;

/**
 * Explicit selected-club market action accepted by the web application seam.
 *
 * Club-stage and player-stage permanent-transfer talks share one negotiation
 * identity once submitted; preliminary agreements use a separate identity.
 * Submission never reserves money (Phase 79 locked rule).
 */
export type WebSelectedClubMarketCommand =
  | Readonly<{
      type: "submit_transfer_offer";
      playerId: string;
      sellingClubId: string;
      offeredFee: WebTransferFee;
    }>
  | Readonly<{
      type: "accept_transfer_counter" | "withdraw_transfer_offer";
      negotiationId: string;
    }>
  | Readonly<{
      type: "submit_transfer_player_offer";
      negotiationId: string;
      terms: CareerContractTermsInput;
    }>
  | Readonly<{
      type: "accept_transfer_player_counter" | "reject_transfer_player_counter";
      negotiationId: string;
    }>
  | Readonly<{
      type: "submit_preliminary_agreement";
      playerId: string;
      terms: CareerContractTermsInput;
    }>
  | Readonly<{
      type: "accept_preliminary_agreement_counter"
        | "reject_preliminary_agreement_counter"
        | "withdraw_preliminary_agreement";
      agreementId: string;
    }>
  | Readonly<{
      type: "sign_free_agent";
      playerId: string;
      terms: CareerContractTermsInput;
    }>;

/** Immediate free-agent signing outcome; there is no negotiation stage to resume. */
export interface WebFreeAgentSigningOutcome {
  readonly kind: "free_agent_signed";
  readonly playerId: string;
  readonly activatedContractId: string;
}

/** Successful selected-club market action projected from the working session. */
export interface AppliedWebSelectedClubMarketCommand {
  readonly status: "applied";
  readonly state: WebCareerState;
  readonly outcome: WebTransferNegotiation | WebPreliminaryAgreement | WebFreeAgentSigningOutcome;
  readonly continueResult: WebCareerContinueResult;
  readonly sessionStatus: CareerSessionStatus;
}

/** Structured market rejection that preserves the exact working session. */
export interface RejectedWebSelectedClubMarketCommand {
  readonly status: "rejected";
  readonly state: WebCareerState;
  readonly reason: string;
  readonly continueResult: WebCareerContinueResult;
  readonly sessionStatus: CareerSessionStatus;
}

/** Result shared by every selected-club market action in the web runtime. */
export type WebSelectedClubMarketCommandResult =
  | AppliedWebSelectedClubMarketCommand
  | RejectedWebSelectedClubMarketCommand;

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

/** Narrow result for one live minute; broader career facts publish only after full-time review. */
export type AdvancedWebMatchdayMinute = Readonly<{
  status: "live" | "full_time";
  matchdayState: WebMatchdayState;
}>;

/** Memory-only result for a live command that must not republish career-wide facts. */
export type VolatileWebMatchdayUpdate = Readonly<{
  matchdayState: WebMatchdayState;
}>;

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
  private liveMatchdaySession: WebLiveMatchdaySession | undefined;

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
    this.liveMatchdaySession = undefined;
    const [state, saves] = await Promise.all([
      this.storage.loadCareer(requestedSaveId),
      this.storage.listCareers(),
    ]);
    const metadata = saves.find((entry) => entry.saveId === requestedSaveId);
    if (metadata === undefined) {
      throw new Error(`Loaded career metadata is missing: ${requestedSaveId}`);
    }
    try {
      assertSupportedWebCareerCalibrationVersions(state);
    } catch (error) {
      if (
        error instanceof StorageError
        && error.code === "unsupported_schema_version"
      ) {
        await this.storage.deleteCareer(requestedSaveId);
        this.session = undefined;
      }
      throw error;
    }
    this.session = new CareerSession(state, metadata);
    const refreshedState = refreshExistingInboxFacts(state);
    if (refreshedState !== state) this.session.replaceWorkingState(refreshedState);
    return this.session.workingState();
  }

  /** Generates and durably saves a new career before exposing it to the UI. */
  public async createNewCareer(): Promise<CreatedWebCareer> {
    this.liveMatchdaySession = undefined;
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
    assertSupportedWebCareerCalibrationVersions(state);
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
    const nextState = withCurrentDate(inspection.careerState, continueResult.stopDateIso);
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

  /**
   * Rolls every completed domestic competition into the next season in memory.
   *
   * The engine publishes the full boundary atomically. An invalid boundary
   * leaves the loaded working session unchanged; persistence remains an
   * explicit runtime action so no partial durable save can escape.
   */
  public rolloverCompletedSeason(
    requestedSaveId: WebCareerSaveId,
  ): RolledOverWebCareerSeason {
    const session = this.requireSession(requestedSaveId);
    const currentState = session.workingState();
    const result = rolloverCompletedWebCareerSeason(currentState);
    if (result.status === "invalid") {
      return {
        result,
        state: currentState,
        sessionStatus: session.status(),
      };
    }
    const state = session.replaceWorkingState(
      refreshExistingInboxFacts(result.careerState),
    ).workingState;
    return {
      result,
      state,
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

  /**
   * Applies one explicit selected-club contract action to the working session.
   *
   * Contract commands never save implicitly. Their authoritative engine state
   * is reconciled back into Posta before the result reaches presentation.
   */
  public applySelectedClubContractCommand(
    requestedSaveId: WebCareerSaveId,
    command: WebSelectedClubContractCommand,
  ): WebSelectedClubContractCommandResult {
    const session = this.requireSession(requestedSaveId);
    const currentState = session.workingState();
    const decidedOn = currentState.gameState.calendar.currentDate;
    const wagePolicy = selectPlayerWagePolicyConfig(
      currentState.gameState.meta.calibrationVersions,
    );
    const result = (() => {
      switch (command.type) {
        case "offer_renewal": {
          const playerId = resolveContractPlayerId(currentState, command.playerId);
          return offerSelectedClubRenewal({
            careerState: currentState,
            negotiationId: nextRenewalNegotiationId(currentState, playerId),
            playerId,
            offeredOn: decidedOn,
            terms: command.terms,
            wagePolicy,
          });
        }
        case "revise_offer":
          return reviseContractOffer({
            careerState: currentState,
            negotiationId: resolveContractNegotiationId(currentState, command.negotiationId),
            revisedOn: decidedOn,
            terms: command.terms,
          });
        case "submit_offer":
          return submitContractOffer({
            careerState: currentState,
            negotiationId: resolveContractNegotiationId(currentState, command.negotiationId),
            submittedOn: decidedOn,
            wagePolicy,
          });
        case "accept_counter":
          return acceptContractCounterOffer({
            careerState: currentState,
            negotiationId: resolveContractNegotiationId(currentState, command.negotiationId),
            decidedOn,
            wagePolicy,
          });
        case "reject_counter":
          return rejectContractCounterOffer({
            careerState: currentState,
            negotiationId: resolveContractNegotiationId(currentState, command.negotiationId),
            decidedOn,
            wagePolicy,
          });
        case "withdraw_offer":
          return withdrawContractNegotiation({
            careerState: currentState,
            negotiationId: resolveContractNegotiationId(currentState, command.negotiationId),
            decidedOn,
            wagePolicy,
          });
        case "release_at_expiry": {
          const playerId = resolveContractPlayerId(currentState, command.playerId);
          return chooseReleaseAtContractExpiry({
            careerState: currentState,
            negotiationId: command.negotiationId
              ? resolveContractNegotiationId(currentState, command.negotiationId)
              : nextRenewalNegotiationId(currentState, playerId),
            playerId,
            clubId: currentState.selectedClubId,
            decidedOn,
          });
        }
      }
    })();

    if (result.status === "rejected") {
      return {
        status: "rejected",
        state: currentState,
        reason: result.reason,
        ...(result.negotiationId === undefined ? {} : { negotiationId: result.negotiationId }),
        continueResult: inspectWebCareerAttention(currentState),
        sessionStatus: session.status(),
      };
    }

    const state = session.replaceWorkingState(
      refreshExistingInboxFacts(result.careerState),
    ).workingState;
    return {
      status: "applied",
      state,
      negotiation: result.negotiation,
      continueResult: inspectWebCareerAttention(state),
      sessionStatus: session.status(),
    };
  }

  /**
   * Applies one explicit selected-club market action to the working session.
   *
   * Every branch delegates validation, affordability, and outcome entirely to
   * the matching engine command; the runtime only resolves presentation IDs
   * into canonical ones, supplies the resolved transfer-window catalog, and
   * reconciles the resulting session the same way contract commands do.
   */
  public applySelectedClubMarketCommand(
    requestedSaveId: WebCareerSaveId,
    command: WebSelectedClubMarketCommand,
  ): WebSelectedClubMarketCommandResult {
    const session = this.requireSession(requestedSaveId);
    const currentState = session.workingState();
    const decidedOn = currentState.gameState.calendar.currentDate;
    const transferWindows = resolveCareerTransferWindows(currentState);
    const wagePolicy = selectPlayerWagePolicyConfig(
      currentState.gameState.meta.calibrationVersions,
    );
    const marketBehaviorPolicy = selectMarketBehaviorCalibration(
      currentState.gameState.meta.calibrationVersions,
    );

    // Free-agent signing is an immediate apply with no negotiation stage, so
    // it does not fit the shared negotiation/agreement outcome shape below.
    if (command.type === "sign_free_agent") {
      const playerId = resolveMarketPlayerId(currentState, command.playerId);
      const signing: ApplyCareerFreeAgentSigningResult = applyCareerFreeAgentSigning({
        careerState: currentState,
        playerId,
        clubId: currentState.selectedClubId,
        occurredOn: decidedOn,
        transferWindows,
        acceptedTerms: command.terms,
        wagePolicy,
        marketBehaviorPolicy,
        valuationConfig: selectPlayerValuationConfig(
          currentState.gameState.meta.calibrationVersions,
        ),
        askingPriceConfig: selectAskingPriceCurves(
          currentState.gameState.meta.calibrationVersions,
        ),
      });
      if (signing.status === "rejected") {
        return {
          status: "rejected",
          state: currentState,
          reason: signing.reason,
          continueResult: inspectWebCareerAttention(currentState),
          sessionStatus: session.status(),
        };
      }
      const signedState = session.replaceWorkingState(
        refreshExistingInboxFacts(signing.careerState),
      ).workingState;
      return {
        status: "applied",
        state: signedState,
        outcome: {
          kind: "free_agent_signed",
          playerId: command.playerId,
          activatedContractId: String(signing.activatedContractId),
        },
        continueResult: inspectWebCareerAttention(signedState),
        sessionStatus: session.status(),
      };
    }

    const result: TransferNegotiationCommandResult | TransferPlayerNegotiationCommandResult | PreliminaryAgreementCommandResult = (() => {
      switch (command.type) {
        case "submit_transfer_offer": {
          const playerId = resolveMarketPlayerId(currentState, command.playerId);
          return submitTransferOffer({
            careerState: currentState,
            negotiationId: nextTransferNegotiationId(currentState, playerId),
            buyingClubId: currentState.selectedClubId,
            sellingClubId: resolveMarketClubId(currentState, command.sellingClubId),
            playerId,
            offeredFee: command.offeredFee,
            submittedOn: decidedOn,
            transferWindows,
            valuationConfig: selectPlayerValuationConfig(
              currentState.gameState.meta.calibrationVersions,
            ),
            askingPriceConfig: selectAskingPriceCurves(
              currentState.gameState.meta.calibrationVersions,
            ),
            marketBehaviorPolicy,
          });
        }
        case "accept_transfer_counter":
          return acceptTransferCounter({
            careerState: currentState,
            negotiationId: resolveTransferNegotiationId(currentState, command.negotiationId),
            decidedOn,
            marketBehaviorPolicy,
          });
        case "withdraw_transfer_offer":
          return withdrawTransferNegotiation({
            careerState: currentState,
            negotiationId: resolveTransferNegotiationId(currentState, command.negotiationId),
            decidedOn,
          });
        case "submit_transfer_player_offer":
          return submitTransferPlayerOffer({
            careerState: currentState,
            negotiationId: resolveTransferNegotiationId(currentState, command.negotiationId),
            submittedOn: decidedOn,
            terms: command.terms,
            transferWindows,
            wagePolicy,
            marketBehaviorPolicy,
          });
        case "accept_transfer_player_counter":
          return acceptTransferPlayerCounter({
            careerState: currentState,
            negotiationId: resolveTransferNegotiationId(currentState, command.negotiationId),
            decidedOn,
            transferWindows,
            wagePolicy,
            marketBehaviorPolicy,
          });
        case "reject_transfer_player_counter":
          return rejectTransferPlayerCounter({
            careerState: currentState,
            negotiationId: resolveTransferNegotiationId(currentState, command.negotiationId),
            decidedOn,
            transferWindows,
            wagePolicy,
            marketBehaviorPolicy,
          });
        case "submit_preliminary_agreement": {
          const playerId = resolveMarketPlayerId(currentState, command.playerId);
          return submitPreliminaryAgreementOffer({
            careerState: currentState,
            agreementId: nextPreliminaryAgreementId(currentState, playerId),
            playerId,
            offeringClubId: currentState.selectedClubId,
            submittedOn: decidedOn,
            terms: command.terms,
            transferWindows,
            wagePolicy,
          });
        }
        case "accept_preliminary_agreement_counter":
          return acceptPreliminaryAgreementCounter({
            careerState: currentState,
            agreementId: resolvePreliminaryAgreementId(currentState, command.agreementId),
            decidedOn,
            wagePolicy,
            marketBehaviorPolicy,
          });
        case "reject_preliminary_agreement_counter":
          return rejectPreliminaryAgreementCounter({
            careerState: currentState,
            agreementId: resolvePreliminaryAgreementId(currentState, command.agreementId),
            decidedOn,
          });
        case "withdraw_preliminary_agreement":
          return withdrawPreliminaryAgreement({
            careerState: currentState,
            agreementId: resolvePreliminaryAgreementId(currentState, command.agreementId),
            withdrawnOn: decidedOn,
          });
      }
    })();

    if (result.status === "rejected") {
      return {
        status: "rejected",
        state: currentState,
        reason: result.reason,
        continueResult: inspectWebCareerAttention(currentState),
        sessionStatus: session.status(),
      };
    }

    const state = session.replaceWorkingState(
      refreshExistingInboxFacts(result.careerState),
    ).workingState;
    return {
      status: "applied",
      state,
      outcome: "negotiation" in result ? result.negotiation : result.agreement,
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
    if (this.liveMatchdaySession !== undefined) {
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

  /** Creates a fresh memory-only live session before publishing pre-match. */
  private enterPreparedMatchday(session: CareerSession): PreparedWebMatchday {
    const created = createWebLiveMatchdaySession(session.workingState());
    if (created.status !== "ready") {
      throw new Error(created.matchdayState.lastSessionAttempt.invalidReason ?? "Matchday session could not be created");
    }

    this.liveMatchdaySession = created.session;
    const state = session.replaceWorkingState(refreshExistingInboxFacts(created.session.careerState)).workingState;
    this.liveMatchdaySession = { ...created.session, careerState: state };
    session.postponeAutosaveIfDue();

    return {
      metadata: session.metadata(),
      state,
      continueResult: inspectWebCareerAttention(state),
      sessionStatus: session.status(),
      matchdayState: createWebMatchdayState(state, undefined, this.liveMatchdaySession),
    };
  }

  /** Starts or resumes the clock without simulating a minute immediately. */
  public resumeMatchday(
    requestedSaveId: WebCareerSaveId,
    preparation?: MatchPreparationDraft,
  ): VolatileWebMatchdayUpdate {
    this.requireSession(requestedSaveId);
    let liveSession = this.requireLiveMatchdaySession();
    if (preparation !== undefined) {
      const applied = applyWebLiveMatchTeamChanges(liveSession, preparation);
      liveSession = applied.session;
      if (applied.status === "invalid") {
        this.liveMatchdaySession = liveSession;
        return this.projectVolatileMatchdayUpdate();
      }
    }
    this.liveMatchdaySession = resumeWebLiveMatchday(liveSession);
    return this.projectVolatileMatchdayUpdate();
  }

  /** Applies paused-match team changes without advancing, resuming, or saving. */
  public applyMatchdayTeamChanges(
    requestedSaveId: WebCareerSaveId,
    preparation: MatchPreparationDraft,
  ): VolatileWebMatchdayUpdate {
    this.requireSession(requestedSaveId);
    const applied = applyWebLiveMatchTeamChanges(this.requireLiveMatchdaySession(), preparation);
    this.liveMatchdaySession = applied.session;
    return this.projectVolatileMatchdayUpdate();
  }

  /** Requests a manual pause after the last fully completed minute. */
  public pauseMatchday(requestedSaveId: WebCareerSaveId): VolatileWebMatchdayUpdate {
    this.requireSession(requestedSaveId);
    this.liveMatchdaySession = pauseWebLiveMatchday(this.requireLiveMatchdaySession());
    return this.projectVolatileMatchdayUpdate();
  }

  /** Resolves the current automatic incident pause without advancing the clock. */
  public resolveMatchdayIncident(requestedSaveId: WebCareerSaveId): VolatileWebMatchdayUpdate {
    this.requireSession(requestedSaveId);
    const liveSession = this.requireLiveMatchdaySession();
    const decision = liveSession.engineState.pendingDecision;
    if (decision === undefined || decision.type === "half_time") {
      throw new Error("No match incident is waiting for a manager decision");
    }
    this.liveMatchdaySession = resolveWebLiveMatchdayIncident(
      liveSession,
      "acknowledge",
    );
    return this.projectVolatileMatchdayUpdate();
  }

  /** Advances exactly one in-memory engine minute. */
  public advanceMatchdayMinute(requestedSaveId: WebCareerSaveId): AdvancedWebMatchdayMinute {
    this.requireSession(requestedSaveId);
    const advanced = advanceWebLiveMatchdayMinute(this.requireLiveMatchdaySession());
    this.liveMatchdaySession = advanced.session;

    if (advanced.session.engineState.phase !== "full_time") {
      return {
        status: "live",
        matchdayState: advanced.matchdayState,
      };
    }

    return {
      status: "full_time",
      matchdayState: advanced.matchdayState,
    };
  }

  /** Publishes the reviewed full-time result and keeps the used plan as an unconfirmed draft. */
  public async acknowledgeMatchday(requestedSaveId: WebCareerSaveId): Promise<UpdatedWebMatchday> {
    const session = this.requireSession(requestedSaveId);
    const completedMatch = this.requireLiveMatchdaySession();
    if (completedMatch.engineState.phase !== "full_time") {
      throw new Error("The live match cannot be published before full time");
    }
    const committed = commitWebLiveMatchday(completedMatch);
    if (committed.status !== "advanced") {
      throw new Error(committed.reason);
    }
    const previousState = session.workingState();
    const nextState = carryCompletedPreparationAsDraft(committed.careerState);
    session.replaceWorkingState(refreshExistingInboxFacts(nextState));
    try {
      await this.autosaveAtSafeStop(session);
    } catch (error) {
      session.replaceWorkingState(previousState);
      throw error;
    }
    this.liveMatchdaySession = undefined;
    return this.buildMatchdayUpdate(session);
  }

  /** Projects only live facts; career-wide state and attention stay untouched until full-time Continue. */
  private projectVolatileMatchdayUpdate(): VolatileWebMatchdayUpdate {
    const liveSession = this.requireLiveMatchdaySession();
    return {
      matchdayState: createWebMatchdayState(liveSession.careerState, undefined, liveSession),
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
      matchdayState: createWebMatchdayState(state, undefined, this.liveMatchdaySession),
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

  /** Returns the active private match session or rejects an invalid command sequence. */
  private requireLiveMatchdaySession(): WebLiveMatchdaySession {
    if (this.liveMatchdaySession === undefined) {
      throw new Error("No live matchday session is active");
    }
    return this.liveMatchdaySession;
  }
}

/** Resolves a presentation player ID through canonical career ownership before an engine command. */
function resolveContractPlayerId(
  careerState: WebCareerState,
  rawPlayerId: string,
): WebContractPlayerId {
  const resolved = careerState.gameState.playerIds.find((playerId) => String(playerId) === rawPlayerId);
  if (resolved === undefined) {
    throw new Error(`Contract command player is missing from the career: ${rawPlayerId}`);
  }
  return resolved;
}

/** Resolves a presentation negotiation ID through durable state before an engine command. */
function resolveContractNegotiationId(
  careerState: WebCareerState,
  rawNegotiationId: string,
): WebContractNegotiationId {
  const resolved = careerState.contractNegotiationState?.negotiationIds.find(
    (negotiationId) => String(negotiationId) === rawNegotiationId,
  );
  if (resolved === undefined) {
    throw new Error(`Contract negotiation is missing from the career: ${rawNegotiationId}`);
  }
  return resolved;
}

/** Allocates the first unused stable renewal identity without random state. */
function nextRenewalNegotiationId(
  careerState: WebCareerState,
  playerId: WebContractPlayerId,
): WebContractNegotiationId {
  const negotiations = careerState.contractNegotiationState?.negotiations ?? {};
  let sequence = (careerState.contractNegotiationState?.negotiationIds.length ?? 0) + 1;
  let candidate = createRenewalNegotiationId(playerId, sequence);
  while (negotiations[candidate] !== undefined) {
    sequence += 1;
    candidate = createRenewalNegotiationId(playerId, sequence);
  }
  return candidate;
}

/** Resolves a presentation player ID through canonical career ownership before a market command. */
function resolveMarketPlayerId(
  careerState: WebCareerState,
  rawPlayerId: string,
): WebMarketPlayerId {
  const resolved = careerState.gameState.playerIds.find((playerId) => String(playerId) === rawPlayerId);
  if (resolved === undefined) {
    throw new Error(`Market command player is missing from the career: ${rawPlayerId}`);
  }
  return resolved;
}

/** Resolves a presentation club ID through canonical career ownership before a market command. */
function resolveMarketClubId(
  careerState: WebCareerState,
  rawClubId: string,
): WebMarketClubId {
  const resolved = careerState.gameState.clubIds.find((clubId) => String(clubId) === rawClubId);
  if (resolved === undefined) {
    throw new Error(`Market command club is missing from the career: ${rawClubId}`);
  }
  return resolved;
}

/** Resolves a presentation negotiation ID through durable state before a market command. */
function resolveTransferNegotiationId(
  careerState: WebCareerState,
  rawNegotiationId: string,
): WebTransferNegotiationId {
  const resolved = careerState.transferNegotiationState?.negotiationIds.find(
    (negotiationId) => String(negotiationId) === rawNegotiationId,
  );
  if (resolved === undefined) {
    throw new Error(`Transfer negotiation is missing from the career: ${rawNegotiationId}`);
  }
  return resolved;
}

/** Resolves a presentation agreement ID through durable state before a market command. */
function resolvePreliminaryAgreementId(
  careerState: WebCareerState,
  rawAgreementId: string,
): WebPreliminaryAgreementId {
  const resolved = careerState.preliminaryAgreementState?.agreementIds.find(
    (agreementId) => String(agreementId) === rawAgreementId,
  );
  if (resolved === undefined) {
    throw new Error(`Preliminary agreement is missing from the career: ${rawAgreementId}`);
  }
  return resolved;
}

/** Allocates the first unused stable transfer-negotiation identity without random state. */
function nextTransferNegotiationId(
  careerState: WebCareerState,
  playerId: WebMarketPlayerId,
): WebTransferNegotiationId {
  const negotiations = careerState.transferNegotiationState?.negotiations ?? {};
  let sequence = (careerState.transferNegotiationState?.negotiationIds.length ?? 0) + 1;
  let candidate = createTransferNegotiationId(careerState.selectedClubId, playerId, sequence);
  while (negotiations[candidate] !== undefined) {
    sequence += 1;
    candidate = createTransferNegotiationId(careerState.selectedClubId, playerId, sequence);
  }
  return candidate;
}

/** Allocates the first unused stable preliminary-agreement identity without random state. */
function nextPreliminaryAgreementId(
  careerState: WebCareerState,
  playerId: WebMarketPlayerId,
): WebPreliminaryAgreementId {
  const agreements = careerState.preliminaryAgreementState?.agreements ?? {};
  let sequence = (careerState.preliminaryAgreementState?.agreementIds.length ?? 0) + 1;
  let candidate = createPreliminaryAgreementId(playerId, careerState.selectedClubId, sequence);
  while (agreements[candidate] !== undefined) {
    sequence += 1;
    candidate = createPreliminaryAgreementId(playerId, careerState.selectedClubId, sequence);
  }
  return candidate;
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
  readonly careerState: WebCareerState;
  readonly result: ContinueCareerUntilAttentionResult;
} {
  return evaluateCanonicalCareerAttention(
    careerState,
    careerState.gameState.calendar.currentDate,
  );
}

/** Evaluates the next selected-club fixture as Continue's deterministic boundary. */
function advanceCanonicalCareerToAttention(careerState: WebCareerState): {
  readonly careerState: WebCareerState;
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
): {
  readonly careerState: WebCareerState;
  readonly result: ContinueCareerUntilAttentionResult;
} {
  const nextFixture = findNextCareerFixture(careerState);
  if (nextFixture.status === "invalid") {
    throw new Error(`Loaded career next fixture is invalid: ${nextFixture.reason}`);
  }

  const matchday = nextFixture.status === "found"
    ? createMatchdayAttention({
        fixtureId: nextFixture.fixture.id,
        clubId: careerState.selectedClubId,
        date: nextFixture.fixture.date,
        preparation: matchdayPreparationFacts(careerState, nextFixture.fixture.id),
      })
    : undefined;
  const evaluated = advanceSelectedClubWorkflowsToAttention({
    careerState,
    boundaryDate,
    valuationConfig: selectPlayerValuationConfig(
      careerState.gameState.meta.calibrationVersions,
    ),
    wagePolicy: selectPlayerWagePolicyConfig(
      careerState.gameState.meta.calibrationVersions,
    ),
    marketBehaviorPolicy: selectMarketBehaviorCalibration(
      careerState.gameState.meta.calibrationVersions,
    ),
    additionalMessages:
      matchday === undefined || matchday.message.date > boundaryDate
        ? []
        : [matchday.message],
    transferWindows: resolveCareerTransferWindows(careerState),
  });
  return { careerState: evaluated.careerState, result: evaluated.result };
}

/** Maps canonical Inbox facts onto the web presentation contract. */
function toWebCareerContinueResult(result: ContinueCareerUntilAttentionResult): WebCareerContinueResult {
  const firstMessage = result.stopReason === "attention"
    ? result.stopDateMessages.find(isUnresolvedAttentionMessage)
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
    ...(firstMessage === undefined
      ? {}
      : { selectedMessageId: String(firstMessage.id) }),
    inboxMessages: result.inboxMessages.map((message) => ({
      messageId: message.id,
      dateIso: toISO(message.date),
      category: message.category,
      priority: message.level === "blocking" ? "urgent" : message.level === "important" ? "important" : "routine",
      status: message.lifecycle.resolved ? "resolved" : message.lifecycle.read ? "read" : "unread",
      titleKey: `career.inbox.subject.${message.category}`,
      summaryKey: inboxMessagePreviewKey(message),
      actionRequired: isUnresolvedAttentionMessage(message),
      actions: message.actionIds.map((actionId) => ({
        actionId,
        labelKey: `career.inbox.action.${actionId}`,
      })),
    })),
  };
}

function isUnresolvedAttentionMessage(
  message: ContinueCareerUntilAttentionResult["stopDateMessages"][number],
): boolean {
  if (message.continuePolicy === "until_resolved") return !message.lifecycle.resolved;
  return message.continuePolicy === "until_acknowledged" && !message.lifecycle.acknowledged;
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
  return inspectCanonicalCareerAttention(careerState).careerState;
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
  const world = createFakeDomesticWorld({ worldSeed: identity.worldSeed });
  const selectedClubId = world.defaultSelectedClubId;
  const calendar = combineDomesticCompetitionCalendars(
    world.domesticCompetitionWorld,
    world.domesticCompetitionWorld.competitionIds.map((competitionId) => {
      const competition = world.domesticCompetitionWorld.competitions[competitionId];
      if (competition === undefined) throw new Error(`Missing domestic competition: ${competitionId}`);
      return generateRoundRobinCalendar({
        seed: identity.worldSeed,
        seasonId: world.seasonId,
        competitionId,
        clubIds: competition.clubIds,
        seasonStartDate: world.seasonStartDate,
      });
    }),
  );

  const state: WebCareerState = {
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
        calibrationVersions: { ...world.calibrationVersions },
      },
      calendar: {
        currentDate: world.seasonStartDate,
        currentSeasonId: world.seasonId,
      },
      players: { ...world.players, ...world.initialYouthAcademies.players },
      playerIds: [...world.playerIds, ...world.initialYouthAcademies.playerIds],
      playerStates: { ...world.playerStates, ...world.initialYouthAcademies.playerStates },
      clubs: world.clubsById,
      clubIds: world.clubIds,
      fixtures: indexFixtures(calendar.fixtures),
      fixtureIds: calendar.fixtureIds,
      domesticCompetitionWorld: world.domesticCompetitionWorld,
    },
    youthAcademyState: world.initialYouthAcademies.youthAcademyState,
    seniorSquadState: world.seniorSquadState,
    clubFinanceState: world.clubFinanceState,
    transferHistory: [],
  };
  return state;
}

/**
 * Applies the canonical completed-season boundary without reading or writing
 * browser storage. Keeping this adapter pure makes repeated-run checks cheap.
 */
export function rolloverCompletedWebCareerSeason(
  careerState: WebCareerState,
): AdvanceCareerOneSeasonResult {
  const worldSeed =
    careerState.careerWorld?.worldSeed ?? careerState.gameState.meta.seed;
  const annualIntake = createAnnualWorldIntakeCandidateProviders({
    worldSeed,
    seasonIndex: careerState.seasonHistory?.length ?? 0,
  });
  return advanceCareerOneSeason({
    careerState,
    worldSeed,
    mode: {
      kind: "completedSeason",
      tableRules: {
        pointsForWin: 3,
        pointsForDraw: 1,
        pointsForLoss: 0,
      },
    },
    wagePolicy: selectPlayerWagePolicyConfig(
      careerState.gameState.meta.calibrationVersions,
    ),
    marketBehaviorPolicy: selectMarketBehaviorCalibration(
      careerState.gameState.meta.calibrationVersions,
    ),
    createYouthIntakeCandidates: annualIntake.createYouthIntakeCandidates,
    createSeniorIntakeCandidates: annualIntake.createSeniorIntakeCandidates,
  });
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

/** Indexes engine-generated fixtures while preserving their separate order. */
function indexFixtures(
  fixtures: ReturnType<typeof generateRoundRobinCalendar>["fixtures"],
): WebCareerState["gameState"]["fixtures"] {
  return Object.fromEntries(fixtures.map((fixture) => [fixture.id, fixture])) as WebCareerState["gameState"]["fixtures"];
}

/**
 * Rejects loaded saves whose immutable topology/economy assets differ from the
 * only complete bundle supported by this web build.
 */
export function assertSupportedWebCareerCalibrationVersions(state: WebCareerState): void {
  const actual = state.gameState.meta.calibrationVersions;
  const expected = playerEconomyCalibration.versions;
  if (actual === undefined || !sameCalibrationVersions(actual, expected)) {
    throw new StorageError(
      "unsupported_schema_version",
      "Unsupported career topology/calibration versions",
    );
  }
}

function sameCalibrationVersions(
  actual: PlayerEconomyCalibrationVersionBundle,
  expected: PlayerEconomyCalibrationVersionBundle,
): boolean {
  const expectedKeys = Object.keys(expected);
  return Object.keys(actual).length === expectedKeys.length
    && expectedKeys.every((key) =>
    actual[key as keyof PlayerEconomyCalibrationVersionBundle]
      === expected[key as keyof PlayerEconomyCalibrationVersionBundle]
  );
}
