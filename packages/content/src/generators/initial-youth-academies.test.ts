import assert from "node:assert/strict";
import { test } from "vitest";

import {
  PLAYER_ABILITY_KEYS,
  clubId,
  gameDate,
  getPlayerRoleProfile,
  isPotentialAtLeastCurrent,
  readPlayerAbility,
  roleCurrentAbility,
  seasonId,
  type ClubId,
} from "@game/domain";
import { fromISO } from "@game/shared";

import {
  generateInitialYouthAcademies,
  generateSeasonalYouthIntakePlayers,
  INITIAL_YOUTH_PLAYERS_PER_CLUB,
  type InitialYouthAcademyClubContext,
  YOUTH_ACADEMY_POSITION_PLAN,
} from "./initial-youth-academies.ts";
import { primaryRoleForPosition } from "./player-role-identity.ts";
import { potentialRarityBudgetForDivision } from "./player-potential-rarity.ts";

const CAREER_START_EPOCH_DAY = fromISO("2026-08-01");

/** Tests for deterministic initial youth academy generation. */

test("generateInitialYouthAcademies creates exactly eleven youth players per club", () => {
  const result = generateInitialYouthAcademies(input("academy-world"));

  assert.equal(result.playerIds.length, 22);
  assert.equal(result.youthAcademyState.clubRosterIds.length, 2);

  for (const rosterId of result.youthAcademyState.clubRosterIds) {
    assert.equal(result.youthAcademyState.clubRosters[rosterId]?.playerIds.length, INITIAL_YOUTH_PLAYERS_PER_CLUB);
  }
});

test("generateInitialYouthAcademies creates the exact department structure", () => {
  const result = generateInitialYouthAcademies(input("academy-shape"));

  for (const rosterId of result.youthAcademyState.clubRosterIds) {
    const roster = result.youthAcademyState.clubRosters[rosterId];
    assert.ok(roster !== undefined);
    assert.deepEqual(departmentCounts(roster.playerIds.map((playerId) => result.players[playerId]?.naturalPositions[0])), {
      goalkeeper: 1,
      defender: 4,
      midfielder: 4,
      attacker: 2,
    });
  }
});

test("generateInitialYouthAcademies is deterministic for the same seed", () => {
  assert.deepEqual(generateInitialYouthAcademies(input("stable-academy")), generateInitialYouthAcademies(input("stable-academy")));
});

test("generateInitialYouthAcademies exposes deterministic youth-development levels", () => {
  const firstClub = clubId("club:province-01");
  const secondClub = clubId("club:province-02");
  const result = generateInitialYouthAcademies(input("academy-development-levels"));

  assert.equal(result.clubYouthDevelopmentLevels[firstClub], 3);
  assert.equal(result.clubYouthDevelopmentLevels[secondClub], 2);
  assert.deepEqual(result.clubYouthDevelopmentLevels, generateInitialYouthAcademies(input("academy-development-levels")).clubYouthDevelopmentLevels);
});

test("generateInitialYouthAcademies changes player identities for different seeds", () => {
  const first = generateInitialYouthAcademies(input("academy-a"));
  const second = generateInitialYouthAcademies(input("academy-b"));
  const firstNames = first.playerIds.map((playerId) => `${first.players[playerId]?.firstName} ${first.players[playerId]?.lastName}`);
  const secondNames = second.playerIds.map((playerId) => `${second.players[playerId]?.firstName} ${second.players[playerId]?.lastName}`);

  assert.notDeepEqual(firstNames, secondNames);
});

test("generateInitialYouthAcademies keeps ages inside the 15..19 range", () => {
  const result = generateInitialYouthAcademies(input("age-academy"));

  for (const playerId of result.playerIds) {
    const player = result.players[playerId];
    assert.ok(player !== undefined);
    const age = Math.floor((CAREER_START_EPOCH_DAY - Number(player.birthDate)) / 365);
    assert.equal(age >= 15, true, player.id);
    assert.equal(age <= 19, true, player.id);
  }
});

test("generateInitialYouthAcademies keeps names varied inside each club", () => {
  const result = generateInitialYouthAcademies(input("name-academy"));

  for (const clubIdValue of result.youthAcademyState.clubRosterIds) {
    const roster = result.youthAcademyState.clubRosters[clubIdValue];
    assert.ok(roster !== undefined);
    const fullNames = roster.playerIds.map((playerId) => `${result.players[playerId]?.firstName} ${result.players[playerId]?.lastName}`);
    const lastNames = roster.playerIds.map((playerId) => result.players[playerId]?.lastName);

    assert.equal(new Set(fullNames).size, fullNames.length);
    assert.equal(new Set(lastNames).size, lastNames.length);
  }
});

test("generateInitialYouthAcademies creates role-coherent lower-division youth players", () => {
  const result = generateInitialYouthAcademies(input("role-academy"));

  for (const playerId of result.playerIds) {
    const player = result.players[playerId];
    assert.ok(player !== undefined);
    const position = player.naturalPositions[0];
    assert.ok(position !== undefined);

    if (position !== "gk") {
      assert.equal(Number(player.abilities.goalkeeping.reflexes) <= 4, true, player.id);
    }

    if (position === "cb" || position === "rb" || position === "lb") {
      assert.equal(Number(player.abilities.technical.finishing) <= 8, true, player.id);
    }
  }
});

