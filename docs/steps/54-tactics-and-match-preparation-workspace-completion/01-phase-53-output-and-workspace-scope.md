# 01 - Phase 53 Output And Workspace Scope

## Goal

Review the Phase 53 tactical UI output and define the exact workspace scope
before changing source code.

This step should confirm why Phase 54 comes before Inbox/Posta Decision Center:
Inbox can link to match preparation only if match preparation is strong enough
to resolve the real football decision.

## Expected files

- `docs/audits/WEB_TACTICS_WORKSPACE_SCOPE.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Review:
  - Phase 52 match-preparation report;
  - Phase 53 UI identity report;
  - current architecture notes for web components;
  - current career web section roadmap.
- Document the current problems:
  - formation cannot be changed;
  - substitutes are not selectable;
  - pitch/list components were only recently extracted;
  - the current screen is not yet a complete tactical workspace.
- Confirm the adopted scope:
  - formation catalog;
  - formation-specific slots;
  - starting XI;
  - 8 substitutes;
  - tactic profile;
  - explicit save.
- Confirm out-of-scope items:
  - drag-and-drop;
  - substitutions during match;
  - individual player instructions;
  - role training/adaptation;
  - automatic best XI;
  - market advice.
- Check and update `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md` so Phase 54 is
  the tactical workspace and Inbox/Posta follows it.
- State the user-experience target:
  - retro football tactical room;
  - clear manager agency;
  - no hidden recommendations;
  - no buried blockers.

## What NOT to implement

- Do not change source code.
- Do not create a formation catalog in code yet.
- Do not redesign the UI in this step.
- Do not implement Inbox/Posta Decision Center.

## Required checks

- `test -f docs/audits/WEB_TACTICS_WORKSPACE_SCOPE.md`
- `rg "Phase 54 - Tactics And Match Preparation Workspace Completion" docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- `git diff --check`

## Definition of Done

- The scope audit exists.
- The roadmap dependency order is explicit.
- The phase has clear boundaries before implementation starts.
- `docs/PROJECT_STATUS.md` identifies Step 02 as the next action.
