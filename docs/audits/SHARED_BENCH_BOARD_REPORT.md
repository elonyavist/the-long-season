# Shared Bench Board Report

Date: 2026-06-24
Phase: `59-shared-bench-board-and-substitute-selection`
Status: Complete

## Outcome

Phase 59 completes the substitute bench as a first-class part of match
preparation.

The panchina is no longer a weak secondary picker. The web match-preparation
workspace now uses the shared tactical-board component family for both the XI
and the eight substitutes, while keeping bench behavior intentionally simpler:
no drag/drop, no role changes, no hidden recommendations, and no automatic
selection except explicit manager-triggered helpers.

## Delivered Scope

- Fixed `S1`-`S8` reserve-slot contract.
- Shared compact green bench board.
- Empty reserve slots with `+`.
- Filled reserve slots with shirt number, surname, and role code.
- Contextual add menu for empty reserve slots.
- Contextual remove-only menu for filled reserve slots.
- Candidate filtering that excludes starting XI players and already-selected
  substitutes.
- Deterministic substitute candidate ordering by current ability, fitness,
  football position order, and stable identity.
- Save-readiness blocker for a full bench without a goalkeeper.
- Helper action behavior:
  - `Auto` fills the XI first, then the bench;
  - `Fill gaps` fills XI and bench gaps while preserving manager choices;
  - `Clear` clears XI and bench selections.
- Match-preparation screen replacement of the old bench picker.
- Dead-code cleanup for the obsolete native-select bench panel.
- Browser QA for desktop, narrow layout, keyboard, touch long-press, menu
  dismissal, candidate ordering, blockers, and helper actions.

## Main Files

- `packages/ui/src/career/career-match-preparation-view.ts`
  owns the language-agnostic missing-goalkeeper blocker.
- `apps/web/src/features/match-preparation/match-preparation-demo.ts`
  owns prototype helper behavior and deterministic bench candidate ordering.
- `apps/web/src/features/tactics-board/tactical-board-bench.ts`
  owns the fixed substitute slot contract.
- `apps/web/src/features/tactics-board/components/TacticalBenchBoard.tsx`
  owns the reusable bench board and contextual add/remove surface.
- `apps/web/src/features/match-preparation/CareerMatchPreparationScreen.tsx`
  adapts match-preparation read-model data into the shared bench board.
- `apps/web/src/visual-qa/shared-tactical-board.spec.ts`
  verifies the shared tactical board and bench board in the browser.

## Visual QA Evidence

Detailed evidence is in:

- `docs/audits/SHARED_BENCH_BOARD_VISUAL_QA.md`

Screenshots were generated under `/tmp/the-long-season-phase59`:

- `shared-bench-empty-desktop.png`
- `shared-bench-filled-desktop.png`
- `shared-bench-after-interactions-desktop.png`
- `shared-bench-narrow.png`
- `shared-bench-long-press-open.png`

## Dependency Review

The phase preserves the dependency direction:

- `@game/ui` remains framework-free and owns only read-model semantics.
- `apps/web` owns React, browser state, demo selection helpers, and visual
  interaction.
- `@game/i18n` owns visible labels and fallback behavior.
- No engine, storage, or content dependency was introduced into tactical React
  components.

Result: acceptable.

## Code Quality Review

The bench implementation is intentionally narrow:

- the fixed slot contract is separated from React rendering;
- `TacticalBenchBoard` is reusable and state-light;
- candidate sorting is centralized instead of duplicated inside the screen;
- old select-based bench code was removed;
- the match-preparation screen now adapts data instead of owning a second
  substitute UI model.

Residual code-quality risk: `CareerMatchPreparationScreen.tsx` remains a broad
composition component because it coordinates pitch, squad table, bench, tactic,
and save action. It is acceptable for the current slice but should not absorb
future Inbox/Posta or tactics-screen logic.

## Architecture Review

The chosen boundary is correct for the upcoming Tactics screen:

- XI board and bench board both live in `features/tactics-board`;
- match preparation owns persistence/draft wiring;
- the future Tactics screen can reuse both shared surfaces;
- no substitute-specific behavior is hidden in low-level pitch code.

Result: architecture is ready to resume Inbox/Posta routing into match
preparation.

## UI/UX Review

The bench now feels closer to a football manager workspace:

- the user sees eight explicit substitute decisions;
- the board is visual but not overbuilt;
- adding/removing substitutes uses the same interaction language as the XI;
- the goalkeeper requirement is surfaced as a blocker rather than silently
  correcting the user's choice;
- helper buttons remain explicit manager actions.

Residual UX risk: the bench candidate menu is overall/form driven because bench
slots are generic, not role-specific. This is correct for Phase 59, but future
screens may need tactical reserve planning such as "backup full back" or
"attacking substitute".

## Accessibility Review

The browser QA covers:

- keyboard reachability for formation, helper buttons, pitch slots, bench slots,
  tactic controls, save action, and bench menu actions;
- `Esc` dismissal;
- outside-click dismissal;
- native button semantics for all reserve slots;
- desktop and narrow overflow checks.

Result: acceptable for the current WCAG working target. Future mobile UX should
revisit whether the bench becomes a collapsible panel when the Tactics screen
grows.

## Fun Review

This phase improves fun by turning the bench into a meaningful decision surface.
The user now has to think about substitutions before advancing, especially the
reserve goalkeeper rule and the tradeoff between strongest overall players and
role coverage.

The implementation avoids "math-first" overfitting: it does not add hidden
recommendations, hidden auto-corrections, or tactical advice. The manager still
makes the decision.

## Improvement Decision

Phase 59 is complete. The section is now strong enough for Inbox/Posta to route
attention events into match preparation without exposing an unfinished bench.

Recommended next phase:

- `Phase 60 - Inbox/Posta Decision Center`

Do not start Phase 60 inside this phase.

