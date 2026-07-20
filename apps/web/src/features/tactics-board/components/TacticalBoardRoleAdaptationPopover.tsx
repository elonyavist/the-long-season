import { useEffect, useRef, useState } from "react";

import type { MessageKey, Translator } from "@game/i18n";

import {
  suitabilityForTacticalBoardAssignment,
  type TacticalBoardAssignmentCandidate,
} from "../tactical-board-suitability";
import type { TacticalBoardRoleCode } from "../tactical-board-types";
import { suitabilityLabelKey } from "./TacticalBoardPlayerToken";
import { sortTacticalBoardDestinationRoles } from "./TacticalBoardRoleDestinations";

/** Props for the compact confirmation shown after a cross-role drop. */
export interface TacticalBoardRoleAdaptationPopoverProps {
  readonly player: TacticalBoardAssignmentCandidate;
  readonly roles: readonly TacticalBoardRoleCode[];
  readonly slotId: string;
  readonly text: Translator;
  readonly onApply: (role: TacticalBoardRoleCode) => void;
  readonly onCancel: () => void;
}

/** Confirms the new role before the shared draft receives one atomic update. */
export function TacticalBoardRoleAdaptationPopover({
  player,
  roles,
  slotId,
  text,
  onApply,
  onCancel,
}: TacticalBoardRoleAdaptationPopoverProps): React.JSX.Element {
  const sortedRoles = sortTacticalBoardDestinationRoles(player, roles, slotId);
  const [selectedRole, setSelectedRole] = useState<TacticalBoardRoleCode>(sortedRoles[0] ?? "CC");
  const firstRoleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    firstRoleRef.current?.focus();
  }, []);

  return (
    <section className="tls-tactical-board-adaptation" aria-label={text("career.tacticalBoard.changeRole")}>
      <strong>{text("career.tacticalBoard.changeRole")}</strong>
      <div className="tls-tactical-board-adaptation-options" role="radiogroup">
        {sortedRoles.map((role, index) => {
          const suitability = suitabilityForTacticalBoardAssignment(player, role, slotId);
          return (
            <button
              aria-checked={selectedRole === role}
              className="tls-tactical-board-adaptation-role"
              data-suitability={suitability}
              key={role}
              onClick={() => setSelectedRole(role)}
              ref={index === 0 ? firstRoleRef : undefined}
              role="radio"
              type="button"
            >
              <span>{role}</span>
              <small>{text(suitabilityLabelKey(suitability) as MessageKey)}</small>
            </button>
          );
        })}
      </div>
      <div className="tls-tactical-board-adaptation-actions">
        <button className="tls-button tls-button-primary" onClick={() => onApply(selectedRole)} type="button">
          {text("career.matchday.action.apply_half_time_substitutions")}
        </button>
        <button className="tls-button tls-button-secondary" onClick={onCancel} type="button">
          {text("career.exit.cancel")}
        </button>
      </div>
    </section>
  );
}
