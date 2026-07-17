import { useEffect, useMemo, useState } from "react";
import type { MessageKey, Translator } from "@game/i18n";
import {
  buildCareerInboxView,
  buildCareerShellView,
} from "@game/ui";
import type {
  CareerMatchdayBlockerKey,
  CareerMatchPreparationFormationId,
  CareerMatchPreparationView,
  CareerMatchdayPhaseView,
  CareerMatchdayView,
  CareerShellNavigationItemInput,
} from "@game/ui";

import type { WebCareerContinueResult } from "../../runtime/web-career-runtime";
import {
  buildCareerMatchdayPresentationView,
  type CareerMatchdayPresentationView,
  type MatchdayManagerActionId,
  type MatchdayManagerActionView,
  type MatchdayPhaseIndicatorView,
  type MatchdayScoreHeaderView,
} from "./career-matchday-presenter";
import {
  formatMatchdayEventPlayerLine,
  MatchdayLivePhase,
} from "./MatchdayLivePhase";
import {
  buildFirstHalfPlaybackPlan,
  buildSecondHalfPlaybackPlan,
  prefersReducedMatchdayMotion,
  projectFirstHalfPlaybackFrame,
  projectSecondHalfPlaybackFrame,
  type MatchdayPlaybackStage,
} from "./matchday-playback";
import type {
  WebHalfTimeSubstitutionDecision,
  WebHalfTimeSubstitutionPanel,
} from "./matchday-adapter";
import { AppShell } from "../app-shell/AppShell";
import type { TacticalBoardDraft } from "../tactics-board/tactical-board-state";
import type { TacticalBoardRoleCode } from "../tactics-board/tactical-board-types";
import { CommandActivityIndicator } from "../shared/CommandActivityIndicator";
import {
  useCareerUiStore,
  type CareerCommandActivity,
} from "../../stores/career-ui-store";
import {
  buildMatchdayHalfTimeValidationIssues,
  MatchdayHalfTimePhase,
} from "./MatchdayHalfTimePhase";
import { MatchdayFullTimePhase } from "./MatchdayFullTimePhase";

const MATCHDAY_NAVIGATION_ITEMS: readonly CareerShellNavigationItemInput[] = [
  {
    sectionKey: "dashboard",
    labelKey: "career.shell.nav.dashboard",
    status: "disabled",
    disabledReasonKey: "career.shell.disabled.matchdayFocus",
  },
  {
    sectionKey: "inbox",
    labelKey: "career.shell.nav.inbox",
    status: "disabled",
    disabledReasonKey: "career.shell.disabled.matchdayFocus",
  },
  {
    sectionKey: "fixtures",
    labelKey: "career.shell.nav.fixtures",
    status: "available",
  },
];

/** Props for the playable match centre web screen. */
export type CareerMatchdayScreenProps = Readonly<{
  view: CareerMatchdayView;
  phaseView: CareerMatchdayPhaseView;
  halfTimeSubstitutions?: WebHalfTimeSubstitutionPanel;
  matchPreparationView?: CareerMatchPreparationView;
  tacticalBoardDraft?: TacticalBoardDraft;
  continueResult?: WebCareerContinueResult;
  text: Translator;
  onBackToMenu: () => void;
  onBackToDashboard: () => void;
  onContinueCareer: () => void;
  onInboxActionClick: (actionId: string) => void;
  onPrepareMatch: () => void;
  onPlayFixture: () => void;
  onApplyHalfTimeSubstitution?: (decision: WebHalfTimeSubstitutionDecision) => void;
  onHalfTimeFormationChange?: (formationId: CareerMatchPreparationFormationId) => void;
  onHalfTimeLineupPlayerChange?: (slotKey: string, playerId: string | undefined) => void;
  onHalfTimeBenchPlayerChange?: (slotKey: string, playerId: string | undefined) => void;
  onHalfTimeBoardSlotMove?: (slotKey: string, nx: number, ny: number) => void;
  onHalfTimeBoardSlotRoleChange?: (slotKey: string, role: TacticalBoardRoleCode) => void;
  onHalfTimeBoardSlotClear?: (slotKey: string) => void;
  onStartSecondHalf?: () => void;
}>;

