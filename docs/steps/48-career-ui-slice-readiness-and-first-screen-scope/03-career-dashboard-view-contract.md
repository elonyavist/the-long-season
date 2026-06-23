# 03 - App Entry And Career Dashboard View Contract

## Goal

Introduce structured view contracts for the app entry screen and the first
career screen.

The contracts should be useful to both a future web UI and CLI smoke renderers
where helpful. They should not render text or own gameplay decisions.

## Expected files

- `packages/ui/package.json`
- `packages/ui/tsconfig.json`
- `packages/ui/src/index.ts`
- `packages/ui/src/app/app-entry-view.ts`
- `packages/ui/src/app/app-entry-view.test.ts`
- `packages/ui/src/career/career-dashboard-view.ts`
- `packages/ui/src/career/career-dashboard-view.test.ts`
- Workspace/package/dependency configuration files only if required to add
  `@game/ui` cleanly.
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Add the smallest `@game/ui` package only if Step 01 and Step 02 confirm that
  reusable UI-facing contracts are justified.
- Keep `@game/ui` free from React, browser APIs, storage adapters, and CLI code.
- Define an `AppEntryView` type with structured sections for:
  - new career availability;
  - continue career availability;
  - settings availability;
  - selected language;
  - selected currency;
  - supported language keys;
  - supported currency keys;
  - optional disabled reasons for actions.
- Define a `CareerDashboardView` type with structured sections for:
  - world/career context;
  - selected club;
  - current date and season;
  - next fixture;
  - preparation readiness;
  - squad condition summary;
  - compact table context;
  - recent match context when available;
  - alerts/blockers;
  - available actions.
- Use stable IDs, numeric values, status keys, and translation keys.
- Currency should be represented as structured preference/currency keys, not as
  hardcoded symbols in the view contract.
- Do not store rendered prose in the view contract.
- Add TSDoc to every exported type so a junior developer can understand what UI
  callers may rely on.
- Add focused tests for the contract shape and exported entry point.
- If adding the package requires dependency-boundary changes, keep them minimal
  and aligned with project rules.

## What NOT to implement

- Do not build the dashboard builder yet.
- Do not build an app-entry persistence/settings runtime.
- Do not render CLI output.
- Do not add a web app.
- Do not add React or CSS.
- Do not import `@game/storage`, `apps/*`, or browser APIs into `@game/ui`.
- Do not add hidden transfer recommendations or hidden-potential values.
- Do not add economics, salary, contract, stadium, or ticket-price contracts.
- Do not change career save schema.

## Required checks

- `pnpm --filter @game/ui run typecheck`
- Focused tests for `@game/ui` contract files.
- `pnpm depcruise`
- `pnpm check`
- `git diff --check`

## Definition of Done

- `@game/ui` exists only if it provides a real UI-facing seam.
- The app-entry and dashboard view contracts are presentation-safe and
  localization-ready.
- Package boundaries still pass.
- `docs/PROJECT_STATUS.md` records Step 03 as complete or blocked.
