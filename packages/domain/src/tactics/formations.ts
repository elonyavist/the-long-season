/**
 * Supported user-facing formation keys.
 *
 * These are curated football shapes, not free-form board coordinates. Keeping
 * the list explicit makes future squad-fit, manager interpretation, and UI flows stable.
 */
export const FORMATION_KEYS = [
  "4-4-2",
  "4-4-1-1",
  "4-3-3",
  "4-2-3-1",
  "4-1-4-1",
  "4-1-2-1-2",
  "4-3-1-2",
  "4-3-2-1",
  "4-5-1",
  "4-2-2-2",
  "4-2-4",
  "3-5-2",
  "3-4-3",
  "3-4-1-2",
  "3-4-2-1",
  "3-1-4-2",
  "3-6-1",
  "3-3-3-1",
  "5-3-2",
  "5-4-1",
  "5-2-3",
  "5-2-1-2",
  "5-2-2-1",
] as const;

/** Stable key for one supported formation. */
export type FormationKey = (typeof FORMATION_KEYS)[number];

/**
 * Tactical depth band for a formation slot.
 *
 * This is intentionally coarse. It tells later reports whether a slot belongs
 * to the defensive line, midfield line, attacking midfield, or forward line
 * without introducing pixel coordinates or UI layout concerns.
 */
export type FormationLine =
  | "goalkeeper"
  | "defensive_line"
  | "defensive_midfield"
  | "midfield_line"
  | "attacking_midfield"
  | "forward_line";

/** Broad department used for high-level squad balance and surplus reporting. */
export type FormationDepartment = "goalkeeping" | "defense" | "midfield" | "attack";

/**
 * Position family required by a formation slot.
 *
 * Families are more specific than the early `PlayerPosition` keys where the
 * formation needs side/channel information, for example left vs right full
 * back. Later suitability code maps player natural positions into these
 * families.
 */
export type FormationPositionFamily =
  | "goalkeeper"
  | "right_full_back"
  | "left_full_back"
  | "center_back"
  | "right_wing_back"
  | "left_wing_back"
  | "defensive_midfielder"
  | "central_midfielder"
  | "attacking_midfielder"
  | "right_midfielder"
  | "left_midfielder"
  | "right_winger"
  | "left_winger"
  | "second_striker"
  | "striker";

/**
 * Horizontal channel for a formation slot.
 *
 * Center-left and center-right are useful for pairs of center backs, central
 * midfielders, or strikers while staying independent from visual coordinates.
 */
export type FormationSide = "left" | "left_center" | "center" | "right_center" | "right";

/**
 * One ordered slot in a curated formation.
 *
 * `slotKey` is stable inside its formation and should be used by future lineup
 * selections. The slot does not contain a player; it only says what kind of
 * player the user should select for that shape.
 */
export interface FormationSlot {
  /** Stable key inside the formation, for example `rb` or `st-left`. */
  readonly slotKey: string;
  /** Coarse tactical depth band. */
  readonly line: FormationLine;
  /** Broad football department. */
  readonly department: FormationDepartment;
  /** Canonical player role required by this slot. */
  readonly playerRole: CanonicalPlayerRole;
  /** Required position family for this slot. */
  readonly positionFamily: FormationPositionFamily;
  /** Optional horizontal side/channel. */
  readonly side?: FormationSide;
}

/** A deterministic, curated formation definition. */
export interface Formation {
  /** Stable user-facing formation key. */
  readonly key: FormationKey;
  /** Ordered slots from goalkeeper through forward line. */
  readonly slots: readonly FormationSlot[];
}

/** Recognized position families used by formation slots. */
export const FORMATION_POSITION_FAMILIES = [
  "goalkeeper",
  "right_full_back",
  "left_full_back",
  "center_back",
  "right_wing_back",
  "left_wing_back",
  "defensive_midfielder",
  "central_midfielder",
  "attacking_midfielder",
  "right_midfielder",
  "left_midfielder",
  "right_winger",
  "left_winger",
  "second_striker",
  "striker",
] as const satisfies readonly FormationPositionFamily[];

