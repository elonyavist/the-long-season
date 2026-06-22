# Step 02 - Active Player Population Semantic Split

## Goal

Replace the single ambiguous `active_player_population` warning with clear
senior, youth, and total-player semantics.

This step should make the report tell us whether a world is structurally
healthy, underpopulated, overpopulated, or simply following the intended current
roster model.

## Context

Phase 36 observed:

- senior active players: `396..443`;
- youth active players: `198..198`;
- total active players: `594..641`;
- minimum squad size observed: `19`;
- clubs below minimum squad size: `0`;
- clubs without natural goalkeeper: `0`;
- clubs above youth target: `0`;
- clubs below youth minimum: `0`.

The current total-player warning is misleading because `594` can be correct:
18 clubs x 22 senior players plus 18 clubs x 11 youth players.

## Expected files

- `packages/simulation-tools/src/**/*.ts`
- `packages/simulation-tools/src/**/*.test.ts`
- `apps/cli/src/**/*.ts`
- `apps/cli/src/**/*.test.ts`
- `packages/i18n/src/**/*.ts`
- `docs/audits/LONG_RUN_GATE_SEMANTICS_CLEANUP_REPORT.md`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Inspect current long-run anomaly scoring for `active_player_population`.
- Split the diagnostic into explicit concepts, for example:
  - senior active player floor/ceiling;
  - youth active player floor/ceiling;
  - total active player informational range.
- Ensure expected youth academy size does not create a false warning.
- Keep structural blockers strict:
  - clubs below minimum senior squad size;
  - clubs without natural goalkeeper;
  - youth rosters below required minimum;
  - youth rosters above allowed target.
- Keep total active player count visible as an informational or monitoring
  metric.
- Update tests to prove a healthy `594` total-player world does not warn only
  because of total count.
- Update localized report labels if output wording changes.
- Update the cleanup report with the adopted semantics.
- Update `docs/PROJECT_STATUS.md`.

## What NOT to implement

- Do not change senior squad size behavior.
- Do not change youth academy size.
- Do not generate extra players to satisfy a number.
- Do not remove population visibility from the report.
- Do not change transfer turnover, player exits, intake, or youth promotion.
- Do not tune match or season balance.

## Required checks

- focused tests for touched simulation-tools/CLI/i18n files;
- `pnpm check`;
- `pnpm cli ten-season-report --seed-prefix=phase35-table-spread --worlds=250 --seasons=30 --report-output=docs/audits/LONG_RUN_GATE_SEMANTICS_CLEANUP_REPORT.md`;
- `git diff --check`.

## Definition of Done

- `active_player_population` no longer warns solely because a healthy world has
  `594` active players.
- Senior, youth, and total active-player ranges are still visible.
- Real population collapse remains a failure or clear warning.
- The 250x30 gate passes.
