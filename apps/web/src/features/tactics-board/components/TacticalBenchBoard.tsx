import React, { useEffect, useMemo, useRef, useState } from "react";
import * as m from "motion/react-m";

import type { Translator } from "@game/i18n";

import type {
  TacticalBenchPlayer,
  TacticalBenchSlotId,
  TacticalBenchSlotView,
} from "../tactical-board-bench";
import { sortTacticalBenchAssignmentCandidates } from "../tactical-board-suitability";
import type { TacticalBoardPointerPoint } from "../tactical-board-interactions";
import { TacticalBoardMenu, type TacticalBoardMenuCandidate } from "./TacticalBoardMenu";
import { TacticalBoardDragPreview } from "./TacticalBoardDragPreview";
import { TacticalBenchSlotToken } from "./TacticalBenchSlotToken";
import { webMotion, webMotionTargets } from "../../../shared/motion/web-motion";

export interface TacticalBenchBoardCandidate extends TacticalBenchPlayer {
  /** Full display name used only as a stable fallback in sorting. */
  readonly name?: string;
  /** Broad localized role key used by the shared candidate row. */
  readonly roleKey?: string;
  /** Specific football position key used for deterministic sorting. */
  readonly positionKey?: string;
  /** Player current ability used for bench candidate ordering. */
  readonly currentAbility?: number;
  /** Fitness percentage used for bench candidate ordering and row display. */
  readonly fitness?: number;
}

export interface TacticalBenchBoardProps {
  /** Ordered fixed substitute slots to render. */
  readonly slots: readonly TacticalBenchSlotView[];
  /** Players available to assign to empty reserve slots. */
  readonly availablePlayers?: readonly TacticalBenchBoardCandidate[];
  /** Player ids unavailable because they are already in the XI. */
  readonly excludedPlayerIds?: readonly string[];
  /** Optional controlled open slot id for screens or visual QA. */
  readonly openSlotId?: TacticalBenchSlotId;
  /** Selected substitute count derived by the caller. */
  readonly selectedSlotCount: number;
  /** Required substitute count, normally eight. */
  readonly requiredSlotCount: number;
  /** Translation function owned by the current screen. */
  readonly text: Translator;
  /** Opens the caller-owned action surface for one slot. */
  readonly onSlotOpen?: (slotId: TacticalBenchSlotId) => void;
  /** Notifies controlled callers when the active slot opens or closes. */
  readonly onOpenSlotChange?: (slotId: TacticalBenchSlotId | undefined) => void;
  /** Assigns one available player to one empty reserve slot. */
  readonly onAssign?: (slotId: TacticalBenchSlotId, playerId: string) => void;
  /** Clears one filled reserve slot. */
  readonly onRemove?: (slotId: TacticalBenchSlotId) => void;
  /** Controls whether bench players can be edited or only inspected. */
  readonly mode?: "editable" | "view_only";
  /** Applies one bench-to-XI drop through the caller-owned command boundary. */
  readonly onPlayerDropOnLineup?: (
    benchSlotId: TacticalBenchSlotId,
    playerId: string,
    lineupSlotId: string,
  ) => void;
  /** Reports active bench drags so the shared pitch can show drop feedback. */
  readonly onDragActiveChange?: (active: boolean) => void;
  /** Visually marks the bench while a starter is dragged toward it. */
  readonly dropActive?: boolean;
}

interface TacticalBenchDragState {
  readonly slotId: TacticalBenchSlotId;
  readonly pointerId: number;
  readonly start: TacticalBoardPointerPoint;
  readonly clientX: number;
  readonly clientY: number;
  readonly hasMoved: boolean;
}

