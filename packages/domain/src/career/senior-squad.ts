import type { GameState } from "../state/game-state.ts";
import type {
  ClubId,
  PlayerContractHistoryEntryId,
  PlayerContractId,
  PlayerId,
  SeniorSquadRegistrationId,
} from "../types/ids.ts";
import type { GameDate } from "../value-objects/game-date.ts";
import { nonNegativeMoney, type Money } from "../value-objects/money.ts";

/** Contract kinds currently backed by a real senior or youth lifecycle. */
export type PlayerContractType = "professional" | "youth";

/** Sporting role agreed between a club and a contracted player. */
export type AgreedSquadStatus = "key_player" | "regular_starter" | "squad_player" | "fringe_player" | "prospect";

/** Financial terms whose costs are consumed by the Phase 78 finance lifecycle. */
export interface PlayerContractBonuses {
  /** One-off amount due when the agreement becomes active. */
  readonly signingBonus: Money;
  /** Amount due for one competitive appearance. */
  readonly appearanceBonus: Money;
  /** Optional amount due for one goal. Goalkeepers do not receive this term. */
  readonly goalBonus?: Money;
  /** Optional amount due for a clean sheet in an eligible defensive role. */
  readonly cleanSheetBonus?: Money;
}

/** One immutable agreement between a player and a club. */
export interface PlayerContract {
  readonly id: PlayerContractId;
  readonly playerId: PlayerId;
  readonly clubId: ClubId;
  readonly type: PlayerContractType;
  readonly startsOn: GameDate;
  readonly endsOn: GameDate;
  readonly annualWage: Money;
  readonly squadStatus: AgreedSquadStatus;
  readonly bonuses: PlayerContractBonuses;
}

/** Current senior registration, including the player's persistent shirt number. */
export interface SeniorSquadRegistration {
  readonly id: SeniorSquadRegistrationId;
  readonly playerId: PlayerId;
  readonly clubId: ClubId;
  readonly shirtNumber: number;
  readonly registeredOn: GameDate;
}

/** Factual reasons why an immutable agreement starts or stops being active. */
export type PlayerContractHistoryEvent =
  | "signed"
  | "renewed"
  | "transfer_terminated"
  | "expired"
  | "released";

/** One ordered factual lifecycle event linked to an immutable contract. */
export interface PlayerContractHistoryEntry {
  readonly id: PlayerContractHistoryEntryId;
  readonly sequenceNumber: number;
  readonly occurredOn: GameDate;
  readonly event: PlayerContractHistoryEvent;
  readonly contractId: PlayerContractId;
  readonly playerId: PlayerId;
  readonly clubId: ClubId;
}

/** Canonical registration, contract, and contract-history state for senior squads. */
export interface SeniorSquadState {
  readonly registrations: Readonly<Record<SeniorSquadRegistrationId, SeniorSquadRegistration>>;
  readonly registrationIds: readonly SeniorSquadRegistrationId[];
  readonly contracts: Readonly<Record<PlayerContractId, PlayerContract>>;
  readonly contractIds: readonly PlayerContractId[];
  readonly activeContractIds: readonly PlayerContractId[];
  readonly contractHistory: Readonly<Record<PlayerContractHistoryEntryId, PlayerContractHistoryEntry>>;
  readonly contractHistoryEntryIds: readonly PlayerContractHistoryEntryId[];
}

/** World ownership facts required to validate registrations and contracts. */
export type SeniorSquadWorldSnapshot = Pick<GameState, "players" | "playerIds" | "clubs" | "clubIds">;

/** Facts required to replace one active agreement with an accepted renewal. */
export interface ActivateRenewedPlayerContractInput {
  readonly previousContractId: PlayerContractId;
  readonly contract: PlayerContract;
  readonly historyEntry: PlayerContractHistoryEntry;
}

