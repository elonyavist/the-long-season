import assert from "node:assert/strict";
import { test } from "vitest";

import {
  OwnerAttributionObserver,
  evaluateHistoricalUpsetCheckpoint,
  evaluateOwnerAttributionCheckpoint,
  evaluatePlayerRenewalLeadersCheckpoint,
  evaluateSquadUseAttribution,
  leaderProductionOwner,
  ownerAttributionDecision,
  playerRenewalLeadersFailedGateKeys,
  playerLoadAttributionOwner,
  tableHierarchyOwner,
  topTenPlayerSeasonFacts,
  type OwnerAttributionDecision,
  type OwnerAttributionPlayerSeasonFact,
  type OwnerAttributionTableSeasonFact,
  type OwnerAttributionWorldFacts,
} from "./owner-attribution.ts";
import type { GenerationalSuccessionWorldFacts } from "./generational-succession.ts";

test("canonical integrated observation can omit only the paired-table lane", () => {
  const facts = new OwnerAttributionObserver("canonical-integrated").facts();

  assert.deepEqual(facts.tableSeasons, []);
  assert.equal(facts.worldSeed, "canonical-integrated");
  assert.equal(facts.reconciliationFailureCount, 0);
});

test("owner attribution refuses a vacuous corpus", () => {
  const result = evaluateOwnerAttributionCheckpoint({
    worlds: [],
    generationalWorlds: [],
    replicatedFormationRetentionShare: "not_observed",
    tableAttribution: "required",
  });

  assert.equal(result.decision, "REFINE");
  assert.equal(result.reconciliationFailureCount > 0, true);
  assert.deepEqual(result.owners, {
    tableHierarchy: "not_attributed",
    playerLoad: "not_attributed",
    leaderProduction: "not_attributed",
    clubIdentity: "not_attributed",
    generationalRenewal: "not_attributed",
  });
});

test("player renewal does not require the explicitly omitted paired-table lane", () => {
  const result = evaluatePlayerRenewalLeadersCheckpoint({
    worlds: [emptyOwnerWorld()],
    generationalWorlds: [emptyGenerationalWorld()],
    replicatedFormationRetentionShare: 1,
  });

  assert.equal(result.reconciliationFailureCount, 0);
  assert.equal(result.failedGateKeys.includes("reconciliation"), false);
});

test("fresh A6 use gates isolate worlds and count a transferred player twice", () => {
  const world: OwnerAttributionWorldFacts = {
    ...emptyOwnerWorld(),
    playerUseSeasons: [
      { competitionId: "competition:ita-1", seasonNumber: 1, clubId: "club:a", playerId: "p:1", appearances: 20 },
      { competitionId: "competition:ita-1", seasonNumber: 1, clubId: "club:b", playerId: "p:1", appearances: 10 },
      { competitionId: "competition:ita-1", seasonNumber: 1, clubId: "club:b", playerId: "p:2", appearances: 4 },
    ],
  };
  const secondWorld: OwnerAttributionWorldFacts = {
    ...world,
    worldSeed: "owner-world:2",
  };
  const players = evaluateOwnerAttributionCheckpoint({
    worlds: [world, secondWorld],
    generationalWorlds: [
      emptyGenerationalWorld(),
      { ...emptyGenerationalWorld(), worldSeed: "owner-world:2" },
    ],
    replicatedFormationRetentionShare: 1,
    tableAttribution: "not_requested",
  }).players;

  assert.equal(players.appearanceShare, 34 / (34 * 3));
  assert.equal(players.distinctUsersPerClubSeason, 1.5);
});

