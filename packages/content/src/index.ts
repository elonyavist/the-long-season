/**
 * Public entrypoint for base content, generators, and validators.
 *
 * Content must describe data and generation helpers, not engine rules. The
 * first concrete exports provide fake deterministic data for the CLI-only
 * season simulation milestone.
 */
export * from "./generators/fake-clubs.ts";
export * from "./generators/fake-players.ts";
export * from "./generators/league-system.ts";
export * from "./balance/calibration-targets.ts";
