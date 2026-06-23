# Web Shell Accessibility And Visual QA

Date: 2026-06-23
Phase: `51-web-layout-shell-navigation-and-accessible-inbox-placement`
Step: `07-playwright-accessibility-and-visual-qa`

## Scope

This QA pass verifies the first career web shell after the Phase 51 layout
rework:

- main menu/app entry;
- New career flow;
- top career navigation;
- left Inbox/Posta rail;
- central dashboard content;
- Continue attention stop;
- desktop and narrow viewport layout;
- practical keyboard/focus behavior.

## Command Run

```bash
source ~/.nvm/nvm.sh && nvm use 24 >/dev/null && node --experimental-strip-types apps/web/src/visual-qa/shell-accessibility.spec.ts
```

The script starts Vite through `pnpm --filter @game/web exec vite` on a fixed
local port, drives Chromium with Playwright, checks shell landmarks and layout
geometry, checks the current navigation state, verifies a small keyboard focus
path, and writes screenshots outside the repository.

## Screenshot Outputs

- `/tmp/the-long-season-phase51/main-menu-desktop.png`
- `/tmp/the-long-season-phase51/career-shell-desktop-before-continue.png`
- `/tmp/the-long-season-phase51/career-shell-desktop-after-continue.png`
- `/tmp/the-long-season-phase51/career-shell-narrow-after-continue.png`

## Automated Assertions

- Main menu exposes a focusable `New career` action.
- Career shell exposes:
  - banner landmark;
  - `Career navigation` nav landmark;
  - `Inbox` complementary landmark;
  - `Selected career screen` main landmark.
- Dashboard navigation item exposes `aria-current="page"`.
- Desktop geometry keeps the Inbox rail left of central content.
- Narrow geometry stacks Inbox before central content.
- Desktop and narrow viewports have no horizontal document overflow.
- Keyboard focus path reaches:
  - Dashboard;
  - Main menu;
  - Continue.
- Continue produces the expected attention stop and Inbox action message.

## Desktop Findings

Status: PASS.

The desktop shell is coherent with the premium retro direction:

- top navigation fits on one row at `1366x900`;
- disabled future sections remain visible but not focusable;
- Main menu and Continue stay visually separated from section navigation;
- left Inbox rail remains readable and does not starve dashboard content;
- central dashboard cards keep stable spacing and no visible text clipping;
- Continue focus outline is visible and not hidden by the header.

## Narrow Viewport Findings

Status: PASS.

The narrow shell uses a stacked layout:

- top navigation remains visible and wraps into compact rows;
- Main menu and Continue are full-width and easy to target;
- Inbox/Posta appears before the selected content, preserving attention order;
- central dashboard content remains readable;
- no horizontal overflow was detected at `390x844`;
- no drawer is needed yet for this prototype because the stacked rail is simpler
  and keyboard-reachable.

## Keyboard And Focus Findings

Status: PASS.

- Focus is visibly outlined through the global `:focus-visible` style.
- Dashboard communicates current location with `aria-current="page"`.
- Disabled future navigation buttons are intentionally skipped by keyboard.
- The next reachable shell controls after Dashboard are Main menu and Continue.
- The Inbox action remains a normal button when an action-required message
  exists.

## Remaining Non-Blocking Issues

- Future phases should revisit the disabled top-navigation behavior once those
  sections become real screens; disabled buttons are acceptable for this
  prototype but should become real navigation controls when implemented.
- A future dedicated accessibility pass should add screen-reader transcript
  review once the app has more than one real career screen.

## Decision

Phase 51 can proceed to the final report. The shell is not complete as a game
interface, but its navigation, left Inbox placement, central outlet, focus
behavior, and responsive layout are strong enough for the next documented UI
slice.
