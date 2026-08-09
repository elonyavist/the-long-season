import assert from "node:assert/strict";
import { test } from "vitest";

import {
  MATCH_INJURY_RISK_POLICY,
  injuryForcesExit,
  matchInjuryProbability,
  severityForRoll,
} from "./match-injury.ts";

test("versioned injury occurrence policy has the complete reachable natural range", () => {
  assert.equal(MATCH_INJURY_RISK_POLICY.version, "match-injury-risk-v3");
  assert.equal(matchInjuryProbability({
    resilience: 1,
    workload: 0,
    contactDanger: 0,
    aggravation: false,
  }), 0.002275);
  assert.equal(matchInjuryProbability({
    resilience: 0,
    workload: 1,
    contactDanger: 1,
    aggravation: true,
  }), 0.095025);
});

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
