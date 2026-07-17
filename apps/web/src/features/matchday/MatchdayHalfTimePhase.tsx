import { useMemo, useState } from "react";
import type { MessageKey, Translator } from "@game/i18n";
import type {
  CareerMatchPreparationBlockerKey,
  CareerMatchPreparationFormationId,
  CareerMatchPreparationView,
  CareerMatchdayPhasePlayerView,
} from "@game/ui";

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
import {
  buildTacticalBoardSquadPlayers,
  type TacticalBoardSquadPlayer,
} from "../tactics-board/tactical-board-squad";
import type { MatchdayHalfTimeReviewView, MatchdayPresentedEventView } from "./career-matchday-presenter";
import { MatchdayLiveEventCard } from "./MatchdayLivePhase";
import type {
  WebHalfTimeSubstitutionDecision,
  WebHalfTimeSubstitutionPanel,
  WebHalfTimeSubstitutionPlayerOption,
} from "./matchday-adapter";

/** One localized issue that must be resolved before the second half can start. */
export interface MatchdayHalfTimeValidationIssueView {
  /** Stable identifier used for rendering and deduplication. */
  readonly issueId: string;
  /** Existing localized explanation for the issue. */
  readonly labelKey: MessageKey;
}

/** Props for the half-time composition; simulation and persistence remain outside. */
export interface MatchdayHalfTimePhaseProps {
  readonly review: MatchdayHalfTimeReviewView;
  readonly text: Translator;
  readonly validationIssues: readonly MatchdayHalfTimeValidationIssueView[];
  readonly matchPreparationView?: CareerMatchPreparationView;
  readonly tacticalBoardDraft?: TacticalBoardDraft;
  readonly substitutionPanel?: WebHalfTimeSubstitutionPanel;
  readonly onApplyHalfTimeSubstitution?: (decision: WebHalfTimeSubstitutionDecision) => void;
  readonly onFormationChange?: (formationId: CareerMatchPreparationFormationId) => void;
  readonly onLineupPlayerChange?: (slotKey: string, playerId: string | undefined) => void;
  readonly onBenchPlayerChange?: (slotKey: string, playerId: string | undefined) => void;
  readonly onBoardSlotMove?: (slotKey: string, nx: number, ny: number) => void;
  readonly onBoardSlotRoleChange?: (slotKey: string, role: TacticalBoardRoleCode) => void;
  readonly onBoardSlotClear?: (slotKey: string) => void;
}

/**
 * Composes the half-time review and tactical decision in one football-first
 * order. Tactical rules continue to live in the shared board and adapters.
 */
export function MatchdayHalfTimePhase({
  review,
  text,
  validationIssues,
  matchPreparationView,
  tacticalBoardDraft,
  substitutionPanel,
  onApplyHalfTimeSubstitution,
  onFormationChange,
  onLineupPlayerChange,
  onBenchPlayerChange,
  onBoardSlotMove,
  onBoardSlotRoleChange,
  onBoardSlotClear,
}: MatchdayHalfTimePhaseProps): React.JSX.Element {
  return (
    <section
      className="tls-match-centre-half-time-decision"
      aria-label={text("career.matchday.halfTimeDecision")}
    >
      <div className="tls-match-centre-half-time-review-layout">
        <HalfTimeReview events={review.decisiveEvents} text={text} />
        <HalfTimeDecisionSignals review={review} text={text} />
      </div>

      <HalfTimeValidation issues={validationIssues} text={text} />

      {matchPreparationView !== undefined && tacticalBoardDraft !== undefined ? (
        <HalfTimeTacticalWorkspace
          tacticalBoardDraft={tacticalBoardDraft}
          view={matchPreparationView}
          text={text}
          {...(substitutionPanel === undefined ? {} : { panel: substitutionPanel })}
          {...(onFormationChange === undefined ? {} : { onFormationChange })}
          {...(onLineupPlayerChange === undefined ? {} : { onLineupPlayerChange })}
          {...(onBenchPlayerChange === undefined ? {} : { onBenchPlayerChange })}
          {...(onBoardSlotMove === undefined ? {} : { onBoardSlotMove })}
          {...(onBoardSlotRoleChange === undefined ? {} : { onBoardSlotRoleChange })}
          {...(onBoardSlotClear === undefined ? {} : { onBoardSlotClear })}
        />
      ) : substitutionPanel?.status === "available" ? (
        <HalfTimeSubstitutionPanel
          panel={substitutionPanel}
          text={text}
          {...(onApplyHalfTimeSubstitution === undefined ? {} : { onApplyHalfTimeSubstitution })}
        />
      ) : null}
    </section>
  );
}

