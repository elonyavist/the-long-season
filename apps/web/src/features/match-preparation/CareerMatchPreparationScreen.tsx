import { useMemo, useState } from "react";
import type React from "react";

import type { MessageKey, Translator } from "@game/i18n";
import { buildCareerInboxView, buildCareerShellView } from "@game/ui";
import type {
  CareerMatchPreparationBlockerKey,
  CareerMatchPreparationFormationId,
  CareerMatchPreparationView,
} from "@game/ui";

import type { WebCareerContinueResult } from "../../runtime/web-career-runtime";
import { AppShell } from "../app-shell/AppShell";
import { PlayerFactPanel } from "../../shared/ui/PlayerFactPanel";
import { SquadSelectionTable, type SquadSelectionRow } from "../../shared/ui/SquadSelectionTable";
import {
  TacticalBenchBoard,
  type TacticalBenchBoardCandidate,
} from "../tactics-board/components/TacticalBenchBoard";
import { TacticalBoardPitch } from "../tactics-board/components/TacticalBoardPitch";
import { selectCurrentTacticalBoardShape } from "../tactics-board/tactical-board-formations";
import { TACTICAL_BOARD_ROLE_CODES, TACTICAL_BOARD_ROLES } from "../tactics-board/tactical-board-roles";
import type { TacticalBoardDraft } from "../tactics-board/tactical-board-state";
import type { TacticalBoardCanonicalRole, TacticalBoardRoleCode } from "../tactics-board/tactical-board-types";
import type { TacticalBenchSlotId, TacticalBenchSlotView } from "../tactics-board/tactical-board-bench";
import type { TacticalBoardSquadPlayer } from "../tactics-board/tactical-board-squad";
import type {
  MatchPreparationPlayerFact,
  MatchPreparationSelectionAction,
} from "./match-preparation-adapter";
import { CommandActivityIndicator } from "../shared/CommandActivityIndicator";
import { useCareerUiStore } from "../../stores/career-ui-store";

/** Props for the first editable match-preparation screen. */
export type CareerMatchPreparationScreenProps = Readonly<{
  view: CareerMatchPreparationView;
  currentDateIso: string;
  draftDirty: boolean;
  tacticalBoardDraft: TacticalBoardDraft;
  tacticalBoardPlayers: readonly TacticalBoardSquadPlayer[];
  playerFactsById: ReadonlyMap<string, MatchPreparationPlayerFact>;
  continueResult?: WebCareerContinueResult;
  text: Translator;
  onBackToMenu: () => void;
  onBackToDashboard: () => void;
  onContinueCareer: () => void;
  onInboxActionClick: (actionId: string) => void;
  onFormationChange: (formationId: CareerMatchPreparationFormationId) => void;
  onLineupPlayerChange: (slotKey: string, playerId: string | undefined) => void;
  onBenchPlayerChange: (slotKey: string, playerId: string | undefined) => void;
  onTacticProfileChange: (tacticProfileId: string | undefined) => void;
  onSelectionAction: (action: MatchPreparationSelectionAction) => void;
  onBoardSlotMove: (slotKey: string, nx: number, ny: number) => void;
  onBoardSlotRoleChange: (slotKey: string, role: TacticalBoardRoleCode) => void;
  onBoardSlotClear: (slotKey: string) => void;
  onSavePreparation: () => void;
}>;

type MatchPreparationPlayerOption = CareerMatchPreparationView["lineup"]["slots"][number]["playerOptions"][number];
type MatchPreparationPanelTab = "squad" | "tactic" | "detail";

const MATCH_PREPARATION_PANEL_TABS: readonly {
  readonly tabId: MatchPreparationPanelTab;
  readonly labelKey: MessageKey;
}[] = [
  { tabId: "squad", labelKey: "career.matchPreparation.tab.squad" },
  { tabId: "tactic", labelKey: "career.matchPreparation.tab.tactic" },
  { tabId: "detail", labelKey: "career.matchPreparation.tab.detail" },
];

