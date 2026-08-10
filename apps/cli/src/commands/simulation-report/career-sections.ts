import { isMainThread, parentPort, Worker, workerData } from "node:worker_threads";
import { createHash } from "node:crypto";

import {
  assignGeneratedSquadIdentities,
  createFakeDomesticWorld,
  GENERATED_SQUAD_IDENTITY_KEYS,
  selectPlayerStateCurvesConfig,
  squadIdentityPositionForSlot,
  type FakeDomesticWorld,
  type GeneratedSquadIdentityKey,
} from "@game/content";
import { createTranslator } from "@game/i18n";
import {
  MATCH_INJURY_RISK_POLICY,
  assessCareerSquadStructure,
  completedPlayerAge,
  fieldablePlayerIdsFor,
  recoverFitnessForPlayers,
  recoveryHalfLifeDays,
  summarizePlayerDevelopmentAbilities,
  spendFitnessForMinutes,
  type AiInGameDecisionReasonKey,
  type AiInGameReplacementFailureKey,
  type AiMarketDiagnosticFact,
  type FormationKey,
  type SimulateSeasonResult,
} from "@game/engine";
import { toISO } from "@game/shared";
import {
  summarizeTacticalAgencyPrimaryRoles,
  toSimulationReportJsonValue,
  type SimulationReportDetail,
  type SimulationReportJsonValue,
} from "@game/simulation-tools";

import type { CliCareerState, CliPlayer } from "../career/types.ts";
import {
  createCareerWorldFacts,
  type CareerWorldInspection,
  type CareerWorldFacts,
} from "./career-world-facts.ts";
import {
  readCareerSectionWorldCheckpoint,
  writeCareerSectionWorldCheckpoint,
  type CareerSectionWorldCheckpointIdentity,
} from "./long-run-profile-checkpoints.ts";
import {
  GenerationalSuccessionObserver,
  evaluateAnnualRoleContinuityCheckpoint,
  evaluateCareerExitRenewalCheckpoint,
  evaluateDevelopmentRenewalCheckpoint,
  evaluateGeneratedCeilingAttributionCheckpoint,
  evaluateGenerationalSuccessionCheckpoint,
  evaluateYouthMinutePathwayCheckpoint,
  type GenerationalRenewalArchitectureFacts,
  type GenerationalSuccessionWorldFacts,
  type SupersededGateFact,
} from "./generational-succession.ts";
import {
  OwnerAttributionObserver,
  evaluateOwnerAttributionCheckpoint,
  evaluatePlayerRenewalLeadersCheckpoint,
  type OwnerAttributionWorldFacts,
} from "./owner-attribution.ts";
import {
  evaluateRenewalNeedFunnel,
  evaluateRenewalArchitectureCheckpoint,
  renewalNeedEpisodesForSeason,
  type RenewalAblationArmFacts,
  type RenewalAblationMetric,
  type RenewalAblationMetricRow,
  type RenewalNeedEpisodeFact,
  type RenewalPopulationSeasonSignature,
} from "./renewal-architecture-attribution.ts";
import {
  HISTORICAL_DIVISION_TABLE_TARGETS,
  INTEGRATED_LEADER_AGE_DRIFT_TARGET,
} from "./historical-simulation-targets.ts";

/** Career modules sharing one world execution. */
export const CAREER_SECTION_IDS = [
  "season",
  "standings",
  "players",
  "transfers",
  "formations",
  "economy",
  "development",
  "anomalies",
] as const;
export type CareerSectionId = typeof CAREER_SECTION_IDS[number];

/** Every locked checkpoint that can evaluate one canonical career population. */
export type CareerCheckpointKind =
  | "league_diversity_l1"
  | "substitution_minutes_l2"
  | "availability_aging_l3"
  | "generational_succession_l4"
  | "youth_minute_pathway_l4_1"
  | "career_exit_renewal_l4_2"
  | "generated_ceiling_l4_3"
  | "development_renewal_l4_4"
  | "annual_role_continuity_l4_5"
  | "integrated_player_world_l5"
  | "integrated_player_world_l5_4"
  | "owner_attribution_l5_1"
  | "standings_hierarchy_l5_2"
  | "player_renewal_leaders_l5_3"
  | "renewal_architecture_l5_3c"
  | "renewal_ablation_l6_1";

export const RENEWAL_ABLATION_ARMS = ["control", "market", "blueprint", "combined"] as const;
export type RenewalAblationArm = typeof RENEWAL_ABLATION_ARMS[number];

const CHECKPOINT_OBSERVES_GENERATIONAL_SUCCESSION = {
  league_diversity_l1: false,
  substitution_minutes_l2: false,
  availability_aging_l3: false,
  generational_succession_l4: true,
  youth_minute_pathway_l4_1: true,
  career_exit_renewal_l4_2: true,
  generated_ceiling_l4_3: true,
  development_renewal_l4_4: true,
  annual_role_continuity_l4_5: true,
  integrated_player_world_l5: true,
  integrated_player_world_l5_4: true,
  owner_attribution_l5_1: true,
  standings_hierarchy_l5_2: false,
  player_renewal_leaders_l5_3: true,
  renewal_architecture_l5_3c: true,
  renewal_ablation_l6_1: true,
} as const satisfies Readonly<Record<CareerCheckpointKind, boolean>>;

/** Keeps observer and checkpoint-section routing on one exhaustive policy. */
function observesGenerationalSuccession(kind: CareerCheckpointKind | undefined): boolean {
  return kind !== undefined && CHECKPOINT_OBSERVES_GENERATIONAL_SUCCESSION[kind];
}

function checkpointSectionId(kind: CareerCheckpointKind): "formations" | "development" | "standings" {
  if (kind === "standings_hierarchy_l5_2") return "standings";
  return observesGenerationalSuccession(kind) ? "development" : "formations";
}

export interface CareerSectionsExecutionFacts {
  readonly sections: Readonly<Partial<Record<CareerSectionId, SimulationReportJsonValue>>>;
  readonly calibrationVersions: Readonly<Record<string, string>>;
  readonly worldSeeds: readonly string[];
  readonly decision: "PASS" | "FAIL";
}

interface CareerWorldProjection {
  readonly seed: string;
  readonly sections: Readonly<Partial<Record<CareerSectionId, unknown>>>;
  readonly calibrationVersions: Readonly<Record<string, string>>;
  readonly leagueDiversity?: LeagueDiversityWorldFacts;
  readonly substitutionMinutes?: SubstitutionMinuteWorldFacts;
  readonly availabilityAging?: AvailabilityAgingWorldFacts;
  readonly ownerAttribution?: OwnerAttributionWorldFacts;
  readonly renewalArchitecture?: GenerationalRenewalArchitectureFacts;
  readonly standingsHierarchy?: StandingsHierarchyWorldFacts;
  readonly marketTargeting?: RoleAwareMarketWorldFacts;
  readonly renewalNeedEpisodes?: readonly RenewalNeedEpisodeFact[];
  readonly renewalPopulationSignatures?: readonly RenewalPopulationSeasonSignature[];
}

interface RenewalPopulationSnapshot {
  readonly seasonNumber: number;
  readonly rows: readonly {
    readonly playerId: string;
    readonly clubId: string;
    readonly role: NonNullable<CliPlayer["primaryRole"]>;
    readonly currentAbility: number;
    readonly potentialAbility: number;
  }[];
}

interface RoleAwareMarketWorldFacts {
  readonly worldSeed: string;
  readonly departmentNeedEvaluatedCount: number;
  readonly roleNeedEvaluatedCount: number;
  readonly roleNeedRecruitableCount: number;
  readonly roleTargetFoundCount: number;
  readonly roleTargetMismatchCount: number;
  readonly targetPlayerMissingCount: number;
}

interface MutableRoleAwareMarketWorldFacts {
  worldSeed: string;
  departmentNeedEvaluatedCount: number;
  roleNeedEvaluatedCount: number;
  roleNeedRecruitableCount: number;
  roleTargetFoundCount: number;
  roleTargetMismatchCount: number;
  targetPlayerMissingCount: number;
}

export interface StandingsHierarchySeasonFact {
  readonly worldSeed: string;
  readonly divisionLevel: 1 | 2 | 3;
  readonly competitionId: string;
  readonly seasonNumber: number;
  readonly championPoints: number;
  readonly lastClubPoints: number;
  readonly pointsSpread: number;
  readonly ppgStandardDeviation: number;
  readonly goalsPerMatch: number;
  readonly drawShare: number;
  readonly reconciliationFailureCount: number;
}

export interface StandingsHierarchyWorldFacts {
  readonly worldSeed: string;
  readonly seasons: readonly StandingsHierarchySeasonFact[];
}

export interface StandingsHierarchyDivisionEvaluation {
  readonly divisionLevel: 1 | 2 | 3;
  readonly competitionSeasonCount: number;
  readonly championPoints: number;
  readonly lastClubPoints: number;
  readonly pointsSpread: number;
  readonly ppgStandardDeviation: number;
  readonly goalsPerMatch: number;
  readonly drawShare: number;
  readonly failed: readonly string[];
}

export interface StandingsHierarchyCheckpointDecision {
  readonly decision: "GO" | "REFINE" | "STOP_RETHINK";
  readonly divisions: readonly StandingsHierarchyDivisionEvaluation[];
  readonly competitionSeasonCount: number;
  readonly reconciliationFailureCount: number;
  readonly fallbackSelectionCount: number;
  readonly unavailableSelectedPlayerCount: number;
}

interface ObservedSeason {
  readonly seasonNumber: number;
  readonly seasonSeed: string;
  readonly standings?: unknown;
  readonly players?: unknown;
  readonly formations?: unknown;
}

interface ObservedTransfer {
  readonly seasonNumber: number;
  readonly entry: CliCareerState["transferHistory"][number];
  readonly buyingClubName: string;
  readonly buyingCompetitionId: string;
  readonly buyingCompetitionName: string;
  readonly sellingClubName?: string;
  readonly sellingCompetitionId?: string;
  readonly sellingCompetitionName?: string;
}

interface ObservedCompetitionSeason {
  readonly seasonNumber: number;
  readonly competitionId: string;
  readonly competitionName: string;
  readonly seasonSeed: string;
  readonly season?: unknown;
  readonly standings?: unknown;
  readonly players?: unknown;
  readonly formations?: LeagueFormationSeasonProjection;
  readonly substitutionMinutes?: SubstitutionMinuteSeasonProjection;
  readonly availabilityAging?: AvailabilityAgingSeasonProjection;
}

interface ObservedDomesticSeason {
  readonly seasonNumber: number;
  readonly competitions: readonly ObservedCompetitionSeason[];
}

export interface LeagueDiversityOpeningCompetitionFact {
  readonly worldSeed: string;
  readonly competitionId: string;
  readonly clubCount: number;
  readonly identityCounts: Readonly<Record<string, number>>;
  readonly identityMismatchCount: number;
  readonly primaryRolePositiveCount: number;
  readonly distinctFormationCount: number;
  readonly replicatedFormationCount: number;
  readonly topFormationShare: number;
  readonly distinctIdentityModalFormationCount: number;
  readonly catalogOrderSensitiveSelectionCount: number;
  readonly emergencyCatalogSelectionCount: number;
  readonly forcedOutOfPositionSlotCount: number;
  readonly avoidableOutOfPositionSlotCount: number;
  readonly academyCallUpAppearanceCount: number;
  readonly meanOutOfPositionSlots: number;
}

export interface LeagueDiversityCompetitionSeasonFact {
  readonly worldSeed: string;
  readonly competitionId: string;
  readonly seasonNumber: number;
  readonly distinctFormationCount: number;
  readonly replicatedFormationCount: number;
  readonly topFormationShare: number;
  readonly primaryRolePositiveCount: number;
  readonly fallbackSelectionCount: number;
  readonly selectionCount: number;
  readonly missingSelectionSourceCount: number;
  readonly missingStableIdCount: number;
  readonly reconciliationFailureCount: number;
  readonly identicalStartingXiAllFixturesClubCount: number;
}

export interface LeagueDiversityWorldFacts {
  readonly worldSeed: string;
  readonly opening: readonly LeagueDiversityOpeningCompetitionFact[];
  readonly seasons: readonly LeagueDiversityCompetitionSeasonFact[];
}

export interface SubstitutionMinuteTeamMatchFact {
  readonly worldSeed: string;
  readonly competitionId: string;
  readonly seasonNumber: number;
  readonly fixtureId: string;
  readonly side: "home" | "away";
  readonly finalMinute: number;
  readonly substitutionCount: number;
  readonly firstSubstitutionMinute: number | "not_observed";
  readonly substitutionWindowCount: number;
  readonly maximumSubstitutions: number;
  readonly substitutionWindowLimit: number | null;
  readonly automaticDecisionCount: number;
  readonly automaticCommandCount: number;
  readonly automaticDecisionReasonCounts: Readonly<Record<AiInGameDecisionReasonKey, number>>;
  readonly automaticReplacementFailureCounts: Readonly<Record<AiInGameReplacementFailureKey, number>>;
  readonly reconciliationFailureCount: number;
  readonly invalidMinuteCount: number;
}

export interface SubstitutionMinuteWorldFacts {
  readonly worldSeed: string;
  readonly teamMatches: readonly SubstitutionMinuteTeamMatchFact[];
}

export const AVAILABILITY_AGE_GROUPS = ["under_24", "24_29", "30_32", "33_plus"] as const;
export type AvailabilityAgeGroup = typeof AVAILABILITY_AGE_GROUPS[number];

export interface AvailabilityAgingTeamMatchFact {
  readonly worldSeed: string;
  readonly competitionId: string;
  readonly seasonNumber: number;
  readonly fixtureId: string;
  readonly side: "home" | "away";
  readonly recentUsePlayerCount: number;
  readonly unavailableSelectedPlayerCount: number;
  readonly lifecycleDiagnosticMissingCount: number;
  readonly consequenceMismatchCount: number;
  readonly playerMatchMinutes: number;
  readonly timeLossInjuryCount: number;
  readonly ageGroups: Readonly<Record<AvailabilityAgeGroup, {
    readonly positiveMinuteAppearanceCount: number;
    readonly playerMatchMinutes: number;
    readonly timeLossInjuryCount: number;
  }>>;
}

export interface AvailabilityAgingWorldFacts {
  readonly worldSeed: string;
  readonly teamMatches: readonly AvailabilityAgingTeamMatchFact[];
}

export interface RecoveryMatrixWorldFact {
  readonly cohort: "curve_selection" | "fresh_validation";
  readonly worldSeed: string;
  readonly age24To34DeficitDeltaAfterThreeDays: number;
  readonly maximumAdjacentAgeReadinessDelta: number;
  readonly age18To29PenaltyCount: number;
  readonly highResilienceAge40ReadinessAfterSevenDays: number;
  readonly shortRestReadiness: number;
  readonly weeklyRestReadiness: number;
  readonly controlledBoundsHeld: boolean;
  readonly bestVeteranHalfLifeDays: number | "not_observed";
  readonly worstVeteranHalfLifeDays: number | "not_observed";
}

export interface AvailabilityAgingCheckpointDecision {
  readonly decision: "GO" | "REFINE";
  readonly teamMatchCount: number;
  readonly playerMatchHours: number;
  readonly timeLossInjuryCount: number;
  readonly timeLossInjuriesPerThousandPlayerMatchHours: number;
  readonly worldsWithRecentUseCount: number;
  readonly worldsWithTimeLossInjuryCount: number;
  readonly unavailableSelectedPlayerCount: number;
  readonly lifecycleDiagnosticMissingCount: number;
  readonly consequenceMismatchCount: number;
  readonly ageGroups: Readonly<Record<AvailabilityAgeGroup, {
    readonly positiveMinuteAppearanceCount: number;
    readonly playerMatchHours: number;
    readonly timeLossInjuryCount: number;
  }>>;
  readonly recoveryMatrix: {
    readonly worlds: readonly RecoveryMatrixWorldFact[];
    readonly controlledBoundsHeld: boolean;
    readonly generatedVeteranResilienceSpreadHeld: boolean;
  };
  readonly carriedSubstitutionMinuteDecision: SubstitutionMinuteCheckpointDecision;
  readonly carriedLeagueDiversityDecision: LeagueDiversityCheckpointDecision;
  readonly substitutionBySeason: readonly {
    readonly seasonNumber: number;
    readonly teamMatchCount: number;
    readonly meanSubstitutionsPerTeamMatch: number;
  }[];
  readonly failed: readonly string[];
}

export interface SubstitutionMinuteCheckpointDecision {
  readonly decision: "GO" | "REFINE";
  readonly teamMatchCount: number;
  readonly meanSubstitutionsPerTeamMatch: number;
  readonly medianFirstSubstitutionMinute: number | "not_observed";
  readonly minimumSubstitutionCount: number;
  readonly maximumSubstitutionCount: number;
  readonly reconciliationFailureCount: number;
  readonly limitViolationCount: number;
  readonly controlledSideFailureCount: number;
  readonly invalidMinuteCount: number;
  readonly automaticDecisionReasonCounts: Readonly<Record<AiInGameDecisionReasonKey, number>>;
  readonly automaticReplacementFailureCounts: Readonly<Record<AiInGameReplacementFailureKey, number>>;
  readonly carriedLeagueDiversityDecision: "GO" | "REFINE";
  readonly failed: readonly string[];
}

export interface LeagueDiversityCheckpointDecision {
  readonly decision: "GO" | "REFINE";
  readonly opening: {
    readonly competitionCount: number;
    readonly passingCompetitionCount: number;
    readonly failed: readonly string[];
  };
  readonly longitudinal: {
    readonly competitionSeasonCount: number;
    readonly sixFormationRetentionShare: number;
    readonly fourReplicatedFormationRetentionShare: number;
    readonly topShareAtMostThirtyRetentionShare: number;
    readonly allRolesRetentionShare: number;
    readonly maximumTopFormationShare: number;
    readonly fallbackSelectionCount: number;
    readonly missingSelectionSourceCount: number;
    readonly missingStableIdCount: number;
    readonly reconciliationFailureCount: number;
    readonly failed: readonly string[];
  };
}

