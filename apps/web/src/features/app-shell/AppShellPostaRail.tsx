import type { MessageKey, Translator } from "@game/i18n";
import type { CareerInboxView } from "@game/ui";
import { useEffect, useRef, useState } from "react";
import * as m from "motion/react-m";

import { webMotion, webMotionTargets } from "../../shared/motion/web-motion";

/** Props for the persistent compact Posta awareness rail. */
export type AppShellPostaRailProps = Readonly<{
  inboxView: CareerInboxView;
  text: Translator;
  onOpen?: () => void;
}>;

/** Renders compact awareness only; football actions live in the Posta screen. */
export function AppShellPostaRail({
  inboxView,
  text,
  onOpen,
}: AppShellPostaRailProps): React.JSX.Element {
  const previousCountsRef = useRef({
    actionRequiredCount: inboxView.actionRequiredCount,
    unreadCount: inboxView.unreadCount,
  });
  const [attentionCue, setAttentionCue] = useState(false);
  const primaryMessage = inboxView.messages[0];
  const headline = primaryMessage === undefined
    ? text(inboxView.emptyStateKey as MessageKey)
    : text(primaryMessage.titleKey as MessageKey);

  useEffect(() => {
    const previous = previousCountsRef.current;
    const increased = inboxView.actionRequiredCount > previous.actionRequiredCount
      || inboxView.unreadCount > previous.unreadCount;
    previousCountsRef.current = {
      actionRequiredCount: inboxView.actionRequiredCount,
      unreadCount: inboxView.unreadCount,
    };
    if (increased) setAttentionCue(true);
  }, [inboxView.actionRequiredCount, inboxView.unreadCount]);

  return (
    <m.section
      className="tls-app-shell-posta"
      aria-labelledby="tls-posta-title"
      data-action-required={inboxView.actionRequiredCount > 0}
      data-attention-cue={attentionCue}
      initial={false}
      animate={attentionCue ? webMotionTargets.attentionCue : webMotionTargets.rest}
      transition={webMotion.narrative}
      onAnimationComplete={() => {
        if (attentionCue) setAttentionCue(false);
      }}
    >
      <header className="tls-app-shell-posta-header">
        <h2 className="tls-app-shell-posta-label" id="tls-posta-title">
          <span className="tls-app-shell-posta-dot" aria-hidden="true" />
          {text("career.inbox.title")}
        </h2>
        <span
          className="tls-app-shell-attention-count"
          data-has-actions={inboxView.actionRequiredCount > 0}
          aria-label={`${text("career.inbox.actionRequiredCount")}: ${inboxView.actionRequiredCount}`}
        >
          {inboxView.actionRequiredCount}
        </span>
      </header>
      {onOpen === undefined ? (
        <strong className="tls-app-shell-posta-subject">{headline}</strong>
      ) : (
        <button className="tls-app-shell-posta-subject tls-app-shell-posta-open" type="button" onClick={onOpen}>
          {headline}
        </button>
      )}
      <dl className="tls-app-shell-inbox-counts">
        <div>
          <dt>{text("career.inbox.unreadCount")}</dt>
          <dd>{inboxView.unreadCount}</dd>
        </div>
      </dl>
    </m.section>
  );
}
