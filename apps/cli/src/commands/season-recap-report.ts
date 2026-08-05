import { access, mkdir, writeFile } from "node:fs/promises";
import { availableParallelism } from "node:os";
import { dirname, isAbsolute, join } from "node:path";
import {
  formatSupportedLanguages,
  parseLanguageCode,
  type SupportedLanguage,
} from "@game/i18n";

import {
  createSeasonRecapReport,
  formatSeasonRecapDetailMarkdown,
  formatSeasonRecapReportMarkdown,
  type SeasonRecapReport,
} from "./season-recap-report/recap-report.ts";
import {
  createSeasonRecapPartitions,
  runSeasonRecapWorkerThread,
  type SeasonRecapWorldFailure,
  type SeasonRecapWorldSummary,
} from "./season-recap-report/recap-world.ts";

/**
 * Runs the Phase 81 season-recap engine inspection.
 *
 * The command simulates worlds through the existing single-world report path,
 * projects each completed season into four football charts, and evaluates every
 * frozen band against it. It changes no calibration and tunes nothing: a band
 * that fails is reported failed, with the number that failed it.
 *
 * Amendment A10 permits one such run before Step 15, and only on the condition
 * that nothing cites its output as balance evidence.
 */

/** Default seed prefix for the inspection. */
export const DEFAULT_SEASON_RECAP_SEED_PREFIX = "phase81-season-recap";

/** Default worlds simulated. */
export const DEFAULT_SEASON_RECAP_WORLDS = 20;

/** Default seasons simulated per world. */
export const DEFAULT_SEASON_RECAP_SEASONS = 5;

/** Minimal IO adapter used by command tests. */
export interface SeasonRecapReportCommandIo {
  /** Writes normal command output. */
  readonly stdout: (line: string) => void;
  /** Writes command errors. */
  readonly stderr: (line: string) => void;
}

/** Validated command arguments. */
interface SeasonRecapReportArgs {
  readonly seedPrefix: string;
  readonly worldCount: number;
  readonly seasonCount: number;
  readonly workerCount: number;
  readonly language: SupportedLanguage;
  readonly reportOutputPath: string;
  readonly detailOutputPath: string | undefined;
}

const USAGE = [
  "Usage: season-recap-report [options]",
  "",
  "  --seed-prefix=<text>     Seed prefix every world seed derives from",
  "  --worlds=<n>             Worlds to simulate",
  "  --seasons=<n>            Seasons per world",
  "  --workers=<n>            Worker threads, capped at the world count",
  "  --report-output=<path>   Aggregate report file (required)",
  "  --detail-output=<path>   Directory for one file per simulated season",
  "  --language=<code>        Report language",
].join("\n");

/**
 * Runs the deterministic season-recap inspection command.
 *
 * @example
 * await runSeasonRecapReportCommand(["--worlds=20", "--report-output=out.md"]);
 */
export async function runSeasonRecapReportCommand(
  args: readonly string[],
  io: SeasonRecapReportCommandIo = defaultIo(),
): Promise<number> {
  let parsed: SeasonRecapReportArgs;
  try {
    parsed = parseArgs(args);
  } catch (error) {
    io.stderr(error instanceof Error ? error.message : String(error));
    io.stderr(USAGE);
    return 1;
  }

  const { worlds, failures } = await runWorlds(parsed);
  const report = createSeasonRecapReport({
    seedPrefix: parsed.seedPrefix,
    seasonCount: parsed.seasonCount,
    worlds,
    failures,
  });

  await writeTextFile(parsed.reportOutputPath, formatSeasonRecapReportMarkdown(report));

  if (parsed.detailOutputPath !== undefined) {
    await writeSeasonDetail(parsed.detailOutputPath, worlds);
  }

  for (const line of formatSeasonRecapConsoleOutput(report, parsed.reportOutputPath)) {
    io.stdout(line);
  }

  // A failing band is the finding this run exists to produce, so it is reported
  // rather than treated as a broken command. The exit code still separates "the
  // football is inside every band" from "it is not", because a check in a
  // pipeline needs to be able to tell.
  return report.failedCheckKeys.length === 0 ? 0 : 1;
}

/** Simulates every world, in deterministic order, across worker threads. */
async function runWorlds(parsed: SeasonRecapReportArgs): Promise<{
  readonly worlds: readonly SeasonRecapWorldSummary[];
  readonly failures: readonly SeasonRecapWorldFailure[];
}> {
  const partitions = createSeasonRecapPartitions(parsed.worldCount, parsed.workerCount);
  const results = await Promise.all(
    partitions.map((partition) =>
      runSeasonRecapWorkerThread({
        reportKind: "season-recap",
        seedPrefix: parsed.seedPrefix,
        seasonCount: parsed.seasonCount,
        language: parsed.language,
        ...partition,
      }),
    ),
  );
  const ordered = results.sort(
    (left, right) => left.partition.startIndex - right.partition.startIndex,
  );

  return {
    worlds: ordered.flatMap((result) => result.worlds),
    failures: ordered.flatMap((result) => result.failures),
  };
}

/** Writes one markdown file per simulated season. */
async function writeSeasonDetail(
  directoryPath: string,
  worlds: readonly SeasonRecapWorldSummary[],
): Promise<void> {
  for (const world of worlds) {
    for (const season of world.seasons) {
      const name = `${world.seed}-season-${String(season.seasonNumber).padStart(3, "0")}.md`;
      await writeTextFile(
        join(directoryPath, name),
        formatSeasonRecapDetailMarkdown(world.seed, season),
      );
    }
  }
}

