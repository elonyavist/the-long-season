# 13 - Legacy Code And CSS Removal

## Goal

Remove the old web UI implementation that is no longer referenced after the
rebuild.

This step prevents the new UI from sitting on top of dead code.

## Scope

- Delete obsolete shell components once `AppShell` owns the career frame.
- Delete obsolete theme-palette files/tests if not already removed.
- Remove the Step 01 leftovers once no active screen/test depends on them:
  `apps/web/src/app/theme-palettes.ts`,
  `apps/web/src/app/theme-palettes.test.ts`,
  `apps/web/src/visual-qa/theme-palette.spec.ts`, and unused
  `web.themePalette.*` labels.
- Remove unused legacy CSS selectors from `components.css` and `layout.css`.
- Remove obsolete visual QA specs that target rejected layouts.
- Keep tactical-board CSS and tests.
- Verify imports with typecheck and tests.

## What NOT to implement

- No new visual design.
- No new screens.
- No refactor outside web presentation unless an import proves it is necessary.
- No removal of tactical-board logic.

## Expected files

- `apps/web/src/features/career-shell/CareerShell.tsx` if unused, delete it.
- `apps/web/src/features/career-shell/CareerInboxPanel.tsx` if replaced, delete
  it.
- `apps/web/src/app/theme-palettes.ts` if unused, delete it.
- `apps/web/src/app/theme-palettes.test.ts` if unused, delete it.
- `apps/web/src/styles/components.css`
- `apps/web/src/styles/layout.css`
- `apps/web/src/visual-qa/*.spec.ts` only for specs tied to rejected layouts.
- `apps/web/src/app/App.tsx`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## Required checks

```bash
nvm use 24
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run test
pnpm --filter @game/web run build
git diff --check
```

## Visual check for the user

Smoke the browser flow:

- app entry;
- dashboard;
- match preparation;
- pre-match;
- half-time;
- full time.

Acceptance:

- no screen regresses after cleanup;
- no rejected old shell/chrome appears;
- inactive sections are still honest and visible;
- tactical board still looks approved.

Stop after this step for user approval before continuing.

## Definition of Done

- Dead web UI files and selectors are removed.
- Build/test/typecheck prove no stale import remains.
- Status and roadmap are updated.
