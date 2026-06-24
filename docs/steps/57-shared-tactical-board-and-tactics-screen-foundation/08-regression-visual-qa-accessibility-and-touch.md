# 08 - Regression Visual QA Accessibility And Touch

## Goal

Prove the shared tactical board works in a browser and remains accessible enough
for the current MVP.

## Expected Files

- `apps/web/src/visual-qa/shared-tactical-board.spec.ts`
- `docs/audits/SHARED_TACTICAL_BOARD_VISUAL_QA.md`
- `docs/PROJECT_STATUS.md`

## What To Implement

- Add Playwright QA for the shared tactical board inside match preparation.
- Capture desktop and narrow screenshots.
- Verify:
  - full pitch visible;
  - 11 players/slots across the field;
  - movement zone appears only during drag;
  - movement zone disappears on release;
  - CC drag is clamped outside attacking third;
  - goalkeeper does not move;
  - goalkeeper can still open assignment menu if empty or replaceable;
  - ED drag forward exposes AD in context menu;
  - choosing AD updates derived shape;
  - remove clears player but keeps slot role/position;
  - empty-slot candidate list excludes XI players;
  - token suitability border changes for weaker role;
  - long press opens menu on touch-sized viewport;
  - long press cancels when pointer moves past threshold;
  - no horizontal overflow;
  - controls are keyboard reachable.
- Record screenshot paths and findings in the audit.

## What NOT To Implement

- Do not tune visuals based only on screenshot preference unless the issue
  blocks readability, accessibility, or football clarity.
- Do not add a new feature while fixing QA failures.
- Do not skip Playwright.

## Required Checks

```sh
nvm use 24
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run test
pnpm --filter @game/web run build
node --experimental-strip-types apps/web/src/visual-qa/shared-tactical-board.spec.ts
test -f docs/audits/SHARED_TACTICAL_BOARD_VISUAL_QA.md
pnpm check
git diff --check
```

## Definition Of Done

- Browser QA passes.
- Screenshots exist outside the repository.
- Accessibility and touch findings are documented.
- Any residual issue is explicitly marked blocking or non-blocking.
