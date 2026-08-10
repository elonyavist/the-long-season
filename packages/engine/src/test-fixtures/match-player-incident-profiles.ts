import type { PlayerId } from "@game/domain";

import type { MatchPlayerIncidentProfile, MatchTeamContext } from "../match-engine/match-context.ts";
import type { LineupSlot } from "../match-engine/team-strength.ts";

/**
 * Attributes for a fixture that deliberately does not distinguish its players.
 *
 * Every value here is exactly what `incidentProfileFor` used to invent when a
 * context carried no attributes at all. That is the whole point of the number
 * choice: a test written before Step 07A was already running on these, so
 * writing them down changes no outcome anywhere - it only moves the fact from
 * an invisible fallback into the fixture that depends on it.
 *
 * Use this when the case under test is about something other than who the
 * players are: stepping, scheduling, telemetry, tactic contracts. When the case
 * *is* about a player being better than another, spread the attributes
 * explicitly instead, or the test will pass without measuring anything.
 */
export const NEUTRAL_INCIDENT_ATTRIBUTES = {
  finishing: 10,
  passing: 10,
  crossing: 10,
  dribbling: 10,
  technique: 10,
  tackling: 10,
  freeKicks: 10,
  pace: 10,
  heading: 10,
  vision: 10,
  anticipation: 10,
  composure: 10,
  determination: 10,
  stamina: 10,
  agility: 10,
  strength: 10,
  penalties: 10,
  goalkeeperReflexes: 10,
  goalkeeperHandling: 10,
  startingFitness: 100,
} as const satisfies Omit<MatchPlayerIncidentProfile, "playerId">;

/**
 * Builds one neutral profile per lineup slot, in lineup order.
 *
 * A match context must carry attributes for every player it fields, so this
 * walks the lineup rather than taking a player list: a fixture cannot then
 * drift into covering ten of its eleven.
 *
 * @example
 * const team = { clubId, lineup, strength, shape, tacticalDistribution,
 *   incidentProfiles: neutralIncidentProfilesFor(lineup) };
 */
export function neutralIncidentProfilesFor(
  lineup: readonly LineupSlot[],
): readonly MatchPlayerIncidentProfile[] {
  return lineup.map((slot) => neutralIncidentProfile(slot.playerId));
}

/**
 * Builds one neutral profile for an explicit player.
 *
 * @example
 * const profile = neutralIncidentProfile(playerId("player:home-gk"));
 */
export function neutralIncidentProfile(player: PlayerId): MatchPlayerIncidentProfile {
  return { playerId: player, ...NEUTRAL_INCIDENT_ATTRIBUTES };
}

/**
 * Completes a team fixture whose case does not depend on who its players are.
 *
 * Wrapping the literal keeps the fixture readable - the lineup is still written
 * once, where it was - and reads as the statement it is: *this test does not
 * distinguish these eleven*. A case that means to distinguish them builds its
 * own profiles and does not come through here.
 *
 * @example
 * function validTeam(side: MatchSide): MatchTeamContext {
 *   return withNeutralIncidentProfiles({ clubId, lineup, strength, shape, tacticalDistribution });
 * }
 */
export function withNeutralIncidentProfiles(
  team: Omit<MatchTeamContext, "incidentProfiles">,
): MatchTeamContext {
  return { ...team, incidentProfiles: neutralIncidentProfilesFor(team.lineup) };
}
