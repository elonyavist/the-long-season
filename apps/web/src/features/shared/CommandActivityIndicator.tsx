import type { Translator } from "@game/i18n";

import type {
  CareerCommandActivity,
  CareerCommandId,
} from "../../stores/career-ui-store";

/** Props shared by visible command labels and their single live announcement. */
export type CommandActivityIndicatorProps = Readonly<{
  activity: CareerCommandActivity | undefined;
  commandIds: readonly CareerCommandId[];
  idleLabel: string;
  text: Translator;
}>;

/**
 * Keeps one action label stable while adding a restrained progress mark for
 * the command that action started.
 */
export function CommandActivityIndicator({
  activity,
  commandIds,
  idleLabel,
  text,
}: CommandActivityIndicatorProps): React.JSX.Element {
  const pending = isMatchingPendingCommand(activity, commandIds);

  return (
    <span
      className="tls-command-activity-label"
      data-pending={pending}
      data-state={pending ? "pending" : "idle"}
    >
      {pending ? <span className="tls-command-activity-spinner" aria-hidden="true" /> : null}
      <span className="tls-command-activity-copy">
        {pending && activity !== undefined ? text(activity.statusLabelKey) : idleLabel}
      </span>
    </span>
  );
}

/** Announces the one active command without replacing visible football context. */
export function CommandActivityLiveRegion({
  activity,
  completionMessage,
  text,
}: Readonly<{
  activity: CareerCommandActivity | undefined;
  completionMessage?: string;
  text: Translator;
}>): React.JSX.Element {
  return (
    <p className="tls-visually-hidden" role="status" aria-live="polite" aria-atomic="true">
      {activity?.status === "pending" ? text(activity.statusLabelKey) : completionMessage ?? ""}
    </p>
  );
}

/** Returns whether one of the supplied controls owns the current pending work. */
export function isMatchingPendingCommand(
  activity: CareerCommandActivity | undefined,
  commandIds: readonly CareerCommandId[],
): boolean {
  return activity?.status === "pending" && commandIds.includes(activity.commandId);
}
