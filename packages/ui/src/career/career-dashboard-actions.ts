import type { UiActionResult } from "../app/app-entry-actions.ts";

/** Stable actions available from the first post-load career screen. */
export type CareerDashboardActionId =
  | "inspect_squad"
  | "inspect_lineup"
  | "inspect_tactic"
  | "prepare_match"
  | "advance_next_fixture"
  | "inspect_table";

/** Machine-readable blocker shown when the career dashboard cannot advance. */
export type CareerDashboardBlockerKey = "missing_saved_lineup" | "missing_saved_tactic" | "no_next_fixture" | "save_not_found" | "invalid_career_state";

/** Availability status for career dashboard actions. */
export type CareerDashboardActionAvailabilityStatus = "available" | "unavailable" | "blocked";

/** Structured action availability for the first career dashboard. */
export interface CareerDashboardActionAvailability {
  /** Stable action identifier for UI controls. */
  readonly actionId: CareerDashboardActionId;
  /** Whether the action can currently be selected. */
  readonly status: CareerDashboardActionAvailabilityStatus;
  /** Optional machine-readable blocker keys. */
  readonly blockerKeys: readonly CareerDashboardBlockerKey[];
  /** Translation key for the future UI label. */
  readonly labelKey: string;
}

/** Result contract for first career dashboard actions. */
export type CareerDashboardActionResult = UiActionResult<CareerDashboardActionId>;

/**
 * Creates one career dashboard action availability record.
 *
 * This helper keeps dashboard action status and label keys consistent without
 * executing gameplay or writing saves.
 */
export function careerDashboardActionAvailability(input: {
  readonly actionId: CareerDashboardActionId;
  readonly status: CareerDashboardActionAvailabilityStatus;
  readonly blockerKeys?: readonly CareerDashboardBlockerKey[];
}): CareerDashboardActionAvailability {
  return {
    actionId: input.actionId,
    status: input.status,
    blockerKeys: input.blockerKeys ?? [],
    labelKey: `career.dashboard.action.${input.actionId}`,
  };
}

/**
 * Creates a structured career dashboard action result.
 *
 * The result is only a data contract. Actual action execution belongs to the
 * future app adapter or existing CLI command handlers.
 */
export function careerDashboardActionResult(input: CareerDashboardActionResult): CareerDashboardActionResult {
  return input;
}
