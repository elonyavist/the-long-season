import type { ContextualProspectClass } from "@game/content";

import {
  isCareerGeneratedOrigin,
  type GenerationalOrigin,
} from "./generational-succession.ts";
import {
  topTenPlayerSeasonFacts,
  type OwnerAttributionPlayerSeasonFact,
} from "./owner-attribution.ts";

/** Frozen metrics needed by the bounded succession comparison. */
export interface SuccessionPriorityMetricValues {
  readonly localReplacementCapacity: number;
  readonly divisionReplacementCapacity: number;
  readonly fourReplicatedFormationRetentionShare: number;
  readonly careerGeneratedLeaderShareSeasonTen: number;
}

export interface SuccessionPriorityArmSummary {
  readonly values: SuccessionPriorityMetricValues;
  readonly worlds: readonly {
    readonly worldSeed: string;
    readonly values: SuccessionPriorityMetricValues;
  }[];
  readonly transferAcquisitionCount: number;
}

export interface SuccessionTargetAttributionFacts {
  readonly fulfilledEpisodeCount: number;
  readonly distinctAcquiredPlayerCount: number;
  readonly ageBandCounts: Readonly<Record<"under_21" | "21_29" | "30_32" | "33_plus", number>>;
  readonly originCounts: Readonly<Record<
    "opening_senior" | "opening_academy" | "annual_academy_intake" | "annual_senior_intake" | "unknown",
    number
  >>;
  readonly primeAgeAcquisitionCount: number;
  readonly careerGeneratedPrimeAgeAcquisitionCount: number;
  readonly careerGeneratedPrimeAgeDownstreamCount: number;
  readonly localReplacementIntersectionCount: number;
  readonly divisionReplacementIntersectionCount: number;
  readonly seasonTenLeaderIntersectionCount: number;
  readonly reconciliationFailureCount: number;
}

/** Classifies target eligibility before any successor-selection rule changes. */
export function evaluateSuccessionTargetAttribution(
  facts: SuccessionTargetAttributionFacts,
) {
  if (facts.reconciliationFailureCount > 0 || facts.originCounts.unknown > 0) {
    return {
      decision: "STOP_RETHINK" as const,
      owner: "unreconciled" as const,
      primeAgeShare: observedShare(facts.primeAgeAcquisitionCount, facts.fulfilledEpisodeCount),
      careerGeneratedPrimeAgeShare: observedShare(
        facts.careerGeneratedPrimeAgeAcquisitionCount,
        facts.fulfilledEpisodeCount,
      ),
      downstreamShare: observedShare(
        facts.careerGeneratedPrimeAgeDownstreamCount,
        facts.careerGeneratedPrimeAgeAcquisitionCount,
      ),
    };
  }
  if (facts.fulfilledEpisodeCount === 0) {
    return {
      decision: "REFINE" as const,
      owner: "not_reproduced" as const,
      primeAgeShare: "not_observed" as const,
      careerGeneratedPrimeAgeShare: "not_observed" as const,
      downstreamShare: "not_observed" as const,
    };
  }
  const primeAgeShare = facts.primeAgeAcquisitionCount / facts.fulfilledEpisodeCount;
  const careerGeneratedPrimeAgeShare =
    facts.careerGeneratedPrimeAgeAcquisitionCount / facts.fulfilledEpisodeCount;
  const downstreamShare = facts.careerGeneratedPrimeAgeAcquisitionCount === 0
    ? "not_observed" as const
    : facts.careerGeneratedPrimeAgeDownstreamCount
      / facts.careerGeneratedPrimeAgeAcquisitionCount;
  const targetFailed = primeAgeShare < 0.50 || careerGeneratedPrimeAgeShare < 0.35;
  const downstreamFailed = downstreamShare !== "not_observed" && downstreamShare < 0.20;
  return {
    decision: "OWNER_IDENTIFIED" as const,
    owner: targetFailed && downstreamFailed
      ? "mixed" as const
      : targetFailed
        ? "target_eligibility" as const
        : downstreamFailed
          ? "downstream_selection" as const
          : "not_reproduced" as const,
    primeAgeShare,
    careerGeneratedPrimeAgeShare,
    downstreamShare,
  };
}

/** Applies only the preregistered L6.5 paired decision; no facts are rebuilt. */
export function evaluateSuccessionPriorityComparison(input: {
  readonly legacy: SuccessionPriorityArmSummary;
  readonly candidate: SuccessionPriorityArmSummary;
}) {
  const localDelta = input.candidate.values.localReplacementCapacity
    - input.legacy.values.localReplacementCapacity;
  const generatedLeaderDelta = input.candidate.values.careerGeneratedLeaderShareSeasonTen
    - input.legacy.values.careerGeneratedLeaderShareSeasonTen;
  const divisionDelta = input.candidate.values.divisionReplacementCapacity
    - input.legacy.values.divisionReplacementCapacity;
  const formationDelta = input.candidate.values.fourReplicatedFormationRetentionShare
    - input.legacy.values.fourReplicatedFormationRetentionShare;
  const localCoherenceCount = pairedPositiveDeltaCount(
    input.legacy,
    input.candidate,
    "localReplacementCapacity",
  );
  const generatedLeaderCoherenceCount = pairedPositiveDeltaCount(
    input.legacy,
    input.candidate,
    "careerGeneratedLeaderShareSeasonTen",
  );
  const candidateFormationWorldCount = input.candidate.worlds.filter(
    ({ values }) => values.fourReplicatedFormationRetentionShare >= 0.75,
  ).length;
  const transferVolumeRatio = input.legacy.transferAcquisitionCount === 0
    ? Number.POSITIVE_INFINITY
    : input.candidate.transferAcquisitionCount / input.legacy.transferAcquisitionCount;
  const failedGateKeys = [
    ...(localDelta >= 0.05 ? [] : ["local_replacement_delta"]),
    ...(localCoherenceCount >= 5 ? [] : ["local_replacement_coherence"]),
    ...(generatedLeaderDelta >= 0.03 ? [] : ["generated_leader_delta"]),
    ...(generatedLeaderCoherenceCount >= 5 ? [] : ["generated_leader_coherence"]),
    ...(input.candidate.values.divisionReplacementCapacity >= 0.50 && divisionDelta >= -0.02
      ? [] : ["division_replacement_guardrail"]),
    ...(formationDelta >= -0.02 && candidateFormationWorldCount >= 5
      ? [] : ["formation_identity_guardrail"]),
    ...(transferVolumeRatio <= 1.05 ? [] : ["transfer_volume_guardrail"]),
  ];
  const localTransitionHeld = localDelta >= 0.05 && localCoherenceCount >= 5;
  const leaderTransitionHeld = generatedLeaderDelta >= 0.03
    && generatedLeaderCoherenceCount >= 5;
  const decision = failedGateKeys.length === 0
    ? "GO" as const
    : leaderTransitionHeld && !localTransitionHeld
      ? "STOP_RETHINK" as const
      : "REFINE" as const;
  return {
    decision,
    owner: decision === "GO"
      ? "bounded_succession_order" as const
      : localTransitionHeld && !leaderTransitionHeld
        ? "downstream_selection" as const
        : "market_distribution" as const,
    deltas: {
      localReplacementCapacity: localDelta,
      careerGeneratedLeaderShareSeasonTen: generatedLeaderDelta,
      divisionReplacementCapacity: divisionDelta,
      fourReplicatedFormationRetentionShare: formationDelta,
    },
    localCoherenceCount,
    generatedLeaderCoherenceCount,
    candidateFormationWorldCount,
    transferVolumeRatio,
    failedGateKeys,
  };
}

