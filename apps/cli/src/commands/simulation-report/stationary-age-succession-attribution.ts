import type { PlayerGenerationExceptionalStockSummary } from "@game/simulation-tools";

import {
  isCareerGeneratedOrigin,
  type GenerationalOrigin,
  type GenerationalRenewalArchitectureFacts,
} from "./generational-succession.ts";
import {
  FIRST_DIVISION_COMPETITION_ID,
  topTenPlayerSeasonFacts,
  type OwnerAttributionOpeningPlayerFact,
  type OwnerAttributionPlayerSeasonFact,
  type OwnerAttributionWorldFacts,
} from "./owner-attribution.ts";
import type { RenewalNeedEpisodeFact } from "./renewal-architecture-attribution.ts";
import {
  evaluatePopulationStationarity,
  populationStationarityWorldFacts,
} from "./succession-priority-attribution.ts";

const SNAPSHOT_SEASONS = [1, 4, 7, 10] as const;
const AGE_BANDS = ["under_22", "22_24", "25_29", "30_32", "33_plus"] as const;
type AgeBand = typeof AGE_BANDS[number];

/** One canonical world's inputs for observation-only L6.40 attribution. */
export interface StationaryAgeSuccessionWorldInput {
  readonly owner: OwnerAttributionWorldFacts;
  readonly architecture: GenerationalRenewalArchitectureFacts;
  readonly renewalNeedEpisodes: readonly RenewalNeedEpisodeFact[];
  readonly exceptionalStock: PlayerGenerationExceptionalStockSummary;
}

export interface OpeningClubAgeFact {
  readonly clubId: string;
  readonly playerCount: number;
  readonly meanAge: number | "not_observed";
  readonly medianAge: number | "not_observed";
  readonly ageBandCounts: Readonly<Record<AgeBand, number>>;
  readonly ageBandShares: Readonly<Record<AgeBand, number | "not_observed">>;
  readonly starterAgeBandCounts: Readonly<Record<AgeBand, number>>;
  readonly reserveAgeBandCounts: Readonly<Record<AgeBand, number>>;
  readonly roleAgeBandCounts: Readonly<Record<string, Readonly<Record<AgeBand, number>>>>;
  readonly currentAbilityMean: number | "not_observed";
  readonly current15Count: number;
  readonly current16Count: number;
}

export interface StationaryStockFact {
  readonly seasonNumber: number;
  readonly origin: GenerationalOrigin;
  readonly role: string;
  readonly ageBand: AgeBand;
  readonly playerCount: number;
  readonly current15Count: number;
  readonly current16Count: number;
  readonly starts: number;
  readonly minutes: number;
}

export interface RoleQualityPathFact {
  readonly role: string;
  readonly origin: GenerationalOrigin;
  readonly startingAgeBand: AgeBand;
  readonly seasonDistance: 1 | 2;
  readonly observationCount: number;
  readonly currentAbilityDeltaP10: number;
  readonly currentAbilityDeltaMedian: number;
  readonly currentAbilityDeltaP90: number;
  readonly current15ExitCount: number;
  readonly current16ExitCount: number;
}

export interface IncumbentTransitionFact {
  readonly playerId: string;
  readonly clubId: string;
  readonly role: string;
  readonly firstAge30Season: number;
  readonly transitionSeason: number;
  readonly transitionKind: "club_move" | "quality_decline" | "left_active_population";
  readonly firstNeedSeason: number | "not_observed";
  readonly fullSeasonsOfWarning: number | "not_observed";
  readonly earlyNeed: boolean;
  readonly viableInternalCandidateAtNeed: boolean;
  readonly viableMarketCandidateObserved: boolean;
  readonly acquisitionBeforeTransition: boolean;
}

export interface StationaryAgeSuccessionWorldEvaluation {
  readonly worldSeed: string;
  readonly openingClubs: readonly OpeningClubAgeFact[];
  readonly openingClubMeanAgeDistribution: {
    readonly p10: number | "not_observed";
    readonly median: number | "not_observed";
    readonly p90: number | "not_observed";
    readonly range: number | "not_observed";
  };
  readonly stock: readonly StationaryStockFact[];
  readonly qualityPaths: readonly RoleQualityPathFact[];
  readonly transitions: readonly IncumbentTransitionFact[];
  readonly exceptionalStock: PlayerGenerationExceptionalStockSummary;
  readonly seasonTenCurrent16: {
    readonly openingSeniorCount: number;
    readonly careerGeneratedCount: number;
    readonly openingSeniorShare: number | "not_observed";
  };
  readonly careerGeneratedLeaderShareSeasonTen: number | "not_observed";
  readonly earlyNeedShareAmongViableTransitions: number | "not_observed";
  readonly dominantNeedTerminalOutcome: string | "not_observed";
  readonly dominantNeedTerminalOutcomeShare: number | "not_observed";
  readonly reachability: {
    readonly transitionWithPriorNeed: boolean;
    readonly transitionWithoutPriorNeed: boolean;
    readonly qualifiedMarketObstruction: boolean;
    readonly completedSuccessorAcquisition: boolean;
    readonly reopenedNeed: boolean;
  };
  readonly reconciliationFailureCount: number;
}

export type StationaryAgeSuccessionOwner =
  | "OPENING_STOCK_RETENTION"
  | "SUCCESSOR_FLOW"
  | "SUCCESSION_TIMING"
  | "MARKET_OR_DEVELOPMENT_FUNNEL";

