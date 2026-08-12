import assert from "node:assert/strict";
import { test } from "vitest";

import {
  deriveSuccessionDownstreamPlayerOutcome,
  evaluateSuccessionGrowthFeasibility,
  evaluateSuccessionPriorityComparison,
  evaluateSuccessionTargetAttribution,
  evaluateSuccessionDownstreamFunnel,
  successionGrowthFeasibilityStage,
  type SuccessionPriorityArmSummary,
} from "./succession-priority-attribution.ts";

test("bounded succession passes only with paired renewal and guardrails", () => {
  const legacy = arm(0.08, 0.25, 0.52, 0.82, 1_000);
  const candidate = arm(0.14, 0.29, 0.51, 0.81, 1_040);
  const result = evaluateSuccessionPriorityComparison({ legacy, candidate });

  assert.equal(result.decision, "GO");
  assert.equal(result.owner, "bounded_succession_order");
  assert.deepEqual(result.failedGateKeys, []);
  assert.equal(result.localCoherenceCount, 7);
  assert.equal(result.generatedLeaderCoherenceCount, 7);
});

test("leader movement without the linked local transition stops", () => {
  const result = evaluateSuccessionPriorityComparison({
    legacy: arm(0.08, 0.25, 0.52, 0.82, 1_000),
    candidate: arm(0.09, 0.29, 0.52, 0.82, 1_000),
  });

  assert.equal(result.decision, "STOP_RETHINK");
  assert.equal(result.failedGateKeys.includes("local_replacement_delta"), true);
});

test("local movement without leader realization reopens downstream selection", () => {
  const result = evaluateSuccessionPriorityComparison({
    legacy: arm(0.08, 0.25, 0.52, 0.82, 1_000),
    candidate: arm(0.14, 0.26, 0.52, 0.82, 1_000),
  });

  assert.equal(result.decision, "REFINE");
  assert.equal(result.owner, "downstream_selection");
});

test("formation and volume guardrails can independently fail", () => {
  const result = evaluateSuccessionPriorityComparison({
    legacy: arm(0.08, 0.25, 0.52, 0.82, 1_000),
    candidate: arm(0.14, 0.29, 0.52, 0.70, 1_060),
  });

  assert.equal(result.decision, "REFINE");
  assert.equal(result.failedGateKeys.includes("formation_identity_guardrail"), true);
  assert.equal(result.failedGateKeys.includes("transfer_volume_guardrail"), true);
});

test("fulfilled older opening players identify target eligibility", () => {
  const result = evaluateSuccessionTargetAttribution(targetFacts({
    fulfilled: 10,
    prime: 3,
    generatedPrime: 2,
    downstream: 1,
  }));

  assert.equal(result.decision, "OWNER_IDENTIFIED");
  assert.equal(result.owner, "target_eligibility");
});

test("prime generated acquisitions without realization identify downstream selection", () => {
  const result = evaluateSuccessionTargetAttribution(targetFacts({
    fulfilled: 10,
    prime: 7,
    generatedPrime: 5,
    downstream: 0,
  }));

  assert.equal(result.owner, "downstream_selection");
});

test("unknown origin stops target attribution", () => {
  const facts = targetFacts({ fulfilled: 10, prime: 7, generatedPrime: 5, downstream: 2 });
  const result = evaluateSuccessionTargetAttribution({
    ...facts,
    originCounts: { ...facts.originCounts, unknown: 1 },
  });

  assert.equal(result.decision, "STOP_RETHINK");
});

test("succession downstream funnel identifies one dominant real failure stage", () => {
  const result = evaluateSuccessionDownstreamFunnel({
    counts: downstreamCounts({ season_ten_leader: 20, no_buyer_appearance: 20 }),
    reconciliationFailureCount: 0,
  });
  assert.equal(result.decision, "OWNER_IDENTIFIED");
  assert.equal(result.owner, "no_buyer_appearance");
  assert.equal(result.dominantShare, 0.5);
});

test("succession downstream funnel keeps a distributed failure mixed", () => {
  const result = evaluateSuccessionDownstreamFunnel({
    counts: downstreamCounts({
      no_buyer_appearance: 12,
      below_450_buyer_minutes: 12,
      not_retained_two_seasons: 8,
      season_ten_leader: 8,
    }),
    reconciliationFailureCount: 0,
  });
  assert.equal(result.decision, "MIXED");
  assert.equal(result.owner, "mixed");
});

test("succession downstream funnel fails closed on empty or unreconciled facts", () => {
  assert.equal(evaluateSuccessionDownstreamFunnel({
    counts: downstreamCounts(),
    reconciliationFailureCount: 0,
  }).decision, "STOP_RETHINK");
  assert.equal(evaluateSuccessionDownstreamFunnel({
    counts: downstreamCounts({ season_ten_leader: 35 }),
    reconciliationFailureCount: 1,
  }).decision, "STOP_RETHINK");
});

test("succession downstream funnel refuses an owner below the frozen cohort floor", () => {
  const result = evaluateSuccessionDownstreamFunnel({
    counts: downstreamCounts({ below_half_ability_growth: 34 }),
    reconciliationFailureCount: 0,
  });

  assert.equal(result.decision, "STOP_RETHINK");
  assert.equal(result.owner, "underpowered_cohort");
  assert.equal(result.observationCount, 34);
});

