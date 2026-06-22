# Step 06 - CLI Fixture Explanation Inspection

## Goal

Expose the new match explanation trace for one fixture through CLI inspection.

This is for debugging and future UI design, not for automatic tactical advice.

## Context

The CLI already supports `simulate-season --fixture=<fixtureId>`. This step
should add a small optional trace view that helps a human inspect why the match
shape made sense.

## Expected files

- `apps/cli/src/commands/simulate-season.ts`
- focused CLI tests
- i18n label files if new user-facing labels are printed
- `docs/audits/ENGINE_QUALITY_HARDENING_AND_TRACE_REPORT.md`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Add a CLI option for fixture explanation trace, such as
  `--fixture-explanation`.
- Require it to be used with `--fixture=<fixtureId>`.
- Render compact localized sections for:
  - team strength;
  - tactic distribution;
  - lineup/role context;
  - condition impact if present;
  - chance summary.
- Keep output factual. Do not recommend actions.
- Keep default `--fixture` output unchanged unless the new flag is present.
- Add tests for:
  - flag validation;
  - localized labels;
  - stable fixture output with and without trace;
  - no hardcoded presentation text.
- Update `docs/PROJECT_STATUS.md`.

## What NOT to implement

- Do not build UI.
- Do not add LLM or narrative prose.
- Do not add tactical advice.
- Do not change simulation results.
- Do not expose hidden potential/scouting values.
- Do not start Step 07.

## Required checks

- `pnpm --filter @game/cli run typecheck`
- `pnpm --filter @game/i18n run typecheck` if labels are touched
- focused CLI/i18n tests
- `pnpm check`
- `pnpm cli simulate-season --seed=world-a --fixture=fixture:000001`
- `pnpm cli simulate-season --seed=world-a --fixture=fixture:000001 --fixture-explanation`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`
- `git diff --check`

## Definition of Done

- Fixture explanation output is available only when requested.
- Current fixture detail output remains available.
- User-facing labels are localized.
- No simulation behavior changes.
- `docs/PROJECT_STATUS.md` points to Step 07 as the next active step.
