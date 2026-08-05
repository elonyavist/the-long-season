import { describe, expect, it } from "vitest";
import type { FormationKey } from "@game/engine";
import {
  SEASON_RECAP_BANDS,
  SEASON_RECAP_CHECK_KEYS,
  SEASON_RECAP_ROLE_GROUP,
  type SeasonRecap,
  type SeasonRecapGateResult,
} from "@game/simulation-tools";

import {
  createSeasonRecapReport,
  formatSeasonRecapDetailMarkdown,
  formatSeasonRecapReportMarkdown,
} from "./recap-report.ts";
import type {
  SeasonRecapSeasonSummary,
  SeasonRecapWorldSummary,
} from "./recap-world.ts";

function recap(overrides: Partial<SeasonRecap> = {}): SeasonRecap {
  return {
    table: [{
      position: 1,
      clubId: "club:a" as never,
      clubName: "Alpha FC",
      played: 34,
      wins: 20,
      draws: 8,
      losses: 6,
      goalsFor: 60,
      goalsAgainst: 30,
      goalDifference: 30,
      points: 68,
    }],
    topScorers: [],
    topAssists: [],
    shapes: [
      { formation: "4-4-2" as FormationKey, clubCount: 2, meanPoints: 50 },
      { formation: "4-3-3" as FormationKey, clubCount: 1, meanPoints: 20 },
    ],
    facts: {
      matchesPerClub: 34,
      playedFixtures: 306,
      goalsPerMatch: 2.8,
      homeWinShare: 0.44,
      drawShare: 0.26,
      championPoints: 68,
      bottomPoints: 25,
      pointsSpread: 43,
      topScorerGoals: 20,
      topAssistCount: 10,
      distinctFormations: 2,
    },
    ...overrides,
  };
}

/**
 * A full gate result: every declared band answered, as the real one always is.
 *
 * `champion_points_per_match` carries the value under test; the rest sit inside
 * their bands. Building this from `SEASON_RECAP_CHECK_KEYS` rather than listing
 * one check is what the report requires, and a fixture that answered fewer
 * bands than exist would be testing a shape the gate never produces.
 */
function gates(observed: number, verdict: "pass" | "fail"): SeasonRecapGateResult {
  return {
    checks: SEASON_RECAP_CHECK_KEYS.map((key) =>
      key === "champion_points_per_match"
        ? { key, observed, band: SEASON_RECAP_BANDS[key], verdict }
        : { key, observed: SEASON_RECAP_BANDS[key].min, band: SEASON_RECAP_BANDS[key], verdict: "pass" as const },
    ),
    failed: verdict === "fail" ? ["champion_points_per_match"] : [],
  };
}

function season(
  seasonNumber: number,
  observed: number,
  verdict: "pass" | "fail",
): SeasonRecapSeasonSummary {
  return {
    seasonNumber,
    seasonSeed: `seed-season-${seasonNumber}`,
    recap: recap(),
    gates: gates(observed, verdict),
  };
}

function world(worldIndex: number, seasons: readonly SeasonRecapSeasonSummary[]): SeasonRecapWorldSummary {
  return {
    worldIndex,
    seed: `seed-world-${worldIndex}`,
    clubCount: 18,
    seasons,
    abilityTrace: seasons.map((entry) => ({
      seasonNumber: entry.seasonNumber,
      topClubAbility: 13,
      bottomClubAbility: 13 - entry.seasonNumber,
      abilitySpread: 13 - (13 - entry.seasonNumber),
      originalPlayerShare: 1 / entry.seasonNumber,
    })),
    openingRoleCounts: { striker: 6, winger: 2, center_back: 2 },
  };
}

