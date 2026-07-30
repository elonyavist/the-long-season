import {
  createPersonIdentity,
  gameDate,
  playerId,
  type CareerState,
  type ClubCategory,
  type ClubId,
  type GameDate,
  type PersonIdentity,
  type PlayerDynamicState,
  type PlayerId,
  type PlayerPosition,
  type PlayerRatingScaleConfig,
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
import { playerRatingScale as defaultPlayerRatingScale } from "../balance/player-economy-calibration.ts";
import {
  generateSeasonalYouthIntakePlayers,
  seasonalYouthPlayerId,
  YOUTH_ACADEMY_POSITION_PLAN,
} from "./initial-youth-academies.ts";
import {
  buildAnnualWorldIntakeExceptionalAllocation,
  type AnnualWorldIntakeExceptionalAllocation,
} from "./player-rarity-budget.ts";

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
  /** World-level assignments selected before any club batch is generated. */
  readonly potentialSixPlayerIds?: readonly PlayerId[];
  /** Validated scale used by an explicitly assigned potential-six floor. */
  readonly ratingScale?: PlayerRatingScaleConfig;
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

/** Context supplied by engine when annual academy candidates are requested. */
export interface AnnualWorldYouthIntakeProviderContext {
  readonly careerState: CareerState;
  readonly seasonId: SeasonId;
  readonly intakeDate: GameDate;
}

/** Context supplied by engine when annual senior candidates are requested. */
export interface AnnualWorldSeniorIntakeProviderContext {
  readonly careerState: CareerState;
  readonly seasonId: SeasonId;
}

/** Engine-compatible academy candidate without importing engine from content. */
export interface AnnualWorldYouthIntakeCandidate {
  readonly targetClubId: ClubId;
  readonly player: RoleIdentifiedPlayer;
  readonly playerState: PlayerDynamicState;
}

/** Engine-compatible senior candidate without importing engine from content. */
export interface AnnualWorldSeniorIntakeCandidate {
  readonly targetClubId: ClubId;
  readonly player: RoleIdentifiedPlayer;
  readonly playerState: PlayerDynamicState;
}

/** Observable allocation/generation facts owned by one annual provider. */
export interface AnnualWorldIntakeProviderDiagnostics {
  readonly seasonIndex: number;
  readonly allocationCallCount: number;
  readonly allocation: AnnualWorldIntakeExceptionalAllocation;
  readonly generatedPotentialSixPlayerIds: readonly PlayerId[];
}

/** Shared content-side providers consumed by CLI, web, labs, and reports. */
export interface AnnualWorldIntakeCandidateProviders {
  readonly createYouthIntakeCandidates: (
    context: AnnualWorldYouthIntakeProviderContext,
  ) => readonly AnnualWorldYouthIntakeCandidate[];
  readonly createSeniorIntakeCandidates: (
    context: AnnualWorldSeniorIntakeProviderContext,
  ) => readonly AnnualWorldSeniorIntakeCandidate[];
  readonly diagnostics: () => AnnualWorldIntakeProviderDiagnostics;
}

/** Inputs that identify one deterministic world-season intake composition. */
export interface CreateAnnualWorldIntakeCandidateProvidersInput {
  readonly worldSeed: string;
  readonly seasonIndex: number;
  readonly seniorCandidatesPerClub?: number;
  readonly ratingScale?: PlayerRatingScaleConfig;
}

/**
 * Creates one world-level annual intake composition for all app adapters.
 *
 * Engine invokes the youth provider after academy lifecycle has exposed the
 * real open slots. The provider catalogs those exact IDs, calls the global
 * exceptional allocator once, and only then generates candidates. The senior
 * provider reuses the same season composition and never rolls rarity again.
 */
export function createAnnualWorldIntakeCandidateProviders(
  input: CreateAnnualWorldIntakeCandidateProvidersInput,
): AnnualWorldIntakeCandidateProviders {
  if (!Number.isSafeInteger(input.seasonIndex) || input.seasonIndex < 0) {
    throw new RangeError(`Invalid annual intake season index: ${input.seasonIndex}`);
  }
  const ratingScale = input.ratingScale ?? defaultPlayerRatingScale;
  const seniorCandidatesPerClub = input.seniorCandidatesPerClub ?? 8;
  let youthCandidates: readonly AnnualWorldYouthIntakeCandidate[] | undefined;
  let seniorCandidates: readonly AnnualWorldSeniorIntakeCandidate[] | undefined;
  let diagnosticFacts: AnnualWorldIntakeProviderDiagnostics | undefined;
  let composedSeasonId: SeasonId | undefined;

  const createYouthIntakeCandidates = (
    context: AnnualWorldYouthIntakeProviderContext,
  ): readonly AnnualWorldYouthIntakeCandidate[] => {
    if (youthCandidates !== undefined) {
      throw new Error(`Annual world intake already composed for ${context.seasonId}`);
    }
    const targetPositionsByClubId = Object.fromEntries(
      context.careerState.gameState.clubIds.map((clubId) => [
        clubId,
        youthRefillTargetPositions(context.careerState, clubId),
      ]),
    ) as Record<ClubId, readonly PlayerPosition[]>;
    const candidatePlayerKeys = context.careerState.gameState.clubIds.flatMap(
      (clubId) => {
        const club = context.careerState.gameState.clubs[clubId];
        if (club?.category !== "first_division") return [];
        return targetPositionsByClubId[clubId]!.map((_, index) =>
          String(seasonalYouthPlayerId(clubId, context.seasonId, index + 1))
        );
      },
    );
    const allocation = buildAnnualWorldIntakeExceptionalAllocation({
      seed: input.worldSeed,
      cohortKey: `career-intake-${Math.floor(input.seasonIndex / 10)}`,
      seasonIndex: input.seasonIndex,
      ratingScale,
      candidatePlayerKeys,
    });
    const generated: AnnualWorldYouthIntakeCandidate[] = [];

    for (const clubId of context.careerState.gameState.clubIds) {
      const club = context.careerState.gameState.clubs[clubId];
      if (club === undefined) {
        throw new Error(`Missing annual intake club: ${clubId}`);
      }
      const batch = generateSeasonalYouthIntakePlayers({
        worldSeed: input.worldSeed,
        seasonId: context.seasonId,
        clubId,
        clubContext: {
          category: club.category,
          reputation: club.reputation,
        },
        referenceDate: context.intakeDate,
        targetPositions: targetPositionsByClubId[clubId]!,
        potentialSixPlayerIds: allocation.potentialSixPlayerKeys.map(playerId),
        ratingScale,
      });
      for (const candidate of batch.generatedPlayers) {
        generated.push({
          targetClubId: clubId,
          player: candidate.player,
          playerState: candidate.playerState,
        });
      }
    }

    youthCandidates = generated;
    composedSeasonId = context.seasonId;
    diagnosticFacts = {
      seasonIndex: input.seasonIndex,
      allocationCallCount: 1,
      allocation,
      generatedPotentialSixPlayerIds: generated
        .filter((candidate) =>
          allocation.potentialSixPlayerKeys.includes(String(candidate.player.id))
        )
        .map((candidate) => candidate.player.id),
    };
    return youthCandidates;
  };

  const createSeniorIntakeCandidates = (
    context: AnnualWorldSeniorIntakeProviderContext,
  ): readonly AnnualWorldSeniorIntakeCandidate[] => {
    if (diagnosticFacts === undefined || composedSeasonId !== context.seasonId) {
      throw new Error("Annual youth intake must be composed before senior intake");
    }
    if (seniorCandidates !== undefined) return seniorCandidates;
    const generated: AnnualWorldSeniorIntakeCandidate[] = [];
    for (const clubId of context.careerState.gameState.clubIds) {
      const club = context.careerState.gameState.clubs[clubId];
      if (club === undefined) {
        throw new Error(`Missing annual senior intake club: ${clubId}`);
      }
      const batch = generateCareerIntakePlayers({
        worldSeed: input.worldSeed,
        seasonId: context.seasonId,
        clubId,
        clubContext: {
          category: club.category,
          reputation: club.reputation,
        },
        count: seniorCandidatesPerClub,
        referenceDate: context.careerState.gameState.calendar.currentDate,
        ratingScale,
      });
      for (const candidate of batch.generatedPlayers) {
        generated.push({
          targetClubId: clubId,
          player: candidate.player,
          playerState: candidate.playerState,
        });
      }
    }
    seniorCandidates = generated;
    return seniorCandidates;
  };

  return {
    createYouthIntakeCandidates,
    createSeniorIntakeCandidates,
    diagnostics: () => {
      if (diagnosticFacts === undefined) {
        throw new Error("Annual world intake diagnostics requested before composition");
      }
      return diagnosticFacts;
    },
  };
}

interface GenerateOneIntakePlayerInput extends GenerateCareerIntakePlayersInput {
  readonly leagueNation: LeagueNationCode;
  readonly index: number;
  readonly nameUsage: BatchNameUsage;
}

function generateOneIntakePlayer(input: GenerateOneIntakePlayerInput): CareerIntakeGeneratedPlayer {
  const id = intakePlayerId(input.clubId, input.seasonId, input.index + 1);
  const forcePotentialSix = input.potentialSixPlayerIds?.includes(id) === true;
  const archetypeKey = forcePotentialSix
    ? "rare_prodigy"
    : selectIntakeArchetype(input.worldSeed, input.seasonId, id);
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
      ...(forcePotentialSix
        ? {
            minimumRolePotentialAbility: minimumSixAbility(
              input.ratingScale ?? defaultPlayerRatingScale,
            ),
          }
        : {}),
    }),
  });

  return {
    player: assembled.player,
    playerState: assembled.dynamicState,
    identity,
    archetypeKey,
  };
}

