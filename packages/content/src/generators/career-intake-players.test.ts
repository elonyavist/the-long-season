import assert from "node:assert/strict";
import { test } from "vitest";

import {
  CAREER_STATE_SCHEMA_VERSION,
  clubId,
  createCareerState,
  gameDate,
  getPlayerRoleProfile,
  PLAYER_ABILITY_KEYS,
  playerId,
  readPlayerAbility,
  rolePotentialAbility,
  saveId,
  seasonId,
} from "@game/domain";
import { fromISO } from "@game/shared";

import {
  createAnnualWorldIntakeCandidateProviders,
  generateCareerIntakePlayers,
} from "./career-intake-players.ts";
import { createFakeDomesticWorld } from "./domestic-world.ts";
import { primaryRoleForPosition } from "./player-role-identity.ts";

const CAREER_START_EPOCH_DAY = fromISO("2026-08-01");

/** Tests for deterministic career intake generation. */

test("generateCareerIntakePlayers is deterministic for the same seed and season", () => {
  const input = intakeInput("intake-world");

  assert.deepEqual(generateCareerIntakePlayers(input), generateCareerIntakePlayers(input));
});

test("generateCareerIntakePlayers creates young credible lower-division players", () => {
  const result = generateCareerIntakePlayers(intakeInput("young-intake"));

  assert.equal(result.generatedPlayers.length, 6);
  for (const generated of result.generatedPlayers) {
    const age = Math.floor((CAREER_START_EPOCH_DAY - Number(generated.player.birthDate)) / 365);
    assert.equal(age >= 16, true);
    assert.equal(age <= 21, true);
    assert.equal(Number(generated.player.abilities.technical.finishing) <= 12, true);
    assert.equal(generated.archetypeKey === "rare_prodigy", false);
  }
});

test("generateCareerIntakePlayers ages players relative to the supplied career date", () => {
  const referenceDate = gameDate(CAREER_START_EPOCH_DAY + 8 * 365);
  const result = generateCareerIntakePlayers({
    ...intakeInput("dated-intake"),
    referenceDate,
  });

  for (const generated of result.generatedPlayers) {
    const age = Math.floor((Number(referenceDate) - Number(generated.player.birthDate)) / 365);
    assert.equal(age >= 16, true);
    assert.equal(age <= 21, true);
  }
});

test("generateCareerIntakePlayers keeps legacy default date deterministic", () => {
  const result = generateCareerIntakePlayers(intakeInput("legacy-date-intake"));

  for (const generated of result.generatedPlayers) {
    const age = Math.floor((CAREER_START_EPOCH_DAY - Number(generated.player.birthDate)) / 365);
    assert.equal(age >= 16, true);
    assert.equal(age <= 21, true);
  }
});

test("generateCareerIntakePlayers keeps role templates coherent", () => {
  const result = generateCareerIntakePlayers(intakeInput("role-intake"));

  for (const generated of result.generatedPlayers) {
    const position = generated.player.naturalPositions[0];
    assert.ok(position !== undefined);
    if (position !== "gk") {
      assert.equal(Number(generated.player.abilities.goalkeeping.reflexes) <= 4, true, generated.player.id);
    }
    if (position === "cb" || position === "rb" || position === "lb") {
      assert.equal(Number(generated.player.abilities.technical.finishing) <= 8, true, generated.player.id);
    }
  }
});

