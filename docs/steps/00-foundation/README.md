# Foundation Steps

## Goal

Define the Phase 0 implementation path that creates the monorepo skeleton, deterministic shared utilities, core domain types, JSON storage boundary, CLI doctor command, and automated architectural enforcement.

## Why we implement it this way

`requirements.md` makes Phase 0 a discipline step, not a gameplay step. The project must start CLI-first, deterministic, package-boundary enforced, and free from UI, SQLite, browser, Tauri, and feature creep. These steps create the smallest structure that can later support the first real command, `pnpm cli doctor`.

## What to implement

- Complete the foundation steps in order.
- Keep packages physically minimal until a step requires files.
- Create only `apps/cli`, `packages/domain`, `packages/shared`, `packages/engine`, `packages/content`, and `packages/storage`.
- Use `@game/*` workspace package names.
- Keep domain IDs on the `type:value` namespace convention from the first domain step.
- Make `pnpm check` the single local gate once enforcement exists.

## What NOT to implement

- Do not implement match simulation.
- Do not implement season simulation.
- Do not create React, Vite, SQLite, Web Worker, Tauri, desktop app, UI package, localization, modding editor, staff, youth, facilities, media/events, advanced market, or Steam files.
- Do not add `simulation-tools` until season balance reporting needs it.

## Allowed dependencies

- Documentation only in this overview.
- Implementation steps must follow their own dependency sections.

## Expected files

- `docs/steps/00-foundation/00-monorepo-skeleton.md`
- `docs/steps/00-foundation/01-domain-core-types.md`
- `docs/steps/00-foundation/02-shared-rng-and-date.md`
- `docs/steps/00-foundation/03-storage-json.md`
- `docs/steps/00-foundation/04-enforcement.md`

## Required tests

- No tests for this overview.
- Each implementation step defines its own tests.

## Definition of Done

- All foundation step documents exist.
- Each document has a narrow scope guard.
- The recommended first implementation step is clear.

## Claude Code task prompt

Read `docs/PROJECT_STATUS.md` before starting and update it after verification. Read `requirements.md`, `docs/PROJECT_RULES.md`, and `docs/steps/00-foundation/00-monorepo-skeleton.md`. Implement only the monorepo skeleton step. Do not implement gameplay code.
