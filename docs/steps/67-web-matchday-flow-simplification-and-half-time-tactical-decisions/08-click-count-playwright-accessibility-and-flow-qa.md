# 08 - Click Count Playwright Accessibility And Flow QA

## Goal

Prove the simplified flow in a real browser and reject the phase if it still
feels cluttered or bureaucratic.

## Scope

Add or update Playwright QA to cover:

- desktop cold path from dashboard to full time;
- narrow cold path from dashboard to full time;
- target click count for the accepted flow;
- no dashboard bounce after saving preparation;
- matchday shell without Inbox/Posta;
- no global shell Continue during matchday;
- no available dead dashboard actions;
- pre-match `Start match`;
- half-time tactical workspace and mandatory stop;
- full-time single `Continue`;
- clean dashboard after full time;
- no horizontal overflow;
- keyboard reachability of primary actions;
- screenshots for dashboard, preparation, pre-match, half-time, full-time, and
  dashboard-after-match.

Write visual findings to an audit file.

## Expected files

- `apps/web/src/visual-qa/matchday-flow-simplification.spec.ts`
- `docs/audits/MATCHDAY_FLOW_SIMPLIFICATION_VISUAL_QA.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- `docs/PROJECT_STATUS.md`

## What NOT to implement

- Do not tune UI by weakening acceptance criteria.
- Do not skip narrow viewport.
- Do not rely only on unit tests.
- Do not mark the phase ready if Playwright exposes duplicated CTA noise,
  clipped text, horizontal overflow, or dead actions.

## Required checks

```bash
nvm use 24
node --experimental-strip-types apps/web/src/visual-qa/matchday-flow-simplification.spec.ts
test -f docs/audits/MATCHDAY_FLOW_SIMPLIFICATION_VISUAL_QA.md
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run test
pnpm --filter @game/web run build
git diff --check
```

## Done when

- Playwright screenshots exist for desktop and narrow viewports.
- The audit records final click count and whether the flow feels simpler.
- Primary actions are keyboard reachable.
- Matchday no longer exposes unrelated Inbox/Posta or global Continue.