export const SUCCESSION_DOWNSTREAM_STAGES = [
  "season_ten_leader",
  "no_buyer_appearance",
  "below_450_buyer_minutes",
  "not_retained_two_seasons",
  "below_half_ability_growth",
  "developed_not_leader",
] as const;
export type SuccessionDownstreamStage = typeof SUCCESSION_DOWNSTREAM_STAGES[number];
export const MINIMUM_SUCCESSION_DOWNSTREAM_OBSERVATIONS = 35;

/**
 * Classifies one acquired successor on the buyer's two playable seasons.
 *
 * A fulfilled episode in season N is emitted during season advancement, after
 * the closing N snapshot. The buyer can therefore first field the player in
 * N+1; reading N as buyer use silently measures the seller's season instead.
 */
export function deriveSuccessionDownstreamPlayerOutcome(input: {
  readonly episodeSeasonNumber: number;
  readonly buyerClubId: string;
  readonly acquisitionCurrentAbility: number;
  readonly seasonTenLeader: boolean;
  readonly useSeasons: readonly {
    readonly clubId: string;
    readonly seasonNumber: number;
    readonly appearances: number;
  }[];
  readonly playerSeasons: readonly {
    readonly clubId: string;
    readonly seasonNumber: number;
    readonly minutes: number;
    readonly currentAbility: number;
  }[];
}): {
  readonly stage: SuccessionDownstreamStage;
  readonly buyerMinutes: number;
  readonly realizedGrowth: number | "not_observed";
} {
  if (input.seasonTenLeader) {
    return { stage: "season_ten_leader", buyerMinutes: 0, realizedGrowth: "not_observed" };
  }
  const firstBuyerSeason = input.episodeSeasonNumber + 1;
  const secondBuyerSeason = input.episodeSeasonNumber + 2;
  const isBuyerWindow = (row: { readonly clubId: string; readonly seasonNumber: number }) =>
    row.clubId === input.buyerClubId
    && (row.seasonNumber === firstBuyerSeason || row.seasonNumber === secondBuyerSeason);
  const appearances = input.useSeasons
    .filter(isBuyerWindow)
    .reduce((total, row) => total + row.appearances, 0);
  if (appearances === 0) {
    return { stage: "no_buyer_appearance", buyerMinutes: 0, realizedGrowth: "not_observed" };
  }
  const buyerMinutes = input.playerSeasons
    .filter(isBuyerWindow)
    .reduce((total, row) => total + row.minutes, 0);
  if (buyerMinutes < 450) {
    return { stage: "below_450_buyer_minutes", buyerMinutes, realizedGrowth: "not_observed" };
  }
  const retained = input.playerSeasons.find((row) =>
    row.clubId === input.buyerClubId && row.seasonNumber === secondBuyerSeason
  );
  if (retained === undefined) {
    return { stage: "not_retained_two_seasons", buyerMinutes, realizedGrowth: "not_observed" };
  }
  const realizedGrowth = retained.currentAbility - input.acquisitionCurrentAbility;
  return {
    stage: realizedGrowth < 0.5 ? "below_half_ability_growth" : "developed_not_leader",
    buyerMinutes,
    realizedGrowth,
  };
}

export const SUCCESSION_GROWTH_FEASIBILITY_STAGES = [
  "insufficient_stored_room",
  "low_two_season_buyer_load",
  "development_not_realized",
] as const;
export type SuccessionGrowthFeasibilityStage =
  typeof SUCCESSION_GROWTH_FEASIBILITY_STAGES[number];

/** Partitions a reproduced low-growth row without changing its source facts. */
export function successionGrowthFeasibilityStage(input: {
  readonly acquisitionPotentialRoom: number;
  readonly buyerMinutes: number;
}): SuccessionGrowthFeasibilityStage {
  if (input.acquisitionPotentialRoom < 0.5) return "insufficient_stored_room";
  return input.buyerMinutes < 1_800
    ? "low_two_season_buyer_load"
    : "development_not_realized";
}

/** Applies the frozen L6.13 majority owner after L6.12B reproduction. */
export function evaluateSuccessionGrowthFeasibility(input: {
  readonly counts: Readonly<Record<SuccessionGrowthFeasibilityStage, number>>;
  readonly expectedObservationCount: number;
  readonly reconciliationFailureCount: number;
}) {
  const observationCount = SUCCESSION_GROWTH_FEASIBILITY_STAGES.reduce(
    (total, stage) => total + input.counts[stage],
    0,
  );
  if (
    input.reconciliationFailureCount > 0
    || observationCount === 0
    || observationCount !== input.expectedObservationCount
  ) {
    return {
      decision: "STOP_RETHINK" as const,
      owner: "structural_reconciliation" as const,
      observationCount,
      dominantStage: "not_observed" as const,
      dominantShare: "not_observed" as const,
    };
  }
  const dominantStage = SUCCESSION_GROWTH_FEASIBILITY_STAGES.reduce((best, stage) =>
    input.counts[stage] > input.counts[best] ? stage : best
  );
  const dominantShare = input.counts[dominantStage] / observationCount;
  return {
    decision: dominantShare >= 0.50 ? "OWNER_IDENTIFIED" as const : "MIXED" as const,
    owner: dominantShare >= 0.50 ? dominantStage : "mixed" as const,
    observationCount,
    dominantStage,
    dominantShare,
  };
}

export const LEADER_CONVERSION_STAGES = [
  "season_ten_leader",
  "below_role_leader_quality",
  "quality_ready_below_900_minutes",
  "quality_and_minutes_ready_not_leader",
] as const;
export type LeaderConversionStage = typeof LEADER_CONVERSION_STAGES[number];

export interface LeaderConversionWorldFacts {
  readonly worldSeed: string;
  readonly competitionCount: number;
  readonly leaderSlotCount: number;
  readonly generatedPlayerCount: number;
  readonly representedRolePlayerCount: number;
  readonly unrepresentedRolePlayerCount: number;
  readonly recentGeneratedExcludedCount: number;
  readonly counts: Readonly<Record<LeaderConversionStage, number>>;
  readonly reconciliationFailureCount: number;
}

/**
 * Joins one cached season-ten population to its canonical leader lanes.
 *
 * The role-local minimum is intentionally conservative: a generated player is
 * called quality-ready when it reaches any real leader of the same role, not
 * an invented global rating threshold that would punish defensive roles.
 */
export interface LeaderConversionWorldInput {
  readonly worldSeed: string;
  readonly playerSeasons: readonly OwnerAttributionPlayerSeasonFact[];
  readonly playerOrigins: readonly {
    readonly playerId: string;
    readonly origin: GenerationalOrigin;
    readonly generatedSeasonNumber: number;
  }[];
  readonly cohort: "all_generated" | "mature_by_season_six";
}

export function leaderConversionWorldFacts(
  input: LeaderConversionWorldInput,
): LeaderConversionWorldFacts {
  return deriveLeaderConversionWorld(input).facts;
}

