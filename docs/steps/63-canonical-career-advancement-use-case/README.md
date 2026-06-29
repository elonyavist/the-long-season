# Phase 63 - Canonical Career Advancement Use-Case

## Goal

Create one canonical engine use-case for advancing a career season, so CLI commands, long-run reports, and the future web UI cannot produce divergent career timelines.

This phase is architectural and engine-focused. It centralizes orchestration. It does not add new gameplay systems.

## Product intent

The user must feel that the career world moves forward as one coherent football universe:

- fixtures are resolved in the same deterministic order;
- player development and aging happen once, in one place;
- exits, youth lifecycle, squad maintenance, and transfer turnover follow one shared pipeline;
- reports and UI can explain what changed without owning the rules.

## Architecture intent

Use a deep engine Module with a narrow Interface. Adapters may ask the engine to advance a season, but they must not know or duplicate the internal order.

Tentative Module:

- `packages/engine/src/career/advance-career-season.ts`

Tentative Interface:

- `advanceCareerOneSeason(...)`

The exact signature must be defined during this phase after auditing current call sites.

Expected ownership:

- engine Module owns season advancement order and structured facts;
- CLI owns command parsing, save loading/writing, and presentation;
- simulation tools own batch loops and metrics, not season rules;
- future web UI calls an adapter/view-model around the same use-case.

## Binding constraints

- Keep the implementation deterministic for the same seed and input state.
- Keep engine output structured. The engine must produce facts, not narrative prose.
- Do not introduce LLM-generated content in this phase.
- Do not introduce a third advancement path.
- Do not make hidden manager decisions for the selected club.
- Do not add economy, contracts, promotions, relegations, staff, or new market complexity.
- Do not tune player generation, match balance, transfer balance, or report warning thresholds unless a current regression makes the phase impossible.
- Preserve current save compatibility unless the audit proves a schema change is unavoidable. If unavoidable, stop and document the blocker.

## Ordered steps

1. [01-current-advancement-path-audit.md](01-current-advancement-path-audit.md)
2. [02-interface-and-ordering-contract.md](02-interface-and-ordering-contract.md)
3. [03-engine-advance-career-season-module.md](03-engine-advance-career-season-module.md)
4. [04-deterministic-season-history-and-facts.md](04-deterministic-season-history-and-facts.md)
5. [05-cli-rollover-and-development-report-migration.md](05-cli-rollover-and-development-report-migration.md)
6. [06-ten-season-report-and-long-run-migration.md](06-ten-season-report-and-long-run-migration.md)
7. [07-regression-command-pack-and-no-third-path-check.md](07-regression-command-pack-and-no-third-path-check.md)
8. [08-phase-report-and-next-phase-decision.md](08-phase-report-and-next-phase-decision.md)

## Phase-level checks

Run these at the end of the phase unless a step explicitly blocks earlier:

```bash
nvm use 24
pnpm exec vitest run packages/engine/src/career/advance-career-season.test.ts
pnpm exec vitest run apps/cli/src/commands/career.test.ts
pnpm exec vitest run apps/cli/src/commands/ten-season-report.test.ts
pnpm exec vitest run packages/simulation-tools/src/long-run/career-long-runner.test.ts
pnpm --filter @game/engine run typecheck
pnpm --filter @game/cli run typecheck
pnpm --filter @game/simulation-tools run typecheck
pnpm cli career --save=phase63-check --seed=world-a --new-world-preview
pnpm cli career --save=phase63-check --rollover-season
pnpm cli career --save=phase63-check --development-report
pnpm cli ten-season-report --seed=phase63-world --seasons=10
pnpm cli ten-season-report --seed-prefix=phase63-gate --worlds=50 --seasons=10 --report-output=docs/audits/CAREER_ADVANCEMENT_LONG_RUN_SMOKE.md
pnpm check
git diff --check
```

If code changes are made, also run:

```bash
graphify update .
```

## Definition of done

- The current advancement paths are audited and documented.
- One canonical engine season-advancement Interface is documented and implemented.
- CLI rollover/development paths call the canonical use-case instead of owning season orchestration.
- Ten-season and long-run paths call the canonical use-case instead of duplicating order.
- Deterministic tests cover same-input/same-output, no mutation, and key advancement facts.
- A no-third-path report confirms that adapters do not duplicate the season advancement pipeline.
- The phase report names the next phase and any remaining product/engine risks.
