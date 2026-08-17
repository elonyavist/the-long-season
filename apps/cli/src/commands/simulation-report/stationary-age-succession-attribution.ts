import { selectPlayerValuationConfig } from "@game/content";
import {
  broadPositionGroup,
  completedPlayerAgeAtDevelopmentMonth,
  derivePlayerPotentialProjection,
  monthlyDevelopmentPolicy,
  type BroadPositionGroup,
  type CareerSeasonAdvancementFacts,
  type PlayerExitReason,
  type PlayerMonthlyDevelopmentObservation,
  type PlayerPotentialProjection,
  type YouthLifecycleOutcome,
} from "@game/engine";
import type { PlayerGenerationExceptionalStockSummary } from "@game/simulation-tools";
import type { CliCareerState } from "../career/types.ts";
import type { SuccessorCeilingIntakeSeasonFact } from "./career-world-facts.ts";

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

export interface SuccessorCeilingArmWorldInput extends StationaryAgeSuccessionWorldInput {
  readonly successorCeilingSeasons: readonly SuccessorCeilingIntakeSeasonFact[];
}

export interface SuccessorCeilingPairedCheckpointDecision {
  readonly decision: "GO" | "REFINE" | "STOP_RETHINK" | "STOP_INSTRUMENT";
  readonly failedGateKeys: readonly string[];
  readonly control: ProgressiveCurrent16CheckpointDecision;
  readonly candidate: ProgressiveCurrent16CheckpointDecision;
  readonly generatedAtLeastOpeningWorldCount: number;
  readonly candidateImprovementWorldCount: number;
  readonly pooledCareerGeneratedLeaderShare: number | "not_observed";
  readonly candidateSeasonTenCurrent16ByWorld: readonly {
    readonly worldSeed: string;
    readonly openingStock: number;
    readonly openingSenior: number;
    readonly careerGenerated: number;
    readonly total: number;
  }[];
  readonly age33PlusLeaderCount: number;
  readonly successorSeasonCount: number;
  readonly successorAssignmentCount: number;
  readonly successorClubCapRefusalCount: number;
  readonly newIntegratedFailureKeys: readonly string[];
}

const SUCCESSOR_PATHWAY_OWNERS = [
  "senior_registration",
  "appearance_allocation",
  "development_minutes",
  "development_realization",
  "first_division_entry",
  "first_division_retention",
  "leader_selection",
] as const;
export type SuccessorPathwayOwner = typeof SUCCESSOR_PATHWAY_OWNERS[number];

const YOUTH_EXIT_OUTCOME_ORDER = {
  promotion_candidate: 0,
  external_move_candidate: 1,
  released: 2,
} as const satisfies Readonly<Record<YouthLifecycleOutcome, number>>;

const PLAYER_EXIT_REASON_ORDER = {
  retirement: 0,
  released: 1,
  career_step_down: 2,
} as const satisfies Readonly<Record<PlayerExitReason, number>>;

/** One accepted exact-five assignment at the canonical annual intake boundary. */
export interface SuccessorPathwayAssignmentFact {
  readonly seasonNumber: number;
  readonly playerId: string;
  readonly clubId: string;
  readonly role: string;
  readonly developmentEnvironment: string;
  readonly projection: PlayerPotentialProjection;
}

/** One season-boundary observation for a previously accepted assignment. */
export interface SuccessorPathwayBoundaryFact {
  readonly seasonNumber: number;
  readonly playerId: string;
  readonly academyActive: boolean;
  readonly academyExitOutcomes: readonly YouthLifecycleOutcome[];
  readonly seniorAssociations: readonly {
    readonly clubId: string;
    readonly division: string;
  }[];
  readonly playerExitReasons: readonly PlayerExitReason[];
  readonly projection: PlayerPotentialProjection | "not_observed";
}

/** Canonical selected-cohort facts from one candidate world. */
export interface SuccessorPathwayWorldFacts {
  readonly worldSeed: string;
  readonly assignments: readonly SuccessorPathwayAssignmentFact[];
  readonly boundaries: readonly SuccessorPathwayBoundaryFact[];
  readonly reconciliationFailureCount: number;
}

/**
 * Follows only IDs selected by the canonical allocator.
 *
 * The observer reads durable academy state and advancement facts at the season
 * boundary. It never guesses a promotion or release from season-ten ownership.
 */
export class SuccessorPathwayObserver {
  readonly #worldSeed: string;
  readonly #assignments = new Map<string, SuccessorPathwayAssignmentFact>();
  readonly #boundaries: SuccessorPathwayBoundaryFact[] = [];
  #reconciliationFailureCount = 0;

  public constructor(worldSeed: string) {
    this.#worldSeed = worldSeed;
  }

  /** Registers exact-five accepted assignments once, at their intake boundary. */
  public observeIntake(fact: SuccessorCeilingIntakeSeasonFact): void {
    for (const selected of fact.selectedPlayers) {
      if (selected.minimumRating !== 5) continue;
      if (this.#assignments.has(selected.playerId)) {
        this.#reconciliationFailureCount += 1;
        continue;
      }
      this.#assignments.set(selected.playerId, {
        seasonNumber: fact.seasonNumber,
        playerId: selected.playerId,
        clubId: selected.clubId,
        role: selected.role,
        developmentEnvironment: selected.developmentEnvironment,
        projection: selected.projection,
      });
    }
  }

  /** Captures lifecycle truth for every selected ID after one canonical rollover. */
  public observeAdvancement(input: {
    readonly seasonNumber: number;
    readonly careerState: CliCareerState;
    readonly facts: CareerSeasonAdvancementFacts;
  }): void {
    const valuation = selectPlayerValuationConfig(
      input.careerState.gameState.meta.calibrationVersions,
    );
    for (const assignment of this.#assignments.values()) {
      if (assignment.seasonNumber > input.seasonNumber) continue;
      const playerId = input.careerState.gameState.playerIds.find(
        (candidateId) => String(candidateId) === assignment.playerId,
      );
      const player = playerId === undefined
        ? undefined
        : input.careerState.gameState.players[playerId];
      const lifecycleId = input.careerState.youthAcademyState?.playerLifecycleIds.find(
        (candidateId) => String(candidateId) === assignment.playerId,
      );
      const lifecycle = lifecycleId === undefined
        ? undefined
        : input.careerState.youthAcademyState?.playerLifecycle[lifecycleId];
      const seniorAssociations = input.careerState.gameState.clubIds.flatMap((clubId) => {
        const club = input.careerState.gameState.clubs[clubId];
        return club?.playerIds.some((candidateId) => String(candidateId) === assignment.playerId)
          ? [{ clubId: String(clubId), division: club.category }]
          : [];
      });
      const academyExitOutcomes = orderedMatchingKeys(
        YOUTH_EXIT_OUTCOME_ORDER,
        input.facts.youthLifecycle.playerIdsByOutcome,
        assignment.playerId,
      );
      const playerExitReasons = orderedMatchingKeys(
        PLAYER_EXIT_REASON_ORDER,
        input.facts.playerExits.playerIdsByReason,
        assignment.playerId,
      );
      this.#reconciliationFailureCount += Number(seniorAssociations.length > 1)
        + Number(academyExitOutcomes.length > 1)
        + Number(playerExitReasons.length > 1);
      this.#boundaries.push({
        seasonNumber: input.seasonNumber,
        playerId: assignment.playerId,
        academyActive: lifecycle?.status === "academy",
        academyExitOutcomes,
        seniorAssociations,
        playerExitReasons,
        projection: player === undefined
          ? "not_observed"
          : derivePlayerPotentialProjection({
              player,
              currentDate: input.careerState.gameState.calendar.currentDate,
              policy: valuation.potentialProjectionPolicy,
              ratingScale: valuation.ratingScale,
            }),
      });
    }
  }

  /** Returns stable facts after all seasons have been observed. */
  public facts(): SuccessorPathwayWorldFacts {
    return {
      worldSeed: this.#worldSeed,
      assignments: [...this.#assignments.values()].toSorted((left, right) =>
        left.seasonNumber - right.seasonNumber
          || left.playerId.localeCompare(right.playerId)
      ),
      boundaries: this.#boundaries.toSorted((left, right) =>
        left.seasonNumber - right.seasonNumber
          || left.playerId.localeCompare(right.playerId)
      ),
      reconciliationFailureCount: this.#reconciliationFailureCount,
    };
  }
}

export type SuccessorPathwayTerminal =
  | SuccessorPathwayOwner
  | "open_window"
  | "season_ten_leader";

export interface SuccessorPathwayPlayerEvaluation {
  readonly playerId: string;
  readonly assignmentSeason: number;
  readonly assignmentClubId: string;
  readonly role: string;
  readonly assignmentAge: number;
  readonly terminal: SuccessorPathwayTerminal;
  readonly academyExitOutcome: YouthLifecycleOutcome | "not_observed";
  readonly firstSeniorSeason: number | "not_observed";
  readonly cumulativeSeniorAppearances: number;
  readonly cumulativeSeniorMinutes: number;
  readonly reachedCurrent16: boolean;
  readonly reachedFirstDivisionCurrent16: boolean;
  readonly retainedFirstDivisionCurrent16AtSeasonTen: boolean;
  readonly seasonTenLeader: boolean;
}

export interface SuccessorPathwayWorldEvaluation {
  readonly worldSeed: string;
  readonly assignmentCount: number;
  readonly closedWindowCount: number;
  readonly openWindowCount: number;
  readonly terminalCounts: Readonly<Record<SuccessorPathwayTerminal, number>>;
  readonly dominantLossOwner: SuccessorPathwayOwner | "not_observed";
  readonly dominantLossShare: number | "not_observed";
  readonly players: readonly SuccessorPathwayPlayerEvaluation[];
  readonly reconciliationFailureCount: number;
}

export type SixStarFirstDivergenceCause =
  | "active_stock"
  | "target_or_vacancy"
  | "candidate_population"
  | "allocation_constraints";

