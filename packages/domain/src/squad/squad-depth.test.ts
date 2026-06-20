import assert from "node:assert/strict";
import { test } from "vitest";

import { clubId, playerId, type PlayerId } from "../types/ids.ts";
import {
  MATCH_STARTER_COUNT,
  createSquadDepth,
  validateMatchSquadDepth,
  SquadDepthError,
  type SquadDepth,
} from "./squad-depth.ts";

/**
 * Squad-depth tests protect the user-controlled roster contract. No test in
 * this file should imply automatic best-XI selection.
 */
test("createSquadDepth preserves explicit squad, starter, and bench order", () => {
  const squadDepth = createSquadDepth(squadDepthFixture());

  assert.deepEqual(
    squadDepth.squadPlayerIds.map(String),
    Array.from({ length: 22 }, (_, index) => `player:test-${String(index + 1).padStart(2, "0")}`),
  );
  assert.deepEqual(
    squadDepth.starterPlayerIds.map(String),
    Array.from({ length: 11 }, (_, index) => `player:test-${String(index + 1).padStart(2, "0")}`),
  );
  assert.deepEqual(
    squadDepth.benchReservePlayerIds.map(String),
    Array.from({ length: 11 }, (_, index) => `player:test-${String(index + 12).padStart(2, "0")}`),
  );
});

test("createSquadDepth rejects duplicate squad, starter, and bench players", () => {
  const duplicatedPlayerId = playerId("player:test-01");

  assertSquadDepthError(
    () => createSquadDepth({ ...squadDepthFixture(), squadPlayerIds: [duplicatedPlayerId, duplicatedPlayerId] }),
    "duplicate_squad_player",
  );

  assertSquadDepthError(
    () =>
      createSquadDepth({
        ...squadDepthFixture(),
        starterPlayerIds: [duplicatedPlayerId, duplicatedPlayerId],
      }),
    "duplicate_starter_player",
  );

  assertSquadDepthError(
    () =>
      createSquadDepth({
        ...squadDepthFixture(),
        benchReservePlayerIds: [duplicatedPlayerId, duplicatedPlayerId],
      }),
    "duplicate_bench_reserve_player",
  );
});

test("createSquadDepth rejects players outside the squad", () => {
  const unknownPlayerId = playerId("player:unknown");

  assertSquadDepthError(
    () =>
      createSquadDepth({
        ...squadDepthFixture(),
        starterPlayerIds: [unknownPlayerId],
      }),
    "unknown_starter_player",
  );

  assertSquadDepthError(
    () =>
      createSquadDepth({
        ...squadDepthFixture(),
        benchReservePlayerIds: [unknownPlayerId],
      }),
    "unknown_bench_reserve_player",
  );
});

test("createSquadDepth rejects starter and bench overlap", () => {
  const overlappingPlayerId = playerId("player:test-01");

  assertSquadDepthError(
    () =>
      createSquadDepth({
        ...squadDepthFixture(),
        starterPlayerIds: [overlappingPlayerId],
        benchReservePlayerIds: [overlappingPlayerId],
      }),
    "starter_bench_reserve_overlap",
  );
});

test("validateMatchSquadDepth requires exactly eleven starters", () => {
  assert.equal(validateMatchSquadDepth(squadDepthFixture()).starterPlayerIds.length, MATCH_STARTER_COUNT);

  assertSquadDepthError(
    () =>
      validateMatchSquadDepth({
        ...squadDepthFixture(),
        starterPlayerIds: playerIds(10, 1),
      }),
    "invalid_starter_count",
  );
});

function squadDepthFixture(): SquadDepth {
  return {
    clubId: clubId("club:pro01"),
    squadPlayerIds: playerIds(22, 1),
    starterPlayerIds: playerIds(11, 1),
    benchReservePlayerIds: playerIds(11, 12),
  };
}

function playerIds(count: number, startIndex: number): readonly PlayerId[] {
  return Array.from({ length: count }, (_, index) => playerId(`player:test-${String(startIndex + index).padStart(2, "0")}`));
}

function assertSquadDepthError(action: () => void, code: SquadDepthError["code"]): void {
  assert.throws(action, (error: unknown) => error instanceof SquadDepthError && error.code === code);
}
