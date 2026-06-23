import assert from "node:assert/strict";
import { test } from "vitest";

import { clubId, competitionId, fixtureId, gameDate, seasonId, type ClubId, type Fixture } from "@game/domain";

import { continueCareerUntilAttention } from "./continue-career.ts";

test("continueCareerUntilAttention stops immediately on existing unresolved attention", () => {
  const selectedClubId = clubId("club:perugia");
  const firstResult = continueCareerUntilAttention({
    currentDate: gameDate(20_000),
    selectedClubId,
    nextFixture: fixtureFixture(fixtureId("fixture:000003"), gameDate(20_006), selectedClubId),
    preparation: {
      hasSavedLineup: true,
      hasSavedTactic: true,
    },
  });

  const secondResult = continueCareerUntilAttention({
    currentDate: gameDate(20_000),
    selectedClubId,
    nextFixture: fixtureFixture(fixtureId("fixture:000003"), gameDate(20_006), selectedClubId),
    preparation: {
      hasSavedLineup: true,
      hasSavedTactic: true,
    },
    existingAttentionEvents: firstResult.attentionEvents,
  });

  assert.equal(secondResult.stopReason, "existing_attention");
  assert.equal(secondResult.daysAdvanced, 0);
  assert.deepEqual(secondResult.attentionEvents, firstResult.attentionEvents);
});

test("continueCareerUntilAttention stops on missing match preparation", () => {
  const selectedClubId = clubId("club:perugia");
  const result = continueCareerUntilAttention({
    currentDate: gameDate(20_000),
    selectedClubId,
    nextFixture: fixtureFixture(fixtureId("fixture:000003"), gameDate(20_007), selectedClubId),
    preparation: {
      hasSavedLineup: false,
      hasSavedTactic: true,
    },
  });

  assert.equal(result.stopReason, "match_preparation_required");
  assert.equal(result.stopDate, gameDate(20_007));
  assert.equal(result.daysAdvanced, 7);
  assert.equal(result.attentionEvents[0]?.category, "match_preparation_required");
  assert.deepEqual(result.attentionEvents[0]?.blockerKeys, ["missing_saved_lineup"]);
  assert.equal(result.inboxMessages[0]?.titleKey, "career.inbox.title.matchPreparationRequired");
  assert.deepEqual(result.inboxMessages[0]?.actionIds, ["prepare_match"]);
});

test("continueCareerUntilAttention stops on matchday when preparation exists", () => {
  const selectedClubId = clubId("club:perugia");
  const result = continueCareerUntilAttention({
    currentDate: gameDate(20_000),
    selectedClubId,
    nextFixture: fixtureFixture(fixtureId("fixture:000003"), gameDate(20_001), selectedClubId),
    preparation: {
      hasSavedLineup: true,
      hasSavedTactic: true,
    },
  });

  assert.equal(result.stopReason, "matchday_reached");
  assert.equal(result.daysAdvanced, 1);
  assert.equal(result.attentionEvents[0]?.category, "matchday_reached");
  assert.equal(result.inboxMessages[0]?.summaryKey, "career.inbox.summary.matchdayReached");
  assert.deepEqual(result.inboxMessages[0]?.actionIds, ["open_matchday"]);
});

test("continueCareerUntilAttention returns no attention without a next fixture", () => {
  const result = continueCareerUntilAttention({
    currentDate: gameDate(20_000),
    selectedClubId: clubId("club:perugia"),
  });

  assert.equal(result.stopReason, "no_attention");
  assert.equal(result.daysAdvanced, 0);
  assert.deepEqual(result.attentionEvents, []);
  assert.deepEqual(result.inboxMessages, []);
});

test("continueCareerUntilAttention does not mutate input fixtures", () => {
  const selectedClubId = clubId("club:perugia");
  const fixture = fixtureFixture(fixtureId("fixture:000003"), gameDate(20_001), selectedClubId);
  const before = JSON.stringify(fixture);

  continueCareerUntilAttention({
    currentDate: gameDate(20_000),
    selectedClubId,
    nextFixture: fixture,
  });

  assert.equal(JSON.stringify(fixture), before);
});

function fixtureFixture(id: Fixture["id"], date: Fixture["date"], selectedClubId: ClubId): Fixture {
  return {
    id,
    competitionId: competitionId("competition:test"),
    seasonId: seasonId("season:test"),
    roundNumber: 1,
    date,
    homeClubId: clubId("club:pisa"),
    awayClubId: selectedClubId,
  };
}
