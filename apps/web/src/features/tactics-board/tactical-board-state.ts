import type { CareerMatchPreparationFormationId } from "@game/ui";

import { clampToZone } from "./tactical-board-geometry";
import {
  canonicalRoleForBoardRole,
  TACTICAL_BOARD_ROLES,
} from "./tactical-board-roles";
import {
  DEFAULT_TACTICAL_BOARD_FORMATION_ID,
  tacticalBoardSlotsFromFormation,
} from "./tactical-board-formations";
import type { TacticalBoardRoleCode, TacticalBoardSlot } from "./tactical-board-types";

/** Persistence-ready draft for the shared tactical board. */
export interface TacticalBoardDraft {
  readonly baseFormationId: CareerMatchPreparationFormationId;
  readonly slots: readonly TacticalBoardSlot[];
}

/** Creates a fresh board draft for one base formation. */
export function createTacticalBoardDraft(
  baseFormationId: CareerMatchPreparationFormationId = DEFAULT_TACTICAL_BOARD_FORMATION_ID,
  selectedPlayerIdsBySlot: Readonly<Record<string, string | undefined>> = {},
): TacticalBoardDraft {
  return {
    baseFormationId,
    slots: tacticalBoardSlotsFromFormation(baseFormationId, selectedPlayerIdsBySlot),
  };
}

/** Loads a new base formation and preserves only directly compatible slot choices. */
export function loadTacticalBoardBaseFormation(
  draft: TacticalBoardDraft,
  baseFormationId: CareerMatchPreparationFormationId,
): TacticalBoardDraft {
  if (draft.baseFormationId === baseFormationId) {
    return draft;
  }

  const currentSlotsById = new Map(draft.slots.map((slot) => [slot.slotId, slot]));
  const nextSlots = tacticalBoardSlotsFromFormation(baseFormationId).map((nextSlot) => {
    const currentSlot = currentSlotsById.get(nextSlot.slotId);

    if (currentSlot === undefined || currentSlot.canonicalRole !== nextSlot.canonicalRole) {
      return nextSlot;
    }

    return {
      ...nextSlot,
      playerId: currentSlot.playerId,
    };
  });

  return {
    baseFormationId,
    slots: nextSlots,
  };
}

/** Moves one non-locked slot, clamped inside its current role zone. */
export function moveTacticalBoardSlot(
  draft: TacticalBoardDraft,
  slotId: string,
  nx: number,
  ny: number,
): TacticalBoardDraft {
  return {
    ...draft,
    slots: draft.slots.map((slot) => {
      if (slot.slotId !== slotId || slot.locked) {
        return slot;
      }

      const clamped = clampToZone(nx, ny, TACTICAL_BOARD_ROLES[slot.role].zone);

      return {
        ...slot,
        nx: clamped.nx,
        ny: clamped.ny,
      };
    }),
  };
}

/** Changes one non-locked slot role and clamps its existing position to the new role zone. */
export function changeTacticalBoardSlotRole(
  draft: TacticalBoardDraft,
  slotId: string,
  role: TacticalBoardRoleCode,
): TacticalBoardDraft {
  return {
    ...draft,
    slots: draft.slots.map((slot) => {
      if (slot.slotId !== slotId || slot.locked) {
        return slot;
      }

      const clamped = clampToZone(slot.nx, slot.ny, TACTICAL_BOARD_ROLES[role].zone);

      return {
        ...slot,
        role,
        canonicalRole: canonicalRoleForBoardRole(role),
        nx: clamped.nx,
        ny: clamped.ny,
      };
    }),
  };
}

/** Applies one confirmed role adaptation and destination in a single immutable update. */
export function adaptTacticalBoardSlot(
  draft: TacticalBoardDraft,
  slotId: string,
  role: TacticalBoardRoleCode,
  nx: number,
  ny: number,
): TacticalBoardDraft {
  return {
    ...draft,
    slots: draft.slots.map((slot) => {
      if (slot.slotId !== slotId || slot.locked) return slot;
      const clamped = clampToZone(nx, ny, TACTICAL_BOARD_ROLES[role].zone);

      return {
        ...slot,
        role,
        canonicalRole: canonicalRoleForBoardRole(role),
        nx: clamped.nx,
        ny: clamped.ny,
      };
    }),
  };
}

/** Exchanges only player assignments between two XI slots; geometry and roles stay put. */
export function exchangeTacticalBoardSlotPlayers(
  draft: TacticalBoardDraft,
  firstSlotId: string,
  secondSlotId: string,
): TacticalBoardDraft {
  if (firstSlotId === secondSlotId) return draft;
  const firstSlot = draft.slots.find((slot) => slot.slotId === firstSlotId);
  const secondSlot = draft.slots.find((slot) => slot.slotId === secondSlotId);
  if (firstSlot === undefined || secondSlot === undefined) return draft;

  return {
    ...draft,
    slots: draft.slots.map((slot) => {
      if (slot.slotId === firstSlotId) return { ...slot, playerId: secondSlot.playerId };
      if (slot.slotId === secondSlotId) return { ...slot, playerId: firstSlot.playerId };
      return slot;
    }),
  };
}

/** Clears the player assignment while preserving slot role and position. */
export function clearTacticalBoardSlot(draft: TacticalBoardDraft, slotId: string): TacticalBoardDraft {
  return {
    ...draft,
    slots: draft.slots.map((slot) => (slot.slotId === slotId ? { ...slot, playerId: null } : slot)),
  };
}

/** Assigns a player to one slot and removes that player from any other XI slot. */
export function assignTacticalBoardPlayer(
  draft: TacticalBoardDraft,
  slotId: string,
  playerId: string | undefined,
): TacticalBoardDraft {
  return {
    ...draft,
    slots: draft.slots.map((slot) => {
      if (slot.slotId === slotId) {
        return { ...slot, playerId: playerId ?? null };
      }

      if (playerId !== undefined && slot.playerId === playerId) {
        return { ...slot, playerId: null };
      }

      return slot;
    }),
  };
}

/** Removes one player from the XI without changing tactical slots or roles. */
export function removeTacticalBoardPlayer(
  draft: TacticalBoardDraft,
  playerId: string,
): TacticalBoardDraft {
  return {
    ...draft,
    slots: draft.slots.map((slot) =>
      slot.playerId === playerId ? { ...slot, playerId: null } : slot,
    ),
  };
}

/** Returns selected player IDs keyed by slot ID for current read-model compatibility. */
export function tacticalBoardSelectedPlayerIdsBySlot(draft: TacticalBoardDraft): Readonly<Record<string, string>> {
  return Object.fromEntries(
    draft.slots.flatMap((slot) => (slot.playerId === null ? [] : [[slot.slotId, slot.playerId]])),
  );
}
