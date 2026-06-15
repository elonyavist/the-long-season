import type { ClubId, PlayerId } from "../types/ids.ts";

/**
 * Coarse competitive level for a club in the early simulation model.
 *
 * This is intentionally generic: real country-specific league rules and names
 * belong to content/config, not to the core domain entity.
 */
export type ClubCategory = "first_division" | "second_division" | "third_division";

/**
 * Stable club identity and roster ownership.
 *
 * `playerIds` is an explicit ordered array. Do not infer roster order from a
 * `Record<PlayerId, Player>` lookup, because object key enumeration is not a
 * safe source of simulation order.
 *
 * @example
 * const club: Club = {
 *   id: clubId("club:perugia"),
 *   name: "Perugia",
 *   shortName: "Perugia",
 *   category: "third_division",
 *   reputation: 6,
 *   playerIds: [playerId("player:000001")],
 * };
 */
export interface Club {
  /** Stable namespaced identifier, for example `club:perugia`. */
  readonly id: ClubId;
  /** Display name used by content and UI layers. */
  readonly name: string;
  /** Compact display name for tables and ticker-like outputs. */
  readonly shortName: string;
  /** Generic sporting tier; country-specific competition details live elsewhere. */
  readonly category: ClubCategory;
  /** Lightweight 0-based/low-scale reputation placeholder until board/world systems mature. */
  readonly reputation: number;
  /** Ordered roster IDs owned by this club. */
  readonly playerIds: readonly PlayerId[];
}
