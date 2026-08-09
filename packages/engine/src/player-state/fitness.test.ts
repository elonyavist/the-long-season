import assert from "node:assert/strict";
import {
  gameDate,
  playerId,
  stateValue,
  type Player,
  type PlayerDynamicState,
  type PlayerId,
} from "@game/domain";
import { test } from "vitest";

import {
  DEFAULT_FITNESS_RULES,
  FitnessStateError,
  matchFitnessCostForPlayer,
  recoverFitnessForPlayers,
  spendFitnessForMinutes,
  type FitnessRules,
} from "./fitness.ts";
import {
  playerStateCurvePlayerFixture,
  playerStateCurvesConfigFixture,
} from "../test-fixtures/player-state-curves-config.ts";

/**
 * Fitness helper tests cover pure copy-on-write state transitions only.
 */

test("spendFitnessForMinutes spends one full-match cost at ninety minutes", () => {
  const id = playerId("player:000001");
  const playerStates = states([
    [id, 100],
  ]);

  const nextStates = spendFitnessForMinutes({ playerStates, loads: [{ playerId: id, minutes: 90 }] });

  assert.equal(Number(nextStates[id]?.fitness), 92);
  assert.equal(Number(playerStates[id]?.fitness), 100);
});

test("dated full-match cost rises continuously after thirty and stays capped", () => {
  const currentDate = gameDate(30_000);
  const prime = playerStateCurvePlayerFixture(playerId("player:prime"), 24, 10, currentDate);
  const veteran = playerStateCurvePlayerFixture(playerId("player:veteran"), 33, 10, currentDate);
  const oldest = playerStateCurvePlayerFixture(playerId("player:oldest"), 40, 10, currentDate);

  assert.equal(matchFitnessCostForPlayer(prime, currentDate, RECOVERY_POLICY), 8);
  assert.ok(Math.abs(matchFitnessCostForPlayer(veteran, currentDate, RECOVERY_POLICY) - 15.2) < 0.01);
  assert.equal(matchFitnessCostForPlayer(oldest, currentDate, RECOVERY_POLICY), 20);

  const playerStates = states([[veteran.id, 100]]);
  const spent = spendFitnessForMinutes({
    playerStates,
    loads: [{ playerId: veteran.id, minutes: 45 }],
    players: { [veteran.id]: veteran },
    currentDate,
    loadPolicy: RECOVERY_POLICY,
  });
  assert.ok(Math.abs(Number(spent[veteran.id]?.fitness) - 92.4) < 0.01);
});

test("recoverFitnessForPlayers recovers fitness over calendar days", () => {
  const id = playerId("player:000001");
  const playerStates = states([
    [id, 70],
  ]);

  const nextStates = recover({ playerStates, playerIds: [id], dayCount: 3 });

  assert.equal(Number(nextStates[id]?.fitness), 70 + 30 * 3 / 4.2);
  assert.equal(Number(playerStates[id]?.fitness), 70);
});

test("fitness spend clamps low while nonlinear recovery approaches the maximum", () => {
  const id = playerId("player:000001");
  const rules: FitnessRules = {
    ...DEFAULT_FITNESS_RULES,
    matchFitnessCost: 12,
  };
  const lowStates = states([
    [id, 5],
  ]);
  const highStates = states([
    [id, 98],
  ]);

  const spent = spendFitnessForMinutes({ playerStates: lowStates, loads: [{ playerId: id, minutes: 90 }], rules });
  const recovered = recover({ playerStates: highStates, playerIds: [id], dayCount: 2, rules });

  assert.equal(Number(spent[id]?.fitness), 0);
  assert.equal(Number(recovered[id]?.fitness), 98 + 2 * 2 / 3.2);
  assert.ok(Number(recovered[id]?.fitness) < 100);
});

test("players outside the ordered update list are unchanged", () => {
  const selectedId = playerId("player:000001");
  const restingId = playerId("player:000002");
  const playerStates = states([
    [selectedId, 100],
    [restingId, 60],
  ]);

  const spent = spendFitnessForMinutes({ playerStates, loads: [{ playerId: selectedId, minutes: 90 }] });
  const recovered = recover({ playerStates, playerIds: [selectedId], dayCount: 2 });

  assert.equal(Number(spent[selectedId]?.fitness), 92);
  assert.equal(Number(spent[restingId]?.fitness), 60);
  assert.equal(Number(recovered[selectedId]?.fitness), 100);
  assert.equal(Number(recovered[restingId]?.fitness), 60);
});

test("same fitness input produces identical output", () => {
  const firstId = playerId("player:000001");
  const secondId = playerId("player:000002");
  const playerStates = states([
    [firstId, 80],
    [secondId, 90],
  ]);
  const loads = [
    { playerId: firstId, minutes: 90 },
    { playerId: secondId, minutes: 45 },
  ];

  const first = spendFitnessForMinutes({ playerStates, loads });
  const second = spendFitnessForMinutes({ playerStates, loads });

  assert.deepEqual(first, second);
});

test("fitness helpers reject missing player states", () => {
  const id = playerId("player:000001");
  const missingId = playerId("player:000002");
  const playerStates = states([
    [id, 100],
  ]);

  assert.throws(
    () => spendFitnessForMinutes({ playerStates, loads: [{ playerId: missingId, minutes: 90 }] }),
    (error) => error instanceof FitnessStateError && error.code === "missing_player_state",
  );
  assert.throws(
    () => recover({ playerStates, playerIds: [missingId], dayCount: 1 }),
    (error) => error instanceof FitnessStateError && error.code === "missing_player_state",
  );
});

