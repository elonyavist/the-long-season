import * as v from "valibot";

import {
  CLUB_COMPETITIVE_TIER_POLICY_VERSION,
  CLUB_DEVELOPMENT_ENVIRONMENT_KEYS,
  PLAYER_STAR_RATINGS,
  type AskingPriceCurvesConfig,
  type MarketBehaviorCalibrationConfig,
  type PlayerEconomyCalibrationBundle,
  type PlayerEconomyCalibrationVersionBundle,
  type PlayerMarketCalibrationConfig,
  type PlayerDevelopmentEnvironmentConfig,
  type PlayerPotentialProjectionPolicyConfig,
  type PlayerRatingScaleConfig,
  type ValuationCurvesConfig,
  type WageFinanceCalibrationConfig,
  validatePlayerPotentialProjectionPolicyConfig,
  validatePlayerDevelopmentEnvironmentConfig,
} from "@game/domain";

const divisions = ["first_division", "second_division", "third_division"] as const;
const ratingSchema = v.picklist(PLAYER_STAR_RATINGS);
const divisionSchema = v.picklist(divisions);
const developmentEnvironmentKeySchema = v.picklist(CLUB_DEVELOPMENT_ENVIRONMENT_KEYS);
const schemaVersion = v.literal(1);
const potentialProjectionSchemaVersion = v.literal(2);
const nonEmptyString = v.pipe(v.string(), v.minLength(1));
const safeInteger = v.pipe(v.number(), v.safeInteger());
const nonNegativeInteger = v.pipe(safeInteger, v.minValue(0));
const positiveInteger = v.pipe(safeInteger, v.minValue(1));
const basisPoints = v.pipe(safeInteger, v.minValue(0), v.maxValue(100_000));
const shareBasisPoints = v.pipe(safeInteger, v.minValue(0), v.maxValue(10_000));
const money = nonNegativeInteger;
const abilityNumber = v.pipe(v.number(), v.finite(), v.minValue(0), v.maxValue(20));

const sourceReferenceSchema = v.strictObject({
  id: nonEmptyString,
  title: nonEmptyString,
  url: v.pipe(v.string(), v.url()),
  classification: v.literal("observed_source_fact"),
});

const potentialProjectionAgeBandSchema = v.strictObject({
  minimumAge: nonNegativeInteger,
  maximumAge: nonNegativeInteger,
  p50RealizationBasisPoints: v.pipe(
    safeInteger,
    v.minValue(0),
    v.maxValue(10_000),
  ),
  upperRealizationBasisPoints: v.pipe(
    safeInteger,
    v.minValue(0),
    v.maxValue(10_000),
  ),
});

const playerPotentialProjectionPolicySchema = v.strictObject({
  schemaVersion: potentialProjectionSchemaVersion,
  version: nonEmptyString,
  classification: v.literal("explicit_game_design_target"),
  ageBandsByRoleFamily: v.strictObject({
    goalkeeper: v.array(potentialProjectionAgeBandSchema),
    outfield: v.array(potentialProjectionAgeBandSchema),
  }),
});

const distributionSchema = v.strictObject({
  medianMinorUnits: money,
  p90MinorUnits: money,
  p99MinorUnits: money,
  maximumMinorUnits: money,
});

const playerRatingScaleSchema = v.strictObject({
  schemaVersion,
  version: nonEmptyString,
  classification: v.literal("explicit_game_design_target"),
  supportedRatings: v.array(ratingSchema),
  abilityThresholds: v.array(v.strictObject({
    minimumAbilityInclusive: v.pipe(v.number(), v.finite(), v.minValue(0), v.maxValue(20)),
    rating: ratingSchema,
  })),
  divisionFirstTeamBands: v.array(v.strictObject({
    division: divisionSchema,
    normalMinimum: ratingSchema,
    normalMaximum: ratingSchema,
    exceptionalMaximum: ratingSchema,
  })),
  rarity: v.strictObject({
    initialWorld: v.strictObject({
      establishedCurrentSixMinimum: nonNegativeInteger,
      establishedCurrentSixMaximum: nonNegativeInteger,
      youngStoredCeilingSixMinimum: nonNegativeInteger,
      youngStoredCeilingSixMaximum: nonNegativeInteger,
      lowerDivisionYoungStoredCeilingSixMaximum: nonNegativeInteger,
      youngStoredCeilingSixPerClubMaximum: v.pipe(v.number(), v.integer(), v.minValue(1)),
    }),
    annualIntake: v.strictObject({
      activeYoungStoredCeilingSixTargetMinimum: nonNegativeInteger,
      activeYoungStoredCeilingSixTargetMaximum: nonNegativeInteger,
      activeYoungStoredCeilingFiveOrBetterTargetMinimumBasisPoints: shareBasisPoints,
      activeYoungStoredCeilingFiveOrBetterTargetMaximumBasisPoints: shareBasisPoints,
      activeYoungStoredCeilingFiveOrBetterPerClubMaximum: positiveInteger,
    }),
  }),
  potentialProjectionPolicy: playerPotentialProjectionPolicySchema,
});

