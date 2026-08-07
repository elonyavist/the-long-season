/**
 * `hard-cap-reachability-report` - runs the preregistered hard-cap probe.
 *
 * The corpus is not configurable and that is the feature: everything except
 * where the artifact lands is fixed in
 * `docs/audits/PHASE_81A_HARD_CAP_REACHABILITY_PREREGISTRATION.md`, so the
 * command cannot be re-run with a wider corpus to reach a nicer answer.
 */
import {
  createTranslator,
  formatSupportedLanguages,
  parseLanguageCode,
  type SupportedLanguage,
  type Translator,
} from "@game/i18n";
import {
  HARD_CAP_REACHABILITY_SEASON_COUNT,
  HARD_CAP_REACHABILITY_SEED_PREFIXES,
  HARD_CAP_REACHABILITY_WORKER_COUNT,
  HARD_CAP_REACHABILITY_WORLDS_PER_PREFIX,
  runHardCapReachabilityProbe,
  type HardCapReachabilityProbeReport,
  type HardCapReachabilityRow,
} from "./hard-cap-reachability-report/probe-data.ts";
import { writeWorkspaceTextFile } from "./workspace-output-path.ts";

/** Declared artifact path from the preregistration. */
export const DEFAULT_HARD_CAP_REACHABILITY_REPORT_PATH =
  "docs/audits/PHASE_81A_HARD_CAP_REACHABILITY_REPORT.md";

/** Minimal IO adapter used by command tests. */
export interface HardCapReachabilityReportCommandIo {
  readonly stdout: (line: string) => void;
  readonly stderr: (line: string) => void;
}

/**
 * The two slow, irreversible things this command does, made replaceable.
 *
 * Not a design flourish: the real probe takes about an hour, so without this
 * seam the only way to find out that an argument is mis-parsed, a summary line
 * is wrong or an exit code is inverted is to spend that hour first.
 */
export interface HardCapReachabilityReportCommandDependencies {
  /** Simulates the declared corpus. */
  readonly runProbe: (
    onWorldCompleted: (worldSeed: string) => void,
  ) => Promise<HardCapReachabilityProbeReport>;
  /** Writes the raw-row artifact. */
  readonly writeArtifact: (path: string, contents: string) => Promise<void>;
}

/**
 * Runs the probe and writes its raw rows.
 *
 * Exits `0` for both `FOUND` and `NOT_FOUND`: the probe is a measurement, and
 * a declared negative result is an answer, not a failure. Only a probe that
 * disagrees with the canonical audit exits non-zero, because in that case its
 * numbers describe a population no gate is reading.
 *
 * @example
 * await runHardCapReachabilityReportCommand([]);
 */
export async function runHardCapReachabilityReportCommand(
  args: readonly string[],
  io: HardCapReachabilityReportCommandIo = defaultIo(),
  dependencies: HardCapReachabilityReportCommandDependencies = defaultDependencies(),
): Promise<number> {
  const parsed = parseArgs(args);
  const text = createTranslator(parsed.language);

  if (!parsed.ok) {
    io.stderr(parsed.message);
    io.stderr(text("hardCapReachability.usage"));
    return 1;
  }

  io.stdout(text("hardCapReachability.corpus", {
    prefixes: HARD_CAP_REACHABILITY_SEED_PREFIXES.length,
    worlds: HARD_CAP_REACHABILITY_WORLDS_PER_PREFIX,
    seasons: HARD_CAP_REACHABILITY_SEASON_COUNT,
    workers: HARD_CAP_REACHABILITY_WORKER_COUNT,
  }));

  let completedWorldCount = 0;
  const report = await dependencies.runProbe((worldSeed) => {
    completedWorldCount += 1;
    io.stdout(text("hardCapReachability.worldCompleted", {
      index: completedWorldCount,
      worldSeed,
    }));
  });

  await dependencies.writeArtifact(
    parsed.reportOutputPath,
    formatHardCapReachabilityReportMarkdown(report, parsed.reportOutputPath),
  );

  for (const line of formatHardCapReachabilityReportOutput(report, parsed.reportOutputPath, text)) {
    io.stdout(line);
  }

  return report.outcome === "RECONCILIATION_FAILED" ? 1 : 0;
}

