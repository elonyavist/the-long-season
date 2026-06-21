# Step 07 - Playability Audit And Next Phase Decision

## Goal

Audit the first playable career loop and decide the next product phase from evidence.

## Context

This step should answer whether the project is now close enough to `100 / 100` for the current milestone, and what the next phase should improve.

Possible next directions include:

- richer career calendar/time progression;
- scouting and player discovery;
- youth academy/intake;
- market search and negotiation depth;
- UI prototype over the proven CLI loop.

## Expected files

- `docs/audits/PLAYABLE_CAREER_LOOP_MVP_REPORT.md`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Record the playable loop commands and observed behavior.
- Score the loop against the current product goal.
- Identify what is fun enough now and what still feels missing.
- Recommend one next phase only.
- Keep the report specific enough for a junior developer or future LLM to continue.

## What NOT to implement

- Do not start the next phase.
- Do not add new gameplay systems during the audit.
- Do not claim the game is complete.
- Do not hide missing pieces behind vague wording.

## Required checks

- `pnpm check`
- `pnpm cli career --save=phase23-loop-world --seed=world-a --new-world-preview`
- `pnpm cli career --save=phase23-loop-world --summary`
- `pnpm cli career --save=phase23-loop-world --advance-next-fixture`
- `pnpm cli career --save=phase23-loop-world --inspect`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`
- `git diff --check`

## Definition of Done

- The playable loop report exists.
- The project status records whether the milestone is close enough to `100 / 100`.
- The next phase recommendation is explicit and limited to one phase.
