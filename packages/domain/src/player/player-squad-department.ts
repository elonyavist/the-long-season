import type { Player, PlayerPosition, PlayerRole } from "../entities/player.entity.ts";

/** Broad senior-squad department used by roster lifecycle decisions. */
export type PlayerSquadDepartment = "goalkeeper" | "defender" | "midfielder" | "attacker";

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
    return DEPARTMENT_BY_ROLE[player.primaryRole];
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
      return "midfielder";
    case "rw":
    case "lw":
    case "st":
    default:
      return "attacker";
  }
}