const playerMarketCalibrationSchema = v.strictObject({
  schemaVersion,
  version: nonEmptyString,
  classification: v.literal("mixed"),
  retrievedAt: nonEmptyString,
  timeZone: nonEmptyString,
  seasonSelector: nonEmptyString,
  currency: v.literal("EUR"),
  percentileMethod: nonEmptyString,
  sourceReferences: v.array(sourceReferenceSchema),
  competitionSamples: v.array(v.strictObject({
    id: nonEmptyString,
    division: divisionSchema,
    classification: v.literal("observed_source_fact"),
    sourceReferenceId: nonEmptyString,
    clubCount: positiveInteger,
    listedPlayerCount: positiveInteger,
    includedValuationCount: positiveInteger,
    excludedUnvaluedCount: nonNegativeInteger,
    totalValueMinorUnits: money,
    distribution: distributionSchema,
  })),
  prospectSamples: v.array(v.strictObject({
    id: nonEmptyString,
    division: divisionSchema,
    classification: v.literal("observed_source_fact"),
    sourceReferenceId: nonEmptyString,
    ageFilter: v.picklist(["u19", "u21"]),
    populationScope: v.literal("bounded_leaderboard"),
    observedRowCount: positiveInteger,
    minimumAge: nonNegativeInteger,
    maximumAge: nonNegativeInteger,
    distribution: distributionSchema,
  })),
  divisionBaselines: v.array(v.strictObject({
    division: divisionSchema,
    classification: v.literal("derived_aggregate"),
    clubCount: positiveInteger,
    listedPlayerCount: positiveInteger,
    includedValuationCount: positiveInteger,
    totalValueMinorUnits: money,
    meanListedPlayerValueMinorUnits: money,
    rawAverageSquadValueMinorUnits: money,
    normalized22SeniorSquadValueMinorUnits: money,
    distribution: distributionSchema,
  })),
  gameDesignTargets: v.array(v.strictObject({
    division: divisionSchema,
    classification: v.literal("explicit_game_design_target"),
    distribution: distributionSchema,
    medianToleranceBasisPoints: basisPoints,
    p90ToleranceBasisPoints: basisPoints,
    p99ToleranceBasisPoints: basisPoints,
    minimumMaximumMinorUnits: money,
    maximumMaximumMinorUnits: money,
  })),
  currentGameBaseline: v.strictObject({
    classification: v.literal("derived_aggregate"),
    repositoryCommit: nonEmptyString,
    relevantDiffSha256: nonEmptyString,
    nodeVersion: nonEmptyString,
    worldCount: positiveInteger,
    seedPrefix: nonEmptyString,
    projectionMethod: nonEmptyString,
    categories: v.array(v.strictObject({
      division: divisionSchema,
      sampleSize: positiveInteger,
      meanMinorUnits: money,
      distribution: distributionSchema,
    })),
  }),
});

const valuationCurvesSchema = v.strictObject({
  schemaVersion,
  version: nonEmptyString,
  classification: v.literal("explicit_game_design_target"),
  playerRatingScaleVersion: nonEmptyString,
  playerMarketCalibrationVersion: nonEmptyString,
  qualityInterpolationExponentMilli: positiveInteger,
  ratingValueAnchors: v.array(v.strictObject({
    rating: ratingSchema,
    valueMinorUnits: money,
  })),
  ageMultipliers: v.array(v.strictObject({
    minimumAge: nonNegativeInteger,
    maximumAge: nonNegativeInteger,
    multiplierBasisPoints: basisPoints,
  })),
  prospectExpectation: v.strictObject({
    version: nonEmptyString,
    potentialProjectionPolicyVersion: nonEmptyString,
    p50ParticipationBasisPoints: basisPoints,
    upperOptionParticipationBasisPoints: basisPoints,
  }),
  positionMultipliers: v.strictObject({
    goalkeeper: basisPoints,
    defender: basisPoints,
    midfielder: basisPoints,
    forward: basisPoints,
  }),
  upperTail: v.strictObject({
    compressionStartsMinorUnits: money,
    compressionBasisPoints: basisPoints,
    hardCapMinorUnits: money,
    hardCapMaximumAge: nonNegativeInteger,
    hardCapRequiredRating: ratingSchema,
  }),
});

const factorBandSchema = v.strictObject({
  maximumValueInclusive: nonNegativeInteger,
  multiplierBasisPoints: basisPoints,
});

const askingPriceCurvesSchema = v.strictObject({
  schemaVersion,
  version: nonEmptyString,
  classification: v.literal("explicit_game_design_target"),
  valuationCurvesVersion: nonEmptyString,
  contractDaysRemaining: v.array(factorBandSchema),
  squadStatusMultipliers: v.strictObject({
    key_player: basisPoints,
    starter: basisPoints,
    rotation: basisPoints,
    prospect: basisPoints,
    surplus: basisPoints,
  }),
  replacementNeedMultipliers: v.strictObject({
    covered: basisPoints,
    thin: basisPoints,
    critical: basisPoints,
  }),
  sellerPressureMultipliers: v.strictObject({
    healthy: basisPoints,
    strained: basisPoints,
    must_sell: basisPoints,
  }),
  playerDesireMultipliers: v.strictObject({
    content: basisPoints,
    open_to_move: basisPoints,
    wants_exit: basisPoints,
  }),
  finalMultiplierMinimumBasisPoints: basisPoints,
  finalMultiplierMaximumBasisPoints: basisPoints,
  freeAgentTransferFeeMinorUnits: v.literal(0),
});