/** Frozen observation-only L6.40 decision. */
export interface StationaryAgeSuccessionCheckpointDecision {
  readonly decision: "OWNERS_IDENTIFIED" | "STOP_INSTRUMENT";
  readonly owners: readonly StationaryAgeSuccessionOwner[];
  readonly shared: boolean;
  readonly openingStockRetentionWorldCount: number;
  readonly successorFlowWorldCount: number;
  readonly successionTimingWorldCount: number;
  readonly commonFunnelStage: string | "not_observed";
  readonly commonFunnelStageShare: number | "not_observed";
  readonly pooled: {
    readonly openingClubCount: number;
    readonly openingClubMeanAgeDistribution: StationaryAgeSuccessionWorldEvaluation["openingClubMeanAgeDistribution"];
    readonly seasonTenOpeningSeniorCurrent16Count: number;
    readonly seasonTenCareerGeneratedCurrent16Count: number;
    readonly careerGeneratedLeaderShareSeasonTenMean: number | "not_observed";
    readonly transitionCount: number;
    readonly transitionWithPriorNeedCount: number;
    readonly viableTransitionCount: number;
    readonly earlyViableTransitionCount: number;
    readonly needEpisodeCount: number;
    readonly fulfilledNeedEpisodeCount: number;
  };
  readonly exceptionalStockCeiling: "not_evaluated";
  readonly reachability: StationaryAgeSuccessionWorldEvaluation["reachability"];
  readonly reconciliationFailureCount: number;
  readonly worlds: readonly StationaryAgeSuccessionWorldEvaluation[];
}

export const CURRENT16_FUNNEL_TRANSITIONS = [
  "senior_observation",
  "observed_ceiling_supply",
  "development_realization",
  "current16_retention",
] as const;
export type Current16FunnelTransition = typeof CURRENT16_FUNNEL_TRANSITIONS[number];

export const OPENING_CURRENT16_RETENTION_STATES = [
  "not_active_season_ten",
  "outside_first_division",
  "first_division_below_16",
  "first_division_current16",
] as const;
export type OpeningCurrent16RetentionState =
  typeof OPENING_CURRENT16_RETENTION_STATES[number];

export interface ProgressiveCurrent16WorldFacts {
  readonly worldSeed: string;
  readonly generatedCount: number;
  readonly seniorObservedCount: number;
  readonly ceiling16ObservedCount: number;
  readonly current16ReachedCount: number;
  readonly current16RetainedCount: number;
  readonly generatedCurrent16LeaderCount: number;
  readonly openingEliteCount: number;
  readonly openingStateCounts: Readonly<Record<OpeningCurrent16RetentionState, number>>;
  readonly openingEliteRetentionShare: number | "not_observed";
  readonly seasonTenOpeningCurrent16Count: number;
  readonly seasonTenOpeningCurrent16FromBelowCount: number;
  readonly reconciliationFailureCount: number;
}

export interface Current16FunnelTransitionFact {
  readonly denominatorCount: number;
  readonly survivorCount: number;
  readonly lossCount: number;
  readonly survivalShare: number | "not_observed";
}

/** Frozen L6.42A result over the current-product L6.40 cache. */
export interface ProgressiveCurrent16CheckpointDecision {
  readonly decision: "OWNER_IDENTIFIED" | "MIXED" | "STOP_INSTRUMENT";
  readonly owner: Current16FunnelTransition | "mixed" | "structural_reconciliation";
  readonly funnel: Readonly<Record<Current16FunnelTransition, Current16FunnelTransitionFact>>;
  readonly generatedFailureCount: number;
  readonly ownerFailureShare: number | "not_observed";
  readonly ownerCoherenceWorldCount: number;
  readonly generatedCurrent16LeaderCount: number;
  readonly openingStateCounts: Readonly<Record<OpeningCurrent16RetentionState, number>>;
  readonly openingEliteCount: number;
  readonly openingEliteRetentionShare: number | "not_observed";
  readonly openingEliteRetentionWorldCount: number;
  readonly openingEliteRetentionOwner: boolean;
  readonly seasonTenOpeningCurrent16Count: number;
  readonly seasonTenOpeningCurrent16FromBelowCount: number;
  readonly stationarity: ReturnType<typeof evaluatePopulationStationarity>;
  readonly reconciliationFailureCount: number;
  readonly worlds: readonly ProgressiveCurrent16WorldFacts[];
}

/**
 * Reads a nested current-16 funnel without requiring artificial downstream
 * losses. Every denominator is a strict subset of the previous one.
 */
