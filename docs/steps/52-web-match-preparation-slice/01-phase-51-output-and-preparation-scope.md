# 01 - Phase 51 Output And Preparation Scope

## Goal

Review the Phase 51 shell output and define the exact Phase 52 match-preparation
scope before writing source code.

This step should prove that match preparation is the right next section and
identify the minimum useful section shape.

## Expected files

- `docs/audits/WEB_MATCH_PREPARATION_SCOPE_REVIEW.md`
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Read:
  - `docs/audits/WEB_SHELL_LAYOUT_ACCESSIBILITY_REPORT.md`;
  - `docs/audits/WEB_SHELL_ACCESSIBILITY_VISUAL_QA.md`;
  - `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`;
  - current web dashboard and shell files.
- Confirm the current blockers:
  - missing saved lineup;
  - missing saved tactic.
- Decide where match preparation sits in the shell:
  - top navigation;
  - left Inbox/Posta action;
  - central outlet.
- Document what the first useful match-preparation section must include.
- Document what must remain out of scope.
- Document any risk that could create dead code or weak UI.

## What NOT to implement

- Do not write source code.
- Do not create match-preparation UI yet.
- Do not add labels, read models, or web state.
- Do not change Phase 51 shell behavior.

## Required checks

- `test -f docs/audits/WEB_MATCH_PREPARATION_SCOPE_REVIEW.md`
- `git diff --check`

## Definition of Done

- The audit explains why Phase 52 starts with match preparation.
- The audit defines the section's required user decisions.
- The audit states the first useful layout direction.
- The audit records dependencies and out-of-scope items.
- `docs/PROJECT_STATUS.md` identifies Step 02 as the next action.

