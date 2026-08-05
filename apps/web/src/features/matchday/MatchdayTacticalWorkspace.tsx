import { useMemo } from "react";
import type { MessageKey, Translator } from "@game/i18n";
import type {
  CareerMatchPreparationFormationId,
  CareerMatchPreparationView,
} from "@game/ui";

import { TacticalConsequenceList } from "../../shared/ui/TacticalConsequenceList";
import type { TacticalBenchBoardCandidate } from "../tactics-board/components/TacticalBenchBoard";
import {
  TacticalBoardOutsidePlayers,
  type TacticalBoardOutsidePlayer,
} from "../tactics-board/components/TacticalBoardOutsidePlayers";
import type { TacticalBoardPitchPlayer } from "../tactics-board/components/TacticalBoardPitch";
import { TacticalBoardWorkspace } from "../tactics-board/components/TacticalBoardWorkspace";
import type {
  TacticalBenchSlotId,
  TacticalBenchSlotView,
} from "../tactics-board/tactical-board-bench";
import { selectCurrentTacticalBoardShape } from "../tactics-board/tactical-board-formations";
import { boardRoleFromCanonicalRole } from "../tactics-board/tactical-board-roles";
import type { TacticalBoardDraft } from "../tactics-board/tactical-board-state";
import type {
  TacticalBoardCanonicalRole,
  TacticalBoardRoleCode,
  TacticalBoardSlot,
} from "../tactics-board/tactical-board-types";
import {
  buildTacticalBoardSquadPlayers,
  type TacticalBoardSquadPlayer,
} from "../tactics-board/tactical-board-squad";
import type {
  WebMatchdaySubstitutionDecision,
  WebMatchdayTeamControlPanel,
} from "./matchday-adapter";

/** Shared live/preparation board contract; simulation remains outside React. */
export interface MatchdayTacticalWorkspaceProps {
  readonly view: CareerMatchPreparationView;
  readonly tacticalBoardDraft: TacticalBoardDraft;
  readonly text: Translator;
  readonly panel?: WebMatchdayTeamControlPanel;
  readonly hasPendingChanges?: boolean;
  readonly onFormationChange?: (formationId: CareerMatchPreparationFormationId) => void;
  readonly onTacticProfileChange?: (tacticProfileId: string | undefined) => void;
  readonly onBoardSlotMove?: (slotKey: string, nx: number, ny: number) => void;
  readonly onBoardSlotRoleChange?: (slotKey: string, role: TacticalBoardRoleCode) => void;
  readonly onBoardSlotAdapt?: (slotKey: string, role: TacticalBoardRoleCode, nx: number, ny: number) => void;
  readonly onBoardSlotExchange?: (firstSlotKey: string, secondSlotKey: string) => void;
  readonly onSubstitution?: (decision: WebMatchdaySubstitutionDecision) => void;
  readonly onDiscardPendingChanges?: () => void;
}

/**
 * Owns the one Matchday tactical workspace used while running, paused, and at
 * half time. The caller only receives typed draft commands.
 */
