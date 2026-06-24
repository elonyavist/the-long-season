import {
  playerPositionFitTierForPositionKey,
  type WebPlayerPositionFitTier,
  type WebPlayerPositionOption,
} from "../../shared/lib/player-position-ordering";
import type { TacticalBoardCanonicalRole, TacticalBoardRoleCode } from "./tactical-board-types";

/** Suitability levels used by board token borders and assignment menus. */
export type TacticalBoardRoleSuitability =
  | "natural"
  | "accomplished"
  | "competent"
  | "unconvincing"
  | "makeshift";

/** Minimal player shape required to derive role suitability. */
export interface TacticalBoardSuitabilityPlayer extends WebPlayerPositionOption {
  readonly primaryRole: TacticalBoardCanonicalRole;
  readonly altRoles: readonly TacticalBoardCanonicalRole[];
}

/** Minimal candidate shape needed to rank assignment choices for one board slot. */
export interface TacticalBoardAssignmentCandidate {
  readonly playerId: string;
  readonly name?: string;
  readonly surname?: string;
  readonly currentAbility?: number;
  readonly suitabilityBySlotId?: Readonly<Record<string, TacticalBoardRoleSuitability>>;
  readonly suitabilityByRole?: Partial<Record<TacticalBoardRoleCode, TacticalBoardRoleSuitability>>;
  readonly fitness?: number;
}

const POSITION_KEY_BY_BOARD_ROLE: Readonly<Record<TacticalBoardRoleCode, string>> = {
  POR: "gk",
  TD: "rb",
  DC: "cb",
  TS: "lb",
  MED: "dm",
  CC: "cm",
  ED: "rm",
  ES: "lm",
  TRQ: "am",
  AD: "rw",
  AS: "lw",
  ATT: "st",
};

const SUITABILITY_BY_FIT_TIER: Readonly<Record<WebPlayerPositionFitTier, TacticalBoardRoleSuitability>> = {
  0: "natural",
  1: "accomplished",
  2: "competent",
  3: "unconvincing",
  4: "makeshift",
};

const ASSIGNMENT_RANK_BY_SUITABILITY: Readonly<Record<TacticalBoardRoleSuitability, number>> = {
  natural: 0,
  accomplished: 1,
  competent: 2,
  unconvincing: 3,
  makeshift: 4,
};

/** Returns the position key represented by one compact tactical-board role code. */
export function positionKeyForTacticalBoardRole(role: TacticalBoardRoleCode): string {
  return POSITION_KEY_BY_BOARD_ROLE[role];
}

/**
 * Derives a player's suitability for a board role from current game facts.
 *
 * The result is not stored as player state. It is recalculated from the current
 * position/familiarity model so the same player can look natural in one role
 * and makeshift in another role after a manager role change.
 */
export function suitFor(
  player: TacticalBoardSuitabilityPlayer,
  role: TacticalBoardRoleCode,
): TacticalBoardRoleSuitability {
  const fitTier = playerPositionFitTierForPositionKey(POSITION_KEY_BY_BOARD_ROLE[role], player);

  return SUITABILITY_BY_FIT_TIER[fitTier];
}

/** Returns the currently known board suitability for one candidate and role. */
export function suitabilityForTacticalBoardAssignment(
  player: TacticalBoardAssignmentCandidate,
  role: TacticalBoardRoleCode,
  slotId: string,
): TacticalBoardRoleSuitability {
  return player.suitabilityByRole?.[role] ?? player.suitabilityBySlotId?.[slotId] ?? "competent";
}

/**
 * Orders player assignment candidates by football usefulness for a target role.
 *
 * The manager still chooses manually. The ordering only makes the most sensible
 * candidates appear first: role suitability, current ability, fitness, and a
 * stable identity fallback.
 */
export function sortTacticalBoardAssignmentCandidates<TPlayer extends TacticalBoardAssignmentCandidate>(
  players: readonly TPlayer[],
  role: TacticalBoardRoleCode,
  slotId: string,
): readonly TPlayer[] {
  return [...players].sort((left, right) => compareTacticalBoardAssignmentCandidates(left, right, role, slotId));
}

/** Compares two assignment candidates for deterministic slot-specific sorting. */
export function compareTacticalBoardAssignmentCandidates(
  left: TacticalBoardAssignmentCandidate,
  right: TacticalBoardAssignmentCandidate,
  role: TacticalBoardRoleCode,
  slotId: string,
): number {
  const leftSuitability = suitabilityForTacticalBoardAssignment(left, role, slotId);
  const rightSuitability = suitabilityForTacticalBoardAssignment(right, role, slotId);
  const suitabilityDelta =
    ASSIGNMENT_RANK_BY_SUITABILITY[leftSuitability] - ASSIGNMENT_RANK_BY_SUITABILITY[rightSuitability];

  if (suitabilityDelta !== 0) {
    return suitabilityDelta;
  }

  const abilityDelta = (right.currentAbility ?? Number.NEGATIVE_INFINITY) - (left.currentAbility ?? Number.NEGATIVE_INFINITY);
  if (abilityDelta !== 0) {
    return abilityDelta;
  }

  const fitnessDelta = (right.fitness ?? Number.NEGATIVE_INFINITY) - (left.fitness ?? Number.NEGATIVE_INFINITY);
  if (fitnessDelta !== 0) {
    return fitnessDelta;
  }

  return candidateStableName(left).localeCompare(candidateStableName(right));
}

function candidateStableName(player: TacticalBoardAssignmentCandidate): string {
  return (player.name ?? player.surname ?? player.playerId).toLocaleLowerCase("en");
}
