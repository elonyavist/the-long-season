import { useId } from "react";
import type { SupportedLanguage } from "@game/i18n";

/** One exact current attribute ready for the player workspace. */
export interface PlayerAttributeItem {
  /** Stable canonical attribute identifier. */
  readonly attributeId: string;
  /** Localized attribute name. */
  readonly label: string;
  /** Exact current value. Hidden potential never belongs in this component. */
  readonly value: number;
}

/** One already-filtered family of role-appropriate current attributes. */
export interface PlayerAttributeGroupItem {
  /** Stable family identifier. */
  readonly groupId: string;
  /** Localized family heading. */
  readonly label: string;
  /** Attributes in role-relevance order. */
  readonly attributes: readonly PlayerAttributeItem[];
}

/** Props for the presentation-only exact attribute groups. */
export interface PlayerAttributeGroupsProps {
  /** Localized accessible name for the complete attribute section. */
  readonly ariaLabel: string;
  /** Role-appropriate groups supplied by the framework-free view model. */
  readonly groups: readonly PlayerAttributeGroupItem[];
  /** Active locale used for the mandatory single decimal separator. */
  readonly language: SupportedLanguage;
}

/** Renders grouped exact current attributes without inventing missing families. */
export function PlayerAttributeGroups({
  ariaLabel,
  groups,
  language,
}: PlayerAttributeGroupsProps): React.JSX.Element {
  const instanceId = useId();

  return (
    <section aria-label={ariaLabel} className="tls-player-attribute-groups">
      {groups.map((group, groupIndex) => {
        const headingId = `${instanceId}-attribute-group-${groupIndex}`;
        return (
          <section
            aria-labelledby={headingId}
            className="tls-player-attribute-group"
            data-family={group.groupId}
            key={group.groupId}
          >
            <h4 id={headingId}>{group.label}</h4>
            <dl className="tls-player-attribute-list">
              {group.attributes.map((attribute) => (
                <div
                  className="tls-player-attribute"
                  data-band={attributeBand(attribute.value)}
                  key={attribute.attributeId}
                >
                  <dt>{attribute.label}</dt>
                  <dd>{formatAttribute(attribute.value, language)}</dd>
                </div>
              ))}
            </dl>
          </section>
        );
      })}
    </section>
  );
}

/**
 * Formats an exact current attribute for compact display.
 *
 * The underlying value remains untouched for gameplay and colour-band logic;
 * only the rendered label is rounded to exactly one locale-aware decimal.
 */
export function formatAttribute(
  value: number,
  language: SupportedLanguage,
): string {
  return new Intl.NumberFormat(language, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
    useGrouping: false,
  }).format(value);
}

/*
 * These display bands divide the public 1..20 scale for visual scanning only.
 * They are neither gameplay rules nor additional statistics.
 */
const EXCELLENT_ATTRIBUTE_FLOOR = 15;
const GOOD_ATTRIBUTE_FLOOR = 12;
const AVERAGE_ATTRIBUTE_FLOOR = 8;

/** Maps an exact current value to its presentation-only colour band. */
export function attributeBand(
  value: number,
): "low" | "average" | "good" | "excellent" {
  if (value >= EXCELLENT_ATTRIBUTE_FLOOR) return "excellent";
  if (value >= GOOD_ATTRIBUTE_FLOOR) return "good";
  if (value >= AVERAGE_ATTRIBUTE_FLOOR) return "average";
  return "low";
}
