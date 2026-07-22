import {
  type CareerState,
  type PlayerId,
} from "@game/domain";

/**
 * Derives the current free-agent pool from canonical ownership facts.
 *
 * A player is available only when no club owns or registers them, no active
 * senior contract employs them, and no academy still contains them. Keeping
 * this selector derived prevents a stored free-agent flag from drifting away
 * from the durable career state.
 */
export function selectFreeAgentPlayerIds(careerState: CareerState): readonly PlayerId[] {
  const owned = new Set<PlayerId>();
  for (const clubId of careerState.gameState.clubIds) {
    for (const playerId of careerState.gameState.clubs[clubId]?.playerIds ?? []) {
      owned.add(playerId);
    }
  }

  const registered = new Set<PlayerId>();
  for (const registrationId of careerState.seniorSquadState?.registrationIds ?? []) {
    const registration = careerState.seniorSquadState?.registrations[registrationId];
    if (registration !== undefined) registered.add(registration.playerId);
  }

  const contracted = new Set<PlayerId>();
  for (const contractId of careerState.seniorSquadState?.activeContractIds ?? []) {
    const contract = careerState.seniorSquadState?.contracts[contractId];
    if (contract !== undefined) contracted.add(contract.playerId);
  }

  const academyPlayers = new Set<PlayerId>();
  for (const clubId of careerState.youthAcademyState?.clubRosterIds ?? []) {
    for (const playerId of careerState.youthAcademyState?.clubRosters[clubId]?.playerIds ?? []) {
      academyPlayers.add(playerId);
    }
  }

  const reservedYouthPlayers = new Set<PlayerId>();
  for (const playerId of careerState.youthAcademyState?.playerLifecycleIds ?? []) {
    const lifecycle = careerState.youthAcademyState?.playerLifecycle[playerId];
    if (lifecycle?.status === "promotion_candidate") {
      reservedYouthPlayers.add(playerId);
    }
  }

  return careerState.gameState.playerIds.filter((playerId) =>
    !owned.has(playerId)
    && !registered.has(playerId)
    && !contracted.has(playerId)
    && !academyPlayers.has(playerId)
    && !reservedYouthPlayers.has(playerId),
  );
}
