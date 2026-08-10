import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "vitest";

import { GENERATED_SQUAD_IDENTITY_KEYS } from "@game/content";

import {
  createCareerSectionsFacts,
  createRecoveryMatrixFacts,
  evaluateAvailabilityAgingCheckpoint,
  evaluateIntegratedLeaderboardAgeGates,
  evaluateLeagueDiversityCheckpoint,
  evaluateStandingsHierarchyCheckpoint,
  evaluateSubstitutionMinuteCheckpoint,
  type LeagueDiversityCompetitionSeasonFact,
  type LeagueDiversityOpeningCompetitionFact,
  type AvailabilityAgingWorldFacts,
  type SubstitutionMinuteWorldFacts,
  type StandingsHierarchyWorldFacts,
} from "./career-sections.ts";

test("one real career execution feeds every reusable module and fields contextual AI shapes", async () => {
  const facts = await createCareerSectionsFacts({
    worldSeeds: ["phase81a-03d-career-sections-world-00001"],
    seasonCount: 1,
    workerCount: 1,
    detail: "standard",
    sectionIds: [
      "season",
      "standings",
      "players",
      "transfers",
      "formations",
      "economy",
      "development",
      "anomalies",
    ],
  });

  assert.deepEqual(Object.keys(facts.sections).sort(), [
    "anomalies",
    "development",
    "economy",
    "formations",
    "players",
    "season",
    "standings",
    "transfers",
  ]);
  assert.equal(facts.calibrationVersions.playerStateCurves, "player-state-curves-v2");
  assert.equal(facts.calibrationVersions.matchInjuryRisk, "match-injury-risk-v3");
  const formationWorld = observedWorld(facts.sections.formations);
  const formationSeason = observedSeason(formationWorld);
  assert.equal(formationSeason.fallbackSelectionCount, 0);
  assert.ok(Number(formationSeason.distinctFormationCount) >= 5);
  const formationRows = array(formationSeason.rows).map(record);
  assert.equal(formationRows.every((row) => row.selectionSource === "catalog_ai"), true);

  const playerSeason = observedSeason(observedWorld(facts.sections.players));
  const scorer = record(array(playerSeason.topScorers)[0]);
  for (const key of ["playerId", "playerName", "age", "role", "clubId", "clubName", "appearances", "minutes", "goals", "assists"]) {
    assert.notEqual(scorer[key], undefined, key);
  }

  const transferRows = array(observedWorld(facts.sections.transfers).rows).map(record);
  assert.ok(transferRows.length > 0);
  for (const row of transferRows) {
    for (const key of [
      "buyingClubId",
      "buyingClubName",
      "buyingCompetitionId",
      "buyingCompetitionName",
    ]) {
      assert.notEqual(row[key], undefined, key);
    }
    if (row.kind === "permanent_transfer") {
      for (const key of [
        "sellingClubId",
        "sellingClubName",
        "sellingCompetitionId",
        "sellingCompetitionName",
      ]) {
        assert.notEqual(row[key], undefined, key);
      }
    }
  }
}, 60_000);

test("one real generated career reaches canonical low-detail academy participation", async () => {
  const checkpointDirectoryPath = await mkdtemp(join(tmpdir(), "phase81a-youth-minute-reachability-"));
  try {
    const facts = await createCareerSectionsFacts({
      worldSeeds: ["phase81a-youth-minute-reachability-world-00001"],
      seasonCount: 1,
      workerCount: 1,
      detail: "diagnostic",
      sectionIds: ["development"],
      leagueDiversityProfile: {
        profileId: "phase81a-youth-minute-reachability-test",
        checkpointDirectoryPath,
        checkpointKind: "youth_minute_pathway_l4_1",
      },
    });
    const development = record(facts.sections.development);
    const world = record(array(development.worlds)[0]);
    const academy = record(world.academyParticipation);

    assert.ok(Number(academy.fixtureCount) > 0);
    assert.ok(Number(academy.appearanceCount) > 0);
    assert.ok(Number(academy.minutes) > 0);
    assert.equal(academy.missingPlayerMonthCount, 0);
    assert.equal(academy.invalidMinuteCount, 0);
  } finally {
    await rm(checkpointDirectoryPath, { recursive: true, force: true });
  }
}, 120_000);

