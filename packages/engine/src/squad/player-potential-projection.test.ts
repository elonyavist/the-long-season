import assert from "node:assert/strict";
import { test } from "vitest";

import {
  abilityValue,
  gameDate,
  playerId,
  PlayerPotentialProjectionPolicyError,
  type Player,
  type PlayerAbilities,
  type PlayerPotentialProjectionPolicyConfig,
  type PlayerRatingScaleConfig,
} from "@game/domain";

import {
  derivePlayerPotentialProjection,
  PlayerPotentialProjectionError,
} from "./player-potential-projection.ts";

const CURRENT_DATE = gameDate(30_000);

/** Synthetic headless factors exercise the ordered P10/P50/P90 contract. */
const policy: PlayerPotentialProjectionPolicyConfig = {
  schemaVersion: 1,
  version: "step01-large-room-typical-lower-envelope-v1",
  classification: "explicit_game_design_target",
  ageBandsByRoleFamily: {
    outfield: [
      band(0, 17, 900, 1_400, 4_000),
      band(18, 20, 500, 800, 3_000),
      band(21, 22, 200, 200, 2_000),
      band(23, 24, 100, 100, 1_000),
      band(25, 200, 0, 0, 0),
    ],
    goalkeeper: [
      band(0, 17, 600, 800, 3_000),
      band(18, 20, 600, 700, 2_500),
      band(21, 22, 400, 500, 2_000),
      band(23, 24, 300, 400, 1_500),
      band(25, 27, 100, 100, 1_000),
      band(28, 200, 0, 0, 0),
    ],
  },
};

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

test("derives ordered age-band projections for ages 15, 18, 22, and later", () => {
  const projections = [15, 18, 22, 25].map((age, index) =>
    derivePlayerPotentialProjection({
      player: playerFixture(index + 1, age, "striker", 7.5, 17),
      currentDate: CURRENT_DATE,
      policy,
      ratingScale: scale,
    })
  );

  for (const projection of projections) {
    assert.equal(
      projection.currentAbility <= projection.conservativeLowerAbility
      && projection.conservativeLowerAbility <= projection.expectedAbility
      && projection.expectedAbility <= projection.upperAbility
      && projection.upperAbility <= projection.storedCeilingAbility,
      true,
    );
    assert.equal(projection.currentRating, 2);
    assert.equal(projection.storedCeilingRating, 6);
    assert.equal(Object.isFrozen(projection), true);
  }
  assert.deepEqual(
    projections.map(({ conservativeLowerAbility }) =>
      Number(conservativeLowerAbility.toFixed(3))
    ),
    [8.355, 7.975, 7.69, 7.5],
  );
  assert.deepEqual(
    projections.map(({ upperAbility }) => Number(upperAbility.toFixed(3))),
    [11.3, 10.35, 9.4, 7.5],
  );
  assert.deepEqual(
    projections.map(({ upperRating }) => upperRating),
    [3, 3, 2.5, 2],
  );
});

test("maps current, conservative, expected, and upper values at half-star boundaries", () => {
  const projection = derivePlayerPotentialProjection({
    player: playerFixture(1, 15, "striker", 8.4, 8.65),
    currentDate: CURRENT_DATE,
    policy,
    ratingScale: scale,
  });

  assert.equal(projection.currentRating, 2);
  assert.equal(projection.conservativeLowerRating, 2);
  assert.equal(projection.expectedRating, 2);
  assert.equal(projection.upperRating, 2.5);
});

test("keeps zero-room projections singular and bounded by stored potential", () => {
  const projection = derivePlayerPotentialProjection({
    player: playerFixture(1, 18, "striker", 16, 16),
    currentDate: CURRENT_DATE,
    policy,
    ratingScale: scale,
  });

  assert.deepEqual(
    [
      projection.currentAbility,
      projection.conservativeLowerAbility,
      projection.expectedAbility,
      projection.upperAbility,
      projection.storedCeilingAbility,
    ],
    [16, 16, 16, 16, 16],
  );
  assert.deepEqual(
    [
      projection.currentRating,
      projection.conservativeLowerRating,
      projection.expectedRating,
      projection.upperRating,
      projection.storedCeilingRating,
    ],
    [5, 5, 5, 5, 5],
  );
});

