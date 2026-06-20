# Squad Fit Naming Cleanup

## Goal

Remove stale internal wording that describes factual formation/squad-fit notes as market hints or recommendations.

## Why we implement it this way

The manager chooses how to interpret formation fit. The game can show facts:

- natural coverage;
- adapted-only slots;
- weak depth;
- missing slots;
- extra depth.

It must not tell the manager what market action to take. Phase 12/13 already changed the user-facing output, but Phase 14 found stale comment wording in CLI source.

This step keeps the code vocabulary aligned with the product decision: factual squad-fit inspection, not market advice.

## What to implement

- Scan CLI/source code for stale market/recommendation wording around formation fit and squad fit.
- Rename comments, helper names, local variable names, and test descriptions where they imply market advice.
- Keep runtime output unchanged unless the output still contains recommendation/advice wording.
- Keep localization keys factual.
- Do not remove legitimate future roadmap/docs mentions of market unless they are presented as current behavior.

## What NOT to implement

- Do not implement market.
- Do not hide factual formation-fit warnings.
- Do not add recommendations such as buy/sell/loan/replace.
- Do not change formation-fit algorithms.
- Do not add hardcoded user-facing labels.
- Do not broaden this into a general CLI refactor; Step 04 owns module splitting.

## Allowed dependencies

- No new dependencies.

## Expected files

- `apps/cli/src/commands/simulate-season.ts`
- `apps/cli/src/commands/simulate-season.test.ts`, only if test names or snapshots need wording updates.
- `packages/i18n/src/**`, only if existing localized output still implies market advice.
- `docs/PROJECT_STATUS.md`
- The next relevant Phase 15 step document only if a lesson learned changes future work.

## Required tests/checks

- `pnpm --filter @game/cli run typecheck`
- `pnpm exec vitest run apps/cli/src/commands/simulate-season.test.ts`
- `pnpm check:localized-text`
- `rg -n "market hint|market-depth|market need|marketNeed|need:|consider:|surplus:" apps/cli/src packages/i18n/src`
- `pnpm cli simulate-season --seed=demo-001 --formation-fit=4-2-3-1 --lang=it`
- `pnpm check`

## Definition of Done

- Stale market/recommendation naming is removed from current formation-fit implementation code.
- User-facing formation-fit output remains factual.
- No new feature behavior is introduced.
- `docs/PROJECT_STATUS.md` records the cleanup.

## Claude Code task prompt

Read the required project docs and this step document. Remove stale market/recommendation naming from the current squad-fit/formation-fit implementation while keeping output factual and behavior stable. Run the required checks, update `docs/PROJECT_STATUS.md`, and stop.
