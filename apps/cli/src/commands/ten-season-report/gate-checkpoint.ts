import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { SupportedLanguage } from "@game/i18n";
import {
  mergePlayerDevelopmentCohortAggregates,
  mergePlayerDevelopmentCohortWorldSummaries,
  PLAYER_DEVELOPMENT_COHORT_CONTRACT_VERSION,
  validatePlayerDevelopmentCohortWorldSummary,
  type PlayerDevelopmentCohortWorldSummary,
} from "@game/simulation-tools";

import {
  aggregateDevelopmentAnomalyChecks,
  createPlayerDevelopmentCohortReportFromAggregate,
  createLongRunGatePartitions,
  createLongRunGateReportFromWorlds,
  hashGateWorldSummaries,
  hashPlayerDevelopmentCohortWorldSummary,
  mergePlayerDevelopmentCohortAnomalyCheckCounts,
  resolveLongRunGateWorkerCount,
  runLongRunGateWorkerThread,
  runPlayerDevelopmentCohortWorkerThread,
  type LongRunGateReport,
  type LongRunGateWorkerPartition,
  type LongRunGateWorldSummary,
  type PlayerDevelopmentCohortReport,
  type PlayerDevelopmentCohortAnomalyCheckCount,
} from "./report-data.ts";

/** Current on-disk contract for every resumable report shard. */
const LONG_RUN_CHECKPOINT_SCHEMA_VERSION = 4;

/** Stable discriminator for the pre-existing market/economy gate payload. */
const LONG_RUN_GATE_REPORT_KIND = "long-run-gate";

/** Schema-4 identity for the retained legacy report payload. */
const LONG_RUN_GATE_DIAGNOSTIC_CONTRACT_VERSION = "long-run-gate-v1";

/** Exact schema-4 envelope keys for the dedicated development checkpoint. */
const PLAYER_DEVELOPMENT_COHORT_CHECKPOINT_KEYS = [
  "schemaVersion",
  "reportKind",
  "diagnosticContractVersion",
  "seedPrefix",
  "worldCount",
  "seasonCount",
  "language",
  "shardIndex",
  "shardCount",
  "startIndex",
  "endIndex",
  "worldIndex",
  "worldId",
  "summaryHash",
  "world",
] as const;

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
  readonly reportKind: typeof LONG_RUN_GATE_REPORT_KIND;
  readonly diagnosticContractVersion: typeof LONG_RUN_GATE_DIAGNOSTIC_CONTRACT_VERSION;
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

/** Input for the one-world-per-shard development cohort. */
export interface CreateResumablePlayerDevelopmentCohortReportInput {
  readonly seedPrefix: string;
  readonly worldCount: number;
  readonly seasonCount: 3;
  readonly language: SupportedLanguage;
  readonly checkpointDirectoryPath: string;
  readonly workerCount?: number;
}

/** Compact schema-4 shard dedicated to one development world. */
interface PlayerDevelopmentCohortShardCheckpoint {
  readonly schemaVersion: typeof LONG_RUN_CHECKPOINT_SCHEMA_VERSION;
  readonly reportKind: "player-development-cohort";
  readonly diagnosticContractVersion:
    typeof PLAYER_DEVELOPMENT_COHORT_CONTRACT_VERSION;
  readonly seedPrefix: string;
  readonly worldCount: number;
  readonly seasonCount: 3;
  readonly language: SupportedLanguage;
  readonly shardIndex: number;
  readonly shardCount: number;
  readonly startIndex: number;
  readonly endIndex: number;
  readonly worldIndex: number;
  readonly worldId: string;
  readonly summaryHash: string;
  readonly world: PlayerDevelopmentCohortWorldSummary;
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
    ...(input.workerCount === undefined ? {} : { workerCount: input.workerCount }),
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
      resumedWorldCount: input.worldCount - tasks.length,
      simulatedWorldCount: tasks.length,
    },
    worlds,
  });
}

/**
 * Runs or resumes the compact development cohort with one world per shard.
 *
 * Missing files are resumable. Any present but malformed, incompatible, or
 * hash-mismatched shard is a hard error so partial evidence never turns green.
 */