const marketBehaviorCalibrationSchema = v.strictObject({
  schemaVersion,
  version: nonEmptyString,
  classification: v.literal("explicit_game_design_target"),
  askingPriceCurvesVersion: nonEmptyString,
  wageFinanceCalibrationVersion: nonEmptyString,
  openingFinanceRoundingMinorUnits: positiveInteger,
  openingFinanceTargets: v.array(v.strictObject({
    division: divisionSchema,
    classification: v.literal("explicit_game_design_target"),
    cashMinimumMinorUnits: money,
    cashMedianMinorUnits: money,
    cashMaximumMinorUnits: money,
    annualTransferBudgetMinimumMinorUnits: money,
    annualTransferBudgetMedianMinorUnits: money,
    annualTransferBudgetMaximumMinorUnits: money,
  })),
  sellerNegotiation: v.strictObject({
    counterOfferMinimumAskingBasisPoints: basisPoints,
    counterOfferConcessionBasisPoints: basisPoints,
  }),
  aiTransferOffer: v.strictObject({
    version: nonEmptyString,
    minimumAskingBasisPoints: basisPoints,
    maximumAskingBasisPoints: basisPoints,
    askingBasisPointsStep: positiveInteger,
  }),
  sportingWillingness: v.strictObject({
    sameDivisionScore: safeInteger,
    oneDivisionUpScore: safeInteger,
    oneDivisionDownScore: safeInteger,
    twoDivisionsUpScore: safeInteger,
    twoDivisionsDownScore: safeInteger,
    reputationScorePerPoint: safeInteger,
    squadStatusScorePerStep: safeInteger,
    wageScorePerTenPercent: safeInteger,
    maximumAbsoluteWageScore: nonNegativeInteger,
    contractYearScore: safeInteger,
    strongAbilityMinimum: abilityNumber,
    eliteAbilityMinimum: abilityNumber,
    primeMinimumAge: positiveInteger,
    primeMaximumAge: positiveInteger,
    oneDivisionStrongPenalty: nonNegativeInteger,
    twoDivisionStrongPenalty: nonNegativeInteger,
    reputationDropMinimum: nonNegativeInteger,
    reputationDropPenalty: nonNegativeInteger,
    primeDownwardPenalty: nonNegativeInteger,
    annualWageRegressionThresholdBasisPoints: basisPoints,
    annualWageRegressionPenalty: nonNegativeInteger,
    squadStatusRegressionPenalty: nonNegativeInteger,
    contractSecurityGraceDays: nonNegativeInteger,
    contractSecurityRegressionPenalty: nonNegativeInteger,
    acceptanceScoreMinimum: safeInteger,
  }),
  affordability: v.strictObject({
    minimumCashReserveBasisPoints: basisPoints,
    maximumTransferBudgetUseBasisPoints: basisPoints,
    maximumWageBudgetUseBasisPoints: basisPoints,
  }),
  aiTargetWeights: v.strictObject({
    quality: nonNegativeInteger,
    potential: nonNegativeInteger,
    roleNeed: nonNegativeInteger,
    affordability: nonNegativeInteger,
  }),
  aiRiskAppetite: v.strictObject({
    uncertaintyPenaltyWeight: positiveInteger,
    toleranceBasisPointsByCategory: v.strictObject({
      first_division: basisPoints,
      second_division: basisPoints,
      third_division: basisPoints,
    }),
  }),
  aiLifecycle: v.strictObject({
    maximumActiveTalks: positiveInteger,
    maximumPermanentStartsPerSeason: positiveInteger,
    maximumPreliminaryStartsPerSeason: positiveInteger,
    permanentCheckpointDays: positiveInteger,
    preliminaryCheckpointDays: positiveInteger,
    preliminaryEligibilityDays: positiveInteger,
    expiringContractDays: positiveInteger,
    targetDepartmentDepth: v.strictObject({
      goalkeeper: positiveInteger,
      defender: positiveInteger,
      midfielder: positiveInteger,
      attacker: positiveInteger,
    }),
    goalkeeperAgingAge: positiveInteger,
    outfieldAgingAge: positiveInteger,
    successionQualityTolerance: abilityNumber,
    averageQualityGap: abilityNumber,
    weakestQualityGap: abilityNumber,
    maximumSquadAboveTarget: nonNegativeInteger,
    needPriorityWeights: v.strictObject({
      structuralDeficit: nonNegativeInteger,
      targetDeficit: nonNegativeInteger,
      expiringContract: nonNegativeInteger,
      agingDepartment: nonNegativeInteger,
      roleSuccession: nonNegativeInteger,
      qualityGap: nonNegativeInteger,
    }),
  }),
});