/** Renders the console summary, which names every failing band. */
export function formatSeasonRecapConsoleOutput(
  report: SeasonRecapReport,
  reportOutputPath: string,
): readonly string[] {
  return [
    "The Long Season season-recap inspection",
    `Seed prefix: ${report.population.seedPrefix}`,
    `Worlds: ${report.population.worldCount}/${report.population.requestedWorldCount}`
    + ` Seasons per world: ${report.population.seasonCount}`
    + ` Total: ${report.population.totalSeasons}`,
    ...(report.failures.length === 0
      ? []
      : [`Worlds that did not finish: ${report.failures.length}`
        + ` (${report.failures.map((failure) => failure.seed).join(", ")})`]),
    `Clubs: ${report.population.clubCount}`
    + ` Distinct shapes: ${report.distinctFormations}`
    + ` Distinct champions: ${report.distinctChampions}`,
    "",
    "Bands:",
    ...report.checks.map((check) =>
      `  ${check.failCount === 0 ? "PASS" : "FAIL"} ${check.key}`
      + ` observed=[${check.min}, ${check.max}] mean=${check.mean}`
      + ` pass=${check.passCount} fail=${check.failCount}`,
    ),
    "",
    report.failedCheckKeys.length === 0
      ? "Every band passed every season."
      : `Failing bands: ${report.failedCheckKeys.join(", ")}`,
    "This run is not evidence. See amendment A10.",
    `Report: ${reportOutputPath}`,
  ];
}

/** Parses and validates command arguments. */
function parseArgs(args: readonly string[]): SeasonRecapReportArgs {
  const values = new Map<string, string>();

  for (const arg of args) {
    const match = /^--([a-z-]+)=(.*)$/.exec(arg);
    if (match === null || match[1] === undefined || match[2] === undefined) {
      throw new Error(`Unrecognized season-recap-report argument: ${arg}`);
    }
    values.set(match[1], match[2]);
  }

  const known = new Set([
    "seed-prefix", "worlds", "seasons", "workers", "report-output", "detail-output", "language",
  ]);
  for (const key of values.keys()) {
    if (!known.has(key)) {
      throw new Error(`Unrecognized season-recap-report option: --${key}`);
    }
  }

  const reportOutputPath = values.get("report-output");
  if (reportOutputPath === undefined || reportOutputPath === "") {
    throw new Error("season-recap-report requires --report-output=<path>");
  }

  const worldCount = positiveInteger(values.get("worlds"), DEFAULT_SEASON_RECAP_WORLDS, "worlds");
  const detailOutputPath = values.get("detail-output");

  return {
    seedPrefix: values.get("seed-prefix") ?? DEFAULT_SEASON_RECAP_SEED_PREFIX,
    worldCount,
    seasonCount: positiveInteger(values.get("seasons"), DEFAULT_SEASON_RECAP_SEASONS, "seasons"),
    workerCount: Math.min(
      worldCount,
      positiveInteger(values.get("workers"), defaultWorkerCount(), "workers"),
    ),
    language: supportedLanguage(values.get("language")),
    reportOutputPath,
    detailOutputPath: detailOutputPath === "" ? undefined : detailOutputPath,
  };
}

/**
 * Resolves the report language, refusing an unsupported code.
 *
 * `parseLanguageCode(...)` answers `undefined` for anything it does not know,
 * and quietly falling back to English there would run a whole inspection in a
 * language nobody asked for.
 */
function supportedLanguage(value: string | undefined): SupportedLanguage {
  const language = parseLanguageCode(value ?? "en");

  if (language === undefined) {
    throw new Error(`--language must be one of ${formatSupportedLanguages()}: ${value}`);
  }

  return language;
}

/** Reads one optional positive-integer option. */
function positiveInteger(value: string | undefined, fallback: number, label: string): number {
  if (value === undefined) return fallback;

  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    throw new Error(`--${label} must be a positive integer: ${value}`);
  }

  return parsed;
}

/** Leaves two cores for the operating system and this process. */
function defaultWorkerCount(): number {
  return Math.max(1, availableParallelism() - 2);
}

/** Creates the default console-backed IO adapter. */
function defaultIo(): SeasonRecapReportCommandIo {
  return {
    stdout: (line) => console.log(line),
    stderr: (line) => console.error(line),
  };
}

/** Writes a UTF-8 text artifact, creating the parent folder when needed. */
async function writeTextFile(path: string, contents: string): Promise<void> {
  const resolvedPath = await resolveWorkspaceOutputPath(path);
  await mkdir(dirname(resolvedPath), { recursive: true });
  await writeFile(resolvedPath, contents, "utf8");
}

/** Resolves CLI output artifacts from the workspace root. */
async function resolveWorkspaceOutputPath(path: string): Promise<string> {
  if (isAbsolute(path)) return path;

  return join(await findWorkspaceRoot(), path);
}

/** Walks upward until the monorepo workspace marker is found. */
async function findWorkspaceRoot(): Promise<string> {
  let current = process.cwd();

  while (true) {
    try {
      await access(join(current, "pnpm-workspace.yaml"));
      return current;
    } catch {
      const parent = dirname(current);
      if (parent === current) return process.cwd();
      current = parent;
    }
  }
}
