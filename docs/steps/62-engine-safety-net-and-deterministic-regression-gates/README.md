# Phase 62 - Engine Safety Net And Deterministic Regression Gates

## Goal

Add a small, fast, explicit safety net before touching career advancement,
player-state consequences, season rollover, and match-balance behavior.

This phase does not try to make reports greener. It protects the football
credibility and determinism that future phases will rely on.

## Product intent

The manager must be able to trust that:

- the same save and seed produce the same football world;
- future engine changes do not silently alter match or season behavior;
- rare results, low-scoring matches, and tight seasons remain possible;
- tests protect user-facing football plausibility, not only implementation
  details.

## Architecture intent

- Keep the engine as the owner of deterministic simulation behavior.
- Keep tests close to the Module whose Interface they protect.
- Prefer structured outputs over localized CLI prose for golden evidence.
- Use CLI commands only as smoke checks, not as the primary regression oracle.
- Do not introduce new Adapters or new user-facing screens.

## Ordered Steps

1. `01-current-regression-surface-audit.md`
2. `02-simulate-season-golden-regression.md`
3. `03-match-edge-case-determinism-tests.md`
4. `04-career-fixture-determinism-smoke.md`
5. `05-long-run-verification-command-pack.md`
6. `06-phase-report-and-next-phase-decision.md`

## Phase-Level Checks

Run after the final step:

```sh
nvm use 24
pnpm exec vitest run packages/engine/src/use-cases/simulate-season.test.ts
pnpm exec vitest run packages/engine/src/match-engine/simulate-match.test.ts
pnpm exec vitest run packages/engine/src/career/progress-fixture.test.ts
pnpm check
pnpm cli simulate-season --seed=world-a
pnpm cli simulate-season --seed=world-a --fixture=fixture:000001 --fixture-explanation
pnpm cli career --save=phase62-check --seed=world-a --new-world-preview
pnpm cli career --save=phase62-check --summary
pnpm cli career --save=phase62-check --advance-next-fixture
pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict
git diff --check
graphify update .
```

## What NOT To Implement In This Phase

- Do not tune match probabilities, table spread, player generation, development,
  or long-run thresholds.
- Do not add new gameplay systems.
- Do not add UI, React screens, web routes, or Playwright specs.
- Do not implement canonical season advancement yet; that is Phase 63.
- Do not add post-match form or morale consequences yet; that is Phase 64.
- Do not change save schema.
- Do not change user-facing labels unless a touched test requires an existing
  localization key correction.
- Do not make golden tests depend on localized CLI text.
- Do not suppress warnings or relax existing gates.

## Definition Of Done

- The current engine regression surface is documented.
- `simulateSeason` has a pinned structured golden regression test for a stable
  seed.
- Match simulation has explicit low-event or 0-0 coverage and deterministic
  repeat coverage.
- Career fixture progression has a deterministic smoke/regression test through
  the current engine Interface.
- The project has a documented long-run verification command pack for future
  engine-changing phases.
- The final report explains what the safety net protects, what remains
  intentionally uncovered, and recommends exactly one next phase.
- `pnpm check` passes.

