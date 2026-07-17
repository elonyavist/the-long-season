import type { MessageKey, Translator } from "@game/i18n";
import type { CareerInboxView } from "@game/ui";

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
  const primaryMessage = inboxView.messages[0];
  const headline = primaryMessage === undefined
    ? text(inboxView.emptyStateKey as MessageKey)
    : text(primaryMessage.titleKey as MessageKey);

  return (
    <section
      className="tls-app-shell-posta"
      aria-labelledby="tls-posta-title"
      data-action-required={inboxView.actionRequiredCount > 0}
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
    </section>
  );
}
