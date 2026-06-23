# Phase 51 - Web Layout Shell Navigation And Accessible Inbox Placement

## Goal

Rework the first web career prototype into a stable manager-game shell before
adding deeper match-preparation screens:

1. Global navigation lives at the top.
2. Inbox/Posta lives on the left as the primary attention rail.
3. The selected screen renders in the central content area.
4. Continue remains the career heartbeat.
5. The layout is designed and verified against WCAG 2.2 AA expectations.

This phase is about the reusable browser shell and accessibility foundation. It
must not implement the match-preparation editor yet.

## Product intent

- The game should feel like a serious football manager interface, not a set of
  isolated panels.
- The user should always understand:
  - where they are;
  - what needs attention;
  - what the next actionable step is;
  - how to navigate without losing career context.
- The Inbox/Posta should be a decision rail, not decorative news.
- The top navigation should be the stable global map of the career.
- The central area should be the only place where the selected section changes.
- Accessibility is part of the product quality bar, not a later polish pass.

## Accessibility target

The working target for web UI phases is WCAG 2.2 AA.

Phase 51 should document and begin enforcing practical rules for:

- keyboard navigation;
- visible focus;
- semantic landmarks;
- predictable headings;
- accessible names for buttons and controls;
- color contrast;
- non-color-only state communication;
- focus not being hidden by sticky/fixed UI;
- adequate hit targets;
- no text clipping at supported desktop and narrow viewport sizes.

Automated checks are useful but not enough. Playwright screenshot review and
manual keyboard inspection notes are required when browser-rendered screens are
changed.

## Target shell shape

```text
+-------------------------------------------------------------+
| Top navigation: Career, Squad, Tactics, Fixtures, Market...  |
+----------------------+--------------------------------------+
| Inbox/Posta rail     | Selected screen content              |
| - urgent items       |                                      |
| - match prep         | Dashboard / future squad / tactic... |
| - matchday reached   |                                      |
+----------------------+--------------------------------------+
| Optional compact footer/status strip, only if useful         |
+-------------------------------------------------------------+
```

On narrow viewports the left Inbox rail may collapse into an accessible drawer
or stacked region, but it must remain reachable by keyboard and screen reader.

## Ordered steps

1. `01-phase-50-output-and-layout-accessibility-scope.md`
2. `02-career-shell-navigation-contract.md`
3. `03-web-shell-layout-restructure.md`
4. `04-left-inbox-rail-placement-and-content-outlet.md`
5. `05-accessible-navigation-and-keyboard-flow.md`
6. `06-responsive-density-and-retro-premium-polish.md`
7. `07-playwright-accessibility-and-visual-qa.md`
8. `08-phase-report-and-next-phase-decision.md`

## Phase-level checks

- Focused tests for every touched package/app module.
- `pnpm --filter @game/ui run typecheck` when UI contracts change.
- `pnpm --filter @game/web run typecheck` when web code changes.
- `pnpm --filter @game/web run test` when web tests exist.
- `pnpm --filter @game/web run build` when web code changes.
- `pnpm depcruise`
- `pnpm check`
- Playwright screenshot QA for desktop and narrow viewport.
- Manual keyboard-flow notes in the phase audit.
- `git diff --check`

## What NOT to implement in this phase

- No match-preparation editor.
- No lineup editor.
- No tactic editor.
- No match viewer.
- No real browser save persistence.
- No market UI.
- No contracts, wages, staff, stadium, ticket price, sponsorship, or economics
  UI.
- No youth academy decision UI.
- No full mail client.
- No automatic manager choices.
- No hidden squad-needs recommendations.
- No hardcoded visible labels.
- No CLI prose parsing.

## Definition of Done

- The project has a documented web shell direction:
  - top global navigation;
  - left Inbox/Posta rail;
  - central selected content area.
- WCAG 2.2 AA is documented as the web UI target.
- The web prototype renders the dashboard inside the new shell without losing
  the existing Continue/Inbox behavior.
- Keyboard navigation and focus behavior are inspected and documented.
- Desktop and narrow viewport screenshots show no blank pages, overlap, clipped
  labels, or broken navigation.
- The phase report recommends exactly one next phase.
- `docs/PROJECT_STATUS.md` records verification and next action.
