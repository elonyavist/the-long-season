import {
  SEASON_RECAP_BANDS,
  SEASON_RECAP_CHECK_KEYS,
  SEASON_RECAP_ROLE_GROUP,
  type SeasonRecapCheckKey,
} from "@game/simulation-tools";
// `@game/domain` is not a CLI dependency: the app reaches domain contracts
// through `@game/engine`, which re-exports them.
import { FORMATION_KEYS, type FormationKey } from "@game/engine";

import type {
  SeasonRecapSeasonSummary,
  SeasonRecapWorldFailure,
  SeasonRecapWorldSummary,
} from "./season-recap-profile-world.ts";

/**
 * Aggregates inspection worlds into the one report a person reads.
 *
 * Everything here is arithmetic over facts the worlds already produced. It
 * decides nothing, tunes nothing and widens nothing: a band that fails arrives
 * here failed and leaves here failed, with the number that failed it beside it.
 */

/** How one band behaved across every simulated season. */
export interface SeasonRecapCheckAggregate {
  /** Which check this is. */
  readonly key: SeasonRecapCheckKey;
  /** Seasons that sat inside the band. */
  readonly passCount: number;
  /** Seasons that did not. */
  readonly failCount: number;
  /** Smallest observed value. */
  readonly min: number;
  /** Mean observed value. */
  readonly mean: number;
  /** Largest observed value. */
  readonly max: number;
}

/** One shape's record across every simulated season. */
export interface SeasonRecapShapeAggregate {
  /** Formation as fielded. */
  readonly formation: FormationKey;
  /** Club-seasons lined up in it. */
  readonly clubSeasons: number;
  /** Mean league points of those club-seasons. */
  readonly meanPoints: number;
}

/** Mean squad-quality trace at one season number, across worlds. */
export interface SeasonRecapAbilityAggregate {
  /** One-based season number. */
  readonly seasonNumber: number;
  /** Mean top-club average ability at that season. */
  readonly meanTopClubAbility: number;
  /** Mean bottom-club average ability at that season. */
  readonly meanBottomClubAbility: number;
  /** Mean top-to-bottom spread at that season. */
  readonly meanAbilitySpread: number;
  /** Mean share of senior players still present from season one. */
  readonly meanOriginalPlayerShare: number;
}

/** The population one inspection run was measured over. */
export interface SeasonRecapPopulation {
  /** Seed prefix every world seed was derived from. */
  readonly seedPrefix: string;
  /** Worlds asked for. */
  readonly requestedWorldCount: number;
  /** Worlds that reached the end and entered the charts. */
  readonly worldCount: number;
  /** Seasons asked for per world. */
  readonly seasonCount: number;
  /** Seasons that entered the charts. */
  readonly totalSeasons: number;
  /** Clubs in the observed competition. */
  readonly clubCount: number;
}

/** Everything the aggregate report states. */
export interface SeasonRecapProfileFacts {
  /** What was run. */
  readonly population: SeasonRecapPopulation;
  /** Every band, aggregated. */
  readonly checks: readonly SeasonRecapCheckAggregate[];
  /** Bands that failed at least one season. */
  readonly failedCheckKeys: readonly SeasonRecapCheckKey[];
  /** Shapes fielded, in canonical catalog order. */
  readonly shapes: readonly SeasonRecapShapeAggregate[];
  /** Distinct clubs that won a title. */
  readonly distinctChampions: number;
  /** Distinct shapes fielded anywhere in the run. */
  readonly distinctFormations: number;
  /** Squad-quality trace by season number. */
  readonly abilityTrace: readonly SeasonRecapAbilityAggregate[];
  /** Worlds that stopped before the end, and why. */
  readonly failures: readonly SeasonRecapWorldFailure[];
  /** Senior players by canonical role, totalled across every world's opening. */
  readonly openingRoleCounts: readonly SeasonRecapRoleCount[];
}