/** Renders the phase-aware match centre without owning match simulation rules. */
export function CareerMatchdayScreen({
  view,
  phaseView,
  halfTimeSubstitutions,
  matchPreparationView,
  tacticalBoardDraft,
  continueResult,
  text,
  onBackToMenu,
  onBackToDashboard,
  onContinueCareer,
  onInboxActionClick,
  onPrepareMatch,
  onPlayFixture,
  onApplyHalfTimeSubstitution,
  onHalfTimeFormationChange,
  onHalfTimeLineupPlayerChange,
  onHalfTimeBenchPlayerChange,
  onHalfTimeBoardSlotMove,
  onHalfTimeBoardSlotRoleChange,
  onHalfTimeBoardSlotClear,
  onStartSecondHalf,
}: CareerMatchdayScreenProps): React.JSX.Element {
  const inboxView = buildCareerInboxView(continueResult?.inboxMessages ?? []);
  const shellView = buildCareerShellView({
    activeSectionKey: "fixtures",
    inboxView,
    mode: "matchday",
    navigationItems: MATCHDAY_NAVIGATION_ITEMS,
  });
  const commandActivity = useCareerUiStore((state) => state.commandActivity);
  const commandPending = commandActivity?.status === "pending";
  const playback = useMatchdayPlayback(phaseView, commandActivity);

  return (
    <AppShell
      shellView={shellView}
      selectedClubName={view.selectedClub.name}
      currentDateIso={view.currentDateIso}
      text={text}
      onBackToMenu={onBackToMenu}
      onContinueCareer={onContinueCareer}
      onInboxActionClick={onInboxActionClick}
    >
      <section className="tls-shell-panel tls-matchday-panel" aria-labelledby="career-matchday-title" aria-busy={commandPending}>
        <header className="tls-matchday-header">
          <div>
            <h1 className="tls-shell-title" id="career-matchday-title">{text("career.matchday.title")}</h1>
          </div>
        </header>

        <MatchCentre
          view={view}
          phaseView={playback.visiblePhaseView}
          {...(playback.playbackStage === undefined ? {} : { playbackStage: playback.playbackStage })}
          commandActivity={commandActivity}
          text={text}
          onPrepareMatch={onPrepareMatch}
          onPlayFixture={onPlayFixture}
          onStartFirstHalf={() => {
            playback.requestFirstHalfPlayback();
            onPlayFixture();
          }}
          onBackToDashboard={onBackToDashboard}
          {...(matchPreparationView === undefined ? {} : { matchPreparationView })}
          {...(tacticalBoardDraft === undefined ? {} : { tacticalBoardDraft })}
          {...(halfTimeSubstitutions === undefined ? {} : { halfTimeSubstitutions })}
          {...(onApplyHalfTimeSubstitution === undefined ? {} : { onApplyHalfTimeSubstitution })}
          {...(onHalfTimeFormationChange === undefined ? {} : { onHalfTimeFormationChange })}
          {...(onHalfTimeLineupPlayerChange === undefined ? {} : { onHalfTimeLineupPlayerChange })}
          {...(onHalfTimeBenchPlayerChange === undefined ? {} : { onHalfTimeBenchPlayerChange })}
          {...(onHalfTimeBoardSlotMove === undefined ? {} : { onHalfTimeBoardSlotMove })}
          {...(onHalfTimeBoardSlotRoleChange === undefined ? {} : { onHalfTimeBoardSlotRoleChange })}
          {...(onHalfTimeBoardSlotClear === undefined ? {} : { onHalfTimeBoardSlotClear })}
          {...(onStartSecondHalf === undefined
            ? {}
            : {
                onStartSecondHalf: () => {
                  playback.requestSecondHalfPlayback();
                  onStartSecondHalf();
                },
              })}
        />
      </section>
    </AppShell>
  );
}

