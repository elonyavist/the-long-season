import { useEffect, useMemo, useRef, useState } from "react";
import type { MessageKey, Translator } from "@game/i18n";
import { useReducedMotion } from "motion/react";
import * as m from "motion/react-m";
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
  buildMatchdayLiveMoment,
  type CareerMatchdayPresentationView,
  type MatchdayManagerActionId,
  type MatchdayManagerActionView,
  type MatchdayPhaseIndicatorView,
  type MatchdayScoreHeaderView,
} from "./career-matchday-presenter";
import { MatchdayLiveCommentary } from "./MatchdayLivePhase";
import {
  formatMatchdayEventPlayerLine,
  MatchdayTabellino,
} from "./MatchdayTabellino";
import {
  buildFirstHalfPlaybackPlan,
  buildSecondHalfPlaybackPlan,
  prefersReducedMatchdayMotion,
  projectFirstHalfPlaybackFrame,
  projectSecondHalfPlaybackFrame,
  scaledMatchdayPlaybackHoldMs,
  type MatchdayPlaybackStage,
  type MatchdayPlaybackPriority,
  type MatchdayPlaybackSpeed,
} from "./matchday-playback";
import type {
  WebHalfTimeSubstitutionDecision,
  WebHalfTimeSubstitutionPanel,
} from "./matchday-adapter";
import { AppShell, focusCurrentCareerTask } from "../app-shell/AppShell";
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
import { MatchdayPlaybackControls } from "./MatchdayPlaybackControls";
import { webMotion, webMotionTargets } from "../../shared/motion/web-motion";

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
          {...(playback.playbackPriority === undefined ? {} : { playbackPriority: playback.playbackPriority })}
          {...(playback.currentEventId === undefined ? {} : { currentEventId: playback.currentEventId })}
          {...(playback.controls === undefined ? {} : { playbackControls: playback.controls })}
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
  playbackPriority?: MatchdayPlaybackPriority;
  currentEventId?: string;
  controls?: Readonly<{
    paused: boolean;
    speed: MatchdayPlaybackSpeed;
    onPausedChange: (paused: boolean) => void;
    onSpeedChange: (speed: MatchdayPlaybackSpeed) => void;
  }>;
  requestFirstHalfPlayback: () => void;
  requestSecondHalfPlayback: () => void;
}> {
  const [activePlayback, setActivePlayback] = useState<Readonly<{
    period: "first_half" | "second_half";
    frameIndex: number;
  }>>();
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState<MatchdayPlaybackSpeed>(1);
  const playbackPlan = useMemo(
    () => activePlayback?.period === "first_half" && phaseView.phase === "half_time"
      ? buildFirstHalfPlaybackPlan(phaseView, prefersReducedMatchdayMotion())
      : activePlayback?.period === "second_half" && phaseView.phase === "full_time"
        ? buildSecondHalfPlaybackPlan(phaseView, prefersReducedMatchdayMotion())
        : undefined,
    [activePlayback?.period, phaseView],
  );
  const playbackFrame = activePlayback === undefined
    ? undefined
    : playbackPlan?.frames[activePlayback.frameIndex];

  useEffect(() => {
    if (activePlayback === undefined || commandActivity?.status !== "failed") return;
    const failedPeriod = commandActivity.commandId === "play_first_half"
      ? "first_half"
      : commandActivity.commandId === "play_second_half"
        ? "second_half"
        : undefined;
    if (failedPeriod !== activePlayback.period) return;

    setActivePlayback(undefined);
    setPaused(false);
    setSpeed(1);
  }, [activePlayback, commandActivity]);

  useEffect(() => {
    if (
      activePlayback === undefined
      || playbackPlan === undefined
      || playbackFrame === undefined
      || paused
    ) return;

    const timeout = window.setTimeout(() => {
      setActivePlayback((current) => {
        if (current === undefined || current.period !== activePlayback.period) return current;
        const nextFrameIndex = current.frameIndex + 1;
        return nextFrameIndex < playbackPlan.frames.length
          ? { ...current, frameIndex: nextFrameIndex }
          : undefined;
      });
    }, scaledMatchdayPlaybackHoldMs(playbackFrame, speed));

    return () => window.clearTimeout(timeout);
  }, [activePlayback, paused, playbackFrame, playbackPlan, speed]);

  useEffect(() => {
    if (activePlayback !== undefined) return;
    setPaused(false);
    setSpeed(1);
  }, [activePlayback]);

  const visiblePhaseView = playbackFrame !== undefined
    && activePlayback?.period === "first_half"
    && phaseView.phase === "half_time"
    ? projectFirstHalfPlaybackFrame(phaseView, playbackFrame)
    : playbackFrame !== undefined
      && activePlayback?.period === "second_half"
      && phaseView.phase === "full_time"
      ? projectSecondHalfPlaybackFrame(phaseView, playbackFrame)
      : phaseView;
  const playbackStage = playbackFrame?.stage;
  const playbackPriority = playbackFrame?.priority;
  const currentEventId = playbackFrame?.currentEventId;

  return {
    visiblePhaseView,
    ...(playbackStage === undefined ? {} : { playbackStage }),
    ...(playbackPriority === undefined ? {} : { playbackPriority }),
    ...(currentEventId === undefined ? {} : { currentEventId }),
    ...(playbackFrame === undefined
      ? {}
      : {
          controls: {
            paused,
            speed,
            onPausedChange: setPaused,
            onSpeedChange: setSpeed,
          },
        }),
    requestFirstHalfPlayback: () => {
      setPaused(false);
      setSpeed(1);
      setActivePlayback({ period: "first_half", frameIndex: 0 });
    },
    requestSecondHalfPlayback: () => {
      setPaused(false);
      setSpeed(1);
      setActivePlayback({ period: "second_half", frameIndex: 0 });
    },
  };
}

