import assert from "node:assert/strict";
import { test } from "vitest";

import { TACTICAL_SHAPE_CAPACITIES } from "@game/domain";

import { matchTacticsCalibrationFixture, tacticalShapeProfileFixture } from "../test-fixtures/match-tactics-calibration.ts";
import { evaluateOwnSquadTacticalPolicies } from "./own-squad-tactical-policy.ts";

test("evaluates every profile and focus with stable order and explicit ties", () => {
  const input = {
    shape: tacticalShapeProfileFixture(),
    policy: matchTacticsCalibrationFixture().ownSquadTacticalPolicy,
  };
  const first = evaluateOwnSquadTacticalPolicies(input);
  const reversed = evaluateOwnSquadTacticalPolicies({
    ...input,
    policy: { ...input.policy, profiles: input.policy.profiles.toReversed() },
  });

  assert.equal(first.candidates.length, 9);
  assert.deepEqual(first, reversed);
  assert.equal(first.tiedAtBestCount > 0, true);
  assert.equal(first.nonCommit.policyId, "balanced:balanced");
  assert.equal(first.blind.policyId, "balanced:left");
});

test("left and right focus follow only the selected side capacities", () => {
  const base = tacticalShapeProfileFixture();
  const capacities = { ...base.capacities, left_progression: 0.95, left_coverage: 0.9 };
  const evaluation = evaluateOwnSquadTacticalPolicies({
    shape: { ...base, capacities },
    policy: matchTacticsCalibrationFixture().ownSquadTacticalPolicy,
  });

  assert.equal(evaluation.ownFit.lateralFocus, "left");
  assert.equal(evaluation.mismatch.lateralFocus, "right");
});

test("near-equivalent own capacities keep the non-committed profile and focus", () => {
  const base = tacticalShapeProfileFixture();
  const policy = matchTacticsCalibrationFixture().ownSquadTacticalPolicy;
  const balanced = policy.profiles.find(({ profileKey }) => profileKey === "balanced");
  assert.ok(balanced);
  const equalDemandProfiles = policy.profiles.map((profile) => ({
    ...profile,
    demandBasisPointsByCapacity: balanced.demandBasisPointsByCapacity,
  }));
  const evaluation = evaluateOwnSquadTacticalPolicies({
    shape: {
      ...base,
      capacities: {
        ...base.capacities,
        left_progression: 0.8,
        left_coverage: 0.8,
        right_progression: 0.8,
        right_coverage: 0.8,
      },
    },
    policy: { ...policy, profiles: equalDemandProfiles },
  });

  assert.equal(evaluation.ownFit.policyId, "balanced:balanced");
});

test("the policy reads every declared capacity and no opponent fact", () => {
  const policy = matchTacticsCalibrationFixture().ownSquadTacticalPolicy;
  const base = tacticalShapeProfileFixture();
  const baseline = evaluateOwnSquadTacticalPolicies({ shape: base, policy });

  for (const capacity of TACTICAL_SHAPE_CAPACITIES) {
    const changed = evaluateOwnSquadTacticalPolicies({
      shape: {
        ...base,
        capacities: { ...base.capacities, [capacity]: base.capacities[capacity] + 0.1 },
      },
      policy,
    });
    assert.notEqual(
      changed.candidates.map((candidate) => candidate.totalFit).join(","),
      baseline.candidates.map((candidate) => candidate.totalFit).join(","),
      capacity,
    );
  }
});
