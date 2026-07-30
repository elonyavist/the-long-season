import {
  PLAYER_STAR_RATINGS,
  isPlayerStarRating,
  type PlayerStarRating,
} from "@game/domain";

/** Supported global public values shared with the domain rating contract. */
export const CAREER_PLAYER_STAR_VALUES = PLAYER_STAR_RATINGS;

/** One public star value that never exposes the underlying numeric ability. */
export type CareerPlayerStarValue = PlayerStarRating;

/** Public player assessment shared by Squad, Market, lineup, and profiles. */
export interface CareerPlayerRatingView {
  readonly stars: CareerPlayerStarValue;
}

/**
 * Public potential range shared by Squad, Market, and player profiles.
 *
 * Both values use the closed global half-star scale; neither exposes numeric
 * ability or claims the lower estimate is guaranteed.
 */
export interface CareerPlayerPotentialRangeView {
  readonly lowerStars: CareerPlayerStarValue;
  readonly upperStars: CareerPlayerStarValue;
}

/** Copies and validates a rating at a framework-free read-model boundary. */
export function copyCareerPlayerRating(
  rating: CareerPlayerRatingView,
): CareerPlayerRatingView {
  assertCareerPlayerRating(rating);
  return {
    stars: rating.stars,
  };
}

/** Returns a deterministic sortable score for the closed half-star scale. */
export function careerPlayerRatingSortScore(
  rating: CareerPlayerRatingView,
): number {
  assertCareerPlayerRating(rating);
  return rating.stars * 2;
}

/** Copies and validates one ordered lower-to-upper public potential range. */
export function copyCareerPlayerPotentialRange(
  range: CareerPlayerPotentialRangeView,
): CareerPlayerPotentialRangeView {
  assertCareerPlayerPotentialRange(range);
  return {
    lowerStars: range.lowerStars,
    upperStars: range.upperStars,
  };
}

/**
 * Compares ranges conservatively: lower estimate first, then upper ceiling.
 *
 * Current rating and player ID remain row-level tie-breakers because they do
 * not belong to the range itself.
 */
export function compareCareerPlayerPotentialRanges(
  left: CareerPlayerPotentialRangeView,
  right: CareerPlayerPotentialRangeView,
): number {
  assertCareerPlayerPotentialRange(left);
  assertCareerPlayerPotentialRange(right);
  return left.lowerStars - right.lowerStars
    || left.upperStars - right.upperStars;
}

function assertCareerPlayerRating(rating: CareerPlayerRatingView): void {
  if (!isPlayerStarRating(rating.stars)) {
    throw new RangeError(`Unsupported career player star value: ${rating.stars}`);
  }
}

function assertCareerPlayerPotentialRange(
  range: CareerPlayerPotentialRangeView,
): void {
  if (!isPlayerStarRating(range.lowerStars)) {
    throw new RangeError(
      `Unsupported career player potential lower value: ${range.lowerStars}`,
    );
  }
  if (!isPlayerStarRating(range.upperStars)) {
    throw new RangeError(
      `Unsupported career player potential upper value: ${range.upperStars}`,
    );
  }
  if (range.lowerStars > range.upperStars) {
    throw new RangeError(
      `Career player potential range is inverted: ${range.lowerStars}..${range.upperStars}`,
    );
  }
}
