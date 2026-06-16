import type { ClubId, CompetitionId } from "../types/ids.ts";

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
}
