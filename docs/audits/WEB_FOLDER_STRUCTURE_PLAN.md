# Web Folder Structure Plan

Date: 2026-06-24
Phase: `55-web-architecture-state-and-styling-foundation`
Step: `02-folder-map-and-migration-plan`

## Target Structure

```text
apps/web/src/
  main.tsx
  app/
    App.tsx
    app.test.tsx
    preferences.ts
    preferences.test.ts
    translation.ts
    translation.test.ts
  stores/
    career-ui-store.ts
    career-ui-store.test.ts
  shared/
    ui/
      PlayerFactPanel.tsx
      SquadSelectionTable.tsx
      SquadSelectionTable.test.ts
    layout/
      reserved for real cross-feature layout Modules only
    lib/
      player-position-ordering.ts
      player-position-ordering.test.ts
  features/
    app-entry/
      app-entry-view-model.ts
      app-entry-view-model.test.ts
      AppEntryScreen.tsx
    career-shell/
      CareerShell.tsx
      CareerShell.test.tsx
      CareerInboxPanel.tsx
      CareerInboxPanel.test.tsx
    dashboard/
      build-demo-career-dashboard.ts
      build-demo-career-dashboard.test.ts
      career-dashboard-presenter.ts
      career-dashboard-presenter.test.ts
      continue-demo-career.ts
      CareerDashboardScreen.tsx
    match-preparation/
      BenchSelectionPanel.tsx
      BenchSelectionPanel.test.ts
      CareerMatchPreparationScreen.tsx
      CareerMatchPreparationScreen.test.ts
      TacticalPitchLineup.tsx
      TacticalPitchLineup.test.ts
      match-preparation-career-loop.test.ts
      match-preparation-demo.ts
      match-preparation-demo.test.ts
      match-preparation-labels.ts
      tactical-pitch-layout.ts
  styles/
    index.css
    tokens.css
    base.css
    layout.css
    components.css
  visual-qa/
    continue-inbox.spec.ts
    match-preparation.spec.ts
    retro-football-identity.spec.ts
    shell-accessibility.spec.ts
    tactics-workspace.spec.ts
```

## Folder Responsibilities

### `app/`

Owns app bootstrap composition and browser preferences/translation adapters.
`App.tsx` should become a thin composition Module after Zustand migration.

### `stores/`

Owns Zustand stores and selectors for browser UI state. Stores must not own
engine rules, generated content, or localization prose.

### `features/app-entry/`

Owns the main menu and app-entry view-model adapter.

### `features/career-shell/`

Owns the career shell, top navigation, left Inbox/Posta rail, and compact Inbox
rail presentation. It is not the future full Inbox Decision Center.

### `features/dashboard/`

Owns the current dashboard screen, dashboard presenter, demo dashboard adapter,
and Continue demo adapter.

### `features/match-preparation/`

Owns the current tactical workspace feature: demo preparation state, formation
switching, XI/bench controls, pitch layout, tactical labels, and related tests.

### `shared/ui/`

Owns browser UI Modules reused by more than one feature or designed as stable
cross-feature primitives. It must not become a dumping ground for feature logic.

### `shared/layout/`

Reserved for real cross-feature layout Modules. It should remain empty unless a
current step has an actual reusable layout Module.

### `shared/lib/`

Owns small browser-side helpers with no feature ownership. The first real
candidate is player position ordering because it supports tactical selection
and future squad/tactics screens.

### `styles/`

Owns Tailwind entry, global tokens, base document rules, and rare custom CSS.
Custom CSS must be justified by readability or bespoke football UI.

### `visual-qa/`

Owns Playwright scripts. It stays top-level because QA cuts across features.

## Current File Migration Map

