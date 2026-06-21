# 08 - World Generation Quality Report

## Goal

Review Phase 20 output and decide whether the project is ready to move toward the first playable career loop, youth systems, or deeper market systems.

This step should produce a quality report, not introduce new gameplay.

## What to implement

- Review the final Phase 20 output for:
  - same-seed reproducibility;
  - different-seed variation;
  - generated name variety;
  - nationality distribution credibility;
  - age distribution credibility;
  - prospect and rare high-upside player frequency;
  - persistence behavior if a career save is written;
  - flag asset coverage.
- Produce `docs/audits/NEW_CAREER_WORLD_GENERATION_REPORT.md`.
- Record the recommended next phase and any blocking issue.

## What to produce

- `docs/audits/NEW_CAREER_WORLD_GENERATION_REPORT.md`

The report must include:

- what changed in new career world generation;
- how world seed and career save persistence work;
- what is generated per new career and what must remain stable inside a save;
- how player archetypes, age, and potential are distributed at a high level;
- whether repeated names are acceptable or still need work;
- how flags are mapped and why they are not domain/engine data;
- manual commands the user should run;
- whether the next phase should be first playable career loop, youth academy, market depth, or another cleanup pass.

## What NOT to implement

- Do not add UI.
- Do not add youth intake.
- Do not add growth/decline simulation.
- Do not add scouting fog.
- Do not add staff gameplay.
- Do not add market AI, contracts, wages, loans, or transfer windows.
- Do not start the next phase.

## Expected files

- `docs/audits/NEW_CAREER_WORLD_GENERATION_REPORT.md`
- `docs/PROJECT_STATUS.md`

## Required checks

- focused tests for every touched package in Phase 20
- `pnpm check`
- `pnpm cli simulate-season --seed=demo-001`
- `pnpm cli simulate-season --seed=demo-001 --identity-review`
- new-career/world CLI command with one seed
- new-career/world CLI command with a second seed
- career inspect command if the phase writes a save
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`

## Definition of Done

- The quality report exists and is specific enough for a junior developer or LLM to understand the project state.
- Phase 20 is marked complete or blocked in `docs/PROJECT_STATUS.md`.
- The next recommended phase is explicit, but not started.
