# Step 02 - Shell Navigation And Modal Transition Language

## Status

Done.

## Goal

Use the shared motion system to make screen changes and modal decisions feel
connected while keeping the persistent football shell visually stable.

## User-Visible Outcome

- The selected content changes with one restrained transition while the club
  sidebar remains fixed.
- Main-menu, save, and dirty-exit dialogs open and close coherently.
- Focus lands on the correct heading or dialog control without waiting for an
  animation.
- Rapid navigation never shows stale screens or overlapping actions.

## Scope

1. Animate only the changing shell outlet; do not remount or move the persistent
   club navigation.
2. Use one stable screen key and one bounded enter/exit preset.
3. Integrate current modal/dialog surfaces with one shared presence treatment.
4. Preserve native dialog semantics, focus trap/return, Escape behavior,
   pending locks, and dirty-exit choices.
5. Ensure navigation during an interrupted transition resolves immediately to
   the latest requested destination.
6. Remove superseded screen-entry and modal keyframes after all callers migrate.

## Implementation Contract

- The route/screen state remains owned by the existing app composition.
- Motion does not become a router, navigation registry, or modal manager.
- Persistent shell chrome must not animate on every destination change.
- Focus moves from navigation semantics, not `onAnimationComplete`.
- Use opacity and a small transform; no page-scale zoom, parallax, or sliding
  panel that obscures orientation.

## Expected Files

- `apps/web/src/app/App.tsx`
- `apps/web/src/app/CareerAppFrame.tsx`
- focused app/frame tests
- `apps/web/src/features/app-shell/AppShell.tsx`
- `apps/web/src/features/app-shell/UnsavedCareerDialog.tsx`
- `apps/web/src/features/app-shell/CareerSaveControl.tsx`
- focused app-shell tests
- `apps/web/src/shared/motion/web-motion.ts`
- `apps/web/src/styles/base.css`
- `apps/web/src/styles/layout.css`
- `apps/web/src/styles/components.css`
- `apps/web/src/visual-qa/current-product.spec.ts`
- `docs/audits/WEB_MOTION_SYSTEM_REPORT.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What NOT To Implement

- No routing library, screen registry, second dialog system, or new shell.
- No change to navigation labels, destinations, save rules, or dirty detection.
- No animation of static sidebar items on every render.
- No full-screen wipe or transition that delays the first useful content.

## Required Checks

```bash
nvm use 24
pnpm --filter @game/web run test
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run build
pnpm web:visual:qa
git diff --check
graphify update .
```

## Manual Inspection

- Navigate Dashboard -> Posta -> preparation -> Dashboard using mouse and
  keyboard.
- Open, cancel, confirm, and interrupt each current dialog.
- Verify desktop, narrow, 200% text, and reduced-motion focus behavior.

## Completion Criteria

- The shell stays fixed while one content transition explains destination
  change.
- Dialogs share one coherent treatment without losing native semantics.
- Rapid interaction, keyboard focus, and reduced motion are deterministic.
- Obsolete migrated CSS transition code is removed.
