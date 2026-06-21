# Step 03 - Archive Obsolete Roadmaps

## Goal

Move or remove obsolete roadmap documents according to the retention policy.

## Context

The previous broad roadmap through old phase numbers is no longer the project driver. The current direction is Phase 26-30: cleanup, season rollover, player development, club identity/calendar, and ten-season report.

## Expected files

- `docs/archive/`
- `docs/audits/README.md`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Read the documentation noise audit and retention policy.
- Archive obsolete roadmap/report files that still have historical value.
- Delete only files explicitly classified as deletion candidates.
- Update the audit index after moves or deletions.
- Keep current phase docs active.
- Do not rewrite old archived documents.

## What NOT to implement

- Do not delete binding design requirements.
- Do not delete current phase documentation.
- Do not hide why a file was archived or deleted.
- Do not implement code.

## Required checks

- `find docs -maxdepth 4 -type f | sort`
- `rg -n "PROJECT_ROADMAP|roadmap|archive" docs/audits docs/archive docs/steps`
- `git diff --check`

## Definition of Done

- Obsolete roadmap noise is removed from the active path.
- Archived material is discoverable but not treated as current guidance.
- `docs/PROJECT_STATUS.md` records the cleanup decision.

