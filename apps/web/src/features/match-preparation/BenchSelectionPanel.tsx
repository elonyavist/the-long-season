import type React from "react";

import type { MessageKey, Translator } from "@game/i18n";
import type { CareerMatchPreparationView } from "@game/ui";

import { comparePlayerOptionsByPosition } from "../../shared/lib/player-position-ordering";
import { benchStatusLabelKey, formatTacticalPlayerOption } from "../../shared/lib/match-preparation-labels";

type BenchSlot = CareerMatchPreparationView["bench"]["slots"][number];

/** Props for the reusable ordered substitutes selection panel. */
export interface BenchSelectionPanelProps {
  /** Ordered bench slots exposed by the preparation read model. */
  readonly slots: readonly BenchSlot[];
  /** Count of currently selected substitutes. */
  readonly selectedSlotCount: number;
  /** Required substitute count. */
  readonly requiredSlotCount: number;
  /** Localized text lookup. */
  readonly text: Translator;
  /** Called when the manager assigns or clears one bench slot. */
  readonly onBenchPlayerChange: (slotKey: string, playerId: string | undefined) => void;
  /** Called when a substitute selection should focus the player detail panel. */
  readonly onSelectedPlayerFocus?: (playerId: string) => void;
}

/** Renders the explicit 8-player substitutes selection used by tactical workspaces. */
export function BenchSelectionPanel({
  slots,
  selectedSlotCount,
  requiredSlotCount,
  text,
  onBenchPlayerChange,
  onSelectedPlayerFocus,
}: BenchSelectionPanelProps): React.JSX.Element {
  return (
    <section className="tls-preparation-bench" aria-labelledby="match-preparation-bench-title">
      <div className="tls-preparation-bench-header">
        <h3 id="match-preparation-bench-title">{text("career.matchPreparation.bench")}</h3>
        <span>{text("career.matchPreparation.bench.selectedSlots")}: {selectedSlotCount}/{requiredSlotCount}</span>
      </div>
      <div className="tls-preparation-bench-grid">
        {slots.map((slot) => (
          <label className="tls-preparation-bench-slot" data-status={slot.status} key={slot.slotKey}>
            <span className="tls-preparation-bench-label">
              <span>{text(slot.labelKey as MessageKey)}</span>
              {slot.status === "valid" ? null : (
                <span
                  aria-label={text(benchStatusLabelKey(slot.status))}
                  className="tls-preparation-slot-alert"
                  title={text(benchStatusLabelKey(slot.status))}
                >
                  !
                </span>
              )}
            </span>
            <select
              value={slot.selectedPlayerId ?? ""}
              onChange={(event) => {
                const nextValue = event.currentTarget.value;
                onBenchPlayerChange(slot.slotKey, nextValue.length === 0 ? undefined : nextValue);

                if (nextValue.length > 0) {
                  onSelectedPlayerFocus?.(nextValue);
                }
              }}
            >
              <option value="">{text("career.matchPreparation.playerOptionEmpty")}</option>
              {[...slot.playerOptions].sort(comparePlayerOptionsByPosition).map((player) => (
                <option key={player.playerId} value={player.playerId}>
                  {formatTacticalPlayerOption(player, text)}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
    </section>
  );
}
