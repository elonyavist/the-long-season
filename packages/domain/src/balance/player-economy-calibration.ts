import type { ClubCategory } from "../entities/club.entity.ts";
import type { PlayerRole } from "../entities/player.entity.ts";
import type { AgreedSquadStatus } from "../career/senior-squad.ts";
import { nonNegativeMoney, type Money } from "../value-objects/money.ts";
import type { PlayerStarRating } from "../value-objects/player-star-rating.ts";
import type { PlayerSquadDepartment } from "../player/player-squad-department.ts";

/** Provenance categories that keep source facts separate from game design. */
export type CalibrationDataClassification =
  | "derived_aggregate"
  | "explicit_game_design_target"
  | "mixed"
  | "observed_source_fact";

/** Stable version references stamped into new careers and diagnostic reports. */
export interface PlayerEconomyCalibrationVersionBundle {
  readonly topologyDecisionId: string;
  readonly playerRatingScaleVersion: string;
  readonly playerMarketCalibrationVersion: string;
  readonly valuationCurvesVersion: string;
  readonly askingPriceCurvesVersion: string;
  readonly marketBehaviorCalibrationVersion: string;
  readonly wageFinanceCalibrationVersion: string;
}

/** One cited public source used by an aggregate calibration asset. */
export interface CalibrationSourceReference {
  readonly id: string;
  readonly title: string;
  readonly url: string;
  readonly classification: "observed_source_fact";
}

/** Percentile distribution expressed as integer minor currency units. */
export interface MoneyPercentileDistribution {
  readonly medianMinorUnits: number;
  readonly p90MinorUnits: number;
  readonly p99MinorUnits: number;
  readonly maximumMinorUnits: number;
}

/** One ability boundary on the closed public star scale. */
export interface PlayerRatingAbilityThreshold {
  readonly minimumAbilityInclusive: number;
  readonly rating: PlayerStarRating;
}

/** First-team-ready rating expectations for one football division. */
export interface DivisionFirstTeamRatingBand {
  readonly division: ClubCategory;
  readonly normalMinimum: PlayerStarRating;
  readonly normalMaximum: PlayerStarRating;
  readonly exceptionalMaximum: PlayerStarRating;
}

/** Initial-world, intake, and year-ten exceptional-player limits. */
export interface PlayerRatingRarityContract {
  readonly initialWorld: {
    readonly currentSixMinimum: number;
    readonly currentSixMaximum: number;
    readonly potentialSixMinimum: number;
    readonly potentialSixMaximum: number;
    readonly lowerDivisionPotentialSixMaximum: number;
  };
  readonly annualIntake: {
    readonly potentialSixPerWorldMinimum: number;
    readonly potentialSixPerWorldMaximum: number;
    readonly tenSeasonCohortMinimum: number;
    readonly tenSeasonCohortMaximum: number;
  };
  readonly yearTen: {
    readonly activeCurrentSixMaximum: number;
    readonly activePotentialSixMaximum: number;
    readonly lowerDivisionPotentialSixMaximum: number;
  };
}

/** Versioned public-rating and rarity configuration. */
export interface PlayerRatingScaleConfig {
  readonly schemaVersion: number;
  readonly version: string;
  readonly classification: "explicit_game_design_target";
  readonly supportedRatings: readonly PlayerStarRating[];
  readonly abilityThresholds: readonly PlayerRatingAbilityThreshold[];
  readonly divisionFirstTeamBands: readonly DivisionFirstTeamRatingBand[];
  readonly rarity: PlayerRatingRarityContract;
}

/** Broad development curve selected from a player's canonical primary role. */
export type PlayerPotentialProjectionRoleFamily = "goalkeeper" | "outfield";

/**
 * One inclusive age band for public room-realization estimates.
 *
 * Factors are integer basis points applied to the remaining role-ability room,
 * never directly to public stars. The upper factor models a high-upside public
 * estimate and never replaces the player's stored potential ceiling.
 */
export interface PlayerPotentialProjectionAgeBand {
  readonly minimumAge: number;
  readonly maximumAge: number;
  readonly conservativeRealizationBasisPoints: number;
  readonly expectedRealizationBasisPoints: number;
  readonly upperRealizationBasisPoints: number;
}

