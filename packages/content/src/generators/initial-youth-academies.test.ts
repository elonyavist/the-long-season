import assert from "node:assert/strict";
import { test } from "vitest";

import {
  PLAYER_ABILITY_KEYS,
  PLAYER_ROLES,
  clubId,
  gameDate,
  getPlayerRoleProfile,
  hardCapForRoleAbility,
  isPotentialAtLeastCurrent,
  readPlayerAbility,
  roleCurrentAbility,
  rolePotentialAbility,
  seasonId,
  type ClubId,
  type Player,
} from "@game/domain";
import { completedCivilYears, fromISO } from "@game/shared";

import { playerRatingScale } from "../balance/player-economy-calibration.ts";
import {
  generateInitialYouthAcademies,
  generateSeasonalYouthIntakePlayers,
  initialYouthPlayerId,
  INITIAL_YOUTH_PLAYERS_PER_CLUB,
  YOUTH_ACADEMY_DEPARTMENT_PLAN,
} from "./initial-youth-academies.ts";
import {
  openingCompetitiveTierForClubRank,
  type OpeningPlayerGenerationClubContext,
  type PlayerGenerationClubTier,
} from "./player-generation-bands.ts";
import type { GeneratedPlayerArchetypeKey } from "./player-archetypes.ts";
import {
  contextualProspectClassForArchetype,
  type ContextualProspectClass,
} from "./player-potential-rarity.ts";
import { ContextualProspectJointProfileError } from "./player-prospect-joint-profile.ts";
import { primaryRoleForPosition } from "./player-role-identity.ts";
import { routineYouthStationaryRunwayTarget } from "./routine-youth-stationary-runway.ts";

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

test("a real generated division reaches all roles and balances every flank", () => {
  const result = generateInitialYouthAcademies(divisionInput("academy-role-continuity"));
  const players = result.playerIds.map((id) => result.players[id]).filter((player) => player !== undefined);

  assert.deepEqual(new Set(players.map((player) => player.primaryRole)), new Set(PLAYER_ROLES));
  const positions = players.flatMap((player) => player.naturalPositions);
  for (const [right, left] of [["rb", "lb"], ["rwb", "lwb"], ["rm", "lm"], ["rw", "lw"]] as const) {
    assert.equal(
      Math.abs(positions.filter((position) => position === right).length - positions.filter((position) => position === left).length) <= 1,
      true,
      `${right}/${left}`,
    );
  }
});

test("generateInitialYouthAcademies is deterministic for the same seed", () => {
  assert.deepEqual(generateInitialYouthAcademies(input("stable-academy")), generateInitialYouthAcademies(input("stable-academy")));
});

