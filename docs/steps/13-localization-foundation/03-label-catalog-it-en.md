# User-Facing Catalog IT EN

## Goal

Create the first real user-facing message catalog for the current CLI-visible game surface in Italian and English.

## Why we implement it this way

`it/en` are enough to prove the localization shape quickly while keeping quality high. The catalog should still be designed so `de/es/fr` can be added without changing label keys or presentation code.

English remains the fallback language. Italian is required because the project is currently being designed and reviewed in Italian.

## What to implement

- Add message keys for the current CLI-visible game surface identified in step 01:
  - common labels, statuses, empty states, and unavailable states;
  - top-level CLI labels and argument/command errors;
  - doctor output if still presented to the user;
  - balance-report headings, metric names, target labels, and status labels;
  - season summary headings, league-table headings, top-summary labels, and table column names;
  - round fixture headings and scorer labels;
  - fixture-detail headings;
  - match-event labels and event-field labels;
  - player-stat table labels;
  - tactic/setup/manual-switch labels;
  - condition/fitness labels;
  - lineup override and rotation labels;
  - formation position families, departments, suitability values, warning keys, extra-depth groups, and factual squad-fit note keys.
- Add English labels for every key.
- Add Italian labels for every key.
- Add tests proving:
  - every current label key has `en`;
  - every current label key has `it`;
  - fallback still returns `en` for missing non-Italian/non-English translations;
  - unknown keys fail clearly.
- Keep labels short enough for CLI tables and future UI lists.
- Do not localize dynamic values such as player names, club names, fixture IDs, scores, numbers, or seed values; localize only the surrounding labels/prose.
- Document exported functions/types with TSDoc/JSDoc.

## What NOT to implement

- Do not add `de/es/fr` translations in this step unless they are complete and reviewed.
- Do not localize full long-form narrative commentary yet; current event rows remain compact structured output.
- Do not translate domain/engine keys or change report data.
- Do not change CLI output yet unless the active step explicitly includes it.
- Do not add market, youth, UI, persistence, career saves, or new gameplay behavior.
- Do not leave partially translated `it/en` keys.

## Allowed dependencies

- Same as the localization package/layer introduced in step 02.

## Expected files

- `packages/i18n/src/labels.ts`
- `packages/i18n/src/labels.test.ts`
- `packages/i18n/src/index.ts`
- `docs/PROJECT_STATUS.md`
- `docs/steps/13-localization-foundation/04-cli-language-option.md` only if a lesson learned changes the next step.

## Required tests/checks

- Focused localization label tests.
- Localization package typecheck.
- `pnpm check`

## Definition of Done

- Current CLI-visible text surface has complete English and Italian message keys.
- English fallback remains deterministic.
- The catalog can be extended to German, Spanish, and French without changing keys.
- CLI output remains unchanged unless this step explicitly documents a narrow presentation-only change.

## Claude Code task prompt

Read `requirements.md`, `docs/PROJECT_RULES.md`, `docs/PROJECT_STATUS.md`, `docs/steps/README.md`, and this step document. Add only the Italian and English message catalog for the current CLI-visible game surface. Do not localize CLI output yet unless required only to prove label lookup. Keep code clean, typed, deterministic, and documented with TSDoc/JSDoc where useful. Run the required checks, update `docs/PROJECT_STATUS.md`, and stop.
