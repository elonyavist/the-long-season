import type { MessageKey } from "@game/i18n";
import {
  toSimulationReportJsonValue,
  type SimulationReportDetail,
  type SimulationReportExecutionNode,
  type SimulationReportJsonValue,
  type SimulationReportMeasurementRequest,
  createSimulationReportArtifact,
  type SimulationReportArtifact,
} from "@game/simulation-tools";

import {
  DEFAULT_TACTICAL_AGENCY_PAIRED_SEEDS,
  DEFAULT_TACTICAL_AGENCY_ROUND_COUNT,
  DEFAULT_TACTICAL_AGENCY_SEED_PREFIX,
  DEFAULT_TACTICAL_AGENCY_WORLD_COUNT,
  DEFAULT_TACTICAL_AGENCY_WORLD_SEED,
  createTacticalAgencyA2ProfileFacts,
  createTacticalAgencyB21ProfileFacts,
  createTacticalAgencyB21AProfileFacts,
  createTacticalAgencyB2CurrentMaterialityProfileFacts,
  createTacticalAgencyB2MaterialityProfileFacts,
  createTacticalAgencyB2ProfileFacts,
  createTacticalAgencyBProfileFacts,
  createTacticalAgencySectionFacts,
  TACTICAL_AGENCY_B_WORLD_SEED,
} from "./tactical-agency-section.ts";
import {
  DEFAULT_TACTICAL_SHAPE_FORMATION_PAIRED_SEEDS,
  DEFAULT_TACTICAL_SHAPE_PAIRED_SEEDS,
  DEFAULT_TACTICAL_SHAPE_SCENARIO_PAIRED_SEEDS,
  DEFAULT_TACTICAL_SHAPE_SEED_PREFIX,
  DEFAULT_TACTICAL_SHAPE_WORLD_SEED,
  createTacticalShapeSectionFacts,
} from "./tactical-shape-section.ts";
import {
  CAREER_SECTION_IDS,
  createCareerSectionsFacts,
  type CareerCheckpointKind,
  type CareerSectionId,
  type RenewalAblationArm,
  type StrengthContestMode,
} from "./career-sections.ts";
import {
  createLockedProfileFacts,
  LOCKED_MIGRATION_PROFILE_IDS,
  LOCKED_PROFILE_MEASUREMENTS,
  type LockedMigrationProfileId,
} from "./locked-profile-sections.ts";
import { resolveWorkspaceOutputPath } from "../workspace-output-path.ts";

/** The three executable modules present at the Step 03C boundary. */
export const SIMULATION_REPORT_MODULE_IDS = [
  "season",
  "standings",
  "players",
  "transfers",
  "formations",
  "economy",
  "development",
  "anomalies",
  "tactical_agency",
  "tactical_shape",
] as const;
export type SimulationReportModuleId = typeof SIMULATION_REPORT_MODULE_IDS[number];

/** Locked profiles preserve scientific populations independently of rendering. */
export const SIMULATION_REPORT_PROFILE_IDS = [
  "phase81a-a2",
  "phase81a-b",
  "phase81a-b2",
  "phase81a-b2-materiality",
  "phase81a-b2-current-materiality",
  "phase81a-b2-attribution",
  "phase81a-b2-identity-family",
  "phase81a-substitution-minute-l2-7x1",
  "phase81a-availability-aging-l3-7x2",
  "phase81a-generational-succession-l4-7x10",
  "phase81a-youth-minute-pathway-l4-1-7x10",
  "phase81a-career-exit-renewal-l4-2-7x10",
  "phase81a-generated-ceiling-l4-3-7x10",
  "phase81a-development-renewal-l4-4-7x10",
  "phase81a-annual-role-continuity-l4-5-7x2",
  "phase81a-l5-1-owner-attribution-7x10",
  "phase81a-standings-hierarchy-l5-2-7x2",
  "phase81a-standings-hierarchy-l5-2a-7x10",
  "phase81a-standings-hierarchy-l5-2b-7x10",
  "phase81a-standings-hierarchy-l5-2c-7x10",
  "phase81a-standings-hierarchy-l5-2d-7x10",
  "phase81a-player-renewal-leaders-l5-3-7x10",
  "phase81a-player-renewal-leaders-l5-3a-7x10",
  "phase81a-player-renewal-leaders-l5-3b-7x10",
  "phase81a-renewal-architecture-l5-3c-7x10",
  "phase81a-integrated-l5-4-7x10",
  "phase81a-integrated-l5-4h-reeval-7x10",
  "phase81a-integrated-l6-2-7x10",
  "phase81a-integrated-l6-3-7x10",
  "phase81a-integrated-l6-3b-7x10",
  "phase81a-assist-supply-l6-3c-7x1",
  "phase81a-assist-eligibility-l6-3d-7x1",
  "phase81a-dead-ball-attribution-l6-3e-7x1",
  "phase81a-penalty-award-l6-3f-7x1",
  "phase81a-direct-free-kick-geometry-l6-3g-14x1",
  "phase81a-direct-free-kick-l6-3h-7x1",
  "phase81a-renewal-baseline-l6-4-7x10",
  "phase81a-succession-priority-l6-5-7x10",
  "phase81a-succession-target-pool-l6-9b-7x10",
  "phase81a-succession-affordability-l6-9c-7x10",
  "phase81a-succession-affordability-l6-9d-7x10",
  "phase81a-succession-downstream-funnel-l6-12b-cached",
  "phase81a-succession-growth-feasibility-l6-13-cached",
  "phase81a-leader-conversion-l6-15-cached",
  "phase81a-mature-leader-conversion-l6-15b-cached",
  "phase81a-leader-quality-feasibility-l6-16-cached",
  "phase81a-ceiling-distance-l6-18-cached",
  "phase81a-academy-prospect-class-l6-20-7x10",
  "phase81a-generated-player-lifecycle-l6-23-cached",
  "phase81a-generated-leader-lane-l6-24-cached",
  "phase81a-renewal-ladder-l6-26-cached",
  "phase81a-population-stationarity-l6-27-cached",
  "phase81a-generation-time-stationary-l6-29a-7x10",
  "phase81a-routine-youth-runway-l6-31-control-7x10",
  "phase81a-routine-youth-runway-l6-31-candidate-7x10",
  "phase81a-routine-youth-runway-l6-31-oos-control-7x10",
  "phase81a-routine-youth-runway-l6-31-oos-candidate-7x10",
  "phase81a-renewal-ablation-l6-1-control-7x10",
  "phase81a-renewal-ablation-l6-1-market-7x10",
  "phase81a-renewal-ablation-l6-1-blueprint-7x10",
  "phase81a-renewal-ablation-l6-1-combined-7x10",
  "phase81a-renewal-refinement-l6-1a-canary-7x1",
  "phase81a-renewal-refinement-l6-1a-28x10",
  "phase81a-independent-owners-l6-1b-canary-7x1",
  "phase81a-independent-owners-l6-1b-28x10",
  "phase81a-strength-contest-l6-1d-canary-7x1",
  "phase81a-strength-contest-l6-1d-28x10",
  "phase81a-strength-contest-l6-1d2-canary-7x1",
  "phase81a-strength-contest-l6-1d2-28x10",
  "phase81a-renewal-common-support-l6-1c-canary-7x1",
  "phase81a-renewal-common-support-l6-1c-7x10",
  "phase81a-league-diversity-canary-7x10",
  "phase81a-league-diversity-100x10",
  "phase81-tactical-shape",
  ...LOCKED_MIGRATION_PROFILE_IDS,
] as const;
export type SimulationReportProfileId = typeof SIMULATION_REPORT_PROFILE_IDS[number];

const CAREER_PROFILE_CHECKPOINT_KIND = {
  "phase81a-league-diversity-canary-7x10": "integrated_player_world_l5",
  "phase81a-league-diversity-100x10": "league_diversity_l1",
  "phase81a-substitution-minute-l2-7x1": "substitution_minutes_l2",
  "phase81a-availability-aging-l3-7x2": "availability_aging_l3",
  "phase81a-generational-succession-l4-7x10": "generational_succession_l4",
  "phase81a-youth-minute-pathway-l4-1-7x10": "youth_minute_pathway_l4_1",
  "phase81a-career-exit-renewal-l4-2-7x10": "career_exit_renewal_l4_2",
  "phase81a-generated-ceiling-l4-3-7x10": "generated_ceiling_l4_3",
  "phase81a-development-renewal-l4-4-7x10": "development_renewal_l4_4",
  "phase81a-annual-role-continuity-l4-5-7x2": "annual_role_continuity_l4_5",
  "phase81a-l5-1-owner-attribution-7x10": "owner_attribution_l5_1",
  "phase81a-standings-hierarchy-l5-2-7x2": "standings_hierarchy_l5_2",
  "phase81a-standings-hierarchy-l5-2a-7x10": "standings_hierarchy_l5_2",
  "phase81a-standings-hierarchy-l5-2b-7x10": "standings_hierarchy_l5_2",
  "phase81a-standings-hierarchy-l5-2c-7x10": "standings_hierarchy_l5_2",
  "phase81a-standings-hierarchy-l5-2d-7x10": "standings_hierarchy_l5_2",
  "phase81a-player-renewal-leaders-l5-3-7x10": "player_renewal_leaders_l5_3",
  "phase81a-player-renewal-leaders-l5-3a-7x10": "player_renewal_leaders_l5_3",
  "phase81a-player-renewal-leaders-l5-3b-7x10": "player_renewal_leaders_l5_3",
  "phase81a-renewal-architecture-l5-3c-7x10": "renewal_architecture_l5_3c",
  "phase81a-integrated-l5-4-7x10": "integrated_player_world_l5_4",
  "phase81a-integrated-l5-4h-reeval-7x10": "integrated_player_world_l5_4",
  "phase81a-integrated-l6-2-7x10": "integrated_player_world_l6_2",
  "phase81a-integrated-l6-3-7x10": "integrated_player_world_l6_2",
  "phase81a-integrated-l6-3b-7x10": "integrated_player_world_l6_2",
  "phase81a-assist-supply-l6-3c-7x1": "assist_supply_l6_3c",
  "phase81a-assist-eligibility-l6-3d-7x1": "assist_eligibility_l6_3d",
  "phase81a-dead-ball-attribution-l6-3e-7x1": "dead_ball_attribution_l6_3e",
  "phase81a-penalty-award-l6-3f-7x1": "penalty_award_retry_l6_3f",
  "phase81a-direct-free-kick-geometry-l6-3g-14x1": "direct_free_kick_geometry_l6_3g",
  "phase81a-direct-free-kick-l6-3h-7x1": "direct_free_kick_path_l6_3h",
  "phase81a-renewal-baseline-l6-4-7x10": "integrated_player_world_l6_2",
  "phase81a-succession-priority-l6-5-7x10": "succession_priority_l6_5",
  "phase81a-succession-target-pool-l6-9b-7x10": "succession_target_pool_l6_9b",
  "phase81a-succession-affordability-l6-9c-7x10": "succession_affordability_l6_9c",
  "phase81a-succession-affordability-l6-9d-7x10": "succession_affordability_l6_9d",
  "phase81a-succession-downstream-funnel-l6-12b-cached": "succession_downstream_funnel_l6_12b",
  "phase81a-succession-growth-feasibility-l6-13-cached": "succession_growth_feasibility_l6_13",
  "phase81a-leader-conversion-l6-15-cached": "leader_conversion_l6_15",
  "phase81a-mature-leader-conversion-l6-15b-cached": "mature_leader_conversion_l6_15b",
  "phase81a-leader-quality-feasibility-l6-16-cached": "leader_quality_feasibility_l6_16",
  "phase81a-ceiling-distance-l6-18-cached": "leader_ceiling_distance_l6_18",
  "phase81a-academy-prospect-class-l6-20-7x10": "academy_prospect_class_l6_20",
  "phase81a-generated-player-lifecycle-l6-23-cached": "generated_player_lifecycle_l6_23",
  "phase81a-generated-leader-lane-l6-24-cached": "generated_leader_lane_l6_24",
  "phase81a-renewal-ladder-l6-26-cached": "renewal_ladder_l6_26",
  "phase81a-population-stationarity-l6-27-cached": "population_stationarity_l6_27",
  "phase81a-generation-time-stationary-l6-29a-7x10": "generation_time_stationary_l6_29a",
  "phase81a-routine-youth-runway-l6-31-control-7x10": "routine_youth_runway_l6_31",
  "phase81a-routine-youth-runway-l6-31-candidate-7x10": "routine_youth_runway_l6_31",
  "phase81a-routine-youth-runway-l6-31-oos-control-7x10": "routine_youth_runway_l6_31",
  "phase81a-routine-youth-runway-l6-31-oos-candidate-7x10": "routine_youth_runway_l6_31",
  "phase81a-renewal-ablation-l6-1-control-7x10": "renewal_ablation_l6_1",
  "phase81a-renewal-ablation-l6-1-market-7x10": "renewal_ablation_l6_1",
  "phase81a-renewal-ablation-l6-1-blueprint-7x10": "renewal_ablation_l6_1",
  "phase81a-renewal-ablation-l6-1-combined-7x10": "renewal_ablation_l6_1",
  "phase81a-renewal-refinement-l6-1a-canary-7x1": "renewal_refinement_l6_1a",
  "phase81a-renewal-refinement-l6-1a-28x10": "renewal_refinement_l6_1a",
  "phase81a-independent-owners-l6-1b-canary-7x1": "independent_owners_l6_1b",
  "phase81a-independent-owners-l6-1b-28x10": "independent_owners_l6_1b",
  "phase81a-strength-contest-l6-1d-canary-7x1": "strength_contest_l6_1d",
  "phase81a-strength-contest-l6-1d-28x10": "strength_contest_l6_1d",
  "phase81a-strength-contest-l6-1d2-canary-7x1": "strength_contest_l6_1d",
  "phase81a-strength-contest-l6-1d2-28x10": "strength_contest_l6_1d",
  "phase81a-renewal-common-support-l6-1c-canary-7x1": "renewal_common_support_l6_1c",
  "phase81a-renewal-common-support-l6-1c-7x10": "renewal_common_support_l6_1c",
} as const satisfies Partial<Readonly<Record<SimulationReportProfileId, CareerCheckpointKind>>>;

