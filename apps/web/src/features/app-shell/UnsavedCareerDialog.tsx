import type { Translator } from "@game/i18n";
import { useEffect, useRef } from "react";

/** Distinguishes leaving the career from leaving an edited team plan. */
export type UnsavedCareerDialogMode = "career_exit" | "preparation_navigation";

/** Accessible dirty-session exit confirmation with match-aware actions. */
export function UnsavedCareerDialog({
  open,
  mode = "career_exit",
  canSave,
  pending,
  text,
  onCancel,
  onExitWithoutSaving,
  onSaveAndExit,
}: Readonly<{
  open: boolean;
  mode?: UnsavedCareerDialogMode;
  canSave: boolean;
  pending: boolean;
  text: Translator;
  onCancel: () => void;
  onExitWithoutSaving: () => void;
  onSaveAndExit: () => void;
}>): React.JSX.Element {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog === null) return;

    if (open && !dialog.open) {
      previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      dialog.showModal();
      return;
    }

    if (!open && dialog.open) {
      dialog.close();
      previousFocusRef.current?.focus();
      previousFocusRef.current = null;
    }
  }, [open]);

  const preparationNavigation = mode === "preparation_navigation";
  const titleKey = preparationNavigation ? "career.preparationDraft.exit.title" : "career.exit.title";
  const summaryKey = preparationNavigation
    ? "career.preparationDraft.exit.summary"
    : canSave
      ? "career.exit.summary"
      : "career.exit.matchdaySummary";

  return (
    <dialog
      className="tls-unsaved-dialog"
      data-state={pending ? "pending" : "decision"}
      ref={dialogRef}
      aria-labelledby="tls-unsaved-dialog-title"
      aria-describedby="tls-unsaved-dialog-summary"
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
    >
      <div className="tls-unsaved-dialog-heading">
        <span className="tls-unsaved-dialog-mark" aria-hidden="true">!</span>
        <div>
          <h2 id="tls-unsaved-dialog-title">{text(titleKey)}</h2>
          <p id="tls-unsaved-dialog-summary">
            {text(summaryKey)}
          </p>
        </div>
      </div>
      <div className="tls-unsaved-dialog-actions">
        <button autoFocus className="tls-menu-button" disabled={pending} type="button" onClick={onCancel}>
          {text(preparationNavigation ? "career.preparationDraft.exit.stay" : "career.exit.cancel")}
        </button>
        <button className="tls-menu-button" disabled={pending} type="button" onClick={onExitWithoutSaving}>
          {text(preparationNavigation ? "career.preparationDraft.exit.discard" : "career.exit.exitWithoutSaving")}
        </button>
        {canSave ? (
          <button className="tls-menu-button tls-menu-button-primary" disabled={pending} type="button" onClick={onSaveAndExit}>
            {text(pending
              ? "career.saveControl.saving"
              : preparationNavigation
                ? "career.preparationDraft.exit.saveAndContinue"
                : "career.exit.saveAndExit")}
          </button>
        ) : null}
      </div>
    </dialog>
  );
}
