import { createTranslator } from "@game/i18n";
import {
  buildTacticalAgencyAuditReport,
  isValidTacticalAgencyCheckpointWorkerCount,
  poolTacticalAgencyLowBlockResults,
  runTacticalAgencyLowBlockSeries,
  TACTICAL_AGENCY_CHECKPOINT_WORKER_COUNT,
  type TacticalAgencyAuditReport,
  type TacticalAgencyRoleSummary,
  type TacticalAgencySelectionRow,
} from "@game/simulation-tools";

import { GENERATED_SQUAD_IDENTITY_KEYS } from "@game/content";

import {
  buildTacticalAgencyLowBlockInput,
  PRE_PHASE_81A_SQUAD_SKELETON,
  runTacticalAgencyArchetypeCounterfactual,
  runTacticalAgencyWorld,
  runTacticalAgencyWorldInWorker,
  type TacticalAgencySquadChart,
  type TacticalAgencyWorldResult,
} from "./tactical-agency-report/agency-world.ts";
import {
  counterfactualMovesShape,
  decideCheckpointA2,
  evaluateCheckpointA2Set,
  formatCheckpointA2Report,
  type CheckpointA21Arm,
  type CheckpointA21Attribution,
  type CheckpointA21Report,
  type CheckpointA2Report,
  type CheckpointA2SetEvaluation,
} from "./tactical-agency-report/checkpoint-a2.ts";
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

/**
 * The out-of-sample world seed prefix for Checkpoint A2.
 *
 * Declared here, before the checkpoint is read, and **never used for selection,
 * tuning or inspection**. A gate that passes only on the seeds the before-state
 * was measured on is a gate that measured the seeds.
 */
export const TACTICAL_AGENCY_A2_OUT_OF_SAMPLE_WORLD_SEED = "phase81a-agency-a2-out-of-sample";

/** Clubs per world put through the archetype-mix counterfactual. */
export const TACTICAL_AGENCY_A2_COUNTERFACTUAL_CLUB_COUNT = 6;

/** Where the checkpoint writes its decision document. */
export const DEFAULT_CHECKPOINT_A2_OUTPUT =
  "docs/audits/PHASE_81A_CHECKPOINT_A2_SQUAD_IDENTITY.md";

/** Where the low-block attribution sub-checkpoint writes its result. */
export const DEFAULT_CHECKPOINT_A21_OUTPUT =
  "docs/audits/PHASE_81A_CHECKPOINT_A2_1_LOW_BLOCK_ATTRIBUTION.md";

/**
 * Runs the low-block guardrail on the legacy chart and reuses the current arm.
 *
 * The current arm is the exact low-block result A2 already produced for its
 * primary gates. Only the legacy-chart arm is simulated here, so the command
 * cannot retain or rerun a second copy of the same current population.
 */
export function runCheckpointA21(input: {
  readonly setName: string;
  readonly worldSeed: string;
  readonly worldCount: number;
  readonly seedPrefix: string;
  readonly pairedSeedCount: number;
  readonly currentLowBlock: TacticalAgencyAuditReport["lowBlock"];
}): CheckpointA21Report {
  const worldSeeds = Array.from(
    { length: input.worldCount },
    (_unused, index) => `${input.worldSeed}-${String(index + 1).padStart(3, "0")}`,
  );

  const controlLowBlock = pooledLowBlockForChart(input, worldSeeds, PRE_PHASE_81A_SQUAD_SKELETON);
  const control = checkpointA21Arm(
    "legacy chart on Phase 81A-generated footballers (control)",
    worldSeeds,
    controlLowBlock,
  );
  const current = checkpointA21Arm("Phase 81A squad identities", worldSeeds, input.currentLowBlock);
  const arms = [control, current] as const;

  return {
    setName: input.setName,
    arms,
    attribution: current.guardrailHeld
      ? "not_reproduced"
      : control.guardrailHeld
        ? "step_03a_chart"
        : "legacy_chart_also_fails",
  };
}

/** Pools the one additional chart arm A2.1 needs. */
function pooledLowBlockForChart(
  input: Pick<Parameters<typeof runCheckpointA21>[0], "seedPrefix" | "pairedSeedCount">,
  worldSeeds: readonly string[],
  chart: TacticalAgencySquadChart,
): TacticalAgencyAuditReport["lowBlock"] {
  return poolTacticalAgencyLowBlockResults(
    worldSeeds.map((worldSeed) =>
      runTacticalAgencyLowBlockSeries(
        buildTacticalAgencyLowBlockInput({
          worldSeed,
          seedPrefix: input.seedPrefix,
          pairedSeedCount: input.pairedSeedCount,
          reRoleAllClubsTo: chart,
        }),
      ),
    ),
  );
}

/** Turns one canonical low-block aggregate into its A2.1 row. */
function checkpointA21Arm(
  armName: string,
  worldSeeds: readonly string[],
  lowBlock: TacticalAgencyAuditReport["lowBlock"],
): CheckpointA21Arm {
  const exchangeRate = lowBlock.ownLossPerConcededReduction;

  return {
    armName,
    worldSeeds,
    concededExpectedGoalsReduction: lowBlock.concededExpectedGoalsReduction,
    ownLossPerConcededReduction: exchangeRate,
    guardrailHeld:
      lowBlock.concededExpectedGoalsReduction >= 0.08
      && typeof exchangeRate === "number"
      && exchangeRate <= 2,
  };
}

