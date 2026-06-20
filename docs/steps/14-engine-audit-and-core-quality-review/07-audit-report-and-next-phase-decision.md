# Audit Report And Next Phase Decision

## Goal

Finalize the complete engine/core audit and decide whether the project should proceed to market, youth, or a focused rework phase.

## Why we implement it this way

The first six audit steps produce focused evidence. This final step turns that evidence into an actionable project decision. The output must be useful to both an LLM and a junior developer: what is solid, what is risky, what must be fixed, and what should be built next.

## What to implement

- Finalize `docs/audits/ENGINE_CORE_AUDIT.md`.
- Ensure the report includes:
  - executive summary;
  - score from `0` to `100`;
  - all seven audit points;
  - critical blockers;
  - high/medium/low findings;
  - accepted limitations;
  - verified strengths;
  - checks run and results;
  - manual inspection commands;
  - next-phase recommendation.
- Add a clear recommendation:
  - proceed to market;
  - proceed to youth;
  - create a core rework phase first;
  - or stop because a blocker prevents safe progress.
- Update `docs/PROJECT_STATUS.md` so it records the Phase 14 result and the recommended next action.

## What NOT to implement

- Do not implement the recommended next phase.
- Do not fix findings in this step unless the phase documentation explicitly says the audit cannot be completed without that fix.
- Do not hide unresolved findings to make the score look better.
- Do not turn factual squad-fit output into market advice.
- Do not add new source behavior.

## Allowed dependencies

- No new dependencies.
- Documentation-only output is expected.

## Expected files

- `docs/audits/ENGINE_CORE_AUDIT.md`
- `docs/PROJECT_STATUS.md`

## Required tests/checks

- `pnpm check`
- `pnpm cli simulate-season --seed=demo-001`
- `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006 --lineup-demo=pro01-rotated --lang=it`
- `pnpm cli simulate-season --seed=demo-001 --formation-fit=4-2-3-1 --lang=it`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`

## Definition of Done

- `docs/audits/ENGINE_CORE_AUDIT.md` is complete and coherent.
- The report contains a score and a next-phase recommendation.
- Every finding has severity and a recommended action.
- `docs/PROJECT_STATUS.md` marks Phase 14 complete or blocked.
- The user knows exactly what to manually inspect before approving the next phase.

## Claude Code task prompt

Read the required project docs, all Phase 14 audit sections, and this step. Finalize `docs/audits/ENGINE_CORE_AUDIT.md`, run the final checks, update `docs/PROJECT_STATUS.md` with the Phase 14 result and next-phase recommendation, then stop. Do not start the next phase.