const CAREER_PROFILE_CACHE_SUFFIX = {
  "phase81a-league-diversity-canary-7x10": "-facts-v8",
  "phase81a-league-diversity-100x10": "-facts-v3",
  "phase81a-substitution-minute-l2-7x1": "-facts-v7",
  "phase81a-availability-aging-l3-7x2": "-facts-v11",
  "phase81a-generational-succession-l4-7x10": "-facts-v12",
  "phase81a-youth-minute-pathway-l4-1-7x10": "-facts-v4",
  "phase81a-career-exit-renewal-l4-2-7x10": "-facts-v4",
  "phase81a-generated-ceiling-l4-3-7x10": "-facts-v5",
  "phase81a-development-renewal-l4-4-7x10": "-facts-v7",
  "phase81a-annual-role-continuity-l4-5-7x2": "-facts-v8",
  "phase81a-l5-1-owner-attribution-7x10": "-facts-v7",
  "phase81a-standings-hierarchy-l5-2-7x2": "-facts-v4",
  "phase81a-standings-hierarchy-l5-2a-7x10": "-facts-v4",
  "phase81a-standings-hierarchy-l5-2b-7x10": "-facts-v4",
  "phase81a-standings-hierarchy-l5-2c-7x10": "-facts-v4",
  "phase81a-standings-hierarchy-l5-2d-7x10": "-facts-v4",
  "phase81a-player-renewal-leaders-l5-3-7x10": "-facts-v3",
  "phase81a-player-renewal-leaders-l5-3a-7x10": "-facts-v2",
  "phase81a-player-renewal-leaders-l5-3b-7x10": "-facts-v1",
  "phase81a-renewal-architecture-l5-3c-7x10": "-facts-v1",
  "phase81a-integrated-l5-4-7x10": "-facts-v1",
  "phase81a-integrated-l5-4h-reeval-7x10": "-facts-v1-copy",
  "phase81a-integrated-l6-2-7x10": "-facts-v1",
  "phase81a-integrated-l6-3-7x10": "-facts-v1",
  "phase81a-integrated-l6-3b-7x10": "-facts-v1",
  "phase81a-assist-supply-l6-3c-7x1": "-facts-v1",
  "phase81a-assist-eligibility-l6-3d-7x1": "-facts-v1",
  "phase81a-dead-ball-attribution-l6-3e-7x1": "-facts-v1",
  "phase81a-penalty-award-l6-3f-7x1": "-facts-v1",
  "phase81a-direct-free-kick-geometry-l6-3g-14x1": "-facts-v1",
  "phase81a-direct-free-kick-l6-3h-7x1": "-facts-v1",
  "phase81a-renewal-baseline-l6-4-7x10": "-facts-v1",
  "phase81a-succession-priority-l6-5-7x10": "-facts-v1",
  "phase81a-succession-target-pool-l6-9b-7x10": "-facts-v1",
  "phase81a-succession-affordability-l6-9c-7x10": "-facts-v1",
  "phase81a-succession-affordability-l6-9d-7x10": "-facts-v1",
  "phase81a-succession-downstream-funnel-l6-12b-cached": "-facts-v1",
  "phase81a-succession-growth-feasibility-l6-13-cached": "-facts-v1",
  "phase81a-leader-conversion-l6-15-cached": "-facts-v1",
  "phase81a-mature-leader-conversion-l6-15b-cached": "-facts-v1",
  "phase81a-leader-quality-feasibility-l6-16-cached": "-facts-v1",
  "phase81a-ceiling-distance-l6-18-cached": "-facts-v1",
  "phase81a-academy-prospect-class-l6-20-7x10": "-facts-v1",
  "phase81a-generated-player-lifecycle-l6-23-cached": "-facts-v1",
  "phase81a-generated-leader-lane-l6-24-cached": "-facts-v1",
  "phase81a-renewal-ladder-l6-26-cached": "-facts-v1",
  "phase81a-population-stationarity-l6-27-cached": "-facts-v1",
  "phase81a-generation-time-stationary-l6-29a-7x10": "-facts-v1",
  "phase81a-routine-youth-runway-l6-31-control-7x10": "-facts-v2",
  "phase81a-routine-youth-runway-l6-31-candidate-7x10": "-facts-v2",
  "phase81a-routine-youth-runway-l6-31-oos-control-7x10": "-facts-v2",
  "phase81a-routine-youth-runway-l6-31-oos-candidate-7x10": "-facts-v2",
  "phase81a-renewal-ablation-l6-1-control-7x10": "-facts-v2",
  "phase81a-renewal-ablation-l6-1-market-7x10": "-facts-v2",
  "phase81a-renewal-ablation-l6-1-blueprint-7x10": "-facts-v2",
  "phase81a-renewal-ablation-l6-1-combined-7x10": "-facts-v2",
  "phase81a-renewal-refinement-l6-1a-canary-7x1": "-facts-v1",
  "phase81a-renewal-refinement-l6-1a-28x10": "-facts-v1",
  "phase81a-independent-owners-l6-1b-canary-7x1": "-facts-v1",
  "phase81a-independent-owners-l6-1b-28x10": "-facts-v1",
  "phase81a-strength-contest-l6-1d-canary-7x1": "-facts-v1",
  "phase81a-strength-contest-l6-1d-28x10": "-facts-v1",
  "phase81a-strength-contest-l6-1d2-canary-7x1": "-facts-v1",
  "phase81a-strength-contest-l6-1d2-28x10": "-facts-v1",
  "phase81a-renewal-common-support-l6-1c-canary-7x1": "-facts-v1",
  "phase81a-renewal-common-support-l6-1c-7x10": "-facts-v1",
} as const satisfies Readonly<Record<keyof typeof CAREER_PROFILE_CHECKPOINT_KIND, string>>;

/** Copy-pasteable commands rendered by help and parsed by command tests. */
export const SIMULATION_REPORT_RECIPES = [
  {
    descriptionKey: "simulationReport.recipe.quickSeason",
    args: [
      "--worlds=1",
      "--seasons=1",
      "--include=season",
      "--detail=summary",
      "--format=console",
    ],
  },
  {
    descriptionKey: "simulationReport.recipe.fullCareer",
    args: [
      "--worlds=50",
      "--seasons=10",
      "--include=season,standings,players,transfers,formations,economy,development,anomalies",
      "--detail=diagnostic",
      "--workers=7",
      "--format=json",
      "--report-output=simulation-out/career-inspection.json",
    ],
  },
  {
    descriptionKey: "simulationReport.recipe.renderHtml",
    args: [
      "--from-report=simulation-out/career-inspection.json",
      "--format=html",
      "--report-output=simulation-out/career-inspection.html",
    ],
  },
  {
    descriptionKey: "simulationReport.recipe.agencyCheckpoint",
    args: ["--profile=phase81a-a2", "--format=markdown"],
  },
] as const satisfies readonly {
  readonly descriptionKey: MessageKey;
  readonly args: readonly string[];
}[];

export interface SimulationReportModuleDefinition {
  readonly id: SimulationReportModuleId;
  readonly titleKey: MessageKey;
  readonly descriptionKey: MessageKey;
  readonly unavailableClaimKey: MessageKey;
  readonly customReachable: boolean;
  readonly executionNodes: readonly SimulationReportExecutionNode[];
}

export interface SimulationReportProfileDefinition {
  readonly id: SimulationReportProfileId;
  readonly titleKey: MessageKey;
  readonly descriptionKey: MessageKey;
  readonly measurementRequest: SimulationReportMeasurementRequest;
}

const RENEWAL_ABLATION_PROFILE_ID = {
  control: "phase81a-renewal-ablation-l6-1-control-7x10",
  market: "phase81a-renewal-ablation-l6-1-market-7x10",
  blueprint: "phase81a-renewal-ablation-l6-1-blueprint-7x10",
  combined: "phase81a-renewal-ablation-l6-1-combined-7x10",
} as const satisfies Readonly<Record<RenewalAblationArm, SimulationReportProfileId>>;

function renewalAblationProfile(
  arm: RenewalAblationArm,
  titleKey: MessageKey,
  descriptionKey: MessageKey,
): SimulationReportProfileDefinition {
  const id = RENEWAL_ABLATION_PROFILE_ID[arm];
  return {
    id,
    titleKey,
    descriptionKey,
    measurementRequest: {
      mode: "profile",
      profileId: id,
      worldCount: 7,
      seasonCount: 10,
      includedSectionIds: CAREER_SECTION_IDS,
      detail: "diagnostic",
      // Exact L5.4 seeds make the fresh combined arm a contamination replay,
      // while all four arms remain pairwise coupled.
      seedPrefix: "phase81a-integrated-l5-4-v1",
      workerCount: 7,
    },
  };
}

/** One source of truth for planning, help and reachability. */
export const SIMULATION_REPORT_MODULES = {
  season: {
    id: "season",
    titleKey: "simulationReport.module.season.title",
    descriptionKey: "simulationReport.module.season.description",
    unavailableClaimKey: "simulationReport.module.season.excludes",
    customReachable: true,
    executionNodes: [
      { key: "career_world", depth: "career" },
      { key: "season_summary", depth: "season" },
    ],
  },
  standings: careerModule("standings"),
  players: careerModule("players"),
  transfers: careerModule("transfers"),
  formations: careerModule("formations"),
  economy: careerModule("economy"),
  development: careerModule("development"),
  anomalies: careerModule("anomalies"),
  tactical_agency: {
    id: "tactical_agency",
    titleKey: "simulationReport.module.tacticalAgency.title",
    descriptionKey: "simulationReport.module.tacticalAgency.description",
    unavailableClaimKey: "simulationReport.module.tacticalAgency.excludes",
    customReachable: true,
    executionNodes: [
      { key: "tactical_agency_worlds", depth: "world" },
      { key: "tactical_agency_low_block", depth: "match" },
      { key: "tactical_agency_a2_gate", depth: "none" },
    ],
  },
  tactical_shape: {
    id: "tactical_shape",
    titleKey: "simulationReport.module.tacticalShape.title",
    descriptionKey: "simulationReport.module.tacticalShape.description",
    unavailableClaimKey: "simulationReport.module.tacticalShape.excludes",
    customReachable: false,
    executionNodes: [
      { key: "tactical_shape_quality_bands", depth: "world" },
      { key: "tactical_shape_audit", depth: "match" },
    ],
  },
} as const satisfies Record<SimulationReportModuleId, SimulationReportModuleDefinition>;