export interface IntegratedPlayerWorldCheckpointDecision {
  readonly decision: "GO" | "REFINE";
  readonly failedGateKeys: readonly string[];
  /** Nested gates a later checkpoint replaced: reported, never failed or hidden. */
  readonly supersededGateKeys: readonly SupersededGateFact[];
  readonly leagueDiversity: LeagueDiversityCheckpointDecision;
  readonly availabilityAging: AvailabilityAgingCheckpointDecision;
  readonly developmentRenewal: ReturnType<typeof evaluateDevelopmentRenewalCheckpoint>;
  readonly identicalStartingXiAllFixturesClubCount: number;
  readonly scorer33PlusShareSeasons8To10: number | "not_observed";
  readonly assist33PlusShareSeasons8To10: number | "not_observed";
  readonly scorerMeanAgeDrift: number | "not_observed";
  readonly assistMeanAgeDrift: number | "not_observed";
  readonly retained33PlusLeaderFullSeasonShare: number | "not_observed";
  readonly exceptional33PlusLeaderObservationCount: number;
}

export interface IntegratedLeaderboardAgeFact {
  readonly seasonNumber: number;
  readonly table: "scorers" | "assists";
  readonly age: number;
  readonly appearances: number;
}

export interface IntegratedLeaderboardAgeDecision {
  readonly scorer33PlusShareSeasons8To10: number | "not_observed";
  readonly assist33PlusShareSeasons8To10: number | "not_observed";
  readonly scorerMeanAgeDrift: number | "not_observed";
  readonly assistMeanAgeDrift: number | "not_observed";
  readonly retained33PlusLeaderFullSeasonShare: number | "not_observed";
  readonly exceptional33PlusLeaderObservationCount: number;
  readonly failedGateKeys: readonly string[];
}

interface LeagueFormationSeasonProjection {
  readonly seasonNumber: number;
  readonly seasonSeed: string;
  readonly fallbackSelectionCount: number;
  readonly selectionCount: number;
  readonly missingSelectionSourceCount: number;
  readonly missingStableIdCount: number;
  readonly reconciliationFailureCount: number;
  readonly catalogOrderSensitiveSelectionCount: number;
  readonly catalogChoiceMissingCount: number;
  readonly outOfPositionSlotCount: number;
  readonly weakOutOfPositionSlotCount: number;
  readonly emergencyCatalogSelectionCount: number;
  readonly forcedOutOfPositionSlotCount: number;
  readonly avoidableOutOfPositionSlotCount: number;
  readonly academyCallUpAppearanceCount: number;
  readonly meanOutOfPositionSlots: number;
  readonly identicalStartingXiAllFixturesClubCount: number;
  readonly distinctFormationCount: number;
  readonly replicatedFormationCount: number;
  readonly topFormationShare: number;
  readonly primaryRolePositiveCount: number;
  readonly primaryRoles: unknown;
  readonly roleDepthWarnings: unknown;
  readonly lateralFocus: "not_observed";
  readonly clubModalRows: readonly {
    readonly clubId: string;
    readonly clubName: string;
    readonly formation: FormationKey;
    readonly matches: number;
  }[];
  readonly rows: readonly unknown[];
}

interface SubstitutionMinuteSeasonProjection {
  readonly rows: readonly Omit<
    SubstitutionMinuteTeamMatchFact,
    "worldSeed" | "competitionId" | "seasonNumber"
  >[];
}

interface AvailabilityAgingSeasonProjection {
  readonly rows: readonly Omit<
    AvailabilityAgingTeamMatchFact,
    "worldSeed" | "competitionId" | "seasonNumber"
  >[];
}

type SimulatedMatchEvent = NonNullable<
  NonNullable<SimulateSeasonResult["fixtures"][number]["result"]>["report"]
>["events"][number];

/**
 * Executes each requested world exactly once and appends only requested facts.
 *
 * Worker completion order cannot affect the artifact: batches preserve input
 * order, and each world carries the seed that generated it.
 */
export async function createCareerSectionsFacts(input: {
  readonly worldSeeds: readonly string[];
  readonly seasonCount: number;
  readonly workerCount: number;
  readonly detail: SimulationReportDetail;
  readonly sectionIds: readonly CareerSectionId[];
  readonly leagueDiversityProfile?: {
    readonly profileId: string;
    readonly checkpointDirectoryPath: string;
    readonly checkpointKind: CareerCheckpointKind;
    /** Analysis replays fail closed instead of replacing missing cached facts. */
    readonly readOnly?: boolean;
    readonly renewalAblationArm?: RenewalAblationArm;
  };
}): Promise<CareerSectionsExecutionFacts> {
  const worlds: CareerWorldProjection[] = [];
  for (let start = 0; start < input.worldSeeds.length; start += input.workerCount) {
    worlds.push(...await Promise.all(
      input.worldSeeds.slice(start, start + input.workerCount).map(async (seed, offset) => {
        const worldIndex = start + offset + 1;
        const checkpointIdentity = input.leagueDiversityProfile === undefined
          ? undefined
          : careerSectionCheckpointIdentity(input, seed, worldIndex);
        if (checkpointIdentity !== undefined) {
          const checkpoint = await readCareerSectionWorldCheckpoint(checkpointIdentity);
          if (checkpoint !== undefined) return careerWorldProjectionFromCheckpoint(checkpoint, seed);
          if (input.leagueDiversityProfile?.readOnly === true) {
            throw new Error(`Read-only career checkpoint is missing: ${seed}`);
          }
        }

        const projectionInput = {
          seed,
          seasonCount: input.seasonCount,
          detail: input.detail,
          sectionIds: input.sectionIds,
          leagueDiversity: input.leagueDiversityProfile !== undefined,
          generationalSuccession: observesGenerationalSuccession(
            input.leagueDiversityProfile?.checkpointKind,
          ),
          ownerAttribution:
            input.leagueDiversityProfile?.checkpointKind === "owner_attribution_l5_1"
            || input.leagueDiversityProfile?.checkpointKind === "player_renewal_leaders_l5_3"
            || input.leagueDiversityProfile?.checkpointKind === "renewal_architecture_l5_3c"
            || input.leagueDiversityProfile?.checkpointKind === "integrated_player_world_l5_4"
            || input.leagueDiversityProfile?.checkpointKind === "renewal_ablation_l6_1",
          renewalArchitecture:
            input.leagueDiversityProfile?.checkpointKind === "renewal_architecture_l5_3c"
            || input.leagueDiversityProfile?.checkpointKind === "integrated_player_world_l5_4"
            || input.leagueDiversityProfile?.checkpointKind === "renewal_ablation_l6_1",
          standingsHierarchy:
            input.leagueDiversityProfile?.checkpointKind === "standings_hierarchy_l5_2"
            || input.leagueDiversityProfile?.checkpointKind === "integrated_player_world_l5_4"
            || input.leagueDiversityProfile?.checkpointKind === "renewal_ablation_l6_1",
          marketTargeting:
            input.leagueDiversityProfile?.checkpointKind === "integrated_player_world_l5_4"
            || input.leagueDiversityProfile?.checkpointKind === "renewal_ablation_l6_1",
          useOwnerAttributionStrengthOracle:
            input.leagueDiversityProfile?.checkpointKind === "owner_attribution_l5_1"
            || input.leagueDiversityProfile?.checkpointKind === "player_renewal_leaders_l5_3"
            || input.leagueDiversityProfile?.checkpointKind === "renewal_architecture_l5_3c",
          ...(input.leagueDiversityProfile?.renewalAblationArm === undefined
            ? {}
            : { renewalAblationArm: input.leagueDiversityProfile.renewalAblationArm }),
        } as const;
        const projection = input.workerCount === 1
          ? createCareerWorldProjection(projectionInput)
          : await runCareerSectionsWorker(projectionInput);
        if (checkpointIdentity !== undefined) {
          await writeCareerSectionWorldCheckpoint(
            checkpointIdentity,
            toSimulationReportJsonValue(projection),
          );
        }
        return projection;
      }),
    ));
  }
  const first = worlds[0];
  if (first === undefined) throw new Error("Career report needs at least one world");
  for (const world of worlds) {
    if (!sameStringRecord(first.calibrationVersions, world.calibrationVersions)) {
      throw new Error(`Career worlds disagree about calibration versions: ${first.seed} != ${world.seed}`);
    }
  }

  const checkpoint = input.leagueDiversityProfile === undefined
    ? undefined
    : input.leagueDiversityProfile.checkpointKind === "renewal_ablation_l6_1"
      ? evaluateRenewalAblationArmCheckpoint(
          worlds,
          input.seasonCount,
          requiredRenewalAblationArm(input.leagueDiversityProfile.renewalAblationArm),
        )
    : input.leagueDiversityProfile.checkpointKind === "renewal_architecture_l5_3c"
      ? evaluateRenewalArchitectureCheckpoint({
          ownerWorlds: worlds.map(requiredOwnerAttributionFacts),
          generationalWorlds: worlds.map(requiredGenerationalSuccessionFacts),
          architectureWorlds: worlds.map(requiredRenewalArchitectureFacts),
        })
    : input.leagueDiversityProfile.checkpointKind === "owner_attribution_l5_1"
      ? evaluateOwnerAttributionCheckpoint({
          worlds: worlds.map(requiredOwnerAttributionFacts),
          generationalWorlds: worlds.map(requiredGenerationalSuccessionFacts),
          tableAttribution: "required",
          replicatedFormationRetentionShare: evaluateLeagueDiversityCheckpoint(
            worlds.map(requiredLeagueDiversityFacts),
          ).longitudinal.fourReplicatedFormationRetentionShare,
        })
    : input.leagueDiversityProfile.checkpointKind === "player_renewal_leaders_l5_3"
      ? evaluatePlayerRenewalLeadersCheckpoint({
          worlds: worlds.map(requiredOwnerAttributionFacts),
          generationalWorlds: worlds.map(requiredGenerationalSuccessionFacts),
          replicatedFormationRetentionShare: evaluateLeagueDiversityCheckpoint(
            worlds.map(requiredLeagueDiversityFacts),
          ).longitudinal.fourReplicatedFormationRetentionShare,
        })
    : input.leagueDiversityProfile.checkpointKind === "standings_hierarchy_l5_2"
      ? evaluateStandingsHierarchyCheckpoint(
          worlds.map(requiredStandingsHierarchyFacts),
          worlds.map(requiredLeagueDiversityFacts),
          worlds.map(requiredAvailabilityAgingFacts),
          input.seasonCount,
        )
    : input.leagueDiversityProfile.checkpointKind === "integrated_player_world_l5_4"
      ? evaluateIntegratedPlayerWorldL5_4Checkpoint(worlds, input.seasonCount)
    : input.leagueDiversityProfile.checkpointKind === "integrated_player_world_l5"
      ? evaluateIntegratedPlayerWorldCheckpoint(worlds)
    : input.leagueDiversityProfile.checkpointKind === "league_diversity_l1"
      ? evaluateLeagueDiversityCheckpoint(worlds.map((world) => {
          if (world.leagueDiversity === undefined) {
            throw new Error(`Career world ${world.seed} omitted league-diversity facts`);
          }
          return world.leagueDiversity;
        }))
      : input.leagueDiversityProfile.checkpointKind === "substitution_minutes_l2"
        ? evaluateSubstitutionMinuteCheckpoint(worlds.map(requiredSubstitutionMinuteFacts), worlds.map((world) => {
            if (world.leagueDiversity === undefined) {
              throw new Error(`Career world ${world.seed} omitted carried league-diversity facts`);
            }
            return world.leagueDiversity;
          }))
        : input.leagueDiversityProfile.checkpointKind === "availability_aging_l3"
          ? evaluateAvailabilityAgingCheckpoint(
            worlds.map((world) => {
              if (world.availabilityAging === undefined) {
                throw new Error(`Career world ${world.seed} omitted availability-aging facts`);
              }
              return world.availabilityAging;
            }),
            worlds.map(requiredSubstitutionMinuteFacts),
            worlds.map((world) => {
              if (world.leagueDiversity === undefined) {
                throw new Error(`Career world ${world.seed} omitted carried league-diversity facts`);
              }
              return world.leagueDiversity;
            }),
              createRecoveryMatrixFacts(),
            )
          : input.leagueDiversityProfile.checkpointKind === "career_exit_renewal_l4_2"
            ? evaluateCareerExitRenewalCheckpoint(
                worlds.map(requiredGenerationalSuccessionFacts),
              )
          : input.leagueDiversityProfile.checkpointKind === "generated_ceiling_l4_3"
            ? evaluateGeneratedCeilingAttributionCheckpoint(
                worlds.map(requiredGenerationalSuccessionFacts),
              )
          : input.leagueDiversityProfile.checkpointKind === "development_renewal_l4_4"
            ? evaluateDevelopmentRenewalCheckpoint(
                worlds.map(requiredGenerationalSuccessionFacts),
              )
          : input.leagueDiversityProfile.checkpointKind === "annual_role_continuity_l4_5"
            ? evaluateAnnualRoleContinuityCheckpoint(
                worlds.map(requiredGenerationalSuccessionFacts),
                worlds.map((world) => {
                  if (world.leagueDiversity === undefined) {
                    throw new Error(`Career world ${world.seed} omitted carried formation facts`);
                  }
                  return world.leagueDiversity;
                }),
              )
          : input.leagueDiversityProfile.checkpointKind === "youth_minute_pathway_l4_1"
            ? evaluateYouthMinutePathwayCheckpoint(
                worlds.map(requiredGenerationalSuccessionFacts),
              )
            : evaluateGenerationalSuccessionCheckpoint(
                worlds.map(requiredGenerationalSuccessionFacts),
              );

  const sections: Partial<Record<CareerSectionId, SimulationReportJsonValue>> = {};
  for (const sectionId of input.sectionIds) {
    sections[sectionId] = asJsonValue({
      ...(input.leagueDiversityProfile !== undefined
        && sectionId === checkpointSectionId(input.leagueDiversityProfile.checkpointKind)
        && checkpoint !== undefined ? { checkpoint } : {}),
      worlds: worlds.map((world) => {
        const section = world.sections[sectionId];
        if (section === undefined) {
          throw new Error(`Career world ${world.seed} omitted requested section ${sectionId}`);
        }
        return section;
      }),
    });
  }

  return {
    sections,
    calibrationVersions: first.calibrationVersions,
    worldSeeds: worlds.map(({ seed }) => seed),
    decision: checkpoint === undefined
      || checkpoint.decision === "GO"
      || checkpoint.decision === "OWNER_IDENTIFIED"
      ? "PASS"
      : "FAIL",
  };
}

function requiredRenewalAblationArm(
  arm: RenewalAblationArm | undefined,
): RenewalAblationArm {
  if (arm === undefined) throw new Error("L6.1 checkpoint omitted its ablation arm");
  return arm;
}

