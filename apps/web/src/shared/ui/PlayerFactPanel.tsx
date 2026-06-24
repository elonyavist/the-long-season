import type React from "react";

import type { Translator } from "@game/i18n";

import {
  formatFitness,
  formatFoot,
  formatOptionalNumber,
  roleLabelKey,
  squadStatusLabelKey,
} from "../lib/match-preparation-labels";
import type { SquadSelectionRow } from "./SquadSelectionTable";

/** Props for the reusable compact selected-player fact panel. */
export interface PlayerFactPanelProps {
  /** Focused player row, or absent when no player can be shown. */
  readonly row?: SquadSelectionRow | undefined;
  /** Localized text lookup. */
  readonly text: Translator;
}

/** Renders compact facts for the focused player in tactical squad surfaces. */
export function PlayerFactPanel({ row, text }: PlayerFactPanelProps): React.JSX.Element {
  return (
    <section className="tls-preparation-player-detail" aria-labelledby="match-preparation-player-detail-title">
      <h3 id="match-preparation-player-detail-title">{text("career.matchPreparation.playerDetail")}</h3>
      {row === undefined ? (
        <p>{text("common.unknown")}</p>
      ) : (
        <>
          <strong>{row.player.name}</strong>
          <dl>
            <div>
              <dt>{text("career.matchPreparation.column.role")}</dt>
              <dd>{text(roleLabelKey(row.player.roleKey))}</dd>
            </div>
            <div>
              <dt>{text("career.matchPreparation.column.age")}</dt>
              <dd>{formatOptionalNumber(row.age, text)}</dd>
            </div>
            <div>
              <dt>{text("career.matchPreparation.column.fitness")}</dt>
              <dd>{formatFitness(row.player.fitness, text)}</dd>
            </div>
            <div>
              <dt>{text("career.matchPreparation.column.foot")}</dt>
              <dd>{formatFoot(row.foot, text)}</dd>
            </div>
            <div>
              <dt>{text("career.matchPreparation.column.status")}</dt>
              <dd>{text(squadStatusLabelKey(row.status))}</dd>
            </div>
          </dl>
        </>
      )}
    </section>
  );
}