interface BelowLeaderQualityFact {
  readonly playerId: string;
  readonly competitionId: string;
  readonly role: OwnerAttributionPlayerSeasonFact["role"];
  readonly origin: Extract<GenerationalOrigin, "annual_academy_intake" | "annual_senior_intake">;
  readonly currentAbility: number;
  readonly potentialRoom: number;
  readonly qualityFloor: number;
}

export interface RepresentedGeneratedPlayerFact extends BelowLeaderQualityFact {
  readonly stage: LeaderConversionStage;
}

/** Per-player form of the canonical L6.15 conversion reader. */
export function leaderConversionPlayerFacts(
  input: LeaderConversionWorldInput,
): readonly RepresentedGeneratedPlayerFact[] {
  return deriveLeaderConversionWorld(input).representedPlayers;
}

function deriveLeaderConversionWorld(input: LeaderConversionWorldInput): {
  readonly facts: LeaderConversionWorldFacts;
  readonly belowLeaderQuality: readonly BelowLeaderQualityFact[];
  readonly representedPlayers: readonly RepresentedGeneratedPlayerFact[];
} {
  const seasonTen = input.playerSeasons.filter(({ seasonNumber }) => seasonNumber === 10);
  const competitionIds = [...new Set(seasonTen.map(({ competitionId }) => competitionId))].sort();
  const originByPlayerId = new Map<string, (typeof input.playerOrigins)[number]>();
  let reconciliationFailureCount = 0;
  for (const fact of input.playerOrigins) {
    if (originByPlayerId.has(fact.playerId)) reconciliationFailureCount += 1;
    originByPlayerId.set(fact.playerId, fact);
  }
  const counts = Object.fromEntries(
    LEADER_CONVERSION_STAGES.map((stage) => [stage, 0]),
  ) as Record<LeaderConversionStage, number>;
  let leaderSlotCount = 0;
  let generatedPlayerCount = 0;
  let representedRolePlayerCount = 0;
  let unrepresentedRolePlayerCount = 0;
  let recentGeneratedExcludedCount = 0;
  const observedPlayerKeys = new Set<string>();
  const belowLeaderQuality: BelowLeaderQualityFact[] = [];
  const representedPlayers: RepresentedGeneratedPlayerFact[] = [];

  for (const competitionId of competitionIds) {
    const rows = seasonTen.filter((row) => row.competitionId === competitionId);
    const leaders = [
      ...topTenPlayerSeasonFacts(rows, "goals"),
      ...topTenPlayerSeasonFacts(rows, "assists"),
    ];
    leaderSlotCount += leaders.length;
    const leaderPlayerIds = new Set(leaders.map(({ playerId }) => playerId));
    const qualityFloorByRole = new Map<
      OwnerAttributionPlayerSeasonFact["role"],
      number
    >();
    for (const leader of leaders) {
      const current = qualityFloorByRole.get(leader.role);
      if (current === undefined || leader.currentAbility < current) {
        qualityFloorByRole.set(leader.role, leader.currentAbility);
      }
    }

    for (const player of rows) {
      const playerKey = `${competitionId}|${player.playerId}`;
      if (observedPlayerKeys.has(playerKey)) reconciliationFailureCount += 1;
      observedPlayerKeys.add(playerKey);
      const originFact = originByPlayerId.get(player.playerId);
      if (originFact === undefined) {
        reconciliationFailureCount += 1;
        continue;
      }
      if (!isCareerGeneratedOrigin(originFact.origin)) continue;
      if (
        input.cohort === "mature_by_season_six"
        && originFact.generatedSeasonNumber > 6
      ) {
        recentGeneratedExcludedCount += 1;
        continue;
      }
      generatedPlayerCount += 1;
      const qualityFloor = qualityFloorByRole.get(player.role);
      if (qualityFloor === undefined) {
        unrepresentedRolePlayerCount += 1;
        continue;
      }
      representedRolePlayerCount += 1;
      const stage: LeaderConversionStage = leaderPlayerIds.has(player.playerId)
        ? "season_ten_leader"
        : player.currentAbility < qualityFloor
          ? "below_role_leader_quality"
          : player.minutes < 900
            ? "quality_ready_below_900_minutes"
            : "quality_and_minutes_ready_not_leader";
      counts[stage] += 1;
      const representedPlayer = {
        playerId: player.playerId,
        competitionId,
        role: player.role,
        origin: originFact.origin,
        currentAbility: player.currentAbility,
        potentialRoom: player.potentialRoom,
        qualityFloor,
        stage,
      } as const;
      if (
        representedPlayer.origin !== "annual_academy_intake"
        && representedPlayer.origin !== "annual_senior_intake"
      ) {
        reconciliationFailureCount += 1;
        continue;
      }
      const generatedPlayer: RepresentedGeneratedPlayerFact = {
        ...representedPlayer,
        origin: representedPlayer.origin,
      };
      representedPlayers.push(generatedPlayer);
      if (stage === "below_role_leader_quality") {
        belowLeaderQuality.push(generatedPlayer);
      }
    }
  }

  reconciliationFailureCount += Number(
    representedRolePlayerCount + unrepresentedRolePlayerCount !== generatedPlayerCount,
  );
  reconciliationFailureCount += Number(
    belowLeaderQuality.length !== counts.below_role_leader_quality,
  );
  return {
    facts: {
      worldSeed: input.worldSeed,
      competitionCount: competitionIds.length,
      leaderSlotCount,
      generatedPlayerCount,
      representedRolePlayerCount,
      unrepresentedRolePlayerCount,
      recentGeneratedExcludedCount,
      counts,
      reconciliationFailureCount,
    },
    belowLeaderQuality,
    representedPlayers,
  };
}

/** Applies the preregistered L6.15 majority owner to real cached players. */
export function evaluateLeaderConversionFunnel(input: {
  readonly worlds: readonly LeaderConversionWorldFacts[];
  readonly seasonCount: number;
  readonly minimumCohortSize: number;
}) {
  const counts = Object.fromEntries(
    LEADER_CONVERSION_STAGES.map((stage) => [
      stage,
      input.worlds.reduce((total, world) => total + world.counts[stage], 0),
    ]),
  ) as Record<LeaderConversionStage, number>;
  const competitionCount = input.worlds.reduce(
    (total, world) => total + world.competitionCount,
    0,
  );
  const leaderSlotCount = input.worlds.reduce(
    (total, world) => total + world.leaderSlotCount,
    0,
  );
  const reconciliationFailureCount = input.worlds.reduce(
    (total, world) => total + world.reconciliationFailureCount,
    0,
  );
  const representedRolePlayerCount = LEADER_CONVERSION_STAGES.reduce(
    (total, stage) => total + counts[stage],
    0,
  );
  const unreachableStages = LEADER_CONVERSION_STAGES.filter((stage) => counts[stage] === 0);
  const structuralFailure = input.worlds.length !== 7
    || input.seasonCount !== 10
    || competitionCount !== 21
    || leaderSlotCount !== 420
    || reconciliationFailureCount > 0
    || representedRolePlayerCount < input.minimumCohortSize
    || unreachableStages.length > 0;
  const failureStages = LEADER_CONVERSION_STAGES.filter(
    (stage): stage is Exclude<LeaderConversionStage, "season_ten_leader"> =>
      stage !== "season_ten_leader",
  );
  const failureCount = failureStages.reduce((total, stage) => total + counts[stage], 0);
  const dominantStage = failureCount === 0
    ? "not_observed" as const
    : failureStages.reduce((best, stage) => counts[stage] > counts[best] ? stage : best);
  const dominantShare = dominantStage === "not_observed"
    ? "not_observed" as const
    : counts[dominantStage] / failureCount;
  const owner = dominantStage === "not_observed"
    ? "structural_reconciliation" as const
    : dominantStage === "below_role_leader_quality"
      ? "leader_quality_supply" as const
      : dominantStage === "quality_ready_below_900_minutes"
        ? "material_selection_opportunity" as const
        : "leader_output_conversion" as const;
  return {
    decision: structuralFailure
      ? "STOP_RETHINK" as const
      : dominantShare !== "not_observed" && dominantShare >= 0.50
        ? "OWNER_IDENTIFIED" as const
        : "MIXED" as const,
    owner: structuralFailure ? "structural_reconciliation" as const : owner,
    counts,
    representedRolePlayerCount,
    failureCount,
    competitionCount,
    leaderSlotCount,
    dominantStage,
    dominantShare,
    unreachableStages,
    reconciliationFailureCount,
    worlds: input.worlds,
  };
}

