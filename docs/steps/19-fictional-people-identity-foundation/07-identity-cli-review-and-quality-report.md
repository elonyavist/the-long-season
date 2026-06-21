# 07 - Identity CLI Review And Quality Report

## Goal

Give the user and future developers a way to inspect generated people identities and decide whether they feel credible enough before the first playable career loop.

This step should produce a quality report, not add new gameplay depth.

## What to implement

- A CLI inspection path for generated identity output, or reuse an existing command if it already exposes enough identity data.
- Output that can show, for one selected fake club:
  - player name;
  - nationality;
  - optional second nationality;
  - name culture if useful for debugging;
  - squad-level nationality summary.
- Localized labels for any new user-facing CLI output.
- Tests for the CLI identity inspection path if a new command/option is added.

## What to produce

- `docs/audits/IDENTITY_FOUNDATION_REPORT.md`

The report must include:

- what changed in generated player identities;
- how nationality distribution works at a high level;
- why names are content and not localization labels;
- what remains out of scope for staff;
- staff identity readiness: `PersonIdentity` can be reused for staff, scouts, presidents, agents/procuratori, and AI managers as pure identity metadata, but future phases must keep staff role, rating, specialization, assignments, persona/tendencies, wages, and gameplay effects in separate contracts;
- manual commands the user should run;
- whether the project should proceed to the first playable career loop next.

## What NOT to implement

- Do not add UI.
- Do not add staff gameplay.
- Do not add real names or real databases.
- Do not add scouting fog, youth intake, contracts, wages, agents, media, or AI market behavior.
- Do not create Phase 20 documents in this step.
- Do not start the first playable career loop.

## Expected files

- `apps/cli/src/commands/simulate-season.ts` or private CLI module files if needed
- `apps/cli/src/commands/simulate-season.test.ts` if CLI output changes
- `packages/i18n/src/labels.ts` if new labels are added
- `packages/i18n/src/labels.test.ts` if label coverage changes
- `docs/audits/IDENTITY_FOUNDATION_REPORT.md`
- `docs/PROJECT_STATUS.md`

## Required checks

- `pnpm --filter @game/cli run typecheck`
- focused CLI tests if a CLI identity inspection path is added
- focused i18n tests if labels changed
- `pnpm check`
- `pnpm cli simulate-season --seed=demo-001`
- `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006`
- identity review CLI command if implemented
- `pnpm cli career --seed=demo-001 --save=career-demo --apply-market-demo=pro01-affordable-permanent`
- `pnpm cli career --save=career-demo --inspect`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`

## Definition of Done

- Generated identity output can be manually reviewed.
- The report explains the adopted identity model and its limits.
- Phase 19 is marked complete or blocked in `docs/PROJECT_STATUS.md`.
- The next recommended phase is explicit, but not started.
