import assert from "node:assert/strict";
import { test } from "vitest";

import {
  CAREER_STATE_SCHEMA_VERSION,
  PLAYER_ROLES,
  clubId,
  createCareerState,
  gameDate,
  getPlayerRoleProfile,
  PLAYER_ABILITY_KEYS,
  playerId,
  readPlayerAbility,
  roleCurrentAbility,
  rolePotentialAbility,
  saveId,
  seasonId,
  type CareerState,
  type Player,
  type PlayerId,
  type PlayerPosition,
} from "@game/domain";
import { completedCivilYears, fromISO } from "@game/shared";

import { playerRatingScale } from "../balance/player-economy-calibration.ts";
import {
  createAnnualWorldIntakeCandidateProviders,
  generateCareerIntakePlayers,
  type AnnualWorldActivePlayerStockEntry,
  type AnnualWorldSeniorIntakeCandidate,
} from "./career-intake-players.ts";
import { createFakeDomesticWorld } from "./domestic-world.ts";
import type { GeneratedPlayerArchetypeKey } from "./player-archetypes.ts";
import { openingCompetitiveTierForClubRank } from "./player-generation-bands.ts";
import {
  contextualProspectClassForArchetype,
  type ContextualProspectClass,
} from "./player-potential-rarity.ts";
import { ContextualProspectJointProfileError } from "./player-prospect-joint-profile.ts";
import { primaryRoleForPosition } from "./player-role-identity.ts";
import {
  annualCeilingAssignmentPlayerKeys,
  annualCeilingUnfilledVacancyCount,
} from "./player-rarity-budget.ts";

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

test("career intake gives every explicit young prospect one stored star of room", () => {
  let explicitYoungProspectCount = 0;

  for (let seedIndex = 0; seedIndex < 100; seedIndex += 1) {
    const result = generateCareerIntakePlayers(intakeInput(
      `career-intake-joint-profile-${seedIndex}`,
    ));
    for (const generated of result.generatedPlayers) {
      const age = completedCivilYears(
        Number(generated.player.birthDate),
        CAREER_START_EPOCH_DAY,
      );
      if (age > 20) continue;
      const observation = prospectGapObservation(
        generated.player,
        generated.archetypeKey,
      );
      if (observation.prospectClass !== "routine") {
        assert.equal(
          observation.ratingGap >= 1,
          true,
          `${generated.player.id} ${observation.prospectClass} gap ${observation.ratingGap}`,
        );
        explicitYoungProspectCount += 1;
      }
    }
  }

  assert.equal(explicitYoungProspectCount > 0, true);
});

test("real first-division annual pools reach the authored high-potential budget", () => {
  const seriousCounts: number[] = [];
  const interestingPotentialRatings: number[] = [];

  for (let seedIndex = 0; seedIndex < 7; seedIndex += 1) {
    const worldSeed = `phase81a-serious-prospect-reachability-${seedIndex}`;
    const world = createFakeDomesticWorld({ worldSeed });
    const firstDivisionId = world.domesticCompetitionWorld.competitionIds[0];
    const firstDivision = firstDivisionId === undefined
      ? undefined
      : world.domesticCompetitionWorld.competitions[firstDivisionId];
    assert.ok(firstDivision !== undefined);
    let seriousCount = 0;

    for (let clubIndex = 0; clubIndex < firstDivision.clubIds.length; clubIndex += 1) {
      const currentClubId = firstDivision.clubIds[clubIndex];
      assert.ok(currentClubId !== undefined);
      const club = world.clubsById[currentClubId];
      const tier = openingCompetitiveTierForClubRank(clubIndex + 1);
      const academy = world.initialYouthAcademies.youthAcademyState.clubRosters[currentClubId];
      assert.ok(club !== undefined && tier !== undefined && academy !== undefined);
      const targetPositions = academy.playerIds.slice(0, 3).map((academyPlayerId) => {
        const position = world.initialYouthAcademies.players[academyPlayerId]?.naturalPositions[0];
        assert.ok(position !== undefined);
        return position;
      });
      const generated = generateCareerIntakePlayers({
        worldSeed,
        seasonId: seasonId("season:serious-prospect-reachability"),
        clubId: currentClubId,
        clubContext: {
          category: club.category,
          reputation: club.reputation,
          competitiveTier: tier,
        },
        targetPositions,
      });
      seriousCount += generated.generatedPlayers.filter(
        ({ archetypeKey }) => archetypeKey === "serious_prospect",
      ).length;
      for (const candidate of generated.generatedPlayers) {
        if (candidate.archetypeKey !== "good_prospect") continue;
        interestingPotentialRatings.push(ratingForRoleAbility(Number(rolePotentialAbility(
          candidate.player.potential,
          getPlayerRoleProfile(candidate.player.primaryRole),
        ))));
      }
    }
    seriousCounts.push(seriousCount);
  }

  const meanSeriousCount = seriousCounts.reduce((sum, count) => sum + count, 0)
    / seriousCounts.length;
  assert.equal(seriousCounts.some((count) => count >= 4 && count <= 8), true);
  assert.equal(meanSeriousCount >= 4 && meanSeriousCount <= 8, true, seriousCounts.join(","));
  assert.equal(interestingPotentialRatings.length > 0, true);
  assert.equal(
    interestingPotentialRatings.every((rating) => rating >= 4 && rating <= 4.5),
    true,
  );
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
    targetPositions: ["gk", "cm", "rw"],
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
        birthDate: 12_887,
        position: "gk",
        archetypeKey: "normal_youth",
      },
      {
        id: "player:intake-perugia-0002-002",
        name: "Youssef Ziani",
        birthDate: 12_747,
        position: "cm",
        archetypeKey: "normal_youth",
      },
      {
        id: "player:intake-perugia-0002-003",
        name: "Luca Bonacina",
        birthDate: 14_329,
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
  assert.equal(
    prospectGapObservation(exceptional[0]!.player, exceptional[0]!.archetypeKey).ratingGap >= 1,
    true,
  );
});

