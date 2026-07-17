import assert from "node:assert/strict";
import { test } from "vitest";

import { migrateCareerSave } from "./career-save-envelope.ts";
import { StorageError } from "./game-storage.interface.ts";

/** Envelope tests keep schema routing independent from concrete adapters. */
test("career envelope migration rejects non-object payloads", () => {
  assert.throws(
    () => migrateCareerSave(null),
    (error: unknown) => error instanceof StorageError && error.code === "save_unreadable",
  );
});

test("career envelope migration rejects unsupported schema versions", () => {
  assert.throws(
    () => migrateCareerSave({ saveSchemaVersion: 999, metadata: {}, state: {} }),
    (error: unknown) => error instanceof StorageError && error.code === "unsupported_schema_version",
  );
});
