import type { SupportedLanguage, Translator } from "@game/i18n";
import type {
  CareerPlayerPotentialRangeView,
  CareerPlayerRatingView,
} from "@game/ui";
import { Star } from "lucide-react";
import { useId } from "react";

const POTENTIAL_SLOT_COUNT = 6;

/** Props for the shared accessible lower-to-upper potential renderer. */
export interface PlayerPotentialRangeRatingProps {
  /** Public current level used to separate achieved ability from future upside. */
  readonly currentRating: CareerPlayerRatingView;
  /** Derived public range; it contains no exact ability or persisted floor. */
  readonly range: CareerPlayerPotentialRangeView;
  /** Locale used only to format public half-star values. */
  readonly language: SupportedLanguage;
  /** Fixed-language translator used for the complete screen-reader fact. */
  readonly text: Translator;
}

/**
 * Renders six stable slots with filled conservative and patterned upside bands.
 *
 * Pattern, DOM state, shape, and localized text communicate uncertainty, so
 * neither the gold/orange palette nor color perception carries meaning alone.
 */
export function PlayerPotentialRangeRating({
  currentRating,
  range,
  language,
  text,
}: PlayerPotentialRangeRatingProps): React.JSX.Element {
  const rawId = useId().replaceAll(":", "");
  const uncertainty = range.upperStars - range.lowerStars;
  const accessibleLabel = uncertainty === 0
    ? text("career.playerPotentialRange.accessibleSingular", {
        current: formatStars(currentRating.stars, language),
        stars: formatStars(range.lowerStars, language),
      })
    : text("career.playerPotentialRange.accessibleRange", {
        current: formatStars(currentRating.stars, language),
        lower: formatStars(range.lowerStars, language),
        upper: formatStars(range.upperStars, language),
        uncertainty: formatStars(uncertainty, language),
      });

  return (
    <span
      aria-label={accessibleLabel}
      className="tls-player-potential-range"
      data-current={formatMachineStars(currentRating.stars)}
      data-lower={formatMachineStars(range.lowerStars)}
      data-upper={formatMachineStars(range.upperStars)}
      role="img"
    >
      <span className="tls-player-potential-range-glyphs" aria-hidden="true">
        {Array.from({ length: POTENTIAL_SLOT_COUNT }, (_, index) => (
          <PotentialRangeStar
            key={index}
            currentStars={currentRating.stars}
            index={index}
            lowerStars={range.lowerStars}
            upperStars={range.upperStars}
            patternId={`${rawId}-potential-${index}`}
          />
        ))}
      </span>
    </span>
  );
}

function PotentialRangeStar({
  currentStars,
  index,
  lowerStars,
  upperStars,
  patternId,
}: Readonly<{
  currentStars: number;
  index: number;
  lowerStars: number;
  upperStars: number;
  patternId: string;
}>): React.JSX.Element {
  const achievedFraction = slotFraction(currentStars, index);
  const lowerFraction = slotFraction(lowerStars, index);
  const upperFraction = slotFraction(upperStars, index);
  const conservativeFutureFraction = Math.max(0, lowerFraction - achievedFraction);
  const uncertainFutureFraction = Math.max(
    0,
    upperFraction - Math.max(achievedFraction, lowerFraction),
  );
  const sixth = index === POTENTIAL_SLOT_COUNT - 1;
  const upperClipId = `${patternId}-upper`;
  const lowerClipId = `${patternId}-lower`;
  const achievedClipId = `${patternId}-achieved`;

  return (
    <span
      className="tls-player-potential-star"
      data-achieved={fractionState(achievedFraction)}
      data-conservative-future={fractionState(conservativeFutureFraction)}
      data-uncertain-future={fractionState(uncertainFutureFraction)}
      data-sixth={sixth ? "true" : "false"}
      data-within-ceiling={upperFraction > 0 ? "true" : "false"}
    >
      <svg viewBox="0 0 24 24" focusable="false">
        <defs>
          <pattern
            id={patternId}
            height="4"
            patternUnits="userSpaceOnUse"
            width="4"
            patternTransform="rotate(45)"
          >
            <line
              className="tls-player-potential-pattern-line"
              x1="0"
              x2="0"
              y1="0"
              y2="4"
            />
          </pattern>
          <clipPath id={upperClipId}>
            <rect height="24" width={24 * upperFraction} x="0" y="0" />
          </clipPath>
          <clipPath id={lowerClipId}>
            <rect height="24" width={24 * lowerFraction} x="0" y="0" />
          </clipPath>
          <clipPath id={achievedClipId}>
            <rect height="24" width={24 * achievedFraction} x="0" y="0" />
          </clipPath>
        </defs>
        <Star
          className="tls-player-potential-star-outline"
          fill="none"
          size={24}
          strokeWidth={1.8}
        />
        {uncertainFutureFraction === 0 ? null : (
          <>
            <Star
              className="tls-player-potential-star-uncertain-future-base"
              clipPath={`url(#${upperClipId})`}
              fill="currentColor"
              size={24}
              strokeWidth={1.8}
            />
            <Star
              className="tls-player-potential-star-uncertain-future"
              clipPath={`url(#${upperClipId})`}
              fill={`url(#${patternId})`}
              size={24}
              strokeWidth={0}
            />
          </>
        )}
        {conservativeFutureFraction === 0 ? null : (
          <Star
            className="tls-player-potential-star-conservative-future"
            clipPath={`url(#${lowerClipId})`}
            fill="currentColor"
            size={24}
            strokeWidth={1.8}
          />
        )}
        {achievedFraction === 0 ? null : (
          <Star
            className="tls-player-potential-star-achieved"
            clipPath={`url(#${achievedClipId})`}
            fill="currentColor"
            size={24}
            strokeWidth={1.8}
          />
        )}
      </svg>
    </span>
  );
}

function slotFraction(stars: number, index: number): 0 | 0.5 | 1 {
  const remaining = stars - index;
  if (remaining >= 1) return 1;
  if (remaining >= 0.5) return 0.5;
  return 0;
}

function fractionState(fraction: number): "none" | "half" | "full" {
  if (fraction === 1) return "full";
  if (fraction === 0.5) return "half";
  return "none";
}

function formatStars(stars: number, language: SupportedLanguage): string {
  return new Intl.NumberFormat(language, {
    maximumFractionDigits: 1,
    minimumFractionDigits: Number.isInteger(stars) ? 0 : 1,
  }).format(stars);
}

function formatMachineStars(stars: number): string {
  return Number.isInteger(stars) ? String(stars) : stars.toFixed(1);
}