function createCareerWorldProjection(input: {
  readonly seed: string;
  readonly seasonCount: number;
  readonly detail: SimulationReportDetail;
  readonly sectionIds: readonly CareerSectionId[];
  readonly leagueDiversity: boolean;
  readonly generationalSuccession: boolean;
  readonly ownerAttribution: boolean;
  readonly renewalArchitecture: boolean;
  readonly standingsHierarchy: boolean;
  readonly marketTargeting: boolean;
  readonly useOwnerAttributionStrengthOracle: boolean;
  readonly renewalAblationArm?: RenewalAblationArm;
}): CareerWorldProjection {
  const requested = new Set(input.sectionIds);
  const observedSeasons: ObservedSeason[] = [];
  const observedDomesticSeasons: ObservedDomesticSeason[] = [];
  const names = new Map<string, string>();
  const transfers: ObservedTransfer[] = [];
  const standingsHierarchySeasons: StandingsHierarchySeasonFact[] = [];
  const renewalNeedEpisodes: RenewalNeedEpisodeFact[] = [];
  const renewalPopulationSnapshots: RenewalPopulationSnapshot[] = [];
  const generationalObserver = input.generationalSuccession
    ? new GenerationalSuccessionObserver(input.seed)
    : undefined;
  const ownerAttributionObserver = input.ownerAttribution
    ? new OwnerAttributionObserver(input.seed, {
        includeTableAttribution: input.useOwnerAttributionStrengthOracle,
      })
    : undefined;
  const marketTargeting = input.marketTargeting
    ? mutableRoleAwareMarketWorldFacts(input.seed)
    : undefined;

  const report = createCareerWorldFacts(
    input.seed,
    input.seasonCount,
    createTranslator("en"),
    undefined,
    (careerState) => {
      rememberPlayerNames(careerState, names);
      generationalObserver?.observeOpening(careerState);
      ownerAttributionObserver?.observeOpening(careerState);
    },
    {
      selectCatalogFormation: true,
      ...(input.useOwnerAttributionStrengthOracle ? { analysisStrengthGapScale: 1.5 } : {}),
      ...(input.ownerAttribution ? { collectSelectionLoadDiagnostics: true } : {}),
      ...(input.renewalAblationArm === undefined
        ? {}
        : {
            renewalAblationPolicy: {
              roleAwareMarket:
                input.renewalAblationArm === "market" || input.renewalAblationArm === "combined",
              squadIdentityBlueprint:
                input.renewalAblationArm === "blueprint" || input.renewalAblationArm === "combined",
            },
          }),
      ...(input.leagueDiversity
        ? {
            observeCompetitionSeasonResults: ({
              seasonNumber,
              competitions,
              careerState,
              league,
            }: Parameters<NonNullable<CareerWorldInspection["observeCompetitionSeasonResults"]>>[0]) => {
              rememberPlayerNames(careerState, names);
              for (const { competitionId, result } of competitions) {
                const competition = league.domesticCompetitionWorld.competitions[competitionId];
                if (competition === undefined) throw new Error(`Career report lost competition ${competitionId}`);
                generationalObserver?.observeCompetitionSeason({
                  seasonNumber,
                  competitionId: String(competitionId),
                  competitionName: competition.name,
                  result,
                  careerState,
                });
                ownerAttributionObserver?.observeCompetitionSeason({
                  seasonNumber,
                  competitionId: String(competitionId),
                  result,
                  careerState,
                });
                if (input.standingsHierarchy) {
                  standingsHierarchySeasons.push(standingsHierarchySeasonFact({
                    worldSeed: input.seed,
                    competitionId: String(competitionId),
                    divisionLevel: divisionLevelForCompetition(
                      league.domesticCompetitionWorld.competitionIds,
                      competitionId,
                    ),
                    seasonNumber,
                    result,
                  }));
                }
              }
              observedDomesticSeasons.push({
                seasonNumber,
                competitions: competitions.map(({ competitionId, seasonSeed, result }) => {
                  const competition = league.domesticCompetitionWorld.competitions[competitionId];
                  if (competition === undefined) {
                    throw new Error(`Career report lost competition ${competitionId}`);
                  }
                  return {
                    seasonNumber,
                    competitionId: String(competitionId),
                    competitionName: competition.name,
                    seasonSeed,
                    ...(requested.has("season")
                      ? { season: competitionSeasonProjection(result, careerState, seasonNumber, seasonSeed) }
                      : {}),
                    ...(requested.has("standings")
                      ? { standings: standingsProjection(result, careerState, seasonNumber, seasonSeed) }
                      : {}),
                    ...(requested.has("players")
                      ? {
                          players: playerProjection(
                            result,
                            careerState,
                            seasonNumber,
                            seasonSeed,
                            "summary",
                          ),
                        }
                      : {}),
                    ...(requested.has("formations")
                      ? {
                          formations: formationProjection(result, careerState, seasonNumber, seasonSeed),
                          substitutionMinutes: substitutionMinuteProjection(
                            result,
                            competition.matchRules.maximumSubstitutions,
                            competition.matchRules.substitutionWindowLimit,
                          ),
                          availabilityAging: availabilityAgingProjection(result, careerState),
                        }
                      : {}),
                  };
                }),
              });
            },
          }
        : {
            observeSeasonResult: ({
              seasonNumber,
              seasonSeed,
              result,
              careerState,
            }: Parameters<NonNullable<CareerWorldInspection["observeSeasonResult"]>>[0]) => {
              rememberPlayerNames(careerState, names);
              observedSeasons.push({
                seasonNumber,
                seasonSeed,
                ...(requested.has("standings")
                  ? { standings: standingsProjection(result, careerState, seasonNumber, seasonSeed) }
                  : {}),
                ...(requested.has("players")
                  ? { players: playerProjection(result, careerState, seasonNumber, seasonSeed, input.detail) }
                  : {}),
                ...(requested.has("formations")
                  ? { formations: formationProjection(result, careerState, seasonNumber, seasonSeed) }
                  : {}),
              });
            },
          }),
      observeSeasonBoundary: ({ seasonNumber, previousCareerState, careerState }) => {
        rememberPlayerNames(previousCareerState, names);
        rememberPlayerNames(careerState, names);
        const previousSequence = previousCareerState.transferHistory.at(-1)?.sequenceNumber ?? 0;
        for (const entry of careerState.transferHistory) {
          if (entry.sequenceNumber > previousSequence) {
            transfers.push(observeTransferAtBoundary(seasonNumber, entry, previousCareerState));
          }
        }
        if (input.renewalAblationArm !== undefined) {
          renewalPopulationSnapshots.push(renewalPopulationSnapshot(seasonNumber, careerState));
        }
      },
      observeSeasonAdvancement: ({ seasonNumber, previousCareerState, careerState, facts }) => {
        generationalObserver?.observeAdvancement({
          seasonNumber,
          previousCareerState,
          careerState,
          facts,
        });
        if (marketTargeting !== undefined) {
          observeRoleAwareMarketFacts(
            marketTargeting,
            previousCareerState,
            facts.marketLifecycle?.diagnostics ?? [],
          );
        }
        if (input.renewalAblationArm !== undefined) {
          renewalNeedEpisodes.push(...renewalNeedEpisodesForSeason({
            worldSeed: input.seed,
            seasonNumber,
            divisionByClubId: divisionByClubId(previousCareerState),
            playerRoleById: playerRoleById(previousCareerState, careerState),
            diagnostics: facts.marketLifecycle?.diagnostics ?? [],
            lifecycleFacts: facts.marketLifecycle?.facts ?? [],
          }));
        }
      },
      observeGeneratedIntakeRoles: ({ seasonNumber, careerState, diagnostics }) => {
        generationalObserver?.observeGeneratedIntakeRoles({
          seasonNumber,
          careerState,
          diagnostics,
        });
        ownerAttributionObserver?.observeGeneratedIntakeRoles({ seasonNumber, diagnostics });
      },
    },
  );
  rememberPlayerNames(report.finalCareerState, names);

  const sections: Partial<Record<CareerSectionId, unknown>> = {};
  const domesticSection = (key: keyof ObservedCompetitionSeason) => ({
    seed: input.seed,
    seasons: observedDomesticSeasons.map((season) => ({
      seasonNumber: season.seasonNumber,
      competitions: season.competitions.map((competition) =>
        competitionSectionProjection(competition, key)
      ),
    })),
  });
  if (requested.has("season")) {
    sections.season = input.leagueDiversity ? domesticSection("season") : seasonProjection(report);
  }
  if (requested.has("standings")) {
    sections.standings = input.leagueDiversity
      ? domesticSection("standings")
      : { seed: input.seed, seasons: observedSeasons.map(required("standings")) };
  }
  if (requested.has("players")) {
    sections.players = input.leagueDiversity
      ? domesticSection("players")
      : { seed: input.seed, seasons: observedSeasons.map(required("players")) };
  }
  if (requested.has("formations")) {
    sections.formations = input.leagueDiversity
      ? {
          ...domesticSection("formations"),
          openingPopulation: openingPopulationProjection(report.league, input.seed),
        }
      : { seed: input.seed, seasons: observedSeasons.map(required("formations")) };
  }
  if (requested.has("transfers")) {
    sections.transfers = transferProjection(
      report,
      transfers,
      names,
      input.leagueDiversity ? "diagnostic" : input.detail,
    );
  }
  if (requested.has("economy")) {
    sections.economy = economyProjection(
      report,
      input.leagueDiversity ? "summary" : input.detail,
    );
  }
  if (requested.has("development")) {
    sections.development = generationalObserver?.facts() ?? developmentProjection(
      report,
      input.leagueDiversity ? "summary" : input.detail,
    );
  }
  if (requested.has("anomalies")) {
    sections.anomalies = { seed: input.seed, ...report.anomalyReport };
  }

  const leagueDiversity = input.leagueDiversity && requested.has("formations")
    ? leagueDiversityWorldFacts(input.seed, report.league, observedDomesticSeasons)
    : undefined;
  const observesAvailability = input.leagueDiversity && requested.has("formations");
  const substitutionMinutes = observesAvailability
    ? substitutionMinuteWorldFacts(input.seed, observedDomesticSeasons)
    : undefined;
  const availabilityAging = observesAvailability
    ? availabilityAgingWorldFacts(input.seed, observedDomesticSeasons)
    : undefined;
  const ownerAttribution = ownerAttributionObserver?.facts();
  const renewalArchitecture = input.renewalArchitecture
    ? generationalObserver?.renewalArchitectureFacts()
    : undefined;
  const renewalPopulationSignatures = input.renewalAblationArm === undefined
    || renewalArchitecture === undefined
    ? undefined
    : renewalPopulationSnapshots.map((snapshot) => renewalPopulationSignature(
        snapshot,
        renewalArchitecture,
      ));
  const standingsHierarchy = input.standingsHierarchy
    ? { worldSeed: input.seed, seasons: standingsHierarchySeasons }
    : undefined;
  return {
    seed: input.seed,
    sections,
    calibrationVersions: {
      ...stringCalibrationVersions(
        report.league.calibrationVersions as unknown as Readonly<Record<string, unknown>>,
      ),
      playerStateCurves: selectPlayerStateCurvesConfig().version,
      matchInjuryRisk: MATCH_INJURY_RISK_POLICY.version,
    },
    ...(leagueDiversity === undefined ? {} : { leagueDiversity }),
    ...(substitutionMinutes === undefined ? {} : { substitutionMinutes }),
    ...(availabilityAging === undefined ? {} : { availabilityAging }),
    ...(ownerAttribution === undefined ? {} : { ownerAttribution }),
    ...(renewalArchitecture === undefined ? {} : { renewalArchitecture }),
    ...(standingsHierarchy === undefined ? {} : { standingsHierarchy }),
    ...(marketTargeting === undefined ? {} : { marketTargeting }),
    ...(input.renewalAblationArm === undefined ? {} : { renewalNeedEpisodes }),
    ...(renewalPopulationSignatures === undefined ? {} : { renewalPopulationSignatures }),
  };
}

function economyProjection(report: CareerWorldFacts, detail: SimulationReportDetail): unknown {
  if (detail !== "summary") {
    return {
      seed: report.seed,
      playerEconomy: report.playerEconomyAudit,
      contractFinance: report.contractFinanceStabilityReport,
    };
  }
  const finance = report.contractFinanceStabilityReport;
  return {
    seed: report.seed,
    playerEconomy: {
      observationCount: report.playerEconomyAudit.observationCount,
      gates: report.playerEconomyAudit.gates.map((gate) => ({
        key: gate.key,
        status: gate.status,
        observationCount: gate.observationCount,
        violationCount: gate.violationCount,
        threshold: gate.threshold,
      })),
    },
    contractFinance: {
      status: finance.status,
      structuralViolationCount: finance.structuralViolationCount,
      minimumCashBalanceObserved: finance.minimumCashBalanceObserved,
      maximumWageBudgetUtilizationObserved: finance.maximumWageBudgetUtilizationObserved,
      completedTransferCount: finance.completedTransferCount,
      renewalCount: finance.renewalCount,
      releaseCount: finance.releaseCount,
      expiryCount: finance.expiryCount,
    },
  };
}

function developmentProjection(report: CareerWorldFacts, detail: SimulationReportDetail): unknown {
  if (detail !== "summary") return { seed: report.seed, ...report.playerEvolutionReport };
  const evolution = report.playerEvolutionReport;
  return {
    seed: report.seed,
    startAverageCurrentAbility: evolution.startAverageCurrentAbility,
    endAverageCurrentAbility: evolution.endAverageCurrentAbility,
    playersImproved: evolution.playersImproved,
    playersDeclined: evolution.playersDeclined,
    seriousProspects: evolution.seriousProspects,
    rareProdigies: evolution.rareProdigies,
    usefulAfterLongRun: evolution.usefulAfterLongRun,
    finalAgeUnder22: evolution.finalAgeUnder22,
    finalAge22To29: evolution.finalAge22To29,
    finalAge30Plus: evolution.finalAge30Plus,
  };
}

function seasonProjection(report: CareerWorldFacts): unknown {
  return {
    seed: report.seed,
    seasons: report.seasons.map((season) => {
      const champion = season.result.table[0];
      const last = season.result.table.at(-1);
      if (champion === undefined || last === undefined) {
        throw new Error(`Season table is empty: ${season.seasonSeed}`);
      }
      return {
        seasonNumber: season.seasonNumber,
        seasonSeed: season.seasonSeed,
        fixtureCount: season.result.fixtureCount,
        drawCount: season.result.drawCount,
        championClubId: String(champion.clubId),
        championPoints: champion.points,
        lastClubId: String(last.clubId),
        lastPoints: last.points,
        transferTurnoverCount: season.refresh.transferTurnoverCount,
      };
    }),
  };
}

/** One played competition's compact season headline, before career rollover. */
function competitionSeasonProjection(
  result: SimulateSeasonResult,
  careerState: CliCareerState,
  seasonNumber: number,
  seasonSeed: string,
): unknown {
  const champion = result.table[0];
  const last = result.table.at(-1);
  if (champion === undefined || last === undefined) {
    throw new Error(`Competition season table is empty: ${seasonSeed}`);
  }
  return {
    seasonNumber,
    seasonSeed,
    fixtureCount: result.fixtures.length,
    drawCount: result.fixtures.reduce((count, fixture) =>
      fixture.result !== undefined && fixture.result.homeGoals === fixture.result.awayGoals
        ? count + 1
        : count, 0),
    championClubId: String(champion.clubId),
    championClubName:
      careerState.gameState.clubs[champion.clubId]?.name ?? String(champion.clubId),
    championPoints: champion.points,
    lastClubId: String(last.clubId),
    lastClubName: careerState.gameState.clubs[last.clubId]?.name ?? String(last.clubId),
    lastPoints: last.points,
  };
}

function standingsProjection(
  result: SimulateSeasonResult,
  careerState: CliCareerState,
  seasonNumber: number,
  seasonSeed: string,
): unknown {
  return {
    seasonNumber,
    seasonSeed,
    rows: result.table.map((row) => ({
      ...row,
      clubName: careerState.gameState.clubs[row.clubId]?.name ?? String(row.clubId),
    })),
  };
}

function playerProjection(
  result: SimulateSeasonResult,
  careerState: CliCareerState,
  seasonNumber: number,
  seasonSeed: string,
  detail: SimulationReportDetail,
): unknown {
  const participation = new Map<string, { appearances: number; minutes: number }>();
  for (const fixture of result.fixtureParticipation) {
    for (const row of fixture.contributions) {
      if (!row.started && !row.substituteAppearance) continue;
      const current = participation.get(String(row.playerId)) ?? { appearances: 0, minutes: 0 };
      participation.set(String(row.playerId), {
        appearances: current.appearances + 1,
        minutes: current.minutes + row.minutes,
      });
    }
  }
  const seasonEnd = result.fixtures.reduce(
    (latest, fixture) => Number(fixture.date) > Number(latest) ? fixture.date : latest,
    result.fixtures[0]?.date ?? careerState.gameState.calendar.currentDate,
  );
  const rows = result.playerSummaryStats.map((stat) => {
    const player = careerState.gameState.players[stat.playerId];
    if (player === undefined) throw new Error(`Season stats reference unknown player ${stat.playerId}`);
    const played = participation.get(String(stat.playerId)) ?? { appearances: 0, minutes: 0 };
    return {
      playerId: String(stat.playerId),
      playerName: `${player.firstName} ${player.lastName}`,
      age: completedPlayerAge(player.birthDate, seasonEnd),
      role: player.primaryRole,
      clubId: String(stat.clubId),
      clubName: careerState.gameState.clubs[stat.clubId]?.name ?? String(stat.clubId),
      goals: stat.goals,
      assists: stat.assists,
      saves: stat.saves,
      appearances: played.appearances,
      minutes: played.minutes,
    };
  });
  const limit = detail === "summary" ? 10 : detail === "standard" ? 50 : rows.length;
  const byGoals = rows.toSorted((left, right) =>
    right.goals - left.goals || right.assists - left.assists || left.playerId.localeCompare(right.playerId)
  ).slice(0, limit);
  const byAssists = rows.toSorted((left, right) =>
    right.assists - left.assists || right.goals - left.goals || left.playerId.localeCompare(right.playerId)
  ).slice(0, limit);
  return { seasonNumber, seasonSeed, topScorers: byGoals, topAssists: byAssists };
}

