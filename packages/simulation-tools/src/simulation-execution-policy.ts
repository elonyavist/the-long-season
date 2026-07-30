/** Repository-wide default and maximum for independent simulation work items. */
export const SIMULATION_WORKER_LIMIT = 7;

/** Inputs for the pure repository simulation-worker policy. */
export interface ResolveSimulationWorkerCountInput {
  /** Number of independent jobs available to the batch runner. */
  readonly workItemCount: number;
  /** Optional lower local/test override; values above the limit are capped. */
  readonly requestedWorkerCount?: number;
}

/**
 * Resolves bounded simulation concurrency without inspecting the host machine.
 *
 * A batch uses seven workers by default when it has at least seven independent
 * jobs. Smaller batches and explicit lower overrides use fewer workers; no
 * caller can raise concurrency above the repository-wide limit.
 */
export function resolveSimulationWorkerCount(
  input: ResolveSimulationWorkerCountInput,
): number {
  assertPositiveSafeInteger(input.workItemCount, "simulation work item count");

  if (input.requestedWorkerCount !== undefined) {
    assertPositiveSafeInteger(
      input.requestedWorkerCount,
      "requested simulation worker count",
    );
  }

  return Math.min(
    input.workItemCount,
    input.requestedWorkerCount ?? SIMULATION_WORKER_LIMIT,
    SIMULATION_WORKER_LIMIT,
  );
}

/** Rejects malformed execution-policy inputs instead of guessing a fallback. */
function assertPositiveSafeInteger(value: number, label: string): void {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new RangeError(`${label} must be a positive safe integer: ${value}`);
  }
}

