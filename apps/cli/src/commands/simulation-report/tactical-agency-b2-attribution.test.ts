import assert from "node:assert/strict";
import { test } from "vitest";

import { evaluateLeagueDiversityOpeningGate } from "./league-diversity-gate.ts";
import { runTacticalAgencyConditionedWorld } from "./tactical-agency-world.ts";

test("the two real B2.1 failing worlds are green after identity separation", () => {
  const worlds = [
    runTacticalAgencyConditionedWorld({
      worldSeed: "phase81a-agency-a2-out-of-sample-002",
    }),
    runTacticalAgencyConditionedWorld({
      worldSeed: "phase81a-agency-a2-out-of-sample-006",
    }),
  ];
  const populationRows = worlds.flatMap(({ populationRows: rows }) => rows);
  const verdicts = populationRows.map(evaluateLeagueDiversityOpeningGate);
  assert.equal(verdicts.length, 6);
  assert.equal(verdicts.every(({ held }) => held), true);
  assert.equal(populationRows.every(({ topFormationShare }) => topFormationShare <= 0.30), true);
});
