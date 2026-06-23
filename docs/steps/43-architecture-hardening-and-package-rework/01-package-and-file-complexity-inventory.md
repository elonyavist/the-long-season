# 01 - Package And File Complexity Inventory

## Goal

Create a measurable architecture inventory before touching code.

This step must identify where the project is simple, where it is merely large, and where it is genuinely hard to understand. The output is an audit, not a refactor.

## Expected files

- `docs/audits/ARCHITECTURE_PACKAGE_COMPLEXITY_INVENTORY.md`
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Inspect package manifests and dependency rules:
  - `package.json`
  - `apps/*/package.json`
  - `packages/*/package.json`
  - `dependency-cruiser.config.cjs`
  - `docs/PROJECT_RULES.md`
- Produce a package-level map:
  - package responsibility;
  - allowed dependencies;
  - current dependencies;
  - public entry points;
  - whether the package is deep or shallow.
- Produce a file-level inventory for high-risk areas:
  - `apps/cli/src/commands/`
  - `packages/engine/src/career/`
  - `packages/engine/src/match-engine/`
  - `packages/engine/src/use-cases/`
  - `packages/content/src/generators/`
  - `packages/simulation-tools/src/long-run/`
- For each relevant file, record:
  - approximate lines of code;
  - import count;
  - export count;
  - main responsibility;
  - suspected secondary responsibilities;
  - junior readability score from 1 to 5;
  - split priority: none, watch, candidate, high;
  - gameplay risk if changed.
- Use practical thresholds:
  - under 200 lines: usually OK;
  - 200-500 lines: watch;
  - 500-900 lines: candidate;
  - over 900 lines: high-priority review.
- Identify the top five files where a junior developer would struggle to trace flow.
- Identify the top five files that should not be split because they are large but coherent.
- Do not change code.

## What NOT to implement

- Do not refactor source files.
- Do not rename files.
- Do not change exports.
- Do not add abstractions.
- Do not update dependency rules.
- Do not start Step 02.

## Required checks

- `find apps packages -name package.json -maxdepth 4 -print | sort`
- `find apps packages -path "*/src/*" -type f | sort`
- `wc -l apps/cli/src/commands/*.ts apps/cli/src/commands/**/*.ts packages/engine/src/**/*.ts packages/content/src/**/*.ts packages/simulation-tools/src/**/*.ts`
- `rg -n "^import |^export " apps packages`
- `pnpm depcruise`
- `git diff --check`

## Definition of Done

- The audit gives a concrete package map.
- The audit gives a concrete file complexity inventory.
- The audit separates large-but-coherent files from files with mixed responsibilities.
- Step 02 has clear input for public interface review.
- `docs/PROJECT_STATUS.md` points to Step 02 as the next active step.
