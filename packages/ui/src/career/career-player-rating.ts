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
 * ability or claims the P50 estimate is guaranteed.
 */
export interface CareerPlayerPotentialRangeView {
  readonly p50Stars: CareerPlayerStarValue;
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

/** Copies and validates one ordered P50-to-upper public potential range. */
export function copyCareerPlayerPotentialRange(
  range: CareerPlayerPotentialRangeView,
): CareerPlayerPotentialRangeView {
  assertCareerPlayerPotentialRange(range);
  return {
    p50Stars: range.p50Stars,
    upperStars: range.upperStars,
  };
}

/**
 * Compares ranges by the explicit product policy: P50 first, then public upper.
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
  return left.p50Stars - right.p50Stars
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
  if (!isPlayerStarRating(range.p50Stars)) {
    throw new RangeError(
      `Unsupported career player potential P50 value: ${range.p50Stars}`,
    );
  }
  if (!isPlayerStarRating(range.upperStars)) {
    throw new RangeError(
      `Unsupported career player potential upper value: ${range.upperStars}`,
    );
  }
  if (range.p50Stars > range.upperStars) {
    throw new RangeError(
      `Career player potential range is inverted: ${range.p50Stars}..${range.upperStars}`,
    );
  }
}
