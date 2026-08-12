import assert from "node:assert/strict";
import { test } from "vitest";

import { evaluateLeagueDiversityOpeningGate } from "./league-diversity-gate.ts";
import {
  summarizeTacticalAgencyB21FormationAttribution,
  summarizeTacticalAgencyB21IdentityFamily,
} from "./tactical-agency-b2-attribution.ts";
import { runTacticalAgencyConditionedWorld } from "./tactical-agency-world.ts";

test("B2.1 reaches both formation concentration explanations on generated careers", () => {
  const worlds = [
    runTacticalAgencyConditionedWorld({
      worldSeed: "phase81a-agency-a2-out-of-sample-002",
    }),
    runTacticalAgencyConditionedWorld({
      worldSeed: "phase81a-agency-a2-out-of-sample-006",
    }),
  ];
  const populationRows = worlds.flatMap(({ populationRows: rows }) => rows);
  const attribution = summarizeTacticalAgencyB21FormationAttribution([{
    setName: "real B2 failing-world reachability",
    clubSelections: worlds.flatMap(({ clubSelections }) => clubSelections),
    populationRows,
    population: populationRows.map(evaluateLeagueDiversityOpeningGate),
  }]);

  assert.equal(attribution.failedRows.length, 2);
  assert.equal(attribution.failedRows.every(({ fourFourTwoCount }) => fourFourTwoCount === 6), true);
  assert.equal(attribution.failedRows.every(({ excessClubCount }) => excessClubCount === 1), true);
  assert.equal(attribution.failedRows.every(({ selections }) =>
    selections.every(({ tiedAtBestCount, bestMinusSecond }) =>
      tiedAtBestCount === 1 && bestMinusSecond !== "not_observed" && bestMinusSecond > 0)), true);
  assert.equal(attribution.squadChartRuleHeld, false);
  assert.equal(attribution.selectionFitRuleHeld, true);
  assert.equal(attribution.samplingVarianceRuleHeld, true);
  assert.equal(attribution.owner, "mixed");
  const family = summarizeTacticalAgencyB21IdentityFamily(attribution);
  assert.equal(family.decision, "IDENTITY_FAMILY");
  assert.deepEqual(family.minimumFamilyKeys, ["double_width_stock", "wide_midfield_stock"]);
  assert.deepEqual(family.failedRowCoverageShares, [1, 1]);
  assert.equal((family.seedSetFormationShares[0]?.fourFourTwoShare ?? 0) >= 0.8, true);
});
