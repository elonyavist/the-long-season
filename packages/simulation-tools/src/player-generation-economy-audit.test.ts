import assert from "node:assert/strict";
import { test } from "vitest";

import {
  createPlayerGenerationEconomyAudit,
  type CreatePlayerGenerationEconomyAuditInput,
  type PlayerGenerationEconomyObservation,
} from "./player-generation-economy-audit.ts";

const constraints = {
  establishedCurrentSixMinimum: 1,
  establishedCurrentSixMaximum: 2,
  youngStoredCeilingSixMinimum: 1,
  youngStoredCeilingSixMaximum: 2,
  lowerDivisionYoungStoredCeilingSixMaximum: 1,
} as const;

const input: CreatePlayerGenerationEconomyAuditInput = {
  hardCapMinorUnits: 15_000_000_000,
  initialRarityConstraints: constraints,
  observations: [
    player({
      observationId: "world:one|0|player:one",
      playerId: "player:one",
      playerName: "Prospect One",
      age: 16,
      currentRating: 2,
      p50: 5,
      upper: 5.5,
      storedCeiling: 6,
      value: 2_000_000_000,
      asking: 3_000_000_000,
      archetype: "rare_prodigy",
      allocation: {
        establishedCurrentSixAllocated: false,
        youngStoredCeilingSixAllocated: true,
        youngStoredCeilingSixCurrentRatingGuardrail: {
          minimumRating: 2,
          maximumRating: 3,
        },
      },
    }),
    player({
      observationId: "world:one|0|player:two",
      playerId: "player:two",
      playerName: "Champion Two",
      age: 25,
      currentRating: 6,
      p50: 6,
      upper: 6,
      value: 15_000_000_000,
      asking: 18_000_000_000,
      archetype: "category_star",
      allocation: {
        establishedCurrentSixAllocated: true,
        youngStoredCeilingSixAllocated: false,
      },
      hardCapEligible: true,
    }),
    player({
      observationId: "world:one|0|player:three",
      playerId: "player:three",
      playerName: "Senior Three",
      age: 31,
      currentRating: 5.5,
      p50: 5.5,
      upper: 5.5,
      value: 14_999_999_900,
      archetype: "category_star",
      allocation: {
        establishedCurrentSixAllocated: false,
        youngStoredCeilingSixAllocated: false,
      },
    }),
    player({
      observationId: "world:one|0|player:four",
      playerId: "player:four",
      playerName: "Champion Four",
      age: 24,
      currentRating: 6,
      p50: 6,
      upper: 6,
      value: 14_000_000_000,
      archetype: "category_star",
      allocation: {
        establishedCurrentSixAllocated: true,
        youngStoredCeilingSixAllocated: false,
      },
      hardCapEligible: true,
    }),
  ],
  intrinsicValueInvarianceObservations: [
    ...(["owner_category", "promotion_relegation", "transfer", "contract_expiry", "free_agent"] as const).map(
      (transition) => ({
        observationId: `value:${transition}`,
        playerId: "player:one",
        transition,
        beforeContextFingerprint: `${transition}:before`,
        afterContextFingerprint: `${transition}:after`,
        beforePublicValueMinorUnits: 2_000_000_000,
        afterPublicValueMinorUnits: 2_000_000_000,
      }),
    ),
  ],
  freeAgentSigningObservations: [{
    observationId: "free-agent:one",
    playerId: "player:one",
    completedSigningFingerprint: "signing:one",
    publicValueMinorUnits: 2_000_000_000,
    transferFeeMinorUnits: 0,
  }],
  aiInformationParityObservations: [
    ...(["target_ranking", "offer_selection", "willingness"] as const).map(
      (decisionKind) => ({
        observationId: `ai:${decisionKind}`,
        decisionKind,
        leftStoredCeilingRating: 4 as const,
        rightStoredCeilingRating: 6 as const,
        leftPublicAssessmentFingerprint: "public:shared",
        rightPublicAssessmentFingerprint: "public:shared",
        leftDecisionFingerprint: "decision:shared",
        rightDecisionFingerprint: "decision:shared",
      }),
    ),
  ],
  negotiationObservations: [
    {
      negotiationId: "negotiation:one",
      playerId: "player:one",
      playerName: "Prospect One",
      age: 16,
      seasonStartYear: 2026,
      division: "first_division",
      askingPriceMinorUnits: 3_000_000_000,
      offeredFeeMinorUnits: 2_400_000_000,
      counterFeeMinorUnits: 2_800_000_000,
      agreedFeeMinorUnits: 2_800_000_000,
      completedFeeMinorUnits: 2_800_000_000,
      sellerOutcome: "countered",
      counterOutcome: "accepted",
    },
    {
      negotiationId: "negotiation:two",
      playerId: "player:two",
      playerName: "Champion Two",
      age: 25,
      seasonStartYear: 2026,
      division: "first_division",
      askingPriceMinorUnits: 18_000_000_000,
      offeredFeeMinorUnits: 18_000_000_000,
      agreedFeeMinorUnits: 18_000_000_000,
      completedFeeMinorUnits: 18_000_000_000,
      sellerOutcome: "accepted",
      counterOutcome: "not_observed",
    },
    {
      negotiationId: "negotiation:three",
      playerId: "player:three",
      playerName: "Senior Three",
      age: 31,
      seasonStartYear: 2026,
      division: "first_division",
      askingPriceMinorUnits: 12_000_000_000,
      offeredFeeMinorUnits: 8_400_000_000,
      sellerOutcome: "rejected",
      counterOutcome: "not_observed",
    },
  ],
  suppliedNegotiationAggregates: [{
    sourceLabel: "phase79c-10x10",
    offerCount: 23_718,
    sellerCounterCount: 0,
    permanentCompletionCount: 12_237,
    askingPriceDistribution: distribution(12_237),
    completedFeeDistribution: distribution(12_237),
  }],
  annualIntakeObservations: [
    {
      seasonIndex: 0,
      allocatedStoredCeilingSixPlayerIds: ["player:intake-one"],
      generatedStoredCeilingSixPlayerIds: ["player:intake-one"],
      acceptedStoredCeilingSixPlayerIds: ["player:intake-one"],
      activeStoredCeilingSixPlayerIds: ["player:intake-one"],
    },
    {
      seasonIndex: 1,
      allocatedStoredCeilingSixPlayerIds: [],
      generatedStoredCeilingSixPlayerIds: [],
      acceptedStoredCeilingSixPlayerIds: [],
      activeStoredCeilingSixPlayerIds: ["player:intake-one"],
    },
  ],
  exceptionalStockSnapshots: [
    {
      observationId: "world:one|stock|0",
      worldId: "world:one",
      seasonIndex: 0,
      targetYoungStoredCeilingSixCount: 4,
      players: [
        stockPlayer("stock:senior", "senior", "club:a", "first_division", 5.5),
        stockPlayer(
          "stock:academy",
          "academy",
          "club:b",
          "first_division",
          6,
          6,
          "playoff_contender",
        ),
        stockPlayer("stock:loaned", "loaned", "club:c", "first_division", 5.5),
        stockPlayer("stock:free", "free_agent", null, "free_agent", 5.5),
        stockPlayer("stock:routine", "senior", "club:d", "first_division", 5, 5),
      ],
    },
    {
      observationId: "world:one|stock|1",
      worldId: "world:one",
      seasonIndex: 1,
      targetYoungStoredCeilingSixCount: 4,
      players: [
        stockPlayer("stock:senior", "senior", "club:a", "first_division", 5.5),
        stockPlayer(
          "stock:academy",
          "academy",
          "club:b",
          "first_division",
          6,
          6,
          "playoff_contender",
        ),
        stockPlayer("stock:loaned", "loaned", "club:c", "first_division", 5.5),
        stockPlayer(
          "stock:replacement",
          "promotion_candidate",
          "club:e",
          "first_division",
          5.5,
        ),
        stockPlayer("stock:routine", "senior", "club:d", "first_division", 5, 5),
      ],
    },
  ],
};

