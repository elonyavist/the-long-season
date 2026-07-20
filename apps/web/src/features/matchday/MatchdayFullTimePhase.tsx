import { useState } from "react";
import { ChartNoAxesCombined, Shield, Shirt } from "lucide-react";
import type { Translator } from "@game/i18n";
import { useReducedMotion } from "motion/react";
import * as m from "motion/react-m";

import { webMotion, webMotionTargets } from "../../shared/motion/web-motion";

import type { MatchdayFullTimeReviewView } from "./career-matchday-presenter";
import {
  MatchdayPhaseTabs,
  type MatchdayPhaseTabItem,
} from "./MatchdayPhaseTabs";
import { MatchdayStatistics } from "./MatchdayStatistics";
import { MatchdayTeamRatings } from "./MatchdayTeamRatings";

type FullTimeTabId = "summary" | "selected_team" | "opponent";

/** Props for the composition-only full-time football review. */
export type MatchdayFullTimePhaseProps = Readonly<{
  /** True only when live playback has just settled at full time in this session. */
  animateEntry?: boolean;
  review: MatchdayFullTimeReviewView;
  text: Translator;
}>;

/**
 * Keeps final match context above one focused review panel. The default view
 * opens on the match summary; tab state is presentation-only.
 */
export function MatchdayFullTimePhase({
  animateEntry = false,
  review,
  text,
}: MatchdayFullTimePhaseProps): React.JSX.Element {
  const reducedMotion = useReducedMotion();
  const animateCheckpoint = animateEntry && !reducedMotion;
  const [activeTabId, setActiveTabId] = useState<FullTimeTabId>("summary");
  const tabs: readonly MatchdayPhaseTabItem<FullTimeTabId>[] = [
    {
      tabId: "summary",
      label: text("career.matchday.fullTimeTab.summary"),
      icon: ChartNoAxesCombined,
      panel: (
        <section className="tls-matchday-card" aria-label={text("career.matchday.fullTimeSummary")}>
          <header className="tls-match-centre-card-heading">
            <div>
              <h2>{text("career.matchday.fullTimeSummary")}</h2>
              <p>{text("career.matchday.fullTimeSummaryHint")}</p>
            </div>
          </header>
          {review.statistics === undefined ? (
            <p className="tls-matchday-empty">{text("career.matchday.statistics.unavailable")}</p>
          ) : (
            <MatchdayStatistics mode="complete" text={text} view={review.statistics} />
          )}
        </section>
      ),
    },
    {
      tabId: "selected_team",
      label: text("career.matchday.fullTimeTab.selectedTeam"),
      icon: Shirt,
      panel: (
        <MatchdayTeamRatings
          clubName={review.selectedClubName}
          consequences={review.selectedTeamConsequences}
          rows={review.selectedTeamPlayers}
          text={text}
          variant="final"
        />
      ),
    },
    {
      tabId: "opponent",
      label: text("career.matchday.fullTimeTab.opponent"),
      icon: Shield,
      panel: (
        <MatchdayTeamRatings
          clubName={review.opponentClubName}
          consequences={review.opponentConsequences}
          rows={review.opponentPlayers}
          text={text}
          variant="final"
        />
      ),
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
