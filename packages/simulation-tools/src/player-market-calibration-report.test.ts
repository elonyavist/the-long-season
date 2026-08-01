import assert from "node:assert/strict";
import { test } from "vitest";

import {
  createPlayerMarketCalibrationReport,
  type CreatePlayerMarketCalibrationReportInput,
} from "./player-market-calibration-report.ts";

const input: CreatePlayerMarketCalibrationReportInput = {
  versions: {
    topologyDecisionId: "fictional-three-tier-v1",
    playerRatingScaleVersion: "rating-v1",
    playerMarketCalibrationVersion: "market-v1",
    valuationCurvesVersion: "valuation-v1",
    askingPriceCurvesVersion: "asking-v1",
    marketBehaviorCalibrationVersion: "behavior-v1",
    wageFinanceCalibrationVersion: "wage-v1",
    playerDevelopmentEnvironmentVersion: "development-environment-v1",
  },
  metadata: {
    seedPrefix: "diagnostic",
    worldCount: 2,
    projectionMethod: "supplied fixtures",
  },
  divisionValuePopulation: "all_supplied",
  observations: [
    {
      division: "first_division",
      seasonStartYear: 2025,
      currentRating: 5.5,
      publicP50Rating: 6,
      publicValueMinorUnits: 10,
      population: "initial_starter",
      sourceLabel: "generated",
    },
    {
      division: "first_division",
      seasonStartYear: 2025,
      currentRating: 6,
      publicP50Rating: 6,
      publicValueMinorUnits: 20,
      population: "initial_reserve",
      sourceLabel: "generated",
    },
    {
      division: "first_division",
      seasonStartYear: 2025,
      currentRating: 3,
      publicP50Rating: 3.5,
      publicValueMinorUnits: 30,
      population: "initial_youth",
      sourceLabel: "fixture",
    },
    {
      division: "third_division",
      seasonStartYear: 2026,
      currentRating: 1,
      publicP50Rating: 1.5,
      publicValueMinorUnits: 5,
      population: "annual_intake",
      sourceLabel: "fixture",
    },
    {
      division: "second_division",
      seasonStartYear: 2026,
      currentRating: 2,
      publicP50Rating: 2.5,
      publicValueMinorUnits: 0,
      population: "annual_intake",
      sourceLabel: "fixture",
    },
  ],
  clubSquadObservations: [
    {
      division: "first_division",
      seasonStartYear: 2025,
      activeSeniorCount: 22,
      publicSquadValueMinorUnits: 60,
      sourceLabel: "generated",
    },
    {
      division: "third_division",
      seasonStartYear: 2025,
      activeSeniorCount: 22,
      publicSquadValueMinorUnits: 5,
      sourceLabel: "fixture",
    },
    {
      division: "second_division",
      seasonStartYear: 2025,
      activeSeniorCount: 22,
      publicSquadValueMinorUnits: 0,
      sourceLabel: "fixture",
    },
  ],
  targets: [
    target("first_division", 20, 28, 30, 30),
    target("second_division", 0, 0, 0, 0),
    target("third_division", 5, 5, 5, 5),
  ],
  divisionBaselines: [
    baseline("first_division", 60),
    baseline("second_division", 0),
    baseline("third_division", 5),
  ],
};

test("reports versions, metadata, type-7 percentiles, rarity, and source labels", () => {
  const report = createPlayerMarketCalibrationReport(input);
  const first = report.divisions[0];
  const second = report.divisions[1];

  assert.equal(report.versions.valuationCurvesVersion, "valuation-v1");
  assert.equal(report.metadata.seedPrefix, "diagnostic");
  assert.equal(report.divisionValuePopulation, "all_supplied");
  assert.equal(report.divisionValueObservationCount, 5);
  assert.equal(report.activeClosingCheckpointSeasonStartYear, null);
  assert.equal(report.fitStatus, "pass");
  assert.deepEqual(report.sourceLabelCounts, { fixture: 3, generated: 2 });
  assert.equal(first?.sampleSize, 3);
  assert.deepEqual(first?.valueDistribution, {
    medianMinorUnits: 20,
    p90MinorUnits: 28,
    p99MinorUnits: 30,
    maximumMinorUnits: 30,
  });
  assert.equal(first?.currentRatingHistogram[5.5], 1);
  assert.equal(first?.currentRatingHistogram[6], 1);
  assert.equal(first?.currentFiveAndHalfOrHigherCount, 2);
  assert.equal(first?.currentSixCount, 1);
  assert.equal(first?.publicP50SixCount, 2);
  assert.equal(first?.valueFit.status, "pass");
  assert.deepEqual(first?.normalized22SquadComparator, {
    comparatorKind: "normalized_22_active_seniors",
    sampleSize: 1,
    generatedMeanMinorUnits: 60,
    sourceComparatorMinorUnits: 60,
    deviationBasisPoints: 0,
  });
  assert.equal(second?.sampleSize, 1);
  assert.equal(second?.valueFit.evaluationStatus, "evaluated");
  assert.deepEqual(second?.valueDistribution, {
    medianMinorUnits: 0,
    p90MinorUnits: 0,
    p99MinorUnits: 0,
    maximumMinorUnits: 0,
  });
  assert.deepEqual(
    report.populations.map(({ population, sampleSize, currentSixCount, publicP50SixCount }) => ({
      population,
      sampleSize,
      currentSixCount,
      publicP50SixCount,
    })),
    [
      { population: "initial_starter", sampleSize: 1, currentSixCount: 0, publicP50SixCount: 1 },
      { population: "initial_reserve", sampleSize: 1, currentSixCount: 1, publicP50SixCount: 1 },
      { population: "initial_youth", sampleSize: 1, currentSixCount: 0, publicP50SixCount: 0 },
      { population: "annual_intake", sampleSize: 2, currentSixCount: 0, publicP50SixCount: 0 },
    ],
  );
});

