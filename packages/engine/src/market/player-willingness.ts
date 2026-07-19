import type { Club, ClubCategory, GameDate, Player } from "@game/domain";

import { derivePlayerMarketAbility } from "./player-valuation.ts";

/** Stable machine codes explaining a player willingness rejection. */
export type PlayerWillingnessReasonCode =
  | "sporting_level_too_low"
  | "reputation_drop_too_large"
  | "prime_player_downward_move";

/** One structured player willingness reason. */
export interface PlayerWillingnessReason {
  /** Stable language-agnostic reason code. */
  readonly code: PlayerWillingnessReasonCode;
  /** Numeric category gap from selling club to buying club. */
  readonly categoryDrop: number;
  /** Numeric reputation gap from selling club to buying club. */
  readonly reputationDrop: number;
}

/** Deterministic output of the player willingness model. */
export interface PlayerWillingness {
  /** Final willingness status. */
  readonly status: "accepted" | "rejected";
  /** Empty when accepted; populated when rejected. */
  readonly reasons: readonly PlayerWillingnessReason[];
  /** Player age in whole years at the current date. */
  readonly age: number;
  /** Role current ability used by the model; the name is retained for API compatibility. */
  readonly currentAbilityAverage: number;
  /** Numeric category gap from current club to destination club. */
  readonly categoryDrop: number;
  /** Numeric reputation gap from current club to destination club. */
  readonly reputationDrop: number;
}

/** Inputs needed to derive one player willingness result. */
export interface DerivePlayerWillingnessInput {
  /** Player being asked to move. */
  readonly player: Player;
  /** Current club. */
  readonly sellingClub: Club;
  /** Destination club. */
  readonly buyingClub: Club;
  /** Current game date used to derive age. */
  readonly currentDate: GameDate;
}

/**
 * Derives deterministic player willingness for a permanent move.
 *
 * This MVP checks only sporting level, club reputation, age, and current true
 * ability. User-facing wording belongs to CLI/UI localization.
 */
export function derivePlayerWillingness(input: DerivePlayerWillingnessInput): PlayerWillingness {
  const age = deriveAge(input.player.birthDate, input.currentDate);
  const currentAbilityAverage = derivePlayerMarketAbility(input.player).currentAbility;
  const categoryDrop = categoryRank(input.sellingClub.category) - categoryRank(input.buyingClub.category);
  const reputationDrop = input.sellingClub.reputation - input.buyingClub.reputation;
  const reasons: PlayerWillingnessReason[] = [];

  if (categoryDrop >= 2 && currentAbilityAverage >= 11.5) {
    reasons.push(reason("sporting_level_too_low", categoryDrop, reputationDrop));
  }

  if (categoryDrop >= 1 && reputationDrop >= 4 && currentAbilityAverage >= 12) {
    reasons.push(reason("reputation_drop_too_large", categoryDrop, reputationDrop));
  }

  if (categoryDrop >= 1 && age >= 24 && age <= 30 && currentAbilityAverage >= 13) {
    reasons.push(reason("prime_player_downward_move", categoryDrop, reputationDrop));
  }

  return {
    status: reasons.length === 0 ? "accepted" : "rejected",
    reasons,
    age,
    currentAbilityAverage,
    categoryDrop,
    reputationDrop,
  };
}

function reason(
  code: PlayerWillingnessReasonCode,
  categoryDrop: number,
  reputationDrop: number,
): PlayerWillingnessReason {
  return {
    code,
    categoryDrop,
    reputationDrop,
  };
}

function categoryRank(category: ClubCategory): number {
  if (category === "first_division") return 3;
  if (category === "second_division") return 2;
  return 1;
}

function deriveAge(birthDate: GameDate, currentDate: GameDate): number {
  return Math.floor((currentDate - birthDate) / 365);
}