/** Shared compact bench board for match preparation and future tactics screens. */
export function TacticalBenchBoard({
  slots,
  availablePlayers = [],
  excludedPlayerIds = [],
  openSlotId,
  selectedSlotCount,
  requiredSlotCount,
  text,
  onSlotOpen,
  onOpenSlotChange,
  onAssign,
  onRemove,
  mode = "editable",
  onPlayerDropOnLineup,
  onDragActiveChange,
  dropActive = false,
}: TacticalBenchBoardProps): React.JSX.Element {
  const [internalOpenSlotId, setInternalOpenSlotId] = useState<TacticalBenchSlotId | undefined>();
  const menuRef = useRef<HTMLDivElement>(null);
  const previousSlotFactsRef = useRef(tacticalBenchSlotFacts(slots));
  const [drag, setDrag] = useState<TacticalBenchDragState>();
  const dragRef = useRef<TacticalBenchDragState | undefined>(undefined);
  const suppressClickRef = useRef(false);
  const activeSlotId = openSlotId ?? internalOpenSlotId;
  const activeSlot = slots.find((slot) => slot.slotId === activeSlotId);
  const draggedPlayer = drag === undefined
    ? undefined
    : slots.find((slot) => slot.slotId === drag.slotId)?.player;
  const selectedPlayerIds = useMemo(
    () => new Set(slots.flatMap((slot) => (slot.player === undefined ? [] : [slot.player.playerId]))),
    [slots],
  );
  const unavailablePlayerIds = useMemo(
    () => new Set([...excludedPlayerIds, ...selectedPlayerIds]),
    [excludedPlayerIds, selectedPlayerIds],
  );
  const candidateRows = useMemo(
    () =>
      sortTacticalBenchAssignmentCandidates(
        availablePlayers.filter((player) => !unavailablePlayerIds.has(player.playerId)),
      ).map(toMenuCandidate),
    [availablePlayers, unavailablePlayerIds],
  );

  useEffect(() => {
    previousSlotFactsRef.current = tacticalBenchSlotFacts(slots);
  }, [slots]);

  useEffect(() => {
    const pointerId = drag?.pointerId;
    if (pointerId === undefined) return undefined;

    const moveDrag = (event: PointerEvent): void => {
      const activeDrag = dragRef.current;
      if (activeDrag === undefined || event.pointerId !== activeDrag.pointerId) return;
      const nextDrag = {
        ...activeDrag,
        clientX: event.clientX,
        clientY: event.clientY,
        hasMoved: activeDrag.hasMoved
          || Math.hypot(event.clientX - activeDrag.start.x, event.clientY - activeDrag.start.y) > 2,
      };
      dragRef.current = nextDrag;
      setDrag(nextDrag);
    };
    const finishDrag = (event: PointerEvent, commit: boolean): void => {
      const activeDrag = dragRef.current;
      if (activeDrag === undefined || event.pointerId !== activeDrag.pointerId) return;
      const draggedSlot = slots.find((slot) => slot.slotId === activeDrag.slotId);
      const dropTarget = document.elementFromPoint(event.clientX, event.clientY);
      const lineupSlotId = dropTarget?.closest("[data-tactical-lineup-slot-id]")
        ?.getAttribute("data-tactical-lineup-slot-id");

      if (
        commit
        && activeDrag.hasMoved
        && draggedSlot?.player !== undefined
        && lineupSlotId !== null
        && lineupSlotId !== undefined
      ) {
        onPlayerDropOnLineup?.(activeDrag.slotId, draggedSlot.player.playerId, lineupSlotId);
      }
      if (activeDrag.hasMoved) {
        suppressClickRef.current = true;
        window.setTimeout(() => {
          suppressClickRef.current = false;
        }, 0);
      }

      dragRef.current = undefined;
      setDrag(undefined);
      onDragActiveChange?.(false);
    };
    const commitDrag = (event: PointerEvent): void => finishDrag(event, true);
    const cancelDrag = (event: PointerEvent): void => finishDrag(event, false);

    document.addEventListener("pointermove", moveDrag, true);
    document.addEventListener("pointerup", commitDrag, true);
    document.addEventListener("pointercancel", cancelDrag, true);
    return () => {
      document.removeEventListener("pointermove", moveDrag, true);
      document.removeEventListener("pointerup", commitDrag, true);
      document.removeEventListener("pointercancel", cancelDrag, true);
    };
  }, [drag?.pointerId, onDragActiveChange, onPlayerDropOnLineup, slots]);

  const closeMenu = (): void => {
    if (openSlotId === undefined) {
      setInternalOpenSlotId(undefined);
    }

    onOpenSlotChange?.(undefined);
  };

  const openSlot = (slotId: TacticalBenchSlotId): void => {
    if (mode === "view_only" || suppressClickRef.current) return;
    const slot = slots.find((candidate) => candidate.slotId === slotId);
    const canOpen = slot?.player === undefined
      ? onAssign !== undefined && candidateRows.length > 0
      : onRemove !== undefined;
    if (!canOpen) return;
    if (openSlotId === undefined) {
      setInternalOpenSlotId(slotId);
    }

    onSlotOpen?.(slotId);
    onOpenSlotChange?.(slotId);
  };

  useEffect(() => {
    if (activeSlotId === undefined) {
      return undefined;
    }

    const closeMenuWhenTargetIsOutsideBench = (event: PointerEvent): void => {
      if (!(event.target instanceof Node)) {
        return;
      }

      if (menuRef.current?.contains(event.target) === true) {
        return;
      }

      if (event.target instanceof Element && event.target.closest("[data-bench-slot-id]") !== null) {
        return;
      }

      closeMenu();
    };

    const closeMenuOnEscape = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };

    document.addEventListener("pointerdown", closeMenuWhenTargetIsOutsideBench, true);
    document.addEventListener("keydown", closeMenuOnEscape, true);

    return () => {
      document.removeEventListener("pointerdown", closeMenuWhenTargetIsOutsideBench, true);
      document.removeEventListener("keydown", closeMenuOnEscape, true);
    };
  }, [activeSlotId]);

  const assignPlayer = (playerId: string): void => {
    if (activeSlotId !== undefined) {
      onAssign?.(activeSlotId, playerId);
    }

    closeMenu();
  };

  const removePlayer = (): void => {
    if (activeSlotId !== undefined) {
      onRemove?.(activeSlotId);
    }

    closeMenu();
  };

  return (
    <section
      className="tls-tactical-bench-board"
      aria-labelledby="tls-tactical-bench-board-title"
      data-drop-active={dropActive ? "true" : "false"}
    >
      <header className="tls-tactical-bench-board-header">
        <h3 id="tls-tactical-bench-board-title">{text("career.matchPreparation.bench")}</h3>
        <span>{selectedSlotCount}/{requiredSlotCount}</span>
      </header>
      <div
        className="tls-tactical-bench-board-surface"
        onPointerDown={(event) => {
          if (event.target === event.currentTarget) {
            closeMenu();
          }
        }}
        role="list"
      >
        {slots.map((slot) => {
          const slotFact = tacticalBenchSlotFact(slot);
          const slotChanged = previousSlotFactsRef.current.get(slot.slotId) !== slotFact;

          return (
            <m.div
              className="tls-tactical-bench-board-item"
              data-dragging={drag?.slotId === slot.slotId ? "true" : "false"}
              data-motion-slot-key={`${slot.slotId}:${slotFact}`}
              key={`${slot.slotId}:${slotFact}`}
              role="listitem"
              initial={slotChanged ? webMotionTargets.tacticalSelectionEnter : false}
              animate={webMotionTargets.rest}
              transition={webMotion.micro}
            >
              <TacticalBenchSlotToken
                slot={slot}
                text={text}
                onOpen={openSlot}
                onPlayerPointerDown={(event, selectedSlot) => {
                  if (
                    mode === "editable"
                    && event.button === 0
                    && selectedSlot.player !== undefined
                    && onPlayerDropOnLineup !== undefined
                  ) {
                    const nextDrag = {
                      slotId: selectedSlot.slotId,
                      pointerId: event.pointerId,
                      start: { x: event.clientX, y: event.clientY },
                      clientX: event.clientX,
                      clientY: event.clientY,
                      hasMoved: false,
                    };
                    dragRef.current = nextDrag;
                    setDrag(nextDrag);
                    onDragActiveChange?.(true);
                  }
                }}
              />
            </m.div>
          );
        })}
      </div>
      {drag?.hasMoved !== true || draggedPlayer === undefined ? null : (
          <TacticalBoardDragPreview
            clientX={drag.clientX}
            clientY={drag.clientY}
            number={draggedPlayer.number}
            role={draggedPlayer.roleCode}
            surname={draggedPlayer.surname}
          />
        )}
      {activeSlot === undefined || mode === "view_only" ? null : (
        <m.div
          key={activeSlot.slotId}
          className="tls-tactical-bench-menu-popover"
          ref={menuRef}
          initial={webMotionTargets.tacticalPopoverEnter}
          animate={webMotionTargets.rest}
          transition={webMotion.micro}
        >
          <TacticalBoardMenu
            candidates={activeSlot.player === undefined ? candidateRows : []}
            removeLabelKey="career.tacticalBench.removeFromBench"
            text={text}
            {...(activeSlot.player === undefined || onRemove === undefined ? {} : { onRemove: removePlayer })}
            {...(activeSlot.player === undefined && onAssign !== undefined ? { onAssign: assignPlayer } : {})}
          />
        </m.div>
      )}
    </section>
  );
}

function tacticalBenchSlotFacts(slots: readonly TacticalBenchSlotView[]): Map<string, string> {
  return new Map(slots.map((slot) => [slot.slotId, tacticalBenchSlotFact(slot)]));
}

function tacticalBenchSlotFact(slot: TacticalBenchSlotView): string {
  return slot.player?.playerId ?? "empty";
}

function toMenuCandidate(player: TacticalBenchBoardCandidate): TacticalBoardMenuCandidate {
  return {
    player: {
      playerId: player.playerId,
      number: player.number,
      surname: player.surname,
      formTrend: "flat",
      roleCode: player.roleCode,
      ...(player.roleKey === undefined ? {} : { roleKey: player.roleKey }),
    },
    suitability: "competent",
    ...(player.fitness === undefined ? {} : { fitness: player.fitness }),
  };
}
