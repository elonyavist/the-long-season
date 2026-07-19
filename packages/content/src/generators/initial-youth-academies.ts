import {
  createPersonIdentity,
  playerId,
  type ClubCategory,
  type ClubId,
  type CreatedPlayer,
  type GameDate,
  type PersonIdentity,
  type PlayerDynamicState,
  type PlayerId,
  type PlayerPosition,
  type RoleIdentifiedPlayer,
  type SeasonId,
  type YouthDevelopmentLevel,
  type YouthAcademyClubRoster,
  type YouthAcademyState,
  type YouthPlayerLifecycle,
} from "@game/domain";
import { deriveRng } from "@game/shared";

import { getNameCulturePool } from "../identity/name-cultures.ts";
import { selectNationality, type LeagueNationCode } from "../identity/nationality-distribution.ts";
import { assembleGeneratedPlayer } from "./generated-player-factory.ts";
import { getGeneratedPlayerArchetype, type GeneratedPlayerArchetypeKey } from "./player-archetypes.ts";
import type { PlayerGenerationClubTier } from "./player-generation-bands.ts";
import {
  buildYouthPlayerRarityAllocation,
  playerRaritySlotKey,
} from "./player-rarity-budget.ts";
import { currentAbilityRarityLaneForYouthProspect } from "./player-potential-rarity.ts";
import { primaryRoleForPosition } from "./player-role-identity.ts";
import { buildRoleAwarePlayerAbilities } from "./player-role-templates.ts";
import { allocateReachablePotential } from "./player-potential-allocation.ts";
import {
  deriveYouthDevelopmentLevel,
  youthDevelopmentCurrentBoost,
  youthDevelopmentInterestingChance,
} from "./youth-development-level.ts";

/** Exact academy size chosen by Phase 33. */
export const INITIAL_YOUTH_PLAYERS_PER_CLUB = 11;

/** Exact academy refill target chosen by Phase 33. */
export const YOUTH_ACADEMY_REFILL_TARGET_PLAYERS_PER_CLUB = 11;

/** Department-balanced youth position plan: 1 GK, 4 DEF, 4 MID, 2 ATT. */
export const YOUTH_ACADEMY_POSITION_PLAN: readonly PlayerPosition[] = [
  "gk",
  "cb",
  "cb",
  "rb",
  "lb",
  "dm",
  "cm",
  "cm",
  "am",
  "st",
  "rw",
];

/** Club context used by initial youth academy generation. */
export interface InitialYouthAcademyClubContext {
  /** Broad division/category where the club currently plays. */
  readonly category: ClubCategory;
  /** Club reputation used as a small proxy for intra-division strength. */
  readonly reputation: number;
}

/** Input for deterministic initial youth academy generation. */
export interface GenerateInitialYouthAcademiesInput {
  /** Stable world seed. */
  readonly worldSeed: string;
  /** Season that owns the initial academy state. */
  readonly seasonId: SeasonId;
  /** Date used as age reference. */
  readonly referenceDate: GameDate;
  /** Clubs receiving initial youth rosters, in deterministic order. */
  readonly clubIds: readonly ClubId[];
  /** Sporting context for each generated club. */
  readonly clubContexts: Readonly<Record<ClubId, InitialYouthAcademyClubContext>>;
  /** Optional count override for focused tests; production uses Phase 32 target. */
  readonly youthPlayersPerClub?: number;
  /** Optional league nation, defaulting to the current Italian demo world. */
  readonly leagueNation?: LeagueNationCode;
}

