import {
  resolveTransferWindowStatus,
  type GameDate,
  type SeasonTransferWindows,
} from "@game/domain";

/**
 * Approximate days that count as "six contract months or less remaining".
 *
 * Uses the same 30.5-day month the Phase 78 contract-alert policy uses, so six
 * months resolves to 183 days. This is a market rule owned by the engine; it is
 * distinct from the squad-table contract-expiry alert policy in `@game/ui`.
 */
export const PRELIMINARY_AGREEMENT_MAX_REMAINING_DAYS = 183;

/**
 * One market action whose legality depends on the current date and rules.
 *
 * - `permanent_transfer_offer`, `permanent_transfer_completion`, and
 *   `external_free_agent_registration` are only legal inside an open window.
 * - `contract_renewal` and `market_inspection` are legal all year.
 * - `preliminary_agreement` is legal all year but only when the target has six
 *   contract months or less remaining.
 */
export type MarketActionKind =
  | "permanent_transfer_offer"
  | "permanent_transfer_completion"
  | "external_free_agent_registration"
  | "contract_renewal"
  | "preliminary_agreement"
  | "market_inspection";

/** Stable, language-agnostic reason a market action is currently blocked. */
export type MarketEligibilityReasonCode =
  | "outside_transfer_window"
  | "preliminary_agreement_not_yet_eligible";

/** Input for the single market-eligibility query. */
export interface MarketActionEligibilityInput {
  readonly action: MarketActionKind;
  /** Resolved windows for the competition/season the action belongs to. */
  readonly windows: SeasonTransferWindows;
  /** Current game date the action is evaluated against. */
  readonly asOf: GameDate;
  /**
   * Days left on the target's active contract. Required to evaluate a
   * `preliminary_agreement`; ignored for every other action.
   */
  readonly targetContractRemainingDays?: number;
}

/** Structured legality result with useful boundary dates. */
export type MarketActionEligibility =
  | {
      readonly status: "allowed";
      /** Active window close date for window-gated actions, when open. */
      readonly closesOn?: GameDate;
    }
  | {
      readonly status: "blocked";
      readonly reason: MarketEligibilityReasonCode;
      /** Next date the relevant window opens, when one lies ahead this season. */
      readonly nextOpensOn?: GameDate;
    };

/**
 * The single engine-owned answer for whether a market action is legal now.
 *
 * UI, AI, CLI, and storage must call this instead of comparing window dates
 * themselves. A disabled browser control is presentation only; the engine
 * command must independently reject the same invalid action by consulting this
 * query.
 *
 * @example
 * const eligibility = evaluateMarketActionEligibility({
 *   action: "permanent_transfer_offer",
 *   windows,
 *   asOf: currentDate,
 * });
 * if (eligibility.status === "blocked") { ... }
 */
export function evaluateMarketActionEligibility(
  input: MarketActionEligibilityInput,
): MarketActionEligibility {
  switch (input.action) {
    case "contract_renewal":
    case "market_inspection":
      return { status: "allowed" };
    case "preliminary_agreement":
      return evaluatePreliminaryAgreement(input.targetContractRemainingDays);
    case "permanent_transfer_offer":
    case "permanent_transfer_completion":
    case "external_free_agent_registration":
      return evaluateWindowGatedAction(input.windows, input.asOf);
  }
}

/** Allows a preliminary agreement only inside the final six contract months. */
function evaluatePreliminaryAgreement(
  targetContractRemainingDays: number | undefined,
): MarketActionEligibility {
  if (
    targetContractRemainingDays !== undefined
    && targetContractRemainingDays <= PRELIMINARY_AGREEMENT_MAX_REMAINING_DAYS
  ) {
    return { status: "allowed" };
  }
  return { status: "blocked", reason: "preliminary_agreement_not_yet_eligible" };
}

/** Allows a window-gated action only while a registration window is open. */
function evaluateWindowGatedAction(
  windows: SeasonTransferWindows,
  asOf: GameDate,
): MarketActionEligibility {
  const status = resolveTransferWindowStatus(windows, asOf);
  if (status.state === "open") {
    return { status: "allowed", closesOn: status.window.closesOn };
  }
  return status.nextOpensOn === undefined
    ? { status: "blocked", reason: "outside_transfer_window" }
    : { status: "blocked", reason: "outside_transfer_window", nextOpensOn: status.nextOpensOn };
}
