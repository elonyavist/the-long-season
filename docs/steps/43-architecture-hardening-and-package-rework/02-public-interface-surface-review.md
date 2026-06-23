# 02 - Public Interface Surface Review

## Goal

Review package public interfaces and decide which exports are stable entry points, which are internal implementation details, and which are risky to expose.

This step should make the architecture easier to understand without changing behavior.

## Expected files

- `docs/audits/ARCHITECTURE_PUBLIC_INTERFACE_REVIEW.md`
- `docs/audits/ARCHITECTURE_PACKAGE_COMPLEXITY_INVENTORY.md`
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Read `docs/audits/ARCHITECTURE_PACKAGE_COMPLEXITY_INVENTORY.md`.
- Inspect root public surfaces:
  - `packages/domain/src/index.ts`
  - `packages/engine/src/index.ts`
  - `packages/content/src/index.ts`
  - `packages/storage/src/index.ts`
  - `packages/simulation-tools/src/index.ts`
  - `packages/i18n/src/index.ts`
- For each export group, classify it as:
  - stable entry point;
  - stable contract;
  - test-supported low-level helper;
  - implementation detail currently exposed;
  - candidate for future narrowing.
- Identify where outer adapters currently assemble core flows from low-level helpers.
- Identify whether import paths use root package exports or deep internal paths.
- Create a recommended target interface map:
  - career advancement entry points;
  - match simulation entry points;
  - world generation entry points;
  - diagnostics entry points;
  - storage entry points;
  - i18n rendering entry points.
- Do not remove exports in this step unless a redundant export has no callers and no migration risk.
- If an export narrowing is recommended, document the exact future step that should do it.

## What NOT to implement

- Do not rewrite package entry points broadly.
- Do not break public imports.
- Do not create a new package.
- Do not move implementation files.
- Do not start the career advancement refactor yet.
- Do not change gameplay behavior.

## Required checks

- `rg -n "from \"@game/(domain|engine|content|storage|simulation-tools|i18n|shared)\"" apps packages`
- `rg -n "from \"@game/.*/src|from \"\\.\\./\\.\\." apps packages`
- `rg -n "^export " packages/*/src/index.ts`
- `pnpm depcruise`
- `pnpm check`
- `git diff --check`

## Definition of Done

- The audit identifies stable public entry points.
- The audit identifies risky public exports without changing them prematurely.
- The audit gives Step 03 a narrow career advancement target.
- `docs/PROJECT_STATUS.md` points to Step 03 as the next active step.
