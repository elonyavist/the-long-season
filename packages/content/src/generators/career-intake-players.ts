import {
  createPersonIdentity,
  gameDate,
  getPlayerRoleProfile,
  playerId,
  rolePotentialAbility,
  type CareerState,
  type ClubCategory,
  type ClubCompetitiveTier,
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
import { completedCivilYears, deriveRng, fromISO } from "@game/shared";

import { getNameCulturePool } from "../identity/name-cultures.ts";
import { selectNationality, type LeagueNationCode } from "../identity/nationality-distribution.ts";
import { assembleGeneratedPlayer } from "./generated-player-factory.ts";
import { getGeneratedPlayerArchetype, type GeneratedPlayerArchetypeKey } from "./player-archetypes.ts";
import { currentAbilityRarityLaneForYouthProspect } from "./player-potential-rarity.ts";
import {
  buildContextualProspectJointProfile,
  type ContextualProspectCeilingConstraint,
} from "./player-prospect-joint-profile.ts";
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
  type AnnualWorldIntakeExceptionalCandidate,
  type AnnualWorldYoungExceptionalPlayer,
} from "./player-rarity-budget.ts";
import {
  developmentEnvironmentForClubContext,
  deriveYouthDevelopmentLevel,
  youthDevelopmentInterestingChance,
  youthDevelopmentSeriousProspectChance,
} from "./youth-development-level.ts";

const CAREER_START_EPOCH_DAY = fromISO("2026-08-01");

/** Club context used by deterministic career intake generation. */
export interface CareerIntakeClubContext {
  /** Broad division/category where the club currently plays. */
  readonly category: ClubCategory;
  /** Club reputation used as a small proxy for intra-division strength. */
  readonly reputation: number;
  /** Competitive tier frozen for the season that owns this intake. */
  readonly competitiveTier: ClubCompetitiveTier;
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
 * introduced only through the national exceptional-stock allocation.
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
  /** Canonical active population selected after exits and academy lifecycle. */
  readonly activePlayerStock: readonly AnnualWorldActivePlayerStockEntry[];
}

/**
 * One active-player association supplied by engine to content composition.
 *
 * This mirrors the current engine boundary structurally without importing
 * engine into content. A promotion candidate has a transitional club
 * association so annual intake cannot manufacture a vacancy before the same
 * rollover resolves promotion. Loans remain a separate Phase 80B registration
 * concern and are intentionally absent from the Phase 80A union.
 */
export type AnnualWorldActivePlayerStockEntry =
  | {
      readonly playerId: PlayerId;
      readonly source: "senior";
      readonly clubId: ClubId;
    }
  | {
      readonly playerId: PlayerId;
      readonly source: "academy";
      readonly clubId: ClubId;
    }
  | {
      readonly playerId: PlayerId;
      readonly source: "promotion_candidate";
      readonly clubId: ClubId;
    }
  | {
      readonly playerId: PlayerId;
      readonly source: "free_agent";
    };

