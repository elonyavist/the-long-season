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
  /** Original season rows for report rendering and future scoring. */
  readonly seasons: readonly LongRunClubSeasonRow[];
}

/**
 * Creates club-stability metrics from completed long-run season rows.
 */
export function createLongRunClubStabilityReport(
  seasons: readonly LongRunClubSeasonRow[],
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
    transferTurnoverAvailable: false,
    squadTurnoverAvailable: false,
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