export interface SuccessorPathwayCheckpointDecision {
  readonly decision: "OWNER_IDENTIFIED" | "MIXED" | "STOP_INSTRUMENT";
  readonly owner: SuccessorPathwayOwner | "mixed" | "instrument";
  readonly ownerCoherenceWorldCount: number;
  readonly pooledClosedWindowCount: number;
  readonly pooledOwnerCounts: Readonly<Record<SuccessorPathwayOwner, number>>;
  readonly pooledOwnerShare: number | "not_observed";
  readonly pooledOwnerMargin: number | "not_observed";
  readonly sixStarFirstDivergences: readonly {
    readonly worldSeed: string;
    readonly seasonNumber: number;
    readonly cause: SixStarFirstDivergenceCause;
  }[];
  readonly reconciliationFailureCount: number;
  readonly worlds: readonly SuccessorPathwayWorldEvaluation[];
}

/** One-season instrument gate; it deliberately makes no lifecycle claim. */
export function evaluateSuccessorPathwayCanary(input: {
  readonly control: readonly SuccessorCeilingArmWorldInput[];
  readonly candidate: readonly (SuccessorCeilingArmWorldInput & {
    readonly pathway: SuccessorPathwayWorldFacts;
  })[];
}): Readonly<{
  decision: "CANARY_GO" | "STOP_INSTRUMENT";
  worldCount: number;
  acceptedAssignmentCount: number;
  reconciliationFailureCount: number;
}> {
  const controlBySeed = new Map(input.control.map((world) => [world.owner.worldSeed, world]));
  let reconciliationFailureCount = Number(input.control.length !== 7)
    + Number(input.candidate.length !== 7)
    + Number(controlBySeed.size !== 7);
  let acceptedAssignmentCount = 0;
  for (const candidate of input.candidate) {
    const control = controlBySeed.get(candidate.owner.worldSeed);
    const candidateSeason = candidate.successorCeilingSeasons[0];
    const controlSeason = control?.successorCeilingSeasons[0];
    const assignmentCount = candidate.pathway.assignments.length;
    acceptedAssignmentCount += assignmentCount;
    reconciliationFailureCount += candidate.pathway.reconciliationFailureCount
      + Number(candidate.successorCeilingSeasons.length !== 1)
      + Number(control?.successorCeilingSeasons.length !== 1)
      + Number(candidateSeason === undefined || controlSeason === undefined)
      + Number(candidate.pathway.worldSeed !== candidate.owner.worldSeed)
      + Number(candidate.pathway.boundaries.length !== assignmentCount)
      + Number(candidateSeason?.fiveAssignmentCount !== assignmentCount)
      + Number(controlSeason?.fiveAssignmentCount !== 0);
  }
  reconciliationFailureCount += Number(acceptedAssignmentCount === 0);
  return {
    decision: reconciliationFailureCount === 0 ? "CANARY_GO" : "STOP_INSTRUMENT",
    worldCount: input.candidate.length,
    acceptedAssignmentCount,
    reconciliationFailureCount,
  };
}

/**
 * Season boundary the frozen L6.43A checkpoint was measured at.
 *
 * Not a configuration knob and not a horizon. The evaluator below is a
 * ten-season instrument in its bones - it refuses any other season count,
 * expects `11 - assignmentSeason` boundaries per player, and reads season ten
 * by name - and the frozen decision population is defined at exactly that
 * boundary. A longer run does not extend the baseline; it observes past it.
 */
const SUCCESSOR_PATHWAY_BASELINE_SEASON_COUNT = 10;

/** Paired successor arms cut back to the frozen baseline boundary. */
export interface SuccessorPathwayBaselineArms {
  readonly control: readonly SuccessorCeilingArmWorldInput[];
  readonly candidate: readonly (SuccessorCeilingArmWorldInput & {
    readonly pathway: SuccessorPathwayWorldFacts;
  })[];
  readonly seasonCount: number;
}

/**
 * Cuts a longer run's facts back to the baseline the legacy evaluator measures.
 *
 * `evaluateSuccessorPathwayCheckpoint` stays exactly as L6.43A left it. Teaching
 * it about fifteen seasons would change the very numbers a continuity replay
 * exists to reproduce, so a longer run instead hands it only what a ten-season
 * run would have produced. The population it then evaluates is the frozen `716`
 * rather than five further intake classes wearing the same name.
 *
 * At ten seasons every filter here is a no-op, which is what makes the `7 x 10`
 * replay's byte-identity a proof rather than a coincidence. Below ten the
 * baseline does not exist yet, and the season count passes through unchanged so
 * the legacy evaluator reports that itself instead of being told otherwise.
 */
export function successorPathwayBaselineArms(
  input: SuccessorPathwayBaselineArms,
): SuccessorPathwayBaselineArms {
  return {
    control: input.control.map(baselineArmWorld),
    candidate: input.candidate.map((world) => ({
      ...baselineArmWorld(world),
      pathway: {
        ...world.pathway,
        assignments: world.pathway.assignments.filter(withinBaselineSeasons),
        boundaries: world.pathway.boundaries.filter(withinBaselineSeasons),
      },
    })),
    seasonCount: Math.min(
      input.seasonCount,
      SUCCESSOR_PATHWAY_BASELINE_SEASON_COUNT,
    ),
  };
}

function baselineArmWorld(
  world: SuccessorCeilingArmWorldInput,
): SuccessorCeilingArmWorldInput {
  return {
    ...world,
    successorCeilingSeasons:
      world.successorCeilingSeasons.filter(withinBaselineSeasons),
    owner: {
      ...world.owner,
      playerSeasons: world.owner.playerSeasons.filter(withinBaselineSeasons),
    },
  };
}

function withinBaselineSeasons(fact: { readonly seasonNumber: number }): boolean {
  return fact.seasonNumber <= SUCCESSOR_PATHWAY_BASELINE_SEASON_COUNT;
}

/**
 * Attributes the rejected successor cohort without changing its football.
 *
 * Only closed academy windows enter owner ranking. A 17-year-old still in the
 * academy at season ten is a future observation, not a failed replacement.
 *
 * Deliberately ten-season only, and left that way. A caller on a longer horizon
 * passes its facts through `successorPathwayBaselineArms` first.
 */
export function evaluateSuccessorPathwayCheckpoint(input: {
  readonly control: readonly SuccessorCeilingArmWorldInput[];
  readonly candidate: readonly (SuccessorCeilingArmWorldInput & {
    readonly pathway: SuccessorPathwayWorldFacts;
  })[];
  readonly seasonCount: number;
}): SuccessorPathwayCheckpointDecision {
  const controlBySeed = new Map(input.control.map((world) => [world.owner.worldSeed, world]));
  let reconciliationFailureCount = Number(input.seasonCount !== 10)
    + Number(input.control.length !== 7)
    + Number(input.candidate.length !== 7)
    + Number(controlBySeed.size !== 7);
  const worlds: SuccessorPathwayWorldEvaluation[] = [];
  const sixStarFirstDivergences: SuccessorPathwayCheckpointDecision[
    "sixStarFirstDivergences"
  ][number][] = [];

  for (const candidate of input.candidate) {
    const worldSeed = candidate.owner.worldSeed;
    const control = controlBySeed.get(worldSeed);
    if (control === undefined || candidate.pathway.worldSeed !== worldSeed) {
      reconciliationFailureCount += 1;
      continue;
    }
    const evaluation = evaluateSuccessorPathwayWorld(candidate);
    worlds.push(evaluation);
    reconciliationFailureCount += evaluation.reconciliationFailureCount;
    const divergence = firstSixStarDivergence(
      worldSeed,
      control.successorCeilingSeasons,
      candidate.successorCeilingSeasons,
    );
    if (divergence !== undefined) sixStarFirstDivergences.push(divergence);
  }

  const pooledOwnerCounts = emptyCounts(SUCCESSOR_PATHWAY_OWNERS);
  let pooledClosedWindowCount = 0;
  for (const world of worlds) {
    pooledClosedWindowCount += world.closedWindowCount;
    for (const owner of SUCCESSOR_PATHWAY_OWNERS) {
      pooledOwnerCounts[owner] += world.terminalCounts[owner];
    }
  }
  const rankedOwners = [...SUCCESSOR_PATHWAY_OWNERS].toSorted((left, right) =>
    pooledOwnerCounts[right] - pooledOwnerCounts[left]
      || left.localeCompare(right)
  );
  const owner = rankedOwners[0]!;
  const second = rankedOwners[1]!;
  const ownerCoherenceWorldCount = worlds.filter(
    ({ dominantLossOwner }) => dominantLossOwner === owner,
  ).length;
  const pooledOwnerShare = observedRatio(
    pooledOwnerCounts[owner],
    pooledClosedWindowCount,
  );
  const pooledOwnerMargin = pooledClosedWindowCount === 0
    ? "not_observed"
    : (pooledOwnerCounts[owner] - pooledOwnerCounts[second])
      / pooledClosedWindowCount;
  reconciliationFailureCount += Number(worlds.length !== 7)
    + Number(pooledClosedWindowCount === 0)
    + Number(sixStarFirstDivergences.length === 0);
  const ownerHeld = pooledOwnerShare !== "not_observed"
    && pooledOwnerMargin !== "not_observed"
    && ownerCoherenceWorldCount >= 5
    && pooledOwnerShare >= 0.20
    && pooledOwnerMargin >= 0.05;

  return {
    decision: reconciliationFailureCount > 0
      ? "STOP_INSTRUMENT"
      : ownerHeld
        ? "OWNER_IDENTIFIED"
        : "MIXED",
    owner: reconciliationFailureCount > 0
      ? "instrument"
      : ownerHeld
        ? owner
        : "mixed",
    ownerCoherenceWorldCount,
    pooledClosedWindowCount,
    pooledOwnerCounts,
    pooledOwnerShare,
    pooledOwnerMargin,
    sixStarFirstDivergences: sixStarFirstDivergences.toSorted((left, right) =>
      left.worldSeed.localeCompare(right.worldSeed)
        || left.seasonNumber - right.seasonNumber
    ),
    reconciliationFailureCount,
    worlds: worlds.toSorted((left, right) => left.worldSeed.localeCompare(right.worldSeed)),
  };
}

