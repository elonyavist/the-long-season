# Enforcement

## Goal

Make the architecture rules executable: dependency boundaries, engine determinism bans, test runner, and `pnpm check`.

## Why we implement it this way

The project depends on long-term discipline. `requirements.md` says package boundaries and determinism must fail automatically, not rely on memory or review. This step turns the rules into tooling before gameplay code exists.

## What to implement

- Dependency Cruiser configuration for allowed package imports.
- ESLint configuration with scoped rules for `packages/engine`.
- Bans inside engine for `Math.random`, `Date.now`, `new Date`, `crypto.randomUUID`, and `performance.now`.
- Vitest setup.
- Root scripts: `lint`, `depcruise`, `test`, `check`.
- Minimal `apps/cli` doctor command if not already created.
- Negative dependency test or documented fixture proving `storage -> engine` fails.

## What NOT to implement

- Do not add gameplay features to satisfy tests.
- Do not loosen package boundaries for convenience.
- Do not add React, Vite, SQLite, Web Worker, Tauri, or UI tooling.
- Do not enforce future packages that do not physically exist unless the rule is harmless.

## Allowed dependencies

- Root dev tooling.
- `apps/cli -> engine, content, storage, simulation-tools, shared` when those packages exist.
- Package rules must match `docs/PROJECT_RULES.md`.

## Expected files

- `.dependency-cruiser.cjs`
- `eslint.config.js`
- `vitest.config.ts`
- `package.json`
- `apps/cli/src/index.ts`
- `apps/cli/src/commands/doctor.ts`
- `docs/PROJECT_RULES.md`

## Required tests

- `pnpm lint` passes.
- `pnpm depcruise` passes.
- `pnpm test` passes.
- `pnpm check` runs lint, depcruise, and test.
- `pnpm cli doctor` exits `0`.
- A forbidden import fixture or documented command proves dependency rules fail when violated.

## Definition of Done

- Boundary violations fail automatically.
- Forbidden engine runtime APIs fail lint.
- `pnpm check` is the single gate.
- `pnpm cli doctor` is the first real working command.
- No gameplay implementation has been added.

## Claude Code task prompt

Read `docs/PROJECT_STATUS.md` before starting and update it after verification. Implement only enforcement from `docs/steps/00-foundation/04-enforcement.md`. Add dependency-cruiser, ESLint, Vitest, `pnpm check`, and `pnpm cli doctor`. Do not add gameplay code or future-phase tooling.