export function MatchdayTacticalWorkspace({
  view,
  tacticalBoardDraft,
  text,
  panel,
  hasPendingChanges = false,
  onFormationChange,
  onTacticProfileChange,
  onBoardSlotMove,
  onBoardSlotRoleChange,
  onBoardSlotAdapt,
  onBoardSlotExchange,
  onSubstitution,
  onDiscardPendingChanges,
}: MatchdayTacticalWorkspaceProps): React.JSX.Element {
  const mode = panel?.status === "editable" ? "editable" : "view_only";
  const basePlayers = useMemo(
    () => buildTacticalBoardSquadPlayers(
      view.lineup.slots[0]?.playerOptions ?? view.bench.slots[0]?.playerOptions ?? [],
    ),
    [view],
  );
  const livePlayerById = useMemo(() => new Map(
    [...(panel?.lineup ?? []), ...(panel?.bench ?? []), ...(panel?.outside ?? [])]
      .map((player) => [player.playerId, player]),
  ), [panel]);
  const players = useMemo<readonly TacticalBoardPitchPlayer[]>(
    () => basePlayers.map((player) => {
      const live = livePlayerById.get(player.playerId);
      return {
        ...player,
        ...(live?.condition === undefined ? {} : { condition: live.condition }),
        ...(live?.rating === undefined ? {} : { rating: live.rating }),
      };
    }),
    [basePlayers, livePlayerById],
  );
  const eligibleBenchPlayerIds = useMemo(
    () => new Set((panel?.bench ?? [])
      .filter((player) => player.availability === undefined || player.availability === "available")
      .map((player) => player.playerId)),
    [panel],
  );
  const pitchCandidates = useMemo(
    () => players.filter((player) => eligibleBenchPlayerIds.has(player.playerId)),
    [eligibleBenchPlayerIds, players],
  );
  const playerById = useMemo(
    () => new Map(basePlayers.map((player) => [player.playerId, player])),
    [basePlayers],
  );
  const outsidePlayerIds = useMemo(
    () => new Set(panel?.outside.map((player) => player.playerId) ?? []),
    [panel],
  );
  const renderedSlots = useMemo<readonly TacticalBoardSlot[]>(
    () => tacticalBoardDraft.slots.map((slot) =>
      slot.playerId !== null && outsidePlayerIds.has(slot.playerId)
        ? { ...slot, playerId: null }
        : slot,
    ),
    [outsidePlayerIds, tacticalBoardDraft.slots],
  );
  const benchSlots = useMemo(
    () => buildLiveBenchSlots(view, playerById, livePlayerById),
    [livePlayerById, playerById, view],
  );
  const benchPlayerIds = useMemo(
    () => new Set(benchSlots.flatMap((slot) => slot.player === undefined ? [] : [slot.player.playerId])),
    [benchSlots],
  );
  const currentShape = useMemo(
    () => selectCurrentTacticalBoardShape(renderedSlots),
    [renderedSlots],
  );
  const lineupPlayerIds = useMemo(
    () => renderedSlots.flatMap((slot) => slot.playerId === null ? [] : [slot.playerId]),
    [renderedSlots],
  );
  const outsidePlayers = useMemo<readonly TacticalBoardOutsidePlayer[]>(
    () => (panel?.outside ?? []).flatMap((player) => {
      if (benchPlayerIds.has(player.playerId)) return [];
      const boardPlayer = playerById.get(player.playerId);
      const reason: TacticalBoardOutsidePlayer["reason"] = player.availability === "dismissed"
        ? "dismissed"
        : "injured";
      return boardPlayer === undefined ? [] : [{
        playerId: player.playerId,
        surname: boardPlayer.surname,
        roleCode: boardRoleFromCanonicalRole(boardPlayer.primaryRole),
        reason,
        ...(player.condition === undefined ? {} : { condition: player.condition }),
        ...(player.rating === undefined ? {} : { rating: player.rating }),
      }];
    }),
    [benchPlayerIds, panel, playerById],
  );

  const substitute = (lineupSlotId: string, benchSlotId: string): void => {
    if (mode !== "editable") return;
    const outgoingPlayerId = tacticalBoardDraft.slots.find((slot) => slot.slotId === lineupSlotId)?.playerId;
    const incomingPlayerId = benchSlots.find((slot) => slot.slotId === benchSlotId)?.player?.playerId;
    if (
      outgoingPlayerId === null
      || outgoingPlayerId === undefined
      || incomingPlayerId === undefined
      || !eligibleBenchPlayerIds.has(incomingPlayerId)
      || panel?.outside.some((player) => player.playerId === outgoingPlayerId && player.availability === "dismissed") === true
    ) return;
    onSubstitution?.({ outgoingPlayerId, incomingPlayerId });
  };

  return (
    <section className="tls-matchday-card tls-matchday-tactical-workspace" aria-labelledby="matchday-tactical-workspace-title">
      <div className="tls-match-centre-card-heading">
        <div>
          <h2 id="matchday-tactical-workspace-title">{text("career.matchday.halfTimeBoardDecision")}</h2>
          <p>{mode === "view_only"
            ? text("career.matchday.tacticsReadOnly")
            : text("career.matchday.halfTimeBoardDecisionHint")}</p>
        </div>
        {panel === undefined ? null : (
          <span>{text("career.matchday.substitution.count", {
            count: panel.appliedCount,
            max: panel.maxCount,
          })}</span>
        )}
      </div>

      <div className="tls-matchday-tactical-toolbar" inert={mode === "view_only" ? true : undefined}>
        <label className="tls-preparation-formation-select">
          <span>{text("career.matchPreparation.formation")}</span>
          <select
            disabled={mode === "view_only"}
            value={view.formation.selectedFormationId ?? ""}
            onChange={(event) => onFormationChange?.(
              event.currentTarget.value as CareerMatchPreparationFormationId,
            )}
          >
            {view.formation.formations.map((formation) => (
              <option key={formation.formationId} value={formation.formationId}>
                {text(formation.labelKey as MessageKey)}
              </option>
            ))}
          </select>
        </label>
        <fieldset className="tls-matchday-tactic-profiles">
          <legend>{text("career.matchPreparation.tactic")}</legend>
          {view.tactic.profiles.map((profile) => (
            <label data-selected={profile.isSelected} key={profile.tacticProfileId}>
              <input
                checked={profile.isSelected}
                disabled={mode === "view_only"}
                name="matchday-tactic-profile"
                type="radio"
                value={profile.tacticProfileId}
                onChange={(event) => onTacticProfileChange?.(event.currentTarget.value)}
              />
              {text(profile.labelKey as MessageKey)}
            </label>
          ))}
        </fieldset>
        {mode === "view_only" || !hasPendingChanges || onDiscardPendingChanges === undefined ? null : (
          <button className="tls-button tls-button-secondary" onClick={onDiscardPendingChanges} type="button">
            {text("career.preparationDraft.exit.discard")}
          </button>
        )}
      </div>

      <TacticalConsequenceList
        {...(view.tacticalConsequences === undefined ? {} : { consequences: view.tacticalConsequences })}
        headingId="matchday-tactical-consequences-title"
        text={text}
      />

      <TacticalBoardWorkspace
        bench={{
          availablePlayers: [],
          excludedPlayerIds: lineupPlayerIds,
          mode,
          requiredSlotCount: view.bench.requiredSlotCount,
          selectedSlotCount: benchSlots.filter((slot) => slot.player !== undefined).length,
          slots: benchSlots,
          text,
          onPlayerDropOnLineup: (benchSlotId, _playerId, lineupSlotId) => {
            substitute(lineupSlotId, benchSlotId);
          },
        }}
        pitch={{
          allowReplaceAssigned: true,
          availablePlayers: pitchCandidates,
          currentShape,
          ...(view.formation.selectedFormationId === undefined
            ? {}
            : { formationMotionKey: view.formation.selectedFormationId }),
          mode,
          players,
          slots: renderedSlots,
          text,
          onAssign: (slotKey, playerId) => {
            const outgoingPlayerId = tacticalBoardDraft.slots.find((slot) => slot.slotId === slotKey)?.playerId;
            const outgoingPlayer = panel?.outside.find((player) => player.playerId === outgoingPlayerId);
            if (
              outgoingPlayerId !== null
              && outgoingPlayerId !== undefined
              && outgoingPlayer?.availability !== "dismissed"
              && eligibleBenchPlayerIds.has(playerId)
            ) {
              onSubstitution?.({ outgoingPlayerId, incomingPlayerId: playerId });
            }
          },
          onPlayerDropOnBench: substitute,
          ...(onBoardSlotAdapt === undefined ? {} : { onRoleAdaptation: onBoardSlotAdapt }),
          ...(onBoardSlotExchange === undefined ? {} : {
            onSlotExchange: (firstSlotId: string, secondSlotId: string) => {
              const firstPlayerId = renderedSlots.find((slot) => slot.slotId === firstSlotId)?.playerId;
              const secondPlayerId = renderedSlots.find((slot) => slot.slotId === secondSlotId)?.playerId;
              if (firstPlayerId !== null && firstPlayerId !== undefined && secondPlayerId !== null && secondPlayerId !== undefined) {
                onBoardSlotExchange(firstSlotId, secondSlotId);
              }
            },
          }),
          ...(onBoardSlotRoleChange === undefined ? {} : { onRoleChange: onBoardSlotRoleChange }),
          ...(onBoardSlotMove === undefined ? {} : { onSlotMove: onBoardSlotMove }),
        }}
        sideFooter={<TacticalBoardOutsidePlayers players={outsidePlayers} text={text} />}
      />
    </section>
  );
}

