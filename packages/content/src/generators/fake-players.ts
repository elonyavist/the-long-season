import {
  abilityValue,
  createPersonIdentity,
  gameDate,
  stateValue,
  type ClubId,
  type ClubCategory,
  type PersonIdentity,
  type Player,
  type PlayerAbilities,
  type PlayerDynamicState,
  type PlayerId,
  type PlayerPosition,
} from "@game/domain";
import { deriveRng } from "@game/shared";

import { FAKE_LINEUP_SIZE, FAKE_PLAYERS_PER_CLUB, fakePlayerId } from "./fake-clubs.ts";
import { getNameCulturePool } from "../identity/name-cultures.ts";
import { selectNationality, type LeagueNationCode } from "../identity/nationality-distribution.ts";

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
  /** Generated identity metadata by player ID, including nationality. */
  readonly playerIdentities: Readonly<Record<PlayerId, PersonIdentity>>;
  /** Initial dynamic state lookup by ID. */
  readonly playerStates: Readonly<Record<PlayerId, PlayerDynamicState>>;
  /** Deterministic 11-player lineups by club ID. */
  readonly lineupsByClubId: Readonly<Record<ClubId, readonly FakeLineupSlot[]>>;
}

/** Optional context for deterministic fake player identity generation. */
export interface FakePlayerGenerationOptions {
  /** Content seed used by identity generation. */
  readonly seed?: string;
  /** League nation used for domestic-vs-foreign distribution. */
  readonly leagueNation?: LeagueNationCode;
  /** Optional club context for category/reputation-aware identity distribution. */
  readonly clubContexts?: Readonly<Record<ClubId, FakePlayerClubContext>>;
}

/** Club context consumed by fake identity generation. */
export interface FakePlayerClubContext {
  /** Generic tier used by nationality distribution profiles. */
  readonly category: ClubCategory;
  /** Club reputation used to distinguish stronger first-division clubs. */
  readonly reputation: number;
}

/**
 * Generates fictional first-team players and stable 4-4-2 lineups.
 *
 * @example
 * const players = generateFakePlayersForClubs(clubIds);
 */
export function generateFakePlayersForClubs(
  clubIds: readonly ClubId[],
  options: FakePlayerGenerationOptions = {},
): FakePlayers {
  const players: Record<PlayerId, Player> = {};
  const playerIds: PlayerId[] = [];
  const playerIdentities: Record<PlayerId, PersonIdentity> = {};
  const playerStates: Record<PlayerId, PlayerDynamicState> = {};
  const lineupsByClubId: Record<ClubId, readonly FakeLineupSlot[]> = {};
  const seed = options.seed ?? "demo-001";
  const leagueNation = options.leagueNation ?? "italian";

  for (let clubIndex = 0; clubIndex < clubIds.length; clubIndex += 1) {
    const clubId = clubIds[clubIndex];
    if (clubId === undefined) {
      continue;
    }

    const clubNumber = clubIndex + 1;
    const lineup: FakeLineupSlot[] = [];
    const clubContext = options.clubContexts?.[clubId] ?? defaultClubContext(clubNumber);

    for (let slotNumber = 1; slotNumber <= FAKE_PLAYERS_PER_CLUB; slotNumber += 1) {
      const id = fakePlayerId(clubNumber, slotNumber);
      const identity = fakePlayerIdentity({
        id,
        clubNumber,
        slotNumber,
        seed,
        leagueNation,
        clubContext,
      });
      const player = fakePlayer(id, clubNumber, slotNumber, identity);

      players[id] = player;
      playerIds.push(id);
      playerIdentities[id] = identity;
      playerStates[id] = {
        fitness: stateValue(100),
        form: stateValue(50),
        morale: stateValue(50),
      };
      if (slotNumber <= FAKE_LINEUP_SIZE) {
        lineup.push({
          slotId: `slot:${String(slotNumber).padStart(2, "0")}`,
          playerId: id,
          roleKey: roleKeyForSlot(slotNumber),
        });
      }
    }

    lineupsByClubId[clubId] = lineup;
  }

  return {
    players,
    playerIds,
    playerIdentities,
    playerStates,
    lineupsByClubId,
  };
}

