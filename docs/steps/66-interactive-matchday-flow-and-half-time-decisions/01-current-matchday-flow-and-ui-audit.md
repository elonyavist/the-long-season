# 01 - Current Matchday Flow And UI Audit

## Goal

Audit the current Phase 65 matchday flow before changing code, with a focus on
why it does not yet feel like a playable football-manager match.

## Scope

Create an audit covering:

- current web click path from dashboard/Continue/Inbox to matchday;
- current `CareerMatchdayScreen` visual hierarchy;
- current result/event/player-stat/consequence presentation;
- current `matchday-demo.ts` full-fixture progression behavior;
- current engine entry points:
  - `progressNextCareerFixture`;
  - `simulateMatch`;
  - `simulateMatchWithManualTactics`;
  - match report creation;
- whether an existing segmented simulation path can support first half/full
  time, or whether a new staged contract is needed;
- what must be retained from Phase 65;
- what must be replaced because it hurts user fun or match readability.

The audit must include screenshots or references to the current bad UI state
when useful, but it must not redesign the screen yet.

## Expected files

- `docs/audits/INTERACTIVE_MATCHDAY_FLOW_AUDIT.md`
- `docs/PROJECT_STATUS.md`

## What NOT to implement

- Do not change engine code.
- Do not change UI code.
- Do not add new matchday states.
- Do not tune match balance.
- Do not create persistence.

## Required checks

```bash
nvm use 24
test -f docs/audits/INTERACTIVE_MATCHDAY_FLOW_AUDIT.md
git diff --check
```

## Done when

- The audit clearly states which current behavior is useful and which behavior
  must be replaced.
- The audit identifies the correct engine seam for staged progression.
- The audit identifies the minimum click-flow changes needed for matchday to
  feel direct.
- `docs/PROJECT_STATUS.md` records the adopted conclusion, verification, next
  action, and any blocker.