/** Owns presentation-only period playback while preserving the canonical match checkpoint. */
function useMatchdayPlayback(
  phaseView: CareerMatchdayPhaseView,
  commandActivity: CareerCommandActivity | undefined,
): Readonly<{
  visiblePhaseView: CareerMatchdayPhaseView;
  playbackStage?: MatchdayPlaybackStage;
  requestFirstHalfPlayback: () => void;
  requestSecondHalfPlayback: () => void;
}> {
  const [firstHalfRequested, setFirstHalfRequested] = useState(false);
  const [firstHalfFrameIndex, setFirstHalfFrameIndex] = useState(0);
  const [secondHalfRequested, setSecondHalfRequested] = useState(false);
  const [secondHalfFrameIndex, setSecondHalfFrameIndex] = useState(0);
  const firstHalfPlan = useMemo(
    () => firstHalfRequested && phaseView.phase === "half_time"
      ? buildFirstHalfPlaybackPlan(phaseView, prefersReducedMatchdayMotion())
      : undefined,
    [firstHalfRequested, phaseView],
  );
  const firstHalfFrame = firstHalfPlan?.frames[firstHalfFrameIndex];
  const secondHalfPlan = useMemo(
    () => secondHalfRequested && phaseView.phase === "full_time"
      ? buildSecondHalfPlaybackPlan(phaseView, prefersReducedMatchdayMotion())
      : undefined,
    [phaseView, secondHalfRequested],
  );
  const secondHalfFrame = secondHalfPlan?.frames[secondHalfFrameIndex];

  useEffect(() => {
    if (
      firstHalfRequested
      && commandActivity?.commandId === "play_first_half"
      && commandActivity.status === "failed"
    ) {
      setFirstHalfRequested(false);
      setFirstHalfFrameIndex(0);
    }
  }, [commandActivity, firstHalfRequested]);

  useEffect(() => {
    if (
      secondHalfRequested
      && commandActivity?.commandId === "play_second_half"
      && commandActivity.status === "failed"
    ) {
      setSecondHalfRequested(false);
      setSecondHalfFrameIndex(0);
    }
  }, [commandActivity, secondHalfRequested]);

  useEffect(() => {
    if (firstHalfPlan === undefined || firstHalfFrame === undefined) return;

    const timeout = window.setTimeout(() => {
      const nextFrameIndex = firstHalfFrameIndex + 1;
      if (nextFrameIndex < firstHalfPlan.frames.length) {
        setFirstHalfFrameIndex(nextFrameIndex);
        return;
      }
      setFirstHalfRequested(false);
      setFirstHalfFrameIndex(0);
    }, firstHalfFrame.holdMs);

    return () => window.clearTimeout(timeout);
  }, [firstHalfFrame, firstHalfFrameIndex, firstHalfPlan]);

  useEffect(() => {
    if (secondHalfPlan === undefined || secondHalfFrame === undefined) return;

    const timeout = window.setTimeout(() => {
      const nextFrameIndex = secondHalfFrameIndex + 1;
      if (nextFrameIndex < secondHalfPlan.frames.length) {
        setSecondHalfFrameIndex(nextFrameIndex);
        return;
      }
      setSecondHalfRequested(false);
      setSecondHalfFrameIndex(0);
    }, secondHalfFrame.holdMs);

    return () => window.clearTimeout(timeout);
  }, [secondHalfFrame, secondHalfFrameIndex, secondHalfPlan]);

  const visiblePhaseView = firstHalfFrame !== undefined && phaseView.phase === "half_time"
    ? projectFirstHalfPlaybackFrame(phaseView, firstHalfFrame)
    : secondHalfFrame !== undefined && phaseView.phase === "full_time"
      ? projectSecondHalfPlaybackFrame(phaseView, secondHalfFrame)
      : phaseView;
  const playbackStage = firstHalfFrame?.stage ?? secondHalfFrame?.stage;

  return {
    visiblePhaseView,
    ...(playbackStage === undefined ? {} : { playbackStage }),
    requestFirstHalfPlayback: () => {
      setFirstHalfFrameIndex(0);
      setFirstHalfRequested(true);
    },
    requestSecondHalfPlayback: () => {
      setSecondHalfFrameIndex(0);
      setSecondHalfRequested(true);
    },
  };
}