export function evaluateProgressiveCurrent16FunnelCheckpoint(
  inputs: readonly StationaryAgeSuccessionWorldInput[],
): ProgressiveCurrent16CheckpointDecision {
  const worlds = inputs.map(progressiveCurrent16WorldFacts);
  const funnel = current16FunnelTransitions({
    generatedCount: sumWorlds(worlds, "generatedCount"),
    seniorObservedCount: sumWorlds(worlds, "seniorObservedCount"),
    ceiling16ObservedCount: sumWorlds(worlds, "ceiling16ObservedCount"),
    current16ReachedCount: sumWorlds(worlds, "current16ReachedCount"),
    current16RetainedCount: sumWorlds(worlds, "current16RetainedCount"),
  });
  const openingStateCounts = combineCounts(
    OPENING_CURRENT16_RETENTION_STATES,
    worlds.map(({ openingStateCounts: counts }) => counts),
  );
  const generatedFailureCount = funnel.senior_observation.denominatorCount
    - funnel.current16_retention.survivorCount;
  const dominantTransition = CURRENT16_FUNNEL_TRANSITIONS.reduce((best, transition) =>
    funnel[transition].lossCount > funnel[best].lossCount ? transition : best
  );
  const ownerFailureShare = observedRatio(
    funnel[dominantTransition].lossCount,
    generatedFailureCount,
  );
  const ownerCoherenceWorldCount = worlds.filter((world) => {
    const worldFunnel = current16FunnelTransitions(world);
    return CURRENT16_FUNNEL_TRANSITIONS.every((transition) =>
      worldFunnel[dominantTransition].lossCount >= worldFunnel[transition].lossCount
    );
  }).length;
  const openingEliteCount = worlds.reduce(
    (total, world) => total + world.openingEliteCount,
    0,
  );
  const openingEliteRetentionShare = observedRatio(
    openingStateCounts.first_division_current16,
    openingEliteCount,
  );
  const openingEliteRetentionWorldCount = worlds.filter((world) =>
    world.openingEliteRetentionShare !== "not_observed"
      && world.openingEliteRetentionShare >= 0.5
  ).length;
  const stationarity = evaluatePopulationStationarity({
    worlds: inputs.map((input) => populationStationarityWorldFacts({
      worldSeed: input.owner.worldSeed,
      playerSeasons: input.owner.playerSeasons,
      playerOrigins: input.architecture.playerOrigins,
      cohort: "mature_by_season_six",
    })),
    seasonCount: 10,
  });
  const reconciliationFailureCount = worlds.reduce(
    (total, world) => total + world.reconciliationFailureCount,
    0,
  );
  const structuralFailure = inputs.length !== 7
    || new Set(inputs.map(({ owner }) => owner.worldSeed)).size !== 7
    || reconciliationFailureCount > 0
    || worlds.some((world) => !current16FunnelIsNested(world))
    || funnel.senior_observation.denominatorCount === 0
    || funnel.observed_ceiling_supply.denominatorCount === 0
    || funnel.development_realization.denominatorCount === 0
    || funnel.current16_retention.denominatorCount === 0
    || generatedFailureCount === 0
    || openingEliteCount === 0
    || stationarity.decision === "STOP_RETHINK";
  const ownerIdentified = !structuralFailure
    && ownerFailureShare !== "not_observed"
    && ownerFailureShare >= 0.5
    && ownerCoherenceWorldCount >= 5;
  return {
    decision: structuralFailure
      ? "STOP_INSTRUMENT"
      : ownerIdentified
        ? "OWNER_IDENTIFIED"
        : "MIXED",
    owner: structuralFailure
      ? "structural_reconciliation"
      : ownerIdentified
        ? dominantTransition
        : "mixed",
    funnel,
    generatedFailureCount,
    ownerFailureShare,
    ownerCoherenceWorldCount,
    generatedCurrent16LeaderCount: worlds.reduce(
      (total, world) => total + world.generatedCurrent16LeaderCount,
      0,
    ),
    openingStateCounts,
    openingEliteCount,
    openingEliteRetentionShare,
    openingEliteRetentionWorldCount,
    openingEliteRetentionOwner: openingEliteRetentionWorldCount >= 5,
    seasonTenOpeningCurrent16Count: worlds.reduce(
      (total, world) => total + world.seasonTenOpeningCurrent16Count,
      0,
    ),
    seasonTenOpeningCurrent16FromBelowCount: worlds.reduce(
      (total, world) => total + world.seasonTenOpeningCurrent16FromBelowCount,
      0,
    ),
    stationarity,
    reconciliationFailureCount,
    worlds,
  };
}

