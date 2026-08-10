import type {
  AiMarketDiagnosticFact,
  AiMarketDiagnosticReason,
  AiMarketLifecycleFact,
} from "@game/engine";

import type { CliPlayer } from "../career/types.ts";
import { HISTORICAL_DIVISION_TABLE_TARGETS } from "./historical-simulation-targets.ts";
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

type RenewalNeedRole = NonNullable<CliPlayer["primaryRole"]>;

export const RENEWAL_NEED_STAGES = [
  "observed",
  "recruitable",
  "target_found",
  "talk_started",
  "fulfilled",
] as const;
export type RenewalNeedStage = typeof RENEWAL_NEED_STAGES[number];

export type RenewalNeedTerminalOutcome =
  | AiMarketDiagnosticReason
  | "fulfilled"
  | "negotiation_still_open"
  | "completion_failed"
  | "recruitment_impossible";

/** One non-overlapping role-need episode inside a club season. */
export interface RenewalNeedEpisodeFact {
  readonly worldSeed: string;
  readonly divisionLevel: 1 | 2 | 3;
  readonly clubId: string;
  readonly seasonNumber: number;
  readonly role: RenewalNeedRole;
  readonly needEpisodeOrdinal: number;
  readonly firstAppearanceDate: number;
  readonly maximumStage: RenewalNeedStage;
  readonly terminalOutcome: RenewalNeedTerminalOutcome;
}

export interface RenewalNeedFunnelEvaluation {
  readonly episodeCount: number;
  readonly maximumStageCounts: Readonly<Record<RenewalNeedStage, number>>;
  readonly terminalOutcomeCounts: Readonly<Record<RenewalNeedTerminalOutcome, number>>;
  readonly dominantTerminalOutcomeByDivision: Readonly<Record<1 | 2 | 3, RenewalNeedTerminalOutcome | "not_observed">>;
  readonly reconciliationFailureCount: number;
}

export const RENEWAL_ABLATION_METRICS = [
  "localReplacementCapacity",
  "divisionReplacementCapacity",
  "fourReplicatedFormationRetentionShare",
  "careerGeneratedLeaderShareSeasonTen",
  "championPoints",
] as const;
export type RenewalAblationMetric = typeof RENEWAL_ABLATION_METRICS[number];
export type RenewalAblationArmKey = "control" | "market" | "blueprint" | "combined";

export interface RenewalAblationMetricRow {
  readonly worldSeed: string;
  readonly values: Readonly<Record<RenewalAblationMetric, number>>;
}

export interface RenewalPopulationSeasonSignature {
  readonly seasonNumber: number;
  readonly playerCount: number;
  readonly sha256: string;
}

export interface RenewalPopulationWorldSignatures {
  readonly worldSeed: string;
  readonly seasons: readonly RenewalPopulationSeasonSignature[];
}

export interface RenewalAblationArmFacts {
  readonly arm: RenewalAblationArmKey;
  readonly values: Readonly<Record<RenewalAblationMetric, number>>;
  readonly worlds: readonly RenewalAblationMetricRow[];
  readonly populationSignatures: readonly RenewalPopulationWorldSignatures[];
}

export type RenewalAblationOwner =
  | "market"
  | "blueprint"
  | "shared_interaction"
  | "population_strength"
  | "not_reproduced";

export interface RenewalAblationMetricDecision {
  readonly metric: RenewalAblationMetric;
  readonly owner: RenewalAblationOwner;
  readonly marketWithoutBlueprint: number;
  readonly marketWithBlueprint: number;
  readonly blueprintWithoutMarket: number;
  readonly blueprintWithMarket: number;
  readonly interaction: number;
  readonly marketCoherence: readonly [number, number];
  readonly blueprintCoherence: readonly [number, number];
}

export interface RenewalAblationDecision {
  readonly decision: "OWNERS_IDENTIFIED" | "REFINE";
  readonly metrics: readonly RenewalAblationMetricDecision[];
  readonly firstPopulationDivergenceSeasonByArm: Readonly<Record<
    Exclude<RenewalAblationArmKey, "control">,
    Readonly<Record<string, number | "not_observed">>
  >>;
}

interface MutableRenewalNeedEpisode {
  readonly worldSeed: string;
  readonly divisionLevel: 1 | 2 | 3;
  readonly clubId: string;
  readonly seasonNumber: number;
  readonly role: RenewalNeedRole;
  readonly needEpisodeOrdinal: number;
  readonly firstAppearanceDate: number;
  maximumStage: RenewalNeedStage;
  lastReason?: AiMarketDiagnosticReason;
  terminalOutcome?: RenewalNeedTerminalOutcome;
}

