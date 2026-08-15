import {
  createPersonIdentity,
  gameDate,
  getPlayerRoleProfile,
  playerSquadDepartment,
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
  type PlayerRole,
  type PlayerRatingScaleConfig,
  type RoleIdentifiedPlayer,
  type SeasonId,
} from "@game/domain";
import { completedCivilYears, deriveRng, fromISO } from "@game/shared";

import { getNameCulturePool } from "../identity/name-cultures.ts";
import { selectNationality, type LeagueNationCode } from "../identity/nationality-distribution.ts";
import { assembleGeneratedPlayer } from "./generated-player-factory.ts";
import { getGeneratedPlayerArchetype, type GeneratedPlayerArchetypeKey } from "./player-archetypes.ts";
import {
  contextualProspectClassForArchetype,
  currentAbilityRarityLaneForYouthProspect,
  type ContextualProspectClass,
} from "./player-potential-rarity.ts";
import {
  buildContextualProspectJointProfile,
  type ContextualProspectCeilingConstraint,
} from "./player-prospect-joint-profile.ts";
import { starRatingForRoleAbility } from "./player-potential-allocation.ts";
import { primaryRoleForPosition } from "./player-role-identity.ts";
import { playerRatingScale as defaultPlayerRatingScale } from "../balance/player-economy-calibration.ts";
import {
  generateSeasonalYouthIntakePlayers,
  seasonalYouthPlayerId,
  YOUTH_ACADEMY_DEPARTMENT_PLAN,
} from "./initial-youth-academies.ts";
import {
  planCompetitionAnnualIntakePositions,
  type AnnualIntakeRoleSlotKind,
} from "./annual-intake-role-plan.ts";
import { assignGeneratedSquadIdentityRoles } from "./squad-identity.ts";
import {
  buildAnnualWorldIntakeCeilingAllocation,
  type AnnualWorldIntakeCeilingAllocation,
  type AnnualWorldIntakeExceptionalCandidate,
  type AnnualWorldYoungCeilingPlayer,
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
  /** Positions assigned by the competition-scoped annual role planner. */
  readonly targetPositions: readonly PlayerPosition[];
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

  for (let index = 0; index < input.targetPositions.length; index += 1) {
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
  readonly allocation: AnnualWorldIntakeCeilingAllocation;
  /** Allocation-time active six-star stock; later careers cannot reconstruct it. */
  readonly activeSixPlayers: readonly AnnualWorldYoungCeilingPlayer[];
  /** Allocation-time vacancy candidates used by the unchanged six-star lane. */
  readonly exceptionalCandidates: readonly AnnualWorldIntakeExceptionalCandidate[];
  /** Allocation-time placements; later tier freezes cannot reconstruct them. */
  readonly allocatedCeilingPlacements: readonly {
    readonly candidate: AnnualWorldIntakeExceptionalCandidate;
    readonly minimumRating: 5 | 6;
  }[];
  /** Generation-time proof that each semantic assignment reached its player. */
  readonly generatedCeilingAssignments: readonly {
    readonly playerId: PlayerId;
    readonly minimumRating: 5 | 6;
  }[];
  /** Generation-time provenance that cannot be reconstructed from Player. */
  readonly generatedYouthProspectClasses: readonly {
    readonly playerId: PlayerId;
    readonly targetClubId: ClubId;
    readonly prospectClass: ContextualProspectClass;
  }[];
}

/** One generated candidate at the content boundary, before engine acceptance. */
export interface AnnualWorldGeneratedRoleCandidateFact {
  readonly targetClubId: ClubId;
  readonly position: PlayerPosition;
}

/** Planned/generated reconciliation for one annual candidate source. */
export interface AnnualWorldGeneratedRolePopulationFacts {
  readonly plannedCount: number;
  readonly candidates: readonly AnnualWorldGeneratedRoleCandidateFact[];
  readonly reconciliationFailureCount: number;
}

/** Whether canonical maintenance actually asked content for senior candidates. */
export type AnnualWorldSeniorRolePopulationDiagnostics =
  | {
      readonly status: "generated";
      readonly population: AnnualWorldGeneratedRolePopulationFacts;
    }
  | { readonly status: "not_requested" };

/** Exact generation-boundary role facts for one world-season. */
export interface AnnualWorldRoleContinuityDiagnostics {
  readonly academyRefill: AnnualWorldGeneratedRolePopulationFacts;
  readonly seniorCandidate: AnnualWorldSeniorRolePopulationDiagnostics;
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
  /** Reads actual generated positions without reconstructing accepted players. */
  readonly roleContinuityDiagnostics: () => AnnualWorldRoleContinuityDiagnostics;
}

/** Inputs that identify one deterministic world-season intake composition. */
export interface CreateAnnualWorldIntakeCandidateProvidersInput {
  readonly worldSeed: string;
  readonly seasonIndex: number;
  readonly seniorCandidatesPerClub?: number;
  readonly ratingScale?: PlayerRatingScaleConfig;
  /**
   * Analysis-only Phase 81A ablation seam. `false` restores the exact generic
   * role balancing used before Step 06B16; closeout owns removal.
   */
  readonly useSquadIdentityRoleBlueprint?: boolean;
  /** Analysis-only paired-control seam; Phase 81A closeout owns removal. */
  readonly useRoutineYouthStationaryRunway?: boolean;
  /** Rejected L6.43 candidate; only an explicit L6.43A analysis arm enables it. */
  readonly useSuccessorCeilingStockPolicy?: boolean;
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
  let youthPlannedPositions: Readonly<Record<ClubId, readonly PlayerPosition[]>> | undefined;
  let seniorPlannedPositions: Readonly<Record<ClubId, readonly PlayerPosition[]>> | undefined;
  let composedClubIds: readonly ClubId[] | undefined;

  const createYouthIntakeCandidates = (
    context: AnnualWorldYouthIntakeProviderContext,
  ): readonly AnnualWorldYouthIntakeCandidate[] => {
    if (youthCandidates !== undefined) {
      throw new Error(`Annual world intake already composed for ${context.seasonId}`);
    }
    const targetPositionsByClubId = academyRefillPositionsByClubId({
      careerState: context.careerState,
      seed: input.worldSeed,
      seasonId: context.seasonId,
      useSquadIdentityRoleBlueprint:
        input.useSquadIdentityRoleBlueprint !== false,
    });
    const candidates = annualExceptionalCandidates(
      context.careerState,
      context.seasonId,
      targetPositionsByClubId,
    );
    const activeYoungPlayers = activeYoungCeilingPlayers(
      context.careerState,
      context.activePlayerStock,
      ratingScale,
      context.intakeDate,
    );
    const allocation = buildAnnualWorldIntakeCeilingAllocation({
      seed: input.worldSeed,
      seasonIndex: input.seasonIndex,
      ratingScale,
      firstDivisionClubCount: context.careerState.gameState.clubIds.filter(
        (clubId) => context.careerState.gameState.clubs[clubId]?.category
          === "first_division",
      ).length,
      activeYoungCeilingPlayers: activeYoungPlayers,
      candidates,
      useSuccessorCeilingStockPolicy:
        input.useSuccessorCeilingStockPolicy === true,
    });
    const generated: AnnualWorldYouthIntakeCandidate[] = [];
    const generatedSourceByPlayerId = new Map<PlayerId, CareerIntakeGeneratedPlayer>();

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
        ceilingAssignments: allocation.assignments,
        useRoutineYouthStationaryRunway:
          input.useRoutineYouthStationaryRunway !== false,
        ratingScale,
      });
      for (const candidate of batch.generatedPlayers) {
        if (generatedSourceByPlayerId.has(candidate.player.id)) {
          throw new Error(`Duplicate annual intake prospect provenance ${candidate.player.id}`);
        }
        generatedSourceByPlayerId.set(candidate.player.id, candidate);
        generated.push({
          targetClubId: clubId,
          player: candidate.player,
          playerState: candidate.playerState,
        });
      }
    }

    youthCandidates = generated;
    youthPlannedPositions = targetPositionsByClubId;
    composedClubIds = [...context.careerState.gameState.clubIds];
    composedSeasonId = context.seasonId;
    diagnosticFacts = {
      seasonIndex: input.seasonIndex,
      allocationCallCount: 1,
      allocation,
      activeSixPlayers: activeYoungPlayers
        .filter(({ storedCeilingRating }) => storedCeilingRating >= 6)
        .toSorted((left, right) => left.playerKey.localeCompare(right.playerKey)),
      exceptionalCandidates: candidates,
      allocatedCeilingPlacements: allocation.assignments.map((assignment) => {
        const candidate = candidates.find(
          ({ playerKey }) => playerKey === assignment.playerKey,
        );
        if (candidate === undefined) {
          throw new Error(`Annual ceiling assignment lost vacancy ${assignment.playerKey}`);
        }
        return { candidate, minimumRating: assignment.minimumRating };
      }),
      generatedCeilingAssignments: allocation.assignments.map((assignment) => ({
        playerId: playerId(assignment.playerKey),
        minimumRating: assignment.minimumRating,
      })),
      generatedYouthProspectClasses: context.careerState.gameState.clubIds.flatMap(
        (clubId) => {
          const batch = generated.filter(({ targetClubId }) => targetClubId === clubId);
          return batch.map(({ player }) => {
            const source = generatedSourceByPlayerId.get(player.id);
            if (source === undefined) {
              throw new Error(`Annual intake prospect provenance lost ${player.id}`);
            }
            return {
              playerId: player.id,
              targetClubId: clubId,
              prospectClass: contextualProspectClassForArchetype(source.archetypeKey),
            };
          });
        },
      ),
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
    const targetPositionsByClubId = seniorIntakePositionsByClubId({
      careerState: context.careerState,
      seed: input.worldSeed,
      seasonId: context.seasonId,
      candidatesPerClub: seniorCandidatesPerClub,
      useSquadIdentityRoleBlueprint:
        input.useSquadIdentityRoleBlueprint !== false,
    });
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
        targetPositions: requiredClubPositions(targetPositionsByClubId, clubId),
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
    seniorPlannedPositions = targetPositionsByClubId;
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
    roleContinuityDiagnostics: () => ({
      academyRefill: generatedRolePopulationFacts(
        "academy refill",
        composedClubIds,
        youthPlannedPositions,
        youthCandidates,
      ),
      seniorCandidate: seniorCandidates === undefined
        ? { status: "not_requested" }
        : {
            status: "generated",
            population: generatedRolePopulationFacts(
              "senior candidate",
              composedClubIds,
              seniorPlannedPositions,
              seniorCandidates,
            ),
          },
    }),
  };
}

