/** Broad role group retained by the potential-outcome calibration matrix. */
export type PotentialOutcomeRoleGroup = "outfield" | "goalkeeper";

/** Current-to-ceiling room band selected by the CLI composition adapter. */
export type PotentialOutcomeRoomBand = "small" | "medium" | "large";

/** Participation path selected by the CLI composition adapter. */
export type PotentialOutcomeParticipationBand = "low" | "typical" | "high";

/** Lower accepted exceedance rate for a public P90 projection. */
export const PUBLIC_UPPER_EXCEEDANCE_MINIMUM_BASIS_POINTS = 500;

/** Upper accepted exceedance rate for a public P90 projection. */
export const PUBLIC_UPPER_EXCEEDANCE_MAXIMUM_BASIS_POINTS = 1_500;

/** Numeric tolerance used only to avoid floating-point boundary noise. */
const ABILITY_COMPARISON_EPSILON = 1e-9;

/**
 * One development outcome produced by the existing engine development owner.
 *
 * Numeric abilities remain offline diagnostic facts and are never browser read
 * model fields.
 */
export interface PlayerPotentialOutcomeObservation {
  readonly sourceId: string;
  readonly startAge: number;
  readonly roleGroup: PotentialOutcomeRoleGroup;
  readonly roomBand: PotentialOutcomeRoomBand;
  readonly participationBand: PotentialOutcomeParticipationBand;
  readonly startingRoleAbility: number;
  readonly ceilingRoleAbility: number;
  readonly peakRoleAbility: number;
  readonly finalRoleAbility: number;
  readonly remainingRoom: number;
  readonly publicLowerRoleAbility: number;
  readonly publicExpectedRoleAbility: number;
  readonly publicUpperRoleAbility: number;
  readonly publicLowerRating: number;
  readonly publicExpectedRating: number;
  readonly publicUpperRating: number;
}

/** Stable type-7 distribution over numeric role-ability observations. */
export interface PotentialOutcomeDistribution {
  readonly observationCount: number;
  readonly p10Hundredths: number;
  readonly p50Hundredths: number;
  readonly p90Hundredths: number;
}

/** One role-family age band used by the versioned public projection policy. */
export interface PotentialProjectionCalibrationAgeBand {
  readonly roleGroup: PotentialOutcomeRoleGroup;
  readonly minimumAge: number;
  readonly maximumAge: number;
}

/** Pooled P10/P50/P90 realized-room evidence at production policy granularity. */
export interface PotentialProjectionPolicyCalibrationBand
  extends PotentialProjectionCalibrationAgeBand {
  readonly observationCount: number;
  readonly evaluationStatus: "evaluated" | "not_evaluated";
  readonly conservativeRealizationBasisPoints: number;
  readonly expectedRealizationBasisPoints: number;
  readonly upperRealizationBasisPoints: number;
  readonly abovePublicUpperCount: number;
  readonly abovePublicUpperRateBasisPoints: number | null;
  readonly storedCeilingViolationCount: number;
  readonly calibrationStatus: "pass" | "warn" | "not_evaluated";
}

/** One complete age/role/room/participation cell in the calibration matrix. */
export interface PlayerPotentialOutcomeCell {
  readonly startAge: number;
  readonly roleGroup: PotentialOutcomeRoleGroup;
  readonly roomBand: PotentialOutcomeRoomBand;
  readonly participationBand: PotentialOutcomeParticipationBand;
  readonly observationCount: number;
  readonly peakRoleAbility: PotentialOutcomeDistribution;
  readonly finalRoleAbility: PotentialOutcomeDistribution;
  readonly remainingRoom: PotentialOutcomeDistribution;
  readonly realizedRoomShare: PotentialOutcomeDistribution;
  readonly publicRangeWidth: PotentialOutcomeDistribution;
}

