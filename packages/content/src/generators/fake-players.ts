import {
  abilityValue,
  createPersonIdentity,
  gameDate,
  stateValue,
  type ClubId,
  type ClubCategory,
  type PersonIdentity,
  type Player,
  type PlayerDynamicState,
  type PlayerId,
  type PlayerPosition,
} from "@game/domain";
import { deriveRng, fromISO } from "@game/shared";

import { FAKE_LINEUP_SIZE, FAKE_PLAYERS_PER_CLUB, fakePlayerId } from "./fake-clubs.ts";
import { clubTierForGeneratedClubNumber, getPlayerGenerationBand } from "./player-generation-bands.ts";
import {
  buildPlayerRarityAllocation,
  isBudgetedArchetype,
  playerRaritySlotKey,
  type PlayerRarityAssignment,
  type PlayerRarityBudget,
} from "./player-rarity-budget.ts";
import {
  buildPlayerAbilitiesForPosition,
  buildRoleAwarePlayerAbilities,
  capPlayerAbilitiesForRole,
} from "./player-role-templates.ts";
import {
  GENERATED_PLAYER_ARCHETYPE_KEYS,
  getGeneratedPlayerArchetype,
  type GeneratedPlayerArchetype,
  type GeneratedPlayerArchetypeKey,
} from "./player-archetypes.ts";
import type { CurrentAbilityRarityLane } from "./player-current-ability-bands.ts";
import { getNameCulturePool } from "../identity/name-cultures.ts";
import { selectNationality, type LeagueNationCode } from "../identity/nationality-distribution.ts";
import { generatedRoleIdentityForPosition } from "./player-role-identity.ts";

const FAKE_CAREER_START_EPOCH_DAY = fromISO("2026-08-01");
const MAX_LEAGUE_LAST_NAME_USES = 2;

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
  /** Generated squad archetype key by player ID. */
  readonly playerArchetypes: Readonly<Record<PlayerId, GeneratedPlayerArchetypeKey>>;
  /** League-level rarity budget used by generated squads. */
  readonly playerRarityBudget: PlayerRarityBudget;
  /** Budgeted rarity assignments by player ID. */
  readonly playerRarityAssignments: Readonly<Record<PlayerId, PlayerRarityAssignment>>;
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
  const playerArchetypes: Record<PlayerId, GeneratedPlayerArchetypeKey> = {};
  const playerRarityAssignments: Record<PlayerId, PlayerRarityAssignment> = {};
  const playerStates: Record<PlayerId, PlayerDynamicState> = {};
  const lineupsByClubId: Record<ClubId, readonly FakeLineupSlot[]> = {};
  const seed = options.seed ?? "demo-001";
  const leagueNation = options.leagueNation ?? "italian";
  const leagueNameUsage = createLeagueNameUsage();
  const rarityAllocation = buildPlayerRarityAllocation({
    seed,
    clubCount: clubIds.length,
    playersPerClub: FAKE_PLAYERS_PER_CLUB,
    lineupSize: FAKE_LINEUP_SIZE,
  });

  for (let clubIndex = 0; clubIndex < clubIds.length; clubIndex += 1) {
    const clubId = clubIds[clubIndex];
    if (clubId === undefined) {
      continue;
    }

    const clubNumber = clubIndex + 1;
    const lineup: FakeLineupSlot[] = [];
    const clubContext = options.clubContexts?.[clubId] ?? defaultClubContext(clubNumber);
    const clubNameUsage = createClubNameUsage();

    for (let slotNumber = 1; slotNumber <= FAKE_PLAYERS_PER_CLUB; slotNumber += 1) {
      const id = fakePlayerId(clubNumber, slotNumber);
      const identity = fakePlayerIdentity({
        id,
        clubNumber,
        slotNumber,
        seed,
        leagueNation,
        clubContext,
        clubNameUsage,
        leagueNameUsage,
      });
      const rarityAssignment = rarityAllocation.assignmentsBySlotKey[playerRaritySlotKey(clubNumber, slotNumber)];
      const archetype =
        rarityAssignment === undefined
          ? selectPlayerArchetype(seed, id, clubNumber, slotNumber, slotNumber <= FAKE_LINEUP_SIZE)
          : getGeneratedPlayerArchetype(rarityAssignment.archetypeKey);
      const player = fakePlayer(id, clubNumber, slotNumber, identity, seed, archetype, clubContext);

      players[id] = player;
      playerIds.push(id);
      playerIdentities[id] = identity;
      playerArchetypes[id] = archetype.key;
      if (rarityAssignment !== undefined) {
        playerRarityAssignments[id] = rarityAssignment;
      }
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
    playerArchetypes,
    playerRarityBudget: rarityAllocation.budget,
    playerRarityAssignments,
    playerStates,
    lineupsByClubId,
  };
}

