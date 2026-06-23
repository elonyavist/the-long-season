# 01 - Phase 49 Output And Continue Loop Scope

## Goal

Review the completed web prototype and define the smallest useful career
continue loop before adding new contracts or UI.

This step should convert the Phase 49 finding into a product decision:
`Continue` should advance until an event requires the manager's attention, and
that event should appear in the Inbox / Posta.

## Expected files

- `docs/audits/CAREER_CONTINUE_INBOX_SCOPE_REVIEW.md`
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Read `docs/audits/WEB_APP_SHELL_PROTOTYPE_REPORT.md`.
- Read the current dashboard contracts and web dashboard implementation.
- Record what Phase 49 already provides:
  - app entry;
  - settings;
  - demo career creation;
  - career dashboard;
  - action blockers for missing lineup/tactic.
- Define the first useful `Continue` behavior:
  - if an attention event already exists, do not advance;
  - otherwise advance toward the next selected-club event;
  - stop before the manager loses agency.
- Classify stop categories as:
  - implemented in this phase;
  - documented for future career systems;
  - explicitly out of scope.
- Confirm that the first implemented stop categories are limited to match
  preparation and matchday readiness.
- Record why Inbox / Posta is required before deeper UI screens.
- Record any package-boundary changes that later steps may need.

## What NOT to implement

- Do not add code.
- Do not add UI.
- Do not create Inbox contracts yet.
- Do not change the dashboard behavior.
- Do not implement match preparation, lineup, tactic, market, contracts,
  economics, or youth decisions.
- Do not create the next phase.

## Required checks

- `test -f docs/audits/CAREER_CONTINUE_INBOX_SCOPE_REVIEW.md`
- `git diff --check`

## Definition of Done

- The scope review exists.
- The implemented and future stop categories are explicit.
- The phase remains focused on the first continue/inbox foundation.
- `docs/PROJECT_STATUS.md` records Step 01 as complete or blocked.
