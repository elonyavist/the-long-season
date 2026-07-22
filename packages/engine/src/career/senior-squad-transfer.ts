import {
  createSeniorSquadState,
  gameDate,
  playerContractHistoryEntryId,
  playerContractId,
  seniorSquadRegistrationId,
  type ClubId,
  type ContractOfferTerms,
  type GameDate,
  type GameState,
  type PlayerContract,
  type PlayerContractHistoryEntry,
  type PlayerId,
  type SeniorSquadRegistration,
  type SeniorSquadState,
} from "@game/domain";

/** Input for moving one contracted senior player between clubs. */
export interface PrepareSeniorSquadPermanentTransferInput {
  readonly gameState: GameState;
  readonly seniorSquadState: SeniorSquadState;
  readonly playerId: PlayerId;
  readonly buyingClubId: ClubId;
  readonly occurredOn: GameDate;
  readonly transferSequence: number;
  /** Accepted annual salary, duration, status, and bonus terms at the buyer. */
  readonly acceptedTerms: ContractOfferTerms;
}

/** A validated senior-squad transition plus the newly activated agreement. */
export interface PreparedSeniorSquadPermanentTransfer {
  readonly gameState: GameState;
  readonly seniorSquadState: SeniorSquadState;
  readonly activatedContractId: PlayerContract["id"];
}

/** Input for registering a free agent or academy graduate with a senior club. */
export interface PrepareSeniorSquadSigningInput {
  readonly gameState: GameState;
  readonly seniorSquadState: SeniorSquadState;
  readonly playerId: PlayerId;
  readonly clubId: ClubId;
  readonly occurredOn: GameDate;
  readonly transitionSequence: number;
  readonly acceptedTerms: ContractOfferTerms;
  readonly preferredShirtNumber?: number;
}

/** Input for committing an ordered group of already-agreed senior signings. */
export interface PrepareSeniorSquadSigningsInput {
  readonly gameState: GameState;
  readonly seniorSquadState: SeniorSquadState;
  readonly signings: readonly Omit<
    PrepareSeniorSquadSigningInput,
    "gameState" | "seniorSquadState"
  >[];
}

/** Input for ending employment without moving directly to another club. */
export interface PrepareSeniorSquadDepartureInput {
  readonly gameState: GameState;
  readonly seniorSquadState: SeniorSquadState;
  readonly playerId: PlayerId;
  readonly occurredOn: GameDate;
  readonly transitionSequence: number;
  readonly event: "expired" | "released";
}

/** Input for committing an ordered group of senior ownership departures. */
export interface PrepareSeniorSquadDeparturesInput {
  readonly gameState: GameState;
  readonly seniorSquadState: SeniorSquadState;
  readonly departures: readonly Omit<
    PrepareSeniorSquadDepartureInput,
    "gameState" | "seniorSquadState"
  >[];
}

/** Canonical world and senior-squad snapshots after one ownership departure. */
export interface PreparedSeniorSquadDeparture {
  readonly gameState: GameState;
  readonly seniorSquadState: SeniorSquadState;
  readonly endedContractId: PlayerContract["id"];
}

/** Canonical snapshots after one atomic batch of senior signings. */
export interface PreparedSeniorSquadSignings {
  readonly gameState: GameState;
  readonly seniorSquadState: SeniorSquadState;
  readonly activatedContractIds: readonly PlayerContract["id"][];
}

/** Canonical snapshots after one atomic batch of senior departures. */
export interface PreparedSeniorSquadDepartures {
  readonly gameState: GameState;
  readonly seniorSquadState: SeniorSquadState;
  readonly endedContractIds: readonly PlayerContract["id"][];
}

/** Stable invariant error raised when an accepted transfer lacks senior ownership facts. */
export class SeniorSquadTransferError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "SeniorSquadTransferError";
  }
}

/**
 * Moves ownership, registration, and active employment to a buying club.
 *
 * The seller agreement remains immutable and receives a termination fact. The
 * buyer agreement uses already-accepted annual terms supplied by the market
 * policy, so this boundary never invents financial values itself.
 */
