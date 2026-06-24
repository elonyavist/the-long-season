# Match Preparation Tactical Workspace Visual QA

Date: 2026-06-24
Phase: `58-match-preparation-tactical-workspace-ux-rework`
Step: `07-responsive-accessibility-and-visual-qa`

## Scope

This QA pass verifies the match-preparation tactical workspace after the Phase 58
UX rework. The goal is not decorative screenshot coverage. The checks target the
reported usability problems: too much empty space, a sticky tactical context
menu, inconsistent XI and bench candidate pickers, unclear candidate ordering,
and cramped three-player central lines.

## Browser Coverage

The Playwright script is:

```sh
node --experimental-strip-types apps/web/src/visual-qa/shared-tactical-board.spec.ts
```

It writes screenshots to:

```text
/tmp/the-long-season-phase58
```

Expected screenshots:

- `/tmp/the-long-season-phase58/tactical-workspace-empty-desktop.png`
- `/tmp/the-long-season-phase58/tactical-workspace-filled-desktop.png`
- `/tmp/the-long-season-phase58/tactical-workspace-after-interactions-desktop.png`
- `/tmp/the-long-season-phase58/tactical-workspace-narrow.png`
- `/tmp/the-long-season-phase58/tactical-workspace-long-press-open.png`

## Interaction Checks

The script verifies:

- compact match strip, compact alert strip, and board toolbar are visible in the
  first useful desktop viewport;
- the old large blocker-card class is no longer rendered in this screen;
- desktop and narrow layouts do not create horizontal overflow;
- the vertical pitch remains visible and usable on desktop;
- bench pickers render the shared dense player-candidate row language, including
  suitability tone and compact fitness percentage;
- the tactical context menu closes on outside click, pitch-background click,
  `Esc`, and completed remove action;
- assignment candidates are ordered by suitability before lower-priority facts;
- goalkeeper drag remains locked while goalkeeper replacement remains available;
- a central midfielder is clamped outside the attacking third;
- ED moved forward can become AD and updates the derived shape to `4-3-3`;
- removing a player keeps the slot and role while making the removed player
  available again;
- three `CC` and three `DC` lines keep enough horizontal spacing;
- keyboard traversal reaches formation, helper action, board slot, bench picker,
  tactic, and save controls;
- touch long press opens the menu, while moved long press cancels it.

## Accessibility Notes

- The main controls remain native buttons, radios, `select`, and `details`
  summaries, which keeps keyboard support predictable.
- The bench picker now uses `summary`, so keyboard QA checks focus on the
  summary instead of the old select control.
- The context menu is pointer and keyboard dismissible. `Esc` is covered because
  it is the expected accessible escape path.
- The board itself is still an SVG interaction surface. It has keyboard open
  support on slots, but future phases should keep checking screen-reader wording
  once the full Tactics page and matchday reuse exist.

## Residual Risks

- This is still a browser QA smoke, not exhaustive WCAG certification.
- Candidate ordering checks suitability order directly; it does not prove every
  secondary tie-breaker because the demo squad may not expose all tie cases.
- Mobile QA covers narrow overflow and touch long-press behavior, but not a full
  mobile tactical-selection journey.
- The bench picker uses parity with the XI candidate row, but bench assignment is
  still click-based rather than drag/drop by design.

## Conclusion

The Phase 58 workspace is ready for the final phase report if the required
checks pass. Inbox/Posta can resume after this phase because the destination
match-preparation screen now has denser context, stronger controls, and browser
coverage for the interaction problems reported during review.