test("league-diversity resume rebuilds byte-identical facts from one complete-world checkpoint", async () => {
  const checkpointDirectoryPath = await mkdtemp(join(tmpdir(), "phase81a-l1-checkpoint-"));
  const input = {
    worldSeeds: ["phase81a-l1-resume-world-00001"],
    seasonCount: 1,
    workerCount: 1,
    detail: "standard" as const,
    sectionIds: ["formations"] as const,
    leagueDiversityProfile: {
      profileId: "phase81a-l1-resume-test",
      checkpointDirectoryPath,
      checkpointKind: "league_diversity_l1" as const,
    },
  };

  try {
    const first = await createCareerSectionsFacts(input);
    const resumed = await createCareerSectionsFacts(input);
    assert.equal(JSON.stringify(resumed), JSON.stringify(first));
  } finally {
    await rm(checkpointDirectoryPath, { recursive: true, force: true });
  }
}, 60_000);

test("league-diversity retention accepts exactly nineteen of twenty healthy rows", () => {
  const decision = evaluateLeagueDiversityCheckpoint([{
    worldSeed: "retention-boundary",
    opening: [healthyOpening()],
    seasons: [
      ...Array.from({ length: 19 }, (_, index) => healthySeason(index + 1)),
      {
        ...healthySeason(20),
        distinctFormationCount: 5,
        replicatedFormationCount: 3,
        primaryRolePositiveCount: 9,
        topFormationShare: 0.30,
      },
    ],
  }]);

  assert.equal(decision.decision, "GO");
  assert.equal(decision.longitudinal.sixFormationRetentionShare, 0.95);
  assert.equal(decision.longitudinal.fourReplicatedFormationRetentionShare, 0.95);
  assert.equal(decision.longitudinal.allRolesRetentionShare, 0.95);
});

test("league-diversity retention rejects eighteen of twenty and the absolute dominance branch", () => {
  const twoRateFailures = evaluateLeagueDiversityCheckpoint([{
    worldSeed: "retention-failure",
    opening: [healthyOpening()],
    seasons: Array.from({ length: 20 }, (_, index) => ({
      ...healthySeason(index + 1),
      ...(index < 2 ? { distinctFormationCount: 5 } : {}),
    })),
  }]);
  const absoluteFailure = evaluateLeagueDiversityCheckpoint([{
    worldSeed: "absolute-failure",
    opening: [healthyOpening()],
    seasons: [{ ...healthySeason(1), topFormationShare: 0.51 }],
  }]);

  assert.equal(twoRateFailures.decision, "REFINE");
  assert.equal(twoRateFailures.longitudinal.sixFormationRetentionShare, 0.9);
  assert.ok(twoRateFailures.longitudinal.failed.includes("six_formation_retention"));
  assert.equal(absoluteFailure.decision, "REFINE");
  assert.ok(absoluteFailure.longitudinal.failed.includes("absolute_top_formation_share"));
});

test("league-diversity opening gate rejects one missing identity", () => {
  const opening = healthyOpening();
  const firstIdentity = GENERATED_SQUAD_IDENTITY_KEYS[0];
  assert.notEqual(firstIdentity, undefined);
  const decision = evaluateLeagueDiversityCheckpoint([{
    worldSeed: "opening-failure",
    opening: [{
      ...opening,
      identityCounts: { ...opening.identityCounts, [firstIdentity]: 0 },
    }],
    seasons: [healthySeason(1)],
  }]);

  assert.equal(decision.decision, "REFINE");
  assert.deepEqual(decision.opening.failed, ["checkpoint-world|competition:test"]);
});

test("integrated age gates accept their exact frozen boundaries", () => {
  const decision = evaluateIntegratedLeaderboardAgeGates([
    { seasonNumber: 1, table: "scorers", age: 29, appearances: 30 },
    { seasonNumber: 2, table: "scorers", age: 31, appearances: 31 },
    { seasonNumber: 8, table: "scorers", age: 28, appearances: 28 },
    { seasonNumber: 8, table: "scorers", age: 30, appearances: 29 },
    { seasonNumber: 9, table: "scorers", age: 31, appearances: 30 },
    { seasonNumber: 10, table: "scorers", age: 33, appearances: 34 },
    { seasonNumber: 1, table: "assists", age: 29, appearances: 30 },
    { seasonNumber: 2, table: "assists", age: 31, appearances: 31 },
    { seasonNumber: 8, table: "assists", age: 28, appearances: 28 },
    { seasonNumber: 8, table: "assists", age: 30, appearances: 29 },
    { seasonNumber: 9, table: "assists", age: 31, appearances: 30 },
    { seasonNumber: 10, table: "assists", age: 33, appearances: 20 },
  ]);

  assert.deepEqual(decision.failedGateKeys, []);
  assert.equal(decision.scorer33PlusShareSeasons8To10, 0.25);
  assert.equal(decision.assist33PlusShareSeasons8To10, 0.25);
  assert.equal(decision.scorerMeanAgeDrift, 2);
  assert.equal(decision.assistMeanAgeDrift, 2);
  assert.equal(decision.retained33PlusLeaderFullSeasonShare, 0.5);
});