/**
 * The six frozen loss states, in the contract's own order.
 *
 * Evaluability is resolved before mechanism: a player who could not be judged,
 * or whose ceiling was never there, is not evidence about conversion.
 */
const DEVELOPMENT_REALIZATION_LOSS_STATES = [
  "expected_ceiling_below_16_at_intake",
  "ceiling_lost_before_realization",
  "right_censored_at_horizon",
  "sustained_opportunity_insufficient",
  "realization_under_viable_projection",
  "instrument_failure",
] as const;
export type DevelopmentRealizationLossState =
  typeof DEVELOPMENT_REALIZATION_LOSS_STATES[number];

/**
 * Every way a frozen-cohort player can resolve, exactly once.
 *
 * `recovered_before_judgement` is an outcome, not a seventh loss state: a member
 * of a cohort selected for having failed by season ten who nevertheless reaches
 * current `16` before his judgement age. He satisfies none of the six - not
 * censored, ceiling held, opportunity sufficient, and state five requires that
 * `16` was never reached - and he is not a failure, so he is excluded from every
 * owner denominator on the same ground as a censored player.
 */
export type DevelopmentRealizationOutcome =
  | DevelopmentRealizationLossState
  | "recovered_before_judgement";

/** Whether a lost ceiling disappeared before or after sustained exposure. */
export type CeilingLossTiming =
  | "before_sustained_exposure"
  | "after_sustained_exposure";

/** Frozen fraction below which opportunity is materially insufficient. */
const SUSTAINED_EXPOSURE_SHARE = 0.5;
/** Role-weighted current ability that defines an elite senior player. */
const ELITE_CURRENT_ABILITY = 16;

/** One frozen-cohort player resolved against the observed monthly evidence. */
export interface DevelopmentRealizationPlayerEvaluation {
  readonly playerId: string;
  readonly outcome: DevelopmentRealizationOutcome;
  /** Present only on `ceiling_lost_before_realization`. */
  readonly lossTiming?: CeilingLossTiming;
  /**
   * Exposure actually taken, `sum(ageMultiplier * opportunityMultiplier)`.
   *
   * Stored beside its denominator rather than as a ratio: the share is
   * derivable from the two, and a stored ratio is a third number that can
   * disagree with them.
   */
  readonly observedExposure: number;
  /** Exposure that existed to be taken, over months development could occur. */
  readonly availableExposure: number;
  /** First month cumulative exposure reached the frozen sustained fraction. */
  readonly sustainedExposureMonthKey?: string;
  /** First month role potential fell below elite, if it ever did. */
  readonly ceilingLostMonthKey?: string;
  /** First closed month at or after the group's judgement age. */
  readonly judgementMonthKey?: string;
  /** Highest role-weighted current ability observed up to judgement. */
  readonly maxRoleCurrentAbility: number | "not_observed";
  /**
   * Assignment-time median projection, the fact that decides the first state.
   *
   * Recorded because it decided this player's outcome and was otherwise
   * invisible: a whole cohort resolving to the intake state looked like an
   * instrument defect until this number could be read.
   *
   * `not_observed` only when the assignment carried no projection at all, which
   * is itself an instrument failure. It is never defaulted to a number: a
   * fabricated zero would silently drag the reported distribution down.
   */
  readonly intakeExpectedCeiling: number | "not_observed";
  /**
   * Relevance-bucket split at the last month inside his growth window.
   *
   * Growth is applied per attribute in proportion to role relevance while
   * ability is measured as a weighted average over the same weights, so the
   * aggregate margin cannot show which bucket stopped moving. This is the only
   * fact that can distinguish a ceiling that was too low from a conversion that
   * could not finish, and it is dated rather than reconstructed.
   */
  readonly finalBucketMargins?: readonly {
    readonly bucket: string;
    readonly attributeCount: number;
    readonly currentTotal: number;
    readonly potentialTotal: number;
  }[];
  /** Named cause; present only on `instrument_failure`. */
  readonly instrumentFailureReason?: string;
}

/** Shape of one measured distribution, reported beside the state it explains. */
export interface DevelopmentRealizationDistribution {
  readonly minimum: number | "not_observed";
  readonly p10: number | "not_observed";
  readonly p50: number | "not_observed";
  readonly p90: number | "not_observed";
  readonly maximum: number | "not_observed";
}

/**
 * Facts that are true of players across states, reported without moving any.
 *
 * A player resolves to exactly one exclusive state. These say what else was
 * true of him. Keeping them here rather than folding them into the taxonomy is
 * deliberate: a horizon that has not closed, a ceiling that disappeared and the
 * opportunity a player received are three different facts, and letting any of
 * them re-open a resolved state would edit the owner rule after seeing output.
 */
export interface DevelopmentRealizationCrossCuttingFacts {
  /** Assignment-time median projections over the resolved population. */
  readonly intakeExpectedCeiling: DevelopmentRealizationDistribution;
  /** How many of those medians sit below elite. */
  readonly intakeExpectedCeilingBelowEliteCount: number;
  /**
   * Players whose judgement age the horizon never reached.
   *
   * Deliberately not `censoredCount`, which counts the exclusive state. A
   * player resolved at intake may also have an open horizon; both are true and
   * only one is his state.
   */
  readonly horizonEndsBeforeJudgementCount: number;
  /** Players whose role potential fell below elite before judgement. */
  readonly ceilingLostBeforeJudgementCount: number;
  /** Observed exposure over available exposure, across the same population. */
  readonly exposureShare: DevelopmentRealizationDistribution;
}

/**
 * What the allocator saw when it selected, read from the canonical projection.
 *
 * Derived at read time from the projections already carried by the pathway
 * facts; nothing here is a second persisted copy of them. It exists to separate
 * two allocation failures that the median alone cannot tell apart: a stored
 * ceiling and an upper tail that reach elite while the median never does, which
 * means the allocator is buying remote upside rather than credible prospects;
 * or an upper tail that does not reach elite either, which means no
 * elite-capable young player is being generated at all.
 */
export interface DevelopmentRealizationIntakeProfile {
  readonly playerCount: number;
  readonly currentAbility: DevelopmentRealizationDistribution;
  readonly p50Ability: DevelopmentRealizationDistribution;
  readonly upperAbility: DevelopmentRealizationDistribution;
  readonly storedCeilingAbility: DevelopmentRealizationDistribution;
  /** How many of each reach elite; the cross-tab the decision turns on. */
  readonly reachingEliteCount: {
    readonly p50Ability: number;
    readonly upperAbility: number;
    readonly storedCeilingAbility: number;
  };
}

/** Observation payload one world contributes to the L6.43B evaluator. */
export interface DevelopmentRealizationWorldObservation {
  readonly worldSeed: string;
  readonly cohort: readonly {
    readonly playerId: string;
    readonly birthDate: number;
    readonly naturalPosition: string;
    readonly firstEligibleDevelopmentMonthKey: string;
  }[];
  readonly rows: readonly PlayerMonthlyDevelopmentObservation[];
  readonly closedDevelopmentMonthKeys: readonly string[];
}

/** One world's resolved frozen cohort. */
export interface DevelopmentRealizationWorldEvaluation {
  readonly worldSeed: string;
  readonly decisionPopulationCount: number;
  readonly evaluableCount: number;
  readonly censoredCount: number;
  readonly recoveredCount: number;
  readonly outcomeCounts: Readonly<Record<DevelopmentRealizationOutcome, number>>;
  readonly lossTimingCounts: Readonly<Record<CeilingLossTiming, number>>;
  readonly crossCutting: DevelopmentRealizationCrossCuttingFacts;
  readonly players: readonly DevelopmentRealizationPlayerEvaluation[];
  readonly reconciliationFailureCount: number;
}

/** L6.43B mechanism decision over the frozen decision population. */
export interface DevelopmentRealizationCheckpointDecision {
  readonly decision:
    | "OWNER_IDENTIFIED"
    | "MIXED"
    | "UNDERPOWERED"
    | "STOP_INSTRUMENT";
  readonly owner: DevelopmentRealizationLossState | "mixed" | "underpowered" | "instrument";
  readonly ownerCoherenceWorldCount: number;
  readonly pooledEvaluableCount: number;
  readonly pooledCensoredCount: number;
  readonly pooledRecoveredCount: number;
  readonly pooledOutcomeCounts: Readonly<Record<DevelopmentRealizationOutcome, number>>;
  readonly pooledLossTimingCounts: Readonly<Record<CeilingLossTiming, number>>;
  readonly pooledOwnerShare: number | "not_observed";
  readonly pooledOwnerMargin: number | "not_observed";
  /**
   * Share of the evaluable frozen cohort that recovered.
   *
   * A baseline reading of zero is a valid measurement of the shipped product.
   * Strict positivity binds only on a Step 16M-C candidate seeking adoption.
   */
  readonly frozenFailureCohortRecoveryShare: number | "not_observed";
  /** Pooled facts that are true across states, never reassigning one. */
  readonly pooledCrossCutting: DevelopmentRealizationCrossCuttingFacts;
  /** What the allocator saw at intake, pooled over the frozen population. */
  readonly pooledIntakeProfile: DevelopmentRealizationIntakeProfile;
  readonly worlds: readonly DevelopmentRealizationWorldEvaluation[];
  readonly reconciliationFailureCount: number;
}

