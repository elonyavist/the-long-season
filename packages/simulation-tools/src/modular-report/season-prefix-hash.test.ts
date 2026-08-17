import assert from "node:assert/strict";
import { test } from "vitest";

import {
  baselineContinuityHash,
  createSimulationReportArtifact,
  parseSimulationReportArtifact,
  seasonPrefixFacts,
  seasonPrefixReportHash,
} from "./report-contract.ts";

/**
 * The season-prefix hash gates every cross-horizon continuity claim, so it is
 * tested from both failure directions: too narrow lets a real divergence in the
 * shared seasons pass, too wide fails on counters that legitimately span the
 * whole requested horizon.
 */
/**
 * Every section gets its own season array.
 *
 * An earlier version aliased one array into both sections. The reorder test
 * then reversed the same array twice and silently returned it to its original
 * order, and the section-swap test wrote both values into one object. Both
 * passed while proving nothing, so independence is built in here rather than
 * left to each test to remember.
 */
function report(options: { readonly seasonOneGoals: number; readonly lateSeasons: number }) {
  const seasons = (offset: number) =>
    Array.from({ length: options.lateSeasons }, (_unused, index) => ({
      seasonNumber: index + 1,
      goals: index === 0 ? options.seasonOneGoals + offset : 100 + index + offset,
      nested: { note: `season ${index + 1} offset ${offset}` },
    }));
  return {
    // A whole-horizon aggregate: it must never reach the prefix hash.
    totalTransfers: options.lateSeasons * 17,
    sections: [
      { id: "development", data: { worlds: [{ seed: "w-1", seasons: seasons(0) }] } },
      { id: "season", data: { worlds: [{ seed: "w-1", seasons: seasons(1000) }] } },
    ],
  };
}

test("prefix hash ignores seasons beyond the boundary and horizon aggregates", () => {
  const tenSeasons = report({ seasonOneGoals: 3, lateSeasons: 10 });
  const fifteenSeasons = report({ seasonOneGoals: 3, lateSeasons: 15 });

  // The two runs differ in horizon, total transfers and season count.
  assert.notDeepEqual(tenSeasons, fifteenSeasons);
  assert.equal(
    seasonPrefixReportHash(tenSeasons, 10),
    seasonPrefixReportHash(fifteenSeasons, 10),
  );
});

test("prefix hash changes when a season inside the boundary changes", () => {
  const baseline = report({ seasonOneGoals: 3, lateSeasons: 15 });
  const mutated = report({ seasonOneGoals: 4, lateSeasons: 15 });

  assert.notEqual(
    seasonPrefixReportHash(baseline, 10),
    seasonPrefixReportHash(mutated, 10),
  );
});

test("prefix hash does not change when only a season beyond the boundary changes", () => {
  const baseline = report({ seasonOneGoals: 3, lateSeasons: 15 });
  const mutated = structuredClone(baseline) as typeof baseline;
  for (const section of mutated.sections) {
    const seasonEleven = section.data.worlds[0]!.seasons.find(
      (season) => season.seasonNumber === 11,
    )!;
    seasonEleven.goals = 999;
    seasonEleven.nested.note = "changed";
  }

  assert.notDeepEqual(baseline, mutated);
  assert.equal(
    seasonPrefixReportHash(baseline, 10),
    seasonPrefixReportHash(mutated, 10),
  );
});

test("prefix facts keep every season row and exclude non-season aggregates", () => {
  const facts = seasonPrefixFacts(report({ seasonOneGoals: 3, lateSeasons: 15 }), 10);

  // Two sections x ten seasons: no row is dropped, and sibling containers get
  // distinct paths so one section's row can never stand in for another's.
  assert.equal(facts.length, 20);
  assert.equal(new Set(facts.map(([path]) => path)).size, 20);
  assert.equal(
    facts.every(([, row]) => (row as { seasonNumber: number }).seasonNumber <= 10),
    true,
  );
  assert.equal(
    JSON.stringify(facts).includes("totalTransfers"),
    false,
  );
});

test("exchanging season one between two sections changes the hash", () => {
  const baseline = report({ seasonOneGoals: 3, lateSeasons: 15 });
  const exchanged = structuredClone(baseline) as typeof baseline;
  const first = exchanged.sections[0]!.data.worlds[0]!.seasons;
  const second = exchanged.sections[1]!.data.worlds[0]!.seasons;
  const carried = first[0]!;
  first[0] = second[0]!;
  second[0] = carried;

  // The multiset of rows is unchanged; only their owning section differs. An
  // identity-blind path would report the two reports as identical.
  assert.notDeepEqual(baseline, exchanged);
  assert.notEqual(
    seasonPrefixReportHash(baseline, 10),
    seasonPrefixReportHash(exchanged, 10),
  );
});

test("prefix facts are stable against producer array order", () => {
  const baseline = report({ seasonOneGoals: 3, lateSeasons: 12 });
  const reordered = structuredClone(baseline) as typeof baseline;
  reordered.sections.reverse();
  for (const section of reordered.sections) {
    section.data.worlds[0]!.seasons.reverse();
  }

  // Guard the guard: the two sections must genuinely differ, or reversing them
  // proves nothing about ordering.
  assert.notDeepEqual(
    baseline.sections[0]!.data.worlds[0]!.seasons,
    baseline.sections[1]!.data.worlds[0]!.seasons,
  );
  assert.notDeepEqual(baseline.sections, reordered.sections);
  assert.equal(
    seasonPrefixReportHash(baseline, 10),
    seasonPrefixReportHash(reordered, 10),
  );
});