test("generateCareerIntakePlayers keeps fixed-seed identity facts and uses current-profile policy", () => {
  const result = generateCareerIntakePlayers({
    ...intakeInput("phase74-intake-lock"),
    count: 3,
  });

  assert.deepEqual(
    result.generatedPlayers.map(({ player, archetypeKey }) => ({
      id: player.id,
      name: `${player.firstName} ${player.lastName}`,
      birthDate: Number(player.birthDate),
      position: player.naturalPositions[0],
      archetypeKey,
    })),
    [
      {
        id: "player:intake-perugia-0002-001",
        name: "Davide Trevisan",
        birthDate: 12_892,
        position: "gk",
        archetypeKey: "normal_youth",
      },
      {
        id: "player:intake-perugia-0002-002",
        name: "Youssef Ziani",
        birthDate: 12_752,
        position: "cm",
        archetypeKey: "normal_youth",
      },
      {
        id: "player:intake-perugia-0002-003",
        name: "Luca Bonacina",
        birthDate: 14_333,
        position: "rw",
        archetypeKey: "normal_youth",
      },
    ],
  );

  for (const generated of result.generatedPlayers) {
    for (const key of PLAYER_ABILITY_KEYS) {
      assert.equal(Number(readPlayerAbility(generated.player.abilities, key)) >= 1, true, `${generated.player.id} ${key}`);
    }
    assert.equal(Number(generated.player.abilities.physical.pace) >= 7, true, generated.player.id);
    assert.equal(Number(generated.player.abilities.physical.stamina) >= 7, true, generated.player.id);
  }
});

test("generateCareerIntakePlayers writes explicit role identity fields", () => {
  const result = generateCareerIntakePlayers(intakeInput("career-role-identity"));

  for (const generated of result.generatedPlayers) {
    const position = generated.player.naturalPositions[0];
    assert.ok(position !== undefined);
    const expectedRole = primaryRoleForPosition(position);

    assert.equal(generated.player.primaryRole, expectedRole);
    assert.ok(generated.player.archetype !== undefined);
    assert.deepEqual(generated.player.naturalRoles, [expectedRole]);
    assert.equal(generated.player.roleFamiliarity?.[expectedRole], "natural");
  }
});

test("generateCareerIntakePlayers avoids duplicate full names and surnames inside one batch", () => {
  const result = generateCareerIntakePlayers(intakeInput("name-intake"));
  const fullNames = result.generatedPlayers.map((generated) => `${generated.player.firstName} ${generated.player.lastName}`);
  const lastNames = result.generatedPlayers.map((generated) => generated.player.lastName);

  assert.equal(new Set(fullNames).size, fullNames.length);
  assert.equal(new Set(lastNames).size, lastNames.length);
});

test("generateCareerIntakePlayers applies only explicitly allocated potential-six assignments", () => {
  const forcedId = playerId("player:intake-perugia-0002-001");
  const result = generateCareerIntakePlayers({
    ...intakeInput("annual-world-exception"),
    potentialSixPlayerIds: [forcedId],
  });
  const exceptional = result.generatedPlayers.filter(({ player }) =>
    Number(rolePotentialAbility(player.potential, getPlayerRoleProfile(player.primaryRole))) >= 17
  );

  assert.deepEqual(exceptional.map(({ player }) => player.id), [forcedId]);
  assert.equal(exceptional[0]?.archetypeKey, "rare_prodigy");
});

test("shared annual providers allocate once and generate two to four accepted-ready exceptions per decade", () => {
  const careerState = annualProviderCareerState();
  let allocatedExceptionalCount = 0;

  for (let seasonIndex = 0; seasonIndex < 10; seasonIndex += 1) {
    const providers = createAnnualWorldIntakeCandidateProviders({
      worldSeed: "annual-provider-decade",
      seasonIndex,
      seniorCandidatesPerClub: 1,
    });
    const intakeSeasonId = seasonId(`season:intake-${seasonIndex}`);
    const candidates = providers.createYouthIntakeCandidates({
      careerState,
      seasonId: intakeSeasonId,
      intakeDate: careerState.gameState.calendar.currentDate,
    });
    const diagnostics = providers.diagnostics();

    assert.equal(diagnostics.allocationCallCount, 1);
    assert.equal(diagnostics.allocation.potentialSixPlayerKeys.length <= 1, true);
    assert.deepEqual(
      diagnostics.generatedPotentialSixPlayerIds.map(String),
      diagnostics.allocation.potentialSixPlayerKeys,
    );
    assert.equal(
      diagnostics.generatedPotentialSixPlayerIds.every((id) =>
        candidates.some((candidate) => candidate.player.id === id)
      ),
      true,
    );
    assert.throws(
      () => providers.createYouthIntakeCandidates({
        careerState,
        seasonId: intakeSeasonId,
        intakeDate: careerState.gameState.calendar.currentDate,
      }),
      /already composed/,
    );
    allocatedExceptionalCount +=
      diagnostics.allocation.potentialSixPlayerKeys.length;

    if (seasonIndex === 0) {
      assert.equal(
        providers.createSeniorIntakeCandidates({
          careerState,
          seasonId: intakeSeasonId,
        }).length,
        careerState.gameState.clubIds.length,
      );
    }
  }

  assert.equal(allocatedExceptionalCount >= 2, true);
  assert.equal(allocatedExceptionalCount <= 4, true);
});

