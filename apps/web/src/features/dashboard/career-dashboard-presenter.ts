import type {
  CareerDashboardBlockerKey,
  CareerDashboardView,
} from "@game/ui";
import type { WebCareerContinueResult } from "../../runtime/web-career-runtime";

/** Visible operational state that determines the Dashboard's primary story. */
export type CareerDashboardTaskState = "attention" | "unprepared" | "ready" | "post_match";

/** Small presentation model for the dashboard screen, without rendered prose. */
export type CareerDashboardPresentation = Readonly<{
  view: CareerDashboardView;
  canAdvanceNextFixture: boolean;
  primaryBlockers: readonly CareerDashboardBlockerKey[];
  taskState: CareerDashboardTaskState;
  attention?: WebCareerContinueResult;
}>;

/**
 * Prepares a dashboard view for React rendering without duplicating readiness.
 *
 * Availability and blocker rules remain owned by `@game/ui`; this presenter
 * only groups facts in the order the web screen should render them.
 */
export function presentCareerDashboard(
  view: CareerDashboardView,
  continueResult?: WebCareerContinueResult,
): CareerDashboardPresentation {
  const advanceAction = view.actions.find((action) => action.actionId === "advance_next_fixture");
  const attention = continueResult?.stopReason === "attention" ? continueResult : undefined;
  const taskState = dashboardTaskState(view, attention);

  return {
    view,
    canAdvanceNextFixture: advanceAction?.status === "available",
    primaryBlockers: taskState === "post_match" ? [] : view.alertKeys,
    taskState,
    ...(attention === undefined ? {} : { attention }),
  };
}

/** Keeps task precedence explicit without inventing football facts. */
function dashboardTaskState(
  view: CareerDashboardView,
  attention: WebCareerContinueResult | undefined,
): CareerDashboardTaskState {
  if (attention !== undefined) return "attention";
  if (view.recentMatch.status === "available") return "post_match";
  if (view.alertKeys.length > 0) return "unprepared";
  return "ready";
}
