/** Focused live-match composition shared by first- and second-half playback. */
import { useReducedMotion } from "motion/react";
import * as m from "motion/react-m";

import { webMotion, webMotionTargets } from "../../shared/motion/web-motion";
import type { MatchdayLiveMomentView } from "./career-matchday-presenter";

/** Props for the single commentary line placed directly below the score. */
export interface MatchdayLiveCommentaryProps {
  /** Localized deterministic wording for the current structured moment. */
  readonly line: string;
  /** Current structured event hierarchy, or an intentional transition. */
  readonly moment: MatchdayLiveMomentView;
}

/** Renders one replace-in-place polite live region without an event log. */
export function MatchdayLiveCommentary({
  line,
  moment,
}: MatchdayLiveCommentaryProps): React.JSX.Element {
  const reducedMotion = useReducedMotion();
  const commentaryKey = moment.event?.event.eventId
    ?? `checkpoint:${line}`;
  const narrativeMoment = moment.visualPriority === "goal";

  return (
    <m.p
      aria-atomic="true"
      aria-live="polite"
      className="tls-match-broadcast-live-line"
      data-commentary-priority={moment.visualPriority}
      {...(moment.event === undefined ? {} : { "data-event-id": moment.event.event.eventId })}
      data-motion-commentary-key={commentaryKey}
      data-motion-category={narrativeMoment ? "narrative" : "transition"}
      initial={reducedMotion
        ? false
        : narrativeMoment
          ? webMotionTargets.matchGoalCommentaryEnter
          : webMotionTargets.matchCommentaryEnter}
      key={commentaryKey}
      role="status"
      transition={narrativeMoment ? webMotion.narrative : webMotion.transition}
      animate={webMotionTargets.rest}
    >
      {line}
    </m.p>
  );
}