test("career intake propagates unsupported rare-prodigy placement as a typed failure", () => {
  const forcedId = playerId("player:intake-perugia-0002-001");

  assert.throws(
    () => generateCareerIntakePlayers({
      ...intakeInput("unsupported-career-intake-prodigy"),
      clubContext: {
        category: "first_division",
        reputation: 1,
        competitiveTier: "survival",
      },
      potentialSixPlayerIds: [forcedId],
    }),
    (error: unknown) => {
      assert.ok(error instanceof ContextualProspectJointProfileError);
      assert.equal(error.code, "unsupported_rare_prodigy_placement");
      assert.equal(error.context.clubTier, "survival");
      return true;
    },
  );
});

test("shared annual providers allocate once and do not inflate a full active stock", () => {
  const careerState = annualProviderCareerState();
  let allocatedExceptionalCount = 0;

  for (let seasonIndex = 0; seasonIndex < 10; seasonIndex += 1) {
    const providers = createAnnualWorldIntakeCandidateProviders({
      worldSeed: "annual-provider-career",
      seasonIndex,
      seniorCandidatesPerClub: 1,
    });
    const intakeSeasonId = seasonId(`season:intake-${seasonIndex}`);
    const candidates = providers.createYouthIntakeCandidates({
      careerState,
      seasonId: intakeSeasonId,
      intakeDate: careerState.gameState.calendar.currentDate,
      activePlayerStock: activePlayerStockFixture(careerState),
    });
    const diagnostics = providers.diagnostics();

    assert.equal(diagnostics.allocationCallCount, 1);
    const potentialSixPlayerKeys = annualCeilingAssignmentPlayerKeys(
      diagnostics.allocation,
      6,
    );
    assert.equal(potentialSixPlayerKeys.length <= 1, true);
    assert.equal(
      diagnostics.allocation.activeYoungPotentialSixCount
        >= diagnostics.allocation.targetActiveYoungPotentialSixCount,
      true,
    );
    assert.equal(annualCeilingUnfilledVacancyCount(diagnostics.allocation, 6), 0);
    assert.deepEqual(
      diagnostics.generatedCeilingAssignments
        .filter(({ minimumRating }) => minimumRating === 6)
        .map(({ playerId }) => String(playerId))
        .toSorted(),
      potentialSixPlayerKeys,
    );
    assert.equal(
      diagnostics.generatedCeilingAssignments.every(({ playerId }) =>
        candidates.some((candidate) => candidate.player.id === playerId)
      ),
      true,
    );
    assert.deepEqual(
      diagnostics.generatedYouthProspectClasses.map(({ playerId }) => playerId),
      candidates.map(({ player }) => player.id),
    );
    assert.equal(
      diagnostics.generatedYouthProspectClasses.every(({ prospectClass }) =>
        ["routine", "interesting", "serious", "rare"].includes(prospectClass)
      ),
      true,
    );
    assert.throws(
      () => providers.createYouthIntakeCandidates({
        careerState,
        seasonId: intakeSeasonId,
        intakeDate: careerState.gameState.calendar.currentDate,
        activePlayerStock: activePlayerStockFixture(careerState),
      }),
      /already composed/,
    );
    allocatedExceptionalCount +=
      potentialSixPlayerKeys.length;

    if (seasonIndex === 0) {
      assert.equal(
        providers.createSeniorIntakeCandidates({
          careerState,
          seasonId: intakeSeasonId,
          intakeDate: careerState.gameState.calendar.currentDate,
        }).length,
        careerState.gameState.clubIds.length,
      );
    }
  }

  assert.equal(allocatedExceptionalCount, 0);
});