/**
 * The control growth curve, frozen as this checkpoint's measuring instrument.
 *
 * A snapshot, not a second copy of a live policy, and the distinction is the
 * whole point. Step 16M-C's admitted candidate reshapes
 * `monthlyGrowthAgeMultiplier`. If this evaluator read that function at runtime
 * the candidate would move its own judgement age, its own growth window and its
 * own exposure denominator all at once, and the two arms would be scored on
 * different instruments while appearing to share one. The contract forbids
 * exactly that: a player is judged at his control window-close age, never at a
 * candidate's.
 *
 * A test proves this table equals the shipped curve today, so it cannot be a
 * transcription error. When a candidate diverges that test is *expected* to
 * fail - that failure is the signal that control and candidate have parted, and
 * it is answered by asserting the divergence. This table is never edited to
 * follow a candidate.
 *
 * Ages absent from a group's row pay nothing. That is the curve's own shape
 * rather than a default standing in for a missing case: outside these bands the
 * shipped policy returns zero.
 */
const L6_43B_CONTROL_GROWTH_AGE_MULTIPLIER = {
  goalkeeper: { 16: 0.3, 17: 0.3, 18: 0.6, 19: 0.6, 20: 0.6, 21: 0.6, 22: 0.75, 23: 0.75, 24: 0.75, 25: 0.45, 26: 0.45, 27: 0.45 },
  defender: { 16: 0.25, 17: 0.85, 18: 0.85, 19: 0.85, 20: 0.85, 21: 0.65, 22: 0.65, 23: 0.65, 24: 0.35, 25: 0.35 },
  midfielder: { 16: 0.25, 17: 0.85, 18: 0.85, 19: 0.85, 20: 0.85, 21: 0.65, 22: 0.65, 23: 0.65, 24: 0.35, 25: 0.35, 26: 0.2 },
  attacker: { 16: 0.25, 17: 0.85, 18: 0.85, 19: 0.85, 20: 0.85, 21: 0.65, 22: 0.65, 23: 0.65, 24: 0.35, 25: 0.35 },
} as const satisfies Readonly<Record<BroadPositionGroup, Readonly<Record<number, number>>>>;

/**
 * The frozen control weight for one group at one age.
 *
 * Exported so the test that binds this table to the shipped policy reads the
 * same accessor the evaluator does, rather than its own copy of the lookup.
 */
export function l6_43BControlGrowthAgeMultiplier(
  group: BroadPositionGroup,
  age: number,
): number {
  const band: Readonly<Record<number, number>> =
    L6_43B_CONTROL_GROWTH_AGE_MULTIPLIER[group];
  return band[age] ?? 0;
}

/**
 * Age at which the frozen control curve stops paying this group anything.
 *
 * Read from the frozen table rather than restated as `26`/`27`/`28`, and never
 * from the runtime curve. The scan takes the last age still paid and adds one,
 * which survives a band with a gap in it; a first-zero scan would not.
 */
function judgementAge(group: BroadPositionGroup): number {
  return Object.keys(L6_43B_CONTROL_GROWTH_AGE_MULTIPLIER[group])
    .map(Number)
    .reduce((latest, age) => Math.max(latest, age), 0) + 1;
}

/**
 * Resolves one frozen-cohort player against his own observed months.
 *
 * Every multiplier comes from the canonical policy, recomposed from the facts
 * the observation retained; nothing here restates an age band, a minute band or
 * a growth formula. The denominator counts only months the lifecycle actually
 * closed, because a month in which no development checkpoint ran was available
 * to nobody and charging it would measure the fixture calendar.
 */
function evaluateDevelopmentRealizationPlayer(input: {
  readonly playerId: string;
  readonly birthDate: number;
  readonly naturalPosition: string;
  readonly firstEligibleDevelopmentMonthKey: string;
  readonly rows: readonly PlayerMonthlyDevelopmentObservation[];
  readonly closedDevelopmentMonthKeys: readonly string[];
  readonly intakeExpectedCeiling: number;
}): DevelopmentRealizationPlayerEvaluation {
  const group = broadPositionGroup(
    input.naturalPosition as Parameters<typeof broadPositionGroup>[0],
  );
  const closeAge = judgementAge(group);
  const ageAt = (monthKey: string): number =>
    completedPlayerAgeAtDevelopmentMonth(
      input.birthDate as Parameters<typeof completedPlayerAgeAtDevelopmentMonth>[0],
      monthKey as Parameters<typeof completedPlayerAgeAtDevelopmentMonth>[1],
    );

  const monthsFromBoundary = input.closedDevelopmentMonthKeys
    .filter((monthKey) => monthKey >= input.firstEligibleDevelopmentMonthKey)
    .toSorted();
  const windowMonths = monthsFromBoundary.filter(
    (monthKey) => l6_43BControlGrowthAgeMultiplier(group, ageAt(monthKey)) > 0,
  );
  const judgementMonthKey = monthsFromBoundary.find(
    (monthKey) => ageAt(monthKey) >= closeAge,
  );
  const availableExposure = roundExposure(windowMonths.reduce(
    (total, monthKey) => total + l6_43BControlGrowthAgeMultiplier(group, ageAt(monthKey)),
    0,
  ));

  const windowMonthKeys = new Set(windowMonths);
  const rowsByMonthKey = new Map(input.rows.map((row) => [String(row.change.monthKey), row]));
  const failure = (instrumentFailureReason: string): DevelopmentRealizationPlayerEvaluation => ({
    playerId: input.playerId,
    outcome: "instrument_failure",
    observedExposure: 0,
    availableExposure,
    intakeExpectedCeiling: input.intakeExpectedCeiling,
    maxRoleCurrentAbility: "not_observed",
    instrumentFailureReason,
  });
  if (rowsByMonthKey.size !== input.rows.length) {
    return failure("duplicate_observed_month");
  }
  for (const monthKey of rowsByMonthKey.keys()) {
    if (monthKey < input.firstEligibleDevelopmentMonthKey) {
      return failure("row_before_first_eligible_month");
    }
  }
  if (availableExposure <= 0) {
    return failure("empty_exposure_denominator");
  }

  // Walk the window in order so the sustained-exposure boundary and the first
  // lost ceiling are dated rather than inferred from totals.
  let observedExposure = 0;
  let sustainedExposureMonthKey: string | undefined;
  let ceilingLostMonthKey: string | undefined;
  let maxRoleCurrentAbility: number | undefined;
  let recoveredMonthKey: string | undefined;
  let finalBucketMargins: PlayerMonthlyDevelopmentObservation["bucketMargins"] | undefined;
  for (const monthKey of windowMonths) {
    const row = rowsByMonthKey.get(monthKey);
    if (row !== undefined) {
      finalBucketMargins = row.bucketMargins;
      const policy = monthlyDevelopmentPolicy({
        positionGroup: row.change.positionGroup,
        age: row.change.age,
        participation: {
          minutes: row.change.minutes,
          ratingTotal: row.ratingTotal,
          ratingSamples: row.ratingSamples,
        },
        positiveGrowthEnvironmentBasisPoints:
          row.change.positiveGrowthEnvironmentBasisPoints,
      });
      // Opportunity comes from the canonical policy, recomposed from the facts
      // the observation retained, so no minute band is restated here. The age
      // weight deliberately does not: it comes from the frozen control curve,
      // because a candidate that pays more at an age must not thereby award
      // itself more exposure against a control denominator. Exposure measures
      // opportunity received, priced on one instrument for both arms.
      observedExposure += l6_43BControlGrowthAgeMultiplier(group, ageAt(monthKey))
        * policy.opportunityMultiplier;
      const roleCurrent = Number(row.change.roleCurrentAbilityAfter);
      maxRoleCurrentAbility = Math.max(maxRoleCurrentAbility ?? roleCurrent, roleCurrent);
      if (
        recoveredMonthKey === undefined
        && roleCurrent >= ELITE_CURRENT_ABILITY
      ) {
        recoveredMonthKey = monthKey;
      }
      if (
        ceilingLostMonthKey === undefined
        && Number(row.change.rolePotentialAbility) < ELITE_CURRENT_ABILITY
      ) {
        ceilingLostMonthKey = monthKey;
      }
    }
    if (
      sustainedExposureMonthKey === undefined
      && observedExposure / availableExposure >= SUSTAINED_EXPOSURE_SHARE
    ) {
      sustainedExposureMonthKey = monthKey;
    }
  }

  const resolved = {
    playerId: input.playerId,
    observedExposure: roundExposure(observedExposure),
    availableExposure,
    intakeExpectedCeiling: input.intakeExpectedCeiling,
    maxRoleCurrentAbility: maxRoleCurrentAbility ?? "not_observed",
    ...(finalBucketMargins === undefined ? {} : { finalBucketMargins }),
    ...(sustainedExposureMonthKey === undefined ? {} : { sustainedExposureMonthKey }),
    ...(ceilingLostMonthKey === undefined ? {} : { ceilingLostMonthKey }),
    ...(judgementMonthKey === undefined ? {} : { judgementMonthKey }),
  } as const;
  const censored = judgementMonthKey === undefined;

  // A ceiling that disappeared and a career that reached elite cannot both be
  // true. Potential is never written below current, and current does not fall
  // inside the growth window, so once elite is reached potential stays at or
  // above it. Both dated facts present means the payload contradicts itself,
  // and choosing either silently would publish a share built on it.
  if (ceilingLostMonthKey !== undefined && recoveredMonthKey !== undefined) {
    return failure("ceiling_lost_and_recovered");
  }

  // The contract's frozen order, which is not simply evaluability first: an
  // incredible intake ceiling and a ceiling lost mid-career both outrank
  // censoring, because both are dated facts about a career that a horizon
  // ending later could not have changed. Censoring outranks only the states
  // that need a completed window to mean anything.
  if (input.intakeExpectedCeiling < ELITE_CURRENT_ABILITY) {
    return { ...resolved, outcome: "expected_ceiling_below_16_at_intake" };
  }
  if (ceilingLostMonthKey !== undefined) {
    return {
      ...resolved,
      outcome: "ceiling_lost_before_realization",
      lossTiming: sustainedExposureMonthKey !== undefined
          && sustainedExposureMonthKey <= ceilingLostMonthKey
        ? "after_sustained_exposure"
        : "before_sustained_exposure",
    };
  }
  if (censored) {
    return { ...resolved, outcome: "right_censored_at_horizon" };
  }
  // Reaching elite is not a loss at all, and the two remaining states both
  // presume he never did.
  if (recoveredMonthKey !== undefined) {
    return { ...resolved, outcome: "recovered_before_judgement" };
  }
  if (observedExposure / availableExposure < SUSTAINED_EXPOSURE_SHARE) {
    return { ...resolved, outcome: "sustained_opportunity_insufficient" };
  }
  return { ...resolved, outcome: "realization_under_viable_projection" };
}

