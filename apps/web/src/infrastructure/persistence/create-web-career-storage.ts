import { releaseProxy, wrap, type Remote } from "comlink";

import { SqliteCareerStorage, StorageError, type SqliteCareerWorkerPort } from "@game/storage/sqlite";

import { WebCareerRuntime } from "../../runtime/web-career-runtime";

/** Browser-owned handle that closes both SQLite and its dedicated worker. */
export interface WebCareerStorageHandle {
  readonly storage: SqliteCareerStorage;
  close(): Promise<void>;
}

/** Browser-owned runtime handle used by the React composition root. */
export interface WebCareerRuntimeHandle {
  readonly runtime: WebCareerRuntime;
  close(): Promise<void>;
}

/** Creates one initialized SQLite/OPFS career storage coordinator. */
export async function createWebCareerStorage(): Promise<WebCareerStorageHandle> {
  const worker = new Worker(new URL("./sqlite-career.worker.ts", import.meta.url), { type: "module", name: "career-sqlite" });
  const remote = wrap<SqliteCareerWorkerPort>(worker);
  const storage = new SqliteCareerStorage(remote as Remote<SqliteCareerWorkerPort>);
  const workerBootstrap = workerBootstrapFailure(worker);

  try {
    await Promise.race([storage.initialize(), workerBootstrap.failure]);
  } catch (error) {
    remote[releaseProxy]();
    worker.terminate();
    throw error;
  } finally {
    workerBootstrap.dispose();
  }

  return {
    storage,
    async close() {
      await storage.close();
      remote[releaseProxy]();
      worker.terminate();
    },
  };
}

/** Rejects initialization when the module worker cannot start or deserialize messages. */
function workerBootstrapFailure(worker: Worker): Readonly<{ failure: Promise<never>; dispose(): void }> {
  let rejectFailure: ((reason: StorageError) => void) | undefined;
  const failure = new Promise<never>((_resolve, reject) => {
    rejectFailure = reject;
  });
  const fail = () => {
    rejectFailure?.(new StorageError("storage_unavailable", "Career storage worker could not be started"));
  };

  worker.addEventListener("error", fail);
  worker.addEventListener("messageerror", fail);

  return {
    failure,
    dispose() {
      worker.removeEventListener("error", fail);
      worker.removeEventListener("messageerror", fail);
    },
  };
}

/** Creates one application runtime backed exclusively by SQLite/OPFS. */
export async function createWebCareerRuntime(): Promise<WebCareerRuntimeHandle> {
  const handle = await createWebCareerStorage();
  return {
    runtime: new WebCareerRuntime(handle.storage),
    close: () => handle.close(),
  };
}
