import { useMemo, useState } from "react";
import {
  ChartNoAxesCombined,
  CircleAlert,
  Goal,
  Shield,
  Shirt,
  Star,
  type LucideIcon,
} from "lucide-react";
import type { MessageKey, Translator } from "@game/i18n";
import { useReducedMotion } from "motion/react";
import * as m from "motion/react-m";
import type {
  CareerMatchPreparationBlockerKey,
  CareerMatchPreparationFormationId,
  CareerMatchPreparationView,
  CareerMatchdayPhasePlayerView,
} from "@game/ui";

import { roleLabelKey } from "../../shared/lib/match-preparation-labels";
import { webMotion, webMotionTargets } from "../../shared/motion/web-motion";
import type { TacticalBoardDraft } from "../tactics-board/tactical-board-state";
import type { TacticalBoardRoleCode } from "../tactics-board/tactical-board-types";
import type { MatchdayHalfTimeReviewView } from "./career-matchday-presenter";
import type {
  WebMatchdaySubstitutionDecision,
  WebMatchdayTeamControlPanel,
} from "./matchday-adapter";
import { MatchdayPhaseTabs, type MatchdayPhaseTabItem } from "./MatchdayPhaseTabs";
import { MatchdayTacticalWorkspace } from "./MatchdayTacticalWorkspace";
import { MatchdayTeamRatings, type MatchdayTeamRatingSignal } from "./MatchdayTeamRatings";

type HalfTimeTabId = "summary" | "tactics" | "selected_team" | "opponent";

/** One localized issue that must be resolved before the second half can start. */
export interface MatchdayHalfTimeValidationIssueView {
  /** Stable identifier used for rendering and deduplication. */
  readonly issueId: string;
  /** Existing localized explanation for the issue. */
  readonly labelKey: MessageKey;
}

/** Props for the half-time composition; simulation and persistence remain outside. */
export interface MatchdayHalfTimePhaseProps {
  /** True only when the live screen has just reached half time in this session. */
  readonly animateEntry?: boolean;
  readonly review: MatchdayHalfTimeReviewView;
  readonly text: Translator;
  readonly validationIssues: readonly MatchdayHalfTimeValidationIssueView[];
  readonly matchPreparationView?: CareerMatchPreparationView;
  readonly tacticalBoardDraft?: TacticalBoardDraft;
  readonly substitutionPanel?: WebMatchdayTeamControlPanel;
  readonly hasPendingTeamChanges?: boolean;
  readonly onApplyHalfTimeSubstitution?: (decision: WebMatchdaySubstitutionDecision) => void;
  readonly onFormationChange?: (formationId: CareerMatchPreparationFormationId) => void;
  readonly onBoardSlotMove?: (slotKey: string, nx: number, ny: number) => void;
  readonly onBoardSlotRoleChange?: (slotKey: string, role: TacticalBoardRoleCode) => void;
  readonly onBoardSlotAdapt?: (slotKey: string, role: TacticalBoardRoleCode, nx: number, ny: number) => void;
  readonly onBoardSlotExchange?: (firstSlotKey: string, secondSlotKey: string) => void;
  readonly onTacticProfileChange?: (tacticProfileId: string | undefined) => void;
  readonly onDiscardPendingChanges?: () => void;
}

/**
 * Composes the half-time review and tactical decision in one football-first
 * order. Tactical rules continue to live in the shared board and adapters.
 */
