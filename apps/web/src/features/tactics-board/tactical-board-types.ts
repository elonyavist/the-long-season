/** Canonical player roles understood by the browser tactical board. */
export type TacticalBoardCanonicalRole =
  | "goalkeeper"
  | "right_full_back"
  | "center_back"
  | "left_full_back"
  | "defensive_midfielder"
  | "central_midfielder"
  | "right_midfielder"
  | "left_midfielder"
  | "attacking_midfielder"
  | "right_winger"
  | "left_winger"
  | "striker";

/** Short football codes shown on the tactical board. */
export type TacticalBoardRoleCode =
  | "POR"
  | "TD"
  | "DC"
  | "TS"
  | "MED"
  | "CC"
  | "ED"
  | "ES"
  | "TRQ"
  | "AD"
  | "AS"
  | "ATT";

/** Broad tactical department used to derive the current shape. */
export type TacticalBoardDepartment = "goalkeeping" | "defense" | "midfield" | "attack";

/** Horizontal channel used by role zones and context role options. */
export type TacticalBoardChannel = "left" | "center" | "right";

/** Normalized movement zone for one role. */
export interface TacticalBoardZone {
  readonly nxMin: number;
  readonly nxMax: number;
  readonly nyMin: number;
  readonly nyMax: number;
}

/** One reusable tactical-board role definition. */
export interface TacticalBoardRole {
  readonly code: TacticalBoardRoleCode;
  readonly canonicalRole: TacticalBoardCanonicalRole;
  readonly department: TacticalBoardDepartment;
  readonly channel: TacticalBoardChannel;
  readonly zone: TacticalBoardZone;
}

/** One slot on the tactical board. Coordinates always stay normalized. */
export interface TacticalBoardSlot {
  readonly slotId: string;
  readonly nx: number;
  readonly ny: number;
  readonly role: TacticalBoardRoleCode;
  readonly canonicalRole: TacticalBoardCanonicalRole;
  readonly playerId: string | null;
  readonly locked: boolean;
}

/** One field cell used to decide sensible role-change options. */
export type TacticalBoardCell = `${"def" | "mid" | "att"}-${"L" | "C" | "R"}`;

/** Formation preset adapted for the tactical board from UI read-model data. */
export interface TacticalBoardFormationPreset {
  readonly formationId: string;
  readonly labelKey: string;
  readonly slots: readonly TacticalBoardSlot[];
}