function intakeInput(worldSeed: string): Parameters<typeof generateCareerIntakePlayers>[0] {
  return {
    worldSeed,
    seasonId: seasonId("season:0002"),
    clubId: clubId("club:perugia"),
    clubContext: {
      category: "third_division",
      reputation: 5,
    },
    count: 6,
  };
}

function annualProviderCareerState() {
  const world = createFakeDomesticWorld({
    worldSeed: "annual-provider-career",
  });
  const clubRosters = Object.fromEntries(
    world.initialYouthAcademies.youthAcademyState.clubRosterIds.map((id) => [
      id,
      {
        clubId: id,
        playerIds:
          world.initialYouthAcademies.youthAcademyState.clubRosters[id]!
            .playerIds.slice(0, -1),
      },
    ]),
  ) as typeof world.initialYouthAcademies.youthAcademyState.clubRosters;
  const activeYouthIds = new Set(
    Object.values(clubRosters).flatMap((roster) => roster.playerIds),
  );
  const playerLifecycle = Object.fromEntries(
    world.initialYouthAcademies.youthAcademyState.playerLifecycleIds.map((id) => {
      const lifecycle =
        world.initialYouthAcademies.youthAcademyState.playerLifecycle[id]!;
      return [
        id,
        activeYouthIds.has(id)
          ? lifecycle
          : {
              ...lifecycle,
              status: "aged_out" as const,
              statusChangedAt: world.seasonStartDate,
            },
      ];
    }),
  ) as typeof world.initialYouthAcademies.youthAcademyState.playerLifecycle;

  return createCareerState({
    saveId: saveId("save:annual-provider-career"),
    schemaVersion: CAREER_STATE_SCHEMA_VERSION,
    selectedClubId: world.defaultSelectedClubId,
    gameState: {
      meta: {
        seed: "annual-provider-career",
        rngAlgorithmVersion: "sfc32-cyrb128-v1",
        saveSchemaVersion: 1,
        calibrationVersions: world.calibrationVersions,
      },
      calendar: {
        currentDate: world.seasonStartDate,
        currentSeasonId: world.seasonId,
      },
      players: {
        ...world.players,
        ...world.initialYouthAcademies.players,
      },
      playerIds: [
        ...world.playerIds,
        ...world.initialYouthAcademies.playerIds,
      ],
      playerStates: {
        ...world.playerStates,
        ...world.initialYouthAcademies.playerStates,
      },
      clubs: world.clubsById,
      clubIds: world.clubIds,
      fixtures: {},
      fixtureIds: [],
      domesticCompetitionWorld: world.domesticCompetitionWorld,
    },
    youthAcademyState: {
      ...world.initialYouthAcademies.youthAcademyState,
      clubRosters,
      playerLifecycle,
    },
    seniorSquadState: world.seniorSquadState,
    clubFinanceState: world.clubFinanceState,
    transferHistory: [],
  });
}