/**
 * Collects tactical blockers once so validation copy and Resume availability
 * cannot disagree. The function only translates existing structured keys.
 */
export function buildMatchdayHalfTimeValidationIssues(
  view: CareerMatchPreparationView | undefined,
  tacticalBoardDraft: TacticalBoardDraft | undefined,
  panel: WebHalfTimeSubstitutionPanel | undefined,
): readonly MatchdayHalfTimeValidationIssueView[] {
  const issues: MatchdayHalfTimeValidationIssueView[] = [];

  if (view !== undefined) {
    issues.push(...view.blockerKeys.map(preparationValidationIssue));
  }

  if ((view === undefined || tacticalBoardDraft === undefined) && panel?.status !== "available") {
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

function HalfTimeReview({
  events,
  text,
}: Readonly<{
  events: readonly MatchdayPresentedEventView[];
  text: Translator;
}>): React.JSX.Element {
  return (
    <section className="tls-matchday-card tls-match-centre-half-time-review" aria-labelledby="matchday-half-time-review-title">
      <div className="tls-match-centre-card-heading">
        <div>
          <h2 id="matchday-half-time-review-title">{text("career.matchday.halfTimeReview")}</h2>
          <p>{text("career.matchday.halfTimeReviewHint")}</p>
        </div>
        <span>{text("career.matchday.fullTimeHighlightsHint")}</span>
      </div>
      <HalfTimeTabellinoEvents events={events} text={text} />
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
        <MatchdayLiveEventCard event={event} key={event.event.eventId} text={text} />
      ))}
    </div>
  );
}

function HalfTimeDecisionSignals({
  review,
  text,
}: Readonly<{
  review: MatchdayHalfTimeReviewView;
  text: Translator;
}>): React.JSX.Element {
  return (
    <aside className="tls-matchday-card tls-match-centre-half-time-signals" aria-labelledby="matchday-half-time-signals-title">
      <div className="tls-match-centre-card-heading">
        <div>
          <h2 id="matchday-half-time-signals-title">{text("career.matchday.halfTimeDecisionSignals")}</h2>
          <p>{text("career.matchday.halfTimeDecisionSignalsHint")}</p>
        </div>
      </div>
      <div className="tls-match-centre-half-time-signal-grid">
        <PlayerSignalGroup
          headingId="matchday-half-time-underperformers-title"
          heading={text("career.matchday.halfTimeUnderperformers")}
          emptyLabel={text("career.matchday.halfTimeNoConcerns")}
          rows={review.watchList}
          text={text}
        />
        <PlayerSignalGroup
          headingId="matchday-half-time-contributors-title"
          heading={text("career.matchday.halfTimeKeyContributors")}
          emptyLabel={text("career.matchday.halfTimeNoContributors")}
          rows={review.contributors}
          text={text}
        />
      </div>
    </aside>
  );
}