/** Caller-supplied policy for a derived, non-persisted potential projection. */
export interface PlayerPotentialProjectionPolicyConfig {
  readonly schemaVersion: number;
  readonly version: string;
  readonly classification: "explicit_game_design_target";
  readonly ageBandsByRoleFamily: Readonly<
    Record<
      PlayerPotentialProjectionRoleFamily,
      readonly PlayerPotentialProjectionAgeBand[]
    >
  >;
}

/** Stable validation failures for potential-projection policy assets. */
export type PlayerPotentialProjectionPolicyErrorCode =
  | "invalid_schema_version"
  | "invalid_version"
  | "missing_age_bands"
  | "non_contiguous_age_bands"
  | "invalid_realization_factors"
  | "widening_public_estimate_spread";

/** Typed policy error raised before engine projection can consume bad tuning. */
export class PlayerPotentialProjectionPolicyError extends Error {
  public readonly code: PlayerPotentialProjectionPolicyErrorCode;

  /** Creates one stable validation failure for content and focused tests. */
  public constructor(
    code: PlayerPotentialProjectionPolicyErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "PlayerPotentialProjectionPolicyError";
    this.code = code;
  }
}

/**
 * Validates one complete potential-projection policy without owning tuning.
 *
 * The public P10-to-P90 realization-estimate spread may narrow or remain
 * stable with age inside each role family, but cannot widen for otherwise
 * equivalent facts.
 */
export function validatePlayerPotentialProjectionPolicyConfig(
  config: PlayerPotentialProjectionPolicyConfig,
): void {
  if (!Number.isSafeInteger(config.schemaVersion) || config.schemaVersion <= 0) {
    throw new PlayerPotentialProjectionPolicyError(
      "invalid_schema_version",
      "Potential projection policy requires a positive schema version",
    );
  }
  if (config.version.trim().length === 0) {
    throw new PlayerPotentialProjectionPolicyError(
      "invalid_version",
      "Potential projection policy requires a stable version",
    );
  }

  for (const family of ["goalkeeper", "outfield"] as const) {
    const bands = config.ageBandsByRoleFamily[family];
    if (bands.length === 0) {
      throw new PlayerPotentialProjectionPolicyError(
        "missing_age_bands",
        `Potential projection policy has no ${family} age bands`,
      );
    }
    let previousMaximumAge = -1;
    let previousPublicWidth = Number.POSITIVE_INFINITY;
    for (const band of bands) {
      if (
        !Number.isSafeInteger(band.minimumAge)
        || !Number.isSafeInteger(band.maximumAge)
        || band.minimumAge !== previousMaximumAge + 1
        || band.maximumAge < band.minimumAge
      ) {
        throw new PlayerPotentialProjectionPolicyError(
          "non_contiguous_age_bands",
          `Potential projection ${family} age bands must be ordered and contiguous`,
        );
      }
      if (
        !Number.isSafeInteger(band.conservativeRealizationBasisPoints)
        || !Number.isSafeInteger(band.expectedRealizationBasisPoints)
        || !Number.isSafeInteger(band.upperRealizationBasisPoints)
        || band.conservativeRealizationBasisPoints < 0
        || band.expectedRealizationBasisPoints
          < band.conservativeRealizationBasisPoints
        || band.upperRealizationBasisPoints
          < band.expectedRealizationBasisPoints
        || band.upperRealizationBasisPoints > 10_000
      ) {
        throw new PlayerPotentialProjectionPolicyError(
          "invalid_realization_factors",
          `Potential projection ${family} factors must satisfy 0 <= conservative <= expected <= upper <= 10000`,
        );
      }
      const publicWidth =
        band.upperRealizationBasisPoints
        - band.conservativeRealizationBasisPoints;
      if (publicWidth > previousPublicWidth) {
        throw new PlayerPotentialProjectionPolicyError(
          "widening_public_estimate_spread",
          `Older ${family} bands cannot widen the conservative-to-upper public estimate spread`,
        );
      }
      previousMaximumAge = band.maximumAge;
      previousPublicWidth = publicWidth;
    }
  }
}

