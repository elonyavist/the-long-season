# 01 - Current Color Token And Hardcoded Audit

## Goal

Audit the current web color system before adding user-selectable palettes.

## Expected Files

- `docs/audits/WEB_THEME_COLOR_AUDIT.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What To Implement

- Identify current color ownership:
  - `apps/web/src/styles/tokens.css`;
  - `apps/web/src/styles/components.css`;
  - `apps/web/src/styles/layout.css`;
  - `apps/web/src/styles/base.css`;
  - tactical-board SVG/React markings;
  - inline colors in React/TS files, if any.
- Classify every visible color group as:
  - themeable UI chrome;
  - semantic color;
  - football-surface color;
  - legacy/dead color;
  - one-off color to remove.
- Record hardcoded colors that should move behind theme variables.
- Record hardcoded colors that must stay stable, especially:
  - pitch grass and `campo-calcio.svg`;
  - role suitability;
  - alerts/blockers;
  - fitness arrows;
  - status severity.

## What NOT To Implement

- Do not add palettes yet.
- Do not change CSS values yet.
- Do not change runtime behavior.

## Required Checks

```sh
nvm use 24
test -f docs/audits/WEB_THEME_COLOR_AUDIT.md
git diff --check
```

## Definition Of Done

- The audit clearly separates themeable colors from non-themeable football and
  semantic colors.
- The audit lists the files that need source changes in later steps.

