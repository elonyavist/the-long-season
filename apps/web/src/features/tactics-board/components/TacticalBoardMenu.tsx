import type React from "react";

import type { MessageKey, Translator } from "@game/i18n";

import {
  formatFitnessPercent,
  formatFoot,
  roleLabelKey,
  type TacticalPlayerFoot,
} from "../../../shared/lib/match-preparation-labels";
import { PlayerCandidateRow } from "../../../shared/ui/PlayerCandidateRow";
import type { TacticalBoardRoleCode } from "../tactical-board-types";
import type { TacticalBoardSuitabilityLevel, TacticalBoardTokenPlayer } from "./TacticalBoardPlayerToken";
import { suitabilityLabelKey } from "./TacticalBoardPlayerToken";

export interface TacticalBoardMenuCandidatePlayer extends TacticalBoardTokenPlayer {
  readonly roleKey?: string;
  readonly foot?: TacticalPlayerFoot;
}

export interface TacticalBoardMenuCandidate {
  readonly player: TacticalBoardMenuCandidatePlayer;
  readonly suitability: TacticalBoardSuitabilityLevel;
  readonly fitness?: number;
}

export interface TacticalBoardMenuRoleOption {
  readonly role: TacticalBoardRoleCode;
  readonly suitability: TacticalBoardSuitabilityLevel;
  readonly isCurrent: boolean;
}

export interface TacticalBoardMenuProps {
  readonly text: Translator;
  readonly roleOptions?: readonly TacticalBoardMenuRoleOption[];
  readonly candidates?: readonly TacticalBoardMenuCandidate[];
  readonly onRoleChange?: (role: TacticalBoardRoleCode) => void;
  readonly onRemove?: () => void;
  readonly onAssign?: (playerId: string) => void;
}

/** Reusable tactical-board menu shell for role changes, removal, and assignment. */
export function TacticalBoardMenu({
  text,
  roleOptions = [],
  candidates = [],
  onRoleChange,
  onRemove,
  onAssign,
}: TacticalBoardMenuProps): React.JSX.Element {
  return (
    <div className="tls-tactical-board-menu">
      {roleOptions.length > 0 ? (
        <section aria-label={text("career.tacticalBoard.changeRole")}>
          {roleOptions.map((option) => (
            <button
              className="tls-tactical-board-menu-item"
              data-current={option.isCurrent}
              key={option.role}
              onClick={() => onRoleChange?.(option.role)}
              type="button"
            >
              <span>{option.role}</span>
              <span>{text(suitabilityLabelKey(option.suitability) as MessageKey)}</span>
            </button>
          ))}
          <button className="tls-tactical-board-menu-item" data-danger="true" onClick={onRemove} type="button">
            {text("career.tacticalBoard.removeFromLineup")}
          </button>
        </section>
      ) : null}

      {candidates.length > 0 ? (
        <section aria-label={text("career.tacticalBoard.assignPlayer")}>
          {candidates.map((candidate) => (
            <button
              className="tls-tactical-board-menu-item"
              key={candidate.player.playerId}
              onClick={() => onAssign?.(candidate.player.playerId)}
              type="button"
            >
              <PlayerCandidateRow
                fitnessText={formatFitnessPercent(candidate.fitness, text)}
                number={candidate.player.number}
                roleLabel={text(candidate.player.roleKey === undefined ? "common.unknown" : roleLabelKey(candidate.player.roleKey))}
                surname={candidate.player.surname}
                suitabilityLabel={text(suitabilityLabelKey(candidate.suitability) as MessageKey)}
                suitabilityTone={candidate.suitability}
                {...(candidate.player.foot === undefined ? {} : { footLabel: formatFoot(candidate.player.foot, text) })}
              />
            </button>
          ))}
        </section>
      ) : null}
    </div>
  );
}
