import {
  getPlayerRoleProfile,
  roleCurrentAbility,
  rolePotentialAbility,
  type Player,
  type PlayerId,
} from "@game/domain";

/** Coarse public level of one player relative to his club's current squad. */
export type PublicClubPlayerLevel = "leading" | "first_team" | "squad" | "depth";

/** Public current and reachable level labels without hidden numeric ability. */
export interface PublicClubPlayerAssessment {
  readonly playerId: PlayerId;
  readonly currentLevel: PublicClubPlayerLevel;
  readonly potentialLevel: PublicClubPlayerLevel;
}

/** Stable failures raised when a public assessment cannot be derived safely. */
export type PublicClubPlayerAssessmentErrorCode = "duplicate_player" | "missing_role_identity";

/** Error raised instead of guessing missing player identity or roster order. */
export class PublicClubPlayerAssessmentError extends Error {
  public readonly code: PublicClubPlayerAssessmentErrorCode;

  public constructor(code: PublicClubPlayerAssessmentErrorCode, message: string) {
    super(message);
    this.name = "PublicClubPlayerAssessmentError";
    this.code = code;
  }
}

interface InternalAssessment {
  readonly playerId: PlayerId;
  readonly currentAbility: number;
  readonly potentialAbility: number;
}

interface ClubLevelThresholds {
  readonly leading: number;
  readonly firstTeam: number;
  readonly squad: number;
}

/**
 * Derives public club-relative level labels from canonical role ability.
 *
 * Potential is compared with the current squad standard rather than with the
 * squad's hidden potential distribution. This makes "leading potential" mean
 * that the player could reach today's leading-player level at this club.
 */
export function derivePublicClubPlayerAssessments(
  players: readonly Player[],
): readonly PublicClubPlayerAssessment[] {
  if (players.length === 0) return [];

  const seenPlayerIds = new Set<PlayerId>();
  const internal = players.map((player): InternalAssessment => {
    if (seenPlayerIds.has(player.id)) {
      throw new PublicClubPlayerAssessmentError("duplicate_player", `duplicate player in club assessment: ${player.id}`);
    }
    seenPlayerIds.add(player.id);

    if (player.primaryRole === undefined) {
      throw new PublicClubPlayerAssessmentError(
        "missing_role_identity",
        `player role identity is required for public assessment: ${player.id}`,
      );
    }

    const profile = getPlayerRoleProfile(player.primaryRole);
    return {
      playerId: player.id,
      currentAbility: Number(roleCurrentAbility(player.abilities, profile)),
      potentialAbility: Number(rolePotentialAbility(player.potential, profile)),
    };
  });

  const thresholds = deriveClubLevelThresholds(internal.map((assessment) => assessment.currentAbility));
  return internal.map((assessment) => ({
    playerId: assessment.playerId,
    currentLevel: classifyLevel(assessment.currentAbility, thresholds),
    potentialLevel: classifyLevel(assessment.potentialAbility, thresholds),
  }));
}

function deriveClubLevelThresholds(currentAbilities: readonly number[]): ClubLevelThresholds {
  const descending = [...currentAbilities].sort((left, right) => right - left);
  return {
    leading: percentileThreshold(descending, 0.15),
    firstTeam: percentileThreshold(descending, 0.5),
    squad: percentileThreshold(descending, 0.85),
  };
}

function percentileThreshold(descending: readonly number[], share: number): number {
  const index = Math.max(0, Math.ceil(descending.length * share) - 1);
  return descending[index] ?? 0;
}

function classifyLevel(ability: number, thresholds: ClubLevelThresholds): PublicClubPlayerLevel {
  if (ability >= thresholds.leading) return "leading";
  if (ability >= thresholds.firstTeam) return "first_team";
  if (ability >= thresholds.squad) return "squad";
  return "depth";
}