/**
 * Builds one generated player with a deterministic ability profile.
 */
function fakePlayer(
  id: PlayerId,
  clubNumber: number,
  slotNumber: number,
  identity: PersonIdentity,
  seed: string,
  archetype: GeneratedPlayerArchetype,
  clubContext: FakePlayerClubContext,
): Player {
  const clubTier = clubTierForGeneratedClubNumber(clubNumber);
  const band = getPlayerGenerationBand(clubContext.category, clubTier);
  const currentAnchor = numberInFloatRange(band.currentAbility, seed, "player-current-band", id);
  const potentialAnchor = numberInFloatRange(band.potentialCeiling, seed, "player-potential-band", id);
  const base =
    currentAnchor +
    slotDepthOffset(slotNumber) +
    numberInFloatRange(archetype.currentAbilityOffset, seed, "player-current-ability", id);
  const position = positionForSlot(slotNumber);
  const ageYears = numberInRange(archetype.ageYears, seed, "player-age", id);
  const birthDateJitter = deriveRng(seed, "player-birth-date", id).nextInt(0, 365);
  const potentialBase = Math.min(
    Math.max(base, potentialAnchor, base + numberInFloatRange(archetype.potentialUplift, seed, "player-potential", id)),
    20,
  );
  const roleIdentity = generatedRoleIdentityForPosition(position);
  const abilities = buildRoleAwarePlayerAbilities({
    seed,
    playerKey: String(id),
    division: clubContext.category,
    clubTier,
    role: roleIdentity.primaryRole,
    ageYears,
    rarityLane: currentAbilityRarityLaneForArchetype(archetype.key),
    slotDepthAdjustment: slotDepthOffset(slotNumber),
  });
  const potential = potentialAtLeastCurrent(
    abilities,
    capPlayerAbilitiesForRole(buildPlayerAbilitiesForPosition(potentialBase, position), roleIdentity.primaryRole),
  );

  return {
    id,
    firstName: identity.firstName,
    lastName: identity.lastName,
    birthDate: gameDate(FAKE_CAREER_START_EPOCH_DAY - ageYears * 365 - birthDateJitter),
    naturalPositions: [position],
    ...roleIdentity,
    abilities,
    potential,
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
  readonly clubNameUsage: ClubNameUsage;
  readonly leagueNameUsage: LeagueNameUsage;
}): PersonIdentity {
  const nationality = selectNationality({
    seed: input.seed,
    leagueNation: input.leagueNation,
    clubCategory: input.clubContext.category,
    clubReputation: input.clubContext.reputation,
    playerKey: input.id,
  });
  const pool = getNameCulturePool(nationality.nameCulture);
  const { firstName, lastName } = uniqueNameForClub({
    seed: input.seed,
    id: input.id,
    clubNumber: input.clubNumber,
    slotNumber: input.slotNumber,
    nameCulture: nationality.nameCulture,
    firstNames: pool.firstNames,
    lastNames: pool.lastNames,
    clubNameUsage: input.clubNameUsage,
    leagueNameUsage: input.leagueNameUsage,
  });

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
 * Picks a deterministic name while keeping surnames varied inside the club and
 * across the generated league whenever the content pools have enough capacity.
 */
function uniqueNameForClub(input: {
  readonly seed: string;
  readonly id: PlayerId;
  readonly clubNumber: number;
  readonly slotNumber: number;
  readonly nameCulture: string;
  readonly firstNames: readonly string[];
  readonly lastNames: readonly string[];
  readonly clubNameUsage: ClubNameUsage;
  readonly leagueNameUsage: LeagueNameUsage;
}): { readonly firstName: string | undefined; readonly lastName: string | undefined } {
  let fallback: { readonly firstName: string | undefined; readonly lastName: string | undefined } = {
    firstName: undefined,
    lastName: undefined,
  };

  const maxAttempts = Math.max(64, input.firstNames.length * input.lastNames.length);

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const rng = deriveRng(
      input.seed,
      "person-name",
      input.id,
      input.clubNumber,
      input.slotNumber,
      input.nameCulture,
      attempt,
    );
    const firstName = input.firstNames[rng.nextInt(0, input.firstNames.length)];
    const lastName = input.lastNames[rng.nextInt(0, input.lastNames.length)];

    if (attempt === 0) {
      fallback = { firstName, lastName };
    }

    if (firstName === undefined || lastName === undefined) {
      continue;
    }

    const fullName = `${firstName} ${lastName}`;
    if (canUseName(firstName, lastName, fullName, input.clubNameUsage, input.leagueNameUsage)) {
      registerName(firstName, lastName, fullName, input.clubNameUsage, input.leagueNameUsage);
      return { firstName, lastName };
    }
  }

  if (fallback.firstName !== undefined && fallback.lastName !== undefined) {
    registerName(
      fallback.firstName,
      fallback.lastName,
      `${fallback.firstName} ${fallback.lastName}`,
      input.clubNameUsage,
      input.leagueNameUsage,
    );
  }

  return fallback;
}