function buildLiveBenchSlots(
  view: CareerMatchPreparationView,
  playerById: ReadonlyMap<string, TacticalBoardSquadPlayer>,
  livePlayerById: ReadonlyMap<string, WebMatchdayTeamControlPanel["lineup"][number]>,
): readonly TacticalBenchSlotView[] {
  return view.bench.slots.map((slot) => {
    const selectedPlayer = slot.selectedPlayerId === undefined ? undefined : playerById.get(slot.selectedPlayerId);
    const live = selectedPlayer === undefined ? undefined : livePlayerById.get(selectedPlayer.playerId);
    const status = live?.availability === "substituted_out" || live?.availability === "injured"
      ? "substituted_out"
      : slot.status;

    return {
      slotId: slot.slotKey as TacticalBenchSlotId,
      labelKey: slot.labelKey as MessageKey,
      status,
      ...(selectedPlayer === undefined ? {} : {
        player: {
          ...tacticalBenchCandidate(selectedPlayer),
          ...(live?.condition === undefined ? {} : { condition: live.condition }),
          ...(live?.rating === undefined ? {} : { rating: live.rating }),
        },
      }),
    };
  });
}

function tacticalBenchCandidate(player: TacticalBoardSquadPlayer): TacticalBenchBoardCandidate {
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
