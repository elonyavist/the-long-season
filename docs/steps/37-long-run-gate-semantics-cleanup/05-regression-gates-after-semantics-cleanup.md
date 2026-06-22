# Step 05 - Regression Gates After Semantics Cleanup

## Goal

Prove the semantics cleanup did not change gameplay outcomes or hide real
failures.

## Context

Phase 37 is expected to change report semantics and presentation only. The
long-run simulation itself should remain deterministic and behaviorally stable.

## Expected files

- `docs/audits/LONG_RUN_GATE_SEMANTICS_CLEANUP_REPORT.md`
- `docs/PROJECT_STATUS.md`
- the next relevant step document, only if a lesson learned changes future work

## Implementation checklist

- Run the 250x30 long-run gate with the Phase 37 report output path.
- Compare core gameplay metrics against Phase 36 evidence:
  - goals per match;
  - table spread;
  - draw rate;
  - champion streak max;
  - top assist p95;
  - active senior/youth/total ranges;
  - failing check counts.
- Confirm that no gameplay behavior changed unless a previous step explicitly
  documented a justified reason.
- Confirm report warnings now read as intended.
- Record observed metrics in the cleanup report.
- Update `docs/PROJECT_STATUS.md`.

## What NOT to implement

- Do not fix unrelated anomalies discovered during the gate.
- Do not start another tuning phase.
- Do not change thresholds in this final gate step.
- Do not start UI, market, staff, scouting, or training work.

## Required checks

- `pnpm check`;
- `pnpm cli ten-season-report --seed-prefix=phase35-table-spread --worlds=250 --seasons=30 --report-output=docs/audits/LONG_RUN_GATE_SEMANTICS_CLEANUP_REPORT.md`;
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`;
- `git diff --check`.

## Definition of Done

- The 250x30 long-run gate passes.
- Strict balance passes.
- The cleanup report records the final observed metrics.
- Any remaining warning/story/monitoring signals are explained.
