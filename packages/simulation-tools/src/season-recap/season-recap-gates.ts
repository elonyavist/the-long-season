import type { SeasonRecap, SeasonRecapPlayerRow } from "./season-recap.ts";
import { isCreatorRole, SEASON_RECAP_ROLE_GROUP } from "./season-recap.ts";

/**
 * One thing this instrument checks about a season.
 *
 * The set is closed. Every entry has a band declared in
 * `docs/audits/PHASE_81_SEASON_RECAP_DESIGN.md` before any output was seen, and
 * a band that fails is a finding rather than a number to widen.
 */
export type SeasonRecapCheckKey =
  | "champion_points_per_match"
  | "bottom_points_per_match"
  | "points_spread_per_match"
  | "top_scorer_goals_per_match"
  | "top_assists_per_match"
  | "goals_per_match"
  | "home_win_share"
  | "draw_share"
  | "finishers_in_top_scorers"
  | "goalkeepers_in_top_scorers"
  | "centre_backs_in_top_scorers"
  | "creators_in_top_assists"
  | "distinct_formations"
  | "impossible_values";

/** Deterministic check order used by reports and by every iteration. */
export const SEASON_RECAP_CHECK_KEYS = [
  "champion_points_per_match",
  "bottom_points_per_match",
  "points_spread_per_match",
  "top_scorer_goals_per_match",
  "top_assists_per_match",
  "goals_per_match",
  "home_win_share",
  "draw_share",
  "finishers_in_top_scorers",
  "goalkeepers_in_top_scorers",
  "centre_backs_in_top_scorers",
  "creators_in_top_assists",
  "distinct_formations",
  "impossible_values",
] as const satisfies readonly SeasonRecapCheckKey[];

/** An inclusive band one observed value has to sit inside. */
export interface SeasonRecapBand {
  /** Lowest acceptable value, inclusive. */
  readonly min: number;
  /** Highest acceptable value, inclusive. */
  readonly max: number;
}

/**
 * The frozen bands, with the football each one comes from.
 *
 * Rates are **per match played**, so a league system with a different club
 * count cannot silently move them. The reference throughout is one full
 * domestic season in a top European league, which is the football this engine
 * is imitating - `38` matches in the notes below.
 *
 * These were written before the instrument produced anything. Changing one
 * takes the same kind of decision as changing a `TACTICAL_SHAPE_THRESHOLDS`
 * value: a recorded amendment, never a quiet widening because a run failed.
 */
export const SEASON_RECAP_BANDS = {
  /** `74 - 100` points over `38`. */
  champion_points_per_match: { min: 1.95, max: 2.65 },
  /** Relegation is possible; total collapse is not routine. */
  bottom_points_per_match: { min: 0.35, max: 0.8 },
  /** A league, not a lottery and not a procession. */
  points_spread_per_match: { min: 1.25, max: 2.05 },
  /** `18 - 36` goals over `38`. */
  top_scorer_goals_per_match: { min: 0.45, max: 0.95 },
  /** `8 - 19` assists over `38`. */
  top_assists_per_match: { min: 0.2, max: 0.5 },
  /** The carried A7 monitor's own football range. */
  goals_per_match: { min: 2.3, max: 3.1 },
  /** Home advantage exists and does not decide everything. */
  home_win_share: { min: 0.38, max: 0.52 },
  /** Draws are common and not dominant. */
  draw_share: { min: 0.18, max: 0.32 },
  /** Strikers, wingers and attacking midfielders should lead a scorer chart. */
  finishers_in_top_scorers: { min: 0.6, max: 1 },
  /** A goalkeeper in a scoring chart is not a rarity, it is a defect. */
  goalkeepers_in_top_scorers: { min: 0, max: 0 },
  /** One set-piece centre back is football; two is a model problem. */
  centre_backs_in_top_scorers: { min: 0, max: 1 },
  /** Midfielders and wide players should lead an assist chart. */
  creators_in_top_assists: { min: 0.55, max: 1 },
  /** A league where everybody plays one shape is not a league. */
  distinct_formations: { min: 5, max: Number.POSITIVE_INFINITY },
  /** Absolute. Any negative, fractional or non-finite count is a broken season. */
  impossible_values: { min: 0, max: 0 },
} as const satisfies Readonly<Record<SeasonRecapCheckKey, SeasonRecapBand>>;

/** One evaluated check, carrying the number so a report can show what failed. */
export interface SeasonRecapCheck {
  /** Which check this is. */
  readonly key: SeasonRecapCheckKey;
  /** What the season actually produced. */
  readonly observed: number;
  /** The band it was measured against. */
  readonly band: SeasonRecapBand;
  /** Whether it sits inside. */
  readonly verdict: "pass" | "fail";
}

