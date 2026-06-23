# 02 - App Entry And First Career Screen Product Scope

## Goal

Define the exact app entry screen and first career screen before creating
contracts.

This step turns the UI direction into a product slice: what the manager sees
when opening the app, what happens after creating or loading a save, which
decisions each screen supports, and which features remain outside the first UI
slice.

## Expected files

- `docs/audits/CAREER_FIRST_SCREEN_SCOPE.md`
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Create `docs/audits/CAREER_FIRST_SCREEN_SCOPE.md`.
- Define the real first app screen name and purpose. Required default:
  `Main Menu / App Entry`.
- Define the app entry screen's required sections:
  - new career;
  - continue career;
  - settings;
  - app version/build metadata if already available without new runtime work;
  - disabled/empty-save state for continue career.
- Define app settings scope:
  - language;
  - currency;
  - future-safe date/number formatting keys only if they can be represented
    without adding a full settings system.
- Define the first post-load career screen name and purpose. Recommended
  default: `Career Dashboard / Matchday Hub`.
- Define the career screen's required sections:
  - career context and selected club;
  - current date and season;
  - next selected-club fixture;
  - saved lineup and tactic readiness;
  - selected-club squad condition summary;
  - table position or compact table context;
  - last relevant match/result when available;
  - available manager actions;
  - blockers that prevent advancing cleanly.
- Define which facts are values, which facts are stable IDs, which facts are
  preference keys, and which facts are translation keys.
- Define the app-entry action list at product level only:
  - start new career;
  - continue career;
  - open settings;
  - change language;
  - change currency.
- Define the career-screen action list at product level only, for example:
  inspect squad, inspect lineup, inspect tactic, prepare match, advance next
  fixture, inspect table.
- Explicitly mark out of scope:
  - transfer screen;
  - youth academy screen;
  - full tactic board;
  - full squad table;
  - full fixture list;
  - match viewer;
  - news inbox;
  - finances/economics screen;
  - player contracts;
  - salaries/wage budgets;
  - stadium capacity and ticket prices;
  - club revenue/cost simulation;
  - scouting.
- Confirm the screen does not show hidden squad-need recommendations or exact
  hidden potential.
- Confirm economics is only a future-phase dependency note in this phase: the
  UI may reserve currency preferences, but must not implement financial
  simulation or salary/contract logic.
- Do not create source code in this step.

## What NOT to implement

- Do not add a UI package.
- Do not add React, HTML, CSS, or screenshots.
- Do not create CLI output.
- Do not add translations.
- Do not change saves or gameplay behavior.
- Do not expand the app entry or first career screen into the whole career UI.
- Do not implement economics, stadiums, ticket prices, salaries, player
  contracts, or wage budgets.

## Required checks

- `test -f docs/audits/CAREER_FIRST_SCREEN_SCOPE.md`
- `git diff --check`

## Definition of Done

- The app entry screen and first career screen have bounded product scopes.
- The document explains which manager decisions each screen supports.
- The document explains what is intentionally not shown yet.
- The document records economics as out of scope for Phase 48 except for
  currency preference readiness.
- `docs/PROJECT_STATUS.md` records Step 02 as complete or blocked.