/** Context supplied by engine when annual senior candidates are requested. */
export interface AnnualWorldSeniorIntakeProviderContext {
  readonly careerState: CareerState;
  readonly seasonId: SeasonId;
  /** Canonical start date of the season receiving these players. */
  readonly intakeDate: GameDate;
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
  readonly generatedStoredCeilingSixPlayerIds: readonly PlayerId[];
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
    const candidates = annualExceptionalCandidates(
      context.careerState,
      context.seasonId,
      targetPositionsByClubId,
    );
    const allocation = buildAnnualWorldIntakeExceptionalAllocation({
      seed: input.worldSeed,
      seasonIndex: input.seasonIndex,
      ratingScale,
      activeYoungPotentialSixPlayers: activeYoungExceptionalPlayers(
        context.careerState,
        context.activePlayerStock,
        ratingScale,
        context.intakeDate,
      ),
      candidates,
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
          competitiveTier: requiredCompetitiveTier(
            context.careerState,
            clubId,
          ),
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
      generatedStoredCeilingSixPlayerIds: generated
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
          competitiveTier: requiredCompetitiveTier(
            context.careerState,
            clubId,
          ),
        },
        count: seniorCandidatesPerClub,
        referenceDate: context.intakeDate,
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

/**
 * Catalogs real academy vacancies before the national allocator chooses any
 * exceptional top-up. Per-club generation consumes only the returned IDs and
 * therefore cannot roll a second ceiling-six outcome independently.
 */
function annualExceptionalCandidates(
  careerState: CareerState,
  intakeSeasonId: SeasonId,
  targetPositionsByClubId: Readonly<Record<ClubId, readonly PlayerPosition[]>>,
): readonly AnnualWorldIntakeExceptionalCandidate[] {
  return careerState.gameState.clubIds.flatMap((clubId) => {
    const club = careerState.gameState.clubs[clubId];
    if (club === undefined) {
      throw new Error(`Missing annual intake club: ${clubId}`);
    }
    const clubTier = requiredCompetitiveTier(careerState, clubId);
    return (targetPositionsByClubId[clubId] ?? []).map((_, index) => ({
      playerKey: String(seasonalYouthPlayerId(clubId, intakeSeasonId, index + 1)),
      clubKey: String(clubId),
      division: club.category,
      clubTier,
    }));
  });
}

/**
 * Counts the full active national `15..20` stored-ceiling-six population.
 *
 * Engine supplies the active universe after resolving senior ownership,
 * academy membership, canonical free agency, and reserved promotions. Content
 * consumes those facts without rebuilding a second population rule.
 */
function activeYoungExceptionalPlayers(
  careerState: CareerState,
  activePlayerStock: readonly AnnualWorldActivePlayerStockEntry[],
  ratingScale: PlayerRatingScaleConfig,
  referenceDate: GameDate,
): readonly AnnualWorldYoungExceptionalPlayer[] {
  const sixStarMinimum = minimumSixAbility(ratingScale);
  const active: AnnualWorldYoungExceptionalPlayer[] = [];

  for (const entry of activePlayerStock) {
    const id = entry.playerId;
    const player = careerState.gameState.players[id];
    if (player === undefined) {
      throw new Error(`Missing active annual-intake player: ${id}`);
    }
    const ageYears = completedCivilYears(player.birthDate, referenceDate);
    if (ageYears < 15 || ageYears > 20) continue;
    const naturalPosition = player.naturalPositions[0];
    if (naturalPosition === undefined) {
      throw new Error(`Active annual-intake player has no natural position: ${id}`);
    }
    const role = player.primaryRole ?? primaryRoleForPosition(naturalPosition);
    const storedCeiling = Number(
      rolePotentialAbility(
        player.potential,
        getPlayerRoleProfile(role),
      ),
    );
    if (storedCeiling < sixStarMinimum) continue;
    const clubIdValue = activeStockClubId(entry);
    const club = clubIdValue === undefined
      ? undefined
      : careerState.gameState.clubs[clubIdValue];
    if (clubIdValue !== undefined && club === undefined) {
      throw new Error(`Missing active annual-intake club: ${clubIdValue}`);
    }
    active.push({
      playerKey: String(id),
      ...(clubIdValue === undefined ? {} : { clubKey: String(clubIdValue) }),
      ...(club === undefined ? {} : { division: club.category }),
    });
  }

  return active;
}

/**
 * Resolves the allocation association without treating it as legal ownership.
 *
 * Keeping this mapping exhaustive forces Phase 80B loans to choose their own
 * explicit registration semantics instead of inheriting the promotion rule.
 */
function activeStockClubId(
  entry: AnnualWorldActivePlayerStockEntry,
): ClubId | undefined {
  switch (entry.source) {
    case "senior":
    case "academy":
    case "promotion_candidate":
      return entry.clubId;
    case "free_agent":
      return undefined;
    default:
      return unreachableActiveStockSource(entry);
  }
}

function unreachableActiveStockSource(entry: never): never {
  throw new Error(`Unsupported active-player stock source: ${String(entry)}`);
}

function requiredCompetitiveTier(
  careerState: CareerState,
  clubId: ClubId,
): ClubCompetitiveTier {
  const tier = careerState.clubCompetitiveTierState.tierByClubId[clubId];
  if (tier === undefined) {
    throw new Error(`Missing annual intake competitive tier: ${clubId}`);
  }
  return tier;
}

interface GenerateOneIntakePlayerInput extends GenerateCareerIntakePlayersInput {
  readonly leagueNation: LeagueNationCode;
  readonly index: number;
  readonly nameUsage: BatchNameUsage;
}

function generateOneIntakePlayer(input: GenerateOneIntakePlayerInput): CareerIntakeGeneratedPlayer {
  const id = intakePlayerId(input.clubId, input.seasonId, input.index + 1);
  const forcePotentialSix = input.potentialSixPlayerIds?.includes(id) === true;
  const youthDevelopmentLevel = deriveYouthDevelopmentLevel({
    division: input.clubContext.category,
    clubReputation: input.clubContext.reputation,
  });
  const developmentEnvironment = developmentEnvironmentForClubContext(
    input.clubContext,
  );
  const archetypeKey = forcePotentialSix
    ? "rare_prodigy"
    : selectIntakeArchetype(
        input.worldSeed,
        input.seasonId,
        id,
        developmentEnvironment,
      );
  const archetype = getGeneratedPlayerArchetype(archetypeKey);
  const position = positionForIntakeSlot(input.worldSeed, input.seasonId, id, input.index);
  const clubTier = input.clubContext.competitiveTier;
  const ageYears = numberInRange(archetype.ageYears, input.worldSeed, "career-intake-age", id);
  const birthDateJitter = deriveRng(input.worldSeed, "career-intake-birth-date", input.seasonId, id).nextInt(0, 365);
  const referenceDate = input.referenceDate ?? gameDate(CAREER_START_EPOCH_DAY);
  const identity = intakeIdentity(input, id);
  const primaryRole = primaryRoleForPosition(position);
  const scale = input.ratingScale ?? defaultPlayerRatingScale;
  const profile = buildContextualProspectJointProfile({
    seed: input.worldSeed,
    playerKey: String(id),
    division: input.clubContext.category,
    clubTier,
    role: primaryRole,
    ageYears,
    archetypeKey,
    ratingScale: scale,
    requestedCurrentAbilityLane: currentAbilityRarityLaneForYouthProspect(
      archetypeKey,
      Number(youthDevelopmentLevel),
    ),
    ceilingConstraint: annualIntakeCeilingConstraint(forcePotentialSix),
  });
  const assembled = assembleGeneratedPlayer({
    id,
    identity,
    referenceDate,
    ageYears,
    birthDateJitterDays: birthDateJitter,
    position,
    abilities: profile.current,
    potential: profile.potential,
  });

  return {
    player: assembled.player,
    playerState: assembled.dynamicState,
    identity,
    archetypeKey,
  };
}

/**
 * Carries the national annual-allocation result into the shared joint owner.
 *
 * Future countries should make the same semantic choice at their own world
 * composition root and must not recreate raw six-star ability thresholds.
 */
function annualIntakeCeilingConstraint(
  forcePotentialSix: boolean,
): ContextualProspectCeilingConstraint {
  return forcePotentialSix
    ? { kind: "at_least_rating", rating: 6 }
    : { kind: "policy" };
}

function minimumSixAbility(scale: PlayerRatingScaleConfig): number {
  const threshold = scale.abilityThresholds.find((candidate) => candidate.rating === 6);
  if (threshold === undefined) {
    throw new Error("Validated rating scale is missing rating 6");
  }
  return threshold.minimumAbilityInclusive;
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
  developmentEnvironment: ReturnType<typeof developmentEnvironmentForClubContext>,
): Exclude<GeneratedPlayerArchetypeKey, "rare_prodigy" | "category_star" | "veteran_drop_down" | "senior_regular" | "category_starter"> {
  const rng = deriveRng(worldSeed, "career-intake-archetype", seasonId, playerIdValue);
  const roll = rng.nextFloat();
  const seriousChance = youthDevelopmentSeriousProspectChance(
    developmentEnvironment,
  );

  if (roll < seriousChance) {
    return "serious_prospect";
  }

  if (
    roll
      < seriousChance + youthDevelopmentInterestingChance(developmentEnvironment)
  ) {
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
