# Phase 18 - Career State And Transfer Persistence

## Goal

Make the first career decisions durable before adding deeper career systems.

Phase 17 proved that a permanent transfer can be inspected deterministically, including budget checks, roster preview, player willingness, and localized CLI output. That is still not enough to judge whether the game is fun, because the choice does not survive beyond the command output.

This phase introduces a minimal career state and persistence flow so an accepted market decision can be written, reloaded, inspected, and used as a foundation for the first playable career loop.

## Product intent

The player must feel that decisions matter over time:

- choose a club;
- inspect squad and market options;
- complete a simple permanent transfer;
- persist the new squad and budget state;
- reload the career and verify that the decision is still there;
- inspect enough context to continue playing.

This phase is not the full career game. It is the bridge that makes future fun checks meaningful.

## Step order

1. `01-phase-17-output-review.md`
2. `02-career-state-contract.md`
3. `03-career-save-adapter.md`
4. `04-persistent-transfer-application.md`
5. `05-cli-career-market-apply.md`
6. `06-career-state-inspection.md`
7. `07-playable-loop-readiness-review.md`

## Phase constraints

- Preserve deterministic output.
- Keep persistence explicit and inspectable.
- Keep the scope to permanent transfers already supported by Phase 17.
- Do not introduce loans, wages, contracts, transfer windows, AI market behavior, scouting fog, youth systems, installments, or player exchanges.
- Do not create automatic market decisions.
- Do not auto-select lineups, tactics, or formation changes.
- Do not add hardcoded user-facing labels that should go through localization.
- Do not start the next phase.

## Phase-level checks

At the end of the phase, run:

- focused tests for every touched package;
- `pnpm check`;
- a career apply command that writes an accepted permanent transfer;
- a career inspect command that reloads the saved career;
- `pnpm cli simulate-season --seed=demo-001 --market-demo=pro01-affordable-permanent --lang=it`;
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`.

## Definition of Done

- Career state has a minimal documented domain contract.
- Career state can be persisted and reloaded through the storage boundary.
- Accepted permanent transfers can be applied to a career state.
- Rejected permanent transfers do not mutate career state.
- CLI can demonstrate write and reload behavior without a UI.
- Localization is respected for new user-facing output.
- `docs/PROJECT_STATUS.md` explains what is now durable and what remains intentionally out of scope.
- A readiness review states whether the project is ready for the first playable career loop phase.

