import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { availableParallelism } from "node:os";
import { join } from "node:path";
import type { SupportedLanguage } from "@game/i18n";

import {
  createLongRunGatePartitions,
  createLongRunGateReportFromWorlds,
  hashGateWorldSummaries,
  resolveLongRunGateWorkerCount,
  runLongRunGateWorkerThread,
  type LongRunGateReport,
  type LongRunGateWorkerPartition,
  type LongRunGateWorldSummary,
} from "./report-data.ts";

/** Current on-disk contract for resumable long-run gate shards. */
const LONG_RUN_CHECKPOINT_SCHEMA_VERSION = 1;

/** Input for the deterministic resumable long-run gate adapter. */
export interface CreateResumableLongRunGateReportInput {
  /** Seed prefix used by the canonical world runner. */
  readonly seedPrefix: string;
  /** Total number of worlds in the gate. */
  readonly worldCount: number;
  /** Seasons simulated in every world. */
  readonly seasonCount: number;
  /** Language recreated inside worker threads. */
  readonly language: SupportedLanguage;
  /** Directory containing one atomic file per stable shard. */
  readonly checkpointDirectoryPath: string;
  /** Requested shard count; it is capped at the world count. */
  readonly shardCount: number;
  /** Optional worker override for tests and local release tuning. */
  readonly workerCount?: number;
}

/** Serializable checkpoint persisted after one complete shard. */
interface LongRunGateShardCheckpoint {
  readonly schemaVersion: typeof LONG_RUN_CHECKPOINT_SCHEMA_VERSION;
  readonly seedPrefix: string;
  readonly worldCount: number;
  readonly seasonCount: number;
  readonly language: SupportedLanguage;
  readonly shardIndex: number;
  readonly shardCount: number;
  readonly startIndex: number;
  readonly endIndex: number;
  readonly summaryHash: string;
  readonly worlds: readonly LongRunGateWorldSummary[];
}

/** One shard together with its stable one-based index. */
interface IndexedGatePartition extends LongRunGateWorkerPartition {
  readonly shardIndex: number;
}

/** One canonical world task linked to the checkpoint shard that owns it. */
interface GateWorldTask {
  readonly partition: IndexedGatePartition;
  readonly worldIndex: number;
}

/**
 * Runs or resumes a large gate without changing the canonical simulation path.
 *
 * Only compact world summaries are checkpointed. A shard is published with an
 * atomic rename after every world in that shard has completed, so a crash can
 * never make a partial shard look valid.
 */
export async function createResumableLongRunGateReport(
  input: CreateResumableLongRunGateReportInput,
): Promise<LongRunGateReport> {
  const shardCount = Math.max(1, Math.min(input.shardCount, input.worldCount));
  const partitions = createLongRunGatePartitions(input.worldCount, shardCount).map(
    (partition, index): IndexedGatePartition => ({ ...partition, shardIndex: index + 1 }),
  );
  const checkpoints = new Map<number, LongRunGateShardCheckpoint>();
  const missing: IndexedGatePartition[] = [];

  await mkdir(input.checkpointDirectoryPath, { recursive: true });

  for (const partition of partitions) {
    const checkpoint = await readShardCheckpoint(input, partition, shardCount);
    if (checkpoint === undefined) {
      missing.push(partition);
    } else {
      checkpoints.set(partition.shardIndex, checkpoint);
    }
  }

  const tasks = missing.flatMap((partition) => createWorldTasks(partition));
  const pendingWorldCount = Math.max(1, tasks.length || input.worldCount);
  const workerCount = resolveLongRunGateWorkerCount({
    worldCount: pendingWorldCount,
    workerCount: input.workerCount ?? Math.max(1, availableParallelism() - 1),
  });
  await runMissingWorlds({
    input,
    shardCount,
    workerCount,
    tasks,
    checkpoints,
  });

  const orderedCheckpoints = partitions.map((partition) => {
    const checkpoint = checkpoints.get(partition.shardIndex);
    if (checkpoint === undefined) {
      throw new Error(`Long-run gate shard ${partition.shardIndex} did not produce a checkpoint`);
    }
    return checkpoint;
  });
  const worlds = orderedCheckpoints.flatMap((checkpoint) => checkpoint.worlds);

  return createLongRunGateReportFromWorlds({
    seedPrefix: input.seedPrefix,
    worldCount: input.worldCount,
    seasonCount: input.seasonCount,
    execution: {
      mode: "sharded",
      workerCount,
      partitionHashes: orderedCheckpoints.map((checkpoint) => checkpoint.summaryHash),
      shardCount,
      resumedShardCount: shardCount - missing.length,
    },
    worlds,
  });
}

