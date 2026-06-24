import { useMemo, useState } from "react";
import type React from "react";

import type { MessageKey, Translator } from "@game/i18n";
import { buildCareerInboxView, buildCareerShellView } from "@game/ui";
import type {
  CareerMatchPreparationBlockerKey,
  CareerMatchPreparationFormationId,
  CareerMatchPreparationView,
} from "@game/ui";

import type { DemoCareerContinueResult } from "../dashboard/continue-demo-career";
import { CareerShell } from "../career-shell/CareerShell";
import { comparePlayerOptionsByPosition } from "../../shared/lib/player-position-ordering";
import {
  benchStatusLabelKey,
  formatFitnessPercent,
  formatFoot,
  roleLabelKey,
} from "../../shared/lib/match-preparation-labels";
import { PlayerCandidateRow, type PlayerCandidateSuitabilityTone } from "../../shared/ui/PlayerCandidateRow";
import { PlayerFactPanel } from "../../shared/ui/PlayerFactPanel";
import { SquadSelectionTable, type SquadSelectionRow } from "../../shared/ui/SquadSelectionTable";
import { TacticalBoardPitch } from "../tactics-board/components/TacticalBoardPitch";
import { selectCurrentTacticalBoardShape } from "../tactics-board/tactical-board-formations";
import type { TacticalBoardDraft } from "../tactics-board/tactical-board-state";
import type { TacticalBoardRoleCode } from "../tactics-board/tactical-board-types";
import {
  buildDemoTacticalBoardSquadPlayers,
  getDemoMatchPreparationPlayerFact,
  type DemoMatchPreparationSelectionAction,
} from "./match-preparation-demo";

/** Props for the first editable match-preparation screen. */
export type CareerMatchPreparationScreenProps = Readonly<{
  view: CareerMatchPreparationView;
  tacticalBoardDraft: TacticalBoardDraft;
  continueResult?: DemoCareerContinueResult;
  text: Translator;
  onBackToMenu: () => void;
  onBackToDashboard: () => void;
  onContinueCareer: () => void;
  onInboxActionClick: (actionId: string) => void;
  onFormationChange: (formationId: CareerMatchPreparationFormationId) => void;
  onLineupPlayerChange: (slotKey: string, playerId: string | undefined) => void;
  onBenchPlayerChange: (slotKey: string, playerId: string | undefined) => void;
  onTacticProfileChange: (tacticProfileId: string | undefined) => void;
  onSelectionAction: (action: DemoMatchPreparationSelectionAction) => void;
  onBoardSlotMove: (slotKey: string, nx: number, ny: number) => void;
  onBoardSlotRoleChange: (slotKey: string, role: TacticalBoardRoleCode) => void;
  onBoardSlotClear: (slotKey: string) => void;
  onSavePreparation: () => void;
}>;

type MatchPreparationPlayerOption = CareerMatchPreparationView["lineup"]["slots"][number]["playerOptions"][number];
type MatchPreparationBenchSlot = CareerMatchPreparationView["bench"]["slots"][number];
type DemoTacticalBoardPlayer = ReturnType<typeof buildDemoTacticalBoardSquadPlayers>[number];

