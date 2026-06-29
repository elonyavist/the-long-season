# Step 02 - Simulate Season Golden Regression

## Goal

Add a focused, structured golden regression test for `simulateSeason`.

This test should protect a stable season output from accidental drift while
remaining intentional enough that future gameplay changes can update it with a
clear reason.

## Expected files

- `packages/engine/src/use-cases/simulate-season.test.ts`
- `docs/audits/ENGINE_SAFETY_NET_AUDIT.md`
- `docs/PROJECT_STATUS.md`

## What to implement

- Add or extend a `simulateSeason` test using one stable seed.
- Pin structured facts, not localized CLI text. Useful candidates:
  - final table order;
  - points/goals for a small selected subset;
  - champion and bottom club IDs;
  - total played fixtures;
  - top scorer/assist/save player IDs if already exposed by structured result;
  - selected fixture result if needed as a compact sentinel.
- Keep the golden small enough to understand in a failing diff.
- Add a short comment explaining that this test protects accidental regression,
  not a permanent promise that balance can never change.
- Update the audit with the chosen golden facts and the update protocol.

## What NOT to implement

- Do not snapshot the full season object if it creates noisy, brittle diffs.
- Do not pin rendered CLI output.
- Do not change simulation behavior to match a desired golden.
- Do not alter generated content or balance config.
- Do not add a new test helper unless it removes real duplication inside this
  step.

## Required checks

```sh
nvm use 24
pnpm exec vitest run packages/engine/src/use-cases/simulate-season.test.ts
pnpm --filter @game/engine run typecheck
git diff --check
```

## Definition of Done

- `simulateSeason` has a deterministic golden sentinel.
- The test failure would be understandable to a junior developer.
- The audit explains when updating the golden is allowed.
- `docs/PROJECT_STATUS.md` records the adopted golden strategy.