function progressiveCurrent16WorldFacts(
  input: StationaryAgeSuccessionWorldInput,
): ProgressiveCurrent16WorldFacts {
  const opening = input.owner.openingPlayers ?? [];
  let reconciliationFailureCount = input.owner.reconciliationFailureCount
    + Number(input.owner.worldSeed !== input.architecture.worldSeed)
    + Number(input.owner.openingPlayers === undefined);
  const clubCompetition = new Map<string, string>();
  const openingByPlayerId = new Map<string, OwnerAttributionOpeningPlayerFact>();
  for (const player of opening) {
    const previousCompetition = clubCompetition.get(player.clubId);
    if (previousCompetition !== undefined && previousCompetition !== player.competitionId) {
      reconciliationFailureCount += 1;
    }
    clubCompetition.set(player.clubId, player.competitionId);
    if (openingByPlayerId.has(player.playerId)) reconciliationFailureCount += 1;
    openingByPlayerId.set(player.playerId, player);
  }
  const origins = new Map<string, GenerationalRenewalArchitectureFacts["playerOrigins"][number]>();
  for (const origin of input.architecture.playerOrigins) {
    if (origins.has(origin.playerId)) reconciliationFailureCount += 1;
    origins.set(origin.playerId, origin);
  }
  const rowsByPlayerId = new Map<string, OwnerAttributionPlayerSeasonFact[]>();
  for (const row of input.owner.playerSeasons) {
    const rows = rowsByPlayerId.get(row.playerId) ?? [];
    if (rows.some(({ seasonNumber }) => seasonNumber === row.seasonNumber)) {
      reconciliationFailureCount += 1;
    }
    rowsByPlayerId.set(row.playerId, [...rows, row]);
  }
  for (const rows of rowsByPlayerId.values()) {
    rows.sort((left, right) => left.seasonNumber - right.seasonNumber
      || left.competitionId.localeCompare(right.competitionId)
      || left.clubId.localeCompare(right.clubId));
  }
  const seasonTenFirstDivision = input.owner.playerSeasons.filter((row) =>
    row.seasonNumber === 10 && row.competitionId === FIRST_DIVISION_COMPETITION_ID
  );
  const leaderIds = new Set([
    ...topTenPlayerSeasonFacts(seasonTenFirstDivision, "goals"),
    ...topTenPlayerSeasonFacts(seasonTenFirstDivision, "assists"),
  ].map(({ playerId }) => playerId));
  reconciliationFailureCount += Number(leaderIds.size === 0);

  let generatedCount = 0;
  let seniorObservedCount = 0;
  let ceiling16ObservedCount = 0;
  let current16ReachedCount = 0;
  let current16RetainedCount = 0;
  let generatedCurrent16LeaderCount = 0;
  for (const origin of input.architecture.playerOrigins) {
    if (
      !isCareerGeneratedOrigin(origin.origin)
      || origin.generatedSeasonNumber < 1
      || origin.generatedSeasonNumber > 6
    ) continue;
    if (origin.entryClubId === undefined) {
      reconciliationFailureCount += 1;
      continue;
    }
    const entryCompetitionId = clubCompetition.get(origin.entryClubId);
    if (entryCompetitionId === undefined) {
      reconciliationFailureCount += 1;
      continue;
    }
    if (entryCompetitionId !== FIRST_DIVISION_COMPETITION_ID) continue;
    generatedCount += 1;
    const rows = rowsByPlayerId.get(origin.playerId) ?? [];
    if (rows.length === 0) continue;
    seniorObservedCount += 1;
    const maximumObservedCeiling = Math.max(...rows.map((row) =>
      row.currentAbility + row.potentialRoom));
    if (maximumObservedCeiling < 16) continue;
    ceiling16ObservedCount += 1;
    if (!rows.some(({ currentAbility }) => currentAbility >= 16)) continue;
    current16ReachedCount += 1;
    const seasonTen = rows.find(({ seasonNumber }) => seasonNumber === 10);
    if (
      seasonTen === undefined
      || seasonTen.competitionId !== FIRST_DIVISION_COMPETITION_ID
      || seasonTen.currentAbility < 16
    ) continue;
    current16RetainedCount += 1;
    generatedCurrent16LeaderCount += Number(leaderIds.has(origin.playerId));
  }

  const openingStateCounts = emptyCounts(OPENING_CURRENT16_RETENTION_STATES);
  const openingElites = opening.filter((player) =>
    player.competitionId === FIRST_DIVISION_COMPETITION_ID
      && player.currentAbility >= 16
  );
  for (const player of openingElites) {
    if (origins.get(player.playerId)?.origin !== "opening_senior") {
      reconciliationFailureCount += 1;
    }
    const seasonTen = (rowsByPlayerId.get(player.playerId) ?? [])
      .find(({ seasonNumber }) => seasonNumber === 10);
    if (seasonTen === undefined) {
      openingStateCounts.not_active_season_ten += 1;
    } else if (seasonTen.competitionId !== FIRST_DIVISION_COMPETITION_ID) {
      openingStateCounts.outside_first_division += 1;
    } else if (seasonTen.currentAbility < 16) {
      openingStateCounts.first_division_below_16 += 1;
    } else {
      openingStateCounts.first_division_current16 += 1;
    }
  }
  reconciliationFailureCount += Number(
    OPENING_CURRENT16_RETENTION_STATES.reduce(
      (total, state) => total + openingStateCounts[state],
      0,
    ) !== openingElites.length,
  );
  const seasonTenOpeningCurrent16 = seasonTenFirstDivision.filter((row) =>
    row.currentAbility >= 16 && origins.get(row.playerId)?.origin === "opening_senior"
  );
  return {
    worldSeed: input.owner.worldSeed,
    generatedCount,
    seniorObservedCount,
    ceiling16ObservedCount,
    current16ReachedCount,
    current16RetainedCount,
    generatedCurrent16LeaderCount,
    openingEliteCount: openingElites.length,
    openingStateCounts,
    openingEliteRetentionShare: observedRatio(
      openingStateCounts.first_division_current16,
      openingElites.length,
    ),
    seasonTenOpeningCurrent16Count: seasonTenOpeningCurrent16.length,
    seasonTenOpeningCurrent16FromBelowCount: seasonTenOpeningCurrent16.filter((row) =>
      (openingByPlayerId.get(row.playerId)?.currentAbility ?? Number.POSITIVE_INFINITY) < 16
    ).length,
    reconciliationFailureCount,
  };
}

function current16FunnelTransitions(input: Pick<
  ProgressiveCurrent16WorldFacts,
  | "generatedCount"
  | "seniorObservedCount"
  | "ceiling16ObservedCount"
  | "current16ReachedCount"
  | "current16RetainedCount"
>): Record<Current16FunnelTransition, Current16FunnelTransitionFact> {
  const transition = (denominatorCount: number, survivorCount: number) => ({
    denominatorCount,
    survivorCount,
    lossCount: denominatorCount - survivorCount,
    survivalShare: observedRatio(survivorCount, denominatorCount),
  });
  return {
    senior_observation: transition(input.generatedCount, input.seniorObservedCount),
    observed_ceiling_supply: transition(
      input.seniorObservedCount,
      input.ceiling16ObservedCount,
    ),
    development_realization: transition(
      input.ceiling16ObservedCount,
      input.current16ReachedCount,
    ),
    current16_retention: transition(
      input.current16ReachedCount,
      input.current16RetainedCount,
    ),
  };
}

function current16FunnelIsNested(world: ProgressiveCurrent16WorldFacts): boolean {
  return world.generatedCount >= world.seniorObservedCount
    && world.seniorObservedCount >= world.ceiling16ObservedCount
    && world.ceiling16ObservedCount >= world.current16ReachedCount
    && world.current16ReachedCount >= world.current16RetainedCount
    && world.current16RetainedCount >= world.generatedCurrent16LeaderCount;
}

