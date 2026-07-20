import type { MessageKey, Translator } from "@game/i18n";
import type { CareerMatchdayPhaseEventView } from "@game/ui";
import { useReducedMotion } from "motion/react";
import * as m from "motion/react-m";

import { webMotion, webMotionTargets } from "../../shared/motion/web-motion";
import type {
  MatchdayTabellinoIncidentView,
  MatchdayTabellinoView,
} from "./career-matchday-presenter";

const SCROLL_THRESHOLD = 6;

/** Props for the single compact incident record shared by every match phase. */
export interface MatchdayTabellinoProps {
  /** Newest-first structured facts prepared for the two fixture sides. */
  readonly view: MatchdayTabellinoView;
  /** Active locale translator. */
  readonly text: Translator;
}

/**
 * Renders one newest-first football record below the score. An empty record
 * is intentionally omitted so pre-match never gains a decorative empty panel.
 */
export function MatchdayTabellino({
  view,
  text,
}: MatchdayTabellinoProps): React.JSX.Element | null {
  const reducedMotion = useReducedMotion();

  if (view.incidents.length === 0) return null;

  const hasBoundedOverflow = view.incidents.length > SCROLL_THRESHOLD;

  return (
    <section
      className="tls-match-tabellino"
      aria-labelledby="matchday-tabellino-title"
      data-has-overflow={hasBoundedOverflow}
    >
      <header className="tls-match-tabellino-header">
        <h2 id="matchday-tabellino-title">{text("career.matchday.fullMatchTabellino")}</h2>
        <div className="tls-match-tabellino-clubs" aria-hidden="true">
          <span>{view.homeClubName}</span>
          <span>{view.awayClubName}</span>
        </div>
      </header>

      <ol
        className="tls-match-tabellino-list"
        aria-label={text("career.matchday.fullMatchTabellino")}
        tabIndex={hasBoundedOverflow ? 0 : undefined}
      >
        {view.incidents.map((incident) => (
          <TabellinoIncident
            incident={incident}
            key={incident.event.eventId}
            reducedMotion={reducedMotion}
            text={text}
          />
        ))}
      </ol>
    </section>
  );
}

function TabellinoIncident({
  incident,
  reducedMotion,
  text,
}: Readonly<{
  incident: MatchdayTabellinoIncidentView;
  reducedMotion: boolean | null;
  text: Translator;
}>): React.JSX.Element {
  const narrativeMoment = incident.visualPriority === "goal";

  return (
    <m.li
      aria-label={matchdayEventAccessibleLabel(incident.event, text)}
      className={`tls-match-tabellino-incident is-${incident.visualPriority}`}
      data-motion-category={narrativeMoment ? "narrative" : "transition"}
      data-motion-incident={incident.event.eventId}
      data-incident-kind={incident.event.kind}
      data-side={incident.side}
      initial={reducedMotion
        ? false
        : narrativeMoment
          ? webMotionTargets.matchTabellinoGoalEnter
          : webMotionTargets.matchTabellinoSecondaryEnter}
      transition={narrativeMoment ? webMotion.narrative : webMotion.transition}
      animate={webMotionTargets.rest}
    >
      <time aria-hidden="true">{incident.event.minute}'</time>
      <div className="tls-match-tabellino-incident-copy">
        <span
          aria-hidden="true"
          className="tls-match-tabellino-incident-icon"
          data-incident-kind={incident.event.kind}
        >
          {incidentSymbol(incident.event.kind)}
        </span>
        <span>{text(incident.event.labelKey as MessageKey)}</span>
        <strong>{formatMatchdayEventPlayerLine(incident.event, text)}</strong>
        <small>{incident.event.club.name}</small>
      </div>
    </m.li>
  );
}

/** Formats available player context without creating missing event facts. */
export function formatMatchdayEventPlayerLine(
  event: CareerMatchdayPhaseEventView,
  text: Translator,
): string {
  if (event.playerName === undefined) return text("common.unknown");
  if (event.secondaryPlayerName === undefined) return event.playerName;
  if (event.kind === "substitution") {
    return text("career.matchday.substitution.eventLine", {
      incoming: event.playerName,
      outgoing: event.secondaryPlayerName,
    });
  }
  return `${event.playerName} (${event.secondaryPlayerName})`;
}

function incidentSymbol(kind: CareerMatchdayPhaseEventView["kind"]): string {
  switch (kind) {
    case "goal":
    case "penalty_goal":
      return "⚽";
    case "penalty":
    case "penalty_miss":
    case "penalty_save":
      return "P";
    case "yellow_card":
    case "red_card":
    case "second_yellow":
      return "■";
    case "injury":
      return "+";
    case "substitution":
      return "↕";
    default:
      return "·";
  }
}

/** Builds the localized screen-reader label for one structured incident. */
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
