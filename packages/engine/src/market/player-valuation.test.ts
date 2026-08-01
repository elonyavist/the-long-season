import assert from "node:assert/strict";
import { test } from "vitest";

import {
  abilityValue,
  gameDate,
  playerId,
  type GameDate,
  type Player,
  type PlayerAbilities,
  type PlayerPosition,
  type PlayerRole,
  type PlayerStarRating,
} from "@game/domain";

import {
  PlayerValuationError,
  derivePlayerValuation,
  type PlayerValuationConfig,
} from "./player-valuation.ts";
import {
  derivePublicPlayerAssessment,
  type PublicPlayerAssessment,
} from "../squad/public-player-assessment.ts";
import { playerValuationConfigFixture } from "../test-fixtures/player-valuation-config.ts";

test("derives one deterministic nonlinear value from a precomputed public assessment", () => {
  const config = playerValuationConfigFixture();
  const player = playerFixture("one", "st", 14.5, 15.5, 24);
  const assessment = assessmentFor(player, gameDate(20_000), config);
  const input = {
    assessment,
    primaryPosition: "st",
    config,
  } as const;

  const first = derivePlayerValuation(input);
  const second = derivePlayerValuation(input);

  assert.deepEqual(second, first);
  assert.equal(first.age, 24);
  assert.equal(first.components.currentRating, 4);
  assert.equal(first.components.potentialP50Rating, 4);
  assert.equal(first.components.potentialUpperRating, 4);
  assert.equal(first.components.ratingAnchorMinorUnits, 400_000_000);
  assert.equal(
    first.components.expectedQualityValueMinorUnits,
    first.components.currentQualityValueMinorUnits
      + first.components.p50UpsideValueMinorUnits
      + first.components.upperOptionValueMinorUnits,
  );
  assert.equal(first.components.p50ParticipationBasisPoints, 5_000);
  assert.equal(first.components.upperOptionParticipationBasisPoints, 1_000);
  assert.equal(Number.isSafeInteger(first.value), true);
  assert.equal(first.value % 100, 0);
  assert.equal("marketContext" in config.valuationCurves, false);
  assert.equal("marketContextMultiplierBasisPoints" in first.components, false);
});

test("current quality, public upside, age, and position have distinct effects", () => {
  const config = playerValuationConfigFixture();
  const currentDate = gameDate(20_000);
  const weak = valuePlayer(
    playerFixture("weak", "st", 8, 8, 16),
    currentDate,
    config,
  );
  const strong = valuePlayer(
    playerFixture("strong", "st", 15, 15, 16),
    currentDate,
    config,
  );
  const young = valueAssessment(
    assessmentFixture("young", 16, 10, 14.5, 14.5, 3, 4, 4),
    "st",
    config,
  );
  const older = valueAssessment(
    assessmentFixture("older", 34, 10, 14.5, 14.5, 3, 4, 4),
    "st",
    config,
  );
  const goalkeeper = valueAssessment(
    assessmentFixture("keeper", 16, 10, 14.5, 14.5, 3, 4, 4),
    "gk",
    config,
  );

  assert.ok(strong.value > weak.value);
  assert.ok(young.value > older.value);
  assert.ok(young.value > goalkeeper.value);
});

test("prices P50 and upper as separate positive bounded upside tranches", () => {
  const config = playerValuationConfigFixture();
  const lowerP50 = valueAssessment(
    assessmentFixture("lower-p50", 19, 10, 14.5, 15.5, 3, 4, 4.5),
    "cm",
    config,
  );
  const higherP50 = valueAssessment(
    assessmentFixture("higher-p50", 19, 10, 15.4, 15.5, 3, 4, 4.5),
    "cm",
    config,
  );
  const widerUpper = valueAssessment(
    assessmentFixture("wider-upper", 19, 10, 15.4, 17, 3, 4, 6),
    "cm",
    config,
  );

  assert.ok(
    higherP50.components.p50QualityValueMinorUnits
      > lowerP50.components.p50QualityValueMinorUnits,
  );
  assert.ok(higherP50.value > lowerP50.value);
  assert.ok(
    widerUpper.components.upperQualityValueMinorUnits
      > higherP50.components.upperQualityValueMinorUnits,
  );
  assert.ok(widerUpper.components.upperOptionValueMinorUnits > 0);
  assert.ok(widerUpper.value > higherP50.value);
});

test("prices exact upper ability continuously inside one public star interval", () => {
  const config = playerValuationConfigFixture();
  const lowerUpperAbility = valueAssessment(
    assessmentFixture("upper-15-6", 19, 10, 14.8, 15.6, 3, 4, 4.5),
    "cm",
    config,
  );
  const higherUpperAbility = valueAssessment(
    assessmentFixture("upper-15-9", 19, 10, 14.8, 15.9, 3, 4, 4.5),
    "cm",
    config,
  );

  assert.ok(higherUpperAbility.value > lowerUpperAbility.value);
  assert.ok(
    higherUpperAbility.components.upperOptionValueMinorUnits
      > lowerUpperAbility.components.upperOptionValueMinorUnits,
  );
});

