import type { MatchEventSide, PlayerId } from "@game/domain";

import type { MatchContext, MatchPlayerIncidentProfile, MatchTeamContext } from "./match-context.ts";
import type { LineupSlot } from "./team-strength.ts";

/**
 * Removes a forced-off player while preserving a playable goalkeeper role.
 *
 * Interactive callers may replace the player at the incident pause. Batch
 * simulations have no bench decision, so a forced-off goalkeeper promotes the
 * strongest remaining emergency option by real goalkeeper attributes.
 */
export function removeForcedOffPlayerFromMatchContext(
  context: MatchContext,
  side: MatchEventSide,
  playerId: PlayerId,
): MatchContext {
  const team = side === "home" ? context.home : context.away;
  const removedSlot = team.lineup.find((slot) => slot.playerId === playerId);
  if (removedSlot === undefined) return context;

  const remainingLineup = team.lineup.filter((slot) => slot.playerId !== playerId);
  const lineup = removedSlot.canonicalRole === "goalkeeper"
    ? promoteEmergencyGoalkeeper(remainingLineup, team.incidentProfiles)
    : remainingLineup;
  const updatedTeam: MatchTeamContext = {
    ...team,
    lineup,
    ...(team.incidentProfiles === undefined
      ? {}
      : { incidentProfiles: team.incidentProfiles.filter((profile) => profile.playerId !== playerId) }),
  };

  return side === "home" ? { ...context, home: updatedTeam } : { ...context, away: updatedTeam };
}

function promoteEmergencyGoalkeeper(
  lineup: readonly LineupSlot[],
  incidentProfiles: readonly MatchPlayerIncidentProfile[] | undefined,
): readonly LineupSlot[] {
  const profileByPlayer = new Map(incidentProfiles?.map((profile) => [profile.playerId, profile]) ?? []);
  const emergencyGoalkeeper = [...lineup].sort((left, right) => {
    const abilityDifference = emergencyGoalkeeperScore(profileByPlayer.get(right.playerId))
      - emergencyGoalkeeperScore(profileByPlayer.get(left.playerId));
    return abilityDifference !== 0 ? abilityDifference : left.slotId.localeCompare(right.slotId);
  })[0];
  if (emergencyGoalkeeper === undefined) return lineup;

  return lineup.map((slot) => slot.playerId === emergencyGoalkeeper.playerId
    ? { ...slot, canonicalRole: "goalkeeper" as const }
    : slot);
}

function emergencyGoalkeeperScore(profile: MatchPlayerIncidentProfile | undefined): number {
  return profile === undefined ? 0 : profile.goalkeeperReflexes + profile.goalkeeperHandling;
}