export function MatchdayHalfTimePhase({
  animateEntry = false,
  review,
  text,
  validationIssues,
  matchPreparationView,
  tacticalBoardDraft,
  substitutionPanel,
  hasPendingTeamChanges = false,
  onApplyHalfTimeSubstitution,
  onFormationChange,
  onBoardSlotMove,
  onBoardSlotRoleChange,
  onBoardSlotAdapt,
  onBoardSlotExchange,
  onTacticProfileChange,
  onDiscardPendingChanges,
}: MatchdayHalfTimePhaseProps): React.JSX.Element {
  const reducedMotion = useReducedMotion();
  const animateCheckpoint = animateEntry && !reducedMotion;
  const [activeTabId, setActiveTabId] = useState<HalfTimeTabId>("summary");
  const selectedTeamSignals = useMemo<Readonly<Record<string, MatchdayTeamRatingSignal>>>(() => ({
    ...Object.fromEntries(review.contributors.map((row) => [row.playerId, "contributor"] as const)),
    ...Object.fromEntries(review.watchList.map((row) => [row.playerId, "watch"] as const)),
  }), [review.contributors, review.watchList]);
  const tacticalPanel = matchPreparationView !== undefined && tacticalBoardDraft !== undefined ? (
    <MatchdayTacticalWorkspace
      tacticalBoardDraft={tacticalBoardDraft}
      view={matchPreparationView}
      text={text}
      {...(substitutionPanel === undefined ? {} : { panel: substitutionPanel })}
      hasPendingChanges={hasPendingTeamChanges}
      {...(onApplyHalfTimeSubstitution === undefined ? {} : { onSubstitution: onApplyHalfTimeSubstitution })}
      {...(onFormationChange === undefined ? {} : { onFormationChange })}
      {...(onBoardSlotMove === undefined ? {} : { onBoardSlotMove })}
      {...(onBoardSlotRoleChange === undefined ? {} : { onBoardSlotRoleChange })}
      {...(onBoardSlotAdapt === undefined ? {} : { onBoardSlotAdapt })}
      {...(onBoardSlotExchange === undefined ? {} : { onBoardSlotExchange })}
      {...(onTacticProfileChange === undefined ? {} : { onTacticProfileChange })}
      {...(onDiscardPendingChanges === undefined ? {} : { onDiscardPendingChanges })}
    />
  ) : (
    <p className="tls-matchday-empty">{text("career.matchday.halfTimeTacticsUnavailable")}</p>
  );
  const tabs: readonly MatchdayPhaseTabItem<HalfTimeTabId>[] = [
    {
      tabId: "summary",
      label: text("career.matchday.halfTimeTab.summary"),
      icon: ChartNoAxesCombined,
      panel: (
        <HalfTimeSummary
          appliedSubstitutions={substitutionPanel?.appliedSubstitutions ?? []}
          review={review}
          text={text}
          validationIssues={validationIssues}
        />
      ),
    },
    {
      tabId: "tactics",
      label: text("career.matchday.halfTimeTab.tactics"),
      icon: Goal,
      panel: tacticalPanel,
    },
    {
      tabId: "selected_team",
      label: text("career.matchday.halfTimeTab.selectedTeam"),
      icon: Shirt,
      panel: (
        <MatchdayTeamRatings
          clubName={review.selectedClubName}
          rows={review.selectedTeamPlayers}
          signalsByPlayerId={selectedTeamSignals}
          text={text}
        />
      ),
    },
    {
      tabId: "opponent",
      label: text("career.matchday.halfTimeTab.opponent"),
      icon: Shield,
      panel: (
        <MatchdayTeamRatings
          clubName={review.opponentClubName}
          rows={review.opponentPlayers}
          text={text}
        />
      ),
    },
  ];

  return (
    <m.section
      animate={webMotionTargets.rest}
      className="tls-match-centre-half-time-decision"
      aria-label={text("career.matchday.halfTimeDecision")}
      data-motion-active={animateCheckpoint}
      data-motion-checkpoint-panel="half_time"
      initial={animateCheckpoint ? webMotionTargets.matchReviewEnter : false}
      transition={webMotion.transition}
    >
      <MatchdayPhaseTabs
        activeTabId={activeTabId}
        ariaLabel={text("career.matchday.halfTimeTabs")}
        tabs={tabs}
        onActiveTabChange={setActiveTabId}
      />
    </m.section>
  );
}

/**
 * Collects tactical blockers once so validation copy and Resume availability
 * cannot disagree. The function only translates existing structured keys.
 */
export function buildMatchdayHalfTimeValidationIssues(
  view: CareerMatchPreparationView | undefined,
  tacticalBoardDraft: TacticalBoardDraft | undefined,
  panel: WebMatchdayTeamControlPanel | undefined,
): readonly MatchdayHalfTimeValidationIssueView[] {
  const issues: MatchdayHalfTimeValidationIssueView[] = [];

  if (view !== undefined) {
    issues.push(...view.blockerKeys.map(preparationValidationIssue));
  }

  if ((view === undefined || tacticalBoardDraft === undefined) && panel?.status !== "editable") {
    issues.push({
      issueId: "invalid_second_half_tactical_setup",
      labelKey: "career.matchday.halfTimeValidation.invalid_second_half_tactical_setup",
    });
  }

  const panelIssueKeys = panel?.validationFactKeys
    ?? (panel?.validationReason === undefined ? [] : [panel.validationReason]);
  issues.push(...panelIssueKeys.map((issueId) => ({
    issueId,
    labelKey: `career.matchday.halfTimeValidation.${issueId}` as MessageKey,
  })));

  return [...new Map(issues.map((issue) => [issue.issueId, issue])).values()];
}