/** Splits a checkpoint shard into world-sized work units without changing its persisted contract. */
function createWorldTasks(partition: IndexedGatePartition): readonly GateWorldTask[] {
  const tasks: GateWorldTask[] = [];

  for (let worldIndex = partition.startIndex; worldIndex <= partition.endIndex; worldIndex += 1) {
    tasks.push({ partition, worldIndex });
  }

  return tasks;
}

/**
 * Keeps a bounded worker queue busy and publishes a shard only after all of its
 * canonical world summaries are present in stable index order.
 */
async function runMissingWorlds(context: {
  readonly input: CreateResumableLongRunGateReportInput;
  readonly shardCount: number;
  readonly workerCount: number;
  readonly tasks: readonly GateWorldTask[];
  readonly checkpoints: Map<number, LongRunGateShardCheckpoint>;
}): Promise<void> {
  const summariesByShard = new Map<number, Map<number, LongRunGateWorldSummary>>();
  const remainingByShard = new Map<number, number>();
  let nextTaskIndex = 0;

  for (const task of context.tasks) {
    if (!summariesByShard.has(task.partition.shardIndex)) {
      summariesByShard.set(task.partition.shardIndex, new Map());
      remainingByShard.set(
        task.partition.shardIndex,
        task.partition.endIndex - task.partition.startIndex + 1,
      );
    }
  }

  async function runQueue(): Promise<void> {
    while (nextTaskIndex < context.tasks.length) {
      const task = context.tasks[nextTaskIndex];
      nextTaskIndex += 1;
      if (task === undefined) return;

      const result = await runLongRunGateWorkerThread({
        seedPrefix: context.input.seedPrefix,
        seasonCount: context.input.seasonCount,
        language: context.input.language,
        startIndex: task.worldIndex,
        endIndex: task.worldIndex,
      });
      const summary = result.worlds[0];
      if (summary === undefined || result.worlds.length !== 1) {
        throw new Error(`Long-run gate world task ${task.worldIndex} returned an invalid summary count`);
      }

      const summaries = summariesByShard.get(task.partition.shardIndex);
      const remaining = remainingByShard.get(task.partition.shardIndex);
      if (summaries === undefined || remaining === undefined) {
        throw new Error(`Long-run gate shard ${task.partition.shardIndex} lost its task accumulator`);
      }

      summaries.set(task.worldIndex, summary);
      const nextRemaining = remaining - 1;
      remainingByShard.set(task.partition.shardIndex, nextRemaining);

      if (nextRemaining === 0) {
        const worlds = orderedShardWorlds(task.partition, summaries);
        const checkpoint = createShardCheckpoint(context.input, task.partition, context.shardCount, worlds);
        await writeShardCheckpoint(context.input.checkpointDirectoryPath, checkpoint);
        context.checkpoints.set(checkpoint.shardIndex, checkpoint);
      }
    }
  }

  await Promise.all(
    Array.from(
      { length: Math.min(context.workerCount, context.tasks.length) },
      () => runQueue(),
    ),
  );
}

/** Restores one shard's summaries to canonical world-index order. */
function orderedShardWorlds(
  partition: IndexedGatePartition,
  summaries: ReadonlyMap<number, LongRunGateWorldSummary>,
): readonly LongRunGateWorldSummary[] {
  const worlds: LongRunGateWorldSummary[] = [];

  for (let index = partition.startIndex; index <= partition.endIndex; index += 1) {
    const summary = summaries.get(index);
    if (summary === undefined) {
      throw new Error(`Long-run gate shard ${partition.shardIndex} is missing world ${index}`);
    }
    worlds.push(summary);
  }

  return worlds;
}

/** Creates one complete checkpoint from canonical worker output. */
function createShardCheckpoint(
  input: CreateResumableLongRunGateReportInput,
  partition: IndexedGatePartition,
  shardCount: number,
  worlds: readonly LongRunGateWorldSummary[],
): LongRunGateShardCheckpoint {
  return {
    schemaVersion: LONG_RUN_CHECKPOINT_SCHEMA_VERSION,
    seedPrefix: input.seedPrefix,
    worldCount: input.worldCount,
    seasonCount: input.seasonCount,
    language: input.language,
    shardIndex: partition.shardIndex,
    shardCount,
    startIndex: partition.startIndex,
    endIndex: partition.endIndex,
    summaryHash: hashGateWorldSummaries(worlds),
    worlds,
  };
}

