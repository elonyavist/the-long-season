import { useMemo, useState } from "react";
import type { MessageKey, Translator } from "@game/i18n";
import {
  buildCareerInboxView,
  buildCareerMatchdayPhaseView,
  buildCareerShellView,
} from "@game/ui";
import type {
  CareerMatchdayBlockerKey,
  CareerMatchdayConditionChangeInput,
  CareerMatchPreparationFormationId,
  CareerMatchPreparationView,
  CareerMatchdayPhaseActionId,
  CareerMatchdayPhaseEventView,
  CareerMatchdayPhasePlayerView,
  CareerMatchdayPhaseView,
  CareerMatchdayPlayerStateChangeInput,
  CareerMatchdayStatus,
  CareerMatchdayView,
} from "@game/ui";

import type { DemoCareerContinueResult } from "../dashboard/continue-demo-career";
import {
  buildCareerMatchdayPresentationView,
  type CareerMatchdayPresentationView,
  type MatchdayPresentedEventView,
  type MatchdayPhaseIndicatorView,
  type MatchdayScoreHeaderView,
} from "./career-matchday-presenter";
import type {
  DemoHalfTimeSubstitutionDecision,
  DemoHalfTimeSubstitutionPanel,
  DemoHalfTimeSubstitutionPlayerOption,
} from "./matchday-demo";
import { buildDemoTacticalBoardSquadPlayers } from "../match-preparation/match-preparation-demo";
import { AppShell } from "../app-shell/AppShell";
import { roleLabelKey } from "../../shared/lib/match-preparation-labels";
import {
  TacticalBenchBoard,
  type TacticalBenchBoardCandidate,
} from "../tactics-board/components/TacticalBenchBoard";
import { TacticalBoardPitch } from "../tactics-board/components/TacticalBoardPitch";
import type { TacticalBenchSlotId, TacticalBenchSlotView } from "../tactics-board/tactical-board-bench";
import { selectCurrentTacticalBoardShape } from "../tactics-board/tactical-board-formations";
import { boardRoleFromCanonicalRole } from "../tactics-board/tactical-board-roles";
import type { TacticalBoardDraft } from "../tactics-board/tactical-board-state";
import type { TacticalBoardCanonicalRole, TacticalBoardRoleCode } from "../tactics-board/tactical-board-types";

/** Props for the playable match centre web screen. */
export type CareerMatchdayScreenProps = Readonly<{
  view: CareerMatchdayView;
  phaseView?: CareerMatchdayPhaseView;
  halfTimeSubstitutions?: DemoHalfTimeSubstitutionPanel;
  matchPreparationView?: CareerMatchPreparationView;
  tacticalBoardDraft?: TacticalBoardDraft;
  continueResult?: DemoCareerContinueResult;
  text: Translator;
  onBackToMenu: () => void;
  onBackToDashboard: () => void;
  onContinueCareer: () => void;
  onInboxActionClick: (actionId: string) => void;
  onPrepareMatch: () => void;
  onPlayFixture: () => void;
  onApplyHalfTimeSubstitution?: (decision: DemoHalfTimeSubstitutionDecision) => void;
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
  const activePhaseView = phaseView ?? legacyPhaseViewFromMatchdayView(view);
  const inboxView = buildCareerInboxView(continueResult?.inboxMessages ?? []);
  const shellView = buildCareerShellView({
    activeSectionKey: "fixtures",
    inboxView,
    mode: "matchday",
  });

  return (
    <AppShell
      shellView={shellView}
      selectedClubName={view.selectedClub.name}
      contextItems={[
        { label: text("career.currentDate"), value: view.currentDateIso },
        { label: text("career.matchday.status"), value: text(matchdayStatusKey(view.status)) },
      ]}
      text={text}
      onBackToMenu={onBackToMenu}
      onContinueCareer={onContinueCareer}
      onInboxActionClick={onInboxActionClick}
    >
      <section className="tls-shell-panel tls-matchday-panel" aria-labelledby="career-matchday-title">
        <header className="tls-matchday-header">
          <div>
            <h1 className="tls-shell-title" id="career-matchday-title">{text("career.matchday.title")}</h1>
          </div>
        </header>

        {activePhaseView === undefined ? (
          <UnavailableMatchday view={view} text={text} />
        ) : (
          <MatchCentre
            view={view}
            phaseView={activePhaseView}
            text={text}
            onPrepareMatch={onPrepareMatch}
            onPlayFixture={onPlayFixture}
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
            {...(onStartSecondHalf === undefined ? {} : { onStartSecondHalf })}
          />
        )}
      </section>
    </AppShell>
  );
}

