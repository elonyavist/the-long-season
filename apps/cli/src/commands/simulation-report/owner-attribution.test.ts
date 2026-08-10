import assert from "node:assert/strict";
import { test } from "vitest";

import {
  OwnerAttributionObserver,
  evaluateOwnerAttributionCheckpoint,
  evaluatePlayerRenewalLeadersCheckpoint,
  leaderProductionOwner,
  ownerAttributionDecision,
  playerRenewalLeadersFailedGateKeys,
  playerLoadAttributionOwner,
  tableHierarchyOwner,
  topTenPlayerSeasonFacts,
  type OwnerAttributionDecision,
  type OwnerAttributionPlayerSeasonFact,
  type OwnerAttributionWorldFacts,
} from "./owner-attribution.ts";
import type { GenerationalSuccessionWorldFacts } from "./generational-succession.ts";

test("canonical integrated observation can omit only the paired-table lane", () => {
  const facts = new OwnerAttributionObserver("canonical-integrated", {
    includeTableAttribution: false,
  }).facts();

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
