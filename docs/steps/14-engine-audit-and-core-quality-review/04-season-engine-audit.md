# Season Engine Audit

## Goal

Audit the season simulation pipeline from calendar generation through final table, player summaries, condition lifecycle, setup overrides, and lineup overrides.

## Why we implement it this way

Market and youth systems will mostly affect seasons, not isolated fixtures. The season pipeline must reliably connect fixtures, results, standings, player summaries, manual lineup choices, manual tactical choices, and condition consequences.

## What to implement

- Add or update the `4. Season Engine Audit` section in `docs/audits/ENGINE_CORE_AUDIT.md`.
- Review:
  - calendar generation;
  - fixture result application;
  - league table computation;
  - `simulateSeason`;
  - player goal/assist/save summary aggregation;
  - fitness spend/recovery lifecycle;
  - setup overrides;
  - fixture lineup overrides;
  - balance report integration.
- Check whether season outputs are derived from durable reports rather than recomputed in CLI.
- Check whether default behavior remains stable when optional overrides are absent.
- Check whether state slices are becoming too fragmented, especially fixture state in relation to `GameState`.

## What NOT to implement

- Do not add persistence or career saves.
- Do not add promotion/relegation.
- Do not add transfer windows, youth intake, contracts, or economy.
- Do not change balance targets or scoring rates.
- Do not auto-select lineups or tactics.

## Allowed dependencies

- No new dependencies.
- Documentation-only output is expected.

## Expected files

- `docs/audits/ENGINE_CORE_AUDIT.md`
- `docs/PROJECT_STATUS.md`

## Required tests/checks

- `pnpm --filter @game/engine run typecheck`
- `pnpm --filter @game/simulation-tools run typecheck`
- `pnpm exec vitest run packages/engine/src/season-engine packages/engine/src/use-cases packages/simulation-tools/src`
- `pnpm cli simulate-season --seed=demo-001`
- `pnpm cli simulate-season --seed=demo-001 --condition-demo=pro01-season`
- `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006 --lineup-demo=pro01-rotated`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`

## Definition of Done

- The audit report explains whether the season pipeline can support long-term squad-building features.
- Any mismatch between season results, fixture reports, tables, player summaries, and condition state is recorded.
- Any known state-model consolidation need is recorded with a recommended future step.
- `docs/PROJECT_STATUS.md` records the step result and next action.

## Claude Code task prompt

Read the required project docs and this step. Audit the season engine pipeline, run the listed checks, update the `4. Season Engine Audit` section in `docs/audits/ENGINE_CORE_AUDIT.md`, update `docs/PROJECT_STATUS.md`, and stop after this step.
