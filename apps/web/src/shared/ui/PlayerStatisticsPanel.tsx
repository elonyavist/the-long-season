import type { MessageKey, SupportedLanguage, Translator } from "@game/i18n";
import type { CareerPlayerStatisticsView } from "@game/ui";

/** Truthful coverage statuses supplied by the player-statistics view model. */
export type PlayerStatisticsCoverageStatus =
  | "complete"
  | "partial"
  | "unavailable";

/** One already-formatted statistic; this component never infers a zero. */
export interface PlayerStatisticsMetricItem {
  /** Stable statistic identifier. */
  readonly metricId: string;
  /** Localized statistic name. */
  readonly label: string;
  /** View-safe value, including an explicit unavailable label when required. */
  readonly value: string;
}

/** One independent participation or event-source coverage statement. */
export interface PlayerStatisticsCoverageItem {
  /** Stable source identifier, normally participation or events. */
  readonly sourceId: string;
  /** Localized source name. */
  readonly label: string;
  /** Machine-readable coverage used only for semantic styling. */
  readonly status: PlayerStatisticsCoverageStatus;
  /** Localized status visible to every user. */
  readonly statusLabel: string;
}

/** One current-season or whole-career statistics summary. */
export interface PlayerStatisticsPeriodItem {
  /** Stable period identifier. */
  readonly periodId: string;
  /** Localized period heading. */
  readonly label: string;
  /** Supported totals in product order. */
  readonly metrics: readonly PlayerStatisticsMetricItem[];
  /** Independent, explicit source coverage. */
  readonly coverage: readonly PlayerStatisticsCoverageItem[];
}

/** Props for the presentation-only current/career statistics comparison. */
export interface PlayerStatisticsPanelProps {
  /** Localized accessible name for the complete statistics section. */
  readonly ariaLabel: string;
  /** Current and career summaries in manager-facing order. */
  readonly periods: readonly PlayerStatisticsPeriodItem[];
}

/**
 * Formats the canonical current-season and career scopes for every player profile.
 *
 * Keeping this policy shared means Squad and Market cannot drift on metric order,
 * goalkeeper saves, locale formatting, or the meaning of unavailable coverage.
 */
export function buildPlayerStatisticsPeriodItems(
  statistics: CareerPlayerStatisticsView,
  language: SupportedLanguage,
  text: Translator,
): readonly PlayerStatisticsPeriodItem[] {
  return [statistics.currentSeason, statistics.career].map((period) => {
    const metrics: PlayerStatisticsMetricItem[] = [];
    if (period.participation.coverage !== "unavailable") {
      metrics.push(
        statisticMetric("starts", period.participation.starts, language, text),
        statisticMetric(
          "substituteAppearances",
          period.participation.substituteAppearances,
          language,
          text,
        ),
        statisticMetric("appearances", period.participation.appearances, language, text),
        statisticMetric("minutes", period.participation.minutes, language, text),
        {
          metricId: "averageRating",
          label: text("career.playerProfile.statistics.field.averageRating"),
          value: period.participation.averageRating === undefined
            ? text("career.playerProfile.statistics.unavailableValue")
            : formatAverageRating(period.participation.averageRating, language),
        },
      );
    }
    if (period.events.coverage !== "unavailable") {
      metrics.push(
        statisticMetric("goals", period.events.goals, language, text),
        statisticMetric("assists", period.events.assists, language, text),
      );
      if (period.events.saves !== undefined) {
        metrics.push(statisticMetric("saves", period.events.saves, language, text));
      }
    }

    return {
      periodId: period.scope,
      label: text(period.labelKey as MessageKey),
      metrics,
      coverage: [
        statisticsCoverage("participation", period.participation.coverage, text),
        statisticsCoverage("events", period.events.coverage, text),
      ],
    };
  });
}

/**
 * Renders supported player totals together with explicit source coverage.
 *
 * Values arrive formatted from the adapter/view boundary so this component
 * cannot turn missing historical information into a misleading numeric zero.
 */
export function PlayerStatisticsPanel({
  ariaLabel,
  periods,
}: PlayerStatisticsPanelProps): React.JSX.Element {
  return (
    <section aria-label={ariaLabel} className="tls-player-statistics-panel">
      <div className="tls-player-statistics-periods">
        {periods.map((period) => (
          <section className="tls-player-statistics-period" key={period.periodId}>
            <h4>{period.label}</h4>
            <dl className="tls-player-statistics-metrics">
              {period.metrics.map((metric) => (
                <div className="tls-player-statistics-metric" key={metric.metricId}>
                  <dt>{metric.label}</dt>
                  <dd>{metric.value}</dd>
                </div>
              ))}
            </dl>
            <dl className="tls-player-statistics-coverage">
              {period.coverage.map((coverage) => (
                <div
                  className="tls-player-statistics-coverage-item"
                  data-coverage={coverage.status}
                  key={coverage.sourceId}
                >
                  <dt>{coverage.label}</dt>
                  <dd>{coverage.statusLabel}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </section>
  );
}

/** Formats one supported integer statistic with locale-aware digit grouping. */
function statisticMetric(
  metricId:
    | "starts"
    | "substituteAppearances"
    | "appearances"
    | "minutes"
    | "goals"
    | "assists"
    | "saves",
  value: number,
  language: SupportedLanguage,
  text: Translator,
): PlayerStatisticsMetricItem {
  return {
    metricId,
    label: text(`career.playerProfile.statistics.field.${metricId}` as MessageKey),
    value: new Intl.NumberFormat(language).format(value),
  };
}

/** Builds one visible source-coverage statement whose meaning is not colour-only. */
function statisticsCoverage(
  sourceId: "participation" | "events",
  status: PlayerStatisticsCoverageStatus,
  text: Translator,
): PlayerStatisticsCoverageItem {
  return {
    sourceId,
    label: text(`career.playerProfile.statistics.coverage.${sourceId}` as MessageKey),
    status,
    statusLabel: text(`career.playerProfile.statistics.coverage.${status}` as MessageKey),
  };
}

/** Keeps weighted football ratings compact in the selected UI language. */
function formatAverageRating(
  value: number,
  language: SupportedLanguage,
): string {
  return new Intl.NumberFormat(language, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
