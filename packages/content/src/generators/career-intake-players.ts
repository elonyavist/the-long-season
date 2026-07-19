import {
  createPersonIdentity,
  gameDate,
  playerId,
  type ClubCategory,
  type ClubId,
  type GameDate,
  type PersonIdentity,
  type PlayerDynamicState,
  type PlayerId,
  type PlayerPosition,
  type RoleIdentifiedPlayer,
  type SeasonId,
} from "@game/domain";
import { deriveRng, fromISO } from "@game/shared";

import { getNameCulturePool } from "../identity/name-cultures.ts";
import { selectNationality, type LeagueNationCode } from "../identity/nationality-distribution.ts";
import type { PlayerGenerationClubTier } from "./player-generation-bands.ts";
import { assembleGeneratedPlayer } from "./generated-player-factory.ts";
import { buildCurrentPlayerProfile } from "./player-current-profile-policy.ts";
import { allocateReachablePotential } from "./player-potential-allocation.ts";
import { getGeneratedPlayerArchetype, type GeneratedPlayerArchetypeKey } from "./player-archetypes.ts";
import { primaryRoleForPosition } from "./player-role-identity.ts";

const CAREER_START_EPOCH_DAY = fromISO("2026-08-01");

/** Club context used by deterministic career intake generation. */
export interface CareerIntakeClubContext {
  /** Broad division/category where the club currently plays. */
  readonly category: ClubCategory;
  /** Club reputation used as a small proxy for intra-division strength. */
  readonly reputation: number;
}

/** One generated intake player and report metadata. */
export interface CareerIntakeGeneratedPlayer {
  /** Generated player entity. */
  readonly player: RoleIdentifiedPlayer;
  /** Initial dynamic state for the generated player. */
  readonly playerState: PlayerDynamicState;
  /** Generated identity metadata for presentation/reporting. */
  readonly identity: PersonIdentity;
  /** Archetype key used to create age/current/potential shape. */
  readonly archetypeKey: GeneratedPlayerArchetypeKey;
}

/** Input for deterministic career intake generation. */
export interface GenerateCareerIntakePlayersInput {
  /** Stable world seed. */
  readonly worldSeed: string;
  /** Season that owns this intake batch. */
  readonly seasonId: SeasonId;
  /** Club receiving this intake candidate pool. */
  readonly clubId: ClubId;
  /** Club sporting context for credible division/tier generation. */
  readonly clubContext: CareerIntakeClubContext;
  /** Number of intake players to generate. */
  readonly count: number;
  /** Game date used as age reference. Defaults to the first demo career date. */
  readonly referenceDate?: GameDate;
  /** Optional league nation, defaulting to the current Italian demo world. */
  readonly leagueNation?: LeagueNationCode;
}

/** Result of deterministic career intake generation. */
export interface GenerateCareerIntakePlayersResult {
  /** Generated players in deterministic order. */
  readonly generatedPlayers: readonly CareerIntakeGeneratedPlayer[];
}

/**
 * Generates deterministic young intake candidates for one club.
 *
 * The generator reuses the same content-owned division bands, role templates,
 * nationality distribution, and archetype data used by initial world
 * generation. Routine intake avoids `rare_prodigy`; exceptional youth can be
 * introduced later through an explicit league-level rarity budget step.
 */
export function generateCareerIntakePlayers(input: GenerateCareerIntakePlayersInput): GenerateCareerIntakePlayersResult {
  const generatedPlayers: CareerIntakeGeneratedPlayer[] = [];
  const nameUsage = createBatchNameUsage();
  const leagueNation = input.leagueNation ?? "italian";

  for (let index = 0; index < input.count; index += 1) {
    const generatedPlayer = generateOneIntakePlayer({
      ...input,
      leagueNation,
      index,
      nameUsage,
    });
    generatedPlayers.push(generatedPlayer);
  }

  return { generatedPlayers };
}

interface GenerateOneIntakePlayerInput extends GenerateCareerIntakePlayersInput {
  readonly leagueNation: LeagueNationCode;
  readonly index: number;
  readonly nameUsage: BatchNameUsage;
}

function generateOneIntakePlayer(input: GenerateOneIntakePlayerInput): CareerIntakeGeneratedPlayer {
  const id = intakePlayerId(input.clubId, input.seasonId, input.index + 1);
  const archetypeKey = selectIntakeArchetype(input.worldSeed, input.seasonId, id);
  const archetype = getGeneratedPlayerArchetype(archetypeKey);
  const position = positionForIntakeSlot(input.worldSeed, input.seasonId, id, input.index);
  const clubTier = clubTierForReputation(input.clubContext.reputation);
  const ageYears = numberInRange(archetype.ageYears, input.worldSeed, "career-intake-age", id);
  const birthDateJitter = deriveRng(input.worldSeed, "career-intake-birth-date", input.seasonId, id).nextInt(0, 365);
  const referenceDate = input.referenceDate ?? gameDate(CAREER_START_EPOCH_DAY);
  const identity = intakeIdentity(input, id);
  const primaryRole = primaryRoleForPosition(position);
  const abilities = buildCurrentPlayerProfile({
    seed: input.worldSeed,
    playerKey: String(id),
    division: input.clubContext.category,
    clubTier,
    role: primaryRole,
    ageYears,
    rarityLane: rarityLaneForIntakeArchetype(archetypeKey),
  });
  const assembled = assembleGeneratedPlayer({
    id,
    identity,
    referenceDate,
    ageYears,
    birthDateJitterDays: birthDateJitter,
    position,
    abilities,
    potential: allocateReachablePotential({
      seed: input.worldSeed,
      playerKey: String(id),
      abilities,
      ageYears,
      role: primaryRole,
      division: input.clubContext.category,
      clubTier,
      potentialClass: archetype.potentialClass,
    }),
  });

  return {
    player: assembled.player,
    playerState: assembled.dynamicState,
    identity,
    archetypeKey,
  };
}

