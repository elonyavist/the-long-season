# Step 06 - Web Live Pause, Command And Session Orchestration

## Status

Done.

## Goal

Connect the canonical engine session to the browser with clear playback,
manual/automatic pauses, pending commands, and memory-only crash behavior.

## User-Visible Outcome

- The match can run at `1x`, `2x`, or `4x` and pause cleanly after the current
  minute.
- Automatic injury/red-card/half-time pauses explain why play stopped.
- The manager can resume immediately when nothing changed or apply/cancel
  pending decisions before resuming.
- Loading/command feedback appears immediately and the screen never looks
  frozen.

## Scope

1. Replace half-at-once browser progression with one memory-only web session
   adapter that requests engine minutes in order.
2. Keep playback cadence in the existing Matchday playback Module and engine
   state in the engine session; do not put authoritative match logic in Zustand.
3. Support `1x`, `2x`, `4x`, manual pause-at-end-of-minute, resume, and automatic
   decision pauses.
4. Stop playback while a command is pending, being validated, or being applied.
5. Maintain one pending command set with apply, cancel, and validation feedback.
6. Use `Riprendi partita`, `Applica e riprendi`, and `Annulla modifiche` according
   to pending state.
7. Open the tactical tab automatically for selected-club injury/red-card
   decisions without stealing focus unexpectedly.
8. Keep the live tactical surface view-only while the clock runs.
9. Preserve manual/7-day/15-day save policy and perform no live match write.
10. On refresh/reload, load the last durable career state and restart an
    unfinished match from pre-match rather than restoring a hidden checkpoint.
11. Adapt `@game/ui` matchday read models so React receives presentation-ready
    facts and action availability without engine imports.

## Implementation Contract

- The web adapter calls one public engine session Interface. React components
  do not step RNG or derive command legality.
- Playback speed is presentation state; phase, minute, score, commands, and
  pause reasons come from the engine session.
- Motion is feedback only. Timer completion never applies a command or advances
  a minute.
- Pending tactical edits are ephemeral and discarded on cancel, navigation,
  refresh, or match restart.
- Existing global command lock, `aria-busy`, focus, and error recovery behavior
  remain authoritative.

## Expected Files

- `packages/ui/src/career/career-matchday-view.ts`
- `packages/ui/src/career/career-matchday-phase-view.ts`
- focused `@game/ui` tests
- `apps/web/src/runtime/career-session.ts`
- `apps/web/src/runtime/web-career-runtime.ts`
- focused runtime tests
- `apps/web/src/features/matchday/matchday-adapter.ts`
- `apps/web/src/features/matchday/career-matchday-presenter.ts`
- `apps/web/src/features/matchday/matchday-playback.ts`
- focused Matchday adapter/presenter/playback tests
- `apps/web/src/features/matchday/CareerMatchdayScreen.tsx`
- `apps/web/src/features/matchday/MatchdayPlaybackControls.tsx`
- focused component tests
- `apps/web/src/app/use-career-command-runner.ts` only if the canonical command
  lifecycle requires it
- `apps/web/src/stores/career-ui-store.ts` only for ephemeral UI selection that
  cannot remain component-local
- `apps/web/src/visual-qa/current-product.spec.ts`
- `docs/audits/LIVE_MATCH_CONTROL_REPORT.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What NOT To Implement

- No final tab styling, statistics bars, tactical drag/drop, full-time review,
  storage checkpoint, autosave change, Web Worker, or background simulation.
- No engine state duplicated in Zustand.
- No timeout that auto-confirms a manager decision.
- No pause limit or substitution-window UI.

## Required Checks

```bash
nvm use 24
pnpm --filter @game/ui run test
pnpm --filter @game/web run test
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run build
pnpm web:visual:qa
pnpm depcruise
git diff --check
graphify update .
```

## Manual Inspection

- Start a match and test `1x`, `2x`, `4x`, pause during each half, resume, and
  repeated unlimited pauses.
- Trigger an automatic decision pause and confirm the reason and command state
  are clear and stable.
- Refresh during play and confirm the career returns to the last save boundary
  with the unfinished fixture ready to restart.
- Repeat with keyboard and reduced motion.

## Completion Criteria

- The browser drives the canonical minute session without precomputing a half.
- Speed, pause, pending changes, errors, and refresh behavior are explicit and
  tested.
- No live match storage write or duplicated engine truth exists in web state.
- The current surface remains usable before visual expansion in Step 07.
- Step 07 remains the only next implementation step.
