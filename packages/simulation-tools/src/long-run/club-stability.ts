/** One season row used to measure club stability in a long-run report. */
export interface LongRunClubSeasonRow {
  /** Simulated season number. */
  readonly seasonNumber: number;
  /** Stable champion club ID. */
  readonly championClubId: string;
  /** Human-readable champion club name. */
  readonly championClubName: string;
  /** Champion points. */
  readonly championPoints: number;
  /** Selected club final position. */
  readonly selectedClubPosition: number;
  /** Selected club final points. */
  readonly selectedClubPoints: number;
}

/** Club-stability report for one long-run simulation. */
export interface LongRunClubStabilityReport {
  /** Number of distinct champions across the run. */
  readonly uniqueChampionCount: number;
  /** Club name with the most titles. */
  readonly mostTitledClubName: string;
  /** Number of titles won by the most frequent champion. */
  readonly mostTitledClubTitles: number;
  /** Longest consecutive champion streak. */
  readonly longestChampionStreak: number;
  /** Average selected-club final position. */
  readonly selectedClubAveragePosition: number;
  /** Best selected-club final position. */
  readonly selectedClubBestPosition: number;
  /** Worst selected-club final position. */
  readonly selectedClubWorstPosition: number;
  /** Average selected-club points. */
  readonly selectedClubAveragePoints: number;
  /** Whether transfer turnover metrics are available in the current simulation path. */
  readonly transferTurnoverAvailable: boolean;
  /** Whether squad turnover metrics are available in the current simulation path. */
  readonly squadTurnoverAvailable: boolean;
  /** Total transfer-turnover movements across the run, when available. */
  readonly transferTurnoverCount: number;
  /** Total player exits across the run, when available. */
  readonly playerExitCount: number;
  /** Total retirement exits across the run, when available. */
  readonly retirementExitCount: number;
  /** Total release exits across the run, when available. */
  readonly releasedExitCount: number;
  /** Total career step-down exits across the run, when available. */
  readonly careerStepDownExitCount: number;
  /** Total generated intake candidates across the run, when available. */
  readonly playerIntakeCount: number;
  /** Total intake players added to club rosters across the run, when available. */
  readonly squadMaintenanceAddedCount: number;
  /** Smallest club roster size observed after refresh across the run. */
  readonly minimumSquadSizeObserved: number;
  /** Largest club roster size observed after refresh across the run. */
  readonly maximumSquadSizeObserved: number;
  /** Average club roster size observed after refresh across the run. */
  readonly averageSquadSizeObserved: number;
  /** Total club-season observations below the minimum squad-size gate. */
  readonly clubsBelowMinimumSquadSizeCount: number;
  /** Total club-season observations without a natural goalkeeper. */
  readonly clubsWithoutNaturalGoalkeeperCount: number;
  /** Total role/depth warnings emitted by squad maintenance across the run. */
  readonly roleCoverageWarningCount: number;
  /** Original season rows for report rendering and future scoring. */
  readonly seasons: readonly LongRunClubSeasonRow[];
}

/** Optional refresh totals attached to a long-run club-stability report. */
export interface LongRunRefreshTotals {
  /** Total transfer-turnover movements across the run. */
  readonly transferTurnoverCount: number;
  /** Total player exits across the run. */
  readonly playerExitCount: number;
  /** Total retirement exits across the run. */
  readonly retirementExitCount?: number;
  /** Total release exits across the run. */
  readonly releasedExitCount?: number;
  /** Total career step-down exits across the run. */
  readonly careerStepDownExitCount?: number;
  /** Total generated intake candidates across the run. */
  readonly playerIntakeCount: number;
  /** Total intake players added to club rosters across the run. */
  readonly squadMaintenanceAddedCount: number;
  /** Smallest club roster size observed after refresh across the run. */
  readonly minimumSquadSizeObserved?: number;
  /** Largest club roster size observed after refresh across the run. */
  readonly maximumSquadSizeObserved?: number;
  /** Average club roster size observed after refresh across the run. */
  readonly averageSquadSizeObserved?: number;
  /** Total club-season observations below the minimum squad-size gate. */
  readonly clubsBelowMinimumSquadSizeCount?: number;
  /** Total club-season observations without a natural goalkeeper. */
  readonly clubsWithoutNaturalGoalkeeperCount?: number;
  /** Total role/depth warnings emitted by squad maintenance across the run. */
  readonly roleCoverageWarningCount?: number;
}