describe("createSeasonRecapReport", () => {
  it("counts a band's passes and failures across every world", () => {
    const report = createSeasonRecapReport({
      seedPrefix: "seed",
      seasonCount: 2,
      worlds: [
        world(1, [season(1, 2.0, "pass"), season(2, 1.5, "fail")]),
        world(2, [season(1, 2.1, "pass"), season(2, 2.2, "pass")]),
      ],
    });
    const check = report.checks.find((entry) => entry.key === "champion_points_per_match");

    expect(check).toMatchObject({ passCount: 3, failCount: 1, min: 1.5, max: 2.2 });
    expect(report.failedCheckKeys).toStrictEqual(["champion_points_per_match"]);
  });

  it("states the population it was measured over", () => {
    const report = createSeasonRecapReport({
      seedPrefix: "seed",
      seasonCount: 2,
      worlds: [world(1, [season(1, 2, "pass"), season(2, 2, "pass")])],
    });

    expect(report.population).toStrictEqual({
      seedPrefix: "seed",
      requestedWorldCount: 1,
      worldCount: 1,
      seasonCount: 2,
      totalSeasons: 2,
      clubCount: 18,
    });
  });

  it("counts a world that did not finish against the population it asked for", () => {
    const report = createSeasonRecapReport({
      seedPrefix: "seed",
      seasonCount: 1,
      worlds: [world(1, [season(1, 2, "pass")])],
      failures: [{ worldIndex: 2, seed: "seed-world-2", message: "no complete usable XI" }],
    });

    expect(report.population.requestedWorldCount).toBe(2);
    expect(report.population.worldCount).toBe(1);
    expect(report.failures).toHaveLength(1);
  });

  it("weights a shape's mean points by club-seasons, not by season", () => {
    // `4-4-2` is fielded by two clubs averaging 50 and `4-3-3` by one on 20.
    // Averaging the two season rows would call the league 35 apiece.
    const report = createSeasonRecapReport({
      seedPrefix: "seed",
      seasonCount: 1,
      worlds: [world(1, [season(1, 2, "pass")])],
    });

    expect(report.shapes).toStrictEqual([
      { formation: "4-4-2", clubSeasons: 2, meanPoints: 50 },
      { formation: "4-3-3", clubSeasons: 1, meanPoints: 20 },
    ]);
  });

  it("leaves out shapes nobody fielded", () => {
    const report = createSeasonRecapReport({
      seedPrefix: "seed",
      seasonCount: 1,
      worlds: [world(1, [season(1, 2, "pass")])],
    });

    expect(report.shapes.map((shape) => shape.formation)).toStrictEqual(["4-4-2", "4-3-3"]);
    expect(report.distinctFormations).toBe(2);
  });

  it("averages the quality trace by season number across worlds", () => {
    const report = createSeasonRecapReport({
      seedPrefix: "seed",
      seasonCount: 2,
      worlds: [
        world(1, [season(1, 2, "pass"), season(2, 2, "pass")]),
        world(2, [season(1, 2, "pass"), season(2, 2, "pass")]),
      ],
    });

    expect(report.abilityTrace.map((row) => row.seasonNumber)).toStrictEqual([1, 2]);
    expect(report.abilityTrace[1]).toMatchObject({ meanAbilitySpread: 2 });
  });

  it("puts a role's population beside the chart rows it holds", () => {
    // The point of the pairing: a role with players and no rows is an engine
    // question, a role with no players at all is a world question, and the
    // chart alone cannot tell them apart.
    const report = createSeasonRecapReport({
      seedPrefix: "seed",
      seasonCount: 1,
      worlds: [world(1, [season(1, 2, "pass")])],
    });
    const striker = report.openingRoleCounts.find((row) => row.role === "striker");

    expect(striker).toMatchObject({ players: 6, playerShare: 0.6, scorerRows: 0, assistRows: 0 });
  });

  it("keeps a row for a role with no players and no chart rows at all", () => {
    // A role missing from the squads *and* both charts is the strongest form of
    // the finding. Building the table from observed roles would delete exactly
    // that row and leave silence looking like a clean result.
    const report = createSeasonRecapReport({
      seedPrefix: "seed",
      seasonCount: 1,
      worlds: [world(1, [season(1, 2, "pass")])],
    });

    expect(report.openingRoleCounts.map((row) => row.role))
      .toStrictEqual(Object.keys(SEASON_RECAP_ROLE_GROUP).toSorted());
    expect(report.openingRoleCounts.find((row) => row.role === "wide_midfielder"))
      .toMatchObject({ players: 0, scorerRows: 0, assistRows: 0 });
  });

  it("refuses a run with no simulated season", () => {
    expect(() => createSeasonRecapReport({ seedPrefix: "seed", seasonCount: 1, worlds: [] }))
      .toThrow(/at least one simulated season/);
  });

  it("refuses a season that answers fewer bands than are declared", () => {
    // Without this the report prints `Infinity` as the observed value of a band
    // nothing measured, which reads as a spectacular failure.
    const incomplete = season(1, 2, "pass");
    const broken = {
      ...incomplete,
      gates: {
        ...incomplete.gates,
        checks: incomplete.gates.checks.filter((check) => check.key !== "draw_share"),
      },
    };

    expect(() => createSeasonRecapReport({
      seedPrefix: "seed",
      seasonCount: 1,
      worlds: [world(1, [broken])],
    })).toThrow(/no verdict for declared band draw_share/);
  });
});

