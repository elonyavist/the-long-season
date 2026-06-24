# Phase 54 - Tactics And Match Preparation Workspace Completion

## Goal

Turn the current match-preparation slice into a reusable football workspace for:

- formation selection;
- starting XI selection;
- substitute bench selection;
- tactic profile selection;
- explicit preparation save;
- future reuse by the full Tactics section.

This phase exists because Phase 53 proved that the current preparation screen
should not own the tactical pitch and squad table alone. The same interaction
model will be needed by the future Tactics section, so this phase must harden
the contracts and components before Inbox/Posta or other career sections depend
on them.

## Product Intent

The manager should feel they are preparing a real match, not filling a form.

The screen should behave like a Championship Manager / Scudetto-style tactical
workspace:

- a central vertical pitch/lavagna;
- a compact, sortable squad table;
- selectable formation;
- clear starting XI slots;
- clear substitute bench;
- player choice ordered by football suitability;
- tactical profile choice;
- no automatic best XI;
- no hidden recommendations;
- no market-needs advice.

The game may show factual compatibility and validation state, but the manager
must make the football decision.

## Scope

Allowed:

- extend the `@game/ui` match-preparation read model;
- add a formation catalog suitable for the current playable prototype;
- map formations to ordered pitch slots;
- let the user change formation manually;
- keep selected players only when they still fit valid slots;
- select exactly the required starting XI;
- select a substitute bench;
- prevent duplicate players across starters and bench;
- reuse `TacticalPitchLineup`, `SquadSelectionTable`, and `PlayerFactPanel`;
- add or refine reusable tactical workspace components only when they are used
  by the current screen;
- update web demo adapter/state;
- update labels in all supported languages when visible UI text changes;
- run Playwright desktop and narrow screenshot QA.

Not allowed:

- no automatic best XI;
- no automatic tactic recommendation;
- no drag-and-drop unless a step explicitly proves it is worth adding;
- no player-role training/adaptation;
- no substitutions during a match;
- no real matchday playback;
- no market/squad-needs hints;
- no economics/contracts/staff/youth changes;
- no browser save persistence unless explicitly scoped;
- no UI-only data that cannot later map to real career state;
- no hardcoded visible labels.

## Formation MVP

The first workspace should support a practical set of common formations:

- `4-4-2`;
- `4-3-3`;
- `4-2-3-1`;
- `4-3-1-2`;
- `3-5-2`;
- `3-4-3`;
- `5-3-2`;
- `4-1-4-1`.

The formation catalog can grow later, but this phase should not ship a fake
selector with only one useful option.

## Bench MVP

Use an 8-player bench for the current prototype unless the active step finds a
documented project rule that says otherwise.

Bench rules:

- substitutes are selected manually by the user;
- no player can appear in both XI and bench;
- no duplicate bench players;
- save is blocked until required XI, bench, and tactic are valid;
- reserve ordering is explicit and visible.

## Required Section Completion Review

Before closing the phase, document:

- dependency review;
- code quality review;
- architecture review;
- UI/UX review;
- accessibility review;
- football identity review;
- fun/agency review;
- improvement decision.

If the workspace still feels unstable, confusing, or too generic, improve it
inside this phase instead of moving on.

## Ordered Steps

1. `01-phase-53-output-and-workspace-scope.md`
2. `02-formation-catalog-and-preparation-contract.md`
3. `03-web-preparation-state-and-formation-switching.md`
4. `04-tactical-workspace-component-boundaries.md`
5. `05-starting-xi-and-bench-selection-flow.md`
6. `06-tactic-profile-and-save-readiness-integration.md`
7. `07-dashboard-inbox-and-continue-readiness.md`
8. `08-responsive-accessibility-and-visual-qa.md`
9. `09-section-quality-report-and-next-phase-decision.md`

## Phase-Level Checks

- Focused tests for every touched package/module.
- `pnpm --filter @game/ui run typecheck` when UI contracts change.
- Focused `@game/ui` tests for match-preparation contract changes.
- `pnpm --filter @game/web run typecheck` when web code changes.
- `pnpm --filter @game/web run test` when web tests exist.
- `pnpm --filter @game/web run build` when web code changes.
- `pnpm --filter @game/i18n run typecheck` if labels change.
- Focused i18n tests if labels change.
- `pnpm depcruise`
- `pnpm check`
- Playwright screenshot QA for desktop and narrow viewport.
- Keyboard/focus notes in the phase audit.
- `git diff --check`

## Definition Of Done

- The manager can choose a supported formation.
- The pitch updates to the selected formation.
- Player selects order natural fits before adapted/weak options.
- The squad table remains sortable, scrollable, and position-aware.
- The manager can select a full starting XI.
- The manager can select an 8-player substitute bench.
- Duplicate players across XI and bench are blocked.
- Save preparation requires valid formation, XI, bench, and tactic.
- Dashboard and Inbox/Posta can still open the workspace and reflect readiness.
- Continue remains blocked until preparation is saved.
- Desktop and narrow screenshots show no overflow, overlap, clipped controls, or
  buried blockers.
- Accessibility remains at the WCAG 2.2 AA working target for this slice.
- The final report recommends exactly one next phase.