test("reports joint ranges, effective allocations, cap safety, and stage-aware spreads", () => {
  const report = createPlayerGenerationEconomyAudit(input);

  assert.equal(report.observationCount, 4);
  assert.equal(report.currentSix.observationCount, 2);
  assert.equal(report.currentSix.minimumAge, 24);
  assert.equal(report.initialEstablishedCurrentSix.observationCount, 2);
  assert.equal(report.initialYoungStoredCeilingSix.observationCount, 1);
  assert.equal(report.storedCeilingSix.observationCount, 3);
  assert.equal(report.storedCeilingSix.minimumAge, 16);
  assert.deepEqual(report.storedCeilingSix.archetypeCounts, {
    category_star: 2,
    rare_prodigy: 1,
  });
  assert.equal(report.publicUpperSix.observationCount, 2);
  assert.equal(report.publicUpperSix.minimumAge, 24);
  assert.equal(report.ratingProfile.observationCount, 4);
  assert.equal(report.ratingProfile.currentRatingDistribution.observationCount, 4);
  assert.equal(report.ratingProfile.publicP50RatingDistribution.observationCount, 4);
  assert.equal(report.ratingProfile.publicUpperRatingDistribution.observationCount, 4);
  assert.equal(report.ratingProfile.storedCeilingRatingDistribution.observationCount, 4);
  assert.equal(report.ageSeventeenPublicUpside.observationCount, 0);
  assert.equal(report.ageSeventeenPublicUpside.atLeastOneFullStarShareBasisPoints, null);
  assert.equal(report.publicPotentialRanges[0]?.observationCount, 1);
  assert.equal(report.allocation.effectiveEstablishedCurrentSixCount, 2);
  assert.equal(report.allocation.effectiveYoungStoredCeilingSixCount, 1);
  assert.equal(report.cap.eligibleObservationCount, 2);
  assert.equal(report.cap.eligibleExactHardCapCount, 1);
  assert.equal(report.cap.ineligibleRenderedAsHardCapCount, 0);
  assert.equal(report.intrinsicValueInvariance.observationCount, 5);
  assert.equal(report.intrinsicValueInvariance.mismatchCount, 0);
  assert.equal(report.freeAgentSignings.observationCount, 1);
  assert.equal(report.freeAgentSignings.nonZeroTransferFeeCount, 0);
  assert.equal(report.aiInformationParity.observationCount, 3);
  assert.equal(report.aiInformationParity.violationCount, 0);
  assert.equal(report.negotiations.offeredAskingRatioDistribution.observationCount, 3);
  assert.equal(report.negotiations.counterAskingRatioDistribution.observationCount, 1);
  assert.equal(report.negotiations.agreedAskingRatioDistribution.observationCount, 2);
  assert.equal(report.negotiations.exactAskingOfferedEqualityCount, 1);
  assert.equal(report.negotiations.exactAskingOfferedEqualityShareBasisPoints, 3_333);
  assert.equal(report.negotiations.exactAskingCompletedEqualityCount, 1);
  assert.equal(report.negotiations.completedAfterCounterCount, 1);
  assert.equal(report.negotiations.sellerOutcomeCounts.countered, 1);
  assert.equal(report.negotiations.counterOutcomeCounts.accepted, 1);
  assert.equal(report.annualIntake.acceptedStoredCeilingSixCount, 1);
  assert.equal(report.youngExceptionalStock.observationCount, 2);
  assert.equal(report.youngExceptionalStock.activePlayerObservationCount, 10);
  assert.equal(report.youngExceptionalStock.youngStoredCeilingSixObservationCount, 8);
  assert.equal(report.youngExceptionalStock.youngPublicUpperSixObservationCount, 2);
  assert.equal(report.youngExceptionalStock.transitionObservationCount, 1);
  assert.equal(report.youngExceptionalStock.requiredReplacementObservationCount, 1);
  assert.equal(report.youngExceptionalStock.completedReplacementCount, 1);
  assert.equal(report.youngExceptionalStock.missingReplacementCount, 0);
  assert.equal(report.youngExceptionalStock.inflationArrivalCount, 0);
  assert.equal(report.youngExceptionalStock.stockEntryObservationCount, 2);
  assert.equal(report.youngExceptionalStock.stockEntryPlayerObservationCount, 5);
  assert.equal(
    report.youngExceptionalStock.stockEntryCategoryPlacementViolationCount,
    0,
  );
  assert.equal(
    report.youngExceptionalStock.stockEntryClubUniquenessViolationCount,
    0,
  );
  assert.deepEqual(
    report.youngExceptionalStock.stockEntries.map((entry) => ({
      kind: entry.entryKind,
      players: entry.entryPlayerIds,
    })),
    [
      {
        kind: "opening_allocation",
        players: ["stock:academy", "stock:free", "stock:loaned", "stock:senior"],
      },
      {
        kind: "stock_arrival",
        players: ["stock:replacement"],
      },
    ],
  );
  for (const key of [
    "young_stored_ceiling_six_stock_arrival_category_placement",
    "young_stored_ceiling_six_stock_arrival_club_uniqueness",
  ]) {
    assert.equal(
      report.gates.find((gate) => gate.key === key)?.observationCount,
      5,
    );
  }
  assert.equal(
    report.gates.find(
      ({ key }) => key === "young_stored_ceiling_six_vacancy_replacement",
    )?.observationCount,
    1,
  );
  assert.deepEqual(
    report.gates.find(
      ({ key }) => key === "young_stored_ceiling_six_vacancy_replacement",
    )?.cohortMinimumEvidence,
    {
      evidenceObservationCount: 1,
      minimumObservationCount: 1,
    },
  );
  assert.equal(
    report.youngExceptionalStock.snapshots[0]
      ?.targetYoungStoredCeilingSixCount,
    4,
  );
  assert.deepEqual(report.youngExceptionalStock.snapshots[0]?.populationCounts, {
    senior: 1,
    academy: 1,
    promotion_candidate: 0,
    free_agent: 1,
    loaned: 1,
  });
  assert.equal(
    report.youngExceptionalStock.snapshots[1]
      ?.populationCounts.promotion_candidate,
    1,
  );
  assert.equal(
    report.youngExceptionalStock.snapshots[1]?.populationCounts.academy,
    1,
  );
  assert.deepEqual(report.youngExceptionalStock.snapshots[0]?.placementCounts, {
    first_division: 3,
    second_division: 0,
    third_division: 0,
    unattached: 1,
  });
  assert.equal(
    report.youngExceptionalStock.snapshots[0]
      ?.firstDivisionOutsideStrongClubCount,
    0,
  );
  assert.deepEqual(
    report.youngExceptionalStock.snapshots[0]?.youngStoredCeilingSixPlayerIds,
    ["stock:academy", "stock:free", "stock:loaned", "stock:senior"],
  );
  assert.equal(report.suppliedNegotiationAggregates[0]?.offerCount, 23_718);
  const prospectShareGates = report.gates.filter(({ key }) =>
    key.startsWith("young_stored_ceiling_prospect_share_")
  );
  assert.equal(
    report.gates
      .filter(({ key }) =>
        !key.startsWith("young_stored_ceiling_prospect_share_")
        && key !== "age_seventeen_senior_public_upside_observations"
      )
      .every(({ status }) => status === "pass"),
    true,
  );
  assert.equal(
    report.gates
      .filter(({ key }) =>
        !key.startsWith("young_stored_ceiling_prospect_share_")
        && key !== "age_seventeen_senior_public_upside_observations"
      )
      .every(({ observationCount }) => observationCount > 0),
    true,
  );
  assert.deepEqual(
    prospectShareGates.map(({ status }) => status),
    ["pass", "not_evaluated", "not_evaluated"],
  );
  assert.deepEqual(prospectShareGates[0]?.cohortShareEvidence, {
    matchingObservationCount: 1,
    minimumBasisPoints: 1_500,
    maximumBasisPoints: 2_500,
  });
  assert.equal(
    gateStatus(report, "age_seventeen_senior_public_upside_observations"),
    "not_evaluated",
  );
});

