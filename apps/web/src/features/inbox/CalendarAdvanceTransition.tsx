import type { Translator } from "@game/i18n";
import * as m from "motion/react-m";

import { webMotion, webMotionTargets } from "../../shared/motion/web-motion";

/** Minimal presentation state exposed by the career UI adapter. */
export type CalendarAdvancePresentation = Readonly<{
  visibleDateIso: string;
  stopDateIso: string;
  status: "advancing" | "complete";
}>;

/**
 * Shows elapsed game time without pretending that the engine is still working.
 * Intermediate dates stay hidden from assistive technology. The app shell's
 * existing command live region owns the single completion announcement.
 */
export function CalendarAdvanceTransition({
  transition,
  text,
}: Readonly<{
  transition: CalendarAdvancePresentation | undefined;
  text: Translator;
}>): React.JSX.Element | null {
  if (transition === undefined) return null;

  if (transition.status === "complete") return null;

  return (
    <div className="tls-calendar-advance-transition" data-status={transition.status} aria-hidden="true">
      <div className="tls-calendar-advance-visual">
        <span>{text("career.calendarAdvance.label")}</span>
        <m.time
          animate={webMotionTargets.rest}
          data-motion-calendar-date="true"
          dateTime={transition.visibleDateIso}
          initial={webMotionTargets.footballContextEnter}
          key={transition.visibleDateIso}
          transition={webMotion.transition}
        >
          {transition.visibleDateIso}
        </m.time>
      </div>
    </div>
  );
}
