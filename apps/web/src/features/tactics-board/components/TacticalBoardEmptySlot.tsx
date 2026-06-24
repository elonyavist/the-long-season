import type React from "react";

import type { Translator } from "@game/i18n";

import { toSvg } from "../tactical-board-geometry";
import type { TacticalBoardSlot } from "../tactical-board-types";

export interface TacticalBoardEmptySlotProps {
  readonly slot: TacticalBoardSlot;
  readonly text: Translator;
  readonly onOpen?: (slotId: string) => void;
}

/** Renders an empty tactical-board slot that can later open assignment choices. */
export function TacticalBoardEmptySlot({ slot, text, onOpen }: TacticalBoardEmptySlotProps): React.JSX.Element {
  const { x, y } = toSvg(slot.nx, slot.ny);

  return (
    <g
      aria-label={`${text("career.tacticalBoard.emptySlot")} ${slot.role}`}
      className="tls-tactical-board-empty-slot"
      data-role={slot.role}
      data-slot-id={slot.slotId}
      onClick={() => onOpen?.(slot.slotId)}
      role="button"
      tabIndex={0}
      transform={`translate(${x} ${y})`}
    >
      <circle className="tls-tactical-board-empty-slot-ring" r={25} />
      <text className="tls-tactical-board-empty-slot-plus" textAnchor="middle" dy={9}>
        +
      </text>
      <text className="tls-tactical-board-token-role" textAnchor="middle" y={52}>
        {slot.role}
      </text>
    </g>
  );
}
