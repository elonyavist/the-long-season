# Web App Shell Prototype Report

Date: 2026-06-23
Phase: `49-web-app-shell-main-menu-and-career-dashboard-prototype`
Status: Complete

## What Was Built

Phase 49 added the first web prototype:

- `apps/web` Vite React TypeScript workspace.
- Localized in-memory language and currency preferences.
- Premium-retro CSS foundation.
- Main menu / app-entry screen.
- New career and continue career prototype flow.
- Deterministic read-only dashboard demo adapter.
- Career dashboard / matchday hub screen.

The app opens to a real game shell, not a marketing page.

## Web Flow

Current flow:

1. User opens the app.
2. App shows main menu.
3. User can change language and currency display preference.
4. `Continue career` is unavailable until a demo career exists.
5. `New career` creates the in-memory demo state and opens the dashboard.
6. `Continue career` opens the same deterministic demo dashboard once available.
7. Dashboard can return to the main menu.

No browser save is written.

## Package Direction

The web app is an outer adapter:

- `apps/web -> @game/i18n`
- `apps/web -> @game/ui`
- `apps/web -> @game/shared`

`apps/web` does not import `@game/domain` directly and does not parse CLI output.
`@game/ui` remains language-agnostic and framework-free.

## Dashboard Data Source

The dashboard uses `buildCareerDashboardView` from `@game/ui`.

`apps/web/src/career/build-demo-career-dashboard.ts` owns only explicit demo
facts:

- save context;
- selected club;
- next fixture;
- missing lineup/tactic preparation;
- condition summary;
- table context;
- recent match context;
- action availability and blockers.

This file is the future replacement point for a real save adapter.

## Visual QA

Implemented visual direction:

- dark clubhouse chrome;
- paper/gold manager UI accents;
- compact panels;
- dense controls;
- small radii;
- no viewport-width font scaling;
- no negative letter spacing;
- no marketing hero;
- no decorative orb/bokeh treatment.

Runtime QA:

- Local Vite server started on `http://127.0.0.1:5173/`.
- HMR exposed one real React issue in the preference select handlers.
- The issue was fixed by capturing select values before functional state
  updates.
- After the dashboard update, the dev server reported no new runtime errors.

Automated screenshot QA was not completed because the local Playwright package
does not have a browser executable installed in this environment. Manual visual
inspection by the user should still review desktop and narrow viewport.

## Product Issues Found

- The dashboard is useful as a first read-only hub, but it is intentionally not
  playable yet because match preparation screens do not exist.
- `Continue career` is prototype-only and in-memory.
- The visual foundation is credible enough for the first slice, but a later art
  phase should add logo, crests, theme assets, and stronger retro typography.

No engine, market, economics, or save blocker was found for this prototype.

## Intentionally Out Of Scope

- Real save browser.
- Browser persistence.
- Fixture advancement from web.
- Squad detail screen.
- Tactic editor.
- Lineup editor.
- Match viewer.
- Market UI.
- Youth academy UI.
- Economics, contracts, salaries, stadiums, ticket prices, sponsorships, or
  balance-sheet simulation.
- Long-run report UI.
- Hidden transfer advice or squad-needs recommendations.

## Verification

- `test -f docs/audits/WEB_APP_SHELL_PROTOTYPE_REPORT.md`
- `pnpm --filter @game/web run typecheck`
- `pnpm --filter @game/web run test`
- `pnpm --filter @game/web run build`
- `pnpm depcruise`
- `pnpm check`
- `git diff --check`
- Local dev server smoke on `http://127.0.0.1:5173/`

## Recommended Next Phase

Exactly one recommended next phase:

`Phase 50 - Web Match Preparation Slice`

Reason: the dashboard now clearly blocks match advancement on missing lineup and
tactic. The next useful UI slice is not more chrome; it is giving the manager a
minimal way to inspect the selected squad, choose a saved lineup/tactic for the
next fixture, and return to the dashboard with blockers cleared.

This should still avoid full squad management, real persistence complexity,
market UI, economics, and match playback.