describe("formatSeasonRecapReportMarkdown", () => {
  it("says plainly that the run is not evidence", () => {
    const markdown = formatSeasonRecapReportMarkdown(createSeasonRecapReport({
      seedPrefix: "seed",
      seasonCount: 1,
      worlds: [world(1, [season(1, 2, "pass")])],
    }));

    expect(markdown).toContain("This Is Not Evidence");
    expect(markdown).toContain("A10");
  });

  it("names every failing band rather than only a verdict", () => {
    const markdown = formatSeasonRecapReportMarkdown(createSeasonRecapReport({
      seedPrefix: "seed",
      seasonCount: 1,
      worlds: [world(1, [season(1, 1.4, "fail")])],
    }));

    expect(markdown).toContain("Failing bands: `champion_points_per_match`");
  });

  it("prints an unbounded band edge readably rather than as Infinity", () => {
    const markdown = formatSeasonRecapReportMarkdown(createSeasonRecapReport({
      seedPrefix: "seed",
      seasonCount: 1,
      worlds: [world(1, [season(1, 2, "pass")])],
    }));

    expect(markdown).toContain("no maximum");
    expect(markdown).not.toContain("Infinity");
  });

  it("declares an excluded world as a selection effect, not a footnote", () => {
    // The worlds that stop are the ones whose rosters could not fill their
    // assigned shape, so the survivors are the broader squads. A report that
    // printed only the survivors would read as a clean hundred seasons.
    const markdown = formatSeasonRecapReportMarkdown(createSeasonRecapReport({
      seedPrefix: "seed",
      seasonCount: 1,
      worlds: [world(1, [season(1, 2, "pass")])],
      failures: [{ worldIndex: 2, seed: "seed-world-2", message: "no complete usable XI" }],
    }));

    expect(markdown).toContain("Worlds That Did Not Finish");
    expect(markdown).toContain("selection effect");
    expect(markdown).toContain("seed-world-2");
    expect(markdown).toContain("no complete usable XI");
  });

  it("says so plainly when every world finished", () => {
    const markdown = formatSeasonRecapReportMarkdown(createSeasonRecapReport({
      seedPrefix: "seed",
      seasonCount: 1,
      worlds: [world(1, [season(1, 2, "pass")])],
    }));

    expect(markdown).toContain("Every world asked for reached the end");
    expect(markdown).not.toContain("Worlds That Did Not Finish");
  });

  it("renders the same text for the same run", () => {
    const build = () => formatSeasonRecapReportMarkdown(createSeasonRecapReport({
      seedPrefix: "seed",
      seasonCount: 1,
      worlds: [world(1, [season(1, 2, "pass")])],
    }));

    expect(build()).toBe(build());
  });
});

describe("formatSeasonRecapDetailMarkdown", () => {
  it("carries the role onto both player charts", () => {
    const detail = formatSeasonRecapDetailMarkdown("seed-world-1", {
      ...season(1, 2, "pass"),
      recap: recap({
        topScorers: [{
          playerId: "player:1" as never,
          playerName: "Alpha Test",
          clubId: "club:a" as never,
          clubName: "Alpha FC",
          role: "striker",
          roleGroup: "finisher",
          goals: 20,
          assists: 3,
          appearances: 34,
        }],
      }),
    });

    expect(detail).toContain("`striker`");
    expect(detail).toContain("Alpha Test");
    expect(detail).toContain("## Top Assists");
  });
});
