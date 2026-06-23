# Phase 43 - Architecture Hardening And Package Rework

## Goal

Harden the project architecture before adding more gameplay systems or UI work.

The goal is not a rewrite for its own sake. The goal is to make the existing package structure easier to read, safer to extend, and harder to misuse:

- a junior developer must be able to find the entry point;
- a junior developer must be able to follow the flow from CLI/adapters into engine/content/storage;
- core gameplay sequencing must live behind clear, deep interfaces;
- large files must be measured before being split;
- every change must preserve deterministic behavior unless a documented bug is fixed.

## Product intent

- User fun and football credibility remain the reason for every architectural change.
- The engine must stay deterministic and language-agnostic.
- CLI and future UI should consume stable use-cases instead of recomposing low-level helpers.
- Code should be simple first, SOLID only where it improves extension without adding indirection.
- A future developer should know where to debug matchday, world generation, diagnostics, and career progression.

## Architecture intent

- Keep the current package dependency direction unless an audit proves a change is necessary.
- Prefer deeper modules with smaller public interfaces over more shallow helpers.
- Reduce public export surface where safe.
- Move orchestration out of oversized adapters when it represents gameplay flow.
- Do not introduce framework-style abstractions, service locators, dependency injection containers, or class hierarchies unless a step proves they are simpler than the current code.

## Ordered steps

1. `01-package-and-file-complexity-inventory.md`
2. `02-public-interface-surface-review.md`
3. `03-career-advancement-deep-module.md`
4. `04-cli-command-slimming-plan-and-first-slice.md`
5. `05-world-generation-module-deepening.md`
6. `06-long-run-diagnostics-module-cleanup.md`
7. `07-junior-readability-pass.md`
8. `08-documented-architecture-map-and-phase-report.md`

## Phase-level checks

- Focused tests for every touched package.
- `pnpm depcruise`
- `pnpm check`
- `pnpm cli doctor`
- `pnpm cli simulate-season --seed=world-a`
- `pnpm cli career --save=phase43-check --seed=world-a --new-world-preview`
- `pnpm cli career --save=phase43-check --summary`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`
- `git diff --check`

## What NOT to implement in this phase

- No new gameplay systems.
- No UI.
- No market feature expansion.
- No youth feature expansion.
- No player generation tuning unless needed only to preserve existing tests after moving code.
- No match scoring probability tuning.
- No table balance tuning.
- No dependency-rule weakening.
- No broad package rewrite without an audit-backed migration path.
- No new package unless a step proves that app-level duplication cannot be solved inside the existing package graph.
- No dead wrappers, compatibility leftovers, unused aliases, or temporary helper layers.

## Definition of Done

- The project has a file-by-file architecture inventory with complexity and readability notes.
- Public package interfaces are reviewed and the stable entry points are documented.
- Career matchday advancement has a clearer entry point or a documented reason why it should remain unchanged.
- At least one oversized CLI command area is made easier to follow without changing gameplay.
- World generation has a clearer top-level entry point or a documented reason why it should remain unchanged.
- Long-run diagnostics have clearer ownership outside CLI where appropriate.
- Changed source files have useful TSDoc/JSDoc and local comments where they help a junior developer follow the flow.
- `docs/ARCHITECTURE.md` explains project areas, important files, entry points, and common debugging paths.
- Final report explains what changed, what stayed intentionally unchanged, and how a junior developer should trace the main flows.
- `docs/PROJECT_STATUS.md` records the verification result and the next recommended phase.
