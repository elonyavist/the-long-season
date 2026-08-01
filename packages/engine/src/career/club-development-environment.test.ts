import assert from "node:assert/strict";
import { test } from "vitest";

import {
  CAREER_STATE_SCHEMA_VERSION,
  CLUB_COMPETITIVE_TIER_POLICY_VERSION,
  clubId,
  createCareerState,
  gameDate,
  saveId,
  seasonId,
  type CareerState,
  type Club,
  type ClubCategory,
  type ClubCompetitiveTier,
  type ClubDevelopmentEnvironmentKey,
  type ClubId,
  type GameState,
  type PlayerDevelopmentEnvironmentConfig,
} from "@game/domain";

import {
  ClubDevelopmentEnvironmentDerivationError,
  deriveClubDevelopmentEnvironment,
} from "./club-development-environment.ts";

const ENVIRONMENT_VERSION = "player-development-environment:test-v1";

type EnvironmentCell = readonly [
  category: ClubCategory,
  tier: ClubCompetitiveTier,
  key: ClubDevelopmentEnvironmentKey,
  multiplierBasisPoints: number,
];

const ENVIRONMENT_CELLS: readonly EnvironmentCell[] = [
  ["third_division", "survival", "very_poor", 9_200],
  ["third_division", "mid_table", "poor", 9_500],
  ["third_division", "playoff_contender", "limited", 9_800],
  ["third_division", "title_contender", "adequate", 10_000],
  ["second_division", "survival", "poor", 9_500],
  ["second_division", "mid_table", "limited", 9_800],
  ["second_division", "playoff_contender", "adequate", 10_000],
  ["second_division", "title_contender", "good", 10_300],
  ["first_division", "survival", "adequate", 10_000],
  ["first_division", "mid_table", "very_good", 10_600],
  ["first_division", "playoff_contender", "excellent", 11_000],
  ["first_division", "title_contender", "excellent", 11_000],
];

test("deriveClubDevelopmentEnvironment resolves all twelve accepted category and tier cells", () => {
  const careerState = careerFixture();
  const before = JSON.stringify(careerState);

  for (const [category, tier, key, multiplierBasisPoints] of ENVIRONMENT_CELLS) {
    const id = environmentClubId(category, tier);
    const environment = deriveClubDevelopmentEnvironment({
      careerState,
      clubId: id,
      config: environmentConfigFixture(),
    });

    assert.deepEqual(environment, {
      policyVersion: ENVIRONMENT_VERSION,
      seasonId: seasonId("season:environment-0001"),
      clubId: id,
      category,
      competitiveTier: tier,
      key,
      positiveGrowthMultiplierBasisPoints: multiplierBasisPoints,
    });
    assert.equal(Object.isFrozen(environment), true);
  }

  assert.equal(JSON.stringify(careerState), before);
});

test("deriveClubDevelopmentEnvironment reproduces the same fact after state reconstruction", () => {
  const careerState = careerFixture();
  const reconstructed = createCareerState({
    ...careerState,
    gameState: {
      ...careerState.gameState,
      meta: {
        ...careerState.gameState.meta,
        calibrationVersions: {
          ...careerState.gameState.meta.calibrationVersions!,
        },
      },
    },
    clubCompetitiveTierState: {
      ...careerState.clubCompetitiveTierState,
      tierByClubId: {
        ...careerState.clubCompetitiveTierState.tierByClubId,
      },
    },
  });
  const id = environmentClubId("second_division", "title_contender");

  assert.deepEqual(
    deriveClubDevelopmentEnvironment({
      careerState: reconstructed,
      clubId: id,
      config: environmentConfigFixture(),
    }),
    deriveClubDevelopmentEnvironment({
      careerState,
      clubId: id,
      config: environmentConfigFixture(),
    }),
  );
});

test("deriveClubDevelopmentEnvironment rejects stale or mismatched source facts", () => {
  const careerState = careerFixture();
  const id = environmentClubId("first_division", "title_contender");
  const staleTierState = {
    ...careerState,
    clubCompetitiveTierState: {
      ...careerState.clubCompetitiveTierState,
      seasonId: seasonId("season:environment-stale"),
    },
  } as CareerState;
  assertDerivationError(
    () => deriveClubDevelopmentEnvironment({
      careerState: staleTierState,
      clubId: id,
      config: environmentConfigFixture(),
    }),
    "competitive_tier_season_mismatch",
  );

  const mismatchedPolicy = {
    ...careerState,
    clubCompetitiveTierState: {
      ...careerState.clubCompetitiveTierState,
      policyVersion: "club-competitive-tier:stale",
    },
  } as unknown as CareerState;
  assertDerivationError(
    () => deriveClubDevelopmentEnvironment({
      careerState: mismatchedPolicy,
      clubId: id,
      config: environmentConfigFixture(),
    }),
    "competitive_tier_policy_mismatch",
  );

  const mismatchedVersion = {
    ...careerState,
    gameState: {
      ...careerState.gameState,
      meta: {
        ...careerState.gameState.meta,
        calibrationVersions: {
          ...careerState.gameState.meta.calibrationVersions!,
          playerDevelopmentEnvironmentVersion: "player-development-environment:stale",
        },
      },
    },
  };
  assertDerivationError(
    () => deriveClubDevelopmentEnvironment({
      careerState: mismatchedVersion,
      clubId: id,
      config: environmentConfigFixture(),
    }),
    "development_environment_version_mismatch",
  );
});

