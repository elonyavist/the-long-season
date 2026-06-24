# Canonical Formation Role Visual QA

Date: 2026-06-24
Phase: `56-canonical-formation-and-role-catalog`
Step: `07-regression-visual-qa-and-accessibility`

## Scope

This audit verifies the browser-facing result of the canonical formation and
role catalog rework. The check focuses on the tactical match-preparation
workspace because it is the first consumer of the canonical formation grammar.

## Browser QA Coverage

Command:

```sh
node --experimental-strip-types apps/web/src/visual-qa/tactics-workspace.spec.ts
```

Covered viewports:

- Desktop: `1440x960`
- Narrow: `390x844`

Covered formations:

- `4-4-2`
- `4-3-3`
- `4-2-3-1`
- `3-5-2`
- `3-6-1`
- `5-3-2`

Screenshot directory:

```text
/tmp/the-long-season-phase54
```

Screenshots produced:

- `/tmp/the-long-season-phase54/dashboard-before-preparation-desktop.png`
- `/tmp/the-long-season-phase54/dashboard-matchday-desktop.png`
- `/tmp/the-long-season-phase54/workspace-formation-3-5-2.png`
- `/tmp/the-long-season-phase54/workspace-formation-3-6-1.png`
- `/tmp/the-long-season-phase54/workspace-formation-4-2-3-1.png`
- `/tmp/the-long-season-phase54/workspace-formation-4-3-3.png`
- `/tmp/the-long-season-phase54/workspace-formation-4-4-2.png`
- `/tmp/the-long-season-phase54/workspace-formation-5-3-2.png`
- `/tmp/the-long-season-phase54/workspace-formation-desktop.png`
- `/tmp/the-long-season-phase54/workspace-narrow.png`
- `/tmp/the-long-season-phase54/workspace-ready-desktop.png`

## Findings

- The tactical pitch renders the supplied `campo-calcio.svg` asset through the
  reusable `TacticalPitchLineup` component.
- The previous CSS-only pitch markings are no longer present in markup.
- Desktop screenshots show the full vertical pitch, including both penalty
  areas and touchlines.
- Critical formation slots stay inside the pitch board and do not overlap.
- The compact helper controls `Auto`, `Fill gaps`, and `Clear` are visible and
  keyboard reachable.
- The lineup selects, bench selects, tactic radios, formation select, and save
  button remain keyboard reachable.
- The fixed-height squad table remains scrollable.
- Desktop and narrow viewports have no horizontal overflow.

## Accessibility Notes

- The SVG field is decorative: accessible names come from the pitch heading,
  list/listitem semantics, slot labels, selects, and unresolved-slot alert icon.
- Missing slots use a compact alert icon with accessible text instead of visible
  `missing`/`valid` labels.
- Manager helper actions are real buttons, not passive decoration.
- Narrow layout preserves form controls and avoids horizontal scrolling.

## Residual Risk

- The narrow viewport intentionally stacks pitch slots for readability. This is
  acceptable for the current non-drag-and-drop MVP, but a future mobile tactics
  phase may choose a dedicated compact pitch editor if touch interactions become
  central.
- Screenshot directory naming still says `phase54` because the browser QA
  script predates Phase 56. This is non-blocking and avoids churn in existing
  visual tooling.

## Decision

No blocking visual or accessibility issue remains for Phase 56.

The canonical formation grammar, SVG pitch background, helper actions, and
critical pitch mappings are strong enough for the next planned section to build
on them.