/** Complete deterministic outcome matrix over caller-supplied engine results. */
export interface PlayerPotentialOutcomeAudit {
  readonly observationCount: number;
  readonly evaluationStatus: "evaluated" | "not_evaluated";
  readonly percentileMethod: "Hyndman-Fan type 7 linear interpolation, rounded to hundredths";
  readonly expectedCellCount: number;
  readonly observedCellCount: number;
  readonly missingCellCount: number;
  readonly underObservedCellCount: number;
  readonly projectionOrderingViolationCount: number;
  readonly nonWideningAgeViolationCount: number;
  readonly abovePublicUpperCount: number;
  readonly abovePublicUpperRateBasisPoints: number | null;
  readonly publicUpperCalibrationWarningBandCount: number;
  readonly storedCeilingViolationCount: number;
  readonly projectionPolicyCalibration:
    readonly PotentialProjectionPolicyCalibrationBand[];
  readonly gates: readonly PlayerPotentialOutcomeGate[];
  readonly cells: readonly PlayerPotentialOutcomeCell[];
}

/** Expected matrix dimensions supplied by the app composition root. */
export interface PlayerPotentialOutcomeCoverageContract {
  readonly startAges: readonly number[];
  readonly roleGroups: readonly PotentialOutcomeRoleGroup[];
  readonly roomBands: readonly PotentialOutcomeRoomBand[];
  readonly participationBands: readonly PotentialOutcomeParticipationBand[];
  readonly observationsPerCell: number;
}

/** Input for the pure outcome audit and its non-vacuous coverage gates. */
export interface CreatePlayerPotentialOutcomeAuditInput {
  readonly observations: readonly PlayerPotentialOutcomeObservation[];
  readonly coverage: PlayerPotentialOutcomeCoverageContract;
  readonly projectionAgeBands:
    readonly PotentialProjectionCalibrationAgeBand[];
}

/** One machine-readable coverage or projection-ordering gate. */
export interface PlayerPotentialOutcomeGate {
  readonly key: string;
  readonly status: "pass" | "warn" | "fail" | "not_evaluated";
  readonly observationCount: number;
  readonly violationCount: number;
  readonly threshold: string;
  readonly examples: readonly PlayerPotentialOutcomeGateExample[];
}

/** Reproducible matrix fact attached to one failed projection gate. */
export interface PlayerPotentialOutcomeGateExample {
  readonly sourceId: string;
  readonly startAge: number;
  readonly roleGroup: PotentialOutcomeRoleGroup;
  readonly roomBand: PotentialOutcomeRoomBand;
  readonly participationBand: PotentialOutcomeParticipationBand;
  readonly publicLowerRating: number;
  readonly publicExpectedRating: number;
  readonly publicUpperRating: number;
  readonly publicUpperRoleAbility: number;
  readonly peakRoleAbility: number;
  readonly ceilingRoleAbility: number;
}

/**
 * Summarizes supplied engine outcomes without duplicating development formulas.
 *
 * The composition adapter must provide at least one observation for every cell
 * it intends to calibrate; duplicate source IDs are rejected.
 */
