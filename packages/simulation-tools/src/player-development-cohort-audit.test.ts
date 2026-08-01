import assert from "node:assert/strict";
import { test } from "vitest";

import { LONG_RUN_ANOMALY_KEYS } from "./long-run/anomaly-scoring.ts";
import {
  createPlayerDevelopmentCohortWorldSummary,
  mergePlayerDevelopmentCohortAggregates,
  mergePlayerDevelopmentCohortWorldSummaries,
  validatePlayerDevelopmentCohortWorldSummary,
  type CreatePlayerDevelopmentCohortWorldSummaryInput,
  type PlayerDevelopmentCheckpointObservation,
  type PlayerDevelopmentParticipationObservation,
} from "./player-development-cohort-audit.ts";

test("player-development cohort separates checkpoints, trajectories, quantization, and natural evidence", () => {
  const summary = createPlayerDevelopmentCohortWorldSummary(worldInput("world:a"));

  assert.equal(summary.openingCheckpoint.observationCount, 5);
  assert.equal(summary.closingCheckpoint.observationCount, 5);
  assert.equal(
    summary.openingCheckpoint.ageBands.find(({ ageBand }) => ageBand === "15_17")
      ?.quantizedPublicRoomCount,
    1,
  );
  assert.equal(
    summary.gates.find(({ key }) => key === "star_quantization")?.observationCount,
    3,
  );

  const youth = summary.trajectories.find(({ ageBand }) => ageBand === "15_17")!;
  assert.equal(youth.openingCount, 3);
  assert.equal(youth.matchedClosingCount, 2);
  assert.equal(youth.attritionCount, 1);
  assert.equal(youth.matchedClosingCount + youth.attritionCount, youth.openingCount);
  assert.equal(youth.plateau.genuineUpsideDenominator, 2);
  assert.equal(youth.plateau.visibleEarlyPlateauCount, 1);

  assert.equal(summary.newEntrants.totalCount, 1);
  assert.equal(
    summary.newEntrants.ageBandPopulationCounts.find(
      ({ ageBand }) => ageBand === "15_17",
    )?.populationCounts.academy,
    1,
  );

  const absentEvidenceCell = summary.growthCells.find(
    (cell) =>
      cell.ageBand === "15_17"
      && cell.opportunity === "zero"
      && cell.performance === "unobserved"
      && cell.environmentEffect === "unobserved",
  )!;
  assert.equal(absentEvidenceCell.evaluationStatus, "evaluated");
  assert.equal(absentEvidenceCell.playerCount, 1);
  assert.equal(absentEvidenceCell.minutes, 0);

  const sparseCell = summary.growthCells.find(
    (cell) =>
      cell.ageBand === "21_23"
      && cell.opportunity === "full"
      && cell.performance === "positive_saturated"
      && cell.environmentEffect === "positive",
  )!;
  assert.equal(sparseCell.evaluationStatus, "not_evaluated");
  assert.equal(sparseCell.observationCount, 0);

  const withoutQuantizationInput = worldInput("world:no-quantization");
  const removeQuantizedRoom = (row: PlayerDevelopmentCheckpointObservation) =>
    row.publicUpperRating === row.currentRating
      ? {
          ...row,
          publicP50Ability: row.currentAbility,
          publicUpperAbility: row.currentAbility,
        }
      : row;
  const withoutQuantization = createPlayerDevelopmentCohortWorldSummary({
    ...withoutQuantizationInput,
    opening: withoutQuantizationInput.opening.map(removeQuantizedRoom),
    closing: withoutQuantizationInput.closing.map(removeQuantizedRoom),
  });
  assert.equal(
    withoutQuantization.gates.find(({ key }) => key === "star_quantization")?.status,
    "not_evaluated",
  );
  assert.equal(
    withoutQuantization.gates.find(
      ({ key }) => key === "public_projection_room",
    )?.status,
    "pass",
  );
});

