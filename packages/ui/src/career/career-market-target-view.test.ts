import assert from "node:assert/strict";
import { test } from "vitest";

import { nonNegativeMoney } from "@game/domain";

import {
  buildCareerMarketTargetCatalog,
  filterCareerMarketTargetRows,
  sortCareerMarketTargetRows,
  type CareerMarketTargetFilters,
  type CareerMarketTargetInput,
  type CareerMarketTargetSortKey,
} from "./career-market-target-view.ts";

test("projects public target facts without exact hidden potential", () => {
  const catalog = buildCareerMarketTargetCatalog(targets());
  const serialized = JSON.stringify({
    rows: catalog.rows,
    details: [...catalog.detailsByPlayerId.values()],
  });

  assert.equal(catalog.status, "populated");
  assert.equal(catalog.totalTargetCount, 4);
  assert.equal(catalog.visibleTargetCount, 4);
  assert.equal(serialized.includes("currentAbility"), false);
  assert.equal(serialized.includes("potentialAbility"), false);
  assert.equal(serialized.includes("reachablePotential"), false);
  assert.deepEqual(
    catalog.detailsByPlayerId.get("player:one")?.roleFits.map((fit) => fit.role),
    ["striker", "attacking_midfielder"],
  );
});

test("uses one shared eight-month boundary for contract-horizon filtering", () => {
  const catalog = buildCareerMarketTargetCatalog(targets());

  assert.equal(catalog.detailsByPlayerId.get("player:one")?.contractHorizon, "expiring");
  assert.equal(catalog.detailsByPlayerId.get("player:two")?.contractHorizon, "secure");
  assert.deepEqual(
    filterCareerMarketTargetRows(catalog.rows, { contractHorizon: "expiring" })
      .map((row) => row.playerId),
    ["player:one"],
  );
});

test("applies every supported target filter to visible output", () => {
  const rows = buildCareerMarketTargetCatalog(targets()).rows;
  const cases: readonly [
    filters: CareerMarketTargetFilters,
    expectedPlayerIds: readonly string[],
  ][] = [
    [{ query: "alfa" }, ["player:one"]],
    [{ query: "beta united" }, ["player:two"]],
    [{ role: "center_back" }, ["player:two"]],
    [{ minimumAge: 26 }, ["player:two", "player:four"]],
    [{ maximumAge: 21 }, ["player:three"]],
    [{ employment: "free_agent" }, ["player:three"]],
    [{ contractHorizon: "secure" }, ["player:two", "player:four"]],
    [{ minimumValue: nonNegativeMoney(3_000_000_00) }, ["player:two", "player:four"]],
    [{ maximumValue: nonNegativeMoney(1_000_000_00) }, ["player:three", "player:one"]],
    [{ eligibility: "actionable" }, ["player:three", "player:one"]],
    [{ eligibility: "blocked" }, ["player:two", "player:four"]],
  ];

  for (const [filters, expectedPlayerIds] of cases) {
    assert.deepEqual(
      filterCareerMarketTargetRows(rows, filters).map((row) => row.playerId),
      expectedPlayerIds,
    );
  }
});

test("sorts every supported column deterministically with stable tie-breakers", () => {
  const rows = buildCareerMarketTargetCatalog(targets()).rows;
  const keys: readonly CareerMarketTargetSortKey[] = [
    "player",
    "club",
    "age",
    "role",
    "current_level",
    "potential_level",
    "value",
    "contract",
    "availability",
    "eligibility",
  ];

  for (const key of keys) {
    const ascending = sortCareerMarketTargetRows(rows, { key, direction: "ascending" })
      .map((row) => row.playerId);
    const repeated = sortCareerMarketTargetRows([...rows].reverse(), {
      key,
      direction: "ascending",
    }).map((row) => row.playerId);
    const descending = sortCareerMarketTargetRows(rows, { key, direction: "descending" })
      .map((row) => row.playerId);

    assert.deepEqual(repeated, ascending, `${key} must ignore input ordering`);
    assert.equal(new Set(ascending).size, rows.length);
    assert.equal(new Set(descending).size, rows.length);
  }
});

test("rejects duplicate targets and invalid public ages", () => {
  const input = targets();

  assert.throws(
    () => buildCareerMarketTargetCatalog([input[0]!, input[0]!]),
    /Duplicate market target/,
  );
  assert.throws(
    () => buildCareerMarketTargetCatalog([{ ...input[0]!, age: 14 }]),
    /age must be an integer of at least 15/,
  );
});

function targets(): readonly CareerMarketTargetInput[] {
  return [
    {
      playerId: "player:one",
      firstName: "Luca",
      lastName: "Alfa",
      age: 24,
      primaryRole: "striker",
      roleFits: [
        { role: "attacking_midfielder", suitability: "adapted", isPrimary: false },
        { role: "striker", suitability: "natural", isPrimary: true },
      ],
      condition: 91,
      form: 67,
      morale: 63,
      currentLevel: "first_team",
      potentialLevel: "leading",
      value: nonNegativeMoney(1_000_000_00),
      currency: "EUR",
      employment: {
        status: "contracted",
        clubId: "club:alfa",
        clubName: "Alfa Calcio",
        contractEndsOnIso: "2027-04-01",
        contractRemainingDays: 243,
      },
      availability: "negotiable",
      eligibility: { status: "allowed", action: "submit_transfer_offer" },
    },
    {
      playerId: "player:two",
      firstName: "Marco",
      lastName: "Beta",
      age: 30,
      primaryRole: "center_back",
      roleFits: [{ role: "center_back", suitability: "natural", isPrimary: true }],
      condition: 88,
      form: 58,
      morale: 55,
      currentLevel: "leading",
      potentialLevel: "leading",
      value: nonNegativeMoney(4_000_000_00),
      currency: "EUR",
      employment: {
        status: "contracted",
        clubId: "club:beta",
        clubName: "Beta United",
        contractEndsOnIso: "2027-04-02",
        contractRemainingDays: 244,
      },
      availability: "not_for_sale",
      eligibility: { status: "blocked", reason: "player_not_for_sale" },
    },
    {
      playerId: "player:three",
      firstName: "Nico",
      lastName: "Gamma",
      age: 20,
      primaryRole: "goalkeeper",
      roleFits: [{ role: "goalkeeper", suitability: "natural", isPrimary: true }],
      condition: 100,
      form: 60,
      morale: 60,
      currentLevel: "squad",
      potentialLevel: "first_team",
      value: nonNegativeMoney(500_000_00),
      currency: "EUR",
      employment: { status: "free_agent" },
      availability: "free_agent",
      eligibility: { status: "allowed", action: "submit_free_agent_contract_offer" },
    },
    {
      playerId: "player:four",
      firstName: "Pietro",
      lastName: "Delta",
      age: 27,
      primaryRole: "central_midfielder",
      roleFits: [{ role: "central_midfielder", suitability: "natural", isPrimary: true }],
      condition: 85,
      form: 52,
      morale: 49,
      currentLevel: "squad",
      potentialLevel: "squad",
      value: nonNegativeMoney(3_000_000_00),
      currency: "EUR",
      employment: {
        status: "contracted",
        clubId: "club:delta",
        clubName: "Delta 1908",
        contractEndsOnIso: "2028-07-01",
        contractRemainingDays: 700,
      },
      availability: "available",
      eligibility: { status: "blocked", reason: "outside_transfer_window" },
    },
  ];
}
