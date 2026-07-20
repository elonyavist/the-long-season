import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as m from "motion/react-m";

import type { Translator } from "@game/i18n";

import type { TacticalBenchSlotId } from "../tactical-board-bench";
import { pointerToNorm, TACTICAL_BOARD_PITCH } from "../tactical-board-geometry";
import {
  canChangeTacticalBoardSlotRole,
  canDragTacticalBoardSlot,
  shouldCancelTacticalBoardLongPress,
  TACTICAL_BOARD_LONG_PRESS_MS,
  type TacticalBoardPointerPoint,
} from "../tactical-board-interactions";
import {
  TACTICAL_BOARD_ROLES,
  tacticalBoardRoleDestinationAt,
  tacticalBoardRoleOptionsForPosition,
} from "../tactical-board-roles";
import {
  sortTacticalBoardAssignmentCandidates,
  suitabilityForTacticalBoardAssignment,
} from "../tactical-board-suitability";
import type { TacticalBoardRoleCode, TacticalBoardSlot } from "../tactical-board-types";
import { TacticalBoardAnchoredPopover } from "./TacticalBoardAnchoredPopover";
import { TacticalBoardDragPreview } from "./TacticalBoardDragPreview";
import { TacticalBoardEmptySlot } from "./TacticalBoardEmptySlot";
import { TacticalBoardMenu } from "./TacticalBoardMenu";
import { TacticalBoardPitchMarkings } from "./TacticalBoardPitchMarkings";
import {
  TacticalBoardPlayerToken,
  type TacticalBoardSuitabilityLevel,
  type TacticalBoardTokenPlayer,
} from "./TacticalBoardPlayerToken";
import { TacticalBoardRoleAdaptationPopover } from "./TacticalBoardRoleAdaptationPopover";
import { TacticalBoardRoleDestinations } from "./TacticalBoardRoleDestinations";
import { webMotion, webMotionTargets } from "../../../shared/motion/web-motion";

/** Player projection accepted by every shared tactical-board consumer. */
export interface TacticalBoardPitchPlayer extends TacticalBoardTokenPlayer {
  /** Specific natural-position code shown in shared assignment menus. */
  readonly roleCode?: TacticalBoardRoleCode;
  readonly suitabilityBySlotId?: Readonly<Record<string, TacticalBoardSuitabilityLevel>>;
  readonly suitabilityByRole?: Partial<Record<TacticalBoardRoleCode, TacticalBoardSuitabilityLevel>>;
  readonly fitness?: number;
  readonly rating?: number;
}

/** Public interaction contract for the single shared tactical pitch. */
export interface TacticalBoardPitchProps {
  readonly slots: readonly TacticalBoardSlot[];
  readonly players: readonly TacticalBoardPitchPlayer[];
  readonly availablePlayers?: readonly TacticalBoardPitchPlayer[];
  readonly text: Translator;
  readonly currentShape: string;
  /** Stable base formation id used only to acknowledge completed slot remapping. */
  readonly formationMotionKey?: string;
  readonly onSlotOpen?: (slotId: string) => void;
  readonly onSlotMove?: (slotId: string, nx: number, ny: number) => void;
  readonly onRoleChange?: (slotId: string, role: TacticalBoardRoleCode) => void;
  readonly onRemove?: (slotId: string) => void;
  readonly onAssign?: (slotId: string, playerId: string) => void;
  /** Explicit mode prevents live playback from exposing accidental edits. */
  readonly mode?: "editable" | "view_only";
  /** Lets an occupied XI token expose eligible substitutes as click fallback. */
  readonly allowReplaceAssigned?: boolean;
  /** Exchanges two XI assignments while preserving tactical slot identity. */
  readonly onSlotExchange?: (firstSlotId: string, secondSlotId: string) => void;
  /** Drops a starter onto one fixed substitute slot. */
  readonly onPlayerDropOnBench?: (
    lineupSlotId: string,
    benchSlotId: TacticalBenchSlotId,
  ) => void;
  /** Applies one confirmed role and normalized destination atomically. */
  readonly onRoleAdaptation?: (
    slotId: string,
    role: TacticalBoardRoleCode,
    nx: number,
    ny: number,
  ) => void;
  /** Reports active pitch drags so sibling drop surfaces can show feedback. */
  readonly onDragActiveChange?: (active: boolean) => void;
  /** Visually marks the pitch while a substitute is dragged toward the XI. */
  readonly dropActive?: boolean;
}

