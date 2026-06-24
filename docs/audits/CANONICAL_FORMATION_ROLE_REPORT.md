# Canonical Formation Role Report

Date: 2026-06-24
Phase: `56-canonical-formation-and-role-catalog`
Status: Complete

## Summary

Phase 56 created one stable football grammar for formations, player roles,
slot placement, match-preparation helper actions, and the tactical pitch UI.

The phase was inserted before the Inbox/Posta Decision Center because future
attention messages should route into a tactical screen that already has
coherent roles, formations, slot ordering, bench handling, and browser QA.

## Canonical Player Roles

The domain now owns 12 canonical player roles:

- `goalkeeper`
- `right_full_back`
- `center_back`
- `left_full_back`
- `defensive_midfielder`
- `central_midfielder`
- `right_midfielder`
- `left_midfielder`
- `attacking_midfielder`
- `right_winger`
- `left_winger`
- `striker`

These are player roles, not pitch slots. Variants such as `cb-right`, `cm-left`,
`second_striker`, or `right_wing_back` are not canonical player roles.

## Role Vs Slot Distinction

The adopted model is:

- player role: what a player naturally or adaptively does;
- formation slot: where the manager places that role in a shape;
- side/channel: metadata on the slot, not a new player role.

This prevents the UI, engine, and future tactics screen from creating slightly
different meanings for the same football concept.

## Domain Catalog Ownership

`packages/domain/src/tactics/formations.ts` is now the source of truth for
formation slots.

`FormationSlot` exposes:

- stable slot key;
- canonical `playerRole`;
- department;
- side/channel metadata;
- compatibility `positionFamily` alias for current callers.

The web app no longer owns an independent formation slot catalog.

## UI Read-Model Dependency Decision

`@game/ui` may import `@game/domain` for shared football grammar. This is an
intentional inner dependency and is documented in architecture and Dependency
Cruiser rules.

`@game/ui` still must not import React, browser APIs, storage, engine, content,
CLI, or i18n.

The match-preparation read model adapts domain formation facts into
language-agnostic UI facts so CLI smoke output and future web screens can share
the same structure without parsing prose.

## Manager-Triggered Helper Actions

The UI now supports three explicit actions:

- `Auto`
- `Fill gaps`
- `Clear`

These actions are reliable enough for the future Tactics screen because:

- they run only after a manager click;
- `Auto` fills XI and bench from scratch;
- `Fill gaps` preserves existing manager choices;
- `Clear` clears only XI and bench selections;
- option ranking uses slot suitability plus current ability;
- bench fill preserves practical coverage before strongest extras;
- save readiness still validates missing slots, duplicates, bench overlap, and
  tactic selection.

This remains manager agency, not hidden automation.

## SVG Pitch Integration

The supplied pitch asset now lives at:

```text
apps/web/src/assets/campo-calcio.svg
```

`TacticalPitchLineup` imports the asset and applies it as a contained decorative
background. The previous CSS-only pitch markings were removed so there are no
duplicate field lines.

The SVG is decorative for assistive technologies. Accessible names come from
the pitch heading, slot labels, native selects, and alert icons.

## Pitch QA Results

Browser QA verifies:

- desktop and narrow viewports;
- `4-4-2`;
- `4-3-3`;
- `4-2-3-1`;
- `3-5-2`;
- `3-6-1`;
- `5-3-2`;
- no pitch-slot overlap;
- all pitch slots inside the pitch board;
- SVG pitch background usage;
- no legacy pitch-marking markup;
- fixed-height scrollable squad table;
- 11 lineup selects and 8 bench selects;
- helper buttons keyboard reachable;
- lineup, bench, tactic, formation, and save controls keyboard reachable;
- no horizontal overflow.

Screenshot evidence is recorded in
`docs/audits/CANONICAL_FORMATION_ROLE_VISUAL_QA.md`.

## Remaining Non-Blocking Risks

- Narrow viewport currently stacks tactical slots for readability. This is
  acceptable for the current non-drag-and-drop MVP. A later mobile tactics
  phase can design a dedicated touch-first editor if needed.
- The screenshot output directory is still named
  `/tmp/the-long-season-phase54` because the visual QA script predates this
  phase. This is tooling naming only and does not affect the app.
- Future real-save match preparation must replace demo state in
  `apps/web/src/features/match-preparation/match-preparation-demo.ts` without
  changing the domain/UI formation grammar.

## Decision

Phase 56 is complete.

The canonical role model is strong enough for Inbox/Posta to resume as the next
section, because attention messages can now route into a coherent tactical
workspace.

## Recommended Next Phase

Exactly one next phase is recommended:

`Phase 57 - Inbox/Posta Decision Center`

Reason: the career shell already has a left Inbox/Posta rail and structured
attention events. The next useful manager-facing improvement is to turn
Inbox/Posta from a compact rail into the decision center that explains why
Continue stopped and routes the manager to the correct section.
