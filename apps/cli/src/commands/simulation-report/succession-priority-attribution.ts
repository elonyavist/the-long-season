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
  readonly origin: Extract<GenerationalOrigin, "annual_academy_intake" | "annual_senior_intake">;
  readonly currentAbility: number;
  readonly potentialRoom: number;
  readonly qualityFloor: number;
}

function deriveLeaderConversionWorld(input: LeaderConversionWorldInput): {
  readonly facts: LeaderConversionWorldFacts;
  readonly belowLeaderQuality: readonly BelowLeaderQualityFact[];
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
      if (stage === "below_role_leader_quality") {
        if (
          originFact.origin !== "annual_academy_intake"
          && originFact.origin !== "annual_senior_intake"
        ) {
          reconciliationFailureCount += 1;
        } else {
          belowLeaderQuality.push({
            origin: originFact.origin,
            currentAbility: player.currentAbility,
            potentialRoom: player.potentialRoom,
            qualityFloor,
          });
        }
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
