# 01 - Phase 48 Output And Web Scope Review

## Goal

Confirm the exact web slice to build before adding `apps/web`.

This step should translate the Phase 48 readiness report into a concrete web
scope, including any package-boundary rule changes needed for localization.

## Expected files

- `docs/audits/WEB_APP_SHELL_SCOPE_REVIEW.md`
- `docs/PROJECT_RULES.md`, only if the review confirms a required package-rule
  update such as `apps/web -> @game/i18n`.
- `.dependency-cruiser.cjs`, only if the package-rule update must become
  executable before web code starts.
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Read `docs/audits/CAREER_UI_SLICE_READINESS_REPORT.md`.
- Read `docs/ARCHITECTURE.md`.
- Define the exact first web flow:
  - main menu;
  - settings;
  - demo new career;
  - continue demo career;
  - career dashboard.
- Decide whether `apps/web` must import `@game/i18n` directly.
- If yes, update `docs/PROJECT_RULES.md` and `.dependency-cruiser.cjs`
  narrowly and document why this is not a gameplay dependency.
- Record what the web prototype must consume from `@game/ui`.
- Record what must remain intentionally out of scope.

## What NOT to implement

- Do not create `apps/web` yet.
- Do not add React/Vite dependencies yet.
- Do not design screens yet.
- Do not implement storage.
- Do not change engine, content, storage, or UI read-model behavior.
- Do not create Phase 50 documents.

## Required checks

- `test -f docs/audits/WEB_APP_SHELL_SCOPE_REVIEW.md`
- `pnpm depcruise` if `.dependency-cruiser.cjs` changes.
- `pnpm check` if any executable rule changes.
- `git diff --check`

## Definition of Done

- The first web slice is documented.
- The package-boundary decision for web localization is explicit.
- Any required rule change is documented and executable.
- No web implementation has started.
