import type { MessageKey } from "@game/i18n";

import type { TacticalBoardRoleCode } from "./tactical-board-types";

/** Fixed substitute slot identifiers used by the shared tactical bench board. */
export const TACTICAL_BENCH_SLOT_IDS = [
  "bench:01",
  "bench:02",
  "bench:03",
  "bench:04",
  "bench:05",
  "bench:06",
  "bench:07",
  "bench:08",
] as const;

/** Stable identifier for one of the eight substitute bench slots. */
export type TacticalBenchSlotId = (typeof TACTICAL_BENCH_SLOT_IDS)[number];

/** Minimal player facts rendered in one substitute token. */
export interface TacticalBenchPlayer {
  /** Stable player id used by callers when opening or clearing the slot. */
  readonly playerId: string;
  /** Shirt number shown inside the compact token. */
  readonly number: number;
  /** Player surname shown under the shirt number. */
  readonly surname: string;
  /** Current or natural role abbreviation shown below the surname. */
  readonly roleCode: TacticalBoardRoleCode;
}

/** State-free view data for one fixed substitute bench slot. */
export interface TacticalBenchSlotView {
  /** Stable fixed slot id, normally `bench:01` through `bench:08`. */
  readonly slotId: TacticalBenchSlotId;
  /** Localized label key for the slot code shown to the manager. */
  readonly labelKey: MessageKey;
  /** Player assigned to the slot; absent means the slot is empty. */
  readonly player?: TacticalBenchPlayer;
  /** Optional invalid state from the caller's read model. */
  readonly status?: "valid" | "missing_player" | "duplicate_player" | "lineup_player";
}

/** Returns the localized slot label key for one fixed bench slot id. */
export function tacticalBenchSlotLabelKey(slotId: TacticalBenchSlotId): MessageKey {
  const slotNumber = slotId.slice("bench:".length);

  return `career.matchPreparation.benchSlot.${slotNumber}` as MessageKey;
}

/** Builds the eight empty fixed bench slots in deterministic display order. */
export function createEmptyTacticalBenchSlots(): readonly TacticalBenchSlotView[] {
  return TACTICAL_BENCH_SLOT_IDS.map((slotId) => ({
    slotId,
    labelKey: tacticalBenchSlotLabelKey(slotId),
    status: "missing_player",
  }));
}
