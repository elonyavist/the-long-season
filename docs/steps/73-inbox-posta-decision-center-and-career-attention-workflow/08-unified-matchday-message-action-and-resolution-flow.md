# Step 08 - Unified Matchday Message Action And Resolution Flow

## Status

Pending.

## Goal

Make the single matchday message the direct, preparation-aware blocking decision
that leads the manager to the match.

## Scope

- Produce exactly one blocking message on the selected club fixture date.
- Include opponent, home/away, competition, round, and current preparation
  readiness as structured detail facts.
- Derive lineup, bench, and tactic blocker rows from the current preparation.
- Show `Prepare match` as the single primary action while any required
  preparation fact is missing.
- Show `Go to match` when preparation is complete.
- Return from preparation to the same selected message and refresh it in place.
- Resolve the blocking message only when the fixture workflow has genuinely
  moved past the required attention state.
- Prevent stale or duplicate preparation/matchday messages after match entry,
  full-time review, dashboard return, save/load, and repeated Continue.
- Preserve direct focused matchday mode without global Posta chrome once the
  manager enters the match centre.
- Remove old `prepare_match` versus `open_matchday` routing branches that no
  longer represent distinct messages.

## Expected files

- `packages/engine/src/career/continue-career.ts`
- `packages/engine/src/career/continue-career.test.ts`
- `packages/engine/src/career/career-inbox-lifecycle.ts`
- `packages/engine/src/career/career-inbox-lifecycle.test.ts`
- `packages/ui/src/career/career-inbox-view.ts`
- `packages/ui/src/career/career-inbox-view.test.ts`
- `apps/web/src/runtime/web-career-runtime.ts`
- `apps/web/src/runtime/web-career-runtime.test.ts`
- `apps/web/src/features/inbox/career-inbox-presenter.ts`
- `apps/web/src/features/inbox/career-inbox-presenter.test.ts`
- `apps/web/src/features/inbox/InboxMessageDetail.tsx`
- `apps/web/src/features/inbox/InboxMessageDetail.test.tsx`
- `apps/web/src/features/match-preparation/CareerMatchPreparationScreen.tsx`
- `apps/web/src/features/match-preparation/CareerMatchPreparationScreen.test.ts`
- `apps/web/src/features/matchday/CareerMatchdayScreen.tsx`
- `apps/web/src/features/matchday/CareerMatchdayScreen.test.ts`
- `apps/web/src/stores/career-ui-store.ts`
- `apps/web/src/stores/career-ui-store.test.ts`
- `apps/web/src/app/App.tsx`
- `apps/web/src/app/app.test.tsx`
- `packages/i18n/src/labels.ts`
- `packages/i18n/src/labels.test.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- `docs/steps/73-inbox-posta-decision-center-and-career-attention-workflow/09-informational-important-delivery-and-future-extension-matrix.md` only if a lesson changes future scope.

## Flow requirements

- Dashboard Continue reaches one Posta stop.
- Incomplete preparation reaches preparation in one action.
- Complete preparation reaches pre-match in one action.
- Returning from preparation does not create a new message ID.
- The manager never clicks a generic acknowledgement before playing.
- A played fixture cannot retain a blocking matchday message.

## What NOT to implement

- No second preparation message.
- No earlier pre-match-day preparation stop.
- No automatic lineup, bench, or tactic decision.
- No tactical-board or match-centre redesign.
- No duplicate dashboard CTA competing with the selected Posta action.

## Required checks

```bash
nvm use 24
pnpm exec vitest run packages/engine/src/career/continue-career.test.ts packages/engine/src/career/career-inbox-lifecycle.test.ts packages/ui/src/career/career-inbox-view.test.ts apps/web/src/runtime/web-career-runtime.test.ts apps/web/src/features/inbox apps/web/src/features/match-preparation apps/web/src/features/matchday apps/web/src/stores/career-ui-store.test.ts apps/web/src/app/app.test.tsx packages/i18n/src/labels.test.ts
pnpm --filter @game/engine run typecheck
pnpm --filter @game/ui run typecheck
pnpm --filter @game/i18n run typecheck
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run build
pnpm depcruise
git diff --check
graphify update .
```

## Completion criteria

- Matchday is one blocking message and one stable identity.
- Primary action changes from preparation to match entry from real readiness.
- Resolution follows fixture state and cannot be faked by the UI.
- The complete route has no stale or duplicate attention.
- Replaced action/message branches are deleted.
- `docs/PROJECT_STATUS.md` marks Step 08 Done and Step 09 active.