/** Machine-readable senior-squad invariant failure. */
export type SeniorSquadStateErrorCode =
  | "duplicate_registration_id"
  | "registration_not_found"
  | "registration_player_not_found"
  | "registration_player_not_active"
  | "registration_club_not_found"
  | "registration_ownership_mismatch"
  | "invalid_shirt_number"
  | "duplicate_shirt_number"
  | "duplicate_player_registration"
  | "owned_player_registration_missing"
  | "duplicate_contract_id"
  | "contract_not_found"
  | "contract_player_not_found"
  | "contract_club_not_found"
  | "invalid_contract_dates"
  | "invalid_contract_money"
  | "duplicate_active_contract"
  | "active_contract_not_found"
  | "active_contract_ownership_mismatch"
  | "owned_player_active_contract_missing"
  | "duplicate_history_id"
  | "history_not_found"
  | "invalid_history_sequence"
  | "duplicate_history_sequence"
  | "history_contract_mismatch";

/** Error thrown when senior registration or contract state is inconsistent. */
export class SeniorSquadStateError extends Error {
  public readonly code: SeniorSquadStateErrorCode;

  public constructor(code: SeniorSquadStateErrorCode, message: string) {
    super(message);
    this.name = "SeniorSquadStateError";
    this.code = code;
  }
}

// Canonical career rows are immutable. Remembering the copies produced by
// this module lets later snapshots share unchanged rows while global
// ownership, uniqueness, and cross-record invariants are still revalidated.
const validatedRegistrations = new WeakSet<SeniorSquadRegistration>();
const validatedContracts = new WeakSet<PlayerContract>();
const validatedHistoryEntries = new WeakSet<PlayerContractHistoryEntry>();
const validatedRecords = new WeakSet<object>();
const validatedOrders = new WeakSet<readonly unknown[]>();
const validatedSeniorStates = new WeakMap<SeniorSquadState, SeniorSquadWorldSnapshot>();

/**
 * Validates the canonical senior-squad state against current world ownership.
 *
 * Ordered ID arrays are the deterministic traversal source. Record key order
 * is deliberately ignored.
 */
export function createSeniorSquadState(gameState: SeniorSquadWorldSnapshot, input: SeniorSquadState): SeniorSquadState {
  const previousWorld = validatedSeniorStates.get(input);
  if (
    previousWorld?.players === gameState.players
    && previousWorld.playerIds === gameState.playerIds
    && previousWorld.clubs === gameState.clubs
    && previousWorld.clubIds === gameState.clubIds
  ) return input;

  const registrations = validateRegistrations(gameState, input);
  const contracts = validateContracts(gameState, input);
  const activeContractIds = validateActiveContracts(gameState, input, contracts);
  const contractHistory = validateContractHistory(input, contracts);

  const result: SeniorSquadState = {
    registrations,
    registrationIds: validatedOrder(input.registrationIds),
    contracts,
    contractIds: validatedOrder(input.contractIds),
    activeContractIds,
    contractHistory,
    contractHistoryEntryIds: validatedOrder(input.contractHistoryEntryIds),
  };
  validatedSeniorStates.set(result, gameState);
  return result;
}

/**
 * Activates one accepted renewal without revalidating every historic contract.
 *
 * The input state is canonicalized once, then the command proves the local
 * replacement invariants: the same owned player stays at the same club, one
 * active agreement replaces another, and one correctly ordered history fact
 * is appended. The returned state is marked canonical for the same world.
 */
export function activateRenewedPlayerContract(
  gameState: SeniorSquadWorldSnapshot,
  state: SeniorSquadState,
  input: ActivateRenewedPlayerContractInput,
): SeniorSquadState {
  return activateRenewedPlayerContracts(gameState, state, [input]);
}

/**
 * Activates an ordered group of accepted renewals as one atomic state change.
 *
 * The function validates every replacement against the state produced by the
 * previous item, but clones the growing contract and history collections only
 * once. If any item is invalid, no partial result is returned.
 */