function sumWorlds(
  worlds: readonly ProgressiveCurrent16WorldFacts[],
  key: "generatedCount" | "seniorObservedCount" | "ceiling16ObservedCount"
    | "current16ReachedCount" | "current16RetainedCount",
): number {
  return worlds.reduce((total, world) => total + world[key], 0);
}

function emptyCounts<Key extends string>(keys: readonly Key[]): Record<Key, number> {
  return Object.fromEntries(keys.map((key) => [key, 0])) as Record<Key, number>;
}

function combineCounts<Key extends string>(
  keys: readonly Key[],
  rows: readonly Readonly<Record<Key, number>>[],
): Record<Key, number> {
  return Object.fromEntries(keys.map((key) => [
    key,
    rows.reduce((total, row) => total + row[key], 0),
  ])) as Record<Key, number>;
}

/**
 * Joins only canonical opening, season, origin and market facts.
 *
 * The evaluator contains no player-development, aging or recruitment formula;
 * it can therefore name an owner without becoming a second simulation model.
 */
export function evaluateStationaryAgeSuccessionCheckpoint(
  inputs: readonly StationaryAgeSuccessionWorldInput[],
): StationaryAgeSuccessionCheckpointDecision {
  const worlds = inputs.map(evaluateWorld);
  const reconciliationFailureCount = worlds.reduce(
    (sum, world) => sum + world.reconciliationFailureCount,
    0,
  ) + Number(worlds.length !== 7);
  const openingStockRetentionWorldCount = worlds.filter((world) =>
    world.seasonTenCurrent16.openingSeniorShare !== "not_observed"
      && world.seasonTenCurrent16.openingSeniorShare >= 0.5
  ).length;
  const successorFlowWorldCount = worlds.filter((world) =>
    world.seasonTenCurrent16.careerGeneratedCount
      < world.seasonTenCurrent16.openingSeniorCount
      && world.careerGeneratedLeaderShareSeasonTen !== "not_observed"
      && world.careerGeneratedLeaderShareSeasonTen < 0.5
  ).length;
  const successionTimingWorldCount = worlds.filter((world) =>
    world.earlyNeedShareAmongViableTransitions !== "not_observed"
      && world.earlyNeedShareAmongViableTransitions < 0.5
  ).length;
  const funnel = dominantString(
    inputs.flatMap(({ renewalNeedEpisodes }) =>
      renewalNeedEpisodes.map(({ terminalOutcome }) => terminalOutcome)
    ),
  );
  const allTransitions = worlds.flatMap(({ transitions }) => transitions);
  const viableTransitions = allTransitions.filter((transition) =>
    transition.viableInternalCandidateAtNeed || transition.viableMarketCandidateObserved
  );
  const leaderShares = worlds.flatMap(({ careerGeneratedLeaderShareSeasonTen }) =>
    careerGeneratedLeaderShareSeasonTen === "not_observed"
      ? []
      : [careerGeneratedLeaderShareSeasonTen]
  );
  const allEpisodes = inputs.flatMap(({ renewalNeedEpisodes }) => renewalNeedEpisodes);
  const owners: StationaryAgeSuccessionOwner[] = [
    ...(openingStockRetentionWorldCount >= 5 ? ["OPENING_STOCK_RETENTION" as const] : []),
    ...(successorFlowWorldCount >= 5 ? ["SUCCESSOR_FLOW" as const] : []),
    ...(successionTimingWorldCount >= 5 ? ["SUCCESSION_TIMING" as const] : []),
    ...(successionTimingWorldCount < 5
      && funnel.share !== "not_observed"
      && funnel.share >= 0.5
      ? ["MARKET_OR_DEVELOPMENT_FUNNEL" as const]
      : []),
  ];
  const reachability = {
    transitionWithPriorNeed: worlds.some(({ reachability }) => reachability.transitionWithPriorNeed),
    transitionWithoutPriorNeed: worlds.some(({ reachability }) => reachability.transitionWithoutPriorNeed),
    qualifiedMarketObstruction: worlds.some(({ reachability }) => reachability.qualifiedMarketObstruction),
    completedSuccessorAcquisition: worlds.some(({ reachability }) => reachability.completedSuccessorAcquisition),
    reopenedNeed: worlds.some(({ reachability }) => reachability.reopenedNeed),
  };
  const reachabilityHeld = Object.values(reachability).every(Boolean);
  return {
    decision: reconciliationFailureCount === 0 && reachabilityHeld
      ? "OWNERS_IDENTIFIED"
      : "STOP_INSTRUMENT",
    owners,
    shared: owners.length > 1,
    openingStockRetentionWorldCount,
    successorFlowWorldCount,
    successionTimingWorldCount,
    commonFunnelStage: funnel.value,
    commonFunnelStageShare: funnel.share,
    pooled: {
      openingClubCount: worlds.reduce((sum, world) => sum + world.openingClubs.length, 0),
      openingClubMeanAgeDistribution: distribution(
        worlds.flatMap(({ openingClubs }) => openingClubs.flatMap(({ meanAge }) =>
          meanAge === "not_observed" ? [] : [meanAge]
        )),
      ),
      seasonTenOpeningSeniorCurrent16Count: worlds.reduce(
        (sum, world) => sum + world.seasonTenCurrent16.openingSeniorCount,
        0,
      ),
      seasonTenCareerGeneratedCurrent16Count: worlds.reduce(
        (sum, world) => sum + world.seasonTenCurrent16.careerGeneratedCount,
        0,
      ),
      careerGeneratedLeaderShareSeasonTenMean: mean(leaderShares),
      transitionCount: allTransitions.length,
      transitionWithPriorNeedCount: allTransitions.filter(
        ({ firstNeedSeason }) => firstNeedSeason !== "not_observed",
      ).length,
      viableTransitionCount: viableTransitions.length,
      earlyViableTransitionCount: viableTransitions.filter(({ earlyNeed }) => earlyNeed).length,
      needEpisodeCount: allEpisodes.length,
      fulfilledNeedEpisodeCount: allEpisodes.filter(
        ({ terminalOutcome }) => terminalOutcome === "fulfilled",
      ).length,
    },
    exceptionalStockCeiling: "not_evaluated",
    reachability,
    reconciliationFailureCount,
    worlds,
  };
}

