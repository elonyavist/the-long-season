import type React from "react";

/** CSS custom properties used to position one tactical slot on the pitch grid. */
export type TacticalPitchSlotStyle = React.CSSProperties &
  Readonly<{
    "--tls-slot-column": string;
    "--tls-slot-row": string;
  }>;

const DEFAULT_SLOT_COORDINATE: TacticalPitchSlotStyle = {
  "--tls-slot-column": "4",
  "--tls-slot-row": "3",
};

const SLOT_COORDINATES: Readonly<Record<string, TacticalPitchSlotStyle>> = {
  gk: { "--tls-slot-column": "4", "--tls-slot-row": "6" },
  rb: { "--tls-slot-column": "7", "--tls-slot-row": "5" },
  rwb: { "--tls-slot-column": "7", "--tls-slot-row": "4" },
  "cb-right": { "--tls-slot-column": "5", "--tls-slot-row": "5" },
  "cb-center": { "--tls-slot-column": "4", "--tls-slot-row": "5" },
  "cb-left": { "--tls-slot-column": "3", "--tls-slot-row": "5" },
  lb: { "--tls-slot-column": "1", "--tls-slot-row": "5" },
  lwb: { "--tls-slot-column": "1", "--tls-slot-row": "4" },
  rm: { "--tls-slot-column": "7", "--tls-slot-row": "3" },
  lm: { "--tls-slot-column": "1", "--tls-slot-row": "3" },
  dm: { "--tls-slot-column": "4", "--tls-slot-row": "4" },
  "dm-right": { "--tls-slot-column": "5", "--tls-slot-row": "4" },
  "dm-center": { "--tls-slot-column": "4", "--tls-slot-row": "4" },
  "dm-left": { "--tls-slot-column": "3", "--tls-slot-row": "4" },
  "cm-right": { "--tls-slot-column": "5", "--tls-slot-row": "3" },
  "cm-center": { "--tls-slot-column": "4", "--tls-slot-row": "3" },
  "cm-left": { "--tls-slot-column": "3", "--tls-slot-row": "3" },
  "am-right": { "--tls-slot-column": "5", "--tls-slot-row": "2" },
  am: { "--tls-slot-column": "4", "--tls-slot-row": "2" },
  "am-left": { "--tls-slot-column": "3", "--tls-slot-row": "2" },
  rw: { "--tls-slot-column": "7", "--tls-slot-row": "2" },
  lw: { "--tls-slot-column": "1", "--tls-slot-row": "2" },
  st: { "--tls-slot-column": "4", "--tls-slot-row": "1" },
  "st-right": { "--tls-slot-column": "5", "--tls-slot-row": "1" },
  "st-left": { "--tls-slot-column": "3", "--tls-slot-row": "1" },
};

/** Returns deterministic pitch-grid coordinates for one tactical slot key. */
export function tacticalPitchSlotStyle(slotKey: string): TacticalPitchSlotStyle {
  return SLOT_COORDINATES[slotKey] ?? DEFAULT_SLOT_COORDINATE;
}