export const SIMULATION_REPORT_PROFILES = {
  "phase81a-a2": {
    id: "phase81a-a2",
    titleKey: "simulationReport.profile.phase81aA2.title",
    descriptionKey: "simulationReport.profile.phase81aA2.description",
    measurementRequest: {
      mode: "profile",
      profileId: "phase81a-a2",
      worldCount: DEFAULT_TACTICAL_AGENCY_WORLD_COUNT,
      seasonCount: 1,
      includedSectionIds: ["tactical_agency"],
      detail: "diagnostic",
      seedPrefix: DEFAULT_TACTICAL_AGENCY_WORLD_SEED,
      workerCount: 7,
    },
  },
  "phase81a-b": {
    id: "phase81a-b",
    titleKey: "simulationReport.profile.phase81aB.title",
    descriptionKey: "simulationReport.profile.phase81aB.description",
    measurementRequest: {
      mode: "profile",
      profileId: "phase81a-b",
      worldCount: 1,
      seasonCount: 1,
      includedSectionIds: ["tactical_agency"],
      detail: "diagnostic",
      seedPrefix: TACTICAL_AGENCY_B_WORLD_SEED,
      workerCount: 7,
    },
  },
  "phase81a-b2": {
    id: "phase81a-b2",
    titleKey: "simulationReport.profile.phase81aB2.title",
    descriptionKey: "simulationReport.profile.phase81aB2.description",
    measurementRequest: {
      mode: "profile",
      profileId: "phase81a-b2",
      worldCount: DEFAULT_TACTICAL_AGENCY_WORLD_COUNT,
      seasonCount: 1,
      includedSectionIds: ["tactical_agency"],
      detail: "diagnostic",
      seedPrefix: DEFAULT_TACTICAL_AGENCY_WORLD_SEED,
      workerCount: 7,
    },
  },
  "phase81a-b2-materiality": {
    id: "phase81a-b2-materiality",
    titleKey: "simulationReport.profile.phase81aB2Materiality.title",
    descriptionKey: "simulationReport.profile.phase81aB2Materiality.description",
    measurementRequest: {
      mode: "profile",
      profileId: "phase81a-b2-materiality",
      worldCount: DEFAULT_TACTICAL_AGENCY_WORLD_COUNT,
      seasonCount: 1,
      includedSectionIds: ["tactical_agency"],
      detail: "diagnostic",
      seedPrefix: DEFAULT_TACTICAL_AGENCY_WORLD_SEED,
      workerCount: 7,
    },
  },
  "phase81a-b2-current-materiality": {
    id: "phase81a-b2-current-materiality",
    titleKey: "simulationReport.profile.phase81aB2CurrentMateriality.title",
    descriptionKey: "simulationReport.profile.phase81aB2CurrentMateriality.description",
    measurementRequest: {
      mode: "profile",
      profileId: "phase81a-b2-current-materiality",
      worldCount: DEFAULT_TACTICAL_AGENCY_WORLD_COUNT,
      seasonCount: 1,
      includedSectionIds: ["tactical_agency"],
      detail: "diagnostic",
      seedPrefix: DEFAULT_TACTICAL_AGENCY_WORLD_SEED,
      workerCount: 7,
    },
  },
  "phase81a-b2-attribution": {
    id: "phase81a-b2-attribution",
    titleKey: "simulationReport.profile.phase81aB21.title",
    descriptionKey: "simulationReport.profile.phase81aB21.description",
    measurementRequest: {
      mode: "profile",
      profileId: "phase81a-b2-attribution",
      worldCount: DEFAULT_TACTICAL_AGENCY_WORLD_COUNT,
      seasonCount: 1,
      includedSectionIds: ["tactical_agency"],
      detail: "diagnostic",
      seedPrefix: DEFAULT_TACTICAL_AGENCY_WORLD_SEED,
      workerCount: 7,
    },
  },
  "phase81a-b2-identity-family": {
    id: "phase81a-b2-identity-family",
    titleKey: "simulationReport.profile.phase81aB21A.title",
    descriptionKey: "simulationReport.profile.phase81aB21A.description",
    measurementRequest: {
      mode: "profile",
      profileId: "phase81a-b2-identity-family",
      worldCount: DEFAULT_TACTICAL_AGENCY_WORLD_COUNT,
      seasonCount: 1,
      includedSectionIds: ["tactical_agency"],
      detail: "diagnostic",
      seedPrefix: DEFAULT_TACTICAL_AGENCY_WORLD_SEED,
      workerCount: 7,
    },
  },
  "phase81a-league-diversity-canary-7x10": {
    id: "phase81a-league-diversity-canary-7x10",
    titleKey: "simulationReport.profile.phase81aLeagueDiversityCanary.title",
    descriptionKey: "simulationReport.profile.phase81aLeagueDiversityCanary.description",
    measurementRequest: {
      mode: "profile",
      profileId: "phase81a-league-diversity-canary-7x10",
      worldCount: 7,
      seasonCount: 10,
      includedSectionIds: CAREER_SECTION_IDS,
      detail: "standard",
      seedPrefix: "phase81a-league-diversity-canary",
      workerCount: 7,
    },
  },
  "phase81a-integrated-l5-4-7x10": {
    id: "phase81a-integrated-l5-4-7x10",
    titleKey: "simulationReport.profile.phase81aIntegratedL5_4.title",
    descriptionKey: "simulationReport.profile.phase81aIntegratedL5_4.description",
    measurementRequest: {
      mode: "profile",
      profileId: "phase81a-integrated-l5-4-7x10",
      worldCount: 7,
      seasonCount: 10,
      includedSectionIds: CAREER_SECTION_IDS,
      detail: "standard",
      seedPrefix: "phase81a-integrated-l5-4-v1",
      workerCount: 7,
    },
  },
  "phase81a-integrated-l5-4h-reeval-7x10": {
    id: "phase81a-integrated-l5-4h-reeval-7x10",
    titleKey: "simulationReport.profile.phase81aIntegratedL5_4H.title",
    descriptionKey: "simulationReport.profile.phase81aIntegratedL5_4H.description",
    measurementRequest: {
      mode: "profile",
      profileId: "phase81a-integrated-l5-4h-reeval-7x10",
      worldCount: 7,
      seasonCount: 10,
      includedSectionIds: CAREER_SECTION_IDS,
      detail: "standard",
      seedPrefix: "phase81a-integrated-l5-4-v1",
      workerCount: 7,
    },
  },
  "phase81a-integrated-l6-2-7x10": {
    id: "phase81a-integrated-l6-2-7x10",
    titleKey: "simulationReport.profile.phase81aIntegratedL6_2.title",
    descriptionKey: "simulationReport.profile.phase81aIntegratedL6_2.description",
    measurementRequest: {
      mode: "profile",
      profileId: "phase81a-integrated-l6-2-7x10",
      worldCount: 7,
      seasonCount: 10,
      includedSectionIds: CAREER_SECTION_IDS,
      detail: "standard",
      seedPrefix: "phase81a-integrated-l6-2-v1",
      workerCount: 7,
    },
  },
  "phase81a-integrated-l6-3-7x10": {
    id: "phase81a-integrated-l6-3-7x10",
    titleKey: "simulationReport.profile.phase81aIntegratedL6_3.title",
    descriptionKey: "simulationReport.profile.phase81aIntegratedL6_3.description",
    measurementRequest: {
      mode: "profile",
      profileId: "phase81a-integrated-l6-3-7x10",
      worldCount: 7,
      seasonCount: 10,
      includedSectionIds: CAREER_SECTION_IDS,
      detail: "standard",
      seedPrefix: "phase81a-integrated-l6-3-v1",
      workerCount: 7,
    },
  },
  "phase81a-integrated-l6-3b-7x10": {
    id: "phase81a-integrated-l6-3b-7x10",
    titleKey: "simulationReport.profile.phase81aIntegratedL6_3B.title",
    descriptionKey: "simulationReport.profile.phase81aIntegratedL6_3B.description",
    measurementRequest: {
      mode: "profile",
      profileId: "phase81a-integrated-l6-3b-7x10",
      worldCount: 7,
      seasonCount: 10,
      includedSectionIds: CAREER_SECTION_IDS,
      detail: "standard",
      seedPrefix: "phase81a-integrated-l6-3b-v1",
      workerCount: 7,
    },
  },
  "phase81a-assist-supply-l6-3c-7x1": {
    id: "phase81a-assist-supply-l6-3c-7x1",
    titleKey: "simulationReport.profile.phase81aAssistSupplyL6_3C.title",
    descriptionKey: "simulationReport.profile.phase81aAssistSupplyL6_3C.description",
    measurementRequest: {
      mode: "profile",
      profileId: "phase81a-assist-supply-l6-3c-7x1",
      worldCount: 7,
      seasonCount: 1,
      includedSectionIds: CAREER_SECTION_IDS,
      detail: "standard",
      seedPrefix: "phase81a-assist-supply-l6-3c-v1",
      workerCount: 7,
    },
  },
  "phase81a-assist-eligibility-l6-3d-7x1": {
    id: "phase81a-assist-eligibility-l6-3d-7x1",
    titleKey: "simulationReport.profile.phase81aAssistEligibilityL6_3D.title",
    descriptionKey: "simulationReport.profile.phase81aAssistEligibilityL6_3D.description",
    measurementRequest: {
      mode: "profile",
      profileId: "phase81a-assist-eligibility-l6-3d-7x1",
      worldCount: 7,
      seasonCount: 1,
      includedSectionIds: CAREER_SECTION_IDS,
      detail: "standard",
      seedPrefix: "phase81a-assist-eligibility-l6-3d-v1",
      workerCount: 7,
    },
  },
  "phase81a-dead-ball-attribution-l6-3e-7x1": {
    id: "phase81a-dead-ball-attribution-l6-3e-7x1",
    titleKey: "simulationReport.profile.phase81aDeadBallAttributionL6_3E.title",
    descriptionKey: "simulationReport.profile.phase81aDeadBallAttributionL6_3E.description",
    measurementRequest: {
      mode: "profile",
      profileId: "phase81a-dead-ball-attribution-l6-3e-7x1",
      worldCount: 7,
      seasonCount: 1,
      includedSectionIds: CAREER_SECTION_IDS,
      detail: "standard",
      seedPrefix: "phase81a-dead-ball-attribution-l6-3e-v1",
      workerCount: 7,
    },
  },
  "phase81a-penalty-award-l6-3f-7x1": {
    id: "phase81a-penalty-award-l6-3f-7x1",
    titleKey: "simulationReport.profile.phase81aPenaltyAwardL6_3F.title",
    descriptionKey: "simulationReport.profile.phase81aPenaltyAwardL6_3F.description",
    measurementRequest: {
      mode: "profile",
      profileId: "phase81a-penalty-award-l6-3f-7x1",
      worldCount: 7,
      seasonCount: 1,
      includedSectionIds: CAREER_SECTION_IDS,
      detail: "standard",
      seedPrefix: "phase81a-penalty-award-l6-3f-v1",
      workerCount: 7,
    },
  },
  "phase81a-direct-free-kick-geometry-l6-3g-14x1": {
    id: "phase81a-direct-free-kick-geometry-l6-3g-14x1",
    titleKey: "simulationReport.profile.phase81aDirectFreeKickGeometryL6_3G.title",
    descriptionKey: "simulationReport.profile.phase81aDirectFreeKickGeometryL6_3G.description",
    measurementRequest: {
      mode: "profile",
      profileId: "phase81a-direct-free-kick-geometry-l6-3g-14x1",
      worldCount: 14,
      seasonCount: 1,
      includedSectionIds: CAREER_SECTION_IDS,
      detail: "standard",
      seedPrefix: "phase81a-direct-free-kick-geometry-l6-3g-v1",
      workerCount: 7,
    },
  },
  "phase81a-direct-free-kick-l6-3h-7x1": {
    id: "phase81a-direct-free-kick-l6-3h-7x1",
    titleKey: "simulationReport.profile.phase81aDirectFreeKickL6_3H.title",
    descriptionKey: "simulationReport.profile.phase81aDirectFreeKickL6_3H.description",
    measurementRequest: {
      mode: "profile",
      profileId: "phase81a-direct-free-kick-l6-3h-7x1",
      worldCount: 7,
      seasonCount: 1,
      includedSectionIds: CAREER_SECTION_IDS,
      detail: "standard",
      seedPrefix: "phase81a-direct-free-kick-l6-3h-v1",
      workerCount: 7,
    },
  },
  "phase81a-renewal-baseline-l6-4-7x10": {
    id: "phase81a-renewal-baseline-l6-4-7x10",
    titleKey: "simulationReport.profile.phase81aRenewalBaselineL6_4.title",
    descriptionKey: "simulationReport.profile.phase81aRenewalBaselineL6_4.description",
    measurementRequest: {
      mode: "profile",
      profileId: "phase81a-renewal-baseline-l6-4-7x10",
      worldCount: 7,
      seasonCount: 10,
      includedSectionIds: CAREER_SECTION_IDS,
      detail: "diagnostic",
      seedPrefix: "phase81a-renewal-baseline-l6-4-v1",
      workerCount: 7,
    },
  },
  "phase81a-succession-priority-l6-5-7x10": {
    id: "phase81a-succession-priority-l6-5-7x10",
    titleKey: "simulationReport.profile.phase81aSuccessionPriorityL6_5.title",
    descriptionKey: "simulationReport.profile.phase81aSuccessionPriorityL6_5.description",
    measurementRequest: {
      mode: "profile",
      profileId: "phase81a-succession-priority-l6-5-7x10",
      worldCount: 7,
      seasonCount: 10,
      includedSectionIds: CAREER_SECTION_IDS,
      detail: "diagnostic",
      seedPrefix: "phase81a-succession-priority-l6-5-v1",
      workerCount: 7,
    },
  },
  "phase81a-succession-target-pool-l6-9b-7x10": {
    id: "phase81a-succession-target-pool-l6-9b-7x10",
    titleKey: "simulationReport.profile.phase81aSuccessionTargetPoolL6_9B.title",
    descriptionKey: "simulationReport.profile.phase81aSuccessionTargetPoolL6_9B.description",
    measurementRequest: {
      mode: "profile",
      profileId: "phase81a-succession-target-pool-l6-9b-7x10",
      worldCount: 7,
      seasonCount: 10,
      includedSectionIds: CAREER_SECTION_IDS,
      detail: "diagnostic",
      seedPrefix: "phase81a-succession-target-pool-l6-9b-v1",
      workerCount: 7,
    },
  },
  "phase81a-succession-affordability-l6-9c-7x10": {
    id: "phase81a-succession-affordability-l6-9c-7x10",
    titleKey: "simulationReport.profile.phase81aSuccessionAffordabilityL6_9C.title",
    descriptionKey: "simulationReport.profile.phase81aSuccessionAffordabilityL6_9C.description",
    measurementRequest: {
      mode: "profile",
      profileId: "phase81a-succession-affordability-l6-9c-7x10",
      worldCount: 7,
      seasonCount: 10,
      includedSectionIds: CAREER_SECTION_IDS,
      detail: "diagnostic",
      seedPrefix: "phase81a-succession-affordability-l6-9c-v1",
      workerCount: 7,
    },
  },
  "phase81a-succession-affordability-l6-9d-7x10": {
    id: "phase81a-succession-affordability-l6-9d-7x10",
    titleKey: "simulationReport.profile.phase81aSuccessionAffordabilityL6_9D.title",
    descriptionKey: "simulationReport.profile.phase81aSuccessionAffordabilityL6_9D.description",
    measurementRequest: {
      mode: "profile",
      profileId: "phase81a-succession-affordability-l6-9d-7x10",
      worldCount: 7,
      seasonCount: 10,
      includedSectionIds: CAREER_SECTION_IDS,
      detail: "diagnostic",
      seedPrefix: "phase81a-succession-affordability-l6-9d-v1",
      workerCount: 7,
    },
  },
  "phase81a-succession-downstream-funnel-l6-12b-cached": {
    id: "phase81a-succession-downstream-funnel-l6-12b-cached",
    titleKey: "simulationReport.profile.phase81aSuccessionDownstreamFunnelL6_12B.title",
    descriptionKey: "simulationReport.profile.phase81aSuccessionDownstreamFunnelL6_12B.description",
    measurementRequest: {
      mode: "profile",
      profileId: "phase81a-succession-downstream-funnel-l6-12b-cached",
      worldCount: 7,
      seasonCount: 10,
      includedSectionIds: CAREER_SECTION_IDS,
      detail: "diagnostic",
      seedPrefix: "phase81a-succession-affordability-l6-9d-v1",
      workerCount: 7,
    },
  },
  "phase81a-succession-growth-feasibility-l6-13-cached": {
    id: "phase81a-succession-growth-feasibility-l6-13-cached",
    titleKey: "simulationReport.profile.phase81aSuccessionGrowthFeasibilityL6_13.title",
    descriptionKey: "simulationReport.profile.phase81aSuccessionGrowthFeasibilityL6_13.description",
    measurementRequest: {
      mode: "profile",
      profileId: "phase81a-succession-growth-feasibility-l6-13-cached",
      worldCount: 7,
      seasonCount: 10,
      includedSectionIds: CAREER_SECTION_IDS,
      detail: "diagnostic",
      seedPrefix: "phase81a-succession-affordability-l6-9d-v1",
      workerCount: 7,
    },
  },
  "phase81a-leader-conversion-l6-15-cached": {
    id: "phase81a-leader-conversion-l6-15-cached",
    titleKey: "simulationReport.profile.phase81aLeaderConversionL6_15.title",
    descriptionKey: "simulationReport.profile.phase81aLeaderConversionL6_15.description",
    measurementRequest: {
      mode: "profile",
      profileId: "phase81a-leader-conversion-l6-15-cached",
      worldCount: 7,
      seasonCount: 10,
      includedSectionIds: CAREER_SECTION_IDS,
      detail: "diagnostic",
      seedPrefix: "phase81a-renewal-baseline-l6-4-v1",
      workerCount: 7,
    },
  },
  "phase81a-mature-leader-conversion-l6-15b-cached": {
    id: "phase81a-mature-leader-conversion-l6-15b-cached",
    titleKey: "simulationReport.profile.phase81aMatureLeaderConversionL6_15B.title",
    descriptionKey: "simulationReport.profile.phase81aMatureLeaderConversionL6_15B.description",
    measurementRequest: {
      mode: "profile",
      profileId: "phase81a-mature-leader-conversion-l6-15b-cached",
      worldCount: 7,
      seasonCount: 10,
      includedSectionIds: CAREER_SECTION_IDS,
      detail: "diagnostic",
      seedPrefix: "phase81a-renewal-baseline-l6-4-v1",
      workerCount: 7,
    },
  },
  "phase81a-leader-quality-feasibility-l6-16-cached": {
    id: "phase81a-leader-quality-feasibility-l6-16-cached",
    titleKey: "simulationReport.profile.phase81aLeaderQualityFeasibilityL6_16.title",
    descriptionKey: "simulationReport.profile.phase81aLeaderQualityFeasibilityL6_16.description",
    measurementRequest: {
      mode: "profile",
      profileId: "phase81a-leader-quality-feasibility-l6-16-cached",
      worldCount: 7,
      seasonCount: 10,
      includedSectionIds: CAREER_SECTION_IDS,
      detail: "diagnostic",
      seedPrefix: "phase81a-renewal-baseline-l6-4-v1",
      workerCount: 7,
    },
  },
  "phase81a-ceiling-distance-l6-18-cached": {
    id: "phase81a-ceiling-distance-l6-18-cached",
    titleKey: "simulationReport.profile.phase81aCeilingDistanceL6_18.title",
    descriptionKey: "simulationReport.profile.phase81aCeilingDistanceL6_18.description",
    measurementRequest: {
      mode: "profile",
      profileId: "phase81a-ceiling-distance-l6-18-cached",
      worldCount: 7,
      seasonCount: 10,
      includedSectionIds: CAREER_SECTION_IDS,
      detail: "diagnostic",
      seedPrefix: "phase81a-renewal-baseline-l6-4-v1",
      workerCount: 7,
    },
  },
  "phase81a-academy-prospect-class-l6-20-7x10": {
    id: "phase81a-academy-prospect-class-l6-20-7x10",
    titleKey: "simulationReport.profile.phase81aAcademyProspectClassL6_20.title",
    descriptionKey: "simulationReport.profile.phase81aAcademyProspectClassL6_20.description",
    measurementRequest: {
      mode: "profile",
      profileId: "phase81a-academy-prospect-class-l6-20-7x10",
      worldCount: 7,
      seasonCount: 10,
      includedSectionIds: CAREER_SECTION_IDS,
      detail: "diagnostic",
      seedPrefix: "phase81a-academy-prospect-class-l6-20-v1",
      workerCount: 7,
    },
  },
  "phase81a-generated-player-lifecycle-l6-23-cached": {
    id: "phase81a-generated-player-lifecycle-l6-23-cached",
    titleKey: "simulationReport.profile.phase81aGeneratedPlayerLifecycleL6_23.title",
    descriptionKey:
      "simulationReport.profile.phase81aGeneratedPlayerLifecycleL6_23.description",
    measurementRequest: {
      mode: "profile",
      profileId: "phase81a-generated-player-lifecycle-l6-23-cached",
      worldCount: 7,
      seasonCount: 10,
      includedSectionIds: CAREER_SECTION_IDS,
      detail: "diagnostic",
      seedPrefix: "phase81a-academy-prospect-class-l6-20-v1",
      workerCount: 7,
    },
  },
  "phase81a-generated-leader-lane-l6-24-cached": {
    id: "phase81a-generated-leader-lane-l6-24-cached",
    titleKey: "simulationReport.profile.phase81aGeneratedLeaderLaneL6_24.title",
    descriptionKey: "simulationReport.profile.phase81aGeneratedLeaderLaneL6_24.description",
    measurementRequest: {
      mode: "profile",
      profileId: "phase81a-generated-leader-lane-l6-24-cached",
      worldCount: 7,
      seasonCount: 10,
      includedSectionIds: CAREER_SECTION_IDS,
      detail: "diagnostic",
      seedPrefix: "phase81a-academy-prospect-class-l6-20-v1",
      workerCount: 7,
    },
  },
  "phase81a-renewal-ladder-l6-26-cached": {
    id: "phase81a-renewal-ladder-l6-26-cached",
    titleKey: "simulationReport.profile.phase81aRenewalLadderL6_26.title",
    descriptionKey: "simulationReport.profile.phase81aRenewalLadderL6_26.description",
    measurementRequest: {
      mode: "profile",
      profileId: "phase81a-renewal-ladder-l6-26-cached",
      worldCount: 7,
      seasonCount: 10,
      includedSectionIds: CAREER_SECTION_IDS,
      detail: "diagnostic",
      seedPrefix: "phase81a-academy-prospect-class-l6-20-v1",
      workerCount: 7,
    },
  },
  "phase81a-population-stationarity-l6-27-cached": {
    id: "phase81a-population-stationarity-l6-27-cached",
    titleKey: "simulationReport.profile.phase81aPopulationStationarityL6_27.title",
    descriptionKey: "simulationReport.profile.phase81aPopulationStationarityL6_27.description",
    measurementRequest: {
      mode: "profile",
      profileId: "phase81a-population-stationarity-l6-27-cached",
      worldCount: 7,
      seasonCount: 10,
      includedSectionIds: CAREER_SECTION_IDS,
      detail: "diagnostic",
      seedPrefix: "phase81a-academy-prospect-class-l6-20-v1",
      workerCount: 7,
    },
  },
  "phase81a-generation-time-stationary-l6-29a-7x10": {
    id: "phase81a-generation-time-stationary-l6-29a-7x10",
    titleKey: "simulationReport.profile.phase81aGenerationTimeStationaryL6_29A.title",
    descriptionKey: "simulationReport.profile.phase81aGenerationTimeStationaryL6_29A.description",
    measurementRequest: {
      mode: "profile",
      profileId: "phase81a-generation-time-stationary-l6-29a-7x10",
      worldCount: 7,
      seasonCount: 10,
      includedSectionIds: CAREER_SECTION_IDS,
      detail: "diagnostic",
      seedPrefix: "phase81a-academy-prospect-class-l6-20-v1",
      workerCount: 7,
    },
  },
  "phase81a-routine-youth-runway-l6-31-control-7x10": {
    id: "phase81a-routine-youth-runway-l6-31-control-7x10",
    titleKey: "simulationReport.profile.phase81aRoutineYouthRunwayL6_31Control.title",
    descriptionKey: "simulationReport.profile.phase81aRoutineYouthRunwayL6_31Control.description",
    measurementRequest: {
      mode: "profile",
      profileId: "phase81a-routine-youth-runway-l6-31-control-7x10",
      worldCount: 7,
      seasonCount: 10,
      includedSectionIds: CAREER_SECTION_IDS,
      detail: "diagnostic",
      seedPrefix: "phase81a-academy-prospect-class-l6-20-v1",
      workerCount: 7,
    },
  },
  "phase81a-routine-youth-runway-l6-31-candidate-7x10": {
    id: "phase81a-routine-youth-runway-l6-31-candidate-7x10",
    titleKey: "simulationReport.profile.phase81aRoutineYouthRunwayL6_31Candidate.title",
    descriptionKey: "simulationReport.profile.phase81aRoutineYouthRunwayL6_31Candidate.description",
    measurementRequest: {
      mode: "profile",
      profileId: "phase81a-routine-youth-runway-l6-31-candidate-7x10",
      worldCount: 7,
      seasonCount: 10,
      includedSectionIds: CAREER_SECTION_IDS,
      detail: "diagnostic",
      seedPrefix: "phase81a-academy-prospect-class-l6-20-v1",
      workerCount: 7,
    },
  },
  "phase81a-routine-youth-runway-l6-31-oos-control-7x10": {
    id: "phase81a-routine-youth-runway-l6-31-oos-control-7x10",
    titleKey: "simulationReport.profile.phase81aRoutineYouthRunwayL6_31Control.title",
    descriptionKey: "simulationReport.profile.phase81aRoutineYouthRunwayL6_31Control.description",
    measurementRequest: {
      mode: "profile",
      profileId: "phase81a-routine-youth-runway-l6-31-oos-control-7x10",
      worldCount: 7,
      seasonCount: 10,
      includedSectionIds: CAREER_SECTION_IDS,
      detail: "diagnostic",
      seedPrefix: "phase81a-routine-youth-runway-l6-31-oos-v1",
      workerCount: 7,
    },
  },
  "phase81a-routine-youth-runway-l6-31-oos-candidate-7x10": {
    id: "phase81a-routine-youth-runway-l6-31-oos-candidate-7x10",
    titleKey: "simulationReport.profile.phase81aRoutineYouthRunwayL6_31Candidate.title",
    descriptionKey: "simulationReport.profile.phase81aRoutineYouthRunwayL6_31Candidate.description",
    measurementRequest: {
      mode: "profile",
      profileId: "phase81a-routine-youth-runway-l6-31-oos-candidate-7x10",
      worldCount: 7,
      seasonCount: 10,
      includedSectionIds: CAREER_SECTION_IDS,
      detail: "diagnostic",
      seedPrefix: "phase81a-routine-youth-runway-l6-31-oos-v1",
      workerCount: 7,
    },
  },
  "phase81a-renewal-ablation-l6-1-control-7x10": renewalAblationProfile(
    "control",
    "simulationReport.profile.phase81aRenewalAblationControl.title",
    "simulationReport.profile.phase81aRenewalAblationControl.description",
  ),
  "phase81a-renewal-ablation-l6-1-market-7x10": renewalAblationProfile(
    "market",
    "simulationReport.profile.phase81aRenewalAblationMarket.title",
    "simulationReport.profile.phase81aRenewalAblationMarket.description",
  ),
  "phase81a-renewal-ablation-l6-1-blueprint-7x10": renewalAblationProfile(
    "blueprint",
    "simulationReport.profile.phase81aRenewalAblationBlueprint.title",
    "simulationReport.profile.phase81aRenewalAblationBlueprint.description",
  ),
  "phase81a-renewal-ablation-l6-1-combined-7x10": renewalAblationProfile(
    "combined",
    "simulationReport.profile.phase81aRenewalAblationCombined.title",
    "simulationReport.profile.phase81aRenewalAblationCombined.description",
  ),
  "phase81a-renewal-refinement-l6-1a-canary-7x1": {
    id: "phase81a-renewal-refinement-l6-1a-canary-7x1",
    titleKey: "simulationReport.profile.phase81aRenewalRefinementCanary.title",
    descriptionKey: "simulationReport.profile.phase81aRenewalRefinementCanary.description",
    measurementRequest: {
      mode: "profile",
      profileId: "phase81a-renewal-refinement-l6-1a-canary-7x1",
      worldCount: 7,
      seasonCount: 1,
      includedSectionIds: CAREER_SECTION_IDS,
      detail: "diagnostic",
      seedPrefix: "phase81a-renewal-refinement-l6-1a-canary-v1",
      workerCount: 7,
    },
  },
  "phase81a-renewal-refinement-l6-1a-28x10": {
    id: "phase81a-renewal-refinement-l6-1a-28x10",
    titleKey: "simulationReport.profile.phase81aRenewalRefinement.title",
    descriptionKey: "simulationReport.profile.phase81aRenewalRefinement.description",
    measurementRequest: {
      mode: "profile",
      profileId: "phase81a-renewal-refinement-l6-1a-28x10",
      worldCount: 28,
      seasonCount: 10,
      includedSectionIds: CAREER_SECTION_IDS,
      detail: "diagnostic",
      seedPrefix: "phase81a-renewal-refinement-l6-1a-v1",
      workerCount: 7,
    },
  },
  "phase81a-independent-owners-l6-1b-canary-7x1": {
    id: "phase81a-independent-owners-l6-1b-canary-7x1",
    titleKey: "simulationReport.profile.phase81aIndependentOwnersCanary.title",
    descriptionKey: "simulationReport.profile.phase81aIndependentOwnersCanary.description",
    measurementRequest: {
      mode: "profile",
      profileId: "phase81a-independent-owners-l6-1b-canary-7x1",
      worldCount: 7,
      seasonCount: 1,
      includedSectionIds: CAREER_SECTION_IDS,
      detail: "diagnostic",
      seedPrefix: "phase81a-independent-owners-l6-1b-canary-v1",
      workerCount: 7,
    },
  },
  "phase81a-independent-owners-l6-1b-28x10": {
    id: "phase81a-independent-owners-l6-1b-28x10",
    titleKey: "simulationReport.profile.phase81aIndependentOwners.title",
    descriptionKey: "simulationReport.profile.phase81aIndependentOwners.description",
    measurementRequest: {
      mode: "profile",
      profileId: "phase81a-independent-owners-l6-1b-28x10",
      worldCount: 28,
      seasonCount: 10,
      includedSectionIds: CAREER_SECTION_IDS,
      detail: "diagnostic",
      seedPrefix: "phase81a-independent-owners-l6-1b-v1",
      workerCount: 7,
    },
  },
  "phase81a-strength-contest-l6-1d-canary-7x1": {
    id: "phase81a-strength-contest-l6-1d-canary-7x1",
    titleKey: "simulationReport.profile.phase81aStrengthContestCanary.title",
    descriptionKey: "simulationReport.profile.phase81aStrengthContestCanary.description",
    measurementRequest: {
      mode: "profile",
      profileId: "phase81a-strength-contest-l6-1d-canary-7x1",
      worldCount: 7,
      seasonCount: 1,
      includedSectionIds: CAREER_SECTION_IDS,
      detail: "diagnostic",
      seedPrefix: "phase81a-strength-contest-l6-1d-canary-v1",
      workerCount: 7,
    },
  },
  "phase81a-strength-contest-l6-1d-28x10": {
    id: "phase81a-strength-contest-l6-1d-28x10",
    titleKey: "simulationReport.profile.phase81aStrengthContest.title",
    descriptionKey: "simulationReport.profile.phase81aStrengthContest.description",
    measurementRequest: {
      mode: "profile",
      profileId: "phase81a-strength-contest-l6-1d-28x10",
      worldCount: 28,
      seasonCount: 10,
      includedSectionIds: CAREER_SECTION_IDS,
      detail: "diagnostic",
      seedPrefix: "phase81a-strength-contest-l6-1d-v1",
      workerCount: 7,
    },
  },
  "phase81a-strength-contest-l6-1d2-canary-7x1": {
    id: "phase81a-strength-contest-l6-1d2-canary-7x1",
    titleKey: "simulationReport.profile.phase81aStrengthContestRetryCanary.title",
    descriptionKey: "simulationReport.profile.phase81aStrengthContestRetryCanary.description",
    measurementRequest: {
      mode: "profile",
      profileId: "phase81a-strength-contest-l6-1d2-canary-7x1",
      worldCount: 7,
      seasonCount: 1,
      includedSectionIds: CAREER_SECTION_IDS,
      detail: "diagnostic",
      seedPrefix: "phase81a-strength-contest-l6-1d2-canary-v1",
      workerCount: 7,
    },
  },
  "phase81a-strength-contest-l6-1d2-28x10": {
    id: "phase81a-strength-contest-l6-1d2-28x10",
    titleKey: "simulationReport.profile.phase81aStrengthContestRetry.title",
    descriptionKey: "simulationReport.profile.phase81aStrengthContestRetry.description",
    measurementRequest: {
      mode: "profile",
      profileId: "phase81a-strength-contest-l6-1d2-28x10",
      worldCount: 28,
      seasonCount: 10,
      includedSectionIds: CAREER_SECTION_IDS,
      detail: "diagnostic",
      seedPrefix: "phase81a-strength-contest-l6-1d2-v1",
      workerCount: 7,
    },
  },
  "phase81a-renewal-common-support-l6-1c-canary-7x1": {
    id: "phase81a-renewal-common-support-l6-1c-canary-7x1",
    titleKey: "simulationReport.profile.phase81aRenewalCommonSupportCanary.title",
    descriptionKey: "simulationReport.profile.phase81aRenewalCommonSupportCanary.description",
    measurementRequest: {
      mode: "profile",
      profileId: "phase81a-renewal-common-support-l6-1c-canary-7x1",
      worldCount: 7,
      seasonCount: 1,
      includedSectionIds: CAREER_SECTION_IDS,
      detail: "diagnostic",
      seedPrefix: "phase81a-renewal-common-support-l6-1c-canary-v1",
      workerCount: 7,
    },
  },
  "phase81a-renewal-common-support-l6-1c-7x10": {
    id: "phase81a-renewal-common-support-l6-1c-7x10",
    titleKey: "simulationReport.profile.phase81aRenewalCommonSupport.title",
    descriptionKey: "simulationReport.profile.phase81aRenewalCommonSupport.description",
    measurementRequest: {
      mode: "profile",
      profileId: "phase81a-renewal-common-support-l6-1c-7x10",
      worldCount: 7,
      seasonCount: 10,
      includedSectionIds: CAREER_SECTION_IDS,
      detail: "diagnostic",
      seedPrefix: "phase81a-renewal-common-support-l6-1c-v1",
      workerCount: 7,
    },
  },
  "phase81a-substitution-minute-l2-7x1": {
    id: "phase81a-substitution-minute-l2-7x1",
    titleKey: "simulationReport.profile.phase81aSubstitutionMinuteL2.title",
    descriptionKey: "simulationReport.profile.phase81aSubstitutionMinuteL2.description",
    measurementRequest: {
      mode: "profile",
      profileId: "phase81a-substitution-minute-l2-7x1",
      worldCount: 7,
      seasonCount: 1,
      includedSectionIds: ["formations"],
      detail: "diagnostic",
      seedPrefix: "phase81a-substitution-minute-l2-v1",
      workerCount: 7,
    },
  },
  "phase81a-availability-aging-l3-7x2": {
    id: "phase81a-availability-aging-l3-7x2",
    titleKey: "simulationReport.profile.phase81aAvailabilityAgingL3.title",
    descriptionKey: "simulationReport.profile.phase81aAvailabilityAgingL3.description",
    measurementRequest: {
      mode: "profile",
      profileId: "phase81a-availability-aging-l3-7x2",
      worldCount: 7,
      seasonCount: 2,
      includedSectionIds: ["formations"],
      detail: "diagnostic",
      seedPrefix: "phase81a-availability-aging-l3-v1",
      workerCount: 7,
    },
  },
  "phase81a-generational-succession-l4-7x10": {
    id: "phase81a-generational-succession-l4-7x10",
    titleKey: "simulationReport.profile.phase81aGenerationalSuccessionL4.title",
    descriptionKey: "simulationReport.profile.phase81aGenerationalSuccessionL4.description",
    measurementRequest: {
      mode: "profile",
      profileId: "phase81a-generational-succession-l4-7x10",
      worldCount: 7,
      seasonCount: 10,
      includedSectionIds: ["development"],
      detail: "diagnostic",
      seedPrefix: "phase81a-league-diversity-canary",
      workerCount: 7,
    },
  },
  "phase81a-youth-minute-pathway-l4-1-7x10": {
    id: "phase81a-youth-minute-pathway-l4-1-7x10",
    titleKey: "simulationReport.profile.phase81aYouthMinutePathwayL4_1.title",
    descriptionKey: "simulationReport.profile.phase81aYouthMinutePathwayL4_1.description",
    measurementRequest: {
      mode: "profile",
      profileId: "phase81a-youth-minute-pathway-l4-1-7x10",
      worldCount: 7,
      seasonCount: 10,
      includedSectionIds: ["development"],
      detail: "diagnostic",
      seedPrefix: "phase81a-league-diversity-canary",
      workerCount: 7,
    },
  },
  "phase81a-career-exit-renewal-l4-2-7x10": {
    id: "phase81a-career-exit-renewal-l4-2-7x10",
    titleKey: "simulationReport.profile.phase81aCareerExitRenewalL4_2.title",
    descriptionKey: "simulationReport.profile.phase81aCareerExitRenewalL4_2.description",
    measurementRequest: {
      mode: "profile",
      profileId: "phase81a-career-exit-renewal-l4-2-7x10",
      worldCount: 7,
      seasonCount: 10,
      includedSectionIds: ["development"],
      detail: "diagnostic",
      seedPrefix: "phase81a-league-diversity-canary",
      workerCount: 7,
    },
  },
  "phase81a-generated-ceiling-l4-3-7x10": {
    id: "phase81a-generated-ceiling-l4-3-7x10",
    titleKey: "simulationReport.profile.phase81aGeneratedCeilingL4_3.title",
    descriptionKey: "simulationReport.profile.phase81aGeneratedCeilingL4_3.description",
    measurementRequest: {
      mode: "profile",
      profileId: "phase81a-generated-ceiling-l4-3-7x10",
      worldCount: 7,
      seasonCount: 10,
      includedSectionIds: ["development"],
      detail: "diagnostic",
      seedPrefix: "phase81a-league-diversity-canary",
      workerCount: 7,
    },
  },
  "phase81a-development-renewal-l4-4-7x10": {
    id: "phase81a-development-renewal-l4-4-7x10",
    titleKey: "simulationReport.profile.phase81aDevelopmentRenewalL4_4.title",
    descriptionKey: "simulationReport.profile.phase81aDevelopmentRenewalL4_4.description",
    measurementRequest: {
      mode: "profile",
      profileId: "phase81a-development-renewal-l4-4-7x10",
      worldCount: 7,
      seasonCount: 10,
      includedSectionIds: ["development"],
      detail: "diagnostic",
      seedPrefix: "phase81a-league-diversity-canary",
      workerCount: 7,
    },
  },
  "phase81a-annual-role-continuity-l4-5-7x2": {
    id: "phase81a-annual-role-continuity-l4-5-7x2",
    titleKey: "simulationReport.profile.phase81aAnnualRoleContinuityL4_5.title",
    descriptionKey: "simulationReport.profile.phase81aAnnualRoleContinuityL4_5.description",
    measurementRequest: {
      mode: "profile",
      profileId: "phase81a-annual-role-continuity-l4-5-7x2",
      worldCount: 7,
      seasonCount: 2,
      includedSectionIds: ["formations", "development"],
      detail: "diagnostic",
      seedPrefix: "phase81a-league-diversity-canary",
      workerCount: 7,
    },
  },
  "phase81a-l5-1-owner-attribution-7x10": {
    id: "phase81a-l5-1-owner-attribution-7x10",
    titleKey: "simulationReport.profile.phase81aOwnerAttributionL5_1.title",
    descriptionKey: "simulationReport.profile.phase81aOwnerAttributionL5_1.description",
    measurementRequest: {
      mode: "profile",
      profileId: "phase81a-l5-1-owner-attribution-7x10",
      worldCount: 7,
      seasonCount: 10,
      includedSectionIds: ["formations", "development"],
      detail: "diagnostic",
      seedPrefix: "phase81a-league-diversity-canary",
      workerCount: 7,
    },
  },
  "phase81a-player-renewal-leaders-l5-3-7x10": {
    id: "phase81a-player-renewal-leaders-l5-3-7x10",
    titleKey: "simulationReport.profile.phase81aPlayerRenewalLeadersL5_3.title",
    descriptionKey: "simulationReport.profile.phase81aPlayerRenewalLeadersL5_3.description",
    measurementRequest: {
      mode: "profile",
      profileId: "phase81a-player-renewal-leaders-l5-3-7x10",
      worldCount: 7,
      seasonCount: 10,
      includedSectionIds: ["players", "formations", "development"],
      detail: "diagnostic",
      seedPrefix: "phase81a-player-renewal-leaders-l5-3-v1",
      workerCount: 7,
    },
  },
  "phase81a-player-renewal-leaders-l5-3a-7x10": {
    id: "phase81a-player-renewal-leaders-l5-3a-7x10",
    titleKey: "simulationReport.profile.phase81aPlayerRenewalLeadersL5_3.title",
    descriptionKey: "simulationReport.profile.phase81aPlayerRenewalLeadersL5_3.description",
    measurementRequest: {
      mode: "profile",
      profileId: "phase81a-player-renewal-leaders-l5-3a-7x10",
      worldCount: 7,
      seasonCount: 10,
      includedSectionIds: ["players", "formations", "development"],
      detail: "diagnostic",
      seedPrefix: "phase81a-player-renewal-leaders-l5-3a-v1",
      workerCount: 7,
    },
  },
  "phase81a-player-renewal-leaders-l5-3b-7x10": {
    id: "phase81a-player-renewal-leaders-l5-3b-7x10",
    titleKey: "simulationReport.profile.phase81aPlayerRenewalLeadersL5_3.title",
    descriptionKey: "simulationReport.profile.phase81aPlayerRenewalLeadersL5_3.description",
    measurementRequest: {
      mode: "profile",
      profileId: "phase81a-player-renewal-leaders-l5-3b-7x10",
      worldCount: 7,
      seasonCount: 10,
      includedSectionIds: ["players", "formations", "development"],
      detail: "diagnostic",
      seedPrefix: "phase81a-player-renewal-leaders-l5-3b-v1",
      workerCount: 7,
    },
  },
  "phase81a-renewal-architecture-l5-3c-7x10": {
    id: "phase81a-renewal-architecture-l5-3c-7x10",
    titleKey: "simulationReport.profile.phase81aRenewalArchitectureL5_3C.title",
    descriptionKey: "simulationReport.profile.phase81aRenewalArchitectureL5_3C.description",
    measurementRequest: {
      mode: "profile",
      profileId: "phase81a-renewal-architecture-l5-3c-7x10",
      worldCount: 7,
      seasonCount: 10,
      includedSectionIds: ["players", "formations", "development"],
      detail: "diagnostic",
      seedPrefix: "phase81a-renewal-architecture-l5-3c-v1",
      workerCount: 7,
    },
  },
  "phase81a-standings-hierarchy-l5-2-7x2": {
    id: "phase81a-standings-hierarchy-l5-2-7x2",
    titleKey: "simulationReport.profile.phase81aStandingsHierarchyL5_2.title",
    descriptionKey: "simulationReport.profile.phase81aStandingsHierarchyL5_2.description",
    measurementRequest: {
      mode: "profile",
      profileId: "phase81a-standings-hierarchy-l5-2-7x2",
      worldCount: 7,
      seasonCount: 2,
      includedSectionIds: ["season", "standings", "formations"],
      detail: "diagnostic",
      seedPrefix: "phase81a-standings-hierarchy-l5-2-v1",
      workerCount: 7,
    },
  },
  "phase81a-standings-hierarchy-l5-2a-7x10": {
    id: "phase81a-standings-hierarchy-l5-2a-7x10",
    titleKey: "simulationReport.profile.phase81aStandingsHierarchyL5_2a.title",
    descriptionKey: "simulationReport.profile.phase81aStandingsHierarchyL5_2a.description",
    measurementRequest: {
      mode: "profile",
      profileId: "phase81a-standings-hierarchy-l5-2a-7x10",
      worldCount: 7,
      seasonCount: 10,
      includedSectionIds: ["season", "standings", "formations"],
      detail: "diagnostic",
      seedPrefix: "phase81a-standings-hierarchy-l5-2a-v1",
      workerCount: 7,
    },
  },
  "phase81a-standings-hierarchy-l5-2b-7x10": {
    id: "phase81a-standings-hierarchy-l5-2b-7x10",
    titleKey: "simulationReport.profile.phase81aStandingsHierarchyL5_2a.title",
    descriptionKey: "simulationReport.profile.phase81aStandingsHierarchyL5_2a.description",
    measurementRequest: {
      mode: "profile",
      profileId: "phase81a-standings-hierarchy-l5-2b-7x10",
      worldCount: 7,
      seasonCount: 10,
      includedSectionIds: ["season", "standings", "formations"],
      detail: "diagnostic",
      seedPrefix: "phase81a-standings-hierarchy-l5-2b-v1",
      workerCount: 7,
    },
  },
  "phase81a-standings-hierarchy-l5-2c-7x10": {
    id: "phase81a-standings-hierarchy-l5-2c-7x10",
    titleKey: "simulationReport.profile.phase81aStandingsHierarchyL5_2a.title",
    descriptionKey: "simulationReport.profile.phase81aStandingsHierarchyL5_2a.description",
    measurementRequest: {
      mode: "profile",
      profileId: "phase81a-standings-hierarchy-l5-2c-7x10",
      worldCount: 7,
      seasonCount: 10,
      includedSectionIds: ["season", "standings", "formations"],
      detail: "diagnostic",
      seedPrefix: "phase81a-standings-hierarchy-l5-2c-v1",
      workerCount: 7,
    },
  },
  "phase81a-standings-hierarchy-l5-2d-7x10": {
    id: "phase81a-standings-hierarchy-l5-2d-7x10",
    titleKey: "simulationReport.profile.phase81aStandingsHierarchyL5_2a.title",
    descriptionKey: "simulationReport.profile.phase81aStandingsHierarchyL5_2a.description",
    measurementRequest: {
      mode: "profile",
      profileId: "phase81a-standings-hierarchy-l5-2d-7x10",
      worldCount: 7,
      seasonCount: 10,
      includedSectionIds: ["season", "standings", "formations"],
      detail: "diagnostic",
      seedPrefix: "phase81a-standings-hierarchy-l5-2d-v1",
      workerCount: 7,
    },
  },
  "phase81a-league-diversity-100x10": {
    id: "phase81a-league-diversity-100x10",
    titleKey: "simulationReport.profile.phase81aLeagueDiversity.title",
    descriptionKey: "simulationReport.profile.phase81aLeagueDiversity.description",
    measurementRequest: {
      mode: "profile",
      profileId: "phase81a-league-diversity-100x10",
      worldCount: 100,
      seasonCount: 10,
      includedSectionIds: CAREER_SECTION_IDS,
      detail: "standard",
      seedPrefix: "phase81a-league-diversity",
      workerCount: 7,
    },
  },
  "phase81-tactical-shape": {
    id: "phase81-tactical-shape",
    titleKey: "simulationReport.profile.phase81Shape.title",
    descriptionKey: "simulationReport.profile.phase81Shape.description",
    measurementRequest: {
      mode: "profile",
      profileId: "phase81-tactical-shape",
      worldCount: 1,
      seasonCount: 1,
      includedSectionIds: ["tactical_shape"],
      detail: "diagnostic",
      seedPrefix: DEFAULT_TACTICAL_SHAPE_SEED_PREFIX,
      workerCount: 1,
    },
  },
  ...Object.fromEntries(LOCKED_MIGRATION_PROFILE_IDS.map((id) => [id, {
    id,
    titleKey: "simulationReport.profile.migrated.title" as MessageKey,
    descriptionKey: "simulationReport.profile.migrated.description" as MessageKey,
    measurementRequest: {
      ...LOCKED_PROFILE_MEASUREMENTS[id],
      profileId: id,
    },
  }])) as Record<LockedMigrationProfileId, SimulationReportProfileDefinition>,
} as const satisfies Record<SimulationReportProfileId, SimulationReportProfileDefinition>;

