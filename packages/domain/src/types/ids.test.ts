import { test } from "vitest";
import assert from "node:assert/strict";

import {
  clubFinanceLedgerEntryId,
  clubId,
  competitionId,
  fixtureId,
  playerContractHistoryEntryId,
  playerContractId,
  playerId,
  saveId,
  seasonId,
  seniorSquadRegistrationId,
} from "./ids.ts";

/**
 * ID tests document the public constructor contract.
 *
 * There is no exported partial ID validator on purpose: callers must choose the
 * specific constructor for the entity type they are creating.
 */
test("ID constructors reject empty and integer-like IDs", () => {
  assert.throws(() => playerId(""), /must not be empty/);
  assert.throws(() => playerId("123"), /integer-like/);
});

test("ID constructors preserve stable string values", () => {
  assert.equal(playerId("player:000001"), "player:000001");
  assert.equal(clubId("club:perugia"), "club:perugia");
  assert.equal(competitionId("competition:ita-3"), "competition:ita-3");
  assert.equal(fixtureId("fixture:000001"), "fixture:000001");
  assert.equal(seasonId("season:2026"), "season:2026");
  assert.equal(saveId("save:demo-001"), "save:demo-001");
  assert.equal(seniorSquadRegistrationId("registration:club-01-player-01"), "registration:club-01-player-01");
  assert.equal(playerContractId("contract:player-01-01"), "contract:player-01-01");
  assert.equal(playerContractHistoryEntryId("contract-history:player-01-01"), "contract-history:player-01-01");
  assert.equal(clubFinanceLedgerEntryId("finance-ledger:000001"), "finance-ledger:000001");
});

test("ID constructors reject values with the wrong namespace prefix", () => {
  assert.throws(() => playerId("p_000001"), /player:/);
  assert.throws(() => clubId("perugia"), /club:/);
  assert.throws(() => competitionId("comp:ita-3"), /competition:/);
  assert.throws(() => fixtureId("fx_000001"), /fixture:/);
  assert.throws(() => seasonId("year-2026"), /season:/);
  assert.throws(() => saveId("demo-001"), /save:/);
  assert.throws(() => seniorSquadRegistrationId("senior:player-01"), /registration:/);
  assert.throws(() => playerContractId("deal:player-01"), /contract:/);
  assert.throws(() => playerContractHistoryEntryId("history:player-01"), /contract-history:/);
  assert.throws(() => clubFinanceLedgerEntryId("ledger:000001"), /finance-ledger:/);
});

test("ID constructors reject empty namespace values", () => {
  assert.throws(() => playerId("player:"), /include a value/);
  assert.throws(() => clubId("club:"), /include a value/);
});
