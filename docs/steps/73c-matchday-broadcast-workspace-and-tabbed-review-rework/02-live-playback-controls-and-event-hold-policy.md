# Step 02 - Live Playback Controls And Event Hold Policy

## Status

Done.

## Goal

Give the manager clear control over presentation pace while making decisive
events readable for longer than routine moments.

## User-Visible Outcome

- First-half playback exposes compact Pause/Resume and speed controls.
- Available speeds are `1x`, `2x`, and `4x`; one is visibly selected.
- Ordinary moments advance quickly.
- Saves, blocks, and other current significant facts hold longer.
- Goals hold longest before playback continues.
- Controls never change the simulated score, events, or checkpoint.

## Scope

1. Replace one constant frame duration with a pure event-priority hold policy.
2. Add ephemeral playback state for paused/running and selected speed.
3. Make timer scheduling cancel-safe on pause, speed change, unmount, command
   failure, checkpoint change, and phase change.
4. Keep both first-half and second-half playback on the same policy.
5. Add accessible segmented controls or equivalent familiar controls.
6. Prove refresh restores canonical match state, not the old visual cursor.

## Hold Policy

The initial bounded baseline is:

- opening/closing transition: `700-1000ms`;
- ordinary miss/detail: `900-1200ms` at `1x`;
- save/block/significant chance: `1800-2500ms` at `1x`;
- goal: `4000-5000ms` at `1x`.

Speed scales presentation duration only. Minimum readable holds must remain
bounded so `4x` does not turn decisive facts into an inaccessible flash.
Exact values may be tuned from screenshots and browser timing evidence inside
this step, then locked in tests.

## Implementation Contract

- The policy consumes existing structured event priority; it never classifies
  a new gameplay incident by prose.
- Pausing freezes only the current presentation frame.
- No timer, speed, pause state, or playback cursor enters Zustand career truth,
  SQLite, CareerState, or the engine.
- Reduced motion may collapse transitions but must retain a readable decisive
  event state and the same final checkpoint.
- One shared hook/policy may exist because both halves are current consumers.

## Expected Files

- `apps/web/src/features/matchday/CareerMatchdayScreen.tsx`
- `apps/web/src/features/matchday/CareerMatchdayScreen.test.ts`
- `apps/web/src/features/matchday/matchday-playback.ts`
- `apps/web/src/features/matchday/matchday-playback.test.ts`
- `apps/web/src/features/matchday/MatchdayPlaybackControls.tsx`
- `apps/web/src/features/matchday/MatchdayPlaybackControls.test.tsx`
- `apps/web/src/styles/components.css`
- `apps/web/src/visual-qa/current-product.spec.ts`
- `packages/i18n/src/labels.ts`
- `packages/i18n/src/labels.test.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What NOT To Implement

- No simulation-speed control, resimulation, skip-result command, or engine
  clock.
- No persisted playback preference in this phase.
- No audio, commentary list, goal animation, or tabellino rework; Step 03-04
  own those surfaces.
- No generic media-player dependency.

## Required Checks

```bash
nvm use 24
pnpm --filter @game/i18n run test
pnpm --filter @game/web run test
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run build
pnpm web:visual:qa
git diff --check
graphify update .
```

## Manual Inspection

- Capture first-half playback at `1x`, paused, `2x`, `4x`, goal hold, and
  reduced-motion states.
- Verify controls remain secondary to score and commentary.
- Pause during an ordinary frame and a goal; resume and confirm no event is
  skipped or duplicated.
- Change speed mid-frame and confirm the interface neither freezes nor jumps to
  an incoherent score.
- Verify keyboard order, selected state, target size, and live announcements.

## Cleanup Boundary

Remove the constant-duration path, duplicated first/second-half timer logic,
and obsolete tests only after both halves use the new pure policy. Do not leave
an alternate hidden playback path.

## Completion Criteria

- One tested policy owns event holds for both halves.
- Pause/Resume and speed are useful, accessible, and presentation-only.
- Goal holds are visibly longer than routine facts.
- Refresh, failure, unmount, and reduced motion cannot leak timers or mutate
  match truth.
- The user can inspect and tune playback behavior before Step 03 starts.
