import type { MessageKey, Translator } from "@game/i18n";
import type { CareerPostaListItemView } from "@game/ui";

/** Props for the dense, scrollable current-season Posta list. */
export interface InboxMessageListProps {
  readonly messages: readonly CareerPostaListItemView[];
  readonly emptyStateKey: string;
  readonly disabled?: boolean;
  readonly text: Translator;
  readonly onSelect: (messageId: string) => void;
}

/** Renders message rows as one continuous manager workspace, not cards. */
export function InboxMessageList({
  messages,
  emptyStateKey,
  disabled = false,
  text,
  onSelect,
}: InboxMessageListProps): React.JSX.Element {
  if (messages.length === 0) {
    return <p className="tls-inbox-empty-state">{text(emptyStateKey as MessageKey)}</p>;
  }

  return (
    <ul className="tls-inbox-message-list">
      {messages.map((message) => (
        <li key={message.messageId}>
          <button
            aria-current={message.selected ? "true" : undefined}
            className="tls-inbox-message-row"
            data-level={message.level}
            data-selected={message.selected}
            data-to-handle={message.toHandle}
            data-unread={message.unread}
            disabled={disabled}
            type="button"
            onClick={() => onSelect(message.messageId)}
          >
            <span className="tls-visually-hidden">
              {text(`career.inbox.level.${message.level}` as MessageKey)}. {message.unread ? text("career.inbox.unreadMarker") : ""}
            </span>
            <span className="tls-inbox-message-meta">
              <span>{text(message.sourceKey as MessageKey)}</span>
              <time dateTime={message.dateIso}>{message.dateIso}</time>
            </span>
            <span className="tls-inbox-message-subject">
              {message.unread ? <span className="tls-inbox-unread-dot" aria-hidden="true" /> : null}
              <strong>{text(message.subjectKey as MessageKey)}</strong>
            </span>
            <span className="tls-inbox-message-preview">{text(message.previewKey as MessageKey)}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