export function prepareSeniorSquadPermanentTransfer(
  input: PrepareSeniorSquadPermanentTransferInput,
): PreparedSeniorSquadPermanentTransfer {
  const current = createSeniorSquadState(input.gameState, input.seniorSquadState);
  const registration = activeRegistrationFor(current, input.playerId);
  const previousContract = activeContractFor(current, input.playerId);
  const sellingClub = input.gameState.clubs[previousContract.clubId];
  const buyingClub = input.gameState.clubs[input.buyingClubId];
  if (sellingClub === undefined || buyingClub === undefined) {
    throw new SeniorSquadTransferError(`Transfer clubs not found for player: ${input.playerId}`);
  }
  if (!sellingClub.playerIds.includes(input.playerId) || buyingClub.playerIds.includes(input.playerId)) {
    throw new SeniorSquadTransferError(`Transfer ownership mismatch for player: ${input.playerId}`);
  }
  const identity = `${String(input.playerId).slice(7)}:${input.transferSequence}:${String(input.buyingClubId).slice(5)}`;
  const registrationId = seniorSquadRegistrationId(`registration:${identity}`);
  const contractId = playerContractId(`contract:${identity}`);
  const terminationHistoryId = playerContractHistoryEntryId(`contract-history:${identity}:transfer-terminated`);
  const signingHistoryId = playerContractHistoryEntryId(`contract-history:${identity}:signed`);
  const gameState: GameState = {
    ...input.gameState,
    clubs: {
      ...input.gameState.clubs,
      [sellingClub.id]: {
        ...sellingClub,
        playerIds: sellingClub.playerIds.filter((playerId) => playerId !== input.playerId),
      },
      [buyingClub.id]: {
        ...buyingClub,
        playerIds: [...buyingClub.playerIds, input.playerId],
      },
    },
  };

  const registrations = { ...current.registrations };
  delete registrations[registration.id];
  registrations[registrationId] = {
    id: registrationId,
    playerId: input.playerId,
    clubId: input.buyingClubId,
    shirtNumber: availableShirtNumber(current, input.buyingClubId, registration.shirtNumber),
    registeredOn: input.occurredOn,
  };

  const nextContract: PlayerContract = {
    id: contractId,
    playerId: input.playerId,
    clubId: input.buyingClubId,
    type: "professional",
    startsOn: input.occurredOn,
    endsOn: contractEndDate(input.occurredOn, input.acceptedTerms.durationYears),
    annualWage: input.acceptedTerms.annualWage,
    squadStatus: input.acceptedTerms.squadStatus,
    bonuses: { ...input.acceptedTerms.bonuses },
  };
  const firstHistorySequence = nextContractHistorySequence(current);
  const terminationHistory: PlayerContractHistoryEntry = {
    id: terminationHistoryId,
    sequenceNumber: firstHistorySequence,
    occurredOn: input.occurredOn,
    event: "transfer_terminated",
    contractId: previousContract.id,
    playerId: input.playerId,
    clubId: previousContract.clubId,
  };
  const signingHistory: PlayerContractHistoryEntry = {
    id: signingHistoryId,
    sequenceNumber: firstHistorySequence + 1,
    occurredOn: input.occurredOn,
    event: "signed",
    contractId,
    playerId: input.playerId,
    clubId: input.buyingClubId,
  };

  const seniorSquadState = createSeniorSquadState(gameState, {
    registrations,
    registrationIds: current.registrationIds.map((id) =>
      id === registration.id ? registrationId : id
    ),
    contracts: {
      ...current.contracts,
      [contractId]: nextContract,
    },
    contractIds: [...current.contractIds, contractId],
    activeContractIds: current.activeContractIds.map((id) =>
      id === previousContract.id ? contractId : id
    ),
    contractHistory: {
      ...current.contractHistory,
      [terminationHistoryId]: terminationHistory,
      [signingHistoryId]: signingHistory,
    },
    contractHistoryEntryIds: [
      ...current.contractHistoryEntryIds,
      terminationHistoryId,
      signingHistoryId,
    ],
  });

  return { gameState, seniorSquadState, activatedContractId: contractId };
}

