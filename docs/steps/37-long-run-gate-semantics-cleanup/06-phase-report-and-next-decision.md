# Step 06 - Phase Report And Next Decision

## Goal

Close Phase 37 and choose the next active step or explicitly leave it unselected.

## Context

After Phase 37, the long-run gate should be easier to read:

- structural failures should remain strict;
- monitoring signals should remain visible;
- healthy narrative variance should not look like a defect;
- population semantics should match the actual senior/youth roster model.

## Expected files

- `docs/audits/LONG_RUN_GATE_SEMANTICS_CLEANUP_REPORT.md`
- `docs/PROJECT_STATUS.md`
- the next relevant step document, only if a lesson learned changes future work

## Implementation checklist

- Summarize what changed in report semantics.
- State whether gameplay behavior changed; expected answer is no.
- State whether the long-run gate passes.
- State whether any warning remains a real blocker.
- Recommend the next project direction, but do not start it unless already
  documented and selected.
- Update `docs/PROJECT_STATUS.md`.

## What NOT to implement

- Do not change code behavior in this final report step.
- Do not start the next phase.
- Do not create broad roadmap documents unless the phase evidence requires it.
- Do not hide unresolved blockers.

## Required checks

- `pnpm check`;
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`;
- `git diff --check`.

## Definition of Done

- Phase 37 has a complete final report.
- `docs/PROJECT_STATUS.md` records Phase 37 as complete or blocked.
- The next action is explicit.
- No next phase is implemented.
