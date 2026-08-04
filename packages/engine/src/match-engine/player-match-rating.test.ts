import assert from "node:assert/strict";
import { test } from "vitest";

import { playerId, type PlayerId } from "@game/domain";

import {
  advancePlayerMatchRatingLedger,
  buildPlayerMatchRatings,
  createPlayerMatchRatingLedger,
  projectPlayerMatchRatings,
  type MatchStepEvent,
  type PlayerMatchRatingRegistration,
} from "../index.ts";

const HOME_SCORER = playerId("player:home-scorer");
const HOME_ASSISTANT = playerId("player:home-assistant");
const HOME_QUIET = playerId("player:home-quiet");
const HOME_WASTEFUL = playerId("player:home-wasteful");
const AWAY_KEEPER = playerId("player:away-keeper");
const AWAY_DEFENDER = playerId("player:away-defender");

test("a goal scorer receives a clear rating lift", () => {
  const rows = buildPlayerMatchRatings({
    events: [
      goalEvent({
        minute: 12,
        scorerPlayerId: HOME_SCORER,
      }),
    ],
    playerRegistrations: registrations(),
  });

  assert.equal(row(rows, HOME_SCORER).goals, 1);
  assert.ok(row(rows, HOME_SCORER).rating > row(rows, HOME_QUIET).rating);
});

test("an assister receives an event-derived rating lift", () => {
  const rows = buildPlayerMatchRatings({
    events: [
      goalEvent({
        minute: 24,
        scorerPlayerId: HOME_SCORER,
        assistPlayerId: HOME_ASSISTANT,
      }),
    ],
    playerRegistrations: registrations(),
  });

  assert.equal(row(rows, HOME_ASSISTANT).assists, 1);
  assert.ok(row(rows, HOME_ASSISTANT).rating > row(rows, HOME_QUIET).rating);
});

test("a goalkeeper with saves improves without fake prose or random noise", () => {
  const rows = buildPlayerMatchRatings({
    events: [
      saveEvent(18, HOME_SCORER, AWAY_KEEPER),
      saveEvent(38, HOME_ASSISTANT, AWAY_KEEPER),
    ],
    playerRegistrations: registrations(),
  });

  assert.equal(row(rows, AWAY_KEEPER).saves, 2);
  assert.ok(row(rows, AWAY_KEEPER).rating > row(rows, HOME_QUIET).rating);
});

test("a quiet registered player stays at the v1 baseline", () => {
  const rows = buildPlayerMatchRatings({
    events: [],
    playerRegistrations: registrations(),
  });

  assert.equal(row(rows, HOME_QUIET).rating, 6);
});

test("repeated poor attacking outcomes do not inflate a player from volume alone", () => {
  const rows = buildPlayerMatchRatings({
    events: [
      missEvent(10, HOME_WASTEFUL),
      missEvent(22, HOME_WASTEFUL),
      blockedEvent(31, HOME_WASTEFUL, AWAY_DEFENDER),
      blockedEvent(42, HOME_WASTEFUL, AWAY_DEFENDER),
    ],
    playerRegistrations: registrations(),
  });

  assert.equal(row(rows, HOME_WASTEFUL).shots, 4);
  assert.equal(row(rows, HOME_WASTEFUL).misses, 2);
  assert.equal(row(rows, HOME_WASTEFUL).blockedShots, 2);
  assert.ok(row(rows, HOME_WASTEFUL).rating < row(rows, HOME_QUIET).rating);
});

test("rating sort is deterministic", () => {
  const first = buildPlayerMatchRatings({
    events: [
      saveEvent(18, HOME_SCORER, AWAY_KEEPER),
      goalEvent({ minute: 54, scorerPlayerId: HOME_SCORER, assistPlayerId: HOME_ASSISTANT }),
    ],
    playerRegistrations: registrations(),
    sortBy: "rating",
  });
  const second = buildPlayerMatchRatings({
    events: [
      saveEvent(18, HOME_SCORER, AWAY_KEEPER),
      goalEvent({ minute: 54, scorerPlayerId: HOME_SCORER, assistPlayerId: HOME_ASSISTANT }),
    ],
    playerRegistrations: registrations(),
    sortBy: "rating",
  });

  assert.deepEqual(first, second);
  assert.equal(first[0]?.playerId, HOME_SCORER);
});

test("the incremental ledger changes only after a meaningful structured fact", () => {
  const initial = createPlayerMatchRatingLedger(registrations());
  const afterEmptyMinute = advancePlayerMatchRatingLedger(initial, []);
  const afterGoal = advancePlayerMatchRatingLedger(
    afterEmptyMinute,
    [goalEvent({ minute: 12, scorerPlayerId: HOME_SCORER })],
  );

  assert.deepEqual(projectPlayerMatchRatings(afterEmptyMinute), projectPlayerMatchRatings(initial));
  assert.ok(
    row(projectPlayerMatchRatings(afterGoal), HOME_SCORER).rating >
      row(projectPlayerMatchRatings(afterEmptyMinute), HOME_SCORER).rating,
  );
});

function registrations(): readonly PlayerMatchRatingRegistration[] {
  return [
    { playerId: HOME_SCORER, side: "home" },
    { playerId: HOME_ASSISTANT, side: "home" },
    { playerId: HOME_QUIET, side: "home" },
    { playerId: HOME_WASTEFUL, side: "home" },
    { playerId: AWAY_KEEPER, side: "away" },
    { playerId: AWAY_DEFENDER, side: "away" },
  ];
}

function row(
  rows: ReturnType<typeof buildPlayerMatchRatings>,
  id: PlayerId,
): ReturnType<typeof buildPlayerMatchRatings>[number] {
  const found = rows.find((candidate) => candidate.playerId === id);

  if (found === undefined) {
    throw new Error(`Missing rating row for ${id}`);
  }

  return found;
}

function goalEvent(input: {
  readonly minute: number;
  readonly scorerPlayerId: PlayerId;
  readonly assistPlayerId?: PlayerId;
}): MatchStepEvent {
  return {
    type: "shot_outcome",
    minute: input.minute,
    side: "home",
    outcome: "goal",
    quality: 0.75,
    isShotOnTarget: true,
    shotType: "normal",
    chanceType: "open_play",
    route: "central",
    scorerPlayerId: input.scorerPlayerId,
    ...(input.assistPlayerId === undefined ? {} : { assistPlayerId: input.assistPlayerId }),
  };
}

function saveEvent(minute: number, shooterPlayerId: PlayerId, goalkeeperPlayerId: PlayerId): MatchStepEvent {
  return {
    type: "shot_outcome",
    minute,
    side: "home",
    outcome: "save",
    quality: 0.58,
    isShotOnTarget: true,
    shotType: "normal",
    chanceType: "open_play",
    route: "central",
    shooterPlayerId,
    goalkeeperPlayerId,
  };
}

function missEvent(minute: number, shooterPlayerId: PlayerId): MatchStepEvent {
  return {
    type: "shot_outcome",
    minute,
    side: "home",
    outcome: "miss",
    quality: 0.46,
    isShotOnTarget: false,
    shotType: "normal",
    chanceType: "open_play",
    route: "central",
    shooterPlayerId,
  };
}

function blockedEvent(minute: number, shooterPlayerId: PlayerId, primaryDefenderPlayerId: PlayerId): MatchStepEvent {
  return {
    type: "shot_outcome",
    minute,
    side: "home",
    outcome: "block",
    quality: 0.41,
    isShotOnTarget: false,
    shotType: "normal",
    chanceType: "open_play",
    route: "central",
    shooterPlayerId,
    primaryDefenderPlayerId,
  };
}
