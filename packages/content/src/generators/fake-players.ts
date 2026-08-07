import {
  createPersonIdentity,
  gameDate,
  naturalCanonicalRoleForPosition,
  playerId,
  type ClubId,
  type ClubCategory,
  type CreatedPlayer,
  type PersonIdentity,
  type PlayerDynamicState,
  type PlayerId,
  type PlayerPosition,
  type PlayerRatingScaleConfig,
  type RoleIdentifiedPlayer,
  type CanonicalPlayerRole,
} from "@game/domain";
import { deriveRng, fromISO } from "@game/shared";

import { FAKE_LINEUP_SIZE, FAKE_PLAYERS_PER_CLUB, fakePlayerId } from "./fake-clubs.ts";
import {
  openingCompetitiveTierForClubRank,
  type OpeningPlayerGenerationClubContext,
} from "./player-generation-bands.ts";
import {
  buildPlayerRarityAllocation,
  isRoutineSelectionExcludedArchetype,
  playerRaritySlotKey,
  type PlayerRarityAssignment,
  type PlayerRarityBudget,
} from "./player-rarity-budget.ts";
import {
  GENERATED_PLAYER_ARCHETYPE_KEYS,
  getGeneratedPlayerArchetype,
  resolveGeneratedExceptionalProfile,
  type GeneratedPlayerArchetype,
  type GeneratedPlayerArchetypeKey,
  type GeneratedExceptionalProfile,
} from "./player-archetypes.ts";
import { assembleGeneratedPlayer } from "./generated-player-factory.ts";
import {
  buildContextualProspectJointProfile,
  type ContextualProspectCeilingConstraint,
} from "./player-prospect-joint-profile.ts";
import { getNameCulturePool } from "../identity/name-cultures.ts";
import { selectNationality, type LeagueNationCode } from "../identity/nationality-distribution.ts";
import { primaryRoleForPosition } from "./player-role-identity.ts";
import { generatedSquadIdentity, squadIdentityPositionForSlot } from "./squad-identity.ts";
import { playerRatingScale as defaultPlayerRatingScale } from "../balance/player-economy-calibration.ts";

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
  /** Canonical football role the generated club fields this player in. */
  readonly canonicalRole: CanonicalPlayerRole;
}

/**
 * Generated fake player collection for the first CLI milestone.
 */
export interface FakePlayers {
  /** Player lookup by ID. */
  readonly players: Readonly<Record<PlayerId, RoleIdentifiedPlayer>>;
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
  readonly clubContexts?: Readonly<Record<ClubId, OpeningPlayerGenerationClubContext>>;
  /** Validated global scale used only for explicitly budgeted six-star floors. */
  readonly ratingScale?: PlayerRatingScaleConfig;
  /** Complete-world assignments produced once before per-division generation. */
  readonly exceptionalAssignments?: {
    readonly currentSixPlayerIds: readonly PlayerId[];
    readonly potentialSixPlayerIds: readonly PlayerId[];
    /** Natural upper-ceiling outliers rebuilt through a bounded non-six lane. */
    readonly reconstructedPotentialBelowSixPlayerIds?: readonly PlayerId[];
  };
  /** Optional namespace that keeps independently generated divisions globally unique. */
  readonly playerIdNamespace?: string;
}

/**
 * Generates fictional first-team players and each club's opening eleven.
 *
 * Every club draws one squad identity, so the depth chart - and therefore the
 * eleven that comes out of it - is a property of the club rather than of the
 * slot number. The eleven is not a formation: it is each footballer in the slot
 * he is natural in, and which shape suits the squad is the selector's answer.
 *
 * @example
 * const players = generateFakePlayersForClubs(clubIds);
 */
