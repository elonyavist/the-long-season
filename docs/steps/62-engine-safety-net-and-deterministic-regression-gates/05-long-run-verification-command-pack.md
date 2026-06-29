# Step 05 - Long-Run Verification Command Pack

## Goal

Document the command pack future engine-changing phases must run before closing.

This step makes long-run verification deliberate and repeatable without turning
Phase 62 into another tuning phase.

## Expected files

- `docs/audits/ENGINE_SAFETY_NET_COMMANDS.md`
- `docs/audits/ENGINE_SAFETY_NET_AUDIT.md`
- `docs/PROJECT_STATUS.md`

## What to implement

- Create a concise command pack for future phases that touch:
  - match simulation;
  - season simulation;
  - career fixture progression;
  - player state consequences;
  - generation or balance.
- Include the expected purpose of each command, not just the command itself.
- Separate fast local checks from heavier optional long-run checks.
- State when a warning should trigger design review instead of automatic
  threshold tuning.
- Cross-reference `docs/PROJECT_RULES.md` gameplay quality rules.

## What NOT to implement

- Do not add new package scripts unless a later phase proves repeated manual
  commands are causing mistakes.
- Do not change long-run thresholds.
- Do not suppress warnings.
- Do not run expensive 10,000-world gates as part of this documentation step.
- Do not reinterpret historical reports without evidence.

## Required checks

```sh
nvm use 24
test -f docs/audits/ENGINE_SAFETY_NET_COMMANDS.md
git diff --check
```

## Definition of Done

- Future phases have a clear, documented verification pack.
- The command pack distinguishes fast gates from heavier confidence runs.
- The docs state that warnings are design signals, not automatic fixes.
- `docs/PROJECT_STATUS.md` records the completed command pack.

