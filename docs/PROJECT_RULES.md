# Project Rules

This file is binding for Claude Code and future developers. `requirements.md` is the source of truth.

## Package Dependency Rules

- `domain -> nothing`
- `shared -> nothing`
- `engine -> domain, shared`
- `content -> domain, shared`
- `storage -> domain, shared`
- `simulation-tools -> domain, engine, shared`
- `apps/cli -> engine, content, storage, simulation-tools, shared`
- `apps/web -> engine, content, storage, ui, shared`
- `apps/desktop -> web`

## Absolute Bans

- Engine must not import React, SQLite, Tauri, browser APIs, filesystem APIs, UI code, storage implementations, or apps.
- Domain must not import engine, storage, content, shared, apps, or UI code.
- Storage must never import engine.
- Content must never import engine.
- Packages must not import from `apps/*`.
- Content packs must not contain executable scripts.
- No `Math.random()` inside engine.
- No real clock for game time inside engine.
- No `Date.now()`, `new Date()`, `crypto.randomUUID()`, or `performance.now()` inside engine.

## Determinism Rules

- Use seeded RNG from `shared`.
- Use derived RNG streams by stable keys.
- Persist seed and algorithm version, not global RNG state.
- Use `GameDate` epoch-day for game time.
- Use explicit ordered ID arrays for simulation order.
- Do not use `Object.values()`, `Object.keys()`, or `Object.entries()` for order-sensitive simulation.
- Every sort must have a deterministic final tie-breaker.
- Generated IDs must be stable and non integer-like.

## Step Discipline Rules

- Work on exactly one documented step at a time.
- The active step is the smallest `docs/steps/**.md` file named by the task or by the next unfinished milestone.
- A step may only create or modify files listed in its `Expected files`, unless the deviation is necessary and documented in the final summary.
- `docs/PROJECT_STATUS.md` may always be modified for status updates, even when it is not listed in the active step's `Expected files`.
- The next relevant step document may be modified to capture lessons learned before that step starts.
- `What NOT to implement` is scoped to the active step, not a permanent project ban.
- The workflow is incremental and iterative: implement the smallest useful slice, run its checks, fix what fails, update the next step if reality changed, then advance.
- Mandatory execution loop:
  1. Read `docs/PROJECT_STATUS.md`.
  2. Choose the active step.
  3. Implement only that step.
  4. Run the required checks.
  5. If something is wrong, fix the current step or update the next step document before moving on.
  6. Update `docs/PROJECT_STATUS.md` in a short entry.
  7. Advance to the next step.
- Do not start the next step while the current step has failing checks, unresolved scope questions, or an unsatisfied Definition of Done.
- A later step may refine or replace earlier implementation details, but only through a documented step with tests and a narrow migration path.
- Update `docs/PROJECT_STATUS.md` after every step, including `Current Active Step`, `Step Ledger`, adopted solution, verification result, and next action.
- Future systems are allowed when they become the active documented step and their phase gate is satisfied.
- When the current documented sequence is complete, create the next numbered step document under `docs/steps/` before implementing the next feature.
- Do not modify this rulebook just to move to the next phase.
- First real command: `pnpm cli doctor`.
- First gameplay milestone: `pnpm cli simulate-season --seed=demo-001`.

## Early Phase Scope Guard

- Before `pnpm cli simulate-season --seed=demo-001` works, do not implement React, SQLite, Web Worker, Tauri, localization, modding editor, youth, staff, facilities, media/events, advanced market, Steam work, or other future systems.
- After that milestone works, future systems may proceed one documented step at a time.

## Definition Of Done

- Code compiles.
- Tests pass.
- Dependency rules pass.
- Determinism tests pass.
- No forbidden imports exist.
- No forbidden runtime APIs are used inside engine.
- Step-specific Definition of Done is satisfied.
- Lessons learned that affect future work are captured in the next step document, not hidden in code or chat.
- `docs/PROJECT_STATUS.md` reflects the current active step, step status, adopted solution, verification result, and next action.
