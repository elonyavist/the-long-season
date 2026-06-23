# Phase 49 - Web App Shell, Main Menu, And Career Dashboard Prototype

## Goal

Build the first usable web prototype for the career experience.

This phase should prove the real first user flow:

1. Open the game.
2. See a functional main menu.
3. Choose language/currency settings.
4. Start or continue a demo career.
5. Land on the career dashboard/matchday hub.

The web app must consume structured contracts from `@game/ui`. It must not parse
CLI prose and must not add new gameplay rules.

## Product intent

- Start from an actual app shell, not a landing page.
- Make the first screen feel like a premium retro football manager.
- Keep the first slice narrow but usable:
  - New career;
  - Continue career;
  - Settings;
  - Career dashboard.
- Show the same career readiness facts already proven by
  `pnpm cli career --save=<saveId> --dashboard`.
- Keep the manager in control. No automatic transfer advice, squad-needs advice,
  hidden recommendations, or tactical automation.
- Keep every visible label localizable in the five supported languages.
- Treat currency as a display preference only. Do not implement economics.

## Architecture intent

- Add `apps/web` as an outer adapter.
- Use Vite + React as the smallest practical web shell.
- Keep `@game/ui` as the read-model boundary.
- Keep engine/content/storage free from browser, React, and visual concerns.
- Keep app-shell state simple and explicit. No IndexedDB, SQLite WASM, Web
  Worker, server sync, authentication, or desktop shell in this phase.
- Prefer view-model adapters over direct component access to career internals.
- Add a small premium-retro visual foundation, not a complete design system.

## Ordered steps

1. `01-phase-48-output-and-web-scope-review.md`
2. `02-web-workspace-scaffold-and-boundary-rules.md`
3. `03-web-localization-and-preferences-foundation.md`
4. `04-retro-premium-visual-foundation.md`
5. `05-main-menu-app-entry-screen.md`
6. `06-career-dashboard-demo-adapter.md`
7. `07-career-dashboard-screen-prototype.md`
8. `08-web-prototype-qa-and-next-phase-report.md`

## Phase-level checks

- Focused tests for every touched package/app module.
- `pnpm --filter @game/web run typecheck`
- `pnpm --filter @game/web run test` when web tests exist.
- `pnpm --filter @game/web run build`
- `pnpm depcruise`
- `pnpm check`
- Run the web app locally and manually inspect:
  - main menu;
  - settings language/currency controls;
  - new/continue career path;
  - career dashboard;
  - desktop viewport;
  - narrow viewport.
- `git diff --check`

## What NOT to implement in this phase

- No full career save browser.
- No IndexedDB, SQLite WASM, Web Worker, Comlink, Tauri, or desktop shell.
- No real persistence beyond a simple in-memory/local prototype choice
  documented by the active step.
- No engine changes.
- No market UI.
- No full squad screen.
- No full tactic editor.
- No full lineup editor.
- No match viewer.
- No youth academy UI.
- No economics implementation.
- No player contracts, salaries, stadiums, ticket prices, sponsorships, or club
  balance-sheet simulation.
- No long-run report UI.
- No hidden recommendations about transfers or squad needs.
- No hardcoded visible labels.
- No generic marketing hero page.
- No decorative card-heavy landing page.

## Definition of Done

- `apps/web` exists and respects the package boundary.
- The app opens to a usable main menu.
- Language and currency preferences are visible and bounded.
- The career dashboard renders from structured `@game/ui` view data.
- The dashboard shows next fixture, preparation readiness, condition, actions,
  and blockers.
- The prototype has a first premium-retro visual direction.
- The phase report recommends exactly one next phase.
- `docs/PROJECT_STATUS.md` records verification and next action.
