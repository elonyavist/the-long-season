import assert from "node:assert/strict";
import { test } from "vitest";

import {
  abilityValue,
  nonNegativeMoney,
  type PlayerAbilities,
} from "@game/domain";

import {
  buildCareerMarketTargetCatalog,
  buildCareerMarketTargetDetailView,
  filterCareerMarketTargetRows,
  paginateCareerMarketTargetRows,
  sortCareerMarketTargetRows,
  type CareerMarketTargetDetailInput,
  type CareerMarketTargetFilters,
  type CareerMarketTargetInput,
  type CareerMarketTargetSortKey,
} from "./career-market-target-view.ts";

test("keeps the target catalog light without resolving per-player detail", () => {
  let detailResolutionCount = 0;
  const input = targets();
  const catalog = buildCareerMarketTargetCatalog(targets());
  const lazyCatalog = buildCareerMarketTargetCatalog([
    {
      ...input[0]!,
      resolveDetail: () => {
        detailResolutionCount += 1;
        return detailInput();
      },
    },
    input[1]!,
    {
      ...input[2]!,
      resolveDetail: () => {
        throw new Error("Incomplete statistics source");
      },
    },
  ]);
  const serialized = JSON.stringify(catalog);

  assert.equal(catalog.status, "populated");
  assert.equal(catalog.totalTargetCount, 4);
  assert.equal(catalog.visibleTargetCount, 4);
  assert.equal(detailResolutionCount, 0);
  assert.equal(serialized.includes("attributeGroups"), false);
  assert.equal(serialized.includes("statistics"), false);
  assert.equal(serialized.includes("currentAbility"), false);
  assert.equal(serialized.includes("potentialAbility"), false);
  assert.equal(serialized.includes("reachablePotential"), false);
  const detail = lazyCatalog.resolveDetail("player:one");
  const repeated = lazyCatalog.resolveDetail("player:one");
  assert.equal(detailResolutionCount, 1);
  assert.equal(repeated, detail);
  assert.equal(lazyCatalog.resolveDetail("player:two"), undefined);
  assert.equal(lazyCatalog.resolveDetail("player:three"), undefined);
  assert.equal(lazyCatalog.resolveDetail("player:missing"), undefined);
});

test("builds one exact shared target detail without numeric potential or weak roles", () => {
  const input = targets()[0]!;
  const detail = buildCareerMarketTargetDetailView(
    {
      ...input,
      roleFits: [
        ...input.roleFits,
        { role: "center_back", suitability: "weak" },
      ],
    },
    detailInput(),
  );
  const serialized = JSON.stringify(detail);

  assert.deepEqual(
    detail.roles.map((role) => [role.role, role.suitability]),
    [
      ["attacking_midfielder", "adapted"],
      ["striker", "natural"],
    ],
  );
  assert.deepEqual(detail.attributeGroups.map((group) => group.family), [
    "technical",
    "mental",
    "physical",
  ]);
  assert.equal(detail.attributeGroups[0]?.attributes[0]?.value, 11.25);
  assert.equal(detail.statistics.currentSeason.participation.coverage, "complete");
  assert.equal(detail.statistics.career.events.coverage, "partial");
  assert.equal(
    "saves" in detail.statistics.currentSeason.events,
    false,
  );
  assert.equal(serialized.includes("potentialAbility"), false);
  assert.equal(serialized.includes("reachablePotential"), false);
});

test("uses goalkeeper attributes and goalkeeper-only event facts for a Market detail", () => {
  const detail = buildCareerMarketTargetDetailView(targets()[2]!, detailInput());

  assert.deepEqual(detail.attributeGroups.map((group) => group.family), [
    "goalkeeping",
    "mental",
    "physical",
  ]);
  assert.equal(
    detail.attributeGroups.some((group) => group.family === "technical"),
    false,
  );
  assert.equal("saves" in detail.statistics.currentSeason.events, true);
});

