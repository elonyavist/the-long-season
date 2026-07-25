import assert from "node:assert/strict";
import { test } from "vitest";

import { brand } from "../types/brand.ts";
import { clubId, fixtureId, playerContractId, playerId } from "../types/ids.ts";
import { gameDate } from "../value-objects/game-date.ts";
import {
  careerAttentionEventId,
  compareCareerAttentionEvents,
  createCareerAttentionEvent,
  createContractAttentionEvent,
  createMarketAttentionEvent,
  createMatchdayAttentionEvent,
  isUnresolvedCareerAttentionEvent,
} from "./attention.ts";

test("careerAttentionEventId validates namespaced event IDs", () => {
  assert.equal(careerAttentionEventId("attention:matchday:fixture-000003"), "attention:matchday:fixture-000003");
  assert.throws(() => careerAttentionEventId(""), /must not be empty/);
  assert.throws(() => careerAttentionEventId("7"), /integer-like/);
  assert.throws(() => careerAttentionEventId("event:fixture-000003"), /attention:/);
  assert.throws(() => careerAttentionEventId("attention:"), /include a value/);
});

test("matchday attention keeps one identity while readiness blockers change", () => {
  const base = {
    fixtureId: fixtureId("fixture:000003"),
    clubId: clubId("club:perugia"),
    date: gameDate(20_000),
  };
  const incomplete = createMatchdayAttentionEvent({
    ...base,
    blockerKeys: ["missing_saved_lineup", "missing_saved_tactic"],
  });
  const ready = createMatchdayAttentionEvent(base);

  assert.equal(incomplete.id, "attention:matchday:fixture:000003");
  assert.equal(ready.id, incomplete.id);
  assert.equal(incomplete.category, "matchday");
  assert.equal(incomplete.level, "blocking");
  assert.deepEqual(incomplete.blockerKeys, ["missing_saved_lineup", "missing_saved_tactic"]);
  assert.deepEqual(ready.blockerKeys, []);
});

test("matchday attention requires a related fixture", () => {
  assert.throws(
    () =>
      createCareerAttentionEvent({
        id: careerAttentionEventId("attention:matchday:missing-fixture"),
        date: gameDate(20_000),
        category: "matchday",
        level: "blocking",
        reason: "matchday_decision",
      }),
    /reference a fixture/,
  );
});

test("attention sorting uses date, level, then stable ID", () => {
  const first = createMatchdayAttentionEvent({
    fixtureId: fixtureId("fixture:000001"),
    clubId: clubId("club:perugia"),
    date: gameDate(20_000),
  });
  const second = createMatchdayAttentionEvent({
    fixtureId: fixtureId("fixture:000002"),
    clubId: clubId("club:perugia"),
    date: gameDate(20_000),
  });
  const later = createMatchdayAttentionEvent({
    fixtureId: fixtureId("fixture:000003"),
    clubId: clubId("club:perugia"),
    date: gameDate(20_001),
  });

  assert.deepEqual([later, second, first].sort(compareCareerAttentionEvents).map((event) => event.id), [
    "attention:matchday:fixture:000001",
    "attention:matchday:fixture:000002",
    "attention:matchday:fixture:000003",
  ]);
  assert.equal(isUnresolvedCareerAttentionEvent(first), true);
});

test("contract reminder identity is stable and its explicit policy does not stop Continue", () => {
  const reminder = createContractAttentionEvent({
    contractId: playerContractId("contract:attention-01"),
    clubId: clubId("club:perugia"),
    playerId: playerId("player:attention-01"),
    date: gameDate(20_000),
    level: "important",
    reason: "contract_reminder",
    continuePolicy: "never",
  });

  assert.equal(
    reminder.id,
    "attention:contract:contract_reminder:contract:attention-01",
  );
  assert.equal(reminder.continuePolicy, "never");
  assert.equal(isUnresolvedCareerAttentionEvent(reminder), false);
});

test("market attention event identity is stable and requires negotiation reference", () => {
  const event = createMarketAttentionEvent({
    transferNegotiationId: brand("transfer:attention-01"),
    clubId: clubId("club:perugia"),
    playerId: playerId("player:attention-01"),
    date: gameDate(20_000),
    level: "blocking",
    reason: "market_club_counteroffer",
    continuePolicy: "until_resolved",
  });

  assert.equal(
    event.id,
    "attention:market:market_club_counteroffer:transfer:attention-01",
  );
  assert.equal(event.category, "market");
  assert.equal(event.continuePolicy, "until_resolved");
  assert.equal(isUnresolvedCareerAttentionEvent(event), true);

  assert.throws(
    () =>
      createCareerAttentionEvent({
        id: careerAttentionEventId("attention:market:invalid"),
        date: gameDate(20_000),
        category: "market",
        level: "blocking",
        reason: "market_club_counteroffer",
      }),
    /Market attention must reference a transfer negotiation or preliminary agreement/,
  );
});