function MatchCentre({
  view,
  phaseView,
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
  onStartSecondHalf,
  onBackToDashboard,
}: Readonly<{
  view: CareerMatchdayView;
  phaseView: CareerMatchdayPhaseView;
  text: Translator;
  onPrepareMatch: () => void;
  onPlayFixture: () => void;
  matchPreparationView?: CareerMatchPreparationView;
  tacticalBoardDraft?: TacticalBoardDraft;
  halfTimeSubstitutions?: DemoHalfTimeSubstitutionPanel;
  onApplyHalfTimeSubstitution?: (decision: DemoHalfTimeSubstitutionDecision) => void;
  onHalfTimeFormationChange?: (formationId: CareerMatchPreparationFormationId) => void;
  onHalfTimeLineupPlayerChange?: (slotKey: string, playerId: string | undefined) => void;
  onHalfTimeBenchPlayerChange?: (slotKey: string, playerId: string | undefined) => void;
  onHalfTimeBoardSlotMove?: (slotKey: string, nx: number, ny: number) => void;
  onHalfTimeBoardSlotRoleChange?: (slotKey: string, role: TacticalBoardRoleCode) => void;
  onHalfTimeBoardSlotClear?: (slotKey: string) => void;
  onStartSecondHalf?: () => void;
  onBackToDashboard: () => void;
}>): React.JSX.Element {
  const [isFirstHalfPlaybackOpen, setFirstHalfPlaybackOpen] = useState(false);
  const [isSecondHalfPlaybackOpen, setSecondHalfPlaybackOpen] = useState(false);
  const visiblePhaseView = isFirstHalfPlaybackOpen && phaseView.phase === "half_time"
    ? firstHalfViewFromHalfTime(phaseView)
    : isSecondHalfPlaybackOpen && phaseView.phase === "full_time"
      ? secondHalfViewFromFullTime(phaseView)
    : phaseView;
  const presentation = buildCareerMatchdayPresentationView(visiblePhaseView);
  const primaryAction = matchCentrePrimaryAction(view, visiblePhaseView, presentation.primaryAction);

  return (
    <div className="tls-match-centre">
      <MatchdayBroadcastHeader
        phaseView={visiblePhaseView}
        presentation={presentation}
        text={text}
        onPrepareMatch={onPrepareMatch}
        onPlayFixture={onPlayFixture}
        onBackToDashboard={onBackToDashboard}
        {...(primaryAction === undefined ? {} : { primaryAction })}
        onStartFirstHalf={() => {
          setFirstHalfPlaybackOpen(true);
          onPlayFixture();
        }}
        onContinueToHalfTime={() => {
          setFirstHalfPlaybackOpen(false);
        }}
        onStartSecondHalf={() => {
          setSecondHalfPlaybackOpen(true);
          onStartSecondHalf?.();
        }}
        onContinueToFullTime={() => {
          setSecondHalfPlaybackOpen(false);
        }}
      />

      <MatchdayBlockers blockerKeys={view.blockerKeys} text={text} />

      {visiblePhaseView.phase === "half_time" ? (
        <section className="tls-match-centre-half-time-decision" aria-label={text("career.matchday.halfTimeDecision")}>
          <HalfTimeStory phaseView={visiblePhaseView} presentation={presentation} text={text} {...(halfTimeSubstitutions === undefined ? {} : { panel: halfTimeSubstitutions })} />
          <div className="tls-match-centre-half-time-layout">
            <div className="tls-match-centre-half-time-primary">
              {matchPreparationView !== undefined && tacticalBoardDraft !== undefined ? (
                <HalfTimeTacticalWorkspace
                  tacticalBoardDraft={tacticalBoardDraft}
                  view={matchPreparationView}
                  text={text}
                  {...(halfTimeSubstitutions === undefined ? {} : { panel: halfTimeSubstitutions })}
                  {...(onHalfTimeFormationChange === undefined ? {} : { onFormationChange: onHalfTimeFormationChange })}
                  {...(onHalfTimeLineupPlayerChange === undefined ? {} : { onLineupPlayerChange: onHalfTimeLineupPlayerChange })}
                  {...(onHalfTimeBenchPlayerChange === undefined ? {} : { onBenchPlayerChange: onHalfTimeBenchPlayerChange })}
                  {...(onHalfTimeBoardSlotMove === undefined ? {} : { onBoardSlotMove: onHalfTimeBoardSlotMove })}
                  {...(onHalfTimeBoardSlotRoleChange === undefined ? {} : { onBoardSlotRoleChange: onHalfTimeBoardSlotRoleChange })}
                  {...(onHalfTimeBoardSlotClear === undefined ? {} : { onBoardSlotClear: onHalfTimeBoardSlotClear })}
                />
              ) : halfTimeSubstitutions?.status === "available" ? (
                <HalfTimeSubstitutionPanel
                  panel={halfTimeSubstitutions}
                  text={text}
                  {...(onApplyHalfTimeSubstitution === undefined ? {} : { onApplyHalfTimeSubstitution })}
                />
              ) : null}
            </div>
            <HalfTimeDecisionSignals phaseView={visiblePhaseView} text={text} {...(halfTimeSubstitutions === undefined ? {} : { panel: halfTimeSubstitutions })} />
          </div>
        </section>
      ) : visiblePhaseView.phase === "full_time" ? (
        <FullTimeResult
          phaseView={visiblePhaseView}
          presentation={presentation}
          nextStop={view.nextStop}
          text={text}
        />
      ) : visiblePhaseView.phase === "pre_match" ? (
        view.blockerKeys.length === 0 ? <PreMatchConfirmation phaseView={visiblePhaseView} text={text} /> : null
      ) : (
        <LiveMatchPhase phaseView={visiblePhaseView} presentation={presentation} text={text} />
      )}

    </div>
  );
}

function firstHalfViewFromHalfTime(phaseView: CareerMatchdayPhaseView): CareerMatchdayPhaseView {
  return {
    ...phaseView,
    phase: "first_half",
    status: "live",
    periodLabelKey: "career.matchday.phase.first_half",
    actions: [{
      actionId: "continue_to_half_time",
      status: "available",
      labelKey: "career.matchday.action.continue_to_half_time",
      blockerKeys: [],
    }],
    nextActionId: "continue_to_half_time",
    conditionChanges: [],
    playerStateChanges: [],
  };
}

function secondHalfViewFromFullTime(phaseView: CareerMatchdayPhaseView): CareerMatchdayPhaseView {
  const timelineEvents = secondHalfTimelineEvents(phaseView.timelineEvents);

  return {
    ...phaseView,
    phase: "second_half",
    status: "live",
    periodLabelKey: "career.matchday.phase.second_half",
    timelineEvents,
    keyEventCards: timelineEvents.filter((event) => event.cardPriority === "major"),
    actions: [{
      actionId: "continue_to_full_time",
      status: "available",
      labelKey: "career.matchday.action.continue_to_full_time",
      blockerKeys: [],
    }],
    nextActionId: "continue_to_full_time",
    conditionChanges: [],
    playerStateChanges: [],
  };
}

