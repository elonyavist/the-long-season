import { GENERATED_SQUAD_IDENTITY_KEYS } from "@game/content";

/** The frozen Step 06A opening-population thresholds, owned in one place. */
export const LEAGUE_DIVERSITY_OPENING_TARGETS = {
  requiredPrimaryRoleCount: 10,
  minimumDistinctFormationCount: 6,
  minimumReplicatedFormationCount: 4,
  maximumTopFormationShare: 0.30,
  minimumDistinctIdentityModalFormationCount: 6,
  maximumCatalogOrderSensitiveSelectionCount: 0,
  maximumAvoidableOutOfPositionSlotCount: 0,
} as const;

/** Minimum facts needed by the frozen per-competition opening gate. */
export interface LeagueDiversityOpeningGateRow {
  readonly worldSeed: string;
  readonly competitionId: string;
  readonly clubCount: number;
  readonly identityCounts: Readonly<Record<string, number>>;
  readonly identityMismatchCount: number;
  readonly primaryRolePositiveCount: number;
  readonly distinctFormationCount: number;
  readonly replicatedFormationCount: number;
  readonly topFormationShare: number;
  readonly distinctIdentityModalFormationCount: number;
  readonly catalogOrderSensitiveSelectionCount: number;
  readonly avoidableOutOfPositionSlotCount: number;
}

/** One row's complete verdict; failed keys make a red locally explainable. */
export interface LeagueDiversityOpeningGateVerdict {
  readonly worldSeed: string;
  readonly competitionId: string;
  readonly held: boolean;
  readonly failedGateKeys: readonly string[];
}

/**
 * Evaluates the Step 06A table without pooling competitions.
 *
 * L1 and B2 intentionally read this same function. A second threshold table
 * would let a tactical checkpoint call a league healthy after the longitudinal
 * report rejected the identical opening population.
 */
export function evaluateLeagueDiversityOpeningGate(
  row: LeagueDiversityOpeningGateRow,
): LeagueDiversityOpeningGateVerdict {
  const targets = LEAGUE_DIVERSITY_OPENING_TARGETS;
  const minimumIdentityCount = Math.floor(row.clubCount / GENERATED_SQUAD_IDENTITY_KEYS.length);
  const maximumIdentityCount = Math.ceil(row.clubCount / GENERATED_SQUAD_IDENTITY_KEYS.length);
  const identityCounts = GENERATED_SQUAD_IDENTITY_KEYS.map((key) => row.identityCounts[key] ?? 0);
  const failedGateKeys = row.clubCount < GENERATED_SQUAD_IDENTITY_KEYS.length
    ? []
    : [
        ...(identityCounts.every((count) =>
          count >= minimumIdentityCount && count <= maximumIdentityCount && count > 0)
          ? [] : ["identity_distribution"]),
        ...(row.identityMismatchCount === 0 ? [] : ["identity_join"]),
        ...(row.primaryRolePositiveCount === targets.requiredPrimaryRoleCount
          ? [] : ["primary_role_coverage"]),
        ...(row.distinctFormationCount >= targets.minimumDistinctFormationCount
          ? [] : ["formation_diversity"]),
        ...(row.replicatedFormationCount >= targets.minimumReplicatedFormationCount
          ? [] : ["formation_replication"]),
        ...(row.topFormationShare <= targets.maximumTopFormationShare
          ? [] : ["top_formation_share"]),
        ...(row.distinctIdentityModalFormationCount
          >= targets.minimumDistinctIdentityModalFormationCount
          ? [] : ["identity_modal_diversity"]),
        ...(row.catalogOrderSensitiveSelectionCount
          <= targets.maximumCatalogOrderSensitiveSelectionCount
          ? [] : ["catalog_order_sensitivity"]),
        ...(row.avoidableOutOfPositionSlotCount
          <= targets.maximumAvoidableOutOfPositionSlotCount
          ? [] : ["avoidable_out_of_position"]),
      ];

  return {
    worldSeed: row.worldSeed,
    competitionId: row.competitionId,
    held: failedGateKeys.length === 0,
    failedGateKeys,
  };
}
