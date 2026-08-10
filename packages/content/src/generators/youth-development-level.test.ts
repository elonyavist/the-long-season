import assert from "node:assert/strict";
import { test } from "vitest";

import {
  developmentEnvironmentForClubContext,
  deriveYouthDevelopmentLevel,
  youthDevelopmentCurrentBoost,
  youthDevelopmentInterestingChance,
  youthDevelopmentSeriousProspectChance,
} from "./youth-development-level.ts";

/** Tests protect division-first academy-level derivation and bounded modifiers. */

test("deriveYouthDevelopmentLevel uses division first and reputation second", () => {
  assert.equal(deriveYouthDevelopmentLevel({ division: "third_division", clubReputation: 3 }), 1);
  assert.equal(deriveYouthDevelopmentLevel({ division: "third_division", clubReputation: 10 }), 5);
  assert.equal(deriveYouthDevelopmentLevel({ division: "second_division", clubReputation: 7 }), 4);
  assert.equal(deriveYouthDevelopmentLevel({ division: "first_division", clubReputation: 9 }), 5);
});

test("youth-development modifiers stay small and ordered", () => {
  const low = "very_poor";
  const mid = "adequate";
  const high = "excellent";
  const highAcademyLevel = deriveYouthDevelopmentLevel({
    division: "first_division",
    clubReputation: 9,
  });

  assert.equal(youthDevelopmentInterestingChance(low) < youthDevelopmentInterestingChance(mid), true);
  assert.equal(youthDevelopmentInterestingChance(mid) < youthDevelopmentInterestingChance(high), true);
  assert.equal(youthDevelopmentSeriousProspectChance(low) < youthDevelopmentSeriousProspectChance(mid), true);
  assert.equal(youthDevelopmentSeriousProspectChance(mid) < youthDevelopmentSeriousProspectChance(high), true);
  assert.equal(youthDevelopmentSeriousProspectChance(high), 0.12);
  assert.equal(
    youthDevelopmentSeriousProspectChance(high)
      + youthDevelopmentInterestingChance(high) < 0.5,
    true,
  );
  assert.equal(Math.abs(youthDevelopmentCurrentBoost(highAcademyLevel)) <= 0.05, true);
});

test("development environment resolves from category and frozen competitive tier", () => {
  assert.equal(
    developmentEnvironmentForClubContext({
      category: "third_division",
      competitiveTier: "survival",
    }),
    "very_poor",
  );
  assert.equal(
    developmentEnvironmentForClubContext({
      category: "first_division",
      competitiveTier: "title_contender",
    }),
    "excellent",
  );
});