/** One complete public market-value sample captured from a competition. */
export interface PlayerMarketCompetitionSample {
  readonly id: string;
  readonly division: ClubCategory;
  readonly classification: "observed_source_fact";
  readonly sourceReferenceId: string;
  readonly clubCount: number;
  readonly listedPlayerCount: number;
  readonly includedValuationCount: number;
  readonly excludedUnvaluedCount: number;
  readonly totalValueMinorUnits: number;
  readonly distribution: MoneyPercentileDistribution;
}

/** Aggregate youth/prospect leaderboard evidence retained without player rows. */
export interface PlayerMarketProspectSample {
  readonly id: string;
  readonly division: ClubCategory;
  readonly classification: "observed_source_fact";
  readonly sourceReferenceId: string;
  readonly ageFilter: "u19" | "u21";
  readonly populationScope: "bounded_leaderboard";
  readonly observedRowCount: number;
  readonly minimumAge: number;
  readonly maximumAge: number;
  readonly distribution: MoneyPercentileDistribution;
}

/** Derived division-level market baseline and 22-senior comparator. */
export interface PlayerMarketDivisionBaseline {
  readonly division: ClubCategory;
  readonly classification: "derived_aggregate";
  readonly clubCount: number;
  readonly listedPlayerCount: number;
  readonly includedValuationCount: number;
  readonly totalValueMinorUnits: number;
  readonly meanListedPlayerValueMinorUnits: number;
  readonly rawAverageSquadValueMinorUnits: number;
  readonly normalized22SeniorSquadValueMinorUnits: number;
  readonly distribution: MoneyPercentileDistribution;
}

/** Distributional public-value target with explicit seeded tolerance. */
export interface PlayerMarketDivisionTarget {
  readonly division: ClubCategory;
  readonly classification: "explicit_game_design_target";
  readonly distribution: MoneyPercentileDistribution;
  readonly medianToleranceBasisPoints: number;
  readonly p90ToleranceBasisPoints: number;
  readonly p99ToleranceBasisPoints: number;
  readonly minimumMaximumMinorUnits: number;
  readonly maximumMaximumMinorUnits: number;
}

/** One measured category projection from the pre-79C game model. */
export interface CurrentGameMarketCategoryBaseline {
  readonly division: ClubCategory;
  readonly sampleSize: number;
  readonly meanMinorUnits: number;
  readonly distribution: MoneyPercentileDistribution;
}

/** Reproducible measured baseline of the pre-79C valuation implementation. */
export interface CurrentGameMarketBaseline {
  readonly classification: "derived_aggregate";
  readonly repositoryCommit: string;
  readonly relevantDiffSha256: string;
  readonly nodeVersion: string;
  readonly worldCount: number;
  readonly seedPrefix: string;
  readonly projectionMethod: string;
  readonly categories: readonly CurrentGameMarketCategoryBaseline[];
}

/** Dated aggregate player-market evidence and accepted distribution targets. */
export interface PlayerMarketCalibrationConfig {
  readonly schemaVersion: number;
  readonly version: string;
  readonly classification: "mixed";
  readonly retrievedAt: string;
  readonly timeZone: string;
  readonly seasonSelector: string;
  readonly currency: "EUR";
  readonly percentileMethod: string;
  readonly sourceReferences: readonly CalibrationSourceReference[];
  readonly competitionSamples: readonly PlayerMarketCompetitionSample[];
  readonly prospectSamples: readonly PlayerMarketProspectSample[];
  readonly divisionBaselines: readonly PlayerMarketDivisionBaseline[];
  readonly gameDesignTargets: readonly PlayerMarketDivisionTarget[];
  readonly currentGameBaseline: CurrentGameMarketBaseline;
}

/** Rating-to-value anchor used by the future public-value function. */
export interface PublicValueRatingAnchor {
  readonly rating: PlayerStarRating;
  readonly valueMinorUnits: number;
}

/** Inclusive age band expressed as a basis-point multiplier. */
export interface EconomyAgeMultiplierBand {
  readonly minimumAge: number;
  readonly maximumAge: number;
  readonly multiplierBasisPoints: number;
}

