import assert from "node:assert/strict";
import { test } from "vitest";

import {
  deriveYouthDevelopmentLevel,
  youthDevelopmentCurrentBoost,
  youthDevelopmentInterestingChance,
  youthDevelopmentRarityCandidateScoreModifier,
} from "./youth-development-level.ts";

/** Tests protect division-first academy-level derivation and bounded modifiers. */

test("deriveYouthDevelopmentLevel uses division first and reputation second", () => {
  assert.equal(deriveYouthDevelopmentLevel({ division: "third_division", clubReputation: 3 }), 1);
  assert.equal(deriveYouthDevelopmentLevel({ division: "third_division", clubReputation: 10 }), 5);
  assert.equal(deriveYouthDevelopmentLevel({ division: "second_division", clubReputation: 7 }), 4);
  assert.equal(deriveYouthDevelopmentLevel({ division: "first_division", clubReputation: 9 }), 5);
});

test("youth-development modifiers stay small and ordered", () => {
  const low = deriveYouthDevelopmentLevel({ division: "third_division", clubReputation: 3 });
  const mid = deriveYouthDevelopmentLevel({ division: "third_division", clubReputation: 5 });
  const high = deriveYouthDevelopmentLevel({ division: "first_division", clubReputation: 9 });

  assert.equal(youthDevelopmentInterestingChance(low) < youthDevelopmentInterestingChance(mid), true);
  assert.equal(youthDevelopmentInterestingChance(mid) < youthDevelopmentInterestingChance(high), true);
  assert.equal(Math.abs(youthDevelopmentCurrentBoost(high)) <= 0.05, true);
  assert.equal(youthDevelopmentRarityCandidateScoreModifier(high) < youthDevelopmentRarityCandidateScoreModifier(low), true);
});
