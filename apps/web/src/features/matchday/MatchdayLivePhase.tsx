/** Focused live-match composition shared by first- and second-half playback. */
import type { MessageKey, Translator } from "@game/i18n";
import type {
  CareerMatchdayPhaseEventView,
  CareerMatchdayPhaseView,
} from "@game/ui";

import type {
  CareerMatchdayPresentationView,
  MatchdayPresentedEventView,
} from "./career-matchday-presenter";
import type { MatchdayPlaybackStage } from "./matchday-playback";

/** Props for the compact football-first live phase composition. */
export interface MatchdayLivePhaseProps {
  /** Current presentation-only phase facts. */
  readonly phaseView: CareerMatchdayPhaseView;
  /** Grouped event hierarchy derived by the presenter. */
  readonly presentation: CareerMatchdayPresentationView;
  /** Current localized live line. */
  readonly liveLine: string;
  /** Web translator used only at render time. */
  readonly text: Translator;
  /** Optional period frame state used by visual QA and styling. */
  readonly playbackStage?: MatchdayPlaybackStage;
}

/** Renders a live football phase without exposing technical engine facts. */
export function MatchdayLivePhase({
  phaseView,
  presentation,
  liveLine,
  text,
  playbackStage,
}: MatchdayLivePhaseProps): React.JSX.Element {
  const eventGroups = presentation.eventGroups;

  return (
    <section
      className="tls-matchday-card tls-match-centre-live-phase"
      aria-labelledby="matchday-live-title"
      data-playback-stage={playbackStage}
    >
      <div className="tls-match-centre-card-heading">
        <div>
          <h2 id="matchday-live-title">{text(phaseView.periodLabelKey as MessageKey)}</h2>
          <p>{liveLine}</p>
        </div>
        <span>{matchdayMinuteLabel(phaseView.currentMinute, text)}</span>
      </div>

      <p className="tls-visually-hidden" role="status" aria-live="polite" aria-atomic="true">
        {liveLine}
      </p>

      {phaseView.phase === "second_half" ? (
        <MatchPressureStrip phaseView={phaseView} presentation={presentation} text={text} />
      ) : null}

      {eventGroups.hasTabellino || eventGroups.hasLiveFeed ? (
        <div className="tls-match-centre-live-feed">
          {eventGroups.tabellino.map((event) => (
            <MatchdayLiveEventCard event={event} key={event.event.eventId} text={text} />
          ))}
          {eventGroups.liveFeed.map((event) => (
            <MatchdayLiveEventCard event={event} key={event.event.eventId} text={text} />
          ))}
        </div>
      ) : (
        <p className="tls-matchday-empty">{text("career.matchday.noEvents")}</p>
      )}
    </section>
  );
}

/** Renders one structured live event with football-first visual hierarchy. */
export function MatchdayLiveEventCard({
  event,
  text,
}: Readonly<{
  event: MatchdayPresentedEventView;
  text: Translator;
}>): React.JSX.Element {
  return (
    <article
      aria-label={matchdayEventAccessibleLabel(event.event, text)}
      className={`tls-match-centre-live-event is-${event.visualPriority}`}
    >
      <span className="tls-match-centre-event-minute">{event.event.minute}'</span>
      <span className="tls-match-centre-event-kind">{text(event.event.labelKey as MessageKey)}</span>
      <strong>{event.event.club.name}</strong>
      <p>{formatMatchdayEventPlayerLine(event.event, text)}</p>
    </article>
  );
}

/** Formats the available player names without inventing missing event facts. */
export function formatMatchdayEventPlayerLine(
  event: CareerMatchdayPhaseEventView,
  text: Translator,
): string {
  if (event.playerName === undefined) return text("common.unknown");
  if (event.secondaryPlayerName === undefined) return event.playerName;
  return `${event.playerName} (${event.secondaryPlayerName})`;
}

/** Builds the localized accessible label for one structured match event. */
export function matchdayEventAccessibleLabel(
  event: CareerMatchdayPhaseEventView,
  text: Translator,
): string {
  return text("career.matchday.eventLine", {
    minute: event.minute,
    kind: text(event.labelKey as MessageKey),
    club: event.club.name,
    player: formatMatchdayEventPlayerLine(event, text),
  });
}

function MatchPressureStrip({
  phaseView,
  presentation,
  text,
}: Readonly<{
  phaseView: CareerMatchdayPhaseView;
  presentation: CareerMatchdayPresentationView;
  text: Translator;
}>): React.JSX.Element {
  return (
    <section className="tls-match-centre-pressure-strip" aria-label={text("career.matchday.matchPressure")}>
      <LiveFact
        label={text("career.matchday.scoreState.label")}
        value={text(`career.matchday.scoreState.${phaseView.scoreboard.selectedClubScoreState}` as MessageKey)}
      />
      <LiveFact label={text("career.matchday.halfTimeTabellino")} value={`${presentation.eventGroups.tabellino.length}`} />
      <LiveFact label={text("career.matchday.events")} value={`${presentation.eventGroups.liveFeed.length}`} />
    </section>
  );
}

function LiveFact({ label, value }: Readonly<{ label: string; value: string }>): React.JSX.Element {
  return (
    <div className="tls-matchday-fact">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function matchdayMinuteLabel(minute: number, text: Translator): string {
  return minute === 0 ? text("career.matchday.notStarted") : `${minute}'`;
}