export function generateFakePlayersForClubs(
  clubIds: readonly ClubId[],
  options: FakePlayerGenerationOptions = {},
): FakePlayers {
  const players: Record<PlayerId, RoleIdentifiedPlayer> = {};
  const playerIds: PlayerId[] = [];
  const playerIdentities: Record<PlayerId, PersonIdentity> = {};
  const playerArchetypes: Record<PlayerId, GeneratedPlayerArchetypeKey> = {};
  const playerRarityAssignments: Record<PlayerId, PlayerRarityAssignment> = {};
  const playerStates: Record<PlayerId, PlayerDynamicState> = {};
  const lineupsByClubId: Record<ClubId, readonly FakeLineupSlot[]> = {};
  const seed = options.seed ?? "demo-001";
  const leagueNation = options.leagueNation ?? "italian";
  const ratingScale = options.ratingScale ?? defaultPlayerRatingScale;
  const currentSixPlayerIds = new Set(options.exceptionalAssignments?.currentSixPlayerIds ?? []);
  const potentialSixPlayerIds = new Set(options.exceptionalAssignments?.potentialSixPlayerIds ?? []);
  const reconstructedPotentialBelowSixPlayerIds = new Set(
    options.exceptionalAssignments?.reconstructedPotentialBelowSixPlayerIds ?? [],
  );
  for (const id of reconstructedPotentialBelowSixPlayerIds) {
    if (currentSixPlayerIds.has(id) || potentialSixPlayerIds.has(id)) {
      throw new Error(`One player cannot be both exceptional and reconstructed below six: ${id}`);
    }
  }
  const leagueNameUsage = createLeagueNameUsage();
  const division = divisionForGeneratedLeague(clubIds, options.clubContexts);
  const rarityAllocation = buildPlayerRarityAllocation({
    seed,
    division,
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
    const squadIdentity = generatedSquadIdentity(seed, clubNumber);

    for (let slotNumber = 1; slotNumber <= FAKE_PLAYERS_PER_CLUB; slotNumber += 1) {
      const id = generatedFakePlayerId(clubNumber, slotNumber, options.playerIdNamespace);
      const position = squadIdentityPositionForSlot(squadIdentity, slotNumber);
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
      const exceptionalProfile = resolveGeneratedExceptionalProfile({
        currentSixAllocated: currentSixPlayerIds.has(id),
        potentialSixAllocated: potentialSixPlayerIds.has(id),
      });
      const reconstructBelowSix = reconstructedPotentialBelowSixPlayerIds.has(id);
      const archetype = reconstructBelowSix
        ? getGeneratedPlayerArchetype("senior_regular")
        : exceptionalProfile.archetypeKey !== undefined
        ? getGeneratedPlayerArchetype(exceptionalProfile.archetypeKey)
        : rarityAssignment === undefined
          ? selectPlayerArchetype(seed, id, clubNumber, slotNumber, slotNumber <= FAKE_LINEUP_SIZE)
          : getGeneratedPlayerArchetype(rarityAssignment.archetypeKey);
      const created = fakePlayer({
        id,
        slotNumber,
        position,
        identity,
        seed,
        archetype,
        clubContext,
        ratingScale,
        exceptionalProfile,
        reconstructPotentialBelowSix: reconstructBelowSix,
      });

      players[id] = created.player;
      playerIds.push(id);
      playerIdentities[id] = identity;
      playerArchetypes[id] = archetype.key;
      if (
        rarityAssignment !== undefined
        && exceptionalProfile.kind === "ordinary"
        && !reconstructBelowSix
      ) {
        playerRarityAssignments[id] = rarityAssignment;
      }
      playerStates[id] = created.dynamicState;
      if (slotNumber <= FAKE_LINEUP_SIZE) {
        lineup.push({
          slotId: `slot:${String(slotNumber).padStart(2, "0")}`,
          playerId: id,
          canonicalRole: naturalCanonicalRoleForPosition(position),
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

/** Resolves the stable player ID used by one optional namespaced league. */
export function generatedFakePlayerId(
  clubNumber: number,
  slotNumber: number,
  namespace?: string,
): PlayerId {
  if (namespace === undefined) return fakePlayerId(clubNumber, slotNumber);
  const safeNamespace = namespace.replaceAll(":", "-");
  return playerId(
    `player:${safeNamespace}-${String(clubNumber).padStart(2, "0")}-${String(slotNumber).padStart(2, "0")}`,
  );
}

/** Everything one generated player is built from. */
interface FakePlayerInput {
  /** Stable generated player ID. */
  readonly id: PlayerId;
  /** One-based squad slot, which states depth and nothing else. */
  readonly slotNumber: number;
  /** Pitch position this slot holds under the club's squad identity. */
  readonly position: PlayerPosition;
  /** Fictional person this footballer is. */
  readonly identity: PersonIdentity;
  /** Content seed every derived stream hangs off. */
  readonly seed: string;
  /** Ability archetype chosen for this slot. */
  readonly archetype: GeneratedPlayerArchetype;
  /** Division, reputation and competitive tier of the owning club. */
  readonly clubContext: OpeningPlayerGenerationClubContext;
  /** Validated global scale, used only by explicitly budgeted six-star floors. */
  readonly ratingScale: PlayerRatingScaleConfig;
  /** World-level exceptional decision for this player. */
  readonly exceptionalProfile: GeneratedExceptionalProfile;
  /** Whether this player is a ceiling outlier rebuilt below six stars. */
  readonly reconstructPotentialBelowSix: boolean;
}

/**
 * Builds one generated player with a deterministic ability profile.
 *
 * `position` arrives from the club's squad identity rather than being derived
 * from `slotNumber` here: two clubs field different footballers at the same
 * depth, and a slot number cannot say which. `slotNumber` still decides depth,
 * and only depth.
 */
function fakePlayer(input: FakePlayerInput): CreatedPlayer {
  const { id, seed, archetype, clubContext, exceptionalProfile } = input;
  const clubTier = clubContext.competitiveTier;
  const ageYears = numberInRange(archetype.ageYears, seed, "player-age", id);
  const birthDateJitter = deriveRng(seed, "player-birth-date", id).nextInt(0, 365);
  const primaryRole = primaryRoleForPosition(input.position);
  const profile = buildContextualProspectJointProfile({
    seed,
    playerKey: String(id),
    division: clubContext.category,
    clubTier,
    role: primaryRole,
    ageYears,
    archetypeKey: archetype.key,
    ratingScale: input.ratingScale,
    requestedCurrentAbilityLane:
      input.reconstructPotentialBelowSix ? "normal" : exceptionalProfile.currentAbilityLane,
    ceilingConstraint: seniorCeilingConstraint(
      exceptionalProfile,
      input.reconstructPotentialBelowSix,
    ),
    slotDepthAdjustment: slotDepthOffset(input.slotNumber),
  });

  return assembleGeneratedPlayer({
    id,
    identity: input.identity,
    referenceDate: gameDate(FAKE_CAREER_START_EPOCH_DAY),
    ageYears,
    birthDateJitterDays: birthDateJitter,
    position: input.position,
    abilities: profile.current,
    potential: profile.potential,
  });
}

/**
 * Converts the national exceptional-stock decision into a semantic ceiling.
 *
 * Future country generators should reuse this policy shape at their own world
 * composition root instead of passing raw role-ability thresholds downstream.
 */
function seniorCeilingConstraint(
  exceptionalProfile: GeneratedExceptionalProfile,
  reconstructPotentialBelowSix: boolean,
): ContextualProspectCeilingConstraint {
  if (reconstructPotentialBelowSix) {
    return { kind: "below_rating", rating: 6 };
  }
  if (exceptionalProfile.requiresSixStarPotentialFloor) {
    return { kind: "at_least_rating", rating: 6 };
  }
  return { kind: "policy" };
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
  readonly clubContext: OpeningPlayerGenerationClubContext;
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
    if (isRoutineSelectionExcludedArchetype(key) || (isLineupSlot && isYouthArchetype(key))) {
      continue;
    }

    const archetype = getGeneratedPlayerArchetype(key);
    totalWeight += isLineupSlot ? archetype.lineupWeight : archetype.reserveWeight;
  }

  let cursor = rng.nextFloat() * totalWeight;

  for (const key of GENERATED_PLAYER_ARCHETYPE_KEYS) {
    if (isRoutineSelectionExcludedArchetype(key) || (isLineupSlot && isYouthArchetype(key))) {
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

function isYouthArchetype(key: GeneratedPlayerArchetypeKey): boolean {
  return key === "normal_youth" || key === "good_prospect";
}

function divisionForGeneratedLeague(
  clubIds: readonly ClubId[],
  clubContexts: Readonly<Record<ClubId, OpeningPlayerGenerationClubContext>> | undefined,
): ClubCategory {
  const categories = new Set(clubIds.map((clubId, index) =>
    clubContexts?.[clubId]?.category ?? defaultClubContext(index + 1).category
  ));
  if (categories.size !== 1) {
    throw new Error("One fake-player generation call must contain exactly one division");
  }
  return [...categories][0] ?? "third_division";
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

/**
 * Provides the default identity-distribution context for the current demo
 * league, which represents a third-division competition.
 */
function defaultClubContext(clubNumber: number): OpeningPlayerGenerationClubContext {
  return {
    category: "third_division",
    reputation: 4 + ((clubNumber - 1) % 6),
    competitiveTier: openingCompetitiveTierForClubRank(clubNumber),
  };
}
