import type { PlayerPosition } from "../entities/player.entity.ts";
import type { FormationSide, FormationSlot } from "./formations.ts";
import type { CanonicalPlayerRole } from "./player-roles.ts";

/** Suitability categories from best to worst. */
export type PositionSuitability = "natural" | "adapted" | "weak" | "invalid";

/** Minimal slot shape required by the suitability evaluator. */
export type PositionSuitabilitySlot = Pick<FormationSlot, "playerRole"> | Pick<FormationSlot, "positionFamily">;

/** Input for deterministic player-vs-slot selection scoring. */
export interface PlayerSlotFitScoreInput {
  /** Player natural positions in strongest-to-weakest order. */
  readonly naturalPositions: readonly PlayerPosition[];
  /** Slot role and optional side/channel metadata. */
  readonly slot: PositionSuitabilitySlot & Partial<Pick<FormationSlot, "side">>;
  /** Current player strength on a caller-owned numeric scale. */
  readonly playerStrength: number;
}

const SUITABILITY_SCORE: Readonly<Record<PositionSuitability, number>> = {
  invalid: 0,
  weak: 1,
  adapted: 2,
  natural: 3,
};

const SUITABILITY_SELECTION_BONUS: Readonly<Record<PositionSuitability, number>> = {
  natural: 35,
  adapted: 25,
  weak: 5,
  invalid: -1_000,
};

const SIDE_SELECTION_BONUS = 3;

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
  const requiredRole = roleForSlot(slot);

  for (const playerPosition of naturalPositions) {
    const candidateSuitability = evaluateSinglePositionSuitability(playerPosition, requiredRole);

    if (SUITABILITY_SCORE[candidateSuitability] > SUITABILITY_SCORE[bestSuitability]) {
      bestSuitability = candidateSuitability;
    }
  }

  return bestSuitability;
}

/**
 * Scores one player for one formation slot.
 *
 * The score combines football quality with positional fit. This keeps the
 * explicit manager helper actions realistic: a strong adapted player can rank
 * above a mediocre natural player, while invalid fits remain unusable.
 */
export function scorePlayerForFormationSlot(input: PlayerSlotFitScoreInput): number {
  const suitability = evaluatePositionSuitability(input.naturalPositions, input.slot);
  const sideBonus = bestSideBonus(input.naturalPositions, input.slot.side);

  return input.playerStrength + SUITABILITY_SELECTION_BONUS[suitability] + sideBonus;
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
  requiredRole: CanonicalPlayerRole,
): PositionSuitability {
  if (NATURAL_ROLES_BY_POSITION[playerPosition].has(requiredRole)) {
    return "natural";
  }

  if (ADAPTED_ROLES_BY_POSITION[playerPosition].has(requiredRole)) {
    return "adapted";
  }

  if (WEAK_ROLES_BY_POSITION[playerPosition].has(requiredRole)) {
    return "weak";
  }

  return "invalid";
}

function roleForSlot(slot: PositionSuitabilitySlot): CanonicalPlayerRole {
  if ("playerRole" in slot) {
    return slot.playerRole;
  }

  return slot.positionFamily as CanonicalPlayerRole;
}

function bestSideBonus(naturalPositions: readonly PlayerPosition[], side: FormationSide | undefined): number {
  if (side === undefined || side === "center") {
    return 0;
  }

  return naturalPositions.some((position) => POSITION_SIDE[position] === side) ? SIDE_SELECTION_BONUS : 0;
}

const POSITION_SIDE: Readonly<Partial<Record<PlayerPosition, FormationSide>>> = {
  rb: "right",
  rwb: "right",
  rw: "right",
  lb: "left",
  lwb: "left",
  lw: "left",
};

const NATURAL_ROLES_BY_POSITION: Readonly<Record<PlayerPosition, ReadonlySet<CanonicalPlayerRole>>> = {
  gk: new Set(["goalkeeper"]),
  rb: new Set(["right_full_back"]),
  cb: new Set(["center_back"]),
  lb: new Set(["left_full_back"]),
  rwb: new Set(["right_midfielder"]),
  lwb: new Set(["left_midfielder"]),
  dm: new Set(["defensive_midfielder"]),
  cm: new Set(["central_midfielder"]),
  am: new Set(["attacking_midfielder"]),
  rw: new Set(["right_winger"]),
  lw: new Set(["left_winger"]),
  st: new Set(["striker"]),
};

const ADAPTED_ROLES_BY_POSITION: Readonly<Record<PlayerPosition, ReadonlySet<CanonicalPlayerRole>>> = {
  gk: new Set(),
  rb: new Set(),
  cb: new Set(["defensive_midfielder"]),
  lb: new Set(),
  rwb: new Set(["right_full_back", "right_winger"]),
  lwb: new Set(["left_full_back", "left_winger"]),
  dm: new Set(["central_midfielder", "center_back"]),
  cm: new Set(["defensive_midfielder", "attacking_midfielder"]),
  am: new Set(["central_midfielder", "striker"]),
  rw: new Set(["right_midfielder"]),
  lw: new Set(["left_midfielder"]),
  st: new Set(),
};

const WEAK_ROLES_BY_POSITION: Readonly<Record<PlayerPosition, ReadonlySet<CanonicalPlayerRole>>> = {
  gk: new Set(),
  rb: new Set(["center_back", "left_full_back", "right_midfielder"]),
  cb: new Set(["right_full_back", "left_full_back"]),
  lb: new Set(["center_back", "right_full_back", "left_midfielder"]),
  rwb: new Set(["center_back", "left_winger", "left_full_back"]),
  lwb: new Set(["center_back", "right_winger", "right_full_back"]),
  dm: new Set(["attacking_midfielder"]),
  cm: new Set(["right_midfielder", "left_midfielder"]),
  am: new Set(["right_winger", "left_winger", "striker"]),
  rw: new Set(["attacking_midfielder", "left_winger", "striker"]),
  lw: new Set(["attacking_midfielder", "right_winger", "striker"]),
  st: new Set(["attacking_midfielder"]),
};
