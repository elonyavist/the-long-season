import type { MatchInjurySeverity } from "../entities/match-event.entity.ts";
import type { MatchSuspensionReason } from "../match/match-consequence.ts";
import type { CompetitionId, FixtureId, PlayerId } from "../types/ids.ts";
import type { GameDate } from "../value-objects/game-date.ts";

/** One active injury that prevents a player from being selected. */
export interface CareerPlayerInjuryAvailability {
  readonly fixtureId: FixtureId;
  readonly playerId: PlayerId;
  readonly severity: MatchInjurySeverity;
  readonly occurredOn: GameDate;
  readonly unavailableUntil: GameDate;
}

/** One active competition suspension measured in remaining fixtures. */
export interface CareerPlayerSuspensionAvailability {
  readonly fixtureId: FixtureId;
  readonly competitionId: CompetitionId;
  readonly playerId: PlayerId;
  readonly reason: MatchSuspensionReason;
  readonly remainingMatches: number;
}

/** Current yellow-card total for one player and competition. */
export interface CareerPlayerYellowCardAccumulation {
  readonly competitionId: CompetitionId;
  readonly playerId: PlayerId;
  readonly count: number;
}

/** Durable availability facts consumed by selection and Posta. */
export interface CareerPlayerAvailabilityState {
  readonly injuries: readonly CareerPlayerInjuryAvailability[];
  readonly suspensions: readonly CareerPlayerSuspensionAvailability[];
  readonly yellowCards: readonly CareerPlayerYellowCardAccumulation[];
}

/** Reason why a player cannot be selected for a fixture. */
export type CareerPlayerUnavailabilityReason = "injured" | "suspended";

/** One fixture-specific eligibility blocker for a selected player. */
export interface CareerFixtureEligibilityBlocker {
  /** Selected player who cannot take part in the fixture. */
  readonly playerId: PlayerId;
  /** Canonical durable reason preventing participation. */
  readonly reason: CareerPlayerUnavailabilityReason;
}

/** Validates and copies the durable availability state. */
export function createCareerPlayerAvailabilityState(
  input: CareerPlayerAvailabilityState = EMPTY_PLAYER_AVAILABILITY,
): CareerPlayerAvailabilityState {
  const injuryPlayers = new Set<PlayerId>();
  const suspensionKeys = new Set<string>();
  const yellowKeys = new Set<string>();

  const injuries = input.injuries.map((injury) => {
    if (injuryPlayers.has(injury.playerId)) throw new Error(`duplicate active injury: ${injury.playerId}`);
    if (injury.unavailableUntil < injury.occurredOn) throw new Error(`injury return date precedes occurrence: ${injury.playerId}`);
    injuryPlayers.add(injury.playerId);
    return { ...injury };
  });
  const suspensions = input.suspensions.map((suspension) => {
    const key = availabilityKey(suspension.competitionId, suspension.playerId);
    if (suspensionKeys.has(key)) throw new Error(`duplicate active suspension: ${key}`);
    if (!Number.isSafeInteger(suspension.remainingMatches) || suspension.remainingMatches <= 0) {
      throw new Error(`suspension remaining matches must be positive: ${suspension.remainingMatches}`);
    }
    suspensionKeys.add(key);
    return { ...suspension };
  });
  const yellowCards = input.yellowCards.map((entry) => {
    const key = availabilityKey(entry.competitionId, entry.playerId);
    if (yellowKeys.has(key)) throw new Error(`duplicate yellow-card accumulation: ${key}`);
    if (!Number.isSafeInteger(entry.count) || entry.count < 0) throw new Error(`yellow-card count must be non-negative: ${entry.count}`);
    yellowKeys.add(key);
    return { ...entry };
  });

  return { injuries, suspensions, yellowCards };
}

/** Returns the first durable reason preventing selection for a fixture. */
export function playerUnavailabilityReason(
  state: CareerPlayerAvailabilityState,
  playerId: PlayerId,
  fixtureDate: GameDate,
  competitionId: CompetitionId,
): CareerPlayerUnavailabilityReason | undefined {
  if (state.injuries.some((injury) => injury.playerId === playerId && injury.unavailableUntil >= fixtureDate)) return "injured";
  if (state.suspensions.some((suspension) => suspension.playerId === playerId && suspension.competitionId === competitionId && suspension.remainingMatches > 0)) return "suspended";
  return undefined;
}

/**
 * Returns fixture eligibility blockers without changing the manager's plan.
 *
 * Input order is preserved and duplicate player IDs are reported once, which
 * keeps domain, engine, and presentation diagnostics deterministic.
 */
export function findCareerFixtureEligibilityBlockers(
  state: CareerPlayerAvailabilityState,
  playerIds: readonly PlayerId[],
  fixtureDate: GameDate,
  competitionId: CompetitionId,
): readonly CareerFixtureEligibilityBlocker[] {
  const seenPlayerIds = new Set<PlayerId>();
  const blockers: CareerFixtureEligibilityBlocker[] = [];

  for (const playerId of playerIds) {
    if (seenPlayerIds.has(playerId)) continue;
    seenPlayerIds.add(playerId);
    const reason = playerUnavailabilityReason(state, playerId, fixtureDate, competitionId);
    if (reason !== undefined) blockers.push({ playerId, reason });
  }

  return blockers;
}

/** Empty availability state used by new careers. */
export const EMPTY_PLAYER_AVAILABILITY: CareerPlayerAvailabilityState = {
  injuries: [],
  suspensions: [],
  yellowCards: [],
};

function availabilityKey(competitionId: CompetitionId, playerId: PlayerId): string {
  return `${competitionId}|${playerId}`;
}