interface ClubNameUsage {
  readonly fullNames: Set<string>;
  readonly lastNames: Set<string>;
}

interface LeagueNameUsage {
  readonly lastNameCounts: Map<string, number>;
  readonly firstNamesByLastName: Map<string, Set<string>>;
}

function createClubNameUsage(): ClubNameUsage {
  return {
    fullNames: new Set<string>(),
    lastNames: new Set<string>(),
  };
}

function createLeagueNameUsage(): LeagueNameUsage {
  return {
    lastNameCounts: new Map<string, number>(),
    firstNamesByLastName: new Map<string, Set<string>>(),
  };
}

function canUseName(
  firstName: string,
  lastName: string,
  fullName: string,
  clubNameUsage: ClubNameUsage,
  leagueNameUsage: LeagueNameUsage,
): boolean {
  if (clubNameUsage.fullNames.has(fullName) || clubNameUsage.lastNames.has(lastName)) {
    return false;
  }

  if ((leagueNameUsage.lastNameCounts.get(lastName) ?? 0) >= MAX_LEAGUE_LAST_NAME_USES) {
    return false;
  }

  if (leagueNameUsage.firstNamesByLastName.get(lastName)?.has(firstName) === true) {
    return false;
  }

  return true;
}

function registerName(
  firstName: string,
  lastName: string,
  fullName: string,
  clubNameUsage: ClubNameUsage,
  leagueNameUsage: LeagueNameUsage,
): void {
  clubNameUsage.fullNames.add(fullName);
  clubNameUsage.lastNames.add(lastName);
  leagueNameUsage.lastNameCounts.set(lastName, (leagueNameUsage.lastNameCounts.get(lastName) ?? 0) + 1);

  let firstNames = leagueNameUsage.firstNamesByLastName.get(lastName);
  if (firstNames === undefined) {
    firstNames = new Set<string>();
    leagueNameUsage.firstNamesByLastName.set(lastName, firstNames);
  }

  firstNames.add(firstName);
}

/**
 * Picks a deterministic archetype for one generated player slot.
 */
function selectPlayerArchetype(
  seed: string,
  id: PlayerId,
  clubNumber: number,
  slotNumber: number,
  isLineupSlot: boolean,
): GeneratedPlayerArchetype {
  const rng = deriveRng(seed, "player-archetype", id, clubNumber, slotNumber);
  let totalWeight = 0;

  for (const key of GENERATED_PLAYER_ARCHETYPE_KEYS) {
    if (isBudgetedArchetype(key)) {
      continue;
    }

    const archetype = getGeneratedPlayerArchetype(key);
    totalWeight += isLineupSlot ? archetype.lineupWeight : archetype.reserveWeight;
  }

  let cursor = rng.nextFloat() * totalWeight;

  for (const key of GENERATED_PLAYER_ARCHETYPE_KEYS) {
    if (isBudgetedArchetype(key)) {
      continue;
    }

    const archetype = getGeneratedPlayerArchetype(key);
    cursor -= isLineupSlot ? archetype.lineupWeight : archetype.reserveWeight;
    if (cursor < 0) {
      return archetype;
    }
  }

  return getGeneratedPlayerArchetype("senior_regular");
}

