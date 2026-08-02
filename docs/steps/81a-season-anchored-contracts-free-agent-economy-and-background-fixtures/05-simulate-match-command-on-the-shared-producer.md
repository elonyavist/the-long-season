# Step 05 - Simulate-Match Command On The Shared Producer

## Status

Not started.

## Entry Gate

- Step 04 is Done: background fixtures resolve inside `advanceCareerMonths` and
  are idempotent and order-independent.

## Goal

Let the manager skip his own match and get a result immediately, produced by the
same code that produces every background result.

## User-Facing Reason

Not every match deserves ninety minutes of attention. Skipping one should cost
the manager nothing in credibility: the result must be the result he would have
got by playing it.

## What To Implement

- Add a simulate-match command to the canonical career advancement path,
  alongside the existing start-match flow, producing a full-time result and
  committing it through the same idempotent full-time commit.
- Route it through the exact producer used for background fixtures. The command
  is a presentation choice; it introduces no second notion of team strength and
  no second result path.
- Preserve the manager's committed preparation: selected lineup, formation, and
  tactics apply exactly as they would in a played match.
- Preserve the RNG key. The same fixture simulated and played derives from
  `(worldSeed, fixtureId)`, so skipping cannot be used to reroll a result: a
  discarded and retried simulation returns the same score.
- Add the command to the web matchday surface with an explicit, non-accidental
  affordance and a confirmation, since it forfeits live decisions.
- Prove neutrality: over a bounded paired-seed sample, results produced through
  the simulate command and through background resolution have coincident
  distributions on goals, home advantage, and outcome share. A systematic
  divergence is a defect in the shared producer and is fixed there.
- Add tests for: preparation honoured; identical result on repeat; commit
  idempotency; and the neutrality comparison with positive observation counts.

## Clean-Code Requirements

- One producer. If the command needs a code path the background resolution does
  not have, that is a signal the seam is wrong, not that a second path is
  needed.
- The confirmation and affordance live in the web Adapter; no gameplay decision
  is taken in React.
- No duplicated full-time commit; reuse the existing idempotent one.

## What NOT To Implement

- No fast-forward over multiple of the manager's own matches in one command.
- No result preview, retry, or reroll affordance.
- No match-engine change.
- No aggregate or statistical producer: this is the same L1 producer, not a
  cheaper one.

## Expected Files

- `packages/engine/src/career/progress-fixture.ts`
- `packages/engine/src/career/progress-fixture.test.ts`
- `packages/engine/src/career/background-fixture-resolution.ts`
- `packages/engine/src/index.ts`
- `apps/web/src/runtime/web-career-runtime.ts`
- `apps/web/src/runtime/web-career-runtime.test.ts`
- `apps/web/src/features/matchday/CareerMatchdayScreen.tsx`
- `apps/web/src/features/matchday/CareerMatchdayScreen.test.ts`
- `apps/web/src/features/matchday/matchday-adapter.ts`
- `apps/web/src/features/matchday/matchday-adapter.test.ts`
- `apps/web/src/visual-qa/current-product.spec.ts`
- `packages/ui/src/career/career-matchday-view.ts`
- `packages/i18n/src/labels.ts`
- `packages/simulation-tools/src/market-economy/market-economy-audit.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- this step document

## Required Checks

```bash
nvm use 24
pnpm exec vitest run \
  packages/engine/src/career/progress-fixture.test.ts \
  apps/web/src/runtime/web-career-runtime.test.ts \
  apps/web/src/features/matchday/CareerMatchdayScreen.test.ts \
  apps/web/src/features/matchday/matchday-adapter.test.ts
pnpm check
pnpm --filter @game/web run build
pnpm web:visual:qa
pnpm depcruise
git diff --check
graphify update .
```

## Definition Of Done

- The manager can simulate his own match and the result commits once.
- Committed preparation applies to a simulated match exactly as to a played one.
- Repeating the command on the same fixture returns the same result; skipping is
  not a reroll.
- Simulated and background results share one producer, proven by a paired-seed
  distribution comparison with positive observations and no systematic
  divergence.
- The affordance cannot be triggered accidentally.
- Browser QA covers the command end to end.
- Step 06 is the only next action.