function formationProjection(
  result: SimulateSeasonResult,
  careerState: CliCareerState,
  seasonNumber: number,
  seasonSeed: string,
): LeagueFormationSeasonProjection {
  const counts = new Map<string, {
    clubId: string;
    clubName: string;
    formation: FormationKey;
    selectionSource: string;
    directness: number;
    pressing: number;
    width: number;
    risk: number;
    mentality: string;
    matches: number;
  }>();
  const clubFormationCounts = new Map<string, Map<FormationKey, number>>();
  const clubStartingXiSignatures = new Map<string, Set<string>>();
  const clubTeamMatchCounts = new Map<string, number>();
  let fallbackSelectionCount = 0;
  let selectionCount = 0;
  let missingSelectionSourceCount = 0;
  let missingStableIdCount = 0;
  let catalogOrderSensitiveSelectionCount = 0;
  let catalogChoiceMissingCount = 0;
  let selectionDiagnosticsMissingCount = 0;
  let outOfPositionSlotCount = 0;
  let weakOutOfPositionSlotCount = 0;
  let emergencyCatalogSelectionCount = 0;
  let forcedOutOfPositionSlotCount = 0;
  let avoidableOutOfPositionSlotCount = 0;
  let academyCallUpAppearanceCount = 0;
  for (const fixture of result.fixtureParticipation) {
    for (const team of [fixture.fieldedTeams.home, fixture.fieldedTeams.away]) {
      selectionCount += 1;
      const clubId = String(team.clubId);
      const lineupSignature = team.lineup.map(({ playerId }) => String(playerId)).sort().join("|");
      const signatures = clubStartingXiSignatures.get(clubId) ?? new Set<string>();
      signatures.add(lineupSignature);
      clubStartingXiSignatures.set(clubId, signatures);
      clubTeamMatchCounts.set(clubId, (clubTeamMatchCounts.get(clubId) ?? 0) + 1);
      if (String(team.clubId).length === 0) missingStableIdCount += 1;
      if (team.selectionSource.length === 0) missingSelectionSourceCount += 1;
      missingStableIdCount += team.lineup.filter(({ playerId }) => String(playerId).length === 0).length;
      const teamOutOfPositionSlotCount = team.outOfPositionSlotCount ?? 0;
      const invalidLineupSlotCount = team.invalidLineupSlotCount ?? 0;
      outOfPositionSlotCount += teamOutOfPositionSlotCount;
      weakOutOfPositionSlotCount += teamOutOfPositionSlotCount - invalidLineupSlotCount;
      if (team.catalogChoice?.fillableShapeCount === 0) {
        emergencyCatalogSelectionCount += 1;
      }
      if (team.selectionSource === "catalog_ai") {
        // Catalog AI admits an invalid fit only after its ordinary credible
        // lists cannot fill the relevant slot (including emergency goalkeeper).
        // An invalid catalog-AI slot is therefore forced by construction.
        forcedOutOfPositionSlotCount += invalidLineupSlotCount;
      } else {
        avoidableOutOfPositionSlotCount += invalidLineupSlotCount;
      }
      const lineupPlayerIds = new Set(team.lineup.map(({ playerId }) => playerId));
      academyCallUpAppearanceCount += team.callUpPlayerIds?.filter((playerId) =>
        lineupPlayerIds.has(playerId)
      ).length ?? 0;
      if (team.formationKey === undefined) {
        fallbackSelectionCount += 1;
        continue;
      }
      if (team.selectionSource !== "catalog_ai") fallbackSelectionCount += 1;
      if (team.selectionSource === "catalog_ai" && team.catalogChoice === undefined) {
        catalogChoiceMissingCount += 1;
      }
      if (team.selectionSource === "catalog_ai" && team.outOfPositionSlotCount === undefined) {
        selectionDiagnosticsMissingCount += 1;
      }
      if (team.selectionSource === "catalog_ai" && team.invalidLineupSlotCount === undefined) {
        selectionDiagnosticsMissingCount += 1;
      }
      if ((team.catalogChoice?.tiedAtBestCount ?? 1) > 1) {
        catalogOrderSensitiveSelectionCount += 1;
      }
      const tactic = team.tacticalDistribution;
      const key = [
        team.clubId,
        team.formationKey,
        team.selectionSource,
        tactic.directness,
        tactic.pressing,
        tactic.width,
        tactic.risk,
        tactic.mentality,
      ].join("|");
      const current = counts.get(key);
      counts.set(key, {
        clubId: String(team.clubId),
        clubName: careerState.gameState.clubs[team.clubId]?.name ?? String(team.clubId),
        formation: team.formationKey,
        selectionSource: team.selectionSource,
        directness: tactic.directness,
        pressing: tactic.pressing,
        width: tactic.width,
        risk: tactic.risk,
        mentality: tactic.mentality,
        matches: (current?.matches ?? 0) + 1,
      });
      const formationCounts = clubFormationCounts.get(String(team.clubId)) ?? new Map<FormationKey, number>();
      formationCounts.set(team.formationKey, (formationCounts.get(team.formationKey) ?? 0) + 1);
      clubFormationCounts.set(String(team.clubId), formationCounts);
    }
  }
  const rows = [...counts.values()].sort((left, right) =>
    left.clubId.localeCompare(right.clubId)
    || left.formation.localeCompare(right.formation)
    || left.selectionSource.localeCompare(right.selectionSource)
  );
  const clubModalRows = [...clubFormationCounts].map(([clubId, formationCounts]) => {
    const selected = [...formationCounts].sort(([leftKey, leftCount], [rightKey, rightCount]) =>
      rightCount - leftCount || leftKey.localeCompare(rightKey)
    )[0];
    if (selected === undefined) throw new Error(`Club ${clubId} has no fielded catalog formation`);
    return {
      clubId,
      clubName: careerState.gameState.clubs[clubId as keyof typeof careerState.gameState.clubs]?.name ?? clubId,
      formation: selected[0],
      matches: selected[1],
    };
  }).sort((left, right) => left.clubId.localeCompare(right.clubId));
  const modalClubCountByFormation = new Map<FormationKey, number>();
  for (const { formation } of clubModalRows) {
    modalClubCountByFormation.set(formation, (modalClubCountByFormation.get(formation) ?? 0) + 1);
  }
  const primaryRolePlayerIds = [...new Set(
    result.table.flatMap(({ clubId }) =>
      fieldablePlayerIdsFor(careerState.gameState.clubs[clubId])
    ),
  )];
  const primaryRoles = summarizeTacticalAgencyPrimaryRoles(careerState, primaryRolePlayerIds);
  const roleDepthWarnings = result.table.flatMap(({ clubId }) => {
    const club = careerState.gameState.clubs[clubId];
    if (club === undefined) return [];
    const assessment = assessCareerSquadStructure({
      playerIds: fieldablePlayerIdsFor(club),
      players: careerState.gameState.players,
    });
    return assessment.warnings.length === 0 ? [] : [{
      clubId: String(clubId),
      clubName: club.name,
      squadSize: assessment.squadSize,
      departmentDepth: assessment.departmentDepth,
      warnings: assessment.warnings,
    }];
  });
  const expectedSelectionCount = result.fixtureParticipation.length * 2;
  const rowSelectionCount = rows.reduce((sum, row) => sum + row.matches, 0);
  const reconciliationFailureCount = Number(selectionCount !== expectedSelectionCount)
    + Number(rowSelectionCount + result.fixtureParticipation.flatMap(({ fieldedTeams }) =>
      [fieldedTeams.home, fieldedTeams.away]
    ).filter(({ formationKey }) => formationKey === undefined).length !== selectionCount)
    + Number(clubModalRows.length !== result.table.length)
    + Number(primaryRoles.playerCount !== primaryRolePlayerIds.length)
    + Number(catalogChoiceMissingCount > 0)
    + Number(selectionDiagnosticsMissingCount > 0);
  const highestModalClubCount = Math.max(0, ...modalClubCountByFormation.values());
  const identicalStartingXiAllFixturesClubCount = [...clubStartingXiSignatures].filter(
    ([clubId, signatures]) => clubTeamMatchCounts.get(clubId) === 34 && signatures.size === 1,
  ).length;
  return {
    seasonNumber,
    seasonSeed,
    fallbackSelectionCount,
    selectionCount,
    missingSelectionSourceCount,
    missingStableIdCount,
    reconciliationFailureCount,
    catalogOrderSensitiveSelectionCount,
    catalogChoiceMissingCount,
    outOfPositionSlotCount,
    weakOutOfPositionSlotCount,
    emergencyCatalogSelectionCount,
    forcedOutOfPositionSlotCount,
    avoidableOutOfPositionSlotCount,
    academyCallUpAppearanceCount,
    meanOutOfPositionSlots: selectionCount === 0 ? 0 : outOfPositionSlotCount / selectionCount,
    identicalStartingXiAllFixturesClubCount,
    distinctFormationCount: modalClubCountByFormation.size,
    replicatedFormationCount: [...modalClubCountByFormation.values()].filter((count) => count >= 2).length,
    topFormationShare: clubModalRows.length === 0 ? 0 : highestModalClubCount / clubModalRows.length,
    primaryRolePositiveCount: primaryRoles.roleShares.filter(({ count }) => count > 0).length,
    primaryRoles,
    roleDepthWarnings,
    lateralFocus: "not_observed",
    clubModalRows,
    rows,
  };
}

/** Reads automatic control and minute truth without rebuilding a match. */
function substitutionMinuteProjection(
  result: SimulateSeasonResult,
  maximumSubstitutions: number,
  substitutionWindowLimit: number | null,
): SubstitutionMinuteSeasonProjection {
  const fixtures = new Map(result.fixtures.map((fixture) => [fixture.id, fixture]));
  const rows: SubstitutionMinuteSeasonProjection["rows"][number][] = [];
  for (const fixture of result.fixtureParticipation) {
    const report = fixtures.get(fixture.fixtureId)?.result?.report;
    if (report === undefined) {
      throw new Error(`Substitution checkpoint fixture omitted its report: ${fixture.fixtureId}`);
    }
    for (const side of ["home", "away"] as const) {
      const kickoff = fixture.fieldedTeams[side];
      const applied = fixture.progression.appliedSubstitutions.filter((entry) => entry.side === side);
      const events = report.events.filter((event) => event.type === "substitution" && event.side === side);
      const finalLineup = fixture.progression.finalLineups[side];
      const contributions = fixture.contributions.filter(({ clubId }) => clubId === kickoff.clubId);
      const first = applied[0];
      const substitutionWindowCount = new Set(
        applied.filter(({ minute }) => minute !== 45).map(({ minute }) => minute),
      ).size;
      const eventMismatch = Number(applied.length !== events.length || applied.some((entry, index) => {
        const event = events[index];
        return event?.type !== "substitution"
          || event.minute !== entry.minute
          || event.outgoingPlayerId !== entry.outgoingPlayerId
          || event.incomingPlayerId !== entry.incomingPlayerId
          || event.slotId !== entry.slotId
          || event.reasonKey !== entry.reasonKey;
      }));
      const finalIds = new Set(finalLineup.map(({ playerId }) => playerId));
      const expectedFinalIds = new Set(kickoff.lineup.map(({ playerId }) => playerId));
      const playerExits = report.events.flatMap((event) =>
        (event.type === "red_card" || event.type === "second_yellow_card" || event.type === "injury")
        && event.side === side
        && !finalIds.has(event.playerId)
          ? [{ playerId: event.playerId, minute: event.minute }]
          : []
      );
      for (const action of [
        ...playerExits.map((exit, order) => ({ ...exit, type: "exit" as const, order })),
        ...applied.map((substitution, order) => ({
          ...substitution,
          type: "substitution" as const,
          order,
        })),
      ].sort((left, right) => left.minute - right.minute
        || left.type.localeCompare(right.type)
        || left.order - right.order)) {
        if (action.type === "exit") expectedFinalIds.delete(action.playerId);
        else {
          expectedFinalIds.delete(action.outgoingPlayerId);
          expectedFinalIds.add(action.incomingPlayerId);
        }
      }
      const finalLineupMismatch = Number(
        finalIds.size !== finalLineup.length
        || finalIds.size !== expectedFinalIds.size
        || [...finalIds].some((playerId) => !expectedFinalIds.has(playerId)),
      );
      const minuteMismatch = Number(contributions.some((contribution) => {
        if (!contribution.started && !contribution.substituteAppearance) {
          return contribution.minutes !== 0;
        }
        const entryMinute = contribution.started
          ? 0
          : applied.find(({ incomingPlayerId }) => incomingPlayerId === contribution.playerId)?.minute;
        if (entryMinute === undefined) return true;
        const substitutionExit = applied.find(({ outgoingPlayerId, minute }) =>
          outgoingPlayerId === contribution.playerId && minute >= entryMinute)?.minute;
        const incidentExit = playerExits.find(({ playerId, minute }) =>
          playerId === contribution.playerId && minute >= entryMinute)?.minute;
        const exitMinute = Math.min(
          substitutionExit ?? report.finalMinute,
          incidentExit ?? report.finalMinute,
          report.finalMinute,
        );
        return contribution.minutes !== Math.max(0, exitMinute - entryMinute);
      }));
      const invalidMinuteCount = contributions.filter(({ minutes }) =>
        !Number.isFinite(minutes) || minutes < 0 || minutes > report.finalMinute).length;
      rows.push({
        fixtureId: String(fixture.fixtureId),
        side,
        finalMinute: report.finalMinute,
        substitutionCount: applied.length,
        firstSubstitutionMinute: first?.minute ?? "not_observed",
        substitutionWindowCount,
        maximumSubstitutions,
        substitutionWindowLimit,
        automaticDecisionCount: fixture.progression.aiDecisionCount[side],
        automaticCommandCount: fixture.progression.aiCommandCount[side],
        automaticDecisionReasonCounts: fixture.progression.aiReasonCounts[side],
        automaticReplacementFailureCounts: fixture.progression.aiReplacementFailureCounts[side],
        reconciliationFailureCount: eventMismatch + finalLineupMismatch + minuteMismatch,
        invalidMinuteCount,
      });
    }
  }
  return { rows };
}

function substitutionMinuteWorldFacts(
  worldSeed: string,
  seasons: readonly ObservedDomesticSeason[],
): SubstitutionMinuteWorldFacts {
  return {
    worldSeed,
    teamMatches: seasons.flatMap(({ seasonNumber, competitions }) =>
      competitions.flatMap((competition) => {
        if (competition.substitutionMinutes === undefined) {
          throw new Error(`Competition omitted substitution-minute facts: ${competition.competitionId}`);
        }
        return competition.substitutionMinutes.rows.map((row) => ({
          worldSeed,
          competitionId: competition.competitionId,
          seasonNumber,
          ...row,
        }));
      })),
  };
}

/** Reads availability, injury and age exposure from committed season facts. */
function availabilityAgingProjection(
  result: SimulateSeasonResult,
  careerState: CliCareerState,
): AvailabilityAgingSeasonProjection {
  const fixtures = new Map(result.fixtures.map((fixture) => [fixture.id, fixture]));
  const rows: AvailabilityAgingSeasonProjection["rows"][number][] = [];
  for (const participation of result.fixtureParticipation) {
    const fixture = fixtures.get(participation.fixtureId);
    const report = fixture?.result?.report;
    if (fixture === undefined || report === undefined) {
      throw new Error(`Availability checkpoint fixture omitted committed facts: ${participation.fixtureId}`);
    }
    const fixtureConsequences = (result.playerAvailabilityConsequences ?? []).filter(
      (consequence) => consequence.fixtureId === participation.fixtureId,
    );
    for (const side of ["home", "away"] as const) {
      const fielded = participation.fieldedTeams[side];
      const contributions = participation.contributions.filter(({ clubId }) => clubId === fielded.clubId);
      const playerIds = new Set(contributions.map(({ playerId }) => playerId));
      const consequences = fixtureConsequences.filter(({ playerId }) => playerIds.has(playerId));
      const timeLossInjuries = consequences.flatMap((consequence) =>
        consequence.type === "injury" && consequence.unavailableUntil > consequence.occurredOn
          ? [consequence]
          : []
      );
      const ageGroups = emptyAvailabilityAgeGroups();
      for (const contribution of contributions) {
        if (contribution.minutes <= 0) continue;
        const player = careerState.gameState.players[contribution.playerId];
        if (player === undefined) {
          throw new Error(`Availability checkpoint lost player ${contribution.playerId}`);
        }
        const group = availabilityAgeGroup(completedPlayerAge(player.birthDate, fixture.date));
        const current = ageGroups[group];
        ageGroups[group] = {
          ...current,
          positiveMinuteAppearanceCount: current.positiveMinuteAppearanceCount + 1,
          playerMatchMinutes: current.playerMatchMinutes + contribution.minutes,
        };
      }
      for (const consequence of timeLossInjuries) {
        const player = careerState.gameState.players[consequence.playerId];
        if (player === undefined) {
          throw new Error(`Availability checkpoint lost injured player ${consequence.playerId}`);
        }
        const group = availabilityAgeGroup(completedPlayerAge(player.birthDate, consequence.occurredOn));
        ageGroups[group] = {
          ...ageGroups[group],
          timeLossInjuryCount: ageGroups[group].timeLossInjuryCount + 1,
        };
      }
      rows.push({
        fixtureId: String(participation.fixtureId),
        side,
        recentUsePlayerCount: fielded.lifecycleDiagnostics?.recentUsePlayerCount ?? 0,
        unavailableSelectedPlayerCount:
          fielded.lifecycleDiagnostics?.unavailableSelectedPlayerCount ?? 0,
        lifecycleDiagnosticMissingCount: Number(fielded.lifecycleDiagnostics === undefined),
        consequenceMismatchCount: availabilityConsequenceMismatchCount(
          consequences,
          report.events.filter((event) => "side" in event && event.side === side),
          playerIds,
        ),
        playerMatchMinutes: contributions.reduce((total, { minutes }) => total + minutes, 0),
        timeLossInjuryCount: timeLossInjuries.length,
        ageGroups,
      });
    }
  }
  return { rows };
}

function availabilityAgingWorldFacts(
  worldSeed: string,
  seasons: readonly ObservedDomesticSeason[],
): AvailabilityAgingWorldFacts {
  return {
    worldSeed,
    teamMatches: seasons.flatMap(({ seasonNumber, competitions }) =>
      competitions.flatMap((competition) => {
        if (competition.availabilityAging === undefined) {
          throw new Error(`Competition omitted availability-aging facts: ${competition.competitionId}`);
        }
        return competition.availabilityAging.rows.map((row) => ({
          worldSeed,
          competitionId: competition.competitionId,
          seasonNumber,
          ...row,
        }));
      })),
  };
}

function emptyAvailabilityAgeGroups(): Record<AvailabilityAgeGroup, {
  positiveMinuteAppearanceCount: number;
  playerMatchMinutes: number;
  timeLossInjuryCount: number;
}> {
  return {
    under_24: { positiveMinuteAppearanceCount: 0, playerMatchMinutes: 0, timeLossInjuryCount: 0 },
    "24_29": { positiveMinuteAppearanceCount: 0, playerMatchMinutes: 0, timeLossInjuryCount: 0 },
    "30_32": { positiveMinuteAppearanceCount: 0, playerMatchMinutes: 0, timeLossInjuryCount: 0 },
    "33_plus": { positiveMinuteAppearanceCount: 0, playerMatchMinutes: 0, timeLossInjuryCount: 0 },
  };
}

function availabilityAgeGroup(age: number): AvailabilityAgeGroup {
  if (age < 24) return "under_24";
  if (age < 30) return "24_29";
  if (age < 33) return "30_32";
  return "33_plus";
}

function availabilityConsequenceMismatchCount(
  consequences: readonly NonNullable<SimulateSeasonResult["playerAvailabilityConsequences"]>[number][],
  events: readonly SimulatedMatchEvent[],
  playerIds: ReadonlySet<string>,
): number {
  const incidentEvents = events.filter((event) =>
    event.type === "injury"
    || event.type === "red_card"
    || event.type === "second_yellow_card"
    || event.type === "yellow_card"
  );
  const consequenceMatchesEvent = (consequence: typeof consequences[number]): boolean => {
    if (!playerIds.has(consequence.playerId)) return false;
    if (consequence.type === "injury") {
      return incidentEvents.some((event) => event.type === "injury" && event.playerId === consequence.playerId);
    }
    const expectedEvent = consequence.reason === "straight_red"
      ? "red_card"
      : consequence.reason === "second_yellow"
        ? "second_yellow_card"
        : "yellow_card";
    return incidentEvents.some((event) => event.type === expectedEvent && event.playerId === consequence.playerId);
  };
  const missingInjuryConsequences = new Set(
    incidentEvents.filter((event) => event.type === "injury").map((event) => event.playerId),
  );
  const missingDismissalConsequences = incidentEvents.filter((event) =>
    (event.type === "red_card" || event.type === "second_yellow_card")
    && !consequences.some((consequence) => consequence.type === "suspension"
      && consequence.playerId === event.playerId
      && consequence.reason === (event.type === "red_card" ? "straight_red" : "second_yellow"))
  ).length;
  for (const consequence of consequences) {
    if (consequence.type === "injury") missingInjuryConsequences.delete(consequence.playerId);
  }
  return consequences.filter((consequence) => !consequenceMatchesEvent(consequence)).length
    + missingInjuryConsequences.size
    + missingDismissalConsequences;
}