/** Registers one currently unowned player with a senior club. */
export function prepareSeniorSquadSigning(
  input: PrepareSeniorSquadSigningInput,
): PreparedSeniorSquadPermanentTransfer {
  const prepared = prepareSeniorSquadSignings({
    gameState: input.gameState,
    seniorSquadState: input.seniorSquadState,
    signings: [{
      playerId: input.playerId,
      clubId: input.clubId,
      occurredOn: input.occurredOn,
      transitionSequence: input.transitionSequence,
      acceptedTerms: input.acceptedTerms,
      ...(input.preferredShirtNumber === undefined
        ? {}
        : { preferredShirtNumber: input.preferredShirtNumber }),
    }],
  });
  const activatedContractId = prepared.activatedContractIds[0];
  if (activatedContractId === undefined) {
    throw new SeniorSquadTransferError(`Signing did not activate a contract: ${input.playerId}`);
  }
  return { ...prepared, activatedContractId };
}

/**
 * Commits ordered senior signings with one collection copy and validation pass.
 *
 * This is the bulk boundary used by season lifecycle jobs. Interactive callers
 * keep the single-signing wrapper above, while long runs avoid rebuilding the
 * complete immutable contract history once per player.
 */
export function prepareSeniorSquadSignings(
  input: PrepareSeniorSquadSigningsInput,
): PreparedSeniorSquadSignings {
  const current = createSeniorSquadState(input.gameState, input.seniorSquadState);
  if (input.signings.length === 0) {
    return { gameState: input.gameState, seniorSquadState: current, activatedContractIds: [] };
  }

  const activePlayerIds = new Set(input.gameState.playerIds);
  const ownerByPlayer = new Map<PlayerId, ClubId>();
  const clubs = { ...input.gameState.clubs };
  for (const clubId of input.gameState.clubIds) {
    for (const playerId of input.gameState.clubs[clubId]?.playerIds ?? []) {
      ownerByPlayer.set(playerId, clubId);
    }
  }

  const usedShirtNumbers = new Map<ClubId, Set<number>>();
  for (const registrationId of current.registrationIds) {
    const registration = current.registrations[registrationId];
    if (registration === undefined) continue;
    const used = usedShirtNumbers.get(registration.clubId) ?? new Set<number>();
    used.add(registration.shirtNumber);
    usedShirtNumbers.set(registration.clubId, used);
  }

  const registrations = { ...current.registrations };
  const registrationIds = [...current.registrationIds];
  const contracts = { ...current.contracts };
  const contractIds = [...current.contractIds];
  const activeContractIds = [...current.activeContractIds];
  const contractHistory = { ...current.contractHistory };
  const contractHistoryEntryIds = [...current.contractHistoryEntryIds];
  const activatedContractIds: PlayerContract["id"][] = [];

  for (const signing of input.signings) {
    const club = clubs[signing.clubId];
    if (club === undefined || input.gameState.players[signing.playerId] === undefined) {
      throw new SeniorSquadTransferError(`Signing player or club not found: ${signing.playerId}`);
    }
    if (!activePlayerIds.has(signing.playerId) || input.gameState.playerStates[signing.playerId] === undefined) {
      throw new SeniorSquadTransferError(`Signing player is not active: ${signing.playerId}`);
    }
    if (ownerByPlayer.has(signing.playerId)) {
      throw new SeniorSquadTransferError(`Signing player is already owned: ${signing.playerId}`);
    }

    const identity = `${String(signing.playerId).slice(7)}:${signing.transitionSequence}:${String(signing.clubId).slice(5)}`;
    const registrationId = seniorSquadRegistrationId(`registration:${identity}`);
    const contractId = playerContractId(`contract:${identity}`);
    const historyId = playerContractHistoryEntryId(`contract-history:${identity}:signed`);
    if (registrations[registrationId] !== undefined || contracts[contractId] !== undefined || contractHistory[historyId] !== undefined) {
      throw new SeniorSquadTransferError(`Duplicate signing transition: ${identity}`);
    }

    const used = usedShirtNumbers.get(signing.clubId) ?? new Set<number>();
    const shirtNumber = nextAvailableShirtNumber(used, signing.preferredShirtNumber ?? 1, signing.clubId);
    used.add(shirtNumber);
    usedShirtNumbers.set(signing.clubId, used);

    const registration: SeniorSquadRegistration = {
      id: registrationId,
      playerId: signing.playerId,
      clubId: signing.clubId,
      shirtNumber,
      registeredOn: signing.occurredOn,
    };
    const contract: PlayerContract = {
      id: contractId,
      playerId: signing.playerId,
      clubId: signing.clubId,
      type: "professional",
      startsOn: signing.occurredOn,
      endsOn: contractEndDate(signing.occurredOn, signing.acceptedTerms.durationYears),
      annualWage: signing.acceptedTerms.annualWage,
      squadStatus: signing.acceptedTerms.squadStatus,
      bonuses: { ...signing.acceptedTerms.bonuses },
    };
    const historyEntry: PlayerContractHistoryEntry = {
      id: historyId,
      sequenceNumber: contractHistoryEntryIds.length + 1,
      occurredOn: signing.occurredOn,
      event: "signed",
      contractId,
      playerId: signing.playerId,
      clubId: signing.clubId,
    };

    clubs[club.id] = { ...club, playerIds: [...club.playerIds, signing.playerId] };
    ownerByPlayer.set(signing.playerId, signing.clubId);
    registrations[registrationId] = registration;
    registrationIds.push(registrationId);
    contracts[contractId] = contract;
    contractIds.push(contractId);
    activeContractIds.push(contractId);
    contractHistory[historyId] = historyEntry;
    contractHistoryEntryIds.push(historyId);
    activatedContractIds.push(contractId);
  }

  const gameState: GameState = { ...input.gameState, clubs };
  const seniorSquadState = createSeniorSquadState(gameState, {
    registrations,
    registrationIds,
    contracts,
    contractIds,
    activeContractIds,
    contractHistory,
    contractHistoryEntryIds,
  });
  return { gameState, seniorSquadState, activatedContractIds };
}

