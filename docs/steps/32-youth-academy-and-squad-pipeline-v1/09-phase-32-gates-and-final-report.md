# Step 09 - Phase 32 Gates And Final Report

## Goal

Close Phase 32 with evidence that youth academies improve long-run career credibility without overpopulating the world.

## Context

Phase 32 exists because the career world should refresh through a believable academy pipeline, not only external replacement pools. The final report must compare senior-only refresh behavior with youth-pipeline behavior and decide the next phase.

## Expected files

- `docs/audits/YOUTH_ACADEMY_LONG_RUN_REPORT.md`
- `docs/audits/YOUTH_ACADEMY_AND_SQUAD_PIPELINE_REPORT.md`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Run the Phase 32 long-run gates.
- Record:
  - senior squad min/avg/max;
  - youth squad min/avg/max;
  - total active players;
  - youth intake per season;
  - youth exits/releases per season;
  - youth promotions per season;
  - clubs with youth overpopulation;
  - clubs with youth underpopulation;
  - match balance regression check.
- Compare Phase 31 `250` x `30` result with Phase 32 `250` x `30` result.
- Decide whether the next phase should be:
  - long-run gate runner parallelization;
  - market/youth interaction refinement;
  - broader career-world simulation;
  - UI exploration.
- Update `docs/PROJECT_STATUS.md` with the next single recommended active step.

## What NOT to implement

- Do not start the next phase.
- Do not hide youth overpopulation.
- Do not weaken squad-size or goalkeeper gates.
- Do not add UI.
- Do not implement youth scouting or facilities in the final report.

## Required checks

- `pnpm check`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`
- `pnpm cli ten-season-report --seed-prefix=phase32-youth --worlds=50 --seasons=10 --report-output=docs/audits/YOUTH_ACADEMY_LONG_RUN_REPORT.md`
- `pnpm cli ten-season-report --seed-prefix=phase32-youth --worlds=250 --seasons=30 --report-output=docs/audits/YOUTH_ACADEMY_LONG_RUN_REPORT.md`
- `git diff --check`

## Definition of Done

- Phase 32 final report exists.
- The report proves youth rosters remain bounded or records exact failing seeds/reasons.
- The next active phase is selected from evidence, not preference.
