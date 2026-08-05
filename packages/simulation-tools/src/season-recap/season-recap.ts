import {
  FORMATION_KEYS,
  type ClubId,
  type Fixture,
  type FormationKey,
  type LeagueTableRow,
  type Player,
  type PlayerId,
  type PlayerRole,
} from "@game/domain";
import type { SimulateSeasonResult } from "@game/engine";

/**
 * Coarse football grouping used by the role bands, over the canonical roles.
 *
 * `finisher` is who is supposed to be scoring; `creator` is who is supposed to
 * be assisting. `anchor` is everyone else - keepers and centre backs - and it
 * exists so the mapping below can be total rather than a default.
 */
export type SeasonRecapRoleGroup = "finisher" | "creator" | "anchor";

/**
 * Which group each canonical role belongs to.
 *
 * Declared with `satisfies` over the whole union, so a new `PlayerRole` fails
 * the build here instead of quietly landing in whichever group a fallback
 * happened to pick.
 *
 * `striker` is a finisher and deliberately not a creator: forwards do assist,
 * but a top-ten assist chart led by them is not the football this engine is
 * imitating, and a creator group generous enough to include everyone would only
 * ever catch a goalkeeper - which the scorer bands already do.
 */
export const SEASON_RECAP_ROLE_GROUP = {
  goalkeeper: "anchor",
  center_back: "anchor",
  full_back: "creator",
  wing_back: "creator",
  defensive_midfielder: "creator",
  central_midfielder: "creator",
  attacking_midfielder: "finisher",
  wide_midfielder: "creator",
  winger: "finisher",
  striker: "finisher",
} as const satisfies Readonly<Record<PlayerRole, SeasonRecapRoleGroup>>;

/**
 * Whether each role is expected to be creating chances for others.
 *
 * A second total mapping rather than something derived from the group above,
 * because the two answer different questions and a single taxonomy cannot hold
 * both. `winger` and `attacking_midfielder` finish *and* create; `striker`
 * finishes and is deliberately not counted as a creator. Deriving one from the
 * other swept the striker in, which is the defect this pair replaced.
 */
export const SEASON_RECAP_CREATOR_ROLE = {
  goalkeeper: false,
  center_back: false,
  full_back: true,
  wing_back: true,
  defensive_midfielder: true,
  central_midfielder: true,
  attacking_midfielder: true,
  wide_midfielder: true,
  winger: true,
  striker: false,
} as const satisfies Readonly<Record<PlayerRole, boolean>>;

/** How many rows each player chart carries. */
export const SEASON_RECAP_CHART_SIZE = 10;

/** One league-table row with the club named. */
export interface SeasonRecapTableRow extends LeagueTableRow {
  /** Display name, so a reader is not decoding club identifiers. */
  readonly clubName: string;
}

/** One row of the scorer or assist chart. */
export interface SeasonRecapPlayerRow {
  /** Player the row is about. */
  readonly playerId: PlayerId;
  /** Display name. */
  readonly playerName: string;
  /** Club the player's season facts were recorded against. */
  readonly clubId: ClubId;
  /** Display name of that club. */
  readonly clubName: string;
  /** Canonical role, which is what makes the chart a credibility test. */
  readonly role: PlayerRole;
  /** Coarse group the role belongs to. */
  readonly roleGroup: SeasonRecapRoleGroup;
  /** Goals across the season. */
  readonly goals: number;
  /** Assists across the season. */
  readonly assists: number;
  /** Fixtures the player appeared in, started or from the bench. */
  readonly appearances: number;
}

/** One shape and how the clubs using it finished. */
export interface SeasonRecapShapeRow {
  /** Formation as set up for the clubs that used it. */
  readonly formation: FormationKey;
  /** How many clubs lined up in it. */
  readonly clubCount: number;
  /** Mean league points of those clubs. */
  readonly meanPoints: number;
}

/** Season-level facts the bands read, all derived from the charts' own sources. */
export interface SeasonRecapFacts {
  /** Fixtures each club played, taken from the table itself. */
  readonly matchesPerClub: number;
  /** Played fixtures in the season. */
  readonly playedFixtures: number;
  /** Goals per played fixture. */
  readonly goalsPerMatch: number;
  /** Share of played fixtures won by the home club. */
  readonly homeWinShare: number;
  /** Share of played fixtures drawn. */
  readonly drawShare: number;
  /** Points of the club that finished first. */
  readonly championPoints: number;
  /** Points of the club that finished last. */
  readonly bottomPoints: number;
  /** Points between first and last. */
  readonly pointsSpread: number;
  /** Goals of the leading scorer, `0` when nobody scored. */
  readonly topScorerGoals: number;
  /** Assists of the leading creator, `0` when nobody assisted. */
  readonly topAssistCount: number;
  /** Distinct formations the clubs were set up in. */
  readonly distinctFormations: number;
}

