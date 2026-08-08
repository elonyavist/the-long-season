import assert from "node:assert/strict";
import { test } from "vitest";

import { createCareerSectionsFacts } from "./career-sections.ts";

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
}, 60_000);

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
