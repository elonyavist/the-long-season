import assert from "node:assert/strict";
import { test } from "vitest";

import {
  decideCheckpointA2,
  formatCheckpointA2Report,
  type CheckpointA21Attribution,
  type CheckpointA2Report,
  type CheckpointA2SetEvaluation,
} from "./checkpoint-a2.ts";

test("a chart regression reopens Step 03A", () => {
  assert.equal(decisionWithBrokenGuardrail("step_03a_chart"), "REFINE");
});

test("a legacy-chart failure preserves the primary GO but limits its handoff", () => {
  const report = checkpointReport("legacy_chart_also_fails");

  assert.equal(report.decision, "GO");
  const rendered = formatCheckpointA2Report(report);
  assert.equal(rendered.includes("Only Steps 04-05 open"), true);
  assert.equal(rendered.includes("does not absolve the whole generation change"), true);
  assert.equal(rendered.includes("Steps 04-16 open"), false);
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
): CheckpointA2Report["decision"] {
  return decideCheckpointA2({
    sets: [passingSet(false)],
    counterfactualMovesShape: true,
    lowBlockAttribution,
  });
}

function checkpointReport(
  lowBlockAttribution: CheckpointA21Attribution,
): CheckpointA2Report {
  const sets = [passingSet(false)];

  return {
    sets,
    counterfactual: {
      worldSeed: "checkpoint-a2-test",
      rows: [],
      clubCount: 1,
      clubsWhoseShapeMoved: 1,
      distinctShapeCountByClub: [2],
    },
    counterfactualMovesShape: true,
    lowBlockAttributionReports: [{
      setName: "test",
      arms: [
        {
          armName: "legacy chart",
          worldSeeds: ["test-world"],
          concededExpectedGoalsReduction: 0.12,
          ownLossPerConcededReduction: 2.9,
          guardrailHeld: false,
        },
        {
          armName: "current chart",
          worldSeeds: ["test-world"],
          concededExpectedGoalsReduction: 0.14,
          ownLossPerConcededReduction: 2.7,
          guardrailHeld: false,
        },
      ],
      attribution: lowBlockAttribution,
    }],
    lowBlockAttribution,
    decision: decideCheckpointA2({
      sets,
      counterfactualMovesShape: true,
      lowBlockAttribution,
    }),
    workerCount: 7,
  };
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