function rarityLaneForIntakeArchetype(archetypeKey: GeneratedPlayerArchetypeKey): "normal" | "rare" | "exceptional" {
  if (archetypeKey === "serious_prospect") return "rare";
  return "normal";
}

function intakeIdentity(input: GenerateOneIntakePlayerInput, id: PlayerId): PersonIdentity {
  const nationality = selectNationality({
    seed: input.worldSeed,
    leagueNation: input.leagueNation,
    clubCategory: input.clubContext.category,
    clubReputation: input.clubContext.reputation,
    playerKey: id,
  });
  const pool = getNameCulturePool(nationality.nameCulture);

  for (let attempt = 0; attempt < Math.max(16, pool.firstNames.length * pool.lastNames.length); attempt += 1) {
    const rng = deriveRng(input.worldSeed, "career-intake-name", input.seasonId, id, nationality.nameCulture, attempt);
    const firstName = pool.firstNames[rng.nextInt(0, pool.firstNames.length)];
    const lastName = pool.lastNames[rng.nextInt(0, pool.lastNames.length)];
    if (firstName === undefined || lastName === undefined) {
      continue;
    }

    const fullName = `${firstName} ${lastName}`;
    if (input.nameUsage.fullNames.has(fullName) || input.nameUsage.lastNames.has(lastName)) {
      continue;
    }

    input.nameUsage.fullNames.add(fullName);
    input.nameUsage.lastNames.add(lastName);
    return createPersonIdentity({
      firstName,
      lastName,
      nationality: nationality.nationality,
      ...(nationality.secondNationality === undefined ? {} : { secondNationality: nationality.secondNationality }),
      birthCountry: nationality.birthCountry,
      nameCulture: nationality.nameCulture,
    });
  }

  throw new Error(`Unable to generate unique intake name for ${id}`);
}

function intakePlayerId(clubId: ClubId, seasonId: SeasonId, sequence: number): PlayerId {
  const clubKey = String(clubId).replace("club:", "").replaceAll(":", "-");
  const seasonKey = String(seasonId).replace("season:", "").replaceAll(":", "-");
  return playerId(`player:intake-${clubKey}-${seasonKey}-${String(sequence).padStart(3, "0")}`);
}

function selectIntakeArchetype(
  worldSeed: string,
  seasonId: SeasonId,
  playerIdValue: PlayerId,
): Exclude<GeneratedPlayerArchetypeKey, "rare_prodigy" | "category_star" | "veteran_drop_down" | "senior_regular" | "category_starter"> {
  const rng = deriveRng(worldSeed, "career-intake-archetype", seasonId, playerIdValue);
  const roll = rng.nextFloat();

  if (roll < 0.03) {
    return "serious_prospect";
  }

  if (roll < 0.23) {
    return "good_prospect";
  }

  return "normal_youth";
}

function positionForIntakeSlot(worldSeed: string, seasonId: SeasonId, id: PlayerId, index: number): PlayerPosition {
  if (index === 0) {
    return "gk";
  }

  const positions: readonly PlayerPosition[] = ["cb", "rb", "lb", "cm", "dm", "am", "rw", "lw", "st", "st"];
  const rng = deriveRng(worldSeed, "career-intake-position", seasonId, id);
  return positions[rng.nextInt(0, positions.length)] ?? "cm";
}

function clubTierForReputation(reputation: number): PlayerGenerationClubTier {
  if (reputation >= 8) return "title_contender";
  if (reputation >= 6) return "playoff_contender";
  if (reputation >= 4) return "mid_table";
  return "survival";
}

function numberInRange(
  range: { readonly minInclusive: number; readonly maxInclusive: number },
  seed: string,
  streamName: string,
  id: PlayerId,
): number {
  const rng = deriveRng(seed, streamName, id);
  return rng.nextInt(range.minInclusive, range.maxInclusive + 1);
}

interface BatchNameUsage {
  readonly fullNames: Set<string>;
  readonly lastNames: Set<string>;
}

function createBatchNameUsage(): BatchNameUsage {
  return {
    fullNames: new Set<string>(),
    lastNames: new Set<string>(),
  };
}
