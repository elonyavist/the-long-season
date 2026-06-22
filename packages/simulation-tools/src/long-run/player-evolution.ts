/** Player snapshot row used by long-run player-evolution reports. */
export interface LongRunPlayerSnapshotRow {
  /** Stable player ID as a string so callers can keep package boundaries clean. */
  readonly playerId: string;
  /** Human-readable name used only by lab reports. */
  readonly displayName: string;
  /** Age at the snapshot date. */
  readonly age: number;
  /** Current average true ability on the 0-20 scale. */
  readonly currentAbility: number;
  /** Average remaining room between current ability and true potential. */
  readonly potentialRoom: number;
}

/** Season-level player production row used by long-run reports. */
export interface LongRunPlayerProductionRow {
  /** Simulated season number inside the long run. */
  readonly seasonNumber: number;
  /** Top scorer name for this season. */
  readonly topScorerName: string;
  /** Top scorer goal count for this season. */
  readonly topScorerGoals: number;
  /** Top assist name for this season. */
  readonly topAssistName: string;
  /** Top assist count for this season. */
  readonly topAssists: number;
  /** Club where the highest single creator share happened. */
  readonly topCreatorClubName: string;
  /** Player responsible for the highest single creator share. */
  readonly topCreatorName: string;
  /** Assists credited to the highest-share creator. */
  readonly topCreatorAssists: number;
  /** Goals scored by the highest-share creator's club. */
  readonly topCreatorClubGoals: number;
  /** Leading scorer from the same club as the highest-share creator. */
  readonly topCreatorClubTopScorerName: string;
  /** Goals scored by that same-club leading scorer. */
  readonly topCreatorClubTopScorerGoals: number;
  /** Players with at least five assists. */
  readonly assistPlayersAtLeastFive: number;
  /** Players with at least eight assists. */
  readonly assistPlayersAtLeastEight: number;
  /** Players with at least ten assists. */
  readonly assistPlayersAtLeastTen: number;
  /** Players with at least twelve assists. */
  readonly assistPlayersAtLeastTwelve: number;
  /** Highest single creator share of a club's goals in this season. */
  readonly topAssistClubGoalShare: number;
  /** Highest top-three creator share of a club's goals in this season. */
  readonly topThreeAssistClubGoalShare: number;
}

/** Input for player-evolution report generation. */
export interface CreateLongRunPlayerEvolutionReportInput {
  /** Player snapshot before long-run development starts. */
  readonly initialPlayers: readonly LongRunPlayerSnapshotRow[];
  /** Player snapshot after long-run development ends. */
  readonly finalPlayers: readonly LongRunPlayerSnapshotRow[];
  /** Season-level production summaries. */
  readonly production: readonly LongRunPlayerProductionRow[];
  /** Current-ability threshold for players considered useful beyond the lower division. */
  readonly usefulPlayerCurrentAbilityThreshold: number;
}

/** One player movement row for a long-run development report. */
export interface LongRunPlayerMovementRow {
  /** Stable player ID. */
  readonly playerId: string;
  /** Human-readable player name. */
  readonly displayName: string;
  /** Age before development. */
  readonly startAge: number;
  /** Age after development. */
  readonly endAge: number;
  /** Current-ability delta across the run. */
  readonly delta: number;
}

/** Aggregate player-evolution report for one long run. */
export interface LongRunPlayerEvolutionReport {
  /** Average current ability before development. */
  readonly startAverageCurrentAbility: number;
  /** Average current ability after development. */
  readonly endAverageCurrentAbility: number;
  /** Players whose average current ability increased. */
  readonly playersImproved: number;
  /** Players whose average current ability declined. */
  readonly playersDeclined: number;
  /** Players age 21 or under with notable potential room at the start. */
  readonly seriousProspects: number;
  /** Rare higher-upside young players at the start. */
  readonly rareProdigies: number;
  /** Initial players still above the supplied usefulness threshold at the end. */
  readonly usefulAfterLongRun: number;
  /** Final age-distribution bucket for age 21 or under. */
  readonly finalAgeUnder22: number;
  /** Final age-distribution bucket for age 22 to 29. */
  readonly finalAge22To29: number;
  /** Final age-distribution bucket for age 30 or older. */
  readonly finalAge30Plus: number;
  /** Largest positive movement rows. */
  readonly topImprovers: readonly LongRunPlayerMovementRow[];
  /** Largest negative movement rows. */
  readonly biggestDecliners: readonly LongRunPlayerMovementRow[];
  /** Per-season production rows. */
  readonly production: readonly LongRunPlayerProductionRow[];
}

/**
 * Creates player-evolution metrics from initial/final player snapshots.
 *
 * The function does not inspect hidden player entities directly. Callers decide
 * which snapshot fields are allowed in lab output and pass only those values.
 */
export function createLongRunPlayerEvolutionReport(
  input: CreateLongRunPlayerEvolutionReportInput,
): LongRunPlayerEvolutionReport {
  const finalById = new Map(input.finalPlayers.map((player) => [player.playerId, player]));
  const movements = input.initialPlayers.flatMap((initial): readonly LongRunPlayerMovementRow[] => {
    const final = finalById.get(initial.playerId);

    if (final === undefined) {
      return [];
    }

    return [
      {
        playerId: initial.playerId,
        displayName: initial.displayName,
        startAge: initial.age,
        endAge: final.age,
        delta: roundMetric(final.currentAbility - initial.currentAbility),
      },
    ];
  });

  return {
    startAverageCurrentAbility: roundMetric(average(input.initialPlayers.map((player) => player.currentAbility))),
    endAverageCurrentAbility: roundMetric(average(input.finalPlayers.map((player) => player.currentAbility))),
    playersImproved: movements.filter((movement) => movement.delta > 0).length,
    playersDeclined: movements.filter((movement) => movement.delta < 0).length,
    seriousProspects: input.initialPlayers.filter(isSeriousProspect).length,
    rareProdigies: input.initialPlayers.filter(isRareProdigy).length,
    usefulAfterLongRun: input.finalPlayers.filter((player) => player.currentAbility >= input.usefulPlayerCurrentAbilityThreshold).length,
    finalAgeUnder22: input.finalPlayers.filter((player) => player.age <= 21).length,
    finalAge22To29: input.finalPlayers.filter((player) => player.age >= 22 && player.age <= 29).length,
    finalAge30Plus: input.finalPlayers.filter((player) => player.age >= 30).length,
    topImprovers: topMovements(movements, "improver"),
    biggestDecliners: topMovements(movements, "decliner"),
    production: input.production,
  };
}

function isSeriousProspect(player: LongRunPlayerSnapshotRow): boolean {
  return player.age <= 21 && player.potentialRoom >= 2.5;
}

function isRareProdigy(player: LongRunPlayerSnapshotRow): boolean {
  return player.age <= 18 && player.currentAbility >= 9.5 && player.potentialRoom >= 4;
}

function topMovements(
  movements: readonly LongRunPlayerMovementRow[],
  mode: "improver" | "decliner",
): readonly LongRunPlayerMovementRow[] {
  const sorted = [...movements].sort((left, right) => {
    const delta = mode === "improver" ? right.delta - left.delta : left.delta - right.delta;

    if (delta !== 0) {
      return delta;
    }

    return left.playerId.localeCompare(right.playerId);
  });

  return sorted.filter((movement) => (mode === "improver" ? movement.delta > 0 : movement.delta < 0)).slice(0, 3);
}

function average(values: readonly number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function roundMetric(value: number): number {
  return Math.round(value * 100) / 100;
}
