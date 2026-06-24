# Web Architecture State Styling Report

Date: 2026-06-24
Phase: `55-web-architecture-state-and-styling-foundation`
Status: Complete

## Summary

Phase 55 made the web app easier to navigate before the next career sections
are added. The work stayed inside the current prototype behavior: no new
gameplay, no persistence, no router, no Inbox/Posta Decision Center, and no UI
redesign.

## Final Web Folder Structure

```text
apps/web/src/
  main.tsx
  app/
    App.tsx
    preferences.ts
    translation.ts
  stores/
    career-ui-store.ts
  features/
    app-entry/
    career-shell/
    dashboard/
    match-preparation/
  shared/
    lib/
    ui/
  styles/
    index.css
    tokens.css
    base.css
    layout.css
    components.css
  visual-qa/
```

Ownership is now explicit:

- `app/` owns bootstrap composition, preferences, and translation adapters.
- `stores/` owns browser UI state only.
- `features/*` owns section-specific screens and adapters.
- `shared/ui` owns real reusable browser UI pieces.
- `shared/lib` owns small browser helpers used by multiple UI areas.
- `styles/` owns Tailwind entry plus the retro-football CSS foundation.
- `visual-qa/` owns Playwright scripts.

## Zustand Store Seam

`apps/web/src/stores/career-ui-store.ts` owns:

- current top-level screen;
- language/currency preferences;
- deterministic demo-career availability;
- latest Continue result;
- match-preparation draft state;
- action methods for existing manager interactions.

The store must not own:

- match outcomes;
- squad/tactic advice;
- `@game/ui` read-model building;
- localized prose rendering;
- save persistence;
- engine rules.

This keeps Zustand as a browser adapter, not a second game engine.

## Tailwind And CSS Split

Tailwind is now available through `apps/web/src/styles/index.css` and is used
in real UI code for simple app-entry layout utilities.

Custom CSS remains for:

- retro theme tokens;
- page texture and focus ring;
- career shell layout;
- Inbox/Posta rail;
- dashboard surfaces;
- tactical pitch geometry;
- fixed-height squad table;
- bench/tactic/save-readiness controls.

This split is deliberate: Tailwind should reduce generic CSS, not erase the
football-management identity or turn complex tactical UI into unreadable class
strings.

## Reviews

### Dependency Review

`zustand`, `tailwindcss`, and `@tailwindcss/vite` were added only to
`@game/web` with Node 24 active. Dependency cruiser passes and `@game/ui`
remains framework-free.

### Module Depth And Locality Review

The old broad `career/`, `components/`, and `screens/` folders are gone.
Feature files now sit near the screens and tests they support. Shared files are
limited to real reusable tactical table/detail helpers and browser ordering
logic.

### Folder Purpose Review

The folder map is understandable for a junior developer:

- open `main.tsx`;
- follow to `app/App.tsx`;
- inspect state in `stores/career-ui-store.ts`;
- inspect section code in `features/*`;
- inspect cross-feature UI in `shared/*`.

### Store Seam Review

`App.tsx` no longer duplicates the state now owned by Zustand. The store has
focused tests for main menu, dashboard, Inbox/Posta routing, preparation save,
and Continue transitions.

### Styling-System Review

`WEB_STYLING_SYSTEM_REVIEW.md` documents what moved to Tailwind and why most
bespoke football UI styling remains custom CSS.

### UI Regression Review

`WEB_ARCHITECTURE_REWORK_VISUAL_QA.md` records Phase 55 Playwright QA. The
checked flow still covers main menu, dashboard, Inbox/Posta rail,
match-preparation workspace, formation switching, XI selection, bench
selection, tactic selection, save readiness, Continue readiness, desktop,
narrow layout, keyboard path, and no detected horizontal overflow.

### Accessibility Review

The browser flow still uses native buttons, selects, and radios for the primary
controls. Shell landmarks remain visible. No new WCAG blocker was found in this
phase.

### Improvement Decision

No blocker remains from Phase 55. The tactical workspace is still visually
dense, but that is a future tactics/product polish issue, not a regression from
the architecture pass.

## Verification

- `node --version` after `nvm use 24`
- Zustand import smoke
- Phase 55 Playwright visual QA
- `pnpm --filter @game/web run typecheck`
- `pnpm --filter @game/web run test`
- `pnpm --filter @game/web run build`
- `pnpm depcruise`
- `pnpm check`
- `git diff --check`

## Next Phase Recommendation

Recommended next phase: `Phase 56 - Inbox/Posta Decision Center`.

Reason: the web app now has stable folder ownership, a focused browser state
store, Tailwind tooling, preserved retro identity, and browser regression
coverage. Inbox/Posta can now be built as a real section without inheriting the
old flat structure or local-state sprawl.
