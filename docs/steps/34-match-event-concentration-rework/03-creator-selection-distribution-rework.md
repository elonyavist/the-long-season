# Step 03 - Creator Selection Distribution Rework

## Goal

Rework creator/assist attribution narrowly so goal creation is less likely to concentrate unrealistically on one player while preserving deterministic outcomes and match balance.

## Context

Steps 01 and 02 should provide evidence for the exact cause. This step should implement the smallest engine/model change that addresses that cause.

Likely acceptable directions:

- adjust chance-actor creator weights by chance type;
- distinguish build-up creator from direct assist more clearly;
- give secondary creators more share in open-play and counter chances;
- reduce repeated over-weighting of the same midfield creator slot;
- make set-piece/cross/open-play creator pools differ.

The fix must not be a hard season-level cap.

## Expected files

- `packages/engine/src/**/*.ts`
- `packages/engine/src/**/*.test.ts`
- `packages/simulation-tools/src/**/*.ts`
- `packages/simulation-tools/src/**/*.test.ts`
- `apps/cli/src/**/*.ts`
- `apps/cli/src/**/*.test.ts`
- `packages/i18n/src/**/*.ts`
- `packages/i18n/src/**/*.test.ts`
- `docs/audits/MATCH_EVENT_CONCENTRATION_AUDIT.md`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Implement only the attribution/distribution change proven by the audit.
- Preserve deterministic seeded RNG streams.
- Preserve match score outcomes unless the audit proves outcome RNG consumption must change; if outcome scores change, document why.
- Keep creator, assist, scorer, shooter, goalkeeper, and defender contracts consistent.
- Remove or refactor obsolete attribution helpers if they become redundant.
- Add tests for:
  - deterministic creator selection;
  - no goalkeeper creator/shooter leakage;
  - creator distribution across plausible attacking roles;
  - assist remains optional and excludes scorer;
  - failing seed no longer fails the specific concentration check if the test scope can cover it.

## What NOT to implement

- Do not change player generation.
- Do not change youth academy behavior.
- Do not change match scoring probabilities.
- Do not add season-level caps.
- Do not change long-run thresholds.
- Do not add UI.

## Required checks

- `pnpm --filter @game/engine run typecheck`
- `pnpm --filter @game/simulation-tools run typecheck`
- `pnpm --filter @game/cli run typecheck`
- focused tests for touched engine/simulation-tools/CLI/i18n files
- `pnpm cli ten-season-report --seed=phase33-generation-world-00173 --seasons=30`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`
- `pnpm check`
- `git diff --check`

## Definition of Done

- The rework is narrow and evidence-backed.
- Creator concentration on the failing seed is reduced below the fail threshold.
- Match balance still passes.
- No dead old attribution path remains.
