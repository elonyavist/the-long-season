import {
  CAREER_MATCH_PREPARATION_FORMATIONS,
  type CareerMatchPreparationFormationId,
  type CareerMatchPreparationFormationInput,
  type CareerMatchPreparationFormationSlotInput,
} from "@game/ui";

import { canonicalRoleForBoardRole, tacticalBoardDepartment } from "./tactical-board-roles";
import type { TacticalBoardFormationPreset, TacticalBoardRoleCode, TacticalBoardSlot } from "./tactical-board-types";

/** Default base formation used by the shared tactical board. */
export const DEFAULT_TACTICAL_BOARD_FORMATION_ID: CareerMatchPreparationFormationId = "4-4-2";

type BoardCoordinate = Readonly<{ nx: number; ny: number }>;

const DEFAULT_COORDINATE: BoardCoordinate = { nx: 0.5, ny: 0.52 };
const CENTRAL_TRIPLE_X_COORDINATES = [0.34, 0.5, 0.66] as const;

const SLOT_COORDINATES: Readonly<Record<string, BoardCoordinate>> = {
  gk: { nx: 0.5, ny: 0.93 },
  rb: { nx: 0.86, ny: 0.76 },
  "cb-right": { nx: 0.62, ny: 0.78 },
  "cb-center": { nx: 0.5, ny: 0.8 },
  "cb-left": { nx: 0.38, ny: 0.78 },
  lb: { nx: 0.14, ny: 0.76 },
  rm: { nx: 0.88, ny: 0.52 },
  lm: { nx: 0.12, ny: 0.52 },
  dm: { nx: 0.5, ny: 0.6 },
  "dm-right": { nx: 0.58, ny: 0.6 },
  "dm-center": { nx: 0.5, ny: 0.6 },
  "dm-left": { nx: 0.42, ny: 0.6 },
  "cm-right": { nx: 0.6, ny: 0.48 },
  "cm-center": { nx: 0.5, ny: 0.48 },
  "cm-left": { nx: 0.4, ny: 0.48 },
  am: { nx: 0.5, ny: 0.34 },
  "am-right": { nx: 0.58, ny: 0.34 },
  "am-left": { nx: 0.42, ny: 0.34 },
  rw: { nx: 0.86, ny: 0.22 },
  lw: { nx: 0.14, ny: 0.22 },
  st: { nx: 0.5, ny: 0.16 },
  "st-right": { nx: 0.58, ny: 0.18 },
  "st-left": { nx: 0.42, ny: 0.18 },
};

const BOARD_ROLE_BY_POSITION_KEY: Readonly<Record<string, TacticalBoardRoleCode>> = {
  gk: "POR",
  rb: "TD",
  cb: "DC",
  lb: "TS",
  dm: "MED",
  cm: "CC",
  rm: "ED",
  lm: "ES",
  am: "TRQ",
  rw: "AD",
  lw: "AS",
  st: "ATT",
};

/** Returns board presets adapted from the framework-free UI formation catalog. */
export function tacticalBoardFormationPresets(): readonly TacticalBoardFormationPreset[] {
  return CAREER_MATCH_PREPARATION_FORMATIONS.map((formation) => tacticalBoardFormationPresetFromInput(formation));
}

/** Returns one adapted board formation preset by ID. */
export function tacticalBoardFormationPreset(formationId: CareerMatchPreparationFormationId): TacticalBoardFormationPreset {
  const formation =
    CAREER_MATCH_PREPARATION_FORMATIONS.find((option) => option.formationId === formationId) ??
    CAREER_MATCH_PREPARATION_FORMATIONS[0];

  if (formation === undefined) {
    throw new Error("No tactical board formations are available.");
  }

  return tacticalBoardFormationPresetFromInput(formation);
}

/** Creates tactical-board slots from one base formation and optional player assignments. */
export function tacticalBoardSlotsFromFormation(
  formationId: CareerMatchPreparationFormationId,
  selectedPlayerIdsBySlot: Readonly<Record<string, string | undefined>> = {},
): readonly TacticalBoardSlot[] {
  return tacticalBoardFormationPreset(formationId).slots.map((slot) => ({
    ...slot,
    playerId: selectedPlayerIdsBySlot[slot.slotId] ?? null,
  }));
}

/** Derives the current football shape from actual board slot roles. */
export function selectCurrentTacticalBoardShape(slots: readonly TacticalBoardSlot[]): string {
  let defense = 0;
  let midfield = 0;
  let attack = 0;

  for (const slot of slots) {
    const department = tacticalBoardDepartment(slot.role);
    if (department === "defense") {
      defense += 1;
    } else if (department === "midfield") {
      midfield += 1;
    } else if (department === "attack") {
      attack += 1;
    }
  }

  return `${defense}-${midfield}-${attack}`;
}

function tacticalBoardFormationPresetFromInput(
  formation: CareerMatchPreparationFormationInput,
): TacticalBoardFormationPreset {
  const slots = formation.slots.map((slot) => tacticalBoardSlotFromInput(slot));

  return {
    formationId: formation.formationId,
    labelKey: formation.labelKey,
    slots: spreadCentralTripleSlots(slots),
  };
}

function tacticalBoardSlotFromInput(slot: CareerMatchPreparationFormationSlotInput): TacticalBoardSlot {
  const role = boardRoleFromFormationSlot(slot);
  const coordinate = SLOT_COORDINATES[slot.pitchSlotKey] ?? SLOT_COORDINATES[slot.slotKey] ?? DEFAULT_COORDINATE;

  return {
    slotId: slot.slotKey,
    nx: coordinate.nx,
    ny: coordinate.ny,
    role,
    canonicalRole: canonicalRoleForBoardRole(role),
    playerId: null,
    locked: role === "POR",
  };
}

function boardRoleFromFormationSlot(slot: CareerMatchPreparationFormationSlotInput): TacticalBoardRoleCode {
  const byPosition = BOARD_ROLE_BY_POSITION_KEY[slot.positionKey];

  if (byPosition !== undefined) {
    return byPosition;
  }

  throw new Error(`Unsupported tactical board position key: ${slot.positionKey}`);
}

function spreadCentralTripleSlots(slots: readonly TacticalBoardSlot[]): readonly TacticalBoardSlot[] {
  return ["DC", "CC"].reduce(
    (currentSlots, role) => spreadCentralTripleRole(currentSlots, role as TacticalBoardRoleCode),
    slots,
  );
}

function spreadCentralTripleRole(
  slots: readonly TacticalBoardSlot[],
  role: TacticalBoardRoleCode,
): readonly TacticalBoardSlot[] {
  const centralIndexes = slots
    .map((slot, index) => ({ slot, index }))
    .filter(({ slot }) => slot.role === role)
    .sort((left, right) => left.slot.nx - right.slot.nx);

  if (centralIndexes.length !== CENTRAL_TRIPLE_X_COORDINATES.length) {
    return slots;
  }

  return slots.map((slot, index) => {
    const centralIndex = centralIndexes.findIndex((candidate) => candidate.index === index);

    if (centralIndex === -1) {
      return slot;
    }

    return { ...slot, nx: CENTRAL_TRIPLE_X_COORDINATES[centralIndex] ?? slot.nx };
  });
}
