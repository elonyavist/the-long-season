import { DEFAULT_REGULATION_SUBSTITUTION_LIMIT, type MatchSubstitutionDecision } from "./substitution.ts";
import type { PlayerId } from "../types/ids.ts";

/** Stable validation keys for selected-club half-time tactical plans. */
export type HalfTimeTacticalDecisionValidationKey =
  | "invalid_second_half_tactical_setup"
  | "too_many_substitutions"
  | "missing_lineup_slot"
  | "invalid_lineup_size"
  | "duplicate_lineup_player"
  | "missing_goalkeeper"
  | "duplicate_bench_player"
  | "player_in_lineup_and_bench";

/** One declared second-half tactical slot. Slot identity stays separate from player assignment. */
export interface HalfTimeTacticalLineupSlot {
  /** Stable slot identifier from the tactical board. */
  readonly slotId: string;
  /** Assigned player, or null when the manager has not filled the slot. */
  readonly playerId: PlayerId | null;
  /** Role key active for this slot after half-time decisions. */
  readonly roleKey: string;
  /** Optional board position key when the UI distinguishes role from display position. */
  readonly positionKey?: string;
}

/** One declared second-half bench slot after the manager has made half-time choices. */
export interface HalfTimeTacticalBenchSlot {
  /** Stable bench slot identifier. */
  readonly slotId: string;
  /** Assigned bench player, or null when the slot is empty. */
  readonly playerId: PlayerId | null;
}

/** Structured half-time plan declared by the selected-club manager. */
export interface HalfTimeTacticalDecisionPlan {
  /** Starting formation used to create the tactical board before any role changes. */
  readonly baseFormationId: string;
  /** Derived in-field shape after role changes and slot movements. */
  readonly currentShape: string;
  /** Declared second-half lineup slots. */
  readonly lineupSlots: readonly HalfTimeTacticalLineupSlot[];
  /** Declared bench state after substitutions. */
  readonly benchSlots: readonly HalfTimeTacticalBenchSlot[];
  /** Explicit substitutions chosen by the manager at half-time. */
  readonly substitutions: readonly MatchSubstitutionDecision[];
  /** Optional competition limit override; defaults to regulation league rules. */
  readonly maxSubstitutions?: number;
  /** Optional lineup size override for tests or future competition variants. */
  readonly requiredLineupSize?: number;
}

/** One machine-readable validation fact for a half-time tactical plan. */
export interface HalfTimeTacticalDecisionValidationFact {
  /** Stable validation key. */
  readonly key: HalfTimeTacticalDecisionValidationKey;
  /** Related lineup or bench slot when applicable. */
  readonly slotId?: string;
  /** Related player when applicable. */
  readonly playerId?: PlayerId;
}

/** Valid half-time tactical decision validation result. */
export interface HalfTimeTacticalDecisionValid {
  /** Discriminator for a valid plan. */
  readonly status: "valid";
  /** Original validated plan. */
  readonly plan: HalfTimeTacticalDecisionPlan;
}

/** Invalid half-time tactical decision validation result. */
export interface HalfTimeTacticalDecisionInvalid {
  /** Discriminator for invalid plans. */
  readonly status: "invalid";
  /** Structured validation facts. */
  readonly facts: readonly HalfTimeTacticalDecisionValidationFact[];
}

/** Result of validating a selected-club half-time tactical plan. */
export type HalfTimeTacticalDecisionValidationResult =
  | HalfTimeTacticalDecisionValid
  | HalfTimeTacticalDecisionInvalid;

/**
 * Validates the selected-club half-time tactical plan as pure domain data.
 *
 * The function deliberately returns structured facts and never tries to repair
 * the plan. User-club decisions must stay explicit so the UI can ask the
 * manager to fix the concrete issue.
 */
