import type {
  CareerDashboardActionAvailability,
  CareerDashboardBlockerKey,
  CareerDashboardView,
} from "@game/ui";

/** Normalized dashboard sections expected by the first web dashboard screen. */
export type CareerDashboardSectionId =
  | "context"
  | "selected_club"
  | "next_fixture"
  | "preparation"
  | "condition"
  | "table"
  | "recent_match"
  | "actions"
  | "blockers";

/** Small presentation model for the dashboard screen, without rendered prose. */
export type CareerDashboardPresentation = Readonly<{
  view: CareerDashboardView;
  sectionIds: readonly CareerDashboardSectionId[];
  canAdvanceNextFixture: boolean;
  primaryBlockers: readonly CareerDashboardBlockerKey[];
  actions: readonly CareerDashboardActionAvailability[];
}>;

const DASHBOARD_SECTION_IDS: readonly CareerDashboardSectionId[] = [
  "context",
  "selected_club",
  "next_fixture",
  "preparation",
  "condition",
  "table",
  "recent_match",
  "actions",
  "blockers",
];

/**
 * Prepares a dashboard view for React rendering without duplicating readiness.
 *
 * Availability and blocker rules remain owned by `@game/ui`; this presenter
 * only groups facts in the order the web screen should render them.
 */
export function presentCareerDashboard(view: CareerDashboardView): CareerDashboardPresentation {
  const advanceAction = view.actions.find((action) => action.actionId === "advance_next_fixture");

  return {
    view,
    sectionIds: DASHBOARD_SECTION_IDS,
    canAdvanceNextFixture: advanceAction?.status === "available",
    primaryBlockers: view.alertKeys,
    actions: view.actions,
  };
}