/**
 * Replays only structured diagnostics to form unique role-need episodes.
 * Gameplay state is never read or changed; transfer facts merely close the
 * matching open episode, and a later observation receives a new ordinal.
 */
export function renewalNeedEpisodesForSeason(input: {
  readonly worldSeed: string;
  readonly seasonNumber: number;
  readonly divisionByClubId: Readonly<Record<string, 1 | 2 | 3>>;
  readonly playerRoleById: Readonly<Record<string, RenewalNeedRole>>;
  readonly diagnostics: readonly AiMarketDiagnosticFact[];
  readonly lifecycleFacts: readonly AiMarketLifecycleFact[];
}): readonly RenewalNeedEpisodeFact[] {
  const timeline = [
    ...input.diagnostics
      .filter(({ target }) => target.kind === "role")
      .map((fact) => ({ kind: "diagnostic" as const, date: Number(fact.occurredOn), fact })),
    ...input.lifecycleFacts.map((fact) => ({
      kind: "lifecycle" as const,
      date: Number(fact.occurredOn),
      fact,
    })),
  ].sort((left, right) =>
    left.date - right.date
    || (left.kind === right.kind ? 0 : left.kind === "diagnostic" ? -1 : 1));
  const open = new Map<string, MutableRenewalNeedEpisode>();
  const ordinals = new Map<string, number>();
  const completed: MutableRenewalNeedEpisode[] = [];

  const episodeFor = (
    clubId: string,
    role: RenewalNeedRole,
    date: number,
  ): MutableRenewalNeedEpisode | undefined => {
    const key = `${clubId}|${role}`;
    const existing = open.get(key);
    if (existing !== undefined) return existing;
    const divisionLevel = input.divisionByClubId[clubId];
    if (divisionLevel === undefined) return undefined;
    const ordinal = (ordinals.get(key) ?? 0) + 1;
    ordinals.set(key, ordinal);
    const created: MutableRenewalNeedEpisode = {
      worldSeed: input.worldSeed,
      divisionLevel,
      clubId,
      seasonNumber: input.seasonNumber,
      role,
      needEpisodeOrdinal: ordinal,
      firstAppearanceDate: date,
      maximumStage: "observed",
    };
    open.set(key, created);
    return created;
  };

  for (const event of timeline) {
    if (event.kind === "diagnostic") {
      const target = event.fact.target;
      if (target.kind !== "role") continue;
      const episode = episodeFor(String(event.fact.clubId), target.role, event.date);
      if (episode === undefined) continue;
      episode.maximumStage = laterRenewalNeedStage(
        episode.maximumStage,
        diagnosticStage(event.fact),
      );
      if (event.fact.reason !== undefined) episode.lastReason = event.fact.reason;
      continue;
    }
    const role = input.playerRoleById[String(event.fact.playerId)];
    if (role === undefined) continue;
    const clubId = String(event.fact.buyingClubId);
    const key = `${clubId}|${role}`;
    const episode = open.get(key);
    if (episode === undefined) continue;
    if (
      event.fact.event === "club_offer_submitted"
      || event.fact.event === "preliminary_offer_submitted"
    ) {
      episode.maximumStage = laterRenewalNeedStage(episode.maximumStage, "talk_started");
    } else if (
      event.fact.event === "transfer_completed"
      || event.fact.event === "preliminary_activated"
    ) {
      episode.maximumStage = "fulfilled";
      episode.terminalOutcome = "fulfilled";
      completed.push(episode);
      open.delete(key);
    } else if (
      event.fact.event === "transfer_failed"
      || event.fact.event === "preliminary_activation_cancelled"
    ) {
      episode.terminalOutcome = "completion_failed";
      completed.push(episode);
      open.delete(key);
    }
  }

  for (const episode of open.values()) {
    episode.terminalOutcome = episode.lastReason
      ?? (episode.maximumStage === "target_found" || episode.maximumStage === "talk_started"
        ? "negotiation_still_open"
        : "recruitment_impossible");
    completed.push(episode);
  }
  return completed
    .sort((left, right) =>
      left.divisionLevel - right.divisionLevel
      || left.clubId.localeCompare(right.clubId)
      || left.role.localeCompare(right.role)
      || left.needEpisodeOrdinal - right.needEpisodeOrdinal)
    .map(({ lastReason: _lastReason, terminalOutcome, ...episode }) => ({
      ...episode,
      terminalOutcome: terminalOutcome ?? "recruitment_impossible",
    }));
}

