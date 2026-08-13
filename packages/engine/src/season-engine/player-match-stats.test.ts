import assert from "node:assert/strict";
import { test } from "vitest";

import { fixtureId, MATCH_EVENT_SCHEMA_VERSION, playerId, type MatchReport, type ShotContext } from "@game/domain";

import { computePlayerMatchStats, type PlayerMatchStatRegistration } from "./player-match-stats.ts";

/**
 * Player match-stat tests prove that compact rows are derived from durable
 * match-report events, not from CLI text, aggregate score, or local engine
 * events.
 */

test("derives goals, assists, known shots, shots on target, and saves from durable events", () => {
  const rows = computePlayerMatchStats({
    report: reportWithEvents(),
    playerRegistrations: [
      registration("home", "player:home-scorer"),
      registration("home", "player:home-assist"),
      registration("away", "player:away-scorer"),
      registration("away", "player:away-gk"),
    ],
  });

  assert.deepEqual(rows, [
    {
      playerId: playerId("player:home-scorer"),
      side: "home",
      goals: 1,
      assists: 0,
      shots: 1,
      shotsOnTarget: 1,
      saves: 0,
    },
    {
      playerId: playerId("player:home-assist"),
      side: "home",
      goals: 0,
      assists: 1,
      shots: 0,
      shotsOnTarget: 0,
      saves: 0,
    },
    {
      playerId: playerId("player:home-miss-shooter"),
      side: "home",
      goals: 0,
      assists: 0,
      shots: 1,
      shotsOnTarget: 0,
      saves: 0,
    },
    {
      playerId: playerId("player:home-saved-shooter"),
      side: "home",
      goals: 0,
      assists: 0,
      shots: 1,
      shotsOnTarget: 1,
      saves: 0,
    },
    {
      playerId: playerId("player:away-scorer"),
      side: "away",
      goals: 1,
      assists: 0,
      shots: 1,
      shotsOnTarget: 1,
      saves: 0,
    },
    {
      playerId: playerId("player:away-gk"),
      side: "away",
      goals: 0,
      assists: 0,
      shots: 0,
      shotsOnTarget: 0,
      saves: 1,
    },
    {
      playerId: playerId("player:away-blocked-shooter"),
      side: "away",
      goals: 0,
      assists: 0,
      shots: 1,
      shotsOnTarget: 0,
      saves: 0,
    },
  ]);
});

test("registered zero-stat players stay in side and registration order", () => {
  const rows = computePlayerMatchStats({
    report: reportWithEvents(),
    playerRegistrations: [
      registration("away", "player:away-zero"),
      registration("home", "player:home-zero"),
    ],
  });

  assert.deepEqual(rows, [
    {
      playerId: playerId("player:home-zero"),
      side: "home",
      goals: 0,
      assists: 0,
      shots: 0,
      shotsOnTarget: 0,
      saves: 0,
    },
    {
      playerId: playerId("player:home-assist"),
      side: "home",
      goals: 0,
      assists: 1,
      shots: 0,
      shotsOnTarget: 0,
      saves: 0,
    },
    {
      playerId: playerId("player:home-miss-shooter"),
      side: "home",
      goals: 0,
      assists: 0,
      shots: 1,
      shotsOnTarget: 0,
      saves: 0,
    },
    {
      playerId: playerId("player:home-saved-shooter"),
      side: "home",
      goals: 0,
      assists: 0,
      shots: 1,
      shotsOnTarget: 1,
      saves: 0,
    },
    {
      playerId: playerId("player:home-scorer"),
      side: "home",
      goals: 1,
      assists: 0,
      shots: 1,
      shotsOnTarget: 1,
      saves: 0,
    },
    {
      playerId: playerId("player:away-zero"),
      side: "away",
      goals: 0,
      assists: 0,
      shots: 0,
      shotsOnTarget: 0,
      saves: 0,
    },
    {
      playerId: playerId("player:away-blocked-shooter"),
      side: "away",
      goals: 0,
      assists: 0,
      shots: 1,
      shotsOnTarget: 0,
      saves: 0,
    },
    {
      playerId: playerId("player:away-gk"),
      side: "away",
      goals: 0,
      assists: 0,
      shots: 0,
      shotsOnTarget: 0,
      saves: 1,
    },
    {
      playerId: playerId("player:away-scorer"),
      side: "away",
      goals: 1,
      assists: 0,
      shots: 1,
      shotsOnTarget: 1,
      saves: 0,
    },
  ]);
});