test("the routine-youth runway preserves academy identities and current ability while only raising selected ceilings", () => {
  const baseInput = divisionInput("academy-stationary-runway");
  const control = generateInitialYouthAcademies({
    ...baseInput,
    useRoutineYouthStationaryRunway: false,
  });
  const candidate = generateInitialYouthAcademies({
    ...baseInput,
    useRoutineYouthStationaryRunway: true,
  });
  let changedPotentialCount = 0;
  let effectiveAssignmentCount = 0;

  assert.deepEqual(candidate.playerIds, control.playerIds);
  for (const id of control.playerIds) {
    const before = control.players[id];
    const after = candidate.players[id];
    assert.ok(before !== undefined && after !== undefined);
    assert.equal(candidate.playerArchetypes[id], control.playerArchetypes[id]);
    assert.deepEqual(after.abilities, before.abilities);
    assert.deepEqual(after.naturalPositions, before.naturalPositions);
    assert.equal(after.primaryRole, before.primaryRole);
    assert.equal(after.birthDate, before.birthDate);
    const profile = getPlayerRoleProfile(before.primaryRole);
    const beforePotential = Number(rolePotentialAbility(before.potential, profile));
    const afterPotential = Number(rolePotentialAbility(after.potential, profile));
    assert.equal(afterPotential >= beforePotential, true);
    const target = candidate.playerArchetypes[id] === "normal_youth"
      ? routineYouthStationaryRunwayTarget({
          worldSeed: baseInput.worldSeed,
          playerKey: String(id),
          division: "third_division",
          role: before.primaryRole,
        })
      : undefined;
    if (target !== undefined && target > beforePotential) effectiveAssignmentCount += 1;
    if (afterPotential !== beforePotential) changedPotentialCount += 1;
  }

  assert.equal(changedPotentialCount, effectiveAssignmentCount);
  assert.equal(changedPotentialCount > 0, true);
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
    const age = completedCivilYears(Number(player.birthDate), CAREER_START_EPOCH_DAY);
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
      const role = primaryRoleForPosition(position);
      const finishingCap = hardCapForRoleAbility(role, "technical.finishing");
      assert.ok(finishingCap !== undefined);
      assert.equal(
        Number(player.abilities.technical.finishing) <= finishingCap,
        true,
        player.id,
      );
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

test("initial youth serious prospects stay environment-bounded and routine generation never creates rare prodigies", () => {
  let seriousProspectCount = 0;
  let explicitYoungProspectCount = 0;
  let routineYoungPlateauCount = 0;
  for (let index = 0; index < 100; index += 1) {
    const result = generateInitialYouthAcademies(divisionInput(`academy-rarity-${index}`));
    const archetypes = result.playerIds.map((playerId) => result.playerArchetypes[playerId]);
    const seriousProspects = archetypes.filter((archetype) => archetype === "serious_prospect").length;
    const rareProdigies = archetypes.filter((archetype) => archetype === "rare_prodigy").length;
    const ordinaryYouth = archetypes.filter((archetype) => archetype === "normal_youth").length;

    assert.equal(seriousProspects <= 18, true);
    assert.equal(rareProdigies, 0);
    assert.equal(ordinaryYouth > result.playerIds.length / 2, true);
    seriousProspectCount += seriousProspects;

    for (const playerId of result.playerIds) {
      const player = result.players[playerId];
      const archetypeKey = result.playerArchetypes[playerId];
      assert.ok(player !== undefined);
      assert.ok(archetypeKey !== undefined);
      const observation = prospectGapObservation(player, archetypeKey);
      if (observation.prospectClass !== "routine") {
        assert.equal(
          observation.ratingGap >= 1,
          true,
          `${player.id} ${observation.prospectClass} gap ${observation.ratingGap}`,
        );
        explicitYoungProspectCount += 1;
      } else if (observation.ratingGap === 0) {
        routineYoungPlateauCount += 1;
      }
    }
  }
  assert.equal(seriousProspectCount > 0, true);
  assert.equal(explicitYoungProspectCount > 0, true);
  assert.equal(routineYoungPlateauCount > 0, true);
});

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
        [firstClub]: {
          category: "third_division",
          reputation: 10,
          competitiveTier: "title_contender",
        },
        [secondClub]: {
          category: "third_division",
          reputation: 1,
          competitiveTier: "survival",
        },
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
      [firstClub]: {
        category: "third_division",
        reputation: 10,
        competitiveTier: "title_contender",
      },
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
    const age = completedCivilYears(
      Number(generated.player.birthDate),
      CAREER_START_EPOCH_DAY,
    );
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

test("seasonal youth intake responds to the seven-state development environment without creating routine exceptions", () => {
  let adequateProspectCount = 0;
  let veryPoorProspectCount = 0;
  let adequateSeriousCount = 0;
  let veryPoorSeriousCount = 0;
  let explicitYoungProspectCount = 0;

  for (let seedIndex = 0; seedIndex < 100; seedIndex += 1) {
    const baseInput = seasonalInput(`annual-environment-${seedIndex}`);
    const adequate = generateSeasonalYouthIntakePlayers(baseInput);
    const veryPoor = generateSeasonalYouthIntakePlayers({
      ...baseInput,
      clubContext: {
        ...baseInput.clubContext,
        competitiveTier: "survival",
      },
    });

    for (const generated of adequate.generatedPlayers) {
      if (generated.archetypeKey === "good_prospect" || generated.archetypeKey === "serious_prospect") {
        adequateProspectCount += 1;
      }
      if (generated.archetypeKey === "serious_prospect") adequateSeriousCount += 1;
      assert.notEqual(generated.archetypeKey, "rare_prodigy");
      const observation = prospectGapObservation(generated.player, generated.archetypeKey);
      if (observation.prospectClass !== "routine") {
        assert.equal(observation.ratingGap >= 1, true, generated.player.id);
        explicitYoungProspectCount += 1;
      }
    }

    for (const generated of veryPoor.generatedPlayers) {
      if (generated.archetypeKey === "good_prospect" || generated.archetypeKey === "serious_prospect") {
        veryPoorProspectCount += 1;
      }
      if (generated.archetypeKey === "serious_prospect") veryPoorSeriousCount += 1;
      assert.notEqual(generated.archetypeKey, "rare_prodigy");
      const observation = prospectGapObservation(generated.player, generated.archetypeKey);
      if (observation.prospectClass !== "routine") {
        assert.equal(observation.ratingGap >= 1, true, generated.player.id);
        explicitYoungProspectCount += 1;
      }
    }
  }

  assert.equal(adequateProspectCount > veryPoorProspectCount, true);
  assert.equal(adequateSeriousCount > veryPoorSeriousCount, true);
  assert.equal(veryPoorProspectCount > 0, true);
  assert.equal(veryPoorSeriousCount > 0, true);
  assert.equal(explicitYoungProspectCount > 0, true);
});

test("default seasonal youth intake candidate pool can refill a whole academy", () => {
  const result = generateSeasonalYouthIntakePlayers(seasonalInput("full-refill-candidates"));

  assert.equal(result.generatedPlayers.length, YOUTH_ACADEMY_DEPARTMENT_PLAN.length);
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

test("seasonal youth intake applies a potential-six floor only to its world allocation", () => {
  const inputValue = seasonalInput("annual-academy-exception");
  const candidate = generateSeasonalYouthIntakePlayers(inputValue).generatedPlayers[0];
  assert.ok(candidate !== undefined);
  const result = generateSeasonalYouthIntakePlayers({
    ...inputValue,
    potentialSixPlayerIds: [candidate.player.id],
  });
  const exceptional = result.generatedPlayers.filter(({ player }) =>
    Number(rolePotentialAbility(player.potential, getPlayerRoleProfile(player.primaryRole))) >= 17
  );

  assert.deepEqual(exceptional.map(({ player }) => player.id), [candidate.player.id]);
  assert.equal(exceptional[0]?.archetypeKey, "rare_prodigy");
  assert.equal(
    prospectGapObservation(exceptional[0]!.player, exceptional[0]!.archetypeKey).ratingGap >= 1,
    true,
  );
});

test("initial youth academy applies a potential-six floor only to its world allocation", () => {
  const inputValue = input("initial-academy-exception");
  const firstClubId = inputValue.clubIds[0];
  assert.ok(firstClubId !== undefined);
  const forcedId = initialYouthPlayerId(firstClubId, 1);
  const result = generateInitialYouthAcademies({
    ...inputValue,
    potentialSixPlayerIds: [forcedId],
  });
  const exceptional = result.playerIds.filter((playerId) => {
    const player = result.players[playerId];
    return player !== undefined
      && Number(rolePotentialAbility(player.potential, getPlayerRoleProfile(player.primaryRole))) >= 17;
  });

  assert.deepEqual(exceptional, [forcedId]);
  assert.equal(result.playerArchetypes[forcedId], "rare_prodigy");
  assert.equal(
    prospectGapObservation(result.players[forcedId]!, result.playerArchetypes[forcedId]!).ratingGap >= 1,
    true,
  );
});

test("academy roots propagate unsupported rare-prodigy placement as typed failures", () => {
  const firstClub = clubId("club:province-01");
  const openingInput = input("unsupported-opening-academy-prodigy");
  const openingForcedId = initialYouthPlayerId(firstClub, 1);
  assertUnsupportedRarePlacement("survival", () => generateInitialYouthAcademies({
    ...openingInput,
    clubIds: [firstClub],
    clubContexts: {
      [firstClub]: {
        category: "first_division",
        reputation: 1,
        competitiveTier: "survival",
      },
    },
    potentialSixPlayerIds: [openingForcedId],
  }));

  const seasonalBase = seasonalInput("unsupported-seasonal-academy-prodigy");
  const seasonalForcedId = generateSeasonalYouthIntakePlayers(seasonalBase)
    .generatedPlayers[0]?.player.id;
  assert.ok(seasonalForcedId !== undefined);
  assertUnsupportedRarePlacement("mid_table", () => generateSeasonalYouthIntakePlayers({
    ...seasonalBase,
    clubContext: {
      category: "first_division",
      reputation: 1,
      competitiveTier: "mid_table",
    },
    potentialSixPlayerIds: [seasonalForcedId],
  }));
});

/** Returns one role-relative current-to-ceiling observation for a generated youth. */
function prospectGapObservation(
  player: Player,
  archetypeKey: GeneratedPlayerArchetypeKey,
): Readonly<{ prospectClass: ContextualProspectClass; ratingGap: number }> {
  assert.ok(player.primaryRole !== undefined);
  const roleProfile = getPlayerRoleProfile(player.primaryRole);
  const currentRating = ratingForRoleAbility(Number(roleCurrentAbility(
    player.abilities,
    roleProfile,
  )));
  const potentialRating = ratingForRoleAbility(Number(rolePotentialAbility(
    player.potential,
    roleProfile,
  )));
  return {
    prospectClass: contextualProspectClassForArchetype(archetypeKey),
    ratingGap: potentialRating - currentRating,
  };
}

/** Converts one exact role ability through the versioned global rating scale. */
function ratingForRoleAbility(ability: number): number {
  let rating = 1;
  for (const threshold of playerRatingScale.abilityThresholds) {
    if (ability >= threshold.minimumAbilityInclusive) rating = threshold.rating;
  }
  return rating;
}

/** Verifies that one invalid composition decision reaches callers unchanged. */
function assertUnsupportedRarePlacement(
  expectedTier: PlayerGenerationClubTier,
  action: () => unknown,
): void {
  assert.throws(action, (error: unknown) => {
    assert.ok(error instanceof ContextualProspectJointProfileError);
    assert.equal(error.code, "unsupported_rare_prodigy_placement");
    assert.equal(error.context.clubTier, expectedTier);
    return true;
  });
}

function input(worldSeed: string): Parameters<typeof generateInitialYouthAcademies>[0] {
  const firstClub = clubId("club:province-01");
  const secondClub = clubId("club:province-02");

  return {
    worldSeed,
    seasonId: seasonId("season:demo-001"),
    referenceDate: gameDate(CAREER_START_EPOCH_DAY),
    clubIds: [firstClub, secondClub],
    clubContexts: clubContexts([firstClub, secondClub]),
    competitionKeyByClubId: {
      [firstClub]: "competition:test-third",
      [secondClub]: "competition:test-third",
    },
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
    competitionKeyByClubId: Object.fromEntries(
      clubIds.map((clubIdValue) => [clubIdValue, "competition:test-third"]),
    ) as Readonly<Record<ClubId, string>>,
  };
}

function clubContexts(clubIds: readonly ClubId[]): Parameters<typeof generateInitialYouthAcademies>[0]["clubContexts"] {
  const contexts: Partial<Record<ClubId, OpeningPlayerGenerationClubContext>> = {};

  for (let index = 0; index < clubIds.length; index += 1) {
    const clubIdValue = clubIds[index];
    assert.ok(clubIdValue !== undefined);
    contexts[clubIdValue] = {
      category: "third_division",
      reputation: clubIdValue === "club:province-01" ? 8 : 4,
      competitiveTier: openingCompetitiveTierForClubRank(index + 1),
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
      competitiveTier: "title_contender",
    },
    targetPositions: ["gk", "cb", "rb", "rwb", "dm", "cm", "am", "rm", "rw", "st", "lw"],
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
    else if (position === "dm" || position === "cm" || position === "am" || position === "rm" || position === "lm") counts.midfielder += 1;
    else counts.attacker += 1;
  }

  return counts;
}
