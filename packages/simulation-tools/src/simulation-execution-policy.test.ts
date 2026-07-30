import assert from "node:assert/strict";
import { test } from "vitest";

import {
  SIMULATION_WORKER_LIMIT,
  resolveSimulationWorkerCount,
} from "./simulation-execution-policy.ts";

test("simulation batches default to seven workers", () => {
  assert.equal(SIMULATION_WORKER_LIMIT, 7);
  assert.equal(resolveSimulationWorkerCount({ workItemCount: 50 }), 7);
});

test("simulation batches never create more workers than work items", () => {
  assert.equal(resolveSimulationWorkerCount({ workItemCount: 3 }), 3);
  assert.equal(resolveSimulationWorkerCount({ workItemCount: 1 }), 1);
});

test("explicit overrides may reduce but cannot raise the worker limit", () => {
  assert.equal(
    resolveSimulationWorkerCount({
      workItemCount: 50,
      requestedWorkerCount: 4,
    }),
    4,
  );
  assert.equal(
    resolveSimulationWorkerCount({
      workItemCount: 50,
      requestedWorkerCount: 12,
    }),
    7,
  );
});

test("simulation worker policy rejects malformed counts", () => {
  assert.throws(
    () => resolveSimulationWorkerCount({ workItemCount: 0 }),
    /simulation work item count must be a positive safe integer/,
  );
  assert.throws(
    () =>
      resolveSimulationWorkerCount({
        workItemCount: 10,
        requestedWorkerCount: -1,
      }),
    /requested simulation worker count must be a positive safe integer/,
  );
});