/** Curated formation catalog keyed by stable formation key. */
export const FORMATION_CATALOG: Readonly<Record<FormationKey, Formation>> = {
  "4-4-2": formation("4-4-2", [...gk(), ...backFour(), rm(), cm("cm-right", "right_center"), cm("cm-left", "left_center"), lm(), striker("st-right", "right_center"), striker("st-left", "left_center")]),
  "4-4-1-1": formation("4-4-1-1", [...gk(), ...backFour(), rm(), cm("cm-right", "right_center"), cm("cm-left", "left_center"), lm(), am(), striker()]),
  "4-3-3": formation("4-3-3", [...gk(), ...backFour(), cm("cm-right", "right_center"), cm("cm-center"), cm("cm-left", "left_center"), rw(), lw(), striker()]),
  "4-2-3-1": formation("4-2-3-1", [...gk(), ...backFour(), dm("dm-right", "right_center"), dm("dm-left", "left_center"), rw(), am(), lw(), striker()]),
  "4-1-4-1": formation("4-1-4-1", [...gk(), ...backFour(), dm(), rm(), cm("cm-right", "right_center"), cm("cm-left", "left_center"), lm(), striker()]),
  "4-1-2-1-2": formation("4-1-2-1-2", [...gk(), ...backFour(), dm(), cm("cm-right", "right_center"), cm("cm-left", "left_center"), am(), striker("st-right", "right_center"), striker("st-left", "left_center")]),
  "4-3-1-2": formation("4-3-1-2", [...gk(), ...backFour(), cm("cm-right", "right_center"), cm("cm-center"), cm("cm-left", "left_center"), am(), striker("st-right", "right_center"), striker("st-left", "left_center")]),
  "4-3-2-1": formation("4-3-2-1", [...gk(), ...backFour(), cm("cm-right", "right_center"), cm("cm-center"), cm("cm-left", "left_center"), am("am-right", "right_center"), am("am-left", "left_center"), striker()]),
  "4-5-1": formation("4-5-1", [...gk(), ...backFour(), rm(), cm("cm-right", "right_center"), cm("cm-center"), cm("cm-left", "left_center"), lm(), striker()]),
  "4-2-2-2": formation("4-2-2-2", [...gk(), ...backFour(), dm("dm-right", "right_center"), dm("dm-left", "left_center"), am("am-right", "right_center"), am("am-left", "left_center"), striker("st-right", "right_center"), striker("st-left", "left_center")]),
  "4-2-4": formation("4-2-4", [...gk(), ...backFour(), cm("cm-right", "right_center"), cm("cm-left", "left_center"), rw(), lw(), striker("st-right", "right_center"), striker("st-left", "left_center")]),
  "3-5-2": formation("3-5-2", [...gk(), ...backThree(), dm(), rm(), cm("cm-right", "right_center"), cm("cm-left", "left_center"), lm(), striker("st-right", "right_center"), striker("st-left", "left_center")]),
  "3-4-3": formation("3-4-3", [...gk(), ...backThree(), rm(), cm("cm-right", "right_center"), cm("cm-left", "left_center"), lm(), rw(), lw(), striker()]),
  "3-4-1-2": formation("3-4-1-2", [...gk(), ...backThree(), rm(), cm("cm-right", "right_center"), cm("cm-left", "left_center"), lm(), am(), striker("st-right", "right_center"), striker("st-left", "left_center")]),
  "3-4-2-1": formation("3-4-2-1", [...gk(), ...backThree(), rm(), cm("cm-right", "right_center"), cm("cm-left", "left_center"), lm(), am("am-right", "right_center"), am("am-left", "left_center"), striker()]),
  "3-1-4-2": formation("3-1-4-2", [...gk(), ...backThree(), dm(), rm(), cm("cm-right", "right_center"), cm("cm-left", "left_center"), lm(), striker("st-right", "right_center"), striker("st-left", "left_center")]),
  "3-6-1": formation("3-6-1", [...gk(), ...backThree(), dm(), rm(), cm("cm-right", "right_center"), cm("cm-left", "left_center"), lm(), am(), striker()]),
  "3-3-3-1": formation("3-3-3-1", [...gk(), ...backThree(), dm("dm-right", "right_center"), dm("dm-center"), dm("dm-left", "left_center"), rw(), am(), lw(), striker()]),
  "5-3-2": formation("5-3-2", [...gk(), ...backFive(), cm("cm-right", "right_center"), cm("cm-center"), cm("cm-left", "left_center"), striker("st-right", "right_center"), striker("st-left", "left_center")]),
  "5-4-1": formation("5-4-1", [...gk(), ...backFive(), rm(), cm("cm-right", "right_center"), cm("cm-left", "left_center"), lm(), striker()]),
  "5-2-3": formation("5-2-3", [...gk(), ...backFive(), cm("cm-right", "right_center"), cm("cm-left", "left_center"), rw(), lw(), striker()]),
  "5-2-1-2": formation("5-2-1-2", [...gk(), ...backFive(), cm("cm-right", "right_center"), cm("cm-left", "left_center"), am(), striker("st-right", "right_center"), striker("st-left", "left_center")]),
  "5-2-2-1": formation("5-2-2-1", [...gk(), ...backFive(), cm("cm-right", "right_center"), cm("cm-left", "left_center"), am("am-right", "right_center"), am("am-left", "left_center"), striker()]),
};

