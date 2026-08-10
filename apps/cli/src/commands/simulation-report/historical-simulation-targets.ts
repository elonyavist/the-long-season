/** A closed numeric interval measured from one declared historical population. */
export interface HistoricalTargetBand {
  readonly min: number;
  readonly max: number;
}

/** Historical table targets for one fictional competition level. */
export interface HistoricalDivisionTableTargets {
  readonly championPoints: HistoricalTargetBand;
  readonly lastClubPoints: HistoricalTargetBand;
  readonly pointsSpread: HistoricalTargetBand;
  readonly ppgStandardDeviation: HistoricalTargetBand;
  readonly goalsPerMatch: HistoricalTargetBand;
  readonly drawShare: HistoricalTargetBand;
}

/**
 * Frozen external targets consumed by simulation-report gates.
 *
 * Keeping all three levels here prevents a Big Five band from becoming an
 * implicit fallback for lower divisions. Values change only after a new
 * preregistered historical audit, never after a game report.
 *
 * The exact `p10..p90` values below are the only gates. Rounded bands quoted
 * in documents (for example champion `72..88`) are presentation and must never
 * be used as a second threshold.
 */
export const HISTORICAL_DIVISION_TABLE_TARGETS = {
  1: {
    championPoints: { min: 72.3842, max: 87.7158 },
    lastClubPoints: { min: 16, max: 29 },
    pointsSpread: { min: 47, max: 68 },
    ppgStandardDeviation: { min: 0.3648, max: 0.5065 },
    goalsPerMatch: { min: 2.4789, max: 3.0331 },
    drawShare: { min: 0.2184, max: 0.2924 },
  },
  2: {
    championPoints: { min: 60.8293, max: 73.6913 },
    lastClubPoints: { min: 19.8826, max: 32.5217 },
    pointsSpread: { min: 31.7615, max: 50.3348 },
    ppgStandardDeviation: { min: 0.235, max: 0.3652 },
    goalsPerMatch: { min: 2.2571, max: 2.7578 },
    drawShare: { min: 0.2383, max: 0.3293 },
  },
  3: {
    championPoints: { min: 62.087, max: 76.0526 },
    lastClubPoints: { min: 19.9565, max: 30.3043 },
    pointsSpread: { min: 37.6957, max: 54.6957 },
    ppgStandardDeviation: { min: 0.2768, max: 0.4083 },
    goalsPerMatch: { min: 2.4746, max: 2.8495 },
    drawShare: { min: 0.2391, max: 0.2868 },
  },
} as const satisfies Readonly<Record<1 | 2 | 3, HistoricalDivisionTableTargets>>;

/**
 * Frozen Big Five player-use, renewal and leader targets for level one only.
 *
 * The season-ten leader gate is a single band on the career-generated share.
 * The former `generated >= 0.30` / `opening <= 0.50` pair summed to one by
 * construction (both shares divide the same generated-plus-opening
 * denominator), so `opening <= 0.50` was equivalent to `generated >= 0.50`
 * and the `0.30` bound could never bind. Consolidating to `>= 0.50` encodes
 * the identical accept/reject region with one number; the opening share and
 * the per-origin split remain derivable diagnostics, never gates.
 *
 * The Big Five leading-scorer (`20.5..32.3`) and leading-creator (`9..18`)
 * means are deliberately absent: they are declared diagnostics, because the
 * top-ten bands below describe concentration better. They never gate.
 *
 * `appearanceShare` and `distinctUsersPerClubSeason` are new Amendment A6
 * gates with frozen formulas: total appearances over `34 x` player-seasons
 * with at least one appearance, and the mean over First-Division club-seasons
 * of distinct players actually fielded (a mid-season transfer belongs to both
 * club-seasons). Cached L5.4 fact rows enumerate only end-of-season fieldable
 * players, so both gates stay `not_evaluated` until the L6.1 fresh combined
 * arm takes their first reading; that first reading is never a regression.
 */
export const HISTORICAL_FIRST_DIVISION_PLAYER_TARGETS = {
  age33PlusStarts: { min: 12, max: 17 },
  age33PlusMinutes: { min: 1_100, max: 1_500 },
  careerGeneratedLeaderShareSeasonTen: { min: 0.5, max: 1 },
  topTenScorerMean: { min: 14.5, max: 18.5 },
  topTenAssistMean: { min: 8, max: 10.5 },
  scorerMeanAge: { min: 25.5, max: 28.5 },
  assistMeanAge: { min: 25, max: 28.5 },
  age33PlusScorerShare: { min: 0, max: 0.12 },
  age33PlusAssistShare: { min: 0, max: 0.12 },
  replicatedFormationRetentionShare: { min: 0.95, max: 1 },
  appearanceShare: { min: 0.48, max: 0.58 },
  distinctUsersPerClubSeason: { min: 26, max: 31 },
} as const satisfies Readonly<Record<string, HistoricalTargetBand>>;

/**
 * Frozen bound on early-to-late mean leader age drift, in years.
 *
 * Lives here rather than as an evaluator literal so the register owns every
 * historical player threshold. Its population differs from the Big Five
 * register above: it is measured on the integrated top-ten leaderboards of
 * all three fictional divisions, per the Amendment A4 L5 target that froze
 * the same `2.0` bound the Big Five baseline records for first-division
 * drift. Keeping it a separate export records that population difference.
 */
export const INTEGRATED_LEADER_AGE_DRIFT_TARGET = {
  min: 0,
  max: 2,
} as const satisfies HistoricalTargetBand;
