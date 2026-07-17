# Step 02 - Semantic Tokens, Contrast, And Interaction-State Contract

## Status

Pending.

## Goal

Give all current controls and semantic states one restrained premium language,
fix the measured blocker contrast failure, and remove token/state drift before
screen hierarchy changes begin.

## Findings Closed

- `Q-P1-08` blocking contrast.
- `Q-P2-02` passive/future affordance, shared-state portion.
- `Q-P2-03` token and component-state drift.
- `Q-P2-04` typography/spacing exceptions only where they define shared state.
- `Q-P2-05` target size only for shared controls touched in this step.

## User-Visible Outcome

- Blocking text is readable at WCAG AA contrast.
- Focus, hover, active, selected, disabled, pending, error, recovery, and
  success are recognizable across current screens without visual noise.
- Disabled future navigation and passive phase progress no longer resemble
  available action buttons.
- Pending commands remain visibly responsive without shifting layout.

## Scope

1. Resolve the three used-but-undefined CSS variables recorded by Phase 73A by
   either defining a real semantic token or removing the invalid use.
2. Lock named semantic foreground/background/border pairs for danger, warning,
   success, selection, focus, disabled, and pending states.
3. Apply the contract to real current consumers: shell navigation, Dashboard
   blockers/actions, save controls, dirty dialog, command activity, preparation
   validation, and Matchday progress/action states.
4. Normalize control focus/hover/active/disabled geometry without creating one
   universal component abstraction.
5. Preserve tactical-board-specific colors and geometry unchanged.

## Implementation Contract

- Normal-size text must reach at least `4.5:1`; large text at least `3:1`.
- Information is never communicated by color alone.
- Disabled controls are semantically disabled and absent from ordinary Tab
  order where appropriate.
- Passive process indicators use non-interactive semantics and no button-like
  hover/focus treatment.
- Pending feedback keeps an accessible status and the existing single command
  lock.
- The fixed navy/cream/gold identity remains; this is not a palette phase.

## Expected Files

- `apps/web/src/styles/tokens.css`
- `apps/web/src/styles/base.css`
- `apps/web/src/styles/layout.css`
- `apps/web/src/styles/components.css`
- `apps/web/src/features/app-shell/AppShell.tsx`
- `apps/web/src/features/app-shell/AppShell.test.tsx`
- `apps/web/src/features/app-shell/CareerSaveControl.tsx`
- `apps/web/src/features/app-shell/CareerSaveControl.test.tsx`
- `apps/web/src/features/app-shell/UnsavedCareerDialog.tsx`
- `apps/web/src/features/app-shell/UnsavedCareerDialog.test.tsx`
- `apps/web/src/features/shared/CommandActivityIndicator.tsx`
- `apps/web/src/features/shared/CommandActivityIndicator.test.tsx`
- `apps/web/src/features/dashboard/CareerDashboardScreen.tsx`
- `apps/web/src/features/dashboard/CareerDashboardScreen.test.tsx`
- `apps/web/src/features/match-preparation/CareerMatchPreparationScreen.tsx`
- `apps/web/src/features/match-preparation/CareerMatchPreparationScreen.test.ts`
- `apps/web/src/features/matchday/CareerMatchdayScreen.tsx`
- `apps/web/src/features/matchday/CareerMatchdayScreen.test.ts`
- `apps/web/src/visual-qa/current-product.spec.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What NOT To Implement

- No theme selector, new palette, font replacement, or visual identity reset.
- No tactical-board color, pitch, suitability, form-arrow, or token change.
- No feature layout redesign beyond state geometry needed for consistency.
- No new icon dependency or component library.
- No accessibility claim based only on token names; test computed colors on
  rendered consumers.

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

- Inspect blocker, warning, success, selected, disabled, pending, error, and
  recovery states on desktop and narrow screenshots.
- Probe computed foreground/background contrast on the real blocker consumer.
- Verify focus-visible remains obvious against every semantic surface.
- Verify mouse hover, keyboard focus, active press, and disabled state are
  distinct but restrained.
- Confirm reduced motion retains every state change without animation reliance.
- Confirm the tactical board is pixel-identical to Step 01 evidence.

## Cleanup Boundary

Delete undefined token uses and local duplicate semantic-state declarations
replaced by the named contract. Keep feature-specific layout rules and tactical
geometry local.

## Completion Criteria

- The measured blocker pair passes WCAG AA.
- Shared interactive states are coherent on all current real consumers.
- Passive progress and future affordances no longer look actionable.
- No undefined used CSS variable remains in the current product.
- Step 03 can simplify Dashboard hierarchy without inventing local state styles.

