# Step 03 - Dashboard Command Hierarchy And Career Composition Seam

## Status

Done.

## Goal

Make Dashboard answer one manager question clearly and narrow the repeated App
composition enough that later screen work cannot accidentally regress save,
recovery, or command behavior.

## Findings Closed

- `Q-P1-04` technical content leaks on Dashboard and shared career context.
- `Q-P1-05` flattened operational hierarchy on Dashboard.
- `Q-P1-09` broad App composition, bounded current-career seam.
- `Q-P2-01` repeated readiness/content on Dashboard.
- `Q-P2-07` command-presentation/store ownership only where the new frame makes
  the current direction explicit.
- `Q-P2-08` test-only Dashboard presentation fields.

## User-Visible Outcome

- Dashboard shows the next real manager decision first, with one dominant
  command and concise football context.
- Raw `fixture:*`, `season:*`, `unknown`, `none`, `missing`, and duplicate
  readiness diagnostics are absent from valid states.
- Posta awareness, save state, and secondary club context remain available but
  do not compete with the task.
- Loading, recovery, attention, ready, unprepared, and post-match states keep a
  stable layout.

## Scope

1. Define the exact Dashboard first-viewport content for unprepared, ready,
   attention, and post-match states using existing structured facts.
2. Omit unavailable facts instead of rendering backend fallback words.
3. Remove presentational fields produced only for tests and facts duplicated by
   the shell/Posta/preparation owners.
4. Extract the four repeated career providers, storage-recovery boundary, and
   unsaved dialog into one named `CareerAppFrame` with current callers.
5. Extract current screen presentation derivation into one focused hook so App
   no longer constructs every read model inline. Keep runtime handle and
   explicit screen selection in the app layer.
6. Choose one command-activity input direction for the touched Dashboard path;
   do not split Zustand or introduce another coordinator.

## Implementation Contract

- Dashboard must not invent table position, recent result, opponent, or date.
- Technical IDs remain available to diagnostics/tests but not valid product
  copy.
- One real action may be shared with Posta because Dashboard is the operational
  home and Posta explains the attention; do not duplicate action ownership.
- `CareerAppFrame` is a current composition seam, not a router or generic page
  framework.
- App still owns browser runtime lifecycle and explicit screen routing.
- Every new exported file/function receives concise TSDoc where useful.

## Expected Files

- `apps/web/src/app/App.tsx`
- `apps/web/src/app/app.test.tsx`
- `apps/web/src/app/CareerAppFrame.tsx`
- `apps/web/src/app/CareerAppFrame.test.tsx`
- `apps/web/src/app/use-career-screen-presentations.ts`
- `apps/web/src/app/use-career-screen-presentations.test.ts`
- `apps/web/src/features/dashboard/build-career-dashboard.ts`
- `apps/web/src/features/dashboard/build-career-dashboard.test.ts`
- `apps/web/src/features/dashboard/career-dashboard-presenter.ts`
- `apps/web/src/features/dashboard/career-dashboard-presenter.test.ts`
- `apps/web/src/features/dashboard/CareerDashboardScreen.tsx`
- `apps/web/src/features/dashboard/CareerDashboardScreen.test.tsx`
- `apps/web/src/styles/layout.css`
- `apps/web/src/styles/components.css`
- `apps/web/src/visual-qa/current-product.spec.ts`
- `packages/i18n/src/labels.ts`
- `packages/i18n/src/labels.test.ts`
- `docs/ARCHITECTURE.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What NOT To Implement

- No generic router, DI container, command bus, or screen registry.
- No runtime/storage movement into React screens or Zustand.
- No playable future navigation.
- No Posta layout rework; Step 04 owns it.
- No preparation or Matchday redesign.
- No decorative club metrics or fake football context.

## Required Checks

```bash
nvm use 24
pnpm --filter @game/i18n run test
pnpm --filter @game/web run test
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run build
pnpm web:visual:qa
pnpm depcruise
pnpm check
git diff --check
graphify update .
```

## Manual Inspection

- Capture unprepared, ready, attention, post-match, loading, and recovery
  Dashboard states at desktop and narrow widths.
- Confirm one dominant command and no repeated blocker/readiness block.
- Confirm no technical ID or fallback word appears.
- Verify App Entry, Posta, Preparation, and Matchday still mount through the
  extracted current-career frame.
- Verify manual save, dirty exit, storage retry, Continue, and command pending
  remain visually and behaviorally intact.

## Cleanup Boundary

Remove repeated frame JSX, dead Dashboard presentation fields and assertions,
obsolete Dashboard selectors, and duplicate command-state reads replaced by the
new explicit direction. Do not retain compatibility exports without a caller.

## Completion Criteria

- Dashboard has one clear first-viewport decision in every current state.
- Valid Dashboard copy contains no technical leaks.
- Repeated career framing has one tested current owner.
- App ownership is narrower without changing runtime, persistence, or routing.
- No dead Dashboard field, helper, selector, or compatibility wrapper remains.
