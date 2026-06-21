# Phase 26 - Project Cleanup And Long-Run Readiness

## Goal

Reduce documentation noise and prepare the project for long-run simulation work.

The project should stop adding isolated CLI-facing features for now. The CLI remains useful as a lab tool, but the next product question is whether the football world remains credible across many seasons.

This phase creates a clean baseline before season rollover, development, club identity, and ten-season reports.

## Product intent

- Keep focus on engine quality before UI.
- Remove or archive obsolete planning noise.
- Preserve decisions that still explain current architecture.
- Make long-run simulation metrics explicit before implementing them.
- Avoid creating new gameplay features during cleanup.
- Prepare a clear path from Phase 27 to Phase 30.

## Step order

1. `01-documentation-noise-audit.md`
2. `02-report-retention-policy.md`
3. `03-archive-obsolete-roadmaps.md`
4. `04-current-engine-baseline.md`
5. `05-long-run-metrics-definition.md`
6. `06-phase-report-and-phase-27-readiness.md`

## Phase constraints

- Do not implement new gameplay code.
- Do not implement UI.
- Do not delete documents that still record binding product or architecture decisions.
- Prefer archiving over deletion when a document may still explain past choices.
- If a document is deleted, record why it is no longer useful.
- Do not rewrite `requirements.md` broadly unless a step explicitly allows a narrow update.
- Keep `docs/PROJECT_STATUS.md` as the handoff source for LLMs and junior developers.

## Phase-level checks

At the end of the phase, run:

- `find docs -maxdepth 3 -type f | sort`
- `rg -n "Phase 26|long-run|ten-season|obsolete|archive" docs requirements.md`
- `git diff --check`

Run `pnpm check` only if the phase changes source code or executable scripts.

## Definition of Done

- Obsolete roadmap/report noise is identified.
- A retention policy explains what stays, what moves to archive, and what can be deleted.
- The current engine/career baseline is summarized in one report.
- Long-run simulation metrics are defined before implementation.
- Phase 27 can start with a clear season-rollover scope.