/** Ends one active agreement and leaves the player in the free-agent pool. */
export function prepareSeniorSquadDeparture(
  input: PrepareSeniorSquadDepartureInput,
): PreparedSeniorSquadDeparture {
  const prepared = prepareSeniorSquadDepartures({
    gameState: input.gameState,
    seniorSquadState: input.seniorSquadState,
    departures: [{
      playerId: input.playerId,
      occurredOn: input.occurredOn,
      transitionSequence: input.transitionSequence,
      event: input.event,
    }],
  });
  const endedContractId = prepared.endedContractIds[0];
  if (endedContractId === undefined) {
    throw new SeniorSquadTransferError(`Departure did not end a contract: ${input.playerId}`);
  }
  return { ...prepared, endedContractId };
}

/**
 * Commits ordered senior departures with one collection copy and validation pass.
 *
 * Contract rows remain immutable history; only registrations, ownership, active
 * contract IDs, and ordered departure facts change.
 */
export function prepareSeniorSquadDepartures(
  input: PrepareSeniorSquadDeparturesInput,
): PreparedSeniorSquadDepartures {
  const current = createSeniorSquadState(input.gameState, input.seniorSquadState);
  if (input.departures.length === 0) {
    return { gameState: input.gameState, seniorSquadState: current, endedContractIds: [] };
  }

  const registrationByPlayer = new Map<PlayerId, SeniorSquadRegistration>();
  for (const registrationId of current.registrationIds) {
    const registration = current.registrations[registrationId];
    if (registration !== undefined) registrationByPlayer.set(registration.playerId, registration);
  }
  const activeContractByPlayer = new Map<PlayerId, PlayerContract>();
  for (const contractId of current.activeContractIds) {
    const contract = current.contracts[contractId];
    if (contract !== undefined) activeContractByPlayer.set(contract.playerId, contract);
  }

  const clubs = { ...input.gameState.clubs };
  const registrations = { ...current.registrations };
  const removedRegistrationIds = new Set<SeniorSquadRegistration["id"]>();
  const removedContractIds = new Set<PlayerContract["id"]>();
  const contractHistory = { ...current.contractHistory };
  const contractHistoryEntryIds = [...current.contractHistoryEntryIds];
  const endedContractIds: PlayerContract["id"][] = [];

  for (const departure of input.departures) {
    const registration = registrationByPlayer.get(departure.playerId);
    const contract = activeContractByPlayer.get(departure.playerId);
    if (registration === undefined || contract === undefined) {
      throw new SeniorSquadTransferError(`Active senior employment not found: ${departure.playerId}`);
    }
    const club = clubs[contract.clubId];
    if (club === undefined || !club.playerIds.includes(departure.playerId)) {
      throw new SeniorSquadTransferError(`Departure ownership mismatch for player: ${departure.playerId}`);
    }

    const identity = `${String(departure.playerId).slice(7)}:${departure.transitionSequence}:${departure.event}`;
    const historyId = playerContractHistoryEntryId(`contract-history:${identity}`);
    if (contractHistory[historyId] !== undefined) {
      throw new SeniorSquadTransferError(`Duplicate departure transition: ${identity}`);
    }
    const historyEntry: PlayerContractHistoryEntry = {
      id: historyId,
      sequenceNumber: contractHistoryEntryIds.length + 1,
      occurredOn: departure.occurredOn,
      event: departure.event,
      contractId: contract.id,
      playerId: departure.playerId,
      clubId: contract.clubId,
    };

    clubs[club.id] = {
      ...club,
      playerIds: club.playerIds.filter((playerId) => playerId !== departure.playerId),
    };
    delete registrations[registration.id];
    removedRegistrationIds.add(registration.id);
    removedContractIds.add(contract.id);
    registrationByPlayer.delete(departure.playerId);
    activeContractByPlayer.delete(departure.playerId);
    contractHistory[historyId] = historyEntry;
    contractHistoryEntryIds.push(historyId);
    endedContractIds.push(contract.id);
  }

  const gameState: GameState = { ...input.gameState, clubs };
  const seniorSquadState = createSeniorSquadState(gameState, {
    ...current,
    registrations,
    registrationIds: current.registrationIds.filter((id) => !removedRegistrationIds.has(id)),
    activeContractIds: current.activeContractIds.filter((id) => !removedContractIds.has(id)),
    contractHistory,
    contractHistoryEntryIds,
  });
  return { gameState, seniorSquadState, endedContractIds };
}