function MatchCentre({
  view,
  phaseView,
  playbackStage,
  commandActivity,
  text,
  onPrepareMatch,
  onPlayFixture,
  matchPreparationView,
  tacticalBoardDraft,
  halfTimeSubstitutions,
  onApplyHalfTimeSubstitution,
  onHalfTimeFormationChange,
  onHalfTimeLineupPlayerChange,
  onHalfTimeBenchPlayerChange,
  onHalfTimeBoardSlotMove,
  onHalfTimeBoardSlotRoleChange,
  onHalfTimeBoardSlotClear,
  onStartFirstHalf,
  onStartSecondHalf,
  onBackToDashboard,
}: Readonly<{
  view: CareerMatchdayView;
  phaseView: CareerMatchdayPhaseView;
  playbackStage?: MatchdayPlaybackStage;
  commandActivity: CareerCommandActivity | undefined;
  text: Translator;
  onPrepareMatch: () => void;
  onPlayFixture: () => void;
  matchPreparationView?: CareerMatchPreparationView;
  tacticalBoardDraft?: TacticalBoardDraft;
  halfTimeSubstitutions?: WebHalfTimeSubstitutionPanel;
  onApplyHalfTimeSubstitution?: (decision: WebHalfTimeSubstitutionDecision) => void;
  onHalfTimeFormationChange?: (formationId: CareerMatchPreparationFormationId) => void;
  onHalfTimeLineupPlayerChange?: (slotKey: string, playerId: string | undefined) => void;
  onHalfTimeBenchPlayerChange?: (slotKey: string, playerId: string | undefined) => void;
  onHalfTimeBoardSlotMove?: (slotKey: string, nx: number, ny: number) => void;
  onHalfTimeBoardSlotRoleChange?: (slotKey: string, role: TacticalBoardRoleCode) => void;
  onHalfTimeBoardSlotClear?: (slotKey: string) => void;
  onStartFirstHalf: () => void;
  onStartSecondHalf?: () => void;
  onBackToDashboard: () => void;
}>): React.JSX.Element {
  const presentation = buildCareerMatchdayPresentationView(phaseView);
  const halfTimeValidationIssues = phaseView.phase === "half_time"
    ? buildMatchdayHalfTimeValidationIssues(
        matchPreparationView,
        tacticalBoardDraft,
        halfTimeSubstitutions,
      )
    : [];
  const primaryAction = matchCentrePrimaryAction(
    view,
    presentation.primaryAction,
    phaseView.phase === "half_time" && halfTimeValidationIssues.length > 0,
  );
  const commandPending = commandActivity?.status === "pending";

  return (
    <div className="tls-match-centre">
      <MatchdayBroadcastHeader
        phaseView={phaseView}
        presentation={presentation}
        commandActivity={commandActivity}
        text={text}
        onPrepareMatch={onPrepareMatch}
        onPlayFixture={onPlayFixture}
        onBackToDashboard={onBackToDashboard}
        {...(primaryAction === undefined ? {} : { primaryAction })}
        onStartFirstHalf={onStartFirstHalf}
        {...(onStartSecondHalf === undefined ? {} : { onStartSecondHalf })}
      />

      <div className="tls-match-centre-command-lock" inert={commandPending ? true : undefined}>
      <MatchdayBlockers blockerKeys={view.blockerKeys} text={text} />

      {phaseView.phase === "half_time" ? (
        presentation.halfTimeReview === undefined ? null : (
          <MatchdayHalfTimePhase
            review={presentation.halfTimeReview}
            text={text}
            validationIssues={halfTimeValidationIssues}
            {...(matchPreparationView === undefined ? {} : { matchPreparationView })}
            {...(tacticalBoardDraft === undefined ? {} : { tacticalBoardDraft })}
            {...(halfTimeSubstitutions === undefined ? {} : { substitutionPanel: halfTimeSubstitutions })}
            {...(onApplyHalfTimeSubstitution === undefined ? {} : { onApplyHalfTimeSubstitution })}
            {...(onHalfTimeFormationChange === undefined ? {} : { onFormationChange: onHalfTimeFormationChange })}
            {...(onHalfTimeLineupPlayerChange === undefined ? {} : { onLineupPlayerChange: onHalfTimeLineupPlayerChange })}
            {...(onHalfTimeBenchPlayerChange === undefined ? {} : { onBenchPlayerChange: onHalfTimeBenchPlayerChange })}
            {...(onHalfTimeBoardSlotMove === undefined ? {} : { onBoardSlotMove: onHalfTimeBoardSlotMove })}
            {...(onHalfTimeBoardSlotRoleChange === undefined ? {} : { onBoardSlotRoleChange: onHalfTimeBoardSlotRoleChange })}
            {...(onHalfTimeBoardSlotClear === undefined ? {} : { onBoardSlotClear: onHalfTimeBoardSlotClear })}
          />
        )
      ) : phaseView.phase === "full_time" ? (
        presentation.fullTimeReview === undefined ? null : (
          <MatchdayFullTimePhase review={presentation.fullTimeReview} text={text} />
        )
      ) : phaseView.phase === "pre_match" ? (
        view.blockerKeys.length === 0 ? <PreMatchConfirmation phaseView={phaseView} text={text} /> : null
      ) : (
        <MatchdayLivePhase
          phaseView={phaseView}
          presentation={presentation}
          liveLine={broadcastLine(phaseView, text)}
          text={text}
          {...(playbackStage === undefined ? {} : { playbackStage })}
        />
      )}
      </div>
    </div>
  );
}