function roundExposure(value: number): number {
  return Math.round(value * 10_000) / 10_000;
}

/**
 * States that may name an owner.
 *
 * `right_censored_at_horizon` is a horizon fact, `instrument_failure` is a fact
 * about the measurement, and `recovered_before_judgement` is not a failure at
 * all. None of the three describes a mechanism, so none may be corrected.
 */
const DEVELOPMENT_REALIZATION_ATTRIBUTABLE_STATES = [
  "expected_ceiling_below_16_at_intake",
  "ceiling_lost_before_realization",
  "sustained_opportunity_insufficient",
  "realization_under_viable_projection",
] as const satisfies readonly DevelopmentRealizationLossState[];

const DEVELOPMENT_REALIZATION_OUTCOMES = [
  ...DEVELOPMENT_REALIZATION_LOSS_STATES,
  "recovered_before_judgement",
] as const satisfies readonly DevelopmentRealizationOutcome[];

const CEILING_LOSS_TIMINGS = [
  "before_sustained_exposure",
  "after_sustained_exposure",
] as const satisfies readonly CeilingLossTiming[];

/**
 * Resolves the frozen decision population against the observed monthly rows.
 *
 * The decision population is not recomputed here: it is exactly the players the
 * frozen baseline classified `development_realization` at its own season-ten
 * boundary. This evaluator only says *why* each of them failed, and it may not
 * quietly re-select who failed.
 */
export function evaluateDevelopmentRealizationCheckpoint(input: {
  readonly baseline: SuccessorPathwayCheckpointDecision;
  readonly assignments: readonly SuccessorPathwayWorldFacts[];
  readonly observation: readonly DevelopmentRealizationWorldObservation[];
}): DevelopmentRealizationCheckpointDecision {
  const assignmentsBySeed = new Map(
    input.assignments.map((world) => [world.worldSeed, world]),
  );
  const observationBySeed = new Map(
    input.observation.map((world) => [world.worldSeed, world]),
  );
  let reconciliationFailureCount = Number(
    assignmentsBySeed.size !== input.baseline.worlds.length,
  ) + Number(observationBySeed.size !== input.baseline.worlds.length);

  const worlds: DevelopmentRealizationWorldEvaluation[] = [];
  for (const baselineWorld of input.baseline.worlds) {
    const assignments = assignmentsBySeed.get(baselineWorld.worldSeed);
    const observation = observationBySeed.get(baselineWorld.worldSeed);
    if (assignments === undefined || observation === undefined) {
      reconciliationFailureCount += 1;
      continue;
    }
    const world = evaluateDevelopmentRealizationWorld({
      baselineWorld,
      assignments,
      observation,
    });
    worlds.push(world);
    reconciliationFailureCount += world.reconciliationFailureCount;
  }

  const pooledOutcomeCounts = emptyCounts(DEVELOPMENT_REALIZATION_OUTCOMES);
  const pooledLossTimingCounts = emptyCounts(CEILING_LOSS_TIMINGS);
  let pooledEvaluableCount = 0;
  let pooledCensoredCount = 0;
  let pooledRecoveredCount = 0;
  for (const world of worlds) {
    pooledEvaluableCount += world.evaluableCount;
    pooledCensoredCount += world.censoredCount;
    pooledRecoveredCount += world.recoveredCount;
    for (const outcome of DEVELOPMENT_REALIZATION_OUTCOMES) {
      pooledOutcomeCounts[outcome] += world.outcomeCounts[outcome];
    }
    for (const timing of CEILING_LOSS_TIMINGS) {
      pooledLossTimingCounts[timing] += world.lossTimingCounts[timing];
    }
  }

  const rankedOwners = [...DEVELOPMENT_REALIZATION_ATTRIBUTABLE_STATES].toSorted(
    (left, right) =>
      pooledOutcomeCounts[right] - pooledOutcomeCounts[left]
        || left.localeCompare(right),
  );
  const owner = rankedOwners[0]!;
  const second = rankedOwners[1]!;
  const ownerCoherenceWorldCount = worlds.filter(
    (world) => dominantAttributableState(world) === owner,
  ).length;
  const pooledOwnerShare = observedRatio(
    pooledOutcomeCounts[owner],
    pooledEvaluableCount,
  );
  const pooledOwnerMargin = pooledEvaluableCount === 0
    ? "not_observed"
    : (pooledOutcomeCounts[owner] - pooledOutcomeCounts[second]) / pooledEvaluableCount;

  reconciliationFailureCount += Number(worlds.length !== input.baseline.worlds.length)
    + pooledOutcomeCounts.instrument_failure;
  // Power is decided before attribution: too few evaluable players cannot name
  // an owner however cleanly they rank, and the contract's answer is a longer
  // horizon rather than a correction.
  const underpowered = worlds.some((world) => world.evaluableCount < 10)
    || pooledEvaluableCount < 100;
  const ownerHeld = pooledOwnerShare !== "not_observed"
    && pooledOwnerMargin !== "not_observed"
    && ownerCoherenceWorldCount >= 5
    && pooledOwnerShare >= 0.20
    && pooledOwnerMargin >= 0.05;

  return {
    decision: reconciliationFailureCount > 0
      ? "STOP_INSTRUMENT"
      : underpowered
        ? "UNDERPOWERED"
        : ownerHeld
          ? "OWNER_IDENTIFIED"
          : "MIXED",
    owner: reconciliationFailureCount > 0
      ? "instrument"
      : underpowered
        ? "underpowered"
        : ownerHeld
          ? owner
          : "mixed",
    ownerCoherenceWorldCount,
    pooledEvaluableCount,
    pooledCensoredCount,
    pooledRecoveredCount,
    pooledOutcomeCounts,
    pooledLossTimingCounts,
    pooledOwnerShare,
    pooledOwnerMargin,
    frozenFailureCohortRecoveryShare: observedRatio(
      pooledRecoveredCount,
      pooledEvaluableCount + pooledRecoveredCount,
    ),
    // Pooled over the whole frozen population, not over the seven per-world
    // summaries: a median of medians is not a median.
    pooledCrossCutting: developmentRealizationCrossCuttingFacts(
      worlds.flatMap(({ players }) => players),
    ),
    // Pooled here rather than per world because quantiles need the raw values
    // together: a quantile of per-world quantiles is not a quantile.
    pooledIntakeProfile: developmentRealizationIntakeProfile(
      input.assignments,
      new Map(worlds.map(({ worldSeed, players }) =>
        [worldSeed, new Set(players.map(({ playerId }) => playerId))])),
    ),
    worlds: worlds.toSorted((left, right) =>
      left.worldSeed.localeCompare(right.worldSeed)),
    reconciliationFailureCount,
  };
}

function evaluateDevelopmentRealizationWorld(input: {
  readonly baselineWorld: SuccessorPathwayWorldEvaluation;
  readonly assignments: SuccessorPathwayWorldFacts;
  readonly observation: DevelopmentRealizationWorldObservation;
}): DevelopmentRealizationWorldEvaluation {
  const headerByPlayerId = new Map(
    input.observation.cohort.map((entry) => [entry.playerId, entry]),
  );
  const projectionByPlayerId = new Map(
    input.assignments.assignments.map((assignment) =>
      [assignment.playerId, assignment.projection]),
  );
  const rowsByPlayerId = groupBy(
    input.observation.rows,
    ({ change }) => String(change.playerId),
  );
  const decisionPopulation = input.baselineWorld.players.filter(
    ({ terminal }) => terminal === "development_realization",
  );

  let reconciliationFailureCount = 0;
  const players = decisionPopulation.map((player) => {
    const header = headerByPlayerId.get(player.playerId);
    const projection = projectionByPlayerId.get(player.playerId);
    if (header === undefined || projection === undefined) {
      // A frozen-cohort player with no header has no exposure denominator at
      // all, so every share computed for him would be invented.
      reconciliationFailureCount += 1;
      return {
        playerId: player.playerId,
        outcome: "instrument_failure" as const,
        observedExposure: 0,
        availableExposure: 0,
        intakeExpectedCeiling: "not_observed" as const,
        maxRoleCurrentAbility: "not_observed" as const,
        instrumentFailureReason: header === undefined
          ? "missing_cohort_header"
          : "missing_intake_projection",
      };
    }
    return evaluateDevelopmentRealizationPlayer({
      playerId: player.playerId,
      birthDate: header.birthDate,
      naturalPosition: header.naturalPosition,
      firstEligibleDevelopmentMonthKey: header.firstEligibleDevelopmentMonthKey,
      rows: rowsByPlayerId.get(player.playerId) ?? [],
      closedDevelopmentMonthKeys: input.observation.closedDevelopmentMonthKeys,
      intakeExpectedCeiling: projection.p50Ability,
    });
  });

  const outcomeCounts = emptyCounts(DEVELOPMENT_REALIZATION_OUTCOMES);
  const lossTimingCounts = emptyCounts(CEILING_LOSS_TIMINGS);
  for (const player of players) {
    outcomeCounts[player.outcome] += 1;
    if (player.lossTiming !== undefined) lossTimingCounts[player.lossTiming] += 1;
  }
  // Each player resolves exactly once, and the three groups partition the
  // cohort. A mismatch means an outcome was double-counted or dropped.
  const censoredCount = outcomeCounts.right_censored_at_horizon;
  const recoveredCount = outcomeCounts.recovered_before_judgement;
  const evaluableCount = players.length - censoredCount - recoveredCount;
  reconciliationFailureCount += Number(
    DEVELOPMENT_REALIZATION_OUTCOMES.reduce(
      (total, outcome) => total + outcomeCounts[outcome],
      0,
    ) !== players.length,
  ) + Number(
    lossTimingCounts.before_sustained_exposure + lossTimingCounts.after_sustained_exposure
      !== outcomeCounts.ceiling_lost_before_realization,
  );

  return {
    worldSeed: input.baselineWorld.worldSeed,
    decisionPopulationCount: players.length,
    evaluableCount,
    censoredCount,
    recoveredCount,
    outcomeCounts,
    lossTimingCounts,
    crossCutting: developmentRealizationCrossCuttingFacts(players),
    players: players.toSorted((left, right) =>
      left.playerId.localeCompare(right.playerId)),
    reconciliationFailureCount,
  };
}

