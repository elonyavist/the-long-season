import {
  validatePlayerStateCurvesConfig,
  type PlayerStateCurvesConfig,
} from "@game/domain";

import playerStateCurvesJson from "./player-state-curves.json" with { type: "json" };

/** Reviewed deterministic fitness-recovery content. */
export const playerStateCurves = Object.freeze(
  validatePlayerStateCurvesConfig(playerStateCurvesJson as PlayerStateCurvesConfig),
);

/**
 * Selects the current curve explicitly at composition boundaries.
 *
 * Step 14 owns adding this version to persisted calibration bundles; until
 * then callers select the sole reviewed content version and reports stamp it.
 */
export function selectPlayerStateCurvesConfig(): PlayerStateCurvesConfig {
  return playerStateCurves;
}