function evaluateWorld(
  input: StationaryAgeSuccessionWorldInput,
): StationaryAgeSuccessionWorldEvaluation {
  const opening = input.owner.openingPlayers?.filter(
    ({ competitionId }) => competitionId === FIRST_DIVISION_COMPETITION_ID,
  );
  const playerRows = input.owner.playerSeasons.filter(
    ({ competitionId }) => competitionId === FIRST_DIVISION_COMPETITION_ID,
  );
  const origins = new Map(
    input.architecture.playerOrigins.map((row) => [row.playerId, row.origin]),
  );
  let reconciliationFailureCount = input.owner.reconciliationFailureCount
    + Number(input.owner.worldSeed !== input.architecture.worldSeed)
    + Number(opening === undefined)
    + Number(opening?.length === 0);
  const openingClubs = opening === undefined ? [] : openingClubFacts(opening);
  const stock = stockFacts(playerRows, origins);
  const qualityPaths = qualityPathFacts(playerRows, origins);
  const transitions = transitionFacts(playerRows, input.renewalNeedEpisodes);
  const seasonTen = playerRows.filter(({ seasonNumber }) => seasonNumber === 10);
  const seasonTenCurrent16 = seasonTen.filter(({ currentAbility }) => currentAbility >= 16);
  const openingSeniorCount = seasonTenCurrent16.filter((row) =>
    origins.get(row.playerId) === "opening_senior"
  ).length;
  const careerGeneratedCount = seasonTenCurrent16.filter((row) => {
    const origin = origins.get(row.playerId);
    return origin !== undefined && isCareerGeneratedOrigin(origin);
  }).length;
  const leaderRows = [
    ...topTenPlayerSeasonFacts(seasonTen, "goals"),
    ...topTenPlayerSeasonFacts(seasonTen, "assists"),
  ];
  const generatedLeaderCount = leaderRows.filter((row) => {
    const origin = origins.get(row.playerId);
    return origin !== undefined && isCareerGeneratedOrigin(origin);
  }).length;
  reconciliationFailureCount += playerRows.filter((row) => !origins.has(row.playerId)).length;
  reconciliationFailureCount += Number(leaderRows.length !== 20);
  const viableTransitions = transitions.filter((row) =>
    row.viableInternalCandidateAtNeed || row.viableMarketCandidateObserved
  );
  const episodes = input.renewalNeedEpisodes.filter(({ divisionLevel }) => divisionLevel === 1);
  const terminal = dominantString(episodes.map(({ terminalOutcome }) => terminalOutcome));
  return {
    worldSeed: input.owner.worldSeed,
    openingClubs,
    openingClubMeanAgeDistribution: distribution(
      openingClubs.flatMap(({ meanAge }) => meanAge === "not_observed" ? [] : [meanAge]),
    ),
    stock,
    qualityPaths,
    transitions,
    exceptionalStock: input.exceptionalStock,
    seasonTenCurrent16: {
      openingSeniorCount,
      careerGeneratedCount,
      openingSeniorShare: observedRatio(openingSeniorCount, seasonTenCurrent16.length),
    },
    careerGeneratedLeaderShareSeasonTen: observedRatio(
      generatedLeaderCount,
      leaderRows.length,
    ),
    earlyNeedShareAmongViableTransitions: observedRatio(
      viableTransitions.filter(({ earlyNeed }) => earlyNeed).length,
      viableTransitions.length,
    ),
    dominantNeedTerminalOutcome: terminal.value,
    dominantNeedTerminalOutcomeShare: terminal.share,
    reachability: {
      transitionWithPriorNeed: transitions.some(({ firstNeedSeason }) => firstNeedSeason !== "not_observed"),
      transitionWithoutPriorNeed: transitions.some(({ firstNeedSeason }) => firstNeedSeason === "not_observed"),
      qualifiedMarketObstruction: episodes.some(({ successionTargetPoolStage }) =>
        successionTargetPoolStage === "qualified_prime_age_loses_generic_score"
      ),
      completedSuccessorAcquisition: episodes.some(({ terminalOutcome }) => terminalOutcome === "fulfilled"),
      reopenedNeed: hasReopenedNeed(episodes),
    },
    reconciliationFailureCount,
  };
}

