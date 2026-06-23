# 06 - Long-Run Diagnostics Module Cleanup

## Goal

Make long-run diagnostics easier to extend by moving report-model logic toward `@game/simulation-tools` and keeping CLI rendering thin.

The CLI should launch diagnostics and print output. The diagnostic meaning, thresholds, anomaly categories, and structured report model should live in simulation tools.

## Expected files

- `packages/simulation-tools/src/long-run/long-runner.ts`
- `packages/simulation-tools/src/long-run/career-long-runner.ts`
- `packages/simulation-tools/src/long-run/anomaly-scoring.ts`
- optional new file under `packages/simulation-tools/src/long-run/`
- `packages/simulation-tools/src/index.ts`
- focused simulation-tools tests for touched files
- `apps/cli/src/commands/ten-season-report.ts`
- focused CLI tests only if command composition changes
- `docs/audits/ARCHITECTURE_LONG_RUN_DIAGNOSTICS_REVIEW.md`
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Read:
  - `docs/audits/ARCHITECTURE_PACKAGE_COMPLEXITY_INVENTORY.md`
  - `docs/audits/ARCHITECTURE_PUBLIC_INTERFACE_REVIEW.md`
- Inspect:
  - `apps/cli/src/commands/ten-season-report.ts`
  - `packages/simulation-tools/src/long-run/`
- Identify report model logic that belongs in simulation tools.
- Identify pure rendering logic that should stay in CLI.
- Implement one narrow cleanup slice only.
- Preserve current report thresholds and semantics.
- Preserve long-run command flags.
- Keep simulation-tools free from content, storage, i18n, and apps imports.
- Add TSDoc to any new exported report model function/type.
- Remove redundant CLI helper logic if moved.

## What NOT to implement

- Do not tune thresholds.
- Do not reinterpret warnings.
- Do not add new long-run metrics.
- Do not run expensive 10,000-world gates unless explicitly requested.
- Do not create UI/HTML reports.
- Do not move localized text into simulation-tools.
- Do not leave duplicate model builders in CLI.

## Required checks

- `pnpm --filter @game/simulation-tools run typecheck`
- `pnpm --filter @game/cli run typecheck`
- `pnpm exec vitest run packages/simulation-tools/src/long-run/*.test.ts apps/cli/src/commands/ten-season-report.test.ts`
- `pnpm check`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`
- `git diff --check`

## Definition of Done

- The selected diagnostic logic has clearer ownership.
- CLI report code is thinner or the audit explains why moving it would be premature.
- Existing warning semantics and thresholds are preserved.
- No package dependency violation is introduced.
- `docs/PROJECT_STATUS.md` points to Step 07 as the next active step.