function minimumSixAbility(scale: PlayerRatingScaleConfig): number {
  const threshold = scale.abilityThresholds.find((candidate) => candidate.rating === 6);
  if (threshold === undefined) {
    throw new Error("Validated rating scale is missing rating 6");
  }
  return threshold.minimumAbilityInclusive;
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

function youthRefillTargetPositions(
  careerState: CareerState,
  clubId: ClubId,
): readonly PlayerPosition[] {
  const missing = [...YOUTH_ACADEMY_POSITION_PLAN];
  const roster = careerState.youthAcademyState?.clubRosters[clubId];

  for (const existingPlayerId of roster?.playerIds ?? []) {
    const position =
      careerState.gameState.players[existingPlayerId]?.naturalPositions[0];
    if (position === undefined) continue;
    const exactIndex = missing.findIndex((candidate) => candidate === position);
    if (exactIndex >= 0) {
      missing.splice(exactIndex, 1);
      continue;
    }
    const departmentIndex = missing.findIndex(
      (candidate) => youthDepartment(candidate) === youthDepartment(position),
    );
    if (departmentIndex >= 0) missing.splice(departmentIndex, 1);
  }
  return missing;
}

function youthDepartment(
  position: PlayerPosition,
): "attacker" | "defender" | "goalkeeper" | "midfielder" {
  if (position === "gk") return "goalkeeper";
  if (
    position === "cb"
    || position === "rb"
    || position === "lb"
    || position === "rwb"
    || position === "lwb"
  ) {
    return "defender";
  }
  if (
    position === "dm"
    || position === "cm"
    || position === "am"
  ) {
    return "midfielder";
  }
  return "attacker";
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