function openingClubFacts(
  rows: readonly OwnerAttributionOpeningPlayerFact[],
): readonly OpeningClubAgeFact[] {
  const byClub = groupBy(rows, ({ clubId }) => clubId);
  return [...byClub].sort(([left], [right]) => left.localeCompare(right)).map(([clubId, players]) => {
    const counts = ageBandRecord();
    const starterCounts = ageBandRecord();
    const reserveCounts = ageBandRecord();
    const roleCounts = new Map<string, Record<AgeBand, number>>();
    for (const player of players) {
      const band = ageBand(player.age);
      counts[band] += 1;
      (player.openingStarter ? starterCounts : reserveCounts)[band] += 1;
      const role = roleCounts.get(player.role) ?? ageBandRecord();
      role[band] += 1;
      roleCounts.set(player.role, role);
    }
    return {
      clubId,
      playerCount: players.length,
      meanAge: mean(players.map(({ age }) => age)),
      medianAge: percentile(players.map(({ age }) => age), 0.5),
      ageBandCounts: counts,
      ageBandShares: Object.fromEntries(AGE_BANDS.map((band) => [
        band,
        observedRatio(counts[band], players.length),
      ])) as Readonly<Record<AgeBand, number | "not_observed">>,
      starterAgeBandCounts: starterCounts,
      reserveAgeBandCounts: reserveCounts,
      roleAgeBandCounts: Object.fromEntries([...roleCounts].sort(([left], [right]) =>
        left.localeCompare(right))),
      currentAbilityMean: mean(players.map(({ currentAbility }) => currentAbility)),
      current15Count: players.filter(({ currentAbility }) => currentAbility >= 15).length,
      current16Count: players.filter(({ currentAbility }) => currentAbility >= 16).length,
    };
  });
}

function stockFacts(
  rows: readonly OwnerAttributionPlayerSeasonFact[],
  origins: ReadonlyMap<string, GenerationalOrigin>,
): readonly StationaryStockFact[] {
  const cells = new Map<string, StationaryStockFact>();
  for (const row of rows) {
    if (!SNAPSHOT_SEASONS.includes(row.seasonNumber as typeof SNAPSHOT_SEASONS[number])) continue;
    const origin = origins.get(row.playerId);
    if (origin === undefined) continue;
    const band = ageBand(row.age);
    const key = `${row.seasonNumber}|${origin}|${row.role}|${band}`;
    const previous = cells.get(key);
    cells.set(key, {
      seasonNumber: row.seasonNumber,
      origin,
      role: row.role,
      ageBand: band,
      playerCount: (previous?.playerCount ?? 0) + 1,
      current15Count: (previous?.current15Count ?? 0) + Number(row.currentAbility >= 15),
      current16Count: (previous?.current16Count ?? 0) + Number(row.currentAbility >= 16),
      starts: (previous?.starts ?? 0) + row.starts,
      minutes: (previous?.minutes ?? 0) + row.minutes,
    });
  }
  return [...cells.values()].sort((left, right) =>
    left.seasonNumber - right.seasonNumber
    || left.origin.localeCompare(right.origin)
    || left.role.localeCompare(right.role)
    || left.ageBand.localeCompare(right.ageBand)
  );
}

function qualityPathFacts(
  rows: readonly OwnerAttributionPlayerSeasonFact[],
  origins: ReadonlyMap<string, GenerationalOrigin>,
): readonly RoleQualityPathFact[] {
  const byPlayer = groupBy(rows, ({ playerId }) => playerId);
  const deltas = new Map<string, { values: number[]; current15Exits: number; current16Exits: number }>();
  for (const playerRows of byPlayer.values()) {
    const ordered = [...playerRows].sort((left, right) => left.seasonNumber - right.seasonNumber);
    const origin = origins.get(ordered[0]?.playerId ?? "");
    if (origin === undefined) continue;
    for (const start of ordered) {
      for (const distance of [1, 2] as const) {
        const end = ordered.find(({ seasonNumber }) => seasonNumber === start.seasonNumber + distance);
        if (end === undefined || end.role !== start.role) continue;
        const key = `${start.role}|${origin}|${ageBand(start.age)}|${distance}`;
        const cell = deltas.get(key) ?? { values: [], current15Exits: 0, current16Exits: 0 };
        cell.values.push(end.currentAbility - start.currentAbility);
        cell.current15Exits += Number(start.currentAbility >= 15 && end.currentAbility < 15);
        cell.current16Exits += Number(start.currentAbility >= 16 && end.currentAbility < 16);
        deltas.set(key, cell);
      }
    }
  }
  return [...deltas].map(([key, cell]) => {
    const [role, origin, startingAgeBand, distance] = key.split("|") as
      [string, GenerationalOrigin, AgeBand, "1" | "2"];
    return {
      role,
      origin,
      startingAgeBand,
      seasonDistance: Number(distance) as 1 | 2,
      observationCount: cell.values.length,
      currentAbilityDeltaP10: requiredPercentile(cell.values, 0.1),
      currentAbilityDeltaMedian: requiredPercentile(cell.values, 0.5),
      currentAbilityDeltaP90: requiredPercentile(cell.values, 0.9),
      current15ExitCount: cell.current15Exits,
      current16ExitCount: cell.current16Exits,
    };
  }).sort((left, right) =>
    left.role.localeCompare(right.role)
    || left.origin.localeCompare(right.origin)
    || left.startingAgeBand.localeCompare(right.startingAgeBand)
    || left.seasonDistance - right.seasonDistance
  );
}