/** Aggregates the episode table and proves both stage and terminal totals reconcile. */
export function evaluateRenewalNeedFunnel(
  episodes: readonly RenewalNeedEpisodeFact[],
): RenewalNeedFunnelEvaluation {
  const maximumStageCounts = Object.fromEntries(
    RENEWAL_NEED_STAGES.map((stage) => [stage, 0]),
  ) as Record<RenewalNeedStage, number>;
  const terminalOutcomeCounts = emptyRenewalTerminalCounts();
  for (const episode of episodes) {
    maximumStageCounts[episode.maximumStage] += 1;
    terminalOutcomeCounts[episode.terminalOutcome] += 1;
  }
  const dominantTerminalOutcomeByDivision = Object.fromEntries(
    ([1, 2, 3] as const).map((divisionLevel) => {
      const rows = episodes.filter((episode) => episode.divisionLevel === divisionLevel);
      const counts = new Map<RenewalNeedTerminalOutcome, number>();
      for (const row of rows) counts.set(row.terminalOutcome, (counts.get(row.terminalOutcome) ?? 0) + 1);
      const dominant = [...counts].sort(([left, leftCount], [right, rightCount]) =>
        rightCount - leftCount || left.localeCompare(right))[0]?.[0] ?? "not_observed";
      return [divisionLevel, dominant];
    }),
  ) as Readonly<Record<1 | 2 | 3, RenewalNeedTerminalOutcome | "not_observed">>;
  const stageTotal = Object.values(maximumStageCounts).reduce((sum, count) => sum + count, 0);
  const terminalTotal = Object.values(terminalOutcomeCounts).reduce((sum, count) => sum + count, 0);
  return {
    episodeCount: episodes.length,
    maximumStageCounts,
    terminalOutcomeCounts,
    dominantTerminalOutcomeByDivision,
    reconciliationFailureCount:
      Number(stageTotal !== episodes.length) + Number(terminalTotal !== episodes.length),
  };
}

function diagnosticStage(fact: AiMarketDiagnosticFact): RenewalNeedStage {
  if (fact.event === "need_recruitable") return "recruitable";
  if (fact.event === "permanent_target_found" || fact.event === "preliminary_candidate_found") {
    return "target_found";
  }
  return "observed";
}

function laterRenewalNeedStage(
  left: RenewalNeedStage,
  right: RenewalNeedStage,
): RenewalNeedStage {
  return RENEWAL_NEED_STAGES.indexOf(left) >= RENEWAL_NEED_STAGES.indexOf(right) ? left : right;
}

function emptyRenewalTerminalCounts(): Record<RenewalNeedTerminalOutcome, number> {
  return {
    selected_club_protected: 0,
    club_already_handled: 0,
    club_cannot_recruit: 0,
    active_talk_limit_reached: 0,
    transfer_window_closed: 0,
    permanent_start_limit_reached: 0,
    permanent_target_unavailable: 0,
    seller_squad_floor: 0,
    department_target_unavailable: 0,
    role_target_unavailable: 0,
    target_has_live_market_talk: 0,
    seller_department_floor: 0,
    implausible_downward_move: 0,
    seller_not_for_sale: 0,
    transfer_terms_unaffordable: 0,
    transfer_budget_insufficient: 0,
    permanent_offer_rejected: 0,
    preliminary_start_limit_reached: 0,
    preliminary_target_unavailable: 0,
    preliminary_offer_rejected: 0,
    fulfilled: 0,
    negotiation_still_open: 0,
    completion_failed: 0,
    recruitment_impossible: 0,
  } satisfies Record<RenewalNeedTerminalOutcome, number>;
}

const RENEWAL_ABLATION_MATERIAL_FLOORS = {
  localReplacementCapacity: 0.03,
  divisionReplacementCapacity: 0.03,
  fourReplicatedFormationRetentionShare: 0.02,
  careerGeneratedLeaderShareSeasonTen: 0.02,
  championPoints: 0.5,
} as const satisfies Readonly<Record<RenewalAblationMetric, number>>;