/**
 * Renders the console summary.
 *
 * A reconciliation failure prints the disagreement instead of the cap numbers.
 * Printing both would invite the reader to use the hit count anyway.
 */
export function formatHardCapReachabilityReportOutput(
  report: HardCapReachabilityProbeReport,
  reportOutputPath: string,
  text: Translator,
): readonly string[] {
  // The outcome word itself is not translated. `FOUND` / `NOT_FOUND` /
  // `RECONCILIATION_FAILED` are the preregistration's declared outcome names,
  // and a reader comparing this run against that document has to see the same
  // token whatever language the labels around it are in.
  if (report.outcome === "RECONCILIATION_FAILED") {
    return [
      text("hardCapReachability.outcome", { outcome: report.outcome }),
      text("hardCapReachability.reconciliationFailed"),
      ...report.worlds
        .filter(({ reconciliation }) => reconciliation.mismatches.length > 0)
        .flatMap(({ worldSeed, reconciliation }) =>
          reconciliation.mismatches.map((mismatch) =>
            text("hardCapReachability.mismatch", { worldSeed, mismatch }),
          ),
        ),
      text("hardCapReachability.rowsPath", { path: reportOutputPath }),
    ];
  }

  return [
    text("hardCapReachability.outcome", { outcome: report.outcome }),
    text("hardCapReachability.observedRows", {
      rows: report.rowCount,
      worldSeasons: report.worldSeasonCount,
    }),
    text("hardCapReachability.eligibleObservations", {
      count: report.totals.eligibleObservationCount,
    }),
    text("hardCapReachability.exactHits", {
      count: report.totals.eligibleExactHardCapCount,
    }),
    text("hardCapReachability.ineligibleExact", {
      count: report.totals.ineligibleExactHardCapCount,
    }),
    text("hardCapReachability.ineligibleRendered", {
      count: report.totals.ineligibleRenderedAsHardCapCount,
    }),
    text("hardCapReachability.rowsPath", { path: reportOutputPath }),
  ];
}

/** Renders the raw-row artifact declared by the preregistration. */
export function formatHardCapReachabilityReportMarkdown(
  report: HardCapReachabilityProbeReport,
  reportOutputPath: string,
): string {
  return [
    "# Phase 81A - Hard-Cap Reachability Probe, Raw Rows",
    "",
    `Generated by \`pnpm --filter @game/cli exec tsx src/index.ts hard-cap-reachability-report\`.`,
    `Preregistration: \`docs/audits/PHASE_81A_HARD_CAP_REACHABILITY_PREREGISTRATION.md\`.`,
    `Artifact path: \`${reportOutputPath}\`.`,
    "",
    "## Outcome",
    "",
    `- Outcome: **${report.outcome}**`,
    `- Rows: ${report.rowCount} observed seasons over ${report.worldSeasonCount} world-seasons`,
    ...formatOutcomeCounts(report),
    `- Worlds reconciling with their canonical audit: `
      + `${report.worlds.filter(({ reconciliation }) => reconciliation.mismatches.length === 0).length}`
      + `/${report.worlds.length}`,
    "",
    ...(report.outcome === "RECONCILIATION_FAILED"
      ? ["## Diagnostic Rows, Not Evidence", ""]
      : ["## Raw Rows", ""]),
    ...(report.outcome === "RECONCILIATION_FAILED"
      ? [
          "These rows did not reproduce the canonical audit's cap facts, so they",
          "describe a population no gate is reading. They are kept to diagnose the",
          "disagreement and must not be cited as reachability evidence, summed into",
          "a total, or used to re-record any snapshot.",
        ]
      : [
          "One row per observed season. Totals above are the sum of these rows and",
          "nothing else; a total without its rows cannot be re-read.",
        ]),
    "",
    "| seedPrefix | worldSeed | snapshot | seasonStartYear | eligible | exactHits | maxEligibleValue | within100bp | within500bp | aboveCap | ineligibleExact | ineligibleRendered | calibrationVersionBundle |",
    "|---|---|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---|",
    ...report.worlds.flatMap(({ rows }) => rows.map(formatRow)),
    "",
    "## Reconciliation",
    "",
    "| worldSeed | agrees | mismatches |",
    "|---|---|---|",
    ...report.worlds.map(({ worldSeed, reconciliation }) =>
      `| \`${worldSeed}\` | ${reconciliation.mismatches.length === 0 ? "yes" : "**no**"} `
        + `| ${reconciliation.mismatches.join("; ") || "-"} |`,
    ),
    "",
    "## Band Definition",
    "",
    "Integer minor units throughout. Bands are nested, both bounds inclusive:",
    "`edge(bps) = cap - floor(cap * bps / 10000)`, counted when",
    "`value >= edge(bps) && value <= cap`. A row with `within100bp > within500bp`",
    "is a bug, not a finding.",
    "",
  ].join("\n");
}