function requiredSubstitutionMinuteFacts(world: CareerWorldProjection): SubstitutionMinuteWorldFacts {
  if (world.substitutionMinutes === undefined) {
    throw new Error(`Career world ${world.seed} omitted substitution-minute facts`);
  }
  return world.substitutionMinutes;
}

function divisionByClubId(careerState: CliCareerState): Readonly<Record<string, 1 | 2 | 3>> {
  return Object.fromEntries(careerState.gameState.clubIds.map((clubId) => {
    const category = careerState.gameState.clubs[clubId]?.category;
    if (category === undefined) throw new Error(`Renewal funnel club is missing: ${clubId}`);
    return [String(clubId), category === "first_division" ? 1 : category === "second_division" ? 2 : 3];
  }));
}

function renewalPopulationSnapshot(
  seasonNumber: number,
  careerState: CliCareerState,
): RenewalPopulationSnapshot {
  const rows = careerState.gameState.clubIds.flatMap((clubId) => {
    const club = careerState.gameState.clubs[clubId];
    if (club === undefined) throw new Error(`Renewal signature club is missing: ${clubId}`);
    return club.playerIds.map((playerId) => {
      const player = careerState.gameState.players[playerId];
      if (player?.primaryRole === undefined) {
        throw new Error(`Renewal signature player role is missing: ${playerId}`);
      }
      const ability = summarizePlayerDevelopmentAbilities(player);
      return {
        playerId: String(playerId),
        clubId: String(clubId),
        role: player.primaryRole,
        currentAbility: ability.currentAbility,
        potentialAbility: ability.potentialAbility,
      };
    });
  }).sort((left, right) =>
    left.playerId.localeCompare(right.playerId) || left.clubId.localeCompare(right.clubId));
  return { seasonNumber, rows };
}

function renewalPopulationSignature(
  snapshot: RenewalPopulationSnapshot,
  architecture: GenerationalRenewalArchitectureFacts,
): RenewalPopulationSeasonSignature {
  const originByPlayerId = new Map(
    architecture.playerOrigins.map(({ playerId, origin }) => [playerId, origin]),
  );
  const payload = snapshot.rows.map((row) => {
    const origin = originByPlayerId.get(row.playerId);
    if (origin === undefined) throw new Error(`Renewal signature origin is missing: ${row.playerId}`);
    return [
      row.playerId,
      row.clubId,
      origin,
      row.role,
      row.currentAbility,
      row.potentialAbility,
    ];
  });
  return {
    seasonNumber: snapshot.seasonNumber,
    playerCount: payload.length,
    sha256: createHash("sha256").update(JSON.stringify(payload)).digest("hex"),
  };
}

function playerRoleById(
  before: CliCareerState,
  after: CliCareerState,
): Readonly<Record<string, NonNullable<CliPlayer["primaryRole"]>>> {
  return Object.fromEntries([...new Set([
    ...before.gameState.playerIds,
    ...after.gameState.playerIds,
  ])].flatMap((playerId) => {
    const role = after.gameState.players[playerId]?.primaryRole
      ?? before.gameState.players[playerId]?.primaryRole;
    return role === undefined ? [] : [[String(playerId), role]];
  }));
}

function mutableRoleAwareMarketWorldFacts(
  worldSeed: string,
): MutableRoleAwareMarketWorldFacts {
  return {
    worldSeed,
    departmentNeedEvaluatedCount: 0,
    roleNeedEvaluatedCount: 0,
    roleNeedRecruitableCount: 0,
    roleTargetFoundCount: 0,
    roleTargetMismatchCount: 0,
    targetPlayerMissingCount: 0,
  };
}

function observeRoleAwareMarketFacts(
  facts: MutableRoleAwareMarketWorldFacts,
  careerState: CliCareerState,
  diagnostics: readonly AiMarketDiagnosticFact[],
): void {
  for (const diagnostic of diagnostics) {
    if (diagnostic.event === "need_evaluated") {
      if (diagnostic.target.kind === "department") {
        facts.departmentNeedEvaluatedCount += diagnostic.count;
      } else {
        facts.roleNeedEvaluatedCount += diagnostic.count;
      }
    }
    if (
      diagnostic.target.kind === "role"
      && diagnostic.event === "need_recruitable"
    ) facts.roleNeedRecruitableCount += diagnostic.count;
    if (
      diagnostic.target.kind !== "role"
      || diagnostic.event !== "permanent_target_found"
    ) continue;
    facts.roleTargetFoundCount += diagnostic.count;
    if (diagnostic.playerId === undefined) {
      facts.targetPlayerMissingCount += diagnostic.count;
      continue;
    }
    const player = careerState.gameState.players[diagnostic.playerId];
    if (player === undefined) {
      facts.targetPlayerMissingCount += diagnostic.count;
    } else if (player.primaryRole !== diagnostic.target.role) {
      facts.roleTargetMismatchCount += diagnostic.count;
    }
  }
}

function requiredRoleAwareMarketFacts(world: CareerWorldProjection): RoleAwareMarketWorldFacts {
  if (world.marketTargeting === undefined) {
    throw new Error(`Career world ${world.seed} omitted role-aware market facts`);
  }
  return world.marketTargeting;
}

function requiredAvailabilityAgingFacts(world: CareerWorldProjection): AvailabilityAgingWorldFacts {
  if (world.availabilityAging === undefined) {
    throw new Error(`Career world ${world.seed} omitted availability-aging facts`);
  }
  return world.availabilityAging;
}

function requiredStandingsHierarchyFacts(world: CareerWorldProjection): StandingsHierarchyWorldFacts {
  if (world.standingsHierarchy === undefined) {
    throw new Error(`Career world ${world.seed} omitted standings-hierarchy facts`);
  }
  return world.standingsHierarchy;
}

function requiredOwnerAttributionFacts(world: CareerWorldProjection): OwnerAttributionWorldFacts {
  if (world.ownerAttribution === undefined) {
    throw new Error(`Career world ${world.seed} omitted owner-attribution facts`);
  }
  return world.ownerAttribution;
}

function requiredRenewalArchitectureFacts(
  world: CareerWorldProjection,
): GenerationalRenewalArchitectureFacts {
  if (world.renewalArchitecture === undefined) {
    throw new Error(`Career world ${world.seed} omitted renewal-architecture facts`);
  }
  return world.renewalArchitecture;
}

function requiredLeagueDiversityFacts(world: CareerWorldProjection): LeagueDiversityWorldFacts {
  if (world.leagueDiversity === undefined) {
    throw new Error(`Career world ${world.seed} omitted league-diversity facts`);
  }
  return world.leagueDiversity;
}

function requiredGenerationalSuccessionFacts(
  world: CareerWorldProjection,
): GenerationalSuccessionWorldFacts {
  const value = world.sections.development as GenerationalSuccessionWorldFacts | undefined;
  if (value === undefined || value.worldSeed !== world.seed || !Array.isArray(value.rows)) {
    throw new Error(`Career world ${world.seed} omitted generational-succession facts`);
  }
  return value;
}

/** Applies every L5 owner to the same already-played career worlds. */
function evaluateIntegratedPlayerWorldCheckpoint(
  worlds: readonly CareerWorldProjection[],
): IntegratedPlayerWorldCheckpointDecision {
  const leagueWorlds = worlds.map((world) => {
    if (world.leagueDiversity === undefined) {
      throw new Error(`Career world ${world.seed} omitted league-diversity facts`);
    }
    return world.leagueDiversity;
  });
  const substitutionWorlds = worlds.map(requiredSubstitutionMinuteFacts);
  const availabilityWorlds = worlds.map(requiredAvailabilityAgingFacts);
  const generationalWorlds = worlds.map(requiredGenerationalSuccessionFacts);
  const leagueDiversity = evaluateLeagueDiversityCheckpoint(leagueWorlds);
  const availabilityAging = evaluateAvailabilityAgingCheckpoint(
    availabilityWorlds,
    substitutionWorlds,
    leagueWorlds,
    createRecoveryMatrixFacts(),
  );
  const developmentRenewal = evaluateDevelopmentRenewalCheckpoint(generationalWorlds);
  const age = evaluateIntegratedLeaderboardAgeGates(
    worlds.flatMap(playerLeaderboardAgeFacts),
  );
  const identicalStartingXiAllFixturesClubCount = leagueWorlds.reduce(
    (sum, world) => sum + world.seasons.reduce(
      (worldSum, season) => worldSum + season.identicalStartingXiAllFixturesClubCount,
      0,
    ),
    0,
  );
  const failedGateKeys = [
    ...leagueDiversity.opening.failed.map((key) => `formation_opening:${key}`),
    ...leagueDiversity.longitudinal.failed.map((key) => `formation:${key}`),
    // `carried_formation` is the same fact the two formation lanes above
    // already roll up; keeping the availability copy would double-count one
    // failure. This is dedup, not suppression: the gate still fires above.
    ...availabilityAging.failed
      .filter((key) => key !== "carried_formation")
      .map((key) => `availability:${key}`),
    // Every nested development failure rolls up unfiltered: superseded gates
    // never enter `failedGateKeys` at their source, so a key that reaches this
    // point is a real failure by construction.
    ...developmentRenewal.failedGateKeys.map((key) => `development:${key}`),
    ...age.failedGateKeys,
    ...(identicalStartingXiAllFixturesClubCount > 0 ? ["minutes:identical_starting_xi"] : []),
  ];

  return {
    decision: failedGateKeys.length === 0 ? "GO" : "REFINE",
    failedGateKeys,
    supersededGateKeys: developmentRenewal.supersededGateKeys.map(({ key, supersededBy }) => ({
      key: `development:${key}`,
      supersededBy,
    })),
    leagueDiversity,
    availabilityAging,
    developmentRenewal,
    identicalStartingXiAllFixturesClubCount,
    scorer33PlusShareSeasons8To10: age.scorer33PlusShareSeasons8To10,
    assist33PlusShareSeasons8To10: age.assist33PlusShareSeasons8To10,
    scorerMeanAgeDrift: age.scorerMeanAgeDrift,
    assistMeanAgeDrift: age.assistMeanAgeDrift,
    retained33PlusLeaderFullSeasonShare: age.retained33PlusLeaderFullSeasonShare,
    exceptional33PlusLeaderObservationCount: age.exceptional33PlusLeaderObservationCount,
  };
}

/** Applies the frozen L5.4 owner responses to one canonical fresh population. */
function evaluateIntegratedPlayerWorldL5_4Checkpoint(
  worlds: readonly CareerWorldProjection[],
  seasonCount: number,
) {
  const leagueWorlds = worlds.map(requiredLeagueDiversityFacts);
  const availabilityWorlds = worlds.map(requiredAvailabilityAgingFacts);
  const generationalWorlds = worlds.map(requiredGenerationalSuccessionFacts);
  const ownerWorlds = worlds.map(requiredOwnerAttributionFacts);
  const integrated = evaluateIntegratedPlayerWorldCheckpoint(worlds);
  const leagueDiversity = integrated.leagueDiversity;
  const playerRenewal = evaluatePlayerRenewalLeadersCheckpoint({
    worlds: ownerWorlds,
    generationalWorlds,
    replicatedFormationRetentionShare:
      leagueDiversity.longitudinal.fourReplicatedFormationRetentionShare,
  });
  const renewalArchitecture = evaluateRenewalArchitectureCheckpoint({
    ownerWorlds,
    generationalWorlds,
    architectureWorlds: worlds.map(requiredRenewalArchitectureFacts),
  });
  const standingsHierarchy = evaluateStandingsHierarchyCheckpoint(
    worlds.map(requiredStandingsHierarchyFacts),
    leagueWorlds,
    availabilityWorlds,
    seasonCount,
  );
  const marketTargeting = worlds.map(requiredRoleAwareMarketFacts).reduce(
    (sum, world) => ({
      departmentNeedEvaluatedCount:
        sum.departmentNeedEvaluatedCount + world.departmentNeedEvaluatedCount,
      roleNeedEvaluatedCount: sum.roleNeedEvaluatedCount + world.roleNeedEvaluatedCount,
      roleNeedRecruitableCount:
        sum.roleNeedRecruitableCount + world.roleNeedRecruitableCount,
      roleTargetFoundCount: sum.roleTargetFoundCount + world.roleTargetFoundCount,
      roleTargetMismatchCount:
        sum.roleTargetMismatchCount + world.roleTargetMismatchCount,
      targetPlayerMissingCount:
        sum.targetPlayerMissingCount + world.targetPlayerMissingCount,
    }),
    {
      departmentNeedEvaluatedCount: 0,
      roleNeedEvaluatedCount: 0,
      roleNeedRecruitableCount: 0,
      roleTargetFoundCount: 0,
      roleTargetMismatchCount: 0,
      targetPlayerMissingCount: 0,
    },
  );
  const architectureFailures = [
    ...(!atLeastObserved(renewalArchitecture.localReplacementCapacity, 0.20)
      ? ["architecture:local_replacement_capacity"] : []),
    ...(!atLeastObserved(renewalArchitecture.divisionReplacementCapacity, 0.50)
      ? ["architecture:division_replacement_capacity"] : []),
    ...(renewalArchitecture.worldsMeetingMatureAcademyParity < 6
      ? ["architecture:academy_parity"] : []),
    ...(!atLeastObserved(renewalArchitecture.annualAcademyMaterialMinuteShare, 0.75)
      ? ["architecture:academy_material_minutes"] : []),
    ...(renewalArchitecture.reconciliationFailureCount > 0
      ? ["architecture:reconciliation"] : []),
  ];
  const marketFailures = [
    ...(marketTargeting.departmentNeedEvaluatedCount <= 0
      ? ["market:department_need_reachability"] : []),
    ...(marketTargeting.roleNeedEvaluatedCount <= 0
      ? ["market:role_need_reachability"] : []),
    ...(marketTargeting.roleNeedRecruitableCount <= 0
      ? ["market:role_recruitable_reachability"] : []),
    ...(marketTargeting.roleTargetFoundCount <= 0
      ? ["market:exact_role_target_reachability"] : []),
    ...(marketTargeting.roleTargetMismatchCount > 0
      ? ["market:role_target_mismatch"] : []),
    ...(marketTargeting.targetPlayerMissingCount > 0
      ? ["market:target_player_reconciliation"] : []),
  ];
  const failedGateKeys = [
    ...integrated.failedGateKeys.map((key) => `integrated:${key}`),
    ...playerRenewal.failedGateKeys.map((key) => `players:${key}`),
    ...architectureFailures,
    ...marketFailures,
    ...(standingsHierarchy.decision === "GO"
      ? []
      : [`standings:${standingsHierarchy.decision.toLowerCase()}`]),
  ];
  return {
    decision: failedGateKeys.length === 0 ? "GO" as const : "REFINE" as const,
    failedGateKeys,
    supersededGateKeys: integrated.supersededGateKeys.map(({ key, supersededBy }) => ({
      key: `integrated:${key}`,
      supersededBy,
    })),
    integrated,
    playerRenewal,
    renewalArchitecture,
    standingsHierarchy,
    marketTargeting,
  };
}

/** Produces one fresh L6.1 arm without interpreting contrasts it cannot see. */
function evaluateRenewalAblationArmCheckpoint(
  worlds: readonly CareerWorldProjection[],
  seasonCount: number,
  arm: RenewalAblationArm,
) {
  const armFacts: RenewalAblationArmFacts = {
    arm,
    values: renewalAblationMetricValues(worlds, seasonCount),
    worlds: worlds.map((world): RenewalAblationMetricRow => ({
      worldSeed: world.seed,
      values: renewalAblationMetricValues([world], seasonCount),
    })),
    populationSignatures: worlds.map((world) => ({
      worldSeed: world.seed,
      seasons: world.renewalPopulationSignatures ?? [],
    })),
  };
  const episodes = worlds.flatMap((world) => {
    if (world.renewalNeedEpisodes === undefined) {
      throw new Error(`L6.1 world omitted renewal-need episodes: ${world.seed}`);
    }
    return world.renewalNeedEpisodes;
  });
  const funnel = evaluateRenewalNeedFunnel(episodes);
  const leagueDiversity = evaluateLeagueDiversityCheckpoint(
    worlds.map(requiredLeagueDiversityFacts),
  );
  const playerUse = evaluatePlayerRenewalLeadersCheckpoint({
    worlds: worlds.map(requiredOwnerAttributionFacts),
    generationalWorlds: worlds.map(requiredGenerationalSuccessionFacts),
    replicatedFormationRetentionShare:
      leagueDiversity.longitudinal.fourReplicatedFormationRetentionShare,
  }).players;
  const combinedReplay = arm === "combined"
    ? evaluateIntegratedPlayerWorldL5_4Checkpoint(worlds, seasonCount)
    : undefined;
  const reconciliationFailureCount = funnel.reconciliationFailureCount
    + worlds.reduce(
      (sum, world) => sum + requiredOwnerAttributionFacts(world).reconciliationFailureCount,
      0,
    );
  return {
    decision: reconciliationFailureCount === 0 ? "GO" as const : "REFINE" as const,
    armFacts,
    funnel,
    playerUse: {
      appearanceShare: playerUse.appearanceShare,
      distinctUsersPerClubSeason: playerUse.distinctUsersPerClubSeason,
    },
    reconciliationFailureCount,
    ...(combinedReplay === undefined ? {} : { combinedReplay }),
  };
}

