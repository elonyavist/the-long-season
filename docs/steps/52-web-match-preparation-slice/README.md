# Phase 52 - Web Match Preparation Slice

## Goal

Build the first almost-complete web match-preparation section.

The user must be able to resolve the current career dashboard blockers from the
web UI:

- missing saved lineup;
- missing saved tactic.

This phase should turn the shell created in Phase 51 into the first real
manager decision loop:

```text
Dashboard -> attention says preparation is missing -> open preparation ->
choose lineup and tactic -> save preparation -> return to dashboard ->
blockers cleared -> Continue can reach matchday.
```

The section must be useful, readable, accessible, and backed by structured data.
It must not be a decorative placeholder.

## Product Intent

Match preparation is the first core Football Manager-style user decision in the
web app. It should make the user feel that the match is approaching and that
their choices matter.

The user should understand:

- the next fixture context;
- which club they are preparing;
- which players are available;
- which lineup is currently selected;
- which tactic is currently selected;
- what remains incomplete;
- how to save and return to dashboard;
- why Continue is blocked or available.

## Scope

This phase should implement a practical first version, not a throwaway toy.

Allowed:

- structured match-preparation read model;
- deterministic demo preparation adapter for the current web prototype;
- selectable lineup slots;
- selectable tactic profile;
- save-preparation action in the in-memory web prototype;
- dashboard blocker resolution after save;
- Inbox/Posta message action linking to preparation;
- desktop and narrow responsive layout;
- Playwright visual and keyboard QA.

Not allowed:

- full drag-and-drop lineup editor;
- automatic best XI;
- hidden tactic recommendations;
- market/squad-needs advice;
- fixture simulation or match playback;
- real browser save persistence;
- contracts, finances, youth, staff, archive, or market UI;
- code that cannot map to future real career state.

## Required Section Completion Review

Before closing the phase, document:

- dependency review;
- code quality review;
- architecture review;
- UI/UX review;
- accessibility review;
- fun/agency review;
- improvement decision.

If the section can clearly be improved before moving on, improve it in this
phase instead of carrying weak work into the next phase.

## Ordered Steps

1. `01-phase-51-output-and-preparation-scope.md`
2. `02-match-preparation-view-contract.md`
3. `03-web-preparation-demo-adapter-and-state.md`
4. `04-lineup-selection-screen.md`
5. `05-tactic-selection-and-save-flow.md`
6. `06-dashboard-and-inbox-preparation-resolution.md`
7. `07-responsive-accessibility-and-visual-qa.md`
8. `08-section-quality-fun-and-architecture-review.md`
9. `09-phase-report-and-next-phase-decision.md`

## Phase-Level Checks

- Focused tests for every touched package/app module.
- `pnpm --filter @game/ui run typecheck` when UI contracts change.
- `pnpm --filter @game/web run typecheck` when web code changes.
- `pnpm --filter @game/web run test` when web tests exist.
- `pnpm --filter @game/web run build` when web code changes.
- `pnpm depcruise`
- `pnpm check`
- Playwright screenshot QA for desktop and narrow viewport.
- Keyboard/focus notes in the phase audit.
- `git diff --check`

## Definition Of Done

- The dashboard no longer leaves match-preparation blockers buried at the
  bottom of the page.
- The user can open a match-preparation screen from the current web flow.
- The user can choose/save a lineup and tactic from structured data.
- The saved preparation clears dashboard blockers in the current web prototype.
- Continue can move from missing preparation to matchday-ready behavior in the
  web prototype.
- The section is accessible by keyboard and documented against WCAG 2.2 AA
  expectations for this slice.
- The section has no known dead code, decorative-only abstractions, or duplicated
  engine rules inside React components.
- The final report recommends exactly one next phase.

