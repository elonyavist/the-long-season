import { createPlayerRoleIdentity, type PlayerArchetype, type PlayerPosition, type PlayerRole, type PlayerRoleIdentity } from "@game/domain";

/**
 * Maps an existing tactical position to the Phase 33 primary role identity.
 *
 * This keeps old position-based generation compatible while giving new players
 * explicit role identity for future generation, reports, and development caps.
 */
export function primaryRoleForPosition(position: PlayerPosition): PlayerRole {
  switch (position) {
    case "gk":
      return "goalkeeper";
    case "cb":
      return "center_back";
    case "rb":
    case "lb":
      return "full_back";
    case "rwb":
    case "lwb":
      return "wing_back";
    case "dm":
      return "defensive_midfielder";
    case "cm":
      return "central_midfielder";
    case "am":
      return "attacking_midfielder";
    case "rw":
    case "lw":
      return "winger";
    case "st":
      return "striker";
  }
}

/**
 * Builds the v1 role identity for a generated player position.
 */
export function generatedRoleIdentityForPosition(position: PlayerPosition): PlayerRoleIdentity {
  const primaryRole = primaryRoleForPosition(position);

  return createPlayerRoleIdentity({
    primaryRole,
    archetype: defaultArchetypeForRole(primaryRole),
    naturalRoles: [primaryRole],
    adaptedRoles: adaptedRolesForPrimaryRole(primaryRole),
    weakRoles: weakRolesForPrimaryRole(primaryRole),
  });
}

function defaultArchetypeForRole(role: PlayerRole): PlayerArchetype {
  switch (role) {
    case "goalkeeper":
      return "goalkeeper_shot_stopper";
    case "center_back":
      return "center_back_stopper";
    case "full_back":
      return "full_back_defensive";
    case "wing_back":
      return "wing_back_runner";
    case "defensive_midfielder":
      return "defensive_midfielder_ball_winner";
    case "central_midfielder":
      return "central_midfielder_box_to_box";
    case "attacking_midfielder":
      return "attacking_midfielder_creator";
    case "wide_midfielder":
      return "wide_midfielder_balanced";
    case "winger":
      return "winger_creator";
    case "striker":
      return "striker_poacher";
  }
}

function adaptedRolesForPrimaryRole(role: PlayerRole): readonly PlayerRole[] {
  switch (role) {
    case "goalkeeper":
      return [];
    case "center_back":
      return ["defensive_midfielder"];
    case "full_back":
      return ["wing_back", "wide_midfielder"];
    case "wing_back":
      return ["full_back", "wide_midfielder", "winger"];
    case "defensive_midfielder":
      return ["central_midfielder", "center_back"];
    case "central_midfielder":
      return ["defensive_midfielder", "attacking_midfielder"];
    case "attacking_midfielder":
      return ["central_midfielder"];
    case "wide_midfielder":
      return ["wing_back", "winger", "full_back"];
    case "winger":
      return ["wide_midfielder", "attacking_midfielder"];
    case "striker":
      return ["attacking_midfielder"];
  }
}

function weakRolesForPrimaryRole(role: PlayerRole): readonly PlayerRole[] {
  switch (role) {
    case "goalkeeper":
      return [];
    case "center_back":
      return ["full_back", "wing_back"];
    case "full_back":
      return ["center_back", "winger"];
    case "wing_back":
      return ["center_back"];
    case "defensive_midfielder":
      return ["attacking_midfielder"];
    case "central_midfielder":
      return ["wide_midfielder"];
    case "attacking_midfielder":
      return ["winger", "striker"];
    case "wide_midfielder":
      return ["central_midfielder"];
    case "winger":
      return ["wing_back", "striker"];
    case "striker":
      return ["winger"];
  }
}