export function createPlayerPotentialOutcomeAudit(
  input: CreatePlayerPotentialOutcomeAuditInput,
): PlayerPotentialOutcomeAudit {
  const { observations, coverage, projectionAgeBands } = input;
  validateObservations(observations);
  validateCoverage(coverage);
  validateCalibrationAgeBands(projectionAgeBands);
  const groups = new Map<string, PlayerPotentialOutcomeObservation[]>();
  for (const observation of observations) {
    const key = [
      observation.startAge,
      observation.roleGroup,
      observation.roomBand,
      observation.participationBand,
    ].join("|");
    const values = groups.get(key) ?? [];
    values.push(observation);
    groups.set(key, values);
  }

  const cells = [...groups.values()]
    .map(createCell)
    .sort(compareCells);
  const expectedKeys = expectedCellKeys(coverage);
  const missingCellCount = expectedKeys.filter((key) => !groups.has(key)).length;
  const underObservedCellCount = expectedKeys.filter(
    (key) => (groups.get(key)?.length ?? 0) < coverage.observationsPerCell,
  ).length;
  const projectionOrderingViolations = observations.filter(
    (observation) =>
      !(
        observation.startingRoleAbility
          <= observation.publicLowerRoleAbility
        && observation.publicLowerRoleAbility
          <= observation.publicExpectedRoleAbility
        && observation.publicExpectedRoleAbility
          <= observation.publicUpperRoleAbility
        && observation.publicUpperRoleAbility
          <= observation.ceilingRoleAbility
        && observation.publicLowerRating <= observation.publicExpectedRating
        && observation.publicExpectedRating <= observation.publicUpperRating
      ),
  );
  const nonWideningAgeViolations = findNonWideningAgeViolations(
    cells,
    observations,
  );
  const projectionPolicyCalibration =
    createPotentialProjectionPolicyCalibration(
      observations,
      projectionAgeBands,
    );
  const publicUpperCalibrationWarningBands =
    projectionPolicyCalibration.filter(
      ({ calibrationStatus }) => calibrationStatus === "warn",
    );
  const abovePublicUpperCount = projectionPolicyCalibration.reduce(
    (total, band) => total + band.abovePublicUpperCount,
    0,
  );
  const storedCeilingViolations = observations.filter(
    (observation) =>
      observation.peakRoleAbility
        > observation.ceilingRoleAbility + ABILITY_COMPARISON_EPSILON,
  );
  const gates: readonly PlayerPotentialOutcomeGate[] = [
    outcomeGate(
      "development_outcome_matrix_coverage",
      observations.length,
      missingCellCount + underObservedCellCount,
      `${expectedKeys.length} cells with >=${coverage.observationsPerCell} observations each`,
      [],
    ),
    outcomeGate(
      "public_projection_ordering",
      observations.length,
      projectionOrderingViolations.length,
      "current <= lower <= expected <= public upper <= stored ceiling",
      projectionOrderingViolations.map(projectionGateExample),
    ),
    outcomeGate(
      "public_projection_non_widening_age",
      observations.length,
      nonWideningAgeViolations.length,
      "otherwise-equivalent age bands do not widen as age increases",
      nonWideningAgeViolations,
    ),
    calibrationGate(
      "public_upper_p90_calibration",
      projectionPolicyCalibration.reduce(
        (total, band) => total + band.observationCount,
        0,
      ),
      publicUpperCalibrationWarningBands.length,
      "each evaluated role-family/age band has 5%..15% outcomes above public upper",
      publicUpperCalibrationWarningBands.flatMap((band) => {
        const example = calibrationBandExample(observations, band);
        return example === undefined ? [] : [example];
      }),
    ),
    outcomeGate(
      "stored_ceiling_integrity",
      observations.length,
      storedCeilingViolations.length,
      "zero peak outcomes above the stored generated ceiling",
      storedCeilingViolations.map(projectionGateExample),
    ),
  ];
  return {
    observationCount: observations.length,
    evaluationStatus: observations.length === 0 ? "not_evaluated" : "evaluated",
    percentileMethod: "Hyndman-Fan type 7 linear interpolation, rounded to hundredths",
    expectedCellCount: expectedKeys.length,
    observedCellCount: cells.length,
    missingCellCount,
    underObservedCellCount,
    projectionOrderingViolationCount: projectionOrderingViolations.length,
    nonWideningAgeViolationCount: nonWideningAgeViolations.length,
    abovePublicUpperCount,
    abovePublicUpperRateBasisPoints: observations.length === 0
      ? null
      : Math.round(abovePublicUpperCount / observations.length * 10_000),
    publicUpperCalibrationWarningBandCount:
      publicUpperCalibrationWarningBands.length,
    storedCeilingViolationCount: storedCeilingViolations.length,
    projectionPolicyCalibration,
    gates,
    cells,
  };
}

/**
 * Pools deterministic development outcomes by role family and policy age band.
 *
 * Five streams in one matrix cell are intentionally never treated as a stable
 * P90. Composition supplies the exact production bands so the evidence unit
 * matches the configuration unit.
 */