const wageFinanceCalibrationSchema = v.strictObject({
  schemaVersion,
  version: nonEmptyString,
  classification: v.literal("mixed"),
  retrievedAt: nonEmptyString,
  timeZone: nonEmptyString,
  currency: v.literal("EUR"),
  sourceReferences: v.array(sourceReferenceSchema),
  sourceBaselines: v.array(v.strictObject({
    division: divisionSchema,
    classification: v.literal("observed_source_fact"),
    sourceReferenceId: nonEmptyString,
    sourceSeason: nonEmptyString,
    sampleClubCount: positiveInteger,
    populationClubCount: positiveInteger,
    valueOfProductionPerClubMinorUnits: money,
    employeeCostPerClubMinorUnits: money,
    employeeCostToProductionBasisPoints: basisPoints,
    approximate: v.boolean(),
  })),
  gameDesignTargets: v.array(v.strictObject({
    division: divisionSchema,
    classification: v.literal("explicit_game_design_target"),
    annualSeniorWageBudgetMinimumMinorUnits: money,
    annualSeniorWageBudgetMedianMinorUnits: money,
    annualSeniorWageBudgetMaximumMinorUnits: money,
    targetCommittedWageMinimumBasisPoints: basisPoints,
    targetCommittedWageMaximumBasisPoints: basisPoints,
  })),
  openingBudgetRoundingMinorUnits: positiveInteger,
  annualWageByRating: v.array(v.strictObject({
    rating: ratingSchema,
    annualWageMinorUnits: money,
  })),
  annualWagePolicy: v.strictObject({
    roundingMinorUnits: positiveInteger,
    divisionMultipliers: v.strictObject({
      first_division: positiveInteger,
      second_division: positiveInteger,
      third_division: positiveInteger,
    }),
    squadStatusMultipliers: v.strictObject({
      key_player: positiveInteger,
      regular_starter: positiveInteger,
      squad_player: positiveInteger,
      fringe_player: positiveInteger,
      prospect: positiveInteger,
    }),
    ageMultipliers: v.array(v.strictObject({
      minimumAge: nonNegativeInteger,
      maximumAge: nonNegativeInteger,
      multiplierBasisPoints: positiveInteger,
    })),
    potentialPremiumMaximumAge: nonNegativeInteger,
    potentialGapPremiums: v.array(v.strictObject({
      maximumGapStarsInclusive: v.pipe(v.number(), v.minValue(0)),
      premiumBasisPoints: basisPoints,
    })),
    freeAgentMultiplierBasisPoints: positiveInteger,
    longContractMinimumDaysExclusive: nonNegativeInteger,
    longContractMultiplierBasisPoints: positiveInteger,
    currentWageFloorAgeMultipliers: v.array(v.strictObject({
      minimumAge: nonNegativeInteger,
      maximumAge: nonNegativeInteger,
      multiplierBasisPoints: positiveInteger,
    })),
  }),
  contractTermsPolicy: v.strictObject({
    preferredDuration: v.strictObject({
      highPotentialMaximumAge: nonNegativeInteger,
      highPotentialMinimumGapStars: v.pipe(v.number(), v.minValue(0)),
      highPotentialYears: positiveInteger,
      youngMaximumAge: nonNegativeInteger,
      youngYears: positiveInteger,
      primeMaximumAge: nonNegativeInteger,
      primeYears: positiveInteger,
      matureMaximumAge: nonNegativeInteger,
      matureYears: positiveInteger,
      veteranYears: positiveInteger,
      minimumDurationReductionYears: nonNegativeInteger,
    }),
    minimumWageMultiplierBasisPoints: basisPoints,
    minimumBonusMultiplierBasisPoints: basisPoints,
    bonuses: v.strictObject({
      annualAppearanceDivisor: positiveInteger,
      signingBonusBasisPoints: v.strictObject({
        key_player: basisPoints,
        regular_starter: basisPoints,
        squad_player: basisPoints,
        fringe_player: basisPoints,
        prospect: basisPoints,
      }),
      goalBonusMultiplierBasisPoints: positiveInteger,
      defensiveCleanSheetMultiplierBasisPoints: positiveInteger,
      roundingMinorUnits: positiveInteger,
      signingRoundingMinorUnits: positiveInteger,
    }),
  }),
});

const developmentEnvironmentTierSchema = v.strictObject({
  title_contender: developmentEnvironmentKeySchema,
  playoff_contender: developmentEnvironmentKeySchema,
  mid_table: developmentEnvironmentKeySchema,
  survival: developmentEnvironmentKeySchema,
});

const playerDevelopmentEnvironmentSchema = v.strictObject({
  schemaVersion,
  version: nonEmptyString,
  classification: v.literal("explicit_game_design_target"),
  competitiveTierPolicyVersion: v.literal(CLUB_COMPETITIVE_TIER_POLICY_VERSION),
  positiveGrowthMultiplierBasisPointsByKey: v.strictObject({
    very_poor: positiveInteger,
    poor: positiveInteger,
    limited: positiveInteger,
    adequate: positiveInteger,
    good: positiveInteger,
    very_good: positiveInteger,
    excellent: positiveInteger,
  }),
  environmentKeyByCategoryAndTier: v.strictObject({
    first_division: developmentEnvironmentTierSchema,
    second_division: developmentEnvironmentTierSchema,
    third_division: developmentEnvironmentTierSchema,
  }),
});

/** Untrusted JSON values accepted by the single content validation boundary. */
export interface RawPlayerEconomyCalibrationAssets {
  readonly playerRatingScale: unknown;
  readonly playerMarketCalibration: unknown;
  readonly valuationCurves: unknown;
  readonly askingPriceCurves: unknown;
  readonly marketBehaviorCalibration: unknown;
  readonly wageFinanceCalibration: unknown;
  readonly playerDevelopmentEnvironment: unknown;
}

/**
 * Complete validated content bundle including the non-persisted projection
 * policy stored beside the unchanged global rating scale.
 */
export interface ValidatedPlayerEconomyCalibrationAssets
  extends PlayerEconomyCalibrationBundle {
  readonly playerPotentialProjectionPolicy: PlayerPotentialProjectionPolicyAsset;
}

type PlayerPotentialProjectionPolicyAsset =
  PlayerPotentialProjectionPolicyConfig;

/** Typed validation failure for malformed or internally inconsistent content. */
export class PlayerEconomyCalibrationValidationError extends Error {
  /** Creates a content-boundary validation error. */
  public constructor(message: string) {
    super(message);
    this.name = "PlayerEconomyCalibrationValidationError";
  }
}

/**
 * Parses, cross-validates, and deeply freezes all seven calibration assets.
 *
 * This is the only boundary that converts imported JSON into domain config
 * shapes. Engine and diagnostics receive the returned values explicitly.
 */
