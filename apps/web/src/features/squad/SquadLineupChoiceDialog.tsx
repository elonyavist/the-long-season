import type { MessageKey, Translator } from "@game/i18n";
import type { CareerSquadSlotChoiceView } from "@game/ui";
import { X } from "lucide-react";
import * as m from "motion/react-m";
import { useEffect, useRef } from "react";

import { webMotion, webMotionTargets } from "../../shared/motion/web-motion";
import { PlayerStarRating } from "../../shared/ui/PlayerStarRating";

/** Accessible explicit replacement chooser used by Senior Squad actions. */
export function SquadLineupChoiceDialog({
  choice,
  text,
  onChoose,
  onClose,
}: Readonly<{
  choice: Readonly<{
    displayName: string;
    choices: readonly CareerSquadSlotChoiceView[];
  }> | undefined;
  text: Translator;
  onChoose: (slotKey: string) => void;
  onClose: () => void;
}>): React.JSX.Element {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog === null) return;
    if (choice !== undefined && !dialog.open) {
      previousFocusRef.current = document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
      dialog.showModal();
      return;
    }
    if (choice === undefined && dialog.open) {
      dialog.close();
      previousFocusRef.current?.focus();
      previousFocusRef.current = null;
    }
  }, [choice]);

  return (
    <dialog
      aria-labelledby="squad-lineup-choice-title"
      className="tls-squad-choice-dialog"
      ref={dialogRef}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
    >
      {choice === undefined ? null : (
        <m.div
          className="tls-squad-choice-shell"
          initial={webMotionTargets.dialogEnter}
          animate={webMotionTargets.rest}
          transition={webMotion.transition}
        >
          <header className="tls-squad-choice-header">
            <div>
              <h2 id="squad-lineup-choice-title">{text("career.squad.lineupChoice.title")}</h2>
              <p>{text("career.squad.lineupChoice.summary", { player: choice.displayName })}</p>
            </div>
            <button
              aria-label={text("career.squad.lineupChoice.close")}
              className="tls-icon-button"
              title={text("career.squad.lineupChoice.close")}
              type="button"
              onClick={onClose}
            >
              <X aria-hidden="true" size={20} strokeWidth={1.8} />
            </button>
          </header>
          <div className="tls-squad-choice-list">
            {choice.choices.map((slot) => (
              <button
                className="tls-squad-choice-option"
                data-suitability={slot.suitability}
                key={slot.slotKey}
                type="button"
                onClick={() => onChoose(slot.slotKey)}
              >
                <span className="tls-squad-choice-role">
                  {text(`career.player.role.${slot.role}` as MessageKey)}
                </span>
                <span className="tls-squad-choice-target">
                  {slot.isEmpty
                    ? text("career.squad.lineupChoice.emptySlot")
                    : text("career.squad.lineupChoice.replacePlayer", { player: slot.occupantName ?? "" })}
                </span>
                <span className="tls-squad-choice-facts">
                  {text(`formation.suitability.${slot.suitability}` as MessageKey)}
                  {slot.occupantCurrentRating === undefined ? null : (
                    <>
                      <span aria-hidden="true"> · </span>
                      <PlayerStarRating
                        label={text("career.squad.column.current_level")}
                        rating={slot.occupantCurrentRating}
                        text={text}
                      />
                    </>
                  )}
                  {slot.occupantCondition === undefined ? null : (
                    <>
                      <span aria-hidden="true"> · </span>
                      {Math.round(slot.occupantCondition)}%
                    </>
                  )}
                </span>
              </button>
            ))}
          </div>
        </m.div>
      )}
    </dialog>
  );
}
