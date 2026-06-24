import React, { useEffect, useMemo, useRef, useState } from "react";

import type { Translator } from "@game/i18n";

import { pointerToNorm, TACTICAL_BOARD_PITCH, toSvg } from "../tactical-board-geometry";
import {
  canChangeTacticalBoardSlotRole,
  canDragTacticalBoardSlot,
  shouldCancelTacticalBoardLongPress,
  TACTICAL_BOARD_LONG_PRESS_MS,
  tacticalBoardZoneRect,
  type TacticalBoardPointerPoint,
} from "../tactical-board-interactions";
import { TACTICAL_BOARD_ROLES, tacticalBoardRoleOptionsForPosition } from "../tactical-board-roles";
import {
  sortTacticalBoardAssignmentCandidates,
  suitabilityForTacticalBoardAssignment,
} from "../tactical-board-suitability";
import type { TacticalBoardRoleCode, TacticalBoardSlot } from "../tactical-board-types";
import { TacticalBoardEmptySlot } from "./TacticalBoardEmptySlot";
import { TacticalBoardMenu } from "./TacticalBoardMenu";
import { TacticalBoardPitchMarkings } from "./TacticalBoardPitchMarkings";
import {
  TacticalBoardPlayerToken,
  type TacticalBoardSuitabilityLevel,
  type TacticalBoardTokenPlayer,
} from "./TacticalBoardPlayerToken";

export interface TacticalBoardPitchPlayer extends TacticalBoardTokenPlayer {
  readonly suitabilityBySlotId?: Readonly<Record<string, TacticalBoardSuitabilityLevel>>;
  readonly suitabilityByRole?: Partial<Record<TacticalBoardRoleCode, TacticalBoardSuitabilityLevel>>;
  readonly fitness?: number;
}

export interface TacticalBoardPitchProps {
  readonly slots: readonly TacticalBoardSlot[];
  readonly players: readonly TacticalBoardPitchPlayer[];
  readonly availablePlayers?: readonly TacticalBoardPitchPlayer[];
  readonly text: Translator;
  readonly currentShape: string;
  readonly onSlotOpen?: (slotId: string) => void;
  readonly onSlotMove?: (slotId: string, nx: number, ny: number) => void;
  readonly onRoleChange?: (slotId: string, role: TacticalBoardRoleCode) => void;
  readonly onRemove?: (slotId: string) => void;
  readonly onAssign?: (slotId: string, playerId: string) => void;
}

interface TacticalBoardDragState {
  readonly slotId: string;
  readonly pointerId: number;
  readonly start: TacticalBoardPointerPoint;
  readonly hasMoved: boolean;
}

interface TacticalBoardLongPressState {
  readonly slotId: string;
  readonly pointerId: number;
  readonly start: TacticalBoardPointerPoint;
}

interface TacticalBoardMenuState {
  readonly slotId: string;
}

