# Phase 59 - Shared Bench Board And Substitute Selection

## Goal

Turn the 8-player bench into a proper football-management selection surface
that belongs to the same tactical workspace as the starting XI.

The current bench works functionally, but it still feels like a secondary
picker. The user decision is clear: substitutes should be selected with the
same interaction language as the tactical board:

- fixed reserve slots `S1` to `S8`;
- empty slot shows a `+`;
- clicking an empty slot opens an add menu;
- filled slot has a context menu with remove;
- candidates are ordered by usefulness, using overall/current ability and form;
- no drag/drop on the bench;
- no duplicate player between XI and bench;
- at least one goalkeeper must be selected;
- `Auto` fills the XI first, then the bench;
- `Riempi` fills gaps in both XI and bench;
- the bench uses a compact green mini-board visual instead of a loose card grid.

This phase intentionally improves the match-preparation section before moving
to Inbox/Posta. A better Inbox can route the user to a stronger preparation
screen later.

## Product Decisions

- Bench shape: exactly 8 fixed slots, labelled `S1` to `S8`.
- Validation:
  - maximum 8 substitutes;
  - all 8 slots required before save;
  - no duplicate between XI and bench;
  - no duplicate inside the bench;
  - at least one goalkeeper on the bench.
- Slot menu:
  - empty slot action: add a player;
  - filled slot action: remove from bench;
  - no role change, no drag, no promotion-to-XI action in this phase.
- Candidate ordering:
  1. higher overall/current ability;
  2. higher fitness/form;
  3. position order;
  4. stable surname/name/id tie-breaker.
- Bench token content: shirt number, surname, and natural/current role only.
- Bench visual: compact SVG-like green mini-board without pitch stripes, using
  the same token states, focus states, and context-menu language as the XI
  tactical board where practical.
- Helper actions:
  - `Auto` fills the starting XI first, then the bench;
  - `Riempi` fills empty XI and bench slots without aggressive hidden reshuffle;
  - `Svuota` clears both XI and bench, preserving formation and tactic.

## Ordered Steps

1. `01-current-bench-flow-audit-and-target-contract.md`
2. `02-bench-read-model-validation-and-ordering.md`
3. `03-shared-bench-board-component-foundation.md`
4. `04-bench-context-menu-and-candidate-picker.md`
5. `05-helper-actions-and-save-readiness-integration.md`
6. `06-match-preparation-replacement-and-dead-code-cleanup.md`
7. `07-responsive-accessibility-and-visual-qa.md`
8. `08-phase-report-and-next-phase-decision.md`

## Phase-Level Checks

Run after the final step:

```sh
nvm use 24
pnpm --filter @game/ui run typecheck
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run test
pnpm --filter @game/web run build
node --experimental-strip-types apps/web/src/visual-qa/shared-tactical-board.spec.ts
pnpm check
git diff --check
graphify update .
```

## What NOT To Implement In This Phase

- Do not implement Inbox/Posta Decision Center.
- Do not implement substitutions during live matchday.
- Do not implement drag/drop on bench slots.
- Do not implement bench role changes.
- Do not implement a promotion-to-XI shortcut from the bench menu.
- Do not implement opponent bench or mirrored opponent board.
- Do not add market, finances, squad, youth, staff, archive, or calendar
  features.
- Do not store bench suitability as mutable state.
- Do not duplicate the tactical-board candidate ordering logic if it can be
  shared cleanly.
- Do not keep obsolete bench picker components after replacing them.

## Definition Of Done

- The bench uses exactly 8 fixed reserve slots and looks like part of the
  tactical workspace.
- Empty reserve slots expose a `+` add affordance.
- Filled reserve slots expose a remove action through the same contextual
  interaction language as the XI board.
- Candidate ordering is deterministic and useful for the manager.
- Save readiness blocks missing bench slots, duplicate bench players, XI/bench
  overlap, and missing bench goalkeeper.
- `Auto`, `Riempi`, and `Svuota` affect XI and bench according to the product
  decisions above.
- Old bench UI paths are removed or made active callers of the new component.
- Desktop and narrow Playwright screenshots prove the bench does not overlap,
  overflow, or become unreachable.
- Keyboard and screen-reader behavior remains acceptable for WCAG-oriented
  development.
- The final report recommends exactly one next phase.
