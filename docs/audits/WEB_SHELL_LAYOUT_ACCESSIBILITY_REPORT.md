# Web Shell Layout Accessibility Report

Date: 2026-06-23
Phase: `51-web-layout-shell-navigation-and-accessible-inbox-placement`

## Verdict

Status: COMPLETE.

The web shell is ready to host the next match-preparation slice.

Phase 51 moved the first career prototype from isolated dashboard panels toward
a stable football-manager shell:

- top global navigation;
- left Inbox/Posta attention rail;
- central selected-content outlet;
- Continue as the career heartbeat;
- WCAG 2.2 AA as the working accessibility target.

No match-preparation editor, lineup editor, tactic editor, real save
persistence, economics, market UI, staff UI, youth decision UI, or full mail
client was implemented.

## What Changed

### Project Policy

- `requirements.md` now states that the first browser shell uses top navigation,
  a left Inbox/Posta rail, central selected content, and WCAG 2.2 AA as the
  working accessibility target.
- `docs/PROJECT_RULES.md` now includes web accessibility rules for keyboard
  reachability, visible focus, semantic landmarks, accessible names, current
  navigation state, non-color-only state, and Playwright screenshot review.

### UI Read Model Boundary

- `packages/ui/src/career/career-shell-view.ts` defines the language-agnostic
  shell/navigation contract:
  - stable section keys;
  - current section state;
  - disabled future-section state;
  - central content section;
  - left Inbox rail state;
  - label keys instead of rendered prose.

This keeps future web and CLI adapters away from hardcoded navigation strings.

### Web Shell

- `apps/web/src/components/CareerShell.tsx` renders:
  - career brand and selected club context;
  - top career navigation;
  - Main menu and Continue action group;
  - left Inbox/Posta rail;
  - central selected-content outlet.
- `apps/web/src/screens/CareerDashboardScreen.tsx` now renders dashboard content
  inside that shell.
- `apps/web/src/components/CareerInboxPanel.tsx` remains the compact attention
  panel; it is now placed by the shell instead of the dashboard body.

### Visual Polish

- Desktop top navigation fits on one row at the checked viewport.
- The left Inbox rail has a smaller, stable footprint.
- Central content has overflow protection for long IDs and names.
- Narrow layout stacks top navigation, action controls, Inbox rail, and central
  content without requiring an inaccessible drawer.

### Documentation And QA

- `docs/audits/WEB_SHELL_LAYOUT_ACCESSIBILITY_SCOPE.md` records the adopted shell
  direction.
- `docs/audits/WEB_SHELL_KEYBOARD_ACCESSIBILITY_REVIEW.md` records expected tab
  order, landmarks, current navigation, disabled future sections, and focus
  behavior.
- `docs/audits/WEB_SHELL_ACCESSIBILITY_VISUAL_QA.md` records Playwright
  screenshots and browser findings.
- `docs/ARCHITECTURE.md` now maps the shell view-model, `CareerShell`, and shell
  visual QA script.

## Accessibility Findings

Working target: WCAG 2.2 AA.

Verified in this phase:

- app entry and shell controls are keyboard-reachable;
- focus outline is visible;
- top navigation exposes a named `navigation` landmark;
- current dashboard section exposes `aria-current="page"`;
- the left Inbox rail exposes a named complementary region;
- central content exposes a named main region;
- Main menu and Continue are grouped as shell actions;
- disabled future sections are skipped by keyboard and visually subdued;
- the Inbox action remains a native button when an action-required message
  exists;
- desktop and narrow layouts have no horizontal overflow in the Playwright
  check.

Known non-blocking issue:

- Disabled future navigation buttons are acceptable while those sections are
  placeholders. When Squad, Tactics, Fixtures, Market, Finances, Facilities,
  Youth, Staff, and Archive become real screens, they should become real
  navigation controls rather than disabled buttons.

## Playwright Evidence

Command:

```bash
source ~/.nvm/nvm.sh && nvm use 24 >/dev/null && node --experimental-strip-types apps/web/src/visual-qa/shell-accessibility.spec.ts
```

Screenshots:

- `/tmp/the-long-season-phase51/main-menu-desktop.png`
- `/tmp/the-long-season-phase51/career-shell-desktop-before-continue.png`
- `/tmp/the-long-season-phase51/career-shell-desktop-after-continue.png`
- `/tmp/the-long-season-phase51/career-shell-narrow-after-continue.png`

Browser checks covered:

- main menu;
- New career;
- dashboard shell;
- top navigation;
- left Inbox rail;
- Continue stop;
- narrow viewport;
- minimal keyboard focus path.

## Dependency Direction

Dependency direction remains valid:

- `@game/ui` stays framework-free and language-agnostic.
- `apps/web` imports `@game/ui`, `@game/i18n`, and the existing demo Continue
  adapter path.
- `apps/web` does not parse CLI output.
- `apps/web` does not import raw domain contracts directly.
- `engine`, `domain`, `content`, `storage`, and `simulation-tools` remain free
  from React/browser dependencies.

`pnpm depcruise` passes.

## Out Of Scope

Still intentionally not implemented:

- match-preparation editor;
- lineup editor;
- tactic editor;
- match viewer;
- real browser save persistence;
- market UI;
- contracts, wages, staff, stadium, ticket price, sponsorship, or economics UI;
- youth academy decision UI;
- full mail/news client;
- automatic manager choices;
- hidden squad-need recommendations.

## Product Decision

The left Inbox/Posta rail works better than a full mail screen at this stage:
it keeps user attention visible while preserving the selected career screen as
the central workspace. This matches the desired Football Manager-style flow:
the user presses Continue, the game stops at something that needs attention,
and the shell shows both the attention item and the current screen context.

## Recommended Next Phase

Exactly one next phase is recommended:

`Phase 52 - Web Match Preparation Slice`

Reason:

The shell is now stable enough to host the first real manager decision screen.
The next most valuable UI slice is not more shell polish; it is letting the user
resolve the current blocker by preparing the next match from inside the web app.
