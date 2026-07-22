import { access, mkdir, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, join } from "node:path";
import {
  createTranslator,
  formatSupportedLanguages,
  parseLanguageCode,
  type SupportedLanguage,
} from "@game/i18n";
import { DEFAULT_LONG_RUN_SEASON_COUNT } from "@game/simulation-tools";
import { createResumableLongRunGateReport } from "./ten-season-report/gate-checkpoint.ts";
import { formatLongRunGateReportMarkdown, formatLongRunGateReportOutput } from "./ten-season-report/gate-output.ts";
import {
  createLongRunGateReport,
  createSingleWorldReport,
} from "./ten-season-report/report-data.ts";
import { formatTenSeasonReportOutput } from "./ten-season-report/single-world-output.ts";

/** Default seed used by the ten-season lab report. */
export const DEFAULT_TEN_SEASON_REPORT_SEED = "world-a";

/**
 * Minimal IO adapter used by command tests.
 */
export interface TenSeasonReportCommandIo {
  /** Writes normal command output. */
  readonly stdout: (line: string) => void;
  /** Writes command errors. */
  readonly stderr: (line: string) => void;
}

/**
 * Runs the deterministic ten-season lab report command.
 *
 * @example
 * await runTenSeasonReportCommand(["--seed=world-a", "--seasons=10"]);
 */
export async function runTenSeasonReportCommand(
  args: readonly string[],
  io: TenSeasonReportCommandIo = defaultIo(),
): Promise<number> {
  const parsed = parseArgs(args);
  const text = createTranslator(parsed.language);

  if (!parsed.ok) {
    io.stderr(parsed.message);
    io.stderr(text("tenSeason.usage"));
    return 1;
  }

  if (parsed.worldCount !== undefined) {
    const batchReport = parsed.checkpointDirectoryPath === undefined
      ? await createLongRunGateReport({
          seedPrefix: parsed.seedPrefix,
          worldCount: parsed.worldCount,
          seasonCount: parsed.seasonCount,
          text,
          language: parsed.language,
        })
      : await createResumableLongRunGateReport({
          seedPrefix: parsed.seedPrefix,
          worldCount: parsed.worldCount,
          seasonCount: parsed.seasonCount,
          language: parsed.language,
          checkpointDirectoryPath: await resolveWorkspaceOutputPath(parsed.checkpointDirectoryPath),
          shardCount: parsed.shardCount ?? Math.min(parsed.worldCount, 100),
          ...(parsed.workerCount === undefined ? {} : { workerCount: parsed.workerCount }),
        });

    if (parsed.reportOutputPath !== undefined) {
      await writeTextFile(parsed.reportOutputPath, formatLongRunGateReportMarkdown(batchReport, parsed.reportOutputPath));
    }

    for (const line of formatLongRunGateReportOutput(batchReport, text, parsed.reportOutputPath)) {
      io.stdout(line);
    }

    return batchReport.failedWorldCount === 0 ? 0 : 1;
  }

  const singleReport = createSingleWorldReport(parsed.seed, parsed.seasonCount, text);

  for (const line of formatTenSeasonReportOutput(
    singleReport.league,
    singleReport.seasons,
    singleReport.playerEvolutionReport,
    singleReport.clubStabilityReport,
    singleReport.youthStabilityReport,
    singleReport.contractFinanceStabilityReport,
    singleReport.anomalyReport,
    singleReport.strengthHierarchy,
    parsed.seed,
    parsed.seasonCount,
    text,
  )) {
    io.stdout(line);
  }

  return 0;
}

/**
 * Creates the default console-backed IO adapter.
 */
function defaultIo(): TenSeasonReportCommandIo {
  return {
    stdout: (line) => console.log(line),
    stderr: (line) => console.error(line),
  };
}

/**
 * Writes a UTF-8 text artifact, creating the parent folder when needed.
 */
async function writeTextFile(path: string, contents: string): Promise<void> {
  const resolvedPath = await resolveWorkspaceOutputPath(path);
  await mkdir(dirname(resolvedPath), { recursive: true });
  await writeFile(resolvedPath, contents, "utf8");
}

