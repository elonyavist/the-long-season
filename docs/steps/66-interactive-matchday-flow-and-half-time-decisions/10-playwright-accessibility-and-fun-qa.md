# 10 - Playwright Accessibility And Fun QA

## Goal

Prove in the browser that the interactive matchday flow is visually credible,
accessible, and useful as a manager decision loop.

## Scope

Add or extend Playwright QA to cover desktop and narrow viewports:

- app entry to dashboard;
- match preparation;
- Continue to matchday;
- direct dashboard or Inbox/Posta route to match centre;
- first-half action;
- half-time stop;
- visible half-time score/events/ratings/condition;
- half-time substitution;
- second-half action;
- full-time result;
- full-time consequences;
- dashboard return;
- keyboard focus order for primary actions;
- no horizontal overflow;
- screenshots for:
  - pre-match;
  - first-half/phase state if visible;
  - half-time decision state;
  - full-time result;
  - dashboard after match.

The QA report must explicitly answer whether the screen still feels like a log
table. If it does, the phase cannot close as complete.

## Expected files

- `apps/web/src/visual-qa/interactive-matchday-flow.spec.ts`
- `docs/audits/INTERACTIVE_MATCHDAY_FLOW_VISUAL_QA.md`
- `docs/PROJECT_STATUS.md`

## What NOT to implement

- Do not broaden QA to unrelated sections.
- Do not bless screenshots with clipped text, overlapping content, invisible
  focus, unreachable controls, or a log-table match centre.
- Do not redesign unrelated global theme tokens.
- Do not hide known UX issues in the final report.

## Required checks

```bash
nvm use 24
node --experimental-strip-types apps/web/src/visual-qa/interactive-matchday-flow.spec.ts
test -f docs/audits/INTERACTIVE_MATCHDAY_FLOW_VISUAL_QA.md
git diff --check
```

Also run relevant web checks if QA exposes source changes:

```bash
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run test
pnpm --filter @game/web run build
```

## Done when

- QA evidence records desktop and narrow screenshots.
- QA confirms half-time is a meaningful decision point.
- QA confirms the match centre does not read as a raw log table.
- QA confirms primary matchday actions are keyboard reachable.
- Any known visual/product risk is documented as a future phase or fixed before
  closing.
- `docs/PROJECT_STATUS.md` records the adopted solution, verification, next
  action, and any blocker.
