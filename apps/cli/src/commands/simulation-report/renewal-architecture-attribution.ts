import {
  GENERATIONAL_ORIGINS,
  type GenerationalOrigin,
  type GenerationalRenewalArchitectureFacts,
  type GenerationalSuccessionWorldFacts,
} from "./generational-succession.ts";
import {
  FIRST_DIVISION_COMPETITION_ID,
  topTenPlayerSeasonFacts,
  type OwnerAttributionPlayerSeasonFact,
  type OwnerAttributionWorldFacts,
} from "./owner-attribution.ts";

export type RenewalArchitectureOwner =
  | "selection_retention"
  | "market_distribution"
  | "academy_realization"
  | "renewal_supply"
  | "coupled_or_not_attributed";

export interface ReplacementMatchingPlayer {
  readonly playerId: string;
  readonly clubId: string;
  readonly role: OwnerAttributionPlayerSeasonFact["role"];
  readonly currentAbility: number;
}

export interface ReplacementMatchingFact {
  readonly incumbentPlayerId: string;
  readonly replacementPlayerId: string;
}

export interface RenewalArchitectureWorldEvaluation {
  readonly worldSeed: string;
  readonly leaderSlotCount: number;
  readonly distinctLeaderPlayerCount: number;
  readonly leaderSlotsByOrigin: Readonly<Record<GenerationalOrigin, number>>;
  readonly openingSeniorLeaderPlayerCount: number;
  readonly openingSeniorLeaderOpeningAgeMean: number | "not_observed";
  readonly openingSeniorLeaderOpeningAbilityMean: number | "not_observed";
  readonly openingSeniorLeaderCurrentAbilityMean: number | "not_observed";
  readonly openingSeniorLeaderAbilityDeltaMean: number | "not_observed";
  readonly localReplacementMatchCount: number;
  readonly divisionReplacementMatchCount: number;
  readonly matureAcademyCurrentP90: number | "not_observed";
  readonly openingSeniorCurrentMedian: number | "not_observed";
  readonly matureAcademyMeetsOpeningMedian: boolean;
  readonly annualAcademySeniorQualityPlayerCount: number;
  readonly annualAcademyMaterialMinutePlayerCount: number;
  readonly annualSeniorProviderRequestedSeasonCount: number;
  readonly annualSeniorProviderNotRequestedSeasonCount: number;
  readonly annualSeniorMaterializedPlayerCount: number;
  readonly transferAcquisitionsByOrigin: Readonly<Record<GenerationalOrigin, number>>;
  readonly freeAgentAcquisitionsByOrigin: Readonly<Record<GenerationalOrigin, number>>;
  readonly exits: GenerationalRenewalArchitectureFacts["exits"];
  readonly reconciliationFailureCount: number;
}

export interface RenewalArchitectureCheckpointDecision {
  readonly decision: "OWNER_IDENTIFIED" | "STOP_RETHINK";
  readonly owner: RenewalArchitectureOwner;
  readonly openingSeniorLeaderSlotShare: number | "not_observed";
  readonly localReplacementCapacity: number | "not_observed";
  readonly divisionReplacementCapacity: number | "not_observed";
  readonly worldsMeetingMatureAcademyParity: number;
  readonly annualAcademyMaterialMinuteShare: number | "not_observed";
  readonly annualSeniorProviderRequestedSeasonCount: number;
  readonly annualSeniorMaterializedPlayerCount: number;
  readonly reconciliationFailureCount: number;
  readonly worlds: readonly RenewalArchitectureWorldEvaluation[];
}

/**
 * Maximum-cardinality one-to-one matching under the frozen role and quality
 * rules. Sorting weakest requirement first makes the greedy walk maximal;
 * stable IDs are the deterministic final tie-breaker.
 */
export function maximumReplacementMatching(input: {
  readonly incumbents: readonly ReplacementMatchingPlayer[];
  readonly candidates: readonly ReplacementMatchingPlayer[];
  readonly sameClub: boolean;
}): readonly ReplacementMatchingFact[] {
  const used = new Set<string>();
  const matches: ReplacementMatchingFact[] = [];
  const incumbents = [...input.incumbents].sort((left, right) =>
    left.currentAbility - right.currentAbility || left.playerId.localeCompare(right.playerId));
  const candidates = [...input.candidates].sort((left, right) =>
    left.currentAbility - right.currentAbility || left.playerId.localeCompare(right.playerId));
  for (const incumbent of incumbents) {
    const replacement = candidates.find((candidate) =>
      !used.has(candidate.playerId)
      && candidate.role === incumbent.role
      && (!input.sameClub || candidate.clubId === incumbent.clubId)
      && candidate.currentAbility >= incumbent.currentAbility - 0.5);
    if (replacement === undefined) continue;
    used.add(replacement.playerId);
    matches.push({
      incumbentPlayerId: incumbent.playerId,
      replacementPlayerId: replacement.playerId,
    });
  }
  return matches;
}