export const LEADER_QUALITY_FEASIBILITY_STAGES = [
  "stored_ceiling_below_leader_quality",
  "sufficient_ceiling_not_realized",
] as const;
export type LeaderQualityFeasibilityStage =
  typeof LEADER_QUALITY_FEASIBILITY_STAGES[number];

export const LEADER_CEILING_DISTANCE_BUCKETS = [
  "at_or_above",
  "within_0_5",
  "within_1_0",
  "within_2_0",
  "over_2_0",
] as const;
export type LeaderCeilingDistanceBucket =
  typeof LEADER_CEILING_DISTANCE_BUCKETS[number];

export interface LeaderCeilingDistanceWorldFacts {
  readonly worldSeed: string;
  readonly competitionCount: number;
  readonly representedPlayerCount: number;
  readonly counts: Readonly<Record<LeaderCeilingDistanceBucket, number>>;
  readonly groups: readonly {
    readonly competitionId: string;
    readonly role: OwnerAttributionPlayerSeasonFact["role"];
    readonly playerCount: number;
    readonly counts: Readonly<Record<LeaderCeilingDistanceBucket, number>>;
    readonly positiveShortfallTotal: number;
    readonly positiveShortfallMaximum: number | "not_observed";
  }[];
  readonly reconciliationFailureCount: number;
}

export const ACADEMY_PROSPECT_CLASSES = [
  "routine",
  "interesting",
  "serious",
  "rare",
] as const satisfies readonly ContextualProspectClass[];

export interface AcademyProspectClassWorldFacts {
  readonly worldSeed: string;
  readonly competitionCount: number;
  readonly counts: Readonly<Record<ContextualProspectClass, AcademyProspectClassCounts>>;
  readonly firstDivisionCounts:
    Readonly<Record<ContextualProspectClass, AcademyProspectClassCounts>>;
  readonly reconciliationFailureCount: number;
}

export interface AcademyProspectClassCounts {
  readonly generated: number;
  readonly activeSeasonTen: number;
  readonly representedSeasonTen: number;
  readonly leader: number;
  readonly belowLeaderQuality: number;
  readonly storedCeilingBelowLeader: number;
  readonly sufficientCeilingNotRealized: number;
}

/** Joins accepted generation provenance to the canonical season-ten lanes. */
export function academyProspectClassWorldFacts(input: {
  readonly worldSeed: string;
  readonly provenance: readonly {
    readonly playerId: string;
    readonly prospectClass: ContextualProspectClass;
    readonly generatedSeasonNumber: number;
    readonly generationDivision: "first_division" | "second_division" | "third_division";
  }[];
  readonly playerSeasons: readonly OwnerAttributionPlayerSeasonFact[];
  readonly playerOrigins: readonly {
    readonly playerId: string;
    readonly origin: GenerationalOrigin;
    readonly generatedSeasonNumber: number;
  }[];
}): AcademyProspectClassWorldFacts {
  const conversion = deriveLeaderConversionWorld({
    worldSeed: input.worldSeed,
    playerSeasons: input.playerSeasons,
    playerOrigins: input.playerOrigins,
    cohort: "mature_by_season_six",
  });
  const counts = emptyAcademyProspectClassCounts();
  const firstDivisionCounts = emptyAcademyProspectClassCounts();
  const originByPlayerId = new Map(input.playerOrigins.map((row) => [row.playerId, row]));
  const activeSeasonTen = new Set(
    input.playerSeasons.filter(({ seasonNumber }) => seasonNumber === 10)
      .map(({ playerId }) => playerId),
  );
  const representedByPlayerId = new Map(
    conversion.representedPlayers.map((row) => [row.playerId, row]),
  );
  const observedIds = new Set<string>();
  let reconciliationFailureCount = conversion.facts.reconciliationFailureCount;

  for (const row of input.provenance) {
    if (row.generatedSeasonNumber > 6) continue;
    if (observedIds.has(row.playerId)) reconciliationFailureCount += 1;
    observedIds.add(row.playerId);
    const origin = originByPlayerId.get(row.playerId);
    if (
      origin?.origin !== "annual_academy_intake"
      || origin.generatedSeasonNumber !== row.generatedSeasonNumber
    ) reconciliationFailureCount += 1;
    incrementProspectClassCounts(counts[row.prospectClass], row, activeSeasonTen,
      representedByPlayerId.get(row.playerId));
    if (row.generationDivision === "first_division") {
      incrementProspectClassCounts(firstDivisionCounts[row.prospectClass], row,
        activeSeasonTen, representedByPlayerId.get(row.playerId));
    }
  }
  return {
    worldSeed: input.worldSeed,
    competitionCount: conversion.facts.competitionCount,
    counts,
    firstDivisionCounts,
    reconciliationFailureCount,
  };
}