interface TacticalBoardDragState {
  readonly slotId: string;
  readonly pointerId: number;
  readonly start: TacticalBoardPointerPoint;
  readonly hasMoved: boolean;
  readonly nx: number;
  readonly ny: number;
  readonly clientX: number;
  readonly clientY: number;
  readonly outsidePitch: boolean;
}

interface TacticalBoardLongPressState {
  readonly slotId: string;
  readonly pointerId: number;
  readonly start: TacticalBoardPointerPoint;
}

interface TacticalBoardMenuState {
  readonly slotId: string;
}

interface TacticalBoardAdaptationState {
  readonly slotId: string;
  readonly nx: number;
  readonly ny: number;
  readonly roles: readonly TacticalBoardRoleCode[];
}

/** Shared vertical tactical pitch used by preparation, tactics, and Matchday. */
export function TacticalBoardPitch({
  slots,
  players,
  availablePlayers,
  text,
  currentShape,
  formationMotionKey,
  onSlotOpen,
  onSlotMove,
  onRoleChange,
  onRemove,
  onAssign,
  mode = "editable",
  allowReplaceAssigned = false,
  onSlotExchange,
  onPlayerDropOnBench,
  onRoleAdaptation,
  onDragActiveChange,
  dropActive = false,
}: TacticalBoardPitchProps): React.JSX.Element {
  const playerById = new Map(players.map((player) => [player.playerId, player]));
  const selectedPlayerIds = useMemo(
    () => new Set(slots.flatMap((slot) => (slot.playerId === null ? [] : [slot.playerId]))),
    [slots],
  );
  const selectablePlayers = useMemo(
    () => (availablePlayers ?? players).filter((player) => !selectedPlayerIds.has(player.playerId)),
    [availablePlayers, players, selectedPlayerIds],
  );
  const [drag, setDrag] = useState<TacticalBoardDragState>();
  const [menu, setMenu] = useState<TacticalBoardMenuState>();
  const [adaptation, setAdaptation] = useState<TacticalBoardAdaptationState>();
  const svgRef = useRef<SVGSVGElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<TacticalBoardDragState | undefined>(undefined);
  const menuRef = useRef<HTMLDivElement>(null);
  const longPressTimerRef = useRef<number | undefined>(undefined);
  const longPressStateRef = useRef<TacticalBoardLongPressState | undefined>(undefined);
  const suppressClickRef = useRef(false);
  const previousSlotFactsRef = useRef(tacticalBoardSlotFacts(slots));
  const previousFormationMotionKeyRef = useRef(formationMotionKey);
  const formationChanged = previousFormationMotionKeyRef.current !== formationMotionKey;

  useEffect(() => {
    previousSlotFactsRef.current = tacticalBoardSlotFacts(slots);
    previousFormationMotionKeyRef.current = formationMotionKey;
  }, [formationMotionKey, slots]);

  const activeDragSlot = drag === undefined ? undefined : slots.find((slot) => slot.slotId === drag.slotId);
  const activeDragPlayer = playerForSlot(activeDragSlot, playerById);
  const activeMenuSlot = menu === undefined ? undefined : slots.find((slot) => slot.slotId === menu.slotId);
  const activeMenuPlayer = playerForSlot(activeMenuSlot, playerById);
  const adaptationSlot = adaptation === undefined ? undefined : slots.find((slot) => slot.slotId === adaptation.slotId);
  const adaptationPlayer = playerForSlot(adaptationSlot, playerById);

  useEffect(() => {
    if (menu === undefined && adaptation === undefined) return undefined;

    const closeOutside = (event: PointerEvent): void => {
      if (!(event.target instanceof Node) || menuRef.current?.contains(event.target) === true) return;
      if (event.target instanceof Element && event.target.closest("[data-slot-id]") !== null) return;
      setMenu(undefined);
      setAdaptation(undefined);
    };
    const closeOnEscape = (event: KeyboardEvent): void => {
      if (event.key !== "Escape") return;
      setMenu(undefined);
      setAdaptation(undefined);
    };

    document.addEventListener("pointerdown", closeOutside, true);
    document.addEventListener("keydown", closeOnEscape, true);
    return () => {
      document.removeEventListener("pointerdown", closeOutside, true);
      document.removeEventListener("keydown", closeOnEscape, true);
    };
  }, [adaptation, menu]);

  const clearLongPress = useCallback((): void => {
    if (longPressTimerRef.current !== undefined) clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = undefined;
    longPressStateRef.current = undefined;
  }, []);

  const updateDrag = useCallback((nextDrag: TacticalBoardDragState | undefined): void => {
    dragRef.current = nextDrag;
    setDrag(nextDrag);
  }, []);

  const openSlotMenu = (slotId: string): void => {
    if (mode === "view_only") return;
    setAdaptation(undefined);
    setMenu({ slotId });
    onSlotOpen?.(slotId);
  };

  const openSlotMenuFromPointer = (slotId: string): void => {
    suppressClickRef.current = true;
    openSlotMenu(slotId);
    window.setTimeout(() => {
      suppressClickRef.current = false;
    }, 0);
  };

  const scheduleLongPress = (slotId: string, pointerId: number, start: TacticalBoardPointerPoint): void => {
    clearLongPress();
    longPressStateRef.current = { slotId, pointerId, start };
    longPressTimerRef.current = window.setTimeout(() => {
      openSlotMenuFromPointer(slotId);
      clearLongPress();
    }, TACTICAL_BOARD_LONG_PRESS_MS);
  };

  const slotFromTarget = (target: EventTarget | null): TacticalBoardSlot | undefined => {
    if (!(target instanceof Element)) return undefined;
    const slotId = target.closest("[data-tactical-lineup-slot-id]")
      ?.getAttribute("data-tactical-lineup-slot-id");
    return slotId === null || slotId === undefined ? undefined : slots.find((slot) => slot.slotId === slotId);
  };

  const openSlotFromClick = (slotId: string): void => {
    if (!suppressClickRef.current) openSlotMenu(slotId);
  };

  const handlePointerDown = (event: React.PointerEvent<SVGSVGElement>): void => {
    if (mode === "view_only" || event.button !== 0) return;
    const slot = slotFromTarget(event.target);
    if (slot === undefined) return;

    setMenu(undefined);
    setAdaptation(undefined);
    const start = { x: event.clientX, y: event.clientY };
    if (event.pointerType !== "mouse") scheduleLongPress(slot.slotId, event.pointerId, start);
    if (!canDragTacticalBoardSlot(slot)) return;

    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Synthetic QA pointer events do not always create a native capture.
    }
    updateDrag({
      slotId: slot.slotId,
      pointerId: event.pointerId,
      start,
      hasMoved: false,
      nx: slot.nx,
      ny: slot.ny,
      clientX: event.clientX,
      clientY: event.clientY,
      outsidePitch: false,
    });
    onDragActiveChange?.(true);
  };

  const handlePointerMove = (event: React.PointerEvent<SVGSVGElement>): void => {
    const longPressState = longPressStateRef.current;
    if (
      longPressState !== undefined
      && longPressState.pointerId === event.pointerId
      && shouldCancelTacticalBoardLongPress(longPressState.start, { x: event.clientX, y: event.clientY })
    ) clearLongPress();

    const activeDrag = dragRef.current;
    if (activeDrag === undefined || activeDrag.pointerId !== event.pointerId) return;
    const slot = slots.find((candidate) => candidate.slotId === activeDrag.slotId);
    if (slot === undefined || !canDragTacticalBoardSlot(slot)) return;

    const norm = pointerToNorm(event.currentTarget, event.clientX, event.clientY);
    updateDrag({
      ...activeDrag,
      hasMoved: activeDrag.hasMoved
        || shouldCancelTacticalBoardLongPress(activeDrag.start, { x: event.clientX, y: event.clientY }, 2),
      nx: clampUnit(norm.nx),
      ny: clampUnit(norm.ny),
      clientX: event.clientX,
      clientY: event.clientY,
      outsidePitch: pointIsOutside(event.currentTarget, event.clientX, event.clientY),
    });
  };

  const finishDrag = useCallback((completed: TacticalBoardDragState, dropTarget: Element | null): void => {
    const slot = slots.find((candidate) => candidate.slotId === completed.slotId);
    if (slot === undefined) return;
    const lineupTargetId = dropTarget?.closest("[data-tactical-lineup-slot-id]")
      ?.getAttribute("data-tactical-lineup-slot-id");
    const benchTargetId = dropTarget?.closest("[data-bench-slot-id]")
      ?.getAttribute("data-bench-slot-id") as TacticalBenchSlotId | null | undefined;

    if (lineupTargetId !== null && lineupTargetId !== undefined && lineupTargetId !== slot.slotId) {
      onSlotExchange?.(slot.slotId, lineupTargetId);
      return;
    }
    if (benchTargetId !== null && benchTargetId !== undefined) {
      onPlayerDropOnBench?.(slot.slotId, benchTargetId);
      return;
    }
    if (completed.outsidePitch) return;

    const destinationRole = tacticalBoardRoleDestinationAt(completed.nx, completed.ny);
    if (
      destinationRole !== undefined
      && destinationRole !== slot.role
      && onRoleAdaptation !== undefined
    ) {
      setAdaptation({
        slotId: slot.slotId,
        nx: completed.nx,
        ny: completed.ny,
        roles: [destinationRole],
      });
      return;
    }
    if (destinationRole === slot.role) {
      onSlotMove?.(slot.slotId, completed.nx, completed.ny);
      return;
    }

    const roleZone = TACTICAL_BOARD_ROLES[slot.role].zone;
    const insideRole = completed.nx >= roleZone.nxMin
      && completed.nx <= roleZone.nxMax
      && completed.ny >= roleZone.nyMin
      && completed.ny <= roleZone.nyMax;
    if (insideRole) {
      onSlotMove?.(slot.slotId, completed.nx, completed.ny);
      return;
    }

    const roles = tacticalBoardRoleOptionsForPosition(completed.nx, completed.ny, slot.role)
      .filter((role) => role !== slot.role);
    if (roles.length > 0 && onRoleAdaptation !== undefined) {
      setAdaptation({ slotId: slot.slotId, nx: completed.nx, ny: completed.ny, roles });
      return;
    }
    onSlotMove?.(slot.slotId, completed.nx, completed.ny);
  }, [onPlayerDropOnBench, onRoleAdaptation, onSlotExchange, onSlotMove, slots]);

  useEffect(() => {
    const pointerId = drag?.pointerId;
    if (pointerId === undefined) return undefined;

    const completePointerDrag = (event: PointerEvent, commit: boolean): void => {
      if (event.pointerId !== pointerId) return;
      clearLongPress();
      const completed = dragRef.current;
      const svg = svgRef.current;

      try {
        if (svg?.hasPointerCapture(pointerId) === true) svg.releasePointerCapture(pointerId);
      } catch {
        // The shared document boundary still completes synthetic or interrupted drags.
      }

      if (commit && completed?.hasMoved === true) {
        finishDrag(completed, document.elementFromPoint(event.clientX, event.clientY));
        suppressClickRef.current = true;
        window.setTimeout(() => {
          suppressClickRef.current = false;
        }, 0);
      }

      updateDrag(undefined);
      onDragActiveChange?.(false);
    };
    const commitDrag = (event: PointerEvent): void => completePointerDrag(event, true);
    const cancelDrag = (event: PointerEvent): void => completePointerDrag(event, false);

    document.addEventListener("pointerup", commitDrag, true);
    document.addEventListener("pointercancel", cancelDrag, true);
    return () => {
      document.removeEventListener("pointerup", commitDrag, true);
      document.removeEventListener("pointercancel", cancelDrag, true);
    };
  }, [clearLongPress, drag?.pointerId, finishDrag, onDragActiveChange, updateDrag]);

  const handleContextMenu = (event: React.MouseEvent<SVGSVGElement>): void => {
    const slot = slotFromTarget(event.target);
    if (slot === undefined || mode === "view_only") return;
    event.preventDefault();
    clearLongPress();
    openSlotMenu(slot.slotId);
  };

  const handleKeyDown = (event: React.KeyboardEvent<SVGSVGElement>): void => {
    if ((event.key !== "Enter" && event.key !== " ") || mode === "view_only") return;
    const slot = slotFromTarget(event.target);
    if (slot === undefined) return;
    event.preventDefault();
    openSlotMenu(slot.slotId);
  };

  const roleOptions = activeMenuSlot === undefined
    || activeMenuPlayer === undefined
    || !canChangeTacticalBoardSlotRole(activeMenuSlot)
    ? []
    : tacticalBoardRoleOptionsForPosition(activeMenuSlot.nx, activeMenuSlot.ny, activeMenuSlot.role).map((role) => ({
        role,
        suitability: suitabilityForTacticalBoardAssignment(activeMenuPlayer, role, activeMenuSlot.slotId),
        isCurrent: role === activeMenuSlot.role,
      }));
  const candidates = activeMenuSlot === undefined
    || (activeMenuSlot.playerId !== null && !activeMenuSlot.locked && !allowReplaceAssigned)
    ? []
    : sortTacticalBoardAssignmentCandidates(selectablePlayers, activeMenuSlot.role, activeMenuSlot.slotId).map((player) => ({
        player,
        suitability: suitabilityForTacticalBoardAssignment(player, activeMenuSlot.role, activeMenuSlot.slotId),
        ...(player.fitness === undefined ? {} : { fitness: player.fitness }),
      }));

  return (
    <section className="tls-tactical-board" aria-labelledby="tls-tactical-board-title">
      <header className="tls-tactical-board-header">
        <h3 id="tls-tactical-board-title">{text("career.tacticalBoard.title")}</h3>
        <dl>
          <div>
            <dt>{text("career.tacticalBoard.currentShape")}</dt>
            <dd>{currentShape}</dd>
          </div>
        </dl>
      </header>

      <div
        className="tls-tactical-board-field"
        data-drop-active={dropActive ? "true" : "false"}
        data-mode={mode}
        ref={fieldRef}
      >
        <svg
          aria-label={text("career.tacticalBoard.title")}
          className="tls-tactical-board-svg"
          data-formation-motion-key={formationMotionKey}
          onContextMenu={handleContextMenu}
          onKeyDown={handleKeyDown}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          ref={svgRef}
          role="img"
          viewBox={`0 0 ${TACTICAL_BOARD_PITCH.viewBoxW} ${TACTICAL_BOARD_PITCH.viewBoxH}`}
        >
          <TacticalBoardPitchMarkings />
          {activeDragPlayer === undefined || activeDragSlot === undefined || drag?.outsidePitch === true ? null : (
            <TacticalBoardRoleDestinations
              activeNx={drag?.nx ?? activeDragSlot.nx}
              activeNy={drag?.ny ?? activeDragSlot.ny}
              player={activeDragPlayer}
              slotId={activeDragSlot.slotId}
              text={text}
            />
          )}
          {slots.map((slot) => {
            const player = slot.playerId === null ? undefined : playerById.get(slot.playerId);
            const renderedSlot = drag?.slotId === slot.slotId && !drag.outsidePitch
              ? { ...slot, nx: drag.nx, ny: drag.ny }
              : slot;
            const slotFact = tacticalBoardSlotFact(slot);
            const slotChanged = previousSlotFactsRef.current.get(slot.slotId) !== slotFact;

            return (
              <m.g
                animate={webMotionTargets.rest}
                data-motion-slot-key={`${slot.slotId}:${slotFact}`}
                data-tactical-lineup-slot-id={slot.slotId}
                initial={formationChanged || slotChanged ? webMotionTargets.tacticalSelectionEnter : false}
                key={`${formationMotionKey ?? "formation"}:${slot.slotId}:${slotFact}`}
                transition={webMotion.micro}
              >
                {player === undefined ? (
                  <TacticalBoardEmptySlot slot={renderedSlot} text={text} onOpen={openSlotFromClick} />
                ) : (
                  <TacticalBoardPlayerToken
                    player={player}
                    slot={renderedSlot}
                    suitability={suitabilityForTacticalBoardAssignment(player, slot.role, slot.slotId)}
                    text={text}
                    onOpen={openSlotFromClick}
                  />
                )}
              </m.g>
            );
          })}
        </svg>

        {drag?.hasMoved !== true || !drag.outsidePitch || activeDragPlayer === undefined || activeDragSlot === undefined
          ? null
          : (
              <TacticalBoardDragPreview
                clientX={drag.clientX}
                clientY={drag.clientY}
                number={activeDragPlayer.number}
                role={activeDragSlot.role}
                surname={activeDragPlayer.surname}
              />
            )}

        {activeMenuSlot === undefined ? null : (
          <TacticalBoardAnchoredPopover
            anchorNx={activeMenuSlot.nx}
            anchorNy={activeMenuSlot.ny}
            containerRef={fieldRef}
            ref={menuRef}
            variant="menu"
          >
            <m.div
              animate={webMotionTargets.rest}
              initial={webMotionTargets.tacticalPopoverEnter}
              key={activeMenuSlot.slotId}
              transition={webMotion.micro}
            >
              <TacticalBoardMenu
                candidates={candidates}
                roleOptions={roleOptions}
                text={text}
                onAssign={(playerId) => {
                  onAssign?.(activeMenuSlot.slotId, playerId);
                  setMenu(undefined);
                }}
                onRemove={() => {
                  onRemove?.(activeMenuSlot.slotId);
                  setMenu(undefined);
                }}
                onRoleChange={(role) => {
                  onRoleChange?.(activeMenuSlot.slotId, role);
                  setMenu(undefined);
                }}
              />
            </m.div>
          </TacticalBoardAnchoredPopover>
        )}
        {adaptation === undefined || adaptationPlayer === undefined ? null : (
          <TacticalBoardAnchoredPopover
            anchorNx={adaptation.nx}
            anchorNy={adaptation.ny}
            containerRef={fieldRef}
            ref={menuRef}
            variant="adaptation"
          >
            <m.div
              animate={webMotionTargets.rest}
              initial={webMotionTargets.tacticalPopoverEnter}
              transition={webMotion.micro}
            >
              <TacticalBoardRoleAdaptationPopover
                player={adaptationPlayer}
                roles={adaptation.roles}
                slotId={adaptation.slotId}
                text={text}
                onApply={(role) => {
                  onRoleAdaptation?.(adaptation.slotId, role, adaptation.nx, adaptation.ny);
                  setAdaptation(undefined);
                }}
                onCancel={() => setAdaptation(undefined)}
              />
            </m.div>
          </TacticalBoardAnchoredPopover>
        )}
      </div>
    </section>
  );
}

function playerForSlot(
  slot: TacticalBoardSlot | undefined,
  players: ReadonlyMap<string, TacticalBoardPitchPlayer>,
): TacticalBoardPitchPlayer | undefined {
  return slot?.playerId === null || slot?.playerId === undefined ? undefined : players.get(slot.playerId);
}

function clampUnit(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function pointIsOutside(svg: SVGSVGElement, clientX: number, clientY: number): boolean {
  const bounds = svg.getBoundingClientRect();
  return clientX < bounds.left
    || clientX > bounds.right
    || clientY < bounds.top
    || clientY > bounds.bottom;
}

function tacticalBoardSlotFacts(slots: readonly TacticalBoardSlot[]): Map<string, string> {
  return new Map(slots.map((slot) => [slot.slotId, tacticalBoardSlotFact(slot)]));
}

function tacticalBoardSlotFact(slot: TacticalBoardSlot): string {
  return `${slot.playerId ?? "empty"}:${slot.role}`;
}