export function parsePlayerEconomyCalibrationAssets(
  raw: RawPlayerEconomyCalibrationAssets,
): ValidatedPlayerEconomyCalibrationAssets {
  let rating: PlayerRatingScaleConfig;
  let potentialProjectionPolicy: PlayerPotentialProjectionPolicyAsset;
  let market: PlayerMarketCalibrationConfig;
  let valuation: ValuationCurvesConfig;
  let asking: AskingPriceCurvesConfig;
  let behavior: MarketBehaviorCalibrationConfig;
  let wage: WageFinanceCalibrationConfig;
  let developmentEnvironment: PlayerDevelopmentEnvironmentConfig;

  try {
    const parsedRating = v.parse(playerRatingScaleSchema, raw.playerRatingScale);
    ({
      potentialProjectionPolicy,
      ...rating
    } = parsedRating);
    market = v.parse(playerMarketCalibrationSchema, raw.playerMarketCalibration);
    valuation = v.parse(valuationCurvesSchema, raw.valuationCurves);
    asking = v.parse(askingPriceCurvesSchema, raw.askingPriceCurves);
    behavior = v.parse(marketBehaviorCalibrationSchema, raw.marketBehaviorCalibration);
    wage = v.parse(wageFinanceCalibrationSchema, raw.wageFinanceCalibration);
    developmentEnvironment = v.parse(
      playerDevelopmentEnvironmentSchema,
      raw.playerDevelopmentEnvironment,
    );
  } catch (error) {
    throw validationError("schema validation failed", error);
  }

  validateRatingScale(rating);
  validatePotentialProjectionPolicy(potentialProjectionPolicy);
  validateMarketCalibration(market);
  validateValuationCurves(valuation);
  validateAskingPriceCurves(asking);
  validateMarketBehavior(behavior);
  validateWageFinance(wage);
  validateDevelopmentEnvironment(developmentEnvironment);
  validateVersionReferences({
    rating,
    potentialProjectionPolicy,
    market,
    valuation,
    asking,
    behavior,
    wage,
  });

  const versions: PlayerEconomyCalibrationVersionBundle = {
    topologyDecisionId: "fictional-three-tier-v1",
    playerRatingScaleVersion: rating.version,
    playerMarketCalibrationVersion: market.version,
    valuationCurvesVersion: valuation.version,
    askingPriceCurvesVersion: asking.version,
    marketBehaviorCalibrationVersion: behavior.version,
    wageFinanceCalibrationVersion: wage.version,
    playerDevelopmentEnvironmentVersion: developmentEnvironment.version,
  };

  return deepFreeze({
    versions,
    playerRatingScale: rating,
    playerPotentialProjectionPolicy: potentialProjectionPolicy,
    playerMarketCalibration: market,
    valuationCurves: valuation,
    askingPriceCurves: asking,
    marketBehaviorCalibration: behavior,
    wageFinanceCalibration: wage,
    playerDevelopmentEnvironment: developmentEnvironment,
  });
}

function validateDevelopmentEnvironment(
  config: PlayerDevelopmentEnvironmentConfig,
): void {
  try {
    validatePlayerDevelopmentEnvironmentConfig(config);
  } catch (error) {
    throw validationError("development-environment policy validation failed", error);
  }
}

function validatePotentialProjectionPolicy(
  config: PlayerPotentialProjectionPolicyConfig,
): void {
  try {
    validatePlayerPotentialProjectionPolicyConfig(config);
  } catch (error) {
    throw validationError("potential-projection policy validation failed", error);
  }
}

function validateRatingScale(config: PlayerRatingScaleConfig): void {
  assertExactOrder(config.supportedRatings, PLAYER_STAR_RATINGS, "supported ratings");
  assertUnique(config.abilityThresholds.map((threshold) => threshold.minimumAbilityInclusive), "ability thresholds");
  assertUnique(config.abilityThresholds.map((threshold) => threshold.rating), "threshold ratings");
  assertStrictlyIncreasing(
    config.abilityThresholds.map((threshold) => threshold.minimumAbilityInclusive),
    "ability thresholds",
  );
  assertStrictlyIncreasing(config.abilityThresholds.map((threshold) => threshold.rating), "threshold ratings");
  assertCompleteDivisions(config.divisionFirstTeamBands, "rating bands");

  for (const band of config.divisionFirstTeamBands) {
    if (band.normalMinimum > band.normalMaximum || band.normalMaximum > band.exceptionalMaximum) {
      fail(`invalid first-team rating band for ${band.division}`);
    }
  }

  assertMinimumMaximum(config.rarity.initialWorld.establishedCurrentSixMinimum, config.rarity.initialWorld.establishedCurrentSixMaximum, "initial established current-six");
  assertMinimumMaximum(config.rarity.initialWorld.youngStoredCeilingSixMinimum, config.rarity.initialWorld.youngStoredCeilingSixMaximum, "initial young stored-ceiling-six");
  assertMinimumMaximum(config.rarity.annualIntake.activeYoungStoredCeilingSixTargetMinimum, config.rarity.annualIntake.activeYoungStoredCeilingSixTargetMaximum, "active young stored-ceiling-six target");
  assertMinimumMaximum(
    config.rarity.annualIntake.activeYoungStoredCeilingFiveOrBetterTargetMinimumBasisPoints,
    config.rarity.annualIntake.activeYoungStoredCeilingFiveOrBetterTargetMaximumBasisPoints,
    "active young stored-ceiling-five-or-better target share",
  );
  if (
    config.rarity.initialWorld.lowerDivisionYoungStoredCeilingSixMaximum
      > config.rarity.initialWorld.youngStoredCeilingSixMaximum
    || config.rarity.initialWorld.youngStoredCeilingSixPerClubMaximum
      > config.rarity.initialWorld.youngStoredCeilingSixMaximum
  ) {
    fail("initial young stored-ceiling-six concentration limits exceed national stock");
  }
  if (
    config.rarity.annualIntake.activeYoungStoredCeilingSixTargetMinimum
        !== config.rarity.initialWorld.youngStoredCeilingSixMinimum
    || config.rarity.annualIntake.activeYoungStoredCeilingSixTargetMaximum
        !== config.rarity.initialWorld.youngStoredCeilingSixMaximum
  ) {
    fail("annual young stored-ceiling-six target must match initial national stock");
  }
  if (
    config.rarity.annualIntake.activeYoungStoredCeilingFiveOrBetterTargetMinimumBasisPoints <= 0
    || config.rarity.annualIntake.activeYoungStoredCeilingFiveOrBetterPerClubMaximum
      < config.rarity.initialWorld.youngStoredCeilingSixPerClubMaximum
  ) {
    fail("active young stored-ceiling-five-or-better target is structurally invalid");
  }
}