/**
 * Renders the cap counters, or refuses to.
 *
 * The console summary and the artifact have to make the same call. Withholding
 * the numbers in one and printing them in the other leaves the reader a version
 * that says "unreliable" and a version that quotes a hit count, and the second
 * is the one that gets cited.
 */
function formatOutcomeCounts(report: HardCapReachabilityProbeReport): readonly string[] {
  if (report.outcome === "RECONCILIATION_FAILED") {
    return [
      "- Cap counts: **withheld**. The probe's rows do not reproduce the canonical",
      "  audit's cap facts, so its counters measure a population the gates are not",
      "  reading. See *Reconciliation* below for the disagreements.",
    ];
  }

  return [
    `- Eligible observations: ${report.totals.eligibleObservationCount}`,
    `- Eligible exact cap hits: ${report.totals.eligibleExactHardCapCount}`,
    `- Ineligible exact cap: ${report.totals.ineligibleExactHardCapCount}`,
    `- Ineligible rendered as cap: ${report.totals.ineligibleRenderedAsHardCapCount}`,
  ];
}

function formatRow(row: HardCapReachabilityRow): string {
  return [
    "",
    row.seedPrefix,
    `\`${row.worldSeed}\``,
    row.snapshot,
    String(row.seasonStartYear),
    String(row.eligibleObservationCount),
    String(row.eligibleExactHardCapCount),
    String(row.maxEligiblePublicValueMinorUnits),
    String(row.within100BasisPointsCount),
    String(row.within500BasisPointsCount),
    String(row.eligibleAboveHardCapCount),
    String(row.ineligibleExactHardCapCount),
    String(row.ineligibleRenderedAsHardCapCount),
    `\`${row.calibrationVersionBundle}\``,
    "",
  ].join(" | ").trim();
}

type ParsedArgs =
  | { readonly ok: true; readonly reportOutputPath: string; readonly language: SupportedLanguage }
  | { readonly ok: false; readonly message: string; readonly language: SupportedLanguage };

/**
 * Parses the two arguments this command accepts.
 *
 * `--lang` is here and the corpus is not, which is the whole shape of this
 * command: how the run is reported is the caller's business, what it measures
 * is the preregistration's.
 */
function parseArgs(args: readonly string[]): ParsedArgs {
  let reportOutputPath = DEFAULT_HARD_CAP_REACHABILITY_REPORT_PATH;
  let language: SupportedLanguage = "en";

  for (const arg of args) {
    if (arg === "--lang") {
      return {
        ok: false,
        message: createTranslator(language)("cli.error.langRequiresValue", {
          supported: formatSupportedLanguages(),
        }),
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

    if (!arg.startsWith("--report-output=")) {
      return {
        ok: false,
        message: createTranslator(language)("cli.error.unknownArgument", { arg }),
        language,
      };
    }

    const value = arg.slice("--report-output=".length);

    if (value.trim() === "") {
      return {
        ok: false,
        message: createTranslator(language)("tenSeason.error.reportOutputRequired"),
        language,
      };
    }

    reportOutputPath = value;
  }

  return { ok: true, reportOutputPath, language };
}

function defaultIo(): HardCapReachabilityReportCommandIo {
  return {
    stdout: (line) => console.log(line),
    stderr: (line) => console.error(line),
  };
}

function defaultDependencies(): HardCapReachabilityReportCommandDependencies {
  return {
    runProbe: runHardCapReachabilityProbe,
    writeArtifact: writeWorkspaceTextFile,
  };
}
