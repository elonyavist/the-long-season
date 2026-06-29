# 05 - CLI Rollover And Development Report Migration

## Goal

Move CLI season rollover and development-report paths onto the canonical engine use-case.

The CLI must become an Adapter: it loads saves, calls the engine, writes saves when requested, and formats structured facts.

## Expected files

- `apps/cli/src/commands/career/`
- `apps/cli/src/commands/career.test.ts`
- `packages/engine/src/career/advance-career-season.ts`
- `docs/audits/CAREER_ADVANCEMENT_PATH_AUDIT.md`
- `docs/PROJECT_STATUS.md`

## What to implement

1. Migrate CLI career rollover behavior to call the canonical engine Module.
2. Migrate development-report behavior so it renders facts from the canonical advancement output instead of duplicating development order.
3. Preserve existing command behavior and output intent.
4. Keep save loading/writing in CLI adapter code.
5. Keep formatting and localization in CLI presentation code.
6. Remove or shrink duplicate orchestration helpers when they become unused.
7. Add or update tests proving:
   - rollover calls the canonical use-case;
   - development report is deterministic;
   - inspection-only behavior does not write saves;
   - write-enabled behavior persists only after a successful advancement result.

## What NOT to implement

- Do not add new CLI flags.
- Do not change user-facing command semantics except where necessary to remove duplicate orchestration.
- Do not move CLI formatting into the engine.
- Do not tune career logic.
- Do not add UI.

## Required checks

```bash
nvm use 24
pnpm exec vitest run apps/cli/src/commands/career.test.ts
pnpm exec vitest run packages/engine/src/career/advance-career-season.test.ts
pnpm --filter @game/cli run typecheck
pnpm --filter @game/engine run typecheck
pnpm cli career --save=phase63-check --seed=world-a --new-world-preview
pnpm cli career --save=phase63-check --rollover-season
pnpm cli career --save=phase63-check --development-report
git diff --check
```

## Completion notes

Update `docs/PROJECT_STATUS.md` with:

- active step path;
- migrated CLI paths;
- verification result;
- any command still using old orchestration and why.
