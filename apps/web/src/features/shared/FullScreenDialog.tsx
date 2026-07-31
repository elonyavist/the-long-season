import * as m from "motion/react-m";
import {
  useEffect,
  useRef,
  type ReactNode,
} from "react";

import { webMotion, webMotionTargets } from "../../shared/motion/web-motion";

/** Props for the shared accessible full-screen inspection surface. */
export type FullScreenDialogProps = Readonly<{
  labelledBy: string;
  open: boolean;
  shellClassName: string;
  children: ReactNode;
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  /**
   * Whether a backdrop, gutter, or scrollbar press closes the dialog.
   *
   * Inspection surfaces keep the default light dismissal. A transactional
   * surface that holds an unsent draft opts out, so a stray press beside the
   * panel cannot silently discard what the manager was writing. `Escape` and
   * the explicit close control stay available in both modes.
   */
  dismissOnBackdrop?: boolean;
  onClose: () => void;
}>;

/**
 * Owns native modal behavior, focus restoration, backdrop close, and motion.
 *
 * Feature dialogs provide their own content and close control so this primitive
 * stays useful without owning football-specific labels or presentation.
 */
export function FullScreenDialog({
  labelledBy,
  open,
  shellClassName,
  children,
  initialFocusRef,
  dismissOnBackdrop = true,
  onClose,
}: FullScreenDialogProps): React.JSX.Element {
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
      initialFocusRef?.current?.focus();
      return;
    }

    if (!open && dialog.open) {
      dialog.close();
      previousFocusRef.current?.focus();
      previousFocusRef.current = null;
    }
  }, [initialFocusRef, open]);

  return (
    <dialog
      aria-labelledby={labelledBy}
      className="tls-full-screen-dialog"
      data-backdrop-dismiss={dismissOnBackdrop ? "true" : "false"}
      ref={dialogRef}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (!dismissOnBackdrop) return;
        if (event.target === dialogRef.current) onClose();
      }}
    >
      {open ? (
        <m.article
          className={shellClassName}
          initial={webMotionTargets.dialogEnter}
          animate={webMotionTargets.rest}
          transition={webMotion.transition}
        >
          {children}
        </m.article>
      ) : null}
    </dialog>
  );
}
