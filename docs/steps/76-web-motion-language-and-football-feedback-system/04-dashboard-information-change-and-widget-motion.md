# Step 04 - Dashboard Information Change And Widget Motion

## Status

Done.

## Goal

Give the manager's control room calm, meaningful update feedback without
animating static cards or making the screen resemble a SaaS dashboard.

## User-Visible Outcome

- The dominant manager task settles into view without delaying interaction.
- A changed score, table row, fixture, or attention state is understandable
  without the page jumping.
- Newly available football context appears once and then remains still.
- Static widgets and unchanged table rows do not repeatedly animate.

## Scope

1. Classify each current Dashboard block as `none`, `micro`, or `transition`.
2. Animate the initial dominant task and real post-command changes only.
3. Use stable keyed replacement for score/fixture/task values that genuinely
   changed; never count through fabricated intermediate values.
4. Preserve existing widget information hierarchy, table semantics, and one
   primary manager command.
5. Keep layout tracks and card dimensions stable during entry/removal.
6. Remove dashboard-specific CSS keyframes replaced by shared Motion presets.

## Implementation Contract

- Presenter facts remain pure and unchanged.
- Motion consumes stable IDs/keys already present in the presentation; it does
  not compare or infer football outcomes independently.
- No stagger may make lower information unavailable while the primary decision
  is ready.
- Table rows do not animate on scroll, sorting, or unrelated parent renders.
- Reduced motion presents final values immediately.

## Expected Files

- `apps/web/src/features/dashboard/CareerDashboardScreen.tsx`
- its focused test
- dashboard widget components currently rendered by that screen
- `apps/web/src/shared/motion/web-motion.ts`
- `apps/web/src/styles/layout.css`
- `apps/web/src/styles/components.css`
- `apps/web/src/visual-qa/current-product.spec.ts`
- `docs/audits/WEB_MOTION_SYSTEM_REPORT.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What NOT To Implement

- No new dashboard widget, fabricated form, squad-readiness card, finance fact,
  or information-architecture redesign.
- No animated counters that imply unobserved values.
- No permanent widget hover lift, card carousel, decorative entrance cascade,
  or moving background.
- No changes to Continue, Posta, preparation readiness, or table derivation.

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

- Inspect new career, unprepared match, prepared match, post-match, and
  Continue-stopped Dashboard states.
- Confirm unchanged widgets remain still and changed football facts are clear.
- Verify narrow, 200% text, keyboard focus, and reduced motion.

## Completion Criteria

- Dashboard movement is sparse, state-driven, and football-relevant.
- One primary task remains immediately actionable.
- No layout jump, repeated entrance, fake value, or new information appears.
