import type { MessageKey, Translator } from "@game/i18n";
import type { CareerMatchdayPhasePlayerView } from "@game/ui";

import { roleLabelKey } from "../../shared/lib/match-preparation-labels";
import type {
  MatchdayFullTimeConsequenceView,
  MatchdayFullTimeReviewView,
  MatchdayPresentedEventView,
} from "./career-matchday-presenter";
import {
  formatMatchdayEventPlayerLine,
  matchdayEventAccessibleLabel,
} from "./MatchdayLivePhase";

/** Props for the composition-only full-time football review. */
export type MatchdayFullTimePhaseProps = Readonly<{
  review: MatchdayFullTimeReviewView;
  text: Translator;
}>;

/**
 * Renders the final football story in decision order: incidents, selected-club
 * ratings, then durable consequences. The score and return command stay owned
 * by the shared matchday header.
 */
export function MatchdayFullTimePhase({
  review,
  text,
}: MatchdayFullTimePhaseProps): React.JSX.Element {
  return (
    <section className="tls-match-centre-full-time" aria-labelledby="matchday-full-time-story-title">
      <FullTimeStory events={review.events} text={text} />
      <SelectedClubRatings
        clubName={review.selectedClubName}
        rows={review.ratings}
        text={text}
      />
      {review.consequences.length === 0 ? null : (
        <FullTimeConsequences consequences={review.consequences} text={text} />
      )}
    </section>
  );
}

