import { FORMATION_KEYS, type ClubId, type FormationKey } from "@game/domain";
import { deriveRng } from "@game/shared";

/**
 * Assigns one curated shape per club for a measurement run.
 *
 * `simulateSeason(...)` takes the formation as a caller input and holds it
 * still on purpose, so the batch report path has always fielded a single shape
 * for every club in every season. That makes the whole shape question
 * unmeasurable: a league where everybody plays `4-4-2` cannot show whether a
 * formation is worth anything. This module supplies the variation the report
 * path never had.
 *
 * It is a setup choice, not a selector. Nothing here reads a squad, an ability
 * or a table position, and that is the point rather than an omission: the
 * assignment is a function of `(worldSeed, clubId)` and nothing else, so no
 * shape can inherit the strength of the clubs that happen to field it. That
 * guarantee is structural - it is visible in the signature - which is worth
 * more than a correlation test over any one population.
 *
 * Whether AI clubs should *choose* their shape on this path, as they do in
 * career play, is a real question and a different one. Step 14 owns it.
 */

/** RNG stream name that derives a club's shape for a measurement run. */
export const FORMATION_ASSIGNMENT_STREAM = "season-recap-formation";

/** Input for one world's per-club shape assignment. */
export interface AssignFormationsByClubInput {
  /** World seed the run was started from. */
  readonly worldSeed: string;
  /** Clubs to assign, in any order. */
  readonly clubIds: readonly ClubId[];
}

/**
 * Derives the shape one club fields for a whole measurement run.
 *
 * Keyed by club rather than by season so a club keeps its shape across the
 * seasons of a world. A shape that changed every season would average away the
 * only thing the fourth chart is for - what the clubs playing it actually won.
 *
 * @example
 * formationForClub("phase81-world-1", "club:alpha" as ClubId);
 */
export function formationForClub(worldSeed: string, clubId: ClubId): FormationKey {
  return deriveRng(worldSeed, FORMATION_ASSIGNMENT_STREAM, clubId).pick(FORMATION_KEYS);
}

/**
 * Assigns every club in one world a shape from the curated catalog.
 *
 * The result is the `formationByClubId` map the season recap takes as input,
 * and the same map the season simulator is handed, so the chart reports the
 * shape that was actually fielded rather than one inferred afterwards.
 *
 * @example
 * assignFormationsByClub({ worldSeed: "phase81-world-1", clubIds });
 */
export function assignFormationsByClub(
  input: AssignFormationsByClubInput,
): Readonly<Record<ClubId, FormationKey>> {
  const assigned: Partial<Record<ClubId, FormationKey>> = {};

  for (const clubId of input.clubIds) {
    assigned[clubId] = formationForClub(input.worldSeed, clubId);
  }

  return assigned as Readonly<Record<ClubId, FormationKey>>;
}
