import { describe, expect, it } from "vitest";
import type { ClubId, FormationKey, PlayerId, PlayerRole } from "@game/domain";

import {
  evaluateSeasonRecapGates,
  SEASON_RECAP_BANDS,
  SEASON_RECAP_CHECK_KEYS,
  type SeasonRecapCheckKey,
} from "./season-recap-gates.ts";
import {
  SEASON_RECAP_ROLE_GROUP,
  isCreatorRole,
  type SeasonRecap,
  type SeasonRecapFacts,
  type SeasonRecapPlayerRow,
  type SeasonRecapShapeRow,
  type SeasonRecapTableRow,
} from "./season-recap.ts";

const MATCHES = 10;

/**
 * A season that passes every band, built from the football the bands describe.
 *
 * Ten matches a club: champion `22` points is `2.2` a match, bottom `5` is
 * `0.5`, the spread `17` is `1.7`. The leading scorer's `7` is `0.7` a match
 * and the leading creator's `3` is `0.3`.
 */
function healthyRecap(overrides: Partial<SeasonRecap> = {}): SeasonRecap {
  const scorers = chartRows([
    "striker",
    "striker",
    "winger",
    "winger",
    "attacking_midfielder",
    "attacking_midfielder",
    "central_midfielder",
    "full_back",
    "central_midfielder",
    "center_back",
  ]);
  const assists = chartRows([
    "winger",
    "attacking_midfielder",
    "central_midfielder",
    "wide_midfielder",
    "full_back",
    "wing_back",
    "defensive_midfielder",
    "striker",
    "striker",
    "center_back",
  ]);

  return {
    table: tableRows(),
    topScorers: scorers.map((row, index) => ({ ...row, goals: Math.max(1, 7 - index), assists: 1 })),
    topAssists: assists.map((row, index) => ({ ...row, goals: 1, assists: Math.max(1, 3 - index) })),
    shapes: shapeRows(6),
    facts: healthyFacts(),
    ...overrides,
  };
}

function healthyFacts(overrides: Partial<SeasonRecapFacts> = {}): SeasonRecapFacts {
  return {
    matchesPerClub: MATCHES,
    playedFixtures: 30,
    goalsPerMatch: 2.67,
    homeWinShare: 0.43,
    drawShare: 0.23,
    championPoints: 22,
    bottomPoints: 5,
    pointsSpread: 17,
    topScorerGoals: 7,
    topAssistCount: 3,
    distinctFormations: 6,
    ...overrides,
  };
}

function tableRows(): readonly SeasonRecapTableRow[] {
  return [22, 18, 14, 11, 8, 5].map((points, index) => ({
    position: index + 1,
    clubId: `club:${index}` as ClubId,
    clubName: `Club ${index}`,
    played: MATCHES,
    wins: 3,
    draws: 1,
    losses: 6,
    goalsFor: 12,
    goalsAgainst: 14,
    goalDifference: -2,
    points,
  }));
}

function chartRows(roles: readonly PlayerRole[]): readonly SeasonRecapPlayerRow[] {
  return roles.map((role, index) => ({
    playerId: `player:${String(index).padStart(3, "0")}` as PlayerId,
    playerName: `Player ${index}`,
    clubId: `club:${index % 6}` as ClubId,
    clubName: `Club ${index % 6}`,
    role,
    roleGroup: SEASON_RECAP_ROLE_GROUP[role],
    goals: 1,
    assists: 1,
    appearances: MATCHES,
  }));
}

function shapeRows(count: number): readonly SeasonRecapShapeRow[] {
  const formations: readonly FormationKey[] = [
    "4-4-2",
    "4-3-3",
    "4-2-3-1",
    "3-5-2",
    "3-4-3",
    "5-3-2",
  ] as FormationKey[];

  return formations.slice(0, count).map((formation) => ({
    formation,
    clubCount: 1,
    meanPoints: 13,
  }));
}

function verdictOf(recap: SeasonRecap, key: SeasonRecapCheckKey): "pass" | "fail" {
  const check = evaluateSeasonRecapGates(recap).checks.find((row) => row.key === key);

  if (check === undefined) throw new Error(`No check evaluated for ${key}`);

  return check.verdict;
}

