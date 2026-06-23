# 01 - CLI Adapter Responsibility Audit

## Goal

Map the current responsibilities inside `apps/cli/src/commands/simulate-season.ts`
before moving code.

The file is large enough that decomposition without an audit risks moving code
by shape instead of by responsibility. This step should identify which parts are
command adapter work, which parts are inspection builders, and which parts are
presentation rendering.

## Expected files

- `apps/cli/src/commands/simulate-season.ts`
- `apps/cli/src/commands/simulate-season/parse-args.ts`
- existing simulate-season helper modules under `apps/cli/src/commands/simulate-season/`
- `docs/audits/CLI_SIMULATE_SEASON_DECOMPOSITION_AUDIT.md`
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Read:
  - `docs/ARCHITECTURE.md`
  - `docs/audits/ARCHITECTURE_HARDENING_FINAL_REPORT.md`
  - `docs/audits/ARCHITECTURE_PACKAGE_COMPLEXITY_INVENTORY.md`
  - `docs/audits/ARCHITECTURE_READABILITY_REVIEW.md`
- Inspect `simulate-season.ts` and current helper modules.
- Group current code by responsibility:
  - command parsing and dispatch;
  - fake season input construction;
  - base season summary rendering;
  - round output rendering;
  - fixture detail rendering;
  - fixture explanation rendering;
  - setup/tactic/manual-switch/lineup/condition demo builders;
  - identity and player-generation inspections;
  - formation-fit output;
  - market-demo output.
- Identify one low-risk extraction for Step 02.
- Record what must remain in `simulate-season.ts` for now.
- Do not change source unless the audit finds a harmless comment typo or stale
  reference in touched files.

## What NOT to implement

- Do not move code yet.
- Do not change CLI output.
- Do not add new tests except when a harmless source edit requires it.
- Do not tune gameplay, content, or diagnostics.
- Do not add a new abstraction before the responsibility map exists.

## Required checks

- `git diff --check`

## Definition of Done

- The audit identifies current responsibilities and candidate modules.
- The audit recommends the exact Step 02 extraction target.
- No code behavior changes are made.
- `docs/PROJECT_STATUS.md` points to Step 02 as the next active step.