function renewalAblationMetricValues(
  worlds: readonly CareerWorldProjection[],
  seasonCount: number,
): Readonly<Record<RenewalAblationMetric, number>> {
  const leagueWorlds = worlds.map(requiredLeagueDiversityFacts);
  const ownerWorlds = worlds.map(requiredOwnerAttributionFacts);
  const generationalWorlds = worlds.map(requiredGenerationalSuccessionFacts);
  const renewal = evaluateRenewalArchitectureCheckpoint({
    ownerWorlds,
    generationalWorlds,
    architectureWorlds: worlds.map(requiredRenewalArchitectureFacts),
  });
  const league = evaluateLeagueDiversityCheckpoint(leagueWorlds);
  const players = evaluatePlayerRenewalLeadersCheckpoint({
    worlds: ownerWorlds,
    generationalWorlds,
    replicatedFormationRetentionShare:
      league.longitudinal.fourReplicatedFormationRetentionShare,
  });
  const standings = evaluateStandingsHierarchyCheckpoint(
    worlds.map(requiredStandingsHierarchyFacts),
    leagueWorlds,
    worlds.map(requiredAvailabilityAgingFacts),
    seasonCount,
  );
  const firstDivision = standings.divisions.find(({ divisionLevel }) => divisionLevel === 1);
  if (firstDivision === undefined) throw new Error("L6.1 omitted First-Division standings");
  return {
    localReplacementCapacity: requiredObservedMetric(
      renewal.localReplacementCapacity,
      "localReplacementCapacity",
    ),
    divisionReplacementCapacity: requiredObservedMetric(
      renewal.divisionReplacementCapacity,
      "divisionReplacementCapacity",
    ),
    fourReplicatedFormationRetentionShare:
      league.longitudinal.fourReplicatedFormationRetentionShare,
    careerGeneratedLeaderShareSeasonTen: requiredObservedMetric(
      players.players.careerGeneratedLeaderShareSeasonTen,
      "careerGeneratedLeaderShareSeasonTen",
    ),
    championPoints: firstDivision.championPoints,
  };
}

function requiredObservedMetric(
  value: number | "not_observed",
  key: RenewalAblationMetric,
): number {
  if (value === "not_observed") throw new Error(`L6.1 metric is not observed: ${key}`);
  return value;
}

/** Evaluates only preregistered age/minute bands over canonical top-ten rows. */
export function evaluateIntegratedLeaderboardAgeGates(
  rows: readonly IntegratedLeaderboardAgeFact[],
): IntegratedLeaderboardAgeDecision {
  const late = rows.filter(({ seasonNumber }) => seasonNumber >= 8 && seasonNumber <= 10);
  const scorerLate = late.filter(({ table }) => table === "scorers");
  const assistLate = late.filter(({ table }) => table === "assists");
  const scorer33PlusShareSeasons8To10 = observedRatio(
    scorerLate.filter(({ age }) => age >= 33).length,
    scorerLate.length,
  );
  const assist33PlusShareSeasons8To10 = observedRatio(
    assistLate.filter(({ age }) => age >= 33).length,
    assistLate.length,
  );
  const scorerMeanAgeDrift = meanAgeDrift(rows, "scorers");
  const assistMeanAgeDrift = meanAgeDrift(rows, "assists");
  const retained33Plus = late.filter(({ age }) => age >= 33);
  const retained33PlusLeaderFullSeasonShare = observedRatio(
    retained33Plus.filter(({ appearances }) => appearances === 34).length,
    retained33Plus.length,
  );
  const exceptional33PlusLeaderObservationCount = retained33Plus.length;
  const failedGateKeys = [
    ...(!atMostObserved(scorer33PlusShareSeasons8To10, 0.25)
      ? ["age:scorer_33_plus_share"] : []),
    ...(!atMostObserved(assist33PlusShareSeasons8To10, 0.25)
      ? ["age:assist_33_plus_share"] : []),
    ...(!atMostObserved(scorerMeanAgeDrift, INTEGRATED_LEADER_AGE_DRIFT_TARGET.max)
      ? ["age:scorer_mean_age_drift"] : []),
    ...(!atMostObserved(assistMeanAgeDrift, INTEGRATED_LEADER_AGE_DRIFT_TARGET.max)
      ? ["age:assist_mean_age_drift"] : []),
    ...(!atMostObserved(retained33PlusLeaderFullSeasonShare, 0.5)
      ? ["minutes:retained_33_plus_full_season_share"] : []),
  ];
  return {
    scorer33PlusShareSeasons8To10,
    assist33PlusShareSeasons8To10,
    scorerMeanAgeDrift,
    assistMeanAgeDrift,
    retained33PlusLeaderFullSeasonShare,
    exceptional33PlusLeaderObservationCount,
    failedGateKeys,
  };
}

function playerLeaderboardAgeFacts(world: CareerWorldProjection): readonly IntegratedLeaderboardAgeFact[] {
  const root = unknownRecord(world.sections.players);
  const seasons = root === undefined ? undefined : unknownArray(root.seasons);
  if (seasons === undefined) throw new Error(`Career world ${world.seed} omitted player seasons`);
  return seasons.flatMap((seasonValue) => {
    const season = unknownRecord(seasonValue);
    const seasonNumber = season?.seasonNumber;
    const competitions = season === undefined ? undefined : unknownArray(season.competitions);
    if (typeof seasonNumber !== "number" || competitions === undefined) {
      throw new Error(`Career world ${world.seed} has malformed player season`);
    }
    return competitions.flatMap((competitionValue) => {
      const competition = unknownRecord(competitionValue);
      if (competition === undefined) {
        throw new Error(`Career world ${world.seed} has malformed player competition`);
      }
      return [
        ...leaderboardAgeFacts(world.seed, seasonNumber, "scorers", competition.topScorers),
        ...leaderboardAgeFacts(world.seed, seasonNumber, "assists", competition.topAssists),
      ];
    });
  });
}

function leaderboardAgeFacts(
  worldSeed: string,
  seasonNumber: number,
  table: IntegratedLeaderboardAgeFact["table"],
  value: unknown,
): readonly IntegratedLeaderboardAgeFact[] {
  const rows = unknownArray(value);
  if (rows === undefined || rows.length === 0) {
    throw new Error(`Career world ${worldSeed} omitted ${table} leaderboard rows`);
  }
  return rows.map((rowValue) => {
    const row = unknownRecord(rowValue);
    if (typeof row?.age !== "number" || typeof row.appearances !== "number") {
      throw new Error(`Career world ${worldSeed} has malformed ${table} leaderboard row`);
    }
    return { seasonNumber, table, age: row.age, appearances: row.appearances };
  });
}

function meanAgeDrift(
  rows: readonly IntegratedLeaderboardAgeFact[],
  table: IntegratedLeaderboardAgeFact["table"],
): number | "not_observed" {
  const early = rows.filter((row) => row.table === table && row.seasonNumber <= 2);
  const late = rows.filter((row) => row.table === table && row.seasonNumber >= 9);
  if (early.length === 0 || late.length === 0) return "not_observed";
  return Math.abs(
    late.reduce((sum, { age }) => sum + age, 0) / late.length
      - early.reduce((sum, { age }) => sum + age, 0) / early.length,
  );
}

function observedRatio(numerator: number, denominator: number): number | "not_observed" {
  return denominator === 0 ? "not_observed" : numerator / denominator;
}

function atMostObserved(value: number | "not_observed", maximum: number): boolean {
  return value !== "not_observed" && value <= maximum;
}

function atLeastObserved(value: number | "not_observed", minimum: number): boolean {
  return value !== "not_observed" && value >= minimum;
}

/** Applies the frozen L2 structural and descriptive bands. */
export function evaluateSubstitutionMinuteCheckpoint(
  worlds: readonly SubstitutionMinuteWorldFacts[],
  carriedWorlds: readonly LeagueDiversityWorldFacts[],
): SubstitutionMinuteCheckpointDecision {
  const rows = worlds.flatMap(({ teamMatches }) => teamMatches);
  if (rows.length === 0) throw new Error("Substitution-minute checkpoint has no team-match rows");
  const firstMinutes = rows.flatMap(({ firstSubstitutionMinute }) =>
    firstSubstitutionMinute === "not_observed" ? [] : [firstSubstitutionMinute]
  ).sort((left, right) => left - right);
  const meanSubstitutionsPerTeamMatch = rows.reduce(
    (total, { substitutionCount }) => total + substitutionCount,
    0,
  ) / rows.length;
  const medianFirstSubstitutionMinute = median(firstMinutes);
  let minimumSubstitutionCount = Number.POSITIVE_INFINITY;
  let maximumSubstitutionCount = Number.NEGATIVE_INFINITY;
  for (const { substitutionCount } of rows) {
    minimumSubstitutionCount = Math.min(minimumSubstitutionCount, substitutionCount);
    maximumSubstitutionCount = Math.max(maximumSubstitutionCount, substitutionCount);
  }
  const reconciliationFailureCount = rows.reduce(
    (total, row) => total + row.reconciliationFailureCount,
    0,
  );
  const limitViolationCount = rows.filter((row) =>
    row.substitutionCount > row.maximumSubstitutions
    || (row.substitutionWindowLimit !== null
      && row.substitutionWindowCount > row.substitutionWindowLimit)
  ).length;
  const controlledSideFailureCount = rows.filter((row) =>
    row.automaticDecisionCount === 0).length;
  const invalidMinuteCount = rows.reduce((total, row) => total + row.invalidMinuteCount, 0);
  const automaticDecisionReasonCounts = sumAiDecisionReasonCounts(
    rows.map(({ automaticDecisionReasonCounts }) => automaticDecisionReasonCounts),
  );
  const automaticReplacementFailureCounts = sumAiReplacementFailureCounts(
    rows.map(({ automaticReplacementFailureCounts }) => automaticReplacementFailureCounts),
  );
  const carriedLeagueDiversityDecision = evaluateLeagueDiversityCheckpoint(carriedWorlds).decision;
  const failed = [
    ...(reconciliationFailureCount > 0 ? ["reconciliation"] : []),
    ...(limitViolationCount > 0 ? ["competition_limits"] : []),
    ...(controlledSideFailureCount > 0 ? ["both_automatic_sides"] : []),
    ...(meanSubstitutionsPerTeamMatch < 3.5 || meanSubstitutionsPerTeamMatch > 4.9
      ? ["mean_substitutions_per_team_match"]
      : []),
    ...(medianFirstSubstitutionMinute === "not_observed"
      || medianFirstSubstitutionMinute < 50
      || medianFirstSubstitutionMinute > 70
      ? ["median_first_substitution_minute"]
      : []),
    ...(!(minimumSubstitutionCount < 5 && maximumSubstitutionCount === 5)
      ? ["substitution_policy_non_mechanical"]
      : []),
    ...(invalidMinuteCount > 0 ? ["minute_bounds"] : []),
    ...(carriedLeagueDiversityDecision === "REFINE" ? ["carried_league_diversity"] : []),
  ];
  return {
    decision: failed.length === 0 ? "GO" : "REFINE",
    teamMatchCount: rows.length,
    meanSubstitutionsPerTeamMatch,
    medianFirstSubstitutionMinute,
    minimumSubstitutionCount,
    maximumSubstitutionCount,
    reconciliationFailureCount,
    limitViolationCount,
    controlledSideFailureCount,
    invalidMinuteCount,
    automaticDecisionReasonCounts,
    automaticReplacementFailureCounts,
    carriedLeagueDiversityDecision,
    failed,
  };
}

/** Sums the exact reason maps emitted by automatic progression. */
function sumAiDecisionReasonCounts(
  rows: readonly Readonly<Record<AiInGameDecisionReasonKey, number>>[],
): Readonly<Record<AiInGameDecisionReasonKey, number>> {
  const totals = {
    forced_injury_replacement: 0,
    dismissal_reorganization: 0,
    low_condition: 0,
    poor_performance: 0,
    trailing_response: 0,
    protecting_lead: 0,
    no_legal_substitute: 0,
    no_material_change: 0,
    command_rejected: 0,
  } satisfies Record<AiInGameDecisionReasonKey, number>;
  for (const row of rows) {
    for (const reasonKey of Object.keys(totals) as AiInGameDecisionReasonKey[]) {
      totals[reasonKey] += row[reasonKey];
    }
  }
  return totals;
}

/** Sums replacement-funnel failures without reconstructing them from final lineups. */
function sumAiReplacementFailureCounts(
  rows: readonly Readonly<Record<AiInGameReplacementFailureKey, number>>[],
): Readonly<Record<AiInGameReplacementFailureKey, number>> {
  const totals = {
    substitution_limit: 0,
    no_available_bench: 0,
    no_positionally_credible_bench: 0,
    quality_floor: 0,
  } satisfies Record<AiInGameReplacementFailureKey, number>;
  for (const row of rows) {
    for (const failureKey of Object.keys(totals) as AiInGameReplacementFailureKey[]) {
      totals[failureKey] += row[failureKey];
    }
  }
  return totals;
}

/** Applies the frozen L3 recovery, availability, injury and carried L2 gates. */
export function evaluateAvailabilityAgingCheckpoint(
  worlds: readonly AvailabilityAgingWorldFacts[],
  substitutionWorlds: readonly SubstitutionMinuteWorldFacts[],
  carriedWorlds: readonly LeagueDiversityWorldFacts[],
  recoveryMatrixWorlds: readonly RecoveryMatrixWorldFact[],
): AvailabilityAgingCheckpointDecision {
  const rows = worlds.flatMap(({ teamMatches }) => teamMatches);
  if (rows.length === 0) throw new Error("Availability-aging checkpoint has no team-match rows");
  const playerMatchMinutes = rows.reduce((total, row) => total + row.playerMatchMinutes, 0);
  const playerMatchHours = playerMatchMinutes / 60;
  const timeLossInjuryCount = rows.reduce((total, row) => total + row.timeLossInjuryCount, 0);
  const injuryRate = timeLossInjuryCount / playerMatchHours * 1_000;
  const unavailableSelectedPlayerCount = rows.reduce(
    (total, row) => total + row.unavailableSelectedPlayerCount,
    0,
  );
  const lifecycleDiagnosticMissingCount = rows.reduce(
    (total, row) => total + row.lifecycleDiagnosticMissingCount,
    0,
  );
  const consequenceMismatchCount = rows.reduce(
    (total, row) => total + row.consequenceMismatchCount,
    0,
  );
  const ageGroups = Object.fromEntries(AVAILABILITY_AGE_GROUPS.map((group) => {
    const facts = rows.map((row) => row.ageGroups[group]);
    const minutes = facts.reduce((total, fact) => total + fact.playerMatchMinutes, 0);
    return [group, {
      positiveMinuteAppearanceCount: facts.reduce(
        (total, fact) => total + fact.positiveMinuteAppearanceCount,
        0,
      ),
      playerMatchHours: minutes / 60,
      timeLossInjuryCount: facts.reduce((total, fact) => total + fact.timeLossInjuryCount, 0),
    }];
  })) as Record<AvailabilityAgeGroup, {
    positiveMinuteAppearanceCount: number;
    playerMatchHours: number;
    timeLossInjuryCount: number;
  }>;
  const worldsWithRecentUseCount = worlds.filter((world) =>
    world.teamMatches.some(({ recentUsePlayerCount }) => recentUsePlayerCount > 0)).length;
  const worldsWithTimeLossInjuryCount = worlds.filter((world) =>
    world.teamMatches.some(({ timeLossInjuryCount: count }) => count > 0)).length;
  const controlledBoundsHeld = recoveryMatrixWorlds.length === 14
    && recoveryMatrixWorlds.filter(({ cohort }) => cohort === "curve_selection").length === 7
    && recoveryMatrixWorlds.filter(({ cohort }) => cohort === "fresh_validation").length === 7
    && recoveryMatrixWorlds.every(({ controlledBoundsHeld: held }) => held);
  const veteranHalfLives = recoveryMatrixWorlds.flatMap(({ bestVeteranHalfLifeDays }) =>
    bestVeteranHalfLifeDays === "not_observed" ? [] : [bestVeteranHalfLifeDays]
  );
  const worstVeteranHalfLives = recoveryMatrixWorlds.flatMap(({ worstVeteranHalfLifeDays }) =>
    worstVeteranHalfLifeDays === "not_observed" ? [] : [worstVeteranHalfLifeDays]
  );
  const generatedVeteranResilienceSpreadHeld = veteranHalfLives.length > 0
    && worstVeteranHalfLives.length > 0
    && Math.min(...veteranHalfLives) < Math.max(...worstVeteranHalfLives);
  const carriedSubstitutionMinuteDecision = evaluateSubstitutionMinuteCheckpoint(
    substitutionWorlds,
    carriedWorlds,
  );
  const carriedLeagueDiversityDecision = evaluateLeagueDiversityCheckpoint(carriedWorlds);
  const carriedSubstitutionFailures = carriedSubstitutionMinuteDecision.failed.filter(
    (failure) => failure !== "carried_league_diversity",
  );
  const substitutionRows = substitutionWorlds.flatMap(({ teamMatches }) => teamMatches);
  const substitutionSeasonNumbers = [...new Set(substitutionRows.map(({ seasonNumber }) => seasonNumber))]
    .sort((left, right) => left - right);
  const substitutionBySeason = substitutionSeasonNumbers.map((seasonNumber) => {
    const seasonRows = substitutionRows.filter((row) => row.seasonNumber === seasonNumber);
    return {
      seasonNumber,
      teamMatchCount: seasonRows.length,
      meanSubstitutionsPerTeamMatch: seasonRows.reduce(
        (total, { substitutionCount }) => total + substitutionCount,
        0,
      ) / seasonRows.length,
    };
  });
  const failed = [
    ...(worlds.length !== 7 ? ["world_population"] : []),
    ...(unavailableSelectedPlayerCount > 0 ? ["unavailable_selected_players"] : []),
    ...(lifecycleDiagnosticMissingCount > 0 ? ["lifecycle_diagnostics"] : []),
    ...(consequenceMismatchCount > 0 ? ["availability_consequence_reconciliation"] : []),
    ...(worldsWithRecentUseCount !== 7 ? ["recent_use_reachability"] : []),
    ...(worldsWithTimeLossInjuryCount !== 7 ? ["time_loss_injury_world_reachability"] : []),
    ...(injuryRate < 20 || injuryRate > 50 ? ["time_loss_injury_rate"] : []),
    ...AVAILABILITY_AGE_GROUPS.flatMap((group) => {
      const facts = ageGroups[group];
      return facts.timeLossInjuryCount === 0
        || facts.timeLossInjuryCount >= facts.positiveMinuteAppearanceCount
        ? [`age_group_injury_reachability:${group}`]
        : [];
    }),
    ...(!controlledBoundsHeld ? ["recovery_controlled_bounds"] : []),
    ...(!generatedVeteranResilienceSpreadHeld ? ["generated_veteran_resilience_spread"] : []),
    ...(carriedSubstitutionFailures.length > 0 ? ["carried_substitution_minutes"] : []),
    ...(carriedLeagueDiversityDecision.longitudinal.failed.length > 0 ? ["carried_formation"] : []),
  ];
  return {
    decision: failed.length === 0 ? "GO" : "REFINE",
    teamMatchCount: rows.length,
    playerMatchHours,
    timeLossInjuryCount,
    timeLossInjuriesPerThousandPlayerMatchHours: injuryRate,
    worldsWithRecentUseCount,
    worldsWithTimeLossInjuryCount,
    unavailableSelectedPlayerCount,
    lifecycleDiagnosticMissingCount,
    consequenceMismatchCount,
    ageGroups,
    recoveryMatrix: {
      worlds: recoveryMatrixWorlds,
      controlledBoundsHeld,
      generatedVeteranResilienceSpreadHeld,
    },
    carriedSubstitutionMinuteDecision,
    carriedLeagueDiversityDecision,
    substitutionBySeason,
    failed,
  };
}

