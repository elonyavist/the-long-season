# 06 - Hardcoded Color Cleanup And Non-Theme Exceptions

## Goal

Remove unnecessary hardcoded UI colors while documenting intentional exceptions.

## Expected Files

- `apps/web/src/styles/tokens.css`
- `apps/web/src/styles/base.css`
- `apps/web/src/styles/layout.css`
- `apps/web/src/styles/components.css`
- `docs/audits/WEB_THEME_COLOR_EXCEPTIONS.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What To Implement

- Replace themeable hardcoded colors with documented variables.
- Keep hardcoded colors only where they are intentional and documented.
- Document exceptions:
  - tactical pitch grass;
  - `campo-calcio.svg`;
  - tactical markings if they remain football-surface specific;
  - role suitability;
  - fitness form arrows;
  - blocker/severity colors;
  - semantic success/error/warning states.
- Verify no duplicate obsolete theme variables remain.

## What NOT To Implement

- Do not remove semantic colors for the sake of reducing hardcoded values.
- Do not weaken contrast to make a palette look softer.
- Do not create dead compatibility aliases.

## Required Checks

```sh
nvm use 24
test -f docs/audits/WEB_THEME_COLOR_EXCEPTIONS.md
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run test
pnpm check
git diff --check
```

## Definition Of Done

- Themeable colors are routed through the palette system.
- Non-themeable exceptions are explicit and defensible.

