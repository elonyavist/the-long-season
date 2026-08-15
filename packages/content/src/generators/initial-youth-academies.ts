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
  type PlayerRole,
  type PlayerRatingScaleConfig,
  type RoleIdentifiedPlayer,
  type SeasonId,
  type PlayerSquadDepartment,
  type YouthDevelopmentLevel,
  type YouthAcademyClubRoster,
  type YouthAcademyState,
  type YouthPlayerLifecycle,
} from "@game/domain";
import { deriveRng } from "@game/shared";

import { getNameCulturePool } from "../identity/name-cultures.ts";
import { selectNationality, type LeagueNationCode } from "../identity/nationality-distribution.ts";
import { assembleGeneratedPlayer } from "./generated-player-factory.ts";
import type { GeneratedPlayerArchetypeKey } from "./player-archetypes.ts";
import type {
  OpeningPlayerGenerationClubContext,
  PlayerGenerationClubTier,
} from "./player-generation-bands.ts";
import {
  buildYouthPlayerRarityAllocation,
  playerRaritySlotKey,
} from "./player-rarity-budget.ts";
import { currentAbilityRarityLaneForYouthProspect } from "./player-potential-rarity.ts";
import { primaryRoleForPosition } from "./player-role-identity.ts";
import {
  buildContextualProspectJointProfile,
  type ContextualProspectCeilingConstraint,
  type ContextualProspectJointProfile,
} from "./player-prospect-joint-profile.ts";
import {
  developmentEnvironmentForClubContext,
  deriveYouthDevelopmentLevel,
  youthDevelopmentCurrentBoost,
  youthDevelopmentInterestingChance,
  youthDevelopmentSeriousProspectChance,
} from "./youth-development-level.ts";
import { playerRatingScale as defaultPlayerRatingScale } from "../balance/player-economy-calibration.ts";
import {
  planCompetitionAnnualIntakePositions,
  type AnnualIntakeRoleSlotKind,
} from "./annual-intake-role-plan.ts";
import { assignGeneratedSquadIdentityRoles } from "./squad-identity.ts";
import { routineYouthStationaryRunwayTarget } from "./routine-youth-stationary-runway.ts";
import type { AnnualWorldIntakeCeilingAssignment } from "./player-rarity-budget.ts";

/** Exact academy size chosen by Phase 33. */
export const INITIAL_YOUTH_PLAYERS_PER_CLUB = 11;

/** Exact academy refill target chosen by Phase 33. */
export const YOUTH_ACADEMY_REFILL_TARGET_PLAYERS_PER_CLUB = 11;

/** Department shape of one academy; exact roles come from the competition deck. */
export const YOUTH_ACADEMY_DEPARTMENT_PLAN = [
  "goalkeeper",
  "defender", "defender", "defender", "defender",
  "midfielder", "midfielder", "midfielder", "midfielder",
  "attacker", "attacker",
] as const satisfies readonly PlayerSquadDepartment[];