/** Renders the editable lineup slice for the next selected-club fixture. */
export function CareerMatchPreparationScreen({
  view,
  currentDateIso,
  draftDirty,
  tacticalBoardDraft,
  tacticalBoardPlayers,
  playerFactsById,
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
    activeSectionKey: "tactics",
    inboxView,
    mode: "preparation",
  });
  const playerStatusById = useMemo(() => buildPlayerStatusById(view), [view]);
  const tacticalBoardPlayerById = useMemo(
    () => new Map(tacticalBoardPlayers.map((player) => [player.playerId, player])),
    [tacticalBoardPlayers],
  );
  const tacticalBenchSlots = useMemo(
    () => buildTacticalBenchSlots(view, tacticalBoardPlayerById),
    [tacticalBoardPlayerById, view],
  );
  const tacticalBenchCandidates = useMemo(
    () => buildTacticalBenchCandidates(tacticalBoardPlayers),
    [tacticalBoardPlayers],
  );
  const currentShape = useMemo(
    () => selectCurrentTacticalBoardShape(tacticalBoardDraft.slots),
    [tacticalBoardDraft.slots],
  );
  const squadRows = useMemo(
    () => buildSquadRows(view, playerStatusById, tacticalBoardPlayerById, playerFactsById),
    [playerFactsById, playerStatusById, tacticalBoardPlayerById, view],
  );
  const firstSelectedPlayerId = firstPreparedPlayerId(view);
  const [selectedDetailPlayerId, setSelectedDetailPlayerId] = useState<string | undefined>(
    firstSelectedPlayerId ?? squadRows[0]?.player.playerId,
  );
  const [activePanelTab, setActivePanelTab] = useState<MatchPreparationPanelTab>("squad");
  const selectedDetailRow =
    squadRows.find((row) => row.player.playerId === selectedDetailPlayerId) ??
    squadRows.find((row) => row.status === "selected") ??
    squadRows[0];
  const focusPlayerDetail = (playerId: string): void => {
    setSelectedDetailPlayerId(playerId);
    setActivePanelTab("detail");
  };
  const commandActivity = useCareerUiStore((state) => state.commandActivity);
  const commandPending = commandActivity?.status === "pending";

  return (
    <AppShell
      shellView={shellView}
      selectedClubName={view.selectedClub.name}
      currentDateIso={currentDateIso}
      text={text}
      onBackToMenu={onBackToMenu}
      onContinueCareer={onContinueCareer}
      onInboxActionClick={onInboxActionClick}
    >
      <section className="tls-shell-panel tls-preparation-panel" data-state={commandPending ? "pending" : "idle"} aria-labelledby="match-preparation-title" aria-busy={commandPending}>
        <header className="tls-preparation-header">
          <div>
            <h1 className="tls-shell-title" id="match-preparation-title">{text("career.matchPreparation")}</h1>
            <p className="tls-shell-status">{formatFixture(view, text)}</p>
            {draftDirty ? (
              <span className="tls-preparation-draft-state" data-state="unsaved" role="status">
                {text("career.saveControl.unsaved")}
              </span>
            ) : null}
          </div>
          <div className="tls-preparation-header-actions">
            <button className="tls-menu-button tls-preparation-dashboard" disabled={commandPending} type="button" onClick={onBackToDashboard}>
              {text("career.shell.nav.dashboard")}
            </button>
          </div>
        </header>

        <div className="tls-preparation-command-lock" inert={commandPending ? true : undefined}>
        <section className="tls-preparation-decision-bar">
          <PreparationAlertStrip blockerKeys={view.blockerKeys} text={text} />
          <button
            className="tls-menu-button tls-menu-button-primary tls-preparation-confirm"
            data-state={commandPending ? "pending" : view.saveAction.status === "available" ? "idle" : "disabled"}
            disabled={view.saveAction.status !== "available" || commandPending}
            type="button"
            onClick={onSavePreparation}
          >
            <CommandActivityIndicator
              activity={commandActivity}
              commandIds={["confirm_preparation"]}
              idleLabel={text(view.saveAction.labelKey as MessageKey)}
              text={text}
            />
          </button>
        </section>

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
                {...(view.formation.selectedFormationId === undefined
                  ? {}
                  : { formationMotionKey: view.formation.selectedFormationId })}
                players={tacticalBoardPlayers}
                slots={tacticalBoardDraft.slots}
                text={text}
                onAssign={(slotKey, playerId) => {
                  onLineupPlayerChange(slotKey, playerId);
                  focusPlayerDetail(playerId);
                }}
                onRemove={onBoardSlotClear}
                onRoleChange={onBoardSlotRoleChange}
                onSlotMove={onBoardSlotMove}
                onSlotOpen={(slotKey) => {
                  const playerId = tacticalBoardDraft.slots.find((slot) => slot.slotId === slotKey)?.playerId;

                  if (playerId !== undefined && playerId !== null) {
                    focusPlayerDetail(playerId);
                  }
                }}
              />

              <TacticalBenchBoard
                availablePlayers={tacticalBenchCandidates}
                requiredSlotCount={view.bench.requiredSlotCount}
                selectedSlotCount={view.bench.selectedSlotCount}
                slots={tacticalBenchSlots}
                text={text}
                onAssign={(slotKey, playerId) => {
                  onBenchPlayerChange(slotKey, playerId);
                  focusPlayerDetail(playerId);
                }}
                onRemove={(slotKey) => {
                  onBenchPlayerChange(slotKey, undefined);
                }}
                onSlotOpen={(slotKey) => {
                  const playerId = view.bench.slots.find((slot) => slot.slotKey === slotKey)?.selectedPlayerId;

                  if (playerId !== undefined) {
                    focusPlayerDetail(playerId);
                  }
                }}
              />
            </div>

            <aside className="tls-preparation-squad-panel" aria-label={text("career.matchPreparation.panel")}>
              <div className="tls-preparation-panel-tabs" role="tablist" aria-label={text("career.matchPreparation.tabs")}>
                {MATCH_PREPARATION_PANEL_TABS.map((tab) => {
                  const isSelected = activePanelTab === tab.tabId;

                  return (
                    <button
                      aria-controls={`match-preparation-panel-${tab.tabId}`}
                      aria-selected={isSelected}
                      className="tls-preparation-panel-tab"
                      id={`match-preparation-tab-${tab.tabId}`}
                      key={tab.tabId}
                      role="tab"
                      type="button"
                      onClick={() => {
                        setActivePanelTab(tab.tabId);
                      }}
                    >
                      {text(tab.labelKey)}
                    </button>
                  );
                })}
              </div>

              <div
                aria-labelledby="match-preparation-tab-squad"
                hidden={activePanelTab !== "squad"}
                id="match-preparation-panel-squad"
                role="tabpanel"
              >
                <SquadSelectionTable
                  rows={squadRows}
                  selectedPlayerId={selectedDetailRow?.player.playerId}
                  text={text}
                  onPlayerSelect={focusPlayerDetail}
                />
              </div>

              <div
                aria-labelledby="match-preparation-tab-tactic"
                hidden={activePanelTab !== "tactic"}
                id="match-preparation-panel-tactic"
                role="tabpanel"
              >
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
              </div>

              <div
                aria-labelledby="match-preparation-tab-detail"
                hidden={activePanelTab !== "detail"}
                id="match-preparation-panel-detail"
                role="tabpanel"
              >
                <PlayerFactPanel row={selectedDetailRow} text={text} />
              </div>
            </aside>
          </div>
        </section>
        </div>
      </section>
    </AppShell>
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
      data-state={isReady ? "success" : "blocking"}
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

/** Maps read-model bench slots into the shared tactical bench-board slot shape. */
function buildTacticalBenchSlots(
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

/** Maps current squad facts into substitute candidates for the shared bench board. */
function buildTacticalBenchCandidates(
  players: readonly TacticalBoardSquadPlayer[],
): readonly TacticalBenchBoardCandidate[] {
  return players.map((player) => ({
    playerId: player.playerId,
    number: player.number,
    surname: player.surname,
    roleCode: roleCodeForCanonicalRole(player.primaryRole),
    name: player.name,
    roleKey: player.roleKey,
    ...(player.positionKey === undefined ? {} : { positionKey: player.positionKey }),
    ...(player.currentAbility === undefined ? {} : { currentAbility: player.currentAbility }),
    ...(player.fitness === undefined ? {} : { fitness: player.fitness }),
  }));
}

/** Converts a selected board player into the compact substitute token facts. */
function tacticalBenchPlayerFromBoardPlayer(player: TacticalBoardSquadPlayer): TacticalBenchBoardCandidate {
  return {
    playerId: player.playerId,
    number: player.number,
    surname: player.surname,
    roleCode: roleCodeForCanonicalRole(player.primaryRole),
    name: player.name,
    roleKey: player.roleKey,
    ...(player.positionKey === undefined ? {} : { positionKey: player.positionKey }),
    ...(player.currentAbility === undefined ? {} : { currentAbility: player.currentAbility }),
    ...(player.fitness === undefined ? {} : { fitness: player.fitness }),
  };
}

/** Maps canonical tactical-board roles to the compact code shown on bench tokens. */
function roleCodeForCanonicalRole(role: TacticalBoardCanonicalRole): TacticalBoardRoleCode {
  const roleCode = TACTICAL_BOARD_ROLE_CODES.find((candidate) => TACTICAL_BOARD_ROLES[candidate].canonicalRole === role);

  return roleCode ?? "CC";
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
  tacticalBoardPlayerById: ReadonlyMap<string, TacticalBoardSquadPlayer>,
  playerFactsById: ReadonlyMap<string, MatchPreparationPlayerFact>,
): readonly SquadSelectionRow[] {
  const rowsByPlayerId = new Map<string, SquadSelectionRow>();

  for (const slot of [...view.lineup.slots, ...view.bench.slots]) {
    for (const player of slot.playerOptions) {
      if (rowsByPlayerId.has(player.playerId)) {
        continue;
      }

      const fact = playerFactsById.get(player.playerId);
      const tacticalBoardPlayer = tacticalBoardPlayerById.get(player.playerId);
      rowsByPlayerId.set(player.playerId, {
        player: {
          ...player,
          ...(tacticalBoardPlayer === undefined ? {} : { number: tacticalBoardPlayer.number }),
        },
        ...(fact === undefined ? {} : { age: fact.age }),
        status: playerStatusById.get(player.playerId) ?? "available",
      });
    }
  }

  return [...rowsByPlayerId.values()];
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