describe("evaluateSeasonRecapGates", () => {
  it("passes a season built from the football the bands describe", () => {
    const result = evaluateSeasonRecapGates(healthyRecap());

    expect(result.failed).toStrictEqual([]);
  });

  it("evaluates every declared check exactly once, in the frozen order", () => {
    const result = evaluateSeasonRecapGates(healthyRecap());

    expect(result.checks.map((check) => check.key)).toStrictEqual([...SEASON_RECAP_CHECK_KEYS]);
  });

  it("reports the observed number whether it passed or failed", () => {
    const result = evaluateSeasonRecapGates(healthyRecap());
    const champion = result.checks.find((check) => check.key === "champion_points_per_match");

    // A report that only says "fail" sends the reader back to the raw data.
    expect(champion?.observed).toBeCloseTo(2.2, 10);
    expect(champion?.band).toStrictEqual(SEASON_RECAP_BANDS.champion_points_per_match);
  });

  it("divides by matches played, so a longer season is judged by the same football", () => {
    const doubled = healthyRecap({
      facts: healthyFacts({ matchesPerClub: 20, championPoints: 44, bottomPoints: 10, pointsSpread: 34 }),
    });

    expect(verdictOf(doubled, "champion_points_per_match")).toBe("pass");
    expect(verdictOf(doubled, "bottom_points_per_match")).toBe("pass");
  });
});