test("young stored-six slices retain compact public-value and asking evidence", () => {
  const summary = createPlayerDevelopmentCohortWorldSummary(worldInput("world:value"));
  assert.equal(summary.openingCheckpoint.youngStoredCeilingSixValueSlices.length, 1);
  assert.equal(
    summary.openingCheckpoint.youngStoredCeilingSixValueSlices.every(
      ({ observationCount }) => observationCount > 0,
    ),
    true,
  );
  const openingSlice = summary.openingCheckpoint.youngStoredCeilingSixValueSlices.find(
    ({ ageBand, currentRating, publicUpperRating }) =>
      ageBand === "15_17" && currentRating === 3 && publicUpperRating === 6,
  )!;
  assert.equal(openingSlice.observationCount, 1);
  assert.equal(openingSlice.publicValue.sum, 139_966_600);
  assert.equal(openingSlice.publicValueBuckets.up_to_eur_2_5m, 1);
  assert.equal(openingSlice.askingFee.sum, 251_939_900);
  assert.equal(openingSlice.askingFeeBuckets.up_to_eur_5m, 1);
  assert.equal(openingSlice.publicValueHardCapBreachCount, 0);
  assert.deepEqual(
    summary.gates.find(
      ({ key }) => key === "young_stored_ceiling_six_public_value_hard_cap",
    ),
    {
      key: "young_stored_ceiling_six_public_value_hard_cap",
      observationCount: 2,
      violationCount: 0,
      failedWorldCount: 0,
      notEvaluatedWorldCount: 0,
      status: "pass",
    },
  );

  const alternateInput = worldInput("world:value-alternate");
  const alternateSummary = createPlayerDevelopmentCohortWorldSummary({
    ...alternateInput,
    opening: [{
      ...alternateInput.opening[0]!,
      currentRating: 4,
      publicP50Rating: 4,
      publicUpperRating: 5,
    }, ...alternateInput.opening.slice(1)],
  });
  const merged = mergePlayerDevelopmentCohortWorldSummaries([
    alternateSummary,
    summary,
  ]);
  assert.deepEqual(
    merged.openingCheckpoint.youngStoredCeilingSixValueSlices.map(
      ({ currentRating, publicUpperRating, observationCount }) => ({
        currentRating,
        publicUpperRating,
        observationCount,
      }),
    ),
    [
      { currentRating: 3, publicUpperRating: 6, observationCount: 1 },
      { currentRating: 4, publicUpperRating: 5, observationCount: 1 },
    ],
  );
});

test("young stored-six public values above the global cap fail without inventing a minimum-price band", () => {
  const input = worldInput("world:value-cap");
  const overCap = {
    ...input.opening[0]!,
    publicValueMinorUnits: 15_000_000_001,
  };
  const summary = createPlayerDevelopmentCohortWorldSummary({
    ...input,
    opening: [overCap, ...input.opening.slice(1)],
  });
  const slice = summary.openingCheckpoint.youngStoredCeilingSixValueSlices.find(
    ({ ageBand, currentRating, publicUpperRating }) =>
      ageBand === "15_17" && currentRating === 3 && publicUpperRating === 6,
  )!;
  const gate = summary.gates.find(
    ({ key }) => key === "young_stored_ceiling_six_public_value_hard_cap",
  )!;

  assert.equal(slice.publicValueBuckets.above_eur_150m, 1);
  assert.equal(slice.publicValueHardCapBreachCount, 1);
  assert.equal(gate.status, "fail");
  assert.equal(gate.violationCount, 1);
});

test("cohort merge is associative and preserves stable fixed-key ordering", () => {
  const first = createPlayerDevelopmentCohortWorldSummary(worldInput("world:a"));
  const second = createPlayerDevelopmentCohortWorldSummary(worldInput("world:b"));
  const direct = mergePlayerDevelopmentCohortWorldSummaries([second, first]);
  const grouped = mergePlayerDevelopmentCohortAggregates([
    mergePlayerDevelopmentCohortWorldSummaries([first]),
    mergePlayerDevelopmentCohortWorldSummaries([second]),
  ]);

  assert.deepEqual(direct, grouped);
  assert.equal(direct.worldCount, 2);
  assert.equal(direct.openingCheckpoint.observationCount, 10);
  assert.equal(
    direct.trajectories.find(({ ageBand }) => ageBand === "18_20")
      ?.matchedClosingCount,
    2,
  );
  assert.equal(direct.rawAnomalyStatusCounts.fail, 2);
  assert.equal(direct.worldGateAnomalyStatusCounts.warn, 2);
});