test("the annual blueprint seam preserves ordinary output and deterministically restores generic balance", () => {
  const careerState = annualProviderCareerState();
  const providerOutput = (useSquadIdentityRoleBlueprint: boolean | undefined) => {
    const providers = createAnnualWorldIntakeCandidateProviders({
      worldSeed: "annual-blueprint-ablation",
      seasonIndex: 1,
      seniorCandidatesPerClub: 8,
      ...(useSquadIdentityRoleBlueprint === undefined
        ? {}
        : { useSquadIdentityRoleBlueprint }),
    });
    const context = {
      careerState,
      seasonId: seasonId("season:annual-blueprint-ablation"),
      intakeDate: careerState.gameState.calendar.currentDate,
    } as const;
    const academy = providers.createYouthIntakeCandidates({
      ...context,
      activePlayerStock: activePlayerStockFixture(careerState),
    });
    const senior = providers.createSeniorIntakeCandidates(context);
    return {
      academyRoles: academy.map(({ player }) => player.primaryRole),
      seniorRoles: senior.map(({ player }) => player.primaryRole),
      diagnostics: providers.roleContinuityDiagnostics(),
    };
  };

  const ordinary = providerOutput(undefined);
  const explicitOrdinary = providerOutput(true);
  const legacy = providerOutput(false);
  const repeatedLegacy = providerOutput(false);

  assert.deepEqual(explicitOrdinary, ordinary);
  assert.deepEqual(repeatedLegacy, legacy);
  assert.notDeepEqual(legacy.academyRoles, ordinary.academyRoles);
  assert.notDeepEqual(legacy.seniorRoles, ordinary.seniorRoles);
});

test("the annual runway seam changes only selected academy potential", () => {
  const careerState = annualProviderCareerState();
  const run = (useRoutineYouthStationaryRunway: boolean) => {
    const providers = createAnnualWorldIntakeCandidateProviders({
      worldSeed: "annual-runway-seam",
      seasonIndex: 1,
      seniorCandidatesPerClub: 1,
      useRoutineYouthStationaryRunway,
    });
    const context = {
      careerState,
      seasonId: seasonId("season:annual-runway-seam"),
      intakeDate: careerState.gameState.calendar.currentDate,
    } as const;
    const academy = providers.createYouthIntakeCandidates({
      ...context,
      activePlayerStock: activePlayerStockFixture(careerState),
    });
    return {
      academy,
      senior: providers.createSeniorIntakeCandidates(context),
      diagnostics: providers.diagnostics(),
    };
  };
  const control = run(false);
  const candidate = run(true);
  let changedPotentialCount = 0;

  assert.deepEqual(candidate.senior, control.senior);
  assert.deepEqual(
    candidate.diagnostics.generatedCeilingAssignments.filter(
      ({ minimumRating }) => minimumRating === 6,
    ),
    control.diagnostics.generatedCeilingAssignments.filter(
      ({ minimumRating }) => minimumRating === 6,
    ),
  );
  assert.equal(candidate.academy.length, control.academy.length);
  for (let index = 0; index < control.academy.length; index += 1) {
    const before = control.academy[index];
    const after = candidate.academy[index];
    assert.ok(before !== undefined && after !== undefined);
    assert.equal(after.targetClubId, before.targetClubId);
    assert.equal(after.player.id, before.player.id);
    assert.equal(after.player.birthDate, before.player.birthDate);
    assert.equal(after.player.primaryRole, before.player.primaryRole);
    assert.deepEqual(after.player.abilities, before.player.abilities);
    const role = getPlayerRoleProfile(before.player.primaryRole);
    const beforePotential = Number(rolePotentialAbility(before.player.potential, role));
    const afterPotential = Number(rolePotentialAbility(after.player.potential, role));
    assert.equal(afterPotential >= beforePotential, true);
    if (afterPotential !== beforePotential) changedPotentialCount += 1;
  }
  assert.equal(changedPotentialCount > 0, true);
});