/** Ordered catalog view for deterministic iteration in UI, CLI, and tests. */
export const FORMATIONS: readonly Formation[] = FORMATION_KEYS.map((key) => FORMATION_CATALOG[key]);

/** Returns a formation by key. */
export function getFormation(key: FormationKey): Formation {
  return FORMATION_CATALOG[key];
}

/** Checks whether an unknown value is a supported formation key. */
export function isFormationKey(value: unknown): value is FormationKey {
  return FORMATION_KEYS.includes(value as FormationKey);
}

/**
 * Tactical facts every canonical role carries on its own.
 *
 * A formation slot may override the channel - two centre backs sit in
 * `left_center` and `right_center` while the role itself is simply central -
 * but line, department, and position family belong to the role and hold
 * wherever a manager drops it.
 */
export interface CanonicalRoleTacticalFacts {
  /** Coarse tactical depth band. */
  readonly line: FormationLine;
  /** Broad football department. */
  readonly department: FormationDepartment;
  /** Position family this role fills. */
  readonly positionFamily: FormationPositionFamily;
  /** Channel the role implies when a slot does not state one. */
  readonly channel: FormationSide;
}

/**
 * Where each canonical role sits on the pitch.
 *
 * This table declares only what cannot be derived from the role itself. The
 * department already lives in `CANONICAL_PLAYER_ROLE_DEPARTMENT` and the
 * position family *is* the role, so restating either here would create a second
 * source of truth that could drift from the first.
 *
 * Line is genuinely independent: the midfield department alone spans defensive
 * midfield, the midfield line, and attacking midfield. Channel is independent
 * too, since a role carries its own side.
 *
 * Declared with `satisfies` so adding a canonical role fails the build here
 * rather than silently taking a default somewhere downstream.
 */
const CANONICAL_ROLE_PLACEMENT = {
  goalkeeper: { line: "goalkeeper", channel: "center" },
  right_full_back: { line: "defensive_line", channel: "right" },
  center_back: { line: "defensive_line", channel: "center" },
  left_full_back: { line: "defensive_line", channel: "left" },
  defensive_midfielder: { line: "defensive_midfield", channel: "center" },
  central_midfielder: { line: "midfield_line", channel: "center" },
  right_midfielder: { line: "midfield_line", channel: "right" },
  left_midfielder: { line: "midfield_line", channel: "left" },
  attacking_midfielder: { line: "attacking_midfield", channel: "center" },
  right_winger: { line: "forward_line", channel: "right" },
  left_winger: { line: "forward_line", channel: "left" },
  striker: { line: "forward_line", channel: "center" },
} as const satisfies Readonly<
  Record<CanonicalPlayerRole, { readonly line: FormationLine; readonly channel: FormationSide }>
