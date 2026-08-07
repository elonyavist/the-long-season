import { createTranslator } from "@game/i18n";
import {
  buildTacticalAgencyAuditReport,
  isValidTacticalAgencyCheckpointWorkerCount,
  runTacticalAgencyLowBlockSeries,
  TACTICAL_AGENCY_CHECKPOINT_WORKER_COUNT,
  type TacticalAgencyAuditReport,
  type TacticalAgencyRoleSummary,
  type TacticalAgencySelectionRow,
} from "@game/simulation-tools";

import {
  buildTacticalAgencyLowBlockInput,
  runTacticalAgencyWorld,
  runTacticalAgencyWorldInWorker,
  type TacticalAgencyWorldResult,
} from "./tactical-agency-report/agency-world.ts";
import { writeWorkspaceTextFile } from "./workspace-output-path.ts";

/**
 * Phase 81A Step 02 before-state command.
 *
 * A reporting path only: it generates worlds, runs the production career
 * selector over them, and writes down what happened. It changes no gameplay and
 * simulates nothing the engine would not have simulated anyway.
 *
 * @example
 * await runTacticalAgencyReportCommand(["--checkpoint", "--workers=7"]);
 */

/** Default world seed prefix. Every world seed is this plus an index. */
export const DEFAULT_TACTICAL_AGENCY_WORLD_SEED = "phase81a-agency-before-state";

/** Default seed prefix for the low-block replay, disjoint from the world seeds. */
export const DEFAULT_TACTICAL_AGENCY_SEED_PREFIX = "phase81a-agency-replay";

/** Default worlds measured. */
export const DEFAULT_TACTICAL_AGENCY_WORLD_COUNT = 7;

/** Default rounds of the observed competition selected for, per world. */
export const DEFAULT_TACTICAL_AGENCY_ROUND_COUNT = 4;

/** Default paired seeds per low-block arm. */
export const DEFAULT_TACTICAL_AGENCY_PAIRED_SEEDS = 40;

/** Everything the command reaches outside itself. */
export interface TacticalAgencyReportCommandDependencies {
  /** Writes normal command output. */
  readonly stdout: (line: string) => void;
  /** Writes command errors. */
  readonly stderr: (line: string) => void;
  /** Writes the rendered report to a path, creating parent directories. */
  readonly writeReport: (path: string, contents: string) => Promise<void>;
  /**
   * Produces the before-state for the parsed arguments.
   *
   * Part of the seam because generating worlds and running the real selector
   * costs minutes; command tests supply a small bundle instead and exercise
   * argument parsing, the worker rule, rendering and exit codes on their own.
   */
  readonly createReport: (input: CreateTacticalAgencyReportInput) => Promise<TacticalAgencyAuditReport>;
}

/** Parsed run configuration handed to the report producer. */
export interface CreateTacticalAgencyReportInput {
  readonly worldSeed: string;
  readonly worldCount: number;
  readonly roundCount: number;
  readonly seedPrefix: string;
  readonly pairedSeedCount: number;
  readonly workerCount: number;
  readonly checkpointMode: boolean;
}

/**
 * Runs the real-career before-state and renders it as Markdown.
 *
 * Exit `1` on a usage error or an illegal checkpoint worker count. A produced
 * report always exits `0`: this step measures, it does not gate.
 */
export async function runTacticalAgencyReportCommand(
  args: readonly string[],
  dependencies: TacticalAgencyReportCommandDependencies = defaultDependencies(),
): Promise<number> {
  const text = createTranslator("en");
  const parsed = parseArgs(args, text);

  if (!parsed.ok) {
    dependencies.stderr(parsed.message);
    dependencies.stderr(text("tacticalAgency.usage"));
    return 1;
  }

  const report = await dependencies.createReport(parsed.input);
  const rendered = formatTacticalAgencyReport(report, text);

  if (parsed.input.reportOutput === undefined) {
    dependencies.stdout(rendered);
  } else {
    await dependencies.writeReport(parsed.input.reportOutput, rendered);
    dependencies.stdout(text("tacticalAgency.reportWritten", { path: parsed.input.reportOutput }));
  }

  return 0;
}

