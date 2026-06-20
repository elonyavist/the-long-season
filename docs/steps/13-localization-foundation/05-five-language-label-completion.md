# Five Language Label Completion

## Goal

Complete German, Spanish, and French translations for the current user-facing localization catalog.

## Why we implement it this way

The game supports five languages. Earlier steps may intentionally prove the system with `it/en`, but the Phase 13 language contract is not complete until the current user-facing catalog has complete `it`, `en`, `de`, `es`, and `fr` labels.

English remains the fallback for future missing labels, but current CLI-visible labels should no longer need fallback for any supported language after this step.

## What to implement

- Add complete labels for:
  - `de` German;
  - `es` Spanish;
  - `fr` French.
- Cover every current label key already present for `it/en`.
- Add tests proving:
  - every label key has all five supported languages;
  - `--lang=de`, `--lang=es`, and `--lang=fr` use real labels instead of English fallback for current CLI-visible labels;
  - English fallback still works for intentionally missing future/test keys if the lookup contract supports fallback tests.
- Keep translations concise and presentation-ready for CLI and future UI.
- Update `docs/PROJECT_STATUS.md` with the completed five-language coverage.

## What NOT to implement

- Do not add new gameplay systems.
- Do not add market, youth, UI, persistence, career saves, scouting, economy, staff, or training.
- Do not leave current CLI-visible paths covered by `it/en` without `de/es/fr`.
- Do not use runtime machine translation or network dependencies.
- Do not change domain/engine keys.
- Do not leave partial `de/es/fr` coverage for current labels.

## Allowed dependencies

- Same localization package/layer dependencies introduced earlier in this phase.

## Expected files

- `packages/i18n/src/labels.ts`
- `packages/i18n/src/labels.test.ts`
- `apps/cli/src/commands/simulate-season.test.ts` if CLI fallback/real-label assertions are updated.
- `docs/PROJECT_STATUS.md`

## Required tests/checks

- Localization package typecheck.
- Focused localization label tests.
- Focused CLI tests for `--lang=de`, `--lang=es`, and `--lang=fr`.
- `pnpm check`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict --lang=de`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict --lang=es`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict --lang=fr`
- `pnpm cli simulate-season --seed=demo-001 --lang=de`
- `pnpm cli simulate-season --seed=demo-001 --lang=es`
- `pnpm cli simulate-season --seed=demo-001 --lang=fr`
- `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001 --lang=de`
- `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001 --lang=es`
- `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001 --lang=fr`
- `pnpm cli simulate-season --seed=demo-001 --formation-fit=4-2-3-1 --lang=de`
- `pnpm cli simulate-season --seed=demo-001 --formation-fit=4-2-3-1 --lang=es`
- `pnpm cli simulate-season --seed=demo-001 --formation-fit=4-2-3-1 --lang=fr`

## Definition of Done

- Every current localization label key has `it`, `en`, `de`, `es`, and `fr` translations.
- Current CLI output can be inspected in all five supported languages.
- English fallback still exists for future missing labels but is not needed for current CLI-visible label keys.
- Phase 13 can proceed to hardcoded presentation-text enforcement before closure.

## Claude Code task prompt

Read `requirements.md`, `docs/PROJECT_RULES.md`, `docs/PROJECT_STATUS.md`, `docs/steps/README.md`, and this step document. Complete German, Spanish, and French translations for the current user-facing localization catalog. Do not change domain/engine keys or gameplay behavior. Keep code clean, typed, deterministic, and documented with TSDoc/JSDoc where useful. Run the required checks, update `docs/PROJECT_STATUS.md`, tell me what to inspect in the CLI output, and stop.
