import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "vitest";

import { GENERATED_SQUAD_IDENTITY_KEYS } from "@game/content";

import {
  createCareerSectionsFacts,
  evaluateLeagueDiversityCheckpoint,
  type LeagueDiversityCompetitionSeasonFact,
  type LeagueDiversityOpeningCompetitionFact,
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
    meanOutOfPositionSlots: 0,
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