function validateMarketCalibration(config: PlayerMarketCalibrationConfig): void {
  assertUnique(config.sourceReferences.map((source) => source.id), "market source IDs");
  assertUnique(config.competitionSamples.map((sample) => sample.id), "market sample IDs");
  assertUnique(config.prospectSamples.map((sample) => sample.id), "market prospect sample IDs");
  const sourceIds = new Set(config.sourceReferences.map((source) => source.id));

  for (const sample of config.competitionSamples) {
    if (!sourceIds.has(sample.sourceReferenceId)) {
      fail(`unknown source reference: ${sample.sourceReferenceId}`);
    }
    if (sample.includedValuationCount + sample.excludedUnvaluedCount !== sample.listedPlayerCount) {
      fail(`sample player counts do not reconcile: ${sample.id}`);
    }
    assertPercentileOrder(sample.distribution, `competition sample ${sample.id}`);
  }
  for (const sample of config.prospectSamples) {
    if (!sourceIds.has(sample.sourceReferenceId)) {
      fail(`unknown source reference: ${sample.sourceReferenceId}`);
    }
    if (sample.minimumAge > sample.maximumAge) {
      fail(`invalid prospect age range: ${sample.id}`);
    }
    assertPercentileOrder(sample.distribution, `prospect sample ${sample.id}`);
  }

  assertCompleteDivisions(config.divisionBaselines, "market division baselines");
  assertCompleteDivisions(config.gameDesignTargets, "market game-design targets");
  assertCompleteDivisions(config.currentGameBaseline.categories, "current-game categories");

  for (const baseline of config.divisionBaselines) {
    assertPercentileOrder(baseline.distribution, `division baseline ${baseline.division}`);
  }
  for (const target of config.gameDesignTargets) {
    assertPercentileOrder(target.distribution, `division target ${target.division}`);
    assertMinimumMaximum(target.minimumMaximumMinorUnits, target.maximumMaximumMinorUnits, `${target.division} maximum target`);
  }
  for (const category of config.currentGameBaseline.categories) {
    assertPercentileOrder(category.distribution, `current-game category ${category.division}`);
  }
}

function validateValuationCurves(
  config: ValuationCurvesConfig,
): void {
  assertExactOrder(config.ratingValueAnchors.map((anchor) => anchor.rating), PLAYER_STAR_RATINGS, "valuation ratings");
  assertStrictlyIncreasing(config.ratingValueAnchors.map((anchor) => anchor.valueMinorUnits), "valuation anchors");
  const p50Participation =
    config.prospectExpectation.p50ParticipationBasisPoints;
  const upperOptionParticipation =
    config.prospectExpectation.upperOptionParticipationBasisPoints;
  if (
    upperOptionParticipation <= 0
    || upperOptionParticipation > p50Participation
    || p50Participation >= 10_000
  ) {
    fail(
      "public-quality participation requires 0 < upper option <= P50 < 10000 basis points",
    );
  }

  let nextAge = config.ageMultipliers[0]?.minimumAge;
  for (const band of config.ageMultipliers) {
    if (band.minimumAge !== nextAge || band.maximumAge < band.minimumAge) {
      fail("age multiplier bands must be ordered and contiguous");
    }
    nextAge = band.maximumAge + 1;
  }

  if (config.upperTail.compressionStartsMinorUnits >= config.upperTail.hardCapMinorUnits) {
    fail("upper-tail compression must start below the hard cap");
  }
  if (config.upperTail.hardCapRequiredRating !== 6 || config.upperTail.hardCapMaximumAge !== 25) {
    fail("the 150m hard-cap eligibility contract requires rating 6 and age 25");
  }
  if (config.upperTail.hardCapMinorUnits !== 15_000_000_000) {
    fail("the public-value hard cap must be exactly 150m EUR");
  }
  const sixStarAnchor = config.ratingValueAnchors.find(
    (anchor) => anchor.rating === 6,
  );
  if (sixStarAnchor?.valueMinorUnits !== config.upperTail.hardCapMinorUnits) {
    fail("the six-star anchor must equal the public-value hard cap");
  }
}

