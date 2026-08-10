import assert from "node:assert/strict";
import { test } from "vitest";

import {
  maximumReplacementMatching,
  renewalArchitectureOwner,
  type ReplacementMatchingPlayer,
} from "./renewal-architecture-attribution.ts";

test("maximum replacement matching never reuses a player and preserves the maximum cardinality", () => {
  const incumbents = [
    player("incumbent:strong", "club:a", 11),
    player("incumbent:weak", "club:a", 10),
  ];
  const candidates = [
    player("candidate:strong", "club:a", 10.5),
    player("candidate:weak", "club:a", 9.5),
  ];

  assert.deepEqual(maximumReplacementMatching({ incumbents, candidates, sameClub: true }), [
    { incumbentPlayerId: "incumbent:weak", replacementPlayerId: "candidate:weak" },
    { incumbentPlayerId: "incumbent:strong", replacementPlayerId: "candidate:strong" },
  ]);
});

test("local and division matchings answer different replacement questions", () => {
  const incumbent = player("incumbent", "club:a", 10);
  const elsewhere = player("elsewhere", "club:b", 10);

  assert.equal(maximumReplacementMatching({
    incumbents: [incumbent],
    candidates: [elsewhere],
    sameClub: true,
  }).length, 0);
  assert.equal(maximumReplacementMatching({
    incumbents: [incumbent],
    candidates: [elsewhere],
    sameClub: false,
  }).length, 1);
});

test("the preregistered architecture rule reaches every owner and fails missing facts closed", () => {
  const base = {
    openingSeniorLeaderSlotShare: 0.7,
    localReplacementCapacity: 0.2,
    divisionReplacementCapacity: 0.2,
    worldsMeetingMatureAcademyParity: 7,
    annualAcademyMaterialMinuteShare: 0.8,
    reconciliationFailureCount: 0,
  } as const;

  assert.equal(renewalArchitectureOwner({
    ...base,
    localReplacementCapacity: 0.5,
  }), "selection_retention");
  assert.equal(renewalArchitectureOwner({
    ...base,
    divisionReplacementCapacity: 0.5,
  }), "market_distribution");
  assert.equal(renewalArchitectureOwner({
    ...base,
    worldsMeetingMatureAcademyParity: 5,
  }), "academy_realization");
  assert.equal(renewalArchitectureOwner(base), "renewal_supply");
  assert.equal(renewalArchitectureOwner({
    ...base,
    localReplacementCapacity: "not_observed",
  }), "coupled_or_not_attributed");
  assert.equal(renewalArchitectureOwner({
    ...base,
    reconciliationFailureCount: 1,
  }), "coupled_or_not_attributed");
});

function player(
  playerId: string,
  clubId: string,
  currentAbility: number,
): ReplacementMatchingPlayer {
  return {
    playerId,
    clubId,
    role: "striker",
    currentAbility,
  };
}
