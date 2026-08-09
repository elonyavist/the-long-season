import type { Player, PlayerPosition, PlayerRole } from "../entities/player.entity.ts";

/** Broad senior-squad department used by roster lifecycle decisions. */
export type PlayerSquadDepartment = "goalkeeper" | "defender" | "midfielder" | "attacker";

/**
 * How deep each department must be for a squad to be a playable football club.
 *
 * Two sides of the project need this and neither may import the other. Career
 * lifecycle *enforces* it - `maintainCareerSquadShape(...)` signs players and
 * raises `weak_*_depth` when a club falls under. World generation must *clear*
 * it, or every club it builds is born asking for a signing on its first day,
 * which is exactly what the single pre-81A squad chart did: it held `3`
 * midfielders against the `6` below.
 *
 * It sits in domain because that is the only place both can read it from. When
 * it lived in the engine, content could only restate the numbers in a comment,
 * and a restated number is one that drifts silently.
 */
export const MINIMUM_CAREER_DEPARTMENT_DEPTH: Readonly<Record<PlayerSquadDepartment, number>> = {
  goalkeeper: 2,
  defender: 6,
  midfielder: 6,
  attacker: 3,
};

const DEPARTMENT_BY_ROLE: Readonly<Record<PlayerRole, PlayerSquadDepartment>> = {
  goalkeeper: "goalkeeper",
  center_back: "defender",
  full_back: "defender",
  wing_back: "defender",
  defensive_midfielder: "midfielder",
  central_midfielder: "midfielder",
  attacking_midfielder: "midfielder",
  wide_midfielder: "midfielder",
  winger: "attacker",
  striker: "attacker",
};

/**
 * Resolves the senior-squad department owned by one explicit player role.
 *
 * Generation uses this when distributing role tokens inside a required
 * academy department. Keeping the lookup here prevents content from copying
 * the same football classification used by contracts and squad maintenance.
 */
export function playerRoleSquadDepartment(
  role: PlayerRole,
): PlayerSquadDepartment {
  return DEPARTMENT_BY_ROLE[role];
}

/**
 * Resolves the football department that one player contributes to.
 *
 * Modern players use their explicit role identity. The position fallback keeps
 * older authored fixtures readable without making position the new source of
 * truth for contracts, transfers, or squad-depth checks.
 */
export function playerSquadDepartment(
  player: Pick<Player, "primaryRole" | "naturalPositions">,
): PlayerSquadDepartment {
  if (player.primaryRole !== undefined) {
    return playerRoleSquadDepartment(player.primaryRole);
  }

  return positionSquadDepartment(player.naturalPositions[0]);
}

function positionSquadDepartment(position: PlayerPosition | undefined): PlayerSquadDepartment {
  switch (position) {
    case "gk":
      return "goalkeeper";
    case "rb":
    case "cb":
    case "lb":
    case "rwb":
    case "lwb":
      return "defender";
    case "dm":
    case "cm":
    case "am":
    case "rm":
    case "lm":
      return "midfielder";
    case "rw":
    case "lw":
    case "st":
    default:
      return "attacker";
  }
}
