import type { SimulateSeasonResult } from "@game/engine";

import {
  HISTORICAL_ASSIST_SUPPLY_TARGETS,
  HISTORICAL_DEAD_BALL_TARGETS,
} from "./historical-simulation-targets.ts";

export const ASSIST_GOAL_KINDS = [
  "penalty",
  "direct_free_kick",
  "self_created",
  "distinct_uncredited",
  "credited_assist",
] as const;
export type AssistGoalKind = typeof ASSIST_GOAL_KINDS[number];

const ASSIST_REQUIRED_GOAL_KINDS = ASSIST_GOAL_KINDS.filter(
  (kind): kind is Exclude<AssistGoalKind, "direct_free_kick"> => kind !== "direct_free_kick",
);

export const PENALTY_OUTCOMES = ["scored", "saved", "missed"] as const;
export type ObservedPenaltyOutcome = typeof PENALTY_OUTCOMES[number];

export const DIRECT_FREE_KICK_ZONE_CANDIDATE_BASIS_POINTS = [
  5000, 5250, 5500, 5750, 6000, 6250, 6500, 6750,
  7000, 7250, 7500, 7750, 8000, 8250,
] as const;

export interface DirectFreeKickCandidateCount {
  readonly minimumZoneDangerBasisPoints: number;
  readonly eligibleFoulCount: number;
}

type GoalEvent = Extract<
  NonNullable<NonNullable<SimulateSeasonResult["fixtures"][number]["result"]>["report"]>["events"][number],
  { readonly type: "goal" }
>;

export interface AssistSupplySeasonFact {
  readonly competitionId: string;
  readonly seasonNumber: number;
  readonly fixtureCount: number;
  readonly counts: Readonly<Record<AssistGoalKind, number>>;
  readonly countsByChanceAndShot: Readonly<Record<string, Readonly<Record<AssistGoalKind, number>>>>;
  readonly penaltyAwardedCount: number;
  readonly penaltyOutcomeCounts: Readonly<Record<ObservedPenaltyOutcome, number>>;
  readonly directFreeKickOutcomeCounts: Readonly<Record<ObservedPenaltyOutcome, number>>;
  readonly foulCount: number;
  readonly penaltyAssociatedFoulCount: number;
  readonly directFreeKickCandidateCounts: readonly DirectFreeKickCandidateCount[];
  readonly reconciliationFailureCount: number;
}

export interface AssistSupplyWorldFacts {
  readonly worldSeed: string;
  readonly seasons: readonly AssistSupplySeasonFact[];
}

/** Collects post-match season facts without participating in simulation. */
export class AssistSupplyObserver {
  readonly #worldSeed: string;
  readonly #seasons: AssistSupplySeasonFact[] = [];

  public constructor(worldSeed: string) {
    this.#worldSeed = worldSeed;
  }

  public observeCompetitionSeason(input: Parameters<typeof assistSupplySeasonFact>[0]): void {
    this.#seasons.push(assistSupplySeasonFact(input));
  }

