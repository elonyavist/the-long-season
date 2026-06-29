# 06 - Ten-Season Report And Long-Run Migration

## Goal

Move ten-season and long-run simulation/report paths onto the canonical season advancement use-case.

Reports may own loops and metrics. They must not own the season advancement rules.

## Expected files

- `apps/cli/src/commands/ten-season-report/`
- `apps/cli/src/commands/ten-season-report.test.ts`
- `packages/simulation-tools/src/long-run/career-long-runner.ts`
- `packages/simulation-tools/src/long-run/career-long-runner.test.ts`
- `packages/engine/src/career/advance-career-season.ts`
- `docs/PROJECT_STATUS.md`

## What to implement

1. Migrate ten-season report season advancement to call the canonical engine Module.
2. Migrate long-run career runner season advancement to call the canonical engine Module.
3. Keep report metrics and batch iteration in report/simulation-tool code.
4. Keep the advancement order only in the engine Module.
5. Preserve existing report intent and deterministic behavior.
6. Add or update tests proving:
   - ten-season reports use the canonical advancement use-case;
   - long-run simulations use the canonical advancement use-case;
   - same seed still produces deterministic report data;
   - report metrics are derived from structured state/facts, not duplicated rule execution.

## What NOT to implement

- Do not tune report thresholds.
- Do not change warning semantics.
- Do not add new gameplay systems.
- Do not add web UI.
- Do not add large-world scale changes.

## Required checks

```bash
nvm use 24
pnpm exec vitest run apps/cli/src/commands/ten-season-report.test.ts
pnpm exec vitest run packages/simulation-tools/src/long-run/career-long-runner.test.ts
pnpm exec vitest run packages/engine/src/career/advance-career-season.test.ts
pnpm --filter @game/cli run typecheck
pnpm --filter @game/simulation-tools run typecheck
pnpm --filter @game/engine run typecheck
pnpm cli ten-season-report --seed=phase63-world --seasons=10
git diff --check
```

## Completion notes

Update `docs/PROJECT_STATUS.md` with:

- active step path;
- migrated report paths;
- verification result;
- any remaining duplicate advancement logic.
