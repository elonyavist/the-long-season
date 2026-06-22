import assert from "node:assert/strict";
import { test } from "vitest";

import { clubId, gameDate, seasonId } from "@game/domain";
import { fromISO } from "@game/shared";

import { generateCareerIntakePlayers } from "./career-intake-players.ts";

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

test("generateCareerIntakePlayers avoids duplicate full names and surnames inside one batch", () => {
  const result = generateCareerIntakePlayers(intakeInput("name-intake"));
  const fullNames = result.generatedPlayers.map((generated) => `${generated.player.firstName} ${generated.player.lastName}`);
  const lastNames = result.generatedPlayers.map((generated) => generated.player.lastName);

  assert.equal(new Set(fullNames).size, fullNames.length);
  assert.equal(new Set(lastNames).size, lastNames.length);
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