test("shared annual providers count a reserved ceiling-six promotion before intake", () => {
  const careerState = annualProviderCareerStateWithExceptionalPromotion();
  const activePlayerStock = activePlayerStockFixture(careerState);
  const reservedPromotion = activePlayerStock.find(
    (entry) => entry.source === "promotion_candidate",
  );
  assert.ok(reservedPromotion !== undefined);
  const reservedPlayer =
    careerState.gameState.players[reservedPromotion.playerId];
  assert.ok(reservedPlayer !== undefined);
  assert.equal(
    storedPrimaryRolePotential(reservedPlayer) >= 17,
    true,
  );

  const providers = createAnnualWorldIntakeCandidateProviders({
    worldSeed: "annual-provider-career",
    seasonIndex: 1,
    seniorCandidatesPerClub: 1,
  });
  providers.createYouthIntakeCandidates({
    careerState,
    seasonId: seasonId("season:promotion-reservation"),
    intakeDate: careerState.gameState.calendar.currentDate,
    activePlayerStock,
  });
  const diagnostics = providers.diagnostics();

  assert.equal(
    diagnostics.allocation.activeYoungPotentialSixCount,
    diagnostics.allocation.targetActiveYoungPotentialSixCount,
  );
  assert.equal(annualCeilingUnfilledVacancyCount(diagnostics.allocation, 6), 0);
  assert.deepEqual(annualCeilingAssignmentPlayerKeys(diagnostics.allocation, 6), []);
  assert.deepEqual(
    diagnostics.generatedCeilingAssignments.filter(
      ({ minimumRating }) => minimumRating === 6,
    ),
    [],
  );
});

test("real annual senior candidate populations sustain all roles in every competition", () => {
  const careerState = annualProviderCareerState();
  const providers = createAnnualWorldIntakeCandidateProviders({
    worldSeed: "annual-role-continuity-world",
    seasonIndex: 1,
    seniorCandidatesPerClub: 8,
  });
  const intakeSeasonId = seasonId("season:annual-role-continuity");
  providers.createYouthIntakeCandidates({
    careerState,
    seasonId: intakeSeasonId,
    intakeDate: careerState.gameState.calendar.currentDate,
    activePlayerStock: activePlayerStockFixture(careerState),
  });
  const candidates = providers.createSeniorIntakeCandidates({
    careerState,
    seasonId: intakeSeasonId,
    intakeDate: careerState.gameState.calendar.currentDate,
  });
  const competitionWorld = careerState.gameState.domesticCompetitionWorld;
  assert.ok(competitionWorld !== undefined);
  const roleDiagnostics = providers.roleContinuityDiagnostics();
  assert.equal(roleDiagnostics.academyRefill.reconciliationFailureCount, 0);
  assert.equal(roleDiagnostics.seniorCandidate.status, "generated");
  if (roleDiagnostics.seniorCandidate.status !== "generated") {
    throw new Error("Senior candidates were generated but diagnostics omitted them");
  }
  assert.equal(roleDiagnostics.seniorCandidate.population.reconciliationFailureCount, 0);
  assert.equal(
    roleDiagnostics.seniorCandidate.population.plannedCount,
    roleDiagnostics.seniorCandidate.population.candidates.length,
  );

  for (const competitionIdValue of competitionWorld.competitionIds) {
    const competitionClubIds: readonly ReturnType<typeof clubId>[] | undefined =
      competitionWorld.competitions[competitionIdValue]?.clubIds;
    assert.ok(competitionClubIds !== undefined);
    const population: readonly AnnualWorldSeniorIntakeCandidate[] = candidates.filter((candidate) =>
      competitionClubIds.includes(candidate.targetClubId)
    );
    assert.deepEqual(
      new Set(population.map((candidate) => candidate.player.primaryRole)),
      new Set(PLAYER_ROLES),
      String(competitionIdValue),
    );
    const positions: readonly PlayerPosition[] = population.flatMap((candidate) => candidate.player.naturalPositions);
    for (const [right, left] of [["rb", "lb"], ["rwb", "lwb"], ["rm", "lm"], ["rw", "lw"]] as const) {
      assert.equal(
        Math.abs(positions.filter((position) => position === right).length - positions.filter((position) => position === left).length) <= 1,
        true,
        `${competitionIdValue}:${right}/${left}`,
      );
    }
  }
});