export function createPotentialProjectionPolicyCalibration(
  observations: readonly PlayerPotentialOutcomeObservation[],
  ageBands: readonly PotentialProjectionCalibrationAgeBand[],
): readonly PotentialProjectionPolicyCalibrationBand[] {
  validateObservations(observations);
  validateCalibrationAgeBands(ageBands);
  return [...ageBands]
    .sort((left, right) =>
      left.roleGroup.localeCompare(right.roleGroup)
      || left.minimumAge - right.minimumAge
    )
    .map((ageBand) => {
      const bandObservations = observations.filter((observation) =>
          observation.roleGroup === ageBand.roleGroup
          && observation.startAge >= ageBand.minimumAge
          && observation.startAge <= ageBand.maximumAge
      );
      const realizedShares = bandObservations
        .map(realizedRoomShare)
        .sort((left, right) => left - right);
      const abovePublicUpperCount = bandObservations.filter(
        (observation) =>
          observation.peakRoleAbility
            > observation.publicUpperRoleAbility
              + ABILITY_COMPARISON_EPSILON,
      ).length;
      const storedCeilingViolationCount = bandObservations.filter(
        (observation) =>
          observation.peakRoleAbility
            > observation.ceilingRoleAbility + ABILITY_COMPARISON_EPSILON,
      ).length;
      const abovePublicUpperRateBasisPoints = bandObservations.length === 0
        ? null
        : Math.round(
            abovePublicUpperCount / bandObservations.length * 10_000,
          );
      const calibrationStatus = abovePublicUpperRateBasisPoints === null
        ? "not_evaluated"
        : (
            abovePublicUpperRateBasisPoints
                < PUBLIC_UPPER_EXCEEDANCE_MINIMUM_BASIS_POINTS
              || abovePublicUpperRateBasisPoints
                > PUBLIC_UPPER_EXCEEDANCE_MAXIMUM_BASIS_POINTS
          )
          ? "warn"
          : "pass";
      return {
        ...ageBand,
        observationCount: realizedShares.length,
        evaluationStatus:
          realizedShares.length === 0 ? "not_evaluated" : "evaluated",
        conservativeRealizationBasisPoints:
          percentileTypeSevenBasisPoints(realizedShares, 0.1),
        expectedRealizationBasisPoints:
          percentileTypeSevenBasisPoints(realizedShares, 0.5),
        upperRealizationBasisPoints:
          percentileTypeSevenBasisPoints(realizedShares, 0.9),
        abovePublicUpperCount,
        abovePublicUpperRateBasisPoints,
        storedCeilingViolationCount,
        calibrationStatus,
      };
    });
}

function createCell(
  observations: readonly PlayerPotentialOutcomeObservation[],
): PlayerPotentialOutcomeCell {
  const first = observations[0];
  if (first === undefined) {
    throw new Error("Potential-outcome audit cannot create an empty cell");
  }
  return {
    startAge: first.startAge,
    roleGroup: first.roleGroup,
    roomBand: first.roomBand,
    participationBand: first.participationBand,
    observationCount: observations.length,
    peakRoleAbility: distribution(observations.map(({ peakRoleAbility }) => peakRoleAbility)),
    finalRoleAbility: distribution(observations.map(({ finalRoleAbility }) => finalRoleAbility)),
    remainingRoom: distribution(observations.map(({ remainingRoom }) => remainingRoom)),
    realizedRoomShare: distribution(observations.map(realizedRoomShare)),
    publicRangeWidth: distribution(
      observations.map((observation) =>
        observation.publicUpperRating - observation.publicLowerRating
      ),
    ),
  };
}

function realizedRoomShare(observation: PlayerPotentialOutcomeObservation): number {
  const startingRoom = observation.ceilingRoleAbility - observation.startingRoleAbility;
  if (startingRoom <= 0) return 0;
  return Math.max(
    0,
    Math.min(1, (observation.peakRoleAbility - observation.startingRoleAbility) / startingRoom),
  );
}

function distribution(values: readonly number[]): PotentialOutcomeDistribution {
  const sorted = [...values].sort((left, right) => left - right);
  return {
    observationCount: sorted.length,
    p10Hundredths: percentileTypeSevenHundredths(sorted, 0.1),
    p50Hundredths: percentileTypeSevenHundredths(sorted, 0.5),
    p90Hundredths: percentileTypeSevenHundredths(sorted, 0.9),
  };
}

function percentileTypeSevenHundredths(
  sorted: readonly number[],
  percentile: number,
): number {
  if (sorted.length === 0) return 0;
  const rank = (sorted.length - 1) * percentile;
  const lowerIndex = Math.floor(rank);
  const upperIndex = Math.ceil(rank);
  const lower = sorted[lowerIndex];
  const upper = sorted[upperIndex];
  if (lower === undefined || upper === undefined) {
    throw new Error("Potential-outcome percentile rank is outside the supplied sample");
  }
  return Math.round((lower + ((upper - lower) * (rank - lowerIndex))) * 100);
}