/** Total preregistered owner rule; no output-dependent fallback exists. */
export function renewalArchitectureOwner(input: {
  readonly openingSeniorLeaderSlotShare: number | "not_observed";
  readonly localReplacementCapacity: number | "not_observed";
  readonly divisionReplacementCapacity: number | "not_observed";
  readonly worldsMeetingMatureAcademyParity: number;
  readonly annualAcademyMaterialMinuteShare: number | "not_observed";
  readonly reconciliationFailureCount: number;
}): RenewalArchitectureOwner {
  if (
    input.reconciliationFailureCount > 0
    || input.openingSeniorLeaderSlotShare === "not_observed"
    || input.localReplacementCapacity === "not_observed"
    || input.divisionReplacementCapacity === "not_observed"
    || input.annualAcademyMaterialMinuteShare === "not_observed"
    || input.openingSeniorLeaderSlotShare <= 0.5
  ) return "coupled_or_not_attributed";
  if (input.localReplacementCapacity >= 0.5) return "selection_retention";
  if (input.divisionReplacementCapacity >= 0.5) return "market_distribution";
  if (
    input.worldsMeetingMatureAcademyParity < 6
    || input.annualAcademyMaterialMinuteShare < 0.75
  ) return "academy_realization";
  return "renewal_supply";
}

/** Evaluates L5.3C from three observers attached to the same canonical worlds. */
export function evaluateRenewalArchitectureCheckpoint(input: {
  readonly ownerWorlds: readonly OwnerAttributionWorldFacts[];
  readonly generationalWorlds: readonly GenerationalSuccessionWorldFacts[];
  readonly architectureWorlds: readonly GenerationalRenewalArchitectureFacts[];
}): RenewalArchitectureCheckpointDecision {
  const generationalBySeed = new Map(input.generationalWorlds.map((world) => [world.worldSeed, world]));
  const architectureBySeed = new Map(input.architectureWorlds.map((world) => [world.worldSeed, world]));
  const worlds = input.ownerWorlds.map((ownerWorld) => evaluateWorld({
    ownerWorld,
    generationalWorld: generationalBySeed.get(ownerWorld.worldSeed),
    architectureWorld: architectureBySeed.get(ownerWorld.worldSeed),
  }));
  const openingSeniorLeaderSlotCount = worlds.reduce(
    (sum, world) => sum + world.leaderSlotsByOrigin.opening_senior,
    0,
  );
  const leaderSlotCount = worlds.reduce((sum, world) => sum + world.leaderSlotCount, 0);
  const openingSeniorLeaderPlayerCount = worlds.reduce(
    (sum, world) => sum + world.openingSeniorLeaderPlayerCount,
    0,
  );
  const localReplacementMatchCount = worlds.reduce(
    (sum, world) => sum + world.localReplacementMatchCount,
    0,
  );
  const divisionReplacementMatchCount = worlds.reduce(
    (sum, world) => sum + world.divisionReplacementMatchCount,
    0,
  );
  const annualAcademySeniorQualityPlayerCount = worlds.reduce(
    (sum, world) => sum + world.annualAcademySeniorQualityPlayerCount,
    0,
  );
  const annualAcademyMaterialMinutePlayerCount = worlds.reduce(
    (sum, world) => sum + world.annualAcademyMaterialMinutePlayerCount,
    0,
  );
  const reconciliationFailureCount = worlds.reduce(
    (sum, world) => sum + world.reconciliationFailureCount,
    0,
  )
    + Number(input.ownerWorlds.length !== input.generationalWorlds.length)
    + Number(input.ownerWorlds.length !== input.architectureWorlds.length);
  const ownerInput = {
    openingSeniorLeaderSlotShare: observedRatio(openingSeniorLeaderSlotCount, leaderSlotCount),
    localReplacementCapacity: observedRatio(localReplacementMatchCount, openingSeniorLeaderPlayerCount),
    divisionReplacementCapacity: observedRatio(divisionReplacementMatchCount, openingSeniorLeaderPlayerCount),
    worldsMeetingMatureAcademyParity: worlds.filter(({ matureAcademyMeetsOpeningMedian }) =>
      matureAcademyMeetsOpeningMedian).length,
    annualAcademyMaterialMinuteShare: observedRatio(
      annualAcademyMaterialMinutePlayerCount,
      annualAcademySeniorQualityPlayerCount,
    ),
    reconciliationFailureCount,
  } as const;
  const owner = renewalArchitectureOwner(ownerInput);
  return {
    decision: owner === "coupled_or_not_attributed" ? "STOP_RETHINK" : "OWNER_IDENTIFIED",
    owner,
    ...ownerInput,
    annualSeniorProviderRequestedSeasonCount: worlds.reduce(
      (sum, world) => sum + world.annualSeniorProviderRequestedSeasonCount,
      0,
    ),
    annualSeniorMaterializedPlayerCount: worlds.reduce(
      (sum, world) => sum + world.annualSeniorMaterializedPlayerCount,
      0,
    ),
    worlds,
  };
}

