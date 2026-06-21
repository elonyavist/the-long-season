# Phase 22 - Pre Playable Loop Hardening

## Goal

Close the quality gaps found by `Phase 21 - Project Audit And Roadmap Reconciliation` before starting the first playable career loop.

Phase 21 scored the project at `88 / 100`: no blocker, but the next phase would put pressure on career CLI size, save behavior, deterministic career checks, and roadmap clarity. This phase should raise confidence toward `95 / 100` before the project starts implementing the save-driven playable loop.

## Product intent

The next playable loop should feel coherent because the project is already clean, not because Phase 23 has to solve cleanup and gameplay at the same time.

This phase is intentionally not a new gameplay phase. It prepares the project so Phase 23 can focus on the user loop:

- load an existing career save;
- inspect the current state;
- make a durable manual choice;
- advance a fixture or round;
- persist the changed state;
- reload and inspect the consequences.

## Step order

1. `01-roadmap-status-alignment.md`
2. `02-career-cli-module-boundaries.md`
3. `03-career-save-runtime-policy.md`
4. `04-career-determinism-golden-checks.md`
5. `05-phase-23-readiness-review.md`

## Phase constraints

- Do not implement the playable career loop in this phase.
- Do not advance time, simulate a persisted career fixture, or add a career progression command.
- Do not add youth, scouting, loans, contracts, wages, staff, facilities, UI, or advanced market behavior.
- Do not add automatic manager decisions.
- Preserve deterministic output.
- Keep CLI/user-facing text localized through the existing i18n layer.
- Keep changes narrow and tied to the active step's expected files.
- Do not add dead code, compatibility leftovers, unused helpers, or deferred cleanup.

## Phase-level checks

At the end of the phase, run:

- focused tests for touched files;
- `pnpm check`;
- `pnpm cli career --save=phase22-hardening-world --seed=world-a --new-world-preview`;
- `pnpm cli career --save=phase22-hardening-world --inspect`;
- `pnpm cli simulate-season --seed=world-a --identity-review`;
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`;
- `git diff --check`.

## Definition of Done

- The active roadmap/status no longer says Phase 22 is the playable loop.
- Career CLI code has a safer boundary for Phase 23 work.
- Career save runtime behavior is explicit to the user/developer.
- Career creation/inspection/save determinism is covered by focused golden checks.
- A readiness report explains whether Phase 23 can start.
- `docs/PROJECT_STATUS.md` points to the correct next active implementation step.