test("fitness helpers reject duplicate player IDs in one ordered update", () => {
  const id = playerId("player:000001");
  const playerStates = states([
    [id, 100],
  ]);

  assert.throws(
    () => spendFitnessForMinutes({
      playerStates,
      loads: [{ playerId: id, minutes: 30 }, { playerId: id, minutes: 60 }],
    }),
    (error) => error instanceof FitnessStateError && error.code === "duplicate_player_id",
  );
});

test("minute load is zero at zero and strictly increases across reachable samples", () => {
  const id = playerId("player:minute-load");
  const playerStates = states([[id, 100]]);
  const remaining = [0, 30, 60, 90].map((minutes) => Number(spendFitnessForMinutes({
    playerStates,
    loads: [{ playerId: id, minutes }],
  })[id]?.fitness));

  assert.deepEqual(remaining, [100, 100 - 8 / 3, 100 - 16 / 3, 92]);
  assert.ok(remaining[0]! > remaining[1]!);
  assert.ok(remaining[1]! > remaining[2]!);
  assert.ok(remaining[2]! > remaining[3]!);
});

test("spendFitnessForMinutes rejects minutes outside regulation bounds", () => {
  const id = playerId("player:invalid-minutes");
  const playerStates = states([[id, 100]]);
  for (const minutes of [-1, 91, Number.NaN]) {
    assert.throws(
      () => spendFitnessForMinutes({ playerStates, loads: [{ playerId: id, minutes }] }),
      (error) => error instanceof FitnessStateError && error.code === "invalid_minutes",
    );
  }
});

test("recoverFitnessForPlayers rejects non-positive day counts", () => {
  const id = playerId("player:000001");
  const playerStates = states([
    [id, 100],
  ]);

  assert.throws(
    () => recover({ playerStates, playerIds: [id], dayCount: 0 }),
    (error) => error instanceof FitnessStateError && error.code === "invalid_day_count",
  );
});

test("soft age recovery satisfies the frozen materiality bounds", () => {
  const currentDate = gameDate(30_000);
  const readiness = (age: number, physical: number, days = 3): number => {
    const id = playerId(`player:age-${age}-physical-${physical}`);
    return Number(recoverFitnessForPlayers({
      playerStates: states([[id, 92]]),
      playerIds: [id],
      players: { [id]: playerStateCurvePlayerFixture(id, age, physical, currentDate) },
      currentDate,
      recoveryPolicy: RECOVERY_POLICY,
      dayCount: days,
    })[id]?.fitness);
  };

  assert.equal(readiness(18, 10), readiness(24, 10));
  assert.equal(readiness(24, 10), readiness(29, 10));
  const ageDeficitDifference = (100 - readiness(34, 10)) - (100 - readiness(24, 10));
  assert.ok(ageDeficitDifference >= 2 && ageDeficitDifference <= 8);
  for (let age = 18; age < 40; age += 1) {
    assert.ok(Math.abs(readiness(age + 1, 10) - readiness(age, 10)) <= 1);
  }
  assert.ok(readiness(34, 20) > readiness(34, 0));
  assert.ok(readiness(40, 20, 7) >= 95);
});

test("repeated short rest retains more deficit than ordinary weekly spacing", () => {
  const id = playerId("player:rest-spacing");
  const currentDate = gameDate(30_000);
  const player = playerStateCurvePlayerFixture(id, 24, 10, currentDate);
  const run = (restDays: number): number => {
    let playerStates = states([[id, 100]]);
    for (let match = 0; match < 2; match += 1) {
      playerStates = spendFitnessForMinutes({
        playerStates,
        loads: [{ playerId: id, minutes: 90 }],
      });
      playerStates = recoverFitnessForPlayers({
        playerStates,
        playerIds: [id],
        players: { [id]: player },
        currentDate,
        recoveryPolicy: RECOVERY_POLICY,
        dayCount: restDays,
      });
    }
    return Number(playerStates[id]?.fitness);
  };

  assert.ok(run(2) < run(7));
});

/**
 * Builds a deterministic player-state lookup for tests.
 */
function states(entries: readonly (readonly [PlayerId, number])[]): Readonly<Record<PlayerId, PlayerDynamicState>> {
  const playerStates: Record<PlayerId, PlayerDynamicState> = {};

  for (const [id, fitness] of entries) {
    playerStates[id] = {
      fitness: stateValue(fitness),
      form: stateValue(50),
      morale: stateValue(50),
    };
  }

  return playerStates;
}

const RECOVERY_POLICY = playerStateCurvesConfigFixture();

function recover(input: {
  readonly playerStates: Readonly<Record<PlayerId, PlayerDynamicState>>;
  readonly playerIds: readonly PlayerId[];
  readonly dayCount: number;
  readonly rules?: FitnessRules;
}): Readonly<Record<PlayerId, PlayerDynamicState>> {
  const currentDate = gameDate(30_000);
  const players: Record<PlayerId, Player> = {};
  for (const id of input.playerIds) players[id] = playerStateCurvePlayerFixture(id, 24, 10, currentDate);
  return recoverFitnessForPlayers({
    ...input,
    players,
    currentDate,
    recoveryPolicy: RECOVERY_POLICY,
  });
}
