import assert from "node:assert/strict";
import { test } from "vitest";

import {
  evaluateOwnSquadAgencySet,
  type OwnSquadAgencyScheduleResult,
} from "./own-squad-agency-audit.ts";

function schedule(
  index: number,
  identity: string,
  deltas: { readonly own: number; readonly mismatch: number; readonly blind: number },
): OwnSquadAgencyScheduleResult {
  const policyIds = [
    "balanced:balanced",
    "patient_possession:left",
    "high_press:right",
    "direct_transition:balanced",
    "wide_overload:left",
    "compact_counter:right",
  ];
  const identityIndex = Number(identity.split("-").at(-1));
  return {
    scheduleId: `schedule-${index}`,
    worldSeed: `world-${Math.floor(index / 8)}`,
    clubId: `club-${index}`,
    squadIdentityKey: identity,
    fixtureCount: 34,
    matchesPerArm: 272,
    meanPointsByArm: {
      own_fit: 50 + deltas.own,
      mismatch: 50 + deltas.mismatch,
      non_commit: 50,
      blind: 50 + deltas.blind,
    },
    seasonPointDeltaByArm: {
      own_fit: deltas.own,
      mismatch: deltas.mismatch,
      non_commit: 0,
      blind: deltas.blind,
    },
    ownPolicyIds: Array.from({ length: 34 }, () => policyIds[identityIndex % policyIds.length] as string),
    formationKeys: Array.from({ length: 34 }, () => "4-4-2"),
    tiedAtBestCount: 0,
  };
}

const identities = Array.from({ length: 8 }, (_unused, index) => `identity-${index}`);
const worldSeeds = Array.from({ length: 7 }, (_unused, index) => `world-${index}`);
const guardrails = {
  a2FormationAndRoleHeld: true,
  noDominantReadersHeld: true,
  historicalFootballHeld: true,
  renewal: "not_evaluated" as const,
  failed: [],
};

test("passes the frozen paired season bands without pooling seed sets", () => {
  const schedules = worldSeeds.flatMap((_worldSeed, worldIndex) =>
    identities.map((identity, identityIndex) =>
      schedule(worldIndex * identities.length + identityIndex, identity, {
        own: 3,
        mismatch: -3,
        blind: identityIndex % 2 === 0 ? -0.25 : 0.25,
      })));
  const result = evaluateOwnSquadAgencySet({
    setName: "set-a",
    worldSeeds,
    schedules,
    declaredIdentityKeys: identities,
    constantQualityPolicyMoves: 6,
    constantQualityClubCount: 6,
    guardrails,
  });

  assert.equal(result.decision, "GO");
  assert.deepEqual(result.failed, []);
  assert.equal(result.policy.distinctModalPolicyCount, 6);
  assert.equal(result.policy.maximumModalPolicyShare, 0.25);
  assert.equal(result.policy.opponentSourceReadCount, 0);
  const blind = result.arms.find(({ arm }) => arm === "blind");
  assert.ok(blind);
  assert.equal(blind.confidenceInterval.lower95 < 0, true);
  assert.equal(blind.confidenceInterval.upper95 > 0, true);
});

test("keeps blind benefit as a STOP condition", () => {
  const schedules = worldSeeds.flatMap((_worldSeed, worldIndex) =>
    identities.map((identity, identityIndex) =>
      schedule(worldIndex * identities.length + identityIndex, identity, {
        own: 3,
        mismatch: -3,
        blind: 1,
      })));
  const result = evaluateOwnSquadAgencySet({
    setName: "set-b",
    worldSeeds,
    schedules,
    declaredIdentityKeys: identities,
    constantQualityPolicyMoves: 6,
    constantQualityClubCount: 6,
    guardrails,
  });

  assert.equal(result.decision, "STOP_RETHINK");
  assert.equal(result.failed.includes("blind_is_beneficial"), true);
});

test("a missing identity or failed canonical guardrail cannot pass", () => {
  const schedules = worldSeeds.flatMap((_worldSeed, worldIndex) =>
    identities.map((identity, identityIndex) =>
      schedule(worldIndex * identities.length + identityIndex, identity, {
        own: 3,
        mismatch: -3,
        blind: identityIndex % 2 === 0 ? -0.25 : 0.25,
      })));

  assert.throws(() => evaluateOwnSquadAgencySet({
    setName: "missing",
    worldSeeds,
    schedules: schedules.slice(1),
    declaredIdentityKeys: identities,
    constantQualityPolicyMoves: 6,
    constantQualityClubCount: 6,
    guardrails,
  }), /expected 56/);

  const result = evaluateOwnSquadAgencySet({
    setName: "guardrail",
    worldSeeds,
    schedules,
    declaredIdentityKeys: identities,
    constantQualityPolicyMoves: 6,
    constantQualityClubCount: 6,
    guardrails: { ...guardrails, noDominantReadersHeld: false, failed: ["no_dominant_formation"] },
  });
  assert.equal(result.decision, "REFINE");
});
