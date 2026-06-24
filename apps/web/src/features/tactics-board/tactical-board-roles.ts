import type {
  TacticalBoardCanonicalRole,
  TacticalBoardCell,
  TacticalBoardDepartment,
  TacticalBoardRole,
  TacticalBoardRoleCode,
  TacticalBoardZone,
} from "./tactical-board-types";

/** Ordered role codes supported by the shared tactical board. */
export const TACTICAL_BOARD_ROLE_CODES = [
  "POR",
  "TD",
  "DC",
  "TS",
  "MED",
  "CC",
  "ED",
  "ES",
  "TRQ",
  "AD",
  "AS",
  "ATT",
] as const satisfies readonly TacticalBoardRoleCode[];

const zone = (nxMin: number, nxMax: number, nyMin: number, nyMax: number): TacticalBoardZone => ({
  nxMin,
  nxMax,
  nyMin,
  nyMax,
});

/** Canonical tactical-board role catalog. */
export const TACTICAL_BOARD_ROLES: Readonly<Record<TacticalBoardRoleCode, TacticalBoardRole>> = {
  POR: {
    code: "POR",
    canonicalRole: "goalkeeper",
    department: "goalkeeping",
    channel: "center",
    zone: zone(0.36, 0.64, 0.86, 0.98),
  },
  TD: {
    code: "TD",
    canonicalRole: "right_full_back",
    department: "defense",
    channel: "right",
    zone: zone(0.68, 0.98, 0.58, 0.88),
  },
  DC: {
    code: "DC",
    canonicalRole: "center_back",
    department: "defense",
    channel: "center",
    zone: zone(0.22, 0.78, 0.66, 0.92),
  },
  TS: {
    code: "TS",
    canonicalRole: "left_full_back",
    department: "defense",
    channel: "left",
    zone: zone(0.02, 0.32, 0.58, 0.88),
  },
  MED: {
    code: "MED",
    canonicalRole: "defensive_midfielder",
    department: "midfield",
    channel: "center",
    zone: zone(0.24, 0.76, 0.48, 0.74),
  },
  CC: {
    code: "CC",
    canonicalRole: "central_midfielder",
    department: "midfield",
    channel: "center",
    zone: zone(0.22, 0.78, 0.4, 0.66),
  },
  ED: {
    code: "ED",
    canonicalRole: "right_midfielder",
    department: "midfield",
    channel: "right",
    zone: zone(0.66, 0.98, 0.3, 0.66),
  },
  ES: {
    code: "ES",
    canonicalRole: "left_midfielder",
    department: "midfield",
    channel: "left",
    zone: zone(0.02, 0.34, 0.3, 0.66),
  },
  TRQ: {
    code: "TRQ",
    canonicalRole: "attacking_midfielder",
    department: "midfield",
    channel: "center",
    zone: zone(0.26, 0.74, 0.24, 0.52),
  },
  AD: {
    code: "AD",
    canonicalRole: "right_winger",
    department: "attack",
    channel: "right",
    zone: zone(0.66, 0.98, 0.08, 0.42),
  },
  AS: {
    code: "AS",
    canonicalRole: "left_winger",
    department: "attack",
    channel: "left",
    zone: zone(0.02, 0.34, 0.08, 0.42),
  },
  ATT: {
    code: "ATT",
    canonicalRole: "striker",
    department: "attack",
    channel: "center",
    zone: zone(0.3, 0.7, 0.06, 0.38),
  },
};

/** Maps compact board role codes to canonical player roles. */
export function canonicalRoleForBoardRole(role: TacticalBoardRoleCode): TacticalBoardCanonicalRole {
  return TACTICAL_BOARD_ROLES[role].canonicalRole;
}

/** Returns the tactical department for a board role. */
export function tacticalBoardDepartment(role: TacticalBoardRoleCode): TacticalBoardDepartment {
  return TACTICAL_BOARD_ROLES[role].department;
}

/** Derives the board cell that contains one normalized position. */
export function tacticalBoardCellOf(nx: number, ny: number): TacticalBoardCell {
  const band = ny < 0.4 ? "att" : ny < 0.66 ? "mid" : "def";
  const channel = nx < 0.34 ? "L" : nx < 0.66 ? "C" : "R";

  return `${band}-${channel}` as TacticalBoardCell;
}

const ROLE_OPTIONS_BY_CELL: Readonly<Record<TacticalBoardCell, readonly TacticalBoardRoleCode[]>> = {
  "def-L": ["TS"],
  "def-C": ["DC"],
  "def-R": ["TD"],
  "mid-L": ["ES"],
  "mid-C": ["MED", "CC", "TRQ"],
  "mid-R": ["ED"],
  "att-L": ["AS"],
  "att-C": ["TRQ", "ATT"],
  "att-R": ["AD"],
};

/** Returns sensible role-change options for a board position. */
export function tacticalBoardRoleOptionsForPosition(
  nx: number,
  ny: number,
  currentRole: TacticalBoardRoleCode,
): readonly TacticalBoardRoleCode[] {
  const base = ROLE_OPTIONS_BY_CELL[tacticalBoardCellOf(nx, ny)] ?? [];

  return base.includes(currentRole) ? base : [currentRole, ...base];
}

/** Converts a canonical role into the board display role used by slots. */
export function boardRoleFromCanonicalRole(role: TacticalBoardCanonicalRole): TacticalBoardRoleCode {
  const found = TACTICAL_BOARD_ROLE_CODES.find((code) => TACTICAL_BOARD_ROLES[code].canonicalRole === role);

  if (found === undefined) {
    throw new Error(`Unsupported tactical board canonical role: ${role}`);
  }

  return found;
}
