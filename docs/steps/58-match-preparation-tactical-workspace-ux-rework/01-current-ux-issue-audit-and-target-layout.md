# 01 - Current UX Issue Audit And Target Layout

## Goal

Document the exact match-preparation UX problems before source changes, then
define the target layout so the rework is not a vague visual tweak.

## Expected Files

- `docs/audits/MATCH_PREPARATION_TACTICAL_WORKSPACE_UX_AUDIT.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What To Implement

- Review the current match-preparation screen and the screenshots provided by
  the user.
- Record the adopted layout decisions:
  - compact match header;
  - compact alert strip;
  - board toolbar with formation and helper actions;
  - board-first hierarchy;
  - squad list remains visible on desktop when useful;
  - left click selects player detail;
  - right click/long press opens contextual actions;
  - candidate rows show number, surname, natural role, `%`, foot, and
    suitability.
- Identify which current components should be changed and which should not be
  touched.
- Confirm that Inbox/Posta is still deferred until this UX pass is complete.

## What NOT To Implement

- Do not change source code in this step.
- Do not redesign the whole app shell.
- Do not implement a new route.
- Do not introduce new gameplay state.

## Required Checks

```sh
nvm use 24
test -f docs/audits/MATCH_PREPARATION_TACTICAL_WORKSPACE_UX_AUDIT.md
git diff --check
```

## Definition Of Done

- The audit explains the UX problem in football-manager terms, not just CSS
  terms.
- The target layout is specific enough for implementation steps to follow.
- The roadmap records this phase as a blocker before Inbox/Posta Decision
  Center.
