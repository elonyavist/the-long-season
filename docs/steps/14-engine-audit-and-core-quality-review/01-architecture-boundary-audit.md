# Architecture Boundary Audit

## Goal

Verify that the current codebase still respects the intended package boundaries after Phases 08-13.

## Why we implement it this way

The project depends on clean separation: domain is pure, engine is deterministic simulation, content supplies fake data, CLI composes and presents, and localization stays in presentation. Market and youth systems will add new package pressure, so boundary drift must be caught before those systems start.

## What to implement

- Create `docs/audits/ENGINE_CORE_AUDIT.md` if it does not exist.
- Add a section named `1. Architecture Boundary Audit`.
- Review imports across:
  - `packages/domain`
  - `packages/shared`
  - `packages/engine`
  - `packages/content`
  - `packages/simulation-tools`
  - `packages/i18n`
  - `apps/cli`
- Check whether CLI owns presentation and option parsing without duplicating simulation logic.
- Check whether domain and engine remain language-agnostic and do not import localization.
- Check whether content remains deterministic fake-data generation and does not own simulation behavior.
- Check whether any package exports accidental internals that should remain private.
- Record findings as:
  - `Critical`
  - `High`
  - `Medium`
  - `Low`
  - `Accepted`

## What NOT to implement

- Do not move source files during this step.
- Do not refactor package boundaries during this step.
- Do not create new packages.
- Do not add new dependency rules unless the audit report recommends a later rework step.
- Do not implement market, youth, UI, persistence, or career systems.

## Allowed dependencies

- No new dependencies.
- Documentation-only output is expected.

## Expected files

- `docs/audits/ENGINE_CORE_AUDIT.md`
- `docs/PROJECT_STATUS.md`

## Required tests/checks

- `pnpm depcruise`
- `pnpm lint`
- `rg -n "from \"@game/(content|storage|i18n|simulation-tools|cli)" packages/domain packages/shared packages/engine`
- `rg -n "from \"@game/(engine|content|storage|simulation-tools|cli)" packages/domain packages/shared`
- `rg -n "from \"@game/i18n" packages/domain packages/shared packages/engine packages/content packages/simulation-tools`

## Definition of Done

- The audit report contains a clear architecture boundary section.
- Any boundary violation or suspicious dependency is recorded with file paths.
- If no issue is found, the section explicitly says so.
- `docs/PROJECT_STATUS.md` records the step result and next action.

## Claude Code task prompt

Read the required project docs and this step. Audit current package boundaries, run the checks listed here, write the `1. Architecture Boundary Audit` section in `docs/audits/ENGINE_CORE_AUDIT.md`, update `docs/PROJECT_STATUS.md`, and stop after this step.
