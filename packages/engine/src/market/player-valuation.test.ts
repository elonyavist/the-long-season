import assert from "node:assert/strict";
import { test } from "vitest";

import {
  abilityValue,
  gameDate,
  playerId,
  type Player,
  type PlayerAbilities,
  type PlayerPosition,
  type PlayerRole,
} from "@game/domain";

import {
  PlayerValuationError,
  derivePlayerValuation as derivePlayerValuationWithMarketContext,
  type PlayerValuationConfig,
} from "./player-valuation.ts";
import { playerValuationConfigFixture } from "../test-fixtures/player-valuation-config.ts";

function derivePlayerValuation(
  input: Omit<
    Parameters<typeof derivePlayerValuationWithMarketContext>[0],
    "marketContext"
  >,
) {
  return derivePlayerValuationWithMarketContext({
    ...input,
    marketContext: { kind: "free_agent" },
  });
}

test("derives one deterministic nonlinear public value from explicit content", () => {
  const input = {
    player: playerFixture("one", "st", 14.5, 15.5, 24),
    currentDate: gameDate(20_000),
    config: playerValuationConfigFixture(),
  } as const;

  const first = derivePlayerValuation(input);
  const second = derivePlayerValuation(input);

  assert.deepEqual(second, first);
  assert.equal(first.age, 24);
  assert.equal(first.components.currentRating, 4);
  assert.equal(first.components.potentialLowerRating, 4);
  assert.equal(first.components.potentialExpectedRating, 4);
  assert.equal(first.components.potentialUpperRating, 4);
  assert.equal(first.components.ratingAnchorMinorUnits, 400_000_000);
  assert.equal(Number.isSafeInteger(first.value), true);
  assert.equal(first.value % 100, 0);
});

test("quality, range-aware expectation, age, and broad position affect value", () => {
  const currentDate = gameDate(20_000);
  const config = playerValuationConfigFixture();
  const weak = derivePlayerValuation({
    player: playerFixture("weak", "st", 8, 8, 16),
    currentDate,
    config,
  });
  const strong = derivePlayerValuation({
    player: playerFixture("strong", "st", 15, 15, 16),
    currentDate,
    config,
  });
  const prospect = derivePlayerValuation({
    player: playerFixture("prospect", "st", 15, 20, 16),
    currentDate,
    config,
  });
  const older = derivePlayerValuation({
    player: playerFixture("older", "st", 15, 20, 34),
    currentDate,
    config,
  });
  const goalkeeper = derivePlayerValuation({
    player: playerFixture("keeper", "gk", 15, 20, 16),
    currentDate,
    config,
  });

  assert.ok(strong.value > weak.value);
  assert.ok(prospect.value > strong.value);
  assert.ok(prospect.value > older.value);
  assert.ok(prospect.value > goalkeeper.value);
});

test("range expectation and uncertainty relationships remain monotonic", () => {
  const currentDate = gameDate(20_000);
  const baseConfig = playerValuationConfigFixture();
  const widePolicy = projectionPolicy(0, 2_000);
  const narrowerPolicy = projectionPolicy(1_000, 2_000);
  const current = 10;
  const lowCeiling = derivePlayerValuation({
    player: playerFixture("low-ceiling", "cm", current, 14, 16),
    currentDate,
    config: { ...baseConfig, potentialProjectionPolicy: widePolicy },
  });
  const highCeiling = derivePlayerValuation({
    player: playerFixture("high-ceiling", "cm", current, 18, 16),
    currentDate,
    config: { ...baseConfig, potentialProjectionPolicy: widePolicy },
  });
  const narrower = derivePlayerValuation({
    player: playerFixture("narrower", "cm", current, 18, 16),
    currentDate,
    config: { ...baseConfig, potentialProjectionPolicy: narrowerPolicy },
  });

  assert.ok(
    highCeiling.components.undiscountedPotentialExpectationMinorUnits
      >= lowCeiling.components.undiscountedPotentialExpectationMinorUnits,
  );
  assert.ok(
    narrower.components.potentialLowerRating
      >= highCeiling.components.potentialLowerRating,
  );
  assert.ok(
    narrower.components.uncertaintyMultiplierBasisPoints
      >= highCeiling.components.uncertaintyMultiplierBasisPoints,
  );
  assert.ok(narrower.value >= highCeiling.value);
});

test("a low-current elite-upside teenager is priced as a discounted prospect, not a champion", () => {
  const currentDate = gameDate(20_000);
  const config = playerValuationConfigFixture();
  const ordinary = derivePlayerValuationWithMarketContext({
    player: playerFixture("ordinary-teen", "st", 7.5, 8, 16),
    currentDate,
    config,
    marketContext: { kind: "contracted", division: "first_division" },
  });
  const eliteUpside = derivePlayerValuationWithMarketContext({
    player: playerFixture("elite-upside-teen", "st", 7.5, 17, 16),
    currentDate,
    config,
    marketContext: { kind: "contracted", division: "first_division" },
  });

  assert.equal(eliteUpside.components.currentRating, 2);
  assert.equal(eliteUpside.components.potentialUpperRating, 6);
  assert.ok(eliteUpside.value > ordinary.value * 10);
  assert.ok(eliteUpside.value < 150_000_000_00);
  assert.ok(
    eliteUpside.components.discountedPotentialExpectationMinorUnits
      < eliteUpside.components.undiscountedPotentialExpectationMinorUnits,
  );
});