/** Club facts consumed by seasonal youth-intake generation. */
export interface SeasonalYouthIntakeClubContext {
  /** Broad division/category where the receiving club currently plays. */
  readonly category: ClubCategory;
  /** Current club reputation used by the existing intake policy. */
  readonly reputation: number;
  /** Competitive level frozen for the season that owns this intake. */
  readonly competitiveTier: PlayerGenerationClubTier;
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
  readonly clubContexts: Readonly<Record<ClubId, OpeningPlayerGenerationClubContext>>;
  /** Competition scope for each club; role balancing never infers it from tier. */
  readonly competitionKeyByClubId: Readonly<Record<ClubId, string>>;
  /**
   * Analysis-only Phase 81A ablation seam; ordinary generation keeps the
   * identity blueprint enabled. Phase 81A closeout owns its removal.
   */
  readonly useSquadIdentityRoleBlueprint?: boolean;
  /**
   * Analysis seam for the Phase 81A routine-youth runway. Ordinary worlds use
   * the candidate; the paired checkpoint explicitly disables the control arm.
   */
  readonly useRoutineYouthStationaryRunway?: boolean;
  /** Optional count override for focused tests; production uses Phase 32 target. */
  readonly youthPlayersPerClub?: number;
  /** Optional league nation, defaulting to the current Italian demo world. */
  readonly leagueNation?: LeagueNationCode;
  /** Optional complete-world potential-six assignments for academy players. */
  readonly potentialSixPlayerIds?: readonly PlayerId[];
  /** Natural six-star academy ceilings that the national budget caps below six. */
  readonly reconstructedPotentialBelowSixPlayerIds?: readonly PlayerId[];
  /** Validated scale used only for assigned potential-six floors. */
  readonly ratingScale?: PlayerRatingScaleConfig;
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
  readonly clubContext: SeasonalYouthIntakeClubContext;
  /** Optional league nation, defaulting to the current Italian demo world. */
  readonly leagueNation?: LeagueNationCode;
  /** Exact positions assigned by the competition-scoped refill planner. */
  readonly targetPositions: readonly PlayerPosition[];
  /** Analysis-only paired-control seam; Phase 81A closeout owns removal. */
  readonly useRoutineYouthStationaryRunway?: boolean;
  /** Total world-level ceiling assignments selected before club generation. */
  readonly ceilingAssignments?: readonly AnnualWorldIntakeCeilingAssignment[];
  /** Validated scale used only for assigned potential-six floors. */
  readonly ratingScale?: PlayerRatingScaleConfig;
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
  const positionsByClubId = initialAcademyPositionsByClubId(input, youthPlayersPerClub);

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
    const developmentEnvironment = developmentEnvironmentForClubContext(clubContext);
    clubYouthDevelopmentLevels[clubId] = youthDevelopmentLevel;