function percentileTypeSevenBasisPoints(
  sorted: readonly number[],
  percentile: number,
): number {
  if (sorted.length === 0) return 0;
  const rank = (sorted.length - 1) * percentile;
  const lowerIndex = Math.floor(rank);
  const upperIndex = Math.ceil(rank);
  const lower = sorted[lowerIndex];
  const upper = sorted[upperIndex];
  if (lower === undefined || upper === undefined) {
    throw new Error("Potential calibration percentile rank is outside the supplied sample");
  }
  return Math.round(
    (lower + ((upper - lower) * (rank - lowerIndex))) * 10_000,
  );
}

function compareCells(left: PlayerPotentialOutcomeCell, right: PlayerPotentialOutcomeCell): number {
  return (
    left.startAge - right.startAge
    || left.roleGroup.localeCompare(right.roleGroup)
    || left.roomBand.localeCompare(right.roomBand)
    || left.participationBand.localeCompare(right.participationBand)
  );
}

function expectedCellKeys(
  coverage: PlayerPotentialOutcomeCoverageContract,
): readonly string[] {
  return coverage.startAges.flatMap((startAge) =>
    coverage.roleGroups.flatMap((roleGroup) =>
      coverage.roomBands.flatMap((roomBand) =>
        coverage.participationBands.map((participationBand) =>
          [startAge, roleGroup, roomBand, participationBand].join("|")
        )
      )
    )
  );
}

function findNonWideningAgeViolations(
  cells: readonly PlayerPotentialOutcomeCell[],
  observations: readonly PlayerPotentialOutcomeObservation[],
): readonly PlayerPotentialOutcomeGateExample[] {
  const grouped = new Map<string, PlayerPotentialOutcomeCell[]>();
  for (const cell of cells) {
    const key = [
      cell.roleGroup,
      cell.roomBand,
      cell.participationBand,
    ].join("|");
    const values = grouped.get(key) ?? [];
    values.push(cell);
    grouped.set(key, values);
  }
  return [...grouped.values()].flatMap((values) => {
    const ordered = [...values].sort((left, right) => left.startAge - right.startAge);
    const violations: PlayerPotentialOutcomeGateExample[] = [];
    for (let index = 1; index < ordered.length; index += 1) {
      const previous = ordered[index - 1];
      const current = ordered[index];
      if (previous === undefined || current === undefined) continue;
      const previousWidth = projectionWidthHundredths(previous);
      const currentWidth = projectionWidthHundredths(current);
      if (currentWidth > previousWidth) {
        const observation = observations.find((candidate) =>
          candidate.startAge === current.startAge
          && candidate.roleGroup === current.roleGroup
          && candidate.roomBand === current.roomBand
          && candidate.participationBand === current.participationBand
        );
        if (observation !== undefined) {
          violations.push(projectionGateExample(observation));
        }
      }
    }
    return violations;
  }).sort((left, right) =>
    left.startAge - right.startAge
    || left.roleGroup.localeCompare(right.roleGroup)
    || left.roomBand.localeCompare(right.roomBand)
    || left.participationBand.localeCompare(right.participationBand)
    || left.sourceId.localeCompare(right.sourceId)
  );
}

function projectionWidthHundredths(cell: PlayerPotentialOutcomeCell): number {
  return cell.publicRangeWidth.p50Hundredths;
}

function outcomeGate(
  key: string,
  observationCount: number,
  violationCount: number,
  threshold: string,
  examples: readonly PlayerPotentialOutcomeGateExample[],
): PlayerPotentialOutcomeGate {
  return {
    key,
    status: observationCount === 0
      ? "not_evaluated"
      : violationCount > 0 ? "fail" : "pass",
    observationCount,
    violationCount,
    threshold,
    examples: examples.slice(0, 10),
  };
}

function calibrationGate(
  key: string,
  observationCount: number,
  warningCount: number,
  threshold: string,
  examples: readonly PlayerPotentialOutcomeGateExample[],
): PlayerPotentialOutcomeGate {
  return {
    key,
    status: observationCount === 0
      ? "not_evaluated"
      : warningCount > 0 ? "warn" : "pass",
    observationCount,
    violationCount: warningCount,
    threshold,
    examples: examples.slice(0, 10),
  };
}

