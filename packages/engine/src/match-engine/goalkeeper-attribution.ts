import type { PlayerId } from "@game/domain";

import type { MatchTeamContext } from "./match-context.ts";

/**
 * Engine-local deterministic goalkeeper attribution for already-saved shots.
 *
 * The aggregate resolver still decides whether a shot is saved. This module
 * only identifies the defending goalkeeper who receives the save credit.
 */

/**
 * Input needed to attribute one saved shot to a goalkeeper.
 */
export interface AttributeGoalkeeperSaveInput {
  /** Team context for the defending side. */
  readonly defendingTeam: MatchTeamContext;
}

/**
 * Result of deterministic goalkeeper save attribution.
 */
export interface GoalkeeperSaveAttribution {
  /** Goalkeeper from the defending lineup credited with the save. */
  readonly goalkeeperPlayerId: PlayerId;
}

/**
 * Chooses the goalkeeper from the defending team's explicit lineup.
 *
 * @example
 * const attribution = attributeGoalkeeperSave({ defendingTeam: context.away });
 */
export function attributeGoalkeeperSave(input: AttributeGoalkeeperSaveInput): GoalkeeperSaveAttribution {
  for (const slot of input.defendingTeam.lineup) {
    if (slot.roleKey === "gk") {
      return {
        goalkeeperPlayerId: slot.playerId,
      };
    }
  }

  throw new Error(`Cannot attribute save for ${input.defendingTeam.clubId} without a goalkeeper slot`);
}
