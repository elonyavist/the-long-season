# Web Architecture Foundation Audit

Date: 2026-06-24
Phase: `55-web-architecture-state-and-styling-foundation`
Step: `01-current-web-architecture-audit`

## Scope

This audit reviews the current `apps/web` structure before adding Zustand,
Tailwind, or moving files.

The goal is not to chase an abstract folder ideal. The goal is to prevent
future web sections from being built on top of scattered state, broad folders,
and uncontrolled styling.

## Current Folder Map

```text
apps/web/src/
  App.tsx
  main.tsx
  app/
    app-entry-view-model.ts
    preferences.ts
    translation.ts
  career/
    build-demo-career-dashboard.ts
    career-dashboard-presenter.ts
    continue-demo-career.ts
    match-preparation-demo.ts
    player-position-ordering.ts
  components/
    BenchSelectionPanel.tsx
    CareerInboxPanel.tsx
    CareerShell.tsx
    PlayerFactPanel.tsx
    SquadSelectionTable.tsx
    TacticalPitchLineup.tsx
    match-preparation-labels.ts
    tactical-pitch-layout.ts
  screens/
    AppEntryScreen.tsx
    CareerDashboardScreen.tsx
    CareerMatchPreparationScreen.tsx
  styles/
    base.css
    components.css
    layout.css
    tokens.css
  visual-qa/
    continue-inbox.spec.ts
    match-preparation.spec.ts
    retro-football-identity.spec.ts
    shell-accessibility.spec.ts
    tactics-workspace.spec.ts
```

## Current Responsibility Map

- `App.tsx` currently owns screen selection, preferences, demo-career existence,
  Continue result, match-preparation draft state, view construction, and action
  wiring.
- `app/` owns translation, preferences, and app-entry view-model glue.
- `career/` mixes dashboard adapter logic, Continue adapter logic,
  match-preparation demo state, player-position ordering, and tests.
- `components/` mixes generic reusable UI, career shell layout, Inbox rail,
  tactical pitch, squad table, bench selection, and tactical formatting helpers.
- `screens/` contains top-level screens, but those screens also perform feature
  orchestration and local presentation grouping.
- `styles/components.css` is the largest styling surface and mixes menu,
  dashboard, Inbox, match preparation, tactical pitch, bench, squad table, and
  tactic card styling in one file.
- `visual-qa/` is already a good folder: browser QA scripts are isolated and
  have clear purpose.

## Graphify Findings

`graphify query "apps web App.tsx React state match preparation demo folder CSS architecture"`
identified `App.tsx`, `match-preparation-demo.ts`,
`CareerMatchPreparationScreen.tsx`, `CareerDashboardScreen.tsx`,
`CareerShell.tsx`, and `continue-demo-career.ts` as central web nodes.

That matches the source review: current state and orchestration pass through a
small number of broad Modules. This is acceptable for the prototype that just
proved match preparation, but it is not a good foundation for Inbox, Squad,
Calendar, Market, Finance, Youth, Staff, and Archive.

## Concrete Friction

### 1. `App.tsx` Has Too Much Orchestration

`App.tsx` is only around 144 lines, so this is not a raw size problem. The
problem is that it knows too many concepts:

- current screen;
- language and currency preferences;
- career existence;
- Continue result;
- match-preparation draft state;
- dashboard view construction;
- match-preparation view construction;
- Inbox action routing;
- save-preparation side effects;
- screen-specific callbacks.

The Module is shallow: callers get little leverage from it because the app
state rules live directly in the root implementation. Future sections would add
more callbacks and more state here.

### 2. Current State Has No Explicit Browser State Seam

Current state is stored through local React `useState` calls. That was correct
for the first prototype, but future screens will need to read and modify the
same facts:

- active screen;
- preferences;
- career load/new state;
- Continue result;
- match-preparation draft and saved status;
- later Inbox read state and selected message.

