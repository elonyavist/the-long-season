# Step 01 - Phase 39 Output Review

## Goal

Review the Phase 39 match explanation output and decide how it can support a
career matchday slice without turning into tactical advice or a separate debug
tool.

## Context

Phase 39 added `--fixture-explanation` for deterministic fixture inspection.
Phase 40 needs to verify that this explanation is useful to a manager who is
playing a career, not only to a developer checking the engine.

## Expected files

- `docs/audits/CAREER_LOOP_PLAYABILITY_AUDIT.md`
- `docs/PROJECT_STATUS.md`
- the next relevant step document, only if a lesson learned changes future work

## Implementation checklist

- Read the Phase 39 final report and the latest fixture explanation output.
- Create or update `docs/audits/CAREER_LOOP_PLAYABILITY_AUDIT.md`.
- Record what the current explanation makes clear to the manager.
- Record what remains opaque or disconnected from career state.
- Separate useful factual explanation from prohibited tactical advice.
- Decide whether Phase 40 can continue with existing trace data.
- Update `docs/PROJECT_STATUS.md`.

## What NOT to implement

- Do not change code in this review step.
- Do not tune match output.
- Do not add tactical recommendations.
- Do not start UI work.
- Do not hide awkward findings because the CLI already has a command.

## Required checks

- `test -f docs/audits/ENGINE_QUALITY_HARDENING_AND_TRACE_REPORT.md`
- `pnpm cli simulate-season --seed=world-a --fixture=fixture:000001 --fixture-explanation`
- `git diff --check`

## Definition of Done

- The audit document states whether Phase 39 explanation is useful for career
  playability.
- Any career-context gaps are explicit.
- The next action is Step 02.
- `docs/PROJECT_STATUS.md` is updated.