function PlayerSignalGroup({
  headingId,
  heading,
  emptyLabel,
  rows,
  text,
}: Readonly<{
  headingId: string;
  heading: string;
  emptyLabel: string;
  rows: readonly CareerMatchdayPhasePlayerView[];
  text: Translator;
}>): React.JSX.Element {
  return (
    <section className="tls-match-centre-half-time-signal-block" aria-labelledby={headingId}>
      <h3 id={headingId}>{heading}</h3>
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
  panel?: WebHalfTimeSubstitutionPanel;
  text: Translator;
  onFormationChange?: (formationId: CareerMatchPreparationFormationId) => void;
  onLineupPlayerChange?: (slotKey: string, playerId: string | undefined) => void;
  onBenchPlayerChange?: (slotKey: string, playerId: string | undefined) => void;
  onBoardSlotMove?: (slotKey: string, nx: number, ny: number) => void;
  onBoardSlotRoleChange?: (slotKey: string, role: TacticalBoardRoleCode) => void;
  onBoardSlotClear?: (slotKey: string) => void;
}>): React.JSX.Element {
  const tacticalBoardPlayers = useMemo(
    () => buildTacticalBoardSquadPlayers(
      view.lineup.slots[0]?.playerOptions ?? view.bench.slots[0]?.playerOptions ?? [],
    ),
    [view],
  );
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

  return (
    <section className="tls-matchday-card tls-match-centre-half-time-workspace" aria-labelledby="matchday-half-time-tactical-title">
      <div className="tls-match-centre-card-heading">
        <div>
          <h2 id="matchday-half-time-tactical-title">{text("career.matchday.halfTimeBoardDecision")}</h2>
          <p>{text("career.matchday.halfTimeBoardDecisionHint")}</p>
        </div>
        <span>{text("career.matchday.substitution.count", { count: panel?.appliedCount ?? 0, max: panel?.maxCount ?? 5 })}</span>
      </div>

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

function HalfTimeSubstitutionPanel({
  panel,
  text,
  onApplyHalfTimeSubstitution,
}: Readonly<{
  panel: WebHalfTimeSubstitutionPanel;
  text: Translator;
  onApplyHalfTimeSubstitution?: (decision: WebHalfTimeSubstitutionDecision) => void;
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
              <option key={player.playerId} value={player.playerId}>{formatHalfTimePlayerOption(player, text)}</option>
            ))}
          </select>
        </label>
        <label className="tls-match-centre-substitution-field">
          <span>{text("career.matchday.substitution.incoming")}</span>
          <select value={incomingPlayerId} onChange={(event) => setSelectedIncomingPlayerId(event.target.value)}>
            {panel.bench.map((player) => (
              <option key={player.playerId} value={player.playerId}>{formatHalfTimePlayerOption(player, text)}</option>
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

      {panel.appliedSubstitutions.length > 0 ? (
        <section className="tls-match-centre-applied-subs" aria-labelledby="matchday-applied-substitutions-title">
          <h3 id="matchday-applied-substitutions-title">{text("career.matchday.substitution.applied")}</h3>
          <ul>
            {panel.appliedSubstitutions.map((substitution) => (
              <li key={`${substitution.outgoingPlayerName}:${substitution.incomingPlayerName}`}>
                {text("career.matchday.substitution.appliedLine", {
                  incoming: substitution.incomingPlayerName,
                  outgoing: substitution.outgoingPlayerName,
                })}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
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

function formatHalfTimePlayerOption(player: WebHalfTimeSubstitutionPlayerOption, text: Translator): string {
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

function preparationValidationIssue(
  blocker: CareerMatchPreparationBlockerKey,
): MatchdayHalfTimeValidationIssueView {
  return {
    issueId: blocker,
    labelKey: `career.matchPreparation.blocker.${blocker}` as MessageKey,
  };
}

/** Converts the saved match-preparation bench into the shared tactical bench view. */
function buildMatchdayTacticalBenchSlots(
  view: CareerMatchPreparationView,
  playerById: ReadonlyMap<string, TacticalBoardSquadPlayer>,
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

/** Maps loaded squad players into bench candidates so the same menu is reused. */
function buildMatchdayTacticalBenchCandidates(
  players: readonly TacticalBoardSquadPlayer[],
): readonly TacticalBenchBoardCandidate[] {
  return players.map(tacticalBenchPlayerFromBoardPlayer);
}

function tacticalBenchPlayerFromBoardPlayer(player: TacticalBoardSquadPlayer): TacticalBenchBoardCandidate {
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
