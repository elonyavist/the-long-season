import {
  CAREER_STATE_SCHEMA_VERSION,
  createCareerState,
  type CareerState,
  type CreateCareerStateInput,
} from "@game/domain";

/**
 * Input accepted when an Adapter creates a brand-new career.
 *
 * Schema and first-season competitive tiers are owned by the canonical
 * constructor, so CLI and web Adapters cannot publish a stale literal.
 */
export type CreateFreshCareerStateInput = Omit<
  CreateCareerStateInput,
  "schemaVersion" | "clubCompetitiveTierState"
>;

/**
 * Creates a new current-version career with its initial frozen club tiers.
 *
 * Persisted saves must use storage's strict loading seam instead; this helper
 * deliberately exists only for fresh in-memory world composition.
 */
export function createFreshCareerState(
  input: CreateFreshCareerStateInput,
): CareerState {
  return createCareerState({
    ...input,
    schemaVersion: CAREER_STATE_SCHEMA_VERSION,
  });
}