export interface SimulationReportSectionExecution {
  readonly data: SimulationReportJsonValue;
  readonly decision: "PASS" | "FAIL" | "NOT_EVALUATED";
  readonly calibrationVersions: Readonly<Record<string, string>>;
  readonly worldSeeds: readonly string[];
}

/** Executes the closed plan once and assembles all explicit section statuses. */
export async function createSimulationReportFromPlan(input: {
  readonly measurementRequest: SimulationReportMeasurementRequest;
  readonly executionNodes: readonly SimulationReportExecutionNode[];
  readonly onModuleExecution?: (moduleId: SimulationReportModuleId) => void;
}): Promise<SimulationReportArtifact> {
  const requested = new Set(input.measurementRequest.includedSectionIds);
  const executions = new Map<SimulationReportModuleId, SimulationReportSectionExecution>();
  const lockedProfileId = lockedProfileIdFor(input.measurementRequest.profileId);
  if (lockedProfileId !== undefined) {
    const locked = await createLockedProfileFacts(lockedProfileId);
    for (const moduleId of input.measurementRequest.includedSectionIds.map(assertModuleId)) {
      input.onModuleExecution?.(moduleId);
      const data = locked.sections[moduleId];
      if (data === undefined) throw new Error(`Locked profile ${lockedProfileId} omitted ${moduleId}`);
      executions.set(moduleId, {
        data,
        decision: locked.decision,
        calibrationVersions: locked.calibrationVersions,
        worldSeeds: locked.worldSeeds,
      });
    }
  }
  const requestedCareerSections = CAREER_SECTION_IDS.filter((id) => requested.has(id));
  if (lockedProfileId === undefined && requestedCareerSections.length > 0) {
    for (const moduleId of requestedCareerSections) input.onModuleExecution?.(moduleId);
    const facts = await createCareerSectionsFacts({
      worldSeeds: worldSeedsForRequest(input.measurementRequest),
      seasonCount: input.measurementRequest.seasonCount,
      workerCount: input.measurementRequest.workerCount,
      detail: input.measurementRequest.detail,
      sectionIds: requestedCareerSections,
      ...(await leagueDiversityExecution(input.measurementRequest.profileId)),
    });
    for (const moduleId of requestedCareerSections) {
      const data = facts.sections[moduleId];
      if (data === undefined) throw new Error(`Career execution omitted ${moduleId}`);
      executions.set(moduleId, {
        data,
        decision: facts.decision,
        calibrationVersions: facts.calibrationVersions,
        worldSeeds: facts.worldSeeds,
      });
    }
  }
  for (const moduleId of SIMULATION_REPORT_MODULE_IDS) {
    if (!requested.has(moduleId)) continue;
    if (isCareerSectionId(moduleId)) continue;
    if (lockedProfileId !== undefined) continue;
    if (
      input.measurementRequest.mode === "custom"
      && !SIMULATION_REPORT_MODULES[moduleId].customReachable
    ) continue;
    input.onModuleExecution?.(moduleId);
    executions.set(
      moduleId,
      await executeSimulationReportModule(moduleId, input.measurementRequest),
    );
  }
  const calibrationVersions: Record<string, string> = {};
  for (const execution of executions.values()) {
    for (const [key, version] of Object.entries(execution.calibrationVersions)) {
      const existing = calibrationVersions[key];
      if (existing !== undefined && existing !== version) {
        throw new Error(`Report modules disagree about ${key}: ${existing} != ${version}`);
      }
      calibrationVersions[key] = version;
    }
  }
  const decisions = [...executions.values()].map(({ decision }) => decision);
  return createSimulationReportArtifact({
    measurementRequest: input.measurementRequest,
    manifest: {
      worldSeeds: [...new Set(
        [...executions.values()].flatMap(({ worldSeeds }) => worldSeeds),
      )],
      executionNodes: input.executionNodes,
      calibrationVersions,
    },
    sections: SIMULATION_REPORT_MODULE_IDS.map((id) => {
      const execution = executions.get(id);
      return execution === undefined
        ? requested.has(id)
          ? {
              id,
              status: "not_observed" as const,
              reason: "the requested module requires its locked profile population",
            }
          : { id, status: "not_requested" as const, reason: "not requested" }
        : { id, status: "observed" as const, data: execution.data };
    }),
    decision: decisions.some((decision) => decision === "FAIL")
      ? "FAIL"
      : decisions.every((decision) => decision === "NOT_EVALUATED")
        ? "NOT_EVALUATED"
        : "PASS",
  });
}

