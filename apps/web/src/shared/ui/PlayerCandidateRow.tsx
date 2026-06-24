import type React from "react";

/** Suitability tones shared by player picker rows and tactical-board menus. */
export type PlayerCandidateSuitabilityTone =
  | "natural"
  | "accomplished"
  | "competent"
  | "unconvincing"
  | "makeshift";

/** Facts rendered by one dense football-manager candidate row. */
export interface PlayerCandidateRowProps {
  /** Shirt number shown as the first visual anchor. */
  readonly number: number;
  /** Compact player surname. */
  readonly surname: string;
  /** Localized broad/current role label. */
  readonly roleLabel: string;
  /** Compact localized fitness text, normally a percentage. */
  readonly fitnessText: string;
  /** Optional localized preferred-foot label. */
  readonly footLabel?: string;
  /** Localized role suitability label. */
  readonly suitabilityLabel: string;
  /** Suitability tone used by CSS for badge color. */
  readonly suitabilityTone: PlayerCandidateSuitabilityTone;
}

/** Renders one reusable candidate row for XI and bench player pickers. */
export function PlayerCandidateRow({
  number,
  surname,
  roleLabel,
  fitnessText,
  footLabel,
  suitabilityLabel,
  suitabilityTone,
}: PlayerCandidateRowProps): React.JSX.Element {
  const accessibleLabel = [number, surname, roleLabel, fitnessText, footLabel, suitabilityLabel]
    .filter((part) => part !== undefined && `${part}`.length > 0)
    .join(" ");

  return (
    <span aria-label={accessibleLabel} className="tls-player-candidate-row" data-suitability={suitabilityTone}>
      <span className="tls-player-candidate-number">{number}</span>
      <span className="tls-player-candidate-main">
        <strong>{surname}</strong>
        <span>{roleLabel}</span>
      </span>
      <span className="tls-player-candidate-meta">
        <span>{fitnessText}</span>
        {footLabel === undefined ? null : <span>{footLabel}</span>}
        <span className="tls-player-candidate-suitability">{suitabilityLabel}</span>
      </span>
    </span>
  );
}