/** Versioned, declarative public-value curve design. */
export interface ValuationCurvesConfig {
  readonly schemaVersion: number;
  readonly version: string;
  readonly classification: "explicit_game_design_target";
  readonly playerRatingScaleVersion: string;
  readonly playerMarketCalibrationVersion: string;
  /** Exponent applied inside adjacent rating-anchor intervals, in thousandths. */
  readonly qualityInterpolationExponentMilli: number;
  readonly ratingValueAnchors: readonly PublicValueRatingAnchor[];
  readonly ageMultipliers: readonly EconomyAgeMultiplierBand[];
  /**
   * Risk policy applied to the Step 05a expected projection, never to the raw
   * stored ceiling.
   */
  readonly prospectExpectation: {
    readonly version: string;
    readonly potentialProjectionPolicyVersion: string;
    readonly uncertaintyDiscountBasisPointsPerHalfStar: number;
    readonly minimumUncertaintyMultiplierBasisPoints: number;
  };
  readonly positionMultipliers: Readonly<Record<"defender" | "forward" | "goalkeeper" | "midfielder", number>>;
  /** Owner-market context; observer identity never enters public value. */
  readonly marketContext: {
    readonly multiplierBasisPoints: Readonly<Record<ClubCategory | "free_agent", number>>;
    readonly maximumMinorUnits: Readonly<Record<ClubCategory | "free_agent", number>>;
  };
  readonly upperTail: {
    readonly compressionStartsMinorUnits: number;
    readonly compressionBasisPoints: number;
    readonly hardCapMinorUnits: number;
    readonly hardCapMaximumAge: number;
    readonly hardCapRequiredRating: PlayerStarRating;
  };
}

/** One ordered multiplier band used to derive a seller asking price. */
export interface AskingPriceFactorBand {
  readonly maximumValueInclusive: number;
  readonly multiplierBasisPoints: number;
}

/** Versioned, declarative public-value-to-asking-price design. */
export interface AskingPriceCurvesConfig {
  readonly schemaVersion: number;
  readonly version: string;
  readonly classification: "explicit_game_design_target";
  readonly valuationCurvesVersion: string;
  readonly contractDaysRemaining: readonly AskingPriceFactorBand[];
  readonly squadStatusMultipliers: Readonly<Record<"key_player" | "prospect" | "rotation" | "starter" | "surplus", number>>;
  readonly replacementNeedMultipliers: Readonly<Record<"covered" | "critical" | "thin", number>>;
  readonly sellerPressureMultipliers: Readonly<Record<"healthy" | "must_sell" | "strained", number>>;
  readonly playerDesireMultipliers: Readonly<Record<"content" | "open_to_move" | "wants_exit", number>>;
  readonly finalMultiplierMinimumBasisPoints: number;
  readonly finalMultiplierMaximumBasisPoints: number;
  readonly freeAgentTransferFeeMinorUnits: 0;
}

/** Versioned willingness, affordability, and AI-target design parameters. */
export interface OpeningClubFinanceTarget {
  readonly division: ClubCategory;
  readonly classification: "explicit_game_design_target";
  readonly cashMinimumMinorUnits: number;
  readonly cashMedianMinorUnits: number;
  readonly cashMaximumMinorUnits: number;
  readonly annualTransferBudgetMinimumMinorUnits: number;
  readonly annualTransferBudgetMedianMinorUnits: number;
  readonly annualTransferBudgetMaximumMinorUnits: number;
}