/** Builds both preregistered generated-player recovery matrix populations. */
export function createRecoveryMatrixFacts(): readonly RecoveryMatrixWorldFact[] {
  return [
    ...recoveryMatrixCohort("curve_selection", "phase81a-recovery-reachability"),
    ...recoveryMatrixCohort("fresh_validation", "phase81a-recovery-validation"),
  ];
}

function recoveryMatrixCohort(
  cohort: RecoveryMatrixWorldFact["cohort"],
  seedPrefix: string,
): readonly RecoveryMatrixWorldFact[] {
  return Array.from({ length: 7 }, (_unused, index) => {
    const worldSeed = `${seedPrefix}-${String(index + 1).padStart(2, "0")}`;
    const world = createFakeDomesticWorld({ worldSeed });
    const policy = selectPlayerStateCurvesConfig();
    const outfieldPlayers = world.playerIds.flatMap((playerId) => {
      const player = world.players[playerId];
      return player === undefined || player.naturalPositions.includes("gk") ? [] : [player];
    });
    const neutralTemplate = [...outfieldPlayers].sort((left, right) =>
      Math.abs(recoveryResilience(left, policy) - 10) - Math.abs(recoveryResilience(right, policy) - 10)
      || String(left.id).localeCompare(String(right.id)))[0];
    const highResilienceTemplate = [...outfieldPlayers].sort((left, right) =>
      recoveryResilience(right, policy) - recoveryResilience(left, policy)
      || String(left.id).localeCompare(String(right.id)))[0];
    if (neutralTemplate === undefined || highResilienceTemplate === undefined) {
      throw new Error(`Recovery matrix world has no outfield players: ${worldSeed}`);
    }
    const readiness = (age: number, days: number, highResilience = false): number =>
      recoveredGeneratedPlayerFitness(
        highResilience ? highResilienceTemplate : neutralTemplate,
        age,
        days,
        world.seasonStartDate,
        policy,
      );
    const age24To34DeficitDeltaAfterThreeDays = (100 - readiness(34, 3)) - (100 - readiness(24, 3));
    const ageReadiness = Array.from({ length: 23 }, (_entry, ageIndex) => readiness(18 + ageIndex, 3));
    const maximumAdjacentAgeReadinessDelta = Math.max(...ageReadiness.slice(1).map((value, ageIndex) =>
      Math.abs(value - (ageReadiness[ageIndex] ?? value))));
    const neutralAge24 = readiness(24, 3);
    const age18To29PenaltyCount = Array.from({ length: 12 }, (_entry, ageIndex) => 18 + ageIndex)
      .filter((age) => Math.abs(readiness(age, 3) - neutralAge24) > 1e-9).length;
    const highResilienceAge40ReadinessAfterSevenDays = readiness(40, 7, true);
    const shortRestReadiness = repeatedGeneratedPlayerReadiness(
      neutralTemplate,
      24,
      2,
      world.seasonStartDate,
      policy,
    );
    const weeklyRestReadiness = repeatedGeneratedPlayerReadiness(
      neutralTemplate,
      24,
      7,
      world.seasonStartDate,
      policy,
    );
    const veteranHalfLives = outfieldPlayers.flatMap((player) => {
      const age = completedPlayerAge(player.birthDate, world.seasonStartDate);
      return age >= 33
        ? [recoveryHalfLifeDays(player, world.seasonStartDate, policy)]
        : [];
    });
    return {
      cohort,
      worldSeed,
      age24To34DeficitDeltaAfterThreeDays,
      maximumAdjacentAgeReadinessDelta,
      age18To29PenaltyCount,
      highResilienceAge40ReadinessAfterSevenDays,
      shortRestReadiness,
      weeklyRestReadiness,
      // The old 2..8 deficit and <=1 adjacent-age bands measured recovery
      // alone. Dated match load now deliberately adds an independently tested
      // continuous age cost, so those two values remain diagnostics rather
      // than silently constraining the sum of two policies.
      controlledBoundsHeld: age18To29PenaltyCount === 0
        && highResilienceAge40ReadinessAfterSevenDays >= 88
        && highResilienceAge40ReadinessAfterSevenDays < 95
        && weeklyRestReadiness >= 95
        && shortRestReadiness < weeklyRestReadiness,
      bestVeteranHalfLifeDays: veteranHalfLives.length === 0
        ? "not_observed"
        : Math.min(...veteranHalfLives),
      worstVeteranHalfLifeDays: veteranHalfLives.length === 0
        ? "not_observed"
        : Math.max(...veteranHalfLives),
    };
  });
}

type GeneratedRecoveryPlayer = FakeDomesticWorld["players"][keyof FakeDomesticWorld["players"]];

function recoveredGeneratedPlayerFitness(
  template: GeneratedRecoveryPlayer,
  age: number,
  dayCount: number,
  currentDate: FakeDomesticWorld["seasonStartDate"],
  policy: ReturnType<typeof selectPlayerStateCurvesConfig>,
): number {
  const player = generatedPlayerAtAge(template, age, currentDate);
  const playerStates = {
    [player.id]: { fitness: 100, form: 50, morale: 50 },
  } as unknown as CliCareerState["gameState"]["playerStates"];
  const spent = spendFitnessForMinutes({
    playerStates,
    loads: [{ playerId: player.id, minutes: 90 }],
    players: { [player.id]: player },
    currentDate,
    loadPolicy: policy,
  });
  const recovered = recoverFitnessForPlayers({
    playerStates: spent,
    playerIds: [player.id],
    players: { [player.id]: player },
    currentDate,
    recoveryPolicy: policy,
    dayCount,
  });
  return Number(recovered[player.id]?.fitness);
}

function repeatedGeneratedPlayerReadiness(
  template: GeneratedRecoveryPlayer,
  age: number,
  restDays: number,
  currentDate: FakeDomesticWorld["seasonStartDate"],
  policy: ReturnType<typeof selectPlayerStateCurvesConfig>,
): number {
  const player = generatedPlayerAtAge(template, age, currentDate);
  let playerStates = {
    [player.id]: { fitness: 100, form: 50, morale: 50 },
  } as unknown as CliCareerState["gameState"]["playerStates"];
  for (let match = 0; match < 2; match += 1) {
    playerStates = spendFitnessForMinutes({
      playerStates,
      loads: [{ playerId: player.id, minutes: 90 }],
      players: { [player.id]: player },
      currentDate,
      loadPolicy: policy,
    });
    playerStates = recoverFitnessForPlayers({
      playerStates,
      playerIds: [player.id],
      players: { [player.id]: player },
      currentDate,
      recoveryPolicy: policy,
      dayCount: restDays,
    });
  }
  return Number(playerStates[player.id]?.fitness);
}

function generatedPlayerAtAge(
  player: GeneratedRecoveryPlayer,
  age: number,
  currentDate: FakeDomesticWorld["seasonStartDate"],
): GeneratedRecoveryPlayer {
  return {
    ...player,
    birthDate: (Number(currentDate) - Math.ceil(age * 365.2425)) as GeneratedRecoveryPlayer["birthDate"],
  };
}

function recoveryResilience(
  player: GeneratedRecoveryPlayer,
  policy: ReturnType<typeof selectPlayerStateCurvesConfig>,
): number {
  const weights = policy.resilienceWeightsBasisPoints;
  return (
    Number(player.abilities.physical.stamina) * weights.stamina
    + Number(player.abilities.physical.agility) * weights.agility
    + Number(player.abilities.physical.strength) * weights.strength
  ) / 10_000;
}

function median(values: readonly number[]): number | "not_observed" {
  if (values.length === 0) return "not_observed";
  const middle = Math.floor(values.length / 2);
  const upper = values[middle];
  if (upper === undefined) return "not_observed";
  if (values.length % 2 === 1) return upper;
  const lower = values[middle - 1];
  return lower === undefined ? "not_observed" : (lower + upper) / 2;
}

interface OpeningPopulationProjection {
  readonly seed: string;
  readonly competitions: readonly {
    readonly competitionId: string;
    readonly competitionName: string;
    readonly clubCount: number;
    readonly identityCounts: Readonly<Record<string, number>>;
    readonly identityMismatchCount: number;
    readonly rows: readonly {
      readonly clubId: string;
      readonly clubName: string;
      readonly squadIdentityKey: GeneratedSquadIdentityKey;
    }[];
  }[];
}

/** Reads the opening identity owner and verifies it against generated players. */
function openingPopulationProjection(
  world: FakeDomesticWorld,
  worldSeed: string,
): OpeningPopulationProjection {
  return {
    seed: worldSeed,
    competitions: world.domesticCompetitionWorld.competitionIds.map((competitionId) => {
      const competition = world.domesticCompetitionWorld.competitions[competitionId];
      if (competition === undefined) throw new Error(`Opening competition is missing: ${competitionId}`);
      const assignments = assignGeneratedSquadIdentities({
        seed: worldSeed,
        competitionIdentityKey: competitionId,
        orderedClubIds: competition.clubIds,
      });
      const identityCounts: Record<string, number> = Object.fromEntries(
        GENERATED_SQUAD_IDENTITY_KEYS.map((key) => [key, 0]),
      );
      let identityMismatchCount = 0;
      const rows = competition.clubIds.map((clubId) => {
        const identity = assignments.get(clubId);
        const club = world.clubsById[clubId];
        if (identity === undefined || club === undefined) {
          throw new Error(`Opening identity assignment omitted ${clubId}`);
        }
        identityCounts[identity.key] = (identityCounts[identity.key] ?? 0) + 1;
        for (const [slotIndex, playerId] of club.playerIds.entries()) {
          const expected = squadIdentityPositionForSlot(identity, slotIndex + 1);
          const actual = world.players[playerId]?.naturalPositions[0];
          if (actual !== expected) identityMismatchCount += 1;
        }
        return {
          clubId: String(clubId),
          clubName: club.name,
          squadIdentityKey: identity.key,
        };
      });
      return {
        competitionId: String(competitionId),
        competitionName: competition.name,
        clubCount: competition.clubIds.length,
        identityCounts,
        identityMismatchCount,
        rows,
      };
    }),
  };
}

/** Joins opening identities to season-one fielded shapes without replaying AI. */
function leagueDiversityWorldFacts(
  worldSeed: string,
  world: FakeDomesticWorld,
  observedSeasons: readonly ObservedDomesticSeason[],
): LeagueDiversityWorldFacts {
  const openingPopulation = openingPopulationProjection(world, worldSeed);
  const firstSeason = observedSeasons.find(({ seasonNumber }) => seasonNumber === 1);
  if (firstSeason === undefined) throw new Error(`League-diversity world has no season one: ${worldSeed}`);
  const opening = openingPopulation.competitions.map((population) => {
    const observed = firstSeason.competitions.find(
      ({ competitionId }) => competitionId === population.competitionId,
    );
    const formations = observed?.formations;
    if (formations === undefined) {
      throw new Error(`League-diversity opening formations are missing: ${population.competitionId}`);
    }
    const identityByClub = new Map(population.rows.map((row) => [row.clubId, row.squadIdentityKey]));
    const shapesByIdentity = new Map<GeneratedSquadIdentityKey, Map<FormationKey, number>>();
    for (const row of formations.clubModalRows) {
      const identityKey = identityByClub.get(row.clubId);
      if (identityKey === undefined) {
        throw new Error(`Opening modal shape has no identity: ${row.clubId}`);
      }
      const counts = shapesByIdentity.get(identityKey) ?? new Map<FormationKey, number>();
      counts.set(row.formation, (counts.get(row.formation) ?? 0) + 1);
      shapesByIdentity.set(identityKey, counts);
    }
    const identityModalFormations = [...shapesByIdentity.values()].map((counts) => {
      const modal = [...counts].sort(([leftKey, leftCount], [rightKey, rightCount]) =>
        rightCount - leftCount || leftKey.localeCompare(rightKey)
      )[0];
      if (modal === undefined) throw new Error("Observed squad identity has no modal formation");
      return modal[0];
    });
    return {
      worldSeed,
      competitionId: population.competitionId,
      clubCount: population.clubCount,
      identityCounts: population.identityCounts,
      identityMismatchCount: population.identityMismatchCount,
      primaryRolePositiveCount: formations.primaryRolePositiveCount,
      distinctFormationCount: formations.distinctFormationCount,
      replicatedFormationCount: formations.replicatedFormationCount,
      topFormationShare: formations.topFormationShare,
      distinctIdentityModalFormationCount: new Set(identityModalFormations).size,
      catalogOrderSensitiveSelectionCount:
        formations.catalogOrderSensitiveSelectionCount + formations.catalogChoiceMissingCount,
      emergencyCatalogSelectionCount: formations.emergencyCatalogSelectionCount,
      forcedOutOfPositionSlotCount: formations.forcedOutOfPositionSlotCount,
      avoidableOutOfPositionSlotCount: formations.avoidableOutOfPositionSlotCount,
      academyCallUpAppearanceCount: formations.academyCallUpAppearanceCount,
      meanOutOfPositionSlots: formations.meanOutOfPositionSlots,
    };
  });
  const seasons = observedSeasons.flatMap(({ seasonNumber, competitions }) =>
    competitions.map((competition) => {
      const formations = competition.formations;
      if (formations === undefined) {
        throw new Error(`League-diversity season formations are missing: ${competition.competitionId}`);
      }
      return {
        worldSeed,
        competitionId: competition.competitionId,
        seasonNumber,
        distinctFormationCount: formations.distinctFormationCount,
        replicatedFormationCount: formations.replicatedFormationCount,
        topFormationShare: formations.topFormationShare,
        primaryRolePositiveCount: formations.primaryRolePositiveCount,
        fallbackSelectionCount: formations.fallbackSelectionCount,
        selectionCount: formations.selectionCount,
        missingSelectionSourceCount: formations.missingSelectionSourceCount,
        missingStableIdCount: formations.missingStableIdCount,
        reconciliationFailureCount: formations.reconciliationFailureCount,
        identicalStartingXiAllFixturesClubCount:
          formations.identicalStartingXiAllFixturesClubCount,
      };
    })
  );
  return { worldSeed, opening, seasons };
}

/** Applies the frozen L1 opening and longitudinal gates to canonical facts. */
export function evaluateLeagueDiversityCheckpoint(
  worlds: readonly LeagueDiversityWorldFacts[],
): LeagueDiversityCheckpointDecision {
  const openingRows = worlds.flatMap(({ opening }) => opening);
  const openingFailed: string[] = [];
  let passingCompetitionCount = 0;
  for (const row of openingRows) {
    const minimum = Math.floor(row.clubCount / GENERATED_SQUAD_IDENTITY_KEYS.length);
    const maximum = Math.ceil(row.clubCount / GENERATED_SQUAD_IDENTITY_KEYS.length);
    const identityCounts = GENERATED_SQUAD_IDENTITY_KEYS.map((key) => row.identityCounts[key] ?? 0);
    const held = row.clubCount < GENERATED_SQUAD_IDENTITY_KEYS.length || (
      identityCounts.every((count) => count >= minimum && count <= maximum)
      && identityCounts.every((count) => count > 0)
      && row.identityMismatchCount === 0
      && row.primaryRolePositiveCount === 10
      && row.distinctFormationCount >= 6
      && row.replicatedFormationCount >= 4
      && row.topFormationShare <= 0.30
      && row.distinctIdentityModalFormationCount >= 6
      && row.catalogOrderSensitiveSelectionCount === 0
      && row.avoidableOutOfPositionSlotCount === 0
    );
    if (held) passingCompetitionCount += 1;
    else openingFailed.push(`${row.worldSeed}|${row.competitionId}`);
  }

  const seasonRows = worlds.flatMap(({ seasons }) => seasons);
  if (seasonRows.length === 0) throw new Error("League-diversity checkpoint has no competition-seasons");
  const share = (predicate: (row: LeagueDiversityCompetitionSeasonFact) => boolean) =>
    seasonRows.filter(predicate).length / seasonRows.length;
  const sixFormationRetentionShare = share(({ distinctFormationCount }) => distinctFormationCount >= 6);
  const fourReplicatedFormationRetentionShare = share(
    ({ replicatedFormationCount }) => replicatedFormationCount >= 4,
  );
  const topShareAtMostThirtyRetentionShare = share(
    ({ topFormationShare }) => topFormationShare <= 0.30,
  );
  const allRolesRetentionShare = share(({ primaryRolePositiveCount }) => primaryRolePositiveCount === 10);
  const maximumTopFormationShare = Math.max(...seasonRows.map(({ topFormationShare }) => topFormationShare));
  const fallbackSelectionCount = sum(seasonRows, "fallbackSelectionCount");
  const missingSelectionSourceCount = sum(seasonRows, "missingSelectionSourceCount");
  const missingStableIdCount = sum(seasonRows, "missingStableIdCount");
  const reconciliationFailureCount = sum(seasonRows, "reconciliationFailureCount");
  const longitudinalFailed = [
    ...(sixFormationRetentionShare < 0.95 ? ["six_formation_retention"] : []),
    ...(fourReplicatedFormationRetentionShare < 0.95 ? ["four_replicated_formation_retention"] : []),
    ...(topShareAtMostThirtyRetentionShare < 0.95 ? ["top_share_at_most_thirty_retention"] : []),
    ...(allRolesRetentionShare < 0.95 ? ["all_roles_retention"] : []),
    ...(maximumTopFormationShare > 0.50 ? ["absolute_top_formation_share"] : []),
    ...(fallbackSelectionCount > 0 ? ["selection_fallback"] : []),
    ...(missingSelectionSourceCount > 0 ? ["missing_selection_source"] : []),
    ...(missingStableIdCount > 0 ? ["missing_stable_id"] : []),
    ...(reconciliationFailureCount > 0 ? ["reconciliation"] : []),
  ];
  const decision = openingFailed.length === 0 && longitudinalFailed.length === 0
    ? "GO" as const
    : "REFINE" as const;
  return {
    decision,
    opening: {
      competitionCount: openingRows.length,
      passingCompetitionCount,
      failed: openingFailed,
    },
    longitudinal: {
      competitionSeasonCount: seasonRows.length,
      sixFormationRetentionShare,
      fourReplicatedFormationRetentionShare,
      topShareAtMostThirtyRetentionShare,
      allRolesRetentionShare,
      maximumTopFormationShare,
      fallbackSelectionCount,
      missingSelectionSourceCount,
      missingStableIdCount,
      reconciliationFailureCount,
      failed: longitudinalFailed,
    },
  };
}

