# 01 - Current Advancement Path Audit

## Goal

Map every current path that advances career time, season state, player development, squad refresh, youth lifecycle, or transfer turnover.

This step is read-only except for audit documentation and project status.

## Expected files

- `docs/audits/CAREER_ADVANCEMENT_PATH_AUDIT.md`
- `docs/PROJECT_STATUS.md`

## What to implement

1. Inspect the current advancement-related code paths, at minimum:
   - `apps/cli/src/commands/career/`
   - `apps/cli/src/commands/ten-season-report/`
   - `packages/simulation-tools/src/long-run/`
   - `packages/engine/src/career/`
2. Identify the current order for:
   - fixture progress;
   - season rollover;
   - player development and aging;
   - player exits;
   - youth academy lifecycle;
   - youth intake;
   - youth promotion;
   - squad maintenance;
   - transfer turnover;
   - season history or report facts.
3. Document every place where adapters currently own or duplicate season orchestration.
4. Document which calls are allowed to remain fixture-level helpers and which must move behind the canonical season use-case.
5. Document open questions and blockers before writing the new Module.

## What NOT to implement

- Do not change source code.
- Do not create the new season advancement Module yet.
- Do not tune gameplay, thresholds, or reports.
- Do not add UI or CLI options.
- Do not change save schema.

## Required checks

```bash
nvm use 24
test -f docs/audits/CAREER_ADVANCEMENT_PATH_AUDIT.md
git diff --check
```

## Completion notes

Update `docs/PROJECT_STATUS.md` with:

- active step path;
- audit status;
- current advancement paths found;
- blocker, if the canonical use-case cannot be scoped without a product decision.
