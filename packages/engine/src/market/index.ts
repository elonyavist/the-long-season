/**
 * Public surface for deterministic market MVP rules.
 *
 * Market modules stay pure and depend only on domain data. CLI and future UI
 * layers are responsible for localization and presentation.
 */
export {
  DEFAULT_PLAYER_VALUATION_CONFIG,
  PlayerValuationError,
  derivePlayerMarketAbility,
  derivePlayerValuation,
  type DerivePlayerValuationInput,
  type PlayerMarketAbility,
  type PlayerValuation,
  type PlayerValuationAgeBand,
  type PlayerValuationConfig,
  type PlayerValuationErrorCode,
} from "./player-valuation.ts";
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
