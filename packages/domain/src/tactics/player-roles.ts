/**
 * Canonical player roles used by formations and tactical selection.
 *
 * These values describe what kind of role a player can cover. Horizontal
 * details such as left/right/center channel belong to a formation slot, never
 * to the player role itself.
 */
export const CANONICAL_PLAYER_ROLES = [
  "goalkeeper",
  "right_full_back",
  "center_back",
  "left_full_back",
  "defensive_midfielder",
  "central_midfielder",
  "right_midfielder",
  "left_midfielder",
  "attacking_midfielder",
  "right_winger",
  "left_winger",
  "striker",
] as const;

/** Canonical player role identifier. */
export type CanonicalPlayerRole = (typeof CANONICAL_PLAYER_ROLES)[number];

/** Broad football department for one canonical player role. */
export type CanonicalPlayerRoleDepartment = "goalkeeping" | "defense" | "midfield" | "attack";

/** Role order used by selectors, reports, and deterministic tie-breakers. */
export const CANONICAL_PLAYER_ROLE_ORDER: Readonly<Record<CanonicalPlayerRole, number>> =
  Object.fromEntries(CANONICAL_PLAYER_ROLES.map((role, index) => [role, index])) as Readonly<
    Record<CanonicalPlayerRole, number>
  >;

/** Department for each canonical role. */
export const CANONICAL_PLAYER_ROLE_DEPARTMENT: Readonly<Record<CanonicalPlayerRole, CanonicalPlayerRoleDepartment>> = {
  goalkeeper: "goalkeeping",
  right_full_back: "defense",
  center_back: "defense",
  left_full_back: "defense",
  defensive_midfielder: "midfield",
  central_midfielder: "midfield",
  right_midfielder: "midfield",
  left_midfielder: "midfield",
  attacking_midfielder: "midfield",
  right_winger: "attack",
  left_winger: "attack",
  striker: "attack",
};

const CANONICAL_PLAYER_ROLE_SET: ReadonlySet<string> = new Set(CANONICAL_PLAYER_ROLES);

/** Checks whether an unknown value is one of the canonical player roles. */
export function isCanonicalPlayerRole(value: unknown): value is CanonicalPlayerRole {
  return typeof value === "string" && CANONICAL_PLAYER_ROLE_SET.has(value);
}

/** Returns the broad department for a canonical player role. */
export function canonicalPlayerRoleDepartment(role: CanonicalPlayerRole): CanonicalPlayerRoleDepartment {
  return CANONICAL_PLAYER_ROLE_DEPARTMENT[role];
}

/** Returns the deterministic sort order for a canonical player role. */
export function canonicalPlayerRoleOrder(role: CanonicalPlayerRole): number {
  return CANONICAL_PLAYER_ROLE_ORDER[role];
}
