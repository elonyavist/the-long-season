import assert from "node:assert/strict";
import { test } from "vitest";

import { playerId, stateValue, type PlayerDynamicState, type PlayerId } from "@game/domain";

import { applyCareerWeeklyRecovery } from "./career-weekly-recovery.ts";

test("applyCareerWeeklyRecovery recovers explicit players by calendar days", () => {
  const selected = playerId("player:selected");
  const rested = playerId("player:rested");
  const playerStates = playerStatesFixture({
    [selected]: playerStateFixture(76),
    [rested]: playerStateFixture(100),
  });

  const result = applyCareerWeeklyRecovery({
    playerStates,
    playerIds: [selected],
    dayCount: 2,
  });

  assert.equal(result.dayCount, 2);
  assert.equal(result.playerStates[selected]?.fitness, 86);
  assert.equal(result.playerStates[rested]?.fitness, 100);
  assert.deepEqual(result.changes, [
    {
      playerId: selected,
      beforeFitness: 76,
      afterFitness: 86,
      delta: 10,
      recovered: true,
    },
  ]);
});

test("applyCareerWeeklyRecovery caps fitness at the rule maximum", () => {
  const selected = playerId("player:selected");
  const result = applyCareerWeeklyRecovery({
    playerStates: playerStatesFixture({
      [selected]: playerStateFixture(96),
    }),
    playerIds: [selected],
    dayCount: 2,
  });

  assert.equal(result.playerStates[selected]?.fitness, 100);
  assert.deepEqual(result.changes, [
    {
      playerId: selected,
      beforeFitness: 96,
      afterFitness: 100,
      delta: 4,
      recovered: true,
    },
  ]);
});

test("applyCareerWeeklyRecovery treats zero or negative days as a no-op summary", () => {
  const selected = playerId("player:selected");
  const playerStates = playerStatesFixture({
    [selected]: playerStateFixture(84),
  });

  const zero = applyCareerWeeklyRecovery({ playerStates, playerIds: [selected], dayCount: 0 });
  const negative = applyCareerWeeklyRecovery({ playerStates, playerIds: [selected], dayCount: -3 });

  assert.equal(zero.dayCount, 0);
  assert.equal(negative.dayCount, 0);
  assert.deepEqual(zero.changes, [
    {
      playerId: selected,
      beforeFitness: 84,
      afterFitness: 84,
      delta: 0,
      recovered: false,
    },
  ]);
  assert.deepEqual(negative, zero);
});

test("applyCareerWeeklyRecovery does not mutate input and is deterministic", () => {
  const first = playerId("player:first");
  const second = playerId("player:second");
  const playerIds = [first, second] as const;
  const playerStates = playerStatesFixture({
    [first]: playerStateFixture(70),
    [second]: playerStateFixture(82),
  });
  const before = JSON.stringify({ playerIds, playerStates });

  const firstResult = applyCareerWeeklyRecovery({ playerStates, playerIds, dayCount: 3 });
  const secondResult = applyCareerWeeklyRecovery({ playerStates, playerIds, dayCount: 3 });

  assert.equal(JSON.stringify({ playerIds, playerStates }), before);
  assert.deepEqual(firstResult, secondResult);
  assert.notEqual(firstResult.playerStates, playerStates);
  assert.deepEqual(playerIds, [first, second]);
});

test("applyCareerWeeklyRecovery preserves unrelated player state references", () => {
  const selected = playerId("player:selected");
  const unrelated = playerId("player:unrelated");
  const unrelatedState = playerStateFixture(91);
  const playerStates = playerStatesFixture({
    [selected]: playerStateFixture(80),
    [unrelated]: unrelatedState,
  });

  const result = applyCareerWeeklyRecovery({ playerStates, playerIds: [selected], dayCount: 1 });

  assert.equal(result.playerStates[unrelated], unrelatedState);
  assert.equal(result.changes.length, 1);
});

function playerStatesFixture(states: Partial<Record<PlayerId, PlayerDynamicState>>): Readonly<Record<PlayerId, PlayerDynamicState>> {
  return states as Readonly<Record<PlayerId, PlayerDynamicState>>;
}

function playerStateFixture(fitness: number): PlayerDynamicState {
  return {
    fitness: stateValue(fitness),
    form: stateValue(50),
    morale: stateValue(50),
  };
}