/** Executes one registered module without dispatching another report command. */
export async function executeSimulationReportModule(
  moduleId: SimulationReportModuleId,
  request: SimulationReportMeasurementRequest,
): Promise<SimulationReportSectionExecution> {
  const lockedProfileId = lockedProfileIdFor(request.profileId);
  if (lockedProfileId !== undefined) {
    const facts = await createLockedProfileFacts(lockedProfileId);
    const data = facts.sections[moduleId];
    if (data === undefined) throw new Error(`Locked profile ${lockedProfileId} omitted ${moduleId}`);
    return {
      data,
      decision: facts.decision,
      calibrationVersions: facts.calibrationVersions,
      worldSeeds: facts.worldSeeds,
    };
  }
  if (isCareerSectionId(moduleId)) {
    const facts = await createCareerSectionsFacts({
      worldSeeds: worldSeedsForRequest(request),
      seasonCount: request.seasonCount,
      workerCount: request.workerCount,
      detail: request.detail,
      sectionIds: [moduleId],
      ...(await leagueDiversityExecution(request.profileId)),
    });
    const data = facts.sections[moduleId];
    if (data === undefined) throw new Error(`Career execution omitted ${moduleId}`);
    return {
      data,
      decision: facts.decision,
      calibrationVersions: facts.calibrationVersions,
      worldSeeds: facts.worldSeeds,
    };
  }

  if (moduleId === "tactical_agency") {
    if (request.profileId === null) {
      const facts = await createTacticalAgencySectionFacts({
        worldSeed: request.seedPrefix,
        worldCount: request.worldCount,
        roundCount: DEFAULT_TACTICAL_AGENCY_ROUND_COUNT,
        seedPrefix: `${request.seedPrefix}-low-block`,
        pairedSeedCount: DEFAULT_TACTICAL_AGENCY_PAIRED_SEEDS,
        workerCount: request.workerCount,
        checkpointMode: false,
      });
      return {
        data: toSimulationReportJsonValue(facts.report),
        decision: "PASS",
        calibrationVersions: {
          matchTactics: facts.report.manifest.matchTacticsCalibrationVersion,
          tacticalAgencyModule: "custom-v1-round4-paired40",
        },
        worldSeeds: facts.report.manifest.worldSeeds,
      };
    }
    if (request.profileId === "phase81a-b") {
      const facts = await createTacticalAgencyBProfileFacts({ workerCount: request.workerCount });
      return {
        data: toSimulationReportJsonValue({
          ...facts.analysis,
          execution: {
            workerCount: facts.workerCount,
            partitionCount: facts.workerCount,
            elapsedMilliseconds: facts.elapsedMilliseconds,
          },
        }),
        decision: facts.analysis.decision === "PASS_PHASE_1" ? "NOT_EVALUATED" : "FAIL",
        calibrationVersions: facts.calibrationVersions,
        worldSeeds: facts.worldSeeds,
      };
    }
    if (request.profileId === "phase81a-b2") {
      const facts = await createTacticalAgencyB2ProfileFacts({ workerCount: request.workerCount });
      return {
        data: toSimulationReportJsonValue({
          sets: facts.sets,
          originalDominance: facts.originalDominance,
          decision: facts.decision,
          execution: {
            workerCount: facts.workerCount,
            partitionCount: facts.workerCount,
            elapsedMilliseconds: facts.elapsedMilliseconds,
          },
        }),
        decision: facts.decision === "GO" ? "PASS" : "FAIL",
        calibrationVersions: facts.calibrationVersions,
        worldSeeds: facts.worldSeeds,
      };
    }
    if (request.profileId === "phase81a-b2-materiality") {
      const facts = await createTacticalAgencyB2MaterialityProfileFacts({
        workerCount: request.workerCount,
      });
      return {
        data: toSimulationReportJsonValue({
          sets: facts.sets,
          owner: facts.owner,
          decision: facts.decision,
          execution: {
            workerCount: facts.workerCount,
            partitionCount: facts.workerCount,
            elapsedMilliseconds: facts.elapsedMilliseconds,
          },
        }),
        decision: facts.decision === "OWNER_IDENTIFIED" ? "NOT_EVALUATED" : "FAIL",
        calibrationVersions: facts.calibrationVersions,
        worldSeeds: facts.worldSeeds,
      };
    }
    if (request.profileId === "phase81a-b2-current-materiality") {
      const facts = await createTacticalAgencyB2CurrentMaterialityProfileFacts({
        workerCount: request.workerCount,
      });
      return {
        data: toSimulationReportJsonValue({
          sets: facts.sets,
          decision: facts.decision,
          execution: {
            workerCount: facts.workerCount,
            partitionCount: facts.workerCount,
            elapsedMilliseconds: facts.elapsedMilliseconds,
          },
        }),
        decision: facts.decision === "MATERIALITY_PASS" ? "NOT_EVALUATED" : "FAIL",
        calibrationVersions: facts.calibrationVersions,
        worldSeeds: facts.worldSeeds,
      };
    }
    if (request.profileId === "phase81a-b2-attribution") {
      const facts = await createTacticalAgencyB21ProfileFacts({ workerCount: request.workerCount });
      return {
        data: toSimulationReportJsonValue({
          sets: facts.sets,
          tacticalOwner: facts.tacticalOwner,
          firstCoherentComponent: facts.firstCoherentComponent,
          formation: facts.formation,
          b2Reproduced: facts.b2Reproduced,
          decision: facts.decision,
          execution: {
            workerCount: facts.workerCount,
            partitionCount: facts.workerCount,
            elapsedMilliseconds: facts.elapsedMilliseconds,
          },
        }),
        decision: facts.decision === "OWNER_IDENTIFIED" ? "NOT_EVALUATED" : "FAIL",
        calibrationVersions: facts.calibrationVersions,
        worldSeeds: facts.worldSeeds,
      };
    }
    if (request.profileId === "phase81a-b2-identity-family") {
      const facts = await createTacticalAgencyB21AProfileFacts({ workerCount: request.workerCount });
      return {
        data: toSimulationReportJsonValue({
          b2Reproduced: facts.b2Reproduced,
          formation: facts.formation,
          family: facts.family,
          decision: facts.decision,
          execution: {
            workerCount: facts.workerCount,
            partitionCount: facts.workerCount,
            elapsedMilliseconds: facts.elapsedMilliseconds,
          },
        }),
        decision: facts.decision === "IDENTITY_FAMILY" || facts.decision === "SAMPLING_ONLY"
          ? "NOT_EVALUATED"
          : "FAIL",
        calibrationVersions: facts.calibrationVersions,
        worldSeeds: facts.worldSeeds,
      };
    }
    assertProfile(request, "phase81a-a2");
    const facts = await createTacticalAgencyA2ProfileFacts({
      worldSeed: DEFAULT_TACTICAL_AGENCY_WORLD_SEED,
      worldCount: DEFAULT_TACTICAL_AGENCY_WORLD_COUNT,
      roundCount: DEFAULT_TACTICAL_AGENCY_ROUND_COUNT,
      seedPrefix: DEFAULT_TACTICAL_AGENCY_SEED_PREFIX,
      pairedSeedCount: DEFAULT_TACTICAL_AGENCY_PAIRED_SEEDS,
      workerCount: request.workerCount,
      checkpointMode: true,
    });
    return {
      data: toSimulationReportJsonValue(facts.checkpoint),
      decision: facts.checkpoint.decision === "GO" ? "PASS" : "FAIL",
      calibrationVersions: facts.calibrationVersions,
      worldSeeds: facts.checkpoint.sets.flatMap(({ worldSeeds }) => worldSeeds),
    };
  }

  assertProfile(request, "phase81-tactical-shape");
  const facts = createTacticalShapeSectionFacts({
    worldSeed: DEFAULT_TACTICAL_SHAPE_WORLD_SEED,
    seedPrefix: DEFAULT_TACTICAL_SHAPE_SEED_PREFIX,
    pairedSeedCount: DEFAULT_TACTICAL_SHAPE_PAIRED_SEEDS,
    scenarioPairedSeedCount: DEFAULT_TACTICAL_SHAPE_SCENARIO_PAIRED_SEEDS,
    formationPairedSeedCount: DEFAULT_TACTICAL_SHAPE_FORMATION_PAIRED_SEEDS,
  });
  return {
    data: toSimulationReportJsonValue(facts),
    decision: facts.report.invariants.some(({ status }) => status === "fail") ? "FAIL" : "PASS",
    calibrationVersions: {
      tacticalShapeContract: facts.report.contractVersion,
    },
    worldSeeds: [facts.measurement.worldSeed],
  };
}

