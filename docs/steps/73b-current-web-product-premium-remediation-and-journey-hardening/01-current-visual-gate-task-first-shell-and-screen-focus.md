# Step 01 - Current Visual Gate, Task-First Shell, And Screen Focus

## Status

Pending.

## Goal

Create the safety seam for every later Phase 73B change, then make the current
football task reachable before repeated shell chrome on narrow screens and by
keyboard.

## Findings Closed

- `Q-P1-03` narrow task priority, shell-owned portion.
- `Q-P1-06` missing keyboard bypass.
- `Q-P1-07` lost screen focus.
- `Q-P1-11` canonical visual gate foundation.
- `Q-P2-09` only where active-route shell awareness affects task order; full
  Posta hierarchy remains Step 04.

## User-Visible Outcome

- At `390x844`, the current Dashboard, Posta, Preparation, or Matchday task is
  visible before secondary orientation and repeated awareness.
- A keyboard-visible skip command moves focus to the active `main` content.
- Genuine screen changes focus the new screen heading or main region.
- Same-screen actions such as filter, row selection, playback update, or menu
  interaction do not unexpectedly steal focus.
- Desktop shell identity and all current destinations remain available.

## Scope

1. Add one stable `main` focus target and one localized skip control to the
   existing shell.
2. Define one screen-change focus rule in the app composition boundary.
3. Remove repeated per-screen scroll/focus behavior replaced by that owner.
4. Reorder or compact narrow shell regions so the selected task is first in
   useful reading and visual order without hiding navigation.
5. Add one canonical Playwright Test entry and one root command. Seed it with
   current App Entry, Dashboard, shell, focus, narrow, zoom, and reduced-motion
   assertions; later steps extend the same suite.
6. Keep deterministic SQLite/OPFS setup and screenshots outside the repository.

## Implementation Contract

- Focus runs only when the top-level screen identity changes.
- The focus target uses semantic heading/main behavior and is not a fake hidden
  control.
- DOM order, keyboard order, and visual order must remain coherent.
- Skip is visually revealed on focus and has a localized accessible name.
- The canonical Playwright command must fail on clipping, page-level horizontal
  overflow, missing focus target, or broken primary navigation.
- Do not copy all historical visual scripts into the new suite. Migrate only
  current assertions required by this step.

## Expected Files

- `package.json`
- `apps/web/package.json`
- `apps/web/src/app/App.tsx`
- `apps/web/src/app/app.test.tsx`
- `apps/web/src/features/app-shell/AppShell.tsx`
- `apps/web/src/features/app-shell/AppShell.test.tsx`
- `apps/web/src/styles/base.css`
- `apps/web/src/styles/layout.css`
- `apps/web/src/styles/components.css`
- `apps/web/src/visual-qa/current-product.spec.ts`
- `packages/i18n/src/labels.ts`
- `packages/i18n/src/labels.test.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What NOT To Implement

- No Dashboard, Posta, Preparation, or Matchday content redesign.
- No generic router or focus-management framework.
- No deletion of historical browser scripts yet.
- No broad App extraction; that belongs to Step 03.
- No token/color redesign; that belongs to Step 02.
- No tactical-board CSS, SVG, geometry, or interaction change.

## Required Checks

```bash
nvm use 24
pnpm --filter @game/i18n run test
pnpm --filter @game/web run test
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run build
pnpm web:visual:qa
pnpm depcruise
git diff --check
graphify update .
```

## Manual Inspection

- Capture App Entry and every career screen at `1440x900` and `390x844`.
- At 200% text, confirm task, skip target, navigation, and primary action remain
  reachable without horizontal page overflow.
- Tab from the address bar: skip appears, focus is visible, and Enter lands on
  the active task.
- Navigate App Entry -> Dashboard -> Posta -> Preparation -> Matchday and record
  `document.activeElement` after each real screen transition.
- Change a Posta filter and open a tactical menu; focus must not jump to main.
- Verify reduced motion changes no focus semantics.

## Cleanup Boundary

Remove only per-screen scroll/focus code and narrow shell overrides proven
redundant by the shared behavior. Historical visual suites remain until Step 10
proves their current assertions have migrated.

## Completion Criteria

- One executable `pnpm web:visual:qa` current-product command exists.
- Keyboard bypass and screen-change focus pass automated and manual checks.
- Current task precedes secondary shell content at narrow width.
- No current destination, recovery action, or command feedback regresses.
- The next step can change semantic tokens behind a reliable browser gate.