test("keeps cap, context, free-agent, and AI gates non-vacuous and actionable", () => {
  const report = createPlayerGenerationEconomyAudit({
    ...input,
    observations: input.observations.map((observation) =>
      observation.hardCapEligible
        ? { ...observation, publicValueMinorUnits: input.hardCapMinorUnits }
        : observation
    ),
    intrinsicValueInvarianceObservations: [{
      observationId: "value:mismatch",
      playerId: "player:one",
      transition: "transfer",
      beforeContextFingerprint: "transfer:before",
      afterContextFingerprint: "transfer:before",
      beforePublicValueMinorUnits: 100,
      afterPublicValueMinorUnits: 100,
    }],
    freeAgentSigningObservations: [{
      observationId: "free-agent:mismatch",
      playerId: "player:one",
      completedSigningFingerprint: "signing:mismatch",
      publicValueMinorUnits: 100,
      transferFeeMinorUnits: 1,
    }],
    aiInformationParityObservations: [{
      observationId: "ai:mismatch",
      decisionKind: "target_ranking",
      leftStoredCeilingRating: 4,
      rightStoredCeilingRating: 6,
      leftPublicAssessmentFingerprint: "public:shared",
      rightPublicAssessmentFingerprint: "public:shared",
      leftDecisionFingerprint: "decision:left",
      rightDecisionFingerprint: "decision:right",
    }],
  });

  const hardCapGate = report.gates.find(
    ({ key }) => key === "hard_cap_eligibility_and_display",
  );
  assert.equal(hardCapGate?.status, "pass");
  assert.deepEqual(hardCapGate?.cohortShareEvidence, {
    matchingObservationCount: 2,
    minimumBasisPoints: 0,
    maximumBasisPoints: 9_999,
  });
  assert.equal(gateStatus(report, "intrinsic_public_value_invariance_transfer"), "fail");
  assert.equal(gateStatus(report, "free_agent_zero_fee_and_value"), "fail");
  assert.equal(gateStatus(report, "ai_information_parity_target_ranking"), "fail");
  assert.equal(gateStatus(report, "ai_information_parity_offer_selection"), "not_evaluated");
});

