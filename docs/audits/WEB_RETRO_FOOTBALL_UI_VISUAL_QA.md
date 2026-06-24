# Web Retro Football UI Visual QA

Date: 2026-06-23
Phase: `53-retro-football-ui-identity-rework`
Step: `07-responsive-accessibility-and-visual-qa`

## Scope

This audit verifies the Phase 53 retro-football UI identity in a real browser.
It covers:

- main menu entry;
- career shell/top navigation;
- left Inbox/Posta rail;
- dashboard control room;
- match preparation opened from dashboard;
- match preparation opened from Inbox/Posta;
- tactical pitch layout;
- compact squad list;
- tactic selection;
- save preparation;
- return to dashboard with blockers cleared;
- Continue reaching matchday-ready behavior;
- desktop and narrow viewports;
- keyboard focus path.

## Commands Run

```sh
source ~/.nvm/nvm.sh && nvm use 24 >/dev/null && pnpm --filter @game/web run typecheck
source ~/.nvm/nvm.sh && nvm use 24 >/dev/null && pnpm --filter @game/web run test
source ~/.nvm/nvm.sh && nvm use 24 >/dev/null && node --experimental-strip-types apps/web/src/visual-qa/retro-football-identity.spec.ts
```

## Screenshot Output

Screenshots were written outside the repository:

- `/tmp/the-long-season-phase53/main-menu-desktop.png`
- `/tmp/the-long-season-phase53/dashboard-control-room-desktop.png`
- `/tmp/the-long-season-phase53/match-preparation-pitch-desktop.png`
- `/tmp/the-long-season-phase53/match-preparation-saved-desktop.png`
- `/tmp/the-long-season-phase53/dashboard-matchday-desktop.png`
- `/tmp/the-long-season-phase53/inbox-attention-narrow.png`
- `/tmp/the-long-season-phase53/match-preparation-pitch-narrow.png`
- `/tmp/the-long-season-phase53/dashboard-cleared-narrow.png`

## Desktop Findings

- The shell now reads as a football-management operations area rather than a
  generic SaaS dashboard.
- The club crest placeholder, selected club, context facts, top navigation, and
  Continue action are visible in the first viewport.
- The left Inbox/Posta rail remains left of the central content and retains its
  own decision surface.
- The dashboard exposes blockers, next fixture, preparation readiness, and
  available actions in the first useful viewport.
- Match preparation uses a vertical tactical pitch with explicit native selects
  for every slot. The pitch is useful, not decorative, because the user can
  choose the lineup directly inside the football layout.
- The squad table shows name, role, age, fitness, foot, and status on desktop.
- The player detail panel gives the selected player facts without opening a
  full squad section.
- Tactic profiles remain visible and factual below the lineup board.

## Narrow Findings

- The shell stacks correctly without horizontal page overflow.
- The Inbox/Posta rail appears before the central content and still exposes the
  action-required message and Prepare match action.
- The match-preparation page stacks the tactical slots first, then the squad
  list, player detail, tactic controls, and save action.
- The compact squad table remains usable on narrow viewport, but some column
  headers and long status values are naturally abbreviated by the constrained
  width. This is acceptable for Phase 53 because the player detail panel still
  exposes the full selected-player facts. A future full Squad section should use
  a richer responsive table pattern.

## Keyboard And Focus Findings

- The main menu New career action is reachable and starts the demo career.
- Dashboard Prepare match opens match preparation.
- The focus path from the match-preparation Dashboard button reaches the first
  native player select.
- Native selects and radio buttons preserve keyboard accessibility for lineup
  and tactic choices.
- Save preparation is blocked until lineup and tactic are valid, then becomes
  usable and clears the dashboard blockers.

## Accessibility Notes

- Landmarks are present for banner, navigation, Inbox/Posta complementary rail,
  and central main outlet.
- Navigation still exposes the current Dashboard section with `aria-current`.
- The Inbox/Posta rail has visible action-required state and buttons keep
  accessible names.
- Focus rings remain visible against the retro dark palette.
- No production accessibility dependency was added in this step.

## Football Identity Notes

- The screen now feels closer to a Championship Manager / Scudetto control
  room: denser, darker, more operational, and centered on football decisions.
- The match-preparation pitch changes the section from form filling into a
  football-first tactical board.
- The dashboard now foregrounds the manager's next meaningful action instead of
  burying blockers at the bottom.

## Fixes Made During QA

- Added screen-change scroll reset in the web app so moving between dashboard
  and match preparation starts from the top of the selected section.
- Tightened tactical-pitch grid alignment so the pitch starts immediately below
  its title instead of leaving excessive empty vertical space.
- Tightened squad-table sizing so all six columns are visible on desktop.
- After manual screenshot review, removed noisy valid/missing words from pitch
  slots, kept only compact alert markers for unresolved slots, reduced visible
  slot facts, and made the squad table fixed-height, scrollable, and sortable.

## Remaining Non-Blocking Issues

- Narrow squad-list columns are intentionally dense. This is acceptable for the
  match-preparation slice, but the future full Squad section should provide a
  richer mobile-specific table/list view.
- The crest remains a placeholder derived from the selected club name. Real club
  crests are future scope and should not be faked in this phase.
- Formation switching and reserve-bench selection remain future functional
  scope. They should be backed by explicit read models and preparation state,
  not added as decorative controls.

## Result

PASS.

The redesigned retro-football UI identity works in desktop and narrow browser
viewports, preserves the Phase 52 match-preparation journey, and leaves no
blocking visual or accessibility issue hidden.
