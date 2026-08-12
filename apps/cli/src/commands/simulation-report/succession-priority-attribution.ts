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

export const RENEWAL_LADDER_LANES = ["scorer", "creator"] as const;
export type RenewalLadderLane = typeof RENEWAL_LADDER_LANES[number];
export const RENEWAL_LADDER_RUNGS = [
  "quality",
  "opportunity_rate",
  "raw_opportunity",
  "club_expected_output",
  "actual_output",
] as const;
export type RenewalLadderRung = typeof RENEWAL_LADDER_RUNGS[number];

interface RenewalLadderOriginCounts {
  readonly generated: number;
  readonly opening: number;
}

export interface RenewalLadderWorldFacts {
  readonly worldSeed: string;
  readonly competitionCount: number;
  readonly laneRungs: readonly {
    readonly lane: RenewalLadderLane;
    readonly counts: Readonly<Record<RenewalLadderRung, RenewalLadderOriginCounts>>;
  }[];
  readonly reconciliationFailureCount: number;
  readonly unknownOriginCount: number;
}

/** Builds outcome-unconditioned season-ten ranks for the mature renewal cohort. */
export function renewalLadderWorldFacts(input: LeaderConversionWorldInput): RenewalLadderWorldFacts {
  const seasonTen = input.playerSeasons.filter(({ seasonNumber }) => seasonNumber === 10);
  const originByPlayerId = new Map<string, (typeof input.playerOrigins)[number]>();
  let reconciliationFailureCount = 0;
  for (const origin of input.playerOrigins) {
    if (originByPlayerId.has(origin.playerId)) reconciliationFailureCount += 1;
    originByPlayerId.set(origin.playerId, origin);
  }
  const seenPlayerKeys = new Set<string>();
  for (const player of seasonTen) {
    const key = `${player.competitionId}|${player.playerId}`;
    if (seenPlayerKeys.has(key)) reconciliationFailureCount += 1;
    seenPlayerKeys.add(key);
  }
  let unknownOriginCount = 0;
  const competitionIds = [...new Set(seasonTen.map(({ competitionId }) => competitionId))].sort();
  const laneRungs = RENEWAL_LADDER_LANES.map((lane) => {
    const counts = emptyRenewalLadderCounts();
    for (const competitionId of competitionIds) {
      const allRows = seasonTen.filter((row) => row.competitionId === competitionId);
      const cohort = allRows.filter((player) => {
        const origin = originByPlayerId.get(player.playerId);
        if (origin === undefined || origin.origin === "unknown") {
          unknownOriginCount += 1;
          return false;
        }
        return isOpeningOrigin(origin.origin)
          || (isCareerGeneratedOrigin(origin.origin)
            && (input.cohort !== "mature_by_season_six" || origin.generatedSeasonNumber <= 6));
      });
      const opportunities = (player: OwnerAttributionPlayerSeasonFact) =>
        lane === "scorer" ? player.shots : player.creatorNominations;
      const outputs = (player: OwnerAttributionPlayerSeasonFact) =>
        lane === "scorer" ? player.goals : player.assists;
      const eligibleRoles = new Set(allRows.filter((player) => opportunities(player) > 0)
        .map(({ role }) => role));
      const eligible = cohort.filter(({ role }) => eligibleRoles.has(role));
      const clubTotals = new Map<string, { opportunities: number; outputs: number }>();
      for (const player of allRows) {
        const current = clubTotals.get(player.clubId) ?? { opportunities: 0, outputs: 0 };
        clubTotals.set(player.clubId, {
          opportunities: current.opportunities + opportunities(player),
          outputs: current.outputs + outputs(player),
        });
      }
      const expectedRows = eligible.flatMap((player) => {
        const club = clubTotals.get(player.clubId);
        if (club === undefined) return [];
        const otherOpportunities = club.opportunities - opportunities(player);
        if (otherOpportunities <= 0) return [];
        const otherOutputs = club.outputs - outputs(player);
        return [{
          player,
          score: opportunities(player) * otherOutputs / otherOpportunities,
        }];
      }).sort((left, right) => right.score - left.score
        || left.player.playerId.localeCompare(right.player.playerId))
        .slice(0, 10).map(({ player }) => player);
      const ranks: Readonly<Record<RenewalLadderRung, readonly OwnerAttributionPlayerSeasonFact[]>> = {
        quality: rankTopTenPlayers(eligible, ({ currentAbility }) => currentAbility),
        opportunity_rate: rankTopTenPlayers(
          eligible.filter(({ minutes }) => minutes >= 900),
          (player) => opportunities(player) * 900 / player.minutes,
        ),
        raw_opportunity: rankTopTenPlayers(eligible, opportunities),
        club_expected_output: expectedRows,
        actual_output: rankTopTenPlayers(eligible, outputs),
      };
      for (const rung of RENEWAL_LADDER_RUNGS) {
        if (ranks[rung].length !== 10) {
          reconciliationFailureCount += 1;
          continue;
        }
        for (const player of ranks[rung]) {
          const origin = originByPlayerId.get(player.playerId);
          if (origin === undefined || origin.origin === "unknown") {
            unknownOriginCount += 1;
          } else if (isCareerGeneratedOrigin(origin.origin)) {
            counts[rung].generated += 1;
          } else if (isOpeningOrigin(origin.origin)) {
            counts[rung].opening += 1;
          }
        }
      }
    }
    return { lane, counts };
  });
  return {
    worldSeed: input.worldSeed,
    competitionCount: competitionIds.length,
    laneRungs,
    reconciliationFailureCount,
    unknownOriginCount,
  };
}