test("hard-cap cohort evidence still fails an ineligible exact or rendered collision locally", () => {
  let replaced = false;
  const report = createPlayerGenerationEconomyAudit({
    ...input,
    observations: input.observations.map((observation) => {
      if (replaced || observation.hardCapEligible) return observation;
      replaced = true;
      return {
        ...observation,
        publicValueMinorUnits: input.hardCapMinorUnits,
      };
    }),
  });
  const gate = report.gates.find(
    ({ key }) => key === "hard_cap_eligibility_and_display",
  );

  assert.equal(replaced, true);
  assert.equal(gate?.status, "fail");
  assert.equal((gate?.violationCount ?? 0) > 0, true);
});

test("reports age-17 public upside and young stored-ceiling shares with fixed denominators", () => {
  const observations: readonly PlayerGenerationEconomyObservation[] = [
    diagnosticPlayer({
      id: "young:first:full-upside",
      age: 17,
      division: "first_division",
      currentRating: 2,
      p50: 2.5,
      upper: 3,
      storedCeiling: 4,
    }),
    diagnosticPlayer({
      id: "young:first:half-upside",
      age: 17,
      division: "first_division",
      currentRating: 2,
      p50: 2,
      upper: 2.5,
      storedCeiling: 3,
    }),
    diagnosticPlayer({
      id: "young:second:prospect",
      age: 16,
      division: "second_division",
      currentRating: 2,
      p50: 2.5,
      upper: 3,
      storedCeiling: 4,
    }),
    diagnosticPlayer({
      id: "young:third:prospect",
      age: 20,
      division: "third_division",
      currentRating: 2.5,
      p50: 3,
      upper: 3.5,
      storedCeiling: 3.5,
    }),
    diagnosticPlayer({
      id: "young:third:routine",
      age: 20,
      division: "third_division",
      currentRating: 2,
      p50: 2.5,
      upper: 3,
      storedCeiling: 3,
    }),
    diagnosticPlayer({
      id: "older:first:excluded",
      age: 21,
      division: "first_division",
      currentRating: 3,
      p50: 3.5,
      upper: 4,
      storedCeiling: 5,
    }),
  ];
  const report = createPlayerGenerationEconomyAudit({
    hardCapMinorUnits: input.hardCapMinorUnits,
    initialRarityConstraints: constraints,
    observations,
  });

  assert.equal(report.ratingProfile.observationCount, 6);
  assert.deepEqual(report.ageSeventeenPublicUpside, {
    age: 17,
    observationCount: 2,
    atLeastOneFullStarCount: 1,
    atLeastOneFullStarShareBasisPoints: 5_000,
    ratingProfile: {
      observationCount: 2,
      currentRatingDistribution: ratingDistribution(2, 2, 2, 2, 2),
      publicP50RatingDistribution: ratingDistribution(2, 2, 2.5, 2.5, 2.5),
      publicUpperRatingDistribution: ratingDistribution(2, 2.5, 3, 3, 3),
      storedCeilingRatingDistribution: ratingDistribution(2, 3, 3.5, 4, 4),
    },
  });
  assert.equal(
    gateStatus(report, "age_seventeen_senior_public_upside_observations"),
    "pass",
  );
  assert.deepEqual(
    report.youngStoredCeilingProspectShares.map((summary) => ({
      category: summary.category,
      observationCount: summary.observationCount,
      matchingObservationCount: summary.matchingObservationCount,
      shareBasisPoints: summary.shareBasisPoints,
    })),
    [
      {
        category: "first_division",
        observationCount: 2,
        matchingObservationCount: 1,
        shareBasisPoints: 5_000,
      },
      {
        category: "second_division",
        observationCount: 1,
        matchingObservationCount: 1,
        shareBasisPoints: 10_000,
      },
      {
        category: "third_division",
        observationCount: 2,
        matchingObservationCount: 1,
        shareBasisPoints: 5_000,
      },
    ],
  );
  const ageSeventeenRange = report.publicPotentialRanges.find(
    ({ age, roleGroup }) => age === 17 && roleGroup === "outfield",
  );
  assert.equal(ageSeventeenRange?.currentRatingDistribution.observationCount, 2);
  assert.equal(ageSeventeenRange?.p50RatingDistribution.observationCount, 2);
  assert.equal(ageSeventeenRange?.upperRatingDistribution.observationCount, 2);
  assert.equal(ageSeventeenRange?.storedCeilingRatingDistribution.observationCount, 2);
});

