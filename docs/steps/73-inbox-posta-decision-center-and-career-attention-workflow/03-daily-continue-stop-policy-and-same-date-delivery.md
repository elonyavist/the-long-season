# Step 03 - Daily Continue Stop Policy And Same-Date Delivery

## Status

Pending.

## Goal

Make `Continue` evaluate canonical game days in order and return one message
batch for the first date that contains blocking or important attention.

## Scope

- Refactor the pure Continue use case around explicit dated attention inputs.
- Evaluate dates from current date through the next known boundary in ascending
  order without using wall-clock APIs.
- Deliver informational messages encountered before the stop date without
  treating them as stop reasons.
- Stop on the first date with blocking or unacknowledged important attention.
- Return every message for the stop date in one deterministic batch.
- Select/order blocking before important before informational, with stable ID
  as final tie-breaker.
- Reuse unresolved same-date blocking attention without advancing or duplicating
  it.
- Prove that prepared and incomplete fixtures both stop once on matchday.
- Keep fixture simulation, season rollover, storage writes, and presentation
  outside the pure use case.

## Expected files

- `packages/engine/src/career/continue-career.ts`
- `packages/engine/src/career/continue-career.test.ts`
- `packages/engine/src/index.ts`
- `apps/web/src/runtime/web-career-runtime.ts`
- `apps/web/src/runtime/web-career-runtime.test.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- `docs/steps/73-inbox-posta-decision-center-and-career-attention-workflow/04-durable-current-season-inbox-and-season-reset.md` only if a lesson changes future scope.

## Determinism requirements

- Day order uses `GameDate` arithmetic.
- Message order has an explicit stable final tie-breaker.
- Equal inputs return equal stop date, delivered IDs, and ordering.
- Several messages on one date never create several Continue stops.
- There is no RNG or real-time dependency.

## What NOT to implement

- No UI animation; Step 10 owns presentation timing.
- No artificial delay in engine or runtime.
- No fixture simulation while scanning days.
- No automatic resolution of blocking facts.
- No future-system event producers.

## Required checks

```bash
nvm use 24
pnpm exec vitest run packages/engine/src/career/continue-career.test.ts apps/web/src/runtime/web-career-runtime.test.ts
pnpm --filter @game/engine run typecheck
pnpm --filter @game/web run typecheck
pnpm depcruise
git diff --check
graphify update .
```

## Completion criteria

- Continue has one deterministic daily stop policy.
- Informational delivery does not interrupt advancement.
- Same-date batching and ordering are tested.
- Matchday creates one stop regardless of preparation readiness.
- No storage write or presentation timing enters engine.
- `docs/PROJECT_STATUS.md` marks Step 03 Done and Step 04 active.
