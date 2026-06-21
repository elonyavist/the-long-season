# 07 - Flag Asset Readiness

## Goal

Prepare nationality flag assets for future UI and CLI inspection without coupling presentation assets to domain or engine logic.

The user has added SVG flags under `assets/flags/`. This step should make the project able to map each supported nationality to an existing flag asset code/path in a presentation-safe way.

## What to implement

- Add a content or presentation-facing mapping from `NationalityCode` to flag asset code.
- Verify that every supported nationality has a corresponding SVG asset under `assets/flags/`.
- Keep the mapping deterministic and testable.
- Add tests that fail when a supported nationality has no flag asset.
- Add TSDoc/JSDoc comments on the mapping helper.

## What NOT to implement

- Do not import SVG files into domain or engine.
- Do not store flag paths in `Player`, `PersonIdentity`, `GameState`, `CareerState`, or match reports.
- Do not render flags in UI.
- Do not add web frontend work.
- Do not translate flags through i18n.
- Do not change nationality distribution.
- Do not modify the SVG assets unless a file is missing or corrupt and the user explicitly asks.

## Expected files

- `packages/content/src/identity/flag-assets.ts` or an equivalent non-engine, non-domain mapping file
- `packages/content/src/identity/flag-assets.test.ts`
- `packages/content/src/index.ts` only if the mapping must be exported
- `apps/cli/src/commands/simulate-season.ts` only if an existing identity review should optionally show asset codes
- `apps/cli/src/commands/simulate-season.test.ts` only if CLI output changes
- `docs/PROJECT_STATUS.md`
- `docs/steps/20-new-career-world-generation/08-world-generation-quality-report.md` only if a lesson learned changes future work.

## Required checks

- `pnpm --filter @game/content run typecheck`
- focused flag-asset tests
- focused CLI tests only if CLI output changes
- `pnpm check`
- `find assets/flags -maxdepth 1 -name "*.svg" | sort`

## Definition of Done

- Every supported nationality maps to a flag asset.
- The mapping remains outside domain and engine.
- Future UI can reuse the mapping without inventing labels or hardcoded paths.
- `docs/PROJECT_STATUS.md` records the adopted flag asset ownership rule.
