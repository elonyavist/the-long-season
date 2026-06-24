# Web Architecture Rework Visual QA

Date: 2026-06-24
Phase: `55-web-architecture-state-and-styling-foundation`
Step: `07-regression-visual-qa-and-accessibility`

## Command

```bash
source ~/.nvm/nvm.sh && nvm use 24 >/dev/null && node --experimental-strip-types apps/web/src/visual-qa/architecture-rework.spec.ts
```

## Screenshots

Screenshots were written outside the repository:

- `/tmp/the-long-season-phase55/main-menu-desktop.png`
- `/tmp/the-long-season-phase55/dashboard-desktop.png`
- `/tmp/the-long-season-phase55/preparation-ready-desktop.png`
- `/tmp/the-long-season-phase55/dashboard-matchday-desktop.png`
- `/tmp/the-long-season-phase55/preparation-narrow.png`

## Verified Flow

- Main menu renders and keyboard focus reaches `New career`.
- New career opens the dashboard.
- Dashboard shows the missing lineup/tactic blockers before preparation.
- Left Inbox/Posta rail remains present and actionable.
- Prepare match opens the tactical workspace.
- Formation switching still works.
- Manual XI selection still exposes 11 lineup slots.
- Manual substitute selection still exposes 8 bench slots.
- Tactic selection still works.
- Save preparation clears dashboard blockers.
- Continue reaches the matchday stop after saved preparation.
- Desktop and narrow viewports have no detected horizontal overflow.
- Keyboard tab order reaches formation, lineup, bench, tactic, and save controls.

## Accessibility Findings

- Primary controls remain native buttons, native selects, and native radio
  inputs.
- Shell landmarks remain available: banner, career navigation, Inbox/Posta
  complementary region, and selected screen main region.
- The narrow layout keeps Inbox/Posta before the central selected screen, which
  preserves the current Football Manager-like attention flow.
- No new WCAG blocker was found in this step.

## Visual Findings

- The architecture and styling rework did not create visible layout breakage in
  the checked desktop or narrow flows.
- The retro-football identity was preserved.
- The tactical workspace remains dense. This is an existing product/design area
  for future tactics polish, not a regression from the folder/state/Tailwind
  rework.
