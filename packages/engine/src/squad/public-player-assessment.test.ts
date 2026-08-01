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

import { PlayerPotentialProjectionError } from "./player-potential-projection.ts";
import { derivePublicPlayerAssessment } from "./public-player-assessment.ts";

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
      establishedCurrentSixMinimum: 2,
      establishedCurrentSixMaximum: 3,
      youngStoredCeilingSixMinimum: 4,
      youngStoredCeilingSixMaximum: 5,
      lowerDivisionYoungStoredCeilingSixMaximum: 1,
      youngStoredCeilingSixPerClubMaximum: 1,
    },
    annualIntake: {
      activeYoungStoredCeilingSixTargetMinimum: 4,
      activeYoungStoredCeilingSixTargetMaximum: 5,
    },
  },
};

const projectionPolicy: PlayerPotentialProjectionPolicyConfig = {
  schemaVersion: 2,
  version: "test-projection-v2",
  classification: "explicit_game_design_target",
  ageBandsByRoleFamily: {
    goalkeeper: [
      band(0, 17, 3_000, 10_000),
      band(18, 20, 2_500, 10_000),
      band(21, 21, 2_300, 8_000),
      band(22, 22, 2_100, 7_500),
      band(23, 23, 1_900, 7_000),
      band(24, 24, 1_700, 6_500),
      band(25, 25, 1_500, 6_000),
      band(26, 26, 1_200, 5_500),
      band(27, 27, 900, 5_000),
      band(28, 28, 800, 4_000),
      band(29, 29, 600, 3_500),
      band(30, 30, 400, 3_000),
      band(31, 31, 200, 2_000),
      band(32, 200, 0, 0),
    ],
    outfield: [
      band(0, 17, 4_000, 10_000),
      band(18, 20, 3_000, 10_000),
      band(21, 21, 2_000, 6_000),
      band(22, 22, 1_700, 5_500),
      band(23, 23, 1_400, 5_000),
      band(24, 24, 1_100, 4_500),
      band(25, 25, 800, 3_500),
      band(26, 26, 500, 2_500),
      band(27, 27, 200, 1_500),
      band(28, 200, 0, 0),
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

  assert.deepEqual(
    boundaryValues.map(([ability], index) =>
      derivePublicPlayerAssessment(projectedInput(
        playerFixture(index + 1, ability, ability),
      )).currentRating.stars),
    boundaryValues.map(([, rating]) => rating),
  );
});

test("exposes current, P50, and upper facts without leaking stored ceiling", () => {
  const assessment = derivePublicPlayerAssessment(
    projectedInput(playerFixture(1, 10, 17)),
  );

  const {
    currentAbility,
    p50Ability,
    upperAbility,
    ...publicShape
  } = assessment;
  assert.deepEqual(publicShape, {
    playerId: playerId("player:assessment-01"),
    assessedOn: gameDate(15_844),
    age: 16,
    roleFamily: "outfield",
    currentRating: { stars: 3 },
    p50Rating: { stars: 3.5 },
    upperRating: { stars: 6 },
  });
  assert.equal(Math.abs(currentAbility - 10) < 1e-9, true);
  assert.equal(Math.abs(p50Ability - 12.8) < 1e-9, true);
  assert.equal(Math.abs(upperAbility - 17) < 1e-9, true);
  const serialized = JSON.stringify(assessment).toLowerCase();
  assert.equal(serialized.includes("stored"), false);
  assert.equal(serialized.includes("ceiling"), false);
  assert.equal(serialized.includes("potential"), false);
});

test("returns an immutable assessment independent of caller grouping", () => {
  const player = playerFixture(1, 16.5, 17);
  const assessment = derivePublicPlayerAssessment(projectedInput(player));

  assert.equal(Object.isFrozen(assessment), true);
  assert.equal(Object.isFrozen(assessment.currentRating), true);
  assert.deepEqual(
    assessment,
    derivePublicPlayerAssessment(projectedInput(player)),
  );
});

test("delegates incomplete role identity to the canonical projection error", () => {
  assert.throws(
    () => derivePublicPlayerAssessment(
      projectedInput(withoutPrimaryRole(playerFixture(1, 10, 12))),
    ),
    (error) => error instanceof PlayerPotentialProjectionError
      && error.code === "missing_role_identity",
  );
});

function projectedInput(player: Player) {
  return {
    ratingScale: scale,
    potentialProjectionPolicy: projectionPolicy,
    currentDate: gameDate(15_844),
    player,
  };
}

function band(
  minimumAge: number,
  maximumAge: number,
  p50RealizationBasisPoints: number,
  upperRealizationBasisPoints: number,
) {
  return {
    minimumAge,
    maximumAge,
    p50RealizationBasisPoints,
    upperRealizationBasisPoints,
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
