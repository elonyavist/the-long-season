import type { MatchEventSide, PlayerId } from "@game/domain";

import type { MatchContext, MatchPlayerIncidentProfile, MatchTeamContext } from "./match-context.ts";
import type { LineupSlot, TeamStrength } from "./team-strength.ts";

/**
 * Removes a forced-off player while preserving a playable goalkeeper role.
 *
 * Interactive callers may replace the player at the incident pause. Batch
 * simulations have no bench decision, so a forced-off goalkeeper promotes the
 * strongest remaining emergency option by real goalkeeper attributes - and the
 * goalkeeper department is corrected to describe the man who is now in the
 * shirt, which is what makes losing a keeper cost something.
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
  const isGoalkeeperExit = removedSlot.canonicalRole === "goalkeeper";
  const lineup = isGoalkeeperExit
    ? promoteEmergencyGoalkeeper(remainingLineup, team.incidentProfiles)
    : remainingLineup;
  const updatedTeam: MatchTeamContext = {
    ...team,
    lineup,
    incidentProfiles: team.incidentProfiles.filter((profile) => profile.playerId !== playerId),
    ...(isGoalkeeperExit
      ? { strength: strengthAfterGoalkeeperExit(team, playerId, lineup) }
      : {}),
  };

  return side === "home" ? { ...context, home: updatedTeam } : { ...context, away: updatedTeam };
}

/**
 * Corrects the goalkeeper department after an outfield player takes the gloves.
 *
 * `strength` was derived once, before kickoff, from the specialist who has just
 * left the pitch, and this module cannot re-derive it: `MatchTeamContext` holds
 * no `players` and no `roleWeights`, so reaching `deriveTeamShapeAndStrength`
 * from here would drag content into the minute loop. Until Step 07A that meant
 * nothing was done at all, and a centre-back in goal saved like an
 * international - a red card to the goalkeeper cost a manager literally nothing.
 *
 * What this module does have is the same attribute, off the same accessor, for
 * both keepers. That is a ratio it can take honestly: the department falls by
 * exactly as much as the man in goal is worse at goalkeeping than the man it was
 * measured from. An equal replacement changes nothing, and the floor stops an
 * outfield player with no goalkeeping at all from taking the department to zero,
 * because a body in the goal is still worth more than an empty net.
 */
function strengthAfterGoalkeeperExit(
  team: MatchTeamContext,
  removedPlayerId: PlayerId,
  lineup: readonly LineupSlot[],
): TeamStrength {
  const outgoing = goalkeepingAbility(profileFor(team.incidentProfiles, removedPlayerId));
  const promotedSlot = lineup.find((slot) => slot.canonicalRole === "goalkeeper");
  const incoming = promotedSlot === undefined
    ? 0
    : goalkeepingAbility(profileFor(team.incidentProfiles, promotedSlot.playerId));

  if (outgoing <= 0 || incoming >= outgoing) {
    return team.strength;
  }

  const retained = Math.max(incoming / outgoing, MIN_EMERGENCY_GOALKEEPER_SHARE);

  return { ...team.strength, goalkeeper: team.strength.goalkeeper * retained };
}

/** Reads one player's goalkeeping from the two attributes the context carries. */
function goalkeepingAbility(profile: MatchPlayerIncidentProfile | undefined): number {
  return profile === undefined ? 0 : (profile.goalkeeperReflexes + profile.goalkeeperHandling) / 2;
}

/** Finds one profile, tolerating a player the context never carried. */
function profileFor(
  profiles: readonly MatchPlayerIncidentProfile[],
  playerId: PlayerId,
): MatchPlayerIncidentProfile | undefined {
  return profiles.find((profile) => profile.playerId === playerId);
}

function promoteEmergencyGoalkeeper(
  lineup: readonly LineupSlot[],
  incidentProfiles: readonly MatchPlayerIncidentProfile[],
): readonly LineupSlot[] {
  const profileByPlayer = new Map(incidentProfiles.map((profile) => [profile.playerId, profile]));
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

/**
 * Least of the goalkeeper department an emergency keeper keeps.
 *
 * A statement about the sport rather than a coefficient: an outfield player in
 * goal is far worse than a specialist and is still not an empty net. He stands
 * in the right place, and shots hit him.
 */
const MIN_EMERGENCY_GOALKEEPER_SHARE = 0.35;
