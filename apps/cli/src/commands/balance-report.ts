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
  createTranslator,
  formatSupportedLanguages,
  parseLanguageCode,
  type MessageKey,
  type SupportedLanguage,
  type Translator,
} from "@game/i18n";
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
  const text = createTranslator(parsed.language);

  if (!parsed.ok) {
    io.stderr(parsed.message);
    io.stderr(text("balance.usage"));
    return 1;
  }

  const league = createFakeLeagueSystem();
  const report = createCalibrationReport({
    seedPrefix: parsed.seedPrefix,
    seasonCount: parsed.seasonCount,
    targets: targetsForProfile(parsed.targetProfile),
    createSeasonInput: (seed) => seasonInputForCli(league, seed),
  });

  for (const line of formatBalanceReportOutput(report, parsed.targetProfile, parsed.strict, text)) {
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
  let language: SupportedLanguage = "en";

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === undefined) {
      continue;
    }

    if (arg === "--strict") {
      strict = true;
      continue;
    }

    if (arg === "--lang") {
      const value = args[index + 1];
      const parsedLanguage = parseLanguageCode(value);

      if (parsedLanguage === undefined) {
        return {
          ok: false,
          language,
          message:
            value === undefined || value.length === 0
              ? createTranslator(language)("cli.error.langRequiresValue", { supported: formatSupportedLanguages() })
              : createTranslator(language)("cli.error.unsupportedLanguage", {
                  value,
                  supported: formatSupportedLanguages(),
                }),
        };
      }

      language = parsedLanguage;
      index += 1;
      continue;
    }

    if (arg.startsWith("--lang=")) {
      const value = arg.slice("--lang=".length);
      const parsedLanguage = parseLanguageCode(value);

      if (parsedLanguage === undefined) {
        return {
          ok: false,
          language,
          message: createTranslator(language)("cli.error.unsupportedLanguage", {
            value,
            supported: formatSupportedLanguages(),
          }),
        };
      }

      language = parsedLanguage;
      continue;
    }

    if (arg === "--seed-prefix") {
      const value = args[index + 1];

      if (value === undefined || value.length === 0) {
        return { ok: false, language, message: createTranslator(language)("balance.error.seedPrefixRequired") };
      }

      seedPrefix = value;
      index += 1;
      continue;
    }

    if (arg.startsWith("--seed-prefix=")) {
      const value = arg.slice("--seed-prefix=".length);

      if (value.length === 0) {
        return { ok: false, language, message: createTranslator(language)("balance.error.seedPrefixRequired") };
      }

      seedPrefix = value;
      continue;
    }

    if (arg === "--seasons") {
      const value = args[index + 1];

      if (value === undefined) {
        return { ok: false, language, message: createTranslator(language)("balance.error.seasonsRequired") };
      }

      const parsedSeasonCount = parseSeasonCount(value);

      if (parsedSeasonCount === undefined) {
        return {
          ok: false,
          language,
          message: createTranslator(language)("balance.error.seasonsInvalid", { value }),
        };
      }

      seasonCount = parsedSeasonCount;
      index += 1;
      continue;
    }

    if (arg.startsWith("--seasons=")) {
      const value = arg.slice("--seasons=".length);
      const parsedSeasonCount = parseSeasonCount(value);

      if (parsedSeasonCount === undefined) {
        return {
          ok: false,
          language,
          message: createTranslator(language)("balance.error.seasonsInvalid", { value }),
        };
      }

      seasonCount = parsedSeasonCount;
      continue;
    }

    if (arg === "--target-profile") {
      const value = args[index + 1];
      const parsedTargetProfile = parseTargetProfile(value);

      if (parsedTargetProfile === undefined) {
        return {
          ok: false,
          language,
          message: createTranslator(language)("balance.error.unknownTargetProfile", { value: value ?? "<none>" }),
        };
      }

      targetProfile = parsedTargetProfile;
      index += 1;
      continue;
    }

    if (arg.startsWith("--target-profile=")) {
      const value = arg.slice("--target-profile=".length);
      const parsedTargetProfile = parseTargetProfile(value);

      if (parsedTargetProfile === undefined) {
        return {
          ok: false,
          language,
          message: createTranslator(language)("balance.error.unknownTargetProfile", { value }),
        };
      }

      targetProfile = parsedTargetProfile;
      continue;
    }

    return { ok: false, language, message: createTranslator(language)("cli.error.unknownArgument", { arg }) };
  }

  return { ok: true, seedPrefix, seasonCount, strict, targetProfile, language };
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
  text: Translator,
): readonly string[] {
  const lines: string[] = [
    text("balance.title"),
    `${text("balance.seedPrefix")}: ${report.seedPrefix}`,
    `${text("balance.seasons")}: ${report.seasonCount}`,
    `${text("balance.targetProfile")}: ${targetProfile}`,
    `${text("balance.strictMode")}: ${strict ? text("common.true") : text("common.false")}`,
    `${text("balance.status")}: ${text(statusMessageKey(report.status))}`,
    "",
    `${text("balance.header.metric").padEnd(22, " ")} ${text("balance.header.value").padStart(7, " ")} ${text("balance.header.target").padEnd(13, " ")} ${text("balance.status")}`,
  ];

  for (const metric of report.metrics) {
    lines.push(formatMetricRow(metric, text));
  }

  return lines;
}

/**
 * Formats one metric row with a deterministic fixed precision.
 */
function formatMetricRow(metric: CalibrationMetricResult, text: Translator): string {
  return [
    text(balanceMetricMessageKey(metric.label)).padEnd(22, " "),
    formatNumber(metric.value).padStart(7, " "),
    formatTarget(metric.target).padEnd(13, " "),
    text(statusMessageKey(metric.status)),
  ].join(" ");
}

/**
 * Maps current simulation-tools metric labels to presentation message keys.
 */
function balanceMetricMessageKey(label: string): MessageKey {
  switch (label) {
    case "Goals per match":
      return "balance.metric.goals_per_match";
    case "Home win rate":
      return "balance.metric.home_win_rate";
    case "Draw rate":
      return "balance.metric.draw_rate";
    case "Away win rate":
      return "balance.metric.away_win_rate";
    case "First-place points":
      return "balance.metric.first_place_points";
    case "Last-place points":
      return "balance.metric.last_place_points";
    case "Table points spread":
      return "balance.metric.table_points_spread";
    case "Upset proxy rate":
      return "balance.metric.upset_proxy_rate";
    default:
      throw new Error(`Unknown balance metric label: ${label}`);
  }
}

/**
 * Maps report status keys to localized presentation keys.
 */
function statusMessageKey(status: "fail" | "pass"): MessageKey {
  return status === "pass" ? "common.pass" : "common.fail";
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
      readonly language: SupportedLanguage;
    }
  | {
      readonly ok: false;
      readonly message: string;
      readonly language: SupportedLanguage;
    };

/** Club ID type derived from fake content without importing domain directly. */
type ClubId = FakeLeagueSystem["clubIds"][number];