describe("season recap band reachability", () => {
  // AGENTS.md: a gate that cannot fail is not a gate. Every band below gets a
  // season that violates it, so none of them is decoration.
  it("catches a champion running away with the league", () => {
    const runaway = healthyRecap({ facts: healthyFacts({ championPoints: 29 }) });

    expect(verdictOf(runaway, "champion_points_per_match")).toBe("fail");
  });

  it("catches a bottom club that collapsed", () => {
    const collapsed = healthyRecap({ facts: healthyFacts({ bottomPoints: 1 }) });

    expect(verdictOf(collapsed, "bottom_points_per_match")).toBe("fail");
  });

  it("catches a table with no spread at all", () => {
    const flat = healthyRecap({ facts: healthyFacts({ pointsSpread: 4 }) });

    expect(verdictOf(flat, "points_spread_per_match")).toBe("fail");
  });

  it("catches a top scorer nobody could reach, and one who barely scored", () => {
    expect(verdictOf(healthyRecap({ facts: healthyFacts({ topScorerGoals: 30 }) }), "top_scorer_goals_per_match")).toBe("fail");
    expect(verdictOf(healthyRecap({ facts: healthyFacts({ topScorerGoals: 2 }) }), "top_scorer_goals_per_match")).toBe("fail");
  });

  it("catches an assist chart nobody led", () => {
    const noCreators = healthyRecap({ facts: healthyFacts({ topAssistCount: 1 }) });

    expect(verdictOf(noCreators, "top_assists_per_match")).toBe("fail");
  });

  it("catches a scoreless league and a basketball score", () => {
    expect(verdictOf(healthyRecap({ facts: healthyFacts({ goalsPerMatch: 1.4 }) }), "goals_per_match")).toBe("fail");
    expect(verdictOf(healthyRecap({ facts: healthyFacts({ goalsPerMatch: 4.2 }) }), "goals_per_match")).toBe("fail");
  });

  it("catches home advantage deciding everything, and not existing", () => {
    expect(verdictOf(healthyRecap({ facts: healthyFacts({ homeWinShare: 0.7 }) }), "home_win_share")).toBe("fail");
    expect(verdictOf(healthyRecap({ facts: healthyFacts({ homeWinShare: 0.2 }) }), "home_win_share")).toBe("fail");
  });

  it("catches a league of draws", () => {
    const drawn = healthyRecap({ facts: healthyFacts({ drawShare: 0.55 }) });

    expect(verdictOf(drawn, "draw_share")).toBe("fail");
  });

  it("catches defenders topping the scoring chart", () => {
    const defenders = healthyRecap({
      topScorers: chartRows([
        "center_back",
        "full_back",
        "full_back",
        "wing_back",
        "defensive_midfielder",
        "central_midfielder",
        "striker",
        "striker",
        "winger",
        "winger",
      ]),
    });

    expect(verdictOf(defenders, "finishers_in_top_scorers")).toBe("fail");
    expect(verdictOf(defenders, "centre_backs_in_top_scorers")).toBe("pass");
  });

  it("catches a goalkeeper in the scoring chart, which is the check that must not be decoration", () => {
    // It reads `0` on every healthy season, so the only way to know it works is
    // to put a keeper in and watch it fail.
    const keeperScored = healthyRecap({
      topScorers: chartRows([
        "goalkeeper",
        "striker",
        "striker",
        "winger",
        "winger",
        "attacking_midfielder",
        "attacking_midfielder",
        "central_midfielder",
        "full_back",
        "central_midfielder",
      ]),
    });

    expect(verdictOf(keeperScored, "goalkeepers_in_top_scorers")).toBe("fail");
  });

  it("allows one set-piece centre back and catches two", () => {
    const oneCentreBack = healthyRecap({
      topScorers: chartRows([
        "center_back",
        "striker",
        "striker",
        "winger",
        "winger",
        "attacking_midfielder",
        "attacking_midfielder",
        "central_midfielder",
        "full_back",
        "central_midfielder",
      ]),
    });
    const twoCentreBacks = healthyRecap({
      topScorers: chartRows([
        "center_back",
        "center_back",
        "striker",
        "winger",
        "winger",
        "attacking_midfielder",
        "attacking_midfielder",
        "central_midfielder",
        "full_back",
        "central_midfielder",
      ]),
    });

    expect(verdictOf(oneCentreBack, "centre_backs_in_top_scorers")).toBe("pass");
    expect(verdictOf(twoCentreBacks, "centre_backs_in_top_scorers")).toBe("fail");
  });

  it("catches an assist chart led by keepers and centre backs", () => {
    const wrongCreators = healthyRecap({
      topAssists: chartRows([
        "goalkeeper",
        "goalkeeper",
        "center_back",
        "center_back",
        "center_back",
        "striker",
        "winger",
        "winger",
        "central_midfielder",
        "full_back",
      ]),
    });

    expect(verdictOf(wrongCreators, "creators_in_top_assists")).toBe("fail");
  });

  it("catches a league where everybody plays the same shape", () => {
    const oneShape = healthyRecap({
      shapes: shapeRows(1),
      facts: healthyFacts({ distinctFormations: 1 }),
    });

    // This is the state the long-run report is in today: `report-data.ts` gives
    // every club `4-4-2`. The band is meant to fail there.
    expect(verdictOf(oneShape, "distinct_formations")).toBe("fail");
  });

  it("catches a negative count and a fractional one", () => {
    const negative = healthyRecap({
      table: tableRows().map((row, index) => (index === 0 ? { ...row, goalsFor: -3 } : row)),
    });
    const fractional = healthyRecap({
      topScorers: chartRows(["striker"]).map((row) => ({ ...row, goals: 4.5 })),
    });

    expect(verdictOf(negative, "impossible_values")).toBe("fail");
    expect(verdictOf(fractional, "impossible_values")).toBe("fail");
  });

  it("catches a non-finite rate", () => {
    const broken = healthyRecap({ facts: healthyFacts({ goalsPerMatch: Number.NaN }) });

    expect(verdictOf(broken, "impossible_values")).toBe("fail");
    expect(verdictOf(broken, "goals_per_match")).toBe("fail");
  });

  it("leaves no band that no season can cross", () => {
    // The summary claim: every declared check appears above with a season that
    // fails it. Adding a check without one fails here.
    const proven: readonly SeasonRecapCheckKey[] = [
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
    ];

    expect([...proven].toSorted()).toStrictEqual([...SEASON_RECAP_CHECK_KEYS].toSorted());
  });
});

describe("season recap band contract", () => {
  it("declares a band for every check and no others", () => {
    expect(Object.keys(SEASON_RECAP_BANDS).toSorted())
      .toStrictEqual([...SEASON_RECAP_CHECK_KEYS].toSorted());
  });

  it("never declares an empty or inverted band", () => {
    for (const key of SEASON_RECAP_CHECK_KEYS) {
      const band = SEASON_RECAP_BANDS[key];

      expect(band.min, key).toBeLessThanOrEqual(band.max);
      expect(Number.isFinite(band.min), key).toBe(true);
    }
  });

  it("keeps the creator group honest against the role taxonomy", () => {
    expect(isCreatorRole("center_back")).toBe(false);
    expect(isCreatorRole("central_midfielder")).toBe(true);
  });
});