function transitionFacts(
  rows: readonly OwnerAttributionPlayerSeasonFact[],
  episodes: readonly RenewalNeedEpisodeFact[],
): readonly IncumbentTransitionFact[] {
  const byPlayer = groupBy(rows, ({ playerId }) => playerId);
  const output: IncumbentTransitionFact[] = [];
  for (const [playerId, playerRows] of byPlayer) {
    const ordered = [...playerRows].sort((left, right) => left.seasonNumber - right.seasonNumber);
    const first = ordered.find(({ age }) => age >= 30);
    if (first === undefined || first.seasonNumber >= 10) continue;
    const later = ordered.filter(({ seasonNumber }) => seasonNumber > first.seasonNumber);
    const changed = later.find((row) =>
      row.clubId !== first.clubId || row.currentAbility <= first.currentAbility - 0.5
    );
    const disappearedIn = firstMissingFollowingSeason(first.seasonNumber, ordered);
    const transition = changed === undefined && disappearedIn === undefined
      ? undefined
      : changed === undefined
        ? { seasonNumber: disappearedIn!, kind: "left_active_population" as const }
        : {
            seasonNumber: changed.seasonNumber,
            kind: changed.clubId !== first.clubId
              ? "club_move" as const
              : "quality_decline" as const,
          };
    if (transition === undefined) continue;
    const matchingEpisodes = episodes.filter((episode) =>
      episode.divisionLevel === 1
      && episode.clubId === first.clubId
      && episode.role === first.role
      && episode.roleSuccessionSnapshot?.incumbent.playerId === playerId
      && episode.seasonNumber <= transition.seasonNumber
    ).sort((left, right) => left.seasonNumber - right.seasonNumber);
    const need = matchingEpisodes[0];
    const viableInternal = need?.roleSuccessionSnapshot?.bestPrimeAgeAlternative !== undefined
      && need.roleSuccessionSnapshot.bestPrimeAgeAlternative.currentAbility
        >= need.roleSuccessionSnapshot.planningFloor;
    const viableMarket = matchingEpisodes.some(({ successionTargetPoolStage }) =>
      successionTargetPoolStage === "qualified_prime_age_already_wins"
      || successionTargetPoolStage === "qualified_prime_age_loses_generic_score"
    );
    const warning = need === undefined
      ? "not_observed" as const
      : transition.seasonNumber - need.seasonNumber;
    output.push({
      playerId,
      clubId: first.clubId,
      role: first.role,
      firstAge30Season: first.seasonNumber,
      transitionSeason: transition.seasonNumber,
      transitionKind: transition.kind,
      firstNeedSeason: need?.seasonNumber ?? "not_observed",
      fullSeasonsOfWarning: warning,
      earlyNeed: warning !== "not_observed" && warning >= 1,
      viableInternalCandidateAtNeed: viableInternal,
      viableMarketCandidateObserved: viableMarket,
      acquisitionBeforeTransition: matchingEpisodes.some((episode) =>
        episode.terminalOutcome === "fulfilled"
        && episode.seasonNumber < transition.seasonNumber
      ),
    });
  }
  return output.sort((left, right) =>
    left.transitionSeason - right.transitionSeason
    || left.clubId.localeCompare(right.clubId)
    || left.role.localeCompare(right.role)
    || left.playerId.localeCompare(right.playerId)
  );
}

function firstMissingFollowingSeason(
  firstSeason: number,
  rows: readonly OwnerAttributionPlayerSeasonFact[],
): number | undefined {
  const seasons = new Set(rows.map(({ seasonNumber }) => seasonNumber));
  for (let season = firstSeason + 1; season <= 10; season += 1) {
    if (!seasons.has(season)) return season;
  }
  return undefined;
}

function hasReopenedNeed(episodes: readonly RenewalNeedEpisodeFact[]): boolean {
  const counts = new Map<string, number>();
  for (const episode of episodes) {
    const key = `${episode.clubId}|${episode.role}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.values()].some((count) => count > 1);
}

function ageBand(age: number): AgeBand {
  if (age <= 21) return "under_22";
  if (age <= 24) return "22_24";
  if (age <= 29) return "25_29";
  if (age <= 32) return "30_32";
  return "33_plus";
}

function ageBandRecord(): Record<AgeBand, number> {
  return Object.fromEntries(AGE_BANDS.map((band) => [band, 0])) as Record<AgeBand, number>;
}

function groupBy<Row>(
  rows: readonly Row[],
  keyFor: (row: Row) => string,
): Map<string, Row[]> {
  const groups = new Map<string, Row[]>();
  for (const row of rows) {
    const key = keyFor(row);
    const group = groups.get(key) ?? [];
    group.push(row);
    groups.set(key, group);
  }
  return groups;
}

function mean(values: readonly number[]): number | "not_observed" {
  return values.length === 0
    ? "not_observed"
    : values.reduce((sum, value) => sum + value, 0) / values.length;
}

function observedRatio(numerator: number, denominator: number): number | "not_observed" {
  return denominator === 0 ? "not_observed" : numerator / denominator;
}

function percentile(values: readonly number[], fraction: number): number | "not_observed" {
  if (values.length === 0) return "not_observed";
  return requiredPercentile(values, fraction);
}

function requiredPercentile(values: readonly number[], fraction: number): number {
  const sorted = [...values].sort((left, right) => left - right);
  const position = (sorted.length - 1) * fraction;
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  const lowerValue = sorted[lower]!;
  const upperValue = sorted[upper]!;
  return lowerValue + (upperValue - lowerValue) * (position - lower);
}

function distribution(values: readonly number[]): StationaryAgeSuccessionWorldEvaluation["openingClubMeanAgeDistribution"] {
  if (values.length === 0) {
    return { p10: "not_observed", median: "not_observed", p90: "not_observed", range: "not_observed" };
  }
  return {
    p10: requiredPercentile(values, 0.1),
    median: requiredPercentile(values, 0.5),
    p90: requiredPercentile(values, 0.9),
    range: Math.max(...values) - Math.min(...values),
  };
}

function dominantString(values: readonly string[]): {
  readonly value: string | "not_observed";
  readonly share: number | "not_observed";
} {
  if (values.length === 0) return { value: "not_observed", share: "not_observed" };
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  const [value, count] = [...counts].sort(([left, leftCount], [right, rightCount]) =>
    rightCount - leftCount || left.localeCompare(right)
  )[0]!;
  return { value, share: count / values.length };
}
