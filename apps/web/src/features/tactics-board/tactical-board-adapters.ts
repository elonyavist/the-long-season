import type { CareerMatchPreparationFormationId } from "@game/ui";

import {
  createTacticalBoardDraft,
  tacticalBoardSelectedPlayerIdsBySlot,
  type TacticalBoardDraft,
} from "./tactical-board-state";

/** Builds a board draft from the current match-preparation slot selection map. */
export function tacticalBoardDraftFromLineupSelection(
  baseFormationId: CareerMatchPreparationFormationId,
  selectedPlayerIdsBySlot: Readonly<Record<string, string | undefined>>,
): TacticalBoardDraft {
  return createTacticalBoardDraft(baseFormationId, selectedPlayerIdsBySlot);
}

/** Converts a board draft back into the current match-preparation selection map. */
export function lineupSelectionFromTacticalBoardDraft(draft: TacticalBoardDraft): Readonly<Record<string, string>> {
  return tacticalBoardSelectedPlayerIdsBySlot(draft);
}