/**
 * Selects a deterministic integer inside an inclusive content range.
 */
function numberInRange(
  range: GeneratedPlayerArchetype["ageYears"],
  seed: string,
  streamName: string,
  id: PlayerId,
): number {
  const rng = deriveRng(seed, streamName, id);
  return rng.nextInt(range.minInclusive, range.maxInclusive + 1);
}

/**
 * Selects a deterministic floating-point value inside an inclusive content
 * range. Attribute values are allowed to remain fractional as true values.
 */
function numberInFloatRange(
  range: { readonly minInclusive: number; readonly maxInclusive: number },
  seed: string,
  streamName: string,
  id: PlayerId,
): number {
  const rng = deriveRng(seed, streamName, id);
  return range.minInclusive + rng.nextFloat() * (range.maxInclusive - range.minInclusive);
}

/**
 * Applies the early squad-depth shape before full role/potential tuning.
 */
function slotDepthOffset(slotNumber: number): number {
  if (slotNumber <= FAKE_LINEUP_SIZE) {
    return 0.35;
  }

  if (slotNumber <= 16) {
    return -0.65;
  }

  return -1.15;
}

function currentAbilityRarityLaneForArchetype(archetypeKey: GeneratedPlayerArchetypeKey): CurrentAbilityRarityLane {
  switch (archetypeKey) {
    case "category_star":
    case "veteran_drop_down":
      return "rare";
    case "category_starter":
    case "senior_regular":
    case "normal_youth":
    case "good_prospect":
    case "serious_prospect":
    case "rare_prodigy":
      return "normal";
  }
}

function potentialAtLeastCurrent(current: Player["abilities"], potential: Player["potential"]): Player["potential"] {
  return {
    technical: {
      finishing: maxAbility(current.technical.finishing, potential.technical.finishing),
      passing: maxAbility(current.technical.passing, potential.technical.passing),
      longPassing: maxAbility(current.technical.longPassing, potential.technical.longPassing),
      crossing: maxAbility(current.technical.crossing, potential.technical.crossing),
      dribbling: maxAbility(current.technical.dribbling, potential.technical.dribbling),
      technique: maxAbility(current.technical.technique, potential.technical.technique),
      tackling: maxAbility(current.technical.tackling, potential.technical.tackling),
      penalties: maxAbility(current.technical.penalties, potential.technical.penalties),
      freeKicks: maxAbility(current.technical.freeKicks, potential.technical.freeKicks),
    },
    physical: {
      pace: maxAbility(current.physical.pace, potential.physical.pace),
      strength: maxAbility(current.physical.strength, potential.physical.strength),
      stamina: maxAbility(current.physical.stamina, potential.physical.stamina),
      agility: maxAbility(current.physical.agility, potential.physical.agility),
      heading: maxAbility(current.physical.heading, potential.physical.heading),
    },
    mental: {
      positioning: maxAbility(current.mental.positioning, potential.mental.positioning),
      vision: maxAbility(current.mental.vision, potential.mental.vision),
      anticipation: maxAbility(current.mental.anticipation, potential.mental.anticipation),
      composure: maxAbility(current.mental.composure, potential.mental.composure),
      determination: maxAbility(current.mental.determination, potential.mental.determination),
      leadership: maxAbility(current.mental.leadership, potential.mental.leadership),
    },
    goalkeeping: {
      reflexes: maxAbility(current.goalkeeping.reflexes, potential.goalkeeping.reflexes),
      handling: maxAbility(current.goalkeeping.handling, potential.goalkeeping.handling),
      rushingOut: maxAbility(current.goalkeeping.rushingOut, potential.goalkeeping.rushingOut),
      goalkeeperPositioning: maxAbility(
        current.goalkeeping.goalkeeperPositioning,
        potential.goalkeeping.goalkeeperPositioning,
      ),
      footwork: maxAbility(current.goalkeeping.footwork, potential.goalkeeping.footwork),
    },
  };
}

function maxAbility(current: number, potential: number) {
  return abilityValue(Math.max(current, potential));
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