/** Result of deterministic initial youth academy generation. */
export interface GenerateInitialYouthAcademiesResult {
  /** Generated youth player lookup by ID. */
  readonly players: Readonly<Record<PlayerId, RoleIdentifiedPlayer>>;
  /** Explicit deterministic generated youth-player order. */
  readonly playerIds: readonly PlayerId[];
  /** Initial dynamic state lookup by youth player ID. */
  readonly playerStates: Readonly<Record<PlayerId, PlayerDynamicState>>;
  /** Generated identity metadata by youth player ID. */
  readonly playerIdentities: Readonly<Record<PlayerId, PersonIdentity>>;
  /** Generated archetype key by youth player ID. */
  readonly playerArchetypes: Readonly<Record<PlayerId, GeneratedPlayerArchetypeKey>>;
  /** Derived academy-development level by club, exposed for diagnostics. */
  readonly clubYouthDevelopmentLevels: Readonly<Record<ClubId, YouthDevelopmentLevel>>;
  /** Durable youth academy state ready to attach to a career save. */
  readonly youthAcademyState: YouthAcademyState;
}

/** Input for deterministic annual youth intake generation. */
export interface GenerateSeasonalYouthIntakePlayersInput {
  /** Stable world seed. */
  readonly worldSeed: string;
  /** Season that owns this youth intake batch. */
  readonly seasonId: SeasonId;
  /** Club receiving this youth intake batch. */
  readonly clubId: ClubId;
  /** Date used as age reference. */
  readonly referenceDate: GameDate;
  /** Sporting context for the receiving club. */
  readonly clubContext: InitialYouthAcademyClubContext;
  /** Optional league nation, defaulting to the current Italian demo world. */
  readonly leagueNation?: LeagueNationCode;
  /** Exact positions missing from the active academy after lifecycle exits. */
  readonly targetPositions?: readonly PlayerPosition[];
}

/** One generated annual youth intake player and metadata. */
export interface SeasonalYouthIntakeGeneratedPlayer {
  /** Generated youth player entity. */
  readonly player: RoleIdentifiedPlayer;
  /** Initial dynamic state for the generated youth player. */
  readonly playerState: PlayerDynamicState;
  /** Generated identity metadata. */
  readonly identity: PersonIdentity;
  /** Archetype key used for current/potential shape. */
  readonly archetypeKey: GeneratedPlayerArchetypeKey;
}

/** Result of deterministic annual youth intake generation. */
export interface GenerateSeasonalYouthIntakePlayersResult {
  /** Generated intake players in deterministic order. */
  readonly generatedPlayers: readonly SeasonalYouthIntakeGeneratedPlayer[];
  /** Derived academy-development level used to shape this intake batch. */
  readonly youthDevelopmentLevel: YouthDevelopmentLevel;
}

/**
 * Generates bounded initial youth rosters for every club in a new career world.
 *
 * The generator creates real `Player` entities but does not add them to senior
 * club rosters. Senior ownership remains exclusively in `Club.playerIds`.
 */
