# Architecture Hardening Final Report

Date: 2026-06-22
Phase: `43-architecture-hardening-and-package-rework`

## Summary

Phase 43 hardened architecture without rewriting the project or changing
gameplay tuning.

The main outcome is a clearer map for future development:

- package complexity and public interfaces were audited;
- career fixture advancement is easier to trace;
- one CLI command slice was moved out of the command adapter;
- generated world ownership is documented;
- long-run diagnostic severity semantics moved into simulation tools;
- changed files were reviewed for junior readability;
- `docs/ARCHITECTURE.md` now documents areas, important files, entry points,
  flow tracing, and debugging paths.

## What Changed

### Audits Added

- `docs/audits/ARCHITECTURE_PACKAGE_COMPLEXITY_INVENTORY.md`
- `docs/audits/ARCHITECTURE_PUBLIC_INTERFACE_REVIEW.md`
- `docs/audits/ARCHITECTURE_CLI_SLIMMING_PLAN.md`
- `docs/audits/ARCHITECTURE_WORLD_GENERATION_REVIEW.md`
- `docs/audits/ARCHITECTURE_LONG_RUN_DIAGNOSTICS_REVIEW.md`
- `docs/audits/ARCHITECTURE_READABILITY_REVIEW.md`
- `docs/audits/ARCHITECTURE_HARDENING_FINAL_REPORT.md`

### Source Changes

- `packages/engine/src/career/progress-fixture.ts`
  - kept `progressNextCareerFixture` as the stable entry point;
  - documented caller-owned pre-match responsibilities;
  - split context validation and simulation/report creation into private helper
    functions;
  - added a focused test proving recovered state is treated as pre-match truth.
- `apps/cli/src/commands/career.ts`
  - removed development-report and season-rollover lab implementation from the
    command adapter.
- `apps/cli/src/commands/career/season-labs.ts`
  - new CLI-local module for pure in-memory development report and completed
    season rollover lab helpers.
- `packages/content/src/generators/league-system.ts`
  - documented `createFakeLeagueSystem` as the generated-world facade.
- `packages/content/src/generators/league-system.test.ts`
  - added a facade contract test.
- `packages/simulation-tools/src/long-run/anomaly-scoring.ts`
  - added `worstLongRunAnomalyStatus` so CLI/future UI do not duplicate
    PASS/WARN/FAIL severity ordering.
- `apps/cli/src/commands/ten-season-report.ts`
  - uses `worstLongRunAnomalyStatus` instead of a local duplicate helper.

## What Stayed Intentionally Unchanged

- No gameplay behavior was tuned.
- No match scoring probabilities were changed.
- No generated player bands, rarity budgets, names, or club IDs were changed.
- No dependency rule was weakened.
- No new package was added.
- `simulate-season.ts`, `ten-season-report.ts`, and `career/format.ts` remain
  large. They need dedicated decomposition, not opportunistic broad edits.
- `@game/engine` and `@game/content` root exports remain broad because active
  CLI/tests still depend on them.

## Verification

Phase-level checks passed:

- `test -f docs/ARCHITECTURE.md`
- `pnpm depcruise`
- `pnpm check`
- `pnpm cli doctor`
- `pnpm cli simulate-season --seed=world-a`
- `pnpm cli career --save=phase43-check --seed=world-a --new-world-preview`
- `pnpm cli career --save=phase43-check --summary`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`
- `git diff --check`

Step-level checks run during the phase:

- engine typecheck and focused career tests;
- CLI/i18n typechecks and focused career/i18n tests;
- content typecheck and focused generator tests;
- simulation-tools/CLI typechecks and focused long-run/CLI tests;
- repeated `pnpm check`;
- career, simulate-season, and balance-report smoke commands.

## Remaining Risks

1. `apps/cli/src/commands/simulate-season.ts` is still the largest and hardest
   adapter to trace.
2. `apps/cli/src/commands/ten-season-report.ts` still mixes app-specific report
   construction and rendering.
3. `apps/cli/src/commands/career/format.ts` is still a large presentation file.
4. `packages/engine/src/use-cases/simulate-season.ts` remains a large core
   orchestrator.
5. `packages/engine/src/career/player-development.ts` remains large but
   coherent.

## Recommended Next Phase

Recommended next phase:

`Phase 44 - CLI Adapter Decomposition And Presentation Boundaries`

Reason:

- the package graph is healthy;
- core engine entry points are clearer;
- the highest remaining complexity is now concentrated in CLI adapters and
  presentation files;
- reducing adapter complexity before adding UI will make future UI integration
  safer and easier to debug.

Suggested first target:

- split `apps/cli/src/commands/simulate-season.ts` by inspection mode while
  preserving all output and tests.
