/**
 * Stable profile keys supported by the deterministic `simulate-season` CLI.
 *
 * Keeping the keys in one Module gives parsing, demo builders, and tests one
 * small Interface for the supported demo profiles.
 */

/** Fixed seed used when the user does not pass `--seed`. */
export const DEFAULT_SIMULATE_SEASON_SEED = "demo-001";

/** Balanced deterministic PRO01 setup-demo profile. */
export const DEMO_SETUP_PROFILE_PRO01_BALANCED = "pro01-balanced";

/** Attacking deterministic PRO01 setup-demo profile. */
export const DEMO_SETUP_PROFILE_PRO01_ATTACKING = "pro01-attacking";

/** Defensive deterministic PRO01 setup-demo profile. */
export const DEMO_SETUP_PROFILE_PRO01_DEFENSIVE = "pro01-defensive";

/** Deterministic condition demo for the first generated club's fixed season. */
export const CONDITION_DEMO_PROFILE_PRO01_SEASON = "pro01-season";

/** First-team deterministic PRO01 lineup profile. */
export const LINEUP_DEMO_PROFILE_PRO01_FIRST_TEAM = "pro01-first-team";

/** Rotated deterministic PRO01 lineup profile with selected reserves. */
export const LINEUP_DEMO_PROFILE_PRO01_ROTATED = "pro01-rotated";

/** Ordered deterministic setup-demo profiles supported by the CLI MVP. */
export const SUPPORTED_DEMO_SETUP_PROFILES = [
  DEMO_SETUP_PROFILE_PRO01_BALANCED,
  DEMO_SETUP_PROFILE_PRO01_ATTACKING,
  DEMO_SETUP_PROFILE_PRO01_DEFENSIVE,
] as const;

/** Ordered deterministic condition-demo profiles supported by the CLI MVP. */
export const SUPPORTED_CONDITION_DEMO_PROFILES = [CONDITION_DEMO_PROFILE_PRO01_SEASON] as const;

/** Ordered deterministic lineup-demo profiles supported by the CLI MVP. */
export const SUPPORTED_LINEUP_DEMO_PROFILES = [
  LINEUP_DEMO_PROFILE_PRO01_FIRST_TEAM,
  LINEUP_DEMO_PROFILE_PRO01_ROTATED,
] as const;

/** Supported deterministic setup-demo profile keys. */
export type SetupDemoProfileKey = (typeof SUPPORTED_DEMO_SETUP_PROFILES)[number];

/** Supported deterministic condition-demo profile keys. */
export type ConditionDemoProfileKey = (typeof SUPPORTED_CONDITION_DEMO_PROFILES)[number];

/** Supported deterministic lineup-demo profile keys. */
export type LineupDemoProfileKey = (typeof SUPPORTED_LINEUP_DEMO_PROFILES)[number];
