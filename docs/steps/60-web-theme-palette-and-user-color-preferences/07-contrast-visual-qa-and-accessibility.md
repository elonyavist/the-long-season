# 07 - Contrast Visual QA And Accessibility

## Goal

Verify every palette is readable and visually appropriate in the app.

## Expected Files

- `apps/web/src/visual-qa/theme-palette.spec.ts`
- `docs/audits/WEB_THEME_PALETTE_VISUAL_QA.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What To Implement

- Add browser QA that cycles through all palettes.
- Capture desktop and narrow screenshots for representative screens:
  - app entry/settings;
  - career dashboard;
  - match preparation.
- Verify:
  - no horizontal overflow;
  - selected navigation remains visible;
  - primary actions remain visible;
  - blocker/severity colors remain semantic;
  - tactical pitch grass remains unchanged;
  - text and controls remain readable.
- Document accessibility findings and residual risks.

## What NOT To Implement

- Do not rely only on unit tests for color work.
- Do not accept a palette that looks good only on one screen.
- Do not skip narrow viewport screenshots.

## Required Checks

```sh
nvm use 24
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run test
pnpm --filter @game/web run build
node --experimental-strip-types apps/web/src/visual-qa/theme-palette.spec.ts
test -f docs/audits/WEB_THEME_PALETTE_VISUAL_QA.md
pnpm check
git diff --check
```

## Definition Of Done

- Every palette has visual evidence.
- No palette breaks readable contrast in tested screens.
- The pitch and semantic colors remain stable.