/** Applies the frozen 2x2 contrast, coherence and interaction rules. */
export function evaluateRenewalAblation(
  arms: Readonly<Record<RenewalAblationArmKey, RenewalAblationArmFacts>>,
): RenewalAblationDecision {
  const metrics = RENEWAL_ABLATION_METRICS.map((metric): RenewalAblationMetricDecision => {
    const floor = RENEWAL_ABLATION_MATERIAL_FLOORS[metric];
    const marketWithoutBlueprint = arms.market.values[metric] - arms.control.values[metric];
    const marketWithBlueprint = arms.combined.values[metric] - arms.blueprint.values[metric];
    const blueprintWithoutMarket = arms.blueprint.values[metric] - arms.control.values[metric];
    const blueprintWithMarket = arms.combined.values[metric] - arms.market.values[metric];
    const interaction = arms.combined.values[metric] - arms.market.values[metric]
      - arms.blueprint.values[metric] + arms.control.values[metric];
    const marketCoherence: readonly [number, number] = [
      coherentWorldCount(arms.market, arms.control, metric, marketWithoutBlueprint, floor),
      coherentWorldCount(arms.combined, arms.blueprint, metric, marketWithBlueprint, floor),
    ];
    const blueprintCoherence: readonly [number, number] = [
      coherentWorldCount(arms.blueprint, arms.control, metric, blueprintWithoutMarket, floor),
      coherentWorldCount(arms.combined, arms.market, metric, blueprintWithMarket, floor),
    ];
    const marketOwns = conditionalAxisOwns(
      marketWithoutBlueprint,
      marketWithBlueprint,
      marketCoherence,
      floor,
    );
    const blueprintOwns = conditionalAxisOwns(
      blueprintWithoutMarket,
      blueprintWithMarket,
      blueprintCoherence,
      floor,
    );
    const materialInteraction = Math.abs(interaction) > floor;
    let owner: RenewalAblationOwner = materialInteraction || (marketOwns && blueprintOwns)
      ? "shared_interaction"
      : marketOwns
        ? "market"
        : blueprintOwns
          ? "blueprint"
          : "not_reproduced";
    if (
      metric === "championPoints"
      && owner === "not_reproduced"
      && !insideChampionBand(arms.control.values[metric])
      && !insideChampionBand(arms.market.values[metric])
      && !insideChampionBand(arms.blueprint.values[metric])
      && !insideChampionBand(arms.combined.values[metric])
      && [marketWithoutBlueprint, marketWithBlueprint, blueprintWithoutMarket, blueprintWithMarket]
        .every((delta) => Math.abs(delta) < floor)
    ) owner = "population_strength";
    return {
      metric,
      owner,
      marketWithoutBlueprint,
      marketWithBlueprint,
      blueprintWithoutMarket,
      blueprintWithMarket,
      interaction,
      marketCoherence,
      blueprintCoherence,
    };
  });
  return {
    decision: metrics.every(({ owner }) => owner !== "not_reproduced")
      ? "OWNERS_IDENTIFIED"
      : "REFINE",
    metrics,
    firstPopulationDivergenceSeasonByArm: {
      market: firstPopulationDivergenceByWorld(arms.control, arms.market),
      blueprint: firstPopulationDivergenceByWorld(arms.control, arms.blueprint),
      combined: firstPopulationDivergenceByWorld(arms.control, arms.combined),
    },
  };
}

function firstPopulationDivergenceByWorld(
  control: RenewalAblationArmFacts,
  changed: RenewalAblationArmFacts,
): Readonly<Record<string, number | "not_observed">> {
  const changedBySeed = new Map(
    changed.populationSignatures.map((world) => [world.worldSeed, world]),
  );
  return Object.fromEntries(control.populationSignatures.map((controlWorld) => {
    const changedWorld = changedBySeed.get(controlWorld.worldSeed);
    if (changedWorld === undefined) return [controlWorld.worldSeed, "not_observed"];
    const changedBySeason = new Map(
      changedWorld.seasons.map((season) => [season.seasonNumber, season]),
    );
    const first = controlWorld.seasons.find((controlSeason) => {
      const changedSeason = changedBySeason.get(controlSeason.seasonNumber);
      return changedSeason === undefined
        || changedSeason.playerCount !== controlSeason.playerCount
        || changedSeason.sha256 !== controlSeason.sha256;
    });
    return [controlWorld.worldSeed, first?.seasonNumber ?? "not_observed"];
  }));
}

function conditionalAxisOwns(
  withoutOther: number,
  withOther: number,
  coherence: readonly [number, number],
  floor: number,
): boolean {
  return Math.abs(withoutOther) >= floor
    && Math.abs(withOther) >= floor
    && Math.sign(withoutOther) === Math.sign(withOther)
    && coherence[0] >= 5
    && coherence[1] >= 5;
}

function coherentWorldCount(
  changed: RenewalAblationArmFacts,
  baseline: RenewalAblationArmFacts,
  metric: RenewalAblationMetric,
  aggregateDelta: number,
  floor: number,
): number {
  const baselineBySeed = new Map(baseline.worlds.map((world) => [world.worldSeed, world]));
  return changed.worlds.filter((world) => {
    const paired = baselineBySeed.get(world.worldSeed);
    if (paired === undefined) return false;
    const delta = world.values[metric] - paired.values[metric];
    return Math.abs(delta) >= floor && Math.sign(delta) === Math.sign(aggregateDelta);
  }).length;
}

function insideChampionBand(value: number): boolean {
  const band = HISTORICAL_DIVISION_TABLE_TARGETS[1].championPoints;
  return value >= band.min && value <= band.max;
}

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
