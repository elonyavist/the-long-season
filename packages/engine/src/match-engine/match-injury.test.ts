import assert from "node:assert/strict";
import { test } from "vitest";

import { injuryForcesExit, severityForRoll } from "./match-injury.ts";

test("injury severity is deterministic and worsens with contact, workload, and aggravation", () => {
  assert.equal(severityForRoll(0.9, 0, 0, false), "knock");
  assert.equal(severityForRoll(0.5, 0, 0, false), "minor");
  assert.equal(severityForRoll(0.5, 1, 1, true), "serious");
});

test("only moderate and serious incidents force an immediate exit", () => {
  assert.equal(injuryForcesExit("knock"), false);
  assert.equal(injuryForcesExit("minor"), false);
  assert.equal(injuryForcesExit("moderate"), true);
  assert.equal(injuryForcesExit("serious"), true);
});
