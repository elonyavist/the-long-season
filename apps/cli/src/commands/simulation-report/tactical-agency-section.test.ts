import assert from "node:assert/strict";
import { test } from "vitest";

import { decideTacticalAgencyCheckpointC } from "./tactical-agency-section.ts";

type DecisionInput = Parameters<typeof decideTacticalAgencyCheckpointC>[0];

function heldInput(): DecisionInput {
  return {
    a2Decision: "GO",
    phaseOneDecisions: ["PASS_PHASE_1", "PASS_PHASE_1"],
    populationHeld: [true, true],
    attributionAvailable: [true, true],
    blindNeutralHeld: [true, true],
    materialityHeld: [true, true],
    downstreamOwner: "result_resolution",
    downstreamAttributionHeld: true,
    originalDominanceHeld: true,
  };
}

test("Checkpoint C opens Step 10 only when every frozen fact holds", () => {
  assert.equal(decideTacticalAgencyCheckpointC(heldInput()), "GO");
});

test("Checkpoint C names product-premise review only after structural evidence holds", () => {
  assert.equal(decideTacticalAgencyCheckpointC({
    ...heldInput(),
    materialityHeld: [true, false],
  }), "REFINE_PRODUCT_PREMISE");
});

test("Checkpoint C routes a structural red to player context", () => {
  assert.equal(decideTacticalAgencyCheckpointC({
    ...heldInput(),
    blindNeutralHeld: [false, true],
  }), "REFINE_PLAYER_CONTEXT");
});

test("Checkpoint C stops on absent or contradictory attribution", () => {
  assert.equal(decideTacticalAgencyCheckpointC({
    ...heldInput(),
    attributionAvailable: [true, false],
  }), "STOP_RETHINK");
  assert.equal(decideTacticalAgencyCheckpointC({
    ...heldInput(),
    downstreamOwner: "mixed",
    downstreamAttributionHeld: false,
  }), "STOP_RETHINK");
});
