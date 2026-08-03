import { isCanonicalPlayerRole, type CanonicalPlayerRole } from "../tactics/player-roles.ts";
import type { ClubId, PlayerId } from "../types/ids.ts";

/**
 * User-facing match mentality for the first tactic MVP.
 *
 * The exact engine effect is intentionally not defined in domain. This key is
 * stable serializable data that later builders can translate into simulation
 * inputs.
 */
export type TacticMentalityKey =
  | "very_defensive"
  | "defensive"
  | "balanced"
  | "attacking"
  | "very_attacking";

/**
 * The five mentalities from most protective to most committed.
 *
 * The order is meaningful, not alphabetical: anything that ranks, interpolates,
 * or validates a mentality ladder walks this array rather than restating which
 * step outranks which. `balanced` sits in the middle and is the neutral one.
 */
export const TACTIC_MENTALITIES = [
  "very_defensive",
  "defensive",
  "balanced",
  "attacking",
  "very_attacking",
] as const satisfies readonly TacticMentalityKey[];

/** The mentality that commits to neither attack nor protection. */
export const NEUTRAL_TACTIC_MENTALITY: TacticMentalityKey = "balanced";

/**
 * Numeric tactic knob on the MVP 0-1 scale.
 *
 * `0` means the least intense version of the instruction, `1` means the most
 * intense version. Engine builders may later map this value into narrower
 * match-context caps.
 */
export type TacticKnobValue = number;

/**
 * One explicit selected-lineup slot.
 *
 * Slot order is meaningful and must be preserved by callers.
 *
 * `slotKey` is identity only - a stable caller or content key such as `gk`,
 * `cb-left`, or `st-right`. Nothing may read tactical meaning out of it.
 * `canonicalRole` is where the tactical meaning lives, and it is the manager's
 * actual choice: the tactical board lets any outfield slot take any canonical
 * role, so the role is not implied by the slot key or by the formation preset
 * the lineup started from.
 *
 * @example
 * const slot: SelectedLineupSlot = {
 *   slotKey: "st-right",
 *   playerId: playerId("player:000009"),
 *   canonicalRole: "striker",
 * };
 */
export interface SelectedLineupSlot {
  /** Stable slot key inside this selected lineup. Identity only. */
  readonly slotKey: string;
  /** Player selected for this slot. */
  readonly playerId: PlayerId;
  /** Canonical football role the manager assigned to this slot. */
  readonly canonicalRole: CanonicalPlayerRole;
}

/**
 * Serializable selected lineup for one club.
 *
 * Domain only records the user's chosen players and role keys. It does not
 * know whether the club owns those players or whether role weights exist; that
 * belongs to the engine builder step.
 */
export interface SelectedLineup {
  /** Club this lineup belongs to. */
  readonly clubId: ClubId;
  /** Ordered selected slots. */
  readonly slots: readonly SelectedLineupSlot[];
}

/**
 * Serializable tactical setup for one club or match side.
 *
 * The MVP keeps instructions deliberately small and language-agnostic. Labels,
 * UI wording, tactical familiarity, and match effects are later layers.
 */
export interface TacticSetup {
  /** Broad mentality key on a five-step scale. */
  readonly mentality: TacticMentalityKey;
  /** Pressing intensity on the 0-1 MVP scale. */
  readonly pressing: TacticKnobValue;
  /** Build-up directness on the 0-1 MVP scale. */
  readonly directness: TacticKnobValue;
  /** Attacking width on the 0-1 MVP scale. */
  readonly width: TacticKnobValue;
  /** Attacking risk on the 0-1 MVP scale. */
  readonly risk: TacticKnobValue;
}

/** Error categories exposed by tactic and lineup contract helpers. */
export type TacticContractErrorCode =
  | "empty_lineup"
  | "missing_player"
  | "duplicate_player"
  | "missing_slot_key"
  | "duplicate_slot_key"
  | "invalid_canonical_role"
  | "invalid_mentality"
  | "invalid_tactic_value";

/**
 * Typed error thrown when tactic or selected-lineup contracts are ambiguous.
 *
 * @example
 * if (error instanceof TacticContractError && error.code === "duplicate_player") {
 *   // Caller can point the user to the duplicated lineup selection.
 * }
 */
export class TacticContractError extends Error {
  /** Machine-readable failure reason. */
  public readonly code: TacticContractErrorCode;

  /** Creates a tactic-contract error. */
  public constructor(code: TacticContractErrorCode, message: string) {
    super(message);
    this.name = "TacticContractError";
    this.code = code;
  }
}

