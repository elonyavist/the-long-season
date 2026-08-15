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
import { fromISO, toISO } from "@game/shared";

import {
  derivePlayerPotentialProjection,
  PlayerPotentialProjectionError,
} from "./player-potential-projection.ts";

const CURRENT_DATE = gameDate(30_000);

/** Synthetic headless factors exercise the ordered current/P50/upper contract. */
const policy: PlayerPotentialProjectionPolicyConfig = {
  schemaVersion: 2,
  version: "test-current-p50-upper-v1",
  classification: "explicit_game_design_target",
  ageBandsByRoleFamily: {
    outfield: [
      band(0, 17, 4_000, 10_000),
      band(18, 20, 3_000, 10_000),
      band(21, 21, 2_000, 6_000),
      band(22, 22, 1_500, 5_000),
      band(23, 23, 1_000, 4_000),
      band(24, 24, 750, 3_000),
      band(25, 25, 500, 2_000),
      band(26, 26, 250, 1_000),
      band(27, 27, 0, 0),
      band(28, 200, 0, 0),
    ],
    goalkeeper: [
      band(0, 17, 3_000, 10_000),
      band(18, 20, 2_500, 10_000),
      band(21, 21, 2_200, 8_000),
      band(22, 22, 2_000, 7_000),
      band(23, 23, 1_800, 6_000),
      band(24, 24, 1_600, 5_000),
      band(25, 25, 1_400, 4_000),
      band(26, 26, 1_200, 3_000),
      band(27, 27, 1_000, 2_000),
      band(28, 28, 800, 1_500),
      band(29, 29, 600, 1_000),
      band(30, 30, 400, 700),
      band(31, 31, 200, 300),
      band(32, 200, 0, 0),
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
      activeYoungStoredCeilingFiveOrBetterTargetMinimumBasisPoints: 9_000,
      activeYoungStoredCeilingFiveOrBetterTargetMaximumBasisPoints: 10_000,
      activeYoungStoredCeilingFiveOrBetterPerClubMaximum: 2,
    },
  },
};

test("derives ordered age-band projections for young, narrowing, and terminal ages", () => {
  const projections = [15, 18, 22, 25, 28].map((age, index) =>
    derivePlayerPotentialProjection({
      player: playerFixture(index + 1, age, "striker", 7.5, 17),
      currentDate: CURRENT_DATE,
      policy,
      ratingScale: scale,
    })
  );

  for (const projection of projections) {
    assert.equal(
      projection.currentAbility <= projection.p50Ability
      && projection.p50Ability <= projection.upperAbility
      && projection.upperAbility <= projection.storedCeilingAbility,
      true,
    );
    assert.equal(projection.currentRating, 2);
    assert.equal(projection.storedCeilingRating, 6);
    assert.equal(Object.isFrozen(projection), true);
  }
  assert.deepEqual(
    projections.map(({ p50Ability }) =>
      Number(p50Ability.toFixed(3))
    ),
    [11.3, 10.35, 8.925, 7.975, 7.5],
  );
  assert.deepEqual(
    projections.map(({ upperAbility }) => Number(upperAbility.toFixed(3))),
    [17, 17, 12.25, 9.4, 7.5],
  );
  assert.deepEqual(
    projections.map(({ upperRating }) => upperRating),
    [6, 6, 3, 2.5, 2],
  );
});

test("maps current, P50, and upper values at half-star boundaries", () => {
  const projection = derivePlayerPotentialProjection({
    player: playerFixture(1, 15, "striker", 8.4, 8.65),
    currentDate: CURRENT_DATE,
    policy,
    ratingScale: scale,
  });

  assert.equal(projection.currentRating, 2);
  assert.equal(projection.p50Rating, 2.5);
  assert.equal(projection.upperRating, 2.5);
});