| Current file | Target file |
|---|---|
| `apps/web/src/main.tsx` | `apps/web/src/main.tsx` |
| `apps/web/src/App.tsx` | `apps/web/src/app/App.tsx` |
| `apps/web/src/App.test.tsx` | `apps/web/src/app/app.test.tsx` |
| `apps/web/src/app/app-entry-view-model.ts` | `apps/web/src/features/app-entry/app-entry-view-model.ts` |
| `apps/web/src/app/app-entry-view-model.test.ts` | `apps/web/src/features/app-entry/app-entry-view-model.test.ts` |
| `apps/web/src/app/preferences.ts` | `apps/web/src/app/preferences.ts` |
| `apps/web/src/app/preferences.test.ts` | `apps/web/src/app/preferences.test.ts` |
| `apps/web/src/app/translation.ts` | `apps/web/src/app/translation.ts` |
| `apps/web/src/app/translation.test.ts` | `apps/web/src/app/translation.test.ts` |
| `apps/web/src/career/build-demo-career-dashboard.ts` | `apps/web/src/features/dashboard/build-demo-career-dashboard.ts` |
| `apps/web/src/career/build-demo-career-dashboard.test.ts` | `apps/web/src/features/dashboard/build-demo-career-dashboard.test.ts` |
| `apps/web/src/career/career-dashboard-presenter.ts` | `apps/web/src/features/dashboard/career-dashboard-presenter.ts` |
| `apps/web/src/career/career-dashboard-presenter.test.ts` | `apps/web/src/features/dashboard/career-dashboard-presenter.test.ts` |
| `apps/web/src/career/continue-demo-career.ts` | `apps/web/src/features/dashboard/continue-demo-career.ts` |
| `apps/web/src/career/match-preparation-career-loop.test.ts` | `apps/web/src/features/match-preparation/match-preparation-career-loop.test.ts` |
| `apps/web/src/career/match-preparation-demo.ts` | `apps/web/src/features/match-preparation/match-preparation-demo.ts` |
| `apps/web/src/career/match-preparation-demo.test.ts` | `apps/web/src/features/match-preparation/match-preparation-demo.test.ts` |
| `apps/web/src/career/player-position-ordering.ts` | `apps/web/src/shared/lib/player-position-ordering.ts` |
| `apps/web/src/career/player-position-ordering.test.ts` | `apps/web/src/shared/lib/player-position-ordering.test.ts` |
| `apps/web/src/components/BenchSelectionPanel.tsx` | `apps/web/src/features/match-preparation/BenchSelectionPanel.tsx` |
| `apps/web/src/components/BenchSelectionPanel.test.ts` | `apps/web/src/features/match-preparation/BenchSelectionPanel.test.ts` |
| `apps/web/src/components/CareerInboxPanel.tsx` | `apps/web/src/features/career-shell/CareerInboxPanel.tsx` |
| `apps/web/src/components/CareerInboxPanel.test.tsx` | `apps/web/src/features/career-shell/CareerInboxPanel.test.tsx` |
| `apps/web/src/components/CareerShell.tsx` | `apps/web/src/features/career-shell/CareerShell.tsx` |
| `apps/web/src/components/CareerShell.test.tsx` | `apps/web/src/features/career-shell/CareerShell.test.tsx` |
| `apps/web/src/components/PlayerFactPanel.tsx` | `apps/web/src/shared/ui/PlayerFactPanel.tsx` |
| `apps/web/src/components/SquadSelectionTable.tsx` | `apps/web/src/shared/ui/SquadSelectionTable.tsx` |
| `apps/web/src/components/SquadSelectionTable.test.ts` | `apps/web/src/shared/ui/SquadSelectionTable.test.ts` |
| `apps/web/src/components/TacticalPitchLineup.tsx` | `apps/web/src/features/match-preparation/TacticalPitchLineup.tsx` |
| `apps/web/src/components/TacticalPitchLineup.test.ts` | `apps/web/src/features/match-preparation/TacticalPitchLineup.test.ts` |
| `apps/web/src/components/match-preparation-labels.ts` | `apps/web/src/features/match-preparation/match-preparation-labels.ts` |
| `apps/web/src/components/tactical-pitch-layout.ts` | `apps/web/src/features/match-preparation/tactical-pitch-layout.ts` |
| `apps/web/src/screens/AppEntryScreen.tsx` | `apps/web/src/features/app-entry/AppEntryScreen.tsx` |
| `apps/web/src/screens/CareerDashboardScreen.tsx` | `apps/web/src/features/dashboard/CareerDashboardScreen.tsx` |
| `apps/web/src/screens/CareerMatchPreparationScreen.tsx` | `apps/web/src/features/match-preparation/CareerMatchPreparationScreen.tsx` |
| `apps/web/src/screens/CareerMatchPreparationScreen.test.ts` | `apps/web/src/features/match-preparation/CareerMatchPreparationScreen.test.ts` |
| `apps/web/src/styles/base.css` | `apps/web/src/styles/base.css` |
| `apps/web/src/styles/components.css` | `apps/web/src/styles/components.css` |
| `apps/web/src/styles/layout.css` | `apps/web/src/styles/layout.css` |
| `apps/web/src/styles/tokens.css` | `apps/web/src/styles/tokens.css` |
| `apps/web/src/visual-qa/continue-inbox.spec.ts` | `apps/web/src/visual-qa/continue-inbox.spec.ts` |
| `apps/web/src/visual-qa/match-preparation.spec.ts` | `apps/web/src/visual-qa/match-preparation.spec.ts` |
| `apps/web/src/visual-qa/retro-football-identity.spec.ts` | `apps/web/src/visual-qa/retro-football-identity.spec.ts` |
| `apps/web/src/visual-qa/shell-accessibility.spec.ts` | `apps/web/src/visual-qa/shell-accessibility.spec.ts` |
| `apps/web/src/visual-qa/tactics-workspace.spec.ts` | `apps/web/src/visual-qa/tactics-workspace.spec.ts` |

## Migration Order

1. Install Zustand and Tailwind tooling without changing behavior.
2. Add the Zustand store while files are still in their old locations. This
   keeps the state migration smaller and easier to verify.
3. Move app-entry files.
4. Move dashboard files.
5. Move career-shell files.
6. Move match-preparation files.
7. Move shared UI/lib files.
8. Update imports and tests after each group.
9. Remove old empty folders.
10. Update `docs/ARCHITECTURE.md`.

## Import Conventions

- Feature files may import from:
  - `app/` adapters;
  - `stores/`;
  - `shared/*`;
  - `@game/*` packages allowed by project rules.
- `shared/*` must not import from `features/*`.
- `stores/*` may import app preferences, current feature demo adapters, and
  `@game/ui`/engine composition only where that behavior already exists today.
- Avoid broad barrel files during the migration. Direct imports keep ownership
  visible and avoid bundle ambiguity.
- Keep tests next to the Module they verify.

## What Belongs In `shared/*`

Allowed:

- Modules reused by at least two current or immediately planned feature areas;
- generic browser UI primitives;
- browser-only helpers with no feature semantics.

Not allowed:

- dashboard-specific state;
- match-preparation-only controls unless a later feature actually reuses them;
- Inbox/Posta behavior;
- game rules;
- wrappers whose only job is to re-export a file.

## Decision

Proceed to tooling installation, then state migration, then folder migration.

Do not move files before the Zustand step: moving first would make state
behavior harder to verify and would mix mechanical path churn with behavior
ownership changes.