    for (let index = 0; index < youthPlayersPerClub; index += 1) {
      const id = initialYouthPlayerId(clubId, index + 1);
      const forcePotentialSix = input.potentialSixPlayerIds?.includes(id) === true;
      const reconstructPotentialBelowSix = input.reconstructedPotentialBelowSixPlayerIds?.includes(id) === true;
      if (forcePotentialSix && reconstructPotentialBelowSix) {
        throw new Error(`Academy player cannot be both six-star and reconstructed below six: ${id}`);
      }
      const archetypeKey = forcePotentialSix
        ? "rare_prodigy"
        : reconstructPotentialBelowSix
          ? "normal_youth"
          : rarityAssignments[id] ?? selectRoutineInitialYouthArchetype({
        worldSeed: input.worldSeed,
        seasonId: input.seasonId,
        clubId,
        playerId: id,
        developmentEnvironment,
      });
      const position = positionsByClubId.get(clubId)?.[index];
      if (position === undefined) {
        throw new Error(`Initial academy role plan omitted ${clubId}:${index}`);
      }
      const identity = initialYouthIdentity({
        worldSeed: input.worldSeed,
        seasonId: input.seasonId,
        clubId,
        playerId: id,
        leagueNation,
        clubContext,
        clubNameUsage,
      });
      const generatedPlayer = buildYouthPlayerFromJointProfile({
        id,
        identity,
        worldSeed: input.worldSeed,
        seasonId: input.seasonId,
        referenceDate: input.referenceDate,
        position,
        archetypeKey,
        youthDevelopmentLevel,
        ageYears: initialYouthAge(input.worldSeed, input.seasonId, id),
        division: clubContext.category,
        clubTier: clubContext.competitiveTier,
        ratingScale: input.ratingScale ?? defaultPlayerRatingScale,
      ceilingConstraint: youthCeilingConstraint({
        forcePotentialSix,
        reconstructPotentialBelowSix,
      }),
      useRoutineYouthStationaryRunway:
        input.useRoutineYouthStationaryRunway !== false,
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
  const targetPositions = input.targetPositions;
  const leagueNation = input.leagueNation ?? "italian";
  const youthDevelopmentLevel = deriveYouthDevelopmentLevel({
    division: input.clubContext.category,
    clubReputation: input.clubContext.reputation,
  });
  const developmentEnvironment = developmentEnvironmentForClubContext(input.clubContext);
  const ceilingRatingByPlayerKey = new Map(
    (input.ceilingAssignments ?? []).map((assignment) => [
      assignment.playerKey,
      assignment.minimumRating,
    ]),
  );

  for (let index = 0; index < targetPositions.length; index += 1) {
    const id = seasonalYouthPlayerId(input.clubId, input.seasonId, index + 1);
    const assignedMinimumRating = ceilingRatingByPlayerKey.get(String(id));
    const archetypeKey = assignedMinimumRating === 6
      ? "rare_prodigy"
      : assignedMinimumRating === 5
        ? "serious_prospect"
      : selectSeasonalYouthArchetype(
          input.worldSeed,
          input.seasonId,
          input.clubId,
          id,
          developmentEnvironment,
        );
    const position = targetPositions[index];
    if (position === undefined) {
      throw new Error(`Seasonal academy role plan omitted ${input.clubId}:${index}`);
    }
    const identity = initialYouthIdentity({
      worldSeed: input.worldSeed,
      seasonId: input.seasonId,
      clubId: input.clubId,
      playerId: id,
      leagueNation,
      clubContext: input.clubContext,
      clubNameUsage,
    });
    const generatedPlayer = buildYouthPlayerFromJointProfile({
      id,
      identity,
      worldSeed: input.worldSeed,
      seasonId: input.seasonId,
      referenceDate: input.referenceDate,
      position,
      archetypeKey,
      youthDevelopmentLevel,
      ageYears: seasonalYouthAge(input.worldSeed, input.seasonId, id),
      division: input.clubContext.category,
      clubTier: input.clubContext.competitiveTier,
      ratingScale: input.ratingScale ?? defaultPlayerRatingScale,
      ceilingConstraint: youthCeilingConstraint({
        forcePotentialSix: false,
        ...(assignedMinimumRating === undefined
          ? {}
          : { assignedMinimumRating }),
      }),
      useRoutineYouthStationaryRunway:
        input.useRoutineYouthStationaryRunway !== false,
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

interface YouthPlayerGenerationFacts {
  readonly id: PlayerId;
  readonly identity: PersonIdentity;
  readonly worldSeed: string;
  readonly seasonId: SeasonId;
  readonly referenceDate: GameDate;
  readonly position: PlayerPosition;
  readonly archetypeKey: GeneratedPlayerArchetypeKey;
  readonly youthDevelopmentLevel: YouthDevelopmentLevel;
  readonly ageYears: number;
  readonly division: ClubCategory;
  readonly clubTier: PlayerGenerationClubTier;
  /** Versioned rating scale that interprets contextual prospect bands. */
  readonly ratingScale: PlayerRatingScaleConfig;
  /** Absolute-ceiling constraint allocated before this root builds the profile. */
  readonly ceilingConstraint: ContextualProspectCeilingConstraint;
  readonly useRoutineYouthStationaryRunway: boolean;
}

/**
 * Converts one national academy allocation into an absolute-ceiling contract.
 *
 * Future country compositions should reuse these semantic outcomes at their
 * own root rather than exposing raw ability thresholds to player generation.
 */
function youthCeilingConstraint(input: {
  readonly forcePotentialSix: boolean;
  readonly assignedMinimumRating?: 5 | 6;
  readonly reconstructPotentialBelowSix?: boolean;
}): ContextualProspectCeilingConstraint {
  if (input.assignedMinimumRating !== undefined) {
    return { kind: "at_least_rating", rating: input.assignedMinimumRating };
  }
  if (input.forcePotentialSix) {
    return { kind: "at_least_rating", rating: 6 };
  }
  if (input.reconstructPotentialBelowSix === true) {
    return { kind: "below_rating", rating: 6 };
  }
  return { kind: "policy" };
}

/**
 * Builds one opening or seasonal academy player through the shared joint owner.
 *
 * The two roots choose IDs, archetypes, ages, and ceiling constraints before
 * this seam. Current ability and stored potential are deliberately composed
 * only here so their policy cannot drift between opening and annual intake.
 */
function buildYouthPlayerFromJointProfile(
  input: YouthPlayerGenerationFacts,
): CreatedPlayer {
  const primaryRole = primaryRoleForPosition(input.position);
  const runwayTarget = input.useRoutineYouthStationaryRunway
    && input.archetypeKey === "normal_youth"
    && input.ceilingConstraint.kind === "policy"
    ? routineYouthStationaryRunwayTarget({
        worldSeed: input.worldSeed,
        playerKey: String(input.id),
        division: input.division,
        role: primaryRole,
      })
    : undefined;
  const profile = buildContextualProspectJointProfile({
    seed: input.worldSeed,
    playerKey: String(input.id),
    division: input.division,
    clubTier: input.clubTier,
    role: primaryRole,
    ageYears: input.ageYears,
    archetypeKey: input.archetypeKey,
    ratingScale: input.ratingScale,
    requestedCurrentAbilityLane: currentAbilityRarityLaneForYouthProspect(
      input.archetypeKey,
      Number(input.youthDevelopmentLevel),
    ),
    ceilingConstraint: input.ceilingConstraint,
    slotDepthAdjustment: youthDevelopmentCurrentBoost(input.youthDevelopmentLevel),
    ...(runwayTarget === undefined
      ? {}
      : { routineYouthMinimumRolePotentialAbility: runwayTarget }),
  });

  return assembleYouthPlayer(input, profile);
}

function assembleYouthPlayer(
  input: YouthPlayerGenerationFacts,
  profile: Pick<ContextualProspectJointProfile, "current" | "potential">,
): CreatedPlayer {
  const birthDateJitter = deriveRng(
    input.worldSeed,
    "initial-youth-birth-date",
    input.seasonId,
    input.id,
  ).nextInt(0, 365);

  return assembleGeneratedPlayer({
    id: input.id,
    identity: input.identity,
    referenceDate: input.referenceDate,
    ageYears: input.ageYears,
    birthDateJitterDays: birthDateJitter,
    position: input.position,
    abilities: profile.current,
    potential: profile.potential,
  });
}

function initialYouthIdentity(input: {
  readonly worldSeed: string;
  readonly seasonId: SeasonId;
  readonly clubId: ClubId;
  readonly playerId: PlayerId;
  readonly leagueNation: LeagueNationCode;
  readonly clubContext: SeasonalYouthIntakeClubContext;
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
  readonly developmentEnvironment: ReturnType<typeof developmentEnvironmentForClubContext>;
}): GeneratedPlayerArchetypeKey {
  const rng = deriveRng(input.worldSeed, "initial-youth-archetype", input.seasonId, input.clubId, input.playerId);
  const roll = rng.nextFloat();

  if (roll < youthDevelopmentInterestingChance(input.developmentEnvironment)) {
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
      clubEnvironmentKeysByClubNumber: developmentEnvironmentKeysByClubNumber(
        input.clubContexts,
        clubIds,
      ),
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
  developmentEnvironment: ReturnType<typeof developmentEnvironmentForClubContext>,
): GeneratedPlayerArchetypeKey {
  const rng = deriveRng(worldSeed, "seasonal-youth-archetype", seasonId, clubId, playerId);
  const roll = rng.nextFloat();

  const seriousChance = youthDevelopmentSeriousProspectChance(
    developmentEnvironment,
  );
  if (roll < seriousChance) {
    return "serious_prospect";
  }

  if (roll < seriousChance + youthDevelopmentInterestingChance(developmentEnvironment)) {
    return "good_prospect";
  }

  return "normal_youth";
}

function developmentEnvironmentKeysByClubNumber(
  clubContexts: Readonly<Record<ClubId, OpeningPlayerGenerationClubContext>>,
  clubIds: readonly ClubId[],
): Readonly<Record<number, ReturnType<typeof developmentEnvironmentForClubContext>>> {
  const environments: Partial<
    Record<number, ReturnType<typeof developmentEnvironmentForClubContext>>
  > = {};

  for (let index = 0; index < clubIds.length; index += 1) {
    const clubIdValue = clubIds[index];
    if (clubIdValue === undefined) {
      continue;
    }

    const context = clubContexts[clubIdValue];
    if (context === undefined) {
      throw new Error(`Missing initial youth academy club context: ${clubIdValue}`);
    }

    environments[index + 1] = developmentEnvironmentForClubContext(context);
  }

  return environments as Readonly<
    Record<number, ReturnType<typeof developmentEnvironmentForClubContext>>
  >;
}

function initialAcademyPositionsByClubId(
  input: GenerateInitialYouthAcademiesInput,
  youthPlayersPerClub: number,
): ReadonlyMap<ClubId, readonly PlayerPosition[]> {
  const competitionOrder: string[] = [];
  const clubIdsByCompetition = new Map<string, ClubId[]>();
  for (const clubId of input.clubIds) {
    const competitionKey = input.competitionKeyByClubId[clubId];
    if (competitionKey === undefined || competitionKey.length === 0) {
      throw new Error(`Missing initial academy competition key: ${clubId}`);
    }
    if (!clubIdsByCompetition.has(competitionKey)) competitionOrder.push(competitionKey);
    const clubs = clubIdsByCompetition.get(competitionKey) ?? [];
    clubs.push(clubId);
    clubIdsByCompetition.set(competitionKey, clubs);
  }

  const positions = new Map<ClubId, readonly PlayerPosition[]>();
  for (const competitionKey of competitionOrder) {
    const clubIds = clubIdsByCompetition.get(competitionKey);
    if (clubIds === undefined) {
      throw new Error(`Initial academy competition has no clubs: ${competitionKey}`);
    }
    const targetRolesByClubId = input.useSquadIdentityRoleBlueprint === false
      ? new Map<ClubId, readonly PlayerRole[]>()
      : assignGeneratedSquadIdentityRoles({
          seed: input.worldSeed,
          competitionIdentityKey: competitionKey,
          orderedClubIds: clubIds,
        });
    const planned = planCompetitionAnnualIntakePositions({
      seed: input.worldSeed,
      seasonKey: String(input.seasonId),
      competitionKey,
      clubs: clubIds.map((clubId) => ({
        clubId,
        slotKinds: Array.from(
          { length: youthPlayersPerClub },
          (_, index) => academyDepartmentForSlot(index),
        ),
        currentRoles: [],
        targetRoles: targetRolesByClubId.get(clubId) ?? [],
      })),
    });
    for (const [clubId, clubPositions] of planned) positions.set(clubId, clubPositions);
  }
  return positions;
}

function academyDepartmentForSlot(index: number): AnnualIntakeRoleSlotKind {
  const department = YOUTH_ACADEMY_DEPARTMENT_PLAN[
    index % YOUTH_ACADEMY_DEPARTMENT_PLAN.length
  ];
  if (department === undefined) {
    throw new Error(`Academy department plan omitted slot ${index}`);
  }
  return department;
}

/** Builds the stable initial-academy player ID for one club and slot. */
export function initialYouthPlayerId(clubId: ClubId, sequence: number): PlayerId {
  const clubKey = String(clubId).replace("club:", "").replaceAll(":", "-");
  return playerId(`player:youth-${clubKey}-${String(sequence).padStart(2, "0")}`);
}

/** Returns the stable ID for one annual academy-intake candidate. */
export function seasonalYouthPlayerId(
  clubId: ClubId,
  seasonId: SeasonId,
  sequence: number,
): PlayerId {
  const clubKey = String(clubId).replace("club:", "").replaceAll(":", "-");
  const seasonKey = String(seasonId).replace("season:", "").replaceAll(":", "-");
  return playerId(`player:youth-intake-${clubKey}-${seasonKey}-${String(sequence).padStart(2, "0")}`);
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