/** Versioned willingness, affordability, and AI-target design parameters. */
export interface MarketBehaviorCalibrationConfig {
  readonly schemaVersion: number;
  readonly version: string;
  readonly classification: "explicit_game_design_target";
  readonly askingPriceCurvesVersion: string;
  readonly wageFinanceCalibrationVersion: string;
  readonly openingFinanceRoundingMinorUnits: number;
  readonly openingFinanceTargets: readonly OpeningClubFinanceTarget[];
  readonly sellerNegotiation: {
    readonly counterOfferMinimumAskingBasisPoints: number;
    /** Share of the asking/offered gap conceded by the seller in a counter. */
    readonly counterOfferConcessionBasisPoints: number;
  };
  /** Deterministic AI bid spread below or at the seller's asking price. */
  readonly aiTransferOffer: {
    readonly version: string;
    readonly minimumAskingBasisPoints: number;
    readonly maximumAskingBasisPoints: number;
    readonly askingBasisPointsStep: number;
  };
  readonly sportingWillingness: {
    readonly sameDivisionScore: number;
    readonly oneDivisionUpScore: number;
    readonly oneDivisionDownScore: number;
    readonly twoDivisionsUpScore: number;
    readonly twoDivisionsDownScore: number;
    readonly reputationScorePerPoint: number;
    readonly squadStatusScorePerStep: number;
    readonly wageScorePerTenPercent: number;
    readonly maximumAbsoluteWageScore: number;
    readonly contractYearScore: number;
    readonly strongAbilityMinimum: number;
    readonly eliteAbilityMinimum: number;
    readonly primeMinimumAge: number;
    readonly primeMaximumAge: number;
    readonly oneDivisionStrongPenalty: number;
    readonly twoDivisionStrongPenalty: number;
    readonly reputationDropMinimum: number;
    readonly reputationDropPenalty: number;
    readonly primeDownwardPenalty: number;
    readonly annualWageRegressionThresholdBasisPoints: number;
    readonly annualWageRegressionPenalty: number;
    readonly squadStatusRegressionPenalty: number;
    readonly contractSecurityGraceDays: number;
    readonly contractSecurityRegressionPenalty: number;
    readonly acceptanceScoreMinimum: number;
  };
  readonly affordability: {
    readonly minimumCashReserveBasisPoints: number;
    readonly maximumTransferBudgetUseBasisPoints: number;
    readonly maximumWageBudgetUseBasisPoints: number;
  };
  readonly aiTargetWeights: {
    readonly quality: number;
    readonly potential: number;
    readonly roleNeed: number;
    readonly affordability: number;
  };
  readonly aiLifecycle: {
    readonly maximumActiveTalks: number;
    readonly maximumPermanentStartsPerSeason: number;
    readonly maximumPreliminaryStartsPerSeason: number;
    readonly permanentCheckpointDays: number;
    readonly preliminaryCheckpointDays: number;
    readonly preliminaryEligibilityDays: number;
    readonly expiringContractDays: number;
    readonly targetDepartmentDepth: Readonly<Record<PlayerSquadDepartment, number>>;
    readonly goalkeeperAgingAge: number;
    readonly outfieldAgingAge: number;
    readonly averageQualityGap: number;
    readonly weakestQualityGap: number;
    readonly maximumSquadAboveTarget: number;
    readonly needPriorityWeights: {
      readonly structuralDeficit: number;
      readonly targetDeficit: number;
      readonly expiringContract: number;
      readonly agingDepartment: number;
      readonly qualityGap: number;
    };
  };
}

/** Independent club-finance observation for one source division. */
export interface WageFinanceDivisionSourceBaseline {
  readonly division: ClubCategory;
  readonly classification: "observed_source_fact";
  readonly sourceReferenceId: string;
  readonly sourceSeason: string;
  readonly sampleClubCount: number;
  readonly populationClubCount: number;
  readonly valueOfProductionPerClubMinorUnits: number;
  readonly employeeCostPerClubMinorUnits: number;
  readonly employeeCostToProductionBasisPoints: number;
  readonly approximate: boolean;
}

/** Explicit game budget targets grounded in independent finance evidence. */
export interface WageFinanceDivisionTarget {
  readonly division: ClubCategory;
  readonly classification: "explicit_game_design_target";
  readonly annualSeniorWageBudgetMinimumMinorUnits: number;
  readonly annualSeniorWageBudgetMedianMinorUnits: number;
  readonly annualSeniorWageBudgetMaximumMinorUnits: number;
  readonly targetCommittedWageMinimumBasisPoints: number;
  readonly targetCommittedWageMaximumBasisPoints: number;
}