/** How many players one canonical role has, and how often charts show it. */
export interface SeasonRecapRoleCount {
  /** Canonical player role. */
  readonly role: string;
  /** Senior players holding it across every world's opening. */
  readonly players: number;
  /** Share of the whole senior population. */
  readonly playerShare: number;
  /** Rows this role holds in the scorer charts. */
  readonly scorerRows: number;
  /** Rows this role holds in the assist charts. */
  readonly assistRows: number;
}

/**
 * Builds the aggregate report from every simulated world.
 *
 * @example
 * createSeasonRecapProfileFacts({ seedPrefix: "probe", seasonCount: 5, worlds });
 */
export function createSeasonRecapProfileFacts(input: {
  readonly seedPrefix: string;
  readonly seasonCount: number;
  readonly worlds: readonly SeasonRecapWorldSummary[];
  readonly failures?: readonly SeasonRecapWorldFailure[];
}): SeasonRecapProfileFacts {
  const seasons = input.worlds.flatMap((world) => world.seasons);
  const failures = input.failures ?? [];

  if (seasons.length === 0) {
    throw new Error("Season recap report needs at least one simulated season");
  }

  const checks = SEASON_RECAP_CHECK_KEYS.map((key) => aggregateCheck(key, seasons));

  return {
    population: {
      seedPrefix: input.seedPrefix,
      requestedWorldCount: input.worlds.length + failures.length,
      worldCount: input.worlds.length,
      seasonCount: input.seasonCount,
      totalSeasons: seasons.length,
      clubCount: input.worlds[0]?.clubCount ?? 0,
    },
    failures,
    checks,
    failedCheckKeys: checks.filter((check) => check.failCount > 0).map((check) => check.key),
    shapes: aggregateShapes(seasons),
    distinctChampions: new Set(
      seasons.flatMap((season) => season.recap.table[0]?.clubName ?? []),
    ).size,
    distinctFormations: new Set(
      seasons.flatMap((season) => season.recap.shapes.map((shape) => shape.formation)),
    ).size,
    abilityTrace: aggregateAbilityTrace(input.worlds),
    openingRoleCounts: aggregateRoleCounts(input.worlds, seasons),
  };
}

/**
 * Puts each role's population beside the chart rows it actually holds.
 *
 * Separates two answers that look identical in a chart: a role the engine never
 * gives the ball to, and a role the world never generates.
 *
 * The row set is **every canonical role**, taken from `SEASON_RECAP_ROLE_GROUP`,
 * not the roles that happen to appear. A role absent from the squads *and* from
 * both charts is the strongest form of this finding, and building the table from
 * what was observed would delete exactly that row. An all-zero line is the
 * result; a missing line is silence pretending to be one.
 */
function aggregateRoleCounts(
  worlds: readonly SeasonRecapWorldSummary[],
  seasons: readonly SeasonRecapSeasonSummary[],
): readonly SeasonRecapRoleCount[] {
  const players = new Map<string, number>();
  const scorers = new Map<string, number>();
  const assists = new Map<string, number>();

  for (const world of worlds) {
    for (const [role, count] of Object.entries(world.openingRoleCounts)) {
      players.set(role, (players.get(role) ?? 0) + count);
    }
  }
  for (const season of seasons) {
    for (const row of season.recap.topScorers) {
      scorers.set(row.role, (scorers.get(row.role) ?? 0) + 1);
    }
    for (const row of season.recap.topAssists) {
      assists.set(row.role, (assists.get(row.role) ?? 0) + 1);
    }
  }

  const total = [...players.values()].reduce((sum, value) => sum + value, 0);
  const roles = [...new Set([
    ...Object.keys(SEASON_RECAP_ROLE_GROUP),
    ...players.keys(),
    ...scorers.keys(),
    ...assists.keys(),
  ])].sort();

  return roles.map((role) => ({
    role,
    players: players.get(role) ?? 0,
    playerShare: total === 0 ? 0 : round((players.get(role) ?? 0) / total),
    scorerRows: scorers.get(role) ?? 0,
    assistRows: assists.get(role) ?? 0,
  }));
}