test("keeps academy players outside the age-17 senior upside denominator", () => {
  const senior = diagnosticPlayer({
    id: "age17:senior",
    age: 17,
    division: "first_division",
    currentRating: 2,
    p50: 2.5,
    upper: 3,
    storedCeiling: 4,
  });
  const academy = {
    ...diagnosticPlayer({
      id: "age17:academy",
      age: 17,
      division: "first_division",
      currentRating: 2,
      p50: 3,
      upper: 4,
      storedCeiling: 5,
    }),
    population: "academy" as const,
    squadPlacement: "academy" as const,
  };
  const report = createPlayerGenerationEconomyAudit({
    hardCapMinorUnits: input.hardCapMinorUnits,
    initialRarityConstraints: constraints,
    observations: [senior, academy],
  });

  assert.equal(report.ageSeventeenPublicUpside.observationCount, 1);
  assert.equal(report.ageSeventeenPublicUpside.atLeastOneFullStarCount, 1);
  assert.equal(
    gateStatus(report, "age_seventeen_senior_public_upside_observations"),
    "pass",
  );
});

test("exposes additive senior prospect-share evidence with positive category denominators", () => {
  const categoryPlayers = (
    category: "first_division" | "second_division" | "third_division",
    count: number,
    matchingCount: number,
  ) => Array.from({ length: count }, (_, index) => diagnosticPlayer({
    id: `share:${category}:${index}`,
    age: 18,
    division: category,
    currentRating: 2,
    p50: index < matchingCount ? 3 : 2.5,
    upper: index < matchingCount ? 3.5 : 3,
    storedCeiling: index < matchingCount ? 3.5 : 3,
  }));
  const seniorPlayers = [
    ...categoryPlayers("first_division", 20, 4),
    ...categoryPlayers("second_division", 10, 1),
    ...categoryPlayers("third_division", 20, 1),
  ];
  const academyProspect = {
    ...diagnosticPlayer({
      id: "share:first_division:academy",
      age: 18,
      division: "first_division",
      currentRating: 2,
      p50: 4,
      upper: 5,
      storedCeiling: 6,
    }),
    population: "academy" as const,
    squadPlacement: "academy" as const,
  };
  const report = createPlayerGenerationEconomyAudit({
    hardCapMinorUnits: input.hardCapMinorUnits,
    initialRarityConstraints: constraints,
    observations: [...seniorPlayers, academyProspect],
  });

  assert.deepEqual(
    report.youngStoredCeilingProspectShares.map((share) => ({
      category: share.category,
      observationCount: share.observationCount,
      matchingObservationCount: share.matchingObservationCount,
      shareBasisPoints: share.shareBasisPoints,
    })),
    [
      {
        category: "first_division",
        observationCount: 20,
        matchingObservationCount: 4,
        shareBasisPoints: 2_000,
      },
      {
        category: "second_division",
        observationCount: 10,
        matchingObservationCount: 1,
        shareBasisPoints: 1_000,
      },
      {
        category: "third_division",
        observationCount: 20,
        matchingObservationCount: 1,
        shareBasisPoints: 500,
      },
    ],
  );
  const expectedEvidenceByCategory = {
    first_division: {
      matchingObservationCount: 4,
      minimumBasisPoints: 1_500,
      maximumBasisPoints: 2_500,
    },
    second_division: {
      matchingObservationCount: 1,
      minimumBasisPoints: 800,
      maximumBasisPoints: 1_500,
    },
    third_division: {
      matchingObservationCount: 1,
      minimumBasisPoints: 400,
      maximumBasisPoints: 800,
    },
  } as const;
  for (const category of [
    "first_division",
    "second_division",
    "third_division",
  ] as const) {
    const gate = report.gates.find(
      ({ key }) => key === `young_stored_ceiling_prospect_share_${category}`,
    );
    assert.equal(gate?.status, "pass");
    assert.equal((gate?.observationCount ?? 0) > 0, true);
    assert.deepEqual(
      gate?.cohortShareEvidence,
      expectedEvidenceByCategory[category],
    );
  }
});

test("zero required populations stay not evaluated instead of passing", () => {
  const empty = createPlayerGenerationEconomyAudit({
    hardCapMinorUnits: input.hardCapMinorUnits,
    initialRarityConstraints: constraints,
    observations: [],
  });

  assert.equal(empty.negotiations.evaluationStatus, "not_evaluated");
  assert.equal(empty.annualIntake.evaluationStatus, "not_evaluated");
  assert.equal(
    empty.gates.every(({ status }) => status === "not_evaluated"),
    true,
  );
});