/**
 * Evaluates all three league levels against their own frozen history.
 *
 * The function reads completed tables only. It cannot influence a match and it
 * refuses to use first-division evidence as a fallback for a lower league.
 */
export function evaluateStandingsHierarchyCheckpoint(
  worlds: readonly StandingsHierarchyWorldFacts[],
  formationWorlds: readonly LeagueDiversityWorldFacts[],
  availabilityWorlds: readonly AvailabilityAgingWorldFacts[],
  expectedSeasonCount: number,
): StandingsHierarchyCheckpointDecision {
  const rows = worlds.flatMap((world) => world.seasons);
  const reconciliationFailureCount = rows.reduce(
    (total, row) => total + row.reconciliationFailureCount,
    0,
  );
  const formationRows = formationWorlds.flatMap((world) => world.seasons);
  const fallbackSelectionCount = formationRows.reduce(
    (total, row) => total + row.fallbackSelectionCount + row.missingSelectionSourceCount,
    0,
  );
  const unavailableSelectedPlayerCount = availabilityWorlds.flatMap(
    (world) => world.teamMatches,
  ).reduce((total, row) => total + row.unavailableSelectedPlayerCount, 0);
  const divisions = ([1, 2, 3] as const).map((divisionLevel) => {
    const divisionRows = rows.filter((row) => row.divisionLevel === divisionLevel);
    const targets = HISTORICAL_DIVISION_TABLE_TARGETS[divisionLevel];
    const values = {
      championPoints: reportMean(divisionRows.map((row) => row.championPoints)),
      lastClubPoints: reportMean(divisionRows.map((row) => row.lastClubPoints)),
      pointsSpread: reportMean(divisionRows.map((row) => row.pointsSpread)),
      ppgStandardDeviation: reportMean(
        divisionRows.map((row) => row.ppgStandardDeviation),
      ),
      goalsPerMatch: reportMean(divisionRows.map((row) => row.goalsPerMatch)),
      drawShare: reportMean(divisionRows.map((row) => row.drawShare)),
    };
    const expectedCompetitionSeasonCount = worlds.length * expectedSeasonCount;
    const failed = [
      ...(divisionRows.length !== expectedCompetitionSeasonCount
        ? ["competition_season_count"]
        : []),
      ...historicalMetricFailures(values, targets),
    ];
    return {
      divisionLevel,
      competitionSeasonCount: divisionRows.length,
      ...values,
      failed,
    };
  });
  const structuralFailure = reconciliationFailureCount > 0
    || fallbackSelectionCount > 0
    || unavailableSelectedPlayerCount > 0
    || divisions.some(
      (division) => division.competitionSeasonCount !== worlds.length * expectedSeasonCount,
    );
  const firstDivision = divisions[0];
  const firstGuardrailFailure = firstDivision?.failed.some(
    (key) => key === "goalsPerMatch" || key === "drawShare",
  ) ?? true;
  const lowerDivisionFailure = divisions.slice(1).some((division) => division.failed.length > 0);
  const decision = structuralFailure || firstGuardrailFailure || lowerDivisionFailure
    ? "STOP_RETHINK" as const
    : (firstDivision?.failed.length ?? 1) > 0
      ? "REFINE" as const
      : "GO" as const;

  return {
    decision,
    divisions,
    competitionSeasonCount: rows.length,
    reconciliationFailureCount,
    fallbackSelectionCount,
    unavailableSelectedPlayerCount,
  };
}

function historicalMetricFailures(
  values: Omit<StandingsHierarchyDivisionEvaluation, "divisionLevel" | "competitionSeasonCount" | "failed">,
  targets: typeof HISTORICAL_DIVISION_TABLE_TARGETS[1 | 2 | 3],
): readonly string[] {
  return (Object.keys(targets) as readonly (keyof typeof targets)[]).flatMap((key) => {
    const value = values[key];
    const band = targets[key];
    return value >= band.min && value <= band.max ? [] : [key];
  });
}

function standingsHierarchySeasonFact(input: {
  readonly worldSeed: string;
  readonly divisionLevel: 1 | 2 | 3;
  readonly competitionId: string;
  readonly seasonNumber: number;
  readonly result: SimulateSeasonResult;
}): StandingsHierarchySeasonFact {
  const champion = input.result.table[0];
  const last = input.result.table.at(-1);
  if (champion === undefined || last === undefined || input.result.table.length === 0) {
    throw new Error(`Standings hierarchy received an empty table: ${input.competitionId}`);
  }
  const drawCount = input.result.fixtures.reduce((count, fixture) =>
    fixture.result !== undefined && fixture.result.homeGoals === fixture.result.awayGoals
      ? count + 1
      : count, 0);
  const totalGoals = input.result.table.reduce((total, row) => total + row.goalsFor, 0);
  const pointsPerGame = input.result.table.map((row) => {
    const played = row.wins + row.draws + row.losses;
    return played === 0 ? 0 : row.points / played;
  });
  return {
    worldSeed: input.worldSeed,
    divisionLevel: input.divisionLevel,
    competitionId: input.competitionId,
    seasonNumber: input.seasonNumber,
    championPoints: champion.points,
    lastClubPoints: last.points,
    pointsSpread: champion.points - last.points,
    ppgStandardDeviation: populationStandardDeviation(pointsPerGame),
    goalsPerMatch: totalGoals / input.result.fixtures.length,
    drawShare: drawCount / input.result.fixtures.length,
    reconciliationFailureCount: standingsReconciliationFailureCount(input.result, drawCount),
  };
}

function standingsReconciliationFailureCount(
  result: SimulateSeasonResult,
  drawCount: number,
): number {
  const rows = result.table;
  const fixtureCount = result.fixtures.length;
  const totalPlayed = rows.reduce(
    (total, row) => total + row.wins + row.draws + row.losses,
    0,
  );
  const totalWins = rows.reduce((total, row) => total + row.wins, 0);
  const totalDraws = rows.reduce((total, row) => total + row.draws, 0);
  const totalLosses = rows.reduce((total, row) => total + row.losses, 0);
  const totalGoalsFor = rows.reduce((total, row) => total + row.goalsFor, 0);
  const totalGoalsAgainst = rows.reduce((total, row) => total + row.goalsAgainst, 0);
  return Number(totalPlayed !== fixtureCount * 2)
    + Number(totalWins !== totalLosses)
    + Number(totalDraws !== drawCount * 2)
    + Number(totalGoalsFor !== totalGoalsAgainst)
    + rows.reduce(
      (total, row) => total + Number(row.points !== row.wins * 3 + row.draws),
      0,
    );
}

function divisionLevelForCompetition(
  orderedCompetitionIds: readonly string[],
  competitionId: string,
): 1 | 2 | 3 {
  const index = orderedCompetitionIds.indexOf(competitionId);
  if (index === 0 || index === 1 || index === 2) return (index + 1) as 1 | 2 | 3;
  throw new Error(`Competition is outside the canonical three-level order: ${competitionId}`);
}

function populationStandardDeviation(values: readonly number[]): number {
  const mean = reportMean(values);
  return Math.sqrt(reportMean(values.map((value) => (value - mean) ** 2)));
}

function reportMean(values: readonly number[]): number {
  if (values.length === 0) return Number.NaN;
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function transferProjection(
  report: CareerWorldFacts,
  observed: readonly ObservedTransfer[],
  names: ReadonlyMap<string, string>,
  detail: SimulationReportDetail,
): unknown {
  if (observed.length !== report.finalCareerState.transferHistory.length) {
    throw new Error(
      `Transfer boundary rows do not reconcile: ${observed.length} != ${report.finalCareerState.transferHistory.length}`,
    );
  }
  const all = observed.map(({
    seasonNumber,
    entry,
    buyingClubName,
    buyingCompetitionId,
    buyingCompetitionName,
    sellingClubName,
    sellingCompetitionId,
    sellingCompetitionName,
  }) => ({
    seasonNumber,
    sequenceNumber: entry.sequenceNumber,
    kind: entry.kind,
    occurredOn: toISO(entry.occurredOn),
    playerId: String(entry.playerId),
    playerName: names.get(String(entry.playerId)) ?? String(entry.playerId),
    buyingClubId: String(entry.buyingClubId),
    buyingClubName,
    buyingCompetitionId,
    buyingCompetitionName,
    ...(entry.kind === "permanent_transfer"
      ? {
          sellingClubId: String(entry.sellingClubId),
          sellingClubName,
          sellingCompetitionId,
          sellingCompetitionName,
        }
      : {}),
    publicValueMinorUnits: Number(entry.publicValue),
    completedFeeMinorUnits: Number(entry.completedFee),
  }));
  const limit = detail === "summary" ? 10 : detail === "standard" ? 100 : all.length;
  return { seed: report.seed, total: all.length, rows: all.slice(0, limit) };
}

/**
 * Captures the clubs' divisions while the transfer is observed.
 *
 * Competition membership changes over a career, so a final-state lookup can
 * silently label an old transfer with a later promoted or relegated division.
 * The boundary observation stores the non-derivable historical presentation
 * fact beside the canonical transfer entry instead.
 */
function observeTransferAtBoundary(
  seasonNumber: number,
  entry: CliCareerState["transferHistory"][number],
  careerState: CliCareerState,
): ObservedTransfer {
  const buying = clubCompetitionAtBoundary(careerState, entry.buyingClubId);
  if (entry.kind !== "permanent_transfer") {
    return {
      seasonNumber,
      entry,
      buyingClubName: buying.clubName,
      buyingCompetitionId: buying.competitionId,
      buyingCompetitionName: buying.competitionName,
    };
  }

  const selling = clubCompetitionAtBoundary(careerState, entry.sellingClubId);
  return {
    seasonNumber,
    entry,
    buyingClubName: buying.clubName,
    buyingCompetitionId: buying.competitionId,
    buyingCompetitionName: buying.competitionName,
    sellingClubName: selling.clubName,
    sellingCompetitionId: selling.competitionId,
    sellingCompetitionName: selling.competitionName,
  };
}

/** Resolves one club through the ordered competition registry at observation time. */
function clubCompetitionAtBoundary(
  careerState: CliCareerState,
  clubId: CliCareerState["gameState"]["clubIds"][number],
): {
  readonly clubName: string;
  readonly competitionId: string;
  readonly competitionName: string;
} {
  const club = careerState.gameState.clubs[clubId];
  const registry = careerState.gameState.domesticCompetitionWorld;
  if (club === undefined || registry === undefined) {
    throw new Error(`Transfer boundary lost club or competition registry: ${clubId}`);
  }
  for (const competitionId of registry.competitionIds) {
    const competition = registry.competitions[competitionId];
    if (competition?.clubIds.includes(clubId) === true) {
      return {
        clubName: club.name,
        competitionId: String(competitionId),
        competitionName: competition.name,
      };
    }
  }
  throw new Error(`Transfer boundary club has no competition: ${clubId}`);
}

function careerSectionCheckpointIdentity(
  input: {
    readonly worldSeeds: readonly string[];
    readonly seasonCount: number;
    readonly detail: SimulationReportDetail;
    readonly sectionIds: readonly CareerSectionId[];
    readonly leagueDiversityProfile?: {
      readonly profileId: string;
      readonly checkpointDirectoryPath: string;
      readonly checkpointKind: CareerCheckpointKind;
      readonly readOnly?: boolean;
    };
  },
  worldSeed: string,
  worldIndex: number,
): CareerSectionWorldCheckpointIdentity {
  const profile = input.leagueDiversityProfile;
  if (profile === undefined) throw new Error("Career checkpoint identity requires a profile");
  return {
    profileId: profile.profileId,
    worldSeed,
    worldIndex,
    worldCount: input.worldSeeds.length,
    seasonCount: input.seasonCount,
    detail: input.detail,
    sectionIds: input.sectionIds,
    checkpointDirectoryPath: profile.checkpointDirectoryPath,
  };
}

/** Narrows one hashed JSON checkpoint back to the projection contract. */
function careerWorldProjectionFromCheckpoint(
  value: SimulationReportJsonValue,
  expectedSeed: string,
): CareerWorldProjection {
  const root = jsonRecord(value);
  const sections = jsonRecord(root?.sections);
  const calibrationVersions = jsonRecord(root?.calibrationVersions);
  if (
    root?.seed !== expectedSeed
    || sections === undefined
    || calibrationVersions === undefined
    || !Object.values(calibrationVersions).every((entry) => typeof entry === "string")
  ) {
    throw new Error(`Career-section checkpoint projection is invalid: ${expectedSeed}`);
  }
  const leagueDiversity = root.leagueDiversity;
  if (leagueDiversity === undefined || jsonRecord(leagueDiversity) === undefined) {
    throw new Error(`Career-section checkpoint omitted league-diversity facts: ${expectedSeed}`);
  }
  return value as unknown as CareerWorldProjection;
}

/** Adds competition identity to one already-projected section payload. */
function competitionSectionProjection(
  competition: ObservedCompetitionSeason,
  key: keyof ObservedCompetitionSeason,
): unknown {
  const value = competition[key];
  if (value === undefined) {
    throw new Error(`Competition ${competition.competitionId} omitted ${key}`);
  }
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(`Competition ${competition.competitionId} has malformed ${key}`);
  }
  return {
    competitionId: competition.competitionId,
    competitionName: competition.competitionName,
    ...(value as Readonly<Record<string, unknown>>),
  };
}

function sameStringRecord(
  left: Readonly<Record<string, string>>,
  right: Readonly<Record<string, string>>,
): boolean {
  const leftKeys = Object.keys(left).sort();
  const rightKeys = Object.keys(right).sort();
  return leftKeys.length === rightKeys.length
    && leftKeys.every((key, index) => key === rightKeys[index] && left[key] === right[key]);
}

function sum<K extends keyof LeagueDiversityCompetitionSeasonFact>(
  rows: readonly LeagueDiversityCompetitionSeasonFact[],
  key: K,
): number {
  return rows.reduce((total, row) => {
    const value = row[key];
    if (typeof value !== "number") throw new Error(`League-diversity ${String(key)} is not numeric`);
    return total + value;
  }, 0);
}

function jsonRecord(
  value: SimulationReportJsonValue | undefined,
): Readonly<Record<string, SimulationReportJsonValue>> | undefined {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as Readonly<Record<string, SimulationReportJsonValue>>
    : undefined;
}

function unknownRecord(value: unknown): Readonly<Record<string, unknown>> | undefined {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as Readonly<Record<string, unknown>>
    : undefined;
}

function unknownArray(value: unknown): readonly unknown[] | undefined {
  return Array.isArray(value) ? value : undefined;
}

function rememberPlayerNames(careerState: CliCareerState, names: Map<string, string>): void {
  for (const playerId of careerState.gameState.playerIds) {
    const player = careerState.gameState.players[playerId];
    if (player !== undefined) names.set(String(playerId), `${player.firstName} ${player.lastName}`);
  }
}

function required(key: keyof ObservedSeason): (season: ObservedSeason) => unknown {
  return (season) => {
    const value = season[key];
    if (value === undefined) throw new Error(`Observed season omitted ${key}`);
    return value;
  };
}

function stringCalibrationVersions(
  versions: Readonly<Record<string, unknown>>,
): Readonly<Record<string, string>> {
  return Object.fromEntries(
    Object.entries(versions)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, value]) => [key, typeof value === "string" ? value : JSON.stringify(value)]),
  );
}

function asJsonValue(value: unknown): SimulationReportJsonValue {
  return toSimulationReportJsonValue(value);
}

function runCareerSectionsWorker(input: {
  readonly seed: string;
  readonly seasonCount: number;
  readonly detail: SimulationReportDetail;
  readonly sectionIds: readonly CareerSectionId[];
  readonly leagueDiversity: boolean;
  readonly generationalSuccession: boolean;
  readonly ownerAttribution: boolean;
  readonly renewalArchitecture: boolean;
  readonly standingsHierarchy: boolean;
}): Promise<CareerWorldProjection> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL("./career-sections.ts", import.meta.url), {
      workerData: { kind: "simulation-report-career", ...input },
    });
    worker.once("message", (message: CareerWorldProjection) => resolve(message));
    worker.once("error", reject);
    worker.once("exit", (code) => {
      if (code !== 0) reject(new Error(`Career report worker exited with code ${code}: ${input.seed}`));
    });
  });
}

if (!isMainThread && workerData?.kind === "simulation-report-career") {
  parentPort?.postMessage(createCareerWorldProjection(workerData));
}