function FullTimeStory({
  events,
  text,
}: Readonly<{
  events: readonly MatchdayPresentedEventView[];
  text: Translator;
}>): React.JSX.Element {
  const headlineEvents = events.filter((event) => event.isHeadline);
  const secondaryEvents = events.filter((event) => !event.isHeadline);

  return (
    <section className="tls-matchday-card tls-match-centre-full-time-story" aria-labelledby="matchday-full-time-story-title">
      <header className="tls-match-centre-card-heading">
        <div>
          <h2 id="matchday-full-time-story-title">{text("career.matchday.fullMatchTabellino")}</h2>
          <p>{text("career.matchday.fullMatchTabellinoHint")}</p>
        </div>
      </header>

      {events.length === 0 ? (
        <p className="tls-matchday-empty">{text("career.matchday.noFullTimeIncidents")}</p>
      ) : (
        <>
          <div className="tls-match-centre-full-time-headlines">
            {headlineEvents.map((event) => (
              <FullTimeEvent event={event} key={event.event.eventId} text={text} />
            ))}
          </div>
          {secondaryEvents.length === 0 ? null : (
            <div className="tls-match-centre-full-time-secondary-events">
              {secondaryEvents.map((event) => (
                <FullTimeEvent event={event} key={event.event.eventId} text={text} />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}

function FullTimeEvent({
  event,
  text,
}: Readonly<{
  event: MatchdayPresentedEventView;
  text: Translator;
}>): React.JSX.Element {
  return (
    <article
      aria-label={matchdayEventAccessibleLabel(event.event, text)}
      className={`tls-match-centre-full-time-event is-${event.visualPriority}`}
    >
      <span className="tls-match-centre-event-minute">{event.event.minute}'</span>
      <div>
        <strong>{text(event.event.labelKey as MessageKey)}</strong>
        <p>{event.event.club.name} - {formatMatchdayEventPlayerLine(event.event, text)}</p>
      </div>
    </article>
  );
}

function SelectedClubRatings({
  clubName,
  rows,
  text,
}: Readonly<{
  clubName: string;
  rows: readonly CareerMatchdayPhasePlayerView[];
  text: Translator;
}>): React.JSX.Element {
  return (
    <section className="tls-matchday-card tls-match-centre-full-time-ratings" aria-labelledby="matchday-full-time-ratings-title">
      <header className="tls-match-centre-card-heading">
        <div>
          <h2 id="matchday-full-time-ratings-title">{text("career.matchday.selectedClubRatings", { club: clubName })}</h2>
          <p>{text("career.matchday.selectedClubRatingsHint")}</p>
        </div>
      </header>

      {rows.length === 0 ? null : (
        <ol className="tls-match-centre-rating-list" aria-label={text("career.matchday.playerRatingsTable")}>
          {rows.map((row) => (
            <SelectedClubRating key={row.playerId} row={row} text={text} />
          ))}
        </ol>
      )}
    </section>
  );
}

function SelectedClubRating({
  row,
  text,
}: Readonly<{
  row: CareerMatchdayPhasePlayerView;
  text: Translator;
}>): React.JSX.Element {
  const contributions = playerContributions(row, text);
  const roleKey = fullTimeRoleLabelKey(row.roleKey);

  return (
    <li className="tls-match-centre-rating-row" data-rating-band={ratingBand(row.rating)}>
      <div className="tls-match-centre-rating-player">
        <strong>{row.playerName}</strong>
        {row.status === "on_pitch" ? null : (
          <small>{text(`career.matchday.playerStatus.${row.status}` as MessageKey)}</small>
        )}
      </div>
      {row.rating === undefined ? null : (
        <strong
          aria-label={`${text("career.matchday.table.rating")} ${row.rating.toFixed(1)}`}
          className="tls-match-centre-rating-value"
        >
          {row.rating.toFixed(1)}
        </strong>
      )}
      <dl className="tls-match-centre-rating-facts">
        {roleKey === undefined ? null : (
          <div>
            <dt>{text("career.matchday.table.role")}</dt>
            <dd>{text(roleKey)}</dd>
          </div>
        )}
        {row.condition === undefined ? null : (
          <div>
            <dt>{text("career.matchday.table.condition")}</dt>
            <dd>{row.condition}%</dd>
          </div>
        )}
        {contributions.length === 0 ? null : (
          <div className="tls-match-centre-rating-contribution">
            <dt>{text("career.matchday.table.contribution")}</dt>
            <dd>{contributions.join(" · ")}</dd>
          </div>
        )}
      </dl>
    </li>
  );
}

function FullTimeConsequences({
  consequences,
  text,
}: Readonly<{
  consequences: readonly MatchdayFullTimeConsequenceView[];
  text: Translator;
}>): React.JSX.Element {
  return (
    <section className="tls-matchday-card tls-match-centre-consequences" aria-labelledby="matchday-consequences-title">
      <header className="tls-match-centre-card-heading">
        <div>
          <h2 id="matchday-consequences-title">{text("career.matchday.postMatchConsequences")}</h2>
          <p>{text("career.matchday.postMatchConsequencesHint")}</p>
        </div>
      </header>
      <div className="tls-match-centre-consequence-list">
        {consequences.map((change) => (
          <FullTimeConsequence change={change} key={change.playerId} text={text} />
        ))}
      </div>
    </section>
  );
}

function FullTimeConsequence({
  change,
  text,
}: Readonly<{
  change: MatchdayFullTimeConsequenceView;
  text: Translator;
}>): React.JSX.Element {
  return (
    <article className="tls-match-centre-consequence-card">
      <strong>{change.playerName}</strong>
      <dl>
        {change.condition === undefined ? null : (
          <div>
            <dt>{text("career.matchday.conditionChanges")}</dt>
            <dd>{change.condition.after}% <span>{signed(change.condition.delta)}</span></dd>
          </div>
        )}
        {change.playerState === undefined || change.playerState.formDelta === 0 ? null : (
          <div>
            <dt>{text("career.matchday.form")}</dt>
            <dd>{change.playerState.formAfter} <span>{signed(change.playerState.formDelta)}</span></dd>
          </div>
        )}
        {change.playerState === undefined || change.playerState.moraleDelta === 0 ? null : (
          <div>
            <dt>{text("career.matchday.morale")}</dt>
            <dd>{change.playerState.moraleAfter} <span>{signed(change.playerState.moraleDelta)}</span></dd>
          </div>
        )}
      </dl>
      {change.playerState === undefined || change.playerState.reasonKeys.length === 0 ? null : (
        <small>
          {change.playerState.reasonKeys
            .map((reason) => text(`career.advance.playerStateReason.${reason}` as MessageKey))
            .join(", ")}
        </small>
      )}
    </article>
  );
}

function playerContributions(row: CareerMatchdayPhasePlayerView, text: Translator): readonly string[] {
  return [
    row.goals > 0 ? `${text("career.matchday.table.goals")} ${row.goals}` : "",
    row.assists > 0 ? `${text("career.matchday.table.assists")} ${row.assists}` : "",
    row.shotsOnTarget > 0 ? `${text("career.matchday.table.shotsOnTarget")} ${row.shotsOnTarget}` : "",
    row.saves > 0 ? `${text("career.matchday.table.saves")} ${row.saves}` : "",
    row.blocks > 0 ? `${text("career.matchday.table.blocks")} ${row.blocks}` : "",
  ].filter((value) => value.length > 0);
}

function ratingBand(rating: number | undefined): "strong" | "steady" | "warning" | "unavailable" {
  if (rating === undefined) return "unavailable";
  if (rating >= 7) return "strong";
  if (rating < 6) return "warning";
  return "steady";
}

function signed(value: number): string {
  return value > 0 ? `+${value}` : String(value);
}

function fullTimeRoleLabelKey(roleKey: string | undefined): MessageKey | undefined {
  if (roleKey === undefined) return undefined;

  if (roleKey === "gk" || roleKey === "goalkeeper") {
    return roleLabelKey("goalkeeper");
  }

  if ([
    "defender",
    "right_full_back",
    "center_back",
    "left_full_back",
    "full_back",
    "wing_back",
  ].includes(roleKey)) {
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
