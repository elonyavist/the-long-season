# 01 - Current Button Click And Matchday Flow Audit

## Goal

Audit the current web button surface and click path before changing behavior.

## Scope

Create an audit covering:

- current cold flow from dashboard to full time;
- current warm flow from a prepared dashboard to full time;
- buttons visible on dashboard, preparation, pre-match, half-time, full-time,
  and dashboard-after-match;
- actions that are marked available but have no useful handler;
- duplicate actions that send the user to the same place;
- shell actions that create ambiguity during preparation or matchday;
- disabled navigation affordances that currently look too much like real
  actions;
- current Inbox/Posta visibility during matchday;
- target flow and target click count for this phase.

## Expected files

- `docs/audits/MATCHDAY_FLOW_SIMPLIFICATION_AUDIT.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- `docs/PROJECT_STATUS.md`

## What NOT to implement

- Do not change source code.
- Do not redesign screens.
- Do not add persistence.
- Do not add live replay.
- Do not implement half-time tactical changes yet.

## Required checks

```bash
nvm use 24
test -f docs/audits/MATCHDAY_FLOW_SIMPLIFICATION_AUDIT.md
git diff --check
```

## Done when

- The audit states the baseline click count and the desired click count.
- The audit lists every button/action to remove, keep, rename, or make
  contextual.
- The audit records the accepted target flow from dashboard to full time.
- `docs/PROJECT_STATUS.md` records the adopted conclusion and next action.