test("succession downstream classification starts buyer use after the episode season", () => {
  const outcome = deriveSuccessionDownstreamPlayerOutcome({
    episodeSeasonNumber: 4,
    buyerClubId: "club:buyer",
    acquisitionCurrentAbility: 10,
    seasonTenLeader: false,
    useSeasons: [
      { clubId: "club:buyer", seasonNumber: 4, appearances: 34 },
      { clubId: "club:seller", seasonNumber: 5, appearances: 34 },
    ],
    playerSeasons: [
      { clubId: "club:buyer", seasonNumber: 4, minutes: 3_060, currentAbility: 10 },
      { clubId: "club:seller", seasonNumber: 5, minutes: 3_060, currentAbility: 11 },
    ],
  });

  assert.equal(outcome.stage, "no_buyer_appearance");
});

test("succession downstream classification reads retention at the second buyer season", () => {
  const outcome = deriveSuccessionDownstreamPlayerOutcome({
    episodeSeasonNumber: 4,
    buyerClubId: "club:buyer",
    acquisitionCurrentAbility: 10,
    seasonTenLeader: false,
    useSeasons: [
      { clubId: "club:buyer", seasonNumber: 5, appearances: 8 },
      { clubId: "club:buyer", seasonNumber: 6, appearances: 12 },
    ],
    playerSeasons: [
      { clubId: "club:buyer", seasonNumber: 5, minutes: 400, currentAbility: 10.3 },
      { clubId: "club:buyer", seasonNumber: 6, minutes: 700, currentAbility: 10.6 },
    ],
  });

  assert.equal(outcome.stage, "developed_not_leader");
  assert.equal(outcome.buyerMinutes, 1_100);
  assert.ok(Math.abs((outcome.realizedGrowth as number) - 0.6) < 1e-12);
});

test("growth feasibility prioritizes stored room before buyer load", () => {
  assert.equal(successionGrowthFeasibilityStage({
    acquisitionPotentialRoom: 0.49,
    buyerMinutes: 3_000,
  }), "insufficient_stored_room");
  assert.equal(successionGrowthFeasibilityStage({
    acquisitionPotentialRoom: 0.5,
    buyerMinutes: 1_799,
  }), "low_two_season_buyer_load");
  assert.equal(successionGrowthFeasibilityStage({
    acquisitionPotentialRoom: 0.5,
    buyerMinutes: 1_800,
  }), "development_not_realized");
});

test("growth feasibility identifies a majority and fails closed on drift", () => {
  const counts = {
    insufficient_stored_room: 31,
    low_two_season_buyer_load: 10,
    development_not_realized: 20,
  } as const;
  const result = evaluateSuccessionGrowthFeasibility({
    counts,
    expectedObservationCount: 61,
    reconciliationFailureCount: 0,
  });
  assert.equal(result.decision, "OWNER_IDENTIFIED");
  assert.equal(result.owner, "insufficient_stored_room");
  assert.equal(evaluateSuccessionGrowthFeasibility({
    counts,
    expectedObservationCount: 60,
    reconciliationFailureCount: 0,
  }).decision, "STOP_RETHINK");
});

function arm(
  local: number,
  generated: number,
  division: number,
  formations: number,
  transfers: number,
): SuccessionPriorityArmSummary {
  return {
    values: values(local, generated, division, formations),
    worlds: Array.from({ length: 7 }, (_, index) => ({
      worldSeed: `world-${index + 1}`,
      values: values(local, generated, division, formations),
    })),
    transferAcquisitionCount: transfers,
  };
}

function values(
  local: number,
  generated: number,
  division: number,
  formations: number,
) {
  return {
    localReplacementCapacity: local,
    careerGeneratedLeaderShareSeasonTen: generated,
    divisionReplacementCapacity: division,
    fourReplicatedFormationRetentionShare: formations,
  };
}

function targetFacts(input: {
  readonly fulfilled: number;
  readonly prime: number;
  readonly generatedPrime: number;
  readonly downstream: number;
}) {
  return {
    fulfilledEpisodeCount: input.fulfilled,
    distinctAcquiredPlayerCount: input.fulfilled,
    ageBandCounts: { under_21: 0, "21_29": input.prime, "30_32": 0, "33_plus": 0 },
    originCounts: {
      opening_senior: input.fulfilled - input.generatedPrime,
      opening_academy: 0,
      annual_academy_intake: input.generatedPrime,
      annual_senior_intake: 0,
      unknown: 0,
    },
    primeAgeAcquisitionCount: input.prime,
    careerGeneratedPrimeAgeAcquisitionCount: input.generatedPrime,
    careerGeneratedPrimeAgeDownstreamCount: input.downstream,
    localReplacementIntersectionCount: input.downstream,
    divisionReplacementIntersectionCount: input.downstream,
    seasonTenLeaderIntersectionCount: 0,
    reconciliationFailureCount: 0,
  };
}

function downstreamCounts(
  overrides: Partial<Record<
    "season_ten_leader" | "no_buyer_appearance" | "below_450_buyer_minutes"
    | "not_retained_two_seasons" | "below_half_ability_growth"
    | "developed_not_leader",
    number
  >> = {},
) {
  return {
    season_ten_leader: 0,
    no_buyer_appearance: 0,
    below_450_buyer_minutes: 0,
    not_retained_two_seasons: 0,
    below_half_ability_growth: 0,
    developed_not_leader: 0,
    ...overrides,
  };
}
