import assert from "node:assert/strict";
import { test } from "vitest";

import { CompetitionMatchRulesError, createCompetitionMatchRules } from "./competition.entity.ts";

test("competition rules express the playable league without substitution windows or re-entry", () => {
  assert.deepEqual(
    createCompetitionMatchRules({
      maximumSubstitutions: 5,
      substitutionWindowLimit: null,
      allowsPlayerReentry: false,
      yellowCardAccumulationThreshold: 5,
      straightRedSuspensionMatches: 3,
      secondYellowSuspensionMatches: 1,
      yellowAccumulationSuspensionMatches: 1,
    }),
    {
      maximumSubstitutions: 5,
      substitutionWindowLimit: null,
      allowsPlayerReentry: false,
      yellowCardAccumulationThreshold: 5,
      straightRedSuspensionMatches: 3,
      secondYellowSuspensionMatches: 1,
      yellowAccumulationSuspensionMatches: 1,
    },
  );
});

test("competition rules reject impossible substitution and discipline values", () => {
  assert.throws(
    () => createCompetitionMatchRules({
      maximumSubstitutions: -1,
      substitutionWindowLimit: null,
      allowsPlayerReentry: false,
      yellowCardAccumulationThreshold: 5,
      straightRedSuspensionMatches: 3,
      secondYellowSuspensionMatches: 1,
      yellowAccumulationSuspensionMatches: 1,
    }),
    (error: unknown) => error instanceof CompetitionMatchRulesError && error.code === "invalid_maximum_substitutions",
  );

  assert.throws(
    () => createCompetitionMatchRules({
      maximumSubstitutions: 5,
      substitutionWindowLimit: 1.5,
      allowsPlayerReentry: false,
      yellowCardAccumulationThreshold: 5,
      straightRedSuspensionMatches: 3,
      secondYellowSuspensionMatches: 1,
      yellowAccumulationSuspensionMatches: 1,
    }),
    (error: unknown) => error instanceof CompetitionMatchRulesError && error.code === "invalid_substitution_window_limit",
  );

  assert.throws(
    () => createCompetitionMatchRules({
      maximumSubstitutions: 5,
      substitutionWindowLimit: null,
      allowsPlayerReentry: false,
      yellowCardAccumulationThreshold: 0,
      straightRedSuspensionMatches: 3,
      secondYellowSuspensionMatches: 1,
      yellowAccumulationSuspensionMatches: 1,
    }),
    (error: unknown) => error instanceof CompetitionMatchRulesError && error.code === "invalid_yellow_card_threshold",
  );
});
