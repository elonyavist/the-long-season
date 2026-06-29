# 07 - Regression Command Pack And No-Third-Path Check

## Goal

Prove that the project now has one canonical season advancement path and that existing career/report commands still work.

This is a verification and cleanup step.

## Expected files

- `docs/audits/CAREER_ADVANCEMENT_NO_THIRD_PATH_REPORT.md`
- `docs/audits/CAREER_ADVANCEMENT_LONG_RUN_SMOKE.md`
- `docs/PROJECT_STATUS.md`

## What to implement

1. Search the codebase for direct adapter-level orchestration of:
   - player development;
   - player exits;
   - youth lifecycle;
   - youth intake;
   - youth promotion;
   - squad maintenance;
   - transfer turnover;
   - season rollover.
2. Document every remaining direct call.
3. Classify remaining direct calls as:
   - allowed fixture-level/domain helper;
   - allowed unit-test setup;
   - duplicate season orchestration to fix now;
   - blocked duplicate that requires a future phase.
4. Run the required command pack.
5. Write a concise no-third-path report.
6. If any adapter still owns season advancement order, fix it in scope before moving on.

## What NOT to implement

- Do not silence warnings by changing thresholds.
- Do not delete useful tests.
- Do not add unrelated refactors.
- Do not add gameplay systems.
- Do not start the next phase.

## Required checks

```bash
nvm use 24
rg -n "develop|exit|youth|promotion|maintenance|turnover|rollover|advanceCareer" apps packages
pnpm exec vitest run packages/engine/src/career/advance-career-season.test.ts
pnpm exec vitest run apps/cli/src/commands/career.test.ts
pnpm exec vitest run apps/cli/src/commands/ten-season-report.test.ts
pnpm exec vitest run packages/simulation-tools/src/long-run/career-long-runner.test.ts
pnpm cli career --save=phase63-check --development-report
pnpm cli ten-season-report --seed-prefix=phase63-gate --worlds=50 --seasons=10 --report-output=docs/audits/CAREER_ADVANCEMENT_LONG_RUN_SMOKE.md
test -f docs/audits/CAREER_ADVANCEMENT_NO_THIRD_PATH_REPORT.md
git diff --check
```

## Completion notes

Update `docs/PROJECT_STATUS.md` with:

- active step path;
- no-third-path result;
- smoke report result;
- remaining risks, if any.
