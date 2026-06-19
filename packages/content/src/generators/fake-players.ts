import {
  abilityValue,
  gameDate,
  stateValue,
  type ClubId,
  type Player,
  type PlayerAbilities,
  type PlayerDynamicState,
  type PlayerId,
  type PlayerPosition,
} from "@game/domain";

import { FAKE_PLAYERS_PER_CLUB, fakePlayerId } from "./fake-clubs.ts";

/**
 * Lineup slot shape emitted by content without importing engine contracts.
 *
 * The engine consumes this structurally through its own `LineupSlot` type.
 */
export interface FakeLineupSlot {
  /** Stable slot identifier within the generated lineup. */
  readonly slotId: string;
  /** Generated player assigned to this slot. */
  readonly playerId: PlayerId;
  /** Role key consumed later by engine role-weight data. */
  readonly roleKey: string;
}

/**
 * Generated fake player collection for the first CLI milestone.
 */
export interface FakePlayers {
  /** Player lookup by ID. */
  readonly players: Readonly<Record<PlayerId, Player>>;
  /** Explicit deterministic player ID order. */
  readonly playerIds: readonly PlayerId[];
  /** Initial dynamic state lookup by ID. */
  readonly playerStates: Readonly<Record<PlayerId, PlayerDynamicState>>;
  /** Deterministic 11-player lineups by club ID. */
  readonly lineupsByClubId: Readonly<Record<ClubId, readonly FakeLineupSlot[]>>;
}

/**
 * Generates fictional first-team players and stable 4-4-2 lineups.
 *
 * @example
 * const players = generateFakePlayersForClubs(clubIds);
 */
export function generateFakePlayersForClubs(clubIds: readonly ClubId[]): FakePlayers {
  const players: Record<PlayerId, Player> = {};
  const playerIds: PlayerId[] = [];
  const playerStates: Record<PlayerId, PlayerDynamicState> = {};
  const lineupsByClubId: Record<ClubId, readonly FakeLineupSlot[]> = {};

  for (let clubIndex = 0; clubIndex < clubIds.length; clubIndex += 1) {
    const clubId = clubIds[clubIndex];
    if (clubId === undefined) {
      continue;
    }

    const clubNumber = clubIndex + 1;
    const lineup: FakeLineupSlot[] = [];

    for (let slotNumber = 1; slotNumber <= FAKE_PLAYERS_PER_CLUB; slotNumber += 1) {
      const id = fakePlayerId(clubNumber, slotNumber);
      const player = fakePlayer(id, clubNumber, slotNumber);

      players[id] = player;
      playerIds.push(id);
      playerStates[id] = {
        fitness: stateValue(100),
        form: stateValue(50),
        morale: stateValue(50),
      };
      lineup.push({
        slotId: `slot:${String(slotNumber).padStart(2, "0")}`,
        playerId: id,
        roleKey: roleKeyForSlot(slotNumber),
      });
    }

    lineupsByClubId[clubId] = lineup;
  }

  return {
    players,
    playerIds,
    playerStates,
    lineupsByClubId,
  };
}

/**
 * Builds one generated player with a deterministic ability profile.
 */
function fakePlayer(id: PlayerId, clubNumber: number, slotNumber: number): Player {
  const base = 6.25 + ((19 - clubNumber) / 18) * 6 + ((slotNumber * 7 + clubNumber) % 4) * 0.35;
  const position = positionForSlot(slotNumber);

  return {
    id,
    firstName: `Player${String(clubNumber).padStart(2, "0")}`,
    lastName: `No${String(slotNumber).padStart(2, "0")}`,
    birthDate: gameDate(10_500 + clubNumber * 30 + slotNumber),
    naturalPositions: [position],
    abilities: abilitiesForPosition(base, position),
    potential: abilitiesForPosition(Math.min(base + 2, 20), position),
  };
}

/**
 * Resolves the early fixed 4-4-2 role key for one lineup slot.
 */
function roleKeyForSlot(slotNumber: number): string {
  if (slotNumber === 1) {
    return "gk";
  }

  if (slotNumber <= 5) {
    return "defender";
  }

  if (slotNumber <= 9) {
    return "midfielder";
  }

  return "attacker";
}

/**
 * Resolves the natural domain position for one lineup slot.
 */
function positionForSlot(slotNumber: number): PlayerPosition {
  switch (slotNumber) {
    case 1:
      return "gk";
    case 2:
      return "rb";
    case 3:
    case 4:
      return "cb";
    case 5:
      return "lb";
    case 6:
    case 7:
      return "cm";
    case 8:
      return "rw";
    case 9:
      return "lw";
    default:
      return "st";
  }
}

/**
 * Builds a full 25-attribute ability shape around one base value.
 */
function abilitiesForPosition(base: number, position: PlayerPosition): PlayerAbilities {
  const isGoalkeeper = position === "gk";
  const isDefender = position === "rb" || position === "cb" || position === "lb";
  const isMidfielder = position === "cm" || position === "rw" || position === "lw";
  const isAttacker = position === "st";

  return {
    technical: {
      finishing: rating(base + (isAttacker ? 2 : -1)),
      passing: rating(base + (isMidfielder ? 2 : 0)),
      longPassing: rating(base + (isMidfielder ? 1 : 0)),
      crossing: rating(base + (position === "rw" || position === "lw" ? 2 : 0)),
      dribbling: rating(base + (isMidfielder || isAttacker ? 1 : 0)),
      technique: rating(base + (isMidfielder ? 1 : 0)),
      tackling: rating(base + (isDefender ? 2 : -1)),
      penalties: rating(base),
      freeKicks: rating(base),
    },
    physical: {
      pace: rating(base + (isAttacker ? 1 : 0)),
      strength: rating(base + (isDefender ? 1 : 0)),
      stamina: rating(base + (isMidfielder ? 1 : 0)),
      agility: rating(base),
      heading: rating(base + (isDefender || isAttacker ? 1 : 0)),
    },
    mental: {
      positioning: rating(base + (isDefender ? 2 : 0)),
      vision: rating(base + (isMidfielder ? 2 : 0)),
      anticipation: rating(base + (isDefender ? 1 : 0)),
      composure: rating(base + (isAttacker ? 1 : 0)),
      determination: rating(base),
      leadership: rating(base - 1),
    },
    goalkeeping: {
      reflexes: rating(base + (isGoalkeeper ? 4 : -4)),
      handling: rating(base + (isGoalkeeper ? 4 : -4)),
      rushingOut: rating(base + (isGoalkeeper ? 3 : -4)),
      goalkeeperPositioning: rating(base + (isGoalkeeper ? 4 : -4)),
      footwork: rating(base + (isGoalkeeper ? 2 : -2)),
    },
  };
}

/**
 * Clamps and brands one ability rating on the 0-20 domain scale.
 */
function rating(value: number) {
  return abilityValue(Math.max(0, Math.min(20, value)));
}
