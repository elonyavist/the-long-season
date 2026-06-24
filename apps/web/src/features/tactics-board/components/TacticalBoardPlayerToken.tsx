import type React from "react";

import type { MessageKey, Translator } from "@game/i18n";

import { toSvg } from "../tactical-board-geometry";
import type { TacticalBoardRoleCode, TacticalBoardSlot } from "../tactical-board-types";

/** Fitness trend shown on one player token. */
export type TacticalBoardFormTrend = "up" | "flat" | "down";

/** Suitability levels shown by token border color. */
export type TacticalBoardSuitabilityLevel = "natural" | "accomplished" | "competent" | "unconvincing" | "makeshift";

/** Minimal player facts needed by the visual token. */
export interface TacticalBoardTokenPlayer {
  readonly playerId: string;
  readonly number: number;
  readonly surname: string;
  readonly formTrend: TacticalBoardFormTrend;
}

export interface TacticalBoardPlayerTokenProps {
  readonly slot: TacticalBoardSlot;
  readonly player: TacticalBoardTokenPlayer;
  readonly roleCode?: TacticalBoardRoleCode;
  readonly suitability: TacticalBoardSuitabilityLevel;
  readonly text: Translator;
  readonly onOpen?: (slotId: string) => void;
}

/** Renders one assigned player token with number, surname, role, form, and role fit. */
export function TacticalBoardPlayerToken({
  slot,
  player,
  roleCode = slot.role,
  suitability,
  text,
  onOpen,
}: TacticalBoardPlayerTokenProps): React.JSX.Element {
  const { x, y } = toSvg(slot.nx, slot.ny);
  const accessibleName = `${player.number} ${player.surname} ${roleCode} ${text(suitabilityLabelKey(suitability) as MessageKey)}`;

  return (
    <g
      aria-label={accessibleName}
      className="tls-tactical-board-token"
      data-form={player.formTrend}
      data-role={roleCode}
      data-slot-id={slot.slotId}
      data-suitability={suitability}
      onClick={() => onOpen?.(slot.slotId)}
      role="button"
      tabIndex={0}
      transform={`translate(${x} ${y})`}
    >
      <circle className="tls-tactical-board-token-face" r={25} />
      <text className="tls-tactical-board-token-number" textAnchor="middle" dy={8}>
        {player.number}
      </text>
      <circle className="tls-tactical-board-form-dot" cx={19} cy={-18} r={11} />
      <FormArrow trend={player.formTrend} />
      <text className="tls-tactical-board-token-name" textAnchor="middle" y={52}>
        {player.surname}
      </text>
      <text className="tls-tactical-board-token-role" textAnchor="middle" y={74}>
        {roleCode}
      </text>
    </g>
  );
}

function FormArrow({ trend }: { readonly trend: TacticalBoardFormTrend }): React.JSX.Element {
  if (trend === "up") {
    return <path className="tls-tactical-board-form-arrow" d="M19,-23 14,-15 24,-15 Z" />;
  }

  if (trend === "down") {
    return <path className="tls-tactical-board-form-arrow" d="M19,-13 14,-21 24,-21 Z" />;
  }

  return <rect className="tls-tactical-board-form-arrow" x={14} y={-19.5} width={10} height={3} rx={1.5} />;
}

/** Returns the localization key for one suitability level. */
export function suitabilityLabelKey(level: TacticalBoardSuitabilityLevel): string {
  return `career.tacticalBoard.suit.${level}`;
}
