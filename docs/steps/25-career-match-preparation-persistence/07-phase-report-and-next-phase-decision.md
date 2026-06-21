# Step 07 - Phase Report And Next Phase Decision

## Goal

Complete Phase 25 with an evidence-based report and recommend the next single phase.

## Context

After this phase, the career loop should prove the essential manager flow: inspect squad, save lineup, save tactic, advance fixture, reload consequences. The report must state whether that loop is strong enough to move to youth, market depth, match-day interaction, or another hardening phase.

## Expected files

- `docs/audits/CAREER_MATCH_PREPARATION_PERSISTENCE_REPORT.md`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Record what match-preparation state now persists.
- Record the CLI commands used to inspect squad, set lineup, set tactic, advance, and reload.
- Record whether the selected-club default lineup/tactic shortcut was removed or blocked.
- Record remaining limitations.
- Score the career preparation loop for current project maturity.
- Recommend exactly one next phase.

## What NOT to implement

- Do not start the next phase.
- Do not add new code during the report.
- Do not hide remaining limitations.
- Do not recommend multiple simultaneous next phases.

## Required checks

- `pnpm check`
- `pnpm cli career --save=phase25-prep-world --seed=world-a --new-world-preview`
- `pnpm cli career --save=phase25-prep-world --squad`
- `pnpm cli career --save=phase25-prep-world --set-lineup-demo=pro01-first-team`
- `pnpm cli career --save=phase25-prep-world --set-tactic-demo=pro01-balanced`
- `pnpm cli career --save=phase25-prep-world --summary`
- `pnpm cli career --save=phase25-prep-world --advance-next-fixture`
- `pnpm cli career --save=phase25-prep-world --inspect`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`
- `git diff --check`

## Definition of Done

- The phase report exists.
- The report explains whether durable match preparation is credible enough to continue.
- `docs/PROJECT_STATUS.md` identifies the next phase and active step.
- No next-phase code has started.