test("progress and ordinary small gaps cannot reduce or wildly inflate quality", () => {
  const currentDate = gameDate(20_000);
  const config = playerValuationConfigFixture();
  const earlier = derivePlayerValuation({
    player: playerFixture("earlier", "cm", 12, 15, 19),
    currentDate,
    config,
  });
  const progressed = derivePlayerValuation({
    player: playerFixture("progressed", "cm", 13, 15, 19),
    currentDate,
    config,
  });
  const smallGap = derivePlayerValuation({
    player: playerFixture("small-gap", "cm", 13, 13.5, 19),
    currentDate,
    config,
  });
  const noGap = derivePlayerValuation({
    player: playerFixture("no-gap", "cm", 13, 13, 19),
    currentDate,
    config,
  });

  assert.ok(
    progressed.components.currentQualityValueMinorUnits
      >= earlier.components.currentQualityValueMinorUnits,
  );
  assert.ok(progressed.value >= earlier.value);
  assert.ok(smallGap.value <= noGap.value * 1.25);
});

test("uses continuous quality inside one star interval and only owner market context", () => {
  const currentDate = gameDate(20_000);
  const config = playerValuationConfigFixture();
  const lowerFourStar = playerFixture("lower-four", "st", 14.6, 14.6, 24);
  const upperFourStar = playerFixture("upper-four", "st", 15.4, 15.4, 24);
  const lower = derivePlayerValuation({
    player: lowerFourStar,
    currentDate,
    config,
  });
  const upper = derivePlayerValuation({
    player: upperFourStar,
    currentDate,
    config,
  });
  const firstDivision = derivePlayerValuationWithMarketContext({
    player: upperFourStar,
    currentDate,
    config,
    marketContext: { kind: "contracted", division: "first_division" },
  });
  const secondDivision = derivePlayerValuationWithMarketContext({
    player: upperFourStar,
    currentDate,
    config,
    marketContext: { kind: "contracted", division: "second_division" },
  });
  const thirdDivision = derivePlayerValuationWithMarketContext({
    player: upperFourStar,
    currentDate,
    config,
    marketContext: { kind: "contracted", division: "third_division" },
  });

  assert.equal(lower.components.currentRating, upper.components.currentRating);
  assert.ok(upper.value > lower.value);
  assert.ok(firstDivision.value > secondDivision.value);
  assert.ok(secondDivision.value > thirdDivision.value);
  assert.ok(thirdDivision.value <= 500_000_000);
});

test("only an age-eligible compressed six-star player can reach exactly 150m EUR", () => {
  const config = playerValuationConfigFixture();
  const currentDate = gameDate(20_000);
  const youngChampion = derivePlayerValuationWithMarketContext({
    player: playerFixture("young-six", "st", 18, 19, 23),
    currentDate,
    config,
    marketContext: { kind: "contracted", division: "first_division" },
  });
  const olderChampion = derivePlayerValuationWithMarketContext({
    player: playerFixture("older-six", "st", 18, 19, 28),
    currentDate,
    config,
    marketContext: { kind: "contracted", division: "first_division" },
  });
  const ordinaryYoungPlayer = derivePlayerValuationWithMarketContext({
    player: playerFixture("ordinary", "st", 16.7, 16.8, 23),
    currentDate,
    config,
    marketContext: { kind: "contracted", division: "first_division" },
  });

  assert.equal(youngChampion.value, 150_000_000_00);
  assert.equal(youngChampion.components.hardCapEligible, true);
  assert.equal(youngChampion.components.hardCapApplied, true);
  assert.ok(olderChampion.value <= 149_999_999_00);
  assert.equal(olderChampion.components.hardCapEligible, false);
  assert.ok(ordinaryYoungPlayer.value <= 149_999_999_00);
  assert.equal(ordinaryYoungPlayer.value % 100, 0);
});

test("compresses the upper tail for eligible and non-eligible players without exposing ability", () => {
  const config = playerValuationConfigFixture();
  const valuation = derivePlayerValuationWithMarketContext({
    player: playerFixture("older-six", "st", 18, 18, 30),
    currentDate: gameDate(20_000),
    config,
    marketContext: { kind: "contracted", division: "first_division" },
  });
  const eligible = derivePlayerValuationWithMarketContext({
    player: playerFixture("young-six-compressed", "st", 18, 18, 23),
    currentDate: gameDate(20_000),
    config,
    marketContext: { kind: "contracted", division: "first_division" },
  });

  assert.ok(
    valuation.components.valueBeforeTailCompressionMinorUnits > 8_000_000_000,
  );
  assert.ok(
    valuation.value
      < valuation.components.valueBeforeTailCompressionMinorUnits,
  );
  assert.ok(
    eligible.components.valueAfterTailCompressionMinorUnits
      < eligible.components.valueBeforeTailCompressionMinorUnits,
  );
  assert.equal("potentialAbilityAverage" in valuation, false);
  assert.equal("potentialAbility" in valuation.components, false);
  assert.equal("contractSecurityMultiplier" in valuation, false);
  assert.equal("formMultiplier" in valuation, false);
  assert.equal("club" in valuation.components, false);
});