export function activateRenewedPlayerContracts(
  gameState: SeniorSquadWorldSnapshot,
  state: SeniorSquadState,
  inputs: readonly ActivateRenewedPlayerContractInput[],
): SeniorSquadState {
  const current = createSeniorSquadState(gameState, state);
  if (inputs.length === 0) return current;

  const contracts: Record<PlayerContractId, PlayerContract> = { ...current.contracts };
  const contractIds = [...current.contractIds];
  const activeContractIds = [...current.activeContractIds];
  const contractHistory: Record<PlayerContractHistoryEntryId, PlayerContractHistoryEntry> = {
    ...current.contractHistory,
  };
  const contractHistoryEntryIds = [...current.contractHistoryEntryIds];
  const activeIndexByContractId = new Map(
    activeContractIds.map((contractId, index) => [contractId, index] as const),
  );
  const addedContracts: PlayerContract[] = [];
  const addedHistoryEntries: PlayerContractHistoryEntry[] = [];

  for (const input of inputs) {
    const previous = contracts[input.previousContractId];
    if (previous === undefined) {
      fail("contract_not_found", `contract not found: ${input.previousContractId}`);
    }
    const activeIndex = activeIndexByContractId.get(previous.id);
    if (activeIndex === undefined) {
      fail("active_contract_not_found", `active contract not found: ${previous.id}`);
    }
    if (contracts[input.contract.id] !== undefined) {
      fail("duplicate_contract_id", `duplicate contract ID: ${input.contract.id}`);
    }
    const preservesContractType = input.contract.type === previous.type;
    const graduatesYouthContract = previous.type === "youth" && input.contract.type === "professional";
    if (
      input.contract.playerId !== previous.playerId
      || input.contract.clubId !== previous.clubId
      || (!preservesContractType && !graduatesYouthContract)
    ) {
      fail("active_contract_ownership_mismatch", `renewal does not replace the same agreement: ${input.contract.id}`);
    }
    if (
      gameState.players[input.contract.playerId] === undefined
      || gameState.clubs[input.contract.clubId] === undefined
      || !gameState.clubs[input.contract.clubId]?.playerIds.includes(input.contract.playerId)
    ) {
      fail("active_contract_ownership_mismatch", `renewal ownership mismatch: ${input.contract.id}`);
    }
    if (input.contract.startsOn >= input.contract.endsOn) {
      fail("invalid_contract_dates", `contract must end after it starts: ${input.contract.id}`);
    }
    validateContractMoney(input.contract);

    if (contractHistory[input.historyEntry.id] !== undefined) {
      fail("duplicate_history_id", `duplicate contract-history ID: ${input.historyEntry.id}`);
    }
    if (
      input.historyEntry.event !== "renewed"
      || input.historyEntry.sequenceNumber !== contractHistoryEntryIds.length + 1
      || input.historyEntry.contractId !== input.contract.id
      || input.historyEntry.playerId !== input.contract.playerId
      || input.historyEntry.clubId !== input.contract.clubId
    ) {
      fail("history_contract_mismatch", `renewal history does not match its contract: ${input.historyEntry.id}`);
    }

    const contract: PlayerContract = { ...input.contract, bonuses: { ...input.contract.bonuses } };
    const historyEntry: PlayerContractHistoryEntry = { ...input.historyEntry };
    contracts[contract.id] = contract;
    contractIds.push(contract.id);
    activeContractIds[activeIndex] = contract.id;
    activeIndexByContractId.delete(previous.id);
    activeIndexByContractId.set(contract.id, activeIndex);
    contractHistory[historyEntry.id] = historyEntry;
    contractHistoryEntryIds.push(historyEntry.id);
    addedContracts.push(contract);
    addedHistoryEntries.push(historyEntry);
  }

  for (const contract of addedContracts) validatedContracts.add(contract);
  for (const historyEntry of addedHistoryEntries) validatedHistoryEntries.add(historyEntry);
  validatedRecords.add(contracts);
  validatedRecords.add(contractHistory);
  validatedOrders.add(contractIds);
  validatedOrders.add(activeContractIds);
  validatedOrders.add(contractHistoryEntryIds);

  const result: SeniorSquadState = {
    ...current,
    contracts,
    contractIds,
    activeContractIds,
    contractHistory,
    contractHistoryEntryIds,
  };
  validatedSeniorStates.set(result, gameState);
  return result;
}