/** Applies the preregistered L6.20 source-class majority rule. */
export function evaluateAcademyProspectClassConversion(input: {
  readonly worlds: readonly AcademyProspectClassWorldFacts[];
  readonly seasonCount: number;
}) {
  const counts = combineAcademyProspectClassCounts(input.worlds, "counts");
  const firstDivisionCounts = combineAcademyProspectClassCounts(
    input.worlds,
    "firstDivisionCounts",
  );
  const competitionCount = input.worlds.reduce(
    (total, world) => total + world.competitionCount,
    0,
  );
  const reconciliationFailureCount = input.worlds.reduce(
    (total, world) => total + world.reconciliationFailureCount,
    0,
  );
  const unreachableClasses = ACADEMY_PROSPECT_CLASSES.filter(
    (prospectClass) => counts[prospectClass].generated === 0,
  );
  const storedCeilingBelowCount = ACADEMY_PROSPECT_CLASSES.reduce(
    (total, prospectClass) => total
      + firstDivisionCounts[prospectClass].storedCeilingBelowLeader,
    0,
  );
  const belowQualityCount = ACADEMY_PROSPECT_CLASSES.reduce(
    (total, prospectClass) => total + firstDivisionCounts[prospectClass].belowLeaderQuality,
    0,
  );
  const sufficientCeilingNotRealizedCount = ACADEMY_PROSPECT_CLASSES.reduce(
    (total, prospectClass) => total
      + firstDivisionCounts[prospectClass].sufficientCeilingNotRealized,
    0,
  );
  const shares = Object.fromEntries(ACADEMY_PROSPECT_CLASSES.map((prospectClass) => [
    prospectClass,
    storedCeilingBelowCount === 0
      ? 0
      : firstDivisionCounts[prospectClass].storedCeilingBelowLeader
        / storedCeilingBelowCount,
  ])) as Record<ContextualProspectClass, number>;
  const highShare = shares.serious + shares.rare;
  const postCeilingShare = belowQualityCount === 0
    ? 0
    : sufficientCeilingNotRealizedCount / belowQualityCount;
  const structuralFailure = input.worlds.length !== 7
    || input.seasonCount !== 10
    || competitionCount !== 21
    || storedCeilingBelowCount === 0
    || reconciliationFailureCount > 0
    || unreachableClasses.length > 0;
  const owner = postCeilingShare >= 0.50
    ? "post_ceiling_conversion" as const
    : shares.routine >= 0.50
      ? "routine_to_interesting_transition" as const
      : shares.interesting >= 0.50
        ? "interesting_ceiling_distribution" as const
        : highShare >= 0.50
          ? "high_ceiling_distribution" as const
          : "mixed" as const;
  return {
    decision: structuralFailure
      ? "STOP_RETHINK" as const
      : owner === "mixed"
        ? "MIXED" as const
        : "OWNER_IDENTIFIED" as const,
    owner: structuralFailure ? "structural_reconciliation" as const : owner,
    counts,
    firstDivisionCounts,
    firstDivisionStoredCeilingBelowShares: shares,
    highCeilingCombinedShare: highShare,
    postCeilingShare,
    competitionCount,
    reconciliationFailureCount,
    unreachableClasses,
    worlds: input.worlds,
  };
}

export const GENERATED_PLAYER_LIFECYCLE_DIVERGENCE_REASONS = [
  "current_profile_cost",
  "intake_acceptance_path",
  "minute_access",
  "development_realization",
  "exit_or_retention",
  "quality_not_leadership",
  "mixed_below_floor",
] as const;
export type GeneratedPlayerLifecycleDivergenceReason =
  typeof GENERATED_PLAYER_LIFECYCLE_DIVERGENCE_REASONS[number];

export interface GeneratedPlayerLifecycleFact {
  readonly playerId: string;
  readonly prospectClass: ContextualProspectClass;
  readonly generationDivision: "first_division" | "second_division" | "third_division";
  readonly generatedSeasonNumber: number;
  readonly firstObservedCurrentAbility: number | "not_observed";
  readonly firstObservedStoredCeiling: number | "not_observed";
  readonly minutesThroughSeasonSix: number;
  readonly seasonTenAbilityGain: number | "not_observed";
  readonly activeSeasonTen: boolean;
  readonly representedSeasonTen: boolean;
  readonly qualityReadySeasonTen: boolean;
  readonly leaderSeasonTen: boolean;
}

export interface GeneratedPlayerLifecycleWorldFacts {
  readonly worldSeed: string;
  readonly players: readonly GeneratedPlayerLifecycleFact[];
  readonly reconciliationFailureCount: number;
}

/** Applies the frozen L6.23 owner rule to paired per-player lifecycle facts. */
export function evaluateGeneratedPlayerLifecycleAttribution(input: {
  readonly current: readonly GeneratedPlayerLifecycleWorldFacts[];
  readonly combined: readonly GeneratedPlayerLifecycleWorldFacts[];
  readonly seasonCount: number;
}) {
  const combinedBySeed = new Map(input.combined.map((world) => [world.worldSeed, world]));
  const worldResults = input.current.flatMap((currentWorld) => {
    const combinedWorld = combinedBySeed.get(currentWorld.worldSeed);
    if (combinedWorld === undefined) return [];
    const currentById = uniqueLifecyclePlayers(currentWorld.players);
    const combinedById = uniqueLifecyclePlayers(combinedWorld.players);
    const playerIds = [...new Set([...currentById.keys(), ...combinedById.keys()])].sort();
    const lossCounts = emptyLifecycleReasonCounts();
    const gainCounts = emptyLifecycleReasonCounts();
    let leaderLossCount = 0;
    let leaderGainCount = 0;
    let classChangedPlayerCount = 0;
    for (const playerId of playerIds) {
      const current = currentById.get(playerId);
      const combined = combinedById.get(playerId);
      if (
        current !== undefined
        && combined !== undefined
        && current.prospectClass !== combined.prospectClass
      ) classChangedPlayerCount += 1;
      if (current?.leaderSeasonTen === true && combined?.leaderSeasonTen !== true) {
        leaderLossCount += 1;
        lossCounts[lifecycleDivergenceReason(current, combined)] += 1;
      }
      if (combined?.leaderSeasonTen === true && current?.leaderSeasonTen !== true) {
        leaderGainCount += 1;
        gainCounts[lifecycleDivergenceReason(combined, current)] += 1;
      }
    }
    return [{
      worldSeed: currentWorld.worldSeed,
      leaderLossCount,
      leaderGainCount,
      classChangedPlayerCount,
      lossCounts,
      gainCounts,
      reconciliationFailureCount:
        currentWorld.reconciliationFailureCount
        + combinedWorld.reconciliationFailureCount
        + duplicateLifecyclePlayerCount(currentWorld.players)
        + duplicateLifecyclePlayerCount(combinedWorld.players),
    }];
  });
  const lossCounts = combineLifecycleReasonCounts(worldResults, "lossCounts");
  const gainCounts = combineLifecycleReasonCounts(worldResults, "gainCounts");
  const leaderLossCount = worldResults.reduce((total, world) => total + world.leaderLossCount, 0);
  const leaderGainCount = worldResults.reduce((total, world) => total + world.leaderGainCount, 0);
  const reconciliationFailureCount = worldResults.reduce(
    (total, world) => total + world.reconciliationFailureCount,
    0,
  );
  const dominantReason = GENERATED_PLAYER_LIFECYCLE_DIVERGENCE_REASONS.reduce(
    (best, reason) => lossCounts[reason] > lossCounts[best] ? reason : best,
  );
  const dominantShare = leaderLossCount === 0 ? 0 : lossCounts[dominantReason] / leaderLossCount;
  const coherenceCount = worldResults.filter((world) =>
    world.lossCounts[dominantReason] - world.gainCounts[dominantReason] >= 0
  ).length;
  const structuralFailure = input.seasonCount !== 10
    || input.current.length !== 7
    || input.combined.length !== 7
    || worldResults.length !== 7
    || new Set(input.current.map(({ worldSeed }) => worldSeed)).size !== 7
    || new Set(input.combined.map(({ worldSeed }) => worldSeed)).size !== 7
    || leaderLossCount === 0
    || reconciliationFailureCount > 0;
  return {
    decision: structuralFailure
      ? "STOP_RETHINK" as const
      : dominantShare >= 0.50 && coherenceCount >= 5
        ? "OWNER_IDENTIFIED" as const
        : "MIXED" as const,
    owner: structuralFailure
      ? "structural_reconciliation" as const
      : dominantShare >= 0.50 && coherenceCount >= 5
        ? dominantReason
        : "mixed" as const,
    leaderLossCount,
    leaderGainCount,
    netLeaderLossCount: leaderLossCount - leaderGainCount,
    lossCounts,
    gainCounts,
    dominantReason,
    dominantShare,
    coherenceCount,
    classChangedPlayerCount: worldResults.reduce(
      (total, world) => total + world.classChangedPlayerCount,
      0,
    ),
    reconciliationFailureCount,
    worlds: worldResults,
  };
}

