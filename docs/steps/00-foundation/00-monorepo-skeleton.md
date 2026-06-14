# Monorepo Skeleton

## Goal

Create the minimal pnpm workspace and empty package structure required for Phase 0. At the end, `pnpm install` works and `pnpm cli doctor` can be wired in a later step.

## Why we implement it this way

The project starts as a deterministic headless engine, not a web app. A small pnpm monorepo gives stable package boundaries from day one while avoiding Turborepo, React, SQLite, Tauri, and other premature infrastructure. The skeleton exists to make later dependency enforcement possible.

## What to implement

- Root `package.json` with scripts: `test`, `lint`, `depcruise`, `check`, and `cli`.
- `pnpm-workspace.yaml`.
- `tsconfig.base.json` with `@game/*` path aliases.
- Package manifests for `@game/domain`, `@game/shared`, `@game/engine`, `@game/content`, and `@game/storage`.
- CLI package manifest for `@game/cli`.
- Empty `src/index.ts` files that export nothing or minimal placeholders.
- Placeholder READMEs only if useful for empty directories.

## What NOT to implement

- Do not add gameplay types beyond package placeholders.
- Do not add match engine, season engine, generators, storage implementation, or CLI commands.
- Do not add React, Vite, SQLite, Web Worker, Tauri, UI package, desktop app, localization, or modding files.
- Do not add Turborepo.

## Allowed dependencies

- Root tooling only.
- `apps/cli` may reference workspace packages but must not depend on code that does not exist yet.
- Packages must not import from each other in this step unless a trivial index export requires it.

## Expected files

- `package.json`
- `pnpm-workspace.yaml`
- `tsconfig.base.json`
- `apps/cli/package.json`
- `apps/cli/tsconfig.json`
- `apps/cli/src/index.ts`
- `packages/domain/package.json`
- `packages/domain/tsconfig.json`
- `packages/domain/src/index.ts`
- `packages/shared/package.json`
- `packages/shared/tsconfig.json`
- `packages/shared/src/index.ts`
- `packages/engine/package.json`
- `packages/engine/tsconfig.json`
- `packages/engine/src/index.ts`
- `packages/content/package.json`
- `packages/content/tsconfig.json`
- `packages/content/src/index.ts`
- `packages/storage/package.json`
- `packages/storage/tsconfig.json`
- `packages/storage/src/index.ts`

## Required tests

- `pnpm install` completes.
- `pnpm test` exists and returns success, even if it is a placeholder before Vitest is introduced.
- TypeScript config resolves package paths.

## Definition of Done

- The required workspace directories exist.
- The required package manifests exist.
- `@game/*` package names are used.
- No forbidden package or app has been created.
- No gameplay code has been implemented.

## Claude Code task prompt

Read `docs/PROJECT_STATUS.md` before starting and update it after verification. Implement only the Phase 0 monorepo skeleton from `docs/steps/00-foundation/00-monorepo-skeleton.md`. Create the pnpm workspace, package manifests, tsconfig base, and empty package entrypoints. Do not add gameplay code or future-phase packages.
