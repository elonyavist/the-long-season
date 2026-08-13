import assert from "node:assert/strict";
import { test } from "vitest";

import {
  clubId,
  competitionId,
  createCompetitionMatchRules,
  fixtureId,
  gameDate,
  MATCH_EVENT_SCHEMA_VERSION,
  playerId,
  seasonId,
  type Fixture,
  type MatchReport,
} from "@game/domain";

import { applyMatchAvailabilityConsequences, injuryDurationDays } from "./match-availability-consequences.ts";

const FIXTURE: Fixture = {
  id: fixtureId("fixture:discipline"),
  competitionId: competitionId("competition:league"),
  seasonId: seasonId("season:2026"),
  roundNumber: 4,
  date: gameDate(20_100),
  homeClubId: clubId("club:home"),
  awayClubId: clubId("club:away"),
};
const HOME_ONE = playerId("player:home-one");
const HOME_TWO = playerId("player:home-two");
const AWAY_ONE = playerId("player:away-one");
const RULES = createCompetitionMatchRules({
  maximumSubstitutions: 5,
  substitutionWindowLimit: null,
  allowsPlayerReentry: false,
  yellowCardAccumulationThreshold: 5,
  straightRedSuspensionMatches: 3,
  secondYellowSuspensionMatches: 1,
  yellowAccumulationSuspensionMatches: 1,
});

test("completed-match incidents create deterministic durable availability facts", () => {
  const report = reportWithEvents([
    { type: "yellow_card", minute: 12, side: "home", playerId: HOME_ONE },
    { type: "red_card", minute: 64, side: "home", playerId: HOME_TWO },
    { type: "injury", minute: 40, side: "away", playerId: AWAY_ONE, severity: "minor" },
    { type: "injury", minute: 72, side: "away", playerId: AWAY_ONE, severity: "moderate" },
  ]);
  const input = {
    availability: {
      injuries: [],
      suspensions: [],
      yellowCards: [{ competitionId: FIXTURE.competitionId, playerId: HOME_ONE, count: 4 }],
    },
    fixture: FIXTURE,
    report,
    rules: RULES,
    worldSeed: "availability-seed",
    participatingPlayerIds: [HOME_ONE, HOME_TWO, AWAY_ONE],
  } as const;

  const first = applyMatchAvailabilityConsequences(input);
  const repeated = applyMatchAvailabilityConsequences(input);

  assert.deepEqual(first, repeated);
  assert.equal(first.availability.injuries.length, 1);
  assert.equal(first.availability.injuries[0]?.severity, "moderate");
  assert.ok((first.availability.injuries[0]?.unavailableUntil ?? 0) > FIXTURE.date);
  assert.deepEqual(first.availability.suspensions.map(({ playerId: id, reason, remainingMatches }) => ({ id, reason, remainingMatches })), [
    { id: HOME_ONE, reason: "yellow_accumulation", remainingMatches: 1 },
    { id: HOME_TWO, reason: "straight_red", remainingMatches: 3 },
  ]);
  assert.deepEqual(first.availability.yellowCards, []);
  assert.equal(first.consequences.filter((consequence) => consequence.type === "injury").length, 1);
});

test("an existing competition suspension consumes exactly one participating-club fixture", () => {
  const result = applyMatchAvailabilityConsequences({
    availability: {
      injuries: [],
      suspensions: [{
        fixtureId: fixtureId("fixture:red"),
        competitionId: FIXTURE.competitionId,
        playerId: HOME_ONE,
        reason: "straight_red",
        remainingMatches: 2,
      }],
      yellowCards: [],
    },
    fixture: FIXTURE,
    report: reportWithEvents([]),
    rules: RULES,
    worldSeed: "availability-seed",
    participatingPlayerIds: [HOME_ONE, HOME_TWO, AWAY_ONE],
  });

  assert.equal(result.availability.suspensions[0]?.remainingMatches, 1);
  assert.deepEqual(result.consequences, []);
});

test("second yellow creates the configured ban without double-counting the first card", () => {
  const result = applyMatchAvailabilityConsequences({
    availability: { injuries: [], suspensions: [], yellowCards: [] },
    fixture: FIXTURE,
    report: reportWithEvents([
      { type: "yellow_card", minute: 20, side: "home", playerId: HOME_ONE },
      { type: "second_yellow_card", minute: 70, side: "home", playerId: HOME_ONE },
    ]),
    rules: RULES,
    worldSeed: "second-yellow-seed",
    participatingPlayerIds: [HOME_ONE, HOME_TWO, AWAY_ONE],
  });

  assert.deepEqual(result.availability.suspensions, [{
    type: "suspension",
    fixtureId: FIXTURE.id,
    competitionId: FIXTURE.competitionId,
    playerId: HOME_ONE,
    reason: "second_yellow",
    matches: 1,
    remainingMatches: 1,
  }]);
  assert.deepEqual(result.availability.yellowCards, []);
});

test("injury duration bands are bounded and preserve zero-day knocks", () => {
  assert.equal(injuryDurationDays("seed", FIXTURE, HOME_ONE, "knock"), 0);
  assert.ok(injuryDurationDays("seed", FIXTURE, HOME_ONE, "minor") >= 3);
  assert.ok(injuryDurationDays("seed", FIXTURE, HOME_ONE, "moderate") >= 14);
  assert.ok(injuryDurationDays("seed", FIXTURE, HOME_ONE, "serious") >= 60);
});

function reportWithEvents(events: MatchReport["events"]): MatchReport {
  return {
    eventSchemaVersion: MATCH_EVENT_SCHEMA_VERSION,
    fixtureId: FIXTURE.id,
    finalMinute: 90,
    score: { home: 0, away: 0 },
    stats: {
      home: { opportunities: 0, shots: 0, shotsOnTarget: 0, goals: 0 },
      away: { opportunities: 0, shots: 0, shotsOnTarget: 0, goals: 0 },
    },
    events,
    tacticalContext: {
      home: { formation: "4-3-3", lateralFocus: "balanced" },
      away: { formation: "4-4-2", lateralFocus: "balanced" },
      commands: [],
    },
  };
}
