# Code Quality Dead Code Naming Audit

## Goal

Audit code quality, naming consistency, dead code, duplicate helpers, compatibility leftovers, and documentation quality across the current project.

## Why we implement it this way

The project rules reject dead code and deferred cleanup. As the codebase grows, unused compatibility helpers, vague names, and duplicated logic become expensive. This audit turns those risks into explicit findings before larger systems are added.

## What to implement

- Add or update the `6. Code Quality, Dead Code, And Naming Audit` section in `docs/audits/ENGINE_CORE_AUDIT.md`.
- Review:
  - unused exports;
  - obsolete helpers;
  - compatibility leftovers;
  - duplicated logic;
  - naming drift after Phase 12/13 rework;
  - TODO/FIXME comments;
  - stale docs that contradict current behavior;
  - JSDoc/TSDoc quality on public contracts;
  - localization-key naming and hardcoded presentation text enforcement.
- Check whether any implemented code could be simplified now without changing behavior.
- Record each finding with a concrete file path and recommended action.

## What NOT to implement

- Do not refactor source code during the audit.
- Do not remove code during the audit.
- Do not rename public APIs during the audit.
- Do not suppress lint/check failures without documenting a blocker.
- Do not add new enforcement rules unless documented as a later rework.

## Allowed dependencies

- No new dependencies.
- Documentation-only output is expected.

## Expected files

- `docs/audits/ENGINE_CORE_AUDIT.md`
- `docs/PROJECT_STATUS.md`

## Required tests/checks

- `pnpm lint`
- `pnpm check:localized-text`
- `pnpm typecheck`
- `rg -n "TODO|FIXME|legacy|compat|deprecated|temporary|remove later|dead code" packages apps scripts docs`
- `rg -n "marketNeedHints|need:|consider:|surplus:" packages apps docs`
- `rg -n '"[A-Z][^"]{8,}"' apps/cli/src packages/i18n/src scripts`

## Definition of Done

- The audit report lists code-quality findings with severity and file paths.
- Any dead-code or compatibility-leftover finding is explicit rather than left for memory.
- If no dead code is found, the section says which scans and files support that conclusion.
- `docs/PROJECT_STATUS.md` records the step result and next action.

## Claude Code task prompt

Read the required project docs and this step. Audit code quality, naming, dead code, duplicate helpers, comments, and localization enforcement, run the listed checks, update the `6. Code Quality, Dead Code, And Naming Audit` section in `docs/audits/ENGINE_CORE_AUDIT.md`, update `docs/PROJECT_STATUS.md`, and stop after this step.