Without a store seam, each new section will either lift more state into
`App.tsx` or duplicate state locally. Zustand should own existing browser UI
state, not engine rules.

### 3. `career/` Is A Mixed Folder

`career/` currently contains several different concerns:

- dashboard demo adapter;
- dashboard presenter;
- Continue demo adapter;
- match-preparation demo adapter/state;
- position ordering helper.

The folder name is too broad. It does not tell a junior developer where to look
for dashboard behavior versus match-preparation behavior. It should become
feature-owned folders plus shared tactical helpers where reuse is real.

### 4. `components/` Is Too Broad

`components/` contains both reusable tactical Modules and feature-specific
career Modules. The folder does not express ownership:

- `CareerShell` and `CareerInboxPanel` belong to shell/Inbox presentation.
- `TacticalPitchLineup`, `SquadSelectionTable`, `PlayerFactPanel`,
  `BenchSelectionPanel`, `tactical-pitch-layout`, and
  `match-preparation-labels` are tactical workspace Modules.

Some of these can become `shared` only if they are reused outside the current
feature. Until then, moving them near `match-preparation` improves locality.

### 5. `components.css` Is Becoming A Styling Dump

Current line counts:

- `components.css`: over 1000 lines;
- `layout.css`: over 200 lines;
- `tokens.css`: small and focused;
- `base.css`: small and focused.

`components.css` mixes common button styling, dashboard cards, Inbox rail,
match-preparation layout, pitch styling, bench styling, squad table styling,
player detail, and tactic cards. This makes future visual changes risky because
new screens will likely append more selectors to the same file.

Tailwind should absorb common spacing/layout/utility work. Custom CSS should
remain for retro-football tokens, tactical pitch geometry, and bespoke surfaces.

### 6. Some Test Locations Follow Old Ownership

Tests exist and are useful, but they follow current broad folders. During the
folder migration, tests should move with the Modules they verify when that
improves locality.

## Concrete Non-Problems

- `packages/ui` is already the right framework-free read-model seam.
- `apps/web` does not parse CLI output.
- Engine rules are not embedded in React components.
- The current visual QA folder is well scoped.
- The retro-football design direction is correct and must be preserved.
- The current native controls are acceptable for accessibility and should not
  be replaced just because Tailwind is introduced.
- This phase does not need a router yet. Screen state can remain explicit until
  URL routing becomes a real product need.

## CSS Classification

Keep custom CSS for:

- global tokens and retro theme variables;
- font imports and base document styles;
- tactical pitch geometry and markings;
- custom focus/selected states where Tailwind utilities would be unreadable;
- dense retro table/panel visuals if utility classes become noisy.

Candidate Tailwind migration areas:

- page/shell spacing;
- flex/grid wrappers;
- common button layout sizing;
- simple panel padding/gaps;
- common text alignment and utility states;
- feature wrappers where utility classes are clearer than one-off selectors.

## Current Checks To Preserve

The following checks are part of the current safety net and must keep passing:

- `pnpm --filter @game/web run typecheck`
- `pnpm --filter @game/web run test`
- `pnpm --filter @game/web run build`
- `pnpm depcruise`
- `pnpm check`
- existing Playwright visual QA scripts for:
  - Continue/InBox;
  - match preparation;
  - shell accessibility;
  - retro football identity;
  - tactics workspace.

## Decision

Proceed with Phase 55 before Inbox/Posta Decision Center.

Reason:

Inbox/Posta will become a central decision surface. Building it before the web
state seam and folder ownership are clear would add more state and presentation
logic into the current broad structure. The user-facing reason is control: the
manager should get a stable, fast, clear interface instead of a growing web
prototype that becomes harder to trust and maintain.

## Constraints For Next Step

- Define the target folder map before moving files.
- Do not add empty future-feature folders.
- Do not turn `shared/` into a dumping ground.
- Keep the current behavior stable throughout the migration.
