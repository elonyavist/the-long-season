# Shared Career State Seams

## Goal

Identify the shared career-state seams that market, youth, economy, calendar, and persistence will need.

## Why we implement it this way

If every feature creates its own state shape, the project will lose locality. The market should not invent a private state model that youth, contracts, loans, and multi-season progression later duplicate.

This step is about Module depth: choose where career state Interfaces should live so future systems get leverage without turning `GameState` into an unstructured dumping ground.

## What to implement

- Review current `GameState` and storage contracts.
- Review current squad, lineup, formation, fixture, and player-state contracts.
- Update `docs/audits/CAREER_SYSTEMS_DEPENDENCY_MAP.md` with a section named `Shared Career State Seams`.
- Identify candidate shared Modules, such as:
  - career identity/run metadata;
  - club ownership of players;
  - club squads;
  - player contracts or ownership facts;
  - transfer history;
  - season progression state;
  - current user-controlled club;
  - save/career persistence adapter.
- For each candidate, describe:
  - proposed seam;
  - caller Interface;
  - systems that depend on it;
  - whether it is required before market MVP.
- Avoid designing detailed TypeScript Interfaces unless a small sketch is needed for clarity.

## What NOT to implement

- Do not change `GameState`.
- Do not change storage code.
- Do not add career state source files.
- Do not add market code.
- Do not create persistence migrations.

## Allowed dependencies

- Documentation-only step.

## Expected files

- `docs/audits/CAREER_SYSTEMS_DEPENDENCY_MAP.md`
- `docs/PROJECT_STATUS.md`
- Next relevant step document only if the dependency map changes future scope.

## Required tests/checks

- `rg -n "interface GameState|GameStorage|JsonGameStorage|migrateSave|Save" packages/domain/src packages/storage/src`
- `rg -n "SquadDepth|SelectedLineup|Formation|fixtureIds|playerIds|clubIds|playerStates" packages/domain/src packages/engine/src`
- `rg -n "CareerState|career|run|save" packages docs requirements.md`

## Definition of Done

- The report identifies shared career-state seams and required consumers.
- The report explicitly says whether Phase 17 market MVP needs a career state first.
- No source code is changed.

## Claude Code task prompt

Read the required project docs, the current dependency map report, and this step document. Map shared career-state seams, run the required scans, update `docs/audits/CAREER_SYSTEMS_DEPENDENCY_MAP.md`, update `docs/PROJECT_STATUS.md`, and stop.