test("squad-use attribution identifies a reachable matchday ceiling on real appearance rows", () => {
  const worlds = Array.from({ length: 28 }, (_, worldIndex): OwnerAttributionWorldFacts => ({
    ...emptyOwnerWorld(),
    worldSeed: `squad-use:${worldIndex + 1}`,
    playerUseSeasons: Array.from({ length: 23 }, (_, playerIndex) => ({
      competitionId: "competition:ita-1",
      seasonNumber: 1,
      clubId: "club:a",
      playerId: `player:${playerIndex + 1}`,
      appearances: playerIndex < 16 ? 21 : 20,
    })),
    squadUseSeasons: [{
      competitionId: "competition:ita-1",
      seasonNumber: 1,
      clubId: "club:a",
      fixtureCount: 34,
      candidatePlayerCount: 31,
      availablePlayerCount: 30,
      selectorPoolPlayerCount: 29,
      matchdayPlayerCount: 28,
    }],
  }));

  const result = evaluateSquadUseAttribution(worlds);

  assert.equal(result.owner, "substitution_realization");
  assert.equal(result.ownerWorldCount, 28);
  assert.equal(result.pooledCounterfactualDistinctUsersPerClubSeason, 26);
  assert.equal(result.pooledCounterfactualAppearanceShare, 7 / 13);
  assert.equal(result.reconciliationFailureCount, 0);
});

test("zero reconciliation cannot hide one unattributed red family", () => {
  assert.equal(ownerAttributionDecision({
    tableHierarchy: "population_strength",
    playerLoad: "renewal_quality",
    leaderProduction: "actor_allocation",
    clubIdentity: "not_attributed",
    generationalRenewal: "development_realization",
  }, 0), "REFINE");

  assert.equal(ownerAttributionDecision({
    tableHierarchy: "population_strength",
    playerLoad: "renewal_quality",
    leaderProduction: "actor_allocation",
    clubIdentity: "annual_intake_identity_erosion",
    generationalRenewal: "development_realization",
  }, 0), "OWNER_IDENTIFIED");
});

test("paired table attribution applies the frozen bands and fails ambiguous responses closed", () => {
  assert.equal(tableHierarchyOwner(tableFacts({
    pairedPointsSpreadDelta: 5,
    pairedPpgStandardDeviationDelta: 0.04,
  })), "population_strength");
  assert.equal(tableHierarchyOwner(tableFacts({
    pairedPointsSpreadDelta: 1.99,
    pairedPpgStandardDeviationDelta: 0.019,
  })), "match_translation");
  assert.equal(tableHierarchyOwner(tableFacts({
    drawShareMean: 0.4,
    pairedPointsSpreadDelta: 5,
    pairedPpgStandardDeviationDelta: 0.04,
    pairedDrawShareReduction: 0.02,
  })), "draw_resolution");
  assert.equal(tableHierarchyOwner(tableFacts({
    pairedPointsSpreadDelta: 3,
    pairedPpgStandardDeviationDelta: 0.03,
  })), "not_attributed");
});

test("L6.2 upset gates accept a complete historical gradient and fail one collapsed lane", () => {
  const passingWorlds = Array.from({ length: 7 }, (_, worldIndex) =>
    upsetWorld(worldIndex, false));
  const passing = evaluateHistoricalUpsetCheckpoint(passingWorlds);

  assert.equal(passing.decision, "GO");
  assert.deepEqual(passing.failedGateKeys, []);
  assert.equal(passing.firstDivisionSeasonCount, 70);
  assert.equal(passing.firstVersusLast.fixtureCount, 70);
  assert.equal(passing.firstVersusLast.held, true);
  assert.equal(passing.strengthGaps.reduce((sum, row) => sum + row.fixtureCount, 0), 21_420);

  const collapsed = evaluateHistoricalUpsetCheckpoint(
    Array.from({ length: 7 }, (_, worldIndex) => upsetWorld(worldIndex, true)),
  );
  assert.equal(collapsed.decision, "REFINE");
  assert.equal(collapsed.failedGateKeys.includes("rank_gap:15_plus"), true);
});

test("fixture-dated younger alternatives decide veteran-load ownership with a dead band", () => {
  assert.equal(playerLoadAttributionOwner(playerFacts({
    fresherQualityMatchedYoungerAlternativeShare: 0.2,
  })), "selection_load");
  assert.equal(playerLoadAttributionOwner(playerFacts({
    fresherQualityMatchedYoungerAlternativeShare: 0.1,
  })), "renewal_quality");
  assert.equal(playerLoadAttributionOwner(playerFacts({
    fresherQualityMatchedYoungerAlternativeShare: 0.15,
  })), "not_attributed");
});

