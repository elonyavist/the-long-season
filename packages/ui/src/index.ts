/**
 * Public UI read-model package surface.
 *
 * This package contains structured, language-agnostic contracts for future UI
 * adapters. It must stay free from React, browser APIs, storage adapters, and
 * CLI rendering code.
 */
/**
 * Deliberate domain-contract re-export.
 *
 * `apps/web` may not import `@game/domain` directly, but every read model here
 * already types player roles with this canonical union. Re-exporting it once
 * lets web-layer presentation helpers (role codes, filters) stay dependency-
 * rule compliant without duplicating the type.
 */
export type { CanonicalPlayerRole } from "@game/domain";
export * from "./app/app-entry-actions.ts";
export * from "./app/app-entry-view.ts";
export * from "./career/build-career-dashboard-view.ts";
export * from "./career/career-dashboard-actions.ts";
export * from "./career/career-dashboard-view.ts";
export * from "./career/career-inbox-view.ts";
export * from "./career/career-market-target-view.ts";
export * from "./career/career-market-view.ts";
export * from "./career/career-contract-view.ts";
export * from "./career/career-match-preparation-view.ts";
export * from "./career/career-matchday-phase-view.ts";
export * from "./career/career-matchday-view.ts";
export * from "./career/career-player-detail-view.ts";
export * from "./career/career-player-profile-view.ts";
export * from "./career/career-player-rating.ts";
export * from "./career/career-player-statistics-view.ts";
export * from "./career/career-shell-view.ts";
export * from "./career/career-squad-view.ts";
export * from "./career/career-contract-expiry.ts";