function generatedRolePopulationFacts(
  label: string,
  orderedClubIds: readonly ClubId[] | undefined,
  plannedPositions: Readonly<Record<ClubId, readonly PlayerPosition[]>> | undefined,
  candidates: readonly {
    readonly targetClubId: ClubId;
    readonly player: RoleIdentifiedPlayer;
  }[] | undefined,
): AnnualWorldGeneratedRolePopulationFacts {
  if (orderedClubIds === undefined || plannedPositions === undefined || candidates === undefined) {
    throw new Error(`Annual ${label} role diagnostics requested before generation`);
  }
  const rows = candidates.map((candidate) => {
    const position = candidate.player.naturalPositions[0];
    if (position === undefined) {
      throw new Error(`Annual ${label} candidate has no natural position: ${candidate.player.id}`);
    }
    return { targetClubId: candidate.targetClubId, position };
  });
  let reconciliationFailureCount = 0;
  const plannedCount = orderedClubIds.reduce(
    (sum, clubId) => {
      const planned = plannedPositions[clubId];
      if (planned === undefined) {
        reconciliationFailureCount += 1;
        return sum;
      }
      const actual = rows.filter((row) => row.targetClubId === clubId);
      if (
        actual.length !== planned.length
        || planned.some((position, index) => actual[index]?.position !== position)
      ) reconciliationFailureCount += 1;
      return sum + planned.length;
    },
    0,
  );
  return {
    plannedCount,
    candidates: rows,
    reconciliationFailureCount:
      reconciliationFailureCount + (plannedCount === rows.length ? 0 : 1),
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
      developmentEnvironment: developmentEnvironmentForClubContext({
        category: club.category,
        competitiveTier: clubTier,
      }),
    }));
  });
}

