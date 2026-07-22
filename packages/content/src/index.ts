/**
 * Public entrypoint for base content, generators, and validators.
 *
 * Content must describe data and generation helpers, not engine rules. The
 * first concrete exports provide fake deterministic data for the CLI-only
 * season simulation milestone.
 */
export * from "./generators/fake-clubs.ts";
export * from "./generators/fake-players.ts";
export * from "./generators/career-intake-players.ts";
export * from "./generators/generated-player-factory.ts";
export * from "./generators/initial-youth-academies.ts";
export * from "./generators/league-system.ts";
export * from "./generators/player-generation-bands.ts";
export * from "./generators/player-potential-rarity.ts";
export * from "./generators/player-rarity-budget.ts";
export * from "./generators/player-role-identity.ts";
export * from "./generators/player-role-templates.ts";
export * from "./generators/player-archetypes.ts";
export * from "./generators/player-current-ability-bands.ts";
export * from "./generators/player-current-profile-policy.ts";
export * from "./generators/player-potential-allocation.ts";
export * from "./generators/senior-squad-world.ts";
export * from "./generators/club-finance-world.ts";
export * from "./generators/youth-development-level.ts";
export * from "./clubs/club-identity-source-data.ts";
export * from "./identity/name-cultures.ts";
export * from "./identity/nationality-distribution.ts";
export * from "./identity/flag-assets.ts";
export * from "./balance/calibration-targets.ts";