/** One season, printed as football. */
export interface SeasonRecap {
  /** Final league table, already in position order. */
  readonly table: readonly SeasonRecapTableRow[];
  /** Leading scorers, longest chart first. */
  readonly topScorers: readonly SeasonRecapPlayerRow[];
  /** Leading creators. */
  readonly topAssists: readonly SeasonRecapPlayerRow[];
  /** Shapes fielded, in canonical catalog order. */
  readonly shapes: readonly SeasonRecapShapeRow[];
  /** Derived season facts the bands read. */
  readonly facts: SeasonRecapFacts;
}

/** Minimal player facts the recap needs; the full entity is not required. */
export type SeasonRecapPlayer = Pick<Player, "firstName" | "lastName"> & {
  readonly primaryRole?: PlayerRole;
};

/** Input for building one season recap from facts that already exist. */
export interface BuildSeasonRecapInput {
  /** The season result the simulation already produced. */
  readonly season: Pick<
    SimulateSeasonResult,
    "table" | "playerSummaryStats" | "fixtureParticipation" | "fixtures"
  >;
  /** Player lookup covering everyone who appears in the season stats. */
  readonly players: Readonly<Record<PlayerId, SeasonRecapPlayer>>;
  /** Club display names. */
  readonly clubNames: Readonly<Record<ClubId, string>>;
  /**
   * Formation each club was set up in.
   *
   * Supplied rather than discovered, because `simulateSeason(...)` takes the
   * shape as an input and deliberately holds it still - it is the instrument
   * that keeps a shape and a tactic fixed in order to measure one of them. A
   * runner that gives every club the same formation gets a one-row shape chart,
   * which is a true report of what it asked for.
   */
  readonly formationByClubId: Readonly<Record<ClubId, FormationKey>>;
}

/** Error categories exposed by season-recap construction. */
export type SeasonRecapErrorCode = "empty_table" | "unknown_player" | "unknown_club";

/**
 * Typed error thrown when a season cannot be turned into a readable recap.
 *
 * @example
 * if (error instanceof SeasonRecapError && error.code === "unknown_player") {
 *   // The caller's player lookup does not cover the season's own stats.
 * }
 */
export class SeasonRecapError extends Error {
  /** Machine-readable failure reason. */
  public readonly code: SeasonRecapErrorCode;

  /** Creates a season-recap error. */
  public constructor(code: SeasonRecapErrorCode, message: string) {
    super(message);
    this.name = "SeasonRecapError";
    this.code = code;
  }
}

/**
 * Turns one simulated season into the four charts a person can read.
 *
 * It computes no football. Every number here is already in the season result:
 * the table, the per-player goals and assists, the fixture participation that
 * says who actually appeared, and the fixtures that say who was at home. What
 * this adds is names, roles, ordering and the season-level rates the bands read.
 *
 * The roles are the point. An aggregate goal rate reads the same whether
 * strikers or centre backs scored, and a chart with a role column does not.
 *
 * Determinism: every chart is sorted with an explicit total order ending in the
 * player or club identifier, so two identical seasons cannot print two
 * different charts.
 *
 * @example
 * const recap = buildSeasonRecap({ season, players, clubNames, formationByClubId });
 * recap.topScorers[0]?.role; // "striker", one hopes
 */
export function buildSeasonRecap(input: BuildSeasonRecapInput): SeasonRecap {
  if (input.season.table.length === 0) {
    throw new SeasonRecapError("empty_table", "A season with no league table has no recap");
  }

  const appearances = countAppearances(input.season.fixtureParticipation);
  const rows = input.season.playerSummaryStats.map((stat) =>
    playerRow(stat, input, appearances.get(stat.playerId) ?? 0),
  );
  const table = input.season.table.map((row): SeasonRecapTableRow => ({
    ...row,
    clubName: clubName(input, row.clubId),
  }));

  const topScorers = rows
    .filter((row) => row.goals > 0)
    .toSorted(byGoals)
    .slice(0, SEASON_RECAP_CHART_SIZE);
  const topAssists = rows
    .filter((row) => row.assists > 0)
    .toSorted(byAssists)
    .slice(0, SEASON_RECAP_CHART_SIZE);

  return {
    table,
    topScorers,
    topAssists,
    shapes: shapeRows(table, input.formationByClubId),
    facts: seasonFacts(table, input.season.fixtures, topScorers, topAssists, input.formationByClubId),
  };
}

/** Counts the fixtures each player actually appeared in. */
function countAppearances(
  participation: BuildSeasonRecapInput["season"]["fixtureParticipation"],
): ReadonlyMap<PlayerId, number> {
  const appearances = new Map<PlayerId, number>();

  for (const fixture of participation) {
    for (const contribution of fixture.contributions) {
      if (!contribution.started && !contribution.substituteAppearance) continue;

      appearances.set(contribution.playerId, (appearances.get(contribution.playerId) ?? 0) + 1);
    }
  }

  return appearances;
}

