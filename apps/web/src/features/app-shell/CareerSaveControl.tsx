import type { Translator } from "@game/i18n";
import { toISO } from "@game/shared";
import type { CareerAutosaveIntervalDays } from "@game/storage";
import { createContext, useContext, type ReactNode } from "react";

import type { CareerSessionStatus } from "../../runtime/career-session";
import { CommandFeedbackLabel } from "../shared/CommandActivityIndicator";

/** Commands and facts required by the persistent career save control. */
export interface CareerSaveLifecycle {
  readonly sessionStatus: CareerSessionStatus;
  readonly canSave: boolean;
  readonly pending: boolean;
  readonly onSave: () => void;
  readonly onPolicyChange: (policy: CareerAutosaveIntervalDays) => void;
}

const CareerSaveLifecycleContext = createContext<CareerSaveLifecycle | undefined>(undefined);

/** Supplies one save lifecycle to every shell without screen-specific prop plumbing. */
export function CareerSaveLifecycleProvider({
  value,
  children,
}: Readonly<{ value: CareerSaveLifecycle; children: ReactNode }>): React.JSX.Element {
  return (
    <CareerSaveLifecycleContext.Provider value={value}>
      {children}
    </CareerSaveLifecycleContext.Provider>
  );
}

/** Reads the optional lifecycle so isolated shell tests remain lightweight. */
export function useCareerSaveLifecycle(): CareerSaveLifecycle | undefined {
  return useContext(CareerSaveLifecycleContext);
}

/** Compact manual-save command and mutually exclusive in-world autosave policy. */
export function CareerSaveControl({
  lifecycle,
  text,
}: Readonly<{ lifecycle: CareerSaveLifecycle; text: Translator }>): React.JSX.Element {
  const status = lifecycle.sessionStatus;
  const statusLabel = status.dirty
    ? text("career.saveControl.unsaved")
    : text("career.saveControl.savedThrough");
  const controlState = lifecycle.pending
    ? "pending"
    : !lifecycle.canSave
      ? "unavailable"
      : status.dirty
        ? "dirty"
        : "saved";

  return (
    <section
      className="tls-career-save-control"
      data-state={controlState}
      aria-labelledby="tls-save-control-title"
    >
      <div className="tls-career-save-heading">
        <h2 id="tls-save-control-title">{text("career.saveControl.title")}</h2>
        <span className="tls-career-save-status" data-dirty={status.dirty}>
          {statusLabel}
          {status.dirty ? null : <time dateTime={toISO(status.lastPersistedGameDate)}> {toISO(status.lastPersistedGameDate)}</time>}
        </span>
      </div>

      <button
        className="tls-menu-button tls-career-save-button"
        data-state={lifecycle.pending ? "pending" : lifecycle.canSave ? "idle" : "disabled"}
        disabled={!lifecycle.canSave || lifecycle.pending}
        type="button"
        onClick={lifecycle.onSave}
      >
        <CommandFeedbackLabel
          idleLabel={text("career.saveControl.saveGame")}
          pending={lifecycle.pending}
          pendingLabel={text("career.saveControl.saving")}
        />
      </button>

      {lifecycle.canSave ? (
        <section className="tls-career-save-policy" aria-labelledby="tls-save-policy-title">
          <h3 id="tls-save-policy-title">{text("career.saveControl.autosave")}</h3>
          <fieldset disabled={lifecycle.pending}>
            <legend className="tls-visually-hidden">{text("career.saveControl.autosave")}</legend>
            <AutosaveOption lifecycle={lifecycle} policy={7} text={text} />
            <AutosaveOption lifecycle={lifecycle} policy={15} text={text} />
            <AutosaveOption lifecycle={lifecycle} policy={null} text={text} />
          </fieldset>
        </section>
      ) : (
        <p className="tls-career-save-unavailable">{text("career.saveControl.disabledDuringMatch")}</p>
      )}
    </section>
  );
}

function AutosaveOption({
  lifecycle,
  policy,
  text,
}: Readonly<{
  lifecycle: CareerSaveLifecycle;
  policy: CareerAutosaveIntervalDays;
  text: Translator;
}>): React.JSX.Element {
  const labelKey = policy === 7
    ? "career.saveControl.autosave7"
    : policy === 15
      ? "career.saveControl.autosave15"
      : "career.saveControl.manualOnly";

  return (
    <label>
      <input
        checked={lifecycle.sessionStatus.autosaveIntervalDays === policy}
        name="career-autosave-policy"
        type="radio"
        onChange={() => lifecycle.onPolicyChange(policy)}
      />
      <span>{text(labelKey)}</span>
    </label>
  );
}
