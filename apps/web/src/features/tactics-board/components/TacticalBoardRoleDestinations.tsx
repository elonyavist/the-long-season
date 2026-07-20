import type React from "react";

import type { MessageKey, Translator } from "@game/i18n";

import { tacticalBoardZoneRect } from "../tactical-board-interactions";
import {
  TACTICAL_BOARD_ROLE_DESTINATIONS,
  tacticalBoardRoleDestinationAt,
} from "../tactical-board-roles";
import {
  suitabilityForTacticalBoardAssignment,
  type TacticalBoardAssignmentCandidate,
  type TacticalBoardRoleSuitability,
} from "../tactical-board-suitability";
import type { TacticalBoardRoleCode } from "../tactical-board-types";
import { suitabilityLabelKey } from "./TacticalBoardPlayerToken";

const SUITABILITY_RANK: Readonly<Record<TacticalBoardRoleSuitability, number>> = {
  natural: 0,
  accomplished: 1,
  competent: 2,
  unconvincing: 3,
  makeshift: 4,
};

/** Props for the temporary role destinations shown during an XI drag. */
export interface TacticalBoardRoleDestinationsProps {
  readonly player: TacticalBoardAssignmentCandidate;
  readonly slotId: string;
  readonly text: Translator;
  readonly activeNx: number;
  readonly activeNy: number;
}

/**
 * Renders one non-overlapping tactical map while dragging. Color reinforces
 * the explicit role and suitability labels but never communicates alone.
 */
export function TacticalBoardRoleDestinations({
  player,
  slotId,
  text,
  activeNx,
  activeNy,
}: TacticalBoardRoleDestinationsProps): React.JSX.Element {
  const activeRole = tacticalBoardRoleDestinationAt(activeNx, activeNy);

  return (
    <g className="tls-tactical-board-role-destinations" aria-hidden="true">
      {TACTICAL_BOARD_ROLE_DESTINATIONS.map((destination) => {
        const rect = tacticalBoardZoneRect(destination.zone);
        const suitability = suitabilityForTacticalBoardAssignment(player, destination.role, slotId);

        return (
          <g
            data-active={activeRole === destination.role ? "true" : "false"}
            data-destination-role={destination.role}
            data-suitability-tone={suitabilityTone(suitability)}
            key={destination.role}
          >
            <rect
              className="tls-tactical-board-role-destination"
              height={rect.height}
              width={rect.width}
              x={rect.x}
              y={rect.y}
            />
            <text
              className="tls-tactical-board-role-destination-label"
              textAnchor="middle"
              x={rect.x + rect.width / 2}
              y={rect.y + rect.height / 2 - 7}
            >
              {destination.role}
            </text>
            <text
              className="tls-tactical-board-role-destination-fit"
              textAnchor="middle"
              x={rect.x + rect.width / 2}
              y={rect.y + rect.height / 2 + 17}
            >
              {text(suitabilityLabelKey(suitability) as MessageKey)}
            </text>
          </g>
        );
      })}
    </g>
  );
}

function suitabilityTone(suitability: TacticalBoardRoleSuitability): "natural" | "compatible" | "unsuitable" {
  if (suitability === "natural" || suitability === "accomplished") return "natural";
  if (suitability === "competent") return "compatible";
  return "unsuitable";
}

/** Sorts sensible destination roles by suitability without inventing a score. */
export function sortTacticalBoardDestinationRoles(
  player: TacticalBoardAssignmentCandidate,
  roles: readonly TacticalBoardRoleCode[],
  slotId: string,
): readonly TacticalBoardRoleCode[] {
  return [...roles].toSorted((first, second) => (
    SUITABILITY_RANK[suitabilityForTacticalBoardAssignment(player, first, slotId)]
    - SUITABILITY_RANK[suitabilityForTacticalBoardAssignment(player, second, slotId)]
  ));
}