/** Builds one chart row, joining the season stat to the player's identity. */
function playerRow(
  stat: SimulateSeasonResult["playerSummaryStats"][number],
  input: BuildSeasonRecapInput,
  appearances: number,
): SeasonRecapPlayerRow {
  const player = input.players[stat.playerId];

  if (player === undefined) {
    throw new SeasonRecapError(
      "unknown_player",
      `Season statistics name a player the lookup does not cover: ${stat.playerId}`,
    );
  }

  // A generated player always carries a primary role. Treating an absent one as
  // an anchor would quietly park it in the group the bands are least likely to
  // notice, so it is refused instead.
  if (player.primaryRole === undefined) {
    throw new SeasonRecapError(
      "unknown_player",
      `Season recap needs a canonical role for player: ${stat.playerId}`,
    );
  }

  return {
    playerId: stat.playerId,
    playerName: `${player.firstName} ${player.lastName}`,
    clubId: stat.clubId,
    clubName: clubName(input, stat.clubId),
    role: player.primaryRole,
    roleGroup: SEASON_RECAP_ROLE_GROUP[player.primaryRole],
    goals: stat.goals,
    assists: stat.assists,
    appearances,
  };
}

/** Resolves one club's display name, refusing an identifier it does not know. */
function clubName(input: BuildSeasonRecapInput, clubId: ClubId): string {
  const name = input.clubNames[clubId];

  if (name === undefined) {
    throw new SeasonRecapError("unknown_club", `Season facts name an unknown club: ${clubId}`);
  }

  return name;
}

/** Groups the table by the shape each club was set up in. */
function shapeRows(
  table: readonly SeasonRecapTableRow[],
  formationByClubId: BuildSeasonRecapInput["formationByClubId"],
): readonly SeasonRecapShapeRow[] {
  const totals = new Map<FormationKey, { clubCount: number; points: number }>();

  for (const row of table) {
    const formation = formationByClubId[row.clubId];

    if (formation === undefined) continue;

    const seen = totals.get(formation) ?? { clubCount: 0, points: 0 };
    totals.set(formation, { clubCount: seen.clubCount + 1, points: seen.points + row.points });
  }

  // Canonical catalog order, never map insertion order, so the chart cannot
  // reorder because a different club happened to finish first.
  return FORMATION_KEYS.flatMap((formation): readonly SeasonRecapShapeRow[] => {
    const seen = totals.get(formation);

    return seen === undefined
      ? []
      : [{ formation, clubCount: seen.clubCount, meanPoints: seen.points / seen.clubCount }];
  });
}

/** Derives the season-level rates the bands read. */
function seasonFacts(
  table: readonly SeasonRecapTableRow[],
  fixtures: readonly Fixture[],
  topScorers: readonly SeasonRecapPlayerRow[],
  topAssists: readonly SeasonRecapPlayerRow[],
  formationByClubId: BuildSeasonRecapInput["formationByClubId"],
): SeasonRecapFacts {
  const champion = table[0] as SeasonRecapTableRow;
  const bottom = table[table.length - 1] as SeasonRecapTableRow;
  const played = fixtures.filter((fixture) => fixture.result !== undefined);
  const goals = played.reduce(
    (total, fixture) => total + (fixture.result?.homeGoals ?? 0) + (fixture.result?.awayGoals ?? 0),
    0,
  );
  const homeWins = played.filter(
    (fixture) => (fixture.result?.homeGoals ?? 0) > (fixture.result?.awayGoals ?? 0),
  ).length;
  const draws = played.filter(
    (fixture) => (fixture.result?.homeGoals ?? 0) === (fixture.result?.awayGoals ?? 0),
  ).length;
  const distinctFormations = new Set(
    table.flatMap((row) => {
      const formation = formationByClubId[row.clubId];
      return formation === undefined ? [] : [formation];
    }),
  ).size;

  return {
    matchesPerClub: champion.played,
    playedFixtures: played.length,
    goalsPerMatch: played.length === 0 ? 0 : goals / played.length,
    homeWinShare: played.length === 0 ? 0 : homeWins / played.length,
    drawShare: played.length === 0 ? 0 : draws / played.length,
    championPoints: champion.points,
    bottomPoints: bottom.points,
    pointsSpread: champion.points - bottom.points,
    topScorerGoals: topScorers[0]?.goals ?? 0,
    topAssistCount: topAssists[0]?.assists ?? 0,
    distinctFormations,
  };
}

/** Whether a role is expected to be creating chances for others. */
export function isCreatorRole(role: PlayerRole): boolean {
  return SEASON_RECAP_CREATOR_ROLE[role];
}

/** Goals, then assists, then a stable identifier. */
function byGoals(first: SeasonRecapPlayerRow, second: SeasonRecapPlayerRow): number {
  return second.goals - first.goals
    || second.assists - first.assists
    || first.playerId.localeCompare(second.playerId);
}

/** Assists, then goals, then a stable identifier. */
function byAssists(first: SeasonRecapPlayerRow, second: SeasonRecapPlayerRow): number {
  return second.assists - first.assists
    || second.goals - first.goals
    || first.playerId.localeCompare(second.playerId);
}
