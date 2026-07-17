# Step 02 - Critical Journey And Action Economy Audit

## Status

Pending.

## Goal

Measure whether the current browser journeys preserve the rhythm of a football
career and ask for clicks only when the manager is making or confirming a real
decision.

## Scope

- Walk and measure these current journeys:
  - create a new career and reach the first useful Dashboard state;
  - continue an existing career;
  - use `Continue` until meaningful attention;
  - open, understand, and act from a blocking Posta message;
  - prepare the team and enter matchday;
  - confirm pre-match, review first half, make half-time decisions, finish the
    match, and return to Dashboard;
  - manually save and safely leave a dirty career;
  - recover from refresh at preparation, match checkpoint, and full time.
- Record click count, route count, confirmation count, attention interruption,
  keyboard path, loading feedback, and places where the manager must reread the
  same information.
- Classify every action as decision, confirmation, navigation, recovery, or
  avoidable bureaucracy.
- Identify duplicate primary actions, misleading disabled actions, hidden
  prerequisites, dead ends, and unexpected route changes.
- Propose journey budgets only after measuring the current paths; do not tune
  the audit to arbitrary click targets.
- Evaluate whether Dashboard and Posta remain the intended career rhythm rather
  than competing command centers.

## Expected files

- `docs/audits/WEB_CRITICAL_JOURNEY_AND_ACTION_ECONOMY_AUDIT.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- `docs/steps/73a-web-product-ui-ux-quality-audit-and-premium-design-baseline/03-information-architecture-and-content-hierarchy-audit.md` only if the journey evidence changes its assumptions.

## Required evidence

- Reproducible action sequence for every journey.
- Click/route/confirmation counts and keyboard equivalent.
- Screenshot or DOM evidence for ambiguous actions and feedback gaps.
- User-facing reason for every P0/P1 flow finding.
- A bounded target journey for each problematic path, described without
  implementing it.

## What NOT to implement

- No button removal, rerouting, automatic choice, or command change.
- No invented shortcut that bypasses a real football decision.
- No comparison based only on another game's surface styling.
- No click-count optimization that hides consequences or removes useful
  confirmation.

## Required checks

```bash
nvm use 24
test -f docs/audits/WEB_CRITICAL_JOURNEY_AND_ACTION_ECONOMY_AUDIT.md
git diff --check
```

## Manual inspection

- Does every stop correspond to a meaningful manager decision or explanation?
- Is the next action obvious without scanning several regions?
- Can primary journeys be completed by keyboard with equivalent clarity?

## Completion criteria

- Every current primary journey has measured action economy.
- Each action is classified by purpose.
- Avoidable bureaucracy and necessary confirmation are distinguished.
- P0/P1 journey findings include evidence and bounded target behavior.
- `docs/PROJECT_STATUS.md` marks Step 02 Done and Step 03 active.
