import assert from "node:assert/strict";
import { test } from "vitest";

import { createFakeLeagueSystem } from "./league-system.ts";

test("generated senior squads give every owned player one unique registration and active contract", () => {
  const league = createFakeLeagueSystem({ worldSeed: "senior-contract-world" });
  const state = league.seniorSquadState;

  assert.equal(state.registrationIds.length, league.playerIds.length);
  assert.equal(state.contractIds.length, league.playerIds.length);
  assert.equal(state.activeContractIds.length, league.playerIds.length);
  assert.equal(state.contractHistoryEntryIds.length, league.playerIds.length);

  for (const clubId of league.clubIds) {
    const shirts = state.registrationIds
      .map((id) => state.registrations[id])
      .filter((registration) => registration?.clubId === clubId)
      .map((registration) => registration!.shirtNumber);
    assert.equal(new Set(shirts).size, league.clubsById[clubId]?.playerIds.length);
    assert.equal(shirts.every((number) => number >= 1 && number <= 99), true);
  }
});

test("initial senior contracts are deterministic and role-valid", () => {
  const first = createFakeLeagueSystem({ worldSeed: "stable-contract-world" }).seniorSquadState;
  const second = createFakeLeagueSystem({ worldSeed: "stable-contract-world" }).seniorSquadState;
  assert.deepEqual(first, second);

  for (const contractId of first.contractIds) {
    const contract = first.contracts[contractId];
    assert.ok(contract !== undefined);
    assert.equal(contract.annualWage > 0, true);
    assert.equal(contract.endsOn > contract.startsOn, true);
    assert.equal(contract.bonuses.appearanceBonus > 0, true);
    if (String(contract.playerId).endsWith("-01") || String(contract.playerId).endsWith("-12")) {
      assert.equal(contract.bonuses.goalBonus, undefined);
      assert.equal((contract.bonuses.cleanSheetBonus ?? 0) > 0, true);
    }
  }
});

test("generated contract policy produces credible third-division distributions", () => {
  const state = createFakeLeagueSystem({ worldSeed: "contract-distribution-world" }).seniorSquadState;
  const annualWages = state.activeContractIds.map((id) => state.contracts[id]!.annualWage);
  const statuses = new Set(state.activeContractIds.map((id) => state.contracts[id]!.squadStatus));
  const durations = state.activeContractIds.map((id) => state.contracts[id]!.endsOn - state.contracts[id]!.startsOn);

  assert.equal(Math.min(...annualWages) >= 25_000_00, true);
  assert.equal(Math.max(...annualWages) < 2_000_000_00, true);
  assert.equal(Math.min(...durations) >= 365, true);
  assert.equal(statuses.has("key_player"), true);
  assert.equal(statuses.has("regular_starter"), true);
  assert.equal(statuses.has("squad_player"), true);
  assert.equal(statuses.has("fringe_player") || statuses.has("prospect"), true);
});
