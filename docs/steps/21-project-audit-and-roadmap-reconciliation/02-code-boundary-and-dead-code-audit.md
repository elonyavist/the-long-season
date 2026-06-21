# 02 - Code Boundary And Dead Code Audit

## Goal

Audit source package boundaries, stale code, duplicate helpers, unused compatibility leftovers, and presentation hardcoding risk.

This step checks whether the implementation still matches the architecture rules before more career systems are added.

## What to implement

- Review package boundaries for:
  - `domain`;
  - `shared`;
  - `engine`;
  - `content`;
  - `storage`;
  - `simulation-tools`;
  - `i18n`;
  - `apps/cli`.
- Run boundary and quality checks.
- Search for:
  - unused helpers;
  - dead compatibility code;
  - duplicate logic;
  - old demo-only paths that should now be replaced;
  - direct imports that bypass package entrypoints;
  - user-facing text outside localization scope;
  - code that suggests automatic manager decisions instead of user choices.
- Add findings to `docs/audits/PROJECT_ROADMAP_AND_CODE_AUDIT.md` with file references and severity.
- Update `docs/PROJECT_STATUS.md`.

## What NOT to implement

- Do not refactor source code in this step.
- Do not delete suspected dead code without a dedicated cleanup step.
- Do not add new enforcement rules yet.
- Do not add new localization keys unless the step explicitly becomes a scoped rework.
- Do not introduce new dependencies.

## Expected files

- `docs/audits/PROJECT_ROADMAP_AND_CODE_AUDIT.md`
- `docs/PROJECT_STATUS.md`
- `docs/steps/21-project-audit-and-roadmap-reconciliation/03-determinism-and-save-consistency-audit.md` only if a lesson learned changes the next audit step.

## Required checks

- `pnpm depcruise`
- `pnpm lint`
- `pnpm --filter @game/domain run typecheck`
- `pnpm --filter @game/engine run typecheck`
- `pnpm --filter @game/content run typecheck`
- `pnpm --filter @game/cli run typecheck`
- `rg -n "TODO|FIXME|compat|legacy|unused|deprecated|hardcoded|auto-select|automatic|best XI|squad need|Market-need|need hints" packages apps docs requirements.md`
- `git diff --check`

## Definition of Done

- The audit report has a code-boundary and dead-code section.
- Findings are concrete and tied to files or package boundaries.
- No source code is changed unless a documented blocker forces a narrow correction.
- `docs/PROJECT_STATUS.md` points to the next audit step.