test("structural ordering failures remain raw evidence while malformed compact shape is rejected", () => {
  const input = worldInput("world:invalid");
  const broken = {
    ...input.opening[0]!,
    publicP50Ability: input.opening[0]!.currentAbility - 1,
    storedCeilingAbility: input.opening[0]!.currentAbility - 2,
  };
  const summary = createPlayerDevelopmentCohortWorldSummary({
    ...input,
    opening: [broken, broken, ...input.opening.slice(1)],
  });

  assert.equal(
    summary.gates.find(({ key }) => key === "exact_projection_order")?.status,
    "fail",
  );
  assert.equal(
    summary.gates.find(
      ({ key }) => key === "unique_checkpoint_and_participation_identity",
    )?.violationCount,
    2,
  );
  assert.equal(summary.structuralViolationExamples.length > 0, true);

  const malformed = {
    ...summary,
    trajectories: [...summary.trajectories].reverse(),
  };
  assert.throws(
    () => validatePlayerDevelopmentCohortWorldSummary(malformed),
    /trajectories are not canonical/,
  );
});

test("zero observations stay not evaluated and never become a passing denominator", () => {
  const summary = createPlayerDevelopmentCohortWorldSummary({
    worldId: "world:empty",
    completedRolloverCount: 3,
    opening: [],
    closing: [],
    participation: [],
    anomalyChecks: anomalyChecksForTest(),
  });

  assert.equal(
    summary.gates.find(({ key }) => key === "opening_age_15_17")?.status,
    "not_evaluated",
  );
  assert.equal(
    summary.gates.find(({ key }) => key === "generation_room")?.status,
    "not_evaluated",
  );
  assert.equal(
    summary.gates.find(
      ({ key }) => key === "young_stored_ceiling_six_public_value_hard_cap",
    )?.status,
    "not_evaluated",
  );
  assert.deepEqual(
    summary.openingCheckpoint.youngStoredCeilingSixValueSlices,
    [],
  );

  const normal = createPlayerDevelopmentCohortWorldSummary(worldInput("world:normal"));
  const merged = mergePlayerDevelopmentCohortWorldSummaries([normal, summary]);
  const openingYouthGate = merged.gates.find(
    ({ key }) => key === "opening_age_15_17",
  );
  assert.deepEqual(openingYouthGate, {
    key: "opening_age_15_17",
    observationCount: 3,
    violationCount: 0,
    failedWorldCount: 0,
    notEvaluatedWorldCount: 1,
    status: "not_evaluated",
  });
});

