import assert from "node:assert/strict";
import { test } from "vitest";

import {
  createPotentialProjectionPolicyCalibration,
  createPlayerPotentialOutcomeAudit,
  type CreatePlayerPotentialOutcomeAuditInput,
  type PlayerPotentialOutcomeObservation,
} from "./player-potential-outcome-audit.ts";

const observations: readonly PlayerPotentialOutcomeObservation[] = [
  outcome("a", 15, "outfield", 4, 16, 13, 12, 4, 3, 4, 5),
  outcome("b", 15, "outfield", 4, 16, 10, 9, 7, 3, 4, 5),
  outcome("c", 16, "outfield", 4, 16, 11, 10, 6, 3.5, 4, 5),
  outcome("d", 16, "outfield", 4, 16, 12, 11, 5, 3.5, 4.5, 5),
];

const input: CreatePlayerPotentialOutcomeAuditInput = {
  observations,
  coverage: {
    startAges: [15, 16],
    roleGroups: ["outfield"],
    roomBands: ["large"],
    participationBands: ["high"],
    observationsPerCell: 2,
  },
  projectionAgeBands: [
    { roleGroup: "goalkeeper", minimumAge: 0, maximumAge: 200 },
    { roleGroup: "outfield", minimumAge: 0, maximumAge: 200 },
  ],
};

test("creates complete non-vacuous cells and projection gates", () => {
  const report = createPlayerPotentialOutcomeAudit(input);
  const youth = report.cells[0];

  assert.equal(report.observationCount, 4);
  assert.equal(report.expectedCellCount, 2);
  assert.equal(report.observedCellCount, 2);
  assert.equal(report.missingCellCount, 0);
  assert.equal(report.underObservedCellCount, 0);
  assert.equal(report.nonWideningAgeViolationCount, 0);
  assert.equal(
    report.gates.filter(({ key }) => key !== "public_upper_p90_calibration")
      .every(({ status }) => status === "pass"),
    true,
  );
  assert.equal(
    report.gates.find(({ key }) => key === "public_upper_p90_calibration")
      ?.status,
    "warn",
  );
  assert.equal(youth?.observationCount, 2);
  assert.deepEqual(youth?.peakRoleAbility, {
    observationCount: 2,
    p10Hundredths: 1_030,
    p50Hundredths: 1_150,
    p90Hundredths: 1_270,
  });
  assert.deepEqual(youth?.realizedRoomShare, {
    observationCount: 2,
    p10Hundredths: 53,
    p50Hundredths: 63,
    p90Hundredths: 73,
  });
});

test("zero and incomplete coverage can never report pass", () => {
  const empty = createPlayerPotentialOutcomeAudit({
    ...input,
    observations: [],
  });
  assert.equal(empty.evaluationStatus, "not_evaluated");
  assert.equal(empty.gates.every(({ status }) => status !== "pass"), true);

  const incomplete = createPlayerPotentialOutcomeAudit({
    ...input,
    observations: observations.slice(0, 2),
  });
  assert.equal(
    incomplete.gates.find(({ key }) =>
      key === "development_outcome_matrix_coverage"
    )?.status,
    "fail",
  );
});

test("ordering and age-widening contradictions fail deterministically", () => {
  const report = createPlayerPotentialOutcomeAudit({
    ...input,
    observations: observations.map((observation) =>
      observation.startAge === 16
        ? {
            ...observation,
            publicLowerRating: 2,
            publicExpectedRating: 1.5,
            publicUpperRating: 5.5,
          }
        : observation
    ),
  });
  assert.equal(report.projectionOrderingViolationCount, 2);
  assert.equal(report.nonWideningAgeViolationCount, 1);
  assert.equal(report.gates.some(({ status }) => status === "fail"), true);
});