/** Instrument facts for one observed world, before any attribution. */
export interface DevelopmentRealizationObservedWorld {
  readonly worldSeed: string;
  /** The population under attribution, rows or no rows. */
  readonly cohort: DevelopmentRealizationWorldObservation["cohort"];
  /** Months a development checkpoint actually ran in; the denominator basis. */
  readonly closedDevelopmentMonthKeys: readonly string[];
  /** Distinct players that produced at least one row. The non-vacuity gate. */
  readonly observedPlayerCount: number;
  readonly observedMonthCount: number;
  /**
   * Rows the recorded boundary cannot place. Zero is the only passing value.
   *
   * A row dated before its own player's first eligible month, or belonging to a
   * player with no header at all, means the rows and the boundary are reading
   * different calendars - and every other number here stays believable while
   * that is true.
   */
  readonly rowsOutsideRecordedBoundaryCount: number;
}

/**
 * The whole L6.43B checkpoint: the frozen baseline plus one declared sub-field.
 *
 * The baseline is reused verbatim through the ten-season adapter and is never
 * recomputed here, because the replay's entire purpose is to show that turning
 * the observer on changes nothing an earlier run established.
 */
export function evaluateDevelopmentRealizationL6_43BCheckpoint(input: {
  readonly control: readonly SuccessorCeilingArmWorldInput[];
  readonly candidate: readonly (SuccessorCeilingArmWorldInput & {
    readonly pathway: SuccessorPathwayWorldFacts;
  })[];
  readonly seasonCount: number;
  readonly observation: readonly DevelopmentRealizationWorldObservation[];
}): SuccessorPathwayCheckpointDecision & {
  readonly developmentRealization: DevelopmentRealizationCheckpointDecision & {
    readonly observedWorlds: readonly DevelopmentRealizationObservedWorld[];
  };
} {
  const baselineArms = successorPathwayBaselineArms(input);
  const baseline = evaluateSuccessorPathwayCheckpoint(baselineArms);
  return {
    ...baseline,
    developmentRealization: {
      ...evaluateDevelopmentRealizationCheckpoint({
        baseline,
        assignments: baselineArms.candidate.map(({ pathway }) => pathway),
        observation: input.observation,
      }),
      observedWorlds: input.observation.map((world) => ({
        worldSeed: world.worldSeed,
        cohort: world.cohort,
        closedDevelopmentMonthKeys: world.closedDevelopmentMonthKeys,
        observedPlayerCount: new Set(
          world.rows.map(({ change }) => String(change.playerId)),
        ).size,
        observedMonthCount: world.rows.length,
        rowsOutsideRecordedBoundaryCount: rowsOutsideRecordedBoundary(world).length,
      })),
    },
  };
}

function rowsOutsideRecordedBoundary(
  world: DevelopmentRealizationWorldObservation,
): readonly PlayerMonthlyDevelopmentObservation[] {
  const firstEligibleByPlayerId = new Map(
    world.cohort.map(({ playerId, firstEligibleDevelopmentMonthKey }) =>
      [playerId, firstEligibleDevelopmentMonthKey] as const),
  );
  return world.rows.filter(({ change }) => {
    const firstEligible = firstEligibleByPlayerId.get(String(change.playerId));
    return firstEligible === undefined || String(change.monthKey) < firstEligible;
  });
}

/**
 * Facts true of a resolved population regardless of which state each reached.
 *
 * Computed from the rows rather than during resolution, so no diagnostic can
 * influence the state a player received. `horizonEndsBeforeJudgementCount` in
 * particular is not `censoredCount`: a player resolved at intake may also have
 * an unfinished horizon, and reporting that is not the same as re-opening him.
 */
function developmentRealizationCrossCuttingFacts(
  players: readonly DevelopmentRealizationPlayerEvaluation[],
): DevelopmentRealizationCrossCuttingFacts {
  const intakeCeilings = players
    .map(({ intakeExpectedCeiling }) => intakeExpectedCeiling)
    .filter((ceiling): ceiling is number => ceiling !== "not_observed");
  const exposureShares = players
    .filter(({ availableExposure }) => availableExposure > 0)
    .map(({ observedExposure, availableExposure }) => observedExposure / availableExposure);
  return {
    intakeExpectedCeiling: distributionFact(intakeCeilings),
    intakeExpectedCeilingBelowEliteCount: intakeCeilings.filter(
      (ceiling) => ceiling < ELITE_CURRENT_ABILITY,
    ).length,
    horizonEndsBeforeJudgementCount: players.filter(
      ({ judgementMonthKey }) => judgementMonthKey === undefined,
    ).length,
    ceilingLostBeforeJudgementCount: players.filter(
      ({ ceilingLostMonthKey }) => ceilingLostMonthKey !== undefined,
    ).length,
    exposureShare: distributionFact(exposureShares),
  };
}

/**
 * Reads the canonical intake projections for one resolved population.
 *
 * Takes them from the pathway assignments rather than from anything the
 * evaluator persisted, so the report carries the derived diagnostic only and
 * the projection stays single-sourced.
 */
function developmentRealizationIntakeProfile(
  assignments: readonly SuccessorPathwayWorldFacts[],
  // Keyed by world: player ids are derived from club and season, not from the
  // seed, so the same id exists in all seven worlds. Pooling ids into one set
  // matches assignments from worlds the player never played in, and silently
  // inflates the population the distribution claims to describe.
  playerIdsByWorldSeed: ReadonlyMap<string, ReadonlySet<string>>,
): DevelopmentRealizationIntakeProfile {
  const projections = assignments
    .flatMap(({ worldSeed, assignments: rows }) =>
      rows.filter(({ playerId }) =>
        playerIdsByWorldSeed.get(worldSeed)?.has(playerId) === true))
    .map(({ projection }) => projection);
  const reaching = (values: readonly number[]): number =>
    values.filter((value) => value >= ELITE_CURRENT_ABILITY).length;
  const currents = projections.map(({ currentAbility }) => currentAbility);
  const p50s = projections.map(({ p50Ability }) => p50Ability);
  const uppers = projections.map(({ upperAbility }) => upperAbility);
  const ceilings = projections.map(({ storedCeilingAbility }) => storedCeilingAbility);
  return {
    playerCount: projections.length,
    currentAbility: distributionFact(currents),
    p50Ability: distributionFact(p50s),
    upperAbility: distributionFact(uppers),
    storedCeilingAbility: distributionFact(ceilings),
    reachingEliteCount: {
      p50Ability: reaching(p50s),
      upperAbility: reaching(uppers),
      storedCeilingAbility: reaching(ceilings),
    },
  };
}

function distributionFact(
  values: readonly number[],
): DevelopmentRealizationDistribution {
  const sorted = [...values].toSorted((left, right) => left - right);
  return {
    minimum: sorted[0] ?? "not_observed",
    p10: percentile(sorted, 0.1),
    p50: percentile(sorted, 0.5),
    p90: percentile(sorted, 0.9),
    maximum: sorted.at(-1) ?? "not_observed",
  };
}

function dominantAttributableState(
  world: DevelopmentRealizationWorldEvaluation,
): DevelopmentRealizationLossState | "not_observed" {
  const ranked = [...DEVELOPMENT_REALIZATION_ATTRIBUTABLE_STATES].toSorted(
    (left, right) =>
      world.outcomeCounts[right] - world.outcomeCounts[left]
        || left.localeCompare(right),
  );
  const leader = ranked[0]!;
  return world.outcomeCounts[leader] === 0 ? "not_observed" : leader;
}

/** One-season execution/reconciliation gate; it makes no renewal claim. */
export function evaluateSuccessorCeilingPairedCanary(input: {
  readonly control: readonly SuccessorCeilingArmWorldInput[];
  readonly candidate: readonly SuccessorCeilingArmWorldInput[];
}): Readonly<{
  decision: "CANARY_GO" | "STOP_INSTRUMENT";
  worldCount: number;
  seasonFactCount: number;
  assignmentCount: number;
  reconciliationFailureCount: number;
}> {
  const controlBySeed = new Map(
    input.control.map((world) => [world.owner.worldSeed, world]),
  );
  let reconciliationFailureCount = Number(input.control.length !== 7)
    + Number(input.candidate.length !== 7)
    + Number(controlBySeed.size !== 7);
  let seasonFactCount = 0;
  let assignmentCount = 0;
  for (const candidate of input.candidate) {
    const control = controlBySeed.get(candidate.owner.worldSeed);
    if (control === undefined) {
      reconciliationFailureCount += 1;
      continue;
    }
    reconciliationFailureCount += Number(candidate.successorCeilingSeasons.length !== 1)
      + Number(control.successorCeilingSeasons.length !== 1);
    const candidateSeason = candidate.successorCeilingSeasons[0];
    const controlSeason = control.successorCeilingSeasons[0];
    if (candidateSeason === undefined || controlSeason === undefined) continue;
    seasonFactCount += 1;
    assignmentCount += candidateSeason.fiveAssignmentCount;
    reconciliationFailureCount += Number(!successorSeasonReconciles(candidateSeason, true))
      + Number(!successorSeasonReconciles(controlSeason, false))
      + Number(!sameStrings(
        candidateSeason.sixAssignmentPlayerIds,
        controlSeason.sixAssignmentPlayerIds,
      ))
      + candidateSeason.selectedPlayers.filter(({ minimumRating }) => minimumRating === 5)
        .filter(({ projection }) =>
          projection.currentRating >= 5 || projection.storedCeilingRating !== 5
        ).length;
  }
  return {
    decision: reconciliationFailureCount === 0 && seasonFactCount === 7
      ? "CANARY_GO"
      : "STOP_INSTRUMENT",
    worldCount: input.candidate.length,
    seasonFactCount,
    assignmentCount,
    reconciliationFailureCount,
  };
}