test("compact validator rejects malformed rollovers, histograms, gates, values, and anomalies", () => {
  const summary = createPlayerDevelopmentCohortWorldSummary(worldInput("world:validation"));
  assert.throws(
    () => validatePlayerDevelopmentCohortWorldSummary({
      ...summary,
      legacyField: true,
    } as typeof summary),
    /world summary has an invalid exact-key shape/,
  );
  assert.throws(
    () => validatePlayerDevelopmentCohortWorldSummary({
      ...summary,
      openingCheckpoint: {
        ...summary.openingCheckpoint,
        legacyField: true,
      },
    } as typeof summary),
    /checkpoint summary has an invalid exact-key shape/,
  );
  assert.throws(
    () => validatePlayerDevelopmentCohortWorldSummary({
      ...summary,
      completedRolloverCount: 2,
    }),
    /exactly three rollovers/,
  );

  const openingBand = summary.openingCheckpoint.ageBands[0]!;
  assert.throws(
    () => validatePlayerDevelopmentCohortWorldSummary({
      ...summary,
      openingCheckpoint: {
        ...summary.openingCheckpoint,
        ageBands: [{
          ...openingBand,
          currentRatingHistogram: {
            ...openingBand.currentRatingHistogram,
            3: openingBand.currentRatingHistogram[3] + 1,
          },
        }, ...summary.openingCheckpoint.ageBands.slice(1)],
      },
    }),
    /current rating does not match its denominator/,
  );

  assert.throws(
    () => validatePlayerDevelopmentCohortWorldSummary({
      ...summary,
      gates: summary.gates.map((gate, index) =>
        index === 0 ? { ...gate, status: "fail" as const } : gate),
    }),
    /gate status is inconsistent/,
  );

  assert.throws(
    () => validatePlayerDevelopmentCohortWorldSummary({
      ...summary,
      gates: summary.gates.map((gate, index) =>
        index === 0
          ? {
              ...gate,
              violationCount: gate.observationCount + 1,
              status: "fail" as const,
            }
          : gate),
    }),
    /gate violations exceed observations/,
  );

  const openingSlice = summary.openingCheckpoint.youngStoredCeilingSixValueSlices[0]!;
  assert.throws(
    () => validatePlayerDevelopmentCohortWorldSummary({
      ...summary,
      openingCheckpoint: {
        ...summary.openingCheckpoint,
        youngStoredCeilingSixValueSlices: [{
          ...openingSlice,
          publicValue: { ...openingSlice.publicValue, sum: Number.NaN },
        }, ...summary.openingCheckpoint.youngStoredCeilingSixValueSlices.slice(1)],
      },
    }),
    /public value sum is not finite/,
  );

  const populatedOpeningSlice = summary.openingCheckpoint.youngStoredCeilingSixValueSlices.find(
    ({ observationCount }) => observationCount > 0,
  )!;
  assert.throws(
    () => validatePlayerDevelopmentCohortWorldSummary({
      ...summary,
      openingCheckpoint: {
        ...summary.openingCheckpoint,
        youngStoredCeilingSixValueSlices:
          summary.openingCheckpoint.youngStoredCeilingSixValueSlices.map((slice) =>
            slice === populatedOpeningSlice
              ? {
                  ...slice,
                  publicValue: {
                    ...slice.publicValue,
                    sum: slice.publicValue.maximum! * slice.publicValue.observationCount + 1,
                  },
                }
              : slice),
      },
    }),
    /public value sum falls outside its reported bounds/,
  );

  assert.throws(
    () => validatePlayerDevelopmentCohortWorldSummary({
      ...summary,
      openingCheckpoint: {
        ...summary.openingCheckpoint,
        youngStoredCeilingSixValueSlices:
          summary.openingCheckpoint.youngStoredCeilingSixValueSlices.map((slice) => ({
            ...slice,
            legacyField: true,
          })),
      },
    } as typeof summary),
    /value slice has an invalid exact-key shape/,
  );

  assert.throws(
    () => validatePlayerDevelopmentCohortWorldSummary({
      ...summary,
      anomalyChecks: summary.anomalyChecks.map((anomaly) => ({
        ...anomaly,
        semanticClass: "structural" as const,
      })),
    }),
    /anomaly semantics are inconsistent/,
  );

  assert.throws(
    () => validatePlayerDevelopmentCohortWorldSummary({
      ...summary,
      anomalyChecks: summary.anomalyChecks.slice(1),
    }),
    /anomaly evidence is not canonical/,
  );

  const aggregate = mergePlayerDevelopmentCohortWorldSummaries([summary]);
  assert.throws(
    () => mergePlayerDevelopmentCohortAggregates([{
      ...aggregate,
      worldCount: 2,
    }]),
    /aggregate rollover evidence is inconsistent/,
  );
});