/** Shared vertical tactical pitch used by match preparation and future tactics screens. */
export function TacticalBoardPitch({
  slots,
  players,
  availablePlayers,
  text,
  currentShape,
  onSlotOpen,
  onSlotMove,
  onRoleChange,
  onRemove,
  onAssign,
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
  const [drag, setDrag] = useState<TacticalBoardDragState | undefined>();
  const [menu, setMenu] = useState<TacticalBoardMenuState | undefined>();
  const menuRef = useRef<HTMLDivElement>(null);
  const longPressTimerRef = useRef<number | undefined>(undefined);
  const longPressStateRef = useRef<TacticalBoardLongPressState | undefined>(undefined);
  const suppressClickRef = useRef(false);

  const activeDragSlot = drag === undefined ? undefined : slots.find((slot) => slot.slotId === drag.slotId);
  const activeMenuSlot = menu === undefined ? undefined : slots.find((slot) => slot.slotId === menu.slotId);
  const activeMenuPlayer =
    activeMenuSlot === undefined || activeMenuSlot.playerId === null ? undefined : playerById.get(activeMenuSlot.playerId);

  useEffect(() => {
    if (menu === undefined) {
      return undefined;
    }

    const closeMenuWhenTargetIsOutsideActiveControls = (event: PointerEvent): void => {
      if (!(event.target instanceof Node)) {
        return;
      }

      if (menuRef.current?.contains(event.target) === true) {
        return;
      }

      if (event.target instanceof Element && event.target.closest("[data-slot-id]") !== null) {
        return;
      }

      setMenu(undefined);
    };

    const closeMenuOnEscape = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        setMenu(undefined);
      }
    };

    document.addEventListener("pointerdown", closeMenuWhenTargetIsOutsideActiveControls, true);
    document.addEventListener("keydown", closeMenuOnEscape, true);

    return () => {
      document.removeEventListener("pointerdown", closeMenuWhenTargetIsOutsideActiveControls, true);
      document.removeEventListener("keydown", closeMenuOnEscape, true);
    };
  }, [menu]);

  const clearLongPress = (): void => {
    if (longPressTimerRef.current !== undefined) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = undefined;
    }

    longPressStateRef.current = undefined;
  };

  const openSlotMenu = (slotId: string): void => {
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

  const slotFromEventTarget = (target: EventTarget | null): TacticalBoardSlot | undefined => {
    if (!(target instanceof Element)) {
      return undefined;
    }

    const slotElement = target.closest("[data-slot-id]");
    const slotId = slotElement?.getAttribute("data-slot-id");

    return slotId === null || slotId === undefined ? undefined : slots.find((slot) => slot.slotId === slotId);
  };

  const openSlotFromClick = (slotId: string): void => {
    if (suppressClickRef.current) {
      return;
    }

    openSlotMenu(slotId);
  };

  const handlePointerDown = (event: React.PointerEvent<SVGSVGElement>): void => {
    if (event.button !== 0) {
      return;
    }

    const slot = slotFromEventTarget(event.target);
    if (slot === undefined) {
      return;
    }

    setMenu(undefined);
    const start = { x: event.clientX, y: event.clientY };

    if (event.pointerType !== "mouse") {
      scheduleLongPress(slot.slotId, event.pointerId, start);
    }

    if (!canDragTacticalBoardSlot(slot)) {
      return;
    }

    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Some synthetic pointer events used by QA do not create a capturable native pointer.
    }
    setDrag({ slotId: slot.slotId, pointerId: event.pointerId, start, hasMoved: false });
  };

  const handlePointerMove = (event: React.PointerEvent<SVGSVGElement>): void => {
    const longPressState = longPressStateRef.current;
    if (
      longPressState !== undefined &&
      longPressState.pointerId === event.pointerId &&
      shouldCancelTacticalBoardLongPress(longPressState.start, { x: event.clientX, y: event.clientY })
    ) {
      clearLongPress();
    }

    if (drag === undefined || drag.pointerId !== event.pointerId) {
      return;
    }

    const slot = slots.find((candidate) => candidate.slotId === drag.slotId);
    if (slot === undefined || !canDragTacticalBoardSlot(slot)) {
      return;
    }

    const norm = pointerToNorm(event.currentTarget, event.clientX, event.clientY);
    const zone = TACTICAL_BOARD_ROLES[slot.role].zone;
    const nextNx = Math.min(zone.nxMax, Math.max(zone.nxMin, norm.nx));
    const nextNy = Math.min(zone.nyMax, Math.max(zone.nyMin, norm.ny));
    const hasMoved =
      drag.hasMoved || shouldCancelTacticalBoardLongPress(drag.start, { x: event.clientX, y: event.clientY }, 2);

    setDrag({ ...drag, hasMoved });
    onSlotMove?.(slot.slotId, nextNx, nextNy);
  };

  const handlePointerUp = (event: React.PointerEvent<SVGSVGElement>): void => {
    clearLongPress();

    if (drag !== undefined && drag.pointerId === event.pointerId) {
      try {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }
      } catch {
        // Ignore synthetic pointer release mismatches; drag state is still cleared below.
      }

      if (drag.hasMoved) {
        suppressClickRef.current = true;
        window.setTimeout(() => {
          suppressClickRef.current = false;
        }, 0);
      }

      setDrag(undefined);
    }
  };

  const handleContextMenu = (event: React.MouseEvent<SVGSVGElement>): void => {
    const slot = slotFromEventTarget(event.target);
    if (slot === undefined) {
      return;
    }

    event.preventDefault();
    clearLongPress();
    openSlotMenu(slot.slotId);
  };

  const handleKeyDown = (event: React.KeyboardEvent<SVGSVGElement>): void => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    const slot = slotFromEventTarget(event.target);
    if (slot === undefined) {
      return;
    }

    event.preventDefault();
    openSlotMenu(slot.slotId);
  };

  const activeZoneRect =
    activeDragSlot === undefined ? undefined : tacticalBoardZoneRect(TACTICAL_BOARD_ROLES[activeDragSlot.role].zone);
  const menuAnchor = activeMenuSlot === undefined ? undefined : toSvg(activeMenuSlot.nx, activeMenuSlot.ny);
  const menuStyle =
    menuAnchor === undefined
      ? undefined
      : ({
          "--tls-tactical-board-menu-left": `${(menuAnchor.x / TACTICAL_BOARD_PITCH.viewBoxW) * 100}%`,
          "--tls-tactical-board-menu-top": `${(menuAnchor.y / TACTICAL_BOARD_PITCH.viewBoxH) * 100}%`,
        } as React.CSSProperties);

  const roleOptions =
    activeMenuSlot === undefined ||
    activeMenuPlayer === undefined ||
    !canChangeTacticalBoardSlotRole(activeMenuSlot)
      ? []
      : tacticalBoardRoleOptionsForPosition(activeMenuSlot.nx, activeMenuSlot.ny, activeMenuSlot.role).map((role) => ({
          role,
          suitability: suitabilityForTacticalBoardAssignment(activeMenuPlayer, role, activeMenuSlot.slotId),
          isCurrent: role === activeMenuSlot.role,
        }));
  const candidates =
    activeMenuSlot === undefined || (activeMenuSlot.playerId !== null && !activeMenuSlot.locked)
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

      <div className="tls-tactical-board-field">
        <svg
          aria-label={text("career.tacticalBoard.title")}
          className="tls-tactical-board-svg"
          onContextMenu={handleContextMenu}
          onKeyDown={handleKeyDown}
          onPointerCancel={handlePointerUp}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          role="img"
          viewBox={`0 0 ${TACTICAL_BOARD_PITCH.viewBoxW} ${TACTICAL_BOARD_PITCH.viewBoxH}`}
        >
          <TacticalBoardPitchMarkings />
          {activeZoneRect === undefined || activeDragSlot === undefined ? null : (
            <rect
              className="tls-tactical-board-active-zone"
              data-department={TACTICAL_BOARD_ROLES[activeDragSlot.role].department}
              height={activeZoneRect.height}
              width={activeZoneRect.width}
              x={activeZoneRect.x}
              y={activeZoneRect.y}
            />
          )}
          {slots.map((slot) => {
            const player = slot.playerId === null ? undefined : playerById.get(slot.playerId);

            return player === undefined ? (
              <TacticalBoardEmptySlot
                key={slot.slotId}
                slot={slot}
                text={text}
                onOpen={openSlotFromClick}
              />
            ) : (
              <TacticalBoardPlayerToken
                key={slot.slotId}
                player={player}
                slot={slot}
                suitability={suitabilityForTacticalBoardAssignment(player, slot.role, slot.slotId)}
                text={text}
                onOpen={openSlotFromClick}
              />
            );
          })}
        </svg>

        {activeMenuSlot === undefined ? null : (
          <div className="tls-tactical-board-menu-popover" ref={menuRef} style={menuStyle}>
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
          </div>
        )}
      </div>
    </section>
  );
}