test("shared annual providers evaluate age and refill stock at the incoming season start", () => {
  const careerState = annualProviderCareerState(true);
  const incomingSeasonStartDate = gameDate(fromISO("2027-08-01"));
  const providers = createAnnualWorldIntakeCandidateProviders({
    worldSeed: "annual-provider-career",
    seasonIndex: 1,
    seniorCandidatesPerClub: 1,
  });
  const candidates = providers.createYouthIntakeCandidates({
    careerState,
    seasonId: seasonId("season:replacement-1"),
    intakeDate: incomingSeasonStartDate,
    activePlayerStock: activePlayerStockFixture(careerState),
  });
  const diagnostics = providers.diagnostics();

  const potentialSixPlayerKeys = annualCeilingAssignmentPlayerKeys(
    diagnostics.allocation,
    6,
  );
  assert.equal(potentialSixPlayerKeys.length, 1);
  assert.equal(annualCeilingUnfilledVacancyCount(diagnostics.allocation, 6), 0);
  assert.deepEqual(
    diagnostics.generatedCeilingAssignments
      .filter(({ minimumRating }) => minimumRating === 6)
      .map(({ playerId }) => String(playerId))
      .toSorted(),
    potentialSixPlayerKeys,
  );
  assert.deepEqual(
    diagnostics.allocatedCeilingPlacements
      .filter(({ minimumRating }) => minimumRating === 6)
      .map(({ candidate }) => candidate.playerKey)
      .toSorted(),
    potentialSixPlayerKeys,
  );
  assert.equal(
    diagnostics.allocatedCeilingPlacements
      .filter(({ minimumRating }) => minimumRating === 6)
      .every(({ candidate }) =>
        candidate.division !== "first_division"
        || candidate.clubTier === "title_contender"
        || candidate.clubTier === "playoff_contender",
    ),
    true,
  );
  assert.equal(
    candidates.some((candidate) =>
      diagnostics.generatedCeilingAssignments.some(
        ({ playerId: generatedId, minimumRating }) =>
          minimumRating === 6 && candidate.player.id === generatedId,
      )
    ),
    true,
  );
});