/** Applies the frozen L6.26 ladder truth table independently per lane. */
export function evaluateRenewalLadder(input: {
  readonly worlds: readonly RenewalLadderWorldFacts[];
  readonly seasonCount: number;
}) {
  const laneDecisions = RENEWAL_LADDER_LANES.map((lane) => {
    const worldRows = input.worlds.map((world) => world.laneRungs.find((row) => row.lane === lane)!);
    const counts = Object.fromEntries(RENEWAL_LADDER_RUNGS.map((rung) => [rung, {
      generated: worldRows.reduce((total, row) => total + row.counts[rung].generated, 0),
      opening: worldRows.reduce((total, row) => total + row.counts[rung].opening, 0),
    }])) as Record<RenewalLadderRung, RenewalLadderOriginCounts>;
    const shares = renewalLadderShares(counts);
    const owner = renewalLadderOwner(shares);
    const coherenceCount = input.worlds.filter((world) => {
      const row = world.laneRungs.find((candidate) => candidate.lane === lane)!;
      return renewalLadderOwner(renewalLadderShares(row.counts)) === owner;
    }).length;
    const identified = owner !== "mixed" && coherenceCount >= 5;
    return {
      lane,
      decision: identified ? "OWNER_IDENTIFIED" as const : "MIXED" as const,
      owner: identified ? owner : "mixed" as const,
      counts,
      shares,
      coherenceCount,
    };
  });
  const competitionCount = input.worlds.reduce((total, world) => total + world.competitionCount, 0);
  const reconciliationFailureCount = input.worlds.reduce(
    (total, world) => total + world.reconciliationFailureCount,
    0,
  );
  const unknownOriginCount = input.worlds.reduce(
    (total, world) => total + world.unknownOriginCount,
    0,
  );
  const rungSlotCounts = Object.fromEntries(RENEWAL_LADDER_RUNGS.map((rung) => [
    rung,
    laneDecisions.reduce((total, lane) =>
      total + lane.counts[rung].generated + lane.counts[rung].opening, 0),
  ])) as Record<RenewalLadderRung, number>;
  const structuralFailure = input.worlds.length !== 7
    || new Set(input.worlds.map(({ worldSeed }) => worldSeed)).size !== 7
    || input.seasonCount !== 10
    || competitionCount !== 21
    || reconciliationFailureCount > 0
    || unknownOriginCount > 0
    || RENEWAL_LADDER_RUNGS.some((rung) => rungSlotCounts[rung] !== 420);
  const identifiedCount = laneDecisions.filter(({ decision }) => decision === "OWNER_IDENTIFIED").length;
  return {
    decision: structuralFailure
      ? "STOP_RETHINK" as const
      : identifiedCount === 2
        ? "OWNER_IDENTIFIED" as const
        : identifiedCount === 1
          ? "PARTIAL_OWNER" as const
          : "MIXED" as const,
    laneDecisions,
    competitionCount,
    rungSlotCounts,
    reconciliationFailureCount,
    unknownOriginCount,
    worlds: input.worlds,
  };
}

function renewalLadderShares(
  counts: Readonly<Record<RenewalLadderRung, RenewalLadderOriginCounts>>,
): Record<RenewalLadderRung, number | "not_observed"> {
  return Object.fromEntries(RENEWAL_LADDER_RUNGS.map((rung) => [
    rung,
    observedShare(counts[rung].generated, counts[rung].generated + counts[rung].opening),
  ])) as Record<RenewalLadderRung, number | "not_observed">;
}

function renewalLadderOwner(
  shares: Readonly<Record<RenewalLadderRung, number | "not_observed">>,
): "individual_output_variance" | "team_conversion_environment" | "selection_volume"
  | "actor_allocation" | "quality_supply" | "mixed" {
  const { quality, opportunity_rate, raw_opportunity, club_expected_output, actual_output } = shares;
  if (
    quality === "not_observed"
    || opportunity_rate === "not_observed"
    || raw_opportunity === "not_observed"
    || club_expected_output === "not_observed"
    || actual_output === "not_observed"
  ) return "mixed";
  if (club_expected_output >= 0.50 && club_expected_output - actual_output >= 0.05) {
    return "individual_output_variance";
  }
  if (raw_opportunity >= 0.50) return "team_conversion_environment";
  if (opportunity_rate >= 0.50 && raw_opportunity < 0.50) return "selection_volume";
  if (quality >= 0.50 && opportunity_rate < 0.50) return "actor_allocation";
  return quality < 0.50 ? "quality_supply" : "mixed";
}

function emptyRenewalLadderCounts(): Record<
  RenewalLadderRung,
  { generated: number; opening: number }
> {
  return Object.fromEntries(RENEWAL_LADDER_RUNGS.map((rung) => [
    rung,
    { generated: 0, opening: 0 },
  ])) as Record<RenewalLadderRung, { generated: number; opening: number }>;
}

function rankTopTenPlayers(
  rows: readonly OwnerAttributionPlayerSeasonFact[],
  score: (row: OwnerAttributionPlayerSeasonFact) => number,
): readonly OwnerAttributionPlayerSeasonFact[] {
  return [...rows].sort((left, right) => score(right) - score(left)
    || left.playerId.localeCompare(right.playerId)).slice(0, 10);
}

function isOpeningOrigin(origin: GenerationalOrigin): boolean {
  return origin === "opening_senior" || origin === "opening_academy";
}

export const POPULATION_STATIONARITY_STATES = [
  "stationary_ready",
  "development_realization_gap",
  "ceiling_supply_gap",
  "reference_not_observed",
] as const;
export type PopulationStationarityState = typeof POPULATION_STATIONARITY_STATES[number];

export interface PopulationStationarityWorldFacts {
  readonly worldSeed: string;
  readonly competitionCount: number;
  readonly referencePlayerCount: number;
  readonly replacementPlayerCount: number;
  readonly counts: Readonly<Record<PopulationStationarityState, number>>;
  readonly cells: readonly {
    readonly competitionId: string;
    readonly role: OwnerAttributionPlayerSeasonFact["role"];
    readonly referenceCount: number;
    readonly replacementCount: number;
    readonly referenceCurrentP50: number | "not_observed";
    readonly referenceCurrentP90: number | "not_observed";
    readonly replacementCurrentP50: number | "not_observed";
    readonly replacementCurrentP90: number | "not_observed";
  }[];
  readonly reconciliationFailureCount: number;
  readonly unknownOriginCount: number;
}

