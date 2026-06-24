# 07 - Responsive Accessibility And Visual QA

## Goal

Verify the reworked tactical workspace in the browser, with screenshots and
interaction checks that match the user-reported problems.

## Expected Files

- `apps/web/src/visual-qa/shared-tactical-board.spec.ts`
- `docs/audits/MATCH_PREPARATION_TACTICAL_WORKSPACE_VISUAL_QA.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What To Implement

- Extend Playwright QA to verify:
  - compact header is visible in the first viewport;
  - compact alert strip replaces the large blocker card;
  - board toolbar is visible and keyboard reachable;
  - context menu closes on pitch click, outside click, `Esc`, and completed
    action;
  - candidate ordering puts better role fits first;
  - bench picker uses the same candidate-row visual language;
  - three `CC` and three `DC` layouts do not look cramped or overflow;
  - desktop and narrow layouts have no horizontal overflow.
- Capture screenshots under a Phase 58 directory.
- Document accessibility notes and residual risks.

## What NOT To Implement

- Do not tune visuals only to satisfy selectors.
- Do not loosen accessibility checks to make the test pass.
- Do not remove Phase 57 behavior coverage.

## Required Checks

```sh
nvm use 24
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run test
pnpm --filter @game/web run build
node --experimental-strip-types apps/web/src/visual-qa/shared-tactical-board.spec.ts
test -f docs/audits/MATCH_PREPARATION_TACTICAL_WORKSPACE_VISUAL_QA.md
pnpm check
git diff --check
```

## Definition Of Done

- The screenshots prove the screen is denser and more football-manager-like.
- The specific menu-dismissal bug is covered.
- Candidate ordering and bench visual parity are covered.
- Accessibility notes are documented honestly.