/**
 * Builds a validated selected lineup while preserving explicit slot order.
 *
 * This helper validates only the domain-level ambiguity rules: non-empty lineup,
 * non-empty slot keys, a canonical role per slot, one player per slot, and no
 * duplicate player or slot keys. Ownership, availability, required lineup size,
 * and role-weight resolution remain engine-builder responsibilities.
 *
 * @example
 * const lineup = createSelectedLineup({
 *   clubId: clubId("club:pro01"),
 *   slots: [
 *     { slotKey: "gk", playerId: playerId("player:000001"), canonicalRole: "goalkeeper" },
 *   ],
 * });
 */
export function createSelectedLineup(input: SelectedLineup): SelectedLineup {
  if (input.slots.length === 0) {
    throw new TacticContractError("empty_lineup", "Selected lineup must include at least one slot");
  }

  const seenPlayerIds = new Set<PlayerId>();
  const seenSlotKeys = new Set<string>();
  const slots: SelectedLineupSlot[] = [];

  for (const slot of input.slots) {
    validateLineupSlot(slot, seenPlayerIds, seenSlotKeys);
    seenPlayerIds.add(slot.playerId);
    seenSlotKeys.add(slot.slotKey);
    slots.push({
      slotKey: slot.slotKey,
      playerId: slot.playerId,
      canonicalRole: slot.canonicalRole,
    });
  }

  return {
    clubId: input.clubId,
    slots,
  };
}

/**
 * Builds a validated tactic setup.
 *
 * All numeric knobs must be finite and inside the inclusive 0-1 MVP scale.
 * Later engine code can remap these values to context caps without changing the
 * saved domain contract.
 *
 * @example
 * const tactic = createTacticSetup({
 *   mentality: "balanced",
 *   pressing: 0.5,
 *   directness: 0.5,
 *   width: 0.5,
 *   risk: 0.5,
 * });
 */
export function createTacticSetup(input: TacticSetup): TacticSetup {
  if (!isTacticMentalityKey(input.mentality)) {
    throw new TacticContractError("invalid_mentality", `Unsupported tactic mentality: ${input.mentality}`);
  }

  validateTacticKnob("pressing", input.pressing);
  validateTacticKnob("directness", input.directness);
  validateTacticKnob("width", input.width);
  validateTacticKnob("risk", input.risk);

  return {
    mentality: input.mentality,
    pressing: input.pressing,
    directness: input.directness,
    width: input.width,
    risk: input.risk,
  };
}

/**
 * Checks whether an unknown value is a supported tactic mentality key.
 */
export function isTacticMentalityKey(value: unknown): value is TacticMentalityKey {
  return TACTIC_MENTALITIES.some((mentality) => mentality === value);
}

/**
 * Validates one selected-lineup slot against domain-level ambiguity rules.
 */
function validateLineupSlot(
  slot: SelectedLineupSlot,
  seenPlayerIds: ReadonlySet<PlayerId>,
  seenSlotKeys: ReadonlySet<string>,
): void {
  if (slot.playerId === undefined || slot.playerId === null || slot.playerId === "") {
    throw new TacticContractError("missing_player", `Selected lineup slot must include a player: ${slot.slotKey}`);
  }

  if (seenPlayerIds.has(slot.playerId)) {
    throw new TacticContractError("duplicate_player", `Selected lineup player is duplicated: ${slot.playerId}`);
  }

  if (slot.slotKey.length === 0) {
    throw new TacticContractError("missing_slot_key", "Selected lineup slot key must not be empty");
  }

  if (seenSlotKeys.has(slot.slotKey)) {
    throw new TacticContractError("duplicate_slot_key", `Selected lineup slot key is duplicated: ${slot.slotKey}`);
  }

  if (!isCanonicalPlayerRole(slot.canonicalRole)) {
    throw new TacticContractError(
      "invalid_canonical_role",
      `Selected lineup slot must carry a canonical role: ${slot.slotKey} has ${String(slot.canonicalRole)}`,
    );
  }
}

/**
 * Validates one numeric tactic knob on the inclusive 0-1 MVP scale.
 */
function validateTacticKnob(name: keyof Pick<TacticSetup, "pressing" | "directness" | "width" | "risk">, value: number): void {
  if (!Number.isFinite(value)) {
    throw new TacticContractError("invalid_tactic_value", `Tactic ${name} must be finite: ${value}`);
  }

  if (value < 0 || value > 1) {
    throw new TacticContractError("invalid_tactic_value", `Tactic ${name} must be between 0 and 1: ${value}`);
  }
}
