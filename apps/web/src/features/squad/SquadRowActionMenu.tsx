import { EllipsisVertical, Eye, Rows3 } from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

import type { Translator } from "@game/i18n";

const MENU_VIEWPORT_MARGIN = 8;
const MENU_TRIGGER_GAP = 6;

type MenuPosition = Readonly<{
  left: number;
  top: number;
  placement: "top" | "bottom";
  ready: boolean;
}>;

/** Props for the one secondary-action menu owned by a Squad table row. */
export type SquadRowActionMenuProps = Readonly<{
  playerName: string;
  text: Translator;
  dismissSignal: string;
  canChooseLineupPosition: boolean;
  onOpenProfile: () => void;
  onChooseLineupPosition: () => void;
}>;

/**
 * Renders a viewport-aware body-portal menu so table scrolling never clips
 * secondary Squad actions.
 */
export function SquadRowActionMenu({
  playerName,
  text,
  dismissSignal,
  canChooseLineupPosition,
  onOpenProfile,
  onChooseLineupPosition,
}: SquadRowActionMenuProps): React.JSX.Element {
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const previousDismissSignalRef = useRef(dismissSignal);
  const openFocusRef = useRef<"first" | "last">("first");
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<MenuPosition>({
    left: 0,
    top: 0,
    placement: "bottom",
    ready: false,
  });

  const closeMenu = useCallback((restoreTriggerFocus: boolean): void => {
    setOpen(false);
    setPosition((current) => current.ready ? { ...current, ready: false } : current);
    if (restoreTriggerFocus) {
      triggerRef.current?.focus({ preventScroll: true });
    }
  }, []);

  const openMenu = useCallback((focusTarget: "first" | "last" = "first"): void => {
    openFocusRef.current = focusTarget;
    setOpen(true);
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current;
    const menu = menuRef.current;
    if (trigger === null || menu === null) return;

    if (!position.ready) {
      setPosition(positionMenu(trigger.getBoundingClientRect(), menu.getBoundingClientRect()));
      return;
    }
    const items = menuItems(menu);
    const item = openFocusRef.current === "last" ? items.at(-1) : items[0];
    item?.focus({ preventScroll: true });
  }, [open, position.ready]);

  useEffect(() => {
    if (!open) return;

    const handleOutsidePointer = (event: PointerEvent): void => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (triggerRef.current?.contains(target) === true) return;
      if (menuRef.current?.contains(target) === true) return;
      const restoreTrigger = !isFocusableTarget(target);
      closeMenu(false);
      if (restoreTrigger) {
        window.requestAnimationFrame(() => {
          triggerRef.current?.focus({ preventScroll: true });
        });
      }
    };
    const closeAndRestoreFocus = (): void => closeMenu(true);

    document.addEventListener("pointerdown", handleOutsidePointer, true);
    window.addEventListener("scroll", closeAndRestoreFocus, { capture: true, passive: true });
    window.addEventListener("resize", closeAndRestoreFocus, { passive: true });
    return () => {
      document.removeEventListener("pointerdown", handleOutsidePointer, true);
      window.removeEventListener("scroll", closeAndRestoreFocus, true);
      window.removeEventListener("resize", closeAndRestoreFocus);
    };
  }, [closeMenu, open]);

  useEffect(() => {
    if (previousDismissSignalRef.current === dismissSignal) return;
    previousDismissSignalRef.current = dismissSignal;
    if (open) closeMenu(true);
  }, [closeMenu, dismissSignal, open]);

  const activate = (action: () => void): void => {
    closeMenu(true);
    action();
  };
  const triggerLabel = text("career.squad.action.openMenu", { player: playerName });

  return (
    <>
      <button
        aria-controls={open ? menuId : undefined}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={triggerLabel}
        className="tls-icon-button tls-squad-row-menu-trigger"
        ref={triggerRef}
        title={triggerLabel}
        type="button"
        onClick={() => open ? closeMenu(true) : openMenu()}
        onKeyDown={(event) => {
          if (open && event.key === "Escape") {
            event.preventDefault();
            closeMenu(true);
            return;
          }
          if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
          event.preventDefault();
          openMenu(event.key === "ArrowUp" ? "last" : "first");
        }}
      >
        <EllipsisVertical aria-hidden="true" size={18} strokeWidth={1.8} />
      </button>
      {open && typeof document !== "undefined"
        ? createPortal(
            <div
              aria-label={triggerLabel}
              className="tls-squad-row-menu"
              data-placement={position.placement}
              id={menuId}
              ref={menuRef}
              role="menu"
              style={{
                left: position.left,
                top: position.top,
                visibility: position.ready ? "visible" : "hidden",
              }}
              onKeyDown={(event) => {
                const menu = menuRef.current;
                if (menu === null) return;
                if (event.key === "Escape") {
                  event.preventDefault();
                  closeMenu(true);
                  return;
                }
                if (event.key === "Tab") {
                  event.preventDefault();
                  focusAdjacentToTrigger(
                    triggerRef.current,
                    menu,
                    event.shiftKey ? -1 : 1,
                  );
                  closeMenu(false);
                  return;
                }
                const items = menuItems(menu);
                if (items.length === 0) return;
                const currentIndex = items.indexOf(document.activeElement as HTMLButtonElement);
                let nextIndex: number | undefined;
                if (event.key === "ArrowDown") nextIndex = (currentIndex + 1) % items.length;
                if (event.key === "ArrowUp") {
                  nextIndex = currentIndex <= 0 ? items.length - 1 : currentIndex - 1;
                }
                if (event.key === "Home") nextIndex = 0;
                if (event.key === "End") nextIndex = items.length - 1;
                if (nextIndex === undefined) return;
                event.preventDefault();
                items[nextIndex]?.focus({ preventScroll: true });
              }}
            >
              <button
                role="menuitem"
                type="button"
                onClick={() => activate(onOpenProfile)}
              >
                <Eye aria-hidden="true" size={17} strokeWidth={1.8} />
                <span>{text("career.squad.action.openProfile")}</span>
              </button>
              {canChooseLineupPosition ? (
                <button
                  role="menuitem"
                  type="button"
                  onClick={() => activate(onChooseLineupPosition)}
                >
                  <Rows3 aria-hidden="true" size={17} strokeWidth={1.8} />
                  <span>{text("career.squad.action.chooseLineupPosition")}</span>
                </button>
              ) : null}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

function menuItems(menu: HTMLElement): HTMLButtonElement[] {
  return [...menu.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not(:disabled)')];
}

/** Returns whether an outside pointer will move focus to a real control itself. */
function isFocusableTarget(target: Node): boolean {
  if (!(target instanceof Element)) return false;
  return target.closest(
    'button, select, input, textarea, a[href], [tabindex]:not([tabindex="-1"])',
  ) !== null;
}

/** Moves Tab focus from the portal menu as if navigation continued from its trigger. */
function focusAdjacentToTrigger(
  trigger: HTMLButtonElement | null,
  menu: HTMLElement,
  direction: -1 | 1,
): void {
  if (trigger === null) return;
  const focusable = [...document.querySelectorAll<HTMLElement>(
    'button:not(:disabled), select:not(:disabled), input:not(:disabled), textarea:not(:disabled), a[href], [tabindex]:not([tabindex="-1"])',
  )].filter((element) => (
    !menu.contains(element)
    && element.getAttribute("aria-hidden") !== "true"
    && !element.closest("[inert]")
    && element.getClientRects().length > 0
  ));
  const triggerIndex = focusable.indexOf(trigger);
  const target = focusable[triggerIndex + direction];
  (target ?? trigger).focus({ preventScroll: true });
}

function positionMenu(trigger: DOMRect, menu: DOMRect): MenuPosition {
  const maximumLeft = Math.max(MENU_VIEWPORT_MARGIN, window.innerWidth - menu.width - MENU_VIEWPORT_MARGIN);
  const left = Math.min(
    Math.max(MENU_VIEWPORT_MARGIN, trigger.right - menu.width),
    maximumLeft,
  );
  const availableBelow = window.innerHeight - trigger.bottom - MENU_TRIGGER_GAP;
  const availableAbove = trigger.top - MENU_TRIGGER_GAP;
  const placement = availableBelow >= menu.height || availableBelow >= availableAbove
    ? "bottom"
    : "top";
  const idealTop = placement === "bottom"
    ? trigger.bottom + MENU_TRIGGER_GAP
    : trigger.top - MENU_TRIGGER_GAP - menu.height;
  const maximumTop = Math.max(MENU_VIEWPORT_MARGIN, window.innerHeight - menu.height - MENU_VIEWPORT_MARGIN);

  return {
    left,
    top: Math.min(Math.max(MENU_VIEWPORT_MARGIN, idealTop), maximumTop),
    placement,
    ready: true,
  };
}