/**
 * Produces the before-state by fanning worlds across workers.
 *
 * Worlds are the shard key and each worker generates its own, so the aggregate
 * is identical whatever the worker count is. A single-worker run stays on this
 * thread rather than paying for a thread that would then be the only one.
 */
export async function createTacticalAgencyReport(
  input: CreateTacticalAgencyReportInput,
): Promise<TacticalAgencyAuditReport> {
  const worldSeeds = Array.from(
    { length: input.worldCount },
    (_unused, index) => `${input.worldSeed}-${String(index + 1).padStart(3, "0")}`,
  );

  const startedAt = performance.now();
  const results = await runWorldsAcrossWorkers(worldSeeds, input);
  const elapsedMilliseconds = performance.now() - startedAt;

  const rows: TacticalAgencySelectionRow[] = [];
  for (const result of results) rows.push(...result.rows);

  return buildTacticalAgencyAuditReport({
    manifest: {
      worldSeeds,
      lowBlockSeedPrefix: input.seedPrefix,
      matchTacticsCalibrationVersion: requiredCalibrationVersion(results),
      workerCount: input.workerCount,
      checkpointMode: input.checkpointMode,
    },
    selectionSeries: { rows, elapsedMilliseconds },
    roles: mergeRoleSummaries(results),
    lowBlock: runTacticalAgencyLowBlockSeries(
      buildTacticalAgencyLowBlockInput({
        worldSeed: worldSeeds[0] as string,
        seedPrefix: input.seedPrefix,
        pairedSeedCount: input.pairedSeedCount,
      }),
    ),
  });
}

/** Runs every world, at most `workerCount` at a time, in stable seed order. */
async function runWorldsAcrossWorkers(
  worldSeeds: readonly string[],
  input: CreateTacticalAgencyReportInput,
): Promise<readonly TacticalAgencyWorldResult[]> {
  if (input.workerCount === 1) {
    return worldSeeds.map((worldSeed) =>
      runTacticalAgencyWorld({ worldSeed, roundCount: input.roundCount }));
  }

  const results: TacticalAgencyWorldResult[] = [];
  for (let start = 0; start < worldSeeds.length; start += input.workerCount) {
    const batch = worldSeeds.slice(start, start + input.workerCount);
    results.push(
      ...(await Promise.all(
        batch.map((worldSeed) =>
          runTacticalAgencyWorldInWorker({ worldSeed, roundCount: input.roundCount })),
      )),
    );
  }

  return results;
}

/**
 * The one calibration version every world was measured under.
 *
 * Refused rather than picked when the worlds disagree: a before-state whose
 * rows came from two different stamped assets describes no single game, and
 * this is the first phase where a tactic magnitude can move without an engine
 * change.
 */
function requiredCalibrationVersion(results: readonly TacticalAgencyWorldResult[]): string {
  const versions = new Set(results.map((result) => result.matchTacticsCalibrationVersion));
  if (versions.size !== 1) {
    throw new Error(`Worlds disagree about the match-tactics calibration: ${[...versions].join(", ")}`);
  }

  return [...versions][0] as string;
}

/** Adds the per-world role tables into one, keeping every role row. */
function mergeRoleSummaries(
  results: readonly TacticalAgencyWorldResult[],
): TacticalAgencyRoleSummary {
  const first = results[0];
  if (first === undefined) throw new Error("A before-state needs at least one world");
  if (results.length === 1) return first.roles;

  const counts = new Map(first.roles.roleShares.map((row) => [row.role, 0]));
  let playerCount = 0;
  let undeclaredRoleCount = 0;
  for (const result of results) {
    playerCount += result.roles.playerCount;
    undeclaredRoleCount += result.roles.undeclaredRoleCount;
    for (const row of result.roles.roleShares) {
      counts.set(row.role, (counts.get(row.role) ?? 0) + row.count);
    }
  }

  const declared = playerCount - undeclaredRoleCount;
  const roleShares = first.roles.roleShares.map((row) => {
    const count = counts.get(row.role) ?? 0;
    return { role: row.role, count, share: declared === 0 ? 0 : count / declared };
  });

  return {
    playerCount,
    roleShares,
    absentRoles: roleShares.filter((row) => row.count === 0).map((row) => row.role),
    undeclaredRoleCount,
  };
}

