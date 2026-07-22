import type { CareerMatchPreparationPlayerOptionInput } from "@game/ui";

import { boardRoleFromCanonicalRole, TACTICAL_BOARD_ROLE_CODES } from "./tactical-board-roles";
import {
  suitFor,
  type TacticalBoardRoleSuitability,
  type TacticalBoardSuitabilityPlayer,
} from "./tactical-board-suitability";
import type { TacticalBoardCanonicalRole, TacticalBoardRoleCode } from "./tactical-board-types";

/** Board-ready player facts derived from the current match-preparation data. */
export interface TacticalBoardSquadPlayer extends TacticalBoardSuitabilityPlayer {
  readonly id: string;
  readonly number: number;
  readonly surname: string;
  readonly roleCode: TacticalBoardRoleCode;
  readonly fitness?: number;
  readonly formTrend: "up" | "flat" | "down";
  readonly suitabilityByRole: Readonly<Record<TacticalBoardRoleCode, TacticalBoardRoleSuitability>>;
  /** Current-fixture reason preventing this player from being newly selected. */
  readonly unavailabilityReason?: "injured" | "suspended";
}

const PRIMARY_ROLE_BY_POSITION_KEY: Readonly<Record<string, TacticalBoardCanonicalRole>> = {
  gk: "goalkeeper",
  rb: "right_full_back",
  rwb: "right_midfielder",
  cb: "center_back",
  lb: "left_full_back",
  lwb: "left_midfielder",
  dm: "defensive_midfielder",
  cm: "central_midfielder",
  rm: "right_midfielder",
  lm: "left_midfielder",
  wide: "right_midfielder",
  am: "attacking_midfielder",
  winger: "right_winger",
  rw: "right_winger",
  lw: "left_winger",
  st: "striker",
};

/** Converts match-preparation player options into shared tactical-board players. */
export function buildTacticalBoardSquadPlayers(
  players: readonly CareerMatchPreparationPlayerOptionInput[],
): readonly TacticalBoardSquadPlayer[] {
  return players.map((player, index) => buildTacticalBoardSquadPlayer(player, index + 1));
}

/** Converts one player option into the tactical-board player shape. */
export function buildTacticalBoardSquadPlayer(
  player: CareerMatchPreparationPlayerOptionInput,
  number: number,
): TacticalBoardSquadPlayer {
  const primaryRole = canonicalRoleForPlayerOption(player);
  const basePlayer = {
    id: player.playerId,
    playerId: player.playerId,
    name: player.name,
    number,
    surname: surnameFromDisplayName(player.name),
    roleKey: player.roleKey,
    roleCode: boardRoleFromCanonicalRole(primaryRole),
    primaryRole,
    altRoles: alternativeRolesForPlayerOption(player),
    formTrend: formTrendFromFitness(player.fitness),
    suitabilityByRole: {} as Readonly<Record<TacticalBoardRoleCode, TacticalBoardRoleSuitability>>,
    ...(player.positionKey === undefined ? {} : { positionKey: player.positionKey }),
    ...(player.fitness === undefined ? {} : { fitness: player.fitness }),
    ...(player.currentAbility === undefined ? {} : { currentAbility: player.currentAbility }),
    ...(player.unavailabilityReason === undefined
      ? {}
      : { unavailabilityReason: player.unavailabilityReason }),
  } satisfies TacticalBoardSquadPlayer;

  return {
    ...basePlayer,
    suitabilityByRole: Object.fromEntries(
      TACTICAL_BOARD_ROLE_CODES.map((role) => [role, suitFor(basePlayer, role)]),
    ) as Readonly<Record<TacticalBoardRoleCode, TacticalBoardRoleSuitability>>,
  };
}

/** Returns a compact surname suitable for player tokens. */
export function surnameFromDisplayName(name: string): string {
  const parts = name.trim().split(/\s+/);

  return parts[parts.length - 1] ?? name;
}

/** Maps current fitness into the token's simple visual form trend. */
export function formTrendFromFitness(fitness: number | undefined): "up" | "flat" | "down" {
  if (fitness === undefined || fitness >= 90) {
    return "up";
  }

  if (fitness >= 70) {
    return "flat";
  }

  return "down";
}

/**
 * Maps one player identity to the canonical role shared by Squad, Tactics,
 * and Matchday. Keeping this translation here prevents screen adapters from
 * inventing their own role fallbacks.
 */
export function canonicalRoleForPlayerOption(
  player: Pick<CareerMatchPreparationPlayerOptionInput, "positionKey" | "roleKey">,
): TacticalBoardCanonicalRole {
  const primaryRole = player.positionKey === undefined ? undefined : PRIMARY_ROLE_BY_POSITION_KEY[player.positionKey];

  if (primaryRole !== undefined) {
    return primaryRole;
  }

  if (player.roleKey === "goalkeeper") {
    return "goalkeeper";
  }

  if (player.roleKey === "defender") {
    return "center_back";
  }

  if (player.roleKey === "attacker") {
    return "striker";
  }

  return "central_midfielder";
}

function alternativeRolesForPlayerOption(
  player: CareerMatchPreparationPlayerOptionInput,
): readonly TacticalBoardCanonicalRole[] {
  const primaryRole = canonicalRoleForPlayerOption(player);
  const alternativesByPosition: Readonly<Record<string, readonly TacticalBoardCanonicalRole[]>> = {
    rb: ["right_midfielder", "center_back"],
    lb: ["left_midfielder", "center_back"],
    cb: ["defensive_midfielder"],
    dm: ["central_midfielder", "center_back"],
    cm: ["defensive_midfielder", "attacking_midfielder"],
    rm: ["right_winger", "central_midfielder"],
    lm: ["left_winger", "central_midfielder"],
    wide: ["right_winger", "left_winger", "central_midfielder"],
    am: ["central_midfielder", "right_winger", "left_winger"],
    winger: ["right_midfielder", "left_midfielder", "striker"],
    rw: ["right_midfielder", "attacking_midfielder"],
    lw: ["left_midfielder", "attacking_midfielder"],
    st: ["right_winger", "left_winger", "attacking_midfielder"],
  };

  return (player.positionKey === undefined ? [] : alternativesByPosition[player.positionKey] ?? []).filter(
    (role) => role !== primaryRole,
  );
}