export function generateInitialYouthAcademies(input: GenerateInitialYouthAcademiesInput): GenerateInitialYouthAcademiesResult {
  const players: Record<PlayerId, RoleIdentifiedPlayer> = {};
  const playerIds: PlayerId[] = [];
  const playerStates: Record<PlayerId, PlayerDynamicState> = {};
  const playerIdentities: Record<PlayerId, PersonIdentity> = {};
  const playerArchetypes: Record<PlayerId, GeneratedPlayerArchetypeKey> = {};
  const clubYouthDevelopmentLevels: Record<ClubId, YouthDevelopmentLevel> = {};
  const clubRosters: Record<ClubId, YouthAcademyClubRoster> = {};
  const clubRosterIds: ClubId[] = [];
  const playerLifecycle: Record<PlayerId, YouthPlayerLifecycle> = {};
  const playerLifecycleIds: PlayerId[] = [];
  const leagueNation = input.leagueNation ?? "italian";
  const youthPlayersPerClub = input.youthPlayersPerClub ?? INITIAL_YOUTH_PLAYERS_PER_CLUB;
  const rarityAssignments = initialYouthRarityAssignments(input, youthPlayersPerClub);

  for (let clubIndex = 0; clubIndex < input.clubIds.length; clubIndex += 1) {
    const clubId = input.clubIds[clubIndex];
    if (clubId === undefined) {
      continue;
    }

    const clubContext = input.clubContexts[clubId];
    if (clubContext === undefined) {
      throw new Error(`Missing initial youth academy club context: ${clubId}`);
    }

    const clubNameUsage = createClubNameUsage();
    const rosterPlayerIds: PlayerId[] = [];
    const youthDevelopmentLevel = deriveYouthDevelopmentLevel({
      division: clubContext.category,
      clubReputation: clubContext.reputation,
    });
    clubYouthDevelopmentLevels[clubId] = youthDevelopmentLevel;

    for (let index = 0; index < youthPlayersPerClub; index += 1) {
      const id = initialYouthPlayerId(clubId, index + 1);
      const archetypeKey = rarityAssignments[id] ?? selectRoutineInitialYouthArchetype({
        worldSeed: input.worldSeed,
        seasonId: input.seasonId,
        clubId,
        playerId: id,
        youthDevelopmentLevel,
      });
      const position = positionForInitialYouthSlot(input.worldSeed, input.seasonId, id, index);
      const identity = initialYouthIdentity({
        worldSeed: input.worldSeed,
        seasonId: input.seasonId,
        clubId,
        playerId: id,
        leagueNation,
        clubContext,
        clubNameUsage,
      });
      const generatedPlayer = youthAcademyPlayer({
        id,
        identity,
        worldSeed: input.worldSeed,
        seasonId: input.seasonId,
        referenceDate: input.referenceDate,
        position,
        archetypeKey,
        youthDevelopmentLevel,
        ageYears: initialYouthAge(input.worldSeed, input.seasonId, id),
        clubContext,
      });

      players[id] = generatedPlayer.player;
      playerIds.push(id);
      playerStates[id] = generatedPlayer.dynamicState;
      playerIdentities[id] = identity;
      playerArchetypes[id] = archetypeKey;
      rosterPlayerIds.push(id);
      playerLifecycle[id] = {
        playerId: id,
        clubId,
        status: "academy",
        academyEntrySeasonId: input.seasonId,
        academyEntryDate: input.referenceDate,
      };
      playerLifecycleIds.push(id);
    }

    clubRosters[clubId] = {
      clubId,
      playerIds: rosterPlayerIds,
    };
    clubRosterIds.push(clubId);
  }

  return {
    players,
    playerIds,
    playerStates,
    playerIdentities,
    playerArchetypes,
    clubYouthDevelopmentLevels,
    youthAcademyState: {
      clubRosters,
      clubRosterIds,
      playerLifecycle,
      playerLifecycleIds,
    },
  };
}

/**
 * Generates one bounded annual youth intake batch for a club.
 *
 * Intake players are candidates only: engine code decides how many can be
 * attached to the active academy after checking the current youth roster size.
 */
export function generateSeasonalYouthIntakePlayers(input: GenerateSeasonalYouthIntakePlayersInput): GenerateSeasonalYouthIntakePlayersResult {
  const generatedPlayers: SeasonalYouthIntakeGeneratedPlayer[] = [];
  const clubNameUsage = createClubNameUsage();
  const targetPositions = input.targetPositions ?? YOUTH_ACADEMY_POSITION_PLAN;
  const leagueNation = input.leagueNation ?? "italian";
  const youthDevelopmentLevel = deriveYouthDevelopmentLevel({
    division: input.clubContext.category,
    clubReputation: input.clubContext.reputation,
  });

  for (let index = 0; index < targetPositions.length; index += 1) {
    const id = seasonalYouthPlayerId(input.clubId, input.seasonId, index + 1);
    const archetypeKey = selectSeasonalYouthArchetype(input.worldSeed, input.seasonId, input.clubId, id, youthDevelopmentLevel);
    const position = targetPositions[index] ?? "cm";
    const identity = initialYouthIdentity({
      worldSeed: input.worldSeed,
      seasonId: input.seasonId,
      clubId: input.clubId,
      playerId: id,
      leagueNation,
      clubContext: input.clubContext,
      clubNameUsage,
    });
    const generatedPlayer = youthAcademyPlayer({
      id,
      identity,
      worldSeed: input.worldSeed,
      seasonId: input.seasonId,
      referenceDate: input.referenceDate,
      position,
      archetypeKey,
      youthDevelopmentLevel,
      ageYears: seasonalYouthAge(input.worldSeed, input.seasonId, id),
      clubContext: input.clubContext,
    });

    generatedPlayers.push({
      player: generatedPlayer.player,
      playerState: generatedPlayer.dynamicState,
      identity,
      archetypeKey,
    });
  }

  return { generatedPlayers, youthDevelopmentLevel };
}

