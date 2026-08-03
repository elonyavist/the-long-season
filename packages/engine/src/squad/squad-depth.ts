import type { Club, PlayerId } from "@game/domain";

/**
 * The one named accessor for "who can this club field".
 *
 * `Club.playerIds` is stored ownership. Ownership and fieldability are the same
 * thing today, and this accessor exists precisely because they will stop being
 * the same thing: Phase 82A introduces loans, where a player is fielded by a
 * club that does not own his contract and is unavailable to the club that does.
 *
 * Routing every lineup-composing path through one accessor now makes that a
 * single-definition change later. Reading `club.playerIds` directly in such a
 * path is a defect, because it hard-codes "owned" into a question that is
 * really "selectable".
 *
 * This is deliberately not an abstraction over loans yet. It returns the club's
 * fieldable players under today's rules and nothing more; pre-building the
 * registration split here would ship an unused indirection.
 */
export function fieldablePlayerIds(club: Club): readonly PlayerId[] {
  return club.playerIds;
}

/**
 * Same accessor for a club that may be absent from the lookup.
 *
 * Match, AI, and background paths reach clubs through a record and must not
 * each invent their own fallback for a missing one.
 *
 * @example
 * const squad = fieldablePlayerIdsFor(gameState.clubs[clubId]);
 */
export function fieldablePlayerIdsFor(club: Club | undefined): readonly PlayerId[] {
  return club === undefined ? [] : fieldablePlayerIds(club);
}
