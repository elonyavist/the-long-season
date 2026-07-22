import type React from "react";

import {
  CareerMatchPreparationScreen,
  type CareerMatchPreparationScreenProps,
} from "../match-preparation/CareerMatchPreparationScreen";

/**
 * Presents the canonical current team plan as a persistent Tactics route.
 *
 * The wrapper deliberately reuses the preparation workspace so Squad,
 * Tactics, pre-match, and Matchday never drift into separate board states.
 */
export function CareerTacticsScreen(
  props: Omit<CareerMatchPreparationScreenProps, "workspaceMode" | "onSavePreparation">,
): React.JSX.Element {
  return <CareerMatchPreparationScreen {...props} workspaceMode="tactics" />;
}
