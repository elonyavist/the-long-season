# 02 - Folder Map And Migration Plan

## Goal

Define the target `apps/web/src` folder map and migration order before touching
source files.

The plan must be simple enough for a junior developer to navigate.

## Expected files

- `docs/audits/WEB_FOLDER_STRUCTURE_PLAN.md`
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Document the target folder map:
  - `app/`
  - `shared/ui/`
  - `shared/layout/`
  - `shared/lib/`
  - `features/app-entry/`
  - `features/career-shell/`
  - `features/dashboard/`
  - `features/match-preparation/`
  - `stores/`
  - `styles/`
  - `visual-qa/`
- For every current source file, assign a target folder or explicitly justify
  why it stays in place.
- Define migration order that keeps tests passing after each step.
- Define what belongs in `shared/*`:
  only Modules reused by at least two feature areas or genuinely generic browser
  helpers.
- Define what must not go into `shared/*`:
  feature-specific tactical, dashboard, or Inbox behavior.
- Define import conventions.

## What NOT to implement

- Do not move files yet.
- Do not add barrel files unless the plan proves they add locality.
- Do not create empty future-feature folders.
- Do not invent a route system.

## Required checks

- `test -f docs/audits/WEB_FOLDER_STRUCTURE_PLAN.md`
- `git diff --check`

## Definition of Done

- Every current web source file has an intended home.
- Folder names and responsibilities are documented.
- `docs/PROJECT_STATUS.md` identifies Step 03 as the next action.