function isCareerSectionId(id: SimulationReportModuleId): id is CareerSectionId {
  return CAREER_SECTION_IDS.includes(id as CareerSectionId);
}

function careerModule(id: Exclude<CareerSectionId, "season">): SimulationReportModuleDefinition {
  const titleKeys: Record<Exclude<CareerSectionId, "season">, MessageKey> = {
    standings: "simulationReport.module.standings.title",
    players: "simulationReport.module.players.title",
    transfers: "simulationReport.module.transfers.title",
    formations: "simulationReport.module.formations.title",
    economy: "simulationReport.module.economy.title",
    development: "simulationReport.module.development.title",
    anomalies: "simulationReport.module.anomalies.title",
  };
  const descriptionKeys: Record<Exclude<CareerSectionId, "season">, MessageKey> = {
    standings: "simulationReport.module.standings.description",
    players: "simulationReport.module.players.description",
    transfers: "simulationReport.module.transfers.description",
    formations: "simulationReport.module.formations.description",
    economy: "simulationReport.module.economy.description",
    development: "simulationReport.module.development.description",
    anomalies: "simulationReport.module.anomalies.description",
  };
  return {
    id,
    titleKey: titleKeys[id],
    descriptionKey: descriptionKeys[id],
    unavailableClaimKey: "simulationReport.module.career.excludes",
    customReachable: true,
    executionNodes: [
      { key: "career_world", depth: "career" },
      { key: `${id}_projection`, depth: "season" },
    ],
  };
}

