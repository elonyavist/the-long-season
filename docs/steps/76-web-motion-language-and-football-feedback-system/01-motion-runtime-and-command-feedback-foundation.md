# Step 01 - Motion Runtime And Command Feedback Foundation

## Status

Done.

## Goal

Install Motion for React and establish the smallest production-used shared
motion Module while migrating real command feedback as its first visible
consumer.

## User-Visible Outcome

- New career, load career, Continue, save, preparation, and Matchday commands
  acknowledge activation immediately.
- Pending feedback is smooth, bounded, and stops exactly when real work ends.
- Success and failure states settle without moving the surrounding layout.
- Reduced motion keeps the pending label and state semantics without repeating
  transforms.

## Scope

1. Record the current production build asset sizes before installation.
2. Run `nvm use 24`, then install `motion` only in `apps/web` through pnpm.
3. Add one `WebMotionProvider` using `LazyMotion`, the smallest required DOM
   feature bundle, strict mode, and `MotionConfig reducedMotion="user"`.
4. Add one shared semantic token/preset Module for `micro`, `transition`, and
   `narrative` timing; export no unused preset.
5. Mount the provider at the browser composition root.
6. Migrate the existing command-activity indicator and currently rendered
   command controls to shared pending/settled micro feedback.
7. Preserve existing command locking, `aria-busy`, polite announcements,
   error recovery, and final state publication order.
8. Record the post-install production build asset sizes.

## Implementation Contract

- The shared Module is a presentation Adapter, not a command framework.
- Use direct imports from the concrete motion files.
- Animation state is local React state or derived props; do not add it to
  Zustand, storage, runtime contracts, or presenters.
- The pending loop is the only repeating animation in this step and exists only
  while a real command is active.
- `onAnimationComplete` may clean local presentation state only.
- Existing static CSS hover/focus behavior remains unless it duplicates the
  migrated command state.

## Expected Files

- `apps/web/package.json`
- `pnpm-lock.yaml`
- `apps/web/src/main.tsx`
- `apps/web/src/shared/motion/WebMotionProvider.tsx`
- `apps/web/src/shared/motion/web-motion.ts`
- focused tests under `apps/web/src/shared/motion/`
- `apps/web/src/features/shared/CommandActivityIndicator.tsx`
- its focused test
- current command-owning components only where needed to consume the shared
  pending state
- `apps/web/src/styles/components.css`
- `apps/web/src/visual-qa/current-product.spec.ts`
- `docs/audits/WEB_MOTION_SYSTEM_REPORT.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What NOT To Implement

- No screen navigation, Posta, dashboard, tactical, or Matchday choreography.
- No generic animated button component replacing every existing button.
- No command queue, timeout, persistence, save-cadence, or runtime change.
- No unused motion variants or demo surface.
- No normal `motion.*` import that defeats the chosen `LazyMotion` policy.

## Required Checks

```bash
nvm use 24
pnpm --filter @game/web run test
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run build
pnpm web:visual:qa
pnpm depcruise
git diff --check
graphify update .
```

## Manual Inspection

- Trigger load, Continue, manual save, preparation save, Start match, and one
  deliberate storage failure.
- Confirm feedback begins immediately, dimensions remain stable, conflicting
  actions stay locked, and the final state appears once.
- Repeat the same checks with reduced motion and keyboard only.

## Completion Criteria

- Motion is a web-only dependency with one production provider.
- Shared presets have active consumers and no dormant export.
- Command feedback is visibly improved without changing command behavior.
- Bundle impact and the chosen loading policy are recorded.
- Step 02 remains the only next implementation step.