function secondHalfTimelineEvents(
  events: readonly CareerMatchdayPhaseEventView[],
): readonly CareerMatchdayPhaseEventView[] {
  const priorGoalContext = events.filter((event) => event.minute <= 45 && event.kind === "goal");
  const secondHalfEvents = events.filter((event) => event.minute > 45);

  return [...priorGoalContext, ...secondHalfEvents];
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
  primaryAction,
  text,
  onPrepareMatch,
  onPlayFixture,
  onBackToDashboard,
  onStartFirstHalf,
  onContinueToHalfTime,
  onStartSecondHalf,
  onContinueToFullTime,
}: Readonly<{
  phaseView: CareerMatchdayPhaseView;
  presentation: CareerMatchdayPresentationView;
  primaryAction?: CareerMatchdayPhaseView["actions"][number];
  text: Translator;
  onPrepareMatch: () => void;
  onPlayFixture: () => void;
  onBackToDashboard: () => void;
  onStartFirstHalf?: () => void;
  onContinueToHalfTime?: () => void;
  onStartSecondHalf?: () => void;
  onContinueToFullTime?: () => void;
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
            disabled={primaryAction.status !== "available"}
            type="button"
            onClick={handlerForPhaseAction(primaryAction.actionId, {
              onPrepareMatch,
              onPlayFixture,
              onBackToDashboard,
              ...(onStartFirstHalf === undefined ? {} : { onStartFirstHalf }),
              ...(onContinueToHalfTime === undefined ? {} : { onContinueToHalfTime }),
              ...(onStartSecondHalf === undefined ? {} : { onStartSecondHalf }),
              ...(onContinueToFullTime === undefined ? {} : { onContinueToFullTime }),
            })}
          >
            {text(primaryAction.labelKey as MessageKey)}
          </button>
        )}
      </div>

      <p className="tls-match-broadcast-live-line">{broadcastLine(phaseView, text)}</p>

      <PhaseRail indicators={presentation.phaseIndicators} text={text} />
    </section>
  );
}

function LiveMatchPhase({
  phaseView,
  presentation,
  text,
}: Readonly<{
  phaseView: CareerMatchdayPhaseView;
  presentation: CareerMatchdayPresentationView;
  text: Translator;
}>): React.JSX.Element {
  const eventGroups = presentation.eventGroups;

  return (
    <section className="tls-matchday-card tls-match-centre-live-phase" aria-labelledby="matchday-live-title">
      <div className="tls-match-centre-card-heading">
        <div>
          <h2 id="matchday-live-title">{text(phaseView.periodLabelKey as MessageKey)}</h2>
          <p>{broadcastLine(phaseView, text)}</p>
        </div>
        <span>{phaseMinuteLabel(phaseView.currentMinute, text)}</span>
      </div>

      {phaseView.phase === "second_half" ? (
        <MatchPressureStrip phaseView={phaseView} presentation={presentation} text={text} />
      ) : null}

      {eventGroups.hasTabellino || eventGroups.hasLiveFeed ? (
        <div className="tls-match-centre-live-feed">
          {eventGroups.tabellino.map((event) => (
            <LiveEventCard event={event} key={event.event.eventId} text={text} />
          ))}
          {eventGroups.liveFeed.map((event) => (
            <LiveEventCard event={event} key={event.event.eventId} text={text} />
          ))}
        </div>
      ) : (
        <p className="tls-matchday-empty">{text("career.matchday.noEvents")}</p>
      )}
    </section>
  );
}

function MatchPressureStrip({
  phaseView,
  presentation,
  text,
}: Readonly<{
  phaseView: CareerMatchdayPhaseView;
  presentation: CareerMatchdayPresentationView;
  text: Translator;
}>): React.JSX.Element {
  const tabellinoCount = presentation.eventGroups.tabellino.length;
  const liveDetailCount = presentation.eventGroups.liveFeed.length;

  return (
    <section className="tls-match-centre-pressure-strip" aria-label={text("career.matchday.matchPressure")}>
      <MatchdayFact
        label={text("career.matchday.scoreState.label")}
        value={text(`career.matchday.scoreState.${phaseView.scoreboard.selectedClubScoreState}` as MessageKey)}
      />
      <MatchdayFact label={text("career.matchday.halfTimeTabellino")} value={`${tabellinoCount}`} />
      <MatchdayFact label={text("career.matchday.events")} value={`${liveDetailCount}`} />
    </section>
  );
}

function LiveEventCard({
  event,
  text,
}: Readonly<{
  event: MatchdayPresentedEventView;
  text: Translator;
}>): React.JSX.Element {
  return (
    <article
      aria-label={matchEventAccessibleLabel(event.event, text)}
      className={`tls-match-centre-live-event is-${event.visualPriority}`}
    >
      <span className="tls-match-centre-event-minute">{event.event.minute}'</span>
      <span className="tls-match-centre-event-kind">{text(event.event.labelKey as MessageKey)}</span>
      <strong>{event.event.club.name}</strong>
      <p>{eventPlayerLine(event.event, text)}</p>
    </article>
  );
}

function FullTimeResult({
  phaseView,
  presentation,
  nextStop,
  text,
}: Readonly<{
  phaseView: CareerMatchdayPhaseView;
  presentation: CareerMatchdayPresentationView;
  nextStop: CareerMatchdayView["nextStop"];
  text: Translator;
}>): React.JSX.Element {
  return (
    <section className="tls-match-centre-full-time" aria-labelledby="matchday-full-time-title">
      <section className="tls-matchday-card tls-match-centre-full-time-tabellino" aria-labelledby="matchday-full-time-title">
        <div className="tls-match-centre-card-heading">
          <div>
            <h2 id="matchday-full-time-title">{text("career.matchday.fullMatchTabellino")}</h2>
            <p>{text("career.matchday.fullMatchTabellinoHint")}</p>
          </div>
          <span>{`${phaseView.scoreboard.homeGoals}-${phaseView.scoreboard.awayGoals}`}</span>
        </div>
        <FullTimeTabellino events={presentation.eventGroups.tabellino} text={text} />
      </section>

      <section className="tls-matchday-card tls-match-centre-full-time-ratings" aria-labelledby="matchday-full-time-ratings-title">
        <div className="tls-match-centre-card-heading">
          <h2 id="matchday-full-time-ratings-title">{text("career.matchday.finalPlayerRatings")}</h2>
          <span>{text("career.matchday.playerStatsHint")}</span>
        </div>
        <PlayerPhaseTable rows={phaseView.playerRows} text={text} />
      </section>

      <FullTimeConsequences
        conditionChanges={phaseView.conditionChanges}
        playerStateChanges={phaseView.playerStateChanges}
        nextStop={nextStop}
        text={text}
      />
    </section>
  );
}