/** Renders one before-state as the frozen Markdown document. */
export function formatTacticalAgencyReport(
  report: TacticalAgencyAuditReport,
  text: ReturnType<typeof createTranslator>,
): string {
  const lines: string[] = [
    `# ${text("tacticalAgency.reportTitle")}`,
    "",
    `- \`contractVersion\`: ${report.contractVersion}`,
    `- \`worlds\`: ${report.manifest.worldSeeds.length}`,
    `- \`matchTacticsCalibrationVersion\`: ${report.manifest.matchTacticsCalibrationVersion}`,
    `- \`workers\`: ${report.manifest.workerCount}`,
    `- \`checkpointMode\`: ${String(report.manifest.checkpointMode)}`,
    `- \`selections\`: ${report.selections.selectionCount}`,
    `- \`selectionsPerSecond\`: ${report.selectionsPerSecond.toFixed(2)}`,
    "",
    `## ${text("tacticalAgency.sectionShapeChoice")}`,
    "",
    `- \`distinctFormationCount\`: ${report.selections.distinctFormationCount}`,
    `- \`topFormationShare\`: ${report.selections.topFormationShare.toFixed(4)}`,
    `- \`tieDecidedShare\`: ${report.selections.tieDecidedShare.toFixed(4)}`,
    `- \`noChoiceShare\`: ${report.selections.noChoiceShare.toFixed(4)}`,
    `- \`meanBestMinusSecond\`: ${report.selections.meanBestMinusSecond.toFixed(4)}`,
    `- \`meanOutOfPositionSlots\`: ${report.selections.meanOutOfPositionSlots.toFixed(4)}`,
    "",
    "| formation | count | share |",
    "|---|---:|---:|",
    ...report.selections.formationShares.map((row) =>
      `| \`${row.formationKey}\` | ${row.count} | ${row.share.toFixed(4)} |`),
    "",
    `## ${text("tacticalAgency.sectionRoles")}`,
    "",
    `- \`playerCount\`: ${report.roles.playerCount}`,
    `- \`undeclaredRoleCount\`: ${report.roles.undeclaredRoleCount}`,
    "",
    "| role | count | share |",
    "|---|---:|---:|",
    ...report.roles.roleShares.map((row) =>
      `| \`${row.role}\` | ${row.count} | ${row.share.toFixed(4)} |`),
    "",
    `## ${text("tacticalAgency.sectionLowBlock")}`,
    "",
    `- \`matchesPerArm\`: ${report.lowBlock.matchesPerArm}`,
    `- \`neutral.created\`: ${report.lowBlock.neutral.created.toFixed(4)}`,
    `- \`neutral.conceded\`: ${report.lowBlock.neutral.conceded.toFixed(4)}`,
    `- \`lowBlock.created\`: ${report.lowBlock.lowBlock.created.toFixed(4)}`,
    `- \`lowBlock.conceded\`: ${report.lowBlock.lowBlock.conceded.toFixed(4)}`,
    `- \`concededExpectedGoalsReduction\`: ${report.lowBlock.concededExpectedGoalsReduction.toFixed(4)}`,
    `- \`ownLossPerConcededReduction\`: ${
      typeof report.lowBlock.ownLossPerConcededReduction === "number"
        ? report.lowBlock.ownLossPerConcededReduction.toFixed(4)
        : report.lowBlock.ownLossPerConcededReduction
    }`,
    `- \`neutral.opportunities\`: ${report.lowBlock.neutral.opportunities.toFixed(2)}`,
    `- \`lowBlock.opportunities\`: ${report.lowBlock.lowBlock.opportunities.toFixed(2)}`,
  ];

  return `${lines.join("\n")}\n`;
}

