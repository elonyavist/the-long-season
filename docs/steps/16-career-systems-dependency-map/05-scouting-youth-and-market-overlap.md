# Scouting Youth And Market Overlap

## Goal

Identify where scouting, youth, player growth, and market share concepts so future phases do not duplicate knowledge, player availability, or development state.

## Why we implement it this way

Youth and scouting are not market features, but they strongly affect market decisions. If market implements exact visible player data and youth later implements potential ranges separately, the project loses locality and creates conflicting player-information Interfaces.

## What to implement

- Review requirements for scouting, youth, growth, loans, and market.
- Review current player ability/potential, age, positions, and fake content generation.
- Update `docs/audits/CAREER_SYSTEMS_DEPENDENCY_MAP.md` with a section named `Scouting Youth And Market Overlap`.
- Identify shared concepts:
  - true player data;
  - visible player data;
  - scouting knowledge;
  - potential ranges;
  - youth/prospect ownership;
  - loan development;
  - player ambition/career stage;
  - player willingness.
- Decide which concepts can be deferred from market MVP and which must be accounted for in the Interface now.

## What NOT to implement

- Do not implement scouting.
- Do not implement youth intake.
- Do not implement player growth.
- Do not implement visible ranges.
- Do not add player personality or ambition code.

## Allowed dependencies

- Documentation-only step.

## Expected files

- `docs/audits/CAREER_SYSTEMS_DEPENDENCY_MAP.md`
- `docs/PROJECT_STATUS.md`

## Required tests/checks

- `rg -n "potential|scout|scouting|fog|youth|prospect|loan|growth|aging|ambition|personality|career stage" requirements.md docs packages`
- `rg -n "potential|birthDate|naturalPositions|PlayerAbilities|PlayerDynamicState|PlayerPosition" packages/domain/src packages/content/src`

## Definition of Done

- The report identifies shared player-information seams.
- The report says what market MVP must not hardcode because scouting/youth will own it later.
- No source code is changed.

## Claude Code task prompt

Read the required project docs, the current dependency map report, and this step document. Map scouting/youth/market overlap, run the required scans, update `docs/audits/CAREER_SYSTEMS_DEPENDENCY_MAP.md`, update `docs/PROJECT_STATUS.md`, and stop.