test("leader attribution keeps age, nomination and execution failures separate", () => {
  assert.equal(leaderProductionOwner(playerFacts({
    scorerMeanAge: 30,
    shooterAbilityNominationCorrelation: 0.05,
    creatorAbilityNominationCorrelation: 0.05,
  })), "actor_allocation");
  assert.equal(leaderProductionOwner(playerFacts({
    scorerMeanAge: 27,
    assistMeanAge: 27,
    age33PlusScorerShare: 0.05,
    age33PlusAssistShare: 0.05,
    topTenScorerMean: 10,
    shooterAbilityNominationCorrelation: 0.3,
    creatorAbilityNominationCorrelation: 0.3,
  })), "occasion_execution");
  assert.equal(leaderProductionOwner(playerFacts({
    scorerMeanAge: 27,
    assistMeanAge: 27,
    age33PlusScorerShare: 0.05,
    age33PlusAssistShare: 0.05,
  })), "not_attributed");
});

test("L5.3 passes a reachable real-football band and one changed fact fails closed", () => {
  const passing = playerFacts({
    age33PlusStartsMean: 14,
    age33PlusMinutesMean: 1_300,
    topTenScorerMean: 16,
    topTenAssistMean: 9,
    scorerMeanAge: 27,
    assistMeanAge: 27,
    age33PlusScorerShare: 0.08,
    age33PlusAssistShare: 0.08,
    exceptional33PlusLeaderObservationCount: 4,
    leaderOriginCounts: {
      openingSenior: 40, openingAcademy: 5, annualAcademyIntake: 40, annualSeniorIntake: 15,
    },
    careerGeneratedLeaderShareSeasonTen: 0.55,
    appearanceShare: "not_evaluated",
    distinctUsersPerClubSeason: "not_evaluated",
  });
  assert.deepEqual(playerRenewalLeadersFailedGateKeys(passing, 0), []);
  assert.deepEqual(
    playerRenewalLeadersFailedGateKeys({ ...passing, age33PlusScorerShare: 0.121 }, 0),
    ["age33_plus_scorer_share"],
  );
  assert.deepEqual(
    playerRenewalLeadersFailedGateKeys({ ...passing, careerGeneratedLeaderShareSeasonTen: 0.49 }, 0),
    ["career_generated_leader_share_season_ten"],
  );
  assert.deepEqual(
    playerRenewalLeadersFailedGateKeys({ ...passing, appearanceShare: 0.47 }, 0),
    ["appearance_share"],
  );
  assert.deepEqual(
    playerRenewalLeadersFailedGateKeys({ ...passing, distinctUsersPerClubSeason: 32 }, 0),
    ["distinct_users_per_club_season"],
  );
  assert.deepEqual(
    playerRenewalLeadersFailedGateKeys(passing, 1),
    ["reconciliation"],
  );
});

test("the shared top-ten derivation is deterministic and isolated per competition season", () => {
  const rows = [
    playerSeason("a", 4, 1),
    playerSeason("b", 4, 3),
    playerSeason("c", 2, 2),
    playerSeason("d", 8, 0, 2),
  ];

  assert.deepEqual(
    topTenPlayerSeasonFacts([...rows].reverse(), "goals").map(({ playerId }) => playerId),
    ["a", "b", "c", "d"],
  );
  assert.deepEqual(
    topTenPlayerSeasonFacts(rows, "assists").map(({ playerId }) => playerId),
    ["b", "c", "a", "d"],
  );
});

test("leader production chooses ten players inside each world before pooling", () => {
  const world = (worldSeed: string, top: number): OwnerAttributionWorldFacts => ({
    ...emptyOwnerWorld(),
    worldSeed,
    playerSeasons: Array.from({ length: 10 }, (_, index) =>
      playerSeason(`${worldSeed}:${index}`, top - index, top - index)),
  });
  const worlds = [world("world:a", 20), world("world:b", 10)];
  const generationalWorlds = worlds.map(({ worldSeed }) => ({
    ...emptyGenerationalWorld(),
    worldSeed,
  }));
  const evaluate = (orderedWorlds: readonly OwnerAttributionWorldFacts[]) =>
    evaluateOwnerAttributionCheckpoint({
      worlds: orderedWorlds,
      generationalWorlds,
      replicatedFormationRetentionShare: 1,
      tableAttribution: "not_requested",
    }).players;

  const players = evaluate(worlds);
  assert.equal(players.topScorerMean, 15);
  assert.equal(players.topAssistMean, 15);
  assert.equal(players.topTenScorerMean, 10.5);
  assert.equal(players.topTenAssistMean, 10.5);
  assert.deepEqual(evaluate([...worlds].reverse()), players);
});

