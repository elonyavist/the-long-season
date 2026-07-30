import type { Translator } from "@game/i18n";
import type { CareerPlayerRatingView } from "@game/ui";
import { Star } from "lucide-react";

const ORDINARY_STAR_COUNT = 5;

/** Props for the single public player-rating renderer shared by Squad and Market. */
export interface PlayerStarRatingProps {
  /** Public half-star assessment. It never contains an underlying ability value. */
  readonly rating: CareerPlayerRatingView;
  /** Localized fact name, such as current level or potential. */
  readonly label: string;
  /** Fixed-language translator used for the screen-reader summary. */
  readonly text: Translator;
}

/**
 * Renders five ordinary gold slots and the exceptional dark-orange sixth slot.
 *
 * The glyphs are decorative because the localized root label already exposes
 * the complete public assessment without revealing any hidden ability number.
 */
export function PlayerStarRating({
  rating,
  label,
  text,
}: PlayerStarRatingProps): React.JSX.Element {
  const accessibleLabel = text("career.playerRating.accessible", {
    label,
    stars: formatPublicStars(rating.stars),
  });
  const hasSixthStar = rating.stars > ORDINARY_STAR_COUNT;

  return (
    <span
      aria-label={accessibleLabel}
      className="tls-player-star-rating"
      data-rating={formatPublicStars(rating.stars)}
      role="img"
    >
      <span className="tls-player-star-rating-glyphs" aria-hidden="true">
        {Array.from({ length: ORDINARY_STAR_COUNT }, (_, index) => (
          <RatingStar
            fill={starFillAtIndex(rating.stars, index)}
            key={index}
          />
        ))}
        {hasSixthStar ? (
          <RatingStar
            fill={rating.stars === 5.5 ? "half" : "full"}
            sixth
          />
        ) : null}
      </span>
    </span>
  );
}

function RatingStar({
  fill,
  sixth = false,
}: Readonly<{
  fill: "empty" | "half" | "full";
  sixth?: boolean;
}>): React.JSX.Element {
  return (
    <span
      className="tls-player-rating-star"
      data-fill={fill}
      {...(sixth ? { "data-sixth": "true" } : {})}
    >
      <Star className="tls-player-rating-star-outline" size={16} strokeWidth={1.8} />
      {fill === "empty" ? null : (
        <Star
          className="tls-player-rating-star-fill"
          fill="currentColor"
          size={16}
          strokeWidth={1.8}
        />
      )}
    </span>
  );
}

function starFillAtIndex(
  stars: CareerPlayerRatingView["stars"],
  index: number,
): "empty" | "half" | "full" {
  const remaining = stars - index;
  if (remaining >= 1) return "full";
  if (remaining >= 0.5) return "half";
  return "empty";
}

function formatPublicStars(stars: CareerPlayerRatingView["stars"]): string {
  return Number.isInteger(stars) ? String(stars) : stars.toFixed(1);
}