test("integrated age gates fail closed on missing or old-skewed leaderboards", () => {
  const missing = evaluateIntegratedLeaderboardAgeGates([]);
  const oldSkewed = evaluateIntegratedLeaderboardAgeGates([
    { seasonNumber: 1, table: "scorers", age: 25, appearances: 30 },
    { seasonNumber: 1, table: "assists", age: 25, appearances: 30 },
    { seasonNumber: 9, table: "scorers", age: 34, appearances: 34 },
    { seasonNumber: 9, table: "assists", age: 34, appearances: 34 },
  ]);

  assert.equal(missing.failedGateKeys.length, 5);
  assert.ok(oldSkewed.failedGateKeys.includes("age:scorer_33_plus_share"));
  assert.ok(oldSkewed.failedGateKeys.includes("age:assist_33_plus_share"));
  assert.ok(oldSkewed.failedGateKeys.includes("age:scorer_mean_age_drift"));
  assert.ok(oldSkewed.failedGateKeys.includes("age:assist_mean_age_drift"));
  assert.ok(oldSkewed.failedGateKeys.includes("minutes:retained_33_plus_full_season_share"));
});

test("league-diversity distinguishes forced emergency cover from avoidable out-of-position selection", () => {
  const forced = evaluateLeagueDiversityCheckpoint([{
    worldSeed: "forced-cover",
    opening: [{
      ...healthyOpening(),
      emergencyCatalogSelectionCount: 1,
      meanOutOfPositionSlots: 0.1,
    }],
    seasons: [healthySeason(1)],
  }]);
  const avoidable = evaluateLeagueDiversityCheckpoint([{
    worldSeed: "avoidable-cover",
    opening: [{
      ...healthyOpening(),
      avoidableOutOfPositionSlotCount: 1,
      meanOutOfPositionSlots: 0.1,
    }],
    seasons: [healthySeason(1)],
  }]);

  assert.equal(forced.decision, "GO");
  assert.equal(avoidable.decision, "REFINE");
});

test("substitution-minute checkpoint accepts varied legal real-match facts and rejects one broken fact", () => {
  const healthy: SubstitutionMinuteWorldFacts = {
    worldSeed: "l2-world",
    teamMatches: [healthySubstitutionRow("home", 4), healthySubstitutionRow("away", 5)],
  };
  const carried = [{
    worldSeed: "l2-world",
    opening: [healthyOpening()],
    seasons: [healthySeason(1)],
  }];
  const passing = evaluateSubstitutionMinuteCheckpoint([healthy], carried);
  const failing = evaluateSubstitutionMinuteCheckpoint([{
    ...healthy,
    teamMatches: healthy.teamMatches.map((row, index) =>
      index === 0 ? { ...row, reconciliationFailureCount: 1 } : row),
  }], carried);

  assert.equal(passing.decision, "GO");
  assert.equal(passing.meanSubstitutionsPerTeamMatch, 4.5);
  assert.equal(passing.medianFirstSubstitutionMinute, 60);
  assert.equal(failing.decision, "REFINE");
  assert.ok(failing.failed.includes("reconciliation"));
});