/** Renders the editable lineup slice for the next selected-club fixture. */
export function CareerMatchPreparationScreen({
  view,
  tacticalBoardDraft,
  continueResult,
  text,
  onBackToMenu,
  onBackToDashboard,
  onContinueCareer,
  onInboxActionClick,
  onFormationChange,
  onLineupPlayerChange,
  onBenchPlayerChange,
  onTacticProfileChange,
  onSelectionAction,
  onBoardSlotMove,
  onBoardSlotRoleChange,
  onBoardSlotClear,
  onSavePreparation,
}: CareerMatchPreparationScreenProps): React.JSX.Element {
  const inboxView = buildCareerInboxView(continueResult?.inboxMessages ?? []);
  const shellView = buildCareerShellView({
    activeSectionKey: "dashboard",
    inboxView,
  });
  const playerStatusById = useMemo(() => buildPlayerStatusById(view), [view]);
  const tacticalBoardPlayers = useMemo(() => buildDemoTacticalBoardSquadPlayers(), []);
  const tacticalBoardPlayerById = useMemo(
    () => new Map(tacticalBoardPlayers.map((player) => [player.playerId, player])),
    [tacticalBoardPlayers],
  );
  const currentShape = useMemo(
    () => selectCurrentTacticalBoardShape(tacticalBoardDraft.slots),
    [tacticalBoardDraft.slots],
  );
  const squadRows = useMemo(() => buildSquadRows(view, playerStatusById), [playerStatusById, view]);
  const firstSelectedPlayerId = firstPreparedPlayerId(view);
  const [selectedDetailPlayerId, setSelectedDetailPlayerId] = useState<string | undefined>(
    firstSelectedPlayerId ?? squadRows[0]?.player.playerId,
  );
  const selectedDetailRow =
    squadRows.find((row) => row.player.playerId === selectedDetailPlayerId) ??
    squadRows.find((row) => row.status === "selected") ??
    squadRows[0];
  const preparationMetrics = [
    {
      label: text("career.matchPreparation.selectedSlots"),
      value: `${view.lineup.selectedSlotCount}/${view.lineup.requiredSlotCount}`,
    },
    {
      label: text("career.matchPreparation.bench.selectedSlots"),
      value: `${view.bench.selectedSlotCount}/${view.bench.requiredSlotCount}`,
    },
  ] as const;

  return (
    <CareerShell
      shellView={shellView}
      selectedClubName={view.selectedClub.name}
      contextItems={[
        {
          label: text("career.currentDate"),
          value: view.nextFixture?.dateIso ?? text("common.unknown"),
        },
        {
          label: text("career.matchPreparation.selectedSlots"),
          value: `${view.lineup.selectedSlotCount}/${view.lineup.requiredSlotCount}`,
        },
        {
          label: text("career.matchPreparation.bench.selectedSlots"),
          value: `${view.bench.selectedSlotCount}/${view.bench.requiredSlotCount}`,
        },
      ]}
      text={text}
      onBackToMenu={onBackToMenu}
      onContinueCareer={onContinueCareer}
      onInboxActionClick={onInboxActionClick}
    >
      <section className="tls-shell-panel tls-preparation-panel" aria-labelledby="match-preparation-title">
        <header className="tls-preparation-header">
          <div>
            <h1 className="tls-shell-title" id="match-preparation-title">{text("career.matchPreparation")}</h1>
            <p className="tls-shell-status">{text(view.summaryKey as MessageKey)}</p>
          </div>
          <button className="tls-menu-button tls-preparation-dashboard" type="button" onClick={onBackToDashboard}>
            {text("career.shell.nav.dashboard")}
          </button>
        </header>

        <section className="tls-preparation-match-strip" aria-label={text("career.matchPreparation.context")}>
          <div className="tls-preparation-match-primary">
            <PreparationFact label={text("career.nextSelectedClubFixture")} value={formatFixture(view, text)} />
          </div>
          <div className="tls-preparation-match-metrics">
            {preparationMetrics.map((metric) => (
              <PreparationFact key={metric.label} label={metric.label} value={metric.value} />
            ))}
          </div>
        </section>

        <PreparationAlertStrip blockerKeys={view.blockerKeys} text={text} />

        <section className="tls-preparation-lineup" aria-labelledby="match-preparation-lineup-title">
          <div className="tls-preparation-section-heading">
            <h2 id="match-preparation-lineup-title">{text("career.matchPreparation.lineup")}</h2>
          </div>

          <div className="tls-preparation-board">
            <div className="tls-preparation-tactical-column">
              <div className="tls-preparation-board-toolbar">
                <div className="tls-preparation-selection-actions" aria-label={text("career.matchPreparation.selectionActions")}>
                  <button className="tls-menu-button tls-preparation-helper-button" type="button" onClick={() => onSelectionAction("auto")}>
                    {text("career.matchPreparation.action.auto")}
                  </button>
                  <button
                    className="tls-menu-button tls-preparation-helper-button"
                    type="button"
                    onClick={() => onSelectionAction("fill_gaps")}
                  >
                    {text("career.matchPreparation.action.fillGaps")}
                  </button>
                  <button
                    className="tls-menu-button tls-preparation-helper-button"
                    type="button"
                    onClick={() => onSelectionAction("clear")}
                  >
                    {text("career.matchPreparation.action.clear")}
                  </button>
                </div>
                <label className="tls-preparation-formation-select">
                  <span>{text("career.matchPreparation.formation")}</span>
                  <select
                    value={view.formation.selectedFormationId ?? ""}
                    onChange={(event) => {
                      onFormationChange(event.currentTarget.value as CareerMatchPreparationFormationId);
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

              <TacticalBoardPitch
                availablePlayers={tacticalBoardPlayers}
                currentShape={currentShape}
                players={tacticalBoardPlayers}
                slots={tacticalBoardDraft.slots}
                text={text}
                onAssign={(slotKey, playerId) => {
                  onLineupPlayerChange(slotKey, playerId);
                  setSelectedDetailPlayerId(playerId);
                }}
                onRemove={onBoardSlotClear}
                onRoleChange={onBoardSlotRoleChange}
                onSlotMove={onBoardSlotMove}
                onSlotOpen={(slotKey) => {
                  const playerId = tacticalBoardDraft.slots.find((slot) => slot.slotId === slotKey)?.playerId;

                  if (playerId !== undefined && playerId !== null) {
                    setSelectedDetailPlayerId(playerId);
                  }
                }}
              />

              <BenchSelectionGrid
                playerById={tacticalBoardPlayerById}
                slots={view.bench.slots}
                selectedSlotCount={view.bench.selectedSlotCount}
                requiredSlotCount={view.bench.requiredSlotCount}
                text={text}
                onBenchPlayerChange={onBenchPlayerChange}
                onSelectedPlayerFocus={setSelectedDetailPlayerId}
              />
            </div>

            <aside className="tls-preparation-squad-panel" aria-labelledby="match-preparation-squad-title">
              <SquadSelectionTable
                rows={squadRows}
                selectedPlayerId={selectedDetailRow?.player.playerId}
                text={text}
                onPlayerSelect={setSelectedDetailPlayerId}
              />

              <PlayerFactPanel row={selectedDetailRow} text={text} />
            </aside>
          </div>
        </section>

        <section className="tls-preparation-tactic" aria-labelledby="match-preparation-tactic-title">
          <h2 id="match-preparation-tactic-title">{text("career.matchPreparation.tactic")}</h2>
          <div className="tls-preparation-tactic-grid">
            {view.tactic.profiles.map((profile) => (
              <label className="tls-preparation-tactic-card" data-selected={profile.isSelected} key={profile.tacticProfileId}>
                <span className="tls-preparation-tactic-title">
                  <input
                    checked={profile.isSelected}
                    name="match-preparation-tactic"
                    type="radio"
                    value={profile.tacticProfileId}
                    onChange={(event) => {
                      onTacticProfileChange(event.currentTarget.value);
                    }}
                  />
                  {text(profile.labelKey as MessageKey)}
                </span>
                <span>{text("setup.mentality")}: {text(mentalityLabelKey(profile.values.mentality))}</span>
                <span>{text("career.matchPreparation.tacticValue.pressing")}: {formatTacticValue(profile.values.pressing)}</span>
                <span>{text("career.matchPreparation.tacticValue.directness")}: {formatTacticValue(profile.values.directness)}</span>
                <span>{text("career.matchPreparation.tacticValue.width")}: {formatTacticValue(profile.values.width)}</span>
                <span>{text("career.matchPreparation.tacticValue.risk")}: {formatTacticValue(profile.values.risk)}</span>
              </label>
            ))}
          </div>
        </section>

        <section className="tls-preparation-save" aria-label={text("career.matchPreparation.save")}>
          <p className="tls-dashboard-line">{text(view.summaryKey as MessageKey)}</p>
          <button
            className="tls-menu-button tls-menu-button-primary"
            disabled={view.saveAction.status !== "available"}
            type="button"
            onClick={onSavePreparation}
          >
            {text(view.saveAction.labelKey as MessageKey)}
          </button>
        </section>
      </section>
    </CareerShell>
  );
}

/** Renders the compact preparation blocker strip without changing blocker semantics. */
function PreparationAlertStrip({
  blockerKeys,
  text,
}: Readonly<{
  blockerKeys: readonly CareerMatchPreparationBlockerKey[];
  text: Translator;
}>): React.JSX.Element {
  const isReady = blockerKeys.length === 0;

  return (
    <section
      aria-label={text("career.matchPreparation.blockers")}
      className="tls-preparation-alert-strip"
      data-status={isReady ? "ready" : "blocked"}
    >
      <strong>{isReady ? text("career.matchPreparation.noBlockers") : text("career.matchPreparation.blockers")}</strong>
      {isReady ? (
        <span>{text("career.matchPreparation.noLineupBlockers")}</span>
      ) : (
        <ul>
          {blockerKeys.map((blocker) => (
            <li key={blocker}>{text(blockerLabelKey(blocker))}</li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** Renders the 8 explicit reserve slots with the same candidate-row language as XI assignment. */
function BenchSelectionGrid({
  slots,
  selectedSlotCount,
  requiredSlotCount,
  playerById,
  text,
  onBenchPlayerChange,
  onSelectedPlayerFocus,
}: Readonly<{
  slots: readonly MatchPreparationBenchSlot[];
  selectedSlotCount: number;
  requiredSlotCount: number;
  playerById: ReadonlyMap<string, DemoTacticalBoardPlayer>;
  text: Translator;
  onBenchPlayerChange: (slotKey: string, playerId: string | undefined) => void;
  onSelectedPlayerFocus?: (playerId: string) => void;
}>): React.JSX.Element {
  return (
    <section className="tls-preparation-bench" aria-labelledby="match-preparation-bench-title">
      <div className="tls-preparation-bench-header">
        <h3 id="match-preparation-bench-title">{text("career.matchPreparation.bench")}</h3>
        <span>{text("career.matchPreparation.bench.selectedSlots")}: {selectedSlotCount}/{requiredSlotCount}</span>
      </div>
      <div className="tls-preparation-bench-grid">
        {slots.map((slot) => (
          <BenchSlotPicker
            key={slot.slotKey}
            playerById={playerById}
            slot={slot}
            text={text}
            onBenchPlayerChange={onBenchPlayerChange}
            {...(onSelectedPlayerFocus === undefined ? {} : { onSelectedPlayerFocus })}
          />
        ))}
      </div>
    </section>
  );
}

/** Renders one manual reserve picker; this is not bench drag/drop or hidden auto-selection. */
function BenchSlotPicker({
  slot,
  playerById,
  text,
  onBenchPlayerChange,
  onSelectedPlayerFocus,
}: Readonly<{
  slot: MatchPreparationBenchSlot;
  playerById: ReadonlyMap<string, DemoTacticalBoardPlayer>;
  text: Translator;
  onBenchPlayerChange: (slotKey: string, playerId: string | undefined) => void;
  onSelectedPlayerFocus?: (playerId: string) => void;
}>): React.JSX.Element {
  const selectedPlayer = slot.selectedPlayerId === undefined ? undefined : playerById.get(slot.selectedPlayerId);

  return (
    <details className="tls-preparation-bench-slot" data-status={slot.status}>
      <summary className="tls-preparation-bench-summary">
        <span className="tls-preparation-bench-label">
          <span>{text(slot.labelKey as MessageKey)}</span>
          {slot.status === "valid" ? null : (
            <span
              aria-label={text(benchStatusLabelKey(slot.status))}
              className="tls-preparation-slot-alert"
              title={text(benchStatusLabelKey(slot.status))}
            >
              !
            </span>
          )}
        </span>
        {selectedPlayer === undefined ? (
          <span className="tls-preparation-bench-empty">{text("career.matchPreparation.playerOptionEmpty")}</span>
        ) : (
          <BenchCandidateRow player={selectedPlayer} text={text} />
        )}
      </summary>
      <div className="tls-preparation-bench-candidates">
        <button
          className="tls-preparation-bench-candidate"
          type="button"
          onClick={(event) => {
            onBenchPlayerChange(slot.slotKey, undefined);
            event.currentTarget.closest("details")?.removeAttribute("open");
          }}
        >
          {text("career.matchPreparation.playerOptionEmpty")}
        </button>
        {[...slot.playerOptions].sort(comparePlayerOptionsByPosition).map((player) => {
          const boardPlayer = playerById.get(player.playerId);

          if (boardPlayer === undefined) {
            return null;
          }

          return (
            <button
              className="tls-preparation-bench-candidate"
              key={player.playerId}
              type="button"
              onClick={(event) => {
                onBenchPlayerChange(slot.slotKey, player.playerId);
                onSelectedPlayerFocus?.(player.playerId);
                event.currentTarget.closest("details")?.removeAttribute("open");
              }}
            >
              <BenchCandidateRow player={boardPlayer} text={text} />
            </button>
          );
        })}
      </div>
    </details>
  );
}

/** Renders one bench candidate using own-role suitability, not hidden squad-coverage logic. */
function BenchCandidateRow({
  player,
  text,
}: Readonly<{
  player: DemoTacticalBoardPlayer;
  text: Translator;
}>): React.JSX.Element {
  const fact = getDemoMatchPreparationPlayerFact(player.playerId);
  const suitabilityTone = benchSuitabilityTone(player);

  return (
    <PlayerCandidateRow
      fitnessText={formatFitnessPercent(player.fitness, text)}
      number={player.number}
      roleLabel={text(roleLabelKey(player.roleKey))}
      surname={player.surname}
      suitabilityLabel={text(`career.tacticalBoard.suit.${suitabilityTone}` as MessageKey)}
      suitabilityTone={suitabilityTone}
      {...(fact?.foot === undefined ? {} : { footLabel: formatFoot(fact.foot, text) })}
    />
  );
}

/** Maps bench display suitability to the player's own current role facts. */
function benchSuitabilityTone(player: DemoTacticalBoardPlayer): PlayerCandidateSuitabilityTone {
  return player.positionKey === undefined ? "competent" : "natural";
}

/** Builds the current player status map for squad status display. */
function buildPlayerStatusById(view: CareerMatchPreparationView): ReadonlyMap<string, SquadSelectionRow["status"]> {
  const statusById = new Map<string, SquadSelectionRow["status"]>();

  for (const slot of view.bench.slots) {
    if (slot.selectedPlayerId !== undefined) {
      statusById.set(slot.selectedPlayerId, "bench");
    }
  }

  for (const slot of view.lineup.slots) {
    if (slot.selectedPlayerId !== undefined) {
      statusById.set(slot.selectedPlayerId, "selected");
    }
  }

  return statusById;
}

/** Returns the first selected XI or bench player for the detail panel. */
function firstPreparedPlayerId(view: CareerMatchPreparationView): string | undefined {
  return (
    view.lineup.slots.find((slot) => slot.selectedPlayerId !== undefined)?.selectedPlayerId ??
    view.bench.slots.find((slot) => slot.selectedPlayerId !== undefined)?.selectedPlayerId
  );
}

/** Builds a unique compact squad table from player options exposed by lineup slots. */
function buildSquadRows(
  view: CareerMatchPreparationView,
  playerStatusById: ReadonlyMap<string, SquadSelectionRow["status"]>,
): readonly SquadSelectionRow[] {
  const rowsByPlayerId = new Map<string, SquadSelectionRow>();

  for (const slot of [...view.lineup.slots, ...view.bench.slots]) {
    for (const player of slot.playerOptions) {
      if (rowsByPlayerId.has(player.playerId)) {
        continue;
      }

      const fact = getDemoMatchPreparationPlayerFact(player.playerId);
      rowsByPlayerId.set(player.playerId, {
        player,
        ...(fact === undefined ? {} : { age: fact.age, foot: fact.foot }),
        status: playerStatusById.get(player.playerId) ?? "available",
      });
    }
  }

  return [...rowsByPlayerId.values()];
}

/** Renders one compact preparation fact row. */
function PreparationFact({ label, value }: Readonly<{ label: string; value: string }>): React.JSX.Element {
  return (
    <div className="tls-dashboard-fact">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

/** Formats next-fixture context for the preparation header. */
function formatFixture(view: CareerMatchPreparationView, text: Translator): string {
  if (view.nextFixture === undefined) {
    return text("career.noNextSelectedClubFixture");
  }

  return text("career.fixtureRound", {
    round: view.nextFixture.round,
  });
}

/** Formats a 0..1 tactic value as a compact percentage. */
function formatTacticValue(value: number): string {
  return `${Math.round(value * 100)}%`;
}

/** Maps tactic mentality keys to existing localized setup labels. */
function mentalityLabelKey(mentality: string): MessageKey {
  if (mentality === "balanced" || mentality === "attacking" || mentality === "defensive") {
    return `setup.mentalityValue.${mentality}` as MessageKey;
  }

  return "common.unknown";
}

/** Maps preparation blocker keys to localized label keys. */
function blockerLabelKey(blocker: CareerMatchPreparationBlockerKey): MessageKey {
  return `career.matchPreparation.blocker.${blocker}`;
}