function youthAcademyPlayer(input: {
  readonly id: PlayerId;
  readonly identity: PersonIdentity;
  readonly worldSeed: string;
  readonly seasonId: SeasonId;
  readonly referenceDate: GameDate;
  readonly position: PlayerPosition;
  readonly archetypeKey: GeneratedPlayerArchetypeKey;
  readonly youthDevelopmentLevel: YouthDevelopmentLevel;
  readonly ageYears: number;
  readonly clubContext: InitialYouthAcademyClubContext;
}): CreatedPlayer {
  const archetype = getGeneratedPlayerArchetype(input.archetypeKey);
  const clubTier = clubTierForReputation(input.clubContext.reputation);
  const birthDateJitter = deriveRng(input.worldSeed, "initial-youth-birth-date", input.seasonId, input.id).nextInt(0, 365);
  const primaryRole = primaryRoleForPosition(input.position);
  const abilities = buildRoleAwarePlayerAbilities({
    seed: input.worldSeed,
    playerKey: String(input.id),
    division: input.clubContext.category,
    clubTier,
    role: primaryRole,
    ageYears: input.ageYears,
    // Academy level gives only a bounded current-quality nudge.
    rarityLane: currentAbilityRarityLaneForYouthProspect(input.archetypeKey, Number(input.youthDevelopmentLevel)),
    slotDepthAdjustment: youthDevelopmentCurrentBoost(input.youthDevelopmentLevel),
  });
  const proposedPotential = allocateReachablePotential({
    seed: input.worldSeed,
    playerKey: String(input.id),
    abilities,
    ageYears: input.ageYears,
    role: primaryRole,
    division: input.clubContext.category,
    clubTier,
    potentialClass: archetype.potentialClass,
  });

  return assembleGeneratedPlayer({
    id: input.id,
    identity: input.identity,
    referenceDate: input.referenceDate,
    ageYears: input.ageYears,
    birthDateJitterDays: birthDateJitter,
    position: input.position,
    abilities,
    potential: proposedPotential,
  });
}