test("availability-aging checkpoint proves generated recovery reachability and rejects a selected unavailable player", () => {
  const recoveryMatrix = createRecoveryMatrixFacts();
  const worlds = Array.from({ length: 7 }, (_unused, index) =>
    healthyAvailabilityWorld(`l3-world-${index + 1}`));
  const substitutionWorlds = worlds.map(({ worldSeed }) => ({
    worldSeed,
    teamMatches: [healthySubstitutionRow("home", 4), healthySubstitutionRow("away", 5)].map((row) => ({
      ...row,
      worldSeed,
    })),
  }));
  const carriedWorlds = worlds.map(({ worldSeed }) => ({
    worldSeed,
    opening: [{ ...healthyOpening(), worldSeed }],
    seasons: [{ ...healthySeason(1), worldSeed }],
  }));
  const passing = evaluateAvailabilityAgingCheckpoint(
    worlds,
    substitutionWorlds,
    carriedWorlds,
    recoveryMatrix,
  );
  const failing = evaluateAvailabilityAgingCheckpoint(
    worlds.map((world, index) => index === 0
      ? {
          ...world,
          teamMatches: world.teamMatches.map((row) => ({ ...row, unavailableSelectedPlayerCount: 1 })),
        }
      : world),
    substitutionWorlds,
    carriedWorlds,
    recoveryMatrix,
  );

  assert.equal(recoveryMatrix.length, 14);
  assert.equal(
    recoveryMatrix.every(({ controlledBoundsHeld }) => controlledBoundsHeld),
    true,
    JSON.stringify(recoveryMatrix.filter(({ controlledBoundsHeld }) => !controlledBoundsHeld)),
  );
  assert.equal(passing.timeLossInjuriesPerThousandPlayerMatchHours, 36);
  assert.equal(passing.recoveryMatrix.generatedVeteranResilienceSpreadHeld, true);
  assert.equal(passing.decision, "GO");
  assert.equal(failing.decision, "REFINE");
  assert.ok(failing.failed.includes("unavailable_selected_players"));
});

test("L5.2 applies separate division targets and fails closed by owner class", () => {
  const standingsWorlds = Array.from({ length: 7 }, (_, worldIndex) => {
    const worldSeed = `l5-2-world-${worldIndex + 1}`;
    return {
      worldSeed,
      seasons: ([1, 2, 3] as const).flatMap((divisionLevel) => [1, 2].map(
        (seasonNumber) => healthyStandingsSeason(worldSeed, divisionLevel, seasonNumber),
      )),
    } satisfies StandingsHierarchyWorldFacts;
  });
  const formationWorlds = standingsWorlds.map(({ worldSeed }) => ({
    worldSeed,
    opening: [{ ...healthyOpening(), worldSeed }],
    seasons: [1, 2, 3].flatMap((divisionLevel) => [1, 2].map((seasonNumber) => ({
      ...healthySeason(seasonNumber),
      worldSeed,
      competitionId: `competition:${divisionLevel}`,
    }))),
  }));
  const availabilityWorlds = standingsWorlds.map(({ worldSeed }) =>
    healthyAvailabilityWorld(worldSeed));
  const passing = evaluateStandingsHierarchyCheckpoint(
    standingsWorlds,
    formationWorlds,
    availabilityWorlds,
    2,
  );
  const firstDivisionStillCompressed = evaluateStandingsHierarchyCheckpoint(
    standingsWorlds.map((world) => ({
      ...world,
      seasons: world.seasons.map((row) => row.divisionLevel === 1
        ? { ...row, championPoints: 50 }
        : row),
    })),
    formationWorlds,
    availabilityWorlds,
    2,
  );
  const lowerDivisionRegression = evaluateStandingsHierarchyCheckpoint(
    standingsWorlds.map((world, index) => index === 0 ? {
      ...world,
      seasons: world.seasons.map((row) => row.divisionLevel === 2
        ? { ...row, goalsPerMatch: 20 }
        : row),
    } : world),
    formationWorlds,
    availabilityWorlds,
    2,
  );

  assert.equal(passing.competitionSeasonCount, 42);
  assert.equal(passing.decision, "GO");
  assert.deepEqual(passing.divisions.map((division) => division.competitionSeasonCount), [14, 14, 14]);
  assert.equal(firstDivisionStillCompressed.decision, "REFINE");
  assert.equal(lowerDivisionRegression.decision, "STOP_RETHINK");
});

function healthyOpening(): LeagueDiversityOpeningCompetitionFact {
  return {
    worldSeed: "checkpoint-world",
    competitionId: "competition:test",
    clubCount: 16,
    identityCounts: Object.fromEntries(
      GENERATED_SQUAD_IDENTITY_KEYS.map((identity) => [identity, 2]),
    ),
    identityMismatchCount: 0,
    primaryRolePositiveCount: 10,
    distinctFormationCount: 8,
    replicatedFormationCount: 6,
    topFormationShare: 0.25,
    distinctIdentityModalFormationCount: 6,
    catalogOrderSensitiveSelectionCount: 0,
    emergencyCatalogSelectionCount: 0,
    forcedOutOfPositionSlotCount: 0,
    avoidableOutOfPositionSlotCount: 0,
    academyCallUpAppearanceCount: 1,
    meanOutOfPositionSlots: 0,
  };
}

