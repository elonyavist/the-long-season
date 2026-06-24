import type React from "react";

import type { MessageKey, Translator } from "@game/i18n";
import type { CareerMatchPreparationView } from "@game/ui";

import pitchBackgroundUrl from "../../assets/campo-calcio.svg";
import { orderPlayerOptionsForLineupSlot } from "../../shared/lib/player-position-ordering";
import { formatTacticalPlayerOption, slotStatusLabelKey } from "../../shared/lib/match-preparation-labels";
import { tacticalPitchSlotStyle } from "./tactical-pitch-layout";

type TacticalPitchSlot = CareerMatchPreparationView["lineup"]["slots"][number];

type TacticalPitchBackgroundStyle = React.CSSProperties &
  Readonly<{
    "--tls-pitch-background-image": string;
  }>;

const TACTICAL_PITCH_BACKGROUND_STYLE: TacticalPitchBackgroundStyle = {
  "--tls-pitch-background-image": `url("${pitchBackgroundUrl}")`,
};

/** Props for the reusable vertical tactical lineup board. */
export interface TacticalPitchLineupProps {
  /** Ordered lineup slots for the selected formation. */
  readonly slots: readonly TacticalPitchSlot[];
  /** Localized text lookup. */
  readonly text: Translator;
  /** Called when the manager assigns or clears one slot. */
  readonly onLineupPlayerChange: (slotKey: string, playerId: string | undefined) => void;
  /** Called when a slot selection should focus the player detail panel. */
  readonly onSelectedPlayerFocus?: (playerId: string) => void;
}

/** Renders the reusable pitch/lavagna used by match preparation and future tactics screens. */
export function TacticalPitchLineup({
  slots,
  text,
  onLineupPlayerChange,
  onSelectedPlayerFocus,
}: TacticalPitchLineupProps): React.JSX.Element {
  return (
    <section className="tls-preparation-pitch-column" aria-labelledby="match-preparation-pitch-title">
      <h3 id="match-preparation-pitch-title">{text("career.matchPreparation.pitch")}</h3>
      <div
        className="tls-preparation-pitch"
        data-pitch-asset="campo-calcio.svg"
        role="list"
        style={TACTICAL_PITCH_BACKGROUND_STYLE}
      >
        <div className="tls-preparation-pitch-slots">
          {slots.map((slot) => (
            <article
              className="tls-preparation-slot"
              data-slot={slot.slotKey}
              data-status={slot.status}
              key={slot.slotKey}
              role="listitem"
              style={tacticalPitchSlotStyle(slot.slotKey)}
            >
              <div className="tls-preparation-slot-header">
                <div>
                  <h4>{text(slot.labelKey as MessageKey)}</h4>
                </div>
                {slot.status === "valid" ? null : (
                  <span
                    aria-label={text(slotStatusLabelKey(slot.status))}
                    className="tls-preparation-slot-alert"
                    title={text(slotStatusLabelKey(slot.status))}
                  >
                    !
                  </span>
                )}
              </div>

              <label className="tls-visually-hidden" htmlFor={`preparation-${slot.slotKey}`}>
                {text(slot.labelKey as MessageKey)} {text("career.matchPreparation.playerSelect")}
              </label>
              <select
                id={`preparation-${slot.slotKey}`}
                value={slot.selectedPlayerId ?? ""}
                onChange={(event) => {
                  const nextValue = event.currentTarget.value;
                  onLineupPlayerChange(slot.slotKey, nextValue.length === 0 ? undefined : nextValue);

                  if (nextValue.length > 0) {
                    onSelectedPlayerFocus?.(nextValue);
                  }
                }}
              >
                <option value="">{text("career.matchPreparation.playerOptionEmpty")}</option>
                {orderPlayerOptionsForLineupSlot(slot.slotKey, slot.playerOptions).map((player) => (
                  <option key={player.playerId} value={player.playerId}>
                    {formatTacticalPlayerOption(player, text)}
                  </option>
                ))}
              </select>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