test("deriveClubDevelopmentEnvironment rejects a club outside the active order", () => {
  assertDerivationError(
    () => deriveClubDevelopmentEnvironment({
      careerState: careerFixture(),
      clubId: clubId("club:environment-missing"),
      config: environmentConfigFixture(),
    }),
    "club_not_active",
  );
});

function assertDerivationError(
  action: () => unknown,
  code: ClubDevelopmentEnvironmentDerivationError["code"],
): void {
  assert.throws(
    action,
    (error) =>
      error instanceof ClubDevelopmentEnvironmentDerivationError
      && error.code === code,
  );
}

function careerFixture(): CareerState {
  const clubs = ENVIRONMENT_CELLS.map(([category, tier]) =>
    clubFixture(environmentClubId(category, tier), category)
  );
  const tierByClubId = Object.fromEntries(
    ENVIRONMENT_CELLS.map(([category, tier]) => [
      environmentClubId(category, tier),
      tier,
    ]),
  ) as Record<ClubId, ClubCompetitiveTier>;
  const gameState = gameStateFixture(clubs);

  return createCareerState({
    saveId: saveId("save:club-development-environment"),
    schemaVersion: CAREER_STATE_SCHEMA_VERSION,
    selectedClubId: gameState.clubIds[0]!,
    gameState,
    clubCompetitiveTierState: {
      policyVersion: CLUB_COMPETITIVE_TIER_POLICY_VERSION,
      seasonId: gameState.calendar.currentSeasonId,
      tierByClubId,
    },
    transferHistory: [],
  });
}

function gameStateFixture(clubs: readonly Club[]): GameState {
  return {
    meta: {
      seed: "club-development-environment-test",
      rngAlgorithmVersion: "test-v1",
      saveSchemaVersion: 1,
      calibrationVersions: {
        topologyDecisionId: "fictional-three-tier-v1",
        playerRatingScaleVersion: "rating:test-v1",
        playerMarketCalibrationVersion: "market:test-v1",
        valuationCurvesVersion: "valuation:test-v1",
        askingPriceCurvesVersion: "asking:test-v1",
        marketBehaviorCalibrationVersion: "behavior:test-v1",
        wageFinanceCalibrationVersion: "wage:test-v1",
        playerDevelopmentEnvironmentVersion: ENVIRONMENT_VERSION,
      },
    },
    calendar: {
      currentDate: gameDate(20_000),
      currentSeasonId: seasonId("season:environment-0001"),
    },
    players: {},
    playerIds: [],
    playerStates: {},
    clubs: Object.fromEntries(clubs.map((club) => [club.id, club])) as GameState["clubs"],
    clubIds: clubs.map((club) => club.id),
    fixtures: {},
    fixtureIds: [],
  };
}

function clubFixture(id: ClubId, category: ClubCategory): Club {
  return {
    id,
    name: id,
    shortName: id,
    category,
    reputation: 10,
    playerIds: [],
  };
}

function environmentClubId(
  category: ClubCategory,
  tier: ClubCompetitiveTier,
): ClubId {
  return clubId(`club:environment-${category}-${tier}`);
}

function environmentConfigFixture(): PlayerDevelopmentEnvironmentConfig {
  return {
    schemaVersion: 1,
    version: ENVIRONMENT_VERSION,
    classification: "explicit_game_design_target",
    competitiveTierPolicyVersion: CLUB_COMPETITIVE_TIER_POLICY_VERSION,
    positiveGrowthMultiplierBasisPointsByKey: {
      very_poor: 9_200,
      poor: 9_500,
      limited: 9_800,
      adequate: 10_000,
      good: 10_300,
      very_good: 10_600,
      excellent: 11_000,
    },
    environmentKeyByCategoryAndTier: {
      third_division: {
        survival: "very_poor",
        mid_table: "poor",
        playoff_contender: "limited",
        title_contender: "adequate",
      },
      second_division: {
        survival: "poor",
        mid_table: "limited",
        playoff_contender: "adequate",
        title_contender: "good",
      },
      first_division: {
        survival: "adequate",
        mid_table: "very_good",
        playoff_contender: "excellent",
        title_contender: "excellent",
      },
    },
  };
}
