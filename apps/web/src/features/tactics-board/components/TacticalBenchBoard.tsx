import React, { useEffect, useMemo, useRef, useState } from "react";
import * as m from "motion/react-m";

import type { Translator } from "@game/i18n";

import type {
  TacticalBenchPlayer,
  TacticalBenchSlotId,
  TacticalBenchSlotView,
} from "../tactical-board-bench";
import { sortTacticalBenchAssignmentCandidates } from "../tactical-board-suitability";
import { TacticalBoardMenu, type TacticalBoardMenuCandidate } from "./TacticalBoardMenu";
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
}: TacticalBenchBoardProps): React.JSX.Element {
  const [internalOpenSlotId, setInternalOpenSlotId] = useState<TacticalBenchSlotId | undefined>();
  const menuRef = useRef<HTMLDivElement>(null);
  const previousSlotFactsRef = useRef(tacticalBenchSlotFacts(slots));
  const activeSlotId = openSlotId ?? internalOpenSlotId;
  const activeSlot = slots.find((slot) => slot.slotId === activeSlotId);
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

  const closeMenu = (): void => {
    if (openSlotId === undefined) {
      setInternalOpenSlotId(undefined);
    }

    onOpenSlotChange?.(undefined);
  };

  const openSlot = (slotId: TacticalBenchSlotId): void => {
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
    <section className="tls-tactical-bench-board" aria-labelledby="tls-tactical-bench-board-title">
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
              />
            </m.div>
          );
        })}
      </div>
      {activeSlot === undefined ? null : (
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
      ...(player.roleKey === undefined ? {} : { roleKey: player.roleKey }),
    },
    suitability: "competent",
    ...(player.fitness === undefined ? {} : { fitness: player.fitness }),
  };
}
