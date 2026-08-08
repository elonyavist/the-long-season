import assert from "node:assert/strict";
import { test } from "vitest";

import { createSimulationReportArtifact } from "@game/simulation-tools";

import { renderSimulationReportHtml } from "./report-html.ts";

test("HTML is byte-identical and renders only observed requested modules", () => {
  const report = fixtureReport();
  const first = renderSimulationReportHtml(report);
  const second = renderSimulationReportHtml(report);

  assert.equal(first, second);
  assert.match(first, new RegExp(report.reportHash.slice(0, 16)));
  assert.match(first, /League standings/);
  assert.doesNotMatch(first, /Transfer history/);
  assert.match(first, /&lt;script&gt;United/);
  assert.match(first, /id="simulation-report-json"/);
});

test("HTML carries canonical table order without recalculating ranks", () => {
  const html = renderSimulationReportHtml(fixtureReport());
  assert.ok(html.indexOf("Second FC") < html.indexOf("&lt;script&gt;United"));
});

test("HTML exposes retained world and season dimensions through native drill-down controls", () => {
  const html = renderSimulationReportHtml(fixtureReport());
  assert.equal(html.match(/data-world-index=/g)?.length, 2);
  assert.equal(html.match(/data-season-index=/g)?.length, 3);
  assert.match(html, /data-world-selector/);
  assert.match(html, /data-season-selector/);
  assert.match(html, /Worlds retained/);
  assert.match(html, /Season views retained/);
});

test("HTML renders nested competitions and opening identity facts from the canonical artifact", () => {
  const html = renderSimulationReportHtml(formationFixtureReport());

  assert.match(html, /Opening squad identities/);
  assert.match(html, /First Division/);
  assert.match(html, /Second Division/);
  assert.match(html, /Club modal formations/);
  assert.match(html, /Primary-role population/);
  assert.match(html, /4-3-3/);
  assert.match(html, /wide_midfielder/);
});

test("HTML presents transfer minor units as euros and shows both observed divisions", () => {
  const report = transferFixtureReport();
  const html = renderSimulationReportHtml(report);

  assert.match(html, /€12,500,000\.00/);
  assert.match(html, /completed Fee<\/th>/);
  assert.doesNotMatch(html, /completed Fee Minor Units<\/th>/);
  assert.match(html, /First Division/);
  assert.match(html, /Second Division/);
  assert.match(html, /1250000000/);
});

function fixtureReport() {
  return createSimulationReportArtifact({
    measurementRequest: {
      mode: "custom",
      profileId: null,
      worldCount: 2,
      seasonCount: 2,
      includedSectionIds: ["standings"],
      detail: "standard",
      seedPrefix: "html-test",
      workerCount: 1,
    },
    manifest: {
      worldSeeds: ["html-test-world-00001", "html-test-world-00002"],
      executionNodes: [
        { key: "career_world", depth: "career" },
        { key: "standings_projection", depth: "season" },
      ],
      calibrationVersions: { engine: "v1" },
    },
    sections: [
      {
        id: "standings",
        status: "observed",
        data: {
          worlds: [{
            seed: "html-test-world-00001",
            seasons: [{
              seasonNumber: 1,
              rows: [
                { position: 1, clubName: "Second FC", points: 70 },
                { position: 2, clubName: "<script>United", points: 68 },
              ],
            }, {
              seasonNumber: 2,
              rows: [
                { position: 1, clubName: "Third FC", points: 72 },
              ],
            }],
          }, {
            seed: "html-test-world-00002",
            seasons: [{
              seasonNumber: 1,
              rows: [
                { position: 1, clubName: "Fourth FC", points: 69 },
              ],
            }],
          }],
        },
      },
      { id: "transfers", status: "not_requested", reason: "not requested" },
    ],
    decision: "PASS",
  });
}

function formationFixtureReport() {
  return createSimulationReportArtifact({
    measurementRequest: {
      mode: "profile",
      profileId: "phase81a-league-diversity-canary-7x10",
      worldCount: 1,
      seasonCount: 1,
      includedSectionIds: ["formations"],
      detail: "standard",
      seedPrefix: "formation-html-test",
      workerCount: 7,
    },
    manifest: {
      worldSeeds: ["formation-html-test-world-00001"],
      executionNodes: [{ key: "career_world", depth: "career" }],
      calibrationVersions: { engine: "v1" },
    },
    sections: [{
      id: "formations",
      status: "observed",
      data: {
        checkpoint: { decision: "GO" },
        worlds: [{
          seed: "formation-html-test-world-00001",
          openingPopulation: {
            competitions: [{
              competitionId: "competition:first",
              competitionName: "First Division",
              clubCount: 18,
              identityMismatchCount: 0,
              rows: [{ clubName: "North FC", squadIdentityKey: "wide_4_3_3" }],
            }],
          },
          seasons: [{
            seasonNumber: 1,
            competitions: [{
              competitionId: "competition:first",
              competitionName: "First Division",
              distinctFormationCount: 8,
              replicatedFormationCount: 6,
              topFormationShare: 0.25,
              fallbackSelectionCount: 0,
              clubModalRows: [{ clubName: "North FC", formation: "4-3-3", matches: 34 }],
              primaryRoles: { roleShares: [{ role: "wide_midfielder", count: 40 }] },
              roleDepthWarnings: [],
              rows: [],
            }, {
              competitionId: "competition:second",
              competitionName: "Second Division",
              distinctFormationCount: 7,
              replicatedFormationCount: 5,
              topFormationShare: 0.28,
              fallbackSelectionCount: 0,
              clubModalRows: [],
              primaryRoles: { roleShares: [] },
              roleDepthWarnings: [],
              rows: [],
            }],
          }],
        }],
      },
    }],
    decision: "PASS",
  });
}

function transferFixtureReport() {
  return createSimulationReportArtifact({
    measurementRequest: {
      mode: "custom",
      profileId: null,
      worldCount: 1,
      seasonCount: 1,
      includedSectionIds: ["transfers"],
      detail: "standard",
      seedPrefix: "transfer-html-test",
      workerCount: 1,
    },
    manifest: {
      worldSeeds: ["transfer-html-test-world-00001"],
      executionNodes: [{ key: "career_world", depth: "career" }],
      calibrationVersions: { engine: "v1" },
    },
    sections: [{
      id: "transfers",
      status: "observed",
      data: {
        worlds: [{
          seed: "transfer-html-test-world-00001",
          total: 1,
          rows: [{
            seasonNumber: 1,
            buyingClubName: "North FC",
            buyingCompetitionName: "First Division",
            sellingClubName: "South FC",
            sellingCompetitionName: "Second Division",
            completedFeeMinorUnits: 1_250_000_000,
          }],
        }],
      },
    }],
    decision: "PASS",
  });
}