function lifecycleDivergenceReason(
  source: GeneratedPlayerLifecycleFact,
  target: GeneratedPlayerLifecycleFact | undefined,
): GeneratedPlayerLifecycleDivergenceReason {
  if (target === undefined) return "intake_acceptance_path";
  if (
    source.firstObservedCurrentAbility !== "not_observed"
    && target.firstObservedCurrentAbility !== "not_observed"
    && source.firstObservedCurrentAbility - target.firstObservedCurrentAbility >= 0.25
  ) {
    return "current_profile_cost";
  }
  if (
    source.activeSeasonTen
    && target.activeSeasonTen
    && source.minutesThroughSeasonSix - target.minutesThroughSeasonSix >= 450
  ) return "minute_access";
  if (
    source.activeSeasonTen
    && target.activeSeasonTen
    && source.seasonTenAbilityGain !== "not_observed"
    && target.seasonTenAbilityGain !== "not_observed"
    && source.seasonTenAbilityGain - target.seasonTenAbilityGain >= 0.50
  ) return "development_realization";
  if (source.activeSeasonTen && !target.activeSeasonTen) return "exit_or_retention";
  if (
    source.qualityReadySeasonTen
    && target.qualityReadySeasonTen
    && source.leaderSeasonTen
    && !target.leaderSeasonTen
  ) return "quality_not_leadership";
  return "mixed_below_floor";
}

function uniqueLifecyclePlayers(
  players: readonly GeneratedPlayerLifecycleFact[],
): ReadonlyMap<string, GeneratedPlayerLifecycleFact> {
  return new Map(players.map((player) => [player.playerId, player]));
}

function duplicateLifecyclePlayerCount(
  players: readonly GeneratedPlayerLifecycleFact[],
): number {
  return players.length - new Set(players.map(({ playerId }) => playerId)).size;
}

function emptyLifecycleReasonCounts(): Record<GeneratedPlayerLifecycleDivergenceReason, number> {
  return Object.fromEntries(
    GENERATED_PLAYER_LIFECYCLE_DIVERGENCE_REASONS.map((reason) => [reason, 0]),
  ) as Record<GeneratedPlayerLifecycleDivergenceReason, number>;
}

function combineLifecycleReasonCounts(
  worlds: readonly {
    readonly lossCounts: Readonly<Record<GeneratedPlayerLifecycleDivergenceReason, number>>;
    readonly gainCounts: Readonly<Record<GeneratedPlayerLifecycleDivergenceReason, number>>;
  }[],
  key: "lossCounts" | "gainCounts",
): Record<GeneratedPlayerLifecycleDivergenceReason, number> {
  const combined = emptyLifecycleReasonCounts();
  for (const world of worlds) {
    for (const reason of GENERATED_PLAYER_LIFECYCLE_DIVERGENCE_REASONS) {
      combined[reason] += world[key][reason];
    }
  }
  return combined;
}

type MutableAcademyProspectClassCounts = {
  -readonly [Key in keyof AcademyProspectClassCounts]: AcademyProspectClassCounts[Key];
};

function emptyAcademyProspectClassCounts(): Record<
  ContextualProspectClass,
  MutableAcademyProspectClassCounts
> {
  return Object.fromEntries(ACADEMY_PROSPECT_CLASSES.map((prospectClass) => [
    prospectClass,
    {
      generated: 0,
      activeSeasonTen: 0,
      representedSeasonTen: 0,
      leader: 0,
      belowLeaderQuality: 0,
      storedCeilingBelowLeader: 0,
      sufficientCeilingNotRealized: 0,
    },
  ])) as Record<ContextualProspectClass, MutableAcademyProspectClassCounts>;
}

function incrementProspectClassCounts(
  counts: MutableAcademyProspectClassCounts,
  provenance: { readonly playerId: string },
  activeSeasonTen: ReadonlySet<string>,
  represented: RepresentedGeneratedPlayerFact | undefined,
): void {
  counts.generated += 1;
  if (activeSeasonTen.has(provenance.playerId)) counts.activeSeasonTen += 1;
  if (represented === undefined) return;
  counts.representedSeasonTen += 1;
  if (represented.stage === "season_ten_leader") counts.leader += 1;
  if (represented.stage !== "below_role_leader_quality") return;
  counts.belowLeaderQuality += 1;
  if (represented.currentAbility + represented.potentialRoom < represented.qualityFloor) {
    counts.storedCeilingBelowLeader += 1;
  } else {
    counts.sufficientCeilingNotRealized += 1;
  }
}

function combineAcademyProspectClassCounts(
  worlds: readonly AcademyProspectClassWorldFacts[],
  key: "counts" | "firstDivisionCounts",
): Record<ContextualProspectClass, AcademyProspectClassCounts> {
  const combined = emptyAcademyProspectClassCounts();
  for (const world of worlds) {
    for (const prospectClass of ACADEMY_PROSPECT_CLASSES) {
      const source = world[key][prospectClass];
      const target = combined[prospectClass];
      for (const metric of Object.keys(source) as (keyof AcademyProspectClassCounts)[]) {
        target[metric] += source[metric];
      }
    }
  }
  return combined;
}

/** Reuses the leader conversion join to measure stored-ceiling distance. */
export function leaderCeilingDistanceWorldFacts(
  input: Omit<LeaderConversionWorldInput, "cohort">,
): LeaderCeilingDistanceWorldFacts {
  const conversion = deriveLeaderConversionWorld({
    ...input,
    cohort: "mature_by_season_six",
  });
  const counts = emptyLeaderCeilingDistanceCounts();
  const groups = new Map<string, {
    competitionId: string;
    role: OwnerAttributionPlayerSeasonFact["role"];
    playerCount: number;
    counts: Record<LeaderCeilingDistanceBucket, number>;
    positiveShortfallTotal: number;
    positiveShortfallMaximum: number | "not_observed";
  }>();
  for (const player of conversion.representedPlayers) {
    const shortfall = player.qualityFloor
      - (player.currentAbility + player.potentialRoom);
    const bucket = leaderCeilingDistanceBucket(shortfall);
    counts[bucket] += 1;
    const key = `${player.competitionId}|${player.role}`;
    const group = groups.get(key) ?? {
      competitionId: player.competitionId,
      role: player.role,
      playerCount: 0,
      counts: emptyLeaderCeilingDistanceCounts(),
      positiveShortfallTotal: 0,
      positiveShortfallMaximum: "not_observed" as const,
    };
    group.playerCount += 1;
    group.counts[bucket] += 1;
    if (shortfall > 0) {
      group.positiveShortfallTotal += shortfall;
      group.positiveShortfallMaximum = group.positiveShortfallMaximum === "not_observed"
        ? shortfall
        : Math.max(group.positiveShortfallMaximum, shortfall);
    }
    groups.set(key, group);
  }
  const competitionCount = new Set(
    conversion.representedPlayers.map(({ competitionId }) => competitionId),
  ).size;
  const representedPlayerCount = LEADER_CEILING_DISTANCE_BUCKETS.reduce(
    (total, bucket) => total + counts[bucket],
    0,
  );
  return {
    worldSeed: input.worldSeed,
    competitionCount,
    representedPlayerCount,
    counts,
    groups: [...groups.values()].sort((left, right) =>
      left.competitionId.localeCompare(right.competitionId)
        || left.role.localeCompare(right.role)
    ),
    reconciliationFailureCount: conversion.facts.reconciliationFailureCount
      + Number(representedPlayerCount !== conversion.facts.representedRolePlayerCount),
  };
}

