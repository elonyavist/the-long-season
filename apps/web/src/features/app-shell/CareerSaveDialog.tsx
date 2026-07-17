import type { Translator } from "@game/i18n";
import { useEffect, useRef } from "react";

import { CareerSaveControl, type CareerSaveLifecycle } from "./CareerSaveControl";

/** Accessible modal that keeps save management outside the persistent career layout. */
export function CareerSaveDialog({
  lifecycle,
  open,
  text,
  onClose,
}: Readonly<{
  lifecycle: CareerSaveLifecycle;
  open: boolean;
  text: Translator;
  onClose: () => void;
}>): React.JSX.Element {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog === null) return;

    if (open && !dialog.open) {
      previousFocusRef.current = document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
      dialog.showModal();
      return;
    }

    if (!open && dialog.open) {
      dialog.close();
      previousFocusRef.current?.focus();
      previousFocusRef.current = null;
    }
  }, [open]);

  const requestClose = (): void => {
    if (!lifecycle.pending) onClose();
  };

  return (
    <dialog
      aria-labelledby="tls-save-control-title"
      className="tls-career-save-dialog"
      data-state={lifecycle.pending ? "pending" : "idle"}
      ref={dialogRef}
      onCancel={(event) => {
        event.preventDefault();
        requestClose();
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) requestClose();
      }}
    >
      <CareerSaveControl lifecycle={lifecycle} text={text} />
      <button
        aria-label={text("career.saveControl.close")}
        className="tls-career-save-dialog-close"
        disabled={lifecycle.pending}
        type="button"
        onClick={requestClose}
      >
        <span aria-hidden="true">×</span>
      </button>
    </dialog>
  );
}