/**
 * Captures the full active national `15..20` population once for both stocks.
 *
 * Engine supplies the active universe after resolving senior ownership,
 * academy membership, canonical free agency, and reserved promotions. Content
 * consumes those facts without rebuilding a second population rule.
 */
function activeYoungCeilingPlayers(
  careerState: CareerState,
  activePlayerStock: readonly AnnualWorldActivePlayerStockEntry[],
  ratingScale: PlayerRatingScaleConfig,
  referenceDate: GameDate,
): readonly AnnualWorldYoungCeilingPlayer[] {
  const active: AnnualWorldYoungCeilingPlayer[] = [];

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
    const clubIdValue = activeStockClubId(entry);
    const club = clubIdValue === undefined
      ? undefined
      : careerState.gameState.clubs[clubIdValue];
    if (clubIdValue !== undefined && club === undefined) {
      throw new Error(`Missing active annual-intake club: ${clubIdValue}`);
    }
    active.push({
      playerKey: String(id),
      storedCeilingRating: starRatingForRoleAbility(storedCeiling, ratingScale),
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
  const position = input.targetPositions[input.index];
  if (position === undefined) {
    throw new Error(`Annual senior role plan omitted ${input.clubId}:${input.index}`);
  }
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

function academyRefillPositionsByClubId(input: {
  readonly careerState: CareerState;
  readonly seed: string;
  readonly seasonId: SeasonId;
  readonly useSquadIdentityRoleBlueprint: boolean;
}): Readonly<Record<ClubId, readonly PlayerPosition[]>> {
  return competitionRolePositions(input.careerState, (competitionKey, clubIds) => {
    const targetRolesByClubId = input.useSquadIdentityRoleBlueprint
      ? assignGeneratedSquadIdentityRoles({
          seed: input.seed,
          competitionIdentityKey: competitionKey,
          orderedClubIds: clubIds,
        })
      : new Map<ClubId, readonly PlayerRole[]>();
    return planCompetitionAnnualIntakePositions({
      seed: input.seed,
      seasonKey: String(input.seasonId),
      competitionKey: `${competitionKey}:academy-refill`,
      clubs: clubIds.map((clubId) => ({
        clubId,
        slotKinds: academyVacancyDepartments(input.careerState, clubId),
        currentRoles: academyRoles(input.careerState, clubId),
        targetRoles: targetRolesByClubId.get(clubId) ?? [],
      })),
    });
  });
}

function seniorIntakePositionsByClubId(input: {
  readonly careerState: CareerState;
  readonly seed: string;
  readonly seasonId: SeasonId;
  readonly candidatesPerClub: number;
  readonly useSquadIdentityRoleBlueprint: boolean;
}): Readonly<Record<ClubId, readonly PlayerPosition[]>> {
  if (!Number.isSafeInteger(input.candidatesPerClub) || input.candidatesPerClub <= 0) {
    throw new RangeError(`Invalid senior intake candidate count: ${input.candidatesPerClub}`);
  }
  return competitionRolePositions(input.careerState, (competitionKey, clubIds) => {
    const targetRolesByClubId = input.useSquadIdentityRoleBlueprint
      ? assignGeneratedSquadIdentityRoles({
          seed: input.seed,
          competitionIdentityKey: competitionKey,
          orderedClubIds: clubIds,
        })
      : new Map<ClubId, readonly PlayerRole[]>();
    return planCompetitionAnnualIntakePositions({
      seed: input.seed,
      seasonKey: String(input.seasonId),
      competitionKey: `${competitionKey}:senior-intake`,
      clubs: clubIds.map((clubId) => ({
        clubId,
        slotKinds: Array.from(
          { length: input.candidatesPerClub },
          (_, index): AnnualIntakeRoleSlotKind => index === 0 ? "goalkeeper" : "outfield",
        ),
        currentRoles: seniorRoles(input.careerState, clubId),
        targetRoles: targetRolesByClubId.get(clubId) ?? [],
      })),
    });
  });
}

function competitionRolePositions(
  careerState: CareerState,
  plan: (
    competitionKey: string,
    clubIds: readonly ClubId[],
  ) => ReadonlyMap<ClubId, readonly PlayerPosition[]>,
): Readonly<Record<ClubId, readonly PlayerPosition[]>> {
  const world = careerState.gameState.domesticCompetitionWorld;
  if (world === undefined) {
    throw new Error("Annual intake role planning requires the domestic competition world");
  }
  const positions: Partial<Record<ClubId, readonly PlayerPosition[]>> = {};
  for (const competitionId of world.competitionIds) {
    const competition = world.competitions[competitionId];
    if (competition === undefined) {
      throw new Error(`Annual intake role planning omitted competition ${competitionId}`);
    }
    for (const [clubId, clubPositions] of plan(String(competitionId), competition.clubIds)) {
      positions[clubId] = clubPositions;
    }
  }
  for (const clubId of careerState.gameState.clubIds) {
    if (positions[clubId] === undefined) {
      throw new Error(`Annual intake role planning omitted club ${clubId}`);
    }
  }
  return positions as Readonly<Record<ClubId, readonly PlayerPosition[]>>;
}

function academyVacancyDepartments(
  careerState: CareerState,
  clubId: ClubId,
): readonly AnnualIntakeRoleSlotKind[] {
  const missing: AnnualIntakeRoleSlotKind[] = [...YOUTH_ACADEMY_DEPARTMENT_PLAN];
  const roster = careerState.youthAcademyState?.clubRosters[clubId];
  for (const playerIdValue of roster?.playerIds ?? []) {
    const player = careerState.gameState.players[playerIdValue];
    if (player === undefined) {
      throw new Error(`Academy refill role planning omitted player ${playerIdValue}`);
    }
    const index = missing.indexOf(playerSquadDepartment(player));
    if (index >= 0) missing.splice(index, 1);
  }
  return missing;
}

function academyRoles(careerState: CareerState, clubId: ClubId): readonly ReturnType<typeof primaryRoleForPosition>[] {
  return (careerState.youthAcademyState?.clubRosters[clubId]?.playerIds ?? []).map(
    (playerIdValue) => requiredPlayerRole(careerState, playerIdValue),
  );
}

function seniorRoles(careerState: CareerState, clubId: ClubId): readonly ReturnType<typeof primaryRoleForPosition>[] {
  const club = careerState.gameState.clubs[clubId];
  if (club === undefined) throw new Error(`Senior intake role planning omitted club ${clubId}`);
  return club.playerIds.map((playerIdValue) => requiredPlayerRole(careerState, playerIdValue));
}

function requiredPlayerRole(
  careerState: CareerState,
  playerIdValue: PlayerId,
): ReturnType<typeof primaryRoleForPosition> {
  const player = careerState.gameState.players[playerIdValue];
  if (player === undefined) throw new Error(`Annual intake role planning omitted player ${playerIdValue}`);
  if (player.primaryRole !== undefined) return player.primaryRole;
  const position = player.naturalPositions[0];
  if (position === undefined) throw new Error(`Annual intake role planning found no position: ${playerIdValue}`);
  return primaryRoleForPosition(position);
}

function requiredClubPositions(
  positionsByClubId: Readonly<Record<ClubId, readonly PlayerPosition[]>>,
  clubId: ClubId,
): readonly PlayerPosition[] {
  const positions = positionsByClubId[clubId];
  if (positions === undefined) throw new Error(`Annual intake role planning omitted club ${clubId}`);
  return positions;
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