test("real annual worlds reach both successor-stock branches without changing the six-star lane", () => {
  // Frozen before the first execution: no seed may be appended after reading
  // the result merely to make a branch reachable.
  const corpus = Array.from(
    { length: 7 },
    (_, index) => `phase81a-successor-ceiling-reachability-${index + 1}`,
  );
  const selectedClubIds = new Set<string>();
  const selectedRoles = new Set<string>();
  let positiveFiveVacancyObserved = false;
  let zeroFiveVacancyObserved = false;
  let fiveAssignmentObserved = false;
  let sixAssignmentObserved = false;
  let clubCapRefusalObserved = false;

  for (const worldSeed of corpus) {
    const careerState = annualProviderCareerState(false, worldSeed);
    const run = (
      useSuccessorCeilingStockPolicy: boolean,
      intakeDate: ReturnType<typeof gameDate>,
    ) => {
      const providers = createAnnualWorldIntakeCandidateProviders({
        worldSeed,
        seasonIndex: 6,
        seniorCandidatesPerClub: 1,
        useSuccessorCeilingStockPolicy,
      });
      const academy = providers.createYouthIntakeCandidates({
        careerState,
        seasonId: seasonId(`season:${worldSeed}`),
        intakeDate,
        activePlayerStock: activePlayerStockFixture(careerState),
      });
      return {
        academy,
        diagnostics: providers.diagnostics(),
        roleDiagnostics: providers.roleContinuityDiagnostics(),
      };
    };

    const opening = run(true, careerState.gameState.calendar.currentDate);
    if (annualCeilingUnfilledVacancyCount(opening.diagnostics.allocation, 5) === 0) {
      zeroFiveVacancyObserved = true;
    }
    // Frozen with the seven world seeds before the first cap-diagnostic run.
    // Intermediate real intake dates preserve part of the opening young stock,
    // allowing the active two-per-club cap to be exercised before everyone
    // ages out in the replacement arm below.
    for (const year of [2027, 2028, 2029, 2030, 2031] as const) {
      const intermediate = run(true, gameDate(fromISO(`${year}-08-01`)));
      clubCapRefusalObserved ||=
        intermediate.diagnostics.allocation.fiveStarClubCapRefusalCount > 0;
    }

    // The same real opening population observed six years later has aged out of
    // the active 15..20 stock. This reaches the annual replacement branch
    // without constructing players or allocation inputs in the test.
    const replacementDate = gameDate(fromISO("2032-08-01"));
    const control = run(false, replacementDate);
    const candidate = run(true, replacementDate);
    const fiveKeys = annualCeilingAssignmentPlayerKeys(
      candidate.diagnostics.allocation,
      5,
    );
    const sixKeys = annualCeilingAssignmentPlayerKeys(
      candidate.diagnostics.allocation,
      6,
    );
    positiveFiveVacancyObserved ||= fiveKeys.length > 0;
    fiveAssignmentObserved ||= fiveKeys.length > 0;
    sixAssignmentObserved ||= sixKeys.length > 0;

    assert.deepEqual(
      annualCeilingAssignmentPlayerKeys(candidate.diagnostics.allocation, 6),
      annualCeilingAssignmentPlayerKeys(control.diagnostics.allocation, 6),
    );
    assert.equal(candidate.roleDiagnostics.academyRefill.reconciliationFailureCount, 0);
    assert.equal(control.roleDiagnostics.academyRefill.reconciliationFailureCount, 0);

    const fiveKeySet = new Set(fiveKeys);
    const controlById = new Map(
      control.academy.map(({ player }) => [player.id, player]),
    );
    for (const generated of candidate.academy) {
      const before = controlById.get(generated.player.id);
      assert.ok(before !== undefined);
      if (!fiveKeySet.has(String(generated.player.id))) {
        assert.deepEqual(generated.player, before);
        continue;
      }
      const currentRating = ratingForRoleAbility(Number(roleCurrentAbility(
        generated.player.abilities,
        getPlayerRoleProfile(generated.player.primaryRole),
      )));
      const potentialRating = ratingForRoleAbility(Number(rolePotentialAbility(
        generated.player.potential,
        getPlayerRoleProfile(generated.player.primaryRole),
      )));
      assert.equal(currentRating < 5, true);
      assert.equal(potentialRating, 5);
      selectedRoles.add(generated.player.primaryRole);
    }
    for (const placement of candidate.diagnostics.allocatedCeilingPlacements) {
      if (placement.minimumRating !== 5) continue;
      selectedClubIds.add(placement.candidate.clubKey);
    }
  }

  assert.equal(positiveFiveVacancyObserved, true);
  assert.equal(zeroFiveVacancyObserved, true);
  assert.equal(fiveAssignmentObserved, true);
  assert.equal(sixAssignmentObserved, true);
  assert.equal(clubCapRefusalObserved, true);
  assert.equal(selectedClubIds.size >= 2, true);
  assert.equal(selectedRoles.size >= 2, true);
});

/** Returns the role-relative stored rating room for one generated intake player. */
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

function intakeInput(worldSeed: string): Parameters<typeof generateCareerIntakePlayers>[0] {
  return {
    worldSeed,
    seasonId: seasonId("season:0002"),
    clubId: clubId("club:perugia"),
    clubContext: {
      category: "third_division",
      reputation: 5,
      competitiveTier: "mid_table",
    },
    targetPositions: ["gk", "cb", "dm", "am", "rw", "st"],
  };
}

function annualProviderCareerState(
  vacateOneYoungExceptional = false,
  worldSeed = "annual-provider-career",
) {
  const world = createFakeDomesticWorld({
    worldSeed,
  });
  const allPlayers = {
    ...world.players,
    ...world.initialYouthAcademies.players,
  };
  if (vacateOneYoungExceptional) {
    const exceptionalKey = world.exceptionalAllocation.youngPotentialSixPlayerKeys[0];
    assert.ok(exceptionalKey !== undefined);
    const exceptionalId = playerId(exceptionalKey);
    const exceptional = allPlayers[exceptionalId];
    assert.ok(exceptional !== undefined);
    allPlayers[exceptionalId] = {
      ...exceptional,
      // The player stays active and retains the stored ceiling; only aging out
      // of the 15..20 cohort opens a national-stock vacancy.
      birthDate: gameDate(fromISO("2005-08-02")),
    };
  }
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
        seed: worldSeed,
        rngAlgorithmVersion: "sfc32-cyrb128-v1",
        saveSchemaVersion: 1,
        calibrationVersions: world.calibrationVersions,
      },
      calendar: {
        currentDate: world.seasonStartDate,
        currentSeasonId: world.seasonId,
      },
      players: allPlayers,
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

