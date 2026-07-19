import { useMemo, useState } from "react";
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
import type { MatchdayHalfTimeReviewView } from "./career-matchday-presenter";
import type {
  WebHalfTimeSubstitutionDecision,
  WebHalfTimeSubstitutionPanel,
} from "./matchday-adapter";
import { MatchdayPhaseTabs, type MatchdayPhaseTabItem } from "./MatchdayPhaseTabs";
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
  animateEntry = false,
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
  const reducedMotion = useReducedMotion();
  const animateCheckpoint = animateEntry && !reducedMotion;
  const [activeTabId, setActiveTabId] = useState<HalfTimeTabId>("summary");
  const substitutionCount = text("career.matchday.substitution.count", {
    count: substitutionPanel?.appliedCount ?? 0,
    max: substitutionPanel?.maxCount ?? 5,
  });
  const selectedTeamSignals = useMemo<Readonly<Record<string, MatchdayTeamRatingSignal>>>(() => ({
    ...Object.fromEntries(review.contributors.map((row) => [row.playerId, "contributor"] as const)),
    ...Object.fromEntries(review.watchList.map((row) => [row.playerId, "watch"] as const)),
  }), [review.contributors, review.watchList]);
  const tacticalPanel = matchPreparationView !== undefined && tacticalBoardDraft !== undefined ? (
    <HalfTimeTacticalWorkspace
      tacticalBoardDraft={tacticalBoardDraft}
      view={matchPreparationView}
      text={text}
      {...(substitutionPanel === undefined ? {} : { panel: substitutionPanel })}
      {...(onApplyHalfTimeSubstitution === undefined ? {} : { onApplyHalfTimeSubstitution })}
      {...(onFormationChange === undefined ? {} : { onFormationChange })}
      {...(onLineupPlayerChange === undefined ? {} : { onLineupPlayerChange })}
      {...(onBenchPlayerChange === undefined ? {} : { onBenchPlayerChange })}
      {...(onBoardSlotMove === undefined ? {} : { onBoardSlotMove })}
      {...(onBoardSlotRoleChange === undefined ? {} : { onBoardSlotRoleChange })}
      {...(onBoardSlotClear === undefined ? {} : { onBoardSlotClear })}
    />
  ) : (
    <p className="tls-matchday-empty">{text("career.matchday.halfTimeTacticsUnavailable")}</p>
  );
  const tabs: readonly MatchdayPhaseTabItem<HalfTimeTabId>[] = [
    {
      tabId: "summary",
      label: text("career.matchday.halfTimeTab.summary"),
      panel: (
        <HalfTimeSummary
          appliedSubstitutions={substitutionPanel?.appliedSubstitutions ?? []}
          review={review}
          substitutionCount={substitutionCount}
          text={text}
          validationIssues={validationIssues}
        />
      ),
    },
    {
      tabId: "tactics",
      label: text("career.matchday.halfTimeTab.tactics"),
      panel: tacticalPanel,
    },
    {
      tabId: "selected_team",
      label: text("career.matchday.halfTimeTab.selectedTeam"),
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

function HalfTimeSummary({
  appliedSubstitutions,
  review,
  substitutionCount,
  text,
  validationIssues,
}: Readonly<{
  appliedSubstitutions: WebHalfTimeSubstitutionPanel["appliedSubstitutions"];
  review: MatchdayHalfTimeReviewView;
  substitutionCount: string;
  text: Translator;
  validationIssues: readonly MatchdayHalfTimeValidationIssueView[];
}>): React.JSX.Element {
  return (
    <section className="tls-match-centre-half-time-summary" aria-labelledby="matchday-half-time-summary-title">
      <div className="tls-match-centre-card-heading">
        <div>
          <h2 id="matchday-half-time-summary-title">{text("career.matchday.halfTimeDecision")}</h2>
          <p>{text("career.matchday.halfTimeDecisionHint")}</p>
        </div>
        <span>{substitutionCount}</span>
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
  onApplyHalfTimeSubstitution,
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
  onApplyHalfTimeSubstitution?: (decision: WebHalfTimeSubstitutionDecision) => void;
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
          {...(view.formation.selectedFormationId === undefined
            ? {}
            : { formationMotionKey: view.formation.selectedFormationId })}
          players={tacticalBoardPlayers}
          slots={tacticalBoardDraft.slots}
          text={text}
          onAssign={(slotKey, playerId) => {
            const outgoingPlayerId = tacticalBoardDraft.slots
              .find((slot) => slot.slotId === slotKey)?.playerId;
            const incomingPlayerIsOnBench = view.bench.slots
              .some((slot) => slot.selectedPlayerId === playerId);
            const substitutionAvailable = panel?.status === "available"
              && panel.appliedCount < panel.maxCount;

            if (
              outgoingPlayerId !== undefined
              && outgoingPlayerId !== null
              && incomingPlayerIsOnBench
              && substitutionAvailable
              && onApplyHalfTimeSubstitution !== undefined
            ) {
              onApplyHalfTimeSubstitution({ outgoingPlayerId, incomingPlayerId: playerId });
              return;
            }
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
