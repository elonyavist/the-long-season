import { useState, type ReactNode } from "react";

import {
  TacticalBenchBoard,
  type TacticalBenchBoardProps,
} from "./TacticalBenchBoard";
import {
  TacticalBoardPitch,
  type TacticalBoardPitchProps,
} from "./TacticalBoardPitch";

type CoordinatedPitchProps = Omit<TacticalBoardPitchProps, "dropActive" | "onDragActiveChange">;
type CoordinatedBenchProps = Omit<TacticalBenchBoardProps, "dropActive" | "onDragActiveChange">;

/** Props for the shared pitch-and-bench composition used across football workflows. */
export interface TacticalBoardWorkspaceProps {
  readonly pitch: CoordinatedPitchProps;
  readonly bench: CoordinatedBenchProps;
  /** Optional context-specific content rendered beneath the shared bench. */
  readonly sideFooter?: ReactNode;
}

/**
 * Places pitch and bench next to each other and coordinates cross-surface drag
 * feedback. Match rules remain in the caller; layout and pointer UX stay shared.
 */
export function TacticalBoardWorkspace({
  pitch,
  bench,
  sideFooter,
}: TacticalBoardWorkspaceProps): React.JSX.Element {
  const [dragSource, setDragSource] = useState<"pitch" | "bench">();

  return (
    <div className="tls-tactical-workspace-grid">
      <TacticalBoardPitch
        {...pitch}
        dropActive={dragSource === "bench"}
        onDragActiveChange={(active) => setDragSource(active ? "pitch" : undefined)}
      />
      <div className="tls-tactical-workspace-side">
        <TacticalBenchBoard
          {...bench}
          dropActive={dragSource === "pitch"}
          onDragActiveChange={(active) => setDragSource(active ? "bench" : undefined)}
        />
        {sideFooter}
      </div>
    </div>
  );
}