/**
 * Moves one real exceptional academy player into the lifecycle interval that
 * exists between age-out and senior-promotion resolution.
 */
function annualProviderCareerStateWithExceptionalPromotion(): CareerState {
  const careerState = annualProviderCareerState();
  const youthState = careerState.youthAcademyState;
  assert.ok(youthState !== undefined);
  const promotionPlayerId = youthState.playerLifecycleIds.find((id) => {
    const lifecycle = youthState.playerLifecycle[id];
    const player = careerState.gameState.players[id];
    return lifecycle?.status === "academy"
      && player !== undefined
      && storedPrimaryRolePotential(player) >= 17;
  });
  assert.ok(promotionPlayerId !== undefined);
  const lifecycle = youthState.playerLifecycle[promotionPlayerId];
  assert.ok(lifecycle !== undefined);
  const roster = youthState.clubRosters[lifecycle.clubId];
  assert.ok(roster !== undefined);

  return createCareerState({
    ...careerState,
    youthAcademyState: {
      ...youthState,
      clubRosters: {
        ...youthState.clubRosters,
        [lifecycle.clubId]: {
          ...roster,
          playerIds: roster.playerIds.filter((id) =>
            id !== promotionPlayerId
          ),
        },
      },
      playerLifecycle: {
        ...youthState.playerLifecycle,
        [promotionPlayerId]: {
          ...lifecycle,
          status: "promotion_candidate",
          statusChangedAt: careerState.gameState.calendar.currentDate,
        },
      },
    },
  });
}

function storedPrimaryRolePotential(player: Player): number {
  const naturalPosition = player.naturalPositions[0];
  assert.ok(naturalPosition !== undefined);
  const primaryRole =
    player.primaryRole ?? primaryRoleForPosition(naturalPosition);
  return Number(
    rolePotentialAbility(
      player.potential,
      getPlayerRoleProfile(primaryRole),
    ),
  );
}

/** Mirrors the engine boundary explicitly for direct content-provider tests. */
function activePlayerStockFixture(
  careerState: CareerState,
): readonly AnnualWorldActivePlayerStockEntry[] {
  const entryByPlayerId = new Map<PlayerId, AnnualWorldActivePlayerStockEntry>();
  for (const clubIdValue of careerState.gameState.clubIds) {
    for (
      const activePlayerId
      of careerState.gameState.clubs[clubIdValue]?.playerIds ?? []
    ) {
      entryByPlayerId.set(activePlayerId, {
        playerId: activePlayerId,
        source: "senior",
        clubId: clubIdValue,
      });
    }
  }
  for (const clubIdValue of careerState.youthAcademyState?.clubRosterIds ?? []) {
    for (
      const activePlayerId
      of careerState.youthAcademyState?.clubRosters[clubIdValue]?.playerIds ?? []
    ) {
      entryByPlayerId.set(activePlayerId, {
        playerId: activePlayerId,
        source: "academy",
        clubId: clubIdValue,
      });
    }
  }
  for (
    const activePlayerId
    of careerState.youthAcademyState?.playerLifecycleIds ?? []
  ) {
    const lifecycle =
      careerState.youthAcademyState?.playerLifecycle[activePlayerId];
    if (lifecycle?.status !== "promotion_candidate") continue;
    assert.equal(entryByPlayerId.has(activePlayerId), false);
    entryByPlayerId.set(activePlayerId, {
      playerId: activePlayerId,
      source: "promotion_candidate",
      clubId: lifecycle.clubId,
    });
  }
  for (const activePlayerId of careerState.gameState.playerIds) {
    if (!entryByPlayerId.has(activePlayerId)) {
      entryByPlayerId.set(activePlayerId, {
        playerId: activePlayerId,
        source: "free_agent",
      });
    }
  }
  return careerState.gameState.playerIds.flatMap((activePlayerId) => {
    const entry = entryByPlayerId.get(activePlayerId);
    return entry === undefined ? [] : [entry];
  });
}
