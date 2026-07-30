import assert from "node:assert/strict";
import { test } from "vitest";

import { nonNegativeMoney } from "../value-objects/money.ts";
import { clubId, competitionId } from "../types/ids.ts";
import {
  CompetitionError,
  createCompetition,
  CompetitionMatchRulesError,
  createCompetitionMatchRules,
  createCompetitionSeasonDistribution,
} from "./competition.entity.ts";

test("competition construction preserves explicit club order and copied rules", () => {
  const first = clubId("club:first");
  const second = clubId("club:second");
  const competition = createCompetition({
    id: competitionId("competition:test"),
    name: " Test League ",
    clubIds: [second, first],
    matchRules: rules(),
  });

  assert.equal(competition.name, "Test League");
  assert.deepEqual(competition.clubIds, [second, first]);
});

test("competition construction rejects duplicate membership", () => {
  const first = clubId("club:first");
  assert.throws(
    () => createCompetition({
      id: competitionId("competition:test"),
      name: "Test",
      clubIds: [first, first],
      matchRules: rules(),
    }),
    (error: unknown) => error instanceof CompetitionError && error.code === "duplicate_club",
  );
});

test("competition season distributions cover every ordered final position", () => {
  const distribution = createCompetitionSeasonDistribution({
    currency: "EUR",
    prizes: [
      { position: 1, amount: nonNegativeMoney(2_000_000_00) },
      { position: 2, amount: nonNegativeMoney(1_500_000_00) },
    ],
  }, 2);

  assert.equal(distribution.prizes[0]?.position, 1);
  assert.throws(
    () => createCompetitionSeasonDistribution({
      currency: "EUR",
      prizes: [{ position: 2, amount: nonNegativeMoney(1_000_000_00) }],
    }, 1),
    /position must be 1/,
  );
});

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

function rules() {
  return {
    maximumSubstitutions: 5,
    substitutionWindowLimit: null,
    allowsPlayerReentry: false,
    yellowCardAccumulationThreshold: 5,
    straightRedSuspensionMatches: 3,
    secondYellowSuspensionMatches: 1,
    yellowAccumulationSuspensionMatches: 1,
  } as const;
}
