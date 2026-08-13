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

  assert.equal(first.candidates.length, 18);
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

test("a plan reads standardized own strengths through its conserved demand", () => {
  const base = tacticalShapeProfileFixture();
  const policy = matchTacticsCalibrationFixture().ownSquadTacticalPolicy;
  const balanced = policy.profiles.find(({ profileKey }) => profileKey === "balanced");
  const transition = policy.profiles.find(({ profileKey }) => profileKey === "direct_transition");
  assert.ok(balanced);
  assert.ok(transition);
  const transitionDemand = {
    ...transition.demandBasisPointsByCapacity,
    build_up: transition.demandBasisPointsByCapacity.build_up - 500,
    counter_threat: transition.demandBasisPointsByCapacity.counter_threat + 500,
  };
  const profiles = policy.profiles.map((profile) => profile.profileKey === "direct_transition"
    ? { ...profile, demandBasisPointsByCapacity: transitionDemand }
    : profile);
  const capacities = Object.fromEntries(
    TACTICAL_SHAPE_CAPACITIES.map((capacity) => [
      capacity,
      0.7 + (
        transitionDemand[capacity]
        - balanced.demandBasisPointsByCapacity[capacity]
      ) / 20_000,
    ]),
  ) as typeof base.capacities;
  const result = evaluateOwnSquadTacticalPolicies({
    shape: { ...base, capacities },
    policy: { ...policy, profiles },
  });
  const balancedCandidate = result.candidates.find(({ policyId }) => policyId === "balanced:balanced");
  const transitionCandidate = result.candidates.find(({ policyId }) => policyId === "direct_transition:balanced");
  assert.ok(balancedCandidate);
  assert.ok(transitionCandidate);
  assert.equal(transitionCandidate.profileFit > balancedCandidate.profileFit, true);
});

test("capacity reference and scale are active policy inputs", () => {
  const base = tacticalShapeProfileFixture();
  const shape = { ...base, capacities: { ...base.capacities, counter_threat: 0.7 } };
  const policy = matchTacticsCalibrationFixture().ownSquadTacticalPolicy;
  const baseline = evaluateOwnSquadTacticalPolicies({ shape, policy });
  const referenced = evaluateOwnSquadTacticalPolicies({
    shape,
    policy: {
      ...policy,
      profileFitReferenceBasisPointsByCapacity: {
        ...policy.profileFitReferenceBasisPointsByCapacity,
        counter_threat: policy.profileFitReferenceBasisPointsByCapacity.counter_threat + 100,
      },
    },
  });
  const scaled = evaluateOwnSquadTacticalPolicies({
    shape,
    policy: {
      ...policy,
      profileFitScaleBasisPointsByCapacity: {
        ...policy.profileFitScaleBasisPointsByCapacity,
        counter_threat: policy.profileFitScaleBasisPointsByCapacity.counter_threat + 100,
      },
    },
  });

  assert.notDeepEqual(referenced.candidates, baseline.candidates);
  assert.notDeepEqual(scaled.candidates, baseline.candidates);
});
