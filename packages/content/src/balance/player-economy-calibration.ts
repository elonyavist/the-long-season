import askingPriceCurvesJson from "./asking-price-curves.json" with { type: "json" };
import marketBehaviorCalibrationJson from "./market-behavior-calibration.json" with { type: "json" };
import playerMarketCalibrationJson from "./player-market-calibration.json" with { type: "json" };
import playerRatingScaleJson from "./player-rating-scale.json" with { type: "json" };
import valuationCurvesJson from "./valuation-curves.json" with { type: "json" };
import wageFinanceCalibrationJson from "./wage-finance-calibration.json" with { type: "json" };
import type { PlayerEconomyCalibrationVersionBundle } from "@game/domain";
import { parsePlayerEconomyCalibrationAssets } from "../schemas/player-economy-calibration.schema.ts";

/**
 * Validated, cross-versioned, immutable player-economy content bundle.
 *
 * Composition roots may pass this bundle to domain-facing services explicitly;
 * engine and simulation-tools must never import content directly.
 */
export const playerEconomyCalibration = parsePlayerEconomyCalibrationAssets({
  playerRatingScale: playerRatingScaleJson,
  playerMarketCalibration: playerMarketCalibrationJson,
  valuationCurves: valuationCurvesJson,
  askingPriceCurves: askingPriceCurvesJson,
  marketBehaviorCalibration: marketBehaviorCalibrationJson,
  wageFinanceCalibration: wageFinanceCalibrationJson,
});

/** Closed global rating-scale design selected by the content bundle. */
export const playerRatingScale = playerEconomyCalibration.playerRatingScale;

/**
 * Age- and role-aware public projection policy calibrated from the Step 01
 * deterministic development outcome matrix.
 */
export const playerPotentialProjectionPolicy =
  playerEconomyCalibration.playerPotentialProjectionPolicy;

/**
 * Selects the projection policy only for the exact supported career bundle.
 *
 * The policy is derived presentation configuration: it is never copied into
 * player state or persisted as a floor/range.
 */
export function selectPlayerPotentialProjectionPolicy(
  versions: PlayerEconomyCalibrationVersionBundle | undefined,
): typeof playerPotentialProjectionPolicy {
  if (
    versions?.topologyDecisionId
      !== playerEconomyCalibration.versions.topologyDecisionId
    || versions.playerRatingScaleVersion !== playerRatingScale.version
  ) {
    throw new Error("Career potential-projection calibration versions are unsupported");
  }
  return playerPotentialProjectionPolicy;
}

/** Dated aggregate market evidence and its separately labeled targets. */
export const playerMarketCalibration = playerEconomyCalibration.playerMarketCalibration;

/** Reviewed public-value design curves, not a live source formula. */
export const valuationCurves = playerEconomyCalibration.valuationCurves;

/** Explicit public-value content shape consumed by engine callers. */
export const playerValuationConfig = Object.freeze({
  ratingScale: playerRatingScale,
  potentialProjectionPolicy: playerPotentialProjectionPolicy,
  marketCalibration: playerMarketCalibration,
  valuationCurves,
});

/**
 * Selects public-value content only when it matches the versions stamped in a
 * career. The current bundle contains one reviewed version per asset; a future
 * catalog may extend this boundary without changing engine APIs.
 */
export function selectPlayerValuationConfig(
  versions: PlayerEconomyCalibrationVersionBundle | undefined,
): typeof playerValuationConfig {
  if (
    versions?.playerRatingScaleVersion !== playerRatingScale.version
    || versions.playerMarketCalibrationVersion !== playerMarketCalibration.version
    || versions.valuationCurvesVersion !== valuationCurves.version
  ) {
    throw new Error("Career public-value calibration versions are unsupported");
  }
  return playerValuationConfig;
}

/** Reviewed seller asking-price design curves. */
export const askingPriceCurves = playerEconomyCalibration.askingPriceCurves;

/**
 * Selects seller asking-price content only for the exact version stamped in a
 * career. Keeping this check beside the public-value selector prevents a
 * negotiation from mixing two independently revised economy models.
 */
export function selectAskingPriceCurves(
  versions: PlayerEconomyCalibrationVersionBundle | undefined,
): typeof askingPriceCurves {
  if (
    versions?.askingPriceCurvesVersion !== askingPriceCurves.version
    || versions.valuationCurvesVersion !== askingPriceCurves.valuationCurvesVersion
  ) {
    throw new Error("Career asking-price calibration versions are unsupported");
  }
  return askingPriceCurves;
}

/** Reviewed sporting-willingness and affordability design data. */
export const marketBehaviorCalibration = playerEconomyCalibration.marketBehaviorCalibration;

/**
 * Selects market behavior only when all linked economy versions match.
 *
 * Selected-club and AI composition roots use this boundary so willingness,
 * affordability, seller replies, and target ranking cannot silently mix
 * coefficients from different careers.
 */
export function selectMarketBehaviorCalibration(
  versions: PlayerEconomyCalibrationVersionBundle | undefined,
): typeof marketBehaviorCalibration {
  if (
    versions?.marketBehaviorCalibrationVersion !== marketBehaviorCalibration.version
    || versions.askingPriceCurvesVersion
      !== marketBehaviorCalibration.askingPriceCurvesVersion
    || versions.wageFinanceCalibrationVersion
      !== marketBehaviorCalibration.wageFinanceCalibrationVersion
  ) {
    throw new Error("Career market-behavior calibration versions are unsupported");
  }
  return marketBehaviorCalibration;
}

/** Independent wage/club-finance evidence and reviewed game targets. */
export const wageFinanceCalibration = playerEconomyCalibration.wageFinanceCalibration;

/** Exact version-linked inputs shared by generated and runtime wage policies. */
export const playerWagePolicyConfig = Object.freeze({
  ratingScale: playerRatingScale,
  wageFinanceCalibration,
});

/**
 * Selects wage/contract content only for the versions stamped in a career.
 *
 * Composition roots call this before entering engine code, which keeps the
 * engine independent from content while preventing mixed calibration versions.
 */
export function selectPlayerWagePolicyConfig(
  versions: PlayerEconomyCalibrationVersionBundle | undefined,
): typeof playerWagePolicyConfig {
  if (
    versions?.playerRatingScaleVersion !== playerRatingScale.version
    || versions.wageFinanceCalibrationVersion !== wageFinanceCalibration.version
  ) {
    throw new Error("Career wage/contract calibration versions are unsupported");
  }
  return playerWagePolicyConfig;
}
