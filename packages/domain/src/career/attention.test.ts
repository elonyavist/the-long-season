import assert from "node:assert/strict";
import { test } from "vitest";

import { clubId, fixtureId } from "../types/ids.ts";
import { gameDate } from "../value-objects/game-date.ts";
import {
  careerAttentionEventId,
  compareCareerAttentionEvents,
  createCareerAttentionEvent,
  createMatchPreparationRequiredEvent,
  createMatchdayReachedEvent,
  isUnresolvedCareerAttentionEvent,
} from "./attention.ts";

test("careerAttentionEventId validates namespaced event IDs", () => {
  assert.equal(careerAttentionEventId("attention:fixture-000003-preparation"), "attention:fixture-000003-preparation");
  assert.throws(() => careerAttentionEventId(""), /must not be empty/);
  assert.throws(() => careerAttentionEventId("7"), /integer-like/);
  assert.throws(() => careerAttentionEventId("event:fixture-000003"), /attention:/);
  assert.throws(() => careerAttentionEventId("attention:"), /include a value/);
});

test("createMatchPreparationRequiredEvent records fixture blockers", () => {
  const event = createMatchPreparationRequiredEvent({
    fixtureId: fixtureId("fixture:000003"),
    clubId: clubId("club:perugia"),
    date: gameDate(20_000),
    blockerKeys: ["missing_saved_lineup", "missing_saved_tactic"],
  });

  assert.equal(event.id, "attention:fixture:000003:preparation");
  assert.equal(event.category, "match_preparation_required");
  assert.equal(event.reason, "missing_match_preparation");
  assert.equal(event.related.fixtureId, "fixture:000003");
  assert.deepEqual(event.blockerKeys, ["missing_saved_lineup", "missing_saved_tactic"]);
});

test("createMatchdayReachedEvent records prepared matchday stop", () => {
  const event = createMatchdayReachedEvent({
    fixtureId: fixtureId("fixture:000003"),
    clubId: clubId("club:perugia"),
    date: gameDate(20_000),
  });

  assert.equal(event.id, "attention:fixture:000003:matchday");
  assert.equal(event.category, "matchday_reached");
  assert.equal(event.reason, "ready_for_matchday");
  assert.equal(event.priority, "important");
});

test("createCareerAttentionEvent validates preparation blockers", () => {
  assert.throws(
    () =>
      createCareerAttentionEvent({
        id: careerAttentionEventId("attention:fixture-000003-preparation"),
        date: gameDate(20_000),
        category: "match_preparation_required",
        priority: "urgent",
        actionRequired: true,
        reason: "missing_match_preparation",
      }),
    /blocker keys/,
  );
});

test("compareCareerAttentionEvents sorts by date then stable ID", () => {
  const later = createMatchdayReachedEvent({
    fixtureId: fixtureId("fixture:000002"),
    clubId: clubId("club:perugia"),
    date: gameDate(20_001),
  });
  const first = createMatchdayReachedEvent({
    fixtureId: fixtureId("fixture:000001"),
    clubId: clubId("club:perugia"),
    date: gameDate(20_000),
  });
  const second = createMatchdayReachedEvent({
    fixtureId: fixtureId("fixture:000002"),
    clubId: clubId("club:perugia"),
    date: gameDate(20_000),
  });

  assert.deepEqual([later, second, first].sort(compareCareerAttentionEvents).map((event) => event.id), [
    "attention:fixture:000001:matchday",
    "attention:fixture:000002:matchday",
    "attention:fixture:000002:matchday",
  ]);
});

test("isUnresolvedCareerAttentionEvent reports action-required events", () => {
  const event = createMatchdayReachedEvent({
    fixtureId: fixtureId("fixture:000003"),
    clubId: clubId("club:perugia"),
    date: gameDate(20_000),
  });

  assert.equal(isUnresolvedCareerAttentionEvent(event), true);
});