function validateAskingPriceCurves(config: AskingPriceCurvesConfig): void {
  assertUnique(config.contractDaysRemaining.map((band) => band.maximumValueInclusive), "contract-day thresholds");
  assertStrictlyIncreasing(
    config.contractDaysRemaining.map((band) => band.maximumValueInclusive),
    "contract-day thresholds",
  );
  assertMinimumMaximum(
    config.finalMultiplierMinimumBasisPoints,
    config.finalMultiplierMaximumBasisPoints,
    "asking-price multiplier",
  );
  for (const [name, multiplier] of Object.entries({
    ...config.squadStatusMultipliers,
    ...config.replacementNeedMultipliers,
    ...config.sellerPressureMultipliers,
    ...config.playerDesireMultipliers,
  })) {
    if (!Number.isInteger(multiplier) || multiplier <= 0) {
      fail(`asking-price factor must be a positive integer: ${name}`);
    }
  }
}

function validateMarketBehavior(config: MarketBehaviorCalibrationConfig): void {
  assertCompleteDivisions(config.openingFinanceTargets, "opening finance targets");
  for (const target of config.openingFinanceTargets) {
    if (
      target.cashMinimumMinorUnits > target.cashMedianMinorUnits
      || target.cashMedianMinorUnits > target.cashMaximumMinorUnits
    ) {
      fail(`invalid opening-cash order: ${target.division}`);
    }
    if (
      target.annualTransferBudgetMinimumMinorUnits
        > target.annualTransferBudgetMedianMinorUnits
      || target.annualTransferBudgetMedianMinorUnits
        > target.annualTransferBudgetMaximumMinorUnits
    ) {
      fail(`invalid opening-transfer-budget order: ${target.division}`);
    }
    if (target.annualTransferBudgetMaximumMinorUnits > target.cashMaximumMinorUnits) {
      fail(`opening transfer budget exceeds cash target: ${target.division}`);
    }
  }
  if (config.sellerNegotiation.counterOfferMinimumAskingBasisPoints > 10_000) {
    fail("seller counter threshold must not exceed 10000 basis points");
  }
  if (
    config.sellerNegotiation.counterOfferConcessionBasisPoints <= 0
    || config.sellerNegotiation.counterOfferConcessionBasisPoints >= 10_000
  ) {
    fail("seller counter concession must remain strictly inside the offer gap");
  }
  if (
    config.aiTransferOffer.minimumAskingBasisPoints <= 0
    || config.aiTransferOffer.minimumAskingBasisPoints
      > config.aiTransferOffer.maximumAskingBasisPoints
    || config.aiTransferOffer.maximumAskingBasisPoints > 10_000
    || (
      config.aiTransferOffer.maximumAskingBasisPoints
        - config.aiTransferOffer.minimumAskingBasisPoints
    ) % config.aiTransferOffer.askingBasisPointsStep !== 0
  ) {
    fail("AI transfer-offer spread must be ordered, capped, and step-aligned");
  }
  if (
    config.sportingWillingness.strongAbilityMinimum
      > config.sportingWillingness.eliteAbilityMinimum
  ) {
    fail("sporting willingness ability thresholds must be ordered");
  }
  if (
    config.sportingWillingness.primeMinimumAge
      > config.sportingWillingness.primeMaximumAge
  ) {
    fail("sporting willingness prime ages must be ordered");
  }
  const weightTotal = Object.values(config.aiTargetWeights).reduce((sum, weight) => sum + weight, 0);
  if (weightTotal !== 100) {
    fail(`AI target weights must total 100: ${weightTotal}`);
  }
  const riskTolerance = config.aiRiskAppetite.toleranceBasisPointsByCategory;
  if (
    riskTolerance.first_division < riskTolerance.second_division
    || riskTolerance.second_division < riskTolerance.third_division
  ) {
    fail("AI risk tolerance must not increase in lower divisions");
  }
}

function validateWageFinance(config: WageFinanceCalibrationConfig): void {
  assertUnique(config.sourceReferences.map((source) => source.id), "wage source IDs");
  assertCompleteDivisions(config.sourceBaselines, "wage source baselines");
  assertCompleteDivisions(config.gameDesignTargets, "wage game-design targets");
  assertExactOrder(config.annualWageByRating.map((anchor) => anchor.rating), PLAYER_STAR_RATINGS, "wage ratings");
  assertStrictlyIncreasing(config.annualWageByRating.map((anchor) => anchor.annualWageMinorUnits), "wage anchors");
  validateAgeLanes(config.annualWagePolicy.ageMultipliers, "wage age multipliers");
  validateAgeLanes(config.annualWagePolicy.currentWageFloorAgeMultipliers, "current-wage floor multipliers");
  assertStrictlyIncreasing(
    config.annualWagePolicy.potentialGapPremiums.map((lane) => lane.maximumGapStarsInclusive),
    "wage potential gaps",
  );
  assertNonDecreasing(
    config.annualWagePolicy.potentialGapPremiums.map((lane) => lane.premiumBasisPoints),
    "wage potential premiums",
  );

  const sourceIds = new Set(config.sourceReferences.map((source) => source.id));
  for (const baseline of config.sourceBaselines) {
    if (!sourceIds.has(baseline.sourceReferenceId)) {
      fail(`unknown wage source reference: ${baseline.sourceReferenceId}`);
    }
    if (baseline.sampleClubCount > baseline.populationClubCount) {
      fail(`wage sample exceeds population: ${baseline.division}`);
    }
  }

  for (const target of config.gameDesignTargets) {
    if (
      target.annualSeniorWageBudgetMinimumMinorUnits > target.annualSeniorWageBudgetMedianMinorUnits
      || target.annualSeniorWageBudgetMedianMinorUnits > target.annualSeniorWageBudgetMaximumMinorUnits
    ) {
      fail(`invalid wage-budget order: ${target.division}`);
    }
    assertMinimumMaximum(
      target.targetCommittedWageMinimumBasisPoints,
      target.targetCommittedWageMaximumBasisPoints,
      `${target.division} committed wages`,
    );
  }

  const duration = config.contractTermsPolicy.preferredDuration;
  if (
    duration.highPotentialMaximumAge > duration.youngMaximumAge
    || duration.youngMaximumAge > duration.primeMaximumAge
    || duration.primeMaximumAge > duration.matureMaximumAge
  ) {
    fail("contract duration age thresholds must be ordered");
  }
}

