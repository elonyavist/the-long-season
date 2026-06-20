import {
  calibrationV1SeasonCalibrationTargets,
  createFakeLeagueSystem,
  defaultSeasonCalibrationTargets,
  strictFailureSmokeTargets,
  type FakeLeagueSystem,
} from "@game/content";
import {
  deriveTeamStrength,
  type LineupSlot,
  type RoleWeightProfile,
  type SimulateSeasonInput,
  type SimulateSeasonTeamInput,
} from "@game/engine";
import {
  createCalibrationReport,
  type CalibrationMetricResult,
  type CalibrationReport,
  type CalibrationTarget,
} from "@game/simulation-tools";

/** Fixed seed prefix used when the user does not pass `--seed-prefix`. */
export const DEFAULT_BALANCE_REPORT_SEED_PREFIX = "balance-demo";

/** Fixed batch size used when the user does not pass `--seasons`. */
export const DEFAULT_BALANCE_REPORT_SEASON_COUNT = 5;

/**
 * Minimal IO adapter used by command tests.
 */
export interface BalanceReportCommandIo {
  /** Writes normal command output. */
  readonly stdout: (line: string) => void;
  /** Writes command errors. */
  readonly stderr: (line: string) => void;
}

/**
 * Runs the deterministic season balance report command.
 *
 * @example
 * await runBalanceReportCommand(["--seed-prefix=smoke", "--seasons=3"]);
 */
export async function runBalanceReportCommand(
  args: readonly string[],
  io: BalanceReportCommandIo = defaultIo(),
): Promise<number> {
  const parsed = parseArgs(args);

  if (!parsed.ok) {
    io.stderr(parsed.message);
    io.stderr(
      "Usage: pnpm cli balance-report [--seed-prefix=<seed>] [--seasons=<count>] [--target-profile=default|calibration-v1|strict-fail-smoke] [--strict]",
    );
    return 1;
  }

  const league = createFakeLeagueSystem();
  const report = createCalibrationReport({
    seedPrefix: parsed.seedPrefix,
    seasonCount: parsed.seasonCount,
    targets: targetsForProfile(parsed.targetProfile),
    createSeasonInput: (seed) => seasonInputForCli(league, seed),
  });

  for (const line of formatBalanceReportOutput(report, parsed.targetProfile, parsed.strict)) {
    io.stdout(line);
  }

  return parsed.strict && report.status === "fail" ? 1 : 0;
}

/**
 * Creates the default console-backed IO adapter.
 */
function defaultIo(): BalanceReportCommandIo {
  return {
    stdout: (line) => console.log(line),
    stderr: (line) => console.error(line),
  };
}

/**
 * Parses supported balance-report command arguments.
 */
function parseArgs(args: readonly string[]): ParsedBalanceReportArgs {
  let seedPrefix = DEFAULT_BALANCE_REPORT_SEED_PREFIX;
  let seasonCount = DEFAULT_BALANCE_REPORT_SEASON_COUNT;
  let strict = false;
  let targetProfile: TargetProfile = "default";

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === undefined) {
      continue;
    }

    if (arg === "--strict") {
      strict = true;
      continue;
    }

    if (arg === "--seed-prefix") {
      const value = args[index + 1];

      if (value === undefined || value.length === 0) {
        return { ok: false, message: "--seed-prefix requires a non-empty value" };
      }

      seedPrefix = value;
      index += 1;
      continue;
    }

    if (arg.startsWith("--seed-prefix=")) {
      const value = arg.slice("--seed-prefix=".length);

      if (value.length === 0) {
        return { ok: false, message: "--seed-prefix requires a non-empty value" };
      }

      seedPrefix = value;
      continue;
    }

    if (arg === "--seasons") {
      const value = args[index + 1];

      if (value === undefined) {
        return { ok: false, message: "--seasons requires a positive integer" };
      }

      const parsedSeasonCount = parseSeasonCount(value);

      if (parsedSeasonCount === undefined) {
        return { ok: false, message: `--seasons requires a positive integer: ${value}` };
      }

      seasonCount = parsedSeasonCount;
      index += 1;
      continue;
    }

    if (arg.startsWith("--seasons=")) {
      const value = arg.slice("--seasons=".length);
      const parsedSeasonCount = parseSeasonCount(value);

      if (parsedSeasonCount === undefined) {
        return { ok: false, message: `--seasons requires a positive integer: ${value}` };
      }

      seasonCount = parsedSeasonCount;
      continue;
    }

    if (arg === "--target-profile") {
      const value = args[index + 1];
      const parsedTargetProfile = parseTargetProfile(value);

      if (parsedTargetProfile === undefined) {
        return { ok: false, message: `Unknown target profile: ${value ?? "<none>"}` };
      }

      targetProfile = parsedTargetProfile;
      index += 1;
      continue;
    }

    if (arg.startsWith("--target-profile=")) {
      const value = arg.slice("--target-profile=".length);
      const parsedTargetProfile = parseTargetProfile(value);

      if (parsedTargetProfile === undefined) {
        return { ok: false, message: `Unknown target profile: ${value}` };
      }

      targetProfile = parsedTargetProfile;
      continue;
    }

    return { ok: false, message: `Unknown argument: ${arg}` };
  }

  return { ok: true, seedPrefix, seasonCount, strict, targetProfile };
}

