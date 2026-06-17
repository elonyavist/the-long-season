# Table Spread Review

## Goal

Review whether tuned season results produce a plausible table spread, not only plausible goal totals.

## Why we implement it this way

Goals and draw rate can improve while standings remain compressed or chaotic. The requirements emphasize credible long-season outcomes, so after rate tuning the project should inspect first-place points, last-place points, and upset proxy as a separate step.

## What to implement

- Run deterministic batch reports after rate tuning.
- Evaluate first-place points, last-place points, result split, and upset proxy together.
- Adjust only documented aggregate inputs if table spread is still implausible.
- Prefer target/profile refinement or fake league strength distribution before algorithm changes.
- Record the observed sample in `docs/PROJECT_STATUS.md`.

## What NOT to implement

- Do not add promotions, relegations, playoffs, cups, multi-league worlds, player growth, economy, transfers, injuries, or UI.
- Do not introduce real datasets or real identities.
- Do not change league-table sorting unless a focused bug is found and documented.
- Do not hide bad table spread by widening targets without recording the reason.

## Allowed dependencies

- `packages/content -> domain, shared`
- `packages/simulation-tools -> domain, engine, shared`
- `apps/cli -> engine, content, storage, simulation-tools, shared`
- `packages/engine -> domain, shared` only for focused bug fixes.

## Expected files

- `packages/content/src/generators/league-system.ts` if fake club strength distribution changes.
- `packages/content/src/balance/calibration-targets.ts` if target bands are refined.
- `packages/simulation-tools/src/calibration-report.ts` only if an aggregate table-spread metric is added.
- Relevant focused test files for any touched source file.
- `docs/PROJECT_STATUS.md`

## Required tests/checks

- `pnpm --filter @game/content run typecheck`
- `pnpm --filter @game/simulation-tools run typecheck` if report metrics change.
- Focused Vitest tests for touched package files.
- `pnpm check`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`

## Definition of Done

- Table spread has been reviewed separately from raw scoring.
- Any target or fake-content adjustment is documented with before/after samples.
- The project has a clear next step: either another calibration slice or a new gameplay phase.

## Claude Code task prompt

Read `requirements.md`, `docs/PROJECT_RULES.md`, `docs/PROJECT_STATUS.md`, `docs/steps/README.md`, and this step document. Review table spread after rate tuning and implement only the smallest documented adjustment needed. Do not add new gameplay systems. Update `docs/PROJECT_STATUS.md` and stop.