/** Stable world seeds are derived once and recorded in the manifest. */
export function worldSeedsForRequest(
  request: SimulationReportMeasurementRequest,
): readonly string[] {
  return Array.from(
    { length: request.worldCount },
    (_unused, index) => `${request.seedPrefix}-world-${String(index + 1).padStart(5, "0")}`,
  );
}

function assertProfile(
  request: SimulationReportMeasurementRequest,
  expected: SimulationReportProfileId,
): void {
  if (request.profileId !== expected) {
    throw new Error(`${expected} is the only profile that reaches this module`);
  }
}

function lockedProfileIdFor(value: string | null): LockedMigrationProfileId | undefined {
  return LOCKED_MIGRATION_PROFILE_IDS.includes(value as LockedMigrationProfileId)
    ? value as LockedMigrationProfileId
    : undefined;
}

const READ_ONLY_CAREER_PROFILE_CACHES: Readonly<Partial<Record<
  keyof typeof CAREER_PROFILE_CHECKPOINT_KIND,
  {
    readonly profileId: string;
    readonly directory: string;
  }
>>> = {
  "phase81a-succession-downstream-funnel-l6-12b-cached": {
    profileId: "phase81a-succession-wage-buffer-l6-10-7x10:qualified_succession_selection",
    directory:
      "saves/long-run-checkpoints/phase81a-succession-wage-buffer-l6-10-7x10-facts-v2/qualified_succession_selection",
  },
  "phase81a-succession-growth-feasibility-l6-13-cached": {
    profileId: "phase81a-succession-wage-buffer-l6-10-7x10:qualified_succession_selection",
    directory:
      "saves/long-run-checkpoints/phase81a-succession-wage-buffer-l6-10-7x10-facts-v2/qualified_succession_selection",
  },
  "phase81a-leader-conversion-l6-15-cached": {
    profileId: "phase81a-renewal-baseline-l6-4-7x10",
    directory: "saves/long-run-checkpoints/phase81a-renewal-baseline-l6-4-7x10-facts-v1",
  },
  "phase81a-mature-leader-conversion-l6-15b-cached": {
    profileId: "phase81a-renewal-baseline-l6-4-7x10",
    directory: "saves/long-run-checkpoints/phase81a-renewal-baseline-l6-4-7x10-facts-v1",
  },
  "phase81a-leader-quality-feasibility-l6-16-cached": {
    profileId: "phase81a-renewal-baseline-l6-4-7x10",
    directory: "saves/long-run-checkpoints/phase81a-renewal-baseline-l6-4-7x10-facts-v1",
  },
  "phase81a-ceiling-distance-l6-18-cached": {
    profileId: "phase81a-academy-ceiling-current-l6-17-7x10",
    directory:
      "saves/long-run-checkpoints/phase81a-academy-ceiling-current-l6-17-7x10-facts-v1",
  },
  "phase81a-generated-player-lifecycle-l6-23-cached": {
    profileId: "phase81a-academy-prospect-class-l6-20-7x10",
    directory:
      "saves/long-run-checkpoints/phase81a-academy-prospect-class-l6-20-7x10-facts-v1",
  },
  "phase81a-generated-leader-lane-l6-24-cached": {
    profileId: "phase81a-academy-prospect-class-l6-20-7x10",
    directory:
      "saves/long-run-checkpoints/phase81a-academy-prospect-class-l6-20-7x10-facts-v1",
  },
  "phase81a-renewal-ladder-l6-26-cached": {
    profileId: "phase81a-academy-prospect-class-l6-20-7x10",
    directory:
      "saves/long-run-checkpoints/phase81a-academy-prospect-class-l6-20-7x10-facts-v1",
  },
  "phase81a-population-stationarity-l6-27-cached": {
    profileId: "phase81a-academy-prospect-class-l6-20-7x10",
    directory:
      "saves/long-run-checkpoints/phase81a-academy-prospect-class-l6-20-7x10-facts-v1",
  },
};

