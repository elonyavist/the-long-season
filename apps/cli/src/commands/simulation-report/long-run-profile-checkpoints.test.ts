import assert from "node:assert/strict";
import { mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "vitest";

import {
  readCareerSectionWorldCheckpoint,
  readCareerSectionWorldCheckpointOutcome,
  writeCareerSectionWorldCheckpoint,
  writeCareerSectionWorldFailureCheckpoint,
  type CareerSectionWorldCheckpointIdentity,
} from "./long-run-profile-checkpoints.ts";

test("career-section world checkpoints resume byte-identical canonical facts", async () => {
  const directory = await mkdtemp(join(tmpdir(), "tls-career-section-checkpoint-"));
  const identity = checkpointIdentity(directory);
  const projection = {
    seed: identity.worldSeed,
    sections: { standings: { seasons: [{ seasonNumber: 1, rows: [] }] } },
    calibrationVersions: { engine: "v1" },
  } as const;

  try {
    assert.equal(await readCareerSectionWorldCheckpoint(identity), undefined);
    await writeCareerSectionWorldCheckpoint(identity, projection);
    assert.deepEqual(await readCareerSectionWorldCheckpoint(identity), projection);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("career-section checkpoints reject stale profile metadata", async () => {
  const directory = await mkdtemp(join(tmpdir(), "tls-career-section-stale-"));
  const identity = checkpointIdentity(directory);
  try {
    await writeCareerSectionWorldCheckpoint(identity, { seed: identity.worldSeed });
    await assert.rejects(
      readCareerSectionWorldCheckpoint({ ...identity, profileId: "other-profile" }),
      /metadata or shape is invalid/,
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("career-section checkpoints reject payload changes after publication", async () => {
  const directory = await mkdtemp(join(tmpdir(), "tls-career-section-corrupt-"));
  const identity = checkpointIdentity(directory);
  try {
    await writeCareerSectionWorldCheckpoint(identity, { seed: identity.worldSeed });
    const [filename] = await readdir(directory);
    assert.notEqual(filename, undefined);
    const path = join(directory, filename!);
    const checkpoint = JSON.parse(await readFile(path, "utf8")) as {
      projection: { seed: string };
    };
    checkpoint.projection.seed = "changed-after-hash";
    await writeFile(path, JSON.stringify(checkpoint), "utf8");

    await assert.rejects(
      readCareerSectionWorldCheckpoint(identity),
      /hash mismatch/,
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("career-section failure checkpoints resume the exact failed world", async () => {
  const directory = await mkdtemp(join(tmpdir(), "tls-career-section-failure-"));
  const identity = checkpointIdentity(directory);
  const error = "Cannot advance report career test season 9: finance_lifecycle_rejected";
  try {
    await writeCareerSectionWorldFailureCheckpoint(identity, error);
    assert.deepEqual(await readCareerSectionWorldCheckpointOutcome(identity), {
      status: "failed",
      error,
    });
    await assert.rejects(
      readCareerSectionWorldCheckpoint(identity),
      /Cached career-section world failed/,
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("career-section failure checkpoints reject changed error prose", async () => {
  const directory = await mkdtemp(join(tmpdir(), "tls-career-section-failure-corrupt-"));
  const identity = checkpointIdentity(directory);
  try {
    await writeCareerSectionWorldFailureCheckpoint(identity, "original failure");
    const [filename] = await readdir(directory);
    assert.notEqual(filename, undefined);
    const path = join(directory, filename!);
    const checkpoint = JSON.parse(await readFile(path, "utf8")) as { error: string };
    checkpoint.error = "changed after hash";
    await writeFile(path, JSON.stringify(checkpoint), "utf8");

    await assert.rejects(
      readCareerSectionWorldCheckpointOutcome(identity),
      /failure checkpoint hash mismatch/,
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

function checkpointIdentity(
  checkpointDirectoryPath: string,
): CareerSectionWorldCheckpointIdentity {
  return {
    profileId: "phase81a-league-diversity-canary-7x10",
    worldSeed: "phase81a-league-diversity-canary-world-00001",
    worldIndex: 1,
    worldCount: 7,
    seasonCount: 10,
    detail: "standard",
    sectionIds: ["standings", "formations"],
    checkpointDirectoryPath,
  };
}
