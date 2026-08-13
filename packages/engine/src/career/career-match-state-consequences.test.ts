import assert from "node:assert/strict";
import { test } from "vitest";

import {
  MATCH_EVENT_SCHEMA_VERSION,
  clubId,
  competitionId,
  fixtureId,
  gameDate,
  playerId,
  seasonId,
  stateValue,
  type ClubId,
  type Fixture,
  type MatchReport,
  type PlayerDynamicState,
  type PlayerId,
  type ShotContext,
} from "@game/domain";

import {
  CareerMatchStateConsequenceError,
  applyCareerMatchStateConsequences,
} from "./career-match-state-consequences.ts";

test("applyCareerMatchStateConsequences is deterministic and does not mutate input", () => {
  const scorer = playerId("player:scorer");
  const assister = playerId("player:assister");
  const unused = playerId("player:unused");
  const home = clubId("club:home");
  const away = clubId("club:away");
  const playerStates = playerStatesFixture({
    [scorer]: playerStateFixture(100, 50, 50),
    [assister]: playerStateFixture(100, 50, 50),
    [unused]: playerStateFixture(100, 50, 50),
  });
  const before = JSON.stringify(playerStates);
  const input = {
    playerStates,
    selectedClubId: home,
    fixture: fixtureFixture(home, away),
    report: reportFixture({
      homeGoals: 1,
      awayGoals: 0,
      events: [
        {
          type: "goal",
          shot: shot("home"),
          scorerPlayerId: scorer,
          assistPlayerId: assister,
        },
      ],
    }),
    selectedStarterIds: [scorer, assister],
  };

  const first = applyCareerMatchStateConsequences(input);
  const second = applyCareerMatchStateConsequences(input);

  assert.equal(JSON.stringify(playerStates), before);
  assert.deepEqual(first, second);
  assert.equal(first.playerStates[unused]?.form, 50);
  assert.equal(first.playerStates[unused]?.morale, 50);
});

test("applyCareerMatchStateConsequences rewards win, clean sheet, goal, and assist within caps", () => {
  const scorer = playerId("player:scorer");
  const assister = playerId("player:assister");
  const goalkeeper = playerId("player:goalkeeper");
  const home = clubId("club:home");
  const away = clubId("club:away");

  const result = applyCareerMatchStateConsequences({
    playerStates: playerStatesFixture({
      [scorer]: playerStateFixture(92, 50, 50),
      [assister]: playerStateFixture(96, 50, 50),
      [goalkeeper]: playerStateFixture(100, 50, 50),
    }),
    selectedClubId: home,
    fixture: fixtureFixture(home, away),
    report: reportFixture({
      homeGoals: 2,
      awayGoals: 0,
      events: [
        { type: "goal", shot: shot("home"), scorerPlayerId: scorer, assistPlayerId: assister },
        { type: "goal", shot: shot("home"), scorerPlayerId: scorer },
        { type: "save", shot: shot("away"), goalkeeperPlayerId: goalkeeper },
        { type: "save", shot: shot("away"), goalkeeperPlayerId: goalkeeper },
      ],
    }),
    selectedStarterIds: [scorer, assister, goalkeeper],
  });

  assert.deepEqual(result.changes, [
    {
      playerId: scorer,
      participantRole: "starter",
      beforeForm: 50,
      afterForm: 55,
      formDelta: 5,
      beforeMorale: 50,
      afterMorale: 54,
      moraleDelta: 4,
      reasonKeys: ["result_win", "team_clean_sheet", "player_goal"],
    },
    {
      playerId: assister,
      participantRole: "starter",
      beforeForm: 50,
      afterForm: 54,
      formDelta: 4,
      beforeMorale: 50,
      afterMorale: 54,
      moraleDelta: 4,
      reasonKeys: ["result_win", "team_clean_sheet", "player_assist"],
    },
    {
      playerId: goalkeeper,
      participantRole: "starter",
      beforeForm: 50,
      afterForm: 53,
      formDelta: 3,
      beforeMorale: 50,
      afterMorale: 54,
      moraleDelta: 4,
      reasonKeys: ["result_win", "team_clean_sheet", "goalkeeper_saves"],
    },
  ]);
  assert.deepEqual(result.summary, {
    changedPlayerCount: 3,
    totalFormDelta: 12,
    totalMoraleDelta: 12,
  });
});

