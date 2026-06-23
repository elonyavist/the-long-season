# Architecture Readability Review

Date: 2026-06-22
Phase: `43-architecture-hardening-and-package-rework`
Step: `07-junior-readability-pass`

## Summary

Reviewed the source files touched by Phase 43 for junior-developer readability.

No additional source edits were needed in this step. The files changed earlier
in the phase already have useful entry-point comments, exported TSDoc, focused
tests, and no visible dead wrappers introduced by the refactors.

The remaining readability problems are real, but they are broader file-splitting
work and should not be hidden inside this pass.

## Files Reviewed

| File | Result |
|---|---|
| `packages/engine/src/career/progress-fixture.ts` | Improved earlier in Phase 43. `progressNextCareerFixture` now documents its caller-owned pre-match responsibilities and its five-step flow. Private helpers make validation and simulation/report creation easier to follow. |
| `packages/engine/src/career/progress-fixture.test.ts` | Focused test proves caller-supplied recovered state is treated as pre-match truth. |
| `apps/cli/src/commands/career.ts` | Thinner after moving season lab helpers. It now reads more clearly as a storage/dispatch adapter. |
| `apps/cli/src/commands/career/season-labs.ts` | New module has exported result types and pure builder functions documented. It contains report/rollover lab logic that belongs outside the command adapter but still depends on CLI-local career types. |
| `packages/content/src/generators/league-system.ts` | `FakeLeagueSystem` and `createFakeLeagueSystem` now explain the generated-world facade and composition order. |
| `packages/content/src/generators/league-system.test.ts` | Added a facade contract test that shows what the top-level world bundle guarantees. |
| `packages/simulation-tools/src/long-run/anomaly-scoring.ts` | `worstLongRunAnomalyStatus` now documents shared PASS/WARN/FAIL severity semantics for CLI and future UI callers. |
| `packages/simulation-tools/src/long-run/anomaly-scoring.test.ts` | Added a focused test for shared severity semantics. |
| `apps/cli/src/commands/ten-season-report.ts` | Removed duplicated status-combination helper. File remains large and should be split in a later dedicated diagnostics cleanup. |
| `packages/simulation-tools/src/index.ts` | Export addition is straightforward and consistent with existing public report helpers. |

## Readability Issues Fixed In Phase 43

- Career matchday progression now has a clearer engine entry point narrative.
- Career command dispatch is no longer mixed with development-report and
  season-rollover helper implementation.
- World generation has a documented content facade.
- Long-run status severity semantics are no longer duplicated in CLI.
- Focused tests now point to the behavior a junior developer should trust for
  each changed area.

## Deferred Readability Issues

These should remain visible for future work:

1. `apps/cli/src/commands/simulate-season.ts` is still the hardest file to
   trace. It mixes many inspection modes and render helpers.
2. `apps/cli/src/commands/ten-season-report.ts` still mixes content-specific
   report construction, batch gate aggregation, rendering, and file output.
3. `apps/cli/src/commands/career/format.ts` is still a large presentation file.
4. `packages/engine/src/use-cases/simulate-season.ts` is large but core; split
   only with a dedicated safety plan.
5. `packages/engine/src/career/player-development.ts` remains large but
   coherent; split only if extracting named curve/config helpers improves
   comprehension without tuning behavior.

## Decision

No source-only readability patch was applied in this step.

Reason:

- further edits would either repeat what the code already says or start a
  broader decomposition outside the step scope;
- the phase still has Step 08 for the project-level architecture map;
- the remaining confusing files need planned decomposition, not comments that
  paper over size.

## Verification

Verification is recorded in `docs/PROJECT_STATUS.md` for this step.
