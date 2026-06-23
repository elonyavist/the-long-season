# Career UI Slice Readiness Report

Date: 2026-06-23
Phase: `48-career-ui-slice-readiness-and-first-screen-scope`
Status: Ready for the first web app shell phase

## Decision

Phase 48 is complete enough to start the first web app shell.

The next phase should be exactly:

`Phase 49 - Web App Shell, Main Menu, And Career Dashboard Prototype`

The project now has structured UI-facing contracts for the app entry screen and
the first post-load career dashboard. The future web UI can consume those
contracts without parsing CLI prose, importing engine internals, or inventing a
parallel dashboard model.

## What Phase 48 Changed

Phase 48 clarified that the real first app screen is not the career dashboard.
The app should open on a main-menu/app-entry screen with:

- New career.
- Continue career.
- Settings.
- Language preference.
- Currency preference.

The first screen after loading or creating a save is the career dashboard /
matchday hub. It should show:

- career context;
- selected club;
- next selected-club fixture;
- saved lineup/tactic readiness;
- selected-club condition summary;
- compact table context when meaningful;
- recent match context;
- available actions;
- blockers that explain why the next match cannot be advanced.

## Source Boundaries Added

`packages/ui` now owns language-agnostic UI read models:

- `AppEntryView`;
- app-entry action availability/result contracts;
- `CareerDashboardView`;
- career-dashboard action availability/result contracts;
- `buildCareerDashboardView`.

The package intentionally has no React, browser API, storage, engine, content,
CLI, or i18n dependency. It stores stable IDs, status keys, numeric facts,
display names already present in saves/content, and translation keys.

`apps/cli` now has a narrow smoke adapter:

- `pnpm cli career --save=<saveId> --dashboard`

This command loads a save, adapts it into the shared dashboard builder, and
renders a localized smoke output. It is read-only and does not duplicate
dashboard readiness logic in the renderer.

## Dependency Direction

Current direction after Phase 48:

- `@game/ui` imports no project package.
- `apps/cli` may import `@game/ui` only for read-model smoke output.
- Future `apps/web` should import `@game/ui` for view contracts/builders.
- `@game/domain`, `@game/engine`, `@game/content`, `@game/storage`,
  `@game/simulation-tools`, and `@game/i18n` must not import `@game/ui`.

This keeps the UI package open to new screens while closed to gameplay,
storage, and rendering concerns.

## Future Web UI Can Consume

The future web UI can consume these structured facts directly:

- app-entry language and currency options;
- app-entry action availability;
- career dashboard save/world/date/season context;
- selected club name and roster size;
- next fixture IDs, date, round, clubs, and selected side;
- saved lineup/tactic status;
- preparation blockers;
- condition summary numbers;
- table context when at least one selected-club fixture has been played;
- recent selected-club match context;
- action availability and blocker keys.

The web UI must still localize labels through `@game/i18n` or a web adapter over
the same label keys. It must not parse the CLI dashboard output.

## Intentionally Out Of Scope

These remain outside Phase 48:

- React/web app implementation.
- Visual design system.
- Desktop/Tauri shell.
- Browser storage, IndexedDB, SQLite WASM, Web Workers, or Comlink.
- Full squad screen.
- Full lineup editor.
- Full tactic editor.
- Match viewer.
- Transfer market UI.
- Youth academy UI.
- Finance/economics implementation.
- Player contracts.
- Salaries.
- Stadiums.
- Ticket prices.
- Club balance-sheet simulation.
- Match engine tuning.
- Player generation tuning.
- Long-run report expansion.

Currency is only represented as an app setting/readiness concern. It is not yet
connected to economics because economics is not implemented.

## Risks Carried Forward

- The first web phase must build a usable app shell, not another CLI report.
- The main menu needs real user flow decisions, but persistence for app
  settings can start simple.
- Career dashboard data is ready, but full squad/tactic/lineup interactions are
  still separate future screens.
- Visual identity is important for the product, but the first prototype should
  prove layout and data flow before a deep art-system phase.

None of these risks blocks Phase 49.

## Verification

- `pnpm --filter @game/ui run typecheck`
- `pnpm --filter @game/cli run typecheck`
- `pnpm --filter @game/i18n run typecheck`
- Focused i18n/UI/career CLI tests
- `pnpm check`
- `pnpm cli career --save=phase48-check --seed=world-a --new-world-preview`
- `pnpm cli career --save=phase48-check --dashboard`
- `git diff --check`
