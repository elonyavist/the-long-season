# Phase 47 - Pre-UI Engine Confidence Gate

## Goal

Audit the current engine and career loop before starting UI-facing work.

The goal is not to tune numbers just to make reports look cleaner. The goal is
to decide whether the game is credible, understandable, and fun enough to expose
through the first UI slice.

This phase should produce evidence, not broad refactors. If a real blocker is
found, document it precisely and either fix it inside a scoped step or stop with
a clear next action.

## Product intent

- Protect the future UI from exposing weak engine behavior too early.
- Judge the engine through manager-facing questions, not only metrics.
- Separate healthy football variance from logic holes.
- Keep fun and career storytelling above mathematical neatness.
- Make any blocker concrete: what the user would see, why it feels wrong, and
  which system owns the fix.

## Architecture intent

- Keep engine, content, storage, simulation-tools, i18n, and CLI boundaries
  unchanged unless a documented blocker proves a scoped change is required.
- Prefer audit reports and sample commands over speculative tuning.
- Reuse existing inspection tools:
  - `simulate-season --fixture --fixture-explanation`;
  - `career --summary`;
  - `career --squad`;
  - `career --development-report`;
  - `ten-season-report`;
  - balance report strict mode.
- Do not create UI-facing contracts in this phase.
- Keep the next UI readiness phase as Phase 48.

## Ordered steps

1. `01-engine-confidence-scope.md`
2. `02-match-engine-sample-review.md`
3. `03-career-loop-sample-review.md`
4. `04-player-generation-sanity-review.md`
5. `05-fun-signals-and-blocker-classification.md`
6. `06-pre-ui-engine-confidence-report.md`

## Phase-level checks

- Required audit files for completed steps exist.
- `pnpm check`
- `pnpm cli simulate-season --seed=world-a`
- `pnpm cli simulate-season --seed=world-a --fixture=fixture:000001 --fixture-explanation`
- `pnpm cli career --save=phase47-engine-check --seed=world-a --new-world-preview`
- `pnpm cli career --save=phase47-engine-check --summary`
- `pnpm cli ten-season-report --seed-prefix=phase47-engine --worlds=10 --seasons=10`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`
- `git diff --check`

## What NOT to implement in this phase

- No UI readiness contracts.
- No React, web app, or Tauri work.
- No broad refactor.
- No tuning just to remove warnings.
- No warning suppression.
- No new gameplay feature.
- No market, youth, development, or match-engine algorithm change unless a step
  proves a specific pre-UI blocker and scopes the change explicitly.
- No save schema change.
- No hardcoded user-facing labels.
- No dead wrappers, compatibility leftovers, or deferred cleanup.

## Definition of Done

- The current match engine has been sampled through explanation traces.
- The current career loop has been sampled across multi-season behavior.
- Player generation has been sanity-checked for role/division credibility.
- Findings are classified by user-facing impact.
- The phase report states one of:
  - ready for Phase 48 UI readiness;
  - ready with non-blocking post-UI improvements;
  - blocked by a specific engine/content/career issue.
- `docs/PROJECT_STATUS.md` records the decision and next action.
