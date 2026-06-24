# 07 - Regression Visual QA And Accessibility

## Goal

Verify the canonical formation rework in a real browser.

## Expected Files

- `apps/web/src/visual-qa/tactics-workspace.spec.ts`
- `docs/audits/CANONICAL_FORMATION_ROLE_VISUAL_QA.md`
- `docs/PROJECT_STATUS.md`

## What To Implement

- Extend Playwright QA to inspect all critical formations.
- Verify the supplied SVG pitch background is visible as a complete field,
  without cropping the top/bottom penalty areas or touchlines.
- Verify the compact helper toolbar:
  - `Auto`;
  - `Fill gaps`;
  - `Clear`.
- Assert every pitch slot:
  - is visible;
  - does not overlap another slot;
  - stays inside the pitch board;
  - remains keyboard reachable through the select.
- Capture desktop and narrow screenshots.
- Record screenshot paths, visual findings, and keyboard/focus findings in the
  audit.
- Verify helper actions are keyboard reachable and do not create horizontal
  overflow on desktop or narrow viewport.

## What NOT To Implement

- Do not redesign the whole match-preparation screen.
- Do not change layout outside what is required by the canonical role rework.
- Do not skip Playwright if the app builds.

## Required Checks

```sh
nvm use 24
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run test
pnpm --filter @game/web run build
node --experimental-strip-types apps/web/src/visual-qa/tactics-workspace.spec.ts
test -f docs/audits/CANONICAL_FORMATION_ROLE_VISUAL_QA.md
pnpm check
git diff --check
```

## Definition Of Done

- Browser QA passes for desktop and narrow viewport.
- The complete SVG pitch is visible in screenshots.
- Helper buttons are visible, compact, keyboard reachable, and do not obscure
  the pitch or squad table.
- Screenshots exist outside the repository.
- The audit states whether any visual issue remains and whether it blocks the
  next phase.
