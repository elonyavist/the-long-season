import type { ClubCategory, PlayerRole } from "@game/domain";
import { deriveRng } from "@game/shared";

/** Version shared by the authored table, derived stream and diagnostic report. */
export const ROUTINE_YOUTH_STATIONARY_RUNWAY_POLICY_VERSION =
  "routine-youth-stationary-runway-v1";

/** Stable share of ordinary academy youth who receive the stationary runway. */
export const ROUTINE_YOUTH_STATIONARY_RUNWAY_BASIS_POINTS = 5_000;

/**
 * Role-potential targets derived from the frozen L6.29A opening population.
 *
 * These are authored content facts, not live population statistics: a player
 * gets the same target even when the surrounding intake or senior squad
 * changes. Quarter-point resolution records the preregistered p75 derivation
 * without implying precision that seven opening worlds cannot support.
 */
export const ROUTINE_YOUTH_STATIONARY_RUNWAY_TARGETS = {
  first_division: {
    goalkeeper: 13.25,
    center_back: 13.75,
    full_back: 13.5,
    wing_back: 14.25,
    defensive_midfielder: 14,
    central_midfielder: 13.5,
    attacking_midfielder: 13.75,
    wide_midfielder: 13.25,
    winger: 14.25,
    striker: 13.75,
  },
  second_division: {
    goalkeeper: 11.25,
    center_back: 11.5,
    full_back: 11.25,
    wing_back: 11.5,
    defensive_midfielder: 11.5,
    central_midfielder: 11.75,
    attacking_midfielder: 11.75,
    wide_midfielder: 11.25,
    winger: 11.5,
    striker: 11.5,
  },
  third_division: {
    goalkeeper: 9.5,
    center_back: 9.5,
    full_back: 9.5,
    wing_back: 9.75,
    defensive_midfielder: 9.5,
    central_midfielder: 9.75,
    attacking_midfielder: 9.25,
    wide_midfielder: 9.25,
    winger: 9.5,
    striker: 9.25,
  },
} as const satisfies Readonly<
  Record<ClubCategory, Readonly<Record<PlayerRole, number>>>
>;

/** Facts that permanently identify one routine-youth runway decision. */
export interface RoutineYouthStationaryRunwayInput {
  readonly worldSeed: string;
  readonly playerKey: string;
  readonly division: ClubCategory;
  readonly role: PlayerRole;
}

/**
 * Returns the authored minimum for the stable half of routine youth.
 *
 * The derived RNG stream reads only immutable generation facts. It consumes no
 * shared stream and never compares this player with another candidate, so
 * vacancy counts and intake order cannot turn an individual lane into a quota.
 */
export function routineYouthStationaryRunwayTarget(
  input: RoutineYouthStationaryRunwayInput,
): number | undefined {
  const draw = deriveRng(
    input.worldSeed,
    ROUTINE_YOUTH_STATIONARY_RUNWAY_POLICY_VERSION,
    input.playerKey,
    input.division,
    input.role,
  ).nextInt(0, 10_000);
  return draw < ROUTINE_YOUTH_STATIONARY_RUNWAY_BASIS_POINTS
    ? ROUTINE_YOUTH_STATIONARY_RUNWAY_TARGETS[input.division][input.role]
    : undefined;
}
