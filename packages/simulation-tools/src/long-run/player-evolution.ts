/** Player snapshot row used by long-run player-evolution reports. */
export interface LongRunPlayerSnapshotRow {
  /** Stable player ID as a string so callers can keep package boundaries clean. */
  readonly playerId: string;
  /** Human-readable name used only by lab reports. */
  readonly displayName: string;
  /** Age at the snapshot date. */
  readonly age: number;
  /** Current average true ability on the 0-20 scale. */
  readonly currentAbility: number;
  /** Average remaining room between current ability and true potential. */
  readonly potentialRoom: number;
  /** Optional minutes observed by lab callers for the represented period. */
  readonly minutes?: number;
  /** Optional starts observed by lab callers for the represented period. */
  readonly starts?: number;
  /** Optional substitute appearances observed by lab callers for the period. */
  readonly substituteAppearances?: number;
  /** Optional average rating observed by lab callers for the period. */
  readonly averageRating?: number;
  /** Optional count of distinct roles/position families used by the player. */
  readonly roleExposureCount?: number;
  /** Optional lowest physical current ability observed by caller-owned diagnostics. */
  readonly physicalCurrentMinimum?: number;
}

/** Season-level player production row used by long-run reports. */
export interface LongRunPlayerProductionRow {
  /** Simulated season number inside the long run. */
  readonly seasonNumber: number;
  /** Top scorer name for this season. */
  readonly topScorerName: string;
  /** Top scorer goal count for this season. */
  readonly topScorerGoals: number;
  /** Top assist name for this season. */
  readonly topAssistName: string;
  /** Top assist count for this season. */
  readonly topAssists: number;
  /** Club where the highest single creator share happened. */
  readonly topCreatorClubName: string;
  /** Player responsible for the highest single creator share. */
  readonly topCreatorName: string;
  /** Assists credited to the highest-share creator. */
  readonly topCreatorAssists: number;
  /** Goals scored by the highest-share creator's club. */
  readonly topCreatorClubGoals: number;
  /** Leading scorer from the same club as the highest-share creator. */
  readonly topCreatorClubTopScorerName: string;
  /** Goals scored by that same-club leading scorer. */
  readonly topCreatorClubTopScorerGoals: number;
  /** Players with at least five assists. */
  readonly assistPlayersAtLeastFive: number;
  /** Players with at least eight assists. */
  readonly assistPlayersAtLeastEight: number;
  /** Players with at least ten assists. */
  readonly assistPlayersAtLeastTen: number;
  /** Players with at least twelve assists. */
  readonly assistPlayersAtLeastTwelve: number;
  /** Highest single creator share of a club's goals in this season. */
  readonly topAssistClubGoalShare: number;
  /** Highest top-three creator share of a club's goals in this season. */
  readonly topThreeAssistClubGoalShare: number;
}

/** One club-level squad-use evidence row for long-run reports. */
export interface LongRunSquadUseRow {
  /** Simulated season number inside the long run. */
  readonly seasonNumber: number;
  /** Club represented by this evidence row. */
  readonly clubName: string;
  /** Distinct players used by this club in the season. */
  readonly playersUsed: number;
  /** Players who started at least one match. */
  readonly startersUsed: number;
  /** Most starts credited to a single player. */
  readonly maxPlayerStarts: number;
}

/** Input for player-evolution report generation. */
export interface CreateLongRunPlayerEvolutionReportInput {
  /** Player snapshot before long-run development starts. */
  readonly initialPlayers: readonly LongRunPlayerSnapshotRow[];
  /** Player snapshot after long-run development ends. */
  readonly finalPlayers: readonly LongRunPlayerSnapshotRow[];
  /** Season-level production summaries. */
  readonly production: readonly LongRunPlayerProductionRow[];
  /** Optional squad-use evidence produced by callers that simulate AI rotation. */
  readonly squadUse?: readonly LongRunSquadUseRow[];
  /** Current-ability threshold for players considered useful beyond the lower division. */
  readonly usefulPlayerCurrentAbilityThreshold: number;
}

/** One player movement row for a long-run development report. */
export interface LongRunPlayerMovementRow {
  /** Stable player ID. */
  readonly playerId: string;
  /** Human-readable player name. */
  readonly displayName: string;
  /** Age before development. */
  readonly startAge: number;
  /** Age after development. */
  readonly endAge: number;
  /** Current-ability delta across the run. */
  readonly delta: number;
  /** Remaining-potential-room delta across the run. Negative means compression. */
  readonly potentialRoomDelta: number;
}

