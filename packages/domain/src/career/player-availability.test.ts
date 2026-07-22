import assert from "node:assert/strict";
import { test } from "vitest";

import { competitionId, fixtureId, playerId } from "../types/ids.ts";
import { gameDate } from "../value-objects/game-date.ts";
import {
  createCareerPlayerAvailabilityState,
  findCareerFixtureEligibilityBlockers,
  playerUnavailabilityReason,
} from "./player-availability.ts";

test("player availability distinguishes active injuries and competition suspensions", () => {
  const player = playerId("player:availability-01");
  const competition = competitionId("competition:availability-01");
  const state = createCareerPlayerAvailabilityState({
    injuries: [{
      fixtureId: fixtureId("fixture:availability-01"),
      playerId: player,
      severity: "moderate",
      occurredOn: gameDate(20_000),
      unavailableUntil: gameDate(20_014),
    }],
    suspensions: [{
      fixtureId: fixtureId("fixture:availability-01"),
      competitionId: competition,
      playerId: playerId("player:availability-02"),
      reason: "straight_red",
      remainingMatches: 3,
    }],
    yellowCards: [],
  });

  assert.equal(playerUnavailabilityReason(state, player, gameDate(20_014), competition), "injured");
  assert.equal(playerUnavailabilityReason(state, player, gameDate(20_015), competition), undefined);
  assert.equal(
    playerUnavailabilityReason(state, playerId("player:availability-02"), gameDate(20_015), competition),
    "suspended",
  );
});

test("player availability rejects duplicate active injuries", () => {
  const player = playerId("player:availability-01");
  const fixture = fixtureId("fixture:availability-01");
  assert.throws(() => createCareerPlayerAvailabilityState({
    injuries: [
      { fixtureId: fixture, playerId: player, severity: "minor", occurredOn: gameDate(20_000), unavailableUntil: gameDate(20_002) },
      { fixtureId: fixture, playerId: player, severity: "serious", occurredOn: gameDate(20_000), unavailableUntil: gameDate(20_030) },
    ],
    suspensions: [],
    yellowCards: [],
  }), /duplicate active injury/);
});

test("fixture eligibility reports selected players once in manager order without mutating availability", () => {
  const injured = playerId("player:availability-01");
  const suspended = playerId("player:availability-02");
  const available = playerId("player:availability-03");
  const competition = competitionId("competition:availability-01");
  const state = createCareerPlayerAvailabilityState({
    injuries: [{
      fixtureId: fixtureId("fixture:availability-01"),
      playerId: injured,
      severity: "minor",
      occurredOn: gameDate(20_000),
      unavailableUntil: gameDate(20_003),
    }],
    suspensions: [{
      fixtureId: fixtureId("fixture:availability-01"),
      competitionId: competition,
      playerId: suspended,
      reason: "straight_red",
      remainingMatches: 1,
    }],
    yellowCards: [],
  });

  assert.deepEqual(
    findCareerFixtureEligibilityBlockers(
      state,
      [suspended, available, injured, suspended],
      gameDate(20_001),
      competition,
    ),
    [
      { playerId: suspended, reason: "suspended" },
      { playerId: injured, reason: "injured" },
    ],
  );
  assert.deepEqual(
    findCareerFixtureEligibilityBlockers(state, [injured], gameDate(20_004), competition),
    [],
  );
});