function initialYouthIdentity(input: {
  readonly worldSeed: string;
  readonly seasonId: SeasonId;
  readonly clubId: ClubId;
  readonly playerId: PlayerId;
  readonly leagueNation: LeagueNationCode;
  readonly clubContext: InitialYouthAcademyClubContext;
  readonly clubNameUsage: ClubNameUsage;
}): PersonIdentity {
  const nationality = selectNationality({
    seed: input.worldSeed,
    leagueNation: input.leagueNation,
    clubCategory: input.clubContext.category,
    clubReputation: input.clubContext.reputation,
    playerKey: input.playerId,
  });
  const pool = getNameCulturePool(nationality.nameCulture);
  let fallback: { readonly firstName: string; readonly lastName: string } | undefined;

  for (let attempt = 0; attempt < Math.max(64, pool.firstNames.length * pool.lastNames.length); attempt += 1) {
    const rng = deriveRng(input.worldSeed, "initial-youth-name", input.seasonId, input.clubId, input.playerId, nationality.nameCulture, attempt);
    const firstName = pool.firstNames[rng.nextInt(0, pool.firstNames.length)];
    const lastName = pool.lastNames[rng.nextInt(0, pool.lastNames.length)];
    if (firstName === undefined || lastName === undefined) {
      continue;
    }

    fallback ??= { firstName, lastName };
    const fullName = `${firstName} ${lastName}`;
    if (input.clubNameUsage.fullNames.has(fullName) || input.clubNameUsage.lastNames.has(lastName)) {
      continue;
    }

    input.clubNameUsage.fullNames.add(fullName);
    input.clubNameUsage.lastNames.add(lastName);
    return createPersonIdentity({
      firstName,
      lastName,
      nationality: nationality.nationality,
      ...(nationality.secondNationality === undefined ? {} : { secondNationality: nationality.secondNationality }),
      birthCountry: nationality.birthCountry,
      nameCulture: nationality.nameCulture,
    });
  }

  if (fallback === undefined) {
    throw new Error(`Missing initial youth name for ${input.playerId}`);
  }

  return createPersonIdentity({
    firstName: fallback.firstName,
    lastName: fallback.lastName,
    nationality: nationality.nationality,
    ...(nationality.secondNationality === undefined ? {} : { secondNationality: nationality.secondNationality }),
    birthCountry: nationality.birthCountry,
    nameCulture: nationality.nameCulture,
  });
}

function selectRoutineInitialYouthArchetype(input: {
  readonly worldSeed: string;
  readonly seasonId: SeasonId;
  readonly clubId: ClubId;
  readonly playerId: PlayerId;
  readonly youthDevelopmentLevel: YouthDevelopmentLevel;
}): GeneratedPlayerArchetypeKey {
  const rng = deriveRng(input.worldSeed, "initial-youth-archetype", input.seasonId, input.clubId, input.playerId);
  const roll = rng.nextFloat();

  if (roll >= 0.06 && roll < 0.06 + youthDevelopmentInterestingChance(input.youthDevelopmentLevel)) {
    return "good_prospect";
  }

  return "normal_youth";
}

function initialYouthRarityAssignments(
  input: GenerateInitialYouthAcademiesInput,
  youthPlayersPerClub: number,
): Readonly<Partial<Record<PlayerId, GeneratedPlayerArchetypeKey>>> {
  const clubIdsByCategory = new Map<ClubCategory, ClubId[]>();
  const assignments: Partial<Record<PlayerId, GeneratedPlayerArchetypeKey>> = {};

  for (const clubId of input.clubIds) {
    const clubContext = input.clubContexts[clubId];
    if (clubContext === undefined) {
      throw new Error(`Missing initial youth academy club context: ${clubId}`);
    }

    const clubIds = clubIdsByCategory.get(clubContext.category) ?? [];
    clubIds.push(clubId);
    clubIdsByCategory.set(clubContext.category, clubIds);
  }

  for (const [category, clubIds] of clubIdsByCategory) {
    const allocation = buildYouthPlayerRarityAllocation({
      seed: input.worldSeed,
      division: category,
      seasonKey: String(input.seasonId),
      clubCount: clubIds.length,
      playersPerClub: youthPlayersPerClub,
      clubDevelopmentLevelsByClubNumber: youthDevelopmentLevelsByClubNumber(input.clubContexts, clubIds),
    });

    for (let clubIndex = 0; clubIndex < clubIds.length; clubIndex += 1) {
      const clubId = clubIds[clubIndex];
      if (clubId === undefined) {
        continue;
      }

      for (let slotIndex = 0; slotIndex < youthPlayersPerClub; slotIndex += 1) {
        const assignment = allocation.assignmentsBySlotKey[playerRaritySlotKey(clubIndex + 1, slotIndex + 1)];
        if (assignment !== undefined) {
          assignments[initialYouthPlayerId(clubId, slotIndex + 1)] = assignment.archetypeKey;
        }
      }
    }
  }

  return assignments;
}

