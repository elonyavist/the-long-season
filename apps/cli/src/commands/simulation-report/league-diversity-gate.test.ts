import assert from "node:assert/strict";
import { test } from "vitest";

import { GENERATED_SQUAD_IDENTITY_KEYS } from "@game/content";

import {
  evaluateLeagueDiversityOpeningGate,
  type LeagueDiversityOpeningGateRow,
} from "./league-diversity-gate.ts";

function healthyRow(): LeagueDiversityOpeningGateRow {
  return {
    worldSeed: "gate-world",
    competitionId: "competition:test",
    clubCount: 20,
    identityCounts: Object.fromEntries(
      GENERATED_SQUAD_IDENTITY_KEYS.map((key, index) => [key, index < 4 ? 3 : 2]),
    ),
    identityMismatchCount: 0,
    primaryRolePositiveCount: 10,
    distinctFormationCount: 6,
    replicatedFormationCount: 4,
    topFormationShare: 0.30,
    distinctIdentityModalFormationCount: 6,
    catalogOrderSensitiveSelectionCount: 0,
    avoidableOutOfPositionSlotCount: 0,
  };
}

test("the extracted Step 06A opening gate accepts every exact boundary", () => {
  const verdict = evaluateLeagueDiversityOpeningGate(healthyRow());

  assert.equal(verdict.held, true);
  assert.deepEqual(verdict.failedGateKeys, []);
});

test("one missing identity fails locally and cannot be pooled away", () => {
  const row = healthyRow();
  const firstIdentity = GENERATED_SQUAD_IDENTITY_KEYS[0];
  assert.notEqual(firstIdentity, undefined);
  const verdict = evaluateLeagueDiversityOpeningGate({
    ...row,
    identityCounts: { ...row.identityCounts, [firstIdentity]: 0 },
  });

  assert.equal(verdict.held, false);
  assert.deepEqual(verdict.failedGateKeys, ["identity_distribution"]);
  assert.equal(verdict.competitionId, row.competitionId);
});

test("every non-identity branch is reachable in the direction the gate reads", () => {
  const row = healthyRow();
  const verdict = evaluateLeagueDiversityOpeningGate({
    ...row,
    identityMismatchCount: 1,
    primaryRolePositiveCount: 9,
    distinctFormationCount: 5,
    replicatedFormationCount: 3,
    topFormationShare: 0.31,
    distinctIdentityModalFormationCount: 5,
    catalogOrderSensitiveSelectionCount: 1,
    avoidableOutOfPositionSlotCount: 1,
  });

  assert.equal(verdict.held, false);
  assert.deepEqual(verdict.failedGateKeys, [
    "identity_join",
    "primary_role_coverage",
    "formation_diversity",
    "formation_replication",
    "top_formation_share",
    "identity_modal_diversity",
    "catalog_order_sensitivity",
    "avoidable_out_of_position",
  ]);
});