function activeRegistrationFor(state: SeniorSquadState, playerId: PlayerId): SeniorSquadRegistration {
  for (const registrationId of state.registrationIds) {
    const registration = state.registrations[registrationId];
    if (registration?.playerId === playerId) return registration;
  }
  throw new SeniorSquadTransferError(`Senior registration not found for transferred player: ${playerId}`);
}

function activeContractFor(state: SeniorSquadState, playerId: PlayerId): PlayerContract {
  for (const contractId of state.activeContractIds) {
    const contract = state.contracts[contractId];
    if (contract?.playerId === playerId) return contract;
  }
  throw new SeniorSquadTransferError(`Active contract not found for transferred player: ${playerId}`);
}

function availableShirtNumber(state: SeniorSquadState, clubId: ClubId, preferred: number): number {
  const used = new Set<number>();
  for (const registrationId of state.registrationIds) {
    const registration = state.registrations[registrationId];
    if (registration?.clubId === clubId) used.add(registration.shirtNumber);
  }
  return nextAvailableShirtNumber(used, preferred, clubId);
}

function nextAvailableShirtNumber(used: ReadonlySet<number>, preferred: number, clubId: ClubId): number {
  if (!used.has(preferred)) return preferred;
  for (let shirtNumber = 1; shirtNumber <= 99; shirtNumber += 1) {
    if (!used.has(shirtNumber)) return shirtNumber;
  }
  throw new SeniorSquadTransferError(`No shirt number available at buying club: ${clubId}`);
}

function owningClubId(gameState: GameState, playerId: PlayerId): ClubId | undefined {
  for (const clubId of gameState.clubIds) {
    if (gameState.clubs[clubId]?.playerIds.includes(playerId)) return clubId;
  }
  return undefined;
}

function contractEndDate(startsOn: GameDate, durationYears: number): GameDate {
  if (!Number.isSafeInteger(durationYears) || durationYears < 1 || durationYears > 5) {
    throw new SeniorSquadTransferError(`Invalid contract duration: ${durationYears}`);
  }
  return gameDate(startsOn + durationYears * 365);
}

function nextContractHistorySequence(state: SeniorSquadState): number {
  return state.contractHistoryEntryIds.length + 1;
}
