# Step 07 - Matchday Second Half Playback And Live Phase Composition

## Status

Done.

## Goal

Resume from the manager's half-time decision and present bounded second-half
playback through full time without another non-decision reveal click.

## Findings Closed

- Completion of `Q-P1-02` Matchday playback economy.
- Live-phase portion of `Q-P1-10` concentrated Matchday ownership.
- Second-half technical-content portion of `Q-P1-04`.
- Remaining live-playback portion of `Q-P2-05`.

## User-Visible Outcome

- Confirming valid half-time decisions is the only command needed to resume.
- The second half displays score, minute, and structured events with the same
  visual language as the first half.
- Playback reaches full time exactly once and presents a review state; it does
  not ask the manager to click again to reveal the result.
- Refresh, command conflict, reduced motion, and recoverable failure remain
  explicit and deterministic.

## Scope

1. Extend the bounded presentation policy to second-half facts.
2. Reuse the focused live-phase composition created in Step 06.
3. Connect valid half-time confirmation to the existing second-half checkpoint
   command and automatic full-time arrival.
4. Keep full-time acknowledgement as a later manager action, distinct from
   simulation or reveal.
5. Remove the obsolete second-half reveal command/state and duplicated live
   composition after replacement coverage passes.
6. Preserve deterministic consequence application and idempotent full-time
   commit.

## Implementation Contract

- Half-time changes remain the only manager decision between the two periods.
- Presentation timing reads existing facts and never changes engine outcomes.
- Full time is a stable review state; returning to Dashboard is not automatic.
- No skip control is introduced: playback is bounded and reduced motion reaches
  the same canonical state immediately.
- Reduced motion reaches the same canonical full-time state immediately.

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

- No new match command, simulation period, extra time, penalties, or cups.
- No engine, ratings, event, consequence, or persistence behavior change.
- No second live component or duplicated playback policy.
- No automatic Dashboard return.
- No timer or playback cursor in durable career state.
- No skip or reveal control without a manager decision.

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

- Capture half-time confirmation pending, second-half opening/midpoint/last
  event, full-time arrival, failure, desktop, narrow, and reduced-motion states.
- Verify first and second halves use one coherent live visual language.
- Refresh during second-half playback and at full time; verify one result and
  one consequence checkpoint.
- Verify no action appears that only reveals a predetermined result.
- Verify full time remains available for deliberate review.

## Cleanup Boundary

Delete the obsolete second-half reveal command/state and duplicate live JSX,
CSS, selectors, and assertions only after the full staged refresh journey is
green. Keep idempotent consequence and checkpoint logic.

## Completion Criteria

- Half-time confirmation reaches full time without another manager click.
- Second-half playback is bounded, accessible, and deterministic.
- Full-time result and consequences occur exactly once across refresh.
- One live-phase owner serves both periods without generic framework code.
- No dead second-half reveal path or duplicated playback composition remains.