/** Compares like-aged opening and mature generated players without match output. */
export function populationStationarityWorldFacts(
  input: LeaderConversionWorldInput,
): PopulationStationarityWorldFacts {
  const originByPlayerId = new Map<string, (typeof input.playerOrigins)[number]>();
  let reconciliationFailureCount = 0;
  for (const origin of input.playerOrigins) {
    if (originByPlayerId.has(origin.playerId)) reconciliationFailureCount += 1;
    originByPlayerId.set(origin.playerId, origin);
  }
  const observedPlayerSeasons = new Set<string>();
  for (const row of input.playerSeasons) {
    const key = `${row.seasonNumber}|${row.playerId}`;
    if (observedPlayerSeasons.has(key)) reconciliationFailureCount += 1;
    observedPlayerSeasons.add(key);
  }
  let unknownOriginCount = 0;
  const originFor = (playerId: string) => {
    const origin = originByPlayerId.get(playerId);
    if (origin === undefined || origin.origin === "unknown") unknownOriginCount += 1;
    return origin;
  };
  const inPrimeWindow = ({ age }: OwnerAttributionPlayerSeasonFact) => age >= 23 && age <= 27;
  const references = input.playerSeasons.filter((row) => {
    if (row.seasonNumber !== 1 || !inPrimeWindow(row)) return false;
    return originFor(row.playerId)?.origin === "opening_senior";
  });
  const replacements = input.playerSeasons.filter((row) => {
    if (row.seasonNumber !== 10 || !inPrimeWindow(row)) return false;
    const origin = originFor(row.playerId);
    return origin !== undefined
      && isCareerGeneratedOrigin(origin.origin)
      && origin.generatedSeasonNumber <= 6;
  });
  const referenceByCell = groupStationarityRows(references);
  const replacementByCell = groupStationarityRows(replacements);
  const cellKeys = [...new Set([...referenceByCell.keys(), ...replacementByCell.keys()])].sort();
  const counts = Object.fromEntries(
    POPULATION_STATIONARITY_STATES.map((state) => [state, 0]),
  ) as Record<PopulationStationarityState, number>;
  const cells = cellKeys.map((key) => {
    const referenceRows = referenceByCell.get(key) ?? [];
    const replacementRows = replacementByCell.get(key) ?? [];
    const [competitionId, role] = splitStationarityCellKey(key);
    if (referenceRows.length < 3) {
      counts.reference_not_observed += replacementRows.length;
    } else {
      const referenceMedian = medianNumber(referenceRows.map(({ currentAbility }) => currentAbility));
      for (const player of replacementRows) {
        const storedCeiling = player.currentAbility + player.potentialRoom;
        if (
          !Number.isFinite(player.currentAbility)
          || !Number.isFinite(player.potentialRoom)
          || player.potentialRoom < 0
          || !Number.isFinite(storedCeiling)
        ) {
          reconciliationFailureCount += 1;
          continue;
        }
        if (player.currentAbility >= referenceMedian) counts.stationary_ready += 1;
        else if (storedCeiling >= referenceMedian) counts.development_realization_gap += 1;
        else counts.ceiling_supply_gap += 1;
      }
    }
    return {
      competitionId,
      role,
      referenceCount: referenceRows.length,
      replacementCount: replacementRows.length,
      referenceCurrentP50: observedQuantile(referenceRows, 0.5),
      referenceCurrentP90: observedQuantile(referenceRows, 0.9),
      replacementCurrentP50: observedQuantile(replacementRows, 0.5),
      replacementCurrentP90: observedQuantile(replacementRows, 0.9),
    };
  });
  const competitionIds = new Set([
    ...references.map(({ competitionId }) => competitionId),
    ...replacements.map(({ competitionId }) => competitionId),
  ]);
  const classifiedCount = POPULATION_STATIONARITY_STATES.reduce(
    (total, state) => total + counts[state],
    0,
  );
  reconciliationFailureCount += Number(classifiedCount !== replacements.length);
  return {
    worldSeed: input.worldSeed,
    competitionCount: competitionIds.size,
    referencePlayerCount: references.length,
    replacementPlayerCount: replacements.length,
    counts,
    cells,
    reconciliationFailureCount,
    unknownOriginCount,
  };
}

