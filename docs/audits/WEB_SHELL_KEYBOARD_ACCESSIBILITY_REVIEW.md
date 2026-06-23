# Web Shell Keyboard Accessibility Review

Date: 2026-06-23
Phase: `51-web-layout-shell-navigation-and-accessible-inbox-placement`
Step: `05-accessible-navigation-and-keyboard-flow`

## Scope

Reviewed the current app-entry and career-shell keyboard/accessibility structure
after the Phase 51 top-navigation shell and left Inbox/Posta rail changes.

This review covers:

- app entry actions;
- language and currency controls;
- career top navigation;
- Main menu and Continue actions;
- left Inbox/Posta rail;
- central dashboard content;
- disabled/future controls.

## Current Keyboard Flow

Expected tab flow from app entry:

1. New career.
2. Continue career when available; skipped by the browser while disabled.
3. Language select.
4. Currency select.

Expected tab flow after opening the career dashboard:

1. Current Dashboard top-navigation item.
2. Main menu.
3. Continue.
4. Inbox/Posta action when a message exists after Continue.
5. Dashboard action buttons that are available.

Disabled future navigation items and blocked dashboard actions use native
`disabled`, so browsers remove them from the tab order. That is acceptable for
this prototype because they are visible placeholders, not available primary
actions. Later phases can replace them with focusable explanation buttons if
future locked areas need richer discoverability.

## Semantic Findings

- Career shell uses `header`, `nav`, `aside`, and `main`.
- The top navigation has an accessible name from `career.shell.navigation`.
- The central content outlet has an accessible name from
  `career.shell.content`.
- The Inbox rail is an `aside` with an accessible name from
  `career.inbox.title`.
- The current navigation item exposes `aria-current="page"`.
- Main menu, Continue, Inbox action, and dashboard actions are native buttons.
- Language and currency are native selects with visible labels.
- The shell action group now uses `role="group"` with an accessible name.

## Focus Findings

- Global `:focus-visible` styles provide a visible gold outline.
- The left Inbox rail is sticky only on desktop; the sticky offset leaves space
  for the focus outline.
- Narrow layout makes the rail static, avoiding hidden focus below a sticky
  region.
- No modal, drawer, or hover-only essential interaction exists in this phase.

## Remaining Non-Blocking Notes

- Future disabled top-navigation sections are visible but not focusable because
  they use native disabled buttons. This keeps the current tab path short and
  matches their placeholder status.
- Phase 52 or the first real multi-screen phase should decide whether locked
  sections need focusable help/explanation affordances.
- Full screen-reader verification is still manual future work; this step
  verifies semantic structure and keyboard path from code inspection.

## Result

No blocking keyboard or focus issue was found for the current Phase 51 shell.
The shell is ready for responsive polish and Playwright visual QA.
