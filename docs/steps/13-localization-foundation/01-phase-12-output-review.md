# Phase 00-12 Output Text Review

## Goal

Review the current user-facing output created across Phases 00-12 and identify which text must be localized.

## Why we implement it this way

Before adding a localization layer, we need to know what text currently leaks into CLI output. Phase 12 exposed obvious technical keys such as `right_full_back`, `adapted`, `adapted_only:defensive_midfielder`, and `extra_depth:center_backs`, but the earlier phases also added many hardcoded user-facing strings: season headings, table columns, event names, balance metrics, player-stat labels, tactic/lineup/condition labels, and CLI validation errors.

This review protects the next steps from translating random strings ad hoc.

## What to implement

- Run or inspect:
  - `pnpm cli doctor`
  - `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`
  - `pnpm cli simulate-season --seed=demo-001`
  - `pnpm cli simulate-season --seed=demo-001 --round=1`
  - `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`
  - `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006 --setup-demo=pro01-balanced --manual-tactic-switch=46:pro01-attacking`
  - `pnpm cli simulate-season --seed=demo-001 --condition-demo=pro01-season`
  - `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006 --lineup-demo=pro01-rotated`
  - `pnpm cli simulate-season --seed=demo-001 --formation-fit=4-2-3-1`
- Inspect source strings in `apps/cli/src/**/*.ts` and categorize current user-facing text groups:
  - top-level CLI command names, command errors, and argument errors;
  - doctor output;
  - balance-report title, headings, metric names, target/status labels, and `PASS`/`FAIL` rendering;
  - season summary title, seed/competition labels, final-table title, table columns, and top-summary labels;
  - round fixture headings, scorer labels, empty states, and unavailable states;
  - fixture-detail title, event section label, player-stat table label, and event labels;
  - match-event words and event-field labels such as `GOAL`, `SAVE`, `MISS`, `BLOCK`, `assist`, `creator`, `defender`, `shot`, and `chance`;
  - tactic/setup/manual-switch labels;
  - fitness/condition labels;
  - lineup override and rotation labels;
  - formation slots, position families, departments, suitability values, fit warnings, factual squad-fit note keys, and repeated words such as `best`, `natural`, `adapted`, `weak`, `slots`, and `players`.
- Decide which strings belong in the localization catalog and which can remain technical:
  - user-facing presentation text must be localized;
  - stable IDs, schema versions, machine keys, package names, and non-surfaced developer errors can stay technical;
  - user-facing errors should become localized messages or localized wrappers around stable error codes.
- Update `docs/PROJECT_STATUS.md` with the reviewed surface and active next step.

## What NOT to implement

- Do not add localization code yet.
- Do not rename domain/engine keys.
- Do not translate output manually inside the CLI.
- Do not change simulation behavior, report data, fake content, balance, or tests except status documentation.
- Do not mark Phase 13 complete while current CLI-visible surfaces are still outside the localization plan.

## Allowed dependencies

- None. This is a review/documentation step.

## Expected files

- `docs/PROJECT_STATUS.md`
- `docs/steps/13-localization-foundation/02-language-contract-and-fallback.md` only if the review changes the next step.

## Required tests/checks

- `rg -n "console\\.|stdout|stderr|throw new Error|process\\.exit|return \\[" apps packages -g '*.ts'`
- `pnpm cli simulate-season --seed=demo-001 --formation-fit=4-2-3-1`

## Definition of Done

- The current Phases 00-12 localized-text surface is known.
- The review explicitly covers game events and current non-formation CLI output.
- The project status records that Phase 13 can start with a language contract and fallback.
- No code or behavior is changed.

## Claude Code task prompt

Read `requirements.md`, `docs/PROJECT_RULES.md`, `docs/PROJECT_STATUS.md`, `docs/steps/README.md`, and this step document. Review the current CLI/source user-facing text across Phases 00-12, including match events and non-formation reports, identify the label groups that need localization, update `docs/PROJECT_STATUS.md`, and stop. Do not implement localization code in this step.