test("joint contradictions fail with named actionable examples", () => {
  const invalid = createPlayerGenerationEconomyAudit({
    ...input,
    observations: [{
      ...input.observations[1]!,
      age: 15,
      archetype: "rare_prodigy",
      publicPotentialP50Rating: 4.5,
    }],
    negotiationObservations: [],
    annualIntakeObservations: [],
  });

  const current = invalid.gates.find(
    ({ key }) => key === "initial_established_current_six_stock",
  );
  const ordering = invalid.gates.find(
    ({ key }) => key === "public_potential_range_ordering",
  );
  assert.equal(current?.status, "fail");
  assert.equal(current?.examples[0]?.playerName, "Champion Two");
  assert.equal(current?.examples[0]?.seasonStartYear, 2025);
  assert.equal(ordering?.status, "fail");
});

test("requires established current-six players to be older than twenty", () => {
  const champion = input.observations[1]!;
  const report = createPlayerGenerationEconomyAudit({
    hardCapMinorUnits: input.hardCapMinorUnits,
    initialRarityConstraints: constraints,
    observations: [
      {
        ...champion,
        observationId: "world:one|0|champion:age-20",
        playerId: "champion:age-20",
        playerName: "Age Twenty",
        age: 20,
      },
      {
        ...champion,
        observationId: "world:one|0|champion:age-21",
        playerId: "champion:age-21",
        playerName: "Age Twenty One",
        age: 21,
      },
    ],
  });

  const gate = report.gates.find(
    ({ key }) => key === "initial_established_current_six_stock",
  );
  assert.equal(gate?.observationCount, 2);
  assert.equal(gate?.violationCount, 1);
  assert.equal(gate?.status, "fail");
  assert.equal(
    gate?.threshold,
    "allocated opening champions are current six, age >20, senior first-team players at strong First Division clubs",
  );
  assert.equal(gate?.examples[0]?.age, 20);
  assert.equal(gate?.examples[0]?.playerName, "Age Twenty");
});

test("checks young exceptional current rating against the supplied content guardrail", () => {
  const prospect = input.observations[0]!;
  const report = createPlayerGenerationEconomyAudit({
    ...input,
    observations: [{ ...prospect, currentRating: 3.5 }],
  });

  const gate = report.gates.find(
    ({ key }) => key === "initial_young_stored_ceiling_six_stock",
  );
  assert.equal(gate?.observationCount, 1);
  assert.equal(gate?.violationCount, 1);
  assert.equal(gate?.status, "fail");
});

test("requires positive value for every stored-ceiling-six observation", () => {
  const champion = input.observations[1]!;
  const report = createPlayerGenerationEconomyAudit({
    ...input,
    observations: [{ ...champion, publicValueMinorUnits: 0 }],
  });

  const gate = report.gates.find(
    ({ key }) => key === "stored_ceiling_six_joint_profile",
  );
  assert.equal(gate?.observationCount, 1);
  assert.equal(gate?.violationCount, 1);
  assert.equal(gate?.status, "fail");
});

test("fails complete-stock placement, uniqueness, replacement, and inflation contradictions", () => {
  const stock = createPlayerGenerationEconomyAudit({
    hardCapMinorUnits: input.hardCapMinorUnits,
    initialRarityConstraints: constraints,
    observations: [],
    exceptionalStockSnapshots: [
      stockSnapshot("duplicate", 0, 4, [
        stockPlayer("duplicate:one", "senior", "club:same", "first_division", 5.5),
        stockPlayer(
          "duplicate:two",
          "academy",
          "club:same",
          "first_division",
          5.5,
          6,
          "mid_table",
        ),
        stockPlayer("duplicate:outside-one", "senior", "club:lower", "second_division", 5.5),
        stockPlayer("duplicate:outside-two", "free_agent", null, "free_agent", 5.5),
      ]),
      stockSnapshot("inflation", 0, 4, stockPlayers("inflation", 4)),
      stockSnapshot("inflation", 1, 4, stockPlayers("inflation", 6)),
      stockSnapshot("missing", 0, 4, stockPlayers("missing", 4)),
      stockSnapshot("missing", 1, 4, stockPlayers("missing", 3)),
    ],
  });

  assert.equal(stock.youngExceptionalStock.observationCount, 5);
  assert.equal(stock.youngExceptionalStock.requiredReplacementObservationCount, 1);
  assert.equal(stock.youngExceptionalStock.missingReplacementCount, 1);
  assert.equal(stock.youngExceptionalStock.inflationArrivalCount, 2);
  for (const key of [
    "young_stored_ceiling_six_active_stock",
    "young_stored_ceiling_six_stock_arrival_category_placement",
    "young_stored_ceiling_six_stock_arrival_club_uniqueness",
    "young_stored_ceiling_six_vacancy_replacement",
    "young_stored_ceiling_six_no_inflation",
  ]) {
    assert.equal(stock.gates.find((gate) => gate.key === key)?.status, "fail");
  }
});

