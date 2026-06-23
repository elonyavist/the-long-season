# Web Match Preparation Section Review

Date: 2026-06-23
Phase: `52-web-match-preparation-slice`
Step: `08-section-quality-fun-and-architecture-review`

## Summary

The Phase 52 match-preparation section is strong enough to support the next
phase.

It is no longer a thin dashboard placeholder: the manager can open preparation
from the dashboard or Inbox/Posta, select all lineup slots, choose a tactic,
save the preparation, clear dashboard blockers, and Continue to matchday-ready
behavior.

## Dependency Review

Result: PASS.

- `@game/ui` owns the framework-free match-preparation view contract and
  blocker derivation.
- `apps/web` owns browser rendering, demo adapter facts, and in-memory
  prototype state.
- React components do not import raw domain contracts.
- React components do not duplicate missing-slot, duplicate-player, or
  missing-tactic validation.
- `pnpm depcruise` reports no dependency violations.

## Code Quality Review

Result: PASS with non-blocking watch items.

Reviewed file sizes:

- `apps/web/src/App.tsx`: 131 lines.
- `apps/web/src/screens/CareerMatchPreparationScreen.tsx`: 239 lines.
- `apps/web/src/career/match-preparation-demo.ts`: 232 lines.
- `packages/ui/src/career/career-match-preparation-view.ts`: 396 lines.
- `apps/web/src/styles/components.css`: 546 lines.

No immediate split is required inside this phase:

- `CareerMatchPreparationScreen` is one cohesive section screen.
- `match-preparation-demo.ts` is a replaceable adapter, not a generic service.
- The `@game/ui` view file is larger because it contains the public contract,
  derived view, and helpers; splitting before a second consumer exists would
  add navigation cost without clear benefit.
- `components.css` is growing and should be watched in the next web phases,
  but splitting CSS now would be unrelated to the match-preparation slice.

Search review:

- No `TODO` or `FIXME` was added.
- No localStorage/sessionStorage was added.
- No CLI output parsing was added.
- No best-XI, recommendation, squad-need, or market-advice behavior was added.

## Architecture Review

Result: PASS.

The section is open to future real-save integration because the web adapter
already converts in-memory state into the same facts expected by dashboard and
Continue.

The current action flow is traceable:

1. `App.tsx` owns screen state and in-memory preparation state.
2. `match-preparation-demo.ts` maps prototype state into `@game/ui` inputs.
3. `buildCareerMatchPreparationView` derives blockers and action state.
4. `CareerMatchPreparationScreen` renders controls and emits structured
   callbacks.
5. Saving updates in-memory state.
6. Dashboard and Continue consume saved-preparation facts.

No broad abstraction was introduced for imaginary future sections.

## UI/UX Review

Result: PASS.

- Critical dashboard blockers are now visible near the top of the dashboard.
- Match-preparation blockers are visible before the lineup grid.
- The next fixture and selected club are visible in the first preparation
  viewport.
- The layout is dense and manager-game appropriate.
- The section avoids decorative cards that do not carry decisions.
- Native select/radio/button controls keep the first version keyboard-friendly.

The desktop screenshot showed the fixture context was initially too compressed;
that was fixed in this step by widening the center context column before the
audit was finalized.

## Accessibility Review

Result: PASS.

Evidence: `docs/audits/WEB_MATCH_PREPARATION_VISUAL_QA.md`.

- Native `select` controls have labels.
- Tactic radio controls are keyboard reachable.
- Save preparation is disabled until the view model allows it.
- Playwright confirms the keyboard focus path reaches the first lineup select.
- Playwright confirms desktop and narrow views do not horizontally overflow.

## Fun And Agency Review

Result: PASS for this phase scope.

The manager makes real choices:

- which players occupy the 11 slots;
- which tactic profile is used;
- when to save the preparation;
- whether to return to dashboard or continue.

The section creates useful tension before matchday because Continue remains
blocked until the manager has made the required choices. It does not remove the
manager role through automatic lineups, best-tactic buttons, or hidden
recommendations.

## Non-Blocking Future Improvements

- Player suitability and natural/adapted role fit should be integrated when the
  squad/tactics sections are expanded, not forced into this blocker-resolution
  slice.
- A full tactical editor belongs to a later tactics phase.
- Durable save persistence belongs to a future real career-save web adapter.
- CSS organization should be revisited after the next one or two web sections,
  when there is enough duplication to justify extraction.

## Decision

Phase 52 can proceed to the final report step.

No in-scope cleanup is being deferred silently; known improvements are future
scope because they require broader squad, tactics, or persistence systems.
