# Calendar And Season Transition Dependencies

## Goal

Identify which calendar, season-transition, and competition-rule concepts are required before loans, transfer windows, registration, and multi-season career play.

## Why we implement it this way

Loans, transfer windows, registrations, and contract expiry cannot be modeled correctly without knowing where the game is in the calendar and how seasons advance. This step prevents market phases from inventing date shortcuts that later conflict with multi-season progression.

## What to implement

- Review current `GameDate`, calendar generation, fixture state, and season simulation.
- Review requirements for promotion/relegation, transfer windows, loans, and calendar-based market behavior.
- Update `docs/audits/CAREER_SYSTEMS_DEPENDENCY_MAP.md` with a section named `Calendar And Season Transition Dependencies`.
- Identify which concepts are already present:
  - `GameDate`;
  - current season ID;
  - fixture dates;
  - generated rounds.
- Identify missing shared Modules:
  - season transition;
  - current competition calendar;
  - transfer window config;
  - loan end processing;
  - contract expiry date;
  - registration date rules.
- Decide which market roadmap phases are blocked until these exist.

## What NOT to implement

- Do not implement season transition.
- Do not implement transfer windows.
- Do not implement loans.
- Do not implement registration.
- Do not change calendar generation.

## Allowed dependencies

- Documentation-only step.

## Expected files

- `docs/audits/CAREER_SYSTEMS_DEPENDENCY_MAP.md`
- `docs/PROJECT_STATUS.md`

## Required tests/checks

- `rg -n "GameDate|currentDate|currentSeasonId|seasonStartDate|generateRoundRobinCalendar|roundNumber|fixtureIds" packages docs requirements.md`
- `rg -n "loan|prestito|window|finestra|registration|registrazione|season transition|promotion|relegation|promozione|retrocessione" docs requirements.md packages`

## Definition of Done

- The report names the calendar Modules that must exist before loans/windows/registrations.
- The report says whether permanent-transfer MVP can ignore transfer windows temporarily.
- No source code is changed.

## Claude Code task prompt

Read the required project docs, the current dependency map report, and this step document. Map calendar and season-transition dependencies, run the required scans, update `docs/audits/CAREER_SYSTEMS_DEPENDENCY_MAP.md`, update `docs/PROJECT_STATUS.md`, and stop.