/** Applies the frozen L6.18 ceiling-distance owner rule. */
export function evaluateLeaderCeilingDistance(input: {
  readonly worlds: readonly LeaderCeilingDistanceWorldFacts[];
  readonly seasonCount: number;
}) {
  const counts = Object.fromEntries(LEADER_CEILING_DISTANCE_BUCKETS.map((bucket) => [
    bucket,
    input.worlds.reduce((total, world) => total + world.counts[bucket], 0),
  ])) as Record<LeaderCeilingDistanceBucket, number>;
  const observationCount = LEADER_CEILING_DISTANCE_BUCKETS.reduce(
    (total, bucket) => total + counts[bucket],
    0,
  );
  const competitionCount = input.worlds.reduce(
    (total, world) => total + world.competitionCount,
    0,
  );
  const reconciliationFailureCount = input.worlds.reduce(
    (total, world) => total + world.reconciliationFailureCount,
    0,
  );
  const unreachableBuckets = LEADER_CEILING_DISTANCE_BUCKETS.filter(
    (bucket) => counts[bucket] === 0,
  );
  const structuralFailure = input.worlds.length !== 7
    || input.seasonCount !== 10
    || competitionCount !== 21
    || observationCount === 0
    || reconciliationFailureCount > 0
    || unreachableBuckets.length > 0;
  const overTwoShare = observationCount === 0 ? 0 : counts.over_2_0 / observationCount;
  const positiveBelowTwoCount = counts.within_0_5 + counts.within_1_0 + counts.within_2_0;
  const positiveBelowTwoShare = observationCount === 0
    ? 0
    : positiveBelowTwoCount / observationCount;
  const groupMap = new Map<string, LeaderCeilingDistanceWorldFacts["groups"][number][]>();
  for (const world of input.worlds) {
    for (const group of world.groups) {
      const key = `${group.competitionId}|${group.role}`;
      groupMap.set(key, [...(groupMap.get(key) ?? []), group]);
    }
  }
  return {
    decision: structuralFailure
      ? "STOP_RETHINK" as const
      : overTwoShare >= 0.50 || positiveBelowTwoShare >= 0.50
        ? "OWNER_IDENTIFIED" as const
        : "MIXED" as const,
    owner: structuralFailure
      ? "structural_reconciliation" as const
      : overTwoShare >= 0.50
        ? "ceiling_band_level" as const
        : positiveBelowTwoShare >= 0.50
          ? "ceiling_band_tail" as const
          : "mixed" as const,
    counts,
    observationCount,
    competitionCount,
    overTwoShare,
    positiveBelowTwoShare,
    groups: [...groupMap.entries()].map(([key, rows]) => {
      const first = rows[0]!;
      const playerCount = rows.reduce((total, row) => total + row.playerCount, 0);
      const positiveCount = rows.reduce((total, row) => total
        + row.counts.within_0_5 + row.counts.within_1_0
        + row.counts.within_2_0 + row.counts.over_2_0, 0);
      const positiveShortfallTotal = rows.reduce(
        (total, row) => total + row.positiveShortfallTotal,
        0,
      );
      return {
        key,
        competitionId: first.competitionId,
        role: first.role,
        playerCount,
        counts: Object.fromEntries(LEADER_CEILING_DISTANCE_BUCKETS.map((bucket) => [
          bucket,
          rows.reduce((total, row) => total + row.counts[bucket], 0),
        ])) as Record<LeaderCeilingDistanceBucket, number>,
        positiveShortfallMean: positiveCount === 0
          ? "not_observed" as const
          : positiveShortfallTotal / positiveCount,
        positiveShortfallMaximum: rows.reduce<number | "not_observed">(
          (maximum, row) => row.positiveShortfallMaximum === "not_observed"
            ? maximum
            : maximum === "not_observed"
              ? row.positiveShortfallMaximum
              : Math.max(maximum, row.positiveShortfallMaximum),
          "not_observed",
        ),
      };
    }).sort((left, right) => left.competitionId.localeCompare(right.competitionId)
      || left.role.localeCompare(right.role)),
    unreachableBuckets,
    reconciliationFailureCount,
    worlds: input.worlds,
  };
}

function leaderCeilingDistanceBucket(shortfall: number): LeaderCeilingDistanceBucket {
  if (shortfall <= 0) return "at_or_above";
  if (shortfall <= 0.5) return "within_0_5";
  if (shortfall <= 1) return "within_1_0";
  if (shortfall <= 2) return "within_2_0";
  return "over_2_0";
}

function emptyLeaderCeilingDistanceCounts(): Record<LeaderCeilingDistanceBucket, number> {
  return {
    at_or_above: 0,
    within_0_5: 0,
    within_1_0: 0,
    within_2_0: 0,
    over_2_0: 0,
  };
}

export interface LeaderQualityFeasibilityWorldFacts {
  readonly worldSeed: string;
  readonly competitionCount: number;
  readonly leaderSlotCount: number;
  readonly sourceBelowQualityCount: number;
  readonly counts: Readonly<Record<LeaderQualityFeasibilityStage, number>>;
  readonly countsByOrigin: Readonly<Record<
    "annual_academy_intake" | "annual_senior_intake",
    Readonly<Record<LeaderQualityFeasibilityStage, number>>
  >>;
  readonly currentQualityGapTotal: number;
  readonly potentialRoomTotal: number;
  readonly ceilingShortfallTotal: number;
  readonly reconciliationFailureCount: number;
}

/** Splits L6.15B quality failures by their already stored ability ceiling. */
export function leaderQualityFeasibilityWorldFacts(
  input: Omit<LeaderConversionWorldInput, "cohort">,
): LeaderQualityFeasibilityWorldFacts {
  const conversion = deriveLeaderConversionWorld({
    ...input,
    cohort: "mature_by_season_six",
  });
  const counts = emptyLeaderQualityFeasibilityCounts();
  const countsByOrigin = {
    annual_academy_intake: emptyLeaderQualityFeasibilityCounts(),
    annual_senior_intake: emptyLeaderQualityFeasibilityCounts(),
  };
  let currentQualityGapTotal = 0;
  let potentialRoomTotal = 0;
  let ceilingShortfallTotal = 0;
  for (const row of conversion.belowLeaderQuality) {
    const currentGap = row.qualityFloor - row.currentAbility;
    const ceilingShortfall = Math.max(0, currentGap - row.potentialRoom);
    const stage: LeaderQualityFeasibilityStage = ceilingShortfall > 0
      ? "stored_ceiling_below_leader_quality"
      : "sufficient_ceiling_not_realized";
    counts[stage] += 1;
    countsByOrigin[row.origin][stage] += 1;
    currentQualityGapTotal += currentGap;
    potentialRoomTotal += row.potentialRoom;
    ceilingShortfallTotal += ceilingShortfall;
  }
  const sourceBelowQualityCount = conversion.facts.counts.below_role_leader_quality;
  return {
    worldSeed: input.worldSeed,
    competitionCount: conversion.facts.competitionCount,
    leaderSlotCount: conversion.facts.leaderSlotCount,
    sourceBelowQualityCount,
    counts,
    countsByOrigin,
    currentQualityGapTotal,
    potentialRoomTotal,
    ceilingShortfallTotal,
    reconciliationFailureCount: conversion.facts.reconciliationFailureCount
      + Number(sourceBelowQualityCount !== conversion.belowLeaderQuality.length),
  };
}

