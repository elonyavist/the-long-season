import { test } from "vitest";
import assert from "node:assert/strict";

import {
  CAREER_WORLD_GENERATOR_VERSION,
  CareerWorldMetadataError,
  createCareerWorldMetadata,
} from "./career-world.ts";

/**
 * Career-world metadata tests protect the durable seed contract used by new
 * career generation before any content generator starts consuming it.
 */

test("createCareerWorldMetadata trims and preserves valid metadata", () => {
  const metadata = createCareerWorldMetadata({
    worldSeed: " scalata-001 ",
    generatorVersion: CAREER_WORLD_GENERATOR_VERSION,
    creationSourceKey: " career:cli-new-world ",
  });

  assert.deepEqual(metadata, {
    worldSeed: "scalata-001",
    generatorVersion: CAREER_WORLD_GENERATOR_VERSION,
    creationSourceKey: "career:cli-new-world",
  });
  assert.equal("calibrationVersions" in metadata, false);
});

test("createCareerWorldMetadata rejects empty world seeds", () => {
  assertCareerWorldError(
    () =>
      createCareerWorldMetadata({
        worldSeed: " ",
        generatorVersion: CAREER_WORLD_GENERATOR_VERSION,
        creationSourceKey: "career:cli-new-world",
      }),
    "empty_world_seed",
  );
});

test("createCareerWorldMetadata rejects invalid generator versions", () => {
  assertCareerWorldError(
    () =>
      createCareerWorldMetadata({
        worldSeed: "scalata-001",
        generatorVersion: 0,
        creationSourceKey: "career:cli-new-world",
      }),
    "invalid_generator_version",
  );
});

test("createCareerWorldMetadata rejects empty creation source keys", () => {
  assertCareerWorldError(
    () =>
      createCareerWorldMetadata({
        worldSeed: "scalata-001",
        generatorVersion: CAREER_WORLD_GENERATOR_VERSION,
        creationSourceKey: " ",
      }),
    "empty_creation_source_key",
  );
});

/** Asserts a typed career-world metadata failure and its stable code. */
function assertCareerWorldError(
  action: () => void,
  code: CareerWorldMetadataError["code"],
): void {
  assert.throws(
    action,
    (error) => error instanceof CareerWorldMetadataError && error.code === code,
  );
}
