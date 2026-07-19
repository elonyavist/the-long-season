import { useId } from "react";
import type { MessageKey, Translator } from "@game/i18n";
import type { CareerMatchdayPhasePlayerView } from "@game/ui";

import { roleLabelKey } from "../../shared/lib/match-preparation-labels";

/** Compact half-time signal derived from current structured match facts. */
export type MatchdayTeamRatingSignal = "watch" | "contributor";

/** Props for the reusable selected-team and opponent rating composition. */
export interface MatchdayTeamRatingsProps {
  readonly clubName: string;
  readonly rows: readonly CareerMatchdayPhasePlayerView[];
  readonly text: Translator;
  readonly signalsByPlayerId?: Readonly<Record<string, MatchdayTeamRatingSignal>>;
  readonly variant?: "live" | "final";
}

/**
 * Renders observed match facts for one team without exposing player attributes
 * or introducing a horizontally scrolling data table.
 */
export function MatchdayTeamRatings({
  clubName,
  rows,
  text,
  signalsByPlayerId = {},
  variant = "live",
}: MatchdayTeamRatingsProps): React.JSX.Element {
  const headingId = useId();

  return (
    <section className="tls-matchday-card tls-match-team-ratings" aria-labelledby={headingId}>
      <header className="tls-match-centre-card-heading">
        <div>
          <h2 id={headingId}>{text("career.matchday.teamRatings", { club: clubName })}</h2>
          <p>{text(variant === "final"
            ? "career.matchday.finalTeamRatingsHint"
            : "career.matchday.provisionalTeamRatingsHint")}</p>
        </div>
      </header>

      {rows.length === 0 ? (
        <p className="tls-matchday-empty">{text("career.matchday.noPlayerRatings")}</p>
      ) : (
        <ol className="tls-match-centre-rating-list" aria-label={text("career.matchday.playerRatingsTable")}>
          {rows.map((row) => (
            <MatchdayTeamRating
              key={row.playerId}
              row={row}
              text={text}
              {...(signalsByPlayerId[row.playerId] === undefined
                ? {}
                : { signal: signalsByPlayerId[row.playerId] })}
            />
          ))}
        </ol>
      )}
    </section>
  );
}

function MatchdayTeamRating({
  row,
  signal,
  text,
}: Readonly<{
  row: CareerMatchdayPhasePlayerView;
  signal?: MatchdayTeamRatingSignal;
  text: Translator;
}>): React.JSX.Element {
  const contributions = playerContributions(row, text);
  const roleKey = matchdayRoleLabelKey(row.roleKey);

  return (
    <li className="tls-match-centre-rating-row" data-rating-band={ratingBand(row.rating)}>
      <div className="tls-match-centre-rating-player">
        <strong>{row.playerName}</strong>
        <div className="tls-match-team-rating-status">
          {row.status === "on_pitch" ? null : (
            <small>{text(`career.matchday.playerStatus.${row.status}` as MessageKey)}</small>
          )}
          {signal === undefined ? null : (
            <span data-signal={signal}>{text(`career.matchday.halfTimeSignal.${signal}` as MessageKey)}</span>
          )}
        </div>
      </div>
      <strong
        aria-label={`${text("career.matchday.table.rating")} ${row.rating?.toFixed(1) ?? text("common.unknown")}`}
        className="tls-match-centre-rating-value"
      >
        {row.rating?.toFixed(1) ?? "-"}
      </strong>
      <dl className="tls-match-centre-rating-facts">
        <div>
          <dt>{text("career.matchday.table.role")}</dt>
          <dd>{roleKey === undefined ? text("common.unknown") : text(roleKey)}</dd>
        </div>
        <div>
          <dt>{text("career.matchday.table.condition")}</dt>
          <dd>{row.condition === undefined ? text("common.unknown") : `${row.condition}%`}</dd>
        </div>
        <div className="tls-match-centre-rating-contribution">
          <dt>{text("career.matchday.table.contribution")}</dt>
          <dd>{contributions.length === 0 ? text("common.none") : contributions.join(" · ")}</dd>
        </div>
      </dl>
    </li>
  );
}

function playerContributions(row: CareerMatchdayPhasePlayerView, text: Translator): readonly string[] {
  return [
    row.goals > 0 ? `${text("career.matchday.table.goals")} ${row.goals}` : "",
    row.assists > 0 ? `${text("career.matchday.table.assists")} ${row.assists}` : "",
    row.shotsOnTarget > 0 ? `${text("career.matchday.table.shotsOnTarget")} ${row.shotsOnTarget}` : "",
    row.saves > 0 ? `${text("career.matchday.table.saves")} ${row.saves}` : "",
    row.blocks > 0 ? `${text("career.matchday.table.blocks")} ${row.blocks}` : "",
  ].filter((part) => part.length > 0);
}

function ratingBand(rating: number | undefined): "strong" | "steady" | "warning" {
  if (rating !== undefined && rating >= 7) return "strong";
  if (rating !== undefined && rating < 6) return "warning";
  return "steady";
}

function matchdayRoleLabelKey(roleKey: string | undefined): MessageKey | undefined {
  if (roleKey === undefined) return undefined;

  if (roleKey === "gk" || roleKey === "goalkeeper") return roleLabelKey("goalkeeper");
  if (["defender", "right_full_back", "center_back", "left_full_back", "full_back", "wing_back"].includes(roleKey)) {
    return roleLabelKey("defender");
  }
  if ([
    "midfielder",
    "defensive_midfielder",
    "central_midfielder",
    "right_midfielder",
    "left_midfielder",
    "attacking_midfielder",
    "wide_midfielder",
  ].includes(roleKey)) {
    return roleLabelKey("midfielder");
  }
  if (["attacker", "right_winger", "left_winger", "winger", "striker"].includes(roleKey)) {
    return roleLabelKey("attacker");
  }
  return undefined;
}
