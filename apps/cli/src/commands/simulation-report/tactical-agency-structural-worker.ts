import { isMainThread, parentPort, Worker, workerData } from "node:worker_threads";

import {
  runTacticalAgencyStructuralAnalyticPartition,
  type TacticalAgencyStructuralAction,
  type TacticalAgencyStructuralContextRow,
} from "@game/simulation-tools";
import type { FakeDomesticWorld } from "@game/content";

const STRUCTURAL_WORKER_KIND = "phase81a-b-analytic-partition-v1";

/** Serializable analytic shard; opponent columns share no mutable state. */
export interface TacticalAgencyStructuralWorkerInput {
  readonly kind: typeof STRUCTURAL_WORKER_KIND;
  readonly partitionIndex: number;
  readonly actions: readonly TacticalAgencyStructuralAction[];
  readonly opponentIndexes: readonly number[];
  readonly engineConfig: FakeDomesticWorld["matchEngineConfig"];
  readonly matchTacticsCalibration: FakeDomesticWorld["matchTacticsCalibration"];
}

interface TacticalAgencyStructuralWorkerSuccess {
  readonly ok: true;
  readonly partitionIndex: number;
  readonly contexts: readonly TacticalAgencyStructuralContextRow[];
}

interface TacticalAgencyStructuralWorkerFailure {
  readonly ok: false;
  readonly message: string;
}

type TacticalAgencyStructuralWorkerMessage =
  | TacticalAgencyStructuralWorkerSuccess
  | TacticalAgencyStructuralWorkerFailure;

/** Executes one declared analytic partition in a real worker thread. */
export function runTacticalAgencyStructuralWorker(
  input: Omit<TacticalAgencyStructuralWorkerInput, "kind">,
): Promise<TacticalAgencyStructuralWorkerSuccess> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL(import.meta.url), {
      workerData: { ...input, kind: STRUCTURAL_WORKER_KIND } satisfies TacticalAgencyStructuralWorkerInput,
    });
    worker.once("message", (message: TacticalAgencyStructuralWorkerMessage) => {
      if (message.ok) resolve(message);
      else reject(new Error(message.message));
    });
    worker.once("error", reject);
    worker.once("exit", (code) => {
      if (code !== 0) reject(new Error(`Structural analytic worker exited with code ${code}`));
    });
  });
}

function isStructuralWorkerInput(value: unknown): value is TacticalAgencyStructuralWorkerInput {
  const candidate = value as Partial<TacticalAgencyStructuralWorkerInput> | undefined;
  return candidate?.kind === STRUCTURAL_WORKER_KIND
    && Number.isSafeInteger(candidate.partitionIndex)
    && Array.isArray(candidate.actions)
    && Array.isArray(candidate.opponentIndexes);
}

// This entrypoint may be imported inside unrelated workers. It answers only
// its tagged payload, so it cannot post a failure into somebody else's port.
if (!isMainThread && isStructuralWorkerInput(workerData)) {
  try {
    parentPort?.postMessage({
      ok: true,
      partitionIndex: workerData.partitionIndex,
      contexts: runTacticalAgencyStructuralAnalyticPartition(workerData),
    } satisfies TacticalAgencyStructuralWorkerSuccess);
  } catch (error) {
    parentPort?.postMessage({
      ok: false,
      message: error instanceof Error ? error.message : String(error),
    } satisfies TacticalAgencyStructuralWorkerFailure);
  }
}
