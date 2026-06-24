# 07 - Responsive Accessibility And Visual QA

## Goal

Verify the shared bench board in the browser across desktop and narrow layouts.

## Expected Files

- `apps/web/src/visual-qa/shared-tactical-board.spec.ts`
- `docs/audits/SHARED_BENCH_BOARD_VISUAL_QA.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What To Implement

- Extend Playwright QA to verify:
  - bench mini-board is visible below/near the tactical board;
  - exactly 8 reserve slots are visible;
  - empty slots expose a `+`;
  - filled slots show number, surname, and role;
  - add menu excludes XI players and already-selected bench players;
  - candidates are ordered by ability/form with deterministic ties;
  - remove action clears one reserve slot;
  - missing goalkeeper blocker appears when no reserve goalkeeper is selected;
  - `Auto` fills XI and bench;
  - `Riempi` fills XI and bench gaps;
  - `Svuota` clears XI and bench;
  - desktop and narrow screenshots have no overlap or horizontal overflow;
  - keyboard focus reaches bench slots and menu actions.
- Capture screenshots under a Phase 59 directory.
- Document accessibility notes and residual risks.

## What NOT To Implement

- Do not change production code only to satisfy brittle selectors.
- Do not skip visual QA if the app runs.
- Do not loosen existing Phase 57/58 tactical board checks.

## Required Checks

```sh
nvm use 24
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run test
pnpm --filter @game/web run build
node --experimental-strip-types apps/web/src/visual-qa/shared-tactical-board.spec.ts
test -f docs/audits/SHARED_BENCH_BOARD_VISUAL_QA.md
pnpm check
git diff --check
```

## Definition Of Done

- Screenshots prove the bench board feels integrated, not tacked on.
- Keyboard and pointer behavior are covered.
- No tested viewport clips or overlaps the bench board.
