import { useState } from "react";
import type { MessageKey, Translator } from "@game/i18n";
import { useReducedMotion } from "motion/react";
import * as m from "motion/react-m";

import { webMotion, webMotionTargets } from "../../shared/motion/web-motion";

import type {
  MatchdayFullTimeConsequenceView,
  MatchdayFullTimeReviewView,
} from "./career-matchday-presenter";
import {
  MatchdayPhaseTabs,
  type MatchdayPhaseTabItem,
} from "./MatchdayPhaseTabs";
import { MatchdayTeamRatings } from "./MatchdayTeamRatings";

type FullTimeTabId = "selected_team" | "opponent" | "consequences";

/** Props for the composition-only full-time football review. */
export type MatchdayFullTimePhaseProps = Readonly<{
  /** True only when live playback has just settled at full time in this session. */
  animateEntry?: boolean;
  review: MatchdayFullTimeReviewView;
  text: Translator;
}>;

/**
 * Keeps final match context above one focused review panel. The default view
 * answers how the manager's own team performed; tab state is presentation-only.
 */
export function MatchdayFullTimePhase({
  animateEntry = false,
  review,
  text,
}: MatchdayFullTimePhaseProps): React.JSX.Element {
  const reducedMotion = useReducedMotion();
  const animateCheckpoint = animateEntry && !reducedMotion;
  const [activeTabId, setActiveTabId] = useState<FullTimeTabId>("selected_team");
  const tabs: readonly MatchdayPhaseTabItem<FullTimeTabId>[] = [
    {
      tabId: "selected_team",
      label: text("career.matchday.fullTimeTab.selectedTeam"),
      panel: (
        <MatchdayTeamRatings
          clubName={review.selectedClubName}
          rows={review.selectedTeamPlayers}
          text={text}
          variant="final"
        />
      ),
    },
    {
      tabId: "opponent",
      label: text("career.matchday.fullTimeTab.opponent"),
      panel: (
        <MatchdayTeamRatings
          clubName={review.opponentClubName}
          rows={review.opponentPlayers}
          text={text}
          variant="final"
        />
      ),
    },
    {
      tabId: "consequences",
      label: text("career.matchday.fullTimeTab.consequences"),
      panel: <FullTimeConsequences consequences={review.consequences} text={text} />,
    },
  ];

  return (
    <m.section
      animate={webMotionTargets.rest}
      aria-label={text("career.matchday.fullTimeReview")}
      className="tls-match-centre-full-time"
      data-motion-active={animateCheckpoint}
      data-motion-checkpoint-panel="full_time"
      initial={animateCheckpoint ? webMotionTargets.matchReviewEnter : false}
      transition={webMotion.transition}
    >
      <MatchdayPhaseTabs
        activeTabId={activeTabId}
        ariaLabel={text("career.matchday.fullTimeTabs")}
        tabs={tabs}
        onActiveTabChange={setActiveTabId}
      />
    </m.section>
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
      {consequences.length === 0 ? (
        <p className="tls-matchday-empty">{text("career.matchday.noPostMatchConsequences")}</p>
      ) : (
        <div className="tls-match-centre-consequence-list">
          {consequences.map((change) => (
            <FullTimeConsequence change={change} key={change.playerId} text={text} />
          ))}
        </div>
      )}
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

function signed(value: number): string {
  return value > 0 ? `+${value}` : String(value);
}
