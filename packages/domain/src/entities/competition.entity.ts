import type { ClubId, CompetitionId } from "../types/ids.ts";
import { nonNegativeMoney, type CurrencyCode, type Money } from "../value-objects/money.ts";

/** Prize paid by a competition for one final league position. */
export interface CompetitionSeasonDistributionPrize {
  readonly position: number;
  readonly amount: Money;
}

/** Ordered season-end prize distribution owned by one competition. */
export interface CompetitionSeasonDistribution {
  readonly currency: CurrencyCode;
  readonly prizes: readonly CompetitionSeasonDistributionPrize[];
}

/**
 * Regulation facts owned by one competition.
 *
 * A `null` substitution-window limit deliberately means that the competition
 * does not count windows. It is different from `0`, which would forbid every
 * substitution window.
 */
export interface CompetitionMatchRules {
  /** Maximum players each team may substitute during regulation time. */
  readonly maximumSubstitutions: number;
  /** Maximum substitution windows, or `null` when windows are not limited. */
  readonly substitutionWindowLimit: number | null;
  /** Whether a substituted player may return later in the same match. */
  readonly allowsPlayerReentry: boolean;
  /** Competition yellow-card total that triggers an automatic suspension. */
  readonly yellowCardAccumulationThreshold: number;
  /** Matches missed after a straight red card. */
  readonly straightRedSuspensionMatches: number;
  /** Matches missed after dismissal for a second yellow card. */
  readonly secondYellowSuspensionMatches: number;
  /** Matches missed after reaching the yellow-card threshold. */
  readonly yellowAccumulationSuspensionMatches: number;
}

/** Machine-readable competition rule validation failures. */
export type CompetitionMatchRulesErrorCode =
  | "invalid_maximum_substitutions"
  | "invalid_substitution_window_limit"
  | "invalid_yellow_card_threshold"
  | "invalid_suspension_length";

/** Typed error raised when competition content declares impossible rules. */
export class CompetitionMatchRulesError extends Error {
  /** Stable failure key for adapters and tests. */
  public readonly code: CompetitionMatchRulesErrorCode;

  /** Creates one competition-rule validation error. */
  public constructor(code: CompetitionMatchRulesErrorCode, message: string) {
    super(message);
    this.name = "CompetitionMatchRulesError";
    this.code = code;
  }
}

/**
 * Minimal competition contract for early season simulation.
 *
 * Country-specific rules, promotion formats, playoff details, and branding live
 * in content/config later. The domain only stores stable identity and explicit
 * participant order.
 */
export interface Competition {
  /** Stable namespaced identifier, for example `competition:ita-3`. */
  readonly id: CompetitionId;
  /** Display name supplied by content or test fixtures. */
  readonly name: string;
  /** Explicit ordered participant IDs. */
  readonly clubIds: readonly ClubId[];
  /** Regulation and discipline rules for matches in this competition. */
  readonly matchRules: CompetitionMatchRules;
  /** Optional season-end distribution; current generated leagues always provide it. */
  readonly seasonDistribution?: CompetitionSeasonDistribution;
}

/** Validates one ordered and complete league-position distribution. */
export function createCompetitionSeasonDistribution(
  input: CompetitionSeasonDistribution,
  participantCount: number,
): CompetitionSeasonDistribution {
  if (!Number.isSafeInteger(participantCount) || participantCount <= 0) {
    throw new Error(`Competition participant count must be positive: ${participantCount}`);
  }
  if (input.prizes.length !== participantCount) {
    throw new Error(`Competition distribution must cover ${participantCount} positions`);
  }
  return {
    currency: input.currency,
    prizes: input.prizes.map((prize, index) => {
      const expectedPosition = index + 1;
      if (prize.position !== expectedPosition) {
        throw new Error(`Competition distribution position must be ${expectedPosition}: ${prize.position}`);
      }
      return { position: prize.position, amount: nonNegativeMoney(prize.amount) };
    }),
  };
}

/**
 * Validates and copies competition-owned match rules.
 *
 * Manual pause limits are intentionally absent: pausing the presentation is a
 * manager-control rule, not a football regulation. Live command validation
 * therefore permits any number of pause/resume cycles.
 */
export function createCompetitionMatchRules(input: CompetitionMatchRules): CompetitionMatchRules {
  if (!Number.isSafeInteger(input.maximumSubstitutions) || input.maximumSubstitutions < 0) {
    throw new CompetitionMatchRulesError(
      "invalid_maximum_substitutions",
      `Maximum substitutions must be a non-negative safe integer: ${input.maximumSubstitutions}`,
    );
  }

  if (
    input.substitutionWindowLimit !== null
    && (!Number.isSafeInteger(input.substitutionWindowLimit) || input.substitutionWindowLimit < 0)
  ) {
    throw new CompetitionMatchRulesError(
      "invalid_substitution_window_limit",
      `Substitution-window limit must be null or a non-negative safe integer: ${input.substitutionWindowLimit}`,
    );
  }

  if (
    !Number.isSafeInteger(input.yellowCardAccumulationThreshold)
    || input.yellowCardAccumulationThreshold <= 0
  ) {
    throw new CompetitionMatchRulesError(
      "invalid_yellow_card_threshold",
      `Yellow-card threshold must be a positive safe integer: ${input.yellowCardAccumulationThreshold}`,
    );
  }

  for (const [reason, matches] of [
    ["straight red", input.straightRedSuspensionMatches],
    ["second yellow", input.secondYellowSuspensionMatches],
    ["yellow accumulation", input.yellowAccumulationSuspensionMatches],
  ] as const) {
    if (!Number.isSafeInteger(matches) || matches <= 0) {
      throw new CompetitionMatchRulesError(
        "invalid_suspension_length",
        `${reason} suspension must be a positive safe integer: ${matches}`,
      );
    }
  }

  return { ...input };
}