/** One representative trajectory row used by developer diagnostics. */
export interface LongRunPlayerTrajectorySampleRow {
  /** Target age this row represents. */
  readonly targetAge: number;
  /** Stable player ID so a failed sample can be traced. */
  readonly playerId: string;
  /** Human-readable player name for lab output. */
  readonly displayName: string;
  /** Player age before the run. */
  readonly startAge: number;
  /** Player age after the run. */
  readonly endAge: number;
  /** Starting current ability. */
  readonly startCurrentAbility: number;
  /** Ending current ability. */
  readonly endCurrentAbility: number;
  /** Current-ability delta across the run. */
  readonly delta: number;
  /** Starting current-to-potential room. */
  readonly startPotentialRoom: number;
  /** Ending current-to-potential room. */
  readonly endPotentialRoom: number;
  /** Potential-room delta across the run. */
  readonly potentialRoomDelta: number;
  /** Optional minutes observed by lab callers. */
  readonly minutes: number;
  /** Optional starts observed by lab callers. */
  readonly starts: number;
  /** Optional substitute appearances observed by lab callers. */
  readonly substituteAppearances: number;
  /** Optional average rating observed by lab callers. */
  readonly averageRating?: number;
  /** Optional role exposure count observed by lab callers. */
  readonly roleExposureCount: number;
}

/** Diagnostic check emitted by long-run reports for traceable failures. */
export interface LongRunPlayerTrajectoryCheck {
  /** Stable machine-readable check key. */
  readonly key: string;
  /** Severity suitable for gates and audits. */
  readonly status: "pass" | "warn" | "fail";
  /** Measured value for the check. */
  readonly value: number;
  /** Threshold used by the check. */
  readonly threshold: number;
  /** Player ID that owns a failed/warning observation, when applicable. */
  readonly playerId?: string;
  /** Player name that owns a failed/warning observation, when applicable. */
  readonly displayName?: string;
}

/** Developer-only player trajectory diagnostics. */
export interface LongRunPlayerTrajectoryDiagnostics {
  /** Ages the report tries to represent with deterministic sample rows. */
  readonly sampleAges: readonly number[];
  /** Representative trajectory samples for the configured age anchors. */
  readonly samples: readonly LongRunPlayerTrajectorySampleRow[];
  /** Aggregate checks that map failures back to player IDs. */
  readonly checks: readonly LongRunPlayerTrajectoryCheck[];
}

/** Aggregate player-evolution report for one long run. */
export interface LongRunPlayerEvolutionReport {
  /** Average current ability before development. */
  readonly startAverageCurrentAbility: number;
  /** Average current ability after development. */
  readonly endAverageCurrentAbility: number;
  /** Players whose average current ability increased. */
  readonly playersImproved: number;
  /** Players whose average current ability declined. */
  readonly playersDeclined: number;
  /** Players age 21 or under with notable potential room at the start. */
  readonly seriousProspects: number;
  /** Rare higher-upside young players at the start. */
  readonly rareProdigies: number;
  /** Initial players still above the supplied usefulness threshold at the end. */
  readonly usefulAfterLongRun: number;
  /** Initial players whose final potential room is lower than the starting room. */
  readonly playersWithCompressedPotentialRoom: number;
  /** Final age-distribution bucket for age 21 or under. */
  readonly finalAgeUnder22: number;
  /** Final age-distribution bucket for age 22 to 29. */
  readonly finalAge22To29: number;
  /** Final age-distribution bucket for age 30 or older. */
  readonly finalAge30Plus: number;
  /** Largest positive movement rows. */
  readonly topImprovers: readonly LongRunPlayerMovementRow[];
  /** Largest negative movement rows. */
  readonly biggestDecliners: readonly LongRunPlayerMovementRow[];
  /** Per-season production rows. */
  readonly production: readonly LongRunPlayerProductionRow[];
  /** Optional squad-use evidence rows. */
  readonly squadUse?: readonly LongRunSquadUseRow[];
  /** Developer-only trajectory diagnostics for balancing audits. */
  readonly trajectoryDiagnostics?: LongRunPlayerTrajectoryDiagnostics;
}

/**
 * Creates player-evolution metrics from initial/final player snapshots.
 *
 * The function does not inspect hidden player entities directly. Callers decide
 * which snapshot fields are allowed in lab output and pass only those values.
 */
