# Web App Shell Scope Review

Date: 2026-06-23
Phase: `49-web-app-shell-main-menu-and-career-dashboard-prototype`
Step: `01-phase-48-output-and-web-scope-review`
Status: Ready for web scaffolding

## Decision

Phase 49 can start with a narrow Vite React app shell.

The first web flow is:

1. Open the game.
2. See the main menu / app-entry screen.
3. Change language and currency display preferences.
4. Start a deterministic demo career or continue the in-memory demo career.
5. Land on the career dashboard / matchday hub.

This is an app prototype, not a marketing page. It must consume structured
`@game/ui` contracts and localize visible labels through `@game/i18n`.

## Package-Boundary Decision

`apps/web` must be allowed to import `@game/i18n` directly.

Reason: the web app is an outer presentation adapter. It needs translated labels
for buttons, settings, section headings, statuses, and action text. This does
not create a gameplay dependency because `@game/i18n` is presentation data only
and must stay dependency-free.

`@game/ui` must stay isolated. It owns language-agnostic read models and action
contracts, but it must not import React, browser APIs, CLI output, engine,
content, storage, or localization prose.

## Executable Rule Changes

The project rules and dependency-cruiser graph should reflect the implemented
Phase 48 direction before `apps/web` is added:

- `ui -> nothing`;
- `apps/cli -> ... i18n, ui ...`;
- `apps/web -> ... i18n, ui ...`;
- engine must also be explicitly blocked from importing `@game/ui`;
- web must not import `@game/domain` directly.

These are boundary clarifications. They do not add gameplay behavior.

## Web Prototype Consumes From `@game/ui`

The first prototype should consume:

- `AppEntryView`;
- app-entry action availability/result contracts;
- `CareerDashboardView`;
- career-dashboard action availability/result contracts;
- `buildCareerDashboardView` or a web-owned deterministic adapter around it.

The web app must not parse CLI prose and must not duplicate dashboard readiness
rules in JSX.

## Intentionally Out Of Scope

- No save browser.
- No IndexedDB, SQLite WASM, Web Worker, Comlink, Tauri, or desktop shell.
- No durable browser persistence beyond the step-approved prototype state.
- No engine, content, storage, or UI read-model behavior changes in this step.
- No market, squad, lineup, tactic, match, youth, economics, salary, contract,
  stadium, ticket-price, or long-run report UI.
- No transfer advice, squad-needs advice, or hidden recommendations.
- No Phase 50 documents.

## Verification

Run after this step:

- `test -f docs/audits/WEB_APP_SHELL_SCOPE_REVIEW.md`
- `pnpm depcruise`
- `pnpm check`
- `git diff --check`
