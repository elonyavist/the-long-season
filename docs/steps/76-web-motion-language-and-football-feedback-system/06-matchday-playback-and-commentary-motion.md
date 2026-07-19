# Step 06 - Matchday Playback And Commentary Motion

## Status

Done.

## Goal

Integrate the existing immutable Matchday playback frames with the shared
motion system so ordinary live commentary advances smoothly without growing a
log or confusing presentation timing with simulation.

## User-Visible Outcome

- The current commentary line is replaced with a short, readable transition.
- The score area, tabellino, and primary controls keep stable positions.
- Pause and speed changes respond immediately and never leave half-rendered
  events.
- First and second halves use the same restrained live rhythm.

## Scope

1. Keep `matchday-playback.ts` as the sole owner of immutable frame grouping,
   event priority, speed, pause, and hold policy.
2. Present commentary enter/exit using stable event/frame identity.
3. Ensure interrupted playback resolves to the latest current frame without a
   queue of exiting commentary nodes.
4. Add subtle micro feedback to pause/resume and speed selection while keeping
   their existing accessible control semantics.
5. Preserve one polite live region and prevent duplicate announcements during
   visual exit.
6. Remove replaced Matchday commentary keyframes/manual visual state only after
   the Motion path passes event-light and event-rich tests.

## Implementation Contract

- Playback timers and event holds remain independent from Motion duration.
- No `onAnimationComplete` advances a frame or starts a half.
- Only one current commentary fact is visible and announced.
- Ordinary events use the quiet transition category; this step does not add
  goal choreography.
- Reduced motion swaps commentary directly while retaining readable frame
  holds from the typed playback policy.

## Expected Files

- `apps/web/src/features/matchday/matchday-playback.ts`
- its focused test only if integration reveals a presentation-policy lesson
- `apps/web/src/features/matchday/CareerMatchdayScreen.tsx`
- its focused test
- `apps/web/src/features/matchday/MatchdayLivePhase.tsx`
- its focused test
- `apps/web/src/features/matchday/MatchdayPlaybackControls.tsx`
- its focused test
- `apps/web/src/shared/motion/web-motion.ts`
- `apps/web/src/styles/components.css`
- `apps/web/src/visual-qa/current-product.spec.ts`
- `docs/audits/WEB_MOTION_SYSTEM_REPORT.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What NOT To Implement

- No engine event, score, checkpoint, or match result change.
- No persistent playback cursor, timer, animation state, or revealed-event log.
- No goal, penalty, card, injury, crowd, or celebration choreography yet.
- No additional playback command or speed.
- No scrolling commentary list.

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

- Play event-light and event-rich halves at every current speed.
- Pause/resume near a frame change and navigate through reduced-motion mode.
- Confirm one commentary line, no vertical growth, no duplicate live-region
  announcements, and automatic checkpoint stops.

## Completion Criteria

- Both halves share one interruption-safe commentary transition.
- Presentation timing and simulation/checkpoint behavior remain separate.
- The Matchday layout remains stable throughout playback.