function validateRegistrations(
  gameState: SeniorSquadWorldSnapshot,
  input: SeniorSquadState,
): Record<SeniorSquadRegistrationId, SeniorSquadRegistration> {
  const reuseRecord = validatedRecords.has(input.registrations);
  const result: Record<SeniorSquadRegistrationId, SeniorSquadRegistration> = reuseRecord
    ? input.registrations as Record<SeniorSquadRegistrationId, SeniorSquadRegistration>
    : {};
  const seenIds = new Set<SeniorSquadRegistrationId>();
  const seenPlayers = new Set<PlayerId>();
  const shirtsByClub = new Map<ClubId, Set<number>>();
  const activePlayerIds = new Set(gameState.playerIds);

  for (const id of input.registrationIds) {
    if (seenIds.has(id)) fail("duplicate_registration_id", `duplicate registration ID: ${id}`);
    const registration = input.registrations[id];
    if (registration === undefined || registration.id !== id) fail("registration_not_found", `registration not found: ${id}`);
    if (gameState.players[registration.playerId] === undefined) fail("registration_player_not_found", `registration player not found: ${registration.playerId}`);
    if (!activePlayerIds.has(registration.playerId)) fail("registration_player_not_active", `registration player is not active: ${registration.playerId}`);
    const club = gameState.clubs[registration.clubId];
    if (club === undefined) fail("registration_club_not_found", `registration club not found: ${registration.clubId}`);
    if (!club.playerIds.includes(registration.playerId)) fail("registration_ownership_mismatch", `registration ownership mismatch: ${registration.playerId}`);
    if (
      !validatedRegistrations.has(registration)
      && (!Number.isSafeInteger(registration.shirtNumber) || registration.shirtNumber < 1 || registration.shirtNumber > 99)
    ) {
      fail("invalid_shirt_number", `invalid shirt number: ${registration.shirtNumber}`);
    }
    if (seenPlayers.has(registration.playerId)) fail("duplicate_player_registration", `player has multiple registrations: ${registration.playerId}`);
    const shirtNumbers = shirtsByClub.get(registration.clubId) ?? new Set<number>();
    if (shirtNumbers.has(registration.shirtNumber)) fail("duplicate_shirt_number", `duplicate shirt number ${registration.shirtNumber} at ${registration.clubId}`);
    shirtNumbers.add(registration.shirtNumber);
    shirtsByClub.set(registration.clubId, shirtNumbers);
    seenIds.add(id);
    seenPlayers.add(registration.playerId);
    if (!reuseRecord) {
      const canonical = validatedRegistrations.has(registration) ? registration : { ...registration };
      validatedRegistrations.add(canonical);
      result[id] = canonical;
    }
  }

  for (const clubId of gameState.clubIds) {
    for (const playerId of gameState.clubs[clubId]?.playerIds ?? []) {
      if (!seenPlayers.has(playerId)) fail("owned_player_registration_missing", `owned senior player has no registration: ${playerId}`);
    }
  }
  validatedRecords.add(result);
  return result;
}

function validateContracts(
  gameState: SeniorSquadWorldSnapshot,
  input: SeniorSquadState,
): Record<PlayerContractId, PlayerContract> {
  const reuseRecord = validatedRecords.has(input.contracts);
  const result: Record<PlayerContractId, PlayerContract> = reuseRecord
    ? input.contracts as Record<PlayerContractId, PlayerContract>
    : {};
  const seen = new Set<PlayerContractId>();
  for (const id of input.contractIds) {
    if (seen.has(id)) fail("duplicate_contract_id", `duplicate contract ID: ${id}`);
    const contract = input.contracts[id];
    if (contract === undefined || contract.id !== id) fail("contract_not_found", `contract not found: ${id}`);
    if (gameState.players[contract.playerId] === undefined) fail("contract_player_not_found", `contract player not found: ${contract.playerId}`);
    if (gameState.clubs[contract.clubId] === undefined) fail("contract_club_not_found", `contract club not found: ${contract.clubId}`);
    if (!validatedContracts.has(contract)) {
      if (contract.startsOn >= contract.endsOn) fail("invalid_contract_dates", `contract must end after it starts: ${id}`);
      validateContractMoney(contract);
    }
    seen.add(id);
    if (!reuseRecord) {
      const canonical = validatedContracts.has(contract)
        ? contract
        : { ...contract, bonuses: { ...contract.bonuses } };
      validatedContracts.add(canonical);
      result[id] = canonical;
    }
  }
  validatedRecords.add(result);
  return result;
}