/** One age lane used by the reviewed annual-wage policy. */
export interface WageAgeMultiplier {
  readonly minimumAge: number;
  readonly maximumAge: number;
  readonly multiplierBasisPoints: number;
}

/** One potential-gap lane used only for young-player wage demand. */
export interface WagePotentialGapPremium {
  readonly maximumGapStarsInclusive: number;
  readonly premiumBasisPoints: number;
}

/** All deterministic coefficients used to derive one annual base wage. */
export interface AnnualWagePolicy {
  readonly roundingMinorUnits: number;
  readonly divisionMultipliers: Readonly<Record<ClubCategory, number>>;
  readonly squadStatusMultipliers: Readonly<Record<AgreedSquadStatus, number>>;
  readonly ageMultipliers: readonly WageAgeMultiplier[];
  readonly potentialPremiumMaximumAge: number;
  readonly potentialGapPremiums: readonly WagePotentialGapPremium[];
  readonly freeAgentMultiplierBasisPoints: number;
  readonly longContractMinimumDaysExclusive: number;
  readonly longContractMultiplierBasisPoints: number;
  readonly currentWageFloorAgeMultipliers: readonly WageAgeMultiplier[];
}

/** Supported duration and bonus coefficients for generated and negotiated terms. */
export interface ContractTermsPolicy {
  readonly preferredDuration: {
    readonly highPotentialMaximumAge: number;
    readonly highPotentialMinimumGapStars: number;
    readonly highPotentialYears: number;
    readonly youngMaximumAge: number;
    readonly youngYears: number;
    readonly primeMaximumAge: number;
    readonly primeYears: number;
    readonly matureMaximumAge: number;
    readonly matureYears: number;
    readonly veteranYears: number;
    readonly minimumDurationReductionYears: number;
  };
  readonly minimumWageMultiplierBasisPoints: number;
  readonly minimumBonusMultiplierBasisPoints: number;
  readonly bonuses: {
    readonly annualAppearanceDivisor: number;
    readonly signingBonusBasisPoints: Readonly<Record<AgreedSquadStatus, number>>;
    readonly goalBonusMultiplierBasisPoints: number;
    readonly defensiveCleanSheetMultiplierBasisPoints: number;
    readonly roundingMinorUnits: number;
    readonly signingRoundingMinorUnits: number;
  };
}

/** Versioned independent wage/finance evidence and game-design targets. */
export interface WageFinanceCalibrationConfig {
  readonly schemaVersion: number;
  readonly version: string;
  readonly classification: "mixed";
  readonly retrievedAt: string;
  readonly timeZone: string;
  readonly currency: "EUR";
  readonly sourceReferences: readonly CalibrationSourceReference[];
  readonly sourceBaselines: readonly WageFinanceDivisionSourceBaseline[];
  readonly gameDesignTargets: readonly WageFinanceDivisionTarget[];
  readonly openingBudgetRoundingMinorUnits: number;
  readonly annualWageByRating: readonly {
    readonly rating: PlayerStarRating;
    readonly annualWageMinorUnits: number;
  }[];
  readonly annualWagePolicy: AnnualWagePolicy;
  readonly contractTermsPolicy: ContractTermsPolicy;
}

/** Version-linked content required by every wage and contract calculation. */
export interface PlayerWagePolicyConfig {
  readonly ratingScale: PlayerRatingScaleConfig;
  readonly wageFinanceCalibration: WageFinanceCalibrationConfig;
}

/** Contract context supplied to the shared annual-wage calculation. */
export interface CalibratedAnnualWageInput {
  readonly policy: PlayerWagePolicyConfig;
  readonly category: ClubCategory;
  readonly status: AgreedSquadStatus;
  readonly currentAbility: number;
  readonly potentialAbility: number;
  readonly age: number;
  readonly currentAnnualWage?: Money;
  readonly remainingContractDays?: number;
  readonly isFreeAgent?: boolean;
}

/**
 * Derives one annual base wage from global quality and the reviewed policy.
 *
 * The function deliberately accepts no public market value. Generated
 * contracts and runtime demands therefore share the exact same arithmetic
 * without creating a content dependency in the engine.
 */