test("selects age bands on exact civil birthdays", () => {
  const player = {
    ...playerFixture(1, 17, "striker", 7.5, 17),
    birthDate: gameDate(fromISO("2004-08-01")),
  };

  const beforeBirthday = derivePlayerPotentialProjection({
    player,
    currentDate: gameDate(fromISO("2025-07-31")),
    policy,
    ratingScale: scale,
  });
  const onBirthday = derivePlayerPotentialProjection({
    player,
    currentDate: gameDate(fromISO("2025-08-01")),
    policy,
    ratingScale: scale,
  });

  assert.equal(beforeBirthday.age, 20);
  assert.equal(beforeBirthday.upperAbility, beforeBirthday.storedCeilingAbility);
  assert.equal(onBirthday.age, 21);
  assert.equal(onBirthday.upperAbility < onBirthday.storedCeilingAbility, true);
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
      projection.p50Ability,
      projection.upperAbility,
      projection.storedCeilingAbility,
    ],
    [16, 16, 16, 16],
  );
  assert.deepEqual(
    [
      projection.currentRating,
      projection.p50Rating,
      projection.upperRating,
      projection.storedCeilingRating,
    ],
    [5, 5, 5, 5],
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
  assert.equal(goalkeeper.p50Ability > outfield.p50Ability, true);
  assert.equal(goalkeeper.upperAbility > outfield.upperAbility, true);
  assert.equal(Math.abs(goalkeeper.p50Ability - 11.12) < 1e-9, true);
  assert.equal(Math.abs(outfield.p50Ability - 10.525) < 1e-9, true);
});

test("narrows exact-age upper factors until zero within each role family", () => {
  for (const family of ["goalkeeper", "outfield"] as const) {
    let previousWidth = Number.POSITIVE_INFINITY;
    for (const ageBand of policy.ageBandsByRoleFamily[family]) {
      const width = ageBand.upperRealizationBasisPoints;
      assert.equal(
        width <= previousWidth,
        true,
        `${family} upper realization widened at age ${ageBand.minimumAge}`,
      );
      if (ageBand.minimumAge > 20 && previousWidth > 0) {
        assert.equal(width < previousWidth, true);
      }
      previousWidth = width;
    }
  }
});

test("enforces full young upper and role-specific terminal ages", () => {
  for (const role of ["striker", "goalkeeper"] as const) {
    for (const age of [15, 20]) {
      const projection = derivePlayerPotentialProjection({
        player: playerFixture(age, age, role, 7.5, 17),
        currentDate: CURRENT_DATE,
        policy,
        ratingScale: scale,
      });
      assert.equal(projection.upperAbility, projection.storedCeilingAbility);
    }
  }

  const outfieldAt28 = derivePlayerPotentialProjection({
    player: playerFixture(28, 28, "striker", 7.5, 17),
    currentDate: CURRENT_DATE,
    policy,
    ratingScale: scale,
  });
  const goalkeeperAt32 = derivePlayerPotentialProjection({
    player: playerFixture(32, 32, "goalkeeper", 7.5, 17),
    currentDate: CURRENT_DATE,
    policy,
    ratingScale: scale,
  });

  assert.equal(outfieldAt28.upperAbility, outfieldAt28.currentAbility);
  assert.equal(goalkeeperAt32.upperAbility, goalkeeperAt32.currentAbility);
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
          outfield: [
            { ...policy.ageBandsByRoleFamily.outfield[0]!, p50RealizationBasisPoints: 10_001 },
            ...policy.ageBandsByRoleFamily.outfield.slice(1),
          ],
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
    birthDate: birthDateForCompletedAge(age),
    naturalPositions: role === "goalkeeper" ? ["gk"] : ["st"],
    primaryRole: role,
    abilities: uniformAbilities(current),
    potential: uniformAbilities(potential),
  };
}

/** Builds an exact-birthday fixture instead of approximating years as days. */
function birthDateForCompletedAge(age: number) {
  const [currentYear, month, day] = toISO(CURRENT_DATE).split("-");
  if (currentYear === undefined || month === undefined || day === undefined) {
    throw new Error("Current projection test date must be a valid ISO date");
  }
  return gameDate(fromISO(
    `${String(Number(currentYear) - age).padStart(4, "0")}-${month}-${day}`,
  ));
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
