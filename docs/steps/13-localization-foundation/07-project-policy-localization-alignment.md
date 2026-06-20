# Project Policy Localization Alignment

## Goal

Align `requirements.md` and `docs/PROJECT_RULES.md` so future phases cannot add hardcoded labels that are useful to the CLI, the future UI, or any presentation layer.

## Why we implement it this way

Phase 13 introduces the localization foundation, but the rule must live above one implementation phase. Future work on market, youth, career saves, UI, news, match day, and modding will add a lot of user-facing text. If the source of truth does not explicitly ban hardcoded labels, the project will slowly drift back to inline English or Italian strings.

This step closes Phase 13 by making localization a project-wide policy:

- domain and engine keep structured, language-agnostic data;
- UI, CLI, and presentation adapters render labels through localization keys;
- labels useful to either CLI or UI are shared presentation assets, not one-off strings;
- stable IDs, schema versions, machine keys, and non-surfaced developer diagnostics remain technical unless rendered to the user.

## What to implement

- Review `requirements.md` Area 20 and related architecture notes.
- Review `docs/PROJECT_RULES.md`.
- Ensure both documents state that produced code must not hardcode user-facing labels when those labels are visible or useful to:
  - CLI output;
  - future UI output;
  - event/ticker rendering;
  - report/table headings;
  - statuses, warnings, hints, and validation errors.
- Ensure both documents preserve the boundary:
  - domain/engine reports store structured data and keys, not rendered prose;
  - localization/presentation code turns keys into language-specific text.
- Update `docs/PROJECT_STATUS.md` with the final Phase 13 policy decision.

## What NOT to implement

- Do not add localization runtime behavior in this step.
- Do not add new translations in this step unless a policy example requires a catalog key and the active step explicitly allows it.
- Do not change simulation behavior, events, saves, IDs, balance, content generation, or CLI output.
- Do not ban technical constants, IDs, schema versions, package names, or internal developer diagnostics that are not rendered to the user.
- Do not use this step to start Phase 14.

## Allowed dependencies

- None. This is a documentation and policy-alignment step.

## Expected files

- `requirements.md`
- `docs/PROJECT_RULES.md`
- `docs/PROJECT_STATUS.md`

## Required tests/checks

- Documentation review only.
- `rg -n "hardcoded|localizzazione|localization|user-facing|UI|CLI" requirements.md docs/PROJECT_RULES.md docs/PROJECT_STATUS.md`

## Definition of Done

- `requirements.md` states that labels useful to UI or CLI must not be hardcoded in produced code.
- `docs/PROJECT_RULES.md` states the same rule as a binding engineering constraint.
- The rule distinguishes localizable user-facing text from stable technical keys.
- `docs/PROJECT_STATUS.md` records the final Phase 13 policy alignment.
- Phase 13 can be marked complete or explicitly reworked before Phase 14 starts.

## Claude Code task prompt

Read `requirements.md`, `docs/PROJECT_RULES.md`, `docs/PROJECT_STATUS.md`, `docs/steps/README.md`, and this step document. Align `requirements.md` and `docs/PROJECT_RULES.md` so produced code cannot hardcode labels that are useful to CLI, UI, ticker/event rendering, reports, statuses, warnings, hints, or user-facing errors. Do not change code or simulation behavior. Update `docs/PROJECT_STATUS.md`, report the exact policy text added or verified, and stop.