function PreMatchConfirmation({
  phaseView,
  text,
}: Readonly<{
  phaseView: CareerMatchdayPhaseView;
  text: Translator;
}>): React.JSX.Element {
  return (
    <section className="tls-matchday-card tls-match-centre-pre-match" aria-labelledby="matchday-pre-match-title">
      <div className="tls-match-centre-card-heading">
        <div>
          <h2 id="matchday-pre-match-title">{text("career.matchday.status.ready_to_play")}</h2>
          <p>{broadcastLine(phaseView, text)}</p>
        </div>
      </div>
      <div className="tls-match-centre-pre-match-facts">
        <MatchdayFact label={text("career.matchday.fixture")} value={fixtureLine(phaseView)} />
        <MatchdayFact
          label={text("career.matchday.selectedSide")}
          value={text(`career.dashboard.fixtureSide.${phaseView.fixture.selectedClubSide}` as MessageKey)}
        />
      </div>
    </section>
  );
}

function MatchdayBroadcastHeader({
  phaseView,
  presentation,
  commandActivity,
  primaryAction,
  text,
  onPrepareMatch,
  onPlayFixture,
  onBackToDashboard,
  onStartFirstHalf,
  onStartSecondHalf,
}: Readonly<{
  phaseView: CareerMatchdayPhaseView;
  presentation: CareerMatchdayPresentationView;
  commandActivity: CareerCommandActivity | undefined;
  primaryAction?: MatchdayManagerActionView;
  text: Translator;
  onPrepareMatch: () => void;
  onPlayFixture: () => void;
  onBackToDashboard: () => void;
  onStartFirstHalf?: () => void;
  onStartSecondHalf?: () => void;
}>): React.JSX.Element {
  const header = presentation.scoreHeader;

  return (
    <section className="tls-match-broadcast-frame" aria-label={text("career.matchday.matchCentre")}>
      <div className="tls-match-broadcast-meta" aria-label={text("career.matchday.context")}>
        <span>{text(header.phaseLabelKey as MessageKey)}</span>
        <span>{phaseMinuteLabel(header.minute, text)}</span>
        <span>{text("career.fixtureRound", { round: header.round })}</span>
        <span>{text(`career.dashboard.fixtureSide.${phaseView.fixture.selectedClubSide}` as MessageKey)}</span>
      </div>

      <div className="tls-match-broadcast-main">
        <MatchdayScoreboard header={header} text={text} />

        {primaryAction === undefined ? null : (
          <button
            className="tls-menu-button tls-menu-button-primary tls-match-broadcast-action"
            data-state={commandActivity?.status === "pending"
              ? "pending"
              : primaryAction.status === "available"
                ? "idle"
                : "disabled"}
            disabled={primaryAction.status !== "available" || commandActivity?.status === "pending"}
            type="button"
            onClick={handlerForPhaseAction(primaryAction.actionId, {
              onPrepareMatch,
              onPlayFixture,
              onBackToDashboard,
              ...(onStartFirstHalf === undefined ? {} : { onStartFirstHalf }),
              ...(onStartSecondHalf === undefined ? {} : { onStartSecondHalf }),
            })}
          >
            <CommandActivityIndicator
              activity={commandActivity}
              commandIds={["play_first_half", "play_second_half", "return_to_dashboard"]}
              idleLabel={text(primaryAction.labelKey as MessageKey)}
              text={text}
            />
          </button>
        )}
      </div>

      <p className="tls-match-broadcast-live-line">{broadcastLine(phaseView, text)}</p>

      <PhaseRail indicators={presentation.phaseIndicators} text={text} />
    </section>
  );
}

