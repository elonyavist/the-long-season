import type { MessageKey, Translator } from "@game/i18n";
import { buildCareerShellView, type CareerInboxView, type CareerPostaFilter, type CareerPostaView,
  type CareerShellSectionKey,
} from "@game/ui";
import { useEffect, useRef, useState } from "react";
import * as m from "motion/react-m";

import type { CareerCommandActivity } from "../../stores/career-ui-store";
import { AppShell } from "../app-shell/AppShell";
import { CareerScreenHeader } from "../shared/CareerScreenHeader";
import { CommandActivityIndicator } from "../shared/CommandActivityIndicator";
import { InboxMessageDetail } from "./InboxMessageDetail";
import { InboxMessageList } from "./InboxMessageList";
import { webMotion, webMotionTargets } from "../../shared/motion/web-motion";

/** Props for the first production Posta list/detail destination. */
export interface CareerInboxScreenProps {
  readonly selectedClubName: string;
  readonly currentDateIso: string;
  readonly postaView: CareerPostaView;
  readonly railView: CareerInboxView;
  readonly commandActivity?: CareerCommandActivity;
  readonly arrivalMessageId?: string;
  readonly text: Translator;
  readonly onBackToMenu: () => void;
  readonly onNavigate: (sectionKey: CareerShellSectionKey) => void;
  readonly onContinueCareer: () => void;
  readonly onFilterChange: (filter: CareerPostaFilter) => void;
  readonly onMessageSelect: (messageId: string) => void;
  readonly onPrimaryAction: (actionId: string) => void;
  readonly onArrivalPresented?: (messageId: string) => void;
}

/** Renders the production Posta decision centre inside the shared career shell. */
export function CareerInboxScreen({
  selectedClubName,
  currentDateIso,
  postaView,
  railView,
  commandActivity,
  arrivalMessageId,
  text,
  onBackToMenu,
  onNavigate,
  onContinueCareer,
  onFilterChange,
  onMessageSelect,
  onPrimaryAction,
  onArrivalPresented,
}: CareerInboxScreenProps): React.JSX.Element {
  const shellView = buildCareerShellView({ activeSectionKey: "inbox", inboxView: railView });
  const selectedMessage = postaView.selectedMessage;
  const [showNarrowDetail, setShowNarrowDetail] = useState(false);
  const listPaneRef = useRef<HTMLElement>(null);
  const detailPaneRef = useRef<HTMLElement>(null);
  const detailWasOpenRef = useRef(false);
  const commandPending = commandActivity?.status === "pending";
  const selectedMessageId = selectedMessage?.messageId;
  const selectedMessageIsArrival = selectedMessageId !== undefined
    && selectedMessageId === arrivalMessageId;

  useEffect(() => {
    if (showNarrowDetail) {
      detailPaneRef.current?.querySelector<HTMLElement>("[data-inbox-detail-title]")?.focus();
    } else if (detailWasOpenRef.current) {
      listPaneRef.current?.querySelector<HTMLButtonElement>("[aria-current='true']")?.focus();
    }
    detailWasOpenRef.current = showNarrowDetail;
  }, [postaView.selectedMessageId, showNarrowDetail]);

  return (
    <AppShell
      shellView={shellView}
      selectedClubName={selectedClubName}
      currentDateIso={currentDateIso}
      text={text}
      onBackToMenu={onBackToMenu}
      onNavigate={onNavigate}
    >
      <section
        className="tls-screen tls-inbox-screen"
        data-state={commandPending ? "pending" : "idle"}
        aria-labelledby="career-inbox-heading"
        aria-busy={commandPending}
      >
        <CareerScreenHeader
          className="tls-screen-header"
          command={(
            <button
              className="tls-menu-button tls-menu-button-primary tls-inbox-primary-action"
              data-state={commandPending ? "pending" : "idle"}
              disabled={commandPending}
              type="button"
              onClick={onContinueCareer}
            >
              <CommandActivityIndicator
                activity={commandActivity}
                commandIds={["continue_career"]}
                idleLabel={text("career.dashboard.continue")}
                text={text}
              />
            </button>
          )}
          supporting={(
            <dl className="tls-inbox-summary-counts">
              <div><dt>{text("career.inbox.unreadCount")}</dt><dd>{postaView.unreadCount}</dd></div>
              <div><dt>{text("career.inbox.actionRequiredCount")}</dt><dd>{postaView.toHandleCount}</dd></div>
            </dl>
          )}
          title={text("career.inbox.title")}
          titleId="career-inbox-heading"
        />

        <div
          className="tls-inbox-filters"
          aria-label={text("career.inbox.filters")}
          inert={commandPending ? true : undefined}
        >
          {postaView.filters.map((filter) => (
            <button
              aria-pressed={filter === postaView.activeFilter}
              className="tls-menu-button"
              disabled={commandPending}
              key={filter}
              type="button"
              onClick={() => {
                setShowNarrowDetail(false);
                onFilterChange(filter);
              }}
            >
              {text(`career.inbox.filter.${filter}` as MessageKey)}
            </button>
          ))}
        </div>

        <div
          className="tls-inbox-workspace"
          data-narrow-detail={showNarrowDetail}
          data-motion-view={showNarrowDetail ? "detail" : "list"}
          inert={commandPending ? true : undefined}
        >
          <section
            className="tls-inbox-list-pane"
            aria-labelledby="career-inbox-list-heading"
            ref={listPaneRef}
          >
            <h2 id="career-inbox-list-heading">{text("career.inbox.messages")}</h2>
            <InboxMessageList
              disabled={commandPending}
              emptyStateKey={postaView.emptyStateKey}
              messages={postaView.messages}
              text={text}
              onSelect={(messageId) => {
                setShowNarrowDetail(true);
                onMessageSelect(messageId);
              }}
            />
          </section>

          <m.section
            className="tls-inbox-detail-pane"
            aria-live="polite"
            data-attention-arrival={selectedMessageIsArrival}
            key={`detail:${selectedMessageId ?? "empty"}:${showNarrowDetail ? "open" : "closed"}`}
            ref={detailPaneRef}
            initial={selectedMessageIsArrival
              ? webMotionTargets.attentionArrival
              : webMotionTargets.inboxDetailEnter}
            animate={webMotionTargets.rest}
            transition={selectedMessageIsArrival ? webMotion.narrative : webMotion.transition}
            onAnimationComplete={() => {
              if (selectedMessageIsArrival && selectedMessageId !== undefined) {
                onArrivalPresented?.(selectedMessageId);
              }
            }}
          >
            <InboxMessageDetail
              disabled={commandPending}
              message={selectedMessage}
              text={text}
              onBack={() => setShowNarrowDetail(false)}
              onPrimaryAction={onPrimaryAction}
            />
          </m.section>
        </div>
      </section>
    </AppShell>
  );
}
