import assert from "node:assert/strict";
import { test } from "vitest";

import {
  clubId,
  fixtureId,
  gameDate,
  playerId,
  seasonId,
  stateValue,
  type PlayerDynamicState,
  type PlayerFixtureParticipationContribution,
  type PlayerId,
  type Player,
} from "@game/domain";

import { applyCareerFixtureConditionConsequences } from "./career-condition-consequences.ts";
import {
  playerStateCurvePlayerFixture,
  playerStateCurvesConfigFixture,
} from "../test-fixtures/player-state-curves-config.ts";

const FIXTURE_DATE = gameDate(30_000);
const PLAYER_STATE_CURVES = playerStateCurvesConfigFixture();

test("applyCareerFixtureConditionConsequences spends fitness from exact minutes", () => {
  const starter = playerId("player:starter");
  const rested = playerId("player:rested");
  const playerStates = playerStatesFixture({
    [starter]: playerStateFixture(100),
    [rested]: playerStateFixture(94),
  });

  const result = applyCareerFixtureConditionConsequences({
    playerStates,
    contributions: [contribution(starter, 60, true)],
    ...conditionFacts([starter, rested]),
    reportPlayerIds: [starter, rested],
  });

  assert.equal(result.playerStates[starter]?.fitness, 100 - 16 / 3);
  assert.equal(result.playerStates[rested]?.fitness, 94);
  assert.deepEqual(result.changes, [
    {
      playerId: starter,
      beforeFitness: 100,
      afterFitness: 100 - 16 / 3,
      delta: (100 - 16 / 3) - 100,
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
    contributions: [contribution(first, 90, true), contribution(second, 30, false)],
    ...conditionFacts([first, second]),
    reportPlayerIds: [first, second],
  };

  const firstResult = applyCareerFixtureConditionConsequences(input);
  const secondResult = applyCareerFixtureConditionConsequences(input);

  assert.equal(JSON.stringify(playerStates), before);
  assert.deepEqual(firstResult, secondResult);
  assert.equal(firstResult.playerStates[first]?.fitness, 75);
  assert.equal(firstResult.playerStates[second]?.fitness, 75 - 8 / 3);
});

test("applyCareerFixtureConditionConsequences clamps low fitness at the rule minimum", () => {
  const starter = playerId("player:tired");
  const result = applyCareerFixtureConditionConsequences({
    playerStates: playerStatesFixture({
      [starter]: playerStateFixture(4),
    }),
    contributions: [contribution(starter, 90, true)],
    ...conditionFacts([starter]),
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

function conditionFacts(playerIds: readonly PlayerId[]): {
  readonly players: Readonly<Record<PlayerId, Player>>;
  readonly fixtureDate: typeof FIXTURE_DATE;
  readonly playerStateCurves: ReturnType<typeof playerStateCurvesConfigFixture>;
} {
  const players: Partial<Record<PlayerId, Player>> = {};
  for (const id of playerIds) {
    players[id] = playerStateCurvePlayerFixture(id, 24, 10, FIXTURE_DATE);
  }
  return {
    players: players as Readonly<Record<PlayerId, Player>>,
    fixtureDate: FIXTURE_DATE,
    playerStateCurves: PLAYER_STATE_CURVES,
  };
}

function contribution(
  player: PlayerId,
  minutes: number,
  started: boolean,
): PlayerFixtureParticipationContribution {
  return {
    fixtureId: fixtureId("fixture:condition"),
    playerId: player,
    clubId: clubId("club:condition"),
    seasonId: seasonId("season:condition"),
    monthKey: "2026-08",
    started,
    substituteAppearance: !started && minutes > 0,
    minutes,
    playedRoleMinutes: minutes === 0 ? {} : { central_midfielder: minutes },
  };
}

function playerStateFixture(fitness: number): PlayerDynamicState {
  return {
    fitness: stateValue(fitness),
    form: stateValue(50),
    morale: stateValue(50),
  };
}