function MatchdayScoreboard({ header, text }: Readonly<{ header: MatchdayScoreHeaderView; text: Translator }>): React.JSX.Element {
  return (
    <div className="tls-matchday-scoreboard">
      <strong>{header.homeClubName}</strong>
      <div className="tls-matchday-score">
        <span>{header.homeGoals}</span>
        <span>-</span>
        <span>{header.awayGoals}</span>
      </div>
      <strong>{header.awayClubName}</strong>
      <small>{text(header.phase === "full_time"
        ? fullTimeOutcomeLabelKey(header.selectedClubScoreState)
        : `career.matchday.scoreState.${header.selectedClubScoreState}` as MessageKey)}</small>
    </div>
  );
}

function broadcastLine(view: CareerMatchdayPhaseView, text: Translator): string {
  if (view.phase === "full_time") {
    return text("career.matchday.broadcast.fullTimeLine", {
      result: text(`career.matchday.scoreState.${view.scoreboard.selectedClubScoreState}` as MessageKey),
    });
  }

  if (view.phase === "first_half" && view.currentMinute >= 45) {
    return text("career.matchday.broadcast.halfTimeApproaching");
  }

  if (view.phase === "second_half" && view.currentMinute >= 90) {
    return text("career.matchday.broadcast.fullTimeApproaching");
  }

  const latestEvent = view.timelineEvents.at(-1);

  if (latestEvent !== undefined) {
    return text("career.matchday.broadcast.eventLine", {
      minute: latestEvent.minute,
      kind: text(latestEvent.labelKey as MessageKey),
      club: latestEvent.club.name,
      player: formatMatchdayEventPlayerLine(latestEvent, text),
    });
  }

  if (view.phase === "pre_match") {
    return text("career.matchday.broadcast.preMatchLine", {
      home: view.fixture.homeClub.name,
      away: view.fixture.awayClub.name,
    });
  }

  if (view.phase === "half_time") {
    return text("career.matchday.broadcast.halfTimeLine");
  }

  if (view.phase === "first_half") {
    return text("career.matchday.broadcast.firstHalfUnderway");
  }

  if (view.phase === "second_half") {
    return text("career.matchday.broadcast.secondHalfUnderway");
  }

  return text("career.matchday.broadcast.noLiveLine");
}

