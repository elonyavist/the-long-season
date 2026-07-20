import type {
  TacticalBoardCanonicalRole,
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

/** One non-overlapping destination area shown only while adapting a role. */
export interface TacticalBoardRoleDestination {
  readonly role: TacticalBoardRoleCode;
  readonly zone: TacticalBoardZone;
}

/**
 * Stable, non-overlapping role targets used by the shared drag surface.
 * Splitting central attack and midfield vertically makes the manager's intent
 * explicit even where canonical movement zones such as CC and TRQ overlap.
 */
export const TACTICAL_BOARD_ROLE_DESTINATIONS: readonly TacticalBoardRoleDestination[] = [
  { role: "AS", zone: zone(0, 0.34, 0, 0.43) },
  { role: "ATT", zone: zone(0.34, 0.66, 0, 0.24) },
  { role: "TRQ", zone: zone(0.34, 0.66, 0.24, 0.43) },
  { role: "AD", zone: zone(0.66, 1, 0, 0.43) },
  { role: "ES", zone: zone(0, 0.34, 0.43, 0.66) },
  { role: "CC", zone: zone(0.34, 0.66, 0.43, 0.56) },
  { role: "MED", zone: zone(0.34, 0.66, 0.56, 0.66) },
  { role: "ED", zone: zone(0.66, 1, 0.43, 0.66) },
  { role: "TS", zone: zone(0, 0.34, 0.66, 1) },
  { role: "DC", zone: zone(0.34, 0.66, 0.66, 1) },
  { role: "TD", zone: zone(0.66, 1, 0.66, 1) },
] as const;

/** Returns the one explicit role target under a normalized drag position. */
export function tacticalBoardRoleDestinationAt(
  nx: number,
  ny: number,
): TacticalBoardRoleCode | undefined {
  return TACTICAL_BOARD_ROLE_DESTINATIONS.find((destination) => (
    containsDestinationCoordinate(nx, destination.zone.nxMin, destination.zone.nxMax)
    && containsDestinationCoordinate(ny, destination.zone.nyMin, destination.zone.nyMax)
  ))?.role;
}

function containsDestinationCoordinate(value: number, min: number, max: number): boolean {
  return value >= min && (value < max || (max === 1 && value <= max));
}

/** Returns sensible role-change options for a board position. */
export function tacticalBoardRoleOptionsForPosition(
  nx: number,
  ny: number,
  currentRole: TacticalBoardRoleCode,
): readonly TacticalBoardRoleCode[] {
  const destinationRole = tacticalBoardRoleDestinationAt(nx, ny);

  return destinationRole === undefined || destinationRole === currentRole
    ? [currentRole]
    : [currentRole, destinationRole];
}

/** Converts a canonical role into the board display role used by slots. */
export function boardRoleFromCanonicalRole(role: TacticalBoardCanonicalRole): TacticalBoardRoleCode {
  const found = TACTICAL_BOARD_ROLE_CODES.find((code) => TACTICAL_BOARD_ROLES[code].canonicalRole === role);

  if (found === undefined) {
    throw new Error(`Unsupported tactical board canonical role: ${role}`);
  }

  return found;
}