export function deriveCalibratedAnnualWage(input: CalibratedAnnualWageInput): Money {
  const config = input.policy.wageFinanceCalibration;
  const policy = config.annualWagePolicy;
  const currentRating = deriveContinuousPlayerWageRating(input.currentAbility, input.policy.ratingScale);
  const potentialRating = deriveContinuousPlayerWageRating(input.potentialAbility, input.policy.ratingScale);
  const baseWage = interpolateMoneyAnchor(currentRating, config.annualWageByRating);
  const ageMultiplier = multiplierForAge(input.age, policy.ageMultipliers);
  const potentialPremium = input.age <= policy.potentialPremiumMaximumAge
    ? premiumForGap(Math.max(0, potentialRating - currentRating), policy.potentialGapPremiums)
    : 0;
  const contractMultiplier = input.isFreeAgent === true
    ? policy.freeAgentMultiplierBasisPoints
    : (input.remainingContractDays ?? 0) > policy.longContractMinimumDaysExclusive
      ? policy.longContractMultiplierBasisPoints
      : 10_000;
  const calibrated = applyBasisPoints(
    applyBasisPoints(
      applyBasisPoints(
        applyBasisPoints(baseWage, policy.divisionMultipliers[input.category]),
        policy.squadStatusMultipliers[input.status],
      ),
      ageMultiplier,
    ),
    10_000 + potentialPremium,
  );
  const contextual = applyBasisPoints(calibrated, contractMultiplier);
  const currentWage = input.currentAnnualWage ?? nonNegativeMoney(0);
  const currentWageFloor = currentWage > 0
    ? applyBasisPoints(currentWage, multiplierForAge(input.age, policy.currentWageFloorAgeMultipliers))
    : 0;
  return nonNegativeMoney(roundMoney(
    Math.max(contextual, currentWageFloor),
    policy.roundingMinorUnits,
  ));
}

/**
 * Derives the supported bonuses for one annual wage and squad role.
 *
 * `scaleBasisPoints` lets minimum terms reuse the same policy at a documented
 * percentage without maintaining a second bonus formula.
 */
export function deriveCalibratedContractBonuses(input: {
  readonly policy: PlayerWagePolicyConfig;
  readonly role: PlayerRole;
  readonly annualWage: Money;
  readonly status: AgreedSquadStatus;
  readonly scaleBasisPoints?: number;
}): {
  readonly signingBonus: Money;
  readonly appearanceBonus: Money;
  readonly goalBonus?: Money;
  readonly cleanSheetBonus?: Money;
} {
  const config = input.policy.wageFinanceCalibration.contractTermsPolicy.bonuses;
  const scale = input.scaleBasisPoints ?? 10_000;
  const appearanceBonus = nonNegativeMoney(roundMoney(
    applyBasisPoints(input.annualWage / config.annualAppearanceDivisor, scale),
    config.roundingMinorUnits,
  ));
  const result: {
    signingBonus: Money;
    appearanceBonus: Money;
    goalBonus?: Money;
    cleanSheetBonus?: Money;
  } = {
    signingBonus: nonNegativeMoney(roundMoney(
      applyBasisPoints(
        applyBasisPoints(input.annualWage, config.signingBonusBasisPoints[input.status]),
        scale,
      ),
      config.signingRoundingMinorUnits,
    )),
    appearanceBonus,
  };
  if (input.role !== "goalkeeper") {
    result.goalBonus = nonNegativeMoney(roundMoney(
      applyBasisPoints(appearanceBonus, config.goalBonusMultiplierBasisPoints),
      config.roundingMinorUnits,
    ));
  }
  if (DEFENSIVE_WAGE_ROLES.has(input.role)) {
    result.cleanSheetBonus = nonNegativeMoney(roundMoney(
      applyBasisPoints(appearanceBonus, config.defensiveCleanSheetMultiplierBasisPoints),
      config.roundingMinorUnits,
    ));
  }
  return result;
}

