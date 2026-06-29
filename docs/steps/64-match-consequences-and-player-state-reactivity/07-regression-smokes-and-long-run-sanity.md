# 07 - Regression Smokes And Long-Run Sanity

## Goal

Run focused career, season, balance, and long-run checks to make sure Phase 64
did not destabilize the existing engine.

The goal is not to tune reports green. The goal is to catch obvious regressions
and classify any warnings by user-facing impact.

## Expected files

- `docs/audits/MATCH_CONSEQUENCES_REGRESSION_SMOKE.md`
- `docs/PROJECT_STATUS.md`

## What to implement

1. Run the required focused tests and smokes.
2. Generate a concise regression report:
   - commands run;
   - pass/fail result;
   - notable output from career advancement;
   - ten-season report status;
   - strict balance status;
   - warning classification if any.
3. If a check fails:
   - fix inside current Phase 64 scope if the failure is caused by this phase;
   - otherwise stop and document the blocker.

## What NOT to implement

- Do not tune match probabilities or long-run thresholds to silence warnings.
- Do not change player generation.
- Do not add new gameplay features.
- Do not start the next phase.

## Required checks

```bash
nvm use 24
pnpm exec vitest run packages/engine/src/career/career-match-state-consequences.test.ts
pnpm exec vitest run packages/engine/src/career/progress-fixture.test.ts
pnpm exec vitest run apps/cli/src/commands/career.test.ts
pnpm cli career --save=phase64-check --seed=world-a --new-world-preview
pnpm cli career --save=phase64-check --set-lineup-demo=pro01-first-team
pnpm cli career --save=phase64-check --set-tactic-demo=pro01-balanced
pnpm cli career --save=phase64-check --advance-next-fixture --fixture-explanation
pnpm cli career --save=phase64-check --summary
pnpm cli career --save=phase64-check --squad
pnpm cli ten-season-report --seed=phase64-world --seasons=10
pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict
pnpm check
test -f docs/audits/MATCH_CONSEQUENCES_REGRESSION_SMOKE.md
git diff --check
```

## Completion notes

Update `docs/PROJECT_STATUS.md` with:

- regression status;
- warning classification;
- fix or blocker;
- next action.