test("generateInitialYouthAcademies writes explicit role identity fields", () => {
  const result = generateInitialYouthAcademies(input("academy-role-identity"));

  for (const playerId of result.playerIds) {
    const player = result.players[playerId];
    assert.ok(player !== undefined);
    const position = player.naturalPositions[0];
    assert.ok(position !== undefined);
    const expectedRole = primaryRoleForPosition(position);

    assert.equal(player.primaryRole, expectedRole);
    assert.ok(player.archetype !== undefined);
    assert.deepEqual(player.naturalRoles, [expectedRole]);
    assert.equal(player.roleFamiliarity?.[expectedRole], "natural");
  }
});

test("generateInitialYouthAcademies attaches lifecycle rows to active youth rosters", () => {
  const result = generateInitialYouthAcademies(input("lifecycle-academy"));

  for (const playerId of result.youthAcademyState.playerLifecycleIds) {
    const lifecycle = result.youthAcademyState.playerLifecycle[playerId];
    assert.ok(lifecycle !== undefined);
    assert.equal(lifecycle.status, "academy");
    assert.equal(lifecycle.academyEntrySeasonId, "season:demo-001");
    assert.equal(lifecycle.academyEntryDate, gameDate(CAREER_START_EPOCH_DAY));
  }
});

test("generateInitialYouthAcademies enforces generated scale and potential ordering", () => {
  const result = generateInitialYouthAcademies(input("academy-construction-invariants"));

  assert.equal(new Set(result.playerIds).size, result.playerIds.length);
  for (const playerId of result.playerIds) {
    const player = result.players[playerId];
    assert.ok(player !== undefined);
    assert.equal(isPotentialAtLeastCurrent(player.abilities, player.potential), true, player.id);

    for (const key of PLAYER_ABILITY_KEYS) {
      assert.equal(Number(readPlayerAbility(player.abilities, key)) >= 1, true, `${player.id} current ${key}`);
      assert.equal(Number(readPlayerAbility(player.potential, key)) >= 1, true, `${player.id} potential ${key}`);
    }
  }
});

test("initial youth high and elite potential obey division-wide rarity caps across one hundred worlds", () => {
  const configured = potentialRarityBudgetForDivision("third_division");

  for (let index = 0; index < 100; index += 1) {
    const result = generateInitialYouthAcademies(divisionInput(`academy-rarity-${index}`));
    const archetypes = result.playerIds.map((playerId) => result.playerArchetypes[playerId]);
    const seriousProspects = archetypes.filter((archetype) => archetype === "serious_prospect").length;
    const rareProdigies = archetypes.filter((archetype) => archetype === "rare_prodigy").length;
    const ordinaryYouth = archetypes.filter((archetype) => archetype === "normal_youth").length;

    assert.equal(seriousProspects >= configured.highPerDivision.minInclusive, true);
    assert.equal(seriousProspects <= configured.highPerDivision.maxInclusive, true);
    assert.equal(rareProdigies >= configured.elitePerDivision.minInclusive, true);
    assert.equal(rareProdigies <= configured.elitePerDivision.maxInclusive, true);
    assert.equal(ordinaryYouth > result.playerIds.length / 2, true);
  }
}, 15_000);

test("better academies create more interesting routine prospects without extra high or elite slots", () => {
  let strongAcademyInterestingPlayers = 0;
  let weakAcademyInterestingPlayers = 0;

  for (let index = 0; index < 100; index += 1) {
    const firstClub = clubId("club:province-01");
    const secondClub = clubId("club:province-02");
    const result = generateInitialYouthAcademies({
      ...input(`academy-development-spread-${index}`),
      clubIds: [firstClub, secondClub],
      clubContexts: {
        [firstClub]: { category: "third_division", reputation: 10 },
        [secondClub]: { category: "third_division", reputation: 1 },
      },
    });

    for (const playerId of result.youthAcademyState.clubRosters[firstClub]?.playerIds ?? []) {
      if (result.playerArchetypes[playerId] === "good_prospect") strongAcademyInterestingPlayers += 1;
    }

    for (const playerId of result.youthAcademyState.clubRosters[secondClub]?.playerIds ?? []) {
      if (result.playerArchetypes[playerId] === "good_prospect") weakAcademyInterestingPlayers += 1;
    }
  }

  assert.equal(strongAcademyInterestingPlayers > weakAcademyInterestingPlayers, true);
});

test("third-division level-five academies still generate bounded current ability", () => {
  const firstClub = clubId("club:province-01");
  const result = generateInitialYouthAcademies({
    ...input("bounded-level-five-third-division"),
    clubIds: [firstClub],
    clubContexts: {
      [firstClub]: { category: "third_division", reputation: 10 },
    },
  });

  assert.equal(result.clubYouthDevelopmentLevels[firstClub], 5);

  for (const playerId of result.playerIds) {
    const player = result.players[playerId];
    assert.ok(player !== undefined);
    const profile = getPlayerRoleProfile(player.primaryRole);
    const current = roleCurrentAbility(player.abilities, profile);

    assert.equal(Number(current) < 13.5, true, `${player.id} current role ability ${Number(current)}`);
  }
});

