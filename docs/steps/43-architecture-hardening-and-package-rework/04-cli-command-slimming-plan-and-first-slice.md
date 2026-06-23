# 04 - CLI Command Slimming Plan And First Slice

## Goal

Make the CLI easier to read by separating command responsibilities without changing gameplay.

The CLI should be an adapter:

- parse user intent;
- call stable engine/content/storage/simulation-tools interfaces;
- render localized output.

It should not hide core gameplay sequencing that belongs in engine or future application-level use-cases.

## Expected files

- `apps/cli/src/commands/career.ts`
- `apps/cli/src/commands/career/parse-career-args.ts`
- `apps/cli/src/commands/career/progression.ts`
- `apps/cli/src/commands/career/format.ts`
- optional new file under `apps/cli/src/commands/career/`
- focused CLI tests for touched files
- `docs/audits/ARCHITECTURE_CLI_SLIMMING_PLAN.md`
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Read:
  - `docs/audits/ARCHITECTURE_PACKAGE_COMPLEXITY_INVENTORY.md`
  - `docs/audits/ARCHITECTURE_PUBLIC_INTERFACE_REVIEW.md`
- Inspect oversized CLI files and identify one narrow first slice.
- Prefer the career command slice unless Step 01 proves another CLI file has higher risk.
- Write `docs/audits/ARCHITECTURE_CLI_SLIMMING_PLAN.md` with:
  - current command responsibilities;
  - intended parse/execute/render split;
  - first slice selected;
  - files explicitly not touched yet.
- Implement only the first safe slice.
- Keep localized output behavior stable.
- Keep CLI argument names stable.
- Add or update focused CLI tests.
- If a moved function becomes a clearer entry point, add short TSDoc/JSDoc.
- Remove redundant local helpers if they become unused.

## What NOT to implement

- Do not rewrite all CLI commands.
- Do not split `simulate-season.ts` unless the audit selects it as the first narrow slice.
- Do not create a UI-facing application package in this step.
- Do not change command flags.
- Do not change localized strings except when moving render code requires existing keys.
- Do not move gameplay logic into CLI.
- Do not leave duplicate old and new render paths.

## Required checks

- `pnpm --filter @game/cli run typecheck`
- `pnpm --filter @game/i18n run typecheck`
- `pnpm exec vitest run apps/cli/src/commands/career.test.ts packages/i18n/src/labels.test.ts`
- `pnpm check`
- `pnpm cli career --save=phase43-cli --seed=world-a --new-world-preview`
- `pnpm cli career --save=phase43-cli --summary`
- `pnpm cli career --save=phase43-cli --squad`
- `git diff --check`

## Definition of Done

- One CLI area is easier to read without broad churn.
- The command keeps a clear parse/execute/render direction.
- Existing CLI output remains stable or intentional differences are documented.
- No duplicated old path is left behind.
- `docs/PROJECT_STATUS.md` points to Step 05 as the next active step.