function initialYouthAge(worldSeed: string, seasonId: SeasonId, id: PlayerId): number {
  const roll = deriveRng(worldSeed, "initial-youth-age", seasonId, id).nextFloat();
  if (roll < 0.1) return 15;
  if (roll < 0.38) return 16;
  if (roll < 0.66) return 17;
  if (roll < 0.9) return 18;
  return 19;
}

function seasonalYouthAge(worldSeed: string, seasonId: SeasonId, id: PlayerId): number {
  const roll = deriveRng(worldSeed, "seasonal-youth-age", seasonId, id).nextFloat();
  if (roll < 0.32) return 15;
  if (roll < 0.68) return 16;
  if (roll < 0.96) return 17;
  return 18;
}

function selectSeasonalYouthArchetype(
  worldSeed: string,
  seasonId: SeasonId,
  clubId: ClubId,
  playerId: PlayerId,
  youthDevelopmentLevel: YouthDevelopmentLevel,
): GeneratedPlayerArchetypeKey {
  const rng = deriveRng(worldSeed, "seasonal-youth-archetype", seasonId, clubId, playerId);
  const roll = rng.nextFloat();

  if (roll < 0.04) {
    return "serious_prospect";
  }

  if (roll < 0.04 + youthDevelopmentInterestingChance(youthDevelopmentLevel)) {
    return "good_prospect";
  }

  return "normal_youth";
}

function youthDevelopmentLevelsByClubNumber(
  clubContexts: Readonly<Record<ClubId, InitialYouthAcademyClubContext>>,
  clubIds: readonly ClubId[],
): Readonly<Record<number, YouthDevelopmentLevel>> {
  const levels: Record<number, YouthDevelopmentLevel> = {};

  for (let index = 0; index < clubIds.length; index += 1) {
    const clubIdValue = clubIds[index];
    if (clubIdValue === undefined) {
      continue;
    }

    const context = clubContexts[clubIdValue];
    if (context === undefined) {
      throw new Error(`Missing initial youth academy club context: ${clubIdValue}`);
    }

    levels[index + 1] = deriveYouthDevelopmentLevel({
      division: context.category,
      clubReputation: context.reputation,
    });
  }

  return levels;
}

function positionForInitialYouthSlot(worldSeed: string, seasonId: SeasonId, id: PlayerId, index: number): PlayerPosition {
  const planned = YOUTH_ACADEMY_POSITION_PLAN[index % YOUTH_ACADEMY_POSITION_PLAN.length];
  if (planned === "rw") {
    return deriveRng(worldSeed, "initial-youth-wide-side", seasonId, id).nextFloat() < 0.5 ? "rw" : "lw";
  }

  return planned ?? "cm";
}

function initialYouthPlayerId(clubId: ClubId, sequence: number): PlayerId {
  const clubKey = String(clubId).replace("club:", "").replaceAll(":", "-");
  return playerId(`player:youth-${clubKey}-${String(sequence).padStart(2, "0")}`);
}

function seasonalYouthPlayerId(clubId: ClubId, seasonId: SeasonId, sequence: number): PlayerId {
  const clubKey = String(clubId).replace("club:", "").replaceAll(":", "-");
  const seasonKey = String(seasonId).replace("season:", "").replaceAll(":", "-");
  return playerId(`player:youth-intake-${clubKey}-${seasonKey}-${String(sequence).padStart(2, "0")}`);
}

function clubTierForReputation(reputation: number): PlayerGenerationClubTier {
  if (reputation >= 8) return "title_contender";
  if (reputation >= 6) return "playoff_contender";
  if (reputation >= 4) return "mid_table";
  return "survival";
}

interface ClubNameUsage {
  readonly fullNames: Set<string>;
  readonly lastNames: Set<string>;
}

function createClubNameUsage(): ClubNameUsage {
  return {
    fullNames: new Set<string>(),
    lastNames: new Set<string>(),
  };
}
