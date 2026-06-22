# Step 09 - Phase 31 Final Report And Next Decision

## Goal

Close Phase 31 with an evidence-based decision about whether the project can move toward UI exploration or needs another simulation-focused phase.

## Context

Phase 31 is a hard career-world credibility gate. Passing `pnpm check` is not enough; the world must survive the full long-run validation ladder through the `10,000` x `50` hard gate.

Step 08 discovered that the first `50` x `10` gate failed without squad-structure collapse. Step 08a must either fix that anomaly class and complete the ladder, or mark Phase 31 blocked with exact failing seeds and reasons. This final report must not skip that evidence.

## Expected files

- `docs/audits/CAREER_SQUAD_REFRESH_FINAL_REPORT.md`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Summarize what Phase 31 implemented.
- Summarize the `50` x `10`, `250` x `30`, and `10,000` x `50` long-run gate results.
- Summarize the Step 08a anomaly rework result, including whether `warn_checks` and `fail_checks` explain the gate behavior.
- Compare Phase 30 and Phase 31 metrics.
- Record remaining anomalies.
- Decide one next phase:
  - UI exploration if the engine is credible enough;
  - another simulation-hardening phase if career-world metrics still fail;
  - focused market/youth/development rework if the evidence points there.
- Update `docs/PROJECT_STATUS.md` with the next single recommended phase.

## What NOT to implement

- Do not start the next phase.
- Do not hide bad results.
- Do not change thresholds in the final report.

## Required checks

- `pnpm check`
- Long-run gate report exists and includes the final `10,000` x `50` hard gate.
- Anomaly rework report exists if Step 08a was required.
- strict balance report
- `git diff --check`

## Definition of Done

- The final Phase 31 report exists.
- The report says whether the game is ready for UI exploration.
- `docs/PROJECT_STATUS.md` records the next single recommended phase.