function projectionPolicy(
  conservativeRealizationBasisPoints: number,
  expectedRealizationBasisPoints: number,
): PlayerValuationConfig["potentialProjectionPolicy"] {
  return {
    schemaVersion: 1,
    version: "projection-v1",
    classification: "explicit_game_design_target",
    ageBandsByRoleFamily: {
      goalkeeper: [{
        minimumAge: 0,
        maximumAge: 200,
        conservativeRealizationBasisPoints,
        expectedRealizationBasisPoints,
        upperRealizationBasisPoints: 10_000,
      }],
      outfield: [{
        minimumAge: 0,
        maximumAge: 200,
        conservativeRealizationBasisPoints,
        expectedRealizationBasisPoints,
        upperRealizationBasisPoints: 10_000,
      }],
    },
  };
}

test("prices ages outside the senior curve with the nearest boundary band", () => {
  const currentDate = gameDate(20_000);
  const config = playerValuationConfigFixture();
  const age14 = derivePlayerValuation({
    player: playerFixture("age-14", "cm", 10, 11, 14),
    currentDate,
    config,
  });
  const age15 = derivePlayerValuation({
    player: playerFixture("age-15", "cm", 10, 11, 15),
    currentDate,
    config,
  });
  const age46 = derivePlayerValuation({
    player: playerFixture("age-46", "cm", 10, 11, 46),
    currentDate,
    config,
  });
  const age45 = derivePlayerValuation({
    player: playerFixture("age-45", "cm", 10, 11, 45),
    currentDate,
    config,
  });

  assert.equal(age14.value, age15.value);
  assert.equal(age46.value, age45.value);
});

test("rejects incomplete player identity and mismatched content versions", () => {
  const config = playerValuationConfigFixture();
  assertValuationError(
    () => derivePlayerValuation({
      player: {
        ...playerFixture("no-position", "st", 10, 11, 24),
        naturalPositions: [],
      },
      currentDate: gameDate(20_000),
      config,
    }),
    "missing_primary_position",
  );
  const withRole = playerFixture("no-role", "st", 10, 11, 24);
  const { primaryRole: _role, ...withoutRole } = withRole;
  assertValuationError(
    () => derivePlayerValuation({
      player: withoutRole,
      currentDate: gameDate(20_000),
      config,
    }),
    "missing_role_identity",
  );
  assertValuationError(
    () => derivePlayerValuation({
      player: playerFixture("bad-version", "st", 10, 11, 24),
      currentDate: gameDate(20_000),
      config: {
        ...config,
        marketCalibration: {
          ...config.marketCalibration,
          version: "market:other",
        },
      },
    }),
    "invalid_config",
  );
});

function playerFixture(
  suffix: string,
  position: PlayerPosition,
  currentAbility: number,
  potentialAbility: number,
  age: number,
): Player {
  return {
    id: playerId(`player:test-${suffix}`),
    firstName: "Test",
    lastName: `Player${suffix}`,
    birthDate: gameDate(20_000 - Math.ceil(age * 365.2425)),
    naturalPositions: [position],
    primaryRole: roleForPosition(position),
    abilities: abilities(currentAbility),
    potential: abilities(potentialAbility),
  };
}

function roleForPosition(position: PlayerPosition): PlayerRole {
  if (position === "gk") return "goalkeeper";
  if (position === "cb") return "center_back";
  if (position === "rb" || position === "lb") return "full_back";
  if (position === "rwb" || position === "lwb") return "wing_back";
  if (position === "dm") return "defensive_midfielder";
  if (position === "cm") return "central_midfielder";
  if (position === "am") return "attacking_midfielder";
  if (position === "rw" || position === "lw") return "winger";
  return "striker";
}

function abilities(value: number): PlayerAbilities {
  const ability = abilityValue(value);
  return {
    technical: {
      finishing: ability,
      passing: ability,
      longPassing: ability,
      crossing: ability,
      dribbling: ability,
      technique: ability,
      tackling: ability,
      penalties: ability,
      freeKicks: ability,
    },
    physical: {
      pace: ability,
      strength: ability,
      stamina: ability,
      agility: ability,
      heading: ability,
    },
    mental: {
      positioning: ability,
      vision: ability,
      anticipation: ability,
      composure: ability,
      determination: ability,
      leadership: ability,
    },
    goalkeeping: {
      reflexes: ability,
      handling: ability,
      rushingOut: ability,
      goalkeeperPositioning: ability,
      footwork: ability,
    },
  };
}

function assertValuationError(
  action: () => void,
  code: PlayerValuationError["code"],
): void {
  assert.throws(
    action,
    (error) => error instanceof PlayerValuationError && error.code === code,
  );
}