test("keeps later market placement drift descriptive instead of blaming generation", () => {
  const openingPlayers = stockPlayers("drift", 4);
  const report = createPlayerGenerationEconomyAudit({
    hardCapMinorUnits: input.hardCapMinorUnits,
    initialRarityConstraints: constraints,
    observations: [],
    exceptionalStockSnapshots: [
      stockSnapshot("drift", 0, 4, openingPlayers),
      stockSnapshot("drift", 1, 4, [
        stockPlayer(
          "drift:player:0",
          "senior",
          "drift:club:shared",
          "second_division",
          5.5,
        ),
        stockPlayer(
          "drift:player:1",
          "academy",
          "drift:club:shared",
          "second_division",
          5.5,
        ),
        openingPlayers[2]!,
        openingPlayers[3]!,
      ]),
    ],
  });

  const closingSnapshot = report.youngExceptionalStock.snapshots[1];
  assert.equal(closingSnapshot?.outsideFirstDivisionCount, 2);
  assert.equal(closingSnapshot?.clubUniquenessViolationCount, 1);
  assert.equal(report.youngExceptionalStock.stockEntryObservationCount, 1);
  assert.equal(report.youngExceptionalStock.stockEntryPlayerObservationCount, 4);
  assert.equal(
    report.gates.find(
      ({ key }) =>
        key === "young_stored_ceiling_six_stock_arrival_category_placement",
    )?.status,
    "pass",
  );
  assert.equal(
    report.gates.find(
      ({ key }) =>
        key === "young_stored_ceiling_six_stock_arrival_club_uniqueness",
    )?.status,
    "pass",
  );
});

test("fails when a new stock arrival introduces weak placement and club concentration", () => {
  const openingPlayers = stockPlayers("arrival", 4);
  const report = createPlayerGenerationEconomyAudit({
    hardCapMinorUnits: input.hardCapMinorUnits,
    initialRarityConstraints: constraints,
    observations: [],
    exceptionalStockSnapshots: [
      stockSnapshot("arrival", 0, 4, openingPlayers),
      stockSnapshot("arrival", 1, 4, [
        openingPlayers[0]!,
        openingPlayers[1]!,
        openingPlayers[2]!,
        stockPlayer(
          "arrival:new",
          "academy",
          "arrival:club:0",
          "first_division",
          5.5,
          6,
          "mid_table",
        ),
      ]),
    ],
  });

  assert.equal(report.youngExceptionalStock.stockEntryObservationCount, 2);
  assert.equal(report.youngExceptionalStock.stockEntryPlayerObservationCount, 5);
  assert.equal(
    report.youngExceptionalStock.stockEntryCategoryPlacementViolationCount,
    1,
  );
  assert.equal(
    report.youngExceptionalStock.stockEntryClubUniquenessViolationCount,
    1,
  );
  assert.equal(
    report.youngExceptionalStock.stockEntries[1]
      ?.introducedCategoryPlacementViolationCount,
    1,
  );
  assert.equal(
    report.youngExceptionalStock.stockEntries[1]
      ?.introducedClubUniquenessViolationCount,
    1,
  );
  assert.equal(
    report.gates.find(
      ({ key }) =>
        key === "young_stored_ceiling_six_stock_arrival_category_placement",
    )?.status,
    "fail",
  );
  assert.equal(
    report.gates.find(
      ({ key }) =>
        key === "young_stored_ceiling_six_stock_arrival_club_uniqueness",
    )?.status,
    "fail",
  );
});

test("fails when a target-five stock snapshot closes with only four players", () => {
  const report = createPlayerGenerationEconomyAudit({
    hardCapMinorUnits: input.hardCapMinorUnits,
    initialRarityConstraints: constraints,
    observations: [],
    exceptionalStockSnapshots: [
      stockSnapshot("target-five", 0, 5, stockPlayers("target-five", 5)),
      stockSnapshot("target-five", 1, 5, stockPlayers("target-five", 4)),
    ],
  });

  assert.equal(
    report.gates.find(
      ({ key }) => key === "young_stored_ceiling_six_active_stock",
    )?.status,
    "fail",
  );
  assert.equal(
    report.youngExceptionalStock.transitions[0]?.requiredReplacementCount,
    1,
  );
  assert.equal(report.youngExceptionalStock.missingReplacementCount, 1);
});

test("rejects an exceptional-stock target change within the same world", () => {
  assert.throws(
    () => createPlayerGenerationEconomyAudit({
      hardCapMinorUnits: input.hardCapMinorUnits,
      initialRarityConstraints: constraints,
      observations: [],
      exceptionalStockSnapshots: [
        stockSnapshot("fixed-target", 0, 5, stockPlayers("fixed-target", 5)),
        stockSnapshot("fixed-target", 1, 4, stockPlayers("fixed-target", 4)),
      ],
    }),
    /invalid or duplicate stock snapshot/,
  );
});

test("evaluates vacancy replacement when an adjacent transition has no vacancy", () => {
  const report = createPlayerGenerationEconomyAudit({
    hardCapMinorUnits: input.hardCapMinorUnits,
    initialRarityConstraints: constraints,
    observations: [],
    exceptionalStockSnapshots: [
      stockSnapshot("no-vacancy", 0, 4, stockPlayers("no-vacancy", 4)),
      stockSnapshot("no-vacancy", 1, 4, stockPlayers("no-vacancy", 4)),
    ],
  });
  const gate = report.gates.find(
    ({ key }) => key === "young_stored_ceiling_six_vacancy_replacement",
  );

  assert.equal(report.youngExceptionalStock.transitionObservationCount, 1);
  assert.equal(
    report.youngExceptionalStock.requiredReplacementObservationCount,
    0,
  );
  assert.equal(gate?.observationCount, 1);
  assert.equal(gate?.violationCount, 0);
  assert.equal(gate?.status, "pass");
  assert.deepEqual(gate?.cohortMinimumEvidence, {
    evidenceObservationCount: 0,
    minimumObservationCount: 1,
  });
});