function evaluateWorld(input: {
  readonly ownerWorld: OwnerAttributionWorldFacts;
  readonly generationalWorld: GenerationalSuccessionWorldFacts | undefined;
  readonly architectureWorld: GenerationalRenewalArchitectureFacts | undefined;
}): RenewalArchitectureWorldEvaluation {
  const { ownerWorld, generationalWorld, architectureWorld } = input;
  if (generationalWorld === undefined || architectureWorld === undefined) {
    return emptyWorldEvaluation(ownerWorld.worldSeed);
  }
  const origins = new Map(architectureWorld.playerOrigins.map((fact) => [fact.playerId, fact]));
  const seasonTenPlayers = ownerWorld.playerSeasons.filter((row) =>
    row.competitionId === FIRST_DIVISION_COMPETITION_ID && row.seasonNumber === 10);
  const leaderSlots = [
    ...topTenPlayerSeasonFacts(seasonTenPlayers, "goals"),
    ...topTenPlayerSeasonFacts(seasonTenPlayers, "assists"),
  ];
  const leaderIds = new Set(leaderSlots.map(({ playerId }) => playerId));
  const openingSeniorLeaderIds = [...leaderIds].filter((playerId) =>
    origins.get(playerId)?.origin === "opening_senior");
  const playerById = new Map(seasonTenPlayers.map((row) => [row.playerId, row]));
  const incumbents = openingSeniorLeaderIds.flatMap((playerId) => {
    const row = playerById.get(playerId);
    return row === undefined ? [] : [matchingPlayer(row)];
  });
  const candidates = seasonTenPlayers
    .filter((row) => row.age >= 21 && row.age <= 29 && origins.get(row.playerId)?.origin !== "opening_senior")
    .map(matchingPlayer);
  const openingLeaderFacts = openingSeniorLeaderIds.flatMap((playerId) => {
    const origin = origins.get(playerId);
    const current = playerById.get(playerId);
    return origin === undefined || current === undefined ? [] : [{ origin, current }];
  });
  const ceiling = generationalWorld.generatedCeilingRows.find(({ competitionId }) =>
    competitionId === FIRST_DIVISION_COMPETITION_ID);
  const annualAcademyRows = generationalWorld.rows.filter((row) =>
    row.competitionId === FIRST_DIVISION_COMPETITION_ID
    && row.seasonNumber === 10
    && row.origin === "annual_academy_intake");
  const transferAcquisitionsByOrigin = originCountRecord();
  const freeAgentAcquisitionsByOrigin = originCountRecord();
  for (const row of generationalWorld.rows) {
    transferAcquisitionsByOrigin[row.origin] += row.transferAcquisitionCount;
    freeAgentAcquisitionsByOrigin[row.origin] += row.freeAgentAcquisitionCount;
  }
  const leaderSlotsByOrigin = originCountRecord();
  let reconciliationFailureCount = ownerWorld.reconciliationFailureCount
    + generationalWorld.unknownOriginCount
    + Number(generationalWorld.worldSeed !== ownerWorld.worldSeed)
    + Number(architectureWorld.worldSeed !== ownerWorld.worldSeed)
    + Number(seasonTenPlayers.length === 0)
    + Number(leaderSlots.length !== 20);
  for (const leader of leaderSlots) {
    const origin = origins.get(leader.playerId)?.origin;
    if (origin === undefined) reconciliationFailureCount += 1;
    else leaderSlotsByOrigin[origin] += 1;
  }
  reconciliationFailureCount += openingSeniorLeaderIds.length - openingLeaderFacts.length;
  const openingAges = openingLeaderFacts.flatMap(({ origin }) =>
    origin.openingAge === undefined ? [] : [origin.openingAge]);
  const openingAbilities = openingLeaderFacts.flatMap(({ origin }) =>
    origin.openingCurrentAbility === undefined ? [] : [origin.openingCurrentAbility]);
  const currentAbilities = openingLeaderFacts.map(({ current }) => current.currentAbility);
  const deltas = openingLeaderFacts.flatMap(({ origin, current }) =>
    origin.openingCurrentAbility === undefined
      ? []
      : [current.currentAbility - origin.openingCurrentAbility]);
  reconciliationFailureCount += Number(openingAges.length !== openingLeaderFacts.length)
    + Number(openingAbilities.length !== openingLeaderFacts.length)
    + Number(deltas.length !== openingLeaderFacts.length);
  const matureAcademyCurrentP90 = ceiling?.matureAnnualIntakeCurrentP90 ?? "not_observed";
  const openingSeniorCurrentMedian = ceiling?.openingSeniorCurrentMedian ?? "not_observed";
  return {
    worldSeed: ownerWorld.worldSeed,
    leaderSlotCount: leaderSlots.length,
    distinctLeaderPlayerCount: leaderIds.size,
    leaderSlotsByOrigin,
    openingSeniorLeaderPlayerCount: openingSeniorLeaderIds.length,
    openingSeniorLeaderOpeningAgeMean: observedMean(openingAges),
    openingSeniorLeaderOpeningAbilityMean: observedMean(openingAbilities),
    openingSeniorLeaderCurrentAbilityMean: observedMean(currentAbilities),
    openingSeniorLeaderAbilityDeltaMean: observedMean(deltas),
    localReplacementMatchCount: maximumReplacementMatching({ incumbents, candidates, sameClub: true }).length,
    divisionReplacementMatchCount: maximumReplacementMatching({ incumbents, candidates, sameClub: false }).length,
    matureAcademyCurrentP90,
    openingSeniorCurrentMedian,
    matureAcademyMeetsOpeningMedian:
      matureAcademyCurrentP90 !== "not_observed"
      && openingSeniorCurrentMedian !== "not_observed"
      && matureAcademyCurrentP90 >= openingSeniorCurrentMedian,
    annualAcademySeniorQualityPlayerCount: annualAcademyRows.reduce(
      (sum, row) => sum + row.seniorQualityPlayerCount,
      0,
    ),
    annualAcademyMaterialMinutePlayerCount: annualAcademyRows.reduce(
      (sum, row) => sum + row.seniorQualityMaterialMinutePlayerCount,
      0,
    ),
    annualSeniorProviderRequestedSeasonCount:
      generationalWorld.annualRoleContinuity.seniorCandidateGeneratedSeasonCount,
    annualSeniorProviderNotRequestedSeasonCount:
      generationalWorld.annualRoleContinuity.seniorCandidateNotRequestedSeasonCount,
    annualSeniorMaterializedPlayerCount: architectureWorld.playerOrigins.filter(({ origin }) =>
      origin === "annual_senior_intake").length,
    transferAcquisitionsByOrigin,
    freeAgentAcquisitionsByOrigin,
    exits: architectureWorld.exits,
    reconciliationFailureCount,
  };
}