function MatchCentre({
  view,
  phaseView,
  playbackStage,
  playbackPriority,
  currentEventId,
  playbackControls,
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
  playbackPriority?: MatchdayPlaybackPriority;
  currentEventId?: string;
  playbackControls?: Readonly<{
    paused: boolean;
    speed: MatchdayPlaybackSpeed;
    onPausedChange: (paused: boolean) => void;
    onSpeedChange: (speed: MatchdayPlaybackSpeed) => void;
  }>;
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
  const preparationBlockerKeys = phaseView.phase === "pre_match" ? view.blockerKeys : [];
  const primaryAction = matchCentrePrimaryAction(
    preparationBlockerKeys,
    presentation.primaryAction,
    phaseView.phase === "half_time" && halfTimeValidationIssues.length > 0,
  );
  const commandPending = commandActivity?.status === "pending";
  const liveMoment = buildMatchdayLiveMoment(phaseView.timelineEvents, currentEventId);
  const liveLine = broadcastLine(phaseView, text, liveMoment.event?.event);
  const previousPhase = useRef(phaseView.phase);
  const phaseChanged = previousPhase.current !== phaseView.phase;
  const [enteredPhase, setEnteredPhase] = useState<CareerMatchdayPhaseView["phase"]>();
  const animatePhaseEntry = phaseChanged || enteredPhase === phaseView.phase;

  useEffect(() => {
    if (previousPhase.current === phaseView.phase) return;
    previousPhase.current = phaseView.phase;
    setEnteredPhase(phaseView.phase);
    focusCurrentCareerTask(true);
  }, [phaseView.phase]);

  return (
    <div
      className="tls-match-centre"
      data-playback-priority={playbackPriority}
    >
      <MatchdayBroadcastHeader
        phaseView={phaseView}
        presentation={presentation}
        commandActivity={commandActivity}
        liveLine={liveLine}
        liveMoment={liveMoment}
        phaseChanged={animatePhaseEntry}
        {...(playbackStage === undefined ? {} : { playbackStage })}
        text={text}
        onPrepareMatch={onPrepareMatch}
        onPlayFixture={onPlayFixture}
        onBackToDashboard={onBackToDashboard}
        {...(primaryAction === undefined ? {} : { primaryAction })}
        onStartFirstHalf={onStartFirstHalf}
        {...(onStartSecondHalf === undefined ? {} : { onStartSecondHalf })}
      />

      {playbackControls === undefined ? null : (
        <MatchdayPlaybackControls
          paused={playbackControls.paused}
          speed={playbackControls.speed}
          text={text}
          onPausedChange={playbackControls.onPausedChange}
          onSpeedChange={playbackControls.onSpeedChange}
        />
      )}

      <div className="tls-match-centre-command-lock" inert={commandPending ? true : undefined}>
      <MatchdayBlockers blockerKeys={preparationBlockerKeys} text={text} />

      {phaseView.phase === "half_time" ? (
        presentation.halfTimeReview === undefined ? null : (
          <MatchdayHalfTimePhase
            key={`half-time:${phaseView.fixture.fixtureId}`}
            animateEntry={animatePhaseEntry}
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
          <MatchdayFullTimePhase
            key={`full-time:${phaseView.fixture.fixtureId}`}
            animateEntry={animatePhaseEntry}
            review={presentation.fullTimeReview}
            text={text}
          />
        )
      ) : null}
      </div>
    </div>
  );
}

function MatchdayBroadcastHeader({
  phaseView,
  presentation,
  commandActivity,
  liveLine,
  liveMoment,
  phaseChanged,
  playbackStage,
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
  liveLine: string;
  liveMoment: ReturnType<typeof buildMatchdayLiveMoment>;
  phaseChanged: boolean;
  playbackStage?: MatchdayPlaybackStage;
  primaryAction?: MatchdayManagerActionView;
  text: Translator;
  onPrepareMatch: () => void;
  onPlayFixture: () => void;
  onBackToDashboard: () => void;
  onStartFirstHalf?: () => void;
  onStartSecondHalf?: () => void;
}>): React.JSX.Element {
  const header = presentation.scoreHeader;
  const reducedMotion = useReducedMotion();
  const animateCheckpoint = phaseChanged && !reducedMotion;

  return (
    <m.section
      animate={webMotionTargets.rest}
      aria-label={text("career.matchday.matchCentre")}
      className="tls-match-broadcast-frame"
      data-motion-active={animateCheckpoint}
      data-motion-checkpoint={phaseView.phase}
      initial={animateCheckpoint ? webMotionTargets.matchCheckpointEnter : false}
      transition={webMotion.transition}
    >
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

      <MatchdayLiveCommentary
        line={liveLine}
        moment={liveMoment}
        {...(playbackStage === undefined ? {} : { playbackStage })}
      />

      <MatchdayTabellino view={presentation.tabellino} text={text} />

      <PhaseRail indicators={presentation.phaseIndicators} text={text} />
    </m.section>
  );
}

function MatchdayScoreboard({ header, text }: Readonly<{ header: MatchdayScoreHeaderView; text: Translator }>): React.JSX.Element {
  const reducedMotion = useReducedMotion();
  const previousScore = useRef<Readonly<{ home: number; away: number }> | undefined>(undefined);
  const homeChanged = previousScore.current !== undefined
    && previousScore.current.home !== header.homeGoals;
  const awayChanged = previousScore.current !== undefined
    && previousScore.current.away !== header.awayGoals;

  useEffect(() => {
    previousScore.current = {
      home: header.homeGoals,
      away: header.awayGoals,
    };
  }, [header.awayGoals, header.homeGoals]);

  return (
    <div className="tls-matchday-scoreboard">
      <strong>{header.homeClubName}</strong>
      <div className="tls-matchday-score">
        <m.span
          data-score-changed={homeChanged}
          data-score-motion="home"
          initial={reducedMotion || !homeChanged ? false : webMotionTargets.matchScoreChangeEnter}
          key={`home:${header.homeGoals}`}
          transition={webMotion.narrative}
          animate={webMotionTargets.rest}
        >
          {header.homeGoals}
        </m.span>
        <span>-</span>
        <m.span
          data-score-changed={awayChanged}
          data-score-motion="away"
          initial={reducedMotion || !awayChanged ? false : webMotionTargets.matchScoreChangeEnter}
          key={`away:${header.awayGoals}`}
          transition={webMotion.narrative}
          animate={webMotionTargets.rest}
        >
          {header.awayGoals}
        </m.span>
      </div>
      <strong>{header.awayClubName}</strong>
      <small>{text(header.phase === "full_time"
        ? fullTimeOutcomeLabelKey(header.selectedClubScoreState)
        : `career.matchday.scoreState.${header.selectedClubScoreState}` as MessageKey)}</small>
    </div>
  );
}

function broadcastLine(
  view: CareerMatchdayPhaseView,
  text: Translator,
  currentEvent?: CareerMatchdayPhaseView["timelineEvents"][number],
): string {
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

  if (currentEvent !== undefined) {
    return text("career.matchday.broadcast.eventLine", {
      minute: currentEvent.minute,
      kind: text(currentEvent.labelKey as MessageKey),
      club: currentEvent.club.name,
      player: formatMatchdayEventPlayerLine(currentEvent, text),
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
  blockerKeys: readonly CareerMatchdayBlockerKey[],
  presenterPrimaryAction: MatchdayManagerActionView | undefined,
  halfTimeDecisionBlocked = false,
): MatchdayManagerActionView | undefined {
  if (blockerKeys.length > 0) {
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
