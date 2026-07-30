import type {
  AgreedSquadStatus,
  AskingPriceCurvesConfig,
  Money,
} from "@game/domain";

/** Squad coverage known to the seller before accepting a permanent transfer. */
export type SellerReplacementNeed = "covered" | "thin" | "critical";

/** Finance pressure known to the selling club at offer submission time. */
export type SellerFinancePressure = "healthy" | "strained" | "must_sell";

/** Player disposition supported by the current seller-side negotiation facts. */
export type SellerPlayerDesire = "content" | "open_to_move" | "wants_exit";

/** Stable factor codes that explain why asking price differs from public value. */
export type SellerReluctanceReason =
  | "short_contract"
  | "long_contract"
  | "important_player"
  | "surplus_player"
  | "thin_replacement_cover"
  | "critical_replacement_cover"
  | "seller_under_pressure"
  | "seller_must_sell"
  | "player_open_to_move"
  | "player_wants_exit";

/** Explicit inputs for one pure seller asking-price calculation. */
export interface DeriveSellerAskingPriceInput {
  readonly publicValue: Money;
  readonly remainingContractDays: number;
  readonly squadStatus: AgreedSquadStatus;
  readonly replacementNeed: SellerReplacementNeed;
  readonly sellerPressure: SellerFinancePressure;
  readonly playerDesire: SellerPlayerDesire;
  readonly config: AskingPriceCurvesConfig;
}

/** Auditable component multipliers used by the asking-price calculation. */
export interface SellerAskingPriceComponents {
  readonly contractBasisPoints: number;
  readonly squadStatusBasisPoints: number;
  readonly replacementNeedBasisPoints: number;
  readonly sellerPressureBasisPoints: number;
  readonly playerDesireBasisPoints: number;
  readonly finalMultiplierBasisPoints: number;
}

/** Deterministic seller price and structured explanation. */
export interface SellerAskingPrice {
  readonly publicValue: Money;
  readonly askingPrice: Money;
  readonly reasons: readonly SellerReluctanceReason[];
  readonly components: SellerAskingPriceComponents;
}

/**
 * Derives an immutable seller asking price from public value and supported
 * seller facts. All coefficients come from the explicitly supplied content
 * asset; the engine owns no fallback economy constants.
 */
export function deriveSellerAskingPrice(
  input: DeriveSellerAskingPriceInput,
): SellerAskingPrice {
  if (!Number.isInteger(input.publicValue) || input.publicValue <= 0) {
    throw new Error("Seller asking-price public value must be a positive integer");
  }
  if (!Number.isInteger(input.remainingContractDays) || input.remainingContractDays < 0) {
    throw new Error("Seller asking-price remaining contract days must be a non-negative integer");
  }

  const contractBasisPoints = contractMultiplier(
    input.remainingContractDays,
    input.config,
  );
  const squadStatusKey = askingSquadStatus(input.squadStatus);
  const factors = [
    contractBasisPoints,
    input.config.squadStatusMultipliers[squadStatusKey],
    input.config.replacementNeedMultipliers[input.replacementNeed],
    input.config.sellerPressureMultipliers[input.sellerPressure],
    input.config.playerDesireMultipliers[input.playerDesire],
  ] as const;
  const rawFinalMultiplier = multiplyBasisPointFactors(factors);
  const finalMultiplierBasisPoints = Math.max(
    input.config.finalMultiplierMinimumBasisPoints,
    Math.min(input.config.finalMultiplierMaximumBasisPoints, rawFinalMultiplier),
  );

  return {
    publicValue: input.publicValue,
    askingPrice: applyBasisPoints(input.publicValue, finalMultiplierBasisPoints),
    reasons: reluctanceReasons(input, contractBasisPoints),
    components: {
      contractBasisPoints,
      squadStatusBasisPoints: factors[1],
      replacementNeedBasisPoints: factors[2],
      sellerPressureBasisPoints: factors[3],
      playerDesireBasisPoints: factors[4],
      finalMultiplierBasisPoints,
    },
  };
}

/** Maps the richer contract vocabulary to the reviewed asking-price lanes. */
function askingSquadStatus(
  status: AgreedSquadStatus,
): keyof AskingPriceCurvesConfig["squadStatusMultipliers"] {
  switch (status) {
    case "key_player":
      return "key_player";
    case "regular_starter":
      return "starter";
    case "squad_player":
      return "rotation";
    case "prospect":
      return "prospect";
    case "fringe_player":
      return "surplus";
  }
}

/** Selects the first inclusive duration band, falling back to the final band. */
function contractMultiplier(
  remainingContractDays: number,
  config: AskingPriceCurvesConfig,
): number {
  const band = config.contractDaysRemaining.find(
    (candidate) => remainingContractDays <= candidate.maximumValueInclusive,
  ) ?? config.contractDaysRemaining.at(-1);
  if (band === undefined) {
    throw new Error("Seller asking-price contract bands must not be empty");
  }
  return band.multiplierBasisPoints;
}

/** Multiplies five basis-point factors without unsafe floating-point products. */
function multiplyBasisPointFactors(factors: readonly number[]): number {
  const denominator = 10_000n ** BigInt(factors.length - 1);
  const product = factors.reduce(
    (value, factor) => value * BigInt(factor),
    1n,
  );
  return Number((product + denominator / 2n) / denominator);
}

/** Applies one basis-point multiplier with deterministic nearest-unit rounding. */
function applyBasisPoints(value: Money, basisPoints: number): Money {
  const numerator = BigInt(value) * BigInt(basisPoints);
  return Number((numerator + 5_000n) / 10_000n) as Money;
}

/** Builds stable, non-localized reasons from the factors that actually differ. */
function reluctanceReasons(
  input: DeriveSellerAskingPriceInput,
  contractBasisPoints: number,
): readonly SellerReluctanceReason[] {
  const reasons: SellerReluctanceReason[] = [];
  if (contractBasisPoints < 10_000) reasons.push("short_contract");
  if (contractBasisPoints > 10_000) reasons.push("long_contract");
  if (input.squadStatus === "key_player" || input.squadStatus === "regular_starter") {
    reasons.push("important_player");
  }
  if (input.squadStatus === "fringe_player") reasons.push("surplus_player");
  if (input.replacementNeed === "thin") reasons.push("thin_replacement_cover");
  if (input.replacementNeed === "critical") reasons.push("critical_replacement_cover");
  if (input.sellerPressure === "strained") reasons.push("seller_under_pressure");
  if (input.sellerPressure === "must_sell") reasons.push("seller_must_sell");
  if (input.playerDesire === "open_to_move") reasons.push("player_open_to_move");
  if (input.playerDesire === "wants_exit") reasons.push("player_wants_exit");
  return reasons;
}
