/**
 * Closed public player-rating scale used by every football surface.
 *
 * The values are global and club-independent. Half steps are deliberately
 * explicit so callers cannot accidentally create unsupported quarter-stars.
 */
export const PLAYER_STAR_RATINGS = [
  1,
  1.5,
  2,
  2.5,
  3,
  3.5,
  4,
  4.5,
  5,
  5.5,
  6,
] as const;

/** One supported public player rating on the global 1..6 half-star scale. */
export type PlayerStarRating = (typeof PLAYER_STAR_RATINGS)[number];

/**
 * Returns whether an unknown number belongs to the closed public rating scale.
 */
export function isPlayerStarRating(value: number): value is PlayerStarRating {
  return PLAYER_STAR_RATINGS.some((rating) => rating === value);
}

/**
 * Builds a validated public player rating.
 *
 * @throws When the value is outside 1..6 or is not an exact half step.
 */
export function playerStarRating(value: number): PlayerStarRating {
  if (!isPlayerStarRating(value)) {
    throw new Error(`PlayerStarRating must be a 1..6 half step: ${value}`);
  }

  return value;
}