function validateAgeLanes(
  lanes: readonly {
    readonly minimumAge: number;
    readonly maximumAge: number;
    readonly multiplierBasisPoints: number;
  }[],
  label: string,
): void {
  if (lanes.length === 0) fail(`${label} must not be empty`);
  for (let index = 0; index < lanes.length; index += 1) {
    const lane = lanes[index];
    if (lane === undefined || lane.minimumAge > lane.maximumAge) {
      fail(`${label} contains an invalid age range`);
    }
    const previous = lanes[index - 1];
    if (previous !== undefined && lane.minimumAge !== previous.maximumAge + 1) {
      fail(`${label} must be contiguous and ordered`);
    }
  }
}

function validateVersionReferences(input: {
  readonly rating: PlayerRatingScaleConfig;
  readonly potentialProjectionPolicy: PlayerPotentialProjectionPolicyAsset;
  readonly market: PlayerMarketCalibrationConfig;
  readonly valuation: ValuationCurvesConfig;
  readonly asking: AskingPriceCurvesConfig;
  readonly behavior: MarketBehaviorCalibrationConfig;
  readonly wage: WageFinanceCalibrationConfig;
}): void {
  if (input.valuation.playerRatingScaleVersion !== input.rating.version) {
    fail("valuation rating-scale version does not match");
  }
  if (
    input.valuation.prospectExpectation.potentialProjectionPolicyVersion
      !== input.potentialProjectionPolicy.version
  ) {
    fail("valuation potential-projection version does not match");
  }
  if (input.valuation.playerMarketCalibrationVersion !== input.market.version) {
    fail("valuation market-calibration version does not match");
  }
  if (input.asking.valuationCurvesVersion !== input.valuation.version) {
    fail("asking-price valuation version does not match");
  }
  if (input.behavior.askingPriceCurvesVersion !== input.asking.version) {
    fail("market-behavior asking-price version does not match");
  }
  if (input.behavior.wageFinanceCalibrationVersion !== input.wage.version) {
    fail("market-behavior wage-finance version does not match");
  }
}

function assertCompleteDivisions(
  entries: readonly { readonly division: string }[],
  label: string,
): void {
  assertExactOrder(
    [...entries].map((entry) => entry.division).sort(),
    [...divisions].sort(),
    label,
  );
}

function assertPercentileOrder(
  distribution: {
    readonly medianMinorUnits: number;
    readonly p90MinorUnits: number;
    readonly p99MinorUnits: number;
    readonly maximumMinorUnits: number;
  },
  label: string,
): void {
  if (
    distribution.medianMinorUnits > distribution.p90MinorUnits
    || distribution.p90MinorUnits > distribution.p99MinorUnits
    || distribution.p99MinorUnits > distribution.maximumMinorUnits
  ) {
    fail(`invalid percentile order: ${label}`);
  }
}

function assertExactOrder(
  actual: readonly (number | string)[],
  expected: readonly (number | string)[],
  label: string,
): void {
  if (actual.length !== expected.length || actual.some((value, index) => value !== expected[index])) {
    fail(`${label} must contain the exact required values`);
  }
}

function assertUnique(values: readonly (number | string)[], label: string): void {
  if (new Set(values).size !== values.length) {
    fail(`${label} contain duplicate values`);
  }
}

function assertStrictlyIncreasing(values: readonly number[], label: string): void {
  for (let index = 1; index < values.length; index += 1) {
    const previous = values[index - 1];
    const current = values[index];
    if (previous === undefined || current === undefined || current <= previous) {
      fail(`${label} must be strictly increasing`);
    }
  }
}

function assertNonDecreasing(values: readonly number[], label: string): void {
  for (let index = 1; index < values.length; index += 1) {
    const previous = values[index - 1];
    const current = values[index];
    if (previous === undefined || current === undefined || current < previous) {
      fail(`${label} must be non-decreasing`);
    }
  }
}

function assertMinimumMaximum(minimum: number, maximum: number, label: string): void {
  if (minimum > maximum) {
    fail(`${label} minimum exceeds maximum`);
  }
}

function validationError(message: string, cause: unknown): PlayerEconomyCalibrationValidationError {
  const detail = cause instanceof Error ? cause.message : String(cause);
  return new PlayerEconomyCalibrationValidationError(`${message}: ${detail}`);
}

function fail(message: string): never {
  throw new PlayerEconomyCalibrationValidationError(message);
}

function deepFreeze<T>(value: T): T {
  if (typeof value !== "object" || value === null || Object.isFrozen(value)) {
    return value;
  }

  for (const child of Object.values(value)) {
    deepFreeze(child);
  }

  return Object.freeze(value);
}