function healthyStandingsSeason(
  worldSeed: string,
  divisionLevel: 1 | 2 | 3,
  seasonNumber: number,
): StandingsHierarchyWorldFacts["seasons"][number] {
  const values = {
    1: { championPoints: 80, lastClubPoints: 22, pointsSpread: 58, ppgStandardDeviation: 0.43, goalsPerMatch: 2.75, drawShare: 0.25 },
    2: { championPoints: 67, lastClubPoints: 26, pointsSpread: 41, ppgStandardDeviation: 0.30, goalsPerMatch: 2.5, drawShare: 0.28 },
    3: { championPoints: 69, lastClubPoints: 25, pointsSpread: 44, ppgStandardDeviation: 0.34, goalsPerMatch: 2.65, drawShare: 0.26 },
  } as const;
  return {
    worldSeed,
    divisionLevel,
    competitionId: `competition:${divisionLevel}`,
    seasonNumber,
    ...values[divisionLevel],
    reconciliationFailureCount: 0,
  };
}

function healthySeason(seasonNumber: number): LeagueDiversityCompetitionSeasonFact {
  return {
    worldSeed: "checkpoint-world",
    competitionId: "competition:test",
    seasonNumber,
    distinctFormationCount: 8,
    replicatedFormationCount: 6,
    topFormationShare: 0.25,
    primaryRolePositiveCount: 10,
    fallbackSelectionCount: 0,
    selectionCount: 612,
    missingSelectionSourceCount: 0,
    missingStableIdCount: 0,
    reconciliationFailureCount: 0,
    identicalStartingXiAllFixturesClubCount: 0,
  };
}

function healthySubstitutionRow(
  side: "home" | "away",
  substitutionCount: number,
): SubstitutionMinuteWorldFacts["teamMatches"][number] {
  return {
    worldSeed: "l2-world",
    competitionId: "competition:test",
    seasonNumber: 1,
    fixtureId: "fixture:test",
    side,
    finalMinute: 90,
    substitutionCount,
    firstSubstitutionMinute: 60,
    substitutionWindowCount: 3,
    maximumSubstitutions: 5,
    substitutionWindowLimit: 3,
    automaticDecisionCount: 4,
    automaticCommandCount: substitutionCount,
    automaticDecisionReasonCounts: {
      forced_injury_replacement: 0,
      dismissal_reorganization: 0,
      low_condition: substitutionCount,
      poor_performance: 0,
      trailing_response: 0,
      protecting_lead: 0,
      no_legal_substitute: 0,
      no_material_change: 0,
      command_rejected: 0,
    },
    automaticReplacementFailureCounts: {
      substitution_limit: 0,
      no_available_bench: 0,
      no_positionally_credible_bench: 0,
      quality_floor: 0,
    },
    reconciliationFailureCount: 0,
    invalidMinuteCount: 0,
  };
}

function healthyAvailabilityWorld(worldSeed: string): AvailabilityAgingWorldFacts {
  return {
    worldSeed,
    teamMatches: [{
      worldSeed,
      competitionId: "competition:test",
      seasonNumber: 1,
      fixtureId: `fixture:${worldSeed}`,
      side: "home",
      recentUsePlayerCount: 11,
      unavailableSelectedPlayerCount: 0,
      lifecycleDiagnosticMissingCount: 0,
      consequenceMismatchCount: 0,
      playerMatchMinutes: 60_000,
      timeLossInjuryCount: 36,
      ageGroups: {
        under_24: { positiveMinuteAppearanceCount: 250, playerMatchMinutes: 15_000, timeLossInjuryCount: 9 },
        "24_29": { positiveMinuteAppearanceCount: 250, playerMatchMinutes: 15_000, timeLossInjuryCount: 9 },
        "30_32": { positiveMinuteAppearanceCount: 250, playerMatchMinutes: 15_000, timeLossInjuryCount: 9 },
        "33_plus": { positiveMinuteAppearanceCount: 250, playerMatchMinutes: 15_000, timeLossInjuryCount: 9 },
      },
    }],
  };
}

function observedWorld(value: unknown): Record<string, unknown> {
  return record(array(record(value).worlds)[0]);
}

function observedSeason(world: Record<string, unknown>): Record<string, unknown> {
  return record(array(world.seasons)[0]);
}

function record(value: unknown): Record<string, unknown> {
  assert.ok(typeof value === "object" && value !== null && !Array.isArray(value));
  return value as Record<string, unknown>;
}

function array(value: unknown): unknown[] {
  assert.ok(Array.isArray(value));
  return value;
}
