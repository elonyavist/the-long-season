import type { PlayerPosition } from "../entities/player.entity.ts";
import type { FormationPositionFamily, FormationSlot } from "./formations.ts";

/** Suitability categories from best to worst. */
export type PositionSuitability = "natural" | "adapted" | "weak" | "invalid";

/** Minimal slot shape required by the suitability evaluator. */
export type PositionSuitabilitySlot = Pick<FormationSlot, "positionFamily">;

const SUITABILITY_SCORE: Readonly<Record<PositionSuitability, number>> = {
  invalid: 0,
  weak: 1,
  adapted: 2,
  natural: 3,
};

/**
 * Classifies how well a player's natural positions fit one formation slot.
 *
 * The function returns the best fit across the ordered natural-position list,
 * but it does not assign the player to the slot. Later reports can use this as
 * evidence while preserving the rule that the user chooses the lineup.
 *
 * @example
 * evaluatePositionSuitability(["lwb"], { positionFamily: "left_full_back" });
 * // => "adapted"
 */
export function evaluatePositionSuitability(
  naturalPositions: readonly PlayerPosition[],
  slot: PositionSuitabilitySlot,
): PositionSuitability {
  let bestSuitability: PositionSuitability = "invalid";

  for (const playerPosition of naturalPositions) {
    const candidateSuitability = evaluateSinglePositionSuitability(playerPosition, slot.positionFamily);

    if (SUITABILITY_SCORE[candidateSuitability] > SUITABILITY_SCORE[bestSuitability]) {
      bestSuitability = candidateSuitability;
    }
  }

  return bestSuitability;
}

/**
 * Checks whether a suitability value can reasonably cover a formation slot.
 *
 * `weak` is intentionally excluded: weak fits may be displayed as problems,
 * but they should not hide squad gaps in future fit reports.
 */
export function isCoveringSuitability(suitability: PositionSuitability): boolean {
  return suitability === "natural" || suitability === "adapted";
}

function evaluateSinglePositionSuitability(
  playerPosition: PlayerPosition,
  requiredFamily: FormationPositionFamily,
): PositionSuitability {
  if (NATURAL_FAMILIES_BY_POSITION[playerPosition].has(requiredFamily)) {
    return "natural";
  }

  if (ADAPTED_FAMILIES_BY_POSITION[playerPosition].has(requiredFamily)) {
    return "adapted";
  }

  if (WEAK_FAMILIES_BY_POSITION[playerPosition].has(requiredFamily)) {
    return "weak";
  }

  return "invalid";
}

const NATURAL_FAMILIES_BY_POSITION: Readonly<Record<PlayerPosition, ReadonlySet<FormationPositionFamily>>> = {
  gk: new Set(["goalkeeper"]),
  rb: new Set(["right_full_back"]),
  cb: new Set(["center_back"]),
  lb: new Set(["left_full_back"]),
  rwb: new Set(["right_wing_back"]),
  lwb: new Set(["left_wing_back"]),
  dm: new Set(["defensive_midfielder"]),
  cm: new Set(["central_midfielder"]),
  am: new Set(["attacking_midfielder"]),
  rw: new Set(["right_winger"]),
  lw: new Set(["left_winger"]),
  st: new Set(["striker"]),
};

const ADAPTED_FAMILIES_BY_POSITION: Readonly<Record<PlayerPosition, ReadonlySet<FormationPositionFamily>>> = {
  gk: new Set(),
  rb: new Set(["right_wing_back"]),
  cb: new Set(["defensive_midfielder"]),
  lb: new Set(["left_wing_back"]),
  rwb: new Set(["right_full_back", "right_midfielder", "right_winger"]),
  lwb: new Set(["left_full_back", "left_midfielder", "left_winger"]),
  dm: new Set(["central_midfielder", "center_back"]),
  cm: new Set(["defensive_midfielder", "attacking_midfielder"]),
  am: new Set(["central_midfielder", "second_striker"]),
  rw: new Set(["right_midfielder"]),
  lw: new Set(["left_midfielder"]),
  st: new Set(["second_striker"]),
};

const WEAK_FAMILIES_BY_POSITION: Readonly<Record<PlayerPosition, ReadonlySet<FormationPositionFamily>>> = {
  gk: new Set(),
  rb: new Set(["center_back", "left_full_back", "right_midfielder"]),
  cb: new Set(["right_full_back", "left_full_back", "right_wing_back", "left_wing_back"]),
  lb: new Set(["center_back", "right_full_back", "left_midfielder"]),
  rwb: new Set(["center_back", "left_wing_back", "left_full_back"]),
  lwb: new Set(["center_back", "right_wing_back", "right_full_back"]),
  dm: new Set(["attacking_midfielder"]),
  cm: new Set(["right_midfielder", "left_midfielder"]),
  am: new Set(["right_winger", "left_winger", "striker"]),
  rw: new Set(["right_wing_back", "attacking_midfielder", "left_winger", "striker"]),
  lw: new Set(["left_wing_back", "attacking_midfielder", "right_winger", "striker"]),
  st: new Set(["attacking_midfielder"]),
};
