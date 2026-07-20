import { useEffect, useRef, useState } from "react";
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
  matchdayMinuteDelayMs,
  type MatchdayPlaybackSpeed,
} from "./matchday-playback";
import type {
  WebMatchdaySubstitutionDecision,
  WebMatchdayTeamControlPanel,
} from "./matchday-adapter";
import { AppShell, focusCurrentCareerTask } from "../app-shell/AppShell";
import { CareerScreenHeader } from "../shared/CareerScreenHeader";
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
import { MatchdayLiveWorkspace } from "./MatchdayLiveWorkspace";
import { MatchdayPlaybackControls } from "./MatchdayPlaybackControls";
import { useMatchdayNarrativeFrame } from "./use-matchday-narrative-frame";
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

type MatchdayPlaybackControlState = Readonly<{
  paused: boolean;
  speed: MatchdayPlaybackSpeed;
  onPausedChange: (paused: boolean) => void;
  onSpeedChange: (speed: MatchdayPlaybackSpeed) => void;
}>;

/** Props for the playable match centre web screen. */
export type CareerMatchdayScreenProps = Readonly<{
  view: CareerMatchdayView;
  phaseView: CareerMatchdayPhaseView;
  teamControlPanel?: WebMatchdayTeamControlPanel;
  matchPreparationView?: CareerMatchPreparationView;
  tacticalBoardDraft?: TacticalBoardDraft;
  hasPendingTeamChanges?: boolean;
  continueResult?: WebCareerContinueResult;
  text: Translator;
  onBackToMenu: () => void;
  onBackToDashboard: () => void;
  onInboxActionClick: (actionId: string) => void;
  onPrepareMatch: () => void;
  onStartFirstHalf: () => void;
  onAdvanceMatchMinute: () => Promise<void>;
  onPauseMatch: () => void;
  onResumeMatch: () => void;
  onResolveIncident: () => void;
  onApplyHalfTimeSubstitution?: (decision: WebMatchdaySubstitutionDecision) => void;
  onHalfTimeFormationChange?: (formationId: CareerMatchPreparationFormationId) => void;
  onHalfTimeBoardSlotMove?: (slotKey: string, nx: number, ny: number) => void;
  onHalfTimeBoardSlotRoleChange?: (slotKey: string, role: TacticalBoardRoleCode) => void;
  onMatchdayBoardSlotAdapt?: (slotKey: string, role: TacticalBoardRoleCode, nx: number, ny: number) => void;
  onMatchdayBoardSlotExchange?: (firstSlotKey: string, secondSlotKey: string) => void;
  onMatchdayTacticProfileChange?: (tacticProfileId: string | undefined) => void;
  onDiscardPendingTeamChanges?: () => void;
  onStartSecondHalf: () => void;
}>;