/** Parsed arguments, or the first reason they could not be used. */
type ParsedArgs =
  | { readonly ok: true; readonly input: CreateTacticalAgencyReportInput & { readonly reportOutput?: string } }
  | { readonly ok: false; readonly message: string };

function parseArgs(args: readonly string[], text: ReturnType<typeof createTranslator>): ParsedArgs {
  let worldSeed = DEFAULT_TACTICAL_AGENCY_WORLD_SEED;
  let seedPrefix = DEFAULT_TACTICAL_AGENCY_SEED_PREFIX;
  let worldCount = DEFAULT_TACTICAL_AGENCY_WORLD_COUNT;
  let roundCount = DEFAULT_TACTICAL_AGENCY_ROUND_COUNT;
  let pairedSeedCount = DEFAULT_TACTICAL_AGENCY_PAIRED_SEEDS;
  let workerCount = TACTICAL_AGENCY_CHECKPOINT_WORKER_COUNT;
  let checkpointMode = false;
  let reportOutput: string | undefined;

  for (const arg of args) {
    if (arg === "--checkpoint") {
      checkpointMode = true;
      continue;
    }

    const [flag, rawValue] = splitFlag(arg);
    const value = rawValue ?? "";

    if (flag === "--world-seed") {
      if (value.length === 0) return { ok: false, message: text("tacticalAgency.error.worldSeedRequired") };
      worldSeed = value;
      continue;
    }
    if (flag === "--seed-prefix") {
      if (value.length === 0) return { ok: false, message: text("tacticalAgency.error.worldSeedRequired") };
      seedPrefix = value;
      continue;
    }
    if (flag === "--report-output") {
      if (value.length === 0) return { ok: false, message: text("tacticalAgency.error.reportOutputRequired") };
      reportOutput = value;
      continue;
    }

    const counted = COUNT_FLAGS[flag];
    if (counted !== undefined) {
      const parsedCount = Number(value);
      if (!Number.isSafeInteger(parsedCount) || parsedCount <= 0) {
        return { ok: false, message: text("tacticalAgency.error.countInvalid", { flag, value }) };
      }
      if (counted === "worlds") worldCount = parsedCount;
      if (counted === "rounds") roundCount = parsedCount;
      if (counted === "pairedSeeds") pairedSeedCount = parsedCount;
      if (counted === "workers") workerCount = parsedCount;
      continue;
    }

    return { ok: false, message: text("tacticalAgency.error.unknownFlag", { flag: arg }) };
  }

  // A checkpoint pins its worker count rather than capping it. The numbers do
  // not move with the count, but the wall clock does, and the wall clock is what
  // the next checkpoint is budgeted from.
  if (checkpointMode && !isValidTacticalAgencyCheckpointWorkerCount(workerCount)) {
    return {
      ok: false,
      message: text("tacticalAgency.error.checkpointWorkers", { value: String(workerCount) }),
    };
  }

  return {
    ok: true,
    input: {
      worldSeed,
      worldCount,
      roundCount,
      seedPrefix,
      pairedSeedCount,
      workerCount,
      checkpointMode,
      ...(reportOutput === undefined ? {} : { reportOutput }),
    },
  };
}

/** Flags that take a positive whole number, and the field each one sets. */
const COUNT_FLAGS: Readonly<Record<string, "worlds" | "rounds" | "pairedSeeds" | "workers" | undefined>> = {
  "--worlds": "worlds",
  "--rounds": "rounds",
  "--paired-seeds": "pairedSeeds",
  "--workers": "workers",
};

function splitFlag(arg: string): readonly [string, string | undefined] {
  const separatorIndex = arg.indexOf("=");

  return separatorIndex === -1
    ? [arg, undefined]
    : [arg.slice(0, separatorIndex), arg.slice(separatorIndex + 1)];
}

function defaultDependencies(): TacticalAgencyReportCommandDependencies {
  return {
    stdout: (line) => process.stdout.write(`${line}\n`),
    stderr: (line) => process.stderr.write(`${line}\n`),
    writeReport: writeWorkspaceTextFile,
    createReport: createTacticalAgencyReport,
  };
}