function playerSeason(
  playerId: string,
  goals: number,
  assists: number,
  seasonNumber = 1,
): OwnerAttributionPlayerSeasonFact {
  return {
    competitionId: "competition:ita-1",
    seasonNumber,
    playerId,
    clubId: "club:a",
    age: 25,
    role: "striker",
    currentAbility: 10,
    potentialRoom: 0,
    appearances: 1,
    starts: 1,
    minutes: 90,
    shots: goals,
    shotsOnTarget: goals,
    creatorNominations: assists,
    goals,
    assists,
  };
}

function tableFacts(
  overrides: Partial<OwnerAttributionDecision["table"]>,
): OwnerAttributionDecision["table"] {
  return {
    firstDivisionSeasonCount: 70,
    championPointsMean: 67,
    pointsSpreadMean: 41,
    ppgStandardDeviationMean: 0.33,
    drawShareMean: 0.25,
    goalsPerMatchMean: 2.6,
    kickoffStrengthSpreadMean: 2,
    rankCorrelationMean: 0.5,
    largestGapFavoriteWinShare: 0.6,
    largestGapFavoritePointsPerMatch: 1.9,
    pairedChampionPointsMean: 73,
    pairedPointsSpreadMean: 46,
    pairedPpgStandardDeviationMean: 0.37,
    pairedDrawShareMean: 0.23,
    pairedPointsSpreadDelta: 5,
    pairedPpgStandardDeviationDelta: 0.04,
    pairedDrawShareReduction: 0.02,
    ...overrides,
  };
}

function playerFacts(
  overrides: Partial<OwnerAttributionDecision["players"]>,
): OwnerAttributionDecision["players"] {
  return {
    firstDivisionPlayerSeasonCount: 30_000,
    age33PlusStartsMean: 23,
    age33PlusMinutesMean: 1_900,
    qualityMatchedVeteranStartEdge: 1,
    veteranStarterSelectionCount: 1_000,
    qualityMatchedYoungerAlternativeShare: 0.1,
    fresherQualityMatchedYoungerAlternativeShare: 0.1,
    shooterAbilityNominationCorrelation: 0.02,
    creatorAbilityNominationCorrelation: 0.03,
    topScorerMean: 22,
    topAssistMean: 10,
    topTenScorerMean: 17,
    topTenAssistMean: 8,
    scorerMeanAge: 30,
    assistMeanAge: 29,
    age33PlusScorerShare: 0.2,
    age33PlusAssistShare: 0.2,
    exceptional33PlusLeaderObservationCount: 40,
    leaderOriginCounts: {
      openingSenior: 70, openingAcademy: 8, annualAcademyIntake: 15, annualSeniorIntake: 7,
    },
    careerGeneratedLeaderShareSeasonTen: 0.22,
    appearanceShare: "not_evaluated",
    distinctUsersPerClubSeason: "not_evaluated",
    ...overrides,
  };
}

function emptyOwnerWorld(): OwnerAttributionWorldFacts {
  return {
    worldSeed: "player-only-world",
    tableSeasons: [],
    playerSeasons: [],
    selectionLoadSeasons: [],
    clubIdentitySeasons: [],
    annualRolePlanReconciliationFailureCount: 0,
    annualRolePlanPositiveRoleCounts: [],
    reconciliationFailureCount: 0,
  };
}

function upsetWorld(worldIndex: number, collapseLargestRankGap: boolean): OwnerAttributionWorldFacts {
  return {
    ...emptyOwnerWorld(),
    worldSeed: `upset-world:${worldIndex + 1}`,
    tableSeasons: Array.from({ length: 10 }, (_, seasonIndex) =>
      upsetTableSeason(worldIndex * 10 + seasonIndex, collapseLargestRankGap)),
  };
}