/**
 * Creates club-stability metrics from completed long-run season rows.
 */
export function createLongRunClubStabilityReport(
  seasons: readonly LongRunClubSeasonRow[],
  refreshTotals?: LongRunRefreshTotals,
): LongRunClubStabilityReport {
  const titleCounts = new Map<string, { clubName: string; titles: number }>();

  for (const season of seasons) {
    const current = titleCounts.get(season.championClubId) ?? {
      clubName: season.championClubName,
      titles: 0,
    };
    titleCounts.set(season.championClubId, {
      clubName: current.clubName,
      titles: current.titles + 1,
    });
  }

  const mostTitled = mostTitledClub(titleCounts);

  return {
    uniqueChampionCount: titleCounts.size,
    mostTitledClubName: mostTitled.clubName,
    mostTitledClubTitles: mostTitled.titles,
    longestChampionStreak: longestChampionStreak(seasons),
    selectedClubAveragePosition: roundMetric(average(seasons.map((season) => season.selectedClubPosition))),
    selectedClubBestPosition: Math.min(...seasons.map((season) => season.selectedClubPosition)),
    selectedClubWorstPosition: Math.max(...seasons.map((season) => season.selectedClubPosition)),
    selectedClubAveragePoints: roundMetric(average(seasons.map((season) => season.selectedClubPoints))),
    transferTurnoverAvailable: refreshTotals !== undefined,
    squadTurnoverAvailable: refreshTotals !== undefined,
    transferTurnoverCount: refreshTotals?.transferTurnoverCount ?? 0,
    playerExitCount: refreshTotals?.playerExitCount ?? 0,
    retirementExitCount: refreshTotals?.retirementExitCount ?? 0,
    releasedExitCount: refreshTotals?.releasedExitCount ?? 0,
    careerStepDownExitCount: refreshTotals?.careerStepDownExitCount ?? 0,
    playerIntakeCount: refreshTotals?.playerIntakeCount ?? 0,
    squadMaintenanceAddedCount: refreshTotals?.squadMaintenanceAddedCount ?? 0,
    minimumSquadSizeObserved: refreshTotals?.minimumSquadSizeObserved ?? 0,
    maximumSquadSizeObserved: refreshTotals?.maximumSquadSizeObserved ?? 0,
    averageSquadSizeObserved: refreshTotals?.averageSquadSizeObserved ?? 0,
    clubsBelowMinimumSquadSizeCount: refreshTotals?.clubsBelowMinimumSquadSizeCount ?? 0,
    clubsWithoutNaturalGoalkeeperCount: refreshTotals?.clubsWithoutNaturalGoalkeeperCount ?? 0,
    roleCoverageWarningCount: refreshTotals?.roleCoverageWarningCount ?? 0,
    seasons,
  };
}

function mostTitledClub(titleCounts: ReadonlyMap<string, { readonly clubName: string; readonly titles: number }>): {
  readonly clubName: string;
  readonly titles: number;
} {
  let bestClubId = "";
  let best = { clubName: "", titles: 0 };

  for (const [clubId, row] of titleCounts) {
    if (row.titles > best.titles || (row.titles === best.titles && (bestClubId.length === 0 || clubId < bestClubId))) {
      bestClubId = clubId;
      best = row;
    }
  }

  return best;
}

function longestChampionStreak(seasons: readonly LongRunClubSeasonRow[]): number {
  let longest = 0;
  let current = 0;
  let previousChampionId: string | undefined;

  for (const season of seasons) {
    if (season.championClubId === previousChampionId) {
      current += 1;
    } else {
      current = 1;
      previousChampionId = season.championClubId;
    }

    longest = Math.max(longest, current);
  }

  return longest;
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
