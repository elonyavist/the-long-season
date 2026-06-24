# Phase 55 - Web Architecture State And Styling Foundation

## Goal

Rework the web app foundation before adding more career sections.

The current web app works, but Phase 52-54 added enough behavior that the app is
starting to show architectural pressure:

- too much orchestration in `App.tsx`;
- career demo state spread across screen-level wiring;
- broad folders such as `components`, `screens`, and `career` without an
  explicit feature ownership model;
- a large hand-written CSS surface that will become hard to control as more
  screens arrive;
- future Inbox, Squad, Calendar, Market, Finance, Youth, Staff, and Archive
  sections would multiply this pressure if built now.

This phase must create a clean, readable, maintainable web foundation without
regressing the existing playable prototype.

## Product Intent

The web UI should keep the retro football-management identity, but the code
should feel boring and easy to follow for a junior developer:

1. app starts in one obvious place;
2. routing/screen state is explicit;
3. career prototype state lives in a real state Module, not scattered React
   state;
4. shared UI pieces live in predictable folders;
5. feature-specific code lives near the feature;
6. common styling uses Tailwind utilities and small reusable primitives instead
   of hundreds of local CSS classes;
7. bespoke CSS remains only for genuinely custom football surfaces such as the
   tactical pitch, retro theme tokens, and layout details that Tailwind cannot
   express cleanly.

## Architecture Decision

Adopt a pragmatic feature-first web structure:

```text
apps/web/src/
  app/                  app bootstrap, providers, preferences, translation
  shared/               reusable browser UI Modules and small utilities
    ui/                 generic visual primitives
    layout/             shell/layout Modules used across features
    lib/                browser-only helpers
  features/
    app-entry/          main menu/start settings slice
    career-shell/       top navigation, left Inbox rail, content outlet
    dashboard/          dashboard screen and presenter
    match-preparation/  tactical workspace feature
  stores/               Zustand store Modules and selectors
  styles/               Tailwind entry, theme tokens, rare custom CSS
  visual-qa/            Playwright browser QA scripts
```

This is not a hard enterprise layering model. It is a small, explicit map:

- `features/*` own feature-specific screens and adapters.
- `shared/*` owns reusable Modules used by at least two feature areas.
- `stores/*` owns client state seams.
- `packages/ui` remains the framework-free read-model source.
- `apps/web` remains the browser adapter.

## State Decision

Use Zustand for web client state.

The first store should cover only state that already exists:

- selected screen;
- language/currency preferences;
- demo career availability;
- Continue result;
- match-preparation draft state.

Do not move engine/domain rules into Zustand. The store is a browser state
adapter, not a game engine.

## Styling Decision

Use Tailwind for common classes and layout utilities.

Keep custom CSS only for:

- global retro-football tokens;
- typography/font import decisions;
- tactical pitch geometry;
- genuinely bespoke retro-football surfaces;
- small cases where Tailwind utilities would reduce readability.

Do not rewrite every class just to say Tailwind is used. Migrate enough to
establish the system and prevent future screens from adding another large CSS
file.

## Tooling Rule

Before adding or changing dependencies in `package.json` or `pnpm-lock.yaml`,
run:

```sh
nvm use 24
```

Then install through pnpm from the repository root.

Expected tooling:

- `zustand`;
- Tailwind CSS for Vite using the official Vite plugin:
  `tailwindcss` and `@tailwindcss/vite`.

## Scope

Allowed:

- add Zustand and Tailwind dependencies;
- add Tailwind/Vite configuration needed by the current Vite app;
- introduce a web store Module with focused selectors/actions;
- reorganize `apps/web/src` into the documented feature-first structure;
- move files without behavior changes;
- update imports and tests;
- convert common styling to Tailwind utilities where this reduces custom CSS;
- keep custom CSS for tactical pitch and retro identity where it is clearer;
- update architecture documentation;
- run Playwright desktop/narrow QA after the rework.

Not allowed:

- no new gameplay features;
- no Inbox/Posta Decision Center implementation;
- no hidden routing framework;
- no automatic manager decisions;
- no styling rewrite that changes the product identity;
- no dead wrapper Modules that only re-export one file without adding locality;
- no unused Tailwind/Zustand experiments;
- no broad UI redesign beyond preserving the current Phase 54 behavior.

## Required Section Completion Review

Before closing the phase, document:

- dependency review;
- Module depth/locality review;
- folder-purpose review;
- store seam review;
- styling-system review;
- UI regression review;
- accessibility review;
- improvement decision.

## Ordered Steps

1. `01-current-web-architecture-audit.md`
2. `02-folder-map-and-migration-plan.md`
3. `03-install-zustand-and-tailwind-tooling.md`
4. `04-zustand-career-ui-store.md`
5. `05-feature-first-folder-migration.md`
6. `06-tailwind-foundation-and-css-reduction.md`
7. `07-regression-visual-qa-and-accessibility.md`
8. `08-architecture-report-and-next-phase-decision.md`

## Phase-Level Checks

- `nvm use 24` before dependency installation or package changes.
- `pnpm --filter @game/web run typecheck`
- `pnpm --filter @game/web run test`
- `pnpm --filter @game/web run build`
- Playwright browser QA for desktop and narrow viewport.
- `pnpm depcruise`
- `pnpm check`
- `git diff --check`

## Definition Of Done

- The web folder structure has documented ownership.
- Zustand owns existing browser state without moving game rules into React or
  the store.
- Tailwind is installed and used for common layout/utility styling.
- Custom CSS is reduced or clearly justified.
- Existing dashboard, Inbox rail, match preparation, save, and Continue flows
  still work.
- Browser QA shows no major visual regression.
- Architecture docs explain the new web structure.
- The final report recommends exactly one next phase.