test("uses the later goalkeeper evidence curve without selected-club inputs", () => {
  const goalkeeper = derivePlayerPotentialProjection({
    player: playerFixture(1, 24, "goalkeeper", 10, 17),
    currentDate: CURRENT_DATE,
    policy,
    ratingScale: scale,
  });
  const outfield = derivePlayerPotentialProjection({
    player: playerFixture(2, 24, "striker", 10, 17),
    currentDate: CURRENT_DATE,
    policy,
    ratingScale: scale,
  });

  assert.equal(goalkeeper.roleFamily, "goalkeeper");
  assert.equal(outfield.roleFamily, "outfield");
  assert.equal(goalkeeper.expectedAbility > outfield.expectedAbility, true);
  assert.equal(goalkeeper.upperAbility > outfield.upperAbility, true);
  assert.equal(Math.abs(goalkeeper.expectedAbility - 10.28) < 1e-9, true);
  assert.equal(Math.abs(outfield.expectedAbility - 10.07) < 1e-9, true);
});

test("keeps public width non-increasing within each role family", () => {
  for (const family of ["goalkeeper", "outfield"] as const) {
    let previousWidth = Number.POSITIVE_INFINITY;
    for (const ageBand of policy.ageBandsByRoleFamily[family]) {
      const width = ageBand.upperRealizationBasisPoints
        - ageBand.conservativeRealizationBasisPoints;
      assert.equal(
        width <= previousWidth,
        true,
        `${family} public width widened at age ${ageBand.minimumAge}`,
      );
      previousWidth = width;
    }
  }
});

test("is deterministic, does not mutate inputs, and rejects incomplete facts", () => {
  const player = playerFixture(1, 15, "striker", 7.5, 17);
  const before = structuredClone(player);
  const first = derivePlayerPotentialProjection({
    player,
    currentDate: CURRENT_DATE,
    policy,
    ratingScale: scale,
  });
  const replay = derivePlayerPotentialProjection({
    player,
    currentDate: CURRENT_DATE,
    policy,
    ratingScale: scale,
  });

  assert.deepEqual(first, replay);
  assert.deepEqual(player, before);
  const { primaryRole: _primaryRole, ...missingRole } = player;
  assert.throws(
    () => derivePlayerPotentialProjection({
      player: missingRole,
      currentDate: CURRENT_DATE,
      policy,
      ratingScale: scale,
    }),
    (error) =>
      error instanceof PlayerPotentialProjectionError
      && error.code === "missing_role_identity",
  );
  assert.throws(
    () => derivePlayerPotentialProjection({
      player,
      currentDate: gameDate(Number(player.birthDate) - 1),
      policy,
      ratingScale: scale,
    }),
    (error) =>
      error instanceof PlayerPotentialProjectionError
      && error.code === "date_before_birth",
  );
});

test("rejects invalid policy factor ordering before deriving a projection", () => {
  assert.throws(
    () => derivePlayerPotentialProjection({
      player: playerFixture(1, 15, "striker", 7.5, 17),
      currentDate: CURRENT_DATE,
      policy: {
        ...policy,
        ageBandsByRoleFamily: {
          ...policy.ageBandsByRoleFamily,
          outfield: [band(0, 200, 2_000, 1_000, 3_000)],
        },
      },
      ratingScale: scale,
    }),
    (error) =>
      error instanceof PlayerPotentialProjectionPolicyError
      && error.code === "invalid_realization_factors",
  );
});

function band(
  minimumAge: number,
  maximumAge: number,
  conservativeRealizationBasisPoints: number,
  expectedRealizationBasisPoints: number,
  upperRealizationBasisPoints: number,
) {
  return {
    minimumAge,
    maximumAge,
    conservativeRealizationBasisPoints,
    expectedRealizationBasisPoints,
    upperRealizationBasisPoints,
  };
}

function playerFixture(
  sequence: number,
  age: number,
  role: "goalkeeper" | "striker",
  current: number,
  potential: number,
): Player {
  return {
    id: playerId(`player:projection-${String(sequence).padStart(2, "0")}`),
    firstName: "Projection",
    lastName: String(sequence),
    birthDate: gameDate(Number(CURRENT_DATE) - Math.ceil(age * 365.2425)),
    naturalPositions: role === "goalkeeper" ? ["gk"] : ["st"],
    primaryRole: role,
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