function calibrationBandExample(
  observations: readonly PlayerPotentialOutcomeObservation[],
  band: PotentialProjectionPolicyCalibrationBand,
): PlayerPotentialOutcomeGateExample | undefined {
  const inBand = observations.filter((observation) =>
    observation.roleGroup === band.roleGroup
    && observation.startAge >= band.minimumAge
    && observation.startAge <= band.maximumAge
  );
  const aboveUpper = inBand.find(
    (observation) =>
      observation.peakRoleAbility
        > observation.publicUpperRoleAbility + ABILITY_COMPARISON_EPSILON,
  );
  const example = aboveUpper ?? inBand[0];
  return example === undefined ? undefined : projectionGateExample(example);
}

function projectionGateExample(
  observation: PlayerPotentialOutcomeObservation,
): PlayerPotentialOutcomeGateExample {
  return {
    sourceId: observation.sourceId,
    startAge: observation.startAge,
    roleGroup: observation.roleGroup,
    roomBand: observation.roomBand,
    participationBand: observation.participationBand,
    publicLowerRating: observation.publicLowerRating,
    publicExpectedRating: observation.publicExpectedRating,
    publicUpperRating: observation.publicUpperRating,
    publicUpperRoleAbility: observation.publicUpperRoleAbility,
    peakRoleAbility: observation.peakRoleAbility,
    ceilingRoleAbility: observation.ceilingRoleAbility,
  };
}

function validateCoverage(coverage: PlayerPotentialOutcomeCoverageContract): void {
  if (
    coverage.startAges.length === 0
    || coverage.roleGroups.length === 0
    || coverage.roomBands.length === 0
    || coverage.participationBands.length === 0
    || !Number.isSafeInteger(coverage.observationsPerCell)
    || coverage.observationsPerCell <= 0
    || new Set(coverage.startAges).size !== coverage.startAges.length
    || new Set(coverage.roleGroups).size !== coverage.roleGroups.length
    || new Set(coverage.roomBands).size !== coverage.roomBands.length
    || new Set(coverage.participationBands).size
      !== coverage.participationBands.length
  ) {
    throw new Error("Potential-outcome audit requires a complete coverage contract");
  }
}

function validateCalibrationAgeBands(
  ageBands: readonly PotentialProjectionCalibrationAgeBand[],
): void {
  if (ageBands.length === 0) {
    throw new Error("Potential projection calibration requires age bands");
  }
  for (const roleGroup of ["goalkeeper", "outfield"] as const) {
    const familyBands = ageBands
      .filter((ageBand) => ageBand.roleGroup === roleGroup)
      .sort((left, right) => left.minimumAge - right.minimumAge);
    if (familyBands.length === 0) {
      throw new Error(`Potential projection calibration is missing ${roleGroup} bands`);
    }
    let previousMaximumAge = -1;
    for (const ageBand of familyBands) {
      if (
        !Number.isSafeInteger(ageBand.minimumAge)
        || !Number.isSafeInteger(ageBand.maximumAge)
        || ageBand.minimumAge !== previousMaximumAge + 1
        || ageBand.maximumAge < ageBand.minimumAge
      ) {
        throw new Error(
          `Potential projection calibration ${roleGroup} bands must be contiguous`,
        );
      }
      previousMaximumAge = ageBand.maximumAge;
    }
  }
}

function validateObservations(
  observations: readonly PlayerPotentialOutcomeObservation[],
): void {
  const ids = new Set<string>();
  for (const observation of observations) {
    if (
      observation.sourceId.length === 0
      || ids.has(observation.sourceId)
      || !Number.isInteger(observation.startAge)
      || observation.startAge < 0
      || observation.ceilingRoleAbility < observation.startingRoleAbility
      || observation.remainingRoom < 0
      || [
        observation.startingRoleAbility,
        observation.ceilingRoleAbility,
        observation.peakRoleAbility,
        observation.finalRoleAbility,
        observation.remainingRoom,
        observation.publicLowerRoleAbility,
        observation.publicExpectedRoleAbility,
        observation.publicUpperRoleAbility,
        observation.publicLowerRating,
        observation.publicExpectedRating,
        observation.publicUpperRating,
      ].some((value) => !Number.isFinite(value))
    ) {
      throw new Error("Potential-outcome audit received an invalid or duplicate observation");
    }
    ids.add(observation.sourceId);
  }
}