async function leagueDiversityExecution(
  profileId: string | null,
): Promise<{
  readonly leagueDiversityProfile?: {
    readonly profileId: string;
    readonly checkpointDirectoryPath: string;
    readonly checkpointKind: CareerCheckpointKind;
    readonly readOnly?: boolean;
    readonly renewalAblationArm?: RenewalAblationArm;
    readonly renewalRefinementMode?: "canary" | "full";
    readonly independentOwnersMode?: "canary" | "full";
    readonly strengthContestMode?: StrengthContestMode;
    readonly renewalCommonSupportMode?: "canary" | "full";
    readonly successionPriorityMode?: "l6_5";
    readonly generatedLifecycleComparison?: {
      readonly profileId: string;
      readonly checkpointDirectoryPath: string;
    };
    readonly routineYouthRunwayMode?: "control" | "candidate";
    readonly routineYouthRunwayComparison?: {
      readonly profileId: string;
      readonly checkpointDirectoryPath: string;
    };
  };
}> {
  if (profileId === null || !Object.hasOwn(CAREER_PROFILE_CHECKPOINT_KIND, profileId)) return {};
  const careerProfileId = profileId as keyof typeof CAREER_PROFILE_CHECKPOINT_KIND;
  const readOnlyCache = READ_ONLY_CAREER_PROFILE_CACHES[careerProfileId];
  const cacheIdentityProfileId = careerProfileId === "phase81a-integrated-l5-4h-reeval-7x10"
    ? "phase81a-integrated-l5-4-7x10"
    : readOnlyCache?.profileId ?? careerProfileId;
  const checkpointDirectory = readOnlyCache?.directory
    ?? `saves/long-run-checkpoints/${careerProfileId}${CAREER_PROFILE_CACHE_SUFFIX[careerProfileId]}`;
  const renewalAblationArm = renewalAblationArmForProfile(careerProfileId);
  const renewalRefinementMode = careerProfileId === "phase81a-renewal-refinement-l6-1a-canary-7x1"
    ? "canary" as const
    : careerProfileId === "phase81a-renewal-refinement-l6-1a-28x10"
      ? "full" as const
      : undefined;
  const independentOwnersMode = careerProfileId === "phase81a-independent-owners-l6-1b-canary-7x1"
    ? "canary" as const
    : careerProfileId === "phase81a-independent-owners-l6-1b-28x10"
      ? "full" as const
      : undefined;
  const strengthContestMode = careerProfileId === "phase81a-strength-contest-l6-1d-canary-7x1"
    ? "canary" as const
    : careerProfileId === "phase81a-strength-contest-l6-1d-28x10"
      ? "full" as const
      : careerProfileId === "phase81a-strength-contest-l6-1d2-canary-7x1"
        ? "retry_canary" as const
        : careerProfileId === "phase81a-strength-contest-l6-1d2-28x10"
          ? "retry_full" as const
          : undefined;
  const renewalCommonSupportMode =
    careerProfileId === "phase81a-renewal-common-support-l6-1c-canary-7x1"
      ? "canary" as const
      : careerProfileId === "phase81a-renewal-common-support-l6-1c-7x10"
        ? "full" as const
        : undefined;
  const successionPriorityMode =
    careerProfileId === "phase81a-succession-priority-l6-5-7x10"
      ? "l6_5" as const
      : undefined;
  const generatedLifecycleComparison =
    careerProfileId === "phase81a-generated-player-lifecycle-l6-23-cached"
      ? {
          profileId: "phase81a-factorial-combined-l6-22-7x10",
          checkpointDirectoryPath: await resolveWorkspaceOutputPath(
            "saves/long-run-checkpoints/phase81a-factorial-combined-l6-22-7x10-facts-v1",
          ),
        }
      : undefined;
  const routineYouthRunwayMode =
    careerProfileId === "phase81a-routine-youth-runway-l6-31-control-7x10"
      || careerProfileId === "phase81a-routine-youth-runway-l6-31-oos-control-7x10"
      ? "control" as const
      : careerProfileId === "phase81a-routine-youth-runway-l6-31-candidate-7x10"
        || careerProfileId === "phase81a-routine-youth-runway-l6-31-oos-candidate-7x10"
        ? "candidate" as const
        : undefined;
  const routineYouthRunwayComparison = routineYouthRunwayMode === "candidate"
    ? {
        profileId: careerProfileId === "phase81a-routine-youth-runway-l6-31-oos-candidate-7x10"
          ? "phase81a-routine-youth-runway-l6-31-oos-control-7x10"
          : "phase81a-routine-youth-runway-l6-31-control-7x10",
        checkpointDirectoryPath: await resolveWorkspaceOutputPath(
          careerProfileId === "phase81a-routine-youth-runway-l6-31-oos-candidate-7x10"
            ? "saves/long-run-checkpoints/phase81a-routine-youth-runway-l6-31-oos-control-7x10-facts-v2"
            : "saves/long-run-checkpoints/phase81a-routine-youth-runway-l6-31-control-7x10-facts-v2",
        ),
      }
    : undefined;
  return {
    leagueDiversityProfile: {
      profileId: cacheIdentityProfileId,
      checkpointKind: CAREER_PROFILE_CHECKPOINT_KIND[careerProfileId],
      checkpointDirectoryPath: await resolveWorkspaceOutputPath(
        checkpointDirectory,
      ),
      readOnly: careerProfileId === "phase81a-integrated-l5-4h-reeval-7x10"
        || readOnlyCache !== undefined,
      ...(renewalAblationArm === undefined ? {} : { renewalAblationArm }),
      ...(renewalRefinementMode === undefined ? {} : { renewalRefinementMode }),
      ...(independentOwnersMode === undefined ? {} : { independentOwnersMode }),
      ...(strengthContestMode === undefined ? {} : { strengthContestMode }),
      ...(renewalCommonSupportMode === undefined ? {} : { renewalCommonSupportMode }),
      ...(successionPriorityMode === undefined ? {} : { successionPriorityMode }),
      ...(generatedLifecycleComparison === undefined
        ? {}
        : { generatedLifecycleComparison }),
      ...(routineYouthRunwayMode === undefined ? {} : { routineYouthRunwayMode }),
      ...(routineYouthRunwayComparison === undefined
        ? {}
        : { routineYouthRunwayComparison }),
    },
  };
}

function renewalAblationArmForProfile(
  profileId: keyof typeof CAREER_PROFILE_CHECKPOINT_KIND,
): RenewalAblationArm | undefined {
  return (Object.entries(RENEWAL_ABLATION_PROFILE_ID) as readonly [
    RenewalAblationArm,
    SimulationReportProfileId,
  ][]).find(([, id]) => id === profileId)?.[0];
}

function assertModuleId(value: string): SimulationReportModuleId {
  if (!SIMULATION_REPORT_MODULE_IDS.includes(value as SimulationReportModuleId)) {
    throw new Error(`Locked profile contains unknown module ${value}`);
  }
  return value as SimulationReportModuleId;
}
