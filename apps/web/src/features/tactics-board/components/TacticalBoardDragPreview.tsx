import { createPortal } from "react-dom";

import type { TacticalBoardRoleCode } from "../tactical-board-types";

/** Props for the shared pointer-following player preview used across drag surfaces. */
export interface TacticalBoardDragPreviewProps {
  readonly clientX: number;
  readonly clientY: number;
  readonly number: number;
  readonly surname: string;
  readonly role: TacticalBoardRoleCode;
}

/**
 * Keeps a dragged player visible while the pointer crosses the SVG/HTML
 * boundary. The preview is presentational; the workspace still owns the drop.
 */
export function TacticalBoardDragPreview({
  clientX,
  clientY,
  number,
  surname,
  role,
}: TacticalBoardDragPreviewProps): React.JSX.Element | null {
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      aria-hidden="true"
      className="tls-tactical-drag-preview"
      style={{ left: clientX, top: clientY }}
    >
      <strong>{number}</strong>
      <span>{surname}</span>
      <small>{role}</small>
    </div>,
    document.body,
  );
}
