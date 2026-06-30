# 06 - Playwright Accessibility And Visual QA

## Goal

Verify the full prepare-to-matchday-to-dashboard web loop in the browser and
catch layout/accessibility issues before closing the phase.

## Scope

Add or extend Playwright QA to cover:

- open app shell;
- reach match preparation;
- use existing helper actions to create complete preparation;
- reach matchday through dashboard/Inbox/Posta or Continue;
- play the fixture;
- inspect result, events, stats, and consequences;
- return to dashboard and confirm changed state;
- keyboard focus order for primary actions;
- no horizontal overflow on desktop and narrow widths;
- screenshots for the accepted visual identity.

If the existing visual QA runner has a different filename convention, follow
that convention and keep the test narrow.

## Expected files

- `apps/web/src/visual-qa/matchday-playable-slice.spec.ts`
- `docs/audits/WEB_MATCHDAY_PLAYABLE_SLICE_VISUAL_QA.md`
- `docs/PROJECT_STATUS.md`

## What NOT to implement

- Do not redesign UI during QA unless the test exposes a concrete bug in this
  phase's expected files.
- Do not broaden QA to unrelated sections.
- Do not bless screenshots that show clipped tables, overlapping text,
  unreadable contrast, broken focus, or stale dashboard state.

## Required checks

```bash
nvm use 24
node --experimental-strip-types apps/web/src/visual-qa/matchday-playable-slice.spec.ts
test -f docs/audits/WEB_MATCHDAY_PLAYABLE_SLICE_VISUAL_QA.md
git diff --check
```

Also run the relevant web typecheck/test commands if QA reveals source changes:

```bash
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run test
```

## Done when

- QA evidence records desktop and narrow screenshots.
- QA confirms no major accessibility or layout blocker remains.
- Any known visual/product risk is documented as a future phase, not hidden.
- `docs/PROJECT_STATUS.md` records the adopted solution, verification, next
  action, and any blocker.
