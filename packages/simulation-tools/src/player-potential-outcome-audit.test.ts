import assert from "node:assert/strict";
import { test } from "vitest";

import {
  createPotentialProjectionPolicyCalibration,
  createPlayerPotentialOutcomeAudit,
  type CreatePlayerPotentialOutcomeAuditInput,
  type PlayerPotentialOutcomeObservation,
} from "./player-potential-outcome-audit.ts";

const outfieldObservations: readonly PlayerPotentialOutcomeObservation[] = [
  outcome("a", 15, "outfield", 4, 16, 13, 12, 4, 3, 4, 5),
  outcome("b", 15, "outfield", 4, 16, 10, 9, 7, 3, 4, 5),
  outcome("c", 16, "outfield", 4, 16, 11, 10, 6, 3.5, 4, 5),
  outcome("d", 16, "outfield", 4, 16, 12, 11, 5, 3.5, 4.5, 5),
];
const observations: readonly PlayerPotentialOutcomeObservation[] = [
  ...outfieldObservations,
  outcome("g-a", 15, "goalkeeper", 4, 16, 13, 12, 4, 3, 4, 5),
  outcome("g-b", 15, "goalkeeper", 4, 16, 10, 9, 7, 3, 4, 5),
  outcome("g-c", 16, "goalkeeper", 4, 16, 11, 10, 6, 3.5, 4, 5),
  outcome("g-d", 16, "goalkeeper", 4, 16, 12, 11, 5, 3.5, 4.5, 5),
];

const input: CreatePlayerPotentialOutcomeAuditInput = {
  observations,
  coverage: {
    startAges: [15, 16],
    roleGroups: ["outfield", "goalkeeper"],
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
  const youth = report.cells.find((cell) =>
    cell.startAge === 15 && cell.roleGroup === "outfield"
  );

  assert.equal(report.observationCount, 8);
  assert.equal(report.expectedCellCount, 4);
  assert.equal(report.observedCellCount, 4);
  assert.equal(report.missingCellCount, 0);
  assert.equal(report.underObservedCellCount, 0);
  assert.equal(report.nonWideningAgeViolationCount, 0);
  assert.equal(report.gates.every(({ status }) => status === "pass"), true);
  assert.equal(report.unobservedCalibrationBandCount, 0);
  assert.equal(youth?.observationCount, 2);
  assert.deepEqual(youth?.currentRating, {
    observationCount: 2,
    p10Hundredths: 300,
    p50Hundredths: 300,
    p90Hundredths: 300,
  });
  assert.deepEqual(youth?.publicP50Rating, {
    observationCount: 2,
    p10Hundredths: 400,
    p50Hundredths: 400,
    p90Hundredths: 400,
  });
  assert.deepEqual(youth?.publicUpperRating, {
    observationCount: 2,
    p10Hundredths: 500,
    p50Hundredths: 500,
    p90Hundredths: 500,
  });
  assert.deepEqual(youth?.storedCeilingRating, {
    observationCount: 2,
    p10Hundredths: 600,
    p50Hundredths: 600,
    p90Hundredths: 600,
  });
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
      observation.startAge === 16 && observation.roleGroup === "outfield"
        ? {
            ...observation,
            publicP50Rating: 3,
            publicUpperRating: 6,
            publicUpperRoleAbility: 13,
          }
        : observation
    ),
  });
  assert.equal(report.projectionOrderingViolationCount, 2);
  assert.equal(report.nonWideningAgeViolationCount, 1);
  assert.equal(report.gates.some(({ status }) => status === "fail"), true);
});

test("pools P50/P90 realization at policy age-band granularity", () => {
  const calibration = createPotentialProjectionPolicyCalibration(
    outfieldObservations,
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
      p50RealizationBasisPoints: 0,
      p90RealizationBasisPoints: 0,
      abovePublicUpperCount: 0,
      abovePublicUpperRateBasisPoints: null,
      storedCeilingViolationCount: 0,
    },
    {
      roleGroup: "outfield",
      minimumAge: 0,
      maximumAge: 15,
      observationCount: 2,
      evaluationStatus: "evaluated",
      p50RealizationBasisPoints: 6_250,
      p90RealizationBasisPoints: 7_250,
      abovePublicUpperCount: 1,
      abovePublicUpperRateBasisPoints: 5_000,
      storedCeilingViolationCount: 0,
    },
    {
      roleGroup: "outfield",
      minimumAge: 16,
      maximumAge: 200,
      observationCount: 2,
      evaluationStatus: "evaluated",
      p50RealizationBasisPoints: 6_250,
      p90RealizationBasisPoints: 6_583,
      abovePublicUpperCount: 0,
      abovePublicUpperRateBasisPoints: 0,
      storedCeilingViolationCount: 0,
    },
  ]);
});

test("reports upper exceedance neutrally and hard-fails stored-ceiling breaches", () => {
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

test("a missing policy band cannot pass calibration coverage", () => {
  const report = createPlayerPotentialOutcomeAudit({
    ...input,
    observations,
    projectionAgeBands: [
      { roleGroup: "goalkeeper", minimumAge: 0, maximumAge: 200 },
      { roleGroup: "outfield", minimumAge: 0, maximumAge: 15 },
      { roleGroup: "outfield", minimumAge: 16, maximumAge: 17 },
      { roleGroup: "outfield", minimumAge: 18, maximumAge: 200 },
    ],
  });

  assert.equal(report.unobservedCalibrationBandCount, 1);
  assert.equal(
    report.gates.find(
      ({ key }) => key === "projection_policy_calibration_coverage",
    )?.status,
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
  currentRoleAbility: number,
  storedCeilingRoleAbility: number,
  peakRoleAbility: number,
  finalRoleAbility: number,
  remainingRoom: number,
  currentRating: number,
  publicP50Rating: number,
  publicUpperRating: number,
): PlayerPotentialOutcomeObservation {
  return {
    sourceId,
    startAge,
    roleGroup,
    roomBand: "large",
    participationBand: "high",
    currentRoleAbility,
    storedCeilingRoleAbility,
    peakRoleAbility,
    finalRoleAbility,
    remainingRoom,
    publicP50RoleAbility: 8,
    publicUpperRoleAbility: 12,
    currentRating,
    publicP50Rating,
    publicUpperRating,
    storedCeilingRating: 6,
  };
}
