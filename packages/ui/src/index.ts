/**
 * Public UI read-model package surface.
 *
 * This package contains structured, language-agnostic contracts for future UI
 * adapters. It must stay free from React, browser APIs, storage adapters, and
 * CLI rendering code.
 */
export * from "./app/app-entry-actions.ts";
export * from "./app/app-entry-view.ts";
export * from "./career/build-career-dashboard-view.ts";
export * from "./career/career-dashboard-actions.ts";
export * from "./career/career-dashboard-view.ts";
export * from "./career/career-inbox-view.ts";
export * from "./career/career-contract-view.ts";
export * from "./career/career-match-preparation-view.ts";
export * from "./career/career-matchday-phase-view.ts";
export * from "./career/career-matchday-view.ts";
export * from "./career/career-player-profile-view.ts";
export * from "./career/career-shell-view.ts";
export * from "./career/career-squad-view.ts";
