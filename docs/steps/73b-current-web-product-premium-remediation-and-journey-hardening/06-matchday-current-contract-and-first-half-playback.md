# Step 06 - Matchday Current Contract And First Half Playback

## Status

Done.

## Goal

After one explicit Start match command, present bounded first-half playback and
stop at the real half-time decision without a second non-decision reveal click.

## Findings Closed

- First-half ownership of `Q-P1-02` Matchday playback economy.
- Pre-match and first-half ownership of `Q-P1-04` technical content leaks.
- First extraction boundary for `Q-P1-10` concentrated Matchday ownership.
- `Q-P2-05` motion and reduced-motion semantics for first-half playback.

## User-Visible Outcome

- Pre-match has one clear Start match action.
- Starting the match enters a focused first-half live presentation with score,
  minute, and structured events progressing visibly.
- The presentation stops automatically at the persisted half-time checkpoint.
- Reduced-motion users reach the same checkpoint immediately with coherent
  command feedback.
- Refresh during or after playback restores canonical checkpoint state without
  a changed score or duplicated event.

## Scope

1. Make the current `phaseView` contract mandatory between presenter, adapter,
   store, and screen.
2. Delete the production fallback phase derivation only after all current
   callers and fixtures provide the mandatory contract.
3. Introduce one bounded presentation-only playback policy over already
   computed first-half facts.
4. Extract a focused first-half live composition from the Matchday screen.
5. Keep the typed command runner as the only mutation lock and checkpoint the
   first half exactly once.
6. Remove the obsolete manager command whose only effect was revealing the
   already-determined first-half result.
7. Localize every visible state and omit unavailable technical facts.

## Implementation Contract

- The engine still computes deterministic structured facts and checkpoints;
  presentation timing never resimulates or changes them.
- Start match remains explicit because it is a real manager commitment.
- Playback duration is bounded and informative, not a fake loading delay or
  gameplay timer.
- Reduced motion skips non-essential interpolation but preserves pending,
  success, error, score, event, and checkpoint meaning.
- Reloading cannot replay a mutation or commit the same checkpoint twice.
- Extra time, penalties, tactical effects, and simulation balance stay out of
  scope.

## Expected Files

- `apps/web/src/app/App.tsx`
- `apps/web/src/app/app.test.tsx`
- `apps/web/src/features/matchday/CareerMatchdayScreen.tsx`
- `apps/web/src/features/matchday/CareerMatchdayScreen.test.ts`
- `apps/web/src/features/matchday/career-matchday-presenter.ts`
- `apps/web/src/features/matchday/matchday-adapter.ts`
- `apps/web/src/features/matchday/matchday-adapter.test.ts`
- `apps/web/src/features/matchday/matchday-playback.ts`
- `apps/web/src/features/matchday/matchday-playback.test.ts`
- `apps/web/src/features/matchday/MatchdayLivePhase.tsx`
- `apps/web/src/features/matchday/MatchdayLivePhase.test.tsx`
- `apps/web/src/stores/career-ui-store.ts`
- `apps/web/src/stores/career-ui-store.test.ts`
- `apps/web/src/runtime/web-career-runtime.ts`
- `apps/web/src/runtime/web-career-runtime.test.ts`
- `apps/web/src/styles/layout.css`
- `apps/web/src/styles/components.css`
- `apps/web/src/visual-qa/current-product.spec.ts`
- `packages/i18n/src/labels.ts`
- `packages/i18n/src/labels.test.ts`
- `docs/ARCHITECTURE.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What NOT To Implement

- No engine simulation, rating, event, consequence, or balance change.
- No interval or second-half redesign; Steps 07-08 own them.
- No fake asynchronous delay, timer stored in career state, or interval loop
  that can outlive the mounted screen.
- No generic state machine library or reusable match-viewer framework.
- No skip control; the bounded presentation and reduced-motion path make it
  unnecessary in this phase.

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

- Capture pre-match, Start pending, first-half opening/midpoint/last event,
  half-time arrival, command failure, desktop, narrow, and reduced-motion
  states.
- Confirm score/minute/event hierarchy reads as live football, not a log table.
- Refresh during playback and at half-time; verify one canonical score and one
  checkpoint.
- Verify the manager makes one click from pre-match to the half-time decision.
- Verify focus and live-region announcements are useful and not repetitive.

## Cleanup Boundary

Delete the obsolete first-half reveal action/state, legacy phase-view fallback,
and replaced first-half JSX/CSS only after mandatory-contract and refresh tests
pass. Preserve checkpoint and recovery paths.

## Completion Criteria

- One Start match command reaches half-time without another manager click.
- First-half presentation is bounded, accessible, and fact-preserving.
- Refresh cannot resimulate or duplicate the checkpoint.
- The mandatory current phase contract has no production fallback.
- No dead first-half action, state, branch, timer, or compatibility path remains.