>;

/**
 * Returns the tactical facts for one canonical role.
 *
 * Department and position family are derived, not stored, so this function has
 * exactly one thing it can get wrong and the department map stays the only
 * place a department is written down.
 *
 * @example
 * const facts = canonicalRoleTacticalFacts("striker");
 * // { line: "forward_line", department: "attack", positionFamily: "striker", channel: "center" }
 */
export function canonicalRoleTacticalFacts(role: CanonicalPlayerRole): CanonicalRoleTacticalFacts {
  const placement = CANONICAL_ROLE_PLACEMENT[role];

  return {
    line: placement.line,
    department: canonicalPlayerRoleDepartment(role),
    positionFamily: role,
    channel: placement.channel,
  };
}

function formation(key: FormationKey, slots: readonly FormationSlot[]): Formation {
  return { key, slots };
}

function slot(
  slotKey: string,
  line: FormationLine,
  department: FormationDepartment,
  playerRole: CanonicalPlayerRole,
  side?: FormationSide,
): FormationSlot {
  const baseSlot = { slotKey, line, department, playerRole, positionFamily: playerRole };

  return side === undefined ? baseSlot : { ...baseSlot, side };
}

function gk(): readonly FormationSlot[] {
  return [slot("gk", "goalkeeper", "goalkeeping", "goalkeeper", "center")];
}

function backFour(): readonly FormationSlot[] {
  return [
    slot("rb", "defensive_line", "defense", "right_full_back", "right"),
    slot("cb-right", "defensive_line", "defense", "center_back", "right_center"),
    slot("cb-left", "defensive_line", "defense", "center_back", "left_center"),
    slot("lb", "defensive_line", "defense", "left_full_back", "left"),
  ];
}

function backThree(): readonly FormationSlot[] {
  return [
    slot("cb-right", "defensive_line", "defense", "center_back", "right_center"),
    slot("cb-center", "defensive_line", "defense", "center_back", "center"),
    slot("cb-left", "defensive_line", "defense", "center_back", "left_center"),
  ];
}

function backFive(): readonly FormationSlot[] {
  return [
    slot("rb", "defensive_line", "defense", "right_full_back", "right"),
    slot("cb-right", "defensive_line", "defense", "center_back", "right_center"),
    slot("cb-center", "defensive_line", "defense", "center_back", "center"),
    slot("cb-left", "defensive_line", "defense", "center_back", "left_center"),
    slot("lb", "defensive_line", "defense", "left_full_back", "left"),
  ];
}

function dm(slotKey = "dm", side: FormationSide = "center"): FormationSlot {
  return slot(slotKey, "defensive_midfield", "midfield", "defensive_midfielder", side);
}

function cm(slotKey: string, side: FormationSide = "center"): FormationSlot {
  return slot(slotKey, "midfield_line", "midfield", "central_midfielder", side);
}

function rm(): FormationSlot {
  return slot("rm", "midfield_line", "midfield", "right_midfielder", "right");
}

function lm(): FormationSlot {
  return slot("lm", "midfield_line", "midfield", "left_midfielder", "left");
}

function am(slotKey = "am", side: FormationSide = "center"): FormationSlot {
  return slot(slotKey, "attacking_midfield", "midfield", "attacking_midfielder", side);
}

function rw(): FormationSlot {
  return slot("rw", "forward_line", "attack", "right_winger", "right");
}

function lw(): FormationSlot {
  return slot("lw", "forward_line", "attack", "left_winger", "left");
}

function striker(slotKey = "st", side: FormationSide = "center"): FormationSlot {
  return slot(slotKey, "forward_line", "attack", "striker", side);
}
import { canonicalPlayerRoleDepartment, type CanonicalPlayerRole } from "./player-roles.ts";
