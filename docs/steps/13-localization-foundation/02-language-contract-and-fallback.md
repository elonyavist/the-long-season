# Language Contract And Fallback

## Goal

Define the supported language contract, message-key conventions, and deterministic English fallback.

## Why we implement it this way

Localization must be a stable contract, not a set of loose strings. The game supports five languages, but implementation may begin with `it/en`. The system therefore needs to know every supported language code immediately, even if some translations fall back to English until the five-language completion step.

The contract must also make a clean distinction between stable simulation keys and rendered user text. Domain/engine data should keep language-agnostic keys; CLI/future UI code should render those keys through localized message keys.

## What to implement

- Add a localization package or presentation layer.
- Define:
  - `SupportedLanguage = "it" | "en" | "de" | "es" | "fr"`;
  - `DEFAULT_LANGUAGE = "en"`;
  - `FALLBACK_LANGUAGE = "en"`;
  - language parsing/validation helpers.
- Add a minimal translation lookup contract:
  - input: language and label key;
  - output: localized label;
  - fallback: English when the requested language does not have that key;
  - clear error or typed result for unknown label keys.
- Define message-key namespaces for the current game surface, for example:
  - `common.*`;
  - `cli.*`;
  - `error.*`;
  - `doctor.*`;
  - `balance.*`;
  - `season.*`;
  - `fixture.*`;
  - `event.*`;
  - `stats.*`;
  - `tactic.*`;
  - `lineup.*`;
  - `condition.*`;
  - `formation.*`;
  - `squadFit.*`.
- Define interpolation rules for variable data such as player names, club names, scores, minutes, fixture IDs, metric values, and language-agnostic keys that are still intentionally printed for debugging.
- Document that rendered prose belongs only in presentation/i18n code, not in domain reports or engine results.
- Add tests for:
  - all five language codes are recognized;
  - invalid language codes are rejected;
  - default/fallback language is English;
  - missing requested-language translation falls back to English.
- Document exported functions/types with TSDoc/JSDoc.

## What NOT to implement

- Do not localize the CLI output yet.
- Do not add every label in this step; add only the minimal sample needed to prove the contract.
- Do not decide final translations for every current output group in this step.
- Do not import CLI, engine behavior, content generators, storage, or simulation tools into localization.
- Do not use runtime machine translation, network calls, locale auto-detection, browser APIs, or OS APIs.
- Do not change simulation output data or domain/engine keys.

## Allowed dependencies

- Prefer localization package/layer dependency-free.
- `localization -> domain` is allowed only if stable domain key types are required and the step documents why.
- `apps/cli -> localization` will be introduced later, not in this step unless necessary for package wiring tests.

## Expected files

- `packages/i18n/package.json` or another clearly named localization package if chosen.
- `packages/i18n/src/index.ts`
- `packages/i18n/src/language.ts`
- `packages/i18n/src/language.test.ts`
- workspace/package/dependency config files if a package is introduced.
- dependency rules if a new package changes allowed graph behavior.
- `docs/PROJECT_STATUS.md`
- `docs/steps/13-localization-foundation/03-label-catalog-it-en.md` only if a lesson learned changes the next step.

## Required tests/checks

- Focused tests for the localization language contract.
- Package typecheck for the new localization package.
- `pnpm check`

## Definition of Done

- The project has one reusable language contract for `it`, `en`, `de`, `es`, and `fr`.
- Message keys have a documented namespace strategy for all current user-facing output groups.
- English fallback behavior is deterministic and tested.
- The localization layer is isolated from simulation behavior.
- No CLI output is changed yet.

## Claude Code task prompt

Read `requirements.md`, `docs/PROJECT_RULES.md`, `docs/PROJECT_STATUS.md`, `docs/steps/README.md`, and this step document. Add only the localization language contract and fallback behavior. Do not localize CLI output yet. Keep code clean, typed, deterministic, and documented with TSDoc/JSDoc where useful. Run the required checks, update `docs/PROJECT_STATUS.md`, and stop.
