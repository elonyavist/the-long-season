# Career First Screen Scope

Date: 2026-06-23
Phase: `48-career-ui-slice-readiness-and-first-screen-scope`
Step: `02-first-screen-product-scope`
Status: Complete

## Purpose

Define the smallest useful UI product scope before source contracts are added.

This document separates:

1. the app entry screen shown before a career is loaded;
2. the first career screen shown after a new or existing career is opened.

## Screen 1 - Main Menu / App Entry

### Purpose

Give the manager the only choices that matter before a save exists:

- start a new career;
- continue an existing career;
- adjust app-level settings.

This is the real first screen of the app. It is not a marketing landing page.

### Required Sections

- Game identity/title area.
- Primary actions:
  - new career;
  - continue career;
  - settings.
- Settings summary:
  - selected language;
  - selected currency.
- Optional metadata if already available without new runtime work:
  - app version/build key;
  - save directory/status key.
- Continue-career empty state:
  - disabled action if no save is available;
  - structured disabled reason.

### Supported Manager Decisions

- Start a new run.
- Continue a previous run.
- Change language before entering a save.
- Change currency display before financial systems exist.

### Values, IDs, Preferences, And Translation Keys

Values:

- selected language key;
- selected currency key;
- continue availability status.

Stable IDs:

- optional save ID for the highlighted continue target;
- action IDs.

Preference keys:

- `language`;
- `currency`.

Translation keys:

- action labels;
- settings labels;
- disabled reasons;
- empty-state messages.

## Screen 2 - Career Dashboard / Matchday Hub

### Purpose

Show the manager the current career situation after a save is created or loaded,
with enough information to decide what to inspect or do next.

This is the first post-load career screen, not the first app screen.

### Required Sections

- Career context:
  - save ID;
  - world seed;
  - generator version;
  - current season;
  - current date.
- Selected club:
  - club ID;
  - club display name;
  - roster size.
- Next selected-club fixture:
  - fixture ID;
  - round;
  - date;
  - home club;
  - away club;
  - whether the selected club is home or away.
- Match preparation:
  - saved lineup status;
  - saved tactic status;
  - target fixture if present;
  - blocker keys when preparation is missing.
- Squad condition summary:
  - roster count;
  - lowest selected-club fitness;
  - average selected-club fitness;
  - count of low-fitness players.
- Compact table context:
  - selected-club position when computable;
  - points;
  - goal difference;
  - played matches.
- Recent match context:
  - last selected-club fixture result when available;
  - no-result status when unavailable.
- Available manager actions:
  - inspect squad;
  - inspect lineup;
  - inspect tactic;
  - prepare match;
  - advance next fixture;
  - inspect table.
- Blockers:
  - missing saved lineup;
  - missing saved tactic;
  - no next fixture;
  - save not found;
  - invalid career state.

### Supported Manager Decisions

- Decide whether the save can be advanced.
- Decide whether to prepare lineup or tactic first.
- Inspect squad condition before playing.
- Understand where the club is in the season.
- Continue to table/squad/preparation screens without being given hidden advice.

### Values, IDs, Preferences, And Translation Keys

Values:

- dates as structured epoch/ISO-ready values;
- numeric fitness summaries;
- roster counts;
- table numbers.

Stable IDs:

- save ID;
- club IDs;
- fixture ID;
- season ID;
- action IDs.

Preference keys:

- language controls rendering outside the contract;
- currency is not used in this dashboard until economics exists.

Translation keys:

- section titles;
- status labels;
- blocker labels;
- action labels.

## Explicit Out Of Scope

The first UI slice must not include:

- transfer screen;
- youth academy detail screen;
- full tactic board;
- full squad table;
- full fixture list;
- match viewer;
- news inbox;
- scouting;
- finances/economics screen;
- player contracts;
- salaries or wage budgets;
- stadium capacity or ticket prices;
- club revenue/cost simulation;
- visual design system implementation.

## Economics Decision

Economics is not part of Phase 48.

Phase 48 may reserve a `currency` preference for future display, but it must not
introduce:

- club cash;
- wage budget;
- salary contracts;
- stadium revenue;
- ticket prices;
- financial simulation.

Those systems need a dedicated gameplay phase because they affect market
decisions, long-run balance, and the manager's sense of risk.

## Visual Direction Decision

The game needs a premium retro visual identity, but Phase 48 does not implement
graphics, CSS, React components, screenshots, or a design system.

The visual direction should become a dedicated phase after UI contracts are
stable. That phase should define the retro-premium language before a web
prototype becomes visually concrete.

## Hidden Information And Agency Rules

The first UI slice must not show:

- exact hidden potential;
- automatic squad-needs advice;
- transfer recommendations;
- raw long-run warnings;
- full youth detail while youth nationality presentation can still be unknown.

The first dashboard should help the manager understand the situation. It should
not decide market, lineup, or tactic strategy for them.

## Product Decision

Proceed to source contracts only if Step 03 keeps the scope split:

- `AppEntryView` for the pre-save main menu;
- `CareerDashboardView` for the post-load career hub;
- structured action availability and blocker keys;
- no rendered prose in contracts.
