# Career UI Slice Readiness Review

Date: 2026-06-23
Phase: `48-career-ui-slice-readiness-and-first-screen-scope`
Step: `01-phase-47-output-review`
Status: Complete

## Purpose

Review whether the current architecture, presentation boundaries, and pre-UI
engine confidence gate are ready for a small UI-facing read-model phase.

This is not a web implementation step. It decides the smallest useful contracts
to define before a future web shell exists.

## Inputs Reviewed

- `docs/ARCHITECTURE.md`
- `docs/audits/ARCHITECTURE_PUBLIC_INTERFACE_REVIEW.md`
- `docs/audits/ARCHITECTURE_HARDENING_FINAL_REPORT.md`
- `docs/audits/CAREER_PRESENTATION_BOUNDARY_REVIEW.md`
- `docs/audits/CAREER_PRESENTATION_DECOMPOSITION_REPORT.md`
- `docs/audits/TEN_SEASON_REPORT_BOUNDARY_REVIEW.md`
- `docs/audits/TEN_SEASON_REPORT_DECOMPOSITION_REPORT.md`
- `docs/audits/PRE_UI_ENGINE_CONFIDENCE_REPORT.md`
- `apps/cli/src/commands/career.ts`
- `apps/cli/src/commands/career/overview-output.ts`
- `apps/cli/src/commands/career/preparation-output.ts`
- `apps/cli/src/commands/career/matchday-output.ts`
- `apps/cli/src/commands/career/roster-output.ts`

## Readiness Decision

Phase 48 may proceed.

The project is ready to define UI-facing contracts for:

- the real app entry screen;
- the first post-load career dashboard screen;
- their action availability/result shapes.

The project is not yet ready to build the web app. The correct next work is a
thin read-model package and a CLI smoke surface that proves the future UI will
consume structured data, not CLI prose.

## Screen Naming Decision

The real first app screen is:

`Main Menu / App Entry`

It exists before a career save is loaded and should expose:

- new career;
- continue career;
- settings;
- language preference;
- currency preference.

The first career screen after creating or loading a save is:

`Career Dashboard / Matchday Hub`

It should expose:

- career and world context;
- selected club;
- current date and season;
- next selected-club fixture;
- saved lineup/tactic readiness;
- compact squad condition;
- compact table context;
- recent match context when available;
- available manager actions and blockers.

## Reusable Career State/Data Facts

These facts already exist as structured state or deterministic pure outputs:

- `CareerState.saveId`
- `CareerState.worldMetadata`
- `CareerState.selectedClubId`
- `GameState.calendar.currentDate`
- `GameState.calendar.currentSeasonId`
- `GameState.clubs`
- `GameState.players`
- `GameState.playerStates`
- persisted fixtures and fixture results
- persisted selected match preparation
- `MarketState` transfer budgets
- next selected-club fixture derivation through current helper paths
- selected-club roster and player condition facts

These can feed a UI contract without parsing CLI strings.

## CLI-Only Rendering

The following modules should remain CLI renderers:

- `career/overview-output.ts`
- `career/preparation-output.ts`
- `career/matchday-output.ts`
- `career/roster-output.ts`
- `career/development-output.ts`
- `career/market-output.ts`
- `career/season-rollover-output.ts`

They render localized lines. Future UI code must not consume their text output.

## Future UI-Facing View Candidates

The narrow useful candidates are:

1. `AppEntryView`
   - pre-save app shell state;
   - available entry actions;
   - selected language and currency;
   - supported language and currency keys.

2. `CareerDashboardView`
   - loaded-save career context;
   - next-match readiness;
   - compact selected-club status;
   - compact table/fixture context;
   - action availability.

3. Action contracts
   - stable action IDs;
   - availability status;
   - blocker/status keys;
   - result shape usable by CLI smoke output and future UI.

These contracts pass the deletion test: if removed later, the future web app and
CLI smoke output would have to duplicate career dashboard mapping and action
status rules.

## App-Entry Facts Before Save Load

App-entry facts should not depend on a loaded `CareerState`.

Allowed facts:

- supported language keys;
- selected language key;
- supported currency keys;
- selected currency key;
- whether a continue action has a known save target;
- action availability keys.

Not allowed in app entry:

- selected club;
- next fixture;
- squad condition;
- table position;
- market/economics data.

## Career-Dashboard Facts After Save Load

Career-dashboard facts require an explicit loaded save input.

Allowed facts:

- save/career identifiers;
- world seed and generator version;
- current date and season;
- selected club identity;
- selected-club roster size;
- next selected-club fixture;
- preparation state;
- starter condition summary when available;
- compact table row for selected club when computable;
- action availability and blockers.

Not allowed in this first dashboard:

- hidden exact potential;
- squad-needs recommendations;
- automatic transfer advice;
- raw long-run warning rows;
- full youth detail while youth nationality can render `unknown`;
- economics, salaries, contracts, stadiums, or ticket prices.

## Package-Boundary Risks

The safest boundary is a new UI/read-model package:

`packages/ui`

Allowed dependencies:

- `domain`;
- `engine` only for stable pure read/derivation helpers if needed;
- `shared`.

Disallowed dependencies:

- `apps/*`;
- `storage`;
- `content`;
- browser APIs;
- React;
- localized CLI rendering modules.

If `packages/ui` cannot produce a meaningful read-model contract, it should not
be added. Step 03 must keep this as a real boundary, not a pass-through wrapper.

## Localization Risks

The view contracts must not store rendered prose.

Allowed:

- translation keys;
- machine-readable status keys;
- stable IDs;
- numeric values;
- currency preference keys.

Not allowed:

- hardcoded visible headings;
- localized strings inside `domain`, `engine`, or `packages/ui`;
- CLI-formatted money strings in UI contracts.

Currency in Phase 48 is only an app preference/display key. It must not imply
financial simulation.

## First-Screen Blockers

No blocker prevents Step 02.

Non-blocking risks carried forward:

- youth nationality presentation should remain out of the first dashboard;
- long-run warnings must remain developer/report signals;
- first UI must not expose automatic squad-needs advice;
- graphics/visual identity is important but belongs after data-contract scope;
- economics belongs to a later dedicated phase, except for currency preference.

## Narrowest Low-Risk Candidate For Step 02

Step 02 should write product scope for two screens:

1. `Main Menu / App Entry`
2. `Career Dashboard / Matchday Hub`

It should explicitly state that the future web app opens on app entry, while the
career dashboard is reached only after new/continue career.

Step 02 should not create code.