  public facts(): AssistSupplyWorldFacts {
    return { worldSeed: this.#worldSeed, seasons: this.#seasons };
  }
}

export interface AssistSupplyCheckpointDecision {
  readonly decision:
    | "creator_shooter_overlap"
    | "assist_credit_probability"
    | "not_reproduced"
    | "shared_or_unresolved"
    | "STOP_RETHINK";
  readonly seasonCount: number;
  readonly counts: Readonly<Record<AssistGoalKind, number>>;
  readonly creditedShare: number | "not_observed";
  readonly maximumCreditableShare: number | "not_observed";
  readonly selfCreatedShare: number | "not_observed";
  readonly distinctCreditRate: number | "not_observed";
  readonly reachedGoalKinds: readonly AssistGoalKind[];
  readonly reconciliationFailureCount: number;
}

export interface AssistEligibilityCheckpointDecision {
  readonly decision: "GO" | "REFINE" | "STOP_RETHINK";
  readonly residualOwner: "none" | "dead_ball_supply" | "unresolved";
  readonly seasonCount: number;
  readonly counts: Readonly<Record<AssistGoalKind, number>>;
  readonly nonSetPieceGoalCount: number;
  readonly nonSetPieceAssistedShare: number | "not_observed";
  readonly allGoalAssistedShare: number | "not_observed";
  readonly deadBallGoalShare: number | "not_observed";
  readonly nonSetPieceTargetHeld: boolean;
  readonly allGoalTargetHeld: boolean;
  readonly deadBallSupplyGap: number | "not_observed";
  readonly reachedGoalKinds: readonly AssistGoalKind[];
  readonly reconciliationFailureCount: number;
}

export type DeadBallSupplyOwner =
  | "penalty_award_frequency"
  | "penalty_conversion"
  | "direct_free_kick_path";

export interface DeadBallAttributionCheckpointDecision {
  readonly decision: "OWNER_IDENTIFIED" | "STOP_RETHINK";
  readonly owners: readonly DeadBallSupplyOwner[];
  readonly seasonCount: number;
  readonly fixtureCount: number;
  readonly penaltyAwardedCount: number;
  readonly penaltyOutcomeCounts: Readonly<Record<ObservedPenaltyOutcome, number>>;
  readonly penaltyAttemptsPerMatch: number | "not_observed";
  readonly penaltyConversion: number | "not_observed";
  readonly penaltyGoalsPerMatch: number | "not_observed";
  readonly directFreeKickPath: "implemented" | "not_implemented";
  readonly directFreeKickAttemptsPerMatch: number | "not_observed";
  readonly directFreeKickConversion: number | "not_observed";
  readonly directFreeKickGoalsPerMatch: number | "not_observed";
  readonly externalDirectFreeKickGoalsPerMatch: number;
  readonly reachedPenaltyOutcomes: readonly ObservedPenaltyOutcome[];
  readonly reachedDirectFreeKickOutcomes: readonly ObservedPenaltyOutcome[];
  readonly reconciliationFailureCount: number;
}

export interface PenaltyAwardRetryCheckpointDecision {
  readonly decision: "GO" | "REFINE" | "STOP_RETHINK";
  readonly penaltyAttemptsPerMatch: number | "not_observed";
  readonly penaltyConversion: number | "not_observed";
  readonly penaltyGoalsPerMatch: number | "not_observed";
  readonly nonSetPieceAssistedShare: number | "not_observed";
  readonly reachedPenaltyOutcomes: readonly ObservedPenaltyOutcome[];
  readonly calibrationVersionHeld: boolean;
  readonly reconciliationFailureCount: number;
}

export interface DirectFreeKickGeometryCheckpointDecision {
  readonly decision: "GO" | "REFINE" | "STOP_RETHINK";
  readonly selectedMinimumZoneDangerBasisPoints: number | "not_observed";
  readonly calibrationAttemptsPerMatch: number | "not_observed";
  readonly validationAttemptsPerMatch: number | "not_observed";
  readonly calibrationCandidates: readonly DirectFreeKickGeometryCandidateRate[];
  readonly validationCandidates: readonly DirectFreeKickGeometryCandidateRate[];
  readonly penaltyAttemptsPerMatch: number | "not_observed";
  readonly penaltyConversion: number | "not_observed";
  readonly reconciliationFailureCount: number;
}

export interface DirectFreeKickPathCheckpointDecision {
  readonly decision: "GO" | "REFINE" | "STOP_RETHINK";
  readonly refinementOwners: readonly ("attempt_frequency" | "conversion")[];
  readonly directFreeKickAttemptsPerMatch: number | "not_observed";
  readonly directFreeKickConversion: number | "not_observed";
  readonly directFreeKickGoalsPerMatch: number | "not_observed";
  readonly penaltyAttemptsPerMatch: number | "not_observed";
  readonly penaltyConversion: number | "not_observed";
  readonly nonSetPieceAssistedShare: number | "not_observed";
  readonly reachedDirectFreeKickOutcomes: readonly ObservedPenaltyOutcome[];
  readonly calibrationVersionHeld: boolean;
  readonly reconciliationFailureCount: number;
}

export interface DirectFreeKickGeometryCandidateRate {
  readonly minimumZoneDangerBasisPoints: number;
  readonly eligibleFoulCount: number;
  readonly attemptsPerMatch: number | "not_observed";
}

/** Classifies durable goal facts without reconstructing the selected creator. */
export function assistSupplySeasonFact(input: {
  readonly competitionId: string;
  readonly seasonNumber: number;
  readonly result: SimulateSeasonResult;
}): AssistSupplySeasonFact {
  const counts = emptyCounts();
  const countsByChanceAndShot = new Map<string, Record<AssistGoalKind, number>>();
  const penaltyOutcomeCounts = emptyPenaltyOutcomeCounts();
  const directFreeKickOutcomeCounts = emptyPenaltyOutcomeCounts();
  let reportGoalCount = 0;
  let reportStatsGoalCount = 0;
  let fixtureCount = 0;
  let penaltyAwardedCount = 0;
  let foulCount = 0;
  let penaltyAssociatedFoulCount = 0;
  const directFreeKickCandidateCounts = DIRECT_FREE_KICK_ZONE_CANDIDATE_BASIS_POINTS.map(
    (minimumZoneDangerBasisPoints) => ({ minimumZoneDangerBasisPoints, eligibleFoulCount: 0 }),
  );
  for (const fixture of input.result.fixtures) {
    const report = fixture.result?.report;
    if (report === undefined) continue;
    fixtureCount += 1;
    reportStatsGoalCount += report.stats.home.goals + report.stats.away.goals;
    const penaltyFoulKeys = new Set(report.events.flatMap((event) =>
      event.type === "penalty_awarded" && event.committedByPlayerId !== undefined
        ? [`${event.minute}|${String(event.committedByPlayerId)}`]
        : []
    ));
    for (const event of report.events) {
      if (event.type === "penalty_awarded") {
        penaltyAwardedCount += 1;
        continue;
      }
      if (event.type === "penalty_outcome") {
        penaltyOutcomeCounts[event.outcome] += 1;
        continue;
      }
      if (event.type === "foul") {
        foulCount += 1;
        const penaltyAssociated = penaltyFoulKeys.has(
          `${event.minute}|${String(event.committedByPlayerId)}`,
        );
        if (penaltyAssociated) {
          penaltyAssociatedFoulCount += 1;
        } else {
          const zoneDangerBasisPoints = Math.round(event.zoneDanger * 10_000);
          for (const candidate of directFreeKickCandidateCounts) {
            if (zoneDangerBasisPoints >= candidate.minimumZoneDangerBasisPoints) {
              candidate.eligibleFoulCount += 1;
            }
          }
        }
        continue;
      }
      if (
        (event.type === "goal" || event.type === "save" || event.type === "miss")
        && event.shot.deadBallKind === "direct_free_kick"
      ) {
        directFreeKickOutcomeCounts[
          event.type === "goal" ? "scored" : event.type === "save" ? "saved" : "missed"
        ] += 1;
      }
      if (event.type !== "goal") continue;
      reportGoalCount += 1;
      const kind = assistGoalKind(event);
      counts[kind] += 1;
      const key = `${event.shot.chanceType}|${event.shot.shotType}`;
      const category = countsByChanceAndShot.get(key) ?? emptyCounts();
      category[kind] += 1;
      countsByChanceAndShot.set(key, category);
    }
  }
  const playerGoals = input.result.playerSummaryStats.reduce((sum, row) => sum + row.goals, 0);
  const playerAssists = input.result.playerSummaryStats.reduce((sum, row) => sum + row.assists, 0);
  return {
    competitionId: input.competitionId,
    seasonNumber: input.seasonNumber,
    fixtureCount,
    counts,
    countsByChanceAndShot: Object.fromEntries(
      [...countsByChanceAndShot.entries()].sort(([left], [right]) => left.localeCompare(right)),
    ),
    penaltyAwardedCount,
    penaltyOutcomeCounts,
    directFreeKickOutcomeCounts,
    foulCount,
    penaltyAssociatedFoulCount,
    directFreeKickCandidateCounts,
    reconciliationFailureCount:
      Number(reportGoalCount !== reportStatsGoalCount)
      + Number(reportGoalCount !== playerGoals)
      + Number(counts.credited_assist !== playerAssists)
      + Number(penaltyAwardedCount !== penaltyOutcomeTotal(penaltyOutcomeCounts))
      + Number(penaltyOutcomeCounts.scored !== counts.penalty)
      + Number(directFreeKickOutcomeCounts.scored !== counts.direct_free_kick)
      + Number(penaltyAssociatedFoulCount !== penaltyAwardedCount)
      + Number(!candidateCountsAreNested(directFreeKickCandidateCounts)),
  };
}

/** Applies the preregistered external comparison to one pooled first division. */
export function evaluateAssistSupplyCheckpoint(
  worlds: readonly AssistSupplyWorldFacts[],
  firstDivisionCompetitionId: string,
): AssistSupplyCheckpointDecision {
  const pooled = pooledAssistSupplyFacts(worlds, firstDivisionCompetitionId);
  const counts = pooled.counts;
  const goalCount = ASSIST_GOAL_KINDS.reduce((sum, kind) => sum + counts[kind], 0);
  const distinctGoalCount = counts.credited_assist + counts.distinct_uncredited;
  const creditedShare = ratio(counts.credited_assist, goalCount);
  const maximumCreditableShare = ratio(distinctGoalCount, goalCount);
  const selfCreatedShare = ratio(counts.self_created, goalCount);
  const distinctCreditRate = ratio(counts.credited_assist, distinctGoalCount);
  const reachedGoalKinds = ASSIST_GOAL_KINDS.filter((kind) => counts[kind] > 0);
  let decision: AssistSupplyCheckpointDecision["decision"];
  if (
    pooled.reconciliationFailureCount > 0
    || pooled.seasonCount === 0
    || !ASSIST_REQUIRED_GOAL_KINDS.every((kind) => reachedGoalKinds.includes(kind))
  ) {
    decision = "STOP_RETHINK";
  } else if (creditedShare === "not_observed" || maximumCreditableShare === "not_observed") {
    decision = "STOP_RETHINK";
  } else if (
    HISTORICAL_ASSIST_SUPPLY_TARGETS.allGoalAssistedShare - creditedShare
      < HISTORICAL_ASSIST_SUPPLY_TARGETS.materialSupplyGap
  ) {
    decision = "not_reproduced";
  } else if (
    maximumCreditableShare
      < HISTORICAL_ASSIST_SUPPLY_TARGETS.allGoalAssistedShare
        - HISTORICAL_ASSIST_SUPPLY_TARGETS.comparisonTolerance
  ) {
    decision = "creator_shooter_overlap";
  } else {
    decision = "assist_credit_probability";
  }
  return {
    decision,
    seasonCount: pooled.seasonCount,
    counts,
    creditedShare,
    maximumCreditableShare,
    selfCreatedShare,
    distinctCreditRate,
    reachedGoalKinds,
    reconciliationFailureCount: pooled.reconciliationFailureCount,
  };
}

/** Separates ordinary assist semantics from the dead-ball denominator. */
export function evaluateAssistEligibilityCheckpoint(
  worlds: readonly AssistSupplyWorldFacts[],
  firstDivisionCompetitionId: string,
): AssistEligibilityCheckpointDecision {
  const pooled = pooledAssistSupplyFacts(worlds, firstDivisionCompetitionId);
  const goalCount = ASSIST_GOAL_KINDS.reduce((sum, kind) => sum + pooled.counts[kind], 0);
  const nonSetPieceGoalCount = goalCount - pooled.counts.penalty - pooled.counts.direct_free_kick;
  const nonSetPieceAssistedShare = ratio(pooled.counts.credited_assist, nonSetPieceGoalCount);
  const allGoalAssistedShare = ratio(pooled.counts.credited_assist, goalCount);
  const deadBallGoalShare = ratio(
    pooled.counts.penalty + pooled.counts.direct_free_kick,
    goalCount,
  );
  const reachedGoalKinds = ASSIST_GOAL_KINDS.filter((kind) => pooled.counts[kind] > 0);
  const nonSetPieceTargetHeld = insideTolerance(
    nonSetPieceAssistedShare,
    HISTORICAL_ASSIST_SUPPLY_TARGETS.nonSetPieceAssistedShare,
  );
  const allGoalTargetHeld = insideTolerance(
    allGoalAssistedShare,
    HISTORICAL_ASSIST_SUPPLY_TARGETS.allGoalAssistedShare,
  );
  const deadBallSupplyGap = deadBallGoalShare === "not_observed"
    ? "not_observed"
    : HISTORICAL_ASSIST_SUPPLY_TARGETS.deadBallGoalShare - deadBallGoalShare;

  let decision: AssistEligibilityCheckpointDecision["decision"];
  let residualOwner: AssistEligibilityCheckpointDecision["residualOwner"];
  if (
    pooled.reconciliationFailureCount > 0
    || pooled.seasonCount === 0
    || !ASSIST_REQUIRED_GOAL_KINDS.every((kind) => reachedGoalKinds.includes(kind))
    || nonSetPieceAssistedShare === "not_observed"
    || allGoalAssistedShare === "not_observed"
    || deadBallGoalShare === "not_observed"
  ) {
    decision = "STOP_RETHINK";
    residualOwner = "unresolved";
  } else if (!nonSetPieceTargetHeld) {
    decision = "REFINE";
    residualOwner = "unresolved";
  } else if (allGoalTargetHeld) {
    decision = "GO";
    residualOwner = "none";
  } else if (
    allGoalAssistedShare > HISTORICAL_ASSIST_SUPPLY_TARGETS.allGoalAssistedShare
      + HISTORICAL_ASSIST_SUPPLY_TARGETS.comparisonTolerance
    && typeof deadBallSupplyGap === "number"
    && deadBallSupplyGap >= HISTORICAL_ASSIST_SUPPLY_TARGETS.materialDeadBallGap
  ) {
    decision = "GO";
    residualOwner = "dead_ball_supply";
  } else {
    decision = "STOP_RETHINK";
    residualOwner = "unresolved";
  }

  return {
    decision,
    residualOwner,
    seasonCount: pooled.seasonCount,
    counts: pooled.counts,
    nonSetPieceGoalCount,
    nonSetPieceAssistedShare,
    allGoalAssistedShare,
    deadBallGoalShare,
    nonSetPieceTargetHeld,
    allGoalTargetHeld,
    deadBallSupplyGap,
    reachedGoalKinds,
    reconciliationFailureCount: pooled.reconciliationFailureCount,
  };
}

/** Attributes the dead-ball residual without merging its independent owners. */
export function evaluateDeadBallAttributionCheckpoint(
  worlds: readonly AssistSupplyWorldFacts[],
  firstDivisionCompetitionId: string,
): DeadBallAttributionCheckpointDecision {
  const seasons = worlds.flatMap(({ seasons }) => seasons)
    .filter((season) => season.competitionId === firstDivisionCompetitionId);
  const penaltyOutcomeCounts = emptyPenaltyOutcomeCounts();
  const directFreeKickOutcomeCounts = emptyPenaltyOutcomeCounts();
  let fixtureCount = 0;
  let penaltyAwardedCount = 0;
  let penaltyGoalCount = 0;
  let reconciliationFailureCount = 0;
  for (const season of seasons) {
    fixtureCount += season.fixtureCount;
    penaltyAwardedCount += season.penaltyAwardedCount;
    penaltyGoalCount += season.counts.penalty;
    reconciliationFailureCount += season.reconciliationFailureCount;
    for (const outcome of PENALTY_OUTCOMES) {
      penaltyOutcomeCounts[outcome] += season.penaltyOutcomeCounts[outcome];
      directFreeKickOutcomeCounts[outcome] += season.directFreeKickOutcomeCounts[outcome];
    }
  }
  const penaltyAttemptsPerMatch = ratio(penaltyAwardedCount, fixtureCount);
  const penaltyConversion = ratio(penaltyOutcomeCounts.scored, penaltyAwardedCount);
  const penaltyGoalsPerMatch = ratio(penaltyGoalCount, fixtureCount);
  const reachedPenaltyOutcomes = PENALTY_OUTCOMES.filter((outcome) => penaltyOutcomeCounts[outcome] > 0);
  const directFreeKickAttemptCount = penaltyOutcomeTotal(directFreeKickOutcomeCounts);
  const directFreeKickAttemptsPerMatch = ratio(directFreeKickAttemptCount, fixtureCount);
  const directFreeKickConversion = ratio(directFreeKickOutcomeCounts.scored, directFreeKickAttemptCount);
  const directFreeKickGoalsPerMatch = ratio(directFreeKickOutcomeCounts.scored, fixtureCount);
  const reachedDirectFreeKickOutcomes = PENALTY_OUTCOMES.filter(
    (outcome) => directFreeKickOutcomeCounts[outcome] > 0,
  );
  const structuralFailure = seasons.length === 0
    || reconciliationFailureCount > 0
    || reachedPenaltyOutcomes.length !== PENALTY_OUTCOMES.length
    || penaltyAttemptsPerMatch === "not_observed"
    || penaltyConversion === "not_observed"
    || penaltyGoalsPerMatch === "not_observed";
  const owners: DeadBallSupplyOwner[] = [];
  if (
    typeof penaltyAttemptsPerMatch === "number"
    && Math.abs(penaltyAttemptsPerMatch - HISTORICAL_DEAD_BALL_TARGETS.penaltyAttemptsPerMatch)
      > HISTORICAL_DEAD_BALL_TARGETS.penaltyAttemptsPerMatchTolerance
  ) owners.push("penalty_award_frequency");
  if (
    typeof penaltyConversion === "number"
    && Math.abs(penaltyConversion - HISTORICAL_DEAD_BALL_TARGETS.penaltyConversion)
      > HISTORICAL_DEAD_BALL_TARGETS.penaltyConversionTolerance
  ) owners.push("penalty_conversion");
  if (directFreeKickAttemptCount === 0) owners.push("direct_free_kick_path");

  return {
    decision: structuralFailure ? "STOP_RETHINK" : "OWNER_IDENTIFIED",
    owners,
    seasonCount: seasons.length,
    fixtureCount,
    penaltyAwardedCount,
    penaltyOutcomeCounts,
    penaltyAttemptsPerMatch,
    penaltyConversion,
    penaltyGoalsPerMatch,
    directFreeKickPath: directFreeKickAttemptCount === 0 ? "not_implemented" : "implemented",
    directFreeKickAttemptsPerMatch,
    directFreeKickConversion,
    directFreeKickGoalsPerMatch,
    externalDirectFreeKickGoalsPerMatch: HISTORICAL_DEAD_BALL_TARGETS.directFreeKickGoalsPerMatch,
    reachedPenaltyOutcomes,
    reachedDirectFreeKickOutcomes,
    reconciliationFailureCount,
  };
}

/** Rechecks only the accepted penalty-frequency candidate and carried guards. */
export function evaluatePenaltyAwardRetryCheckpoint(
  worlds: readonly AssistSupplyWorldFacts[],
  firstDivisionCompetitionId: string,
  calibrationVersions: readonly string[],
  expectedCalibrationVersion: string,
): PenaltyAwardRetryCheckpointDecision {
  const penalty = evaluateDeadBallAttributionCheckpoint(worlds, firstDivisionCompetitionId);
  const assists = evaluateAssistEligibilityCheckpoint(worlds, firstDivisionCompetitionId);
  const calibrationVersionHeld = calibrationVersions.length === worlds.length
    && calibrationVersions.every((version) => version === expectedCalibrationVersion);
  const attemptHeld = insideSpecificTolerance(
    penalty.penaltyAttemptsPerMatch,
    HISTORICAL_DEAD_BALL_TARGETS.penaltyAttemptsPerMatch,
    HISTORICAL_DEAD_BALL_TARGETS.penaltyAttemptsPerMatchTolerance,
  );
  const conversionHeld = insideSpecificTolerance(
    penalty.penaltyConversion,
    HISTORICAL_DEAD_BALL_TARGETS.penaltyConversion,
    HISTORICAL_DEAD_BALL_TARGETS.penaltyConversionTolerance,
  );
  let decision: PenaltyAwardRetryCheckpointDecision["decision"];
  if (
    penalty.decision === "STOP_RETHINK"
    || !calibrationVersionHeld
    || !assists.nonSetPieceTargetHeld
    || assists.reconciliationFailureCount > 0
  ) {
    decision = "STOP_RETHINK";
  } else if (!conversionHeld) {
    decision = "STOP_RETHINK";
  } else {
    decision = attemptHeld ? "GO" : "REFINE";
  }
  return {
    decision,
    penaltyAttemptsPerMatch: penalty.penaltyAttemptsPerMatch,
    penaltyConversion: penalty.penaltyConversion,
    penaltyGoalsPerMatch: penalty.penaltyGoalsPerMatch,
    nonSetPieceAssistedShare: assists.nonSetPieceAssistedShare,
    reachedPenaltyOutcomes: penalty.reachedPenaltyOutcomes,
    calibrationVersionHeld,
    reconciliationFailureCount: penalty.reconciliationFailureCount + assists.reconciliationFailureCount,
  };
}

/** Selects foul geometry on seven worlds and verifies it on seven unseen worlds. */
export function evaluateDirectFreeKickGeometryCheckpoint(
  worlds: readonly AssistSupplyWorldFacts[],
  firstDivisionCompetitionId: string,
): DirectFreeKickGeometryCheckpointDecision {
  const calibrationWorlds = worlds.slice(0, 7);
  const validationWorlds = worlds.slice(7, 14);
  const calibration = directFreeKickGeometryRates(calibrationWorlds, firstDivisionCompetitionId);
  const validation = directFreeKickGeometryRates(validationWorlds, firstDivisionCompetitionId);
  const penalty = evaluateDeadBallAttributionCheckpoint(worlds, firstDivisionCompetitionId);
  const selected = [...calibration.candidates].sort((left, right) => {
    const leftDistance = rateDistance(left.attemptsPerMatch);
    const rightDistance = rateDistance(right.attemptsPerMatch);
    if (leftDistance !== rightDistance) return leftDistance - rightDistance;
    return right.minimumZoneDangerBasisPoints - left.minimumZoneDangerBasisPoints;
  })[0];
  const selectedValidation = selected === undefined
    ? undefined
    : validation.candidates.find((candidate) =>
        candidate.minimumZoneDangerBasisPoints === selected.minimumZoneDangerBasisPoints
      );
  const calibrationAttemptsPerMatch = selected?.attemptsPerMatch ?? "not_observed";
  const validationAttemptsPerMatch = selectedValidation?.attemptsPerMatch ?? "not_observed";
  const penaltyAttemptsHeld = insideSpecificTolerance(
    penalty.penaltyAttemptsPerMatch,
    HISTORICAL_DEAD_BALL_TARGETS.penaltyAttemptsPerMatch,
    HISTORICAL_DEAD_BALL_TARGETS.penaltyAttemptsPerMatchTolerance,
  );
  const penaltyConversionHeld = insideSpecificTolerance(
    penalty.penaltyConversion,
    HISTORICAL_DEAD_BALL_TARGETS.penaltyConversion,
    HISTORICAL_DEAD_BALL_TARGETS.penaltyConversionTolerance,
  );
  const structuralFailure = worlds.length !== 14
    || calibration.worldCount !== 7
    || validation.worldCount !== 7
    || calibration.reconciliationFailureCount > 0
    || validation.reconciliationFailureCount > 0
    || selected === undefined
    || selectedValidation === undefined
    || !penaltyAttemptsHeld
    || !penaltyConversionHeld;
  const calibrationHeld = insideSpecificTolerance(
    calibrationAttemptsPerMatch,
    HISTORICAL_DEAD_BALL_TARGETS.directFreeKickAttemptsPerMatch,
    DIRECT_FREE_KICK_GEOMETRY_TOLERANCE,
  );
  const validationHeld = insideSpecificTolerance(
    validationAttemptsPerMatch,
    HISTORICAL_DEAD_BALL_TARGETS.directFreeKickAttemptsPerMatch,
    DIRECT_FREE_KICK_GEOMETRY_TOLERANCE,
  );
  return {
    decision: structuralFailure
      ? "STOP_RETHINK"
      : calibrationHeld && validationHeld
        ? "GO"
        : "REFINE",
    selectedMinimumZoneDangerBasisPoints:
      selected?.minimumZoneDangerBasisPoints ?? "not_observed",
    calibrationAttemptsPerMatch,
    validationAttemptsPerMatch,
    calibrationCandidates: calibration.candidates,
    validationCandidates: validation.candidates,
    penaltyAttemptsPerMatch: penalty.penaltyAttemptsPerMatch,
    penaltyConversion: penalty.penaltyConversion,
    reconciliationFailureCount:
      calibration.reconciliationFailureCount + validation.reconciliationFailureCount,
  };
}

/** Verifies the complete direct-shot path without relaxing carried lanes. */
export function evaluateDirectFreeKickPathCheckpoint(
  worlds: readonly AssistSupplyWorldFacts[],
  firstDivisionCompetitionId: string,
  calibrationVersions: readonly string[],
  expectedCalibrationVersion: string,
): DirectFreeKickPathCheckpointDecision {
  const deadBall = evaluateDeadBallAttributionCheckpoint(worlds, firstDivisionCompetitionId);
  const assists = evaluateAssistEligibilityCheckpoint(worlds, firstDivisionCompetitionId);
  const calibrationVersionHeld = calibrationVersions.length === worlds.length
    && calibrationVersions.every((version) => version === expectedCalibrationVersion);
  const attemptHeld = insideSpecificTolerance(
    deadBall.directFreeKickAttemptsPerMatch,
    HISTORICAL_DEAD_BALL_TARGETS.directFreeKickAttemptsPerMatch,
    HISTORICAL_DEAD_BALL_TARGETS.directFreeKickAttemptsPerMatchTolerance,
  );
  const conversionHeld = insideSpecificTolerance(
    deadBall.directFreeKickConversion,
    HISTORICAL_DEAD_BALL_TARGETS.directFreeKickConversion,
    HISTORICAL_DEAD_BALL_TARGETS.directFreeKickConversionTolerance,
  );
  const goalsHeld = insideSpecificTolerance(
    deadBall.directFreeKickGoalsPerMatch,
    HISTORICAL_DEAD_BALL_TARGETS.directFreeKickGoalsPerMatch,
    HISTORICAL_DEAD_BALL_TARGETS.directFreeKickGoalsPerMatchTolerance,
  );
  const penaltyAttemptsHeld = insideSpecificTolerance(
    deadBall.penaltyAttemptsPerMatch,
    HISTORICAL_DEAD_BALL_TARGETS.penaltyAttemptsPerMatch,
    HISTORICAL_DEAD_BALL_TARGETS.penaltyAttemptsPerMatchTolerance,
  );
  const penaltyConversionHeld = insideSpecificTolerance(
    deadBall.penaltyConversion,
    HISTORICAL_DEAD_BALL_TARGETS.penaltyConversion,
    HISTORICAL_DEAD_BALL_TARGETS.penaltyConversionTolerance,
  );
  const structuralFailure = !calibrationVersionHeld
    || deadBall.directFreeKickPath !== "implemented"
    || deadBall.reachedDirectFreeKickOutcomes.length !== PENALTY_OUTCOMES.length
    || deadBall.reconciliationFailureCount > 0
    || assists.reconciliationFailureCount > 0
    || !penaltyAttemptsHeld
    || !penaltyConversionHeld
    || !assists.nonSetPieceTargetHeld;
  const refinementOwners: ("attempt_frequency" | "conversion")[] = [];
  if (!attemptHeld) refinementOwners.push("attempt_frequency");
  if (!conversionHeld || !goalsHeld) refinementOwners.push("conversion");
  return {
    decision: structuralFailure
      ? "STOP_RETHINK"
      : refinementOwners.length === 0
        ? "GO"
        : "REFINE",
    refinementOwners,
    directFreeKickAttemptsPerMatch: deadBall.directFreeKickAttemptsPerMatch,
    directFreeKickConversion: deadBall.directFreeKickConversion,
    directFreeKickGoalsPerMatch: deadBall.directFreeKickGoalsPerMatch,
    penaltyAttemptsPerMatch: deadBall.penaltyAttemptsPerMatch,
    penaltyConversion: deadBall.penaltyConversion,
    nonSetPieceAssistedShare: assists.nonSetPieceAssistedShare,
    reachedDirectFreeKickOutcomes: deadBall.reachedDirectFreeKickOutcomes,
    calibrationVersionHeld,
    reconciliationFailureCount:
      deadBall.reconciliationFailureCount + assists.reconciliationFailureCount,
  };
}

/** The event contract makes these four shapes mutually exclusive. */
export function assistGoalKind(event: GoalEvent): AssistGoalKind {
  const hasAssist = event.assistPlayerId !== undefined;
  const hasCreator = event.creatorPlayerId !== undefined;
  if (hasAssist && hasCreator) throw new Error("Goal cannot duplicate assist and creator credit");
  if (event.shot.deadBallKind === "direct_free_kick") {
    if (hasAssist || hasCreator) throw new Error("Direct free kick cannot carry creator credit");
    return "direct_free_kick";
  }
  if (event.shot.route === undefined) {
    if (hasAssist || hasCreator) throw new Error("Route-less penalty goal cannot carry creator credit");
    return "penalty";
  }
  if (hasAssist) {
    if (event.assistPlayerId === event.scorerPlayerId) throw new Error("Scorer cannot assist himself");
    return "credited_assist";
  }
  if (hasCreator) {
    if (event.creatorPlayerId === event.scorerPlayerId) throw new Error("Scorer cannot duplicate creator credit");
    return "distinct_uncredited";
  }
  return "self_created";
}

function emptyCounts(): Record<AssistGoalKind, number> {
  return {
    penalty: 0,
    direct_free_kick: 0,
    self_created: 0,
    distinct_uncredited: 0,
    credited_assist: 0,
  };
}

function emptyPenaltyOutcomeCounts(): Record<ObservedPenaltyOutcome, number> {
  return { scored: 0, saved: 0, missed: 0 };
}

function penaltyOutcomeTotal(counts: Readonly<Record<ObservedPenaltyOutcome, number>>): number {
  return PENALTY_OUTCOMES.reduce((sum, outcome) => sum + counts[outcome], 0);
}

function pooledAssistSupplyFacts(
  worlds: readonly AssistSupplyWorldFacts[],
  competitionId: string,
): {
  readonly seasonCount: number;
  readonly counts: Record<AssistGoalKind, number>;
  readonly reconciliationFailureCount: number;
} {
  const seasons = worlds.flatMap(({ seasons }) => seasons)
    .filter((season) => season.competitionId === competitionId);
  const counts = emptyCounts();
  let reconciliationFailureCount = 0;
  for (const season of seasons) {
    reconciliationFailureCount += season.reconciliationFailureCount;
    for (const kind of ASSIST_GOAL_KINDS) counts[kind] += season.counts[kind];
  }
  return { seasonCount: seasons.length, counts, reconciliationFailureCount };
}

function directFreeKickGeometryRates(
  worlds: readonly AssistSupplyWorldFacts[],
  competitionId: string,
): {
  readonly worldCount: number;
  readonly candidates: readonly DirectFreeKickGeometryCandidateRate[];
  readonly reconciliationFailureCount: number;
} {
  const seasons = worlds.flatMap(({ seasons }) => seasons)
    .filter((season) => season.competitionId === competitionId);
  const totals = DIRECT_FREE_KICK_ZONE_CANDIDATE_BASIS_POINTS.map(
    (minimumZoneDangerBasisPoints) => ({ minimumZoneDangerBasisPoints, eligibleFoulCount: 0 }),
  );
  let fixtureCount = 0;
  let reconciliationFailureCount = 0;
  for (const season of seasons) {
    fixtureCount += season.fixtureCount;
    reconciliationFailureCount += season.reconciliationFailureCount;
    if (!candidateCountsMatchFrozenGrid(season.directFreeKickCandidateCounts)) {
      reconciliationFailureCount += 1;
      continue;
    }
    for (let index = 0; index < totals.length; index += 1) {
      const total = totals[index];
      const seasonCount = season.directFreeKickCandidateCounts[index];
      if (total !== undefined && seasonCount !== undefined) {
        total.eligibleFoulCount += seasonCount.eligibleFoulCount;
      }
    }
  }
  return {
    worldCount: worlds.length,
    candidates: totals.map((candidate) => ({
      ...candidate,
      attemptsPerMatch: ratio(candidate.eligibleFoulCount, fixtureCount),
    })),
    reconciliationFailureCount,
  };
}

function candidateCountsMatchFrozenGrid(
  candidates: readonly DirectFreeKickCandidateCount[],
): boolean {
  return candidates.length === DIRECT_FREE_KICK_ZONE_CANDIDATE_BASIS_POINTS.length
    && candidates.every((candidate, index) =>
      candidate.minimumZoneDangerBasisPoints
        === DIRECT_FREE_KICK_ZONE_CANDIDATE_BASIS_POINTS[index]
    )
    && candidateCountsAreNested(candidates);
}

function candidateCountsAreNested(candidates: readonly DirectFreeKickCandidateCount[]): boolean {
  return candidates.every((candidate, index) =>
    index === 0 || candidate.eligibleFoulCount <= (candidates[index - 1]?.eligibleFoulCount ?? -1)
  );
}

function rateDistance(value: number | "not_observed"): number {
  return value === "not_observed"
    ? Number.POSITIVE_INFINITY
    : Math.abs(value - HISTORICAL_DEAD_BALL_TARGETS.directFreeKickAttemptsPerMatch);
}

function insideTolerance(value: number | "not_observed", target: number): boolean {
  return value !== "not_observed"
    && Math.abs(value - target) <= HISTORICAL_ASSIST_SUPPLY_TARGETS.comparisonTolerance;
}

function insideSpecificTolerance(
  value: number | "not_observed",
  target: number,
  tolerance: number,
): boolean {
  return value !== "not_observed" && Math.abs(value - target) <= tolerance;
}

function ratio(numerator: number, denominator: number): number | "not_observed" {
  return denominator === 0 ? "not_observed" : numerator / denominator;
}

const DIRECT_FREE_KICK_GEOMETRY_TOLERANCE = 0.10;