export function createLongRunPlayerEvolutionReport(
  input: CreateLongRunPlayerEvolutionReportInput,
): LongRunPlayerEvolutionReport {
  const finalById = new Map(input.finalPlayers.map((player) => [player.playerId, player]));
  const movements = input.initialPlayers.flatMap((initial): readonly LongRunPlayerMovementRow[] => {
    const final = finalById.get(initial.playerId);

    if (final === undefined) {
      return [];
    }

    return [
      {
        playerId: initial.playerId,
        displayName: initial.displayName,
        startAge: initial.age,
        endAge: final.age,
        delta: roundMetric(final.currentAbility - initial.currentAbility),
        potentialRoomDelta: roundMetric(final.potentialRoom - initial.potentialRoom),
      },
    ];
  });

  return {
    startAverageCurrentAbility: roundMetric(average(input.initialPlayers.map((player) => player.currentAbility))),
    endAverageCurrentAbility: roundMetric(average(input.finalPlayers.map((player) => player.currentAbility))),
    playersImproved: movements.filter((movement) => movement.delta > 0).length,
    playersDeclined: movements.filter((movement) => movement.delta < 0).length,
    seriousProspects: input.initialPlayers.filter(isSeriousProspect).length,
    rareProdigies: input.initialPlayers.filter(isRareProdigy).length,
    usefulAfterLongRun: input.finalPlayers.filter((player) => player.currentAbility >= input.usefulPlayerCurrentAbilityThreshold).length,
    playersWithCompressedPotentialRoom: movements.filter((movement) => movement.potentialRoomDelta < 0).length,
    finalAgeUnder22: input.finalPlayers.filter((player) => player.age <= 21).length,
    finalAge22To29: input.finalPlayers.filter((player) => player.age >= 22 && player.age <= 29).length,
    finalAge30Plus: input.finalPlayers.filter((player) => player.age >= 30).length,
    topImprovers: topMovements(movements, "improver"),
    biggestDecliners: topMovements(movements, "decliner"),
    production: input.production,
    squadUse: input.squadUse ?? [],
    trajectoryDiagnostics: createTrajectoryDiagnostics(input, movements),
  };
}

const TRAJECTORY_SAMPLE_AGES = [16, 18, 21, 24, 26, 29, 32, 36, 40] as const;

function createTrajectoryDiagnostics(
  input: CreateLongRunPlayerEvolutionReportInput,
  movements: readonly LongRunPlayerMovementRow[],
): LongRunPlayerTrajectoryDiagnostics {
  const finalById = new Map(input.finalPlayers.map((player) => [player.playerId, player]));
  const samples = TRAJECTORY_SAMPLE_AGES.flatMap((targetAge): readonly LongRunPlayerTrajectorySampleRow[] => {
    const initial = nearestPlayerForAge(input.initialPlayers, targetAge);
    const final = initial === undefined ? undefined : finalById.get(initial.playerId);
    const averageRating = initial?.averageRating ?? final?.averageRating;

    if (initial === undefined || final === undefined) {
      return [];
    }

    return [
      {
        targetAge,
        playerId: initial.playerId,
        displayName: initial.displayName,
        startAge: initial.age,
        endAge: final.age,
        startCurrentAbility: roundMetric(initial.currentAbility),
        endCurrentAbility: roundMetric(final.currentAbility),
        delta: roundMetric(final.currentAbility - initial.currentAbility),
        startPotentialRoom: roundMetric(initial.potentialRoom),
        endPotentialRoom: roundMetric(final.potentialRoom),
        potentialRoomDelta: roundMetric(final.potentialRoom - initial.potentialRoom),
        minutes: initial.minutes ?? final.minutes ?? 0,
        starts: initial.starts ?? final.starts ?? 0,
        substituteAppearances: initial.substituteAppearances ?? final.substituteAppearances ?? 0,
        ...(averageRating === undefined ? {} : { averageRating: roundMetric(averageRating) }),
        roleExposureCount: initial.roleExposureCount ?? final.roleExposureCount ?? 0,
      },
    ];
  });

  return {
    sampleAges: TRAJECTORY_SAMPLE_AGES,
    samples,
    checks: [
      nonNegativePotentialRoomCheck(input.initialPlayers, input.finalPlayers),
      matureGrowthFeasibilityCheck(input.initialPlayers, movements),
      physicalFloorCheck(input.initialPlayers, input.finalPlayers),
      potentialCompressionCheck(movements),
    ],
  };
}

