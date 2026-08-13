import assert from "node:assert/strict";
import { test } from "vitest";

import {
  attributeOwnSquadAgencyTranslation,
  evaluateOwnSquadAgencySet,
  evaluateOwnSquadAgencyTranslationSet,
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
    meanSeasonFactsByArm: {
      own_fit: seasonFacts(50 + deltas.own, 102, 100, 32, 30, 43, 40),
      mismatch: seasonFacts(50 + deltas.mismatch, 98, 100, 28, 30, 37, 40),
      non_commit: seasonFacts(50, 100, 100, 30, 30, 40, 40),
      blind: seasonFacts(50 + deltas.blind, 100, 100, 30, 30, 40, 40),
    },
    ownPolicyIds: Array.from({ length: 34 }, () => policyIds[identityIndex % policyIds.length] as string),
    formationKeys: Array.from({ length: 34 }, () => "4-4-2"),
    tiedAtBestCount: 0,
  };
}

function seasonFacts(
  points: number,
  opportunitiesFor: number,
  opportunitiesAgainst: number,
  expectedGoalsFor: number,
  expectedGoalsAgainst: number,
  goalsFor: number,
  goalsAgainst: number,
) {
  return {
    points,
    opportunitiesFor,
    opportunitiesAgainst,
    expectedGoalsFor,
    expectedGoalsAgainst,
    goalsFor,
    goalsAgainst,
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

test("D2 requires six modal complete policies and caps one modal policy at 35 percent", () => {
  const schedules = worldSeeds.flatMap((_worldSeed, worldIndex) =>
    identities.map((identity, identityIndex) =>
      schedule(worldIndex * identities.length + identityIndex, identity, {
        own: 3,
        mismatch: -3,
        blind: identityIndex % 2 === 0 ? -0.25 : 0.25,
      })));
  const fiveModalSchedules = schedules.map((row) => ({
    ...row,
    ownPolicyIds: row.ownPolicyIds.map((policyId) =>
      policyId.startsWith("compact_counter:") ? "balanced:balanced" : policyId),
  }));
  const result = evaluateOwnSquadAgencySet({
    setName: "modal-gates",
    worldSeeds,
    schedules: fiveModalSchedules,
    declaredIdentityKeys: identities,
    constantQualityPolicyMoves: 6,
    constantQualityClubCount: 6,
    guardrails,
  });

  assert.equal(result.decision, "REFINE");
  assert.equal(result.failed.includes("modal_policy_diversity"), true);
  assert.equal(result.failed.includes("modal_policy_share"), true);
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

test("attributes the first canonical translation stage without treating volume as a gate", () => {
  const schedules = worldSeeds.flatMap((_worldSeed, worldIndex) =>
    identities.map((identity, identityIndex) =>
      schedule(worldIndex * identities.length + identityIndex, identity, {
        own: 3,
        mismatch: -3,
        blind: identityIndex % 2 === 0 ? -0.25 : 0.25,
      })));
  const volumeReversed = schedules.map((row) => ({
    ...row,
    meanSeasonFactsByArm: {
      ...row.meanSeasonFactsByArm,
      own_fit: {
        ...row.meanSeasonFactsByArm.own_fit,
        opportunitiesFor: 90,
        expectedGoalsFor: 32,
      },
    },
  }));
  const translated = evaluateOwnSquadAgencyTranslationSet({
    setName: "translated",
    schedules: volumeReversed,
  });

  assert.equal(translated.translation.firstFailedStage, "no_break");
  assert.equal(translated.translation.arms[0]?.diagnostics.netOpportunityDelta, -10);
  assert.equal(translated.translation.arms[0]?.netExpectedGoals.meanDelta, 2);
});

test("cross-set attribution is fail-closed when the first weak stage differs", () => {
  const schedules = worldSeeds.flatMap((_worldSeed, worldIndex) =>
    identities.map((identity, identityIndex) =>
      schedule(worldIndex * identities.length + identityIndex, identity, {
        own: 0.5,
        mismatch: -0.5,
        blind: identityIndex % 2 === 0 ? -0.25 : 0.25,
      })));
  const planBreak = evaluateOwnSquadAgencyTranslationSet({
    setName: "plan-break",
    schedules: schedules.map((row) => ({
      ...row,
      meanSeasonFactsByArm: {
        ...row.meanSeasonFactsByArm,
        own_fit: { ...row.meanSeasonFactsByArm.own_fit, expectedGoalsFor: 30 },
      },
    })),
  });
  const pointBreak = evaluateOwnSquadAgencyTranslationSet({ setName: "point-break", schedules });

  assert.equal(planBreak.translation.firstFailedStage, "plan_execution_not_established");
  assert.equal(pointBreak.translation.firstFailedStage, "goal_to_points_resolution");
  assert.equal(attributeOwnSquadAgencyTranslation([planBreak, pointBreak]), "mixed_not_attributed");
  assert.equal(attributeOwnSquadAgencyTranslation([pointBreak, pointBreak]), "goal_to_points_resolution");
});
