import assert from "node:assert/strict";
import { test } from "vitest";

import {
  abilityValue,
  gameDate,
  playerId,
  type Player,
  type PlayerAbilities,
  type PlayerPotentialProjectionPolicyConfig,
  type PlayerRatingScaleConfig,
} from "@game/domain";

import {
  derivePublicPlayerAssessments,
  PublicPlayerAssessmentError,
} from "./public-player-assessment.ts";

const scale: PlayerRatingScaleConfig = {
  schemaVersion: 1,
  version: "test-global-rating-v1",
  classification: "explicit_game_design_target",
  supportedRatings: [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6],
  abilityThresholds: [
    { minimumAbilityInclusive: 0, rating: 1 },
    { minimumAbilityInclusive: 6.5, rating: 1.5 },
    { minimumAbilityInclusive: 7.5, rating: 2 },
    { minimumAbilityInclusive: 8.5, rating: 2.5 },
    { minimumAbilityInclusive: 9.5, rating: 3 },
    { minimumAbilityInclusive: 12.5, rating: 3.5 },
    { minimumAbilityInclusive: 14.5, rating: 4 },
    { minimumAbilityInclusive: 15.5, rating: 4.5 },
    { minimumAbilityInclusive: 16, rating: 5 },
    { minimumAbilityInclusive: 16.5, rating: 5.5 },
    { minimumAbilityInclusive: 17, rating: 6 },
  ],
  divisionFirstTeamBands: [
    { division: "first_division", normalMinimum: 3, normalMaximum: 5.5, exceptionalMaximum: 6 },
    { division: "second_division", normalMinimum: 2, normalMaximum: 3.5, exceptionalMaximum: 4 },
    { division: "third_division", normalMinimum: 1, normalMaximum: 3, exceptionalMaximum: 3.5 },
  ],
  rarity: {
    initialWorld: {
      currentSixMinimum: 1,
      currentSixMaximum: 2,
      potentialSixMinimum: 2,
      potentialSixMaximum: 4,
      lowerDivisionPotentialSixMaximum: 1,
    },
    annualIntake: {
      potentialSixPerWorldMinimum: 0,
      potentialSixPerWorldMaximum: 1,
      tenSeasonCohortMinimum: 2,
      tenSeasonCohortMaximum: 4,
    },
    yearTen: {
      activeCurrentSixMaximum: 4,
      activePotentialSixMaximum: 8,
      lowerDivisionPotentialSixMaximum: 1,
    },
  },
};

const projectionPolicy: PlayerPotentialProjectionPolicyConfig = {
  schemaVersion: 1,
  version: "test-projection-v1",
  classification: "explicit_game_design_target",
  ageBandsByRoleFamily: {
    goalkeeper: [
      {
        minimumAge: 0,
        maximumAge: 200,
        conservativeRealizationBasisPoints: 1_000,
        expectedRealizationBasisPoints: 2_000,
        upperRealizationBasisPoints: 4_000,
      },
    ],
    outfield: [
      {
        minimumAge: 0,
        maximumAge: 200,
        conservativeRealizationBasisPoints: 1_000,
        expectedRealizationBasisPoints: 2_000,
        upperRealizationBasisPoints: 4_000,
      },
    ],
  },
};

test("implements every accepted half-open ability boundary", () => {
  const boundaryValues = [
    [0, 1],
    [6.499, 1],
    [6.5, 1.5],
    [7.499, 1.5],
    [7.5, 2],
    [8.5, 2.5],
    [9.5, 3],
    [12.5, 3.5],
    [14.5, 4],
    [15.5, 4.5],
    [16, 5],
    [16.5, 5.5],
    [17, 6],
    [20, 6],
  ] as const;

  const assessments = derivePublicPlayerAssessments({
    ...projectedInput(boundaryValues.map(([ability], index) =>
      playerFixture(index + 1, ability, ability))),
  });

  assert.deepEqual(
    assessments.map((assessment) => assessment.currentRating.stars),
    boundaryValues.map(([, rating]) => rating),
  );
});

test("keeps a stored six-star ceiling distinct from the public upper estimate", () => {
  const [assessment] = derivePublicPlayerAssessments({
    ...projectedInput([playerFixture(1, 10, 17)]),
  });

  assert.deepEqual(assessment, {
    playerId: playerId("player:assessment-01"),
    currentRating: { stars: 3 },
    potentialProjection: {
      lowerRating: { stars: 3 },
      expectedRating: { stars: 3 },
      upperRating: { stars: 3.5 },
    },
  });
  assert.equal(JSON.stringify(assessment).includes("Ability"), false);
  assert.equal(JSON.stringify(assessment).includes("elite"), false);
});

test("the same player is independent of any selected club or caller grouping", () => {
  const player = playerFixture(1, 16.5, 17);
  const alone = derivePublicPlayerAssessments(projectedInput([player]))[0];
  const withDifferentPeers = derivePublicPlayerAssessments({
    ...projectedInput([playerFixture(2, 1, 1), player, playerFixture(3, 20, 20)]),
  })[1];

  assert.deepEqual(alone, withDifferentPeers);
});

test("preserves order, rejects duplicates, and rejects missing role identity", () => {
  const first = playerFixture(1, 10, 12);
  const second = playerFixture(2, 12, 14);
  assert.deepEqual(
    derivePublicPlayerAssessments(projectedInput([second, first]))
      .map((assessment) => assessment.playerId),
    [second.id, first.id],
  );
  assert.throws(
    () => derivePublicPlayerAssessments(projectedInput([first, first])),
    (error) => error instanceof PublicPlayerAssessmentError && error.code === "duplicate_player",
  );
  assert.throws(
    () => derivePublicPlayerAssessments({
      ...projectedInput([withoutPrimaryRole(first)]),
    }),
    (error) => error instanceof PublicPlayerAssessmentError && error.code === "missing_role_identity",
  );
});

function projectedInput(players: readonly Player[]) {
  return {
    ratingScale: scale,
    potentialProjectionPolicy: projectionPolicy,
    currentDate: gameDate(15_844),
    players,
  };
}

function withoutPrimaryRole(player: Player): Player {
  const { primaryRole: _primaryRole, ...missingRole } = player;
  return missingRole;
}

function playerFixture(sequence: number, current: number, potential: number): Player {
  const id = playerId(`player:assessment-${String(sequence).padStart(2, "0")}`);
  return {
    id,
    firstName: "Test",
    lastName: String(sequence),
    birthDate: gameDate(10_000),
    naturalPositions: ["st"],
    primaryRole: "striker",
    abilities: uniformAbilities(current),
    potential: uniformAbilities(potential),
  };
}

function uniformAbilities(value: number): PlayerAbilities {
  const rating = abilityValue(value);
  return {
    technical: {
      finishing: rating,
      passing: rating,
      longPassing: rating,
      crossing: rating,
      dribbling: rating,
      technique: rating,
      tackling: rating,
      penalties: rating,
      freeKicks: rating,
    },
    physical: {
      pace: rating,
      strength: rating,
      stamina: rating,
      agility: rating,
      heading: rating,
    },
    mental: {
      positioning: rating,
      vision: rating,
      anticipation: rating,
      composure: rating,
      determination: rating,
      leadership: rating,
    },
    goalkeeping: {
      reflexes: rating,
      handling: rating,
      rushingOut: rating,
      goalkeeperPositioning: rating,
      footwork: rating,
    },
  };
}