export async function createResumablePlayerDevelopmentCohortReport(
  input: CreateResumablePlayerDevelopmentCohortReportInput,
): Promise<PlayerDevelopmentCohortReport> {
  if (!Number.isSafeInteger(input.worldCount) || input.worldCount <= 0) {
    throw new RangeError(
      `Player-development world count must be positive: ${input.worldCount}`,
    );
  }
  const summaryHashes = new Map<number, string>();
  const missingWorldIndexes: number[] = [];
  await mkdir(input.checkpointDirectoryPath, { recursive: true });

  for (let worldIndex = 1; worldIndex <= input.worldCount; worldIndex += 1) {
    const checkpoint = await readPlayerDevelopmentCohortCheckpoint(
      input,
      worldIndex,
    );
    if (checkpoint === undefined) {
      missingWorldIndexes.push(worldIndex);
    } else {
      summaryHashes.set(worldIndex, checkpoint.summaryHash);
    }
  }

  const workerCount = resolveLongRunGateWorkerCount({
    worldCount: Math.max(1, missingWorldIndexes.length || input.worldCount),
    ...(input.workerCount === undefined
      ? {}
      : { workerCount: input.workerCount }),
  });
  let nextTaskIndex = 0;
  async function runQueue(): Promise<void> {
    while (nextTaskIndex < missingWorldIndexes.length) {
      const worldIndex = missingWorldIndexes[nextTaskIndex];
      nextTaskIndex += 1;
      if (worldIndex === undefined) return;
      const result = await runPlayerDevelopmentCohortWorkerThread({
        seedPrefix: input.seedPrefix,
        seasonCount: input.seasonCount,
        language: input.language,
        worldIndex,
      });
      if (result.worldIndex !== worldIndex) {
        throw new Error(
          `Player-development worker returned world ${result.worldIndex}, expected ${worldIndex}`,
        );
      }
      validatePlayerDevelopmentCohortWorldSummary(result.world);
      const checkpoint = createPlayerDevelopmentCohortCheckpoint(
        input,
        worldIndex,
        result.world,
      );
      await writePlayerDevelopmentCohortCheckpoint(
        input.checkpointDirectoryPath,
        checkpoint,
      );
      summaryHashes.set(worldIndex, checkpoint.summaryHash);
    }
  }

  await Promise.all(Array.from(
    { length: Math.min(workerCount, missingWorldIndexes.length) },
    () => runQueue(),
  ));

  const orderedHashes = Array.from({ length: input.worldCount }, (_, index) => {
    const summaryHash = summaryHashes.get(index + 1);
    if (summaryHash === undefined) {
      throw new Error(
        `Player-development shard ${index + 1} did not produce a checkpoint`,
      );
    }
    return summaryHash;
  });

  let aggregate: ReturnType<
    typeof mergePlayerDevelopmentCohortWorldSummaries
  > | undefined;
  let anomalyCheckCounts:
    readonly PlayerDevelopmentCohortAnomalyCheckCount[] = [];
  for (let worldIndex = 1; worldIndex <= input.worldCount; worldIndex += 1) {
    const checkpoint = await readPlayerDevelopmentCohortCheckpoint(
      input,
      worldIndex,
    );
    if (checkpoint === undefined) {
      throw new Error(
        `Player-development shard ${worldIndex} disappeared before aggregation`,
      );
    }
    const worldAggregate = mergePlayerDevelopmentCohortWorldSummaries([
      checkpoint.world,
    ]);
    aggregate = aggregate === undefined
      ? worldAggregate
      : mergePlayerDevelopmentCohortAggregates([aggregate, worldAggregate]);
    anomalyCheckCounts = mergePlayerDevelopmentCohortAnomalyCheckCounts([
      anomalyCheckCounts,
      aggregateDevelopmentAnomalyChecks([checkpoint.world]),
    ]);
  }
  if (aggregate === undefined) {
    throw new Error("Player-development cohort produced no aggregate evidence");
  }

  return createPlayerDevelopmentCohortReportFromAggregate({
    seedPrefix: input.seedPrefix,
    worldCount: input.worldCount,
    seasonCount: input.seasonCount,
    execution: {
      mode: "sharded",
      workerCount,
      partitionHashes: orderedHashes,
      shardCount: input.worldCount,
      resumedShardCount: input.worldCount - missingWorldIndexes.length,
      resumedWorldCount: input.worldCount - missingWorldIndexes.length,
      simulatedWorldCount: missingWorldIndexes.length,
    },
    aggregate,
    anomalyCheckCounts,
  });
}