/**
 * Parses a positive safe integer season count.
 */
function parseSeasonCount(value: string): number | undefined {
  const parsed = Number(value);

  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    return undefined;
  }

  return parsed;
}

/**
 * Parses a supported target profile.
 */
function parseTargetProfile(value: string | undefined): TargetProfile | undefined {
  if (value === "default" || value === "calibration-v1" || value === "strict-fail-smoke") {
    return value;
  }

  return undefined;
}

/**
 * Selects hand-authored targets for a named profile.
 */
function targetsForProfile(profile: TargetProfile): readonly CalibrationTarget[] {
  if (profile === "calibration-v1") {
    return calibrationV1SeasonCalibrationTargets;
  }

  if (profile === "strict-fail-smoke") {
    return strictFailureSmokeTargets;
  }

  return defaultSeasonCalibrationTargets;
}

/**
 * Builds one season simulation input from fake content and exported engine contracts.
 */
function seasonInputForCli(league: FakeLeagueSystem, seed: string): SimulateSeasonInput {
  return {
    seed,
    seasonId: league.seasonId,
    competitionId: league.competition.id,
    clubIds: league.clubIds,
    seasonStartDate: league.seasonStartDate,
    teamsByClubId: createTeamsByClubId(league),
    matchEngineConfig: league.matchEngineConfig,
    tableRules: league.tableRules,
  };
}

/**
 * Builds aggregate team contexts for all fake clubs.
 */
function createTeamsByClubId(league: FakeLeagueSystem): Readonly<Record<ClubId, SimulateSeasonTeamInput>> {
  const teamsByClubId: Record<ClubId, SimulateSeasonTeamInput> = {};
  const roleWeights: Readonly<Record<string, RoleWeightProfile>> = league.roleWeights;

  for (const clubId of league.clubIds) {
    const lineup = league.lineupsByClubId[clubId];

    if (lineup === undefined) {
      throw new Error(`Missing fake lineup for club: ${clubId}`);
    }

    const typedLineup: readonly LineupSlot[] = lineup;
    teamsByClubId[clubId] = {
      lineup: typedLineup,
      strength: deriveTeamStrength({
        lineup: typedLineup,
        players: league.players,
        playerStates: league.playerStates,
        roleWeights,
        stateMultiplierCurves: league.stateMultiplierCurves,
      }),
      tacticalDistribution: {
        directness: 0.5,
        pressing: 0.5,
        width: 0.5,
        risk: 0.5,
      },
    };
  }

  return teamsByClubId;
}

/**
 * Formats the complete deterministic report output.
 */
function formatBalanceReportOutput(
  report: CalibrationReport,
  targetProfile: TargetProfile,
  strict: boolean,
): readonly string[] {
  const lines: string[] = [
    "The Long Season balance report",
    `Seed prefix: ${report.seedPrefix}`,
    `Seasons: ${report.seasonCount}`,
    `Target profile: ${targetProfile}`,
    `Strict mode: ${strict ? "on" : "off"}`,
    `Status: ${report.status.toUpperCase()}`,
    "",
    "Metric                 Value    Target        Status",
  ];

  for (const metric of report.metrics) {
    lines.push(formatMetricRow(metric));
  }

  return lines;
}

/**
 * Formats one metric row with a deterministic fixed precision.
 */
function formatMetricRow(metric: CalibrationMetricResult): string {
  return [
    metric.label.padEnd(22, " "),
    formatNumber(metric.value).padStart(7, " "),
    formatTarget(metric.target).padEnd(13, " "),
    metric.status.toUpperCase(),
  ].join(" ");
}

/**
 * Formats one number using fixed aggregate precision.
 */
function formatNumber(value: number): string {
  return value.toFixed(3);
}

/**
 * Formats one optional target band.
 */
function formatTarget(target: CalibrationTarget | undefined): string {
  if (target === undefined) {
    return "-";
  }

  return `${formatNumber(target.minInclusive)}..${formatNumber(target.maxInclusive)}`;
}

/**
 * Supported target profile names.
 */
type TargetProfile = "calibration-v1" | "default" | "strict-fail-smoke";

/**
 * Parsed command arguments.
 */
type ParsedBalanceReportArgs =
  | {
      readonly ok: true;
      readonly seedPrefix: string;
      readonly seasonCount: number;
      readonly strict: boolean;
      readonly targetProfile: TargetProfile;
    }
  | {
      readonly ok: false;
      readonly message: string;
    };

/** Club ID type derived from fake content without importing domain directly. */
type ClubId = FakeLeagueSystem["clubIds"][number];
