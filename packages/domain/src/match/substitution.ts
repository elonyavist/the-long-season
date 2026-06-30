import type { MatchEventSide } from "../entities/match-event.entity.ts";
import type { PlayerId } from "../types/ids.ts";

/** Conservative v1 regulation-time substitution limit until competition rules own this. */
export const DEFAULT_REGULATION_SUBSTITUTION_LIMIT = 5;

/** Stable reason key for a manager-declared half-time substitution. */
export type MatchSubstitutionReasonKey = "half_time_manager_decision";

/**
 * Manager-declared substitution decision.
 *
 * The engine validates this data; it does not choose substitutions for the
 * selected club automatically.
 */
export interface MatchSubstitutionDecision {
  /** Player currently on the pitch who should leave. */
  readonly outgoingPlayerId: PlayerId;
  /** Bench player who should enter. */
  readonly incomingPlayerId: PlayerId;
  /** Stable reason key for later presentation. */
  readonly reasonKey: MatchSubstitutionReasonKey;
}

/**
 * Structured fact emitted after a substitution decision is accepted.
 */
export interface AppliedMatchSubstitution {
  /** Side that applied the substitution. */
  readonly side: MatchEventSide;
  /** Simulated minute of the substitution. */
  readonly minute: number;
  /** Player who left the pitch. */
  readonly outgoingPlayerId: PlayerId;
  /** Player who entered the pitch. */
  readonly incomingPlayerId: PlayerId;
  /** Slot that kept its tactical role while changing player. */
  readonly slotId: string;
  /** Stable reason key for later presentation. */
  readonly reasonKey: MatchSubstitutionReasonKey;
}
