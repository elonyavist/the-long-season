# Step 05 - Season Rollover And Development Loop Smoke

## Goal

Smoke-test whether the current career can move beyond one match and still feel
like a coherent football project.

## Context

The game should eventually be fun because the user's club changes over seasons:
players grow, veterans decline, youth and squad turnover matter, and future
fixtures keep appearing. This step does not tune those systems; it checks
whether the already-built pieces can be followed from the same career save.

## Expected files

- `docs/audits/CAREER_LOOP_PLAYABILITY_AUDIT.md`
- `docs/PROJECT_STATUS.md`
- touched test/source files only if a narrow blocker fix is explicitly required
  by this step
- the next relevant step document, only if a lesson learned changes future work

## Implementation checklist

- Use the same deterministic save from prior Phase 40 steps where possible.
- Confirm that one match can be advanced.
- Confirm that career summary changes are understandable after advancement.
- Confirm that development reporting is readable from the career viewpoint.
- Confirm that season rollover/youth/turnover status can be inspected or record
  the gap if it cannot.
- Record whether the manager can understand why they should care about the next
  match or next season.
- Fix only narrow blockers needed to run the smoke, if documented.
- Update `docs/PROJECT_STATUS.md`.

## What NOT to implement

- Do not add a new market engine.
- Do not add a new youth engine.
- Do not tune player development.
- Do not run or optimize huge long-run gates in this phase.
- Do not hide a fragmented flow by adding broad CLI dumps.

## Required checks

- focused tests for touched files
- `pnpm check`
- `pnpm cli career --save=phase40-check --summary`
- `pnpm cli career --save=phase40-check --advance-next-fixture`
- `pnpm cli career --save=phase40-check --development-report`
- rollover/youth/turnover smoke command if currently available
- `git diff --check`

## Definition of Done

- The audit records whether the career can be followed beyond a single match.
- Any broken or missing link is described as user friction.
- No unrelated simulation system is added.
- `docs/PROJECT_STATUS.md` is updated.