/** Applies the preregistered L6.27 ceiling-versus-development truth table. */
export function evaluatePopulationStationarity(input: {
  readonly worlds: readonly PopulationStationarityWorldFacts[];
  readonly seasonCount: number;
}) {
  const counts = Object.fromEntries(POPULATION_STATIONARITY_STATES.map((state) => [
    state,
    input.worlds.reduce((total, world) => total + world.counts[state], 0),
  ])) as Record<PopulationStationarityState, number>;
  const replacementPlayerCount = input.worlds.reduce(
    (total, world) => total + world.replacementPlayerCount,
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
  const unknownOriginCount = input.worlds.reduce(
    (total, world) => total + world.unknownOriginCount,
    0,
  );
  const referenceNotObservedShare = replacementPlayerCount === 0
    ? "not_observed" as const
    : counts.reference_not_observed / replacementPlayerCount;
  const nonReadyCount = counts.ceiling_supply_gap + counts.development_realization_gap;
  const ceilingShare = observedShare(counts.ceiling_supply_gap, nonReadyCount);
  const aggregateOwner = ceilingShare === "not_observed"
    ? "not_reproduced" as const
    : ceilingShare >= 0.50
      ? "ceiling_supply" as const
      : "development_realization" as const;
  const coherenceCount = aggregateOwner === "not_reproduced" ? 0 : input.worlds.filter((world) => {
    const worldNonReady = world.counts.ceiling_supply_gap
      + world.counts.development_realization_gap;
    if (worldNonReady === 0) return false;
    const worldOwner = world.counts.ceiling_supply_gap / worldNonReady >= 0.50
      ? "ceiling_supply"
      : "development_realization";
    return worldOwner === aggregateOwner;
  }).length;
  const structuralFailure = input.worlds.length !== 7
    || new Set(input.worlds.map(({ worldSeed }) => worldSeed)).size !== 7
    || input.seasonCount !== 10
    || competitionCount !== 21
    || replacementPlayerCount === 0
    || reconciliationFailureCount > 0
    || unknownOriginCount > 0
    || referenceNotObservedShare === "not_observed"
    || referenceNotObservedShare > 0.10;
  const ownerIdentified = aggregateOwner !== "not_reproduced" && coherenceCount >= 5;
  return {
    decision: structuralFailure
      ? "STOP_RETHINK" as const
      : nonReadyCount === 0
        ? "NOT_REPRODUCED" as const
        : ownerIdentified
          ? "OWNER_IDENTIFIED" as const
          : "MIXED" as const,
    owner: structuralFailure
      ? "structural_reconciliation" as const
      : ownerIdentified
        ? aggregateOwner
        : nonReadyCount === 0
          ? "not_reproduced" as const
          : "mixed" as const,
    counts,
    replacementPlayerCount,
    competitionCount,
    referenceNotObservedShare,
    ceilingShare,
    coherenceCount,
    reconciliationFailureCount,
    unknownOriginCount,
    worlds: input.worlds,
  };
}

export interface GenerationTimeStationaryCeilingFact {
  readonly playerId: string;
  readonly prospectClass: ContextualProspectClass;
  readonly generatedSeasonNumber: number;
  readonly generationDivision: "first_division" | "second_division" | "third_division";
  readonly competitionId: string;
  readonly role: OwnerAttributionPlayerSeasonFact["role"];
  readonly currentAbility: number;
  readonly storedCeiling: number;
}

export interface GenerationTimeStationaryClassCounts {
  readonly candidate: number;
  readonly stationaryCapable: number;
  readonly belowStationaryCeiling: number;
  readonly referenceNotObserved: number;
}

export interface GenerationTimeStationaryWorldFacts {
  readonly worldSeed: string;
  readonly competitionCount: number;
  readonly referencePlayerCount: number;
  readonly candidateCount: number;
  readonly referenceCells: readonly {
    readonly competitionId: string;
    readonly role: GenerationTimeStationaryCeilingFact["role"];
    readonly referenceCount: number;
    readonly referenceCurrentP50: number;
  }[];
  readonly counts: Readonly<Record<ContextualProspectClass, GenerationTimeStationaryClassCounts>>;
  readonly groups: readonly {
    readonly generationDivision: GenerationTimeStationaryCeilingFact["generationDivision"];
    readonly competitionId: string;
    readonly role: GenerationTimeStationaryCeilingFact["role"];
    readonly prospectClass: ContextualProspectClass;
    readonly generatedSeasonNumber: number;
    readonly counts: GenerationTimeStationaryClassCounts;
  }[];
  readonly reconciliationFailureCount: number;
  readonly unknownOriginCount: number;
}

/** Classifies every accepted candidate from facts captured at generation time. */
export function generationTimeStationaryWorldFacts(input: {
  readonly worldSeed: string;
  readonly candidates: readonly GenerationTimeStationaryCeilingFact[];
  readonly playerSeasons: readonly OwnerAttributionPlayerSeasonFact[];
  readonly playerOrigins: readonly {
    readonly playerId: string;
    readonly origin: GenerationalOrigin;
    readonly generatedSeasonNumber: number;
  }[];
}): GenerationTimeStationaryWorldFacts {
  const originByPlayerId = new Map<string, (typeof input.playerOrigins)[number]>();
  let reconciliationFailureCount = 0;
  for (const origin of input.playerOrigins) {
    if (originByPlayerId.has(origin.playerId)) reconciliationFailureCount += 1;
    originByPlayerId.set(origin.playerId, origin);
  }
  let unknownOriginCount = 0;
  const references = input.playerSeasons.filter((row) => {
    if (row.seasonNumber !== 1 || row.age < 23 || row.age > 27) return false;
    const origin = originByPlayerId.get(row.playerId);
    if (origin === undefined || origin.origin === "unknown") unknownOriginCount += 1;
    return origin?.origin === "opening_senior";
  });
  const referenceByCell = groupStationarityRows(references);
  const counts = emptyGenerationTimeStationaryCounts();
  const groups = new Map<string, MutableGenerationTimeStationaryCounts>();
  const seenCandidates = new Set<string>();
  let candidateCount = 0;
  for (const candidate of input.candidates) {
    if (candidate.generatedSeasonNumber > 6) continue;
    candidateCount += 1;
    if (seenCandidates.has(candidate.playerId)) reconciliationFailureCount += 1;
    seenCandidates.add(candidate.playerId);
    const origin = originByPlayerId.get(candidate.playerId);
    if (origin === undefined || origin.origin === "unknown") unknownOriginCount += 1;
    if (
      origin?.origin !== "annual_academy_intake"
      || origin.generatedSeasonNumber !== candidate.generatedSeasonNumber
    ) reconciliationFailureCount += 1;
    const classCounts = counts[candidate.prospectClass];
    const groupKey = [candidate.generationDivision, candidate.competitionId, candidate.role,
      candidate.prospectClass, candidate.generatedSeasonNumber].join("|");
    const groupCounts = groups.get(groupKey)
      ?? { candidate: 0, stationaryCapable: 0, belowStationaryCeiling: 0,
        referenceNotObserved: 0 };
    groups.set(groupKey, groupCounts);
    classCounts.candidate += 1;
    groupCounts.candidate += 1;
    if (
      !Number.isFinite(candidate.currentAbility)
      || !Number.isFinite(candidate.storedCeiling)
      || candidate.storedCeiling < candidate.currentAbility
    ) {
      reconciliationFailureCount += 1;
      continue;
    }
    const referenceRows = referenceByCell.get(
      `${candidate.competitionId}|${candidate.role}`,
    ) ?? [];
    if (referenceRows.length < 3) {
      classCounts.referenceNotObserved += 1;
      groupCounts.referenceNotObserved += 1;
      continue;
    }
    const referenceMedian = medianNumber(
      referenceRows.map(({ currentAbility }) => currentAbility),
    );
    if (candidate.storedCeiling >= referenceMedian) {
      classCounts.stationaryCapable += 1;
      groupCounts.stationaryCapable += 1;
    } else {
      classCounts.belowStationaryCeiling += 1;
      groupCounts.belowStationaryCeiling += 1;
    }
  }
  return {
    worldSeed: input.worldSeed,
    competitionCount: new Set(references.map(({ competitionId }) => competitionId)).size,
    referencePlayerCount: references.length,
    candidateCount,
    referenceCells: [...referenceByCell.entries()].sort(([left], [right]) =>
      left.localeCompare(right)).flatMap(([key, rows]) => {
        if (rows.length < 3) return [];
        const [competitionId, role] = splitStationarityCellKey(key);
        return [{
          competitionId,
          role,
          referenceCount: rows.length,
          referenceCurrentP50: medianNumber(rows.map(({ currentAbility }) => currentAbility)),
        }];
      }),
    counts,
    groups: [...groups.entries()].sort(([left], [right]) => left.localeCompare(right))
      .map(([key, groupCounts]) => {
        const [generationDivision, competitionId, role, prospectClass, generatedSeason] =
          key.split("|");
        if (
          generationDivision === undefined
          || competitionId === undefined
          || role === undefined
          || prospectClass === undefined
          || generatedSeason === undefined
        ) throw new Error(`Invalid generation-time stationarity group: ${key}`);
        return {
          generationDivision: generationDivision as GenerationTimeStationaryCeilingFact[
            "generationDivision"
          ],
          competitionId,
          role: role as GenerationTimeStationaryCeilingFact["role"],
          prospectClass: prospectClass as ContextualProspectClass,
          generatedSeasonNumber: Number(generatedSeason),
          counts: groupCounts,
        };
      }),
    reconciliationFailureCount,
    unknownOriginCount,
  };
}

/** Applies the frozen L6.29A full-population owner rule. */
export function evaluateGenerationTimeStationaryCeiling(input: {
  readonly worlds: readonly GenerationTimeStationaryWorldFacts[];
  readonly seasonCount: number;
}) {
  const counts = combineGenerationTimeStationaryCounts(input.worlds);
  const candidateCount = sumGenerationTimeStationaryCounts(counts, "candidate");
  const declaredCandidateCount = input.worlds.reduce(
    (total, world) => total + world.candidateCount,
    0,
  );
  const stationaryCapableCount = sumGenerationTimeStationaryCounts(
    counts,
    "stationaryCapable",
  );
  const belowStationaryCeilingCount = sumGenerationTimeStationaryCounts(
    counts,
    "belowStationaryCeiling",
  );
  const referenceNotObservedCount = sumGenerationTimeStationaryCounts(
    counts,
    "referenceNotObserved",
  );
  const classifiedCount = stationaryCapableCount + belowStationaryCeilingCount;
  const capableShare = observedShare(stationaryCapableCount, classifiedCount);
  const referenceNotObservedShare = observedShare(referenceNotObservedCount, candidateCount);
  const deficitToHalf = classifiedCount === 0
    ? "not_observed" as const
    : Math.max(0, Math.ceil(classifiedCount / 2) - stationaryCapableCount);
  const capableWorldCount = input.worlds.filter((world) => {
    const capable = sumGenerationTimeStationaryCounts(world.counts, "stationaryCapable");
    const below = sumGenerationTimeStationaryCounts(world.counts, "belowStationaryCeiling");
    return capable + below > 0 && capable / (capable + below) >= 0.50;
  }).length;
  const aggregateDeficitOwner = uniqueGenerationTimeDeficitClass(counts);
  const ownerCoherenceCount = aggregateDeficitOwner === "mixed" ? 0 : input.worlds.filter(
    (world) => uniqueGenerationTimeDeficitClass(world.counts) === aggregateDeficitOwner,
  ).length;
  const aggregateOwnerShare = aggregateDeficitOwner === "mixed"
    || belowStationaryCeilingCount === 0
    ? 0
    : counts[aggregateDeficitOwner].belowStationaryCeiling / belowStationaryCeilingCount;
  const competitionCount = input.worlds.reduce(
    (total, world) => total + world.competitionCount,
    0,
  );
  const reconciliationFailureCount = input.worlds.reduce(
    (total, world) => total + world.reconciliationFailureCount,
    0,
  );
  const unknownOriginCount = input.worlds.reduce(
    (total, world) => total + world.unknownOriginCount,
    0,
  );
  const referenceCellCount = input.worlds.reduce(
    (total, world) => total + world.referenceCells.length,
    0,
  );
  const structuralFailure = input.worlds.length !== 7
    || new Set(input.worlds.map(({ worldSeed }) => worldSeed)).size !== 7
    || input.seasonCount !== 10
    || competitionCount !== 21
    || candidateCount === 0
    || declaredCandidateCount !== candidateCount
    || classifiedCount + referenceNotObservedCount !== candidateCount
    || reconciliationFailureCount > 0
    || unknownOriginCount > 0
    || referenceNotObservedShare === "not_observed"
    || referenceNotObservedShare > 0.10;
  const postGenerationOwner = capableShare !== "not_observed"
    && capableShare >= 0.50
    && capableWorldCount >= 5;
  const classOwner = aggregateDeficitOwner !== "mixed"
    && aggregateOwnerShare >= 0.50
    && ownerCoherenceCount >= 5;
  return {
    decision: structuralFailure
      ? "STOP_RETHINK" as const
      : belowStationaryCeilingCount === 0
        ? "NOT_REPRODUCED" as const
        : postGenerationOwner || classOwner
          ? "OWNER_IDENTIFIED" as const
          : "MIXED" as const,
    owner: structuralFailure
      ? "structural_reconciliation" as const
      : postGenerationOwner
        ? "post_generation_lifecycle" as const
        : classOwner
          ? aggregateDeficitOwner
          : belowStationaryCeilingCount === 0
            ? "not_reproduced" as const
            : "mixed" as const,
    counts,
    candidateCount,
    declaredCandidateCount,
    stationaryCapableCount,
    belowStationaryCeilingCount,
    referenceNotObservedCount,
    capableShare,
    capableWorldCount,
    deficitToHalf,
    aggregateOwnerShare,
    ownerCoherenceCount,
    competitionCount,
    reconciliationFailureCount,
    unknownOriginCount,
    referenceCellCount,
    worlds: input.worlds,
  };
}

type MutableGenerationTimeStationaryCounts = {
  -readonly [Key in keyof GenerationTimeStationaryClassCounts]:
    GenerationTimeStationaryClassCounts[Key];
};

function emptyGenerationTimeStationaryCounts(): Record<
  ContextualProspectClass,
  MutableGenerationTimeStationaryCounts
> {
  return Object.fromEntries(ACADEMY_PROSPECT_CLASSES.map((prospectClass) => [
    prospectClass,
    { candidate: 0, stationaryCapable: 0, belowStationaryCeiling: 0,
      referenceNotObserved: 0 },
  ])) as Record<ContextualProspectClass, MutableGenerationTimeStationaryCounts>;
}

function combineGenerationTimeStationaryCounts(
  worlds: readonly GenerationTimeStationaryWorldFacts[],
): Record<ContextualProspectClass, GenerationTimeStationaryClassCounts> {
  const combined = emptyGenerationTimeStationaryCounts();
  for (const world of worlds) {
    for (const prospectClass of ACADEMY_PROSPECT_CLASSES) {
      const source = world.counts[prospectClass];
      const target = combined[prospectClass];
      target.candidate += source.candidate;
      target.stationaryCapable += source.stationaryCapable;
      target.belowStationaryCeiling += source.belowStationaryCeiling;
      target.referenceNotObserved += source.referenceNotObserved;
    }
  }
  return combined;
}

function sumGenerationTimeStationaryCounts(
  counts: Readonly<Record<ContextualProspectClass, GenerationTimeStationaryClassCounts>>,
  key: keyof GenerationTimeStationaryClassCounts,
): number {
  return ACADEMY_PROSPECT_CLASSES.reduce(
    (total, prospectClass) => total + counts[prospectClass][key],
    0,
  );
}

function uniqueGenerationTimeDeficitClass(
  counts: Readonly<Record<ContextualProspectClass, GenerationTimeStationaryClassCounts>>,
): ContextualProspectClass | "mixed" {
  const ordered = ACADEMY_PROSPECT_CLASSES.map((prospectClass) => ({
    prospectClass,
    count: counts[prospectClass].belowStationaryCeiling,
  })).sort((left, right) => right.count - left.count
    || ACADEMY_PROSPECT_CLASSES.indexOf(left.prospectClass)
      - ACADEMY_PROSPECT_CLASSES.indexOf(right.prospectClass));
  const first = ordered[0];
  return first !== undefined && first.count > 0 && first.count !== ordered[1]?.count
    ? first.prospectClass
    : "mixed";
}

function groupStationarityRows(
  rows: readonly OwnerAttributionPlayerSeasonFact[],
): ReadonlyMap<string, readonly OwnerAttributionPlayerSeasonFact[]> {
  const groups = new Map<string, OwnerAttributionPlayerSeasonFact[]>();
  for (const row of rows) {
    const key = `${row.competitionId}|${row.role}`;
    groups.set(key, [...(groups.get(key) ?? []), row]);
  }
  return groups;
}

function splitStationarityCellKey(key: string): readonly [string, OwnerAttributionPlayerSeasonFact["role"]] {
  const separator = key.lastIndexOf("|");
  if (separator < 1 || separator === key.length - 1) {
    throw new Error(`Invalid stationarity cell key: ${key}`);
  }
  return [
    key.slice(0, separator),
    key.slice(separator + 1) as OwnerAttributionPlayerSeasonFact["role"],
  ];
}

function observedQuantile(
  rows: readonly OwnerAttributionPlayerSeasonFact[],
  quantile: number,
): number | "not_observed" {
  if (rows.length === 0) return "not_observed";
  const ordered = rows.map(({ currentAbility }) => currentAbility)
    .sort((left, right) => left - right);
  return ordered[Math.ceil(quantile * ordered.length) - 1]!;
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

export const GENERATED_LEADER_LANES = ["scorer", "creator"] as const;
export type GeneratedLeaderLane = typeof GENERATED_LEADER_LANES[number];
export const GENERATED_LEADER_LANE_STAGES = [
  "quality_depth",
  "selection_volume",
  "actor_access",
  "occasion_conversion",
  "rank_cutoff",
] as const;
export type GeneratedLeaderLaneStage = typeof GENERATED_LEADER_LANE_STAGES[number];

export interface GeneratedLeaderLaneWorldFacts {
  readonly worldSeed: string;
  readonly competitionCount: number;
  readonly leaderLaneSlotCount: number;
  readonly generatedLeaderLaneCount: number;
  readonly qualityReadyNonLeaderLaneCount: number;
  readonly counts: Readonly<Record<GeneratedLeaderLaneStage, number>>;
  readonly laneCounts: readonly {
    readonly lane: GeneratedLeaderLane;
    readonly generatedLeaderCount: number;
    readonly qualityReadyNonLeaderCount: number;
    readonly counts: Readonly<Record<GeneratedLeaderLaneStage, number>>;
  }[];
  readonly competitionCounts: readonly {
    readonly competitionId: string;
    readonly qualityReadyNonLeaderCount: number;
    readonly counts: Readonly<Record<GeneratedLeaderLaneStage, number>>;
  }[];
  readonly reconciliationFailureCount: number;
  readonly unclassifiableCount: number;
}

/**
 * Decomposes mature generated players against the real leader lane they could enter.
 *
 * One player may contribute one scorer and one creator observation because the
 * product gate itself contains ten slots in each table. No player origin enters
 * a threshold; origin only selects the already-frozen mature generated cohort.
 */
export function generatedLeaderLaneWorldFacts(input: LeaderConversionWorldInput):
GeneratedLeaderLaneWorldFacts {
  const seasonTen = input.playerSeasons.filter(({ seasonNumber }) => seasonNumber === 10);
  const originByPlayerId = new Map<string, (typeof input.playerOrigins)[number]>();
  let reconciliationFailureCount = 0;
  for (const origin of input.playerOrigins) {
    if (originByPlayerId.has(origin.playerId)) reconciliationFailureCount += 1;
    originByPlayerId.set(origin.playerId, origin);
  }
  const seenPlayerKeys = new Set<string>();
  for (const player of seasonTen) {
    const key = `${player.competitionId}|${player.playerId}`;
    if (seenPlayerKeys.has(key)) reconciliationFailureCount += 1;
    seenPlayerKeys.add(key);
  }

  const counts = emptyGeneratedLeaderLaneCounts();
  const laneCounts = new Map<GeneratedLeaderLane, {
    generatedLeaderCount: number;
    qualityReadyNonLeaderCount: number;
    counts: Record<GeneratedLeaderLaneStage, number>;
  }>(GENERATED_LEADER_LANES.map((lane) => [lane, {
    generatedLeaderCount: 0,
    qualityReadyNonLeaderCount: 0,
    counts: emptyGeneratedLeaderLaneCounts(),
  }]));
  const competitionCounts = new Map<string, {
    qualityReadyNonLeaderCount: number;
    counts: Record<GeneratedLeaderLaneStage, number>;
  }>();
  const competitionIds = [...new Set(seasonTen.map(({ competitionId }) => competitionId))].sort();
  let leaderLaneSlotCount = 0;
  let generatedLeaderLaneCount = 0;
  let qualityReadyNonLeaderLaneCount = 0;
  let unclassifiableCount = 0;

  for (const competitionId of competitionIds) {
    const competitionRows = seasonTen.filter((row) => row.competitionId === competitionId);
    const competition = {
      qualityReadyNonLeaderCount: 0,
      counts: emptyGeneratedLeaderLaneCounts(),
    };
    competitionCounts.set(competitionId, competition);
    for (const lane of GENERATED_LEADER_LANES) {
      const key = lane === "scorer" ? "goals" as const : "assists" as const;
      const leaders = topTenPlayerSeasonFacts(competitionRows, key);
      leaderLaneSlotCount += leaders.length;
      const leaderIds = new Set(leaders.map(({ playerId }) => playerId));
      const leadersByRole = groupPlayerSeasonsByRole(leaders);
      const laneSummary = laneCounts.get(lane)!;

      for (const player of competitionRows) {
        const origin = originByPlayerId.get(player.playerId);
        if (origin === undefined) {
          reconciliationFailureCount += 1;
          continue;
        }
        if (
          !isCareerGeneratedOrigin(origin.origin)
          || (input.cohort === "mature_by_season_six" && origin.generatedSeasonNumber > 6)
        ) continue;
        const roleLeaders = leadersByRole.get(player.role);
        if (roleLeaders === undefined) continue;
        if (leaderIds.has(player.playerId)) {
          generatedLeaderLaneCount += 1;
          laneSummary.generatedLeaderCount += 1;
          continue;
        }
        const minimumLeaderAbility = Math.min(...roleLeaders.map(({ currentAbility }) =>
          currentAbility));
        if (player.currentAbility < minimumLeaderAbility) continue;

        const stage = generatedLeaderLaneStage(player, roleLeaders, lane);
        if (stage === "not_observed") {
          unclassifiableCount += 1;
          continue;
        }
        qualityReadyNonLeaderLaneCount += 1;
        laneSummary.qualityReadyNonLeaderCount += 1;
        competition.qualityReadyNonLeaderCount += 1;
        counts[stage] += 1;
        laneSummary.counts[stage] += 1;
        competition.counts[stage] += 1;
      }
    }
  }

  return {
    worldSeed: input.worldSeed,
    competitionCount: competitionIds.length,
    leaderLaneSlotCount,
    generatedLeaderLaneCount,
    qualityReadyNonLeaderLaneCount,
    counts,
    laneCounts: GENERATED_LEADER_LANES.map((lane) => ({ lane, ...laneCounts.get(lane)! })),
    competitionCounts: [...competitionCounts.entries()].map(([competitionId, value]) => ({
      competitionId,
      ...value,
    })),
    reconciliationFailureCount,
    unclassifiableCount,
  };
}

/** Applies the preregistered L6.24 majority-and-world-coherence owner rule. */
export function evaluateGeneratedLeaderLaneConversion(input: {
  readonly worlds: readonly GeneratedLeaderLaneWorldFacts[];
  readonly seasonCount: number;
}) {
  const counts = combineGeneratedLeaderLaneCounts(input.worlds.map(({ counts }) => counts));
  const qualityReadyNonLeaderLaneCount = input.worlds.reduce(
    (total, world) => total + world.qualityReadyNonLeaderLaneCount,
    0,
  );
  const competitionCount = input.worlds.reduce(
    (total, world) => total + world.competitionCount,
    0,
  );
  const leaderLaneSlotCount = input.worlds.reduce(
    (total, world) => total + world.leaderLaneSlotCount,
    0,
  );
  const reconciliationFailureCount = input.worlds.reduce(
    (total, world) => total + world.reconciliationFailureCount,
    0,
  );
  const unclassifiableCount = input.worlds.reduce(
    (total, world) => total + world.unclassifiableCount,
    0,
  );
  const unreachableStages = GENERATED_LEADER_LANE_STAGES.filter((stage) => counts[stage] === 0);
  const unreachableLanes = GENERATED_LEADER_LANES.filter((lane) =>
    input.worlds.reduce((total, world) => total +
      (world.laneCounts.find((row) => row.lane === lane)?.qualityReadyNonLeaderCount ?? 0), 0) === 0
  );
  const dominantStage = GENERATED_LEADER_LANE_STAGES.reduce((best, stage) =>
    counts[stage] > counts[best] ? stage : best
  );
  const dominantShare = qualityReadyNonLeaderLaneCount === 0
    ? "not_observed" as const
    : counts[dominantStage] / qualityReadyNonLeaderLaneCount;
  const coherenceCount = input.worlds.filter((world) =>
    GENERATED_LEADER_LANE_STAGES.every((stage) => world.counts[dominantStage] >= world.counts[stage])
  ).length;
  const structuralFailure = input.worlds.length !== 7
    || input.seasonCount !== 10
    || competitionCount !== 21
    || leaderLaneSlotCount !== 420
    || reconciliationFailureCount > 0
    || unclassifiableCount > 0
    || qualityReadyNonLeaderLaneCount === 0
    || unreachableStages.length > 0
    || unreachableLanes.length > 0;
  const identified = !structuralFailure
    && dominantShare !== "not_observed"
    && dominantShare >= 0.50
    && coherenceCount >= 5;
  return {
    decision: structuralFailure
      ? "STOP_RETHINK" as const
      : identified
        ? "OWNER_IDENTIFIED" as const
        : "MIXED" as const,
    owner: structuralFailure
      ? "structural_reconciliation" as const
      : identified
        ? dominantStage
        : "mixed" as const,
    counts,
    qualityReadyNonLeaderLaneCount,
    generatedLeaderLaneCount: input.worlds.reduce(
      (total, world) => total + world.generatedLeaderLaneCount,
      0,
    ),
    competitionCount,
    leaderLaneSlotCount,
    dominantStage,
    dominantShare,
    coherenceCount,
    unreachableStages,
    unreachableLanes,
    reconciliationFailureCount,
    unclassifiableCount,
    worlds: input.worlds,
  };
}

function generatedLeaderLaneStage(
  player: OwnerAttributionPlayerSeasonFact,
  leaders: readonly OwnerAttributionPlayerSeasonFact[],
  lane: GeneratedLeaderLane,
): GeneratedLeaderLaneStage | "not_observed" {
  const leaderCurrent = medianNumber(leaders.map(({ currentAbility }) => currentAbility));
  const leaderMinutes = medianNumber(leaders.map(({ minutes }) => minutes));
  if (leaderCurrent - player.currentAbility >= 0.50) return "quality_depth";
  if (leaderMinutes - player.minutes >= 450) return "selection_volume";

  const playerAccess = perNineHundred(lane === "scorer" ? player.shots : player.creatorNominations,
    player.minutes);
  const leaderAccessValues = leaders.flatMap((leader) => {
    const value = perNineHundred(
      lane === "scorer" ? leader.shots : leader.creatorNominations,
      leader.minutes,
    );
    return value === "not_observed" ? [] : [value];
  });
  if (playerAccess === "not_observed" || leaderAccessValues.length !== leaders.length) {
    return "not_observed";
  }
  const leaderAccess = medianNumber(leaderAccessValues);
  if (leaderAccess === 0) return "not_observed";
  if (playerAccess < leaderAccess * 0.80) return "actor_access";

  const playerOpportunities = lane === "scorer" ? player.shots : player.creatorNominations;
  const playerOutputs = lane === "scorer" ? player.goals : player.assists;
  const playerConversion = observedShare(playerOutputs, playerOpportunities);
  const leaderConversions = leaders.flatMap((leader) => {
    const opportunities = lane === "scorer" ? leader.shots : leader.creatorNominations;
    const outputs = lane === "scorer" ? leader.goals : leader.assists;
    const value = observedShare(outputs, opportunities);
    return value === "not_observed" ? [] : [value];
  });
  if (playerConversion === "not_observed" || leaderConversions.length === 0) {
    return "not_observed";
  }
  if (playerConversion < medianNumber(leaderConversions) * 0.80) {
    return "occasion_conversion";
  }
  return "rank_cutoff";
}

function groupPlayerSeasonsByRole(
  rows: readonly OwnerAttributionPlayerSeasonFact[],
): ReadonlyMap<OwnerAttributionPlayerSeasonFact["role"], readonly OwnerAttributionPlayerSeasonFact[]> {
  const groups = new Map<
    OwnerAttributionPlayerSeasonFact["role"],
    OwnerAttributionPlayerSeasonFact[]
  >();
  for (const row of rows) groups.set(row.role, [...(groups.get(row.role) ?? []), row]);
  return groups;
}

function medianNumber(values: readonly number[]): number {
  if (values.length === 0) throw new Error("Median requires at least one value");
  const ordered = [...values].sort((left, right) => left - right);
  const middle = Math.floor(ordered.length / 2);
  return ordered.length % 2 === 1
    ? ordered[middle]!
    : (ordered[middle - 1]! + ordered[middle]!) / 2;
}

function perNineHundred(count: number, minutes: number): number | "not_observed" {
  return minutes === 0 ? "not_observed" : count * 900 / minutes;
}

function emptyGeneratedLeaderLaneCounts(): Record<GeneratedLeaderLaneStage, number> {
  return {
    quality_depth: 0,
    selection_volume: 0,
    actor_access: 0,
    occasion_conversion: 0,
    rank_cutoff: 0,
  };
}

function combineGeneratedLeaderLaneCounts(
  rows: readonly Readonly<Record<GeneratedLeaderLaneStage, number>>[],
): Record<GeneratedLeaderLaneStage, number> {
  const combined = emptyGeneratedLeaderLaneCounts();
  for (const row of rows) {
    for (const stage of GENERATED_LEADER_LANE_STAGES) combined[stage] += row[stage];
  }
  return combined;
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
