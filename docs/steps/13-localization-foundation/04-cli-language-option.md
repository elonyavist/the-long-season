# CLI Language Option

## Goal

Expose language selection in the CLI and migrate current CLI presentation output to localized messages.

## Why we implement it this way

The CLI is currently the only user-visible interface. It is also the cheapest place to prove that localization changes presentation only, not simulation data.

This step should add `--lang=<code>` and make current CLI output render through the localization catalog. Domain and engine should continue to emit stable keys and structured data.

## What to implement

- Add CLI argument:
  - `--lang=it|en|de|es|fr`
- Default to English when omitted.
- Reject unsupported language codes clearly.
- Apply localization to current CLI presentation output:
  - top-level command/argument errors;
  - `doctor` output if still user-facing;
  - `balance-report` headings, metrics, targets, and status labels;
  - `simulate-season` season summary headings and table labels;
  - round fixture output and scorer labels;
  - fixture-detail headings, event labels, event-field labels, and player-stat headings;
  - tactic/setup/manual-switch inspection labels;
  - condition demo labels;
  - lineup demo/override labels;
  - formation-fit headings, position-family labels, department labels, suitability labels, warning labels, and factual squad-fit note labels.
- Keep stable technical keys available in tests or internal data, but do not rely on them as user-facing labels for localized output.
- Add tests proving:
  - default output is English;
  - `--lang=it` changes labels;
  - repeated localized output is deterministic;
  - invalid language exits nonzero;
  - `--lang=de|es|fr` falls back to English until step 05 completes those translations;
  - default season simulation data remains unchanged.
- Document exported functions/types with TSDoc/JSDoc where useful.

## What NOT to implement

- Do not change any simulation result, table order, event data, stat value, or balance metric.
- Do not convert compact structured event output into long narrative commentary.
- Do not change engine/domain report data.
- Do not change match simulation, balance, fake content, or current deterministic outputs except presentation text.
- Do not add UI, persistence, market, youth, scouting, economy, or career saves.
- Do not leave new user-facing strings inline in CLI files if a catalog key should exist.

## Allowed dependencies

- `apps/cli -> localization/i18n`
- Existing CLI dependencies remain allowed.
- Localization package must not import CLI.

## Expected files

- `apps/cli/src/index.ts`
- `apps/cli/src/commands/simulate-season.ts`
- `apps/cli/src/commands/simulate-season.test.ts`
- `apps/cli/src/commands/balance-report.ts`
- `apps/cli/src/commands/balance-report.test.ts`
- `apps/cli/src/commands/doctor.ts` if doctor output remains user-facing.
- localization package files only if the CLI integration exposes a missing label or helper.
- package/dependency config if the CLI package needs a new dependency.
- `docs/PROJECT_STATUS.md`
- `docs/steps/13-localization-foundation/05-five-language-label-completion.md` only if a lesson learned changes the next step.

## Required tests/checks

- CLI typecheck.
- Localization package typecheck.
- Focused CLI tests for `--lang`.
- Focused localization tests if labels/helpers change.
- `pnpm check`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict --lang=en`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict --lang=it`
- `pnpm cli simulate-season --seed=demo-001 --lang=en`
- `pnpm cli simulate-season --seed=demo-001 --lang=it`
- `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001 --lang=en`
- `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001 --lang=it`
- `pnpm cli simulate-season --seed=demo-001 --formation-fit=4-2-3-1 --lang=en`
- `pnpm cli simulate-season --seed=demo-001 --formation-fit=4-2-3-1 --lang=it`

## Definition of Done

- The CLI accepts a language option.
- Current CLI presentation output is localized for English and Italian.
- German, Spanish, and French are accepted language codes but fall back to English until step 05 completes their labels.
- Simulation data and balance are unchanged.

## Claude Code task prompt

Read `requirements.md`, `docs/PROJECT_RULES.md`, `docs/PROJECT_STATUS.md`, `docs/steps/README.md`, and this step document. Add the CLI language option and migrate current CLI presentation output to the existing localization catalog. Do not change simulation behavior, event data, or balance. Keep code clean, typed, deterministic, and documented with TSDoc/JSDoc where useful. Run the required checks, update `docs/PROJECT_STATUS.md`, tell me what to inspect in the CLI output, and stop.
