# Step 08 - Long-Run Regression Gates

## Goal

Validate that the career squad refresh and transfer turnover loop survives progressively larger simulations without structural squad collapse.

This step must prove the loop at three levels:

1. `50` worlds x `10` seasons as a fast smoke gate.
2. `250` worlds x `30` seasons as a normal development regression gate.
3. `10,000` worlds x `50` seasons as the final hard gate for Phase 31.

## Context

The project needs confidence before moving toward richer career or UI work. A small sample can miss rare collapses, while a huge sample is too expensive for everyday checks. This step therefore separates fast validation from the final hard gate.

The hard gate must not run inside `pnpm check`. It must be an explicit command/report so the developer intentionally chooses when to spend that runtime.

## Expected files

- `docs/audits/CAREER_SQUAD_REFRESH_LONG_RUN_GATES_REPORT.md`
- `packages/simulation-tools/src/long-run/`
- `apps/cli/src/commands/`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Add or reuse a deterministic long-run batch runner that accepts world count, season count, seed prefix, and report output path.
- Run and record the `50` x `10` smoke gate.
- Run and record the `250` x `30` development regression gate.
- Run and record the `10,000` x `50` final hard gate.
- Capture aggregate metrics, percentile metrics, failure counts, and worst seeds without writing noisy per-season output for every world.
- Record any failed seed with enough context to reproduce it exactly.
- Keep `pnpm check` fast by excluding the final hard gate from default checks.
- Update the audit report with a clear pass/fail verdict for each gate.

## What NOT to implement

- Do not reduce the world count or season count to make the gate pass.
- Do not include the `10,000` x `50` hard gate in `pnpm check`.
- Do not tune player generation, market behavior, or match balance in this step.
- Do not hide or aggregate away failing seeds.
- Do not create UI work.

## Required checks

- `pnpm check`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`
- deterministic long-run command/report for `50` worlds x `10` seasons
- deterministic long-run command/report for `250` worlds x `30` seasons
- deterministic long-run command/report for `10,000` worlds x `50` seasons
- `git diff --check`

## Definition of Done

- The long-run runner supports the three required gate sizes.
- `CAREER_SQUAD_REFRESH_LONG_RUN_GATES_REPORT.md` exists and includes smoke, development, and hard-gate results.
- The final hard gate proves that `10,000` worlds can run for `50` seasons without squad-structure collapse, or the step is marked blocked with exact failing seeds and reasons.
- `docs/PROJECT_STATUS.md` records the adopted solution, verification result, and next action.
