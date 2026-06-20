# Localization Foundation Steps

## Goal

Add a deterministic localization foundation for the five supported game languages:

- `it` Italian
- `en` English
- `de` German
- `es` Spanish
- `fr` French

The long-term goal is that every user-facing label, heading, event word, report metric, warning, hint, status, and CLI error introduced by the game has translations in all five supported languages, with English as the deterministic fallback.

## Why we implement it this way

The project is starting to produce many user-visible strings: command output, season reports, league-table headings, balance metrics, fixture events, player-stat headings, tactics, lineups, condition reports, formations, squad-fit warnings, factual squad-fit notes, and CLI validation errors.

Those strings must not be hardcoded in presentation paths. Domain and engine should keep stable language-agnostic keys such as `goal`, `save`, `right_full_back`, `adapted_only:defensive_midfielder`, and `extra_depth:wide_players`. Presentation layers should turn those stable keys and structured data into localized text, without rendering them as market instructions.

This phase deliberately separates inventory, contract, catalog, CLI integration, five-language completion, hardcoded-text enforcement, and source-of-truth policy alignment:

1. review the user-facing output created across Phases 00-12;
2. define supported languages, fallback behavior, and message-key conventions;
3. create a reusable localization package/layer;
4. add an `it/en` catalog for the current CLI-visible game surface;
5. expose CLI language selection and localize current presentation output without changing simulation data;
6. complete `de`, `es`, and `fr` for the current catalog after `it/en` are proven;
7. add a guard against new hardcoded user-facing strings in presentation code.
8. align `requirements.md` and `docs/PROJECT_RULES.md` so future phases inherit the no-hardcoded-label policy for CLI and UI.

Starting with `it/en` is allowed for implementation momentum, but the phase is not complete until the current catalog has all five languages or the status explicitly says the phase is partial. Missing translations must be visible in tests and must fall back to English deterministically.

Not every string literal is a localization target. IDs, schema versions, package names, test fixture identifiers, machine-readable keys, and internal developer exceptions may remain technical. Any text rendered to a player/user through CLI or future UI is a localization target.

## What to implement

- Review Phases 00-12 output and identify current user-facing text groups:
  - top-level CLI command help/errors;
  - doctor output if still user-facing;
  - balance-report headings, metrics, statuses, and validation errors;
  - season summary headings and league-table column labels;
  - fixture result headings, scorer labels, and empty/unavailable states;
  - match-event labels such as goal, save, miss, block, assist, creator, defender, shot, and chance;
  - player-stat table headings;
  - tactic/setup/manual-switch output;
  - fitness/condition output;
  - lineup/rotation output;
  - formation/squad-fit output.
- Define the language contract:
  - `SupportedLanguage = it | en | de | es | fr`;
  - default/fallback language is `en`;
  - invalid language inputs fail clearly;
  - missing translations fall back to English.
- Add a reusable localization package or presentation layer.
- Add a typed message/label-key catalog for the current CLI-visible game surface:
  - common words and statuses;
  - CLI command and argument errors;
  - balance report labels;
  - season summary labels;
  - fixture and event labels;
  - player stat labels;
  - tactic, lineup, condition, and manual-switch labels;
  - formation, squad-fit, warning, and factual squad-fit note labels.
- Implement `it` and `en` first.
- Add CLI language selection, likely `--lang=it|en|de|es|fr`.
- Localize current CLI presentation output without changing domain/engine keys or simulation data.
- Add hardcoded user-facing string enforcement for presentation code, with an explicit allowlist for technical keys and non-user-facing literals.
- Align the product requirements and project rules so future code cannot add UI/CLI-useful labels directly in source instead of through localization.
- Add tests proving:
  - default language is English;
  - `--lang=it` changes labels only, not simulation data;
  - unknown language is rejected;
  - missing translation falls back to English;
  - every current message key has `it/en` translations;
  - final five-language step covers `de/es/fr` too;
  - new presentation output cannot add hardcoded user-facing prose without a catalog key.

## What NOT to implement

- Do not translate domain/engine keys or store prose in domain/engine reports.
- Do not change simulation behavior, balance, calendar, RNG, or match output data.
- Do not add UI, Tauri, browser app, persistence, career saves, market, youth, scouting, economy, or staff systems.
- Do not mix localization with feature logic.
- Do not leave hardcoded user-facing strings in presentation code when a label key should exist.
- Do not silently ignore missing translations; fallback is allowed, but tests/status must make missing coverage explicit.
- Do not add machine translation at runtime or network translation dependencies.

## Allowed dependencies

- `domain -> nothing`
- `engine -> domain, shared`
- `content -> domain, shared`
- `i18n/localization -> domain` only if it imports stable domain key types; otherwise dependency-free is preferred.
- `apps/cli -> engine, content, storage, simulation-tools, shared, i18n/localization`

If a new package is introduced, dependency rules and workspace metadata must be updated in the same step.

## Expected files

- `docs/steps/13-localization-foundation/01-phase-12-output-review.md`
- `docs/steps/13-localization-foundation/02-language-contract-and-fallback.md`
- `docs/steps/13-localization-foundation/03-label-catalog-it-en.md`
- `docs/steps/13-localization-foundation/04-cli-language-option.md`
- `docs/steps/13-localization-foundation/05-five-language-label-completion.md`
- `docs/steps/13-localization-foundation/06-hardcoded-presentation-text-enforcement.md`
- `docs/steps/13-localization-foundation/07-project-policy-localization-alignment.md`

## Required tests

- No tests for this overview.
- Each implementation step defines its own checks.

## Definition of Done

- Phase 13 has a documented path from current project output review to CLI-visible localized text.
- Stable domain/engine keys remain language-agnostic.
- English is the deterministic fallback language.
- `it/en` localization exists for the current CLI-visible text surface.
- The phase includes an explicit step to complete `de/es/fr` for the current catalog.
- Presentation code has an enforcement check against new hardcoded user-facing strings.
- `requirements.md` and `docs/PROJECT_RULES.md` both state that labels useful to CLI or UI must not be hardcoded in produced code.
- The project still identifies exactly one active implementation step.

## Claude Code task prompt

Read `requirements.md`, `docs/PROJECT_RULES.md`, `docs/PROJECT_STATUS.md`, `docs/steps/README.md`, and `docs/steps/13-localization-foundation/01-phase-12-output-review.md`. Review the current user-facing output created across Phases 00-12 and identify which labels, headings, event words, metric names, statuses, warnings, hints, and errors must move behind localization. Update `docs/PROJECT_STATUS.md` with the decision and stop.