function validateActiveContracts(
  gameState: SeniorSquadWorldSnapshot,
  input: SeniorSquadState,
  contracts: Readonly<Record<PlayerContractId, PlayerContract>>,
): PlayerContractId[] {
  const reuseOrder = validatedOrders.has(input.activeContractIds);
  const activeIds = new Set<PlayerContractId>();
  const activePlayers = new Set<PlayerId>();
  const result: PlayerContractId[] = reuseOrder
    ? input.activeContractIds as PlayerContractId[]
    : [];
  for (const id of input.activeContractIds) {
    if (activeIds.has(id)) fail("duplicate_active_contract", `duplicate active contract ID: ${id}`);
    const contract = contracts[id];
    if (contract === undefined) fail("active_contract_not_found", `active contract not found: ${id}`);
    const club = gameState.clubs[contract.clubId];
    if (club === undefined || !club.playerIds.includes(contract.playerId)) {
      fail("active_contract_ownership_mismatch", `active contract ownership mismatch: ${id}`);
    }
    if (activePlayers.has(contract.playerId)) fail("duplicate_active_contract", `player has multiple active contracts: ${contract.playerId}`);
    activeIds.add(id);
    activePlayers.add(contract.playerId);
    if (!reuseOrder) result.push(id);
  }
  for (const clubId of gameState.clubIds) {
    for (const playerId of gameState.clubs[clubId]?.playerIds ?? []) {
      if (!activePlayers.has(playerId)) fail("owned_player_active_contract_missing", `owned senior player has no active contract: ${playerId}`);
    }
  }
  validatedOrders.add(result);
  return result;
}

function validateContractHistory(
  input: SeniorSquadState,
  contracts: Readonly<Record<PlayerContractId, PlayerContract>>,
): Record<PlayerContractHistoryEntryId, PlayerContractHistoryEntry> {
  const reuseRecord = validatedRecords.has(input.contractHistory);
  const result: Record<PlayerContractHistoryEntryId, PlayerContractHistoryEntry> = reuseRecord
    ? input.contractHistory as Record<PlayerContractHistoryEntryId, PlayerContractHistoryEntry>
    : {};
  const seenIds = new Set<PlayerContractHistoryEntryId>();
  const seenSequences = new Set<number>();
  for (let index = 0; index < input.contractHistoryEntryIds.length; index += 1) {
    const id = input.contractHistoryEntryIds[index];
    if (id === undefined) continue;
    if (seenIds.has(id)) fail("duplicate_history_id", `duplicate contract-history ID: ${id}`);
    const entry = input.contractHistory[id];
    if (entry === undefined || entry.id !== id) fail("history_not_found", `contract-history entry not found: ${id}`);
    if (entry.sequenceNumber !== index + 1) {
      fail("invalid_history_sequence", `invalid contract-history sequence: ${entry.sequenceNumber}`);
    }
    if (seenSequences.has(entry.sequenceNumber)) fail("duplicate_history_sequence", `duplicate contract-history sequence: ${entry.sequenceNumber}`);
    const contract = contracts[entry.contractId];
    if (contract === undefined || contract.playerId !== entry.playerId || contract.clubId !== entry.clubId) {
      fail("history_contract_mismatch", `contract-history entry does not match its contract: ${id}`);
    }
    seenIds.add(id);
    seenSequences.add(entry.sequenceNumber);
    if (!reuseRecord) {
      const canonical = validatedHistoryEntries.has(entry) ? entry : { ...entry };
      validatedHistoryEntries.add(canonical);
      result[id] = canonical;
    }
  }
  validatedRecords.add(result);
  return result;
}

function validatedOrder<T>(input: readonly T[]): readonly T[] {
  if (validatedOrders.has(input)) return input;
  const result = [...input];
  validatedOrders.add(result);
  return result;
}

function validateContractMoney(contract: PlayerContract): void {
  try {
    nonNegativeMoney(contract.annualWage);
    nonNegativeMoney(contract.bonuses.signingBonus);
    nonNegativeMoney(contract.bonuses.appearanceBonus);
    if (contract.bonuses.goalBonus !== undefined) nonNegativeMoney(contract.bonuses.goalBonus);
    if (contract.bonuses.cleanSheetBonus !== undefined) nonNegativeMoney(contract.bonuses.cleanSheetBonus);
  } catch {
    fail("invalid_contract_money", `contract contains invalid money: ${contract.id}`);
  }
}

function fail(code: SeniorSquadStateErrorCode, message: string): never {
  throw new SeniorSquadStateError(code, message);
}
