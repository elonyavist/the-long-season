import React, { forwardRef, useLayoutEffect, useRef, useState } from "react";

const POPOVER_EDGE_GAP_PX = 8;
const POPOVER_ANCHOR_GAP_PX = 12;

interface TacticalBoardPopoverPosition {
  readonly left: number;
  readonly top: number;
}

/** Props for a tactical popover kept close to a normalized point and inside the visible field. */
export interface TacticalBoardAnchoredPopoverProps {
  readonly anchorNx: number;
  readonly anchorNy: number;
  readonly children: React.ReactNode;
  readonly containerRef: React.RefObject<HTMLDivElement | null>;
  readonly variant: "menu" | "adaptation";
}

/** Positions tactical menus from their rendered size instead of assuming fixed panel dimensions. */
export const TacticalBoardAnchoredPopover = forwardRef<
  HTMLDivElement,
  TacticalBoardAnchoredPopoverProps
>(function TacticalBoardAnchoredPopover({
  anchorNx,
  anchorNy,
  children,
  containerRef,
  variant,
}, forwardedRef): React.JSX.Element {
  const localRef = useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState<TacticalBoardPopoverPosition>();

  useLayoutEffect(() => {
    const container = containerRef.current;
    const popover = localRef.current;
    if (container === null || popover === null) return undefined;

    const placePopover = (): void => {
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      const popoverWidth = popover.offsetWidth;
      const popoverHeight = popover.offsetHeight;
      const anchorX = anchorNx * containerWidth;
      const anchorY = anchorNy * containerHeight;

      const availableRight = containerWidth - anchorX;
      const preferredLeft = availableRight >= popoverWidth + POPOVER_ANCHOR_GAP_PX
        ? anchorX + POPOVER_ANCHOR_GAP_PX
        : anchorX - popoverWidth - POPOVER_ANCHOR_GAP_PX;
      const availableBelow = containerHeight - anchorY;
      const preferredTop = availableBelow >= popoverHeight
        ? anchorY - POPOVER_ANCHOR_GAP_PX
        : anchorY - popoverHeight + POPOVER_ANCHOR_GAP_PX;

      setPosition({
        left: clampPopoverOffset(preferredLeft, containerWidth, popoverWidth),
        top: clampPopoverOffset(preferredTop, containerHeight, popoverHeight),
      });
    };

    placePopover();
    if (typeof ResizeObserver === "undefined") return undefined;

    const resizeObserver = new ResizeObserver(placePopover);
    resizeObserver.observe(container);
    resizeObserver.observe(popover);
    return () => resizeObserver.disconnect();
  }, [anchorNx, anchorNy, containerRef]);

  return (
    <div
      className="tls-tactical-board-menu-popover"
      data-positioned={position === undefined ? "false" : "true"}
      data-variant={variant}
      ref={(element) => {
        localRef.current = element;
        if (typeof forwardedRef === "function") forwardedRef(element);
        else if (forwardedRef !== null) forwardedRef.current = element;
      }}
      style={position === undefined ? undefined : position}
    >
      {children}
    </div>
  );
});

function clampPopoverOffset(preferred: number, containerSize: number, popoverSize: number): number {
  const maximum = Math.max(POPOVER_EDGE_GAP_PX, containerSize - popoverSize - POPOVER_EDGE_GAP_PX);
  return Math.min(maximum, Math.max(POPOVER_EDGE_GAP_PX, preferred));
}
