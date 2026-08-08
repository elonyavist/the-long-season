import {
  buildTacticalAgencyAuditReport,
  poolTacticalAgencyLowBlockResults,
  runTacticalAgencyLowBlockSeries,
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
} from "./tactical-agency-world.ts";
import {
  counterfactualMovesShape,
  decideCheckpointA2,
  evaluateCheckpointA2Set,
  type CheckpointA21Arm,
  type CheckpointA21Attribution,
  type CheckpointA21Facts,
  type CheckpointA2Facts,
  type CheckpointA2SetEvaluation,
} from "./tactical-agency-checkpoint-a2.ts";

/**
 * Phase 81A Step 02 before-state command.
 *
 * A reporting path only: it generates worlds, runs the production career
 * selector over them, and writes down what happened. It changes no gameplay and
 * simulates nothing the engine would not have simulated anyway.
 *
 * @example
 * await createTacticalAgencyA2ProfileFacts(input);
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

/**
 * Runs the low-block guardrail on the legacy chart and reuses the current arm.
 *
 * The current arm is the exact low-block result A2 already produced for its
 * primary gates. Only the legacy-chart arm is simulated here, so the command
 * cannot retain or rerun a second copy of the same current population.
 */
function runCheckpointA21(input: {
  readonly setName: string;
  readonly worldSeed: string;
  readonly worldCount: number;
  readonly seedPrefix: string;
  readonly pairedSeedCount: number;
  readonly currentLowBlock: TacticalAgencyAuditReport["lowBlock"];
}): CheckpointA21Facts {
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

/** Measurement configuration handed to the tactical-agency fact producer. */
export interface CreateTacticalAgencySectionInput {
  readonly worldSeed: string;
  readonly worldCount: number;
  readonly roundCount: number;
  readonly seedPrefix: string;
  readonly pairedSeedCount: number;
  readonly workerCount: number;
  readonly checkpointMode: boolean;
}

/** Profile evidence plus the calibration stamp read from the measured worlds. */
export interface TacticalAgencyA2ProfileFacts {
  readonly checkpoint: CheckpointA2Facts;
  readonly calibrationVersions: Readonly<Record<string, string>>;
}

/**
 * Produces the before-state by fanning worlds across workers.
 *
 * Worlds are the shard key and each worker generates its own, so the aggregate
 * is identical whatever the worker count is. A single-worker run stays on this
 * thread rather than paying for a thread that would then be the only one.
 */
/**
 * The same run, with the selection rows kept.
 *
 * Checkpoint A2 groups selections by the squad identity that generated them,
 * and `TacticalAgencyAuditReport` deliberately carries only aggregates. Handing
 * the rows back beside the report is how A2 reads the same selections the
 * before-state summarised, instead of running the population twice.
 */
export async function createTacticalAgencySectionFacts(
  input: CreateTacticalAgencySectionInput,
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
export async function createTacticalAgencyA2ProfileFacts(
  input: CreateTacticalAgencySectionInput,
): Promise<TacticalAgencyA2ProfileFacts> {
  const sets: CheckpointA2SetEvaluation[] = [];
  const lowBlockAttributionFacts: CheckpointA21Facts[] = [];
  const calibrationVersions = new Set<string>();

  for (const [setName, worldSeed] of [
    ["in-sample (Checkpoint A before-state seeds)", input.worldSeed],
    ["out-of-sample (never used for selection or tuning)", TACTICAL_AGENCY_A2_OUT_OF_SAMPLE_WORLD_SEED],
  ] as const) {
    const produced = await createTacticalAgencySectionFacts({ ...input, worldSeed });
    calibrationVersions.add(produced.report.manifest.matchTacticsCalibrationVersion);
    sets.push(evaluateCheckpointA2Set({ setName, report: produced.report, rows: produced.rows }));
    lowBlockAttributionFacts.push(
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

  const lowBlockAttribution = aggregateCheckpointA21Attribution(lowBlockAttributionFacts);

  if (calibrationVersions.size !== 1) {
    throw new Error(
      `A2 seed sets disagree about match-tactics calibration: ${[...calibrationVersions].join(", ")}`,
    );
  }
  const checkpoint: CheckpointA2Facts = {
    sets,
    counterfactual,
    counterfactualMovesShape: movesShape,
    lowBlockAttributionFacts,
    lowBlockAttribution,
    decision: decideCheckpointA2({
      sets,
      counterfactualMovesShape: movesShape,
      lowBlockAttribution,
    }),
    workerCount: input.workerCount,
  };
  return {
    checkpoint,
    calibrationVersions: { matchTactics: [...calibrationVersions][0] as string },
  };
}

/** Collapses per-set chart evidence without letting a passing set hide a failure. */
function aggregateCheckpointA21Attribution(
  reports: readonly CheckpointA21Facts[],
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
  input: CreateTacticalAgencySectionInput,
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