function HalfTimeSummary({
  appliedSubstitutions,
  review,
  text,
  validationIssues,
}: Readonly<{
  appliedSubstitutions: WebMatchdayTeamControlPanel["appliedSubstitutions"];
  review: MatchdayHalfTimeReviewView;
  text: Translator;
  validationIssues: readonly MatchdayHalfTimeValidationIssueView[];
}>): React.JSX.Element {
  return (
    <section className="tls-match-centre-half-time-summary" aria-labelledby="matchday-half-time-summary-title">
      <h2 className="tls-visually-hidden" id="matchday-half-time-summary-title">
        {text("career.matchday.halfTimeDecision")}
      </h2>
      <div className="tls-match-centre-half-time-signal-grid">
        <PlayerSignalGroup
          icon={CircleAlert}
          headingId="matchday-half-time-underperformers-title"
          heading={text("career.matchday.halfTimeUnderperformers")}
          emptyLabel={text("career.matchday.halfTimeNoConcerns")}
          rows={review.watchList}
          text={text}
          tone="watch"
        />
        <PlayerSignalGroup
          icon={Star}
          headingId="matchday-half-time-contributors-title"
          heading={text("career.matchday.halfTimeKeyContributors")}
          emptyLabel={text("career.matchday.halfTimeNoContributors")}
          rows={review.contributors}
          text={text}
          tone="positive"
        />
      </div>
      {appliedSubstitutions.length === 0 ? null : (
        <section className="tls-match-centre-applied-subs" aria-labelledby="matchday-half-time-summary-subs-title">
          <h3 id="matchday-half-time-summary-subs-title">{text("career.matchday.substitution.applied")}</h3>
          <ul>
            {appliedSubstitutions.map((substitution) => (
              <li key={`${substitution.outgoingPlayerName}:${substitution.incomingPlayerName}`}>
                {text("career.matchday.substitution.appliedLine", {
                  incoming: substitution.incomingPlayerName,
                  outgoing: substitution.outgoingPlayerName,
                })}
              </li>
            ))}
          </ul>
        </section>
      )}
      <HalfTimeValidation issues={validationIssues} text={text} />
    </section>
  );
}

function PlayerSignalGroup({
  icon: SignalIcon,
  headingId,
  heading,
  emptyLabel,
  rows,
  text,
  tone,
}: Readonly<{
  icon: LucideIcon;
  headingId: string;
  heading: string;
  emptyLabel: string;
  rows: readonly CareerMatchdayPhasePlayerView[];
  text: Translator;
  tone: "watch" | "positive";
}>): React.JSX.Element {
  return (
    <section
      className="tls-match-centre-half-time-signal-block"
      aria-labelledby={headingId}
      data-tone={tone}
    >
      <header>
        <SignalIcon aria-hidden="true" focusable="false" size={16} strokeWidth={1.8} />
        <h3 id={headingId}>{heading}</h3>
      </header>
      <PlayerSignalRows emptyLabel={emptyLabel} rows={rows} text={text} />
    </section>
  );
}

function PlayerSignalRows({
  emptyLabel,
  rows,
  text,
}: Readonly<{
  emptyLabel: string;
  rows: readonly CareerMatchdayPhasePlayerView[];
  text: Translator;
}>): React.JSX.Element {
  if (rows.length === 0) {
    return <p className="tls-matchday-empty">{emptyLabel}</p>;
  }

  return (
    <div className="tls-match-centre-player-signal-list">
      {rows.map((row) => (
        <article className="tls-match-centre-player-signal" key={row.playerId}>
          <strong>{row.playerName}</strong>
          <dl>
            <div>
              <dt>{text("career.matchday.table.rating")}</dt>
              <dd>{row.rating === undefined ? text("common.unknown") : row.rating.toFixed(1)}</dd>
            </div>
            <div>
              <dt>{text("career.matchday.table.condition")}</dt>
              <dd>{row.condition === undefined ? text("common.unknown") : `${row.condition}%`}</dd>
            </div>
            <div>
              <dt>{text("career.matchday.table.role")}</dt>
              <dd>{row.roleKey === undefined ? text("common.unknown") : text(roleLabelKey(row.roleKey))}</dd>
            </div>
          </dl>
          <p>{playerContribution(row, text)}</p>
        </article>
      ))}
    </div>
  );
}

function HalfTimeValidation({
  issues,
  text,
}: Readonly<{
  issues: readonly MatchdayHalfTimeValidationIssueView[];
  text: Translator;
}>): React.JSX.Element | null {
  if (issues.length === 0) return null;

  return (
    <section className="tls-match-centre-tactical-validation" aria-label={text("career.matchday.halfTimeValidation")}>
      <strong>{text("career.matchday.halfTimeValidation")}</strong>
      <ul>
        {issues.map((issue) => <li key={issue.issueId}>{text(issue.labelKey)}</li>)}
      </ul>
    </section>
  );
}

function playerContribution(row: CareerMatchdayPhasePlayerView, text: Translator): string {
  const parts = [
    row.goals > 0 ? `${text("career.matchday.table.goals")} ${row.goals}` : "",
    row.assists > 0 ? `${text("career.matchday.table.assists")} ${row.assists}` : "",
    row.shotsOnTarget > 0 ? `${text("career.matchday.table.shotsOnTarget")} ${row.shotsOnTarget}` : "",
    row.saves > 0 ? `${text("career.matchday.table.saves")} ${row.saves}` : "",
    row.blocks > 0 ? `${text("career.matchday.table.blocks")} ${row.blocks}` : "",
  ].filter((part) => part.length > 0);

  return parts.length === 0 ? text("common.none") : parts.join(" · ");
}

function preparationValidationIssue(
  blocker: CareerMatchPreparationBlockerKey,
): MatchdayHalfTimeValidationIssueView {
  return {
    issueId: blocker,
    labelKey: `career.matchPreparation.blocker.${blocker}` as MessageKey,
  };
}
