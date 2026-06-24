# Web Tactics Workspace Visual QA

Date: 2026-06-23
Phase: `54-tactics-and-match-preparation-workspace-completion`
Step: `08-responsive-accessibility-and-visual-qa`

## Scope

This audit verifies the completed match-preparation workspace in the browser
before closing Phase 54. The check covers the dashboard route, Inbox/Posta
route, formation switching, manual XI selection, manual substitutes selection,
tactic selection, save readiness, dashboard blocker clearance, Continue
readiness, desktop layout, narrow layout, keyboard reachability, and visible
accessibility behavior.

## Command

```sh
node --experimental-strip-types apps/web/src/visual-qa/tactics-workspace.spec.ts
```

The script starts the web app on `127.0.0.1:5178` and writes screenshots to
`/tmp/the-long-season-phase54`.

## Screenshots

- `/tmp/the-long-season-phase54/dashboard-before-preparation-desktop.png`
- `/tmp/the-long-season-phase54/workspace-formation-desktop.png`
- `/tmp/the-long-season-phase54/workspace-ready-desktop.png`
- `/tmp/the-long-season-phase54/dashboard-matchday-desktop.png`
- `/tmp/the-long-season-phase54/workspace-narrow.png`

## Findings

- Desktop dashboard-to-preparation flow works.
- Inbox/Posta action opens match preparation on a narrow viewport.
- Formation switching updates the tactical pitch without overlapping slots.
- The pitch shows only compact slot facts and an alert icon for empty slots.
- The manager must manually fill the starting XI and all 8 substitutes.
- Duplicate validation remains in the read model and blocks save readiness.
- The squad list keeps a fixed-height scroll area.
- No horizontal page overflow was detected on desktop or narrow viewport.
- Keyboard tab order reaches formation, XI, bench, tactic, and save controls.
- Save readiness clears dashboard blockers and allows Continue to reach
  matchday.

## Accessibility Notes

- Controls use native buttons, radios, and selects, so keyboard behavior remains
  predictable.
- Focus rings remain visible against the dark retro-football theme.
- Empty slots are not communicated by color alone: each empty slot has a compact
  alert marker plus accessible status text.
- Landmarks remain stable: top shell, left Inbox/Posta rail, and central content
  outlet.
- The narrow layout is dense but does not break the viewport; future UI polish
  should keep the same information hierarchy while improving compact table
  readability.

## Blockers

None.

## Manual Review Recommendation

Open these screenshots first:

1. `/tmp/the-long-season-phase54/workspace-formation-desktop.png`
2. `/tmp/the-long-season-phase54/workspace-ready-desktop.png`
3. `/tmp/the-long-season-phase54/workspace-narrow.png`

Check whether the tactical workspace feels like a serious football-management
decision screen and whether the narrow table density is acceptable before the
project moves deeper into Inbox/Posta.