function FullTimeTabellino({
  events,
  text,
}: Readonly<{
  events: readonly MatchdayPresentedEventView[];
  text: Translator;
}>): React.JSX.Element {
  if (events.length === 0) {
    return <p className="tls-matchday-empty">{text("career.matchday.noMajorEvents")}</p>;
  }

  return (
    <div className="tls-match-centre-tabellino-list">
      {events.map((event) => (
        <article
          aria-label={matchEventAccessibleLabel(event.event, text)}
          className={`tls-match-centre-tabellino-event is-${event.visualPriority}`}
          key={event.event.eventId}
        >
          <span className="tls-match-centre-event-minute">{event.event.minute}'</span>
          <div>
            <strong>{text(event.event.labelKey as MessageKey)}</strong>
            <p>{event.event.club.name} - {eventPlayerLine(event.event, text)}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

function HalfTimeStory({
  phaseView,
  presentation,
  panel,
  text,
}: Readonly<{
  phaseView: CareerMatchdayPhaseView;
  presentation: CareerMatchdayPresentationView;
  panel?: DemoHalfTimeSubstitutionPanel;
  text: Translator;
}>): React.JSX.Element {
  const substitutionCount = text("career.matchday.substitution.count", {
    count: panel?.appliedCount ?? 0,
    max: panel?.maxCount ?? 5,
  });

  return (
    <section className="tls-matchday-card tls-match-centre-half-time-story" aria-labelledby="matchday-half-time-story-title">
      <div className="tls-match-centre-card-heading">
        <div>
          <h2 id="matchday-half-time-story-title">{text("career.matchday.halfTimeReview")}</h2>
          <p>{text("career.matchday.halfTimeReviewHint")}</p>
        </div>
        <span>{phaseMinuteLabel(phaseView.currentMinute, text)}</span>
      </div>

      <div className="tls-match-centre-half-time-story-grid">
        <MatchdayFact label={text("career.matchday.halfTimeScore")} value={`${phaseView.scoreboard.homeGoals}-${phaseView.scoreboard.awayGoals}`} />
        <MatchdayFact
          label={text("career.matchday.scoreState.label")}
          value={text(`career.matchday.scoreState.${phaseView.scoreboard.selectedClubScoreState}` as MessageKey)}
        />
        <MatchdayFact label={text("career.matchday.substitution.applied")} value={substitutionCount} />
      </div>

      <section className="tls-match-centre-half-time-tabellino" aria-labelledby="matchday-half-time-events-title">
        <div className="tls-match-centre-card-heading">
          <h3 id="matchday-half-time-events-title">{text("career.matchday.halfTimeTabellino")}</h3>
          <span>{text("career.matchday.fullTimeHighlightsHint")}</span>
        </div>
        <HalfTimeTabellinoEvents events={presentation.eventGroups.tabellino} text={text} />
      </section>
    </section>
  );
}

function HalfTimeTabellinoEvents({
  events,
  text,
}: Readonly<{
  events: readonly MatchdayPresentedEventView[];
  text: Translator;
}>): React.JSX.Element {
  if (events.length === 0) {
    return <p className="tls-matchday-empty">{text("career.matchday.noMajorEvents")}</p>;
  }

  return (
    <div className="tls-match-centre-half-time-event-strip">
      {events.map((event) => (
        <LiveEventCard event={event} key={event.event.eventId} text={text} />
      ))}
    </div>
  );
}

function HalfTimeDecisionSignals({
  phaseView,
  panel,
  text,
}: Readonly<{
  phaseView: CareerMatchdayPhaseView;
  panel?: DemoHalfTimeSubstitutionPanel;
  text: Translator;
}>): React.JSX.Element {
  const selectedClubId = phaseView.selectedClub.clubId;
  const underperformers = selectHalfTimeUnderperformers(phaseView.playerRows, selectedClubId);
  const contributors = selectHalfTimeContributors(phaseView.playerRows, selectedClubId);
  const substitutionCount = text("career.matchday.substitution.count", {
    count: panel?.appliedCount ?? 0,
    max: panel?.maxCount ?? 5,
  });

  return (
    <aside className="tls-matchday-card tls-match-centre-half-time-signals" aria-labelledby="matchday-half-time-signals-title">
      <div className="tls-match-centre-card-heading">
        <div>
          <h2 id="matchday-half-time-signals-title">{text("career.matchday.halfTimeDecisionSignals")}</h2>
          <p>{text("career.matchday.halfTimeDecisionSignalsHint")}</p>
        </div>
        <span>{substitutionCount}</span>
      </div>

      <section className="tls-match-centre-half-time-signal-block" aria-labelledby="matchday-half-time-underperformers-title">
        <div className="tls-match-centre-card-heading">
          <h3 id="matchday-half-time-underperformers-title">{text("career.matchday.halfTimeUnderperformers")}</h3>
          <span>{text("career.matchday.table.rating")}</span>
        </div>
        <PlayerSignalCards rows={underperformers} text={text} />
      </section>

      <section className="tls-match-centre-half-time-signal-block" aria-labelledby="matchday-half-time-contributors-title">
        <div className="tls-match-centre-card-heading">
          <h3 id="matchday-half-time-contributors-title">{text("career.matchday.halfTimeKeyContributors")}</h3>
          <span>{text("career.matchday.table.contribution")}</span>
        </div>
        <PlayerSignalCards rows={contributors} text={text} />
      </section>
    </aside>
  );
}

function HalfTimeSubstitutionPanel({
  panel,
  text,
  onApplyHalfTimeSubstitution,
}: Readonly<{
  panel: DemoHalfTimeSubstitutionPanel;
  text: Translator;
  onApplyHalfTimeSubstitution?: (decision: DemoHalfTimeSubstitutionDecision) => void;
}>): React.JSX.Element {
  const [selectedOutgoingPlayerId, setSelectedOutgoingPlayerId] = useState("");
  const [selectedIncomingPlayerId, setSelectedIncomingPlayerId] = useState("");
  const outgoingPlayerId = selectedOutgoingPlayerId || (panel.lineup[0]?.playerId ?? "");
  const incomingPlayerId = selectedIncomingPlayerId || (panel.bench[0]?.playerId ?? "");
  const canApply = onApplyHalfTimeSubstitution !== undefined
    && outgoingPlayerId.length > 0
    && incomingPlayerId.length > 0
    && panel.appliedCount < panel.maxCount;

  return (
    <section className="tls-matchday-card tls-match-centre-half-time" aria-labelledby="matchday-half-time-title">
      <div className="tls-match-centre-card-heading">
        <div>
          <h2 id="matchday-half-time-title">{text("career.matchday.halfTimeDecision")}</h2>
          <p>{text("career.matchday.halfTimeDecisionHint")}</p>
        </div>
        <span>{text("career.matchday.substitution.count", { count: panel.appliedCount, max: panel.maxCount })}</span>
      </div>

      <div className="tls-match-centre-substitution-grid">
        <label className="tls-match-centre-substitution-field">
          <span>{text("career.matchday.substitution.outgoing")}</span>
          <select value={outgoingPlayerId} onChange={(event) => setSelectedOutgoingPlayerId(event.target.value)}>
            {panel.lineup.map((player) => (
              <option key={player.playerId} value={player.playerId}>
                {formatHalfTimePlayerOption(player, text)}
              </option>
            ))}
          </select>
        </label>

        <label className="tls-match-centre-substitution-field">
          <span>{text("career.matchday.substitution.incoming")}</span>
          <select value={incomingPlayerId} onChange={(event) => setSelectedIncomingPlayerId(event.target.value)}>
            {panel.bench.map((player) => (
              <option key={player.playerId} value={player.playerId}>
                {formatHalfTimePlayerOption(player, text)}
              </option>
            ))}
          </select>
        </label>

        <button
          className="tls-menu-button tls-menu-button-primary"
          disabled={!canApply}
          type="button"
          onClick={() => onApplyHalfTimeSubstitution?.({ outgoingPlayerId, incomingPlayerId })}
        >
          {text("career.matchday.substitution.apply")}
        </button>
      </div>

      {panel.validationReason === undefined ? null : (
        <p className="tls-match-centre-substitution-error">
          {text(`career.matchday.substitution.validation.${panel.validationReason}` as MessageKey)}
        </p>
      )}

      <section className="tls-match-centre-applied-subs" aria-label={text("career.matchday.substitution.applied")}>
        <h3>{text("career.matchday.substitution.applied")}</h3>
        {panel.appliedSubstitutions.length === 0 ? (
          <p className="tls-matchday-empty">{text("career.matchday.substitution.noneApplied")}</p>
        ) : (
          <ul>
            {panel.appliedSubstitutions.map((substitution) => (
              <li key={`${substitution.outgoingPlayerName}-${substitution.incomingPlayerName}`}>
                {text("career.matchday.substitution.appliedLine", {
                  outgoing: substitution.outgoingPlayerName,
                  incoming: substitution.incomingPlayerName,
                })}
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  );
}

function HalfTimeTacticalWorkspace({
  view,
  tacticalBoardDraft,
  panel,
  text,
  onFormationChange,
  onLineupPlayerChange,
  onBenchPlayerChange,
  onBoardSlotMove,
  onBoardSlotRoleChange,
  onBoardSlotClear,
}: Readonly<{
  view: CareerMatchPreparationView;
  tacticalBoardDraft: TacticalBoardDraft;
  panel?: DemoHalfTimeSubstitutionPanel;
  text: Translator;
  onFormationChange?: (formationId: CareerMatchPreparationFormationId) => void;
  onLineupPlayerChange?: (slotKey: string, playerId: string | undefined) => void;
  onBenchPlayerChange?: (slotKey: string, playerId: string | undefined) => void;
  onBoardSlotMove?: (slotKey: string, nx: number, ny: number) => void;
  onBoardSlotRoleChange?: (slotKey: string, role: TacticalBoardRoleCode) => void;
  onBoardSlotClear?: (slotKey: string) => void;
}>): React.JSX.Element {
  const tacticalBoardPlayers = useMemo(() => buildDemoTacticalBoardSquadPlayers(), []);
  const tacticalBoardPlayerById = useMemo(
    () => new Map(tacticalBoardPlayers.map((player) => [player.playerId, player])),
    [tacticalBoardPlayers],
  );
  const tacticalBenchSlots = useMemo(
    () => buildMatchdayTacticalBenchSlots(view, tacticalBoardPlayerById),
    [tacticalBoardPlayerById, view],
  );
  const tacticalBenchCandidates = useMemo(
    () => buildMatchdayTacticalBenchCandidates(tacticalBoardPlayers),
    [tacticalBoardPlayers],
  );
  const currentShape = useMemo(
    () => selectCurrentTacticalBoardShape(tacticalBoardDraft.slots),
    [tacticalBoardDraft.slots],
  );
  const validationKeys = panel?.validationFactKeys ?? (panel?.validationReason === undefined ? [] : [panel.validationReason]);

  return (
    <section className="tls-matchday-card tls-match-centre-half-time-workspace" aria-labelledby="matchday-half-time-tactical-title">
      <div className="tls-match-centre-card-heading">
        <div>
          <h2 id="matchday-half-time-tactical-title">{text("career.matchday.halfTimeBoardDecision")}</h2>
          <p>{text("career.matchday.halfTimeBoardDecisionHint")}</p>
        </div>
        <span>{text("career.matchday.substitution.count", { count: panel?.appliedCount ?? 0, max: panel?.maxCount ?? 5 })}</span>
      </div>

      {validationKeys.length === 0 ? null : (
        <section className="tls-match-centre-tactical-validation" aria-label={text("career.matchday.halfTimeValidation")}>
          <strong>{text("career.matchday.halfTimeValidation")}</strong>
          <ul>
            {validationKeys.map((key) => (
              <li key={key}>{text(halfTimeValidationLabelKey(key))}</li>
            ))}
          </ul>
        </section>
      )}

      <div className="tls-match-centre-half-time-toolbar">
        <label className="tls-preparation-formation-select">
          <span>{text("career.matchPreparation.formation")}</span>
          <select
            value={view.formation.selectedFormationId ?? ""}
            onChange={(event) => {
              onFormationChange?.(event.currentTarget.value as CareerMatchPreparationFormationId);
            }}
          >
            {view.formation.formations.map((formation) => (
              <option key={formation.formationId} value={formation.formationId}>
                {text(formation.labelKey as MessageKey)}
              </option>
            ))}
          </select>
        </label>
        <div className="tls-match-centre-current-shape">
          <span>{text("career.tacticalBoard.currentShape")}</span>
          <strong>{currentShape}</strong>
        </div>
      </div>

      <div className="tls-match-centre-half-time-board">
        <TacticalBoardPitch
          availablePlayers={tacticalBoardPlayers}
          currentShape={currentShape}
          players={tacticalBoardPlayers}
          slots={tacticalBoardDraft.slots}
          text={text}
          onAssign={(slotKey, playerId) => {
            onLineupPlayerChange?.(slotKey, playerId);
          }}
          onRemove={(slotKey) => {
            onBoardSlotClear?.(slotKey);
          }}
          {...(onBoardSlotRoleChange === undefined ? {} : { onRoleChange: onBoardSlotRoleChange })}
          {...(onBoardSlotMove === undefined ? {} : { onSlotMove: onBoardSlotMove })}
        />

        <TacticalBenchBoard
          availablePlayers={tacticalBenchCandidates}
          requiredSlotCount={view.bench.requiredSlotCount}
          selectedSlotCount={view.bench.selectedSlotCount}
          slots={tacticalBenchSlots}
          text={text}
          onAssign={(slotKey, playerId) => {
            onBenchPlayerChange?.(slotKey, playerId);
          }}
          onRemove={(slotKey) => {
            onBenchPlayerChange?.(slotKey, undefined);
          }}
        />
      </div>
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
      <small>{text(`career.matchday.scoreState.${header.selectedClubScoreState}` as MessageKey)}</small>
    </div>
  );
}

function broadcastLine(view: CareerMatchdayPhaseView, text: Translator): string {
  if (view.phase === "full_time") {
    return text("career.matchday.broadcast.fullTimeLine", {
      result: text(`career.matchday.scoreState.${view.scoreboard.selectedClubScoreState}` as MessageKey),
    });
  }

  const latestEvent = view.timelineEvents.at(-1);

  if (latestEvent !== undefined) {
    return text("career.matchday.broadcast.eventLine", {
      minute: latestEvent.minute,
      kind: text(latestEvent.labelKey as MessageKey),
      club: latestEvent.club.name,
      player: eventPlayerLine(latestEvent, text),
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

function PlayerPhaseTable({
  rows,
  text,
}: Readonly<{ rows: readonly CareerMatchdayPhasePlayerView[]; text: Translator }>): React.JSX.Element {
  if (rows.length === 0) {
    return <p className="tls-matchday-empty">{text("common.none")}</p>;
  }

  return (
    <div className="tls-matchday-table-wrap">
      <table
        aria-label={text("career.matchday.playerRatingsTable")}
        className="tls-matchday-table tls-match-centre-player-table"
      >
        <thead>
          <tr>
            <th>{text("career.matchday.table.player")}</th>
            <th>{text("career.matchday.table.club")}</th>
            <th>{text("career.matchday.table.rating")}</th>
            <th>{text("career.matchday.table.condition")}</th>
            <th>{text("career.matchday.table.role")}</th>
            <th>{text("career.matchday.table.contribution")}</th>
            <th>{text("career.matchday.table.status")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.playerId}>
              <td data-label={text("career.matchday.table.player")}>{row.playerName}</td>
              <td data-label={text("career.matchday.table.club")}>{row.club.name}</td>
              <td data-label={text("career.matchday.table.rating")}>{row.rating === undefined ? text("common.unknown") : row.rating.toFixed(1)}</td>
              <td data-label={text("career.matchday.table.condition")}>{row.condition === undefined ? text("common.unknown") : `${row.condition}%`}</td>
              <td data-label={text("career.matchday.table.role")}>{row.roleKey === undefined ? text("common.unknown") : text(roleLabelKey(row.roleKey))}</td>
              <td data-label={text("career.matchday.table.contribution")}>{playerContribution(row, text)}</td>
              <td data-label={text("career.matchday.table.status")}>{text(`career.matchday.playerStatus.${row.status}` as MessageKey)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PlayerSignalCards({
  rows,
  text,
}: Readonly<{ rows: readonly CareerMatchdayPhasePlayerView[]; text: Translator }>): React.JSX.Element {
  if (rows.length === 0) {
    return <p className="tls-matchday-empty">{text("common.none")}</p>;
  }

  return (
    <div className="tls-match-centre-player-signal-list">
      {rows.map((row) => (
        <article className="tls-match-centre-player-signal" key={row.playerId}>
          <div>
            <strong>{row.playerName}</strong>
            <span>{row.club.name}</span>
          </div>
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
            <div>
              <dt>{text("career.matchday.table.status")}</dt>
              <dd>{text(`career.matchday.playerStatus.${row.status}` as MessageKey)}</dd>
            </div>
          </dl>
          <p>{playerContribution(row, text)}</p>
        </article>
      ))}
    </div>
  );
}

function selectHalfTimeUnderperformers(
  rows: readonly CareerMatchdayPhasePlayerView[],
  selectedClubId: string,
): readonly CareerMatchdayPhasePlayerView[] {
  return selectedClubOnPitchRows(rows, selectedClubId)
    .toSorted((first, second) => {
      const firstRating = first.rating ?? 10;
      const secondRating = second.rating ?? 10;
      const firstCondition = first.condition ?? 100;
      const secondCondition = second.condition ?? 100;

      return firstRating - secondRating
        || firstCondition - secondCondition
        || first.playerName.localeCompare(second.playerName);
    })
    .slice(0, 3);
}

function selectHalfTimeContributors(
  rows: readonly CareerMatchdayPhasePlayerView[],
  selectedClubId: string,
): readonly CareerMatchdayPhasePlayerView[] {
  return selectedClubOnPitchRows(rows, selectedClubId)
    .toSorted((first, second) => halfTimeContributionScore(second) - halfTimeContributionScore(first)
      || first.playerName.localeCompare(second.playerName))
    .slice(0, 3);
}

function selectedClubOnPitchRows(
  rows: readonly CareerMatchdayPhasePlayerView[],
  selectedClubId: string,
): readonly CareerMatchdayPhasePlayerView[] {
  return rows.filter((row) => row.club.clubId === selectedClubId && row.status === "on_pitch");
}

function halfTimeContributionScore(row: CareerMatchdayPhasePlayerView): number {
  return (row.rating ?? 0)
    + row.goals * 4
    + row.assists * 3
    + row.saves * 0.8
    + row.blocks
    + row.shotsOnTarget * 0.5;
}

function FullTimeConsequences({
  conditionChanges,
  playerStateChanges,
  nextStop,
  text,
}: Readonly<{
  conditionChanges: readonly CareerMatchdayConditionChangeInput[];
  playerStateChanges: readonly CareerMatchdayPlayerStateChangeInput[];
  nextStop: CareerMatchdayView["nextStop"];
  text: Translator;
}>): React.JSX.Element {
  return (
    <section className="tls-matchday-card tls-match-centre-consequences" aria-labelledby="matchday-consequences-title">
      <div className="tls-match-centre-card-heading">
        <div>
          <h2 id="matchday-consequences-title">{text("career.matchday.postMatchConsequences")}</h2>
          <p>{text("career.matchday.postMatchConsequencesHint")}</p>
        </div>
        <span>{text("career.matchday.nextStop")}</span>
      </div>
      <div className="tls-match-centre-consequence-grid">
        <section className="tls-matchday-consequence-group" aria-label={text("career.matchday.conditionChanges")}>
          <h3>{text("career.matchday.conditionChanges")}</h3>
          <ConditionChangeCards changes={conditionChanges} text={text} />
        </section>
        <section className="tls-matchday-consequence-group" aria-label={text("career.matchday.playerStateChanges")}>
          <h3>{text("career.matchday.playerStateChanges")}</h3>
          <PlayerStateChangeCards changes={playerStateChanges} text={text} />
        </section>
      </div>
      <section className="tls-matchday-next" aria-label={text("career.matchday.nextStop")}>
        <MatchdayFact
          label={text("career.matchday.nextStop")}
          value={nextStop.status === "available" ? `${nextStop.reason ?? text("common.unknown")} - ${nextStop.dateIso ?? ""}` : text("common.none")}
        />
      </section>
    </section>
  );
}

/** Chooses exactly one primary matchday action for the current phase. */
function matchCentrePrimaryAction(
  view: CareerMatchdayView,
  phaseView: CareerMatchdayPhaseView,
  presenterPrimaryAction: CareerMatchdayPhaseView["actions"][number] | undefined,
): CareerMatchdayPhaseView["actions"][number] | undefined {
  if (view.blockerKeys.length > 0) {
    return {
      actionId: "prepare_match",
      status: "available",
      labelKey: "career.matchday.action.prepare_match",
      blockerKeys: [],
    };
  }

  return presenterPrimaryAction ?? phaseView.actions.find((action) => action.status !== "unavailable");
}

function UnavailableMatchday({ view, text }: Readonly<{ view: CareerMatchdayView; text: Translator }>): React.JSX.Element {
  return (
    <section className="tls-matchday-preplay" aria-label={text("career.matchday.score")}>
      <p className="tls-matchday-empty">{fixtureLineFromLegacy(view, text)}</p>
      <MatchdayBlockers blockerKeys={view.blockerKeys} text={text} />
    </section>
  );
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

function ConditionChangeCards({
  changes,
  text,
}: Readonly<{ changes: readonly CareerMatchdayConditionChangeInput[]; text: Translator }>): React.JSX.Element {
  if (changes.length === 0) {
    return <p className="tls-matchday-empty">{text("common.none")}</p>;
  }

  return (
    <div className="tls-match-centre-consequence-list">
      {changes.map((change) => (
        <article className="tls-match-centre-consequence-card" key={change.playerId}>
          <strong>{change.playerName}</strong>
          <span>{change.before} -&gt; {change.after}</span>
          <em>{signed(change.delta)}</em>
        </article>
      ))}
    </div>
  );
}

function PlayerStateChangeCards({
  changes,
  text,
}: Readonly<{ changes: readonly CareerMatchdayPlayerStateChangeInput[]; text: Translator }>): React.JSX.Element {
  if (changes.length === 0) {
    return <p className="tls-matchday-empty">{text("common.none")}</p>;
  }

  return (
    <div className="tls-match-centre-consequence-list">
      {changes.map((change) => (
        <article className="tls-match-centre-consequence-card is-state" key={change.playerId}>
          <strong>{change.playerName}</strong>
          <span>{text("career.matchday.formDelta", {
            before: change.formBefore,
            after: change.formAfter,
            delta: signed(change.formDelta),
          })}</span>
          <span>{text("career.matchday.moraleDelta", {
            before: change.moraleBefore,
            after: change.moraleAfter,
            delta: signed(change.moraleDelta),
          })}</span>
          <small>{change.reasonKeys.map((reason) => text(`career.advance.playerStateReason.${reason}` as MessageKey)).join(", ")}</small>
        </article>
      ))}
    </div>
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
  actionId: CareerMatchdayPhaseActionId,
  handlers: Readonly<{
    onPrepareMatch: () => void;
    onPlayFixture: () => void;
    onStartFirstHalf?: () => void;
    onContinueToHalfTime?: () => void;
    onStartSecondHalf?: () => void;
    onContinueToFullTime?: () => void;
    onBackToDashboard: () => void;
  }>,
): () => void {
  switch (actionId) {
    case "prepare_match":
      return handlers.onPrepareMatch;
    case "start_first_half":
      return handlers.onStartFirstHalf ?? handlers.onPlayFixture;
    case "continue_to_half_time":
      return handlers.onContinueToHalfTime ?? handlers.onPlayFixture;
    case "start_second_half":
      return handlers.onStartSecondHalf ?? handlers.onPlayFixture;
    case "continue_to_full_time":
      return handlers.onContinueToFullTime ?? handlers.onStartSecondHalf ?? handlers.onPlayFixture;
    case "back_to_dashboard":
      return handlers.onBackToDashboard;
    case "apply_half_time_substitutions":
      return () => undefined;
  }
}

function legacyPhaseViewFromMatchdayView(view: CareerMatchdayView): CareerMatchdayPhaseView | undefined {
  if (view.fixture.status !== "available") {
    return undefined;
  }

  const isFullTime = view.status === "played";

  return buildCareerMatchdayPhaseView({
    saveId: view.saveId,
    currentDateIso: view.currentDateIso,
    selectedClub: view.selectedClub,
    fixture: {
      fixtureId: view.fixture.fixtureId ?? "fixture:unknown",
      dateIso: view.fixture.dateIso ?? view.currentDateIso,
      round: view.fixture.round ?? 0,
      homeClub: {
        clubId: view.fixture.homeClubId ?? "club:home",
        name: view.fixture.homeClubName ?? "Home",
      },
      awayClub: {
        clubId: view.fixture.awayClubId ?? "club:away",
        name: view.fixture.awayClubName ?? "Away",
      },
      selectedClubSide: view.fixture.selectedClubSide ?? "home",
    },
    phase: isFullTime ? "full_time" : "pre_match",
    currentMinute: isFullTime ? 90 : 0,
    scoreboard: {
      homeGoals: view.score.status === "available" ? view.score.homeGoals ?? 0 : 0,
      awayGoals: view.score.status === "available" ? view.score.awayGoals ?? 0 : 0,
    },
    events: view.events,
    players: view.playerStats.map((row) => ({
      playerId: row.playerId,
      playerName: row.playerName,
      club: row.club,
      status: "on_pitch",
      goals: row.goals,
      assists: row.assists,
      shots: row.shots,
      shotsOnTarget: row.shotsOnTarget,
      saves: row.saves,
      blocks: 0,
    })),
    conditionChanges: view.conditionChanges,
    playerStateChanges: view.playerStateChanges,
    ...(isFullTime ? { nextActionId: "back_to_dashboard" as const } : {}),
  });
}

function fixtureLine(view: CareerMatchdayPhaseView): string {
  return `${view.fixture.homeClub.name} vs ${view.fixture.awayClub.name}`;
}

function fixtureLineFromLegacy(view: CareerMatchdayView, text: Translator): string {
  if (view.fixture.status !== "available") {
    return text("career.noNextSelectedClubFixture");
  }

  return `${view.fixture.homeClubName ?? text("common.unknown")} vs ${view.fixture.awayClubName ?? text("common.unknown")}`;
}

function phaseMinuteLabel(minute: number, text: Translator): string {
  return minute === 0 ? text("career.matchday.notStarted") : `${minute}'`;
}

function eventPlayerLine(event: CareerMatchdayPhaseEventView, text: Translator): string {
  if (event.playerName === undefined) {
    return text("common.unknown");
  }

  if (event.secondaryPlayerName === undefined) {
    return event.playerName;
  }

  return `${event.playerName} (${event.secondaryPlayerName})`;
}

function matchEventAccessibleLabel(event: CareerMatchdayPhaseEventView, text: Translator): string {
  return text("career.matchday.eventLine", {
    minute: event.minute,
    kind: text(event.labelKey as MessageKey),
    club: event.club.name,
    player: eventPlayerLine(event, text),
  });
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

function formatHalfTimePlayerOption(player: DemoHalfTimeSubstitutionPlayerOption, text: Translator): string {
  const role = player.roleKey === undefined ? text("common.unknown") : text(roleLabelKey(player.roleKey));
  const rating = player.rating === undefined ? text("common.unknown") : player.rating.toFixed(1);
  const condition = player.condition === undefined ? text("common.unknown") : `${player.condition}%`;

  return text("career.matchday.substitution.playerOption", {
    player: player.playerName,
    role,
    rating,
    condition,
  });
}

type DemoTacticalBoardPlayer = ReturnType<typeof buildDemoTacticalBoardSquadPlayers>[number];

/** Converts the saved match-preparation bench into the shared tactical bench board view. */
function buildMatchdayTacticalBenchSlots(
  view: CareerMatchPreparationView,
  playerById: ReadonlyMap<string, DemoTacticalBoardPlayer>,
): readonly TacticalBenchSlotView[] {
  return view.bench.slots.map((slot) => {
    const selectedPlayer = slot.selectedPlayerId === undefined ? undefined : playerById.get(slot.selectedPlayerId);

    return {
      slotId: slot.slotKey as TacticalBenchSlotId,
      labelKey: slot.labelKey as MessageKey,
      status: slot.status,
      ...(selectedPlayer === undefined ? {} : { player: tacticalBenchPlayerFromBoardPlayer(selectedPlayer) }),
    };
  });
}

/** Maps all demo squad players into bench-board candidates so the same menu can be reused at half-time. */
function buildMatchdayTacticalBenchCandidates(
  players: readonly DemoTacticalBoardPlayer[],
): readonly TacticalBenchBoardCandidate[] {
  return players.map(tacticalBenchPlayerFromBoardPlayer);
}

function tacticalBenchPlayerFromBoardPlayer(player: DemoTacticalBoardPlayer): TacticalBenchBoardCandidate {
  return {
    playerId: player.playerId,
    number: player.number,
    surname: player.surname,
    roleCode: boardRoleFromCanonicalRole(player.primaryRole as TacticalBoardCanonicalRole),
    name: player.name,
    roleKey: player.roleKey,
    ...(player.positionKey === undefined ? {} : { positionKey: player.positionKey }),
    ...(player.currentAbility === undefined ? {} : { currentAbility: player.currentAbility }),
    ...(player.fitness === undefined ? {} : { fitness: player.fitness }),
  };
}

function halfTimeValidationLabelKey(key: string): MessageKey {
  return `career.matchday.halfTimeValidation.${key}` as MessageKey;
}

function signed(value: number): string {
  return value > 0 ? `+${value}` : String(value);
}

function matchdayStatusKey(status: CareerMatchdayStatus): MessageKey {
  return `career.matchday.status.${status}` as MessageKey;
}

function blockerLabelKey(blocker: CareerMatchdayBlockerKey): MessageKey {
  return `career.matchday.blocker.${blocker}` as MessageKey;
}
