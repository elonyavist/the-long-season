import assert from "node:assert/strict";
import { test } from "vitest";

import { playerId, stateValue, type PlayerDynamicState, type PlayerId } from "@game/domain";

import { applyCareerFixtureConditionConsequences } from "./career-condition-consequences.ts";

test("applyCareerFixtureConditionConsequences spends fitness only for selected starters", () => {
  const starter = playerId("player:starter");
  const rested = playerId("player:rested");
  const playerStates = playerStatesFixture({
    [starter]: playerStateFixture(100),
    [rested]: playerStateFixture(94),
  });

  const result = applyCareerFixtureConditionConsequences({
    playerStates,
    selectedStarterIds: [starter],
    reportPlayerIds: [starter, rested],
  });

  assert.equal(result.playerStates[starter]?.fitness, 92);
  assert.equal(result.playerStates[rested]?.fitness, 94);
  assert.deepEqual(result.changes, [
    {
      playerId: starter,
      beforeFitness: 100,
      afterFitness: 92,
      delta: -8,
      started: true,
    },
    {
      playerId: rested,
      beforeFitness: 94,
      afterFitness: 94,
      delta: 0,
      started: false,
    },
  ]);
});

test("applyCareerFixtureConditionConsequences is deterministic and does not mutate input", () => {
  const first = playerId("player:first");
  const second = playerId("player:second");
  const playerStates = playerStatesFixture({
    [first]: playerStateFixture(83),
    [second]: playerStateFixture(75),
  });
  const before = JSON.stringify(playerStates);
  const input = {
    playerStates,
    selectedStarterIds: [first, second],
    reportPlayerIds: [first, second],
  };

  const firstResult = applyCareerFixtureConditionConsequences(input);
  const secondResult = applyCareerFixtureConditionConsequences(input);

  assert.equal(JSON.stringify(playerStates), before);
  assert.deepEqual(firstResult, secondResult);
  assert.equal(firstResult.playerStates[first]?.fitness, 75);
  assert.equal(firstResult.playerStates[second]?.fitness, 67);
});

test("applyCareerFixtureConditionConsequences clamps low fitness at the rule minimum", () => {
  const starter = playerId("player:tired");
  const result = applyCareerFixtureConditionConsequences({
    playerStates: playerStatesFixture({
      [starter]: playerStateFixture(4),
    }),
    selectedStarterIds: [starter],
  });

  assert.equal(result.playerStates[starter]?.fitness, 0);
  assert.deepEqual(result.changes, [
    {
      playerId: starter,
      beforeFitness: 4,
      afterFitness: 0,
      delta: -4,
      started: true,
    },
  ]);
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