test("prices a low-current elite-upside teenager as a discounted prospect", () => {
  const currentDate = gameDate(20_000);
  const config = playerValuationConfigFixture();
  const ordinary = valuePlayer(
    playerFixture("ordinary-teen", "st", 7.5, 8, 16),
    currentDate,
    config,
  );
  const eliteUpside = valuePlayer(
    playerFixture("elite-upside-teen", "st", 7.5, 17, 16),
    currentDate,
    config,
  );

  assert.equal(eliteUpside.components.currentRating, 2);
  assert.equal(eliteUpside.components.potentialUpperRating, 6);
  assert.ok(eliteUpside.value > ordinary.value);
  assert.ok(eliteUpside.value < 15_000_000_000);
  assert.ok(
    eliteUpside.components.upperOptionValueMinorUnits
      < eliteUpside.components.upperQualityValueMinorUnits
        - eliteUpside.components.p50QualityValueMinorUnits,
  );
});

test("keeps current, P50, and upper independently monotonic before the shared cap", () => {
  const config = playerValuationConfigFixture();
  const currentBase = valueAssessment(
    assessmentFixture("current-base", 19, 10, 14.8, 16.5, 3, 4, 5.5),
    "cm",
    config,
  );
  const currentHigher = valueAssessment(
    assessmentFixture("current-higher", 19, 11, 14.8, 16.5, 3, 4, 5.5),
    "cm",
    config,
  );
  const p50Higher = valueAssessment(
    assessmentFixture("p50-higher", 19, 10, 15.2, 16.5, 3, 4, 5.5),
    "cm",
    config,
  );
  const upperHigher = valueAssessment(
    assessmentFixture("upper-higher", 19, 10, 14.8, 16.8, 3, 4, 5.5),
    "cm",
    config,
  );

  assert.ok(currentHigher.value > currentBase.value);
  assert.ok(p50Higher.value > currentBase.value);
  assert.ok(upperHigher.value > currentBase.value);
  assert.equal(currentBase.components.upperOptionValueMinorUnits > 0, true);
});

test("prices no upside when current, P50, and upper are equal", () => {
  const config = playerValuationConfigFixture();
  const noUpside = valueAssessment(
    assessmentFixture("no-upside", 19, 14.8, 14.8, 14.8, 4, 4, 4),
    "cm",
    config,
  );

  assert.equal(noUpside.components.p50UpsideValueMinorUnits, 0);
  assert.equal(noUpside.components.upperOptionValueMinorUnits, 0);
  assert.equal(
    noUpside.components.expectedQualityValueMinorUnits,
    noUpside.components.currentQualityValueMinorUnits,
  );
});

test("progress and ordinary small gaps cannot reduce or wildly inflate quality", () => {
  const currentDate = gameDate(20_000);
  const config = playerValuationConfigFixture();
  const earlier = valuePlayer(
    playerFixture("earlier", "cm", 12, 15, 19),
    currentDate,
    config,
  );
  const progressed = valuePlayer(
    playerFixture("progressed", "cm", 13, 15, 19),
    currentDate,
    config,
  );
  const smallGap = valuePlayer(
    playerFixture("small-gap", "cm", 13, 13.5, 19),
    currentDate,
    config,
  );
  const noGap = valuePlayer(
    playerFixture("no-gap", "cm", 13, 13, 19),
    currentDate,
    config,
  );

  assert.ok(
    progressed.components.currentQualityValueMinorUnits
      >= earlier.components.currentQualityValueMinorUnits,
  );
  assert.ok(progressed.value >= earlier.value);
  assert.ok(smallGap.value <= noGap.value * 1.25);
});

test("uses continuous quality inside one star interval without owner context", () => {
  const currentDate = gameDate(20_000);
  const config = playerValuationConfigFixture();
  const lower = valuePlayer(
    playerFixture("lower-four", "st", 14.6, 14.6, 24),
    currentDate,
    config,
  );
  const upper = valuePlayer(
    playerFixture("upper-four", "st", 15.4, 15.4, 24),
    currentDate,
    config,
  );

  assert.equal(lower.components.currentRating, upper.components.currentRating);
  assert.ok(upper.value > lower.value);
  assert.equal("marketContextMaximumMinorUnits" in upper.components, false);
});

test("only an age-eligible compressed six-star player can reach exactly 150m EUR", () => {
  const config = playerValuationConfigFixture();
  const currentDate = gameDate(20_000);
  const youngChampion = valuePlayer(
    playerFixture("young-six", "st", 18, 19, 23),
    currentDate,
    config,
  );
  const olderChampion = valuePlayer(
    playerFixture("older-six", "st", 18, 19, 28),
    currentDate,
    config,
  );
  const ordinaryYoungPlayer = valuePlayer(
    playerFixture("ordinary", "st", 16.7, 16.8, 23),
    currentDate,
    config,
  );

  assert.equal(youngChampion.value, 15_000_000_000);
  assert.equal(youngChampion.components.hardCapEligible, true);
  assert.equal(youngChampion.components.hardCapApplied, true);
  assert.ok(olderChampion.value <= 14_999_999_900);
  assert.equal(olderChampion.components.hardCapEligible, false);
  assert.ok(ordinaryYoungPlayer.value <= 14_999_999_900);
  assert.equal(ordinaryYoungPlayer.value % 100, 0);
});

