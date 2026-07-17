import type { MessageKey, Translator } from "@game/i18n";
import type { CareerPostaDetailView } from "@game/ui";

/** Props for the selected current-season Posta message. */
export interface InboxMessageDetailProps {
  readonly message: CareerPostaDetailView | undefined;
  readonly disabled?: boolean;
  readonly text: Translator;
  readonly onBack: () => void;
  readonly onPrimaryAction: (actionId: string) => void;
}

/** Renders football facts, blockers, and one manager destination. */
export function InboxMessageDetail({
  message,
  disabled = false,
  text,
  onBack,
  onPrimaryAction,
}: InboxMessageDetailProps): React.JSX.Element {
  if (message === undefined) {
    return <p className="tls-inbox-empty-state">{text("career.inbox.detail.empty")}</p>;
  }

  const primaryAction = message.primaryAction;
  return (
    <article
      className="tls-inbox-message-detail"
      data-level={message.level}
      data-status-key={message.statusKey}
    >
      <button className="tls-inbox-back" disabled={disabled} type="button" onClick={onBack}>
        <span aria-hidden="true">←</span> {text("career.inbox.backToMessages")}
      </button>

      <header className="tls-inbox-detail-header">
        <div className="tls-inbox-detail-context">
          <p className="tls-inbox-detail-origin">
            <span>{text(message.sourceKey as MessageKey)}</span>
            <time dateTime={message.dateIso}>{message.dateIso}</time>
          </p>
          <div className="tls-inbox-detail-badges">
            <span className="tls-inbox-detail-level" data-level={message.level}>
              {text(`career.inbox.level.${message.level}` as MessageKey)}
            </span>
            <span className="tls-inbox-detail-lifecycle">{text(message.statusKey as MessageKey)}</span>
          </div>
        </div>
        <h2 data-inbox-detail-title tabIndex={-1}>{text(message.subjectKey as MessageKey)}</h2>
        <p>{text(message.previewKey as MessageKey)}</p>
      </header>

      {message.factRows.length === 0 ? null : (
        <section className="tls-inbox-detail-section" aria-labelledby="career-inbox-match-facts">
          <h3 id="career-inbox-match-facts">{text("career.inbox.matchFacts")}</h3>
          <dl className="tls-inbox-football-facts">
            {message.factRows.map((row) => (
              <div key={row.labelKey}>
                <dt>{text(row.labelKey as MessageKey)}</dt>
                <dd>{row.valueKey === undefined
                  ? row.value
                  : text(row.valueKey as MessageKey)}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {message.blockerLabelKeys.length === 0 ? null : (
        <section className="tls-inbox-detail-section tls-inbox-blocker-section" aria-labelledby="career-inbox-blockers-heading">
          <h3 id="career-inbox-blockers-heading">{text("career.inbox.blockers")}</h3>
          <ul>
            {message.blockerLabelKeys.map((key) => <li key={key}>{text(key as MessageKey)}</li>)}
          </ul>
        </section>
      )}

      {primaryAction === undefined ? null : (
        <footer className="tls-inbox-detail-action">
          <button
            className="tls-menu-button tls-menu-button-primary"
            disabled={disabled}
            type="button"
            onClick={() => onPrimaryAction(primaryAction.actionId)}
          >
            {text(primaryAction.labelKey as MessageKey)}
          </button>
        </footer>
      )}
    </article>
  );
}
