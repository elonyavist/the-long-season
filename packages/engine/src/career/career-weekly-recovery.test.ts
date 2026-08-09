import assert from "node:assert/strict";
import { test } from "vitest";

import {
  abilityValue,
  gameDate,
  playerId,
  stateValue,
  type Player,
  type PlayerDynamicState,
  type PlayerId,
} from "@game/domain";

import { applyCareerWeeklyRecovery } from "./career-weekly-recovery.ts";
import { playerStateCurvesConfigFixture } from "../test-fixtures/player-state-curves-config.ts";

test("applyCareerWeeklyRecovery recovers explicit players by calendar days", () => {
  const selected = playerId("player:selected");
  const rested = playerId("player:rested");
  const playerStates = playerStatesFixture({
    [selected]: playerStateFixture(76),
    [rested]: playerStateFixture(100),
  });

  const result = applyRecovery({
    playerStates,
    playerIds: [selected],
    dayCount: 2,
  });

  assert.equal(result.dayCount, 2);
  assert.equal(result.playerStates[selected]?.fitness, 76 + 24 * 2 / 3.2);
  assert.equal(result.playerStates[rested]?.fitness, 100);
  assert.deepEqual(result.changes, [
    {
      playerId: selected,
      beforeFitness: 76,
      afterFitness: 76 + 24 * 2 / 3.2,
      delta: (76 + 24 * 2 / 3.2) - 76,
      recovered: true,
    },
  ]);
});

test("applyCareerWeeklyRecovery approaches the rule maximum without overshoot", () => {
  const selected = playerId("player:selected");
  const result = applyRecovery({
    playerStates: playerStatesFixture({
      [selected]: playerStateFixture(96),
    }),
    playerIds: [selected],
    dayCount: 2,
  });

  assert.equal(result.playerStates[selected]?.fitness, 96 + 4 * 2 / 3.2);
  assert.deepEqual(result.changes, [
    {
      playerId: selected,
      beforeFitness: 96,
      afterFitness: 96 + 4 * 2 / 3.2,
      delta: (96 + 4 * 2 / 3.2) - 96,
      recovered: true,
    },
  ]);
});

test("applyCareerWeeklyRecovery treats zero or negative days as a no-op summary", () => {
  const selected = playerId("player:selected");
  const playerStates = playerStatesFixture({
    [selected]: playerStateFixture(84),
  });

  const zero = applyRecovery({ playerStates, playerIds: [selected], dayCount: 0 });
  const negative = applyRecovery({ playerStates, playerIds: [selected], dayCount: -3 });

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

  const firstResult = applyRecovery({ playerStates, playerIds, dayCount: 3 });
  const secondResult = applyRecovery({ playerStates, playerIds, dayCount: 3 });

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

  const result = applyRecovery({ playerStates, playerIds: [selected], dayCount: 1 });

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

const RECOVERY_POLICY = playerStateCurvesConfigFixture();

function applyRecovery(input: {
  readonly playerStates: Readonly<Record<PlayerId, PlayerDynamicState>>;
  readonly playerIds: readonly PlayerId[];
  readonly dayCount: number;
}) {
  const currentDate = gameDate(30_000);
  const players: Record<PlayerId, Player> = {};
  for (const id of input.playerIds) players[id] = playerFixture(id, currentDate);
  return applyCareerWeeklyRecovery({
    ...input,
    players,
    currentDate,
    recoveryPolicy: RECOVERY_POLICY,
  });
}

function playerFixture(id: PlayerId, currentDate: ReturnType<typeof gameDate>): Player {
  const value = abilityValue(10);
  const abilities: Player["abilities"] = {
    technical: { finishing: value, passing: value, longPassing: value, crossing: value, dribbling: value, technique: value, tackling: value, penalties: value, freeKicks: value },
    physical: { pace: value, strength: value, stamina: value, agility: value, heading: value },
    mental: { positioning: value, vision: value, anticipation: value, composure: value, determination: value, leadership: value },
    goalkeeping: { reflexes: value, handling: value, rushingOut: value, goalkeeperPositioning: value, footwork: value },
  };
  return {
    id,
    firstName: "Weekly",
    lastName: String(id),
    birthDate: gameDate(Number(currentDate) - Math.round(24 * 365.2425)),
    naturalPositions: ["cm"],
    abilities,
    potential: abilities,
  };
}
