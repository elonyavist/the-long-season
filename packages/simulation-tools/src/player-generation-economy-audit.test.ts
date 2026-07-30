import assert from "node:assert/strict";
import { test } from "vitest";

import {
  createPlayerGenerationEconomyAudit,
  type CreatePlayerGenerationEconomyAuditInput,
  type PlayerGenerationEconomyObservation,
} from "./player-generation-economy-audit.ts";

const constraints = {
  currentSixMinimum: 1,
  currentSixMaximum: 2,
  potentialSixMinimum: 2,
  potentialSixMaximum: 4,
  lowerDivisionPotentialSixMaximum: 1,
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
      lower: 4,
      expected: 5,
      upper: 5.5,
      storedCeiling: 6,
      value: 2_000_000_000,
      asking: 3_000_000_000,
      archetype: "rare_prodigy",
      allocation: { currentSixAllocated: false, potentialSixAllocated: true },
    }),
    player({
      observationId: "world:one|0|player:two",
      playerId: "player:two",
      playerName: "Champion Two",
      age: 25,
      currentRating: 6,
      lower: 6,
      expected: 6,
      upper: 6,
      value: 15_000_000_000,
      asking: 18_000_000_000,
      archetype: "category_star",
      allocation: { currentSixAllocated: true, potentialSixAllocated: true },
      hardCapEligible: true,
    }),
    player({
      observationId: "world:one|0|player:three",
      playerId: "player:three",
      playerName: "Senior Three",
      age: 31,
      currentRating: 5.5,
      lower: 5.5,
      expected: 5.5,
      upper: 5.5,
      value: 14_999_999_900,
      archetype: "category_star",
      allocation: { currentSixAllocated: false, potentialSixAllocated: false },
    }),
  ],
  negotiationObservations: [
    {
      negotiationId: "negotiation:one",
      playerId: "player:one",
      playerName: "Prospect One",
      age: 16,
      seasonIndex: 1,
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
      seasonIndex: 1,
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
      seasonIndex: 1,
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
      allocatedPotentialSixPlayerIds: ["player:intake-one"],
      generatedPotentialSixPlayerIds: ["player:intake-one"],
      acceptedPlayerIds: ["player:intake-one", "player:routine-one"],
      activePotentialSixPlayerIds: ["player:intake-one"],
    },
    {
      seasonIndex: 1,
      allocatedPotentialSixPlayerIds: [],
      generatedPotentialSixPlayerIds: [],
      acceptedPlayerIds: ["player:routine-two"],
      activePotentialSixPlayerIds: ["player:intake-one"],
    },
  ],
};

test("reports joint ranges, effective allocations, cap safety, and stage-aware spreads", () => {
  const report = createPlayerGenerationEconomyAudit(input);

  assert.equal(report.observationCount, 3);
  assert.equal(report.currentSix.observationCount, 1);
  assert.equal(report.currentSix.minimumAge, 25);
  assert.equal(report.storedCeilingSix.observationCount, 2);
  assert.equal(report.storedCeilingSix.minimumAge, 16);
  assert.deepEqual(report.storedCeilingSix.archetypeCounts, {
    category_star: 1,
    rare_prodigy: 1,
  });
  assert.equal(report.publicUpperSix.observationCount, 1);
  assert.equal(report.publicUpperSix.minimumAge, 25);
  assert.equal(report.publicPotentialRanges[0]?.observationCount, 1);
  assert.equal(report.allocation.effectiveCurrentSixCount, 1);
  assert.equal(report.allocation.effectivePotentialSixCount, 2);
  assert.equal(report.cap.eligibleExactHardCapCount, 1);
  assert.equal(report.cap.ineligibleRenderedAsHardCapCount, 0);
  assert.equal(report.negotiations.offeredAskingRatioDistribution.observationCount, 3);
  assert.equal(report.negotiations.counterAskingRatioDistribution.observationCount, 1);
  assert.equal(report.negotiations.agreedAskingRatioDistribution.observationCount, 2);
  assert.equal(report.negotiations.exactAskingOfferedEqualityCount, 1);
  assert.equal(report.negotiations.exactAskingOfferedEqualityShareBasisPoints, 3_333);
  assert.equal(report.negotiations.exactAskingCompletedEqualityCount, 1);
  assert.equal(report.negotiations.completedAfterCounterCount, 1);
  assert.equal(report.negotiations.sellerOutcomeCounts.countered, 1);
  assert.equal(report.negotiations.counterOutcomeCounts.accepted, 1);
  assert.equal(report.annualIntake.acceptedPotentialSixCount, 1);
  assert.equal(report.suppliedNegotiationAggregates[0]?.offerCount, 23_718);
  assert.equal(report.gates.every(({ status }) => status === "pass"), true);
  assert.equal(report.gates.every(({ observationCount }) => observationCount > 0), true);
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
      publicPotentialLowerRating: 5,
      publicPotentialExpectedRating: 4.5,
    }],
    negotiationObservations: [],
    annualIntakeObservations: [],
  });

  const current = invalid.gates.find(
    ({ key }) => key === "current_six_age_archetype_compatibility",
  );
  const ordering = invalid.gates.find(
    ({ key }) => key === "public_potential_range_ordering",
  );
  assert.equal(current?.status, "fail");
  assert.equal(current?.examples[0]?.playerName, "Champion Two");
  assert.equal(current?.examples[0]?.seasonIndex, 0);
  assert.equal(ordering?.status, "fail");
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
    readonly lower: PlayerGenerationEconomyObservation["publicPotentialLowerRating"];
    readonly expected: PlayerGenerationEconomyObservation["publicPotentialExpectedRating"];
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
    seasonIndex: 0,
    division: "first_division",
    population: "senior",
    roleGroup: "outfield",
    currentRating: input.currentRating,
    storedPotentialCeilingRating: input.storedCeiling ?? input.upper,
    publicPotentialLowerRating: input.lower,
    publicPotentialExpectedRating: input.expected,
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
