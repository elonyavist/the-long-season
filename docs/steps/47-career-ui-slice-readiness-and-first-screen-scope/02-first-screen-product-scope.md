# 02 - First Screen Product Scope

## Goal

Define the exact first career screen before creating contracts.

This step turns the UI direction into a product slice: what the manager sees
first after opening a save, which decisions the screen supports, and which
features remain outside the first UI slice.

## Expected files

- `docs/audits/CAREER_FIRST_SCREEN_SCOPE.md`
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Create `docs/audits/CAREER_FIRST_SCREEN_SCOPE.md`.
- Define the first screen name and purpose. Recommended default:
  `Career Dashboard / Matchday Hub`.
- Define the screen's required sections:
  - career context and selected club;
  - current date and season;
  - next selected-club fixture;
  - saved lineup and tactic readiness;
  - selected-club squad condition summary;
  - table position or compact table context;
  - last relevant match/result when available;
  - available manager actions;
  - blockers that prevent advancing cleanly.
- Define which facts are values, which facts are stable IDs, and which facts are
  translation keys.
- Define the first-screen action list at product level only, for example:
  inspect squad, inspect lineup, inspect tactic, prepare match, advance next
  fixture, inspect table.
- Explicitly mark out of scope:
  - transfer screen;
  - youth academy screen;
  - full tactic board;
  - full squad table;
  - full fixture list;
  - match viewer;
  - news inbox;
  - finances;
  - scouting.
- Confirm the screen does not show hidden squad-need recommendations or exact
  hidden potential.
- Do not create source code in this step.

## What NOT to implement

- Do not add a UI package.
- Do not add React, HTML, CSS, or screenshots.
- Do not create CLI output.
- Do not add translations.
- Do not change saves or gameplay behavior.
- Do not expand the first screen into the whole career UI.

## Required checks

- `test -f docs/audits/CAREER_FIRST_SCREEN_SCOPE.md`
- `git diff --check`

## Definition of Done

- The first screen has a bounded product scope.
- The document explains which manager decisions it supports.
- The document explains what is intentionally not shown yet.
- `docs/PROJECT_STATUS.md` records Step 02 as complete or blocked.