/**
 * Resolves CLI output artifacts from the workspace root, even when pnpm runs
 * the filtered CLI package with `apps/cli` as the process working directory.
 */
async function resolveWorkspaceOutputPath(path: string): Promise<string> {
  if (isAbsolute(path)) {
    return path;
  }

  return join(await findWorkspaceRoot(), path);
}

/**
 * Walks upward until the monorepo workspace marker is found.
 */
async function findWorkspaceRoot(): Promise<string> {
  let current = process.cwd();

  while (true) {
    try {
      await access(join(current, "pnpm-workspace.yaml"));
      return current;
    } catch {
      const parent = dirname(current);

      if (parent === current) {
        return process.cwd();
      }

      current = parent;
    }
  }
}

/**
 * Parses command-line arguments for the ten-season report.
 */
function parseArgs(args: readonly string[]): ParsedArgs {
  let seed = DEFAULT_TEN_SEASON_REPORT_SEED;
  let seedPrefix = DEFAULT_TEN_SEASON_REPORT_SEED;
  let seasonCount = DEFAULT_LONG_RUN_SEASON_COUNT;
  let worldCount: number | undefined;
  let reportOutputPath: string | undefined;
  let checkpointDirectoryPath: string | undefined;
  let shardCount: number | undefined;
  let workerCount: number | undefined;
  let language: SupportedLanguage = "en";

  for (const arg of args) {
    if (arg === "--help" || arg === "-h") {
      return { ok: false, message: createTranslator(language)("tenSeason.usage"), language };
    }

    if (arg === "--seed") {
      return { ok: false, message: createTranslator(language)("season.error.seedRequired"), language };
    }

    if (arg.startsWith("--seed=")) {
      const value = arg.slice("--seed=".length);

      if (value.length === 0) {
        return { ok: false, message: createTranslator(language)("season.error.seedRequired"), language };
      }

      seed = value;
      continue;
    }

    if (arg === "--seed-prefix") {
      return { ok: false, message: createTranslator(language)("tenSeason.error.seedPrefixRequired"), language };
    }

    if (arg.startsWith("--seed-prefix=")) {
      const value = arg.slice("--seed-prefix=".length);

      if (value.length === 0) {
        return { ok: false, message: createTranslator(language)("tenSeason.error.seedPrefixRequired"), language };
      }

      seedPrefix = value;
      continue;
    }

    if (arg === "--seasons") {
      return { ok: false, message: createTranslator(language)("tenSeason.error.seasonsRequired"), language };
    }

    if (arg.startsWith("--seasons=")) {
      const value = arg.slice("--seasons=".length);
      const parsed = parseSeasonCount(value);

      if (parsed === undefined) {
        return {
          ok: false,
          message: createTranslator(language)("tenSeason.error.seasonsInvalid", { value }),
          language,
        };
      }

      seasonCount = parsed;
      continue;
    }

    if (arg === "--worlds") {
      return { ok: false, message: createTranslator(language)("tenSeason.error.worldsRequired"), language };
    }

    if (arg.startsWith("--worlds=")) {
      const value = arg.slice("--worlds=".length);
      const parsed = parsePositiveSafeInteger(value);

      if (parsed === undefined) {
        return {
          ok: false,
          message: createTranslator(language)("tenSeason.error.worldsInvalid", { value }),
          language,
        };
      }

      worldCount = parsed;
      continue;
    }

    if (arg === "--report-output") {
      return { ok: false, message: createTranslator(language)("tenSeason.error.reportOutputRequired"), language };
    }

    if (arg.startsWith("--report-output=")) {
      const value = arg.slice("--report-output=".length);

      if (value.length === 0) {
        return { ok: false, message: createTranslator(language)("tenSeason.error.reportOutputRequired"), language };
      }

      reportOutputPath = value;
      continue;
    }

    if (arg === "--checkpoint-dir") {
      return {
        ok: false,
        message: createTranslator(language)("tenSeason.error.checkpointDirectoryRequired"),
        language,
      };
    }

    if (arg.startsWith("--checkpoint-dir=")) {
      const value = arg.slice("--checkpoint-dir=".length);

      if (value.length === 0) {
        return {
          ok: false,
          message: createTranslator(language)("tenSeason.error.checkpointDirectoryRequired"),
          language,
        };
      }

      checkpointDirectoryPath = value;
      continue;
    }

    if (arg === "--shards") {
      return { ok: false, message: createTranslator(language)("tenSeason.error.shardsRequired"), language };
    }

    if (arg.startsWith("--shards=")) {
      const value = arg.slice("--shards=".length);
      const parsed = parsePositiveSafeInteger(value);

      if (parsed === undefined) {
        return {
          ok: false,
          message: createTranslator(language)("tenSeason.error.shardsInvalid", { value }),
          language,
        };
      }

      shardCount = parsed;
      continue;
    }

    if (arg === "--workers") {
      return { ok: false, message: createTranslator(language)("tenSeason.error.workersRequired"), language };
    }

    if (arg.startsWith("--workers=")) {
      const value = arg.slice("--workers=".length);
      const parsed = parsePositiveSafeInteger(value);

      if (parsed === undefined) {
        return {
          ok: false,
          message: createTranslator(language)("tenSeason.error.workersInvalid", { value }),
          language,
        };
      }

      workerCount = parsed;
      continue;
    }

    if (arg === "--lang") {
      return {
        ok: false,
        message: createTranslator(language)("cli.error.langRequiresValue", { supported: formatSupportedLanguages() }),
        language,
      };
    }

    if (arg.startsWith("--lang=")) {
      const value = arg.slice("--lang=".length);
      const parsedLanguage = parseLanguageCode(value);

      if (parsedLanguage === undefined) {
        return {
          ok: false,
          message: createTranslator(language)("cli.error.unsupportedLanguage", {
            value,
            supported: formatSupportedLanguages(),
          }),
          language,
        };
      }

      language = parsedLanguage;
      continue;
    }

    return {
      ok: false,
      message: createTranslator(language)("cli.error.unknownArgument", { arg }),
      language,
    };
  }

  if (checkpointDirectoryPath !== undefined && worldCount === undefined) {
    return {
      ok: false,
      message: createTranslator(language)("tenSeason.error.checkpointDirectoryRequiresWorlds"),
      language,
    };
  }
  if (shardCount !== undefined && checkpointDirectoryPath === undefined) {
    return {
      ok: false,
      message: createTranslator(language)("tenSeason.error.shardsRequireCheckpointDirectory"),
      language,
    };
  }
  if (workerCount !== undefined && checkpointDirectoryPath === undefined) {
    return {
      ok: false,
      message: createTranslator(language)("tenSeason.error.workersRequireCheckpointDirectory"),
      language,
    };
  }

  return {
    ok: true,
    seed,
    seedPrefix,
    seasonCount,
    worldCount,
    reportOutputPath,
    checkpointDirectoryPath,
    shardCount,
    workerCount,
    language,
  };
}

/**
 * Parses a positive safe integer season count.
 */
function parseSeasonCount(value: string): number | undefined {
  return parsePositiveSafeInteger(value);
}

/**
 * Parses a positive safe integer command argument.
 */
function parsePositiveSafeInteger(value: string): number | undefined {
  const parsed = Number(value);

  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    return undefined;
  }

  return parsed;
}

type ParsedArgs =
  | {
      readonly ok: true;
      readonly seed: string;
      readonly seedPrefix: string;
      readonly seasonCount: number;
      readonly worldCount: number | undefined;
      readonly reportOutputPath: string | undefined;
      readonly checkpointDirectoryPath: string | undefined;
      readonly shardCount: number | undefined;
      readonly workerCount: number | undefined;
      readonly language: SupportedLanguage;
    }
  | {
      readonly ok: false;
      readonly message: string;
      readonly language: SupportedLanguage;
    };
