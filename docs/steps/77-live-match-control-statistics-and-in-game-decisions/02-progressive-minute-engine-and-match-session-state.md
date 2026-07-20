# Step 02 - Progressive Minute Engine And Match Session State

## Status

Done.

## Goal

Make one deterministic minute-by-minute match session the canonical engine
driver for both batch simulation and interactive Matchday progression.

## User-Visible Outcome

No final visual redesign yet. Engine-level evidence proves that the game can
stop at any minute, apply a legal command, and resume without precomputing the
rest of the half or changing same-seed determinism.

## Scope

1. Build one engine-owned live match session around the existing one-minute
   `stepMatch` unit.
2. Progress through pre-match, first half, half time, second half, and full
   time without a hidden complete-half simulation.
3. Publish immutable minute snapshots containing phase, minute, score, events,
   lineups, bench state, tactics, and cumulative statistics.
4. Accept grouped validated commands only while the session is paused.
5. Apply confirmed substitutions/tactical changes after minute `N` so they
   affect minute `N + 1` onward.
6. Support unlimited manual pauses at end-of-minute boundaries and typed
   automatic pause reasons without implementing incident policies from Step 04.
7. Keep `1x`, `2x`, and `4x` outside engine timing; prove identical facts and
   result regardless of presentation cadence.
8. Route the batch simulator through the same session until full time.
9. Adapt staged career progression to consume the canonical session at its
   existing phase boundaries.
10. Delete superseded duplicate progression only after every active caller and
    parity test has moved.

## Implementation Contract

- The session is pure deterministic engine state. It imports only allowed
  domain/shared/content contracts and no browser, storage, React, Zustand, or
  Motion code.
- No complete future half/result may exist before its minutes are stepped.
- RNG consumption remains stable for identical seed and identical command
  history.
- The session may be serializable for tests and adapters, but Phase 77 does not
  persist it during live play.
- Existing career commit remains the only owner that makes a completed fixture
  durable.
- Batch and interactive drivers differ only in when they request the next
  minute and when they stop for commands.

## Expected Files

- `packages/engine/src/match-engine/step-match.ts`
- `packages/engine/src/match-engine/match-simulation-state.ts`
- `packages/engine/src/match-engine/match-simulation-runner.ts`
- `packages/engine/src/match-engine/staged-match-progression.ts`
- `packages/engine/src/match-engine/simulate-match.ts`
- new canonical session/command Modules under
  `packages/engine/src/match-engine/`
- focused engine tests
- `packages/engine/src/match-engine/index.ts`
- affected career progression tests only where the new session is consumed
- `docs/audits/LIVE_MATCH_CONTROL_REPORT.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What NOT To Implement

- No new statistics formulas, fouls, cards, injuries, AI decisions, web
  playback, drag/drop, or persistence writes.
- No Web Worker, interval timer, speed setting, or animation in engine.
- No mid-match save/checkpoint recovery.
- No second simulation path retained for convenience after migration.

## Required Checks

```bash
nvm use 24
pnpm --filter @game/engine run test
pnpm --filter @game/engine run typecheck
pnpm --filter @game/simulation-tools run typecheck
pnpm depcruise
git diff --check
graphify update .
```

## Manual Inspection

- Run fixed-seed traces with no commands and with a minute-specific tactical
  command; confirm facts before the command are identical and only later facts
  can differ.
- Compare batch and interactive drivers for the same seed/command history.
- Inspect a paused snapshot and confirm no future event or final result has been
  generated.

## Completion Criteria

- One minute session powers batch and staged progression.
- Pause/resume and grouped commands are deterministic and phase-safe.
- Presentation speed cannot affect football facts.
- Superseded duplicate progression code has no active caller or is deleted.
- Step 03 remains the only next implementation step.
