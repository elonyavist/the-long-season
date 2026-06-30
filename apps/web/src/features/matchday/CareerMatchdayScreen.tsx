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
import type {
  DemoHalfTimeSubstitutionDecision,
  DemoHalfTimeSubstitutionPanel,
  DemoHalfTimeSubstitutionPlayerOption,
} from "./matchday-demo";
import { buildDemoTacticalBoardSquadPlayers } from "../match-preparation/match-preparation-demo";
import { CareerShell } from "../career-shell/CareerShell";
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
    <CareerShell
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
            <p className="tls-shell-status">{activePhaseView === undefined ? text(matchdayStatusKey(view.status)) : text(activePhaseView.periodLabelKey as MessageKey)}</p>
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
    </CareerShell>
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
  const primaryAction = matchCentrePrimaryAction(view, phaseView);

  return (
    <div className="tls-match-centre">
      <section className="tls-match-centre-hero" aria-label={text("career.matchday.score")}>
        <MatchdayScoreboard view={phaseView} text={text} />
        <PhaseRail activePhase={phaseView.phase} text={text} />
      </section>

      <section className="tls-matchday-context-strip" aria-label={text("career.matchday.context")}>
        <MatchdayFact label={text("career.matchday.period")} value={text(phaseView.periodLabelKey as MessageKey)} />
        <MatchdayFact label={text("career.fixtureRound", { round: phaseView.fixture.round })} value={fixtureLine(phaseView)} />
        <MatchdayFact label={text("career.matchday.minute")} value={phaseMinuteLabel(phaseView.currentMinute, text)} />
        <MatchdayFact label={text("career.matchday.selectedSide")} value={text(`career.dashboard.fixtureSide.${phaseView.fixture.selectedClubSide}` as MessageKey)} />
      </section>

      <MatchdayBlockers blockerKeys={view.blockerKeys} text={text} />

      {primaryAction === undefined ? null : (
        <section className="tls-match-centre-actions" aria-label={text("career.matchday.actions")}>
          <button
            className="tls-menu-button tls-menu-button-primary"
            disabled={primaryAction.status !== "available"}
            type="button"
            onClick={handlerForPhaseAction(primaryAction.actionId, {
              onPrepareMatch,
              onPlayFixture,
              onBackToDashboard,
              ...(onStartSecondHalf === undefined ? {} : { onStartSecondHalf }),
            })}
          >
            {text(primaryAction.labelKey as MessageKey)}
          </button>
        </section>
      )}

      {phaseView.phase === "half_time" && matchPreparationView !== undefined && tacticalBoardDraft !== undefined ? (
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
      ) : phaseView.phase === "half_time" && halfTimeSubstitutions?.status === "available" ? (
        <HalfTimeSubstitutionPanel
          panel={halfTimeSubstitutions}
          text={text}
          {...(onApplyHalfTimeSubstitution === undefined ? {} : { onApplyHalfTimeSubstitution })}
        />
      ) : null}

      <div className="tls-match-centre-grid">
        <section className="tls-matchday-card tls-match-centre-timeline" aria-labelledby="matchday-events-title">
          <div className="tls-match-centre-card-heading">
            <h2 id="matchday-events-title">{text("career.matchday.events")}</h2>
            <span>{text("career.matchday.timeline")}</span>
          </div>
          <EventTimeline events={phaseView.timelineEvents} text={text} />
        </section>

        <section className="tls-matchday-card tls-match-centre-key-events" aria-labelledby="matchday-key-events-title">
          <div className="tls-match-centre-card-heading">
            <h2 id="matchday-key-events-title">{text("career.matchday.keyEvents")}</h2>
            <span>{text(`career.matchday.scoreState.${phaseView.scoreboard.selectedClubScoreState}` as MessageKey)}</span>
          </div>
          <KeyEventCards events={phaseView.keyEventCards} text={text} />
        </section>
      </div>

      <section className="tls-matchday-card" aria-labelledby="matchday-player-stats-title">
        <div className="tls-match-centre-card-heading">
          <h2 id="matchday-player-stats-title">{text("career.matchday.playerStats")}</h2>
          <span>{text("career.matchday.playerStatsHint")}</span>
        </div>
        <PlayerPhaseTable rows={phaseView.playerRows} text={text} />
      </section>

      {phaseView.phase === "full_time" ? (
        <FullTimeConsequences
          conditionChanges={phaseView.conditionChanges}
          playerStateChanges={phaseView.playerStateChanges}
          nextStop={view.nextStop}
          text={text}
        />
      ) : null}
    </div>
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
  const lineupPlayerIds = useMemo(
    () => tacticalBoardDraft.slots.flatMap((slot) => (slot.playerId === null ? [] : [slot.playerId])),
    [tacticalBoardDraft.slots],
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
          <h2 id="matchday-half-time-tactical-title">{text("career.matchday.halfTimeTacticalWorkspace")}</h2>
          <p>{text("career.matchday.halfTimeTacticalWorkspaceHint")}</p>
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
          excludedPlayerIds={lineupPlayerIds}
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

function MatchdayScoreboard({ view, text }: Readonly<{ view: CareerMatchdayPhaseView; text: Translator }>): React.JSX.Element {
  return (
    <div className="tls-matchday-scoreboard">
      <strong>{view.fixture.homeClub.name}</strong>
      <div className="tls-matchday-score">
        <span>{view.scoreboard.homeGoals}</span>
        <span>-</span>
        <span>{view.scoreboard.awayGoals}</span>
      </div>
      <strong>{view.fixture.awayClub.name}</strong>
      <small>{text(`career.matchday.scoreState.${view.scoreboard.selectedClubScoreState}` as MessageKey)}</small>
    </div>
  );
}

function PhaseRail({ activePhase, text }: Readonly<{ activePhase: CareerMatchdayPhaseView["phase"]; text: Translator }>): React.JSX.Element {
  const phases = ["pre_match", "first_half", "half_time", "second_half", "full_time"] as const;

  return (
    <ol className="tls-match-centre-phase-rail" aria-label={text("career.matchday.period")}>
      {phases.map((phase) => (
        <li className={phase === activePhase ? "is-active" : undefined} key={phase}>
          {text(`career.matchday.phase.${phase}` as MessageKey)}
        </li>
      ))}
    </ol>
  );
}

function EventTimeline({
  events,
  text,
}: Readonly<{ events: readonly CareerMatchdayPhaseEventView[]; text: Translator }>): React.JSX.Element {
  if (events.length === 0) {
    return <p className="tls-matchday-empty">{text("career.matchday.noEvents")}</p>;
  }

  return (
    <div className="tls-match-centre-event-list">
      {events.map((event) => (
        <article className={`tls-match-centre-event-card is-${event.cardPriority}`} key={event.eventId}>
          <span className="tls-match-centre-event-minute">{event.minute}'</span>
          <span className="tls-match-centre-event-kind">{text(event.labelKey as MessageKey)}</span>
          <strong>{event.club.name}</strong>
          <p>{eventPlayerLine(event, text)}</p>
        </article>
      ))}
    </div>
  );
}

function KeyEventCards({
  events,
  text,
}: Readonly<{ events: readonly CareerMatchdayPhaseEventView[]; text: Translator }>): React.JSX.Element {
  if (events.length === 0) {
    return <p className="tls-matchday-empty">{text("career.matchday.noMajorEvents")}</p>;
  }

  return (
    <div className="tls-match-centre-key-event-list">
      {events.map((event) => (
        <article className="tls-match-centre-key-event" key={event.eventId}>
          <span>{event.minute}'</span>
          <strong>{text(event.labelKey as MessageKey)}</strong>
          <p>{eventPlayerLine(event, text)}</p>
        </article>
      ))}
    </div>
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
      <table className="tls-matchday-table tls-match-centre-player-table">
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
      <h2 id="matchday-consequences-title">{text("career.matchday.consequences")}</h2>
      <div className="tls-matchday-report-grid">
        <section className="tls-matchday-consequence-group" aria-label={text("career.matchday.conditionChanges")}>
          <h3>{text("career.matchday.conditionChanges")}</h3>
          <ConditionChangeList changes={conditionChanges} text={text} />
        </section>
        <section className="tls-matchday-consequence-group" aria-label={text("career.matchday.playerStateChanges")}>
          <h3>{text("career.matchday.playerStateChanges")}</h3>
          <PlayerStateChangeList changes={playerStateChanges} text={text} />
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
): CareerMatchdayPhaseView["actions"][number] | undefined {
  if (view.blockerKeys.length > 0) {
    return {
      actionId: "prepare_match",
      status: "available",
      labelKey: "career.matchday.action.prepare_match",
      blockerKeys: [],
    };
  }

  return phaseView.actions.find((action) => action.status !== "unavailable");
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

function ConditionChangeList({
  changes,
  text,
}: Readonly<{ changes: readonly CareerMatchdayConditionChangeInput[]; text: Translator }>): React.JSX.Element {
  if (changes.length === 0) {
    return <p className="tls-matchday-empty">{text("common.none")}</p>;
  }

  return (
    <ul className="tls-matchday-delta-list">
      {changes.map((change) => (
        <li key={change.playerId}>
          {text("career.matchday.conditionLine", {
            player: change.playerName,
            before: change.before,
            after: change.after,
            delta: signed(change.delta),
          })}
        </li>
      ))}
    </ul>
  );
}

function PlayerStateChangeList({
  changes,
  text,
}: Readonly<{ changes: readonly CareerMatchdayPlayerStateChangeInput[]; text: Translator }>): React.JSX.Element {
  if (changes.length === 0) {
    return <p className="tls-matchday-empty">{text("common.none")}</p>;
  }

  return (
    <ul className="tls-matchday-delta-list">
      {changes.map((change) => (
        <li key={change.playerId}>
          {text("career.matchday.playerStateLine", {
            player: change.playerName,
            formBefore: change.formBefore,
            formAfter: change.formAfter,
            formDelta: signed(change.formDelta),
            moraleBefore: change.moraleBefore,
            moraleAfter: change.moraleAfter,
            moraleDelta: signed(change.moraleDelta),
            reasons: change.reasonKeys.map((reason) => text(`career.advance.playerStateReason.${reason}` as MessageKey)).join(", "),
          })}
        </li>
      ))}
    </ul>
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
    onStartSecondHalf?: () => void;
    onBackToDashboard: () => void;
  }>,
): () => void {
  switch (actionId) {
    case "prepare_match":
      return handlers.onPrepareMatch;
    case "start_first_half":
    case "continue_to_half_time":
      return handlers.onPlayFixture;
    case "start_second_half":
    case "continue_to_full_time":
      return handlers.onStartSecondHalf ?? handlers.onPlayFixture;
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
