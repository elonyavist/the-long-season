import type React from "react";

import type { Translator } from "@game/i18n";

import type { TacticalBenchSlotView } from "../tactical-board-bench";

export interface TacticalBenchSlotTokenProps {
  /** Fixed substitute slot view rendered by this compact token. */
  readonly slot: TacticalBenchSlotView;
  /** Translation function owned by the caller. */
  readonly text: Translator;
  /** Opens the caller-owned action surface for this slot. */
  readonly onOpen?: (slotId: TacticalBenchSlotView["slotId"]) => void;
}

/** Renders one fixed substitute slot as either a player token or a plus button. */
export function TacticalBenchSlotToken({
  slot,
  text,
  onOpen,
}: TacticalBenchSlotTokenProps): React.JSX.Element {
  const player = slot.player;
  const slotLabel = text(slot.labelKey);
  const ariaLabel =
    player === undefined
      ? `${slotLabel} ${text("career.tacticalBench.emptySlot")}`
      : `${slotLabel} ${player.number} ${player.surname} ${player.roleCode}`;

  return (
    <button
      aria-label={ariaLabel}
      className="tls-tactical-bench-slot"
      data-status={slot.status ?? (player === undefined ? "missing_player" : "valid")}
      data-bench-slot-id={slot.slotId}
      data-slot-id={slot.slotId}
      onClick={() => onOpen?.(slot.slotId)}
      type="button"
    >
      <span className="tls-tactical-bench-slot-label">{slotLabel}</span>
      {player === undefined ? (
        <span aria-hidden="true" className="tls-tactical-bench-empty-plus">
          +
        </span>
      ) : (
        <span className="tls-tactical-bench-player">
          <span className="tls-tactical-bench-player-number">{player.number}</span>
          <span className="tls-tactical-bench-player-name">{player.surname}</span>
          <span className="tls-tactical-bench-player-role">{player.roleCode}</span>
        </span>
      )}
    </button>
  );
}
