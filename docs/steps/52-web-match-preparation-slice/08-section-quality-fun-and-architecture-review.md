# 08 - Section Quality Fun And Architecture Review

## Goal

Review the nearly complete match-preparation section before closing the phase.

This step exists because Phase 52 should not end with a thin UI. It should end
with a section that is useful, readable, maintainable, and fun enough to build
on.

## Expected files

- `docs/audits/WEB_MATCH_PREPARATION_SECTION_REVIEW.md`
- Source files inside Phase 52 expected areas only if the review finds a small
  in-scope improvement that should be fixed before closing
- Focused tests for any source change
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Review dependency direction:
  - `@game/ui` is framework-free;
  - React owns rendering only;
  - engine rules are not duplicated in components;
  - web state can map to future save state.
- Review code quality:
  - no oversized component that should be split now;
  - no unused helper;
  - no dead state branch;
  - no duplicated validation.
- Review architecture:
  - section is open to future real-save adapter;
  - no abstraction exists only for imagined future sections;
  - action flow is clear for a junior developer.
- Review UI/UX:
  - critical blockers are visible early;
  - user knows what to do next;
  - controls are reachable and understandable;
  - layout is dense but not cramped.
- Review fun/agency:
  - the user is making a real choice;
  - the section adds tension before matchday;
  - the section avoids automatic manager choices.
- If a clear in-scope improvement is found, implement it before closing this
  step and rerun checks.

## What NOT to implement

- Do not start Phase 53.
- Do not add a full squad screen.
- Do not add a full tactic editor.
- Do not add match simulation.
- Do not defer obvious local cleanup without documenting why.

## Required checks

- `test -f docs/audits/WEB_MATCH_PREPARATION_SECTION_REVIEW.md`
- Focused checks for any source change
- `pnpm depcruise`
- `pnpm check`
- `git diff --check`

## Definition of Done

- Dependency, code-quality, architecture, UI/UX, accessibility, and fun reviews
  are documented.
- Any obvious local improvement is either fixed or explicitly assigned to a
  future phase with a reason.
- The section is judged strong enough to support the next phase.
- `docs/PROJECT_STATUS.md` identifies Step 09 as the next action.