/** Reads and verifies a checkpoint, returning `undefined` only when absent. */
async function readShardCheckpoint(
  input: CreateResumableLongRunGateReportInput,
  partition: IndexedGatePartition,
  shardCount: number,
): Promise<LongRunGateShardCheckpoint | undefined> {
  const path = shardCheckpointPath(input.checkpointDirectoryPath, partition.shardIndex, shardCount);
  let serialized: string;

  try {
    serialized = await readFile(path, "utf8");
  } catch (error) {
    if (isMissingFileError(error)) return undefined;
    throw error;
  }

  let value: unknown;
  try {
    value = JSON.parse(serialized);
  } catch {
    throw new Error(`Long-run gate checkpoint is not valid JSON: ${path}`);
  }

  if (!isMatchingShardCheckpoint(value, input, partition, shardCount)) {
    throw new Error(`Long-run gate checkpoint metadata or world range is invalid: ${path}`);
  }
  if (hashGateWorldSummaries(value.worlds) !== value.summaryHash) {
    throw new Error(`Long-run gate checkpoint hash mismatch: ${path}`);
  }

  return value;
}

/** Publishes one checkpoint atomically after its worker has completed. */
async function writeShardCheckpoint(
  directoryPath: string,
  checkpoint: LongRunGateShardCheckpoint,
): Promise<void> {
  const path = shardCheckpointPath(directoryPath, checkpoint.shardIndex, checkpoint.shardCount);
  const temporaryPath = `${path}.${process.pid}.tmp`;

  try {
    await writeFile(temporaryPath, JSON.stringify(checkpoint), "utf8");
    await rename(temporaryPath, path);
  } catch (error) {
    await rm(temporaryPath, { force: true });
    throw error;
  }
}

/** Validates stable metadata, summary shape, ordering, and expected seed range. */
function isMatchingShardCheckpoint(
  value: unknown,
  input: CreateResumableLongRunGateReportInput,
  partition: IndexedGatePartition,
  shardCount: number,
): value is LongRunGateShardCheckpoint {
  if (!isRecord(value) || !Array.isArray(value.worlds)) return false;
  if (
    value.schemaVersion !== LONG_RUN_CHECKPOINT_SCHEMA_VERSION
    || value.seedPrefix !== input.seedPrefix
    || value.worldCount !== input.worldCount
    || value.seasonCount !== input.seasonCount
    || value.language !== input.language
    || value.shardIndex !== partition.shardIndex
    || value.shardCount !== shardCount
    || value.startIndex !== partition.startIndex
    || value.endIndex !== partition.endIndex
    || typeof value.summaryHash !== "string"
    || value.worlds.length !== partition.endIndex - partition.startIndex + 1
  ) {
    return false;
  }

  return value.worlds.every((world, offset) => {
    const expectedIndex = partition.startIndex + offset;
    const expectedSeed = `${input.seedPrefix}-world-${String(expectedIndex).padStart(5, "0")}`;
    return isGateWorldSummaryCheckpoint(world, expectedSeed);
  });
}

/** Validates the compact fields needed before aggregation consumes a summary. */
function isGateWorldSummaryCheckpoint(value: unknown, expectedSeed: string): value is LongRunGateWorldSummary {
  return (
    isRecord(value)
    && value.seed === expectedSeed
    && (value.status === "pass" || value.status === "warn" || value.status === "fail")
    && typeof value.contractFinanceStructuralViolationCount === "number"
    && typeof value.minimumCashBalanceObserved === "number"
    && typeof value.maximumWageBudgetUtilizationObserved === "number"
    && typeof value.maximumFreeAgentShareObserved === "number"
    && Array.isArray(value.warningCheckKeys)
    && Array.isArray(value.failingCheckKeys)
  );
}

/** Returns one stable checkpoint filename independent from worker concurrency. */
function shardCheckpointPath(directoryPath: string, shardIndex: number, shardCount: number): string {
  const width = Math.max(4, String(shardCount).length);
  return join(
    directoryPath,
    `shard-${String(shardIndex).padStart(width, "0")}-of-${String(shardCount).padStart(width, "0")}.json`,
  );
}

/** Narrows parsed JSON objects without trusting their prototype. */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Identifies a missing checkpoint without swallowing permission or IO errors. */
function isMissingFileError(error: unknown): boolean {
  return isRecord(error) && error.code === "ENOENT";
}