/**
 * Builds one generated player with a deterministic ability profile.
 */
function fakePlayer(id: PlayerId, clubNumber: number, slotNumber: number, identity: PersonIdentity): Player {
  const base = 6.25 + ((19 - clubNumber) / 18) * 6 + ((slotNumber * 7 + clubNumber) % 4) * 0.35;
  const position = positionForSlot(slotNumber);

  return {
    id,
    firstName: identity.firstName,
    lastName: identity.lastName,
    birthDate: gameDate(10_500 + clubNumber * 30 + slotNumber),
    naturalPositions: [position],
    abilities: abilitiesForPosition(base, position),
    potential: abilitiesForPosition(Math.min(base + 2, 20), position),
  };
}

/**
 * Picks a deterministic fictional identity for one generated player.
 *
 * Nationality is selected first, then the name culture picks the matching
 * first-name and last-name pool. This keeps display names stable for a seed
 * while allowing future leagues to use different domestic nationality mixes.
 */
function fakePlayerIdentity(input: {
  readonly id: PlayerId;
  readonly clubNumber: number;
  readonly slotNumber: number;
  readonly seed: string;
  readonly leagueNation: LeagueNationCode;
  readonly clubContext: FakePlayerClubContext;
}): PersonIdentity {
  const nationality = selectNationality({
    seed: input.seed,
    leagueNation: input.leagueNation,
    clubCategory: input.clubContext.category,
    clubReputation: input.clubContext.reputation,
    playerKey: input.id,
  });
  const pool = getNameCulturePool(nationality.nameCulture);
  const rng = deriveRng(input.seed, "person-name", input.id, input.clubNumber, input.slotNumber, nationality.nameCulture);
  const firstName = pool.firstNames[rng.nextInt(0, pool.firstNames.length)];
  const lastName = pool.lastNames[rng.nextInt(0, pool.lastNames.length)];

  if (firstName === undefined || lastName === undefined) {
    throw new Error(`Missing generated name for culture: ${nationality.nameCulture}`);
  }

  return createPersonIdentity({
    firstName,
    lastName,
    nationality: nationality.nationality,
    ...(nationality.secondNationality === undefined ? {} : { secondNationality: nationality.secondNationality }),
    birthCountry: nationality.birthCountry,
    nameCulture: nationality.nameCulture,
  });
}

/**
 * Provides the default identity-distribution context for the current demo
 * league, which represents a third-division competition.
 */
function defaultClubContext(clubNumber: number): FakePlayerClubContext {
  return {
    category: "third_division",
    reputation: 4 + ((clubNumber - 1) % 6),
  };
}

/**
 * Resolves the early fixed 4-4-2 role key for one lineup slot.
 */
function roleKeyForSlot(slotNumber: number): string {
  if (slotNumber === 1 || slotNumber === 12) {
    return "gk";
  }

  if (slotNumber <= 5 || slotNumber === 13 || slotNumber === 14 || slotNumber === 17 || slotNumber === 18) {
    return "defender";
  }

  if (slotNumber <= 9 || slotNumber === 15 || slotNumber === 19 || slotNumber === 20) {
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
    case 12:
      return "gk";
    case 2:
      return "rb";
    case 3:
    case 4:
    case 13:
    case 14:
    case 17:
    case 18:
      return "cb";
    case 5:
      return "lb";
    case 6:
    case 7:
    case 15:
      return "cm";
    case 8:
      return "rw";
    case 9:
      return "lw";
    case 19:
      return "rwb";
    case 20:
      return "lwb";
    default:
      return "st";
  }
}

/**
 * Builds a full 25-attribute ability shape around one base value.
 */
function abilitiesForPosition(base: number, position: PlayerPosition): PlayerAbilities {
  const isGoalkeeper = position === "gk";
  const isDefender =
    position === "rb" || position === "cb" || position === "lb" || position === "rwb" || position === "lwb";
  const isMidfielder = position === "cm" || position === "rw" || position === "lw" || position === "rwb" || position === "lwb";
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
