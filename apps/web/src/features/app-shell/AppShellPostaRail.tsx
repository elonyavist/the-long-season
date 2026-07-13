import type { MessageKey, Translator } from "@game/i18n";
import type { CareerInboxMessageView, CareerInboxView } from "@game/ui";

/** Props for the persistent right-rail Posta summary. */
export type AppShellPostaRailProps = Readonly<{
  inboxView: CareerInboxView;
  showContinueHint: boolean;
  text: Translator;
  onActionClick?: (actionId: string) => void;
}>;

/** Renders the compact manager-attention surface shown beside career screens. */
export function AppShellPostaRail({
  inboxView,
  showContinueHint,
  text,
  onActionClick,
}: AppShellPostaRailProps): React.JSX.Element {
  const visibleMessages = inboxView.messages.slice(0, 2);
  const primaryMessage = visibleMessages[0];
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
        <div>
          <p>{text("career.inbox.title")}</p>
          <h2 id="tls-posta-title">{headline}</h2>
        </div>
        <span
          className="tls-app-shell-attention-count"
          data-has-actions={inboxView.actionRequiredCount > 0}
          aria-label={`${text("career.inbox.actionRequiredCount")}: ${inboxView.actionRequiredCount}`}
        >
          {inboxView.actionRequiredCount}
        </span>
      </header>

      {showContinueHint ? (
        <p className="tls-app-shell-posta-hint">{text("career.shell.continueToNextStop")}</p>
      ) : null}

      <dl className="tls-app-shell-inbox-counts">
        <div>
          <dt>{text("career.inbox.unreadCount")}</dt>
          <dd>{inboxView.unreadCount}</dd>
        </div>
        <div>
          <dt>{text("career.inbox.actionRequiredCount")}</dt>
          <dd>{inboxView.actionRequiredCount}</dd>
        </div>
      </dl>

      {visibleMessages.length === 0 ? (
        <p className="tls-app-shell-empty">{text(inboxView.emptyStateKey as MessageKey)}</p>
      ) : (
        <ul className="tls-app-shell-message-list">
          {visibleMessages.map((message) => (
            <PostaMessage
              key={message.messageId}
              message={message}
              text={text}
              {...(onActionClick === undefined ? {} : { onActionClick })}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function PostaMessage({
  message,
  onActionClick,
  text,
}: Readonly<{
  message: CareerInboxMessageView;
  onActionClick?: (actionId: string) => void;
  text: Translator;
}>): React.JSX.Element {
  return (
    <li className="tls-app-shell-message" data-action-required={message.actionRequired}>
      <div className="tls-app-shell-message-meta">
        <span className="tls-app-shell-message-date">{message.dateIso}</span>
      </div>
      <strong>{text(message.titleKey as MessageKey)}</strong>
      <p>{text(message.summaryKey as MessageKey)}</p>
      {message.actions.length === 0 ? null : (
        <div className="tls-app-shell-message-actions">
          {message.actions.map((action) => (
            <button
              className="tls-app-shell-message-action"
              key={action.actionId}
              type="button"
              onClick={() => {
                onActionClick?.(action.actionId);
              }}
            >
              {text(action.labelKey as MessageKey)}
            </button>
          ))}
        </div>
      )}
    </li>
  );
}