test("applyCareerMatchStateConsequences applies bounded loss and heavy-loss deltas", () => {
  const starter = playerId("player:starter");
  const home = clubId("club:home");
  const away = clubId("club:away");

  const result = applyCareerMatchStateConsequences({
    playerStates: playerStatesFixture({
      [starter]: playerStateFixture(76, 1, 1),
    }),
    selectedClubId: away,
    fixture: fixtureFixture(home, away),
    report: reportFixture({ homeGoals: 4, awayGoals: 0, events: [] }),
    selectedStarterIds: [starter],
  });

  assert.deepEqual(result.changes, [
    {
      playerId: starter,
      participantRole: "starter",
      beforeForm: 1,
      afterForm: 0,
      formDelta: -1,
      beforeMorale: 1,
      afterMorale: 0,
      moraleDelta: -1,
      reasonKeys: ["result_loss", "team_heavy_loss"],
    },
  ]);
});

test("applyCareerMatchStateConsequences leaves drawn starters unchanged when no supported individual fact exists", () => {
  const starter = playerId("player:starter");
  const home = clubId("club:home");
  const away = clubId("club:away");
  const playerStates = playerStatesFixture({
    [starter]: playerStateFixture(84, 50, 50),
  });

  const result = applyCareerMatchStateConsequences({
    playerStates,
    selectedClubId: home,
    fixture: fixtureFixture(home, away),
    report: reportFixture({ homeGoals: 1, awayGoals: 1, events: [] }),
    selectedStarterIds: [starter],
  });

  assert.deepEqual(result.changes, []);
  assert.deepEqual(result.summary, {
    changedPlayerCount: 0,
    totalFormDelta: 0,
    totalMoraleDelta: 0,
  });
  assert.notEqual(result.playerStates, playerStates);
  assert.equal(result.playerStates[starter]?.form, 50);
  assert.equal(result.playerStates[starter]?.morale, 50);
});

test("applyCareerMatchStateConsequences rejects duplicate starters", () => {
  const starter = playerId("player:starter");
  const home = clubId("club:home");
  const away = clubId("club:away");

  assert.throws(
    () =>
      applyCareerMatchStateConsequences({
        playerStates: playerStatesFixture({
          [starter]: playerStateFixture(100, 50, 50),
        }),
        selectedClubId: home,
        fixture: fixtureFixture(home, away),
        report: reportFixture({ homeGoals: 1, awayGoals: 0, events: [] }),
        selectedStarterIds: [starter, starter],
      }),
    (error: unknown) => error instanceof CareerMatchStateConsequenceError && error.code === "duplicate_player_id",
  );
});

function playerStatesFixture(states: Partial<Record<PlayerId, PlayerDynamicState>>): Readonly<Record<PlayerId, PlayerDynamicState>> {
  return states as Readonly<Record<PlayerId, PlayerDynamicState>>;
}

function playerStateFixture(fitness: number, form: number, morale: number): PlayerDynamicState {
  return {
    fitness: stateValue(fitness),
    form: stateValue(form),
    morale: stateValue(morale),
  };
}

function fixtureFixture(homeClubId: ClubId, awayClubId: ClubId): Fixture {
  return {
    id: fixtureId("fixture:test"),
    competitionId: competitionId("competition:test"),
    seasonId: seasonId("season:test"),
    roundNumber: 1,
    date: gameDate(1),
    homeClubId,
    awayClubId,
  };
}

function reportFixture(input: {
  readonly homeGoals: number;
  readonly awayGoals: number;
  readonly events: MatchReport["events"];
}): MatchReport {
  return {
    eventSchemaVersion: MATCH_EVENT_SCHEMA_VERSION,
    fixtureId: fixtureId("fixture:test"),
    finalMinute: 90,
    score: {
      home: input.homeGoals,
      away: input.awayGoals,
    },
    stats: {
      home: {
        opportunities: input.homeGoals,
        shots: input.homeGoals,
        shotsOnTarget: input.homeGoals,
        goals: input.homeGoals,
      },
      away: {
        opportunities: input.awayGoals,
        shots: input.awayGoals,
        shotsOnTarget: input.awayGoals,
        goals: input.awayGoals,
      },
    },
    events: input.events,
    tacticalContext: {
      home: { formation: "4-3-3", lateralFocus: "balanced" },
      away: { formation: "4-4-2", lateralFocus: "balanced" },
      commands: [],
    },
  };
}

function shot(side: "home" | "away"): ShotContext {
  return {
    minute: 12,
    side,
    quality: 0.5,
    expectedGoals: 0.25,
    isShotOnTarget: true,
    shotType: "normal",
    chanceType: "open_play",
  };
}