/** Renders the attribution sub-checkpoint. */
export function formatCheckpointA21Report(reports: readonly CheckpointA21Report[]): string {
  return [
    "# Phase 81A - Checkpoint A2.1: Low-Block Guardrail Attribution",
    "",
    "Checkpoint A2 recorded `ownLossPerConcededReduction` above its `<= 2.0`",
    "guardrail on the out-of-sample seeds. This asks one narrow question:",
    "**did Step 03A's chart assignment cause that failure?**",
    "",
    "Coupled comparison. Same seeds, same clubs, same footballers with the same",
    "abilities, ages and contracts. The arms differ only in which chart the squad",
    "is roled onto. Those abilities were generated from the Phase 81A roles, so",
    "this isolates the chart component and does **not** recreate the full pre-81A",
    "role-conditioned ability population.",
    "",
    "The control chart is the pre-Phase-81A `positionForSlot(...)` recovered from",
    "`f850ccc^`: a `4-2-4` shared by every club.",
    "",
    ...reports.flatMap((report) => [
      `## ${report.setName}`,
      "",
      `- attribution: **${report.attribution}**`,
      "",
      "| arm | concededExpectedGoalsReduction | ownLossPerConcededReduction | guardrail held |",
      "|---|---:|---:|---|",
      ...report.arms.map((armRow) =>
        `| ${armRow.armName} | ${armRow.concededExpectedGoalsReduction.toFixed(4)} `
          + `| ${typeof armRow.ownLossPerConcededReduction === "number"
            ? armRow.ownLossPerConcededReduction.toFixed(4)
            : armRow.ownLossPerConcededReduction} `
          + `| ${armRow.guardrailHeld ? "yes" : "**no**"} |`),
      "",
    ]),
    "## Reading",
    "",
    "- `legacy_chart_also_fails` - applying the legacy chart to the same Phase",
    "  81A-generated abilities does not restore the guardrail. The chart component",
    "  is not the demonstrated cause; the whole generation change is not absolved.",
    "- `step_03a_chart` - the legacy chart held and the current chart did not. Step",
    "  03A reopens.",
    "- `not_reproduced` - the current arm held here, so the A2 reading was not",
    "  reproduced under this instrument and neither conclusion is available.",
    "",
    "A `legacy_chart_also_fails` result permits the primary A2 result to proceed",
    "only through Steps 04-05. Step 05 must restore the live low-block band on",
    "both seed sets before Checkpoint B or any later step opens.",
    "",
  ].join("\n");
}

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
  /** Produces the checkpoint once; command tests inject a small canonical result. */
  readonly createCheckpointReport: (
    input: CreateTacticalAgencyReportInput,
  ) => Promise<CheckpointA2Report>;
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

  // A checkpoint records a decision; the Step 02 before-state only measures.
  // Exiting `0` on `STOP_RETHINK` would make this a gate that cannot fail.
  if (parsed.input.checkpointMode) {
    const a2 = await dependencies.createCheckpointReport(parsed.input);
    await dependencies.writeReport(
      parsed.input.reportOutput ?? DEFAULT_CHECKPOINT_A2_OUTPUT,
      formatCheckpointA2Report(a2),
    );
    dependencies.stdout(`Checkpoint A2 decision: ${a2.decision}`);
    for (const set of a2.sets) {
      for (const gate of set.gates) {
        dependencies.stdout(
          `  [${gate.passed ? "pass" : "FAIL"}] ${set.setName} ${gate.gate}: `
            + `${gate.observed} (target ${gate.target})`,
        );
      }
    }
    for (const set of a2.sets) {
      for (const guardrail of set.guardrails) {
        dependencies.stdout(
          `  [${guardrail.passed ? "held" : "BROKEN"}] ${set.setName} ${guardrail.gate}: `
            + `${guardrail.observed} (target ${guardrail.target})`,
        );
      }
    }
    dependencies.stdout(
      `  counterfactual moves shape: ${String(a2.counterfactualMovesShape)} `
        + `(${a2.counterfactual.clubsWhoseShapeMoved}/${a2.counterfactual.clubCount} clubs)`,
    );

    await dependencies.writeReport(
      DEFAULT_CHECKPOINT_A21_OUTPUT,
      formatCheckpointA21Report(a2.lowBlockAttributionReports),
    );
    for (const report of a2.lowBlockAttributionReports) {
      dependencies.stdout(`  A2.1 ${report.setName}: attribution=${report.attribution}`);
      for (const armRow of report.arms) {
        dependencies.stdout(
          `    ${armRow.armName}: exchange=`
            + `${typeof armRow.ownLossPerConcededReduction === "number"
              ? armRow.ownLossPerConcededReduction.toFixed(4)
              : armRow.ownLossPerConcededReduction}`
            + ` conceded=${armRow.concededExpectedGoalsReduction.toFixed(4)}`
            + ` held=${String(armRow.guardrailHeld)}`,
        );
      }
    }

    return a2.decision === "GO" ? 0 : 1;
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
  return (await createTacticalAgencyReportWithRows(input)).report;
}