test("compresses the global upper tail without exposing private or seller facts", () => {
  const config = playerValuationConfigFixture();
  const currentDate = gameDate(20_000);
  const older = valuePlayer(
    playerFixture("older-six", "st", 18, 18, 30),
    currentDate,
    config,
  );
  const eligible = valuePlayer(
    playerFixture("young-six-compressed", "st", 18, 18, 23),
    currentDate,
    config,
  );

  assert.ok(older.components.valueBeforeTailCompressionMinorUnits > 8_000_000_000);
  assert.ok(older.value < older.components.valueBeforeTailCompressionMinorUnits);
  assert.ok(
    eligible.components.valueAfterTailCompressionMinorUnits
      < eligible.components.valueBeforeTailCompressionMinorUnits,
  );
  assert.equal("potentialAbilityAverage" in older, false);
  assert.equal("potentialAbility" in older.components, false);
  assert.equal("contractSecurityMultiplier" in older, false);
  assert.equal("formMultiplier" in older, false);
  assert.equal("club" in older.components, false);
  assert.equal("marketContext" in older.components, false);
});

test("prices ages outside the senior curve with the nearest boundary band", () => {
  const currentDate = gameDate(20_000);
  const config = playerValuationConfigFixture();
  const age14 = valuePlayer(
    playerFixture("age-14", "cm", 10, 11, 14),
    currentDate,
    config,
  );
  const age15 = valuePlayer(
    playerFixture("age-15", "cm", 10, 11, 15),
    currentDate,
    config,
  );
  const age46 = valuePlayer(
    playerFixture("age-46", "cm", 10, 11, 46),
    currentDate,
    config,
  );
  const age45 = valuePlayer(
    playerFixture("age-45", "cm", 10, 11, 45),
    currentDate,
    config,
  );

  assert.equal(age14.value, age15.value);
  assert.equal(age46.value, age45.value);
});

test("rejects incomplete public facts and mismatched content versions", () => {
  const config = playerValuationConfigFixture();
  const assessment = assessmentFixture("invalid", 24, 10, 11, 12, 3, 3, 3);
  assertValuationError(
    () => derivePlayerValuation({
      assessment,
      primaryPosition: undefined as unknown as PlayerPosition,
      config,
    }),
    "missing_primary_position",
  );
  assertValuationError(
    () => derivePlayerValuation({
      assessment: {
        ...assessment,
        p50Ability: 9,
      },
      primaryPosition: "st",
      config,
    }),
    "invalid_assessment",
  );
  assertValuationError(
    () => derivePlayerValuation({
      assessment: {
        ...assessment,
        currentRating: { stars: 6 },
        p50Rating: { stars: 6 },
        upperRating: { stars: 6 },
      },
      primaryPosition: "st",
      config,
    }),
    "invalid_assessment",
  );
  assertValuationError(
    () => derivePlayerValuation({
      assessment,
      primaryPosition: "st",
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
  assertValuationError(
    () => derivePlayerValuation({
      assessment,
      primaryPosition: "st",
      config: {
        ...config,
        valuationCurves: {
          ...config.valuationCurves,
          prospectExpectation: {
            ...config.valuationCurves.prospectExpectation,
            upperOptionParticipationBasisPoints:
              config.valuationCurves.prospectExpectation
                .p50ParticipationBasisPoints + 1,
          },
        },
      },
    }),
    "invalid_config",
  );
});

function valuePlayer(
  player: Player,
  currentDate: GameDate,
  config: PlayerValuationConfig,
) {
  const primaryPosition = player.naturalPositions[0];
  return derivePlayerValuation({
    assessment: assessmentFor(player, currentDate, config),
    primaryPosition: primaryPosition as PlayerPosition,
    config,
  });
}

function valueAssessment(
  assessment: PublicPlayerAssessment,
  primaryPosition: PlayerPosition,
  config: PlayerValuationConfig,
) {
  return derivePlayerValuation({ assessment, primaryPosition, config });
}

function assessmentFor(
  player: Player,
  currentDate: GameDate,
  config: PlayerValuationConfig,
): PublicPlayerAssessment {
  return derivePublicPlayerAssessment({
    player,
    currentDate,
    potentialProjectionPolicy: config.potentialProjectionPolicy,
    ratingScale: config.ratingScale,
  });
}

function assessmentFixture(
  suffix: string,
  age: number,
  currentAbility: number,
  p50Ability: number,
  upperAbility: number,
  currentRating: PlayerStarRating,
  p50Rating: PlayerStarRating,
  upperRating: PlayerStarRating,
): PublicPlayerAssessment {
  return {
    playerId: playerId(`player:test-${suffix}`),
    assessedOn: gameDate(20_000),
    age,
    roleFamily: "outfield",
    currentAbility,
    p50Ability,
    upperAbility,
    currentRating: { stars: currentRating },
    p50Rating: { stars: p50Rating },
    upperRating: { stars: upperRating },
  };
}

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