function PhaseRail({
  indicators,
  text,
}: Readonly<{ indicators: readonly MatchdayPhaseIndicatorView[]; text: Translator }>): React.JSX.Element {
  return (
    <ol className="tls-match-centre-phase-rail" aria-label={text("career.matchday.phaseProgress")}>
      {indicators.map((indicator) => (
        <li
          aria-current={indicator.status === "current" ? "step" : undefined}
          className={`is-${indicator.status}`}
          data-phase={indicator.phase}
          data-status={indicator.status}
          key={indicator.phase}
        >
          {text(indicator.labelKey as MessageKey)}
        </li>
      ))}
    </ol>
  );
}

/** Chooses exactly one primary matchday action for the current phase. */
function matchCentrePrimaryAction(
  view: CareerMatchdayView,
  presenterPrimaryAction: MatchdayManagerActionView | undefined,
  halfTimeDecisionBlocked = false,
): MatchdayManagerActionView | undefined {
  if (view.blockerKeys.length > 0) {
    return {
      actionId: "prepare_match",
      status: "available",
      labelKey: "career.matchday.action.prepare_match",
      blockerKeys: [],
    };
  }

  if (halfTimeDecisionBlocked && presenterPrimaryAction?.actionId === "start_second_half") {
    return undefined;
  }

  return presenterPrimaryAction;
}

function MatchdayBlockers({
  blockerKeys,
  text,
}: Readonly<{ blockerKeys: readonly CareerMatchdayBlockerKey[]; text: Translator }>): React.JSX.Element | null {
  if (blockerKeys.length === 0) {
    return null;
  }

  return (
    <section className="tls-matchday-blockers" aria-label={text("career.matchday.blockers")}>
      <strong>{text("career.matchday.blockers")}</strong>
      <ul>
        {blockerKeys.map((blocker) => (
          <li key={blocker}>{text(blockerLabelKey(blocker))}</li>
        ))}
      </ul>
    </section>
  );
}

function MatchdayFact({ label, value }: Readonly<{ label: string; value: string }>): React.JSX.Element {
  return (
    <div className="tls-matchday-fact">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function handlerForPhaseAction(
  actionId: MatchdayManagerActionId,
  handlers: Readonly<{
    onPrepareMatch: () => void;
    onPlayFixture: () => void;
    onStartFirstHalf?: () => void;
    onStartSecondHalf?: () => void;
    onBackToDashboard: () => void;
  }>,
): () => void {
  switch (actionId) {
    case "prepare_match":
      return handlers.onPrepareMatch;
    case "start_first_half":
      return handlers.onStartFirstHalf ?? handlers.onPlayFixture;
    case "start_second_half":
      return handlers.onStartSecondHalf ?? handlers.onPlayFixture;
    case "back_to_dashboard":
      return handlers.onBackToDashboard;
    case "apply_half_time_substitutions":
      return () => undefined;
  }
}

function fixtureLine(view: CareerMatchdayPhaseView): string {
  return `${view.fixture.homeClub.name} vs ${view.fixture.awayClub.name}`;
}

function phaseMinuteLabel(minute: number, text: Translator): string {
  return minute === 0 ? text("career.matchday.notStarted") : `${minute}'`;
}

function fullTimeOutcomeLabelKey(
  scoreState: MatchdayScoreHeaderView["selectedClubScoreState"],
): MessageKey {
  switch (scoreState) {
    case "leading":
      return "career.matchday.fullTimeOutcome.win";
    case "drawing":
      return "career.matchday.fullTimeOutcome.draw";
    case "trailing":
      return "career.matchday.fullTimeOutcome.loss";
  }
}

function blockerLabelKey(blocker: CareerMatchdayBlockerKey): MessageKey {
  return `career.matchday.blocker.${blocker}` as MessageKey;
}
