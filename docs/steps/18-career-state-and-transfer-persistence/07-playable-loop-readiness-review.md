# 07 - Playable Loop Readiness Review

## Goal

Review whether the project is ready to move into the first playable career loop.

This step must answer the practical question behind fun evaluation: can a player now make a meaningful decision, see it persist, and continue from that state?

## What to review

- Career state contract.
- Career save adapter.
- Persistent transfer application.
- Career apply CLI output.
- Career inspect CLI output.
- Localization coverage for new labels.
- Existing balance-report output.
- Existing fixture and market inspection flows.

## What to produce

- `docs/audits/PLAYABLE_LOOP_READINESS_REPORT.md`

The report must include:

- what is now playable;
- what is now durable;
- what is still inspection-only;
- what is missing before a real first playable loop;
- what manual commands the user should run;
- whether Phase 19 should be a first playable career loop, a market-depth phase, or a squad-management phase;
- known risks and non-goals.

## What NOT to implement

- Do not create Phase 19 documents in this step.
- Do not implement new gameplay systems.
- Do not add UI.
- Do not add loans, contracts, wages, transfer windows, scouting, youth, AI market behavior, installments, or player exchanges.
- Do not rework match balance unless a regression is found.

## Expected files

- `docs/audits/PLAYABLE_LOOP_READINESS_REPORT.md`
- `docs/PROJECT_STATUS.md`

## Required checks

- `pnpm check`
- `pnpm cli career --seed=demo-001 --save=career-demo --apply-market-demo=pro01-affordable-permanent`
- `pnpm cli career --save=career-demo --inspect`
- `pnpm cli simulate-season --seed=demo-001 --market-demo=pro01-affordable-permanent --lang=it`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`

## Definition of Done

- The readiness report is written.
- Phase 18 is marked complete or blocked in `docs/PROJECT_STATUS.md`.
- The report clearly states what the user should manually inspect.
- The next recommended phase is explicit, but not started.