function nearestPlayerForAge(
  players: readonly LongRunPlayerSnapshotRow[],
  targetAge: number,
): LongRunPlayerSnapshotRow | undefined {
  return [...players].sort((left, right) => {
    const distance = Math.abs(left.age - targetAge) - Math.abs(right.age - targetAge);
    if (distance !== 0) {
      return distance;
    }

    const currentAbility = right.currentAbility - left.currentAbility;
    if (currentAbility !== 0) {
      return currentAbility;
    }

    return left.playerId.localeCompare(right.playerId);
  })[0];
}

function nonNegativePotentialRoomCheck(
  initialPlayers: readonly LongRunPlayerSnapshotRow[],
  finalPlayers: readonly LongRunPlayerSnapshotRow[],
): LongRunPlayerTrajectoryCheck {
  const worst = [...initialPlayers, ...finalPlayers].sort((left, right) => left.potentialRoom - right.potentialRoom)[0];
  const value = roundMetric(worst?.potentialRoom ?? 0);

  return {
    key: "potential_room_non_negative",
    status: value < -0.01 ? "fail" : "pass",
    value,
    threshold: 0,
    ...(value < -0.01 && worst !== undefined ? { playerId: worst.playerId, displayName: worst.displayName } : {}),
  };
}

function matureGrowthFeasibilityCheck(
  initialPlayers: readonly LongRunPlayerSnapshotRow[],
  movements: readonly LongRunPlayerMovementRow[],
): LongRunPlayerTrajectoryCheck {
  const initialById = new Map(initialPlayers.map((player) => [player.playerId, player]));
  const worst = [...movements]
    .filter((movement) => (initialById.get(movement.playerId)?.age ?? 0) >= 26)
    .sort((left, right) => right.delta - left.delta)[0];
  const value = roundMetric(worst?.delta ?? 0);
  const threshold = 2.5;

  return {
    key: "mature_growth_feasibility",
    status: value > threshold ? "warn" : "pass",
    value,
    threshold,
    ...(value > threshold && worst !== undefined ? { playerId: worst.playerId, displayName: worst.displayName } : {}),
  };
}

function physicalFloorCheck(
  initialPlayers: readonly LongRunPlayerSnapshotRow[],
  finalPlayers: readonly LongRunPlayerSnapshotRow[],
): LongRunPlayerTrajectoryCheck {
  const playersWithPhysicalFloor = [...initialPlayers, ...finalPlayers].filter(
    (player) => player.physicalCurrentMinimum !== undefined,
  );

  if (playersWithPhysicalFloor.length === 0) {
    return {
      key: "physical_floor",
      status: "pass",
      value: 0,
      threshold: 7,
    };
  }

  const worst = [...playersWithPhysicalFloor].sort(
    (left, right) => (left.physicalCurrentMinimum ?? 0) - (right.physicalCurrentMinimum ?? 0),
  )[0];
  const value = roundMetric(worst?.physicalCurrentMinimum ?? 0);

  return {
    key: "physical_floor",
    status: value < 7 ? "fail" : "pass",
    value,
    threshold: 7,
    ...(value < 7 && worst !== undefined ? { playerId: worst.playerId, displayName: worst.displayName } : {}),
  };
}

function potentialCompressionCheck(movements: readonly LongRunPlayerMovementRow[]): LongRunPlayerTrajectoryCheck {
  const compressed = movements.filter((movement) => movement.potentialRoomDelta < 0).length;

  return {
    key: "potential_room_compression_observed",
    status: "pass",
    value: compressed,
    threshold: 0,
  };
}

function isSeriousProspect(player: LongRunPlayerSnapshotRow): boolean {
  return player.age <= 21 && player.potentialRoom >= 2.5;
}

function isRareProdigy(player: LongRunPlayerSnapshotRow): boolean {
  return player.age <= 18 && player.currentAbility >= 9.5 && player.potentialRoom >= 4;
}

function topMovements(
  movements: readonly LongRunPlayerMovementRow[],
  mode: "improver" | "decliner",
): readonly LongRunPlayerMovementRow[] {
  const sorted = [...movements].sort((left, right) => {
    const delta = mode === "improver" ? right.delta - left.delta : left.delta - right.delta;

    if (delta !== 0) {
      return delta;
    }

    return left.playerId.localeCompare(right.playerId);
  });

  return sorted.filter((movement) => (mode === "improver" ? movement.delta > 0 : movement.delta < 0)).slice(0, 3);
}

function average(values: readonly number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function roundMetric(value: number): number {
  return Math.round(value * 100) / 100;
}