/** Applies the frozen L6.16 ceiling-versus-realization owner rule. */
export function evaluateLeaderQualityFeasibility(input: {
  readonly worlds: readonly LeaderQualityFeasibilityWorldFacts[];
  readonly seasonCount: number;
  readonly expectedObservationCount: number;
}) {
  const counts = Object.fromEntries(
    LEADER_QUALITY_FEASIBILITY_STAGES.map((stage) => [
      stage,
      input.worlds.reduce((total, world) => total + world.counts[stage], 0),
    ]),
  ) as Record<LeaderQualityFeasibilityStage, number>;
  const countsByOrigin = Object.fromEntries(
    (["annual_academy_intake", "annual_senior_intake"] as const).map((origin) => [
      origin,
      Object.fromEntries(LEADER_QUALITY_FEASIBILITY_STAGES.map((stage) => [
        stage,
        input.worlds.reduce(
          (total, world) => total + world.countsByOrigin[origin][stage],
          0,
        ),
      ])),
    ]),
  ) as LeaderQualityFeasibilityWorldFacts["countsByOrigin"];
  const observationCount = LEADER_QUALITY_FEASIBILITY_STAGES.reduce(
    (total, stage) => total + counts[stage],
    0,
  );
  const competitionCount = input.worlds.reduce(
    (total, world) => total + world.competitionCount,
    0,
  );
  const leaderSlotCount = input.worlds.reduce(
    (total, world) => total + world.leaderSlotCount,
    0,
  );
  const sourceBelowQualityCount = input.worlds.reduce(
    (total, world) => total + world.sourceBelowQualityCount,
    0,
  );
  const reconciliationFailureCount = input.worlds.reduce(
    (total, world) => total + world.reconciliationFailureCount,
    0,
  );
  const unreachableStages = LEADER_QUALITY_FEASIBILITY_STAGES.filter(
    (stage) => counts[stage] === 0,
  );
  const structuralFailure = input.worlds.length !== 7
    || input.seasonCount !== 10
    || competitionCount !== 21
    || leaderSlotCount !== 420
    || sourceBelowQualityCount !== input.expectedObservationCount
    || observationCount !== input.expectedObservationCount
    || reconciliationFailureCount > 0
    || unreachableStages.length > 0;
  const dominantStage = LEADER_QUALITY_FEASIBILITY_STAGES.reduce((best, stage) =>
    counts[stage] > counts[best] ? stage : best
  );
  const dominantShare = observationCount === 0
    ? "not_observed" as const
    : counts[dominantStage] / observationCount;
  const sum = (key: "currentQualityGapTotal" | "potentialRoomTotal" | "ceilingShortfallTotal") =>
    input.worlds.reduce((total, world) => total + world[key], 0);
  return {
    decision: structuralFailure
      ? "STOP_RETHINK" as const
      : dominantShare !== "not_observed" && dominantShare >= 0.50
        ? "OWNER_IDENTIFIED" as const
        : "MIXED" as const,
    owner: structuralFailure
      ? "structural_reconciliation" as const
      : dominantStage === "stored_ceiling_below_leader_quality"
        ? "generated_ceiling_supply" as const
        : "development_realization" as const,
    counts,
    countsByOrigin,
    observationCount,
    competitionCount,
    leaderSlotCount,
    dominantStage,
    dominantShare,
    summaries: observationCount === 0
      ? "not_observed" as const
      : {
          currentQualityGapMean: sum("currentQualityGapTotal") / observationCount,
          potentialRoomMean: sum("potentialRoomTotal") / observationCount,
          ceilingShortfallMean: sum("ceilingShortfallTotal") / observationCount,
        },
    unreachableStages,
    reconciliationFailureCount,
    worlds: input.worlds,
  };
}

function emptyLeaderQualityFeasibilityCounts(): Record<LeaderQualityFeasibilityStage, number> {
  return {
    stored_ceiling_below_leader_quality: 0,
    sufficient_ceiling_not_realized: 0,
  };
}

/** Applies the frozen L6.12B owner rule to already joined cached facts. */
export function evaluateSuccessionDownstreamFunnel(input: {
  readonly counts: Readonly<Record<SuccessionDownstreamStage, number>>;
  readonly reconciliationFailureCount: number;
}) {
  const observationCount = SUCCESSION_DOWNSTREAM_STAGES.reduce(
    (total, stage) => total + input.counts[stage],
    0,
  );
  if (observationCount === 0 || input.reconciliationFailureCount > 0) {
    return {
      decision: "STOP_RETHINK" as const,
      owner: "structural_reconciliation" as const,
      observationCount,
      dominantStage: "not_observed" as const,
      dominantShare: "not_observed" as const,
    };
  }
  if (observationCount < MINIMUM_SUCCESSION_DOWNSTREAM_OBSERVATIONS) {
    return {
      decision: "STOP_RETHINK" as const,
      owner: "underpowered_cohort" as const,
      observationCount,
      dominantStage: "not_observed" as const,
      dominantShare: "not_observed" as const,
    };
  }
  const failureStages = SUCCESSION_DOWNSTREAM_STAGES.filter(
    (stage) => stage !== "season_ten_leader",
  );
  const dominantStage = failureStages.reduce((best, stage) =>
    input.counts[stage] > input.counts[best] ? stage : best
  );
  const dominantShare = input.counts[dominantStage] / observationCount;
  return {
    decision: dominantShare >= 0.50 ? "OWNER_IDENTIFIED" as const : "MIXED" as const,
    owner: dominantShare >= 0.50 ? dominantStage : "mixed" as const,
    observationCount,
    dominantStage,
    dominantShare,
  };
}

function pairedPositiveDeltaCount(
  legacy: SuccessionPriorityArmSummary,
  candidate: SuccessionPriorityArmSummary,
  metric: keyof Pick<
    SuccessionPriorityMetricValues,
    "localReplacementCapacity" | "careerGeneratedLeaderShareSeasonTen"
  >,
): number {
  const legacyBySeed = new Map(legacy.worlds.map((world) => [world.worldSeed, world]));
  return candidate.worlds.filter((world) => {
    const baseline = legacyBySeed.get(world.worldSeed);
    return baseline !== undefined && world.values[metric] > baseline.values[metric];
  }).length;
}

function observedShare(numerator: number, denominator: number): number | "not_observed" {
  return denominator === 0 ? "not_observed" : numerator / denominator;
}