/**
 * The same run, with the selection rows kept.
 *
 * Checkpoint A2 groups selections by the squad identity that generated them,
 * and `TacticalAgencyAuditReport` deliberately carries only aggregates. Handing
 * the rows back beside the report is how A2 reads the same selections the
 * before-state summarised, instead of running the population twice.
 */
export async function createTacticalAgencyReportWithRows(
  input: CreateTacticalAgencyReportInput,
): Promise<{
  readonly report: TacticalAgencyAuditReport;
  readonly rows: readonly TacticalAgencySelectionRow[];
}> {
  const worldSeeds = Array.from(
    { length: input.worldCount },
    (_unused, index) => `${input.worldSeed}-${String(index + 1).padStart(3, "0")}`,
  );

  const startedAt = performance.now();
  const results = await runWorldsAcrossWorkers(worldSeeds, input);
  const elapsedMilliseconds = performance.now() - startedAt;

  const rows: TacticalAgencySelectionRow[] = [];
  for (const result of results) rows.push(...result.rows);

  const report = buildTacticalAgencyAuditReport({
    manifest: {
      worldSeeds,
      lowBlockSeedPrefix: input.seedPrefix,
      matchTacticsCalibrationVersion: requiredCalibrationVersion(results),
      workerCount: input.workerCount,
      checkpointMode: input.checkpointMode,
    },
    selectionSeries: { rows, elapsedMilliseconds },
    roles: mergeRoleSummaries(results),
    // Every world, not just the first. Read on one world this is a two-club,
    // one-seed sample whose exchange rate swung 1.59 to 3.70 between two seed
    // sets - a spread one world cannot distinguish from the population moving.
    // The band is untouched; only the denominator under it grew.
    lowBlock: poolTacticalAgencyLowBlockResults(
      worldSeeds.map((worldSeed) =>
        runTacticalAgencyLowBlockSeries(
          buildTacticalAgencyLowBlockInput({
            worldSeed,
            seedPrefix: input.seedPrefix,
            pairedSeedCount: input.pairedSeedCount,
          }),
        ),
      ),
    ),
  });

  return { report, rows };
}

/**
 * Runs Checkpoint A2: both seed sets, then the archetype-mix counterfactual.
 *
 * The out-of-sample set uses the same world count, round count and worker count
 * as the in-sample one. A second set measured at a different resolution would
 * not be an out-of-sample check, it would be a different experiment.
 */
export async function createCheckpointA2Report(
  input: CreateTacticalAgencyReportInput,
): Promise<CheckpointA2Report> {
  const sets: CheckpointA2SetEvaluation[] = [];
  const lowBlockAttributionReports: CheckpointA21Report[] = [];

  for (const [setName, worldSeed] of [
    ["in-sample (Checkpoint A before-state seeds)", input.worldSeed],
    ["out-of-sample (never used for selection or tuning)", TACTICAL_AGENCY_A2_OUT_OF_SAMPLE_WORLD_SEED],
  ] as const) {
    const produced = await createTacticalAgencyReportWithRows({ ...input, worldSeed });
    sets.push(evaluateCheckpointA2Set({ setName, report: produced.report, rows: produced.rows }));
    lowBlockAttributionReports.push(
      runCheckpointA21({
        setName,
        worldSeed,
        worldCount: input.worldCount,
        seedPrefix: input.seedPrefix,
        pairedSeedCount: input.pairedSeedCount,
        currentLowBlock: produced.report.lowBlock,
      }),
    );
  }

  const counterfactual = runTacticalAgencyArchetypeCounterfactual({
    worldSeed: `${input.worldSeed}-001`,
    clubCount: TACTICAL_AGENCY_A2_COUNTERFACTUAL_CLUB_COUNT,
    identityKeys: [...GENERATED_SQUAD_IDENTITY_KEYS],
  });
  const movesShape = counterfactualMovesShape(counterfactual);

  const lowBlockAttribution = aggregateCheckpointA21Attribution(lowBlockAttributionReports);

  return {
    sets,
    counterfactual,
    counterfactualMovesShape: movesShape,
    lowBlockAttributionReports,
    lowBlockAttribution,
    decision: decideCheckpointA2({
      sets,
      counterfactualMovesShape: movesShape,
      lowBlockAttribution,
    }),
    workerCount: input.workerCount,
  };
}

/** Collapses per-set chart evidence without letting a passing set hide a failure. */
function aggregateCheckpointA21Attribution(
  reports: readonly CheckpointA21Report[],
): CheckpointA21Attribution {
  const reproducedFailures = reports.filter((report) => {
    const current = report.arms[1];
    return current !== undefined && !current.guardrailHeld;
  });
  if (reproducedFailures.length === 0) return "not_reproduced";
  if (reproducedFailures.some((report) => report.attribution === "step_03a_chart")) {
    return "step_03a_chart";
  }

  return "legacy_chart_also_fails";
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
    createCheckpointReport: createCheckpointA2Report,
  };
}