export function validateHalfTimeTacticalDecisionPlan(
  plan: HalfTimeTacticalDecisionPlan,
): HalfTimeTacticalDecisionValidationResult {
  const facts: HalfTimeTacticalDecisionValidationFact[] = [];
  const requiredLineupSize = plan.requiredLineupSize ?? 11;
  const maxSubstitutions = plan.maxSubstitutions ?? DEFAULT_REGULATION_SUBSTITUTION_LIMIT;

  if (plan.baseFormationId.trim() === "" || plan.currentShape.trim() === "") {
    facts.push({ key: "invalid_second_half_tactical_setup" });
  }

  if (plan.lineupSlots.length !== requiredLineupSize) {
    facts.push({ key: "invalid_lineup_size" });
  }

  if (plan.substitutions.length > maxSubstitutions) {
    facts.push({ key: "too_many_substitutions" });
  }

  collectMissingLineupSlots(plan.lineupSlots, facts);
  collectDuplicatePlayers(plan.lineupSlots, "duplicate_lineup_player", facts);
  collectDuplicatePlayers(plan.benchSlots, "duplicate_bench_player", facts);
  collectLineupBenchOverlaps(plan.lineupSlots, plan.benchSlots, facts);

  if (!hasAssignedGoalkeeper(plan.lineupSlots)) {
    facts.push({ key: "missing_goalkeeper" });
  }

  if (facts.length > 0) {
    return { status: "invalid", facts };
  }

  return { status: "valid", plan };
}

function collectMissingLineupSlots(
  lineupSlots: readonly HalfTimeTacticalLineupSlot[],
  facts: HalfTimeTacticalDecisionValidationFact[],
): void {
  for (const slot of lineupSlots) {
    if (slot.playerId === null) {
      facts.push({ key: "missing_lineup_slot", slotId: slot.slotId });
    }
  }
}

function collectDuplicatePlayers(
  slots: readonly { readonly slotId: string; readonly playerId: PlayerId | null }[],
  key: Extract<HalfTimeTacticalDecisionValidationKey, "duplicate_lineup_player" | "duplicate_bench_player">,
  facts: HalfTimeTacticalDecisionValidationFact[],
): void {
  const firstSlotByPlayer = new Map<PlayerId, string>();

  for (const slot of slots) {
    if (slot.playerId === null) {
      continue;
    }

    const firstSlotId = firstSlotByPlayer.get(slot.playerId);

    if (firstSlotId !== undefined) {
      facts.push({ key, slotId: slot.slotId, playerId: slot.playerId });
      continue;
    }

    firstSlotByPlayer.set(slot.playerId, slot.slotId);
  }
}

function collectLineupBenchOverlaps(
  lineupSlots: readonly HalfTimeTacticalLineupSlot[],
  benchSlots: readonly HalfTimeTacticalBenchSlot[],
  facts: HalfTimeTacticalDecisionValidationFact[],
): void {
  const lineupPlayerIds = new Set(
    lineupSlots
      .map((slot) => slot.playerId)
      .filter((player): player is PlayerId => player !== null),
  );

  for (const benchSlot of benchSlots) {
    if (benchSlot.playerId !== null && lineupPlayerIds.has(benchSlot.playerId)) {
      facts.push({
        key: "player_in_lineup_and_bench",
        slotId: benchSlot.slotId,
        playerId: benchSlot.playerId,
      });
    }
  }
}

function hasAssignedGoalkeeper(lineupSlots: readonly HalfTimeTacticalLineupSlot[]): boolean {
  return lineupSlots.some((slot) => slot.playerId !== null && isGoalkeeperKey(slot.roleKey, slot.positionKey));
}

function isGoalkeeperKey(roleKey: string, positionKey: string | undefined): boolean {
  const normalizedRole = roleKey.toLowerCase();
  const normalizedPosition = positionKey?.toLowerCase();

  return normalizedRole === "goalkeeper"
    || normalizedRole === "gk"
    || normalizedRole === "por"
    || normalizedPosition === "goalkeeper"
    || normalizedPosition === "gk"
    || normalizedPosition === "por";
}
