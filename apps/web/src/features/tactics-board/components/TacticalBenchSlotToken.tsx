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
  /** Starts an accessible pointer drag for one available substitute. */
  readonly onPlayerPointerDown?: (
    event: React.PointerEvent<HTMLButtonElement>,
    slot: TacticalBenchSlotView,
  ) => void;
}

/** Renders one fixed substitute slot as either a player token or a plus button. */
export function TacticalBenchSlotToken({
  slot,
  text,
  onOpen,
  onPlayerPointerDown,
}: TacticalBenchSlotTokenProps): React.JSX.Element {
  const player = slot.player;
  const slotLabel = text(slot.labelKey);
  const ariaLabel =
    player === undefined
      ? `${slotLabel} ${text("career.tacticalBench.emptySlot")}`
      : `${slotLabel} ${player.number} ${player.surname} ${player.roleCode}`;
  const disabled = slot.status === "substituted_out" || slot.status === "unavailable";
  const liveFacts = player === undefined
    ? ""
    : [
        player.condition === undefined ? "" : `${Math.round(player.condition)}%`,
        player.rating === undefined ? "" : player.rating.toFixed(1),
      ].filter((fact) => fact.length > 0).join(" · ");

  return (
    <button
      aria-label={ariaLabel}
      className="tls-tactical-bench-slot"
      data-status={slot.status ?? (player === undefined ? "missing_player" : "valid")}
      data-bench-slot-id={slot.slotId}
      data-slot-id={slot.slotId}
      disabled={disabled}
      onClick={() => onOpen?.(slot.slotId)}
      onPointerDown={(event) => {
        if (!disabled && player !== undefined) onPlayerPointerDown?.(event, slot);
      }}
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
          {liveFacts.length === 0 ? null : (
            <span className="tls-tactical-bench-player-live">{liveFacts}</span>
          )}
          {slot.status === "substituted_out" ? (
            <span className="tls-tactical-bench-player-status">
              {text("career.matchday.playerStatus.substituted_off")}
            </span>
          ) : null}
        </span>
      )}
    </button>
  );
}
