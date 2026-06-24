# Shared Bench Board UX Audit

Date: 2026-06-24
Phase: `59-shared-bench-board-and-substitute-selection`
Step: `01-current-bench-flow-audit-and-target-contract`

## Verdict

The current bench flow is functional but still not a first-class football
selection surface. It lets the manager pick 8 substitutes, but it feels separate
from the tactical board. The bench should become a compact mini-board using the
same contextual selection language as the starting XI.

This matters for fun because substitutes are part of match preparation: the
manager should feel they are completing a squad sheet, not filling a secondary
form.

## Current Implementation

### Active Screen Path

`CareerMatchPreparationScreen.tsx` currently renders an inline
`BenchSelectionGrid` below the tactical board.

Characteristics:

- 8 explicit bench slots are already present.
- Each slot is rendered as a `details` picker.
- Selected candidates use `PlayerCandidateRow`, so Phase 58 already improved
  visual parity.
- Empty slots still read like a form row, not a board slot.
- Filled slots do not use the same token language as the XI pitch.
- The add/remove interaction is tied to `details` markup, not to the tactical
  board context-menu pattern.

### Older Component Path

`BenchSelectionPanel.tsx` still exists with a native `<select>` based UI and a
test.

Current role:

- It is not the active bench implementation in `CareerMatchPreparationScreen`.
- It overlaps conceptually with the inline bench grid.
- It should not survive as an unrelated alternate bench picker.

Phase 59 should either remove it or convert it into an active thin wrapper
around the new shared bench board. Keeping both would make the code harder for a
junior developer to follow.

## Current Validation

The `@game/ui` match-preparation read model already validates:

- missing bench slots;
- duplicate bench players;
- bench players already selected in the starting XI.

Missing rule:

- no explicit blocker requires at least one goalkeeper on the bench.

The goalkeeper rule belongs in `@game/ui` because it is a language-agnostic
preparation readiness rule, not a React rendering concern.

## Current Helper Actions

The demo helper flow already treats bench and XI together:

- `Svuota` clears both XI and bench while preserving formation and tactic.
- `Auto` starts from a cleared selection and fills XI, then bench.
- `Riempi` preserves current selections and fills missing XI and bench slots.

Current issue:

- Bench candidate ordering is ability-first but does not yet use fitness/form
  as the second signal.
- Bench filling tries to ensure broad role coverage but does not explicitly
  guarantee a goalkeeper in the read-model rule.

The phase should keep helper actions manager-triggered. There must be no hidden
background auto-selection.

## Target Contract

Bench slots:

- exactly 8 fixed slots;
- labels `S1` to `S8`;
- all 8 are required before save;
- no player can occupy two bench slots;
- no player can be in both XI and bench;
- at least one selected substitute must be a goalkeeper.

Visual model:

- mini green board, compact and without pitch stripes;
- empty slot shows a `+`;
- filled slot shows shirt number, surname, and natural/current role;
- slot states must remain readable without relying only on color.

Interaction model:

- no bench drag/drop;
- no bench role changes;
- no promote-to-XI shortcut;
- empty slot opens an add menu;
- filled slot opens a remove action;
- menus close on outside click, board background click, `Esc`, and completed
  action;
- keyboard users can reach every slot and menu action.

Candidate ordering:

1. higher overall/current ability;
2. higher fitness/form;
3. position order;
4. stable surname/name/id tie-breaker.

Helper actions:

- `Auto` fills XI first, then bench.
- `Riempi` fills empty XI and bench slots without replacing valid manual
  choices.
- `Svuota` clears XI and bench, preserving formation and tactic.

## Ownership

`@game/ui`:

- readiness blockers;
- bench slot status;
- missing goalkeeper rule;
- language-agnostic slot facts.

`apps/web/src/features/match-preparation`:

- demo adapter state;
- explicit manager helper actions;
- wiring between view model, board state, and save callbacks.

`apps/web/src/features/tactics-board`:

- reusable bench board visual component;
- slot token component;
- bench candidate ordering helpers if they are web/tactical-board specific;
- contextual menu behavior that can share tactical-board menu primitives.

`apps/web/src/shared/ui`:

- generic player candidate row only when it remains free of tactical-board store
  and engine dependencies.

## Risks To Avoid

- Leaving `BenchSelectionPanel` as dead or competing UI.
- Moving readiness rules into React.
- Making the bench board a decorative SVG with no real keyboard/menu behavior.
- Over-generalizing the board before a second real screen needs it.
- Creating hidden auto-pick behavior outside explicit `Auto`/`Riempi` actions.

## Decision

Proceed with Phase 59 as documented. The bench must become a compact shared
mini-board before Inbox/Posta work resumes.