test("pools P10/P50/P90 realization at policy age-band granularity", () => {
  const calibration = createPotentialProjectionPolicyCalibration(
    observations,
    [
      { roleGroup: "goalkeeper", minimumAge: 0, maximumAge: 200 },
      { roleGroup: "outfield", minimumAge: 0, maximumAge: 15 },
      { roleGroup: "outfield", minimumAge: 16, maximumAge: 200 },
    ],
  );

  assert.deepEqual(calibration, [
    {
      roleGroup: "goalkeeper",
      minimumAge: 0,
      maximumAge: 200,
      observationCount: 0,
      evaluationStatus: "not_evaluated",
      conservativeRealizationBasisPoints: 0,
      expectedRealizationBasisPoints: 0,
      upperRealizationBasisPoints: 0,
      abovePublicUpperCount: 0,
      abovePublicUpperRateBasisPoints: null,
      storedCeilingViolationCount: 0,
      calibrationStatus: "not_evaluated",
    },
    {
      roleGroup: "outfield",
      minimumAge: 0,
      maximumAge: 15,
      observationCount: 2,
      evaluationStatus: "evaluated",
      conservativeRealizationBasisPoints: 5_250,
      expectedRealizationBasisPoints: 6_250,
      upperRealizationBasisPoints: 7_250,
      abovePublicUpperCount: 1,
      abovePublicUpperRateBasisPoints: 5_000,
      storedCeilingViolationCount: 0,
      calibrationStatus: "warn",
    },
    {
      roleGroup: "outfield",
      minimumAge: 16,
      maximumAge: 200,
      observationCount: 2,
      evaluationStatus: "evaluated",
      conservativeRealizationBasisPoints: 5_917,
      expectedRealizationBasisPoints: 6_250,
      upperRealizationBasisPoints: 6_583,
      abovePublicUpperCount: 0,
      abovePublicUpperRateBasisPoints: 0,
      storedCeilingViolationCount: 0,
      calibrationStatus: "warn",
    },
  ]);
});

test("accepts the predeclared P90 tolerance and hard-fails stored-ceiling breaches", () => {
  const calibratedObservations = Array.from({ length: 10 }, (_, index) => ({
    ...outcome(
      `calibrated-${index}`,
      15,
      "outfield",
      4,
      16,
      index === 0 ? 13 : 10,
      10,
      6,
      3,
      4,
      5,
    ),
    roomBand: "large" as const,
    participationBand: "high" as const,
  }));
  const calibrated = createPlayerPotentialOutcomeAudit({
    observations: calibratedObservations,
    coverage: {
      startAges: [15],
      roleGroups: ["outfield"],
      roomBands: ["large"],
      participationBands: ["high"],
      observationsPerCell: 10,
    },
    projectionAgeBands: input.projectionAgeBands,
  });

  assert.equal(
    calibrated.gates.find(({ key }) => key === "public_upper_p90_calibration")
      ?.status,
    "pass",
  );
  assert.equal(
    calibrated.projectionPolicyCalibration.find(
      ({ roleGroup }) => roleGroup === "outfield",
    )?.abovePublicUpperRateBasisPoints,
    1_000,
  );
  assert.equal(calibrated.storedCeilingViolationCount, 0);

  const ceilingBreach = createPlayerPotentialOutcomeAudit({
    ...input,
    observations: [{
      ...observations[0]!,
      peakRoleAbility: 16.1,
    }],
    coverage: {
      ...input.coverage,
      startAges: [15],
      observationsPerCell: 1,
    },
  });
  assert.equal(
    ceilingBreach.gates.find(({ key }) => key === "stored_ceiling_integrity")
      ?.status,
    "fail",
  );
});

test("is deterministic, mutation-free, and rejects duplicate IDs", () => {
  const before = structuredClone(input);
  assert.deepEqual(
    createPlayerPotentialOutcomeAudit(input),
    createPlayerPotentialOutcomeAudit(input),
  );
  assert.deepEqual(input, before);
  assert.throws(
    () => createPlayerPotentialOutcomeAudit({
      ...input,
      observations: [observations[0]!, observations[0]!],
    }),
    /invalid or duplicate/,
  );
});

function outcome(
  sourceId: string,
  startAge: number,
  roleGroup: PlayerPotentialOutcomeObservation["roleGroup"],
  startingRoleAbility: number,
  ceilingRoleAbility: number,
  peakRoleAbility: number,
  finalRoleAbility: number,
  remainingRoom: number,
  publicLowerRating: number,
  publicExpectedRating: number,
  publicUpperRating: number,
): PlayerPotentialOutcomeObservation {
  return {
    sourceId,
    startAge,
    roleGroup,
    roomBand: "large",
    participationBand: "high",
    startingRoleAbility,
    ceilingRoleAbility,
    peakRoleAbility,
    finalRoleAbility,
    remainingRoom,
    publicLowerRoleAbility: startingRoleAbility,
    publicExpectedRoleAbility: 8,
    publicUpperRoleAbility: 12,
    publicLowerRating,
    publicExpectedRating,
    publicUpperRating,
  };
}