test("is deterministic, mutation-free, and rejects invalid input", () => {
  const before = structuredClone(input);
  assert.deepEqual(
    createPlayerGenerationEconomyAudit(input),
    createPlayerGenerationEconomyAudit(input),
  );
  assert.deepEqual(input, before);
  assert.throws(
    () => createPlayerGenerationEconomyAudit({
      ...input,
      observations: [input.observations[0]!, input.observations[0]!],
    }),
    /invalid or duplicate/,
  );
  assert.throws(
    () => createPlayerGenerationEconomyAudit({
      ...input,
      negotiationObservations: [{
        ...input.negotiationObservations![0]!,
        offeredFeeMinorUnits: -1,
      }],
    }),
    /invalid negotiation money/,
  );
});

function player(
  input: {
    readonly observationId: string;
    readonly playerId: string;
    readonly playerName: string;
    readonly age: number;
    readonly currentRating: PlayerGenerationEconomyObservation["currentRating"];
    readonly p50: PlayerGenerationEconomyObservation["publicPotentialP50Rating"];
    readonly upper: PlayerGenerationEconomyObservation["publicPotentialUpperRating"];
    readonly storedCeiling?: PlayerGenerationEconomyObservation["storedPotentialCeilingRating"];
    readonly value: number;
    readonly asking?: number;
    readonly archetype: string;
    readonly allocation: NonNullable<PlayerGenerationEconomyObservation["allocation"]>;
    readonly hardCapEligible?: boolean;
  },
): PlayerGenerationEconomyObservation {
  return {
    observationId: input.observationId,
    worldId: "world:one",
    playerId: input.playerId,
    playerName: input.playerName,
    age: input.age,
    seasonStartYear: 2025,
    division: "first_division",
    population: "senior",
    clubCompetitiveTier: "title_contender",
    squadPlacement: "first_team",
    roleGroup: "outfield",
    currentRating: input.currentRating,
    storedPotentialCeilingRating: input.storedCeiling ?? input.upper,
    publicPotentialP50Rating: input.p50,
    publicPotentialUpperRating: input.upper,
    publicValueMinorUnits: input.value,
    ...(input.asking === undefined ? {} : { askingPriceMinorUnits: input.asking }),
    allocation: input.allocation,
    archetype: input.archetype,
    hardCapEligible: input.hardCapEligible ?? false,
  };
}

function distribution(observationCount: number) {
  return {
    observationCount,
    p50MinorUnits: 100,
    p90MinorUnits: 200,
    p99MinorUnits: 300,
    maximumMinorUnits: 400,
  };
}

function gateStatus(
  report: ReturnType<typeof createPlayerGenerationEconomyAudit>,
  key: string,
) {
  return report.gates.find((gate) => gate.key === key)?.status;
}

function ratingDistribution(
  observationCount: number,
  minimum: PlayerGenerationEconomyObservation["currentRating"],
  p50: PlayerGenerationEconomyObservation["currentRating"],
  p90: PlayerGenerationEconomyObservation["currentRating"],
  maximum: PlayerGenerationEconomyObservation["currentRating"],
) {
  return { observationCount, minimum, p50, p90, maximum };
}

function diagnosticPlayer(input: {
  readonly id: string;
  readonly age: number;
  readonly division: PlayerGenerationEconomyObservation["division"];
  readonly currentRating: PlayerGenerationEconomyObservation["currentRating"];
  readonly p50: PlayerGenerationEconomyObservation["publicPotentialP50Rating"];
  readonly upper: PlayerGenerationEconomyObservation["publicPotentialUpperRating"];
  readonly storedCeiling: PlayerGenerationEconomyObservation["storedPotentialCeilingRating"];
}): PlayerGenerationEconomyObservation {
  return {
    ...player({
      observationId: input.id,
      playerId: input.id,
      playerName: input.id,
      age: input.age,
      currentRating: input.currentRating,
      p50: input.p50,
      upper: input.upper,
      storedCeiling: input.storedCeiling,
      value: 100,
      archetype: input.storedCeiling >= 3.5 ? "prospect" : "routine",
      allocation: {
        establishedCurrentSixAllocated: false,
        youngStoredCeilingSixAllocated: false,
      },
    }),
    division: input.division,
  };
}

function stockPlayer(
  playerId: string,
  population: PlayerGenerationEconomyObservation["population"],
  clubId: string | null,
  category: PlayerGenerationEconomyObservation["division"],
  publicUpper: PlayerGenerationEconomyObservation["publicPotentialUpperRating"],
  storedCeiling: PlayerGenerationEconomyObservation["storedPotentialCeilingRating"] = 6,
  competitiveTier: "title_contender" | "playoff_contender" | "mid_table" | "survival" =
    "title_contender",
) {
  return {
    playerId,
    age: 18,
    population,
    storedPotentialCeilingRating: storedCeiling,
    publicPotentialUpperRating: publicUpper,
    clubAssociation: clubId === null
      ? { kind: "unattached" as const }
      : {
          kind: "club" as const,
          clubId,
          category: category === "free_agent" ? "first_division" as const : category,
          competitiveTier,
        },
  };
}

function stockSnapshot(
  worldId: string,
  seasonIndex: number,
  targetYoungStoredCeilingSixCount: number,
  players: ReturnType<typeof stockPlayer>[],
) {
  return {
    observationId: `${worldId}|stock|${seasonIndex}`,
    worldId,
    seasonIndex,
    targetYoungStoredCeilingSixCount,
    players,
  };
}

function stockPlayers(worldId: string, count: number) {
  return Array.from({ length: count }, (_, index) =>
    stockPlayer(
      `${worldId}:player:${index}`,
      index % 2 === 0 ? "senior" : "academy",
      `${worldId}:club:${index}`,
      "first_division",
      5.5,
    )
  );
}
