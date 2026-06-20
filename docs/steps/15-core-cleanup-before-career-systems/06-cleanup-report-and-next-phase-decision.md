# Cleanup Report And Next Phase Decision

## Goal

Finalize Phase 15 by documenting what was cleaned up, what remains, and whether the project should proceed to market or youth.

## Why we implement it this way

Phase 15 is valuable only if it leaves a durable handoff. The next feature phase should not rediscover which audit findings were fixed or which were intentionally deferred.

The final report must be useful to both an LLM and a junior developer: it should say what changed, why it is safer, what checks passed, and what still needs attention before career persistence.

## What to implement

- Create or update `docs/audits/CORE_CLEANUP_REPORT.md`.
- Summarize each Phase 15 step:
  - finding addressed;
  - files changed;
  - adopted solution;
  - verification result;
  - remaining risk, if any.
- Re-score the core after cleanup from `0` to `100`.
- Recommend the next phase:
  - market MVP;
  - youth MVP;
  - or another cleanup/rework phase if a blocker remains.
- Update `docs/PROJECT_STATUS.md` to mark Phase 15 complete or blocked.
- Do not create Phase 16 docs in this step unless explicitly asked.

## What NOT to implement

- Do not implement the next feature phase.
- Do not hide unresolved cleanup findings.
- Do not change source code unless the report cannot be truthful without a tiny documentation correction.
- Do not add market/youth systems.
- Do not alter balance tuning.

## Allowed dependencies

- No new dependencies.

## Expected files

- `docs/audits/CORE_CLEANUP_REPORT.md`
- `docs/PROJECT_STATUS.md`

## Required tests/checks

- `pnpm check`
- `pnpm cli simulate-season --seed=demo-001`
- `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006 --lineup-demo=pro01-rotated --lang=it`
- `pnpm cli simulate-season --seed=demo-001 --formation-fit=4-2-3-1 --lang=it`
- `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006 --setup-demo=pro01-balanced --manual-tactic-switch=46:pro01-attacking`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`

## Definition of Done

- `docs/audits/CORE_CLEANUP_REPORT.md` exists and explains the Phase 15 cleanup outcome.
- `docs/PROJECT_STATUS.md` marks Phase 15 complete or blocked.
- The report clearly says whether the next feature phase should be market or youth.
- The user knows exactly what to manually inspect.
- No Phase 16 implementation starts.

## Claude Code task prompt

Read the required project docs, all completed Phase 15 step outcomes, and this step document. Create `docs/audits/CORE_CLEANUP_REPORT.md`, run the final checks, update `docs/PROJECT_STATUS.md` with the Phase 15 result and next-phase recommendation, then stop. Do not start Phase 16.