/** Selects the preferred contract length from the same versioned terms policy. */
export function derivePreferredContractDurationYears(input: {
  readonly policy: PlayerWagePolicyConfig;
  readonly age: number;
  readonly potentialGapStars: number;
}): number {
  const config = input.policy.wageFinanceCalibration.contractTermsPolicy.preferredDuration;
  if (
    input.age <= config.highPotentialMaximumAge
    && input.potentialGapStars >= config.highPotentialMinimumGapStars
  ) return config.highPotentialYears;
  if (input.age <= config.youngMaximumAge) return config.youngYears;
  if (input.age <= config.primeMaximumAge) return config.primeYears;
  if (input.age <= config.matureMaximumAge) return config.matureYears;
  return config.veteranYears;
}

/**
 * Projects exact role ability onto the continuous global star axis.
 *
 * Public UI still rounds to supported half-stars; wage interpolation keeps the
 * exact ability signal so two players inside one visible band need not earn the
 * same amount.
 */
export function deriveContinuousPlayerWageRating(
  ability: number,
  scale: PlayerRatingScaleConfig,
): number {
  const thresholds = scale.abilityThresholds;
  const first = thresholds[0];
  if (first === undefined || ability <= first.minimumAbilityInclusive) return first?.rating ?? 1;
  for (let index = 1; index < thresholds.length; index += 1) {
    const upper = thresholds[index];
    const lower = thresholds[index - 1];
    if (upper === undefined || lower === undefined) continue;
    if (ability < upper.minimumAbilityInclusive) {
      const width = upper.minimumAbilityInclusive - lower.minimumAbilityInclusive;
      const progress = width <= 0 ? 0 : (ability - lower.minimumAbilityInclusive) / width;
      return lower.rating + (upper.rating - lower.rating) * Math.max(0, Math.min(1, progress));
    }
  }
  return thresholds.at(-1)?.rating ?? 1;
}

function interpolateMoneyAnchor(
  rating: number,
  anchors: WageFinanceCalibrationConfig["annualWageByRating"],
): number {
  const first = anchors[0];
  if (first === undefined || rating <= first.rating) return first?.annualWageMinorUnits ?? 0;
  for (let index = 1; index < anchors.length; index += 1) {
    const upper = anchors[index];
    const lower = anchors[index - 1];
    if (upper === undefined || lower === undefined) continue;
    if (rating <= upper.rating) {
      const progress = (rating - lower.rating) / (upper.rating - lower.rating);
      return lower.annualWageMinorUnits
        + (upper.annualWageMinorUnits - lower.annualWageMinorUnits) * progress;
    }
  }
  return anchors.at(-1)?.annualWageMinorUnits ?? 0;
}

function multiplierForAge(age: number, lanes: readonly WageAgeMultiplier[]): number {
  return lanes.find((lane) => age >= lane.minimumAge && age <= lane.maximumAge)?.multiplierBasisPoints
    ?? lanes.at(-1)?.multiplierBasisPoints
    ?? 10_000;
}

function premiumForGap(gap: number, lanes: readonly WagePotentialGapPremium[]): number {
  return lanes.find((lane) => gap <= lane.maximumGapStarsInclusive)?.premiumBasisPoints
    ?? lanes.at(-1)?.premiumBasisPoints
    ?? 0;
}

function applyBasisPoints(value: number, basisPoints: number): number {
  return Math.round((value * basisPoints) / 10_000);
}

function roundMoney(value: number, precision: number): number {
  return Math.max(0, Math.round(value / precision) * precision);
}

const DEFENSIVE_WAGE_ROLES = new Set<PlayerRole>([
  "goalkeeper",
  "center_back",
  "full_back",
  "wing_back",
  "defensive_midfielder",
]);

/** All validated player-economy assets selected together at composition time. */
export interface PlayerEconomyCalibrationBundle {
  readonly versions: PlayerEconomyCalibrationVersionBundle;
  readonly playerRatingScale: PlayerRatingScaleConfig;
  readonly playerMarketCalibration: PlayerMarketCalibrationConfig;
  readonly valuationCurves: ValuationCurvesConfig;
  readonly askingPriceCurves: AskingPriceCurvesConfig;
  readonly marketBehaviorCalibration: MarketBehaviorCalibrationConfig;
  readonly wageFinanceCalibration: WageFinanceCalibrationConfig;
}