function createPlayerDevelopmentCohortCheckpoint(
  input: CreateResumablePlayerDevelopmentCohortReportInput,
  worldIndex: number,
  world: PlayerDevelopmentCohortWorldSummary,
): PlayerDevelopmentCohortShardCheckpoint {
  const worldId = playerDevelopmentWorldId(input.seedPrefix, worldIndex);
  if (world.worldId !== worldId) {
    throw new Error(
      `Player-development world identity mismatch: ${world.worldId}/${worldId}`,
    );
  }
  return {
    schemaVersion: LONG_RUN_CHECKPOINT_SCHEMA_VERSION,
    reportKind: "player-development-cohort",
    diagnosticContractVersion:
      PLAYER_DEVELOPMENT_COHORT_CONTRACT_VERSION,
    seedPrefix: input.seedPrefix,
    worldCount: input.worldCount,
    seasonCount: input.seasonCount,
    language: input.language,
    shardIndex: worldIndex,
    shardCount: input.worldCount,
    startIndex: worldIndex,
    endIndex: worldIndex,
    worldIndex,
    worldId,
    summaryHash: hashPlayerDevelopmentCohortWorldSummary(world),
    world,
  };
}

async function readPlayerDevelopmentCohortCheckpoint(
  input: CreateResumablePlayerDevelopmentCohortReportInput,
  worldIndex: number,
): Promise<PlayerDevelopmentCohortShardCheckpoint | undefined> {
  const path = shardCheckpointPath(
    input.checkpointDirectoryPath,
    worldIndex,
    input.worldCount,
  );
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
    throw new Error(
      `Player-development checkpoint is not valid JSON: ${path}`,
    );
  }
  if (!isMatchingPlayerDevelopmentCohortCheckpoint(value, input, worldIndex)) {
    throw new Error(
      `Player-development checkpoint metadata or shape is invalid: ${path}`,
    );
  }
  try {
    validatePlayerDevelopmentCohortWorldSummary(value.world);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Player-development checkpoint summary is invalid: ${path}: ${message}`,
      { cause: error },
    );
  }
  if (
    hashPlayerDevelopmentCohortWorldSummary(value.world)
      !== value.summaryHash
  ) {
    throw new Error(`Player-development checkpoint hash mismatch: ${path}`);
  }
  return value;
}

function isMatchingPlayerDevelopmentCohortCheckpoint(
  value: unknown,
  input: CreateResumablePlayerDevelopmentCohortReportInput,
  worldIndex: number,
): value is PlayerDevelopmentCohortShardCheckpoint {
  if (
    !hasExactRecordKeys(
      value,
      PLAYER_DEVELOPMENT_COHORT_CHECKPOINT_KEYS,
    )
    || !isRecord(value.world)
  ) return false;
  const worldId = playerDevelopmentWorldId(input.seedPrefix, worldIndex);
  return value.schemaVersion === LONG_RUN_CHECKPOINT_SCHEMA_VERSION
    && value.reportKind === "player-development-cohort"
    && value.diagnosticContractVersion
      === PLAYER_DEVELOPMENT_COHORT_CONTRACT_VERSION
    && value.seedPrefix === input.seedPrefix
    && value.worldCount === input.worldCount
    && value.seasonCount === input.seasonCount
    && value.language === input.language
    && value.shardIndex === worldIndex
    && value.shardCount === input.worldCount
    && value.startIndex === worldIndex
    && value.endIndex === worldIndex
    && value.worldIndex === worldIndex
    && value.worldId === worldId
    && value.world.worldId === worldId
    && typeof value.summaryHash === "string";
}

async function writePlayerDevelopmentCohortCheckpoint(
  directoryPath: string,
  checkpoint: PlayerDevelopmentCohortShardCheckpoint,
): Promise<void> {
  const path = shardCheckpointPath(
    directoryPath,
    checkpoint.shardIndex,
    checkpoint.shardCount,
  );
  const temporaryPath = `${path}.${process.pid}.tmp`;
  try {
    await writeFile(temporaryPath, JSON.stringify(checkpoint), "utf8");
    await rename(temporaryPath, path);
  } catch (error) {
    await rm(temporaryPath, { force: true });
    throw error;
  }
}

function playerDevelopmentWorldId(
  seedPrefix: string,
  worldIndex: number,
): string {
  return `${seedPrefix}-world-${String(worldIndex).padStart(5, "0")}`;
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
    reportKind: LONG_RUN_GATE_REPORT_KIND,
    diagnosticContractVersion: LONG_RUN_GATE_DIAGNOSTIC_CONTRACT_VERSION,
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
    || value.reportKind !== LONG_RUN_GATE_REPORT_KIND
    || value.diagnosticContractVersion
      !== LONG_RUN_GATE_DIAGNOSTIC_CONTRACT_VERSION
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
    && Array.isArray(value.playerEconomyGates)
    && value.playerEconomyGates.every(isPlayerEconomyGateCheckpoint)
    && hasCurrentStockArrivalGateKeys(value.playerEconomyGates)
    && Array.isArray(value.closingPlayerMarketObservations)
    && value.closingPlayerMarketObservations.every(isClosingMarketObservation)
    && Array.isArray(value.closingPlayerMarketClubSquadObservations)
    && value.closingPlayerMarketClubSquadObservations.every(
      isClosingMarketClubSquadObservation,
    )
    && Array.isArray(value.warningCheckKeys)
    && Array.isArray(value.failingCheckKeys)
  );
}

/**
 * Rejects serialized gate rows that cannot safely contribute to aggregation.
 *
 * Checkpoint hashes prove byte integrity, while this guard proves that the
 * payload still implements the current typed gate contract.
 */
function isPlayerEconomyGateCheckpoint(value: unknown): boolean {
  if (!isRecord(value)) return false;
  return typeof value.key === "string"
    && value.key.length > 0
    && (
      value.status === "pass"
      || value.status === "fail"
      || value.status === "not_evaluated"
    )
    && isNonNegativeSafeInteger(value.observationCount)
    && isNonNegativeSafeInteger(value.violationCount)
    && typeof value.threshold === "string"
    && Array.isArray(value.examples)
    && isOptionalCohortShareEvidence(value.cohortShareEvidence)
    && isOptionalCohortMinimumEvidence(value.cohortMinimumEvidence);
}

/** Rejects intermediate schema-v3 shards that predate stock-arrival semantics. */
function hasCurrentStockArrivalGateKeys(
  gates: readonly unknown[],
): boolean {
  const keys = new Set(
    gates.flatMap((gate) =>
      isRecord(gate) && typeof gate.key === "string" ? [gate.key] : []
    ),
  );
  return keys.has("young_stored_ceiling_six_stock_arrival_category_placement")
    && keys.has("young_stored_ceiling_six_stock_arrival_club_uniqueness");
}

/** Validates optional additive share evidence retained inside a checkpoint. */
function isOptionalCohortShareEvidence(value: unknown): boolean {
  if (value === undefined) return true;
  return isRecord(value)
    && isNonNegativeSafeInteger(value.matchingObservationCount)
    && isNonNegativeSafeInteger(value.minimumBasisPoints)
    && isNonNegativeSafeInteger(value.maximumBasisPoints);
}

/** Validates optional non-vacuity evidence retained inside a checkpoint. */
function isOptionalCohortMinimumEvidence(value: unknown): boolean {
  if (value === undefined) return true;
  return isRecord(value)
    && isNonNegativeSafeInteger(value.evidenceObservationCount)
    && isPositiveSafeInteger(value.minimumObservationCount);
}

/** Narrows numeric counters that may be added across checkpoint shards. */
function isNonNegativeSafeInteger(value: unknown): value is number {
  return Number.isSafeInteger(value) && (value as number) >= 0;
}

/** Narrows positive integer thresholds retained by non-vacuity gates. */
function isPositiveSafeInteger(value: unknown): value is number {
  return Number.isSafeInteger(value) && (value as number) > 0;
}

/** Rejects stale checkpoints that predate the closing player-value cohort. */
function isClosingMarketObservation(value: unknown): boolean {
  return isRecord(value)
    && value.population === "active_closing_checkpoint"
    && typeof value.seasonStartYear === "number"
    && typeof value.publicValueMinorUnits === "number";
}

/** Rejects stale checkpoints without normalized closing club-value evidence. */
function isClosingMarketClubSquadObservation(value: unknown): boolean {
  return isRecord(value)
    && value.activeSeniorCount === 22
    && typeof value.seasonStartYear === "number"
    && typeof value.publicSquadValueMinorUnits === "number";
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

/** Rejects stale or forward fields instead of silently accepting a mixed envelope. */
function hasExactRecordKeys(
  value: unknown,
  expectedKeys: readonly string[],
): value is Record<string, unknown> {
  if (!isRecord(value)) return false;
  const actualKeys = Object.keys(value);
  return actualKeys.length === expectedKeys.length
    && expectedKeys.every((key) => Object.hasOwn(value, key));
}

/** Identifies a missing checkpoint without swallowing permission or IO errors. */
function isMissingFileError(error: unknown): boolean {
  return isRecord(error) && error.code === "ENOENT";
}