function worldInput(worldId: string): CreatePlayerDevelopmentCohortWorldSummaryInput {
  return {
    worldId,
    completedRolloverCount: 3,
    opening: [
      checkpoint("young-six", 16, 8, 10, 16, 16, 3, 3.5, 6, 6, "senior", 139_966_600, 251_939_900),
      checkpoint("young-hidden", 17, 9, 10, 10.2, 14, 3, 3, 3, 5, "academy", 80_000_000, null),
      checkpoint("attrition", 17, 7, 8, 9, 12, 2.5, 3, 3.5, 4.5, "free_agent", 25_000_000, null),
      checkpoint("middle", 19, 10, 11, 12, 14, 3.5, 4, 4.5, 5, "promotion_candidate", 220_000_000, null),
      checkpoint("comparator", 22, 11, 11.5, 12, 13, 4, 4, 4.5, 4.5, "senior", 400_000_000, 600_000_000),
    ],
    closing: [
      checkpoint("young-six", 19, 9, 10.5, 16, 16, 3.5, 3.5, 6, 6, "senior", 210_000_000, 320_000_000),
      checkpoint("young-hidden", 20, 9.2, 10, 10.2, 14, 3, 3, 3, 5, "academy", 85_000_000, null),
      checkpoint("middle", 22, 10, 10.8, 11.2, 14, 3.5, 4, 4, 5, "senior", 250_000_000, 350_000_000),
      checkpoint("comparator", 25, 11.5, 11.8, 12, 13, 4.5, 4.5, 4.5, 4.5, "senior", 450_000_000, 650_000_000),
      checkpoint("entrant", 16, 7, 8, 9, 12, 2.5, 3, 3.5, 4.5, "academy", 30_000_000, null),
    ],
    participation: [
      participation("young-six", 1, "2026-09", 500, 8, 4, 11_000),
      participation("middle", 1, "2026-09", 180, 6.5, 2, 10_000),
      participation("middle", 1, "2026-10", 0, 0, 0, null),
      participation("comparator", 1, "2026-09", 80, 4, 1, 9_200),
    ],
    anomalyChecks: anomalyChecksForTest(),
  };
}

function anomalyChecksForTest() {
  return LONG_RUN_ANOMALY_KEYS.map((key) => ({
    key,
    status: key === "table_points_spread_avg" ? "fail" as const : "pass" as const,
    value: key === "table_points_spread_avg" ? 29 : 1,
    threshold: "raw threshold remains unchanged",
  }));
}

function checkpoint(
  playerId: string,
  age: number,
  currentAbility: number,
  publicP50Ability: number,
  publicUpperAbility: number,
  storedCeilingAbility: number,
  currentRating: PlayerDevelopmentCheckpointObservation["currentRating"],
  publicP50Rating: PlayerDevelopmentCheckpointObservation["publicP50Rating"],
  publicUpperRating: PlayerDevelopmentCheckpointObservation["publicUpperRating"],
  storedCeilingRating: PlayerDevelopmentCheckpointObservation["storedCeilingRating"],
  population: PlayerDevelopmentCheckpointObservation["population"],
  publicValueMinorUnits: number,
  askingFeeMinorUnits: number | null,
): PlayerDevelopmentCheckpointObservation {
  return {
    observationId: `observation:${playerId}:${age}`,
    playerId: `player:${playerId}`,
    age,
    population,
    currentAbility,
    publicP50Ability,
    publicUpperAbility,
    storedCeilingAbility,
    currentRating,
    publicP50Rating,
    publicUpperRating,
    storedCeilingRating,
    publicValueMinorUnits,
    askingFeeMinorUnits,
  };
}

function participation(
  playerId: string,
  seasonIndex: number,
  monthKey: string,
  minutes: number,
  averageRating: number,
  ratingSamples: number,
  positiveGrowthEnvironmentBasisPoints: number | null,
): PlayerDevelopmentParticipationObservation {
  return {
    observationId: `participation:${playerId}:${seasonIndex}:${monthKey}`,
    playerId: `player:${playerId}`,
    seasonIndex,
    monthKey,
    minutes,
    ratingTotal: averageRating * ratingSamples,
    ratingSamples,
    positiveGrowthEnvironmentBasisPoints,
  };
}