/** Every check for one season, in the frozen order. */
export interface SeasonRecapGateResult {
  /** Ordered checks. */
  readonly checks: readonly SeasonRecapCheck[];
  /** Keys that failed, in the same order. */
  readonly failed: readonly SeasonRecapCheckKey[];
}

/**
 * Measures one season's recap against the frozen bands.
 *
 * Every check returns its observed number whether it passed or not, because a
 * report that only says "fail" sends the reader back to the raw data to find
 * out how badly - and a report nobody can act on is the same as no report.
 *
 * Rates divide by matches played rather than using absolutes, so a league with
 * a different number of clubs is judged by the same football rather than by
 * arithmetic that happens to suit twenty teams.
 *
 * @example
 * const gates = evaluateSeasonRecapGates(recap);
 * gates.failed; // ["distinct_formations"] while every club is set up the same
 */
export function evaluateSeasonRecapGates(recap: SeasonRecap): SeasonRecapGateResult {
  const { facts } = recap;
  const perMatch = (value: number): number =>
    facts.matchesPerClub === 0 ? 0 : value / facts.matchesPerClub;
  const observed: Readonly<Record<SeasonRecapCheckKey, number>> = {
    champion_points_per_match: perMatch(facts.championPoints),
    bottom_points_per_match: perMatch(facts.bottomPoints),
    points_spread_per_match: perMatch(facts.pointsSpread),
    top_scorer_goals_per_match: perMatch(facts.topScorerGoals),
    top_assists_per_match: perMatch(facts.topAssistCount),
    goals_per_match: facts.goalsPerMatch,
    home_win_share: facts.homeWinShare,
    draw_share: facts.drawShare,
    finishers_in_top_scorers: shareOf(recap.topScorers, (row) => row.roleGroup === "finisher"),
    goalkeepers_in_top_scorers: countOf(recap.topScorers, (row) => row.role === "goalkeeper"),
    centre_backs_in_top_scorers: countOf(recap.topScorers, (row) => row.role === "center_back"),
    creators_in_top_assists: shareOf(recap.topAssists, (row) => isCreatorRole(row.role)),
    distinct_formations: facts.distinctFormations,
    impossible_values: countImpossibleValues(recap),
  };
  const checks = SEASON_RECAP_CHECK_KEYS.map((key): SeasonRecapCheck => {
    const band = SEASON_RECAP_BANDS[key];
    const value = observed[key];

    return {
      key,
      observed: value,
      band,
      verdict: Number.isFinite(value) && value >= band.min && value <= band.max ? "pass" : "fail",
    };
  });

  return {
    checks,
    failed: checks.filter((check) => check.verdict === "fail").map((check) => check.key),
  };
}

/**
 * Share of a chart matching one predicate.
 *
 * An empty chart returns `0`, which fails every share band on purpose: a season
 * where nobody scored is not a season that passed the scoring checks.
 */
function shareOf(
  rows: readonly SeasonRecapPlayerRow[],
  matches: (row: SeasonRecapPlayerRow) => boolean,
): number {
  return rows.length === 0 ? 0 : rows.filter(matches).length / rows.length;
}

/** Count of a chart matching one predicate. */
function countOf(
  rows: readonly SeasonRecapPlayerRow[],
  matches: (row: SeasonRecapPlayerRow) => boolean,
): number {
  return rows.filter(matches).length;
}

/**
 * Counts values a real season cannot produce.
 *
 * Deliberately blunt: negative goals, fractional appearances, a table position
 * that is not a whole number, anything non-finite. This is the check that
 * catches a defect the football bands would report as merely unusual.
 */
function countImpossibleValues(recap: SeasonRecap): number {
  const counts = [
    ...recap.table.flatMap((row) => [
      row.position,
      row.played,
      row.wins,
      row.draws,
      row.losses,
      row.goalsFor,
      row.goalsAgainst,
      row.points,
    ]),
    ...recap.topScorers.flatMap((row) => [row.goals, row.assists, row.appearances]),
    ...recap.topAssists.flatMap((row) => [row.goals, row.assists, row.appearances]),
    ...recap.shapes.map((row) => row.clubCount),
  ];
  const rates = [
    recap.facts.goalsPerMatch,
    recap.facts.homeWinShare,
    recap.facts.drawShare,
    ...recap.shapes.map((row) => row.meanPoints),
  ];

  return counts.filter((value) => !Number.isInteger(value) || value < 0).length
    + rates.filter((value) => !Number.isFinite(value) || value < 0).length;
}

/** Roles that never appear in the creator group, kept for report copy. */
export const SEASON_RECAP_ANCHOR_ROLES = Object.entries(SEASON_RECAP_ROLE_GROUP)
  .filter(([, group]) => group === "anchor")
  .map(([role]) => role)
  .toSorted();