test("uses one shared eight-month boundary for contract-horizon filtering", () => {
  const catalog = buildCareerMarketTargetCatalog(targets());

  assert.equal(
    catalog.rows.find((row) => row.playerId === "player:one")?.contractHorizon,
    "expiring",
  );
  assert.equal(
    catalog.rows.find((row) => row.playerId === "player:two")?.contractHorizon,
    "secure",
  );
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
    [{ sourceTier: "second_division" }, ["player:two"]],
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
    "tier",
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

test("paginates only after full-dataset sorting and clamps shrinking results", () => {
  const base = targets()[0]!;
  const catalog = buildCareerMarketTargetCatalog(
    Array.from({ length: 60 }, (_, index) => ({
      ...base,
      playerId: `player:page-${String(index).padStart(2, "0")}`,
      firstName: "Player",
      lastName: String(index).padStart(2, "0"),
    })),
    {},
    { key: "player", direction: "ascending" },
  );

  const firstPage = paginateCareerMarketTargetRows(catalog.rows, 1);
  const secondPage = paginateCareerMarketTargetRows(catalog.rows, 2);
  const clampedPage = paginateCareerMarketTargetRows(catalog.rows, 99);
  const emptyPage = paginateCareerMarketTargetRows([], 4);

  assert.equal(firstPage.rows.length, 25);
  assert.equal(firstPage.rows[0]?.playerId, "player:page-00");
  assert.equal(firstPage.rows[24]?.playerId, "player:page-24");
  assert.equal(secondPage.rows[0]?.playerId, "player:page-25");
  assert.equal(secondPage.firstVisibleTarget, 26);
  assert.equal(secondPage.lastVisibleTarget, 50);
  assert.equal(clampedPage.currentPage, 3);
  assert.equal(clampedPage.pageCount, 3);
  assert.equal(clampedPage.rows.length, 10);
  assert.equal(clampedPage.firstVisibleTarget, 51);
  assert.equal(clampedPage.lastVisibleTarget, 60);
  assert.deepEqual(emptyPage, {
    rows: [],
    currentPage: 1,
    pageCount: 1,
    pageSize: 25,
    matchingTargetCount: 0,
    firstVisibleTarget: 0,
    lastVisibleTarget: 0,
  });
});

test("sorts half-star assessments with the elite marker above ordinary five stars", () => {
  const input = targets();
  const fiveStarRating = input[1]!.currentRating;
  const catalog = buildCareerMarketTargetCatalog([
    {
      ...input[0]!,
      playerId: "player:half",
      currentRating: { stars: 4.5 },
    },
    {
      ...input[1]!,
      playerId: "player:five",
      currentRating: fiveStarRating,
    },
    {
      ...input[2]!,
      playerId: "player:elite",
      currentRating: { stars: 6 },
    },
  ]);

  assert.deepEqual(
    sortCareerMarketTargetRows(catalog.rows, {
      key: "current_level",
      direction: "ascending",
    }).map((row) => row.playerId),
    ["player:half", "player:five", "player:elite"],
  );
  const projectedFiveStarRating = catalog.rows.find(
    (row) => row.playerId === "player:five",
  )?.currentRating;
  assert.deepEqual(projectedFiveStarRating, fiveStarRating);
  assert.notEqual(projectedFiveStarRating, fiveStarRating);
});

test("ranks a narrow strong projection above a wide elite-upside lottery ticket", () => {
  const input = targets();
  const catalog = buildCareerMarketTargetCatalog([
    {
      ...input[0]!,
      playerId: "player:lottery",
      currentRating: { stars: 2 },
      potentialRange: { p50Stars: 2, upperStars: 6 },
    },
    {
      ...input[1]!,
      playerId: "player:narrow",
      currentRating: { stars: 4 },
      potentialRange: { p50Stars: 4, upperStars: 5.5 },
    },
  ]);

  assert.deepEqual(
    sortCareerMarketTargetRows(catalog.rows, {
      key: "potential_level",
      direction: "descending",
    }).map((row) => row.playerId),
    ["player:narrow", "player:lottery"],
  );
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
        { role: "attacking_midfielder", suitability: "adapted" },
        { role: "striker", suitability: "natural" },
      ],
      condition: 91,
      form: 67,
      morale: 63,
      currentRating: { stars: 3.5 },
      potentialRange: { p50Stars: 3.5, upperStars: 4.5 },
      publicValue: nonNegativeMoney(1_000_000_00),
      currency: "EUR",
      employment: {
        status: "contracted",
        clubId: "club:alfa",
        clubName: "Alfa Calcio",
        competitionId: "competition:first",
        competitionName: "First Division",
        sourceTier: "first_division",
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
      roleFits: [{ role: "center_back", suitability: "natural" }],
      condition: 88,
      form: 58,
      morale: 55,
      currentRating: { stars: 5 },
      potentialRange: { p50Stars: 5, upperStars: 5 },
      publicValue: nonNegativeMoney(4_000_000_00),
      currency: "EUR",
      employment: {
        status: "contracted",
        clubId: "club:beta",
        clubName: "Beta United",
        competitionId: "competition:second",
        competitionName: "Second Division",
        sourceTier: "second_division",
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
      roleFits: [{ role: "goalkeeper", suitability: "natural" }],
      condition: 100,
      form: 60,
      morale: 60,
      currentRating: { stars: 2.5 },
      potentialRange: { p50Stars: 2.5, upperStars: 3.5 },
      publicValue: nonNegativeMoney(500_000_00),
      currency: "EUR",
      employment: { status: "free_agent", sourceTier: "free_agent" },
      availability: "free_agent",
      eligibility: { status: "allowed", action: "submit_free_agent_contract_offer" },
    },
    {
      playerId: "player:four",
      firstName: "Pietro",
      lastName: "Delta",
      age: 27,
      primaryRole: "central_midfielder",
      roleFits: [{ role: "central_midfielder", suitability: "natural" }],
      condition: 85,
      form: 52,
      morale: 49,
      currentRating: { stars: 2.5 },
      potentialRange: { p50Stars: 2.5, upperStars: 3 },
      publicValue: nonNegativeMoney(3_000_000_00),
      currency: "EUR",
      employment: {
        status: "contracted",
        clubId: "club:delta",
        clubName: "Delta 1908",
        competitionId: "competition:third",
        competitionName: "Third Division",
        sourceTier: "third_division",
        contractEndsOnIso: "2028-07-01",
        contractRemainingDays: 700,
      },
      availability: "available",
      eligibility: { status: "blocked", reason: "outside_transfer_window" },
    },
  ];
}

/** Exact current facts resolved only for an opened Market target. */
function detailInput(): CareerMarketTargetDetailInput {
  return {
    currentAbilities: abilities(11.25),
    statistics: {
      currentSeasonId: "season:current",
      currentSeason: {
        starts: 3,
        substituteAppearances: 1,
        appearances: 4,
        minutes: 290,
        averageRating: 7.4,
        goals: 1,
        assists: 2,
        saves: 0,
        participationCoverage: "complete",
        eventCoverage: "complete",
      },
      career: {
        starts: 20,
        substituteAppearances: 5,
        appearances: 25,
        minutes: 1_800,
        averageRating: 7.1,
        goals: 4,
        assists: 6,
        saves: 0,
        participationCoverage: "partial",
        eventCoverage: "partial",
      },
    },
  };
}

/** Deterministic abilities fixture preserving non-half exact decimals. */
function abilities(value: number): PlayerAbilities {
  const score = abilityValue(value);
  return {
    technical: {
      finishing: score,
      passing: score,
      longPassing: score,
      crossing: score,
      dribbling: score,
      technique: score,
      tackling: score,
      penalties: score,
      freeKicks: score,
    },
    physical: {
      pace: score,
      strength: score,
      stamina: score,
      agility: score,
      heading: score,
    },
    mental: {
      positioning: score,
      vision: score,
      anticipation: score,
      composure: score,
      determination: score,
      leadership: score,
    },
    goalkeeping: {
      reflexes: score,
      handling: score,
      rushingOut: score,
      goalkeeperPositioning: score,
      footwork: score,
    },
  };
}