function matchingPlayer(row: OwnerAttributionPlayerSeasonFact): ReplacementMatchingPlayer {
  return {
    playerId: row.playerId,
    clubId: row.clubId,
    role: row.role,
    currentAbility: row.currentAbility,
  };
}

function originCountRecord(): Record<GenerationalOrigin, number> {
  return Object.fromEntries(GENERATIONAL_ORIGINS.map((origin) => [origin, 0])) as Record<
    GenerationalOrigin,
    number
  >;
}

function emptyWorldEvaluation(worldSeed: string): RenewalArchitectureWorldEvaluation {
  return {
    worldSeed,
    leaderSlotCount: 0,
    distinctLeaderPlayerCount: 0,
    leaderSlotsByOrigin: originCountRecord(),
    openingSeniorLeaderPlayerCount: 0,
    openingSeniorLeaderOpeningAgeMean: "not_observed",
    openingSeniorLeaderOpeningAbilityMean: "not_observed",
    openingSeniorLeaderCurrentAbilityMean: "not_observed",
    openingSeniorLeaderAbilityDeltaMean: "not_observed",
    localReplacementMatchCount: 0,
    divisionReplacementMatchCount: 0,
    matureAcademyCurrentP90: "not_observed",
    openingSeniorCurrentMedian: "not_observed",
    matureAcademyMeetsOpeningMedian: false,
    annualAcademySeniorQualityPlayerCount: 0,
    annualAcademyMaterialMinutePlayerCount: 0,
    annualSeniorProviderRequestedSeasonCount: 0,
    annualSeniorProviderNotRequestedSeasonCount: 0,
    annualSeniorMaterializedPlayerCount: 0,
    transferAcquisitionsByOrigin: originCountRecord(),
    freeAgentAcquisitionsByOrigin: originCountRecord(),
    exits: [],
    reconciliationFailureCount: 1,
  };
}

function observedMean(values: readonly number[]): number | "not_observed" {
  return values.length === 0
    ? "not_observed"
    : values.reduce((sum, value) => sum + value, 0) / values.length;
}

function observedRatio(numerator: number, denominator: number): number | "not_observed" {
  return denominator === 0 ? "not_observed" : numerator / denominator;
}
