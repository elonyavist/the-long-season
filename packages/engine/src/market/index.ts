/**
 * Public surface for deterministic market MVP rules.
 *
 * Market modules stay pure and depend only on domain data. CLI and future UI
 * layers are responsible for localization and presentation.
 */
export {
  PlayerValuationError,
  derivePlayerMarketAbility,
  derivePlayerValuation,
  type DerivePlayerValuationInput,
  type PlayerMarketAbility,
  type PlayerValuation,
  type PlayerValuationConfig,
  type PlayerValuationComponents,
  type PlayerValuationErrorCode,
  type PlayerValuationMarketContext,
} from "./player-valuation.ts";
export {
  deriveSellerAskingPrice,
  type DeriveSellerAskingPriceInput,
  type SellerAskingPrice,
  type SellerAskingPriceComponents,
  type SellerFinancePressure,
  type SellerPlayerDesire,
  type SellerReluctanceReason,
  type SellerReplacementNeed,
} from "./seller-asking-price.ts";
export {
  derivePlayerWillingness,
  type DerivePlayerWillingnessInput,
  type PlayerWillingness,
  type PlayerWillingnessReason,
  type PlayerWillingnessReasonCode,
} from "./player-willingness.ts";
export {
  evaluatePermanentTransfer,
  type EvaluatePermanentTransferInput,
  type PermanentTransferFeasibility,
} from "./transfer-feasibility.ts";
export {
  evaluateMarketActionEligibility,
  PRELIMINARY_AGREEMENT_MAX_REMAINING_DAYS,
  type MarketActionEligibility,
  type MarketActionEligibilityInput,
  type MarketActionKind,
  type MarketEligibilityReasonCode,
} from "./market-eligibility.ts";