test("is deterministic and does not mutate supplied observations", () => {
  const before = structuredClone(input);
  const first = createPlayerMarketCalibrationReport(input);
  const second = createPlayerMarketCalibrationReport(input);

  assert.deepEqual(first, second);
  assert.deepEqual(input, before);
});

test("rejects incomplete metadata and invalid money", () => {
  assert.throws(
    () => createPlayerMarketCalibrationReport({
      ...input,
      metadata: { ...input.metadata, worldCount: 0 },
    }),
    /metadata/,
  );
  assert.throws(
    () => createPlayerMarketCalibrationReport({
      ...input,
      observations: [{ ...input.observations[0]!, publicValueMinorUnits: -1 }],
    }),
    /invalid observation/,
  );
  assert.throws(
    () => createPlayerMarketCalibrationReport({
      ...input,
      observations: [{ ...input.observations[0]!, population: "unknown" as never }],
    }),
    /invalid observation/,
  );
  assert.throws(
    () => createPlayerMarketCalibrationReport({
      ...input,
      clubSquadObservations: [{
        ...input.clubSquadObservations[0]!,
        activeSeniorCount: 21 as 22,
      }],
    }),
    /club-squad observation/,
  );
});

test("an unobserved division cannot pass its value-fit gate", () => {
  const report = createPlayerMarketCalibrationReport({
    ...input,
    observations: input.observations.filter(
      ({ division }) => division !== "second_division",
    ),
  });

  assert.equal(report.fitStatus, "fail");
  assert.equal(report.divisions[1]?.valueFit.observationCount, 0);
  assert.equal(report.divisions[1]?.valueFit.evaluationStatus, "not_evaluated");
  assert.equal(report.divisions[1]?.valueFit.status, "fail");
});

test("binds division value bands to one explicitly named closing checkpoint", () => {
  const closingObservations = [
    closingObservation("first_division", 20),
    closingObservation("second_division", 0),
    closingObservation("third_division", 5),
  ] as const;
  const report = createPlayerMarketCalibrationReport({
    ...input,
    divisionValuePopulation: "active_closing_checkpoint",
    observations: [...input.observations, ...closingObservations],
    clubSquadObservations: [
      ...input.clubSquadObservations,
      ...input.clubSquadObservations.map((observation) => ({
        ...observation,
        seasonStartYear: 2027,
      })),
    ],
    targets: [
      target("first_division", 20, 20, 20, 20),
      target("second_division", 0, 0, 0, 0),
      target("third_division", 5, 5, 5, 5),
    ],
  });

  assert.equal(report.divisionValuePopulation, "active_closing_checkpoint");
  assert.equal(report.divisionValueObservationCount, 3);
  assert.equal(report.activeClosingCheckpointSeasonStartYear, 2027);
  assert.deepEqual(
    report.divisions.map(({ sampleSize }) => sampleSize),
    [1, 1, 1],
  );
  assert.equal(report.fitStatus, "pass");
});

test("rejects a closing population assembled from two season identities", () => {
  assert.throws(
    () => createPlayerMarketCalibrationReport({
      ...input,
      observations: [
        closingObservation("first_division", 20),
        { ...closingObservation("second_division", 0), seasonStartYear: 2028 },
      ],
      divisionValuePopulation: "active_closing_checkpoint",
    }),
    /one active closing checkpoint season/,
  );
});

function closingObservation(
  division: CreatePlayerMarketCalibrationReportInput["observations"][number]["division"],
  publicValueMinorUnits: number,
): CreatePlayerMarketCalibrationReportInput["observations"][number] {
  return {
    division,
    seasonStartYear: 2027,
    currentRating: 3,
    publicP50Rating: 3.5,
    publicValueMinorUnits,
    population: "active_closing_checkpoint",
    sourceLabel: "closing-checkpoint",
  };
}

function target(
  division: CreatePlayerMarketCalibrationReportInput["targets"][number]["division"],
  medianMinorUnits: number,
  p90MinorUnits: number,
  p99MinorUnits: number,
  maximumMinorUnits: number,
): CreatePlayerMarketCalibrationReportInput["targets"][number] {
  return {
    division,
    classification: "explicit_game_design_target",
    distribution: {
      medianMinorUnits,
      p90MinorUnits,
      p99MinorUnits,
      maximumMinorUnits,
    },
    medianToleranceBasisPoints: 0,
    p90ToleranceBasisPoints: 0,
    p99ToleranceBasisPoints: 0,
    minimumMaximumMinorUnits: maximumMinorUnits,
    maximumMaximumMinorUnits: maximumMinorUnits,
  };
}

function baseline(
  division: CreatePlayerMarketCalibrationReportInput["divisionBaselines"][number]["division"],
  normalized22SeniorSquadValueMinorUnits: number,
): CreatePlayerMarketCalibrationReportInput["divisionBaselines"][number] {
  return {
    division,
    classification: "derived_aggregate",
    clubCount: 1,
    listedPlayerCount: 22,
    includedValuationCount: 22,
    totalValueMinorUnits: normalized22SeniorSquadValueMinorUnits,
    meanListedPlayerValueMinorUnits: Math.round(
      normalized22SeniorSquadValueMinorUnits / 22,
    ),
    rawAverageSquadValueMinorUnits: normalized22SeniorSquadValueMinorUnits,
    normalized22SeniorSquadValueMinorUnits,
    distribution: {
      medianMinorUnits: 0,
      p90MinorUnits: 0,
      p99MinorUnits: 0,
      maximumMinorUnits: 0,
    },
  };
}
