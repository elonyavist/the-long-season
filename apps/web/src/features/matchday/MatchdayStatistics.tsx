import type { CSSProperties } from "react";
import type { MessageKey, Translator } from "@game/i18n";

import type {
  MatchdayStatisticMetricView,
  MatchdayStatisticsView,
} from "./career-matchday-presenter";

/** Props for the compact and complete engine-statistics comparisons. */
export interface MatchdayStatisticsProps {
  readonly view: MatchdayStatisticsView;
  readonly text: Translator;
  readonly mode: "compact" | "complete";
}

/** Renders truthful home/away comparisons without a wide data table. */
export function MatchdayStatistics({
  view,
  text,
  mode,
}: MatchdayStatisticsProps): React.JSX.Element {
  const metrics = mode === "compact"
    ? view.metrics.filter((metric) => metric.compact)
    : view.metrics;

  return (
    <section
      aria-label={text("career.matchday.statistics.title")}
      className="tls-match-statistics"
      data-mode={mode}
    >
      {mode === "complete" ? (
        <header className="tls-match-statistics-clubs">
          <div className="tls-match-statistics-club is-home">
            <span aria-hidden="true" />
            <strong>{view.homeClubName}</strong>
          </div>
          <span className="tls-match-statistics-versus" aria-hidden="true">vs</span>
          <div className="tls-match-statistics-club is-away">
            <span aria-hidden="true" />
            <strong>{view.awayClubName}</strong>
          </div>
        </header>
      ) : null}

      <div className="tls-match-statistics-list">
        {metrics.map((metric) => (
          <MatchdayStatisticRow key={metric.metricId} metric={metric} text={text} />
        ))}
      </div>
    </section>
  );
}

function MatchdayStatisticRow({
  metric,
  text,
}: Readonly<{
  metric: MatchdayStatisticMetricView;
  text: Translator;
}>): React.JSX.Element {
  const label = text(metric.labelKey as MessageKey);
  const homeValue = formatStatisticValue(metric.homeValue, metric.format);
  const awayValue = formatStatisticValue(metric.awayValue, metric.format);
  const comparisonLabel = text("career.matchday.statistics.comparison", {
    label,
    home: homeValue,
    away: awayValue,
  });
  const style = {
    "--home-stat-share": `${metric.homeBarPercent}%`,
    "--away-stat-share": `${metric.awayBarPercent}%`,
  } as CSSProperties;

  return (
    <div className="tls-match-statistic-row" style={style}>
      <div className="tls-match-statistic-values">
        <strong>{homeValue}</strong>
        <span>{label}</span>
        <strong>{awayValue}</strong>
      </div>
      <div
        aria-label={comparisonLabel}
        className="tls-match-statistic-bar"
        role="img"
      >
        <span className="is-home"><i /></span>
        <span className="is-away"><i /></span>
      </div>
    </div>
  );
}

/** Formats only presentation values; all football calculations stay upstream. */
export function formatStatisticValue(
  value: number,
  format: MatchdayStatisticMetricView["format"],
): string {
  if (format === "percent") return `${Math.round(value * 100)}%`;
  if (format === "decimal") return value.toFixed(2);
  return String(value);
}