test("generateSeasonalYouthIntakePlayers creates exactly the requested refill positions", () => {
  const targetPositions = ["gk", "cb", "cm", "st"] as const;
  const result = generateSeasonalYouthIntakePlayers({
    ...seasonalInput("annual-intake"),
    targetPositions,
  });

  assert.equal(result.generatedPlayers.length, targetPositions.length);
  assert.equal(result.youthDevelopmentLevel, 3);
  assert.deepEqual(result.generatedPlayers.map((generated) => generated.player.naturalPositions[0]), targetPositions);
});

test("generateSeasonalYouthIntakePlayers creates 15..17 year old players", () => {
  const result = generateSeasonalYouthIntakePlayers(seasonalInput("young-annual-intake"));

  for (const generated of result.generatedPlayers) {
    const age = Math.floor((CAREER_START_EPOCH_DAY - Number(generated.player.birthDate)) / 365);
    assert.equal(age >= 15, true, generated.player.id);
    assert.equal(age <= 17, true, generated.player.id);
  }
});

test("generateSeasonalYouthIntakePlayers is deterministic and avoids routine rare prodigies", () => {
  const inputValue = seasonalInput("stable-annual-intake");
  const result = generateSeasonalYouthIntakePlayers(inputValue);

  assert.deepEqual(result, generateSeasonalYouthIntakePlayers(inputValue));
  assert.equal(result.generatedPlayers.some((generated) => generated.archetypeKey === "rare_prodigy"), false);
  assert.equal(new Set(result.generatedPlayers.map((generated) => generated.player.id)).size, result.generatedPlayers.length);
});

test("default seasonal youth intake candidate pool can refill a whole academy", () => {
  const result = generateSeasonalYouthIntakePlayers(seasonalInput("full-refill-candidates"));

  assert.equal(result.generatedPlayers.length, YOUTH_ACADEMY_POSITION_PLAN.length);
});

test("generateSeasonalYouthIntakePlayers writes explicit role identity fields", () => {
  const result = generateSeasonalYouthIntakePlayers(seasonalInput("annual-role-identity"));

  for (const generated of result.generatedPlayers) {
    const position = generated.player.naturalPositions[0];
    assert.ok(position !== undefined);
    const expectedRole = primaryRoleForPosition(position);

    assert.equal(generated.player.primaryRole, expectedRole);
    assert.deepEqual(generated.player.naturalRoles, [expectedRole]);
    assert.equal(generated.player.roleFamiliarity?.[expectedRole], "natural");
  }
});

function input(worldSeed: string): Parameters<typeof generateInitialYouthAcademies>[0] {
  const firstClub = clubId("club:province-01");
  const secondClub = clubId("club:province-02");

  return {
    worldSeed,
    seasonId: seasonId("season:demo-001"),
    referenceDate: gameDate(CAREER_START_EPOCH_DAY),
    clubIds: [firstClub, secondClub],
    clubContexts: clubContexts([firstClub, secondClub]),
  };
}

function divisionInput(worldSeed: string): Parameters<typeof generateInitialYouthAcademies>[0] {
  const clubIds = Array.from({ length: 18 }, (_, index) =>
    clubId(`club:province-${String(index + 1).padStart(2, "0")}`),
  );

  return {
    worldSeed,
    seasonId: seasonId("season:demo-001"),
    referenceDate: gameDate(CAREER_START_EPOCH_DAY),
    clubIds,
    clubContexts: clubContexts(clubIds),
  };
}

function clubContexts(clubIds: readonly ClubId[]): Parameters<typeof generateInitialYouthAcademies>[0]["clubContexts"] {
  const contexts: Partial<Record<ClubId, InitialYouthAcademyClubContext>> = {};

  for (const clubIdValue of clubIds) {
    contexts[clubIdValue] = {
      category: "third_division",
      reputation: clubIdValue === "club:province-01" ? 8 : 4,
    };
  }

  return contexts as Parameters<typeof generateInitialYouthAcademies>[0]["clubContexts"];
}

function seasonalInput(worldSeed: string): Parameters<typeof generateSeasonalYouthIntakePlayers>[0] {
  return {
    worldSeed,
    seasonId: seasonId("season:demo-002"),
    referenceDate: gameDate(CAREER_START_EPOCH_DAY),
    clubId: clubId("club:province-01"),
    clubContext: {
      category: "third_division",
      reputation: 8,
    },
  };
}

function departmentCounts(positions: readonly (string | undefined)[]): Record<string, number> {
  const counts = {
    goalkeeper: 0,
    defender: 0,
    midfielder: 0,
    attacker: 0,
  };

  for (const position of positions) {
    if (position === "gk") counts.goalkeeper += 1;
    else if (position === "cb" || position === "rb" || position === "lb" || position === "rwb" || position === "lwb") counts.defender += 1;
    else if (position === "dm" || position === "cm" || position === "am") counts.midfielder += 1;
    else counts.attacker += 1;
  }

  return counts;
}
