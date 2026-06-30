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
    mode: "preparation",
  });
  const playerStatusById = useMemo(() => buildPlayerStatusById(view), [view]);
  const tacticalBoardPlayers = useMemo(() => buildDemoTacticalBoardSquadPlayers(), []);
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
  const lineupPlayerIds = useMemo(() => selectedLineupPlayerIds(view), [view]);
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
          <div className="tls-preparation-header-actions">
            <button className="tls-menu-button tls-preparation-dashboard" type="button" onClick={onBackToDashboard}>
              {text("career.shell.nav.dashboard")}
            </button>
            <button
              className="tls-menu-button tls-menu-button-primary"
              disabled={view.saveAction.status !== "available"}
              type="button"
              onClick={onSavePreparation}
            >
              {text(view.saveAction.labelKey as MessageKey)}
            </button>
          </div>
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

              <TacticalBenchBoard
                availablePlayers={tacticalBenchCandidates}
                excludedPlayerIds={lineupPlayerIds}
                requiredSlotCount={view.bench.requiredSlotCount}
                selectedSlotCount={view.bench.selectedSlotCount}
                slots={tacticalBenchSlots}
                text={text}
                onAssign={(slotKey, playerId) => {
                  onBenchPlayerChange(slotKey, playerId);
                  setSelectedDetailPlayerId(playerId);
                }}
                onRemove={(slotKey) => {
                  onBenchPlayerChange(slotKey, undefined);
                }}
                onSlotOpen={(slotKey) => {
                  const playerId = view.bench.slots.find((slot) => slot.slotKey === slotKey)?.selectedPlayerId;

                  if (playerId !== undefined) {
                    setSelectedDetailPlayerId(playerId);
                  }
                }}
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

/** Maps read-model bench slots into the shared tactical bench-board slot shape. */
function buildTacticalBenchSlots(
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

/** Maps current squad facts into substitute candidates for the shared bench board. */
function buildTacticalBenchCandidates(
  players: readonly DemoTacticalBoardPlayer[],
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
function tacticalBenchPlayerFromBoardPlayer(player: DemoTacticalBoardPlayer): TacticalBenchBoardCandidate {
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

/** Returns the current selected XI ids so the bench board can filter candidates. */
function selectedLineupPlayerIds(view: CareerMatchPreparationView): readonly string[] {
  return view.lineup.slots.flatMap((slot) => (slot.selectedPlayerId === undefined ? [] : [slot.selectedPlayerId]));
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
