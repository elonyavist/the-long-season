import type { Translator } from "@game/i18n";
import * as m from "motion/react-m";

import { webMotion } from "../../shared/motion/web-motion";
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

/** Props for a stable command label with optional real pending feedback. */
export type CommandFeedbackLabelProps = Readonly<{
  pending: boolean;
  idleLabel: string;
  pendingLabel: string;
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
    <CommandFeedbackLabel
      idleLabel={idleLabel}
      pending={pending}
      pendingLabel={pending && activity !== undefined ? text(activity.statusLabelKey) : idleLabel}
    />
  );
}

/**
 * Gives a real asynchronous action immediate bounded feedback while reserving
 * stable space for the progress mark in both idle and pending states.
 */
export function CommandFeedbackLabel({
  pending,
  idleLabel,
  pendingLabel,
}: CommandFeedbackLabelProps): React.JSX.Element {
  const label = pending ? pendingLabel : idleLabel;

  return (
    <span
      className="tls-command-activity-label"
      data-pending={pending}
      data-state={pending ? "pending" : "idle"}
    >
      <m.span
        animate={pending ? { opacity: 1, rotate: 360 } : { opacity: 0, rotate: 0 }}
        aria-hidden="true"
        className="tls-command-activity-spinner"
        data-visible={pending}
        initial={false}
        transition={pending ? webMotion.commandPending : webMotion.micro}
      />
      <m.span
        animate={{ opacity: 1, y: 0 }}
        className="tls-command-activity-copy"
        initial={{ opacity: 0.72, y: 1 }}
        key={`${pending ? "pending" : "idle"}:${label}`}
        transition={webMotion.micro}
      >
        {label}
      </m.span>
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
