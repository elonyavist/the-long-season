# Step 08 - Half-Time, Full-Time, And Substitution Motion

## Status

Done.

## Goal

Make canonical Matchday checkpoints and interval decisions feel like coherent
football moments while preserving their existing commands, facts, and tactical
workspace.

## User-Visible Outcome

- Half time arrives with a clear bounded transition from live playback to the
  decision workspace.
- Moving a substitute into the XI and changing formation gives visual
  continuity without hiding validation or change count.
- Starting the second half returns cleanly to live presentation.
- Full time settles into the tabbed review with one clear result and one exit.

## Scope

1. Add checkpoint transitions for pre-match -> first half -> half time ->
   second half -> full time using canonical phase state.
2. Preserve immediate command completion and heading focus independently from
   visual transition completion.
3. Reuse Step 05 tactical assignment motion inside the half-time board instead
   of adding a Matchday-only board implementation.
4. Add stable selected-tab content presence for half-time and full-time review
   tabs without making tabs look like animated buttons.
5. Add bounded result settlement at full time; consequences remain static facts
   behind their existing tab.
6. Verify refresh at pre-match, half time, and full time does not replay stale
   entrance sequences as if a new football event occurred.

## Implementation Contract

- Canonical checkpoint state remains authoritative.
- No phase command is triggered by `onAnimationComplete`.
- The half-time tactical board and bench reuse existing shared Modules.
- Tab state remains ephemeral and accessible; it is not persisted.
- Full-time motion does not reapply consequences or commit the fixture.
- Reduced motion changes phases directly and focuses the same heading/action.

## Expected Files

- `apps/web/src/features/matchday/CareerMatchdayScreen.tsx`
- its focused test
- `apps/web/src/features/matchday/MatchdayPhaseTabs.tsx`
- its focused test
- `apps/web/src/features/matchday/MatchdayHalfTimePhase.tsx`
- its focused test
- `apps/web/src/features/matchday/MatchdayFullTimePhase.tsx`
- its focused test
- shared tactical components only if a production reuse correction is needed
- `apps/web/src/shared/motion/web-motion.ts`
- `apps/web/src/styles/layout.css`
- `apps/web/src/styles/components.css`
- `apps/web/src/visual-qa/current-product.spec.ts`
- `docs/audits/WEB_MOTION_SYSTEM_REPORT.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What NOT To Implement

- No extra-time/penalty activation, new substitution rule, tactical advice,
  opponent decision, or Matchday command.
- No second tactical board, substitute picker, or phase controller.
- No replay of goal animation when restoring a durable checkpoint.
- No animated consequences grid or decorative full-time celebration.

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

- Complete the full pre-match -> first-half -> half-time edit -> second-half ->
  full-time -> Dashboard journey.
- Refresh at every durable checkpoint.
- Exercise all half-time/full-time tabs, keyboard focus, narrow layout, 200%
  text, and reduced motion.

## Completion Criteria

- Checkpoint changes are clear without becoming additional steps or commands.
- Half-time tactical changes reuse the shared motion/tactical system.
- Refresh, reduced motion, and full-time commit remain idempotent.