/**
 * Collapses one band's per-season verdicts into a single row.
 *
 * A season that carries no verdict for a declared band is refused rather than
 * skipped. `Math.min` of nothing is `Infinity`, so a silently missing check
 * would print as an observed value of `Infinity` in the report table - which
 * reads as a spectacular failure when the truth is that nothing was measured.
 */
function aggregateCheck(
  key: SeasonRecapCheckKey,
  seasons: readonly SeasonRecapSeasonSummary[],
): SeasonRecapCheckAggregate {
  const observed = seasons.map((season) => {
    const check = season.gates.checks.find((candidate) => candidate.key === key);

    if (check === undefined) {
      throw new Error(
        `Season ${season.seasonSeed} carries no verdict for declared band ${key}`,
      );
    }

    return check;
  });

  return {
    key,
    passCount: observed.filter((check) => check.verdict === "pass").length,
    failCount: observed.filter((check) => check.verdict === "fail").length,
    min: Math.min(...observed.map((check) => check.observed)),
    mean: mean(observed.map((check) => check.observed)),
    max: Math.max(...observed.map((check) => check.observed)),
  };
}

/**
 * Totals every shape's club-seasons and the points those clubs averaged.
 *
 * Weighted by club-seasons rather than by season, because a shape fielded by
 * six clubs in one season and one club in the next is not two equal samples.
 */
function aggregateShapes(
  seasons: readonly SeasonRecapSeasonSummary[],
): readonly SeasonRecapShapeAggregate[] {
  const clubSeasons = new Map<FormationKey, number>();
  const pointTotals = new Map<FormationKey, number>();

  for (const season of seasons) {
    for (const shape of season.recap.shapes) {
      clubSeasons.set(shape.formation, (clubSeasons.get(shape.formation) ?? 0) + shape.clubCount);
      pointTotals.set(
        shape.formation,
        (pointTotals.get(shape.formation) ?? 0) + shape.meanPoints * shape.clubCount,
      );
    }
  }

  return FORMATION_KEYS.flatMap((formation): readonly SeasonRecapShapeAggregate[] => {
    const count = clubSeasons.get(formation);
    if (count === undefined || count === 0) return [];

    return [{
      formation,
      clubSeasons: count,
      meanPoints: round((pointTotals.get(formation) ?? 0) / count),
    }];
  });
}

/** Averages the squad-quality trace across worlds, season number by season number. */
function aggregateAbilityTrace(
  worlds: readonly SeasonRecapWorldSummary[],
): readonly SeasonRecapAbilityAggregate[] {
  const bySeason = new Map<number, {
    top: number[];
    bottom: number[];
    spread: number[];
    original: number[];
  }>();

  for (const world of worlds) {
    for (const row of world.abilityTrace) {
      const bucket = bySeason.get(row.seasonNumber)
        ?? { top: [], bottom: [], spread: [], original: [] };
      bucket.top.push(row.topClubAbility);
      bucket.bottom.push(row.bottomClubAbility);
      bucket.spread.push(row.abilitySpread);
      bucket.original.push(row.originalPlayerShare);
      bySeason.set(row.seasonNumber, bucket);
    }
  }

  return [...bySeason.entries()]
    .sort(([left], [right]) => left - right)
    .map(([seasonNumber, bucket]) => ({
      seasonNumber,
      meanTopClubAbility: mean(bucket.top),
      meanBottomClubAbility: mean(bucket.bottom),
      meanAbilitySpread: mean(bucket.spread),
      meanOriginalPlayerShare: mean(bucket.original),
    }));
}

/** Mean of a non-empty list, rounded for stable report text. */
function mean(values: readonly number[]): number {
  if (values.length === 0) return 0;

  return round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

/** Three decimals, which is the resolution every band is declared at. */
function round(value: number): number {
  return Number.isFinite(value) ? Math.round(value * 1000) / 1000 : value;
}
