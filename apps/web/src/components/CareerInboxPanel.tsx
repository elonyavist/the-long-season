import type { MessageKey, Translator } from "@game/i18n";
import type {
  CareerInboxView,
  CareerInboxViewPriority,
  CareerInboxViewStatus,
} from "@game/ui";

/** Props for the compact dashboard Inbox / Posta panel. */
export type CareerInboxPanelProps = Readonly<{
  view: CareerInboxView;
  text: Translator;
  onActionClick?: (actionId: string) => void;
}>;

/** Renders manager attention messages without becoming a full mail client. */
export function CareerInboxPanel({ view, text, onActionClick }: CareerInboxPanelProps): React.JSX.Element {
  return (
    <section className="tls-dashboard-inbox" aria-label={text("career.inbox.title")} data-testid="career-inbox-panel">
      <header className="tls-dashboard-inbox-header">
        <h2>{text("career.inbox.title")}</h2>
        <dl>
          <div>
            <dt>{text("career.inbox.unreadCount")}</dt>
            <dd>{view.unreadCount}</dd>
          </div>
          <div>
            <dt>{text("career.inbox.actionRequiredCount")}</dt>
            <dd>{view.actionRequiredCount}</dd>
          </div>
        </dl>
      </header>

      {view.messages.length === 0 ? (
        <p className="tls-dashboard-line">{text(view.emptyStateKey as MessageKey)}</p>
      ) : (
        <ul className="tls-dashboard-inbox-list">
          {view.messages.map((message) => (
            <li className="tls-dashboard-inbox-message" key={message.messageId}>
              <div className="tls-dashboard-inbox-meta">
                <span>{message.dateIso}</span>
                <span>{text(priorityLabelKey(message.priority))}</span>
                <span>{text(statusLabelKey(message.status))}</span>
              </div>
              <strong>{text(message.titleKey as MessageKey)}</strong>
              <p>{text(message.summaryKey as MessageKey)}</p>
              {message.actions.length === 0 ? null : (
                <div className="tls-dashboard-inbox-actions">
                  {message.actions.map((action) => (
                    <button
                      className="tls-dashboard-inbox-action"
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
          ))}
        </ul>
      )}
    </section>
  );
}

function priorityLabelKey(priority: CareerInboxViewPriority): MessageKey {
  return `career.inbox.priority.${priority}`;
}

function statusLabelKey(status: CareerInboxViewStatus): MessageKey {
  return `career.inbox.status.${status}`;
}
