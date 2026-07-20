import * as m from "motion/react-m";

import { webMotion, webMotionTargets } from "../../shared/motion/web-motion";

/** Props for the current game date shown beside the club identity. */
export type CareerCurrentDateProps = Readonly<{
  dateIso: string;
  label: string;
  advancing: boolean;
}>;

/**
 * Shows the authoritative career date and gives each simulated day one subtle tick.
 * The command live region remains the single owner of spoken completion feedback.
 */
export function CareerCurrentDate({
  dateIso,
  label,
  advancing,
}: CareerCurrentDateProps): React.JSX.Element {
  return (
    <m.time
      animate={webMotionTargets.rest}
      className="tls-career-shell-date"
      data-advancing={advancing ? "true" : "false"}
      data-motion-calendar-date="true"
      dateTime={dateIso}
      initial={advancing ? webMotionTargets.calendarDateTickEnter : false}
      key={dateIso}
      transition={webMotion.transition}
    >
      <span className="tls-visually-hidden">{label}: </span>
      {dateIso}
    </m.time>
  );
}