/**
 * Evaluates the fresh paired structural-successor experiment without owning
 * any generation, development, leader or integrated-gameplay formula.
 */
export function evaluateSuccessorCeilingPairedCheckpoint(input: {
  readonly control: readonly SuccessorCeilingArmWorldInput[];
  readonly candidate: readonly SuccessorCeilingArmWorldInput[];
  readonly seasonCount: number;
  readonly controlIntegratedFailedGateKeys: readonly string[];
  readonly candidateIntegratedFailedGateKeys: readonly string[];
}): SuccessorCeilingPairedCheckpointDecision {
  const control = evaluateProgressiveCurrent16FunnelCheckpoint(input.control);
  const candidate = evaluateProgressiveCurrent16FunnelCheckpoint(input.candidate);
  const controlStationaryBySeed = new Map(
    input.control.map((world) => {
      const evaluation = evaluateWorld(world);
      return [evaluation.worldSeed, evaluation] as const;
    }),
  );
  const candidateStationaryBySeed = new Map(
    input.candidate.map((world) => {
      const evaluation = evaluateWorld(world);
      return [evaluation.worldSeed, evaluation] as const;
    }),
  );
  const controlBySeed = new Map(
    control.worlds.map((world) => [world.worldSeed, world]),
  );
  const candidateInputsBySeed = new Map(
    input.candidate.map((world) => [world.owner.worldSeed, world]),
  );
  let structuralFailureCount = Number(input.seasonCount !== 10)
    + Number(input.control.length !== 7)
    + Number(input.candidate.length !== 7)
    + Number(controlBySeed.size !== 7)
    + Number(candidateInputsBySeed.size !== 7);
  let candidateImprovementWorldCount = 0;
  let generatedAtLeastOpeningWorldCount = 0;
  let successorAssignmentCount = 0;
  let successorClubCapRefusalCount = 0;
  let successorSeasonCount = 0;
  let selectedSemanticsHeld = true;
  let stockReconciliationHeld = true;
  let sixStarLaneHeld = true;
  let stockInflationObserved = false;
  let generatedLeaderCount = 0;
  let leaderCount = 0;
  let age33PlusLeaderCount = 0;
  const candidateSeasonTenCurrent16ByWorld: Array<{
    worldSeed: string;
    openingStock: number;
    openingSenior: number;
    careerGenerated: number;
    total: number;
  }> = [];

  for (const candidateWorld of candidate.worlds) {
    const controlWorld = controlBySeed.get(candidateWorld.worldSeed);
    const candidateInput = candidateInputsBySeed.get(candidateWorld.worldSeed);
    const controlInput = input.control.find(
      ({ owner }) => owner.worldSeed === candidateWorld.worldSeed,
    );
    const candidateStationary = candidateStationaryBySeed.get(candidateWorld.worldSeed);
    const controlStationary = controlStationaryBySeed.get(candidateWorld.worldSeed);
    if (
      controlWorld === undefined
      || candidateInput === undefined
      || controlInput === undefined
      || candidateStationary === undefined
      || controlStationary === undefined
    ) {
      structuralFailureCount += 1;
      continue;
    }
    generatedAtLeastOpeningWorldCount += Number(
      candidateStationary.seasonTenCurrent16.careerGeneratedCount
        >= candidateStationary.seasonTenCurrent16.openingSeniorCount,
    );
    candidateImprovementWorldCount += Number(
      candidateStationary.seasonTenCurrent16.careerGeneratedCount
        > controlStationary.seasonTenCurrent16.careerGeneratedCount,
    );
    const totalCurrent16 = candidateStationary.seasonTenCurrent16.careerGeneratedCount
      + candidateStationary.seasonTenCurrent16.openingSeniorCount;
    stockInflationObserved ||= totalCurrent16 > candidateWorld.openingEliteCount;
    candidateSeasonTenCurrent16ByWorld.push({
      worldSeed: candidateWorld.worldSeed,
      openingStock: candidateWorld.openingEliteCount,
      openingSenior: candidateStationary.seasonTenCurrent16.openingSeniorCount,
      careerGenerated: candidateStationary.seasonTenCurrent16.careerGeneratedCount,
      total: totalCurrent16,
    });
    const leaders = seasonTenLeaderFacts(candidateInput);
    generatedLeaderCount += leaders.generatedCount;
    leaderCount += leaders.totalCount;
    age33PlusLeaderCount += leaders.age33PlusCount;

    const candidateSeasons = candidateInput.successorCeilingSeasons;
    const controlSeasons = controlInput.successorCeilingSeasons;
    successorSeasonCount += candidateSeasons.length;
    structuralFailureCount += Number(candidateSeasons.length !== input.seasonCount)
      + Number(controlSeasons.length !== input.seasonCount);
    const controlSeasonByNumber = new Map(
      controlSeasons.map((season) => [season.seasonNumber, season]),
    );
    for (const season of candidateSeasons) {
      const controlSeason = controlSeasonByNumber.get(season.seasonNumber);
      if (controlSeason === undefined) {
        structuralFailureCount += 1;
        continue;
      }
      successorAssignmentCount += season.fiveAssignmentCount;
      successorClubCapRefusalCount += season.clubCapRefusalCount;
      stockReconciliationHeld &&= successorSeasonReconciles(season, true);
      selectedSemanticsHeld &&= season.selectedPlayers
        .filter(({ minimumRating }) => minimumRating === 5)
        .every(({ projection }) =>
          projection.currentRating < 5 && projection.storedCeilingRating === 5
        );
      sixStarLaneHeld &&= sameStrings(
        season.sixAssignmentPlayerIds,
        controlSeason.sixAssignmentPlayerIds,
      ) && season.sixAssignmentCount === controlSeason.sixAssignmentCount;
    }
  }

  const pooledCareerGeneratedLeaderShare = observedRatio(
    generatedLeaderCount,
    leaderCount,
  );
  const newIntegratedFailureKeys = input.candidateIntegratedFailedGateKeys
    .filter((key) => !input.controlIntegratedFailedGateKeys.includes(key))
    .toSorted();
  const controlReproduced = control.decision === "OWNER_IDENTIFIED"
    && control.owner === "observed_ceiling_supply";
  const failedGateKeys = [
    ...(generatedAtLeastOpeningWorldCount >= 5 ? [] : ["generated_at_least_opening"]),
    ...(pooledCareerGeneratedLeaderShare !== "not_observed"
        && pooledCareerGeneratedLeaderShare >= 0.5
      ? []
      : ["career_generated_leader_share"]),
    ...(candidateImprovementWorldCount >= 5 ? [] : ["paired_current16_improvement"]),
    ...(stockReconciliationHeld ? [] : ["successor_stock_reconciliation"]),
    ...(selectedSemanticsHeld ? [] : ["selected_successor_semantics"]),
    ...(sixStarLaneHeld ? [] : ["six_star_lane_identity"]),
    ...(stockInflationObserved ? ["current16_stock_inflation"] : []),
    ...(newIntegratedFailureKeys.map((key) => `integrated:${key}`)),
    ...(age33PlusLeaderCount > 0 ? [] : ["age33_plus_leader_reachability"]),
  ];
  const structuralFailure = structuralFailureCount > 0
    || control.reconciliationFailureCount > 0
    || candidate.reconciliationFailureCount > 0
    || successorSeasonCount !== 70
    || leaderCount !== 140;
  const hardProductFailure = !stockReconciliationHeld
    || !selectedSemanticsHeld
    || !sixStarLaneHeld
    || stockInflationObserved
    || newIntegratedFailureKeys.length > 0;
  return {
    decision: structuralFailure || !controlReproduced
      ? "STOP_INSTRUMENT"
      : hardProductFailure || candidateImprovementWorldCount < 5
        ? "STOP_RETHINK"
        : failedGateKeys.length === 0
          ? "GO"
          : "REFINE",
    failedGateKeys,
    control,
    candidate,
    generatedAtLeastOpeningWorldCount,
    candidateImprovementWorldCount,
    pooledCareerGeneratedLeaderShare,
    candidateSeasonTenCurrent16ByWorld:
      candidateSeasonTenCurrent16ByWorld.toSorted((left, right) =>
        left.worldSeed.localeCompare(right.worldSeed)
      ),
    age33PlusLeaderCount,
    successorSeasonCount,
    successorAssignmentCount,
    successorClubCapRefusalCount,
    newIntegratedFailureKeys,
  };
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

function seasonTenLeaderFacts(
  input: StationaryAgeSuccessionWorldInput,
): Readonly<{ totalCount: number; generatedCount: number; age33PlusCount: number }> {
  const origins = new Map(
    input.architecture.playerOrigins.map((row) => [row.playerId, row.origin]),
  );
  const seasonTen = input.owner.playerSeasons.filter((row) =>
    row.seasonNumber === 10 && row.competitionId === FIRST_DIVISION_COMPETITION_ID
  );
  const leaders = [
    ...topTenPlayerSeasonFacts(seasonTen, "goals"),
    ...topTenPlayerSeasonFacts(seasonTen, "assists"),
  ];
  return {
    totalCount: leaders.length,
    generatedCount: leaders.filter((row) => {
      const origin = origins.get(row.playerId);
      return origin !== undefined && isCareerGeneratedOrigin(origin);
    }).length,
    age33PlusCount: leaders.filter(({ age }) => age >= 33).length,
  };
}

function sameStrings(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length
    && left.every((value, index) => value === right[index]);
}

function successorSeasonReconciles(
  season: SuccessorCeilingIntakeSeasonFact,
  policyEnabled: boolean,
): boolean {
  const fiveAssignments = season.selectedPlayers.filter(
    ({ minimumRating }) => minimumRating === 5,
  ).length;
  const sixAssignments = season.selectedPlayers.filter(
    ({ minimumRating }) => minimumRating === 6,
  ).length;
  return season.reconciliationFailureCount === 0
    && season.unfilledFiveVacancyCount === Math.max(
      0,
      season.targetFiveOrBetterCount
        - season.activeFiveOrBetterCount
        - season.sixAssignmentCount
        - season.fiveAssignmentCount,
    )
    && season.unfilledSixVacancyCount === Math.max(
      0,
      season.targetSixCount - season.activeSixCount - season.sixAssignmentCount,
    )
    && fiveAssignments === season.fiveAssignmentCount
    && sixAssignments === season.sixAssignmentCount
    && (policyEnabled || season.fiveAssignmentCount === 0);
}

function evaluateSuccessorPathwayWorld(
  input: SuccessorCeilingArmWorldInput & { readonly pathway: SuccessorPathwayWorldFacts },
): SuccessorPathwayWorldEvaluation {
  let reconciliationFailureCount = input.pathway.reconciliationFailureCount;
  const assignments = input.pathway.assignments;
  const assignmentIds = new Set(assignments.map(({ playerId }) => playerId));
  reconciliationFailureCount += Number(assignmentIds.size !== assignments.length)
    + Number(assignments.length !== input.successorCeilingSeasons.reduce(
      (total, season) => total + season.fiveAssignmentCount,
      0,
    ));
  const boundariesByPlayerId = groupBy(
    input.pathway.boundaries,
    ({ playerId }) => playerId,
  );
  const ownerRowsByPlayerId = groupBy(
    input.owner.playerSeasons,
    ({ playerId }) => playerId,
  );
  const seasonTenFirstDivision = input.owner.playerSeasons.filter((row) =>
    row.seasonNumber === 10 && row.competitionId === FIRST_DIVISION_COMPETITION_ID
  );
  const leaderIds = new Set([
    ...topTenPlayerSeasonFacts(seasonTenFirstDivision, "goals"),
    ...topTenPlayerSeasonFacts(seasonTenFirstDivision, "assists"),
  ].map(({ playerId }) => playerId));
  const terminals = [
    ...SUCCESSOR_PATHWAY_OWNERS,
    "open_window",
    "season_ten_leader",
  ] as const satisfies readonly SuccessorPathwayTerminal[];
  const terminalCounts = emptyCounts(terminals);
  const players: SuccessorPathwayPlayerEvaluation[] = [];

  for (const assignment of assignments) {
    reconciliationFailureCount += Number(
      assignment.projection.currentRating >= 5
        || assignment.projection.storedCeilingRating !== 5,
    );
    const boundaries = (boundariesByPlayerId.get(assignment.playerId) ?? [])
      .toSorted((left, right) => left.seasonNumber - right.seasonNumber);
    const expectedBoundaryCount = 11 - assignment.seasonNumber;
    reconciliationFailureCount += Number(boundaries.length !== expectedBoundaryCount);
    for (let offset = 0; offset < boundaries.length; offset += 1) {
      reconciliationFailureCount += Number(
        boundaries[offset]?.seasonNumber !== assignment.seasonNumber + offset,
      );
    }
    const exitOutcomes = boundaries.flatMap(({ academyExitOutcomes }) => academyExitOutcomes);
    const seniorAssociations = boundaries.flatMap(({ seniorAssociations, seasonNumber }) =>
      seniorAssociations.map((association) => ({ ...association, seasonNumber }))
    );
    reconciliationFailureCount += Number(exitOutcomes.length > 1)
      + Number(exitOutcomes.length === 0 && seniorAssociations.length > 0);
    const ownerRows = ownerRowsByPlayerId.get(assignment.playerId) ?? [];
    const cumulativeSeniorAppearances = ownerRows.reduce(
      (total, row) => total + row.appearances,
      0,
    );
    const cumulativeSeniorMinutes = ownerRows.reduce(
      (total, row) => total + row.minutes,
      0,
    );
    const reachedCurrent16 = ownerRows.some(({ currentAbility }) => currentAbility >= 16);
    const reachedFirstDivisionCurrent16 = ownerRows.some((row) =>
      row.competitionId === FIRST_DIVISION_COMPETITION_ID && row.currentAbility >= 16
    );
    const retainedFirstDivisionCurrent16AtSeasonTen = ownerRows.some((row) =>
      row.seasonNumber === 10
        && row.competitionId === FIRST_DIVISION_COMPETITION_ID
        && row.currentAbility >= 16
    );
    const seasonTenLeader = leaderIds.has(assignment.playerId);
    const terminal: SuccessorPathwayTerminal = exitOutcomes.length === 0
      ? "open_window"
      : seniorAssociations.length === 0
        ? "senior_registration"
        : cumulativeSeniorAppearances === 0
          ? "appearance_allocation"
          : cumulativeSeniorMinutes < 900
            ? "development_minutes"
            : !reachedCurrent16
              ? "development_realization"
              : !reachedFirstDivisionCurrent16
                ? "first_division_entry"
                : !retainedFirstDivisionCurrent16AtSeasonTen
                  ? "first_division_retention"
                  : !seasonTenLeader
                    ? "leader_selection"
                    : "season_ten_leader";
    terminalCounts[terminal] += 1;
    players.push({
      playerId: assignment.playerId,
      assignmentSeason: assignment.seasonNumber,
      assignmentClubId: assignment.clubId,
      role: assignment.role,
      assignmentAge: assignment.projection.age,
      terminal,
      academyExitOutcome: exitOutcomes[0] ?? "not_observed",
      firstSeniorSeason: seniorAssociations[0]?.seasonNumber ?? "not_observed",
      cumulativeSeniorAppearances,
      cumulativeSeniorMinutes,
      reachedCurrent16,
      reachedFirstDivisionCurrent16,
      retainedFirstDivisionCurrent16AtSeasonTen,
      seasonTenLeader,
    });
  }
  reconciliationFailureCount += input.pathway.boundaries.reduce(
    (total, boundary) => total + Number(!assignmentIds.has(boundary.playerId)),
    0,
  );
  const closedWindowCount = assignments.length - terminalCounts.open_window;
  const rankedOwners = [...SUCCESSOR_PATHWAY_OWNERS].toSorted((left, right) =>
    terminalCounts[right] - terminalCounts[left] || left.localeCompare(right)
  );
  const lossCount = SUCCESSOR_PATHWAY_OWNERS.reduce(
    (total, owner) => total + terminalCounts[owner],
    0,
  );
  const dominantLossOwner = lossCount === 0 ? "not_observed" : rankedOwners[0]!;

  return {
    worldSeed: input.owner.worldSeed,
    assignmentCount: assignments.length,
    closedWindowCount,
    openWindowCount: terminalCounts.open_window,
    terminalCounts,
    dominantLossOwner,
    dominantLossShare: dominantLossOwner === "not_observed"
      ? "not_observed"
      : observedRatio(terminalCounts[dominantLossOwner], closedWindowCount),
    players: players.toSorted((left, right) =>
      left.assignmentSeason - right.assignmentSeason
        || left.playerId.localeCompare(right.playerId)
    ),
    reconciliationFailureCount,
  };
}

function firstSixStarDivergence(
  worldSeed: string,
  control: readonly SuccessorCeilingIntakeSeasonFact[],
  candidate: readonly SuccessorCeilingIntakeSeasonFact[],
): SuccessorPathwayCheckpointDecision["sixStarFirstDivergences"][number] | undefined {
  const controlBySeason = new Map(control.map((season) => [season.seasonNumber, season]));
  for (const candidateSeason of [...candidate].toSorted(
    (left, right) => left.seasonNumber - right.seasonNumber,
  )) {
    const controlSeason = controlBySeason.get(candidateSeason.seasonNumber);
    if (
      controlSeason === undefined
      || sameStrings(controlSeason.sixAssignmentPlayerIds, candidateSeason.sixAssignmentPlayerIds)
    ) continue;
    const cause: SixStarFirstDivergenceCause = !sameStrings(
        controlSeason.activeSixPlayerIds,
        candidateSeason.activeSixPlayerIds,
      )
      ? "active_stock"
      : controlSeason.targetSixCount !== candidateSeason.targetSixCount
          || controlSeason.sixAssignmentCount !== candidateSeason.sixAssignmentCount
        ? "target_or_vacancy"
        : !sameSixCandidateFacts(
            controlSeason.sixCandidateFacts,
            candidateSeason.sixCandidateFacts,
          )
          ? "candidate_population"
          : "allocation_constraints";
    return { worldSeed, seasonNumber: candidateSeason.seasonNumber, cause };
  }
  return undefined;
}

function sameSixCandidateFacts(
  left: SuccessorCeilingIntakeSeasonFact["sixCandidateFacts"],
  right: SuccessorCeilingIntakeSeasonFact["sixCandidateFacts"],
): boolean {
  return left.length === right.length && left.every((row, index) => {
    const other = right[index];
    return other !== undefined
      && row.playerId === other.playerId
      && row.clubId === other.clubId
      && row.division === other.division;
  });
}

function orderedMatchingKeys<Key extends string, Value>(
  order: Readonly<Record<Key, number>>,
  values: Readonly<Record<Key, readonly Value[]>>,
  playerId: string,
): Key[] {
  return Object.entries(order)
    .map(([key, rank]) => ({ key: key as Key, rank: Number(rank) }))
    .toSorted((left, right) => left.rank - right.rank || left.key.localeCompare(right.key))
    .filter(({ key }) => values[key].some((value) => String(value) === playerId))
    .map(({ key }) => key);
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
