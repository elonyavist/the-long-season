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