test("same-path sibling rows are compared as a multiset of complete facts", () => {
  // Real reports contain these: two transfers of the same player in one season
  // share an identity-derived path. Each row still carries its complete content.
  const withRows = (first: number, second: number) => ({
    sections: [{
      id: "transfers",
      data: {
        worlds: [{
          seed: "w-1",
          rows: [
            { playerId: "player:a", seasonNumber: 1, fee: first },
            { playerId: "player:a", seasonNumber: 1, fee: second },
          ],
        }],
      },
    }],
  });

  // Permuting complete sibling facts is not a semantic difference.
  assert.equal(
    seasonPrefixReportHash(withRows(100, 200), 10),
    seasonPrefixReportHash(withRows(200, 100), 10),
  );

  // Changing any field of any sibling is, and must be caught.
  assert.notEqual(
    seasonPrefixReportHash(withRows(100, 200), 10),
    seasonPrefixReportHash(withRows(100, 201), 10),
  );
});

test("the artifact carries a prefix hash only from the continuity boundary on", () => {
  const sections = [{
    id: "season",
    status: "observed" as const,
    data: {
      worlds: [{
        seed: "w-1",
        seasons: Array.from({ length: 12 }, (_unused, index) => ({
          seasonNumber: index + 1,
          points: index * 3,
        })),
      }],
    },
  }];
  const request = (seasonCount: number) => ({
    mode: "custom" as const,
    profileId: null,
    worldCount: 1,
    seasonCount,
    includedSectionIds: ["season"],
    detail: "standard" as const,
    seedPrefix: "prefix-boundary",
    workerCount: 1,
  });
  const manifest = { worldSeeds: ["w-1"], calibrationVersions: {}, executionNodes: [] };
  const build = (seasonCount: number) =>
    createSimulationReportArtifact({
      measurementRequest: request(seasonCount),
      manifest,
      sections,
      decision: "NOT_EVALUATED",
    });

  // A nine-season run cannot make the season-ten claim, so it must not carry it.
  assert.equal(build(9).seasonTenPrefixHash, undefined);
  assert.equal(typeof build(10).seasonTenPrefixHash, "string");

  // Runs of different horizons over identical shared seasons agree, while the
  // full report hash legitimately differs because the request differs.
  const ten = build(10);
  const fifteen = build(15);
  assert.equal(ten.seasonTenPrefixHash, fifteen.seasonTenPrefixHash);
  assert.notEqual(ten.reportHash, fifteen.reportHash);

  // The prefix hash is a sibling of the report hash, never folded into it.
  const { seasonTenPrefixHash: _omitted, ...withoutPrefix } = ten;
  assert.equal(parseSimulationReportArtifact(withoutPrefix).reportHash, ten.reportHash);
  assert.throws(() => parseSimulationReportArtifact({ ...ten, seasonTenPrefixHash: "0".repeat(32) }));
});

test("a diagnostic section changes the full prefix hash but not baseline continuity", () => {
  const baselineSectionIds = ["season", "development"] as const;
  const seasonRows = (offset: number) =>
    Array.from({ length: 12 }, (_unused, index) => ({
      seasonNumber: index + 1,
      points: index * 3 + offset,
    }));
  const historical = [
    { id: "season", status: "observed" as const, data: { worlds: [{ seed: "w-1", rows: seasonRows(0) }] } },
    { id: "development", status: "observed" as const, data: { worlds: [{ seed: "w-1", rows: seasonRows(500) }] } },
  ];
  // The added section carries season rows of its own, so it is the hard case:
  // it is invisible to continuity only because of the declared baseline list.
  const withDiagnostic = [
    ...historical,
    {
      id: "development_realization",
      status: "observed" as const,
      data: { worlds: [{ seed: "w-1", rows: seasonRows(9000) }] },
    },
  ];

  const continuity = (sections: typeof historical) =>
    baselineContinuityHash({ sections, baselineSectionIds: [...baselineSectionIds], throughSeason: 10 });

  // The whole-report question and the baseline question give different answers.
  assert.notEqual(
    seasonPrefixReportHash(historical, 10),
    seasonPrefixReportHash(withDiagnostic, 10),
  );
  assert.equal(continuity(historical), continuity(withDiagnostic as typeof historical));

  // Continuity still sees a real divergence inside a baseline section.
  const moved = structuredClone(withDiagnostic) as typeof historical;
  moved[0]!.data.worlds[0]!.rows[0]!.points = 999;
  assert.notEqual(continuity(withDiagnostic as typeof historical), continuity(moved));

  // A declared baseline section missing from the run is refused, never silently
  // dropped: a gate that compares less than it claims is worse than no gate.
  assert.throws(() =>
    baselineContinuityHash({
      sections: historical.filter((section) => section.id !== "development"),
      baselineSectionIds: [...baselineSectionIds],
      throughSeason: 10,
    }),
  );
  assert.throws(() =>
    baselineContinuityHash({ sections: historical, baselineSectionIds: ["season", "season"], throughSeason: 10 }),
  );
  assert.throws(() =>
    baselineContinuityHash({ sections: historical, baselineSectionIds: [], throughSeason: 10 }),
  );
});
