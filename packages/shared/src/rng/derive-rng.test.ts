import assert from "node:assert/strict";
import { test } from "vitest";

import { deriveRng, hashStringToSeedWords, RNG_ALGORITHM_VERSION } from "./derive-rng.ts";

/**
 * Deterministic RNG tests for stream derivation and local stream behavior.
 */

/**
 * Reads a compact deterministic sequence from one RNG.
 */
function sampleSequence(seed: string, streamName: string, ...keyParts: readonly string[]): readonly number[] {
  const rng = deriveRng(seed, streamName, ...keyParts);

  return [rng.nextFloat(), rng.nextFloat(), rng.nextInt(0, 10_000), rng.nextInt(-10, 10)];
}

test("same seed and same stream key produce the same sequence", () => {
  assert.deepEqual(
    sampleSequence("demo-001", "match", "fixture:000001"),
    sampleSequence("demo-001", "match", "fixture:000001"),
  );
});

test("same seed and different stream names produce different sequences", () => {
  assert.notDeepEqual(
    sampleSequence("demo-001", "match", "fixture:000001"),
    sampleSequence("demo-001", "schedule", "fixture:000001"),
  );
});

test("different key parts produce different sequences", () => {
  assert.notDeepEqual(
    sampleSequence("demo-001", "match", "fixture:000001"),
    sampleSequence("demo-001", "match", "fixture:000002"),
  );
});

test("derived RNG helpers consume the stream deterministically", () => {
  const first = deriveRng("demo-001", "choice", "club:perugia").pick(["home", "away", "neutral"]);
  const second = deriveRng("demo-001", "choice", "club:perugia").pick(["home", "away", "neutral"]);

  assert.equal(first, second);
});

test("hash function returns four unsigned 32-bit words", () => {
  const seed = hashStringToSeedWords(RNG_ALGORITHM_VERSION);

  assert.equal(seed.length, 4);
  for (const word of seed) {
    assert.equal(Number.isSafeInteger(word), true);
    assert.equal(word >= 0, true);
    assert.equal(word <= 0xffffffff, true);
  }
});
