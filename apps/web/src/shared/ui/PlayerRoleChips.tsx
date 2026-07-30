/** One compact, already-localized natural or adapted player role. */
export interface PlayerRoleChipItem {
  /** Stable canonical role identifier. */
  readonly roleId: string;
  /** Canonical short position code used as the compact visual anchor. */
  readonly code: string;
  /** Localized role name. */
  readonly label: string;
  /** Public role suitability allowed by the profile contract. */
  readonly suitability: "natural" | "adapted";
  /** Localized suitability label. */
  readonly suitabilityLabel: string;
  /** Whether this is the player's primary identity role. */
  readonly isPrimary: boolean;
}

/** Props for the presentation-only compact role list. */
export interface PlayerRoleChipsProps {
  /** Localized accessible name for the role list. */
  readonly ariaLabel: string;
  /** Natural and adapted roles in canonical display order. */
  readonly roles: readonly PlayerRoleChipItem[];
}

/** Renders only the small role facts supplied by the framework-free view model. */
export function PlayerRoleChips({
  ariaLabel,
  roles,
}: PlayerRoleChipsProps): React.JSX.Element {
  return (
    <ul aria-label={ariaLabel} className="tls-player-role-chips">
      {roles.map((role) => (
        <li
          className="tls-player-role-chip"
          data-primary={role.isPrimary ? "true" : undefined}
          data-suitability={role.suitability}
          key={role.roleId}
        >
          <strong className="tls-player-role-chip-code">{role.code}</strong>
          <span className="tls-player-role-chip-name">{role.label}</span>
          <span className="tls-player-role-chip-suitability">
            {role.suitabilityLabel}
          </span>
        </li>
      ))}
    </ul>
  );
}