function upsetTableSeason(
  absoluteSeasonIndex: number,
  collapseLargestRankGap: boolean,
): OwnerAttributionTableSeasonFact {
  const rankGapBuckets = [
    { bucket: "1_to_3" as const, fixtureCount: 100, underdogWins: 32, draws: 28 },
    { bucket: "4_to_6" as const, fixtureCount: 100, underdogWins: 28, draws: 27 },
    { bucket: "7_to_9" as const, fixtureCount: 100, underdogWins: 25, draws: 24 },
    { bucket: "10_to_14" as const, fixtureCount: 100, underdogWins: 20, draws: 24 },
    {
      bucket: "15_plus" as const,
      fixtureCount: 100,
      underdogWins: collapseLargestRankGap ? 0 : 13,
      draws: 18,
    },
  ];
  return {
    competitionId: "competition:ita-1",
    seasonNumber: absoluteSeasonIndex + 1,
    fixtureCount: 306,
    championPoints: 75,
    lastPoints: 23,
    pointsSpread: 52,
    goalsPerMatch: 2.8,
    drawShare: 0.26,
    ppgStandardDeviation: 0.4,
    pairedChampionPoints: 75,
    pairedLastPoints: 23,
    pairedPointsSpread: 52,
    pairedGoalsPerMatch: 2.8,
    pairedDrawShare: 0.26,
    pairedPpgStandardDeviation: 0.4,
    kickoffStrengthMean: 13,
    kickoffStrengthSpread: 4,
    strengthPointsRankCorrelation: 0.5,
    tiedStrengthFixtureCount: 0,
    gapBuckets: [
      { bucket: "under_0_25", fixtureCount: 50, favoriteWins: 20, favoritePoints: 75, draws: 15 },
      { bucket: "0_25_to_0_5", fixtureCount: 50, favoriteWins: 22, favoritePoints: 80, draws: 14 },
      { bucket: "0_5_to_1", fixtureCount: 50, favoriteWins: 24, favoritePoints: 84, draws: 12 },
      { bucket: "1_to_1_5", fixtureCount: 50, favoriteWins: 26, favoritePoints: 88, draws: 10 },
      { bucket: "1_5_to_2", fixtureCount: 40, favoriteWins: 24, favoritePoints: 80, draws: 8 },
      { bucket: "2_to_3", fixtureCount: 36, favoriteWins: 24, favoritePoints: 76, draws: 4 },
      { bucket: "3_plus", fixtureCount: 30, favoriteWins: 22, favoritePoints: 68, draws: 2 },
    ],
    rankGapBuckets,
    firstVersusLast: {
      fixtureCount: 1,
      underdogWins: absoluteSeasonIndex < 7 ? 1 : 0,
      draws: absoluteSeasonIndex >= 7 && absoluteSeasonIndex < 14 ? 1 : 0,
    },
  };
}

function emptyGenerationalWorld(): GenerationalSuccessionWorldFacts {
  return {
    worldSeed: "player-only-world",
    openingPopulationCount: 1,
    openingSeniorPopulationCount: 1,
    careerGeneratedCount: 0,
    matureAcademyIntakeCount: 0,
    matureAcademyPromotionCandidateCount: 0,
    matureAcademyCompletedPromotionCount: 0,
    unknownOriginCount: 0,
    softOutfieldAgeRetirementCount: 0,
    abilityPairObservationCount: 0,
    currentAbovePotentialAbilityCount: 0,
    outOfRangeAbilityValueCount: 0,
    generatedCeilingRows: [],
    annualRoleContinuity: {
      plannedCandidateCount: 0,
      generatedCandidateCount: 0,
      reconciliationFailureCount: 0,
      seniorCandidateGeneratedSeasonCount: 0,
      seniorCandidateNotRequestedSeasonCount: 0,
      openingAcademyDepartmentMismatchCount: 0,
      rows: [],
    },
    academyParticipation: {
      fixtureCount: 0,
      appearanceCount: 0,
      playerCount: 0,
      minutes: 0,
      fullProgrammePlayerMonthCount: 0,
      reducedProgrammePlayerMonthCount: 0,
      fullyReplacedPlayerMonthCount: 0,
      missingPlayerMonthCount: 0,
      invalidMinuteCount: 0,
    },
    rows: [],
  };
}
