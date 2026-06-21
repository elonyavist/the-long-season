# Phase Order Decision

## Goal

Finalize the dependency map and decide the next real implementation phase.

## Why we implement it this way

The previous steps collect dependencies. This step turns them into an implementation order that keeps `docs/steps/` linear and avoids building market in isolation.

## What to implement

- Finalize `docs/audits/CAREER_SYSTEMS_DEPENDENCY_MAP.md`.
- Add a section named `Recommended Phase Order`.
- Decide whether the next implementation phase should be:
  - market MVP permanent transfers;
  - career state/persistence foundation;
  - economy/budget foundation;
  - calendar/season transition foundation;
  - scouting/player-information foundation;
  - or another rework/audit phase.
- If market MVP remains next, state the exact constraints:
  - in-memory only or persistent;
  - with or without temporary budget;
  - with or without transfer windows;
  - how player willingness is represented without full contracts/scouting.
- Update `docs/PROJECT_STATUS.md` to mark Phase 16 complete or blocked.
- Do not create the next phase docs unless explicitly asked after this phase.

## What NOT to implement

- Do not implement code.
- Do not create Phase 17 step docs in this step unless explicitly asked.
- Do not hide unresolved blockers.
- Do not convert the whole market roadmap into `docs/steps/`.
- Do not change project rules.

## Allowed dependencies

- Documentation-only step.

## Expected files

- `docs/audits/CAREER_SYSTEMS_DEPENDENCY_MAP.md`
- `docs/PROJECT_STATUS.md`

## Required tests/checks

- `test -f docs/audits/CAREER_SYSTEMS_DEPENDENCY_MAP.md`
- `rg -n "Recommended Phase Order|Market Roadmap Dependency Review|Shared Career State Seams|Economy And Budget Dependencies|Calendar And Season Transition Dependencies|Scouting Youth And Market Overlap" docs/audits/CAREER_SYSTEMS_DEPENDENCY_MAP.md`
- `rg -n "Active implementation step|Phase 16|Career Systems Dependency Map" docs/PROJECT_STATUS.md`

## Definition of Done

- `docs/audits/CAREER_SYSTEMS_DEPENDENCY_MAP.md` contains the completed dependency map.
- The next real phase is named and justified.
- Any blockers are explicit.
- `docs/PROJECT_STATUS.md` records the result and next action.
- No source code or feature implementation is introduced.

## Claude Code task prompt

Read the required project docs, the completed Phase 16 dependency-map sections, and this step document. Finalize `docs/audits/CAREER_SYSTEMS_DEPENDENCY_MAP.md`, decide the next implementation phase, run the required checks, update `docs/PROJECT_STATUS.md`, and stop. Do not create Phase 17 docs unless explicitly asked.
