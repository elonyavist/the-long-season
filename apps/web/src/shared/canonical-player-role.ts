import type { CanonicalPlayerRole } from "@game/ui";

/** Returns the compact Italian-style position code used across football tables. */
export function canonicalPlayerRoleCode(role: CanonicalPlayerRole): string {
  const codes: Readonly<Record<CanonicalPlayerRole, string>> = {
    goalkeeper: "POR",
    right_full_back: "TD",
    center_back: "DC",
    left_full_back: "TS",
    defensive_midfielder: "MED",
    central_midfielder: "CC",
    right_midfielder: "ED",
    left_midfielder: "ES",
    attacking_midfielder: "TRQ",
    right_winger: "AD",
    left_winger: "AS",
    striker: "ATT",
  };
  return codes[role];
}
