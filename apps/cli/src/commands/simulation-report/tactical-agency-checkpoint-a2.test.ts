import assert from "node:assert/strict";
import { test } from "vitest";

import {
  decideCheckpointA2,
  type CheckpointA21Attribution,
  type CheckpointA2Facts,
  type CheckpointA2SetEvaluation,
} from "./tactical-agency-checkpoint-a2.ts";

test("a chart regression reopens Step 03A", () => {
  assert.equal(decisionWithBrokenGuardrail("step_03a_chart"), "REFINE");
});

test("a legacy-chart failure preserves the primary GO", () => {
  assert.equal(decisionWithBrokenGuardrail("legacy_chart_also_fails"), "GO");
});

test("a failed counterfactual stops the checkpoint before attribution matters", () => {
  assert.equal(decideCheckpointA2({
    sets: [passingSet(false)],
    counterfactualMovesShape: false,
    lowBlockAttribution: "legacy_chart_also_fails",
  }), "STOP_RETHINK");
});

function decisionWithBrokenGuardrail(
  lowBlockAttribution: CheckpointA21Attribution,
): CheckpointA2Facts["decision"] {
  return decideCheckpointA2({
    sets: [passingSet(false)],
    counterfactualMovesShape: true,
    lowBlockAttribution,
  });
}

function passingSet(guardrailsHeld: boolean): CheckpointA2SetEvaluation {
  return {
    setName: "test",
    worldSeeds: ["test-world"],
    selectionCount: 1,
    topFormationShare: 0.2,
    distinctFormationCount: 6,
    positiveRoleCount: 10,
    reorderInvariantShare: 1,
    meanOutOfPositionSlots: 0,
    identities: {
      rows: [],
      distinctModalFormationCount: 3,
      unevaluatedIdentityKeys: [],
      unattributedSelectionCount: 0,
    },
    gates: [{ gate: "primary", observed: "pass", target: "pass", passed: true }],
    guardrails: [{
      gate: "low-block",
      observed: guardrailsHeld ? "1.9" : "2.7",
      target: "<= 2.0",
      passed: guardrailsHeld,
    }],
    passed: true,
    guardrailsHeld,
  };
}