/** Renders the phase-aware match centre without owning match simulation rules. */
export function CareerMatchdayScreen({
  view,
  phaseView,
  teamControlPanel,
  matchPreparationView,
  tacticalBoardDraft,
  hasPendingTeamChanges = false,
  continueResult,
  text,
  onBackToMenu,
  onBackToDashboard,
  onInboxActionClick,
  onPrepareMatch,
  onStartFirstHalf,
  onAdvanceMatchMinute,
  onPauseMatch,
  onResumeMatch,
  onResolveIncident,
  onApplyHalfTimeSubstitution,
  onHalfTimeFormationChange,
  onHalfTimeBoardSlotMove,
  onHalfTimeBoardSlotRoleChange,
  onMatchdayBoardSlotAdapt,
  onMatchdayBoardSlotExchange,
  onMatchdayTacticProfileChange,
  onDiscardPendingTeamChanges,
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
  const narrativeFrame = useMatchdayNarrativeFrame(
    phaseView.timelineEvents,
    phaseView.currentMinute,
    (phaseView.phase === "first_half" || phaseView.phase === "second_half")
      && phaseView.liveControl?.runState === "running",
  );
  const currentEventId = narrativeFrame.currentEventId
    ?? latestCurrentMinuteEventId(phaseView);
  const playback = useMatchdayPlayback(
    phaseView,
    commandActivity,
    narrativeFrame.holdActive,
    onAdvanceMatchMinute,
    onPauseMatch,
    onResumeMatch,
  );

  return (
    <AppShell
      shellView={shellView}
      selectedClubName={view.selectedClub.name}
      currentDateIso={view.currentDateIso}
      text={text}
      onBackToMenu={onBackToMenu}
      onInboxActionClick={onInboxActionClick}
    >
      <section className="tls-shell-panel tls-matchday-panel" aria-labelledby="career-matchday-title" aria-busy={commandPending}>
        <MatchCentre
          view={view}
          phaseView={phaseView}
          {...(currentEventId === undefined ? {} : { currentEventId })}
          {...(playback.controls === undefined ? {} : { playbackControls: playback.controls })}
          commandActivity={commandActivity}
          text={text}
          onPrepareMatch={onPrepareMatch}
          onStartFirstHalf={onStartFirstHalf}
          onPauseMatch={onPauseMatch}
          onResumeMatch={onResumeMatch}
          onResolveIncident={onResolveIncident}
          onBackToDashboard={onBackToDashboard}
          {...(matchPreparationView === undefined ? {} : { matchPreparationView })}
          {...(tacticalBoardDraft === undefined ? {} : { tacticalBoardDraft })}
          hasPendingTeamChanges={hasPendingTeamChanges}
          {...(teamControlPanel === undefined ? {} : { teamControlPanel })}
          {...(onApplyHalfTimeSubstitution === undefined ? {} : { onApplyHalfTimeSubstitution })}
          {...(onHalfTimeFormationChange === undefined ? {} : { onHalfTimeFormationChange })}
          {...(onHalfTimeBoardSlotMove === undefined ? {} : { onHalfTimeBoardSlotMove })}
          {...(onHalfTimeBoardSlotRoleChange === undefined ? {} : { onHalfTimeBoardSlotRoleChange })}
          {...(onMatchdayBoardSlotAdapt === undefined ? {} : { onMatchdayBoardSlotAdapt })}
          {...(onMatchdayBoardSlotExchange === undefined ? {} : { onMatchdayBoardSlotExchange })}
          {...(onMatchdayTacticProfileChange === undefined ? {} : { onMatchdayTacticProfileChange })}
          {...(onDiscardPendingTeamChanges === undefined ? {} : { onDiscardPendingTeamChanges })}
          onStartSecondHalf={onStartSecondHalf}
        />
      </section>
    </AppShell>
  );
}

/** Schedules one engine minute at a time while the canonical session is running. */
function useMatchdayPlayback(
  phaseView: CareerMatchdayPhaseView,
  commandActivity: CareerCommandActivity | undefined,
  narrativeHoldActive: boolean,
  onAdvanceMatchMinute: () => Promise<void>,
  onPauseMatch: () => void,
  onResumeMatch: () => void,
): Readonly<{
  controls?: MatchdayPlaybackControlState;
}> {
  const [speed, setSpeed] = useState<MatchdayPlaybackSpeed>(1);
  const reducedMotion = useReducedMotion();
  const advanceMinuteRef = useRef(onAdvanceMatchMinute);
  const minuteRequestInFlight = useRef(false);
  const liveControl = phaseView.liveControl;
  const livePhase = phaseView.phase === "first_half" || phaseView.phase === "second_half";
  const running = liveControl?.runState === "running";
  const commandUnavailable = commandActivity !== undefined
    && (commandActivity.commandId !== "advance_match_minute" || commandActivity.status === "failed");

  useEffect(() => {
    advanceMinuteRef.current = onAdvanceMatchMinute;
  }, [onAdvanceMatchMinute]);

  useEffect(() => {
    if (!livePhase || !running || commandUnavailable || narrativeHoldActive) return;

    const timeout = window.setTimeout(() => {
      if (minuteRequestInFlight.current) return;
      minuteRequestInFlight.current = true;
      void advanceMinuteRef.current().finally(() => {
        minuteRequestInFlight.current = false;
      });
    }, matchdayMinuteDelayMs(speed, Boolean(reducedMotion)));

    return () => window.clearTimeout(timeout);
  }, [
    commandUnavailable,
    livePhase,
    narrativeHoldActive,
    phaseView.currentMinute,
    reducedMotion,
    running,
    speed,
  ]);

  return {
    ...(!livePhase || liveControl?.pendingDecision !== undefined
      ? {}
      : {
          controls: {
            paused: !running,
            speed,
            onPausedChange: (paused: boolean) => {
              if (paused) onPauseMatch();
              else onResumeMatch();
            },
            onSpeedChange: setSpeed,
          },
        }),
  };
}

function latestCurrentMinuteEventId(view: CareerMatchdayPhaseView): string | undefined {
  return view.timelineEvents
    .filter((event) => event.minute === view.currentMinute)
    .at(-1)
    ?.eventId;
}

function MatchCentre({
  view,
  phaseView,
  currentEventId,
  playbackControls,
  commandActivity,
  text,
  onPrepareMatch,
  matchPreparationView,
  tacticalBoardDraft,
  hasPendingTeamChanges = false,
  teamControlPanel,
  onApplyHalfTimeSubstitution,
  onHalfTimeFormationChange,
  onHalfTimeBoardSlotMove,
  onHalfTimeBoardSlotRoleChange,
  onMatchdayBoardSlotAdapt,
  onMatchdayBoardSlotExchange,
  onMatchdayTacticProfileChange,
  onDiscardPendingTeamChanges,
  onStartFirstHalf,
  onStartSecondHalf,
  onPauseMatch,
  onResumeMatch,
  onResolveIncident,
  onBackToDashboard,
}: Readonly<{
  view: CareerMatchdayView;
  phaseView: CareerMatchdayPhaseView;
  currentEventId?: string;
  playbackControls?: MatchdayPlaybackControlState;
  commandActivity: CareerCommandActivity | undefined;
  text: Translator;
  onPrepareMatch: () => void;
  matchPreparationView?: CareerMatchPreparationView;
  tacticalBoardDraft?: TacticalBoardDraft;
  hasPendingTeamChanges?: boolean;
  teamControlPanel?: WebMatchdayTeamControlPanel;
  onApplyHalfTimeSubstitution?: (decision: WebMatchdaySubstitutionDecision) => void;
  onHalfTimeFormationChange?: (formationId: CareerMatchPreparationFormationId) => void;
  onHalfTimeBoardSlotMove?: (slotKey: string, nx: number, ny: number) => void;
  onHalfTimeBoardSlotRoleChange?: (slotKey: string, role: TacticalBoardRoleCode) => void;
  onMatchdayBoardSlotAdapt?: (slotKey: string, role: TacticalBoardRoleCode, nx: number, ny: number) => void;
  onMatchdayBoardSlotExchange?: (firstSlotKey: string, secondSlotKey: string) => void;
  onMatchdayTacticProfileChange?: (tacticProfileId: string | undefined) => void;
  onDiscardPendingTeamChanges?: () => void;
  onStartFirstHalf: () => void;
  onStartSecondHalf: () => void;
  onPauseMatch: () => void;
  onResumeMatch: () => void;
  onResolveIncident: () => void;
  onBackToDashboard: () => void;
}>): React.JSX.Element {
  const presentation = buildCareerMatchdayPresentationView(phaseView);
  const halfTimeValidationIssues = phaseView.phase === "half_time"
    ? buildMatchdayHalfTimeValidationIssues(
        matchPreparationView,
        tacticalBoardDraft,
        teamControlPanel,
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
  const visiblePrimaryAction = playbackControls === undefined ? primaryAction : undefined;

  useEffect(() => {
    if (previousPhase.current === phaseView.phase) return;
    previousPhase.current = phaseView.phase;
    setEnteredPhase(phaseView.phase);
    focusCurrentCareerTask(true);
  }, [phaseView.phase]);

  return (
    <div className="tls-match-centre">
      <CareerScreenHeader
        className="tls-matchday-header"
        command={(
          <MatchdayHeaderCommand
            commandActivity={commandActivity}
            {...(playbackControls === undefined ? {} : { playbackControls })}
            {...(visiblePrimaryAction === undefined ? {} : { primaryAction: visiblePrimaryAction })}
            text={text}
            onPrepareMatch={onPrepareMatch}
            onBackToDashboard={onBackToDashboard}
            onStartFirstHalf={onStartFirstHalf}
            onStartSecondHalf={onStartSecondHalf}
            onPauseMatch={onPauseMatch}
            onResumeMatch={onResumeMatch}
            onResolveIncident={onResolveIncident}
          />
        )}
        title={text("career.matchday.title")}
        titleId="career-matchday-title"
      />

      <MatchdayBroadcastHeader
        phaseView={phaseView}
        presentation={presentation}
        liveLine={liveLine}
        liveMoment={liveMoment}
        phaseChanged={animatePhaseEntry}
        text={text}
      />

      <div className="tls-match-centre-command-lock" inert={commandPending ? true : undefined}>
      <MatchdayBlockers blockerKeys={preparationBlockerKeys} text={text} />

      {phaseView.phase === "first_half" || phaseView.phase === "second_half" ? (
        <MatchdayLiveWorkspace
          phaseView={phaseView}
          presentation={presentation}
          text={text}
          {...(matchPreparationView === undefined ? {} : { matchPreparationView })}
          {...(tacticalBoardDraft === undefined ? {} : { tacticalBoardDraft })}
          {...(teamControlPanel === undefined ? {} : { teamControlPanel })}
          hasPendingTeamChanges={hasPendingTeamChanges}
          {...(onApplyHalfTimeSubstitution === undefined ? {} : { onSubstitution: onApplyHalfTimeSubstitution })}
          {...(onHalfTimeFormationChange === undefined ? {} : { onFormationChange: onHalfTimeFormationChange })}
          {...(onMatchdayTacticProfileChange === undefined ? {} : { onTacticProfileChange: onMatchdayTacticProfileChange })}
          {...(onHalfTimeBoardSlotMove === undefined ? {} : { onBoardSlotMove: onHalfTimeBoardSlotMove })}
          {...(onHalfTimeBoardSlotRoleChange === undefined ? {} : { onBoardSlotRoleChange: onHalfTimeBoardSlotRoleChange })}
          {...(onMatchdayBoardSlotAdapt === undefined ? {} : { onBoardSlotAdapt: onMatchdayBoardSlotAdapt })}
          {...(onMatchdayBoardSlotExchange === undefined ? {} : { onBoardSlotExchange: onMatchdayBoardSlotExchange })}
          {...(onDiscardPendingTeamChanges === undefined ? {} : { onDiscardPendingChanges: onDiscardPendingTeamChanges })}
        />
      ) : phaseView.phase === "half_time" ? (
        presentation.halfTimeReview === undefined ? null : (
          <MatchdayHalfTimePhase
            key={`half-time:${phaseView.fixture.fixtureId}`}
            animateEntry={animatePhaseEntry}
            review={presentation.halfTimeReview}
            text={text}
            validationIssues={halfTimeValidationIssues}
            {...(matchPreparationView === undefined ? {} : { matchPreparationView })}
            {...(tacticalBoardDraft === undefined ? {} : { tacticalBoardDraft })}
            {...(teamControlPanel === undefined ? {} : { substitutionPanel: teamControlPanel })}
            hasPendingTeamChanges={hasPendingTeamChanges}
            {...(onApplyHalfTimeSubstitution === undefined ? {} : { onApplyHalfTimeSubstitution })}
            {...(onHalfTimeFormationChange === undefined ? {} : { onFormationChange: onHalfTimeFormationChange })}
            {...(onHalfTimeBoardSlotMove === undefined ? {} : { onBoardSlotMove: onHalfTimeBoardSlotMove })}
            {...(onHalfTimeBoardSlotRoleChange === undefined ? {} : { onBoardSlotRoleChange: onHalfTimeBoardSlotRoleChange })}
            {...(onMatchdayBoardSlotAdapt === undefined ? {} : { onBoardSlotAdapt: onMatchdayBoardSlotAdapt })}
            {...(onMatchdayBoardSlotExchange === undefined ? {} : { onBoardSlotExchange: onMatchdayBoardSlotExchange })}
            {...(onMatchdayTacticProfileChange === undefined ? {} : { onTacticProfileChange: onMatchdayTacticProfileChange })}
            {...(onDiscardPendingTeamChanges === undefined ? {} : { onDiscardPendingChanges: onDiscardPendingTeamChanges })}
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

/** Keeps the current Matchday command in one stable place beside the screen title. */
function MatchdayHeaderCommand({
  commandActivity,
  playbackControls,
  primaryAction,
  text,
  onPrepareMatch,
  onBackToDashboard,
  onStartFirstHalf,
  onStartSecondHalf,
  onPauseMatch,
  onResumeMatch,
  onResolveIncident,
}: Readonly<{
  commandActivity: CareerCommandActivity | undefined;
  playbackControls?: MatchdayPlaybackControlState;
  primaryAction?: MatchdayManagerActionView;
  text: Translator;
  onPrepareMatch: () => void;
  onBackToDashboard: () => void;
  onStartFirstHalf: () => void;
  onStartSecondHalf: () => void;
  onPauseMatch: () => void;
  onResumeMatch: () => void;
  onResolveIncident: () => void;
}>): React.JSX.Element | null {
  if (playbackControls !== undefined) {
    return (
      <div className="tls-matchday-header-command">
        <MatchdayPlaybackControls
          paused={playbackControls.paused}
          speed={playbackControls.speed}
          text={text}
          onPausedChange={playbackControls.onPausedChange}
          onSpeedChange={playbackControls.onSpeedChange}
        />
      </div>
    );
  }

  if (primaryAction === undefined) return null;

  return (
    <div className="tls-matchday-header-command">
      <button
        className="tls-menu-button tls-menu-button-primary tls-matchday-primary-action"
        data-action-id={primaryAction.actionId}
        data-state={commandActivity?.status === "pending"
          ? "pending"
          : primaryAction.status === "available"
            ? "idle"
            : "disabled"}
        disabled={primaryAction.status !== "available" || commandActivity?.status === "pending"}
        type="button"
        onClick={handlerForPhaseAction(primaryAction.actionId, {
          onPrepareMatch,
          onBackToDashboard,
          onStartFirstHalf,
          onStartSecondHalf,
          onPauseMatch,
          onResumeMatch,
          onResolveIncident,
        })}
      >
        <CommandActivityIndicator
          activity={commandActivity}
          commandIds={[
            "play_first_half",
            "play_second_half",
            "pause_match",
            "resume_match",
            "resolve_match_incident",
            "return_to_dashboard",
          ]}
          idleLabel={text(primaryAction.labelKey as MessageKey)}
          text={text}
        />
      </button>
    </div>
  );
}

function MatchdayBroadcastHeader({
  phaseView,
  presentation,
  liveLine,
  liveMoment,
  phaseChanged,
  text,
}: Readonly<{
  phaseView: CareerMatchdayPhaseView;
  presentation: CareerMatchdayPresentationView;
  liveLine: string;
  liveMoment: ReturnType<typeof buildMatchdayLiveMoment>;
  phaseChanged: boolean;
  text: Translator;
}>): React.JSX.Element {
  const header = presentation.scoreHeader;
  const reducedMotion = useReducedMotion();
  const animateCheckpoint = phaseChanged && !reducedMotion;
  const liveGoalClubId = (phaseView.phase === "first_half" || phaseView.phase === "second_half")
    && liveMoment.visualPriority === "goal"
    ? liveMoment.event?.event.club.clubId
    : undefined;
  const highlightedGoalSide = liveGoalClubId === phaseView.fixture.homeClub.clubId
    ? "home"
    : liveGoalClubId === phaseView.fixture.awayClub.clubId
      ? "away"
      : undefined;
  const running = (phaseView.phase === "first_half" || phaseView.phase === "second_half")
    && phaseView.liveControl?.runState === "running";

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
      <div className="tls-match-broadcast-topbar">
        <div className="tls-match-broadcast-meta" aria-label={text("career.matchday.context")}>
          <span>{text(header.phaseLabelKey as MessageKey)}</span>
          <span>{text("career.fixtureRound", { round: header.round })}</span>
          <span>{text(`career.dashboard.fixtureSide.${phaseView.fixture.selectedClubSide}` as MessageKey)}</span>
        </div>

        {header.phase === "pre_match" ? <span aria-hidden="true" /> : (
          <MatchdayClock
            minute={header.minute}
            running={running}
            text={text}
          />
        )}

        <span aria-hidden="true" />
      </div>

      <div className="tls-match-broadcast-main">
        <MatchdayScoreboard
          header={header}
          {...(highlightedGoalSide === undefined ? {} : { highlightedGoalSide })}
        />
      </div>

      <PhaseRail indicators={presentation.phaseIndicators} text={text} />

      <MatchdayLiveCommentary
        line={liveLine}
        moment={liveMoment}
      />

      {phaseView.phase === "first_half" || phaseView.phase === "second_half" ? null : (
        <MatchdayTabellino view={presentation.tabellino} text={text} />
      )}

    </m.section>
  );
}

function MatchdayClock({
  minute,
  running,
  text,
}: Readonly<{
  minute: number;
  running: boolean;
  text: Translator;
}>): React.JSX.Element {
  const reducedMotion = useReducedMotion();

  return (
    <div
      aria-label={`${text("career.matchday.minute")} ${minute}`}
      className="tls-matchday-clock"
      data-clock-running={running ? "true" : "false"}
    >
      <m.span
        aria-hidden="true"
        animate={running && !reducedMotion
          ? webMotionTargets.matchClockRunning
          : webMotionTargets.rest}
        className="tls-matchday-clock-signal"
        data-motion-clock-signal="true"
        transition={running && !reducedMotion
          ? webMotion.matchClockRunning
          : webMotion.micro}
      />
      <m.time
        aria-hidden="true"
        animate={webMotionTargets.rest}
        data-motion-clock-minute={minute}
        initial={reducedMotion ? false : webMotionTargets.matchClockTickEnter}
        key={`minute:${minute}`}
        transition={webMotion.micro}
      >
        {minute}'
      </m.time>
    </div>
  );
}

function MatchdayScoreboard({
  header,
  highlightedGoalSide,
}: Readonly<{
  header: MatchdayScoreHeaderView;
  highlightedGoalSide?: "home" | "away";
}>): React.JSX.Element {
  const reducedMotion = useReducedMotion();
  const previousScore = useRef<Readonly<{ home: number; away: number }> | undefined>(undefined);
  const homeChanged = highlightedGoalSide === "home"
    || (previousScore.current !== undefined && previousScore.current.home !== header.homeGoals);
  const awayChanged = highlightedGoalSide === "away"
    || (previousScore.current !== undefined && previousScore.current.away !== header.awayGoals);

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
    onStartFirstHalf: () => void;
    onStartSecondHalf: () => void;
    onPauseMatch: () => void;
    onResumeMatch: () => void;
    onResolveIncident: () => void;
    onBackToDashboard: () => void;
  }>,
): () => void {
  switch (actionId) {
    case "prepare_match":
      return handlers.onPrepareMatch;
    case "start_first_half":
      return handlers.onStartFirstHalf;
    case "start_second_half":
      return handlers.onStartSecondHalf;
    case "pause_match":
      return handlers.onPauseMatch;
    case "resume_match":
      return handlers.onResumeMatch;
    case "resolve_incident":
      return handlers.onResolveIncident;
    case "back_to_dashboard":
      return handlers.onBackToDashboard;
    case "apply_half_time_substitutions":
      return () => undefined;
  }
}

function blockerLabelKey(blocker: CareerMatchdayBlockerKey): MessageKey {
  return `career.matchday.blocker.${blocker}` as MessageKey;
}