test("contribution sort ranks meaningful stats before side order", () => {
  const rows = computePlayerMatchStats({
    report: reportWithEvents(),
    playerRegistrations: [
      registration("home", "player:home-assist"),
      registration("home", "player:home-scorer"),
      registration("away", "player:away-scorer"),
      registration("away", "player:away-gk"),
    ],
    sortBy: "contribution",
  });

  assert.deepEqual(
    rows.map((row) => row.playerId),
    [
      playerId("player:home-scorer"),
      playerId("player:away-scorer"),
      playerId("player:home-assist"),
      playerId("player:away-gk"),
      playerId("player:home-saved-shooter"),
      playerId("player:home-miss-shooter"),
      playerId("player:away-blocked-shooter"),
    ],
  );
});

test("misses and blocks credit player shot stats when shooter IDs exist", () => {
  const rows = computePlayerMatchStats({
    report: {
      ...reportWithEvents(),
      events: [
        {
          type: "miss",
          shot: shot("home", 7, false),
          shooterPlayerId: playerId("player:home-miss-shooter"),
        },
        {
          type: "block",
          shot: shot("away", 8, false),
          shooterPlayerId: playerId("player:away-blocked-shooter"),
        },
      ],
    },
  });

  assert.deepEqual(rows, [
    {
      playerId: playerId("player:home-miss-shooter"),
      side: "home",
      goals: 0,
      assists: 0,
      shots: 1,
      shotsOnTarget: 0,
      saves: 0,
    },
    {
      playerId: playerId("player:away-blocked-shooter"),
      side: "away",
      goals: 0,
      assists: 0,
      shots: 1,
      shotsOnTarget: 0,
      saves: 0,
    },
  ]);
});

test("non-goal shot events without shooter IDs stay ignored for shot stats", () => {
  const rows = computePlayerMatchStats({
    report: {
      ...reportWithEvents(),
      events: [
        {
          type: "miss",
          shot: shot("home", 7, false),
        },
        {
          type: "block",
          shot: shot("away", 8, false),
        },
      ],
    },
  });

  assert.deepEqual(rows, []);
});

/**
 * Builds a player registration for one match side.
 */
function registration(side: "home" | "away", playerValue: string): PlayerMatchStatRegistration {
  return {
    side,
    playerId: playerId(playerValue),
  };
}

/**
 * Builds one durable report with every event type currently supporting player stats.
 */
function reportWithEvents(): MatchReport {
  return {
    eventSchemaVersion: MATCH_EVENT_SCHEMA_VERSION,
    fixtureId: fixtureId("fixture:player-match-stats"),
    finalMinute: 90,
    score: {
      home: 1,
      away: 1,
    },
    stats: {
      home: {
        opportunities: 3,
        shots: 3,
        shotsOnTarget: 2,
        goals: 1,
      },
      away: {
        opportunities: 2,
        shots: 2,
        shotsOnTarget: 1,
        goals: 1,
      },
    },
    events: [
      {
        type: "goal",
        shot: shot("home", 10, true),
        scorerPlayerId: playerId("player:home-scorer"),
        assistPlayerId: playerId("player:home-assist"),
      },
      {
        type: "save",
        shot: shot("home", 33, true),
        shooterPlayerId: playerId("player:home-saved-shooter"),
        goalkeeperPlayerId: playerId("player:away-gk"),
      },
      {
        type: "goal",
        shot: shot("away", 54, true),
        scorerPlayerId: playerId("player:away-scorer"),
      },
      {
        type: "miss",
        shot: shot("home", 70, false),
        shooterPlayerId: playerId("player:home-miss-shooter"),
      },
      {
        type: "block",
        shot: shot("away", 76, false),
        shooterPlayerId: playerId("player:away-blocked-shooter"),
      },
    ],
    tacticalContext: {
      home: { formation: "4-3-3", lateralFocus: "balanced" },
      away: { formation: "4-4-2", lateralFocus: "balanced" },
      commands: [],
    },
  };
}

/**
 * Builds a durable shot context for one report event.
 */
function shot(side: "home" | "away", minute: number, isShotOnTarget: boolean): ShotContext {
  return {
    minute,
    side,
    quality: 0.75,
    expectedGoals: 0.56,
    isShotOnTarget,
    shotType: "normal",
    chanceType: "open_play",
  };
}
